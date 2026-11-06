/* PACE · state-compra.js — LAS TIENDAS DE PACE COMPLETO, UNA POR CANAL
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE
   ============================================================
   PACE completo se compra en dos tiendas: en la web, Stripe en su modo «vende
   por ti»; en Android, Google Play Billing (Ez, 15 oct. 2026). Cada tienda es un
   ADAPTADOR con la misma forma, y fuera de `state-entitlement.jsx` nadie habla
   con ellos: la app pregunta al guard (`paceTiendaAbierta`, `paceTiendaPlanes`,
   `paceComprar`, `paceGestionarCompra`) y el guard elige la tienda del canal en
   el que está. Así, enchufar una tienda no toca ni la bienvenida ni la
   invitación.

   HOY LAS DOS ESTÁN VACÍAS: `listo()` dice que no y nada enseña un botón de
   compra. La tienda de la web ofrece SOLO LOS PLANES QUE TIENEN ENLACE (Ez, 5 nov.
   2026: hasta v1, solo el de por vida y solo en la web): con `enlaces.vida` puesto
   y `enlaces.mes` en `null`, la tienda está lista y vende un plan. El mensual y
   su código de Stripe se quedan: vuelve con v1 en cuanto `enlaces.mes` tenga un
   valor, sin tocar nada más. Ninguna tienda enseña un plan sin enlace, y `precios()`
   (lo que costará después, para la bienvenida de «abierto hasta v1») sigue
   diciendo los dos. La de Play se rellena en `paceTiendaPlay` cuando la app lleve
   el complemento de Play Billing, y hasta entonces ni Android ni el iPhone
   tienen nada que comprar: ni botón, ni enlace a /premium.

   LA FORMA DE UNA TIENDA:
     listo()        -> true si en este canal ya se puede comprar.
     planes()       -> [{ plan: 'vida'|'mes', importe, moneda, texto?, pruebaDias? }]
                       Los que SE PUEDEN COMPRAR ahora. La tienda manda sobre importe
                       y moneda (ROADMAP, Fase 6): ningún precio vive en las
                       traducciones. `texto` es el precio ya escrito por la tienda
                       (Play lo da así) y gana al importe.
     precios()      -> lo mismo, pero con los planes que aún no se pueden comprar:
                       lo que costará después. Solo lo usa la bienvenida de «abierto
                       hasta v1», que dice los importes sin ofrecer nada.
     comprar(plan)  -> Promise<{ ok, motivo?, fuera?, licencia? }>
                       `fuera`: la compra sigue en otra página (la de Stripe), y el
                       código llega luego por el enlace de la página de gracias.
                       `licencia`: un código PACE1 que el guard canjea al momento.
     vigente()      -> true si la tienda dice que esta persona ya lo tiene (Play
                       lo sabe; en la web lo dice el código, no la tienda).
     gestionar()    -> abre donde se cancela la suscripción: la página de Stripe
                       o las suscripciones de Google Play.

   EN EL IPHONE NO HAY TIENDA hasta después de v1: su canal es 'ninguno'.

   `var`/`function` a propósito: un `const` no cruza la IIFE del artefacto. Carga
   después de state-licencia y antes de state-entitlement, y lee `paceEsNativo`
   (nativo.js, que carga después) al llamarse, nunca al evaluarse. */

/* La tienda de la web. Los importes llevan el IVA dentro (Stripe cobra el de cada
   país y el precio no cambia). `enlaces` son los Payment Links de Stripe: cada
   plan con enlace se vende y el que no lo tiene no existe para la app; con
   alguno puesto, la tienda se abre. Hoy los dos son `null` y la venta está apagada:
   `vida` lo enciende Ez cuando pase su dirección, y `mes` vuelve con v1. */
var PACE_TIENDA_WEB = {
  precios: {
    vida: { importe: 19.99, moneda: 'EUR' },
    mes:  { importe: 2.99, moneda: 'EUR', pruebaDias: 7 },
  },
  enlaces: { vida: null, mes: null },
  gestionar: null, // el portal de Stripe donde se cancela la suscripción
};

var PACE_TIENDA_PLANES = ['vida', 'mes'];

/* Los planes que se pueden comprar: con su precio y con su enlace. */
function paceTiendaWebCompra() {
  var pr = PACE_TIENDA_WEB.precios || {};
  var e = PACE_TIENDA_WEB.enlaces || {};
  return PACE_TIENDA_PLANES.filter(function (p) { return !!pr[p] && typeof e[p] === 'string' && e[p].length > 0; });
}

function paceTiendaWebLista() {
  return paceTiendaWebCompra().length > 0;
}

var paceTiendaWeb = {
  listo: paceTiendaWebLista,
  planes: function () {
    var pr = PACE_TIENDA_WEB.precios || {};
    return paceTiendaWebCompra().map(function (p) { return Object.assign({ plan: p }, pr[p]); });
  },
  precios: function () {
    var pr = PACE_TIENDA_WEB.precios || {};
    return PACE_TIENDA_PLANES.filter(function (p) { return !!pr[p]; }).map(function (p) {
      return Object.assign({ plan: p }, pr[p]);
    });
  },
  comprar: function (plan) {
    if (paceTiendaWebCompra().indexOf(plan) < 0) return Promise.resolve({ ok: false, motivo: 'cerrada' });
    var enlace = PACE_TIENDA_WEB.enlaces[plan];
    try { window.location.assign(enlace); } catch (e) { return Promise.resolve({ ok: false, motivo: 'error' }); }
    return Promise.resolve({ ok: true, fuera: true });
  },
  vigente: function () { return false; },
  /* El portal de Stripe: hasta que Ez tenga su enlace, «Gestionar» no sale en la web. */
  puedeGestionar: function () { return typeof PACE_TIENDA_WEB.gestionar === 'string' && PACE_TIENDA_WEB.gestionar.length > 0; },
  gestionar: function () {
    if (!PACE_TIENDA_WEB.gestionar) return false;
    try { window.open(PACE_TIENDA_WEB.gestionar, '_blank', 'noopener'); } catch (e) { return false; }
    return true;
  },
};

/* La tienda de Android, vacía hasta Play Billing. */
var paceTiendaPlay = {
  listo: function () { return false; },
  planes: function () { return []; },
  precios: function () { return []; },
  comprar: function () { return Promise.resolve({ ok: false, motivo: 'cerrada' }); },
  vigente: function () { return false; },
  /* Con Play Billing: las suscripciones de Google Play, si hay una. */
  puedeGestionar: function () { return false; },
  gestionar: function () { return false; },
};

var paceTiendaNinguna = {
  listo: function () { return false; },
  planes: function () { return []; },
  precios: function () { return []; },
  comprar: function () { return Promise.resolve({ ok: false, motivo: 'cerrada' }); },
  vigente: function () { return false; },
  puedeGestionar: function () { return false; },
  gestionar: function () { return false; },
};

/* 'web' | 'play' | 'ninguno' */
function paceTiendaCanal() {
  var p = typeof pacePlataformaNativa === 'function' ? pacePlataformaNativa() : null;
  if (p === 'android') return 'play';
  if (p) return 'ninguno';
  return 'web';
}

/* Se lee de `window`: el complemento de Play, al llegar, y las pruebas ponen ahí su tienda. */
function paceTiendaDelCanal() {
  var c = paceTiendaCanal();
  if (c === 'web') return window.paceTiendaWeb || paceTiendaWeb;
  if (c === 'play') return window.paceTiendaPlay || paceTiendaPlay;
  return paceTiendaNinguna;
}

/* El precio de un plan escrito en el idioma de la app: «19,99 €» / «€19.99». */
function paceTiendaPrecioTexto(plan, lang) {
  if (!plan) return '';
  if (plan.texto) return plan.texto;
  try {
    return new Intl.NumberFormat(lang === 'en' ? 'en-IE' : 'es-ES', { style: 'currency', currency: plan.moneda }).format(plan.importe);
  } catch (e) {
    return String(plan.importe) + ' ' + plan.moneda;
  }
}

Object.assign(window, {
  PACE_TIENDA_WEB, paceTiendaWeb, paceTiendaPlay, paceTiendaCanal, paceTiendaDelCanal, paceTiendaPrecioTexto,
});
