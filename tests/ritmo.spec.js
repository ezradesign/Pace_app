/* PACE · E2E · A TU RITMO (s192)
 * ================================
 * Una pregunta —«¿cuánto trabajas hoy?»— y PACE sirve la jornada: bloques de foco
 * y pausas con nombre. Ocupa el sitio de Actividades y del Camino sugerido.
 *
 * QUE DEFIENDE, de dentro a fuera:
 *  · la REGLA, en puro (`ritmoComponer`): la comida a su hora exacta, el día
 *    contiguo y dentro de la salida, sin colas de menos de 15 min, sin repetir
 *    rutina y sin pasarse de la meta de agua;
 *  · la HOME: la pregunta, elegir, el aro que dice «Bloque 1 de N», el rótulo con
 *    su «Hasta las …» DEBAJO, la barra lateral con la siguiente pausa;
 *  · el DÍA: terminar un bloque hace que la pausa proponga el plato del menú y
 *    que el aro avance;
 *  · las SALIDAS: «Hoy voy por libre» y su vuelta;
 *  · el HORARIO editable dentro de la frase, y llegar tarde;
 *  · el MÓVIL (la lista entera) y el INGLÉS;
 *  · la GEOMETRÍA: con el menú servido la home no pide scroll en los viewports
 *    del usuario, y las etiquetas de la línea no se pisan.
 *
 * TRAMPAS QUE VIVEN AQUI:
 *  · La semilla común (helpers.js) trae la carta SIEMPRE (`ritmo.libre: true`);
 *    aquí se pisa con el `ritmo` de cada prueba.
 *  · Cada pieza del panel existe DOS VECES (escritorio y móvil): se toma la
 *    visible (`filter({ visible: true })`).
 *  · El reloj va a las 9:00 de un jueves; `clock.install` ANTES de `goto`.
 *  · Un `fastForward` grande no abre la pausa: de minuto en minuto (s187).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const NUEVE = new Date(2026, 8, 17, 9, 0, 0);
const FECHA = '2026-09-17';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };

async function abrir(page, context, ritmo, extra, hora) {
  await sembrar(context, Object.assign({ ritmo: ritmo || {} }, extra || {}));
  await page.clock.install({ time: hora || NUEVE });
  await irAlArtefacto(page);
}
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

/* ------------------------------------------------------------------ regla */
test('la regla: comida a su hora, día contiguo, sin colas cortas, sin repetir y sin pasarse de agua', async ({ page, context }) => {
  await abrir(page, context);
  const fallos = await page.evaluate(() => {
    const out = [];
    const horarios = [
      { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 },
      { inicio: 480, comida: 720, comidaDur: 30, salida: 960 },
      { inicio: 600, comida: 810, comidaDur: 90, salida: 1140 },
      { inicio: 720, comida: 840, comidaDur: 60, salida: 1200 },
      { inicio: 540, comida: 840, comidaDur: 60, salida: 1020, ahora: 630 },
    ];
    const pozos = ritmoPozos(getState(), '2026-09-17');
    ['1h', '2h', 'media', 'jornada'].forEach((op) => horarios.forEach((h) => {
      const m = ritmoComponer(op, h, pozos, {}, 8);
      const tag = op + ' ' + JSON.stringify(h);
      let t = m.desde;
      m.items.forEach((it) => { if (it.desde !== t) out.push(tag + ': hueco en ' + it.desde); t = it.desde + it.dur; });
      if (m.hasta > h.salida && op === 'jornada') out.push(tag + ': pasa de la salida (' + m.hasta + ')');
      const comida = m.items.find((it) => it.tipo === 'comida');
      if (comida && comida.desde !== h.comida) out.push(tag + ': la comida no empieza a su hora');
      m.focos.forEach((f) => { if (f.dur < 15) out.push(tag + ': bloque de ' + f.dur + ' min'); });
      const ids = [];
      m.items.forEach((it) => (it.platos || []).forEach((p) => ids.push(p.id)));
      if (new Set(ids).size !== ids.length) out.push(tag + ': repite rutina');
      if (m.vasos > 8) out.push(tag + ': ' + m.vasos + ' vasos');
      if (!m.focos.length) out.push(tag + ': sin bloques');
    }));
    /* El pozo es lo que cabe junto a la mesa: sin aviso, sin suelo, sin material. */
    Object.keys(pozos).forEach((k) => pozos[k].forEach((r) => {
      if (r.safety || r.requiresFloor) out.push('pozo ' + k + ' incluye ' + r.id);
    }));
    if (!pozos.estira.length || !pozos.mueve.length || !pozos.respira.length || !pozos.cierre.length) out.push('algún pozo vacío');
    return out;
  });
  expect(fallos).toEqual([]);
});

/* ------------------------------------------------------------------ home */
test('la home pregunta cuánto trabajas, con el horario en la frase y la hora de fin de cada opción', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrir(page, context);
  await expect(vis(page, '[data-pace-ritmo-estado="pregunta"]')).toHaveCount(1);
  await expect(page.locator('[data-pace-activitybar-grid]'), 'Actividades no debería estar').toHaveCount(0);
  await expect(page.locator('[data-pace-ritmo] .pace-meta').first()).toHaveText('A tu ritmo');
  const chips = vis(page, '[data-pace-ritmo-opcion]');
  await expect(chips).toHaveCount(4);
  await expect(vis(page, '[data-pace-ritmo-opcion="1h"]')).toContainText('Hasta las 10:00');
  await expect(vis(page, '[data-pace-ritmo-opcion="media"]')).toContainText('Hasta las 12:30');
  await expect(vis(page, '[data-pace-ritmo-opcion="jornada"]')).toContainText('Hasta las 17:00');
  await expect(vis(page, 'select[data-pace-ritmo-horario]')).toHaveCount(4);
  await expect(page.locator('[data-pace-dial-label]').first()).toHaveText('Foco manual');
  expect(errores).toEqual([]);
});

/* Lo que separa el panel del borde de su bloque (la «banda» del rótulo). */
const banda = (page) => page.evaluate(() => {
  const caja = document.querySelector('[data-pace-ritmo]').getBoundingClientRect().top;
  return Math.round(document.querySelector('[data-pace-ritmo-panel]').getBoundingClientRect().top - caja);
});

test('elegir la jornada entera: el aro, el rótulo, la barra lateral y la persistencia', async ({ page, context }) => {
  await abrir(page, context);
  const bandaAntes = await banda(page);
  await vis(page, '[data-pace-ritmo-opcion="jornada"]').click();
  await expect(page.locator('[data-pace-dial-label]').first()).toHaveText('Bloque 1 de 9');
  await expect(page.locator('[data-pace-dial-number]').first()).toHaveText('45:00');
  await expect(page.getByRole('button', { name: 'Empezar jornada', exact: true })).toBeVisible();
  const hasta = page.locator('[data-pace-ritmo-hasta]');
  await expect(hasta).toHaveText('Hasta las 17:00');
  /* «A tu ritmo» ARRIBA y la hora DEBAJO (ronda 4). */
  const orden = await page.evaluate(() => {
    const h = document.querySelector('[data-pace-ritmo-hasta]');
    return h.previousElementSibling.getBoundingClientRect().bottom <= h.getBoundingClientRect().top + 1;
  });
  expect(orden, 'la hora no va debajo del nombre').toBe(true);
  /* …y el rótulo SUBE lo que mide la línea nueva: el panel no se mueve dentro de
     su bloque (ronda 4). Sin la compensación, bajaría 15 px. */
  expect(await banda(page), 'el panel se movió al aparecer «Hasta las»').toBe(bandaAntes);
  await expect(page.locator('[data-pace-sidebar-accion]')).toContainText('Siguiente pausa · 9:45');
  const guardado = await page.evaluate(() => getState().ritmo.dia);
  expect(guardado).toMatchObject({ fecha: FECHA, opcion: 'jornada', desde: 540 });
  await page.reload();
  await expect(page.locator('[data-pace-dial-label]').first()).toHaveText('Bloque 1 de 9');
});

test('al terminar un bloque, la pausa propone el plato del menú y el aro avanza', async ({ page, context }) => {
  await abrir(page, context, { dia: JORNADA });
  const plato = await page.evaluate(() => {
    const p = ritmoPlan(getState());
    return ritmoDetras(p.m, p.actual).platos[0].name;
  });
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).click();
  await page.waitForTimeout(250);
  for (let i = 0; i < 50; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
    if (await page.locator('[data-pace-break-shortcut]').count()) break;
  }
  const prop = page.locator('[data-pace-break-prop]');
  await expect(prop).toContainText('A tu ritmo · antídoto a la silla');
  await expect(prop).toContainText(plato);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-pace-dial-label]').first()).toHaveText('Bloque 2 de 9');
  await expect(page.getByRole('button', { name: 'Empezar bloque 2', exact: true })).toBeVisible();
});

test('«Hoy voy por libre» devuelve la carta, y su enlace vuelve a la pregunta', async ({ page, context }) => {
  await abrir(page, context, { dia: JORNADA });
  await vis(page, '[data-pace-ritmo-libre]').first().click();
  await expect(vis(page, '[data-pace-activitybar-grid]')).toHaveCount(1);
  await expect(page.locator('[data-pace-dial-label]').first()).toHaveText('Foco manual');
  const volver = vis(page, '[data-pace-ritmo-volver]');
  await expect(volver).toHaveText('¿Cuánto trabajas hoy? Ponle ritmo al día');
  await volver.click();
  await expect(vis(page, '[data-pace-ritmo-estado="pregunta"]')).toHaveCount(1);
});

test('la hora de salida y la de comer se cambian dentro de la frase', async ({ page, context }) => {
  await abrir(page, context, { dia: JORNADA });
  await vis(page, 'select[data-pace-ritmo-horario="salida"]').selectOption('1080');
  await expect(page.locator('[data-pace-ritmo-hasta]')).toHaveText('Hasta las 18:00');
  await vis(page, 'select[data-pace-ritmo-horario="comida"]').selectOption('780');
  await expect(vis(page, '[data-pace-ritmo-tramo="comida"] [data-pace-ritmo-etiq]')).toContainText('13:00');
  const horario = await page.evaluate(() => getState().ritmo.horario);
  expect(horario).toMatchObject({ salida: 1080, comida: 780 });
});

test('tocar una parada sirve otra rutina del mismo módulo', async ({ page, context }) => {
  await abrir(page, context, { dia: JORNADA });
  const parada = vis(page, '[data-pace-ritmo-parada]').first();
  const antes = await parada.getAttribute('aria-label');
  await parada.click();
  await expect(vis(page, '[data-pace-ritmo-parada]').first()).not.toHaveAttribute('aria-label', antes);
});

test('llegando a las 10:30 el día empieza entonces y en ningún sitio pone «tarde»', async ({ page, context }) => {
  await abrir(page, context, {}, {}, new Date(2026, 8, 17, 10, 30, 0));
  await vis(page, '[data-pace-ritmo-opcion="jornada"]').click();
  const panel = vis(page, '[data-pace-ritmo-estado="menu"]');
  await expect(panel).toContainText('hoy de 10:30 a 17:00');
  expect((await panel.textContent()).toLowerCase()).not.toContain('tarde');
  await expect(page.locator('[data-pace-ritmo-hasta]')).toHaveText('Hasta las 17:00');
});

test('en inglés, la pregunta y el nombre', async ({ page, context }) => {
  await abrir(page, context, {}, { lang: 'en' });
  await expect(page.locator('[data-pace-ritmo] .pace-meta').first()).toHaveText('At your pace');
  await expect(vis(page, '[data-pace-ritmo-estado="pregunta"]')).toContainText('How long are you working today?');
  await vis(page, '[data-pace-ritmo-opcion="jornada"]').click();
  await expect(page.getByRole('button', { name: 'Start the day', exact: true })).toBeVisible();
});

/* ------------------------------------------------------------------ móvil */
test.describe('móvil', () => {
  test.use({ viewport: { width: 360, height: 730 }, isMobile: true, hasTouch: true });

  test('Ahora y Luego con su glifo, y la jornada entera en una lista', async ({ page, context }) => {
    await abrir(page, context, { dia: JORNADA }, { sidebarCollapsed: true });
    const panel = vis(page, '[data-pace-ritmo-estado="menu"]');
    await expect(panel).toContainText('Foco · bloque 1 de 9');
    await expect(panel.locator('.pace-rt-fila .pace-rt-n > .pace-rt-g svg')).toHaveCount(2);
    await vis(page, '[data-pace-ritmo-ver]').click();
    const lista = page.locator('[data-pace-ritmo-lista]');
    await expect(lista).toBeVisible();
    await expect(lista.locator('[data-pace-ritmo-fila="comida"] .pace-rt-eje svg')).toHaveCount(1);
    await expect(lista.locator('[data-pace-ritmo-fila="pausa"]')).toHaveCount(7);
    await page.getByRole('button', { name: 'Listo', exact: true }).click();
    await expect(lista).toHaveCount(0);
  });
});

/* ------------------------------------------------------------------ geometría */
for (const vp of [{ w: 1280, h: 879 }, { w: 1536, h: 714 }, { w: 412, h: 844 }, { w: 360, h: 730 }]) {
  test.describe(vp.w + 'x' + vp.h, () => {
    test.use({ viewport: { width: vp.w, height: vp.h } });
    test('con el menú servido la home no pide scroll y las etiquetas no se pisan', async ({ page, context }) => {
      await abrir(page, context, { dia: JORNADA }, { sidebarCollapsed: vp.w < 769 });
      await expect(page.locator('[data-pace-ritmo-hasta]')).toBeVisible();
      await page.waitForTimeout(900);
      const m = await page.evaluate(() => {
        const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
        const r = Array.from(document.querySelectorAll('[data-pace-ritmo-etiq]'))
          .map((e) => e.getBoundingClientRect()).filter((x) => x.width > 0);
        let solapes = 0;
        for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) {
          if (r[i].right > r[j].left && r[j].right > r[i].left && r[i].bottom > r[j].top && r[j].bottom > r[i].top) solapes++;
        }
        const raiz = getComputedStyle(document.documentElement);
        return { scroll: body.scrollHeight - body.clientHeight, solapes, etiquetas: r.length,
                 corte: parseFloat(raiz.getPropertyValue('--pace-dial-corte')),
                 solape: parseFloat(raiz.getPropertyValue('--pace-activities-overlap')) };
      });
      expect(m.scroll, 'la home pide scroll').toBeLessThanOrEqual(1);
      expect(m.solapes, 'etiquetas que se pisan').toBe(0);
      if (vp.w >= 769) expect(m.etiquetas, 'la línea no pinta sus paradas').toBe(9);
      /* El aro se corta en el canto del PANEL (s184), no en el del horizonte: el motor
         tiene que haberle restado la banda del rótulo (home-geometry.js mide el panel). */
      expect(m.corte, 'el corte del aro no baja hasta el canto del panel').toBeLessThan(m.solape);
    });
  });
}
