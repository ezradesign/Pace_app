/* PACE · scripts/audit/censo-runner-solape.js (sesión 177)
   ========================================================
   RECORRE LAS 28 RUTINAS DE MUEVE Y ESTIRA, PASO A PASO, Y MIDE DOS COSAS:

     1. EL SOLAPE. El usuario reportó, mirando la app, que la barra de progreso
        se superpone con las letras -- «SEGUNDOS» en un caso y «CUÍDATE» en otro.
        La causa está localizada: s176 ancló la barra al centro dándole al bloque
        `flex: 1 1 auto; min-height: 0`, y eso le permite ENCOGER por debajo de
        su contenido. El bloque encoge, el texto no, y el texto pinta encima.
     2. EL SALTO. «Entre paso y paso no debe haber ningún salto visual de
        elemento, barra de progreso o posición del texto.» Se registra el `top`
        de cada pieza en cada paso y se informa del recorrido.

   POR QUÉ SE MIDEN LOS HIJOS Y NO EL BLOQUE: con `min-height: 0` el bloque
   informa de su alto YA ENCOGIDO, así que su `getBoundingClientRect()` dice que
   todo cabe mientras el texto se sale por abajo. El desbordamiento sólo se ve
   preguntando a las piezas de dentro, una por una.

   Uso: node scripts/audit/censo-runner-solape.js [puerto] [ancho] [alto]
        (necesita el servidor: node .claude/static-server.js)
   Sólo lee. No escribe nada en el repo.
*/
'use strict';
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', 'playwright'));

const PUERTO = process.argv[2] || '8765';
const W = parseInt(process.argv[3] || '1536', 10);
const H = parseInt(process.argv[4] || '714', 10);
const MAX_PASOS = 40;

/* Las piezas del runner, en el orden en que se pintan. El `?` de `care` es
   porque sólo existe en las pantallas de trabajo. */
const PIEZAS = [
  ['glifo', '[data-pace-v1-glyph]'],
  ['rotulo', '[data-pace-v1-kicker]'],
  ['nombre', '[data-pace-v1-name]'],
  ['cue', '[data-pace-v1-cue]'],
  ['numero', '[data-pace-v1-timer]'],
  ['apoyo', '[data-pace-v1-support-strong]'],
  ['cuidate', '[data-pace-v1-care]'],
  ['barra', '[data-pace-v1-progress]'],
];

/* LA MEDIDA. Corre dentro de la página; devuelve la geometría de un paso.
   TODA CONSULTA FILTRA POR CAJA NO NULA -- va por diez (s176). */
function medirPaso(piezas) {
  const vis = (sel) => [...document.querySelectorAll(sel)]
    .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })[0] || null;
  const caja = (e) => { const r = e.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: r.height }; };

  const out = { piezas: {}, solapes: [] };
  for (const [nom, sel] of piezas) { const e = vis(sel); if (e) out.piezas[nom] = caja(e); }

  const barra = vis('[data-pace-v1-progress]');
  const cuerpo = vis('[data-pace-v1-body]');
  if (!barra || !cuerpo) return out;
  const rb = barra.getBoundingClientRect();
  out.barraTop = rb.top;

  /* EL SOLAPE, pieza a pieza. Se recorren los descendientes del cuerpo que
     tengan texto propio y se mira si su caja pisa la de la barra. Se pide texto
     propio para no contar dos veces al padre y al hijo. */
  const dentro = [...cuerpo.querySelectorAll('*')].filter(e => {
    const r = e.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return false;
    const propio = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    return propio;
  });
  for (const e of dentro) {
    const r = e.getBoundingClientRect();
    if (r.bottom > rb.top + 0.5) {
      out.solapes.push({
        texto: (e.textContent || '').trim().slice(0, 42),
        px: Math.round((r.bottom - rb.top) * 10) / 10,
      });
    }
  }
  /* Y EL DESBORDE DEL BLOQUE, que es la causa y no el síntoma. */
  const rc = cuerpo.getBoundingClientRect();
  out.desborde = Math.round((cuerpo.scrollHeight - rc.height) * 10) / 10;

  /* LAS DOS DISTANCIAS QUE PIDE EL USUARIO: del final de la descripción al
     número, y del final del grupo del número a la barra. */
  const cue = vis('[data-pace-v1-cue]'), num = vis('[data-pace-v1-timer]');
  if (cue && num) {
    const etiqueta = num.nextElementSibling;
    const re = etiqueta ? etiqueta.getBoundingClientRect() : num.getBoundingClientRect();
    out.arriba = Math.round((num.getBoundingClientRect().top - cue.getBoundingClientRect().bottom) * 10) / 10;
    out.abajo = Math.round((rb.top - re.bottom) * 10) / 10;
  }
  return out;
}

/* ── conducción de la app ────────────────────────────────────────────────── */
async function abrirBiblioteca(p, boton) {
  await p.evaluate((b) => {
    const x = [...document.querySelectorAll('button')]
      .filter(e => e.getBoundingClientRect().width > 0)
      .find(e => e.textContent.trim().startsWith(b));
    if (!x) throw new Error('no encuentro el botón ' + b);
    x.click();
  }, boton);
  await p.locator('.pace-lib').first().waitFor({ state: 'visible', timeout: 15000 });
  await p.waitForTimeout(650);
}

async function tarjetas(p) {
  return p.evaluate(() => [...document.querySelectorAll('[data-pace-lib-card]')]
    .filter(e => e.getBoundingClientRect().width > 0)
    .map(e => (e.querySelector('h4') || e).textContent.trim().slice(0, 40)));
}

/* «Empezar» se busca DENTRO del último modal: en todo el documento se encuentra
   antes el «Empezar foco» de la home, que arranca el Pomodoro (s176). */
async function empezar(p) {
  return p.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')]
      .filter(e => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    const b = [...raiz.querySelectorAll('button')]
      .filter(x => x.getBoundingClientRect().width > 0)
      .find(x => /^Empezar/i.test((x.textContent || '').trim()));
    if (!b) return false;
    b.click(); return true;
  });
}

async function siguiente(p) {
  return p.evaluate(() => {
    const pie = document.querySelector('[data-pace-session-footer]');
    const b = [...(pie || document).querySelectorAll('button')]
      .filter(x => x.getBoundingClientRect().width > 0)
      .find(x => /Siguiente|Empezar|Terminar|Hecho|Listo/i.test(x.textContent || ''));
    if (!b) return null;
    const etiqueta = (b.textContent || '').trim();
    b.click(); return etiqueta;
  });
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  /* Semilla: se marca el onboarding como visto para caer directo en la home.
     `addInitScript` corre en CADA navegación, así que la semilla va COMPLETA y
     no a secas -- una semilla parcial machaca la persistencia (s154). */
  /* LA SEMILLA ES `firstSeen` (Onboarding.jsx:36), como dice `tests/helpers.js`.
     Con la clave equivocada la app se monta DEBAJO del overlay de bienvenida:
     los selectores siguen encontrándolo todo y las medidas salen, así que el
     error no se nota leyendo la tabla. */
  await p.addInitScript(() => {
    if (!localStorage.getItem('pace.state.v2')) {
      localStorage.setItem('pace.state.v2', JSON.stringify({
        firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', soundOn: false,
      }));
    }
  });
  await p.goto('http://localhost:' + PUERTO + '/index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  if (await p.evaluate(() => /Antídoto a la silla|Tres preguntas breves/i.test(document.body.innerText || ''))) {
    console.error('GUARD: la app está en el ONBOARDING -- la semilla no entró');
    process.exit(2);
  }

  const informe = [];
  for (const [modulo, boton] of [['Mueve', 'Mueve'], ['Estira', 'Estira']]) {
    await abrirBiblioteca(p, boton);
    const nombres = await tarjetas(p);
    /* GUARD DE CERO (s169): una biblioteca vacía daría «ningún solape», que se
       lee igual que «todo bien». */
    if (!nombres.length) { console.error('GUARD: 0 tarjetas en ' + modulo); process.exit(2); }
    console.log('\n' + modulo + ': ' + nombres.length + ' rutinas');
    await p.keyboard.press('Escape');
    await p.waitForTimeout(400);

    for (let i = 0; i < nombres.length; i++) {
      await abrirBiblioteca(p, boton);
      const abrio = await p.evaluate((idx) => {
        const cs = [...document.querySelectorAll('[data-pace-lib-card]')]
          .filter(e => e.getBoundingClientRect().width > 0);
        const c = cs[idx]; if (!c) return false;
        const hit = c.querySelector('.pace-lib-hit') || c;
        hit.click(); return true;
      }, i);
      if (!abrio) { console.log('  [' + nombres[i] + '] no se pudo abrir'); continue; }
      await p.waitForTimeout(900);
      if (!await empezar(p)) {
        console.log('  ' + nombres[i].padEnd(30) + ' sin «Empezar» (premium o bloqueada)');
        await p.keyboard.press('Escape'); await p.waitForTimeout(300);
        await p.keyboard.press('Escape'); await p.waitForTimeout(300);
        continue;
      }
      await p.locator('[data-pace-v1-body]').first().waitFor({ state: 'visible', timeout: 20000 });
      await p.waitForTimeout(450);

      const pasos = [];
      for (let s = 0; s < MAX_PASOS; s++) {
        const m = await p.evaluate(medirPaso, PIEZAS);
        if (!m.barraTop) break;
        pasos.push(m);
        const et = await siguiente(p);
        if (!et || /Terminar|Hecho|Listo/i.test(et)) break;
        await p.waitForTimeout(320);
      }
      informe.push({ modulo, nombre: nombres[i], pasos });
      /* de vuelta a la home para la siguiente rutina */
      await p.keyboard.press('Escape'); await p.waitForTimeout(250);
      await p.evaluate(() => {
        const b = [...document.querySelectorAll('button')]
          .filter(x => x.getBoundingClientRect().width > 0)
          .find(x => /Salir|Terminar/i.test(x.textContent || ''));
        if (b) b.click();
      });
      await p.waitForTimeout(600);
      await p.evaluate(() => {
        const b = [...document.querySelectorAll('button')]
          .filter(x => x.getBoundingClientRect().width > 0)
          .find(x => /Salir|S.$|Confirmar/i.test(x.textContent || ''));
        if (b) b.click();
      });
      await p.waitForTimeout(700);
      process.stdout.write('.');
    }
  }
  await browser.close();

  /* ── informe ───────────────────────────────────────────────────────────── */
  const f1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
  console.log('\n\n============================================================');
  console.log('CENSO DEL RUNNER · ' + W + 'x' + H + ' · ' + informe.length + ' rutinas recorridas');
  console.log('============================================================');

  let conSolape = 0, pasosTotal = 0, pasosSolapados = 0, peor = null;
  console.log('\n1 · SOLAPE CON LA BARRA DE PROGRESO');
  for (const r of informe) {
    const malos = r.pasos.map((m, i) => ({ i, m })).filter(x => x.m.solapes.length);
    pasosTotal += r.pasos.length;
    pasosSolapados += malos.length;
    if (!malos.length) continue;
    conSolape++;
    const px = Math.max(...malos.map(x => Math.max(...x.m.solapes.map(s => s.px))));
    if (!peor || px > peor.px) peor = { px, ruta: r.modulo + ' · ' + r.nombre };
    console.log('  ' + (r.modulo + ' · ' + r.nombre).padEnd(38) +
      malos.length + '/' + r.pasos.length + ' pasos · hasta ' + f1(px) + ' px dentro de la barra');
    for (const x of malos.slice(0, 2)) {
      for (const s of x.m.solapes.slice(0, 2)) {
        console.log('      paso ' + (x.i + 1) + ': «' + s.texto + '» +' + f1(s.px) + ' px');
      }
    }
  }
  if (!conSolape) console.log('  ninguna rutina solapa');
  else console.log('\n  TOTAL: ' + conSolape + ' de ' + informe.length + ' rutinas · ' +
    pasosSolapados + ' de ' + pasosTotal + ' pasos · el peor, ' + f1(peor.px) + ' px en ' + peor.ruta);

  console.log('\n2 · SALTO ENTRE PASOS   (recorrido del `top` de cada pieza dentro de una rutina)');
  console.log('  ' + 'rutina'.padEnd(38) + PIEZAS.map(x => x[0].slice(0, 7).padStart(8)).join(''));
  const global = {};
  for (const r of informe) {
    const cel = [];
    for (const [nom] of PIEZAS) {
      const vs = r.pasos.map(m => m.piezas[nom] && m.piezas[nom].top).filter(v => v != null);
      if (vs.length < 2) { cel.push('-'.padStart(8)); continue; }
      const d = Math.max(...vs) - Math.min(...vs);
      global[nom] = Math.max(global[nom] || 0, d);
      cel.push((d < 0.5 ? '0' : f1(d)).padStart(8));
    }
    console.log('  ' + (r.modulo + ' · ' + r.nombre).slice(0, 37).padEnd(38) + cel.join(''));
  }
  console.log('  ' + 'PEOR DE TODAS'.padEnd(38) +
    PIEZAS.map(x => (global[x[0]] == null ? '-' : f1(global[x[0]])).padStart(8)).join(''));

  console.log('\n3 · ¿ESTÁ EL NÚMERO EQUIDISTANTE?   (hueco arriba: de la descripción al número ·');
  console.log('     hueco abajo: del final del grupo a la barra)');
  const ar = [], ab = [];
  for (const r of informe) {
    for (const m of r.pasos) {
      if (m.arriba != null) { ar.push(m.arriba); ab.push(m.abajo); }
    }
  }
  if (ar.length) {
    const med = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    console.log('  arriba: de ' + f1(Math.min(...ar)) + ' a ' + f1(Math.max(...ar)) + ' px (media ' + f1(med(ar)) + ')');
    console.log('  abajo : de ' + f1(Math.min(...ab)) + ' a ' + f1(Math.max(...ab)) + ' px (media ' + f1(med(ab)) + ')');
    console.log('  → el desequilibrio medio es de ' + f1(Math.abs(med(ar) - med(ab))) + ' px');
  } else console.log('  ningún paso con número medible');

  console.log('\n--- lo que este censo NO cubre ---');
  console.log('  · un solo viewport: ' + W + 'x' + H + '. Móvil y otras alturas van aparte');
  console.log('  · las rutinas premium no se recorren: no dan «Empezar» sin entitlement');
  console.log('  · mide CAJAS, no píxeles pintados: un texto puede caber y verse apretado');
  console.log('  · el salto se mide entre pasos de UNA rutina, no entre rutinas distintas');
})();
