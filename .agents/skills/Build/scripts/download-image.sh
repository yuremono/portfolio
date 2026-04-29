#!/bin/bash
# Download placeholder image from picsum.photos
# Usage: ./download-image.sh [width] [height]

WIDTH=${1:-600}
HEIGHT=${2:-400}
OUTPUT_DIR="public/images/picsum"

# Create directory if not exists
mkdir -p "$OUTPUT_DIR"

# Find next sequential number
NEXT_NUM=$(ls "$OUTPUT_DIR" 2>/dev/null | grep -E '^[0-9]+\.jpg$' | sed 's/\.jpg$//' | sort -n | tail -1)
NEXT_NUM=$((10#$NEXT_NUM + 1))
OUTPUT_FILE=$(printf "%s/%03d.jpg" "$OUTPUT_DIR" "$NEXT_NUM")

# Download image
curl -sL "https://picsum.photos/${WIDTH}/${HEIGHT}" -o "$OUTPUT_FILE"

echo "Downloaded: $OUTPUT_FILE"
