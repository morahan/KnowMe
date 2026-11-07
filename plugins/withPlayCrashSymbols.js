// Release bundles carry what Play needs to read crash and ANR reports:
// R8's deobfuscation map (minify on) and native symbol tables.
// A plugin, not an edit, because `expo prebuild --clean` regenerates android/.
const { withAppBuildGradle, withGradleProperties } = require('expo/config-plugins');

const PROPERTIES = {
  'android.enableMinifyInReleaseBuilds': 'true',
  'android.enableShrinkResourcesInReleaseBuilds': 'true',
};

// SYMBOL_TABLE, not FULL: function names are enough for Play's stack traces,
// and FULL would add libreactnative.so's DWARF (~140 MB per ABI) to the bundle.
const NDK_BLOCK = "ndk { debugSymbolLevel 'SYMBOL_TABLE' }";

module.exports = function withPlayCrashSymbols(config) {
  config = withGradleProperties(config, (cfg) => {
    for (const [key, value] of Object.entries(PROPERTIES)) {
      cfg.modResults = cfg.modResults.filter((item) => item.key !== key);
      cfg.modResults.push({ type: 'property', key, value });
    }
    return cfg;
  });

  return withAppBuildGradle(config, (cfg) => {
    const gradle = cfg.modResults.contents;
    if (gradle.includes('debugSymbolLevel')) return cfg;
    const release = /(buildTypes\s*\{[\s\S]*?\n(\s*)release\s*\{)/;
    if (!release.test(gradle)) {
      throw new Error('withPlayCrashSymbols: no buildTypes.release block in app/build.gradle');
    }
    cfg.modResults.contents = gradle.replace(release, `$1\n$2    ${NDK_BLOCK}`);
    return cfg;
  });
};
