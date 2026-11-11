'use strict';
/* PACE · verify.ci.js — EL CI CABE EN SU TIEMPO, Y LO QUE DICE DE SÍ MISMO ES VERDAD
   ============================================================
   El trabajo `e2e` de `.github/workflows/ci.yml` va en trozos (`--shard`), cada uno con su tope
   de minutos. Cuando un trozo pasa del tope, GitHub lo da por cancelado aunque todo esté en verde
   (pasó en v0.151.0, y en noviembre de 2026 el segundo de dos iba a 24 min 30 s de 25). Que un
   trozo se acerque al tope solo se veía mirando los logs: aquí se cuenta.

   Lo que se mide no son minutos (eso solo existe en GitHub) sino PRUEBAS POR TROZO, que es lo que
   los mueve: con la duración de cada prueba en el CI de da56e0a, el trozo más lento de cinco
   llevaba 302 pruebas y tardaba 11,0 min, unos 2,2 s por prueba con dos procesos. 360 pruebas son
   unos 13 min: por encima, se sube el número de trozos (no el tope).

   Además, que el YAML diga lo mismo en sus tres sitios (matriz, nombre y `--shard`), que el
   paso 9 de CLAUDE.md nombre ese número de trozos y que la imagen de Playwright del trabajo de
   Safari sea la versión del lockfile (con otra, el WebKit de la imagen no es el que espera la
   suite). */

var fs = require('fs');
var path = require('path');
var child = require('child_process');

var TOPE_POR_TROZO = 360;
var NUMEROS = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];

function leer(ROOT, rel) {
  try { return fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n'); } catch (e) { return ''; }
}

/* Cuántas pruebas del proyecto chromium hay, con el `--list` de Playwright (no abre navegador). */
function contarPruebas(ROOT) {
  var cli = path.join(ROOT, 'node_modules', '@playwright', 'test', 'cli.js');
  if (!fs.existsSync(cli)) return null;
  var r = child.spawnSync(process.execPath, [cli, 'test', '--project=chromium', '--list'], {
    cwd: ROOT, encoding: 'utf8', env: Object.assign({}, process.env, { CI: '' }), maxBuffer: 64 * 1024 * 1024,
  });
  var m = /Total: (\d+) tests? in \d+ files?/.exec((r.stdout || '') + (r.stderr || ''));
  return m ? Number(m[1]) : null;
}

function tandaCI(ctx) {
  console.log('\n[ci] Los trozos de las pruebas caben en su tiempo');
  var yml = leer(ctx.ROOT, '.github/workflows/ci.yml');
  if (!yml) { ctx.falla('no se pudo leer .github/workflows/ci.yml'); return; }

  var matriz = /\n\s+trozo: \[([\d,\s]+)\]/.exec(yml);
  var nombre = /name: e2e \(\$\{\{ matrix\.trozo \}\}\/(\d+)\)/.exec(yml);
  var shard = /--shard=\$\{\{ matrix\.trozo \}\}\/(\d+)/.exec(yml);
  if (!matriz || !nombre || !shard) {
    ctx.falla('ci.yml: no se encuentran la matriz `trozo`, el nombre `e2e (n/N)` o el `--shard=n/N` del trabajo e2e');
    return;
  }
  var lista = matriz[1].split(',').map(function (x) { return Number(x.trim()); });
  var N = lista.length;
  var seguidos = lista.every(function (x, i) { return x === i + 1; });
  if (!seguidos || Number(nombre[1]) !== N || Number(shard[1]) !== N) {
    ctx.falla('ci.yml: la matriz tiene ' + N + ' trozos (' + lista.join(', ') + '), el nombre dice /' + nombre[1] + ' y el --shard /' + shard[1] + ': los tres tienen que decir lo mismo, del 1 al N');
  } else ctx.ok('ci.yml: ' + N + ' trozos en la matriz, el nombre y el --shard');

  var claude = leer(ctx.ROOT, 'CLAUDE.md');
  var frase = 'los ' + (NUMEROS[N] || String(N)) + ' trozos de `e2e`';
  if (claude.indexOf(frase) < 0) ctx.falla('CLAUDE.md (paso 9 del cierre) no dice «' + frase + '»: el CI tiene ' + N + ' trozos');
  else ctx.ok('CLAUDE.md nombra los ' + N + ' trozos');

  var lock = {};
  try { lock = JSON.parse(leer(ctx.ROOT, 'package-lock.json')); } catch (e) { /* lo dice el falla de abajo */ }
  var pw = lock.packages && lock.packages['node_modules/@playwright/test'] && lock.packages['node_modules/@playwright/test'].version;
  var imagen = /image: mcr\.microsoft\.com\/playwright:v([\d.]+)-(\w+)/.exec(yml);
  if (!pw || !imagen) ctx.falla('ci.yml / package-lock.json: no se encuentra la imagen de Playwright del trabajo de Safari o la versión del lockfile');
  else if (imagen[1] !== pw) ctx.falla('ci.yml: e2e-safari usa la imagen de Playwright ' + imagen[1] + ' y el lockfile trae ' + pw + ': cambia la etiqueta a v' + pw + '-' + imagen[2]);
  else ctx.ok('e2e-safari corre en la imagen de Playwright del lockfile (' + pw + ')');

  /* El AAB firmado para Play, solo tras un CI en verde (Ez, O4 A de la octava): antes saltaba
     con cada push a main, a la vez que el CI, y un commit rojo podía dejar su AAB en el borrador. */
  var android = leer(ctx.ROOT, '.github/workflows/android.yml');
  var malAndroid = [];
  if (/\n\s+push:/.test(android.split('\njobs:')[0])) malAndroid.push('vuelve a saltar con cada push, sin esperar al CI');
  if (!/workflow_run:\s*\n\s+workflows: \[CI\]/.test(android)) malAndroid.push('no arranca tras el workflow CI (`workflow_run`)');
  if (android.indexOf("github.event.workflow_run.conclusion == 'success'") < 0) malAndroid.push('no mira que el CI acabara en verde');
  if (/--target "\$GITHUB_SHA"/.test(android)) malAndroid.push('apunta el borrador al último commit de main y no al que probó el CI');
  if (android.indexOf("github.event.workflow_run.event == 'push'") < 0) malAndroid.push('una corrida del CI a hora fija rehace el AAB de una versión que quizá ya se subió');

  /* A horas fijas (la octava, nº 3): de noche, a las 00:30 y en lunes, que es cuando salen los
     fallos de fecha; y por evento, para que esas corridas no cancelen la de un push. */
  var crones = (yml.split('\njobs:')[0].match(/- cron: '[^']+'/g) || []).length;
  if (crones < 3) ctx.falla('ci.yml: ' + crones + ' corridas a hora fija y tienen que ser al menos tres (23:30, 00:30 y el lunes, hora de Madrid)');
  else if (yml.indexOf('group: ci-${{ github.event_name }}-') < 0) ctx.falla('ci.yml: la concurrencia no va por evento y una corrida a hora fija cancelaría la de un push');
  else ctx.ok('ci.yml: ' + crones + ' corridas a hora fija, en su propio grupo');
  if (malAndroid.length) ctx.falla('android.yml: ' + malAndroid.join('; '));
  else ctx.ok('android.yml: el AAB firmado solo sale tras un CI en verde, del commit que probó');

  var total = contarPruebas(ctx.ROOT);
  if (total === null) { ctx.info('sin node_modules de Playwright no se cuentan las pruebas por trozo'); return; }
  var porTrozo = Math.ceil(total / N);
  if (porTrozo > TOPE_POR_TROZO) {
    ctx.falla(total + ' pruebas en ' + N + ' trozos son ' + porTrozo + ' por trozo, más de ' + TOPE_POR_TROZO + ' (unos 13 min en GitHub): sube los trozos en ci.yml, en su nombre, en el --shard y en CLAUDE.md');
  } else ctx.ok(total + ' pruebas en ' + N + ' trozos: hasta ' + porTrozo + ' por trozo (tope ' + TOPE_POR_TROZO + ')');
}

module.exports = { tandaCI: tandaCI, TOPE_POR_TROZO: TOPE_POR_TROZO };
