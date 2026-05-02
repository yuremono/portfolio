#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: ./scroll-capture URL" >&2
  echo "   or: ./scroll-capture --config path/to/config.json URL" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
node "$SCRIPT_DIR/scroll-capture.mjs" "$@"
