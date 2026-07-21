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
      { id: 'move.wrists', tag: 'WRST', code: 'Muñecas', name: 'Muñecas y manos',
        desc: 'El antídoto al teclado. Muñecas sueltas en 3 minutos.', min: 3,
        steps: [
          { name: 'Wrist circles', dur: 30, cue: '10 en cada sentido, muñecas sueltas.' },
          { name: 'Wrist stretch', dur: 40, cue: 'Flexión y extensión, 20s por lado.' },
          { name: 'Palmas al suelo', dur: 40, cue: 'Palmas sobre la mesa, dedos hacia ti. Suave.' },
          { name: 'Rezo invertido', dur: 40, cue: 'Dorsos de las manos juntos frente al pecho.' },
          { name: 'Finger extension', dur: 30, cue: 'Abre bien los dedos, 10 veces.' },
        ]},
    ]
  },
  hombros: {
    label: 'Hombros y columna',
    aside: 'Antídoto al teclado',
    items: [
      { id: 'move.shoulders.5', tag: 'SHLD', code: 'Hombros', name: 'Hombros · 5 pasos',
        desc: 'Reset de hombros: rotadores, pecho, trapecios. Necesitas pared; barra opcional.', min: 4,
        steps: [
          { name: 'Scapular wall slides', dur: 50, cue: 'Espalda en pared, sube brazos.' },
          { name: 'Band pull-apart', dur: 50, cue: 'Si no tienes banda, brazos cruzados + abre.' },
          { name: 'External rotation', dur: 50, cue: 'Codo a 90°, rota hacia fuera.' },
          { name: 'Dead hang · opcional', dur: 45, cue: 'Solo con barra firme que soporte tu peso. Sin barra: repite las wall slides.' },
          { name: 'Thoracic extension', dur: 40, cue: 'Sobre foam roller o toalla enrollada.' },
        ]},
      { id: 'move.shoulder.circles', tag: 'SHLD', code: 'Hombros', name: 'Hombros · círculos',
        desc: 'Círculos amplios y controlados. Libera hombros de escritorio.', min: 4,
        steps: [
          { name: 'Círculos de hombro', dur: 60, cue: 'Círculos lentos y amplios, brazo estirado. 5 por sentido y lado.' },
          { name: 'Shrug + round', dur: 40, cue: 'Hombros arriba, atrás y abajo. Redondea el círculo.' },
          { name: 'External rotation', dur: 45, cue: 'Codo a 90°, rota hacia fuera.' },
          { name: 'Band pull-apart', dur: 45, cue: 'Sin banda: brazos cruzados + abre.' },
          { name: 'Apertura de pecho', dur: 50, cue: 'Manos tras la nuca, abre codos, mira al techo.' },
        ]},
      { id: 'move.spine.waves', tag: 'SPN', code: 'Columna', name: 'Columna · ondas',
        desc: 'Ondas y puentes, con paso por el suelo. La columna, vértebra a vértebra.', min: 5, access: 'premium',
        steps: [
          { name: 'Gato-camello', dur: 60, cue: 'A cuatro patas: arquea y redondea, vértebra a vértebra.' },
          { name: 'Onda espinal', dur: 60, cue: 'De pie: ola desde la pelvis hasta la cabeza, lenta.' },
          { name: 'Rotación torácica', dur: 45, cue: 'Sentado: manos cruzadas, rota tronco despacio.' },
          { name: 'Puente torácico', dur: 60, cue: 'Desde sentado, eleva cadera y abre el pecho al techo.' },
          { name: 'Rodar hacia abajo', dur: 60, cue: 'De pie, baja vértebra a vértebra hasta colgar. Sube igual.' },
        ]},
    ]
  },
  caderas: {
    label: 'Caderas y piernas',
    aside: 'Desbloquea la mitad inferior',
    items: [
      { id: 'move.hips.5', tag: 'HIP', code: 'Caderas', name: 'Caderas · 5 pasos',
        desc: '5 pasos para desbloquear caderas profundas. Casi todo en el suelo.', min: 6,
        steps: [
          { name: 'Cossack squat', dur: 60, cue: 'Peso a un lado, otra pierna estirada. 5 por lado.' },
          { name: '90/90', dur: 60, cue: 'Rota entre lados despacio.' },
          { name: 'Pigeon', dur: 60, cue: 'Tibia adelante, peso adelante. 40s por lado.' },
          { name: 'Squat profundo', dur: 60, cue: 'Talones abajo, codos dentro de rodillas.' },
          { name: 'Puente con marcha', dur: 60, cue: 'Activación de glúteo profundo.' },
        ]},
      { id: 'move.couch.stretch', tag: 'HIP', code: 'Caderas', name: 'Couch stretch',
        desc: 'Flexores profundos contra pared o silla, rodilla al suelo. El estiramiento del sofá.', min: 5, access: 'premium',
        position: ['halfKneeling', 'floor', 'supine'], equipment: ['wall', 'cushionOptional'], requiresFloor: true, intensity: 'strong', level: 'intermediate',
        /* 5º piloto del contrato v1 (s112, B2.2a.5): estiramiento estático de
           pared/suelo. s115 (B2.2b-1): contrato formal — `instruction`
           {setup,action,care}, `setup:{mode:'ready',estimatedSeconds}` (los dos
           «setup» distintos: comportamiento vs copy), `transition.seconds` en
           los perSide. dur en perSide = segundos POR LADO (activo = dur×2 + 1
           transición). */
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
      { id: 'move.hamstrings', tag: 'LEG', code: 'Isquios', name: 'Cadena posterior',
        desc: 'Isquios y cadena posterior. Piernas largas otra vez.', min: 5, access: 'premium',
        steps: [
          { name: 'Elephant walk', dur: 70, cue: 'Camina tocando suelo, piernas estiradas.' },
          { name: 'Pliegue adelante', dur: 70, cue: 'Pies juntos, cuelga el tronco. Rodillas suaves.' },
          { name: 'Isquio a una pierna', dur: 80, cue: 'Talón apoyado delante, cadera atrás. 40s por lado.' },
          { name: 'Puente con marcha', dur: 70, cue: 'Activación de glúteo profundo.' },
        ]},
    ]
  },
  flujos: {
    label: 'Flujos',
    aside: 'De pies a cabeza',
    items: [
      { id: 'move.morning.flow', tag: 'FLOW', code: 'Mañana', name: 'Despertar matinal',
        desc: 'Flujo suave de cuerpo entero para empezar el día. Empieza en el suelo.', min: 5,
        steps: [
          { name: 'Gato-camello', dur: 60, cue: 'A cuatro patas: arquea y redondea, vértebra a vértebra.' },
          { name: 'Rotación torácica', dur: 45, cue: 'Sentado: manos cruzadas, rota tronco despacio.' },
          { name: 'Squat profundo', dur: 60, cue: 'Talones abajo, codos dentro de rodillas.' },
          { name: 'Apertura de pecho', dur: 45, cue: 'Manos tras la nuca, abre codos, mira al techo.' },
          { name: 'Cuello y trapecios', dur: 45, cue: 'Oreja al hombro, suave.' },
          { name: 'Reset respiración', dur: 30, cue: '3 inhalaciones profundas para cerrar.' },
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
