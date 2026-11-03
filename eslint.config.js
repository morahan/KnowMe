// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/*', 'proxy/*', 'node_modules/*'] },
  {
    // Data hooks load from the local SQLite repos in an effect and set state
    // after the await; that is the intended pattern here, not a sync cascade.
    rules: { 'react-hooks/set-state-in-effect': 'off' },
  },
]);
