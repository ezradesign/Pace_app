/* PACE · Piezas de UI del Sidebar
   ============================================================
   Las secciones que el sidebar compone, cada una autónoma y sin estado propio
   más allá del store. `Sidebar.jsx` queda como orquestador.

   LA BARRA ES UN CUADERNO (8 oct. 2026, elegido por Ez en cuatro vueltas de fotos,
   `docs/traspaso/archivos/sidebar-8oct/`). La home dice lo que toca; la barra apunta
   lo que llevas, con palabras, y abre lo que la home no abre:
     · la semana en cápsulas: cada día su tubo, lleno con sus minutos;
     · Hoy con frases («Dos horas y media de foco», «Cuatro vasos de ocho»), y el
       agua se suma desde su línea;
     · la siguiente pausa con su rótulo, o por libre lo que puedes continuar,
       repetir o hacer ahora;
     · las tres puertas a las bibliotecas (Estira no tenía ninguna);
     · el último logro con su descripción, y el pie en dos filas de texto.

   LOS GLIFOS NO SON NUEVOS. `ABBreathe`, `ABStretch`, `ABMove`, `ABDrop` y
   `ABFocus` son los de `app/main/ActivityBar.jsx`. Se leen PELADOS y al
   RENDERIZAR: `ActivityBar.jsx` carga después que este archivo, pero para
   cuando `main.jsx` monta nada, ya están todos.

   ORDEN DE CARGA: después de `Sidebar.support.jsx` (usa `sidebarStyles`) y de
   `Sidebar.selectors.js`; antes de `Sidebar.jsx`.
   ============================================================ */

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

/* El sello y los textos de un logro. El dibujo sale de `renderGlyph` --la misma
   función que la colección-- así que un glifo nuevo entra en las dos superficies a
   la vez; sin SVG propio cae al carácter del catálogo.
   EL TÍTULO Y LA DESCRIPCIÓN PASAN POR `tR`, que entra como parámetro: el catálogo
   está en castellano y el inglés es un PATCH (`app/i18n/content/achievements.js`).
   Un secreto se dice con su nombre: aquí solo llega el último logro GANADO. */
function achMini(id, tR) {
  const a = (window.ACHIEVEMENT_CATALOG || []).find(x => x.id === id);
  if (!a) return { title: id, desc: '', nodo: '✦' };
  const dibuja = window.renderGlyph;
  /* Al SVG se le da tamaño; al carácter, cuerpo de letra (un width/height lo dejaba
     pegado arriba a la izquierda). */
  const estilo = a.glyphSvg ? { width: '84%', height: '84%' } : { fontSize: '1.5em' };
  return {
    title: tR('ach.item.' + a.id + '.title', a.title),
    desc: tR('ach.item.' + a.id + '.desc', a.desc || ''),
    nodo: dibuja ? dibuja(a, estilo) : (a.glyph || '✦'),
  };
}

/* Una frase de i18n con su cantidad en tinta: «{x} de foco» con «Dos horas y media»
   en negrita. Si la frase empieza por la cantidad, la cantidad lleva la mayúscula. */
function SidebarFrase({ plantilla, x }) {
  const i = plantilla.indexOf('{x}');
  if (i < 0 || !x) return <span>{plantilla.replace('{x}', '')}</span>;
  return (
    <span>
      {plantilla.slice(0, i)}
      <b style={sidebarStyles.tinta}>{i === 0 ? sidebarMayuscula(x) : x}</b>
      {plantilla.slice(i + 3)}
    </span>
  );
}

/* ============================================================
   HOY — el cuaderno. Una línea por lo que hiciste (lo que vale cero no se
   escribe) y la del agua, que es un botón: sumar un vaso es el gesto más repetido
   del día y se hace sin abrir nada. Es la única fila que ACTÚA, y su «+ vaso» lo
   dice; no es un segundo botón, así que el objetivo es la fila entera.
   Sin nada hecho, la frase del día en blanco.
   ============================================================ */
function SidebarToday({ hoy, enBlanco, onWater }) {
  const { t, tn, lang } = useT();
  const linea = (modulo, glifo, color, minutos, clave) => (minutos ? (
    <p key={modulo} data-pace-hoy-celda data-modulo={modulo} data-cero="0" style={sidebarStyles.linea}>
      <span data-pace-hoy-ic style={{ ...sidebarStyles.lineaIc, color }}>{glifo}</span>
      <SidebarFrase plantilla={t(clave)} x={sidebarMinutosEnPalabras(minutos, lang)} />
    </p>
  ) : null);
  const agua = sidebarAguaEnPalabras(hoy.waterGlasses, hoy.waterGoal, lang);
  const xAgua = agua.xClave ? tn(agua.xClave, { m: agua.m }) : agua.x;
  const fraseAgua = sidebarMayuscula(tn(agua.clave, { m: agua.m, x: xAgua }));
  return (
    <div data-pace-hoy style={sidebarStyles.cuaderno}>
      {enBlanco ? <p data-pace-hoy-vacio style={sidebarStyles.vacioCopy}>{t('sidebar.empty')}</p> : null}
      {linea('focus', <ABFocus />, 'var(--focus)', hoy.focusMinutes, 'sidebar.hoy.focus')}
      {linea('breathe', <ABBreathe />, 'var(--breathe)', hoy.breatheMinutes, 'sidebar.hoy.breathe')}
      {linea('body', <ABMove />, 'var(--move)', hoy.bodyMinutes, 'sidebar.hoy.body')}
      <button
        data-pace-hoy-celda data-modulo="water" data-cero={hoy.waterGlasses ? '0' : '1'}
        onClick={onWater}
        aria-label={fraseAgua + '. ' + t('sidebar.water.add')}
        title={t('sidebar.water.add')}
        style={{ ...sidebarStyles.linea, ...sidebarStyles.lineaAgua }}
      >
        <span data-pace-hoy-ic style={{ ...sidebarStyles.lineaIc, color: 'var(--hydrate)' }}><ABDrop /></span>
        <SidebarFrase plantilla={tn(agua.clave, { m: agua.m })} x={xAgua} />
        <span data-pace-hoy-vaso aria-hidden="true" style={sidebarStyles.vaso}>{t('sidebar.agua.mas')}</span>
      </button>
    </div>
  );
}

/* ============================================================
   LA SIGUIENTE PAUSA, CON SU RÓTULO (Ez, 9 oct. 2026). Con un día de «A tu ritmo»
   servido: «Siguiente pausa» y «A las 12:25, Caderas de pie», con cuánto dura y de
   qué módulo debajo. Con la pausa abierta, «Tu pausa» y «Ahora, …». Por libre, el
   rótulo es lo que la tarjeta podía decir siempre --Continúa, Repetir, Para ahora--
   y debajo la rutina. El selector decide qué; esto solo lo pone en palabras.
   ============================================================ */
/* sidebarActionView: lo que dijo el selector, en palabras, o `null` si no hay nada
   que enseñar (una rutina que no se resuelve en ningún catálogo: un `routineId`
   crudo sería peor que nada). Vive AQUÍ y no en los selectores porque necesita los
   catálogos, y esos no son estado. */
function sidebarActionView(accion, t, tn, lang) {
  if (!accion) return null;
  const nombre = (id, dato) => {
    if (lang !== 'en') return dato;
    const v = t(id + '.name');
    return v !== id + '.name' ? v : dato;
  };
  if (accion.kind === 'resume') {
    const r = window.getBreatheRoutine && window.getBreatheRoutine(accion.targetId);
    if (!r) return null;
    return {
      rotulo: t('sidebar.action.continue'), antes: '', titulo: nombre(accion.targetId, r.name), modulo: 'respira',
      meta: accion.rondas ? tn('sidebar.action.resume.round', { n: accion.round, m: accion.rondas }) : t('sidebar.action.resume.meta'),
    };
  }
  if (accion.kind === 'path') {
    const camino = window.getPath && window.getPath(accion.targetId);
    if (!camino) return null;
    const pasos = (camino.steps && camino.steps.length) || 0;
    return {
      rotulo: t('sidebar.action.continue'), antes: '', titulo: camino.title || camino.name || accion.targetId, modulo: 'foco',
      meta: pasos ? tn('sidebar.action.path.meta', { n: Math.min(accion.stepIndex + 1, pasos), m: pasos }) : null,
    };
  }
  /* El módulo se le pregunta al CATÁLOGO y nunca al prefijo del id: los ids de
     Mueve y Estira van cruzados y el prefijo miente. */
  const b = (window.getBreatheRoutine && window.getBreatheRoutine(accion.targetId)) || null;
  const cuerpo = b ? null : ((window.resolveBodyRoutine && window.resolveBodyRoutine(accion.targetId)) || null);
  const c = b || (cuerpo && cuerpo.routine) || null;
  if (!c) return null;
  const titulo = nombre(accion.targetId, c.name);
  const modulo = b ? 'respira' : (cuerpo.source === 'move' ? 'mueve' : 'estira');
  if (accion.kind === 'suggest' && accion.ritmo) {
    const rt = accion.ritmo;
    const cuanto = rt.larga
      ? tn('sidebar.pausa.larga', { x: sidebarMinutosEnPalabras(rt.dur, lang) })
      : sidebarMayuscula(tn('sidebar.pausa.meta', { x: sidebarMinutosEnPalabras(rt.min, lang), m: ritmoModulo(rt.modulo, t) }));
    return {
      rotulo: t(rt.ahora ? 'sidebar.pausa.ahora' : 'sidebar.pausa'),
      antes: rt.ahora ? t('sidebar.pausa.ya') : tn('sidebar.pausa.a', { h: ritmoHora(rt.hora) }),
      titulo: titulo, meta: cuanto,
      modulo: rt.modulo === 'mueve' ? 'mueve' : (rt.modulo === 'estira' ? 'estira' : 'respira'),
    };
  }
  if (accion.kind === 'suggest') {
    return { rotulo: t('sidebar.action.now'), antes: '', titulo: titulo, meta: t('sidebar.action.now.meta'), modulo: modulo };
  }
  return { rotulo: t('sidebar.action.repeat'), antes: '', titulo: titulo, meta: t('sidebar.action.repeat.meta'), modulo: modulo };
}

const SIDEBAR_MODULO = {
  respira: ['ABBreathe', 'var(--breathe)'],
  estira:  ['ABStretch', 'var(--extra)'],
  mueve:   ['ABMove', 'var(--move)'],
  foco:    ['ABFocus', 'var(--focus)'],
};

function SidebarPrimaryAction({ accion, vista, onAct }) {
  if (!vista) return null;
  const [g, color] = SIDEBAR_MODULO[vista.modulo] || SIDEBAR_MODULO.respira;
  const Glifo = window[g];
  return (
    <div data-pace-sidebar-accion data-kind={accion.kind} style={sidebarStyles.section}>
      <div style={sidebarStyles.sectionHeaderCentro}><Meta>{vista.rotulo}</Meta></div>
      <button data-pace-sidebar-accion-boton onClick={() => onAct(accion)} style={sidebarStyles.pausa}>
        <span data-pace-sb-ic style={{ ...sidebarStyles.pausaIc, color }}>{Glifo ? <Glifo /> : null}</span>
        <span style={sidebarStyles.pausaTexto}>
          <span style={sidebarStyles.pausaFrase}>
            {vista.antes}<b data-pace-sidebar-accion-titulo style={sidebarStyles.tinta}>{vista.titulo}</b>
          </span>
          {vista.meta ? <span style={sidebarStyles.pausaMeta}>{vista.meta}</span> : null}
        </span>
        <span aria-hidden="true" style={sidebarStyles.flecha}>→</span>
      </button>
    </div>
  );
}

/* ============================================================
   LA SEMANA EN CÁPSULAS, AFINADAS (Ez, 9 oct. 2026). Cada día un tubo dibujado con
   un trazo fino, lleno con sus minutos: el tubo entero es el mejor día de la semana
   (`selectSidebarWeek().escala`). Los días pasados en un oliva claro y sólido --uno
   transparente se volvía gris sobre el beige-- y hoy en tinta entera. Debajo, la
   racha con palabras. El bloque entero es UN botón que abre Estadísticas: siete
   objetivos de 44 px no caben en 243. Los colores viven en la hoja (`Sidebar.hoja.jsx`).
   ============================================================ */
function SidebarWeek({ semana, onOpen }) {
  const { t, tn } = useT();
  const letras = t('sidebar.days').split(',');
  const n = semana.currentStreak, mejor = semana.longestStreak;
  const racha = !n ? null
    : mejor > n ? tn(n === 1 ? 'sidebar.week.rhythm.one' : 'sidebar.week.rhythm', { n, m: mejor })
    : tn(n === 1 ? 'sidebar.week.rhythm.one.sin' : 'sidebar.week.rhythm.sin', { n });
  return (
    <button data-pace-semana onClick={onOpen} aria-label={t('sidebar.week.open')} title={t('sidebar.week.open')} style={sidebarStyles.semana}>
      <span style={sidebarStyles.semDias}>
        {semana.days.map((d, i) => {
          const alto = d.active ? Math.max(8, Math.round(d.minutes / semana.escala * 40)) : 0;
          return (
            <span key={i} data-pace-semana-dia={i} data-hoy={d.isToday ? '1' : '0'} data-futuro={i > semana.todayIndex ? '1' : '0'} style={sidebarStyles.semDia}>
              <span data-pace-capsula style={sidebarStyles.capsula}>
                {alto ? <span data-pace-capsula-relleno style={{ height: alto }} /> : null}
              </span>
              <span style={{ ...sidebarStyles.semLetra, ...(d.isToday ? sidebarStyles.semLetraHoy : null) }}>{letras[i]}</span>
            </span>
          );
        })}
      </span>
      {racha ? <span style={sidebarStyles.semPie}>{racha}</span> : null}
    </button>
  );
}

/* ============================================================
   LAS BIBLIOTECAS — tres puertas. Con el día de «A tu ritmo» en pantalla la home
   no trae los botones de actividades, y a Estira solo se llegaba por una parada de
   la línea o por el menú de la pausa. La etiqueta dice lo que hace («Abrir Estira»)
   y conserva el nombre visible: así no se llama igual que el chip de la home.
   ============================================================ */
function SidebarLibraries({ onOpen }) {
  const { t, tn } = useT();
  const puertas = [
    ['breathe', 'ABBreathe', 'var(--breathe)', 'activity.breathe.label'],
    ['stretch', 'ABStretch', 'var(--extra)', 'activity.stretch.label'],
    ['move', 'ABMove', 'var(--move)', 'activity.move.label'],
  ];
  return (
    <div data-pace-bibliotecas style={sidebarStyles.puertas}>
      {puertas.map(([destino, g, tono, clave]) => {
        const Glifo = window[g];
        const etiqueta = tn('sidebar.open.module', { m: t(clave) });
        return (
          <button key={destino} data-pace-biblioteca={destino} onClick={() => onOpen(destino)} aria-label={etiqueta} title={etiqueta} style={sidebarStyles.puerta}>
            <span data-pace-sb-ic style={{ ...sidebarStyles.puertaIc, color: tono }}>{Glifo ? <Glifo /> : null}</span>
            <span>{t(clave)}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   ÚLTIMO LOGRO — uno, con su rótulo, su sello, su nombre y lo que lo ganó. La fila
   entera abre la colección; «Ver la colección» lo dice. El gancho del título es del
   TÍTULO y no de la fila, que arrastra el glifo cuando es un carácter.
   ============================================================ */
function SidebarLatestAchievement({ ultimo, onOpen }) {
  const { t, lang } = useT();
  /* El mismo `tR` que `Achievements.jsx`: en castellano manda el catálogo y en
     inglés el patch, cayendo al catálogo si la clave aún no está traducida. */
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };
  const enlace = <span style={sidebarStyles.logroEnlace}>{t('sidebar.collection')}</span>;
  if (!ultimo) {
    return (
      <button style={sidebarStyles.logroFila} onClick={onOpen} data-pace-sidebar-ultimo="">
        <span style={{ ...sidebarStyles.logroSello, opacity: 0.6 }}>·</span>
        <span style={sidebarStyles.logroTexto}>
          <span style={{ ...sidebarStyles.logroTitulo, color: 'var(--ink-3)' }}>{t('sidebar.latest.none')}</span>
          {enlace}
        </span>
      </button>
    );
  }
  const mini = achMini(ultimo.id, tR);
  return (
    <button style={sidebarStyles.logroFila} onClick={onOpen} title={mini.title} data-pace-sidebar-ultimo={ultimo.id}>
      <span style={sidebarStyles.logroSello}>{mini.nodo}</span>
      <span style={sidebarStyles.logroTexto}>
        <span style={sidebarStyles.logroTitulo} data-pace-sidebar-ultimo-titulo>{mini.title}</span>
        {mini.desc ? <span style={sidebarStyles.logroDesc}>{mini.desc}</span> : null}
        {enlace}
      </span>
    </button>
  );
}

/* ============================================================
   PIE — dos filas de texto (Ez, 8 oct. 2026): «Mis rutinas» con su sello premium,
   porque la superficie entera lo es, y «Da de pastar a la vaca» en la itálica.
   Antes eran dos píldoras y lo que más llamaba la atención de la barra era algo
   cerrado. En la app de Android no hay apoyo (`paceApoyoVisible`).
   ============================================================ */
function SidebarFooter({ onSupport, onMisRutinas }) {
  const { t } = useT();
  const apoyo = typeof paceApoyoVisible !== 'function' || paceApoyoVisible();
  return (
    <div style={sidebarStyles.footer} data-pace-sidebar-pie>
      <button style={sidebarStyles.pieFila} onClick={onMisRutinas}>
        <span>{t('sidebar.mine')}</span>
        {typeof PremiumSeal === 'function' ? <PremiumSeal style={sidebarStyles.pieSello} /> : null}
        <span aria-hidden="true" style={sidebarStyles.pieChev}>›</span>
      </button>
      {apoyo ? (
        <button style={{ ...sidebarStyles.pieFila, ...sidebarStyles.pieApoyo }} onClick={onSupport} title={t('support.sidebar.title')}>
          <span>{t('support.sidebar.label')}</span>
          <span aria-hidden="true" style={sidebarStyles.pieChev}>›</span>
        </button>
      ) : null}
      <div style={sidebarStyles.pieVersion}>
        <span style={sidebarStyles.pieVer}>Pace {PACE_VERSION}</span>
        <span style={sidebarStyles.pieFirma}>by @ezradesign</span>
      </div>
    </div>
  );
}

Object.assign(window, {
  ChevronLeftIcon,
  achMini,
  SidebarFrase,
  SidebarToday,
  sidebarActionView,
  SidebarPrimaryAction,
  SidebarWeek,
  SidebarLibraries,
  SidebarLatestAchievement,
  SidebarFooter,
});
