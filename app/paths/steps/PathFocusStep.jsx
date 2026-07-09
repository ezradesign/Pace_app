/* PACE · Caminos · Step de Foco · sesion 80 (split de PathRunner.jsx)
   Pomodoro contextual de Camino.

   s99: adopta el SessionShell compartido (mismo chrome elaborado que
   Respira/Mueve) para dar COHERENCIA visual al Camino -- antes iba pelado
   bajo el PathTopBar y desentonaba con el resto de pasos. El header lleva
   la identidad (Foco / "Concentracion profunda"), el centro el TimerDial
   (aro con glow al correr, s99 Sesion A) y el footer los tres controles
   del mismo peso pero AHORA CON COLOR de foco (peticion del usuario ->
   revisa s79: sigue siendo mismo peso, ya no outline neutro). El "done"
   pasa por SessionDone (check + stats + "Siguiente") como Respira/Mueve.

   Motor de tiempo via useCountdown (s96, timestamp-based): acredita foco
   UNA SOLA VEZ (onComplete single-shot). Reset NO acredita; skip NO acredita.
   Contrato uniforme: (step, onExit(reason)) con reason 'done' | 'skip'.
   onExit('exit') (header "Salir") = misma semantica que Respira/Mueve. */

const { useState: useStateFS } = React;

function PathFocusStep({ step, onExit }) {
  const { t } = useT();
  const totalSec = (step.min || 25) * 60;
  const [done, setDone] = useStateFS(false);

  /* Motor timestamp-based compartido (s96). El foco de un Camino es
     CONTEXTUAL: acredita minutos + racha via completeFocusSession('path'),
     SIN cycle ni logros de pomodoro (s79/s86). onComplete single-shot. */
  const { remaining, running, toggle, reset } = useCountdown(totalSec, () => {
    setDone(true);
    try {
      if (typeof completeFocusSession === 'function') {
        completeFocusSession('path', { minutes: step.min || 25 });
      }
    } catch (e) {}
  });

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = totalSec > 0 ? 1 - (remaining / totalSec) : 0;

  /* routine "sintetica" para el header del SessionShell: mismo lenguaje
     que Respira (code meta + nombre italic). La identidad vive en el header
     -> el TimerDial va sin modeLabel/subtitle para no duplicar el texto. */
  const routine = {
    code: t('topbar.mode.focus'),
    name: t('focus.subtitle.focus'),
  };

  /* Pantalla de completado: mismo SessionDone que Respira/Mueve. El Foco de
     un Camino siempre esta en Camino -> CTA "Siguiente" (onExit('done')
     avanza el Camino). */
  if (done) {
    return (
      <SessionDone
        routine={routine}
        onExit={onExit}
        accent="var(--focus)"
        accentSoft="var(--focus-soft)"
        doneMeta={t('session.focusDoneMeta')}
        doneCopy={t('session.focusDoneCopy')}
        stats={[{ label: t('common.time'), value: `${step.min || 25} min` }]}
        buttonStyle={{ background: 'var(--focus)', borderColor: 'var(--focus)' }}
        doneButtonLabel={t('session.next')}
        atmosphere="var(--focus-soft)"
      />
    );
  }

  const pauseLabel = running
    ? t('session.pause')
    : (remaining < totalSec ? t('session.resume') : t('session.startNow'));

  /* Tres controles DIFERENCIADOS por color (s99, peticion del usuario ->
     revisa s79: ya no es "mismo peso", el color marca la funcion):
       - Empezar/Pausar -> verde foco (accion principal)
       - Reiniciar       -> naranja/terracota
       - Saltar          -> gris (de-enfatiza saltarse el foco)
     Cada boton fija --pfbtn con su acento; el hover (tokens.css) rellena
     con ese mismo color. */
  const footer = (
    <React.Fragment>
      <button data-pace-path-btn onClick={toggle} style={pfBtn('var(--focus)', 'var(--focus-soft)')}>{pauseLabel}</button>
      <button data-pace-path-btn onClick={reset} style={pfBtn('var(--breathe)', 'var(--breathe-soft)')}>{t('focus.restart')}</button>
      <button data-pace-path-btn onClick={() => onExit('skip')} style={pfBtn('var(--ink-3)', 'var(--paper-3)')}>{t('path.runner.skip')}</button>
    </React.Fragment>
  );

  return (
    <SessionShell
      routine={routine}
      onExit={onExit}
      atmosphere="var(--focus-soft)"
      footer={footer}
      footerGap={12}
      hint={t('session.hint')}
    >
      {typeof TimerDial === 'function' ? (
        <TimerDial
          mins={mins}
          secs={secs}
          progress={progress}
          mode="foco"
          modeLabel=""
          subtitle={null}
          inner={null}
          running={running}
          ticks
        />
      ) : (
        <div style={{
          fontFamily: "'EB Garamond', Georgia, serif",
          fontSize: 96, fontWeight: 400,
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--ink)', lineHeight: 1,
        }}>
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </div>
      )}
    </SessionShell>
  );
}

/* Estilo de boton de control del Foco. `accent` colorea borde+texto y se
   expone como --pfbtn para que el hover (tokens.css) rellene con ese color;
   `soft` es el fondo en reposo. */
function pfBtn(accent, soft) {
  return {
    cursor: 'pointer',
    fontSize: 13,
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    borderRadius: 'var(--r-sm)',
    padding: '10px 22px',
    background: soft,
    border: '1px solid ' + accent,
    color: accent,
    transition: 'all 180ms var(--ease)',
    '--pfbtn': accent,
  };
}

Object.assign(window, { PathFocusStep });
