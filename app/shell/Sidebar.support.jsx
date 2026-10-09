/* PACE · Soporte sin UI del Sidebar — extraído de `Sidebar.jsx` en s148
   ============================================================
   `Sidebar.jsx` llegó a 570 líneas (regla nº 1 de CLAUDE.md: < 500) y crecía
   sola: la tabla de deuda la anotaba en 541 y ya iba por 570. Se parte en tres
   con el patrón que el repo ya usa en Foco (`FocusTimer` + `.support` +
   `.parts`):

     · Sidebar.hoja.jsx            → la hoja CSS inyectada (se separo en s181,
                                     cuando este archivo paso de 500 lineas)
     · Sidebar.support.jsx  (este) → `sidebarStyles`, los estilos en linea
     · Sidebar.parts.jsx           → las piezas de UI (Sendero, WeekDots,
                                     miniaturas de logro, StatusBar, chevron)
     · Sidebar.jsx                 → el orquestador y nada más

   Aquí no hay JSX ni componentes: solo el objeto de estilos en línea que
   comparten los demás archivos. La hoja inyectada se fue a `Sidebar.hoja.jsx`.

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

   ORDEN DE CARGA: `Sidebar.hoja.jsx` antes que este, y este ANTES de
   `Sidebar.parts.jsx` y de `Sidebar.jsx`.
   ============================================================ */

const sidebarStyles = {
  root: {
    position: 'relative',  // contexto para toggleFloating (v0.11.7)
    width: 280,
    height: 'calc(100 * var(--pace-vh, 1vh))',
    maxHeight: 'calc(100 * var(--pace-vh, 1vh))',
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
    /* AIRE DEL LOGO, reportado por el usuario y medido antes de tocarlo:
       tenia 18,9 px por encima del dibujo y 14,9 hasta la regla de abajo --
       apretado por abajo, que es justo lo que dijo. Con `marginTop: 0` (era
       -4) y `marginBottom: 8` (era 0) quedan **22,9 y 22,9**, simetricos.
       El -4 y el 0 venian de igualar el hueco de las tres reglas; eso se
       conserva, porque lo que cambia es el aire DEL LOGO, no el de la regla. */
    /* EL LOGO SUBE UN 12 % (pedido mirandolo). El aire sobre el dibujo eran
       31,6 px = 18 de padding + 13,6 de la holgura dentro de la banda; un 12 %
       menos son 27,8, y salen de devolver el `marginTop` a -4. El de abajo se
       queda en 8: ese lado ya estaba bien. */
    /* -6 y no -4: la simetria del logo depende del margen de la regla, y ese
       bajo de 14 a 12 para que la columna entera quepa en 1536x714. Arriba del
       dibujo hay 18 de padding − 6 + 13,5 de holgura = 25,5; abajo, 13,5 + 12
       de la regla = 25,5. Si se vuelve a tocar el ritmo, este numero se
       recalcula: no es decorativo. */
    marginTop: -6,
    /* SIMETRIA DEL LOGO, sin regla debajo (idea del usuario). Arriba del dibujo
       hay 27,5 px = 18 de padding − 4 de este margen + 13,5 de holgura dentro
       de la banda. Abajo tiene que dar lo mismo: 13,5 de holgura + 14 = 27,5.
       Antes eran 43,5 (13,5 + 6 + 9 + la regla + 14), asi que ademas se
       ahorran 16 px de altura. Con «Esta semana» abriendo la columna, los 27,5
       de abajo se miden hasta SU REGLA, no hasta un texto. */
    /* CERO, y el numero sale de una suma: hasta la regla de «Esta semana» hay
       13,5 de holgura dentro de la banda + este margen + los 12 del margen
       superior de la regla. Para que de los mismos 25,5 que arriba, este tiene
       que ser 0.
       COMPROBADO EN s181: al quitar la regla (por una lectura mia equivocada de
       una captura) el aire de abajo cayo a 13,5 contra 25,5 arriba, o sea que
       este numero depende de ESA regla y no es decorativo. Si algun dia se
       retira de verdad, aqui van 12. */
    marginBottom: 0,
    minHeight: 96,
  },
  /* s180: `display` sale de aqui a proposito. El recorte del logo vive en la
     hoja (`overflow:hidden` + `aspect-ratio`), y un `display:flex` EN LINEA
     ganaria a la regla `display:block` de la hoja -- los estilos en linea
     pisan a la hoja sin necesidad de `!important`. Mismo mordisco que s174
     con el padding en linea del modal. */
  /* 64 % del ancho de la banda. Historia corta: el usuario eligio 80 % mirando
     las tres variantes (A3), y al verlo en su pantalla pidio **un 20 % menos**
     -- 80 x 0,8 = 64. En numeros: el dibujo pasa de 216,9 x 86,2 a 173,6 x 69,0
     y, como la banda la manda su `min-height: 96`, el aire interior sube de
     4,9 a 13,5 px por lado. En movil NO aplica: por debajo de 640 el tope de
     200 px de s66 gana, y ese no se toca. */
  logo: { width: '64%', minWidth: 0, margin: '0 auto' },
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

  /* ---------- el cuaderno (8 oct. 2026) ----------
     Los números salen de la página de Ez (`docs/traspaso/archivos/sidebar-8oct/
     cuaderno.js`), medidos en la app: a 1280x800 la barra entera cabe sin encoger. */

  /* Cabecera centrada + la fecha. La fecha va al MISMO cuerpo que el rotulo
     (11 px) y no a 10: con 10 compartian linea base pero se veia mas baja,
     porque su altura de x es menor. Lo unico que la separa es el color. */
  sectionHeaderCentro: {
    display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 7,
    marginBottom: 9,
  },
  fecha: {
    fontSize: 'var(--size-meta)', letterSpacing: 'var(--track-meta)',
    textTransform: 'uppercase', color: 'var(--ink-3)', opacity: 0.75,
  },

  /* La cantidad de cada frase va en tinta entera; el resto, en la secundaria. */
  tinta: { fontWeight: 500, color: 'var(--ink)' },

  /* HOY: una línea por módulo, en la itálica de los títulos. `textWrap` reparte
     en dos líneas iguales la frase que no quepa («Dos horas y 43 minutos
     moviéndote»), en vez de dejar una palabra sola abajo. */
  cuaderno:  { display: 'flex', flexDirection: 'column', gap: 5, padding: '0 2px' },
  linea:     { display: 'flex', alignItems: 'center', gap: 10, margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic',
               fontSize: 17, lineHeight: 1.25, color: 'var(--ink-2)', textWrap: 'balance' },
  lineaIc:   { width: 16, height: 16, flex: 'none', display: 'inline-grid', placeItems: 'center' },
  /* La línea del agua es un botón: hereda la línea y se quita lo de botón. */
  lineaAgua: { width: '100%', textAlign: 'left', background: 'none', border: 0, padding: 0, cursor: 'pointer' },
  vaso:      { marginLeft: 'auto', flex: 'none', fontFamily: 'var(--font-ui)', fontStyle: 'normal', fontSize: 11, lineHeight: 1.2,
               color: 'var(--hydrate)', border: '1px solid var(--hydrate)', borderRadius: 'var(--r-pill)', padding: '3px 9px',
               whiteSpace: 'nowrap', background: 'var(--hydrate-soft)' },
  vacioCopy: { margin: '0 0 4px', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, lineHeight: 1.4,
               color: 'var(--ink-3)', textAlign: 'center', padding: '0 6px', textWrap: 'balance' },

  /* LA PAUSA: el glifo de su módulo, la frase con la rutina en tinta, debajo cuánto
     dura, y la flecha. La fila entera es el botón. */
  pausa:      { display: 'grid', gridTemplateColumns: '16px minmax(0, 1fr) auto', gap: 10, alignItems: 'start', width: '100%',
                padding: '0 2px', textAlign: 'left', background: 'none', border: 0, cursor: 'pointer', color: 'inherit' },
  pausaIc:    { width: 16, height: 16, marginTop: 3, display: 'inline-grid', placeItems: 'center' },
  pausaTexto: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  pausaFrase: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 17, lineHeight: 1.25, color: 'var(--ink-2)' },
  pausaMeta:  { fontFamily: 'var(--font-ui)', fontSize: 11.5, color: 'var(--ink-3)' },
  flecha:     { color: 'var(--ink-3)', fontSize: 15, alignSelf: 'center' },

  /* LA SEMANA: siete cápsulas de 7 x 40. El trazo y los colores, en la hoja. */
  semana:      { color: 'inherit' },
  semDias:     { display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' },
  semDia:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  capsula:     { display: 'flex', flexDirection: 'column-reverse', overflow: 'hidden', width: 7, height: 40, borderRadius: 3.5 },
  semLetra:    { fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--ink-3)', lineHeight: 1 },
  semLetraHoy: { color: 'var(--ink)', fontWeight: 600 },
  semPie:      { display: 'block', textAlign: 'center', marginTop: 6, fontFamily: 'var(--font-display)', fontStyle: 'italic',
                 fontSize: 14, color: 'var(--ink-2)' },

  /* LAS BIBLIOTECAS: tres puertas en una fila, el glifo al lado del nombre. En la serif
     de los títulos pero de pie, como Ez las vio: son nombres, no frases del cuaderno. */
  puertas:  { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 },
  puerta:   { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 36, padding: '7px 0',
              borderRadius: 'var(--r-md)', fontFamily: 'var(--font-display)', fontStyle: 'normal', fontSize: 15,
              color: 'var(--ink)', background: 'none', border: 0, cursor: 'pointer' },
  puertaIc: { width: 18, height: 18, flex: 'none', display: 'inline-grid', placeItems: 'center' },

  /* EL ÚLTIMO LOGRO: sello de 46 con el trazo legible (la hoja lo pinta a 1,2 px:
     a 26 px «Ciclo completo» era un círculo vacío), nombre, descripción y enlace. */
  logroFila:   { display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', background: 'none',
                 border: 0, padding: 0, cursor: 'pointer', color: 'inherit' },
  logroSello:  { width: 46, height: 46, flex: 'none', border: '1px solid var(--line)', borderRadius: '50%', display: 'grid',
                 placeItems: 'center', color: 'var(--ink-2)', background: 'var(--paper)', fontSize: 16 },
  logroTexto:  { display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 },
  logroTitulo: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, lineHeight: 1.2, color: 'var(--ink)' },
  logroDesc:   { fontFamily: 'var(--font-ui)', fontSize: 11.5, lineHeight: 1.35, color: 'var(--ink-3)' },
  logroEnlace: { fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink-3)', textDecoration: 'underline',
                 textUnderlineOffset: 3, marginTop: 2 },

  /* EL PIE: dos filas de texto y la versión. */
  footer:     { display: 'flex', flexDirection: 'column', gap: 2, borderTop: '1px solid var(--line)', paddingTop: 8, marginTop: 12 },
  pieFila:    { display: 'flex', alignItems: 'center', gap: 8, width: '100%', minHeight: 32, padding: '7px 2px', textAlign: 'left',
                fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-2)', background: 'none', border: 0, cursor: 'pointer' },
  pieApoyo:   { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14 },
  pieChev:    { marginLeft: 'auto', color: 'var(--ink-3)' },
  pieSello:   { fontSize: 9, padding: '2px 7px' },
  pieVersion: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 },
  pieVer:     { fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase' },
  pieFirma:   { fontSize: 9, color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'var(--font-display)' },

  footerRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
};

Object.assign(window, { sidebarStyles });
