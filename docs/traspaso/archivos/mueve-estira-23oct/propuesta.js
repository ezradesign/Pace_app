// La propuesta de Mueve y Estira, metida en la app real antes de abrir nada.
// Se evalúa DENTRO de la página: `aplicar(nivel)` con 'textos' (decisión 1) o 'capas' (1 + 2 + 3).
'use strict';
module.exports = function aplicar(nivel) {
  const M = window.MOVE_ROUTINES;
  const E = window.EXTRA_ROUTINES;
  const copia = (o) => JSON.parse(JSON.stringify(o));
  const todas = {};
  for (const cat of [M, E]) for (const g of Object.values(cat)) for (const r of g.items) todas[r.id] = r;
  const buscar = (nombre) => {
    for (const r of Object.values(todas)) for (const s of r.steps) if (s.name === nombre) return s;
    return null;
  };

  /* Decisión 1: nombres que no dicen el movimiento, modo y dosis, y la letra que corrige ChatGPT.
     El dibujo de siempre sigue saliendo: el nombre nuevo apunta al viejo. */
  const RENOMBRA = {
    'Círculos de hombro': 'Círculos de brazos',
    'Inclinación lateral': 'Inclinación de cuello',
    'Hueco en silla': 'Piernas elevadas sentado',
    'Puente isquio a una pierna': 'Puente a una pierna',
    'Palmas al suelo': 'Palmas en la mesa',
    'Apertura de costillas + respiración': 'Respirar a cuatro apoyos',
  };
  for (const [viejo, nuevo] of Object.entries(RENOMBRA)) window.VISUAL_ALIAS[nuevo] = window.VISUAL_ALIAS[viejo] || viejo;
  window.VISUAL_ALIAS['Puente con los dos pies'] = 'Puente con marcha';
  window.VISUAL_ALIAS['Gateo con rodillas'] = 'Gateo';
  const reps = (n, tempo) => ({ mode: 'reps', reps: n, tempo: tempo || { down: 2, hold: 0, up: 2 }, completion: { mode: 'guided' } });
  const TEXTOS = {
    'Círculos de hombro': Object.assign(reps(8, { down: 2, hold: 0, up: 2 }), { instruction: {
      setup: 'De pie, brazos sueltos a los lados.',
      action: 'Dibuja círculos lentos con el brazo estirado: cuatro hacia delante y cuatro hacia atrás.',
      care: 'Empieza pequeño. Crece solo si el tronco sigue quieto.' } }),
    'Rotación lenta': Object.assign(reps(6, { down: 2, hold: 2, up: 2 }), { instruction: {
      setup: 'Erguido, barbilla paralela al suelo.',
      action: 'Gira despacio a mirar sobre un hombro, espera dos segundos y vuelve al centro. Tres a cada lado.',
      care: 'Gira solo hasta donde el cuello vaya suelto.' } }),
    'Círculos de muñeca': Object.assign(reps(8, { down: 1, hold: 0, up: 1 }), { instruction: {
      setup: 'Sentado, antebrazos cómodos.',
      action: 'Círculos pequeños con las manos, despacio: cuatro en cada sentido.',
      care: 'Sin apretar los puños ni buscar el máximo.' } }),
    'Inclinación lateral': { instruction: { care: 'Inclina con control, sin tirar ni subir el hombro.' } },
  };
  const retoca = (s) => {
    const t = TEXTOS[s.name];
    if (t) {
      const ins = Object.assign({}, s.instruction || {}, t.instruction || {});
      Object.assign(s, copia(t));
      s.instruction = ins;
    }
    if (RENOMBRA[s.name]) s.name = RENOMBRA[s.name];
  };
  for (const r of Object.values(todas)) r.steps.forEach(retoca);
  if (nivel === 'textos') return 'textos';

  /* Decisión 2: tres capas. Las diez pausas de entrada rehacen las rutinas de hoy que se parecen
     (mismo id por dentro: nadie pierde su historial); lo exigente baja a «Para ir a más». */
  Object.assign(window.PACE_STRINGS.es, { 'preview.eq.band': 'Una banda elástica, si la tienes', 'lib.gear.band': 'con banda' });
  const DESCANSO = () => ({ name: 'Descanso', mode: 'rest', restKind: 'betweenSets', dur: 25, instruction: { action: 'Respira.' } });
  const paso = (nombre, sobre) => {
    const base = copia(buscar(nombre) || { name: nombre });
    const ins = Object.assign({}, base.instruction || {}, (sobre && sobre.instruction) || {});
    const s = Object.assign(base, sobre || {});
    s.instruction = ins;
    if (s.mode !== 'reps') { delete s.reps; delete s.tempo; delete s.completion; }
    return s;
  };
  const series = (n, s) => { const out = []; for (let i = 0; i < n; i++) { if (i) out.push(DESCANSO()); out.push(copia(s)); } return out; };
  const entrada = { intensity: 'gentle', level: 'accessible', access: 'free' };
  /* Con 'solo' (opción B) las diez son rutinas NUEVAS encima y lo de hoy no se toca. */
  const rehaz = (id, datos) => Object.assign(nivel === 'solo' ? { id: id + '.entrada' } : (todas[id] || { id }), entrada, datos);

  const levantate = rehaz('extra.chair.squats', { name: 'Levántate y sube', desc: 'Sentarte y levantarte, y subir talones.', min: 3,
    position: ['standing'], equipment: ['stableChair'], requiresFloor: false, steps: [
      ...series(2, paso('Sentadilla a silla', Object.assign(reps(5), { instruction: {
        setup: 'De pie delante de la silla, pies al ancho de las caderas. Silla estable y sin ruedas.',
        action: 'Siéntate del todo, con control, y levántate empujando el suelo.',
        care: 'Ayúdate con las manos si lo necesitas. La primera vez, una serie basta.' } }))),
      DESCANSO(),
      ...series(2, paso('Elevación de talones', Object.assign(reps(6), { instruction: {
        setup: 'De pie, con una mano en la silla o en la mesa.',
        action: 'Sube los talones hasta donde controles. Baja despacio.',
        care: 'Sin rebotes. Si te balanceas, apóyate más.' } }))),
    ] });
  const empuje = rehaz('extra.desk.pushups', { name: 'Empuje sencillo', desc: 'Flexiones contra la mesa o la pared.', min: 2,
    steps: series(2, paso('Flexiones inclinadas', Object.assign(reps(5), { instruction: {
      care: 'Si cuesta, en la pared. Mesa que no se mueva: ni con ruedas ni plegable.' } }))) });
  const piernas = rehaz('extra.legs.standing', { name: 'Piernas sin pasos', desc: 'Puntas arriba y sentarte en el aire contra la pared.', min: 3,
    position: ['standing'], equipment: ['wall'], requiresFloor: false, steps: [
      ...series(2, paso('Elevación de puntas', Object.assign(reps(8), { instruction: { care: 'Movimiento pequeño. No te balancees hacia atrás.' } }))),
      DESCANSO(),
      ...series(2, paso('Silla en la pared', { mode: 'timed', dur: 15, instruction: {
        setup: 'Espalda en la pared, pies un paso por delante.',
        action: 'Desliza un poco hacia abajo y quédate. Respira normal.',
        care: 'Empieza alto: no hace falta llegar a 90°. Para salir, empuja con los pies y sube.' } })),
    ] });
  const suelo = rehaz('extra.pausa.suelo', { name: 'Fuerza en suelo', desc: 'Puente con los dos pies y gateo corto.', min: 3, tag: 'FLOOR', code: 'Fuerza',
    position: ['floor'], equipment: [], requiresFloor: true, steps: [
      ...series(2, paso('Puente con marcha', Object.assign(reps(6), { name: 'Puente con los dos pies', instruction: {
        setup: 'Boca arriba, rodillas dobladas y los dos pies apoyados.',
        action: 'Empuja con los pies, sube la pelvis y baja despacio.',
        care: 'Sube solo hasta donde no se arquee la cintura.' } }))),
      DESCANSO(),
      paso('Gateo', Object.assign(reps(4), { name: 'Gateo con rodillas', instruction: {
        setup: 'A cuatro apoyos: manos bajo los hombros, rodillas bajo las caderas.',
        action: 'Cuatro pasos cortos hacia delante, mano y rodilla contrarias, y vuelve.',
        care: 'Las rodillas siguen en el suelo. Si las muñecas molestan, para.' } })),
    ] });
  const banda = rehaz('extra.banda.espalda', { name: 'Espalda con banda', desc: 'Abrir y tirar contra la banda. Sin banda, con tu mano.', min: 4,
    tag: 'BAND', code: 'Fuerza', intensity: 'moderate', level: 'accessible', access: 'premium',
    position: ['standing'], equipment: ['band'], requiresFloor: false, steps: [
      ...series(2, paso('Apertura con banda', Object.assign(reps(8), { instruction: {
        setup: 'De pie, banda delante del pecho y brazos casi estirados.',
        action: 'Separa las manos sin llevar la banda hacia la cara. Vuelve sin soltar de golpe.',
        care: 'Sin banda, salta este paso: la rutina sigue contando.' } }))),
      DESCANSO(),
      ...series(2, paso('Remo con banda', Object.assign(reps(8), { instruction: {
        setup: 'Pisa el centro de la banda con los dos pies. Cadera atrás, espalda larga.',
        action: 'Tira de los extremos llevando los codos hacia las costillas. Vuelve despacio.',
        care: 'Sin banda: remo con tu mano, cinco por lado.' } }))),
    ] });

  const cuello = rehaz('move.neck.3', { name: 'Cuello suave', desc: 'Atrás, giro y a los lados, sin tirar de la cabeza.', min: 2,
    position: ['seated'], equipment: [], requiresFloor: false, steps: [
    paso('Barbilla atrás', Object.assign(reps(5, { down: 1, hold: 1, up: 1 }), { instruction: { care: 'Mantén un segundo y vuelve. Recorrido pequeño.' } })),
    paso('Rotación lenta'), paso('Inclinación de cuello', { dur: 12 }),
  ] });
  const brazos = rehaz('move.shoulder.circles', { name: 'Brazos libres', desc: 'Círculos, la pared y el giro del hombro.', min: 3,
    position: ['standing'], equipment: ['wall'], steps: [
      paso('Círculos de brazos'),
      paso('Deslizamientos en pared', Object.assign(reps(6), { instruction: { care: 'Si mantener el contacto fuerza la postura, sepáralos un poco.' } })),
      paso('Rotación externa', Object.assign(reps(6), { instruction: { care: 'Sin resistencia: es movilidad, no fuerza.' } })),
    ] });
  const manos = rehaz('move.wrists', { name: 'Manos y muñecas', desc: 'Puño, círculos y un estiramiento suave.', min: 2,
    position: ['seated'], equipment: [], requiresFloor: false, steps: [
    paso('Abrir y cerrar el puño', Object.assign(reps(6), { instruction: { action: 'Cierra sin apretar al máximo y abre despacio.', care: 'Suave: no es fuerza.' } })),
    paso('Círculos de muñeca'),
    paso('Estiramiento de muñeca', { dur: 20 }),
  ] });
  const tronco = rehaz('move.spine.chair', { name: 'Tronco sentado', desc: 'Pecho arriba, giro y apertura, sin levantarte.', min: 3,
    position: ['seated'], equipment: ['stableChair'], requiresFloor: false, steps: [
    paso('Extensión torácica', Object.assign(reps(5), { instruction: { action: 'Eleva un poco el pecho y vuelve.', care: 'Sin colgarte del respaldo ni echar la cabeza atrás.' } })),
    paso('Rotación torácica', Object.assign(reps(8), { instruction: { action: 'Gira el tronco despacio hacia un lado y vuelve. Cuatro a cada lado.' } })),
    ...series(2, paso('Apertura de pecho sentado', { dur: 15 })),
  ] });
  const pausaPiernas = rehaz('move.hamstrings.standing', { name: 'Piernas en pausa', desc: 'Detrás del muslo y los tobillos.', min: 3,
    position: ['standing'], equipment: ['stableChair'], steps: [
      ...series(2, paso('Isquio a una pierna', { dur: 15, instruction: { setup: 'De pie, una mano en la silla. Talón delante, en el suelo.' } })),
      paso('Círculos de tobillo', Object.assign(reps(8), { instruction: { action: 'Sentado, círculos pequeños con un pie: cuatro en cada sentido. Cambia.' } })),
    ] });
  const sueloE = rehaz('move.morning.flow', { name: 'Movilidad en suelo', desc: 'Gato-camello, la cadera y respirar.', min: 3,
    position: ['floor'], equipment: [], requiresFloor: true, steps: [
      paso('Gato-camello', Object.assign(reps(6, { down: 3, hold: 0, up: 3 }), { instruction: { action: 'Redondea y extiende la espalda suavemente.' } })),
      paso('Flexor de cadera', { dur: 15, instruction: { action: 'Avanza la pelvis unos centímetros sin arquear la cintura.' } }),
      paso('Respirar a cuatro apoyos', { dur: 25 }),
    ] });

  if (nivel === 'solo') {
    const delante = (cat, items) => { const antes = Object.assign({}, cat); for (const k of Object.keys(cat)) delete cat[k]; Object.assign(cat, { empezar: { label: 'Para empezar', items } }, antes); };
    delante(M, [levantate, empuje, piernas, suelo]);
    delante(E, [cuello, brazos, manos, tronco, pausaPiernas, sueloE]);
    return 'solo';
  }
  const sin = (id, nombres) => { const r = todas[id]; r.steps = r.steps.filter((s) => nombres.indexOf(s.name) === -1);
    r.steps = r.steps.filter((s, i, a) => !(s.mode === 'rest' && (i === 0 || i === a.length - 1 || a[i - 1].mode === 'rest'))); return r; };
  sin('move.shoulders.5', ['Apertura con banda', 'Suspensión pasiva · opcional']);
  sin('extra.back.desk', ['Apertura con banda']);
  for (const id of ['move.hips.5', 'move.couch.stretch', 'move.hamstrings']) sin(id, ['Puente con marcha']);
  /* Los cuatro que no se sabe bien qué son salen de sus rutinas hasta tener texto y dibujo claros. */
  sin('extra.legs.single', ['Sentadilla de cuádriceps']);
  sin('move.spine.waves', ['Puente torácico', 'Onda espinal']);
  sin('move.hamstrings', ['Marcha del elefante']);
  todas['extra.grip.squeeze'].name = 'Manos y antebrazos';

  const t = (id) => todas[id];
  const nuevo = (cat, grupos) => { for (const k of Object.keys(cat)) delete cat[k]; Object.assign(cat, grupos); };
  nuevo(M, {
    empezar: { label: 'Para empezar', items: [levantate, empuje, piernas, suelo] },
    sigilo: { label: 'Sigilo', items: [t('extra.calves'), t('extra.glutes.stealth'), t('extra.core.stealth')] },
    material: { label: 'Con material', items: [banda, t('extra.hang.bar')] },
    mas: { label: 'Para ir a más', items: [t('extra.push.ladder'), t('extra.chair.dips'), t('extra.wall.sit'), t('extra.legs.single'), t('extra.core.plank')] },
  });
  nuevo(E, {
    empezar: { label: 'Para empezar', items: [cuello, brazos, manos, tronco, pausaPiernas, sueloE] },
    oficina: { label: 'Oficina', items: [t('move.desk.quick'), t('move.chair.antidote'), t('extra.posture.set'), t('extra.grip.squeeze')] },
    hombros: { label: 'Hombros y columna', items: [t('move.shoulders.5'), t('extra.back.desk'), t('move.back.standing'), t('move.spine.waves')] },
    caderas: { label: 'Caderas y piernas', items: [t('move.hips.standing'), t('move.hips.5'), t('move.hamstrings')] },
    mas: { label: 'Para ir a más', items: [t('move.couch.stretch'), t('move.hips.ground')] },
  });
  return 'capas';
};
