/* PACE · la suite solo corre contra el servidor de SU carpeta
   ==========================================================
   En local, Playwright reutiliza cualquier servidor que ya escuche en el puerto
   (`reuseExistingServer`). Si ese servidor lo dejó encendido otra sesión desde
   otra carpeta (un worktree, otra copia del repo), la suite prueba los archivos
   de ESA carpeta, sale en verde o en rojo por razones ajenas y nadie lo nota: el
   8 de octubre de 2026 probó una v0.145.0 creyendo probar la v0.148.3.

   El servidor de pruebas manda en cada respuesta qué carpeta sirve
   (`X-Pace-Raiz`, en .claude/static-server.js). Aquí se compara con la carpeta
   de esta suite antes de correr nada, y si no casa, se para con lo que hay que
   hacer. Un servidor sin la marca (uno anterior a ella, o de otro proyecto)
   tampoco vale. En el CI no se reutiliza nada, así que allí siempre casa. */
'use strict';

const path = require('path');

function normal(ruta) {
  const r = path.resolve(ruta);
  return process.platform === 'win32' ? r.toLowerCase() : r;
}

module.exports = async function servidorPropio(config) {
  const base = config.projects[0].use.baseURL;
  const raiz = path.resolve(__dirname, '..');
  let marca = null;
  try {
    const res = await fetch(base + '/index.html', { method: 'HEAD' });
    marca = res.headers.get('x-pace-raiz');
  } catch (e) {
    throw new Error('No se pudo leer ' + base + ': ' + e.message);
  }
  const suya = marca ? decodeURIComponent(marca) : null;
  if (suya && normal(suya) === normal(raiz)) return;
  throw new Error(
    '\n\nEl servidor de ' + base + ' no es el de esta carpeta, así que la suite probaría otros archivos.\n' +
    '  Sirve:  ' + (suya || 'un servidor sin la marca de PACE (anterior a ella o de otro proyecto)') + '\n' +
    '  Esta:   ' + raiz + '\n' +
    'Cierra ese servidor o usa un puerto propio, por ejemplo con PACE_E2E_PORT=8775.\n');
};
