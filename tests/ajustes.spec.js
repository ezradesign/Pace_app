/* PACE · E2E · EL PANEL DE AJUSTES (s188)
 * =======================================
 * Defiende el panel redisenado en s188: cuatro temas en un orden, una fila por
 * ajuste, el color que dice de que modulo es cada ajuste SIN romper el
 * contraste, el sonido que atenua en vez de esconder, y que todo cabe en una
 * pantalla de escritorio. La forma se eligio mirandola en cinco rondas de
 * maqueta (docs/proposals/ajustes-rediseno*.html); esto vigila que lo
 * construido sea lo aprobado y que nadie lo deshaga sin enterarse.
 *
 * LOS ASERTOS SON RELACIONALES donde pueden: no dicen «el lavado es #EFE4DB»,
 * dicen que la pildora elegida de una fila de modulo NO es la tinta ni el
 * papel de la pista (o sea, lleva color) y que su texto pasa 4,5:1 sobre lo
 * que hay debajo. Si manana cambia un token, esto sigue diciendo lo que debe.
 *
 * TRAMPA MEDIDA (s188): en Chromium headless `Notification.permission` es
 * 'denied' SIEMPRE, aunque el contexto conceda el permiso. La app pinta
 * entonces la nota «bloqueadas para este sitio» (dos lineas) y el panel crece
 * 35 px que en un navegador de verdad no existen. Se fija el permiso a
 * 'default' desde un init script: es lo que ve una instalacion nueva.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, CLAVE_ESTADO } = require('./helpers');

const PANEL = '[data-pace-tweaks-panel]';

async function comoNavegadorReal(context) {
  await context.addInitScript(() => {
    try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (e) {}
  });
}

async function abrirAjustes(page) {
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.locator(PANEL).waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
}

function leerEstado(page) {
  return page.evaluate((clave) => JSON.parse(localStorage.getItem(clave) || '{}'), CLAVE_ESTADO);
}

/* Alto del contenido y del hueco, y si hay scroll: se pregunta al elemento. */
function medidas(page) {
  return page.evaluate((sel) => {
    const p = document.querySelector(sel);
    return { contenido: p.scrollHeight, hueco: p.clientHeight, scrollea: p.scrollHeight > p.clientHeight };
  }, PANEL);
}

/* Contraste WCAG del texto de una pildora contra lo que hay debajo, componiendo
   los fondos con alfa hasta el papel del panel (la pista es papel-2 opaco, el
   lavado de modulo lleva alfa). Devuelve, por fila, el color de la pildora
   elegida y su contraste. */
function pildorasElegidas(page) {
  return page.evaluate((sel) => {
    const p = document.querySelector(sel);
    const rgba = (s) => { const m = s.match(/[\d.]+/g) || [0, 0, 0, 1]; const k = s.startsWith('color(srgb') ? 255 : 1; return { r: +m[0] * k, g: +m[1] * k, b: +m[2] * k, a: m.length > 3 ? +m[3] : 1 }; };
    const sobre = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
    const lum = (c) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
    const contraste = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
    const papel = rgba(getComputedStyle(p).backgroundColor);
    const tinta = getComputedStyle(p).color;
    const fondoReal = (el) => { const capas = []; let n = el; while (n && n !== p) { capas.push(rgba(getComputedStyle(n).backgroundColor)); n = n.parentElement; } let bg = papel; for (let i = capas.length - 1; i >= 0; i--) if (capas[i].a > 0) bg = sobre(capas[i], bg); return bg; };
    const out = {};
    p.querySelectorAll('[data-pace-aj-fila]').forEach(fila => {
      const on = fila.querySelector('.pace-aj-pild[aria-pressed="true"]');
      if (!on) return;
      const cs = getComputedStyle(on);
      out[fila.dataset.paceAjFila] = {
        modulo: fila.dataset.paceAjModulo || null,
        fondo: cs.backgroundColor,
        pista: getComputedStyle(on.parentElement).backgroundColor,
        tinta,
        contraste: +contraste(rgba(cs.color), fondoReal(on)).toFixed(2),
      };
    });
    return out;
  }, PANEL);
}

test.describe('ajustes · el panel de s188', () => {
  test.beforeEach(async ({ context }) => {
    await sembrar(context);
    await comoNavegadorReal(context);
  });

  test('cuatro temas en su orden, una fila por ajuste, y «Disposición» ya no está', async ({ page }) => {
    const errores = capturarErrores(page);
    await irAlArtefacto(page);
    await abrirAjustes(page);

    const secciones = await page.locator(PANEL + ' [data-pace-aj-seccion]').evaluateAll(els => els.map(e => e.dataset.paceAjSeccion));
    expect(secciones).toEqual(['Ver', 'Oír', 'Sesiones', 'Tus datos']);

    const filas = await page.locator(PANEL + ' [data-pace-aj-fila]').evaluateAll(els => els.map(e => e.dataset.paceAjFila));
    expect(filas).toEqual(['lang', 'palette', 'sound', 'signal', 'bg', 'notify', 'circle', 'rest', 'water']);

    /* Retirada tras bandera (SHOW_LAYOUT_AXIS): duplicaba el boton de plegar la barra. */
    await expect(page.locator(PANEL + ' [data-pace-aj-fila="layout"]')).toHaveCount(0);
    /* Y el bloque premium de 221 px es ahora una linea: ningun input salvo el de importar. */
    await expect(page.locator(PANEL + ' input:not([type="file"])')).toHaveCount(0);
    await expect(page.locator(PANEL)).toContainText('Licencia');
    expect(errores).toEqual([]);
  });

  test('cabe en una pantalla de escritorio: a 1280×800 no hay scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await irAlArtefacto(page);
    await abrirAjustes(page);
    const m = await medidas(page);
    /* Antes del rediseno: 1412 px de contenido en un hueco de 750 (1,9
       pantallas). El aserto no es «menos que antes»: es «cabe». Si alguien
       devuelve las descripciones o el bloque premium, se pone rojo. */
    expect(m.scrollea, `contenido ${m.contenido} en un hueco de ${m.hueco}`).toBe(false);
  });

  test('en móvil la hoja se queda por debajo de 1,3 pantallas (antes 2,2)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await irAlArtefacto(page);
    await abrirAjustes(page);
    const m = await medidas(page);
    /* Medido al implementar: 743 en 607 = 1,22. La hoja es de 72 dvh a
       proposito (s27), asi que aqui SI scrollea; lo que se vigila es que no
       vuelva a ser el panel de dos pantallas y pico. */
    expect(m.contenido / m.hueco).toBeLessThan(1.3);
  });

  test('apagar el sonido atenúa sus dos filas y NO mueve el panel', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await irAlArtefacto(page);
    await abrirAjustes(page);
    const antes = await medidas(page);
    await expect(page.locator(PANEL + ' [data-pace-aj-fila="signal"][data-atenuada]')).toHaveCount(0);

    await page.getByRole('switch', { name: 'Sonido' }).click();
    await expect(page.locator(PANEL + ' [data-pace-aj-fila="signal"][data-atenuada]')).toHaveCount(1);
    await expect(page.locator(PANEL + ' [data-pace-aj-fila="bg"][data-atenuada]')).toHaveCount(1);
    /* Siguen en el DOM (atenuadas, no escondidas): el alto no cambia. Antes
       desaparecian y el panel saltaba 84 px. */
    const despues = await medidas(page);
    expect(despues.contenido).toBe(antes.contenido);
    expect((await leerEstado(page)).soundOn).toBe(false);

    await page.getByRole('switch', { name: 'Sonido' }).click();
    await expect(page.locator(PANEL + ' [data-pace-aj-fila="signal"][data-atenuada]')).toHaveCount(0);
  });

  test('el color dice de qué módulo es el ajuste, y el texto elegido pasa 4,5:1 en las dos paletas', async ({ page }) => {
    await irAlArtefacto(page);
    await abrirAjustes(page);
    for (const paleta of ['Crema', 'Oscuro']) {
      await page.locator(PANEL + ' [data-pace-aj-fila="palette"]').getByRole('button', { name: paleta, exact: true }).click();
      await page.waitForTimeout(700); /* el cruce entre paletas dura 640 ms (s161) */
      const e = await pildorasElegidas(page);
      /* Lo global va en tinta: la pildora elegida ES el color del texto del panel. */
      for (const fila of ['lang', 'palette', 'signal', 'bg']) {
        expect(e[fila].modulo, fila).toBeNull();
        expect(e[fila].fondo, `${fila} en ${paleta}`).toBe(e[fila].tinta);
      }
      /* Lo de un modulo lleva color: ni tinta ni el papel de la pista. */
      for (const fila of ['circle', 'rest']) {
        expect(e[fila].modulo, fila).toBeTruthy();
        expect(e[fila].fondo, `${fila} en ${paleta}`).not.toBe(e[fila].tinta);
        expect(e[fila].fondo, `${fila} en ${paleta}`).not.toBe(e[fila].pista);
      }
      /* Y en TODAS la elegida se lee: terracota o tabaco con texto claro darian
         2,8-3,3:1, por eso el color entra como lavado con el texto en tinta. */
      for (const fila of Object.keys(e)) {
        expect(e[fila].contraste, `${fila} en ${paleta}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test('el círculo se elige entre pictogramas y el nombre baja a la línea del módulo', async ({ page }) => {
    await irAlArtefacto(page);
    await abrirAjustes(page);
    const fila = page.locator(PANEL + ' [data-pace-aj-fila="circle"]');
    /* Las cuatro pildoras son solo dibujo (con su nombre para el lector de pantalla). */
    await expect(fila.locator('.pace-aj-pild[data-picto]')).toHaveCount(4);
    await expect(fila.locator('.pace-aj-sub')).toHaveText('Respira · Loto');
    await fila.getByRole('button', { name: 'Ondas', exact: true }).click();
    await expect(fila.locator('.pace-aj-sub')).toHaveText('Respira · Ondas');
    expect((await leerEstado(page)).breathStyle).toBe('ondas');
  });

  test('«Marca la fase» es UNA decisión: tono apaga la voz, cada voz la enciende con su timbre', async ({ page }) => {
    await irAlArtefacto(page);
    await abrirAjustes(page);
    const senal = page.locator(PANEL + ' [data-pace-aj-fila="signal"]');
    await senal.getByRole('button', { name: 'Tono', exact: true }).click();
    expect((await leerEstado(page)).voiceOn).toBe(false);
    await senal.getByRole('button', { name: 'Voz grave', exact: true }).click();
    let s = await leerEstado(page);
    expect([s.voiceOn, s.voice]).toEqual([true, 'bradford']);
    await senal.getByRole('button', { name: 'Voz clara', exact: true }).click();
    s = await leerEstado(page);
    expect([s.voiceOn, s.voice]).toEqual([true, 'sulafat']);

    /* Y «Suena detras» es excluyente: nunca dos capas (s176). */
    const fondo = page.locator(PANEL + ' [data-pace-aj-fila="bg"]');
    await fondo.getByRole('button', { name: 'Música', exact: true }).click();
    s = await leerEstado(page);
    expect([s.musicOn, s.ambientOn]).toEqual([true, false]);
    await fondo.getByRole('button', { name: 'Ambiente', exact: true }).click();
    s = await leerEstado(page);
    expect([s.musicOn, s.ambientOn]).toEqual([false, true]);
  });

  test('en inglés el panel habla inglés, incluida la línea del módulo', async ({ page, context }) => {
    await context.addInitScript((clave) => {
      const s = JSON.parse(localStorage.getItem(clave) || '{}');
      s.lang = 'en'; s.langAuto = false;
      localStorage.setItem(clave, JSON.stringify(s));
    }, CLAVE_ESTADO);
    await irAlArtefacto(page);
    await page.getByRole('button', { name: 'Open settings' }).click();
    await page.locator(PANEL).waitFor({ state: 'visible' });
    const secciones = await page.locator(PANEL + ' [data-pace-aj-seccion]').evaluateAll(els => els.map(e => e.dataset.paceAjSeccion));
    expect(secciones).toEqual(['Look', 'Listen', 'Sessions', 'Your data']);
    await expect(page.locator(PANEL + ' [data-pace-aj-fila="circle"] .pace-aj-sub')).toHaveText('Breathe · Lotus');
    await expect(page.locator(PANEL)).toContainText('Everything lives in your browser.');
  });
});

test.describe('ajustes · la migración de «minimal»', () => {
  test('quien tenía la disposición minimal pasa a sidebar con la barra plegada', async ({ page, context }) => {
    /* La misma bandera que esconde el eje gobierna la migracion (regla s139):
       sin esto, quien eligio «minimal» se quedaria sin barra y sin selector. */
    await sembrar(context, { layout: 'minimal', sidebarCollapsed: false });
    await irAlArtefacto(page);
    const s = await page.evaluate(() => (window.getState ? window.getState() : {}));
    expect(s.layout).toBe('sidebar');
    expect(s.sidebarCollapsed).toBe(true);
  });
});
