/* PACE · E2E · EL TIEMPO DE RETENCION (s166)
 * ==========================================
 * La decision viene de s165 con TRES condiciones, y son la decision entera:
 *   1. total ACUMULADO, nunca un maximo — B1/s89 no retiro la cifra de la
 *      retencion por ser un dato, la retiro por ser un RECORD;
 *   2. INVISIBLE durante la practica, ni en 'hold' ni en el 'done';
 *   3. SIN LOGRO asociado.
 * Los cuatro asertos de aqui defienden esas tres y el camino del dato. Estan
 * escritos como CONTRATOS: dicen que la retencion se acredita, que no se ve
 * mientras se practica y que se acumula — no donde esta el nodo.
 *
 * POR QUE HACE FALTA MEDIRLO EN UN NAVEGADOR Y NO EN EL VERIFY: el reloj es
 * timestamp-based (decision s96) y se segmenta en un efecto de React. Un
 * checker estatico puede ver que la clave existe; no puede ver que el ultimo
 * segmento —el de la retencion recien terminada, o sea el mas largo— se cierre
 * antes de acreditar. Eso es justo lo que un `finish()` descuidado se come.
 *
 * TRAMPAS QUE VIVEN AQUI:
 *  · `clock.install()` va ANTES de `goto`.
 *  · Un `fastForward` grande NO avanza la sesion de Respira: el ticker se
 *    resuscribe por fase. De 1 s en 1 s (medido en s164).
 *  · El modal de apnea nace con el boton DISABLED hasta marcar la casilla.
 *  · La tecnica se abre por su HEADING: un boton por /Empezar/ caza el «Empezar
 *    foco» de la home que hay detras (trampa de s154).
 *  · Con `page.clock` el tiempo que el reloj de retencion mide es el VIRTUAL,
 *    asi que los segundos son deterministas -- pero por eso mismo el aserto
 *    mira RANGOS y no un valor exacto: el ultimo tramo depende de en que
 *    milisegundo se pulso.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, overlaySuperior } = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });

async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(12); }
}

async function abrirRondas(page) {
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: 'Rondas express', exact: true }).click();
  const modal = overlaySuperior(page);
  if (await modal.getByRole('button', { name: 'Empezar sesión' }).count()) {
    await modal.getByText('Lo he leído y asumo mi responsabilidad').click();
    await modal.getByRole('button', { name: 'Empezar sesión' }).click();
  }
  await page.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' }).click();
  await expect(page.locator('[data-pace-breathe-phase]')).toBeVisible();
}

/* Lleva la sesion hasta la PRIMERA retencion y aguanta `reten` segundos en
   ella. Devuelve true si llego; el llamador lo exige (guard de cero). */
async function hastaLaRetencion(page, reten) {
  let enHold = false;
  for (let s = 0; s < 130 && !enHold; s++) {
    enHold = await page.evaluate(() => /RETÉN SIN AIRE/i.test(document.body.innerText || ''));
    if (!enHold) await segundos(page, 1);
  }
  if (enHold) await segundos(page, reten);
  return enHold;
}

const leerHold = page => page.evaluate(() => {
  const raw = localStorage.getItem('pace.state.v2');
  if (!raw) return null;
  const w = (JSON.parse(raw) || {}).weeklyStats || {};
  return w.holdSeconds || null;
});

test('la retencion se acredita al terminar, y el ultimo tramo NO se pierde', async ({ page }) => {
  const errores = capturarErrores(page);
  await abrirRondas(page);

  /* GUARD: antes de terminar nada, la semana no puede tener retencion. Sin
     esto, un estado sembrado con datos haria pasar el aserto de abajo sin que
     la sesion hubiera acreditado nada. */
  const antes = await leerHold(page);
  expect(antes === null || antes.reduce((a, b) => a + b, 0) === 0,
    'GUARD: la semana ya traia retencion antes de practicar').toBe(true);

  /* SE RECORREN LAS DOS RONDAS ENTERAS, y no es por completismo: la PRIMERA
     version de este aserto salia de la retencion 1 con «Respirar de nuevo» y
     terminaba con el boton, y ASI NO MORDIA. Comprobado con el banco de
     mutaciones: quitandole a `finish()` el cierre del reloj, el test seguia
     VERDE. La razon es que ese camino pasa por 'active', y al cambiar de
     stage el efecto ya cierra el segmento -- el tramo en riesgo no se tocaba.

     El tramo en riesgo es el de la ULTIMA ronda: alli `releaseHold()` llama a
     `finish()` DIRECTAMENTE, sin pasar por 'active', asi que el efecto no ha
     visto el cambio todavia y la retencion recien terminada —la mas larga— se
     quedaria abierta y sin sumar. Por eso las dos retenciones duran distinto:
     si la ultima se perdiera, el total caeria de ~50 a ~20 y el margen de
     abajo lo caza. */
  const llego1 = await hastaLaRetencion(page, 20);
  expect(llego1, 'GUARD: la sesion nunca entro en la retencion de la ronda 1').toBe(true);
  await page.getByRole('button', { name: 'Respirar de nuevo' }).click();
  await page.waitForTimeout(150);

  const llego2 = await hastaLaRetencion(page, 30);
  expect(llego2, 'GUARD: no se llego a la retencion de la ronda 2 (la que arriesga)').toBe(true);
  /* Este click NO abre otra ronda: es la ultima, asi que releaseHold -> finish. */
  await page.getByRole('button', { name: 'Respirar de nuevo' }).click();
  await page.waitForTimeout(300);
  await expect(page.getByText(/Sesión completada/i).first(),
    'GUARD: la sesion no termino, asi que no hay credito que medir').toBeVisible({ timeout: 5000 });

  const despues = await leerHold(page);
  expect(despues, 'no se escribio holdSeconds en weeklyStats').not.toBeNull();
  const total = despues.reduce((a, b) => a + b, 0);
  /* 20 + 30 = 50 s virtuales de retencion. El suelo va en 45 porque el ultimo
     tramo depende del milisegundo del click; el techo, en 70, porque pasar de
     ahi significaria estar contando tambien las respiraciones. Si el segmento
     de la ronda 2 se perdiera, el total seria ~20 y el suelo lo caza. */
  expect(total, 'la retencion de la ULTIMA ronda no llego al credito').toBeGreaterThanOrEqual(45);
  expect(total, 'se acredito mas retencion de la que hubo').toBeLessThan(70);

  expect(errores).toEqual([]);
});

test('durante la practica la retencion es INVISIBLE: ni en hold ni en el done', async ({ page }) => {
  const errores = capturarErrores(page);
  await abrirRondas(page);

  const llego = await hastaLaRetencion(page, 40);
  expect(llego, 'GUARD: no se llego a la retencion').toBe(true);

  /* Condicion 2, primera mitad: en la pantalla de retencion no hay ni un
     numero de segundos. Se mira el TEXTO de la pantalla y no un selector, que
     es lo que hace que el aserto no caduque si el nodo cambia de sitio. */
  const textoHold = await page.evaluate(() => document.body.innerText || '');
  expect(/\b\d+\s*s\b/.test(textoHold),
    'la pantalla de retencion muestra segundos: eso es el cronometro que B1 retiro').toBe(false);

  await page.getByRole('button', { name: 'Respirar de nuevo' }).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: 'Terminar' }).click();
  await expect(page.getByText(/Sesión completada|Completado/i).first()).toBeVisible({ timeout: 5000 });

  /* Condicion 2, segunda mitad: el resumen de la sesion tampoco la dice. Lo
     que hay ahi es Tiempo, Rondas y Respiraciones — nada de retencion. */
  const textoDone = await page.evaluate(() => document.body.innerText || '');
  expect(/Retenci/i.test(textoDone),
    'el resumen de la sesion habla de retencion; la condicion 2 dice que no').toBe(false);

  expect(errores).toEqual([]);
});

test('en Ritmo la retencion es un ACUMULADO de la semana, no un maximo', async ({ page, context }) => {
  const errores = capturarErrores(page);

  /* Dos dias con retencion, sembrados: si la UI mostrara un maximo diria 71;
     si suma, dice 109. Es la condicion 1 medida con un numero, no con una
     lectura de codigo. Los guards de migracion son obligatorios al sembrar
     weeklyStats -- sin ellos loadState ROTA la semana un dia (s166). */
  await context.addInitScript(([c, e]) => {
    localStorage.setItem(c, JSON.stringify(e));
  }, ['pace.state.v2', {
    firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', paletteAuto: false,
    weeklyStats: {
      focusMinutes: [0,0,0,0,0,0,0], breathMinutes: [4,0,12,0,0,0,0],
      moveMinutes: [0,0,0,0,0,0,0], waterGlasses: [0,0,0,0,0,0,0],
      holdSeconds: [38,0,71,0,0,0,0],
    },
    _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
    _historyMigrated: true, lastActiveDay: new Date().toDateString(),
  }]);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Ver estadísticas' }).click();
  await page.locator('[data-pace-week-view]').waitFor({ state: 'visible' });

  const linea = page.locator('[data-pace-week-hold]');
  await expect(linea, 'la linea de retencion no aparece con datos en la semana').toHaveCount(1);
  /* RELACIONAL: el atributo lleva el total y se exige que sea la SUMA, no el
     mayor. Si alguien cambiara el reduce por un Math.max, 109 pasaria a 71 y
     esto lo dice. */
  await expect(linea).toHaveAttribute('data-pace-week-hold', String(38 + 71));
  await expect(linea).toContainText('1 min 49 s');

  expect(errores).toEqual([]);
});

test('sin retencion en la semana la linea NO existe, y el backup la lleva igual', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Ver estadísticas' }).click();
  await page.locator('[data-pace-week-view]').waitFor({ state: 'visible' });

  /* Una semana a cero NO pinta un «0 s» permanente: solo 3 de las 20 rutinas
     de Respira tienen retencion, asi que para la mayoria el cero es el estado
     normal y no un hueco por rellenar. */
  await expect(page.locator('[data-pace-week-hold]')).toHaveCount(0);

  /* Y LA PROMESA PUBLICA: privacy.html dice que el export lleva TODO el estado.
     El export copia `pace.state.v2` literal, asi que basta con que la clave
     viva ahi -- pero «basta» es una deduccion y esto lo comprueba. */
  /* Un gesto que ESCRIBE estado, para medir el almacen y no la memoria. */
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '15', exact: true }).click();
  await page.waitForTimeout(200);
  const enElAlmacen = await page.evaluate(() => {
    const raw = localStorage.getItem('pace.state.v2');
    if (!raw) return 'sin estado';
    const w = (JSON.parse(raw) || {}).weeklyStats || {};
    return Array.isArray(w.holdSeconds) ? 'presente:' + w.holdSeconds.length : 'AUSENTE';
  });
  expect(enElAlmacen,
    'holdSeconds no llega a pace.state.v2 al persistir, asi que el export de\n' +
    '«Tus datos» —que copia esa clave LITERAL— no la llevaria, y privacy.html\n' +
    'promete exportar TODO el estado')
    .toBe('presente:7');

  expect(errores).toEqual([]);
});
