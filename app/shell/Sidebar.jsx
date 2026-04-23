/* PACE · Sidebar izquierdo — colapsable
   Secciones: Ritmo (racha), Sendero (línea del día con hitos), Logros.
   Footer: StatusBar con botón destacado Donar café.

   Historial de lo eliminado (no revivir sin justificación de producto):
     - "Plan" del día — v0.11.2 (redundante con ActivityBar).
     - "Recordatorios" — v0.11.3 (no cabía sin scroll en 1920×1080).
     - "Intención" — v0.12.1 (aporta poco valor; la misma pregunta se
       hace al usuario nuevo en el WelcomeModal, que la guarda en
       `state.intention`. Quitarla libera espacio vertical y deja que
       el botón de Donar gane prominencia en el footer).

   RESPONSIVE (sesión 22 · v0.12.5):
     En ≤768px el sidebar se desacopla y pasa a ser un drawer
     fullscreen por encima del main (position:fixed; inset:0;
     width:100vw). El bug previo era width:280px que dejaba un
     trozo del main visible a la derecha en móvil. Ahora el main
     sigue ocupando 100vw debajo pero el sidebar lo tapa entero
     cuando se abre. Se añade un chevron grande (hit target
     ≥44px) en esquina superior derecha para cerrar.
*/

const { useState: useStateSB, useMemo: useMemoSB } = React;

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
        /* Alto del drawer fullscreen: 100vh de fallback, 100dvh en
           navegadores modernos. 100dvh (dynamic viewport height)
           descuenta la barra de URL cuando está visible, así que el
           contenido del sidebar cabe sin scroll independientemente
           de si el usuario está con la barra del navegador desplegada
           o plegada (iOS Safari 15.4+, Chrome Android 108+, Firefox 101+).
           Sesión 23 · v0.12.6. */
        height: 100vh !important;
        height: 100dvh !important;
        max-height: 100vh !important;
        max-height: 100dvh !important;
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
  `;
  document.head.appendChild(s);
}

function Sidebar() {
  const [state, set] = usePace();

  const collapsed = !!state.sidebarCollapsed;
  const unlockedCount = Object.keys(state.achievements || {}).length;

  const toggle = () => set({ sidebarCollapsed: !collapsed });

  /* Colapsado → ocultar TOTALMENTE.
     La re-expansión se hace con un botón flotante que renderiza <PaceApp/>.
     (Antes era un rail de 56px con iconos; se quitó por petición del usuario
     para tener pantalla limpia como la referencia del 2026-04-22 / sesión 9.) */
  if (collapsed) return null;

  return (
    <aside style={sidebarStyles.root} data-pace-sidebar>
      {/* ============================================================
          BARRA HORIZONTAL SUPERIOR · logo + contadores
          ------------------------------------------------------------
          v0.11.7 / sesión 12 · Reestructurado por petición del usuario:
          - Logo ampliado ~2.5× (PaceLogoImage ahora con maxWidth 600,
            antes 240) ocupando toda la franja horizontal.
          - Chevron de colapsar extraído de la fila del logo a un botón
            flotante en la esquina superior-derecha del sidebar para no
            competir con la imagen.
          - Contadores "# / ↻ / ◉" centrados debajo del logo (antes
            alineados a la izquierda) y con iconos SVG gráficos en vez
            de caracteres tipográficos (tomate, espiral, llama).
          El área del logo sigue siendo clicable para el easter egg
          "vaca feliz" (10 clicks → secret.cow.click).
          ============================================================ */}
      <button onClick={toggle} style={sidebarStyles.toggleFloating} data-pace-sidebar-toggle title="Colapsar (⌘\\)" aria-label="Colapsar panel">
        <ChevronLeftIcon />
      </button>
      <div style={sidebarStyles.logoBar} data-pace-sidebar-logobar>
        <div
          style={{ ...sidebarStyles.logo, cursor: 'pointer' }}
          onClick={() => window.dispatchEvent(new CustomEvent('pace:cow-click'))}
          title="¿Le haces cosquillas?"
        >
          <PaceWordmark variant={state.logoVariant} color="var(--ink)" />
        </div>
      </div>

      {/* CONTADORES HOY — centrados debajo del logo, con iconos gráficos */}
      <div style={sidebarStyles.cycles}>
        <div style={sidebarStyles.cycleCount}>
          <span style={sidebarStyles.cycleItem} title="Pomodoros completados hoy">
            <PomodoroIcon />
            <span style={sidebarStyles.cycleNum}>{String(state.cycle).padStart(2, '0')}</span>
          </span>
          <span style={sidebarStyles.cycleSep} aria-hidden="true" />
          <span style={sidebarStyles.cycleItem} title="Rondas largas (cada 4 pomodoros)">
            <RoundsIcon />
            <span style={sidebarStyles.cycleNum}>{String(Math.floor(state.cycle / 4)).padStart(2, '0')}</span>
          </span>
          <span style={sidebarStyles.cycleSep} aria-hidden="true" />
          <span style={sidebarStyles.cycleItem} title="Días activos seguidos">
            <StreakFlameIcon />
            <span style={sidebarStyles.cycleNum}>{String(state.streak.current).padStart(2, '0')}</span>
          </span>
        </div>
      </div>

      <Divider style={{ margin: '16px 0 14px' }} />

      {/* RITMO / RACHA */}
      <div style={sidebarStyles.section}>
        <div style={sidebarStyles.sectionHeader}>
          <Meta>Ritmo</Meta>
          <span style={sidebarStyles.sectionAside}>{state.streak.longest}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={sidebarStyles.streakNum}>{state.streak.current}</span>
          <div>
            <div style={sidebarStyles.streakLabel}>{state.streak.current === 1 ? 'día seguido' : 'días seguidos'}</div>
            <div style={sidebarStyles.streakSub}>Mejor: {state.streak.longest} días</div>
          </div>
        </div>
        <WeekDots weeklyStats={state.weeklyStats} />
      </div>

      <Divider style={{ margin: '16px 0 14px' }} />

      {/* SENDERO — el día como camino con hitos */}
      <div style={sidebarStyles.section}>
        <SenderoDelDia state={state} />
      </div>

      <Divider style={{ margin: '16px 0 14px' }} />

      {/* LOGROS */}
      <div style={sidebarStyles.section}>
        <div style={sidebarStyles.sectionHeader}>
          <Meta>Logros</Meta>
          <span style={sidebarStyles.sectionAside}>{unlockedCount}/100</span>
        </div>
        <AchievementsPreview onOpen={() => window.dispatchEvent(new CustomEvent('pace:open-achievements'))} />
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('pace:open-achievements'))}
          style={sidebarStyles.linkBtn}
        >
          {100 - unlockedCount} por descubrir →
        </button>
      </div>

      <div style={{ flex: 1 }} />

      {/* STATUS BAR INFERIOR */}
      <StatusBar />
    </aside>
  );
}

/* ============================================================
   Sendero del día — línea ondulada horizontal que representa
   el arco del día (6h → 22h). Los hitos son pomodoros y sesiones
   completadas hasta ahora; aparecen como puntos sobre la curva.
   ============================================================ */
function SenderoDelDia({ state }) {
  const now = new Date();
  const hNow = now.getHours() + now.getMinutes() / 60;
  const start = 6;  // 6:00
  const end = 22;   // 22:00
  const fraction = Math.min(1, Math.max(0, (hNow - start) / (end - start)));

  // Hitos del día: pomodoros + sesiones (proxy desde state)
  const hitos = useMemoSB(() => {
    const out = [];
    // Pomodoros: repartimos sus horas ficticiamente por el día hasta hNow
    const cycle = state.cycle || 0;
    for (let i = 0; i < cycle; i++) {
      const t = start + ((i + 1) / (cycle + 1)) * Math.max(0.1, hNow - start);
      out.push({ t, kind: 'focus' });
    }
    // Actividades del plan también cuentan como hitos hoy
    const day = new Date().getDay();
    const ws = state.weeklyStats || {};
    if ((ws.breathMinutes?.[day] || 0) > 0) out.push({ t: hNow - 0.3, kind: 'breathe' });
    if ((ws.moveMinutes?.[day] || 0) > 0) out.push({ t: hNow - 0.55, kind: 'move' });
    if ((ws.waterGlasses?.[day] || 0) > 0) out.push({ t: hNow - 0.15, kind: 'water' });
    // Clamp to path range
    return out
      .map(h => ({ ...h, x: Math.max(0, Math.min(1, (h.t - start) / (end - start))) }))
      .sort((a, b) => a.x - b.x);
  }, [state.cycle, state.weeklyStats]);

  const W = 240;
  const H = 46;
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
        <Meta>Sendero</Meta>
        <span style={sidebarStyles.sectionAside}>{hitos.length} {hitos.length === 1 ? 'hito' : 'hitos'}</span>
      </div>
      <div style={{ marginTop: 6 }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%' }}>
          {/* Camino completo (opacidad baja) */}
          <path d={pathD} stroke="var(--line-2)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {/* Camino recorrido: clip al punto actual */}
          <defs>
            <clipPath id="sendero-clip">
              <rect x="0" y="0" width={pointerX} height={H} />
            </clipPath>
          </defs>
          <path d={pathD} stroke="var(--focus)" strokeWidth="1.8" fill="none" strokeLinecap="round" clipPath="url(#sendero-clip)" />
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
          <span>6h</span>
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 11, letterSpacing: 0, color: 'var(--ink-2)', textTransform: 'none' }}>ahora · {String(now.getHours()).padStart(2,'0')}:{String(now.getMinutes()).padStart(2,'0')}</span>
          <span>22h</span>
        </div>
      </div>
    </>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

/* ============================================================
   Iconos gráficos para los contadores del sidebar superior
   (sesión 12 · v0.11.7) — sustituyen los caracteres # ↻ ◉ por
   glifos editoriales con stroke fino y un toque de color sutil.
   Dibujados en viewBox 16×16, render a 14px para encajar con
   la tipografía tabular (line-height 16–18).
   ============================================================ */

// Tomate / pomodoro: círculo con hendidura superior + tallo y hojita.
// Metáfora universal para "pomodoro completado". Relleno terracota con
// opacidad baja, stroke del color de foco para que case con el tag.
function PomodoroIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {/* Cuerpo del tomate */}
      <path
        d="M8 4.2c2.9 0 5 2.1 5 4.7 0 2.5-2.1 4.6-5 4.6s-5-2.1-5-4.6c0-2.6 2.1-4.7 5-4.7z"
        fill="var(--focus)"
        fillOpacity="0.14"
        stroke="var(--focus)"
        strokeWidth="1.2"
      />
      {/* Hendidura central vertical (sugerencia de gajo) */}
      <path
        d="M8 5.2v1.4"
        stroke="var(--focus)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Tallo */}
      <path
        d="M8 4.2V3"
        stroke="var(--focus)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Hoja */}
      <path
        d="M8 3.4c1.1-.5 2-.2 2.5.4-.8.6-1.8.5-2.5-.4z"
        fill="var(--focus)"
        fillOpacity="0.55"
      />
    </svg>
  );
}

// Rondas / ciclos largos: espiral de ~1.5 vueltas que sugiere repetición
// acumulada. Alternativa gráfica al ↻ tipográfico (que es un arrow-rotate
// poco expresivo). Mantiene el peso visual del set.
function RoundsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"
         stroke="var(--ink-2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Espiral: centro → fuera en ~1.4 vueltas */}
      <path d="M8 8
               a1 1 0 0 1 1 -1
               a2 2 0 0 1 2 2
               a3 3 0 0 1 -3 3
               a4 4 0 0 1 -4 -4
               a5 5 0 0 1 5 -5
               a5.5 5.5 0 0 1 4 1.5" />
      {/* Cabeza de flecha en el extremo exterior, insinuando "otra vuelta" */}
      <path d="M13 3.5l.2 2.5 -2.3 -.6" />
    </svg>
  );
}

// Racha / streak: llama fina en dos trazos. El relleno cálido (breathe)
// la diferencia del resto de iconos del set y conecta con la idea de
// "mantener el calor" de los días seguidos.
function StreakFlameIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {/* Silueta principal de la llama */}
      <path
        d="M8 2.2c.6 1.8 2.1 2.8 2.9 4.1 1 1.6 1.1 3.4 .1 4.8 -1 1.4 -3 2.2 -4.6 1.5 -1.8 -.8 -2.7 -2.8 -2.1 -4.7 .3 -1 .9 -1.7 1.4 -2.5 .6 -.9 1.3 -1.8 2.3 -3.2z"
        fill="var(--breathe)"
        fillOpacity="0.2"
        stroke="var(--breathe)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Llama interior (corazón) */}
      <path
        d="M8 7.5c.4 .7 1 1.1 1.2 1.8 .2 .7 -.1 1.5 -.8 1.9 -.8 .4 -1.8 .1 -2.1 -.8 -.2 -.6 .1 -1.1 .4 -1.6 .3 -.4 .7 -.8 1.3 -1.3z"
        fill="var(--breathe)"
        fillOpacity="0.55"
      />
    </svg>
  );
}
/* NOTA: ChevronRightIcon se eliminó en v0.11.6 — el sidebar colapsado
   ya no es un rail con chevron, vuelve a abrirse con el handle flotante
   que vive en main.jsx (≡). */

function WeekDots({ weeklyStats }) {
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const today = (new Date().getDay() + 6) % 7; // L=0
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
      {days.map((d, i) => {
        const active = (weeklyStats.focusMinutes[(i+1)%7] || 0) > 0;
        const isToday = i === today;
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
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

function AchievementsPreview({ onOpen }) {
  const [state] = usePace();
  const unlocked = Object.keys(state.achievements || {});
  // Mostrar 5 slots: los 3 últimos + 2 placeholders
  const shown = 5;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${shown}, 1fr)`, gap: 6, marginBottom: 10 }}>
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
            title={id || 'Por descubrir'}
          >
            {id ? '✦' : '·'}
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
function StatusBar() {
  const [state] = usePace();
  const openSupport = () => window.dispatchEvent(new CustomEvent('pace:open-support'));
  return (
    <div style={sidebarStyles.footer}>
      <div style={sidebarStyles.footerRow}>
        <Meta>En camino</Meta>
        <Tag color="var(--breathe)">● Pace</Tag>
      </div>
      <div style={{ marginTop: 10, marginBottom: 10 }}>
        <SupportButton onOpen={openSupport} />
      </div>
      <div style={sidebarStyles.footerRow}>
        <span style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Pace {PACE_VERSION}</span>
        <span style={{ fontSize: 9, color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>by @ezradesign</span>
      </div>
    </div>
  );
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
     logoRow/toggleExpanded reemplazados por logoBar/toggleFloating en v0.11.7. */
  cycles: {},
  /* Contadores centrados debajo del logo (v0.11.7). Antes estaban
     alineados a la izquierda con caracteres tipográficos (# ↻ ◉);
     ahora son icon+num en pill sutil. */
  cycleCount: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 14,
    fontSize: 12, color: 'var(--ink-2)', letterSpacing: '0.02em',
    padding: '6px 10px',
  },
  cycleItem: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    lineHeight: 1,
  },
  cycleNum: {
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 500,
    fontSize: 13,
    color: 'var(--ink)',
  },
  /* Separador vertical fino en vez del "|" tipográfico anterior */
  cycleSep: {
    display: 'inline-block',
    width: 1, height: 14,
    background: 'var(--line)',
    opacity: 0.8,
  },
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

Object.assign(window, { Sidebar });
