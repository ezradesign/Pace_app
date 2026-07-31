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
  'Dead hang · opcional': 'Suspensión pasiva',

  /* OLA A de la Fase 2 (s141) — nombres RETIRADOS del inglés. Estas entradas no
     son cosmética: el constructor COPIA el nombre del ejercicio dentro de la
     rutina propia que se guarda en `localStorage` (`state-custom.jsx`), así que
     una rutina creada antes del renombrado sigue pidiendo el nombre viejo. Sin
     alias perdería su glifo en silencio, que es justo lo que prohíbe s108.
     Al dibujar los glifos que faltan (ola B), estas rutinas antiguas los heredan
     solas. NO borrar: mientras exista una instalación con datos previos, hacen
     falta. */
  'Hang pasivo':        'Suspensión pasiva',
  'Hang activo':        'Suspensión activa',
  'Hollow hold':        'Hueco abdominal',
  'Seated hollow':      'Hueco en silla',
  'Couch stretch':      'Cuádriceps en pared',
};

/* resolveVisualId(name) → identidad visual canónica (o el propio nombre). */
function resolveVisualId(name) {
  return VISUAL_ALIAS[name] || name;
}

window.VISUAL_ALIAS = VISUAL_ALIAS;
window.resolveVisualId = resolveVisualId;
