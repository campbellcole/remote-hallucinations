#!/bin/bash

mkdir -p "$2"
echo "Removing files in $2/*"
rm -R "$2/"*

OUTFILES="$2/%08d.png"

FFMPEG=$(which ffmpeg)
"$FFMPEG" -i "$1" -f image2 "${OUTFILES}"

if [ "1" == "$3" ]; then
  PNGCRUSH=$(which pngcrush)
  if [ "${PNGCRUSH}" != "" ]; then
    for f in $(find "$2" -type f); do
      echo "PNGCRUSHING: $f"
      ${PNGCRUSH} -ow -m 115 "$f" >/dev/null 2>&1
    done
else
  echo "skipping PNG crushing"
fi
