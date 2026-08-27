/* PACE · scripts/audit/banco-runner-s176.js (sesión 176)
   =======================================================
   LOS DOS DEFECTOS DEL RUNNER QUE REPORTÓ EL USUARIO, medidos y con variantes
   sobre la APP DE VERDAD -- no sobre una maqueta. Cada variante es una hoja de
   CSS inyectada encima del runner real, así que lo que se mide y se captura es
   el producto con un parche, que es lo más fiel que puede ser una maqueta.

   LO MEDIDO ANTES DE TOCAR NADA, a 1536x714 (la pantalla del usuario):

     pantalla        barra de progreso     pie/botones     hueco
     colócate        top 570,3             top 635         +32,2 px
     ejercicio       top 617,5             top 635         -15,0 px  <- SE SOLAPAN

   O sea: los dos reproducen. La barra está 47,2 px más abajo en el ejercicio
   que en el colócate, y allí se mete 15 px dentro del pie. La causa es que la
   barra FLUYE detrás del contenido y la pantalla de trabajo tiene dos piezas
   que la de colocarse no tiene -- el contador y el «Cuídate».

   Y EL CONTADOR SÍ ESTÁ EQUIDISTANTE: 10 px desde la descripción y 10,1 hasta
   el «Cuídate». El grupo entero (número + «SEGUNDOS») va de 408,7 a 550,9.

   Uso: node scripts/audit/banco-runner-s176.js <puerto> [ancho] [alto]
        (necesita el servidor: node .claude/static-server.js)
   Sólo lee y captura; no escribe en el repo salvo los PNG de su carpeta. */
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', 'playwright'));

const PUERTO = process.argv[2] || '8765';
const W = parseInt(process.argv[3] || '1536', 10);
const H = parseInt(process.argv[4] || '714', 10);
const SALIDA = path.join(ROOT, '_maqueta-s176-runner');

/* EL ANCLAJE DE LA BARRA. La barra es hermana del bloque de contenido dentro
   del centro de la sesión; hoy lleva `margin: 28px auto 0` EN LÍNEA (de ahí el
   `!important`) y cae donde la deje el contenido. Con `margin-top: auto` se
   pega al fondo del centro, así que su altura deja de depender de si la
   pantalla pinta contador -- que es exactamente lo que pidió el usuario:
   «siempre a la misma altura, referencia del colócate». */
/* ANCLAJE DE VERDAD: no basta con `margin-top: auto` en la barra. El bloque
   que la contiene (`center-body`) se CENTRA con `margin:auto` (s112) y por
   tanto su alto es el del contenido, asi que `auto` la pega al fondo del
   BLOQUE y no del centro -- medido: con eso el hueco hasta el pie salia 18 px
   en el ejercicio y 52 en colocarse, o sea seguian a distinta altura.
   Hace falta que el bloque OCUPE el centro entero (`height: 100%`) y sea una
   columna; entonces «auto» reparte la holgura real y la barra cae a la misma
   altura pinte contador o no. El margen superior ya lo anula s172b. */
const ANCLA2 = [
  '[data-pace-session-center-body]:has([data-pace-v1-body]) {',
  '  display: flex !important; flex-direction: column !important;',
  '  height: 100% !important; margin-bottom: 0 !important; }',
  '[data-pace-v1-progress] { margin-top: auto !important; margin-bottom: 16px !important; }',
].join('\n');

const ANCLA = [
  '[data-pace-v1-progress] { margin-top: auto !important; margin-bottom: 0 !important; }',
  /* y el centro tiene que poder repartir esa holgura: si no es una columna
     flexible, `auto` no ancla nada */
  '[data-pace-session-center-body]:has([data-pace-v1-body]) {',
  '  display: flex !important; flex-direction: column !important; }',
].join('\n');

const VARIANTES = {
  hoy: { titulo: 'HOY · publicado', css: '' },
  ancla: {
    titulo: 'A · sólo la barra anclada al pie',
    css: ANCLA,
  },
  aire: {
    titulo: 'B · barra anclada + el contador con aire simétrico',
    css: ANCLA + '\n' + [
      '@media (min-width: 641px) {',
      '  [data-pace-v1-cue] { margin-bottom: 26px !important; }',
      '  [data-pace-v1-care] { margin-top: 26px !important; }',
      '}',
    ].join('\n'),
  },
  arriba: {
    titulo: 'C · barra anclada + el contador más cerca del «Cuídate»',
    css: ANCLA + '\n' + [
      '@media (min-width: 641px) {',
      '  [data-pace-v1-cue] { margin-bottom: 40px !important; }',
      '  [data-pace-v1-care] { margin-top: 12px !important; }',
      '}',
    ].join('\n'),
  },
  /* HUECO FIJO AL PIE + los 16 px que hacen falta para que quepa. El ancla sola
     no iguala las dos pantallas: en el ejercicio el contenido ya llena el
     centro, asi que `auto` no reparte nada (hueco 1 px) mientras en colocarse
     sobran 48. Para que la barra caiga a la MISMA altura hay que devolverle
     holgura al ejercicio, y se saca de donde s119 permite -- el numero y los
     margenes-, nunca de las instrucciones. */
  fijo: {
    titulo: 'E · barra a altura FIJA en las dos pantallas',
    css: ANCLA + '\n' + [
      '[data-pace-v1-progress] { margin-bottom: 16px !important; }',
      '@media (min-width: 641px) and (min-height: 701px) and (max-height: 768px) {',
      '  [data-pace-v1-timer] { font-size: 92px !important; }',
      '  [data-pace-v1-glyph] > div { margin-bottom: 6px !important; }',
      '}',
    ].join('\n'),
  },
  fijoAire: {
    titulo: 'F · barra fija + el contador con aire (cuesta mas recorte)',
    css: ANCLA + '\n' + [
      '[data-pace-v1-progress] { margin-bottom: 16px !important; }',
      '@media (min-width: 641px) and (min-height: 701px) and (max-height: 768px) {',
      '  [data-pace-v1-timer] { font-size: 80px !important; }',
      '  [data-pace-v1-glyph] > div { margin-bottom: 4px !important; }',
      '  [data-pace-v1-name] { margin-bottom: 6px !important; }',
      '}',
      '@media (min-width: 641px) {',
      '  [data-pace-v1-cue] { margin-bottom: 26px !important; }',
      '  [data-pace-v1-care] { margin-top: 26px !important; }',
      '}',
    ].join('\n'),
  },
  fijo2: {
    titulo: 'G · barra a altura fija, anclada al CENTRO',
    css: ANCLA2,
  },
  fijo2Corte: {
    titulo: 'H · como G + 16 px recuperados del numero y el glifo',
    css: ANCLA2 + '\n' + [
      '@media (min-width: 641px) and (min-height: 701px) and (max-height: 768px) {',
      '  [data-pace-v1-timer] { font-size: 92px !important; }',
      '  [data-pace-v1-glyph] > div { margin-bottom: 6px !important; }',
      '}',
    ].join('\n'),
  },
  fijo2Aire: {
    titulo: 'I · como H + aire simetrico en el contador (numero a 80)',
    css: ANCLA2 + '\n' + [
      '@media (min-width: 641px) and (min-height: 701px) and (max-height: 768px) {',
      '  [data-pace-v1-timer] { font-size: 80px !important; }',
      '  [data-pace-v1-glyph] > div { margin-bottom: 4px !important; }',
      '  [data-pace-v1-name] { margin-bottom: 6px !important; }',
      '  [data-pace-v1-cue] { margin-bottom: 24px !important; }',
      '  [data-pace-v1-care] { margin-top: 24px !important; }',
      '}',
    ].join('\n'),
  },
  /* LA RESERVA DE LA DESCRIPCION, RETIRADA. s119 reservo 2 lineas bajo el cue
     para que el circulo no subiera y bajara entre pasos, y s171 dejo escrito
     que moverla «al final del bloque, donde no se leeria como hueco» exigia que
     el bloque declarase alto minimo -- «un cambio de mecanismo». Ese cambio LO
     HIZO s172b: el bloque se alinea arriba y el circulo queda clavado por
     construccion. Su propio comentario lo dice: «con el bloque anclado no hace
     falta reservar ningun texto».
     Asi que la linea vacia bajo la descripcion ya no ancla nada -- solo empuja
     el contador contra el «Cuidate», que es lo que el usuario ve. */
  sinReserva: {
    titulo: 'J · barra fija + fuera la linea vacia bajo la descripcion',
    css: ANCLA2 + '\n' + [
      '[data-pace-v1-cue] { min-height: 0 !important; }',
    ].join('\n'),
  },
  sinReservaAire: {
    titulo: 'K · como J + el aire repartido alrededor del contador',
    css: ANCLA2 + '\n' + [
      '[data-pace-v1-cue] { min-height: 0 !important; }',
      '@media (min-width: 641px) {',
      '  [data-pace-v1-cue] { margin-bottom: 22px !important; }',
      '  [data-pace-v1-care] { margin-top: 22px !important; }',
      '}',
    ].join('\n'),
  },
  /* EL HUECO QUE SE VE ENCIMA DEL NUMERO NO ES UN MARGEN: es el interlineado
     propio de la cifra -- caja de 112,3 px para un digito de 104. Por eso «mas
     centrado» no se consigue quitando espacio arriba (no lo hay) sino
     anadiendolo ABAJO, entre «SEGUNDOS» y el «Cuidate». */
  sinReservaBajo: {
    titulo: 'L · como J + aire bajo el contador para compensar el interlineado',
    css: ANCLA2 + '\n' + [
      '[data-pace-v1-cue] { min-height: 0 !important; }',
      '@media (min-width: 641px) {',
      '  [data-pace-v1-care] { margin-top: 30px !important; }',
      '}',
    ].join('\n'),
  },
  abajo: {
    titulo: 'D · barra anclada + el contador más cerca de la descripción',
    css: ANCLA + '\n' + [
      '@media (min-width: 641px) {',
      '  [data-pace-v1-cue] { margin-bottom: 12px !important; }',
      '  [data-pace-v1-care] { margin-top: 40px !important; }',
      '}',
    ].join('\n'),
  },
};

const PIEZAS = [
  ['glifo', '[data-pace-v1-glyph]'],
  ['nombre', '[data-pace-v1-name]'],
  ['cue', '[data-pace-v1-cue]'],
  ['numero', '[data-pace-v1-timer]'],
  ['segundos', '[data-pace-v1-timer] + div'],
  ['cuidate', '[data-pace-v1-care]'],
  ['progreso', '[data-pace-v1-progress]'],
];

const SONDA = `() => {
  const vis = (s) => [...document.querySelectorAll(s)]
    .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
  const caja = (s) => { const e = vis(s)[0]; if (!e) return null;
    const r = e.getBoundingClientRect();
    return { top: Math.round(r.top*10)/10, bot: Math.round(r.bottom*10)/10 }; };
  /* EL PIE SE BUSCA POR SU CONTENEDOR y no por el texto de sus botones: la home
     sigue detras del runner y su «Empezar foco» entraba en la cuenta, poniendo
     la fila de botones por ENCIMA del propio contador (381,8 px). */
  const pie = vis('[data-pace-session-footer]')[0];
  return {
    piezas: %PIEZAS%,
    pie: pie ? Math.round(pie.getBoundingClientRect().top*10)/10 : null,
  };
}`;

async function medir(page) {
  const cuerpo = SONDA.replace('%PIEZAS%',
    '{' + PIEZAS.map(([n, s]) => `'${n}': caja('${s}')`).join(', ') + '}');
  return page.evaluate(new Function('return (' + cuerpo + ')()'));
}

async function ponerCss(page, css) {
  await page.evaluate((txt) => {
    let s = document.getElementById('pace-banco-s176');
    if (!s) { s = document.createElement('style'); s.id = 'pace-banco-s176'; document.head.appendChild(s); }
    s.textContent = txt;
  }, css);
  /* una vuelta de layout: sin esto la primera medida sale con el CSS anterior */
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}

function informe(clave, titulo, pantalla, m) {
  const p = m.piezas;
  const g = (a, b) => (p[a] && p[b]) ? Math.round((p[b].top - p[a].bot) * 10) / 10 : null;
  const huecoPie = (p.progreso && m.pie != null) ? Math.round((m.pie - p.progreso.bot) * 10) / 10 : null;
  return {
    clave, titulo, pantalla,
    sobreContador: g('cue', 'numero'),
    bajoContador: g('segundos', 'cuidate'),
    barraTop: p.progreso ? p.progreso.top : null,
    glifo: p.glifo ? p.glifo.top : null,
    huecoPie,
  };
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await c.addInitScript(([k, s]) => {
    if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(s));
  }, ['pace.state.v2', { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema' }]);
  const p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:' + PUERTO + '/index.html', { waitUntil: 'networkidle' });

  await p.evaluate(() => {
    [...document.querySelectorAll('button')].find(x => x.textContent.trim().startsWith('Estira')).click();
  });
  await p.locator('.pace-lib').waitFor({ state: 'visible' });
  await p.waitForTimeout(700);
  await p.evaluate(() => {
    const t = [...document.querySelectorAll('[data-pace-lib-card] .pace-lib-hit')]
      .filter(e => e.getBoundingClientRect().width > 0)
      .find(e => /rculos/.test(e.textContent || ''));
    if (!t) throw new Error('no encuentro «Hombros · círculos»');
    t.click();
  });
  await p.waitForTimeout(1400);
  /* EL CLICK VA ACOTADO AL MODAL DE ARRIBA: buscando «Empezar» en todo el
     documento se encuentra antes el «Empezar foco» de la home -- que arranca el
     Pomodoro y cierra la biblioteca. Y se coge el ULTIMO modal, porque el
     preview se abre ENCIMA de la biblioteca y los dos estan en el DOM. */
  await p.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')]
      .filter(e => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    const b = [...raiz.querySelectorAll('button')]
      .filter(x => x.getBoundingClientRect().width > 0)
      .find(x => /Empezar/i.test(x.textContent || ''));
    if (!b) throw new Error('no encuentro el «Empezar» del preview');
    b.click();
  });
  await p.locator('[data-pace-v1-timer]').first().waitFor({ state: 'visible', timeout: 25000 });
  await p.waitForTimeout(400);

  const filas = [];
  /* PANTALLA DE TRABAJO -- la que reporta el usuario */
  for (const k of Object.keys(VARIANTES)) {
    await ponerCss(p, VARIANTES[k].css);
    filas.push(informe(k, VARIANTES[k].titulo, 'ejercicio', await medir(p)));
    await p.screenshot({ path: path.join(SALIDA, 'ejercicio-' + k + '.png') });
  }

  /* PANTALLA DE COLOCARSE -- la referencia que pide el usuario */
  await ponerCss(p, '');
  await p.evaluate(() => {
    const pie = document.querySelector('[data-pace-session-footer]');
    const b = [...(pie || document).querySelectorAll('button')].find(x => /Siguiente/i.test(x.textContent || ''));
    if (b) b.click();
  });
  await p.waitForTimeout(1200);
  const hayColocate = await p.evaluate(() =>
    ![...document.querySelectorAll('[data-pace-v1-timer]')].some(e => e.getBoundingClientRect().width > 0));
  if (!hayColocate) { console.error('GUARD: el segundo paso no es una pantalla de colocarse'); process.exit(2); }
  for (const k of Object.keys(VARIANTES)) {
    await ponerCss(p, VARIANTES[k].css);
    filas.push(informe(k, VARIANTES[k].titulo, 'colocate', await medir(p)));
    await p.screenshot({ path: path.join(SALIDA, 'colocate-' + k + '.png') });
  }

  console.log('viewport ' + W + 'x' + H + '\n');
  console.log('pantalla    variante  sobre-contador  bajo-contador   barra top   hueco hasta el pie   circulo');
  filas.forEach(f => console.log(
    f.pantalla.padEnd(11) + f.clave.padEnd(9) +
    String(f.sobreContador == null ? '--' : f.sobreContador).padStart(13) +
    String(f.bajoContador == null ? '--' : f.bajoContador).padStart(15) +
    String(f.barraTop == null ? '--' : f.barraTop).padStart(12) +
    String(f.huecoPie == null ? '--' : f.huecoPie).padStart(20) +
    String(f.glifo == null ? '--' : f.glifo).padStart(11) +
    (f.huecoPie != null && f.huecoPie < 0 ? '   <- SE SOLAPAN' : '')));
  console.log('\nerrores:', errs.length ? errs.slice(0, 3) : 'ninguno');
  console.log('capturas en _maqueta-s176-runner/');
  await b.close();
})().catch(e => { console.error('FALLO:', e.message); process.exit(1); });
