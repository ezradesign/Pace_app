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

  /* `minHeight` = el alto exacto de una gota (7). Es lo que RESERVA la fila
     cuando todavia no hay ninguna bola, y sin ella los valores de Foco,
     Respira y Cuerpo caian 9 px por debajo del de Agua. `alignItems`
     porque las bolas de sesion miden 4 y las gotas 7: sin el, unas se
     apoyarian arriba y otras llenarian la fila. */
  gotas: { display: 'flex', gap: 3, justifyContent: 'center', alignItems: 'center', marginTop: 2, minHeight: 7 },
  /* LOS PUNTOS DE SESION NO SON LOS VASOS, y por eso no comparten forma. El
     agua tiene META (8) y sus gotas dicen «vas por 3 de 8»; Foco, Respira y
     Cuerpo no tienen meta, asi que sus puntos solo CUENTAN. Un circulo lleno
     donde el agua pone una gota hueca: mismo sitio, dos significados
     distintos, dibujos distintos. */
  sesion: { width: 4, height: 4, borderRadius: '50%', flex: 'none' },
  gota:  { width: 5, height: 7, borderRadius: '0 0 50% 50% / 0 0 40% 40%', border: '1px solid var(--hydrate)', opacity: 0.35 },
  gotaOn:{ background: 'var(--hydrate)', opacity: 1 },

  /* La tarjeta ENTERA es el objetivo (patron s174: el titulo lleva DENTRO el
     boton y este se extiende con un `::after`). Sin CTA suelto se ahorran
     55 px y el objetivo tactil CRECE: 243 x ~100 en vez de un boton de 44. */
  /* MAS AIRE ENTRE LINEAS, pedido mirandolo: sube el padding vertical y con
     el `line-height` de sus tres piezas la tarjeta pasa de 98 a ~118 px. */
  accion:        { border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '15px 14px 16px', background: 'var(--paper)', position: 'relative', overflow: 'hidden', flexShrink: 0 },
  accionEyebrow: { fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 10 },
  /* SIN `position: relative`: el `::after` del boton se posiciona contra el
     ancestro posicionado mas cercano, y ese tiene que ser la TARJETA. Con
     el h4 relativo, el objetivo se quedaba del tamanio del titulo. */
  /* FILA, no bloque: el titulo y la flecha comparten linea. Antes la flecha
     iba ABSOLUTA contra el fondo de la tarjeta y caia encima de la meta --
     medido a 1536x864: **15 px de solape horizontal y 9,3 de vertical**. Con
     un texto corto no se veia; con uno mas largo, o a otra escala de
     escritorio, si. Lo reporto el usuario a 1920x1080 con Windows al 125 %, y
     su apanio (bajar el zoom al 90 %) lo que hacia era justamente subir la
     flecha a esta linea. */
  accionTitulo:  { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 19, lineHeight: 1.35, margin: 0, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  accionBoton:   { font: 'inherit', color: 'inherit', textAlign: 'left', display: 'block' },
  accionMeta:    { fontSize: 11, color: 'var(--ink-3)', marginTop: 7, lineHeight: 1.5 },
  accionFlecha:  { flex: 'none', color: 'var(--ink-3)', fontSize: 15, lineHeight: 1 },

  semDia:   { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  semLetra: { fontSize: 9, letterSpacing: '0.08em', color: 'var(--ink-3)' },
  semPunto: { width: 6, height: 6, borderRadius: '50%', background: 'var(--line)' },
  semPie:   { fontSize: 11, color: 'var(--ink-3)', marginTop: 11 },

  /* El ultimo logro, en SECCION propia y COMPACTA (L2/L4). El sello va a 28 y
     no a 38, y no lleva fecha: «hace 2 dias» no es lo que la persona se
     pregunta -- se pregunta CUAL fue-- y esos dos recortes son los que hacen
     que la seccion quepa sin sacar nada de sitio. */
  /* CENTRADO y no a la izquierda, como el resto de la columna -- lo pidio el
     usuario viendolo junto a «Hoy» y «Esta semana», que ya van centradas. */
  /* CAJA como la de Repetir (pedido mirandolo): el logro deja de ser una fila
     suelta y comparte el lenguaje de la tarjeta de accion -- mismo borde, mismo
     radio, mismo papel. */
  logroFila:   { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%',
                 border: '1px solid var(--line)', borderRadius: 'var(--r-md)',
                 padding: '12px 14px', background: 'var(--paper)' },
  logroSello:  { width: 36, height: 36, flex: 'none', border: '1px solid var(--line)', borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'var(--ink-2)', background: 'var(--paper)', fontSize: 16 },
  /* MAS FINA Y SIN NEGRITA: el 500 lo hacia competir con el nombre de la
     rutina de la tarjeta, que es el unico titulo que deberia pesar. */
  logroTitulo: { fontSize: 12.5, fontWeight: 400, color: 'var(--ink-2)', lineHeight: 1.3, letterSpacing: '0.01em' },

  /* El pie sin boton: «Apoyar PACE» pasa a enlace y devuelve 34 px de la
     columna mas valiosa (44 del boton menos 10 del texto). */
  pieFila:   { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  /* PILL NARANJA (s181, pedido por el usuario). Antes era texto suelto al lado
     de la pill de apoyo, y las dos filas del pie no se parecian en nada aunque
     hicieran lo mismo: llevar a otro sitio. Toma la FORMA de `SupportButton`
     -- mismo radio de pill, mismo padding-- y el color de `--premium`, que es
     el token del gating y el que ya lleva el sello de dentro. El texto se
     queda en tinta secundaria: con el borde y el sello ya hay naranja de
     sobra, y ponerlo tambien en el rotulo lo hacia gritar. */
  pieMisRutinas: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                   width: '100%', minHeight: 34, fontSize: 11.5, color: 'var(--ink-2)',
                   padding: '9px 14px', background: 'var(--premium-soft)',
                   border: '1px solid var(--premium)', borderRadius: 'var(--r-pill)',
                   cursor: 'pointer', transition: 'background 220ms var(--ease)' },
  /* La regla del pie: un hilo, no un borde de nadie. Como el pie es una
     columna con `gap`, un elemento propio se separa solo por los dos
     lados y no hay que compensar margenes. */
  pieRegla: { display: 'block', height: 1, background: 'var(--line)' },
  pieEnlace: { fontSize: 11, color: 'var(--ink-3)', textDecoration: 'underline', textUnderlineOffset: 3 },
  /* «Ver la coleccion» se muda del pie a la seccion del ultimo logro: es donde
     significa algo -- al lado del sello del que viene-- y ahi el pie recupera
     su sitio para la pill de apoyo. */
  logroEnlace: { fontSize: 11, color: 'var(--ink-3)', textDecoration: 'underline', textUnderlineOffset: 3, display: 'block', margin: '10px auto 0' },
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
