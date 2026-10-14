/* PACE · RESCATAR EL HILO DE UNA SESION QUE SE PARO (relevo entre cuentas)
 * ===========================================================
 * Uso:
 *   node scripts/relevo-hilo.js .claude/worktrees/<carpeta>
 *
 * Cuando una cuenta de Claude se queda sin uso, sus sesiones en paralelo se paran
 * donde estén, a veces sin el commit «wip». Su conversación sigue en este PC: Claude
 * Code la guarda en ~/.claude/projects/<carpeta codificada>/<id>.jsonl, y las dos
 * cuentas de Ez comparten esa carpeta. Reanudar ese hilo tal cual arrastra todo su
 * contexto (unos 400 000 tokens) en cada turno, así que la sesión nueva empieza de
 * cero y lee esto: el encargo, lo que la sesión iba diciendo y lo que Ez contestó
 * en sus preguntas, que es lo único que no está en el repo.
 *
 * Escribe <carpeta>/.claude/relevo/HILO.md (`.claude/relevo/` está en
 * .git/info/exclude: es una nota local, no va al repo). Lo que la coordinadora
 * quiera añadir (dónde se quedó, qué sigue) va al lado, en RELEVO.md.
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const carpeta = path.resolve(process.argv[2] || '.');
// Claude Code nombra la carpeta del proyecto cambiando todo lo que no es letra o cifra por «-».
const clave = carpeta.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
const raiz = path.join(os.homedir(), '.claude', 'projects');
const dir = fs.readdirSync(raiz).find(d => d.toLowerCase() === clave);
if (!dir) { console.error('No hay transcripciones para ' + carpeta + ' en ' + raiz); process.exit(1); }
const hilos = fs.readdirSync(path.join(raiz, dir)).filter(f => f.endsWith('.jsonl'))
  .map(f => path.join(raiz, dir, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
if (!hilos.length) { console.error('La carpeta ' + dir + ' no tiene ningún .jsonl'); process.exit(1); }
const archivo = hilos[0];

const lineas = fs.readFileSync(archivo, 'utf8').trim().split('\n')
  .map(l => { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean);
const texto = c => typeof c === 'string' ? c : (c || []).filter(x => x.type === 'text').map(x => x.text).join('\n');
const limpio = s => s.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '').trim();

let encargo = null;
const hilo = [];
const preguntas = {};
const decisiones = [];
for (const e of lineas) {
  if (!e.message || (e.type !== 'user' && e.type !== 'assistant')) continue;
  const hora = (e.timestamp || '').slice(11, 16);
  const c = e.message.content;
  for (const x of Array.isArray(c) ? c : []) {
    if (x.type === 'tool_use' && /AskUserQuestion/.test(x.name)) preguntas[x.id] = x.input;
    if (x.type === 'tool_result' && preguntas[x.tool_use_id]) {
      decisiones.push(hora + ' · ' + limpio(texto(x.content) || JSON.stringify(x.content)));
    }
  }
  const s = limpio(texto(c));
  if (!s || /^You've hit your (session|usage) limit/.test(s)) continue;
  if (e.type === 'user' && !encargo) { encargo = s; continue; }
  hilo.push((e.type === 'user' ? '**Mensaje recibido** ' : '- ') + hora + ' · ' + s.replace(/\s*\n+\s*/g, ' '));
}

const md = '# El hilo de ' + path.basename(carpeta) + '\n\n' +
  'Sacado de `' + archivo + '` (' + new Date(fs.statSync(archivo).mtimeMs).toISOString() + ').\n\n' +
  '## Lo que Ez contestó (no se vuelve a preguntar)\n\n' +
  (decisiones.length ? decisiones.map(d => '- ' + d).join('\n') : 'Nada: en este hilo Ez no contestó ninguna pregunta.') + '\n\n' +
  '## El encargo\n\n' + (encargo || '(sin encargo)') + '\n\n' +
  '## Lo que la sesión iba diciendo (hora UTC)\n\n' + hilo.join('\n') + '\n';
const salida = path.join(carpeta, '.claude', 'relevo', 'HILO.md');
fs.mkdirSync(path.dirname(salida), { recursive: true });
fs.writeFileSync(salida, md);
console.log(salida + ': ' + decisiones.length + ' respuesta(s) de Ez, ' + hilo.length + ' mensajes.');
