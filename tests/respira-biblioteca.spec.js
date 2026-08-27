/* PACE · tests/respira-biblioteca.spec.js (sesión 176)
   =====================================================
   RESPIRA PASA A USAR `LibraryShell`. Lo que defiende, y por qué cada cosa
   merece un aserto:

   · QUE TENGA REJILLA Y NO UNA COLUMNA. Es el defecto que reportó el usuario
     («se ve demasiado feo») y la razón entera del cambio: una tarjeta de 810 px
     con 380 de contenido, 3,90 pantallas de scroll — más que la biblioteca
     ANTERIOR al rediseño de s174. Si alguien devuelve Respira a su modal
     estrecho, esto se pone rojo.
   · QUE SUS FILTROS SEAN LOS SUYOS. Los de cuerpo («Aquí mismo», «Sin
     material») dejarían pasar las 20, porque ninguna rutina de Respira declara
     `position` ni `equipment`. Un chip que no descarta nada es decoración, y
     este test lo detecta contando.
   · QUE NO APAREZCA «TUS RUTINAS». Las rutinas propias se componen con
     ejercicios de cuerpo; en Respira el bloque estaría vacío.
   · QUE LA SUGERENCIA NO EXIJA LEER UN AVISO. Con el pozo de cuerpo —que en
     Respira no descarta nada— el día que tocaba salía `Kumbhaka 1:4:2`: apnea
     avanzada, premium y con modal de seguridad. Lo destapó la maqueta.

   TODO RELACIONAL: ningún recuento vive escrito aquí. Las cuentas se derivan
   del CATÁLOGO leído de las fuentes, así que añadir una rutina no pone el test
   en rojo y quitar el filtro sí.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarModalAsentado } = require('./helpers');

const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const sandbox = require(path.join(ROOT, 'scripts', 'verify.sandbox.js'));

/* EL CATÁLOGO SE LEE DE LAS FUENTES, no de la página: `BREATHE_ROUTINES` es
   `const` y no cruza la IIFE del artefacto (trampa de s148), y además cruzar la
   pantalla contra un dato de esa misma pantalla no probaría nada. */
let _cat = null;
function catalogo() {
  if (_cat) return _cat;
  const ctx = { ROOT, babel: require(path.join(ROOT, 'node_modules', '@babel', 'core')) };
  const sb = sandbox.nuevoSandbox();
  const errs = [
    sandbox.cargar(ctx, sb, 'app/breathe/BreatheLibrary.jsx', { __B: 'BREATHE_ROUTINES' }),
    sandbox.cargar(ctx, sb, 'app/ui/library-rules.js', { __U: 'libraryUmbralCorto', __R: 'libraryConRetencion' }),
  ].filter(Boolean);
  if (errs.length) throw new Error('no se pudo leer Respira: ' + errs.join(' · '));
  const rutinas = [];
  Object.keys(sb.__B || {}).forEach(k => (sb.__B[k].items || []).forEach(r => rutinas.push(r)));
  /* GUARD DE CERO: con el catálogo vacío todas las comparaciones cruzarían
     conjuntos vacíos y saldrían verdes. */
  if (rutinas.length !== 20) throw new Error('catálogo de Respira incompleto: ' + rutinas.length);
  if (typeof sb.__U !== 'function' || typeof sb.__R !== 'function') {
    throw new Error('las reglas de biblioteca no cargaron');
  }
  _cat = { rutinas, umbral: sb.__U(rutinas), conRetencion: sb.__R };
  return _cat;
}

/* LAS TARJETAS QUE SE VEN. Cada pieza de la biblioteca existe DOS veces en el
   DOM —lateral de escritorio y bloque de móvil— y la hoja apaga la que sobra,
   así que un selector a secas devuelve la apagada y mide cero. Va por NUEVE
   veces contando las de s174 y s175. */
const visibles = (page, sel) => page.locator(sel).locator('visible=true');

async function abrirRespira(page) {
  await page.getByRole('button', { name: 'Respira' }).first().click();
  await page.locator('.pace-lib').waitFor({ state: 'visible' });
  /* `esperarModalAsentado` y no una espera propia: medir a medias da el 96 %
     de cada caja, y comparar dos lecturas seguidas NO basta -- la curva se
     aplana y pasa a mitad del fundido (s176). */
  await esperarModalAsentado(page);
}

test.beforeEach(async ({ context }) => { await sembrar(context); });

test('Respira tiene rejilla y lateral, no una columna a todo el ancho', async ({ page }) => {
  await irAlArtefacto(page);
  await abrirRespira(page);

  const rejilla = visibles(page, '.pace-lib-rejilla');
  await expect(rejilla, 'Respira sin rejilla: ha vuelto al flujo del modal').toHaveCount(1);
  await expect(visibles(page, '.pace-lib-lateral'), 'Respira sin lateral').toHaveCount(1);

  const medidas = await page.evaluate(() => {
    const vis = (s) => [...document.querySelectorAll(s)]
      .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
    const t = vis('.pace-lib-rejilla .pace-lib-card');
    const rej = vis('.pace-lib-rejilla')[0];
    return {
      tarjeta: t.length ? t[0].getBoundingClientRect().width : 0,
      rejilla: rej ? rej.getBoundingClientRect().width : 0,
      columnas: rej ? getComputedStyle(rej).gridTemplateColumns.split(' ').length : 0,
    };
  });
  /* TRES COLUMNAS, y el aserto se escribe sobre la REJILLA porque es donde vive
     la decisión. La tarjeta suelta podría medir lo mismo por casualidad. */
  expect(medidas.columnas, 'la rejilla de Respira no tiene tres columnas').toBe(3);
  /* Y CADA TARJETA OCUPA MENOS DE LA MITAD de su rejilla: es la forma
     relacional de decir «no es una columna» sin clavar un número de píxeles que
     cambie con el viewport de la suite. Antes del cambio la tarjeta medía
     exactamente el ancho disponible. */
  expect(medidas.tarjeta).toBeGreaterThan(0);
  expect(medidas.tarjeta).toBeLessThan(medidas.rejilla / 2);
});

test('los filtros de Respira son los suyos, y descartan de verdad', async ({ page }) => {
  const { rutinas, umbral, conRetencion } = catalogo();
  await irAlArtefacto(page);
  await abrirRespira(page);

  const chips = visibles(page, '.pace-lib-lateral .pace-lib-chip');
  await expect(chips).toHaveCount(2);

  /* EL CHIP ENSEÑA SU UMBRAL, así que se puede cruzar con el catálogo: el
     número del chip tiene que ser el que da la regla sobre las 20 rutinas. */
  const cortos = rutinas.filter(r => r.min <= umbral).length;
  const sinReten = rutinas.filter(r => !conRetencion(r)).length;
  await expect(chips.nth(0)).toHaveText(new RegExp('≤\\s*' + umbral + '\\s*min\\s*' + cortos));
  await expect(chips.nth(1)).toHaveText(new RegExp('retenci[óo]n\\s*' + sinReten, 'i'));

  /* GUARD DE CERO EN LOS DOS SENTIDOS: un filtro que no descarta nada y otro
     que lo descarta todo son igual de inútiles, y los dos pasarían el aserto de
     arriba si el catálogo cambiara. */
  expect(cortos).toBeGreaterThan(0);
  expect(cortos).toBeLessThan(rutinas.length);
  expect(sinReten).toBeGreaterThan(0);
  expect(sinReten).toBeLessThan(rutinas.length);

  /* Y AL TOCARLO, LA PANTALLA CAMBIA. Sin esto el chip podría pintar la cuenta
     correcta y no filtrar: es exactamente lo que hacían los metadatos de cuerpo
     antes de s174. */
  const antes = await visibles(page, '.pace-lib-rejilla .pace-lib-card').count();
  await chips.nth(1).click();
  const despues = await visibles(page, '.pace-lib-rejilla .pace-lib-card').count();
  expect(despues, 'el filtro no descartó ninguna tarjeta').toBeLessThan(antes);
});

test('Respira no ofrece «Tus rutinas», que es de cuerpo', async ({ page }) => {
  await irAlArtefacto(page);
  await abrirRespira(page);
  /* Ni el bloque del lateral ni el enlace de la cabecera: los dos llevarían a
     una pantalla vacía, porque una rutina propia se compone con ejercicios de
     Mueve y Estira. */
  await expect(visibles(page, '.pace-lib-link')).toHaveCount(0);
  await expect(page.locator('.pace-lib-lateral').getByText('Tus rutinas')).toHaveCount(0);
});

test('la sugerencia del día no es una rutina con aviso de seguridad', async ({ page }) => {
  const { rutinas } = catalogo();
  const conAviso = rutinas.filter(r => r.safety).map(r => r.id);
  /* GUARD: si ninguna llevara aviso, este test pasaría sin comprobar nada. */
  expect(conAviso.length).toBeGreaterThan(0);

  await irAlArtefacto(page);
  await abrirRespira(page);
  const ids = await page.evaluate(() => [...document.querySelectorAll('.pace-lib-lateral [data-pace-lib-now] [data-pace-lib-card]')]
    .filter(e => e.getBoundingClientRect().width > 0)
    .map(e => e.getAttribute('data-pace-lib-card')));
  expect(ids.length, 'el bloque «Para ahora» de Respira está vacío').toBe(1);
  expect(conAviso, 'la sugerencia del día obliga a leer un aviso antes de empezar')
    .not.toContain(ids[0]);
});
