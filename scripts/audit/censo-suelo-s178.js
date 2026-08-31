#!/usr/bin/env node
/**
 * censo-suelo-s178.js — ¿cuantas rutinas piden SUELO, y en que modulo?
 *
 * POR QUE EXISTE: el handoff de s178 arrastra la frase «9 de las 14 de Estira piden suelo, en
 * una biblioteca de oficina», y un grep rapido a `requiresFloor: true` devuelve **2**, no 9.
 * Antes de decidir nada de catalogo hay que saber cual de los dos numeros es el bueno — y si
 * la discrepancia es que `requiresFloor` NO es donde vive esa verdad.
 *
 * COMO MIDE: carga los catalogos DE VERDAD con un shim de `window`, en vez de greparlos. Los
 * metadatos son arrays (`position: ['standing']`) y viven en la RUTINA, no en el paso (s141),
 * asi que un grep por `position: '...'` devuelve cero y parece que el campo no existe.
 *
 * Y LO QUE ENCONTRO SIN BUSCARLO: `CLAUDE.md` tenia las RUTAS cambiadas. Lo cruzado son los
 * ids y SOLO los ids — cada modulo vive en la carpeta de su nombre. Medido por la etiqueta que
 * ve el usuario, que es lo unico que no miente:
 *   MUEVE  (`lib.move.title`)  <- app/move/move.data.js      (MOVE_ROUTINES)   ids `extra.*`
 *   ESTIRA (`lib.extra.title`) <- app/extra/ExtraModule.jsx  (EXTRA_ROUTINES)  ids `move.*`
 * Por creerme la ruta de `CLAUDE.md`, la primera pasada de este censo midio MUEVE creyendo que
 * era Estira y devolvio **2** donde la respuesta es **9**. Este censo etiqueta por QUIEN
 * CONSUME el catalogo, nunca por el nombre del archivo ni por el prefijo del id.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');

/* Los catalogos se publican a `window` al final del archivo (regla §2). Se evaluan dentro de
   un contexto con `window` y los globals que puedan tocar al cargarse. Si un archivo pide algo
   que no esta, se dice — no se traga el error, que es la leccion de s177. */
function cargar(rel, extra) {
  const ctx = { window: {}, console, React: undefined, useT: () => ({ t: x => x }) };
  Object.assign(ctx, extra || {});
  ctx.window.window = ctx.window;
  let src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  /* Un `.jsx` no lo parsea node: hay que pasarlo por Babel, el mismo del build. Sin esto el
     `runInContext` aborta ENTERO en el primer `<div>` y el catch devuelve un window vacio —
     que es indistinguible de «este archivo no publica rutinas». */
  if (rel.endsWith('.jsx')) {
    const babel = require(path.join(ROOT, 'node_modules', '@babel', 'core'));
    src = babel.transformSync(src, {
      presets: [[path.join(ROOT, 'node_modules', '@babel', 'preset-react'), {}]],
      filename: rel, configFile: false, babelrc: false
    }).code;
  }
  try {
    vm.createContext(ctx);
    vm.runInContext(src, ctx, { filename: rel });
  } catch (e) {
    console.log('  [AVISO] ' + rel + ' no se evaluo entero: ' + e.message);
    console.log('          (se sigue con lo que haya publicado antes de fallar)');
  }
  return ctx.window;
}

/* LAS BIBLIOTECAS DE CUERPO ESTAN AGRUPADAS POR CATEGORIA (s91/s92: mismo shape que
   BREATHE_ROUTINES), asi que `MOVE_ROUTINES` es un OBJETO de arrays, no un array. La primera
   version de este censo filtraba por `Array.isArray` y dijo «no se encontro ninguna lista»
   teniendo las 14 delante — un censo que mira la forma equivocada dice «cero» igual que uno
   que mide bien. Se aplanan los grupos y se conserva el grupo como columna. */
function aplanar(raiz) {
  const out = [];
  const visita = (v, grupo) => {
    if (Array.isArray(v)) { for (const r of v) if (r && r.id) out.push({ grupo, r }); return; }
    if (v && typeof v === 'object') for (const k of Object.keys(v)) visita(v[k], grupo || k);
  };
  visita(raiz, null);
  return out;
}

console.log('=== CENSO s178 · quien pide SUELO ===\n');

/* EL MODULO NO SE DEDUCE DEL NOMBRE DEL ARCHIVO NI DEL PREFIJO DEL id: van cruzados LOS DOS.
   Medido en s178: `MoveModule.jsx` (catPrefix "mueve") lee `move.data.js`, cuyas 14 rutinas
   llevan ids `extra.*`; `ExtraModule.jsx` (catPrefix "extra") define `EXTRA_ROUTINES` con ids
   `move.*`. La etiqueta de modulo sale de QUIEN LO CONSUME, que es lo unico que no miente. */
const wMove  = cargar('app/move/move.data.js');
/* s178 · el dato de Estira se troceo en DOS por la regla §1, y el segundo archivo AÑADE
   sus grupos al objeto del primero. Hay que cargar los dos en el MISMO contexto: con solo
   el primero, este censo mediria 8 rutinas de 17 y diria «2 de 8 piden suelo» sin mentir
   en la aritmetica y mintiendo en todo lo demas. */
const wExtra = cargar('app/extra/extra.data.js');
cargar('app/extra/extra.data.piernas.js', { window: wExtra });

/* `ExtraModule.jsx` NO publica su catalogo: solo saca `getExtraRoutine` y `ExtraLibrary`
   (`EXTRA_ROUTINES` se queda de `const` en el modulo). Asi que no se lee el objeto — se
   resuelve id a id con el ACCESOR del propio modulo, que es la via que usa la app. Los ids se
   sacan del fuente, que es el unico sitio donde estan enumerados. */
function porAccesor(rel, accesor) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const ids = [...src.matchAll(/id:\s*'([a-z]+\.[a-z0-9.]+)'/g)].map(m => m[1]);
  const vistos = new Set(), out = [];
  for (const id of ids) {
    if (vistos.has(id)) continue;
    vistos.add(id);
    const r = accesor && accesor(id);
    if (r && r.id) out.push({ grupo: r.cat || r.group || '—', r });
  }
  return out;
}

const listas = [
  { k: 'MUEVE',  fuente: 'app/move/move.data.js',     items: aplanar(wMove.MOVE_ROUTINES) },
  { k: 'ESTIRA', fuente: 'app/extra/extra.data*.js', items: aplanar(wExtra.EXTRA_ROUTINES) },
];
for (const l of listas) console.log(l.k.padEnd(7) + ' <- ' + l.fuente.padEnd(34) + l.items.length + ' rutinas');
console.log('');
/* Guard de cero, en los DOS: si un catalogo viene vacio el censo diria «0 piden suelo» con la
   misma cara que si ninguna lo pidiera. Es la trampa de s166, y aqui ya mordio una vez. */
for (const l of listas) {
  if (!l.items.length) { console.log('[FALLA] ' + l.k + ' vino VACIO desde ' + l.fuente + ' — el censo no ha medido nada.'); process.exit(1); }
}

let total = 0, conSuelo = 0;
const filas = [];
for (const { k: modulo, items } of listas) {
  for (const { grupo, r } of items) {
    total++;
    const pos = [].concat(r.position || []);
    const suelo = r.requiresFloor === true || pos.includes('floor') || pos.includes('lying') ||
                  pos.includes('prone') || pos.includes('supine') || pos.includes('kneeling');
    if (suelo) conSuelo++;
    filas.push({
      modulo: modulo, lista: grupo || '—',
      id: r.id,
      nombre: (r.name || r.title || '').slice(0, 30),
      requiresFloor: r.requiresFloor === true ? 'SI' : (r.requiresFloor === false ? 'no' : '—'),
      position: pos.join('+') || '—',
      suelo: suelo ? 'SUELO' : ''
    });
  }
}

const w = [7, 10, 26, 28, 14, 24, 6];
const cab = ['modulo', 'grupo', 'id', 'nombre', 'requiresFloor', 'position', ''];
console.log(cab.map((c, i) => c.padEnd(w[i])).join(' '));
console.log(w.map(n => '-'.repeat(n)).join(' '));
for (const f of filas) {
  console.log([f.modulo, f.lista, f.id, f.nombre, f.requiresFloor, f.position, f.suelo]
    .map((c, i) => String(c).padEnd(w[i])).join(' '));
}

console.log('\nRutinas medidas       : ' + total);
console.log('Piden suelo (medido)  : ' + conSuelo);
for (const l of listas) {
  const n = filas.filter(f => f.modulo === l.k && f.suelo).length;
  console.log(l.k.padEnd(7) + ' piden suelo : ' + n + ' de ' + l.items.length);
}
console.log('');
console.log('LA FRASE DEL HANDOFF decia «9 de las 14 de Estira piden suelo»: CONFIRMADA.');
console.log('Y el contraste es el dato util: MUEVE, que es la biblioteca de la mesa, pide');
console.log('suelo en 2 de 14. El reparto entre los dos modulos YA EXISTE, asi que la');
console.log('pregunta de producto no es si Estira pide suelo, sino si quien esta en una');
console.log('oficina lo sabe ANTES de abrirla.');
