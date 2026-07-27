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
    /* Modelo "atardecer" de la HOME (s123). El tamaño del aro y la profundidad
       del solapamiento derivan de UNA sola variable, para que la tarjeta de
       Camino cruce SIEMPRE el tramo inferior del aro (nunca un gate binario que
       lo apague en pantallas bajas).

       Tamaño del aro: por ANCHO y ALTURA, con un MÍNIMO legible GENEROSO. NO se
       encoge agresivamente para que toda la home entre en pantalla — en alturas
       bajas se prefiere SCROLL vertical (data-pace-home-body). 58vh mantiene el
       aro grande (identidad "sol") sin que domine; el suelo de 300px evita que se
       vuelva diminuto; 86vw/520px son los topes de ancho y absoluto de siempre.

       Solapamiento "atardecer": ADAPTATIVO, aplicado como margin-top NEGATIVO a
       la tarjeta (ver SuggestedPathCard). Llega hasta el 19% del diámetro donde
       hay holgura (aros grandes), pero se LIMITA por el arco decorativo real bajo
       las bolas en aros pequeños para no tapar nunca el CICLO. El contenido del
       aro (modeLabel+número+subtítulo+CTA+bolas) mide ~224-250px casi fijo, así
       que el arco bajo las bolas = (diámetro - ~244)/2; el solapamiento = ese
       arco menos 6px de holgura, o el 19% si es menor. Progresivo por
       construcción: más aro => más atardecer (amplio arriba, mínimo pero visible
       abajo), garantizando >=8px de holgura bajo las bolas en todo el rango. El
       suelo de 6px evita hueco en anchos extremos (<~270px).

       Fallback vh -> dvh vía @supports: los custom properties NO admiten el
       patrón de doble declaración (una var inválida por dvh no cae a la anterior,
       queda "invalid at computed value time"), así que se re-declara bajo
       @supports (height:1dvh). Solo la home lleva estas variables y
       [data-pace-dial-fit]; Caminos conserva el marco clásico. */
    [data-pace-home-body] {
      --pace-home-timer-size: min(86vw, 520px, max(300px, 58vh));
      --pace-home-sunset-overlap: max(6px, min(calc(var(--pace-home-timer-size) * 0.19), calc((var(--pace-home-timer-size) - 244px) / 2 - 6px)));
    }
    @supports (height: 1dvh) {
      [data-pace-home-body] {
        --pace-home-timer-size: min(86vw, 520px, max(300px, 58dvh));
      }
    }
    [data-pace-dial-fit] {
      width: auto;
      height: var(--pace-home-timer-size);
    }
    /* Barra de scroll OCULTA en el contenedor vertical de la home (s123), sin
       tocar el desplazamiento: overflow-y sigue en 'auto' (rueda/trackpad/gesto
       táctil/teclado funcionan, y el foco de teclado autodesplaza el viewport).
       Solo se oculta la BARRA visual: scrollbar-width:none (Firefox),
       -ms-overflow-style:none (Edge/IE antiguos) y ::-webkit-scrollbar
       display:none (Chromium/WebKit). NO se usa overflow:hidden — el contenido
       siempre es alcanzable. Solo este contenedor; no hay scrolls internos. */
    [data-pace-home-body] {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    [data-pace-home-body]::-webkit-scrollbar {
      width: 0;
      height: 0;
      display: none;
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
      /* Main content: menos padding para ganar ancho del aro. Sin padding
         INFERIOR (s123): la base del aro debe quedar adyacente a la tarjeta de
         Camino para que el margin-top negativo del "atardecer" mida desde el
         borde del aro, no desde un padding intermedio. */
      [data-pace-main-content] {
        padding: 4px 12px 0 !important;
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
