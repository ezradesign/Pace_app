/* PACE · BANCO DEL PRIMER MINUTO (s187)
 * =====================================
 * La practica que se repite en todas las guias de onboarding de 2026 es la misma: que se pruebe
 * el producto ANTES de pedir nada, y que el valor se toque en el primer minuto. Antes de tocar
 * el onboarding hay que saber si aqui hay algo que arreglar.
 *
 * QUE MIDE, Y POR QUE NO MIDE SEGUNDOS DE RELOJ. Un bot recorre el flujo a la velocidad de la
 * maquina: un «tardas 4,2 s» seria un numero falso sobre una persona. Lo que SI es del producto:
 *   · PANTALLAS  -- cuantas hay entre abrir por primera vez y la primera sesion corriendo;
 *   · PULSACIONES -- cuantas veces hay que tocar, por el camino MAS CORTO y por el completo;
 *   · el ITINERARIO, boton a boton, para poder auditar el recuento en vez de creerselo;
 *   · y si el onboarding se puede SALTAR, que es la pregunta que decide todo lo demas.
 *
 * LO QUE NO MIDE, y se dice porque la primera version de esta cabecera lo prometia: la ESPERA
 * IMPUESTA (cuentas atras, transiciones bloqueantes). Los `waitForTimeout` de este guion son
 * mios, no del producto, asi que restarlos daria un numero inventado. Medir eso exige
 * instrumentar las transiciones, y es otro banco.

 * RESULTADO EN v0.117.1, para que se vea si cambia: atajo 2 pantallas y 2 pulsaciones;
 * completo 6 pantallas y 9 pulsaciones. Identico en movil y en escritorio, y las dos rutas
 * acaban con una sesion CORRIENDO.
 *
 * DOS CAMINOS, porque la media no existe: el de quien salta todo lo que puede y el de quien
 * contesta las tres preguntas. El primero es el suelo del producto.
 *
 * Uso: node scripts/audit/banco-primer-minuto-s187.js
 * (requiere el servidor estatico: node .claude/static-server.js)
 */
'use strict';

const path = require('path');
const { chromium } = require(path.join(process.cwd(), 'node_modules', '@playwright', 'test'));
const BASE = 'http://localhost:8765/index.html';

/* Una pulsacion contada: hace clic y anota. El texto se guarda para poder LEER el camino
   despues -- un recuento sin el itinerario no se puede auditar. */
function contador() {
  const pasos = [];
  return {
    pasos,
    async toca(loc, etiqueta) {
      const t0 = Date.now();
      await loc.click();
      pasos.push({ etiqueta, ms: Date.now() - t0 });
    },
  };
}

async function nuevaInstalacion(browser, ancho, alto) {
  const ctx = await browser.newContext({
    viewport: { width: ancho, height: alto }, deviceScaleFactor: 1,
    isMobile: ancho < 768, hasTouch: ancho < 768,
  });
  /* Instalacion NUEVA de verdad: no se siembra nada. `firstSeen == null` es lo que dispara
     el onboarding, y sembrar el estado -- como hace la suite- lo saltaria y mediria otra cosa. */
  const page = await ctx.newPage();
  await page.goto(BASE);
  return { ctx, page };
}

const visible = async (loc) => (await loc.count()) > 0 && await loc.first().isVisible();

async function recorrido(browser, modo, ancho, alto) {
  const { ctx, page } = await nuevaInstalacion(browser, ancho, alto);
  const c = contador();
  const t0 = Date.now();
  let pantallas = 0;

  await page.waitForTimeout(600);
  /* EL FLUJO SE BUSCA POR SU DIALOGO, no por un texto suelto: la home vive DETRAS con su
     propio «Empezar foco», y un `getByRole` global lo caza a el -- la primera version de este
     banco se quedo 30 s intentando pulsar un boton tapado por el dialogo. */
  const flujo = page.locator('[role="dialog"][aria-label]').first();
  const hayOnboarding = await visible(flujo);

  if (hayOnboarding) {
    pantallas++;
    if (modo === 'atajo') {
      /* EL SUELO: quien no quiere contestar nada. */
      const saltar = flujo.getByRole('button', { name: /prefiero saltarlo/i });
      if (await visible(saltar)) await c.toca(saltar.first(), 'saltar el onboarding entero');
    } else {
      /* EL CAMINO COMPLETO: bienvenida + tres preguntas + primer Camino.
         EN CADA PANTALLA SE ELIGE UNA OPCION Y SE CONTINUA, que es lo que hace una persona.
         Se excluyen a mano cuatro controles que NO son el camino: el selector de idioma, los
         dos «saltar» y el «Atras» -- la primera version de este banco pulsaba «Atras» porque
         era el primer boton del DOM y se quedaba dando vueltas en la bienvenida. */
      const NO_ES_CAMINO = /ES · EN|prefiero saltarlo|saltar esta pregunta|Atr(a|á)s/i;
      for (let i = 0; i < 8; i++) {
        await page.waitForTimeout(340);
        if (!(await visible(flujo))) break;          // se cerro: ya estamos en la home
        if (i > 0) pantallas++;

        const botones = flujo.locator('button:visible');
        const n = await botones.count();
        let opcion = null, continuar = null;
        for (let k = 0; k < n; k++) {
          const txt = ((await botones.nth(k).textContent()) || '').trim();
          if (NO_ES_CAMINO.test(txt)) continue;
          if (/^(Continuar|Comenzar|Empezar|Vamos|Listo|Ir al camino|Ver el camino)/i.test(txt)) {
            if (!continuar) continuar = { loc: botones.nth(k), txt: txt.slice(0, 26) };
            continue;
          }
          if (!opcion) opcion = { loc: botones.nth(k), txt: txt.slice(0, 26) };
        }
        if (opcion) await c.toca(opcion.loc, opcion.txt);
        if (continuar) await c.toca(continuar.loc, continuar.txt);
        if (!opcion && !continuar) break;
      }
    }
  }

  await page.waitForTimeout(700);
  /* Ya en la home: la primera sesion posible mas corta. «Empezar foco» es el CTA que la home
     ofrece de entrada, sin abrir ninguna biblioteca. */
  const cta = page.getByRole('button', { name: 'Empezar foco', exact: true });
  const listo = await visible(cta);
  if (listo) {
    pantallas++;
    await c.toca(cta.first(), 'Empezar foco');
  }
  await page.waitForTimeout(500);
  const corriendo = await visible(page.getByRole('button', { name: /Pausar/i }));

  const total = Date.now() - t0;
  await ctx.close();
  return { modo, pantallas, toques: c.pasos.length, pasos: c.pasos, corriendo, ms: total, hayOnboarding };
}

(async () => {
  const browser = await chromium.launch();
  console.log('\n=== BANCO DEL PRIMER MINUTO · s187 ===');
  console.log('(las PULSACIONES y las PANTALLAS son del producto; los milisegundos son de esta');
  console.log(' maquina y solo valen para comparar los dos caminos entre si)\n');

  for (const v of [{ n: 'movil 390x844', w: 390, h: 844 }, { n: 'escritorio 1280x800', w: 1280, h: 800 }]) {
    console.log('  ── ' + v.n + ' ──');
    for (const modo of ['atajo', 'completo']) {
      const r = await recorrido(browser, modo, v.w, v.h);
      console.log('    ' + modo.padEnd(9) +
        ' pantallas ' + r.pantallas +
        ' · pulsaciones ' + String(r.toques).padStart(2) +
        ' · sesion corriendo: ' + (r.corriendo ? 'SI' : 'NO') +
        ' · ' + (r.ms / 1000).toFixed(1) + ' s de bot');
      console.log('              camino: ' + r.pasos.map(p => p.etiqueta).join(' → '));
      if (!r.hayOnboarding) console.log('              [AVISO] no aparecio el onboarding');
    }
    console.log('');
  }
  await browser.close();
})();
