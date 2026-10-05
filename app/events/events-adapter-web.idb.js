/* PACE · events-adapter-web.idb.js
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   EL ALMACEN FISICO del adaptador web (s200): IndexedDB. Carga ANTES de
   `events-adapter-web.js`, que es quien lo usa; nadie mas debe hablar con esto.

   POR QUE NO `localStorage` (s200, medido): con dos pestanas emitiendo a la vez
   el almacen guardaba 10 de 20 eventos. Web Locks serializaba de verdad, pero
   Chromium propaga `localStorage` entre procesos de forma ASINCRONA: la pestana
   que entraba al lock podia leer una copia anterior a la escritura de la otra y
   pisar su lote. IndexedDB tiene un unico backend por origen y una lectura que
   empieza despues de que otra transaccion haya CONFIRMADO la ve siempre. El
   lock sigue mandando; lo que cambia es que releer dentro de el ya es releer.

   QUE SE GUARDA: la MISMA cadena JSON que antes iba a `localStorage`, en un
   unico registro. Asi el presupuesto, la comparacion byte a byte y el formato
   del contenedor no cambian: cambia el cajon, no lo que hay dentro.

   EL ESPEJO. IndexedDB solo es asincrono y la UI lee al pintar (la tarjeta de
   la barra lateral, el «llevas N» de la vista previa, el export de «Tus datos»).
   Esas lecturas van a una copia en memoria que se actualiza con cada lectura
   fresca: al arrancar, despues de cada escritura de esta pestana y al volver a
   la pestana. Es SOLO lectura para pintar; toda read-modify-write relee del
   almacen dentro del lock y nunca parte del espejo.

   MIGRACION, UNA VEZ: si el almacen esta vacio y `localStorage` tiene el
   contenedor de antes, se copia la cadena tal cual, se relee, y SOLO si la
   relectura es identica se borra la clave vieja. Si algo falla a medias, la
   clave vieja sigue ahi y el siguiente arranque lo reintenta.

   NADA DE ESTO SALE DEL DISPOSITIVO: IndexedDB es almacenamiento local del
   propio navegador, igual que lo era `localStorage`. */

const EVENTS_IDB_NAME = 'pace.events';
const EVENTS_IDB_STORE = 'contenedor';
const EVENTS_IDB_VERSION = 1;
/* La clave del registro es la misma que tenia en `localStorage`. */
const EVENTS_IDB_RECORD = 'pace.events.v1';
const EVENTS_LEGACY_LS_KEY = 'pace.events.v1';

let _eventsIdbOpen = null;      // Promise<IDBDatabase>
let _eventsIdbFailed = false;   // el navegador no pudo abrirlo
/* Espejo: la ultima cadena leida del almacen (`null` = no hay contenedor). */
let _eventsWebMirrorRaw = null;

function eventsIdbExists() {
  try {
    return typeof indexedDB !== 'undefined' && !!indexedDB && !_eventsIdbFailed;
  } catch (e) {
    return false;
  }
}

/* Abre (una vez) la base. Si el navegador la bloquea (modo restringido) se
   anota y el adaptador cae a UNAVAILABLE, como cuando `localStorage` lanzaba. */
function eventsIdbOpen() {
  if (_eventsIdbOpen) return _eventsIdbOpen;
  if (!eventsIdbExists()) return Promise.reject(new Error('indexedDB no disponible'));
  _eventsIdbOpen = new Promise(function (resolve, reject) {
    let req;
    try {
      req = indexedDB.open(EVENTS_IDB_NAME, EVENTS_IDB_VERSION);
    } catch (e) {
      reject(e);
      return;
    }
    req.onupgradeneeded = function () {
      const db = req.result;
      if (!db.objectStoreNames.contains(EVENTS_IDB_STORE)) db.createObjectStore(EVENTS_IDB_STORE);
    };
    req.onsuccess = function () {
      const db = req.result;
      /* Una version futura de PACE que suba el esquema de la BASE no se queda
         esperando a esta pestana: se cierra y se vuelve a abrir al recargar. */
      db.onversionchange = function () { try { db.close(); } catch (e) {} _eventsIdbOpen = null; };
      resolve(db);
    };
    req.onerror = function () { reject(req.error || new Error('indexedDB open')); };
    req.onblocked = function () { reject(new Error('indexedDB bloqueado')); };
  }).catch(function (e) {
    _eventsIdbFailed = true;
    _eventsIdbOpen = null;
    throw e;
  });
  return _eventsIdbOpen;
}

/* Pone el espejo y, si cambio, lo AVISA con un evento del propio documento
   (`pace:eventos`) para que lo que pinta con el se repinte. No sale de la
   pagina: es un aviso entre modulos, no un canal. */
function eventsWebSetMirror(raw) {
  if (raw === _eventsWebMirrorRaw) return;
  _eventsWebMirrorRaw = raw;
  try { window.dispatchEvent(new Event('pace:eventos')); } catch (e) {}
}

/* Cadena cruda del contenedor, LEIDA DEL ALMACEN (no del espejo), o `null`.
   Actualiza el espejo. Rechaza si el almacen no se puede leer. */
function eventsWebReadRaw() {
  return eventsIdbOpen().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(EVENTS_IDB_STORE, 'readonly');
      const req = tx.objectStore(EVENTS_IDB_STORE).get(EVENTS_IDB_RECORD);
      req.onsuccess = function () {
        const v = req.result;
        const raw = (v === undefined || v === null) ? null : String(v);
        eventsWebSetMirror(raw);
        resolve(raw);
      };
      req.onerror = function () { reject(req.error || new Error('indexedDB get')); };
    });
  });
}

/* Escribe la cadena ENTERA en una transaccion: o entra completa o no cambia
   nada (la misma garantia que daba `setItem` de una clave). Resuelve `true`
   solo cuando la transaccion CONFIRMA; `false` ante cuota, aborto o error. No
   pide el lock: quien la llama ya lo tiene (o es la migracion, que tambien). */
function eventsWebWriteRaw(raw) {
  return eventsIdbOpen().then(function (db) {
    return new Promise(function (resolve) {
      let tx;
      try {
        tx = db.transaction(EVENTS_IDB_STORE, 'readwrite');
        tx.objectStore(EVENTS_IDB_STORE).put(String(raw), EVENTS_IDB_RECORD);
      } catch (e) {
        resolve(false);
        return;
      }
      tx.oncomplete = function () { eventsWebSetMirror(String(raw)); resolve(true); };
      tx.onerror = function () { resolve(false); };
      tx.onabort = function () { resolve(false); };
    });
  }, function () { return false; });
}

/* Lectura SINCRONA para pintar: el espejo. Devuelve la cadena o `null`. */
function eventsWebMirror() {
  return _eventsWebMirrorRaw;
}

/* Refresca el espejo desde el almacen. Nunca rechaza. */
function eventsWebRefresh() {
  return eventsWebReadRaw().then(function () { return true; }, function () { return false; });
}

/* Migracion UNICA desde `localStorage` (s200). Se llama DENTRO del lock.
   Devuelve una promesa que nunca rechaza. */
function eventsWebMigrateFromLocalStorage() {
  let viejo = null;
  try { viejo = localStorage.getItem(EVENTS_LEGACY_LS_KEY); } catch (e) { viejo = null; }
  if (viejo === null || viejo === undefined) return Promise.resolve('nada');
  return eventsWebReadRaw().then(function (actual) {
    if (actual !== null) {
      /* Ya migrado. Si la copia vieja es IDENTICA (un borrado que no llego a
         hacerse), se quita; si es distinta, no se toca: borrar algo que no se
         ha copiado es justo lo que esta migracion promete no hacer. */
      if (actual === viejo) {
        try { localStorage.removeItem(EVENTS_LEGACY_LS_KEY); } catch (e) {}
      }
      return 'ya';
    }
    return eventsWebWriteRaw(viejo).then(function (ok) {
      if (!ok) return 'fallo';
      return eventsWebReadRaw().then(function (copia) {
        if (copia !== viejo) return 'fallo';
        try { localStorage.removeItem(EVENTS_LEGACY_LS_KEY); } catch (e) {}
        return 'migrado';
      });
    });
  }).catch(function () { return 'fallo'; });
}

/* Sin Web Locks no se escribe ni se migra, pero se puede LEER: si el almacen
   esta vacio, el espejo toma la copia de `localStorage` que todavia no se ha
   migrado, para que el export y la tarjeta sigan diciendo la verdad. */
function eventsWebLoadReadOnly() {
  return eventsWebReadRaw().then(function (raw) {
    if (raw !== null) return true;
    try { eventsWebSetMirror(localStorage.getItem(EVENTS_LEGACY_LS_KEY)); } catch (e) {}
    return true;
  }, function () { return false; });
}

/* Al volver a la pestana, el espejo se pone al dia con lo que haya escrito la
   otra. Es una LECTURA para pintar, no exclusion: la exclusion es el lock. */
try {
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && _eventsIdbOpen) eventsWebRefresh();
    });
  }
} catch (e) { /* sin documento no hay nada que refrescar */ }

Object.assign(window, {
  EVENTS_IDB_NAME, EVENTS_IDB_STORE, EVENTS_IDB_RECORD,
  eventsIdbExists, eventsIdbOpen, eventsWebReadRaw, eventsWebWriteRaw,
  eventsWebMirror, eventsWebSetMirror, eventsWebRefresh, eventsWebMigrateFromLocalStorage, eventsWebLoadReadOnly,
});
