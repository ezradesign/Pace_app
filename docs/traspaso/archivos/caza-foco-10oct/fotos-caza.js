/* Fotos de la app real (index.html construido desde la rama) de las cuatro cosas visibles de la caza.
   Uso: node fotos-caza.js <raiz-del-repo> <puerto> <carpeta-salida> */
'use strict';
const path = require('path');
const fs = require('fs');
const [ROOT, PUERTO, SALIDA] = process.argv.slice(2);
const { chromium, expect } = require(path.join(ROOT, 'node_modules', '@playwright/test'));
const { sembrar, irAlArtefacto, RUTA_ARTEFACTO, CLAVE_ESTADO } = require(path.join(ROOT, 'tests', 'helpers.js'));
const { asentarGeometria } = require(path.join(ROOT, 'tests', 'home.helpers.js'));

const BASE = 'http://localhost:' + PUERTO;
const ARRANQUE = new Date('2026-10-07T10:00:00+02:00');
const VISTAS = {
  360: { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, extra: { sidebarCollapsed: true } },
  1280: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, extra: {} },
};
const vis = (p, sel) => p.locator(sel).filter({ visible: true }).first();
const cta = (p) => vis(p, '[data-pace-cta]');
const numero = (p) => vis(p, '[data-pace-dial-number]');
const boton = (p, nombre) => p.getByRole('button', { name: nombre, exact: true }).filter({ visible: true }).first();
const medidas = {};

async function nuevo(browser, ancho, extraSemilla) {
  const v = VISTAS[ancho];
  const context = await browser.newContext({ baseURL: BASE, viewport: v.viewport, isMobile: !!v.isMobile, hasTouch: !!v.hasTouch,
    deviceScaleFactor: v.deviceScaleFactor, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light' });
  await sembrar(context, Object.assign({ soundOn: false }, v.extra, extraSemilla || {}));
  const page = await context.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push(e.message));
  return { context, page, errores };
}

async function conReloj(page, context) {
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
  await context.clock.pauseAt(new Date(ARRANQUE.getTime() + 60 * 1000));
}

async function foto(page, nombre, ancho) {
  await page.mouse.move(1, 1);
  await page.waitForTimeout(1200);
  if (ancho === 360) {
    medidas[nombre] = await page.evaluate(() => {
      const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
      return body ? body.scrollHeight - body.clientHeight : null;
    });
  }
  await page.screenshot({ path: path.join(SALIDA, nombre + '.jpg'), type: 'jpeg', quality: 82 });
  console.log('foto', nombre, ancho === 360 ? '(scroll de la home: ' + medidas[nombre] + ' px)' : '');
}

const ESCENAS = {
  async foco1(browser, ancho) {
    const { context, page, errores } = await nuevo(browser, ancho);
    await conReloj(page, context);
    await cta(page).click();
    await context.clock.fastForward(20 * 60 * 1000);
    await context.clock.runFor(1000);
    await boton(page, '35').click();
    await expect(vis(page, '[data-pace-cambio-minutos]')).toBeVisible();
    await context.clock.resume();
    await foto(page, 'foco1-hoy-' + ancho, ancho);
    await context.close();
    return errores;
  },
  async foco2(browser, ancho) {
    const { context, page, errores } = await nuevo(browser, ancho);
    await conReloj(page, context);
    await cta(page).click();
    await context.clock.fastForward(12 * 60 * 1000);
    await context.clock.runFor(1000);
    await cta(page).click();
    await expect(cta(page)).toHaveText('Continuar');
    await page.reload();
    await numero(page).waitFor({ state: 'visible' });
    await expect(cta(page)).toHaveText('Continuar');
    await context.clock.resume();
    await asentarGeometria(page);
    await foto(page, 'foco2-hoy-' + ancho, ancho);
    await context.close();
    return errores;
  },
  async foco3(browser, ancho) {
    const { context, page, errores } = await nuevo(browser, ancho);
    await conReloj(page, context);
    await cta(page).click();
    await context.clock.fastForward(5 * 60 * 1000);
    await page.goto('about:blank');
    await context.clock.fastForward(30 * 60 * 1000);
    await page.goto(RUTA_ARTEFACTO);
    await numero(page).waitFor({ state: 'visible' });
    await context.clock.runFor(2000);
    await expect(page.locator('[data-pace-modal-backdrop]').getByText('Pausa bien hecha', { exact: true })).toBeVisible();
    await context.clock.resume();
    await foto(page, 'foco3-hoy-' + ancho, ancho);
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-pace-modal-backdrop]').getByText('Pausa bien hecha', { exact: true })).toHaveCount(0);
    await asentarGeometria(page);
    await foto(page, 'foco3-hoy-cerrada-' + ancho, ancho);
    await context.close();
    return errores;
  },
  async estado5(browser, ancho) {
    /* En el móvil los vasos están en el cajón: se abre, se suman dos y se cierra. */
    const { context, page, errores } = await nuevo(browser, ancho, ancho === 360 ? { sidebarCollapsed: false } : {});
    await context.addInitScript((clave) => {
      const orig = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        if (k === clave && this.getItem(clave)) throw new DOMException('lleno', 'QuotaExceededError');
        return orig.call(this, k, v);
      };
    }, CLAVE_ESTADO);
    await page.goto(RUTA_ARTEFACTO);
    await page.locator('[data-pace-sidebar]').getByRole('button', { name: /Añadir un vaso/ }).filter({ visible: true }).first().waitFor();
    const vaso = () => page.locator('[data-pace-sidebar]').getByRole('button', { name: /Añadir un vaso/ }).filter({ visible: true }).first().click();
    await vaso();
    await vaso();
    await expect(page.locator('[data-pace-no-guarda]')).toBeVisible();
    if (ancho === 360) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(600);
    }
    await foto(page, 'estado5-hoy-' + ancho, ancho);
    await context.close();
    return errores;
  },
};

async function servidor() {
  const hijo = require('child_process').spawn(process.execPath, ['.claude/static-server.js'], {
    cwd: ROOT, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(BASE + '/index.html', { method: 'HEAD' });
      if (decodeURIComponent(r.headers.get('x-pace-raiz') || '').toLowerCase() === path.resolve(ROOT).toLowerCase()) return hijo;
      throw new Error('el puerto ' + PUERTO + ' sirve otra carpeta');
    } catch (e) {
      if (/otra carpeta/.test(e.message)) { hijo.kill(); throw e; }
      await new Promise(r => setTimeout(r, 200));
    }
  }
  hijo.kill();
  throw new Error('el servidor no arrancó');
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const hijo = await servidor();
  process.on('exit', () => hijo.kill());
  const browser = await chromium.launch();
  const soloEstas = process.argv[5] ? process.argv[5].split(',') : Object.keys(ESCENAS);
  for (const nombre of soloEstas) {
    for (const ancho of [360, 1280]) {
      const errores = await ESCENAS[nombre](browser, ancho);
      if (errores.length) console.log('ERRORES', nombre, ancho, errores);
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(SALIDA, 'medidas.json'), JSON.stringify(medidas, null, 2));
  hijo.kill();
})().catch((e) => { console.error(e); process.exit(1); });
