/* PACE · tests/respira-musica.spec.js
   =====================================
   LA MÚSICA DE RESPIRA RESPIRA CON EL EJERCICIO. Lo que defiende:

   · QUE CADA TÉCNICA SUENE CON SU RECETA. Las recetas viven en
     `PACE_MUSICA_TECNICA`; aquí se cruza lo que suena con esa tabla, así que
     cambiar una receta no pone esto rojo y romper el camino sí. Y que la tabla
     cubra el catálogo entero: una técnica nueva sin receta sonaría con el drone
     de su familia sin que nadie lo decidiera.
   · QUE SE ABRA AL INHALAR Y SE CIERRE AL EXHALAR, en fase con lo que pone la
     pantalla. Se mira el paso-bajo de la envolvente al cambiar de fase: al
     acabar la inhalación tiene que estar abierto y al acabar la exhalación,
     cerrado. Si `playPhaseSound` deja de llamar a `fase()`, o la primera
     inhalación se pierde porque llegó antes que los drones, se queda quieto.
   · LO QUE SOLO TIENEN ALGUNAS: Nadi Shodhana se inclina hacia el lado por el
     que se respira y el Suspiro abre en dos peldaños.
   · QUE CON CICLOS CORTOS SE QUEDE QUIETA (Rondas, Bhastrika, Kapalabhati).
   · QUE CONVIVA CON LO DEMÁS: Coherente 432 suena con su drone y sin música;
     la pausa calla la música y, al reanudar, la fase en curso la sigue
     abriendo; al salir de la sesión la música se apaga.

   NO CUBRE: si se OYE ni cómo suena. Playwright no escucha; lo que se mira son
   los parámetros que mueve la app (`paceMusica.estado()`). El volumen de cada
   receta lo mide `docs/traspaso/archivos/musica-respira/por-tecnica/construir.js`. */
const { test, expect } = require('@playwright/test');
const { sembrarPisando, irAlArtefacto } = require('./helpers');

test.beforeEach(async ({ context }) => {
  await sembrarPisando(context, { soundOn: true, musicOn: true, ambientOn: false });
});

async function empezar(page, rutina) {
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: rutina, exact: true }).click();
  const modal = page.getByRole('dialog');
  if (await modal.getByRole('button', { name: 'Empezar sesión' }).count()) {
    await modal.getByText('Lo he leído y asumo mi responsabilidad').click();
    await modal.getByRole('button', { name: 'Empezar sesión' }).click();
  }
  await page.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' }).click();
  await expect(page.locator('[data-pace-breathe-phase]')).toBeVisible();
  /* Los drones se descargan y se descodifican: la música entra cuando están. */
  await expect.poll(() => page.evaluate(() => paceMusica.ultimo.motivo), { timeout: 10_000 }).toMatch(/sonando|Coherente 432/);
}

const estado = (page) => page.evaluate(() => paceMusica.estado());

test('cada técnica de Respira tiene su receta, con drones que existen', async ({ page }) => {
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const ids = [];
    Object.values(BREATHE_ROUTINES).forEach((g) => g.items.forEach((x) => { if (!x.drone) ids.push(x.id); }));
    const tabla = PACE_MUSICA_TECNICA;
    const sinReceta = ids.filter((id) => !tabla[id]);
    const sobran = Object.keys(tabla).filter((id) => ids.indexOf(id) < 0);
    const sinDrone = Object.keys(tabla).filter((id) => !PACE_MUSICA_BASES[tabla[id].base] || (tabla[id].voz2 && !PACE_MUSICA_BASES[tabla[id].voz2.base]));
    const sinAjuste = Object.keys(tabla).filter((id) => typeof tabla[id].ajusteDb !== 'number');
    return { n: ids.length, sinReceta, sobran, sinDrone, sinAjuste };
  });
  expect(r.n).toBe(19);
  expect(r.sinReceta, 'técnicas sin receta').toEqual([]);
  expect(r.sobran, 'recetas de técnicas que ya no existen').toEqual([]);
  expect(r.sinDrone, 'recetas con un drone que no está en PACE_MUSICA_BASES').toEqual([]);
  expect(r.sinAjuste, 'recetas sin su ajuste de volumen medido').toEqual([]);
});

test('un ejercicio de ciclo fijo suena con su receta, abre al inhalar y cierra al exhalar', async ({ page }) => {
  test.setTimeout(45_000);
  await empezar(page, 'Exhalación 4·6');
  const fase = page.locator('[data-pace-breathe-phase]');
  const r = await page.evaluate(() => ({ ultimo: paceMusica.ultimo, esperado: PACE_MUSICA_BASES[PACE_MUSICA_TECNICA['breathe.exhale.46'].base] }));
  expect(r.ultimo.src).toBe(r.esperado);
  expect(r.ultimo.receta).toBe('breathe.exhale.46');
  expect(r.ultimo.respira).toBe(true);

  await expect(fase).toHaveText(/^Exhala/, { timeout: 8_000 });
  const lleno = await estado(page);
  await expect(fase).toHaveText(/^Inhala/, { timeout: 10_000 });
  const vacio = await estado(page);
  expect(lleno.brilloHz, 'al acabar de inhalar el filtro está abierto').toBeGreaterThan(lleno.abiertoHz * 0.8);
  expect(vacio.brilloHz, 'al acabar de exhalar el filtro está cerrado').toBeLessThan(vacio.cerradoHz * 1.5);
});

test('una técnica que cambia de nota suena con su drone y su transposición', async ({ page }) => {
  await empezar(page, 'Box 6·6·6·6');
  const e = await estado(page);
  expect(e.receta).toBe('breathe.box.6');
  expect(e.base).toBe('calido');
  expect(e.ratio).toBeCloseTo(2 / 3, 5);
});

test('Nadi Shodhana se inclina hacia el lado por el que se respira', async ({ page }) => {
  test.setTimeout(60_000);
  await empezar(page, 'Nadi Shodhana');
  const fase = page.locator('[data-pace-breathe-phase]');
  /* Un ciclo entero antes de medir, por si los drones llegaron a media fase. */
  await expect(fase).toHaveText(/^Exhala izq/, { timeout: 25_000 });
  await expect(fase).toHaveText(/^Sostén/, { timeout: 10_000 });
  const izq = await estado(page);
  await expect(fase).toHaveText(/^Inhala dcha/, { timeout: 10_000 });
  const dcha = await estado(page);
  expect(izq.pan, 'tras inhalar por la izquierda').toBeLessThan(-0.3);
  expect(dcha.pan, 'tras exhalar por la derecha').toBeGreaterThan(0.3);
});

test('el Suspiro abre en dos peldaños: la primera inhalación se queda a medias', async ({ page }) => {
  test.setTimeout(45_000);
  await empezar(page, 'Suspiro fisiológico');
  const fase = page.locator('[data-pace-breathe-phase]');
  await expect(fase).toHaveText(/^Exhala/, { timeout: 8_000 });
  await expect(fase).toHaveText(/^Inhala más/, { timeout: 12_000 });
  const peldano = await estado(page);
  await expect(fase).toHaveText(/^Exhala/, { timeout: 4_000 });
  const arriba = await estado(page);
  const medio = peldano.cerradoHz * Math.pow(peldano.abiertoHz / peldano.cerradoHz, 0.8);
  expect(peldano.brilloHz, 'tras la primera inhalación, a 0,8').toBeGreaterThan(medio * 0.85);
  expect(peldano.brilloHz).toBeLessThan(medio * 1.15);
  expect(arriba.brilloHz, 'tras «Inhala más», abierto del todo').toBeGreaterThan(arriba.abiertoHz * 0.9);
});

test('con ciclos cortos la música suena quieta y abierta', async ({ page }) => {
  await empezar(page, 'Rondas express');
  const a = await estado(page);
  expect(a.respira).toBe(false);
  await page.waitForTimeout(2_500);
  const b = await estado(page);
  expect([a.brilloHz, b.brilloHz]).toEqual([a.abiertoHz, a.abiertoHz]);
});

test('Coherente 432 suena con su drone y sin música, aunque el fondo sea Música', async ({ page }) => {
  await empezar(page, 'Coherente 432');
  const r = await page.evaluate(() => ({ ultimo: paceMusica.ultimo, musica: paceMusica.isActive(), drone: ambientDrone.isActive() }));
  expect(r.ultimo.motivo).toMatch(/Coherente 432/);
  expect(r.musica).toBe(false);
  expect(r.drone).toBe(true);
});

test('la pausa calla la música y, al reanudar, la inhalación sigue abriéndola', async ({ page }) => {
  test.setTimeout(45_000);
  await empezar(page, 'Exhalación 4·6');
  const fase = page.locator('[data-pace-breathe-phase]');
  /* Una inhalación que empieza de cero: se pausa a 1 s de empezar. */
  await expect(fase).toHaveText(/^Exhala/, { timeout: 8_000 });
  await expect(fase).toHaveText(/^Inhala/, { timeout: 10_000 });
  await page.waitForTimeout(1_000);
  await page.keyboard.press(' ');
  await expect.poll(async () => { const e = await estado(page); return e.pausada && e.volumen < 0.001 && e.fuentes === 0; }).toBe(true);
  await page.waitForTimeout(2_000);
  await page.keyboard.press(' ');
  await expect.poll(async () => { const e = await estado(page); return !e.pausada && e.fuentes > 0; }).toBe(true);
  await expect(fase).toHaveText(/^Exhala/, { timeout: 8_000 });
  const lleno = await estado(page);
  expect(lleno.brilloHz, 'tras la pausa, la inhalación acaba con el filtro abierto').toBeGreaterThan(lleno.abiertoHz * 0.8);
});

test('al salir de la sesión la música se apaga', async ({ page }) => {
  await empezar(page, 'Exhalación 4·6');
  expect(await page.evaluate(() => paceMusica.isActive())).toBe(true);
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => paceMusica.isActive())).toBe(false);
  await expect.poll(() => page.evaluate(() => paceMusica.estado().activa)).toBe(false);
});
