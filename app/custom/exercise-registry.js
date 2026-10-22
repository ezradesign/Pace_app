/* PACE · Registro interno de ejercicios (F7 · s93 · v0.38.0)
   Base de datos curada que alimenta el constructor de rutinas premium.
   NO es una biblioteca navegable: la unidad gateable sigue siendo la
   sesión (decisión s85). Unión deduplicada a mano de los steps de
   MOVE_ROUTINES + EXTRA_ROUTINES a fecha v0.37.0, con cue neutro (sin
   contexto de serie) y dur por defecto en segundos.

   `name` es el ES canónico e IDÉNTICO a la key de glifo
   (app/glyphs/exercise-glyphs.jsx); los ejercicios sin glifo aprobado
   renderizan DefaultGlyph (cola D-4, sin cambios). El EN vive en
   app/i18n/content/custom.js con keys `custom.ex.<name>.{name,cue}` y
   `custom.cat.<key>.label` para los grupos.

   Curación s93: 'Dead hang · opcional' (antes 'Dead hang (si puedes)', renombrado B1.2) queda fuera (duplica Hang
   pasivo). Al crecer los catálogos en F8+, añadir aquí a mano los
   pasos nuevos que merezcan entrar al constructor. */

const EXERCISE_REGISTRY = {
  empuje: {
    label: 'Empuje y tracción',
    items: [
      { name: 'Flexiones inclinadas', dur: 40, cue: 'Contra el escritorio, codos cerca del cuerpo.' },
      { name: 'Pica en escritorio', dur: 40, cue: 'Cadera arriba, cabeza entre los brazos.' },
      { name: 'Fondos en silla', dur: 40, cue: 'Baja con control, codos atrás.' },
      { name: 'Suspensión pasiva', dur: 30, cue: 'Cuelga relajado. Respira.' },
      { name: 'Suspensión activa', dur: 30, cue: 'Hombros abajo y atrás, codos rectos.' },
    ]
  },
  piernas: {
    label: 'Piernas',
    items: [
      { name: 'Sentadilla a silla', dur: 40, cue: 'Baja hasta rozar la silla, sube sin impulso.' },
      { name: 'Silla en la pared', dur: 45, cue: 'Espalda en pared, rodillas a 90°.' },
      { name: 'Sentadilla búlgara', dur: 45, cue: 'Empeine sobre la silla, baja vertical.' },
      { name: 'Zancada profunda', dur: 50, cue: 'Zancada profunda. Rodilla por delante del pie.' },
      { name: 'Sentadilla de cuádriceps', dur: 40, cue: 'Apoyado. Rodillas adelante, talones arriba.' },
      { name: 'Nordics', dur: 40, cue: 'Asistidos si hace falta. Bajada controlada.' },
      { name: 'Elevación de puntas', dur: 40, cue: 'Contra pared, levanta los pies.' },
      { name: 'Elevación de talones', dur: 30, cue: 'Sube y baja con control.' },
      { name: 'Puente con marcha', dur: 45, cue: 'Activación de glúteo profundo.' },
    ]
  },
  core: {
    label: 'Core y espalda',
    items: [
      { name: 'Plancha', dur: 40, cue: 'Antebrazos, cuerpo en línea. Aprieta glúteos.' },
      { name: 'Plancha lateral', dur: 40, cue: 'Cadera alta, cuerpo en línea.' },
      { name: 'Hueco abdominal', dur: 30, cue: 'Lumbar al suelo, piernas y hombros arriba.' },
      { name: 'Hueco en silla', dur: 30, cue: 'Eleva piernas, apoya la baja espalda.' },
      { name: 'Superman', dur: 40, cue: 'Boca abajo: eleva pecho y brazos, lento.' },
      { name: 'Juntar omóplatos', dur: 30, cue: 'Junta omóplatos, 2 segundos cada vez.' },
      { name: 'Apertura con banda', dur: 40, cue: 'Sin banda: brazos cruzados + abre con tensión.' },
      { name: 'Apretar glúteos', dur: 30, cue: 'Apretones firmes, 2 segundos cada uno.' },
    ]
  },
  cuello: {
    label: 'Cuello y hombros',
    items: [
      { name: 'Barbilla atrás', dur: 30, cue: 'Desliza la barbilla recta hacia atrás; la nuca se alarga.' },
      { name: 'Cuello y trapecios', dur: 40, cue: 'Oreja al hombro, suave.' },
      { name: 'Inclinación lateral', dur: 40, cue: 'Oreja al hombro, cada lado.' },
      { name: 'Rotación lenta', dur: 40, cue: 'Mira sobre el hombro, sin forzar.' },
      { name: 'Escalenos', dur: 40, cue: 'Mano bajo el glúteo, inclina la cabeza al lado opuesto.' },
      { name: 'Encogimiento de hombros', dur: 20, cue: 'Hombros arriba, luego relaja.' },
      { name: 'Círculos de hombro', dur: 45, cue: 'Círculos lentos y amplios, brazo estirado.' },
      { name: 'Deslizamientos en pared', dur: 45, cue: 'Espalda en pared, sube los brazos.' },
      { name: 'Rotación externa', dur: 40, cue: 'Codo a 90°, rota hacia fuera.' },
      { name: 'Apertura de pecho', dur: 40, cue: 'Manos tras la nuca, abre codos, mira al techo.' },
      { name: 'Apertura de pecho sentado', dur: 30, cue: 'Brazos atrás, expande el pecho.' },
    ]
  },
  columna: {
    label: 'Columna',
    items: [
      { name: 'Rotación torácica', dur: 40, cue: 'Sentado: manos cruzadas, rota el tronco despacio.' },
      { name: 'Extensión torácica', dur: 40, cue: 'Arquea sobre la silla.' },
      { name: 'Gato-camello', dur: 45, cue: 'A cuatro patas: arquea y redondea, vértebra a vértebra.' },
      { name: 'Onda espinal', dur: 45, cue: 'De pie: ola desde la pelvis hasta la cabeza, lenta.' },
      { name: 'Puente torácico', dur: 45, cue: 'Desde sentado, eleva cadera y abre el pecho al techo.' },
      { name: 'Rodar hacia abajo', dur: 45, cue: 'De pie, baja vértebra a vértebra hasta colgar.' },
      { name: 'Giro sentado', dur: 30, cue: 'Rota hacia el respaldo, suave.' },
      { name: 'Apertura de costillas + respiración', dur: 40, cue: 'Movimiento de gato/vaca con respiración.' },
    ]
  },
  caderas: {
    label: 'Caderas',
    items: [
      { name: 'Flexor de cadera', dur: 45, cue: 'Rodilla al suelo, empuja la pelvis adelante.' },
      { name: 'Cuádriceps en pared', dur: 60, cue: 'Empeine contra pared o silla, rodilla al fondo.' },
      { name: '90/90', dur: 60, cue: 'Rota entre lados despacio.' },
      { name: 'Paloma', dur: 50, cue: 'Tibia adelante, peso adelante.' },
      { name: 'Rana', dur: 60, cue: 'Rodillas anchas, empuja la cadera atrás. Mece suave.' },
      { name: 'Sentadilla lateral', dur: 50, cue: 'Peso a un lado, la otra pierna estirada.' },
      { name: 'Zancada con apertura', dur: 60, cue: 'Zancada + mano al suelo + rotación.' },
    ]
  },
  suelo: {
    label: 'Suelo y cadena posterior',
    items: [
      { name: 'Sentadilla profunda', dur: 50, cue: 'Talones abajo, codos dentro de las rodillas.' },
      { name: 'Sentadilla profunda sostenida', dur: 50, cue: 'Talones abajo, relaja al fondo.' },
      { name: 'Gateo', dur: 45, cue: 'Contralateral, lento.' },
      { name: 'Sentarse y levantarse del suelo', dur: 60, cue: 'Siéntate al suelo y levántate sin manos.' },
      { name: 'Marcha del elefante', dur: 50, cue: 'Camina tocando el suelo, piernas estiradas.' },
      { name: 'Pliegue adelante', dur: 50, cue: 'Pies juntos, cuelga el tronco. Rodillas suaves.' },
      { name: 'Isquio a una pierna', dur: 50, cue: 'Talón apoyado delante, cadera atrás.' },
    ]
  },
  manos: {
    label: 'Muñecas, tobillos y pausas',
    items: [
      { name: 'Círculos de muñeca', dur: 20, cue: 'Círculos en cada sentido, muñecas sueltas.' },
      { name: 'Estiramiento de muñeca', dur: 30, cue: 'Flexión y extensión, suave.' },
      { name: 'Palmas al suelo', dur: 40, cue: 'Palmas sobre la mesa, dedos hacia ti.' },
      { name: 'Rezo invertido', dur: 40, cue: 'Dorsos de las manos juntos frente al pecho.' },
      { name: 'Abrir y cerrar el puño', dur: 20, cue: 'Aprieta fuerte, suelta.' },
      { name: 'Extensión de dedos', dur: 20, cue: 'Abre los dedos, sin forzar.' },
      { name: 'Círculos de tobillo', dur: 20, cue: 'Bajo la mesa, cada sentido.' },
      { name: 'Respiraciones profundas', dur: 20, cue: '3 inhalaciones completas.' },
      { name: 'Reset respiración', dur: 30, cue: 'Inhalaciones profundas para cerrar.' },
      { name: 'Descanso', dur: 20, cue: 'Respira. Suelta.' },
    ]
  },
};

/* Lookup por nombre canónico ES (misma convención que las keys de glifo). */
function getExerciseDef(name) {
  for (const group of Object.values(EXERCISE_REGISTRY)) {
    const found = group.items.find(e => e.name === name);
    if (found) return found;
  }
  return null;
}

/* LO QUE PIDE CADA EJERCICIO, para que una rutina propia avise antes de empezar (auditoría del
   21 oct.: Fondos en silla y Superman decían «Nada. Solo tú y donde estás»). Las mismas claves
   que el catálogo (`equipment`, `position`, `requiresFloor`), sacadas de las rutinas donde
   sale cada ejercicio y de su colocación. `lados`: se hace por lados, y el runner los guía
   uno detrás de otro (como `perSide` en el catálogo, con el tiempo por lado).
   Al añadir un ejercicio al registro, va también aquí: sin su fila, «Antes de empezar» dice
   que de ese paso no se sabe qué pide, nunca que no pide nada. */
const EXERCISE_PIDE = {
  'Flexiones inclinadas':     { eq: ['stableDesk'], pos: ['standing'] },
  'Pica en escritorio':       { eq: ['stableDesk'], pos: ['standing'] },
  'Fondos en silla':          { eq: ['stableChair'], pos: ['seated'] },
  'Suspensión pasiva':        { eq: ['bar'], pos: ['standing'] },
  'Suspensión activa':        { eq: ['bar'], pos: ['standing'] },
  'Sentadilla a silla':       { eq: ['stableChair'], pos: ['standing'] },
  'Silla en la pared':        { eq: ['wall'], pos: ['standing'] },
  'Sentadilla búlgara':       { eq: ['stableChair'], pos: ['standing'], lados: true },
  'Zancada profunda':         { eq: ['deskOptional'], pos: ['standing'], lados: true },
  'Sentadilla de cuádriceps': { eq: ['deskOptional'], pos: ['standing'] },
  'Nordics':                  { eq: ['cushionOptional'], pos: ['floor'], suelo: true },
  'Elevación de puntas':      { eq: ['deskOptional'], pos: ['standing'] },
  'Elevación de talones':     { pos: ['seated', 'standing'] },
  'Puente con marcha':        { pos: ['supine'], suelo: true },
  'Plancha':                  { pos: ['floor'], suelo: true },
  'Plancha lateral':          { pos: ['floor'], suelo: true, lados: true },
  'Hueco abdominal':          { pos: ['supine'], suelo: true },
  'Hueco en silla':           { pos: ['seated'] },
  'Superman':                 { pos: ['floor'], suelo: true },
  'Juntar omóplatos':         { pos: ['seated', 'standing'] },
  'Apertura con banda':       { pos: ['standing'] },
  'Apretar glúteos':          { pos: ['seated'] },
  'Barbilla atrás':           { pos: ['seated'] },
  'Cuello y trapecios':       { pos: ['seated'], lados: true },
  'Inclinación lateral':      { pos: ['seated'], lados: true },
  'Rotación lenta':           { pos: ['seated'], lados: true },
  'Escalenos':                { pos: ['seated'], lados: true },
  'Encogimiento de hombros':  { pos: ['seated'] },
  'Círculos de hombro':       { pos: ['seated', 'standing'] },
  'Deslizamientos en pared':  { eq: ['wall'], pos: ['standing'] },
  'Rotación externa':         { pos: ['seated', 'standing'] },
  'Apertura de pecho':        { pos: ['seated', 'standing'] },
  'Apertura de pecho sentado': { pos: ['seated'] },
  'Rotación torácica':        { pos: ['seated'], lados: true },
  'Extensión torácica':       { pos: ['seated'] },
  'Gato-camello':             { pos: ['floor'], suelo: true },
  'Onda espinal':             { pos: ['standing'] },
  'Puente torácico':          { pos: ['floor'], suelo: true },
  'Rodar hacia abajo':        { pos: ['standing'] },
  'Giro sentado':             { pos: ['seated'] },
  'Apertura de costillas + respiración': { pos: ['floor'], suelo: true },
  'Flexor de cadera':         { eq: ['cushionOptional'], pos: ['halfKneeling'], suelo: true, lados: true },
  'Cuádriceps en pared':      { eq: ['wall', 'cushionOptional'], pos: ['halfKneeling'], suelo: true, lados: true },
  '90/90':                    { pos: ['floor'], suelo: true },
  'Paloma':                   { pos: ['floor'], suelo: true, lados: true },
  'Rana':                     { pos: ['floor'], suelo: true },
  'Sentadilla lateral':       { pos: ['standing'], lados: true },
  'Zancada con apertura':     { pos: ['standing'], lados: true },
  'Sentadilla profunda':      { pos: ['standing'] },
  'Sentadilla profunda sostenida': { pos: ['standing'] },
  'Gateo':                    { pos: ['floor'], suelo: true },
  'Sentarse y levantarse del suelo': { pos: ['floor', 'standing'], suelo: true },
  'Marcha del elefante':      { pos: ['standing'] },
  'Pliegue adelante':         { pos: ['standing'] },
  'Isquio a una pierna':      { pos: ['standing'], lados: true },
  'Círculos de muñeca':       { pos: ['seated'] },
  'Estiramiento de muñeca':   { pos: ['seated'], lados: true },
  'Palmas al suelo':          { eq: ['deskOptional'], pos: ['seated', 'standing'] },
  'Rezo invertido':           { pos: ['seated', 'standing'] },
  'Abrir y cerrar el puño':   { pos: ['seated'] },
  'Extensión de dedos':       { pos: ['seated'] },
  'Círculos de tobillo':      { pos: ['seated'] },
  'Respiraciones profundas':  { pos: ['seated'] },
  'Reset respiración':        { pos: ['seated'] },
  'Descanso':                 {},
};

/* La fila de un ejercicio, también con un nombre de antes (una rutina guardada antes de un
   renombrado lo conserva: `VISUAL_ALIAS`). null si no se sabe. */
function ejercicioPide(name) {
  if (Object.prototype.hasOwnProperty.call(EXERCISE_PIDE, name)) return EXERCISE_PIDE[name];
  const alias = window.VISUAL_ALIAS && window.VISUAL_ALIAS[name];
  return alias && EXERCISE_PIDE[alias] ? EXERCISE_PIDE[alias] : null;
}
function ejercicioPorLados(name) {
  const p = ejercicioPide(name);
  return !!(p && p.lados);
}

/* Lo que pide una rutina propia: la unión de sus pasos, en su orden, con las claves del
   catálogo. `pideIncompleto` si algún paso no tiene fila. */
function rutinaPropiaPide(steps) {
  const equipment = [], position = [];
  let requiresFloor = false, pideIncompleto = false;
  (Array.isArray(steps) ? steps : []).forEach(s => {
    const p = s && ejercicioPide(s.name);
    if (!p) { pideIncompleto = true; return; }
    (p.eq || []).forEach(e => { if (equipment.indexOf(e) < 0) equipment.push(e); });
    (p.pos || []).forEach(e => { if (position.indexOf(e) < 0) position.push(e); });
    if (p.suelo) requiresFloor = true;
  });
  /* «Una mesa, si la necesitas» sobra si otro paso ya pide la mesa. */
  const entero = { deskOptional: 'stableDesk', barOptional: 'bar', wallOptional: 'wall' };
  return { equipment: equipment.filter(e => !entero[e] || equipment.indexOf(entero[e]) < 0),
    position, requiresFloor, pideIncompleto };
}

Object.assign(window, { EXERCISE_REGISTRY, getExerciseDef, EXERCISE_PIDE, ejercicioPide, ejercicioPorLados, rutinaPropiaPide });
