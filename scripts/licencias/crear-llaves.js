/**
 * npm run licencia:llaves  — CREA LA PAREJA DE LLAVES DE LOS CÓDIGOS (una vez)
 *
 * Se ejecuta en el PC de Ez, no en la nube ni en GitHub:
 *   · la llave PRIVADA (la que firma) se guarda en `PACE-llave-licencias`, en la
 *     carpeta de usuario, fuera del repositorio. Haz una copia fuera del
 *     ordenador, como con la de Play: sin ella no se pueden hacer más códigos.
 *   · la llave PÚBLICA (la que comprueba) se escribe en `app/licencia.llaves.js`
 *     con un id nuevo (k1, k2…). Ese cambio sí se sube: no es secreto.
 *
 * Si la carpeta ya tiene una llave, no la pisa. Una llave nueva convive con las
 * anteriores, así que los códigos ya dados siguen valiendo.
 *
 * Opciones: --carpeta <ruta>  (por defecto ~/PACE-llave-licencias, o la variable
 *           PACE_LLAVE_LICENCIAS)
 *           --nueva           crea otra llave aunque ya haya una
 */
'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var c = require('./comun.js');

function main() {
  var o = c.argumentos(process.argv.slice(2));
  var carpeta = c.comprobarCarpeta(o.carpeta || c.carpetaPorDefecto());
  fs.mkdirSync(carpeta, { recursive: true });

  var llaves = c.leerLlavesApp();
  var ids = Object.keys(llaves);
  var yaHay = fs.readdirSync(carpeta).filter(function (f) { return /^k\d+\.privada\.pem$/.test(f); });
  if (yaHay.length && !o.nueva) {
    console.log('Ya hay una llave en ' + carpeta + ' (' + yaHay.join(', ') + ').');
    console.log('No hace falta otra: usa `npm run licencia:codigo -- <número de tester>`.');
    console.log('Si de verdad quieres una nueva, añade --nueva.');
    return;
  }

  var n = ids.reduce(function (m, id) { return Math.max(m, Number(id.slice(1))); }, 0) + 1;
  var keyId = 'k' + n;
  var par = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  var privada = par.privateKey.export({ type: 'pkcs8', format: 'pem' });
  var jwk = par.publicKey.export({ format: 'jwk' });

  var archivo = path.join(carpeta, keyId + '.privada.pem');
  fs.writeFileSync(archivo, privada, { mode: 0o600 });

  var src = fs.readFileSync(c.LLAVES_APP, 'utf8');
  var linea = '  ' + keyId + ": { x: '" + jwk.x + "', y: '" + jwk.y + "' },\n";
  var nuevo = src.replace(/(var PACE_LLAVES_LICENCIA = \{\r?\n)/, '$1' + linea);
  if (nuevo === src) throw new Error('No encuentro dónde escribir la llave en ' + c.LLAVES_APP);
  fs.writeFileSync(c.LLAVES_APP, nuevo);

  console.log('Hecho.');
  console.log('  Llave privada (NO se sube, haz una copia fuera del ordenador): ' + archivo);
  console.log('  Llave pública ' + keyId + ' escrita en app/licencia.llaves.js: esa sí se sube con la versión.');
  console.log('Siguiente: npm run licencia:codigo -- 1');
}

try { main(); } catch (e) { console.error('No se ha podido: ' + e.message); process.exit(1); }
