/* PACE · LA RAÍZ CON DOS CARAS (opción C, Ez, 9 nov. 2026)
   ==========================================================
   La misma dirección enseña la app a quien ya la usa y la landing a quien llega nuevo. Se
   decide aquí, en el <head> de index.html y antes de pintar nada: sin redirigir, sin saltos.
   El build (paso 9 de build-standalone.js) lo mete solo en index.html, entre las marcas
   `pace-landing`; `android-www.js` lo quita al copiar a www/, así que en Android y en iPhone
   no existe y la app monta como siempre.

   VE LA APP: Android e iPhone; quien llega con `#codigo=` o `?go=`; quien abre desde el icono
   instalado; quien ya la vio alguna vez (la marca `pace-cara`); quien tiene algo guardado de la
   app (cualquier clave `pace.*` que no sea de las páginas sueltas). ANTE CUALQUIER ERROR, LA APP:
   nunca se le esconde a quien ya la usa.

   LA MARCA LLEVA GUION Y NO PUNTO a propósito: «Borrar todo» barre las claves `pace.*`
   (wipeLocalState, state-core.jsx) y quien borra sus datos sigue usando PACE.

   Con la landing delante, la app no monta ni abre su base de eventos hasta «Abrir PACE»:
   quien solo mira la landing no se lleva nada guardado. Lo aplazado pasa por `paceCuandoAbra`. */
(function () {
  var raiz = document.documentElement;
  var MARCA = 'pace-cara';
  /* Las páginas sueltas guardan su idioma con `pace.`: no son de la app. */
  var AJENAS = { 'pace.premium.lang': 1, 'pace.beta.lang': 1, 'pace.landing.lang': 1 };

  function decidir() {
    if (window.Capacitor || location.protocol === 'capacitor:') return 'app';
    if (/(^#|[#&])codigo=/.test(location.hash)) return 'app';
    if (/[?&]go=/.test(location.search)) return 'app';
    /* Sin soporte de display-mode, `browser` no casa y sale la app: se yerra hacia la app. */
    if (!window.matchMedia || !window.matchMedia('(display-mode: browser)').matches) return 'app';
    if (navigator.standalone === true) return 'app';
    var ls = window.localStorage;
    if (ls.getItem(MARCA)) return 'app';
    for (var i = 0; i < ls.length; i++) {
      var k = ls.key(i);
      if (k && k.indexOf('pace.') === 0 && !AJENAS[k]) return 'app';
    }
    return 'landing';
  }

  var cara = 'app';
  try { cara = decidir(); } catch (e) { cara = 'app'; }

  function idiomaLanding() {
    try {
      var m = location.search.match(/[?&]lang=(es|en)\b/);
      if (m) return m[1];
      var g = localStorage.getItem('pace.landing.lang');
      if (g === 'es' || g === 'en') return g;
    } catch (e) {}
    return /^es\b/i.test(navigator.language || '') ? 'es' : 'en';
  }

  function ponerIdioma(idioma) {
    raiz.setAttribute('data-pace-landing-idioma', idioma);
    raiz.lang = idioma;
    document.title = idioma === 'en'
      ? 'PACE · Active breaks for people who work at a desk'
      : 'PACE · Pausas activas para quien trabaja sentado';
  }

  var pendientes = [];
  var tituloApp = document.title;
  window.PACE_CARA = cara;
  raiz.setAttribute('data-pace-cara', cara);
  if (cara === 'app') {
    try { localStorage.setItem(MARCA, 'app'); } catch (e) {}
  } else {
    var idioma = idiomaLanding();
    ponerIdioma(idiomaLanding());
    /* La app pone su título al cargar sus módulos (applyTheme, state-core.palette.jsx). */
    document.addEventListener('DOMContentLoaded', function () {
      if (window.PACE_CARA === 'landing') ponerIdioma(raiz.getAttribute('data-pace-landing-idioma'));
    });
  }

  /* Lo que la app hace al arrancar (montar, abrir la base de eventos) pasa por aquí. */
  function paceCuandoAbra(fn) {
    if (window.PACE_CARA !== 'landing') fn(); else pendientes.push(fn);
  }

  /* «Abrir PACE»: la app en el sitio, sin recargar. */
  function paceAbrirApp() {
    if (window.PACE_CARA !== 'landing') return;
    try { localStorage.setItem(MARCA, 'app'); } catch (e) {}
    window.PACE_CARA = 'app';
    raiz.setAttribute('data-pace-cara', 'app');
    raiz.removeAttribute('data-pace-landing-idioma');
    raiz.lang = 'es';
    document.title = tituloApp;
    try { window.scrollTo(0, 0); } catch (e) {}
    var cola = pendientes; pendientes = [];
    for (var i = 0; i < cola.length; i++) { try { cola[i](); } catch (e) { setTimeout(function () { throw e; }); } }
  }

  window.paceCuandoAbra = paceCuandoAbra;
  window.paceAbrirApp = paceAbrirApp;
  if (cara !== 'landing') return;

  /* Clics de la landing por delegación: el marcado llega después de este script. */
  document.addEventListener('click', function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest('[data-pace-abrir], [data-pace-landing-idioma-boton]') : null;
    if (!t || window.PACE_CARA !== 'landing') return;
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button > 0) return;
    ev.preventDefault();
    if (t.hasAttribute('data-pace-abrir')) { paceAbrirApp(); return; }
    var otro = raiz.getAttribute('data-pace-landing-idioma') === 'en' ? 'es' : 'en';
    try { localStorage.setItem('pace.landing.lang', otro); } catch (e) {}
    ponerIdioma(otro);
  });

  /* LA RED DE LOS EVENTOS: quien tiene eventos y no `localStorage` (caso raro) ve la app.
     Es asíncrono, así que va después de pintar; no crea la base si no existe. */
  try {
    if (!window.indexedDB || typeof indexedDB.databases !== 'function') return;
    indexedDB.databases().then(function (lista) {
      var hay = false;
      for (var i = 0; i < lista.length; i++) if (lista[i] && lista[i].name === 'pace.events') hay = true;
      if (!hay) return;
      var pet = indexedDB.open('pace.events');
      pet.onsuccess = function () {
        var db = pet.result;
        try {
          if (!db.objectStoreNames.contains('contenedor')) { db.close(); return; }
          var get = db.transaction('contenedor', 'readonly').objectStore('contenedor').get('pace.events.v1');
          get.onsuccess = function () {
            db.close();
            var c = null;
            try { c = typeof get.result === 'string' ? JSON.parse(get.result) : get.result; } catch (e) { c = { events: [1] }; }
            if (c && c.events && c.events.length) paceAbrirApp();
          };
          get.onerror = function () { db.close(); };
        } catch (e) { try { db.close(); } catch (e2) {} }
      };
    }, function () {});
  } catch (e) {}
})();
