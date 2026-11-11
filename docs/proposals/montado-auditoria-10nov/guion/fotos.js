// Las fotos de antes y después de lo montado de la auditoría (Ez, 10 nov. 2026: 1A, 2A y 4A).
// Mismo guion para las dos: `node fotos.js antes` con el index.html de main y `node fotos.js despues` con el de la rama.
// Cada pantalla se alcanza en castellano y en claro; el inglés y el oscuro se ponen después con setState, sobre la
// misma pantalla, así que las cuatro fotos son del mismo momento. Mide también que nada tapa ni sale de la ventana.
'use strict';
const path = require('path');
const fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');
const { chromium } = require(path.join(RAIZ, 'node_modules', 'playwright'));
const PUERTO = Number(process.env.FOTOS_PORT || 8950);
const FASE = process.argv[2] === 'despues' ? 'despues' : 'antes';
const SOLO = (process.argv[3] || '').split(',').filter(Boolean);
const SALIDA = path.join(__dirname, '..', 'fotos', FASE);
fs.mkdirSync(SALIDA, { recursive: true });
const MEDIDAS = [];

const HOY = (() => { const d = new Date(); const p = (n) => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); })();
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', paletteAuto: false, ritmo: { libre: true }, novedadesVistas: '*' };
const TAMANOS = { 360: { width: 360, height: 740, movil: true }, 1536: { width: 1536, height: 710, movil: false } };

async function abrir(tam, { estado = SEMILLA, hora = HOY + 'T09:00:00', tienda = false } = {}) {
  const t = TAMANOS[tam];
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: t.width, height: t.height }, isMobile: t.movil, hasTouch: t.movil, deviceScaleFactor: t.movil ? 2 : 1,
    locale: 'es-ES', timezoneId: 'Europe/Madrid', serviceWorkers: 'block', colorScheme: 'light',
  });
  await context.addInitScript(([e]) => {
    localStorage.setItem('pace-cara', 'app');
    if (e && !localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
  }, [estado]);
  if (tienda) await context.addInitScript(() => { window.addEventListener('DOMContentLoaded', () => { try { window.PACE_TIENDA_WEB.enlaces.vida = 'https://example.invalid/vida'; } catch (e) {} }); });
  const page = await context.newPage();
  await page.clock.install({ time: new Date(hora) });
  await page.goto('http://localhost:' + PUERTO + '/index.html');
  await page.waitForTimeout(600); await page.clock.runFor(1500);
  return { browser, page };
}
const quieto = async (page) => { await page.clock.runFor(900); await page.waitForTimeout(350); };
const foto = async (page, nombre) => { await quieto(page); await page.screenshot({ path: path.join(SALIDA, nombre + '.jpg'), type: 'jpeg', quality: 78 }); console.log('foto ' + FASE + '/' + nombre); };

/* Lo que se ve de cada botón dentro de `raiz`: que ninguno pise a otro y que todos estén dentro de la ventana. */
const medir = (page, raiz, nombre) => page.evaluate(([sel]) => {
  const r = document.querySelector(sel);
  if (!r) return { error: 'sin ' + sel };
  const cajas = [...r.querySelectorAll('button, a')].filter((b) => { const c = b.getBoundingClientRect(); return c.width > 0 && c.height > 0 && getComputedStyle(b).visibility !== 'hidden'; })
    .map((b) => { const c = b.getBoundingClientRect(); return { t: (b.innerText || b.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40), x: c.left, y: c.top, r: c.right, b: c.bottom }; });
  const pisan = [];
  for (let i = 0; i < cajas.length; i++) for (let j = i + 1; j < cajas.length; j++) {
    const a = cajas[i], b = cajas[j];
    if (Math.min(a.r, b.r) - Math.max(a.x, b.x) > 0.5 && Math.min(a.b, b.b) - Math.max(a.y, b.y) > 0.5 && !(a.x >= b.x && a.r <= b.r && a.y >= b.y && a.b <= b.b) && !(b.x >= a.x && b.r <= a.r && b.y >= a.y && b.b <= a.b)) pisan.push(a.t + ' / ' + b.t);
  }
  const fuera = cajas.filter((c) => c.x < -0.5 || c.y < -0.5 || c.r > innerWidth + 0.5 || c.b > innerHeight + 0.5).map((c) => c.t + ' (' + Math.round(c.b) + ')');
  const scroll = [...r.querySelectorAll('*')].filter((e) => { const s = getComputedStyle(e); return /(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 1; }).length;
  const ultimo = cajas.reduce((m, c) => Math.max(m, c.b), 0);
  return { botones: cajas.length, pisan, fuera, scroll, fondo: Math.round(ultimo), alto: innerHeight };
}, [raiz]).then((m) => { MEDIDAS.push(Object.assign({ fase: FASE, foto: nombre }, m)); console.log('medida ' + nombre + ' ' + JSON.stringify(m)); });

/* Las cuatro fotos de una pantalla: es y en, claro y oscuro. */
async function cuatro(page, nombre, raiz, temas = ['claro', 'oscuro']) {
  for (const lang of ['es', 'en']) {
    for (const tema of temas) {
      await page.evaluate(([l, p]) => window.setState({ lang: l, palette: p }), [lang, tema === 'oscuro' ? 'oscuro' : 'crema']);
      await quieto(page);
      const n = nombre + '-' + lang + '-' + tema;
      if (raiz) await medir(page, raiz, n);
      await foto(page, n);
    }
  }
  await page.evaluate(() => window.setState({ lang: 'es', palette: 'crema' }));
}

async function hastaElCierre(page) {
  for (let i = 0; i < 120; i++) {
    if (await page.locator('[data-pace-session-done]').count()) return;
    await page.clock.runFor(5000); await page.waitForTimeout(20);
  }
  throw new Error('la sesión no llegó al cierre');
}
async function finBloque(page) {
  const fin = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
  await page.clock.fastForward(fin - await page.evaluate(() => Date.now()) + 1000);
  await page.locator('[data-pace-break-shortcut]').first().waitFor({ state: 'attached', timeout: 15000 });
  await page.waitForTimeout(300); await page.clock.runFor(1200);
}
const encima = (page) => page.locator('[role=dialog]').last();
const empezarPreview = async (page) => { await encima(page).getByRole('button', { name: 'Empezar', exact: true }).click(); await page.locator('[data-pace-session-root]').waitFor(); };

const TAREAS = {
  /* 1A · Ajustes, «Tus datos», con la tienda abierta. */
  async ajustes(tam) {
    const { browser, page } = await abrir(tam, { tienda: true });
    await page.getByRole('button', { name: 'Abrir ajustes' }).filter({ visible: true }).first().click();
    const panel = page.locator('[data-pace-tweaks-panel]');
    await panel.waitFor({ state: 'visible' });
    const plegada = panel.locator('[data-pace-aj-plegada] .pace-aj-sec-accion');
    if (await plegada.isVisible()) { await plegada.click(); await page.locator('[data-pace-tweaks-panel][data-pace-aj-vista="datos"]').waitFor(); }
    await cuatro(page, 'ajustes-' + tam, '[data-pace-tweaks-panel]');
    await browser.close();
  },
  /* 2A · El cierre de una sesión elegida en la pausa, por libre. */
  async cierreLibre(tam) {
    const { browser, page } = await abrir(tam);
    await page.locator('[data-pace-cta]').filter({ visible: true }).first().click();
    await page.clock.runFor(800);
    await finBloque(page);
    await page.locator('[data-pace-break-prop] button').first().click(); await page.clock.runFor(800);
    await empezarPreview(page); await hastaElCierre(page);
    await cuatro(page, 'cierre-libre-' + tam, '[data-pace-session-root]');
    await browser.close();
  },
  /* 2A · El cierre con jornada: la pausa sigue contando. */
  async cierreJornada(tam) {
    const estado = Object.assign({}, SEMILLA, { ritmo: { dia: { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } });
    const { browser, page } = await abrir(tam, { estado });
    await page.getByRole('button', { name: 'Empezar jornada', exact: true }).filter({ visible: true }).first().click();
    await page.clock.runFor(800);
    await finBloque(page);
    await encima(page).getByRole('button', { name: 'Hacer la pausa', exact: true }).click(); await page.clock.runFor(800);
    await empezarPreview(page); await hastaElCierre(page);
    await cuatro(page, 'cierre-jornada-' + tam, '[data-pace-session-root]');
    await browser.close();
  },
  /* 4A · La pantalla de PACE completo de la bienvenida (abierto hasta v1). Solo cambia el texto: en claro. */
  async bienvenida(tam) {
    const { browser, page } = await abrir(tam, { estado: null, hora: HOY + 'T09:00:00' });
    await page.getByRole('button', { name: 'Comenzar', exact: true }).first().click(); await page.clock.runFor(800);
    await page.getByRole('button', { name: 'Continuar', exact: true }).first().click();
    await page.clock.runFor(4000); await page.waitForTimeout(1200);
    await cuatro(page, 'bienvenida-' + tam, '[role=dialog]', ['claro']);
    await browser.close();
  },
  /* 4A · La invitación de PACE completo con la tienda cerrada. */
  async invitacion(tam) {
    const { browser, page } = await abrir(tam);
    await page.evaluate(() => window.paceAbrirPremium({}));
    await page.locator('[data-pace-premium-v1]').waitFor();
    await cuatro(page, 'invitacion-' + tam, '[role=dialog]', ['claro']);
    await browser.close();
  },
};

(async () => {
  const lista = SOLO.length ? SOLO : Object.keys(TAREAS);
  for (const t of lista) for (const tam of [360, 1536]) {
    try { console.log('--- ' + t + ' ' + tam); await TAREAS[t](tam); }
    catch (e) { console.log('FALLO ' + t + ' ' + tam + ': ' + String(e).split('\n')[0].slice(0, 220)); }
  }
  const archivo = path.join(SALIDA, 'medidas.json');
  const viejas = fs.existsSync(archivo) ? JSON.parse(fs.readFileSync(archivo, 'utf8')) : [];
  const nuevas = viejas.filter((m) => !MEDIDAS.some((x) => x.foto === m.foto)).concat(MEDIDAS);
  fs.writeFileSync(archivo, JSON.stringify(nuevas, null, 1));
  process.exit(0);
})();
