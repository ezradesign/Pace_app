/**
 * verify.compras.js - PACE · red de seguridad LOCAL · LAS TIENDAS DE LAS APPS, APAGADAS HASTA LAS ALTAS
 *
 * No es un script suelto: lo invoca `scripts/verify.js` como una tanda más.
 *
 * QUÉ VIGILA (Ez, 18 nov. 2026: «nada se puede encender sin las altas»):
 *   · que ninguna tienda de las apps (`PACE_TIENDA_APPS`, app/state-compra.apps.js) esté encendida
 *     sin su alta apuntada con su fecha (`alta: 'AAAA-MM-DD'`: el perfil de pagos de Play, el
 *     acuerdo de apps de pago de Apple), ni con PACE completo aún abierto para todos
 *     (`PREMIUM_ABIERTO_HASTA_V1`): antes de v1 las apps no venden (Ez, 5 nov.);
 *   · que la de Play no se encienda sin la clave de licencia de Play Console (`play.clave`, pública):
 *     sin ella el móvil no puede comprobar la firma de Google de cada compra;
 *   · que los números de producto estén escritos (no se pueden cambiar después de crearlos);
 *   · que la prueba de 7 días no se dé por supuesta (`pruebaDias) || 7`): solo si la tienda la da
 *     (sexta pasada, nº 9), y que las apps no prometan el aviso de dos días antes (Ez, D-11 A);
 *   · que las dos piezas nativas (`PaceCompras.java` y `PaceCompras.swift`) existan, estén
 *     registradas y hagan lo que las hace seguras sin servidor: Android comprueba la firma, no da
 *     por buena una compra pendiente y confirma cada compra (o Google la devuelve a los 3 días);
 *     el iPhone solo cree las transacciones verificadas y sin revocar, restaura con
 *     `AppStore.sync`, abre el canje de códigos y la página de las suscripciones.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var NO_CUBRE = [
  'compras: se lee que las piezas comprueben la firma, confirmen y descarten lo pendiente, no que Google y Apple contesten así -- eso solo se sabe con las altas de Ez, con un tester con licencia en Android y una cuenta de prueba en TestFlight',
  'compras: que el alta apuntada sea verdad no lo puede saber un script -- la fecha la escribe quien la vio hecha',
];

function leer(ROOT, rel) {
  try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch (e) { return null; }
}

/* PACE_TIENDA_APPS tal como lo ve la app, evaluado aparte con lo justo. */
function tiendaApps(texto) {
  var caja = { window: {}, document: { addEventListener: function () {} }, setTimeout: function () {}, CustomEvent: function () {} };
  vm.runInNewContext(texto + '\n;this.__T = PACE_TIENDA_APPS;', caja, { timeout: 2000 });
  return caja.__T;
}

function tandaCompras(ctx) {
  var ROOT = ctx.ROOT;
  var malas = [];
  var apps = leer(ROOT, 'app/state-compra.apps.js');
  var guard = leer(ROOT, 'app/state-entitlement.jsx') || '';
  if (!apps) { ctx.falla('compras: falta app/state-compra.apps.js (las tiendas de Google Play y Apple)'); return; }
  var T;
  try { T = tiendaApps(apps); } catch (e) { ctx.falla('compras: PACE_TIENDA_APPS no se puede leer: ' + e.message); return; }
  var abierto = /const PREMIUM_ABIERTO_HASTA_V1 = true;/.test(guard);
  var encendidas = [];
  ['play', 'apple'].forEach(function (canal) {
    var c = T && T[canal];
    if (!c) { malas.push('falta la tienda «' + canal + '» en PACE_TIENDA_APPS'); return; }
    if (c.encendida === false) return;
    if (c.encendida !== true) { malas.push(canal + ': `encendida` tiene que ser true o false'); return; }
    encendidas.push(canal);
    if (typeof c.alta !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(c.alta)) malas.push(canal + ' encendida sin su alta apuntada con fecha (`alta: \'AAAA-MM-DD\'`)');
    if (abierto) malas.push(canal + ' encendida con PREMIUM_ABIERTO_HASTA_V1 en true: antes de v1 las apps no venden');
    if (canal === 'play' && !(typeof c.clave === 'string' && /^[A-Za-z0-9+/=]{200,}$/.test(c.clave))) {
      malas.push('play encendida sin la clave de licencia de Play Console (`play.clave`): no se podría comprobar la firma de las compras');
    }
  });
  var ids = T && T.ids;
  if (!ids || typeof ids.vida !== 'string' || !ids.vida || typeof ids.mes !== 'string' || !ids.mes) malas.push('faltan los números de producto (`ids.vida` y `ids.mes`)');
  if (!T || typeof T.planBase !== 'string' || typeof T.oferta !== 'string') malas.push('faltan el plan base y la oferta de la prueba de Play (`planBase`, `oferta`)');

  /* La prueba y el aviso de dos días, en lo que pinta la compra. */
  ['app/ui/PremiumInvitacion.jsx', 'app/onboarding/OnboardingCompleto.jsx'].forEach(function (rel) {
    var s = leer(ROOT, rel) || '';
    if (/pruebaDias\)\s*\|\|\s*7/.test(s)) malas.push(rel + ' da por supuestos 7 días de prueba: solo si la tienda los da (sexta nº 9)');
    s.split('\n').forEach(function (linea, i) {
      if (/'premium\.onb\.aviso'/.test(linea) && !/!nativo/.test(linea)) malas.push(rel + ':' + (i + 1) + ' promete el aviso de dos días también en las apps (Ez, D-11 A)');
    });
  });

  /* Las piezas nativas. */
  var java = leer(ROOT, 'android/app/src/main/java/com/ezradesign/pace/PaceCompras.java');
  var main = leer(ROOT, 'android/app/src/main/java/com/ezradesign/pace/MainActivity.java') || '';
  var gradle = leer(ROOT, 'android/app/build.gradle') || '';
  if (!java) malas.push('falta PaceCompras.java (la compra de Google Play)');
  else {
    if (!/registerPlugin\(PaceCompras\.class\)/.test(main)) malas.push('PaceCompras no está registrado en MainActivity.java');
    if (!/SHA1withRSA/.test(java)) malas.push('PaceCompras.java ya no comprueba la firma de Google (SHA1withRSA)');
    if (!/acknowledgePurchase/.test(java)) malas.push('PaceCompras.java ya no confirma las compras: Google las devolvería a los 3 días');
    if (!/PurchaseState\.PENDING/.test(java)) malas.push('PaceCompras.java ya no aparta las compras pendientes');
    var v = gradle.match(/com\.android\.billingclient:billing:(\d+)\./);
    if (!v) malas.push('android/app/build.gradle no lleva la biblioteca de cobro de Google');
    else if (Number(v[1]) < 8) malas.push('la biblioteca de cobro de Google es la ' + v[1] + ': Play pide la 8 o más desde el 1 nov. 2026');
  }
  var swift = leer(ROOT, 'ios/App/App/PaceCompras.swift');
  var puente = leer(ROOT, 'ios/App/App/PaceViewController.swift') || '';
  var proyecto = leer(ROOT, 'ios/App/App.xcodeproj/project.pbxproj') || '';
  if (!swift) malas.push('falta PaceCompras.swift (la compra de Apple)');
  else {
    if (!/registerPluginInstance\(PaceCompras\(\)\)/.test(puente)) malas.push('PaceCompras no está registrado en PaceViewController.swift');
    if ((proyecto.match(/PaceCompras\.swift/g) || []).length < 4) malas.push('PaceCompras.swift no está en el proyecto de Xcode (project.pbxproj)');
    if (!/case \.verified/.test(swift) || !/revocationDate/.test(swift)) malas.push('PaceCompras.swift ya no se queda solo con lo verificado y sin revocar');
    if (!/AppStore\.sync\(\)/.test(swift)) malas.push('PaceCompras.swift ya no restaura con AppStore.sync');
    if (!/presentOfferCodeRedeemSheet/.test(swift)) malas.push('PaceCompras.swift ya no abre el canje de códigos de Apple');
    if (!/showManageSubscriptions/.test(swift)) malas.push('PaceCompras.swift ya no abre las suscripciones');
  }

  if (malas.length) ctx.falla('compras: ' + malas.join('; '));
  else ctx.ok('compras: ' + (encendidas.length ? 'encendidas ' + encendidas.join(' y ') + ' con su alta' : 'las tiendas de las apps, apagadas hasta las altas de Ez') +
    '; la prueba solo si la tienda la da; las dos piezas comprueban lo que compran');
}

module.exports = { tandaCompras: tandaCompras, NO_CUBRE: NO_CUBRE };
