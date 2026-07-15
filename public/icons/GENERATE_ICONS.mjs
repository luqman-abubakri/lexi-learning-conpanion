import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const src = path.join(process.cwd(), 'public', 'logo.png');
const outDir = path.join(process.cwd(), 'public', 'icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

const base = sharp(src);

const out = async (name, buffer) => {
  fs.writeFileSync(path.join(outDir, name), buffer);
};

const run = async () => {
  for (const s of sizes) {
    const iconBuf = await base
      .resize(s, s, { fit: 'contain' })
      .png()
      .toBuffer();

    await out(`icon-${s}x${s}.png`, iconBuf);

    if (s === 180) {
      const appleBuf = await base
        .resize(180, 180, { fit: 'contain' })
        .png()
        .toBuffer();
      await out('apple-touch-icon.png', appleBuf);
    }

    if (s === 512) {
      const maskBuf = await sharp(src)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
      await out('maskable-icon-512x512.png', maskBuf);
    }
  }

  // favicons
  await out(
    'favicon-16x16.png',
    await base.resize(16, 16, { fit: 'contain' }).png().toBuffer()
  );

  await out(
    'favicon-32x32.png',
    await base.resize(32, 32, { fit: 'contain' }).png().toBuffer()
  );

  console.log('PWA icons generated in public/icons');
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

