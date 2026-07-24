/* PACE · Módulo Estira (Estiramientos / Movilidad)
   Botón: "Estira" · afloja tensión.

   v0.11.9 — SWAP de contenido (sesión 14):
   Las rutinas de estiramiento/movilidad pasaron a este módulo (antes vivían
   en MoveModule). La calistenia y la fuerza pasaron a MoveModule (botón
   "Mueve"). Los ids (`move.*` / `extra.*`) y funciones de state
   (completeMoveSession / completeExtraSession) se conservan para no
   invalidar localStorage ni logros de usuarios existentes — solo cambia
   qué contenedor visual los muestra.

   F5 (s91): 7 → 14 rutinas, biblioteca agrupada como Respira (4 grupos,
   free primero dentro de cada grupo). Inspiración: Strengthside (caderas/
   hombros/columna, movilidad de suelo, flujos diarios cortos). Los pasos
   nuevos sin glifo aprobado renderizan DefaultGlyph hasta el port (D-4). */

const EXTRA_ROUTINES = {
  oficina: {
    label: 'Oficina',
    aside: 'Antídoto al escritorio',
    items: [
      { id: 'move.chair.antidote', tag: 'SIT', code: 'Antídoto a estar sentado', name: 'Antídoto silla',
        desc: 'Antídoto exacto a 4 h sentado. Caderas, lumbar, cuello. Pasarás por el suelo.', min: 5,
        position: ['seated', 'halfKneeling', 'standing'], equipment: ['cushionOptional'], requiresFloor: true, intensity: 'gentle', level: 'accessible',
        steps: [
          /* s115 (B2.2b-1): contrato formal — `instruction` {setup,action,care}
             (consolida cue/placeCue/careCue de s114); `transition.seconds` = el
             cambio de lado (perSide), hoy 10 s uniformes (s113). OJO a los dos
             «setup»: `setup:{mode:'ready',...}` = COMPORTAMIENTO del runner
             (espera al usuario, nunca cuenta) · `instruction.setup` = COPY de
             colocación. El cierre respiratorio no se toca (sin restKind). */
          { name: 'Apertura de pecho', mode: 'timed', dur: 40,
            instruction: {
              action: 'Manos tras la nuca. Abre los codos y mira al techo. Respira ancho.',
              care: 'Abre solo hasta donde el pecho estire sin molestar.' } },
          { name: 'Rotación torácica', mode: 'perSide', dur: 20, transition: { seconds: 10 },
            instruction: {
              setup: 'Siéntate erguido, pies apoyados. Cruza las manos sobre el pecho.',
              action: 'Gira el tronco despacio hacia un lado. Vuelve al centro.',
              care: 'El giro nace del tronco, no del cuello.' } },
          { name: 'Flexor de cadera', mode: 'perSide', dur: 25, setup: { mode: 'ready', estimatedSeconds: 15 }, transition: { seconds: 10 },
            instruction: {
              setup: 'Apoya una rodilla en el suelo, la otra pierna delante en ángulo. Un cojín bajo la rodilla si molesta.',
              action: 'Empuja la pelvis hacia delante. Estirón suave en la ingle de atrás.',
              care: 'Recorrido corto. No fuerces la zona lumbar.' } },
          { name: 'World\'s greatest stretch', mode: 'perSide', dur: 30, setup: { mode: 'ready', estimatedSeconds: 15 }, transition: { seconds: 10 },
            instruction: {
              setup: 'Da un paso largo a una zancada. Baja la mano de dentro hacia el suelo.',
              action: 'Abre el pecho y lleva el otro brazo al techo. Sigue la mano con la mirada.',
              care: 'Apoya la mano en un libro si no llegas al suelo.' } },
          { name: 'Cuello y trapecios', mode: 'perSide', dur: 20, transition: { seconds: 10 },
            instruction: {
              setup: 'Siéntate erguido, hombros abajo.',
              action: 'Lleva la oreja hacia el hombro. Deja caer el peso de la cabeza.',
              care: 'Sin tirar con la mano. Solo el peso.' } },
          /* CIERRE respiratorio — sin restKind a propósito (s113): NO es un
             descanso entre series y el ajuste de Tweaks (s114) no lo toca. */
          { name: 'Reset respiración', mode: 'rest', dur: 30,
            instruction: { action: '3 inhalaciones profundas para cerrar.' } },
        ]},
      { id: 'move.neck.3', tag: 'SIT', code: 'Cuello', name: 'Cuello · 3 min',
        desc: 'Micro-pausa para cervicales tensas.', min: 3,
        position: ['seated'], equipment: [], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          /* s113: control postural con retención (desliza + mantén 3-5 s +
             relaja), no cadencia de fuerza. s115 (B2.2b-1): el `repSeconds:8`
             pasa a `tempo:{down,hold,up}` (suma 8 s = misma cadencia); el resto
             es el contrato formal (instruction + transición). En perSide el lado
             lo integra el runner. */
          { name: 'Chin tucks', mode: 'reps', reps: 5, dur: 40,
            tempo: { down: 2, hold: 4, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Siéntate erguido, hombros sueltos. Mira al frente.',
              action: 'Desliza la barbilla recta hacia atrás. La nuca se alarga. Mantén y suelta.',
              care: 'Sin tensar. Un recorrido pequeño ya trabaja.' } },
          { name: 'Inclinación lateral', mode: 'perSide', dur: 25, transition: { seconds: 10 },
            instruction: {
              setup: 'Siéntate erguido, deja los hombros abajo.',
              action: 'Lleva la oreja hacia el hombro, despacio. Nota el estirón en el lado contrario.',
              care: 'No empujes con la mano. Deja caer el peso de la cabeza.' } },
          { name: 'Rotación lenta', mode: 'perSide', dur: 25, transition: { seconds: 10 },
            instruction: {
              setup: 'Erguido, barbilla paralela al suelo.',
              action: 'Gira despacio a mirar sobre el hombro. Vuelve al centro.',
              care: 'Gira solo hasta donde el cuello vaya suelto.' } },
          { name: 'Escalenos', mode: 'perSide', dur: 20, transition: { seconds: 10 },
            instruction: {
              setup: 'Siéntate sobre una mano para anclar ese hombro.',
              action: 'Inclina la cabeza al lado contrario y mira un poco arriba.',
              care: 'Muy suave. La zona del cuello es delicada.' } },
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
      /* s119 (B2.3 OLA 2): migración mecánica al contrato v1 (s115). Movilidad
         de muñecas → `timed` (exploratorio, BASE §3-B); Finger extension →
         `reps` (consistente con grip.squeeze de OLA 1). Sin suelo/pared → sin
         gate `ready`. `name` intactos → glifos sin tocar. */
      { id: 'move.wrists', tag: 'WRST', code: 'Muñecas', name: 'Muñecas y manos',
        desc: 'El antídoto al teclado. Muñecas sueltas en 3 minutos.', min: 3,
        position: ['seated', 'standing'], equipment: ['deskOptional'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Wrist circles', mode: 'timed', dur: 30,
            instruction: {
              action: 'Gira las muñecas en círculos amplios, en los dos sentidos.',
              care: 'Muñecas sueltas, sin apretar.' } },
          { name: 'Wrist stretch', mode: 'timed', dur: 40,
            instruction: {
              action: 'Estira la muñeca en flexión y luego en extensión, ayudándote con la otra mano. Cambia de mano a mitad.',
              care: 'Presión ligera. Nunca hasta el dolor.' } },
          { name: 'Palmas al suelo', mode: 'timed', dur: 40,
            instruction: {
              setup: 'Apoya las palmas en la mesa, dedos apuntando hacia ti.',
              action: 'Lleva el peso atrás despacio hasta notar el estirón en el antebrazo.',
              care: 'Suave. Reduce el peso si molesta.' } },
          { name: 'Rezo invertido', mode: 'timed', dur: 40,
            instruction: {
              action: 'Junta los dorsos de las manos frente al pecho y baja las muñecas despacio.',
              care: 'Estirón suave en la cara interna. Sin forzar.' } },
          { name: 'Finger extension', mode: 'reps', reps: 10, dur: 30,
            tempo: { down: 1, hold: 1, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Abre bien los dedos, estíralos y relaja.',
              care: 'Sin forzar las articulaciones.' } },
        ]},
    ]
  },
  hombros: {
    label: 'Hombros y columna',
    aside: 'Antídoto al teclado',
    items: [
      /* s119 (B2.3 OLA 2): migración al contrato v1. Movilidad/isometría de
         hombros → `timed` (BASE §3-B/D). Gate `ready` en los pasos que exigen
         PARED (wall slides) o BARRA (dead hang); el resto auto (s112). `name`
         intactos. Dead hang conserva su nombre «· opcional» (glifo intacto). */
      { id: 'move.shoulders.5', tag: 'SHLD', code: 'Hombros', name: 'Hombros · 5 pasos',
        desc: 'Reset de hombros: rotadores, pecho, trapecios. Necesitas pared; barra opcional.', min: 4,
        position: ['standing'], equipment: ['wall', 'barOptional'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Scapular wall slides', mode: 'timed', dur: 50, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Ponte de espaldas a la pared, brazos en cruz apoyados en ella.',
              action: 'Sube y baja los brazos pegados a la pared, como alas.',
              care: 'Mantén la zona lumbar cerca de la pared.' } },
          { name: 'Band pull-apart', mode: 'timed', dur: 50,
            instruction: {
              action: 'Abre los brazos al frente juntando los omóplatos. Sin banda, cruza los brazos y ábrelos.',
              care: 'Hombros abajo, lejos de las orejas.' } },
          { name: 'External rotation', mode: 'timed', dur: 50,
            instruction: {
              action: 'Codos pegados al cuerpo a 90°. Abre los antebrazos hacia fuera y vuelve.',
              care: 'Movimiento pequeño y controlado.' } },
          { name: 'Dead hang · opcional', mode: 'timed', dur: 45, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Busca una barra firme que soporte tu peso y agárrala. Sin barra, repite las wall slides.',
              action: 'Cuelga con los brazos estirados y suelta el peso de los hombros.',
              care: 'Tracción suave. Baja si notas molestia.' } },
          { name: 'Thoracic extension', mode: 'timed', dur: 40,
            instruction: {
              setup: 'Apoya la espalda alta sobre un foam roller o una toalla enrollada.',
              action: 'Arquea abriendo el pecho al techo.',
              care: 'El arco nace del pecho, no de la lumbar.' } },
        ]},
      /* s119 (B2.3 OLA 2): migración al contrato v1. Todo movilidad → `timed`
         (BASE §3-B). Sin material → sin gate. External rotation / Band pull-apart
         / Apertura de pecho comparten copy con shoulders.5 y chair.antidote
         (mismo ejercicio, mismo glifo). */
      { id: 'move.shoulder.circles', tag: 'SHLD', code: 'Hombros', name: 'Hombros · círculos',
        desc: 'Círculos amplios y controlados. Libera hombros de escritorio.', min: 4,
        position: ['seated', 'standing'], equipment: [], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Círculos de hombro', mode: 'timed', dur: 60,
            instruction: {
              action: 'Círculos lentos y amplios con el brazo estirado, en los dos sentidos.',
              care: 'Amplios, pero sin tensar el cuello.' } },
          { name: 'Shrug + round', mode: 'timed', dur: 40,
            instruction: {
              action: 'Sube los hombros, llévalos atrás y bájalos redondeando el círculo.',
              care: 'Movimiento fluido, sin prisa.' } },
          { name: 'External rotation', mode: 'timed', dur: 45,
            instruction: {
              action: 'Codos pegados al cuerpo a 90°. Abre los antebrazos hacia fuera y vuelve.',
              care: 'Movimiento pequeño y controlado.' } },
          { name: 'Band pull-apart', mode: 'timed', dur: 45,
            instruction: {
              action: 'Abre los brazos al frente juntando los omóplatos. Sin banda, cruza los brazos y ábrelos.',
              care: 'Hombros abajo, lejos de las orejas.' } },
          { name: 'Apertura de pecho', mode: 'timed', dur: 50,
            instruction: {
              action: 'Manos tras la nuca. Abre los codos y mira al techo. Respira ancho.',
              care: 'Abre solo hasta donde el pecho estire sin molestar.' } },
        ]},
      /* s120 (B2.3 OLA 3): migración mecánica al contrato v1. Toda movilidad de
         columna → `timed` (BASE §3-B/F). Gate `ready` en el 1er paso de suelo
         (Gato-camello). Gato-camello y Rotación torácica reutilizan el copy de
         morning.flow (mismo glifo). Puente torácico: se consolida el cue existente
         + care ligero; su ESCALÓN de regresión (audit B2.1) queda para la ola
         editorial. `name` intactos. Acceso premium SIN cambios. */
      { id: 'move.spine.waves', tag: 'SPN', code: 'Columna', name: 'Columna · ondas',
        desc: 'Ondas y puentes, con paso por el suelo. La columna, vértebra a vértebra.', min: 5, access: 'premium',
        position: ['floor', 'standing', 'seated'], equipment: [], requiresFloor: true, intensity: 'moderate', level: 'intermediate',
        steps: [
          { name: 'Gato-camello', mode: 'timed', dur: 60, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Ponte a cuatro patas, manos bajo los hombros y rodillas bajo las caderas.',
              action: 'Arquea y redondea la espalda despacio, vértebra a vértebra.',
              care: 'Movimiento lento, siguiendo la respiración.' } },
          { name: 'Onda espinal', mode: 'timed', dur: 60,
            instruction: {
              setup: 'Ponte de pie, rodillas sueltas.',
              action: 'Recorre una ola lenta desde la pelvis hasta la cabeza.',
              care: 'Movimiento fluido, sin prisa.' } },
          { name: 'Rotación torácica', mode: 'timed', dur: 45,
            instruction: {
              setup: 'Siéntate erguido, manos cruzadas sobre el pecho.',
              action: 'Gira el tronco despacio a un lado y al otro.',
              care: 'El giro nace del tronco, no del cuello.' } },
          { name: 'Puente torácico', mode: 'timed', dur: 60,
            instruction: {
              setup: 'Siéntate en el suelo, manos apoyadas detrás.',
              action: 'Eleva la cadera y abre el pecho al techo. Baja despacio.',
              care: 'Sube solo hasta donde el pecho abra sin forzar.' } },
          { name: 'Rodar hacia abajo', mode: 'timed', dur: 60,
            instruction: {
              setup: 'Ponte de pie, pies al ancho de las caderas.',
              action: 'Baja vértebra a vértebra hasta colgar el tronco. Sube igual, despacio.',
              care: 'Rodillas suaves. Sube despacio para no marearte.' } },
        ]},
    ]
  },
  caderas: {
    label: 'Caderas y piernas',
    aside: 'Desbloquea la mitad inferior',
    items: [
      /* s119 (B2.3 OLA 2): migración al contrato v1. Estiramientos bilaterales
         (Cossack, Pigeon) → `perSide` con transición (BASE §3-C); movilidad de
         suelo (90/90, Squat, Puente) → `timed`. Gate `ready` en el PRIMER paso
         de suelo (90/90). 90/90, Pigeon y Puente con marcha comparten copy con
         couch.stretch (mismo ejercicio/glifo). `min` 6 dentro de rango. */
      { id: 'move.hips.5', tag: 'HIP', code: 'Caderas', name: 'Caderas · 5 pasos',
        desc: '5 pasos para desbloquear caderas profundas. Casi todo en el suelo.', min: 6,
        position: ['floor', 'standing'], equipment: ['cushionOptional'], requiresFloor: true, intensity: 'moderate', level: 'intermediate',
        steps: [
          { name: 'Cossack squat', mode: 'perSide', dur: 30, transition: { seconds: 10 },
            instruction: {
              action: 'Pies muy anchos. Baja el peso hacia este lado, con la otra pierna estirada. Sube despacio.',
              care: 'Talón apoyado. Baja solo hasta donde controles.' } },
          { name: '90/90', mode: 'timed', dur: 60, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Siéntate en el suelo, una pierna delante y otra al lado, ambas a 90°.',
              action: 'Gira despacio de un lado al otro. Tronco alto.',
              care: 'Apóyate en las manos por detrás para ir más cómodo.' } },
          { name: 'Pigeon', mode: 'perSide', dur: 30, transition: { seconds: 10 },
            instruction: {
              setup: 'Lleva una espinilla al frente, la otra pierna estirada atrás.',
              action: 'Camina el peso hacia delante. Baja el pecho poco a poco.',
              care: 'Pon un cojín bajo la cadera que quede en el aire.' } },
          { name: 'Squat profundo', mode: 'timed', dur: 60,
            instruction: {
              action: 'Baja a una sentadilla profunda, talones en el suelo, codos por dentro de las rodillas.',
              care: 'Apóyate en algo si pierdes el equilibrio.' } },
          { name: 'Puente con marcha', mode: 'timed', dur: 60,
            instruction: {
              setup: 'Túmbate boca arriba, pies apoyados cerca del glúteo.',
              action: 'Sube la cadera y aguanta. Levanta una rodilla, luego la otra.',
              care: 'Baja el ritmo si la lumbar se queja.' } },
        ]},
      { id: 'move.couch.stretch', tag: 'HIP', code: 'Caderas', name: 'Couch stretch',
        desc: 'Flexores profundos contra pared o silla, rodilla al suelo. El estiramiento del sofá.', min: 6, access: 'premium',
        position: ['halfKneeling', 'floor', 'supine'], equipment: ['wall', 'cushionOptional'], requiresFloor: true, intensity: 'strong', level: 'intermediate',
        /* 5º piloto del contrato v1 (s112, B2.2a.5): estiramiento estático de
           pared/suelo. s115 (B2.2b-1): contrato formal — `instruction`
           {setup,action,care}, `setup:{mode:'ready',estimatedSeconds}` (los dos
           «setup» distintos: comportamiento vs copy), `transition.seconds` en
           los perSide. dur en perSide = segundos POR LADO (activo = dur×2 + 1
           transición). s118 (B2.3): `min` 5→6 — el dev-check calculaba 6–7 min y
           5 quedaba fuera del rango mostrado (único piloto descuadrado, s115). */
        steps: [
          { name: 'Flexor de cadera', mode: 'perSide', dur: 25, setup: { mode: 'ready', estimatedSeconds: 15 }, transition: { seconds: 10 },
            instruction: {
              setup: 'Apoya una rodilla en el suelo, la otra pierna delante en ángulo. Un cojín bajo la rodilla si molesta.',
              action: 'Empuja la pelvis adelante. Estirón suave en la ingle de atrás.',
              care: 'Recorrido corto. Mantén el tronco erguido.' } },
          { name: 'Couch stretch', mode: 'perSide', dur: 30, setup: { mode: 'ready', estimatedSeconds: 15 }, transition: { seconds: 10 },
            instruction: {
              setup: 'Apoya el empeine de atrás contra la pared o una silla, con la rodilla al fondo.',
              action: 'Sube el tronco despacio. Aprieta el glúteo de atrás.',
              care: 'Aleja la rodilla de la pared para bajar la intensidad. Es un estiramiento fuerte.' } },
          { name: '90/90', mode: 'timed', dur: 60,
            instruction: {
              setup: 'Siéntate en el suelo, una pierna delante y otra al lado, ambas a 90°.',
              action: 'Gira despacio de un lado al otro. Tronco alto.',
              care: 'Apóyate en las manos por detrás para ir más cómodo.' } },
          { name: 'Pigeon', mode: 'perSide', dur: 30, transition: { seconds: 10 },
            instruction: {
              setup: 'Lleva una espinilla al frente, la otra pierna estirada atrás.',
              action: 'Camina el peso hacia delante. Baja el pecho poco a poco.',
              care: 'Pon un cojín bajo la cadera que quede en el aire.' } },
          { name: 'Puente con marcha', mode: 'timed', dur: 60,
            instruction: {
              setup: 'Túmbate boca arriba, pies apoyados cerca del glúteo.',
              action: 'Sube la cadera y aguanta. Levanta una rodilla, luego la otra.',
              care: 'Baja el ritmo si la lumbar se queja.' } },
        ]},
      { id: 'move.hips.ground', tag: 'GRND', code: 'Suelo', name: 'Caderas · suelo',
        desc: 'Flujo de suelo: rana, 90/90, transiciones. Caderas libres.', min: 6, access: 'premium',
        steps: [
          { name: 'Rana', dur: 70, cue: 'Rodillas anchas, empuja cadera atrás. Mece suave.' },
          { name: '90/90', dur: 70, cue: 'Rota entre lados despacio.' },
          { name: 'Cossack squat', dur: 60, cue: 'Peso a un lado, otra pierna estirada. 5 por lado.' },
          { name: 'Ground sitting transitions', dur: 80, cue: 'Siéntate al suelo y levántate sin manos.' },
          { name: 'Squat profundo', dur: 70, cue: 'Talones abajo, relaja al fondo.' },
        ]},
      { id: 'move.atg.knees', tag: 'ATG', code: 'Rodillas', name: 'ATG · Rodillas a prueba',
        desc: 'Rodillas sobre los dedos, en rangos profundos. Necesitas pared y suelo.', min: 4, access: 'premium',
        steps: [
          { name: 'ATG split squat', dur: 60, cue: 'Zancada profunda. Rodilla va por delante del pie.' },
          { name: 'Tibialis raise', dur: 45, cue: 'Contra pared, levanta pies.' },
          { name: 'Puente isquio a una pierna', dur: 45, cue: 'Tumbado, un pie apoyado: sube y baja la cadera con control. Cambia de pierna a mitad.' },
          { name: 'Sissy squat', dur: 45, cue: 'Apoyado. Rodillas adelante, talones arriba.' },
          { name: 'Elephant walk', dur: 45, cue: 'Camina tocando suelo, piernas estiradas.' },
        ]},
      /* s120 (B2.3 OLA 3): migración mecánica al contrato v1. Elephant walk y
         Pliegue adelante → `timed`; Isquio a una pierna → `perSide` (fix del «40s
         por lado» en dur:80 → dur POR LADO + transición, §3-C/§6); Puente con
         marcha → `timed` sobre SUELO (reutiliza el copy de hips.5/couch) con gate
         `ready` (entrada al suelo). `name` intactos → glifos sin tocar. `min` 5
         dentro de rango. Acceso premium SIN cambios. */
      { id: 'move.hamstrings', tag: 'LEG', code: 'Isquios', name: 'Cadena posterior',
        desc: 'Isquios y cadena posterior. Piernas largas otra vez.', min: 5, access: 'premium',
        position: ['standing', 'floor'], equipment: [], requiresFloor: true, intensity: 'moderate', level: 'intermediate',
        steps: [
          { name: 'Elephant walk', mode: 'timed', dur: 70,
            instruction: {
              action: 'Camina con las manos por el suelo, piernas lo más estiradas posible.',
              care: 'Dobla algo las rodillas si los isquios tiran.' } },
          { name: 'Pliegue adelante', mode: 'timed', dur: 70,
            instruction: {
              action: 'Pies juntos, deja caer el tronco hacia abajo. Rodillas suaves.',
              care: 'Apoya las manos en las rodillas si lo necesitas.' } },
          { name: 'Isquio a una pierna', mode: 'perSide', dur: 40, transition: { seconds: 10 },
            instruction: {
              setup: 'Apoya un talón adelante, con esa pierna estirada.',
              action: 'Lleva la cadera atrás, tronco largo. Nota el estirón detrás del muslo.',
              care: 'La rodilla de apoyo algo flexionada. Sin rebotes.' } },
          { name: 'Puente con marcha', mode: 'timed', dur: 70, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Túmbate boca arriba, pies apoyados cerca del glúteo.',
              action: 'Sube la cadera y aguanta. Levanta una rodilla, luego la otra.',
              care: 'Baja el ritmo si la lumbar se queja.' } },
        ]},
    ]
  },
  flujos: {
    label: 'Flujos',
    aside: 'De pies a cabeza',
    items: [
      /* s119 (B2.3 OLA 2): migración al contrato v1. Flujo → mezcla `timed`
         (movilidad) + `perSide` (Cuello y trapecios, bilateral) + `rest` de
         cierre respiratorio (SIN restKind, s113 — no es descanso entre series).
         Gate `ready` en el PRIMER paso de suelo (Gato-camello). Gato-camello,
         Squat, Apertura de pecho, Cuello y trapecios y Reset respiración
         comparten copy con spine.waves/chair.antidote (mismo glifo). */
      { id: 'move.morning.flow', tag: 'FLOW', code: 'Mañana', name: 'Despertar matinal',
        desc: 'Flujo suave de cuerpo entero para empezar el día. Empieza en el suelo.', min: 5,
        position: ['floor', 'seated', 'standing'], equipment: [], requiresFloor: true, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Gato-camello', mode: 'timed', dur: 60, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Ponte a cuatro patas, manos bajo los hombros y rodillas bajo las caderas.',
              action: 'Arquea y redondea la espalda despacio, vértebra a vértebra.',
              care: 'Movimiento lento, siguiendo la respiración.' } },
          { name: 'Rotación torácica', mode: 'timed', dur: 45,
            instruction: {
              setup: 'Siéntate erguido, manos cruzadas sobre el pecho.',
              action: 'Gira el tronco despacio a un lado y al otro.',
              care: 'El giro nace del tronco, no del cuello.' } },
          { name: 'Squat profundo', mode: 'timed', dur: 60,
            instruction: {
              action: 'Baja a una sentadilla profunda, talones en el suelo, codos por dentro de las rodillas.',
              care: 'Apóyate en algo si pierdes el equilibrio.' } },
          { name: 'Apertura de pecho', mode: 'timed', dur: 45,
            instruction: {
              action: 'Manos tras la nuca. Abre los codos y mira al techo. Respira ancho.',
              care: 'Abre solo hasta donde el pecho estire sin molestar.' } },
          { name: 'Cuello y trapecios', mode: 'perSide', dur: 20, transition: { seconds: 10 },
            instruction: {
              setup: 'Siéntate erguido, hombros abajo.',
              action: 'Lleva la oreja hacia el hombro. Deja caer el peso de la cabeza.',
              care: 'Sin tirar con la mano. Solo el peso.' } },
          { name: 'Reset respiración', mode: 'rest', dur: 30,
            instruction: { action: '3 inhalaciones profundas para cerrar.' } },
        ]},
      { id: 'move.ancestral', tag: 'ANC', code: 'Ancestral', name: 'Ancestral',
        desc: 'Técnicas ancestrales: crawl, hang, squat profundo. Suelo y barra firme.', min: 5, access: 'premium',
        steps: [
          { name: 'Deep squat hold', dur: 60, cue: 'Talones abajo, relaja.' },
          { name: 'Crawling', dur: 60, cue: 'Contralateral, lento.' },
          { name: 'Hang pasivo', dur: 45, cue: 'De una barra firme, suelta el peso.' },
          { name: 'Ground sitting transitions', dur: 60, cue: 'Siéntate al suelo y levántate sin manos.' },
          { name: 'Rib pull + respiración', dur: 45, cue: 'Movimiento de gato/vaca.' },
        ]},
    ]
  },
};

function ExtraLibrary({ open, onClose, onStart }) {
  const { t, lang } = useT();
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };
  return (
    <Modal open={open} onClose={onClose} tagLabel={t('lib.tag')} title={t('lib.extra.title')} subtitle={t('lib.extra.subtitle')} maxWidth={860}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 8 }}>
        {Object.entries(EXTRA_ROUTINES).map(([key, group]) => (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <h3 style={{ ...displayItalic, fontSize: 20, margin: 0, fontWeight: 500 }}>{tR(`extra.cat.${key}.label`, group.label)}</h3>
              {group.aside && <Meta>{tR(`extra.cat.${key}.aside`, group.aside)}</Meta>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
              {group.items.map(r => (
                <RoutineCard key={r.id} routine={r} color="var(--extra)" onClick={() => onStart(r)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* Sesión 49 — helper de lookup para Caminos (s91: adaptado a grupos) */
function getExtraRoutine(id) {
  for (const group of Object.values(EXTRA_ROUTINES)) {
    const found = group.items.find(r => r.id === id);
    if (found) return found;
  }
  return null;
}
window.getExtraRoutine = getExtraRoutine;
Object.assign(window, { ExtraLibrary });
