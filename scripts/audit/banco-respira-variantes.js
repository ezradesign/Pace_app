/* BANCO s165 · TODAS LAS FORMAS DE DECIR «CUANTO QUEDA», SOBRE LA APP REAL
 * ========================================================================
 * El encargo del usuario: revisar las 20 rutinas y traer TODAS las opciones,
 * incluidas las que no estabamos explorando. Esto no maqueta ninguna: coge la
 * sesion de verdad, ya conducida hasta el estado que interesa, y sustituye SOLO
 * el indicador — por CSS o reescribiendo ese nodo. Todo lo demas (papel,
 * atmosfera, loto, tipografia, tokens de la paleta) es el de la app.
 *
 * POR QUE ASI Y NO CON UNA HOJA HTML APARTE: una maqueta con los valores
 * copiados a mano es exactamente la evidencia que en s149 no reprodujo. Aqui la
 * unica diferencia entre dos fotos es el indicador.
 *
 * TRES ESPECIMENES, uno por familia de ritmo (censo-respira-ritmos.js):
 *   · Box 4·4·4·4    — por tiempo, 19 ciclos de 16 s, cuenta atras SIEMPRE
 *   · Rondas express — por bloques, 2 rondas, fases de 2 s, cuenta atras NUNCA
 *   · Rondas profundas — por bloques, 5 rondas (premium: se siembra el estado)
 *
 * TRAMPAS: las de banco-respira.js (fastForward de 1 s en 1 s, heading para
 * abrir, modal de apnea con boton disabled) + la que cazo este banco en su
 * primera pasada: sin `animations:'disabled'` el loto sigue moviendose entre
 * disparo y disparo y mete una variable ajena en la comparacion.
 *
 * Uso:  node banco-respira-variantes.js <repo> <salida>
 */
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const REPO = process.argv[2] || process.cwd();
const SALIDA = process.argv[3] || path.join(REPO, '_revision-respira');
const { chromium } = require(require.resolve('@playwright/test', { paths: [REPO] }));

const PORT = 8795;
const BASE = 'http://localhost:' + PORT;

/* ---------- las variantes, como inyecciones sobre el DOM real ---------- */

/* Reemplaza el contenido del indicador de sesion por otro, conservando el nodo
   (asi el layout sigue siendo el de la app y no el de una maqueta). */
/* Los argumentos llegan como UN valor (Playwright pasa uno solo), asi que se
   desestructuran: escrito con tres parametros, `sel` recibia el array entero y
   `querySelector` reventaba con el HTML dentro del selector. */
const PINTAR = ([sel, html, estilo]) => {
  const n = document.querySelector(sel);
  if (!n) return 'sin nodo ' + sel;
  n.setAttribute('data-banco-original', n.getAttribute('style') || '');
  if (estilo) n.setAttribute('style', estilo);
  n.innerHTML = html;
  return 'ok';
};

const VARIANTES_TIEMPO = [
  { id: 'T0', titulo: 'Hoy · segmentada por ciclos', desde: 'head' },
  { id: 'T1', titulo: 'Barra continua (4B)' },
  {
    id: 'T2', titulo: 'Hairline a sangre en el borde',
    css: '[data-pace-breathe-progress]{position:fixed!important;left:0!important;right:0!important;'
       + 'bottom:0!important;top:auto!important;max-width:none!important;width:100%!important;'
       + 'height:2px!important;border-radius:0!important;background:transparent!important;margin:0!important}'
       + '[data-pace-breathe-progress]>div{border-radius:0!important}',
  },
  { id: 'T3', titulo: 'Sin indicador de sesion', css: '[data-pace-breathe-progress]{display:none!important}' },
  {
    id: 'T4', titulo: 'Barra fina, sin carril',
    css: '[data-pace-breathe-progress]{height:2px!important;background:transparent!important;max-width:180px!important}',
  },
  {
    id: 'T5', titulo: 'Aro de sesion alrededor del loto (choca con s139)',
    css: '[data-pace-breathe-progress]{display:none!important}',
    js: (round, rounds, frac) => ({ aro: frac }),
  },
];

const VARIANTES_RONDAS = [
  { id: 'R0', titulo: 'Hoy · barra de 2 segmentos + cabecera + texto', desde: 'head' },
  { id: 'R1', titulo: 'Puntos junto al texto, sin cabecera (1C)',
    css: '[data-pace-breathe-round-label]{display:none!important}' },
  { id: 'R2', titulo: 'Puntos junto al texto, con cabecera' },
  {
    id: 'R3', titulo: 'Segmentos estilo Mueve, sin relleno por respiraciones',
    css: '[data-pace-breathe-round-label]{display:none!important}\n[data-pace-breathe-round]{display:none!important}',
    /* Segmentos con el vocabulario de MoveSessionV1: el bloque EN CURSO es mas
       alto y con carril; los pasados, llenos; los pendientes, finos. Sin
       relleno interior -> la barra cuenta rondas y el texto respiraciones. */
    js: (round, rounds) => {
      const seg = i => {
        const est = i < round - 1
          ? 'height:6px;background:var(--breathe)'
          : (i === round - 1 ? 'height:6px;background:var(--line)' : 'height:2px;background:var(--paper-3)');
        return '<div style="flex:1;border-radius:2px;' + est + '"></div>';
      };
      let h = '';
      for (let i = 0; i < rounds; i++) h += seg(i);
      /* Va al FINAL del centro, donde vive la barra de la familia por tiempo —
         no dentro de la fila del texto. En la primera pasada se pinto ahi y
         partio «RESPIRACION 9 DE 35» en dos lineas: la variante habria perdido
         por un defecto del banco. */
      return { barra: h };
    },
  },
  { id: 'R4', titulo: 'Sin indicador: solo cabecera y texto',
    css: '[data-pace-breathe-round]{display:none!important}' },
  {
    id: 'R5', titulo: 'Aro de sesion alrededor del loto (choca con s139)',
    /* Sin `;` entre las dos reglas: un punto y coma suelto en el nivel superior
       de una hoja es un error de parseo y se lleva por delante la regla que
       viene detras — en la primera pasada los puntos siguieron pintados. */
    css: '[data-pace-breathe-round-label]{display:none!important}\n[data-pace-breathe-round]{display:none!important}',
    /* El arco que s139 descarto por «medir». Se dibuja donde viviria: sobre el
       visual, un anillo con el mismo trazo que los hairlines del loto. */
    js: (round, rounds, frac) => ({ aro: frac }),
  },
];

/* Cuelga una barra al final del cuerpo central — el sitio donde la familia por
   tiempo pone la suya, con su mismo ancho maximo. */
const PONER_BARRA = (html) => {
  const body = document.querySelector('[data-pace-session-center-body]');
  if (!body) return 'sin centro';
  const div = document.createElement('div');
  div.setAttribute('data-banco-aro', '1');   // misma limpieza que el aro
  div.setAttribute('style', 'display:flex;gap:4px;align-items:center;height:10px;'
    + 'width:100%;max-width:260px;margin:0 auto;flex-shrink:0');
  div.innerHTML = html;
  body.appendChild(div);
  return 'ok';
};

const PONER_ARO = (frac) => {
  /* El nodo REAL del loto, no «el primer hijo del centro» — esa suposicion dio
     un aro de 4 px en la primera pasada. Y el arco se cuelga del PADRE: el
     wrapper escala con la respiracion, y un aro de sesion que late seria otra
     cosa. Radio = el del hairline exterior, que vive en `inset: 14%`, para que
     caiga exactamente sobre la linea que el loto ya tiene. */
  const visualNodo = document.querySelector('[data-pace-breathe-visual]');
  if (!visualNodo) return 'sin visual';
  const visual = visualNodo.parentElement;
  /* El radio NO se calcula del `inset: 14%` de la hoja: se MIDE sobre el
     hairline exterior que ya esta pintado. Calculado dio 147 px donde la linea
     real esta a 126, y el aro salia flotando por fuera — otra vez «deducir en
     vez de medir», esta vez dentro del instrumento. */
  let aroExistente = null;
  for (const n of visualNodo.querySelectorAll('div')) {
    const cs = getComputedStyle(n);
    if (cs.borderRadius.indexOf('50%') === 0 && parseFloat(cs.borderTopWidth) > 0) {
      const rr = n.getBoundingClientRect();
      if (!aroExistente || rr.width > aroExistente.width) aroExistente = rr;
    }
  }
  const r = aroExistente || visualNodo.getBoundingClientRect();
  const d = Math.min(r.width, r.height);
  const radio = d / 2;
  const c = 2 * Math.PI * radio;
  /* Se coloca por COORDENADAS medidas contra el padre, no con un 50 % que
     supone que los dos centros coinciden: el padre es el cuerpo del centro y su
     mitad vertical no es la del loto. */
  const rp = visual.getBoundingClientRect();
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', d); svg.setAttribute('height', d);
  svg.setAttribute('style', 'position:absolute;pointer-events:none;overflow:visible;'
    + 'left:' + (r.left - rp.left + (r.width - d) / 2) + 'px;'
    + 'top:' + (r.top - rp.top + (r.height - d) / 2) + 'px;'
    + 'transform:rotate(-90deg)');
  const arco = document.createElementNS(ns, 'circle');
  arco.setAttribute('cx', d / 2); arco.setAttribute('cy', d / 2); arco.setAttribute('r', radio);
  arco.setAttribute('fill', 'none');
  arco.setAttribute('stroke', 'var(--breathe)');
  /* Mismo peso que los hairlines que ya viven ahi (1 px), no el trazo pleno del
     acento: un esbozo mas gordo que la linea que va a sustituir se juzgaria por
     su peso y no por su idea. */
  arco.setAttribute('stroke-width', '1');
  arco.setAttribute('stroke-linecap', 'round');
  arco.setAttribute('stroke-dasharray', (c * frac) + ' ' + c);
  svg.appendChild(arco);
  visual.style.position = 'relative';
  visual.appendChild(svg);
  svg.setAttribute('data-banco-aro', '1');
  return 'ok';
};

/* ---------- conduccion ---------- */

async function nuevaPagina(browser, premium) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }, locale: 'es-ES', colorScheme: 'light', deviceScaleFactor: 2,
  });
  await context.addInitScript(([c, e]) => {
    localStorage.setItem(c, JSON.stringify(e));
  }, ['pace.state.v2', {
    firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema',
    premiumUnlocked: !!premium,
  }]);
  const page = await context.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errores.push('console: ' + m.text()); });
  return { context, page, errores };
}

async function abrirSesion(page, artefacto, rutina) {
  await page.clock.install();
  await page.goto(BASE + artefacto);
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: rutina, exact: true }).click();
  const modal = page.locator('[data-pace-modal-backdrop]');
  if (await modal.count()) {
    await modal.locator('input[type=checkbox]').check();
    await modal.getByRole('button', { name: 'Empezar sesión' }).click();
  }
  const ahora = page.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' });
  if (await ahora.count()) await ahora.click();
  else await page.clock.fastForward(3500);
  await page.waitForTimeout(200);
}

async function avanzar(page, segundos) {
  for (let s = 0; s < segundos; s++) { await page.clock.fastForward(1000); await page.waitForTimeout(20); }
}

async function disparar(page, nombre) {
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SALIDA, nombre + '.png'), animations: 'disabled' });
  console.log('  · ' + nombre);
}

/* Una pasada por especimen: se conduce UNA vez y cada variante se pone, se
   fotografia y se quita. Asi las N fotos comparten estado exacto. */
async function pasada(browser, cfg) {
  const { artefacto, rutina, premium, segundos, variantes, prefijo, round, rounds, frac, hastaRonda } = cfg;
  const { context, page, errores } = await nuevaPagina(browser, premium);
  const conducir = async () => {
    await abrirSesion(page, artefacto, rutina);
    /* Las rondas se fotografian en la RONDA 2 y no en la 1: en la primera no hay
       ni un bloque completado, asi que la mitad de las variantes (los puntos, la
       barra segmentada, el aro) se veria vacia y no se estaria comparando nada.
       Llegar alli exige cruzar la retencion con su boton. */
    for (let r = 1; r < (hastaRonda || 1); r++) {
      await avanzar(page, 200);
      await page.getByRole('button', { name: 'Respirar de nuevo' }).click();
      await page.waitForTimeout(150);
    }
    await avanzar(page, segundos);
  };
  await conducir();
  for (const v of variantes) {
    if (v.desde === 'head' && artefacto !== '/_revision-head.html') continue;
    if (v.desde !== 'head' && artefacto === '/_revision-head.html') continue;
    let tag = null;
    if (v.css) tag = await page.addStyleTag({ content: v.css });
    let pintado = null;
    if (v.js) {
      const spec = v.js(round, rounds, frac);
      if (spec.aro != null) await page.evaluate(PONER_ARO, spec.aro);
      else if (spec.barra != null) { pintado = spec; await page.evaluate(PONER_BARRA, spec.barra); }
      else { pintado = spec; await page.evaluate(PINTAR, [spec.sel, spec.html, spec.estilo]); }
    }
    await disparar(page, prefijo + '-' + v.id);
    if (tag) await tag.evaluate(el => el.remove());
    await page.evaluate(() => {
      document.querySelectorAll('[data-banco-aro]').forEach(n => n.remove());
      document.querySelectorAll('[data-banco-original]').forEach(n => {
        n.setAttribute('style', n.getAttribute('data-banco-original'));
        n.removeAttribute('data-banco-original');
      });
    });
    /* Reescribir el `innerHTML` de un nodo que React gobierna no se deshace
       solo: se rehace la pasada desde cero para que la siguiente variante no
       herede un arbol que React ya no reconoce. */
    if (pintado) { await page.reload().catch(() => {}); await conducir(); }
  }
  await context.close();
  return errores;
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = spawn(process.execPath, ['.claude/static-server.js'], {
    cwd: REPO, env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'ignore',
  });
  const errores = [];
  try {
    for (let i = 0; i < 60; i++) {
      try { const r = await fetch(BASE + '/index.html', { method: 'HEAD' }); if (r.ok) break; }
      catch (e) {}
      await new Promise(r => setTimeout(r, 200));
    }
    const browser = await chromium.launch();

    /* frac = fraccion de sesion transcurrida en el instante del disparo. Por
       tiempo es 90/300; en rondas, la ronda completada mas lo andado de la
       actual: (round-1 + resp/respiraciones) / rondas. */
    const BOX = { rutina: 'Box 4·4·4·4', segundos: 90, variantes: VARIANTES_TIEMPO, prefijo: 'tiempo', frac: 90 / 300 };
    const R2 = { rutina: 'Rondas express', segundos: 30, variantes: VARIANTES_RONDAS, prefijo: 'rondas2',
      round: 2, rounds: 2, hastaRonda: 2, frac: (1 + 8 / 25) / 2 };
    const R5 = { rutina: 'Rondas profundas', premium: true, segundos: 30, variantes: VARIANTES_RONDAS,
      prefijo: 'rondas5', round: 2, rounds: 5, hastaRonda: 2, frac: (1 + 8 / 35) / 5 };

    for (const [titulo, cfg] of [['POR TIEMPO · Box 4·4·4·4 (90 s de 300)', BOX],
                                 ['RONDAS · Rondas express, 2 rondas (ronda 2)', R2],
                                 ['RONDAS · Rondas profundas, 5 rondas (ronda 2)', R5]]) {
      console.log(titulo);
      errores.push(...await pasada(browser, Object.assign({ artefacto: '/_revision-head.html' }, cfg)));
      errores.push(...await pasada(browser, Object.assign({ artefacto: '/index.html' }, cfg)));
    }

    await browser.close();
    console.log('\nconsola: ' + (errores.length === 0 ? 'LIMPIA en las seis pasadas' : errores.join('\n  ')));
  } finally { srv.kill(); }
})().catch(e => { console.error('BANCO ROTO:', e.message); process.exit(1); });
