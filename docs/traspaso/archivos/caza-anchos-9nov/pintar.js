/* Caza de los seis anchos · las opciones para Ez, pintadas encima de la app de verdad: cada opción es
 * un poco de CSS (o de JS) que se pone sobre la pantalla real y se fotografía en JPEG pequeño.
 * Uso: CAZA_FOTOS=<carpeta> node pintar.js [id] */
'use strict';
const L = require('./lib');

const JUEVES = new Date(2026, 10, 5, 9, 0);
const DIA = { fecha: '2026-11-05', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

/* Cada escena: tamaño, idioma, estado y lo que se fotografía (un recorte por selector o la pantalla). */
const ESCENAS = {
  dia320: { tam: 'm320', estado: { ritmo: { dia: DIA, horario: HORARIO } }, reloj: JUEVES, recorte: '[data-pace-ritmo-estado], [data-pace-ritmo-panel]' },
  dia360: { tam: 'm360', estado: { ritmo: { dia: DIA, horario: HORARIO } }, reloj: JUEVES, recorte: '[data-pace-ritmo-estado], [data-pace-ritmo-panel]' },
};

const OPCIONES = require('./pintar.opciones');

(async () => {
  await L.lanzar();
  const solo = process.argv[2];
  for (const o of OPCIONES.filter((x) => !solo || x.id.startsWith(solo))) {
    const e = ESCENAS[o.escena];
    for (const lang of o.langs || ['es']) {
      const { ctx, page } = await L.abrir({ tam: e.tam, lang, estado: Object.assign({}, e.estado), reloj: e.reloj, espera: 1200 });
      try {
        if (o.antes) await page.evaluate(o.antes);
        if (o.css) await page.addStyleTag({ content: o.css });
        if (o.js) await page.evaluate(o.js);
        await page.waitForTimeout(400);
        const nombre = 'op-' + o.id + '-' + lang;
        const caja = e.recorte ? page.locator(e.recorte).filter({ visible: true }).first() : null;
        if (caja && await caja.count()) await caja.screenshot({ path: require('path').join(L.FOTOS, nombre + '.jpg'), type: 'jpeg', quality: 70 });
        else await L.foto(page, nombre);
        console.log(nombre, await page.evaluate(() => { const d = document.scrollingElement; return 'scroll ' + (d.scrollHeight - d.clientHeight); }));
      } catch (err) { console.log(o.id, 'ERROR', err.message.split('\n')[0]); }
      await ctx.close();
    }
  }
  await L.cerrar();
})();
