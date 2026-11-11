/* La pantalla de la app de la rama, por idioma y tema, en ordenador y en móvil. Prueba. */
'use strict';
const path = require('path'), fs = require('fs'), http = require('http');
const [REPO, DIST, OUT] = process.argv.slice(2);
const { chromium } = require(path.join(REPO, 'node_modules', '@playwright/test'));
const sharp = require(path.join(REPO, 'node_modules', 'sharp'));
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = http.createServer((req, res) => {
    let url = decodeURIComponent(req.url.split('?')[0]); if (url === '/') url = '/index.html';
    const f = path.join(DIST, url);
    if (!fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(res);
  }).listen(8902);
  const nav = await chromium.launch();
  const TAM = { escritorio: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, movil: { viewport: { width: 373, height: 622 }, deviceScaleFactor: 1.5 } };
  for (const lang of ['es', 'en']) for (const tema of ['claro', 'oscuro']) for (const [tam, o] of Object.entries(TAM)) {
    const ctx = await nav.newContext(Object.assign({ locale: lang === 'en' ? 'en-US' : 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: tema === 'oscuro' ? 'dark' : 'light', serviceWorkers: 'block' }, o));
    await ctx.addInitScript(([v]) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(v)); },
      [{ firstSeen: 1, lang, langAuto: false, palette: tema === 'oscuro' ? 'oscuro' : 'crema' }]);
    const page = await ctx.newPage();
    await page.clock.install({ time: new Date('2026-10-28T09:05:00+01:00') });
    const errores = []; page.on('pageerror', (e) => errores.push(String(e).slice(0, 120)));
    await page.goto('http://localhost:8902/?go=inicio', { waitUntil: 'load' });
    await page.waitForSelector('#root > *', { timeout: 20000 });
    await page.evaluate(() => document.fonts.ready);
    await page.clock.runFor(1500);
    await page.waitForTimeout(600);
    const png = await page.screenshot();
    const f = path.join(OUT, 'app-' + tam + '-' + lang + '-' + tema + '.webp');
    await sharp(png).webp({ quality: 80 }).toFile(f);
    console.log(path.basename(f), Math.round(fs.statSync(f).size / 1024) + ' KB', errores.join(' | '));
    await ctx.close();
  }
  await nav.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
