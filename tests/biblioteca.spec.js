/* PACE · tests/biblioteca.spec.js (sesión 174)
   =============================================
   LAS TRES BIBLIOTECAS REDISEÑADAS. Lo que defiende, y por qué merece un
   aserto cada cosa:

   · EL FILTRO, que es la pieza que cobra la promesa. La tarjeta CRECIÓ para
     informar; lo que devuelve el scroll es poder descartar. Si el filtro deja
     de filtrar, el rediseño es sólo una biblioteca más larga.
   · EL GRUPO QUE SE QUEDA A CERO. Es el estado que la maqueta destapó y el
     único que no se ve leyendo el código: sin él, dos cabeceras de Estira se
     pintan con nada debajo -- el mismo fallo que el verify vigila en las
     familias de logro desde s168.
   · QUE «PARA AHORA» NO REPITA. Sube dos rutinas arriba y las quita de su
     grupo; si la resta fallara, saldrían dos veces y nadie lo notaría leyendo.
   · QUE EL FILTRO SE LIMPIE AL CERRAR. El modal se OCULTA, no se desmonta, así
     que el estado sobrevive por defecto: es un olvido que no avisa.

   TODO RELACIONAL: ningún número de rutina vive dentro de este archivo. Las
   cuentas se derivan del CATÁLOGO leído del propio artefacto, así que añadir
   una rutina no pone el test en rojo -- y quitar el filtro sí. Cada aserto se
   calibró en ROJO antes de darlo por bueno.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

/* EL CATÁLOGO SE LEE DE LAS FUENTES, no de la página. Dos razones, y la
   segunda es la buena:
   1. No se puede leer de la página: `EXTRA_ROUTINES` y `BREATHE_ROUTINES` son
      `const` y NO cruzan la IIFE del artefacto (la trampa de s148; sólo
      `MOVE_ROUTINES` es `var` y por eso sí es global). Exponerlas a `window`
      para que un test las vea sería cambiar el producto por el instrumento.
   2. Aunque se pudiera, no se debe: cruzar la pantalla contra un dato leído de
      esa MISMA pantalla no prueba nada. Aquí las dos fuentes son
      independientes -- el DOM que pinta React y el archivo del catálogo-- y por
      eso la comparación muerde.
   Se carga UNA vez por proceso, con el mismo sandbox que usa el `verify`. */
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const sandbox = require(path.join(ROOT, 'scripts', 'verify.sandbox.js'));

let _cat = null;
function catalogoFuente() {
  if (_cat) return _cat;
  const ctx = { ROOT, babel: require(path.join(ROOT, 'node_modules', '@babel', 'core')) };
  const sb = sandbox.nuevoSandbox();
  const errs = [
    sandbox.cargar(ctx, sb, 'app/move/move.data.js', { __M: 'MOVE_ROUTINES' }),
    sandbox.cargar(ctx, sb, 'app/extra/ExtraModule.jsx', { __E: 'EXTRA_ROUTINES' }),
    sandbox.cargar(ctx, sb, 'app/breathe/BreatheLibrary.jsx', { __B: 'BREATHE_ROUTINES' }),
  ].filter(Boolean);
  if (errs.length) throw new Error('no se pudo leer el catálogo: ' + errs.join(' · '));
  const leer = (G) => {
    const out = [];
    Object.keys(G || {}).forEach(k => (G[k].items || []).forEach(r => out.push({
      id: r.id, min: r.min, grupo: k,
      suelo: !!r.requiresFloor,
      equipo: (r.equipment || []).slice(),
      premium: r.access === 'premium',
      safety: !!r.safety,
      series: (r.steps || []).filter(s => s && s.mode === 'reps').length,
    })));
    return out;
  };
  _cat = { move: leer(sb.__M), extra: leer(sb.__E), breathe: leer(sb.__B) };
  /* GUARD DE CERO: con los tres catálogos vacíos, TODAS las comparaciones de
     este archivo cruzarían conjuntos vacíos y saldrían verdes. */
  if (!_cat.move.length || !_cat.extra.length || !_cat.breathe.length) {
    throw new Error('catálogo vacío: ' + JSON.stringify({
      move: _cat.move.length, extra: _cat.extra.length, breathe: _cat.breathe.length }));
  }
  return _cat;
}
async function catalogo(page, cual) { return catalogoFuente()[cual]; }

const aqui = r => !r.suelo && r.equipo.indexOf('bar') === -1;

async function abrir(page, nombre) {
  await page.getByRole('button', { name: nombre }).first().click();
  await page.locator('.pace-lib').waitFor({ state: 'visible' });
}

/* Las tarjetas que se VEN. El lateral y el bloque «solo móvil» existen los dos
   en el DOM y la hoja apaga el que sobra según la piel, así que contar por
   selector a secas cuenta de más -- costó cuatro medidas equivocadas en s174
   antes de acotarlo. */
/* El chip que de verdad se puede tocar: en móvil vive bajo la cabecera y en
   escritorio en el lateral, y la copia apagada NO recibe clics. Sin este filtro
   el click se queda esperando 60 s a un elemento con display:none. */
function chipVisible(page, i) {
  return page.locator('.pace-lib .pace-lib-chip').locator('visible=true').nth(i);
}

function idsVisibles(page, dentro) {
  return page.evaluate((sel) => {
    const raiz = sel ? document.querySelector(sel) : document;
    if (!raiz) return [];
    return Array.from(raiz.querySelectorAll('[data-pace-lib-card]'))
      .filter(e => e.getBoundingClientRect().width > 0)
      .map(e => e.getAttribute('data-pace-lib-card'));
  }, dentro || null);
}

/* EL RELOJ VA CONGELADO. «Para ahora» rota POR DÍA, así que sin fijarlo hay
   asertos que muerden un martes y no un miércoles -- y un test que depende del
   calendario no dice nada el día que pasa. `setFixedTime` congela `Date` pero
   NO detiene los temporizadores, que es lo que hace falta aquí (con
   `clock.install` rAF sólo corre si el reloj avanza, la trampa de s161). */
test.beforeEach(async ({ context, page }) => {
  await sembrar(context);
  await page.clock.setFixedTime(new Date('2026-08-26T10:00:00'));
});

test('los tres chips cuentan lo que el catálogo dice, en las dos bibliotecas', async ({ page }) => {
  await irAlArtefacto(page);
  for (const [boton, cual] of [[/^Estira/, 'extra'], [/^Mueve/, 'move']]) {
    await abrir(page, boton);
    const cat = await catalogo(page, cual);
    /* El umbral de «Corto» es RELATIVO y se lee del propio chip: aquí no vive
       ni el 2 de Mueve ni el 4 de Estira. Lo que se aserta es que el número
       que enseña case con el catálogo bajo ese mismo umbral. */
    const textos = await page.locator('.pace-lib-main .pace-lib-chip').allTextContents();
    expect(textos.length).toBe(3);
    const n = (s) => parseInt((s.match(/(\d+)\s*$/) || [])[1], 10);
    expect(n(textos[0])).toBe(cat.filter(aqui).length);
    expect(n(textos[1])).toBe(cat.filter(r => r.equipo.length === 0).length);
    const umbral = parseInt((textos[2].match(/(\d+)\s*min/) || [])[1], 10);
    expect(Number.isFinite(umbral)).toBe(true);
    expect(n(textos[2])).toBe(cat.filter(r => r.min <= umbral).length);
    /* GUARD DE CERO: si el umbral fuera absurdo (0, o mayor que la rutina más
       larga) las tres cuentas seguirían casando y el chip no filtraría nada. */
    expect(n(textos[2])).toBeGreaterThan(0);
    expect(n(textos[2])).toBeLessThan(cat.length);
    await page.keyboard.press('Escape');
  }
});

test('«Aquí mismo» esconde las de suelo y deja los grupos vacíos DICIENDO por qué', async ({ page }) => {
  await irAlArtefacto(page);
  await abrir(page, /^Estira/);
  const cat = await catalogo(page, 'extra');
  const antes = await idsVisibles(page, '.pace-lib');
  expect(antes.length).toBe(cat.length);

  await chipVisible(page, 0).click();
  const despues = await idsVisibles(page, '.pace-lib');
  const esperadas = cat.filter(aqui).map(r => r.id).sort();
  expect(despues.slice().sort()).toEqual(esperadas);
  /* control positivo: el filtro tiene que QUITAR algo, o el aserto de arriba
     pasaría igual con un filtro inerte */
  expect(despues.length).toBeLessThan(antes.length);

  /* Los grupos que se quedan a cero se DERIVAN del catálogo, no se escriben: */
  const gruposVacios = [...new Set(cat.map(r => r.grupo))]
    .filter(g => cat.filter(r => r.grupo === g).every(r => !aqui(r)));
  expect(gruposVacios.length).toBeGreaterThan(0);
  const pintados = await page.locator('[data-pace-lib-empty]').evaluateAll(
    es => es.map(e => e.getAttribute('data-pace-lib-empty')));
  expect(pintados.slice().sort()).toEqual(gruposVacios.slice().sort());
  /* y su cabecera SIGUE ahí: el grupo no desaparece, explica */
  for (const g of gruposVacios) {
    const linea = page.locator('[data-pace-lib-empty="' + g + '"]');
    await expect(linea).toBeVisible();
    const n = cat.filter(r => r.grupo === g).length;
    await expect(linea).toContainText(String(n));
  }

  /* «quitar el filtro» devuelve la biblioteca entera */
  await page.locator('.pace-lib .pace-lib-quitar').locator('visible=true').first().click();
  expect((await idsVisibles(page, '.pace-lib')).length).toBe(cat.length);
});

test('«Para ahora» propone contexto y NO repite lo que ya está en su grupo', async ({ page }) => {
  await irAlArtefacto(page);
  await abrir(page, /^Mueve/);
  const cat = await catalogo(page, 'move');
  const propuestas = await page.evaluate(() => {
    const bloques = Array.from(document.querySelectorAll('[data-pace-lib-now]'))
      .filter(e => e.getBoundingClientRect().width > 0);
    return bloques.flatMap(b => Array.from(b.querySelectorAll('[data-pace-lib-card]'))
      .map(e => e.getAttribute('data-pace-lib-card')));
  });
  /* UNA, no dos (s175). El número es una DECISIÓN de producto y por eso se
     escribe aquí: con dos, el lateral de escritorio no cabe a 1536x714 y la
     segunda sugerencia se corta. Elegido mirándolo, variante A2. */
  expect(propuestas.length).toBe(1);
  /* lo que propone se puede hacer DONDE ESTÁS: es la regla entera */
  propuestas.forEach(id => {
    const r = cat.find(x => x.id === id);
    expect(r && aqui(r)).toBe(true);
  });
  /* y no sale dos veces en la pantalla */
  const todas = await idsVisibles(page, '.pace-lib');
  expect(todas.length).toBe(new Set(todas).size);
  expect(todas.length).toBe(cat.length);
});

test('el filtro se limpia al cerrar la biblioteca', async ({ page }) => {
  await irAlArtefacto(page);
  await abrir(page, /^Estira/);
  const cat = await catalogo(page, 'extra');
  await chipVisible(page, 0).click();
  expect((await idsVisibles(page, '.pace-lib-main')).length).toBeLessThan(cat.length);
  await page.keyboard.press('Escape');
  await page.locator('.pace-lib').waitFor({ state: 'hidden' });
  await abrir(page, /^Estira/);
  /* El modal se OCULTA y no se desmonta: sin la limpieza explícita, esto
     seguiría filtrado. */
  expect((await idsVisibles(page, '.pace-lib')).length).toBe(cat.length);
  const pulsados = await page.locator('.pace-lib .pace-lib-chip[aria-pressed="true"]').locator('visible=true').count();
  expect(pulsados).toBe(0);
});

test('la línea de series sólo aparece donde hay DOS series o más', async ({ page }) => {
  await irAlArtefacto(page);
  /* GUARD DE CERO DE LA TANDA, y no de cada biblioteca: ESTIRA no tiene ni una
     rutina con dos series (sus 14 son posturas sostenidas), así que ahí la
     lista esperada vale cero con toda la razón y un guard por vuelta se pondría
     rojo con el producto sano. Lo que no puede valer cero es el total. */
  let total = 0;
  for (const [boton, cual] of [[/^Mueve/, 'move'], [/^Estira/, 'extra']]) {
    await abrir(page, boton);
    const cat = await catalogo(page, cual);
    /* Se mira si el NODO existe, no si se ve: en el lateral la hoja esconde la
       línea a propósito (allí orienta, no es catálogo), pero el nodo está. La
       primera versión acotaba a la rejilla y el mutante de «una serie basta»
       NO mordía -- porque ese día las dos rutinas de UNA serie eran justo las
       dos que «Para ahora» había subido al lateral. Un aserto que depende de
       qué día es no defiende nada. */
    const conLinea = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.pace-lib [data-pace-lib-card]'))
        .filter(e => e.getBoundingClientRect().width > 0 && e.querySelector('.pace-lib-pie'))
        .map(e => e.getAttribute('data-pace-lib-card')));
    const esperadas = cat.filter(r => r.series >= 2).map(r => r.id);
    expect(conLinea.slice().sort()).toEqual(esperadas.slice().sort());
    total += esperadas.length;
    /* PRUEBA NEGATIVA: si alguna rutina tuviera UNA sola serie y aun así
       pintara la línea, diría «1 SERIES» -- que es el defecto que s174 vio
       mirando la maqueta. Se comprueba que ninguna de ésas la lleva. */
    const unaSola = cat.filter(r => r.series === 1).map(r => r.id);
    unaSola.forEach(id => expect(conLinea).not.toContain(id));
    await page.keyboard.press('Escape');
  }
  expect(total).toBeGreaterThan(0);
});

test('la tarjeta de Respira va sin capitular y con el ritmo dicho', async ({ page }) => {
  await irAlArtefacto(page);
  await abrir(page, /^Respira/);
  /* s176 · AQUI HABIA UN ASERTO DE CERO CHIPS, y decia «su eje es el TIEMPO, no
     el contexto». La observacion sigue siendo cierta y la consecuencia no lo
     era: sin pantalla propia sus 20 tarjetas caian en el flujo del modal a
     810 px de ancho y gastaban MAS scroll que antes del redisenio (3,90 contra
     3,82). Desde s176 Respira usa `LibraryShell` con filtros SUYOS -duracion y
     retencion-, y quien vigila eso es `tests/respira-biblioteca.spec.js`.
     Este test se queda con lo que sigue siendo suyo: la TARJETA. */
  /* sin capitular: sus 20 rutinas no declaran metadatos de cuerpo */
  expect(await page.locator('.pace-lib .pace-lib-cap').count()).toBe(0);
  /* pero SÍ la tarjeta nueva, y con el ritmo dicho */
  const tarjetas = await idsVisibles(page);
  expect(tarjetas.length).toBeGreaterThan(0);
  const box = page.locator('[data-pace-lib-card="breathe.box.4"] .pace-lib-ctx');
  await expect(box).toContainText('4·4·4·4');
  const rondas = page.locator('[data-pace-lib-card="breathe.rounds.express"] .pace-lib-ctx');
  await expect(rondas).toContainText('2');
  /* el sello de seguridad va por el dato `safety`, que son SEIS rutinas y no
     las cinco de apnea: Kapalabhati es respiración rápida y también lo lleva */
  const conSello = await page.locator('.pace-lib .pace-lib-safety').count();
  const esperados = catalogoFuente().breathe.filter(r => r.safety).length;
  expect(conSello).toBe(esperados);
  expect(esperados).toBeGreaterThan(0);
});

test('en escritorio el catálogo NO lleva color en reposo y el lateral sí existe', async ({ page }) => {
  await irAlArtefacto(page);
  await abrir(page, /^Estira/);
  const lateral = page.locator('.pace-lib-lateral');
  await expect(lateral).toBeVisible();
  /* El color de módulo marca lo que TOCAS, no lo que hay (fila de s173): en
     reposo el filo es transparente y sólo el hover lo enciende. Se lee el
     COMPUTADO, no la clase. */
  const tarjeta = page.locator('.pace-lib-rejilla [data-pace-lib-card]').locator('visible=true').first();
  const reposo = await tarjeta.evaluate(e => getComputedStyle(e).borderLeftColor);
  await tarjeta.hover();
  await page.waitForTimeout(320);
  const encima = await tarjeta.evaluate(e => getComputedStyle(e).borderLeftColor);
  expect(reposo).not.toBe(encima);
  /* control positivo: que el reposo sea REALMENTE transparente, y no otro
     color cualquiera distinto del hover */
  expect(reposo.replace(/\s/g, '')).toMatch(/rgba\(.*,0\)$/);
});

/* ── s175 · LO QUE EL USUARIO REPORTÓ MIRANDO LA APP ───────────────────────
   Los dos asertos de abajo defienden lo que se arregló en s175, y los dos
   nacen de un defecto que NADIE vio leyendo el código: el lateral se quedaba
   vacío al bajar y «Tus rutinas» estaba pegado a «Para ahora». Ninguno escribe
   un número de píxel: uno compara el lateral CONSIGO MISMO antes y después de
   scrollear, y el otro cruza lo que se ve con el catálogo. */

test('el lateral respira igual y se queda QUIETO al bajar', async ({ page }) => {
  await irAlArtefacto(page);
  await abrir(page, /^Estira/);
  const m = await page.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const lat = Array.from(document.querySelectorAll('.pace-lib-lateral')).filter(vis)[0];
    if (!lat) return null;
    let sc = lat;
    while (sc && !(/(auto|scroll)/.test(getComputedStyle(sc).overflowY)
                   && sc.scrollHeight > sc.clientHeight + 2)) sc = sc.parentElement;
    if (!sc) return null;
    const hijos = Array.from(lat.children);
    const esRotulo = e => e.classList.contains('pace-lib-lateral-tit');
    const huecos = hijos.slice(1).map((c, i) => ({
      trasRotulo: esRotulo(hijos[i]),
      px: Math.round(c.getBoundingClientRect().top - hijos[i].getBoundingClientRect().bottom),
    }));
    const dentro = () => Math.round(hijos[0].getBoundingClientRect().top - sc.getBoundingClientRect().top);
    const arriba = dentro();
    sc.scrollTop = sc.scrollHeight;
    const abajo = dentro();
    const desplazado = Math.round(sc.scrollTop);
    sc.scrollTop = 0;
    return { huecos, arriba, abajo, desplazado };
  });
  expect(m).not.toBeNull();
  /* GUARD DE CERO: si no hubiera scroll que dar, «se queda quieto» sería
     trivialmente cierto y este test pasaría con el lateral roto. */
  expect(m.desplazado).toBeGreaterThan(100);
  /* NINGÚN bloque pegado al siguiente. Es el defecto exacto que se reportó:
     «Tus rutinas» y «Para ahora» estaban a CERO px. */
  expect(Math.min(...m.huecos.map(h => h.px))).toBeGreaterThan(0);
  /* Y EL AIRE ES DEL BLOQUE, NO DEL RÓTULO: todos los huecos que siguen a un
     bloque miden lo mismo. La regla vieja sólo daba aire a lo que iba detrás de
     una versalita, y por eso un bloque se caía del selector. */
  const deBloque = m.huecos.filter(h => !h.trasRotulo).map(h => h.px);
  expect(deBloque.length).toBeGreaterThan(1);
  expect(new Set(deBloque).size).toBe(1);
  /* Y AL FONDO SIGUE DONDE ESTABA. Antes, con el scroll abajo, la columna se
     quedaba vacía: el lateral se iba con el catálogo. */
  expect(Math.abs(m.abajo - m.arriba)).toBeLessThanOrEqual(2);
});

test('«Para ahora» propone UNA, y lo que sube NO desaparece de la pantalla', async ({ page }) => {
  await irAlArtefacto(page);
  for (const [boton, cual] of [[/^Estira/, 'extra'], [/^Mueve/, 'move']]) {
    await abrir(page, boton);
    const cat = await catalogo(page, cual);
    const enLateral = await idsVisibles(page, '.pace-lib-lateral');
    expect(enLateral.length).toBe(1);
    /* RELACIONAL, y es el aserto que importa: lo que sube a «Para ahora» se
       RETIRA de su grupo, así que si el lateral pintara menos de las que
       promociona, la diferencia no aparecería en NINGÚN sitio -- un fallo que
       no se ve mirando la pantalla, porque lo que falta no se ve. */
    const enRejilla = await idsVisibles(page, '.pace-lib-rejilla');
    const todos = enLateral.concat(enRejilla);
    expect(new Set(todos).size).toBe(todos.length);
    expect(todos.length).toBe(cat.length);
    await page.keyboard.press('Escape');
  }
});

/* ── s176 · EL LATERAL NO SE DESBORDA ────────────────────────────────────── */

test('«Tus rutinas» cabe en el lateral y no se sale por la derecha', async ({ page }) => {
  await sembrar(page.context());
  await irAlArtefacto(page);
  await abrir(page, 'Estira');

  const m = await page.evaluate(() => {
    /* POR CAJA NO NULA: el lateral existe también en la piel móvil, apagado. */
    const lat = [...document.querySelectorAll('.pace-lib-lateral')]
      .find(e => e.getBoundingClientRect().width > 0);
    if (!lat) return null;
    const cs = getComputedStyle(lat);
    const caja = lat.getBoundingClientRect();
    /* El borde derecho ÚTIL del rail: su caja menos el padding. Es contra esto
       y no contra la caja como se mide un desbordamiento. */
    const util = caja.right - parseFloat(cs.paddingRight);
    const der = (sel) => {
      const e = [...lat.querySelectorAll(sel)].filter(x => x.getBoundingClientRect().width > 0)[0];
      return e ? e.getBoundingClientRect().right : null;
    };
    return {
      util,
      chip: der('.pace-lib-chip'),
      /* la tarjeta de «Tus rutinas» es un `Card` de Primitives, no una
         `.pace-lib-card`: se busca por su rejilla */
      tuyas: (() => {
        const rej = [...lat.querySelectorAll('div[style*="grid"]')]
          .filter(d => d.getBoundingClientRect().width > 0)[0];
        const hijo = rej && rej.firstElementChild;
        return hijo ? hijo.getBoundingClientRect().right : null;
      })(),
      ahora: der('[data-pace-lib-now] .pace-lib-card'),
    };
  });

  expect(m, 'sin lateral visible: la prueba no mide nada').not.toBeNull();
  /* GUARD DE CERO: si alguna pieza faltara, las comparaciones de abajo pasarían
     comparando `null` con un número y el test sería decorativo. */
  for (const k of ['chip', 'tuyas', 'ahora']) {
    expect(m[k], 'falta la pieza «' + k + '» en el lateral').not.toBeNull();
  }

  /* EL DEFECTO QUE ARREGLA s176: la rejilla de «Tus rutinas» pedía un mínimo de
     260 px dentro de un rail que deja 242, y un mínimo NO encoge — la tarjeta
     se pintaba 18 px más ancha que el rail. Medido a 1536: los chips acababan
     en 428,93 y ella en 446,21. Se compara con tolerancia de 1 px por el
     redondeo del layout, no por dejar margen al defecto: 18 px lo cruza de
     largo. */
  expect(m.tuyas, '«Tus rutinas» se sale del lateral por la derecha')
    .toBeLessThanOrEqual(m.util + 1);
  /* Y ALINEADA CON SUS VECINAS, que es lo que se ve: un borde común. */
  expect(Math.abs(m.tuyas - m.chip), '«Tus rutinas» no alinea con los chips')
    .toBeLessThanOrEqual(1);
  expect(Math.abs(m.tuyas - m.ahora), '«Tus rutinas» no alinea con «Para ahora»')
    .toBeLessThanOrEqual(1);
});
