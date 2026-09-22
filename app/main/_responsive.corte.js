/* PACE · EL CORTE ENTRE LAS DOS PIELES (s197 · v0.130.0)
   ======================================================
   UN SOLO SITIO. Hasta v0.129.0 el corte entre la piel de móvil y la de escritorio
   era `max-width: 768px` / `min-width: 769px` escrito a mano en 19 sitios de 8
   archivos (CSS inyectado y tres `matchMedia`). Mover el corte obligaba a tocarlos
   todos y a acertar en los 19; aquí se declara una vez y los demás lo interpolan.

   QUÉ DECIDIÓ EL USUARIO (s196, viendo cinco pantallas verticales reales con la piel
   de móvil forzada en la foto): «820×1100 escritorio queda raro el aro del pomodoro
   tan pequeño / 768×1100 piel de móvil, una columna, barra abajo: así se ve
   perfecto», y el ancho, «vertical hasta 1024». O sea:

     PIEL DE MÓVIL      = el teléfono de siempre (≤ 768) O CUALQUIER PANTALLA MÁS ALTA
                          QUE ANCHA de hasta 1024 px: iPad (768), iPad Air (820),
                          iPad Pro 11" (834), iPad Pro 12,9" (1024) y una ventana de
                          escritorio estrecha y alta.
     PIEL DE ESCRITORIO = todo lo demás: ≥ 1025 de ancho, o ≥ 769 en apaisado.

   UNA VENTANA CUADRADA CUENTA COMO VERTICAL: `orientation: portrait` casa cuando el
   alto es MAYOR O IGUAL que el ancho (lo define así el estándar), y 1000 ≤ 1024. No se
   ve leyendo la regla, así que va medido en el test.

   POR QUÉ ASÍ Y NO CON `not`: las dos condiciones son COMPLEMENTARIAS y EXHAUSTIVAS
   —se comprueba en tests/pieles-corte.spec.js por los cuatro lados— y se escriben sin
   `@media (... and (not (...)))`, que es sintaxis de nivel 4 y no existe en Safari
   anterior a 16.4. Aquí todo es nivel 3: listas separadas por coma y `orientation`.

   LA PILL DE MODOS EN TABLETA (el defecto que ESTRENÓ este corte): la piel de móvil
   esconde `[data-pace-tabs]` porque a ancho de teléfono la pill —absoluta, centrada,
   fuera de flujo— se solapa con los tres iconos, y por eso el teléfono le da una fila
   propia de 102 px (s169). Al mudar las verticales de hasta 1024 a esta piel, entre 820
   y 1024 no quedaba ni pill ni fila: los tres modos desaparecían de la topbar. El propio
   comentario de s169 decía dónde deja de hacer falta —«sólo se limpiaría por encima de
   ~560 px de ANCHO, que ningún teléfono alcanza en vertical»—, así que a 768-1024 la
   pill vuelve a su sitio SIN la fila extra. Medido: a 820 ocupa 287-533 y los iconos
   empiezan en 680, o sea 147 px de aire; a 1024, 249. La regla vive en
   `_responsive.pieles.js`, que es donde manda el orden de las hojas.

   LO QUE NO SE TOCA: los dos sub-bloques de `_responsive.pieles.js` que son del
   TELÉFONO y no de la piel (la pill de la topbar entre 390 y 768 con alto ≥ 760, y
   el apretón de la ActivityBar con alto ≤ 720). Una tableta vertical es ancha y alta:
   no entra en ninguno de los dos, y meterla cambiaría cosas que nadie pidió. */

var PACE_CORTE_MAX = 1024;                    /* el ancho hasta el que una vertical es «móvil» */
var PACE_CORTE_MOVIL = '(max-width: 768px), (orientation: portrait) and (max-width: ' + PACE_CORTE_MAX + 'px)';
var PACE_CORTE_ESC = '(min-width: ' + (PACE_CORTE_MAX + 1) + 'px), (min-width: 769px) and (orientation: landscape)';

/* ¿Estamos en la piel de móvil? La misma pregunta que hace el CSS, para el JS que la
   necesita (la barra lateral que se desacopla, la detección de entorno, el motor de
   geometría). `matchMedia` acepta la lista con coma igual que `@media`. */
function paceEsMovil() {
  try { return !!(window.matchMedia && window.matchMedia(PACE_CORTE_MOVIL).matches); } catch (e) { return false; }
}

Object.assign(window, { PACE_CORTE_MAX, PACE_CORTE_MOVIL, PACE_CORTE_ESC, paceEsMovil });
