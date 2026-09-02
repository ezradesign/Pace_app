/* PACE · Piezas de UI del Sidebar — extraídas de `Sidebar.jsx` en s148,
   reescritas en s180
   ============================================================
   Las secciones que el sidebar compone, cada una autónoma y sin estado propio
   más allá del store. `Sidebar.jsx` queda como orquestador.

   QUÉ CAMBIÓ EN s180 y por qué. La sidebar informaba pero ayudaba poco a
   decidir; ahora responde cuatro preguntas: qué he hecho hoy, qué puedo
   continuar, cómo va la semana y cuál fue mi último logro.

   LO QUE SE RETIRÓ (no revivir sin justificación de producto):
     - `SenderoDelDia`  — sendero abstracto del día. Bonito y mudo: repartía
                          hitos equidistantes que no eran cronología.
     - `AchievementsPreview` — la rejilla de CINCO miniaturas. Queda UNA, la
                          más reciente, que es la única pregunta que la
                          persona se hace («¿cuál fue el último?»).
     - `WeekDots`       — sustituido por `SidebarWeek`, que además ABRE
                          Estadísticas. Los puntos se pintan igual.
     - `StatusBar`      — el pill de apoyo ocupaba 44 px de la columna más
                          valiosa. Ahora es un enlace en el pie.

   LOS GLIFOS NO SON NUEVOS. `ABBreathe`, `ABMove` y `ABDrop` son los de
   `app/main/ActivityBar.jsx`, que el BreakMenu ya reutilizaba desde s105:
   traerlos aquí QUITA una incoherencia en vez de añadir dibujo. `ABFocus`
   nace en s180 porque Foco no tenía glifo — en la home Foco *es* el aro.
   Se leen PELADOS y al RENDERIZAR: `ActivityBar.jsx` carga después que este
   archivo, pero para cuando `main.jsx` monta nada, ya están todos.

   ORDEN DE CARGA: después de `Sidebar.support.jsx` (usa `sidebarStyles`) y de
   `Sidebar.selectors.js`; antes de `Sidebar.jsx`.

   OJO CON LOS ALIAS DE HOOKS. `useMemoSB` conserva su nombre raro a propósito:
   en dev, Babel standalone evalúa cada archivo con un eval INDIRECTO, así que
   un `const { useMemo } = React` top-level cae en el ámbito léxico GLOBAL y
   choca con el de cualquier otro archivo que haga lo mismo («Identifier
   already declared», y ese archivo entero deja de evaluar).
   ============================================================ */

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

/* Miniatura de un logro desbloqueado (s146). Antes las cinco pintaban un `✦`
   FIJO: cambiaban de color pero se veian identicas, y por eso parecian
   inactivas. Reutiliza `renderGlyph` de Achievements —la misma funcion, no una
   copia— asi que un glifo nuevo entra en las dos superficies a la vez. Sin SVG
   propio cae al caracter del catalogo (`☾`, `III`, `VII`...), que ya distingue.
   Lectura defensiva: Achievements.jsx carga DESPUES que este archivo. */
function achMini(id) {
  const a = (window.ACHIEVEMENT_CATALOG || []).find(x => x.id === id);
  if (!a) return { title: id, nodo: '✦' };
  const dibuja = window.renderGlyph;
  /* Cada rama quiere un estilo distinto. Al SVG se le da TAMAÑO (escala solo).
     Al CARACTER no: `renderGlyph` lo devuelve en un span SIN grid, así que un
     width/height lo convierte en una caja con la letra pegada arriba a la
     izquierda — se veía diminuta y descolocada. Lo que necesita es cuerpo de
     letra; centrarlo ya lo hace el `placeItems:center` del contenedor. */
  /* s180: el 62 % venia de la rejilla de cinco miniaturas, donde el sello era
     diminuto. Aqui hay UNO solo y el usuario pidio poder verlo: con el sello a
     36 px, el 72 % deja el dibujo en ~26 px -- medido, a 62 % se quedaba en
     16,1 y no se leia. */
  const estilo = a.glyphSvg ? { width: '72%', height: '72%' } : { fontSize: '1.5em' };
  return {
    title: a.secret ? '?' : a.title,
    nodo: dibuja ? dibuja(a, estilo) : (a.glyph || '✦'),
  };
}

/* ============================================================
   HOY — cuatro celdas, cada una un botón que abre su módulo.
   Antes, para ir a Respira había que salir de la sidebar.
   El glifo se apaga al 30 % cuando el valor es cero: eso distingue un día
   empezado de uno en blanco sin escribir una palabra más.
   ============================================================ */
function SidebarHoyCelda({ modulo, glifo, color, nombre, valor, unidad, onOpen, extra, etiqueta }) {
  const cero = !valor;
  const dentro = (
    <React.Fragment>
      <span data-pace-hoy-ic style={{ ...sidebarStyles.hoyIc, color: cero ? 'var(--ink-3)' : color }}>
        {glifo}
      </span>
      <span style={sidebarStyles.hoyNombre}>{nombre}</span>
      <span style={{ ...sidebarStyles.hoyValor, ...(cero ? sidebarStyles.hoyValorCero : null) }}>
        {valor}
        <span style={sidebarStyles.hoyUnidad}>{unidad}</span>
      </span>
      {extra}
    </React.Fragment>
  );

  /* FOCO NO ES UN BOTÓN, y no es un descuido. Las otras tres celdas abren su
     módulo; Foco no tiene nada que abrir porque el timer ES la home, así que
     un botón ahí sería un control que no hace nada. Se queda como dato. */
  if (!onOpen) {
    return (
      <div data-pace-hoy-celda data-modulo={modulo} data-cero={cero ? '1' : '0'} data-inerte="1">
        {dentro}
      </div>
    );
  }

  /* La ETIQUETA es «Abrir Respira», no «Respira». Dos motivos, y el primero es
     de accesibilidad: un botón debe decir lo que hace. El segundo lo destapó la
     suite -- con el nombre a secas, esta celda y el chip de la ActivityBar
     pasaban a llamarse igual y `getByRole('button', {name: /^Respira/})` dejaba
     de ser único: 15 tests en rojo, ninguno del producto. Conserva el nombre
     visible dentro (WCAG 2.5.3, «label in name»). */
  return (
    <button
      data-pace-hoy-celda
      data-modulo={modulo}
      data-cero={cero ? '1' : '0'}
      onClick={onOpen}
      aria-label={etiqueta}
      title={etiqueta}
    >
      {dentro}
    </button>
  );
}

/* Puntos de sesion. Tope de 8 a proposito: mas alla, la fila deja de contarse
   de un vistazo y se convierte en una barra. `null` (sin dato) no pinta nada --
   ver `selectSidebarTodayCounts`. */
/* LA FILA DE BOLAS SE PINTA SIEMPRE, AUNQUE ESTE VACIA (s181, pedido por el
   usuario mirandolo). Antes devolvia `null` sin sesiones, y entonces Foco,
   Respira y Cuerpo NO tenian esa fila mientras Agua SI -- sus ocho vasos van
   siempre. Como el valor lleva `marginTop: auto`, en las tres primeras caia
   al fondo de la celda y en Agua se quedaba una fila mas arriba: los cuatro
   numeros de una misma rejilla no compartian linea. Con la fila reservada
   (`minHeight` = el alto de una gota) los cuatro se alinean, y el dia que
   aparezca la primera bola nada se mueve de sitio. */
function puntosSesion(n, color) {
  const p = [];
  const cuantas = (typeof n === 'number' && n > 0) ? Math.min(n, 8) : 0;
  for (let i = 0; i < cuantas; i++) {
    p.push(<i key={i} style={{ ...sidebarStyles.sesion, background: color }} />);
  }
  return <span style={sidebarStyles.gotas}>{p}</span>;
}

function SidebarToday({ hoy, cuentas, onOpen }) {
  const { t, tn } = useT();
  const c = cuentas || {};
  const gotas = [];
  for (let i = 0; i < hoy.waterGoal; i++) {
    gotas.push(
      <i key={i} style={{ ...sidebarStyles.gota, ...(i < hoy.waterGlasses ? sidebarStyles.gotaOn : null) }} />
    );
  }
  return (
    <div data-pace-hoy>
      <SidebarHoyCelda
        modulo="focus" glifo={<ABFocus />} color="var(--focus)"
        nombre={t('sidebar.today.focus')} valor={hoy.focusMinutes} unidad={t('sidebar.unit.min')}
        extra={puntosSesion(c.focus, 'var(--focus)')}
      />
      <SidebarHoyCelda
        modulo="breathe" glifo={<ABBreathe />} color="var(--breathe)"
        nombre={t('sidebar.today.breathe')} valor={hoy.breatheMinutes} unidad={t('sidebar.unit.min')}
        etiqueta={tn('sidebar.open.module', { m: t('sidebar.today.breathe') })}
        onOpen={() => onOpen('breathe')}
        extra={puntosSesion(c.breathe, 'var(--breathe)')}
      />
      <SidebarHoyCelda
        modulo="body" glifo={<ABMove />} color="var(--move)"
        nombre={t('sidebar.today.body')} valor={hoy.bodyMinutes} unidad={t('sidebar.unit.min')}
        etiqueta={tn('sidebar.open.module', { m: t('sidebar.today.body') })}
        onOpen={() => onOpen('body')}
        extra={puntosSesion(c.body, 'var(--move)')}
      />
      {/* EL «+» SE FUE (s180, pedido mirandolo). Era un SEGUNDO objetivo dentro
          de una celda de 117 px y ademas pisaba los ocho vasos 17,2 px. Ahora
          la celda ENTERA suma el vaso, asi que el «+» sobraba: el objetivo es
          mucho mayor y no hay dos controles que distinguir.
          Es la unica celda que ACTUA en vez de navegar, y por eso su etiqueta
          no dice «Abrir Agua» sino lo que hace. */}
      <SidebarHoyCelda
        modulo="water" glifo={<ABDrop />} color="var(--hydrate)"
        nombre={t('sidebar.today.water')} valor={hoy.waterGlasses}
        unidad={tn('sidebar.unit.of', { n: hoy.waterGoal })}
        etiqueta={t('sidebar.water.add')}
        onOpen={() => onOpen('water')}
        extra={<span style={sidebarStyles.gotas}>{gotas}</span>}
      />
    </div>
  );
}

/* ============================================================
   ACCIÓN PRINCIPAL — solo puede decir CONTINUAR o REPETIR, y las dos hablan
   de algo que la persona YA hizo. Nunca «prueba esto»: si un día dijera eso
   y otro «continúa» en el mismo sitio y con la misma pinta, dejaría de ser un
   sitio fiable y sería una ranura de anuncios (decisión del usuario, s180).

   La tarjeta ENTERA es el objetivo, con el patrón de s174: el título lleva
   DENTRO el botón y este se extiende con un `::after` absoluto. Así conserva
   el encabezado en el árbol de accesibilidad —un `role="button"` en la
   tarjeta volvería presentacionales a sus descendientes y tumbó 9 tests en
   s174— y el objetivo táctil crece a ~243 × 100 en vez de un botón de 44.
   ============================================================ */
/* sidebarActionView: traduce lo que dijo el selector a lo que se pinta, o
   `null` si no hay nada que enseñar. Vive AQUÍ y no en los selectores porque
   necesita los catálogos, y esos no son estado: los selectores se quedan puros.

   Devuelve `null` también cuando la rutina no se resuelve en ningún catálogo
   —una sesión de Foco, por ejemplo, que no tiene ficha— porque enseñar un
   `routineId` crudo sería peor que no enseñar nada. El orquestador consulta
   esto ANTES de pintar el separador, así no queda una regla suelta. */
function sidebarActionView(accion, t, tn, lang) {
  if (!accion) return null;
  if (accion.kind === 'path') {
    const camino = window.getPath && window.getPath(accion.targetId);
    if (!camino) return null;
    const pasos = (camino.steps && camino.steps.length) || 0;
    return {
      kind: 'path',
      eyebrow: t('sidebar.action.continue'),
      color: 'var(--focus)',
      titulo: camino.title || camino.name || accion.targetId,
      meta: pasos ? tn('sidebar.action.path.meta', { n: Math.min(accion.stepIndex + 1, pasos), m: pasos }) : null,
    };
  }
  /* El módulo se le pregunta al CATÁLOGO y nunca al prefijo del id (s172):
     los ids de Mueve y Estira van cruzados y el prefijo miente. */
  /* Vale para `repeat` y para `suggest`: las dos nombran una rutina y las dos
     la resuelven igual, preguntando al CATALOGO y nunca al prefijo del id. */
  const b = (window.getBreatheRoutine && window.getBreatheRoutine(accion.targetId)) || null;
  const c = b || (((window.resolveBodyRoutine && window.resolveBodyRoutine(accion.targetId)) || {}).routine) || null;
  if (!c) return null;
  /* Mismo contrato que `RoutineCard`: en español manda el `name` del dato; en
     inglés se busca la clave y se cae al dato si no existe. */
  let titulo = c.name;
  if (lang === 'en') {
    const v = t(accion.targetId + '.name');
    if (v !== accion.targetId + '.name') titulo = v;
  }
  if (accion.kind === 'suggest') {
    return {
      kind: 'suggest',
      eyebrow: t('sidebar.action.now'),
      /* Tinta secundaria y no un color de modulo: una sugerencia pesa MENOS
         que algo que ya empezaste, y el rotulo es lo unico que lo dice. */
      color: 'var(--ink-3)',
      titulo: titulo,
      meta: t('sidebar.action.now.meta'),
    };
  }
  return {
    kind: 'repeat',
    eyebrow: t('sidebar.action.repeat'),
    color: b ? 'var(--breathe)' : 'var(--move)',
    titulo: titulo,
    meta: t('sidebar.action.repeat.meta'),
  };
}

function SidebarPrimaryAction({ accion, vista, onAct }) {
  if (!vista) return null;
  const eyebrow = vista.eyebrow, color = vista.color, titulo = vista.titulo, meta = vista.meta;
  return (
    <div style={sidebarStyles.accion} data-pace-sidebar-accion data-kind={accion.kind}>
      <div style={{ ...sidebarStyles.accionEyebrow, color }}>{eyebrow}</div>
      <h4 style={sidebarStyles.accionTitulo}>
        <button style={sidebarStyles.accionBoton} onClick={() => onAct(accion)}>{titulo}</button>
        <span style={sidebarStyles.accionFlecha} aria-hidden="true">→</span>
      </h4>
      {meta ? <p style={sidebarStyles.accionMeta}>{meta}</p> : null}
    </div>
  );
}

/* ============================================================
   ESTA SEMANA — los siete puntos, y el bloque ENTERO abre Estadísticas.
   Siete objetivos de 44 px no caben: 7 × 44 = 308 y el ancho útil son 243.
   Medido, cada día quedaba en 30 × 44 y además costaba 22 px de alto. Como
   un solo botón el objetivo es 243 × ~59 y cuesta 0 px.
   El criterio de «día activo» lo decide `selectSidebarWeek`, no esta pieza.
   ============================================================ */
function SidebarWeek({ semana, onOpen }) {
  const { t, tn } = useT();
  const letras = t('sidebar.days').split(',');
  return (
    <button data-pace-semana onClick={onOpen} aria-label={t('sidebar.week.open')} title={t('sidebar.week.open')}>
      <span style={{ display: 'flex', gap: 6 }}>
        {semana.days.map((d, i) => (
          <span key={i} style={sidebarStyles.semDia}>
            <span style={{ ...sidebarStyles.semLetra, color: d.isToday ? 'var(--ink)' : 'var(--ink-3)', fontWeight: d.isToday ? 600 : 400 }}>
              {letras[i]}
            </span>
            <span style={{
              ...sidebarStyles.semPunto,
              background: d.active ? 'var(--focus)' : 'var(--line)',
              outline: d.isToday ? '2px solid var(--ink-2)' : 'none',
              outlineOffset: 2,
            }} />
          </span>
        ))}
      </span>
    </button>
  );
}

/* ============================================================
   ULTIMO LOGRO — uno, no cinco, y con su ROTULO. Vivio brevemente en el pie
   por espacio y el usuario lo reporto: ahi «se entiende raro», porque sin el
   rotulo un titulo suelto al lado de «Apoyar PACE» no dice que es.
   El glifo sale de `achMini`, que reutiliza `renderGlyph`: un dibujo nuevo
   entra aqui y en la coleccion a la vez.
   ============================================================ */
function SidebarLatestAchievement({ ultimo, onOpen }) {
  const { t } = useT();
  /* «VER LA COLECCION» VIVE AQUI, no en el pie. Ahi abajo era un enlace suelto
     al lado de «Apoyar PACE» y no se sabia de que coleccion hablaba; junto al
     sello del que viene, se explica solo. Y de paso el pie recupera su sitio
     para la pill de apoyo. */
  const enlace = (
    <button style={sidebarStyles.logroEnlace} onClick={onOpen}>{t('sidebar.collection')}</button>
  );
  if (!ultimo) {
    return (
      <React.Fragment>
        <div style={sidebarStyles.logroFila} data-pace-sidebar-ultimo="">
          <span style={{ ...sidebarStyles.logroSello, opacity: 0.4 }}>·</span>
          <span style={{ ...sidebarStyles.logroTitulo, color: 'var(--ink-3)' }}>{t('sidebar.latest.none')}</span>
        </div>
        {enlace}
      </React.Fragment>
    );
  }
  const mini = achMini(ultimo.id);
  return (
    <React.Fragment>
      <button
        style={sidebarStyles.logroFila}
        onClick={onOpen}
        title={mini.title}
        data-pace-sidebar-ultimo={ultimo.id}
      >
        <span style={sidebarStyles.logroSello}>{mini.nodo}</span>
        <span style={sidebarStyles.logroTitulo}>{mini.title}</span>
      </button>
      {enlace}
    </React.Fragment>
  );
}

/* ============================================================
   PIE — «Apoyar PACE» deja de ser un pill de 44 px y pasa a enlace: devuelve
   34 px de la columna más valiosa (44 del botón menos 10 del texto).
   ============================================================ */
function SidebarFooter({ onSupport, compact, misRutinas, onMisRutinas }) {
  const { t } = useT();
  return (
    <div style={{ ...sidebarStyles.footer, marginTop: compact ? 8 : 14, paddingTop: compact ? 8 : 12, gap: compact ? 8 : 10 }}>
      {/* LA PILL NARANJA VUELVE. En v0.111.0 se degrado a enlace para ahorrar
          34 px, y con la geometria fija ese espacio existe de sobra: el sobrante
          se va al final igualmente. Es el mismo `SupportButton` del
          SupportModule -- el sello delgado de s16-- y no una copia. */}
      {/* MIS RUTINAS · atajo a las rutinas propias. Lleva el sello premium
          porque la superficie ENTERA lo es desde s93, y decirlo aqui evita
          prometer algo que luego pide pagar. Si todavia no hay ninguna, el
          destino es el CONSTRUCTOR: llevar a una lista vacia seria peor. */}
      <button style={sidebarStyles.pieMisRutinas} onClick={onMisRutinas}>
        <span>{t('sidebar.mine')}</span>
        {typeof PremiumSeal === 'function' ? <PremiumSeal /> : null}
      </button>
      {/* REGLA ENTRE «MIS RUTINAS» Y LA PILL (s181, de la referencia del
          usuario). Son dos cosas distintas -- una lleva a tu contenido, la otra
          es apoyo al proyecto-- y sin separacion se leian como una lista de dos
          botones. Va aqui y no como `borderTop` de la pill para que el pie siga
          componiendose con el `gap` de su columna. */}
      <span style={sidebarStyles.pieRegla} aria-hidden="true"></span>
      <SupportButton onOpen={onSupport} />
      <div style={sidebarStyles.pieFila}>
        <span style={sidebarStyles.pieVer}>Pace {PACE_VERSION}</span>
        <span style={{ fontSize: 9, color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>by @ezradesign</span>
      </div>
    </div>
  );
}

Object.assign(window, {
  ChevronLeftIcon,
  achMini,
  SidebarToday,
  sidebarActionView,
  SidebarPrimaryAction,
  SidebarWeek,
  SidebarLatestAchievement,
  SidebarFooter,
});
