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
   SÓLO EN ESCRITORIO: en móvil la altura útil cambia con cada teléfono y un
   suelo fijo forzaría scroll donde hoy no lo hay. */
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
          .pace-heatmap-cell { width:32px !important;height:32px !important; }
          .pace-heatmap-grid { grid-template-columns:repeat(7, 32px) !important;gap:4px !important; }
          .pace-heatmap-header-day { width:32px !important;font-size:9px !important; }
          .pace-heatmap-day-num { font-size:10px !important; }
          .pace-heatmap-empty { width:32px !important;height:32px !important; }
          .pace-heatmap-totals { flex-wrap:wrap;gap:8px !important; }
        }
      

    @media (min-width: 769px) {
      [data-pace-stats-vistas] { min-height: 385px; }
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
        max-width: 820px; margin-left: auto; margin-right: auto;
      }
      [data-pace-year-cell] { width: 19px !important; height: 19px !important; border-radius: 3px !important; }
      [data-pace-year-month-lbl] { width: 19px !important; font-size: 11px !important; }
      [data-pace-year-day-lbl] { height: 19px !important; font-size: 11px !important; }

      /* LOS 13 PX QUE LE SOBRABAN A «SEMANA». Con el calendario ya compactado,
         era la unica pestana que seguia con scroll. Salen del hueco ENTRE las
         cuatro filas de barras -- 8 px x 4 = 32, que pasan a 4 x 4 = 16-- y no
         de la altura de las barras: acortar la barra cambia lo que el grafico
         dice, y el hueco entre filas no dice nada.
         El !important es porque el margen es un estilo EN LINEA del JSX. */
      [data-pace-week-bar-row] { margin-bottom: 4px !important; }
    }
  `;
  document.head.appendChild(s);
})();
