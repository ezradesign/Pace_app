/* PACE · app/extra/extra.data.piernas.js (s178) — LAS RUTINAS DE **ESTIRA**, 2ª mitad.
   ====================================================================================
   Los grupos `caderas` y `flujos`. Se separó de `extra.data.js` por la regla §1 (ver
   la cabecera de aquel para el porqué del corte y para el aviso de los ids cruzados).

   GUARD DE ORDEN: si este archivo se evalúa antes que `extra.data.js`, no hay objeto
   al que añadir nada y la biblioteca se quedaría con media lista SIN QUE NADIE SE
   ENTERE — el fallo por omisión que s169 dejó por escrito. Se aborta ruidosamente.
   Es la regla de s148: si un archivo llama a algo al evaluarse, o quien se lo da carga
   antes, o hay guard que aborte. */
if (!window.EXTRA_ROUTINES) {
  throw new Error('extra.data.piernas.js se ha evaluado ANTES que extra.data.js: revisa el orden en PACE.html');
}

Object.assign(window.EXTRA_ROUTINES, {
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
      { id: 'move.hips.5', tag: 'HIP', code: 'Caderas', name: 'Caderas',
        desc: '5 pasos para desbloquear caderas profundas. Casi todo en el suelo.', min: 6,
        position: ['floor', 'standing'], equipment: ['cushionOptional'], requiresFloor: true, intensity: 'moderate', level: 'intermediate',
        /* De pie primero y luego el suelo: antes se bajaba al suelo, se subía a la
           sentadilla y se volvía a bajar. */
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
          { name: 'Puente con marcha', mode: 'timed', dur: 60,
            instruction: {
              setup: 'Túmbate boca arriba, pies apoyados cerca del glúteo.',
              action: 'Sube la cadera y aguanta. Levanta una rodilla, luego la otra.',
              care: 'Si la pelvis se cae o la lumbar molesta, apoya los dos pies o termina.' } },
        ]},
      { id: 'move.couch.stretch', tag: 'HIP', code: 'Caderas', name: 'Estiramiento del sofá',
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
              setup: 'Una rodilla en el suelo, la otra pierna delante en ángulo. Cojín bajo la rodilla si molesta.',
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
          { name: 'Puente con marcha', mode: 'timed', dur: 60,
            instruction: {
              setup: 'Túmbate boca arriba, pies apoyados cerca del glúteo.',
              action: 'Sube la cadera y aguanta. Levanta una rodilla, luego la otra.',
              care: 'Si la pelvis se cae o la lumbar molesta, apoya los dos pies o termina.' } },
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
      /* s120 (B2.3 OLA 3): migración mecánica al contrato v1. Elephant walk y
         Pliegue adelante → `timed`; Isquio a una pierna → `perSide` (fix del «40s
         por lado» en dur:80 → dur POR LADO + transición, §3-C/§6); Puente con
         marcha → `timed` sobre SUELO (reutiliza el copy de hips.5/couch) con gate
         `ready` (entrada al suelo). `name` intactos → glifos sin tocar. `min` 5
         dentro de rango. Acceso premium SIN cambios. */
      /* s178 · LA HERMANA DE PIE DE `move.hamstrings`, por el mismo censo. Los tres
         ejercicios ya tienen arte y su propio `setup` los declara de pie: `Rodar hacia
         abajo` («ponte de pie»), `Isquio a una pierna` («apoya un talon adelante») y
         `Pliegue adelante` («manos en las rodillas si lo necesitas»).
         `Marcha del elefante` NO entra aunque tenga arte: «camina con las manos por el
         suelo» no pide tumbarse, pero en una oficina no es discreto — y la discrecion es
         el eje de esta biblioteca. Unidades por BASE §3-C y §6. */
      { id: 'move.hamstrings.standing', tag: 'LEG', code: 'Isquios', name: 'Cadena posterior de pie',
        desc: 'Isquios y espalda baja sin tumbarse. Cuatro posiciones junto a la mesa.', min: 4,
        position: ['standing'], equipment: ['deskOptional'], requiresFloor: false, intensity: 'gentle', level: 'accessible',
        steps: [
          { name: 'Rodar hacia abajo', mode: 'timed', dur: 50,
            instruction: {
              setup: 'Ponte de pie, pies al ancho de las caderas.',
              action: 'Redondea la espalda poco a poco hacia abajo, hasta donde vaya cómodo. Sube igual, despacio.',
              care: 'Rodillas suaves; puedes parar a medio camino. Sube despacio para no marearte.' } },
          { name: 'Isquio a una pierna', mode: 'perSide', dur: 35, transition: { seconds: 8 },
            instruction: {
              setup: 'Apoya un talón delante, en el suelo, con esa rodilla estirada o un poco doblada.',
              action: 'Lleva la cadera atrás, tronco largo. Nota el estirón detrás del muslo.',
              care: 'La rodilla de apoyo algo flexionada. Sin rebotes.' } },
          { name: 'Sentadilla de cuádriceps', mode: 'timed', dur: 30,
            instruction: {
              setup: 'Sujétate a la mesa con las dos manos.',
              action: 'Lleva las rodillas adelante y sube los talones. Baja poco a poco.',
              care: 'Apoyado en todo momento. Baja solo hasta donde controles.' } },
          { name: 'Pliegue adelante', mode: 'timed', dur: 45,
            instruction: {
              action: 'Pies al ancho de las caderas, deja caer el tronco hacia abajo. Rodillas suaves.',
              care: 'Manos en los muslos o en la mesa si lo necesitas: no hace falta tocar el suelo. Sal despacio.' } },
          { name: 'Respiraciones profundas', mode: 'rest', dur: 20,
            instruction: { action: '3 inhalaciones completas para cerrar.' } },
        ]},
      { id: 'move.hamstrings', tag: 'LEG', code: 'Isquios', name: 'Cadena posterior',
        desc: 'Isquios y cadena posterior. Piernas largas otra vez.', min: 5, access: 'premium',
        position: ['standing', 'floor'], equipment: [], requiresFloor: true, intensity: 'moderate', level: 'intermediate',
        steps: [
          { name: 'Marcha del elefante', mode: 'timed', dur: 70,
            instruction: {
              action: 'Camina con las manos por el suelo, piernas lo más estiradas posible.',
              care: 'Dobla algo las rodillas si los isquios tiran.' } },
          { name: 'Pliegue adelante', mode: 'timed', dur: 70,
            instruction: {
              action: 'Pies al ancho de las caderas, deja caer el tronco hacia abajo. Rodillas suaves.',
              care: 'Manos en los muslos si lo necesitas: no hace falta tocar el suelo.' } },
          { name: 'Isquio a una pierna', mode: 'perSide', dur: 40, transition: { seconds: 10 },
            instruction: {
              setup: 'Apoya un talón delante, en el suelo, con esa rodilla estirada o un poco doblada.',
              action: 'Lleva la cadera atrás, tronco largo. Nota el estirón detrás del muslo.',
              care: 'La rodilla de apoyo algo flexionada. Sin rebotes.' } },
          { name: 'Puente con marcha', mode: 'timed', dur: 70, setup: { mode: 'ready', estimatedSeconds: 15 },
            instruction: {
              setup: 'Túmbate boca arriba, pies apoyados cerca del glúteo.',
              action: 'Sube la cadera y aguanta. Levanta una rodilla, luego la otra.',
              care: 'Si la pelvis se cae o la lumbar molesta, apoya los dos pies o termina.' } },
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
              action: 'Redondea y extiende la espalda despacio, sin buscar los extremos.',
              care: 'Movimiento lento, siguiendo la respiración.' } },
          { name: 'Rotación torácica', mode: 'timed', dur: 45,
            instruction: {
              setup: 'Siéntate erguido, manos cruzadas sobre el pecho.',
              action: 'Gira el tronco despacio a un lado y al otro.',
              care: 'El giro nace del tronco, no del cuello.' } },
          { name: 'Sentadilla profunda', mode: 'timed', dur: 60,
            instruction: {
              action: 'Baja en cuclillas hasta donde vaya cómodo, talones abajo. Los codos, dentro, sin empujar.',
              care: 'Apóyate en algo si pierdes el equilibrio.' } },
          { name: 'Apertura de pecho', mode: 'timed', dur: 45,
            instruction: {
              action: 'Manos tras la nuca, sin tirar de la cabeza. Abre los codos y respira ancho.',
              care: 'Cuello cómodo, mirada al frente. Abre solo hasta donde no moleste.' } },
          { name: 'Cuello y trapecios', mode: 'perSide', dur: 20, transition: { seconds: 10 },
            instruction: {
              setup: 'Siéntate erguido, hombros abajo.',
              action: 'Inclina la cabeza con control, la oreja hacia el hombro.',
              care: 'Sin tirar con la mano ni subir el hombro.' } },
          { name: 'Reset respiración', mode: 'rest', dur: 30,
            instruction: { action: '3 inhalaciones profundas para cerrar.' } },
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
    ]
  },
});
