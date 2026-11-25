/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   nativo.atajos.js — LOS ATAJOS DEL ICONO EN LAS APPS (Ez, L7A del 25 nov. 2026)
   ============================================================
   Al mantener pulsado el icono de PACE salen Foco, Respira, Estira e Hidrátate, como en la web
   instalada (manifest.webmanifest, ?go=). Android los declara en res/xml/shortcuts.xml y el iPhone
   en Info.plist (SceneDelegate.swift los traduce). Los dos abren PACE con `pace://go/<tipo>`, que el
   complemento App de Capacitor da a la web como `appUrlOpen` y GUARDA hasta que alguien escucha: así
   también llega el de un arranque en frío, aunque la web monte después. No se usa `getLaunchUrl`,
   que tras «Volver a empezar» (una recarga) devolvería el mismo atajo y lo abriría otra vez.
   Lo que se abre es lo mismo que con ?go= (`usePaceIrA`, main/main.atajos.jsx): ningún atajo empieza
   una sesión solo.

   `var`/`function` a proposito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

var PACE_ATAJOS = ['focus', 'breathe', 'move', 'stretch', 'hydrate'];

/* 'pace://go/breathe' → 'breathe'; cualquier otra cosa, null. */
function paceAtajoDeUrl(url) {
  var m = /^pace:\/\/go\/([a-z]+)\/?$/.exec(String(url || ''));
  return m && PACE_ATAJOS.indexOf(m[1]) !== -1 ? m[1] : null;
}

/* Escucha los atajos y llama a `irA(tipo)`. Devuelve con qué dejar de escuchar. Fuera de las apps
   no hace nada. */
function paceNativoAtajos(irA) {
  var app = typeof paceNativoPlugin === 'function' ? paceNativoPlugin('App') : null;
  if (!app || typeof app.addListener !== 'function') return function () {};
  var asa = null, fuera = false;
  try {
    var r = app.addListener('appUrlOpen', function (d) {
      var tipo = paceAtajoDeUrl(d && d.url);
      if (tipo) { try { irA(tipo); } catch (e) {} }
    });
    /* Capacitor da el asa directamente o en una promesa, según la versión. */
    if (r && typeof r.then === 'function') r.then(function (a) { if (fuera) { try { a.remove(); } catch (e) {} } else asa = a; }, function () {});
    else asa = r;
  } catch (e) {}
  return function () { fuera = true; try { if (asa && asa.remove) asa.remove(); } catch (e) {} };
}

Object.assign(window, { paceAtajoDeUrl, paceNativoAtajos });
