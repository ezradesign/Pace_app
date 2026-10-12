/* PACE · fotos del sello dentro del aro, antes y después del arreglo (10 oct. 2026)
   ===============================================================================
   Uso, desde la raíz del repo y con index.html construido:
     node docs/traspaso/archivos/sello-aro-10oct/fotos.js antes|despues|sin-dibujo [puerto]
   «antes» se hace con el index.html de origin/main puesto en su sitio a mano; «sin-dibujo» es
   la opción B, pintada encima del arreglo escondiendo el círculo del dibujo. Levanta su
   servidor (8785 por defecto, nunca el 8765 ni el 8775) y se para si ese puerto lo sirve otra
   carpeta. La home es la de Ez: «Foco manual» a 05:00, sin «A tu ritmo». Los sellos se piden
   con showToast, la puerta de todos, y la foto se hace a los 0,9 s. */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '../../../..');
const { chromium } = require(path.join(RAIZ, 'node_modules', '@playwright/test'));
const sharp = require(path.join(RAIZ, 'node_modules', 'sharp'));
const CUAL = process.argv[2] || 'despues';
const PUERTO = Number(process.argv[3] || 8785);
const BASE = 'http://localhost:' + PUERTO;
const SALIDA = path.join(__dirname, 'fotos');

/* nombre: [ancho, alto, idioma, paleta, sellos] */
const CASOS = {
  'primer-paso-360x718': [360, 718, 'es', 'crema', ['first.step']],
  'largo-360x640': [360, 640, 'es', 'crema', ['master.collector.half']],
  'largo-360x718-en': [360, 718, 'en', 'crema', ['master.collector.half']],
  'secreto-360x640': [360, 640, 'es', 'crema', ['secret.zen']],
  'tres-360x718': [360, 718, 'es', 'crema', ['first.step', 'master.collector.half', 'secret.zen']],
  'primer-paso-360x718-oscuro': [360, 718, 'es', 'oscuro', ['first.step']],
  'largo-1280x800': [1280, 800, 'es', 'crema', ['master.collector.half']],
};

async function servidor() {
  const p = spawn(process.execPath, ['.claude/static-server.js'], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(BASE + '/index.html', { method: 'HEAD' });
      const marca = decodeURIComponent(r.headers.get('x-pace-raiz') || '');
      if (path.resolve(marca).toLowerCase() !== RAIZ.toLowerCase()) throw new Error('El puerto ' + PUERTO + ' lo sirve otra carpeta: ' + marca);
      return p;
    } catch (e) {
      if (/otra carpeta/.test(e.message)) { p.kill(); throw e; }
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  p.kill();
  throw new Error('El servidor no arrancó en ' + BASE);
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await servidor();
  const browser = await chromium.launch();
  try {
    for (const [nombre, [ancho, alto, lang, paleta, sellos]] of Object.entries(CASOS)) {
      const movil = ancho < 700;
      const context = await browser.newContext({ baseURL: BASE, viewport: { width: ancho, height: alto }, isMobile: movil, hasTouch: movil,
        deviceScaleFactor: movil ? 2 : 1, locale: lang === 'en' ? 'en-GB' : 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: paleta === 'oscuro' ? 'dark' : 'light' });
      await context.addInitScript((e) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e)); },
        { firstSeen: 1, lang, langAuto: false, palette: paleta, focusMinutes: 5, profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 }, ritmo: { libre: true } });
      const page = await context.newPage();
      await page.goto('/index.html');
      await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      if (CUAL === 'sin-dibujo') await page.addStyleTag({ content: '[data-pace-sello-glifo] { display: none !important; }' });
      await page.evaluate((ids) => ids.forEach((id) => showToast({ id, type: 'achievement' })), sellos);
      await page.locator('[data-pace-sello-aro]').first().waitFor({ state: 'visible' });
      await page.waitForTimeout(900);
      const png = await page.screenshot();
      await sharp(png).webp({ quality: 86 }).toFile(path.join(SALIDA, CUAL + '-' + nombre + '.webp'));
      if (movil) {
        /* De cerca: el aro, para leer el sello al tamaño de un móvil. */
        const r = await page.evaluate(() => { const b = document.querySelector('[data-pace-dial-number]').getBoundingClientRect(); return { y: b.top }; });
        const y = Math.max(0, Math.round((r.y - 30) * 2));
        await sharp(png).extract({ left: 0, top: y, width: ancho * 2, height: Math.min(alto * 2 - y, 300) }).webp({ quality: 90 })
          .toFile(path.join(SALIDA, CUAL + '-' + nombre + '-cerca.webp'));
      }
      console.log(CUAL, nombre);
      await context.close();
    }
  } finally {
    await browser.close();
    srv.kill();
  }
})().catch((e) => { console.error(e); process.exit(1); });
