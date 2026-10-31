/* Fotos de lo MONTADO en la rama (index.html compilado, sin nada inyectado): 1A con el sobre en
   sus dos estados, 2A y 4B. Uso: node montado.js  →  ./montado/*.jpg y ./montado/medidas.json */
'use strict';
const path = require('path');
const fs = require('fs');
const C = require('./comun');
const SALIDA = path.join(C.FOTOS, 'montado');
const medidas = {};
const LUNES = new Date('2026-11-02T09:00:00+01:00');
const MARTES = new Date('2026-11-03T09:05:00+01:00');
const VISTAS = [[360, 730, 'm', 2], [1280, 879, 'e', 1.5]];
const TEMAS = [[false, ''], [true, '-osc']];

async function foto(page, n, clip) {
  medidas[n] = await page.evaluate(() => {
    const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
    const c = document.querySelector('[data-pace-modal-card]');
    return { home: body ? body.scrollHeight - body.clientHeight : null, ventana: c ? c.scrollHeight - c.clientHeight : null };
  });
  await page.screenshot({ path: path.join(SALIDA, n + '.jpg'), type: 'jpeg', quality: 84, clip });
}
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const zoom = (ancho) => ({ x: ancho - 420, y: 0, width: 420, height: 80 });

async function carta(browser) {
  for (const [ancho, alto, v, dsf] of VISTAS) for (const [oscuro, t] of TEMAS) {
    const { context, page } = await C.abrir(browser, { ancho, alto, dsf, oscuro, hora: LUNES });
    await page.evaluate(() => ritmoElegir('jornada'));
    await C.ponerCarta(page, '2026-11-02', '2026-10-26', '2026-11-01');
    await page.waitForSelector('[data-pace-carta]', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(500);
    await foto(page, '1-carta-' + v + t);
    await page.locator('[data-pace-modal-close]').click();
    await page.waitForSelector('[data-pace-carta]', { state: 'detached' });
    await page.waitForTimeout(400);
    await foto(page, '1-cerrado-' + v + t);
    if (v === 'e') await foto(page, '1-cerrado-zoom' + t, zoom(ancho));
    await vis(page, '[data-pace-sobre]').click();
    await page.waitForSelector('[data-pace-carta]', { state: 'visible' });
    await page.locator('[data-pace-carta-si]').click();
    await page.waitForSelector('[data-pace-carta]', { state: 'detached' });
    await page.waitForTimeout(400);
    await foto(page, '1-abierto-' + v + t);
    if (v === 'e') await foto(page, '1-abierto-zoom' + t, zoom(ancho));
    await vis(page, '[data-pace-sobre]').click();
    await page.waitForSelector('[data-pace-carta="leida"]', { state: 'visible' });
    await page.waitForTimeout(400);
    await foto(page, '1-leida-' + v + t);
    await context.close();
  }
  /* En inglés y en el móvil pequeño. */
  for (const [lang, ancho, alto] of [['en', 360, 640], ['es', 360, 640]]) {
    const { context, page } = await C.abrir(browser, { ancho, alto, lang, hora: LUNES });
    await page.evaluate(() => ritmoElegir('jornada'));
    await C.ponerCarta(page, '2026-11-02', '2026-10-26', '2026-11-01');
    await page.waitForSelector('[data-pace-carta]', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(500);
    await foto(page, '1-carta-640-' + lang);
    await context.close();
  }
}

async function frase(browser) {
  for (const [ancho, alto, v, oscuro, lang] of [[360, 730, 'm', false, 'es'], [360, 730, 'm-osc', true, 'es'], [360, 640, '640-en', false, 'en']]) {
    const { context, page } = await C.abrir(browser, { ancho, alto, oscuro, lang, hora: MARTES });
    await page.evaluate(() => ritmoElegir('jornada'));
    await page.waitForTimeout(700);
    await foto(page, '2-antes-' + v);
    if (v === 'm') {
      await vis(page, '[data-pace-cta]').first().click();
      await page.waitForTimeout(1200);
      await foto(page, '2-empezado-' + v);
    }
    await context.close();
  }
}

async function ejercicio(browser) {
  const casos = VISTAS.flatMap(([ancho, alto, v, dsf]) => TEMAS.map(([oscuro, t]) => [ancho, alto, v + t, dsf, oscuro, 'es']))
    .concat([[360, 640, '640-en', 2, false, 'en']]);
  for (const [ancho, alto, v, dsf, oscuro, lang] of casos) {
    const { context, page } = await C.abrir(browser, { ancho, alto, dsf, oscuro, lang, hora: MARTES, estado: { ritmo: { libre: true } } });
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'suggest', targetId: 'extra.legs.standing' } })));
    await page.waitForSelector('[data-pace-preview-paso]', { state: 'visible' });
    await page.waitForTimeout(500);
    await foto(page, '4-lista-' + v);
    await page.locator('[data-pace-preview-paso]').first().click();
    await page.waitForSelector('[data-pace-preview-ejercicio]', { state: 'visible' });
    await page.waitForTimeout(400);
    await foto(page, '4-ejercicio-' + v);
    await context.close();
  }
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await C.servidor();
  const browser = await C.chromium.launch();
  try {
    for (const [n, f] of [['carta', carta], ['frase', frase], ['ejercicio', ejercicio]]) {
      const t0 = Date.now(); await f(browser); console.log(n, Math.round((Date.now() - t0) / 1000) + ' s');
    }
  } finally {
    await browser.close();
    if (srv) srv.kill();
    fs.writeFileSync(path.join(SALIDA, 'medidas.json'), JSON.stringify(medidas, null, 1));
    console.log(JSON.stringify(medidas));
  }
})().catch((e) => { console.error(e); process.exit(1); });
