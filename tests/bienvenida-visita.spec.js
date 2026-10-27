/* PACE · la visita guiada por la home (Ez, 1C del 27 oct. 2026)
 * ==========================================
 * Al cerrar la bienvenida, cuatro paradas sobre la home de verdad: el aro, Actividades,
 * tu día y Ajustes, con «Siguiente» y «Saltar la visita» (app/onboarding/OnboardingVisita.jsx).
 * De la B (la pista de la home) entra lo que la C no contaba: que al acabar el Foco PACE
 * propone una pausa. Se repite desde Ajustes («Visita guiada ›»).
 *
 * Lo que se vigila: que cada parada enseñe lo que dice (el hueco rodea su sitio), que la
 * tarjeta quepa en la ventana sin tapar lo que enseña, que sea un diálogo de verdad (foco
 * dentro, Tab que da la vuelta, Escape, sin atajos detrás) y que una parada cuyo sitio no se
 * ve se salte y la cuenta lo diga. PACE completo al final de la bienvenida, en
 * compra-tienda.spec.js; el Atrás de Android, en android-nativo.spec.js.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { capturarErrores, sembrar, irAlArtefacto, RUTA_ARTEFACTO } = require('./helpers');

const VISITA = '[role=dialog][data-pace-visita]';
const SITIO = {
  aro: '[data-pace-dial-ring]',
  act: '[data-pace-activitybar-grid]',
  dia: '[data-pace-ritmo-tarjeta], [data-pace-ritmo-panel]',
  ajustes: '[data-pace-topbar-ajustes]',
};

async function hastaLaVisita(page) {
  await page.goto(RUTA_ARTEFACTO);   // sin sembrar: primera vez de la vida
  await page.locator('[role=dialog] [data-pace-cta]').click();
  await page.locator('[data-pace-semana-guardar]').click();
  await page.locator('[data-pace-onb-comenzar]').click();
  await page.locator(VISITA).waitFor({ state: 'visible' });
}

/* La tarjeta y el hueco se deslizan a cada parada: se mide cuando han llegado. */
async function esperarQuieta(page) {
  await page.waitForFunction(() => ['[data-pace-visita-tarjeta]', '[data-pace-visita-hueco]'].every((s) => {
    const el = document.querySelector(s);
    return !el || el.getAnimations().every((a) => a.playState === 'finished');
  }), null, { polling: 60 });
}

/* Lo que se ve en una parada: cuál es, su cuenta, si el hueco rodea su sitio y si la tarjeta
   cabe en la ventana sin pisar el hueco. */
async function medirParada(page) {
  await esperarQuieta(page);
  return page.evaluate((sitios) => {
    const raiz = document.querySelector('[data-pace-visita]');
    const id = raiz.getAttribute('data-pace-visita');
    const t = document.querySelector('[data-pace-visita-tarjeta]').getBoundingClientRect();
    const h = document.querySelector('[data-pace-visita-hueco]').getBoundingClientRect();
    const el = [...document.querySelectorAll(sitios[id])].find((e) => e.getBoundingClientRect().width > 0);
    const r = el.getBoundingClientRect();
    const rodea = id === 'aro' || id === 'ajustes'
      ? Math.hypot(h.x + h.width / 2 - (r.x + r.width / 2), h.y + h.height / 2 - (r.y + r.height / 2)) < 2 && h.width >= Math.max(r.width, r.height)
      : h.left <= r.left && h.top <= r.top && h.right >= r.right && h.bottom >= r.bottom;
    return {
      id, rodea,
      meta: raiz.querySelector('.pace-meta').textContent,
      titulo: document.getElementById(raiz.getAttribute('aria-labelledby')).textContent,
      texto: document.getElementById(raiz.getAttribute('aria-describedby')).textContent,
      dentro: t.left >= 0 && t.top >= 0 && t.right <= innerWidth && t.bottom <= innerHeight,
      pisa: !(t.bottom <= h.top || t.top >= h.bottom || t.right <= h.left || t.left >= h.right),
    };
  }, SITIO);
}

for (const v of [{ width: 360, height: 740 }, { width: 1280, height: 800 }]) {
  test.describe('a ' + v.width + ' × ' + v.height, () => {
    test.use({ viewport: v });

    test('al cerrar la bienvenida, la visita enseña el aro, Actividades, tu día y Ajustes, y «Entendido» devuelve la home', async ({ page }) => {
      const errores = capturarErrores(page);
      await hastaLaVisita(page);
      const vistas = [];
      for (let i = 0; i < 4; i++) {
        const m = await medirParada(page);
        vistas.push(m.id);
        expect(m.meta).toBe((i + 1) + ' de 4');
        expect(m.rodea, 'el hueco de «' + m.titulo + '» no rodea lo que enseña').toBe(true);
        expect(m.dentro, 'la tarjeta de «' + m.titulo + '» se sale de la ventana').toBe(true);
        expect(m.pisa, 'la tarjeta de «' + m.titulo + '» tapa lo que enseña').toBe(false);
        if (m.id === 'aro') {
          /* De la B: lo que pasa al acabar el Foco, con el nombre del botón de verdad. */
          expect(m.texto).toContain('toca «Empezar foco»');
          expect(m.texto).toContain('Al acabar, PACE te propone una pausa corta: moverte, estirar o respirar.');
        }
        await expect(page.locator('[data-pace-visita-siguiente]')).toHaveText(i === 3 ? 'Entendido' : 'Siguiente');
        await page.locator('[data-pace-visita-siguiente]').click();
      }
      expect(vistas).toEqual(['aro', 'act', 'dia', 'ajustes']);
      await expect(page.locator(VISITA)).toHaveCount(0);

      /* La home vuelve a ser de la persona: lo que hay en el centro de «Empezar foco» es el botón. */
      const empezar = page.getByRole('button', { name: 'Empezar foco' });
      const b = await empezar.boundingBox();
      expect(await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y).closest('button'), [b.x + b.width / 2, b.y + b.height / 2])).toBe(true);
      expect(errores).toEqual([]);
    });
  });
}

test('la visita es un diálogo: el foco entra, Tab no sale, los atajos callan y Escape la cierra', async ({ page }) => {
  await hastaLaVisita(page);
  const raiz = page.locator(VISITA);
  await expect(raiz).toHaveAttribute('aria-modal', 'true');
  await expect(raiz).toHaveAccessibleName('El aro');
  const dentro = () => page.evaluate(() => !!document.activeElement.closest('[data-pace-visita]'));
  expect(await dentro(), 'el foco no entró en la visita').toBe(true);
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    expect(await dentro(), 'Tab número ' + (i + 1) + ' salió de la visita').toBe(true);
  }
  await page.keyboard.press('s');
  await expect(page.locator('[data-pace-modal-card]'), 'la S abrió Estadísticas detrás de la visita').toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(raiz).toHaveCount(0);
});

test('«Saltar la visita» la cierra en cualquier parada', async ({ page }) => {
  await hastaLaVisita(page);
  await page.locator('[data-pace-visita-siguiente]').click();
  await expect(page.locator(VISITA)).toHaveAttribute('data-pace-visita', 'act');
  await page.locator('[data-pace-visita-saltar]').click();
  await expect(page.locator(VISITA)).toHaveCount(0);
});

test('desde Ajustes, «Visita guiada» la repite; una parada cuyo sitio no se ve se salta y la cuenta lo dice', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context);
  await irAlArtefacto(page);
  /* Como con un día elegido, en que Actividades no está en la home. */
  await page.addStyleTag({ content: '[data-pace-activitybar-grid] { display: none !important; }' });
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.locator('[data-pace-tweaks-panel]').getByRole('button', { name: /Visita guiada/ }).click();
  await expect(page.locator('[data-pace-tweaks-panel]'), 'Ajustes se quedó abierto debajo de la visita').toHaveCount(0);
  await page.locator(VISITA).waitFor({ state: 'visible' });

  const vistas = [];
  for (let i = 0; i < 3; i++) {
    const m = await medirParada(page);
    vistas.push(m.id);
    expect(m.meta).toBe((i + 1) + ' de 3');
    await page.locator('[data-pace-visita-siguiente]').click();
  }
  expect(vistas).toEqual(['aro', 'dia', 'ajustes']);
  await expect(page.locator(VISITA)).toHaveCount(0);
  expect(errores).toEqual([]);
});

test.describe('en inglés', () => {
  test.use({ locale: 'en-GB', viewport: { width: 360, height: 740 } });

  test('la visita habla inglés, con el botón del aro por su nombre', async ({ page }) => {
    await hastaLaVisita(page);
    const m = await medirParada(page);
    expect(m.titulo).toBe('The ring');
    expect(m.meta).toBe('1 of 4');
    expect(m.texto).toContain('tap “Start focus”');
    await expect(page.locator('[data-pace-visita-saltar]')).toHaveText('Skip the tour');
  });
});
