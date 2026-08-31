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
          { name: 'Zancada con apertura', mode: 'perSide', dur: 30, setup: { mode: 'ready', estimatedSeconds: 15 }, transition: { seconds: 10 },
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
        intensity: 'gentle', level: 'accessible',
        position: ['seated'], equipment: [], requiresFloor: false,
        desc: 'Sin levantarse. 6 movimientos en la silla.', min: 2,
        steps: [
          { name: 'Encogimiento de hombros', dur: 20, cue: 'Hombros arriba, luego relaja.' },
          { name: 'Círculos de muñeca', dur: 20, cue: '10 en cada sentido.' },
          { name: 'Giro sentado', dur: 20, cue: 'Rota hacia el respaldo.' },
          { name: 'Círculos de tobillo', dur: 20, cue: 'Bajo la mesa.' },
          { name: 'Barbilla atrás', dur: 20, cue: 'Barbilla atrás 5 veces.' },
          { name: 'Respiraciones profundas', dur: 20, cue: '3 inhalaciones completas.' },
        ]},
      /* s119 (B2.3 OLA 2): migración mecánica al contrato v1 (s115). Movilidad
         de muñecas → `timed` (exploratorio, BASE §3-B); Finger extension →
         `reps` (consistente con grip.squeeze de OLA 1). Sin suelo/pared → sin
         gate `ready`. `name` intactos → glifos sin tocar. */
      { id: 'move.wrists', tag: 'WRST', code: 'Muñecas', name: 'Muñecas y manos',
        desc: 'El antídoto al teclado. Muñecas sueltas en 3 minutos.', min: 3,
        position: ['seated', 'standing'], equipment: ['deskOptional'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Círculos de muñeca', mode: 'timed', dur: 30,
            instruction: {
              action: 'Gira las muñecas en círculos amplios, en los dos sentidos.',
              care: 'Muñecas sueltas, sin apretar.' } },
          { name: 'Estiramiento de muñeca', mode: 'timed', dur: 40,
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
          { name: 'Extensión de dedos', mode: 'reps', reps: 10, dur: 30,
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
      { id: 'move.shoulders.5', tag: 'SHLD', code: 'Hombros', name: 'Hombros',
        desc: 'Hombros a punto: rotadores, pecho, trapecios. Necesitas pared; barra opcional.', min: 4,
        position: ['standing'], equipment: ['wall', 'barOptional'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Deslizamientos en pared', mode: 'timed', dur: 50, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Ponte de espaldas a la pared, brazos en cruz apoyados en ella.',
              action: 'Sube y baja los brazos pegados a la pared, como alas.',
              care: 'Mantén la zona lumbar cerca de la pared.' } },
          { name: 'Apertura con banda', mode: 'timed', dur: 50,
            instruction: {
              action: 'Abre los brazos al frente juntando los omóplatos. Sin banda, cruza los brazos y ábrelos.',
              care: 'Hombros abajo, lejos de las orejas.' } },
          { name: 'Rotación externa', mode: 'timed', dur: 50,
            instruction: {
              action: 'Codos pegados al cuerpo a 90°. Abre los antebrazos hacia fuera y vuelve.',
              care: 'Movimiento pequeño y controlado.' } },
          { name: 'Suspensión pasiva · opcional', mode: 'timed', dur: 45, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Busca una barra firme que soporte tu peso y agárrala. Sin barra, repite las wall slides.',
              action: 'Cuelga con los brazos estirados y suelta el peso de los hombros.',
              care: 'Tracción suave. Baja si notas molestia.' } },
          { name: 'Extensión torácica', mode: 'timed', dur: 40,
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
          { name: 'Encogimiento de hombros', mode: 'timed', dur: 40,
            instruction: {
              action: 'Sube los hombros, llévalos atrás y bájalos redondeando el círculo.',
              care: 'Movimiento fluido, sin prisa.' } },
          { name: 'Rotación externa', mode: 'timed', dur: 45,
            instruction: {
              action: 'Codos pegados al cuerpo a 90°. Abre los antebrazos hacia fuera y vuelve.',
              care: 'Movimiento pequeño y controlado.' } },
          { name: 'Apertura con banda', mode: 'timed', dur: 45,
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
              action: 'Arquea suave sobre el respaldo, abriendo el pecho al techo.',
              care: 'El arco nace del pecho, no de la zona lumbar.' } },
          { name: 'Rotación torácica', mode: 'perSide', dur: 30, transition: { seconds: 8 },
            instruction: {
              setup: 'Siéntate erguido, pies apoyados. Cruza las manos sobre el pecho.',
              action: 'Gira el tronco despacio hacia un lado. Vuelve al centro.',
              care: 'El giro nace del tronco, no del cuello.' } },
          { name: 'Inclinación lateral', mode: 'perSide', dur: 30, transition: { seconds: 8 },
            instruction: {
              setup: 'Siéntate erguido, deja los hombros abajo.',
              action: 'Lleva la oreja hacia el hombro, despacio. Nota el estirón en el lado contrario.',
              care: 'No empujes con la mano. Deja caer el peso de la cabeza.' } },
          { name: 'Barbilla atrás', mode: 'reps', reps: 5, dur: 40,
            tempo: { down: 2, hold: 4, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Lleva la barbilla atrás en horizontal, como haciendo papada. Mantén y relaja.',
              care: 'Movimiento pequeño. La cabeza no sube ni baja, sólo va atrás.' } },
          { name: 'Respiraciones profundas', mode: 'rest', dur: 20,
            instruction: { action: '3 inhalaciones completas para cerrar.' } },
        ]},
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
};

/* La segunda mitad (caderas y flujos) la añade `extra.data.piernas.js`. Se publica
   AQUÍ y no al final del otro archivo para que el orden de grupos sea el de la
   biblioteca: un `Object.assign` conserva el orden de inserción. */
window.EXTRA_ROUTINES = EXTRA_ROUTINES;
