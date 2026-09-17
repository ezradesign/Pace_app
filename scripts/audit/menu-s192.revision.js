/* PACE · REVISIÓN de la maqueta de la ronda 4, «A tu ritmo» (s192)
 * ================================================================
 * Abre la maqueta como ARCHIVO (lo que hace el doble clic, sin servidor), recorre
 * TODAS las combinaciones de mandos (horario × llegada × política si llegas tarde)
 * y de estados, y lee lo que mide cada pantalla. Solo imprime lo que sale en rojo, más un
 * recuento. Una medida vale solo si el iframe informa de los MISMOS ajustes y el
 * MISMO estado que se acaban de pedir: los mandos llegan en mensajes distintos y el
 * primero en responder puede traer el estado anterior.
 * Con `--fotos DIR` guarda cada pantalla en cada estado con los ajustes iniciales.
 * (Las rondas 1 a 3 se revisaron con versiones anteriores de este script.)
 *
 * Uso: node scripts/audit/menu-s192.revision.js [--fotos DIR]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const C = require('./menu-s192-calco');
const P = require('./menu-s192-pagina-r4');

const ARCHIVO = path.join(C.ROOT, 'docs', 'proposals', 'a-tu-ritmo-r4.html');
const FOTOS = (() => { const i = process.argv.indexOf('--fotos'); return i > 0 ? process.argv[i + 1] : null; })();

/* Producto cartesiano de los mandos. «Si tarde» solo cuenta si llegas tarde: con
   llegada a tu hora sus botones están desactivados y no se pulsan. */
const valores = (g) => P.MANDOS.find((m) => m[0] === g)[1].map(([v]) => v);
const COMBOS = valores('horario').flatMap((horario) => valores('llegada').flatMap((llegada) =>
  llegada === '0' ? [{ horario, llegada }] : valores('tarde').map((tarde) => ({ horario, llegada, tarde }))));
const inicial = (aj) => Object.keys(aj).every((k) => aj[k] === P.INICIAL[k]);

(async () => {
  const b = await C.chromium.launch();
  const page = await (await b.newContext({ viewport: { width: 1400, height: 1000 } })).newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push('página: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errores.push('consola: ' + m.text()); });
  await page.goto(pathToFileURL(ARCHIVO).href);
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-medida]')).every((e) => e.dataset.json));

  let malos = 0, total = 0;
  for (const aj of COMBOS) {
    for (let i = 0; i < P.PRESETS.A.length; i++) {
      const est = P.PRESETS.A[i][1];
      await page.evaluate(({ i, aj }) => {
        document.querySelectorAll('[data-medida]').forEach((e) => { delete e.dataset.json; });
        Object.keys(aj).forEach((k) => document.querySelector('[data-ajuste="' + k + '"][data-valor="' + aj[k] + '"]').click());
        document.querySelector('[data-preset="A"][data-i="' + i + '"]').click();
      }, { i, aj });
      const espera = Object.assign(P.horarioDe(aj.horario, aj.llegada), { tarde: aj.tarde || null,
                       opcion: est.opcion || null, hoja: !!est.hoja, libre: !!est.libre });
      await page.waitForFunction((x) => Array.from(document.querySelectorAll('[data-medida]')).every((e) => {
        if (!e.dataset.json) return false;
        const m = JSON.parse(e.dataset.json);
        const a = m.ajustes;
        return a.inicio === x.inicio && a.comida === x.comida && a.comidaDur === x.comidaDur && a.salida === x.salida
          && a.ahora === x.ahora && (x.tarde === null || a.tarde === x.tarde)
          && m.estado.opcion === x.opcion && m.estado.hoja === x.hoja && m.estado.libre === x.libre;
      }), espera);
      await page.waitForTimeout(120);
      const filas = await page.evaluate(() => Array.from(document.querySelectorAll('[data-medida]'))
        .map((e) => Object.assign({ id: e.dataset.medida }, JSON.parse(e.dataset.json))));
      for (const m of filas) {
        total++;
        const mal = m.scroll > 0 || m.solapes > 0 || m.fuera > 0 || m.desborde > 0 || m.glifos !== 4;
        if (mal) {
          malos++;
          console.log('✗ ' + aj.horario + ' · llega +' + aj.llegada + (aj.tarde ? ' · ' + aj.tarde : '') + ' · ' + P.PRESETS.A[i][0] + ' · ' + m.id
            + ' · scroll ' + m.scroll + ' · solapes ' + m.solapes + ' · fuera ' + m.fuera + ' · desborde ' + m.desborde + ' · glifos ' + m.glifos);
        }
        if (FOTOS && inicial(aj)) {
          const f = await page.$('iframe[data-vp="' + m.id.split('-')[1] + '"]');
          fs.mkdirSync(FOTOS, { recursive: true });
          fs.writeFileSync(path.join(FOTOS, m.id + '-' + i + '-' + P.PRESETS.A[i][0].replace(/[^a-zA-Záéíóúñ]+/g, '_') + '.png'), await f.screenshot());
        }
      }
    }
  }
  await b.close();
  console.log((errores.length ? errores.join('\n') : 'sin errores de consola') + ' · ' + COMBOS.length + ' combinaciones · '
    + total + ' medidas · ' + malos + ' en rojo');
})();
