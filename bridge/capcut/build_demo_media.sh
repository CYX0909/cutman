#!/bin/zsh

set -euo pipefail

SCRIPT_DIR="${0:A:h}"
PROJECT_DIR="${SCRIPT_DIR:h:h}"
SOURCE_IMAGE="${PROJECT_DIR}/src/assets/city-preview.png"
OUTPUT_DIR="${SCRIPT_DIR}/demo-package"
MEDIA_DIR="${OUTPUT_DIR}/media"

if ! command -v ffmpeg >/dev/null 2>&1; then
  print -u2 "找不到 ffmpeg。請先執行：brew install ffmpeg"
  exit 1
fi

if [[ ! -f "${SOURCE_IMAGE}" ]]; then
  print -u2 "找不到來源圖片：${SOURCE_IMAGE}"
  exit 1
fi

mkdir -p "${MEDIA_DIR}"

render_clip() {
  local filename="$1"
  local filter="$2"

  ffmpeg -hide_banner -loglevel error -y \
    -loop 1 -i "${SOURCE_IMAGE}" \
    -t 4 -vf "${filter},format=yuv420p" \
    -r 30 -an -c:v libx264 -preset medium -crf 18 \
    -movflags +faststart "${MEDIA_DIR}/${filename}"
}

render_clip "01_establishing.mp4" \
  "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720"

render_clip "02_push_in.mp4" \
  "scale=1408:792,crop=1280:720:x='(in_w-out_w)/2':y='(in_h-out_h)/2'"

render_clip "03_left_detail.mp4" \
  "scale=1536:864,crop=1280:720:x='(in_w-out_w)*0.22':y='(in_h-out_h)*0.52'"

render_clip "04_right_detail.mp4" \
  "scale=1536:864,crop=1280:720:x='(in_w-out_w)*0.78':y='(in_h-out_h)*0.48'"

render_clip "05_closing_wide.mp4" \
  "scale=1344:756,crop=1280:720:x='(in_w-out_w)/2':y='(in_h-out_h)*0.62'"

ffmpeg -hide_banner -loglevel error -y \
  -f lavfi -i "sine=frequency=110:duration=20:sample_rate=48000" \
  -f lavfi -i "sine=frequency=164.81:duration=20:sample_rate=48000" \
  -filter_complex "[0:a]volume=0.035[a0];[1:a]volume=0.018[a1];[a0][a1]amix=inputs=2,afade=t=in:st=0:d=1.5,afade=t=out:st=17:d=3" \
  -c:a pcm_s16le "${MEDIA_DIR}/city-bed.wav"

print "CapCut Demo 素材已建立：${OUTPUT_DIR}"
