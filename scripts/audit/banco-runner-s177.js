/* PACE · scripts/audit/banco-runner-s177.js (sesión 177)
   =======================================================
   EL PRESUPUESTO DE ALTURA DEL RUNNER, PIEZA A PIEZA, Y LAS VARIANTES QUE
   INTENTAN CUADRARLO. Igual que el banco de s176: cada variante es una hoja de
   CSS inyectada sobre la APP DE VERDAD, no una maqueta.

   LO QUE EL CENSO YA DEJÓ MEDIDO a 1536x714 (la pantalla del usuario):
     · el «Cuídate» se mete 15,0 px DENTRO de la barra en 11 de 47 pasos
     · el nombre y la descripción SALTAN 26,4 px entre pasos, en 16 de 16
       rutinas -- que es exactamente lo que mide el rótulo de fase vacío
       (12 px x 1,2 + 12 de margen), porque a esta altura NO se reserva
     · el hueco sobre el número es 10,3 px y el de debajo -15,0: no hay holgura
       que repartir, FALTA SITIO. «Subir el número» y «equidistante» no se
       pueden cumplir moviendo nada: hay que encontrar los píxeles.

   Uso: node scripts/audit/banco-runner-s177.js [puerto] [ancho] [alto]
        (necesita el servidor: node .claude/static-server.js)
*/
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', 'playwright'));

const PUERTO = process.argv[2] || '8765';
const W = parseInt(process.argv[3] || '1536', 10);
const H = parseInt(process.argv[4] || '714', 10);
/* 5º argumento: lista de variantes a correr, separadas por comas. Sirve para
   barrer viewports sin pagar las once cada vez (`hoy,p3`). */
const SOLO = (process.argv[5] || '').split(',').filter(Boolean);
const SALIDA = path.join(ROOT, '_maqueta-s177-runner');

/* ── las variantes ───────────────────────────────────────────────────────── */
/* HOY es el control: sin CSS inyectado. Las demás se leen como una escalera --
   cada una añade a la anterior-- para que se vea qué paga cada píxel. */

/* 1 · Reservar el rótulo de fase también aquí. Es la CAUSA medida del salto de
   26,4 px, y la app ya lo hace por encima de 880 px de alto. Cuesta 26,4. */
const ROTULO = '[data-pace-v1-kicker]:empty { display: block !important; min-height: 1.2em !important; }';

/* 2 · El interlineado del número. s176 dejó escrito que el hueco que se ve
   encima de la cifra «no es un margen»: es su propia caja, 112,3 px para un
   dígito de 104. Los dígitos no tienen descendentes, así que bajar de 1,08 a
   0,95 no recorta nada y devuelve ~13,5 px. */
const CIFRA = '[data-pace-v1-timer] { line-height: 0.95 !important; }';

/* 3 · El glifo. Es 0,22 x alto de viewport = 157 px a 714. Con `zoom` se encoge
   DE VERDAD (afecta al layout, no como `transform`), y devuelve ~14 px. Es lo
   más visible de todo, por eso va en su propia variante y la última. */
const GLIFO = '[data-pace-v1-glyph] { zoom: 0.9; }';

/* 4 · EL GRUPO SE CENTRA EN SU HUECO -- SIN TOCAR EL DOM. Esto es lo que pide
   el usuario con «equidistante»: el bloque de contador+unidad+Cuídate deja de
   colgar de la descripción y se reparte el espacio que queda hasta la barra.

   NO HACE FALTA ENVOLVER NADA, y probé a hacerlo y fue un error: mover nodos
   por debajo de React deja el árbol inconsistente y la sesión se cayó en la
   variante siguiente -- toda la tabla salió vacía. En una columna flexible,
   `margin-top: auto` en el número y `margin-bottom: auto` en el último hijo
   parten la holgura en dos partes iguales, que es literalmente «equidistante».

   EL ÚLTIMO HIJO Y NO «Cuídate»: hay pantallas de trabajo sin care (el
   descanso), y allí colgar el auto de `[data-pace-v1-care]` no aplicaría nada
   y el grupo se iría al fondo -- otro salto. `:last-child` acierta siempre. */
const CENTRAR = [
  '[data-pace-v1-body] { display: flex !important; flex-direction: column !important; }',
  '[data-pace-v1-timer] { margin-top: auto !important; }',
  '[data-pace-v1-body] > *:last-child { margin-bottom: auto !important; }',
].join('\n');

/* 5 · El techo del grupo. Sin él, un «Cuídate» de dos líneas empuja y el
   centrado reparte menos: el grupo se mueve entre pasos. Con la zona de
   «Cuídate» ya reservada a 2 líneas (s119) el grupo mide igual siempre. */
const RESERVA = '[data-pace-v1-care] { min-height: 3em !important; }';

/* 6 · Los márgenes del tramo 701-768. Son cuatro de 10 px (glifo, nombre,
   descripción y «Cuídate»); a 6 devuelven 16 px y no se ve la diferencia. */
const MARGENES = [
  '@media (min-width: 641px) and (min-height: 701px) and (max-height: 768px) {',
  '  [data-pace-v1-glyph] > div { margin-bottom: 6px !important; }',
  '  [data-pace-v1-name] { margin-bottom: 6px !important; }',
  '  [data-pace-v1-cue] { margin-bottom: 6px !important; }',
  '  [data-pace-v1-care] { margin-top: 6px !important; }',
  '}',
].join('\n');

/* 7 · La cifra, más pequeña. 104 -> 92 px devuelve ~11 px con el interlineado
   ya apretado. Es la pieza que el usuario mira, así que va sola en su variante
   para poder compararla contra encoger el glifo. */
const CIFRA92 = '[data-pace-v1-timer] { font-size: 92px !important; }';

/* 8 · Bajo el centrado, el margen inferior de la descripción sobra: los dos
   huecos tienen que ser SÓLO los `auto`, o «arriba» mide de más sin que eso
   sea una decisión de nadie. */
const SINMARGENCUE = '[data-pace-v1-cue] { margin-bottom: 0 !important; }';

const BASE = ROTULO + '\n' + CIFRA + '\n' + CENTRAR + '\n' + RESERVA;

/* ── CONGELAR: que NADA se mueva ni cambie de tamaño entre las dos pantallas ─
   El objetivo que puso el usuario es más duro que «no solapar»: pasar de
   «colócate» a «ejercicio» no debe notarse. P3 congelaba glifo, nombre y barra
   (0,0 px las tres) y aun así se movían cuatro cosas más, porque el banco no
   las medía:

     · el NÚMERO cambia de 56 a 96 px -- son dos ramas distintas del JSX, y esa
       diferencia la puso s112 a propósito («el número del gate no es el timer»).
       Unificarlo ANULA esa decisión, y por eso se pintan los tres tamaños en
       vez de elegir yo.
     · la DESCRIPCIÓN mide 3 líneas al colocarse y 2 al trabajar: 24,8 px que
       arrastran todo lo de abajo. Se reserva su caso peor y el texto se centra
       DENTRO de la caja, así que el nombre de arriba y el número de abajo
       quedan quietos aunque el texto cambie de largo.
     · la ETIQUETA del número lleva `margin-top` 10 al colocarse y 14 al
       trabajar. Cuatro píxeles, pero son cuatro píxeles que se ven.
     · LA COLA es «Colócate sin prisa…» en una pantalla y «Cuídate…» en la
       otra, con márgenes 14 y 16 y alturas distintas. Se les da la misma caja.

   EL NÚMERO SE SELECCIONA POR POSICIÓN (`[data-pace-v1-cue] + div`) porque la
   cuenta atrás de colocarse NO tiene atributo de datos. Al implementarlo habrá
   que ponérselo; aquí, para pintar, la posición vale y no toca el JSX.

   EL COLOR NO SE UNIFICA: el gate sigue en tinta secundaria. Cambiar de color
   no desplaza nada, y es lo único que queda de la intención de s112. */
const CONGELA_ALTO_CUE = 74.4;   /* 3 líneas x 16px x 1.55 */
const CONGELA_ALTO_COLA = 41;    /* 2 líneas de «Cuídate» (13,5 x 1,5) */

/* EL HUECO VA FIJO, NO CENTRADO CON `auto`, y esto lo corrigió la medida.
   Con `margin-top: auto` en el número y `auto` en el último hijo, el reparto
   depende de lo que mida el GRUPO, y el grupo no mide igual en las dos
   pantallas (la cola es «Colócate sin prisa…» en una y «Cuídate…» en la otra).
   Resultado medido: el número seguía moviéndose 6,7 a 9,0 px según el tamaño.
   Con la descripción de alto fijo y la barra anclada, el hueco entre las dos ES
   constante, así que una distancia fija da equidistancia exacta Y cero
   movimiento por construcción. El sobrante cae detrás de la cola, que es
   justo el mismo sitio donde `auto` lo habría puesto. */
function congelar(tam, hueco, zoom) {
  /* MARGENES VA DELANTE Y NO DETRÁS, y esto era el último salto de la tabla.
     Trae `[data-pace-v1-care] { margin-top: 6px !important }` y, a igual
     especificidad, gana la ÚLTIMA regla del archivo: puesto al final dejaba
     «Cuídate» en 6 px y «Colócate sin prisa…» en 14. Diferencia: 8,0 px, que es
     exactamente lo que la cola se movía. La misma trampa que s176 pagó con la
     barra de progreso. */
  return [
    MARGENES,
    ROTULO,
    /* la descripción reserva su peor caso y centra el texto dentro */
    '[data-pace-v1-cue] { min-height: ' + CONGELA_ALTO_CUE + 'px !important;',
    '  display: flex !important; flex-direction: column !important;',
    '  justify-content: center !important; margin-bottom: 0 !important; }',
    /* el número: mismo tamaño y misma caja en las dos pantallas */
    '[data-pace-v1-cue] + div { font-size: ' + tam + 'px !important; line-height: 0.95 !important; }',
    /* su etiqueta, al mismo sitio en las dos */
    '[data-pace-v1-cue] + div + div { margin-top: 10px !important; }',
    /* la cola, con la misma caja pinte lo que pinte */
    '[data-pace-v1-care], [data-pace-v1-support], [data-pace-v1-support-strong] {',
    '  min-height: ' + CONGELA_ALTO_COLA + 'px !important; margin-top: 14px !important; }',
    /* el grupo se centra en el hueco que queda */
    '[data-pace-v1-body] { display: flex !important; flex-direction: column !important; }',
    /* AHORA SÍ se puede centrar con `auto`, y antes no podía. El reparto de
       `auto` depende de lo que mida el GRUPO; con la descripción, el número,
       la etiqueta y la cola todos de alto fijo, el grupo mide IGUAL en las dos
       pantallas, así que el centrado da el mismo resultado en ambas. Un hueco
       FIJO, en cambio, sólo es equidistante a una altura concreta: medido,
       dejaba 251,7 px muertos debajo a 1920x1040 y 125,4 a 1536x900. */
    (hueco === 'auto'
      ? ['[data-pace-v1-cue] + div { margin-top: auto !important; }',
        '[data-pace-v1-body] > *:last-child { margin-bottom: auto !important; }'].join('\n')
      : '[data-pace-v1-cue] + div { margin-top: ' + hueco + 'px !important; }'),
    /* y los píxeles que todo esto cuesta salen del glifo y de los márgenes */
    '[data-pace-v1-glyph] { zoom: ' + zoom + '; }',
  ].join('\n');
}

const VARIANTES = {
  hoy: { titulo: 'HOY · v0.106.0', css: '' },
  a: { titulo: 'A · sólo reservar el rótulo', css: ROTULO },
  b: { titulo: 'B · rótulo + interlineado de la cifra', css: ROTULO + '\n' + CIFRA },
  c: { titulo: 'C · rótulo + cifra + grupo centrado', css: BASE },
  d: { titulo: 'D · C + glifo un 10% menor', css: BASE + '\n' + GLIFO },
  e: { titulo: 'E · C + márgenes 10->6', css: BASE + '\n' + MARGENES },
  f: { titulo: 'F · C + márgenes + glifo (sin tocar la cifra)', css: BASE + '\n' + MARGENES + '\n' + GLIFO },
  g: { titulo: 'G · C + márgenes + cifra 92 (glifo intacto)', css: BASE + '\n' + MARGENES + '\n' + CIFRA92 },
  /* LAS TRES QUE DE VERDAD SE LE ENSEÑAN. Todas cumplen las dos cosas que pidió
     -- cero solape y cero salto -- y se diferencian en QUIÉN paga los píxeles,
     que es lo único que se puede decidir mirando. El margen de la descripción
     se anula bajo el centrado para que los dos huecos sean SÓLO los `auto`:
     dejarlo hacía que «arriba» midiera 6 px más que «abajo» sin ser un ajuste,
     sino un margen suelto. */
  p1: { titulo: 'P1 · paga el GLIFO (cifra intacta, 104)', css: BASE + '\n' + MARGENES + '\n' + GLIFO + '\n' + SINMARGENCUE },
  p2: { titulo: 'P2 · paga la CIFRA (92; glifo intacto)', css: BASE + '\n' + MARGENES + '\n' + CIFRA92 + '\n' + SINMARGENCUE },
  p3: { titulo: 'P3 · pagan los DOS (glifo -10%, cifra 96)', css: BASE + '\n' + MARGENES + '\n' + GLIFO + '\n[data-pace-v1-timer] { font-size: 96px !important; }\n' + SINMARGENCUE },
  n96: { titulo: 'N96 · todo congelado · número 96 px', css: congelar(96, 12, 0.75) },
  n76: { titulo: 'N76 · todo congelado · número 76 px', css: congelar(76, 10, 0.86) },
  n56: { titulo: 'N56 · todo congelado · número 56 px', css: congelar(56, 20, 0.86) },
  n76c: { titulo: 'N76c · N76 con el grupo CENTRADO', css: congelar(76, 'auto', 0.86) },
  n76b: { titulo: 'N76b · para alturas <=700', css: congelar(64, 'auto', 0.74) },
  g86n64: { titulo: 'G86N64 · glifo 0.86 constante, numero 64', css: congelar(64, 'auto', 0.86) },
  g86n58: { titulo: 'G86N58 · glifo 0.86 constante, numero 58', css: congelar(58, 'auto', 0.86) },
};

/* ── la medida ───────────────────────────────────────────────────────────── */
function medir() {
  const vis = (s) => [...document.querySelectorAll(s)]
    .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })[0] || null;
  const top = (s) => { const e = vis(s); return e ? Math.round(e.getBoundingClientRect().top * 10) / 10 : null; };
  const alto = (s) => { const e = vis(s); return e ? Math.round(e.getBoundingClientRect().height * 10) / 10 : null; };

  const cuerpo = vis('[data-pace-v1-body]'), barra = vis('[data-pace-v1-progress]');
  const cue = vis('[data-pace-v1-cue]'), num = vis('[data-pace-v1-timer]');
  const care = vis('[data-pace-v1-care]');
  const rb = barra ? barra.getBoundingClientRect() : null;

  /* el solape, igual que en el censo: el hijo con texto propio que más baje */
  let solape = 0, quien = '';
  if (cuerpo && rb) {
    for (const e of cuerpo.querySelectorAll('*')) {
      const r = e.getBoundingClientRect();
      if (!(r.width > 0 && r.height > 0)) continue;
      if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
      if (r.bottom - rb.top > solape) { solape = r.bottom - rb.top; quien = (e.textContent || '').trim().slice(0, 30); }
    }
  }
  /* EL NÚMERO NO SIEMPRE ES `[data-pace-v1-timer]`. La pantalla de colocarse
     pinta su cuenta atrás con un `div` SIN atributo (MoveSessionV1.jsx, rama
     `gateNumber`), así que medir sólo el timer deja fuera justo la pieza que
     más se mueve entre las dos pantallas -- y por eso la primera versión de
     este banco daba «salto 0» donde el usuario veía el número cambiar de
     tamaño. Las dos ramas SÍ comparten posición: son el hermano siguiente de
     la descripción. */
  const cifra = cue ? cue.nextElementSibling : null;
  const etiqueta = cifra ? cifra.nextElementSibling : null;
  const cola = cuerpo ? cuerpo.lastElementChild : null;
  const px = (e, prop) => e ? parseFloat(getComputedStyle(e)[prop]) : null;
  const cajaDe = (e) => {
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { top: Math.round(r.top * 10) / 10, h: Math.round(r.height * 10) / 10 };
  };
  return {
    /* las piezas que de verdad hay que congelar, todas */
    cifraCaja: cajaDe(cifra), cifraPx: px(cifra, 'fontSize'),
    etiquetaCaja: cajaDe(etiqueta),
    colaCaja: cajaDe(cola),
    colaQuien: cola ? (cola.tagName + '[' + [...cola.attributes].map(a => a.name).filter(n => /pace/.test(n)).join() + ']') : null,
    hijos: cuerpo ? [...cuerpo.children].map(e => [...e.attributes].map(a => a.name).filter(n => /pace/.test(n)).join('|') || e.tagName).join(' > ') : null,
    cueCaja: cajaDe(cue),
    glifoCaja: cajaDe(vis('[data-pace-v1-glyph]')),
    nombreCaja: cajaDe(vis('[data-pace-v1-name]')),
    barraCaja: cajaDe(barra),
    glifo: top('[data-pace-v1-glyph]'), altoGlifo: alto('[data-pace-v1-glyph]'),
    nombre: top('[data-pace-v1-name]'), cue: top('[data-pace-v1-cue]'), altoCue: alto('[data-pace-v1-cue]'),
    numero: top('[data-pace-v1-timer]'), altoNumero: alto('[data-pace-v1-timer]'),
    care: top('[data-pace-v1-care]'), altoCare: alto('[data-pace-v1-care]'),
    barra: rb ? Math.round(rb.top * 10) / 10 : null,
    arriba: (cue && num) ? Math.round((num.getBoundingClientRect().top - cue.getBoundingClientRect().bottom) * 10) / 10 : null,
    abajo: (care && rb) ? Math.round((rb.top - care.getBoundingClientRect().bottom) * 10) / 10
      : (etiqueta && rb) ? Math.round((rb.top - etiqueta.getBoundingClientRect().bottom) * 10) / 10 : null,
    solape: Math.round(Math.max(0, solape) * 10) / 10, quien,
  };
}

/* EL PULSO SE CONGELA PARA MEDIR, y esto costó una vuelta entera.
   En las reps guiadas el número lleva `pace-rep-pulse`, que anima `scale`
   (s113), y `getBoundingClientRect()` devuelve la caja YA TRANSFORMADA: la
   misma cifra de 76 px medía 72,2 al colocarse y 65,0 al trabajar, y la tabla
   lo presentaba como un salto de layout que no existía. Se apaga la animación
   en TODAS las variantes, control incluido, para que la comparación sea justa.
   Lo que se mide aquí es la COLOCACIÓN; que el número lata es otra cosa y es
   deliberada. */
const SIN_PULSO = '[data-pace-v1-timer] { animation: none !important; }\n';

async function ponerCss(p, css) {
  css = SIN_PULSO + css;
  await p.evaluate((c) => {
    let s = document.getElementById('pace-banco-s177');
    if (!s) { s = document.createElement('style'); s.id = 'pace-banco-s177'; document.head.appendChild(s); }
    s.textContent = c;
  }, css);
  await p.waitForTimeout(220);
}

(async () => {
  if (!fs.existsSync(SALIDA)) fs.mkdirSync(SALIDA, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  /* LA SEMILLA ES `firstSeen`, y esto costó caro. Sembré `onboarded`, que no
     existe: el onboarding se abre con `state.firstSeen == null`
     (Onboarding.jsx:36) y `tests/helpers.js` lo lleva escrito con el aviso
     delante. La app se monta POR DEBAJO del overlay de bienvenida, así que
     todos los selectores encontraban el runner y `medir()` devolvía geometría
     de verdad -- mientras la CÁMARA fotografiaba la pantalla de bienvenida.
     Veintidós capturas del onboarding con una tabla de números correcta al
     lado, y las mandé sin mirarlas. */
  await p.addInitScript(() => {
    if (!localStorage.getItem('pace.state.v2')) {
      localStorage.setItem('pace.state.v2', JSON.stringify({
        firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', soundOn: false,
      }));
    }
  });
  await p.goto('http://localhost:' + PUERTO + '/index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);

  /* GUARD DE LA CÁMARA: si la bienvenida está en pantalla, no se mide ni se
     fotografía nada. Un banco que no comprueba QUÉ está fotografiando produce
     capturas convincentes de otra cosa. */
  if (await p.evaluate(() => /Antídoto a la silla|Tres preguntas breves/i.test(document.body.innerText || ''))) {
    console.error('GUARD: la app está en el ONBOARDING -- la semilla no entró');
    process.exit(2);
  }

  /* «Flexiones de escritorio», que es una de las que el usuario fotografió */
  await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')]
      .filter(e => e.getBoundingClientRect().width > 0)
      .find(e => e.textContent.trim().startsWith('Mueve'));
    b.click();
  });
  await p.locator('.pace-lib').first().waitFor({ state: 'visible' });
  await p.waitForTimeout(700);
  await p.evaluate(() => {
    const t = [...document.querySelectorAll('[data-pace-lib-card] .pace-lib-hit')]
      .filter(e => e.getBoundingClientRect().width > 0)
      .find(e => /Flexiones de escritorio/i.test(e.textContent || ''));
    if (!t) throw new Error('no encuentro «Flexiones de escritorio»');
    t.click();
  });
  await p.waitForTimeout(1200);
  await p.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')]
      .filter(e => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    const b = [...raiz.querySelectorAll('button')]
      .filter(x => x.getBoundingClientRect().width > 0)
      .find(x => /^Empezar/i.test((x.textContent || '').trim()));
    if (!b) throw new Error('no encuentro el «Empezar» del preview');
    b.click();
  });
  await p.locator('[data-pace-v1-body]').first().waitFor({ state: 'visible', timeout: 20000 });
  await p.waitForTimeout(500);

  /* PASO 1 = «colócate» (sin contador). Se avanza al 2, que es el de trabajo
     que el usuario fotografió y el que solapa. */
  const filas = [];
  const pantallas = [];
  for (const fase of ['colocate', 'trabajo']) {
    for (const k of (SOLO.length ? SOLO : Object.keys(VARIANTES))) {
      await ponerCss(p, '');
      await ponerCss(p, VARIANTES[k].css);
      filas.push({ fase, k, titulo: VARIANTES[k].titulo, m: await p.evaluate(medir) });
      await p.screenshot({ path: path.join(SALIDA, fase + '-' + k + '.png') });
      pantallas.push(fase + '-' + k + '.png');
    }
    if (fase === 'colocate') {
      await ponerCss(p, '');
      /* SE ESPERA A QUE EXISTA EL CONTADOR, no a un reloj. Con un
         `waitForTimeout` fijo el banco medía la pantalla de COLOCARSE creyendo
         que era la de trabajo: al filtrar variantes el barrido va más rápido,
         el paso aún no había cambiado y la tabla salía con guiones en el número
         y el «Cuídate» -- en tres viewports de seis, y en otros tres no. Una
         medida que a veces mide otra pantalla no vale para nada. */
      for (let intento = 0; intento < 8; intento++) {
        if (await p.evaluate(() => [...document.querySelectorAll('[data-pace-v1-timer]')]
          .some(e => e.getBoundingClientRect().height > 0))) break;
        await p.evaluate(() => {
          const pie = document.querySelector('[data-pace-session-footer]');
          const b = [...(pie || document).querySelectorAll('button')]
            .filter(x => x.getBoundingClientRect().width > 0)
            .find(x => /Siguiente/i.test(x.textContent || ''));
          if (b) b.click();
        });
        await p.waitForTimeout(600);
      }
      /* GUARD: si tras ocho intentos no hay contador, el banco NO puede seguir
         -- callarlo daría una tabla llena de guiones que se lee como «no hay
         solape», que es el fallo por omisión de s169. */
      if (!await p.evaluate(() => [...document.querySelectorAll('[data-pace-v1-timer]')]
        .some(e => e.getBoundingClientRect().height > 0))) {
        console.error('GUARD: no se llegó a una pantalla con contador a ' + W + 'x' + H);
        process.exit(2);
      }
      await p.waitForTimeout(300);
    }
  }
  await browser.close();

  const f1 = (v) => v == null ? '-' : (Math.round(v * 10) / 10).toFixed(1);
  console.log('\n============================================================');
  console.log('BANCO DEL RUNNER s177 · ' + W + 'x' + H + ' · Flexiones de escritorio');
  console.log('============================================================');
  for (const fase of ['colocate', 'trabajo']) {
    console.log('\n--- ' + fase.toUpperCase() + ' ---');
    console.log('  ' + 'variante'.padEnd(38) + 'glifo  nombre     cue  numero   care   barra  solape  arriba   abajo');
    for (const f of filas.filter(x => x.fase === fase)) {
      const m = f.m;
      console.log('  ' + f.titulo.padEnd(38) +
        f1(m.glifo).padStart(5) + f1(m.nombre).padStart(8) + f1(m.cue).padStart(8) +
        f1(m.numero).padStart(8) + f1(m.care).padStart(7) + f1(m.barra).padStart(8) +
        f1(m.solape).padStart(8) + f1(m.arriba).padStart(8) + f1(m.abajo).padStart(8));
    }
  }
  /* SALTO DE **TODAS** LAS PIEZAS, y esto es la corrección de fondo del banco.
     La primera versión comparaba glifo, nombre, descripción y barra, daba 0,0
     en las tres propuestas, y el usuario seguía viendo moverse cosas: el
     número, su etiqueta y la cola no estaban en la tabla. Una tabla que no
     mide una pieza dice «no se mueve» exactamente igual que si no se moviera. */
  const CAJAS = [
    ['glifo', 'glifoCaja'], ['nombre', 'nombreCaja'], ['descrip', 'cueCaja'],
    ['numero', 'cifraCaja'], ['etiqueta', 'etiquetaCaja'], ['cola', 'colaCaja'],
    ['barra', 'barraCaja'],
  ];
  console.log('\nSALTO ENTRE LAS DOS PANTALLAS -- TODAS las piezas (px de desplazamiento del borde superior)');
  console.log('  ' + 'variante'.padEnd(36) + CAJAS.map(c => c[0].padStart(9)).join('') + '   tamaño nº');
  for (const k of (SOLO.length ? SOLO : Object.keys(VARIANTES))) {
    const c = filas.find(x => x.fase === 'colocate' && x.k === k).m;
    const t = filas.find(x => x.fase === 'trabajo' && x.k === k).m;
    const cel = CAJAS.map(([, key]) => {
      const a = c[key], b = t[key];
      if (!a || !b) return '-'.padStart(9);
      const d = Math.abs(a.top - b.top);
      return (d < 0.5 ? '0' : f1(d)).padStart(9);
    });
    const tam = (c.cifraPx == null || t.cifraPx == null) ? '-'
      : (Math.abs(c.cifraPx - t.cifraPx) < 0.5 ? 'igual (' + Math.round(t.cifraPx) + ')'
        : Math.round(c.cifraPx) + '→' + Math.round(t.cifraPx));
    console.log('  ' + VARIANTES[k].titulo.slice(0, 35).padEnd(36) + cel.join('') + '   ' + tam);
  }

  /* LAS ALTURAS, y no sólo las posiciones. Con margen fijo una pieza sólo puede
     desplazarse si algo de ARRIBA mide distinto, así que la tabla de posiciones
     dice QUE se mueve y ésta dice POR QUÉ. Sin ella el ajuste es a ciegas. */
  console.log('\nALTURA DE CADA CAJA (colocate / trabajo) -- una diferencia aquí es la causa de un salto abajo');
  console.log('  ' + 'variante'.padEnd(36) + CAJAS.map(c => c[0].padStart(14)).join(''));
  for (const k of (SOLO.length ? SOLO : Object.keys(VARIANTES))) {
    const c = filas.find(x => x.fase === 'colocate' && x.k === k).m;
    const t = filas.find(x => x.fase === 'trabajo' && x.k === k).m;
    const cel = CAJAS.map(([, key]) => {
      const a = c[key], b = t[key];
      if (!a || !b) return '-'.padStart(14);
      const marca = Math.abs(a.h - b.h) < 0.5 ? ' ' : '*';
      return (marca + f1(a.h) + '/' + f1(b.h)).padStart(14);
    });
    console.log('  ' + VARIANTES[k].titulo.slice(0, 35).padEnd(36) + cel.join(''));
  }
  console.log('  (* = las dos pantallas NO miden lo mismo)');
  console.log('\ncapturas en ' + path.relative(ROOT, SALIDA) + '/ (' + pantallas.length + ')');
})();
