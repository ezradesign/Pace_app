/* PACE · Caminos · Step de Foco · sesion 80 (split de PathRunner.jsx)
   Pomodoro contextual de Camino. TimerDial compartido + subtitulo
   "Concentracion profunda" + tres botones del mismo peso visual
   (Pausar/Reset/Saltar) durante la sesion + CTA "Hecho" al completar.
   Motor de tiempo via useCountdown (s96, timestamp-based): acredita foco UNA
   SOLA VEZ (onComplete single-shot del hook) cuando el contador llega a 0.
   Reset NO acredita; skip NO acredita.
   Estilos comunes desde window.pathStepStyles (steps/_shared.js).
   Contrato uniforme: (step, onExit(reason)) con reason 'done' | 'skip'. */

const { useState: useStateFS } = React;

function PathFocusStep({ step, onExit }) {
  const { t } = useT();
  const totalSec = (step.min || 25) * 60;
  const [done, setDone] = useStateFS(false);

  /* Motor de cuenta atras timestamp-based compartido (s96 · useCountdown).
     El foco de un Camino es CONTEXTUAL: acredita minutos + racha via
     completeFocusSession('path'), SIN cycle ni logros de pomodoro (decision
     s79/s86). onComplete es single-shot dentro del hook (reemplaza el
     creditedRef previo). Reset (hook) restaura el contador y pausa sin
     acreditar; skip tampoco acredita. */
  const { remaining, running, toggle, reset } = useCountdown(totalSec, () => {
    setDone(true);
    /* F-1 (s86): igual que la home, el foco de un Camino cuenta como actividad
       del dia para la racha (updateStreak, idempotente por dia -> no
       doble-cuenta con el paso breathe/body del mismo Camino). */
    try {
      if (typeof completeFocusSession === 'function') {
        completeFocusSession('path', { minutes: step.min || 25 });
      }
    } catch (e) {}
  });

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
          <button onClick={toggle} style={btnBase}>
            {pauseLabel}
          </button>
          <button onClick={reset} style={btnBase}>
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
