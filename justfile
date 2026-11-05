set shell := ["bash", "-euo", "pipefail", "-c"]

# yarn.lock is Yarn 4; the global `yarn` here is 1.x and would rewrite it.
yarn := "corepack yarn@4.18.1"
team_id := "CZK4R5DGMY"
proxy_url := "https://knowme-proxy.vercel.app"
# One build number per `just` run, so `just deploy` gives both stores the same one.
build_number := env("BUILD_NUMBER", `echo $(( $(date +%s) / 60 ))`)
signing_dir := env("KNOWME_SIGNING_DIR", home_directory() / ".knowme")

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
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 {{yarn}} install --immutable

# Ship to both stores
deploy: deploy-ios deploy-android

# Archive and upload to App Store Connect (TestFlight)
deploy-ios: install check
    #!/usr/bin/env bash
    set -euo pipefail
    export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH" LANG=en_US.UTF-8 CI=1
    export EXPO_PUBLIC_PROXY_URL={{proxy_url}} BUILD_NUMBER={{build_number}}
    command -v pod >/dev/null || gem install cocoapods --user-install --no-document

    npx expo prebuild --clean --platform ios

    out="dist/ios/{{build_number}}"
    rm -rf "$out" && mkdir -p "$out"
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

    echo "Archiving build {{build_number}} (log: $out/archive.log)…"
    xcodebuild -workspace ios/KnowMe.xcworkspace -scheme KnowMe -configuration Release \
      -destination 'generic/platform=iOS' -archivePath "$out/KnowMe.xcarchive" \
      -allowProvisioningUpdates archive > "$out/archive.log" 2>&1 \
      || { tail -40 "$out/archive.log"; exit 1; }

    echo "Uploading to App Store Connect (log: $out/upload.log)…"
    xcodebuild -exportArchive -archivePath "$out/KnowMe.xcarchive" \
      -exportOptionsPlist "$out/ExportOptions.plist" -exportPath "$out/export" \
      -allowProvisioningUpdates > "$out/upload.log" 2>&1 \
      || { tail -40 "$out/upload.log"; exit 1; }

    echo "iOS build {{build_number}} uploaded. It shows up in TestFlight after processing."

# Build a signed .aab for Google Play
deploy-android: install check android-keystore
    #!/usr/bin/env bash
    set -euo pipefail
    export CI=1 JAVA_HOME="$(/usr/libexec/java_home -v 17)"
    export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
    export EXPO_PUBLIC_PROXY_URL={{proxy_url}} BUILD_NUMBER={{build_number}}
    source "{{signing_dir}}/android-signing.env"

    npx expo prebuild --clean --platform android

    out="dist/android/{{build_number}}"
    rm -rf "$out" && mkdir -p "$out"
    echo "Building bundle {{build_number}} (log: $out/build.log)…"
    # Signing goes in through env, so the password never shows up in `ps`.
    (cd android && env \
      "ORG_GRADLE_PROJECT_android.injected.signing.store.file={{signing_dir}}/upload.jks" \
      "ORG_GRADLE_PROJECT_android.injected.signing.store.password=$KNOWME_UPLOAD_PASSWORD" \
      "ORG_GRADLE_PROJECT_android.injected.signing.key.alias=upload" \
      "ORG_GRADLE_PROJECT_android.injected.signing.key.password=$KNOWME_UPLOAD_PASSWORD" \
      ./gradlew bundleRelease) > "$out/build.log" 2>&1 \
      || { tail -40 "$out/build.log"; exit 1; }

    version="$(node -p "require('./app.json').expo.version")"
    aab="$out/knowme-$version-{{build_number}}.aab"
    cp android/app/build/outputs/bundle/release/app-release.aab "$aab"
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
