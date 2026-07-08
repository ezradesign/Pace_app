/* PACE · Módulo Foco (Pomodoro)
   Temporizador funcional real. 4 estilos visuales de tweaks.
*/

const { useState: useStateFT, useEffect: useEffectFT, useRef: useRefFT } = React;

function FocusTimer({ onFinish }) {
  const [state, set] = usePace();
  const { t } = useT();

  /* Motor de cuenta atras basado en timestamps (s96 · app/focus/useCountdown).
     `remaining` se deriva del reloj real, no de un contador que se decrementa:
     la pestana oculta ya no subcuenta. `durationSec` cambia con el modo/minutos
     y el hook resetea a idle (reemplaza el antiguo efecto de reset). Sin
     persistencia: recargar resetea el Pomodoro como antes. */
  const durationSec = (state.focusMode === 'foco' ? state.focusMinutes
                     : state.focusMode === 'pausa' ? 5
                     : 15) * 60;

  const { remaining, running, status, toggle, reset } = useCountdown(durationSec, () => {
    /* Sonido de cierre — campana suave (do+sol+do6) que marca el fin del
       bloque, sea foco, pausa o larga. Respeta soundOn (noop si apagado). */
    try { playSound('pomodoro.end'); } catch (e) {}
    /* Solo el modo foco acredita: cycle + logros de pomodoro via
       completeFocusSession('home') -> completePomodoro. Pausa(5)/larga(15)
       tickan y suenan pero NO acreditan (decision historica). El hook fija la
       ultima onComplete en un ref, asi que este cierre lee el focusMode
       vigente; un cambio de modo resetea el timer antes de poder completar. */
    if (state.focusMode === 'foco') {
      completeFocusSession('home');
      onFinish && onFinish();
    }
  });

  // Drone ambiente — efecto paralelo (no toca el ticker ni la lógica de logros)
  useEffectFT(() => {
    if (!window.ambientDrone) return;
    const drone = window.ambientDrone;

    if (state.focusMode !== 'foco') { drone.stop(800); return; }
    if (remaining === 0)            { drone.stop(800); return; }

    if (running) {
      if (drone.isActive()) {
        drone.resume();
      } else {
        // activar ambientOn mid-sesión no arranca el drone retroactivamente
        // — solo arranca al inicio de una sesión nueva
        drone.start();
      }
    } else {
      if (drone.isActive()) drone.pause();
    }
  }, [running, state.focusMode, remaining]);

  // Apagar soundOn durante sesión → fadeout inmediato
  useEffectFT(() => {
    if (!state.soundOn && window.ambientDrone && window.ambientDrone.isActive()) {
      window.ambientDrone.stop(400);
    }
  }, [state.soundOn]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const totalSec = durationSec;
  const progress = 1 - (remaining / totalSec);

  const modeLabel = state.focusMode === 'foco' ? t('focus.mode.focus')
                  : state.focusMode === 'pausa' ? t('focus.mode.pause')
                  : t('focus.mode.long');
  const subtitle = state.focusMode === 'foco' ? t('focus.subtitle.focus')
                 : state.focusMode === 'pausa' ? t('focus.subtitle.pause')
                 : t('focus.subtitle.long');

  const isAro = state.timerStyle === 'aro';
  const runningLabel = running ? t('focus.pause') : (remaining === totalSec ? t('focus.start') : t('focus.continue'));

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
      <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginLeft: 10 }}>{t('focus.cycle')}</span>
    </div>
  );

  /* Bloque de controles + ciclo inyectado DENTRO del aro (layout ref. usuario).
     Para otros estilos se renderiza debajo en un bloque aparte. */
  const controls = (
    <div style={focusStyles.controlsTight}>
      <button
        onClick={() => {
          // Sonido de inicio solo en un arranque/reanudacion real (idle|paused
          // -> running). Pausar no suena; 'completed' es no-op (no re-credita).
          if (status !== 'running' && status !== 'completed') {
            try { playSound('pomodoro.start'); } catch (e) {}
          }
          toggle();
        }}
        style={running ? focusStyles.startBtnSecondary : focusStyles.startBtnPrimary}
      >
        <span style={{ fontSize: 11, lineHeight: 1 }}>{running ? '❚❚' : '▶'}</span>
        <span>{runningLabel}</span>
      </button>
      <button onClick={reset} style={focusStyles.resetCircle} title={t('focus.restart')} aria-label={t('focus.restart')}>
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
  const { t } = useT();
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

/* ===================== */
/* TIMER VISUALIZATIONS */
/* ===================== */
/* TimerVisualization — sesión 37: circle y numero eliminados (rotos).
   Opciones válidas: aro (default), barra, analogico.
   Sesion 76: el aro se renderiza via TimerDial compartido (ui/TimerDial.jsx)
   para alinear pixel-a-pixel con PathFocusStep. interpolateRingColor vive
   ahora en TimerDial.jsx. */
function TimerVisualization({ style, mins, secs, progress, mode, modeLabel, subtitle, inner }) {
  if (style === 'barra') return <TimerBar mins={mins} secs={secs} progress={progress} modeLabel={modeLabel} subtitle={subtitle} />;
  if (style === 'analogico') return <TimerAnalog mins={mins} secs={secs} progress={progress} modeLabel={modeLabel} subtitle={subtitle} />;
  return <TimerDial mins={mins} secs={secs} progress={progress} mode={mode} modeLabel={modeLabel} subtitle={subtitle} inner={inner} />;
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

  /* NOTA s76: los estilos aroFrame/aroInner/modeLabel/numberHuge/
     subtitleItalic/innerDivider vivian aqui y ahora viven en
     app/ui/TimerDial.jsx (timerDialStyles), compartidos con
     PathFocusStep. */

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
    background: 'var(--focus-cta)',
    color: 'var(--paper)',
    borderRadius: 'var(--r-xs)',
    fontSize: 12,
    letterSpacing: 0.3,
    fontWeight: 500,
    border: '1px solid var(--focus-cta)',
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