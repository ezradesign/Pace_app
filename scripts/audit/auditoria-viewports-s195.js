/* PACE · AUDITORÍA DE VIEWPORTS · escritorio y teléfono (s195)
 * ============================================================
 * El usuario, tras la captura de v0.125.0: «comprueba los viewports de desktop y
 * teléfono, audita todo para ver si encontramos bugs». Esto es un CENSO, no una
 * prueba: recorre viewports × escenas de la home con «A tu ritmo», mide lo que una
 * suite no mira y escribe un informe y una foto por celda. Lo que salga se decide
 * mirando la foto; lo que se arregle va a la suite, no aquí.
 *
 * Lo que mide en cada celda:
 *   · errores de consola y excepciones;
 *   · scroll vertical REAL de la home (moviendo scrollTop, como home-geometria) y
 *     scroll horizontal del documento;
 *   · PIEZAS QUE SE PISAN: pares de elementos con texto propio, visibles, que se
 *     cruzan y no son ancestro uno del otro, dentro del panel de «A tu ritmo» y
 *     dentro de la barra lateral;
 *   · TEXTO RECORTADO: elementos con texto cuyo scrollWidth supera su caja (nowrap +
 *     overflow) y piezas del panel que se salen del panel;
 *   · lo que se sale del viewport por la derecha sin ser un cajón fuera de pantalla.
 *
 * Uso: node .claude/static-server.js  (aparte)
 *      node scripts/audit/auditoria-viewports-s195.js [carpetaSalida] [solo=1536x704,412x844]
 * Sale: <carpeta>/informe.json + <carpeta>/<viewport>-<escena>.png, y el resumen en consola.
 * La carpeta por defecto es el temp del sistema (las fotos no se commitean).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));

const BASE = process.env.PACE_BASE || 'http://localhost:8765';
const OUT = process.argv[2] || path.join(os.tmpdir(), 'pace-auditoria-s195');
const SOLO = (process.argv.find((a) => a.startsWith('solo=')) || '').slice(5).split(',').filter(Boolean);
fs.mkdirSync(OUT, { recursive: true });

const ESCRITORIO = [[1920, 950], [1536, 704], [1600, 780], [1440, 789], [1366, 657], [1280, 879], [1280, 600], [1024, 650], [820, 1100], [2560, 1300]];
const TELEFONO = [[360, 730], [375, 667], [390, 844], [412, 844], [430, 932], [768, 1024]];

const HOY = '2026-09-18';                                   /* viernes */
const T0900 = new Date('2026-09-18T09:00:00+02:00');
const T1930 = new Date('2026-09-18T19:30:00+02:00');
const T1430 = new Date('2026-09-19T14:30:00+02:00');       /* sábado, la captura del usuario */
const base = (movil, extra) => Object.assign({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', sidebarCollapsed: movil,
  profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 } }, extra || {});

/* Las escenas: semilla + reloj + qué hacer al abrir. */
const ESCENAS = {
  pregunta: { hora: T0900, semilla: (m) => base(m, { ritmo: {} }) },
  manana:   { hora: T0900, semilla: (m) => base(m, { ritmo: { dia: { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } }) },
  pausa:    { hora: new Date('2026-09-18T09:46:00+02:00'), semilla: (m) => base(m, { cycle: 1, lastActiveDay: 'Fri Sep 18 2026', _historyMigrated: true,
              ritmo: { dia: { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {}, pausa: 1 } } }) },
  tarde:    { hora: T1930, semilla: (m) => base(m, { cycle: 1, lastActiveDay: 'Fri Sep 18 2026', _historyMigrated: true,
              ritmo: { horario: { inicio: 780, comida: 960, comidaDur: 30, salida: 1140 }, dia: { fecha: HOY, opcion: '1h', desde: 1040, cicloBase: 0, cambios: {}, pausa: 1 } } }),
              accion: async (page) => { await page.getByRole('button', { name: 'Empezar bloque 2', exact: true }).click(); await page.waitForTimeout(1500); } },
  sabado:   { hora: T1430, semilla: (m) => base(m, { ritmo: { horario: { inicio: 870, comida: 960, comidaDur: 30, salida: 1140 }, dia: { fecha: '2026-09-19', opcion: '1h', desde: 870, cicloBase: 0, cambios: {} } } }) },
  libre:    { hora: T0900, semilla: (m) => base(m, { ritmo: { libre: true } }) },
  hecho:    { hora: new Date('2026-09-18T17:10:00+02:00'), semilla: (m) => base(m, { cycle: 9, lastActiveDay: 'Fri Sep 18 2026', _historyMigrated: true,
              ritmo: { dia: { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } }) },
  oscuro:   { hora: T0900, semilla: (m) => base(m, { palette: 'oscuro', ritmo: { dia: { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } }) },
  ingles:   { hora: T1930, semilla: (m) => base(m, { lang: 'en', cycle: 1, lastActiveDay: 'Fri Sep 18 2026', _historyMigrated: true,
              ritmo: { horario: { inicio: 780, comida: 960, comidaDur: 30, salida: 1140 }, dia: { fecha: HOY, opcion: '1h', desde: 1040, cicloBase: 0, cambios: {}, pausa: 1 } } }),
              accion: async (page) => { await page.getByRole('button', { name: 'Start block 2', exact: true }).click(); await page.waitForTimeout(1500); } },
  hoja:     { hora: T0900, soloMovil: true, semilla: (m) => base(m, { ritmo: { dia: { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } }),
              accion: async (page) => { await page.locator('[data-pace-ritmo-ver]').filter({ visible: true }).click(); await page.waitForTimeout(600); } },
};

/* Corre dentro de la página. Devuelve el informe de la celda. */
const MEDIR = () => {
  const vw = innerWidth, vh = innerHeight;
  const vis = (e) => { const r = e.getBoundingClientRect(); if (!(r.width > 0 && r.height > 0)) return false; const cs = getComputedStyle(e); return cs.visibility !== 'hidden' && cs.opacity !== '0'; };
  const conTexto = (raiz) => Array.from(raiz.querySelectorAll('*')).filter((e) => vis(e) && Array.from(e.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim()));
  const cruza = (a, b) => a.right > b.left + 0.5 && b.right > a.left + 0.5 && a.bottom > b.top + 0.5 && b.bottom > a.top + 0.5;
  const rotulo = (e) => (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28);
  const pares = (raiz) => {
    const els = conTexto(raiz).map((e) => ({ e, r: e.getBoundingClientRect() }));
    const out = [];
    for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
      if (els[i].e.contains(els[j].e) || els[j].e.contains(els[i].e)) continue;
      if (cruza(els[i].r, els[j].r)) out.push('«' + rotulo(els[i].e) + '» × «' + rotulo(els[j].e) + '»');
    }
    return out;
  };
  const recortes = (raiz) => conTexto(raiz).filter((e) => { const cs = getComputedStyle(e); return e.scrollWidth > e.clientWidth + 1 && cs.whiteSpace === 'nowrap' && cs.overflowX !== 'visible'; }).map(rotulo);
  const fuera = (raiz, caja) => conTexto(raiz).filter((e) => { const r = e.getBoundingClientRect(); return r.bottom > caja.bottom + 1 || r.right > caja.right + 1 || r.left < caja.left - 1; }).map(rotulo);
  const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find(vis);
  let scrollV = null;
  if (body) { const antes = body.scrollTop; body.scrollTop = 9999; scrollV = body.scrollTop; body.scrollTop = antes; }
  const panel = Array.from(document.querySelectorAll('[data-pace-ritmo-estado], [data-pace-ritmo-lista]')).find(vis);
  const sidebar = document.querySelector('[data-pace-sidebar]');
  const sbVisible = sidebar && vis(sidebar) && sidebar.getBoundingClientRect().left < vw && sidebar.getBoundingClientRect().right > 0;
  const modal = document.querySelector('[data-pace-modal-backdrop]');
  /* lo que asoma por la derecha (no lo que está entero fuera: los cajones) */
  /* (sin lo que vive dentro de un <svg>: el aro dibuja en un viewBox de 100 y sus <g> y <circle> miden lo que quieren) */
  const asoma = Array.from(document.body.querySelectorAll('*')).filter((e) => { if (!vis(e) || e.closest('svg')) return false; const r = e.getBoundingClientRect(); return r.left < vw - 1 && r.right > vw + 2 && r.width < vw * 3; }).slice(0, 6).map((e) => e.tagName.toLowerCase() + (e.getAttribute('data-pace-ritmo-estado') ? '[ritmo]' : '') + ' «' + rotulo(e) + '»');
  return {
    vw, vh, piel: getComputedStyle(document.documentElement).getPropertyValue('--pace-skin').trim(),
    scrollV, scrollH: document.documentElement.scrollWidth - vw, bodyScrollH: body ? body.scrollWidth - body.clientWidth : null,
    panel: panel ? { estado: panel.getAttribute('data-pace-ritmo-estado') || 'hoja', h: Math.round(panel.getBoundingClientRect().height), bottom: Math.round(panel.getBoundingClientRect().bottom),
      pares: pares(panel), recortes: recortes(panel), fuera: fuera(panel, panel.getBoundingClientRect()) } : null,
    sidebar: sbVisible ? { bottom: Math.round(sidebar.getBoundingClientRect().bottom), escalado: sidebar.getAttribute('data-escalado'), pares: pares(sidebar), recortes: recortes(sidebar) } : null,
    modal: modal ? { alto: Math.round(modal.scrollHeight), scroll: modal.scrollHeight - modal.clientHeight } : null,
    D: getComputedStyle(document.documentElement).getPropertyValue('--pace-timer-d').trim(),
    asoma,
  };
};

async function celda(b, w, h, movil, nombre, esc) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: movil, hasTouch: movil, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block' });
  await ctx.addInitScript((s) => localStorage.setItem('pace.state.v2', JSON.stringify(s)), esc.semilla(movil));
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errores.push('console: ' + m.text().slice(0, 160)); });
  await page.clock.install({ time: esc.hora });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(1500);
  if (esc.accion) await esc.accion(page);
  const m = await page.evaluate(MEDIR);
  m.errores = errores;
  await page.screenshot({ path: path.join(OUT, w + 'x' + h + '-' + nombre + '.png') });
  await ctx.close();
  return m;
}

(async () => {
  const b = await chromium.launch();
  const informe = {};
  const todos = ESCRITORIO.map(([w, h]) => [w, h, false]).concat(TELEFONO.map(([w, h]) => [w, h, true]));
  for (const [w, h, movil] of todos) {
    const id = w + 'x' + h;
    if (SOLO.length && !SOLO.includes(id)) continue;
    informe[id] = {};
    for (const nombre of Object.keys(ESCENAS)) {
      const esc = ESCENAS[nombre];
      if (esc.soloMovil && !movil) continue;
      let m;
      try { m = await celda(b, w, h, movil, nombre, esc); } catch (e) { m = { excepcion: String(e.message).slice(0, 200) }; }
      informe[id][nombre] = m;
      const avisos = [];
      if (m.excepcion) avisos.push('EXCEPCIÓN ' + m.excepcion);
      if (m.errores && m.errores.length) avisos.push('ERRORES ' + m.errores.join(' | '));
      if (m.scrollV > 1) avisos.push('scroll vertical ' + m.scrollV);
      if (m.scrollH > 0) avisos.push('scroll horizontal ' + m.scrollH);
      if (m.asoma && m.asoma.length) avisos.push('asoma por la derecha: ' + m.asoma.join(' · '));
      if (m.panel) {
        if (m.panel.pares.length) avisos.push('SE PISAN (panel): ' + m.panel.pares.join(' · '));
        if (m.panel.recortes.length) avisos.push('recortado (panel): ' + m.panel.recortes.join(' · '));
        if (m.panel.fuera.length) avisos.push('fuera del panel: ' + m.panel.fuera.join(' · '));
        if (m.panel.bottom > m.vh + 1 && !m.modal) avisos.push('el panel acaba por debajo del viewport (' + m.panel.bottom + ' > ' + m.vh + ')');
      }
      if (m.sidebar) {
        if (m.sidebar.pares.length) avisos.push('SE PISAN (barra lateral): ' + m.sidebar.pares.join(' · '));
        if (m.sidebar.recortes.length) avisos.push('recortado (barra lateral): ' + m.sidebar.recortes.join(' · '));
        if (m.sidebar.bottom > m.vh + 1) avisos.push('la barra lateral acaba por debajo del viewport (' + m.sidebar.bottom + ')');
      }
      console.log((id + ' ' + nombre).padEnd(22) + (m.piel || '') + '  D ' + (m.D || '-') + '  panel ' + (m.panel ? m.panel.estado + ' ' + m.panel.h : '-') + (avisos.length ? '\n    ⚠ ' + avisos.join('\n    ⚠ ') : ''));
    }
  }
  fs.writeFileSync(path.join(OUT, 'informe.json'), JSON.stringify(informe, null, 2));
  console.log('→ ' + OUT);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
