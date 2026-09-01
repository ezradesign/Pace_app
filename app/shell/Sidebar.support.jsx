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
    }

    /* ============================================================
       s180 · EL RECORTE DEL LOGO, Y POR QUE VA EN CSS
       ------------------------------------------------------------
       'app/ui/pace-logo.png' es 716x471 pero su DIBUJO ocupa solo 488x194:
       medido sobre el canal alfa, hay 85 px transparentes a la izquierda,
       143 a la derecha, 123 arriba y 154 abajo, y el 93,53 % del lienzo esta
       a alfa 0. Puesto en la banda de 271 px de la sidebar eso gastaba
       178,3 px de alto de los que 104,9 eran aire, y ademas la imagen
       DESBORDABA su banda 13,7 px sin que se notara -- justamente porque lo
       que desbordaba era transparencia.

       NO se crea un 'pace-logo-sidebar.png' a proposito. El '<img
       id="pace-logo-src">' lo leen DOS consumidores ('CowLogo.jsx' y
       'OnboardingScreens.jsx'), asi que cambiarlo de sitio le tocaria el logo
       al onboarding; y anadir un segundo archivo lo inlinearia otra vez en el
       artefacto (~100 KB de base64 por un dibujo que se pinta una vez).
       Recortar por CSS deja el PNG intacto para todo el mundo.

       LA ARITMETICA (si algun dia cambia el PNG, hay que volver a medirla):
         ancho de la imagen = 716/488            = 146,72 %
         izquierda          = -85/488            = -17,42 %
         alto de la caja    = 194/488 del ancho  =  39,75 %
         arriba: la imagen mide 0,96517 W de alto y hay que subirla
                 123/471 de eso = 0,25207 W, que sobre una caja de
                 0,39754 W de alto es                -63,41 %
       ============================================================ */
    [data-pace-sidebar] [data-pace-sidebar-logo] {
      position: relative;
      overflow: hidden;
      aspect-ratio: 488 / 194;
      display: block;
    }
    /* NECESITA !important, y no es pereza: 'PaceLogoImage' pinta la <img> con
       width/maxWidth/height EN LINEA, y un estilo en linea gana a la hoja sin
       que haga falta un !important del otro lado. Medido: sin esto la caja
       recortaba (107,8 px de alto, correcto) pero el dibujo seguia a 271x178,4,
       o sea el recorte no hacia nada. Mismo mordisco que s174 con el padding
       en linea del modal. */
    [data-pace-sidebar] [data-pace-sidebar-logo] img {
      position: absolute !important;
      width: 146.72% !important;
      max-width: none !important;
      height: auto !important;
      left: -17.42% !important;
      top: -63.41% !important;
    }

    /* Hoy · rejilla 2x2. Las celdas son BOTONES: abren su modulo. Antes, para
       ir a Respira habia que salir de la sidebar. */
    [data-pace-sidebar] [data-pace-hoy] {
      display: grid; grid-template-columns: 1fr 1fr; gap: 9px;
      /* Sin esto la fila del agua crece con sus ocho vasos y la rejilla queda
         con filas de 87 y 99 px. Medido en la app, no supuesto. */
      grid-auto-rows: 1fr;
    }
    [data-pace-sidebar] [data-pace-hoy-celda] {
      border: 1px solid var(--line); border-radius: var(--r-sm);
      padding: 9px 10px 8px; background: var(--paper);
      display: flex; flex-direction: column; gap: 5px;
      min-height: 74px; width: 100%; align-items: center; text-align: center;
      transition: border-color 180ms, background 180ms;
    }
    [data-pace-sidebar] [data-pace-hoy-celda]:hover { border-color: var(--line-2); }
    [data-pace-sidebar] [data-pace-hoy-celda][data-cero="1"] { background: transparent; }
    [data-pace-sidebar] [data-pace-hoy-celda][data-cero="1"] [data-pace-hoy-ic] { opacity: 0.3; }

    /* El «+1» de agua NO puede ser hermano suelto de la celda: el grid le daria
       su propia casilla y la rejilla pasaria de cuatro a cinco. Va envuelto. */
    [data-pace-sidebar] [data-pace-hoy-agua] { position: relative; display: flex; }
    [data-pace-sidebar] [data-pace-hoy-mas] {
      position: absolute; left: 50%; transform: translateX(-50%); bottom: -2px;
      width: 44px; height: 28px; display: grid; place-items: center;
      color: var(--hydrate); font-size: 16px; border-radius: var(--r-sm);
    }
    [data-pace-sidebar] [data-pace-hoy-mas]:hover { background: var(--hydrate-soft); }

    /* La semana entera es UN objetivo. Siete de 44 px no caben: 7x44 = 308 y el
       ancho util son 243. Asi el objetivo pasa a 243 x ~59 y cuesta 0 px. */
    [data-pace-sidebar] [data-pace-semana] {
      display: block; width: 100%; text-align: left;
      border-radius: var(--r-sm); padding: 6px; margin: -6px;
    }
    [data-pace-sidebar] [data-pace-semana]:hover { background: var(--focus-soft); }

    @media (max-width: 640px) {
      /* El logo ya iba capado a 200 px desde s66; con el recorte eso son
         200 x 79,5 en vez de los 121 de alto que daba sin tope a 390 px. */
      [data-pace-sidebar] [data-pace-hoy] { gap: 8px; }
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
    /* s180: era 4, y ese 4 dejaba la regla de debajo con 14 px de hueco
       arriba contra los 10 de las otras dos. No era mas gruesa -- estaba
       mas abajo. A 0 las tres van a 10 / 10 / 10. */
    marginBottom: 0,
    minHeight: 96,
  },
  /* s180: `display` sale de aqui a proposito. El recorte del logo vive en la
     hoja (`overflow:hidden` + `aspect-ratio`), y un `display:flex` EN LINEA
     ganaria a la regla `display:block` de la hoja -- los estilos en linea
     pisan a la hoja sin necesidad de `!important`. Mismo mordisco que s174
     con el padding en linea del modal. */
  /* 80 % del ancho de la banda: es la variante A3, la que el usuario eligio
     mirando las tres. Al 100 % el dibujo salia a 271 px y su banda a 107,8;
     al 80 % son 216,8 x 86,2 y la banda vuelve a mandarla su min-height. */
  logo: { width: '80%', minWidth: 0, margin: '0 auto' },
  toggleFloating: {
    position: 'absolute',
    top: 10,
    right: 10,
    /* 24 y no 22: WCAG 2.2 AA (2.5.8) pide 24x24 de objetivo minimo y 22 se
       queda corto. TAMPOCO 44 -- que seria AAA-- porque con el logo recortado
       ya no hay margen transparente donde apoyarse: medido, a 44 el chevron
       PISA el dibujo 23 px, a 24 lo pisa 3 (el borde) y a 22 lo rozaba 1.
       Antes del recorte no se tocaban nunca: el PNG traia 54 px de aire ahi. */
    width: 24, height: 24,
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

  /* ---------- s180 ---------- */

  /* Cabecera centrada + la fecha. La fecha va al MISMO cuerpo que el rotulo
     (11 px) y no a 10: con 10 compartian linea base pero se veia mas baja,
     porque su altura de x es menor. Lo unico que la separa es el color. */
  sectionHeaderCentro: {
    display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 7,
    marginBottom: 10,
  },
  fecha: {
    fontSize: 'var(--size-meta)', letterSpacing: 'var(--track-meta)',
    textTransform: 'uppercase', color: 'var(--ink-3)', opacity: 0.75,
  },

  hoyIc:     { width: 24, height: 24, color: 'var(--ink-2)' },
  hoyNombre: { fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500 },
  hoyValor:  { fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 0.95, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', marginTop: 'auto' },
  hoyUnidad: { fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--ink-3)', marginLeft: 3 },
  hoyValorCero: { color: 'var(--ink-3)', opacity: 0.55 },

  gotas: { display: 'flex', gap: 3, justifyContent: 'center', marginTop: 2 },
  gota:  { width: 5, height: 7, borderRadius: '0 0 50% 50% / 0 0 40% 40%', border: '1px solid var(--hydrate)', opacity: 0.35 },
  gotaOn:{ background: 'var(--hydrate)', opacity: 1 },

  /* La tarjeta ENTERA es el objetivo (patron s174: el titulo lleva DENTRO el
     boton y este se extiende con un `::after`). Sin CTA suelto se ahorran
     55 px y el objetivo tactil CRECE: 243 x ~100 en vez de un boton de 44. */
  accion:        { border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '12px 14px 13px', background: 'var(--paper)', position: 'relative', overflow: 'hidden' },
  accionEyebrow: { fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 7 },
  accionTitulo:  { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 19, lineHeight: 1.2, position: 'relative', margin: 0 },
  accionBoton:   { font: 'inherit', color: 'inherit', textAlign: 'left', display: 'block' },
  accionMeta:    { fontSize: 11, color: 'var(--ink-3)', marginTop: 3, lineHeight: 1.4 },
  accionFlecha:  { position: 'absolute', right: 0, bottom: 12, color: 'var(--ink-3)', fontSize: 15 },

  semDia:   { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  semLetra: { fontSize: 9, letterSpacing: '0.08em', color: 'var(--ink-3)' },
  semPunto: { width: 6, height: 6, borderRadius: '50%', background: 'var(--line)' },
  semPie:   { fontSize: 11, color: 'var(--ink-3)', marginTop: 11 },

  /* El sello del ultimo logro, en el PIE. 20 px y no 38: ahi comparte linea
     con «Apoyar PACE» y tiene que caber sin subir el alto del pie. */
  pieSello: { width: 20, height: 20, flex: 'none', display: 'grid', placeItems: 'center', color: 'var(--ink-2)' },

  /* El pie sin boton: «Apoyar PACE» pasa a enlace y devuelve 34 px de la
     columna mas valiosa (44 del boton menos 10 del texto). */
  pieFila:   { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  pieEnlace: { fontSize: 11, color: 'var(--ink-3)', textDecoration: 'underline', textUnderlineOffset: 3 },
  pieVer:    { fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase' },

  vacioCopy: { fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5, fontStyle: 'italic', fontFamily: 'var(--font-display)', textAlign: 'center', padding: '6px 4px' },
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
