/* PACE · E2E · PACEGRASS.APP/RECUPERAR, LA PÁGINA (punto 12 del ROADMAP)
 * =====================================================================
 * Ez, 2A del 28 oct. 2026: quien pagó en la web y perdió su código lo recupera con el correo y el
 * número del recibo. La página (recuperar/index.html) pregunta a /api/recuperar, que aquí hace
 * `page.route` (la función la prueba cobro-recuperar.spec.js, en Node). Se llega desde gracias
 * («Si lo pierdes»), desde las preguntas de /premium y desde PACE (premium-compra.spec.js).
 *
 * QUE DEFIENDE: los tres estados (vacía, el código recuperado con lo mismo que gracias, y «no la
 * encontramos» con su motivo), el inglés, que no se manda nada sin correo y recibo, y que gracias,
 * /premium y la privacidad la nombran. Contra v0.184.0 caen todas: no hay página.
 */
'use strict';

const { test, expect } = require('@playwright/test');

test.use({ serviceWorkers: 'block' });

const CODIGO = 'PACE1.eyJ0eXBlIjoibGlmZXRpbWUiLCJrZXlJZCI6ImsyIiwib3JkZXIiOiJjc19saXZlX2ExQjJjM0Q0In0.ZmlybWE';

async function rellenar(page) {
  await page.fill('[data-recuperar-correo]', 'quien@correo.com');
  await page.fill('[data-recuperar-recibo]', '2931-4470');
  await page.click('[data-recuperar-boton]');
}

test('vacía: el correo, el número del recibo y que no se guarda nada', async ({ page }) => {
  let pedidas = 0;
  await page.route('**/api/recuperar', (r) => { pedidas++; return r.abort(); });
  await page.goto('/recuperar/');
  await expect(page.locator('h1:visible')).toHaveText('Recupera tu código');
  await expect(page.locator('label[for="rec-correo"]')).toHaveText('Tu correo');
  await expect(page.locator('label[for="rec-recibo"]')).toHaveText('Número del recibo');
  await expect(page.locator('[data-recuperar-form]')).toContainText('No guardamos ni tu correo ni tu recibo');
  await expect(page.locator('[data-recuperar-form] a[href="/privacy#recuperar"]')).toHaveText('Privacidad');
  /* Sin los dos datos no se pregunta a nadie. */
  await page.click('[data-recuperar-boton]');
  await expect(page.locator('[data-recuperar-fallo]')).toHaveText('Escribe tu correo y el número del recibo.');
  expect(pedidas).toBe(0);
});

test('con la compra: el código, «Abrir PACE con tu código» y las tres formas de quedárselo', async ({ page }) => {
  let cuerpo = null;
  await page.route('**/api/recuperar', (r) => {
    cuerpo = JSON.parse(r.request().postData());
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, codigo: CODIGO }) });
  });
  await page.goto('/recuperar/');
  await rellenar(page);
  await expect(page.locator('[data-recuperar-listo]')).toBeVisible();
  expect(cuerpo).toEqual({ correo: 'quien@correo.com', recibo: '2931-4470' });
  await expect(page.locator('h1:visible')).toHaveText('Aquí tienes tu código.');
  await expect(page.locator('[data-recuperar-codigo]')).toHaveText(CODIGO);
  await expect(page.locator('[data-recuperar-abrir]')).toHaveAttribute('href', '/#codigo=' + encodeURIComponent(CODIGO));
  const correo = await page.locator('[data-recuperar-correo-a]').getAttribute('href');
  expect(correo.startsWith('mailto:?subject=')).toBe(true);
  expect(decodeURIComponent(correo)).toContain(CODIGO);
  const bajada = page.waitForEvent('download');
  await page.locator('[data-recuperar-bajar]').click();
  expect((await bajada).suggestedFilename()).toBe('PACE-codigo.txt');
  await expect(page.locator('[data-recuperar-copiar]')).toHaveText('Copiar');
});

test('sin la compra, dice por qué: no la encuentra, Stripe no contesta, el código aún no está, la mensual terminó, demasiados intentos, cerrada, sin red', async ({ page }) => {
  const respuestas = [
    [404, { ok: false, motivo: 'no' }, 'No encontramos esa compra. Mira que el correo y el número sean los del recibo.'],
    [410, { ok: false, motivo: 'terminada' }, 'Esa suscripción ya terminó, así que no tiene un código nuevo.'],
    [429, { ok: false, motivo: 'espera' }, 'Demasiados intentos seguidos. Prueba otra vez dentro de un rato.'],
    [503, { ok: false, motivo: 'cerrada' }, 'Aún no se puede recuperar aquí. Escríbenos y te lo mandamos.'],
    /* La mensual sin código guardado y sin baja (A3, 28 oct.): no «terminada», sino volver a probar o escribir. */
    [503, { ok: false, motivo: 'pendiente' }, 'Tu código todavía no está disponible. Prueba otra vez dentro de un rato o escríbenos.'],
    /* Stripe no contesta (revisión de ChatGPT del 5 nov., punto 3): el fallo no es de quien escribe. */
    [502, { ok: false, motivo: 'stripe' }, 'Ahora no podemos consultar tu compra, y no es por tus datos. Prueba otra vez dentro de un rato.'],
    /* Un error de Cloudflare no trae el JSON de la función: tampoco es «no la encontramos». */
    [502, '<html>Bad gateway</html>', 'Ahora no podemos consultar tu compra, y no es por tus datos. Prueba otra vez dentro de un rato.'],
    [500, {}, 'Ahora no podemos consultar tu compra, y no es por tus datos. Prueba otra vez dentro de un rato.'],
  ];
  let i = 0;
  await page.route('**/api/recuperar', (r) => {
    const [estado, cuerpo] = respuestas[i++];
    return typeof cuerpo === 'string'
      ? r.fulfill({ status: estado, contentType: 'text/html', body: cuerpo })
      : r.fulfill({ status: estado, contentType: 'application/json', body: JSON.stringify(cuerpo) });
  });
  await page.goto('/recuperar/');
  for (const [estado, , texto] of respuestas) {
    await rellenar(page);
    await expect(page.locator('[data-recuperar-fallo]')).toHaveText(texto);
    if (estado !== 404) await expect(page.locator('[data-recuperar-fallo]'), 'culpa a quien escribe por un fallo del servicio').not.toContainText('No encontramos');
    await expect(page.locator('[data-recuperar-listo]')).toBeHidden();
  }
  await page.unroute('**/api/recuperar');
  await page.route('**/api/recuperar', (r) => r.abort());
  await rellenar(page);
  await expect(page.locator('[data-recuperar-fallo]')).toHaveText('No hay conexión. Prueba otra vez.');
  await expect(page.locator('.caja')).toContainText('hola.ezradesign@gmail.com');
});

test('en inglés, lo mismo', async ({ page }) => {
  await page.route('**/api/recuperar', (r) => r.fulfill({ status: 404, contentType: 'application/json', body: '{"ok":false,"motivo":"no"}' }));
  await page.goto('/recuperar/?lang=en');
  await expect(page.locator('h1:visible')).toHaveText('Get your code back');
  await expect(page.locator('[data-recuperar-boton]')).toHaveText('Get my code');
  await rellenar(page);
  await expect(page.locator('[data-recuperar-fallo]')).toHaveText('We cannot find that purchase. Check that the email and the number are the ones on the receipt.');
  await page.locator('[data-idioma]').click();
  await expect(page.locator('h1:visible')).toHaveText('Recupera tu código');
  await expect(page.locator('[data-recuperar-fallo]')).toHaveText('No encontramos esa compra. Mira que el correo y el número sean los del recibo.');
});

test('en inglés, un fallo del servicio tampoco culpa a quien escribe', async ({ page }) => {
  const respuestas = [
    [502, { ok: false, motivo: 'stripe' }, 'We cannot check your purchase right now, and it is not because of your details. Try again in a while.'],
    [503, { ok: false, motivo: 'pendiente' }, 'Your code is not available yet. Try again in a while, or write to us.'],
    [503, { ok: false, motivo: 'cerrada' }, 'It cannot be recovered here yet. Write to us and we will send it to you.'],
  ];
  let i = 0;
  await page.route('**/api/recuperar', (r) => {
    const [estado, cuerpo] = respuestas[i++];
    return r.fulfill({ status: estado, contentType: 'application/json', body: JSON.stringify(cuerpo) });
  });
  await page.goto('/recuperar/?lang=en');
  for (const [, , texto] of respuestas) {
    await rellenar(page);
    await expect(page.locator('[data-recuperar-fallo]')).toHaveText(texto);
    await expect(page.locator('[data-recuperar-fallo]')).not.toContainText('cannot find');
  }
  /* Al cambiar de idioma, el mismo fallo en español. */
  await page.locator('[data-idioma]').click();
  await expect(page.locator('[data-recuperar-fallo]')).toHaveText('Aún no se puede recuperar aquí. Escríbenos y te lo mandamos.');
});

test('gracias, /premium y la privacidad la nombran, y web-dist la publica', async ({ page }) => {
  await page.goto('/gracias/index.html');
  await expect(page.locator('[data-gracias-recuperar] a[href="/recuperar/"]')).toHaveText('pacegrass.app/recuperar');
  await page.goto('/premium/');
  await expect(page.locator('[data-premium-recuperar] a[href="/recuperar/"]')).toHaveText('lo recuperas');
  await page.goto('/privacy.html');
  await expect(page.locator('#recuperar')).toContainText('pacegrass.app/recuperar');
  await expect(page.locator('#recuperar-en')).toContainText('pacegrass.app/recuperar');
  const raiz = require('path').join(__dirname, '..');
  const lista = require(require('path').join(raiz, 'scripts', 'web-dist.js'));
  expect(require('fs').readFileSync(require('path').join(raiz, 'scripts', 'web-dist.js'), 'utf8')).toMatch(/WEB_CARPETAS = \[[^\]]*'recuperar'/);
  expect(typeof lista.montarWeb).toBe('function');
});
