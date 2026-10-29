/* PACE · app/extra/extra.data.piernas.js — LAS RUTINAS DE **ESTIRA**, 2ª mitad.
   ====================================================================================
   «Hombros y columna», «Caderas y piernas» y «Para ir a más» (ver la cabecera de `extra.data.js`
   para las capas y el aviso de los ids cruzados), y las rutinas que ya no salen en la lista.

   GUARD DE ORDEN: si este archivo se evalúa antes que `extra.data.js`, no hay objeto al que
   añadir nada y la biblioteca se quedaría con media lista sin que nadie se entere. Se aborta. */
if (!window.EXTRA_ROUTINES) {
  throw new Error('extra.data.piernas.js se ha evaluado ANTES que extra.data.js: revisa el orden en PACE.html');
}

Object.assign(window.EXTRA_ROUTINES, {
  hombros: {
    label: 'Hombros y columna',
    aside: 'Antídoto al teclado',
    items: [
      /* Los hombros junto a una pared: sin la banda, que va a «Con material», ni la barra (2A). */
      { id: 'move.shoulders.5', tag: 'SHLD', code: 'Hombros', name: 'Hombros',
        desc: 'Hombros a punto: la pared, el giro del hombro y la espalda alta.', min: 3,
        position: ['standing', 'seated'], equipment: ['wall', 'chair'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Deslizamientos en pared', mode: 'timed', dur: 50, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'De espaldas a la pared, pies un paso por delante. Brazos en W: codos doblados, manos arriba.',
              action: 'Desliza los brazos hacia arriba por la pared y bájalos despacio, sin arquear la cintura.',
              care: 'Si mantenerlos pegados te fuerza la postura, sepáralos un poco. La zona lumbar, cerca de la pared.' } },
          { name: 'Rotación externa', mode: 'timed', dur: 50,
            instruction: {
              action: 'Brazos junto al cuerpo, codos a 90° y palmas arriba. Lleva las manos hacia fuera y vuelve.',
              care: 'Sin resistencia: es para mover el hombro. Pequeño y controlado.' } },
          { name: 'Extensión torácica', mode: 'timed', dur: 40,
            instruction: {
              setup: 'Siéntate atrás del todo, con la espalda alta apoyada en el respaldo.',
              action: 'Arquea suave sobre el respaldo, abriendo el pecho. La cabeza no va atrás.',
              care: 'El arco nace del pecho. Si el respaldo te cae en el cuello o la cintura, eleva el pecho sin apoyarte.' } },
        ]},
      /* Espalda de oficina (antes en Mueve): es movilidad, así que vive en Estira, y sin la banda,
         que va a «Con material» (2A). De pie y sin suelo: una rutina de oficina no pide tumbarse. */
      { id: 'extra.back.desk', tag: 'BACK', code: 'Espalda', name: 'Espalda de oficina', desc: 'Despierta la espalda alta y los hombros, de pie junto a una pared.', min: 3,
        position: ['standing'], equipment: ['wallOptional'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Juntar omóplatos', mode: 'reps', reps: 12, dur: 40,
            tempo: { down: 1, hold: 2, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'De pie, pies al ancho de las caderas, hombros sueltos.',
              action: 'Junta los omóplatos hacia el centro y mantén un instante. Suelta.',
              care: 'Hombros abajo, lejos de las orejas.' } },
          { name: 'Deslizamientos en pared', mode: 'reps', reps: 8, dur: 48,
            tempo: { down: 3, hold: 0, up: 3 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'De espaldas a la pared, pies un paso por delante. Brazos en W: codos doblados, manos arriba.',
              action: 'Desliza los brazos hacia arriba por la pared y bájalos despacio, sin arquear la cintura.',
              care: 'Si mantenerlos pegados te fuerza la postura, sepáralos un poco. Sin pared, hazlo en el aire.' } },
          { name: 'Apertura de pecho', mode: 'timed', dur: 40,
            instruction: {
              action: 'Manos tras la nuca, sin tirar de la cabeza. Abre los codos y respira ancho.',
              care: 'Cuello cómodo, mirada al frente. Abre solo hasta donde no moleste.' } },
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
      /* Suelo, sentado y de pie, en ese orden. El puente torácico y la onda espinal salen hasta tener
         texto y dibujo claros (2A); entra la inclinación de tronco (3A), el gesto lateral de la
         columna que faltaba. */
      { id: 'move.spine.waves', tag: 'SPN', code: 'Columna', name: 'Columna · ondas',
        desc: 'Gato-camello, giro, inclinación y rodar hacia abajo. Pasa por el suelo.', min: 4, access: 'premium',
        position: ['floor', 'seated', 'standing'], equipment: [], requiresFloor: true, intensity: 'moderate', level: 'intermediate',
        steps: [
          { name: 'Gato-camello', mode: 'timed', dur: 60, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Ponte a cuatro patas, manos bajo los hombros y rodillas bajo las caderas.',
              action: 'Redondea y extiende la espalda despacio, sin buscar los extremos.',
              care: 'Movimiento lento, siguiendo la respiración.' } },
          { name: 'Rotación torácica', mode: 'timed', dur: 45,
            instruction: {
              setup: 'Siéntate erguido, manos cruzadas sobre el pecho.',
              action: 'Gira el tronco despacio a un lado y al otro.',
              care: 'El giro nace del tronco, no del cuello.' } },
          { name: 'Inclinación de tronco', mode: 'reps', reps: 6, dur: 30,
            tempo: { down: 2, hold: 1, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'De pie, pies al ancho de las caderas, brazos sueltos.',
              action: 'Inclina el tronco a un lado, la mano baja por el muslo, y vuelve. Tres a cada lado.',
              care: 'Sin girar ni echarte adelante. Solo hasta donde vaya cómodo.' } },
          { name: 'Rodar hacia abajo', mode: 'timed', dur: 60,
            instruction: {
              setup: 'Ponte de pie, pies al ancho de las caderas.',
              action: 'Redondea la espalda poco a poco hacia abajo, hasta donde vaya cómodo. Sube igual, despacio.',
              care: 'Rodillas suaves; puedes parar a medio camino. Sube despacio para no marearte.' } },
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
      /* s178 · LA HERMANA DE PIE DE `move.hips.5`. Nace de un CENSO, no de una idea:
         `scripts/audit/censo-suelo-s178.js` midió que Estira pide suelo en 9 de sus 14
         rutinas, que las CUATRO de caderas son de suelo, y que las cinco rutinas sin suelo
         que había eran TODAS de tren superior — en una biblioteca cuyo subtítulo es
         «antídoto a la silla».
         CERO GLIFOS NUEVOS: los cuatro ejercicios ya tienen arte ingestado y ya viven en el
         catálogo. Lo único que cambia es que aquí ninguno obliga a bajar al suelo.
         VERIFICADO UNO A UNO contra su propio `setup`/`action` antes de componer, que es la
         regla de no inventar técnica: `Cuádriceps en pared` («la rodilla al fondo») y
         `Marcha del elefante` («camina con las manos por el suelo») quedaron FUERA por eso.
         `Sentadilla profunda` sí entra: «talones en el suelo» es en cuclillas, no tumbado.
         UNIDADES por BASE §3-C (estiramiento estático → segundos POR LADO, 20-30 s estándar)
         y §6 (cambio de lado 5-10 s). Rango por §5, Estira rutina completa: 4-8 min y 3-6
         posiciones. Sale en 241 s activos = 4 min, con 4 posiciones y cierre. */
      { id: 'move.hips.standing', tag: 'HIP', code: 'Caderas', name: 'Caderas de pie',
        desc: 'Caderas sin bajar al suelo. Cuatro posiciones junto a la mesa.', min: 4,
        position: ['standing'], equipment: ['deskOptional'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Sentadilla profunda', mode: 'timed', dur: 50,
            instruction: {
              action: 'Baja en cuclillas hasta donde vaya cómodo, talones abajo. Los codos, dentro, sin empujar.',
              care: 'Apóyate en la mesa si pierdes el equilibrio. Si los talones se levantan, baja menos.' } },
          { name: 'Sentadilla lateral', mode: 'perSide', dur: 30, transition: { seconds: 8 },
            instruction: {
              action: 'Pies muy anchos. Dobla esta rodilla hacia donde mira el pie; la otra, estirada. Sube despacio.',
              care: 'Talón apoyado. Baja solo hasta donde controles.' } },
          { name: 'Zancada profunda', mode: 'perSide', dur: 30, transition: { seconds: 8 },
            instruction: {
              setup: 'Da un paso largo hacia atrás, sin apoyar la rodilla.',
              action: 'Hunde la cadera de atrás y mantén el pecho alto.',
              care: 'Tensión suave delante de la cadera de atrás, nunca pinchazo. Sujétate a la mesa si lo necesitas.' } },
          { name: 'Pliegue adelante', mode: 'timed', dur: 35,
            instruction: {
              action: 'Pies al ancho de las caderas, deja caer el tronco hacia abajo. Rodillas suaves.',
              care: 'Manos en los muslos o en la mesa si lo necesitas: no hace falta tocar el suelo. Sal despacio.' } },
          { name: 'Respiraciones profundas', mode: 'rest', dur: 20,
            instruction: { action: '3 inhalaciones completas para cerrar.' } },
        ]},
      /* De pie primero y luego el suelo. El puente con marcha pasa a Mueve, que es fuerza (2A). */
      { id: 'move.hips.5', tag: 'HIP', code: 'Caderas', name: 'Caderas',
        desc: '4 pasos para desbloquear caderas profundas. Casi todo en el suelo.', min: 5,
        position: ['floor', 'standing'], equipment: ['cushionOptional'], requiresFloor: true, intensity: 'moderate', level: 'intermediate',
        steps: [
          { name: 'Sentadilla lateral', mode: 'perSide', dur: 30, transition: { seconds: 10 },
            instruction: {
              action: 'Pies muy anchos. Dobla esta rodilla hacia donde mira el pie; la otra, estirada. Sube despacio.',
              care: 'Talón apoyado. Baja solo hasta donde controles.' } },
          { name: 'Sentadilla profunda', mode: 'timed', dur: 60,
            instruction: {
              action: 'Baja en cuclillas hasta donde vaya cómodo, talones abajo. Los codos, dentro, sin empujar.',
              care: 'Apóyate en algo si pierdes el equilibrio.' } },
          { name: '90/90', mode: 'timed', dur: 60, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'En el suelo, una pierna delante y otra al lado, las dos dobladas, sin buscar el ángulo exacto.',
              action: 'Gira las rodillas de un lado al otro, despacio, sin obligarlas a tocar el suelo. Tronco alto.',
              care: 'Apóyate en las manos por detrás para ir más cómodo.' } },
          { name: 'Paloma', mode: 'perSide', dur: 30, transition: { seconds: 10 },
            instruction: {
              setup: 'Lleva una espinilla al frente, la otra pierna estirada atrás.',
              action: 'Camina el peso hacia delante. Baja el pecho poco a poco.',
              care: 'Un cojín bajo la cadera que queda en el aire, si lo necesitas. Si notas la rodilla, sal de la postura.' } },
        ]},
      /* Detrás de las piernas, de pie y de arriba abajo: el pliegue, el isquio y el gemelo en pared
         (3A). La marcha del elefante sale hasta tener texto y dibujo claros y el puente pasa a Mueve
         (2A); sin ellos ya no pide suelo. */
      { id: 'move.hamstrings', tag: 'LEG', code: 'Isquios', name: 'Cadena posterior',
        desc: 'Detrás de las piernas, de pie: el pliegue, los isquios y el gemelo.', min: 4, access: 'premium',
        position: ['standing'], equipment: ['wall'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Pliegue adelante', mode: 'timed', dur: 60,
            instruction: {
              action: 'Pies al ancho de las caderas, deja caer el tronco hacia abajo. Rodillas suaves.',
              care: 'Manos en los muslos si lo necesitas: no hace falta tocar el suelo.' } },
          { name: 'Isquio a una pierna', mode: 'perSide', dur: 40, transition: { seconds: 10 },
            instruction: {
              setup: 'Apoya un talón delante, en el suelo, con esa rodilla estirada o un poco doblada.',
              action: 'Cadera atrás y tronco adelante, sin redondear la espalda. Tensión detrás del muslo de delante.',
              care: 'La rodilla de apoyo algo flexionada. Sin rebotes.' } },
          { name: 'Gemelo en pared', mode: 'perSide', dur: 25, transition: { seconds: 8 },
            instruction: {
              setup: 'De cara a la pared, manos en ella. Un pie atrás, dedos hacia delante y talón en el suelo.',
              action: 'Dobla la rodilla de delante y lleva la cadera hacia la pared, con la pierna de atrás estirada.',
              care: 'Estirón suave en el gemelo de atrás. Su talón sigue en el suelo. Sin rebotes.' } },
        ]},
    ]
  },
  mas: {
    label: 'Para ir a más',
    aside: 'Más hondo, cuando lo eliges',
    aparte: true,
    items: [
      /* Para ir a más: flexores profundos, cuádriceps y caderas. El puente con marcha pasa a Mueve (2A). */
      { id: 'move.couch.stretch', tag: 'HIP', code: 'Caderas', name: 'Estiramiento del sofá',
        desc: 'Flexores profundos contra la pared, rodilla al suelo. El estiramiento del sofá.', min: 6, access: 'premium',
        position: ['halfKneeling', 'floor'], equipment: ['wall', 'cushionOptional'], requiresFloor: true, intensity: 'strong', level: 'intermediate',
        steps: [
          { name: 'Flexor de cadera', mode: 'perSide', dur: 25, setup: { mode: 'ready', estimatedSeconds: 15 }, transition: { seconds: 10 },
            instruction: {
              setup: 'Una rodilla en el suelo, cojín si molesta. El otro pie delante, su rodilla sobre el tobillo.',
              action: 'Avanza la pelvis unos centímetros, sin arquear la cintura. Estirón suave en la ingle de atrás.',
              care: 'Tronco erguido. Si la rodilla molesta aun con el cojín, salta este paso.' } },
          { name: 'Cuádriceps en pared', mode: 'perSide', dur: 30, setup: { mode: 'ready', estimatedSeconds: 15 }, transition: { seconds: 10 },
            instruction: {
              setup: 'Rodilla de atrás en el suelo, pegada a la pared, y su empeine apoyado en ella. Cojín debajo.',
              action: 'Sube el tronco despacio. Aprieta el glúteo de atrás.',
              care: 'Aleja la rodilla de la pared para bajar la intensidad. Es un estiramiento fuerte.' } },
          { name: '90/90', mode: 'timed', dur: 60,
            instruction: {
              setup: 'En el suelo, una pierna delante y otra al lado, las dos dobladas, sin buscar el ángulo exacto.',
              action: 'Gira las rodillas de un lado al otro, despacio, sin obligarlas a tocar el suelo. Tronco alto.',
              care: 'Apóyate en las manos por detrás para ir más cómodo.' } },
          { name: 'Paloma', mode: 'perSide', dur: 30, transition: { seconds: 10 },
            instruction: {
              setup: 'Lleva una espinilla al frente, la otra pierna estirada atrás.',
              action: 'Camina el peso hacia delante. Baja el pecho poco a poco.',
              care: 'Un cojín bajo la cadera que queda en el aire, si lo necesitas. Si notas la rodilla, sal de la postura.' } },
        ]},
      /* Cada paso con su colocación y su cuidado. Levantarse del suelo, sin manos solo si
         se puede. «Rana» sigue sin dibujo: lo está haciendo Ez. */
      { id: 'move.hips.ground', tag: 'GRND', code: 'Suelo', name: 'Caderas · suelo',
        intensity: 'moderate', level: 'intermediate',
        position: ['floor'], equipment: [], requiresFloor: true,
        desc: 'Flujo de suelo: rana, 90/90, transiciones. Caderas libres.', min: 6, access: 'premium',
        steps: [
          /* Es un balanceo y no una postura quieta: va por veces, ocho, a 3 s la ida y 3 la vuelta. */
          { name: 'Rana', mode: 'reps', reps: 8, dur: 48, setup: { mode: 'ready', estimatedSeconds: 15 },
            tempo: { down: 3, hold: 0, up: 3 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'A cuatro patas, rodillas un poco abiertas, hasta donde vaya cómodo. Manos o antebrazos abajo.',
              action: 'Lleva la cadera atrás despacio y vuelve, como un balanceo suave. Unas 8 veces.',
              care: 'Cojín bajo las rodillas si molestan. Tensión en la ingle, nunca pinchazo.' } },
          { name: '90/90', mode: 'timed', dur: 70,
            instruction: {
              setup: 'En el suelo, una pierna delante y otra al lado, las dos dobladas, sin buscar el ángulo exacto.',
              action: 'Gira las rodillas de un lado al otro, despacio, sin obligarlas a tocar el suelo. Tronco alto.',
              care: 'Apóyate en las manos por detrás para ir más cómodo.' } },
          { name: 'Sentadilla lateral', mode: 'timed', dur: 60,
            instruction: {
              action: 'Pies muy anchos. Dobla una rodilla hacia donde apunta su pie, y luego la otra. Unas 5 por lado.',
              care: 'Talón apoyado. Baja solo hasta donde controles.' } },
          { name: 'Sentarse y levantarse del suelo', mode: 'timed', dur: 80,
            instruction: {
              action: 'Baja al suelo por una rodilla y siéntate de lado. Sube por el mismo camino. Repite despacio.',
              care: 'Usa las manos, y una silla al lado si la necesitas.' } },
          { name: 'Sentadilla profunda', mode: 'timed', dur: 70,
            instruction: {
              action: 'Baja en cuclillas hasta donde vaya cómodo, talones abajo, y mantén.',
              care: 'Mantén un apoyo cómodo y sal con control. Si los talones se levantan, baja menos.' } },
        ]},
    ]
  },
});

/* LAS QUE YA NO SALEN EN LA LISTA (Ez, 23 oct. 2026: 2A): ATG y Ancestral. No se borran: su id
   sigue en el historial, en los eventos, en los logros y en un Camino, así que `getExtraRoutine`
   las sigue encontrando aquí. Nada de lo que recorre `EXTRA_ROUTINES` (la biblioteca, «A tu
   ritmo», «Para ahora») las ve. */
window.EXTRA_ROUTINES_FUERA = [
      /* Lo que es de un lado va por lado, con su cambio, y la fuerza va por repeticiones.
         «Rodillas a prueba» sonaba a «a prueba de lesiones», que la base no deja decir
         (Ez, 16 oct. 2026). */
      { id: 'move.atg.knees', tag: 'ATG', code: 'Rodillas', name: 'ATG · Rodillas profundas',
        intensity: 'strong', level: 'advanced',
        position: ['standing', 'floor'], equipment: ['wall'], requiresFloor: true,
        desc: 'Rodillas sobre los dedos, en rangos profundos. Necesitas pared y suelo.', min: 4, access: 'premium',
        steps: [
          { name: 'Zancada profunda', mode: 'perSide', dur: 30, transition: { seconds: 10 },
            instruction: {
              setup: 'Un paso largo adelante, la rodilla de atrás cerca del suelo.',
              action: 'Lleva la rodilla de delante por encima de los dedos, despacio, y vuelve.',
              care: 'Talón de delante apoyado. Si la rodilla se queja, baja menos.' } },
          { name: 'Elevación de puntas', mode: 'reps', reps: 12, dur: 48,
            tempo: { down: 2, hold: 1, up: 1 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'De espaldas a la pared, talones a un palmo de ella.',
              action: 'Apoya la espalda y sube las puntas de los pies hacia las espinillas. Bájalas despacio.',
              care: 'Movimiento pequeño, sin balancearte hacia atrás. Notarás el trabajo delante de la espinilla.' } },
          { name: 'Puente a una pierna', mode: 'perSide', dur: 20, transition: { seconds: 10 }, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Túmbate boca arriba, un pie apoyado y la otra pierna arriba.',
              action: 'Sube y baja la cadera con control, empujando con el talón.',
              care: 'Si da un tirón detrás del muslo, apoya los dos pies.' } },
          { name: 'Sentadilla de cuádriceps', mode: 'reps', reps: 10, dur: 40,
            tempo: { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' },
            instruction: {
              setup: 'De pie, sujétate a la pared o a la mesa con las dos manos.',
              action: 'Lleva las rodillas adelante y sube los talones. Baja poco a poco y vuelve.',
              care: 'Apoyado en todo momento. Baja solo hasta donde las rodillas vayan cómodas.' } },
          { name: 'Marcha del elefante', mode: 'timed', dur: 45,
            instruction: {
              action: 'Camina con las manos por el suelo, piernas lo más estiradas posible.',
              care: 'Dobla algo las rodillas si los isquios tiran.' } },
        ]},
      { id: 'move.ancestral', tag: 'ANC', code: 'Ancestral', name: 'Ancestral',
        intensity: 'moderate', level: 'intermediate',
        position: ['floor', 'standing'], equipment: ['bar'], requiresFloor: true,
        desc: 'Gateo, suspensión y sentadilla profunda. Suelo y barra firme.', min: 5, access: 'premium',
        /* Cada paso con su colocación o su cuidado. «Apertura de costillas» decía «gato/
           vaca», que es otro ejercicio: su dibujo es a cuatro patas respirando hacia los
           lados de las costillas, y eso dice ahora. */
        steps: [
          { name: 'Sentadilla profunda sostenida', mode: 'timed', dur: 60,
            instruction: {
              action: 'Baja en cuclillas hasta donde vaya cómodo, talones abajo, y mantén.',
              care: 'Mantén un apoyo cómodo y sal con control. Si los talones se levantan, baja menos.' } },
          { name: 'Gateo', mode: 'timed', dur: 60, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'A cuatro patas, manos bajo los hombros y rodillas bajo las caderas.',
              action: 'Avanza mano y rodilla contrarias a la vez, despacio. Unos pasos y vuelve.',
              care: 'Espalda larga y rodillas en el suelo. Si las muñecas molestan, para.' } },
          { name: 'Suspensión pasiva', mode: 'timed', dur: 45, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Agárrate a una barra firme que soporte tu peso, con las manos al ancho de los hombros.',
              action: 'Cuelga relajado, con los brazos estirados. Suelta el peso.',
              care: 'Entra y sal apoyando los pies, sin saltar. Baja si notas molestia.' } },
          { name: 'Sentarse y levantarse del suelo', mode: 'timed', dur: 60,
            instruction: {
              action: 'Baja al suelo por una rodilla y siéntate de lado. Sube por el mismo camino. Repite despacio.',
              care: 'Usa las manos, y una silla al lado si la necesitas.' } },
          { name: 'Respirar a cuatro apoyos', mode: 'timed', dur: 45,
            instruction: {
              setup: 'A cuatro patas, espalda larga y cuello suelto.',
              action: 'Inhala llevando el aire a los lados de las costillas. Exhala despacio.',
              care: 'Sin forzar el aire. Deja que las costillas se ensanchen, sin bloquear la espalda.' } },
        ]},
];
