/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   CSS responsive global del shell (sesion 82 / v0.33.2).
   Inyecta <style id="pace-main-responsive-css"> una sola vez al cargar.
   Extraido literal de main.jsx (lineas 20-112) en split mecanico s82.

   Reglas:
   - [data-pace-app-root]: alto 100vh con fallback dvh (iOS pre-15.4).
   - TopBar: reduce padding lateral y ancho de tabs en movil; oculta tabs <=768px.
   - Main content: padding reducido en movil.
   - ActivityBar: pasa de fila flex a grid 2x2 en movil; chips compactos.
   - Handle flotante ≡ del sidebar: hit target 44x44 en movil.
   - @media max-height:720: oculta sub-labels de ActivityBar.

   Carga ANTES de main.jsx en PACE.html (es config de layout, no componente).
   No expone nada a window: el side effect es la inyeccion del style block.
*/

(function injectPaceMainResponsiveCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pace-main-responsive-css')) return;
  const s = document.createElement('style');
  s.id = 'pace-main-responsive-css';
  s.textContent = `
    /* Alto del contenedor raíz: 100vh de fallback + 100dvh en navegadores
       modernos. 100dvh (dynamic viewport height) se recalcula cuando la
       barra de URL móvil aparece/desaparece, así que la app siempre
       encaja en el espacio real visible en vez de quedarse atada al
       alto máximo (con URL oculta) como hace 100vh. En desktop 1920×1080
       100dvh === 100vh — cero impacto. Fallback garantiza que navegadores
       antiguos (pre-iOS 15.4 / Chrome 107 / Firefox 100) siguen usando vh.
       Sesión 23 · v0.12.6. */
    [data-pace-app-root] {
      height: 100vh;
      height: 100dvh;
      max-height: 100vh;
      max-height: 100dvh;
    }
    @media (max-width: 768px) {
      [data-pace-topbar] {
        padding: 10px 12px !important;
        min-height: 48px !important;
        gap: 4px !important;
      }
      /* Tabs Foco/Pausa/Larga: ocultos en móvil (s46 · v0.25.0)
         BreakMenu maneja la selección post-Pomodoro en móvil. */
      [data-pace-topbar] [data-pace-tabs] {
        display: none !important;
      }
      /* Iconos top-right: hit target 40x40 */
      [data-pace-topbar] [data-pace-topbar-icon] {
        width: 40px !important;
        height: 40px !important;
      }
      /* Main content: menos padding para ganar ancho del aro */
      [data-pace-main-content] {
        padding: 4px 12px !important;
      }
      /* ActivityBar en móvil: grid 2×2, chips compactos verticales */
      [data-pace-activitybar] {
        padding: 4px 12px 14px !important;
      }
      [data-pace-activitybar-grid] {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 8px !important;
      }
      [data-pace-activitybar-chip] {
        min-width: 0 !important;
        flex: 1 1 auto !important;
        padding: 10px 12px !important;
        gap: 10px !important;
      }
      [data-pace-activitybar-chip] [data-pace-chip-label] {
        font-size: 15px !important;
      }
      [data-pace-activitybar-chip] [data-pace-chip-sub] {
        font-size: 11px !important;
      }
      /* Handle flotante ≡ para abrir sidebar: hit target ≥44px */
      [data-pace-sidebar-open] {
        width: 44px !important;
        height: 44px !important;
        top: 8px !important;
        left: 8px !important;
      }
    }
    /* Viewports muy bajos (≤700 de alto): reducir aún más la ActivityBar
       para dejar que el aro respire. Sólo afecta móvil vertical pequeño. */
    @media (max-width: 768px) and (max-height: 720px) {
      [data-pace-activitybar-chip] {
        padding: 8px 10px !important;
      }
      [data-pace-activitybar-chip] [data-pace-chip-label] {
        font-size: 14px !important;
      }
      [data-pace-activitybar-chip] [data-pace-chip-sub] {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(s);
})();
