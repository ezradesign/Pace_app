/* PACE · Glifos de logro del usuario como MÁSCARA CSS · sesión 146
   Tercer sistema visual de `app/glyphs/`, hermano de:
     - achievement-glyphs.jsx  → 34 glifos heráldicos en SVG (s83)
     - exercise-glyphs.jsx     → line-art de Mueve/Estira (s60)

   Aquí NO hay dibujo: solo el mapa `id de logro → archivo de máscara`. El arte
   vive en `assets/logros/*.webp` y lo genera `scripts/ingest-glifos-logro.js`
   desde los PNG del usuario. Regla D-4: si llega arte nuevo se RE-CORRE el
   script, nunca se retoca el .webp a mano.

   POR QUÉ MÁSCARA Y NO IMAGEN (medido en s146, no a ojo)
   ------------------------------------------------------
   Los dibujos son lápiz pálido: el píxel más oscuro de varios se queda en
   L 171-187 sobre un papel de L 237, o sea 50 niveles de contraste. Como
   máscara, la forma la pone el dibujo y el color lo pone el token: **87 niveles
   para todos**, el mismo contraste que los 34 glifos SVG ya existentes porque
   comparten token. Y conserva el tintado por ESTADO —`--ink-3` bloqueado, el
   color de la categoría al conseguirlo—, que con una imagen a color se perdería.
   El precio, asumido: se pierden los toques de color del arte (el lacre rojo
   del mapa, el punto naranja de la luna).

   PRECEDENCIA: si un logro tiene máscara, gana a su `glyphSvg` heráldico. Así
   la tanda del usuario puede entrar POR PARTES sin dejar huecos — lo que aún no
   tenga dibujo sigue con el sistema viejo.

   DISTRIBUCIÓN: igual que las láminas y el loto — archivo en web + precache en
   `sw.js`, data URI solo en el standalone (el inliner del build recorre una
   lista de carpetas de arte; esta carpeta está en esa lista). */
/* OJO — LAS RUTAS VAN ENTERAS Y LITERALES en las filas de abajo, nunca
   concatenadas. El inliner del build sustituye REFERENCIAS TEXTUALES: busca la
   ruta completa del asset en el bundle y la cambia por su data URI. La primera
   versión guardaba solo el nombre del archivo y componía la ruta en la función;
   la cadena completa no existía en ningún sitio, el build no inlineaba nada y
   el standalone se habría quedado con los sellos en blanco.

   Segunda trampa, la que costó el aborto del build: **este comentario tampoco
   puede llevar la ruta escrita**. Tras sustituir las referencias reales, el
   guardarrail comprueba que no queda ni rastro del prefijo, y una mención en
   prosa lo hace saltar. Si añades un glifo: una fila abajo, y nada de rutas en
   los comentarios. */
const ACHIEVEMENT_MASKS = {
  'breathe.sessions.10':      'app/glyphs/assets/logros/breathe.sessions.10.webp',
  'explore.478':              'app/glyphs/assets/logros/explore.478.webp',
  'explore.all.breathe':      'app/glyphs/assets/logros/explore.all.breathe.webp',
  'explore.bhastrika':        'app/glyphs/assets/logros/explore.bhastrika.webp',
  'explore.coherent':         'app/glyphs/assets/logros/explore.coherent.webp',
  'explore.hips':             'app/glyphs/assets/logros/explore.hips.webp',
  'explore.nadi':             'app/glyphs/assets/logros/explore.nadi.webp',
  'explore.physiological':    'app/glyphs/assets/logros/explore.physiological.webp',
  'explore.tweaks':           'app/glyphs/assets/logros/explore.tweaks.webp',
  'explore.ujjayi':           'app/glyphs/assets/logros/explore.ujjayi.webp',
  'first.breath':             'app/glyphs/assets/logros/first.breath.webp',
  'first.cycle':              'app/glyphs/assets/logros/first.cycle.webp',
  'first.day':                'app/glyphs/assets/logros/first.day.webp',
  'first.extra':              'app/glyphs/assets/logros/first.extra.webp',
  'first.plan':               'app/glyphs/assets/logros/first.plan.webp',
  'first.return':             'app/glyphs/assets/logros/first.return.webp',
  'first.ritual':             'app/glyphs/assets/logros/first.ritual.webp',
  'first.sip':                'app/glyphs/assets/logros/first.sip.webp',
  'first.step':               'app/glyphs/assets/logros/first.step.webp',
  'first.stretch':            'app/glyphs/assets/logros/first.stretch.webp',
  'focus.hours.10':           'app/glyphs/assets/logros/focus.hours.10.webp',
  'focus.hours.100':          'app/glyphs/assets/logros/focus.hours.100.webp',
  'focus.hours.50':           'app/glyphs/assets/logros/focus.hours.50.webp',
  'master.antidote':          'app/glyphs/assets/logros/master.antidote.webp',
  'master.centurion':         'app/glyphs/assets/logros/master.centurion.webp',
  'master.coherent.15':       'app/glyphs/assets/logros/master.coherent.15.webp',
  'master.collector.full':    'app/glyphs/assets/logros/master.collector.full.webp',
  'master.collector.half':    'app/glyphs/assets/logros/master.collector.half.webp',
  'master.dawn':              'app/glyphs/assets/logros/master.dawn.webp',
  'master.dusk':              'app/glyphs/assets/logros/master.dusk.webp',
  'master.focus.day':         'app/glyphs/assets/logros/master.focus.day.webp',
  'master.gardener':          'app/glyphs/assets/logros/master.gardener.webp',
  'master.marathon':          'app/glyphs/assets/logros/master.marathon.webp',
  'master.path.all7':         'app/glyphs/assets/logros/master.path.all7.webp',
  'master.pomodoro.12':       'app/glyphs/assets/logros/master.pomodoro.12.webp',
  'master.retreat':           'app/glyphs/assets/logros/master.retreat.webp',
  'master.silent.day':        'app/glyphs/assets/logros/master.silent.day.webp',
  'morning.5':                'app/glyphs/assets/logros/morning.5.webp',
  'move.sessions.25':         'app/glyphs/assets/logros/move.sessions.25.webp',
  'season.cycle':             'app/glyphs/assets/logros/season.cycle.webp',
  'season.equinox.spring':    'app/glyphs/assets/logros/season.equinox.spring.webp',
  'season.four':              'app/glyphs/assets/logros/season.four.webp',
  'season.solstice.summer':   'app/glyphs/assets/logros/season.solstice.summer.webp',
  'season.solstice.winter':   'app/glyphs/assets/logros/season.solstice.winter.webp',
  'season.spring':            'app/glyphs/assets/logros/season.spring.webp',
  'season.winter':            'app/glyphs/assets/logros/season.winter.webp',
  'secret.backup':            'app/glyphs/assets/logros/secret.backup.webp',
  'secret.bilingual':         'app/glyphs/assets/logros/secret.bilingual.webp',
  'secret.night.owl':         'app/glyphs/assets/logros/secret.night.owl.webp',
  'secret.safety.read':       'app/glyphs/assets/logros/secret.safety.read.webp',
  'secret.supporter':         'app/glyphs/assets/logros/secret.supporter.webp',
  'stats.month.first':        'app/glyphs/assets/logros/stats.month.first.webp',
  'stats.year.first':         'app/glyphs/assets/logros/stats.year.first.webp',
  'streak.100':               'app/glyphs/assets/logros/streak.100.webp',
  'streak.3':                 'app/glyphs/assets/logros/streak.3.webp',
  'streak.30':                'app/glyphs/assets/logros/streak.30.webp',
  'streak.365':               'app/glyphs/assets/logros/streak.365.webp',
  'streak.60':                'app/glyphs/assets/logros/streak.60.webp',
};

function achievementMaskUrl(id) {
  return ACHIEVEMENT_MASKS[id] || null;
}

Object.assign(window, { ACHIEVEMENT_MASKS, achievementMaskUrl });
