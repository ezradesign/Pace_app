/* PACE · E2E · «AUTO» EXPLICA LO QUE CAMBIA (revisión de ChatGPT del 5 nov. 2026; Ez eligió la opción B)
 * =====================================================================================================
 * «Auto» cambia dos cosas a la vez (si los pasos avanzan solos y si las repeticiones llevan cadencia) y se
 * guarda para las sesiones siguientes, pero solo decía «Auto». Ahora, sin añadir nada fijo a la pantalla:
 *   · al tocar el interruptor sale cuatro segundos una nota con lo que acaba de pasar («PACE marca el ritmo
 *     y pasa al siguiente paso.» / «Hazlo a tu ritmo y pulsa › para continuar.») y se va sola;
 *   · al empezar una sesión con «Auto» apagado, «Prepárate» lleva una línea más: «A tu ritmo · tú decides
 *     cuándo seguir.»
 * La nota no empuja nada: el dibujo y el resto de la pantalla miden lo mismo con ella y sin ella, no pide
 * scroll, no se sale de la ventana y no se toca (`pointer-events: none`). Se mide a 360 y a 1280 px de ancho
 * y con poca altura, en español y en inglés.
 *
 * «Empuje sencillo»: dos series de cinco flexiones. El reloj va instalado: `runFor` hace correr los relojes.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const LETRA = {
  es: { on: 'PACE marca el ritmo y pasa al siguiente paso.', off: 'Hazlo a tu ritmo y pulsa › para continuar.', prep: 'A tu ritmo · tú decides cuándo seguir.' },
  en: { on: 'PACE sets the pace and moves on to the next step.', off: 'Go at your own pace and tap › to go on.', prep: 'Your pace · you decide when to go on.' },
};

async function abrirRutina(page, id) {
  await page.getByRole('button', { name: /^(Mueve|Move)/ }).first().click();
  await page.locator('.pace-lib').locator('visible=true').first().waitFor();
  await page.waitForTimeout(500);
  await page.evaluate((i) => [...document.querySelectorAll('[data-pace-lib-card="' + i + '"] .pace-lib-hit')]
    .find((e) => e.getBoundingClientRect().width > 0).click(), id);
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    [...raiz.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /Empezar|Start/i.test(x.textContent || '')).click();
  });
}
const fase = (page) => page.locator('[data-pace-v1-raiz]').getAttribute('data-pace-v1-fase');
async function hasta(page, cond, maxSeg) {
  for (let i = 0; i < (maxSeg || 60); i++) { if (await cond()) return true; await page.clock.runFor(1000); }
  return cond();
}
const pastilla = (page) => page.locator('[data-pace-v1-auto]').filter({ visible: true }).first();
const aviso = (page) => page.locator('[data-pace-v1-auto-aviso]');

/* Lo que se ve de la pantalla: el dibujo, y si algo hace scroll por dentro. */
function medida(page) {
  return page.evaluate(() => {
    const vis = (e) => e.getBoundingClientRect().width > 0;
    const g = document.querySelector('[data-pace-v1-glyph]').getBoundingClientRect();
    const scroll = [...document.querySelectorAll('*')].filter((e) => vis(e) && e.scrollHeight - e.clientHeight > 1 && /(auto|scroll)/.test(getComputedStyle(e).overflowY)).length;
    const mando = document.querySelector('[data-pace-v1-mando]').getBoundingClientRect();
    return { glifo: Math.round(g.width), glifoTop: Math.round(g.top), mandoTop: Math.round(mando.top), scroll, docScroll: document.documentElement.scrollHeight - innerHeight, w: innerWidth, h: innerHeight };
  });
}

test('al empezar con «Auto» apagado, «Prepárate» lleva su línea', async ({ page, context }) => {
  await sembrar(context, { cuerpoAuto: false });
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await abrirRutina(page, 'extra.desk.pushups');
  await page.locator('[data-pace-session-prep]').waitFor();
  await expect(page.locator('[data-pace-v1-prep-auto]')).toHaveText(LETRA.es.prep);
  expect(errores).toEqual([]);
});

test('con «Auto» encendido, «Prepárate» no lleva nada más', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, 'extra.desk.pushups');
  await page.locator('[data-pace-session-prep]').waitFor();
  await expect(page.locator('[data-pace-v1-prep-auto]')).toHaveCount(0);
});

test('tocar «Auto» enseña cuatro segundos lo que acaba de cambiar, y se va sola', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await abrirRutina(page, 'extra.desk.pushups');
  expect(await hasta(page, async () => (await fase(page)) === 'work', 30)).toBe(true);
  await expect(aviso(page), 'sin tocar nada no hay nota').toHaveCount(0);

  await pastilla(page).click();
  await expect(pastilla(page)).toHaveAttribute('aria-pressed', 'false');
  await expect(aviso(page)).toHaveText(LETRA.es.off);
  await expect(aviso(page)).toHaveAttribute('role', 'status');

  /* se va sola: a los 3 s sigue, a los 5 s no */
  await page.clock.runFor(3000);
  await expect(aviso(page)).toHaveCount(1);
  await page.clock.runFor(2000);
  await expect(aviso(page)).toHaveCount(0);

  /* y al encenderlo, la otra frase */
  await pastilla(page).click();
  await expect(pastilla(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(aviso(page)).toHaveText(LETRA.es.on);
  expect(errores).toEqual([]);
});

test('en inglés, las mismas tres líneas', async ({ page, context }) => {
  await sembrar(context, { lang: 'en', cuerpoAuto: false });
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, 'extra.desk.pushups');
  await page.locator('[data-pace-session-prep]').waitFor();
  await expect(page.locator('[data-pace-v1-prep-auto]')).toHaveText(LETRA.en.prep);
  expect(await hasta(page, async () => (await fase(page)) === 'place', 12)).toBe(true);
  await pastilla(page).click();   // Auto, encendido
  await expect(aviso(page)).toHaveText(LETRA.en.on);
  await page.clock.runFor(4500);
  await pastilla(page).click();   // y apagado
  await expect(aviso(page)).toHaveText(LETRA.en.off);
});

/* La nota flota: ni empuja el dibujo ni pide scroll ni se sale ni se toca. A 360 y 1280 px (y a 1920×1080, donde el lienzo escala la app), con la altura de
   un móvil bajo y la de una ventana de portátil baja, en español y en inglés. */
for (const [lang, ancho, alto] of [['es', 360, 730], ['es', 360, 640], ['es', 1280, 800], ['es', 1280, 600], ['es', 1920, 1080], ['en', 360, 640], ['en', 1280, 600]]) {
  test(`la nota no cambia la pantalla ni se sale de ella · ${lang} ${ancho}×${alto}`, async ({ page, context }) => {
    await sembrar(context, { lang });
    await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
    await irAlArtefacto(page);
    await abrirRutina(page, 'extra.desk.pushups');
    expect(await hasta(page, async () => (await fase(page)) === 'work', 30)).toBe(true);
    await page.setViewportSize({ width: ancho, height: alto });
    await page.clock.runFor(300); await page.waitForTimeout(300); await page.clock.runFor(300);

    for (let vez = 0; vez < 2; vez++) {
      const antes = await medida(page);
      await pastilla(page).click();
      await expect(aviso(page)).toHaveCount(1);
      const despues = await medida(page);
      expect(despues, 'con la nota puesta la pantalla mide lo mismo').toEqual(antes);
      expect(despues.scroll + despues.docScroll, 'sin scroll').toBe(0);

      const nota = await aviso(page).evaluate((e) => {
        const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
        return { l: r.left, r: r.right, t: r.top, b: r.bottom, alto: r.height, toque: s.pointerEvents, w: innerWidth };
      });
      expect(nota.l, 'no se sale por la izquierda').toBeGreaterThanOrEqual(8);
      expect(nota.r, 'no se sale por la derecha').toBeLessThanOrEqual(nota.w - 8);
      expect(nota.t, 'queda dentro de la ventana').toBeGreaterThan(0);
      expect(nota.b, 'va por encima del mando').toBeLessThanOrEqual(despues.mandoTop + 1);
      expect(nota.toque, 'no se toca: los botones de debajo siguen vivos').toBe('none');
      await page.clock.runFor(4500);
      await expect(aviso(page)).toHaveCount(0);
      expect(await medida(page), 'y sin ella, igual').toEqual(antes);
    }
  });
}

/* La línea de «Prepárate» cabe en las mismas ventanas: dentro de la ventana, bajo la frase de siempre, sobre el
   botón de empezar y sin scroll. */
for (const [lang, ancho, alto] of [['es', 360, 730], ['es', 360, 640], ['es', 1280, 800], ['es', 1280, 600], ['en', 360, 640], ['en', 1280, 600]]) {
  test(`la línea de «Prepárate» cabe · ${lang} ${ancho}×${alto}`, async ({ page, context }) => {
    await sembrar(context, { lang, cuerpoAuto: false });
    await page.setViewportSize({ width: ancho, height: alto });
    await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
    await irAlArtefacto(page);
    await abrirRutina(page, 'extra.desk.pushups');
    await page.locator('[data-pace-session-prep]').waitFor();
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const caja = (s) => document.querySelector(s).getBoundingClientRect();
      const linea = caja('[data-pace-v1-prep-auto]'); const frase = caja('[data-pace-session-prep-copy]');
      const boton = [...document.querySelectorAll('button')].find((b) => b.getBoundingClientRect().width > 0 && /Empezar ahora|Start now/i.test(b.textContent)).getBoundingClientRect();
      const scroll = [...document.querySelectorAll('*')].filter((e) => e.getBoundingClientRect().width > 0 && e.scrollHeight - e.clientHeight > 1 && /(auto|scroll)/.test(getComputedStyle(e).overflowY)).length;
      return { l: linea.left, r: linea.right, t: linea.top, b: linea.bottom, fraseB: frase.bottom, botonT: boton.top, scroll, w: innerWidth };
    });
    expect(m.l).toBeGreaterThanOrEqual(8);
    expect(m.r).toBeLessThanOrEqual(m.w - 8);
    expect(m.t, 'va bajo la frase de siempre').toBeGreaterThanOrEqual(m.fraseB - 24);
    expect(m.b, 'y sobre el botón de empezar').toBeLessThan(m.botonT);
    expect(m.scroll, 'sin scroll').toBe(0);
  });
}
