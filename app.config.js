// Extends app.json. `just deploy` passes BUILD_NUMBER so every store upload
// gets a higher build number without editing app.json.
module.exports = ({ config }) => {
  const build = process.env.BUILD_NUMBER;
  if (!build) return config;
  return {
    ...config,
    ios: { ...config.ios, buildNumber: build },
    android: { ...config.android, versionCode: Number(build) },
  };
};
