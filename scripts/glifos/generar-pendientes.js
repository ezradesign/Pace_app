/* s170 · Genera docs/product/GLIFOS_EJERCICIOS_PENDIENTES.md CRUZANDO tres
   fuentes, porque ninguna sola dice la verdad:
     1. las identidades visuales que la APP pide hoy   (fuente de verdad)
     2. el mapa de mascaras                            (que hay dibujado DE VERDAD)
     3. el encargo                                     (que debe mostrar cada uno)
   Un listado copiado del encargo mentiria en cuanto el catalogo se moviera —
   que es exactamente lo que le paso al encargo de logros y cazo s169. */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const SP = process.argv[2];

/* (1) identidades vivas: se las pedimos al propio script de ingesta en seco,
   que es quien ya sabe resolverlas (registro + pasos de las rutinas).
   LA CARPETA VA VACIA A PROPOSITO. El «identidades sin dibujo» de la ingesta es
   relativo a SU CARPETA DE ORIGEN, no al mapa de mascaras: apuntando a la
   carpeta de trabajo el total salia de sumar «con arte» + «sin dibujo» y daba
   72 donde hay 61 — o sea, contando doce dos veces. Con la carpeta vacia el
   listado ES el censo completo, y lo pendiente se deduce restando el mapa. */
const vacia = path.join(SP, '_vacia');
fs.rmSync(vacia, { recursive: true, force: true }); fs.mkdirSync(vacia, { recursive: true });
const seco = cp.execSync('node scripts/ingest-glifos-ejercicio.js --seco --origen "' + vacia + '"',
  { cwd: ROOT, encoding: 'utf8' });
const bloque = seco.split('identidades sin dibujo:')[1] || '';
/* `.slice(1)`: la primera linea tras los dos puntos es el CONTADOR, no un
   ejercicio. Sin esto se colaba «59» en la lista y salian 62 identidades. */
const sinDibujo = bloque.split('\n').slice(1).map(l => l.trim()).filter(l => l && !/^--seco/.test(l));

/* (2) lo que YA tiene mascara */
const mapa = fs.readFileSync(path.join(ROOT, 'app/glyphs/exercise-masks.js'), 'utf8');
const cuerpo = mapa.slice(mapa.indexOf('const EXERCISE_MASKS = {'), mapa.indexOf('};', mapa.indexOf('const EXERCISE_MASKS = {')));
const conMascara = [...cuerpo.matchAll(/'([^']+)':\s*'app/g)].map(m => m[1]);

/* (3) el encargo: grupo + «hoy» + que debe mostrar */
const enc = fs.readFileSync(path.join(ROOT, 'docs/product/GLIFOS_EJERCICIOS_REDISENO.md'), 'utf8');
const info = new Map(); let grupoAct = null;
for (const linea of enc.split('\n')) {
  const g = linea.match(/^### (.+?) \(\d+/);
  if (g) { grupoAct = g[1]; continue; }
  const f = linea.match(/^\| \*{0,2}([^|*]+?)\*{0,2} \| ([^|]+?) \| ([^|]+?) \|\s*$/);
  if (f && grupoAct && !/^Ejercicio/.test(f[1].trim())) {
    info.set(f[1].trim(), { grupo: grupoAct, hoy: f[2].trim().replace(/\*/g, ''), que: f[3].trim() });
  }
}

const slug = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const todas = sinDibujo;                       // la carpeta vacia => censo completo
const pendientes = todas.filter(id => !conMascara.includes(id));
const porGrupo = new Map();
for (const id of todas) {
  const i = info.get(id) || { grupo: 'Sin grupo en el encargo', hoy: '?', que: '—' };
  if (!porGrupo.has(i.grupo)) porGrupo.set(i.grupo, []);
  porGrupo.get(i.grupo).push({ id, ...i, tiene: conMascara.includes(id) });
}
const orden = ['Empuje y tracción', 'Piernas', 'Core y espalda', 'Cuello y hombros',
  'Columna', 'Caderas', 'Suelo y cadena posterior', 'Muñecas, tobillos y pausas'];
const grupos = [...porGrupo.keys()].sort((a, b) => {
  const ia = orden.indexOf(a), ib = orden.indexOf(b);
  return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
});

const L = [];
L.push('# Glifos de ejercicio · lo que falta por dibujar');
L.push('');
L.push('> **Generado**, no escrito a mano (`s170`). Sale de cruzar las identidades');
L.push('> visuales que la app pide HOY con el mapa de máscaras real y con el encargo');
L.push('> [`GLIFOS_EJERCICIOS_REDISENO.md`](GLIFOS_EJERCICIOS_REDISENO.md), que sigue');
L.push('> siendo el documento que manda sobre **cómo** se dibujan.');
L.push('');
L.push('| | |');
L.push('|---|---|');
L.push('| **Identidades que la app necesita** | **' + todas.length + '** |');
L.push('| **Con arte propio ya ingestado** | **' + conMascara.length + '** |');
L.push('| **Pendientes** | **' + pendientes.length + '** |');
L.push('');
L.push('«Hoy» es lo que dice el encargo: `dibujado` = hay un SVG heredado que se');
L.push('sigue pintando mientras no llegue el arte nuevo; `falta` = hoy no hay nada y');
L.push('se pinta el glifo por defecto. **Las dos columnas son trabajo pendiente**: el');
L.push('rediseño rehace las 61 piezas, y `falta` solo dice cuáles además están calvas.');
L.push('');
L.push('El **nombre de archivo** es el que espera la ingesta. Si no coincide, la pieza');
L.push('no se empareja y el script lo dice en vez de adivinar.');
L.push('');
for (const g of grupos) {
  const filas = porGrupo.get(g).sort((a, b) => a.id.localeCompare(b.id, 'es'));
  const faltan = filas.filter(f => !f.tiene).length;
  L.push('## ' + g + ' — ' + faltan + ' pendiente' + (faltan === 1 ? '' : 's') + ' de ' + filas.length);
  L.push('');
  L.push('| Estado | Ejercicio | Archivo | Hoy | Qué debe mostrar |');
  L.push('|---|---|---|---|---|');
  for (const f of filas) {
    L.push('| ' + (f.tiene ? '**HECHO**' : '—') + ' | ' + f.id + ' | `' + slug(f.id) + '.png` | ' +
      f.hoy + ' | ' + f.que + ' |');
  }
  L.push('');
}
L.push('---');
L.push('');
L.push('## Cómo entran');
L.push('');
L.push('```bash');
L.push('node scripts/ingest-glifos-ejercicio.js --origen "<carpeta con los PNG>"');
L.push('```');
L.push('');
L.push('Convierte cada PNG en máscara CSS, reescribe el mapa y las filas de precache');
L.push('de `sw.js`. **No hace falta que lleguen los 61 de golpe**: lo que no tiene');
L.push('máscara sigue pintando su SVG. Sale con código 1 si algún PNG no casa con');
L.push('ninguna identidad o si queda alguna sin dibujo — un emparejamiento parcial en');
L.push('silencio es justo lo que la regla D-4 quiere evitar.');
L.push('');
L.push('Tres palancas para arte anatómico (s170), inertes sobre línea negra encuadrada:');
L.push('`--recorte <n>` (0 = no recortar) · `--gamma <n>` (1 = lineal) · `--con-rojo`.');
L.push('');
L.push('Tras ingestar: `node build-standalone.js` · `npm run verify` · `npm run test:e2e`,');
L.push('y **subir a mano** el censo `precache` de `scripts/verify.integridad.js`.');
L.push('');
fs.writeFileSync(path.join(ROOT, 'docs/product/GLIFOS_EJERCICIOS_PENDIENTES.md'), L.join('\n'));
console.log('identidades ' + todas.length + ' · con arte ' + conMascara.length + ' · pendientes ' + pendientes.length);
if (todas.length !== conMascara.length + pendientes.length) { console.error('CENSO INCOHERENTE'); process.exit(1); }
console.log('grupos: ' + grupos.join(' | '));
const huerfanas = todas.filter(id => !info.has(id));
console.log('SIN FILA EN EL ENCARGO (' + huerfanas.length + '): ' + (huerfanas.join(', ') || 'ninguna'));
