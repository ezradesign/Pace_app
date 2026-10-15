/* PACE · E2E · ESTADÍSTICAS SIN SCROLL, A LA MISMA ALTURA Y CON BARRAS QUE DICEN CUÁNTO (v0.160.0)
 * ==================================================================================================
 * Lo reportó Ez el 13 oct.:
 *   · en su escritorio (1080p al 125 %, Brave) Semana, Mes y Año tenían barra de scroll, y la nota
 *     no se quita;
 *   · en el móvil cada pestaña medía distinto (semana 644 px, mes 489, año 434) y el mes y el año
 *     quedaban medio vacíos.
 * Al medir salieron dos fallos más: las barras de la semana medían TODAS 4 px (un día de 150 min y
 * uno de 60 se veían iguales) y en el móvil la cifra se montaba 9 px sobre el nombre de la fila.
 *
 * Ez eligió mirando fotos de la app: las pestañas al lado del título y la semana en dos columnas en
 * el escritorio; los cuatro totales arriba en las tres pestañas del móvil; el año en dos filas en
 * el móvil; barras que crecen con su cifra.
 *
 * Contra v0.159.0 cae en las tres pruebas. La altura del escritorio se mide con un mes de SEIS
 * semanas, que es el más alto: con uno de cinco el scroll se escondía.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarModalAsentado } = require('./helpers');

/* weeklyStats va lunes-primero. 150 el lunes y 60 el miércoles: si las barras dicen cuánto, la del
   lunes mide 2,5 veces la del miércoles. */
const SEMANA = {
  lastActiveDay: new Date().toDateString(),
  weeklyStats: {
    focusMinutes: [150, 90, 60, 0, 0, 0, 0], breathMinutes: [6, 4, 10, 0, 0, 0, 0],
    moveMinutes: [12, 8, 15, 0, 0, 0, 0], waterGlasses: [6, 5, 8, 0, 0, 0, 0], holdSeconds: [45, 0, 90, 0, 0, 0, 0],
  },
};
const PESTANAS = ['Semana', 'Mes', 'Año'];

async function abrirStats(page) {
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0)
      .find(x => /stat|estad|ritmo/i.test((x.getAttribute('aria-label') || '') + ' ' + (x.title || '')));
    if (!b) throw new Error('no encuentro el botón de estadísticas');
    b.click();
  });
  await page.locator('[data-pace-stats-vistas]').waitFor({ state: 'visible' });
  await esperarModalAsentado(page);
  /* Estadísticas se abre en «Hoy» (Fase 4); estas pruebas miden la semana, el mes y el año. */
  await pestana(page, 'Semana');
}

async function pestana(page, nombre) {
  await page.locator('[data-pace-modal-card]').getByRole('button', { name: nombre, exact: true }).click();
  await page.waitForTimeout(300);
}

async function medir(page) {
  return page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-pace-modal-card]')].filter(e => e.getBoundingClientRect().width > 0).pop();
    const wrap = document.querySelector('[data-pace-year-grid-wrap]');
    /* HUECO MUERTO: lo que queda dentro de la vista por debajo de lo último que se ve. Con la
       misma altura para las tres, una pestaña sin sus totales se quedaba medio vacía. */
    const vista = document.querySelector('[data-pace-stats-vistas]');
    const rv = vista.getBoundingClientRect();
    let masBajo = rv.top;
    for (const e of vista.querySelectorAll('*')) {
      const r = e.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && r.bottom > masBajo) masBajo = r.bottom;
    }
    return {
      muerto: Math.round(rv.bottom - masBajo),
      alto: Math.round(el.getBoundingClientRect().height * 10) / 10,
      corta: Math.max(0, el.scrollHeight - el.clientHeight),
      lateral: wrap ? Math.max(0, wrap.scrollWidth - wrap.clientWidth) : 0,
    };
  });
}

/* Retrocede hasta un mes de seis semanas (el más alto). */
async function mesDeSeisSemanas(page) {
  for (let i = 0; i < 14; i++) {
    const filas = await page.evaluate(() => {
      const rejillas = document.querySelectorAll('.pace-heatmap-grid');
      return Math.ceil(rejillas[rejillas.length - 1].children.length / 7);
    });
    if (filas === 6) return;
    await page.getByRole('button', { name: 'Mes anterior' }).click();
    await page.waitForTimeout(120);
  }
  throw new Error('no encuentro un mes de seis semanas en el último año');
}

async function recorrer(page) {
  const medidas = {};
  for (const nom of PESTANAS) { await pestana(page, nom); medidas[nom] = await medir(page); }
  await pestana(page, 'Mes'); await mesDeSeisSemanas(page);
  medidas['Mes de seis semanas'] = await medir(page);
  return medidas;
}

function comprobar(medidas, muertoMax) {
  const nombres = Object.keys(medidas);
  expect(nombres.length).toBe(4);
  const altos = nombres.map(n => medidas[n].alto);
  for (const n of nombres) expect(medidas[n].alto, n + ' no midió nada').toBeGreaterThan(200);
  expect(Math.max(...altos) - Math.min(...altos), 'el modal cambia de tamaño al cambiar de pestaña: '
    + nombres.map(n => n + ' ' + medidas[n].alto).join(' · ')).toBeLessThanOrEqual(2);
  for (const n of nombres) {
    expect(medidas[n].corta, n + ' necesita scroll').toBeLessThanOrEqual(1);
    expect(medidas[n].lateral, n + ' se desliza de lado').toBe(0);
    if (muertoMax != null) expect(medidas[n].muerto, n + ' se queda medio vacía').toBeLessThanOrEqual(muertoMax);
  }
}

test('escritorio a 1536x640: las tres pestañas y un mes de seis semanas, sin scroll y con la nota', async ({ page, context }) => {
  await page.setViewportSize({ width: 1536, height: 640 });
  await sembrar(context, SEMANA);
  await irAlArtefacto(page);
  await abrirStats(page);
  await expect(page.locator('[data-pace-week-note]'), 'la nota de la semana tiene que verse').toBeVisible();
  comprobar(await recorrer(page));
});

test('móvil a 360x718: las tres pestañas miden lo mismo, sin scroll, y el año no se desliza de lado', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 718 });
  await sembrar(context, SEMANA);
  await irAlArtefacto(page);
  await abrirStats(page);
  /* 70 px: un mes de cinco semanas deja una fila de hueco, que es lo justo. Sin los totales
     arriba el mes y el año dejaban unos 160. */
  comprobar(await recorrer(page), 70);
});

test('las barras de la semana crecen con su cifra y la cifra no pisa el nombre de la fila', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 718 });
  await sembrar(context, SEMANA);
  await irAlArtefacto(page);
  await abrirStats(page);
  const fila = await page.locator('[data-pace-week-bar-row]').first().evaluate((el) => {
    /* La barra es la caja que lleva la cifra encima (la cifra va dentro, colgando por arriba). */
    const cifras = [...el.querySelectorAll('[data-pace-bar-chart] span')].filter((s) => /^\d+$/.test(s.textContent.trim()));
    const alto = (v) => cifras.find((s) => s.textContent.trim() === String(v)).parentElement.getBoundingClientRect().height;
    const cabecera = el.firstElementChild.getBoundingClientRect().bottom;
    return { b150: alto(150), b60: alto(60), pisa: cabecera - Math.min(...cifras.map((s) => s.getBoundingClientRect().top)) };
  });
  expect(fila.b150 / fila.b60, 'la barra de 150 no mide 2,5 veces la de 60: ' + fila.b150 + ' y ' + fila.b60)
    .toBeGreaterThan(2.2);
  expect(fila.pisa, 'la cifra se monta ' + fila.pisa + ' px sobre el nombre de la fila').toBeLessThanOrEqual(0);
});
