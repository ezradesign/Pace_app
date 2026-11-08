/* PACE · E2E · TODAS LAS HORAS SE ELIGEN CON EL PASO A PASO (la D de Ez, 5 nov. 2026)
 * ==================================================================================
 * «Quiero que todas se vean como la nueva, […] la UI debe ser muy amigable». Las horas de
 * «A tu ritmo» abrían la lista blanca del sistema, y la «Hora de inicio» de la media
 * jornada, una rejilla de 33 botones. Ahora todas abren lo mismo (RitmoHoraPaso): «− 9:00 +»
 * con el título de qué hora es, cómo está ahora y una salida que no cambia nada; mantener
 * pulsado avanza seguido, y pasada su hora la media jornada ofrece «Empezar ahora».
 *
 * Contra la versión anterior fallan todas: no había ni un paso a paso que abrir.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, pulsarComienza, ponerHora, RUTA_ARTEFACTO } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const MOVIL = { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true };

async function abrir(page, context, extra, hora) {
  await sembrar(context, Object.assign({ sidebarCollapsed: true, ritmo: { horario: HORARIO } }, extra || {}));
  await page.clock.install({ time: new Date(hora || '2026-11-05T10:00:00+01:00') });
  await irAlArtefacto(page);
}
const horario = (page) => page.evaluate(() => (getState().ritmo || {}).horario);
const hoyEmpezado = (page) => page.evaluate(() => !!(getState().ritmo || {}).dia);

/* Lo que cuenta en cualquier sitio: abre con su título y la hora de ahora, y Escape devuelve
   el foco a quien la abrió sin cambiar nada. */
async function comprobarUna(page, boton, titulo, grupo, valor, sub) {
  await expect(boton.locator('xpath=self::button'), 'es un botón, no un select').toHaveCount(1);
  const antes = await horario(page);
  await boton.click();
  const dialogo = page.getByRole('dialog', { name: titulo });
  await expect(dialogo).toBeVisible();
  await expect(dialogo).toContainText(grupo);
  await expect(dialogo).toContainText(sub);
  const numero = dialogo.getByRole('spinbutton', { name: titulo });
  await expect(numero).toHaveAttribute('aria-valuetext', valor);
  await expect(numero, 'el foco, en la hora').toBeFocused();
  await expect(dialogo.locator('[data-pace-ritmo-nota]')).toContainText('La que tienes');
  await page.keyboard.press('Escape');
  await expect(dialogo).toHaveCount(0);
  await expect(boton, 'el foco vuelve a la hora que se tocó').toBeFocused();
  expect(await horario(page)).toEqual(antes);
}

test.describe('en el móvil', () => {
  test.use(MOVIL);

  test('las cuatro horas de la línea del día abren su paso a paso, y la home sigue sin pedir scroll', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await abrir(page, context);
    await pulsarComienza(page);
    const dia = vis(page, '[data-pace-ritmo-dia]');
    await expect(vis(page, 'select[data-pace-ritmo-horario]'), 'ni una lista del sistema').toHaveCount(0);
    await comprobarUna(page, dia.locator('[data-pace-ritmo-horario="inicio"]'), 'Hora de inicio', 'Jornada entera', '9:00', 'Ahora va de 9:00 a 17:00.');
    await comprobarUna(page, dia.locator('[data-pace-ritmo-horario="salida"]'), 'Hora de fin', 'Jornada entera', '17:00', 'Ahora va de 9:00 a 17:00.');
    await comprobarUna(page, dia.locator('[data-pace-ritmo-horario="comida"]'), 'Hora de comer', 'Comida', '14:00', 'Ahora comes a las 14:00 durante 1 h.');
    await comprobarUna(page, dia.locator('[data-pace-ritmo-horario="comidaDur"]'), 'Cuánto dura', 'Comida', '1 h', 'Ahora comes a las 14:00 durante 1 h.');
    await asentarGeometria(page);
    expect(await page.evaluate(() => {
      const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
      return body.scrollHeight - body.clientHeight;
    })).toBeLessThanOrEqual(1);
    expect(errores).toEqual([]);
  });

  test('«Dejar», la × y tocar fuera salen sin cambiar nada; solo «Cambiar a» guarda, y el fin va detrás', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await abrir(page, context);
    await pulsarComienza(page);
    const inicio = vis(page, '[data-pace-ritmo-horario="inicio"]');
    const dialogo = page.getByRole('dialog', { name: 'Hora de inicio' });
    const mas = dialogo.locator('[data-pace-ritmo-mas]');
    const cambiar = dialogo.locator('[data-pace-ritmo-cambiar]');

    for (const salir of ['dejar', 'cruz', 'fuera']) {
      await inicio.click();
      await expect(cambiar, 'sin tocar nada no hay nada que cambiar').toBeHidden();
      await mas.click();
      await expect(dialogo.locator('[data-pace-ritmo-nota]')).toHaveText('Tenías las 9:00');
      await expect(cambiar).toHaveText('Cambiar a las 9:30');
      if (salir === 'dejar') await dialogo.locator('[data-pace-ritmo-dejar]').click();
      if (salir === 'cruz') await dialogo.locator('[data-pace-modal-close]').click();
      if (salir === 'fuera') await page.mouse.click(180, 10);
      await expect(dialogo).toHaveCount(0);
      expect(await horario(page), 'salir con «' + salir + '»').toEqual(HORARIO);
    }

    await inicio.click();
    await mas.click();
    await cambiar.click();
    await expect(dialogo).toHaveCount(0);
    await expect(inicio).toHaveText('9:30');
    expect((await horario(page)).inicio).toBe(570);

    /* Lo de la 0.189.1 sigue valiendo: una hora que cruza la otra se la lleva detrás. */
    await ponerHora(vis(page, '[data-pace-ritmo-horario="salida"]'), 720);
    await ponerHora(inicio, 780);
    const h = await horario(page);
    expect([h.inicio, h.salida], 'el fin conserva lo que duraba').toEqual([780, 930]);
    expect(errores).toEqual([]);
  });

  /* «De 9:00 a 15:00 no pueden ser doce toques». */
  test('mantener pulsado + avanza seguido y se para al soltar; un toque es un paso', async ({ page, context }) => {
    await abrir(page, context);
    await pulsarComienza(page);
    await vis(page, '[data-pace-ritmo-horario="inicio"]').click();
    const numero = page.locator('[data-pace-ritmo-paso]');
    const valor = async () => Number(await numero.getAttribute('aria-valuenow'));
    const caja = await page.locator('[data-pace-ritmo-mas]').boundingBox();
    const cdp = await page.context().newCDPSession(page);
    const punto = { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 };

    const t0 = Date.now();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [punto] });
    await expect.poll(valor, { intervals: [50] }).toBeGreaterThanOrEqual(900);
    const ms = Date.now() - t0;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    expect(ms, 'de 9:00 a 15:00, de una sola vez').toBeLessThan(3000);
    const soltado = await valor();
    await page.waitForTimeout(400);
    expect(await valor(), 'al soltar se para').toBe(soltado);

    await page.locator('[data-pace-ritmo-menos]').click();
    expect(await valor(), 'un toque, un paso').toBe(soltado - 30);
    await page.locator('[data-pace-ritmo-menos]').click();
    expect(await valor()).toBe(soltado - 60);
  });

  test('con el tope, el botón se apaga sin perder el foco y no pasa de ahí', async ({ page, context }) => {
    await abrir(page, context, { ritmo: { horario: Object.assign({}, HORARIO, { salida: 1380 }) } });
    await pulsarComienza(page);
    await vis(page, '[data-pace-ritmo-horario="salida"]').click();
    const numero = page.locator('[data-pace-ritmo-paso]');
    const mas = page.locator('[data-pace-ritmo-mas]');
    await numero.press('ArrowUp');
    await expect(numero).toHaveAttribute('aria-valuetext', '23:30');
    await expect(mas).toHaveAttribute('aria-disabled', 'true');
    await mas.focus();
    await page.keyboard.press('Enter');
    await expect(mas, 'sigue teniendo el foco').toBeFocused();
    await expect(numero).toHaveAttribute('aria-valuetext', '23:30');
  });

  test('la duración de la comida va por sus cinco valores y cabe en la carta', async ({ page, context }) => {
    await abrir(page, context);
    await pulsarComienza(page);
    await vis(page, '[data-pace-ritmo-horario="comidaDur"]').click();
    const dialogo = page.getByRole('dialog', { name: 'Cuánto dura' });
    const numero = dialogo.getByRole('spinbutton');
    await numero.press('Home');
    await expect(numero).toHaveAttribute('aria-valuetext', '30 min');
    await expect(dialogo.locator('[data-pace-ritmo-menos]')).toHaveAccessibleName('Menos tiempo');
    await expect(dialogo.locator('[data-pace-ritmo-mas]')).toHaveAccessibleName('Más tiempo');
    await expect(dialogo.locator('[data-pace-ritmo-cambiar]')).toHaveText('Cambiar a 30 min');
    await expect(dialogo.locator('[data-pace-ritmo-dejar]')).toHaveText('Dejar 1 h');
    const dentro = await numero.evaluate((e) => {
      const r = document.createRange(); r.selectNodeContents(e); const t = r.getBoundingClientRect();
      const a = e.previousElementSibling.getBoundingClientRect(), b = e.nextElementSibling.getBoundingClientRect();
      return t.left >= a.right && t.right <= b.left;
    });
    expect(dentro, 'el número no pisa los botones').toBe(true);
    await numero.press('End');
    await expect(numero).toHaveAttribute('aria-valuetext', '2 h');
    await numero.press('Enter');
    expect((await horario(page)).comidaDur).toBe(120);
  });

  /* Lo elegido a la vez que la hora de inicio: el atajo solo pone la hora (Ez, 4 nov.). */
  test('pasada su hora, «Empezar ahora» pone la media jornada desde ahora y no empieza el día', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await abrir(page, context, null, '2026-11-05T15:07:00+01:00');
    await pulsarComienza(page);
    const pregunta = vis(page, '[data-pace-ritmo-estado="pregunta"]');
    const horas = pregunta.locator('[data-pace-ritmo-media-horas]');
    await horas.locator('[data-pace-ritmo-media-abrir]').click();
    const dialogo = page.getByRole('dialog', { name: 'Hora de inicio' });
    await expect(dialogo).toContainText('Media jornada');
    const ahora = dialogo.locator('[data-pace-ritmo-ahora]');
    await expect(ahora).toContainText('Empezar ahora');
    await expect(ahora).toContainText('De 15:05 a 19:05');
    expect(await dialogo.evaluate((c) => c.scrollHeight - c.clientHeight), 'cabe sin scroll dentro').toBeLessThanOrEqual(0);
    await ahora.click();
    await expect(dialogo).toHaveCount(0);
    const h = await horario(page);
    expect(h.media, 'el fin va detrás con sus cuatro horas').toEqual({ inicio: 905, salida: 1145 });
    expect(await hoyEmpezado(page), 'solo pone la hora: el día no ha empezado').toBe(false);
    const chip = pregunta.locator('button[data-pace-ritmo-opcion="media"]');
    await expect(chip).toBeEnabled();
    await expect(chip).toContainText('19:05');
    await chip.click();
    await expect(vis(page, '[data-pace-ritmo-estado="menu"]')).toContainText('Media jornada');
    expect(await page.evaluate(() => ritmoPlan(getState()).m.opcion)).toBe('media');
    expect(errores).toEqual([]);
  });

  test('«Empezar ahora» no sale en las otras horas ni en «Tu semana»', async ({ page, context }) => {
    await abrir(page, context, null, '2026-11-05T15:07:00+01:00');
    await pulsarComienza(page);
    const ahora = page.locator('[data-pace-ritmo-ahora]');
    await vis(page, '[data-pace-ritmo-horario="media.salida"]').click();
    await expect(page.locator('[data-pace-ritmo-paso]')).toBeVisible();
    await expect(ahora, 'la hora de fin no empieza nada').toHaveCount(0);
    await page.keyboard.press('Escape');
    await page.evaluate(() => ritmoSemanaAbrir());
    const hoja = vis(page, '[data-pace-semana-hoja]');
    await hoja.locator('[data-pace-ritmo-horario="media.inicio"]').click();
    await expect(page.locator('[data-pace-ritmo-paso]')).toBeVisible();
    await expect(ahora, '«Tu semana» habla de cada semana, no de hoy').toHaveCount(0);
  });

  test('en la bienvenida la hora sale por encima y lo que se elige se queda en el borrador', async ({ page }) => {
    await page.goto(RUTA_ARTEFACTO);
    await page.getByRole('button', { name: 'Comenzar' }).click();
    const editor = page.locator('[data-pace-semana-editor]');
    await editor.waitFor({ state: 'visible' });
    const inicio = editor.locator('[data-pace-ritmo-horario="inicio"]');
    await inicio.click();
    const numero = page.locator('[data-pace-ritmo-paso]');
    await expect(numero).toBeVisible();
    expect(await numero.evaluate((e) => { const r = e.getBoundingClientRect();
      return !!document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2).closest('[data-pace-ritmo-paso]'); }), 'la bienvenida no la tapa').toBe(true);
    await numero.press('ArrowDown');
    await numero.press('Enter');
    await expect(numero).toHaveCount(0);
    await expect(inicio).toHaveText('8:30');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2') || '{}').ritmo), 'un borrador no escribe').toBeUndefined();
  });
});

test.describe('en el ordenador', () => {
  test('las seis horas de la frase abren su paso a paso, también con el día servido', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await abrir(page, context);
    await pulsarComienza(page);
    const pregunta = vis(page, '[data-pace-ritmo-estado="pregunta"]');
    await expect(pregunta.locator('[data-pace-ritmo-horario]')).toHaveCount(6);
    await expect(pregunta.locator('select')).toHaveCount(0);
    const hora = (c) => pregunta.locator('[data-pace-ritmo-horario="' + c + '"]');
    await comprobarUna(page, hora('media.inicio'), 'Hora de inicio', 'Media jornada', '9:00', 'Ahora va de 9:00 a 13:00.');
    await comprobarUna(page, hora('media.salida'), 'Hora de fin', 'Media jornada', '13:00', 'Ahora va de 9:00 a 13:00.');
    await page.evaluate(() => ritmoElegir('jornada'));
    const menu = vis(page, '[data-pace-ritmo-estado="menu"]');
    await comprobarUna(page, menu.locator('[data-pace-ritmo-horario="salida"]'), 'Hora de fin', 'Jornada entera', '17:00', 'Ahora va de 9:00 a 17:00.');
    expect(errores).toEqual([]);
  });

  test('con el teclado: flechas, Av Pág, Inicio, Fin e Intro, y Tab no se sale', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await abrir(page, context);
    await pulsarComienza(page);
    const inicio = vis(page, '[data-pace-ritmo-horario="inicio"]');
    await inicio.focus();
    await page.keyboard.press('Enter');
    const dialogo = page.getByRole('dialog', { name: 'Hora de inicio' });
    const numero = dialogo.getByRole('spinbutton', { name: 'Hora de inicio' });
    await expect(numero).toBeFocused();
    const pulsar = async (tecla, hora) => { await page.keyboard.press(tecla); await expect(numero, tecla).toHaveAttribute('aria-valuetext', hora); };
    await pulsar('ArrowUp', '9:30');
    await pulsar('ArrowRight', '10:00');
    await pulsar('ArrowDown', '9:30');
    await pulsar('ArrowLeft', '9:00');
    await pulsar('PageUp', '10:00');
    await pulsar('PageDown', '9:00');
    await pulsar('Home', '5:00');
    await pulsar('End', '21:00');
    await pulsar('ArrowUp', '21:00');
    await page.keyboard.press('Home');
    await pulsar('PageDown', '5:00');
    await pulsar('PageUp', '6:00');

    /* − y + se llegan con Tab y responden a Intro y Espacio, y Tab da la vuelta dentro. */
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement.closest('[data-pace-modal-card]')), 'Tab, dentro').toBe(true);
    }
    await numero.focus();
    await page.keyboard.press('Tab');
    await expect(dialogo.locator('[data-pace-ritmo-mas]')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(numero).toHaveAttribute('aria-valuetext', '6:30');
    await page.keyboard.press('Space');
    await expect(numero).toHaveAttribute('aria-valuetext', '7:00');

    await numero.focus();
    await page.keyboard.press('Enter');
    await expect(dialogo).toHaveCount(0);
    await expect(inicio).toBeFocused();
    await expect(inicio).toHaveText('7:00');
    expect((await horario(page)).inicio).toBe(420);
    expect(errores).toEqual([]);
  });

  test('para el lector de pantalla: el diálogo, la hora y los botones se nombran, y la hora nueva se dice', async ({ page, context }) => {
    await abrir(page, context);
    await pulsarComienza(page);
    const inicio = vis(page, '[data-pace-ritmo-horario="inicio"]');
    await expect(inicio, 'el nombre lleva lo que se ve').toHaveAccessibleName('Hora a la que empiezas, 9:00');
    await expect(inicio).toHaveAttribute('aria-haspopup', 'dialog');
    await inicio.click();
    const dialogo = page.getByRole('dialog', { name: 'Hora de inicio' });
    await expect(dialogo).toHaveAttribute('aria-modal', 'true');
    const numero = dialogo.getByRole('spinbutton', { name: 'Hora de inicio' });
    await expect(numero).toHaveAttribute('aria-valuemin', '300');
    await expect(numero).toHaveAttribute('aria-valuemax', '1260');
    await expect(numero).toHaveAttribute('aria-valuenow', '540');
    await expect(dialogo.getByRole('button', { name: 'Media hora antes' })).toBeVisible();
    await expect(dialogo.getByRole('button', { name: 'Media hora después' })).toBeVisible();
    await expect(dialogo.getByRole('button', { name: 'Dejar las 9:00' })).toBeVisible();
    const oido = dialogo.locator('[aria-live="polite"]');
    await expect(oido, 'al abrir no dice nada').toHaveText('');
    await dialogo.getByRole('button', { name: 'Media hora después' }).click();
    await expect(oido, 'con el botón el foco no está en la hora: se dice aparte').toHaveText('9:30');
    await numero.press('ArrowUp');
    await expect(oido, 'con las flechas ya la dice el propio número: no dos veces').toHaveText('');
    await expect(numero).toHaveAttribute('aria-valuetext', '10:00');
  });

  test('en inglés dice lo mismo', async ({ page, context }) => {
    await abrir(page, context, { lang: 'en' }, '2026-11-05T15:07:00+01:00');
    await pulsarComienza(page);
    await vis(page, '[data-pace-ritmo-horario="media.inicio"]').click();
    const dialogo = page.getByRole('dialog', { name: 'Start time' });
    await expect(dialogo).toContainText('Half day');
    await expect(dialogo).toContainText('Right now it runs from 9:00 to 13:00.');
    await expect(dialogo.locator('[data-pace-ritmo-ahora]')).toContainText('Start now');
    await expect(dialogo.locator('[data-pace-ritmo-ahora]')).toContainText('From 15:05 to 19:05');
    await dialogo.locator('[data-pace-ritmo-mas]').click();
    await expect(dialogo.locator('[data-pace-ritmo-nota]')).toHaveText('Previously 9:00');
    await expect(dialogo.locator('[data-pace-ritmo-dejar]')).toHaveText('Keep 9:00');
    await expect(dialogo.locator('[data-pace-ritmo-cambiar]')).toHaveText('Change to 9:30');
  });

  for (const [caso, extra, hora] of [
    ['si la media jornada aún cabe', { ritmo: { horario: Object.assign({}, HORARIO, { media: { inicio: 900, salida: 1140 } }) } }, '2026-11-05T15:07:00+01:00'],
    ['pasadas las 21:00, el tope de su inicio', null, '2026-11-05T21:10:00+01:00'],
  ]) {
    test('«Empezar ahora» no sale ' + caso, async ({ page, context }) => {
      await abrir(page, context, extra, hora);
      await pulsarComienza(page);
      await vis(page, '[data-pace-ritmo-horario="media.inicio"]').click();
      await expect(page.locator('[data-pace-ritmo-paso]')).toBeVisible();
      await expect(page.locator('[data-pace-ritmo-ahora]')).toHaveCount(0);
    });
  }

  test('sobre «Tu semana», tocar fuera cierra solo la hora', async ({ page, context }) => {
    await abrir(page, context);
    await page.evaluate(() => ritmoSemanaAbrir());
    const hoja = vis(page, '[data-pace-semana-hoja]');
    await hoja.locator('[data-pace-ritmo-horario="inicio"]').first().click();
    await expect(page.locator('[data-pace-ritmo-paso]')).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.locator('[data-pace-ritmo-paso]')).toHaveCount(0);
    await expect(hoja, 'la hoja de debajo sigue').toBeVisible();
  });

  test('mantener pulsado con el ratón también avanza, y salirse del botón lo para', async ({ page, context }) => {
    await abrir(page, context);
    await pulsarComienza(page);
    await vis(page, '[data-pace-ritmo-horario="inicio"]').click();
    const numero = page.locator('[data-pace-ritmo-paso]');
    const valor = async () => Number(await numero.getAttribute('aria-valuenow'));
    const caja = await page.locator('[data-pace-ritmo-mas]').boundingBox();
    await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await page.mouse.down();
    await expect.poll(valor, { intervals: [50] }).toBeGreaterThanOrEqual(690);
    await page.mouse.move(caja.x - 100, caja.y);
    const fuera = await valor();
    await page.waitForTimeout(400);
    expect(await valor(), 'fuera del botón se para').toBeLessThanOrEqual(fuera + 30);
    const quieto = await valor();
    await page.waitForTimeout(300);
    expect(await valor()).toBe(quieto);
    await page.mouse.up();
  });
});
