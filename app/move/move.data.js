/* PACE · Datos de Mueve — MOVE_ROUTINES + getMoveRoutine
   OJO, LOS IDS VAN CRUZADOS: Mueve lleva ids `extra.*` (CLAUDE.md). Mueve es fuerza en un cuarto
   y sin objetos (Ez, 23 oct. 2026); lo que es estirar vive en Estira.

   LAS TRES CAPAS (Ez, 23 oct. 2026: 2A). «Para empezar» va arriba: pausas de 2-3 minutos con dosis
   bajas, gratis entera (4A), y son las que propone «A tu ritmo» sin pagar (`entrada`). Debajo, el
   resto. «Con material» y «Para ir a más» llevan `aparte`: «A tu ritmo» nunca las propone y solo
   salen si se eligen. Las rutinas que rehacen otra de antes guardan su id, así que el historial,
   los logros y «Continúa» las siguen reconociendo.

   Contrato de pasos v1: `mode` (timed · reps · perSide · rest), `instruction` {setup, action, care},
   `tempo` {down, hold, up} en las repeticiones guiadas, `transition` en el cambio de lado y
   `setup: { mode: 'ready' }` donde hay que colocarse en el suelo, la pared o con material. Un paso
   `opcional` (la banda) se puede saltar y la rutina cuenta entera. La duración sale de los pasos
   (`estimateDuration`); `dur` en las repeticiones es solo la reserva del runner antiguo.

   `var` (no `const`) a propósito: el build re-expone function/var top-level como global, y
   MoveModule referencia MOVE_ROUTINES sin `window.`. Carga ANTES de MoveModule. */

var MOVE_ROUTINES = {
  empezar: {
    label: 'Para empezar',
    aside: 'Dos o tres minutos, dosis bajas',
    entrada: true,
    items: [
      /* Para empezar (Ez, 23 oct. 2026: 2A): sentarse del todo y levantarse, y subir talones, en
         dosis bajas (2 × 5 y 2 × 6, NHS). Rehace «Sentadillas de silla» con su id: el historial,
         los logros y «Continúa» la siguen reconociendo. */
      { id: 'extra.chair.squats', tag: 'LEG', code: 'Piernas', name: 'Levántate y sube', desc: 'Sentarte y levantarte, y subir talones. Silla estable, sin ruedas.', min: 3,
        position: ['standing'], equipment: ['stableChair'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Sentadilla a silla', mode: 'reps', reps: 5, dur: 20,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'De pie delante de la silla, pies al ancho de las caderas. Silla estable y sin ruedas.',
              action: 'Siéntate del todo, con control. Echa el tronco un poco adelante y levántate empujando el suelo.',
              care: 'Ayúdate con las manos si lo necesitas. La primera vez, una serie basta.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Sentadilla a silla', mode: 'reps', reps: 5, dur: 20,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Otra serie: siéntate con control y levántate sin impulso.',
              care: 'Si cuesta, apoya las manos en los muslos.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Elevación de talones', mode: 'reps', reps: 6, dur: 24,
            tempo: { down: 2, hold: 1, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'De pie, con una mano en la silla o en la mesa.',
              action: 'Sube los talones hasta donde controles. Baja despacio.',
              care: 'Sin rebotes. Si te balanceas, apóyate con las dos manos.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Elevación de talones', mode: 'reps', reps: 6, dur: 24,
            tempo: { down: 2, hold: 1, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Segunda serie: sube y baja despacio.',
              care: 'Sin rebotes. Baja hasta apoyar el talón.' } },
        ]},
      /* Empujar contra la mesa o la pared, dos series cortas: no se añade movilidad para fingir un
         segundo ejercicio de fuerza. Rehace «Flexiones de escritorio» con su id. */
      { id: 'extra.desk.pushups', tag: 'PUSH', code: 'Fuerza', name: 'Empuje sencillo', desc: 'Flexiones contra la mesa o la pared. Dos series cortas.', min: 2,
        position: ['standing'], equipment: ['stableDesk'], requiresFloor: false, intensity: 'moderate', level: 'accessible',
        steps: [
          { name: 'Flexiones inclinadas', mode: 'reps', reps: 5, dur: 20,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Manos en mesa fija o pared, algo más abiertas que los hombros. Pies atrás y el cuerpo en línea.',
              action: 'Baja el pecho hacia la mesa o la pared, codos cerca del cuerpo. Empuja sin hundir la cintura.',
              care: 'Si cuesta, en la pared, manos a la altura del pecho. Mesa fija: ni con ruedas ni plegable.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Flexiones inclinadas', mode: 'reps', reps: 5, dur: 20,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Otra serie: baja con control y empuja.',
              care: 'Para si la técnica se rompe.' } },
        ]},
      /* Piernas sin desplazarte: tibial y una sentadilla alta contra la pared. Rehace «Piernas de
         pie» con su id; la sentadilla de cuádriceps sale hasta tener texto y dibujo claros (2A). */
      { id: 'extra.legs.standing', tag: 'LEG', code: 'Piernas', name: 'Piernas sin pasos', desc: 'Puntas arriba y sentarte en el aire contra la pared.', min: 3,
        position: ['standing'], equipment: ['wall'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Elevación de puntas', mode: 'reps', reps: 8, dur: 32,
            tempo: { down: 2, hold: 1, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Espalda y glúteos en la pared, pies al ancho de las caderas, talones a un palmo de ella.',
              action: 'Sube las puntas de los pies hacia las espinillas. Bájalas despacio.',
              care: 'Movimiento pequeño, sin balancearte hacia atrás.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Elevación de puntas', mode: 'reps', reps: 8, dur: 32,
            tempo: { down: 2, hold: 1, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Segunda serie, igual de despacio.',
              care: 'Notarás el trabajo delante de la espinilla.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Silla en la pared', mode: 'timed', dur: 15,
            instruction: {
              setup: 'Espalda en la pared, pies un paso por delante.',
              action: 'Desliza un poco hacia abajo y quédate. Respira sin aguantar el aire.',
              care: 'Empieza alto: no hace falta llegar a 90°. Para salir, empuja con los pies y sube.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Silla en la pared', mode: 'timed', dur: 15,
            instruction: {
              action: 'Otra vez, a la altura que elijas.',
              care: 'Para salir, empuja con los pies y sube.' } },
        ]},
      /* La fuerza en el suelo, nueva (2A): el puente con los dos pies, el tronco con «desliza el
         talón» (3A) y un gateo con las rodillas apoyadas. Gratis (4A). */
      { id: 'extra.pausa.suelo', tag: 'GRND', code: 'Suelo', name: 'Fuerza en suelo', desc: 'Puente con los dos pies, desliza el talón y un gateo corto. En el suelo.', min: 3,
        position: ['floor'], equipment: [], requiresFloor: true, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Puente con los dos pies', mode: 'reps', reps: 6, dur: 30, setup: { mode: 'ready', estimatedSeconds: 15 },
            tempo: { down: 2, hold: 1, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Boca arriba, rodillas dobladas, pies apoyados al ancho de las caderas y cerca de los glúteos.',
              action: 'Empuja con los pies, sube la pelvis y baja despacio.',
              care: 'Sube solo hasta donde la zona lumbar no se arquee más.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Puente con los dos pies', mode: 'reps', reps: 6, dur: 30,
            tempo: { down: 2, hold: 1, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Segunda serie: sube y baja despacio.',
              care: 'Si la lumbar molesta, sube menos o termina.' } },
          /* La zona lumbar guarda su curva: aplastarla contra el suelo o estirar la pierna a toda
             costa son justo lo que no se pide. El recorrido lo pone la pelvis quieta. */
          { name: 'Desliza el talón', mode: 'reps', reps: 6, dur: 24,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Boca arriba, rodillas dobladas, sin aplastar la zona lumbar contra el suelo.',
              action: 'Desliza un talón por el suelo sin mover la pelvis, y vuelve. Tres con cada pierna.',
              care: 'No hace falta estirar la pierna del todo. Si la espalda se arquea más, acorta el recorrido.' } },
          /* Cuatro pasos de ida y cuatro de vuelta: la cuenta dice los ocho, en los mismos 24 s.
             Con «4» la cuenta acababa a mitad de camino. */
          { name: 'Gateo con rodillas', mode: 'reps', reps: 8, dur: 24,
            tempo: { down: 1, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'A cuatro apoyos: manos bajo los hombros, rodillas bajo las caderas.',
              action: 'Cuatro pasos cortos adelante, despacio, mano y rodilla contrarias. Luego, cuatro atrás.',
              care: 'Las rodillas siguen en el suelo. Si las muñecas molestan, para.' } },
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
              action: 'Ahora aguanta el apretón unos ocho segundos y suelta. Tres veces.',
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
        position: ['seated'], equipment: ['stableChair'], requiresFloor: false, intensity: 'moderate', level: 'accessible',
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
  material: {
    label: 'Con material',
    aside: 'Banda o barra; sin ellas, se salta',
    aparte: true,
    items: [
      /* Con material (2A): la tracción con banda que faltaba (3A) y su alternativa sin nada, el
         remo con tu mano. Los dos pasos de banda se pueden saltar (`opcional`): sin banda, la
         rutina cuenta entera con el remo con tu mano. De pago (4A). */
      { id: 'extra.banda.espalda', tag: 'BACK', code: 'Espalda', name: 'Espalda con banda', desc: 'Abrir y tirar contra una banda. Sin banda, el remo con tu mano.', min: 4, access: 'premium',
        position: ['standing'], equipment: ['band'], requiresFloor: false, intensity: 'moderate', level: 'accessible',
        steps: [
          { name: 'Apertura con banda', mode: 'reps', reps: 8, dur: 32, opcional: true,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'De pie, la banda delante del pecho y los brazos casi estirados.',
              action: 'Separa las manos juntando los omóplatos, sin subir la banda a la cara. Hombros abajo.',
              care: 'Sin banda, salta este paso: la rutina cuenta igual.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          /* Con colocación propia (`ready`): viene tras un descanso, y sin ella el runner no
             enseñaba dónde van los pies ni qué banda, que es lo que evita que se suelte. */
          { name: 'Remo con banda', mode: 'reps', reps: 8, dur: 40, opcional: true, setup: { mode: 'ready', estimatedSeconds: 15 },
            tempo: { down: 2, hold: 1, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Pisa el centro de una banda larga con los dos pies. Rodillas algo dobladas, cadera atrás.',
              action: 'Espalda larga y brazos estirados: lleva los codos hacia las costillas. Vuelve despacio.',
              care: 'Banda suave, sin cortes y bien pisada; no la sueltes tensa. Sin banda, salta este paso.' } },
          { name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 30,
            instruction: { action: 'Respira.' } },
          { name: 'Remo con tu mano', mode: 'perSide', dur: 25, transition: { seconds: 5 },
            instruction: {
              setup: 'De pie. Con una mano, sujeta sin apretar la muñeca de la otra, delante de la tripa.',
              action: 'Lleva ese codo atrás mientras la otra mano frena suave, y vuelve despacio. Unas cinco.',
              care: 'Sin apretar al máximo. Respira con normalidad.' } },
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
  mas: {
    label: 'Para ir a más',
    aside: 'Cuando lo de arriba se queda corto',
    aparte: true,
    items: [
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
      /* Para ir a más. Abre con la bisagra de cadera (3A), que enseña a llevar la cadera atrás; la
         sentadilla de cuádriceps sale hasta tener texto y dibujo claros (2A). El runner no tiene
         repeticiones por lado, así que las cuentas van como guía dentro del reloj de cada lado. */
      { id: 'extra.legs.single', tag: 'LEG', code: 'Unilateral', name: 'Piernas · a una', desc: 'Fuerza a una pierna. Equilibrio, control y una silla estable.', min: 6, access: 'premium',
        intensity: 'strong', level: 'advanced',
        position: ['standing'], equipment: ['stableChair'], requiresFloor: false,
        steps: [
          { name: 'Bisagra de cadera', mode: 'reps', reps: 6, dur: 30,
            tempo: { down: 2, hold: 1, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'De pie, pies al ancho de las caderas, manos en la cintura.',
              action: 'Lleva la cadera atrás con la espalda larga y las rodillas algo dobladas, y vuelve.',
              care: 'El tronco baja porque la cadera va atrás, sin redondear la espalda. Sin peso.' } },
          { name: 'Descanso', mode: 'rest', dur: 20,
            instruction: { action: 'Respira.' } },
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
          { name: 'Elevación de talones', mode: 'perSide', dur: 30, transition: { seconds: 5 },
            instruction: {
              action: 'A una pierna: sube el talón hasta donde controles y baja despacio. Unas 10.',
              care: 'Una mano en la mesa para el equilibrio. Sin rebotes.' } },
        ]},
      /* Para ir a más, en el suelo: plancha, plancha lateral, hueco y el puente con marcha, que
         sale de Estira porque es fuerza (2A). Cada aguante con su versión más suave. */
      { id: 'extra.core.plank', tag: 'CORE', code: 'Core', name: 'Core · plancha', desc: 'Planchas, hueco abdominal y puente con marcha, en el suelo.', min: 4, access: 'premium',
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
          { name: 'Puente con marcha', mode: 'reps', reps: 6, dur: 24,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Boca arriba, pies apoyados cerca del glúteo.',
              action: 'Sube la cadera y mantenla. Levanta una rodilla y luego la otra. Tres con cada una.',
              care: 'Si la pelvis se cae o la lumbar molesta, apoya los dos pies o termina.' } },
          { name: 'Plancha', mode: 'timed', dur: 30,
            instruction: {
              action: 'Última. Vuelve a la plancha, cuerpo en línea. Respira dentro de la tensión.',
              care: 'Apoya las rodillas si la línea se rompe.' } },
        ]},
    ]
  },
};

/* Lookup por id (Caminos, «Continúa», el reparto de «Ver ejercicio»). */
function getMoveRoutine(id) {
  for (const group of Object.values(MOVE_ROUTINES)) {
    const found = group.items.find(r => r.id === id);
    if (found) return found;
  }
  return null;
}
window.getMoveRoutine = getMoveRoutine;
window.MOVE_ROUTINES = MOVE_ROUTINES;
