/* PACE · la barra lateral YA MONTADA en la app, para que Ez la vea antes de subirla
   ================================================================================
   Uso, desde la raíz del repo y con index.html construido:
     PUERTO=8791 node docs/traspaso/archivos/sidebar-8oct/montada.js

   Lo mismo que fotos.js y cuarta.js, pero sin inyectar nada: lo que se fotografía es
   el index.html de la rama. Con la siembra de fotos.js (jueves 8 de octubre: «vacio» a
   las 9:10 y «activo» a las 12:20):
     · la pantalla entera a 1280×800, 1536×704 y 1920×960, en crema y en oscuro;
     · el cajón del móvil a 360×640;
     · en inglés y un día por libre (con algo hecho, vacío y con Respira a medias);
     · la home de escritorio con la meta de vasos en 6 y en 12.
   Deja fotos/montada-*.png|jpg y montada.json: la escala de la barra, el scroll de la
   página y de la barra, y lo que queda del cajón por debajo del borde. */
'use strict';

const path = require('path');
const fs = require('fs');
const F = require('./fotos.js');
const { chromium } = require(path.join(F.RAIZ, 'node_modules', '@playwright', 'test'));

const SALIDA = path.join(__dirname, 'fotos');
const LV = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
const POR_LIBRE = { ritmo: { semanaTipo: LV, libre: '2026-10-08' } };

function medir(page) {
  return page.evaluate(() => {
    const sb = document.querySelector('[data-pace-sidebar]');
    const env = document.querySelector('[data-pace-sidebar-escala]');
    const doc = document.scrollingElement;
    const pie = env && env.lastElementChild ? env.lastElementChild.getBoundingClientRect().bottom : 0;
    return {
      escala: env ? Math.round((parseFloat(getComputedStyle(env).getPropertyValue('--sb-escala')) || 1) * 1000) / 1000 : null,
      scrollPagina: doc.scrollHeight - doc.clientHeight,
      scrollBarra: sb ? sb.scrollHeight - sb.clientHeight : null,
      pieBajoElBorde: Math.max(0, Math.round(pie - innerHeight)),
      resumen: (document.querySelector('[data-pace-ritmo-resumen] .pace-rt-meta') || {}).textContent || null,
    };
  });
}

async function main() {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await F.servidor();
  const browser = await chromium.launch();
  const medidas = {};
  const barra = (page, k) => page.locator('[data-pace-sidebar]').screenshot({ path: path.join(SALIDA, 'montada-barra-' + k + '.png') });
  try {
    for (const [w, h] of [[1280, 800], [1536, 704], [1920, 960]]) {
      for (const paleta of ['crema', 'oscuro']) {
        for (const dia of ['activo', 'vacio']) {
          const k = w + 'x' + h + '-' + paleta + '-' + dia;
          const { context, page } = await F.abrir(browser, w, h, dia, paleta);
          medidas[k] = await medir(page);
          await page.screenshot({ path: path.join(SALIDA, 'montada-' + k + '.jpg'), type: 'jpeg', quality: 84 });
          await barra(page, k);
          await context.close();
          process.stdout.write('.');
        }
      }
    }
    for (const paleta of ['crema', 'oscuro']) {
      for (const dia of ['activo', 'vacio']) {
        const k = 'cajon-' + paleta + '-' + dia;
        const { context, page } = await F.abrir(browser, 360, 640, dia, paleta);
        medidas[k] = await medir(page);
        await page.screenshot({ path: path.join(SALIDA, 'montada-' + k + '.png') });
        await context.close();
        process.stdout.write('.');
      }
    }
    for (const [k, w, h] of [['en-1280x800', 1280, 800], ['en-cajon', 360, 640]]) {
      const { context, page } = await F.abrir(browser, w, h, 'activo', 'crema', { lang: 'en' });
      medidas[k] = await medir(page);
      if (w < 700) await page.screenshot({ path: path.join(SALIDA, 'montada-' + k + '.png') });
      else await barra(page, k);
      await context.close();
    }
    for (const [caso, dia] of [['repetir', 'activo'], ['ahora', 'vacio'], ['continua', 'activo']]) {
      const { context, page } = await F.abrir(browser, 1280, 800, dia, 'crema', POR_LIBRE);
      if (caso === 'continua') {
        await page.evaluate(() => {
          const r = Object.values(window.BREATHE_ROUTINES || {}).flatMap((g) => g.items || []).find((x) => x.pattern === 'rounds');
          const t = Date.now() - 10 * 60000;
          localStorage.setItem('pace.breathe.v1', JSON.stringify({ v: 1, routineId: r.id, round: 2, breaths: 1, activeMs: 120000,
            holdSec: 0, startedAt: t - 120000, savedAt: t }));
        });
        await page.reload();
        await page.waitForSelector('[data-pace-sidebar-accion][data-kind="resume"]', { timeout: 8000 });
      }
      await page.waitForTimeout(400);
      medidas['libre-' + caso] = await medir(page);
      await barra(page, 'libre-' + caso);
      await context.close();
    }
    for (const meta of [6, 12]) {
      const { context, page } = await F.abrir(browser, 1280, 800, 'activo', 'crema', { water: { goal: meta, today: 4, lastReset: null } });
      medidas['home-meta-' + meta] = await medir(page);
      await page.screenshot({ path: path.join(SALIDA, 'montada-home-meta-' + meta + '.jpg'), type: 'jpeg', quality: 84 });
      await context.close();
    }
  } finally {
    await browser.close();
    srv.kill();
  }
  fs.writeFileSync(path.join(__dirname, 'montada.json'), JSON.stringify(medidas, null, 2));
  console.log('\nHecho: ' + Object.keys(medidas).length + ' medidas en montada.json.');
}

main().catch((e) => { console.error(e); process.exit(1); });
