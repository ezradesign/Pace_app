/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   state-history.jsx — utils de fecha + historico de actividad + stats vivos.
   Extraido de state-core.jsx (sesion 101 / v0.46.0) al anadir
   getHistoryWithToday; state-core quedaba en 511 lineas.

   CARGA ANTES de state-core.jsx en PACE.html: loadState() (que corre al
   evaluar state-core) llama a archiveDayToHistory / getMondayOf /
   recomputeAllHistoryAggregates via window, y este archivo debe haberlos
   expuesto ya. No depende de ningun otro modulo del estado.
*/

/* ============================
   UTILS DE FECHA
   ============================ */

function todayISO() {
  // Fecha LOCAL, no UTC (s105). new Date().toISOString() usa UTC: entre
  // medianoche y el offset (~1-2 AM en Espana) devolvia el dia ANTERIOR,
  // corrompiendo rachas/history/Caminos. toISODate formatea con getFullYear/
  // getMonth/getDate locales -- unica fuente de verdad del dia de calendario.
  return toISODate(new Date());
}

function toISODate(dateString) {
  const d = new Date(dateString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/* Parsea una clave "YYYY-MM-DD" como fecha LOCAL (B1). new Date("YYYY-MM-DD")
   parsea medianoche UTC: en husos negativos el round-trip con toISODate
   (local) retrocede un dia y rompe las rachas. PROHIBIDO new Date(iso) sobre
   claves ISO en el proyecto -- usar siempre este helper. */
function parseLocalDateKey(isoDate) {
  const parts = String(isoDate).split('-');
  return new Date(Number(parts[0]), Number(parts[1] || 1) - 1, Number(parts[2] || 1));
}

function zeroEntry() {
  return { focusMinutes: 0, breathMinutes: 0, moveMinutes: 0, waterGlasses: 0 };
}

/* Indice lunes-primero (sesion 69). 0=lunes ... 6=domingo. */
function getDayIndexMondayFirst(date) {
  const d = new Date(date).getDay(); // 0=domingo .. 6=sabado
  return d === 0 ? 6 : d - 1;
}

/* Lunes 00:00 local de la semana que contiene `date`. */
function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/* ============================
   HISTORICO DE ACTIVIDAD (sesion 43, refactor sesion 69)
   ============================ */

/* Suma idempotente de un mes desde history.days. monthKey = "YYYY-MM". */
function recomputeMonthFromDays(days, monthKey) {
  const acc = zeroEntry();
  for (const isoDate in days) {
    if (isoDate.indexOf(monthKey) === 0) {
      const d = days[isoDate];
      acc.focusMinutes  += d.focusMinutes  || 0;
      acc.breathMinutes += d.breathMinutes || 0;
      acc.moveMinutes   += d.moveMinutes   || 0;
      acc.waterGlasses  += d.waterGlasses  || 0;
    }
  }
  return acc;
}

/* Suma idempotente de un año desde history.days. yearKey = "YYYY". */
function recomputeYearFromDays(days, yearKey) {
  const acc = zeroEntry();
  for (const isoDate in days) {
    if (isoDate.indexOf(yearKey) === 0) {
      const d = days[isoDate];
      acc.focusMinutes  += d.focusMinutes  || 0;
      acc.breathMinutes += d.breathMinutes || 0;
      acc.moveMinutes   += d.moveMinutes   || 0;
      acc.waterGlasses  += d.waterGlasses  || 0;
    }
  }
  return acc;
}

/* Recalcula TODOS los agregados desde history.days. Operacion idempotente
   y segura: si days es integro, months/years quedan correctos sin importar
   cuantas veces se haya inflado antes. Sesion 69. */
function recomputeAllHistoryAggregates(history) {
  const days = history.days || {};
  const months = {};
  const years = {};
  for (const isoDate in days) {
    const monthKey = isoDate.slice(0, 7);
    const yearKey  = isoDate.slice(0, 4);
    if (!months[monthKey]) months[monthKey] = recomputeMonthFromDays(days, monthKey);
    if (!years[yearKey])   years[yearKey]   = recomputeYearFromDays(days, yearKey);
  }
  return { days, months, years };
}

/* Sesion 69: archiveDayToHistory ahora es 100% idempotente.
   days[iso] siempre se sobrescribe (overwrite, no acumulativo).
   months/years se recalculan desde days (no acumulativo).
   Llamar dos veces para la misma fecha produce el mismo resultado. */
function archiveDayToHistory(history, dateStr, weeklyStats) {
  const idx = getDayIndexMondayFirst(dateStr);
  const delta = {
    focusMinutes:  (weeklyStats.focusMinutes  || [])[idx] || 0,
    breathMinutes: (weeklyStats.breathMinutes || [])[idx] || 0,
    moveMinutes:   (weeklyStats.moveMinutes   || [])[idx] || 0,
    waterGlasses:  (weeklyStats.waterGlasses  || [])[idx] || 0,
  };
  const hasData = Object.values(delta).some(v => v > 0);
  if (!hasData) return history;

  const isoDate = toISODate(dateStr);
  const days = { ...(history.days || {}), [isoDate]: delta };
  const monthKey = isoDate.slice(0, 7);
  const yearKey  = isoDate.slice(0, 4);
  return {
    days,
    months: { ...(history.months || {}), [monthKey]: recomputeMonthFromDays(days, monthKey) },
    years:  { ...(history.years  || {}), [yearKey]:  recomputeYearFromDays(days, yearKey)  },
  };
}

/* ============================
   STATS VIVOS (sesion 101)
   ============================ */

/* Selector memoizado: history + el dia ACTUAL fusionado desde weeklyStats.
   history.days solo se alimenta en el rollover, asi que Mes/Año eran ciegos
   a lo practicado hoy hasta mañana. Los paneles leen esto en vez de
   state.history; el estado persistido NO cambia (el rollover sigue siendo
   el unico escritor real).
   Reutiliza archiveDayToHistory: overwrite idempotente de days[hoy] +
   recompute de su mes/año; sin actividad hoy devuelve el mismo objeto.
   Memo por identidad: setState crea objetos nuevos en cada escritura y el
   cambio de dia invalida via dayKey. */
let _historyWithTodayCache = null;
function getHistoryWithToday(state) {
  const history = (state && state.history) || { days: {}, months: {}, years: {} };
  const weekly  = (state && state.weeklyStats) || {};
  const dayKey  = new Date().toDateString();
  const c = _historyWithTodayCache;
  if (c && c.history === history && c.weekly === weekly && c.dayKey === dayKey) {
    return c.result;
  }
  const result = archiveDayToHistory(history, dayKey, weekly);
  _historyWithTodayCache = { history, weekly, dayKey, result };
  return result;
}

Object.assign(window, {
  todayISO, toISODate, parseLocalDateKey, zeroEntry,
  getDayIndexMondayFirst, getMondayOf,
  recomputeMonthFromDays, recomputeYearFromDays, recomputeAllHistoryAggregates,
  archiveDayToHistory,
  getHistoryWithToday,
});
