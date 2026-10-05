/* PACE · SUBIR LA VERSION EN LOS SIETE SITIOS A LA VEZ (s198)
 * ===========================================================
 * Uso:
 *   npm run bump -- 0.134.0          (o v0.134.0)
 *   npm run bump -- 0.134.0 --seco   (dice que cambiaria, sin escribir)
 *
 * Hasta s198 la version se cambiaba a mano en siete sitios (`version.sitios.js`)
 * y el `verify` solo podia AVISAR de que no coincidian. Este comando los cambia
 * juntos y se niega a hacer dos cosas que siempre son un error:
 *  · empezar desde un estado INCOHERENTE (sitios con versiones distintas): ahi no
 *    se sabe cual es la buena, y arreglarlo es una decision, no un reemplazo;
 *  · BAJAR la version o dejarla igual (salvo `--forzar`).
 * Respeta los finales de linea de cada archivo (los .md van en CRLF en la copia de
 * trabajo, `core.autocrlf=true`). No toca el CHANGELOG ni STATE: eso se escribe.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { PUNTOS } = require('./version.sitios.js');

const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const seco = args.includes('--seco');
const forzar = args.includes('--forzar');
const pedida = args.find((a) => !a.startsWith('--'));

function salir(msg, codigo) { console.error(msg); process.exit(codigo); }
if (!pedida || !/^v?\d+\.\d+\.\d+$/.test(pedida)) {
  salir('Uso: npm run bump -- X.Y.Z [--seco] [--forzar]   (p. ej. 0.134.0)', 2);
}
const nueva = pedida.startsWith('v') ? pedida : 'v' + pedida;

const num = (v) => v.replace(/^v/, '').split('.').map(Number);
const compara = (a, b) => { const x = num(a), y = num(b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };

const textos = {};
const leidos = PUNTOS.map((p) => {
  if (!(p.archivo in textos)) textos[p.archivo] = fs.readFileSync(path.join(ROOT, p.archivo), 'utf8');
  const m = textos[p.archivo].match(p.re);
  if (!m) salir('No se encuentra la version en ' + p.archivo + ' (' + p.re + ')', 1);
  return { p, actual: m[1] };
});

const actuales = new Set(leidos.map((l) => l.actual));
if (actuales.size > 1) {
  salir('Los sitios NO coinciden y no se sabe cual es la buena:\n  ' +
    leidos.map((l) => l.p.archivo + ' = ' + l.actual).join('\n  ') + '\nArreglalo a mano y vuelve a intentarlo.', 1);
}
const actual = leidos[0].actual;
if (compara(nueva, actual) <= 0 && !forzar) {
  salir('La version pedida (' + nueva + ') no es mayor que la actual (' + actual + '). Usa --forzar si es a proposito.', 1);
}

for (const l of leidos) {
  textos[l.p.archivo] = textos[l.p.archivo].replace(l.p.re, (entero, v) => entero.replace(v, nueva));
}
if (!seco) {
  for (const archivo of Object.keys(textos)) fs.writeFileSync(path.join(ROOT, archivo), textos[archivo]);
}
console.log((seco ? '[seco] ' : '') + actual + ' -> ' + nueva + ' en ' + PUNTOS.length + ' sitios:');
leidos.forEach((l) => console.log('  ' + l.p.archivo));
if (!seco) console.log('Siguiente: `npm run verify` (comprueba que los siete coincidan) y el resto del cierre de CLAUDE.md.');
