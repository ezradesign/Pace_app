/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   nativo.js — LA APP DE LAS TIENDAS, SEA ANDROID O IPHONE
   ============================================================
   En las dos tiendas PACE es la misma web dentro de un WebView, y lo que ese
   WebView no trae lo dan complementos de Capacitor. Quien habla con ellos es
   `android.js` en Android y `ios.js` en el iPhone; el resto de la app pregunta
   AQUI y no sabe en cual de los dos esta. En la web, en el standalone y en las
   pruebas sin Capacitor todo contesta como la web.

   ¿ES LA APP DE UNA TIENDA? (`paceEsNativo`) Para PACE, Google Play y la App
   Store ponen las mismas reglas: nada de pagar fuera de su cobro (sin apoyo con
   Buy Me a Coffee y sin los codigos propios de PACE completo), ningun texto que
   hable del navegador, los enlaces legales a la web publicada (en la app no hay
   servidor que resuelva /privacy) y nada de pedir permiso a Google o Microsoft
   dentro del WebView. Lo que solo tiene Android (el boton atras, las alarmas
   exactas, el calendario del movil) sigue preguntandose a `android.js`.

   ¿QUIEN LO HACE? El aviso de fin de Foco, la pantalla encendida y la copia de
   «Tus datos»: cada funcion llama a la de su plataforma.

   `var`/`function` a proposito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

/* 'android' | 'ios' | null (la web). */
function pacePlataformaNativa() {
  try {
    if (typeof paceEsAndroid === 'function' && paceEsAndroid()) return 'android';
    if (typeof paceEsIos === 'function' && paceEsIos()) return 'ios';
  } catch (e) {}
  return null;
}

function paceEsNativo() {
  return pacePlataformaNativa() !== null;
}

/* Un complemento de Capacitor en la plataforma en la que se esta, o null. */
function paceNativoPlugin(nombre) {
  var p = pacePlataformaNativa();
  if (p === 'android') return paceAndroidPlugin(nombre);
  if (p === 'ios') return paceIosPlugin(nombre);
  return null;
}

/* --- Aviso de fin de Foco ------------------------------------------------- */

/* true si el aviso lo da el sistema (y no la Notification de la web). */
function paceNativoAvisos() {
  var p = pacePlataformaNativa();
  if (p === 'android') return paceAndroidAvisos();
  if (p === 'ios') return paceIosAvisos();
  return false;
}

/* 'granted' | 'denied' | 'default', lo mismo que Notification.permission. */
function paceNativoAvisoPermiso() {
  return pacePlataformaNativa() === 'ios' ? paceIosAvisoPermiso() : paceAndroidAvisoPermiso();
}

function paceNativoAvisoPedir() {
  return pacePlataformaNativa() === 'ios' ? paceIosAvisoPedir() : paceAndroidAvisoPedir();
}

/* Cuando acaba el bloque en marcha (ms) y con que textos avisar, o null. En la
   web no hace nada: alli avisa la propia pestaña. */
function paceNativoFoco(endsAt, textos) {
  var p = pacePlataformaNativa();
  if (p === 'android') paceAndroidFoco(endsAt, textos);
  else if (p === 'ios') paceIosFoco(endsAt, textos);
}

/* Lo que dira el aviso de fin, al programarlo con la app ya en el fondo: con «A tu ritmo», la
   pausa que viene detras del bloque (`fin`, que FocusTimer saca de `ritmoAvisoFin`) con las
   mismas palabras que el aviso de la web al acabar; sin el, o si falla, los de siempre. */
function paceNativoTextosFin(foco) {
  var r = null;
  try { r = foco && typeof foco.fin === 'function' ? foco.fin() : null; } catch (e) {}
  if (r && r.title) return { title: r.title, body: r.body || '' };
  return { title: (foco && foco.title) || 'PACE', body: (foco && foco.body) || '' };
}

/* La campana de fin del bloque que acababa en `fin`: `sonar` se llama si es de PACE, y no si
   el aviso del sistema ya sonó o va a sonar por ese bloque (android.avisos.js, ios.js). En la
   web suena siempre. */
function paceNativoCampana(fin, sonar) {
  var p = pacePlataformaNativa();
  if (p === 'android') { paceAndroidCampana(fin, sonar); return; }
  if (p === 'ios') { paceIosCampana(fin, sonar); return; }
  try { sonar(); } catch (e) {}
}

/* El último aviso que el sistema no dejó poner, o null. Ajustes lo cuenta. */
function paceNativoAvisoFallo() {
  var p = pacePlataformaNativa();
  if (p === 'android') return paceAndroidAvisoFallo();
  if (p === 'ios') return paceIosAvisoFallo();
  return null;
}

/* --- La copia de «Tus datos» y los enlaces -------------------------------- */

/* false en la web, donde toca la descarga de siempre. En el movil, una promesa con lo que pasó
   con la hoja de compartir: 'compartida', 'cancelada' o 'fallo' (android.js e ios.js). */
function paceNativoGuardarArchivo(nombre, texto, alAbrir) {
  var p = pacePlataformaNativa();
  if (p === 'android') return paceAndroidGuardarArchivo(nombre, texto, alAbrir);
  if (p === 'ios') return paceIosGuardarArchivo(nombre, texto, alAbrir);
  return false;
}

/* '/privacy' en la web; la pagina publicada en las dos apps, que el sistema
   abre en el navegador. */
function paceNativoEnlace(ruta) {
  return paceEsNativo() ? PACE_WEB_PUBLICA + ruta : ruta;
}

Object.assign(window, {
  pacePlataformaNativa, paceEsNativo, paceNativoPlugin, paceNativoAvisos, paceNativoAvisoPermiso,
  paceNativoAvisoPedir, paceNativoFoco, paceNativoTextosFin, paceNativoCampana, paceNativoAvisoFallo, paceNativoGuardarArchivo, paceNativoEnlace,
});
