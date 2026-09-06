/* PACE · CENSO DE ADAPTACION (s186)
 * =================================
 * Antes de prometer «cambia el ejercicio que no puedas hacer», hay que saber si el catalogo
 * puede responder a esa pregunta. Un sustituto no es «otro ejercicio cualquiera»: tiene que
 * caber donde estas (misma posicion, sin suelo si no hay suelo), pedir lo mismo (equipo) y
 * pesar parecido (intensidad). Esos cinco datos existen desde s115 y `move.data.js` dice de
 * ellos, con esas palabras, «metadatos sin consumidor UI».
 *
 * LA MEDIDA QUE IMPORTA ES A QUE OBJETO ESTAN PEGADOS. La primera version de este censo los
 * busco en el PASO y devolvio «0 de 87», que parecia un catalogo vacio de metadatos. Estan en
 * la RUTINA: ella declara «sentado, sin suelo, suave» y el ejercicio concreto no declara nada.
 * Es la misma clase de error que dejo ciego a Estira en s178 -- medir el objeto equivocado y
 * creerse el numero.
 *
 * TAMBIEN CUENTA EL DESCANSO: cuantos pasos son `rest` y cuantos llevan `restKind`, porque
 * «alargar o saltar el descanso» solo puede tocar los descansos ENTRE SERIES (s114) y nunca
 * los cierres respiratorios, que no van tipados.
 *
 * COMO CARGA: con el shim de `window` de `censo-suelo-s178.js`, evaluando los catalogos DE
 * VERDAD en vez de greparlos. `extra.data.js` va ANTES que el de piernas, que lleva un guard
 * y aborta si se evalua al reves.
 *
 * Uso: node scripts/audit/censo-adaptacion-s186.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');

function cargar(rel, ctxPrevio) {
  /* Se puede REUTILIZAR un contexto: `extra.data.piernas.js` amplia el objeto que publico
     `extra.data.js` y lleva un guard que aborta si no lo encuentra en `window`. Cargarlos en
     contextos distintos es exactamente lo que hace saltar ese guard. */
  const ctx = ctxPrevio || { window: {}, console, React: undefined, useT: () => ({ t: x => x }) };
  ctx.window.window = ctx.window;
  let src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  if (rel.endsWith('.jsx')) {
    const babel = require(path.join(ROOT, 'node_modules', '@babel', 'core'));
    src = babel.transformSync(src, {
      presets: [[path.join(ROOT, 'node_modules', '@babel', 'preset-react'), {}]],
      filename: rel, configFile: false, babelrc: false,
    }).code;
  }
  try {
    vm.createContext(ctx);
    vm.runInContext(src, ctx, { filename: rel });
  } catch (e) {
    console.log('  [AVISO] ' + rel + ' no se evaluo entero: ' + e.message);
  }
  return ctx;
}

const cMove = cargar('app/move/move.data.js');
const cExtra = cargar('app/extra/extra.data.js');
cargar('app/extra/extra.data.piernas.js', cExtra);

/* Uno publica un `var` top-level y el otro escribe en `window`: se buscan los dos sitios, que
   es mas barato que recordar cual hace cual. */
const de = (ctx, nombre) => ctx[nombre] || (ctx.window && ctx.window[nombre]) || null;

const MODULOS = [
  { nombre: 'Mueve', grupos: de(cMove, 'MOVE_ROUTINES') },
  { nombre: 'Estira', grupos: de(cExtra, 'EXTRA_ROUTINES') },
];

const META = ['position', 'equipment', 'requiresFloor', 'intensity', 'level'];

function rutinasDe(grupos) {
  const out = [];
  if (!grupos) return out;
  const listas = Array.isArray(grupos) ? [{ items: grupos }] : Object.values(grupos);
  for (const g of listas) for (const r of (g.items || [])) out.push(r);
  return out;
}

console.log('\n=== CENSO DE ADAPTACION · s186 ===\n');

let totalRutinas = 0, totalPasos = 0, totalTrabajo = 0;
let rutinasCompletas = 0, pasosConMeta = 0;
let rest = 0, restEntreSeries = 0, restOtro = 0;
const faltaPorCampo = {};
META.forEach(k => { faltaPorCampo[k] = 0; });
const porPosicion = {};

for (const m of MODULOS) {
  const rutinas = rutinasDe(m.grupos);
  if (!rutinas.length) { console.log('  [AVISO] ' + m.nombre + ': 0 rutinas leidas'); continue; }
  let completas = 0, pasos = 0, trabajo = 0;

  for (const r of rutinas) {
    totalRutinas++;
    let faltan = 0;
    for (const k of META) {
      if (r[k] === undefined || r[k] === null) { faltaPorCampo[k]++; faltan++; }
    }
    if (!faltan) { completas++; rutinasCompletas++; }
    const pos = Array.isArray(r.position) ? r.position.join(' + ') : (r.position || '(sin declarar)');
    porPosicion[pos] = (porPosicion[pos] || 0) + 1;

    for (const s of (r.steps || [])) {
      pasos++; totalPasos++;
      if (s.mode === 'rest') {
        rest++;
        if (s.restKind === 'betweenSets') restEntreSeries++; else restOtro++;
        continue;
      }
      trabajo++; totalTrabajo++;
      let faltanPaso = 0;
      for (const k of META) if (s[k] === undefined || s[k] === null) faltanPaso++;
      if (!faltanPaso) pasosConMeta++;
    }
  }

  const pc = Math.round(completas / rutinas.length * 100);
  console.log('  ' + m.nombre.padEnd(7) + String(rutinas.length).padStart(3) + ' rutinas · ' +
              String(pasos).padStart(3) + ' pasos (' + String(trabajo).padStart(3) + ' de trabajo) · ' +
              String(completas).padStart(3) + ' rutinas con los cinco metadatos (' + pc + ' %)');
}

console.log('\n  --- lo que falta, campo a campo (sobre ' + totalRutinas + ' RUTINAS) ---');
for (const k of META) {
  const n = faltaPorCampo[k];
  console.log('    ' + k.padEnd(14) + ' sin declarar en ' + String(n).padStart(3) +
              ' (' + Math.round(n / Math.max(1, totalRutinas) * 100) + ' %)');
}

console.log('\n  --- posiciones declaradas (el eje que decide si un sustituto CABE) ---');
Object.keys(porPosicion).sort((a, b) => porPosicion[b] - porPosicion[a])
  .forEach(k => console.log('    ' + String(porPosicion[k]).padStart(3) + '  ' + k));

console.log('\n  --- descansos ---');
console.log('    ' + rest + ' pasos de descanso · ' + restEntreSeries + ' ENTRE SERIES (`restKind`) · ' +
            restOtro + ' sin tipar (cierres respiratorios: no se tocan)');

console.log('\n  --- veredicto ---');
console.log('    Rutinas con los cinco metadatos: ' + rutinasCompletas + ' de ' + totalRutinas);
console.log('    Pasos   con los cinco metadatos: ' + pasosConMeta + ' de ' + totalTrabajo);
if (pasosConMeta === 0) {
  console.log('');
  console.log('    CAMBIAR UN EJERCICIO CONCRETO no se puede decidir con datos: la posicion, el');
  console.log('    equipo y la intensidad los declara la RUTINA, no el ejercicio. Ofrecer un');
  console.log('    sustituto con criterio exigiria anotar los ' + totalTrabajo + ' ejercicios, y eso es');
  console.log('    trabajo de CONTENIDO, no de codigo.');
  console.log('');
  console.log('    Lo que SI se puede hoy, sin un dato nuevo: SALTAR el ejercicio y seguir.');
}
console.log('');
