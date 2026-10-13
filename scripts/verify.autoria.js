/**
 * verify.autoria.js - PACE · red de seguridad LOCAL · TODO EL HISTORIAL LO FIRMA EZ
 *
 * No es un script suelto: lo invoca `scripts/verify.js` como una tanda más.
 *
 * QUÉ VIGILA. En GitHub, la lista de contribuidores sale de quién firma los commits de
 * main. El 13 oct. 2026 salían «claude» (87 commits firmados como Claude desde sesiones en
 * la nube y cuatro con la línea «Co-Authored-By») y «dependabot[bot]» (dos actualizaciones
 * juntadas desde GitHub), y Ez quiere salir solo él. Se reescribió el historial; esto evita
 * que vuelva a pasar:
 *   · falla si algún commit alcanzable desde HEAD lo firma otra dirección que las de Ez;
 *   · falla si algún mensaje lleva una línea «Co-Authored-By:».
 * En el CI, el job de verify baja el historial entero (`fetch-depth: 0`) para mirarlo todo.
 *
 * Si falla: se reescribe el autor del commit (`git commit --amend --reset-author` si es el
 * último) antes de subir. Las actualizaciones de Dependabot las aplica Ez (o una sesión con
 * su nombre), no se juntan sus propuestas.
 *
 * NO CUBRE: quién HACE el commit (el committer), que GitHub no cuenta como contribuidor.
 */

'use strict';

var execSync = require('child_process').execSync;

var DE_EZ = ['ezra.vquez@gmail.com', '278364862+ezradesign@users.noreply.github.com'];

function tandaAutoria(c) {
  var salida;
  try {
    salida = execSync('git log --format=%h%x1f%an%x1f%ae%x1f%B%x1e', {
      cwd: c.ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (e) {
    c.info('autoría: sin git a mano, no se mira el historial');
    return;
  }
  var commits = salida.split('\x1e').map(function (s) { return s.replace(/^\s+/, ''); }).filter(Boolean);
  var ajenos = [], coautores = [];
  commits.forEach(function (bloque) {
    var p = bloque.split('\x1f');
    var h = p[0], nombre = p[1], correo = (p[2] || '').toLowerCase(), cuerpo = p[3] || '';
    if (DE_EZ.indexOf(correo) === -1) ajenos.push(h + ' ' + nombre + ' <' + correo + '>');
    if (/^[ \t]*co-authored-by:/im.test(cuerpo)) coautores.push(h);
  });
  if (!commits.length) { c.falla('autoría: git no devolvió ningún commit'); return; }
  if (ajenos.length) {
    c.falla('autoría: ' + ajenos.length + ' commit(s) firmados por otro que Ez (saldría en Contribuidores): '
      + ajenos.slice(0, 5).join(' · ') + (ajenos.length > 5 ? ' …' : ''));
  }
  if (coautores.length) {
    c.falla('autoría: ' + coautores.length + ' commit(s) con «Co-Authored-By»: ' + coautores.slice(0, 5).join(' '));
  }
  if (!ajenos.length && !coautores.length) {
    c.ok('autoría: los ' + commits.length + ' commits los firma Ez, sin «Co-Authored-By»');
  }
}

module.exports = { tandaAutoria: tandaAutoria };
