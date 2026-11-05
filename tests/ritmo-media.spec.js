/* PACE · E2E · LA MEDIA JORNADA ES UN HORARIO (s197 · v0.129.0)
 * ===============================================================
 * Decisión del usuario, en sus palabras: «la media jornada podría ser de mañana o de
 * tarde, o sea que el horario es flexible… también la jornada completa depende del
 * horario real de cada usuario» y «la media jornada ya no lleva comida, se entiende que
 * cuando se acabe ya se hace la comida — así la comida solo iría en jornada completa».
 *
 * QUE DEFIENDE:
 *  · la media jornada es un TRAMO con sus horas (no «3 h de foco desde que pulsas»):
 *    sirve de su inicio a su fin, y por la tarde también;
 *  · sus horas son SUYAS y se recuerdan (`horario.media`), aparte de las de la entera;
 *    mientras nadie las toque siguen a la entrada (4 h), y tocarlas recompone el día;
 *  · se editan en su cabecera, como la entera, y en «Ajustar el horario» (segunda frase);
 *  · fuera de su tramo se apaga, como la entera tras la salida;
 *  · LA COMIDA ES SOLO DE LA JORNADA ENTERA: «Dos horas» de 13:00 a 15:00 ya no la sirve;
 *  · las dos jornadas dicen su TRAMO en el chip y en la loseta («De 9:00 a 13:00»), porque
 *    son horarios personalizables; «Una hora» y «Dos horas» siguen con «Hasta las…».
 *
 * TRAMPA: el chip de una opción se calcula con `ritmoMenu(state, op)`, que NO es el día
 * servido; hay que mirar el del estado (`ritmoPlan`) para lo que está en marcha.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, pulsarComienza, ponerHora } = require('./helpers');

const HOY = '2026-09-22';
const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const dia = (opcion, extra) => Object.assign({ fecha: HOY, opcion, desde: 540, cicloBase: 0, cambios: {} }, extra || {});

async function abrir(page, context, ritmo, hora) {
  await sembrar(context, { ritmo: ritmo || {} });
  await page.clock.install({ time: new Date(hora || HOY + 'T09:00:00+02:00') });
  await irAlArtefacto(page);
}
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

test('la media jornada es un tramo con sus horas, y por la tarde también', async ({ page, context }) => {
  await abrir(page, context, {});
  const r = await page.evaluate((H) => {
    const menu = (h, op) => { const s = JSON.parse(JSON.stringify(getState())); s.ritmo = { horario: h }; return ritmoMenu(s, op, null, 540); };
    const porDefecto = menu(H, 'media');
    const tarde = menu(Object.assign({}, H, { media: { inicio: 900, salida: 1140 } }), 'media');
    /* «sigue a la entrada» es una preferencia derivada, no el día servido: el día no puede
       empezar antes de ahora, así que se mira `ritmoMedia`, que es quien la deriva. */
    const otra = ritmoMedia(Object.assign({}, H, { inicio: 480 }));
    return {
      defecto: [porDefecto.desde, porDefecto.hasta], tarde: [tarde.desde, tarde.hasta], otra: [otra.inicio, otra.salida],
      focosTarde: tarde.focos.length, comidaTarde: tarde.comida,
    };
  }, H);
  expect(r.defecto, 'sin tocar nada, cuatro horas desde tu entrada').toEqual([540, 780]);
  expect(r.otra, 'y si mueves la entrada, la sigue').toEqual([480, 720]);
  expect(r.tarde, 'con sus horas puestas, una tarde de 15:00 a 19:00').toEqual([900, 1140]);
  expect(r.focosTarde, 'que sirve bloques de verdad').toBeGreaterThan(2);
  expect(r.comidaTarde, 'y nunca come').toBe(null);
});

test('sus horas son suyas, se recuerdan y se editan en su cabecera', async ({ page, context }) => {
  await abrir(page, context, { horario: Object.assign({}, H, { media: { inicio: 900, salida: 1140 } }), dia: dia('media') },
    HOY + 'T15:05:00+02:00');
  const panel = vis(page, '[data-pace-ritmo-estado="menu"]');
  await expect(panel.locator('.pace-rt-titulo')).toContainText('Media jornada');
  const sels = panel.locator('[data-pace-ritmo-horario^="media."]');
  await expect(sels, 'dos selectores, los suyos, y ninguno de comida').toHaveCount(2);
  await expect(panel.locator('[data-pace-ritmo-horario="comida"]')).toHaveCount(0);
  const antes = await page.evaluate(() => { const m = ritmoPlan(getState()).m; return [m.desde, m.hasta]; });
  expect(antes).toEqual([900, 1140]);
  /* cambiar su fin recompone el día y se guarda como preferencia */
  await ponerHora(sels.nth(1), 1200);
  await page.waitForTimeout(400);
  const despues = await page.evaluate(() => { const s = getState(); const m = ritmoPlan(s).m; return { tramo: [m.desde, m.hasta], guardado: s.ritmo.horario.media, entera: [s.ritmo.horario.inicio, s.ritmo.horario.salida] }; });
  expect(despues.tramo, 'el día llega hasta la hora nueva').toEqual([900, 1200]);
  expect(despues.guardado, 'y queda guardada como preferencia').toEqual({ inicio: 900, salida: 1200 });
  expect(despues.entera, 'sin tocar las horas de la jornada entera').toEqual([540, 1020]);
});

test('mover otra hora no congela la media jornada: mientras nadie la toque, sigue a la entrada', async ({ page, context }) => {
  await abrir(page, context, { horario: H });
  const r = await page.evaluate(() => {
    ritmoHorario('inicio', 600);
    const s = getState();
    return { guardada: s.ritmo.horario.media, derivada: ritmoDe(s).horario.media };
  });
  expect(r.guardada, 'tocar la entrada guardaba la media jornada derivada y dejaba de seguirla').toBeUndefined();
  expect(r.derivada).toEqual({ inicio: 600, salida: 840 });
});

/* Cada hora tiene su selector, y mover una sola podía dejar un tramo que acaba antes de
   empezar: «de 15:00 a 13:00», apagado todo el día (un tester de Android, un sábado de
   media jornada). Ahora la otra hora va detrás y el tramo conserva lo que duraba, hasta el
   tope de su selector; si no se cruzan, solo cambia la hora tocada. */
test('una hora que cruza la otra la lleva detrás: ningún tramo acaba antes de empezar', async ({ page, context }) => {
  await abrir(page, context, { horario: H });
  const r = await page.evaluate((H) => {
    const tras = (horario, campo, v) => {
      ritmoGuardar(() => ({ horario: Object.assign({}, H, horario) }));
      ritmoHorario(campo, v);
      const h = getState().ritmo.horario;
      return { entera: [h.inicio, h.salida], media: h.media ? [h.media.inicio, h.media.salida] : null };
    };
    const manana = { media: { inicio: 540, salida: 780 } }, tarde = { media: { inicio: 900, salida: 1140 } };
    return {
      mediaATarde: tras(manana, 'media.inicio', 900),
      mediaAlTope: tras(manana, 'media.inicio', 1260),
      mediaSinCruzar: tras(manana, 'media.inicio', 600),
      finDeMediaAntes: tras(tarde, 'media.salida', 840),
      finDeMediaAlSuelo: tras(manana, 'media.salida', 360),
      entradaTrasLaSalida: tras({}, 'inicio', 1080),
      entradaALaSalida: tras({}, 'inicio', 1020),
      salidaAntesDeEntrar: tras({ inicio: 780 }, 'salida', 720),
      salidaSinCruzar: tras({}, 'salida', 720),
      yaDelReves: tras({ inicio: 1080 }, 'inicio', 1110),
      leidaDelReves: ritmoDe({ ritmo: { horario: Object.assign({}, H, { media: { inicio: 900, salida: 780 } }) } }).horario.media,
    };
  }, H);
  expect(r.mediaATarde, 'la media de 9:00 a 13:00 movida a las 15:00 acaba a las 19:00').toEqual({ entera: [540, 1020], media: [900, 1140] });
  expect(r.mediaAlTope, 'y no pasa del último fin que ofrece su selector').toEqual({ entera: [540, 1020], media: [1260, 1410] });
  expect(r.mediaSinCruzar, 'si no se cruzan, el fin se queda donde estaba').toEqual({ entera: [540, 1020], media: [600, 780] });
  expect(r.finDeMediaAntes, 'un fin antes del inicio lleva el inicio detrás').toEqual({ entera: [540, 1020], media: [600, 840] });
  expect(r.finDeMediaAlSuelo).toEqual({ entera: [540, 1020], media: [300, 360] });
  expect(r.entradaTrasLaSalida, 'la jornada entera también; sus ocho horas topan en las 23:30').toEqual({ entera: [1080, 1410], media: null });
  expect(r.entradaALaSalida, 'empezar a la hora de salir también cruza').toEqual({ entera: [1020, 1410], media: null });
  expect(r.salidaAntesDeEntrar).toEqual({ entera: [480, 720], media: null });
  expect(r.salidaSinCruzar, 'salir antes sin cruzar no mueve la entrada').toEqual({ entera: [540, 720], media: null });
  expect(r.yaDelReves, 'guardada del revés, toma la duración de fábrica').toEqual({ entera: [1110, 1410], media: null });
  expect(r.leidaDelReves, 'una media guardada del revés se lee con sus cuatro horas desde el inicio').toEqual({ inicio: 900, salida: 1140 });
});

test('en «Tu semana» el borrador también lleva el fin detrás, y se guarda así', async ({ page, context }) => {
  await abrir(page, context, { horario: H });
  await page.evaluate(() => ritmoSemanaAbrir());
  const hoja = vis(page, '[data-pace-semana-hoja]');
  await ponerHora(hoja.locator('[data-pace-ritmo-horario="media.inicio"]'), 900);
  await expect(hoja.locator('[data-pace-ritmo-horario="media.salida"]')).toHaveText('19:00');
  await ponerHora(hoja.locator('[data-pace-ritmo-horario="inicio"]'), 1080);
  await expect(hoja.locator('[data-pace-ritmo-horario="salida"]')).toHaveText('23:30');
  await hoja.locator('[data-pace-semana-guardar]').click();
  const h = await page.evaluate(() => getState().ritmo.horario);
  expect([h.inicio, h.salida, h.media]).toEqual([1080, 1410, { inicio: 900, salida: 1140 }]);
});

test('fuera de su tramo se apaga, como la entera tras la salida', async ({ page, context }) => {
  await abrir(page, context, { horario: Object.assign({}, H, { media: { inicio: 540, salida: 780 } }) }, HOY + 'T14:00:00+02:00');
  await pulsarComienza(page);
  const chip = vis(page, '[data-pace-ritmo-opcion="media"]');
  await expect(chip).toBeDisabled();
  await expect(chip).toContainText('Tu jornada ya terminó');
  await expect(vis(page, '[data-pace-ritmo-opcion="1h"]'), 'y una hora sigue estando').toBeEnabled();
});

test('la comida es solo de la jornada entera', async ({ page, context }) => {
  await abrir(page, context, {});
  const r = await page.evaluate((H) => {
    const menu = (op, desde) => { const s = JSON.parse(JSON.stringify(getState())); s.ritmo = { horario: H }; return ritmoMenu(s, op, null, desde); };
    const come = (m) => m.items.some((it) => it.tipo === 'comida');
    return { dos: come(menu('2h', 780)), media: come(menu('media', 540)), jornada: come(menu('jornada', 540)),
             mediaLarga: come(menu('media', 540)), horaSuelta: come(menu('1h', 810)) };
  }, H);
  expect(r.dos, '«Dos horas» de 13:00 a 15:00 cruza tu hora de comer y ya no la sirve').toBe(false);
  expect(r.horaSuelta, 'ni «Una hora» a las 13:30').toBe(false);
  expect(r.media, 'ni la media jornada').toBe(false);
  expect(r.jornada, 'la jornada entera sí').toBe(true);
});

test('las dos jornadas dicen su tramo; una hora y dos horas, hasta cuándo', async ({ page, context }) => {
  await abrir(page, context, {});
  await pulsarComienza(page);
  const txt = async (op) => (await vis(page, '[data-pace-ritmo-opcion="' + op + '"]').textContent()).trim();
  expect(await txt('media'), 'la media jornada, su tramo').toContain('De 9:00 a 13:00');
  expect(await txt('jornada'), 'la entera, el suyo').toContain('De 9:00 a 17:00');
  expect(await txt('1h')).toContain('Hasta las 10:00');
  expect(await txt('2h')).toContain('Hasta las 11:00');
  /* y lo mismo en las losetas de la tarjeta por libre */
  await vis(page, '[data-pace-ritmo-libre]').click();
  await page.waitForTimeout(400);
  const loseta = async (op) => (await vis(page, '[data-pace-ritmo-loseta="' + op + '"]').textContent()).trim();
  expect(await loseta('media')).toContain('De 9:00 a 13:00');
  expect(await loseta('jornada')).toContain('De 9:00 a 17:00');
  expect(await loseta('1h')).toContain('Hasta las 10:00');
});

test('«Ajustar el horario» lleva una segunda frase con las horas de la media jornada', async ({ page, context }) => {
  await abrir(page, context, {});
  await pulsarComienza(page);
  const pregunta = vis(page, '[data-pace-ritmo-estado="pregunta"]');
  const media = pregunta.locator('[data-pace-ritmo-frase-media]');
  await expect(media).toHaveCount(1);
  await expect(media).toContainText('Media jornada');
  await expect(media.locator('[data-pace-ritmo-horario^="media."]'), 'con sus dos horas editables aquí').toHaveCount(2);
  /* la primera frase sigue siendo la de la jornada entera, con su interruptor de comida */
  const primera = pregunta.locator('.pace-rt-frase').first();
  await expect(primera.locator('[data-pace-ritmo-comes]')).toHaveCount(1);
  await expect(primera, 'y la comida no se cuela en la de la media jornada').toContainText('comes');
  await expect(media).not.toContainText('comes');
  /* cambiarla aquí la guarda y el chip lo dice */
  await ponerHora(media.locator('[data-pace-ritmo-horario]').nth(1), 720);
  await page.waitForTimeout(400);
  await expect(vis(page, '[data-pace-ritmo-opcion="media"]')).toContainText('De 9:00 a 12:00');
});
