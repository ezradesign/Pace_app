/* PACE · Módulo Extra (Calistenia oficina) */

const EXTRA_ROUTINES = [
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

function ExtraLibrary({ open, onClose, onStart }) {
  return (
    <Modal open={open} onClose={onClose} tagLabel="Biblioteca" title="Extra" subtitle="Calistenia de oficina. Cortos, discretos, sin equipo." maxWidth={820}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, marginTop: 16 }}>
        {EXTRA_ROUTINES.map(r => (
          <RoutineCard key={r.id} routine={r} color="var(--extra)" onClick={() => onStart(r)} />
        ))}
      </div>
    </Modal>
  );
}

// Reutiliza MoveSession para la ejecución (misma estructura de pasos)
Object.assign(window, { ExtraLibrary, EXTRA_ROUTINES });
