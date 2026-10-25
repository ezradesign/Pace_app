/**
 * npm run licencia:k2  — CREA LA LLAVE k2, LA DE LAS VENTAS (una vez, en el PC de Ez)
 *
 * k2 firma los códigos de quien compra en la web. La firma no la hace Ez a mano: la
 * hace la función de Cloudflare al recibir «pago hecho» (functions/api/stripe.js), así
 * que su llave privada tiene que estar en Cloudflare, como secreto. k1, la de los
 * testers, no se toca y no sale del PC.
 *
 * Qué deja, en la carpeta de las llaves (`PACE-llave-licencias`, fuera del repositorio):
 *   · k2.privada.pem          la copia de seguridad: al disco duro, con la de k1 y la de Play;
 *   · k2.para-cloudflare.txt  lo mismo en una línea, para pegarlo en Cloudflare. Bórralo
 *                             después de pegarlo (se rehace con --cloudflare).
 * Y escribe la llave PÚBLICA de k2 en `app/licencia.llaves.js`: esa sí se sube, no es
 * secreta, y es la que deja a la app comprobar los códigos de venta.
 *
 * Opciones: --carpeta <ruta>   (por defecto ~/PACE-llave-licencias, o PACE_LLAVE_LICENCIAS)
 *           --cloudflare       vuelve a escribir k2.para-cloudflare.txt desde k2.privada.pem
 */
'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var c = require('./comun.js');

var ID = 'k2';

function pasos(txt) {
  console.log('');
  console.log('Ahora, en Cloudflare (una vez):');
  console.log('  1. Entra en dash.cloudflare.com > Workers y Pages > el proyecto de pacegrass.app.');
  console.log('  2. Configuración > Variables y secretos > Añadir.');
  console.log('  3. Tipo: Secreto. Nombre: PACE_K2_PRIVADA.');
  console.log('  4. Valor: abre ' + txt + ' con el Bloc de notas, copia la línea entera y pégala.');
  console.log('  5. Guarda, y borra ' + path.basename(txt) + ' (la copia buena es k2.privada.pem).');
  console.log('No la pegues en ningún chat ni correo: con ella cualquiera podría abrir PACE completo.');
}

function escribirTxt(carpeta, privada) {
  var jwk = crypto.createPrivateKey(privada).export({ format: 'jwk' });
  var txt = path.join(carpeta, ID + '.para-cloudflare.txt');
  fs.writeFileSync(txt, JSON.stringify({ kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y, d: jwk.d }) + '\n', { mode: 0o600 });
  return txt;
}

function main() {
  var o = c.argumentos(process.argv.slice(2));
  var carpeta = c.comprobarCarpeta(o.carpeta || c.carpetaPorDefecto());
  var pem = path.join(carpeta, ID + '.privada.pem');

  if (o.cloudflare) {
    if (!fs.existsSync(pem)) throw new Error('No hay ' + pem + ': primero, npm run licencia:k2');
    pasos(escribirTxt(carpeta, fs.readFileSync(pem, 'utf8')));
    return;
  }
  if (fs.existsSync(pem)) {
    console.log('k2 ya existe (' + pem + '). No se hace otra: los códigos vendidos dejarían de valer.');
    console.log('Si necesitas volver a pegarla en Cloudflare: npm run licencia:k2 -- --cloudflare');
    return;
  }
  if (c.leerLlavesApp()[ID]) {
    throw new Error('app/licencia.llaves.js ya tiene una k2, pero su privada no está en ' + carpeta +
      '. Si la tienes en otra carpeta, usa --carpeta <ruta>; si se perdió, hay que pasar a k3.');
  }

  fs.mkdirSync(carpeta, { recursive: true });
  var par = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  var privada = par.privateKey.export({ type: 'pkcs8', format: 'pem' });
  var jwk = par.publicKey.export({ format: 'jwk' });
  fs.writeFileSync(pem, privada, { mode: 0o600 });
  var txt = escribirTxt(carpeta, privada);

  var src = fs.readFileSync(c.LLAVES_APP, 'utf8');
  var linea = '  ' + ID + ": { x: '" + jwk.x + "', y: '" + jwk.y + "' },";
  var nuevo = src.replace(/(var PACE_LLAVES_LICENCIA = \{(\r?\n))/, function (m, cab, salto) { return cab + linea + salto; });
  if (nuevo === src) throw new Error('No encuentro dónde escribir la llave en ' + c.LLAVES_APP);
  fs.writeFileSync(c.LLAVES_APP, nuevo);

  console.log('Hecho.');
  console.log('  Copia de seguridad (NO se sube; al disco duro con las otras): ' + pem);
  console.log('  Llave pública k2 escrita en app/licencia.llaves.js: esa sí se sube con la versión.');
  pasos(txt);
}

try { main(); } catch (e) { console.error('No se ha podido: ' + e.message); process.exit(1); }
