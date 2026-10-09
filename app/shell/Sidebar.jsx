/* PACE · Sidebar izquierdo — colapsable
   La barra es un CUADERNO (8 oct. 2026, elegido por Ez en cuatro vueltas de fotos):
   la semana en cápsulas · Hoy con palabras · la siguiente pausa con su rótulo (o, por
   libre, lo que puedes continuar, repetir o hacer ahora) · las tres bibliotecas · el
   último logro. Pie con «Mis rutinas», el apoyo, la versión y el autor.

   Este archivo es el ORQUESTADOR: compone las secciones, no dibuja ninguna por
   dentro y no decide ninguna. Lo demás vive en sus hermanos, que cargan ANTES en
   PACE.html:

     · `Sidebar.hoja.jsx`      → la hoja inyectada: cajón, logo, cápsulas, escala
     · `Sidebar.escala.jsx`    → el motor de la escala (s182)
     · `Sidebar.support.jsx`   → `sidebarStyles` (viaja por window: leer su cabecera)
     · `Sidebar.selectors.js`  → los selectores PUROS y las palabras del cuaderno
     · `Sidebar.parts.jsx`     → las piezas de UI

   Lo retirado, por si alguien lo echa de menos: la rejilla de cuatro casillas de Hoy
   (decía «0 min» cuatro veces y parecía un panel de control), la tarjeta con caja de
   la pausa (repetía la línea de la home, y «Llevas tres bloques y dos pausas» repetía
   el aro) y las dos píldoras del pie. Antes: el plan del día, los recordatorios, la
   intención, los contadores, el sendero y la rejilla de cinco logros.

   RESPONSIVE: en la piel de móvil la barra es un cajón a pantalla completa por
   encima de la home (`Sidebar.hoja.jsx`) y cabe entera con la misma composición.
*/

function Sidebar() {
  const [state, set] = usePace();
  const { t, tn, lang } = useT();

  const collapsed = !!state.sidebarCollapsed;
  const isMob = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;

  const toggle = () => set({ sidebarCollapsed: !collapsed });

  /* LA ESCALA · la columna entera encoge para caber, en las DOS pieles.
     El motor vive en `Sidebar.escala.jsx` (s182): son ~200 lineas de
     geometria medida, y este archivo es el ORQUESTADOR. Devuelve la ref que
     hay que colgar de la envoltura que escala. */
  const escalaRef = useSidebarEscala();

  /* s200 · los eventos viven en IndexedDB, que solo es asincrono: la tarjeta
     los lee de un espejo en memoria, y este aviso la repinta cuando el espejo
     cambia (el arranque lo carga despues del primer render). */
  const [, repintarEventos] = React.useState(0);
  React.useEffect(function () {
    const alCambiar = function () { repintarEventos(function (n) { return n + 1; }); };
    window.addEventListener('pace:eventos', alCambiar);
    return function () { window.removeEventListener('pace:eventos', alCambiar); };
  }, []);

  /* Colapsado → ocultar TOTALMENTE.
     La re-expansión se hace con un botón flotante que renderiza <PaceApp/>.
     (Antes era un rail de 56px con iconos; se quitó por petición del usuario
     para tener pantalla limpia como la referencia del 2026-04-22 / sesión 9.
     s180 se planteó devolverlo con los glifos nuevos y NO se hizo: sigue
     siendo una decisión suya, no un olvido.) */
  if (collapsed) return null;

  const hoy = selectSidebarToday(state);
  const semana = selectSidebarWeek(state);
  const ultimo = selectSidebarLatestAchievement(state);

  /* Los eventos entran POR PARÁMETRO al selector, que es puro. Aquí es donde
     se toca el almacén, y con guardas: en `file://` el adaptador está
     inerte y el contenedor viene vacío, así que la tarjeta
     simplemente no se pinta. Eso es degradación, no error. */
  let eventos = null;
  try {
    const snap = window.paceEventsSnapshot && window.paceEventsSnapshot();
    eventos = (snap && Array.isArray(snap.events)) ? snap.events : null;
  } catch (e) { eventos = null; }

  /* El día local que la app escribe, para que la sugerencia rote con él. */
  const hoyISO = (function () {
    const d = new Date();
    const dd = n => (n < 10 ? '0' : '') + n;
    return d.getFullYear() + '-' + dd(d.getMonth() + 1) + '-' + dd(d.getDate());
  })();

  /* LA SUGERENCIA REUTILIZA LA REGLA DE LA BIBLIOTECA (`libraryParaAhora`), no
     una propia: ya rota por dia, ya ordena por duracion y su pozo es «lo que
     puedes hacer donde estas». Inventar otra habria sido un segundo criterio
     para la misma pregunta.
     EL POZO ES CUERPO (Mueve + Estira) Y FILTRADO POR ACCESO: ninguna de esas
     rutinas lleva `safety`, y el guard central quita las premium bloqueadas,
     asi que la tarjeta no puede ofrecer algo que no se puede abrir. */
  const sugerencia = (function () {
    try {
      if (typeof libraryParaAhora !== 'function') return null;
      const todas = [];
      [window.MOVE_ROUTINES, window.EXTRA_ROUTINES].forEach(function (cat) {
        Object.keys(cat || {}).forEach(function (g) {
          ((cat[g] || {}).items || []).forEach(function (r) { todas.push(r); });
        });
      });
      const abiertas = todas.filter(function (r) {
        if (r.safety) return false;
        return !window.canAccessRoutine || window.canAccessRoutine(r.id);
      });
      const elegidas = libraryParaAhora(abiertas, hoyISO, 1);
      return (elegidas && elegidas[0] && elegidas[0].id) || null;
    } catch (e) { return null; }
  })();

  /* s186 · el registro de una sesion de Respira interrumpida. Se lee aqui, en
     el cuerpo, igual que `sugerencia`: no es estado de la app sino una nota en
     su propia clave, y la sidebar se re-renderiza al volver a la home, que es
     cuando puede haber cambiado. */
  const reanudable = (window.leerRespiraGuardada && window.leerRespiraGuardada()) || null;
  /* s192 · con «A tu ritmo», la siguiente pausa del día (state-ritmo.jsx). */
  const ritmo = (typeof ritmoSiguiente === 'function') ? ritmoSiguiente(state) : null;
  /* ¿La home enseña «A tu ritmo»? El día servido o la pregunta ya contestada por la
     semana; por libre, no. */
  const R = (typeof ritmoDe === 'function') ? ritmoDe(state) : null;
  const conRitmo = !!(R && !R.libre && (R.dia || R.propuesta));
  const accion = selectSidebarPrimaryAction(state,
    { events: eventos, sugerencia: sugerencia, reanudable: reanudable, ritmo: ritmo, conRitmo: conRitmo });
  const vistaAccion = sidebarActionView(accion, t, tn, lang);

  /* CERRAR EL CAJON AL ELEGIR (solo movil). En escritorio la sidebar convive
     con lo que abre; en movil es un drawer a pantalla completa y quedarse
     abierto te tapa justo lo que acabas de pedir. `sidebarCollapsed` es el
     mismo estado que usa su chevron, asi que reabrirlo funciona igual. */
  const emitir = (kind, extra) => {
    window.dispatchEvent(
      new CustomEvent('pace:sidebar-action', { detail: Object.assign({ kind: kind }, extra || {}) })
    );
    if (esCajon()) set({ sidebarCollapsed: true });
  };

  /* El día en blanco lo dice una frase, salvo si hay una sesión a medias: decir
     «tu día empieza en blanco» encima de «Continúa» sería mentir. */
  const sinMinutos = !hoy.focusMinutes && !hoy.breatheMinutes && !hoy.bodyMinutes;
  const enBlanco = sinMinutos && !(accion && accion.kind === 'resume');
  /* GEOMETRÍA FIJA EN ESCRITORIO (decisión del usuario): el aire no se reparte con
     la resolución y lo que sobra se va al final, con el pie anclado abajo. El margen
     de las reglas es 12 (9 en el móvil estrecho) y de él depende la simetría del
     logo: ver `logoBar` en `Sidebar.support.jsx`. */
  const sep = { marginTop: isMob ? 9 : 12, marginBottom: isMob ? 9 : 12 };

  /* LAS SECCIONES SE COMPONEN Y LOS SEPARADORES VAN ENTRE ELLAS. Colgar el
     `<Divider/>` de cada bloque parece equivalente y no lo es: un bloque que no se
     pinta (la pausa, cuando no hay nada que ofrecer) dejaba su regla huérfana y
     salían dos reglas seguidas. Con la lista, eso no puede pasar. */
  const seccionHoy = (
    <div style={sidebarStyles.section} key="hoy">
      <div style={sidebarStyles.sectionHeaderCentro}>
        <Meta>{t('sidebar.today')}</Meta>
        <span style={sidebarStyles.fecha}>{fechaCortaSidebar(lang)}</span>
      </div>
      <SidebarToday
        hoy={hoy}
        enBlanco={enBlanco}
        onWater={() => { try { addWaterGlass(1); } catch (e) { /* el store manda */ } }}
      />
    </div>
  );

  const seccionAccion = vistaAccion ? (
    <SidebarPrimaryAction
      key="accion"
      accion={accion}
      vista={vistaAccion}
      onAct={(a) => emitir(a.kind, { targetId: a.targetId, ritmo: !!a.ritmo })}
    />
  ) : null;

  /* LAS BIBLIOTECAS: con «A tu ritmo» en la home no hay botones de actividades, y
     esta es la única puerta que abre las tres desde cualquier sitio. */
  const seccionBibliotecas = (
    <div style={sidebarStyles.section} key="bibliotecas">
      <div style={sidebarStyles.sectionHeaderCentro}>
        <Meta>{t('sidebar.libraries')}</Meta>
      </div>
      <SidebarLibraries onOpen={(destino) => emitir('module', { target: destino })} />
    </div>
  );

  /* El último logro con su rótulo: sin él, un título suelto «se entiende raro». */
  const seccionLogro = (
    <div style={sidebarStyles.section} key="logro">
      <div style={sidebarStyles.sectionHeaderCentro}>
        <Meta>{t('sidebar.latest')}</Meta>
      </div>
      <SidebarLatestAchievement
        ultimo={ultimo}
        onOpen={() => window.dispatchEvent(new CustomEvent('pace:open-achievements'))}
      />
    </div>
  );

  /* La semana va sin rótulo: siete cápsulas con la inicial de cada día ya se leen
     como una semana. El nombre vive en el `aria-label` del botón. */
  const seccionSemana = (
    <div style={sidebarStyles.section} key="semana">
      <SidebarWeek semana={semana} onOpen={() => emitir('stats')} />
    </div>
  );

  /* EL MISMO ORDEN EN LAS DOS PIELES (9 oct. 2026). En el móvil la tarjeta iba
     primera para que el pulgar llegara antes; con el cuaderno la pausa queda a media
     pantalla y el cajón cabe entero a 360x640 (medido: al 81 %, cuando la barra de
     antes se quedaba en el suelo del 80 % con 44 px fuera). El orden lo trae el DOM
     y no `order` de CSS: el visual y el de foco tienen que ser el mismo (s160). */
  const secciones = [seccionSemana, seccionHoy, seccionAccion, seccionBibliotecas, seccionLogro].filter(Boolean);

  return (
    <aside style={sidebarStyles.root} data-pace-sidebar data-escalado="0">
      <button onClick={toggle} style={sidebarStyles.toggleFloating} data-pace-sidebar-toggle title={t('sidebar.collapse.title')} aria-label={t('sidebar.collapse.aria')}>
        <ChevronLeftIcon />
      </button>

      {/* LA COLUMNA ENTERA SE ESCALA PARA CABER (s181, decision del usuario:
          «si hay que hacer a la vez pequenos a TODOS los elementos, perfecto»).
          Lo que se conserva no es un tamano sino la COMPOSICION: la sidebar se
          ve igual en cualquier pantalla, solo que mas pequena donde no cabe.
          Sustituye a la compactacion que se probo antes -- apurar aire cambiaba
          las proporciones, y era justo lo que el usuario no queria.
          EL CHEVRON SE QUEDA FUERA a proposito: es un control, no contenido, y
          s180 lo fijo en 24 px por WCAG 2.2 AA (2.5.8). Escalarlo lo bajaria de
          ese minimo en cuanto la pantalla apretara. */}
      <div data-pace-sidebar-lente>
      <div data-pace-sidebar-escala ref={escalaRef}>
      {/* LOGO · el área sigue siendo clicable para el easter egg
          "vaca feliz" (10 clicks → secret.cow.click). El recorte del margen
          transparente lo hace la hoja; ver su cabecera. */}
      <div style={sidebarStyles.logoBar} data-pace-sidebar-logobar>
        <div
          style={{ ...sidebarStyles.logo, cursor: 'pointer' }}
          data-pace-sidebar-logo
          onClick={() => window.dispatchEvent(new CustomEvent('pace:cow-click'))}
          title={t('sidebar.logo.title')}
        >
          <PaceWordmark variant={state.logoVariant} color="var(--ink)" />
        </div>
      </div>

      {secciones.map((sec, i) => (
        <React.Fragment key={'s' + i}>
          {/* TODAS LLEVAN SU REGLA, INCLUIDA LA PRIMERA. Decidido en s180
              mirandolo, y RECONFIRMADO en s181 contra la referencia que trajo
              el usuario: entre el logo y la semana va regla. (En s181 llegue a
              quitarla leyendo mal una captura suya; la siguiente, con su «asi
              esta perfecto», la mostraba puesta.) El logo mantiene su simetria
              -- 25,5 px arriba del dibujo y 25,5 hasta esta regla-- y ese
              numero SE APOYA en el margen de aqui: ver `logoBar`. */}
          <Divider style={sep} />
          {sec}
        </React.Fragment>
      ))}

      {/* El pie se ancla ABAJO y el sobrante queda aqui: es lo que el usuario
          eligio junto con la geometria fija. */}
      <div data-pace-sidebar-spacer style={{ flex: 1, minHeight: 0 }} />

      <SidebarFooter
        onMisRutinas={() => emitir('custom')}
        onSupport={() => window.dispatchEvent(new CustomEvent('pace:open-support'))}
      />
      </div>
      </div>
    </aside>
  );
}

/* «Cajón» = el drawer a pantalla completa, que la hoja monta en la PIEL DE MÓVIL.
   No es el mismo umbral que `isMob` (640, compactación tipográfica): de este dependen
   que el cajón se cierre al elegir y de dónde saca la escala el alto disponible.
   El corte lo manda `_responsive.corte.js`, que mete también las pantallas verticales
   de hasta 1024: una tableta vertical SÍ lleva cajón. */
function esCajon() {
  return typeof paceEsMovil === 'function' ? paceEsMovil() : false;
}

function fechaCortaSidebar(lang) {
  try {
    /* paceFechaCorta (useT.jsx) deja «Sep» en inglés, como Estadísticas. */
    return paceFechaCorta(new Date(), lang, { weekday: 'short', day: 'numeric', month: 'short' })
      /* `es-ES` devuelve «mar, 1 sept»: fuera la coma y los puntos. El rotulo
         va en versalitas, asi que la puntuacion sobra. */
      .replace(/[.,]/g, '');
  } catch (e) {
    return '';
  }
}

Object.assign(window, { Sidebar, fechaCortaSidebar, esCajon });
