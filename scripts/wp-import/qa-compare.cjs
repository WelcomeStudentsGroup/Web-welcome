#!/usr/bin/env node
/**
 * Comparación visual entre el sitio original (WordPress) y la vista previa local.
 *
 *   node scripts/wp-import/qa-compare.cjs <carpeta-salida> /ruta/ [/otra-ruta/ ...] [--mobile]
 *
 * Para cada ruta captura la página completa en ambos sitios (tras dejar que el original
 * ejecute su JavaScript), calcula qué franjas horizontales difieren y escribe:
 *   <salida>/<ruta>__<vista>.png          página completa lado a lado (original | local)
 *   <salida>/<ruta>__<vista>__diff-N.png  recortes de las zonas que más difieren
 *   <salida>/<ruta>__<vista>.txt          resumen: alturas, franjas distintas (y en px)
 * Requiere Playwright (preinstalado en el entorno de desarrollo) y el servidor
 * `npm run preview` en http://127.0.0.1:4321.
 */
const { chromium } = require('playwright');
const sharp = require(require.resolve('sharp', { paths: [__dirname + '/../..'] }));
const fs = require('node:fs');
const path = require('node:path');

const LIVE = 'https://welcomestudentsgroup.com';
const LOCAL = process.env.QA_LOCAL || 'http://127.0.0.1:4321';

async function capture(page, base, route, isLive) {
  await page.goto(base + route, { waitUntil: 'load', timeout: 120000 });
  await page.evaluate(async (slow) => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, slow ? 150 : 60));
    }
    window.scrollTo(0, 0);
  }, isLive);
  await page.waitForTimeout(isLive ? 6000 : 1000);
  return page.screenshot({ fullPage: true });
}

async function main() {
  const args = process.argv.slice(2);
  const mobile = args.includes('--mobile');
  const [outDir, ...routes] = args.filter((a) => !a.startsWith('--'));
  if (!outDir || !routes.length) {
    console.error('Uso: qa-compare.cjs <salida> /ruta/ [...] [--mobile]');
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });
  const vp = mobile ? { width: 390, height: 844 } : { width: 1366, height: 900 };
  const browser = await chromium.launch();
  for (const route of routes) {
    const name = (route.replace(/^\/|\/$/g, '').replace(/\//g, '__').replace(/[?=&]/g, '_') || 'index') + (mobile ? '__mob' : '__desk');
    const shots = [];
    for (const [base, isLive] of [[LIVE, true], [LOCAL, false]]) {
      const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, locale: 'es' });
      const page = await ctx.newPage();
      try {
        shots.push(await capture(page, base, route, isLive));
      } catch (e) {
        console.log('ERROR', base + route, e.message.slice(0, 120));
        shots.push(null);
      }
      await ctx.close();
    }
    if (!shots[0] || !shots[1]) continue;
    const [a, b] = await Promise.all(shots.map((s) => sharp(s).ensureAlpha().raw().toBuffer({ resolveWithObject: true })));
    const W = Math.min(a.info.width, b.info.width);
    const H = Math.max(a.info.height, b.info.height);
    const band = 60;
    const bands = [];
    for (let y = 0; y < H; y += band) {
      let diff = 0;
      let n = 0;
      for (let yy = y; yy < Math.min(y + band, H); yy += 2) {
        for (let x = 0; x < W; x += 2) {
          const ia = (yy * a.info.width + x) * 4;
          const ib = (yy * b.info.width + x) * 4;
          const inA = yy < a.info.height;
          const inB = yy < b.info.height;
          const ra = inA ? a.data[ia] : 255, ga = inA ? a.data[ia + 1] : 255, ba = inA ? a.data[ia + 2] : 255;
          const rb = inB ? b.data[ib] : 255, gb = inB ? b.data[ib + 1] : 255, bb = inB ? b.data[ib + 2] : 255;
          diff += Math.abs(ra - rb) + Math.abs(ga - gb) + Math.abs(ba - bb);
          n++;
        }
      }
      bands.push({ y, score: n ? diff / n / 3 : 0 });
    }
    const differing = bands.filter((x) => x.score > 12);
    // Agrupar franjas contiguas en regiones.
    const regions = [];
    for (const bnd of differing) {
      const last = regions[regions.length - 1];
      if (last && bnd.y === last.end) last.end = bnd.y + band, (last.score = Math.max(last.score, bnd.score));
      else regions.push({ start: bnd.y, end: bnd.y + band, score: bnd.score });
    }
    const side = async (top, height, file) => {
      const crops = await Promise.all(
        [a, b].map((img, i) => {
          const h = Math.max(1, Math.min(height, img.info.height - top));
          if (top >= img.info.height) return sharp({ create: { width: W, height, channels: 3, background: '#eeeeee' } }).png().toBuffer();
          return sharp(shots[i]).extract({ left: 0, top, width: W, height: h }).png().toBuffer();
        }),
      );
      const metas = await Promise.all(crops.map((c) => sharp(c).metadata()));
      const h = Math.max(...metas.map((m) => m.height));
      await sharp({ create: { width: W * 2 + 10, height: h, channels: 3, background: '#ff00ff' } })
        .composite(crops.map((c, i) => ({ input: c, left: i * (W + 10), top: 0 })))
        .png()
        .toFile(file);
    };
    await side(0, H, path.join(outDir, `${name}.png`));
    const top = regions.sort((x, y) => y.score - x.score).slice(0, 6);
    let i = 0;
    for (const r of top) {
      i++;
      const start = Math.max(0, r.start - 120);
      await side(start, Math.min(1400, r.end - r.start + 240), path.join(outDir, `${name}__diff-${i}.png`));
    }
    const summary = [
      `Ruta: ${route}  vista: ${mobile ? 'móvil 390px' : 'escritorio 1366px'}`,
      `Alto original: ${a.info.height}px · alto local: ${b.info.height}px · diferencia: ${b.info.height - a.info.height}px`,
      `Franjas distintas: ${differing.length} de ${bands.length} (umbral 12/255)`,
      ...regions.sort((x, y) => x.start - y.start).map((r) => `  y=${r.start}–${r.end}px  intensidad ${r.score.toFixed(1)}`),
      `Recortes de las ${top.length} zonas más distintas: ${name}__diff-1..${top.length}.png (empiezan 120px antes de la zona)`,
    ].join('\n');
    fs.writeFileSync(path.join(outDir, `${name}.txt`), summary + '\n');
    console.log(summary + '\n');
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
