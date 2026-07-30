/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   BreatheVisual.support — hoja inyectada del visual de Respira
   ===========================================================
   Extraído de BreatheVisual.jsx en la sesión 139: con el arreglo de la
   regresión de encaje (A1), el banding (A2) y la vela del loto (A3) el archivo
   llegó a 512 líneas y rebasó el tope de 500 de CLAUDE.md. Se saca la parte que
   no es React —una IIFE que solo toca `document`— siguiendo el mismo patrón que
   `MoveSessionV1.support.jsx` y `FocusTimer.support.jsx`.

   La inyección es IDEMPOTENTE (comprueba el id antes de insertar), así que basta
   con cargar este archivo DESPUÉS de BreatheVisual.jsx. No exporta nada: su
   efecto es el <style> en <head>.

   Qué gobierna esta hoja:
     · los @keyframes del giro continuo y de la «vela» del loto;
     · la tinta del loto POR PALETA (`[data-pace-loto]`);
     · el reparto de alto del centro de la sesión de Respira y el reclamo del
       hueco muerto — confinados con `:has()` para no tocar el runner v1.
   ============================================================ */
/* s138 — keyframes del giro continuo del loto. Se inyectan desde aquí (patrón
   IIFE de `app/main/_responsive.js` y `SessionShell.responsive.js`) en vez de
   añadirlos a `tokens.css`: ese archivo ya está en 613 líneas, marcado como
   deuda MEDIA y con un troceo pendiente en la Fase 8.5, y esta animación la usa
   un solo componente.
   OJO reduced-motion: el kill global de `tokens.css` NO sirve aquí — pone
   `animation-duration: 0.01ms`, que en una rotación infinita la dispararía a
   velocidad absurda en vez de pararla. Por eso el freno vive en el JSX
   (`animation: 'none'`), y además este subtree es `data-pace-essential`. */
(function inyectaGiroDelLoto() {
  var ID = 'pace-breathe-loto-css';
  if (typeof document === 'undefined' || document.getElementById(ID)) return;
  var el = document.createElement('style');
  el.id = ID;
  /* Tinta del loto POR PALETA. En crema, `--breathe` (#C97A5D) sobre papel
     `#F2EDE0` y con la densidad baja de la máscara quedaba lavado —el usuario lo
     leyó como «poco premium»—; `--breathe-2` (#A85E43) es el mismo terracota más
     profundo y devuelve la sensación de TINTA sobre papel. En oscuro se conserva
     `--breathe`, que ya se lee como línea encendida y con la variante profunda
     perdería brillo. Va en CSS y no en el JSX porque el componente no debe
     saber qué paleta hay puesta: manda el atributo del documento. */
  el.textContent = '@keyframes pace-loto-giro{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'
    /* s139 · «vela»: la transparencia del loto de FONDO también respira, en su
       propio tiempo. Multiplica la opacidad de fase del contenedor, así que el
       techo no sube (sigue el 0,16 de s138) y solo se abre el suelo. La curva es
       simétrica a propósito —como el easeInOutSine de la escala— para que no
       lea como un parpadeo sino como algo que se acerca y se aleja. */
    + '@keyframes pace-loto-vela{0%,100%{opacity:0.62}50%{opacity:1}}'
    + '[data-pace-loto]{background:var(--breathe-2)}'
    + '[data-palette="oscuro"] [data-pace-loto]{background:var(--breathe)}'
    /* s139 — EL CENTRO REPARTE SU ALTO REAL (arreglo de la regresión).
       `[data-pace-session-center-body]` se centra con `margin:auto`: centra
       cuando cabe y alinea ARRIBA cuando no. Con `flex:1 1 auto` dentro del
       centro, el body mide EXACTAMENTE el hueco disponible —lo que ninguna
       unidad `vh` puede saber, porque el hueco es la ventana menos header,
       footer y padding, y esos cambian por tier responsive—. Si sobra alto,
       `justify-content:center` centra igual que el `margin:auto` de antes; si
       falta, el déficit lo absorbe el único elemento elástico, el visual.
       `safe center` es el cinturón: si ni siquiera con el visual en su suelo
       cabe, el navegador vuelve a alinear ARRIBA en vez de recortar por los dos
       lados (que es justo lo que el comentario de s112 evitaba con margin:auto).
       CONFINADO con `:has()` al visual del loto — patrón s125. El runner v1 y
       sus alturas reservadas (s119) no se tocan, y los otros cuatro estilos de
       Respira conservan su wrap fijo y su margin:auto. */
    /* `!important` NO es decorativo: `margin:auto` y el `gap:32` del `centerGap`
       llegan como estilo INLINE desde `sessionShellStyles`, y sin él la hoja
       pierde (medido: el gap seguía en 32). Es el mismo patrón que ya usan
       `Primitives.Modal` y `SessionShell.responsive.js` para gobernar estilos
       inline desde fuera. `flex`, `min-height` y `justify-content` no vienen
       inline y no lo necesitarían; se marcan igual para que la regla no dependa
       de qué propiedades tenga hoy el objeto de estilos del shell. */
    + '[data-pace-session-center]:has([data-pace-breathe-visual])'
    + '>[data-pace-session-center-body]'
    + '{flex:1 1 auto!important;min-height:0!important;margin:0 auto!important;'
    /* AIRE MÍNIMO GARANTIZADO. Sin esto, en cuanto el contenido cabe por los
       pelos el visual se queda a tamaño máximo y se pega al header: medido a
       1280×720, 2,4 px de aire sobre la caja. Los 12 px de padding cuentan como
       contenido, así que a esas alturas aparece déficit y el visual prefiere
       encoger un poco antes que rozar. Es simétrico, así que en pantallas
       holgadas NO mueve nada (el centro del círculo se queda donde estaba). */
    + 'padding-block:12px!important;'
    + 'justify-content:safe center!important}'
    /* s139 · HUECO MUERTO RECLAMADO (feedback en vivo: «el icono sigue un poco
       arriba» + «has bajado demasiado las barras de progreso» — los dos son el
       MISMO hueco). Medido: el wrap reserva su tamaño completo porque el aro no
       puede recortarse a escala máxima (invariante s138), pero el aro exterior
       está a `inset 14%` ⇒ pinta el 72 %, y con las escalas reales oscila entre
       el 65 % (Exhala, 0,9) y el 94 % (Inhala, 1,3). Ese margen vacío es lo que
       sube el círculo y aleja la barra.
       Un margen negativo INFERIOR reclama LAYOUT sin tocar la PINTURA: al
       re-centrarse el bloque, el círculo baja la mitad de lo reclamado y la
       barra sube la otra mitad — los dos síntomas ceden a la vez. Solo abajo:
       reclamarlo también arriba dejaría el círculo donde estaba.
       EL TOPE ES ARITMÉTICO. A escala máxima el aro casi llena su caja: le
       sobran (1 − 0,72×1,35)/2 = 0,014 del ancho, unos 5,6 px en un wrap de
       400. Así que reclamar N deja de holgura `gap − N + 0,014·W`, y con 8 px de
       seguridad ⇒ **N ≤ gap − 2,4**. Por eso el reclamo va ATADO AL TIER y no
       fijo: con N=28 constante, al bajar el gap a 20 la holgura medida cayó a
       6,4 px y el aro habría rozado el texto en el patrón fisiológico.
       Si algún día sube `BREATH_MAX_SCALE`, los tres números bajan con él. */
    + '[data-pace-breathe-visual]{margin-bottom:-28px}'
    /* Orden de compactación de s113: primero los ESPACIOS, después lo demás.
       En pantallas bajas devolver gap al visual vale más que encogerlo: el hueco
       entre el círculo y el texto no comunica nada, el tamaño del círculo sí.
       Los cortes 700/560 son los MISMOS tiers de `SessionShell.responsive.js`,
       para que la sesión compacte a la vez y no a saltos. El reclamo baja con el
       gap según la fórmula de arriba (20−2,4 ⇒ 16 · 14−2,4 ⇒ 10). */
    + '@media (max-height:700px){[data-pace-session-center]:has([data-pace-breathe-visual])'
    + '>[data-pace-session-center-body]{gap:20px!important}'
    + '[data-pace-breathe-visual]{margin-bottom:-16px}}'
    + '@media (max-height:560px){[data-pace-session-center]:has([data-pace-breathe-visual])'
    + '>[data-pace-session-center-body]{gap:14px!important}'
    + '[data-pace-breathe-visual]{margin-bottom:-10px}}';
  document.head.appendChild(el);
})();
