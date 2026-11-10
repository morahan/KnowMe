#!/usr/bin/env node
// Replace one screenshot slot on an App Store version with the numbered PNGs in a folder.
//   node scripts/asc-screenshots.mjs <version e.g. 0.0.2> <displayType e.g. APP_IPHONE_DUO> <folder>
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { asc } from './asc.mjs';

const [versionString, displayType, folder] = process.argv.slice(2);
const files = readdirSync(folder).filter((f) => /^\d\d-.*\.png$/.test(f)).sort();
if (!files.length) throw new Error(`No numbered PNGs in ${folder}`);

const app = (await asc('GET', '/v1/apps?filter[bundleId]=com.freiolabs.knowme')).data[0].id;
const version = (await asc('GET', `/v1/apps/${app}/appStoreVersions?filter[versionString]=${versionString}&filter[platform]=IOS`)).data[0];
const loc = (await asc('GET', `/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations`)).data.find((l) => l.attributes.locale === 'en-US');

const md5 = (f) => createHash('md5').update(readFileSync(join(folder, f))).digest('hex');
const wanted = new Map(files.map((f) => [f, md5(f)]));
const ids = new Map();

let set = (await asc('GET', `/v1/appStoreVersionLocalizations/${loc.id}/appScreenshotSets?filter[screenshotDisplayType]=${displayType}`)).data[0];
if (set) {
  // Keep shots already uploaded from the same bytes, so a rerun resumes instead of starting over.
  for (const s of (await asc('GET', `/v1/appScreenshotSets/${set.id}/appScreenshots`)).data) {
    const { fileName, sourceFileChecksum, assetDeliveryState } = s.attributes;
    if (wanted.get(fileName) === sourceFileChecksum && assetDeliveryState?.state !== 'FAILED' && !ids.has(fileName)) ids.set(fileName, s.id);
    else await asc('DELETE', `/v1/appScreenshots/${s.id}`);
  }
} else {
  set = (await asc('POST', '/v1/appScreenshotSets', { data: { type: 'appScreenshotSets', attributes: { screenshotDisplayType: displayType },
    relationships: { appStoreVersionLocalization: { data: { type: 'appStoreVersionLocalizations', id: loc.id } } } } })).data;
}

for (const f of files.filter((f) => !ids.has(f))) {
  const bytes = readFileSync(join(folder, f));
  const shot = (await asc('POST', '/v1/appScreenshots', { data: { type: 'appScreenshots', attributes: { fileName: basename(f), fileSize: statSync(join(folder, f)).size },
    relationships: { appScreenshotSet: { data: { type: 'appScreenshotSets', id: set.id } } } } })).data;
  for (const op of shot.attributes.uploadOperations) {
    const res = await fetch(op.url, { method: op.method, headers: Object.fromEntries(op.requestHeaders.map((h) => [h.name, h.value])),
      body: bytes.subarray(op.offset, op.offset + op.length) });
    if (!res.ok) throw new Error(`Upload ${f} → ${res.status}`);
  }
  await asc('PATCH', `/v1/appScreenshots/${shot.id}`, { data: { type: 'appScreenshots', id: shot.id,
    attributes: { uploaded: true, sourceFileChecksum: wanted.get(f) } } });
  ids.set(f, shot.id);
  console.log('uploaded', f);
}
await asc('PATCH', `/v1/appScreenshotSets/${set.id}/relationships/appScreenshots`, {
  data: files.map((f) => ({ type: 'appScreenshots', id: ids.get(f) })) });

for (let i = 0; i < 120; i++) {
  const shots = (await asc('GET', `/v1/appScreenshotSets/${set.id}/appScreenshots`)).data;
  const states = shots.map((s) => s.attributes.assetDeliveryState?.state);
  if (states.every((s) => s === 'COMPLETE')) { console.log(`${displayType}: ${shots.length} screenshots COMPLETE`); process.exit(0); }
  if (states.includes('FAILED')) throw new Error(JSON.stringify(shots.map((s) => s.attributes.assetDeliveryState)));
  await new Promise((r) => setTimeout(r, 5000));
}
throw new Error('Screenshots still processing after 10 minutes');
