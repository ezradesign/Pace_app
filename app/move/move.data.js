/* PACE · Datos de Mueve — MOVE_ROUTINES + getMoveRoutine
   Extraído de MoveModule.jsx en s110 (B2.2) para dar aire al módulo cuando
   crece con el contrato de pasos v1 (regla <500 ln). Sin cambio de estructura
   salvo los 2 pilotos de Mueve, que estrenan `mode` (contrato v1).

   `var` (no `const`) a propósito: el build re-expone function/var top-level
   como global (collectGlobalNames, s103) → MoveModule referencia MOVE_ROUTINES
   directamente sin `window.`, igual que antes. Carga ANTES de MoveModule.

   Contrato de pasos v1 (B2.2): un step puede declarar
     mode: 'timed' | 'reps' | 'perSide' | 'rest'
   Sin `mode` → el runner cae a legacy (comportamiento idéntico al de s109).
   `reps` = nº objetivo (o {min,target,max}); `dur` se conserva como estimación
   de reserva (lo usa la barra de progreso y el fallback legacy).
   s113 (runner guiado): los rest ENTRE SERIES de los pilotos pasan a 30 s y
   estrenan `restKind: 'betweenSets'` — tipado mínimo, base del ajuste de
   Tweaks de s114 (que NUNCA tocará los cierres respiratorios, sin restKind).
   `repSeconds` (opcional) = segundos por rep guiada; sin él, 4 s (fuerza). */

var MOVE_ROUTINES = {
  empuje: {
    label: 'Empuje y tracción',
    aside: 'Pecho, brazos, espalda alta',
    items: [
      /* s113: min 2→3 — con reps guiadas la ejecución real ronda 3:15-3:25
         (la derivación formal de duración llega en B2.2b-1). */
      { id: 'extra.desk.pushups', tag: 'PUSH', code: 'Fuerza', name: 'Flexiones de escritorio', desc: 'Inclinado contra mesa. 3 series.', min: 3,
        steps: [
          { name: 'Flexiones inclinadas', mode: 'reps', reps: 12, dur: 40, cue: 'Contra el escritorio, codos cerca del cuerpo.' },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30, cue: 'Respira.' },
          { name: 'Flexiones inclinadas', mode: 'reps', reps: 10, dur: 40, cue: 'Codos cerca del cuerpo, baja con control.' },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30, cue: 'Respira.' },
          { name: 'Flexiones inclinadas', mode: 'reps', reps: 8, dur: 40, cue: 'Últimas, lentas. Para si la técnica se rompe.' },
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
          { name: 'Sentadilla a silla', mode: 'reps', reps: 12, dur: 40, cue: 'Baja hasta rozar la silla, sube sin impulso.' },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30, cue: 'Respira.' },
          { name: 'Sentadilla a silla', mode: 'reps', reps: 10, dur: 40, cue: 'Más lentas, control total.' },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30, cue: 'Respira.' },
          { name: 'Sentadilla a silla', mode: 'reps', reps: 8, dur: 40, cue: 'Últimas, sin impulso.' },
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

/* Sesión 49 — helper de lookup para Caminos (s92: adaptado a grupos) */
function getMoveRoutine(id) {
  for (const group of Object.values(MOVE_ROUTINES)) {
    const found = group.items.find(r => r.id === id);
    if (found) return found;
  }
  return null;
}
window.getMoveRoutine = getMoveRoutine;
window.MOVE_ROUTINES = MOVE_ROUTINES;
