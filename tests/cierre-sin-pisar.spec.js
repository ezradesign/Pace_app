/* PACE · E2E · EN EL CIERRE DE UNA SESIÓN NINGÚN BOTÓN PISA A OTRO
 * ==================================================================
 * Ez (15 oct. 2026), en el cierre de «Escritorio express» en su pantalla de 1920×1080 al
 * 125 %: «Volver al inicio» tapaba «Ahora no» y solo asomaba la parte de arriba de sus
 * letras. Su ventana útil, con las barras de Chrome y de Windows, mide unos 1536×710.
 *
 * Venía de v0.167.0: el dibujo de Mueve y Estira crecía con una fórmula (el alto de la
 * ventana menos 600 px, de 120 a 216) que dejaba el cierre justo lleno, sin un píxel de
 * margen. Entre 701 y 719 px de alto el dibujo se quedaba en su mínimo de 120 y no cabía;
 * con un nombre de rutina en dos líneas no cabía en casi ningún tamaño; y en escritorio,
 * de 431 a 620 px de alto, tampoco. El centro hace scroll sin barra, así que lo que no
 * cabe queda cortado justo encima del pie y parece tapado por «Volver al inicio».
 *
 * Ez eligió la B (16 oct., con fotos de la app real): «Ahora no» va en la fila de las
 * respuestas, el cierre ocupa el alto del centro y, si aun así no cabe, el dibujo encoge.
 *
 * Se mide lo que ve la persona: la caja de cada botón (las tres respuestas, «Ahora no»,
 * «Volver al inicio» y «Salir»), que ninguna caja pise a otra y que cada botón se vea
 * entero (una rejilla de puntos sobre su caja, preguntando qué elemento hay encima).
 *
 * Contra v0.170.1 cae: «Ahora no» se ve al 33 % a 1536×702, y a 1280×500 las tres
 * respuestas quedan debajo de «Volver al inicio».
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');

async function hastaElCierre(page, context, { extra, modulo, rutina, empezarAhora }) {
  await sembrar(context, extra);
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: modulo }).first().click();
  await overlaySuperior(page).getByRole('heading', { name: rutina, exact: true }).filter({ visible: true }).first().click();
  const empezar = overlaySuperior(page).getByRole('button', { name: /^(Empezar|Start)$/ });
  if (await empezar.count()) await empezar.click();
  const sesion = page.locator('[data-pace-session-root]');
  if (empezarAhora) await sesion.getByRole('button', { name: empezarAhora }).click();
  const done = sesion.locator('[data-pace-session-done]');
  for (let s = 0; s < 500 && !(await done.count()); s++) { await page.clock.fastForward(1000); await page.waitForTimeout(8); }
  await expect(done, 'GUARD: la sesión no llegó al cierre').toHaveCount(1);
  await expect(sesion.locator('[data-pace-fb-ghost]'), 'GUARD: el cierre no pregunta «¿Te ayudó?»').toHaveCount(1);
  /* El dibujo entra con un fundido: se mide con la caja ya quieta. */
  await page.waitForTimeout(700);
}

/* Cada botón del cierre: su caja, en px de pantalla como `elementFromPoint`, y qué parte
   de una rejilla de 9×3 puntos cae en el propio botón (100 = se ve entero). */
const medir = (page) => page.evaluate(() => {
  const raiz = document.querySelector('[data-pace-session-root]');
  const botones = [...raiz.querySelectorAll('[data-pace-fb-chip], [data-pace-fb-ghost], [data-pace-session-footer] button, [data-pace-session-header] button')];
  const datos = botones.map((el) => {
    const r = el.getBoundingClientRect();
    let dentro = 0;
    for (let i = 1; i <= 9; i++) for (let j = 1; j <= 3; j++) {
      const e = document.elementFromPoint(r.left + r.width * i / 10, r.top + r.height * j / 4);
      if (e && (e === el || el.contains(e))) dentro++;
    }
    return { nombre: el.textContent.trim(), x0: r.left, x1: r.right, y0: r.top, y1: r.bottom, visto: Math.round(100 * dentro / 27) };
  });
  const solapes = [];
  for (let a = 0; a < datos.length; a++) for (let b = a + 1; b < datos.length; b++) {
    const A = datos[a], B = datos[b];
    const ancho = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0), alto = Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0);
    if (ancho > 0.5 && alto > 0.5) solapes.push('«' + A.nombre + '» y «' + B.nombre + '» (' + Math.round(ancho) + '×' + Math.round(alto) + ' px)');
  }
  return { botones: datos, solapes };
});

async function comprobarEn(page, tamanos) {
  const fallos = [];
  for (const [w, h] of tamanos) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const m = await medir(page);
    expect(m.botones.length, 'GUARD: a ' + w + '×' + h + ' no están los seis botones del cierre').toBe(6);
    const tapados = m.botones.filter((b) => b.visto < 100).map((b) => '«' + b.nombre + '» al ' + b.visto + ' %');
    if (tapados.length || m.solapes.length) fallos.push(w + '×' + h + ': ' + tapados.concat(m.solapes).join(', '));
  }
  expect(fallos, 'en el cierre un botón pisa a otro').toEqual([]);
}

const alturas = (w, desde, hasta, paso) => {
  const out = [];
  for (let h = desde; h <= hasta; h += paso) out.push([w, h]);
  return out;
};

/* Los tamaños de siempre, la ventana de Ez (1080p al 125 % con las barras del navegador)
   y la de un portátil de 1080p al 150 % (unos 1280×600 útiles). */
const COMUNES = [[360, 640], [390, 844], [1280, 720], [1366, 768], [1440, 900], [1536, 864], [1920, 1080], [1536, 708], [1280, 600]];

test('Estira · ningún botón del cierre pisa a otro, de 1280×440 a 1920×1080 y en el móvil', async ({ page, context }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1536, height: 864 });
  await hastaElCierre(page, context, { modulo: /^Estira/, rutina: 'Escritorio express' });
  /* Ez eligió la B: «Ahora no» al final de la fila de las respuestas, no debajo. */
  const fila = await page.evaluate(() => {
    const centro = (el) => { const r = el.getBoundingClientRect(); return (r.top + r.bottom) / 2; };
    return Math.abs(centro(document.querySelector('[data-pace-fb-ghost]')) - centro([...document.querySelectorAll('[data-pace-fb-chip]')].pop()));
  });
  expect(fila, '«Ahora no» no va en la fila de las respuestas').toBeLessThan(4);
  await comprobarEn(page, COMUNES
    .concat(alturas(1536, 701, 719, 3))
    .concat(alturas(1280, 440, 900, 10))
    .concat(alturas(360, 600, 700, 20)));
});

test('Mueve, en inglés · ningún botón del cierre pisa a otro', async ({ page, context }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1536, height: 864 });
  await hastaElCierre(page, context, { extra: { lang: 'en' }, modulo: /^Move/, rutina: 'Stealth Calf Raises' });
  await comprobarEn(page, COMUNES.concat(alturas(1536, 701, 719, 6)).concat(alturas(1280, 450, 650, 20)));
});

/* Respira lleva su dibujo a 72 px y ya se tapaba en las ventanas más bajas del escritorio. */
test('Respira · ningún botón del cierre pisa a otro', async ({ page, context }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1536, height: 864 });
  await hastaElCierre(page, context, { modulo: /^Respira/, rutina: 'Suspiro fisiológico', empezarAhora: 'Empezar ahora' });
  await comprobarEn(page, COMUNES.concat(alturas(1280, 440, 620, 10)));
});

/* Una rutina propia admite 40 letras de nombre, que en el cierre ocupan dos líneas. */
test('una rutina propia con el nombre en dos líneas · ningún botón del cierre pisa a otro', async ({ page, context }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1536, height: 864 });
  const nombre = 'Mi rutina de media mañana en la oficina';
  await hastaElCierre(page, context, {
    extra: {
      premiumUnlocked: true,
      customRoutines: [{
        id: 'custom.1760000000000', name: nombre,
        steps: [
          { name: 'Encogimiento de hombros', dur: 20, cue: 'Hombros arriba, luego relaja.' },
          { name: 'Giro sentado', dur: 20, cue: 'Rota hacia el respaldo.' },
        ],
        createdAt: 1760000000000, updatedAt: 1760000000000,
      }],
    },
    modulo: /^Mueve/, rutina: nombre, empezarAhora: 'Empezar ahora',
  });
  const lineas = await page.locator('[data-pace-session-done-title]').evaluate((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)));
  expect(lineas, 'GUARD: el nombre no ocupa dos líneas, así que no prueba nada').toBe(2);
  await comprobarEn(page, COMUNES.concat([[1536, 800], [1366, 700], [1280, 640]]));
});
