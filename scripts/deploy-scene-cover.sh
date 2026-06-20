#!/usr/bin/env bash
# Center-crop source PNG to 1536x614 (2.5:1) and deploy to public/assets/scenes/
set -euo pipefail
SRC="$1"
SLUG="$2"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$SCRIPT_DIR/../public/assets/scenes"
mkdir -p "$OUT_DIR"
OUT="$OUT_DIR/${SLUG}.png"
TARGET_W=1536
TARGET_H=614

W=$(sips -g pixelWidth "$SRC" 2>/dev/null | awk '/pixelWidth/{print $2}')
H=$(sips -g pixelHeight "$SRC" 2>/dev/null | awk '/pixelHeight/{print $2}')
CROP_H=$(python3 -c "print(round($W / ($TARGET_W / $TARGET_H)))")
CROP_Y=$(python3 -c "print(max(0, round(($H - $CROP_H) / 2)))")
TMP="$(mktemp /tmp/scene-crop.XXXXXX.png)"
ffmpeg -y -i "$SRC" -vf "crop=${W}:${CROP_H}:0:${CROP_Y},scale=${TARGET_W}:${TARGET_H}" "$TMP" 2>/dev/null
mv "$TMP" "$OUT"
echo "Deployed $OUT (${TARGET_W}x${TARGET_H}) from ${W}x${H}"
