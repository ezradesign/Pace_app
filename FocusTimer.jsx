/* PACE · Módulo Foco (Pomodoro)
   Temporizador funcional real. 4 estilos visuales de tweaks.
*/

const { useState: useStateFT, useEffect: useEffectFT, useRef: useRefFT } = React;

function FocusTimer({ onFinish }) {
  const [state, set] = usePace();
  const [running, setRunning] = useStateFT(false);
  const [remainingSec, setRemainingSec] = useStateFT(state.focusMinutes * 60);
  const [justFinished, setJustFinished] = useStateFT(false);
  const intervalRef = useRefFT(null);

  // Reset si cambian minutos o modo
  useEffectFT(() => {
    const baseMin = state.focusMode === 'foco' ? state.focusMinutes
                  : state.focusMode === 'pausa' ? 5
                  : 15;
    setRemainingSec(baseMin * 60);
    setRunning(false);
    setJustFinished(false);
  }, [state.focusMode, state.focusMinutes]);

  useEffectFT(() => {
    if (!running) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemainingSec(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setJustFinished(true);
          if (state.focusMode === 'foco') {
            completePomodoro();
            onFinish && onFinish();
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const mins = Math.floor(remainingSec / 60);
  const secs = remainingSec % 60;
  const totalSec = (state.focusMode === 'foco' ? state.focusMinutes : state.focusMode === 'pausa' ? 5 : 15) * 60;
  const progress = 1 - (remainingSec / totalSec);

  const modeLabel = state.focusMode === 'foco' ? 'Foco'
                  : state.focusMode === 'pausa' ? 'Pausa corta'
                  : 'Pausa larga';
  const subtitle = state.focusMode === 'foco' ? 'Concentración profunda'
                 : state.focusMode === 'pausa' ? 'Desconecta 5 min'
                 : 'Pausa larga · estira y respira';

  const reset = () => {
    setRunning(false);
    setJustFinished(false);
    const baseMin = state.focusMode === 'foco' ? state.focusMinutes : state.focusMode === 'pausa' ? 5 : 15;
    setRemainingSec(baseMin * 60);
  };

  return (
    <div style={focusStyles.root}>
      {/* Selector modo */}
      <div style={focusStyles.modeRow}>
        <ModeToggle value={state.focusMode} onChange={(v) => set({ focusMode: v })} />
      </div>

      {/* Selector minutos */}
      {state.focusMode === 'foco' && (
        <MinutesPicker value={state.focusMinutes} onChange={(v) => set({ focusMinutes: v })} />
      )}

      {/* Visualización */}
      <div style={focusStyles.timerWrap}>
        <TimerVisualization
          style={state.timerStyle}
          mins={mins}
          secs={secs}
          progress={progress}
          mode={state.focusMode}
          modeLabel={modeLabel}
          subtitle={subtitle}
        />
      </div>

      {/* Controles */}
      <div style={focusStyles.controls}>
        <Button
          variant={running ? 'secondary' : 'primary'}
          size="lg"
          onClick={() => setRunning(r => !r)}
          icon={running ? '❚❚' : '▶'}
        >
          {running ? 'Pausar' : (remainingSec === totalSec ? 'Comenzar' : 'Continuar')}
        </Button>
        <button onClick={reset} style={focusStyles.resetBtn} title="Reiniciar">
          <span style={{ fontSize: 18 }}>↻</span>
        </button>
      </div>

      {/* Dots de ciclo */}
      <div style={focusStyles.cycleDots}>
        {[0,1,2,3].map(i => (
          <span key={i} style={{
            width: 4, height: 4, borderRadius: '50%',
            background: (state.cycle % 4) > i ? 'var(--focus)' : 'var(--line-2)',
          }} />
        ))}
        <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginLeft: 10 }}>Ciclo</span>
      </div>
    </div>
  );
}

/* ===================== */
/* MODE TOGGLE */
/* ===================== */
function ModeToggle({ value, onChange }) {
  const modes = [
    { v: 'foco', label: 'Foco' },
    { v: 'pausa', label: 'Pausa' },
    { v: 'larga', label: 'Larga' },
  ];
  return (
    <div style={{
      display: 'inline-flex',
      background: 'var(--paper-2)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-pill)',
      padding: 3,
      gap: 2,
    }}>
      {modes.map(m => (
        <button key={m.v} onClick={() => onChange(m.v)}
          style={{
            padding: '6px 18px',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 500,
            borderRadius: 'var(--r-pill)',
            background: value === m.v ? 'var(--ink)' : 'transparent',
            color: value === m.v ? 'var(--paper)' : 'var(--ink-2)',
            transition: 'all 200ms',
          }}>{m.label}</button>
      ))}
    </div>
  );
}

/* ===================== */
/* MINUTES PICKER */
/* ===================== */
function MinutesPicker({ value, onChange }) {
  const options = [15, 25, 35, 45];
  return (
    <div style={{ display: 'flex', gap: 0, alignItems: 'center', justifyContent: 'center' }}>
      <span style={{
        fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
        color: 'var(--ink-3)', marginRight: 12,
      }}>Min</span>
      {options.map(m => (
        <button key={m} onClick={() => onChange(m)}
          style={{
            padding: '4px 14px',
            fontSize: 13,
            fontVariantNumeric: 'tabular-nums',
            fontWeight: value === m ? 600 : 400,
            color: value === m ? 'var(--ink)' : 'var(--ink-3)',
            background: value === m ? 'var(--paper-3)' : 'transparent',
            borderRadius: 'var(--r-pill)',
            transition: 'all 180ms',
          }}>{m}</button>
      ))}
    </div>
  );
}

/* ===================== */
/* TIMER VISUALIZATIONS */
/* ===================== */
function TimerVisualization({ style, mins, secs, progress, mode, modeLabel, subtitle }) {
  if (style === 'aro') return <TimerAro mins={mins} secs={secs} progress={progress} modeLabel={modeLabel} subtitle={subtitle} />;
  if (style === 'circulo') return <TimerCircle mins={mins} secs={secs} progress={progress} modeLabel={modeLabel} subtitle={subtitle} />;
  if (style === 'barra') return <TimerBar mins={mins} secs={secs} progress={progress} modeLabel={modeLabel} subtitle={subtitle} />;
  if (style === 'analogico') return <TimerAnalog mins={mins} secs={secs} progress={progress} modeLabel={modeLabel} subtitle={subtitle} />;
  return <TimerNumber mins={mins} secs={secs} progress={progress} modeLabel={modeLabel} subtitle={subtitle} />;
}

/* Timer "Aro" — híbrido entre círculo y barra.
   Doble anillo sutil + arco de progreso grueso + micro-barra inferior.
   Pensado para sentir avance tanto radial como lineal. */
function TimerAro({ mins, secs, progress, modeLabel, subtitle }) {
  const R = 45;
  const C = 2 * Math.PI * R;
  return (
    <div style={{ position: 'relative', width: 440, height: 440, display: 'grid', placeItems: 'center' }}>
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        {/* Anillo exterior finísimo */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="var(--line)" strokeWidth="0.3" />
        {/* Pista del progreso */}
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--line)" strokeWidth="1.2" opacity="0.5" />
        {/* Arco de progreso grueso */}
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--focus)" strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 1s linear' }} />
        {/* Punto indicador al final del arco */}
        <circle
          cx={50 + R * Math.cos(progress * 2 * Math.PI - Math.PI / 2)}
          cy={50 + R * Math.sin(progress * 2 * Math.PI - Math.PI / 2)}
          r="1.6" fill="var(--focus)"
          style={{ transition: 'all 1s linear' }}
        />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 14 }}>{modeLabel}</div>
        <div style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 108, fontWeight: 400, lineHeight: 0.9,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em',
          color: 'var(--ink)',
        }}>{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</div>
        <div style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--ink-3)', marginTop: 14 }}>{subtitle}</div>
        {/* Micro-barra inferior (guiño a la versión "barra") */}
        <div style={{
          width: 140, height: 2, margin: '16px auto 0',
          background: 'var(--line)', borderRadius: 2, overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress * 100}%`, height: '100%',
            background: 'var(--focus)',
            transition: 'width 1s linear',
          }} />
        </div>
      </div>
    </div>
  );
}

function TimerNumber({ mins, secs, progress, modeLabel, subtitle }) {
  return (
    <div style={{ position: 'relative', width: 420, height: 420, display: 'grid', placeItems: 'center' }}>
      {/* Círculo muy sutil */}
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="48" fill="none" stroke="var(--line)" strokeWidth="0.3" />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 16 }}>{modeLabel}</div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'var(--size-hero)',
          fontWeight: 400,
          lineHeight: 0.9,
          color: 'var(--ink)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.03em',
        }}>{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</div>
        <div style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--ink-3)', marginTop: 20 }}>{subtitle}</div>
      </div>
    </div>
  );
}

function TimerCircle({ mins, secs, progress, modeLabel, subtitle }) {
  const R = 46;
  const C = 2 * Math.PI * R;
  return (
    <div style={{ position: 'relative', width: 420, height: 420, display: 'grid', placeItems: 'center' }}>
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--line)" strokeWidth="0.6" />
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--focus)" strokeWidth="1.2"
          strokeDasharray={C} strokeDashoffset={C * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 1s linear' }} />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 14 }}>{modeLabel}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 96, fontWeight: 400, lineHeight: 0.9, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </div>
        <div style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--ink-3)', marginTop: 16 }}>{subtitle}</div>
      </div>
    </div>
  );
}

function TimerBar({ mins, secs, progress, modeLabel, subtitle }) {
  return (
    <div style={{ width: 520, textAlign: 'center' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 24 }}>{modeLabel}</div>
      <div style={{
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
        fontSize: 140, fontWeight: 400, lineHeight: 0.9,
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em',
        marginBottom: 30,
      }}>{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</div>
      <div style={{ height: 2, background: 'var(--line)', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          width: `${progress * 100}%`,
          background: 'var(--focus)',
          transition: 'width 1s linear',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        <span>0:00</span>
        <span style={{ fontStyle: 'italic', textTransform: 'none', fontFamily: 'var(--font-display)' }}>{subtitle}</span>
        <span>{Math.floor(progress * 100)}%</span>
      </div>
    </div>
  );
}

function TimerAnalog({ mins, secs, progress, modeLabel, subtitle }) {
  // Reloj analógico con aguja de minutos en base a progress
  const angle = progress * 360;
  return (
    <div style={{ position: 'relative', width: 380, height: 380, display: 'grid', placeItems: 'center' }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="48" fill="var(--paper)" stroke="var(--ink-2)" strokeWidth="0.4" />
        {/* Marcas horarias */}
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
          const isMajor = i % 5 === 0;
          const r1 = isMajor ? 42 : 44;
          const r2 = 46;
          return <line key={i}
            x1={50 + r1 * Math.cos(a)} y1={50 + r1 * Math.sin(a)}
            x2={50 + r2 * Math.cos(a)} y2={50 + r2 * Math.sin(a)}
            stroke="var(--ink-2)" strokeWidth={isMajor ? 0.6 : 0.2} />;
        })}
        {/* Aguja */}
        <line x1="50" y1="50"
          x2={50 + 38 * Math.cos((angle - 90) * Math.PI / 180)}
          y2={50 + 38 * Math.sin((angle - 90) * Math.PI / 180)}
          stroke="var(--focus)" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="50" cy="50" r="1.2" fill="var(--focus)" />
        {/* Texto */}
        <text x="50" y="32" textAnchor="middle" fontSize="3.5" letterSpacing="0.5" fill="var(--ink-3)" style={{ textTransform: 'uppercase' }}>{modeLabel}</text>
        <text x="50" y="72" textAnchor="middle" fontSize="10" fontFamily="EB Garamond" fontStyle="italic" fill="var(--ink)">
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </text>
      </svg>
    </div>
  );
}

const focusStyles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    padding: '32px 40px',
    width: '100%',
  },
  modeRow: { marginBottom: 4 },
  timerWrap: {
    display: 'grid', placeItems: 'center',
    margin: '12px 0',
  },
  controls: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
  resetBtn: {
    width: 48, height: 48,
    borderRadius: 'var(--r-md)',
    border: '1px solid var(--line-2)',
    color: 'var(--ink-2)',
    background: 'var(--paper)',
    display: 'grid', placeItems: 'center',
    transition: 'all 180ms',
  },
  cycleDots: {
    display: 'flex', alignItems: 'center', gap: 5,
    marginTop: 4,
  },
};

Object.assign(window, { FocusTimer });
