/* PACE · cuarta vuelta de la barra lateral: lo que la tercera no midió (8 oct. 2026)
   ===============================================================================
   Uso, desde la raíz del repo y con index.html construido:
     PUERTO=8791 node docs/traspaso/archivos/sidebar-8oct/cuarta.js

   Fotografía el Cuaderno elegido (cuaderno.js) dentro de la app real, con la siembra
   de fotos.js, en lo que faltaba:
     · el CAJÓN del móvil a 360×640, con la barra de hoy al lado para comparar;
     · el INGLÉS, en las dos pantallas más justas y en el cajón;
     · un día POR LIBRE: con algo hecho (la tarjeta dice «Repetir»), vacío («Para
       ahora») y con una sesión de Respira a medias («Continúa»);
     · las frases más largas (horas de foco con minutos sueltos, la meta de doce);
     · y la semana de cerca, la de la tercera vuelta junto a la afinada.
   Deja fotos/cuarta-*.png y cuarta.json con lo medido. */
'use strict';

const path = require('path');
const fs = require('fs');
const F = require('./fotos.js');
const C = require('./cuaderno.js');
const { chromium } = require(path.join(F.RAIZ, 'node_modules', '@playwright', 'test'));

const SALIDA = path.join(__dirname, 'fotos');
const LV = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
const POR_LIBRE = { ritmo: { semanaTipo: LV, libre: '2026-10-08' } };

/* Lo que se mide del cajón: además de la escala, cuánto de la columna queda por
   debajo del borde de la pantalla (lo que pide desplazar el dedo). */
async function medirCajon(page) {
  const m = await F.medirOpcion(page);
  m.fuera = await page.evaluate(() => {
    const env = document.querySelector('[data-pace-sidebar-escala]');
    const ultimo = env.lastElementChild.getBoundingClientRect().bottom;
    return Math.max(0, Math.round(ultimo + 22 - innerHeight));
  });
  return m;
}

async function opcion(page, o) {
  const d = await page.evaluate(C.datos);
  const { html, css } = C.pintar(d, o);
  await F.ponerOpcion(page, html, css);
}

async function main() {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await F.servidor();
  const browser = await chromium.launch();
  const medidas = {};
  const foto = (page, nombre, sel) => (sel ? page.locator(sel).first() : page.locator('[data-pace-sidebar]'))
    .screenshot({ path: path.join(SALIDA, 'cuarta-' + nombre + '.png') });
  try {
    /* 1 · EL CAJÓN DEL MÓVIL, 360×640: hoy, la pausa dentro y con su rótulo. */
    for (const paleta of ['crema', 'oscuro']) {
      for (const dia of ['activo', 'vacio']) {
        const k = paleta + '-' + dia;
        const { context, page } = await F.abrir(browser, 360, 640, dia, paleta);
        medidas['cajon-hoy-' + k] = await medirCajon(page);
        await page.screenshot({ path: path.join(SALIDA, 'cuarta-cajon-hoy-' + k + '.png') });
        for (const forma of ['dentro', 'rotulo']) {
          await opcion(page, { pausa: forma });
          medidas['cajon-' + forma + '-' + k] = await medirCajon(page);
          await page.screenshot({ path: path.join(SALIDA, 'cuarta-cajon-' + forma + '-' + k + '.png') });
        }
        await context.close();
        process.stdout.write('.');
      }
    }

    /* 2 · EN INGLÉS: las dos pantallas de escritorio más justas y el cajón. */
    for (const [w, h] of [[1280, 800], [1536, 704], [360, 640]]) {
      for (const dia of ['activo', 'vacio']) {
        const k = w + 'x' + h + '-' + dia;
        const { context, page } = await F.abrir(browser, w, h, dia, 'crema', { lang: 'en' });
        await opcion(page, { pausa: 'dentro' });
        medidas['en-' + k] = w < 700 ? await medirCajon(page) : await F.medirOpcion(page);
        if (w < 700) await page.screenshot({ path: path.join(SALIDA, 'cuarta-en-' + k + '.png') });
        else await foto(page, 'en-' + k);
        await context.close();
        process.stdout.write('.');
      }
    }

    /* 3 · POR LIBRE, a 1280×800: con algo hecho, vacío y con Respira a medias. */
    const respiraAMedias = {
      init: () => {
        const r = (Object.values(window.BREATHE_ROUTINES || {}).flatMap((g) => g.items || [])).find((x) => x.pattern === 'rounds');
        if (!r) return;
        const t = Date.now() - 10 * 60000;
        localStorage.setItem('pace.breathe.v1', JSON.stringify({ v: 1, routineId: r.id, round: 2, breaths: 1, activeMs: 120000,
          holdSec: 0, startedAt: t - 120000, savedAt: t }));
      },
    };
    for (const [caso, dia] of [['repetir', 'activo'], ['ahora', 'vacio'], ['continua', 'activo']]) {
      for (const lang of ['es', 'en']) {
        const { context, page } = await F.abrir(browser, 1280, 800, dia, 'crema', Object.assign({ lang }, POR_LIBRE));
        if (caso === 'continua') { await page.evaluate(respiraAMedias.init); await page.reload(); await page.waitForTimeout(900); }
        /* Las cinco sesiones sembradas comparten la misma hora y la última que lee la
           barra puede ser un Foco, que no tiene rutina que repetir: la tarjeta de hoy
           no sale. Un estiramiento un minuto después la hace salir. */
        if (caso === 'repetir') {
          await page.clock.fastForward(60000);
          await page.evaluate(() => {
            const id = (Object.values(window.EXTRA_ROUTINES)[0] || {}).items[0].id;
            window.paceEventsAppend(window.makeEvent({ type: 'session.completed', context: 'standalone', runId: window.newEventId(),
              payload: { module: 'stretch', routineId: id, completionReason: 'natural', elapsedSeconds: 240, activeSeconds: 240,
                         plannedSeconds: 240, plannedSecondsSource: 'declared', variant: null } }));
          });
          await page.waitForSelector('[data-pace-sidebar-accion][data-kind="repeat"]', { state: 'attached', timeout: 8000 });
        }
        for (const forma of lang === 'es' ? ['dentro', 'rotulo'] : ['dentro']) {
          await opcion(page, { pausa: forma });
          const k = 'libre-' + caso + '-' + forma + '-' + lang;
          medidas[k] = await F.medirOpcion(page);
          await foto(page, k);
        }
        await context.close();
        process.stdout.write('.');
      }
    }

    /* 4 · LAS FRASES MÁS LARGAS: seis horas y 47 minutos de foco, la meta de doce. */
    const largas = { weeklyStats: { focusMinutes: [150, 100, 200, 407, 0, 0, 0], breathMinutes: [6, 0, 10, 47, 0, 0, 0],
      moveMinutes: [8, 12, 0, 103, 0, 0, 0], waterGlasses: [6, 5, 7, 11, 0, 0, 0] }, water: { goal: 12, today: 11, lastReset: null } };
    for (const lang of ['es', 'en']) {
      const { context, page } = await F.abrir(browser, 1280, 800, 'activo', 'crema', Object.assign({ lang }, largas));
      await opcion(page, { pausa: 'dentro' });
      medidas['largas-' + lang] = await F.medirOpcion(page);
      await foto(page, 'largas-' + lang, '[data-sb-op][data-sb-pieza="hoy"]');
      await context.close();
    }

    /* 5 · LA SEMANA DE CERCA: la de la tercera vuelta y la afinada, en las dos paletas. */
    for (const paleta of ['crema', 'oscuro']) {
      const { context, page } = await F.abrir(browser, 1280, 800, 'activo', paleta);
      for (const capsula of ['actual', 'tinta']) {
        await opcion(page, { pausa: 'dentro', capsula });
        await foto(page, 'semana-' + capsula + '-' + paleta, '[data-sb-op][data-sb-pieza="semana"]');
        if (capsula === 'tinta') {
          medidas['tinta-' + paleta] = await F.medirOpcion(page);
          await foto(page, 'barra-tinta-' + paleta);
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
    srv.kill();
  }
  fs.writeFileSync(path.join(__dirname, 'cuarta.json'), JSON.stringify(medidas, null, 2));
  ponerEnLaPagina(medidas);
  console.log('\nHecho: ' + Object.keys(medidas).length + ' medidas en cuarta.json.');
}

/* La página lleva dentro la escala y lo que queda bajo el borde en el cajón, para
   abrirse también desde el disco. */
function ponerEnLaPagina(medidas) {
  const corto = {};
  Object.keys(medidas).filter((k) => k.startsWith('cajon-')).forEach((k) => {
    corto[k] = { escala: medidas[k].escala, fuera: medidas[k].fuera };
  });
  const pagina = path.join(__dirname, 'sidebar.html');
  const html = fs.readFileSync(pagina, 'utf8');
  const marca = /\/\*CUARTA\*\/.*;\n/;
  if (!marca.test(html)) throw new Error('No encuentro /*CUARTA*/ en sidebar.html');
  fs.writeFileSync(pagina, html.replace(marca, () => '/*CUARTA*/' + JSON.stringify(corto) + ';\n'));
}

if (process.argv.includes('--pagina')) {
  ponerEnLaPagina(JSON.parse(fs.readFileSync(path.join(__dirname, 'cuarta.json'), 'utf8')));
  console.log('Medidas del cajón puestas en sidebar.html.');
} else {
  main().catch((e) => { console.error(e); process.exit(1); });
}
