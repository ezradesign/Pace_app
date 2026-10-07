/* PACE · tests/respira-musica.spec.js
   =====================================
   LA MÚSICA DE RESPIRA RESPIRA CON EL EJERCICIO. Lo que defiende:

   · QUE CADA FAMILIA SUENE CON SU DRONE. El reparto vive en `PACE_MUSICA`; aquí
     se cruza el archivo que suena con esa tabla, así que cambiar el reparto no
     pone esto rojo y romper el camino sí.
   · QUE SE ABRA AL INHALAR Y SE CIERRE AL EXHALAR, en fase con lo que pone la
     pantalla. Se mira el paso-bajo de la envolvente al cambiar de fase: al
     acabar la inhalación tiene que estar abierto y al acabar la exhalación,
     cerrado. Si `playPhaseSound` deja de llamar a `fase()`, o la primera
     inhalación se pierde porque llegó antes que la música, se queda quieto.
   · QUE CON CICLOS CORTOS SE QUEDE QUIETA (Rondas, Bhastrika, Kapalabhati).

   NO CUBRE: si se OYE ni cómo suena. Playwright no escucha; lo que se mira son
   los parámetros que mueve la app. */
const { test, expect } = require('@playwright/test');
const { sembrarPisando, irAlArtefacto } = require('./helpers');

test.beforeEach(async ({ context }) => {
  await sembrarPisando(context, { soundOn: true, musicOn: true, ambientOn: false });
  /* La envolvente es privada de `paceMusica`. Su filtro es el primero que se
     crea después de colgar un elemento <audio> del contexto; los demás paso-bajo
     de la app (los timbres) no cuentan. */
  await context.addInitScript(() => {
    window.__filtroMusica = null;
    let tras = false;
    const fuente = AudioContext.prototype.createMediaElementSource;
    AudioContext.prototype.createMediaElementSource = function (el) { tras = true; return fuente.call(this, el); };
    const crear = AudioContext.prototype.createBiquadFilter;
    AudioContext.prototype.createBiquadFilter = function () {
      const f = crear.call(this);
      if (tras) { window.__filtroMusica = f; tras = false; }
      return f;
    };
  });
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
}

const brillo = (page) => page.evaluate(() => (window.__filtroMusica ? window.__filtroMusica.frequency.value : null));

test('un ejercicio de ciclo fijo abre la música al inhalar y la cierra al exhalar', async ({ page }) => {
  test.setTimeout(45_000);
  await empezar(page, 'Exhalación 4·6');
  const fase = page.locator('[data-pace-breathe-phase]');
  const r = await page.evaluate(() => ({ ultimo: paceMusica.ultimo, esperado: PACE_MUSICA_BASES[PACE_MUSICA.REL] }));
  expect(r.ultimo.motivo, JSON.stringify(r.ultimo)).toBe('sonando');
  expect(r.ultimo.src).toBe(r.esperado);
  expect(r.ultimo.respira).toBe(true);

  await expect(fase).toHaveText(/^Exhala/, { timeout: 8_000 });
  const lleno = await brillo(page);
  await expect(fase).toHaveText(/^Inhala/, { timeout: 10_000 });
  const vacio = await brillo(page);
  const cfg = await page.evaluate(() => PACE_MUSICA_RESPIRA);
  expect(lleno, 'al acabar de inhalar el filtro está abierto').toBeGreaterThan(cfg.abiertoHz * 0.8);
  expect(vacio, 'al acabar de exhalar el filtro está cerrado').toBeLessThan(cfg.cerradoHz * 1.5);
});

test('con ciclos cortos la música suena quieta y abierta', async ({ page }) => {
  await empezar(page, 'Rondas express');
  const ultimo = await page.evaluate(() => paceMusica.ultimo);
  expect(ultimo.motivo, JSON.stringify(ultimo)).toBe('sonando');
  expect(ultimo.respira).toBe(false);
  const a = await brillo(page);
  await page.waitForTimeout(2_500);
  const b = await brillo(page);
  const abierto = await page.evaluate(() => PACE_MUSICA_RESPIRA.abiertoHz);
  expect([a, b]).toEqual([abierto, abierto]);
});
