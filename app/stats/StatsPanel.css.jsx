/* PACE · app/stats/StatsPanel.css.jsx (sesión 176)
   =================================================
   LA HOJA DE ESTADÍSTICAS, inyectada una sola vez. Patrón de
   `MoveSessionV1.css.jsx` y `library.css.jsx`: IIFE idempotente con su guard de
   id, sin exports, y basta con cargarla antes del panel.

   POR QUÉ SALE DE `StatsPanel.jsx`: aquel archivo llevaba sus reglas en dos
   `<style>` en línea dentro del JSX, y al añadir la caja común de s176 se pasó
   de las 500 líneas de la regla §1. Sacar CSS es la extracción más barata --
   no mueve ni una decisión de comportamiento.

   NI UN BACKTICK DENTRO DEL TEMPLATE LITERAL: el build aborta y las medidas
   siguientes corren contra el artefacto viejo (trampa de s172b).

   LAS CUATRO PESTAÑAS COMPARTEN CAJA EN ESCRITORIO (s176). Medido a 1536x714
   antes de tocar nada: el modal saltaba de 443,7 px en «Año» a 606,9 en
   «Semana» y «Mes» -- 163,2 px al cambiar de pestaña-- y dos de las cuatro
   además tenían scroll. El suelo es LO QUE CABE y no lo que mide la más alta:
   a 714 px de alto el modal da 605 útiles y el cromo se come 220,1, así que la
   vista puede medir 384,9. Por eso el calendario se compacta en vez de estirar
   la caja: estirarla habría fijado el tamaño DEJANDO el scroll, que es la mitad
   de lo que se pidió.
   EN EL MÓVIL TAMBIÉN desde v0.160.0: con los cuatro totales arriba en las tres
   pestañas, su suelo es la más alta de las tres (ver el bloque del móvil). */
(function () {
  if (document.getElementById('pace-stats-css')) return;
  var s = document.createElement('style');
  s.id = 'pace-stats-css';
  s.textContent = `
        .pace-heatmap-cell { width:42px;height:42px;border-radius:6px;cursor:default;transition:opacity 120ms;position:relative; }
        .pace-heatmap-cell.has-data { cursor:pointer; }
        .pace-heatmap-cell.has-data:hover { opacity:0.85; }
        .pace-heatmap-grid { display:grid;grid-template-columns:repeat(7, 42px);gap:6px;justify-content:center; }
        .pace-heatmap-header-day { width:42px;text-align:center;font-size:10px;color:var(--ink-3);letter-spacing:0.5px;font-weight:600; }
        .pace-heatmap-day-num { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--ink);font-variant-numeric:tabular-nums;z-index:1; }
        .pace-heatmap-empty { width:42px;height:42px; }
        @media (max-width:640px) {
          .pace-heatmap-cell { width:36px !important;height:36px !important; }
          .pace-heatmap-grid { grid-template-columns:repeat(7, 36px) !important;gap:4px !important; }
          .pace-heatmap-header-day { width:36px !important;font-size:9px !important; }
          .pace-heatmap-day-num { font-size:11px !important; }
          .pace-heatmap-empty { width:36px !important;height:36px !important; }
          /* Las pestañas van en la cabecera del modal, que en el móvil se guarda 36 px a la
             derecha para la X. Ellas van debajo de la X, así que recuperan ese ancho. */
          [data-pace-modal-head] > [data-pace-stats-tabs] { margin-right: -36px !important; margin-top: var(--s-4) !important; }
        }

    /* ══ v0.160.0 · EL MÓVIL (todo lo que no es escritorio) ═══════════════════
       Las tres pestañas con la misma forma: los cuatro totales arriba (2 x 2) y su
       dibujo debajo. En el mes, las tarjetas sustituyen a la línea de totales. La
       nota de la semana no cabe y se queda en el escritorio. El año va en dos filas
       de medio año, con la celda ajustada al ancho (8 px a 360 px de pantalla).
       EL SUELO: la más alta de las tres (el año, o un mes de seis semanas) mide
       472 px a 360 x 718; con él, ninguna salta al cambiar de pestaña y ninguna se
       queda medio vacía. Lo mide tests/stats-pestanas.spec.js. */
    [data-pace-stats-vistas] { min-height: 472px; }
    [data-pace-stats-totales] { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; margin-bottom: 12px !important; }
    .pace-heatmap-totals { display: none !important; }
    [data-pace-week-note] { display: none; }
    [data-pace-week-eje="2"] { display: none !important; }
    [data-pace-week-bar-row] { margin-bottom: 8px; }
    [data-pace-bar-col] { height: 36px !important; }
    [data-pace-year-view] { --pace-celda-ano: min(8px, calc((100vw - 84px) / 28 - 2px)); }
    [data-pace-year-cell] { width: var(--pace-celda-ano) !important; height: var(--pace-celda-ano) !important; }
    [data-pace-year-month-lbl] { width: var(--pace-celda-ano) !important; font-size: 8px !important; }
    [data-pace-year-day-lbl] { height: var(--pace-celda-ano) !important; font-size: 7px !important; }

    @media ${PACE_CORTE_ESC} {
      /* v0.160.0 · EL SUELO DEL ESCRITORIO es un mes de seis semanas con celdas de 38 px
         (la más alta de las tres pestañas). Con las pestañas al lado del título, cabe
         sin scroll en una ventana de 640 px de alto. */
      [data-pace-stats-vistas] { min-height: 368px; padding-top: 6px; }
      /* Con «Qué te ayuda» (v0.183.0) son cinco y, sin PACE completo, tres llevan candado: la barra
         crece con sus nombres desde los 360 px de siempre en vez de cortarlos. */
      [data-pace-stats-tabs] { flex: 0 0 auto !important; min-width: 360px; margin: 0 44px 0 0 !important; }
      [data-pace-stats-totales] { grid-template-columns: repeat(4, 1fr) !important; gap: 10px !important; margin-bottom: 14px !important; }
      [data-pace-month-view] [data-pace-stats-totales], [data-pace-year-view] [data-pace-stats-totales] { display: none !important; }
      .pace-heatmap-totals { display: flex !important; }
      [data-pace-week-note] { display: block; }
      [data-pace-week-filas] { display: grid; grid-template-columns: 1fr 1fr; column-gap: 36px; }
      [data-pace-week-eje="2"] { display: flex !important; }
      [data-pace-bar-col] { height: 40px !important; }
      .pace-heatmap-cell, .pace-heatmap-empty { width: 38px; height: 38px; }
      .pace-heatmap-grid { grid-template-columns: repeat(7, 38px); }
      .pace-heatmap-header-day { width: 38px; }
      [data-pace-year-mitades] { flex-direction: row !important; gap: 0 !important; }
      [data-pace-year-mitad="1"] [data-pace-year-day-col] { display: none !important; }
      [data-pace-year-mitad="1"] [data-pace-year-meses] { margin-left: 0 !important; }
      /* ══ s177 · EL AÑO SE LLEVA EL ANCHO, Y CADA VISTA EL SUYO ═════════════

         LO QUE REPORTO EL USUARIO: «la vista de calendario podia ajustarse mas
         al tamanio de la ventana para que no quede todo tan reducido».

         MEDIDO A 1536x714 ANTES DE TOCAR NADA: el modal usaba 820 px de una
         ventana de 1536 -- el 53 %-- y la rejilla del anio lleva celdas de
         11x11 px ESCRITAS A MANO en el JSX, o sea 53 columnas x 13 = 754 px
         pase lo que pase con la ventana. Resultado: la pestania «Anio» dejaba
         163,7 px MUERTOS de sus 385, el 42 % de su caja. Las otras tres, 0.

         EL MODAL SUBE A 1240, que no es un numero inventado: es el que usan
         Mueve, Estira y Respira desde s176. Stats era el unico que se quedaba
         en 820, asi que esto QUITA una excepcion en vez de anadirla.

         LO QUE NO SE PUEDE HACER, Y ESTA MEDIDO: agrandar la rejilla del MES
         para que acompanie. Con celda 48 su vista se va a 421,4 px, con 56 a
         474,4 y con 64 a 527,4, contra los 385 de las otras tres -- o sea
         vuelve el salto entre pestanias que s176 quito a peticion del usuario.
         Los 42 px de hoy YA SON SU TECHO, que es justo lo que s176 encontro al
         compactarlo de 48 a 42.

         POR ESO CADA VISTA LLEVA SU ANCHO. Ensanchar el modal para el anio
         dejaria al mes pequenio y solo en 1174 px: se arreglaria una pestania
         estropeando otra. Las que NO son el anio se acotan a una columna de
         820 y se centran, asi que se leen como una decision. El ':has()'
         distingue una vista de otra sin tocar el JSX.

         Y EL TAMANIO DE CELDA VA AQUI Y NO EN EL JSX, con '!important', porque
         los 11 px son estilos EN LINEA por celda. 19 + 2 de hueco = 21 de
         paso; 53 x 21 = 1113 mas 18 de la columna de dias = 1131, que entra en
         los 1174 utiles. El rotulo de mes y la etiqueta de dia se mueven con
         la celda porque tienen que seguir alineados con el paso de columna --
         si uno se queda atras, los meses dejan de caer sobre su columna. */
      [data-pace-modal-card]:has([data-pace-stats-vistas]) { max-width: 1240px; }
      /* EL CENTRADO SE ACOTA AL ANIO, y esto lo corrigio una medida. Puesto en
         todas las vistas, «Semana» pasaba de 385,9 a 389,9 px: una columna
         flexible NO COLAPSA los margenes de sus hijos, asi que el margen de
         cola dejaba de fundirse con el del contenedor y se sumaba. Son 4,9 px
         de desviacion sobre la promesa de s176 -- las cuatro pestanias a la
         misma altura-- y el centrado no le hacia falta a nadie mas: el hueco
         muerto solo existe en el anio. */
      [data-pace-stats-vistas]:has([data-pace-year-grid-wrap]) {
        display: flex; flex-direction: column; justify-content: center;
      }
      [data-pace-stats-vistas]:not(:has([data-pace-year-grid-wrap])) > * {
        max-width: 920px; margin-left: auto; margin-right: auto;
      }
      [data-pace-year-cell] { width: 19px !important; height: 19px !important; border-radius: 3px !important; }
      [data-pace-year-month-lbl] { width: 19px !important; font-size: 11px !important; }
      [data-pace-year-day-lbl] { height: 19px !important; font-size: 11px !important; }

      /* Con las filas en dos columnas sobra sitio: 8 px entre fila y fila. */
      [data-pace-week-bar-row] { margin-bottom: 8px; }
    }
    /* ══ HOY (Fase 4) · cada parada del menú como una tarjeta ════════════════
       El papel de las tarjetas de totales (paper-2, r-md) con el glifo de la parada en su
       aro, como en la línea del día: la hecha rellena al 22 % con borde entero, la saltada
       al 40 % y a trazos, la que toca con su color (Ez, 15 oct., opción A). En el móvil, una
       fila fina por parada para que quepa con los totales arriba; en el escritorio, cinco
       tarjetas por fila con el nombre en hasta dos líneas. Con más de diez paradas, el móvil
       pasa a dos columnas y el escritorio a una línea por nombre; con más de quince, a seis
       por fila: una jornada de 5:00 a 23:30 cabe sin scroll en el escritorio. */
    .pace-sh-cab { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin: 0 2px 8px; }
    .pace-sh-rejilla { display: grid; grid-template-columns: minmax(0, 1fr); }
    .pace-sh-t { display: flex; gap: 10px; align-items: center; padding: 3px 2px; min-width: 0; min-height: 28px;
      border-bottom: 1px solid var(--paper-3); }
    .pace-sh-t:last-child { border-bottom: 0; }
    .pace-sh-aro { flex: none; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center;
      grid-auto-flow: column; background: var(--paper); border: 1px solid color-mix(in srgb, var(--c) 50%, transparent); }
    .pace-sh-aro.pace-sh-larga { width: 36px; border-radius: 11px; gap: 1px; }
    .pace-sh-aro .pace-rt-g { width: 13px; height: 13px; }
    .pace-sh-hecha .pace-sh-aro { border: 1.5px solid var(--c); background: color-mix(in srgb, var(--c) 22%, var(--paper)); }
    .pace-sh-saltada { opacity: 0.45; }
    .pace-sh-saltada .pace-sh-aro { border-style: dashed; }
    .pace-sh-ahora { box-shadow: inset 0 0 0 1.5px var(--c); background: color-mix(in srgb, var(--c) 12%, var(--paper-2)); }
    .pace-sh-ahora .pace-sh-m { color: var(--c); font-weight: 500; }
    .pace-sh-comida .pace-sh-aro { border-style: dotted; }
    .pace-sh-txt { min-width: 0; flex: 1; display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
    .pace-sh-n { font-family: var(--font-display); font-style: italic; font-size: 15px; line-height: 1.15; color: var(--ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pace-sh-m { flex: none; font-size: 10px; color: var(--ink-3); letter-spacing: 0.02em; white-space: nowrap; }
    .pace-sh-ahora { border-radius: var(--r-sm); }
    .pace-sh-h { font-variant-numeric: tabular-nums; color: var(--ink-2); }
    .pace-sh-mucho { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 14px; }
    .pace-sh-mucho .pace-sh-txt { display: block; }
    .pace-sh-mucho .pace-sh-m { overflow: hidden; text-overflow: ellipsis; }
    .pace-sh-vacio { font-family: var(--font-display); font-style: italic; font-size: 15px; color: var(--ink-3); margin: 6px 2px; line-height: 1.4; }

    @media ${PACE_CORTE_ESC} {
      .pace-sh-rejilla { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
      .pace-sh-t { align-items: flex-start; gap: 9px; padding: 10px 11px; border-bottom: 0; background: var(--paper-2); border-radius: var(--r-md); }
      .pace-sh-aro { width: 28px; height: 28px; }
      .pace-sh-aro.pace-sh-larga { width: 42px; height: 28px; border-radius: 13px; }
      .pace-sh-aro .pace-rt-g { width: 15px; height: 15px; }
      .pace-sh-txt { display: block; }
      .pace-sh-m { margin-top: 2px; overflow: hidden; text-overflow: ellipsis; }
      .pace-sh-n { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.3em; }
      .pace-sh-cab { margin-bottom: 10px; }
      .pace-sh-mucho { grid-template-columns: repeat(5, minmax(0, 1fr)); column-gap: 8px; }
      .pace-sh-mucho .pace-sh-t { padding: 8px 10px; }
      .pace-sh-mucho .pace-sh-n { display: block; white-space: nowrap; min-height: 0; }
      .pace-sh-muchisimo { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    }

    /* ══ «QUÉ TE AYUDA» (v0.183.0; Ez, 1A 2A 3A del 27 oct.) ═══════════════════
       Cada idea, una tarjeta como las de los totales (paper-2, r-md y la franja de su módulo
       dentro, recortada por la esquina). EN EL MÓVIL VA APRETADA A PROPÓSITO: las tres tarjetas,
       la cabecera y el pie caben en los 472 px del suelo de las otras pestañas, así que ni pide
       scroll ni salta al cambiar (lo mide tests/stats-ayuda.spec.js, en los dos idiomas). En el
       ordenador, las tres en fila. «Todavía es pronto», centrado y sin cifras. */
    .pace-ay-cab { margin: 0 2px 6px; }
    .pace-ay-rejilla { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; }
    .pace-ay-t { position: relative; overflow: hidden; background: var(--paper-2); border-radius: var(--r-md);
      padding: 8px 12px 7px; min-width: 0; }
    .pace-ay-franja { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--c); }
    .pace-ay-frase { font-family: var(--font-display); font-style: italic; font-size: 16px; line-height: 1.2; color: var(--ink); margin: 2px 0 1px; }
    .pace-ay-nota { font-size: 11px; line-height: 1.35; color: var(--ink-2); margin-top: 2px; }
    .pace-ay-fuente { font-size: 10px; color: var(--ink-3); margin-top: 3px; letter-spacing: 0.01em; }
    .pace-ay-filas { display: grid; margin-top: 2px; }
    .pace-ay-fila { display: flex; align-items: center; gap: 8px; min-height: 22px; border-bottom: 1px solid var(--paper-3); }
    .pace-ay-fila:last-child { border-bottom: 0; }
    .pace-ay-aro { flex: none; width: 18px; height: 18px; border-radius: 50%; display: grid; place-items: center;
      background: color-mix(in srgb, var(--c) 22%, var(--paper)); border: 1.5px solid var(--c); }
    .pace-ay-aro .pace-rt-g { width: 11px; height: 11px; }
    .pace-ay-n { flex: 1; min-width: 0; font-family: var(--font-display); font-style: italic; font-size: 15px; color: var(--ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pace-ay-c { flex: none; font-size: 11px; color: var(--ink-2); font-variant-numeric: tabular-nums; }
    .pace-ay-horas { display: flex; align-items: flex-end; gap: 3px; height: 22px; margin: 5px 0 1px; }
    .pace-ay-horas i { flex: 1; background: var(--focus); border-radius: 2px 2px 1px 1px; min-height: 2px; opacity: 0.85; }
    .pace-ay-horas i.pace-ay-cero { height: 2px; background: var(--line); opacity: 0.5; }
    .pace-ay-eje { display: flex; gap: 3px; font-size: 9px; color: var(--ink-3); font-variant-numeric: tabular-nums; }
    .pace-ay-eje span { flex: 1; text-align: center; white-space: nowrap; }
    .pace-ay-pie { font-size: 10.5px; color: var(--ink-3); margin: 8px 2px 0; line-height: 1.4; }
    .pace-ay-pie + .pace-ay-pie { margin-top: 2px; }
    .pace-ay-pronto { padding: 24px 6px 10px; max-width: 30em; }
    .pace-ay-pronto .pace-ay-frase { font-size: 22px; margin-bottom: 8px; }
    .pace-ay-pronto p { font-size: 13px; color: var(--ink-2); line-height: 1.55; margin: 0; }
    @media ${PACE_CORTE_ESC} {
      .pace-ay-cab { margin-bottom: 12px; }
      .pace-ay-rejilla { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
      .pace-ay-t { padding: 13px 15px 12px; }
      .pace-ay-frase { font-size: 20px; margin: 6px 0 4px; }
      .pace-ay-nota { font-size: 12px; margin-top: 4px; }
      .pace-ay-fuente { font-size: 10.5px; margin-top: 8px; }
      .pace-ay-fila { min-height: 30px; }
      .pace-ay-aro { width: 20px; height: 20px; }
      .pace-ay-aro .pace-rt-g { width: 12px; height: 12px; }
      .pace-ay-n { font-size: 16px; }
      .pace-ay-horas { height: 54px; margin-top: 10px; }
      .pace-ay-pie { margin-top: 12px; }
      .pace-ay-pronto { padding: 54px 6px 10px; margin: 0 auto; text-align: center; }
      .pace-ay-pronto .pace-ay-frase { font-size: 28px; }
      .pace-ay-pronto p { font-size: 14px; }
    }
  `;
  document.head.appendChild(s);
})();
