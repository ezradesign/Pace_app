/**
 * verify.eventos.js - PACE · tanda de `pace.events.v1` (s155)
 *
 * No es un script suelto: lo invoca `verify.integridad.js` dentro de la tanda
 * [4/4] de `npm run verify`. Vive aparte solo por tamaño (la regla 1 de
 * CLAUDE.md son 500 lineas), igual que s152 saco esta segunda tanda de
 * `verify.js`.
 *
 * QUE CUBRE: que el registro LOCAL de uso siga siendo local. Las cinco
 * comprobaciones son RELACIONALES -- ninguna lleva numero y ninguna caduca --
 * y protegen promesas escritas en una pagina PUBLICA (`privacy.html`).
 */

'use strict';

var fs   = require('fs');
var path = require('path');

/* ==========================================================================
   pace.events.v1 -- registro LOCAL de uso (s155)

   Las cinco de aqui son RELACIONALES: ninguna lleva numero y ninguna caduca.
   Protegen promesas que estan escritas en una pagina PUBLICA (`privacy.html`)
   y que un descuido de implementacion volveria falsas sin que nadie lo note.

   SE MIRA EL CODIGO, NO EL ARCHIVO. Las cabeceras de `app/events/*` NOMBRAN
   `fetch`, `WebSocket` y compania precisamente para prohibirlos, asi que un
   grep a secas se autoinculparia. Es la trampa de s146 (rutas entrecomilladas
   en comentarios) por otra puerta: se compila con `comments:false` y se busca
   sobre lo que queda.
   ========================================================================== */

/* Codigo de un archivo SIN comentarios, via el Babel del build. */
function codigoSinComentarios(ctx, f) {
  var abs = path.join(ctx.ROOT, f);
  if (!fs.existsSync(abs)) return null;
  try {
    return ctx.babel.transformSync(fs.readFileSync(abs, 'utf8'), {
      presets: [[path.join(ctx.ROOT, 'node_modules', '@babel', 'preset-react'), {}]],
      filename: abs, configFile: false, babelrc: false, sourceType: 'script', comments: false,
    }).code;
  } catch (e) { return null; }
}

/* Canales de SALIDA del dispositivo. Si alguno aparece dentro de app/events/,
   el subsistema ha dejado de ser local y eso es una decision de producto, no
   un ajuste de implementacion. */
var EVENTS_RED = ['fetch', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'EventSource',
                  'importScripts', 'navigator.sendBeacon'];

/* `listaCorta` llega por parametro en vez de duplicarse: es el formateador de
   verify.integridad.js y un segundo con otro criterio daria mensajes distintos
   para el mismo problema. */
function chequeaEventos(ctx, declarados, listaCorta) {
  var files = declarados.filter(function (f) { return f.indexOf('app/events/') === 0; });

  /* Guard de cero (regla de s152): si no se reconoce NI UN archivo del
     subsistema, esto no es un verde silencioso -- o se han movido de sitio o
     alguien los ha sacado de PACE.html. */
  if (!files.length) {
    ctx.falla('eventos: PACE.html no declara NI UN archivo de app/events/ -- ' +
              'o el subsistema se ha movido, o esta comprobacion se quedo mirando al vacio');
    return;
  }

  var codigos = {};
  var ilegibles = [];
  files.forEach(function (f) {
    var c = codigosSinComentariosCache(ctx, codigos, f);
    if (c === null) ilegibles.push(f);
  });
  if (ilegibles.length) {
    ctx.falla('eventos: no se pudo compilar ' + listaCorta(ilegibles) +
              ' -- sin poder leer el codigo, las comprobaciones de abajo no valen nada');
    return;
  }
  ctx.ok('archivos del subsistema de eventos declarados: ' + files.length);

  /* 1. CERO RED. La promesa es que los eventos no salen del dispositivo. */
  var conRed = [];
  files.forEach(function (f) {
    EVENTS_RED.forEach(function (api) {
      var re = new RegExp('\\b' + api.replace('.', '\\.') + '\\b');
      if (re.test(codigos[f])) conRed.push(f + ' -> ' + api);
    });
    if (/https?:\/\//.test(codigos[f])) conRed.push(f + ' -> URL remota');
  });
  if (conRed.length) {
    ctx.falla('eventos: hay canal de SALIDA en el subsistema local (' + listaCorta(conRed) + ') -- ' +
              'pace.events.v1 no envia nada a ningun sitio; anadirlo es otra decision, no un ajuste');
  } else {
    ctx.ok('eventos: cero canales de red en app/events/ (' + EVENTS_RED.length + ' APIs vigiladas + URLs)');
  }

  /* 2. UNA fuente de verdad por dominio: el subsistema de eventos no escribe
        en el almacen legacy. Quien toca `pace.state.v2` es state-core. */
  var invasores = files.filter(function (f) { return /pace\.state\.v2/.test(codigos[f]); });
  if (invasores.length) {
    ctx.falla('eventos: ' + listaCorta(invasores) + ' toca pace.state.v2 -- una unica fuente de ' +
              'verdad por dominio: el log es suyo, el estado legacy es de state-core');
  } else {
    ctx.ok('eventos: app/events/ no escribe en pace.state.v2 (una fuente de verdad por dominio)');
  }

  /* 3. El reset de Ajustes borra los DOS almacenes. `privacy.html` promete que
        «puedes borrarlo todo desde Ajustes» y que el borrado es «definitivo».
        Si alguien devuelve el `removeItem` suelto, esa frase se vuelve falsa. */
  var panel = codigosSinComentariosCache(ctx, codigos, 'app/tweaks/TweaksPanel.jsx');
  if (panel === null) {
    ctx.falla('eventos: no se pudo leer TweaksPanel.jsx para comprobar el reset');
  } else if (!/paceEventsWipeAll/.test(panel)) {
    ctx.falla('eventos: el reset de Ajustes ya no pasa por paceEventsWipeAll -- entonces ' +
              'pace.events.v1 SOBREVIVE al reset y privacy.html miente al prometer borrado total');
  } else {
    ctx.ok('eventos: el reset de Ajustes borra los dos almacenes (via barrera)');
  }

  /* 4. Importar un backup no puede dejar mezcla: el estado entra por la misma
        barrera, que reinicia el contenedor con activatedAt nuevo. */
  var datos = codigosSinComentariosCache(ctx, codigos, 'app/tweaks/TweaksData.jsx');
  if (datos === null) {
    ctx.falla('eventos: no se pudo leer TweaksData.jsx para comprobar el import');
  } else if (!/paceEventsStoreBarrier/.test(datos)) {
    ctx.falla('eventos: el import ya no pasa por paceEventsStoreBarrier -- un backup importado ' +
              'convivira con el baseline capturado del estado ANTERIOR (mezcla parcial, §17)');
  } else {
    ctx.ok('eventos: importar un backup reinicia el contenedor (via barrera)');
  }

  /* 5. GATE CON FECHA DE CADUCIDAD -- el que de verdad importa.
        Hoy el backup publico NO lleva seccion de eventos, y es correcto: el
        contenedor esta vacio porque no hay emisores. El dia que un modulo de
        producto emita, `privacy.html` («puedes exportar TODO tu estado») deja
        de ser cierta salvo que el export la lleve. Esto lo hace imposible de
        olvidar: en cuanto aparece un emisor fuera de app/events/, el export
        tiene que llevarla o esto se pone rojo.
        Es una comprobacion RELACIONAL: no dice cuantos emisores hay ni cuando
        llegan, solo que los dos lados van juntos. */
  var emisores = [];
  declarados.forEach(function (f) {
    if (f.indexOf('app/events/') === 0) return;
    var c = codigosSinComentariosCache(ctx, codigos, f);
    if (c && /\bpaceEventsAppend\s*\(/.test(c)) emisores.push(f);
  });
  var exporta = !!(datos && /paceEventsExport/.test(datos));
  if (!emisores.length && exporta) {
    /* s169 puso la condicion de entrada ANTES que el primer emisor, a
       proposito: asi el gate no puede pillar a nadie a mitad de camino. */
    ctx.ok('eventos: sin emisores todavia (Fase 2), pero el export de «Tus datos» YA lleva la ' +
           'seccion -- la condicion de entrada esta puesta antes que el primer emisor');
  } else if (!emisores.length) {
    ctx.ok('eventos: sin emisores todavia (Fase 2) -- el backup publico no lleva seccion de eventos, ' +
           'y en cuanto aparezca un emisor esta comprobacion exigira que la lleve');
  } else if (exporta) {
    ctx.ok('eventos: hay emisores (' + listaCorta(emisores) + ') y el export de «Tus datos» ' +
           'incluye la seccion de eventos');
  } else {
    ctx.falla('eventos: YA HAY EMISORES (' + listaCorta(emisores) + ') pero el export de «Tus datos» ' +
              'sigue sin llevar la seccion de eventos -- privacy.html promete exportar TODO el estado ' +
              'y con esto dejaria de ser cierto. Cablear paceEventsExport en TweaksData.jsx');
  }
}

/* Memoiza la compilacion sin comentarios: la comprobacion 5 recorre todo app/
   y sin cache seria compilar el arbol entero dos veces. */
function codigosSinComentariosCache(ctx, cache, f) {
  if (!Object.prototype.hasOwnProperty.call(cache, f)) cache[f] = codigoSinComentarios(ctx, f);
  return cache[f];
}

/* Lo que ESTA tanda no alcanza a ver. Se suma al bloque que verify.js imprime
   en cada pasada, tambien en verde. */
var NO_CUBRE_EVENTOS = [
  'eventos: se comprueba que app/events/ no tenga canal de red, no que el resto de la app no ' +
    'envie nada -- es un checker ESTATICO y solo mira el subsistema',
  'eventos: se comprueba que el reset y el import PASEN por la barrera, no que la barrera ' +
    'funcione -- eso lo prueba «npm run test:e2e» en un navegador de verdad (s155)',
  'eventos: la retencion por CALENDARIO (120 d, §12) esta implementada pero NO programada -- ' +
    'sin emisores no hay nada que podar; la Fase 3 la engancha al rollover diario',
];

module.exports = { chequeaEventos: chequeaEventos, NO_CUBRE_EVENTOS: NO_CUBRE_EVENTOS };
