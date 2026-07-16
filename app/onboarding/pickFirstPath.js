/* PACE · Onboarding · pickFirstPath (sesión 106 / v0.51.0)
   Elige el primer Camino a partir del perfil capturado en el onboarding.

   Uso HONESTO para s106 (decisión de sesión): mapeo ligero need→Caminos
   candidatos + sesgo por tiempo disponible, con getSuggestedPath() (hora
   del día) como fallback cuando no hay perfil o ningún candidato existe.
   El scoring completo perfil→Camino es s107 (getSuggestedPath v2) — este
   helper NO toca esa jerarquía: solo se usa dentro del flujo de bienvenida.

   `environment` se guarda pero aún no influye (no hay metadatos de ruido/
   discreción en el catálogo hasta la taxonomía s108). Documentado aquí
   para que nadie lo busque sin encontrarlo. */

/* Candidatos por necesidad, en orden de preferencia. Los ids viven en
   PATH_CATALOG (app/paths/registry.js); si alguno desaparece del catálogo
   el filtro de existencia lo salta sin romper. */
const PICK_BY_NEED = {
  calm:   ['path.breath', 'path.dusk', 'path.tea'],
  focus:  ['path.dawn', 'path.afternoon', 'path.midday'],
  body:   ['path.midday', 'path.weekend', 'path.dusk'],
  energy: ['path.afternoon', 'path.midday', 'path.dawn'],
};

/* Caminos cortos: si el usuario dijo "un respiro" (~5 min), estos suben
   al frente de sus candidatos. path.breath = 2 pasos de respiración;
   path.tea = el Foco más corto del catálogo (10 min). */
const PICK_SHORT_PATHS = ['path.breath', 'path.tea'];

function pickFirstPath(profile) {
  const need = profile && profile.need;
  const time = profile && profile.time;

  const exists = (id) => !!(window.getPath && window.getPath(id));
  const accessible = (id) =>
    typeof window.canAccessPath !== 'function' || window.canAccessPath(id);

  let candidates = (need && PICK_BY_NEED[need]) ? PICK_BY_NEED[need].slice() : [];

  /* Sesgo por tiempo: con poco tiempo, los Caminos cortos primero
     (reordenación estable: el resto conserva su orden de preferencia). */
  if (time === 'short' && candidates.length > 0) {
    const short = candidates.filter((id) => PICK_SHORT_PATHS.includes(id));
    const rest = candidates.filter((id) => !PICK_SHORT_PATHS.includes(id));
    candidates = short.concat(PICK_SHORT_PATHS.filter((id) => !short.includes(id) && exists(id)), rest);
  }

  for (let i = 0; i < candidates.length; i++) {
    if (exists(candidates[i]) && accessible(candidates[i])) return candidates[i];
  }

  /* Sin perfil (todo saltado) o sin candidatos vivos: la sugerencia por
     hora del día de siempre. */
  return (typeof window.getSuggestedPath === 'function')
    ? window.getSuggestedPath()
    : null;
}

Object.assign(window, { pickFirstPath });
