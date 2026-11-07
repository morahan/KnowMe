set shell := ["bash", "-euo", "pipefail", "-c"]

# yarn.lock is Yarn 4; the global `yarn` here is 1.x and would rewrite it.
yarn := "corepack yarn@4.18.1"
team_id := "CZK4R5DGMY"
proxy_url := "https://knowme-proxy.vercel.app"
signing_dir := env("KNOWME_SIGNING_DIR", home_directory() / ".knowme")

# CocoaPods is a user-level gem on this machine.
export PATH := home_directory() / ".gem/ruby/2.6.0/bin:" + env("PATH")
export LANG := "en_US.UTF-8"
export COREPACK_ENABLE_DOWNLOAD_PROMPT := "0"

# Show the 100 most recent Claude prompts
claude-history:
    @tail -n 100 ~/.claude_global_prompts.log

# Typecheck, lint, and test — run before every commit
check:
    yarn typecheck && yarn lint && yarn test

# Run the app
start:
    yarn start

ios:
    yarn ios

android:
    yarn android

# Install exactly what yarn.lock pins
install:
    {{yarn}} install --immutable

# Clean build: wipe caches and native projects, reinstall, regenerate ios/ and android/
cb: deep-clean install prebuild

# Remove node_modules, generated native projects, and Metro caches
deep-clean:
    command -v watchman >/dev/null && watchman watch-del-all >/dev/null || true
    rm -rf node_modules ios android .expo
    rm -rf "${TMPDIR:-/tmp}"/metro-* "${TMPDIR:-/tmp}"/haste-map-* ~/Library/Caches/metro

# Regenerate ios/ and android/ from app.json (also runs pod install)
prebuild:
    command -v pod >/dev/null || gem install cocoapods --user-install --no-document
    CI=1 npx expo prebuild --clean

# Confirm version and build, clean build, then ship to both stores
deploy: (release-confirm "both Android and iOS") cb check android-keystore _ship-ios release-bump _ship-android

# Confirm version and build, clean build, then upload to App Store Connect (TestFlight)
deploy-ios: (release-confirm "iOS") cb check _ship-ios release-bump

# Confirm version and build, clean build, then make a signed .aab for Google Play
deploy-android: (release-confirm "Android") cb check android-keystore _ship-android release-bump

alias cb-deploy := deploy
alias cb-deploy-ios := deploy-ios
alias cb-deploy-testflight := deploy-ios
alias cb-deploy-android := deploy-android

# Ask "Is this Version X, build N?" and fix the numbers in app.json if not
release-confirm label="both Android and iOS":
    @scripts/release-version.sh confirm "{{label}}"

# Mark the current build number spent: app.json moves to the next one
release-bump:
    @scripts/release-version.sh bump

[private]
_ship-ios:
    #!/usr/bin/env bash
    set -euo pipefail
    export EXPO_PUBLIC_PROXY_URL={{proxy_url}}
    build="$(node -p "require('./app.json').expo.ios.buildNumber")"
    out="dist/ios/$build"
    mkdir -p "$out"
    cat > "$out/ExportOptions.plist" <<EOF
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0"><dict>
      <key>method</key><string>app-store-connect</string>
      <key>destination</key><string>upload</string>
      <key>teamID</key><string>{{team_id}}</string>
      <key>signingStyle</key><string>automatic</string>
      <key>uploadSymbols</key><true/>
      <key>manageAppVersionAndBuildNumber</key><false/>
    </dict></plist>
    EOF

    echo "Archiving iOS build $build (log: $out/archive.log)…"
    xcodebuild -workspace ios/KnowMe.xcworkspace -scheme KnowMe -configuration Release \
      -destination 'generic/platform=iOS' -archivePath "$out/KnowMe.xcarchive" \
      -allowProvisioningUpdates archive > "$out/archive.log" 2>&1 \
      || { tail -40 "$out/archive.log"; exit 1; }

    # An App Store Connect API key is the reliable way to upload from the command line.
    # Without one, xcodebuild uses the Apple ID signed in to Xcode.
    auth=()
    if [ -f "{{signing_dir}}/app-store-connect.env" ]; then
      source "{{signing_dir}}/app-store-connect.env"
      : "${ASC_ISSUER_ID:?Add your Issuer ID to {{signing_dir}}/app-store-connect.env (App Store Connect → Users and Access → Integrations → Team Keys)}"
      auth=(-authenticationKeyPath "$ASC_KEY_PATH" -authenticationKeyID "$ASC_KEY_ID" -authenticationKeyIssuerID "$ASC_ISSUER_ID")
    fi

    echo "Uploading to App Store Connect (log: $out/upload.log)…"
    if ! xcodebuild -exportArchive -archivePath "$out/KnowMe.xcarchive" \
      -exportOptionsPlist "$out/ExportOptions.plist" -exportPath "$out/export" \
      -allowProvisioningUpdates ${auth[@]+"${auth[@]}"} > "$out/upload.log" 2>&1; then
      tail -20 "$out/upload.log"
      echo ""
      echo "Upload failed; build $build is not marked spent. Opening the archive in Xcode Organizer:"
      echo "click Distribute App to upload it by hand, then run: just release-bump"
      open "$out/KnowMe.xcarchive"
      exit 1
    fi

    echo "iOS build $build uploaded. It shows up in TestFlight after processing."

[private]
_ship-android:
    #!/usr/bin/env bash
    set -euo pipefail
    export EXPO_PUBLIC_PROXY_URL={{proxy_url}} JAVA_HOME="$(/usr/libexec/java_home -v 17)"
    export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
    source "{{signing_dir}}/android-signing.env"
    read -r version build < <(node -p "const {expo} = require('./app.json'); expo.version + ' ' + expo.android.versionCode")
    out="dist/android/$build"
    mkdir -p "$out"

    echo "Building Android bundle $build (log: $out/build.log)…"
    # Signing goes in through env, so the password never shows up in `ps`.
    (cd android && env \
      "ORG_GRADLE_PROJECT_android.injected.signing.store.file={{signing_dir}}/upload.jks" \
      "ORG_GRADLE_PROJECT_android.injected.signing.store.password=$KNOWME_UPLOAD_PASSWORD" \
      "ORG_GRADLE_PROJECT_android.injected.signing.key.alias=upload" \
      "ORG_GRADLE_PROJECT_android.injected.signing.key.password=$KNOWME_UPLOAD_PASSWORD" \
      ./gradlew bundleRelease) > "$out/build.log" 2>&1 \
      || { tail -40 "$out/build.log"; exit 1; }

    aab="$out/knowme-$version-$build.aab"
    cp android/app/build/outputs/bundle/release/app-release.aab "$aab"
    # Play reads crash reports with these (plugins/withPlayCrashSymbols.js). Upload this
    # whole file: a copy with BUNDLE-METADATA stripped brings both Play warnings back.
    for meta in com.android.tools.build.obfuscation/proguard.map com.android.tools.build.debugsymbols/; do
      unzip -l "$aab" | grep -q "BUNDLE-METADATA/$meta" || { echo "$aab lacks BUNDLE-METADATA/$meta"; exit 1; }
    done
    echo "Signed bundle: $aab"
    echo "Upload it in Play Console → KnowMe → Test and release."
    open -R "$aab"
    open "https://play.google.com/console"

# Create the Play upload key once (kept outside the repo)
android-keystore:
    #!/usr/bin/env bash
    set -euo pipefail
    dir="{{signing_dir}}"
    [ -f "$dir/upload.jks" ] && exit 0
    mkdir -p "$dir" && chmod 700 "$dir"
    pass="$(openssl rand -hex 24)"
    "$(/usr/libexec/java_home -v 17)/bin/keytool" -genkeypair -storetype PKCS12 \
      -keystore "$dir/upload.jks" -alias upload -keyalg RSA -keysize 2048 -validity 10000 \
      -storepass "$pass" -keypass "$pass" -dname "CN=Freio Labs, O=Freio Labs LLC" >/dev/null
    printf 'KNOWME_UPLOAD_PASSWORD=%s\n' "$pass" > "$dir/android-signing.env"
    chmod 600 "$dir/upload.jks" "$dir/android-signing.env"
    echo "Created the Play upload key in $dir. Back up that folder somewhere safe (a password manager works)."
