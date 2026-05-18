/* PACE · Caminos · Catálogo y resolvers · sesión 49 / v0.26.0-alpha
   Sin UI en esta sesión — solo capa de datos, helpers y catálogo.
   PathRunner.jsx (sesión 50) y SuggestedPathCard.jsx (sesión 51) irán aquí.
*/

const PATH_CATALOG = [
  {
    id: 'path.dawn',
    nameKey: 'paths.path.dawn.name',
    taglineKey: 'paths.path.dawn.tagline',
    timeOfDay: 'morning',
    steps: [
      { kind: 'breathe', routineId: 'breathe.coherent.55' },
      { kind: 'focus',                                      min: 25 },
      { kind: 'body',   routineId: 'move.neck.3' },
    ],
    access: 'free',
  },
  {
    id: 'path.midday',
    nameKey: 'paths.path.midday.name',
    taglineKey: 'paths.path.midday.tagline',
    timeOfDay: 'midday',
    steps: [
      { kind: 'hydrate',                                    optional: true },
      { kind: 'body',   routineId: 'move.hips.5' },
      { kind: 'focus',                                      min: 25 },
    ],
    access: 'free',
  },
  {
    id: 'path.afternoon',
    nameKey: 'paths.path.afternoon.name',
    taglineKey: 'paths.path.afternoon.tagline',
    timeOfDay: 'afternoon',
    steps: [
      { kind: 'breathe', routineId: 'breathe.478' },
      { kind: 'focus',                                      min: 15 },
      { kind: 'body',   routineId: 'extra.desk.pushups' },
    ],
    access: 'free',
  },
  {
    id: 'path.tea',
    nameKey: 'paths.path.tea.name',
    taglineKey: 'paths.path.tea.tagline',
    timeOfDay: 'afternoon',
    steps: [
      { kind: 'breathe', routineId: 'breathe.coherent.55' },
      { kind: 'hydrate',                                    optional: true },
      { kind: 'focus',                                      min: 10 },
    ],
    access: 'free',
  },
  {
    id: 'path.dusk',
    nameKey: 'paths.path.dusk.name',
    taglineKey: 'paths.path.dusk.tagline',
    timeOfDay: 'evening',
    steps: [
      { kind: 'breathe', routineId: 'breathe.coherent.55' },
      { kind: 'focus',                                      min: 25 },
      { kind: 'body',   routineId: 'move.chair.antidote' },
    ],
    access: 'free',
  },
  {
    id: 'path.weekend',
    nameKey: 'paths.path.weekend.name',
    taglineKey: 'paths.path.weekend.tagline',
    timeOfDay: 'weekend',
    steps: [
      { kind: 'breathe', routineId: 'breathe.nadi.shodhana' },
      { kind: 'body',   routineId: 'move.atg.knees' },
      { kind: 'hydrate',                                    optional: true },
    ],
    access: 'free',
  },
  {
    id: 'path.breath',
    nameKey: 'paths.path.breath.name',
    taglineKey: 'paths.path.breath.tagline',
    timeOfDay: 'anytime',
    steps: [
      { kind: 'breathe', routineId: 'breathe.478' },
      { kind: 'breathe', routineId: 'breathe.coherent.55' },
    ],
    access: 'free',
  },
];

const PATH_BY_ID = Object.fromEntries(PATH_CATALOG.map(p => [p.id, p]));

function getPath(id) {
  return PATH_BY_ID[id] || null;
}

/* resolveBodyRoutine: busca un routineId primero en MoveModule, luego en ExtraModule.
   Devuelve { routine, source: 'move'|'extra' } o null si no existe en ninguno.
   Depende de que getMoveRoutine y getExtraRoutine estén en window (se cargan antes). */
function resolveBodyRoutine(id) {
  const m = (window.getMoveRoutine && window.getMoveRoutine(id)) || null;
  if (m) return { routine: m, source: 'move' };
  const e = (window.getExtraRoutine && window.getExtraRoutine(id)) || null;
  if (e) return { routine: e, source: 'extra' };
  return null;
}

window.PATH_CATALOG = PATH_CATALOG;
window.getPath = getPath;
window.resolveBodyRoutine = resolveBodyRoutine;
