/* PACE · MAQUETA «la línea sigue al aro» (s193, ronda 1)
 * =======================================================
 * El usuario, con «A tu ritmo» servido y sin llegar a acabar un pomodoro, no
 * entendía cómo se enlaza el aro con la línea, las pausas y los ejercicios. Y el
 * código confirma un hueco: al terminar un bloque la línea salta al siguiente y la
 * pausa que toca AHORA ya se pinta como pasada (RitmoLinea: `i < iActual`).
 *
 * Regla de s173/s174 y de s191: se PINTA antes de preguntar, y lo que existe se
 * CALCA de la app. Así que esto abre `index.html` con el reloj fijado a un jueves a
 * las 9:00, siembra la jornada entera y fotografía la home real en cada estado —
 * antes de empezar · bloque corriendo · bloque acabado · bloque 2 empezado —, dos
 * veces: «hoy» tal cual, y «propuesta» con la hoja y el DOM de la propuesta
 * inyectados encima (lo que, si se aprueba, se porta a ritmo.css.jsx y a
 * RitmoLinea/RitmoPanel). Sale `docs/proposals/la-linea-sigue-al-aro-r1.html`,
 * autocontenida (PNG en data:).
 *
 * LA PÁGINA ES FLUIDA (segunda tirada): la primera clavaba las fotos a 1280 px y
 * en el panel del usuario se veían cortadas. Ahora lo que se compara son RECORTES
 * del panel (con `sharp`) que se adaptan al ancho, y las pantallas enteras van a
 * tamaño real bajo un desplegable con scroll horizontal.
 *
 * Uso: node .claude/static-server.js   (aparte, puerto 8765)
 *      node scripts/audit/pausa-s193.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));

const BASE = process.env.PACE_BASE || 'http://localhost:8765';
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'la-linea-sigue-al-aro-r1.html');
/* CON OFFSET (trampa de s192): Node calcula el instante en el huso del runner. */
const NUEVE = new Date('2026-09-17T09:00:00+02:00');
const VIEWPORTS = [
  { id: 'e1280', w: 1280, h: 879, nota: 'escritorio 1280×879',
    recortes: { panel: { left: 300, top: 540, width: 980, height: 290 }, lateral: { left: 8, top: 430, width: 270, height: 140 } } },
  { id: 'm412', w: 412, h: 844, nota: 'móvil 412×844',
    recortes: { panel: { left: 0, top: 540, width: 412, height: 304 } } },
];
const semilla = (movil) => ({
  firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', sidebarCollapsed: movil,
  profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 },
  ritmo: { dia: { fecha: '2026-09-17', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } },
});

/* LA HOJA DE LA PROPUESTA. Lo que iría a ritmo.css.jsx. Dos variantes del tramo
   de ahora: A · encendido al 35 % y relleno verde · B · verde entero como hoy y
   relleno más oscuro. */
const CSS_BASE = `
.pace-rt-seg.pace-rt-ahora::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; border-radius: 2px;
  width: calc(var(--pace-bloque, 0) * 100%); }
/* 2 · la parada de AHORA: borde entero del módulo, lavado, y la etiqueta encima */
.pace-rt-nodo.pace-rt-ahora { border: 1.5px solid var(--c); background: color-mix(in srgb, var(--c) 14%, var(--paper)); }
.pace-rt-nodo .pace-rt-ahora-tag { left: 50%; transform: translateX(-50%); bottom: 27px; color: var(--c); }
.pace-rt-mini .pace-rt-punto.pace-rt-ahora { background: var(--c); }
/* 3 · la frase, hasta que acabe el primer bloque */
.pace-rt-como { margin-top: 5px; }
`;
const CSS_VARIANTE = {
  a: `.pace-rt-seg.pace-rt-ahora { background: color-mix(in srgb, var(--focus) 35%, var(--paper-3)); }
.pace-rt-seg.pace-rt-ahora::after { background: var(--focus); }`,
  b: `.pace-rt-seg.pace-rt-ahora { background: var(--focus); }
.pace-rt-seg.pace-rt-ahora::after { background: var(--focus-2); }`,
};

const FRASE = 'Cada bloque es un pomodoro en el aro; al acabar, te sirvo la pausa que toca.';

/* Corre DENTRO de la página. `estado`: 0 antes · 1 corriendo · 2 pausa abierta · 3 bloque 2. */
function aplicar(arg) {
  const { estado, css, frase, fraccion, conFrase } = arg;
  let s = document.getElementById('pace-s193');
  if (!s) { s = document.createElement('style'); s.id = 'pace-s193'; document.head.appendChild(s); }
  s.textContent = css;
  s.disabled = false;
  const home = document.querySelector('[data-pace-home-body]');
  home.style.setProperty('--pace-bloque', String(fraccion || 0));
  const visible = (sel) => Array.from(document.querySelectorAll(sel)).filter((e) => e.offsetParent);
  const marcar = (e) => { e.setAttribute('data-s193', '1'); return e; };
  if (estado <= 1 && conFrase) {
    /* 3 · la frase, en las dos pieles (solo la visible importa para la foto) */
    visible('.pace-rt-panel[data-pace-ritmo-estado="menu"] > .pace-rt-cab').forEach((cab) => {
      const d = marcar(document.createElement('div'));
      d.className = 'pace-rt-sub pace-rt-como';
      d.textContent = frase;
      cab.insertAdjacentElement('afterend', d);
    });
  }
  if (estado !== 2) return;

  /* 2 · escritorio: la parada tras el bloque hecho es AHORA; el bloque 2 se apaga */
  const linea = visible('[data-pace-ritmo-linea]')[0];
  if (linea) {
    const seg = linea.querySelector('.pace-rt-seg.pace-rt-ahora');
    const tag = seg && seg.querySelector('.pace-rt-ahora-tag');
    if (tag) { tag.style.display = 'none'; tag.setAttribute('data-s193-oculto', '1'); }
    if (seg) { seg.classList.remove('pace-rt-ahora'); seg.setAttribute('data-s193-seg', '1'); }
    const nodo = linea.querySelector('.pace-rt-nodo.pace-rt-pasado');
    if (nodo) {
      nodo.classList.remove('pace-rt-pasado'); nodo.classList.add('pace-rt-ahora', 'pace-rt-toca');
      nodo.disabled = false; nodo.setAttribute('data-s193-nodo', '1');
      const t = marcar(document.createElement('span')); t.className = 'pace-rt-ahora-tag'; t.textContent = 'Ahora';
      nodo.insertBefore(t, nodo.firstChild);
    }
  }
  /* móvil: la mini línea */
  const mini = visible('.pace-rt-mini')[0];
  if (mini) {
    const seg = mini.querySelector('.pace-rt-seg.pace-rt-ahora');
    if (seg) { seg.classList.remove('pace-rt-ahora'); seg.setAttribute('data-s193-seg', '1'); }
    const punto = mini.querySelector('.pace-rt-punto');
    if (punto) { punto.classList.add('pace-rt-ahora'); punto.setAttribute('data-s193-nodo', '1'); }
  }
  /* LO QUE DIRÍA EL PLAN con la pausa abierta: la parada tras el bloque hecho,
     leída del plan real (nombres del catálogo vivo, que rotan por día). */
  const p = ritmoPlan(getState());
  const abierta = ritmoDetras(p.m, p.m.focos[p.hechos - 1]);
  const siguiente = ritmoDetras(p.m, p.actual);
  const MOD = { estira: 'Estira', mueve: 'Mueve', respira: 'Respira', cierre: 'Respira' };
  const MOTIVO = { estira: 'Antídoto a la silla', mueve: 'Cuerpo activo', cierre: 'Para cerrar la jornada' };
  const plato = abierta.platos[0], plato2 = siguiente.platos[0];
  const metaDe = (it, pl) => it.larga ? 'Pausa larga · ' + it.dur + ' min · Respira y Estira'
    : pl.min + ' min · ' + MOD[pl.modulo] + ' · ' + MOTIVO[pl.modulo];
  /* móvil: la fila «Ahora» pasa a ser la pausa abierta (con «Otra») y «Luego» el bloque */
  const filas = visible('.pace-rt-mov .pace-rt-fila');
  if (filas.length === 2) {
    const a = filas[0], b = filas[1];
    const ha = a.innerHTML, hb = b.innerHTML;
    a.setAttribute('data-s193-html', ha); b.setAttribute('data-s193-html', hb);
    a.innerHTML = hb; b.innerHTML = ha.replace('Ahora<br>', 'Luego<br>');
    a.querySelector('.pace-rt-meta').innerHTML = 'Ahora<br>' + ritmoHora(abierta.desde);
    const n = a.querySelector('.pace-rt-que .pace-rt-n');
    const nodo = document.querySelector('.pace-rt-esc [data-pace-ritmo-linea] .pace-rt-nodo');
    const g = nodo ? nodo.querySelector('.pace-rt-g').cloneNode(true) : null;
    n.textContent = plato.name;
    if (g) { g.style.setProperty('--c', nodo.style.getPropertyValue('--c')); n.insertBefore(g, n.firstChild); }
    const m = a.querySelector('.pace-rt-que .pace-rt-m');
    const gota = m.querySelector('.pace-rt-gota');
    m.textContent = metaDe(abierta, plato);
    if (gota && abierta.agua) m.appendChild(gota);
  }
  /* la barra lateral: «Tu pausa» y el plato de la pausa abierta, no el de la siguiente */
  const hojas = Array.from(document.querySelectorAll('[data-pace-sidebar] *')).filter((e) => e.children.length === 0 && e.offsetParent);
  const cambia = (prueba, txt) => hojas.filter((e) => prueba(e.textContent || '')).forEach((e) => {
    e.setAttribute('data-s193-txt', e.textContent); e.textContent = txt;
  });
  cambia((t) => /^Siguiente pausa · /.test(t), 'Tu pausa · ' + ritmoHora(abierta.desde));
  cambia((t) => t === plato2.name, plato.name);
  cambia((t) => t === plato2.min + ' min · ' + MOD[plato2.modulo], plato.min + ' min · ' + MOD[plato.modulo]);
}

function deshacer() {
  const s = document.getElementById('pace-s193');
  if (s) s.disabled = true;
  document.querySelector('[data-pace-home-body]').style.removeProperty('--pace-bloque');
  document.querySelectorAll('[data-s193]').forEach((e) => e.remove());
  document.querySelectorAll('[data-s193-oculto]').forEach((e) => { e.style.display = ''; e.removeAttribute('data-s193-oculto'); });
  document.querySelectorAll('[data-s193-seg]').forEach((e) => { e.classList.add('pace-rt-ahora'); e.removeAttribute('data-s193-seg'); });
  document.querySelectorAll('[data-s193-nodo]').forEach((e) => {
    e.classList.remove('pace-rt-ahora');
    if (e.classList.contains('pace-rt-nodo')) { e.classList.add('pace-rt-pasado'); e.classList.remove('pace-rt-toca'); e.disabled = true; }
    e.removeAttribute('data-s193-nodo');
  });
  document.querySelectorAll('[data-s193-html]').forEach((e) => { e.innerHTML = e.getAttribute('data-s193-html'); e.removeAttribute('data-s193-html'); });
  document.querySelectorAll('[data-s193-txt]').forEach((e) => { e.textContent = e.getAttribute('data-s193-txt'); e.removeAttribute('data-s193-txt'); });
}

const uri = (buf) => 'data:image/png;base64,' + buf.toString('base64');

async function foto(page, vp, fotos, id) {
  await page.waitForTimeout(150);
  const png = await page.screenshot({ type: 'png' });
  const f = { id, entera: uri(png), rec: {} };
  for (const k of Object.keys(vp.recortes)) {
    const r = vp.recortes[k];
    f.rec[k] = { w: r.width, uri: uri(await sharp(png).extract(r).png().toBuffer()) };
  }
  fotos[id] = f;
  console.log('  foto ' + id.padEnd(10) + Math.round(png.length / 1024) + ' KB');
}

async function avanzarHastaLaPausa(page) {
  for (let i = 0; i < 60; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
    if (await page.locator('[data-pace-break-shortcut]').count()) return true;
  }
  return false;
}

async function recorrer(browser, vp) {
  const movil = vp.w <= 640;
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, isMobile: movil, hasTouch: movil });
  await ctx.addInitScript((s) => localStorage.setItem('pace.state.v2', JSON.stringify(s)), semilla(movil));
  const page = await ctx.newPage();
  await page.clock.install({ time: NUEVE });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(1800);
  const fotos = {};
  const cta = () => page.locator('[data-pace-cta]').filter({ visible: true }).first();
  const con = async (estado, fraccion, variante, conFrase) => {
    await page.evaluate(aplicar, { estado, css: CSS_BASE + CSS_VARIANTE[variante || 'a'], frase: FRASE, fraccion, conFrase: conFrase !== false });
  };
  const sin = async () => { await page.evaluate(deshacer); };

  /* 0 · antes de empezar */
  await foto(page, vp, fotos, 'hoy-0');
  await con(0, 0, 'a'); await foto(page, vp, fotos, 'a-0'); await sin();
  await con(0, 0, 'b', false); await foto(page, vp, fotos, 'b-0'); await sin();

  /* 1 · bloque corriendo, minuto 12 de 45 */
  await cta().click();
  await page.waitForTimeout(250);
  await page.clock.fastForward(12 * 60 * 1000);
  await page.waitForTimeout(200);
  await foto(page, vp, fotos, 'hoy-1');
  await con(1, 12 / 45, 'a'); await foto(page, vp, fotos, 'a-1'); await sin();
  await con(1, 12 / 45, 'b', false); await foto(page, vp, fotos, 'b-1'); await sin();

  /* 2 · el bloque acaba: la pausa propone, y detrás la línea */
  const abierto = await avanzarHastaLaPausa(page);
  if (!abierto) throw new Error('la pausa no se abrió en ' + vp.id);
  await page.waitForTimeout(400);
  await foto(page, vp, fotos, 'menu');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await foto(page, vp, fotos, 'hoy-2');
  await con(2, 0, 'a'); await foto(page, vp, fotos, 'a-2'); await sin();

  /* 3 · empieza el bloque 2: la pausa queda atrás */
  await cta().click();
  await page.waitForTimeout(250);
  await page.clock.fastForward(3 * 60 * 1000);
  await page.waitForTimeout(200);
  await con(3, 3 / 45, 'a'); await foto(page, vp, fotos, 'a-3'); await sin();

  await ctx.close();
  return fotos;
}

/* ------------------------------------------------------------------ la página */
function pagina(F) {
  const E = F.e1280, M = F.m412;
  const rec = (f, k, pie) => `<figure><figcaption>${pie}</figcaption><img src="${f.rec[k].uri}" style="max-width:min(100%, ${f.rec[k].w}px)" alt=""></figure>`;
  /* una comparación: escritorio (recorte del panel) + móvil (recorte del panel), «hoy» y «propuesta» */
  const par = (idHoy, idProp, pieHoy, pieProp) => `
    <div class="par">
      <div class="lado"><div class="ceja">Hoy</div>${rec(E[idHoy], 'panel', pieHoy)}${rec(M[idHoy], 'panel', 'Móvil')}</div>
      <div class="lado prop"><div class="ceja">Propuesta</div>${rec(E[idProp], 'panel', pieProp)}${rec(M[idProp], 'panel', 'Móvil')}</div>
    </div>`;
  const entera = (id, pie) => `
    <figure class="entera"><figcaption>${pie}</figcaption>
      <div class="scroll"><img src="${E[id].entera}" width="1280" alt=""></div>
      <div class="scroll"><img src="${M[id].entera}" width="412" alt=""></div>
    </figure>`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>La línea sigue al aro · ronda 1</title>
<style>
  :root { --paper: #F2EDE0; --paper-2: #EAE4D4; --paper-3: #DFD8C4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #8A8372; --line: #C9C0A8;
    --focus: #3E5A3A; --focus-2: #2A3E27; --focus-cta: #50624D; --focus-soft: rgba(62,90,58,0.10); --extra: #6B7A8F; --breathe: #C97A5D; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font-family: 'Inter Tight', system-ui, sans-serif; font-size: 15px; line-height: 1.5; }
  main { max-width: 1100px; margin: 0 auto; padding: 32px 20px 80px; }
  h1, h2, h3 { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-weight: 500; }
  h1 { font-size: 40px; margin: 6px 0 12px; line-height: 1.05; }
  h2 { font-size: 28px; margin: 52px 0 6px; line-height: 1.1; }
  h3 { font-size: 20px; margin: 26px 0 4px; }
  p, li { max-width: 78ch; color: var(--ink-2); }
  .ceja { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 8px; }
  .prop .ceja { color: var(--focus-cta); }
  figure { margin: 0 0 14px; }
  figcaption { font-size: 12px; color: var(--ink-3); margin-bottom: 5px; }
  img { display: block; width: 100%; max-width: 100%; height: auto; border: 1px solid var(--line); border-radius: 8px; background: var(--paper-2); }
  figure, .lado, .opcion { min-width: 0; max-width: 100%; }
  .par { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px; margin-top: 10px; }
  .lado { border: 1px solid var(--line); border-radius: 12px; padding: 12px 12px 4px; background: var(--paper); min-width: 0; }
  .lado.prop { border-color: var(--focus-cta); background: var(--focus-soft); }
  @media (max-width: 860px) { .par { grid-template-columns: 1fr; } }
  .scroll { overflow-x: auto; margin-bottom: 10px; }
  .scroll img { width: auto; max-width: none; }
  details { margin-top: 10px; }
  summary { cursor: pointer; font-size: 13px; color: var(--ink-3); }
  /* el esquema de cómo se enlazan las piezas */
  .flujo { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 14px 0 4px; }
  .paso { border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; background: var(--paper); font-size: 13px; color: var(--ink-2); position: relative; }
  .paso b.t { display: block; font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-weight: 500; font-size: 17px; color: var(--ink); margin-bottom: 2px; }
  .paso i.n { position: absolute; top: -9px; left: 10px; font-style: normal; font-size: 10px; letter-spacing: 0.12em; background: var(--paper); padding: 0 5px; color: var(--ink-3); }
  @media (max-width: 860px) { .flujo { grid-template-columns: 1fr 1fr; } }
  /* las dos formas de cerrar la pausa, como una línea */
  .cierre { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px; margin-top: 10px; }
  @media (max-width: 860px) { .cierre { grid-template-columns: 1fr; } }
  .opcion { border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; background: var(--paper); }
  .opcion.rec { border-color: var(--focus-cta); background: var(--focus-soft); }
  .opcion b.t { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-weight: 500; font-size: 19px; display: block; color: var(--ink); }
  .opcion p { font-size: 14px; margin: 6px 0 0; }
  .sello { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--focus-cta); }
  .tira { display: flex; align-items: center; gap: 0; margin: 12px 0 6px; height: 28px; }
  .tira .t { height: 4px; border-radius: 2px; background: var(--paper-3); position: relative; }
  .tira .t.h { background: color-mix(in srgb, var(--focus) 35%, var(--paper-3)); }
  .tira .t.on { background: var(--focus); }
  .tira .p { width: 22px; height: 22px; border-radius: 50%; border: 1px solid color-mix(in srgb, var(--extra) 50%, transparent); background: var(--paper); margin: 0 3px; flex: 0 0 auto; position: relative; }
  .tira .p.on { border: 1.5px solid var(--extra); background: color-mix(in srgb, var(--extra) 14%, var(--paper)); }
  .tira .p.off { opacity: 0.45; }
  .tira .tag { position: absolute; left: 50%; transform: translateX(-50%); bottom: 24px; font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--extra); white-space: nowrap; }
  .tira .t .tag { left: 30px; transform: none; bottom: 12px; color: var(--focus); }
  .pie { font-size: 12px; color: var(--ink-3); }
  .decide { border-top: 1px solid var(--line); padding-top: 6px; margin-top: 30px; }
  .decide li { margin-bottom: 8px; }
  code { font-size: 13px; background: var(--paper-2); padding: 1px 5px; border-radius: 4px; }
  kbd { font: inherit; font-size: 12px; border: 1px solid var(--line); border-radius: 6px; padding: 1px 7px; color: var(--ink-2); background: var(--paper); }
</style>
</head>
<body>
<main>
  <div class="ceja">PACE · maqueta · s193 · ronda 1</div>
  <h1>La línea sigue al aro</h1>
  <p>Con «A tu ritmo» servido no se entiende cómo se enlaza el aro con la línea, las pausas y los ejercicios. Y leyendo el
  código, no es sólo cosa de explicarlo: <b>hoy la línea no se entera de nada hasta que el bloque acaba, y entonces salta
  al siguiente y pinta como pasada la pausa que toca ahora</b>. Esta página explica cómo funciona hoy, propone tres
  cambios —cada uno «hoy» frente a «propuesta», fotografiado sobre la app real con el reloj fijado a un jueves a las 9:00—
  y deja al final lo que hay que decidir.</p>

  <h2>Cómo se enlazan hoy las piezas</h2>
  <div class="flujo">
    <div class="paso"><i class="n">1</i><b class="t">Eliges cuánto trabajas</b>La regla compone el día: bloques de foco y, entre ellos, pausas con plato del catálogo. Se guarda el contador de pomodoros de ese momento.</div>
    <div class="paso"><i class="n">2</i><b class="t">El aro ES el bloque</b>Mide los minutos del bloque que toca y dice «Bloque 1 de 9». El botón verde es el pomodoro de siempre, con otro rótulo.</div>
    <div class="paso"><i class="n">3</i><b class="t">Acaba el pomodoro</b>Sube el contador y se abre la pausa, que propone <em>el plato que el menú sirve detrás de ese bloque</em>. «Empezar» abre esa rutina directamente.</div>
    <div class="paso"><i class="n">4</i><b class="t">La línea avanza</b>Bloques hechos = contador − el de partida. La línea pinta el hecho al 35 %, y AHORA salta al siguiente… <b>pasando por encima de la pausa</b>.</div>
  </div>
  <p class="pie">Lo que no existe: la pausa como estado. Ni la línea dice «ahora estás en la pausa», ni la rutina hecha o saltada cambia nada, ni la línea se mueve mientras el aro cuenta.</p>

  <h2>1 · El tramo de ahora se rellena con el pomodoro</h2>
  <p>Al pulsar «Empezar jornada», el tramo del bloque 1 empieza a llenarse de verde al ritmo del aro. Es la respuesta más
  directa a «¿cómo se enlaza?»: pulsas y la línea se mueve contigo. Técnicamente es una variable más de la luz de la
  home (<code>--pace-bloque</code>, publicada junto a <code>--pace-k</code>), sin re-renderizar nada.</p>
  ${par('hoy-1', 'a-1', 'Escritorio · minuto 12 de 45, y la línea igual que antes de pulsar', 'Escritorio · el tramo lleva 12 de 45')}

  <h3>Decisión 1 · el tramo de ahora antes de empezar</h3>
  <p><b>A · encendido y vacío</b>: el tramo de ahora está al 35 % antes de empezar y el relleno verde crece desde cero. El verde entero
  se reserva para lo que corre. <b>B · verde entero como hoy</b>, y el avance es un tono más oscuro encima.</p>
  <div class="par">
    <div class="lado prop"><div class="ceja">A · encendido y vacío</div>${rec(E['a-0'], 'panel', 'Antes de empezar')}${rec(E['a-1'], 'panel', 'Minuto 12 de 45')}</div>
    <div class="lado"><div class="ceja">B · verde entero</div>${rec(E['b-0'], 'panel', 'Antes de empezar (como hoy)')}${rec(E['b-1'], 'panel', 'Minuto 12 de 45')}</div>
  </div>

  <h2>2 · Al acabar el bloque, «Ahora» es la pausa</h2>
  <p>Esto ya pasa y no cambia: al acabar, la pausa propone el plato del menú con su motivo.</p>
  <figure><figcaption>Escritorio · la pausa al acabar el bloque 1 (real, sin tocar)</figcaption><img src="${E.menu.entera}" alt=""></figure>
  <p>Lo que cambia es lo que hay <b>detrás</b>. Hoy la línea ya está en el bloque 2 y la parada que toca ahora está
  atenuada, como si hubiera pasado. En la propuesta, AHORA es la parada: lleva la etiqueta y el borde entero de su
  módulo, el bloque 1 queda hecho y el bloque 2 <em>no se enciende</em> hasta que pulses «Empezar bloque 2». En móvil la
  fila «Ahora» es la pausa (con su «Otra») y «Luego» el bloque. Tocar la parada de ahora la empezaría, por la misma
  puerta que la propuesta.</p>
  ${par('hoy-2', 'a-2', 'Escritorio · detrás de la pausa: AHORA ya en el bloque 2, la parada de 9:45 atenuada', 'Escritorio · AHORA es la parada; el bloque 2 apagado')}
  <div class="par">
    <div class="lado"><div class="ceja">Hoy · barra lateral</div>${rec(E['hoy-2'], 'lateral', 'Anuncia la SIGUIENTE pausa (10:35) mientras te toca la de 9:45')}</div>
    <div class="lado prop"><div class="ceja">Propuesta · barra lateral</div>${rec(E['a-2'], 'lateral', '«Tu pausa · 9:45» con su plato')}</div>
  </div>
  <p>Y al pulsar «Empezar bloque 2», la pausa queda atrás y el tramo 2 empieza a llenarse:</p>
  ${rec(E['a-3'], 'panel', 'Escritorio · bloque 2 en el minuto 3')}

  <h3>Decisión 2 · qué cierra la pausa</h3>
  <div class="cierre">
    <div class="opcion rec"><span class="sello">A · recomendada</span><b class="t">Empezar el bloque siguiente</b>
      <div class="tira"><div class="t h" style="flex:45"></div><div class="p on"><span class="tag">Ahora</span></div><div class="t" style="flex:45"></div><div class="p"></div><div class="t" style="flex:45"></div></div>
      <div class="tira"><div class="t h" style="flex:45"></div><div class="p off"></div><div class="t on" style="flex:45"><span class="tag">Ahora</span></div><div class="p"></div><div class="t" style="flex:45"></div></div>
      <p>La pausa está abierta desde que acaba el bloque hasta que pulsas «Empezar bloque 2», hagas la rutina o la saltes.
      Simple, sin estado nuevo que pueda quedarse colgado, y no castiga saltarla: el menú propone, no obliga.</p></div>
    <div class="opcion"><span class="sello">B</span><b class="t">Terminar la rutina propuesta</b>
      <div class="tira"><div class="t h" style="flex:45"></div><div class="p on"><span class="tag">Ahora</span></div><div class="t" style="flex:45"></div><div class="p"></div><div class="t" style="flex:45"></div></div>
      <div class="tira"><div class="t h" style="flex:45"></div><div class="p" style="border-color:var(--extra)"><span class="tag">Hecha</span></div><div class="t h" style="flex:45"><span class="tag">Ahora</span></div><div class="p"></div><div class="t" style="flex:45"></div></div>
      <p>La pausa se cierra al completar la sesión, y la parada queda marcada como hecha (no sólo pasada). Si la saltas, sigue
      abierta hasta que empieces el bloque. Cuenta más, pero pide distinguir «hecha» de «saltada» en la línea y en Stats.</p></div>
  </div>

  <h2>3 · Una frase la primera vez</h2>
  <p>Bajo la cabecera del panel, sólo hasta que acabe el primer bloque del día. Después desaparece: ya lo has visto pasar.
  Alternativa: «El aro lleva el bloque; cuando acabe, te propongo la pausa que toca.»</p>
  ${par('hoy-0', 'a-0', 'Escritorio · antes de empezar', 'Escritorio · la frase bajo la cabecera')}

  <div class="decide">
    <h2>Lo que hay que decidir</h2>
    <ul>
      <li><b>Qué se aplica</b>: 1 (la línea sigue al aro) · 2 (la pausa existe) · 3 (la frase). Se pueden coger las tres o menos.</li>
      <li><b>Decisión 1</b> · el tramo antes de empezar: <kbd>A</kbd> encendido y vacío · <kbd>B</kbd> verde entero como hoy.</li>
      <li><b>Decisión 2</b> · qué cierra la pausa: <kbd>A</kbd> empezar el bloque siguiente · <kbd>B</kbd> terminar la rutina.</li>
      <li><b>La barra lateral</b>: «Tu pausa · 9:45» mientras está abierta, o dejar «Siguiente pausa».</li>
      <li><b>La frase</b>: ésta, la alternativa, u otra.</li>
    </ul>
    <p class="pie">Basta con contestar, por ejemplo: «1, 2 y 3 · 1A · 2A · Tu pausa · la frase tal cual».</p>
  </div>

  <h2>Las pantallas enteras, a tamaño real</h2>
  <p class="pie">Con scroll horizontal cuando no caben. Escritorio 1280×879 y móvil 412×844, en ese orden.</p>
  <details><summary>0 · Antes de empezar — hoy</summary>${entera('hoy-0', 'Hoy')}</details>
  <details><summary>0 · Antes de empezar — propuesta (A, con la frase)</summary>${entera('a-0', 'Propuesta')}</details>
  <details><summary>1 · Bloque 1 corriendo — hoy</summary>${entera('hoy-1', 'Hoy')}</details>
  <details><summary>1 · Bloque 1 corriendo — propuesta (A)</summary>${entera('a-1', 'Propuesta')}</details>
  <details><summary>1 · Bloque 1 corriendo — variante B</summary>${entera('b-1', 'Variante B')}</details>
  <details><summary>2 · El bloque acaba — la pausa propone (real)</summary>${entera('menu', 'Real')}</details>
  <details><summary>2 · El bloque acaba — hoy, detrás</summary>${entera('hoy-2', 'Hoy')}</details>
  <details><summary>2 · El bloque acaba — propuesta</summary>${entera('a-2', 'Propuesta')}</details>
  <details><summary>3 · Empieza el bloque 2 — propuesta</summary>${entera('a-3', 'Propuesta')}</details>
</main>
</body>
</html>
`;
}

(async () => {
  const b = await chromium.launch();
  const F = {};
  for (const vp of VIEWPORTS) {
    console.log(vp.id + ' · ' + vp.w + '×' + vp.h);
    F[vp.id] = await recorrer(b, vp);
  }
  await b.close();
  fs.writeFileSync(SALIDA, pagina(F));
  console.log('\n→ ' + path.relative(ROOT, SALIDA) + ' (' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB)');
})().catch((e) => { console.error(e); process.exit(1); });
