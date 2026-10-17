/* Las rutinas nuevas de los días diseñados, tal como entrarían en el catálogo (Mueve, ids
   `extra.*`), para medir el día antes de montarlas. Todo dentro de casa (Ez, 17 oct. 2026). */
'use strict';
const PASEO = { id: 'extra.walk.short', tag: 'LEG', code: 'Paseo', name: 'Paseo corto', min: 3,
  position: ['standing'], equipment: [], requiresFloor: false, intensity: 'gentle', level: 'accessible',
  steps: [{ name: 'Caminar', mode: 'timed', dur: 60 }, { name: 'Marcha viva', mode: 'timed', dur: 60 },
    { name: 'Caminar', mode: 'timed', dur: 45 }, { name: 'Respiraciones profundas', mode: 'rest', dur: 20 }] };
const HOMBROS = { id: 'extra.shoulders.strong', tag: 'PUSH', code: 'Hombros', name: 'Hombros fuertes', min: 3,
  position: ['standing'], equipment: ['bottleOptional'], requiresFloor: false, intensity: 'moderate', level: 'accessible',
  steps: [{ name: 'Elevación lateral', mode: 'perSide', dur: 30 }, { name: 'Remo con apoyo', mode: 'perSide', dur: 30 },
    { name: 'Encogimiento de hombros', mode: 'reps', reps: 8 }, { name: 'Respiraciones profundas', mode: 'rest', dur: 20 }] };
const PIERNAS = { id: 'extra.legs.strong', tag: 'LEG', code: 'Piernas', name: 'Piernas fuertes', min: 3,
  position: ['standing'], equipment: ['deskOptional'], requiresFloor: false, intensity: 'moderate', level: 'accessible',
  steps: [{ name: 'Sentadilla con apoyo', mode: 'reps', reps: 10 }, { name: 'Zancada atrás', mode: 'perSide', dur: 30 },
    { name: 'Elevación lateral de pierna', mode: 'perSide', dur: 30 }, { name: 'Respiraciones profundas', mode: 'rest', dur: 20 }] };

const META = {
  'extra.walk.short': { z: ['piernas'], pie: true, comida: true },
  'extra.shoulders.strong': { z: ['hombros'], pie: true },
  'extra.legs.strong': { z: ['piernas', 'caderas'], pie: true },
  'move.shoulders.5': { z: ['hombros'], pie: true },
  'extra.wall.sit': { z: ['piernas'], pie: true },
};

/* conjunto: 'dos' (Paseo corto y Hombros fuertes), 'pared' (y la pared cuenta), 'tres'
   (y Piernas fuertes) */
/* Paseo corto y Hombros fuertes ya están en el catálogo (app/move/move.data.casa.js): para
   medir el día de hoy (sin ellas) se quitan. */
function anadir(sb, conjunto) {
  const M = sb.MOVE_ROUTINES;
  const nuevas = ['extra.walk.short', 'extra.shoulders.strong'];
  if (!conjunto) Object.values(M).forEach((g) => { g.items = g.items.filter((r) => !nuevas.includes(r.id)); });
  if (conjunto === 'tres') M.piernas.items.push(PIERNAS);
  /* La pared cuenta ya en ritmoPozos: sin ella, se mide como si pidiera otra cosa. */
  if (conjunto !== 'pared' && conjunto !== 'tres') {
    const todas = [].concat(...Object.values(sb.EXTRA_ROUTINES).map((g) => g.items), ...Object.values(M).map((g) => g.items));
    todas.forEach((r) => { if ((r.equipment || []).includes('wall')) r.equipment = r.equipment.map((e) => (e === 'wall' ? 'paredSola' : e)); });
  }
  if (conjunto) Object.assign(sb.RITMO_SERIES_META, META);
  [PASEO, HOMBROS, PIERNAS].forEach((r) => { sb.__todas[r.id] = r; });
}
module.exports = { anadir, PASEO, HOMBROS, PIERNAS };
