/* Caza de los seis anchos · lanza todas las combinaciones, unas cuantas a la vez, y deja un JSON por
 * combinación en CAZA_SALIDA. Uso: CAZA_SALIDA=<carpeta> CAZA_FOTOS=<carpeta> [A_LA_VEZ=5]
 *   [TAMS=m360,e1280] [LANGS=es] [TEMAS=claro] [PARTES=jornada] node todo.js
 * El servidor lo arranca el primero que lo necesita (lib.js); los demás lo reusan. */
'use strict';
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const L = require('./lib');

const SALIDA = process.env.CAZA_SALIDA || path.join(require('os').tmpdir(), 'caza-anchos-9nov');
fs.mkdirSync(SALIDA, { recursive: true });
const lista = (v, d) => (v ? v.split(',') : d);
const TAMS = lista(process.env.TAMS, Object.keys(L.TAMANOS));
const LANGS = lista(process.env.LANGS, ['es', 'en']);
const TEMAS = lista(process.env.TEMAS, ['claro', 'osc']);
const PARTES = lista(process.env.PARTES, ['primera', 'jornada', 'carta', 'modulos', 'web']);
const A_LA_VEZ = Number(process.env.A_LA_VEZ || 5);

const trabajos = [];
for (const parte of PARTES) for (const tam of TAMS) for (const lang of LANGS) for (const tema of TEMAS) {
  const f = path.join(SALIDA, [parte, tam, lang, tema].join('_') + '.json');
  if (fs.existsSync(f) && fs.statSync(f).size > 50) continue;      // ya hecho: se puede relanzar
  trabajos.push({ parte, tam, lang, tema, f });
}

function correr(t) {
  return new Promise((res) => {
    const script = t.parte === 'web' ? 'web.js' : 'pantallas.js';
    const args = [path.join(__dirname, script), t.tam, t.lang, t.tema].concat(t.parte === 'web' ? [] : [t.parte]);
    const p = spawn(process.execPath, args, { cwd: L.RAIZ, env: process.env });
    let out = '', err = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { err += d; });
    const reloj = setTimeout(() => p.kill(), 6 * 60 * 1000);
    p.on('close', (code) => {
      clearTimeout(reloj);
      fs.writeFileSync(t.f, out.trim() || JSON.stringify({ tag: t.tam + '-' + t.lang, pasos: [{ error: 'sin salida (' + code + '): ' + err.slice(-400) }] }));
      res();
    });
  });
}

(async () => {
  /* El servidor, de este proceso: si lo arrancara un trabajo, al acabar se lo llevaría a los demás. */
  await L.lanzar();
  const t0 = Date.now();
  let hechos = 0;
  const cola = trabajos.slice();
  await Promise.all(Array.from({ length: A_LA_VEZ }, async () => {
    while (cola.length) {
      const t = cola.shift();
      await correr(t);
      hechos++;
      process.stderr.write(hechos + '/' + trabajos.length + ' ' + t.parte + ' ' + t.tam + ' ' + t.lang + ' ' + t.tema + ' · ' + Math.round((Date.now() - t0) / 1000) + ' s\n');
    }
  }));
  await L.cerrar();
})();
