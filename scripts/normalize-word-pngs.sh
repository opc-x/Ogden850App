#!/usr/bin/env bash
# Square-pad word PNGs to 512×512 on pure white (#FFFFFF) — no stretch.
# Usage:
#   ./scripts/normalize-word-pngs.sh              # all PNGs in public/assets/word-img
#   ./scripts/normalize-word-pngs.sh bone button  # specific slugs
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/public/assets/word-img"
TARGET=512
PAD_COLOR=FFFFFF

normalize_one() {
  local f="$1"
  [[ -f "$f" ]] || return 0
  # Fit longest side to TARGET (preserve aspect ratio)
  sips -Z "$TARGET" "$f" >/dev/null
  # Pad to square with pure white — never stretch
  sips --padToHeightWidth "$TARGET" "$TARGET" --padColor "$PAD_COLOR" "$f" >/dev/null
}

if [[ $# -gt 0 ]]; then
  for slug in "$@"; do
    normalize_one "$DIR/${slug}.png"
    echo "OK $slug"
  done
else
  count=0
  for f in "$DIR"/*.png; do
    [[ -f "$f" ]] || continue
    normalize_one "$f"
    count=$((count + 1))
  done
  echo "normalized $count PNGs → ${TARGET}×${TARGET} on #${PAD_COLOR}"
fi
