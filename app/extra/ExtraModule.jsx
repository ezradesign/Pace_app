/* PACE · Módulo Estira (Estiramientos / Movilidad)
   Botón: "Estira" · afloja tensión.

   v0.11.9 — SWAP de contenido (sesión 14):
   Las rutinas de estiramiento/movilidad pasaron a este módulo (antes vivían
   en MoveModule). La calistenia y la fuerza pasaron a MoveModule (botón
   "Mueve"). Los ids (`move.*` / `extra.*`) y funciones de state
   (completeMoveSession / completeExtraSession) se conservan para no
   invalidar localStorage ni logros de usuarios existentes — solo cambia
   qué contenedor visual los muestra.
*/

const EXTRA_ROUTINES = [
  { id: 'move.chair.antidote', tag: 'SIT', code: 'Antídoto a estar sentado', name: 'Antídoto silla',
    desc: 'Antídoto exacto a 4 h sentado. Caderas, lumbar, cuello.', min: 5,
    steps: [
      { name: 'Apertura de pecho', dur: 40, cue: 'Manos tras la nuca, abre codos, mira al techo.' },
      { name: 'Rotación torácica', dur: 40, cue: 'Sentado: manos cruzadas, rota tronco despacio.' },
      { name: 'Flexor de cadera', dur: 50, cue: 'Rodilla al suelo, empuja pelvis adelante.' },
      { name: 'World\'s greatest stretch', dur: 60, cue: 'Zancada + mano al suelo + rotación.' },
      { name: 'Cuello y trapecios', dur: 40, cue: 'Oreja al hombro, suave.' },
      { name: 'Reset respiración', dur: 30, cue: '3 inhalaciones profundas para cerrar.' },
    ]},
  { id: 'move.hips.5', tag: 'HIP', code: 'Caderas', name: 'Caderas · 5 pasos',
    desc: '5 pasos para desbloquear caderas profundas.', min: 6,
    steps: [
      { name: 'Cossack squat', dur: 60, cue: 'Peso a un lado, otra pierna estirada. 5 por lado.' },
      { name: '90/90', dur: 60, cue: 'Rota entre lados despacio.' },
      { name: 'Pigeon', dur: 60, cue: 'Tibia adelante, peso adelante. 40s por lado.' },
      { name: 'Squat profundo', dur: 60, cue: 'Talones abajo, codos dentro de rodillas.' },
      { name: 'Puente con marcha', dur: 60, cue: 'Activación de glúteo profundo.' },
    ]},
  { id: 'move.shoulders.5', tag: 'SHLD', code: 'Hombros', name: 'Hombros · 5 pasos',
    desc: 'Reset de hombros. Antídoto al teclado. Rotadores, pecho, trapecios.', min: 5,
    steps: [
      { name: 'Scapular wall slides', dur: 50, cue: 'Espalda en pared, sube brazos.' },
      { name: 'Band pull-apart', dur: 50, cue: 'Si no tienes banda, brazos cruzados + abre.' },
      { name: 'External rotation', dur: 50, cue: 'Codo a 90°, rota hacia fuera.' },
      { name: 'Dead hang (si puedes)', dur: 45, cue: 'Cuelga de una barra relajado.' },
      { name: 'Thoracic extension', dur: 40, cue: 'Sobre foam roller o toalla enrollada.' },
    ]},
  { id: 'move.atg.knees', tag: 'ATG', code: 'Rodillas', name: 'ATG · Rodillas a prueba',
    desc: 'Rodillas sobre los dedos. Tobillos y rodillas indestructibles.', min: 6,
    steps: [
      { name: 'ATG split squat', dur: 60, cue: 'Zancada profunda. Rodilla va por delante del pie.' },
      { name: 'Tibialis raise', dur: 45, cue: 'Contra pared, levanta pies.' },
      { name: 'Nordics', dur: 45, cue: 'Asistidos si hace falta. Bajada controlada.' },
      { name: 'Sissy squat', dur: 45, cue: 'Apoyado. Rodillas adelante, talones arriba.' },
      { name: 'Elephant walk', dur: 45, cue: 'Camina tocando suelo, piernas estiradas.' },
    ]},
  { id: 'move.ancestral', tag: 'ANC', code: 'Ancestral', name: 'Ancestral',
    desc: 'Técnicas ancestrales. Crawl, hang, squat profundo. Full body reset.', min: 6,
    steps: [
      { name: 'Deep squat hold', dur: 60, cue: 'Talones abajo, relaja.' },
      { name: 'Crawling', dur: 60, cue: 'Contralateral, lento.' },
      { name: 'Hang pasivo', dur: 45, cue: 'De una barra, suelta.' },
      { name: 'Ground sitting transitions', dur: 60, cue: 'Siéntate al suelo y levántate sin manos.' },
      { name: 'Rib pull + respiración', dur: 45, cue: 'Movimiento de gato/vaca.' },
    ]},
  { id: 'move.neck.3', tag: 'SIT', code: 'Cuello', name: 'Cuello · 3 min',
    desc: 'Micro-pausa para cervicales tensas.', min: 3,
    steps: [
      { name: 'Chin tucks', dur: 40, cue: 'Lleva la barbilla atrás, como doble papada.' },
      { name: 'Inclinación lateral', dur: 50, cue: 'Oreja al hombro, cada lado.' },
      { name: 'Rotación lenta', dur: 50, cue: 'Mira sobre el hombro, sin forzar.' },
      { name: 'Escalenos', dur: 40, cue: 'Lleva mano bajo glúteo, inclina cabeza al lado opuesto.' },
    ]},
  { id: 'move.desk.quick', tag: 'SIT', code: 'Escritorio', name: 'Escritorio express',
    desc: 'Sin levantarse. 6 movimientos en la silla.', min: 2,
    steps: [
      { name: 'Shrug + round', dur: 20, cue: 'Hombros arriba, luego relaja.' },
      { name: 'Wrist circles', dur: 20, cue: '10 en cada sentido.' },
      { name: 'Seated twist', dur: 20, cue: 'Rota hacia el respaldo.' },
      { name: 'Ankle circles', dur: 20, cue: 'Bajo la mesa.' },
      { name: 'Chin tucks', dur: 20, cue: 'Barbilla atrás 5 veces.' },
      { name: 'Deep breaths', dur: 20, cue: '3 inhalaciones completas.' },
    ]},
];

function ExtraLibrary({ open, onClose, onStart }) {
  return (
    <Modal open={open} onClose={onClose} tagLabel="Biblioteca" title="Estira" subtitle="Movilidad y estiramientos. Antídoto a la silla." maxWidth={820}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -30, marginBottom: 10 }}>
        <Meta>Afloja tensión</Meta>
      </div>
      <h3 style={{ ...displayItalic, fontSize: 20, margin: '0 0 12px', fontWeight: 500 }}>Rutinas</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
        {EXTRA_ROUTINES.map(r => (
          <RoutineCard key={r.id} routine={r} color="var(--extra)" onClick={() => onStart(r)} />
        ))}
      </div>
    </Modal>
  );
}

// Reutiliza MoveSession para la ejecución (misma estructura de pasos).
// Export a window saneado en sesión 26 (audit §4.1): EXTRA_ROUTINES no se
// consume fuera del módulo — sigue como const local.
Object.assign(window, { ExtraLibrary });
