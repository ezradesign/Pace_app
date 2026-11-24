/* PACE · E2E · EL PULIDO DEL 23 NOV. 2026
 * ======================================
 * La auditoría de antes de publicar (página «Pulido antes de publicar»), con las letras de Ez:
 * «1A + 2A + 3A + 4A + 5A + 6A + 7A + 8A + 9A + 10A». La 5A (sin tira de glifos pequeños) vive en
 * biblioteca.spec.js, junto a las demás pruebas de la tarjeta de rutina.
 *
 *   1A  La bienvenida tapa la home desde el primer cuadro: sin fundido en su raíz, se veían debajo
 *       las actividades y «¿Cuánto trabajas hoy?».
 *   2A  «Ahora no» en la cabecera de la pregunta: la cierra sin ir por libre y la home vuelve a
 *       tener Respira, Estira, Mueve e Hidrátate. En el móvil, en la fila del título.
 *   3A  Números de altura completa en las cifras de Estadísticas y en el contador de Logros.
 *   4A  De noche, la media jornada del móvil se apaga cuando ya no cabe antes de las 0:00.
 *   6A  «Respiración guiada» y «Consejo:», no «Breathwork» y «Tip:».
 *   7A  «Un vaso menos» apagado con 0 vasos.
 *   8A  La semana vacía de Estadísticas lo dice.
 *   9A  «Escríbenos» en «Tus datos», con el correo público de PACE (Ez, 24 nov.).
 *   10A La landing dice dónde lee PACE tus reuniones: en Android y en el iPhone.
 *
 * Contra la 0.217.0 falla cada una por su lado.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, abrirTusDatos, RUTA_ARTEFACTO } = require('./helpers');

const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const MANANA = new Date('2026-09-22T10:00:00+02:00');

test('1A · la bienvenida no se funde sobre la home: su raíz es opaca desde el primer cuadro', async ({ page, context }) => {
  await sembrar(context, { firstSeen: null });
  await page.goto(RUTA_ARTEFACTO);
  const raiz = page.locator('[data-pace-scene-card][role="dialog"]');
  await raiz.waitFor({ state: 'attached' });
  const r = await raiz.evaluate((e) => ({ anim: getComputedStyle(e).animationName, op: getComputedStyle(e).opacity }));
  expect(r.anim, 'la raíz de la bienvenida vuelve a entrar con un fundido').toBe('none');
  expect(r.op).toBe('1');
});

test.describe('2A · «Ahora no» en el móvil', () => {
  test.use({ viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true });

  test('cierra la pregunta sin ir por libre, vuelven las actividades y el foco pasa a «Preparar jornada»', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await sembrar(context, { sidebarCollapsed: true });
    await page.clock.install({ time: MANANA });
    await irAlArtefacto(page);
    await vis(page, '[data-pace-ritmo-comienza]').click();
    const pregunta = vis(page, '[data-pace-ritmo-estado="pregunta"]');
    await expect(pregunta).toBeVisible();
    await expect(vis(page, '[data-pace-activitybar] button').filter({ hasText: 'Respira' })).toHaveCount(0);

    /* En la fila del título, a su derecha, y antes de «Hoy voy por libre». */
    const g = await page.evaluate(() => {
      const p = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="pregunta"]')).find((e) => e.getBoundingClientRect().width > 0);
      const texto = (el) => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect(); };
      const titulo = p.querySelector('.pace-rt-titulo').getBoundingClientRect();
      const ahora = texto(p.querySelector('[data-pace-ritmo-ahorano]'));
      const libre = texto(p.querySelector('[data-pace-ritmo-libre]'));
      return { mismaFila: ahora.top < titulo.bottom && ahora.bottom > titulo.top, delante: ahora.right < libre.left, derecha: ahora.left > titulo.right };
    });
    expect(g.mismaFila, '«Ahora no» bajó de la fila del título').toBe(true);
    expect(g.derecha).toBe(true);
    expect(g.delante, '«Ahora no» va antes de «Hoy voy por libre»').toBe(true);

    await pregunta.locator('[data-pace-ritmo-ahorano]').click();
    await expect(vis(page, '[data-pace-ritmo-estado="pregunta"]')).toHaveCount(0);
    for (const nombre of ['Respira', 'Estira', 'Mueve', 'Hidrátate']) {
      await expect(vis(page, 'button').filter({ hasText: new RegExp('^' + nombre) }).first()).toBeVisible();
    }
    await expect(vis(page, '[data-pace-ritmo-comienza]')).toBeFocused();
    const ritmo = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).ritmo);
    expect(ritmo.libre, '«Ahora no» no es ir por libre').toBeFalsy();
    expect(ritmo.pregunta || null).toBeNull();
    expect(ritmo.distinto || null).toBeNull();
    expect(errores).toEqual([]);
  });
});

test('2A · en el ordenador, «Ahora no» junto a «Hoy voy por libre» cierra la pregunta', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install({ time: MANANA });
  await irAlArtefacto(page);
  await vis(page, '[data-pace-ritmo-ajustar]').click();
  const pregunta = vis(page, '[data-pace-ritmo-estado="pregunta"]');
  await expect(pregunta).toBeVisible();
  await pregunta.locator('[data-pace-ritmo-ahorano]').click();
  await expect(vis(page, '[data-pace-ritmo-estado="pregunta"]')).toHaveCount(0);
  await expect(vis(page, '[data-pace-ritmo-ajustar]')).toBeVisible();
});

test.describe('4A · la media jornada del móvil, de noche', () => {
  test.use({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });

  for (const [hora, cabe] of [['21:20', false], ['18:00', true]]) {
    test(`a las ${hora} ${cabe ? 'enseña sus horas para moverla' : 'sale apagada, como en el ordenador'}`, async ({ page, context }) => {
      await sembrar(context, { sidebarCollapsed: true });
      await page.clock.install({ time: new Date(`2026-09-22T${hora}:00+02:00`) });
      await irAlArtefacto(page);
      await vis(page, '[data-pace-ritmo-comienza]').click();
      const pregunta = vis(page, '[data-pace-ritmo-estado="pregunta"]');
      await expect(pregunta).toBeVisible();
      if (cabe) {
        await expect(pregunta.locator('[data-pace-ritmo-media-horas]')).toHaveCount(1);
      } else {
        await expect(pregunta.locator('[data-pace-ritmo-media-horas]')).toHaveCount(0);
        const chip = pregunta.locator('[data-pace-ritmo-opcion="media"]');
        await expect(chip).toBeDisabled();
        await expect(chip).toContainText('Tu jornada ya terminó');
      }
    });
  }
});

test('3A · las cifras de Estadísticas y el contador de Logros llevan números de altura completa', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Ver estadísticas' }).click();
  const tarjeta = vis(page, '[data-pace-stats-tarjeta="focus"]').first();
  await expect(tarjeta).toBeVisible();
  const cifra = await tarjeta.evaluate((t) => {
    const c = Array.from(t.querySelectorAll('div')).find((d) => getComputedStyle(d).fontSize === '22px');
    return c ? getComputedStyle(c).fontVariantNumeric : 'sin cifra';
  });
  expect(cifra).toContain('lining-nums');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Ver logros' }).click();
  const cuenta = page.locator('[data-pace-ach-cuenta] > div').first();
  await expect(cuenta).toHaveText(/^0 \/ \d+$/);
  expect(await cuenta.evaluate((e) => getComputedStyle(e).fontVariantNumeric)).toContain('lining-nums');
});

test('6A · «Respiración guiada» y «Consejo:» en castellano', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).first().click();
  await expect(vis(page, '.pace-lib').getByText('Respiración guiada: pranayamas, coherencia, rondas.')).toBeVisible();
  await expect(page.getByText(/Breathwork/)).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /^Hidrátate/ }).first().click();
  await expect(page.getByText('Consejo:', { exact: true })).toBeVisible();
});

test('7A y 8A · «Un vaso menos» apagado a cero, y la semana vacía lo dice hasta el primer vaso', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const semanaVacia = async () => {
    await page.getByRole('button', { name: 'Ver estadísticas' }).click();
    await page.getByRole('button', { name: 'Semana', exact: true }).click();
    await expect(page.locator('[data-pace-week-view]')).toBeVisible();
    const n = await page.locator('[data-pace-semana-vacio]').count();
    await page.keyboard.press('Escape');
    await page.locator('[data-pace-week-view]').waitFor({ state: 'detached' });
    return n;
  };
  expect(await semanaVacia(), 'la semana vacía no lo dice').toBe(1);
  await expect(page.getByText('Esta semana aún no hay pausas en PACE.')).toHaveCount(0);

  await page.getByRole('button', { name: /^Hidrátate/ }).first().click();
  const menos = page.getByRole('button', { name: 'Un vaso menos' });
  await expect(menos).toBeDisabled();
  await page.getByRole('button', { name: 'Un vaso más' }).click();
  await expect(menos).toBeEnabled();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Un vaso menos' }).waitFor({ state: 'detached' });

  expect(await semanaVacia(), 'con un vaso, la semana ya no está vacía').toBe(0);
});

test('9A · «Escríbenos» sale en «Tus datos» y escribe al correo de PACE; sin dirección no sale', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  const enlace = page.locator('[data-pace-aj-contacto]');
  await expect(enlace).toHaveText('Escríbenos');
  await expect(enlace).toHaveAttribute('href', 'mailto:hola.ezradesign@gmail.com');
  /* Delante de «Seguridad · Privacidad», en la misma línea del pie. */
  const fila = await page.evaluate(() => {
    const caja = (s) => document.querySelector(s).getBoundingClientRect();
    const c = caja('[data-pace-aj-contacto]');
    const p = Array.from(document.querySelectorAll('.pace-aj-pie a')).find((a) => a.textContent === 'Privacidad').getBoundingClientRect();
    return { mismaFila: Math.abs(c.top - p.top) < 4, delante: c.right < p.left };
  });
  expect(fila).toEqual({ mismaFila: true, delante: true });
  await page.keyboard.press('Escape');
  await page.locator('[data-pace-tweaks-panel]').waitFor({ state: 'detached' });

  await page.evaluate(() => { window.PACE_CONTACTO = ''; });
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  await expect(page.locator('.pace-aj-pie a').filter({ hasText: 'Privacidad' })).toBeVisible();
  await expect(page.locator('[data-pace-aj-contacto]'), 'sin dirección no hay «Escríbenos»').toHaveCount(0);
});

/* En pacegrass.app Cloudflare cambia cada correo escrito en el HTML por «[email protected]», salvo entre
   <!--email_off--> y <!--/email_off-->. El JavaScript de la app va dentro de index.html: el correo de
   «Escríbenos» se compone al ejecutarse, y fuera de esas marcas no puede aparecer entero. */
test('9A · el correo no va escrito entero en index.html fuera de <!--email_off-->', async ({ page }) => {
  const html = await (await page.request.get(RUTA_ARTEFACTO)).text();
  const fuera = html.replace(/<!--email_off-->[\s\S]*?<!--\/email_off-->/g, '');
  expect(fuera).not.toMatch(/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/);
});

test('10A · la landing dice que leer las reuniones es cosa de Android y el iPhone', async ({ page }) => {
  const html = await (await page.request.get(RUTA_ARTEFACTO)).text();
  expect(html).toContain('En Android y en el iPhone, si se lo pides, mira a qué horas estás ocupado hoy');
  expect(html).toContain('On Android and iPhone, if you ask, it checks when you are busy today');
  expect(html).not.toContain('privado. Si se lo pides, mira');
});
