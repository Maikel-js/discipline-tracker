import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, 'public');

if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#000000" rx="64"/>
  <path d="M256 64 L432 256 L256 448 L80 256 Z" fill="#10B981"/>
  <circle cx="256" cy="256" r="64" fill="#000000"/>
</svg>`;

async function generateIcons() {
  await sharp(Buffer.from(svgContent))
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, 'icon-192.png'));
  
  await sharp(Buffer.from(svgContent))
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'icon-512.png'));
  
  console.log('Icons generated: icon-192.png, icon-512.png');
}

generateIcons().catch(console.error);