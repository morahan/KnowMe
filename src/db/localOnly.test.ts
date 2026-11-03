/// <reference types="node" />
/**
 * Local-only storage guard (PRODUCT.md principle 2, README "Data & privacy").
 *
 * All user data lives in the on-device SQLite database. This test fails if
 * any app source file adds another storage or network path, or a package
 * that provides one. The single allowed network call is Reflect sending
 * its anonymous summary when the user taps Reflect.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const ALLOWED_FETCH_FILE = join('src', 'features', 'reflect', 'hooks.ts');
const ALLOWED_DB_FILE = join('src', 'db', 'client.ts');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

const files = [...sourceFiles(join(root, 'src')), ...sourceFiles(join(root, 'app'))];
const read = (file: string) => readFileSync(file, 'utf8');
const rel = (file: string) => relative(root, file).split(sep).join('/');

describe('local-only storage', () => {
  it('opens exactly one database, the on-device knowme.db', () => {
    const openers = files.filter((f) => /openDatabase(Sync|Async)?\s*\(/.test(read(f))).map(rel);
    expect(openers).toEqual([ALLOWED_DB_FILE.split(sep).join('/')]);
    expect(read(join(root, ALLOWED_DB_FILE))).toContain("openDatabaseSync('knowme.db')");
  });

  it('has no network calls outside Reflect, and no other storage APIs', () => {
    const banned: [RegExp, string][] = [
      [/fetch\s*\(/, 'fetch'],
      [/axios|XMLHttpRequest|WebSocket\s*\(/, 'network client'],
      [/AsyncStorage|expo-secure-store|expo-file-system|MMKV/, 'non-SQLite storage'],
    ];
    const offenders: string[] = [];
    for (const file of files) {
      const text = read(file);
      for (const [pattern, label] of banned) {
        if (!pattern.test(text)) continue;
        if (label === 'fetch' && rel(file) === ALLOWED_FETCH_FILE.split(sep).join('/')) continue;
        offenders.push(`${rel(file)}: ${label}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('ships no cloud, sync, analytics, or alternate-storage packages', () => {
    const pkg = JSON.parse(read(join(root, 'package.json'))) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    const bannedName = /firebase|supabase|async-storage|secure-store|mmkv|realm|watermelon|analytics|segment|amplitude|mixpanel|sentry/i;
    expect(names.filter((n) => bannedName.test(n))).toEqual([]);
    expect(names).toContain('expo-sqlite');
  });

  it('keeps the sample Patterns data out of the database', () => {
    // Sample moments are generated in memory (is_demo rows are only the
    // explicit demo switch on Me). Nothing named sample is ever inserted.
    const hooks = read(join(root, 'src', 'features', 'patterns', 'hooks.ts'));
    expect(hooks).not.toMatch(/insertMoment|seedDemo/);
  });
});
