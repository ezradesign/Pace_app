/* PACE · Alias de identidad visual (visualId) · B2.2 · s110
   Colapsa duplicados de NOMBRE en UNA identidad visual/de ficha, SIN tocar
   `step.name` ni localStorage (swap s14 blindado; el ES sigue resolviendo).

   El nombre canónico ES sigue siendo la clave de datos. `visualId` es solo
   la identidad COMPARTIDA para el glifo (y, en B2.2b, la ficha de ejecución
   y la duración derivada). El valor de cada alias es el nombre que ABSORBE
   (el que conserva el glifo canónico).

   Duplicados unificados (auditoría B2.1 §4.2). Rib pull ↔ Gato-camello queda
   SEPARADO a propósito: es un caso «reescribir», no un duplicado visual
   limpio (su reescritura de cue va a la ola de contenido). */
var VISUAL_ALIAS = {
  'Chest opener':       'Apertura de pecho',
  'Deep squat hold':    'Squat profundo',
  'Deep breaths':       'Reset respiración',
  'Dead hang · opcional': 'Hang pasivo',
};

/* resolveVisualId(name) → identidad visual canónica (o el propio nombre). */
function resolveVisualId(name) {
  return VISUAL_ALIAS[name] || name;
}

window.VISUAL_ALIAS = VISUAL_ALIAS;
window.resolveVisualId = resolveVisualId;
