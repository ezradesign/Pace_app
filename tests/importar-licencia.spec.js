/* PACE · E2E · IMPORTAR UNA COPIA NO QUITA LA COMPRA (revisión de ChatGPT del 5 nov. 2026, punto 2)
 * =================================================================================================
 * El código de PACE completo va DENTRO del estado (`licencia`) y «Importar» escribe la copia
 * entera: quien exportó el lunes sin haber comprado, compró el martes e importó el miércoles
 * volvía a ver el candado. La compra seguía en Stripe; lo que se perdía era el código en ese
 * navegador, que para quien paga es lo mismo.
 *
 * LA REGLA (`paceLicenciaConservar`, state-licencia.js): una copia sin código no quita el de ahora;
 * sin código de ahora entra el de la copia (así se recupera); y si son distintos se comprueban los
 * dos y gana el bueno, y entre dos buenos el que vale más tiempo, a igualdad el de ahora.
 *
 * Contra v0.189.1 caen todas las que dejan el código de ahora (las de la regla); la de «sin código
 * de ahora» es el control, pasa en las dos. La llave de las pruebas se crea en cada pasada
 * (tests/licencia.helpers.js) y por eso no hay service worker.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, aceptarAvisosPace, abrirTusDatos, esperarEnPagina, CLAVE_ESTADO } = require('./helpers');
const { otra, firmar, conLlaveDePrueba } = require('./licencia.helpers');

test.use({ serviceWorkers: 'block' });

const DIA = 24 * 3600 * 1000;
const POR_VIDA = firmar({ tester: 1 });
const OTRA_POR_VIDA = firmar({ tester: 2 });
const MENSUAL = firmar({ type: 'monthly', order: 'sub_1', expiresAt: Date.now() + 20 * DIA });
const CADUCADA = firmar({ tester: 3, expiresAt: '2020-01-01' });
const FALSA = firmar({ tester: 4 }, otra.privateKey);

/* Lo que trae una copia hecha antes de comprar: datos suyos y ni rastro del código. */
const COPIA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, totalFocusMin: 42 };

async function importar(page, copia) {
  await aceptarAvisosPace(page);
  const recarga = page.waitForEvent('load');
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  await page.locator('input[type="file"][data-pace-traer-copia]').setInputFiles({
    name: 'pace-backup-20261102.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ app: 'PACE', version: 'v0.189.1', state: copia })),
  });
  await recarga;
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
}

const guardado = (page) => page.evaluate((clave) => JSON.parse(localStorage.getItem(clave) || 'null'), CLAVE_ESTADO);

const CASOS = [
  { nombre: 'una copia hecha antes de comprar (sin el campo) no quita la compra de por vida',
    ahora: POR_VIDA, copia: {}, queda: POR_VIDA },
  { nombre: 'una copia con «licencia: null» tampoco',
    ahora: POR_VIDA, copia: { licencia: null }, queda: POR_VIDA },
  { nombre: 'los dos son buenos y vale lo mismo: se queda el de ahora',
    ahora: POR_VIDA, copia: { licencia: OTRA_POR_VIDA }, queda: POR_VIDA },
  { nombre: 'los dos son buenos: gana el de por vida sobre la mensual que acaba',
    ahora: MENSUAL, copia: { licencia: POR_VIDA }, queda: POR_VIDA },
  { nombre: 'y la mensual de la copia no cambia la de por vida de ahora',
    ahora: POR_VIDA, copia: { licencia: MENSUAL }, queda: POR_VIDA },
  { nombre: 'un código falso en la copia no pisa el bueno',
    ahora: POR_VIDA, copia: { licencia: FALSA }, queda: POR_VIDA },
  { nombre: 'si el de ahora ya caducó y el de la copia es bueno, entra el de la copia',
    ahora: CADUCADA, copia: { licencia: POR_VIDA }, queda: POR_VIDA },
  { nombre: 'si no vale ninguno de los dos, no se quita el de ahora',
    ahora: CADUCADA, copia: { licencia: FALSA }, queda: CADUCADA, vigente: false },
  { nombre: 'CONTROL · sin código de ahora, la copia con código lo recupera',
    ahora: null, copia: { licencia: POR_VIDA }, queda: POR_VIDA },
];

for (const caso of CASOS) {
  test(caso.nombre, async ({ page, context }) => {
    await conLlaveDePrueba(context);
    await sembrar(context, { totalFocusMin: 5, licencia: caso.ahora });
    await irAlArtefacto(page);
    await importar(page, Object.assign({}, COPIA, caso.copia));

    const s = await guardado(page);
    expect(s.totalFocusMin, 'la copia no entró').toBe(42);
    expect(s.licencia, 'la copia cambió el código de ahora').toBe(caso.queda);
    /* Y no es solo lo guardado: el guard lo da por bueno al abrir. */
    const vigente = await esperarEnPagina(page, () => !!window.paceLicenciaVigente(), null, { timeout: 2500 }).then(() => true, () => false);
    expect(vigente, 'el código que quedó no abre PACE completo').toBe(caso.vigente !== false);
  });
}

test('el aviso de la prueba que ya salió se queda con el código de ahora', async ({ page, context }) => {
  await conLlaveDePrueba(context);
  await sembrar(context, { totalFocusMin: 5, licencia: MENSUAL, premiumAvisoPrueba: 'sub_1' });
  await irAlArtefacto(page);
  await importar(page, COPIA);
  const s = await guardado(page);
  expect(s.licencia).toBe(MENSUAL);
  expect(s.premiumAvisoPrueba, 'volvería a salir el aviso de una prueba que ya se avisó').toBe('sub_1');
});
