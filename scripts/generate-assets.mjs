/**
 * Genera los íconos PNG y la imagen Open Graph a partir de SVG.
 * Uso: node scripts/generate-assets.mjs   (re-ejecutar si cambia el logo o la marca)
 * Requiere `sharp` (incluido como dependencia de Astro).
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const pub = new URL('../public/', import.meta.url);
const favicon = await readFile(new URL('favicon.svg', pub));

for (const [name, size] of [
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  await sharp(favicon, { density: 600 }).resize(size, size).png().toFile(new URL(name, pub).pathname);
}

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#722679"/><stop offset="1" stop-color="#591d5e"/></linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.2" r="0.6"><stop offset="0" stop-color="#eb7a25" stop-opacity="0.45"/><stop offset="1" stop-color="#eb7a25" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="80" y="420" width="60" height="6" rx="3" fill="#eb7a25"/>
  <text x="80" y="200" font-family="Georgia, 'Times New Roman', serif" font-size="88" font-weight="700" fill="#ffffff">Welcome Students Group</text>
  <text x="80" y="290" font-family="Helvetica, Arial, sans-serif" font-size="40" fill="#f4d9c9">Live, study &amp; work in Australia</text>
  <text x="80" y="480" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" fill="#ffffff" letter-spacing="3">EDUCATION &amp; MIGRATION · SINCE 2015</text>
  <text x="80" y="530" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="#e6d4ea">Australia · New Zealand · Dubai</text>
</svg>`;
await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(new URL('og-default.png', pub).pathname);

await writeFile(
  new URL('site.webmanifest', pub),
  JSON.stringify(
    {
      name: 'Welcome Students Group',
      short_name: 'Welcome',
      start_url: '/',
      display: 'standalone',
      background_color: '#faf7f2',
      theme_color: '#722679',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log('Assets generated in public/');
