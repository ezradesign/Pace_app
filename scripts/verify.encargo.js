/**
 * verify.encargo.js - PACE · el encargo de arte dice la verdad (s169)
 *
 * No es un script suelto: lo invoca `verify.integridad.js` dentro de la tanda
 * [4/4] de `npm run verify`. Vive aparte solo por tamaño (la regla 1 de
 * CLAUDE.md son 500 lineas, y `verify.integridad.js` ya iba por 454).
 *
 * POR QUE EXISTE. `docs/product/GLIFOS_LOGROS_ENCARGO.md` es la lista de
 * dibujos que el usuario tiene pendientes. En s169 se descubrio que decia
 * «los 38 glifos que faltan» cuando faltaban 19: s167 entrego 19 y NADIE
 * volvio a tocar la lista, asi que quien la abriera para ponerse a dibujar se
 * encontraria la mitad del trabajo ya hecho, sin una sola marca que lo dijera.
 *
 * Eso no es un documento desactualizado: es un documento que PIDE TRABAJO YA
 * HECHO. Se paga en horas de dibujo, no en una linea de docs. Y es el mismo
 * mecanismo que ya fallo en s149, s151 y s168 (`CONTENT.md` decia 100/92 con
 * 96/88 reales): una nota de backlog no lo habria evitado, porque el fallo es
 * precisamente que nadie vuelve a mirar.
 *
 * LAS CUATRO SON RELACIONALES. Ningun numero vive aqui dentro: los tres
 * primeros cruzan el documento contra el mapa de mascaras REAL, y el cuarto
 * compara la cifra que el propio documento afirma contra la medida. Si el
 * catalogo crece o se entrega arte, esto no caduca -- se pone rojo, que es
 * distinto.
 *
 * LAS DOS DIRECCIONES, que es lo que hace que esto sirva:
 *   - lo que SOBRA (filas de ids que ya no existen) se ve leyendo.
 *   - lo que FALTA (un logro sin arte que el documento no menciona) NO se ve
 *     leyendo, y es el fallo por omision. Por eso hay una comprobacion para
 *     cada sentido y no una sola.
 */

'use strict';

var fs   = require('fs');
var path = require('path');

var DOC = 'docs/product/GLIFOS_LOGROS_ENCARGO.md';

/* Una fila del encargo es `| \`id\` | ...` o `| ~~\`id\`~~ **ENTREGADO** | ...`.
   Se lee el id de la PRIMERA celda y si la fila lleva la marca; el resto de la
   fila (titulo, sugerencia de dibujo) es prosa y aqui no se juzga. */
var FILA = /^\|\s*~*`([a-z0-9._]+)`~*/;

/* La cabecera afirma cuantos faltan: «**77** · **sin arte: 19**». Se captura
   el numero para contrastarlo, no para fiarse de el. */
var CIFRA_SIN_ARTE = /\*\*sin arte:\s*(\d+)\*\*/;

function leerFilas(texto) {
  var filas = [];
  texto.split('\n').forEach(function (l, i) {
    var m = l.match(FILA);
    if (m) filas.push({ ln: i + 1, id: m[1], marcada: /\*\*ENTREGADO\*\*/.test(l) });
  });
  return filas;
}

/**
 * @param ctx        el contexto de verify.js (ROOT, ok, falla)
 * @param logros     { MASK, CAT } que devuelve chequeaLogros -- NO se vuelve a
 *                   cargar el sandbox: duplicarlo fue justo el defecto de
 *                   `revision-glifos.js` que s168 tuvo que arreglar.
 * @param listaCorta el formateador de verify.integridad.js, por parametro para
 *                   que el mensaje de un mismo problema no cambie de forma.
 */
function chequeaEncargo(ctx, logros, listaCorta) {
  var abs = path.join(ctx.ROOT, DOC);

  /* El documento es de producto, no de codigo: puede no estar, y eso no es un
     fallo del arbol. Se dice y se sigue. */
  if (!fs.existsSync(abs)) {
    ctx.ok('encargo de glifos: no existe ' + DOC + ' -- nada que contrastar');
    return;
  }
  /* Si la tanda de logros no pudo cargar el catalogo, aqui no hay contra que
     medir: callarse seria dar un verde que no se ha ganado. */
  if (!logros || !logros.CAT || !logros.MASK) {
    ctx.falla('encargo de glifos: sin catalogo ni mapa de mascaras -- no se ha contrastado nada');
    return;
  }

  var texto = fs.readFileSync(abs, 'utf8');
  var filas = leerFilas(texto);

  /* Guard de cero (regla de s152): cero filas reconocidas no es «documento
     limpio», es «la expresion ya no casa con la tabla». Sin esto, cambiar el
     formato de la tabla apagaria las cuatro comprobaciones EN SILENCIO. */
  if (!filas.length) {
    ctx.falla('encargo de glifos: no se reconoce ni una fila en ' + DOC +
              ' -- el analisis no ha mirado nada');
    return;
  }

  var conArte = new Set(Object.keys(logros.MASK));
  var idsCat  = new Set(logros.CAT.map(function (a) { return a.id; }));
  var enDoc   = new Set(filas.map(function (f) { return f.id; }));

  /* 1 · IDS FANTASMA. Una fila que pide dibujar algo que ya no esta en el
     catalogo es trabajo que nadie va a ver. */
  var fantasmas = filas.filter(function (f) { return !idsCat.has(f.id); });
  if (fantasmas.length) {
    ctx.falla('encargo de glifos: ' + fantasmas.length + ' fila(s) con id que NO existe en el catalogo: ' +
              listaCorta(fantasmas.map(function (f) { return f.id + ' (linea ' + f.ln + ')'; })));
  } else {
    ctx.ok('encargo de glifos: las ' + filas.length + ' filas existen en el catalogo');
  }

  /* 2 · EL FALLO POR OMISION. Un logro sin arte que el documento no menciona
     no aparece leyendo la lista: sencillamente nunca se dibuja. */
  var sinArte    = logros.CAT.filter(function (a) { return !conArte.has(a.id); }).map(function (a) { return a.id; });
  var noListados = sinArte.filter(function (id) { return !enDoc.has(id); });
  if (noListados.length) {
    ctx.falla('encargo de glifos: ' + noListados.length + ' logro(s) SIN arte que el encargo no lista (' +
              listaCorta(noListados) + ') -- se quedarian sin dibujar sin que nadie lo note');
  } else {
    ctx.ok('encargo de glifos: los ' + sinArte.length + ' logros sin arte estan todos listados');
  }

  /* 3 · LA MARCA CONTRA EL ARTE REAL, en las dos direcciones. Es lo unico que
     impide que el saneado de hoy sea la mentira de mañana. */
  var pideHecho  = filas.filter(function (f) { return !f.marcada && conArte.has(f.id); });
  var marcaFalsa = filas.filter(function (f) { return f.marcada && !conArte.has(f.id); });
  if (pideHecho.length) {
    ctx.falla('encargo de glifos: ' + pideHecho.length + ' fila(s) piden un dibujo que YA existe -- ' +
              'tachalas y marcalas ENTREGADO: ' +
              listaCorta(pideHecho.map(function (f) { return f.id + ' (linea ' + f.ln + ')'; })));
  }
  if (marcaFalsa.length) {
    ctx.falla('encargo de glifos: ' + marcaFalsa.length + ' fila(s) marcadas ENTREGADO SIN mascara en el mapa: ' +
              listaCorta(marcaFalsa.map(function (f) { return f.id + ' (linea ' + f.ln + ')'; })));
  }
  if (!pideHecho.length && !marcaFalsa.length) {
    var hechas = filas.filter(function (f) { return f.marcada; }).length;
    ctx.ok('encargo de glifos: la marca coincide con el mapa (' + hechas + ' entregadas, ' +
           (filas.length - hechas) + ' sin arte)');
  }

  /* 4 · LA CIFRA DE LA CABECERA. El documento afirma un numero en su primera
     linea util; es esa afirmacion la que esta bajo prueba, no la medida. */
  var m = texto.match(CIFRA_SIN_ARTE);
  if (!m) {
    ctx.falla('encargo de glifos: la cabecera de ' + DOC + ' ya no declara «sin arte: N» ' +
              '-- sin esa cifra nadie sabe cuanto queda al abrir el documento');
  } else if (Number(m[1]) !== sinArte.length) {
    ctx.falla('encargo de glifos: la cabecera dice «sin arte: ' + m[1] + '» y faltan ' +
              sinArte.length + ' de verdad');
  } else {
    ctx.ok('encargo de glifos: la cabecera dice la verdad (sin arte: ' + sinArte.length + ')');
  }
}

/* Lo que ESTA comprobacion no cubre. Se suma al bloque que verify.js imprime
   en cada pasada, tambien en verde: lo que se añade, se declara. */
var NO_CUBRE_ENCARGO = [
  'encargo de glifos: se comprueba que el documento diga la verdad sobre QUE falta, ' +
    'NO que las sugerencias de dibujo sean buenas ni que el ORDEN de la cola sea el ' +
    'correcto -- eso es criterio, y en s169 lo decidio el usuario a mano',
  'encargo de glifos: una mascara en el mapa cuenta como «dibujado», pero de si ese ' +
    'dibujo se LEE a 56 px no se mira un pixel -- eso sigue siendo la revision a tamaño real',
];

module.exports = { chequeaEncargo: chequeaEncargo, NO_CUBRE_ENCARGO: NO_CUBRE_ENCARGO };
