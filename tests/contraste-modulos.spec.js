/* PACE · la letra y los botones de color se leen (Ez, 1B · 2B · 3B, 7 nov. 2026)
 * =============================================================================
 * La auditoría de accesibilidad de la 0.192.0 midió que la letra en el color de cada módulo
 * («¿Es tu primera vez? Empieza aquí», «Para ahora», «Premium», el ⚠, «+ vaso», los títulos
 * de familia de Logros) daba 2,1-3,9 a 1 sobre el crema, y que los botones rellenos de ese
 * color con la letra del papel encima («Hacer la pausa», «Empezar», «Un vaso más») daban
 * 2,8-3,7; en oscuro fallaban Mueve, Estira e Hidrátate. Los logros sin ganar iban al 55 % de
 * opacidad entera (2,0 a 1) y la fecha de la barra al 75 % (2,6).
 *
 * Ez eligió, mirando fotos (docs/audits/accesibilidad-7nov/pagina-ez.html), la B de las tres:
 *  · cada módulo tiene un color hondo (`--breathe-deep`…) con su mismo tono y croma en OKLCH y
 *    otra luz, solo para la letra de color y el relleno de esos botones;
 *  · en el logro sin ganar se apagan el sello y el borde, no el nombre ni la frase;
 *  · la fecha de la barra, sin transparencia.
 *
 * Las dos primeras pruebas leen los tokens y caen si uno vuelve a su color de antes; las
 * demás miran la app pintada y caen si una letra o un botón vuelve al color de módulo.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior, terminarBloque, esperarModalAsentado } = require('./helpers');

const MODULOS = ['breathe', 'move', 'extra', 'hydrate', 'achievement', 'premium'];

/* ------------------------------------------------------------------ color, en Node */
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const sobre = (c, a, fondo) => c.map((v, i) => v * a + fondo[i] * (1 - a));
function oklch(c) {
  const [r, g, b] = c.map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return { L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, C: Math.hypot(A, B), H: (Math.atan2(B, A) * 180 / Math.PI + 360) % 360 };
}

/* Los tokens tal como los resuelve la página: [r, g, b, a]. */
function tokens(page) {
  return page.evaluate((mods) => {
    const sonda = document.createElement('i'); document.body.appendChild(sonda);
    const cs = getComputedStyle(document.documentElement);
    const leer = (n) => {
      sonda.style.color = cs.getPropertyValue(n).trim();
      const v = getComputedStyle(sonda).color.match(/[\d.]+/g).map(Number);
      return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1];
    };
    const out = { paper: leer('--paper'), paper2: leer('--paper-2') };
    for (const m of mods) { out[m] = leer('--' + m); out[m + '-deep'] = leer('--' + m + '-deep'); out[m + '-soft'] = leer('--' + m + '-soft'); }
    sonda.remove();
    return out;
  }, MODULOS);
}

/* Lo peor que tiene detrás la letra de color: el papel, la tarjeta y el fondo suave del módulo
   sobre la tarjeta. */
function peorFondo(t, m) {
  const fondos = [t.paper, t.paper2, sobre(t[m + '-soft'].slice(0, 3), t[m + '-soft'][3], t.paper2)];
  return Math.min(...fondos.map((f) => ratio(t[m + '-deep'], f)));
}

for (const [paleta, boton] of [['crema', 5.45], ['oscuro', 5.7]]) {
  test(`en ${paleta}, el color hondo de cada módulo es su mismo tono, se lee como letra y lleva la letra del papel`, async ({ page, context }) => {
    await sembrar(context, { palette: paleta });
    await irAlArtefacto(page);
    const t = await tokens(page);
    for (const m of MODULOS) {
      const base = oklch(t[m]), hondo = oklch(t[m + '-deep']);
      expect(Math.abs(base.H - hondo.H), `${m}: el hondo cambia de tono`).toBeLessThan(2);
      expect(Math.abs(base.C - hondo.C), `${m}: el hondo cambia de croma`).toBeLessThan(0.004);
      expect(peorFondo(t, m), `${m}: la letra honda no llega a 4,5 a 1`).toBeGreaterThanOrEqual(4.5);
      expect(ratio(t.paper, t[m + '-deep']), `${m}: el botón relleno con la letra del papel`).toBeGreaterThanOrEqual(boton);
      /* En claro el hondo es más oscuro y en oscuro más claro (o el mismo, si ya llegaba). */
      if (paleta === 'crema') expect(hondo.L, `${m}: en claro, el hondo es más oscuro`).toBeLessThan(base.L);
      else expect(hondo.L, `${m}: en oscuro, el hondo no es más oscuro`).toBeGreaterThanOrEqual(base.L - 0.001);
    }
  });
}

/* ------------------------------------------------------------------ la app, pintada */
/* Cada texto visible bajo la raíz cuyo color es el de un módulo y no su hondo (en crema todos
   son distintos), y cada botón relleno de él. */
function censo(page, raizSel) {
  return page.evaluate(({ raizSel, mods }) => {
    const sonda = document.createElement('i'); document.body.appendChild(sonda);
    const cs = getComputedStyle(document.documentElement);
    const rgb = (v) => { sonda.style.color = ''; sonda.style.color = v; return getComputedStyle(sonda).color.match(/[\d.]+/g).slice(0, 3).map(Number).join(','); };
    const viejos = {};
    for (const m of mods) {
      const base = rgb(cs.getPropertyValue('--' + m).trim()), hondo = rgb(cs.getPropertyValue('--' + m + '-deep').trim());
      if (base !== hondo) viejos[base] = m;
    }
    sonda.remove();
    const de = (c) => viejos[(c.match(/[\d.]+/g) || []).slice(0, 3).map(Number).join(',')];
    const raices = [...document.querySelectorAll(raizSel)].filter((e) => e.getClientRects().length);
    const raiz = raices[raices.length - 1];
    const malos = []; let vistos = 0;
    const andador = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    for (let n = andador.nextNode(); n; n = andador.nextNode()) {
      const el = n.parentElement;
      if (!n.textContent.trim() || !el || el.closest('svg') || !el.getClientRects().length) continue;
      const s = getComputedStyle(el);
      if (s.visibility !== 'visible') continue;
      vistos++;
      if (de(s.color)) malos.push('letra ' + de(s.color) + ': ' + n.textContent.trim().slice(0, 40));
      const b = el.closest('button');
      if (b && de(getComputedStyle(b).backgroundColor)) malos.push('botón ' + de(getComputedStyle(b).backgroundColor) + ': ' + b.textContent.trim().slice(0, 40));
    }
    return { vistos, malos: [...new Set(malos)] };
  }, { raizSel, mods: MODULOS });
}
const colorDe = (loc, prop) => loc.evaluate((e, p) => getComputedStyle(e)[p], prop);
const tokenRgb = (page, n) => page.evaluate((n) => {
  const i = document.createElement('i'); document.body.appendChild(i);
  i.style.color = getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const c = getComputedStyle(i).color; i.remove(); return c;
}, n);

test.describe('en crema, la letra y los botones de color van en el hondo', () => {
  test.beforeEach(async ({ context }) => { await sembrar(context, { soundOn: false }); });

  /* A 360: en escritorio ese rótulo va en el lateral, en el gris de los rótulos. */
  test('la biblioteca de Respira, en el móvil: «¿Es tu primera vez?», el ⚠ y «Premium»', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 760 });
    await irAlArtefacto(page);
    await page.getByRole('button', { name: /^Respira/ }).click();
    const lib = page.locator('.pace-lib').filter({ visible: true });
    await expect(lib.locator('.pace-lib-now').filter({ visible: true }).first(), 'GUARD: no salió el rótulo de la primera vez').toBeVisible();
    expect(await colorDe(lib.locator('.pace-lib-now').filter({ visible: true }).first(), 'color')).toBe(await tokenRgb(page, '--breathe-deep'));
    expect(await colorDe(lib.locator('.pace-lib-safety').filter({ visible: true }).first(), 'color')).toBe(await tokenRgb(page, '--breathe-deep'));
    expect(await colorDe(lib.locator('.pace-lib-pre').filter({ visible: true }).first(), 'color')).toBe(await tokenRgb(page, '--premium-deep'));
    const r = await censo(page, '[data-pace-modal-backdrop]');
    expect(r.vistos, 'GUARD: el censo no vio ningún texto').toBeGreaterThan(10);
    expect(r.malos).toEqual([]);
  });

  test('«Antes de empezar» de Mueve: el «Empezar» relleno y la duración', async ({ page }) => {
    await irAlArtefacto(page);
    await page.getByRole('button', { name: /^Mueve/ }).click();
    await page.locator('.pace-lib [data-pace-lib-card] h4 button').filter({ visible: true }).first().click();
    const empezar = overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true });
    await expect(empezar).toBeVisible();
    expect(await colorDe(empezar, 'backgroundColor')).toBe(await tokenRgb(page, '--move-deep'));
    expect((await censo(page, '[data-pace-modal-backdrop]')).malos).toEqual([]);
  });

  test('Hidrátate: la cifra y «Un vaso más»', async ({ page }) => {
    await irAlArtefacto(page);
    await page.getByRole('button', { name: /^Hidrátate/ }).first().click();
    const vasos = page.getByRole('dialog', { name: /Hidrátate/ });
    expect(await colorDe(vasos.getByRole('button', { name: 'Un vaso más', exact: true }), 'backgroundColor')).toBe(await tokenRgb(page, '--hydrate-deep'));
    await vasos.getByRole('button', { name: 'Un vaso más', exact: true }).click();
    expect((await censo(page, '[data-pace-modal-backdrop]')).malos).toEqual([]);
  });

  test('la ventana de la pausa: el motivo y el botón del plato', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-09-17T09:00:00+02:00') });
    await irAlArtefacto(page);
    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await page.waitForTimeout(300);
    await terminarBloque(page);
    const plato = overlaySuperior(page).locator('.pace-break-llena');
    await expect(plato, 'GUARD: la pausa no propuso nada').toHaveCount(1);
    const fondo = await colorDe(plato, 'backgroundColor');
    const hondos = await Promise.all(['--extra-deep', '--move-deep', '--breathe-deep', '--hydrate-deep'].map((n) => tokenRgb(page, n)));
    expect(hondos, 'el botón del plato no va en un hondo').toContain(fondo);
    expect((await censo(page, '[data-pace-modal-backdrop]')).malos).toEqual([]);
  });

  test('la barra lateral: «+ vaso» en el hondo y la fecha sin transparencia', async ({ page }) => {
    await irAlArtefacto(page);
    const barra = page.locator('[data-pace-sidebar]').filter({ visible: true });
    const vaso = barra.locator('[data-pace-hoy-vaso]');
    await expect(vaso).toBeVisible();
    expect(await colorDe(vaso, 'color')).toBe(await tokenRgb(page, '--hydrate-deep'));
    expect(await colorDe(vaso, 'borderTopColor')).toBe(await tokenRgb(page, '--hydrate-deep'));
    const fecha = barra.getByText(/^(lun|mar|mié|jue|vie|sáb|dom) \d+ \w+/i).first();
    await expect(fecha).toBeVisible();
    expect(await fecha.evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
    expect((await censo(page, '[data-pace-sidebar]')).malos).toEqual([]);
  });

  test('Logros: los títulos de familia en el hondo, y en el logro sin ganar solo se apagan el sello y el borde', async ({ page }) => {
    await irAlArtefacto(page);
    await page.getByRole('button', { name: 'Ver logros' }).click();
    await esperarModalAsentado(page);
    const modal = overlaySuperior(page);
    const maestria = modal.getByRole('heading', { name: 'Maestría', exact: true });
    await expect(maestria).toBeVisible();
    expect(await colorDe(maestria, 'color')).toBe(await tokenRgb(page, '--achievement-deep'));
    const sinGanar = modal.locator('[data-pace-ach]').first();
    /* La opacidad que le llega a la letra, con la del modal que aún entra: se espera a que sea 1. */
    await expect.poll(() => sinGanar.evaluate((e) => {
      let op = 1; for (let x = e; x; x = x.parentElement) op *= Number(getComputedStyle(x).opacity);
      return op;
    }), { message: 'la tarjeta entera vuelve a ir apagada', timeout: 5000 }).toBe(1);
    const sello = await sinGanar.locator('[data-pace-ach-sello]').evaluate((e) => Number(getComputedStyle(e).opacity));
    expect(sello, 'el sello del logro sin ganar no va apagado').toBeCloseTo(0.55, 2);
    expect((await censo(page, '[data-pace-modal-backdrop]')).malos).toEqual([]);
  });
});

test('en oscuro, «Empezar» de Mueve va en el hondo de oscuro, más claro que el de módulo', async ({ page, context }) => {
  await sembrar(context, { palette: 'oscuro', soundOn: false });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Mueve/ }).click();
  await page.locator('.pace-lib [data-pace-lib-card] h4 button').filter({ visible: true }).first().click();
  const empezar = overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true });
  await expect(empezar).toBeVisible();
  expect(await colorDe(empezar, 'backgroundColor')).toBe(await tokenRgb(page, '--move-deep'));
  expect(await tokenRgb(page, '--move-deep')).not.toBe(await tokenRgb(page, '--move'));
  expect((await censo(page, '[data-pace-modal-backdrop]')).malos).toEqual([]);
});
