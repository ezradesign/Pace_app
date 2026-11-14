/* PACE · tests/ajustes-escuchar.spec.js
   ======================================
   «ESCUCHAR» Y DÓNDE SUENA LA MÚSICA (Ez, 6A del 8 nov. 2026; la A2 de la segunda vuelta, 9 nov.).
   La voz se elegía sin poder oírla. Tal como se pintó primero, dos líneas más pedían scroll en el
   móvil de 640 px, y como aviso pasajero tapaba «Sesiones» (Ez: «se superpone con otras
   opciones»). La A2: «Escuchar ›» en la línea del título «Oír», a la derecha, como «Visita
   guiada ›», y «La música, solo en Respira» en la línea pequeña de «Suena detrás».

   QUÉ DEFIENDE, a 360×640 en la web y en Android, en es y en en: «Escuchar» va en la línea de
   «Oír» y a su derecha sin pisar el título; la frase de la música sale, en una sola línea y sin
   pisar los botones de su fila; los Ajustes siguen sin scroll; «Escuchar» hace sonar la señal de
   la inhalación, y con el sonido apagado no se puede tocar. Sin la línea pequeña o con el botón
   suelto con el sonido apagado, cae.
*/
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const PANEL = '[data-pace-tweaks-panel]';
const TX = {
  es: { abrir: 'Abrir ajustes', oir: 'Oír', musica: 'La música, solo en Respira' },
  en: { abrir: 'Open settings', oir: 'Audio', musica: 'Music plays only in Breathe' },
};

async function comoAndroid(page) {
  await page.evaluate(() => {
    window.paceNativoAvisos = () => true; window.pacePlataformaNativa = () => 'android';
    window.paceNativoAvisoPermiso = () => 'granted'; window.paceEsNativo = () => true;
    window.paceAndroidAvisoExacto = () => 'denied'; window.paceAndroidAvisoExactoMirar = () => Promise.resolve('denied');
  });
}

async function abrir(page, lang) {
  await page.locator('button[aria-label="' + TX[lang].abrir + '"]').filter({ visible: true }).first().click();
  await expect(page.locator(PANEL)).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(450);   // la entrada de la hoja (pace-slide-up, 280 ms)
}

function medir(page) {
  return page.evaluate((sel) => {
    const p = document.querySelector(sel);
    const btn = p.querySelector('[data-pace-aj-escuchar]');
    const tit = btn && btn.parentElement;
    let titulo = null;
    if (tit) {
      const r = document.createRange();
      r.selectNodeContents(tit.firstChild);
      titulo = r.getBoundingClientRect();
    }
    const fila = p.querySelector('[data-pace-aj-fila="bg"]');
    const sub = fila && fila.querySelector('.pace-aj-sub');
    const caja = (e) => { const b = e.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom, h: b.height }; };
    const pisa = (a, b) => a.l < b.r - 0.5 && b.l < a.r - 0.5 && a.t < b.b - 0.5 && b.t < a.b - 0.5;
    const subC = sub ? caja(sub) : null;
    const botones = fila ? Array.from(fila.querySelectorAll('button')).map(caja) : [];
    return {
      scroll: p.scrollHeight - p.clientHeight,
      boton: btn ? caja(btn) : null,
      titulo: titulo ? { l: titulo.left, r: titulo.right, t: titulo.top, b: titulo.bottom } : null,
      subTexto: sub ? sub.textContent.trim() : null,
      subLineas: sub ? sub.getClientRects().length : 0,
      subAlto: subC ? subC.h : 0,
      subLetra: sub ? parseFloat(getComputedStyle(sub).fontSize) : 0,
      subPisaBoton: subC ? botones.some((b) => pisa(subC, b)) : null,
      botonPisaTitulo: btn && titulo ? pisa(caja(btn), { l: titulo.left, r: titulo.right, t: titulo.top, b: titulo.bottom }) : null,
    };
  }, PANEL);
}

for (const lang of ['es', 'en']) for (const android of [false, true]) {
  test(`móvil ${lang} 360×640${android ? ' Android' : ''}: «Escuchar» junto a «Oír» y la música en su línea pequeña, sin scroll`, async ({ page, context }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await sembrar(context, { lang, notifyFocusEnd: true });
    await irAlArtefacto(page);
    if (android) await comoAndroid(page);
    await abrir(page, lang);
    const m = await medir(page);
    expect(m.boton, '«Escuchar» está en la línea de «Oír»').not.toBeNull();
    expect(m.titulo).not.toBeNull();
    /* En la misma línea que el título y a su derecha, sin pisarlo */
    expect(m.boton.t).toBeLessThan(m.titulo.b);
    expect(m.boton.b).toBeGreaterThan(m.titulo.t);
    expect(m.boton.l).toBeGreaterThanOrEqual(m.titulo.r);
    expect(m.botonPisaTitulo).toBe(false);
    /* La frase de la música, entera, en una línea, sin pisar los botones de su fila */
    expect(m.subTexto).toBe(TX[lang].musica);
    expect(m.subLineas).toBe(1);
    expect(m.subAlto).toBeLessThan(m.subLetra * 2);
    expect(m.subPisaBoton).toBe(false);
    /* Y los Ajustes siguen sin scroll (ajustes-movil.spec.js) */
    expect(m.scroll).toBeLessThanOrEqual(0);
  });
}

test('«Escuchar» hace sonar la inhalación, y con el sonido apagado no se puede tocar', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await sembrar(context, { lang: 'es', voiceOn: false });
  await irAlArtefacto(page);
  await page.evaluate(() => {
    window.__sonidos = [];
    const original = window.playSound;
    window.playSound = function (id) { window.__sonidos.push(id); try { return original.apply(this, arguments); } catch (e) {} };
  });
  await abrir(page, 'es');
  const btn = page.locator(PANEL + ' [data-pace-aj-escuchar]');
  await expect(btn).toBeEnabled();
  await btn.click();
  await expect.poll(() => page.evaluate(() => window.__sonidos.slice())).toContain('breathe.inhale');

  /* Con el sonido apagado, el botón no se puede tocar */
  await page.evaluate(() => setState({ soundOn: false }));
  await expect(btn).toBeDisabled();
});
