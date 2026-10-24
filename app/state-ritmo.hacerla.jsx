/* PACE · «VER EJERCICIO»: UN EJERCICIO SUELTO EN LA INVITACIÓN (Ez, 22 oct. 2026: 5a A · 5b B)
   =========================================================================================
   La invitación de los bloques cortos (state-ritmo.bloques.jsx) abre una hoja con UN
   ejercicio de los que ya hay en Mueve o Estira (RitmoHacerla.jsx). La hoja no cuenta: su
   «Empezar» lleva a la pantalla de ejercicio de siempre con ese ejercicio solo.

   LOS 31 (docs/proposals/hacerla-reparto.md): los que se hacen junto a la mesa, sin suelo ni
   material, revisados uno a uno. Cada uno es la PRIMERA serie de su rutina (las demás dicen
   «Últimas» o «Segunda tanda», y fuera de la rutina no se entienden) y va con el módulo donde
   sale en más rutinas. El orden va uno de Mueve y dos de Estira, sin dos de la misma rutina
   seguidos; cada invitación saca el siguiente (`hacerlaVez`), así que nunca repite el de la
   anterior y los 31 salen antes de volver a empezar.

   SOLO SUMA LOS MINUTOS (Ez, al aprobar las fotos): sin logros, sin «¿Te ayudó?» y sin contar
   como rutina hecha. Hecha, la apuntarían las series (ritmoAnotarHecha) y la pausa que viene
   cambiaría; y un «No» a un ejercicio apartaría de las pausas la rutina entera. Tampoco se
   guarda para «Continúa»: es un ejercicio, no una rutina a medias.

   `var`/`function` a propósito: un `const` no cruza la IIFE del artefacto. */

/* [rutina, paso]: los ids van cruzados (CLAUDE.md), `extra.*` es Mueve y `move.*` Estira. */
var HACERLA_REPARTO = [
  ['extra.calves', 0],              // Elevación de talones
  ['move.neck.3', 0],               // Barbilla atrás
  ['move.desk.quick', 0],           // Encogimiento de hombros
  ['extra.grip.squeeze', 0],        // Abrir y cerrar el puño
  ['move.wrists', 2],               // Palmas en la mesa
  ['move.shoulder.circles', 0],     // Círculos de brazos
  ['extra.glutes.stealth', 0],      // Apretar glúteos
  ['move.back.standing', 0],        // Rodar hacia abajo
  ['move.hips.standing', 0],        // Sentadilla profunda
  ['extra.legs.standing', 1],       // Elevación de puntas
  ['move.hamstrings.standing', 1],  // Isquio a una pierna
  ['move.shoulders.5', 2],          // Rotación externa
  ['extra.back.desk', 0],           // Juntar omóplatos
  ['move.neck.3', 1],               // Inclinación de cuello
  ['move.desk.quick', 1],           // Círculos de muñeca
  ['extra.posture.set', 2],         // Extensión torácica
  ['move.wrists', 3],               // Rezo invertido
  ['move.shoulder.circles', 4],     // Apertura de pecho
  ['extra.desk.pushups', 0],        // Flexiones inclinadas
  ['move.back.standing', 1],        // Rotación torácica de pie
  ['move.hips.standing', 1],        // Sentadilla lateral
  ['extra.grip.squeeze', 1],        // Extensión de dedos
  ['move.neck.3', 2],               // Rotación lenta
  ['move.desk.quick', 2],           // Giro sentado
  ['extra.legs.standing', 2],       // Sentadilla de cuádriceps
  ['move.hips.standing', 2],        // Zancada profunda
  ['move.neck.3', 3],               // Escalenos
  ['extra.posture.set', 3],         // Apertura de pecho sentado
  ['move.desk.quick', 3],           // Círculos de tobillo
  ['move.hips.standing', 3],        // Pliegue adelante
  ['extra.grip.squeeze', 2],        // Estiramiento de muñeca
];

/* El ejercicio del puesto `n` del reparto: { rutina, paso, modulo ('move' | 'extra'), step },
   o null si su rutina ya no lo tiene. */
function hacerlaEjercicio(n) {
  var L = HACERLA_REPARTO.length;
  var e = HACERLA_REPARTO[((n % L) + L) % L];
  var c = typeof resolveBodyRoutine === 'function' ? resolveBodyRoutine(e[0]) : null;
  var step = c && c.routine && Array.isArray(c.routine.steps) ? c.routine.steps[e[1]] : null;
  return step ? { rutina: e[0], paso: e[1], modulo: c.source, step: step } : null;
}

/* El que toca en esta invitación, y la cuenta pasa al siguiente. Lo llama la hoja una vez
   por invitación (FocusTimer.bloques.jsx): cerrarla y abrirla enseña el mismo. */
function hacerlaSiguiente() {
  var v = getState().hacerlaVez;
  var n = Number.isInteger(v) && v >= 0 ? v : 0;
  for (var i = 0; i < HACERLA_REPARTO.length; i++) {
    var e = hacerlaEjercicio(n + i);
    if (e) { setState({ hacerlaVez: (n + i + 1) % HACERLA_REPARTO.length }); return e; }
  }
  return null;
}

/* La rutina de UN paso que corre la pantalla de ejercicio. `hacerla` dice de dónde sale el
   paso: sus textos son los de ese paso en su rutina (v1Prefijo), y con ella el runner no
   guarda, no pregunta y solo suma minutos (MoveSessionV1.jsx). */
function hacerlaRutina(e) {
  var c = resolveBodyRoutine(e.rutina);
  return Object.assign({}, c.routine, {
    id: 'hacerla.' + e.rutina + '.s' + e.paso, name: e.step.name, min: 1,
    steps: [e.step], hacerla: { rutina: e.rutina, paso: e.paso },
  });
}

/* Lo que dura, sin la colocación: las veces a su ritmo o, por lados, los dos con el cambio. */
function hacerlaSegundos(e) {
  try { return estimateDuration({ steps: [e.step] }, 30).breakdown[1].active; } catch (x) { return null; }
}

/* Al acabar: sus minutos a la semana de Cuerpo y nada más. */
function hacerlaSumarMinutos(min) {
  if (!(min > 0)) return;
  ensureDayFresh();
  var s = getState();
  var semana = s.weeklyStats.moveMinutes.slice();
  semana[getDayIndexMondayFirst(new Date())] += min;
  setState({ weeklyStats: Object.assign({}, s.weeklyStats, { moveMinutes: semana }) });
}

Object.assign(window, {
  HACERLA_REPARTO, hacerlaEjercicio, hacerlaSiguiente, hacerlaRutina, hacerlaSegundos, hacerlaSumarMinutos,
});
