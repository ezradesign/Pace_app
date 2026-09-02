/* PACE · Sidebar — selectores puros (s180)
   ============================================================
   La sidebar dejó de ser un panel decorativo y pasó a responder cuatro
   preguntas: qué he hecho hoy, qué puedo continuar, cómo va la semana y cuál
   fue mi último logro. Este archivo es el ÚNICO sitio donde se decide la
   respuesta; los componentes de `Sidebar.parts.jsx` solo pintan.

   SON PUROS A PROPÓSITO, y eso incluye no leer `window`. `selectSidebarPrimaryAction`
   necesita los eventos, así que los RECIBE por parámetro en vez de llamar a
   `paceEventsSnapshot()` por su cuenta: así una prueba puede darle una lista y
   comprobar la prioridad sin montar el almacén ni el adaptador.

   NO DUPLICAN LOS CÁLCULOS DE ESTADÍSTICAS. Todo sale de lo que el store ya
   guarda -- `weeklyStats`, `water`, `streak`, `paths.current`, `achievements`--
   con las MISMAS reglas que ya usan otras superficies:
     · índice del día LUNES-PRIMERO, igual que `WeekDots` desde s69.
     · «día activo» = foco | respira | cuerpo. **El agua sola NO cuenta**, que
       es el criterio de s69 compartido con `YearView` y con la racha.

   ORDEN DE CARGA: antes de `Sidebar.parts.jsx`, que los consume.
   ============================================================ */

/* Índice del día lunes-primero (L=0 … D=6). `weeklyStats` se reindexó a este
   orden en s69/v0.28.8; leerlo con `getDay()` a secas rota la semana. */
function sidebarDayIndex(now) {
  const d = (now instanceof Date) ? now : new Date();
  return (d.getDay() + 6) % 7;
}

function sidebarAt(arr, i) {
  return (Array.isArray(arr) ? arr[i] : 0) || 0;
}

/* selectSidebarToday(state, now) -> resumen de hoy.
   El agua sale de `water.today` y no de `weeklyStats.waterGlasses[hoy]`:
   `addWaterGlass` escribe en los dos, pero `water.today` es el que el rollover
   reinicia, así que es el que manda. El array queda de respaldo. */
function selectSidebarToday(state, now) {
  const s = state || {};
  const ws = s.weeklyStats || {};
  const i = sidebarDayIndex(now);
  const water = s.water || {};
  return {
    focusMinutes:   sidebarAt(ws.focusMinutes, i),
    breatheMinutes: sidebarAt(ws.breathMinutes, i),
    bodyMinutes:    sidebarAt(ws.moveMinutes, i),
    waterGlasses:   typeof water.today === 'number' ? water.today : sidebarAt(ws.waterGlasses, i),
    waterGoal:      typeof water.goal === 'number' && water.goal > 0 ? water.goal : 8,
    dayIndex:       i,
  };
}

/* selectSidebarWeek(state, now) -> los siete puntos + la racha.
   `active` con el criterio de s69: cualquier sesión de foco, respira o cuerpo
   enciende el día; el agua sola no. Si esto se cambia aquí, deja de coincidir
   con `WeekDots`, con `YearView` y con la racha a la vez. */
function selectSidebarWeek(state, now) {
  const s = state || {};
  const ws = s.weeklyStats || {};
  const hoy = sidebarDayIndex(now);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const activo = sidebarAt(ws.focusMinutes, i) > 0
                || sidebarAt(ws.breathMinutes, i) > 0
                || sidebarAt(ws.moveMinutes, i) > 0;
    days.push({ active: activo, isToday: i === hoy });
  }
  const streak = s.streak || {};
  return {
    days: days,
    todayIndex: hoy,
    activeCount: days.filter(function (d) { return d.active; }).length,
    currentStreak: streak.current || 0,
    longestStreak: streak.longest || 0,
  };
}

/* selectSidebarLastSession(eventos) -> la última sesión terminada.
   Recorre la lista SIN ordenarla (no es suya) y se queda con el
   `session.completed` de `occurredAt` más reciente. Devuelve null si no hay
   ninguno, que es el caso normal en `file://` y en Capacitor: allí el
   adaptador de eventos está inerte y el contenedor viene vacío. */
function selectSidebarLastSession(eventos) {
  if (!Array.isArray(eventos)) return null;
  let mejor = null, mejorT = -Infinity;
  for (let i = 0; i < eventos.length; i++) {
    const e = eventos[i];
    if (!e || e.type !== 'session.completed' || !e.payload) continue;
    const t = Date.parse(e.occurredAt);
    if (isNaN(t) || t < mejorT) continue;
    mejorT = t; mejor = e;
  }
  if (!mejor) return null;
  return {
    routineId: mejor.payload.routineId || null,
    module: mejor.payload.module || null,
    occurredAt: mejor.occurredAt,
    localDay: mejor.localDay || null,
  };
}

/* selectSidebarTodayCounts(eventos, hoyISO) -> sesiones de HOY por modulo, o
   `null` si no se puede saber.

   EL DATO NO ESTA EN `weeklyStats`, que guarda MINUTOS y no cuentas -- no hay
   ningun contador de sesiones por dia en el estado. Sale de `pace.events.v1`,
   donde cada `session.completed` lleva su `module` y su `localDay`.

   DEVUELVE `null` Y NO CEROS cuando no hay lista, y la diferencia importa: en
   `file://` y en Capacitor el adaptador esta inerte y el contenedor viene
   vacio, asi que pintar «0 sesiones» al lado de «25 min» seria una
   contradiccion a la vista. Sin dato no se pinta nada; los minutos siguen.

   CUERPO SUMA `move` Y `stretch`, igual que hacen sus minutos: son dos modulos
   y una sola cifra, como en `weeklyStats.moveMinutes`. */
function selectSidebarTodayCounts(eventos, hoyISO) {
  if (!Array.isArray(eventos)) return null;
  const hoy = typeof hoyISO === 'string' ? hoyISO : null;
  const n = { focus: 0, breathe: 0, body: 0 };
  for (let i = 0; i < eventos.length; i++) {
    const e = eventos[i];
    if (!e || e.type !== 'session.completed' || !e.payload) continue;
    if (hoy && e.localDay !== hoy) continue;
    const m = e.payload.module;
    if (m === 'focus') n.focus++;
    else if (m === 'breathe') n.breathe++;
    else if (m === 'move' || m === 'stretch') n.body++;
  }
  return n;
}

/* selectSidebarPrimaryAction(state, ctx) -> qué ofrece la tarjeta, o null.
   DECISIÓN DE PRODUCTO (s180): la tarjeta solo puede decir CONTINUAR o
   REPETIR, y las dos hablan de algo que la persona YA hizo. No sugiere.
   Si dijera «prueba esto» un día y «continúa» otro en el mismo sitio y con la
   misma pinta, dejaría de ser un sitio fiable y sería una ranura de anuncios.

   Prioridad: 1) Camino en curso · 2) última sesión terminada · 3) SUGERENCIA.

   LA TERCERA RAMA ANULA LA DECISIÓN ORIGINAL DE s180, y se dice: la primera
   versión no sugería nunca, porque el usuario había pedido que la tarjeta no
   cambiara de identidad. Al usarla decidió lo contrario -- «quiero que la
   tarjeta vaya cambiando para que tenga más funcionalidades y así no
   desaparezca si no se ha hecho nada»-- y lo que evita que vuelva el problema
   que le molestaba es que el RÓTULO cambia de verdad (CONTINÚA / REPETIR /
   PARA AHORA, cada uno con su color), en vez de que la misma caja diga cosas
   distintas sin avisar.

   La sugerencia entra POR PARÁMETRO (`ctx.sugerencia`), no se calcula aquí:
   elegirla exige el catálogo y el guard de acceso, y este archivo es puro.

   Las dos prioridades del brief que van delante de estas -- sesión CTB
   interrumpida y CTB recuperable-- NO están aquí porque el runner todavía no
   persiste ronda ni fase. Fingirlas sería prometer una reanudación que no
   existe. Entran cuando exista `activeBreathSession`. */
function selectSidebarPrimaryAction(state, ctx) {
  const s = state || {};
  const c = ctx || {};
  const cur = (s.paths && s.paths.current) || null;
  if (cur && cur.id) {
    return {
      kind: 'path',
      targetId: cur.id,
      stepIndex: typeof cur.stepIndex === 'number' ? cur.stepIndex : 0,
    };
  }
  const last = selectSidebarLastSession(c.events);
  if (last && last.routineId) {
    return {
      kind: 'repeat',
      targetId: last.routineId,
      module: last.module,
      localDay: last.localDay,
    };
  }
  if (c.sugerencia) {
    return { kind: 'suggest', targetId: c.sugerencia };
  }
  return null;
}

/* selectSidebarLatestAchievement(state) -> el más reciente, o null.
   UNO, no cinco: la rejilla de cinco miniaturas se retira en s180. El orden es
   el mismo que usaba `AchievementsPreview` (`unlockedAt` descendente). */
function selectSidebarLatestAchievement(state) {
  const logros = (state && state.achievements) || {};
  const ids = Object.keys(logros);
  if (!ids.length) return null;
  let mejor = null, mejorT = -Infinity;
  for (let i = 0; i < ids.length; i++) {
    const t = (logros[ids[i]] && logros[ids[i]].unlockedAt) || 0;
    if (t < mejorT) continue;
    mejorT = t; mejor = ids[i];
  }
  return mejor ? { id: mejor, unlockedAt: mejorT > 0 ? mejorT : null } : null;
}

Object.assign(window, {
  sidebarDayIndex,
  selectSidebarToday,
  selectSidebarWeek,
  selectSidebarTodayCounts,
  selectSidebarLastSession,
  selectSidebarPrimaryAction,
  selectSidebarLatestAchievement,
});
