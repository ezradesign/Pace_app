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
