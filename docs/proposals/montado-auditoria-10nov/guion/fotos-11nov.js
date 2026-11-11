// Las fotos de después de lo montado el 11 nov. (Ez: «Linea 2 en el sobre + 3 en la side bar / D adaptarlos»):
// la línea de los lunes (móvil: sobre y cajón; ordenador: la fila del resumen) y Ocaso y Búho con lo que premian ahora.
// `node fotos-11nov.js [lunes,logros]` con el index.html de la rama servido en FOTOS_PORT (8952).
'use strict';
const path = require('path');
const fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');
const { chromium } = require(path.join(RAIZ, 'node_modules', 'playwright'));
const PUERTO = Number(process.env.FOTOS_PORT || 8952);
const SOLO = (process.argv[2] || 'lunes,logros').split(',');
const SALIDA = path.join(__dirname, '..', 'fotos', 'despues');
fs.mkdirSync(SALIDA, { recursive: true });

const LUNES = '2026-11-23';
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', paletteAuto: false, novedadesVistas: '*',
  pasoV1: { at: 1, previo: false }, ritmo: { dia: { fecha: LUNES, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } };

async function abrir(ancho, alto, { estado = SEMILLA, v1 = true } = {}) {
  const movil = ancho < 700;
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: ancho, height: alto }, isMobile: movil, hasTouch: movil,
    deviceScaleFactor: movil ? 2 : 1, locale: 'es-ES', timezoneId: 'Europe/Madrid', serviceWorkers: 'block' });
  await context.addInitScript(([e, v1]) => {
    localStorage.setItem('pace-cara', 'app');
    if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
    if (v1) Object.defineProperty(window, 'PREMIUM_ABIERTO_HASTA_V1', { configurable: true, get: () => false, set: () => {} });
  }, [estado, v1]);
  const page = await context.newPage();
  await page.clock.install({ time: new Date(LUNES + 'T10:00:00') });
  await page.goto('http://localhost:' + PUERTO + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.clock.runFor(1500); await page.waitForTimeout(400);
  return { browser, page };
}
const foto = async (page, nombre) => { await page.clock.runFor(900); await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(SALIDA, nombre + '.jpg'), type: 'jpeg', quality: 78 }); console.log('foto ' + nombre); };
const scroll = (page) => page.evaluate(() => ({ pagina: document.scrollingElement.scrollHeight - innerHeight,
  cajon: (() => { const a = document.querySelector('[data-pace-sidebar]'); return a ? a.scrollHeight - a.clientHeight : null; })() }));

const tareas = {
  async lunes() {
    { const { browser, page } = await abrir(360, 740);
      console.log('móvil, home ' + JSON.stringify(await scroll(page)));
      await foto(page, 'lunes-sobre-360');
      await page.locator('button[aria-label="La carta del lunes"]').click();
      await foto(page, 'lunes-sobre-hoja-360');
      await page.keyboard.press('Escape'); await page.clock.runFor(600);
      await page.getByRole('button', { name: 'Abrir panel' }).click();
      const m = await page.evaluate(() => { const f = document.querySelector('[data-pace-lunes-fila]'); return f ? Math.round(f.getBoundingClientRect().bottom) : null; });
      console.log('móvil, cajón: fila acaba en ' + m + ' de 740 · ' + JSON.stringify(await scroll(page)));
      await foto(page, 'lunes-cajon-360');
      await browser.close(); }
    for (const [w, h] of [[1536, 710], [1920, 860], [1280, 720]]) {
      const { browser, page } = await abrir(w, h);
      const m = await page.evaluate(() => { const l = document.querySelector('[data-pace-lunes-linea]'); const p = document.querySelector('.pace-rt-esc');
        if (!l) return 'sin línea'; const a = l.getBoundingClientRect(), b = p.getBoundingClientRect();
        return { linea: [Math.round(a.left), Math.round(a.right), Math.round(a.top)], panel: [Math.round(b.left), Math.round(b.right), Math.round(b.top), Math.round(b.bottom)] }; });
      console.log('ordenador ' + w + ' ' + JSON.stringify(m) + ' ' + JSON.stringify(await scroll(page)));
      await foto(page, 'lunes-' + w);
      await browser.close();
    }
  },
  async logros() {
    const estado = Object.assign({}, SEMILLA, { achievements: { 'master.dusk': { unlockedAt: 1 }, 'secret.night.owl': { unlockedAt: 1 } } });
    for (const [w, h] of [[360, 740], [1536, 710]]) {
      const { browser, page } = await abrir(w, h, { estado, v1: false });
      await page.getByRole('button', { name: 'Ver logros' }).first().click();
      await page.clock.runFor(800);
      for (const id of ['master.dusk', 'secret.night.owl']) {
        const t = page.locator('[data-pace-ach="' + id + '"]');
        await t.scrollIntoViewIfNeeded();
        console.log(id + ' ' + w + ': ' + (await t.innerText()).replace(/\s+/g, ' ') + ' · ' + JSON.stringify(await t.boundingBox()));
        await foto(page, 'logro-' + (id === 'master.dusk' ? 'ocaso' : 'buho') + '-' + w);
      }
      await browser.close();
    }
  },
};

(async () => {
  for (const t of SOLO) { try { console.log('--- ' + t); await tareas[t](); } catch (e) { console.log('FALLO ' + t + ': ' + String(e).split('\n')[0].slice(0, 220)); } }
  process.exit(0);
})();
