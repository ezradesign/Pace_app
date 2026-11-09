/* PACE · E2E · EL SELLO DENTRO DEL ARO (10 oct. 2026)
 * ===================================================
 * Desde v0.152.0 el aviso de un sello nuevo sale en la home dentro del aro, en el sitio de su
 * línea en cursiva (app/ui/Toast.jsx). Ez lo vio mal en su móvil (360×718): el texto cortado
 * con puntos suspensivos («Nuevo sello · Prim…»), el dibujo convertido en un signo diminuto
 * («}» o «?») y, con varios sellos a la vez, unos encima de otros y del contador.
 *
 * Tres cosas que se miden en el móvil, en castellano y en inglés:
 *  · el texto cabe entero: nada recortado por dentro (scrollWidth > clientWidth);
 *  · va sin dibujo: Ez eligió la opción B, solo el texto, mirando fotos (10 oct.); el dibujo
 *    diminuto era el «}» o el «?» que vio;
 *  · dos sellos van uno detrás de otro (fila de s145): nunca hay dos a la vista, y ninguno toca
 *    el contador ni la raya de debajo.
 *
 * Los avisos se piden con `showToast`, que es la puerta de todos (state-core.toast.jsx): el
 * mecanismo que decide CUÁNDO salen ya lo vigila sello-espera.spec.js; esto mira CÓMO salen.
 * «Cuarenta y cinco sellos» (master.collector.half) es el título más largo del catálogo.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const LARGO = 'master.collector.half';

async function home(page, context, ancho, alto, lang) {
  await page.setViewportSize({ width: ancho, height: alto });
  await sembrar(context, { lang, langAuto: false });
  await irAlArtefacto(page);
  await page.evaluate(() => document.fonts.ready);
}

/* Lo que hay a la vista: cada sello del aro, su texto, su dibujo y las cajas con las que no
   puede chocar. */
const foto = (page) => page.evaluate(() => {
  const caja = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { t: r.top, b: r.bottom, l: r.left, r: r.right }; };
  const sellos = [...document.querySelectorAll('[data-pace-sello-aro]')].filter((d) => +getComputedStyle(d).opacity > 0.05);
  return {
    numero: caja(document.querySelector('[data-pace-dial-number]')),
    raya: caja(document.querySelector('[data-pace-dial-divider]')),
    sellos: sellos.map((d) => {
      const texto = d.querySelector('[data-pace-sello-texto]') || d.lastElementChild;
      /* un dibujo es cualquier cosa que no sea el texto: la máscara, un SVG o el carácter */
      const dibujo = [...d.children].some((c) => c !== texto) || !!d.querySelector('svg, [style*="mask"]');
      return { caja: caja(d), texto: d.textContent, cortado: texto.scrollWidth > texto.clientWidth + 1, dibujo };
    }),
  };
});
const choca = (a, b) => !!(a && b && a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b);

for (const [ancho, alto] of [[360, 640], [360, 718]]) {
  for (const lang of ['es', 'en']) {
    test(`${ancho}×${alto} · ${lang} · el sello más largo cabe entero, y va sin dibujo`, async ({ page, context }) => {
      await home(page, context, ancho, alto, lang);
      const titulo = await page.evaluate((id) => {
        const a = window.ACHIEVEMENT_CATALOG.find((x) => x.id === id);
        return getState().lang === 'en' ? (window.PACE_STRINGS.en['ach.item.' + id + '.title'] || a.title) : a.title;
      }, LARGO);
      await page.evaluate((id) => showToast({ id, type: 'achievement' }), LARGO);
      await expect(page.locator('[data-pace-sello-aro]'), 'GUARD: el sello no salió en el aro').toHaveCount(1);
      await page.waitForTimeout(500);
      const f = await foto(page);
      expect(f.sellos.length).toBe(1);
      const s = f.sellos[0];
      expect(s.texto, 'falta el título del sello').toContain(titulo);
      expect(s.cortado, `el texto sale cortado: «${s.texto}»`).toBe(false);
      expect(s.dibujo, 'el sello del aro lleva dibujo (Ez eligió solo el texto)').toBe(false);
      expect(choca(s.caja, f.numero), 'el sello pisa el contador').toBe(false);
      expect(choca(s.caja, f.raya), 'el sello pisa la raya del aro').toBe(false);
    });
  }
}

test('360×718 · tres sellos a la vez salen uno detrás de otro, sin pisarse ni pisar el contador', async ({ page, context }) => {
  await home(page, context, 360, 718, 'es');
  const ids = ['first.step', LARGO, 'secret.zen'];
  await page.evaluate((lista) => lista.forEach((id) => showToast({ id, type: 'achievement' })), ids);
  await expect(page.locator('[data-pace-sello-aro]').first(), 'GUARD: no salió ningún sello').toBeVisible();
  const vistos = new Set();
  let maximo = 0;
  const choques = [];
  for (let i = 0; i < 70 && vistos.size < ids.length; i++) {
    const f = await foto(page);
    maximo = Math.max(maximo, f.sellos.length);
    for (const s of f.sellos) {
      vistos.add(s.texto);
      if (choca(s.caja, f.numero)) choques.push('contador: ' + s.texto);
      if (choca(s.caja, f.raya)) choques.push('raya: ' + s.texto);
    }
    await page.waitForTimeout(200);
  }
  expect(maximo, 'dos sellos a la vista a la vez').toBe(1);
  expect(choques, 'un sello pisa el aro').toEqual([]);
  expect(vistos.size, 'no salieron los tres, uno detrás de otro').toBe(ids.length);
});

/* EL SELLO SIGUE AL HUECO SI EL ARO CAMBIA MIENTRAS SE VE (caza de la semana, 7 nov. 2026). El hueco
   se medía una vez, al salir, y el sello es `position: fixed`: con la pausa en el aro, su línea en
   cursiva («Luego, el bloque 2») va justo bajo el número; al pulsar «Empezar ya el bloque 2» el aro
   pasa a ser el del bloque, el número crece y su línea baja, y el sello se quedaba donde estaba,
   ENCIMA del número («Nuevo sello · Día de foco» sobre el 45:00), y lo mismo al cerrarse el día. */
const RITMO = {
  semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'],
  horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 },
};
for (const [ancho, alto] of [[1280, 720], [360, 718]]) {
  test(`${ancho}×${alto} · un sello a la vista sigue en el hueco del aro cuando el aro pasa de la pausa al bloque`, async ({ page, context }) => {
    const { terminarBloque } = require('./helpers');
    await page.setViewportSize({ width: ancho, height: alto });
    await sembrar(context, { ritmo: RITMO, lastActiveDay: new Date(2026, 10, 8).toDateString() });
    await page.clock.install({ time: new Date(2026, 10, 9, 9, 0) });
    await irAlArtefacto(page);
    const vis = (sel) => page.locator(sel).filter({ visible: true });
    const comienza = vis('[data-pace-ritmo-comienza]');
    if (await comienza.count()) await comienza.first().click();
    await vis('[data-pace-ritmo-habitual-comienza], [data-pace-ritmo-loseta="jornada"]').first().click();
    await vis('[data-pace-cta]').first().click();
    await page.waitForTimeout(250);
    await terminarBloque(page);
    await vis('[data-pace-break-shortcut] button:not([data-pace-break-cuenta])').first().click();   /* «Ahora no» */
    await page.waitForTimeout(300);

    /* El sello sale con la pausa en el aro (el reloj quieto: no se va a los 3 s). */
    await page.evaluate(() => showToast({ id: 'first.step', type: 'achievement' }));
    await page.clock.fastForward(1200);
    await expect(page.locator('[data-pace-sello-aro]'), 'GUARD: el sello no salió en el aro').toHaveCount(1);
    await page.waitForTimeout(500);   /* su fundido de entrada va con el reloj de verdad */
    const centro = (c) => (c.t + c.b) / 2;
    const sub = () => page.evaluate(() => { const r = document.querySelector('[data-pace-dial-subtitle]').getBoundingClientRect(); return { t: r.top, b: r.bottom }; });
    const antes = await foto(page);
    expect(Math.abs(centro(antes.sellos[0].caja) - centro(await sub())), 'GUARD: con la pausa, el sello está en el hueco de su línea').toBeLessThan(3);

    await vis('button').filter({ hasText: /^Empezar ya el bloque 2$/ }).first().click();
    await page.waitForTimeout(400);
    const f = await foto(page);
    expect(f.sellos.length, 'GUARD: el sello sigue a la vista').toBe(1);
    expect(centro(f.numero) - centro(antes.numero), 'GUARD: el aro cambió de forma').not.toBe(0);
    expect(choca(f.sellos[0].caja, f.numero), 'el sello pisa el número del aro').toBe(false);
    expect(Math.abs(centro(f.sellos[0].caja) - centro(await sub())), 'el sello sigue en el hueco de la línea del aro').toBeLessThan(3);
  });
}
