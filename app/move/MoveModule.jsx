/* PACE · Módulo Mueve (Calistenia / Fuerza)
   Librería + Sesión con pasos + timer

   v0.11.9 — SWAP de contenido (sesión 14):
   Las rutinas de calistenia y fuerza pasaron a este módulo (antes vivían
   en ExtraModule). Los estiramientos pasaron a ExtraModule (botón "Estira").
   Los ids (`move.*` / `extra.*`) y funciones de state (completeMoveSession /
   completeExtraSession) se conservan para no invalidar localStorage ni logros
   de usuarios existentes — solo cambia qué contenedor visual los muestra.

   F6 (s92): 7 → 14 rutinas, biblioteca agrupada como Respira/Estira
   (4 grupos, free primero dentro de cada grupo). Inspiración: Strengthside
   (progresiones de empuje, unilateral, colgarse) + Jess Martin (fuerza
   discreta de oficina). Los pasos nuevos sin glifo aprobado renderizan
   DefaultGlyph hasta el port (D-4). */

const { useState: useStateMV, useEffect: useEffectMV, useRef: useRefMV } = React;

const MOVE_ROUTINES = {
  empuje: {
    label: 'Empuje y tracción',
    aside: 'Pecho, brazos, espalda alta',
    items: [
      { id: 'extra.desk.pushups', tag: 'PUSH', code: 'Fuerza', name: 'Flexiones de escritorio', desc: 'Inclinado contra mesa. 3 series.', min: 2,
        steps: [
          { name: 'Flexiones inclinadas', dur: 30, cue: '12 reps contra escritorio.' },
          { name: 'Descanso', dur: 20, cue: 'Respira.' },
          { name: 'Flexiones inclinadas', dur: 30, cue: '10 reps.' },
          { name: 'Descanso', dur: 20, cue: 'Respira.' },
          { name: 'Flexiones inclinadas', dur: 30, cue: '8 reps lentas.' },
        ]},
      { id: 'extra.chair.dips', tag: 'PUSH', code: 'Tríceps', name: 'Fondos en silla', desc: 'Tríceps en 3 series. Silla estable y sin ruedas.', min: 3,
        steps: [
          { name: 'Fondos en silla', dur: 40, cue: '10-12 reps con buen control.' },
          { name: 'Descanso', dur: 30, cue: '' },
          { name: 'Fondos en silla', dur: 40, cue: '10 reps.' },
          { name: 'Descanso', dur: 30, cue: '' },
          { name: 'Fondos en silla', dur: 40, cue: 'Última: 8 reps limpias. Para si la técnica se rompe.' },
        ]},
      { id: 'extra.push.ladder', tag: 'PUSH', code: 'Empuje', name: 'Empuje · progresión', desc: 'Del escritorio a la pica. Empuje completo.', min: 3, access: 'premium',
        steps: [
          { name: 'Flexiones inclinadas', dur: 40, cue: '10 reps profundas, codos cerca del cuerpo.' },
          { name: 'Descanso', dur: 20, cue: 'Respira.' },
          { name: 'Pica en escritorio', dur: 40, cue: 'Cadera arriba, cabeza entre los brazos. 8 reps.' },
          { name: 'Descanso', dur: 20, cue: 'Respira.' },
          { name: 'Flexiones inclinadas', dur: 45, cue: 'Negativas: baja en 5 segundos, sube normal.' },
        ]},
      { id: 'extra.hang.bar', tag: 'HANG', code: 'Tracción', name: 'Colgarse', desc: 'De una barra firme que soporte tu peso. Tracción suave para hombros y espalda.', min: 2, access: 'premium',
        steps: [
          { name: 'Hang pasivo', dur: 30, cue: 'Cuelga relajado. Respira.' },
          { name: 'Descanso', dur: 20, cue: 'Sacude los brazos.' },
          { name: 'Hang activo', dur: 30, cue: 'Hombros abajo y atrás, codos rectos.' },
          { name: 'Descanso', dur: 20, cue: 'Sacude los brazos.' },
          { name: 'Hang pasivo', dur: 30, cue: 'Suelta del todo. Deja que la espalda se abra.' },
        ]},
    ]
  },
  sigilo: {
    label: 'Sigilo',
    aside: 'Nadie se entera',
    items: [
      { id: 'extra.calves', tag: 'STEALTH', code: 'Gemelos', name: 'Gemelos subrepticios', desc: 'Bajo la mesa, nadie se entera.', min: 1,
        steps: [
          { name: 'Calf raises', dur: 30, cue: '25 reps controladas.' },
          { name: 'Calf raises', dur: 30, cue: '20 reps más lentas.' },
        ]},
      { id: 'extra.grip.squeeze', tag: 'GRIP', code: 'Antebrazos', name: 'Grip + antebrazos', desc: 'Apretar, estirar.', min: 1,
        steps: [
          { name: 'Squeeze fist', dur: 20, cue: 'Aprieta fuerte 20 veces.' },
          { name: 'Finger extension', dur: 20, cue: 'Abre bien los dedos, sin forzar.' },
          { name: 'Wrist stretch', dur: 20, cue: 'Muñeca flexión + extensión.' },
        ]},
      { id: 'extra.glutes.stealth', tag: 'STEALTH', code: 'Glúteos', name: 'Glúteos invisibles', desc: 'Actívalos sentado. Invisible total.', min: 2,
        steps: [
          { name: 'Apretar glúteos', dur: 30, cue: '20 apretones firmes, 2 segundos cada uno.' },
          { name: 'Descanso', dur: 15, cue: 'Suelta.' },
          { name: 'Apretar glúteos', dur: 30, cue: 'Aguanta 10 segundos, suelta. 3 veces.' },
          { name: 'Calf raises', dur: 30, cue: 'Cierra con 20 elevaciones suaves.' },
        ]},
      { id: 'extra.core.stealth', tag: 'CORE', code: 'Core', name: 'Core silencioso', desc: 'Hollow hold en silla.', min: 2, access: 'premium',
        steps: [
          { name: 'Seated hollow', dur: 30, cue: 'Eleva piernas, apoya baja espalda.' },
          { name: 'Descanso', dur: 20, cue: '' },
          { name: 'Seated hollow', dur: 30, cue: 'Mantén. Respira normal.' },
          { name: 'Descanso', dur: 20, cue: '' },
          { name: 'Seated hollow', dur: 30, cue: 'Última. Mantén mientras la lumbar siga apoyada.' },
        ]},
    ]
  },
  piernas: {
    label: 'Piernas',
    aside: 'La base del cuerpo',
    items: [
      { id: 'extra.chair.squats', tag: 'LEG', code: 'Piernas', name: 'Sentadillas de silla', desc: 'Levántate y siéntate. La fuerza más útil. Silla estable, sin ruedas.', min: 3,
        steps: [
          { name: 'Sentadilla a silla', dur: 40, cue: '10-12 reps: baja hasta rozar la silla, sube sin impulso.' },
          { name: 'Descanso', dur: 20, cue: 'Respira.' },
          { name: 'Sentadilla a silla', dur: 40, cue: '10 reps más lentas.' },
          { name: 'Descanso', dur: 20, cue: 'Respira.' },
          { name: 'Sentadilla a silla', dur: 40, cue: 'Últimas 8, control total.' },
        ]},
      { id: 'extra.wall.sit', tag: 'LEG', code: 'Piernas', name: 'Sentadilla en pared', desc: 'Isométrico de cuádriceps contra una pared.', min: 2, access: 'premium',
        steps: [
          { name: 'Wall sit', dur: 60, cue: 'Rodillas a 90°, espalda en la pared. Respira normal.' },
          { name: 'Descanso', dur: 30, cue: 'Suave.' },
          { name: 'Wall sit', dur: 60, cue: 'Segunda tanda. Elige una altura que te deje respirar tranquilo.' },
        ]},
      { id: 'extra.legs.single', tag: 'LEG', code: 'Unilateral', name: 'Piernas · a una', desc: 'Fuerza a una pierna. Equilibrio, control y una silla estable.', min: 4, access: 'premium',
        steps: [
          { name: 'Sentadilla búlgara', dur: 50, cue: 'Empeine sobre la silla, baja vertical. 8 por pierna.' },
          { name: 'Descanso', dur: 20, cue: 'Respira.' },
          { name: 'ATG split squat', dur: 50, cue: 'Zancada profunda. Rodilla va por delante del pie.' },
          { name: 'Descanso', dur: 20, cue: 'Respira.' },
          { name: 'Sissy squat', dur: 45, cue: 'Apoyado. Rodillas adelante, talones arriba.' },
          { name: 'Calf raises', dur: 40, cue: 'A una pierna, 12 por lado.' },
        ]},
    ]
  },
  espalda: {
    label: 'Espalda y core',
    aside: 'Sostén de la postura',
    items: [
      { id: 'extra.posture.set', tag: 'POST', code: 'Postura', name: 'Postura reset', desc: 'Chin tucks, scapular squeeze, thoracic ext.', min: 2,
        steps: [
          { name: 'Chin tucks', dur: 30, cue: '10 reps, barbilla atrás.' },
          { name: 'Scapular squeeze', dur: 30, cue: 'Junta omóplatos, 10 reps.' },
          { name: 'Thoracic extension', dur: 30, cue: 'Arquea sobre silla.' },
          { name: 'Chest opener', dur: 30, cue: 'Brazos atrás, expande pecho.' },
        ]},
      { id: 'extra.back.desk', tag: 'BACK', code: 'Espalda', name: 'Espalda de oficina', desc: 'Despierta la espalda que sostiene tu postura. Un paso pasa por el suelo.', min: 3,
        steps: [
          { name: 'Scapular squeeze', dur: 40, cue: 'Junta omóplatos 12 veces, 2 segundos cada una.' },
          { name: 'Band pull-apart', dur: 40, cue: 'Sin banda: brazos cruzados + abre con tensión.' },
          { name: 'Superman', dur: 40, cue: 'Boca abajo: eleva pecho y brazos, 10 veces lentas.' },
          { name: 'Apertura de pecho', dur: 40, cue: 'Manos tras la nuca, abre codos, mira al techo.' },
        ]},
      { id: 'extra.core.plank', tag: 'CORE', code: 'Core', name: 'Core · plancha', desc: 'Planchas y hollow, en el suelo. El centro que sostiene todo.', min: 4, access: 'premium',
        steps: [
          { name: 'Plancha', dur: 45, cue: 'Antebrazos, cuerpo en línea. Aprieta glúteos.' },
          { name: 'Descanso', dur: 20, cue: 'Respira.' },
          { name: 'Plancha lateral', dur: 60, cue: '30 segundos por lado, cadera alta.' },
          { name: 'Descanso', dur: 20, cue: 'Respira.' },
          { name: 'Hollow hold', dur: 30, cue: 'Tumbado: lumbar al suelo, piernas y hombros arriba.' },
          { name: 'Plancha', dur: 30, cue: 'Última. Respira dentro de la tensión.' },
        ]},
    ]
  },
};

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

function MoveSession({ routine, onExit, kind = 'move', inPath }) {
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
   B1: acento por kind via props (Estira llega con --extra). */
function StepGlyph({ stepName, accent = 'var(--move)', accentSoft = 'var(--move-soft)' }) {
  return (
    <div style={{
      width: 72, height: 72, margin: '0 auto 20px',
      borderRadius: '50%',
      background: accentSoft,
      display: 'grid', placeItems: 'center',
      color: accent,
    }}>
      <ExerciseGlyph id={stepName} size={44} />
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

/* Sesión 49 — helper de lookup para Caminos (s92: adaptado a grupos) */
function getMoveRoutine(id) {
  for (const group of Object.values(MOVE_ROUTINES)) {
    const found = group.items.find(r => r.id === id);
    if (found) return found;
  }
  return null;
}
window.getMoveRoutine = getMoveRoutine;
Object.assign(window, { MoveLibrary, MoveSession });
