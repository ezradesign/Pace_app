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
      // Reducer PURO: sólo calcula el siguiente valor. Los side-effects
      // (completePomodoro, onFinish) viven en el useEffect de abajo que
      // observa `justFinished`. Esto evita doble ejecución si React
      // re-invoca el reducer (StrictMode en React 19).
      setRemainingSec(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // Efecto de finalización: se dispara cuando el timer llega a 0 estando en
  // marcha. Single-shot gracias al guard `justFinished` que se re-setea
  // en el efecto de reset de modo/minutos.
  useEffectFT(() => {
    if (!running) return;
    if (remainingSec !== 0) return;
    setRunning(false);
    setJustFinished(true);
    if (state.focusMode === 'foco') {
      completePomodoro();
      onFinish && onFinish();
    }
  }, [remainingSec, running, state.focusMode]);

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

  const isAro = state.timerStyle === 'aro';
  const runningLabel = running ? 'Pausar' : (remainingSec === totalSec ? 'Comenzar' : 'Continuar');

  /* Dots de ciclo (4 puntitos + etiqueta CICLO).
     En estilo 'aro' viven DENTRO del aro, debajo del botón de comenzar.
     En otros estilos se renderizan en su bloque propio fuera del timer. */
  const cycleDotsEl = (
    <div style={focusStyles.cycleDots}>
      {[0,1,2,3].map(i => (
        <span key={i} style={{
          width: 4, height: 4, borderRadius: '50%',
          background: (state.cycle % 4) > i ? 'var(--focus)' : 'var(--line-2)',
        }} />
      ))}
      <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginLeft: 10 }}>Ciclo</span>
    </div>
  );

  /* Bloque de controles + ciclo inyectado DENTRO del aro (layout ref. usuario).
     Para otros estilos se renderiza debajo en un bloque aparte. */
  const controls = (
    <div style={focusStyles.controlsTight}>
      <button
        onClick={() => setRunning(r => !r)}
        style={running ? focusStyles.startBtnSecondary : focusStyles.startBtnPrimary}
      >
        <span style={{ fontSize: 11, lineHeight: 1 }}>{running ? '❚❚' : '▶'}</span>
        <span>{runningLabel}</span>
      </button>
      <button onClick={reset} style={focusStyles.resetCircle} title="Reiniciar" aria-label="Reiniciar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <polyline points="3 4 3 10 9 10" />
        </svg>
      </button>
    </div>
  );

  /* Para estilo aro: unimos controles + ciclo en un mismo bloque interior. */
  const innerForAro = (
    <>
      {controls}
      <div style={{ marginTop: 10 }}>{cycleDotsEl}</div>
    </>
  );

  return (
    <div style={focusStyles.root}>
      {/* NOTA: el ModeToggle Foco/Pausa/Larga vive ahora en TopBar
         (centrado arriba), por referencia del usuario (sesión 9). */}

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
          inner={isAro ? innerForAro : null}
        />
      </div>

      {/* Controles + ciclo fuera del aro — solo para estilos no-aro */}
      {!isAro && (
        <>
          <div style={focusStyles.controls}>{controls}</div>
          {cycleDotsEl}
        </>
      )}
    </div>
  );
}

/* NOTA: el antiguo ModeToggle interno (Foco/Pausa/Larga) se eliminó en v0.11.6.
   Los tabs viven ahora en TopBar (app/main.jsx), centrados arriba (v0.11.4). */

/* ===================== */
/* MINUTES PICKER */
/* ===================== */
/* Presets 15/25/35/45 + "Otro" con input inline (1–180 min).
   La pill "Otro" se expande a un input al hacer click. Al confirmar
   (Enter o blur) aplica el valor y colapsa. Si el value actual no es
   preset, la pill muestra el número en lugar de "Otro" (estado activo).
   Rango 1–180 para cubrir desde pomodoros ultra-cortos hasta sesiones
   deep-work sin volverse absurdo. */
function MinutesPicker({ value, onChange }) {
  const presets = [15, 25, 35, 45];
  const isCustom = !presets.includes(value);
  const [editing, setEditing] = useStateFT(false);
  const [draft, setDraft] = useStateFT(String(value));
  const inputRef = useRefFT(null);

  useEffectFT(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Mantén el draft sincronizado si el value externo cambia mientras no edita
  useEffectFT(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  const commit = () => {
    const n = parseInt(draft, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 180) {
      onChange(n);
    } else {
      setDraft(String(value)); // revert
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(String(value));
    setEditing(false);
  };

  const pillBase = {
    padding: '4px 12px',
    minWidth: 34,
    height: 26,
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    borderRadius: 'var(--r-pill)',
    border: '1px solid transparent',
    transition: 'all 180ms',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
      <span style={{
        fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--ink-3)', marginRight: 10, fontWeight: 500,
      }}>Min</span>
      {presets.map(m => (
        <button key={m} onClick={() => { onChange(m); setEditing(false); }}
          style={{
            ...pillBase,
            fontWeight: value === m ? 600 : 400,
            color: value === m ? 'var(--ink)' : 'var(--ink-3)',
            background: value === m ? 'var(--paper-3)' : 'transparent',
          }}>{m}</button>
      ))}
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          min={1}
          max={180}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            else if (e.key === 'Escape') cancel();
          }}
          style={{
            ...pillBase,
            width: 52,
            textAlign: 'center',
            fontWeight: 600,
            color: 'var(--ink)',
            background: 'var(--paper)',
            border: '1px solid var(--line-2)',
            outline: 'none',
            MozAppearance: 'textfield',
          }}
        />
      ) : isCustom ? (
        <button
          onClick={() => setEditing(true)}
          title="Minutos personalizados (1–180)"
          style={{
            ...pillBase,
            fontWeight: 600,
            color: 'var(--ink)',
            background: 'var(--paper-3)',
          }}>
          {value}
        </button>
      ) : (
        <button
          onClick={() => setEditing(true)}
          title="Minutos personalizados (1–180)"
          style={{
            ...pillBase,
            marginLeft: 6,
            padding: '4px 4px',
            minWidth: 0,
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            background: 'transparent',
            fontWeight: 500,
          }}>
          Otro
        </button>
      )}
    </div>
  );
}

/* Oculta los spinners del <input type="number"> en WebKit.
   Sin esto, la pill de minutos personalizados muestra flechitas
   horribles que rompen la densidad calmada de la línea de presets. */
if (typeof document !== 'undefined' && !document.getElementById('pace-focus-minutes-css')) {
  const s = document.createElement('style');
  s.id = 'pace-focus-minutes-css';
  s.textContent = `
    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  `;
  document.head.appendChild(s);
}

/* ===================== */
/* TIMER VISUALIZATIONS */
/* ===================== */
function TimerVisualization({ style, mins, secs, progress, mode, modeLabel, subtitle, inner }) {
  if (style === 'aro') return <TimerAro mins={mins} secs={secs} progress={progress} modeLabel={modeLabel} subtitle={subtitle} inner={inner} />;
  if (style === 'circulo') return <TimerCircle mins={mins} secs={secs} progress={progress} modeLabel={modeLabel} subtitle={subtitle} />;
  if (style === 'barra') return <TimerBar mins={mins} secs={secs} progress={progress} modeLabel={modeLabel} subtitle={subtitle} />;
  if (style === 'analogico') return <TimerAnalog mins={mins} secs={secs} progress={progress} modeLabel={modeLabel} subtitle={subtitle} />;
  return <TimerNumber mins={mins} secs={secs} progress={progress} modeLabel={modeLabel} subtitle={subtitle} />;
}

/* Timer "Aro" (default · ref. usuario).
   Anillo fino, progreso sutil y punto indicador verde oliva sobre el aro.
   Dentro: etiqueta de modo · número gigante italic serif · divisor fino ·
   botón de comenzar + reset (inyectados via `inner`). El layout coincide
   con la composición de referencia (2026-04-22).
   Responsive: ocupa el mínimo entre ancho y alto del contenedor. */
function TimerAro({ mins, secs, progress, modeLabel, subtitle, inner }) {
  const R = 47.5;          // radio del anillo (en viewBox 100)
  const C = 2 * Math.PI * R;
  // Ángulo para el punto indicador (parte superior = 12 en punto)
  const angle = progress * 2 * Math.PI - Math.PI / 2;
  const dotCx = 50 + R * Math.cos(angle);
  const dotCy = 50 + R * Math.sin(angle);

  return (
    <div style={focusStyles.aroFrame}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        {/* Aro base — trazo fino cálido */}
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--line)" strokeWidth="0.35" />
        {/* Arco de progreso (sutil, mismo trazo pero ligeramente más intenso) */}
        <circle cx="50" cy="50" r={R} fill="none"
          stroke="var(--line-2)" strokeWidth="0.5"
          strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 1s linear' }} />
        {/* Punto verde oliva (indicador) */}
        <circle cx={dotCx} cy={dotCy} r="1.25" fill="var(--focus)"
          style={{ transition: 'cx 1s linear, cy 1s linear' }} />
      </svg>

      {/* Contenido centrado */}
      <div style={focusStyles.aroInner}>
        <div style={focusStyles.modeLabel}>{modeLabel}</div>
        <div style={focusStyles.numberHuge}>
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </div>
        <div style={focusStyles.subtitleItalic}>{subtitle}</div>
        <div style={focusStyles.innerDivider} />
        {inner /* botones Comenzar + reset inyectados desde el padre */}
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
          ...displayItalic,
          fontSize: 'var(--size-hero)',
          fontWeight: 400,
          lineHeight: 0.9,
          color: 'var(--ink)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.03em',
        }}>{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</div>
        <div style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--ink-3)', marginTop: 40 }}>{subtitle}</div>
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
        <div style={{ ...displayItalic, fontSize: 96, fontWeight: 400, lineHeight: 0.9, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </div>
        <div style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--ink-3)', marginTop: 36 }}>{subtitle}</div>
      </div>
    </div>
  );
}

function TimerBar({ mins, secs, progress, modeLabel, subtitle }) {
  return (
    <div style={{ width: 520, textAlign: 'center' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 24 }}>{modeLabel}</div>
      <div style={{
        ...displayItalic,
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
    gap: 14,
    /* Padding lateral 40 en desktop; en móvil el <div data-pace-main-content>
       ya reduce a 12 su propio padding, y éste se relaja con un clamp
       para no ahogar el aro en 375×812. (Sesión 22.) */
    padding: '8px clamp(0px, 4vw, 40px) 0',
    width: '100%',
    height: '100%',
    minHeight: 0,
  },
  timerWrap: {
    display: 'grid', placeItems: 'center',
    flex: 1,
    minHeight: 0,
    width: '100%',
  },

  /* ===== AroFrame (default) — cuadrado, compacto para dejar sitio a los controles.
     Altura MAX ~520px para que a 1080p quepa: topbar(~56) + min(~45) + aro(520)
     + actividades(~110) + colchón ≈ 730–800 px. Así queda con aire.

     Responsive (sesión 22 · v0.12.5):
       Se añade `min(…, 86vw)` en ancho para que en viewports estrechos
       (móvil 375–430) el aro nunca se desborde. Antes `min(56vh, 520)`
       daba 472 px en un iPhone 12 (844 alto) → se cortaba por los
       bordes en un ancho de 390. Ahora el lado del cuadrado es el
       mínimo entre los tres: 56% alto, 86% ancho y 520 px. El `vw`
       manda en móvil, el `vh` manda en desktop, el 520 px pone techo
       en pantallas grandes — sin cambiar el comportamiento previo. */
  aroFrame: {
    position: 'relative',
    height: 'min(56vh, 86vw, 520px)',
    width: 'min(56vh, 86vw, 520px)',
    aspectRatio: '1 / 1',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
  },
  aroInner: {
    position: 'relative',
    textAlign: 'center',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    // Limita el ancho del texto para que "Concentración profunda" quepa bien
    // y el contenido no se desborde por los bordes curvos del círculo.
    maxWidth: '70%',
  },
  modeLabel: {
    fontSize: 11,
    letterSpacing: '0.26em',
    textTransform: 'uppercase',
    color: 'var(--ink-3)',
    marginBottom: 10,
    fontWeight: 500,
  },
  numberHuge: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontWeight: 400,
    lineHeight: 0.9,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.03em',
    color: 'var(--ink)',
    // Escala para caber en el aro reducido (520 max)
    fontSize: 'clamp(64px, 7vw, 104px)',
  },
  subtitleItalic: {
    fontStyle: 'italic',
    fontFamily: 'var(--font-display)',
    fontSize: 14,
    color: 'var(--ink-3)',
    // Sep. entre número gigante y subtítulo italic: los descendentes del
    // número (los dos-puntos y el cero) quedaban visualmente pisando al
    // subtítulo. +20px de aire (sesión 20).
    marginTop: 30,
    letterSpacing: 0.2,
  },
  innerDivider: {
    width: 110,
    height: 1,
    background: 'var(--line-2)',
    opacity: 0.55,
    margin: '12px 0 10px',
  },

  /* ===== Controles (compactos, estilo referencia) ===== */
  controls: {
    display: 'flex', alignItems: 'center', gap: 10, marginTop: 10,
  },
  controlsTight: {
    display: 'flex', alignItems: 'center', gap: 8,
  },
  startBtnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '7px 16px 7px 14px',
    background: 'var(--focus)',
    color: 'var(--paper)',
    borderRadius: 'var(--r-xs)',
    fontSize: 12,
    letterSpacing: 0.3,
    fontWeight: 500,
    border: '1px solid var(--focus)',
    boxShadow: '0 1px 2px rgba(31,28,23,0.08)',
    transition: 'all 180ms',
  },
  startBtnSecondary: {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '7px 16px 7px 14px',
    background: 'var(--paper)',
    color: 'var(--ink)',
    borderRadius: 'var(--r-xs)',
    fontSize: 12,
    letterSpacing: 0.3,
    fontWeight: 500,
    border: '1px solid var(--line-2)',
    transition: 'all 180ms',
  },
  resetCircle: {
    width: 28, height: 28,
    borderRadius: '50%',
    border: '1px solid var(--line-2)',
    background: 'var(--paper)',
    color: 'var(--ink-2)',
    display: 'grid', placeItems: 'center',
    transition: 'all 180ms',
  },

  cycleDots: {
    display: 'flex', alignItems: 'center', gap: 5,
    marginTop: 4,
  },
};

Object.assign(window, { FocusTimer });
