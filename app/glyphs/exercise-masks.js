/* PACE · Glifos de EJERCICIO como MÁSCARA CSS · sesión 166
   Cuarto sistema visual de `app/glyphs/`, hermano de:
     - achievement-glyphs.jsx  → 34 glifos heráldicos en SVG (s83)
     - exercise-glyphs.jsx     → line-art de Mueve/Estira en SVG (s60)
     - achievement-masks.js    → arte de logro del usuario como máscara (s146)

   Aquí NO hay dibujo: solo el mapa `identidad visual → archivo de máscara`. El
   arte lo genera `scripts/ingest-glifos-ejercicio.js` desde los PNG del
   usuario. Regla D-4: si llega arte nuevo se RE-CORRE el script; nunca se
   retoca un .webp a mano.

   POR QUÉ EXISTE, y qué decidió el usuario. El encargo
   (`docs/product/GLIFOS_EJERCICIOS_REDISENO.md`) es rehacer **los 62 dibujos
   desde cero** en vez de parchear los 20 huecos, y eso trae una consecuencia
   que el usuario confirmó: los de ejercicio **dejan de ser SVG dibujado en
   código** y pasan a máscaras, como el loto y los sellos de logro. Un solo
   mecanismo para todo el arte de la app.

   EL MAPA NACE VACÍO A PROPÓSITO, y es lo que hace que esto se pueda montar
   ANTES de que exista el arte. `ExerciseGlyph` da PRECEDENCIA a la máscara y
   cae al SVG cuando no la hay, exactamente como s146 hizo con los logros: con
   el mapa vacío la app pinta hoy lo mismo que pintaba ayer —los 41 SVG— y cada
   dibujo que entre sustituye al suyo sin tocar a los demás. Los 62 no tienen
   que llegar de golpe.

   LA CLAVE ES LA IDENTIDAD VISUAL, no el nombre del ejercicio. Varios
   ejercicios comparten dibujo vía `VISUAL_ALIAS` (s110), así que quien resuelve
   es `resolveVisualId()` — el mismo resolutor que usa la rama SVG. Mapear por
   nombre de ejercicio crearía 62 filas donde hacen falta 61 y dejaría alias
   apuntando a nada. (s141 ya se comió esto: un alias TAPA el glifo propio, y
   así murieron 5 dibujos.)

   OJO — LAS RUTAS VAN ENTERAS Y LITERALES en las filas, nunca concatenadas, y
   TAMPOCO PUEDEN APARECER EN LOS COMENTARIOS. El inliner del build sustituye
   REFERENCIAS TEXTUALES: busca la ruta completa del asset en el bundle y la
   cambia por su data URI; después comprueba que no queda ni rastro del prefijo,
   y una mención en prosa hace saltar el guardarraíl y ABORTA el build. Las dos
   trampas están medidas en s146 (ver la cabecera de `achievement-masks.js`).
   Si añades un glifo: una fila abajo, y nada de rutas en los comentarios. */
const EXERCISE_MASKS = {
  /* VACIO hasta que el usuario entregue los PNG. Lo rellena
     , que reescribe SOLO este objeto y las
     filas de precache de , y valida contra lo que la app PIDE (61
     identidades visuales, el mismo numero que da el censo de s164). */
};

/* Devuelve la ruta de la máscara de un ejercicio, o null.
   Resuelve por IDENTIDAD VISUAL primero y por nombre propio después, que es el
   mismo orden que `ExerciseGlyph` usa con los SVG: así un alias no se queda sin
   arte y un nombre sin alias tampoco. */
function exerciseMaskUrl(name) {
  if (!name) return null;
  const vid = (window.resolveVisualId ? window.resolveVisualId(name) : name);
  return EXERCISE_MASKS[vid] || EXERCISE_MASKS[name] || null;
}

Object.assign(window, { EXERCISE_MASKS, exerciseMaskUrl });
