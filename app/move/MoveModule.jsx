/* PACE · Módulo Mueve (Calistenia / Fuerza)
   Librería + Sesión con pasos + timer

   v0.11.9 — SWAP de contenido (sesión 14):
   Las rutinas de calistenia y fuerza pasaron a este módulo (antes vivían
   en ExtraModule). Los estiramientos pasaron a ExtraModule (botón "Estira").
   Los ids (`move.*` / `extra.*`) y funciones de state (completeMoveSession /
   completeExtraSession) se conservan para no invalidar localStorage ni logros
   de usuarios existentes — solo cambia qué contenedor visual los muestra.
*/

const { useState: useStateMV, useEffect: useEffectMV } = React;

const MOVE_ROUTINES = [
  { id: 'extra.desk.pushups', tag: 'PUSH', code: 'Fuerza', name: 'Flexiones de escritorio', desc: 'Inclinado contra mesa. 3 series.', min: 2,
    steps: [
      { name: 'Flexiones inclinadas', dur: 30, cue: '12 reps contra escritorio.' },
      { name: 'Descanso', dur: 20, cue: 'Respira.' },
      { name: 'Flexiones inclinadas', dur: 30, cue: '10 reps.' },
      { name: 'Descanso', dur: 20, cue: 'Respira.' },
      { name: 'Flexiones inclinadas', dur: 30, cue: '8 reps lentas.' },
    ]},
  { id: 'extra.chair.dips', tag: 'PULL', code: 'Tríceps', name: 'Fondos en silla', desc: 'Tríceps en 3 series.', min: 3,
    steps: [
      { name: 'Fondos en silla', dur: 40, cue: '10-12 reps con buen control.' },
      { name: 'Descanso', dur: 30, cue: '' },
      { name: 'Fondos en silla', dur: 40, cue: '10 reps.' },
      { name: 'Descanso', dur: 30, cue: '' },
      { name: 'Fondos en silla', dur: 40, cue: 'Al fallo.' },
    ]},
  { id: 'extra.wall.sit', tag: 'LEG', code: 'Piernas', name: 'Sentadilla en pared', desc: 'Isométrico cuádriceps.', min: 3,
    steps: [
      { name: 'Wall sit', dur: 60, cue: 'Rodillas 90°, aguanta.' },
      { name: 'Descanso', dur: 30, cue: 'Suave.' },
      { name: 'Wall sit', dur: 60, cue: 'Más bajo si puedes.' },
    ]},
  { id: 'extra.calves', tag: 'STEALTH', code: 'Gemelos', name: 'Gemelos subrepticios', desc: 'Bajo la mesa, nadie se entera.', min: 1,
    steps: [
      { name: 'Calf raises', dur: 30, cue: '25 reps controladas.' },
      { name: 'Calf raises', dur: 30, cue: '20 reps más lentas.' },
    ]},
  { id: 'extra.core.stealth', tag: 'CORE', code: 'Core', name: 'Core silencioso', desc: 'Hollow hold en silla.', min: 2,
    steps: [
      { name: 'Seated hollow', dur: 30, cue: 'Eleva piernas, apoya baja espalda.' },
      { name: 'Descanso', dur: 20, cue: '' },
      { name: 'Seated hollow', dur: 30, cue: 'Aguanta.' },
      { name: 'Descanso', dur: 20, cue: '' },
      { name: 'Seated hollow', dur: 30, cue: 'Al límite.' },
    ]},
  { id: 'extra.grip.squeeze', tag: 'GRIP', code: 'Antebrazos', name: 'Grip + antebrazos', desc: 'Apretar, estirar.', min: 1,
    steps: [
      { name: 'Squeeze fist', dur: 20, cue: 'Aprieta fuerte 20 veces.' },
      { name: 'Finger extension', dur: 20, cue: 'Estira dedos al máximo.' },
      { name: 'Wrist stretch', dur: 20, cue: 'Muñeca flexión + extensión.' },
    ]},
  { id: 'extra.posture.set', tag: 'POST', code: 'Postura', name: 'Postura reset', desc: 'Chin tucks, scapular squeeze, thoracic ext.', min: 2,
    steps: [
      { name: 'Chin tucks', dur: 30, cue: '10 reps, barbilla atrás.' },
      { name: 'Scapular squeeze', dur: 30, cue: 'Junta omóplatos, 10 reps.' },
      { name: 'Thoracic extension', dur: 30, cue: 'Arquea sobre silla.' },
      { name: 'Chest opener', dur: 30, cue: 'Brazos atrás, expande pecho.' },
    ]},
];

function MoveLibrary({ open, onClose, onStart }) {
  return (
    <Modal open={open} onClose={onClose} tagLabel="Biblioteca" title="Mueve" subtitle="Calistenia y fuerza. Corto, discreto, sin equipo." maxWidth={820}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -30, marginBottom: 10 }}>
        <Meta>Cuerpo activo</Meta>
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, margin: '0 0 12px', fontWeight: 500 }}>Rutinas</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
        {MOVE_ROUTINES.map(r => (
          <RoutineCard key={r.id} routine={r} color="var(--move)" onClick={() => onStart(r)} />
        ))}
      </div>
    </Modal>
  );
}

function MoveSession({ routine, onExit, kind = 'move' }) {
  const { useRef: useRefMV } = React;
  const [stage, setStage] = useStateMV('prep'); // 'prep' | 'active' | 'done'
  // Despacha la completion correcta según el tipo (Mueve vs. Extra reutiliza este componente)
  const dispatchComplete = () => {
    if (kind === 'extra') completeExtraSession(routine.id, routine.min);
    else completeMoveSession(routine.id, routine.min);
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
      <div style={moveSessionStyles.root}>
        <MoveHeader routine={routine} onExit={onExit} />
        <div style={moveSessionStyles.center}>
          <div style={{ textAlign: 'center', maxWidth: 460 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 18 }}>Prepárate</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 200, fontWeight: 400, lineHeight: 0.9,
              color: 'var(--move)',
              fontVariantNumeric: 'tabular-nums',
            }}>{prepCount > 0 ? prepCount : '·'}</div>
            <div style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink-2)', marginTop: 20 }}>
              De pie. Sin prisa. {routine.steps.length} pasos.
            </div>
          </div>
        </div>
        <div style={moveSessionStyles.footer}>
          <button onClick={() => { setPrepCount(0); setStage('active'); sessionStart.current = Date.now(); }} style={moveSessionStyles.ctrlBtn}>
            Empezar ahora
          </button>
        </div>
      </div>
    );
  }

  // COMPLETADO
  if (stage === 'done') {
    const totalSec = Math.round((Date.now() - sessionStart.current) / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return (
      <div style={moveSessionStyles.root}>
        <MoveHeader routine={routine} onExit={onExit} />
        <div style={moveSessionStyles.center}>
          <div style={{ textAlign: 'center', maxWidth: 520 }}>
            <div style={{
              width: 120, height: 120, margin: '0 auto 24px',
              borderRadius: '50%', background: 'var(--move-soft)',
              border: '1.5px solid var(--move)',
              display: 'grid', placeItems: 'center',
              animation: 'pace-fade-in 600ms ease',
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--move)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 }}>
              Antídoto completado
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 56, fontWeight: 500, margin: '0 0 24px', lineHeight: 1.05,
            }}>{routine.name}</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 36 }}>
              <MoveStat label="Tiempo" value={`${mins}:${String(secs).padStart(2,'0')}`} />
              <MoveStat label="Pasos" value={String(routine.steps.length)} />
            </div>
            <p style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink-2)', maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.5 }}>
              El cuerpo vuelve a sentirse tuyo.
            </p>
          </div>
        </div>
        <div style={moveSessionStyles.footer}>
          <Button onClick={() => onExit('done')} style={{ background: 'var(--move)', borderColor: 'var(--move)' }}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  // ACTIVE
  const progress = elapsed / step.dur;
  const remaining = Math.max(0, step.dur - elapsed);
  return (
    <div style={moveSessionStyles.root}>
      <MoveHeader routine={routine} onExit={onExit}
        extra={<Meta>Paso {stepIdx + 1} / {routine.steps.length}</Meta>} />

      <div style={moveSessionStyles.center}>
        <div style={{ textAlign: 'center', maxWidth: 620 }}>
          <StepGlyph tag={routine.tag} stepIdx={stepIdx} />
          <div style={{ fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--move)', marginBottom: 14, fontWeight: 500 }}>
            Paso {stepIdx + 1} de {routine.steps.length}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 56, fontWeight: 500,
            lineHeight: 1.05, margin: '0 0 20px',
          }}>{step.name}</h1>
          <p style={{
            fontSize: 17, lineHeight: 1.55, color: 'var(--ink-2)',
            maxWidth: 460, margin: '0 auto 30px',
          }}>{step.cue}</p>

          <div style={{
            fontSize: 128, fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontWeight: 400, fontVariantNumeric: 'tabular-nums',
            color: 'var(--ink)', lineHeight: 1,
          }}>{String(remaining).padStart(2, '0')}</div>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 8 }}>segundos</div>
        </div>
      </div>

      <div style={moveSessionStyles.rulerWrap}>
        <div style={moveSessionStyles.ruler}>
          {routine.steps.map((s, i) => (
            <div key={i} style={{
              flex: s.dur,
              height: i === stepIdx ? 6 : 2,
              background: i < stepIdx ? 'var(--move)' : i === stepIdx ? 'var(--line)' : 'var(--paper-3)',
              borderRadius: 2, position: 'relative', overflow: 'hidden',
              transition: 'height 220ms',
            }}>
              {i === stepIdx && (
                <div style={{
                  position: 'absolute', inset: 0,
                  width: `${progress * 100}%`,
                  background: 'var(--move)',
                  transition: 'width 1s linear',
                }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          {routine.steps[stepIdx + 1] ? `Siguiente: ${routine.steps[stepIdx + 1].name}` : 'Último paso'}
        </div>
      </div>

      <div style={moveSessionStyles.footer}>
        <button onClick={goPrev} disabled={stepIdx === 0} style={moveSessionStyles.ctrlBtn} title="←">
          ← Anterior
        </button>
        <button onClick={() => setPaused(p => !p)} style={moveSessionStyles.ctrlBtn} title="Espacio">
          {paused ? '▶ Reanudar' : '❚❚ Pausar'}
        </button>
        <button onClick={goNext} style={moveSessionStyles.ctrlBtn} title="→">
          {stepIdx + 1 >= routine.steps.length ? 'Terminar' : 'Siguiente →'}
        </button>
      </div>
      <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', opacity: 0.6 }}>
        ← → navegar · Espacio pausar · Esc salir
      </div>
    </div>
  );
}

function MoveHeader({ routine, onExit, extra }) {
  return (
    <div style={moveSessionStyles.header}>
      <div>
        <Meta>{routine.code}</Meta>
        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, margin: '2px 0 0', fontWeight: 500 }}>{routine.name}</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {extra}
        <button onClick={() => onExit('exit')} style={moveSessionStyles.exitBtn}>× Salir</button>
      </div>
    </div>
  );
}

function MoveStat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
        fontSize: 40, fontWeight: 500, lineHeight: 1,
        color: 'var(--ink)',
      }}>{value}</div>
      <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 8 }}>
        {label}
      </div>
    </div>
  );
}

/* Glifo placeholder por paso — círculo con símbolo de categoría.
   Proyecta sensación de "ficha de biblioteca" hasta que tengamos ilustraciones reales. */
function StepGlyph({ tag, stepIdx }) {
  const symbols = ['◯', '◬', '◇', '△', '▢', '⬡', '✦'];
  const sym = symbols[stepIdx % symbols.length];
  return (
    <div style={{
      width: 72, height: 72, margin: '0 auto 20px',
      borderRadius: '50%',
      border: '1px dashed var(--move)',
      background: 'var(--move-soft)',
      display: 'grid', placeItems: 'center',
      color: 'var(--move)',
      fontFamily: 'var(--font-display)',
      fontSize: 28,
      fontStyle: 'italic',
    }}>
      {sym}
    </div>
  );
}

const moveSessionStyles = {
  root: {
    position: 'fixed', inset: 0,
    background: 'var(--paper)',
    zIndex: 90,
    display: 'flex',
    flexDirection: 'column',
    padding: '28px 48px 40px',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  exitBtn: { fontSize: 13, color: 'var(--ink-2)', padding: '6px 10px' },
  center: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  rulerWrap: { margin: '0 auto 20px', width: '100%', maxWidth: 640 },
  ruler: {
    display: 'flex', gap: 4,
    alignItems: 'center',
    height: 10,
  },
  footer: {
    display: 'flex', gap: 12, justifyContent: 'center',
  },
  ctrlBtn: {
    padding: '10px 22px',
    fontSize: 13,
    border: '1px solid var(--line-2)',
    borderRadius: 'var(--r-md)',
    background: 'var(--paper-2)',
    color: 'var(--ink)',
  },
};

Object.assign(window, { MoveLibrary, MoveSession, MOVE_ROUTINES });
