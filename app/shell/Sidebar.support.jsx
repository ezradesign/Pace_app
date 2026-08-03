/* PACE · Soporte sin UI del Sidebar — extraído de `Sidebar.jsx` en s148
   ============================================================
   `Sidebar.jsx` llegó a 570 líneas (regla nº 1 de CLAUDE.md: < 500) y crecía
   sola: la tabla de deuda la anotaba en 541 y ya iba por 570. Se parte en tres
   con el patrón que el repo ya usa en Foco (`FocusTimer` + `.support` +
   `.parts`):

     · Sidebar.support.jsx  (este) → hoja responsive inyectada + `sidebarStyles`
     · Sidebar.parts.jsx           → las piezas de UI (Sendero, WeekDots,
                                     miniaturas de logro, StatusBar, chevron)
     · Sidebar.jsx                 → el orquestador y nada más

   Aquí no hay JSX ni componentes: solo la hoja de estilos que se inyecta una
   vez y el objeto de estilos inline que comparten los tres archivos.

   POR QUÉ `sidebarStyles` SE EXPONE A window
   ------------------------------------------
   Es un `const`, y en el artefacto compilado cada archivo va envuelto en su
   propia IIFE: un `const` de este archivo NO lo ve `Sidebar.parts.jsx`. El
   build solo re-expone automáticamente `function` y `var` top-level. Así que
   se publica a mano, que es la misma solución que `window.pathStepStyles`
   (decisión s80) para los estilos compartidos entre los Steps de Camino.
   Los consumidores lo referencian PELADO (`sidebarStyles.root`), no
   `window.sidebarStyles`: la resolución ocurre al RENDERIZAR, no al evaluar el
   archivo, así que no depende de quién evalúe antes — que en dev (PACE.html)
   no está garantizado, solo en el compilado.

   ORDEN DE CARGA: este archivo ANTES de `Sidebar.parts.jsx` y de `Sidebar.jsx`.
   ============================================================ */

/* Inyecta reglas responsive del sidebar una sola vez.
   Patrón ya usado en FocusTimer para spinners de number input.
   Mantiene los inline styles intactos y sólo reescribe el layout
   a partir del breakpoint móvil. */
if (typeof document !== 'undefined' && !document.getElementById('pace-sidebar-responsive-css')) {
  const s = document.createElement('style');
  s.id = 'pace-sidebar-responsive-css';
  s.textContent = `
    @media (max-width: 768px) {
      [data-pace-sidebar] {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        /* Alto del drawer fullscreen · SCROLL ASIMÉTRICO (sesión 24, v0.12.7).
           A diferencia de la home (que usa 100dvh puro para que los 4
           botones quepan siempre sin scroll), el sidebar FUERZA scroll
           latente para que el navegador móvil oculte su barra de URL
           y el contenido real (ritmo + sendero + logros + footer) tenga
           espacio para respirar. Técnica: min-height 1px por encima
           del viewport visible. Ese píxel extra activa el detector de
           scroll del navegador → auto-hide de la barra → el usuario
           recupera ~56-100px que el drawer aprovecha.
             - min-height: calc(100dvh + 1px) con fallback 100vh+1px
               — 1px invisible, no hay artefacto.
             - height: auto — el drawer se dimensiona al contenido,
               no al viewport. Sin límites artificiales.
             - max-height: none — no limitamos arriba. Si el contenido
               es más largo que el viewport, scroll natural.
             - overflow-y: auto — red de seguridad para viewports
               patológicos (landscape muy bajo).
           Coste conocido: pequeño tirón la primera vez que se abre el
           drawer (aparece con barra URL visible, el usuario desliza,
           la barra se recoge, el drawer crece). A partir del segundo
           uso con la barra ya oculta, se abre directamente expandido. */
        min-height: calc(100vh + 1px) !important;
        min-height: calc(100dvh + 1px) !important;
        height: auto !important;
        max-height: none !important;
        z-index: 60 !important;
        padding: 22px 22px !important;
        border-right: none !important;
        overflow-y: auto !important;
      }
      /* Chevron de cerrar: hit target ≥44px en móvil, más notorio */
      [data-pace-sidebar] [data-pace-sidebar-toggle] {
        top: 14px !important;
        right: 14px !important;
        width: 44px !important;
        height: 44px !important;
        opacity: 1 !important;
      }
      /* Logo bar con un poco menos de altura mínima para que quepa
         ritmo + sendero + logros + footer sin scroll en móviles medios.
         Los márgenes negativos se mantienen — el logo respira igual. */
      [data-pace-sidebar] [data-pace-sidebar-logobar] {
        min-height: 84px !important;
      }
    }
    /* s63 (v0.28.4): Compactación sidebar en móviles ≤640px.
       s64 (v0.28.5): márgenes negativos neutralizados para evitar clip lateral.
       s66 (v0.28.6): eliminado max-height + overflow:hidden que recortaban logo
       y tagline; logo limitado a max-width 200px con data-pace-sidebar-logo. */
    @media (max-width: 640px) {
      [data-pace-sidebar] [data-pace-sidebar-logobar] {
        /* Márgenes neutralizados + overflow visible para mostrar logo+tagline íntegros */
        overflow: visible !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        padding: 6px 4px !important;
      }
      [data-pace-sidebar] [data-pace-sidebar-logo] {
        max-width: 200px !important;
        width: 100% !important;
        margin: 0 auto !important;
      }
      /* Spacer flex:1 oculto: el contenido se apila desde arriba y
         el espacio sobrante queda al final, antes del footer. */
      [data-pace-sidebar] [data-pace-sidebar-spacer] {
        display: none !important;
      }
      [data-pace-sidebar] [data-pace-sidebar-achievements] {
        grid-template-columns: repeat(5, 40px) !important;
        gap: 4px !important;
        margin-bottom: 6px !important;
      }
    }
  `;
  document.head.appendChild(s);
}

const sidebarStyles = {
  root: {
    position: 'relative',  // contexto para toggleFloating (v0.11.7)
    width: 280,
    height: '100vh',
    maxHeight: '100vh',
    background: 'var(--paper-2)',
    borderRight: '1px solid var(--line)',
    padding: '18px 18px',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflowY: 'auto',
    transition: 'width 260ms var(--ease), padding 260ms var(--ease)',
  },
  /* v0.11.7 · "barra horizontal" del logo: el logo llena todo el ancho
     del sidebar (sin competencia lateral), los márgenes negativos dejan
     que invada el padding lateral de 18px para ganar más tamaño aparente.
     El chevron de colapsar sale de aquí y vive como botón flotante. */
  logoBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -14,
    marginRight: -14,
    marginTop: -4,
    marginBottom: 4,
    minHeight: 96,
  },
  logo: { width: '100%', minWidth: 0, display: 'flex', justifyContent: 'center' },
  toggleFloating: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22, height: 22,
    display: 'grid', placeItems: 'center',
    color: 'var(--ink-3)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-sm)',
    background: 'var(--paper)',
    cursor: 'pointer',
    zIndex: 2,
    opacity: 0.7,
    transition: 'opacity 180ms, color 180ms',
  },
  /* NOTA: los estilos del modo colapsado (toggleCollapsed/railItem/railBtn/railDivider)
     se eliminaron en v0.11.6. El sidebar colapsado renderiza null desde v0.11.4.
     logoRow/toggleExpanded reemplazados por logoBar/toggleFloating en v0.11.7.
     cycles/cycleCount/cycleItem/cycleNum/cycleSep eliminados en v0.28.2 (sesión 61)
     junto con el bloque de contadores. */
  section: {},
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    marginBottom: 10,
  },
  sectionAside: {
    fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'var(--ink-3)',
  },
  streakNum: {
    // Forzamos EB Garamond explícitamente (no pasa por --font-display)
    // para que este glifo — firma visual de la racha — no cambie si el
    // usuario elige otra tipografía display en Tweaks. La cifra del
    // contador es el único anclaje tipográfico de identidad del
    // sidebar; mantenerla estable es intencional. (Sesión 20.)
    fontFamily: "'EB Garamond', Georgia, serif",
    fontStyle: 'italic',
    fontSize: 44,
    fontWeight: 500,
    lineHeight: 0.9,
    color: 'var(--ink)',
  },
  streakLabel: { fontSize: 12, color: 'var(--ink-2)', fontStyle: 'italic', fontFamily: 'var(--font-display)' },
  streakSub: { fontSize: 10, color: 'var(--ink-3)', marginTop: 2 },
  linkBtn: {
    fontSize: 11,
    color: 'var(--ink-3)',
    textDecoration: 'none',
    padding: 0,
    marginTop: 4,
  },
  /* NOTA histórica: los estilos de Recordatorios (v0.11.6) e Intención
     (v0.12.1) se eliminaron aquí cuando esas secciones se quitaron del
     sidebar. Los campos `state.reminders` y `state.intention` siguen
     existiendo en state.jsx (retro-compat + captura en Welcome). */
  footer: {
    marginTop: 14,
    paddingTop: 12,
    borderTop: '1px solid var(--line)',
    display: 'flex', flexDirection: 'column', gap: 10,
  },

  footerRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
};

Object.assign(window, { sidebarStyles });
