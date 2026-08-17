/**
 * verify.tamano.js - PACE · red de seguridad LOCAL · REGLA §1 (s162)
 *
 * No es un script suelto: lo invoca `scripts/verify.js` como una tanda mas, asi
 * que corre en cada `npm run verify`. Vive aparte por la MISMA razon que vigila
 * — al escribir esta comprobacion dentro de `verify.js`, el archivo paso a 544
 * lineas y la comprobacion se puso roja SOBRE SI MISMA en su primera pasada.
 * Se arreglo el diseño, no el checker (la leccion de s155, que se cobro un rojo
 * identico al trocear `eventos.spec.js`).
 *
 * QUE VIGILA: la regla §1 de CLAUDE.md, «archivos < 500 lineas».
 *
 * POR QUE EXISTE: la regla se rompio en TRES archivos a la vez en s159 y nadie
 * se entero durante tres versiones. `_responsive.js` paso de 465 a 1039 lineas
 * en un solo commit, `FocusTimer.jsx` de 450 a 685 y `tokens.css` de 399 a 520
 * (y luego a 676). La tabla «Deuda tecnica activa» de STATE.md se mantiene A
 * MANO, asi que seguia dando los tres por sanos — y la propia tabla advierte
 * «antes de trocear nada, MEDIR, no leer esta tabla». Esto la sustituye como
 * fuente de verdad: aqui se mide en cada pasada.
 *
 * ES RELACIONAL, no CENSO: no lleva ningun numero que caduque al crecer el
 * contenido. El unico numero es el limite, que lo fija CLAUDE.md §1 — mas la
 * deuda registrada, que es un trinquete y solo puede bajar.
 *
 * COMO SE CUENTA: por saltos de linea, descontando el ultimo si el archivo
 * termina en salto — o sea lo mismo que `wc -l`, salvo que aqui la ultima linea
 * cuenta aunque no acabe en salto (dos archivos del arbol van asi, y por eso sus
 * numeros son 1 mayores que los de `wc -l`). La trampa documentada en STATE.md
 * es la contraria y es de PowerShell: `Measure-Object -Line` NO cuenta las
 * lineas en blanco (41 de menos en tokens.css).
 *
 * ALCANCE: app/, tests/ y scripts/, que son los tres sitios donde la regla ya se
 * ha aplicado de verdad (s148 troceo cinco de app/, s155 partio eventos.spec.js
 * con 502 y s159 home-geometria.spec.js con 631). La RAIZ queda fuera y se
 * declara en NO_CUBRE con su numero, porque `build-standalone.js` nunca se ha
 * gobernado por §1 y trocear el build es una decision, no una limpieza: mejor
 * visible en cada pasada que escondida en un pase verde.
 */

'use strict';

var fs = require('fs');
var path = require('path');

var LIMITE_LINEAS = 500;
var TAMANO_DIRS = ['app', 'tests', 'scripts'];

/* DEUDA REGISTRADA · los cinco que ya estaban por encima cuando esto nacio.
   NO es una lista de perdon: es un TRINQUETE, y tiene tres dientes.
     · un archivo que NO esta aqui y pasa de 500  -> FALLA
     · un archivo de aqui que CRECE sobre su numero -> FALLA (no puede empeorar)
     · un archivo de aqui que baja de 500 -> FALLA pidiendo que se borre su fila,
       para que la lista no sobreviva a la deuda que describe
   Un archivo de aqui que ADELGAZA sin bajar de 500 no falla: se avisa con el
   numero nuevo, que es el que hay que escribir para apretar el trinquete. */
var DEUDA_500 = {
  'app/main/_responsive.js':      1132,
  'app/focus/FocusTimer.jsx':      686,
  'app/tokens.css':                676,
  'app/tweaks/TweaksPanel.jsx':    534,
  'app/state-core.jsx':            515,
};

function lineasDe(f) {
  var partes = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  if (partes.length && partes[partes.length - 1] === '') partes.pop();
  return partes.length;
}

/**
 * @param {object} io - { ROOT, falla, ok, info, listar, rel } de verify.js.
 *   `listar` y `rel` llegan por parametro y no se reescriben aqui: un segundo
 *   recorrido del arbol con otras exclusiones mediria otro arbol.
 */
function tandaTamano(io) {
  console.log('\n[+] Regla §1 · tamaño de archivo ...');
  var archivos = [];
  TAMANO_DIRS.forEach(function (d) {
    var dir = path.join(io.ROOT, d);
    if (fs.existsSync(dir)) io.listar(dir, /\.(js|jsx|css)$/, archivos);
  });
  /* GUARD DE CERO: si el reconocimiento devuelve nada, esto pasaria en verde
     para siempre sin mirar un solo archivo. Cero elementos es FALLO. */
  if (!archivos.length) {
    io.falla('GUARD: la regla §1 no encontro un solo archivo que medir en ' + TAMANO_DIRS.join(' · '));
    return;
  }
  var medidos = archivos.map(function (f) { return { f: io.rel(f), n: lineasDe(f) }; });

  /* DIENTE 1 · nadie nuevo por encima del limite. */
  var nuevos = medidos
    .filter(function (a) { return a.n > LIMITE_LINEAS && !(a.f in DEUDA_500); })
    .sort(function (a, b) { return b.n - a.n; });
  if (nuevos.length) {
    io.falla(nuevos.length + ' archivo(s) NUEVOS pasan de ' + LIMITE_LINEAS +
      ' lineas (CLAUDE.md §1) -- trocear, no anadir a DEUDA_500:\n          ' +
      nuevos.map(function (a) { return a.f + ' -- ' + a.n + ' ln (' + (a.n - LIMITE_LINEAS) + ' de mas)'; })
        .join('\n          '));
  }

  /* DIENTES 2 y 3 · la deuda registrada no crece, y desaparece cuando se paga.
     `problemas` existe para no imprimir el [OK] detras de un [FALLA]: la primera
     version cantaba «ninguna ha crecido» en la linea siguiente a «tokens.css
     CRECIO», y un checker que se contradice en dos lineas no se cree. */
  var problemas = nuevos.length;
  var porRuta = {};
  medidos.forEach(function (a) { porRuta[a.f] = a.n; });
  Object.keys(DEUDA_500).forEach(function (ruta) {
    var tope = DEUDA_500[ruta];
    var ahora = porRuta[ruta];
    if (ahora === undefined) {
      problemas++;
      io.falla('DEUDA_500 nombra ' + ruta + ', que ya no existe: borrar su fila');
      return;
    }
    if (ahora > tope) {
      problemas++;
      io.falla(ruta + ' CRECIO por encima de su deuda registrada: ' + tope + ' -> ' + ahora +
        ' ln. La regla §1 lo quiere bajo ' + LIMITE_LINEAS + ', no un poco peor cada sesion');
      return;
    }
    if (ahora <= LIMITE_LINEAS) {
      problemas++;
      io.falla(ruta + ' ya cumple §1 (' + ahora + ' ln): borrar su fila de DEUDA_500 ' +
        'para que la lista no sobreviva a la deuda');
      return;
    }
    if (ahora < tope) io.info(ruta + ' adelgazo: ' + tope + ' -> ' + ahora + ' ln (apretar el trinquete)');
  });

  var deuda = Object.keys(DEUDA_500).length;
  if (!problemas) {
    io.ok(archivos.length + ' archivos medidos en ' + TAMANO_DIRS.join('/') + ' · ninguno nuevo pasa de ' +
      LIMITE_LINEAS + ' ln · ' + deuda + ' con deuda registrada y ninguna ha crecido');
  }
}

var NO_CUBRE = [
  /* s162: el alcance de la regla §1 se declara en vez de ampliarse a la callada. */
  'regla §1: se miden app/, tests/ y scripts/ -- la RAIZ queda fuera, y ' +
    'build-standalone.js tiene 567 ln (trocear el build es una decision, no una limpieza)',
  'regla §1: se cuentan LINEAS, no complejidad -- un archivo de 499 lineas ' +
    'ilegibles pasa, y un .css de 480 con tres dominios dentro tambien',
  'regla §1: DEUDA_500 impide que la deuda crezca, NO que exista -- los cinco ' +
    'archivos registrados siguen por encima del limite hasta que alguien los trocee',
];

module.exports = { tandaTamano: tandaTamano, NO_CUBRE: NO_CUBRE, LIMITE_LINEAS: LIMITE_LINEAS };
