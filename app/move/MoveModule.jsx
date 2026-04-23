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
      <h3 style={{ ...displayItalic, fontSize: 20, margin: '0 0 12px', fontWeight: 500 }}>Rutinas</h3>
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
      <SessionPrep
        routine={routine}
        onExit={onExit}
        accent="var(--move)"
        prepCount={prepCount}
        copy={`De pie. Sin prisa. ${routine.steps.length} pasos.`}
        onSkip={() => { setPrepCount(0); setStage('active'); sessionStart.current = Date.now(); }}
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
        routine={routine}
        onExit={onExit}
        accent="var(--move)"
        accentSoft="var(--move-soft)"
        doneMeta="Antídoto completado"
        doneCopy="El cuerpo vuelve a sentirse tuyo."
        stats={[
          { label: 'Tiempo', value: `${mins}:${String(secs).padStart(2,'0')}` },
          { label: 'Pasos',  value: String(routine.steps.length) },
        ]}
        buttonStyle={{ background: 'var(--move)', borderColor: 'var(--move)' }}
      />
    );
  }

  // ACTIVE
  const progress = elapsed / step.dur;
  const remaining = Math.max(0, step.dur - elapsed);
  const footer = (
    <React.Fragment>
      <button onClick={goPrev} disabled={stepIdx === 0} style={sessionShellStyles.ctrlBtn} title="←">
        ← Anterior
      </button>
      <button onClick={() => setPaused(p => !p)} style={sessionShellStyles.ctrlBtn} title="Espacio">
        {paused ? '▶ Reanudar' : '❚❚ Pausar'}
      </button>
      <button onClick={goNext} style={sessionShellStyles.ctrlBtn} title="→">
        {stepIdx + 1 >= routine.steps.length ? 'Terminar' : 'Siguiente →'}
      </button>
    </React.Fragment>
  );
  return (
    <SessionShell
      routine={routine}
      onExit={onExit}
      headerExtra={<Meta>Paso {stepIdx + 1} / {routine.steps.length}</Meta>}
      footer={footer}
      hint="← → navegar · Espacio pausar · Esc salir"
    >
      <div style={{ textAlign: 'center', maxWidth: 620 }}>
        <StepGlyph tag={routine.tag} stepIdx={stepIdx} />
        <div style={{ fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--move)', marginBottom: 14, fontWeight: 500 }}>
          Paso {stepIdx + 1} de {routine.steps.length}
        </div>
        <h1 style={{
          ...displayItalic,
          fontSize: 56, fontWeight: 500,
          lineHeight: 1.05, margin: '0 0 20px',
        }}>{step.name}</h1>
        <p style={{
          fontSize: 17, lineHeight: 1.55, color: 'var(--ink-2)',
          maxWidth: 460, margin: '0 auto 30px',
        }}>{step.cue}</p>

        <div style={{
          ...displayItalic,
          fontSize: 128, fontWeight: 400, fontVariantNumeric: 'tabular-nums',
          color: 'var(--ink)', lineHeight: 1,
        }}>{String(remaining).padStart(2, '0')}</div>
        <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 8 }}>segundos</div>
      </div>

      <div style={{ margin: '28px auto 0', width: '100%', maxWidth: 640 }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 10 }}>
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
    </SessionShell>
  );
}

/* MoveHeader y MoveStat (antes locales aquí) se fusionaron en sesión 26
   con SessionHeader/Stat de Breathe en app/ui/SessionShell.jsx. Ver
   docs/audits/audit-v0.12.7.md §3.1. */

/* Glifo placeholder por paso — círculo con símbolo de categoría.
   Proyecta sensación de "ficha de biblioteca" hasta que tengamos ilustraciones reales. */
function StepGlyph({ tag, stepIdx }) {
  const symbols = ['◯', '◬', '◇', '△', '▢', '⬡', '✦'];
  const sym = symbols[stepIdx % symbols.length];
  return (
    <div style={{
      ...displayItalic,
      width: 72, height: 72, margin: '0 auto 20px',
      borderRadius: '50%',
      border: '1px dashed var(--move)',
      background: 'var(--move-soft)',
      display: 'grid', placeItems: 'center',
      color: 'var(--move)',
      fontSize: 28,
    }}>
      {sym}
    </div>
  );
}

/* moveSessionStyles local eliminado en sesión 26. El layout de sesión
   vive ahora en app/ui/SessionShell.jsx (sessionShellStyles). */

/* Export a window: sólo lo consumido fuera del módulo.
   MOVE_ROUTINES se saneó (audit §4.1) — sigue como const local. */
Object.assign(window, { MoveLibrary, MoveSession });
