/* PACE · Sidebar izquierdo — colapsable
   Secciones: Ritmo (racha), Sendero (línea del día con hitos),
   Logros, Recordatorios, Intención.
   (La sección "Plan" se eliminó en v0.11.2 porque aportaba poco valor
   y los chips de actividades ya existen en la ActivityBar inferior.)
*/

const { useState: useStateSB, useMemo: useMemoSB } = React;

function Sidebar() {
  const [state, set] = usePace();
  const [reminderInput, setReminderInput] = useStateSB('');
  const [reminderMin, setReminderMin] = useStateSB('15');

  const collapsed = !!state.sidebarCollapsed;
  const unlockedCount = Object.keys(state.achievements || {}).length;

  const toggle = () => set({ sidebarCollapsed: !collapsed });

  const addReminder = () => {
    if (!reminderInput.trim()) return;
    set({
      reminders: [...(state.reminders || []), {
        id: Date.now(), text: reminderInput.trim(), minutes: parseInt(reminderMin) || 15, createdAt: Date.now()
      }]
    });
    setReminderInput('');
  };
  const removeReminder = (id) => {
    set({ reminders: (state.reminders || []).filter(r => r.id !== id) });
  };

  /* Versión colapsada: rail estrecho con solo iconos verticales */
  if (collapsed) {
    return (
      <aside style={{ ...sidebarStyles.root, width: 56, padding: '20px 10px' }}>
        <button onClick={toggle} style={sidebarStyles.toggleCollapsed} title="Expandir (⌘\\)">
          <ChevronRightIcon />
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, marginTop: 18 }}>
          <div title={`Racha: ${state.streak.current} días`} style={sidebarStyles.railItem}>
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink)', lineHeight: 1 }}>
              {state.streak.current}
            </span>
            <span style={{ fontSize: 8, letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: 2 }}>días</span>
          </div>
          <div style={sidebarStyles.railDivider} />
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('pace:open-achievements'))}
            style={sidebarStyles.railBtn}
            title={`Logros · ${unlockedCount}/100`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="9" r="6" /><path d="M8 14l-1 7 5-3 5 3-1-7" />
            </svg>
            <span style={{ fontSize: 8, color: 'var(--ink-3)', marginTop: 2 }}>{unlockedCount}</span>
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('pace:open-reminders'))}
            style={sidebarStyles.railBtn}
            title="Recordatorios"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
        </div>
        <StatusBar compact />
      </aside>
    );
  }

  return (
    <aside style={sidebarStyles.root}>
      {/* LOGO + toggle */}
      <div style={sidebarStyles.logoRow}>
        <div style={sidebarStyles.logo}>
          <PaceWordmark variant={state.logoVariant} color="var(--ink)" />
        </div>
        <button onClick={toggle} style={sidebarStyles.toggleExpanded} title="Colapsar (⌘\\)">
          <ChevronLeftIcon />
        </button>
      </div>

      {/* CICLOS HOY */}
      <div style={sidebarStyles.cycles}>
        <div style={sidebarStyles.cycleCount}>
          <span style={sidebarStyles.cycleNum}># {String(state.cycle).padStart(2, '0')}</span>
          <span style={sidebarStyles.cycleSep}>|</span>
          <span style={sidebarStyles.cycleNum}>↻ {String(Math.floor(state.cycle / 4)).padStart(2, '0')}</span>
          <span style={sidebarStyles.cycleSep}>|</span>
          <span style={sidebarStyles.cycleNum} title="Días activos seguidos">◉ {String(state.streak.current).padStart(2, '0')}</span>
        </div>
      </div>

      <Divider style={{ margin: '20px 0 16px' }} />

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

      <Divider style={{ margin: '20px 0 16px' }} />

      {/* SENDERO — el día como camino con hitos */}
      <div style={sidebarStyles.section}>
        <SenderoDelDia state={state} />
      </div>

      <Divider style={{ margin: '20px 0 16px' }} />

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

      <Divider style={{ margin: '20px 0 16px' }} />

      {/* RECORDATORIOS — ahora con más espacio al haber quitado Plan */}
      <div style={sidebarStyles.section}>
        <Meta style={{ marginBottom: 10 }}>Recordatorios</Meta>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <input
            value={reminderInput}
            onChange={(e) => setReminderInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addReminder(); }}
            placeholder="Avisa…"
            style={sidebarStyles.input}
          />
          <input
            value={reminderMin}
            onChange={(e) => setReminderMin(e.target.value)}
            style={{ ...sidebarStyles.input, width: 44, textAlign: 'center' }}
            type="number"
            min="1"
          />
          <button onClick={addReminder} style={sidebarStyles.addBtn}>+</button>
        </div>
        {(state.reminders || []).length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 220, overflowY: 'auto' }}>
            {state.reminders.map(r => (
              <div key={r.id} style={sidebarStyles.reminderItem}>
                <span style={{ flex: 1, fontSize: 12 }}>{r.text}</span>
                <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>{r.minutes}m</span>
                <button onClick={() => removeReminder(r.id)} style={sidebarStyles.reminderRemove}>×</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-display)', fontStyle: 'italic', lineHeight: 1.5 }}>
            Sin recordatorios activos. Añade uno arriba y avisará en minutos.
          </div>
        )}
      </div>

      <Divider style={{ margin: '20px 0 16px' }} />

      {/* INTENCIÓN */}
      <div style={sidebarStyles.section}>
        <Meta style={{ marginBottom: 8 }}>Intención</Meta>
        <textarea
          value={state.intention}
          onChange={(e) => set({ intention: e.target.value })}
          placeholder="¿Qué quieres cultivar hoy?"
          style={sidebarStyles.intentionBox}
        />
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
function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

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

function StatusBar({ compact }) {
  const [state] = usePace();
  if (compact) {
    return (
      <div style={{ paddingTop: 12, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'center' }}>
        <span style={{ fontSize: 8, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>v0.11</span>
      </div>
    );
  }
  return (
    <div style={sidebarStyles.footer}>
      <div style={sidebarStyles.footerRow}>
        <Meta>En camino</Meta>
        <Tag color="var(--breathe)">● Pace</Tag>
      </div>
      <div style={sidebarStyles.footerRow}>
        <span style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Pace v0.11.2</span>
        <span style={{ fontSize: 9, color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>by @acuradesign</span>
      </div>
    </div>
  );
}

const sidebarStyles = {
  root: {
    width: 280,
    minHeight: '100vh',
    background: 'var(--paper-2)',
    borderRight: '1px solid var(--line)',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    transition: 'width 260ms var(--ease), padding 260ms var(--ease)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 16,
  },
  logo: { flex: 1, minWidth: 0 },
  toggleExpanded: {
    width: 26, height: 26,
    display: 'grid', placeItems: 'center',
    color: 'var(--ink-3)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-sm)',
    background: 'var(--paper)',
    flexShrink: 0,
    marginTop: 4,
  },
  toggleCollapsed: {
    width: 36, height: 36,
    display: 'grid', placeItems: 'center',
    color: 'var(--ink-2)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-sm)',
    background: 'var(--paper)',
    margin: '0 auto',
  },
  railItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  railBtn: {
    width: 36, height: 36,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--ink-2)',
    borderRadius: 'var(--r-sm)',
    background: 'transparent',
  },
  railDivider: {
    width: 20, height: 1, background: 'var(--line)',
  },
  cycles: {},
  cycleCount: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 12, color: 'var(--ink-2)', letterSpacing: '0.05em',
  },
  cycleNum: { fontVariantNumeric: 'tabular-nums', fontWeight: 500 },
  cycleSep: { color: 'var(--ink-3)', opacity: 0.5 },
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
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 56,
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
  input: {
    flex: 1,
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-sm)',
    padding: '6px 10px',
    fontSize: 12,
    color: 'var(--ink)',
    outline: 'none',
  },
  addBtn: {
    background: 'var(--focus)',
    color: 'var(--paper)',
    borderRadius: 'var(--r-sm)',
    width: 30, height: 30,
    fontSize: 14,
    fontWeight: 600,
    display: 'grid', placeItems: 'center',
  },
  reminderItem: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '4px 8px',
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-sm)',
  },
  reminderRemove: {
    color: 'var(--ink-3)', fontSize: 14, width: 16, height: 16,
    display: 'grid', placeItems: 'center',
  },
  intentionBox: {
    width: '100%',
    minHeight: 50,
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-sm)',
    padding: '8px 10px',
    fontSize: 12,
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    resize: 'vertical',
    outline: 'none',
    color: 'var(--ink)',
  },
  footer: {
    marginTop: 20,
    paddingTop: 16,
    borderTop: '1px solid var(--line)',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  footerRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
};

Object.assign(window, { Sidebar });
