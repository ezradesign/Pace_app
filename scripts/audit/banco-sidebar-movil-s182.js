/* PACE · scripts/audit/banco-sidebar-movil-s182.js (sesion 182)
   ============================================================
   LOS DOS ENCARGOS DEL USUARIO SOBRE EL CAJON DE MOVIL, PINTADOS.

   El handoff de s181 los deja medidos pero NO pintados, y la regla de este
   repo (s173/s174) es que toda opcion se MIRA antes de decidirse. Aqui se
   miden las cuatro combinaciones y se fotografia cada una en su viewport.

     · B  · recortar el aire bajo la ultima linea de la tarjeta «Para ahora»
            (padding-bottom 16 -> 8). LLEVA `!important` POR NECESIDAD: el
            padding lo pone `sidebarStyles.accion` EN LINEA, y un estilo en
            linea gana a la hoja sin que haga falta `!important` del otro lado
            (misma trampa que s180 con el recorte del logo).
     · C  · encender en movil la escala de s181 CON SUELO. Hoy esta apagada a
            proposito (`if (esCajon()) { aplicar(1); return; }`, Sidebar.jsx),
            asi que encenderla ANULA esa decision y hay que verlo antes.

   COMO SE SIMULA C SIN TOCAR EL PRODUCTO, y por que asi
   -----------------------------------------------------
   En movil la hoja apaga la geometria con tres `!important`
   (`width: 100%`, `min-height: 0`, `transform: none`), asi que la simulacion
   los reenciende con una hoja propia bajo `[data-sim-escala]`.

   Y HAY UNA DIFERENCIA REAL CON ESCRITORIO que la simulacion tiene que
   respetar: alli la lente es un hijo flexible y su `clientHeight` ES el alto
   disponible. Aqui el cajon tiene `height: auto` y la lente es `display:block`,
   o sea que se dimensiona al CONTENIDO: preguntarle el alto disponible
   devolveria el alto natural y la escala saldria siempre 1. El disponible es
   el del ASIDE menos su padding, y la lente hay que ALTARLA a mano a
   `natural * escala`, que es lo que una implementacion de verdad tendria que
   hacer tambien. Se dice aqui porque es el trabajo que costaria C.

   TRAMPA DE MEDIDA (s181, y aqui muerde igual): `getBoundingClientRect()`
   devuelve la caja YA transformada y `offsetHeight` no. El alto NATURAL se
   pregunta con `offsetHeight`; lo que se VE, con el rect.

   Y LA SEGUNDA, QUE ME MORDIO EN LA MISMA SESION: la limpieza entre variantes
   borraba `--sb-escala` de la envoltura, que es EXACTAMENTE donde escribe la
   implementacion de v0.114.0. Como `aplicar()` lleva memo, el producto no la
   volvia a escribir nunca, asi que el banco fotografiaba SU PROPIO borrado y
   daba «factor 1» sobre una app que en vivo estaba a 0,8083. Por eso ahora
   CADA VARIANTE RECARGA la pagina -- ninguna hereda el estado de la anterior--
   y por eso `medir` devuelve tambien lo que dice el producto en
   `--sb-escala`: si eso y el factor geometrico no coinciden, el banco lo grita
   en vez de imprimir una tabla creible.

   Uso:  node .claude/static-server.js     (en otra consola)
         node scripts/audit/banco-sidebar-movil-s182.js [--salida DIR]
*/
'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { CLAVE_ESTADO, SEMILLA } = require('../../tests/helpers.js');

const BASE = 'http://localhost:8765/index.html';

const arg = (nombre, pordefecto) => {
  const i = process.argv.indexOf(nombre);
  return (i > -1 && process.argv[i + 1]) ? process.argv[i + 1] : pordefecto;
};
const SALIDA = arg('--salida', path.join(process.cwd(), 'scratch-s182'));

/* QUE VARIANTES SE MIDEN. Por defecto las cinco de la revision previa, cuando
   el producto todavia no escalaba en movil y habia que SIMULARLO. Una vez
   implementado (v0.114.0), `--variantes HOY` mide y fotografia el producto de
   verdad -- y las simuladas dejarian de tener sentido, porque se aplicarian
   ENCIMA de la escala real. */
const VARIANTES = arg('--variantes', 'HOY,B,C85,BC85,CJUSTO').split(',');

/* Los seis de la revision de s181, mas 375x844 que el usuario reporto y que
   esta VERIFICADO como no defectuoso: se fotografia para que se vea. */
const VIEWPORTS = [
  { w: 360, h: 560, nombre: 'Android muy corto' },
  { w: 360, h: 640, nombre: 'Android compacto' },
  { w: 375, h: 667, nombre: 'iPhone SE / 8' },
  { w: 390, h: 736, nombre: 'iPhone 12-15 corto' },
  { w: 428, h: 800, nombre: 'Android grande' },
  { w: 375, h: 844, nombre: 'iPhone 13-15' },
];

/* La sidebar abierta, con el dia poblado para que la columna tenga su alto de
   verdad. Sembrar `weeklyStats` exige TAMBIEN `lastActiveDay` y las tres
   guardas de migracion, o el rollover archiva la semana y sale a ceros
   (decision de s180, pagada con tres rojos). */
const SEMBRADO = {
  sidebarCollapsed: false,
  lastActiveDay: new Date().toDateString(),
  _historyMigrated: true,
  _weeklyStatsReindexed_v0_28_8: true,
  _historyRecalculated_v0_28_8: true,
};

const CSS_B = '[data-pace-sidebar] [data-pace-sidebar-accion] { padding-bottom: 8px !important; }';

const CSS_C = [
  '[data-pace-sidebar][data-sim-escala] [data-pace-sidebar-escala] {',
  '  width: calc(100% / var(--sb-escala)) !important;',
  '  transform: scale(var(--sb-escala)) !important;',
  '  transform-origin: top left;',
  '}',
  '[data-pace-sidebar][data-sim-escala] [data-pace-sidebar-lente] { overflow: hidden !important; }',
].join('\n');

/* Las variantes de escala. `null` = SIN SUELO, o sea la escala que hace falta
   para que el cajon quepa ENTERO en esa pantalla. Es la que contesta de verdad
   la pregunta del usuario («si no queda diminuto»), porque el suelo de 0,85 no
   hace caber 667: lo comprueba la propia tabla. */
const SUELOS = { C85: 0.85, BC85: 0.85, CJUSTO: null };

async function aplicarVariante(page, variante, suelo) {
  return page.evaluate(([v, cssB, cssC, suelo]) => {
    /* NO SE LIMPIA NADA. Cada variante llega con la pagina recien recargada, y
       la limpieza que habia aqui borraba `--sb-escala` -- la propiedad que
       escribe el producto-- dejandolo mudo por su propio memo. */
    const aside = document.querySelector('[data-pace-sidebar]');
    const caja = document.querySelector('[data-pace-sidebar-escala]');
    const lente = caja ? caja.parentElement : null;

    const poner = function (id, txt) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = txt;
      document.head.appendChild(s);
    };
    if (v.indexOf('B') > -1) poner('sim-b', cssB);
    if (v.indexOf('C') > -1) {
      poner('sim-c', cssC);
      /* natural con offsetHeight (layout, inmune a la transformacion) */
      const natural = caja.offsetHeight;
      const est = window.getComputedStyle(aside);
      const disponible = aside.clientHeight
        - (parseFloat(est.paddingTop) || 0) - (parseFloat(est.paddingBottom) || 0);
      let escala = disponible / natural;
      if (escala > 1) escala = 1;
      if (suelo != null && escala < suelo) escala = suelo;
      escala = Math.round(escala * 10000) / 10000;
      aside.setAttribute('data-sim-escala', '1');
      caja.style.setProperty('--sb-escala', String(escala));
      lente.style.height = (natural * escala) + 'px';
      return { escala: escala, natural: natural, disponible: disponible };
    }
    return { escala: 1, natural: caja ? caja.offsetHeight : 0, disponible: 0 };
  }, [variante, CSS_B, CSS_C, suelo]);
}

function medir(page) {
  return page.evaluate(function () {
    const r = function (n) { return Math.round(n * 10) / 10; };
    const aside = document.querySelector('[data-pace-sidebar]');
    const caja = document.querySelector('[data-pace-sidebar-escala]');
    const tarjeta = aside.querySelector('[data-pace-sidebar-accion]');
    const meta = tarjeta ? tarjeta.querySelector('p') : null;
    const semana = aside.querySelector('[data-pace-semana]');
    const pie = [].slice.call(caja.children).find(function (e) {
      return (e.textContent || '').indexOf('Mis rutinas') > -1;
    });

    /* Lo que de verdad importa: cuanto del cajon queda FUERA de la primera
       pantalla. El aside es `overflow-y: auto`, asi que desborda por dentro. */
    const fuera = aside.scrollHeight - aside.clientHeight;

    /* El aire bajo la ultima linea de la tarjeta: del fondo de la caja del
       texto al fondo de la tarjeta. Los dos rects estan igual de escalados. */
    const rt = tarjeta ? tarjeta.getBoundingClientRect() : null;
    const rm = meta ? meta.getBoundingClientRect() : null;

    /* La escala REAL, no la que creemos haber puesto: caja vista / caja de
       layout. Si la simulacion no llegara a aplicarse, esto valdria 1 y la
       tabla lo diria en vez de repetir el numero que le pasamos. */
    const factor = caja.offsetHeight ? (caja.getBoundingClientRect().height / caja.offsetHeight) : 1;

    return {
      factor: Math.round(factor * 10000) / 10000,
      /* Lo que el PRODUCTO dice que ha aplicado. Se compara fuera con el factor
         geometrico: dos instrumentos independientes sobre la misma cosa. */
      dice: parseFloat(getComputedStyle(caja).getPropertyValue('--sb-escala')) || 1,
      escalado: aside.getAttribute('data-escalado'),
      fuera: r(fuera),
      alturaVisible: r(aside.clientHeight),
      naturalCaja: r(caja.offsetHeight),
      cajaVista: r(caja.getBoundingClientRect().height),
      tarjetaAlta: rt ? r(rt.height) : null,
      /* Coordenadas de la tarjeta en la pantalla, para poder RECORTARLA en la
         revision: 8 px de diferencia no se juzgan en una captura entera. */
      tarjetaTop: rt ? r(rt.top) : null,
      tarjetaLeft: rt ? r(rt.left) : null,
      tarjetaAncha: rt ? r(rt.width) : null,
      aireBajoTexto: (rt && rm) ? r(rt.bottom - rm.bottom) : null,
      /* EL TAMANO DE LETRA QUE SE VE NO ES EL COMPUTADO. `getComputedStyle`
         devuelve el de LAYOUT y una transformacion no lo toca: con la columna a
         0,85 seguia diciendo 11 px, que es exactamente la cifra que hacia falta
         para decidir y era falsa. Se multiplica por la escala REAL, leida como
         el cociente entre la caja vista y la de layout. */
      metaPx: meta ? r(parseFloat(getComputedStyle(meta).fontSize) * factor) : null,
      /* El objetivo tactil que s180 afino a 44-45: la semana entera. VISUAL. */
      semanaAlta: semana ? r(semana.getBoundingClientRect().height) : null,
      /* Donde termina el pie respecto al borde de abajo de la pantalla:
         positivo = le sobran px; negativo = esta por debajo del pliegue. */
      pieHasta: pie ? r(window.innerHeight - pie.getBoundingClientRect().bottom) : null,
    };
  });
}

(async function () {
  fs.mkdirSync(SALIDA, { recursive: true });
  const navegador = await chromium.launch();
  const filas = [];

  for (const vp of VIEWPORTS) {
    const ctx = await navegador.newContext({
      viewport: { width: vp.w, height: vp.h },
      locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light',
      deviceScaleFactor: 2,
    });
    await ctx.addInitScript(function (datos) {
      localStorage.setItem(datos[0], JSON.stringify(datos[1]));
    }, [CLAVE_ESTADO, Object.assign({}, SEMILLA, SEMBRADO)]);

    const page = await ctx.newPage();

    for (const variante of VARIANTES) {
      /* RECARGA POR VARIANTE. Sin esto, la limpieza de la anterior deja al
         producto con su escala borrada y su memo puesto: mide su propio
         borrado. Ver la segunda trampa de la cabecera. */
      await page.goto(BASE, { waitUntil: 'load' });
      await page.waitForSelector('[data-pace-sidebar]');
      /* Las fuentes cambian el alto natural: medir antes de que asienten da
         otra cifra (rojo intermitente de s181, y era del producto). */
      await page.evaluate(function () { return document.fonts.ready; });
      await page.waitForTimeout(250);

      const aplicado = await aplicarVariante(page, variante, SUELOS[variante]);
      await page.waitForTimeout(120);
      const m = await medir(page);
      /* LOS DOS INSTRUMENTOS TIENEN QUE COINCIDIR. Si el producto dice que ha
         aplicado 0,81 y la geometria dice 1, uno de los dos miente y la tabla
         no vale nada. Se para: una fila creible y falsa es peor que un fallo. */
      if (Math.abs(m.factor - m.dice) > 0.01) {
        throw new Error('INSTRUMENTO INCOHERENTE en ' + vp.w + 'x' + vp.h + ' / ' + variante
          + ': la geometria mide ' + m.factor + ' y el producto dice ' + m.dice);
      }
      const nombre = vp.w + 'x' + vp.h + '_' + variante + '.png';
      await page.screenshot({ path: path.join(SALIDA, nombre) });
      filas.push(Object.assign({
        vp: vp.w + 'x' + vp.h, etiqueta: vp.nombre, variante,
        escala: aplicado.escala, archivo: nombre,
      }, m));
    }
    await ctx.close();
  }
  await navegador.close();

  fs.writeFileSync(path.join(SALIDA, 'medidas.json'), JSON.stringify(filas, null, 1));

  const col = function (s, n) { return String(s).padEnd(n); };
  const num = function (s, n) { return String(s === null ? '-' : s).padStart(n); };
  console.log('\n' + col('viewport', 10) + col('var', 8) + num('escala', 7) + num('fuera', 7)
    + num('natural', 8) + num('vista', 7) + num('tarjeta', 8) + num('aire', 6)
    + num('meta', 6) + num('semana', 8) + num('pie', 7));
  console.log('-'.repeat(82));
  let vpPrev = '';
  for (const f of filas) {
    if (f.vp !== vpPrev) { console.log(''); vpPrev = f.vp; }
    console.log(col(f.vp, 10) + col(f.variante, 8) + num(f.factor, 7) + num(f.fuera, 7)
      + num(f.naturalCaja, 8) + num(f.cajaVista, 7) + num(f.tarjetaAlta, 8) + num(f.aireBajoTexto, 6)
      + num(f.metaPx, 6) + num(f.semanaAlta, 8) + num(f.pieHasta, 7));
  }
  console.log('\ncapturas y medidas.json en: ' + SALIDA);
})().catch(function (e) { console.error(e); process.exit(1); });
