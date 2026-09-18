/* PACE · E2E · LA LÍNEA DE «A TU RITMO» AL FINAL DEL DÍA (s195)
 * ================================================================
 * Hermano de `ritmo.spec.js` (que está en 465 líneas). Nace de una captura del
 * usuario a 1920×1080 con el escritorio al 125 % (o sea 1536×704 de viewport):
 * «una barra fea del medio con líneas» y «los elementos se solapan». Los dos
 * defectos estaban delante de 260 tests verdes porque ninguno miraba la CAJA
 * del hueco ni el final del día.
 *
 * QUE DEFIENDE:
 *  · EL HUECO DEL RETRASO es un punteado de 2 px sin borde ni relleno. En s194 la
 *    píldora «Hoy voy por libre» se llamó `.pace-rt-libre`, que era ya el nombre
 *    del tramo (`.pace-rt-seg.pace-rt-libre`, por su tipo): el hueco heredaba el
 *    borde verde y el padding de la píldora y salía como una barra rayada de
 *    10 px. La píldora sigue teniendo su caja (GUARD): lo que se prohíbe es que
 *    se la preste a nadie.
 *  · AL FINAL DEL DÍA nada se pisa: «AHORA» —anclado al bloque de ahora— y el
 *    resumen del día («50 min de foco · 1 pausa · 2 vasos» y «Cambiar») vivían
 *    en la misma banda sobre la línea, uno a la izquierda del bloque y el otro
 *    pegado a la derecha, y chocaban en cuanto el bloque actual caía en el
 *    último cuarto. El resumen vive ahora en la cabecera. Se comprueba por
 *    PARES sobre todo lo que tiene texto en el panel, y el escenario se
 *    garantiza con un GUARD: la etiqueta tiene que estar en el último tercio.
 *  · LA HOME NO ARRASTRA con el bloque corriendo. La caja del bloom de la luz
 *    acababa en cy + 0,831 D y con el panel del menú en su estado más bajo el
 *    hueco real era de 0,729 D (1600×780): 46-52 px de scroll que ningún test
 *    veía porque `home-geometria.spec.js` mide con la carta, no con el menú.
 *  · EL RESUMEN cambia de sitio con el ancho del PANEL (container query): en la
 *    fila del título si cabe (1536) y bajo los chips si no (1280).
 *
 * EL GUION es el del usuario: «Una hora» empezada a las 17:20, bloque 1 y su
 * pausa hechos, y «Empezar bloque 2» a las 19:30, o sea recolocar con un hueco
 * de 17:48 a 19:30 y el bloque de ahora pegado al final. La hora va CON OFFSET
 * (trampa de ritmo.spec.js: el runner del CI está en UTC).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const TARDE = new Date('2026-09-18T19:30:00+02:00');   /* viernes, 19:30 en Madrid */
const TARDE_RITMO = {
  cycle: 1, lastActiveDay: 'Fri Sep 18 2026', _historyMigrated: true,
  ritmo: {
    horario: { inicio: 780, comida: 960, comidaDur: 30, salida: 1140 },
    dia: { fecha: '2026-09-18', opcion: '1h', desde: 1040, cicloBase: 0, cambios: {}, pausa: 1 },
  },
};

async function abrirTarde(page, context) {
  await sembrar(context, TARDE_RITMO);
  await page.clock.install({ time: TARDE });
  await irAlArtefacto(page);
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Empezar bloque 2', exact: true }).click();
  await page.waitForTimeout(1500);
}

/* Todo lo que lleva texto o dibujo en el panel de escritorio, y sus pares que se
   cruzan. Devuelve también dónde cae «AHORA» respecto de la línea (para el GUARD). */
const CHOQUES = () => {
  const vis = (s) => Array.from(document.querySelectorAll(s)).filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
  const piezas = [];
  const add = (sel, nombre) => vis(sel).forEach((e, i) => piezas.push({ n: nombre + (i ? i : ''), r: e.getBoundingClientRect(), txt: (e.textContent || '').trim().slice(0, 24) }));
  add('.pace-rt-esc .pace-rt-titulo', 'título');
  add('.pace-rt-esc .pace-rt-ctx span', 'chip');
  add('.pace-rt-esc [data-pace-ritmo-libre]', 'píldora');
  /* Por CLASE y no por el data- de s195: así la medida sigue encontrando el resumen si
     alguien lo devuelve a la línea (la pasada de control contra HEAD lo comprobó). */
  add('.pace-rt-esc .pace-rt-sobre .pace-rt-meta', 'resumen');
  add('.pace-rt-esc .pace-rt-sobre button', 'cambiar');
  add('.pace-rt-esc .pace-rt-como', 'cómo');
  add('.pace-rt-esc .pace-rt-ahora-tag', 'AHORA');
  add('.pace-rt-esc [data-pace-ritmo-etiq]', 'etiqueta');
  add('.pace-rt-esc .pace-rt-nodo', 'parada');
  const pares = [];
  for (let i = 0; i < piezas.length; i++) for (let j = i + 1; j < piezas.length; j++) {
    const a = piezas[i].r, b = piezas[j].r;
    if (a.right > b.left + 0.5 && b.right > a.left + 0.5 && a.bottom > b.top + 0.5 && b.bottom > a.top + 0.5) {
      pares.push(piezas[i].n + ' × ' + piezas[j].n + ' («' + piezas[i].txt + '» / «' + piezas[j].txt + '»)');
    }
  }
  const tag = piezas.find((p) => p.n === 'AHORA');
  const linea = vis('.pace-rt-esc [data-pace-ritmo-linea]')[0];
  const lr = linea && linea.getBoundingClientRect();
  return { pares, piezas: piezas.length, nombres: piezas.map((p) => p.n), tagEn: tag && lr ? (tag.r.left - lr.left) / lr.width : null };
};

/* Si se puede arrastrar, hay scroll; si no, no lo hay (home-geometria.spec.js). */
const ARRASTRABLE = () => {
  const b = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
  if (!b) return null;
  const antes = b.scrollTop;
  b.scrollTop = 9999;
  const real = b.scrollTop;
  b.scrollTop = antes;
  return real;
};

test('el hueco del retraso es un punteado de 2 px sin borde ni relleno: la píldora no le presta su caja', async ({ page, context }) => {
  await abrirTarde(page, context);
  const m = await page.evaluate(() => {
    const vis = (s) => Array.from(document.querySelectorAll(s)).find((e) => e.getBoundingClientRect().width > 0);
    const hueco = vis('[data-pace-ritmo-tramo="libre"]');
    const pildora = vis('[data-pace-ritmo-libre]');
    if (!hueco || !pildora) return null;
    const h = getComputedStyle(hueco), p = getComputedStyle(pildora);
    return { alto: hueco.getBoundingClientRect().height, borde: h.borderTopWidth, relleno: h.paddingTop + ' ' + h.paddingLeft,
             punteado: h.backgroundImage.indexOf('repeating-linear-gradient') === 0, ancho: hueco.getBoundingClientRect().width,
             pildoraBorde: p.borderTopWidth, pildoraRelleno: p.paddingLeft };
  });
  expect(m, 'GUARD: falta el hueco del retraso o la píldora').not.toBeNull();
  expect(m.ancho, 'GUARD: el hueco de 17:48 a 19:30 tiene que ser el tramo más largo').toBeGreaterThan(300);
  expect(m.pildoraBorde, 'GUARD: la píldora ha perdido su borde; el aserto de abajo sería vacío').toBe('1px');
  expect(m.pildoraRelleno, 'GUARD: la píldora ha perdido su padding').toBe('10px');
  expect(m.punteado, 'el hueco no es el punteado del margen libre').toBe(true);
  expect(m.alto, 'el hueco tiene la caja de la píldora (era 10 px: 2 + 4 + 4 + el borde)').toBe(2);
  expect(m.borde, 'el hueco lleva el borde de la píldora').toBe('0px');
  expect(m.relleno, 'el hueco lleva el padding de la píldora').toBe('0px 0px');
});

for (const vp of [{ w: 1536, h: 704 }, { w: 1600, h: 780 }, { w: 1440, h: 789 }, { w: 1280, h: 879 }]) {
  test.describe(vp.w + 'x' + vp.h, () => {
    test.use({ viewport: { width: vp.w, height: vp.h } });
    test('al final del día nada se pisa y la home no arrastra con el bloque corriendo', async ({ page, context }) => {
      await abrirTarde(page, context);
      const c = await page.evaluate(CHOQUES);
      expect(c.piezas, 'GUARD: el panel del menú no está montado').toBeGreaterThan(8);
      expect(c.nombres, 'GUARD: el resumen del día no se ha medido; el aserto de los pares sería ciego a él').toEqual(expect.arrayContaining(['resumen', 'cambiar', 'AHORA']));
      expect(c.tagEn, 'GUARD: «AHORA» no está anclado al bloque del final (el escenario no es el del choque)').toBeGreaterThan(0.6);
      expect(c.pares, 'piezas del panel que se pisan').toEqual([]);
      expect(await page.evaluate(ARRASTRABLE), 'la home hace scroll vertical con el bloque corriendo').toBe(0);
    });
  });
}

test.describe('el resumen del día cambia de fila con el ancho del panel', () => {
  test.describe('1536x704', () => {
    test.use({ viewport: { width: 1536, height: 704 } });
    test('con sitio va en la fila del título, a la izquierda de los chips', async ({ page, context }) => {
      await abrirTarde(page, context);
      const m = await page.evaluate(() => {
        const vis = (s) => Array.from(document.querySelectorAll(s)).find((e) => e.getBoundingClientRect().width > 0);
        const r = vis('[data-pace-ritmo-resumen]').getBoundingClientRect(), ch = vis('.pace-rt-esc .pace-rt-ctx').getBoundingClientRect(), t = vis('.pace-rt-esc .pace-rt-titulo').getBoundingClientRect();
        return { dy: Math.abs((r.top + r.bottom) / 2 - (ch.top + ch.bottom) / 2), aLaIzquierda: r.right <= ch.left, tituloLineas: Math.round(t.height / 22) };
      });
      expect(m.dy, 'el resumen no está en la fila de los chips').toBeLessThan(6);
      expect(m.aLaIzquierda, 'el resumen no va a la izquierda de los chips').toBe(true);
      expect(m.tituloLineas, 'el título se parte por meter el resumen en su fila').toBe(1);
    });
  });
  test.describe('1280x879', () => {
    test.use({ viewport: { width: 1280, height: 879 } });
    test('sin sitio va bajo los chips, alineado a la derecha', async ({ page, context }) => {
      await abrirTarde(page, context);
      const m = await page.evaluate(() => {
        const vis = (s) => Array.from(document.querySelectorAll(s)).find((e) => e.getBoundingClientRect().width > 0);
        const r = vis('[data-pace-ritmo-resumen]').getBoundingClientRect(), p = vis('[data-pace-ritmo-libre]').getBoundingClientRect();
        return { debajo: r.top >= p.bottom - 1, derecha: Math.abs(r.right - p.right) };
      });
      expect(m.debajo, 'el resumen no va bajo los chips').toBe(true);
      expect(m.derecha, 'el resumen no queda alineado a la derecha con la píldora').toBeLessThan(2);
    });
  });
});
