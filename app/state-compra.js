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
   compra. Para abrir la de la web basta con poner los dos enlaces de pago de
   Stripe en `PACE_TIENDA_WEB.enlaces`; la de Play se rellena en
   `paceTiendaPlay` cuando la app lleve el complemento de Play Billing.

   LA FORMA DE UNA TIENDA:
     listo()        -> true si en este canal ya se puede comprar.
     planes()       -> [{ plan: 'vida'|'mes', importe, moneda, texto?, pruebaDias? }]
                       La tienda manda sobre importe y moneda (ROADMAP, Fase 6):
                       ningún precio vive en las traducciones. `texto` es el precio
                       ya escrito por la tienda (Play lo da así) y gana al importe.
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
   país y el precio no cambia). `enlaces` son los Payment Links de Stripe: con los
   dos puestos, la tienda se abre. */
var PACE_TIENDA_WEB = {
  precios: {
    vida: { importe: 19.99, moneda: 'EUR' },
    mes:  { importe: 2.99, moneda: 'EUR', pruebaDias: 7 },
  },
  enlaces: { vida: null, mes: null },
  gestionar: null, // el portal de Stripe donde se cancela la suscripción
};

var PACE_TIENDA_PLANES = ['vida', 'mes'];

function paceTiendaWebLista() {
  var e = PACE_TIENDA_WEB.enlaces || {};
  return PACE_TIENDA_PLANES.every(function (p) { return typeof e[p] === 'string' && e[p].length > 0; });
}

var paceTiendaWeb = {
  listo: paceTiendaWebLista,
  planes: function () {
    var pr = PACE_TIENDA_WEB.precios || {};
    return PACE_TIENDA_PLANES.filter(function (p) { return !!pr[p]; }).map(function (p) {
      return Object.assign({ plan: p }, pr[p]);
    });
  },
  comprar: function (plan) {
    var enlace = (PACE_TIENDA_WEB.enlaces || {})[plan];
    if (!enlace) return Promise.resolve({ ok: false, motivo: 'cerrada' });
    try { window.location.assign(enlace); } catch (e) { return Promise.resolve({ ok: false, motivo: 'error' }); }
    return Promise.resolve({ ok: true, fuera: true });
  },
  vigente: function () { return false; },
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
  comprar: function () { return Promise.resolve({ ok: false, motivo: 'cerrada' }); },
  vigente: function () { return false; },
  gestionar: function () { return false; },
};

var paceTiendaNinguna = {
  listo: function () { return false; },
  planes: function () { return []; },
  comprar: function () { return Promise.resolve({ ok: false, motivo: 'cerrada' }); },
  vigente: function () { return false; },
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
