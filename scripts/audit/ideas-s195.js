/* PACE · «Seguir pensando»: ideas con sugerencias visuales (s195, tras v0.125.3)
 * ==============================================================================
 * El usuario, con la página de decisión delante: «no me queda claro, podemos seguir
 * pensando ideas? dame un html con sugerencias visuales también». Y luego, usando la
 * app un sábado, seis observaciones (la pausa al acabar un pomodoro, el agua, las horas
 * que no se recolocan, las pausas saltadas, «por libre» sin Caminos, la pregunta con
 * comida y horas ajustables). Esta página pone cada idea con lo que se VERÍA —foto de
 * la app real cuando existe el estado, calco con las clases y tokens de la app cuando
 * no— y con una opinión. Nada de esto está implementado.
 *
 * La semana se hace concreta: los cinco días de la semana 38 con sus platos de verdad,
 * calculados con el prototipo de la regla (REGLA de semana-s194.js) sobre el catálogo.
 *
 * Uso: node .claude/static-server.js   (aparte, puerto 8765)
 *      node scripts/audit/ideas-s195.js
 * Sale: docs/proposals/ideas-s195.html (autocontenida, fluida).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));

const BASE = process.env.PACE_BASE || 'http://localhost:8765';
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'ideas-s195.html');
const ESTILO = fs.readFileSync(path.join(ROOT, 'docs', 'proposals', 'por-donde-seguir-s194.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];
const REGLA = fs.readFileSync(path.join(ROOT, 'scripts', 'audit', 'semana-s194.js'), 'utf8').match(/const REGLA = `([\s\S]*?)\n`;/)[1];
/* la hoja de «A tu ritmo», tal cual la inyecta la app, para los calcos */
const RITMO_CSS = fs.readFileSync(path.join(ROOT, 'app', 'ritmo', 'ritmo.css.jsx'), 'utf8').match(/s\.textContent = `([\s\S]*?)`;/)[1];

const uri = (buf) => 'data:image/png;base64,' + buf.toString('base64');
const base = (extra) => Object.assign({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 } }, extra || {});

async function pagina(b, semilla, hora, w, h) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block' });
  await ctx.addInitScript((s) => localStorage.setItem('pace.state.v2', JSON.stringify(s)), semilla);
  const page = await ctx.newPage();
  await page.clock.install({ time: hora });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(1500);
  return { ctx, page };
}
async function recorte(page, rec) { return uri(await sharp(await page.screenshot({ type: 'png' })).extract(rec).png().toBuffer()); }

/* ------------------------------------------------------------- las fotos de la app real */
async function fotos(b) {
  const F = {};
  /* 1 · la pausa al acabar el primer bloque de una jornada (el modal de hoy) */
  {
    const { ctx, page } = await pagina(b, base({ ritmo: { dia: { fecha: '2026-09-18', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } }), new Date('2026-09-18T09:00:00+02:00'), 1280, 879);
    await page.getByRole('button', { name: 'Empezar jornada', exact: true }).click();
    await page.waitForTimeout(250);
    for (let i = 0; i < 50; i++) { await page.clock.fastForward(60 * 1000); await page.waitForTimeout(60); if (await page.locator('[data-pace-break-shortcut]').count()) break; }
    await page.waitForTimeout(600);
    const r = await page.evaluate(() => { const m = document.querySelector('[data-pace-modal-backdrop] > *') || document.querySelector('[data-pace-modal-backdrop]'); const b = m.getBoundingClientRect(); return { left: Math.max(0, Math.floor(b.left) - 8), top: Math.max(0, Math.floor(b.top) - 8), width: Math.min(1280, Math.ceil(b.width) + 16), height: Math.min(879, Math.ceil(b.height) + 16) }; });
    F.pausaHoy = { uri: await recorte(page, r), w: r.width };
    await ctx.close();
  }
  /* 3 · la pausa abierta con la hora del plan por delante del reloj: son las 10:30 y dice 10:48 */
  {
    const { ctx, page } = await pagina(b, base({ cycle: 1, lastActiveDay: 'Fri Sep 18 2026', _historyMigrated: true,
      ritmo: { dia: { fecha: '2026-09-18', opcion: '2h', desde: 623, cicloBase: 0, cambios: {}, pasado: [], primerBloque: 25, pausa: 1 } } }), new Date('2026-09-18T10:30:00+02:00'), 1536, 704);
    F.paradaHoy = { uri: await recorte(page, { left: 300, top: 360, width: 1236, height: 344 }), w: 1236 };
    F.lateralHoy = { uri: await recorte(page, { left: 8, top: 355, width: 270, height: 110 }), w: 270 };
    await ctx.close();
  }
  /* 5 · por libre, hoy: los chips y la tarjeta del Camino */
  {
    const { ctx, page } = await pagina(b, base({ ritmo: { libre: true } }), new Date('2026-09-18T09:00:00+02:00'), 1536, 704);
    F.libreHoy = { uri: await recorte(page, { left: 300, top: 430, width: 1236, height: 274 }), w: 1236 };
    await ctx.close();
  }
  /* 6 · la pregunta, hoy */
  {
    const { ctx, page } = await pagina(b, base({ ritmo: {} }), new Date('2026-09-18T09:00:00+02:00'), 1536, 704);
    F.preguntaHoy = { uri: await recorte(page, { left: 300, top: 440, width: 1236, height: 264 }), w: 1236 };
    await ctx.close();
  }
  return F;
}

/* ------------------------------------------------------------- la semana 38, con la regla */
async function semana(b) {
  const { ctx, page } = await pagina(b, base({ ritmo: { libre: true } }), new Date('2026-09-14T09:00:00+02:00'), 1280, 879);
  await page.evaluate(REGLA);
  const D = await page.evaluate(() => {
    const h = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
    const iso = (d) => '2026-09-' + String(d).padStart(2, '0');
    const MOD = { estira: 'Estira', mueve: 'Mueve', respira: 'Respira', cierre: 'Respira' };
    return [14, 15, 16, 17, 18].map((d) => {
      const f = iso(d); const s = semanaDe(f);
      const m = semanaComponer('jornada', h, ritmoPozos(getState(), f), {}, 8, s);
      return { fecha: f, tema: s.tema.nombre, motivo: s.tema.motivo, acento: s.acento.nombre, que: s.acento.que,
        paradas: m.items.filter((it) => it.tipo === 'pausa' || it.tipo === 'cierre' || it.tipo === 'comida').map((it) => ({ h: ritmoHora(it.desde), tipo: it.tipo, larga: !!it.larga, modulo: it.platos && it.platos[0] ? it.platos[0].modulo : 'comida', nombres: (it.platos || []).map((p) => p.name), min: (it.platos || []).reduce((a, p) => a + p.min, 0), agua: !!it.agua })) };
    });
  });
  await ctx.close();
  return D;
}

/* ------------------------------------------------------------- calcos (HTML con la hoja de la app) */
const C = { estira: 'var(--extra)', mueve: 'var(--move)', respira: 'var(--breathe)', cierre: 'var(--breathe)', comida: 'var(--ink-2)' };
const glifo = (modulo) => ({
  estira: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M6 20 L14 8 L22 20"/><path d="M5 22 H23" stroke-opacity=".35"/></svg>',
  mueve: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M9 14 H19"/><path d="M6 10 V18 M22 10 V18 M4 12 V16 M24 12 V16"/></svg>',
  respira: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M14 6 V22"/><path d="M14 10 C10 8 6 12 8 18 M14 10 C18 8 22 12 20 18"/></svg>',
  cierre: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M14 6 V22"/><path d="M14 10 C10 8 6 12 8 18 M14 10 C18 8 22 12 20 18"/></svg>',
  comida: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M10 6 V22 M8 6 V12 M12 6 V12 M8 12 C8 14 12 14 12 12"/><path d="M18 6 C21 9 21 13 18 15 V22"/></svg>',
  agua: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M14 5 C10 11 8 14 8 17 a6 6 0 0 0 12 0 c0-3-2-6-6-12z"/></svg>',
}[modulo]);
/* la etiqueta va DENTRO del nodo (position: absolute respecto de él), como en la app */
const nodo = (modulo, extra, ariaAhora, etiqueta) => '<span class="pace-rt-nodo' + (extra || '') + '" style="--c:' + C[modulo] + '">' + (ariaAhora ? '<span class="pace-rt-ahora-tag">Ahora</span>' : '') + '<span class="pace-rt-g">' + glifo(modulo) + '</span>' + (etiqueta || '') + '</span>';
const seg = (flex, clase) => '<div class="pace-rt-seg' + (clase ? ' ' + clase : '') + '" style="flex:' + flex + ' 1 0"></div>';
const etiq = (h, n, m, agua, top) => '<span class="pace-rt-etiq" style="top:' + (top || 30) + 'px"><span class="pace-rt-h">' + h + '</span><span class="pace-rt-n">' + n + '</span><span class="pace-rt-m">' + m + (agua ? '<span class="pace-rt-g pace-rt-gota" style="--c:var(--hydrate)">' + glifo('agua') + '</span>' : '') + '</span></span>';
/* una línea de escritorio dibujada a mano con las clases reales */
const linea = (piezas, alto) => '<div class="calco"><div class="pace-rt-linea">' + piezas.join('') + '</div><div class="pace-rt-zona" style="height:' + (alto || 52) + 'px"></div></div>';

function html(F, S) {
  const diaCard = (d, hoy) => `
    <div class="dia-card${hoy ? ' hoy' : ''}">
      <div class="d">${['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][new Date(d.fecha + 'T12:00:00').getDay() - 1]} · <i>${d.acento}</i></div>
      <ul>${d.paradas.map((p) => '<li><span class="h">' + p.h + '</span><span class="g" style="--c:' + C[p.modulo] + '">' + glifo(p.modulo) + '</span><span class="n">' + (p.tipo === 'comida' ? 'Comida' : p.nombres.join(' + ')) + (p.larga ? ' <em>· larga</em>' : '') + '</span>' + (p.agua ? '<span class="gota" style="--c:var(--hydrate)">' + glifo('agua') + '</span>' : '') + '</li>').join('')}</ul>
      <p class="q">${d.que}</p>
    </div>`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Seguir pensando · ideas después de v0.125.3</title>
${ESTILO.replace('</style>', `
  :root { --paper: #F2EDE0; --paper-2: #EAE4D4; --paper-3: #DFD8C4; --hydrate: #5E8AA6; --focus-soft: rgba(62,90,58,0.10); --r-md: 12px; --r-pill: 999px; --sh-soft: 0 1px 2px rgba(31,28,23,0.06); --dur-quick: 160ms; --ease: ease; --font-display: 'EB Garamond', Georgia, serif; }
  ${RITMO_CSS.replace(/\.pace-rt-esc \{ display: block; \}[\s\S]*?\}\n/, '')}
  .calco { border: 1px solid var(--line); border-radius: 12px; background: var(--paper); padding: 14px 22px 8px; margin-top: 10px; font-family: 'Inter Tight', system-ui, sans-serif; }
  .calco .pace-rt-linea { margin-top: 26px; }
  .calco .pace-rt-nodo.saltada { opacity: 0.4; border-style: dashed; }
  .calco .pace-rt-nodo.hecha { background: color-mix(in srgb, var(--c) 22%, var(--paper)); border-width: 1.5px; }
  .foto img { display: block; width: 100%; height: auto; border: 1px solid var(--line); border-radius: 8px; margin-top: 10px; }
  .hoy-prop { display: grid; grid-template-columns: minmax(0,1fr); gap: 12px; margin-top: 10px; }
  .hoy-prop .sello { display: block; margin-bottom: 4px; }
  .opinion { border-left: 3px solid var(--focus-cta); padding: 2px 0 2px 14px; margin: 12px 0 0; font-size: 14px; color: var(--ink-2); }
  .opinion b { color: var(--ink); }
  /* el modal de la pausa, calcado */
  .modal { background: var(--paper); border: 1px solid var(--line); border-radius: 20px; padding: 26px 28px 20px; max-width: 560px; font-family: 'Inter Tight', system-ui, sans-serif; box-shadow: 0 8px 30px rgba(31,28,23,0.08); }
  .modal .tag { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-3); }
  .modal h4 { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 30px; margin: 4px 0 2px; color: var(--ink); }
  .modal .sub { color: var(--ink-3); font-size: 14px; margin: 0 0 16px; }
  .plato { border: 1px solid var(--breathe); background: rgba(201,122,93,0.10); border-radius: 12px; padding: 16px 18px; }
  .plato .c { font-size: 12px; color: var(--breathe); font-weight: 600; }
  .plato .n { font-family: var(--font-display); font-style: italic; font-size: 24px; color: var(--ink); margin: 6px 0 2px; }
  .plato .m { font-size: 13px; color: var(--ink-2); }
  .acciones { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; align-items: center; }
  .btn { border-radius: 10px; padding: 10px 18px; font-size: 14px; border: 1px solid var(--line-2); background: var(--paper); color: var(--ink); }
  .btn.p { background: var(--breathe); border-color: var(--breathe); color: #fff; }
  .btn.g { border-color: var(--focus-cta); color: var(--focus-cta); }
  .modal .pie { display: flex; justify-content: space-between; align-items: center; margin-top: 18px; font-size: 13px; color: var(--ink-3); }
  .modal .pie a { color: var(--ink-2); text-decoration: underline; text-underline-offset: 3px; }
  /* la pregunta, calcada */
  .preg { border: 1px solid var(--line); border-radius: 12px; background: var(--paper); padding: 16px 22px 14px; font-family: 'Inter Tight', system-ui, sans-serif; }
  .preg .toggle { display: inline-flex; border: 1px solid var(--line); border-radius: 999px; overflow: hidden; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-left: 10px; vertical-align: middle; }
  .preg .toggle span { padding: 4px 10px; color: var(--ink-3); }
  .preg .toggle span.on { background: var(--ink); color: var(--paper); }
  .preg .chips4 { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; margin-top: 14px; }
  @media (max-width: 720px) { .preg .chips4 { grid-template-columns: 1fr 1fr; } }
  .preg .chip4 { border: 1px solid var(--line); border-radius: 12px; padding: 10px 14px; background: var(--paper); }
  .preg .chip4 b { display: block; font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 16px; color: var(--ink); }
  .preg .chip4 span { display: block; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); margin-top: 4px; }
  .preg .chip4 u { text-decoration: none; border-bottom: 1px dotted var(--line-2); color: var(--ink); }
  .preg .chip4.sel { border-color: var(--focus-cta); background: var(--focus-soft); }
  /* la tarjeta «ponle ritmo» por libre */
  .ritmo-card { border: 1px solid var(--line); border-radius: 12px; background: var(--paper); padding: 16px 22px; display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 16px; align-items: center; font-family: 'Inter Tight', system-ui, sans-serif; }
  .ritmo-card .t2 { font-family: var(--font-display); font-style: italic; font-size: 22px; color: var(--ink); }
  .ritmo-card .s2 { font-family: var(--font-display); font-style: italic; font-size: 13px; color: var(--ink-3); margin-top: 2px; }
  .ritmo-card .tiles { display: flex; gap: 8px; }
  .ritmo-card .tile { border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; min-width: 96px; text-align: center; }
  .ritmo-card .tile b { display: block; font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 17px; color: var(--ink); }
  .ritmo-card .tile span { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }
  .ritmo-card .tile.rec { border-color: var(--focus-cta); background: var(--focus-soft); }
  @media (max-width: 820px) { .ritmo-card { grid-template-columns: minmax(0,1fr); } .ritmo-card .tiles { flex-wrap: wrap; } }
  /* los cinco días */
  .cinco { display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 10px; margin-top: 12px; }
  @media (max-width: 900px) { .cinco { grid-template-columns: minmax(0,1fr); } }
  .dia-card { border: 1px solid var(--line); border-radius: 10px; background: var(--paper); padding: 10px 12px; font-size: 12px; }
  .dia-card.hoy { border-color: var(--focus-cta); background: var(--focus-soft); }
  .dia-card .d { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); }
  .dia-card .d i { font-style: italic; text-transform: none; letter-spacing: 0; font-family: var(--font-display); font-size: 14px; color: var(--ink); }
  .dia-card ul { list-style: none; padding: 0; margin: 8px 0 0; }
  .dia-card li { display: grid; grid-template-columns: 34px 18px minmax(0,1fr) 12px; gap: 4px; align-items: center; padding: 3px 0; border-top: 1px solid var(--paper-3); }
  .dia-card .h { color: var(--ink-3); font-variant-numeric: tabular-nums; font-size: 11px; }
  .dia-card .g { width: 16px; height: 16px; color: var(--c); display: inline-grid; }
  .dia-card .g svg { width: 100%; height: 100%; }
  .dia-card .n { font-family: var(--font-display); font-style: italic; font-size: 13px; color: var(--ink); line-height: 1.1; }
  .dia-card .n em { font-style: normal; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }
  .dia-card .gota { width: 10px; height: 10px; color: var(--c); }
  .dia-card .q { font-size: 11px; color: var(--ink-3); margin: 8px 0 0; max-width: none; }
  .agua-row { display: flex; gap: 6px; align-items: center; margin-top: 8px; font-size: 12px; color: var(--ink-2); flex-wrap: wrap; }
  .agua-row .h { display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--line); border-radius: 999px; padding: 3px 9px; }
  .agua-row .h i { width: 10px; height: 10px; display: inline-grid; color: var(--hydrate); }
  .agua-row .h.no { color: var(--ink-3); border-style: dashed; }
</style>`)}
</head>
<body>
<main>
  <div class="ceja">PACE · seguir pensando · después de v0.125.3</div>
  <h1>Ideas, con lo que se vería</h1>
  <p>Dijiste que la página anterior no te dejaba claro y que querías seguir pensando ideas. Esta es distinta:
  cada idea va con lo que se <b>vería</b> —foto de la app real cuando el estado existe, calco con las piezas
  de la app cuando no— y con mi opinión. Primero lo que viste usándola el sábado (seis cosas), luego la
  semana hecha concreta (cinco días de verdad, con sus platos), y al final una lista corta para que marques
  lo que te guste. <b>Nada de esto está implementado.</b></p>

  <h2>Lo que viste el sábado</h2>

  <h3>1 · Al acabar un pomodoro: hacer la pausa, o seguir</h3>
  <p>Hoy, al acabar el bloque, el modal propone el plato del menú («A tu ritmo · antídoto a la silla») y
  debajo <b>los cuatro módulos por libre</b>, que son los de siempre. Con un menú servido, esa mitad de
  abajo sobra: la pregunta es solo «¿haces la pausa, o sigues?».</p>
  <div class="hoy-prop">
    <div class="foto"><span class="sello gris">Hoy · foto de la app</span><img style="max-width:${F.pausaHoy.w}px" src="${F.pausaHoy.uri}" alt="El modal de pausa de hoy"></div>
    <div><span class="sello">Propuesta · calco</span>
      <div class="modal">
        <div class="tag">Bloque 1 de 9 · hecho</div>
        <h4>Tu pausa</h4>
        <p class="sub">9:45 · lo que el menú tenía para ahora.</p>
        <div class="plato"><div class="c">A tu ritmo · antídoto a la silla</div><div class="n">Muñecas y manos</div><div class="m">3 min · Estira · y un vaso de agua</div></div>
        <div class="acciones"><button class="btn p">Hacer la pausa</button><button class="btn g">Seguir con el bloque 2</button><button class="btn" style="border-style:dashed">Otra cosa…</button></div>
        <p class="pie"><span>«Otra cosa» abre los cuatro módulos de siempre.</span><a href="#">Saltar esta pausa</a></p>
      </div>
    </div>
  </div>
  <div class="opinion"><b>Opinión:</b> sí, y es la que más se nota. Con menú, el modal tiene UNA propuesta y dos salidas claras;
  «Otra cosa…» guarda lo de siempre plegado. «Seguir con el bloque 2» arranca el aro directamente (y deja la pausa como
  <em>saltada</em>, ver 4). Sin menú (por libre) el modal se queda como hoy. Coste: bajo, es el mismo modal con dos ramas.</div>

  <h3>2 · El agua: ¿cada media hora?</h3>
  <p>Hoy la regla reparte la meta del día (8 vasos) entre las pausas que hay: en «Dos horas» salen 4 vasos en dos horas y
  cuarto, uno cada 35 min. <b>Lo que dice la evidencia</b>: la EFSA fija una ingesta adecuada de agua de <b>2,0 l/día
  (mujeres) y 2,5 l/día (hombres)</b>, contando el agua de los alimentos (un 20-30 %), o sea unos <b>1,6-2 l en bebidas</b>,
  6-8 vasos de 250 ml a lo largo del día entero (unas 16 horas despierto). No hay evidencia de que beber cada 30 min
  aporte nada, y sí de que la sed y las comidas ya cubren buena parte. En una jornada de 8 h sentado, <b>un vaso por
  hora de trabajo</b> (4-5 en la jornada, más si hace calor o te mueves) es lo que se recomienda en salud laboral.</p>
  <div class="tarjeta"><span class="sello gris">Hoy · «Dos horas»</span>
    <div class="agua-row"><span class="h"><i>${glifo('agua')}</i>10:48</span><span class="h"><i>${glifo('agua')}</i>11:20</span><span class="h"><i>${glifo('agua')}</i>11:46</span><span class="h"><i>${glifo('agua')}</i>12:45</span><span>→ 4 vasos en 2 h 15</span></div>
    <span class="sello" style="display:block;margin-top:12px">Propuesta · un vaso por hora, y nunca dos a menos de 50 min</span>
    <div class="agua-row"><span class="h"><i>${glifo('agua')}</i>10:48</span><span class="h no">11:20</span><span class="h"><i>${glifo('agua')}</i>11:46</span><span class="h no">12:45</span><span>→ 2 vasos en 2 h 15 · en la jornada entera, 7-8</span></div>
  </div>
  <div class="opinion"><b>Opinión:</b> cambiar la regla del agua a <b>tiempo</b> (≥ 50 min entre vasos, y la comida cuenta) en vez de a
  <b>pausas</b>. La meta de 8 sigue siendo la del día entero, no la de la sesión: una hora de trabajo son 1-2 vasos, no 8.
  Y el copy de la pausa puede decirlo («y un vaso de agua») en vez de contarlo.</div>

  <h3>3 · Las horas que no se mueven hasta que empiezas</h3>
  <p>Son las 10:30, el bloque acabó antes de lo previsto (acortaste el pomodoro) y la pausa abierta sigue diciendo <b>10:48</b>,
  la hora del plan. Recolocar solo pasa <b>al empezar</b> el bloque siguiente (decisión de s194): hasta que pulses, la
  línea enseña el plan viejo. Y sí: al pulsar «Empezar bloque 2», todo lo de detrás se recompone desde ese momento con la
  duración que marque el aro.</p>
  <div class="hoy-prop">
    <div class="foto"><span class="sello gris">Hoy · foto (son las 10:30)</span><img style="max-width:${F.lateralHoy.w}px" src="${F.lateralHoy.uri}" alt="Tu pausa · 10:48 a las 10:30"><img style="max-width:${F.paradaHoy.w}px" src="${F.paradaHoy.uri}" alt="La línea con la parada abierta a las 10:48"></div>
    <div><span class="sello">Propuesta · la pausa se abre AHORA</span>
      ${linea([seg(25, 'pace-rt-hecho'), nodo('estira', ' pace-rt-ahora', true, etiq('10:30', 'Muñecas y manos', '3 min · Estira', true)), seg(25, 'pace-rt-ahora'), nodo('mueve', '', false, etiq('10:58', 'Glúteos invisibles', '2 min · Mueve', false)), seg(30), nodo('respira', ' pace-rt-larga', false, etiq('11:30', 'Rítmica yin + Hombros', 'Pausa larga · 15 min', true)), seg(45), nodo('cierre', '', false, etiq('12:30', 'Suspiro fisiológico', '2 min · Respira', false)), seg(5)])}
      <p class="leyenda">Al terminar el bloque, si la hora no es la del plan, el resto se recompone <b>desde ahora</b>: la pausa a las 10:30,
      el bloque 2 a las 10:33, y así. Al empezar el bloque 2 se vuelve a recolocar si hace falta (como hoy).</p>
    </div>
  </div>
  <div class="opinion"><b>Opinión:</b> recolocar también <b>al terminar</b>, no solo al empezar. Es la misma pieza de s194 llamada en otro momento
  («la línea dice la verdad» vale también para la pausa abierta). Lo único que cambia de la decisión de s194 es que la
  pausa abierta ya no puede estar en el futuro.</div>

  <h3>4 · Las pausas que saltaste, en gris</h3>
  <p>Hoy «lo pasado conserva su fuerza»: una parada hecha y una saltada se pintan igual, y se puede ir de pomodoro en
  pomodoro sin hacer nada y la línea no lo cuenta. Desde s194 cada sesión sabe si vino del menú (<code>origin</code>,
  <code>fromMenu</code>): con eso el día puede marcar cada parada como <b>hecha</b> o <b>saltada</b>.</p>
  <span class="sello">Propuesta · calco</span>
  ${linea([seg(45, 'pace-rt-hecho'), nodo('estira', ' hecha', false, etiq('9:45', 'Muñecas y manos', 'hecha · 3 min', true)), seg(45, 'pace-rt-hecho'), nodo('mueve', ' saltada', false, etiq('10:35', 'Glúteos invisibles', 'saltada', false)), seg(45, 'pace-rt-hecho'), nodo('respira', ' pace-rt-larga hecha', false, etiq('11:25', 'Rítmica yin + Hombros', 'hecha · 15 min', true)), seg(45, 'pace-rt-ahora'), nodo('estira', '', false, etiq('12:25', 'Caderas de pie', '4 min · Estira', false)), seg(20)])}
  <p class="leyenda">Hecha: el aro se rellena con su color. Saltada: al 40 % y con el borde a trazos. La de ahora, como hoy. En la barra lateral y en Stats «Hoy», «4 de 7 pausas».</p>
  <div class="opinion"><b>Opinión:</b> sí. Es lo que hace que el menú <b>tenga memoria</b> y lo que permite, más adelante, la lectura C del norte (el
  sistema propone ajustes con lo que hiciste). Lo que hay que decidir: si «Seguir con el bloque 2» (idea 1) marca saltada, y si
  hacer la pausa por otra puerta (la carta) también cuenta como hecha (yo diría que sí: misma rutina, mismo día).</div>

  <h3>5 · «Hoy voy por libre» sin Caminos: la tarjeta para ponerle ritmo al día</h3>
  <p>Por libre, la home enseña los cuatro chips y la tarjeta del Camino sugerido, con el enlace «¿Cuánto trabajas hoy? Ponle
  ritmo al día» en pequeño. Propones que esa tarjeta sea la del ritmo, muy visual, y que los Caminos salgan de ahí.</p>
  <div class="hoy-prop">
    <div class="foto"><span class="sello gris">Hoy · foto</span><img style="max-width:${F.libreHoy.w}px" src="${F.libreHoy.uri}" alt="Por libre, hoy"></div>
    <div><span class="sello">Propuesta · calco</span>
      <div class="ritmo-card">
        <div><div class="t2">¿Cuánto trabajas hoy?</div><div class="s2">Te preparo la jornada: cuándo parar, qué hacer y cuánto dura.</div></div>
        <div class="tiles"><div class="tile"><b>Una hora</b><span>hasta 10:45</span></div><div class="tile"><b>Dos horas</b><span>hasta 11:45</span></div><div class="tile"><b>Media</b><span>hasta 13:15</span></div><div class="tile rec"><b>Jornada</b><span>hasta 17:00</span></div></div>
      </div>
      <p class="leyenda">Un toque sirve el día. Los Caminos se van a un estante en la biblioteca (como Viajes en Respira), con el mismo arte.</p>
    </div>
  </div>
  <div class="opinion"><b>Opinión:</b> de acuerdo en que la home no debería vender dos cosas a la vez. Pero <b>no quitaría los Caminos del
  producto</b>: son siete rutinas guiadas con arte propio y parte del bloque premium. Lo que propongo es lo del calco: por
  libre, la tarjeta es la del ritmo (las cuatro opciones como losetas, una recomendada por la hora), y los Caminos viven en
  la biblioteca como estante. Coste: medio (la tarjeta nueva es la pregunta de hoy en otra forma; mover los Caminos toca
  la biblioteca).</div>

  <h3>6 · La pregunta: comer o no, y las horas ajustables</h3>
  <p>Hoy la pregunta lleva el horario en una frase (inicio · comida · duración · salida) y cuatro opciones fijas. Propones
  poder decir «sin comida» y que media jornada y jornada entera sean 4 y 8 horas, pero ajustables.</p>
  <div class="hoy-prop">
    <div class="foto"><span class="sello gris">Hoy · foto</span><img style="max-width:${F.preguntaHoy.w}px" src="${F.preguntaHoy.uri}" alt="La pregunta, hoy"></div>
    <div><span class="sello">Propuesta · calco</span>
      <div class="preg">
        <div class="pace-rt-titulo">¿Cuánto trabajas hoy?</div>
        <div class="pace-rt-sub" style="margin-top:4px">Empiezas a las <u style="border-bottom:1px dotted var(--line-2);text-decoration:none;color:var(--ink)">9:30</u> · comida <span class="toggle"><span class="on">sí</span><span>no</span></span> a las <u style="border-bottom:1px dotted var(--line-2);text-decoration:none;color:var(--ink)">14:00</u> durante <u style="border-bottom:1px dotted var(--line-2);text-decoration:none;color:var(--ink)">1 h</u>.</div>
        <div class="chips4">
          <div class="chip4"><b>Una hora</b><span>hasta las 10:45</span></div>
          <div class="chip4"><b>Dos horas</b><span>hasta las 11:45</span></div>
          <div class="chip4"><b>Media jornada · <u>4 h</u></b><span>hasta las 14:45</span></div>
          <div class="chip4 sel"><b>Jornada · <u>8 h</u></b><span>hasta las 18:30</span></div>
        </div>
      </div>
      <p class="leyenda">La comida se apaga con un interruptor; las horas de media y entera se tocan dentro de la loseta (3-5 h · 6-10 h) y la hora de fin sale sola. La «salida» deja de ser un dato aparte: es inicio + horas + comida.</p>
    </div>
  </div>
  <div class="opinion"><b>Opinión:</b> sí a la comida como interruptor (y cuando está apagada, nada de comida en ningún sitio). Sobre las horas:
  hoy «jornada entera» es <b>de inicio a salida</b> (lo que dure tu día), y eso vale para quien sale a las 15:00 y para quien
  sale a las 19:00. Propongo <b>mantener «hasta la salida» como jornada</b> y añadir las horas ajustables a «media jornada»
  (hoy es la mitad de tu día): «Media jornada · 4 h» con el número editable. Así no se rompe lo que ya funciona y se gana lo que pides.</div>

  <h2>La semana, hecha concreta</h2>
  <p>Para que «el hilo de la semana» deje de ser abstracto: estos son los <b>cinco días de la semana 38</b> tal como la regla
  prototipo los serviría, con los platos del catálogo de verdad (jornada de 9 a 17, comida a las 14). El tema de la semana
  es <b>${S[0].tema}</b> (${S[0].motivo}); cada día lleva su acento. Fíjate en que cambia la región que lidera, el orden y la
  forma del día, no que cada plato sea nuevo: junto a la mesa y gratis hay 6 de Estira, 4 de Mueve y 5 de Respira.</p>
  <div class="cinco">${S.map((d, i) => diaCard(d, i === 0)).join('')}</div>
  <p class="leyenda">La semana 39 sería «Manos y muñecas» con los mismos acentos; la 40, «Espalda y postura»; la 41, «El aire»; la 42, «Ligera»;
  la 43, «Cuello y hombros»; y vuelta a empezar. Las fotos de dónde se diría (la línea · el aro · la barra lateral) están en
  <code>por-donde-seguir-s195.html</code>.</p>
  <div class="opinion"><b>Opinión:</b> con la memoria de las pausas (idea 4) y el origen (s194), la semana puede ser más lista que un calendario:
  si el jueves saltaste las dos de Mueve, el viernes no insiste. Pero eso es la lectura C y necesita semanas de uso; la A (esta
  página) se puede tener en una sesión y ya cambia lo que ves cada lunes.</div>

  <h2>Dos cosas que vi auditando y no toqué</h2>
  <div class="dos">
    <div class="tarjeta"><span class="sello gris">Tableta en vertical</span><span class="t">¿Piel de móvil hasta 1024?</span>
      <p>Un iPad en vertical (820-1024 px) lleva hoy la piel de escritorio con su barra lateral de 280: al aro le quedan 227 px
      flotando en 1100 de alto. En v0.125.3 el panel y los chips ya se adaptan, pero la composición sigue siendo la de escritorio.
      La pregunta es si por debajo de ~1000 px de ancho debería mandar la piel de móvil (barra en cajón, aro grande). Es un
      breakpoint: se decide, no se arregla.</p></div>
    <div class="tarjeta"><span class="sello gris">iPhone SE (375×667)</span><span class="t">«Bloque 1 de 9» roza el aro</span>
      <p>Con el aro a 306 px, el rótulo de arriba del interior queda sobre el trazo del anillo. Es el interior del aro con sus
      fijos (botón de 44 px) en pantallas cortas; lo miraré con la misma regla de medir que el resto si te parece que va.</p></div>
  </div>

  <h2 class="decide">Para decidir</h2>
  <p>Marca las que te gusten (por número) y, si quieres, un matiz. Ejemplo: <kbd>1 · 2 · 3 · 4 · 5 (sin quitar Caminos) · 6 · semana sí</kbd>.</p>
  <ol class="orden">
    <li><b>La pausa al acabar</b>: una propuesta y dos salidas (hacer la pausa · seguir), «otra cosa» plegado.</li>
    <li><b>El agua por tiempo</b>: un vaso por hora, nunca dos a menos de 50 min; la meta de 8 es del día.</li>
    <li><b>Recolocar también al terminar</b>: la pausa abierta se abre a la hora que es.</li>
    <li><b>Pausas hechas y saltadas</b>: la línea tiene memoria (relleno · trazos al 40 %).</li>
    <li><b>Por libre, la tarjeta del ritmo</b> en vez del Camino sugerido; los Caminos, a la biblioteca.</li>
    <li><b>La pregunta</b>: comida sí/no, media jornada con horas ajustables.</li>
    <li><b>La semana</b> (lectura A) tal como la ves arriba, o dime qué cambiarías de los cinco días.</li>
    <li><b>Tableta vertical</b> con piel de móvil hasta ~1000 px: sí / no / luego.</li>
  </ol>
  <p class="pie">Fotos: artefacto v0.125.3 a 1536×704 y 1280×879 con el reloj fijado; calcos con la hoja de estilos real de «A tu ritmo». La semana
  sale de <code>scripts/audit/semana-s194.js</code> (la regla prototipo) sobre el catálogo vivo. Generada por <code>scripts/audit/ideas-s195.js</code>.</p>
</main>
</body>
</html>
`;
}

(async () => {
  const b = await chromium.launch();
  const F = await fotos(b);
  const S = await semana(b);
  await b.close();
  fs.writeFileSync(SALIDA, html(F, S));
  console.log(S.map((d) => d.fecha + ' ' + d.acento + ' · ' + d.paradas.map((p) => (p.nombres[0] || p.tipo) + (p.agua ? '💧' : '')).join(' | ')).join('\n'));
  console.log('→ ' + path.relative(ROOT, SALIDA) + ' (' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB)');
})().catch((e) => { console.error(e); process.exit(1); });
