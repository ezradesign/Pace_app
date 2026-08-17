/* PACE - Foco - Cuerpo
   Copyright (c) 2026 ezradesign
   Licensed under the Elastic License 2.0 - see LICENSE

   TweaksPanel.support.jsx - ESTILO SIN UI del panel de Ajustes.
   Extraido de TweaksPanel.jsx en s163 al rebasar este las 500 lineas de la regla
   nº 1 de CLAUDE.md. Mismo patron que `Sidebar.support.jsx` (s148),
   `MoveSessionV1.support.jsx` y `BreatheVisual.support.jsx`: lo que sale es lo
   que no dibuja nada -- la tabla de estilos, la hoja responsive inyectada y la
   constante de transicion de las pastillas.

   LOS DOS NOMBRES VIAJAN POR `window`, y no es un descuido: en el artefacto cada
   modulo va dentro de su IIFE, asi que un `const` de este archivo NO cruza a
   TweaksPanel.jsx. Se publican y alli se referencian PELADOS -- la misma
   solucion que `sidebarStyles` en s148, con la misma razon.

   ORDEN DE CARGA: ANTES de `TweaksPanel.jsx`, que es su unico consumidor
   (comprobado: `tweaksStyles` y `TWEAKS_PILL_TRANSITION` no aparecen en ningun
   otro archivo de `app/`). Da igual respecto a `TweaksData.jsx` y
   `PremiumSection.jsx`, que traen sus propios estilos. */

/* s139 · BUG DEL BOTÓN FANTASMA — transición EXPLÍCITA, nunca `all`.
   Las cinco filas de pastillas de este panel cambian `fontWeight` 400↔500 al
   activarse, y con `transition:'all'` la transición ANIMABA EL PESO. Medido: el
   peso recorría 41 valores fraccionarios mientras el ancho solo tomaba DOS ⇒ con
   las caras ESTÁTICAS de Inter Tight (s105) el trazo saltaba a mitad de vuelo y
   la pastilla daba un tirón de ~2 px que desplazaba a su vecina.
   REGLA: si el estado cambia el `fontWeight`, se listan las propiedades. El peso
   es señal de estado, no movimiento. Mismo fix en `statsPanelTabStyles.tab`.
   Detalle medido en docs/sessions/session-139. */
const TWEAKS_PILL_TRANSITION = 'background-color 180ms, border-color 180ms, color 180ms';

/* ============================================================
   Estilos (nombres únicos). Los iconos Download/Upload y el
   estilo dataBtn viven ahora en TweaksData.jsx (split s89).
   ============================================================ */
const tweaksStyles = {
  legalLink: {
    color: 'var(--ink-3)',
    textDecoration: 'none',
    borderBottom: '1px solid var(--line)',
    paddingBottom: 1,
  },
  stepBtn: {
    width: 26, height: 26,
    display: 'grid', placeItems: 'center',
    fontSize: 14,
    color: 'var(--ink-2)',
    background: 'var(--paper-2)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-sm)',
    cursor: 'pointer',
  },
};

/* ============================================================
   CSS responsive del TweaksPanel (sesión 27 · v0.12.10).

   El TweaksPanel es el único "modal" que no usa <Modal> — es un
   panel flotante 320×auto anclado bottom-right. En móvil eso
   rompe: 320 de 375 tapa casi toda la pantalla con los bordes
   pegados a la derecha, queda un rail de 31px inútil a la izq,
   y la animación `slide-up` empuja contra el borde sin margen.

   Patrón resuelto: bottom sheet. Pegado a bottom:0 left:0 right:0,
   esquinas superiores redondeadas, sin border laterales (el border
   superior actúa como handle visual), maxHeight 72vh para que el
   backdrop oscuro de fondo (que no hay — TweaksPanel no tiene
   overlay) deje ver que la home sigue viva detrás.

   Nota: TweaksPanel no tiene backdrop, pero eso también es
   coherente con que se use como "afinador" mientras la app sigue
   funcionando. Se conserva la filosofía.
   ============================================================ */
const _paceTweaksResponsive = document.getElementById('pace-tweaks-responsive-css');
if (!_paceTweaksResponsive) {
  const s = document.createElement('style');
  s.id = 'pace-tweaks-responsive-css';
  s.textContent = `
    @media (max-width: 640px) {
      [data-pace-tweaks-panel] {
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: auto !important;
        max-height: 72vh !important;
        max-height: 72dvh !important;
        border-radius: var(--r-lg) var(--r-lg) 0 0 !important;
        border-left: 0 !important;
        border-right: 0 !important;
        border-bottom: 0 !important;
        padding: 16px 18px 24px !important;
        box-shadow: 0 -8px 32px rgba(31, 28, 23, 0.18) !important;
      }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { tweaksStyles, TWEAKS_PILL_TRANSITION });
