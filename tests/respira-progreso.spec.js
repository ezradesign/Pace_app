/* PACE · el PROGRESO de una sesion de Respira (s165)
 * ==================================================
 * Hasta hoy la sesion de Respira no tenia un solo `data-pace-*` y NADA vigilaba
 * su progreso (D6 del diagnostico de s164): la suite solo podia llegar por
 * texto. Estos asertos defienden lo que s165 decidio, y estan escritos como
 * CONTRATOS y no como fotos del DOM — dicen que la ronda se dice una sola vez
 * por pantalla, no donde esta el nodo.
 *
 * LO QUE DEFIENDEN, en una linea cada uno:
 *  1. Las dos familias no dibujan lo mismo, y el numero de segmentos SALE del
 *     catalogo (relacional: segmentos == rondas, sin numero escrito a mano).
 *  2. La barra ya no va una respiracion por delante (D1): en la ultima
 *     respiracion de la ronda 1 el progreso sigue siendo 0, porque esa ronda
 *     todavia no ha terminado — le falta su retencion.
 *  3. El hueco de la cuenta atras se reserva por RUTINA y no por fase (5A), y
 *     la razon de s138 sigue viva donde aplica: en Suspiro fisiologico el nodo
 *     EXISTE en las tres fases y solo se vacia su numero.
 *  4. En la retencion no hay barra y la ronda la dice la cabecera; en la
 *     pantalla activa es al reves. Una vez en cada sitio, nunca dos.
 *
 * TRAMPAS QUE VIVEN AQUI:
 *  · `clock.install()` va ANTES de `goto` (misma razon que checklist-foco).
 *  · Un `fastForward` grande NO avanza una sesion de Respira: el ticker se
 *    resuscribe por fase y necesita un render entre ticks. Se avanza de 1 s en
 *    1 s (medido en el banco de s164).
 *  · El modal de apnea nace con el boton DISABLED hasta marcar la casilla.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, overlaySuperior } = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });

const barra = page => page.locator('[data-pace-breathe-progress]');

async function abrir(page, rutina) {
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: rutina, exact: true }).click();
  const modal = overlaySuperior(page);
  if (await modal.getByRole('button', { name: 'Empezar sesión' }).count()) {
    await modal.getByText('Lo he leído y asumo mi responsabilidad').click();
    await modal.getByRole('button', { name: 'Empezar sesión' }).click();
  }
  const sesion = page.locator('[data-pace-session-root]');
  await sesion.getByRole('button', { name: 'Empezar ahora' }).click();
  await expect(page.locator('[data-pace-breathe-phase]')).toBeVisible();
  return sesion;
}

/* De 1 s en 1 s: ver la cabecera. Un solo salto grande deja la sesion quieta. */
async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(12); }
}

/* TODO el estado del progreso en UNA sola llamada. No es cosmetica: la primera
   version leia contador, barra y retencion por separado y, avanzando segundo a
   segundo una ronda entera, salian ~500 viajes al navegador. Aislado pasaba en
   11 s; con la suite entera a 8 workers los dos tests del bucle se comian el
   timeout de 60 s. El producto no tenia nada que ver -- el instrumento era caro.
   Se abarata la medida en vez de subir el plazo. */
const muestra = page => page.evaluate(() => {
  const b = document.querySelector('[data-pace-breathe-progress]');
  const r = document.querySelector('[data-pace-breathe-breath]');
  return {
    progreso: b ? b.getAttribute('data-pace-breathe-progress') : null,
    respiracion: r ? r.getAttribute('data-pace-breathe-breath') : null,
    retencion: /RETÉN SIN AIRE/i.test(document.body.innerText || ''),
  };
});

test('cada familia dibuja lo suyo, y los segmentos SALEN del catalogo', async ({ page }) => {
  const errores = capturarErrores(page);

  /* Por bloques: tantos segmentos como rondas declare la rutina. El numero no
     se escribe aqui — se lee del propio DOM y se exige que coincidan, asi que
     el aserto no caduca si manana Rondas express tiene tres. */
  await abrir(page, 'Rondas express');
  const rondas = Number(await barra(page).getAttribute('data-pace-breathe-rounds'));
  expect(rondas).toBeGreaterThan(1);
  expect(await barra(page).locator('> div').count()).toBe(rondas);

  /* Por tiempo: una sola pieza, y ni rastro del atributo de rondas. */
  await abrir(page, 'Box 4·4·4·4');
  await expect(barra(page)).not.toHaveAttribute('data-pace-breathe-rounds', /.*/);
  expect(await barra(page).locator('> div').count()).toBe(1);

  expect(errores).toEqual([]);
});

test('la barra no va una respiracion por delante: la ronda 1 vale 0 hasta que termina', async ({ page }) => {
  const errores = capturarErrores(page);
  await abrir(page, 'Rondas express');

  /* No se mira un INSTANTE calculado a mano —la primera version de este aserto
     apuntaba al segundo 96 y para entonces la sesion ya estaba en la retencion—:
     se recorre la ronda ENTERA y se exige que el progreso valga cero en TODAS
     las muestras. Antes de s165 la barra se rellenaba con breathCount/breaths,
     asi que habria dejado de valer cero en la primera respiracion y en la
     ultima habria marcado 100 % con la retencion aun por delante (D1). */
  const vistos = new Set();
  let enRetencion = false;
  for (let s = 0; s < 115 && !enRetencion; s++) {
    const m = await muestra(page);
    if (m.progreso !== null) {
      expect(m.progreso).toBe('0.0000');
      vistos.add(m.respiracion);
    }
    enRetencion = m.retencion;
    await segundos(page, 1);
  }

  /* Guard de cero: sin esto, un bucle que nunca entrase en la sesion pasaria
     sin haber comprobado nada. Se exige haber visto la ronda COMPLETA -- de la
     primera respiracion a la ultima -- y haber llegado a la retencion. */
  expect(vistos.has('1')).toBe(true);
  expect(vistos.has('25')).toBe(true);
  expect(enRetencion).toBe(true);

  expect(errores).toEqual([]);
});

test('por tiempo la barra empieza en cero, avanza y no llega al final antes de tiempo', async ({ page }) => {
  const errores = capturarErrores(page);
  await abrir(page, 'Box 4·4·4·4');

  const leer = async () => Number((await muestra(page)).progreso);
  expect(await leer()).toBe(0);

  await segundos(page, 40);
  const alRato = await leer();
  /* 40 s de 300: ni cero ni el final. Los margenes son anchos a proposito —
     esto vigila el SENTIDO, no calibra el reloj. */
  expect(alRato).toBeGreaterThan(0.05);
  expect(alRato).toBeLessThan(0.3);

  await segundos(page, 40);
  expect(await leer()).toBeGreaterThan(alRato);

  expect(errores).toEqual([]);
});

test('el hueco de la cuenta atras se reserva por RUTINA, no por fase', async ({ page }) => {
  const errores = capturarErrores(page);

  /* Rondas express: sus dos fases duran 2 s, asi que el numero no aparece
     NUNCA. El nodo no debe existir: eran 32 px reservados para nada. */
  await abrir(page, 'Rondas express');
  await expect(page.locator('[data-pace-breathe-countdown]')).toHaveCount(0);

  /* Box: todas sus fases llegan a 4 s, asi que el numero se ve siempre. */
  await abrir(page, 'Box 4·4·4·4');
  await expect(page.locator('[data-pace-breathe-countdown]')).toHaveText(/^[1-4]$/);

  /* Suspiro fisiologico —2 s, 1 s, 5 s— es el caso que dio origen a la reserva
     en s138: el nodo EXISTE en las tres fases (o el texto saltaria 21 px al
     cambiar de fase) y lo unico que cambia es si lleva numero. Se recorre un
     ciclo entero y se exige que el nodo no desaparezca ni una vez. */
  await abrir(page, 'Suspiro fisiológico');
  const cuenta = page.locator('[data-pace-breathe-countdown]');
  let vacias = 0;
  let conNumero = 0;
  for (let s = 0; s < 8; s++) {
    await expect(cuenta).toHaveCount(1);
    const v = await cuenta.getAttribute('data-pace-breathe-countdown');
    if (v === '') vacias++; else conNumero++;
    await segundos(page, 1);
  }
  expect(vacias).toBeGreaterThan(0);
  expect(conNumero).toBeGreaterThan(0);

  expect(errores).toEqual([]);
});

test('la ronda se dice UNA vez por pantalla: la barra en la sesion, la cabecera en la retencion', async ({ page }) => {
  const errores = capturarErrores(page);
  await abrir(page, 'Rondas express');

  /* Activa: la cuenta la barra, y la cabecera NO la repite. */
  await expect(barra(page)).toHaveAttribute('data-pace-breathe-round', '1');
  await expect(page.locator('[data-pace-breathe-round-label]')).toHaveCount(0);

  /* Retencion: 25 respiraciones de 4 s y una mas para cerrar el ciclo. */
  await segundos(page, 104);
  await expect(page.getByText('RETÉN SIN AIRE')).toBeVisible();

  /* Alli no hay barra —decision del usuario: la retencion es quietud— y por eso
     mismo la ronda vuelve a la cabecera, que es su unica referencia. */
  await expect(barra(page)).toHaveCount(0);
  await expect(page.locator('[data-pace-breathe-round-label]')).toHaveText(/1\s*\/\s*2/);

  expect(errores).toEqual([]);
});
