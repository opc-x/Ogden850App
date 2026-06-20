#!/usr/bin/env bash
# 从 Cursor 生图原稿部署场景封面
# Usage: bash scripts/redeploy-scene-covers.sh [full|center-crop]
set -eo pipefail
ASSETS="/Users/cuijianchen/.cursor/projects/Users-cuijianchen-Projects-Ogden850App/assets"
OUT="/Users/cuijianchen/Projects/Ogden850App/public/assets/scenes"
MODE="${1:-center-crop}"

crop_center_banner() {
  local file="$1"
  local w h th y
  w=$(sips -g pixelWidth "$file" | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$file" | awk '/pixelHeight/{print $2}')
  th=$(( w * 10 / 25 ))
  if [ "$th" -ge "$h" ]; then return 0; fi
  y=$(( (h - th) / 2 ))
  ffmpeg -y -i "$file" -vf "crop=${w}:${th}:0:${y}" "/tmp/scene-crop-$$.png" 2>/dev/null
  mv "/tmp/scene-crop-$$.png" "$file"
}

deploy() {
  local slug="$1" src_file="$2"
  local src="$ASSETS/$src_file" dest="$OUT/$slug.png"
  if [ ! -f "$src" ]; then echo "MISSING $src"; return 1; fi
  cp "$src" "$dest"
  if [ "$MODE" = "center-crop" ]; then
    crop_center_banner "$dest"
  fi
  echo "✓ ${slug}.png"
}

while IFS=: read -r slug file; do
  [ -n "$slug" ] || continue
  deploy "$slug" "$file"
done <<'EOF'
shopping:shopping-scene.png
restaurant:restaurant-scene-v2.png
making-a-phone-call:making-a-phone-call-scene.png
health:health-scene.png
transport:transport-scene.png
travel:travel-scene.png
work:work-scene.png
at-school:at-school-scene.png
asking-directions:asking-directions-scene.png
going-to-the-store:going-to-the-store-scene.png
the-family:the-family-scene.png
social:social-scene.png
the-weather:the-weather-scene.png
time:time-scene.png
online-shopping:online-shopping-scene.png
banking:banking-scene.png
renting-a-room:renting-a-room-scene.png
emergency:emergency-scene.png
the-house:the-house-scene.png
mailing:mailing-scene.png
haircut:haircut-scene.png
gas-station:gas-station-scene.png
moving-house:moving-house-scene.png
smartphone:smartphone-scene.png
wifi:wifi-scene.png
video-call:video-call-scene.png
email:email-scene.png
online-banking:online-banking-scene.png
internet:internet-scene.png
social-media:social-media-scene.png
my-room:my-room-scene.png
sports:sports-scene.png
the-body:the-body-scene.png
tech-support:tech-support-scene.png
password:password-scene.png
app:app-scene.png
download:download-scene.png
search:search-scene.png
streaming:streaming-scene.png
gaming:gaming-scene.png
feelings:feelings-scene.png
happy:happy-scene.png
sad:sad-scene.png
angry:angry-scene.png
nervous:nervous-scene.png
surprised:surprised-scene.png
disappointed:disappointed-scene.png
animals:animals-scene.png
nature:nature-scene.png
dancing:dancing-scene.png
EOF

echo "Done ($MODE) → $OUT"
