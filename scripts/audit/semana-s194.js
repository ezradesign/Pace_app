/* PACE · MAQUETA «el hilo de la semana» (s194, ronda 1 · lectura A del norte)
 * ===========================================================================
 * El norte del usuario: «acompañar el día pero ir ofreciendo propuestas para cada
 * día de la semana/mes» y, al pedir esta maqueta, «cada semana del año tiene que
 * ser diferente o al menos coherente».
 *
 * LO MEDIDO ANTES DE DIBUJAR (censo sobre el catálogo vivo, junto a la mesa y
 * gratis): Estira 6 · Mueve 4 · Respira 5 · cierre 1. Una jornada entera sirve
 * ~4 platos de Estira, así que en una semana la repetición es inevitable: lo que
 * puede variar es QUÉ REGIÓN LIDERA, EN QUÉ ORDEN y LA FORMA DEL DÍA. La regla
 * que se propone —y que aquí se PROTOTIPA en puro con el catálogo real— es:
 *
 *   tema de la semana (por semana ISO, seis temas en ciclo: cada uno vuelve cada seis)
 *   × acento del día (lunes a viernes)
 *   × la regla del día de siempre (ritmoComponer, sin tocar)
 *
 * El tema reordena los pozos (la región del tema va primero) y elige qué módulo
 * lleva la pausa larga; el acento del día cambia la forma (arrancar con Mueve,
 * la larga antes, respirar antes de comer, cerrar suave). Ningún dato de uso:
 * todo sale de la fecha, reproducible y offline. Nada se implementa en la app:
 * la página se genera en puro con `ritmoComponer` y `ritmoPozos` reales, y las
 * fotos del panel llevan el motivo INYECTADO en el DOM (patrón de s193).
 *
 * Uso: node .claude/static-server.js   (aparte, puerto 8765)
 *      node scripts/audit/semana-s194.js
 * Sale: docs/proposals/semana-r1.html (fluida, autocontenida).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));
const BASE = process.env.PACE_BASE || 'http://localhost:8765';
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'semana-r1.html');

/* ------------------------------------------------------------- el prototipo de la regla
   Corre DENTRO de la página (usa el catálogo y ritmoComponer reales). Se escribe como
   texto para inyectarlo tal cual: si se aprueba, esto es lo que iría a app/ritmo/. */
const REGLA = `
/* La semana ISO de una fecha local (sin new Date("YYYY-MM-DD"): se construye por partes). */
function semanaISO(iso) {
  var p = iso.split('-').map(Number);
  var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  var dia = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dia);
  var inicioAno = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return { n: Math.ceil(((d - inicioAno) / 86400000 + 1) / 7), ano: d.getUTCFullYear(), diaSemana: dia };
}

/* LOS TEMAS: qué región lidera. Cada uno ordena los pozos por afinidad (tag) y dice
   qué módulo abre la pausa larga. Seis, en ciclo: cuello y hombros · caderas y piernas
   · manos · espalda y postura · el aire · ligera. */
var SEMANA_TEMAS = [
  { id: 'cuello', nombre: 'Cuello y hombros', motivo: 'donde se acumula la pantalla',
    estira: ['SIT', 'SHLD'], mueve: ['POST'], respira: ['REL'], larga: 'estira' },
  { id: 'caderas', nombre: 'Caderas y piernas', motivo: 'la silla las acorta; esta semana se alargan',
    estira: ['HIP', 'LEG', 'GRND'], mueve: ['STEALTH', 'LEG'], respira: ['BAL'], larga: 'estira' },
  { id: 'manos', nombre: 'Manos y muñecas', motivo: 'teclado y ratón, todo el día',
    estira: ['WRST', 'SIT'], mueve: ['GRIP'], respira: ['EQU'], larga: 'respira' },
  { id: 'espalda', nombre: 'Espalda y postura', motivo: 'la columna, de la nuca al sacro',
    estira: ['SPN', 'SHLD', 'HIP'], mueve: ['POST', 'BACK'], respira: ['REL'], larga: 'estira' },
  { id: 'aire', nombre: 'El aire', motivo: 'una semana para respirar más despacio',
    estira: ['SIT'], mueve: ['STEALTH'], respira: ['BAL', 'EQU'], larga: 'respira', respiraLarga: true },
  { id: 'ligera', nombre: 'Ligera', motivo: 'pausas cortas, más agua, cerrar pronto',
    estira: ['SIT', 'WRST'], mueve: ['STEALTH', 'GRIP'], respira: ['REL'], larga: 'respira', corta: true },
];

/* LOS ACENTOS del día (lunes a viernes). Cambian la FORMA, no los platos. */
var SEMANA_ACENTOS = {
  1: { id: 'arranque', nombre: 'arrancar', que: 'la primera pausa activa el cuerpo (Mueve)' },
  2: { id: 'sostener', nombre: 'sostener', que: 'el día tal cual lo sirve la regla' },
  3: { id: 'mitad', nombre: 'la mitad', que: 'la pausa larga llega antes (la segunda, no la tercera)' },
  4: { id: 'aire', nombre: 'aire', que: 'antes de comer se respira, no se estira' },
  5: { id: 'cierre', nombre: 'cerrar suave', que: 'la tarde acaba con la pausa larga y el cierre más largo' },
  6: { id: 'libre', nombre: 'por libre', que: 'fin de semana: la carta, sin menú (o un menú corto si lo pides)' },
  7: { id: 'libre', nombre: 'por libre', que: 'fin de semana: la carta, sin menú (o un menú corto si lo pides)' },
};

function semanaDe(iso) {
  var s = semanaISO(iso);
  var tema = SEMANA_TEMAS[(s.n - 1) % SEMANA_TEMAS.length];
  return { n: s.n, ano: s.ano, diaSemana: s.diaSemana, tema: tema, acento: SEMANA_ACENTOS[s.diaSemana] };
}

/* Ordena un pozo: primero lo que casa con los tags del tema (en ese orden), luego el
   resto tal cual venía (que ya rota por día). Con \`corta\`, los de ≤3 min delante. */
function semanaOrdenar(pozo, tags, corta) {
  var peso = function (r) {
    var i = tags.indexOf(r.tag);
    return (i === -1 ? tags.length : i) * 100 + (corta ? (r.min || 0) : 0);
  };
  return pozo.slice().sort(function (a, b) { return peso(a) - peso(b); });
}
function semanaPozos(pozos, semana) {
  var t = semana.tema;
  var respira = semanaOrdenar(pozos.respira, t.respira, t.corta);
  if (t.respiraLarga) respira = respira.slice().sort(function (a, b) { return (b.min || 0) - (a.min || 0); });
  return {
    estira: semanaOrdenar(pozos.estira, t.estira, t.corta),
    mueve: semanaOrdenar(pozos.mueve, t.mueve, t.corta),
    respira: respira,
    cierre: pozos.cierre,
  };
}

/* El día con acento: se compone con la regla de siempre y se retocan los PLATOS de
   las pausas según el acento (la forma del día). No toca ritmoComponer. */
function semanaComponer(opcion, horario, pozos, cambios, meta, semana) {
  var P = semanaPozos(pozos, semana);
  var previos = semana.acento.id === 'mitad' ? { bloques: 0, pausas: 1, foco: 0, comidaHecha: false, usados: [], vasos: 0, claves: 0, primerBloque: null } : null;
  var m = ritmoComponer(opcion, horario, P, cambios, meta, previos);
  if (!m) return m;
  var pausas = m.items.filter(function (it) { return it.tipo === 'pausa'; });
  var a = semana.acento.id;
  var usados = {};
  m.items.forEach(function (it) { (it.platos || []).forEach(function (p) { usados[p.id] = true; }); });
  var toma = function (modulo, evitar) {
    var libres = P[modulo].filter(function (r) { return !usados[r.id] && r.id !== evitar; });
    var r = libres[0] || P[modulo][0];
    usados[r.id] = true;
    return { modulo: modulo, id: r.id, name: r.name, min: r.min, clave: 'acento', rutina: r };
  };
  if (a === 'arranque' && pausas[0] && !pausas[0].larga && pausas[0].platos[0].modulo !== 'mueve') {
    var preLarga = pausas.find(function (p) { return p.platos[0] && p.platos[0].modulo === 'mueve'; });
    delete usados[pausas[0].platos[0].id];
    if (preLarga) { pausas[0].platos = preLarga.platos; preLarga.platos = [toma('mueve')]; }
    else pausas[0].platos = [toma('mueve')];
    pausas[0].motivo = 'mueve';
  }
  if (a === 'aire') {
    var comidaI = m.items.findIndex(function (it) { return it.tipo === 'comida'; });
    for (var i = comidaI - 1; i >= 0; i--) {
      if (m.items[i].tipo === 'pausa' && !m.items[i].larga) {
        delete usados[m.items[i].platos[0].id];
        m.items[i].platos = [toma('respira')]; m.items[i].motivo = 'respira'; break;
      }
    }
  }
  if (a === 'cierre' && m.items.length) {
    var cierre = m.items[m.items.length - 1];
    var largo = P.respira.filter(function (r) { return !usados[r.id]; })[0];
    if (cierre && cierre.tipo === 'cierre' && largo) { cierre.platos = [{ modulo: 'respira', id: largo.id, name: largo.name, min: largo.min, clave: 'cierre', rutina: largo }]; cierre.motivo = 'cierre'; }
  }
  return m;
}
`;

/* ------------------------------------------------------------- lo que se calcula en la página */
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', sidebarCollapsed: false,
  profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 }, ritmo: { libre: true } };

async function calcular(page) {
  await page.evaluate(REGLA);
  return page.evaluate(() => {
    const h = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
    const iso = (y, m, d) => y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const pozosDe = (fecha) => ritmoPozos(getState(), fecha);
    const pozos = pozosDe('2026-09-14');
    const MOD = { estira: 'Estira', mueve: 'Mueve', respira: 'Respira', cierre: 'Respira' };
    const dia = (fecha) => {
      const s = semanaDe(fecha);
      if (s.diaSemana >= 6) return { fecha, semana: s, libre: true };
      const m = semanaComponer('jornada', h, pozosDe(fecha), {}, 8, s);
      return { fecha, semana: { n: s.n, tema: s.tema.nombre, acento: s.acento.nombre }, paradas: m.items.filter((it) => it.tipo === 'pausa' || it.tipo === 'cierre' || it.tipo === 'comida')
        .map((it) => ({ h: ritmoHora(it.desde), tipo: it.tipo, larga: !!it.larga, platos: (it.platos || []).map((p) => p.name + ' · ' + p.min + ' min · ' + MOD[p.modulo]) })) };
    };
    /* dos semanas seguidas: la 38 (14–18 sept) y la 39 (21–25) */
    const semanas = [[14, 15, 16, 17, 18], [21, 22, 23, 24, 25]].map((ds) => ds.map((d) => dia(iso(2026, 9, d))));
    /* el año: 52 semanas, su tema */
    const ano = [];
    for (let w = 1; w <= 53; w++) {
      /* el jueves de cada semana ISO de 2026: 1 de enero de 2026 es jueves, semana 1 */
      const jue = new Date(Date.UTC(2026, 0, 1 + (w - 1) * 7));
      if (jue.getUTCFullYear() !== 2026) break;
      const f = jue.toISOString().slice(0, 10);
      const s = semanaDe(f);
      ano.push({ n: s.n, tema: s.tema.id, nombre: s.tema.nombre, desde: f });
    }
    /* cuántos platos distintos sirve una semana (L–V) y cuántos coinciden entre las dos semanas */
    const ids = (sem) => new Set(sem.flatMap((d) => (d.paradas || []).flatMap((p) => p.platos)));
    const a = ids(semanas[0]), b = ids(semanas[1]);
    const comunes = [...a].filter((x) => b.has(x)).length;
    return { pozos: Object.fromEntries(Object.entries(pozos).map(([k, v]) => [k, v.map((r) => r.name + ' (' + r.tag + ', ' + r.min + ')')])),
      temas: SEMANA_TEMAS.map((t) => ({ id: t.id, nombre: t.nombre, motivo: t.motivo, larga: t.larga })), acentos: Object.values(SEMANA_ACENTOS).filter((x, i, arr) => arr.findIndex((y) => y.id === x.id) === i),
      semanas, ano, distintos: [a.size, b.size, comunes] };
  });
}

/* ------------------------------------------------------------- las fotos con el motivo inyectado */
async function foto(browser, vp, texto, semilla) {
  const movil = vp.w <= 640;
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, isMobile: movil, hasTouch: movil });
  await ctx.addInitScript((s) => localStorage.setItem('pace.state.v2', JSON.stringify(s)), semilla);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-09-14T09:00:00+02:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(1500);
  await page.evaluate((t) => {
    /* el motivo, en la línea de la frase de la primera vez (que ya no está tras el bloque 1) */
    document.querySelectorAll('.pace-rt-panel[data-pace-ritmo-estado="menu"]').forEach((panel) => {
      const cab = panel.querySelector('.pace-rt-cab');
      const d = document.createElement('div'); d.className = 'pace-rt-sub'; d.style.marginTop = '5px';
      d.innerHTML = t; cab.insertAdjacentElement('afterend', d);
      const como = panel.querySelector('[data-pace-ritmo-como]'); if (como) como.remove();
    });
  }, texto);
  await page.waitForTimeout(150);
  const png = await page.screenshot({ type: 'png' });
  await ctx.close();
  return 'data:image/png;base64,' + (await sharp(png).extract(vp.rec).png().toBuffer()).toString('base64');
}

/* ------------------------------------------------------------- la página */
const COLOR = { cuello: '#6B7A8F', caderas: '#9A7B4F', manos: '#8A8372', espalda: '#3E5A3A', aire: '#C97A5D', ligera: '#5B8FA8' };
function pagina(D, fotos) {
  const semanaHTML = (sem) => `<div class="semana">${sem.map((d) => `
    <div class="dia${d.libre ? ' libre' : ''}"><div class="d">${['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][new Date(d.fecha + 'T12:00:00').getDay() || 7]} ${d.fecha.slice(8)}</div>
      ${d.libre ? '<div class="h">por libre</div>' : `<div class="h">${d.semana.acento}</div><ul>${d.paradas.map((p) => `<li class="${p.tipo}${p.larga ? ' larga' : ''}"><span class="hh">${p.h}</span>${p.tipo === 'comida' ? '<em>comida</em>' : p.platos.map((x) => '<span>' + x + '</span>').join('')}</li>`).join('')}</ul>`}
    </div>`).join('')}</div>`;
  const ano = `<div class="ano">${D.ano.map((w) => `<span class="w" style="--c:${COLOR[w.tema]}" title="Semana ${w.n} · ${w.nombre} · desde ${w.desde}"><b>${w.n}</b></span>`).join('')}</div>
    <div class="leyenda">${D.temas.map((t) => `<span><i style="background:${COLOR[t.id]}"></i>${t.nombre}</span>`).join('')}</div>`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>El hilo de la semana · ronda 1</title>
<style>
  :root{--paper:#F2EDE0;--paper-2:#EAE4D4;--paper-3:#DFD8C4;--ink:#1F1C17;--ink-2:#4A453C;--ink-3:#8A8372;--line:#C9C0A8;--focus:#3E5A3A;--focus-cta:#50624D;--focus-soft:rgba(62,90,58,0.10);--breathe:#C97A5D;--move:#9A7B4F;--extra:#6B7A8F}
  *{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:'Inter Tight',system-ui,sans-serif;font-size:15px;line-height:1.5}main{max-width:1100px;margin:0 auto;padding:32px 20px 80px}
  h1,h2,h3{font-family:'EB Garamond',Georgia,serif;font-style:italic;font-weight:500}h1{font-size:40px;margin:6px 0 12px;line-height:1.05}h2{font-size:28px;margin:52px 0 6px;line-height:1.1}h3{font-size:20px;margin:22px 0 4px}
  p,li{max-width:78ch;color:var(--ink-2)}.ceja{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-3);margin-bottom:8px}.pie{font-size:12px;color:var(--ink-3)}
  code{font-size:13px;background:var(--paper-2);padding:1px 5px;border-radius:4px}kbd{font:inherit;font-size:12px;border:1px solid var(--line);border-radius:6px;padding:1px 7px;background:var(--paper)}
  .tarjeta{border:1px solid var(--line);border-radius:12px;padding:14px 16px;background:var(--paper);min-width:0}.tarjeta.rec{border-color:var(--focus-cta);background:var(--focus-soft)}
  .sello{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--focus-cta)}.t{font-family:'EB Garamond',Georgia,serif;font-style:italic;font-weight:500;font-size:19px;display:block;color:var(--ink);margin:2px 0 6px}.tarjeta p{font-size:14px;margin:6px 0 0}
  .tres{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:10px}.dos{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;margin-top:10px}@media(max-width:860px){.tres,.dos{grid-template-columns:minmax(0,1fr)}}
  /* el año */
  .ano{display:grid;grid-template-columns:repeat(13,minmax(0,1fr));gap:4px;margin-top:12px}.ano .w{display:grid;place-items:center;height:30px;border-radius:6px;background:color-mix(in srgb,var(--c) 22%,var(--paper));border:1px solid color-mix(in srgb,var(--c) 55%,transparent);font-size:10px;color:var(--ink-2)}.ano .w b{font-weight:500}
  .leyenda{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:8px;font-size:12px;color:var(--ink-2)}.leyenda i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
  /* la semana */
  .semana{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:10px}@media(max-width:860px){.semana{grid-template-columns:minmax(0,1fr)}}
  .dia{border:1px solid var(--line);border-radius:10px;padding:8px 9px 10px;background:var(--paper);min-width:0}.dia.libre{border-style:dashed;color:var(--ink-3)}
  .dia .d{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3)}.dia .h{font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:16px;color:var(--ink);margin:2px 0 6px}
  .dia ul{list-style:none;margin:0;padding:0}.dia li{font-size:11px;line-height:1.25;color:var(--ink-2);padding:4px 0;border-top:1px solid var(--paper-3)}.dia li span{display:block}.dia li .hh{font-size:10px;color:var(--ink-3);letter-spacing:.06em}.dia li.larga{background:var(--focus-soft);margin:0 -4px;padding:4px}.dia li.comida em{color:var(--ink-3)}.dia li.cierre{color:var(--breathe)}
  .pozo{font-size:12px;color:var(--ink-2)}.pozo b{color:var(--ink)}
  .par{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;margin-top:10px}@media(max-width:860px){.par{grid-template-columns:minmax(0,1fr)}}
  figure{margin:0 0 14px;min-width:0;max-width:100%}figcaption{font-size:12px;color:var(--ink-3);margin-bottom:5px}img{display:block;width:100%;max-width:100%;height:auto;border:1px solid var(--line);border-radius:8px;background:var(--paper-2)}
  .decide{border-top:1px solid var(--line);padding-top:6px;margin-top:30px}.decide li{margin-bottom:8px}
  table{border-collapse:collapse;font-size:13px;margin-top:10px;width:100%}td,th{text-align:left;padding:6px 8px;border-top:1px solid var(--paper-3);vertical-align:top;color:var(--ink-2)}th{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);font-weight:500}td b{color:var(--ink);font-weight:500}
</style></head><body><main>
  <div class="ceja">PACE · maqueta · s194 · el norte, lectura A · ronda 1</div>
  <h1>El hilo de la semana</h1>
  <p>Tu norte: «acompañar el día pero ir ofreciendo propuestas para cada día de la semana/mes», y «cada semana del año tiene
  que ser diferente o al menos coherente». Hoy el menú es el mismo todos los días: la regla compone la jornada igual el lunes
  que el jueves, y solo cambia el punto por donde empieza a girar el pozo. Esta ronda propone <b>un hilo por semana</b> y
  <b>un acento por día</b>, los dos sacados de la fecha (sin datos de uso, reproducible y offline), y lo enseña con los platos
  reales del catálogo, no con nombres inventados.</p>

  <h2>Antes de dibujar: lo que hay</h2>
  <p>Junto a la mesa y gratis, los pozos que sirve «A tu ritmo» son estos. Una jornada entera sirve unas cuatro paradas de
  Estira, así que <b>en una semana la repetición de platos es inevitable</b>: lo que puede variar es qué región lidera, en qué
  orden se sirven y la forma del día. Con premium los pozos crecen (Estira 17, Mueve 14, Respira 20 en el catálogo).</p>
  <div class="tres">
    <div class="tarjeta"><span class="sello">Estira · ${D.pozos.estira.length}</span><p class="pozo">${D.pozos.estira.join(' · ')}</p></div>
    <div class="tarjeta"><span class="sello">Mueve · ${D.pozos.mueve.length}</span><p class="pozo">${D.pozos.mueve.join(' · ')}</p></div>
    <div class="tarjeta"><span class="sello">Respira · ${D.pozos.respira.length} + cierre ${D.pozos.cierre.length}</span><p class="pozo">${D.pozos.respira.join(' · ')} · <b>cierre:</b> ${D.pozos.cierre.join(' · ')}</p></div>
  </div>

  <h2>La regla, en tres capas</h2>
  <div class="tres">
    <div class="tarjeta rec"><span class="sello">1 · el tema de la semana</span><span class="t">Una región lidera cada semana</span>
      <p>Seis temas en ciclo por semana ISO: la región del tema va primero en los pozos y decide qué módulo abre la pausa larga. Es lo que hace a la semana <b>coherente</b> (el lunes y el jueves hablan de lo mismo) y a las semanas <b>distintas</b>.</p></div>
    <div class="tarjeta rec"><span class="sello">2 · el acento del día</span><span class="t">La forma del día cambia con el día</span>
      <p>Lunes arrancar (la primera pausa activa el cuerpo), martes sostener, miércoles la mitad (la larga antes), jueves aire (antes de comer se respira), viernes cerrar suave (el cierre más largo). Sábado y domingo, por libre.</p></div>
    <div class="tarjeta"><span class="sello">3 · el día, como siempre</span><span class="t">La regla de s192 no se toca</span>
      <p>La comida a su hora, salgo a mi hora, recolocar, nada se repite en el día. El tema solo reordena los pozos que entran; el acento retoca uno o dos platos después.</p></div>
  </div>
  <table><tr><th>Semana</th><th>Tema</th><th>Motivo (lo que diría el panel)</th><th>Estira primero</th><th>Mueve primero</th><th>Respira primero</th><th>La larga abre con</th></tr>
  ${D.temas.map((t, i) => `<tr><td>${i + 1}, ${i + 7}, ${i + 13}…</td><td><b>${t.nombre}</b></td><td>${t.motivo}</td><td>${['SIT, SHLD', 'HIP, LEG', 'WRST, SIT', 'SPN, SHLD, HIP', 'SIT', 'SIT, WRST (los cortos)'][i]}</td><td>${['POST', 'STEALTH, LEG', 'GRIP', 'POST, BACK', 'STEALTH', 'los cortos'][i]}</td><td>${['REL', 'BAL', 'EQU', 'REL', 'BAL, EQU (los largos)', 'REL (los cortos)'][i]}</td><td>${t.larga}</td></tr>`).join('')}</table>
  <p class="pie">Los códigos son los <code>tag</code> del catálogo (SIT silla · SHLD hombros · SPN columna · HIP caderas · LEG piernas · WRST muñecas · POST postura · STEALTH sigilo · GRIP agarre · BACK espalda · REL relajación · BAL balance · EQU equilibrio). Con seis temas y un ciclo de seis, cada tema vuelve cada seis semanas: ~9 veces al año.</p>

  <h2>El año, semana a semana</h2>
  <p>Las 52 semanas de 2026 con su tema. Diferente cada semana, coherente dentro de ella, y con un ciclo que se reconoce sin ser
  idéntico: el mismo tema vuelve con otros platos delante (los pozos siguen rotando por día).</p>
  ${ano}

  <h2>Dos semanas seguidas, con los platos reales</h2>
  <p>Jornada entera de 9:00 a 17:00 con comida a las 14:00, servida por la regla real con el prototipo encima. <b>Semana ${D.semanas[0][0].semana.n} ·
  ${D.semanas[0][0].semana.tema}</b> y <b>semana ${D.semanas[1][0].semana.n} · ${D.semanas[1][0].semana.tema}</b>. Medido: la primera sirve ${D.distintos[0]} platos distintos, la segunda ${D.distintos[1]}, y solo ${D.distintos[2]} coinciden.</p>
  <h3>Semana ${D.semanas[0][0].semana.n} · ${D.semanas[0][0].semana.tema}</h3>${semanaHTML(D.semanas[0])}
  <h3>Semana ${D.semanas[1][0].semana.n} · ${D.semanas[1][0].semana.tema}</h3>${semanaHTML(D.semanas[1])}
  <p class="pie">Cada columna es un día; cada fila, una parada con su hora. La pausa larga va sombreada; el cierre, en terracota. Lo que se repite entre días es lo que el pozo obliga a repetir.</p>
  <p><b>Dos cosas que se ven en la tabla y no en la idea</b>: el miércoles («la mitad») adelanta la larga a las 10:35 y, por la cadencia de cada tercera pausa, <b>cae otra larga a las 13:15</b> — dos largas antes de comer, treinta minutos de pausa en la mañana; y el viernes («cerrar suave») sirve en el cierre un plato de 10 minutos en un hueco que la regla reserva de 5: <b>habría que alargar el hueco del cierre</b>, no solo cambiar el plato. Las dos van a la lista de decisiones.</p>

  <h2>Cómo lo diría el panel</h2>
  <p>El motivo tiene que verse, si no la variedad parece arbitraria. Propuesta: una línea bajo la cabecera —donde estuvo la frase de
  la primera vez—, en la misma cursiva pequeña: <em>«Semana ${D.semanas[0][0].semana.n} · ${D.semanas[0][0].semana.tema}, ${D.temas.find((t) => t.nombre === D.semanas[0][0].semana.tema).motivo} · hoy, ${D.semanas[0][0].semana.acento}»</em>.
  Fotografiado sobre la app real (inyectado en el DOM), escritorio y móvil.</p>
  <div class="par">
    <div class="tarjeta"><div class="ceja">Escritorio · lunes de la semana 38</div><figure><img src="${fotos.e1280}" style="max-width:min(100%,980px)" alt=""></figure></div>
    <div class="tarjeta"><div class="ceja">Móvil · lunes de la semana 38</div><figure><img src="${fotos.m412}" style="max-width:min(100%,412px)" alt=""></figure></div>
  </div>

  <div class="decide">
    <h2>Lo que hay que decidir</h2>
    <ul>
      <li><b>El tema por semana</b>: <kbd>A</kbd> seis temas en ciclo (como aquí) · <kbd>B</kbd> menos temas, más marcados (cuatro: cuello, caderas, espalda, aire) · <kbd>C</kbd> ninguno: solo los acentos del día.</li>
      <li><b>Los acentos del día</b>: <kbd>sí</kbd> · <kbd>no</kbd> · o cuáles quitar (arrancar · la mitad · aire · cerrar suave).</li>
      <li><b>El miércoles</b>: <kbd>A</kbd> dos largas antes de comer, como sale · <kbd>B</kbd> solo se adelanta la primera y la cadencia sigue desde ahí (una larga por la mañana) · <kbd>C</kbd> quitar «la mitad».</li>
      <li><b>El viernes</b>: <kbd>A</kbd> el cierre se alarga a 10 minutos (sales cinco minutos después, o el último bloque se acorta cinco) · <kbd>B</kbd> el cierre sigue siendo de 5 y solo cambia el plato corto por otro corto.</li>
      <li><b>Dónde se dice</b>: <kbd>A</kbd> la línea bajo la cabecera (fotos) · <kbd>B</kbd> también bajo «A TU RITMO» en el aro («Semana 38 · Cuello y hombros») · <kbd>C</kbd> también en la barra lateral.</li>
      <li><b>El fin de semana</b>: <kbd>A</kbd> por libre, sin menú · <kbd>B</kbd> un menú corto (una hora) si lo pides.</li>
      <li><b>Los nombres</b> de los temas: ¿estos, u otros?</li>
    </ul>
    <p class="pie">Basta con una línea: «A · sí · B · A · A · A · nombres bien».</p>
  </div>
</main></body></html>`;
}

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage();
  await page.addInitScript((s) => localStorage.setItem('pace.state.v2', JSON.stringify(s)), SEMILLA);
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  const D = await calcular(page);
  await page.close();
  console.log('pozos', JSON.stringify(Object.fromEntries(Object.entries(D.pozos).map(([k, v]) => [k, v.length]))), 'distintos', D.distintos);
  D.semanas.forEach((sem) => sem.forEach((d) => console.log(d.fecha, d.libre ? 'libre' : d.semana.tema + ' · ' + d.semana.acento + ' · ' + d.paradas.map((p) => p.platos.map((x) => x.split(' · ')[0]).join('+') || p.tipo).join(' | '))));
  const lunes = D.semanas[0][0];
  const texto = '<b style="font-weight:500;color:var(--ink)">Semana ' + lunes.semana.n + ' · ' + lunes.semana.tema + '</b>, ' + D.temas.find((t) => t.nombre === lunes.semana.tema).motivo + ' · hoy, ' + lunes.semana.acento;
  const semillaPlan = Object.assign({}, SEMILLA, { ritmo: { dia: { fecha: '2026-09-14', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } });
  const fotos = {
    e1280: await foto(b, { w: 1280, h: 879, rec: { left: 300, top: 540, width: 980, height: 290 } }, texto, semillaPlan),
    m412: await foto(b, { w: 412, h: 844, rec: { left: 0, top: 540, width: 412, height: 304 } }, texto, Object.assign({}, semillaPlan, { sidebarCollapsed: true })),
  };
  await b.close();
  fs.writeFileSync(SALIDA, pagina(D, fotos));
  console.log('→ ' + path.relative(ROOT, SALIDA) + ' (' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB)');
})().catch((e) => { console.error(e); process.exit(1); });
