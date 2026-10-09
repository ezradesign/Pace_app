/* PACE · Respira e Hidrátate, tras la caza de bugs del 7 de octubre
 * =================================================================
 * Una prueba por arreglo (respira-5, 6, 9, 10, 12, 13 y 14 de
 * `docs/traspaso/CAZA_BUGS_7OCT.md`) y la del azul de «Un vaso más» al pasar el
 * ratón, que Ez pidió el 8 de octubre. Cada una mide el defecto que vio la caza.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');

/* El contenedor de los avisos de logro (ui/Toast.jsx): fijo, abajo y centrado.
   «No hay aviso» se cuenta UNA vez y sin esperar: el reloj de Playwright sigue
   corriendo tras `install()`, y un `toHaveCount(0)` que reintenta acaba en verde
   cuando el aviso se va solo a los 3,3 s. */
const avisos = (page) => page.locator('div[aria-live="polite"][aria-atomic="true"] > div');
const ningunAviso = async (page, porque) => {
  await page.waitForTimeout(300);
  expect(await avisos(page).count(), porque).toBe(0);
};

async function abrirRespira(page, rutina) {
  await page.getByRole('button', { name: /^Respira/ }).first().click();
  await page.getByRole('heading', { name: rutina, exact: true }).first().click();
}

/* respira-5 */
test('respira-5 · el aviso de logro no tapa el cierre de la sesión: sale al volver', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install();
  await irAlArtefacto(page);
  await abrirRespira(page, 'Suspiro fisiológico');
  const sesion = page.locator('[data-pace-session-root]');
  await sesion.getByRole('button', { name: 'Empezar ahora' }).click();
  await expect(page.locator('[data-pace-breathe-phase]')).toBeVisible();
  for (let i = 0; i < 4; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(12); }
  await sesion.getByRole('button', { name: /Terminar/ }).click();
  await page.locator('[data-pace-session-stats]').waitFor();
  await page.clock.fastForward(500);
  expect(await page.evaluate(() => getState().achievements['first.breath'] != null || Object.keys(getState().achievements).length > 0),
    'GUARD: la sesión no ganó ningún logro y la prueba no mide nada').toBe(true);
  await ningunAviso(page, 'el aviso sale encima de «Volver al inicio»');
  await sesion.getByRole('button', { name: 'Volver al inicio' }).click();
  await page.clock.fastForward(500);
  await expect(avisos(page), 'el aviso se perdió').toHaveCount(1);
});

/* respira-6 */
test('respira-6 · en Hidrátate los avisos esperan a que se cierre', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install();
  await irAlArtefacto(page);
  /* «Curiosidad» se gana al abrir Ajustes y se queda en la cola. */
  await page.keyboard.press('t');
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Hidrátate/ }).first().click();
  const mas = page.getByRole('button', { name: /Un vaso más/ });
  await mas.click();
  await mas.click();
  await page.clock.fastForward(500);
  await ningunAviso(page, 'los avisos se apilan encima de los botones');
  await page.keyboard.press('Escape');
  await page.clock.fastForward(500);
  await expect(avisos(page).first(), 'los avisos se perdieron').toBeVisible();
});

/* respira-9 */
test('respira-9 · con 12 vasos a 360 px los vasos se pulsan y la línea no tacha el número', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 718 });
  await sembrar(context);
  await irAlArtefacto(page);
  await page.evaluate(() => setState({ water: Object.assign({}, getState().water, { goal: 12, today: 11 }) }));
  await page.getByRole('button', { name: /Hidrátate/ }).first().click();
  await page.getByRole('button', { name: /Un vaso más/ }).waitFor({ state: 'visible' });
  await page.waitForTimeout(400);
  const vasos = await page.evaluate(() => {
    const nums = [...document.querySelectorAll('[data-pace-modal-card] button > span')].filter((s) => /^\d+$/.test(s.textContent));
    return nums.map((s) => {
      const b = s.parentElement.getBoundingClientRect(), n = s.getBoundingClientRect();
      const linea = s.parentElement.querySelector('div');
      return { ancho: b.width, numTop: n.top, linea: linea ? linea.getBoundingClientRect().top : null };
    });
  });
  expect(vasos.length).toBe(12);
  vasos.forEach((v, i) => {
    expect(v.ancho, 'vaso ' + (i + 1) + ' demasiado estrecho para el dedo').toBeGreaterThanOrEqual(30);
    if (v.linea != null) expect(v.numTop, 'la línea del agua tacha el ' + (i + 1)).toBeGreaterThanOrEqual(v.linea);
  });
});

/* respira-10 */
test('respira-10 · la cola del 3, 5, 7 y 9 no baja hasta «Vasos hoy»', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 718 });
  await sembrar(context);
  await irAlArtefacto(page);
  await page.evaluate(() => setState({ water: Object.assign({}, getState().water, { today: 3 }) }));
  await page.getByRole('button', { name: /Hidrátate/ }).first().click();
  const rotulo = page.getByText('Vasos hoy', { exact: true });
  await rotulo.waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  /* Hasta dónde puede llegar la tinta de la cifra: el fondo del área de contenido de
     su fuente, que es por donde baja la cola de las cifras de estilo antiguo. */
  const m = await rotulo.evaluate((el) => {
    const cifra = el.previousElementSibling;
    const r = document.createRange(); r.selectNodeContents(cifra.firstChild);
    return { tinta: r.getBoundingClientRect().bottom, rotulo: el.getBoundingClientRect().top };
  });
  expect(m.rotulo, 'el rótulo empieza donde aún llega la cola de la cifra').toBeGreaterThanOrEqual(m.tinta);
});

/* respira-12 */
for (const [w, h] of [[360, 640], [1280, 800]]) for (const estilo of ['pulso', 'ondas']) {
  test(`respira-12 · en «Inhala más» ${estilo} no pisa la palabra · ${w}×${h}`, async ({ page, context }) => {
    await page.setViewportSize({ width: w, height: h });
    {
      await sembrar(context, { breathStyle: estilo });
      await page.clock.install();
      await irAlArtefacto(page);
      /* Sin transiciones, lo pintado es ya la escala de la fase. */
      await page.addStyleTag({ content: '[data-pace-essential] * { transition: none !important; }' });
      await abrirRespira(page, 'Suspiro fisiológico');
      await page.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' }).click();
      const fase = page.locator('[data-pace-breathe-phase]');
      for (let i = 0; i < 12 && (await fase.getAttribute('data-pace-breathe-phase').catch(() => '')) !== 'Inhala más'; i++) {
        await page.clock.fastForward(1000); await page.waitForTimeout(15);
      }
      await expect(fase).toHaveAttribute('data-pace-breathe-phase', 'Inhala más');
      await page.waitForTimeout(100);
      const m = await page.evaluate(() => {
        const v = document.querySelector('[data-pace-essential]');
        let abajo = 0, izq = Infinity, der = -Infinity;
        v.querySelectorAll('*').forEach((el) => { const r = el.getBoundingClientRect(); if (!r.width) return;
          abajo = Math.max(abajo, r.bottom); izq = Math.min(izq, r.left); der = Math.max(der, r.right); });
        return { abajo, izq, der, palabra: document.querySelector('[data-pace-breathe-phase]').getBoundingClientRect().top, ancho: innerWidth };
      });
      expect(m.abajo, estilo + ': el aro entra en la palabra').toBeLessThanOrEqual(m.palabra);
      expect(m.izq, estilo + ': se sale por la izquierda').toBeGreaterThanOrEqual(0);
      expect(m.der, estilo + ': se sale por la derecha').toBeLessThanOrEqual(m.ancho);
    }
  });
}

/* respira-13 */
test('respira-13 · las rondas duran 5, 9 y 17 min: un minuto de retención por ronda', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const rondas = await page.evaluate(() => Object.values(window.BREATHE_ROUTINES)
    .flatMap((g) => g.items).filter((r) => r.pattern === 'rounds')
    .map((r) => ({ id: r.id, min: r.min, calculado: Math.round((r.rounds * r.breaths * 4 + r.rounds * 60) / 60) })));
  expect(rondas.map((r) => r.min)).toEqual([5, 9, 17]);
  rondas.forEach((r) => expect(r.min, r.id + ' no sigue el criterio').toBe(r.calculado));
  /* «Rondas express» sigue entrando en «≤ 5 min». */
  await page.getByRole('button', { name: /^Respira/ }).first().click();
  await page.locator('.pace-lib-chip').filter({ hasText: '≤ 5 min' }).first().click();
  await expect(page.getByRole('heading', { name: 'Rondas express', exact: true }).first()).toBeVisible();
});

/* respira-14 */
test('respira-14 · el aviso de seguridad describe la técnica', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const casos = [
    ['Rondas express', 'hiperventilación controlada y apnea'],
    ['Kumbhaka 1:4:2', 'retenciones largas de la respiración'],
    ['Kapalabhati · Kriya', 'hiperventilación controlada'],
  ];
  await page.getByRole('button', { name: /^Respira/ }).first().click();
  for (const [rutina, texto] of casos) {
    await page.getByRole('heading', { name: rutina, exact: true }).first().click();
    const negrita = overlaySuperior(page).locator('p strong').first();
    await expect(negrita, rutina).toHaveText(texto);
    await overlaySuperior(page).getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.locator('.pace-lib').first()).toBeVisible();
  }
});

/* «Un vaso más» al pasar el ratón: su azul, un punto hacia la tinta. */
for (const paleta of ['crema', 'oscuro']) {
  test(`«Un vaso más» al pasar el ratón se queda en su azul · ${paleta}`, async ({ page, context }) => {
    await sembrar(context, { palette: paleta });
    await irAlArtefacto(page);
    await page.getByRole('button', { name: /Hidrátate/ }).first().click();
    const mas = page.getByRole('button', { name: /Un vaso más/ });
    await mas.waitFor({ state: 'visible' });
    await page.waitForTimeout(400);
    const leer = () => mas.evaluate((el) => {
      const s = getComputedStyle(el);
      const n = (c) => { const m = /color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)/.exec(c); return m ? [m[1] * 255, m[2] * 255, m[3] * 255] : c.match(/[\d.]+/g).slice(0, 3).map(Number); };
      return { fondo: n(s.backgroundColor), texto: n(s.color) };
    });
    const lum = (c) => { const v = c.map((k) => { k /= 255; return k <= 0.03928 ? k / 12.92 : Math.pow((k + 0.055) / 1.055, 2.4); });
      return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
    const contraste = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
    const antes = await leer();
    await mas.hover();
    await page.waitForTimeout(400);
    const encima = await leer();
    const [r, g, b] = encima.fondo;
    expect(b, 'al pasar el ratón deja de ser azul (verde de Foco)').toBeGreaterThan(r);
    expect(b).toBeGreaterThan(g - 2);
    if (paleta === 'crema') expect(lum(encima.fondo), 'en crema se oscurece').toBeLessThan(lum(antes.fondo));
    else expect(lum(encima.fondo), 'en oscuro se aclara').toBeGreaterThan(lum(antes.fondo));
    expect(contraste(encima.texto, encima.fondo), 'el texto pierde contraste al pasar el ratón')
      .toBeGreaterThanOrEqual(contraste(antes.texto, antes.fondo));
  });
}
