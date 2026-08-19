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
  '90/90': 'app/glyphs/assets/ejercicios/90-90.webp',
  'Abrir y cerrar el puño': 'app/glyphs/assets/ejercicios/abrir-y-cerrar-el-puno.webp',
  'Apertura con banda': 'app/glyphs/assets/ejercicios/apertura-con-banda.webp',
  'Apertura de costillas + respiración': 'app/glyphs/assets/ejercicios/apertura-de-costillas-respiracion.webp',
  'Apertura de pecho': 'app/glyphs/assets/ejercicios/apertura-de-pecho.webp',
  'Apretar glúteos': 'app/glyphs/assets/ejercicios/apretar-gluteos.webp',
  'Círculos de hombro': 'app/glyphs/assets/ejercicios/circulos-de-hombro.webp',
  'Círculos de muñeca': 'app/glyphs/assets/ejercicios/circulos-de-muneca.webp',
  'Círculos de tobillo': 'app/glyphs/assets/ejercicios/circulos-de-tobillo.webp',
  'Cuello y trapecios': 'app/glyphs/assets/ejercicios/cuello-y-trapecios.webp',
  'Deslizamientos en pared': 'app/glyphs/assets/ejercicios/deslizamientos-en-pared.webp',
  'Elevación de puntas': 'app/glyphs/assets/ejercicios/elevacion-de-puntas.webp',
  'Elevación de talones': 'app/glyphs/assets/ejercicios/elevacion-de-talones.webp',
  'Encogimiento de hombros': 'app/glyphs/assets/ejercicios/encogimiento-de-hombros.webp',
  'Escalenos': 'app/glyphs/assets/ejercicios/escalenos.webp',
  'Estiramiento de muñeca': 'app/glyphs/assets/ejercicios/estiramiento-de-muneca.webp',
  'Extensión de dedos': 'app/glyphs/assets/ejercicios/extension-de-dedos.webp',
  'Extensión torácica': 'app/glyphs/assets/ejercicios/extension-toracica.webp',
  'Flexiones inclinadas': 'app/glyphs/assets/ejercicios/flexiones-inclinadas.webp',
  'Flexor de cadera': 'app/glyphs/assets/ejercicios/flexor-de-cadera.webp',
  'Fondos en silla': 'app/glyphs/assets/ejercicios/fondos-en-silla.webp',
  'Gateo': 'app/glyphs/assets/ejercicios/gateo.webp',
  'Gato-camello': 'app/glyphs/assets/ejercicios/gato-camello.webp',
  'Giro sentado': 'app/glyphs/assets/ejercicios/giro-sentado.webp',
  'Hueco abdominal': 'app/glyphs/assets/ejercicios/hueco-abdominal.webp',
  'Hueco en silla': 'app/glyphs/assets/ejercicios/hueco-en-silla.webp',
  'Juntar omóplatos': 'app/glyphs/assets/ejercicios/juntar-omoplatos.webp',
  'Marcha del elefante': 'app/glyphs/assets/ejercicios/marcha-del-elefante.webp',
  'Palmas al suelo': 'app/glyphs/assets/ejercicios/palmas-al-suelo.webp',
  'Paloma': 'app/glyphs/assets/ejercicios/paloma.webp',
  'Plancha': 'app/glyphs/assets/ejercicios/plancha.webp',
  'Plancha lateral': 'app/glyphs/assets/ejercicios/plancha-lateral.webp',
  'Pliegue adelante': 'app/glyphs/assets/ejercicios/pliegue-adelante.webp',
  'Puente con marcha': 'app/glyphs/assets/ejercicios/puente-con-marcha.webp',
  'Puente torácico': 'app/glyphs/assets/ejercicios/puente-toracico.webp',
  'Reset respiración': 'app/glyphs/assets/ejercicios/reset-respiracion.webp',
  'Rezo invertido': 'app/glyphs/assets/ejercicios/rezo-invertido.webp',
  'Rodar hacia abajo': 'app/glyphs/assets/ejercicios/rodar-hacia-abajo.webp',
  'Rotación externa': 'app/glyphs/assets/ejercicios/rotacion-externa.webp',
  'Rotación torácica': 'app/glyphs/assets/ejercicios/rotacion-toracica.webp',
  'Sentadilla a silla': 'app/glyphs/assets/ejercicios/sentadilla-a-silla.webp',
  'Sentadilla de cuádriceps': 'app/glyphs/assets/ejercicios/sentadilla-de-cuadriceps.webp',
  'Silla en la pared': 'app/glyphs/assets/ejercicios/silla-en-la-pared.webp',
  'Superman': 'app/glyphs/assets/ejercicios/superman.webp',
  'Suspensión activa': 'app/glyphs/assets/ejercicios/suspension-activa.webp',
  'Suspensión pasiva': 'app/glyphs/assets/ejercicios/suspension-pasiva.webp',
  'Zancada profunda': 'app/glyphs/assets/ejercicios/zancada-profunda.webp',
};

/* MÁSCARA DE MINIATURA (s170) — un segundo asset SOLO para tamaños pequeños.
   A 30 px la máscara grande no se lee, y no es cuestión de ajustes: una línea de
   un píxel promediada 25 veces se vuelve gris. Subir el contraste del asset
   grande para arreglar el pequeño estropearía el grande, así que la ingesta
   genera un `.min.webp` aparte con el trazo ENGORDADO y el contraste al límite.
   Con el mapa vacío no pasa nada: se usa el grande, como hasta ahora. */
const EXERCISE_MASKS_MIN = {
  '90/90': 'app/glyphs/assets/ejercicios/90-90.min.webp',
  'Abrir y cerrar el puño': 'app/glyphs/assets/ejercicios/abrir-y-cerrar-el-puno.min.webp',
  'Apertura con banda': 'app/glyphs/assets/ejercicios/apertura-con-banda.min.webp',
  'Apertura de costillas + respiración': 'app/glyphs/assets/ejercicios/apertura-de-costillas-respiracion.min.webp',
  'Apertura de pecho': 'app/glyphs/assets/ejercicios/apertura-de-pecho.min.webp',
  'Apretar glúteos': 'app/glyphs/assets/ejercicios/apretar-gluteos.min.webp',
  'Círculos de hombro': 'app/glyphs/assets/ejercicios/circulos-de-hombro.min.webp',
  'Círculos de muñeca': 'app/glyphs/assets/ejercicios/circulos-de-muneca.min.webp',
  'Círculos de tobillo': 'app/glyphs/assets/ejercicios/circulos-de-tobillo.min.webp',
  'Cuello y trapecios': 'app/glyphs/assets/ejercicios/cuello-y-trapecios.min.webp',
  'Deslizamientos en pared': 'app/glyphs/assets/ejercicios/deslizamientos-en-pared.min.webp',
  'Elevación de puntas': 'app/glyphs/assets/ejercicios/elevacion-de-puntas.min.webp',
  'Elevación de talones': 'app/glyphs/assets/ejercicios/elevacion-de-talones.min.webp',
  'Encogimiento de hombros': 'app/glyphs/assets/ejercicios/encogimiento-de-hombros.min.webp',
  'Escalenos': 'app/glyphs/assets/ejercicios/escalenos.min.webp',
  'Estiramiento de muñeca': 'app/glyphs/assets/ejercicios/estiramiento-de-muneca.min.webp',
  'Extensión de dedos': 'app/glyphs/assets/ejercicios/extension-de-dedos.min.webp',
  'Extensión torácica': 'app/glyphs/assets/ejercicios/extension-toracica.min.webp',
  'Flexiones inclinadas': 'app/glyphs/assets/ejercicios/flexiones-inclinadas.min.webp',
  'Flexor de cadera': 'app/glyphs/assets/ejercicios/flexor-de-cadera.min.webp',
  'Fondos en silla': 'app/glyphs/assets/ejercicios/fondos-en-silla.min.webp',
  'Gateo': 'app/glyphs/assets/ejercicios/gateo.min.webp',
  'Gato-camello': 'app/glyphs/assets/ejercicios/gato-camello.min.webp',
  'Giro sentado': 'app/glyphs/assets/ejercicios/giro-sentado.min.webp',
  'Hueco abdominal': 'app/glyphs/assets/ejercicios/hueco-abdominal.min.webp',
  'Hueco en silla': 'app/glyphs/assets/ejercicios/hueco-en-silla.min.webp',
  'Juntar omóplatos': 'app/glyphs/assets/ejercicios/juntar-omoplatos.min.webp',
  'Marcha del elefante': 'app/glyphs/assets/ejercicios/marcha-del-elefante.min.webp',
  'Palmas al suelo': 'app/glyphs/assets/ejercicios/palmas-al-suelo.min.webp',
  'Paloma': 'app/glyphs/assets/ejercicios/paloma.min.webp',
  'Plancha': 'app/glyphs/assets/ejercicios/plancha.min.webp',
  'Plancha lateral': 'app/glyphs/assets/ejercicios/plancha-lateral.min.webp',
  'Pliegue adelante': 'app/glyphs/assets/ejercicios/pliegue-adelante.min.webp',
  'Puente con marcha': 'app/glyphs/assets/ejercicios/puente-con-marcha.min.webp',
  'Puente torácico': 'app/glyphs/assets/ejercicios/puente-toracico.min.webp',
  'Reset respiración': 'app/glyphs/assets/ejercicios/reset-respiracion.min.webp',
  'Rezo invertido': 'app/glyphs/assets/ejercicios/rezo-invertido.min.webp',
  'Rodar hacia abajo': 'app/glyphs/assets/ejercicios/rodar-hacia-abajo.min.webp',
  'Rotación externa': 'app/glyphs/assets/ejercicios/rotacion-externa.min.webp',
  'Rotación torácica': 'app/glyphs/assets/ejercicios/rotacion-toracica.min.webp',
  'Sentadilla a silla': 'app/glyphs/assets/ejercicios/sentadilla-a-silla.min.webp',
  'Sentadilla de cuádriceps': 'app/glyphs/assets/ejercicios/sentadilla-de-cuadriceps.min.webp',
  'Silla en la pared': 'app/glyphs/assets/ejercicios/silla-en-la-pared.min.webp',
  'Superman': 'app/glyphs/assets/ejercicios/superman.min.webp',
  'Suspensión activa': 'app/glyphs/assets/ejercicios/suspension-activa.min.webp',
  'Suspensión pasiva': 'app/glyphs/assets/ejercicios/suspension-pasiva.min.webp',
  'Zancada profunda': 'app/glyphs/assets/ejercicios/zancada-profunda.min.webp',
};

/* Por debajo de este tamaño se prefiere la miniatura. 40 px deja fuera el sello
   de 56 —que con el asset grande ya se lee— y coge la miniatura de 30 de la
   biblioteca, que es la que fallaba. */
const MASK_MIN_HASTA = 40;

/* Devuelve la ruta de la máscara de un ejercicio, o null.
   Resuelve por IDENTIDAD VISUAL primero y por nombre propio después, que es el
   mismo orden que `ExerciseGlyph` usa con los SVG: así un alias no se queda sin
   arte y un nombre sin alias tampoco. */
function exerciseMaskUrl(name, size) {
  if (!name) return null;
  const vid = (window.resolveVisualId ? window.resolveVisualId(name) : name);
  if (typeof size === 'number' && size <= MASK_MIN_HASTA) {
    const min = EXERCISE_MASKS_MIN[vid] || EXERCISE_MASKS_MIN[name];
    if (min) return min;
  }
  return EXERCISE_MASKS[vid] || EXERCISE_MASKS[name] || null;
}

Object.assign(window, { EXERCISE_MASKS, EXERCISE_MASKS_MIN, MASK_MIN_HASTA, exerciseMaskUrl });
