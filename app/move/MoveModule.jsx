/* PACE · Módulo Mueve (Calistenia / Fuerza)
   Librería + Sesión con pasos + timer

   v0.11.9 — SWAP de contenido (sesión 14):
   Las rutinas de calistenia y fuerza pasaron a este módulo (antes vivían
   en ExtraModule). Los estiramientos pasaron a ExtraModule (botón "Estira").
   Los ids (`move.*` / `extra.*`) y funciones de state (completeMoveSession /
   completeExtraSession) se conservan para no invalidar localStorage ni logros
   de usuarios existentes — solo cambia qué contenedor visual los muestra.

   F6 (s92): 7 → 14 rutinas, biblioteca agrupada como Respira/Estira.

   s110 (B2.2): MOVE_ROUTINES + getMoveRoutine salieron a app/move/move.data.js
   (regla <500 ln; el módulo crece con el contrato). MoveSession pasa a ser un
   DISPATCHER: rutinas con algún step `mode` van al runner del contrato v1
   (MoveSessionV1.jsx); el resto sigue el runner legacy (MoveSessionLegacy,
   idéntico a s109). R4: la completion acredita minutos REALES, no `routine.min`
   declarado (afecta a ambos runners; los declarados heredaban la mentira). */

const { useState: useStateMV, useEffect: useEffectMV, useRef: useRefMV } = React;

function MoveLibrary({ open, onClose, onStart }) {
  const { t, lang } = useT();
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };
  return (
    <Modal open={open} onClose={onClose} tagLabel={t('lib.tag')} title={t('lib.move.title')} subtitle={t('lib.move.subtitle')} maxWidth={860}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 8 }}>
        {Object.entries(MOVE_ROUTINES).map(([key, group]) => (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <h3 style={{ ...displayItalic, fontSize: 20, margin: 0, fontWeight: 500 }}>{tR(`mueve.cat.${key}.label`, group.label)}</h3>
              {group.aside && <Meta>{tR(`mueve.cat.${key}.aside`, group.aside)}</Meta>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
              {group.items.map(r => (
                <RoutineCard key={r.id} routine={r} color="var(--move)" onClick={() => onStart(r)} />
              ))}
            </div>
          </div>
        ))}
        {/* Tus rutinas — constructor premium (F7 · s93). Guard defensivo
            por si el orden de carga fallara (patrón s83). */}
        {typeof CustomRoutinesSection !== 'undefined' && (
          <CustomRoutinesSection onStart={onStart} />
        )}
      </div>
    </Modal>
  );
}

/* MoveSession — DISPATCHER (s110). Sin hooks propios: elige el runner según
   el contrato del dato. Una rutina es "v1" si algún step declara `mode`; las
   demás (22 de 28) siguen byte-idénticas en el runner legacy. El guard
   `typeof MoveSessionV1` degrada con gracia a legacy si el archivo del
   contrato aún no evaluó (ventana sub-segundo de la carrera de scripts). */
function MoveSession(props) {
  const { routine } = props;
  const isV1 = routine && routine.steps && routine.steps.some(s => s.mode);
  if (isV1 && typeof MoveSessionV1 === 'function') return <MoveSessionV1 {...props} />;
  return <MoveSessionLegacy {...props} />;
}

function MoveSessionLegacy({ routine, onExit, kind = 'move', inPath }) {
  const { t, tn, lang } = useT();
  // Atmosfera del step (s99): tinte del modulo SOLO en Camino (Mueve tan /
  // Estira azul-gris segun kind).
  const atmo = inPath ? (kind === 'extra' ? 'var(--extra-soft)' : 'var(--move-soft)') : undefined;
  // B1: acento por kind en TODA la sesion (prep, glifo, contador, barra,
  // done) — Estira deja de vivir en var(--move).
  const accent = kind === 'extra' ? 'var(--extra)' : 'var(--move)';
  const accentSoft = kind === 'extra' ? 'var(--extra-soft)' : 'var(--move-soft)';
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };
  // Rutinas custom (F7 · s93): sin keys posicionales `<id>.sN.*` — el EN se
  // resuelve por nombre canónico de ejercicio (content/custom.js), con
  // fallback al ES del dato. Las rutinas de catálogo no cambian de ruta.
  const isCustomRoutine = routine.id.indexOf('custom.') === 0;
  const tStep = (idx, field) => {
    const s = routine.steps[idx];
    return isCustomRoutine
      ? tR(`custom.ex.${s.name}.${field}`, s[field])
      : tR(`${routine.id}.s${idx}.${field}`, s[field]);
  };
  // Custom: name es texto del usuario y code llega ya localizado desde
  // CustomRoutinesSection — sin lookup (evita warns [i18n] en dev).
  const displayRoutine = lang === 'en' && !isCustomRoutine
    ? { ...routine, name: tR(`${routine.id}.name`, routine.name), code: tR(`${routine.id}.code`, routine.code) }
    : routine;
  const [stage, setStage] = useStateMV('prep'); // 'prep' | 'active' | 'done'
  // Despacha la completion correcta según el tipo (Mueve vs. Extra reutiliza
  // este componente). R4 (s110): acredita minutos REALES medidos, no el
  // `routine.min` declarado (las stats heredaban el número declarado).
  const dispatchComplete = () => {
    const realMin = Math.max(1, Math.round((Date.now() - sessionStart.current) / 60000));
    if (kind === 'extra') completeExtraSession(routine.id, realMin);
    else completeMoveSession(routine.id, realMin);
  };
  const [prepCount, setPrepCount] = useStateMV(3);
  const [stepIdx, setStepIdx] = useStateMV(0);
  const [elapsed, setElapsed] = useStateMV(0);
  const [paused, setPaused] = useStateMV(false);
  const sessionStart = useRefMV(Date.now());
  const step = routine.steps[stepIdx];

  // Preparación 3s
  useEffectMV(() => {
    if (stage !== 'prep' || paused) return;
    if (prepCount <= 0) { setStage('active'); sessionStart.current = Date.now(); return; }
    const t = setTimeout(() => setPrepCount(c => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [stage, prepCount, paused]);

  // Ticker del paso activo
  useEffectMV(() => {
    if (stage !== 'active' || paused) return;
    const intv = setInterval(() => {
      setElapsed(e => {
        if (e + 1 >= step.dur) {
          if (stepIdx + 1 >= routine.steps.length) {
            dispatchComplete();
            setStage('done');
            return 0;
          }
          setStepIdx(i => i + 1);
          return 0;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(intv);
  }, [stepIdx, paused, step, routine, stage]);

  // Atajos de teclado
  useEffectMV(() => {
    const onKey = (e) => {
      if (e.key === ' ') { e.preventDefault(); setPaused(p => !p); }
      if (e.key === 'Escape') onExit('exit');
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Enter' && stage === 'done') onExit('done');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage, stepIdx]);

  // Sonidos de sesión
  useEffectMV(() => {
    if (stage === 'active') { try { playSound('move.start'); } catch(e) {} }
    if (stage === 'done')   { try { playSound('move.end');   } catch(e) {} }
  }, [stage]);

  useEffectMV(() => {
    if (stage !== 'active') return;
    try { playSound('move.step'); } catch(e) {}
  }, [stepIdx]);

  const goNext = () => {
    if (stage !== 'active') return;
    if (stepIdx + 1 >= routine.steps.length) {
      dispatchComplete();
      setStage('done');
    } else {
      setStepIdx(stepIdx + 1); setElapsed(0);
    }
  };
  const goPrev = () => {
    if (stage !== 'active' || stepIdx === 0) return;
    setStepIdx(stepIdx - 1); setElapsed(0);
  };

  // PREPARACIÓN
  if (stage === 'prep') {
    return (
      <SessionPrep
        routine={displayRoutine}
        onExit={onExit}
        accent={accent}
        prepCount={prepCount}
        copy={tn('move.prepCopy', { n: routine.steps.length })}
        onSkip={() => { setPrepCount(0); setStage('active'); sessionStart.current = Date.now(); }}
        atmosphere={atmo}
      />
    );
  }

  // COMPLETADO
  if (stage === 'done') {
    const totalSec = Math.round((Date.now() - sessionStart.current) / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return (
      <SessionDone
        routine={displayRoutine}
        onExit={onExit}
        accent={accent}
        accentSoft={accentSoft}
        doneMeta={t('session.antidoteDone')}
        doneCopy={t('move.doneCopy')}
        stats={[
          { label: t('common.time'), value: `${mins}:${String(secs).padStart(2,'0')}` },
          { label: t('move.steps'),  value: String(routine.steps.length) },
        ]}
        buttonStyle={{ background: accent, borderColor: accent }}
        doneButtonLabel={inPath ? t('session.next') : undefined}
        atmosphere={atmo}
      />
    );
  }

  // ACTIVE
  const progress = elapsed / step.dur;
  const remaining = Math.max(0, step.dur - elapsed);
  const footer = (
    <React.Fragment>
      <button onClick={goPrev} disabled={stepIdx === 0} style={sessionShellStyles.ctrlBtn}>
        {t('move.prev')}
      </button>
      <button onClick={() => setPaused(p => !p)} style={sessionShellStyles.ctrlBtn}>
        {paused ? t('session.resume') : t('session.pause')}
      </button>
      <button onClick={goNext} style={sessionShellStyles.ctrlBtn}>
        {stepIdx + 1 >= routine.steps.length ? t('move.finish') : t('move.next')}
      </button>
    </React.Fragment>
  );
  return (
    <SessionShell
      routine={displayRoutine}
      onExit={onExit}
      atmosphere={atmo}
      headerExtra={<Meta>{tn('move.stepCount', { current: stepIdx + 1, total: routine.steps.length })}</Meta>}
      footer={footer}
      hint={t('move.hint')}
    >
      <div style={{ textAlign: 'center', maxWidth: 620 }}>
        <StepGlyph stepName={step.name} accent={accent} accentSoft={accentSoft} />
        <div style={{ fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', color: accent, marginBottom: 14, fontWeight: 500 }}>
          {tn('move.stepCount', { current: stepIdx + 1, total: routine.steps.length })}
        </div>
        <h1 style={{
          ...displayItalic,
          fontSize: 56, fontWeight: 500,
          lineHeight: 1.05, margin: '0 0 20px',
        }}>{tStep(stepIdx, 'name')}</h1>
        <p style={{
          fontSize: 17, lineHeight: 1.55, color: 'var(--ink-2)',
          maxWidth: 460, margin: '0 auto 22px',
        }}>{tStep(stepIdx, 'cue')}</p>

        {/* Numeral centrado entre la descripcion y "SEGUNDOS": espacio
            simetrico (22px arriba via cue / 22px abajo) + lineHeight algo
            mayor para que la cifra italica no roce la etiqueta (s97). */}
        <div data-pace-move-timer style={{
          ...displayItalic,
          fontSize: 128, fontWeight: 400, fontVariantNumeric: 'tabular-nums',
          color: 'var(--ink)', lineHeight: 1.08,
        }}>{String(remaining).padStart(2, '0')}</div>
        <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 22 }}>{t('session.seconds')}</div>
      </div>

      <div style={{ margin: '28px auto 0', width: '100%', maxWidth: 640 }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 10 }}>
          {routine.steps.map((s, i) => (
            <div key={i} style={{
              flex: s.dur,
              height: i === stepIdx ? 6 : 2,
              background: i < stepIdx ? accent : i === stepIdx ? 'var(--line)' : 'var(--paper-3)',
              borderRadius: 2, position: 'relative', overflow: 'hidden',
              transition: 'height 220ms',
            }}>
              {i === stepIdx && (
                <div style={{
                  position: 'absolute', inset: 0,
                  width: `${progress * 100}%`,
                  background: accent,
                  transition: 'width 1s linear',
                }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          {routine.steps[stepIdx + 1] ? `${t('move.next.prefix')} ${tStep(stepIdx + 1, 'name')}` : t('move.lastStep')}
        </div>
      </div>
    </SessionShell>
  );
}

/* MoveHeader y MoveStat (antes locales aquí) se fusionaron en sesión 26
   con SessionHeader/Stat de Breathe en app/ui/SessionShell.jsx. Ver
   docs/audits/audit-v0.12.7.md §3.1. */

/* Glifo por paso — círculo decorativo (moneda) con SVG canónico interior.
   La key es el step.name canónico en español (los datos viven en es-ES).
   El SVG viene de ExerciseGlyph; el fallback son tres arcos suaves.
   B1: acento por kind via props (Estira llega con --extra).
   s110: expuesto a window — lo comparte MoveSessionV1 (contrato v1). */
/* s112: prop `size` opcional — el runner v1 lo escala a visual instructivo
   (~150-240px según altura); el default 72/44 deja el legacy byte-idéntico. */
function StepGlyph({ stepName, accent = 'var(--move)', accentSoft = 'var(--move-soft)', size = 72 }) {
  return (
    <div style={{
      width: size, height: size, margin: '0 auto 20px',
      borderRadius: '50%',
      background: accentSoft,
      display: 'grid', placeItems: 'center',
      color: accent,
    }}>
      <ExerciseGlyph id={stepName} size={Math.round(size * 44 / 72)} />
    </div>
  );
}

/* moveSessionStyles local eliminado en sesión 26. El layout de sesión
   vive ahora en app/ui/SessionShell.jsx (sessionShellStyles). */

/* Responsive móvil — mismo patrón que SessionShell (sesión 27). */
const _paceMoveResponsive = document.getElementById('pace-move-responsive-css');
if (!_paceMoveResponsive) {
  const s = document.createElement('style');
  s.id = 'pace-move-responsive-css';
  s.textContent = `
    @media (max-width: 640px) {
      [data-pace-move-timer] {
        font-size: 72px !important;
      }
    }
  `;
  document.head.appendChild(s);
}

/* getMoveRoutine + MOVE_ROUTINES → app/move/move.data.js (split s110). */
Object.assign(window, { MoveLibrary, MoveSession, StepGlyph });
