/**
 * Genera los íconos PNG, el favicon.ico, el manifest y la imagen Open Graph a partir de
 * los archivos de marca del WordPress original:
 *   src/assets/favicon-512.png  (icono del sitio en WordPress: cropped-cropped-welcome-backw.png)
 *   src/assets/logo-welcome.png (logo del header)
 * Uso: node scripts/generate-assets.mjs   (re-ejecutar si cambia el logo o la marca)
 * Requiere `sharp` (incluido como dependencia de Astro).
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const pub = new URL('../public/', import.meta.url);
const assets = new URL('../src/assets/', import.meta.url);
const favicon = await readFile(new URL('favicon-512.png', assets));
const logo = await readFile(new URL('logo-welcome.png', assets));

for (const [name, size] of [
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  await sharp(favicon).resize(size, size).png({ compressionLevel: 9 }).toFile(new URL(name, pub).pathname);
}

// favicon.ico: un PNG de 32×32 envuelto en un contenedor ICO (válido para todos los navegadores modernos).
const png32 = await sharp(favicon).resize(32, 32).png().toBuffer();
const ico = Buffer.alloc(6 + 16 + png32.length);
ico.writeUInt16LE(0, 0); // reservado
ico.writeUInt16LE(1, 2); // tipo: icono
ico.writeUInt16LE(1, 4); // cantidad de imágenes
ico.writeUInt8(32, 6); // ancho
ico.writeUInt8(32, 7); // alto
ico.writeUInt8(0, 8); // paleta
ico.writeUInt8(0, 9); // reservado
ico.writeUInt16LE(1, 10); // planos
ico.writeUInt16LE(32, 12); // bits por píxel
ico.writeUInt32LE(png32.length, 14); // tamaño
ico.writeUInt32LE(22, 18); // offset
png32.copy(ico, 22);
await writeFile(new URL('favicon.ico', pub), ico);

// Imagen Open Graph (1200×630): logo sobre fondo morado de la marca.
const logoMeta = await sharp(logo).metadata();
const logoW = 560;
const logoH = Math.round(((logoMeta.height ?? 1) * logoW) / (logoMeta.width ?? 1));
const logoPng = await sharp(logo).resize(logoW, logoH).png().toBuffer();
const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c1e7d"/><stop offset="1" stop-color="#4f1250"/></linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.2" r="0.6"><stop offset="0" stop-color="#ef7300" stop-opacity="0.5"/><stop offset="1" stop-color="#ef7300" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <text x="600" y="540" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" fill="#ffffff" letter-spacing="4">EDUCATION &amp; MIGRATION</text>
  <text x="600" y="585" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#f4d9c9">Australia · Nueva Zelanda · Dubái</text>
</svg>`;
await sharp(Buffer.from(bg))
  .composite([{ input: logoPng, left: Math.round((1200 - logoW) / 2), top: Math.round((470 - logoH) / 2) + 20 }])
  .png({ compressionLevel: 9 })
  .toFile(new URL('og-default.png', pub).pathname);

await writeFile(
  new URL('site.webmanifest', pub),
  JSON.stringify(
    {
      name: 'Welcome Students Group',
      short_name: 'Welcome',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#7c1e7d',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log('Íconos, favicon.ico, manifest e imagen Open Graph generados en public/.');
