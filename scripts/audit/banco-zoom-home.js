/* BANCO · LA HOME DEL ORDENADOR CON EL NAVEGADOR AMPLIADO (21 nov. 2026)
 * ======================================================================
 * Ez (21 nov.): al ampliar con Ctrl + «se descuadran todos los elementos». Ampliar no cambia
 * la pantalla: deja menos px CSS. Al 150 % en 1911×868 la app ve 1274×579; al 175 %, 1092×496.
 * Esto emula ese zoom (viewport = pantalla útil ÷ zoom, deviceScaleFactor = zoom) en tres
 * pantallas típicas, del 110 al 200 %, en es y en, en los momentos de
 * tests/home-sin-scroll.spec.js y con el Foco en marcha, y apunta qué se pisa o se sale:
 *   · radio: la esquina más lejana de lo de dentro del aro, en fracción de D (el trazo está en
 *     0,475; el halo de la bola, en 0,458);
 *   · pisa: dos piezas de dentro del aro que se cruzan (rótulo, número, descriptor, botón, ciclo);
 *   · bajo: cuánto baja lo de dentro del aro por debajo del canto de Actividades o de la tarjeta
 *     del día (> 0 = se mete en ellas);
 *   · scroll: lo que pide la home (regla de Ez: ninguno), y si algo se sale por el ancho.
 * Y hace una captura de cada caso. Solo lee: no toca la app.
 *
 * Uso:  node scripts/audit/banco-zoom-home.js [salida] [--solo=es] [--pantalla=1366] [--zoom=100,150]
 *        [--momento=corta] [--hilos=4] [--html=_revision-head.html] (otra página servida, para comparar)
 *        [--css=maqueta.css] (una maqueta: CSS encima de la app, y el motor vuelve a medir)
 *   salida por defecto: _zoom-home/ (gitignorado por el prefijo).
 *   PACE_E2E_PORT elige el puerto del servidor (8921 por defecto).
 */
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const REPO = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
const SALIDA = path.resolve(args.find((a) => !a.startsWith('--')) || path.join(REPO, '_zoom-home'));
const opt = (n) => { const a = args.find((x) => x.startsWith('--' + n + '=')); return a ? a.split('=')[1] : null; };
const { chromium } = require(require.resolve('@playwright/test', { paths: [REPO] }));
const { asentarGeometria } = require(path.resolve(REPO, 'tests', 'home.helpers.js'));

const PORT = Number(process.env.PACE_E2E_PORT || 8921);
const BASE = 'http://localhost:' + PORT;
const CHROME = 130;   // barra del navegador y de la tarea, en px de pantalla al 100 %

const PANTALLAS = [
  { id: '1366x768', w: 1366, h: 768 },
  { id: '1536x864', w: 1536, h: 864 },
  { id: '1920x1080', w: 1920, h: 1080 },
];
const ZOOMS = [1, 1.1, 1.25, 1.5, 1.75, 2];
/* Las dos ventanas que vio la coordinadora en la pantalla de Ez (1911×868 útiles). */
const EZ = [{ id: 'ez-150', w: 1274, h: 579, z: 1.5 }, { id: 'ez-175', w: 1092, h: 496, z: 1.75 }];

const FECHA = '2026-10-08';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const hora = (hhmm) => new Date(FECHA + 'T' + hhmm + ':00+02:00');
const MOMENTOS = [
  { id: 'corta', nombre: 'la tarjeta corta', semilla: { ritmo: { libre: true } }, hora: '10:00' },
  { id: 'pregunta', nombre: 'la pregunta', semilla: { ritmo: { libre: true } }, hora: '10:00', comienza: true },
  { id: 'llegando', nombre: 'el día servido llegando a las 10:00', semilla: { ritmo: { libre: true } }, hora: '10:00', comienza: true, elige: 'jornada' },
  { id: 'servido', nombre: 'el día servido al empezar', semilla: { ritmo: { dia: JORNADA } }, hora: '09:00' },
  { id: 'contestado', nombre: 'el día ya contestado', semilla: { ritmo: { semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'] } }, hora: '08:30' },
  { id: 'pausa', nombre: 'la pausa abierta', semilla: { ritmo: { dia: Object.assign({}, JORNADA, { pausa: 1 }) }, cycle: 1,
    lastActiveDay: 'Thu Oct 08 2026', _historyMigrated: true }, hora: '09:50' },
  { id: 'terminado', nombre: 'el bloque terminado al volver', semilla: { ritmo: { libre: true } }, hora: '10:40', terminoA: '10:35' },
  { id: 'foco-libre', nombre: 'el Foco en marcha, por libre', semilla: { ritmo: { libre: true } }, hora: '10:00', empieza: true },
  { id: 'foco-dia', nombre: 'el Foco en marcha, con el día', semilla: { ritmo: { dia: JORNADA } }, hora: '09:00', empieza: true },
];

const SEMILLA = { firstSeen: 1, langAuto: false, palette: 'crema', novedadesVistas: '*', copiaAvisoVisto: '*' };

function vistas() {
  const out = [];
  for (const p of PANTALLAS) {
    if (opt('pantalla') && !p.id.startsWith(opt('pantalla'))) continue;
    for (const z of ZOOMS) if (!opt('zoom') || opt('zoom').split(',').includes(String(Math.round(z * 100)))) out.push({ id: p.id + '@' + Math.round(z * 100), w: Math.floor(p.w / z), h: Math.floor((p.h - CHROME) / z), z });
  }
  if (!opt('pantalla') || opt('pantalla') === 'ez') for (const e of EZ) out.push(e);
  return out;
}

/* Lo que se mide, en la página. */
function medir(page) {
  return page.evaluate(() => {
    const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
    const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find(vis);
    const dial = document.querySelector('[data-pace-dial-fit]');
    const numero = dial && dial.querySelector('[data-pace-dial-number]');
    if (!body || !numero) return { error: 'sin home o sin aro' };
    const f = dial.getBoundingClientRect();
    const cx = f.left + f.width / 2, cy = f.top + f.height / 2, D = f.height;
    const interior = numero.parentElement;
    /* Las piezas: rótulo, «hasta», número, descriptor y cada hoja de lo de abajo (botón, ciclo). */
    const piezas = [];
    const nombre = (el) => (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 28);
    const hojas = (raiz) => {
      Array.from(raiz.children).forEach((el) => {
        if (!vis(el)) return;
        if (el.matches('[data-pace-dial-divider]')) return;
        const esPieza = el.matches('[data-pace-dial-label],[data-pace-dial-hasta],[data-pace-dial-number],[data-pace-dial-subtitle],button,a,[data-pace-ciclo]') || !el.children.length;
        if (esPieza) piezas.push({ el, n: nombre(el) }); else hojas(el);
      });
    };
    hojas(interior);
    let radio = 0, quien = '';
    /* La caja de la TINTA: un div de texto mide el ancho del bloque entero, y sus esquinas
       quedarían fuera del aro sin que se pinte nada allí. Botones y puntos, con su caja. */
    const tinta = (el) => {
      if (el.matches('button, a') || !el.textContent.trim()) return el.getBoundingClientRect();
      const rg = document.createRange(); rg.selectNodeContents(el); return rg.getBoundingClientRect();
    };
    const cajas = piezas.map((p) => {
      const r = tinta(p.el);
      const dx = Math.max(Math.abs(r.left - cx), Math.abs(r.right - cx));
      const dy = Math.max(Math.abs(r.top - cy), Math.abs(r.bottom - cy));
      const d = Math.hypot(dx, dy) / D;
      if (d > radio) { radio = d; quien = p.n; }
      return { n: p.n, l: r.left, r: r.right, t: r.top, b: r.bottom, d: +d.toFixed(3), num: p.el.matches('[data-pace-dial-number]') };
    });
    const pisa = [];
    for (let i = 0; i < cajas.length; i++) for (let j = i + 1; j < cajas.length; j++) {
      const a = cajas[i], b = cajas[j];
      /* El número no: su caja de línea lleva aire de la fuente arriba y abajo, y a 100 % ya
         «pisa» 11-14 px al rótulo sin que se toque la tinta. */
      if (a.num || b.num) continue;
      const ox = Math.min(a.r, b.r) - Math.max(a.l, b.l), oy = Math.min(a.b, b.b) - Math.max(a.t, b.t);
      if (ox > 1 && oy > 1) pisa.push(a.n + ' × ' + b.n + ' (' + Math.round(oy) + ' px)');
    }
    /* El canto de lo que va debajo del aro: los chips de Actividades o la tarjeta del día. */
    const debajo = Array.from(document.querySelectorAll('[data-pace-activitybar-chip], [data-pace-activitybar-label], [data-pace-ritmo-panel], [data-pace-ritmo-tarjeta], [data-pace-activitybar] > *')).filter(vis)
      .filter((el) => el.getBoundingClientRect().top > cy);
    const canto = debajo.length ? Math.min(...debajo.map((el) => el.getBoundingClientRect().top)) : null;
    const fondo = cajas.length ? Math.max(...cajas.map((c) => c.b)) : null;
    const bajo = canto != null && fondo != null ? Math.round(fondo - canto) : null;
    const quienBajo = bajo > 0 ? cajas.filter((c) => c.b > canto).map((c) => c.n).join(', ') : '';
    /* Lo de arriba (el selector de minutos) contra la cima del aro con su contenido. */
    const cima = cajas.length ? Math.min(...cajas.map((c) => c.t)) : null;
    const sel = Array.from(document.querySelectorAll('[data-pace-home-body] [role="tablist"], [data-pace-home-body] [data-pace-minutos]')).filter(vis)[0];
    const arriba = sel && cima != null ? Math.round(sel.getBoundingClientRect().bottom - cima) : null;
    const sobra = body.scrollHeight - body.clientHeight;
    const ancho = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const rs = getComputedStyle(document.documentElement);
    return {
      D: Math.round(D), radio: +radio.toFixed(3), quien, pisa, detalle: cajas.map((c) => c.n + ' ' + c.d).join(' | '), bajo, quienBajo, arriba, sobra, ancho,
      squeeze: rs.getPropertyValue('--pace-home-squeeze').trim(),
      piel: rs.getPropertyValue('--pace-skin').trim(),
    };
  });
}

async function caso(browser, vista, lang, m) {
  const context = await browser.newContext({
    baseURL: BASE, viewport: { width: vista.w, height: vista.h }, deviceScaleFactor: vista.z,
    locale: lang === 'es' ? 'es-ES' : 'en-GB', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block',
    storageState: { cookies: [], origins: [{ origin: BASE, localStorage: [{ name: 'pace-cara', value: 'app' }] }] },
  });
  await context.addInitScript(([e]) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e)); },
    [Object.assign({}, SEMILLA, { lang }, m.semilla)]);
  if (m.terminoA) await context.addInitScript((fin) => {
    if (!localStorage.getItem('pace.timer.v1')) localStorage.setItem('pace.timer.v1', JSON.stringify({ endsAt: fin, mode: 'foco', minutes: 25, id: 'vuelta' }));
  }, hora(m.terminoA).getTime());
  const page = await context.newPage();
  const v = (sel) => page.locator(sel).filter({ visible: true });
  try {
    await page.clock.install({ time: hora(m.hora) });
    await page.goto('/' + (opt('html') || 'index.html'));
    await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
    /* En el ordenador la tarjeta corta ya es la pregunta: no hay «Comienza». */
    if (m.comienza && await v('[data-pace-ritmo-comienza]').count()) await v('[data-pace-ritmo-comienza]').first().click();
    if (m.elige) await v('button[data-pace-ritmo-opcion="' + m.elige + '"], button[data-pace-ritmo-loseta="' + m.elige + '"]').first().click();
    if (m.terminoA) {
      await page.locator('[data-pace-break-shortcut]').first().waitFor();
      for (let i = 0; i < 10 && await page.locator('[data-pace-break-shortcut]').count(); i++) {
        await page.keyboard.press('Escape'); await page.waitForTimeout(150);
      }
    }
    if (m.empieza) { await v('[data-pace-dial-fit] [data-pace-cta]').first().click(); await page.waitForTimeout(1200); }
    /* Una maqueta: CSS que se pone encima de la app, y el motor vuelve a medir. */
    if (opt('css')) {
      await page.addStyleTag({ content: fs.readFileSync(path.resolve(opt('css')), 'utf8') });
      await page.evaluate(() => window.dispatchEvent(new Event('pace:home-relayout')));
    }
    await page.mouse.move(1, 1);
    await asentarGeometria(page);
    await page.waitForTimeout(250);
    const r = await medir(page);
    const foto = path.join(SALIDA, 'fotos', vista.id.replace('@', '-') + '-' + lang + '-' + m.id + '.jpg');
    await page.screenshot({ path: foto, type: 'jpeg', quality: 72, scale: 'css' });
    return Object.assign({ vista: vista.id, w: vista.w, h: vista.h, lang, momento: m.id, foto: path.relative(SALIDA, foto) }, r);
  } catch (e) {
    return { vista: vista.id, w: vista.w, h: vista.h, lang, momento: m.id, error: String(e.message || e).split('\n')[0] };
  } finally { await context.close(); }
}

function mal(r) {
  const p = [];
  if (r.error) return [r.error];
  if (r.radio > 0.475) p.push('se sale del aro (' + r.quien + ', ' + r.radio + ' D)');
  else if (r.radio > 0.458) p.push('toca el halo (' + r.quien + ', ' + r.radio + ' D)');
  if (r.pisa.length) p.push('se pisan: ' + r.pisa.join('; '));
  if (r.bajo > 0) p.push('se mete ' + r.bajo + ' px en lo de abajo (' + r.quienBajo + ')');
  if (r.arriba > 0) p.push('el selector pisa el aro ' + r.arriba + ' px');
  if (r.sobra > 1) p.push('scroll ' + r.sobra + ' px');
  if (r.ancho > 1) p.push('se sale por el ancho ' + r.ancho + ' px');
  return p;
}

async function main() {
  fs.mkdirSync(path.join(SALIDA, 'fotos'), { recursive: true });
  const server = spawn(process.execPath, [path.join(REPO, '.claude', 'static-server.js')], { cwd: REPO, env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 800));
  const browser = await chromium.launch();
  const langs = opt('solo') ? [opt('solo')] : ['es', 'en'];
  const cola = [];
  for (const vista of vistas()) for (const lang of langs) for (const m of MOMENTOS) {
    if (opt('momento') && !opt('momento').split(',').includes(m.id)) continue;
    cola.push([vista, lang, m]);
  }
  const res = [];
  const HILOS = Number(opt('hilos') || 4);
  await Promise.all(Array.from({ length: HILOS }, async () => {
    while (cola.length) { const [v, l, m] = cola.shift(); res.push(await caso(browser, v, l, m)); }
  }));
  await browser.close();
  server.kill();
  const orden = (r) => [r.vista, r.lang, MOMENTOS.findIndex((m) => m.id === r.momento)].join('|');
  res.sort((a, b) => orden(a).localeCompare(orden(b), 'en', { numeric: true }));
  fs.writeFileSync(path.join(SALIDA, 'medidas.json'), JSON.stringify(res, null, 1));
  const lineas = [];
  let actual = '';
  for (const r of res) {
    const k = r.vista + ' (' + r.w + '×' + r.h + ')';
    if (k !== actual) { lineas.push('\n## ' + k + (r.piel ? ' · piel ' + r.piel : '')); actual = k; }
    const p = mal(r);
    lineas.push('- ' + r.lang + ' · ' + r.momento + ' · D ' + r.D + ' · ' + (p.length ? p.join(' · ') : 'bien'));
  }
  fs.writeFileSync(path.join(SALIDA, 'resumen.md'), lineas.join('\n') + '\n');
  const malos = res.filter((r) => mal(r).length);
  console.log('casos: ' + res.length + ' · con algo mal: ' + malos.length + ' · ' + path.join(SALIDA, 'resumen.md'));
}

main().catch((e) => { console.error(e); process.exit(1); });
