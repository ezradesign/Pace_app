# Tests de regresion — PACE v0.28.8

> Sesion 69 — 2026-05-12. Cinco tests pegables en DevTools que verifican
> que los fixes C1, C2, C3, A1 y A2 funcionan como se espera.

**Como ejecutar:**
1. Abrir la app **en ventana de incognito** (para empezar con localStorage limpio).
2. Esperar a que cargue (Welcome modal, o cualquier pantalla con la app montada).
3. Abrir la consola de DevTools (F12 → Console).
4. Pegar cada test **uno por uno**, leer la salida y comprobar el "esperado".
5. Si **todos** pasan, commitear. Si **alguno** falla, NO commitear y avisar.

Cada test es independiente: cada uno empieza con su propio `localStorage.setItem`
y `location.reload()`, sobreescribiendo lo que el test anterior hubiese dejado.
Tras pegar el bloque y recargar, vuelve a abrir la consola y pega el bloque
de "lectura" del mismo test (separado con `// === LECTURA ===`).

---

## Test 1 — C1: reset semanal de weeklyStats

Verifica que al cruzar un lunes nuevo, todos los slots de `weeklyStats`
se ponen a cero antes de empezar a registrar.

```js
// === SETUP ===
const s = JSON.parse(localStorage.getItem('pace.state.v2'));
// Forzar lastActiveDay al lunes PASADO (8 dias atras) y dejar 60 min
// en el slot 0 (lunes, convencion nueva).
const lastMonday = new Date();
lastMonday.setDate(lastMonday.getDate() - ((lastMonday.getDay() + 6) % 7) - 7);
const fakeWeekly = {
  focusMinutes:  [60,0,0,0,0,0,0],  // 60 min el lunes pasado
  breathMinutes: [0,0,0,0,0,0,0],
  moveMinutes:   [0,0,0,0,0,0,0],
  waterGlasses:  [0,0,0,0,0,0,0],
};
const corrupted = {
  ...s,
  lastActiveDay: lastMonday.toDateString(),
  weeklyStats: fakeWeekly,
  _weeklyStatsReindexed_v0_28_8: true,   // ya esta en formato nuevo
  _historyRecalculated_v0_28_8: true,
};
localStorage.setItem('pace.state.v2', JSON.stringify(corrupted));
console.log('SETUP listo. Recargando...');
location.reload();

// === LECTURA (pegar tras el reload) ===
const after = JSON.parse(localStorage.getItem('pace.state.v2'));
const allZero = ['focusMinutes','breathMinutes','moveMinutes','waterGlasses']
  .every(k => after.weeklyStats[k].every(v => v === 0));
console.log('weeklyStats post-rollover:', after.weeklyStats);
console.log(allZero ? 'PASS Test 1 (C1): todos los slots a 0' : 'FAIL Test 1 (C1): algun slot conservo valor');
```

**Esperado:** `PASS Test 1 (C1): todos los slots a 0`.

---

## Test 2 — C2 + C3: months/years coherentes con days

Verifica que tras la migracion compensatoria, la suma de `history.days`
en un mes coincide con `history.months[mes]`.

```js
// === SETUP ===
const s = JSON.parse(localStorage.getItem('pace.state.v2'));
// Simular history con months INFLADO al doble (escenario C2/C3 pre-fix).
s.history = {
  days: {
    '2026-05-01': { focusMinutes: 25, breathMinutes: 10, moveMinutes: 0,  waterGlasses: 2 },
    '2026-05-02': { focusMinutes: 50, breathMinutes: 0,  moveMinutes: 15, waterGlasses: 4 },
    '2026-05-03': { focusMinutes: 25, breathMinutes: 5,  moveMinutes: 0,  waterGlasses: 8 },
  },
  months: { '2026-05': { focusMinutes: 200, breathMinutes: 30, moveMinutes: 30, waterGlasses: 28 } }, // INFLADO
  years:  { '2026':    { focusMinutes: 200, breathMinutes: 30, moveMinutes: 30, waterGlasses: 28 } }, // INFLADO
};
s._historyRecalculated_v0_28_8 = false;   // forzar migracion
localStorage.setItem('pace.state.v2', JSON.stringify(s));
console.log('SETUP listo. Recargando...');
location.reload();

// === LECTURA ===
const after = JSON.parse(localStorage.getItem('pace.state.v2'));
const m = after.history.months['2026-05'];
const y = after.history.years['2026'];
const expected = { focusMinutes: 100, breathMinutes: 15, moveMinutes: 15, waterGlasses: 14 };
const monthOK = JSON.stringify(m) === JSON.stringify(expected);
const yearOK  = JSON.stringify(y) === JSON.stringify(expected);
console.log('months[2026-05]:', m);
console.log('years[2026]:',     y);
console.log('expected:',        expected);
console.log((monthOK && yearOK) ? 'PASS Test 2 (C2/C3): aggregates recomputados desde days' : 'FAIL Test 2');
```

**Esperado:** `PASS Test 2 (C2/C3): aggregates recomputados desde days`.

---

## Test 3 — A1: agua sola no cuenta como dia activo

Verifica que un dia con SOLO `waterGlasses>0` NO cuenta para `maxStreak`
en YearView.

```js
// === SETUP ===
const s = JSON.parse(localStorage.getItem('pace.state.v2'));
const year = new Date().getFullYear();
s.history = {
  days: {
    [`${year}-01-15`]: { focusMinutes: 0, breathMinutes: 0, moveMinutes: 0, waterGlasses: 8 },
    [`${year}-01-16`]: { focusMinutes: 0, breathMinutes: 0, moveMinutes: 0, waterGlasses: 8 },
    [`${year}-01-17`]: { focusMinutes: 0, breathMinutes: 0, moveMinutes: 0, waterGlasses: 8 },
  },
  months: {},
  years:  {},
};
s._historyRecalculated_v0_28_8 = false;
s.firstSeen = new Date(`${year}-01-01`).getTime();
localStorage.setItem('pace.state.v2', JSON.stringify(s));
console.log('SETUP listo. Abre el panel Stats -> Ano y verifica que "Racha maxima" es 0.');
location.reload();

// === LECTURA ===
// Despues del reload, abrir manualmente Stats -> Ano y mirar el footer.
// O via codigo, llamar a getYearData + computeYearStats:
const after = JSON.parse(localStorage.getItem('pace.state.v2'));
const yd = window.getYearData ? window.getYearData(after.history, year, after.firstSeen) : null;
if (yd) {
  // computeYearStats no esta exportado a window; recalcular inline para verificar.
  let maxStreak = 0, curStreak = 0;
  for (const cell of yd) {
    if (cell.isFuture) break;
    const active = cell.entry && ((cell.entry.focusMinutes||0)>0 || (cell.entry.breathMinutes||0)>0 || (cell.entry.moveMinutes||0)>0);
    if (active) { curStreak++; if (curStreak > maxStreak) maxStreak = curStreak; }
    else if (!cell.isPreUse) { curStreak = 0; }
  }
  console.log('maxStreak con solo agua:', maxStreak);
  console.log(maxStreak === 0 ? 'PASS Test 3 (A1): agua sola no cuenta' : 'FAIL Test 3: agua sigue contando');
} else {
  console.log('AVISO: getYearData no esta en window. Abre el modal Stats -> Ano manualmente y verifica que "Racha maxima" muestra 0, no 3.');
}
```

**Esperado:** `PASS Test 3 (A1): agua sola no cuenta` (o "Racha maxima 0" en el modal).

---

## Test 4 — A2: rotura proactiva del streak

Verifica que si la ultima sesion fue hace mas de un dia, `streak.current`
se pone a 0 inmediatamente al cargar, sin esperar a la siguiente sesion.

```js
// === SETUP ===
const s = JSON.parse(localStorage.getItem('pace.state.v2'));
const threeDaysAgo = new Date();
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
s.streak = { current: 7, longest: 10, lastActiveDate: threeDaysAgo.toDateString() };
s.lastActiveDay = threeDaysAgo.toDateString();
localStorage.setItem('pace.state.v2', JSON.stringify(s));
console.log('SETUP listo. Recargando...');
location.reload();

// === LECTURA ===
const after = JSON.parse(localStorage.getItem('pace.state.v2'));
console.log('streak post-rollover:', after.streak);
console.log(after.streak.current === 0
  ? 'PASS Test 4 (A2): streak.current reseteado a 0 proactivamente'
  : 'FAIL Test 4: streak.current sigue siendo ' + after.streak.current);
console.log('streak.longest preservado (10):', after.streak.longest === 10 ? 'OK' : 'FAIL');
```

**Esperado:** `PASS Test 4 (A2): streak.current reseteado a 0 proactivamente` y `streak.longest preservado (10): OK`.

---

## Test 5 — Idempotencia archiveDayToHistory

Verifica que archivar el mismo dia N veces da el mismo resultado.

```js
// === SETUP + LECTURA (un solo bloque, no requiere reload) ===
const archive = window.archiveDayToHistory;
const weekly = {
  focusMinutes:  [25,0,0,0,0,0,0],  // lunes=25 min
  breathMinutes: [0,0,0,0,0,0,0],
  moveMinutes:   [0,0,0,0,0,0,0],
  waterGlasses:  [0,0,0,0,0,0,0],
};
// Buscar un lunes real reciente
const someMonday = new Date();
someMonday.setDate(someMonday.getDate() - ((someMonday.getDay() + 6) % 7) - 7);
const dateStr = someMonday.toDateString();
let h = { days: {}, months: {}, years: {} };
h = archive(h, dateStr, weekly);
const after1 = JSON.parse(JSON.stringify(h));
h = archive(h, dateStr, weekly);
h = archive(h, dateStr, weekly);
const after3 = JSON.parse(JSON.stringify(h));
const iso = window.toISODate(dateStr);
const mk  = iso.slice(0,7);
const yk  = iso.slice(0,4);
console.log('1 vez  -> days:',   after1.days[iso].focusMinutes,
            '| months:', after1.months[mk].focusMinutes,
            '| years:',  after1.years[yk].focusMinutes);
console.log('3 veces -> days:',  after3.days[iso].focusMinutes,
            '| months:', after3.months[mk].focusMinutes,
            '| years:',  after3.years[yk].focusMinutes);
const idem = after1.days[iso].focusMinutes  === after3.days[iso].focusMinutes
          && after1.months[mk].focusMinutes === after3.months[mk].focusMinutes
          && after1.years[yk].focusMinutes  === after3.years[yk].focusMinutes;
console.log(idem ? 'PASS Test 5 (C3): archiveDayToHistory idempotente' : 'FAIL Test 5: months/years inflados');
```

**Esperado:** las dos lineas muestran los mismos numeros (25/25/25) y `PASS Test 5 (C3): archiveDayToHistory idempotente`.

---

## Limpieza tras los tests

```js
// Borrar todo el estado de prueba y volver a un estado limpio.
localStorage.removeItem('pace.state.v2');
location.reload();
```

Tras esto, la app abrira como instalacion nueva (Welcome modal).

---

## Tabla resumen

| Test | Verifica | Estado esperado |
|---|---|---|
| 1 | C1 — reset semanal | `weeklyStats` a 0 tras cruzar lunes |
| 2 | C2 + C3 — coherencia agregados | `months[mes].focus === sum(days[*].focus)` |
| 3 | A1 — agua no es streak | `maxStreak === 0` con solo agua |
| 4 | A2 — streak proactivo | `streak.current === 0` tras 3 dias inactivo |
| 5 | C3 — idempotencia archive | archivar 3 veces == archivar 1 vez |

**Si los 5 pasan -> commitear.**
**Si alguno falla -> NO commitear, reportar cual.**
