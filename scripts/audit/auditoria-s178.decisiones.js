#!/usr/bin/env node
/**
 * auditoria-s178.decisiones.js — cruza DECISIONES_TECNICAS_VIGENTES.md contra el codigo de hoy.
 *
 * PREGUNTA 1 de la auditoria de s178: que decisiones estan OBSOLETAS o se contradicen.
 *
 * QUE HACE Y QUE NO. Es un checker RELACIONAL, no un censo (s152). Por cada fila extrae sus
 * `code spans` y comprueba que el referente EXISTA todavia: los ficheros, en disco; los
 * identificadores, en las FUENTES (nunca en los .md — que una decision se cite a si misma en
 * otro documento no prueba que el codigo la cumpla). Una fila cuyo referente desaparecio es
 * SOSPECHOSA, no culpable: pudo renombrarse. Y lo que este script NO PUEDE decir es si una
 * fila cuyo simbolo sigue vivo describe bien lo que ese codigo hace HOY — eso es lectura.
 *
 * TRAMPA PAGADA AL ESCRIBIRLO: generar este archivo con un heredoc de bash se comio LOS 22
 * BACKSLASHES, asi que todas las expresiones regulares llegaron rotas al disco y el fallo
 * salio como SyntaxError en una linea que yo no habia escrito. Se escribe con la herramienta
 * de escritura, no por shell.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
// Se acepta otro documento por argv para poder CALIBRAR EN ROJO sobre una copia mutada:
// un checker que no has visto morder no prueba nada (s154).
const DOC = process.argv[2] ? path.resolve(process.argv[2])
                            : path.join(ROOT, 'docs', 'product', 'DECISIONES_TECNICAS_VIGENTES.md');

// --- 1. corpus de fuentes vivas ------------------------------------------------
const SRC_DIRS = ['app', 'scripts', 'tests', '.github'];
const SRC_ROOT_FILES = ['PACE.html', 'build-standalone.js', 'sw.js', 'manifest.json',
                        'privacy.html', 'safety.html', 'playwright.config.js', 'package.json'];
const EXT = new Set(['.js', '.jsx', '.css', '.html', '.json', '.ps1', '.yml']);

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') walk(p, out); }
    else if (EXT.has(path.extname(e.name))) out.push(p);
  }
  return out;
}
const files = [];
for (const d of SRC_DIRS) walk(path.join(ROOT, d), files);
for (const f of SRC_ROOT_FILES) { const p = path.join(ROOT, f); if (fs.existsSync(p)) files.push(p); }

const codeFiles = files.map(f => [path.relative(ROOT, f).split(path.sep).join('/'), fs.readFileSync(f, 'utf8')]);

function firstHit(needle) {
  for (const [rel, txt] of codeFiles) {
    const i = txt.indexOf(needle);
    if (i !== -1) return rel + ':' + (txt.slice(0, i).split('\n').length);
  }
  return null;
}

// --- 2. filas del documento ----------------------------------------------------
const lines = fs.readFileSync(DOC, 'utf8').split('\n');
const rows = [];
lines.forEach((ln, i) => {
  if (!ln.startsWith('|')) return;
  const cells = ln.split('|').map(s => s.trim());
  if (cells.length < 4) return;
  if (/^-+$/.test(cells[1]) || cells[1] === 'Decision') return;
  rows.push({ line: i + 1, titulo: cells[1], desde: cells[2], detalle: cells.slice(3).join('|') });
});

// --- 3. clasificacion de spans -------------------------------------------------
const SPAN = /`([^`]+)`/g;
const isPath = s => /^[\w.\-/]+\.(js|jsx|css|html|json|webmanifest|md|ps1|png|mp3)$/.test(s);
// Identificador util: un solo token, sin espacios, con forma de simbolo o de clave punteada.
const isIdent = s => /^[A-Za-z_$][\w$.\-]*$/.test(s) && s.length >= 5 &&
                     !/^(true|false|null|auto|none|const|let|var|number|string|boolean)$/.test(s);

const suspectRows = [];
let spanTotal = 0, spanChecked = 0, spanMissing = 0;

for (const r of rows) {
  const text = r.titulo + ' | ' + r.detalle;
  const spans = [...text.matchAll(SPAN)].map(m => m[1]);
  const missing = [];
  const seen = new Set();
  for (const s of spans) {
    spanTotal++;
    if (seen.has(s)) continue;
    seen.add(s);
    if (isPath(s)) {
      spanChecked++;
      const cand = [s, 'app/' + s, 'scripts/' + s, 'docs/' + s, 'docs/product/' + s, 'tests/' + s];
      const found = cand.some(c => fs.existsSync(path.join(ROOT, c)));
      // Un nombre de archivo suelto tambien cuenta si el codigo lo cita (rutas cableadas).
      if (!found && !firstHit(s)) { missing.push({ span: s, tipo: 'archivo' }); spanMissing++; }
    } else if (isIdent(s)) {
      spanChecked++;
      if (!firstHit(s)) {
        // Un nombre PUNTEADO en la prosa suele ser descripcion («Componente.miembro»), no un
        // simbolo literal. Si la ultima pieza vive, el referente existe y la fila solo esta
        // mal escrita: se degrada a AVISO en vez de contarse como referente muerto.
        const tail = s.split('.').pop();
        const tailHit = s.includes('.') && tail.length >= 5 ? firstHit(tail) : null;
        if (tailHit) missing.push({ span: s, tipo: 'prosa punteada, la pieza viva esta en ' + tailHit, aviso: true });
        else { missing.push({ span: s, tipo: 'identificador' }); spanMissing++; }
      }
    }
  }
  if (missing.some(m => !m.aviso)) suspectRows.push({ ...r, missing });
}

// --- 4. informe ----------------------------------------------------------------
const superseded = rows.filter(r => /SUPERSEDED|ANULA|~~/.test(r.titulo + r.detalle));
console.log('=== AUDITORIA s178 · P1 · las decisiones contra el codigo ===\n');
console.log('Filas de decision leidas : ' + rows.length);
console.log('  marcadas SUPERSEDED / ANULA / tachadas : ' + superseded.length);
console.log('Spans entrecomillados    : ' + spanTotal + ' (comprobables y unicos: ' + spanChecked + ')');
console.log('Spans SIN referente vivo : ' + spanMissing);
console.log('Filas SOSPECHOSAS        : ' + suspectRows.length + '\n');

for (const r of suspectRows) {
  console.log('--- linea ' + r.line + ' · [' + r.desde + '] ' + r.titulo.replace(/\*\*/g, '').slice(0, 95));
  for (const m of r.missing) console.log('      SIN REFERENTE (' + m.tipo + '): ' + m.span);
}

console.log('\nAVISO SOBRE EL DENOMINADOR: una fila que dice «NUNCA `x`», «prohibido `x`» o «`x` se');
console.log('DESCARTO» sale aqui como referente muerto cuando lo correcto es justo que NO exista.');
console.log('La AUSENCIA POR DISENIO es indistinguible de la obsolescencia para un grep: hay que');
console.log('leer la fila antes de acusarla.\n');

console.log('=== filas ya marcadas SUPERSEDED / ANULA ===');
for (const r of superseded) console.log('  linea ' + r.line + ' · [' + r.desde + '] ' + r.titulo.replace(/\*\*/g, '').slice(0, 100));

// --- 5. el INDICE de STATE.md contra el documento que gobierna --------------------
// El cierre de sesion obliga a anadir la fila AQUI y su titulo al indice de STATE.md.
// Que las dos listas deriven es el fallo por OMISION de s169: entregado y sin marcar.
const state = fs.readFileSync(path.join(ROOT, 'STATE.md'), 'utf8').split('\n');
const idxStart = state.findIndex(l => /^## Decisiones activas/.test(l));
const idxEnd = state.findIndex((l, i) => i > idxStart && /^## /.test(l));
const indexLines = state.slice(idxStart, idxEnd === -1 ? state.length : idxEnd);

// Normalizacion: sin acentos, sin puntuacion, minusculas. Los dos archivos difieren en
// acentuacion a proposito (STATE.md se escribe sin tildes), asi que comparar crudo miente.
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
                   .replace(/[^a-z0-9 ]/gi, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

const docTitles = rows.filter(r => /^\*\*/.test(r.titulo))
                      .map(r => ({ line: r.line, desde: r.desde, t: norm(r.titulo) }));
const indexBlob = norm(indexLines.join(' '));

// Se compara por las 6 primeras palabras del titulo: el indice a veces recorta la cola.
const huellas = docTitles.map(d => ({ ...d, huella: d.t.split(' ').slice(0, 6).join(' ') }));
const noEnIndice = huellas.filter(d => !indexBlob.includes(d.huella));

console.log('\n=== P1b · el INDICE de STATE.md contra el documento ===');
console.log('Titulos en NEGRITA en el documento : ' + docTitles.length);
console.log('Lineas del indice de STATE.md      : ' + indexLines.length);
console.log('Titulos SIN eco en el indice       : ' + noEnIndice.length);
console.log('  (LIMITE MEDIDO: el documento escribe «pestanias» donde el indice escribe');
console.log('   «pestañas». Quitar tildes no arregla una TRANSLITERACION, asi que esa fila');
console.log('   sale aqui siendo falsa. Verificar cada una a mano antes de acusar.)');
for (const d of noEnIndice) console.log('  FALTA EN EL INDICE · linea ' + d.line + ' [' + d.desde + '] ' + d.huella);
