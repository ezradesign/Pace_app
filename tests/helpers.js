/* PACE · utilidades compartidas de la suite E2E (s154)
 * ====================================================
 * Aqui vive lo que TODOS los specs necesitan y ninguno debe reinventar. Cada
 * bloque documenta la trampa que lo hizo necesario: son trampas medidas, no
 * precauciones de manual.
 */
'use strict';

const CLAVE_ESTADO = 'pace.state.v2';

/* El artefacto canonico. El servidor mapea `/` a `PACE.html` (el entry de
   DESARROLLO), asi que la ruta va explicita: se verifica el compilado. */
const RUTA_ARTEFACTO = '/index.html';

/* Estado minimo para aterrizar en la HOME.
   `firstSeen` es lo unico imprescindible: el onboarding se abre con
   `state.firstSeen == null` (Onboarding.jsx:36) y su default es `null`
   (state-core.jsx:125), asi que SIN esto cada test empieza dentro del
   onboarding y todos los asertos de la home fallan por una razon que no es la
   que parece. `lang`/`palette` se fijan para no depender de la deteccion.
   El resto lo rellena el merge `{...defaultState, ...parsed}` de `loadState`. */
const SEMILLA = {
  firstSeen: 1,
  lang: 'es',
  langAuto: false,
  palette: 'crema',
  /* s192 · «A TU RITMO» OCUPA EL SITIO DE ACTIVIDADES. Las pruebas que no son de
     ese módulo abren bibliotecas desde los chips de la home, así que aterrizan
     con la carta SIEMPRE (`libre: true`, sin fecha). Con una fecha no valdría:
     varias pruebas falsean el reloj y el «hoy» de la semilla no casaría con el de
     la app. Las de A tu ritmo siembran su propio `ritmo`. */
  ritmo: { libre: true },
};

/**
 * Siembra el estado en `localStorage` ANTES de que la app evalue.
 *
 * TRAMPA MEDIDA (s154): `addInitScript` corre en CADA navegacion, tambien en
 * los `reload()`. Sembrando a secas, la recarga machaca lo que la app acaba de
 * persistir y la prueba de persistencia sale roja **con la app intacta**. Por
 * eso escribe SOLO SI FALTA: el primer arranque siembra, la recarga respeta.
 */
async function sembrar(context, extra) {
  await context.addInitScript(([clave, estado]) => {
    if (!localStorage.getItem(clave)) {
      localStorage.setItem(clave, JSON.stringify(estado));
    }
  }, [CLAVE_ESTADO, Object.assign({}, SEMILLA, extra || {})]);
}

/* SIEMBRA QUE PISA (s162) · el efecto de segundo orden de la trampa de arriba.
 *
 * `sembrar` escribe SOLO SI FALTA, y eso es correcto por lo de s154. Pero en un
 * archivo con `beforeEach(sembrar)` —checklist-estado.spec.js lo tiene—, una
 * SEGUNDA llamada con estado extra NO ENTRA NUNCA: la primera ya dejo la clave
 * puesta, asi que el `if` de la segunda es falso y el extra se descarta en
 * silencio. Costo un rojo perfectamente enganoso: la app arrancaba bien, el
 * estado extra no estaba, y el aserto fallaba como si el producto no funcionara
 * («1/88» esperado, «0/88» recibido) cuando el producto ya estaba arreglado.
 *
 * Esta version escribe SIEMPRE, asi que se llama DESPUES del beforeEach y gana.
 *
 * NO SIRVE PARA PRUEBAS CON `reload()`: ahi machacaria lo que la app acaba de
 * persistir, que es justo lo que `sembrar` evita. Si hace falta recargar,
 * sembrar una vez y no pisar. */
async function sembrarPisando(context, extra) {
  await context.addInitScript(([clave, estado]) => {
    localStorage.setItem(clave, JSON.stringify(estado));
  }, [CLAVE_ESTADO, Object.assign({}, SEMILLA, extra || {})]);
}

/* TRAMPA MEDIDA (s154) · EL TEXTO QUE SE ASERTA ES `textContent`, NO EL QUE SE VE.
   Los matchers de Playwright (`toHaveText`, `getByText`) comparan contra
   `textContent`, o sea el texto del DOM SIN el `text-transform` de CSS. Un
   reconocimiento hecho con `innerText` devuelve el texto RENDERIZADO y lleva a
   escribir asertos que no pueden pasar: `[data-pace-dial-label]` contiene
   «Foco manual» y se PINTA «FOCO MANUAL»; igual el «Colócate» del runner y el
   «Nuevo sello» del toast. Medir con un instrumento y asertar con otro cuesta
   tres rojos. Si se anade un aserto de texto, leer antes su `textContent`. */

/** Engancha los errores de consola y de pagina. Devuelve el array VIVO. */
function capturarErrores(page) {
  const errores = [];
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  page.on('console', m => {
    if (m.type() === 'error') errores.push('console.error: ' + m.text());
  });
  return errores;
}

/** Abre el artefacto y espera a que la home este montada de verdad. */
async function irAlArtefacto(page) {
  await page.goto(RUTA_ARTEFACTO);
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
}

/**
 * El ULTIMO logro tal como lo ve el usuario en la sidebar.
 *
 * SUSTITUYE A `leerLogros` (s180). Aquella leia el contador «N/M» del bloque
 * LOGROS del sidebar, y ese bloque ya no existe: el rediseño retiro la rejilla
 * de cinco miniaturas y su contador, y dejo UN logro -- el mas reciente-- que
 * es la unica pregunta que la persona se hace. El contador sigue vivo donde
 * manda §15.4 (el modal de la coleccion), no aqui.
 *
 * Devuelve el ID del logro, o `null` si todavia no hay ninguno. Se lee el ID y
 * no el titulo a proposito: el titulo cambia con el idioma y con el copy, y lo
 * que estas pruebas quieren saber es CUAL se concedio. Que el titulo se pinte
 * bien es cosa de `tests/logros-i18n.spec.js`.
 */
function leerUltimoLogro(page) {
  return page.evaluate(() => {
    const sb = document.querySelector('[data-pace-sidebar]');
    if (!sb) return null;
    const el = sb.querySelector('[data-pace-sidebar-ultimo]');
    if (!el) return null;
    return el.getAttribute('data-pace-sidebar-ultimo') || null;
  });
}

/**
 * Cuenta sellos que pintan MASCARA (`renderGlyph` -> `<span>` con
 * `mask-image: url(...)` inline, Achievements.jsx:24-36).
 *
 * TRAMPA MEDIDA (s152, reproducida aqui): contar sobre la pagina entera da
 * SIEMPRE de mas — la miniatura del sidebar y el toast del logro recien
 * desbloqueado pintan por el MISMO `renderGlyph`. Hay que acotar a
 * `[data-pace-modal-backdrop]`. Se ofrecen las dos cuentas justamente para
 * poder asertar la diferencia en vez de taparla.
 */
function contarSellos(page, soloModal) {
  return page.evaluate(dentroDelModal => {
    const raiz = dentroDelModal
      ? document.querySelector('[data-pace-modal-backdrop]')
      : document;
    if (!raiz) return null;
    return Array.from(raiz.querySelectorAll('span')).filter(s => {
      const m = s.style.maskImage || s.style.webkitMaskImage || '';
      return m.indexOf('url(') === 0;
    }).length;
  }, !!soloModal);
}

/** El backdrop de MAS ARRIBA: la libreria deja el suyo debajo del Preview. */
function overlaySuperior(page) {
  return page.locator('[data-pace-modal-backdrop]').last();
}

/** Espera a que el modal de arriba TERMINE su animacion de entrada.
 *
 * TRAMPA MEDIDA (s176): `Modal` entra con `pace-modal-in`, que va de scale .96
 * a 1, asi que cualquier caja medida antes de tiempo sale al 96 % -- 777,6 px
 * donde la app da 810, o 584 donde da 607. Lo primero que probe fue esperar a
 * que DOS lecturas seguidas coincidieran, y **no vale**: la curva se aplana
 * cerca del final y dos muestras a 100 ms pueden coincidir a mitad del fundido.
 * El aserto de Stats salio rojo por eso, con la app ya arreglada.
 *
 * `getAnimations()` no estima: pregunta. Se espera a que todas las animaciones
 * del modal esten en `finished`, que es el unico momento en que la caja es la
 * definitiva. */
async function esperarModalAsentado(page) {
  await page.waitForFunction(() => {
    const el = [...document.querySelectorAll('[data-pace-modal-card]')]
      .filter(e => e.getBoundingClientRect().width > 0).pop();
    if (!el) return false;
    const anims = typeof el.getAnimations === 'function' ? el.getAnimations() : [];
    return anims.every(a => a.playState === 'finished');
  }, null, { timeout: 15000, polling: 60 });
}

/* DESDE LA 1A (Ez, 22 oct. 2026) LA HOME ABRE CON LOS MÓDULOS Y LA TARJETA CORTA: sin
   contestar ya no se ve la pregunta entera. Las pruebas que la necesitan la abren como la
   persona, con «Comienza» (móvil) o «Ajustar el horario» (escritorio). */
async function pulsarComienza(page) {
  await page.locator('[data-pace-ritmo-comienza], [data-pace-ritmo-ajustar]').filter({ visible: true }).first().click();
}

/* BORRAR E IMPORTAR PREGUNTAN CON UN AVISO DE PACE (Ez, 3A del 27 oct. 2026), no con el
   `confirm()` del navegador: `AjustesAviso` (TweaksPanel.parts.jsx). Esto los acepta solos,
   como antes `page.on('dialog', d => d.accept())`, también tras recargar, y apunta el texto de
   cada uno. Si saliera una ventana del navegador, queda en `textos.navegador` y se cierra. */
async function aceptarAvisosPace(page) {
  if (page.__paceAvisos) return page.__paceAvisos; // una sola vez por página
  const textos = [];
  textos.navegador = [];
  page.__paceAvisos = textos;
  page.on('dialog', (d) => { textos.navegador.push(d.message()); d.dismiss().catch(() => {}); });
  await page.exposeFunction('__paceAvisoVisto', (t) => { textos.push(t); });
  const vigilar = () => {
    if (window.__paceAvisosVigilados) return;
    window.__paceAvisosVigilados = true;
    const mirar = () => {
      document.querySelectorAll('[data-pace-aj-aviso]:not([data-visto])').forEach((a) => {
        a.setAttribute('data-visto', '');
        window.__paceAvisoVisto((a.querySelector('p') || a).textContent);
        const botones = a.querySelectorAll('button');
        setTimeout(() => botones[botones.length - 1].click(), 0);
      });
    };
    /* `document` y no `documentElement`: tras recargar, el init script corre antes de que exista. */
    new MutationObserver(mirar).observe(document, { childList: true, subtree: true });
  };
  await page.addInitScript(vigilar);
  await page.evaluate(vigilar).catch(() => {});
  return textos;
}

/* DESPUÉS DE «¿CÓMO ES TU SEMANA?» van PACE completo, abierto hasta v1, y la visita guiada por
   la home (Ez, 2A y 1C del 27 oct. 2026). Las pruebas que no son de ellas pasan por las dos
   como quien tiene prisa: «Comenzar» y «Saltar la visita». Las suyas: compra-tienda.spec.js y
   bienvenida-visita.spec.js. */
async function acabarBienvenida(page) {
  await page.locator('[data-pace-onb-comenzar]').click();
  await page.locator('[data-pace-visita-saltar]').click();
  await page.locator('[data-pace-visita]').waitFor({ state: 'detached' });
}

/* EN UNA PANTALLA BAJA, «TUS DATOS» VA PLEGADA: en el móvil (Ez, 2A del 22 oct.) y en el
   ordenador por debajo de 860 px de alto (3A del 27 oct.), y la suite corre a 1280 × 720. Sus
   filas (exportar, importar, borrar, PACE completo, el pie) se ven tras «Copias, borrar y PACE
   completo ›», como las ve la persona. Con Ajustes abierto, abre esa vista si hace falta. */
async function abrirTusDatos(page) {
  const panel = page.locator('[data-pace-tweaks-panel]');
  await panel.waitFor({ state: 'visible' });
  const plegada = panel.locator('[data-pace-aj-plegada] .pace-aj-sec-accion');
  if (await plegada.isVisible()) {
    await plegada.click();
    await page.locator('[data-pace-tweaks-panel][data-pace-aj-vista="datos"]').waitFor();
  }
}

/* UNA CONDICIÓN ASÍNCRONA SE ESPERA AQUÍ, NUNCA CON `page.waitForFunction(async …)`. Playwright
   no espera a la promesa: la toma por un valor verdadero y vuelve en el primer sondeo, a los
   ~20 ms, aunque la condición sea falsa (medido con 1.62.1). Once esperas así no esperaban nada,
   y la prueba solo pasaba si la app ganaba la carrera: en el CI de 3bde26f, `eventos-backup`
   leyó el contenedor antes de que entrara la copia. Esto evalúa la condición en la página cada
   50 ms hasta que dé verdadero o se acabe el tiempo, con la misma firma que `waitForFunction`.
   Aguanta una recarga a mitad (importar y borrar recargan); cualquier otro error se propaga.
   Lo vigila `verify` (`scripts/verify.pruebas.js`). */
async function esperarEnPagina(page, condicion, arg, opciones) {
  const tope = (opciones && opciones.timeout) || 5000;
  const desde = Date.now();
  let recargando = null;
  for (;;) {
    try {
      if (await page.evaluate(condicion, arg)) return;
      recargando = null;
    } catch (e) {
      if (!/Execution context was destroyed|because of a navigation/.test(e.message)) throw e;
      recargando = e;
    }
    if (Date.now() - desde > tope) {
      throw new Error('esperarEnPagina: la condición no se cumplió en ' + tope + ' ms' +
        (recargando ? ' (la página estaba recargando)' : ''));
    }
    await page.waitForTimeout(50);
  }
}

module.exports = {
  abrirTusDatos,
  esperarEnPagina,
  acabarBienvenida,
  aceptarAvisosPace,
  pulsarComienza,
  esperarModalAsentado,
  CLAVE_ESTADO,
  RUTA_ARTEFACTO,
  SEMILLA,
  sembrar,
  sembrarPisando,
  capturarErrores,
  irAlArtefacto,
  leerUltimoLogro,
  contarSellos,
  overlaySuperior,
};
