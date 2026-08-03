/* PACE · Piezas de UI del Sidebar — extraídas de `Sidebar.jsx` en s148
   ============================================================
   Las secciones que el sidebar compone, cada una autónoma y sin estado
   propio más allá del store: Sendero del día, WeekDots, miniaturas de logro y
   StatusBar, más el chevron. `Sidebar.jsx` queda como orquestador.

   Mismo patrón que `FocusTimer.parts.jsx` (s124) y `PathRunner.parts.jsx`
   (s80). Ver la cabecera de `Sidebar.support.jsx` para el reparto completo y
   para por qué `sidebarStyles` se referencia PELADO (viaja por window).

   ORDEN DE CARGA: después de `Sidebar.support.jsx` (usa `sidebarStyles`) y de
   `SupportModule.jsx` (StatusBar monta `<SupportButton/>`); antes de
   `Sidebar.jsx`, que compone estas piezas.

   OJO CON LOS ALIAS DE HOOKS. `useMemoSB` / `useIdSidebar` conservan su nombre
   raro a propósito: en dev, Babel standalone evalúa cada archivo con un eval
   INDIRECTO, así que un `const { useMemo } = React` top-level cae en el ámbito
   léxico GLOBAL y choca con el de cualquier otro archivo que haga lo mismo
   («Identifier already declared», y ese archivo entero deja de evaluar).
   ============================================================ */

const { useMemo: useMemoSB, useId: useIdSidebar } = React;

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

/* NOTA: los iconos Pomodoro/Rounds/Flame (v0.11.7 · sesión 12) se
   eliminaron en v0.28.2 · sesión 61 junto con el bloque de
   contadores que los usaba. Si en el futuro vuelve algún contador
   en otra ubicación, recuperar de git history.
   NOTA: ChevronRightIcon se eliminó en v0.11.6 — el sidebar colapsado
   ya no es un rail con chevron, vuelve a abrirse con el handle flotante
   que vive en main.jsx (≡). */

/* ============================================================
   Sendero del día — línea ondulada horizontal que representa
   el arco del día (6h → 22h). Los hitos son pomodoros y sesiones
   completadas hasta ahora; aparecen como puntos sobre la curva.
   B1: el sendero es ABSTRACTO — los hitos se reparten equidistantes
   como secuencia de lo hecho hoy, sin pretender cronología (antes
   se les inventaban horas). Lo único cronológico real es el puntero
   de "ahora" sobre el arco 6h→22h.
   ============================================================ */
function SenderoDelDia({ state, compact }) {
  const { t, tn } = useT();
  /* Id unico por instancia (s94): evita colisiones de clipPath global
     si el componente llegara a montarse dos veces. Mismo patron que los
     radialGradient de SenderoBar.jsx. */
  const clipId = `sendero-clip-${useIdSidebar()}`;
  const now = new Date();
  const hNow = now.getHours() + now.getMinutes() / 60;
  const start = 6;  // 6:00
  const end = 22;   // 22:00
  const fraction = Math.min(1, Math.max(0, (hNow - start) / (end - start)));

  // Hitos del día: pomodoros + sesiones (proxy desde state).
  // B1: secuencia abstracta — puntos equidistantes a lo largo de todo el
  // sendero, en orden fijo (foco → respira → cuerpo → agua). Sin horas
  // inventadas: no sabemos CUÁNDO ocurrió cada uno, solo que ocurrió.
  const hitos = useMemoSB(() => {
    const out = [];
    const cycle = state.cycle || 0;
    for (let i = 0; i < cycle; i++) out.push({ kind: 'focus' });
    /* Sesion 69 (v0.28.8): weeklyStats indexa lunes-primero. */
    const day = getDayIndexMondayFirst(new Date());
    const ws = state.weeklyStats || {};
    if ((ws.breathMinutes?.[day] || 0) > 0) out.push({ kind: 'breathe' });
    if ((ws.moveMinutes?.[day] || 0) > 0) out.push({ kind: 'move' });
    if ((ws.waterGlasses?.[day] || 0) > 0) out.push({ kind: 'water' });
    return out.map((h, i) => ({ ...h, x: (i + 1) / (out.length + 1) }));
  }, [state.cycle, state.weeklyStats]);

  const W = compact ? 180 : 240;
  const H = compact ? 36 : 46;
  const pathD = `M 0 ${H * 0.55} Q ${W * 0.2} ${H * 0.15}, ${W * 0.45} ${H * 0.55} T ${W} ${H * 0.55}`;

  const colorOf = (kind) => ({
    focus: 'var(--focus)',
    breathe: 'var(--breathe)',
    move: 'var(--move)',
    water: 'var(--hydrate)',
  })[kind] || 'var(--ink-3)';

  // "Pointer" (posición actual en la onda) — aproximación lineal en el path
  const pointerX = fraction * W;
  // Para la altura aprox del path en x: usar la misma curva cuadrática
  const pathY = (x) => {
    // valores de control para una cuadrática M-Q-T-Q chainless:
    // aquí aproximamos con dos quads empalmados. Bastante preciso para display.
    if (x <= W * 0.45) {
      const t = x / (W * 0.45);
      const y = (1 - t) * (1 - t) * (H * 0.55) + 2 * (1 - t) * t * (H * 0.15) + t * t * (H * 0.55);
      return y;
    } else {
      const t = (x - W * 0.45) / (W * 0.55);
      const y = (1 - t) * (1 - t) * (H * 0.55) + 2 * (1 - t) * t * (H * 0.95) + t * t * (H * 0.55);
      return y;
    }
  };

  return (
    <>
      <div style={sidebarStyles.sectionHeader}>
        <Meta>{t('sidebar.section.trail')}</Meta>
        <span style={sidebarStyles.sectionAside}>{hitos.length} {hitos.length === 1 ? t('sidebar.trail.hito') : t('sidebar.trail.hitos')}</span>
      </div>
      <div style={{ marginTop: 6 }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%' }}>
          {/* Camino completo (opacidad baja) */}
          <path d={pathD} stroke="var(--line-2)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {/* Camino recorrido: clip al punto actual */}
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y="0" width={pointerX} height={H} />
            </clipPath>
          </defs>
          <path d={pathD} stroke="var(--focus)" strokeWidth="1.8" fill="none" strokeLinecap="round" clipPath={`url(#${clipId})`} />
          {/* Hitos */}
          {hitos.map((h, i) => {
            const cx = h.x * W;
            const cy = pathY(cx);
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r="4.5" fill="var(--paper)" stroke={colorOf(h.kind)} strokeWidth="1.6" />
                <circle cx={cx} cy={cy} r="1.8" fill={colorOf(h.kind)} />
              </g>
            );
          })}
          {/* Puntero de "ahora" */}
          <circle cx={pointerX} cy={pathY(pointerX)} r="3" fill="var(--ink)" />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-3)', marginTop: 4, textTransform: 'uppercase' }}>
          <span>{t('sidebar.trail.hour.start')}</span>
          <span style={{ ...displayItalic, fontSize: 11, letterSpacing: 0, color: 'var(--ink-2)', textTransform: 'none' }}>{t('sidebar.trail.now')} · {String(now.getHours()).padStart(2,'0')}:{String(now.getMinutes()).padStart(2,'0')}</span>
          <span>{t('sidebar.trail.hour.end')}</span>
        </div>
      </div>
    </>
  );
}

function WeekDots({ weeklyStats, compact }) {
  const { t } = useT();
  const days = t('sidebar.days').split(',');
  const today = (new Date().getDay() + 6) % 7; // L=0
  const dotSize = compact ? 5 : 6;
  /* Sesion 69 (v0.28.8): weeklyStats ahora es lunes-primero (i=0 -> lunes).
     Eliminado el shift (i+1)%7 que rotaba desde getDay(). */
  return (
    <div style={{ display: 'flex', gap: compact ? 4 : 6, marginTop: compact ? 8 : 12 }}>
      {days.map((d, i) => {
        /* Criterio "dia activo" s69 (como YearView y la racha): cualquier
           sesion de foco|respira|cuerpo enciende el punto; agua sola NO.
           Antes solo miraba focusMinutes -- un dia de solo Respira/Mueve
           quedaba gris (s101). */
        const active = (weeklyStats.focusMinutes[i]  || 0) > 0
                    || (weeklyStats.breathMinutes?.[i] || 0) > 0
                    || (weeklyStats.moveMinutes?.[i]   || 0) > 0;
        const isToday = i === today;
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
            <div style={{
              width: dotSize, height: dotSize, borderRadius: '50%',
              background: active ? 'var(--focus)' : 'var(--line)',
              outline: isToday ? '2px solid var(--ink-2)' : 'none',
              outlineOffset: 2,
            }} />
            <span style={{ fontSize: 9, color: isToday ? 'var(--ink)' : 'var(--ink-3)', fontWeight: isToday ? 600 : 400 }}>{d}</span>
          </div>
        );
      })}
    </div>
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
     letra; centrarlo ya lo hace el `placeItems:center` del botón. */
  const estilo = a.glyphSvg ? { width: '62%', height: '62%' } : { fontSize: '2em' };
  return {
    title: a.secret ? '?' : a.title,
    nodo: dibuja ? dibuja(a, estilo) : (a.glyph || '✦'),
  };
}

function AchievementsPreview({ onOpen }) {
  const [state] = usePace();
  const { t } = useT(); // sesión 37 hotfix v0.19.1: faltaba tras migración i18n
  // Los 5 más recientes primero, por unlockedAt descendente
  const unlocked = Object.entries(state.achievements || {})
    .sort((a, b) => (b[1].unlockedAt || 0) - (a[1].unlockedAt || 0))
    .map(([id]) => id);
  const shown = 5;
  return (
    <div data-pace-sidebar-achievements style={{ display: 'grid', gridTemplateColumns: `repeat(${shown}, 1fr)`, gap: 6, marginBottom: 10 }}>
      {Array.from({ length: shown }).map((_, i) => {
        const id = unlocked[i];
        return (
          <button
            key={i}
            onClick={onOpen}
            style={{
              aspectRatio: '1/1',
              borderRadius: '50%',
              border: '1px solid var(--line)',
              background: id ? 'var(--achievement-soft)' : 'transparent',
              color: id ? 'var(--achievement)' : 'var(--ink-3)',
              display: 'grid', placeItems: 'center',
              fontSize: 10,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              cursor: 'pointer',
              transition: 'all 180ms',
            }}
            title={(id && achMini(id).title) || t('ach.seal.discover')}
          >
            {id ? achMini(id).nodo : '·'}
          </button>
        );
      })}
    </div>
  );
}

/* StatusBar: barra inferior del sidebar.

   v0.12.1 · Al quitar la sección Intención el footer gana aire,
   así que el pill "Invita a un café" ahora respira más sin
   necesitar cambiar su diseño — sigue siendo el pill delgado
   y elegante del SupportModule (decisión de sesión 16: presencia
   calmada, sin gritar). La elegancia viene del contraste con el
   espacio vacío, no de inflar el componente.

   Estructura (top → bottom):
     1. "En camino" + tag Pace (identidad / estado).
     2. Pill SupportButton — mismo diseño del sello original.
     3. Versión + autor en micro-type.
*/
function StatusBar({ compact }) {
  const [state] = usePace();
  const { t } = useT();
  const openSupport = () => window.dispatchEvent(new CustomEvent('pace:open-support'));
  return (
    <div style={{ ...sidebarStyles.footer, marginTop: compact ? 8 : 14, paddingTop: compact ? 8 : 12, gap: compact ? 6 : 10 }}>
      <div style={sidebarStyles.footerRow}>
        <Meta>{t('sidebar.status.ontrack')}</Meta>
        <Tag color="var(--breathe)">● Pace</Tag>
      </div>
      <div style={{ marginTop: compact ? 4 : 0, marginBottom: compact ? 4 : 0 }}>
        <SupportButton onOpen={openSupport} />
      </div>
      <div style={sidebarStyles.footerRow}>
        <span style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Pace {PACE_VERSION}</span>
        <span style={{ fontSize: 9, color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>by @ezradesign</span>
      </div>
    </div>
  );
}

Object.assign(window, { ChevronLeftIcon, SenderoDelDia, WeekDots, achMini, AchievementsPreview, StatusBar });
