#!/bin/bash
set -e

mkdir -p dist

# Copy the app and assets
cp index.html dist/index.html
cp bargainbuddy.png dist/bargainbuddy.png

# Write config.js with the real API key — this file is never committed to git
echo "var CONFIG = { GEMINI_API_KEY: '${GEMINI_API_KEY}' };" > dist/config.js

echo "Build complete. config.js written to dist/."
