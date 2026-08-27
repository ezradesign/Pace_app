/* PACE · tests/eventos-retencion.spec.js (sesión 174)
   ====================================================
   LA RETENCIÓN POR CALENDARIO DE `pace.events.v1` (§12, 120 días), que estuvo
   IMPLEMENTADA Y SIN PROGRAMAR desde s155 y se engancha al arranque en s174.

   OJO CON EL NOMBRE: `tests/retencion.spec.js` ya existe y es de OTRA retención
   —la de la apnea de Respira—. No son parientes.

   Lo que se defiende, y por qué cada cosa:
   · QUE SE DISPARE SOLA. Estar implementada no servía de nada: el contenedor
     crecía igual. El aserto que importa no es «la función poda» sino «la app
     poda al arrancar, sin que nadie la llame».
   · QUE NO SE PIERDA EL TOTAL. Podar destila antes de borrar: el detalle por
     hecho se va, la cuenta se queda en `baseline`. Si esto fallara, la poda
     dejaría de ser retención y sería pérdida de datos.
   · QUE NO ESCRIBA SI NO HAY NADA. Cada arranque pasa por aquí; reescribir el
     contenedor entero para no cambiar nada toca `localStorage` y despierta a la
     otra pestaña sin motivo.
   · QUE SEA IDEMPOTENTE. El cursor existe justamente para que correrla dos
     veces no cuente dos veces.

   NINGÚN NÚMERO DE DÍAS VIVE AQUÍ: el suelo se lee del propio modelo
   (`eventsRetentionFloorKey`), así que cambiar 120 por otra cosa no pone este
   archivo en rojo -- y dejar de podar, sí.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { CLAVE_EVENTOS, leerContenedor, esperarInit } = require('./eventos.helpers');

/* Siembra DOS eventos a los lados del suelo de retención, escribiendo el
   contenedor por el contrato del modelo (`makeEvent`) y colocándolos en su día
   con las utilidades de la app: el día de cada evento se calcula con
   `eventsRetentionFloorKey`, no con una fecha escrita a mano. */
async function sembrarAmbosLados(page) {
  return page.evaluate(() => {
    const hoy = window.todayISO();
    const suelo = window.eventsRetentionFloorKey(hoy);
    /* un día ANTES del suelo (se poda) y uno DESPUÉS (se queda). Las claves ISO
       ordenan como cronologías, así que basta con mover un día. */
    const mueve = (iso, dias) => {
      const p = iso.split('-').map(Number);
      const d = new Date(p[0], p[1] - 1, p[2] + dias);
      const dd = (n) => (n < 10 ? '0' : '') + n;
      return d.getFullYear() + '-' + dd(d.getMonth() + 1) + '-' + dd(d.getDate());
    };
    const viejo = mueve(suelo, -1);
    const nuevo = mueve(suelo, +1);
    const uno = (dia, run) => {
      const e = window.makeEvent({
        type: 'session.completed', runId: run,
        payload: {
          module: 'focus', routineId: 'focus', completionReason: 'natural',
          elapsedSeconds: 1500, activeSeconds: 1500,
          plannedSeconds: 1500, plannedSecondsSource: 'preset',
        },
      });
      e.localDay = dia;
      e.occurredAt = dia + 'T10:00:00.000Z';
      return e;
    };
    const raw = JSON.parse(localStorage.getItem('pace.events.v1'));
    raw.events = [uno(viejo, 'run-viejo'), uno(nuevo, 'run-nuevo')];
    localStorage.setItem('pace.events.v1', JSON.stringify(raw));
    return { hoy, suelo, viejo, nuevo };
  });
}

test.beforeEach(async ({ context }) => { await sembrar(context); });

test('poda lo anterior al suelo, conserva lo posterior y NO pierde el total', async ({ page }) => {
  await irAlArtefacto(page);
  await esperarInit(page);
  const dias = await sembrarAmbosLados(page);
  expect(dias.viejo < dias.suelo).toBe(true);   // guard: la semilla es la que se cree
  expect(dias.nuevo > dias.suelo).toBe(true);

  const antes = await leerContenedor(page);
  expect(antes.events.length).toBe(2);
  const totalAntes = (antes.baseline && antes.baseline.totalsByType
    && antes.baseline.totalsByType['session.completed']) || 0;

  await page.evaluate(() => window.paceEventsPrune());
  const tras = await leerContenedor(page);

  /* el viejo se fue y el nuevo se queda: las dos mitades, o «quedan menos» se
     cumpliría también borrándolo todo */
  const ids = tras.events.map(e => e.runId);
  expect(ids).toEqual(['run-nuevo']);
  /* y su cuenta sobrevive en el baseline: se pierde el hecho, no el total */
  const totalTras = tras.baseline.totalsByType['session.completed'];
  expect(totalTras).toBe(totalAntes + 1);
  /* el cursor avanzó hasta el último consolidado */
  expect(tras.pruneCursor).not.toBeNull();
});

/* LO QUE ESTE TEST NO AÑADE, dicho para que nadie lo cuente dos veces: su
   promesa la defiende el MISMO filtro que el primer test (un evento
   consolidado se BORRA de `events`, así que la segunda pasada no lo encuentra),
   y el cursor es un segundo cinturón encima. Calibrando en rojo, ningún mutante
   de una línea lo pone rojo a él sin poner rojo también al primero. Se queda
   porque enuncia la promesa -- no porque cubra un hueco propio. */
test('correrla dos veces no cuenta dos veces', async ({ page }) => {
  await irAlArtefacto(page);
  await esperarInit(page);
  await sembrarAmbosLados(page);
  await page.evaluate(() => window.paceEventsPrune());
  const una = await leerContenedor(page);
  await page.evaluate(() => window.paceEventsPrune());
  const dos = await leerContenedor(page);
  expect(dos.baseline.totalsByType['session.completed'])
    .toBe(una.baseline.totalsByType['session.completed']);
  expect(dos.events.length).toBe(una.events.length);
  /* guard de cero: si la primera poda no hubiera hecho nada, este test pasaría
     comparando dos nadas */
  expect(una.baseline.totalsByType['session.completed']).toBeGreaterThan(0);
});

test('sin nada que podar NO reescribe el contenedor', async ({ page }) => {
  await irAlArtefacto(page);
  await esperarInit(page);
  /* SE ESPÍA LA ESCRITURA, no se compara la cadena. Comparar el JSON antes y
     después NO prueba nada: reescribir el MISMO contenedor produce la MISMA
     cadena, así que el aserto pasaba con la guarda quitada -- medido calibrando
     en rojo. Lo que importa aquí no es el valor, es que no se toque
     `localStorage`: cada arranque pasa por esta poda, y una escritura inútil
     despierta a la otra pestaña por nada. */
  const escrituras = await page.evaluate(async (clave) => {
    const real = localStorage.setItem.bind(localStorage);
    let n = 0;
    localStorage.setItem = function (k, v) { if (k === clave) n++; return real(k, v); };
    try { await window.paceEventsPrune(); } finally { localStorage.setItem = real; }
    return n;
  }, CLAVE_EVENTOS);
  expect(escrituras).toBe(0);
  /* control positivo EN LA MISMA PRUEBA: el espía cuenta de verdad cuando sí
     hay algo que podar, o un cero podría significar que no espía nada. */
  await sembrarAmbosLados(page);
  const conPoda = await page.evaluate(async (clave) => {
    const real = localStorage.setItem.bind(localStorage);
    let n = 0;
    localStorage.setItem = function (k, v) { if (k === clave) n++; return real(k, v); };
    try { await window.paceEventsPrune(); } finally { localStorage.setItem = real; }
    return n;
  }, CLAVE_EVENTOS);
  expect(conPoda).toBeGreaterThan(0);
});

test('SE DISPARA SOLA en el arranque, sin que nadie la llame', async ({ page }) => {
  await irAlArtefacto(page);
  await esperarInit(page);
  const dias = await sembrarAmbosLados(page);
  expect((await leerContenedor(page)).events.length).toBe(2);

  /* la app se recarga y NADIE llama a podar: lo hace el arranque */
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await expect.poll(async () => (await leerContenedor(page)).events.length, { timeout: 5000 })
    .toBe(1);
  const tras = await leerContenedor(page);
  expect(tras.events.map(e => e.runId)).toEqual(['run-nuevo']);
  expect(tras.baseline.totalsByType['session.completed']).toBeGreaterThan(0);
  expect(dias.viejo < dias.suelo).toBe(true);
});
