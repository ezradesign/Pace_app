/* PACE · state-compra.apps.js — LAS TIENDAS DE LAS APPS: GOOGLE PLAY Y APPLE
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE
   ============================================================
   En las apps se cobra directo con Google y con Apple, sin servicio de terceros (Ez, D-9 A del
   11 nov. 2026), con código propio: `PaceCompras.java` y `PaceCompras.swift` (Ez dejó la
   herramienta a juicio de la sesión el 18 nov., «la más estable y segura»; la pieza libre de
   Capgo arreglaba aún fallos de compras perdidas). Las dos tiendas tienen la forma de
   `state-compra.js` y solo les habla el guard (`state-entitlement.jsx`).

   APAGADAS HASTA LAS ALTAS DE EZ Y v1. Con `encendida` en false la pieza nativa ni se llama:
   ni precios, ni botones, ni «Restaurar». scripts/verify.compras.js falla si una se enciende
   sin su alta apuntada con su fecha (el perfil de pagos de Play, el acuerdo de apps de pago de
   Apple), sin la clave de licencia de Play o con PACE completo aún abierto para todos.

   LO QUE SABE LA TIENDA MANDA. Al arrancar (y al volver a la app) se le pregunta qué hay
   comprado; la respuesta se queda en memoria y, con su fecha, en `tiendaUltima`, para cuando la
   tienda no conteste (sin conexión y sin su memoria): el de por vida sigue, y la mensual vale
   hasta su fin (o un mes desde esa respuesta, si la tienda no lo dice) y `margenMes` más, como
   el código mensual de la web (auditoría externa, sexta nº 13). Con red, la tienda pisa lo
   guardado: una devolución cierra PACE completo en la siguiente pregunta. Al importar una
   copia, lo guardado de este móvil se queda (`paceConservarAlImportar`): la copia de otro
   móvil no trae su compra.

   SEGURIDAD SIN SERVIDOR. Android solo cree una compra con la firma de Google comprobada con
   la clave de licencia de Play Console (`play.clave`, pública), y nunca una pendiente; el
   iPhone, solo las transacciones que StoreKit 2 da por verificadas y sin revocar. Lo hace la
   pieza nativa; aquí solo llega lo que pasó.

   LA PIEZA (`Capacitor.Plugins.PaceCompras`), igual en las dos:
     productos({ ids, planBase, oferta }) -> { productos: [{ plan, texto, importe, moneda, pruebaDias? }] }
     compras({ ids, clave })              -> { compras: [{ plan, desde, hasta?, renueva?, prueba?, pendiente? }] }
     comprar({ plan, ids, planBase, oferta, clave }) -> { estado: 'comprado'|'pendiente'|'cancelado'|'error', compra? }
     restaurar({ ids, clave })            -> lo mismo que compras (en el iPhone, tras AppStore.sync)
     gestionar({ ids })  ·  canjear()     -> abren la página de la tienda
     evento 'compras' { compras }         -> lo comprado fuera de la app (códigos, un pago que se confirma)

   `var`/`function` a propósito: un `const` no cruza la IIFE del artefacto. Carga después de
   state-compra.js y antes del guard; lee la pieza al llamarse, nunca al evaluarse. */

var PACE_TIENDA_APPS = {
  play: { encendida: false, alta: null, clave: null },
  apple: { encendida: false, alta: null },
  ids: { vida: 'pace_completo_vida', mes: 'pace_completo_mes' },
  planBase: 'mensual',
  oferta: 'prueba-7-dias',
  margenMes: 3 * 86400000,
};

var PACE_TIENDA_MES_SIN_FIN = 31 * 86400000;
var _paceTiendaApps = {};

function paceTiendaAppDatos(canal) {
  if (!_paceTiendaApps[canal]) _paceTiendaApps[canal] = { estado: 'cerrada', planes: [], compras: null, oyente: false, ultima: 0 };
  return _paceTiendaApps[canal];
}

function paceTiendaAppPieza(canal) {
  var conf = PACE_TIENDA_APPS[canal];
  if (!conf || conf.encendida !== true) return null;
  if (typeof paceTiendaCanal !== 'function' || paceTiendaCanal() !== canal) return null;
  return typeof paceNativoPlugin === 'function' ? paceNativoPlugin('PaceCompras') : null;
}

function paceTiendaAppPedido(canal) {
  return { ids: PACE_TIENDA_APPS.ids, planBase: PACE_TIENDA_APPS.planBase, oferta: PACE_TIENDA_APPS.oferta,
    clave: canal === 'play' ? PACE_TIENDA_APPS.play.clave : null };
}

function paceTiendaAppAviso() {
  try { window.dispatchEvent(new CustomEvent('pace:tienda')); } catch (e) {}
}

/* Solo entra lo que tiene forma: un plan conocido y, si trae fechas, números. */
function paceTiendaAppLimpia(lista) {
  return (Array.isArray(lista) ? lista : []).filter(function (c) {
    return c && (c.plan === 'vida' || c.plan === 'mes') && (c.hasta == null || typeof c.hasta === 'number');
  }).map(function (c) {
    return { plan: c.plan, desde: typeof c.desde === 'number' ? c.desde : null, hasta: typeof c.hasta === 'number' ? c.hasta : null,
      renueva: c.renueva !== false, prueba: c.prueba === true, pendiente: c.pendiente === true };
  });
}

function paceTiendaAppGuardar(canal, compras) {
  var d = paceTiendaAppDatos(canal);
  d.compras = compras;
  try {
    var hechas = compras.filter(function (c) { return !c.pendiente; });
    setState({ tiendaUltima: { canal: canal, at: Date.now(), compras: hechas } });
  } catch (e) {}
  paceTiendaAppAviso();
}

/* Lo que dijo la tienda la última vez que contestó en este móvil, con su fecha. */
function paceTiendaAppGuardada(canal) {
  var s = typeof getState === 'function' ? getState() : null;
  var u = s && s.tiendaUltima;
  if (!u || u.canal !== canal || typeof u.at !== 'number') return [];
  return paceTiendaAppLimpia(u.compras).map(function (c) { return Object.assign(c, { at: u.at }); });
}

/* ¿Abre esta compra PACE completo? `guardada`: viene de lo guardado, no de la tienda ahora. */
function paceTiendaAppVale(c, guardada) {
  if (!c || c.pendiente) return false;
  if (c.plan === 'vida') return true;
  if (!guardada) return c.hasta == null || Date.now() < c.hasta;
  var fin = c.hasta != null ? c.hasta : (c.at || 0) + PACE_TIENDA_MES_SIN_FIN;
  return Date.now() < fin + PACE_TIENDA_APPS.margenMes;
}

function paceTiendaAppVigentes(canal) {
  var d = paceTiendaAppDatos(canal);
  var guardada = d.compras === null;
  var lista = guardada ? paceTiendaAppGuardada(canal) : d.compras;
  return lista.filter(function (c) { return paceTiendaAppVale(c, guardada); });
}

/* Preguntar a la tienda los precios y lo comprado. Sin la pieza (apagada, en la web, o aún sin
   cargar nativo.js) no se apunta nada: la siguiente llamada lo intenta otra vez. */
function paceTiendaAppCargar(canal) {
  var pieza = paceTiendaAppPieza(canal);
  var d = paceTiendaAppDatos(canal);
  if (!pieza) { d.estado = 'cerrada'; return Promise.resolve(d.estado); }
  d.estado = 'cargando';
  d.ultima = Date.now();
  if (!d.oyente && typeof pieza.addListener === 'function') {
    d.oyente = true;
    try { pieza.addListener('compras', function (r) { paceTiendaAppGuardar(canal, paceTiendaAppLimpia(r && r.compras)); }); } catch (e) {}
  }
  /* Fuera del pintado: la primera pregunta puede salir de un `vigente()` en mitad de un render. */
  setTimeout(paceTiendaAppAviso, 0);
  var pedido = paceTiendaAppPedido(canal);
  var compras = Promise.resolve().then(function () { return pieza.compras(pedido); }).then(function (r) {
    paceTiendaAppGuardar(canal, paceTiendaAppLimpia(r && r.compras));
  }, function () {});
  var productos = Promise.resolve().then(function () { return pieza.productos(pedido); }).then(function (r) {
    var planes = ((r && r.productos) || []).filter(function (p) { return p && (p.plan === 'vida' || p.plan === 'mes') && typeof p.texto === 'string'; })
      .map(function (p) {
        var plan = { plan: p.plan, texto: p.texto, importe: Number(p.importe) || 0, moneda: p.moneda || '' };
        if (p.plan === 'mes' && Number(p.pruebaDias) > 0) plan.pruebaDias = Number(p.pruebaDias);
        return plan;
      });
    d.planes = planes;
    d.estado = planes.length ? 'lista' : 'error';
  }, function () { d.planes = []; d.estado = 'error'; });
  return Promise.all([compras, productos]).then(function () { paceTiendaAppAviso(); return d.estado; });
}

function paceTiendaAppAsegurar(canal) {
  var d = paceTiendaAppDatos(canal);
  if (d.estado === 'cerrada' && paceTiendaAppPieza(canal)) paceTiendaAppCargar(canal);
  return d;
}

function paceTiendaApp(canal) {
  var tienda = {
    estado: function () { return paceTiendaAppAsegurar(canal).estado; },
    listo: function () { return paceTiendaAppAsegurar(canal).estado === 'lista'; },
    planes: function () { return tienda.listo() ? paceTiendaAppDatos(canal).planes.slice() : []; },
    precios: function () { return tienda.planes(); },
    reintentar: function () { return paceTiendaAppCargar(canal); },
    comprar: function (plan) {
      var pieza = paceTiendaAppPieza(canal);
      var p = tienda.planes().find(function (x) { return x.plan === plan; });
      if (!pieza || !p) return Promise.resolve({ ok: false, motivo: 'cerrada' });
      var pedido = Object.assign({ plan: plan }, paceTiendaAppPedido(canal));
      if (plan === 'mes' && !p.pruebaDias) pedido.oferta = null;
      return Promise.resolve().then(function () { return pieza.comprar(pedido); }).then(function (r) {
        var estado = r && r.estado;
        if (estado === 'pendiente') return { ok: false, motivo: 'pendiente', plan: plan };
        if (estado === 'cancelado') return { ok: false, motivo: 'cancelada', plan: plan };
        var hecha = estado === 'comprado' ? paceTiendaAppLimpia([r.compra])[0] : null;
        if (!hecha || hecha.pendiente) return { ok: false, motivo: 'error', plan: plan };
        var ya = (paceTiendaAppDatos(canal).compras || []).filter(function (c) { return c.plan !== hecha.plan; });
        paceTiendaAppGuardar(canal, ya.concat([hecha]));
        return { ok: true, plan: hecha.plan, prueba: hecha.prueba && hecha.hasta ? { hasta: hecha.hasta } : null };
      }, function () { return { ok: false, motivo: 'error', plan: plan }; });
    },
    vigente: function () {
      paceTiendaAppAsegurar(canal);
      return paceTiendaAppVigentes(canal).length > 0;
    },
    /* La compra que abre PACE completo, para Ajustes: la de por vida gana a la mensual. */
    compra: function () {
      var v = paceTiendaAppVigentes(canal);
      return v.find(function (c) { return c.plan === 'vida'; }) || v[0] || null;
    },
    puedeRestaurar: function () { return !!paceTiendaAppPieza(canal); },
    restaurar: function () {
      var pieza = paceTiendaAppPieza(canal);
      if (!pieza) return Promise.resolve({ ok: false, motivo: 'cerrada' });
      return Promise.resolve().then(function () { return pieza.restaurar(paceTiendaAppPedido(canal)); }).then(function (r) {
        paceTiendaAppGuardar(canal, paceTiendaAppLimpia(r && r.compras));
        var c = tienda.compra();
        return { ok: true, plan: c ? c.plan : null };
      }, function () { return { ok: false, motivo: 'error' }; });
    },
    puedeGestionar: function () { var c = tienda.compra(); return !!(c && c.plan === 'mes' && paceTiendaAppPieza(canal)); },
    gestionar: function () {
      var pieza = paceTiendaAppPieza(canal);
      if (!pieza) return false;
      try { Promise.resolve(pieza.gestionar({ ids: PACE_TIENDA_APPS.ids })).catch(function () {}); } catch (e) { return false; }
      return true;
    },
    puedeCanjear: function () { return tienda.listo(); },
    canjear: function () {
      var pieza = paceTiendaAppPieza(canal);
      if (!pieza) return false;
      try { Promise.resolve(pieza.canjear()).catch(function () {}); } catch (e) { return false; }
      return true;
    },
  };
  return tienda;
}

var paceTiendaPlay = paceTiendaApp('play');
var paceTiendaApple = paceTiendaApp('apple');

/* Al volver a la app, otra pregunta a la tienda (una cancelación, una devolución, un código
   canjeado en la tienda), como mucho una vez por minuto. */
try {
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') return;
    ['play', 'apple'].forEach(function (canal) {
      var d = paceTiendaAppDatos(canal);
      if (d.estado !== 'cargando' && Date.now() - d.ultima > 60000 && paceTiendaAppPieza(canal)) paceTiendaAppCargar(canal);
    });
  });
} catch (e) {}

Object.assign(window, {
  PACE_TIENDA_APPS, paceTiendaApp, paceTiendaPlay, paceTiendaApple, paceTiendaAppCargar, paceTiendaAppVale,
});
