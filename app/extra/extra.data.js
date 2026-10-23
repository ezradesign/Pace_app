/* PACE · app/extra/extra.data.js (s178) — LAS RUTINAS DE **ESTIRA**, primera mitad.
   =================================================================================
   OJO, QUE LOS IDS VAN CRUZADOS: este archivo vive en `app/extra/` y sus rutinas
   llevan ids `move.*`, porque el SWAP de la sesión 14 cambió el contenedor visual
   y no los ids, para no invalidar el localStorage ni los logros de nadie. Lo que
   pinta esto es **Estira** (`lib.extra.title`). Ver la tabla de CLAUDE.md, que
   hasta s178 tenía las RUTAS cambiadas y mandó a más de una sesión al archivo
   equivocado.

   POR QUÉ ESTÁ TROCEADO EN DOS: `ExtraModule.jsx` llegó a **553 líneas** al entrar
   las tres rutinas de oficina de s178 y la regla §1 de CLAUDE.md manda trocear, no
   registrar deuda. La tabla de STATE.md ya lo tenía escrito desde s148: «al retomar
   Estira, trocear los DATOS antes». El corte es por GRUPO, que es la única costura
   que el dato ya tenía; las dos mitades componen el mismo objeto.

   EL ORDEN DE CARGA ES CONTRATO: este archivo declara `EXTRA_ROUTINES` y
   `extra.data.piernas.js` le añade sus dos grupos. Si se invierten en PACE.html, el
   segundo aborta con su guard en vez de dejar media biblioteca en silencio. */
const EXTRA_ROUTINES = {
  oficina: {
    label: 'Oficina',
    aside: 'Antídoto al escritorio',
    items: [
      { id: 'move.chair.antidote', tag: 'SIT', code: 'Antídoto a estar sentado', name: 'Antídoto silla',
        /* Sin «exacto a 4 h»: nadie lo ha medido, y la base no deja prometer efectos. */
        desc: 'Lo contrario de estar sentado: pecho, caderas y cuello. Pasarás por el suelo.', min: 5,
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
              action: 'Manos tras la nuca, sin tirar de la cabeza. Abre los codos y respira ancho.',
              care: 'Cuello cómodo, mirada al frente. Abre solo hasta donde no moleste.' } },
          { name: 'Rotación torácica', mode: 'perSide', dur: 20, transition: { seconds: 10 },
            instruction: {
              setup: 'Siéntate erguido, pies apoyados. Cruza las manos sobre el pecho.',
              action: 'Gira el tronco despacio hacia un lado. Vuelve al centro.',
              care: 'El giro nace del tronco, no del cuello.' } },
          { name: 'Flexor de cadera', mode: 'perSide', dur: 25, setup: { mode: 'ready', estimatedSeconds: 15 }, transition: { seconds: 10 },
            instruction: {
              setup: 'Una rodilla en el suelo, la otra pierna delante en ángulo. Cojín bajo la rodilla si molesta.',
              action: 'Avanza la pelvis unos centímetros, sin arquear la cintura. Estirón suave en la ingle de atrás.',
              care: 'Recorrido corto. Si la rodilla molesta aun con el cojín, salta este paso.' } },
          { name: 'Zancada con apertura', mode: 'perSide', dur: 30, setup: { mode: 'ready', estimatedSeconds: 15 }, transition: { seconds: 10 },
            instruction: {
              setup: 'Da un paso largo a una zancada. Apoya en el suelo la mano contraria a la pierna de delante.',
              action: 'Abre el pecho y lleva al techo el brazo del lado de la pierna de delante.',
              care: 'Si no llegas al suelo, apoya la mano en una mesa estable. Puedes mirar al frente.' } },
          { name: 'Cuello y trapecios', mode: 'perSide', dur: 20, transition: { seconds: 10 },
            instruction: {
              setup: 'Siéntate erguido, hombros abajo.',
              action: 'Inclina la cabeza con control, la oreja hacia el hombro.',
              care: 'Sin tirar con la mano ni subir el hombro.' } },
          /* CIERRE respiratorio — sin restKind a propósito (s113): NO es un
             descanso entre series y el ajuste de Tweaks (s114) no lo toca. */
          { name: 'Reset respiración', mode: 'rest', dur: 30,
            instruction: { action: '3 inhalaciones profundas para cerrar.' } },
        ]},
      { id: 'move.neck.3', tag: 'SIT', code: 'Cuello', name: 'Cuello',
        desc: 'Micro-pausa para cervicales tensas.', min: 3,
        position: ['seated'], equipment: [], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          /* s113: control postural con retención (desliza + mantén 3-5 s +
             relaja), no cadencia de fuerza. s115 (B2.2b-1): el `repSeconds:8`
             pasa a `tempo:{down,hold,up}` (suma 8 s = misma cadencia); el resto
             es el contrato formal (instruction + transición). En perSide el lado
             lo integra el runner. */
          { name: 'Barbilla atrás', mode: 'reps', reps: 5, dur: 40,
            tempo: { down: 2, hold: 4, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Siéntate erguido, hombros sueltos. Mira al frente.',
              action: 'Desliza la barbilla recta hacia atrás. La nuca se alarga. Mantén y suelta.',
              care: 'Sin tensar. Un recorrido pequeño ya trabaja.' } },
          { name: 'Inclinación de cuello', mode: 'perSide', dur: 25, transition: { seconds: 10 },
            instruction: {
              setup: 'Siéntate erguido, deja los hombros abajo.',
              action: 'Lleva la oreja hacia el hombro, despacio. Nota el estirón en el lado contrario.',
              care: 'Inclina con control, sin tirar con la mano ni subir el hombro.' } },
          /* Es girar y volver, no 25 s mirando al lado (NHS, movilidad de cuello): tres a cada
             lado, con dos segundos arriba. */
          { name: 'Rotación lenta', mode: 'reps', reps: 6, dur: 36,
            tempo: { down: 2, hold: 2, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Erguido, barbilla paralela al suelo.',
              action: 'Gira despacio a mirar sobre un hombro, espera dos segundos y vuelve. Tres a cada lado.',
              care: 'Gira solo hasta donde el cuello vaya suelto.' } },
          { name: 'Escalenos', mode: 'perSide', dur: 20, transition: { seconds: 10 },
            instruction: {
              setup: 'Siéntate erguido. Si quieres, una mano bajo el muslo de ese lado, para que no suba el hombro.',
              action: 'Inclina la cabeza al lado contrario. Si va cómodo, gira un poco la cara hacia arriba.',
              care: 'Muy suave. La zona del cuello es delicada.' } },
        ]},
      { id: 'move.desk.quick', tag: 'SIT', code: 'Escritorio', name: 'Escritorio express',
        intensity: 'gentle', level: 'accessible',
        position: ['seated'], equipment: [], requiresFloor: false,
        desc: 'Sin levantarse. 6 movimientos en la silla.', min: 2,
        /* Cada gesto con su colocación o su cuidado, como el resto del catálogo. «Barbilla
           atrás 5 veces» era un reloj de 20 s: son 5 repeticiones de 4 s, los mismos 20. */
        steps: [
          { name: 'Encogimiento de hombros', mode: 'timed', dur: 20,
            instruction: {
              setup: 'Siéntate erguido, pies apoyados, brazos sueltos.',
              action: 'Sube los hombros hacia las orejas y bájalos despacio. Repite.',
              care: 'Suelta el aire al bajar. La mandíbula, floja.' } },
          /* Diez por sentido no caben en 20 s si se hacen despacio: cuatro por sentido. */
          { name: 'Círculos de muñeca', mode: 'reps', reps: 8, dur: 32,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Sentado, antebrazos cómodos.',
              action: 'Círculos pequeños con las manos, despacio: cuatro en cada sentido.',
              care: 'Sin apretar los puños ni buscar el máximo.' } },
          { name: 'Giro sentado', mode: 'timed', dur: 20,
            instruction: {
              action: 'Gira el tronco hacia el respaldo, con una mano apoyada en él, sin tirar. Luego, al otro lado.',
              care: 'Gira solo hasta donde vaya suelto. El giro nace del tronco, no del cuello.' } },
          { name: 'Círculos de tobillo', mode: 'timed', dur: 20,
            instruction: {
              action: 'Bajo la mesa, levanta un pie y dibuja círculos con el tobillo. Cambia a mitad.',
              care: 'Círculos lentos, del tamaño que puedas sin mover toda la pierna.' } },
          { name: 'Barbilla atrás', mode: 'reps', reps: 5, dur: 20,
            tempo: { down: 1, hold: 2, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Desliza la barbilla recta hacia atrás, mantén y suelta. 5 veces.',
              care: 'Recorrido pequeño. La cabeza va atrás, no abajo.' } },
          { name: 'Respiraciones profundas', mode: 'rest', dur: 20,
            instruction: { action: '3 inhalaciones completas para cerrar.' } },
        ]},
      /* s119 (B2.3 OLA 2): migración mecánica al contrato v1 (s115). Movilidad
         de muñecas → `timed` (exploratorio, BASE §3-B); Finger extension →
         `reps` (consistente con grip.squeeze de OLA 1). Sin suelo/pared → sin
         gate `ready`. `name` intactos → glifos sin tocar. */
      { id: 'move.wrists', tag: 'WRST', code: 'Muñecas', name: 'Muñecas y manos',
        desc: 'El antídoto al teclado. Muñecas sueltas en 3 minutos.', min: 3,
        position: ['seated', 'standing'], equipment: ['deskOptional'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Círculos de muñeca', mode: 'reps', reps: 8, dur: 32,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Sentado, antebrazos cómodos.',
              action: 'Círculos pequeños con las manos, despacio: cuatro en cada sentido.',
              care: 'Sin apretar los puños ni buscar el máximo.' } },
          { name: 'Estiramiento de muñeca', mode: 'timed', dur: 40,
            instruction: {
              setup: 'Brazo al frente, el codo sin bloquear.',
              action: 'Palma abajo y luego palma arriba: con la otra mano, lleva los dedos hacia ti. Cambia a mitad.',
              care: 'Presión ligera. Nunca hasta el dolor.' } },
          { name: 'Palmas en la mesa', mode: 'timed', dur: 40,
            instruction: {
              setup: 'De pie frente a la mesa, palmas apoyadas y dedos hacia ti. Codos estirados, sin bloquear.',
              action: 'Lleva la cadera un poco atrás, despacio, hasta notar un estirón suave en el antebrazo.',
              care: 'Casi sin peso sobre las manos. Si molesta, sepárate un poco de la mesa.' } },
          { name: 'Rezo invertido', mode: 'timed', dur: 40,
            instruction: {
              action: 'Junta los dorsos de las manos frente al pecho, con los dedos hacia abajo y un contacto ligero.',
              care: 'Notarás un estirón suave encima de la muñeca. Sin empujar una mano contra la otra.' } },
          { name: 'Extensión de dedos', mode: 'reps', reps: 10, dur: 30,
            tempo: { down: 1, hold: 1, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Abre bien los dedos, estíralos y relaja.',
              care: 'Sin empujarlos hacia atrás con la otra mano.' } },
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
      { id: 'move.shoulders.5', tag: 'SHLD', code: 'Hombros', name: 'Hombros',
        desc: 'Hombros a punto: rotadores, pecho, trapecios. Necesitas pared; barra opcional.', min: 4,
        position: ['standing'], equipment: ['wall', 'barOptional'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Deslizamientos en pared', mode: 'timed', dur: 50, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Ponte de espaldas a la pared, brazos en cruz apoyados en ella.',
              action: 'Sube y baja los brazos junto a la pared, como alas.',
              care: 'Si mantenerlos pegados te fuerza la postura, sepáralos un poco. La zona lumbar, cerca de la pared.' } },
          { name: 'Apertura con banda', mode: 'timed', dur: 50,
            instruction: {
              setup: 'De pie, la banda delante del pecho y los brazos casi estirados.',
              action: 'Separa las manos juntando los omóplatos, sin subir la banda a la cara. Hombros abajo.',
              care: 'Sin banda, ábrelos en el aire: mueve el hombro, pero no es el mismo trabajo.' } },
          { name: 'Rotación externa', mode: 'timed', dur: 50,
            instruction: {
              action: 'Codos pegados al cuerpo a 90°. Abre los antebrazos hacia fuera y vuelve.',
              care: 'Sin resistencia: es para mover el hombro. Pequeño y controlado.' } },
          { name: 'Suspensión pasiva · opcional', mode: 'timed', dur: 45, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Agarra una barra firme que aguante tu peso. Sin barra, repite los deslizamientos en pared.',
              action: 'Cuelga con los brazos estirados y suelta el peso de los hombros.',
              care: 'Tracción suave. Baja si notas molestia.' } },
          /* Sobre el respaldo de una silla, como su dibujo: la de rulo pedía tumbarse en una
             rutina sin suelo. El texto es el de «Columna en la silla». */
          { name: 'Extensión torácica', mode: 'timed', dur: 40,
            instruction: {
              setup: 'Siéntate atrás del todo, con la espalda alta apoyada en el respaldo.',
              action: 'Arquea suave sobre el respaldo, abriendo el pecho. La cabeza no va atrás.',
              care: 'El arco nace del pecho. Si el respaldo te cae en el cuello o la cintura, eleva el pecho sin apoyarte.' } },
        ]},
      /* s119 (B2.3 OLA 2): migración al contrato v1. Todo movilidad → `timed`
         (BASE §3-B). Sin material → sin gate. External rotation / Band pull-apart
         / Apertura de pecho comparten copy con shoulders.5 y chair.antidote
         (mismo ejercicio, mismo glifo). */
      { id: 'move.shoulder.circles', tag: 'SHLD', code: 'Hombros', name: 'Hombros · círculos',
        desc: 'Círculos amplios y controlados. Libera hombros de escritorio.', min: 4,
        position: ['seated', 'standing'], equipment: [], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          /* Movilidad dinámica: va por vueltas y no por reloj (BASE §3-B). Cuatro hacia delante y
             cuatro hacia atrás, como vio Ez en la foto de la decisión 1A (23 oct. 2026). */
          { name: 'Círculos de brazos', mode: 'reps', reps: 8, dur: 32,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              action: 'De pie, dibuja círculos lentos con el brazo estirado: cuatro hacia delante y cuatro atrás.',
              care: 'Empieza pequeño. Haz el círculo más grande solo si el tronco sigue quieto.' } },
          { name: 'Encogimiento de hombros', mode: 'timed', dur: 40,
            instruction: {
              action: 'Sube los hombros, llévalos atrás y bájalos redondeando el círculo.',
              care: 'Movimiento fluido, sin prisa.' } },
          { name: 'Rotación externa', mode: 'timed', dur: 45,
            instruction: {
              action: 'Codos pegados al cuerpo a 90°. Abre los antebrazos hacia fuera y vuelve.',
              care: 'Sin resistencia: es para mover el hombro. Pequeño y controlado.' } },
          { name: 'Apertura con banda', mode: 'timed', dur: 45,
            instruction: {
              setup: 'De pie, la banda delante del pecho y los brazos casi estirados.',
              action: 'Separa las manos juntando los omóplatos, sin subir la banda a la cara. Hombros abajo.',
              care: 'Sin banda, ábrelos en el aire: mueve el hombro, pero no es el mismo trabajo.' } },
          { name: 'Apertura de pecho', mode: 'timed', dur: 50,
            instruction: {
              action: 'Manos tras la nuca, sin tirar de la cabeza. Abre los codos y respira ancho.',
              care: 'Cuello cómodo, mirada al frente. Abre solo hasta donde no moleste.' } },
        ]},
      /* s120 (B2.3 OLA 3): migración mecánica al contrato v1. Toda movilidad de
         columna → `timed` (BASE §3-B/F). Gate `ready` en el 1er paso de suelo
         (Gato-camello). Gato-camello y Rotación torácica reutilizan el copy de
         morning.flow (mismo glifo). Puente torácico: se consolida el cue existente
         + care ligero; su ESCALÓN de regresión (audit B2.1) queda para la ola
         editorial. `name` intactos. Acceso premium SIN cambios. */
      /* s178 · LA HERMANA EN SILLA DE `move.spine.waves`, tercera del bloque de oficina.
         Los cuatro ejercicios ya tienen arte y su `setup` los declara SENTADOS: `Extension
         toracica` («apoya la espalda alta en el respaldo»), `Rotacion toracica` e
         `Inclinacion lateral` («sientate erguido»).
         `Barbilla atras` va en REPETICIONES y no en segundos porque BASE §3-E lo dice con
         nombre y apellidos: el chin tuck es control postural, «5 repeticiones · manten 3-5 s»,
         nunca «45 segundos». Se hace ENTERA sin levantarse de la silla. */
      { id: 'move.spine.chair', tag: 'SPN', code: 'Columna', name: 'Columna en la silla',
        desc: 'Columna y cuello sin levantarse. Cuatro movimientos en la silla.', min: 4,
        position: ['seated'], equipment: ['stableChair'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Extensión torácica', mode: 'timed', dur: 35,
            instruction: {
              setup: 'Siéntate atrás del todo, con la espalda alta apoyada en el respaldo.',
              action: 'Arquea suave sobre el respaldo, abriendo el pecho. La cabeza no va atrás.',
              care: 'El arco nace del pecho. Si el respaldo te cae en el cuello o la cintura, eleva el pecho sin apoyarte.' } },
          { name: 'Rotación torácica', mode: 'perSide', dur: 30, transition: { seconds: 8 },
            instruction: {
              setup: 'Siéntate erguido, pies apoyados. Cruza las manos sobre el pecho.',
              action: 'Gira el tronco despacio hacia un lado. Vuelve al centro.',
              care: 'El giro nace del tronco, no del cuello.' } },
          { name: 'Inclinación de cuello', mode: 'perSide', dur: 30, transition: { seconds: 8 },
            instruction: {
              setup: 'Siéntate erguido, deja los hombros abajo.',
              action: 'Lleva la oreja hacia el hombro, despacio. Nota el estirón en el lado contrario.',
              care: 'Inclina con control, sin tirar con la mano ni subir el hombro.' } },
          { name: 'Barbilla atrás', mode: 'reps', reps: 5, dur: 40,
            tempo: { down: 2, hold: 4, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Lleva la barbilla atrás en horizontal, sin bajarla hacia el cuello. Mantén y relaja.',
              care: 'Movimiento pequeño. La cabeza no sube ni baja, sólo va atrás.' } },
          { name: 'Respiraciones profundas', mode: 'rest', dur: 20,
            instruction: { action: '3 inhalaciones completas para cerrar.' } },
        ]},
      /* LA HERMANA DE PIE DE `move.spine.chair` (Ez, 15 oct. 2026: las series de «A tu
         ritmo»). La pausa larga sirve una Estira de pie y Estira solo tenía de pie caderas y
         piernas. El dibujo de `Rotación torácica` es sentado, así que aquí el paso lleva
         nombre propio y cae al dibujo de reserva hasta que haya uno de pie. Unidades por
         BASE §3-B, §3-C y §6; liberación rápida de §5 (sale en unos 3 min). */
      { id: 'move.back.standing', tag: 'SPN', code: 'Espalda', name: 'Espalda de pie',
        desc: 'Espalda y pecho sin sentarte ni bajar al suelo. Cuatro gestos junto a la mesa.', min: 3,
        position: ['standing'], equipment: [], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Rodar hacia abajo', mode: 'timed', dur: 40,
            instruction: {
              setup: 'Ponte de pie, pies al ancho de las caderas.',
              action: 'Redondea la espalda poco a poco hacia abajo, hasta donde vaya cómodo. Sube igual, despacio.',
              care: 'Rodillas suaves; puedes parar a medio camino. Sube despacio para no marearte.' } },
          { name: 'Rotación torácica de pie', mode: 'perSide', dur: 20, transition: { seconds: 8 },
            instruction: {
              setup: 'De pie, pies al ancho de las caderas. Cruza las manos sobre el pecho.',
              action: 'Gira el tronco despacio hacia un lado. Vuelve al centro.',
              care: 'Que no gire todo el cuerpo a la vez, sin bloquear la cadera a la fuerza. El giro nace del tronco.' } },
          { name: 'Apertura de pecho', mode: 'timed', dur: 30,
            instruction: {
              action: 'Manos tras la nuca, sin tirar de la cabeza. Abre los codos y respira ancho.',
              care: 'Cuello cómodo, mirada al frente. Abre solo hasta donde no moleste.' } },
          { name: 'Juntar omóplatos', mode: 'reps', reps: 8, dur: 32,
            tempo: { down: 1, hold: 2, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Junta los omóplatos hacia el centro y mantén un instante. Suelta.',
              care: 'Hombros abajo, lejos de las orejas.' } },
          { name: 'Respiraciones profundas', mode: 'rest', dur: 20,
            instruction: { action: '3 inhalaciones completas para cerrar.' } },
        ]},
      { id: 'move.spine.waves', tag: 'SPN', code: 'Columna', name: 'Columna · ondas',
        desc: 'Ondas y puentes, con paso por el suelo. La columna, poco a poco.', min: 5, access: 'premium',
        position: ['floor', 'standing', 'seated'], equipment: [], requiresFloor: true, intensity: 'moderate', level: 'intermediate',
        steps: [
          { name: 'Gato-camello', mode: 'timed', dur: 60, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Ponte a cuatro patas, manos bajo los hombros y rodillas bajo las caderas.',
              action: 'Redondea y extiende la espalda despacio, sin buscar los extremos.',
              care: 'Movimiento lento, siguiendo la respiración.' } },
          /* Suelo, sentado y de pie, en ese orden: antes se bajaba al suelo dos veces. */
          { name: 'Puente torácico', mode: 'timed', dur: 60,
            instruction: {
              setup: 'Siéntate en el suelo, manos apoyadas detrás.',
              action: 'Eleva la cadera y abre el pecho al techo. Baja despacio.',
              care: 'Sube solo hasta donde el pecho abra sin forzar.' } },
          { name: 'Rotación torácica', mode: 'timed', dur: 45,
            instruction: {
              setup: 'Siéntate erguido, manos cruzadas sobre el pecho.',
              action: 'Gira el tronco despacio a un lado y al otro.',
              care: 'El giro nace del tronco, no del cuello.' } },
          { name: 'Onda espinal', mode: 'timed', dur: 60,
            instruction: {
              setup: 'Ponte de pie, rodillas sueltas.',
              action: 'Recorre una ola lenta desde la pelvis hasta la cabeza.',
              care: 'Pequeña y lenta. El cuello acompaña, sin latigazos.' } },
          { name: 'Rodar hacia abajo', mode: 'timed', dur: 60,
            instruction: {
              setup: 'Ponte de pie, pies al ancho de las caderas.',
              action: 'Redondea la espalda poco a poco hacia abajo, hasta donde vaya cómodo. Sube igual, despacio.',
              care: 'Rodillas suaves; puedes parar a medio camino. Sube despacio para no marearte.' } },
        ]},
    ]
  },
};

/* La segunda mitad (caderas y flujos) la añade `extra.data.piernas.js`. Se publica
   AQUÍ y no al final del otro archivo para que el orden de grupos sea el de la
   biblioteca: un `Object.assign` conserva el orden de inserción. */
window.EXTRA_ROUTINES = EXTRA_ROUTINES;
