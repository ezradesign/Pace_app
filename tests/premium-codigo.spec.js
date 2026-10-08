/* PACE · E2E · PACE COMPLETO: EL CANDADO, LA INVITACIÓN Y EL CÓDIGO DE POR VIDA
 * ==========================================================================
 * Ez eligió (8 oct. 2026) la tarjeta cerrada con un candado de línea fina, que al
 * tocarla abre una invitación a PACE completo, y un código de por vida para los
 * testers: una licencia firmada (ECDSA P-256) que la app comprueba sin servidor
 * con la llave pública de `app/licencia.llaves.js` (state-licencia.js).
 *
 * LA LLAVE DE ESTAS PRUEBAS SE CREA EN CADA PASADA y no vive en ningún sitio: su
 * mitad pública se mete en el `index.html` servido (page.route) y la privada firma
 * aquí, en Node, como lo hace `scripts/licencias/firmar.js` en el PC de Ez. Así se
 * prueba el artefacto que se publica sin poner en él ninguna llave de prueba.
 * Sin service worker: serviría el `index.html` sin pasar por la ruta.
 *
 * Las rutinas premium están abiertas hasta v1 (`PREMIUM_ABIERTO_HASTA_V1`): cada
 * prueba la apaga para ver lo que verá quien no tenga PACE completo.
 */
'use strict';

const crypto = require('crypto');
const { test, expect } = require('@playwright/test');
const { sembrar, sembrarPisando, irAlArtefacto, overlaySuperior, capturarErrores } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const par = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const PUBLICA = par.publicKey.export({ format: 'jwk' });
const otra = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });

const b64url = (b) => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/* Igual que scripts/licencias/firmar.js. */
function firmar(datos, llave) {
  const firmado = 'PACE1.' + b64url(JSON.stringify(Object.assign({ type: 'lifetime', keyId: 'kt', issuedAt: '2026-10-08' }, datos)));
  const firma = crypto.sign('sha256', Buffer.from(firmado), { key: llave || par.privateKey, dsaEncoding: 'ieee-p1363' });
  return firmado + '.' + b64url(firma);
}

async function conLlaveDePrueba(context, anulados) {
  await context.route('**/index.html', async (route) => {
    const r = await route.fetch();
    let body = await r.text();
    const antes = body;
    body = body.replace('var PACE_LLAVES_LICENCIA = {',
      "var PACE_LLAVES_LICENCIA = { kt: { x: '" + PUBLICA.x + "', y: '" + PUBLICA.y + "' },");
    if (anulados) body = body.replace(/var PACE_LICENCIAS_ANULADAS = \[\s*\]/, 'var PACE_LICENCIAS_ANULADAS = ' + JSON.stringify(anulados));
    if (body === antes) throw new Error('no encuentro las llaves en index.html');
    await route.fulfill({ response: r, body });
  });
}

async function cerrarPremium(page) {
  await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
}

async function abrirMueve(page) {
  await page.getByRole('button', { name: /^Mueve/ }).first().click();
  await expect(page.locator('[data-pace-lib-card="extra.hang.bar"]').first()).toBeVisible();
}

const HOJA = '[data-pace-premium-hoja]';

test.beforeEach(async ({ context }) => { await sembrar(context); });

test('la tarjeta cerrada lleva candado, no dice «Pronto» y al tocarla abre la invitación', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await cerrarPremium(page);
  await abrirMueve(page);

  const tarjeta = page.locator('[data-pace-lib-card="extra.hang.bar"]').first();
  await expect(tarjeta).toHaveAttribute('data-locked', '1');
  await expect(tarjeta.locator('[data-pace-candado]')).toHaveCount(1);
  await expect(tarjeta).toContainText('Premium');
  await expect(tarjeta).not.toContainText('Pronto');
  /* Las abiertas no llevan candado. */
  await expect(page.locator('[data-pace-lib-card="extra.desk.pushups"] [data-pace-candado]')).toHaveCount(0);

  await tarjeta.getByRole('button', { name: 'Colgarse' }).click();
  const hoja = page.locator(HOJA);
  await expect(hoja).toHaveAttribute('data-pace-premium-hoja', 'invita');
  await expect(hoja).toContainText('Colgarse');
  await expect(hoja).toContainText('Es parte de PACE completo.');
  await expect(hoja).toContainText('Llega con la versión 1.');
  /* Lo cerrado no se empieza: ni sesión ni preview detrás de la hoja. */
  await expect(page.locator('[data-pace-session-root]')).toHaveCount(0);

  await hoja.getByRole('button', { name: 'Ahora no' }).click();
  await expect(page.locator(HOJA)).toHaveCount(0);
  /* La biblioteca sigue abierta debajo. */
  await expect(tarjeta).toBeVisible();
  expect(errores).toEqual([]);
});

test('«Para ahora» no propone una rutina cerrada', async ({ page }) => {
  await irAlArtefacto(page);
  await cerrarPremium(page);
  for (const mod of ['Mueve', 'Estira', 'Respira']) {
    await page.getByRole('button', { name: new RegExp('^' + mod) }).first().click();
    await expect(page.locator('[data-pace-lib-card]').first()).toBeVisible();
    expect(await page.locator('[data-pace-lib-now] [data-pace-lib-card][data-locked="1"]').count(), mod).toBe(0);
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-pace-lib-card]')).toHaveCount(0);
  }
});

test('un código bueno, pegado en la invitación, abre PACE completo para siempre', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await conLlaveDePrueba(context);
  await irAlArtefacto(page);
  await cerrarPremium(page);
  await abrirMueve(page);
  await page.locator('[data-pace-lib-card="extra.hang.bar"]').first().getByRole('button', { name: 'Colgarse' }).click();
  await page.locator('[data-pace-premium-tengo]').click();

  const codigo = firmar({ tester: 7 });
  /* Se pega el enlace entero, con un salto de línea del correo en medio. */
  await page.locator('[data-pace-premium-codigo]').fill('https://pacegrass.app/#codigo=' + codigo.slice(0, 60) + '\n' + codigo.slice(60));
  await page.getByRole('button', { name: 'Canjear' }).click();
  const hoja = page.locator(HOJA);
  await expect(hoja).toHaveAttribute('data-pace-premium-hoja', 'ok');
  await expect(hoja).toContainText('PACE completo es tuyo, para siempre.');
  await expect(hoja).toContainText('Gracias por probarlo antes que nadie.');
  await hoja.getByRole('button', { name: 'Seguir' }).click();

  const tarjeta = page.locator('[data-pace-lib-card="extra.hang.bar"]').first();
  await expect(tarjeta).not.toHaveAttribute('data-locked', '1');
  await expect(tarjeta.locator('[data-pace-candado]')).toHaveCount(0);
  expect(await page.evaluate(() => window.getState().licencia)).toBe(codigo);
  expect(await page.evaluate(() => window.hasPremiumEntitlement())).toBe(true);

  /* Sobrevive a recargar: se vuelve a comprobar al arrancar y sigue valiendo. */
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await cerrarPremium(page);
  await page.waitForTimeout(300); // la comprobación de arranque es asíncrona
  expect(await page.evaluate(() => window.canAccessRoutine('extra.hang.bar'))).toBe(true);

  /* En Ajustes: «PACE completo · Para siempre» y el número del tester. */
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await expect(page.locator('[data-pace-licencia-estado]')).toHaveText('Para siempre');
  await expect(page.getByText('Tester n.º 7')).toBeVisible();
  expect(errores).toEqual([]);
});

test('el enlace del tester abre PACE completo, avisa y se borra de la barra', async ({ page, context }) => {
  await conLlaveDePrueba(context);
  const codigo = firmar({ tester: 3 });
  await page.goto('/index.html#codigo=' + codigo);
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  const aviso = page.locator('[data-pace-toast="licencia"]');
  await expect(aviso).toContainText('PACE completo es tuyo, para siempre.');
  expect(new URL(page.url()).hash).toBe('');
  expect(await page.evaluate(() => window.getState().licencia)).toBe(codigo);
  /* También abre «Tus rutinas», que hasta v1 está cerrado para todos. */
  expect(await page.evaluate(() => window.hasPremiumEntitlement())).toBe(true);
});

test('lo que no es un código bueno no abre nada, y se dice por qué', async ({ page, context }) => {
  await conLlaveDePrueba(context, ['kt:9']);
  await irAlArtefacto(page);
  await cerrarPremium(page);
  await page.evaluate(() => window.paceAbrirPremium({ modo: 'codigo' }));
  const campo = page.locator('[data-pace-premium-codigo]');

  const bueno = firmar({ tester: 1 });
  const [cab, , firma] = bueno.split('.');
  const otroTester = b64url(JSON.stringify({ type: 'lifetime', keyId: 'kt', issuedAt: '2026-10-08', tester: 2 }));
  const casos = [
    ['hola', 'formato'],
    [bueno.slice(0, -10), 'formato'],                         // cortado al copiarlo
    [cab + '.' + otroTester + '.' + firma, 'firma'],          // datos cambiados a mano
    [firmar({ tester: 1 }, otra.privateKey), 'firma'],        // firmado con otra llave
    [firmar({ tester: 1, keyId: 'k9' }), 'firma'],            // una llave que la app no tiene
    [firmar({ tester: 9 }), 'anulada'],
    [firmar({ tester: 4, expiresAt: '2020-01-01' }), 'caducada'],
  ];
  for (const [texto, motivo] of casos) {
    await campo.fill(texto);
    await page.getByRole('button', { name: 'Canjear' }).click();
    await expect(page.locator('[data-pace-premium-error]'), motivo).toHaveAttribute('data-pace-premium-error', motivo);
  }
  expect(await page.evaluate(() => window.getState().licencia)).toBe(null);
  expect(await page.evaluate(() => window.hasPremiumEntitlement())).toBe(false);
});

test('un código falso que ya estuviera guardado no abre nada al arrancar, y no se borra', async ({ page, context }) => {
  await conLlaveDePrueba(context);
  /* Datos de la llave de la app, firma de otra: lo que haría quien fabricara uno. */
  const falso = firmar({ tester: 5 }, otra.privateKey);
  await sembrarPisando(context, { licencia: falso });
  await irAlArtefacto(page);
  await cerrarPremium(page);
  await expect.poll(() => page.evaluate(() => window.canAccessRoutine('extra.hang.bar'))).toBe(false);
  expect(await page.evaluate(() => window.getState().licencia)).toBe(falso);
});

test('en Android no hay «Tengo un código» y no vale ni el enlace ni un código de la web', async ({ page, context }) => {
  await conLlaveDePrueba(context);
  await context.addInitScript(() => {
    window.Capacitor = { getPlatform: () => 'android', isNativePlatform: () => true };
  });
  /* Un código bueno que llegara con una copia de la web. */
  await sembrarPisando(context, { licencia: firmar({ tester: 6 }) });
  await page.goto('/index.html#codigo=' + firmar({ tester: 8 }));
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await cerrarPremium(page);
  expect(await page.evaluate(() => window.hasPremiumEntitlement())).toBe(false);
  await expect(page.locator('[data-pace-toast="licencia"]')).toHaveCount(0);

  await abrirMueve(page);
  await page.locator('[data-pace-lib-card="extra.hang.bar"]').first().getByRole('button', { name: 'Colgarse' }).click();
  await expect(page.locator(HOJA)).toContainText('Llega con la versión 1.');
  await expect(page.locator('[data-pace-premium-tengo]')).toHaveCount(0);
});
