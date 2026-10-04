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

Object.assign(window, { ritmoAviso });
