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

/** Lee el contador de logros del sidebar, en formato «1/88». */
function leerLogros(page) {
  return page.evaluate(() => {
    const sb = document.querySelector('[data-pace-sidebar]');
    if (!sb) return null;
    const m = sb.innerText.match(/LOGROS\s*\n\s*(\d+)\s*\/\s*(\d+)/);
    return m ? m[1] + '/' + m[2] : null;
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

module.exports = {
  CLAVE_ESTADO,
  RUTA_ARTEFACTO,
  SEMILLA,
  sembrar,
  capturarErrores,
  irAlArtefacto,
  leerLogros,
  contarSellos,
  overlaySuperior,
};
