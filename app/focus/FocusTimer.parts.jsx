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

Object.assign(window, { MinutesPicker });
