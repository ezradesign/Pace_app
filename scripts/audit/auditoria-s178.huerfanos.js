#!/usr/bin/env node
/**
 * auditoria-s178.huerfanos.js — que hay IMPLEMENTADO que no consume nadie.
 *
 * PREGUNTA 3 de la auditoria de s178.
 *
 * POR QUE NO VALE «esta cargado o no». Lo primero que probe fue cruzar los <script> de
 * PACE.html contra los archivos de app/: dio 122 = 122, cero huerfanos, y sin embargo
 * `library-transition.js` lleva INERTE desde s174 — porque esta cargado, solo que no lo
 * llama nadie. Un censo de carga no puede ver eso. La comprobacion util es RELACIONAL
 * (s152): por cada simbolo publicado a `window` (regla §2 de CLAUDE.md), contar consumidores
 * FUERA de su propio archivo.
 *
 * LO QUE NO CUBRE: un simbolo consumido una sola vez desde codigo a su vez muerto sigue
 * contando como vivo — esto encuentra hojas, no ramas. Y un consumo por nombre construido
 * (`window['Pace'+x]`) es invisible al grep.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') walk(p, out); }
    else if (/\.(js|jsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const appFiles = walk(path.join(ROOT, 'app'), []);
const testFiles = fs.existsSync(path.join(ROOT, 'tests')) ? walk(path.join(ROOT, 'tests'), []) : [];
const rootFiles = ['PACE.html', 'build-standalone.js', 'sw.js']
  .map(f => path.join(ROOT, f)).filter(fs.existsSync);

const read = f => ({ rel: path.relative(ROOT, f).split(path.sep).join('/'), txt: fs.readFileSync(f, 'utf8') });
const app = appFiles.map(read);
const tests = testFiles.map(read);
const roots = rootFiles.map(read);

// --- 1. que publica cada archivo a window --------------------------------------
// Regla §2: `Object.assign(window, { A, B, C });` al final del archivo.
const EXPORT_BLOCK = /Object\.assign\(\s*window\s*,\s*\{([^}]*)\}/g;
const publicados = []; // { simbolo, archivo } — OJO: NO llamar a esto `exports`, es un binding de CommonJS
for (const f of app) {
  for (const m of f.txt.matchAll(EXPORT_BLOCK)) {
    for (const raw of m[1].split(',')) {
      const name = raw.split(':')[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(name)) publicados.push({ simbolo: name, archivo: f.rel });
    }
  }
}

// --- 2. quien los consume ------------------------------------------------------
function consumidores(simbolo, propioArchivo) {
  const hits = [];
  // OJO: la mitad de la app consume estos simbolos como `window.X`, no pelados — asi que
  // excluir TODO lo precedido por punto daba dos archivos «inertes» que estan vivisimos
  // (`catalog.js:19` lee `window.ACHIEVEMENT_GLYPHS`). Se aceptan las dos formas.
  const s = simbolo.replace(/\$/g, '\\$');
  const re = new RegExp('(?:window\\.' + s + '|(?<![\\w$.])' + s + ')(?![\\w$])');
  for (const f of [...app, ...tests, ...roots]) {
    if (f.rel === propioArchivo) continue;
    const lines = f.txt.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      // Se ignoran las lineas que son solo comentario: citar un simbolo al explicarlo
      // no es consumirlo, y esa es justo la trampa de `library-transition.js`.
      const t = ln.trim();
      if (t.startsWith('*') || t.startsWith('//') || t.startsWith('/*')) continue;
      if (re.test(ln)) { hits.push(f.rel + ':' + (i + 1)); break; }
    }
  }
  return hits;
}

const huerfanos = [];
const casiHuerfanos = [];
for (const e of publicados) {
  const c = consumidores(e.simbolo, e.archivo);
  const soloTests = c.length > 0 && c.every(h => h.startsWith('tests/'));
  if (c.length === 0) huerfanos.push({ ...e, consumidores: c });
  else if (soloTests) casiHuerfanos.push({ ...e, consumidores: c });
}

console.log('=== AUDITORIA s178 · P3 · implementado y sin consumidor ===\n');
console.log('Archivos de app/ leidos      : ' + app.length);
console.log('Simbolos publicados a window : ' + publicados.length);
console.log('SIN NINGUN consumidor        : ' + huerfanos.length);
console.log('Consumidos SOLO por tests    : ' + casiHuerfanos.length + '\n');

// El simbolo suelto NO es la unidad util: los adaptadores de eventos publican piezas que
// solo usan dentro de su archivo, y eso es convencion (regla §2), no codigo muerto. Lo que
// senala un modulo INERTE es que el archivo ENTERO no tenga un solo consumidor fuera.
const porArchivo = new Map();
for (const e of publicados) {
  if (!porArchivo.has(e.archivo)) porArchivo.set(e.archivo, { total: 0, muertos: 0 });
  const a = porArchivo.get(e.archivo);
  a.total++;
  if (huerfanos.some(h => h.simbolo === e.simbolo && h.archivo === e.archivo)) a.muertos++;
}
const inertes = [...porArchivo.entries()].filter(([, a]) => a.total === a.muertos);

console.log('--- ARCHIVOS INERTES: NINGUNO de sus simbolos lo consume nadie fuera ---');
if (!inertes.length) console.log('  ninguno');
for (const [rel, a] of inertes) console.log('  ' + rel.padEnd(46) + a.total + '/' + a.total + ' simbolos sin consumidor');

const parciales = [...porArchivo.entries()].filter(([, a]) => a.muertos > 0 && a.total !== a.muertos);
console.log('\n--- publican de mas (parte viva, parte solo interna) ---');
for (const [rel, a] of parciales) console.log('  ' + rel.padEnd(46) + a.muertos + ' de ' + a.total + ' sin consumidor externo');
if (casiHuerfanos.length) {
  console.log('\n--- SOLO LOS TOCAN LOS TESTS (vivos para la suite, muertos para la app) ---');
  for (const h of casiHuerfanos) console.log('  ' + h.simbolo.padEnd(30) + ' <- ' + h.archivo + '   [' + h.consumidores.join(' ') + ']');
}

// --- 3. archivos sueltos en la RAIZ --------------------------------------------
// La regla §1 del verify mide app/, tests/ y scripts/ y declara que la RAIZ queda fuera.
const IGNORE = new Set(['index.html', 'PACE.html', 'PACE_standalone.html', 'privacy.html',
                        'safety.html', 'manifest.json', 'package.json', 'package-lock.json',
                        'sw.js', 'build-standalone.js', 'playwright.config.js']);
const rootStray = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(e => e.isFile() && /\.(html|js|json)$/.test(e.name) && !IGNORE.has(e.name))
  .map(e => e.name);

console.log('\n--- ARCHIVOS SUELTOS EN LA RAIZ (fuera del censo de la regla §1) ---');
if (!rootStray.length) console.log('  ninguno');
for (const n of rootStray) {
  const st = fs.statSync(path.join(ROOT, n));
  console.log('  ' + n.padEnd(34) + (st.size / 1024).toFixed(0).padStart(6) + ' KB');
}

// --- 4. bancos de scripts/audit sin indexar ------------------------------------
const auditDir = path.join(ROOT, 'scripts', 'audit');
const bancos = fs.readdirSync(auditDir).filter(n => n.endsWith('.js'));
const docsDir = path.join(ROOT, 'docs');
let docsBlob = '';
(function walkDocs(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walkDocs(p);
    else if (e.name.endsWith('.md')) docsBlob += fs.readFileSync(p, 'utf8');
  }
})(docsDir);
docsBlob += fs.readFileSync(path.join(ROOT, 'STATE.md'), 'utf8');
docsBlob += fs.readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf8');

const sinIndexar = bancos.filter(b => !docsBlob.includes(b));
console.log('\n--- BANCOS DE scripts/audit/ SIN UNA SOLA MENCION EN LA DOCUMENTACION ---');
console.log('  bancos totales : ' + bancos.length + '   ·   sin mencion : ' + sinIndexar.length);
for (const b of sinIndexar) console.log('    ' + b);
