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
 *  · RECOLOCAR A MITAD DE DÍA (s194): al empezar un bloque tarde, el resto del día se
 *    recompone desde ahora (la comida a su hora, salgo a mi hora, el hueco del retraso
 *    punteado, lo hecho congelado); llegar antes es empezar; y la regla en puro con
 *    `previos` (numeración, cadencia de la larga, sin repetir, el bloque forzado);
 *  · LA LÍNEA SIGUE AL ARO (s193): el tramo de ahora se rellena con el bloque
 *    (`--pace-bloque`), al acabar «Ahora» es la PARADA —y la barra lateral dice
 *    «Tu pausa»— hasta que empieza el bloque siguiente, tocarla la empieza, y la
 *    frase de la primera vez se va con el primer bloque hecho;
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
 *  · Y esa hora se escribe CON OFFSET: el instante lo calcula Node (huso del
 *    runner) y lo lee el navegador, que la config fija en Europe/Madrid. Un
 *    `new Date(2026, 8, 17, 9, 0)` vale 9:00 en mi maquina y 11:00 en el CI
 *    (runner en UTC), que es como salieron rojas tres pruebas de aqui con la
 *    suite entera verde en local.
 *  · Un `fastForward` grande no abre la pausa: de minuto en minuto (s187).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior } = require('./helpers');

const NUEVE = new Date('2026-09-17T09:00:00+02:00');   /* 9:00 en Madrid (CEST) */
const FECHA = '2026-09-17';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
/* Un bloque hecho y su pausa ABIERTA, sembrados: `cycle` cuenta el bloque y
   `pausa` lo señala. `lastActiveDay` va con el formato del rollover
   (toDateString) para que el relevo de día no ponga `cycle` a cero. */
const CON_PAUSA = { ritmo: { dia: Object.assign({}, JORNADA, { pausa: 1 }) }, cycle: 1,
                    lastActiveDay: 'Thu Sep 17 2026', _historyMigrated: true };

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

/* ------------------------------------------------------- la línea sigue al aro (s193) */
const bloqueDe = (page) => page.evaluate(() => document.querySelector('[data-pace-home-body]').style.getPropertyValue('--pace-bloque'));

test('la línea sigue al aro: el tramo se rellena, al acabar «Ahora» es la parada y empezar el siguiente la cierra', async ({ page, context }) => {
  await abrir(page, context, { dia: JORNADA });
  const linea = vis(page, '[data-pace-ritmo-linea]');
  const tramos = linea.locator('[data-pace-ritmo-tramo="foco"]');
  const parada = linea.locator('[data-pace-ritmo-parada]').first();
  const lateral = page.locator('[data-pace-sidebar]');
  /* antes de empezar: la frase, el tramo encendido y vacío, nada abierto */
  await expect(vis(page, '[data-pace-ritmo-como]')).toBeVisible();
  expect(await bloqueDe(page)).toBe('0');
  await expect(tramos.nth(0)).toHaveClass(/pace-rt-ahora/);
  await expect(parada).not.toHaveClass(/pace-rt-ahora/);
  await expect(lateral).toContainText('Siguiente pausa · 9:45');

  /* corriendo: el relleno mide lo que lleva el bloque (12 de 45, a 96 pasos) */
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).click();
  await page.waitForTimeout(250);
  await page.clock.fastForward(12 * 60 * 1000);
  await page.waitForTimeout(1200);   /* el ::after transiciona en 900 ms */
  const bloque = Number(await bloqueDe(page));
  expect(bloque, '--pace-bloque a los 12 min').toBeGreaterThan(0.25);
  expect(bloque, '--pace-bloque a los 12 min').toBeLessThan(0.29);
  const relleno = await page.evaluate(() => {
    const seg = Array.from(document.querySelectorAll('[data-pace-ritmo-tramo="foco"].pace-rt-ahora')).find((e) => e.offsetParent);
    return parseFloat(getComputedStyle(seg, '::after').width) / seg.getBoundingClientRect().width;
  });
  expect(relleno, 'el tramo no se rellena con el bloque').toBeGreaterThan(0.24);
  expect(relleno, 'el tramo no se rellena con el bloque').toBeLessThan(0.30);

  /* acaba: la pausa propone (como siempre) y detrás AHORA es la parada */
  for (let i = 0; i < 50; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
    if (await page.locator('[data-pace-break-shortcut]').count()) break;
  }
  await page.keyboard.press('Escape');
  await expect(parada).toHaveClass(/pace-rt-ahora/);
  await expect(parada).toContainText('Ahora');
  await expect(parada).toBeEnabled();
  await expect(tramos.nth(0)).toHaveClass(/pace-rt-hecho/);
  await expect(tramos.nth(1)).not.toHaveClass(/pace-rt-ahora/);
  await expect(vis(page, '[data-pace-ritmo-como]')).toHaveCount(0);
  expect(await bloqueDe(page)).toBe('0');
  await expect(lateral).toContainText('Tu pausa · 9:45');
  expect(await page.evaluate(() => getState().ritmo.dia.pausa)).toBe(1);

  /* empezar el bloque 2 la cierra: la parada queda atrás, el tramo 2 es AHORA */
  await page.getByRole('button', { name: 'Empezar bloque 2', exact: true }).click();
  await page.waitForTimeout(250);
  await expect(parada).not.toHaveClass(/pace-rt-ahora/);
  await expect(parada).toBeDisabled();
  await expect(tramos.nth(1)).toHaveClass(/pace-rt-ahora/);
  /* s194 · RECOLOCADO: el bloque 2 se ha empezado a las 9:45, sin esperar la pausa de
     cinco minutos del plan (9:50), así que la línea se recompone desde ahora y la
     siguiente pausa cae a las 10:30, no a las 10:35. La línea dice la verdad. */
  await expect(lateral).toContainText('Siguiente pausa · 10:30');
  expect(await page.evaluate(() => getState().ritmo.dia.pausa)).toBe(null);
  expect(await page.evaluate(() => getState().ritmo.dia.desde), 'la recomposición empieza a las 9:45').toBe(585);
});

/* ------------------------------------------------------- recolocar a mitad de día (s194) */
test('empezar el bloque 2 veinte minutos tarde recoloca el resto del día: comida a su hora, salida igual, retraso punteado', async ({ page, context }) => {
  await abrir(page, context, { dia: JORNADA });
  const antes = await page.evaluate(() => { const p = ritmoPlan(getState()); return { hasta: p.m.hasta, bloques: p.total, paradas: p.m.items.filter((it) => it.tipo === 'pausa').map((it) => it.desde) }; });
  expect(antes.paradas.slice(0, 3)).toEqual([585, 635, 685]);   /* 9:45 · 10:35 · 11:25 */

  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).click();
  await page.waitForTimeout(250);
  for (let i = 0; i < 50; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
    if (await page.locator('[data-pace-break-shortcut]').count()) break;
  }
  await page.keyboard.press('Escape');
  await page.clock.fastForward(25 * 60 * 1000);   /* son las 10:10: veinte minutos tarde para el bloque 2 */
  await page.waitForTimeout(200);
  /* mientras esperas, nada se mueve: recolocar pasa al EMPEZAR */
  expect(await page.evaluate(() => ritmoPlan(getState()).actual.desde)).toBe(590);
  await page.getByRole('button', { name: 'Empezar bloque 2', exact: true }).click();
  await page.waitForTimeout(300);

  const d = await page.evaluate(() => {
    const p = ritmoPlan(getState()), dia = getState().ritmo.dia;
    return { desde: dia.desde, primerBloque: dia.primerBloque, pasado: dia.pasado.map((it) => it.tipo), actual: p.actual.desde, dur: p.actual.dur,
      hasta: p.m.hasta, bloques: p.total, hechos: p.hechos, comida: p.m.items.find((it) => it.tipo === 'comida').desde,
      paradas: p.m.items.filter((it) => it.tipo === 'pausa').map((it) => it.desde), libres: p.m.items.filter((it) => it.tipo === 'libre').map((it) => [it.desde, it.dur]),
      ids: p.m.items.flatMap((it) => (it.platos || []).map((pl) => pl.id)), primerNombre: p.m.items[1].platos[0].name, focoMin: p.m.focoMin };
  });
  expect(d.desde, 'la recomposición empieza a las 10:10').toBe(610);
  expect(d.primerBloque).toBe(45);
  expect(d.pasado, 'lo hecho se congela: el bloque 1 y su pausa').toEqual(['foco', 'pausa']);
  expect(d.actual, 'el bloque 2 empieza a las 10:10, no a las 9:50').toBe(610);
  expect(d.dur, 'y dura lo que marca el aro').toBe(45);
  expect(d.hechos).toBe(1);
  expect(d.paradas.slice(0, 3), 'las paradas se mueven con el bloque').toEqual([585, 655, 705]);   /* 9:45 · 10:55 · 11:45 */
  expect(d.comida, 'la comida sigue a su hora exacta').toBe(840);
  expect(d.hasta, 'sales a tu hora').toBe(1020);
  expect(d.libres, 'el retraso se pinta como margen libre').toContainEqual([590, 20]);
  expect(new Set(d.ids).size, 'nada se repite, tampoco lo ya servido').toBe(d.ids.length);
  expect(d.primerNombre, 'la parada hecha conserva su plato al rehidratarla').toBeTruthy();
  expect(d.focoMin, 'el foco del día cuenta lo hecho').toBeLessThan(antes.bloques * 45);
  /* la línea lo pinta: el hueco punteado y las etiquetas nuevas */
  const linea = vis(page, '[data-pace-ritmo-linea]');
  await expect(linea.locator('[data-pace-ritmo-tramo="libre"]')).toHaveCount(1);
  await expect(linea).toContainText('10:55');
  await expect(page.locator('[data-pace-sidebar]')).toContainText('Siguiente pausa · 10:55');
  /* y sobrevive a la recarga */
  await page.reload();
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  expect(await page.evaluate(() => ritmoPlan(getState()).actual.desde)).toBe(610);
});

test('llegar antes es empezar: a las 8:40 con el plan a las 9:00, el día arranca a las 8:40', async ({ page, context }) => {
  await abrir(page, context, { dia: JORNADA }, {}, new Date('2026-09-17T08:40:00+02:00'));
  expect(await page.evaluate(() => ritmoPlan(getState()).actual.desde)).toBe(540);
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).click();
  await page.waitForTimeout(300);
  const d = await page.evaluate(() => { const p = ritmoPlan(getState()); return { desde: p.m.desde, actual: p.actual.desde, primera: p.m.items[1].desde, hasta: p.m.hasta, pasado: getState().ritmo.dia.pasado }; });
  expect(d.actual).toBe(520);
  expect(d.desde, 'el día empieza cuando empiezas').toBe(520);
  expect(d.primera, 'la primera pausa se adelanta').toBe(565);
  expect(d.hasta).toBe(1020);
  expect(d.pasado, 'sin nada hecho, la historia está vacía').toEqual([]);
});

test('la regla con previos: numeración, cadencia de la larga, sin repetir, bloque forzado y comida ya hecha', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate(() => {
    const pozos = ritmoPozos(getState(), '2026-09-17');
    const h = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
    const entero = ritmoComponer('jornada', h, pozos, {}, 8);
    /* dos bloques y dos pausas hechos; el bloque 3 arranca a las 11:00 con 45 */
    const pasado = entero.items.slice(0, entero.items.indexOf(entero.focos[2]));
    const previos = ritmoPrevios(pasado, 45);
    const resto = ritmoComponer('jornada', Object.assign({}, h, { ahora: 660 }), pozos, {}, 8, previos);
    const primera = resto.items[0], pausa1 = resto.items.find((it) => it.tipo === 'pausa');
    const usados = pasado.flatMap((it) => (it.platos || []).map((p) => p.id));
    const nuevos = resto.items.flatMap((it) => (it.platos || []).map((p) => p.id));
    /* comida ya hecha a las 13:00 (con la hora de comer por delante): no se sirve otra */
    const tarde = ritmoComponer('jornada', Object.assign({}, h, { ahora: 780 }), pozos, {}, 8, Object.assign({}, previos, { comidaHecha: true }));
    /* el bloque forzado CRUZA la hora de comer: se come al acabarlo, no antes */
    const cruza = ritmoComponer('jornada', Object.assign({}, h, { ahora: 810 }), pozos, {}, 8, previos);
    /* opción con presupuesto: 1 h con 25 hechos y el bloque forzado a 35 (el aro dice 35) */
    const hora = ritmoComponer('1h', Object.assign({}, h, { ahora: 600 }), pozos, {}, 8, { bloques: 1, pausas: 1, foco: 25, comidaHecha: false, usados: [], vasos: 0, claves: 1, primerBloque: 35 });
    return {
      previos: { bloques: previos.bloques, pausas: previos.pausas, foco: previos.foco, claves: previos.claves },
      primera: [primera.tipo, primera.desde, primera.dur, primera.n],
      largaEsLaTercera: !!(pausa1 && pausa1.larga),
      repite: nuevos.some((id) => usados.indexOf(id) !== -1),
      claveSigue: pausa1 && pausa1.platos[0].clave,
      tardeSinComida: !tarde.items.some((it) => it.tipo === 'comida'),
      cruzaComida: [cruza.items[0].dur, cruza.items.find((it) => it.tipo === 'comida').desde],
      horaBloques: hora.focos.map((f) => f.dur), horaFoco: hora.focoMin,
      agua: resto.vasos + previos.vasos, previosVasos: previos.vasos,
    };
  });
  expect(r.previos).toEqual({ bloques: 2, pausas: 2, foco: 90, claves: 2 });
  expect(r.primera, 'el bloque forzado: foco, 11:00, 45 min, número 3').toEqual(['foco', 660, 45, 3]);
  expect(r.largaEsLaTercera, 'con dos pausas hechas, la siguiente es la larga').toBe(true);
  expect(r.repite, 'no repite platos ya servidos').toBe(false);
  expect(r.claveSigue, 'las claves de «otra» siguen la numeración').toBe('p3a');
  expect(r.tardeSinComida, 'con la comida hecha no se sirve otra').toBe(true);
  expect(r.cruzaComida, 'el bloque forzado de 45 a las 13:30 acaba a las 14:15, y la comida empieza entonces').toEqual([45, 855]);
  expect(r.horaBloques, 'una hora con 25 hechos: el bloque forzado de 35 y nada más').toEqual([35]);
  expect(r.horaFoco).toBe(60);
  expect(r.previosVasos, 'lo hecho ya sirvió agua').toBeGreaterThan(0);
  expect(r.agua, 'el agua del día no pasa de la meta').toBeLessThanOrEqual(8);
});

test('la pausa abierta sobrevive a la recarga, y tocar la parada empieza su plato por la puerta de siempre', async ({ page, context }) => {
  await abrir(page, context, CON_PAUSA.ritmo, { cycle: 1, lastActiveDay: CON_PAUSA.lastActiveDay, _historyMigrated: true });
  const parada = vis(page, '[data-pace-ritmo-linea]').locator('[data-pace-ritmo-parada]').first();
  await expect(parada).toHaveClass(/pace-rt-ahora/);
  await expect(page.locator('[data-pace-dial-label]').first()).toHaveText('Bloque 2 de 9');
  const plato = await page.evaluate(() => ritmoPlan(getState()).pausa.platos[0].name);
  await parada.click();
  /* el plato es de Estira: entra por el preview de §18.3, como desde la barra lateral */
  const preview = overlaySuperior(page);
  await expect(preview.getByRole('heading', { name: plato })).toBeVisible();
  await expect(preview.getByRole('button', { name: 'Empezar', exact: true })).toBeVisible();
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
  await abrir(page, context, {}, {}, new Date('2026-09-17T10:30:00+02:00'));
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

  test('con la pausa abierta, «Ahora» es la parada y «Luego» el bloque; y en la lista, la parada lleva «ahora»', async ({ page, context }) => {
    await abrir(page, context, CON_PAUSA.ritmo, { sidebarCollapsed: true, cycle: 1, lastActiveDay: CON_PAUSA.lastActiveDay, _historyMigrated: true });
    const panel = vis(page, '[data-pace-ritmo-estado="menu"]');
    const filas = panel.locator('.pace-rt-fila');
    await expect(filas.nth(0)).toContainText('Ahora');
    await expect(filas.nth(0)).toContainText('9:45');
    await expect(filas.nth(0).locator('[data-pace-ritmo-otra]')).toBeVisible();
    await expect(filas.nth(1)).toContainText('Luego');
    await expect(filas.nth(1)).toContainText('Foco · bloque 2 de 9');
    await expect(panel.locator('.pace-rt-mini .pace-rt-punto').first()).toHaveClass(/pace-rt-ahora/);
    await expect(panel.locator('[data-pace-ritmo-como]')).toHaveCount(0);
    await vis(page, '[data-pace-ritmo-ver]').click();
    const lista = page.locator('[data-pace-ritmo-lista]');
    await expect(lista.locator('[data-pace-ritmo-fila="pausa"]').first()).toContainText('ahora');
    await expect(lista.locator('.pace-rt-tramo').first()).toHaveClass(/pace-rt-pasado/);
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
