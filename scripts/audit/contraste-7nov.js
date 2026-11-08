/* PACE · EL MEDIDOR DE CONTRASTE (auditoría de accesibilidad del 7 nov. 2026)
 * ===========================================================================
 * Uso:
 *   node scripts/audit/contraste-7nov.js [puerto=8887] [salida.json]
 *   SOLO=pausa node scripts/audit/contraste-7nov.js …   (solo las pantallas cuyo nombre lo lleva)
 *
 * Levanta su propio servidor (.claude/static-server.js) en el puerto, abre el `index.html`
 * compilado a 360 y a 1280 px, en crema y en oscuro, llega a cada pantalla como lo haría
 * alguien y mide CADA texto visible contra el mínimo de WCAG 2.2 AA: 4,5 a 1, o 3 a 1 desde
 * 24 px (18,66 px en negrita).
 *
 * Cómo mide un texto: su color de `getComputedStyle` y, para el fondo, sube por los
 * antepasados componiendo cada fondo semitransparente y cada opacidad (la opacidad de un
 * antepasado mezcla su grupo entero con lo que tiene detrás, la letra y el fondo juntos). Lo
 * que pinta OTRA capa que no es antepasado (la luz del aro, un degradado de fondo) no entra:
 * se marca `img` cuando el fondo lleva imagen y eso se mira en las fotos.
 *
 * Además de los suspensos, apunta los textos en color de módulo (letra) y los botones con
 * relleno de color de módulo (relleno), aprueben o no: es la tabla del antes y el después de
 * las preguntas 2 y 3 de Ez. No es una prueba (no falla, apunta); lo que se vigila siempre
 * está en tests/contraste-modulos.spec.js.
 */
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const PUERTO = Number(process.argv[2] || 8887);
const SALIDA = process.argv[3] || null;
const BASE = 'http://localhost:' + PUERTO;
const CLAVE = 'pace.state.v2';
const NUEVE = new Date('2026-09-17T09:00:00+02:00');
const JORNADA = { fecha: '2026-09-17', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const PERFIL = { profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 } };
const MODULOS = ['breathe', 'move', 'extra', 'hydrate', 'achievement', 'premium'];

function semilla(paleta, extra) {
  return Object.assign({ firstSeen: 1, lang: 'es', langAuto: false, palette: paleta, soundOn: false,
    ritmo: { libre: true }, novedadesVistas: '*' }, extra || {});
}

const vis = (page, sel) => page.locator(sel).filter({ visible: true });
async function boton(page, nombre) {
  const b = page.getByRole('button', { name: nombre }).filter({ visible: true }).first();
  await b.click({ timeout: 5000 });
  await page.waitForTimeout(700);
}
async function abrirLibro(page, re) { await boton(page, re); }
async function antesDeEmpezar(page, re) {
  await abrirLibro(page, re);
  await vis(page, '.pace-lib [data-pace-lib-card] h4 button').first().click();
  await page.waitForTimeout(700);
}
/* La ventana de la pausa sale al acabar un bloque: el reloj salta a su final (tests/helpers.js). */
async function acabarBloque(page, boton) {
  await page.getByRole('button', { name: boton, exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(400);
  const fin = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
  await page.clock.fastForward(Math.max(0, fin - await page.evaluate(() => Date.now())) + 1000);
  await page.locator('[data-pace-break-shortcut]').first().waitFor({ state: 'attached', timeout: 15000 });
  await page.waitForTimeout(900);
}

/* Cada pantalla: semilla extra, si va solo en un ancho, cómo se llega y qué raíz se mide.
   La raíz de un diálogo es su fondo (`[data-pace-modal-backdrop]`, el de arriba): la tarjeta
   lleva fondo propio y lo de detrás no se cuela. */
const PANTALLAS = [
  { id: 'home', raiz: 'body' },
  { id: 'home a tu ritmo', extra: Object.assign({ ritmo: { dia: JORNADA } }, PERFIL), raiz: 'body' },
  { id: 'panel', solo: 360, raiz: '[data-pace-sidebar]', ir: (p) => boton(p, /^Abrir panel/) },
  { id: 'pausa libre', raiz: 'modal', ir: (p) => acabarBloque(p, 'Empezar foco') },
  { id: 'pausa a tu ritmo', extra: Object.assign({ ritmo: { dia: JORNADA } }, PERFIL), raiz: 'modal',
    ir: (p) => acabarBloque(p, 'Empezar jornada') },
  { id: 'respira', raiz: 'modal', ir: (p) => abrirLibro(p, /^Respira/) },
  { id: 'mueve', raiz: 'modal', ir: (p) => abrirLibro(p, /^Mueve/) },
  { id: 'estira', raiz: 'modal', ir: (p) => abrirLibro(p, /^Estira/) },
  { id: 'mueve · antes de empezar', raiz: 'modal', ir: (p) => antesDeEmpezar(p, /^Mueve/) },
  { id: 'estira · antes de empezar', raiz: 'modal', ir: (p) => antesDeEmpezar(p, /^Estira/) },
  { id: 'aviso de la apnea', raiz: 'modal', ir: async (p) => {
    await abrirLibro(p, /^Respira/);
    await vis(p, '.pace-lib [data-pace-lib-card="breathe.co2"] h4 button').first().click();
    await p.waitForTimeout(700);
  } },
  { id: 'sesión de respira', raiz: '[data-pace-session-root]', ir: async (p) => {
    await abrirLibro(p, /^Respira/);
    await vis(p, '.pace-lib [data-pace-lib-card="breathe.coherent.55"] h4 button').first().click();
    await p.waitForTimeout(1200);
  } },
  { id: 'hidrátate', raiz: 'modal', ir: (p) => boton(p, /^Hidrátate/) },
  { id: 'estadísticas · hoy', raiz: 'modal', ir: (p) => boton(p, /^Ver estadísticas/) },
  { id: 'estadísticas · semana', raiz: 'modal', ir: async (p) => {
    await boton(p, /^Ver estadísticas/);
    await p.locator('[data-pace-stats-tab="week"]').click();
    await p.waitForTimeout(500);
  } },
  { id: 'logros', raiz: 'modal', ir: (p) => boton(p, /^Ver logros/) },
  { id: 'ajustes', raiz: '[data-pace-tweaks-panel], [data-pace-modal-backdrop]', ir: (p) => boton(p, /^Abrir ajustes/) },
  { id: 'bienvenida', sinSemilla: true, raiz: 'body' },
  { id: '/premium/', ruta: '/premium/', raiz: 'body' },
  { id: '/beta/', ruta: '/beta/', raiz: 'body' },
];

/* ------------------------------------------------------------------ lo que corre en la página */
function medir({ raizSel, modulos }) {
  const sonda = document.createElement('i'); document.body.appendChild(sonda);
  const lienzo = document.createElement('canvas').getContext('2d');
  function rgba(txt) {
    if (!txt || txt === 'transparent') return [0, 0, 0, 0];
    let m = /^rgba?\(([^)]+)\)$/.exec(txt);
    if (m) { const v = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; }
    m = /^color\(srgb ([^)]+)\)$/.exec(txt);
    if (m) { const v = m[1].split(/[\s/]+/).filter(Boolean).map(Number); return [v[0] * 255, v[1] * 255, v[2] * 255, v.length > 3 ? v[3] : 1]; }
    lienzo.clearRect(0, 0, 1, 1); lienzo.fillStyle = txt; lienzo.fillRect(0, 0, 1, 1);
    const d = lienzo.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255];
  }
  function resolver(v) { sonda.style.color = ''; sonda.style.color = v; return rgba(getComputedStyle(sonda).color); }
  const raizCs = getComputedStyle(document.documentElement);
  const tokens = [];
  for (const m of modulos) for (const suf of ['', '-deep', '-2']) {
    const v = raizCs.getPropertyValue('--' + m + suf).trim();
    if (v) tokens.push({ nombre: m + suf, c: resolver(v) });
  }
  sonda.remove();
  const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
  const mismo = (a, b) => Math.abs(a[0] - b[0]) < 1.5 && Math.abs(a[1] - b[1]) < 1.5 && Math.abs(a[2] - b[2]) < 1.5;
  const token = (c) => { const t = tokens.find((k) => mismo(k.c, c)); return t ? t.nombre : null; };
  const sobre = (arriba, abajo) => { const a = arriba[3]; return [0, 1, 2].map((i) => arriba[i] * a + abajo[i] * (1 - a)).concat(1); };
  const mezcla = (de, a, t) => [0, 1, 2].map((i) => de[i] + (a[i] - de[i]) * t).concat(1);
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

  /* Pinta de arriba abajo: cada antepasado pone su fondo sobre lo de detrás y, si tiene
     opacidad, su grupo entero se mezcla con lo de detrás en esa proporción. */
  function pintar(cadena, i, detras, letra) {
    const e = cadena[i];
    const dentro = sobre(e.fondo, detras);
    const contenido = i === cadena.length - 1 ? (letra ? sobre(letra, dentro) : dentro) : pintar(cadena, i + 1, dentro, letra);
    return e.op < 1 ? mezcla(detras, contenido, e.op) : contenido;
  }

  const raices = [...document.querySelectorAll(raizSel === 'modal' ? '[data-pace-modal-backdrop]' : raizSel)]
    .filter((e) => e.getClientRects().length);
  const raiz = raizSel === 'modal' ? raices[raices.length - 1] : raices[0];
  if (!raiz) return { error: 'sin raíz: ' + raizSel };
  const W = innerWidth;
  const vistos = new Set(); const items = [];
  const andador = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  for (let n = andador.nextNode(); n; n = andador.nextNode()) {
    const txt = n.textContent.replace(/\s+/g, ' ').trim();
    if (!txt) continue;
    const el = n.parentElement;
    if (!el || vistos.has(el) || el.closest('svg, script, style, noscript, title')) continue;
    vistos.add(el);
    const cs = getComputedStyle(el);
    if (cs.visibility !== 'visible' || !el.getClientRects().length) continue;
    const rango = document.createRange(); rango.selectNodeContents(n);
    const r = rango.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.right < 0 || r.left > W) continue;
    const cadena = []; let imagen = false; let relleno = null; let op = 1;
    for (let e = el; e; e = e.parentElement) {
      const s = e === el ? cs : getComputedStyle(e);
      const fondo = rgba(s.backgroundColor);
      if (s.backgroundImage && s.backgroundImage !== 'none' && !/^url/.test(s.backgroundImage)) imagen = true;
      if (!relleno && fondo[3] >= 0.9) relleno = { e, c: fondo };
      op *= Number(s.opacity);
      cadena.unshift({ fondo, op: Number(s.opacity) });
    }
    if (op < 0.02) continue;
    const letra = rgba(cs.color);
    const blanco = [255, 255, 255, 1];
    const fg = pintar(cadena, 0, blanco, letra), bg = pintar(cadena, 0, blanco, null);
    const px = parseFloat(cs.fontSize), peso = Number(cs.fontWeight) || 400;
    const grande = px >= 24 || (px >= 18.66 && peso >= 700);
    const modLetra = token(letra);
    const modRelleno = relleno && token(relleno.c) && /^(BUTTON|A)$/.test((relleno.e.closest('button, a') || {}).tagName || '') ? token(relleno.c) : null;
    const camino = []; for (let e = el; e && e !== raiz && camino.length < 4; e = e.parentElement) {
      const d = [...e.attributes].map((a) => a.name).find((a) => a.startsWith('data-pace'));
      camino.unshift(e.tagName.toLowerCase() + (d ? '[' + d + ']' : e.classList[0] ? '.' + e.classList[0] : ''));
    }
    items.push({ t: txt.slice(0, 48), r: Math.round(ratio(fg, bg) * 100) / 100, min: grande ? 3 : 4.5, px: Math.round(px * 10) / 10, peso,
      letra: hex(letra) + (letra[3] < 1 ? '@' + Math.round(letra[3] * 100) : ''), fondo: hex(bg), op: Math.round(op * 100) / 100,
      modLetra, modRelleno, img: imagen, donde: camino.join(' > ') });
  }
  return { items };
}

/* ------------------------------------------------------------------ el recorrido */
async function servidor() {
  try { const r = await fetch(BASE + '/index.html', { method: 'HEAD' }); if (r.ok) throw new Error('el puerto ' + PUERTO + ' ya está ocupado'); }
  catch (e) { if (/ocupado/.test(e.message)) throw e; }
  const srv = spawn(process.execPath, ['.claude/static-server.js'], {
    cwd: path.resolve(__dirname, '..', '..'), env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(BASE + '/index.html', { method: 'HEAD' }); if (r.ok) return srv; } catch (e) {}
    await new Promise((r) => setTimeout(r, 250));
  }
  srv.kill(); throw new Error('el servidor no arrancó');
}

async function pantalla(navegador, p, ancho, paleta) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: ancho < 768 ? 760 : 800 },
    locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: paleta === 'oscuro' ? 'dark' : 'light' });
  if (!p.sinSemilla && !p.ruta) {
    await ctx.addInitScript(([k, v]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(v)); },
      [CLAVE, semilla(paleta, p.extra)]);
  }
  const page = await ctx.newPage();
  try {
    await page.clock.install({ time: NUEVE });
    await page.goto(BASE + (p.ruta || '/index.html'));
    if (!p.sinSemilla && !p.ruta) await page.locator('[data-pace-dial-number]').first().waitFor({ timeout: 15000 });
    await page.waitForTimeout(900);
    if (p.ir) await p.ir(page);
    await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))));
    await page.waitForTimeout(300);
    return await page.evaluate(medir, { raizSel: p.raiz, modulos: MODULOS });
  } catch (e) {
    return { error: e.message.split('\n')[0] };
  } finally { await ctx.close(); }
}

(async () => {
  const srv = await servidor();
  const navegador = await chromium.launch();
  const todo = [];
  try {
    for (const ancho of [360, 1280]) for (const paleta of ['crema', 'oscuro']) for (const p of PANTALLAS) {
      if (p.solo && p.solo !== ancho) continue;
      if (process.env.SOLO && !p.id.includes(process.env.SOLO)) continue;
      const r = await pantalla(navegador, p, ancho, paleta);
      todo.push(Object.assign({ pantalla: p.id, ancho, paleta }, r));
      const items = r.items || [];
      const malos = items.filter((i) => i.r < i.min);
      process.stderr.write(`${ancho} ${paleta.padEnd(6)} ${p.id.padEnd(26)} ${r.error ? 'ERROR ' + r.error : items.length + ' textos, ' + malos.length + ' por debajo'}\n`);
    }
  } finally { await navegador.close(); srv.kill(); }
  const json = JSON.stringify(todo, null, 1);
  if (SALIDA) fs.writeFileSync(SALIDA, json); else process.stdout.write(json);
})().catch((e) => { console.error(e); process.exit(1); });
