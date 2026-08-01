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
   s115 (B2.2b-1 · contrato formal, SOLO los 5 pilotos):
     instruction: { setup, action, care }  — consolida placeCue/cue/careCue.
     tempo: { down, hold, up }              — generaliza el rep-seconds (suma).
     completion: { mode: 'guided' }         — 'manual' reservado, sin piloto.
     transition: { seconds }                — cambio de lado (perSide, ExtraModule).
     setup: { mode: 'ready', estimatedSeconds } — SOLO ready; auto/none se derivan.
     position/equipment/requiresFloor/intensity/level — metadatos sin consumidor UI.
   La duración efectiva sale de una única fuente (support: v1StepDur / tempo /
   transición); `dur` en `reps` queda SOLO como reserva del fallback legacy.
   s118 (B2.3 · OLA 1): migradas al contrato v1 las 5 primeras rutinas legacy
   de Mueve — chair.dips · calves · grip.squeeze · glutes.stealth · posture.set
   (todas gratuitas, sin suelo → sin gate `ready`). Migración MECÁNICA: `mode` +
   `instruction.*` (consolida el `cue`) + `tempo`/`completion` en reps + los 5
   metadatos; ningún `name` cambia (glifos intactos). Las 7 rutinas restantes de
   Mueve (premium + legs.single a reescribir) siguen LEGACY byte-idénticas. */

var MOVE_ROUTINES = {
  empuje: {
    label: 'Empuje y tracción',
    aside: 'Pecho, brazos, espalda alta',
    items: [
      /* s113: min 2→3 — con reps guiadas la ejecución real ronda 3:15-3:25
         (la derivación formal de duración llega en B2.2b-1). */
      { id: 'extra.desk.pushups', tag: 'PUSH', code: 'Fuerza', name: 'Flexiones de escritorio', desc: 'Inclinado contra mesa. 3 series.', min: 3,
        position: ['standing'], equipment: ['stableDesk'], requiresFloor: false, intensity: 'moderate', level: 'accessible',
        steps: [
          /* s115 (B2.2b-1): contrato formal — `instruction` {setup,action,care}
             consolida placeCue/cue(shortCue)/careCue de s114 (misma copy); `tempo`
             generaliza el repSeconds implícito de fuerza (2 baja + 0 pausa + 2
             sube = 4 s/rep); `completion.mode:'guided'` = avance auto guiado. El
             1er set gana colocación AUTO (reps con instruction.setup y NO tras
             rest). `dur` se conserva SOLO como reserva del fallback legacy. */
          { name: 'Flexiones inclinadas', mode: 'reps', reps: 12, dur: 40,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Apoya las manos en el borde del escritorio, algo más anchas que los hombros. Da unos pasos atrás hasta quedar en diagonal, con el cuerpo recto.',
              action: 'Baja el pecho hacia el borde. Codos cerca del cuerpo. Empuja y vuelve.',
              care: 'Cuanto más de pie, más suave. Elige la altura que te deje llegar a 12 con buena técnica.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Flexiones inclinadas', mode: 'reps', reps: 10, dur: 40,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Baja con control, sin dejarte caer. Empuja y vuelve.',
              care: 'Si la primera serie costó, sube un poco las manos.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Flexiones inclinadas', mode: 'reps', reps: 8, dur: 40,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Últimas. Lentas y limpias, empuja desde el pecho.',
              care: 'Para si la técnica se rompe. Mejor 6 buenas que 8 forzadas.' } },
        ]},
      /* s118 (B2.3 OLA 1): migrado al contrato v1 — gemelo de desk.pushups
         (3 series de fuerza + rests betweenSets). Copy = consolidación del cue
         legacy (action) + colocación (setup, 1er set) + cuidado (care). */
      { id: 'extra.chair.dips', tag: 'PUSH', code: 'Tríceps', name: 'Fondos en silla', desc: 'Tríceps en 3 series. Silla estable y sin ruedas.', min: 3,
        position: ['seated'], equipment: ['stableChair'], requiresFloor: false, intensity: 'moderate', level: 'accessible',
        steps: [
          { name: 'Fondos en silla', mode: 'reps', reps: 12, dur: 40,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Siéntate al borde de una silla estable y sin ruedas. Manos en el borde, a los lados de las caderas. Desliza la cadera fuera del asiento.',
              action: 'Baja doblando los codos hacia atrás. Sube empujando con los brazos.',
              care: 'Codos apuntando atrás, no hacia fuera. Baja solo hasta donde el hombro vaya cómodo.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Fondos en silla', mode: 'reps', reps: 10, dur: 40,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Baja con control, sin dejarte caer. Empuja y sube.',
              care: 'Mantén los hombros lejos de las orejas.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Fondos en silla', mode: 'reps', reps: 8, dur: 40,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Últimas. Lentas y limpias, empuja desde el tríceps.',
              care: 'Para si la técnica se rompe. Mejor 6 buenas que 8 forzadas.' } },
        ]},
      { id: 'extra.push.ladder', tag: 'PUSH', code: 'Empuje', name: 'Empuje · progresión', desc: 'Del escritorio a la pica. Empuje completo.', min: 3, access: 'premium',
        intensity: 'moderate', level: 'intermediate',
        position: ['standing'], equipment: ['stableDesk'], requiresFloor: false,
        steps: [
          { name: 'Flexiones inclinadas', dur: 40, cue: '10 reps profundas, codos cerca del cuerpo.' },
          { name: 'Descanso', dur: 20, cue: 'Respira.' },
          { name: 'Pica en escritorio', dur: 40, cue: 'Cadera arriba, cabeza entre los brazos. 8 reps.' },
          { name: 'Descanso', dur: 20, cue: 'Respira.' },
          { name: 'Flexiones inclinadas', dur: 45, cue: 'Negativas: baja en 5 segundos, sube normal.' },
        ]},
      /* s120 (B2.3 OLA 3): migrado al contrato v1. Aguantes isométricos de barra
         → `timed`; los rests entre holds son SUAVES (sin restKind, patrón
         glutes.stealth, conservan su dur 20). Gate `ready` en el 1er hang
         (agarrar la barra, material). `name` intactos → glifos sin tocar.
         Acceso premium SIN cambios. */
      { id: 'extra.hang.bar', tag: 'HANG', code: 'Tracción', name: 'Colgarse', desc: 'De una barra firme que soporte tu peso. Tracción suave para hombros y espalda.', min: 2, access: 'premium',
        position: ['standing'], equipment: ['bar'], requiresFloor: false, intensity: 'gentle', level: 'intermediate',
        steps: [
          { name: 'Suspensión pasiva', mode: 'timed', dur: 30, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Agárrate a una barra firme que soporte tu peso, con las manos al ancho de los hombros.',
              action: 'Cuelga relajado, con los brazos estirados. Respira.',
              care: 'Baja si notas molestia. Apoya un poco los pies si lo necesitas.' } },
          { name: 'Descanso', mode: 'rest', dur: 20,
            instruction: { action: 'Sacude los brazos.' } },
          { name: 'Suspensión activa', mode: 'timed', dur: 30,
            instruction: {
              action: 'Cuelga llevando los hombros abajo y atrás. Codos rectos.',
              care: 'Tracción suave, sin encoger el cuello.' } },
          { name: 'Descanso', mode: 'rest', dur: 20,
            instruction: { action: 'Sacude los brazos.' } },
          { name: 'Suspensión pasiva', mode: 'timed', dur: 30,
            instruction: {
              action: 'Suelta del todo. Deja que la espalda se abra.',
              care: 'Respira hondo y afloja los hombros.' } },
        ]},
    ]
  },
  sigilo: {
    label: 'Sigilo',
    aside: 'Nadie se entera',
    items: [
      /* s118 (B2.3 OLA 1): migrado — fuerza ligera de gemelo, 2 series de reps
         guiadas (cadencia rápida 2 s/rep). */
      { id: 'extra.calves', tag: 'STEALTH', code: 'Gemelos', name: 'Gemelos subrepticios', desc: 'Bajo la mesa, nadie se entera.', min: 1,
        position: ['seated', 'standing'], equipment: [], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Elevación de talones', mode: 'reps', reps: 25, dur: 30,
            tempo: { down: 1, hold: 0, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Sentado o de pie, pies apoyados en el suelo al ancho de las caderas.',
              action: 'Sube los talones lo más alto que puedas. Baja con control.',
              care: 'Movimiento pequeño y controlado. Apóyate en la mesa si lo necesitas.' } },
          { name: 'Elevación de talones', mode: 'reps', reps: 20, dur: 30,
            tempo: { down: 1, hold: 0, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Más lentas ahora. Nota el gemelo en cada subida.' } },
        ]},
      /* s118 (B2.3 OLA 1): migrado — dos series de reps (grip + extensión) y un
         estiramiento de muñeca `timed` (ambas manos, no hay lado). */
      { id: 'extra.grip.squeeze', tag: 'GRIP', code: 'Antebrazos', name: 'Grip + antebrazos', desc: 'Apretar, estirar.', min: 1,
        position: ['seated'], equipment: [], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Abrir y cerrar el puño', mode: 'reps', reps: 20, dur: 20,
            tempo: { down: 1, hold: 1, up: 0 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Brazos relajados, manos abiertas.',
              action: 'Cierra el puño con fuerza y ábrelo del todo. Repite a buen ritmo.',
              care: 'Firme, pero sin llegar al calambre.' } },
          { name: 'Extensión de dedos', mode: 'reps', reps: 10, dur: 20,
            tempo: { down: 1, hold: 1, up: 0 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Abre bien los dedos, estíralos y relaja.',
              care: 'Sin forzar las articulaciones.' } },
          { name: 'Estiramiento de muñeca', mode: 'timed', dur: 20,
            instruction: {
              action: 'Estira la muñeca en flexión y luego en extensión, ayudándote con la otra mano.',
              care: 'Presión ligera. Nunca hasta el dolor.' } },
        ]},
      /* s118 (B2.3 OLA 1): migrado — reps de apretón + descanso corto (NO
         betweenSets: es actividad suave, conserva su dur 15) + un bloque
         isométrico `timed` (3 aguantes de ~10 s, BASE §D) + cierre de gemelo. */
      { id: 'extra.glutes.stealth', tag: 'STEALTH', code: 'Glúteos', name: 'Glúteos invisibles', desc: 'Actívalos sentado. Invisible total.', min: 2,
        position: ['seated'], equipment: [], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Apretar glúteos', mode: 'reps', reps: 20, dur: 30,
            tempo: { down: 1, hold: 1, up: 0 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Sentado erguido, pies apoyados.',
              action: 'Aprieta los glúteos con fuerza dos segundos y suelta. Repite.',
              care: 'Nadie tiene que notarlo. Respira con normalidad.' } },
          { name: 'Descanso', mode: 'rest', dur: 15,
            instruction: { action: 'Suelta.' } },
          { name: 'Apretar glúteos', mode: 'timed', dur: 30,
            instruction: {
              action: 'Ahora aguanta el apretón unos diez segundos y suelta. Tres veces.',
              care: 'Mantén la respiración suelta durante el aguante.' } },
          { name: 'Elevación de talones', mode: 'reps', reps: 20, dur: 30,
            tempo: { down: 1, hold: 0, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Cierra subiendo y bajando los talones, suave.' } },
        ]},
      /* s120 (B2.3 OLA 3): migrado al contrato v1. Aguantes isométricos de hollow
         en silla → `timed`; rests entre holds SUAVES (sin restKind, patrón
         glutes.stealth, conservan dur 20). Sentado, sin suelo ni material → sin
         gate `ready`. Los cue de los rests estaban VACÍOS: se reutiliza el
         literal del rest suave de glutes.stealth («Suelta.» / «Let go.»), sin
         redactar copy nuevo. Acceso premium SIN cambios. */
      { id: 'extra.core.stealth', tag: 'CORE', code: 'Core', name: 'Core silencioso', desc: 'Hueco abdominal en silla.', min: 2, access: 'premium',
        position: ['seated'], equipment: [], requiresFloor: false, intensity: 'moderate', level: 'accessible',
        steps: [
          { name: 'Hueco en silla', mode: 'timed', dur: 30,
            instruction: {
              action: 'Eleva las piernas y mantén, con la baja espalda apoyada.',
              care: 'Baja los pies para que sea más suave. Respira normal.' } },
          { name: 'Descanso', mode: 'rest', dur: 20,
            instruction: { action: 'Suelta.' } },
          { name: 'Hueco en silla', mode: 'timed', dur: 30,
            instruction: {
              action: 'Mantén la posición. Respira normal.',
              care: 'Si la lumbar se despega, baja un poco las piernas.' } },
          { name: 'Descanso', mode: 'rest', dur: 20,
            instruction: { action: 'Suelta.' } },
          { name: 'Hueco en silla', mode: 'timed', dur: 30,
            instruction: {
              action: 'Última. Mantén mientras la lumbar siga apoyada.',
              care: 'Termina antes si pierdes el apoyo de la espalda.' } },
        ]},
    ]
  },
  piernas: {
    label: 'Piernas',
    aside: 'La base del cuerpo',
    items: [
      { id: 'extra.chair.squats', tag: 'LEG', code: 'Piernas', name: 'Sentadillas de silla', desc: 'Levántate y siéntate. La fuerza más útil. Silla estable, sin ruedas.', min: 3,
        position: ['standing'], equipment: ['stableChair'], requiresFloor: false, intensity: 'moderate', level: 'accessible',
        steps: [
          { name: 'Sentadilla a silla', mode: 'reps', reps: 12, dur: 40,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'De pie frente a la silla, pies al ancho de las caderas. Silla estable y sin ruedas.',
              action: 'Baja hasta rozar la silla. Sube sin impulso, pecho arriba.',
              care: 'Apoya las manos en los muslos para ayudarte si lo necesitas.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Sentadilla a silla', mode: 'reps', reps: 10, dur: 40,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Más lentas. Roza la silla y sube con control.',
              care: 'Baja solo hasta donde las rodillas vayan cómodas.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Sentadilla a silla', mode: 'reps', reps: 8, dur: 40,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Últimas, sin impulso. Aprieta arriba.',
              care: 'Para si pierdes el control de la bajada.' } },
        ]},
      /* s121 (B2.3 OLA 4): migrado al contrato v1 — CIERRE de la migración
         mecánica. Aguantes isométricos de cuádriceps → `timed` con **dosis legacy
         CONSERVADA** (60 s cada tanda; el care gradúa la ALTURA, NO la dosis). El
         descanso entre holds es SUAVE (sin restKind, conserva dur 30; cue legacy
         «Suave.» preservado verbatim). Gate `ready` en el 1er wall sit (colocarse
         contra la pared). La 2ª tanda reparte el cue legacy: acción + care («elige
         una altura»). `name` intactos → glifos sin tocar. Acceso premium SIN
         cambios. */
      { id: 'extra.wall.sit', tag: 'LEG', code: 'Piernas', name: 'Sentadilla en pared', desc: 'Isométrico de cuádriceps contra una pared.', min: 2, access: 'premium',
        position: ['standing'], equipment: ['wall'], requiresFloor: false, intensity: 'moderate', level: 'accessible',
        steps: [
          { name: 'Silla en la pared', mode: 'timed', dur: 60, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Apoya la espalda en una pared y desliza hacia abajo hasta que las rodillas queden a 90°.',
              action: 'Espalda pegada a la pared, rodillas a 90°. Respira normal.',
              care: 'Elige una altura que te deje respirar; cuanto menos bajes, más suave.' } },
          { name: 'Descanso', mode: 'rest', dur: 30,
            instruction: { action: 'Suave.' } },
          { name: 'Silla en la pared', mode: 'timed', dur: 60,
            instruction: {
              action: 'Segunda tanda. Vuelve a la posición y mantén.',
              care: 'Elige una altura que te deje respirar tranquilo.' } },
        ]},
      { id: 'extra.legs.single', tag: 'LEG', code: 'Unilateral', name: 'Piernas · a una', desc: 'Fuerza a una pierna. Equilibrio, control y una silla estable.', min: 4, access: 'premium',
        intensity: 'strong', level: 'advanced',
        position: ['standing'], equipment: ['stableChair'], requiresFloor: false,
        steps: [
          { name: 'Sentadilla búlgara', dur: 50, cue: 'Empeine sobre la silla, baja vertical. 8 por pierna.' },
          { name: 'Descanso', dur: 20, cue: 'Respira.' },
          { name: 'Zancada profunda', dur: 50, cue: 'Zancada profunda. Rodilla va por delante del pie.' },
          { name: 'Descanso', dur: 20, cue: 'Respira.' },
          { name: 'Sentadilla de cuádriceps', dur: 45, cue: 'Apoyado. Rodillas adelante, talones arriba.' },
          { name: 'Elevación de talones', dur: 40, cue: 'A una pierna, 12 por lado.' },
        ]},
    ]
  },
  espalda: {
    label: 'Espalda y core',
    aside: 'Sostén de la postura',
    items: [
      /* s118 (B2.3 OLA 1): migrado — control postural (chin tucks + scapular con
         retención → reps con hold) y dos movilizaciones suaves `timed` (§B). */
      { id: 'extra.posture.set', tag: 'POST', code: 'Postura', name: 'Postura reset', desc: 'Barbilla, omóplatos y pecho. Tres gestos contra la silla.', min: 2,
        position: ['seated'], equipment: [], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Barbilla atrás', mode: 'reps', reps: 8, dur: 30,
            tempo: { down: 2, hold: 2, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Siéntate erguido, hombros sueltos, mirada al frente.',
              action: 'Desliza la barbilla recta hacia atrás. La nuca se alarga. Mantén y suelta.',
              care: 'Recorrido pequeño, sin tensar. Llevas la cabeza atrás, no abajo.' } },
          { name: 'Juntar omóplatos', mode: 'reps', reps: 10, dur: 30,
            tempo: { down: 1, hold: 2, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Junta los omóplatos hacia el centro y mantén un instante. Suelta.',
              care: 'Hombros abajo, lejos de las orejas.' } },
          { name: 'Extensión torácica', mode: 'timed', dur: 30,
            instruction: {
              action: 'Apoya la espalda alta en el respaldo y arquea suave, abriendo el pecho al techo.',
              care: 'El arco nace del pecho, no de la zona lumbar.' } },
          { name: 'Apertura de pecho sentado', mode: 'timed', dur: 30,
            instruction: {
              action: 'Lleva los brazos atrás, junta los omóplatos y abre el pecho. Respira ancho.',
              care: 'Abre solo hasta donde el pecho estire sin molestar.' } },
        ]},
      /* s120 (B2.3 OLA 3): migrado al contrato v1. Scapular squeeze → `reps` con
         **dosis legacy CONSERVADA** (12 reps, «2 segundos cada una» → tempo 1-2-1
         con 2 s de retención; posturalControl, audit B2.1 «cue ya trae reps y
         retención»); Band pull-apart y Apertura de pecho → `timed` (reutilizan el
         copy de OLA 2 —shoulder.circles/chair.antidote—, mismo glifo); Superman →
         `reps` (10, dosis legacy) sobre SUELO con gate `ready` (cuenta la bajada al
         suelo vía estimatedSeconds, §6). `name` intactos → glifos sin tocar.
         Acceso free SIN cambios. */
      { id: 'extra.back.desk', tag: 'BACK', code: 'Espalda', name: 'Espalda de oficina', desc: 'Despierta la espalda que sostiene tu postura. Un paso pasa por el suelo.', min: 3,
        position: ['seated', 'standing', 'floor'], equipment: [], requiresFloor: true, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Juntar omóplatos', mode: 'reps', reps: 12, dur: 40,
            tempo: { down: 1, hold: 2, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Siéntate erguido o ponte de pie, hombros sueltos.',
              action: 'Junta los omóplatos hacia el centro y mantén un instante. Suelta.',
              care: 'Hombros abajo, lejos de las orejas.' } },
          { name: 'Apertura con banda', mode: 'timed', dur: 40,
            instruction: {
              action: 'Abre los brazos al frente juntando los omóplatos. Sin banda, cruza los brazos y ábrelos.',
              care: 'Hombros abajo, lejos de las orejas.' } },
          { name: 'Superman', mode: 'reps', reps: 10, dur: 40, setup: { mode: 'ready', estimatedSeconds: 15 },
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Túmbate boca abajo en el suelo, con los brazos estirados al frente.',
              action: 'Eleva el pecho y los brazos del suelo, despacio. Baja con control.',
              care: 'Movimiento pequeño. No fuerces la zona lumbar.' } },
          { name: 'Apertura de pecho', mode: 'timed', dur: 40,
            instruction: {
              action: 'Manos tras la nuca. Abre los codos y mira al techo. Respira ancho.',
              care: 'Abre solo hasta donde el pecho estire sin molestar.' } },
        ]},
      /* s121 (B2.3 OLA 4): migrado al contrato v1 — CIERRE de la migración
         mecánica. Aguantes isométricos (Plancha, Hueco abdominal) → `timed` con care
         de rodillas (adaptación DERIVADA, no cambia dosis); Plancha lateral «30 s
         por lado» en dur:60 → `perSide` dur:30 POR LADO (2×30=60 = dosis legacy) +
         `transition:{seconds:10}` (patrón Isquio de OLA 3; solo separa lo que el
         cue ya decía). Rests entre holds SUAVES (sin restKind, conservan dur 20;
         el cue legacy «Respira.» se preserva verbatim). Gate `ready` en el 1er
         paso de suelo (Plancha), la bajada al suelo cuenta vía estimatedSeconds.
         `name` intactos → glifos sin tocar. Acceso premium SIN cambios. */
      { id: 'extra.core.plank', tag: 'CORE', code: 'Core', name: 'Core · plancha', desc: 'Planchas y hueco abdominal, en el suelo. El centro que sostiene todo.', min: 4, access: 'premium',
        position: ['floor'], equipment: [], requiresFloor: true, intensity: 'moderate', level: 'intermediate',
        steps: [
          { name: 'Plancha', mode: 'timed', dur: 45, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Ponte boca abajo en el suelo y apoya los antebrazos bajo los hombros.',
              action: 'Cuerpo en línea recta de la cabeza a los talones. Aprieta glúteos y abdomen. Respira.',
              care: 'Apoya las rodillas en el suelo para hacerla más suave.' } },
          { name: 'Descanso', mode: 'rest', dur: 20,
            instruction: { action: 'Respira.' } },
          { name: 'Plancha lateral', mode: 'perSide', dur: 30, transition: { seconds: 10 },
            instruction: {
              action: 'Apóyate en un antebrazo, cuerpo de lado en línea. Sube la cadera y mantén.',
              care: 'Baja la rodilla de abajo al suelo si necesitas menos intensidad.' } },
          { name: 'Descanso', mode: 'rest', dur: 20,
            instruction: { action: 'Respira.' } },
          { name: 'Hueco abdominal', mode: 'timed', dur: 30,
            instruction: {
              action: 'Tumbado boca arriba: pega la lumbar al suelo y eleva piernas y hombros.',
              care: 'Baja los pies para que sea más suave.' } },
          { name: 'Plancha', mode: 'timed', dur: 30,
            instruction: {
              action: 'Última. Vuelve a la plancha, cuerpo en línea. Respira dentro de la tensión.',
              care: 'Apoya las rodillas si la línea se rompe.' } },
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
