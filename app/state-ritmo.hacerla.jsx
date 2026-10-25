/* PACE · «VER EJERCICIO»: UN EJERCICIO SUELTO EN LA INVITACIÓN (Ez, 22 oct. 2026: 5a A · 5b B)
   =========================================================================================
   La invitación de los bloques cortos (state-ritmo.bloques.jsx) abre una hoja con UN
   ejercicio de los que ya hay en Mueve o Estira (RitmoHacerla.jsx). La hoja no cuenta: su
   «Empezar» lleva a la pantalla de ejercicio de siempre con ese ejercicio solo.

   LOS 27 (docs/proposals/hacerla-reparto.md, rehecho con las capas de Mueve y Estira, Ez, 23 oct.
   2026: 2A): los que se hacen junto a la mesa, gratis, sin suelo ni material, y sin pared, barra,
   banda ni silla. Cada uno es la PRIMERA serie de su rutina (las demás dicen «Otra serie» y
   fuera de la rutina no se entienden) y va con el módulo donde sale en más rutinas. Mueve es
   fuerza y casi toda pide silla o pared, así que deja tres; van espaciados (puestos 1, 10 y 19)
   y nunca hay dos de la misma rutina seguidos. Cada invitación saca el siguiente
   (`hacerlaVez`), así que nunca repite el de la anterior y los 27 salen antes de volver a empezar.

   SOLO SUMA LOS MINUTOS (Ez, al aprobar las fotos): sin logros, sin «¿Te ayudó?» y sin contar
   como rutina hecha. Hecha, la apuntarían las series (ritmoAnotarHecha) y la pausa que viene
   cambiaría; y un «No» a un ejercicio apartaría de las pausas la rutina entera. Tampoco se
   guarda para «Continúa»: es un ejercicio, no una rutina a medias.

   `var`/`function` a propósito: un `const` no cruza la IIFE del artefacto. */

/* [rutina, paso]. El módulo lo dice el catálogo (resolveBodyRoutine), nunca el prefijo del id:
   los ids van cruzados (CLAUDE.md) y Postura reset o Manos y antebrazos, `extra.*`, son Estira. */
var HACERLA_REPARTO = [
  ['extra.calves', 0],                 // Elevación de talones
  ['move.neck.3', 0],                  // Barbilla atrás
  ['move.wrists', 0],                  // Abrir y cerrar el puño
  ['move.desk.quick', 0],              // Encogimiento de hombros
  ['move.shoulder.circles', 0],        // Círculos de brazos
  ['extra.grip.squeeze', 3],           // Palmas en la mesa
  ['move.back.standing', 0],           // Rodar hacia abajo
  ['move.hips.standing', 0],           // Sentadilla profunda
  ['move.neck.3', 1],                  // Rotación lenta
  ['extra.desk.pushups', 0],           // Flexiones inclinadas
  ['extra.posture.set', 1],            // Juntar omóplatos
  ['move.wrists', 1],                  // Círculos de muñeca
  ['move.shoulder.circles', 2],        // Rotación externa
  ['move.desk.quick', 2],              // Giro sentado
  ['extra.posture.set', 2],            // Extensión torácica
  ['extra.grip.squeeze', 4],           // Rezo invertido
  ['move.hips.standing', 1],           // Sentadilla lateral
  ['extra.back.desk', 2],              // Apertura de pecho
  ['extra.glutes.stealth', 0],         // Apretar glúteos
  ['move.neck.3', 2],                  // Inclinación de cuello
  ['move.back.standing', 1],           // Rotación torácica de pie
  ['move.wrists', 2],                  // Estiramiento de muñeca
  ['move.hips.standing', 2],           // Zancada profunda
  ['move.desk.quick', 3],              // Círculos de tobillo
  ['extra.posture.set', 3],            // Apertura de pecho sentado
  ['extra.grip.squeeze', 1],           // Extensión de dedos
  ['move.hips.standing', 3],           // Pliegue adelante
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
