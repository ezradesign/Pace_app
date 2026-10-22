/* PACE · E2E · LAS PAUSAS CON BLOQUES CORTOS (Ez, 22 oct. 2026: 4a A · 4b A · 4c A y 5a A)
 * ====================================================================================
 * Con el aro a 5, 10 o 15 los bloques se juntan hasta media hora (ritmo-juntos.spec.js).
 * Entre medias, al acabar el bloque que llega a 15 min de foco seguido, el aro invita:
 * «Un momento para moverte», con «Hacerla» y «Seguir» (4a con el texto de 5a). Si detrás
 * del bloque va la pausa con rutina, no hay invitación.
 * 4b: con el día empezado, la línea del aro elige «Ejercicio a mi ritmo» (lo de arriba,
 * por defecto) o «después de cada bloque» (una pausa con rutina tras cada bloque, sin
 * invitaciones). En la home con los módulos, sin día, no sale.
 * 4c: sin día vale la misma regla, con lo último que elegiste: hoy, sin día, la ventana de
 * la pausa salía tras cada bloque, también con el aro a 5.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const visible = (page, sel) => page.locator(sel).filter({ visible: true });

async function abrir(page, context, { dia, minutos, extra } = {}) {
  await sembrar(context, Object.assign({ ritmo: { horario: HORARIO }, focusMinutes: minutos || 10 }, extra || {}));
  await page.clock.install({ time: new Date('2026-10-22T09:00:00+02:00') });
  await irAlArtefacto(page);
  if (dia) {
    await page.evaluate(() => ritmoElegir('jornada'));
    await page.evaluate((m) => setState({ focusMinutes: m }), minutos || 10);
  }
}

/* Un bloque entero con el aro: empezar, dejar que acabe y mirar qué queda. */
async function bloque(page, minutos) {
  await visible(page, '[data-pace-cta]').first().click();
  await page.clock.fastForward(minutos * 60 * 1000 + 2000);
  await page.waitForTimeout(300);
  return {
    ventana: await visible(page, '[data-pace-break-shortcut]').count(),
    invita: await visible(page, '[data-pace-invita]').count(),
    cta: (await visible(page, '[data-pace-cta]').first().textContent()).trim(),
  };
}

const SCROLL = () => {
  const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
  return body ? body.scrollHeight - body.clientHeight : null;
};

test('4a · con el día y el aro a 10, el aro invita al acabar el bloque 2 y no antes; «Seguir» empieza el 3 y tras él llega la pausa', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrir(page, context, { dia: true });
  const b1 = await bloque(page, 10);
  expect(b1).toEqual({ ventana: 0, invita: 0, cta: 'Empezar bloque 2' });

  const b2 = await bloque(page, 10);
  expect(b2).toEqual({ ventana: 0, invita: 1, cta: 'Hacerla' });
  await expect(visible(page, '[data-pace-invita]')).toHaveText('Un momento para moverte');
  await expect(visible(page, '[data-pace-invita-seguir]')).toHaveText('Seguir');

  await visible(page, '[data-pace-invita-seguir]').click();
  await expect(visible(page, '[data-pace-invita]')).toHaveCount(0);
  await expect(visible(page, '[data-pace-cta]')).toHaveText('Pausar');
  await page.clock.fastForward(10 * 60 * 1000 + 2000);
  await page.waitForTimeout(300);
  /* el bloque 3 llega a 30 min: detrás va la pausa con rutina, y entonces no se invita */
  await expect(visible(page, '[data-pace-break-shortcut]')).toHaveCount(1);
  await expect(visible(page, '[data-pace-invita]')).toHaveCount(0);
  expect(errores).toEqual([]);
});

test('4c · sin día, con el aro a 10 y «a mi ritmo», los bloques se juntan: invitación tras el 2 y la ventana de la pausa tras el 3', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrir(page, context, {});
  expect(await page.evaluate(() => ritmoPlan(getState()))).toBeNull();
  expect(await bloque(page, 10)).toEqual({ ventana: 0, invita: 0, cta: 'Empezar otro ciclo' });
  expect(await bloque(page, 10)).toEqual({ ventana: 0, invita: 1, cta: 'Hacerla' });
  await visible(page, '[data-pace-invita-seguir]').click();
  await page.clock.fastForward(10 * 60 * 1000 + 2000);
  await page.waitForTimeout(300);
  await expect(visible(page, '[data-pace-break-shortcut]')).toHaveCount(1);
  await expect(visible(page, '[data-pace-invita]')).toHaveCount(0);
  /* la pausa pone la cuenta a cero: el bloque siguiente vuelve a juntarse */
  await page.keyboard.press('Escape');
  expect(await bloque(page, 10)).toEqual({ ventana: 0, invita: 0, cta: 'Empezar otro ciclo' });
  expect(errores).toEqual([]);
});

test('4c · sin día con el aro a 15: invitación tras el 1 y la ventana tras el 2; con «después de cada bloque», la ventana tras cada bloque y sin invitación', async ({ page, context }) => {
  await abrir(page, context, { minutos: 15 });
  expect(await bloque(page, 15)).toEqual({ ventana: 0, invita: 1, cta: 'Hacerla' });
  await visible(page, '[data-pace-invita-seguir]').click();
  await page.clock.fastForward(15 * 60 * 1000 + 2000);
  await page.waitForTimeout(300);
  await expect(visible(page, '[data-pace-break-shortcut]')).toHaveCount(1);

  await page.evaluate(() => setState({ ejercicioBloques: 'cada' }));
  await page.keyboard.press('Escape');
  const b = await bloque(page, 15);
  expect(b.ventana).toBe(1);
  expect(b.invita).toBe(0);
});

test('4a · la tabla: la invitación sale al acabar el bloque que llega a 15 min seguidos (5 → el 3, 10 → el 2, 15 → el 1) y nunca con la pausa detrás', async ({ page, context }) => {
  await abrir(page, context, {});
  const r = await page.evaluate(() => {
    const out = {};
    [5, 10, 15, 20, 25].forEach((m) => {
      const fila = [];
      let antes = 0;
      for (let n = 1; n <= 8; n++) {
        const despues = antes + m;
        const pausa = !bloquesJuntan(despues, m);
        fila.push(pausa ? 'P' : bloquesInvita(antes, m, pausa) ? 'I' : '·');
        antes = pausa ? 0 : despues;
      }
      out[m] = fila.join('');
    });
    return out;
  });
  expect(r).toEqual({ 5: '··I··P··', 10: '·IP·IP·I', 15: 'IPIPIPIP', 20: 'PPPPPPPP', 25: 'PPPPPPPP' });
});

test('4b · con el día y el aro a 10 parado, la línea del aro elige «Ejercicio a mi ritmo» o «después de cada bloque»; con 25, sin día o en marcha, no sale', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrir(page, context, {});
  /* la home con los módulos, sin día: no sale */
  await expect(visible(page, '[data-pace-bloques-sel]')).toHaveCount(0);

  await page.evaluate(() => ritmoElegir('jornada'));
  await page.evaluate(() => setState({ focusMinutes: 10 }));
  const sel = visible(page, '[data-pace-bloques-sel]');
  await expect(sel).toHaveCount(1);
  await expect(visible(page, '[data-pace-dial-subtitle]')).toContainText('Ejercicio');
  expect(await sel.inputValue()).toBe('ritmo');
  expect(await sel.locator('option').allTextContents()).toEqual(['a mi ritmo', 'después de cada bloque']);

  await sel.selectOption('cada');
  expect(await page.evaluate(() => getState().ejercicioBloques)).toBe('cada');
  /* el día se recompone: una pausa detrás de cada bloque */
  const seguidos = await page.evaluate(() => {
    const p = ritmoPlan(getState());
    let dos = 0;
    p.m.items.forEach((it, i) => { if (it.tipo === 'foco' && p.m.items[i + 1] && p.m.items[i + 1].tipo === 'foco') dos++; });
    return dos;
  });
  expect(seguidos).toBe(0);

  /* con el bloque en marcha no se cambia, y con 25 la línea es la de siempre */
  await visible(page, '[data-pace-cta]').first().click();
  await expect(visible(page, '[data-pace-bloques-sel]')).toHaveCount(0);
  await visible(page, '[data-pace-cta]').first().click();
  await visible(page, '[data-pace-dial-number]').first().waitFor();
  await page.evaluate(() => setState({ focusMinutes: 25 }));
  await expect(visible(page, '[data-pace-bloques-sel]')).toHaveCount(0);
  expect(errores).toEqual([]);
});

test('4b · «después de cada bloque» con el día: la pausa tras cada bloque, sin invitación, y nunca la misma rutina en dos pausas seguidas', async ({ page, context }) => {
  await abrir(page, context, { dia: true, extra: { ejercicioBloques: 'cada' } });
  const r = await page.evaluate(() => {
    const s = getState();
    const out = {};
    [5, 10, 15].forEach((m) => {
      /* con lo hecho vacío, el día se compone con el aro (`bloque`), como al empezar el bloque 1 */
      const p = ritmoMenu(s, 'jornada', {}, 540, [], null, false, m);
      const ids = p.items.filter((it) => it.tipo === 'pausa').map((it) => (it.platos || []).map((pl) => pl.id).join('+'));
      let repetidas = 0;
      ids.forEach((id, i) => { if (i && id === ids[i - 1]) repetidas++; });
      let juntos = 0;
      p.items.forEach((it, i) => { if (it.tipo === 'foco' && p.items[i + 1] && p.items[i + 1].tipo === 'foco') juntos++; });
      out[m] = { pausas: ids.length, repetidas, juntos };
    });
    return out;
  });
  for (const m of [5, 10, 15]) {
    expect(r[m].juntos, 'bloques de ' + m).toBe(0);
    expect(r[m].repetidas, 'bloques de ' + m).toBe(0);
    expect(r[m].pausas, 'bloques de ' + m).toBeGreaterThan(15);
  }
  const b1 = await bloque(page, 10);
  expect(b1.ventana).toBe(1);
  expect(b1.invita).toBe(0);
});

test('sin scroll: la home con la invitación y con la elección del aro, a 360×640 y 360×730, en español y en inglés', async ({ browser }) => {
  for (const lang of ['es', 'en']) for (const height of [640, 730]) {
    const context = await browser.newContext({ viewport: { width: 360, height }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await sembrar(context, { ritmo: { horario: HORARIO }, focusMinutes: 10, lang, langAuto: false, sidebarCollapsed: true });
    await page.clock.install({ time: new Date('2026-10-22T09:00:00+02:00') });
    await irAlArtefacto(page);
    await page.evaluate(() => ritmoElegir('jornada'));
    await page.evaluate(() => setState({ focusMinutes: 10 }));
    await expect(visible(page, '[data-pace-bloques-sel]')).toHaveCount(1);
    await asentarGeometria(page);
    expect(await page.evaluate(SCROLL), lang + ' ' + height + ' con la elección').toBe(0);
    await bloque(page, 10);
    await bloque(page, 10);
    await expect(visible(page, '[data-pace-invita]')).toHaveText(lang === 'es' ? 'Un momento para moverte' : 'A moment to move');
    await asentarGeometria(page);
    expect(await page.evaluate(SCROLL), lang + ' ' + height + ' con la invitación').toBe(0);
    /* «Hacerla · Seguir» caben en la fila, dentro del aro */
    const fila = await page.evaluate(() => {
      const cta = Array.from(document.querySelectorAll('[data-pace-cta]')).find((e) => e.getBoundingClientRect().width > 0);
      const sg = Array.from(document.querySelectorAll('[data-pace-invita-seguir]')).find((e) => e.getBoundingClientRect().width > 0);
      const a = cta.getBoundingClientRect(), b = sg.getBoundingClientRect();
      return { misma: Math.abs(a.top + a.height / 2 - (b.top + b.height / 2)) < 2, dentro: b.right <= window.innerWidth };
    });
    expect(fila, lang + ' ' + height).toEqual({ misma: true, dentro: true });
    await context.close();
  }
});
