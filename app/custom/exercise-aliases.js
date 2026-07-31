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
  /* Duplicados de nombre unificados en s110 (auditoría B2.1 §4.2). */
  'Chest opener':                  'Apertura de pecho',
  'Deep squat hold':               'Sentadilla profunda',
  'Deep breaths':                  'Reset respiración',
  'Dead hang · opcional':          'Suspensión pasiva',

  /* OLAS A y C de la Fase 2 (s141) — inglés retirado del ESPAÑOL. Estas
     entradas no son cosmética: el constructor COPIA el nombre del ejercicio
     dentro de la rutina propia que se guarda en `localStorage`
     (`state-custom.jsx`), así que una rutina creada antes del renombrado
     sigue pidiendo el nombre viejo y perdería su glifo EN SILENCIO, que es
     justo lo que prohíbe s108. Al dibujar los glifos que faltan (ola B),
     esas rutinas los heredan solas. NO borrar mientras pueda existir una
     instalación con datos previos. */
  'Hang pasivo':                   'Suspensión pasiva',
  'Hang activo':                   'Suspensión activa',
  'Hollow hold':                   'Hueco abdominal',
  'Seated hollow':                 'Hueco en silla',
  'Couch stretch':                 'Cuádriceps en pared',
  'Ankle circles':                 'Círculos de tobillo',
  'Wrist circles':                 'Círculos de muñeca',
  'Wrist stretch':                 'Estiramiento de muñeca',
  'Finger extension':              'Extensión de dedos',
  'Squeeze fist':                  'Abrir y cerrar el puño',
  'Calf raises':                   'Elevación de talones',
  'Tibialis raise':                'Elevación de puntas',
  'Scapular squeeze':              'Juntar omóplatos',
  'External rotation':             'Rotación externa',
  'Thoracic extension':            'Extensión torácica',
  'Band pull-apart':               'Apertura con banda',
  'Seated twist':                  'Giro sentado',
  'Shrug + round':                 'Encogimiento de hombros',
  'Wall sit':                      'Silla en la pared',
  'Crawling':                      'Gateo',
  'Pigeon':                        'Paloma',
  'Chin tucks':                    'Barbilla atrás',
  'Cossack squat':                 'Sentadilla lateral',
  'ATG split squat':               'Zancada profunda',
  'Scapular wall slides':          'Deslizamientos en pared',
  'Ground sitting transitions':    'Sentarse y levantarse del suelo',
  'Elephant walk':                 'Marcha del elefante',
  'World\'s greatest stretch':     'Zancada con apertura',
  'Sissy squat':                   'Sentadilla de cuádriceps',
  'Squat profundo':                'Sentadilla profunda',
  'Rib pull + respiración':        'Apertura de costillas + respiración',

  /* Estos cuatro tienen glifo PROPIO tapado por su alias: `ExerciseGlyph`
     resuelve `EXERCISE_GLYPHS[resolveVisualId(id)] || EXERCISE_GLYPHS[id]`,
     así que su dibujo no se pinta nunca. Al renombrarlos se habría activado
     solo, cambiando lo que se ve sin que nadie lo pidiera: heredan el mismo
     destino. Para usar el dibujo propio, basta con borrar su línea. */
  'Apertura de pecho sentado':     'Apertura de pecho',
  'Sentadilla profunda sostenida': 'Sentadilla profunda',
  'Respiraciones profundas':       'Reset respiración',
  'Suspensión pasiva · opcional':  'Suspensión pasiva',
};

/* resolveVisualId(name) → identidad visual canónica (o el propio nombre). */
function resolveVisualId(name) {
  return VISUAL_ALIAS[name] || name;
}

window.VISUAL_ALIAS = VISUAL_ALIAS;
window.resolveVisualId = resolveVisualId;
