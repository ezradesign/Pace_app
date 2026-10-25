/* PACE · app/extra/extra.data.js — LAS RUTINAS DE **ESTIRA**, primera mitad: «Para empezar» y «Oficina».
   =================================================================================
   OJO, QUE LOS IDS VAN CRUZADOS: este archivo vive en `app/extra/` y sus rutinas llevan ids `move.*`
   (y algunas `extra.*` que llegaron de Mueve), porque cambiar un id borraría el historial y los
   logros de la gente. Lo que pinta esto es **Estira** (`lib.extra.title`): solo estiramientos,
   casi yoga o pilates (Ez, 23 oct. 2026).

   LAS TRES CAPAS (Ez, 23 oct. 2026: 2A). «Para empezar» va arriba: seis pausas de 2-3 minutos con
   ejercicios que ya existían, gratis enteras (4A); son las que propone «A tu ritmo» sin pagar
   (`entrada`). Rehacen las rutinas de antes que se parecían y guardan su id. Debajo, el resto
   ordenado; «Para ir a más» lleva `aparte` y solo sale si se elige. ATG y Ancestral dejan de salir
   en la lista, pero su id se sigue encontrando (`EXTRA_ROUTINES_FUERA`, en el otro archivo).

   POR QUÉ ESTÁ TROCEADO EN DOS: la regla de las 500 líneas. El corte es por grupo, y las dos
   mitades componen el mismo objeto.

   EL ORDEN DE CARGA ES CONTRATO: este archivo declara `EXTRA_ROUTINES` y `extra.data.piernas.js` le
   añade sus grupos. Si se invierten en PACE.html, el segundo aborta con su guard en vez de dejar
   media biblioteca en silencio. */
const EXTRA_ROUTINES = {
  empezar: {
    label: 'Para empezar',
    aside: 'Dos o tres minutos, sin forzar',
    entrada: true,
    items: [
      /* Para empezar (2A): mover el cuello sentado, sin tirar con las manos. Rehace «Cuello» con su
         id. La barbilla mantiene 3 s, como pide el control postural (BASE §3-E). */
      { id: 'move.neck.3', tag: 'SIT', code: 'Cuello', name: 'Cuello suave',
        desc: 'Atrás, giro y a los lados, sin tirar de la cabeza.', min: 2,
        position: ['seated'], equipment: [], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Barbilla atrás', mode: 'reps', reps: 5, dur: 25,
            tempo: { down: 1, hold: 3, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Siéntate erguido, hombros sueltos. Mira al frente.',
              action: 'Desliza la barbilla recta hacia atrás, mantén tres segundos y vuelve.',
              care: 'Recorrido pequeño. La cabeza va atrás, no abajo.' } },
          { name: 'Rotación lenta', mode: 'reps', reps: 6, dur: 36,
            tempo: { down: 2, hold: 2, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Erguido, barbilla paralela al suelo.',
              action: 'Gira despacio a mirar sobre un hombro, espera dos segundos y vuelve. Tres a cada lado.',
              care: 'Gira solo hasta donde el cuello vaya suelto.' } },
          { name: 'Inclinación de cuello', mode: 'perSide', dur: 12, transition: { seconds: 8 },
            instruction: {
              setup: 'Siéntate erguido, deja los hombros abajo.',
              action: 'Lleva la oreja hacia el hombro, despacio. Nota el estirón en el lado contrario.',
              care: 'Inclina con control, sin tirar con la mano ni subir el hombro.' } },
        ]},
      /* Para empezar (2A): mover los hombros en tres direcciones, de pie junto a una pared. Rehace
         «Hombros · círculos» con su id. */
      { id: 'move.shoulder.circles', tag: 'SHLD', code: 'Hombros', name: 'Brazos libres',
        desc: 'Círculos, la pared y el giro del hombro.', min: 2,
        position: ['standing'], equipment: ['wall'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Círculos de brazos', mode: 'reps', reps: 8, dur: 32,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              action: 'De pie, dibuja círculos lentos con el brazo estirado: cuatro hacia delante y cuatro atrás.',
              care: 'Empieza pequeño. Haz el círculo más grande solo si el tronco sigue quieto.' } },
          { name: 'Deslizamientos en pared', mode: 'reps', reps: 6, dur: 36,
            tempo: { down: 3, hold: 0, up: 3 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'De espaldas a la pared, pies un paso por delante. Brazos en cruz apoyados en ella.',
              action: 'Sube y baja los brazos junto a la pared, como alas, despacio.',
              care: 'Si mantenerlos pegados te fuerza la postura, sepáralos un poco.' } },
          { name: 'Rotación externa', mode: 'reps', reps: 6, dur: 24,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              action: 'Codos pegados al cuerpo a 90°. Abre los antebrazos hacia fuera y vuelve.',
              care: 'Sin resistencia: es para mover el hombro. Pequeño y controlado.' } },
        ]},
      /* Para empezar (2A): dedos y muñecas sin cargar peso sobre ellas. Rehace «Muñecas y manos»
         con su id; las palmas en la mesa y el rezo invertido pasan a «Manos y antebrazos». */
      { id: 'move.wrists', tag: 'WRST', code: 'Muñecas', name: 'Manos y muñecas',
        desc: 'Puño, círculos y un estiramiento suave.', min: 2,
        position: ['seated'], equipment: [], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Abrir y cerrar el puño', mode: 'reps', reps: 6, dur: 18,
            tempo: { down: 1, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Brazos relajados, manos abiertas.',
              action: 'Cierra el puño sin apretar al máximo y ábrelo despacio, del todo.',
              care: 'Suave: no es un ejercicio de fuerza.' } },
          { name: 'Círculos de muñeca', mode: 'reps', reps: 8, dur: 32,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Sentado, antebrazos cómodos.',
              action: 'Círculos pequeños con las manos, despacio: cuatro en cada sentido.',
              care: 'Sin apretar los puños ni buscar el máximo.' } },
          { name: 'Estiramiento de muñeca', mode: 'perSide', dur: 20, transition: { seconds: 5 },
            instruction: {
              setup: 'Brazo al frente, el codo sin bloquear.',
              action: 'Palma abajo y luego palma arriba: con la otra mano, lleva los dedos hacia ti, suave.',
              care: 'Presión ligera. Nunca hasta el dolor.' } },
        ]},
      /* Para empezar (2A): extensión suave y giro del tronco desde la silla. Rehace «Columna en la
         silla» con su id; la inclinación de cuello y la barbilla van en «Cuello suave». */
      { id: 'move.spine.chair', tag: 'SPN', code: 'Columna', name: 'Tronco sentado',
        desc: 'Pecho arriba, giro y apertura, sin levantarte.', min: 2,
        position: ['seated'], equipment: [], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Extensión torácica', mode: 'reps', reps: 5, dur: 25,
            tempo: { down: 2, hold: 1, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Siéntate atrás del todo, con la espalda alta apoyada en el respaldo.',
              action: 'Eleva un poco el pecho sobre el respaldo y vuelve. La cabeza no va atrás.',
              care: 'Si el respaldo te cae en el cuello o la cintura, eleva el pecho sin apoyarte.' } },
          { name: 'Rotación torácica', mode: 'reps', reps: 8, dur: 32,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Siéntate erguido, pies apoyados. Cruza las manos sobre el pecho.',
              action: 'Gira el tronco despacio hacia un lado y vuelve. Cuatro a cada lado.',
              care: 'El giro nace del tronco, no del cuello. Sin tirar con los brazos.' } },
          { name: 'Apertura de pecho sentado', mode: 'timed', dur: 15,
            instruction: {
              action: 'Lleva los brazos atrás, junta los omóplatos y abre el pecho. Respira ancho.',
              care: 'Sin agarrarte al respaldo ni arquear la cintura.' } },
          { name: 'Apertura de pecho sentado', mode: 'timed', dur: 15,
            instruction: {
              action: 'Otra vez, un poco más si va cómodo.',
              care: 'Abre solo hasta donde no moleste.' } },
        ]},
      /* Para empezar (2A): estirar detrás del muslo de pie, con la mesa al lado, y mover los
         tobillos sentado. Rehace «Cadena posterior de pie» con su id. */
      { id: 'move.hamstrings.standing', tag: 'LEG', code: 'Isquios', name: 'Piernas en pausa',
        desc: 'Detrás del muslo y los tobillos, junto a la mesa.', min: 3,
        position: ['standing', 'seated'], equipment: ['deskOptional'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Isquio a una pierna', mode: 'perSide', dur: 15, transition: { seconds: 8 },
            instruction: {
              setup: 'Una mano en la mesa. Un talón delante, en el suelo, rodilla estirada o un poco doblada.',
              action: 'Lleva la cadera atrás, tronco largo. Nota el estirón detrás del muslo.',
              care: 'La rodilla de apoyo, algo flexionada. Sin rebotes.' } },
          { name: 'Isquio a una pierna', mode: 'perSide', dur: 15, transition: { seconds: 8 },
            instruction: {
              action: 'Otra vez, un poco más lejos si va cómodo.',
              care: 'Sin rebotes. Sal despacio.' } },
          { name: 'Círculos de tobillo', mode: 'reps', reps: 16, dur: 32,
            tempo: { down: 1, hold: 0, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Siéntate y levanta un poco un pie.',
              action: 'Círculos con el tobillo: cuatro en cada sentido con un pie, y luego con el otro.',
              care: 'Del tamaño que puedas sin mover toda la pierna.' } },
        ]},
      /* Para empezar (2A), en el suelo: la espalda, la parte de delante de la cadera y respirar a
         cuatro apoyos. Rehace «Despertar matinal» con su id. */
      { id: 'move.morning.flow', tag: 'FLOW', code: 'Suelo', name: 'Movilidad en suelo',
        desc: 'Gato-camello, la cadera y respirar. En el suelo.', min: 3,
        position: ['floor'], equipment: [], requiresFloor: true, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Gato-camello', mode: 'reps', reps: 6, dur: 36, setup: { mode: 'ready', estimatedSeconds: 15 },
            tempo: { down: 3, hold: 0, up: 3 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'Ponte a cuatro patas, manos bajo los hombros y rodillas bajo las caderas.',
              action: 'Redondea y extiende la espalda despacio, sin buscar los extremos.',
              care: 'Movimiento lento, siguiendo la respiración.' } },
          { name: 'Flexor de cadera', mode: 'perSide', dur: 15, transition: { seconds: 10 },
            instruction: {
              setup: 'Una rodilla en el suelo, la otra pierna delante. Cojín bajo la rodilla si molesta.',
              action: 'Avanza la pelvis unos centímetros, sin arquear la cintura. Estirón suave en la ingle de atrás.',
              care: 'Si la rodilla molesta aun con el cojín, salta este paso.' } },
          { name: 'Respirar a cuatro apoyos', mode: 'timed', dur: 25,
            instruction: {
              setup: 'A cuatro patas, espalda larga y cuello suelto.',
              action: 'Inhala llevando el aire a los lados de las costillas. Exhala despacio.',
              care: 'Sin forzar el aire. Deja que las costillas se ensanchen, sin bloquear la espalda.' } },
        ]},
    ]
  },
  oficina: {
    label: 'Oficina',
    aside: 'Antídoto al escritorio',
    items: [
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
      /* Lo contrario de estar sentado: pecho, caderas y cuello, con paso por el suelo. Los
         escalenos llegan de «Cuello», que ahora es una pausa de entrada (2A): ningún ejercicio se
         borra. Sin «exacto a 4 h»: nadie lo ha medido, y la base no deja prometer efectos. */
      { id: 'move.chair.antidote', tag: 'SIT', code: 'Antídoto a estar sentado', name: 'Antídoto silla',
        desc: 'Lo contrario de estar sentado: pecho, caderas y cuello. Pasarás por el suelo.', min: 6,
        position: ['seated', 'halfKneeling', 'standing'], equipment: ['cushionOptional'], requiresFloor: true, intensity: 'gentle', level: 'accessible',
        steps: [
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
          { name: 'Escalenos', mode: 'perSide', dur: 20, transition: { seconds: 10 },
            instruction: {
              setup: 'Siéntate erguido. Si quieres, una mano bajo el muslo de ese lado, para que no suba el hombro.',
              action: 'Inclina la cabeza al lado contrario. Si va cómodo, gira un poco la cara hacia arriba.',
              care: 'Muy suave. La zona del cuello es delicada.' } },
          { name: 'Reset respiración', mode: 'rest', dur: 30,
            instruction: { action: '3 inhalaciones profundas para cerrar.' } },
        ]},
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
      /* Manos y antebrazos (antes «Grip + antebrazos», en Mueve): es estirar, así que vive en Estira
         (2A). Recoge las palmas en la mesa y el rezo invertido de «Muñecas y manos», que ahora es
         una pausa de entrada: ningún ejercicio se borra. */
      { id: 'extra.grip.squeeze', tag: 'GRIP', code: 'Antebrazos', name: 'Manos y antebrazos', desc: 'Abrir, estirar y apoyar las palmas en la mesa.', min: 3,
        position: ['seated', 'standing'], equipment: ['deskOptional'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
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
          { name: 'Palmas en la mesa', mode: 'timed', dur: 30,
            instruction: {
              setup: 'De pie frente a la mesa, palmas apoyadas y dedos hacia ti. Codos estirados, sin bloquear.',
              action: 'Lleva la cadera un poco atrás, despacio, hasta notar un estirón suave en el antebrazo.',
              care: 'Casi sin peso sobre las manos. Si molesta, sepárate un poco de la mesa.' } },
          { name: 'Rezo invertido', mode: 'timed', dur: 30,
            instruction: {
              action: 'Junta los dorsos de las manos frente al pecho, con los dedos hacia abajo y un contacto ligero.',
              care: 'Notarás un estirón suave encima de la muñeca. Sin empujar una mano contra la otra.' } },
        ]},
    ]
  },
};

/* La segunda mitad la añade `extra.data.piernas.js`. Se publica AQUÍ y no al final del otro
   archivo para que el orden de grupos sea el de la biblioteca: `Object.assign` conserva el orden
   de inserción. */
window.EXTRA_ROUTINES = EXTRA_ROUTINES;
