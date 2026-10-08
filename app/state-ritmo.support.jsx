/* PACE · A tu ritmo · TU SEMANA TIPO
   ==================================
   Se contesta una vez —en la bienvenida o en Ajustes— y desde entonces cada mañana la
   tarjeta del día llega ya contestada con lo de ese día («Jornada entera, como cada
   martes»). Lo eligió Ez para todos, no solo para quien pague (7 de octubre de 2026).

     ritmo.semanaTipo   ausente  → nunca se preguntó (instalaciones de antes): como siempre
                        null     → «Cada semana es distinta»: como siempre
                        [7]      → lunes primero, cada día 'jornada' | 'media' | 'libre'
     ritmo.distinto     'YYYY-MM-DD' → hoy no se propone lo de siempre (caduca con la fecha,
                        como `libre`). Lo escriben «Hoy es distinto», «Cambiar» y volver
                        de «por libre» (state-ritmo.jsx).

   LAS HORAS SON LAS DE SIEMPRE (`ritmo.horario`): la jornada usa inicio, salida y comida, y
   la media sus propias horas (`horario.media`). No hay horas por día.

   EL DÍA CONTESTADO SE DERIVA AL PINTAR (ritmoDe), no se escribe: así nada hay que hacer
   en el relevo de día, y quitar la semana deja la app exactamente como estaba.

   Un valor que no se conoce (de una versión más nueva) se lee como «sin propuesta» ese
   día y NO se reescribe: normalizar al guardar sería un borrado diferido. */

var RITMO_TIPOS_DIA = ['jornada', 'media', 'libre'];
var RITMO_SEMANA_DEFECTO = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];

/* Lo que se lee: siete días o null. */
function ritmoSemanaTipoDe(v) {
  if (!Array.isArray(v) || v.length !== 7) return null;
  return v.map(function (x) { return RITMO_TIPOS_DIA.indexOf(x) !== -1 ? x : null; });
}

/* El toque en un día: jornada → media → libre → jornada. */
function ritmoTipoSiguiente(t) {
  var i = RITMO_TIPOS_DIA.indexOf(t);
  return RITMO_TIPOS_DIA[(i + 1) % RITMO_TIPOS_DIA.length];
}

/* Un horario normalizado con las horas que la persona ha tocado en un borrador
   (`{ inicio: 600, 'media.salida': 780 }`). `crudo` es el horario GUARDADO: si nunca se
   tocó la media, la media sigue a la entrada nueva (ritmoMedia); tocar una hora de la
   media fija las dos, como en ritmoHorario. */
function ritmoHorarioCon(h, cambios, crudo) {
  var out = Object.assign({}, h);
  var media = {};
  Object.keys(cambios || {}).forEach(function (campo) {
    var v = Number(cambios[campo]);
    if (campo.indexOf('media.') === 0) media[campo.slice(6)] = v;
    else out[campo] = v;
  });
  out.media = Object.assign({}, ritmoMedia(Object.assign({}, out, { media: crudo && crudo.media })), media);
  return out;
}

/* Guardar la semana: `tipo` = siete días, o null («Cada semana es distinta»). `cambios`
   = solo las horas tocadas, que se escriben sobre el horario GUARDADO (no sobre el
   normalizado): así `horario: null` sigue queriendo decir «sin tocar» y la hora de comer
   por región se conserva. Las horas cambian el día servido, como en ritmoHorario. */
function ritmoGuardarSemana(tipo, cambios) {
  var tocadas = Object.keys(cambios || {});
  ritmoGuardar(function (r) {
    var c = { semanaTipo: Array.isArray(tipo) ? tipo.slice(0, 7) : null };
    if (tocadas.length) {
      var R = ritmoDe(getState());
      var h = Object.assign({}, r.horario || {});
      tocadas.forEach(function (campo) { if (campo.indexOf('media.') !== 0) h[campo] = Number(cambios[campo]); });
      if (tocadas.some(function (campo) { return campo.indexOf('media.') === 0; })) {
        h.media = ritmoHorarioCon(R.horario, cambios, r.horario).media;
      }
      c.horario = h;
      if (r.dia) c.dia = Object.assign({}, r.dia, { cambios: {} });
    }
    return c;
  });
  if (tocadas.length) ritmoSincronizar();
}

/* El día ya contestado de hoy, o null: sin semana, ya hiciste algo hoy, es tu día
   libre, o ya no queda jornada (un martes a las 20:00 vuelve la pregunta de siempre,
   con sus «fuera de hora»). */
function ritmoHabitual(s) {
  var R = ritmoDe(s);
  if (!R.propuesta) return null;
  var m = ritmoMenu(s, R.propuesta, null, null);
  if (!m || !m.focos || !m.focos.length) return null;
  return { opcion: R.propuesta, diaSemana: R.diaSemana, m: m, horario: R.horario };
}

function ritmoComenzarHabitual() {
  var h = ritmoHabitual(getState());
  if (h) ritmoElegir(h.opcion);
}

function ritmoDistinto() { ritmoPreguntar(); }

/* El nombre del día de hoy en minúsculas («martes»), del reloj de la app. */
function ritmoNombreDia(diaSemana, t) {
  var lista = String(t('ritmo.dias')).split(',');
  return lista[(diaSemana || 1) - 1] || '';
}

/* El relevo de día al volver a la app (Android trae el WebView del fondo sin recargar y una
   pestaña puede pasar la noche abierta) lo hace app/state-core.dia.js para toda la app, y
   desde lo guardado: la tarjeta enseña el día de HOY sin que haga falta nada aquí. */

Object.assign(window, {
  RITMO_TIPOS_DIA, RITMO_SEMANA_DEFECTO, ritmoSemanaTipoDe, ritmoTipoSiguiente, ritmoHorarioCon,
  ritmoGuardarSemana, ritmoHabitual, ritmoComenzarHabitual, ritmoDistinto, ritmoNombreDia,
});
