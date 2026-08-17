/* PACE · FocusTimer.parts — piezas de UI del Pomodoro extraídas (s124)
   Split MECÁNICO de bajo riesgo para bajar FocusTimer.jsx del tope de 500 ln.
   Aquí vive el MinutesPicker (selector de duración) y su CSS de input; sin
   cambios visuales ni funcionales respecto de v0.66.0.

   Declara SUS PROPIAS referencias a los hooks de React (no depende de las
   de FocusTimer.jsx). Debe cargarse DESPUÉS de React y ANTES de FocusTimer.jsx
   (su consumidor lo resuelve como global via window). */

const { useState: useStateFP, useEffect: useEffectFP, useRef: useRefFP } = React;

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
  const { t } = useT();
  const presets = [15, 25, 35, 45];
  const isCustom = !presets.includes(value);
  const [editing, setEditing] = useStateFP(false);
  const [draft, setDraft] = useStateFP(String(value));
  const inputRef = useRefFP(null);

  useEffectFP(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Mantén el draft sincronizado si el value externo cambia mientras no edita
  useEffectFP(() => {
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
      }}>{t('focus.min')}</span>
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
          title={t('focus.minutes.custom.title')}
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
          title={t('focus.minutes.custom.title')}
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
          {t('focus.other')}
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


/* ============================================================
   AÑADIDO EN s163 al trocear FocusTimer.jsx (686 -> 485 ln).

   Los DOS estilos de timer que no son el aro -- barra y analogico -- y el
   dispatcher que elige entre los tres. Vienen tal cual, sin un cambio.

   Resuelven `TimerDial` y `displayItalic` como globales, y eso NO impone
   orden de carga: son referencias peladas que se resuelven contra `window`
   cuando el componente RENDERIZA, no cuando este archivo se evalua. (Lo
   contrario del caso de `state-core.palette.jsx`, cuya llamada si ocurre en
   el cuerpo del modulo y por eso alli el orden es innegociable.)
   ============================================================ */

/* ===================== */
/* TIMER VISUALIZATIONS */
/* ===================== */
/* TimerVisualization — sesión 37: circle y numero eliminados (rotos).
   Opciones válidas: aro (default), barra, analogico.
   Sesion 76: el aro se renderiza via TimerDial compartido (ui/TimerDial.jsx)
   para alinear pixel-a-pixel con PathFocusStep. interpolateRingColor vive
   ahora en TimerDial.jsx. */
function TimerVisualization({ style, mins, secs, progress, mode, modeLabel, subtitle, inner, running, fitHeight, paused }) {
  if (style === 'barra') return <TimerBar mins={mins} secs={secs} progress={progress} modeLabel={modeLabel} subtitle={subtitle} />;
  if (style === 'analogico') return <TimerAnalog mins={mins} secs={secs} progress={progress} modeLabel={modeLabel} subtitle={subtitle} />;
  return <TimerDial mins={mins} secs={secs} progress={progress} mode={mode} modeLabel={modeLabel} subtitle={subtitle} inner={inner} running={running} fitHeight={fitHeight} paused={paused} />;
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
        <text x="50" y="70" textAnchor="middle" fontSize="10" fontFamily="EB Garamond" fontStyle="italic" fill="var(--ink)">
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </text>
        {/* Descriptor por duración (s124): discreto bajo la cifra, sin tocar la
            geometría del reloj (círculo/marcas/aguja). También muestra «Ciclo
            completado» cuando llega vía subtitle. */}
        {subtitle ? (
          <text x="50" y="80" textAnchor="middle" fontSize="3.6" fontFamily="EB Garamond" fontStyle="italic" fill="var(--ink-3)">{subtitle}</text>
        ) : null}
      </svg>
    </div>
  );
}

Object.assign(window, { MinutesPicker, TimerVisualization, TimerBar, TimerAnalog });
