#!/usr/bin/env bash
# Copy Cursor-generated PNGs to public/assets/word-img, letterbox to 512×512 (no stretch).
# Usage: ./scripts/install-word-pngs.sh angle ant arch ...
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS="$HOME/.cursor/projects/Users-cuijianchen-Projects-Ogden850App/assets"
DEST="$ROOT/public/assets/word-img"
NORMALIZE="$ROOT/scripts/normalize-word-pngs.sh"
mkdir -p "$DEST"
for slug in "$@"; do
  src="$ASSETS/${slug}.png"
  if [[ ! -f "$src" ]]; then
    echo "SKIP missing: $src" >&2
    continue
  fi
  cp "$src" "$DEST/${slug}.png"
  "$NORMALIZE" "$slug"
done
