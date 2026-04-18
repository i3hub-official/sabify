// Run: node scripts/generate-icons.js
// You need sharp: pnpm add -D sharp

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#7C3AED"/>
  <text x="50" y="68" font-size="50" text-anchor="middle" fill="white" font-family="Arial">⚔️</text>
</svg>`;

const svgBuffer = Buffer.from(svg);

if (!fs.existsSync('static/icons')) {
  fs.mkdirSync('static/icons', { recursive: true });
}

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`static/icons/icon-${size}.png`);
  console.log(`Generated icon-${size}.png`);
}