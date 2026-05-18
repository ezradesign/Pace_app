/* PACE · Caminos · Step de Foco · sesion 80 (split de PathRunner.jsx)
   Pomodoro contextual de Camino. TimerDial compartido + subtitulo
   "Concentracion profunda" + tres botones del mismo peso visual
   (Pausar/Reset/Saltar) durante la sesion + CTA "Hecho" al completar.
   Acredita foco UNA SOLA VEZ via creditedRef cuando remaining llega a 0
   estando running. Reset NO acredita; skip NO acredita.
   Estilos comunes desde window.pathStepStyles (steps/_shared.js).
   Contrato uniforme: (step, onExit(reason)) con reason 'done' | 'skip'. */

const { useState: useStateFS, useEffect: useEffectFS, useRef: useRefFS } = React;

function PathFocusStep({ step, onExit }) {
  const { t } = useT();
  const totalSec = (step.min || 25) * 60;
  const [remaining, setRemaining] = useStateFS(totalSec);
  const [running, setRunning] = useStateFS(false);
  const [done, setDone] = useStateFS(false);
  const intervalRef = useRefFS(null);
  const creditedRef = useRefFS(false);

  useEffectFS(() => {
    if (!running) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          if (!creditedRef.current && typeof addFocusMinutes === 'function') {
            try { addFocusMinutes(step.min || 25); creditedRef.current = true; } catch (e) {}
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  /* Reset: restaura contador y pausa. NO toca creditedRef ni avanza el
     Camino. Si el usuario ya termino una vez (done) y resetea, ese caso
     no se da: el bloque "done" muestra solo "Hecho", no Reset. */
  const handleReset = () => {
    setRunning(false);
    setRemaining(totalSec);
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = totalSec > 0 ? 1 - (remaining / totalSec) : 0;

  /* Botones del mismo peso visual: misma forma/padding/tipografia, solo
     varia el label. Compone btnTypography + btnOutline desde _shared.js. */
  const { btnTypography, btnOutline } = window.pathStepStyles;
  const btnBase = Object.assign({}, btnTypography, btnOutline, { padding: '10px 22px' });

  const pauseLabel = running
    ? t('focus.pause')
    : (remaining < totalSec ? t('focus.continue') : t('focus.start'));

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center',
    }}>
      {typeof TimerDial === 'function' ? (
        <div style={{ marginBottom: 24 }}>
          <TimerDial
            mins={mins}
            secs={secs}
            progress={progress}
            mode="foco"
            modeLabel={t('topbar.mode.focus')}
            subtitle={t('focus.subtitle.focus')}
            inner={null}
          />
        </div>
      ) : (
        <div style={{
          fontFamily: "'EB Garamond', Georgia, serif",
          fontSize: 96, fontWeight: 400,
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--ink)', lineHeight: 1, marginBottom: 32,
        }}>
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </div>
      )}
      {!done ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setRunning(r => !r)} style={btnBase}>
            {pauseLabel}
          </button>
          <button onClick={handleReset} style={btnBase}>
            {t('focus.restart')}
          </button>
          <button onClick={() => onExit('skip')} style={btnBase}>
            {t('path.runner.skip')}
          </button>
        </div>
      ) : (
        <button
          onClick={() => onExit('done')}
          style={{
            padding: '10px 28px', borderRadius: 'var(--r-sm)',
            background: 'var(--ink)', border: 'none',
            color: 'var(--paper)', cursor: 'pointer', fontSize: 13,
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
          }}
        >
          {t('path.runner.done')}
        </button>
      )}
    </div>
  );
}

Object.assign(window, { PathFocusStep });
