/* PACE · LOS TEXTOS LARGOS (pseudolocalización), SOLO PARA LAS PRUEBAS (17 nov. 2026)
 * ================================================================================
 * Un idioma de mentira para ver qué se rompe cuando un texto mide más de lo que se diseñó, antes de
 * que lo vea un tester en inglés. Cada texto de `app/i18n/` sale:
 *   · del más largo de sus dos idiomas (lo que mida más, el castellano o el inglés);
 *   · con las vocales con acento y alguna doblada, un 30 % más de letras;
 *   · entre «⟦» y «⟧»: un texto que se ve sin ellas no pasó por i18n (se queda sin traducir).
 * «Empezar foco» sale «⟦Émpéézáár fóócó⟧». Los huecos `{n}` no se tocan, y una lista por comas
 * («L,M,X,J,V,S,D», los meses) se alarga elemento a elemento, porque el código la parte por comas.
 *
 * NO LLEGA NUNCA A QUIEN USA PACE: vive aquí, en `tests/`, y entra en la página solo con
 * `instalarTextosLargos(context)`, que lo pone como init script de Playwright. La app no sabe que
 * existe; `npm run verify` (scripts/verify.pseudo.js) falla si `app/`, `index.html`, `sw.js` o lo
 * que se sube a la web nombran este archivo, sus marcas o su variable.
 *
 * CÓMO: `_bootstrap.js` hace `window.PACE_STRINGS = { es: {}, en: {} }` y los demás archivos de
 * i18n le añaden claves con `Object.assign`. Aquí `PACE_STRINGS` es una propiedad con setter: lo que
 * se le asigna se envuelve en un Proxy que devuelve la versión larga al LEER una clave, sea quien sea
 * quien lea (`useT`, los avisos de Android, el calendario). Lo escrito se guarda tal cual.
 */
'use strict';

/* Corre DENTRO de la página, antes que ningún script de la app. Sin dependencias de fuera. */
function textosLargosEnLaPagina(opciones) {
  var FACTOR = (opciones && opciones.factor) || 0.3;
  var ACENTO = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú',
    c: 'ç', C: 'Ç', n: 'ñ', N: 'Ñ', y: 'ý', Y: 'Ý' };
  var VOCAL = /[aeiouáéíóúAEIOUÁÉÍÓÚ]/;
  var LETRA = /\p{L}/u;

  function alargarTrozo(s) {
    var chars = Array.from(s);
    var letras = chars.filter(function (c) { return LETRA.test(c); }).length;
    var extra = Math.round(letras * FACTOR);
    var vocales = [];
    chars.forEach(function (c, i) { if (VOCAL.test(c)) vocales.push(i); });
    var dobles = {};
    if (extra && !vocales.length) chars.forEach(function (c, i) { if (LETRA.test(c)) vocales.push(i); });
    for (var k = 0; k < extra && vocales.length; k++) {
      var i = vocales[Math.floor((k + 0.5) * vocales.length / extra) % vocales.length];
      dobles[i] = (dobles[i] || 0) + 1;
    }
    return chars.map(function (c, i) {
      var a = ACENTO[c] || c;
      return a + (dobles[i] ? new Array(dobles[i] + 1).join(a.toLowerCase()) : '');
    }).join('');
  }

  function alargar(s) {
    if (!s || !/\p{L}/u.test(s)) return s;
    /* Una lista por comas sin espacios: cada elemento con sus marcas. */
    if (/^[^,\s{}]+(,[^,\s{}]+)+$/.test(s)) return s.split(',').map(alargar).join(',');
    var partes = s.split(/(\{[^}]*\})/);
    return '⟦' + partes.map(function (p, i) { return i % 2 ? p : alargarTrozo(p); }).join('') + '⟧';
  }

  /* LEGIBLE, SOLO PARA LAS FOTOS DE LAS PÁGINAS DE EZ (`{ legible: true }`): el texto del idioma de la
     app, alargado un 35 % con palabras de verdad al final («…, a tu ritmo», «ya»), sin acentos inventados
     ni marcas. Las letras inventadas le impedían juzgar las opciones (Ez, 17 nov.). No caza textos sin
     traducir: la prueba sigue con el modo de arriba. */
  var LARGAS = [', a tu ritmo', ' y sin prisa', ' durante la jornada', ', poco a poco', ' cada día'];
  var CORTAS = [' ya', ' hoy', ' aquí', ' ahora', ' juntos'];
  function alargarLegible(s) {
    if (!s || !/\p{L}/u.test(s)) return s;
    /* Las listas por comas («L,M,X», los meses) se quedan como están: el código las parte. */
    if (/^[^,\s{}]+(,[^,\s{}]+)+$/.test(s)) return s;
    var m = /([.!?…:]+)$/.exec(s), cuerpo = m ? s.slice(0, -m[1].length) : s, fin = m ? m[1] : '';
    var objetivo = Math.round(Array.from(s).length * 1.35), extra = '', n = 0;
    var largo = function () { return Array.from(cuerpo + extra + fin).length; };
    while (objetivo - largo() > 6) extra += LARGAS[n++ % LARGAS.length];
    var falta = objetivo - largo();
    if (falta > 0) extra += CORTAS.find(function (c) { return c.length >= falta; }) || CORTAS[CORTAS.length - 1];
    return cuerpo + extra + fin;
  }

  var crudo = null, envuelto = null, cache = {};
  function largoDe(clave, lang) {
    var es = crudo.es && crudo.es[clave], en = crudo.en && crudo.en[clave];
    if (opciones && opciones.legible) {
      var propio = lang === 'es' ? es : en;
      var kl = lang + '\u0000' + clave + '\u0000' + propio;
      if (!(kl in cache)) cache[kl] = alargarLegible(propio);
      return cache[kl];
    }
    var base = typeof es === 'string' && typeof en === 'string' ? (Array.from(es).length >= Array.from(en).length ? es : en)
      : (typeof en === 'string' ? en : es);
    var k = clave + '\u0000' + base;
    if (!(k in cache)) cache[k] = alargar(base);
    return cache[k];
  }
  function envolverIdioma(obj, lang) {
    return new Proxy(obj, {
      get: function (t, clave) {
        var v = t[clave];
        return typeof v === 'string' && typeof clave === 'string' ? largoDe(clave, lang) : v;
      },
    });
  }
  function envolver(v) {
    if (!v || typeof v !== 'object') return v;
    var idiomas = {};
    return new Proxy(v, {
      get: function (t, l) {
        var o = t[l];
        if (!o || typeof o !== 'object' || (l !== 'es' && l !== 'en')) return o;
        if (!idiomas[l] || idiomas[l].obj !== o) idiomas[l] = { obj: o, px: envolverIdioma(o, l) };
        return idiomas[l].px;
      },
    });
  }
  Object.defineProperty(window, 'PACE_STRINGS', {
    configurable: true,
    get: function () { return envuelto; },
    set: function (v) { crudo = v; envuelto = envolver(v); },
  });
  window.__paceTextosLargos = { alargar: alargar, alargarLegible: alargarLegible };
}

/** Pone los textos largos en cada página del contexto. */
async function instalarTextosLargos(context, opciones) {
  await context.addInitScript(textosLargosEnLaPagina, opciones || {});
}

module.exports = { instalarTextosLargos, textosLargosEnLaPagina };
