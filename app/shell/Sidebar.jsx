/* PACE · Sidebar izquierdo — colapsable
   Secciones: Hoy · acción principal · Esta semana · último logro. Pie con
   colección, apoyo, versión y autor.

   TROCEADO EN s148 (llegó a 570 ln; el límite de CLAUDE.md es 500) y
   REESCRITO EN s180. Este archivo es el ORQUESTADOR: compone las secciones,
   no dibuja ninguna por dentro y no decide ninguna. Lo demás vive en tres
   hermanos, con el mismo patrón que Foco (`FocusTimer` + `.support` +
   `.parts`):

     · `Sidebar.support.jsx`   → hoja responsive inyectada + `sidebarStyles`
                                 (que viaja por window: leer su cabecera)
     · `Sidebar.selectors.js`  → los cuatro selectores PUROS
     · `Sidebar.parts.jsx`     → las piezas de UI

   Los tres cargan ANTES que este archivo en PACE.html.

   QUÉ PREGUNTA RESPONDE AHORA (s180). La sidebar informaba pero ayudaba poco
   a decidir. Ahora contesta cuatro cosas: qué he hecho hoy, qué puedo
   continuar, cómo va la semana y cuál fue mi último logro. Menos panel de
   estadísticas decorativo y más brújula cotidiana.

   El ÚLTIMO LOGRO no tiene sección: vive en el pie. Ver `SidebarFooter`.

   Historial de lo eliminado (no revivir sin justificación de producto):
     - "Plan" del día — v0.11.2 (redundante con ActivityBar).
     - "Recordatorios" — v0.11.3 (no cabía sin scroll en 1920×1080).
     - "Intención" — v0.12.1 (la misma pregunta se hace en el onboarding y se
       guarda en `state.intention`).
     - Contadores pomodoros/rondas/racha — v0.28.2.
     - s180: la CIFRA GRANDE de racha (44 px), el SENDERO abstracto del día y
       la rejilla de CINCO miniaturas de logro. La racha sigue, como texto
       secundario dentro de "Esta semana".

   RESPONSIVE (sesión 22 · v0.12.5): en ≤768px el sidebar se desacopla y pasa a
   ser un drawer fullscreen por encima del main. Las reglas viven en
   `Sidebar.support.jsx`.
*/

function Sidebar() {
  const [state, set] = usePace();
  const { t, tn, lang } = useT();

  const collapsed = !!state.sidebarCollapsed;
  const isMob = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;

  const toggle = () => set({ sidebarCollapsed: !collapsed });

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
     se toca el almacén, y con guardas: en `file://` y en Capacitor el
     adaptador está inerte y el contenedor viene vacío, así que la tarjeta
     simplemente no se pinta. Eso es degradación, no error. */
  let eventos = null;
  try {
    const snap = window.paceEventsSnapshot && window.paceEventsSnapshot();
    eventos = (snap && Array.isArray(snap.events)) ? snap.events : null;
  } catch (e) { eventos = null; }

  const accion = selectSidebarPrimaryAction(state, { events: eventos });
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

  const diaEnBlanco = !hoy.focusMinutes && !hoy.breatheMinutes && !hoy.bodyMinutes && !hoy.waterGlasses;
  /* AIRE REPARTIDO (L3/L4). El sobrante se reparte ENTRE las reglas con
     `margin: auto`, en vez de acumularse al final: a 1030 px de alto el hueco
     del pie eran **389 px** y la sidebar parecia incompleta.
     `paddingBottom` en las secciones es el SUELO: con `margin:auto` a solas,
     en una pantalla justa el sobrante es 0 y las secciones quedarian pegadas
     a la regla. Asi nunca baja de la separacion de siempre. */
  /* GEOMETRIA FIJA EN ESCRITORIO (decision del usuario). El aire NO se reparte
     con la resolucion: la columna mide lo mismo en un portatil que en un
     monitor de 1440, y lo que sobra se va al final, con el pie anclado abajo.
     Se probo lo contrario -- repartirlo con `margin: auto`-- y el usuario pidio
     volver: una barra que cambia de ritmo segun la pantalla no se puede
     afinar, porque cada numero vale una cosa distinta en cada equipo.
     Estos son LOS numeros del ritmo, y estan afinados uno a uno sobre medidas:
       · `sepHoy` es la regla que separa el logo de Hoy. Sube un 20 % respecto
         a las demas, que es lo que pidio el usuario mirandolo.
       · `aireSemana` baja «Esta semana» un 15 %, para que quede mas centrada
         entre sus dos reglas. */
  const sep = { marginTop: isMob ? 10 : 14, marginBottom: isMob ? 10 : 14 };
  const sepHoy = { marginTop: isMob ? 7 : 9, marginBottom: isMob ? 10 : 14 };
  const aireSemana = { paddingTop: isMob ? 6 : 8 };
  const aire = {};
  const accionPrimero = esCajon();

  /* LAS SECCIONES SE COMPONEN Y LOS SEPARADORES VAN ENTRE ELLAS. Colgar el
     `<Divider/>` de cada bloque parece equivalente y no lo es: con la acción
     cambiando de sitio según la piel salieron DOS reglas seguidas en
     escritorio y ninguna antes de la tarjeta. Con la lista, un bloque que no
     se pinta no deja su regla huérfana, y el orden es lo único que cambia. */
  const seccionHoy = (
    <div style={{ ...sidebarStyles.section, ...aire }} key="hoy">
      <div style={sidebarStyles.sectionHeaderCentro}>
        <Meta>{t('sidebar.today')}</Meta>
        <span style={sidebarStyles.fecha}>{fechaCortaSidebar(lang)}</span>
      </div>
      {/* AGUA SUMA UN VASO AL PULSARLA, y por eso el «+» desaparece: era un
          segundo objetivo dentro de una celda de 117 px y ademas pisaba los
          ocho vasos. Es la unica celda que ACTUA en vez de navegar -- las otras
          tres abren su modulo-- y eso se dice en su etiqueta. */}
      <SidebarToday
        hoy={hoy}
        onOpen={(m) => {
          if (m === 'water') { try { addWaterGlass(1); } catch (e) { /* el store manda */ } return; }
          emitir('module', { target: m });
        }}
      />
    </div>
  );

  const seccionAccion = vistaAccion ? (
    <SidebarPrimaryAction
      key="accion"
      accion={accion}
      vista={vistaAccion}
      onAct={(a) => emitir(a.kind, { targetId: a.targetId })}
    />
  ) : null;

  /* El día en blanco solo habla cuando NO hay tarjeta: si hay algo que
     continuar, decir «tu día empieza en blanco» sería mentir. */
  const seccionVacio = (!seccionAccion && diaEnBlanco)
    ? <p style={sidebarStyles.vacioCopy} key="vacio">{t('sidebar.empty')}</p>
    : null;

  /* EL ULTIMO LOGRO RECUPERA SU ROTULO (s180, tras verlo el usuario en
     produccion): en el pie, un titulo suelto al lado de «Apoyar PACE» no dice
     que es -- «se entiende raro», con sus palabras. Vuelve a tener seccion,
     pero COMPACTA: sin la fecha y con el sello a 28 en vez de 38, que es lo
     que la maqueta pinto como L2. */
  const seccionLogro = (
    <div style={{ ...sidebarStyles.section, ...aire }} key="logro">
      <div style={sidebarStyles.sectionHeaderCentro}>
        <Meta>{t('sidebar.latest')}</Meta>
      </div>
      <SidebarLatestAchievement
        ultimo={ultimo}
        onOpen={() => window.dispatchEvent(new CustomEvent('pace:open-achievements'))}
      />
    </div>
  );

  const seccionSemana = (
    <div style={{ ...sidebarStyles.section, ...aireSemana }} key="semana">
      <div style={sidebarStyles.sectionHeaderCentro}>
        <Meta>{t('sidebar.week')}</Meta>
      </div>
      <SidebarWeek semana={semana} onOpen={() => emitir('stats')} />
    </div>
  );

  /* EN MÓVIL LA ACCIÓN VA PRIMERA. El pulgar llega antes a lo que se pulsa que
     a lo que se lee, y en un cajón a pantalla completa lo accionable no puede
     quedar debajo de cuatro cifras. En escritorio no: allí se lee de arriba
     abajo y Hoy es el contexto de la acción.
     Es orden de DOM y no `order` de CSS: s160 midió que el orden visual y el
     de foco tienen que ser el mismo, y `order` los separa. */
  /* ORDEN, elegido por el usuario mirandolo: Hoy -> Continua -> Ultimo logro
     -> Esta semana. En movil la accion se adelanta y el resto le sigue. */
  const secciones = (accionPrimero
    ? [seccionAccion, seccionHoy, seccionVacio, seccionLogro, seccionSemana]
    : [seccionHoy, seccionAccion, seccionVacio, seccionLogro, seccionSemana]
  ).filter(Boolean);

  return (
    <aside style={sidebarStyles.root} data-pace-sidebar>
      <button onClick={toggle} style={sidebarStyles.toggleFloating} data-pace-sidebar-toggle title={t('sidebar.collapse.title')} aria-label={t('sidebar.collapse.aria')}>
        <ChevronLeftIcon />
      </button>

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
          <Divider style={i === 0 ? sepHoy : sep} />
          {sec}
        </React.Fragment>
      ))}

      {/* El pie se ancla ABAJO y el sobrante queda aqui: es lo que el usuario
          eligio junto con la geometria fija. */}
      <div data-pace-sidebar-spacer style={{ flex: 1, minHeight: 14 }} />

      <SidebarFooter
        compact={isMob}
        onCollection={() => window.dispatchEvent(new CustomEvent('pace:open-achievements'))}
        onSupport={() => window.dispatchEvent(new CustomEvent('pace:open-support'))}
      />
    </aside>
  );
}

/* «Cajón» = el drawer a pantalla completa, que la hoja monta por debajo de
   768 px. No es el mismo umbral que `isMob` (640, compactación tipográfica), y
   confundirlos deja la acción arriba en una tablet que todavía ve la sidebar
   como columna. */
function esCajon() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
}

function fechaCortaSidebar(lang) {
  try {
    const loc = lang === 'en' ? 'en-GB' : 'es-ES';
    return new Date()
      .toLocaleDateString(loc, { weekday: 'short', day: 'numeric', month: 'short' })
      /* `es-ES` devuelve «mar, 1 sept»: fuera la coma y los puntos. El rotulo
         va en versalitas, asi que la puntuacion sobra. */
      .replace(/[.,]/g, '');
  } catch (e) {
    return '';
  }
}

Object.assign(window, { Sidebar, fechaCortaSidebar, esCajon });
