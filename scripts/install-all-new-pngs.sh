#!/usr/bin/env bash
# Install new word PNGs from Cursor assets folder (valid Ogden slugs only).
set -euo pipefail
ASSETS="$HOME/.cursor/projects/Users-cuijianchen-Projects-Ogden850App/assets"
DEST="$(cd "$(dirname "$0")/.." && pwd)/public/assets/word-img"
mkdir -p "$DEST"
# Valid slugs: lowercase letters, digits, hyphens only (no UUIDs)
VALID_RE='^[a-z][a-z0-9-]*$'
count=0
for src in "$ASSETS"/*.png; do
  [[ -f "$src" ]] || continue
  slug=$(basename "$src" .png)
  [[ "$slug" =~ $VALID_RE ]] || continue
  [[ "$slug" == *-gen ]] && continue
  [[ "$slug" == *-scene* ]] && continue
  dest="$DEST/${slug}.png"
  if [[ -f "$dest" ]]; then continue; fi
  cp "$src" "$dest"
  sips -z 512 512 "$dest" >/dev/null 2>&1 || true
  echo "NEW $slug"
  ((count++)) || true
done
echo "Installed $count new PNGs. Total: $(ls "$DEST"/*.png | wc -l | tr -d ' ')"
