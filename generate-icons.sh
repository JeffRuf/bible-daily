#!/bin/bash
# Generate PWA icons from favicon.svg
# Requires ImageMagick: brew install imagemagick

# If you don't have ImageMagick, use an online tool like:
# https://www.pwabuilder.com/imageGenerator

# Generate icons
convert -background none -resize 192x192 public/favicon.svg public/icons/icon-192.png
convert -background none -resize 512x512 public/favicon.svg public/icons/icon-512.png

echo "Icons generated!"
echo "- public/icons/icon-192.png"
echo "- public/icons/icon-512.png"
