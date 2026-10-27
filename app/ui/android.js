/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   android.js — LO QUE EL WEBVIEW DE ANDROID NO TRAE
   ============================================================
   En Android la app es esta misma web dentro del WebView de Capacitor. Ese
   WebView no tiene Wake Lock ni la API de avisos, no descarga archivos y el
   boton atras del movil no es suyo. Capacitor lo da con complementos nativos
   que el lado nativo inyecta en `window.Capacitor.Plugins` (sin bundler: aqui
   no se importa nada). Este archivo, con android.avisos.js y
   android.calendario.js, son los UNICOS que les hablan: quien necesita uno
   pide `paceAndroidPlugin('Nombre')`, y si recibe null sigue por el camino web. En la web, en el standalone y en las pruebas sin Capacitor nada
   de esto existe.

   EL BOTON ATRAS hace lo mismo que Escape, que casi todo PACE ya escucha:
   cierra lo que este encima (un dialogo, Ajustes, el menu de pausa, una
   sesion). Se manda esa misma tecla en vez de enseñar a cada capa un evento
   nuevo; todas las capas llevan `role="dialog"`. Si no hay ninguna abierta, la
   app se va al fondo como cualquier otra de Android, sin cerrarse: el
   Pomodoro sigue contando por reloj real.

   EL AVISO DE FIN DE FOCO vive en android.avisos.js: lo programa Android para
   la hora del final mientras la app esta en el fondo, en fila y solo cuando
   Android confirma.

   LA COPIA DE «TUS DATOS» se escribe en la cache de la app y se abre el menu de
   compartir de Android, desde el que se guarda en Drive o en Archivos, o se
   manda por correo.

   EL CALENDARIO DEL MOVIL vive en android.calendario.js: las llamadas al
   complemento CapacitorCalendar, cada una reducida a lo que PACE usa, y lo
   privado, que pone PaceCalendario.

   LAS FRANJAS DE ARRIBA Y DE ABAJO (la hora y la bateria, y Atras) son de
   Android: las pinta el tema, que sigue el modo del movil. El complemento
   PaceBarras (MainActivity) las pinta con el papel de la paleta que se le
   diga, y aqui se le dice la que se ve cada vez que cambia: en Ajustes, con
   «Auto» al cambiar el movil, y al acabar el bloque que tenia ese cambio en
   espera.

   LOS ENLACES LEGALES son rutas del servidor en la web (/privacy, /safety). En
   el APK no hay servidor y abrirlas recargaba la app: van a la web publicada,
   que Android abre en el navegador.

   `var`/`function` a proposito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

var PACE_WEB_PUBLICA = 'https://pacegrass.app';
/* Las veces que se pulsó Atrás, para las pruebas (paceAndroidEstado, android.avisos.js). */
var _paceAndroid = { atras: 0 };

function paceEsAndroid() {
  try {
    var cap = window.Capacitor;
    return !!(cap && typeof cap.getPlatform === 'function' && cap.getPlatform() === 'android');
  } catch (e) { return false; }
}

function paceAndroidPlugin(nombre) {
  try {
    if (!paceEsAndroid()) return null;
    var lista = window.Capacitor.Plugins;
    return (lista && lista[nombre]) || null;
  } catch (e) { return null; }
}

/* Una llamada nativa que nunca rompe: sin complemento, o si falla, da null. Para
   lo que da igual si salió (minimizar, las franjas, los permisos que se miran). */
function paceAndroidLlamar(nombre, metodo, opciones) {
  return paceAndroidPedir(nombre, metodo, opciones).catch(function () { return null; });
}

/* La misma llamada, pero el error llega a quien pregunta: sin complemento da null,
   y si Android falla, la promesa se rechaza. Para lo que hay que saber si salió: un
   aviso puesto o quitado, una lista del calendario que no se pudo leer (con null se
   leía vacía y PACE volvía a crear lo que ya estaba). */
function paceAndroidPedir(nombre, metodo, opciones) {
  try {
    var p = paceAndroidPlugin(nombre);
    if (!p || typeof p[metodo] !== 'function') return Promise.resolve(null);
    return Promise.resolve(p[metodo](opciones));
  } catch (e) { return Promise.reject(e); }
}

/* --- Boton atras ---------------------------------------------------------- */

function paceAndroidAtras() {
  try {
    _paceAndroid.atras++;
    if (document.querySelector('[role="dialog"]')) {
      /* Desde el elemento con el foco, como una tecla de verdad: asi pasa por
         los manejadores de React del dialogo y luego por los de document. */
      var activo = document.activeElement;
      var destino = (activo && activo !== document.body && document.documentElement.contains(activo)) ? activo : document;
      var tecla = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true });
      /* Marcado como Atrás: la bienvenida no se cierra con Escape (se perdería para siempre),
         pero con Atrás vuelve un paso y, en su primera pantalla, pide irse al fondo. */
      tecla.paceAtras = true;
      destino.dispatchEvent(tecla);
      if (tecla.paceAlFondo) { paceAndroidLlamar('App', 'minimizeApp'); return 'fondo'; }
      return 'escape';
    }
    paceAndroidLlamar('App', 'minimizeApp');
    return 'fondo';
  } catch (e) { return null; }
}

/* --- La copia de «Tus datos» y los enlaces -------------------------------- */

/* false si no hay Android y toca la descarga de la web. Si lo hay, una promesa con lo que
   pasó: 'compartida' (se eligió dónde mandarla), 'cancelada' (se cerró el menú sin elegir) o
   'fallo' (no se escribió el archivo o no se abrió el menú). `alAbrir` se llama con el archivo
   ya escrito, al abrirse el menú. Antes devolvía true en cuanto había complementos y lo de
   después se perdía: Ajustes daba la copia por hecha, con su logro, aunque no hubiera archivo
   (auditoría del 21 oct.). `paceAndroidLlamar` no sirve aquí: se traga el rechazo. */
function paceAndroidGuardarArchivo(nombre, texto, alAbrir) {
  var fs = paceAndroidPlugin('Filesystem'), menu = paceAndroidPlugin('Share');
  if (!fs || !menu || typeof fs.writeFile !== 'function' || typeof menu.share !== 'function') return false;
  return Promise.resolve()
    .then(function () { return fs.writeFile({ path: nombre, data: texto, directory: 'CACHE', encoding: 'utf8' }); })
    .then(function (r) {
      if (!r || !r.uri) return 'fallo';
      try { if (typeof alAbrir === 'function') alAbrir(); } catch (e) {}
      return Promise.resolve(menu.share({ title: nombre, files: [r.uri] })).then(
        function () { return 'compartida'; },
        function (e) { return /cancel/i.test(String((e && e.message) || e)) ? 'cancelada' : 'fallo'; });
    })
    .catch(function () { return 'fallo'; });
}

/* '/privacy' en la web; la pagina publicada en Android. */
function paceEnlaceWeb(ruta) {
  return paceEsAndroid() ? PACE_WEB_PUBLICA + ruta : ruta;
}

/* --- Las franjas del sistema --------------------------------------------- */

/* `palette` es la que se ve: con un bloque vivo, Auto deja el cambio en espera
   sin tocarla. `auto` es para el arranque siguiente, que se pinta antes de que
   hable la web: en Auto manda el modo del movil, que es lo que Auto elegira. */
var _paceBarras = null;
function paceAndroidBarras(estado) {
  try {
    if (!estado || (estado.palette !== 'crema' && estado.palette !== 'oscuro')) return;
    var auto = !!estado.paletteAuto;
    if (_paceBarras && _paceBarras.paleta === estado.palette && _paceBarras.auto === auto) return;
    if (!paceAndroidPlugin('PaceBarras')) return;
    _paceBarras = { paleta: estado.palette, auto: auto };
    paceAndroidLlamar('PaceBarras', 'pintar', { paleta: estado.palette, auto: auto });
  } catch (e) {}
}

function paceAndroidArrancar() {
  if (!paceEsAndroid()) return;
  var app = paceAndroidPlugin('App');
  if (app && typeof app.addListener === 'function') {
    try { app.addListener('backButton', function () { paceAndroidAtras(); }); } catch (e) {}
  }
  /* El estado ya esta cargado (state.jsx va antes que ui/): la paleta del
     arranque se pinta ya, y las siguientes, al cambiar. */
  try {
    paceAndroidBarras(getState());
    subscribe(function () { paceAndroidBarras(getState()); });
  } catch (e) {}
}

try { paceAndroidArrancar(); } catch (e) {}

Object.assign(window, {
  paceEsAndroid, paceAndroidPlugin, paceAndroidLlamar, paceAndroidPedir, paceAndroidAtras, paceAndroidGuardarArchivo,
  paceEnlaceWeb, paceAndroidBarras,
});
