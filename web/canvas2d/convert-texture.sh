#!/bin/bash
# 1つの画像を256x256にリサイズ
# 使い方: ./convert-texture.sh source.png dest.png

SRC="$1"
DST="$2"
CROP=70

convert "$SRC" \
    -gravity center \
    -crop ${CROP}%x${CROP}% +repage \
    -resize 256x256^ \
    -gravity center \
    -extent 256x256 \
    "$DST"
