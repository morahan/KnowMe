#!/usr/bin/env bash
# Release numbers live in app.json: expo.version, ios.buildNumber, android.versionCode.
# app.json always holds the build that ships NEXT.
#
#   release-version.sh confirm <label>   ask "Is this Version X, build N on <label>?" and fix it if not
#   release-version.sh bump              after a build is spent: next build = N + 1, committed
#
# Without a terminal (or with KNOWME_DEPLOY_CONFIRM=0) confirm prints the numbers and goes on.
# KNOWME_DEPLOY_CONFIRM=force asks even on piped stdin (for testing the prompt).
set -euo pipefail
cd "$(dirname "$0")/.."

read_numbers() {
  read -r VERSION BUILD < <(node -p '
    const { expo } = require("./app.json");
    if (String(expo.ios.buildNumber) !== String(expo.android.versionCode)) {
      console.error("app.json: ios.buildNumber and android.versionCode differ; they should match.");
    }
    `${expo.version} ${expo.android.versionCode}`')
}

write_numbers() {
  node -e '
    const fs = require("fs");
    const [version, build] = process.argv.slice(1);
    const app = JSON.parse(fs.readFileSync("app.json", "utf8"));
    app.expo.version = version;
    app.expo.ios.buildNumber = build;
    app.expo.android.versionCode = Number(build);
    fs.writeFileSync("app.json", JSON.stringify(app, null, 2) + "\n");
  ' "$1" "$2"
}

ask() {
  local value
  printf '%s' "$1" >&2
  IFS= read -r value || { echo >&2; return 1; }
  printf '%s' "$value"
}

cancel() {
  echo "Release canceled; nothing was built or uploaded." >&2
  exit 1
}

confirm() {
  local label="$1"
  while true; do
    read_numbers
    echo ""
    echo "Release numbers that will ship:"
    echo "  Version ${VERSION} (build ${BUILD}) on ${label}"

    if [ "${KNOWME_DEPLOY_CONFIRM:-1}" = "0" ] || { [ ! -t 0 ] && [ "${KNOWME_DEPLOY_CONFIRM:-1}" != "force" ]; }; then
      echo "  (no prompt: not an interactive terminal)"
      return 0
    fi

    local answer choice
    answer="$(ask "Is this Version ${VERSION}, build ${BUILD} on ${label}? [y/N] ")" || cancel
    case "$answer" in
      y|Y|yes|YES) echo "Confirmed."; return 0 ;;
    esac

    echo "What needs correction?"
    echo "  [b] Build number"
    echo "  [v] Version number"
    echo "  [a] Both version and build"
    echo "  [q] Cancel"
    local version="$VERSION" build="$BUILD"
    choice="$(ask "Choose [b/v/a/q]: ")" || cancel
    case "$choice" in
      b|B) build="$(ask "Enter the correct build number: ")" || cancel ;;
      v|V) version="$(ask "Enter the correct version number (for example, 0.0.2): ")" || cancel ;;
      a|A) version="$(ask "Enter the correct version number (for example, 0.0.2): ")" || cancel
           build="$(ask "Enter the correct build number: ")" || cancel ;;
      q|Q) cancel ;;
      *) echo "Please choose b, v, a, or q."; continue ;;
    esac

    if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      echo "Version must look like 0.0.1."; continue
    fi
    if [[ ! "$build" =~ ^[1-9][0-9]*$ ]]; then
      echo "Build number must be a positive whole number."; continue
    fi
    write_numbers "$version" "$build"
    echo "Updated app.json. Please confirm the new numbers."
  done
}

bump() {
  read_numbers
  local next=$((BUILD + 1))
  write_numbers "$VERSION" "$next"
  git commit -q -m "Shipped v${VERSION} (build ${BUILD}); next build is ${next}" -- app.json
  echo "Build ${BUILD} is spent. app.json now holds build ${next} for the next deploy (committed, not pushed)."
}

case "${1:-}" in
  confirm) confirm "${2:-Android and iOS}" ;;
  bump) bump ;;
  *) echo "Usage: $0 confirm <label> | bump" >&2; exit 1 ;;
esac
