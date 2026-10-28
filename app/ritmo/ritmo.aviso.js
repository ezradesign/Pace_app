/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   ritmo.aviso.js — LA PAUSA TE LLAMA POR SU NOMBRE (s198 · v0.133.0)
   ============================================================
   En la oficina PACE vive en una pestaña de fondo: cuando el bloque acaba, lo
   primero que se ve NO es la app sino el aviso del sistema, y hasta v0.132.0
   decia siempre «Foco completado · Ciclo cerrado. Elige tu micro-pausa.», con
   o sin un dia servido. Decision del usuario (D2, texto V1, mirando
   `docs/proposals/por-donde-seguir-s198.html`): con «A tu ritmo», el aviso dice
   QUE pausa toca y CUANDO vuelves.

     Tu pausa: Gemelos subrepticios · 1 min
     Bloque 1 de 9 hecho. El siguiente, a las 9:50.

   `ritmoAviso(s, t, tn, lang)` -> { title, body } o null (sin menu, o nada que
   nombrar: el aviso de siempre). PURA respecto al reloj: lee el plan del estado
   que recibe. Por eso FocusTimer la llama DESPUES de cerrar el bloque (cycle++)
   y de que `ritmoBloqueTerminado` recoloque el dia si se llego tarde: antes, el
   plan aun no sabe que el bloque termino.

   Las mismas reglas que ya cuenta la linea del dia, para que el aviso y la app
   digan lo mismo: la duracion de una pausa normal es la de su RUTINA (como
   «1 MIN · MUEVE» en la linea); la de la larga, la de la parada. La comida dice
   hasta cuando; el ultimo bloque, que el dia se cierra.

   `var`/`function` a proposito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

function ritmoAviso(s, t, tn, lang) {
  if (typeof ritmoPlan !== 'function' || typeof ritmoDetras !== 'function') return null;
  var p = ritmoPlan(s);
  if (!p || p.hechos < 1) return null;
  var it = ritmoDetras(p.m, p.m.focos[p.hechos - 1]);
  if (!it) return null;
  var sig = p.m.focos[p.hechos] || null;
  var hora = function (min) { return typeof ritmoHora === 'function' ? ritmoHora(min) : String(min); };
  var nombre = function (pl) {
    return typeof ritmoNombre === 'function' ? ritmoNombre(pl.rutina || pl, t, lang) : (pl.name || pl.id || '');
  };

  if (it.tipo === 'comida') {
    return {
      title: t('notify.ritmo.comida'),
      body: sig ? tn('notify.ritmo.comida.cuerpo', { hora: hora(sig.desde), n: p.hechos + 1 }) : '',
    };
  }

  /* Con el aro corto, el bloque va pegado al siguiente: el aviso dice cuándo es la pausa. */
  if (it.tipo === 'foco') {
    var pausa = p.m.items.slice(p.m.items.indexOf(it)).find(function (x) { return x.tipo === 'pausa' || x.tipo === 'comida' || x.tipo === 'cierre'; });
    return {
      title: tn('notify.ritmo.seguido', { n: p.hechos, total: p.total }),
      body: pausa ? tn('notify.ritmo.seguido.cuerpo', { hora: hora(pausa.desde) }) : '',
    };
  }

  var platos = it.platos || [];
  if (!platos.length) return null;
  var clave = it.larga ? 'notify.ritmo.larga' : (it.tipo === 'cierre' ? 'notify.ritmo.cierre' : 'notify.ritmo.titulo');
  return {
    title: tn(clave, { plato: platos.map(nombre).join(' + '), min: it.larga ? it.dur : platos[0].min }),
    body: sig
      ? tn('notify.ritmo.cuerpo', { n: p.hechos, total: p.total, hora: hora(sig.desde) })
      : tn('notify.ritmo.ultimo', { n: p.hechos, total: p.total }),
  };
}

/* EL AVISO FIJO CON EL MÓVIL BLOQUEADO (Ez, N4 A del 27 oct. 2026): mientras corre un Foco y
   PACE está en el fondo, Android enseña lo que queda, que cuenta solo (PaceAvisoFijo), con
   este título y este texto: el bloque, la hora a la que acaba y lo que viene detrás.
     Foco · bloque 2 de 9
     Hasta las 10:40. Luego, tu pausa: Gemelos subrepticios · 1 min
   Sin «A tu ritmo», «Foco · 25 min» y la hora. Se lee al irse al fondo, con el bloque aún sin
   cerrar: el que corre es `focos[hechos]`, y lo de detrás sigue las reglas de `ritmoAviso`
   (la duración de la rutina; la de la parada en la larga). */
function ritmoAvisoFijo(s, t, tn, lang, endsAt) {
  var d = new Date(endsAt);
  var hasta = tn('notify.fijo.hasta', { hora: ritmoHora(d.getHours() * 60 + d.getMinutes()) });
  var p = typeof ritmoAro === 'function' && ritmoAro(s, t, tn) && typeof ritmoPlan === 'function' ? ritmoPlan(s) : null;
  if (!p || !p.actual) return { titulo: tn('notify.fijo.titulo.manual', { min: (s && s.focusMinutes) || 25 }), texto: hasta };
  var titulo = tn('notify.fijo.titulo', { n: p.hechos + 1, total: p.total });
  var it = typeof ritmoDetras === 'function' ? ritmoDetras(p.m, p.actual) : null;
  var nombre = function (pl) {
    return typeof ritmoNombre === 'function' ? ritmoNombre(pl.rutina || pl, t, lang) : (pl.name || pl.id || '');
  };
  var luego;
  if (!it) luego = t('notify.fijo.ultimo');
  else if (it.tipo === 'comida') luego = t('notify.fijo.comida');
  else if (it.tipo === 'foco') luego = tn('notify.fijo.bloque', { n: p.hechos + 2 });
  else {
    var platos = it.platos || [];
    var clave = it.larga ? 'notify.fijo.larga' : (it.tipo === 'cierre' ? 'notify.fijo.cierre' : 'notify.fijo.pausa');
    luego = platos.length ? tn(clave, { plato: platos.map(nombre).join(' + '), min: it.larga ? it.dur : platos[0].min }) : '';
  }
  return { titulo: titulo, texto: luego ? hasta + ' ' + luego : hasta };
}

Object.assign(window, { ritmoAviso, ritmoAvisoFijo });
