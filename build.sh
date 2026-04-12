#!/bin/bash
set -e
mkdir -p dist
sed "s|YOUR_API_KEY_HERE|${GEMINI_API_KEY}|g" index.html > dist/index.html
echo "Build complete. Key injected: $(grep -c 'YOUR_API_KEY_HERE' dist/index.html && echo 'NO - placeholder still present!' || echo 'YES')"
