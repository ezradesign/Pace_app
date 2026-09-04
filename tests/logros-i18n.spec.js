/* PACE · LOS 96 LOGROS EN INGLES (s167)
 * =====================================
 * Primer aserto de la suite sobre el IDIOMA. Hasta s167 el ingles era uno de
 * los huecos declarados de `npm run test:e2e` junto a movil, Caminos y premium.
 *
 * QUE DEFIENDE
 * ------------
 * Desde s146 estaba abierto que `Achievements.jsx` y `Toast.jsx` leian
 * `a.title`/`a.desc` CRUDOS del catalogo, asi que los 96 logros se mostraban en
 * español con la app en ingles. s167 los enruta por `tR()` contra
 * `app/i18n/content/achievements.js`.
 *
 * POR QUE ES RELACIONAL Y NO UN CENSO DE CADENAS
 * ----------------------------------------------
 * Ni una sola cadena esperada esta escrita aqui a mano: el ingles se lee de
 * `window.PACE_STRINGS.en` y el castellano de `window.ACHIEVEMENT_CATALOG`, los
 * dos DENTRO del artefacto. Un aserto con 96 cadenas copiadas envejeceria a la
 * primera correccion de copy y no diria nada sobre el CABLEADO, que es lo que
 * de verdad se rompio durante dos versiones.
 *
 * LA TRAMPA DE ESTE ARCHIVO
 * -------------------------
 * Se siembran los 96 como DESBLOQUEADOS a proposito. Sin eso, `Seal` pinta
 * «Secreto» en vez del titulo para los 12 secretos y «Pronto» en vez de la
 * descripcion para los no implementados, y la comparacion mediria otra cosa.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto } = require('./helpers');

/* Lee del ARTEFACTO las tres cosas que se comparan: el catalogo (castellano),
   el patch EN y lo que cada sello esta pintando de verdad. Una sola llamada.
 *
 * SE COMPARA SELLO A SELLO, NO CONTRA EL TEXTO DEL PANEL. La primera version
 * hacia `panel.innerText.includes(titulo)` y dio un FALSO POSITIVO: `includes`
 * casa por SUBCADENA, asi que el ingles «Coherent» se encontraba dentro del
 * castellano «Coherente» y el test acusaba a la app de colar ingles en español.
 * Es la misma trampa que s154 documento para `getByRole`. Por eso la tarjeta
 * lleva `data-pace-ach` con su id: permite igualdad EXACTA. */
async function leerPanel(page) {
  return page.evaluate(() => {
    const cat = window.ACHIEVEMENT_CATALOG || [];
    const en = (window.PACE_STRINGS && window.PACE_STRINGS.en) || {};
    return cat.map(a => {
      const card = document.querySelector('[data-pace-ach="' + a.id + '"]');
      const lineas = card ? (card.innerText || '').split('\n').map(s => s.trim()).filter(Boolean) : [];
      return {
        id: a.id,
        es: a.title,
        esDesc: a.desc,
        en: en['ach.item.' + a.id + '.title'],
        enDesc: en['ach.item.' + a.id + '.desc'],
        /* El sello pinta glifo, titulo y descripcion; el titulo es la penultima
           linea con texto y la descripcion la ultima. */
        titulo: lineas.length >= 2 ? lineas[lineas.length - 2] : null,
        desc: lineas.length >= 1 ? lineas[lineas.length - 1] : null,
      };
    });
  });
}

async function abrirLogros(page) {
  /* El panel se abre por EVENTO: el enlace de la sidebar dice «te quedan N» y
     buscarlo por nombre es fragil (Sidebar.jsx:123). */
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:open-achievements')));
  await page.waitForSelector('[data-pace-modal-backdrop]', { timeout: 10_000 });
  await expect(page.locator('[data-pace-modal-backdrop]').last()).toContainText(/Logros|Achievements/);
}

/* Los 96 desbloqueados + los guards de migracion de s166: sin
   `_weeklyStatsReindexed_v0_28_8` el `loadState` rota la semana un dia. */
function estadoTodoDesbloqueado(lang) {
  return {
    lang,
    langAuto: false,
    _weeklyStatsReindexed_v0_28_8: true,
    _historyRecalculated_v0_28_8: true,
    _historyMigrated: true,
    lastActiveDay: new Date().toDateString(),
  };
}

test('en INGLES los 96 logros se leen en ingles, y ni uno cae al castellano', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, estadoTodoDesbloqueado('en'));
  await irAlArtefacto(page);
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('pace.state.v2') || '{}');
    s.achievements = {};
    (window.ACHIEVEMENT_CATALOG || []).forEach(a => { s.achievements[a.id] = Date.now(); });
    localStorage.setItem('pace.state.v2', JSON.stringify(s));
  });
  await page.reload();
  await abrirLogros(page);

  const items = await leerPanel(page);

  /* GUARD DE CERO Y DE COBERTURA. «0 comprobados» no es «todo bien», es «no
     corrio»; y si el catalogo creciera sin traduccion, esto lo dice. */
  expect(items.length).toBe(96);
  expect(items.filter(i => !i.en || !i.enDesc).map(i => i.id)).toEqual([]);
  expect(items.filter(i => !i.titulo).map(i => i.id)).toEqual([]);

  /* IGUALDAD EXACTA, sello a sello: el titulo pintado ES el ingles. */
  const mal = items.filter(i => i.titulo !== i.en);
  expect(mal.map(i => i.id + ': «' + i.titulo + '» != «' + i.en + '»')).toEqual([]);

  const malDesc = items.filter(i => i.desc !== i.enDesc);
  expect(malDesc.map(i => i.id + ': «' + i.desc + '» != «' + i.enDesc + '»')).toEqual([]);

  /* CONTROL POSITIVO del propio aserto: si TODOS los titulos fuesen iguales en
     los dos idiomas, lo de arriba pasaria sin distinguir nada. Se exige que
     haya un numero sustancial de pares realmente distintos. */
  expect(items.filter(i => i.es !== i.en).length).toBeGreaterThan(80);

  expect(errores).toEqual([]);
});

test('en ESPAÑOL siguen leyendose en castellano: el patch EN no se cuela', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, estadoTodoDesbloqueado('es'));
  await irAlArtefacto(page);
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('pace.state.v2') || '{}');
    s.achievements = {};
    (window.ACHIEVEMENT_CATALOG || []).forEach(a => { s.achievements[a.id] = Date.now(); });
    localStorage.setItem('pace.state.v2', JSON.stringify(s));
  });
  await page.reload();
  await abrirLogros(page);

  const items = await leerPanel(page);
  expect(items.length).toBe(96);
  expect(items.filter(i => !i.titulo).map(i => i.id)).toEqual([]);

  /* La otra direccion, que es la que se rompe al «arreglar» el ingles de mas:
     en castellano manda el dato del catalogo, exactamente. */
  const mal = items.filter(i => i.titulo !== i.es);
  expect(mal.map(i => i.id + ': «' + i.titulo + '» != «' + i.es + '»')).toEqual([]);

  const malDesc = items.filter(i => i.desc !== i.esDesc);
  expect(malDesc.map(i => i.id + ': «' + i.desc + '» != «' + i.esDesc + '»')).toEqual([]);

  expect(errores).toEqual([]);
});

test('el aviso de logro nuevo tambien habla ingles', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, { lang: 'en', langAuto: false });
  await irAlArtefacto(page);

  /* El vaso de agua es la unica accion que acredita SIN pasar por la cola
     escalonada de s145, asi que drena su propio aviso al momento
     (state-hydrate.jsx:70). Es el mismo camino que usa checklist-estado. */
  await page.getByRole('button', { name: /^Hydrate/i }).click();
  await page.locator('[data-pace-modal-backdrop]').last()
    .getByRole('button', { name: /One more glass|Un vaso más/i }).click();

  const toast = page.locator('div[aria-live="polite"][aria-atomic="true"]');
  const esperado = await page.evaluate(() =>
    (window.PACE_STRINGS.en || {})['ach.item.first.sip.title']);
  expect(esperado).toBeTruthy();          // guard: sin clave no se ha medido nada
  await expect(toast).toContainText(esperado);
  await expect(toast).not.toContainText('Primer sorbo');

  expect(errores).toEqual([]);
});

/* ============================================================
   LA TERCERA SUPERFICIE: EL ULTIMO LOGRO DE LA SIDEBAR (s183)
   ------------------------------------------------------------
   POR QUE ESTE HUECO SOBREVIVIO A s167. Aquel arreglo cubrio las dos
   superficies que ENTONCES decian el nombre de un logro: el panel y el toast.
   La sidebar no lo decia -- pintaba una rejilla de cinco sellos SIN texto, solo
   dibujo-- asi que no habia nada que traducir. s180 la sustituyo por UNA fila
   que si dice el nombre, leyendolo de `achMini()`, y el hueco se abrio sin que
   nadie tocara i18n. Publicado desde v0.108.0.

   POR QUE VIVE AQUI Y NO EN `sidebar-*.spec.js`. Lo que se prueba es el
   CABLEADO i18n del catalogo de logros, que es de lo que trata este archivo;
   los specs de sidebar prueban geometria. `tests/helpers.js` ya lo dice al
   documentar `leerUltimoLogro`: «que el titulo se pinte bien es cosa de
   logros-i18n.spec.js». Hasta hoy no lo era.

   RELACIONAL COMO SUS HERMANOS: ni el id ni las dos cadenas se escriben a mano.
   Se elige del catalogo DENTRO del artefacto el primer logro no secreto cuyos
   titulos ES y EN difieran -- si fueran iguales el aserto pasaria sin distinguir
   nada-- y se compara contra lo que la fila pinta de verdad.
   ============================================================ */

/* Deja UN solo logro desbloqueado, elegido por el propio artefacto, y devuelve
   sus dos titulos. La forma del valor es `{ unlockedAt }` y no un numero pelado
   porque es la que escribe el producto (state-achievements.jsx:227) y la que
   lee el selector (`Sidebar.selectors.js:191`); un numero pelado deja el
   `unlockedAt` en `undefined` y el «mas reciente» pasa a ser un empate.

   LOS SECRETOS SE EXCLUYEN A PROPOSITO: la fila pinta '?' para ellos, que es
   decision de producto, no un titulo sin traducir. */
async function dejarUnSoloLogro(page) {
  return page.evaluate(() => {
    const cat = window.ACHIEVEMENT_CATALOG || [];
    const en = (window.PACE_STRINGS && window.PACE_STRINGS.en) || {};
    const elegido = cat.find(a => !a.secret &&
      en['ach.item.' + a.id + '.title'] &&
      en['ach.item.' + a.id + '.title'] !== a.title);
    if (!elegido) return null;
    const s = JSON.parse(localStorage.getItem('pace.state.v2') || '{}');
    s.achievements = { [elegido.id]: { unlockedAt: Date.now() } };
    localStorage.setItem('pace.state.v2', JSON.stringify(s));
    return { id: elegido.id, es: elegido.title, en: en['ach.item.' + elegido.id + '.title'] };
  });
}

/* La fila tal como queda en el DOM: a quien senala, que texto pinta y que dice
   su tooltip. El titulo se lee de su propio gancho y no del `textContent` de la
   fila, que arrastraria el glifo cuando es un caracter. */
function leerFilaUltimo(page) {
  return page.evaluate(() => {
    const sb = document.querySelector('[data-pace-sidebar]');
    const fila = sb && sb.querySelector('[data-pace-sidebar-ultimo]');
    if (!fila) return null;
    const tit = fila.querySelector('[data-pace-sidebar-ultimo-titulo]');
    return {
      id: fila.getAttribute('data-pace-sidebar-ultimo') || null,
      titulo: tit ? tit.textContent : null,
      tooltip: fila.getAttribute('title'),
    };
  });
}

test('en INGLES el ultimo logro de la sidebar tambien se lee en ingles', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, estadoTodoDesbloqueado('en'));
  await irAlArtefacto(page);

  const elegido = await dejarUnSoloLogro(page);
  expect(elegido, 'ningun logro no secreto tiene titulo EN distinto del ES').not.toBeNull();
  await page.reload();
  await page.locator('[data-pace-sidebar-ultimo]').waitFor({ state: 'visible' });

  const fila = await leerFilaUltimo(page);
  /* GUARD: si la siembra no llegara, lo de abajo mediria otra fila. */
  expect(fila && fila.id).toBe(elegido.id);

  expect(fila.titulo).toBe(elegido.en);
  /* El tooltip sale del MISMO `mini.title`, pero por otro atributo: si manana
     alguien tradujera solo el texto visible, esto lo dice. */
  expect(fila.tooltip).toBe(elegido.en);
  expect(fila.titulo).not.toBe(elegido.es);

  expect(errores).toEqual([]);
});

test('en ESPANOL el ultimo logro de la sidebar sigue en castellano', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, estadoTodoDesbloqueado('es'));
  await irAlArtefacto(page);

  const elegido = await dejarUnSoloLogro(page);
  expect(elegido).not.toBeNull();
  await page.reload();
  await page.locator('[data-pace-sidebar-ultimo]').waitFor({ state: 'visible' });

  const fila = await leerFilaUltimo(page);
  expect(fila && fila.id).toBe(elegido.id);

  /* La otra direccion, la que se rompe al «arreglar» el ingles de mas. */
  expect(fila.titulo).toBe(elegido.es);
  expect(fila.tooltip).toBe(elegido.es);

  expect(errores).toEqual([]);
});
