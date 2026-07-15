#!/usr/bin/env bash
# Generates PWA icons from public/logo.png into public/icons/
# Requires: sharp (node) or ImageMagick.
# This script is NOT executed by Lexi; it is a helper for local generation.

set -euo pipefail

node - <<'NODE'
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const src = path.join(process.cwd(), 'public', 'logo.png');
const outDir = path.join(process.cwd(), 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

const sizes = [72,96,128,144,152,192,256,384,512];
(async () => {
  const base = sharp(src);
  for (const s of sizes) {
    await base
      .resize(s, s, { fit: 'contain' })
      .png()
      .toFile(path.join(outDir, `icon-${s}x${s}.png`));

    await base
      .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(outDir, `maskable-icon-${s}x${s}.png`));
  }

  // Apple touch icon (commonly 180x180)
  const apple = 180;
  await base
    .resize(apple, apple, { fit: 'contain' })
    .png()
    .toFile(path.join(outDir, `apple-touch-icon.png`));

  // Recommended favicon-sized
  await base.resize(16,16,{fit:'contain'}).png().toFile(path.join(outDir,'favicon-16x16.png'));
  await base.resize(32,32,{fit:'contain'}).png().toFile(path.join(outDir,'favicon-32x32.png'));

  console.log('Icon generation complete');
})();
NODE

