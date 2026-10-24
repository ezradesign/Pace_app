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
   metadatos; ningún `name` cambia (glifos intactos). Las que quedaban en el runner
   antiguo pasaron después al contrato con `{ name, mode, dur, cue }` (opción A del
   runner guiado): ya no queda ninguna rutina de catálogo sin `mode`. */

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
              setup: 'Manos en una mesa fija, algo más abiertas que los hombros. Pasos atrás, cuerpo en diagonal.',
              action: 'Baja el pecho hacia el borde. Codos cerca del cuerpo. Empuja y vuelve.',
              care: 'Cuanto más de pie, más suave. Elige la altura que te deje hacerlas todas con buena técnica.' } },
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
              setup: 'Al borde de una silla sin ruedas, contra la pared. Manos junto a la cadera; sácala del asiento.',
              action: 'Baja doblando los codos hacia atrás. Sube empujando con los brazos.',
              /* Bajar de más carga la parte de delante del hombro: el tope es el codo a 90°
                 (revisión de los ejercicios, Ez, 16 oct. 2026). */
              care: 'Baja hasta donde el hombro vaya cómodo, nunca más del ángulo recto. Pies cerca, más fácil.' } },
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
        /* Fuerza por repeticiones (BASE §3-A): los tres pasos eran relojes que pedían «10
           reps», «8 reps» y «baja en 5 s». Las negativas bajan en 5 s de verdad. */
        steps: [
          { name: 'Flexiones inclinadas', mode: 'reps', reps: 10, dur: 40,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Manos en el borde de una mesa fija, cuerpo recto en diagonal.',
              action: 'Baja el pecho hacia el borde, codos cerca del cuerpo. Empuja y vuelve.',
              care: 'Baja hasta donde controles. Cuanto más alta la superficie, más fácil.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Pica en escritorio', mode: 'reps', reps: 8, dur: 32,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Manos en la mesa, acerca los pies y sube la cadera: el cuerpo, en V invertida.',
              action: 'Dobla los codos y lleva la cabeza hacia la mesa, entre los brazos. Empuja y vuelve.',
              care: 'Recorrido corto: la cabeza nunca toca la mesa, y la mesa no se mueve. Si cuesta, vuelve a las flexiones inclinadas.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Flexiones inclinadas', mode: 'reps', reps: 5, dur: 30,
            tempo: { down: 5, hold: 0, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Negativas: baja en 5 segundos y sube normal.',
              care: 'Si cuesta, apoya las manos en una superficie más alta.' } },
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
              care: 'Entra y sal apoyando los pies, sin saltar. Baja si notas molestia.' } },
          { name: 'Descanso', mode: 'rest', dur: 20,
            instruction: { action: 'Sacude los brazos.' } },
          { name: 'Suspensión activa', mode: 'timed', dur: 30,
            instruction: {
              action: 'Cuelga y aleja un poco los hombros de las orejas, sin doblar los codos.',
              care: 'Suave, sin forzar los hombros atrás. Los pies, cerca del suelo.' } },
          { name: 'Descanso', mode: 'rest', dur: 20,
            instruction: { action: 'Sacude los brazos.' } },
          { name: 'Suspensión pasiva', mode: 'timed', dur: 30,
            instruction: {
              action: 'Hombros sueltos, sin soltar el agarre. Deja que la espalda se abra.',
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
      { id: 'extra.calves', tag: 'STEALTH', code: 'Gemelos', name: 'Gemelos subrepticios', desc: 'Bajo la mesa, nadie se entera.', min: 2,
        position: ['seated', 'standing'], equipment: [], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Elevación de talones', mode: 'reps', reps: 25, dur: 30,
            tempo: { down: 1, hold: 0, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Sentado o de pie, pies apoyados en el suelo al ancho de las caderas.',
              action: 'Sube los talones hasta donde controles. Baja con control.',
              care: 'Movimiento pequeño y controlado. Apóyate en la mesa si lo necesitas.' } },
          /* La 2.ª ronda promete «más lentas» y lo es: baja en 3 s (Ez, 16 oct.).
             Con el ritmo de la 1.ª y menos veces, duraba menos y no era más lenta. */
          { name: 'Elevación de talones', mode: 'reps', reps: 12, dur: 60,
            tempo: { down: 3, hold: 1, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Más lentas ahora: baja en 3 s. Nota el gemelo en cada subida.' } },
        ]},
      /* Dos series de reps (grip + extensión) y el estiramiento de muñeca POR MANO: en
         20 s para las dos no daba tiempo a las dos posiciones de cada una. */
      { id: 'extra.grip.squeeze', tag: 'GRIP', code: 'Antebrazos', name: 'Grip + antebrazos', desc: 'Apretar, estirar.', min: 2,
        position: ['seated'], equipment: [], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Abrir y cerrar el puño', mode: 'reps', reps: 12, dur: 36,
            tempo: { down: 1, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Brazos relajados, manos abiertas.',
              action: 'Cierra el puño sin apretar al máximo y ábrelo despacio, del todo.',
              care: 'Suave: no es un ejercicio de fuerza.' } },
          { name: 'Extensión de dedos', mode: 'reps', reps: 10, dur: 20,
            tempo: { down: 1, hold: 1, up: 0 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Abre bien los dedos, estíralos y relaja.',
              care: 'Sin empujarlos hacia atrás con la otra mano.' } },
          { name: 'Estiramiento de muñeca', mode: 'perSide', dur: 20, transition: { seconds: 5 },
            instruction: {
              setup: 'Brazo al frente, el codo sin bloquear.',
              action: 'Palma abajo y luego palma arriba: con la otra mano, lleva los dedos hacia ti, suave.',
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
              action: 'Aprieta los glúteos de forma moderada dos segundos y suelta. Repite.',
              care: 'Sin contener el aire. Suelta del todo entre apretones.' } },
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
      { id: 'extra.core.stealth', tag: 'CORE', code: 'Core', name: 'Core silencioso', desc: 'Piernas elevadas, sentado.', min: 2, access: 'premium',
        position: ['seated'], equipment: [], requiresFloor: false, intensity: 'moderate', level: 'accessible',
        steps: [
          /* Al levantar las dos piernas, una silla con ruedas se va: la colocación lo dice. */
          { name: 'Piernas elevadas sentado', mode: 'timed', dur: 30,
            instruction: {
              setup: 'Silla sin ruedas. Atrás del todo, espalda apoyada, manos en el asiento.',
              action: 'Eleva las piernas y mantén, con la baja espalda apoyada.',
              care: 'Para que sea más suave, levanta un pie cada vez, con las rodillas dobladas. Respira normal.' } },
          { name: 'Descanso', mode: 'rest', dur: 20,
            instruction: { action: 'Suelta.' } },
          { name: 'Piernas elevadas sentado', mode: 'timed', dur: 30,
            instruction: {
              action: 'Mantén la posición. Respira normal.',
              care: 'Si la lumbar se despega, apoya los pies en el suelo y vuelve a subirlos.' } },
          { name: 'Descanso', mode: 'rest', dur: 20,
            instruction: { action: 'Suelta.' } },
          { name: 'Piernas elevadas sentado', mode: 'timed', dur: 30,
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
              action: 'Siéntate con control y levántate sin impulso, pecho arriba.',
              care: 'Apoya las manos en los muslos para ayudarte si lo necesitas.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Sentadilla a silla', mode: 'reps', reps: 10, dur: 50,
            tempo: { down: 3, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Más lentas: baja en 3 s. Roza la silla y sube con control.',
              care: 'Baja solo hasta donde las rodillas vayan cómodas.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Sentadilla a silla', mode: 'reps', reps: 8, dur: 40,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Últimas, sin impulso. Aprieta arriba.',
              care: 'Para si pierdes el control de la bajada.' } },
        ]},
      /* La pausa que te levanta (Ez, 15 oct. 2026: las series de «A tu ritmo»). Mueve no
         tenía nada de pie que cupiera junto a la mesa, y la primera pausa del día y la de
         después de comer piden levantarse. Los tres ejercicios ya tenían dibujo; el de
         «Elevación de puntas» es de espaldas a la pared, y por eso la pared va en su setup.
         Reps por BASE §3-A y la activación breve de §5 (1-3 ejercicios, una serie). */
      { id: 'extra.legs.standing', tag: 'LEG', code: 'Piernas', name: 'Piernas de pie', desc: 'Gemelos, espinillas y muslos, de pie. Una mesa al lado, si la necesitas.', min: 2,
        position: ['standing'], equipment: ['deskOptional'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          /* Los textos piden bajar despacio: la bajada dura 2 s (Ez, 16 oct.). */
          { name: 'Elevación de talones', mode: 'reps', reps: 12, dur: 48,
            tempo: { down: 2, hold: 1, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'De pie, pies al ancho de las caderas. Una mano en la mesa si la necesitas.',
              action: 'Sube los talones hasta donde controles, mantén un instante y baja con control.',
              care: 'Sin rebotes. Baja despacio hasta apoyar el talón.' } },
          { name: 'Elevación de puntas', mode: 'reps', reps: 12, dur: 48,
            tempo: { down: 2, hold: 1, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Espalda en la pared y talones a un palmo; o de cara a la mesa, con las manos en ella.',
              action: 'Sube las puntas de los pies hacia las espinillas. Bájalas despacio.',
              care: 'Movimiento pequeño, sin balancearte hacia atrás. Notarás el trabajo delante de la espinilla.' } },
          { name: 'Sentadilla de cuádriceps', mode: 'reps', reps: 8, dur: 32,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Sujétate a la mesa con las dos manos.',
              action: 'Lleva las rodillas adelante y sube los talones. Baja poco a poco y vuelve.',
              care: 'Apoyado en todo momento. Baja solo hasta donde las rodillas vayan cómodas.' } },
          { name: 'Respiraciones profundas', mode: 'rest', dur: 20,
            instruction: { action: '3 inhalaciones completas para cerrar.' } },
        ]},
      /* s121 (B2.3 OLA 4): migrado al contrato v1 — CIERRE de la migración
         mecánica. Aguantes isométricos de cuádriceps → `timed` con **dosis legacy
         CONSERVADA** (60 s cada tanda; el care gradúa la ALTURA, NO la dosis). El
         descanso entre holds es SUAVE (sin restKind, conserva dur 30; cue legacy
         «Suave.» preservado verbatim). Gate `ready` en el 1er wall sit (colocarse
         contra la pared). La 2ª tanda reparte el cue legacy: acción + care («elige
         una altura»). `name` intactos → glifos sin tocar. Acceso premium SIN
         cambios. */
      { id: 'extra.wall.sit', tag: 'LEG', code: 'Piernas', name: 'Sentadilla en pared', desc: 'Isométrico de cuádriceps contra una pared.', min: 3, access: 'premium',
        position: ['standing'], equipment: ['wall'], requiresFloor: false, intensity: 'moderate', level: 'accessible',
        steps: [
          { name: 'Silla en la pared', mode: 'timed', dur: 60, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Espalda en la pared, pies un paso por delante. Desliza un poco hacia abajo.',
              action: 'Quédate a la altura que elijas, sin pasar de 90°. Respira sin aguantar el aire.',
              /* Aguantar el aire en una isometría sube la tensión en el momento. */
              care: 'Empieza alto: cuanto menos bajes, más suave. Para salir, empuja con los pies y sube.' } },
          { name: 'Descanso', mode: 'rest', dur: 30,
            instruction: { action: 'Suave.' } },
          { name: 'Silla en la pared', mode: 'timed', dur: 60,
            instruction: {
              action: 'Segunda tanda. Vuelve a la posición y mantén.',
              care: 'Elige una altura que te deje respirar tranquilo.' } },
        ]},
      /* A una pierna, cada lado con su reloj y su cambio: antes «8 por pierna» y «12 por
         lado» cabían en un reloj sin cambio de lado. El runner no tiene repeticiones por
         lado, así que las cuentas van como guía dentro del reloj de cada lado. */
      { id: 'extra.legs.single', tag: 'LEG', code: 'Unilateral', name: 'Piernas · a una', desc: 'Fuerza a una pierna. Equilibrio, control y una silla estable.', min: 5, access: 'premium',
        intensity: 'strong', level: 'advanced',
        position: ['standing'], equipment: ['stableChair'], requiresFloor: false,
        steps: [
          { name: 'Sentadilla búlgara', mode: 'perSide', dur: 40, transition: { seconds: 10 }, setup: { mode: 'ready', estimatedSeconds: 20 },
            instruction: {
              setup: 'Silla estable contra la pared, detrás. Un empeine en ella; el otro pie, un paso largo delante.',
              action: 'Baja en vertical sobre la pierna de delante y sube. Unas 6 por pierna, a tu ritmo.',
              care: 'Una mano en la mesa o la pared si pierdes el equilibrio. Baja solo hasta donde controles.' } },
          { name: 'Descanso', mode: 'rest', dur: 20,
            instruction: { action: 'Respira.' } },
          { name: 'Zancada profunda', mode: 'perSide', dur: 35, transition: { seconds: 10 },
            instruction: {
              setup: 'De pie, da un paso largo adelante. Una mano en la mesa si la necesitas.',
              action: 'Baja y sube en zancada. La rodilla puede pasar sobre el pie, sin buscarlo. Unas 6 por pierna.',
              care: 'Si la rodilla se queja, baja menos. El talón de delante, siempre apoyado.' } },
          { name: 'Descanso', mode: 'rest', dur: 20,
            instruction: { action: 'Respira.' } },
          { name: 'Sentadilla de cuádriceps', mode: 'reps', reps: 10, dur: 40,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Sujétate a la mesa con las dos manos.',
              action: 'Lleva las rodillas adelante y sube los talones. Baja poco a poco y vuelve.',
              care: 'Apoyado en todo momento. Baja solo hasta donde las rodillas vayan cómodas.' } },
          { name: 'Elevación de talones', mode: 'perSide', dur: 30, transition: { seconds: 5 },
            instruction: {
              action: 'A una pierna: sube el talón hasta donde controles y baja despacio. Unas 10.',
              care: 'Una mano en la mesa para el equilibrio. Sin rebotes.' } },
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
              action: 'Apoya la espalda alta en el respaldo y arquea suave, abriendo el pecho. La cabeza no va atrás.',
              care: 'El arco nace del pecho. Si el respaldo te cae en el cuello o la cintura, eleva el pecho sin apoyarte.' } },
          { name: 'Apertura de pecho sentado', mode: 'timed', dur: 30,
            instruction: {
              action: 'Lleva los brazos atrás, junta los omóplatos y abre el pecho. Respira ancho.',
              care: 'Sin agarrarte al respaldo ni arquear la cintura. Abre solo hasta donde no moleste.' } },
        ]},
      /* s120 (B2.3 OLA 3): migrado al contrato v1. Scapular squeeze → `reps` con
         **dosis legacy CONSERVADA** (12 reps, «2 segundos cada una» → tempo 1-2-1
         con 2 s de retención; posturalControl, audit B2.1 «cue ya trae reps y
         retención»); Band pull-apart y Apertura de pecho → `timed` (reutilizan el
         copy de OLA 2 —shoulder.circles/chair.antidote—, mismo glifo); Superman →
         `reps` (10) sobre SUELO; hoy ya no está (ver abajo). Antes contaba la bajada al
         suelo vía estimatedSeconds, §6). `name` intactos → glifos sin tocar.
         Acceso free SIN cambios.
         DE PIE Y SIN SUELO: una rutina «de oficina» no puede pedir tumbarse. El Superman
         dejó su sitio a los deslizamientos en pared (ya tenían dibujo), así que entra en
         los pozos de «A tu ritmo» como pausa de pie (revisión de los ejercicios, Ez,
         16 oct. 2026). */
      { id: 'extra.back.desk', tag: 'BACK', code: 'Espalda', name: 'Espalda de oficina', desc: 'Despierta la espalda alta y los hombros, de pie junto a una pared.', min: 3,
        position: ['standing'], equipment: ['wallOptional'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Juntar omóplatos', mode: 'reps', reps: 12, dur: 40,
            tempo: { down: 1, hold: 2, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'De pie, pies al ancho de las caderas, hombros sueltos.',
              action: 'Junta los omóplatos hacia el centro y mantén un instante. Suelta.',
              care: 'Hombros abajo, lejos de las orejas.' } },
          { name: 'Apertura con banda', mode: 'timed', dur: 40,
            instruction: {
              setup: 'De pie, la banda delante del pecho y los brazos casi estirados.',
              action: 'Separa las manos juntando los omóplatos, sin subir la banda a la cara. Hombros abajo.',
              care: 'Sin banda, ábrelos en el aire: mueve el hombro, pero no es el mismo trabajo.' } },
          { name: 'Deslizamientos en pared', mode: 'reps', reps: 8, dur: 48,
            tempo: { down: 3, hold: 0, up: 3 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'De espaldas a la pared, pies un paso por delante. Brazos en cruz apoyados en ella.',
              action: 'Sube y baja los brazos junto a la pared, como alas, despacio.',
              care: 'Si mantenerlos pegados te fuerza la postura, sepáralos un poco. Sin pared, hazlo en el aire.' } },
          { name: 'Apertura de pecho', mode: 'timed', dur: 40,
            instruction: {
              action: 'Manos tras la nuca, sin tirar de la cabeza. Abre los codos y respira ancho.',
              care: 'Cuello cómodo, mirada al frente. Abre solo hasta donde no moleste.' } },
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
              care: 'Más suave con las rodillas en el suelo: en línea de los hombros a las rodillas, sin echar la cadera atrás.' } },
          { name: 'Descanso', mode: 'rest', dur: 20,
            instruction: { action: 'Respira.' } },
          { name: 'Plancha lateral', mode: 'perSide', dur: 30, transition: { seconds: 10 },
            instruction: {
              action: 'De lado, codo bajo el hombro y piernas estiradas, una sobre otra. Sube la cadera y mantén.',
              care: 'Más suave con las dos rodillas dobladas y la de abajo en el suelo.' } },
          { name: 'Descanso', mode: 'rest', dur: 20,
            instruction: { action: 'Respira.' } },
          { name: 'Hueco abdominal', mode: 'timed', dur: 30,
            instruction: {
              action: 'Tumbado boca arriba: pega la lumbar al suelo y eleva piernas y hombros.',
              care: 'Para que sea más suave, dobla las rodillas y deja los brazos junto al cuerpo.' } },
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
