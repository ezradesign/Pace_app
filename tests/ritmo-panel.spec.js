/* PACE · E2E · EL PANEL DE «A TU RITMO» EN LOS VIEWPORTS Y LO QUE EL USUARIO VIO (s195)
 * =====================================================================================
 * Hermano de `ritmo.spec.js` (465 ln) y `ritmo-linea.spec.js`. Nace de la auditoría de
 * viewports de s195 (`scripts/audit/auditoria-viewports-s195.js`: 16 viewports × 9-10
 * escenas) y de cuatro capturas del usuario usando la app un sábado.
 *
 * QUE DEFIENDE:
 *  · LA COMIDA SOLO SI EL DÍA LA SIRVE: «Una hora» a las 14:30 decía «comida a las 16:00
 *    durante 30 min». La regla ya lo sabía (`m.comida` null); la frase no lo escuchaba.
 *  · LAS HORAS DE HOY en las opciones que empiezan cuando empiezas: con el inicio habitual
 *    a las 14:30 y el día empezado a las 10:23, la frase decía «de 14:30 a 12:50».
 *  · NINGUNA ETIQUETA SE SALE DEL PANEL: la primera parada de un día recolocado cae junto
 *    al borde y «Cadena posterior de pie» asomaba 37 px fuera del marco.
 *  · LA GOTA VA PEGADA A SU ÚLTIMA PALABRA (móvil): un inline-grid es un átomo para el
 *    partido de líneas y caía sola en la línea de abajo.
 *  · EN UNA TABLETA VERTICAL (820 px, piel de escritorio) manda la copia compacta del
 *    panel: la línea con nueve paradas no cabía ni en tres niveles.
 *  · POR LIBRE, LOS CUATRO CHIPS CABEN a 1024 y a 820: «Hidrátate» asomaba por la derecha.
 *  · CON LA JORNADA CERRADA LA HOME NO ARRASTRA: el aro crece y la caja del limbo de la
 *    luz sobresalía 38 px (el motor de geometría mide ahora también la luz).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const VIE = 'Fri Sep 18 2026';
const HOY = '2026-09-18';
const SABADO = new Date('2026-09-19T14:30:00+02:00');
const HORARIO_TARDE = { inicio: 870, comida: 960, comidaDur: 30, salida: 1140 };   /* 14:30 · 16:00 · 19:00 */

async function abrir(page, context, extra, hora) {
  await sembrar(context, extra);
  await page.clock.install({ time: hora });
  await irAlArtefacto(page);
  await page.waitForTimeout(600);
}
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

/* Si se puede arrastrar, hay scroll; si no, no lo hay (home-geometria.spec.js). */
const ARRASTRABLE = () => {
  const b = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
  const antes = b.scrollTop; b.scrollTop = 9999; const real = b.scrollTop; b.scrollTop = antes; return real;
};

test('«Una hora» a las 14:30 no habla de comida y dice las horas de hoy', async ({ page, context }) => {
  await abrir(page, context, { ritmo: { horario: HORARIO_TARDE, dia: { fecha: '2026-09-19', opcion: '1h', desde: 870, cicloBase: 0, cambios: {} } } }, SABADO);
  const panel = vis(page, '[data-pace-ritmo-estado="menu"]');
  await expect(panel).toContainText('Una hora · de 14:30 a 15:30');
  await expect(panel).not.toContainText('comida');
  expect(await page.evaluate(() => ritmoPlan(getState()).m.comida), 'GUARD: la regla no sirve comida en una hora a las 14:30').toBeNull();
  /* s197: NI CON LA COMIDA DENTRO DE LA VENTANA. Hasta v0.128.1, poner la comida a las
     15:00 hacía que «Una hora» la sirviera y el día se alargaba una hora. Decisión del
     usuario: «así la comida solo iría en jornada completa». La hora se sigue editando. */
  await page.evaluate(() => ritmoHorario('comida', 900));   /* 15:00 */
  await expect(panel).not.toContainText('comida a las');
  await expect(panel).toContainText('Una hora · de 14:30 a 15:30');
  expect(await page.evaluate(() => ritmoPlan(getState()).m.comida), 'la comida cae dentro y aun así no se sirve').toBeNull();
  expect(await page.evaluate(() => getState().ritmo.horario.comida), 'pero la hora queda guardada para la jornada entera').toBe(900);
});

test.describe('móvil', () => {
  test.use({ viewport: { width: 360, height: 730 }, isMobile: true, hasTouch: true });
  test('la frase compacta tampoco habla de comida, y la gota va pegada a su última palabra', async ({ page, context }) => {
    /* la tarde del usuario: «Una hora» desde las 17:20, bloque 2 recolocado a las 19:30; «Luego» es el
       cierre («2 min · Respira · Para cerrar la jornada» + gota), que a 360 px cabe justo y la gota caía sola */
    await abrir(page, context, { sidebarCollapsed: true, cycle: 1, lastActiveDay: VIE, _historyMigrated: true,
      ritmo: { horario: { inicio: 780, comida: 960, comidaDur: 30, salida: 1140 }, dia: { fecha: HOY, opcion: '1h', desde: 1170, cicloBase: 0, cambios: {}, primerBloque: 25,
        pasado: [{ tipo: 'foco', desde: 1040, dur: 25 }, { tipo: 'pausa', desde: 1065, dur: 5, motivo: 'silla', platos: [{ modulo: 'estira', id: 'move.hamstrings.standing', name: 'Cadena posterior de pie', min: 4, clave: 'p1' }] }] } } },
      new Date('2026-09-18T19:31:00+02:00'));
    const panel = vis(page, '[data-pace-ritmo-estado="menu"]');
    await expect(panel).toContainText('De 17:20 a 20:00');
    await expect(panel).not.toContainText('comida');
    const g = await page.evaluate(() => {
      const fila = Array.from(document.querySelectorAll('.pace-rt-mov .pace-rt-fila')).find((f) => f.querySelector('.pace-rt-gota'));
      if (!fila) return null;
      const m = fila.querySelector('.pace-rt-m'), gota = fila.querySelector('.pace-rt-gota');
      const r = document.createRange(); r.selectNodeContents(m); const lineas = r.getClientRects();
      return { desdeElBorde: gota.getBoundingClientRect().left - m.getBoundingClientRect().left, lineas: lineas.length };
    });
    expect(g, 'GUARD: ninguna fila lleva gota').not.toBeNull();
    expect(g.desdeElBorde, 'la gota está sola al principio de una línea').toBeGreaterThan(30);
  });
});

test('empezado antes de la hora habitual, la frase dice las horas de hoy y no las del horario', async ({ page, context }) => {
  /* el usuario: inicio habitual 14:30, «Dos horas» empezada a las 10:23 («llegar antes es
     empezar»: `pasado: []` es lo que deja el primer «Empezar») → decía «de 14:30 a 12:50» */
  await abrir(page, context, { ritmo: { horario: HORARIO_TARDE, dia: { fecha: '2026-09-19', opcion: '2h', desde: 623, cicloBase: 0, cambios: {}, pasado: [], primerBloque: 25 } } }, new Date('2026-09-19T10:23:00+02:00'));
  const panel = vis(page, '[data-pace-ritmo-estado="menu"]');
  expect(await page.evaluate(() => ritmoPlan(getState()).m.desde), 'GUARD: el día no empieza a las 10:23').toBe(623);
  await expect(panel).toContainText('Dos horas · de 10:23 a ');
  await expect(panel).not.toContainText('14:30');
  await expect(panel).not.toContainText('hoy de');
});

test('ninguna etiqueta de la línea se sale del panel, ni con la primera parada pegada al borde', async ({ page, context }) => {
  /* la historia del usuario: un bloque de 4 min y su pausa, congelados; luego el hueco y el bloque
     de ahora. La parada queda a un 3 % de la línea y su etiqueta, centrada, se salía por la izquierda. */
  await abrir(page, context, { cycle: 1, lastActiveDay: VIE, _historyMigrated: true,
    ritmo: { dia: { fecha: HOY, opcion: '2h', desde: 660, cicloBase: 0, cambios: {}, primerBloque: 25,
      pasado: [{ tipo: 'foco', desde: 621, dur: 2 }, { tipo: 'pausa', desde: 623, dur: 4, motivo: 'silla', platos: [{ modulo: 'estira', id: 'move.hamstrings.standing', name: 'Cadena posterior de pie', min: 4, clave: 'estira' }] }] } } },
    new Date('2026-09-18T11:00:00+02:00'));
  const m = await page.evaluate(() => {
    const panel = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="menu"]')).find((e) => e.getBoundingClientRect().width > 0);
    /* el marco es la LÍNEA con 16 px de aire (dentro del padding del panel): la regla del empuje */
    const lr = panel.querySelector('[data-pace-ritmo-linea]').getBoundingClientRect();
    const p = { left: lr.left - 16, right: lr.right + 16 };
    const etiq = Array.from(panel.querySelectorAll('[data-pace-ritmo-etiq]')).map((e) => e.getBoundingClientRect());
    const primera = panel.querySelector('[data-pace-ritmo-parada]').getBoundingClientRect();
    let pisadas = 0;
    for (let i = 0; i < etiq.length; i++) for (let j = i + 1; j < etiq.length; j++) {
      if (etiq[i].right > etiq[j].left && etiq[j].right > etiq[i].left && etiq[i].bottom > etiq[j].top && etiq[j].bottom > etiq[i].top) pisadas++;
    }
    return { n: etiq.length, fuera: etiq.filter((r) => r.left < p.left - 0.5 || r.right > p.right + 0.5).length, pisadas,
             primeraCerca: primera.left - lr.left };
  });
  expect(m.n, 'GUARD: la línea no pinta etiquetas').toBeGreaterThan(2);
  expect(m.primeraCerca, 'GUARD: la primera parada tiene que estar pegada al borde para que su etiqueta quiera salirse').toBeLessThan(40);
  expect(m.fuera, 'etiquetas que se salen del marco de la línea (16 px de aire)').toBe(0);
  expect(m.pisadas, 'etiquetas que se pisan tras empujarlas').toBe(0);
});

/* s195b puso aquí que a 820x1100 la piel era la de ESCRITORIO y el panel se veía en su
   copia compacta por un container query (al panel le quedaban 460 px). s197 (v0.130.0)
   cambia la premisa por decisión del usuario: una vertical de hasta 1024 lleva la PIEL
   DE MÓVIL entera. La copia compacta sigue siendo la que manda —ahora porque es la de su
   piel, no por el container query— y eso es lo que se sigue asertando. */
test.describe('tableta en vertical (820x1100, piel de móvil desde v0.130.0)', () => {
  test.use({ viewport: { width: 820, height: 1100 } });
  test('manda la copia compacta del panel y nada se pisa', async ({ page, context }) => {
    await abrir(page, context, { ritmo: { dia: { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } }, new Date('2026-09-18T09:00:00+02:00'));
    const m = await page.evaluate(() => ({
      piel: getComputedStyle(document.documentElement).getPropertyValue('--pace-skin').trim(),
      esc: Array.from(document.querySelectorAll('.pace-rt-esc')).some((e) => e.getBoundingClientRect().width > 0),
      mov: Array.from(document.querySelectorAll('.pace-rt-mov')).some((e) => e.getBoundingClientRect().width > 0),
      columna: (() => { const a = Array.from(document.querySelectorAll('[data-pace-sidebar-accion]')).find((e) => e.getBoundingClientRect().width > 0); return !!(a && a.getBoundingClientRect().left < 300); })(),
    }));
    expect(m.piel, 'GUARD: a 820 px en vertical la piel es la de móvil (v0.130.0)').toBe('movil');
    expect(m.columna, 'y por tanto la barra lateral es cajón, no columna').toBe(false);
    expect(m.mov, 'se muestra la copia compacta').toBe(true);
    expect(m.esc, 'y no la de escritorio').toBe(false);
    await expect(vis(page, '[data-pace-ritmo-estado="menu"]')).toContainText('Foco · bloque 1 de 9');
  });
});

/* s197: 820x1100 se mudó a la piel de móvil, donde la barra lateral es un cajón y no
   deja borde izquierdo que mirar; el chequeo de que los chips caben se hace contra el
   viewport, y el de «no los pisa la columna» solo donde hay columna. 1024x650 (apaisada)
   sigue en escritorio y sigue midiendo las dos cosas. */
for (const vp of [{ w: 1024, h: 650, columna: true }, { w: 820, h: 1100, columna: false }]) {
  test.describe('por libre a ' + vp.w + 'x' + vp.h, () => {
    test.use({ viewport: { width: vp.w, height: vp.h }, isMobile: !vp.columna, hasTouch: !vp.columna });
    test('los cuatro chips de Actividades caben en la home', async ({ page, context }) => {
      await abrir(page, context, { ritmo: { libre: true } }, new Date('2026-09-18T09:00:00+02:00'));
      const m = await page.evaluate(() => {
        const sbEl = Array.from(document.querySelectorAll('[data-pace-sidebar]')).find((e) => e.getBoundingClientRect().width > 0);
        const sb = sbEl ? sbEl.getBoundingClientRect() : null;
        const chips = Array.from(document.querySelectorAll('[data-pace-activitybar-chip]')).map((e) => e.getBoundingClientRect());
        return { n: chips.length, columna: !!(sb && sb.left < 10 && sb.width > 200),
                 fuera: chips.filter((r) => r.right > innerWidth + 1 || r.left < -1).length,
                 pisados: sb && sb.left < 10 && sb.width > 200 ? chips.filter((r) => r.left < sb.right - 1).length : 0 };
      });
      expect(m.n, 'GUARD: no hay chips').toBe(4);
      expect(m.columna, 'GUARD: la piel de este viewport es la esperada').toBe(vp.columna);
      expect(m.fuera, 'chips que asoman fuera de la home').toBe(0);
      expect(m.pisados, 'chips que la columna de la barra lateral tapa').toBe(0);
    });
  });
}

for (const vp of [{ w: 1536, h: 704 }, { w: 1366, h: 657 }]) {
  test.describe('jornada cerrada a ' + vp.w + 'x' + vp.h, () => {
    test.use({ viewport: { width: vp.w, height: vp.h } });
    test('la home no arrastra: la luz cabe donde cabe el aro', async ({ page, context }) => {
      await abrir(page, context, { cycle: 9, lastActiveDay: VIE, _historyMigrated: true, ritmo: { dia: { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } }, new Date('2026-09-18T17:10:00+02:00'));
      await expect(vis(page, '[data-pace-ritmo-estado="hecho"]')).toBeVisible();
      expect(await page.evaluate(ARRASTRABLE), 'la home hace scroll vertical con la jornada cerrada').toBe(0);
    });
  });
}

/* ------------------------------------------------------------------ comer o no (s195c, 6C) */
test('el interruptor de la comida: apagado, la frase se acorta, el día no sirve comida y el menú no la nombra', async ({ page, context }) => {
  await abrir(page, context, { ritmo: {} }, new Date('2026-09-18T09:00:00+02:00'));
  const pregunta = vis(page, '[data-pace-ritmo-estado="pregunta"]');
  await expect(pregunta).toContainText('comes a las');
  const sw = vis(page, '[data-pace-ritmo-comes]');
  await expect(sw).toHaveAttribute('aria-checked', 'true');
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'false');
  await expect(pregunta).toContainText('no comes y terminas');
  await expect(pregunta).not.toContainText('durante');
  expect(await page.evaluate(() => getState().ritmo.horario.sinComida)).toBe(true);
  /* la jornada entera, sin comida: ni tramo ni frase */
  await vis(page, '[data-pace-ritmo-opcion="jornada"]').click();
  const menu = vis(page, '[data-pace-ritmo-estado="menu"]');
  await expect(menu).toContainText('Jornada entera');
  await expect(menu).not.toContainText('comida');
  expect(await page.evaluate(() => { const p = ritmoPlan(getState()); return { comida: p.m.comida, tramos: p.m.items.filter((it) => it.tipo === 'comida').length }; })).toEqual({ comida: null, tramos: 0 });
  /* y vuelve: «Cambiar» → encender → la comida vuelve a las 14:00 */
  await vis(page, '[data-pace-ritmo-resumen] button').click();
  await vis(page, '[data-pace-ritmo-comes]').click();
  await expect(vis(page, '[data-pace-ritmo-estado="pregunta"]')).toContainText('comes a las');
  await vis(page, '[data-pace-ritmo-opcion="jornada"]').click();
  await expect(vis(page, '[data-pace-ritmo-estado="menu"]')).toContainText('comida a las');
});
