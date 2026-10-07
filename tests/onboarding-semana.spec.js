/* PACE · «¿Cómo es tu semana?» en la bienvenida (maqueta R2-bienvenida)
 * =====================================================================
 * Ez eligió el 7 de octubre de 2026 que la semana tipo se pregunte una vez, al
 * entrar, y que desde entonces cada mañana el día llegue ya contestado, para
 * todos. Aquí se prueba la pregunta y lo que guarda; el día ya contestado tiene
 * su propio archivo.
 *
 * Lo que se vigila:
 *   · la bienvenida no escribe nada hasta «Comenzar» o «Cada semana es distinta»;
 *   · tocar un día pasa de jornada a media y a libre;
 *   · las horas tocadas se guardan sobre el horario de siempre (`ritmo.horario`);
 *   · «Cada semana es distinta» guarda null: la app sigue como estaba;
 *   · el día se DERIVA de la semana al pintar (ritmoDe), no se escribe.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, RUTA_ARTEFACTO } = require('./helpers');

const BIENVENIDA = '[data-pace-scene-card][role="dialog"]';
const EDITOR = '[data-pace-semana-editor]';

const leer = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2') || 'null'));
const tipos = (page) => page.locator(EDITOR + ' [data-pace-semana-dia]')
  .evaluateAll((els) => els.map((e) => e.getAttribute('data-pace-semana-tipo')));

async function llegarALaSemana(page) {
  await page.goto(RUTA_ARTEFACTO);   // sin sembrar: primera vez de la vida
  await page.locator(BIENVENIDA).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Comenzar' }).click();
  await page.locator(EDITOR).waitFor({ state: 'visible' });
}

test('la bienvenida pregunta la semana: de lunes a viernes jornada, el fin de semana libre', async ({ page }) => {
  const errores = capturarErrores(page);
  await llegarALaSemana(page);

  await expect(page.locator(BIENVENIDA)).toContainText('¿Cómo es tu semana?');
  await expect(page.locator(BIENVENIDA)).toContainText('Toca un día para cambiarlo');
  expect(await tipos(page)).toEqual(['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre']);
  /* La leyenda lleva las horas DENTRO de la frase, como la pregunta del día. */
  await expect(page.locator(EDITOR + ' [data-pace-ritmo-horario="inicio"]')).toHaveCount(1);
  await expect(page.locator(EDITOR + ' [data-pace-ritmo-horario="media.salida"]')).toHaveCount(1);
  await expect(page.locator(EDITOR)).toContainText('sin plan: PACE te deja en paz');

  /* Mirar no escribe: ni la bienvenida ni el borrador tocan lo guardado. */
  await page.locator(EDITOR + ' [data-pace-semana-dia="3"]').click();
  expect(await leer(page)).toBeNull();
  expect(errores).toEqual([]);
});

test('«Comenzar» guarda la semana tocada y las horas, y cierra la bienvenida para siempre', async ({ page }) => {
  const errores = capturarErrores(page);
  await llegarALaSemana(page);

  const dia = (n) => page.locator(EDITOR + ' [data-pace-semana-dia="' + n + '"]');
  await dia(3).click();               // miércoles: jornada → media
  await dia(3).click();               //            media → libre
  await dia(5).click();               // viernes: jornada → media
  await dia(6).click();               // sábado: libre → jornada
  await expect(dia(3)).toHaveAttribute('aria-label', 'miércoles, Libre');
  await page.locator(EDITOR + ' [data-pace-ritmo-horario="inicio"]').selectOption('480');

  await page.locator('[data-pace-semana-guardar]').click();
  await expect(page.locator(BIENVENIDA)).toHaveCount(0);

  const s = await leer(page);
  expect(s.firstSeen).toBeGreaterThan(0);
  expect(s.ritmo.semanaTipo).toEqual(['jornada', 'jornada', 'libre', 'jornada', 'media', 'jornada', 'libre']);
  /* Solo la hora tocada: lo demás sigue sin escribir y lo calcula ritmoDe. */
  expect(s.ritmo.horario).toEqual({ inicio: 480 });

  await page.reload();
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await expect(page.locator(BIENVENIDA)).toHaveCount(0);
  expect((await leer(page)).ritmo.semanaTipo[4]).toBe('media');
  expect(errores).toEqual([]);
});

test('«Cada semana es distinta» guarda que no hay semana y la app sigue como estaba', async ({ page }) => {
  const errores = capturarErrores(page);
  await llegarALaSemana(page);
  await page.locator('[data-pace-semana-saltar]').click();
  await expect(page.locator(BIENVENIDA)).toHaveCount(0);

  const s = await leer(page);
  expect(s.ritmo.semanaTipo).toBeNull();
  expect(s.ritmo.horario == null).toBe(true);   // null es «sin tocar» (ritmoGuardar)
  expect(await page.evaluate(() => ritmoDe(getState()).propuesta)).toBeNull();
  expect(errores).toEqual([]);
});

test('en inglés la pregunta habla inglés', async ({ page }) => {
  await page.goto(RUTA_ARTEFACTO);
  await page.locator(BIENVENIDA).waitFor({ state: 'visible' });
  await page.locator(BIENVENIDA).getByRole('button', { name: 'ES · EN' }).click();
  await page.locator(BIENVENIDA + ' [data-pace-cta]').click();
  await page.locator(EDITOR).waitFor({ state: 'visible' });
  await expect(page.locator(BIENVENIDA)).toContainText("What's your week like?");
  await expect(page.locator(BIENVENIDA)).toContainText('Every week is different');
  await expect(page.locator(EDITOR + ' [data-pace-semana-dia="1"]')).toHaveAttribute('aria-label', 'Monday, Full day');
});

test('a 360 px los siete días caben en una fila y la página no se va de lado', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await llegarALaSemana(page);
  const m = await page.evaluate((sel) => {
    const dias = Array.from(document.querySelectorAll(sel + ' [data-pace-semana-dia]')).map((b) => b.getBoundingClientRect());
    return {
      arriba: dias.map((r) => Math.round(r.top)),
      derecha: Math.max.apply(null, dias.map((r) => r.right)),
      ancho: document.documentElement.clientWidth,
      scrollX: document.documentElement.scrollWidth,
    };
  }, EDITOR);
  expect(new Set(m.arriba).size).toBe(1);
  expect(m.derecha).toBeLessThanOrEqual(m.ancho);
  expect(m.scrollX).toBeLessThanOrEqual(m.ancho);
  await page.locator('[data-pace-semana-guardar]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-pace-semana-guardar]')).toBeInViewport();
});

test('el día sale de la semana al pintar: el martes es jornada, el sábado libre y «distinto» lo calla', async ({ page, context }) => {
  const semana = ['jornada', 'media', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
  await sembrar(context, { ritmo: { semanaTipo: semana } });
  /* Martes 6 de octubre de 2026, 8:30 de la mañana. */
  await page.clock.install({ time: new Date('2026-10-06T08:30:00+02:00') });
  await irAlArtefacto(page);

  const R = () => page.evaluate(() => {
    const r = ritmoDe(getState());
    return { propuesta: r.propuesta, libre: r.libre, diaSemana: r.diaSemana, distinto: r.distinto };
  });
  expect(await R()).toEqual({ propuesta: 'media', libre: false, diaSemana: 2, distinto: false });
  /* Nada se escribió para derivarlo. */
  expect((await leer(page)).ritmo).toEqual({ semanaTipo: semana });

  /* «Hoy es distinto»: hoy no se propone nada, y mañana vuelve. */
  await page.evaluate(() => ritmoDistinto());
  expect((await R()).propuesta).toBeNull();
  expect((await R()).distinto).toBe(true);
});

test('el sábado de la semana es libre sin escribir nada', async ({ page, context }) => {
  await sembrar(context, { ritmo: { semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'] } });
  await page.clock.install({ time: new Date('2026-10-10T10:00:00+02:00') });
  await irAlArtefacto(page);
  const r = await page.evaluate(() => { const x = ritmoDe(getState()); return { libre: x.libre, propuesta: x.propuesta }; });
  expect(r).toEqual({ libre: true, propuesta: null });
  expect((await leer(page)).ritmo.libre).toBeUndefined();
});

test('la hoja «Tu semana» abre con la semana guardada y guarda lo nuevo', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, { ritmo: { semanaTipo: ['media', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'] } });
  await irAlArtefacto(page);
  await page.evaluate(() => ritmoSemanaAbrir());
  const hoja = page.locator('[data-pace-semana-hoja]');
  await hoja.waitFor({ state: 'visible' });
  expect(await tipos(page)).toEqual(['media', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre']);
  await hoja.locator('[data-pace-semana-dia="7"]').click();
  await hoja.locator('[data-pace-semana-guardar]').click();
  await expect(hoja).toHaveCount(0);
  expect((await leer(page)).ritmo.semanaTipo[6]).toBe('jornada');
  expect(errores).toEqual([]);
});
