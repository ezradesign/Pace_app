/* PACE · E2E · LOS TEXTOS LARGOS (pseudolocalización, 17 nov. 2026)
 * =================================================================
 * Antes de que los testers vean PACE en inglés: ¿qué se rompe cuando un texto mide más de lo que se
 * diseñó? Se recorren las pantallas principales (tests/textos-largos.escenas.js: la home con y sin
 * jornada, la tarjeta del día, la ventana de la pausa, el runner de Mueve y Estira, Respira, Ajustes y
 * «Tus datos», el sobre, las bibliotecas, logros, estadísticas, la hoja de compra y la bienvenida) a
 * 360 × 640, 360 × 740 y 1280 × 800, de tres maneras:
 *   · LARGOS: cada texto de i18n, el más largo de sus dos idiomas, un 30 % más largo y entre «⟦ ⟧»
 *     (tests/textos-largos.pseudo.js, que no llega nunca a la app: lo vigila `verify`);
 *   · EN y ES: los textos de verdad, para separar lo que ya pasa de lo que solo pasaría con un texto
 *     aún más largo.
 * En cada pantalla, `medirTextos` (tests/textos-largos.medir.js) apunta texto cortado sin puntos
 * suspensivos, textos que se pisan o se tapan, filas que se salen de su caja, botones fuera de la
 * ventana, scroll donde no debe haberlo (la home, Ajustes y «Tus datos» abierta), scroll de lado, y,
 * con los textos largos, lo que se ve sin las marcas: lo que no pasó por i18n.
 *
 * QUÉ DEFIENDE: nada de eso, salvo lo de CONOCIDOS, cada uno con su tope en px y su porqué (espera
 * a Ez, o solo pasa con los textos largos y está en la página de opciones). Si algo nuevo se rompe, o
 * algo conocido crece, rojo. Ningún texto sin traducir, salvo los de IGUALES.
 * Todo lo medido sale en las anotaciones de cada prueba: lo lee la página para Ez
 * (docs/proposals/textos-largos-17nov/genera.js).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { SEMILLA, CLAVE_ESTADO, estadoYaAbrio } = require('./helpers');
const { instalarTextosLargos } = require('./textos-largos.pseudo');
const { medirTextos } = require('./textos-largos.medir');
const { ESCENAS, hora } = require('./textos-largos.escenas');

const TAMANOS = [[360, 640], [360, 740], [1280, 800]];
const MODOS = ['largos', 'en', 'es'];
/* Grupos de escenas, para que cada prueba quepa en su tiempo y el CI las reparta. */
const GRUPOS = {
  'la home': ['home-libre', 'home-jornada', 'tarjeta-dia'],
  'la pausa': ['pausa', 'pausa-jornada'],
  'las sesiones': ['runner-mueve', 'runner-estira', 'respira'],
  'los paneles': ['ajustes', 'sobre', 'compra', 'bienvenida'],
  'las listas': ['biblioteca-mueve', 'biblioteca-estira', 'biblioteca-respira', 'logros', 'estadisticas'],
};

/* LO QUE YA SE SABE. `modos`, `tams` y `escena` dicen dónde; `tipo` y `donde` (o `texto`), qué; `tope`,
   cuántos px como mucho (lo medido el 17 nov. y un margen para la letra de cada máquina). */
const CONOCIDOS = [
  /* Ajustes en un móvil que vibra («Vibrar», 0.208.0) y con las notificaciones bloqueadas (el navegador
     de las pruebas las tiene bloqueadas): 12 px de scroll a 360 × 640. Espera a Ez (página, R1). */
  { modos: ['en', 'es'], tams: ['360×640'], escena: 'ajustes', tipo: 'scroll', donde: /^tweaks-panel/, tope: 20 },
  /* Las otras tres puertas de la pausa por libre (Hidrátate · Respira · Muévete), en una línea por
     decisión de Ez (9 oct.): en castellano a 360 miden 291 px en 286. Espera a Ez (página, R2). */
  { modos: ['es'], tams: ['360×640', '360×740'], escena: 'pausa', tipo: 'se sale de su caja', donde: /^break-otras/, tope: 10 },
  /* SOLO CON LOS TEXTOS LARGOS (en la página, «solo con un texto más largo»): */
  /* · esa misma fila: 47 px fuera de su caja y la ventana entera se mueve de lado 23 px; */
  { modos: ['largos'], tams: ['360×640', '360×740'], escena: 'pausa', tipo: 'se sale de su caja', donde: /^break-otras/, tope: 60 },
  { modos: ['largos'], tams: ['360×640', '360×740'], escena: 'pausa', tipo: 'scroll de lado', donde: /^modal-card/, tope: 35 },
  /* · la pregunta del día a 360 × 640: 28 px de scroll en la home (en inglés, 17 px con la letra al 115 %:
       tests/home-sin-scroll.spec.js, `pendiente115`); la tarjeta del día la está pensando otra rama; */
  { modos: ['largos'], tams: ['360×640'], escena: 'tarjeta-dia', tipo: 'scroll', donde: /^home-body/, tope: 40 },
  /* · Ajustes, que ya va justo en castellano: 200 px de scroll a 360 × 640, 100 a 360 × 740 y 15 a 1280 × 800. */
  { modos: ['largos'], tams: ['360×640'], escena: 'ajustes', tipo: 'scroll', donde: /^tweaks-panel/, tope: 240 },
  { modos: ['largos'], tams: ['360×740'], escena: 'ajustes', tipo: 'scroll', donde: /^tweaks-panel/, tope: 140 },
  { modos: ['largos'], tams: ['1280×800'], escena: 'ajustes', tipo: 'scroll', donde: /^tweaks-panel/, tope: 30 },
  /* · las pestañas de Estadísticas no encogían y la hoja entera se movía de lado 87 px a 360. */
  { modos: ['largos'], tams: ['360×640', '360×740'], escena: 'estadisticas', tipo: 'scroll de lado', donde: /^modal-card/, tope: 100 },
  { modos: ['largos'], tams: ['360×640', '360×740'], escena: 'estadisticas', tipo: 'se sale de su caja', donde: /^modal-head/, tope: 160 },
];

/* LO QUE SE VE SIN LAS MARCAS Y ESTÁ BIEN: no es un texto de la app, o ya trae sus dos idiomas. */
const IGUALES = [
  /* Las fechas las escribe Intl en el idioma de la app (paceFechaCorta): «9 Nov», «October 2026». */
  { texto: /^\d{1,2} [A-Z][a-z]{2,8}\.?$|^[A-Z][a-z]+ \d{4}$/ },
  /* El selector de idioma de la bienvenida. */
  { texto: /^(ES|EN)$/ },
  /* Las novedades del sobre se escriben a mano en los dos idiomas (app/shell/novedades.data.js). */
  { donde: /^sobre-item=novedades/ },
];

const vale = (lista, f, ctx) => lista.find((k) =>
  (!k.modos || k.modos.includes(ctx.modo)) && (!k.tams || k.tams.includes(ctx.tam)) && (!k.escena || k.escena === ctx.escena) &&
  (!k.tipo || k.tipo === f.tipo) && (!k.donde || k.donde.test(f.donde)) && (!k.texto || k.texto.test(f.texto)));

for (const modo of MODOS) {
  for (const [w, h] of TAMANOS) {
    for (const [grupo, ids] of Object.entries(GRUPOS)) {
      const tam = w + '×' + h;
      test(`textos ${modo} · ${tam} · ${grupo}: nada cortado, pisado, fuera ni sin traducir`, async ({ browser }) => {
        test.setTimeout(240_000);
        const baseURL = test.info().project.use.baseURL;
        const lang = modo === 'es' ? 'es' : 'en';
        const fallos = [];
        for (const id of ids) {
          const e = ESCENAS.find((x) => x.id === id);
          const movil = w < 768;
          const context = await browser.newContext({ baseURL, viewport: { width: w, height: h }, isMobile: movil, hasTouch: movil,
            locale: lang === 'es' ? 'es-ES' : 'en-GB', timezoneId: 'Europe/Madrid', serviceWorkers: 'block', storageState: estadoYaAbrio(baseURL) });
          if (modo === 'largos') await instalarTextosLargos(context);
          await context.addInitScript(([clave, estado]) => {
            if (!localStorage.getItem(clave)) localStorage.setItem(clave, JSON.stringify(estado));
          }, [CLAVE_ESTADO, Object.assign({}, SEMILLA, { lang, sidebarCollapsed: true }, e.semilla)]);
          if (e.antes) await e.antes(context);
          const page = await context.newPage();
          const errores = [];
          page.on('pageerror', (x) => errores.push(x.message));
          await page.clock.install({ time: hora(e.hora) });
          await page.goto('/index.html');
          if (!e.sinHome) await page.locator('[data-pace-dial-number]').waitFor();
          await page.waitForTimeout(1200);
          await e.llegar(page, async (momento, raiz, sinScroll) => {
            const medido = await page.evaluate(medirTextos, { raiz, sinScroll, pseudo: modo === 'largos' });
            for (const f of medido) {
              const ctx = { modo, tam, escena: id };
              test.info().annotations.push({ type: 'textos', description: JSON.stringify(Object.assign({ escena: id, momento, modo, tam }, f)) });
              if (f.tipo === 'sin traducir') { if (!vale(IGUALES, f, ctx)) fallos.push(`${e.nombre} · ${momento}: sin traducir «${f.texto}» (${f.donde})`); continue; }
              const k = vale(CONOCIDOS, f, ctx);
              if (!k) fallos.push(`${e.nombre} · ${momento}: ${f.tipo}, ${f.px} px, «${f.texto}» (${f.donde})`);
              else if (f.px > k.tope) fallos.push(`${e.nombre} · ${momento}: ${f.tipo}, ${f.px} px, más que su tope de ${k.tope} (${f.donde})`);
            }
          });
          if (errores.length) fallos.push(`${e.nombre}: errores de la página: ${errores.join(' | ')}`);
          await context.close();
        }
        expect(fallos, 'con los textos ' + modo + ' a ' + tam).toEqual([]);
      });
    }
  }
}
