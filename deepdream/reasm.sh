#!/bin/bash

INFILES="$1/%08d.png"

CODEC="libx264"
OUTFILE="proc_done.mp4"
TMPAUDIO="/tmp/tmp.aac"
TMPVIDEO="/tmp/tmp.mp4"

if [ -f ${OUTFILE} ]; then
  rm "${OUTFILE}"
fi

FFMPEG=$(which ffmpeg)
FFPROBE=$(which ffprobe)
FPS=$(${FFPROBE} -show_streams -select_streams v -i "$2" 2>/dev/null | grep "r_frame_rate" | cut -d'=' -f2)

"${FFMPEG}" -framerate ${FPS} -i "${INFILES}" -c:v ${CODEC} -vf "fps=${FPS},format=yuv420p" -tune fastdecode -tune zerolatency -profile:v baseline "${TMPVIDEO}" -y

"${FFMPEG}" -i "$2" -strict -2 "${TMPAUDIO}" -y

if [ -f "${TMPAUDIO}" ]; then
  "${FFMPEG}" -i "${TMPAUDIO}" /tmp/music.wav -y
  "${FFMPEG}" -i "${TMPAUDIO}" -i "${TMPVIDEO}" -strict -2 -c:v copy -movflags faststart -shortest "${OUTFILE}"
else
  mv "${TMPVIDEO}" "${OUTFILE}"
fi

rm "${TMPAUDIO}"
rm "${TMPVIDEO}"

if [ -s ${OUTFILE} ]; then
  echo "saved as: ${OUTFILE}"
fi
