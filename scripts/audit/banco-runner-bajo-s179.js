#!/usr/bin/env node
/**
 * banco-runner-bajo-s179.js — ¿DÓNDE empieza a solapar el runner al bajar la altura?
 *
 * POR QUÉ NO VALE EL CENSO DE s177. `censo-runner-solape.js` recorre las 28 rutinas paso a
 * paso y tarda ~3 min POR VIEWPORT: barrer diez alturas con él son treinta minutos. Aquí se
 * abre UNA rutina que ya se sabe que reproduce, se para en el paso que solapa, y se cambia
 * el viewport sin recargar. La pregunta es otra —el umbral, no el censo— y por eso el
 * instrumento es otro.
 *
 * QUÉ CONTESTA:
 *   1. A qué altura EXACTA aparece el solape, barriendo de arriba abajo.
 *   2. Cuánto le falta al bloque en cada altura (el desborde, que es la causa).
 *   3. Qué pasa en MÓVIL, donde la piel es otra y el ancho también aprieta.
 *
 * LO QUE MIDE Y LO QUE NO: mide CAJAS, igual que el censo de s177 — un texto puede caber y
 * verse apretado. Y mide UNA rutina: sirve para encontrar el umbral, no para decir cuántas
 * rutinas solapan, que es lo que contesta el censo.
 *
 * OJO CON EL ALCANCE DECLARADO: la decisión de s177 dice «min-height: 641, y por debajo NO se
 * aplica». Medido en s179, a 1280x641 y a 1280x630 NO solapa, así que el umbral real está más
 * abajo que el declarado. Este banco existe para poner el número.
 *
 * Uso: node scripts/audit/banco-runner-bajo-s179.js [puerto]
 *      (necesita el servidor: PORT=8765 node .claude/static-server.js)
 * Sólo lee. No escribe nada en el repo.
 */
'use strict';
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', 'playwright'));

const PUERTO = process.argv[2] || '8765';
const BASE = 'http://localhost:' + PUERTO;

/* La rutina y el paso: `Caderas de pie` (s178) reproduce a 1280x600 en su paso 4, que es una
   pantalla de cambio de lado — el texto que se mete en la barra es siempre el de la cola. */
const RUTINA = 'Caderas de pie';
const PASOS_HASTA = 4;

/* De más alto a más bajo. 660 y 641 son los que s177 declaró buenos; el resto busca el borde. */
const ALTURAS = [660, 641, 630, 620, 610, 600, 590, 575, 560];
/* s179b · SE AMPLIA EL BARRIDO MOVIL. La primera pasada saltaba de 360x740 (que aguanta con
   solo 14,8 px de holgura) a 360x640, y entre medias cae **375x667 — el iPhone SE/8**, que
   queda JUSTO POR ENCIMA del umbral de 660 del tramo nuevo y por tanto sin proteccion. Es
   el mismo error que s177 cometio declarando 641 cuando el borde real estaba en 575: un
   umbral no se declara, se mide por los dos lados. */
const MOVIL = [[390, 844], [375, 812], [360, 740], [375, 667], [360, 700], [360, 680],
               [360, 661], [390, 700], [360, 640], [360, 600]];

/* La semilla: `firstSeen`, NO `onboarded`. Con la clave mal puesta la app se monta DEBAJO del
   overlay de bienvenida, los selectores lo encuentran todo, las medidas salen correctas y la
   cámara fotografía la bienvenida (s177). */
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema' };

function medir() {
  const vis = (sel) => [...document.querySelectorAll(sel)]
    .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })[0] || null;
  const barra = vis('[data-pace-v1-progress]');
  const cuerpo = vis('[data-pace-v1-body]');
  if (!barra || !cuerpo) return { error: 'sin barra o sin cuerpo: el runner no esta montado' };
  const rb = barra.getBoundingClientRect();

  /* Se piden los descendientes con TEXTO PROPIO para no contar dos veces al padre y al hijo,
     igual que el censo de s177. */
  const dentro = [...cuerpo.querySelectorAll('*')].filter(e => {
    const r = e.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return false;
    return [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  });
  let peor = 0, quien = '';
  for (const e of dentro) {
    const r = e.getBoundingClientRect();
    const px = r.bottom - rb.top;
    if (px > peor) { peor = px; quien = (e.textContent || '').trim().slice(0, 38); }
  }
  const rc = cuerpo.getBoundingClientRect();
  let fondo = 0;
  for (const e of dentro) fondo = Math.max(fondo, e.getBoundingClientRect().bottom);
  /* EN QUE PASO SE ESTA MIDIENDO, y no es un adorno: contar clics NO garantiza llegar al
     mismo sitio en todos los viewports —un gate de colocacion puede pedir un toque de mas— y
     comparar filas que miden pasos distintos da una tabla no monotona que parece un hallazgo
     y es ruido. Si esta columna no es la misma en todas las filas, la tabla no vale. */
  const nom = vis('[data-pace-v1-name]');
  const kick = vis('[data-pace-v1-kicker]');
  return {
    paso: (nom ? nom.textContent.trim().slice(0, 22) : '?') +
          (kick && kick.textContent.trim() ? ' / ' + kick.textContent.trim().slice(0, 12) : ''),
    solape: peor > 0.5 ? Math.round(peor * 10) / 10 : 0,
    quien: peor > 0.5 ? quien : '',
    /* El DESBORDE del bloque es la causa; el solape es el sintoma. Con `min-height: 0` el
       bloque informa de su alto YA ENCOGIDO, asi que hay que restar a mano. */
    desborde: Math.round((fondo - rc.bottom) * 10) / 10,
    bloque: Math.round(rc.height * 10) / 10,
    barraTop: Math.round(rb.top * 10) / 10,
  };
}

async function abrirRutina(p) {
  await p.evaluate((n) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const c = [...document.querySelectorAll('[data-pace-lib-card]')]
      .filter(vis).find(e => (e.textContent || '').includes(n));
    if (!c) throw new Error('no aparece la tarjeta: ' + n);
    /* SE PULSA `.pace-lib-hit`, NO LA TARJETA. La tarjeta clicable no es un `role="button"`
       (decisión s174) y el destino del clic es un elemento propio dentro de ella: pulsar el
       contenedor no abre nada, y el sintoma es que el «ultimo modal» sigue siendo la
       biblioteca. Costo una pasada entera del banco. */
    (c.querySelector('.pace-lib-hit') || c).click();
  }, RUTINA);
  /* Se ESPERA al Preview en vez de dormir un rato: dormir da timeouts mudos a alturas bajas,
     donde el modal tarda mas en asentar. Es la espera que ya hace el censo de s177. */
  await p.locator('[data-pace-modal-card]').last().waitFor({ state: 'visible', timeout: 10000 });
  await p.waitForTimeout(350);
  /* «Empezar» se busca DENTRO del último modal: en todo el documento se encuentra antes el
     «Empezar foco» de la home, que arranca el Pomodoro (s176). */
  const r = await p.evaluate(() => {
    const vis = e => { const q = e.getBoundingClientRect(); return q.width > 0 && q.height > 0; };
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')].filter(vis);
    const raiz = ms[ms.length - 1] || document;
    const botones = [...raiz.querySelectorAll('button')].filter(vis)
      .map(x => (x.textContent || '').trim().slice(0, 24));
    const b = [...raiz.querySelectorAll('button')].filter(vis)
      .find(x => /^Empezar/i.test((x.textContent || '').trim()));
    if (!b) return { ok: false, modales: ms.length, botones };
    b.click(); return { ok: true };
  });
  /* Si no esta, se DICE QUE HAY en vez de solo que falta: «no lo encuentro» y «no existe»
     se parecen demasiado, y adivinar cual es fue lo que costo la primera pasada. */
  if (!r.ok) throw new Error('sin «Empezar» · modales=' + r.modales + ' · botones=[' + r.botones.join(' | ') + ']');
  await p.waitForTimeout(1200);
}

async function avanzar(p, n) {
  for (let i = 0; i < n; i++) {
    await p.evaluate(() => {
      const b = [...document.querySelectorAll('button')]
        .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
        .find(x => /siguiente|saltar|listo|empezar/i.test((x.textContent || '').trim()));
      if (b) b.click();
    });
    await p.waitForTimeout(500);
  }
}

(async () => {
  const nav = await chromium.launch();
  const filas = [];

  for (const [w, h] of [...ALTURAS.map(a => [1280, a]), ...MOVIL]) {
    const ctx = await nav.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    await p.addInitScript((s) => localStorage.setItem('pace.state.v2', JSON.stringify(s)), SEMILLA);
    await p.goto(BASE + '/index.html', { waitUntil: 'load' });
    await p.waitForTimeout(900);

    /* GUARD DE CAMARA (s177): si la semilla no entró, la app se monta DEBAJO del overlay de
       bienvenida y todo lo de abajo mide bien sobre la pantalla equivocada. */
    const bienvenida = await p.evaluate(() =>
      !!document.querySelector('[data-pace-welcome], .pace-onboarding'));
    if (bienvenida) { console.error('GUARD: overlay de bienvenida montado a ' + w + 'x' + h); process.exit(2); }

    let r;
    try {
      await p.evaluate(() => {
        const vis = e => { const q = e.getBoundingClientRect(); return q.width > 0 && q.height > 0; };
        const b = [...document.querySelectorAll('button, [role="tab"]')]
          .filter(vis).find(e => /^Estira/.test((e.textContent || '').trim()));
        if (!b) throw new Error('sin entrada a Estira');
        b.click();
      });
      await p.waitForTimeout(800);
      await abrirRutina(p);
      await avanzar(p, PASOS_HASTA);
      r = await p.evaluate(medir);
    } catch (e) {
      r = { error: e.message.slice(0, 60) };
    }
    filas.push({ w, h, ...r });
    await ctx.close();
  }
  await nav.close();

  console.log('=== BANCO s179 · el runner al bajar la altura ===');
  console.log('rutina: ' + RUTINA + ' · paso ' + PASOS_HASTA + ' (cambio de lado)\n');
  console.log('viewport      solape   desborde   bloque   paso en que mide        texto que se mete');
  console.log('-----------  -------  ---------  -------  ----------------------  ------------------');
  for (const f of filas) {
    if (f.error) { console.log(String(f.w + 'x' + f.h).padEnd(12) + ' ERROR: ' + f.error); continue; }
    console.log(
      String(f.w + 'x' + f.h).padEnd(12) +
      String(f.solape || '-').padStart(8) +
      String(f.desborde).padStart(11) +
      String(f.bloque).padStart(9) +
      '  ' + String(f.paso || '?').padEnd(23) + ' ' + f.quien);
  }

  const rotos = filas.filter(f => f.solape > 0.5);
  const sanos = filas.filter(f => !f.error && !(f.solape > 0.5));
  console.log('\nSolapan: ' + rotos.length + ' de ' + filas.length + ' viewports.');
  if (!rotos.length) {
    console.log('GUARD: ni uno solapa. O esta arreglado, o la sonda no esta llegando al paso');
    console.log('que reproduce — y «cero» y «no he medido» se parecen demasiado.');
  } else {
    const peor = rotos.reduce((a, b) => (b.solape > a.solape ? b : a));
    console.log('El peor: ' + peor.w + 'x' + peor.h + ' con ' + peor.solape + ' px.');
    const limpioMasBajo = sanos.filter(f => f.w === 1280).sort((a, b) => a.h - b.h)[0];
    if (limpioMasBajo) console.log('El mas bajo que AGUANTA a 1280 de ancho: ' + limpioMasBajo.h + ' px de alto.');
  }
  console.log('\n--- lo que este banco NO cubre ---');
  console.log('  · UNA rutina: da el umbral, no cuantas rutinas solapan (eso es el censo de s177)');
  console.log('  · mide CAJAS, no pixeles pintados: un texto puede caber y verse apretado');
  console.log('  · un solo paso por viewport, el de cambio de lado, que es el que reproduce');
})();
