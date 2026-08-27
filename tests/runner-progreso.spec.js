/* PACE · tests/runner-progreso.spec.js (sesión 176)
   ==================================================
   LA BARRA DE PROGRESO DEL RUNNER, A LA MISMA ALTURA SIEMPRE. Lo reportó el
   usuario mirando la app: «la barra de progreso casi se superpone con los
   botones de anterior, reanudar... sucede en el ejercicio y no en el colócate,
   de hecho debería estar siempre a la misma altura: referencia del colócate».

   MEDIDO ANTES DE TOCAR NADA, a 1536x714 (su pantalla):
     colócate   barra top 570,3   ·   pie 635   ->   +32,2 px
     ejercicio  barra top 617,5   ·   pie 635   ->   -15,0 px   (se solapan)

   La causa: la barra FLUÍA detrás del contenido, y la pantalla de trabajo tiene
   dos piezas que la de colocarse no tiene -- el contador y el «Cuídate».

   POR QUÉ MERECE UN ASERTO Y NO SÓLO UN ARREGLO: el mecanismo es frágil de una
   forma que no se ve leyendo. Cuatro tiers de `MoveSessionV1.css.jsx` fijan
   `margin-top` de la barra con `!important` para el mundo en el que fluía; a
   igual especificidad gana la última regla del archivo, así que basta con que
   alguien añada un tier debajo para que el defecto vuelva entero y en silencio.
   Medido durante la propia sesión: con el anclaje puesto ANTES de esos tiers,
   la barra volvía a 592,7 / 545,5.

   NO CUBRE: los 1,5 px que a 360x730 siguen faltando. Ahí el contenido es más
   alto que el centro y el scroll es legítimo (s125); lo que este test defiende
   es que las DOS pantallas coincidan, que es lo que se pidió.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

/* Las dos pantallas del runner se distinguen por el CONTADOR: la de colocarse
   no lo pinta. Es la misma señal que usa el propio CSS. */
async function hayContador(page) {
  return page.evaluate(() => [...document.querySelectorAll('[data-pace-v1-timer]')]
    .some(e => e.getBoundingClientRect().width > 0));
}

async function medir(page) {
  return page.evaluate(() => {
    const vis = (s) => [...document.querySelectorAll(s)]
      .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
    const barra = vis('[data-pace-v1-progress]')[0];
    /* EL PIE SE BUSCA POR SU CONTENEDOR y no por el texto de los botones: la
       home sigue detrás del runner y su «Empezar foco» ponía la fila de botones
       en 381,8 px, por encima del propio contador. */
    const pie = vis('[data-pace-session-footer]')[0];
    if (!barra || !pie) return null;
    const b = barra.getBoundingClientRect(), f = pie.getBoundingClientRect();
    return {
      top: Math.round(b.top * 10) / 10,
      hueco: Math.round((f.top - b.bottom) * 10) / 10,
    };
  });
}

test('la barra de progreso está a la misma altura en el ejercicio y en el colócate', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);

  await page.getByRole('button', { name: 'Estira' }).first().click();
  await page.locator('.pace-lib').waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const t = [...document.querySelectorAll('[data-pace-lib-card] .pace-lib-hit')]
      .filter(e => e.getBoundingClientRect().width > 0)
      .find(e => /rculos/.test(e.textContent || ''));
    if (!t) throw new Error('no encuentro «Hombros · círculos»');
    t.click();
  });
  await page.waitForTimeout(900);
  /* EL CLICK VA ACOTADO AL MODAL DE ARRIBA. Buscando «Empezar» en todo el
     documento se encuentra antes el «Empezar foco» de la home -- que arranca el
     Pomodoro y cierra la biblioteca-, y se coge el ÚLTIMO modal porque el
     preview se abre ENCIMA de la biblioteca y los dos están en el DOM. Las dos
     trampas se pagaron midiendo esto. */
  await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')]
      .filter(e => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    const b = [...raiz.querySelectorAll('button')]
      .filter(x => x.getBoundingClientRect().width > 0)
      .find(x => /Empezar/i.test(x.textContent || ''));
    if (!b) throw new Error('no encuentro el «Empezar» del preview');
    b.click();
  });
  await page.locator('[data-pace-v1-timer]').first().waitFor({ state: 'visible', timeout: 25000 });
  await page.waitForTimeout(300);

  expect(await hayContador(page), 'la primera pantalla no es la de trabajo').toBe(true);
  const trabajo = await medir(page);
  expect(trabajo, 'no encuentro la barra o el pie en la pantalla de trabajo').not.toBeNull();

  /* NO SE SOLAPA CON LOS BOTONES. Es la mitad del defecto, y la que se veía. */
  expect(trabajo.hueco, 'la barra se mete dentro del pie en la pantalla de trabajo')
    .toBeGreaterThan(0);

  /* Al paso siguiente, que es una pantalla de colocarse (`ready`): no pinta
     contador. Si algún día deja de serlo, el guard lo dice en vez de comparar
     dos pantallas iguales y salir verde por vacuidad. */
  await page.evaluate(() => {
    const pie = document.querySelector('[data-pace-session-footer]');
    const b = [...(pie || document).querySelectorAll('button')]
      .find(x => /Siguiente/i.test(x.textContent || ''));
    if (b) b.click();
  });
  await page.waitForTimeout(900);
  expect(await hayContador(page), 'el segundo paso ya no es una pantalla de colocarse: el test no compara nada')
    .toBe(false);
  const colocate = await medir(page);
  expect(colocate).not.toBeNull();
  expect(colocate.hueco).toBeGreaterThan(0);

  /* Y LA MISMA ALTURA EN LAS DOS, que es lo que se pidió. Tolerancia de 2 px
     por el redondeo del layout: el defecto medía 47,2 px de diferencia, así que
     no hay riesgo de que se cuele por el margen. */
  expect(Math.abs(trabajo.top - colocate.top),
    'la barra cambia de altura entre la pantalla de trabajo y la de colocarse')
    .toBeLessThanOrEqual(2);
});
