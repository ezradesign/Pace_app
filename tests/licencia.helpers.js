/* PACE · E2E · UNA LLAVE DE LICENCIAS SOLO PARA LAS PRUEBAS
 * =========================================================
 * PACE completo solo lo abren un código con la firma comprobada, la tienda y lo
 * abierto hasta v1 (state-entitlement.jsx). Para probar «con PACE completo» hace
 * falta, pues, un código de verdad, y eso pide una llave.
 *
 * LA LLAVE SE CREA EN CADA PASADA y no vive en ningún sitio: su mitad pública se
 * mete en el `index.html` servido (`conLlaveDePrueba`, con page.route) y la privada
 * firma aquí, en Node, como lo hace `scripts/licencias/firmar.js` en el PC de Ez. Así
 * se prueba el artefacto que se publica sin poner en él ninguna llave de prueba.
 * Las pruebas que la usan bloquean el service worker: serviría el `index.html` sin
 * pasar por la ruta.
 */
'use strict';

const crypto = require('crypto');

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

module.exports = { par, otra, PUBLICA, b64url, firmar, conLlaveDePrueba };
