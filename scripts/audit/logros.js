/* logros.js — banco de medicion de la CURVA de logros (Fase 2.5, mitad 2).
   Responde con cifras, no a ojo, a tres preguntas:

     1. que umbral REAL tiene hoy cada uno de los 106 logros
     2. cuantos se ganan en la primera sesion / el primer dia / la primera semana
     3. cuales NO los alcanza nadie nunca, y por que motivo exacto

   Dos mitades independientes:

   A. INVENTARIO ESTATICO — escanea los `unlockAchievement('<id>')` del arbol y
      captura la guarda numerica que los envuelve. Es la fuente del umbral: la
      lista `IMPLEMENTED_ACHIEVEMENTS` del catalogo es una DECLARACION, no una
      prueba, y cruzarlas destapa las dos incoherencias posibles (declarado sin
      detector / con detector sin declarar).

   B. SIMULACION — carga los modulos de estado REALES sobre un `window` falso
      con reloj controlable y juega escenarios de uso. Nada de estimar: se
      cuenta lo que el codigo desbloquea de verdad.

   uso: node scripts/audit/logros.js            (informe legible)
        node scripts/audit/logros.js --json     (datos crudos)
*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const babel = require(path.join(ROOT, 'node_modules', '@babel', 'core'));

/* ============================================================
   A. INVENTARIO ESTATICO — de donde sale cada umbral
   ============================================================ */

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(jsx|js)$/.test(e.name)) out.push(p);
  }
  return out;
}

/* La guarda de un logro puede estar en la MISMA linea (`if (x >= 10) unlock(...)`)
   o unas lineas arriba (bloque `if` con varias sentencias). Se capturan las 6
   lineas previas y se extrae de ahi la comparacion numerica mas cercana. */
function guardaDe(lineas, idx) {
  const ventana = lineas.slice(Math.max(0, idx - 6), idx + 1);
  const texto = ventana.join(' ');
  const comps = [...texto.matchAll(/([\w.$[\]()]+)\s*(>=|>|===|==|<)\s*(\d+)/g)];
  if (!comps.length) return null;
  const c = comps[comps.length - 1];
  return { expr: c[0].trim(), campo: c[1], op: c[2], valor: Number(c[3]) };
}

function inventarioEstatico() {
  const files = walk(path.join(ROOT, 'app'), []);
  const sitios = {};
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const lineas = src.split('\n');
    lineas.forEach((l, i) => {
      /* solo llamadas con id literal; el `explorationMap[routineId]` se anota aparte */
      const m = [...l.matchAll(/unlockAchievement\(\s*'([^']+)'/g)];
      for (const mm of m) {
        const id = mm[1];
        (sitios[id] = sitios[id] || []).push({
          file: path.relative(ROOT, f).replace(/\\/g, '/'),
          linea: i + 1,
          guarda: guardaDe(lineas, i),
          texto: l.trim().slice(0, 120),
        });
      }
    });
  }
  /* desbloqueos por MAPA (id calculado): explorationMap / exploreMap */
  const porMapa = {};
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const bloques = src.match(/(?:explorationMap|exploreMap)\s*=\s*\{[\s\S]*?\}/g) || [];
    for (const b of bloques) {
      for (const mm of b.matchAll(/'([^']+)'\s*:\s*'(explore\.[^']+)'/g)) {
        (porMapa[mm[2]] = porMapa[mm[2]] || []).push(mm[1]);
      }
    }
  }
  /* Tercera via: ids que se desbloquean desde una TABLA recorrida en bucle
     (`FECHAS_SENALADAS`, donde el id es la CLAVE). No hay llamada literal, asi
     que el escaneo de arriba los daba por inexistentes y acusaba de fantasma a
     detectores que si funcionan. Regla: el id aparece entrecomillado en un
     archivo que ademas llama a unlockAchievement. `catalog.js` queda fuera solo
     -- contiene todos los ids y no desbloquea ninguno. */
  const porTabla = {};
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    if (!/unlockAchievement\s*\(/.test(src)) continue;
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    for (const mm of src.matchAll(/'((?:first|streak|focus|breathe|move|hydrate|morning|explore|master|secret|stats|season)\.[\w.]+)'/g)) {
      const id = mm[1];
      if ((sitios[id] || []).length) continue;
      if (!porTabla[id]) porTabla[id] = [];
      if (!porTabla[id].includes(rel)) porTabla[id].push(rel);
    }
  }

  return { sitios, porMapa, porTabla };
}

/* ============================================================
   B. SIMULACION — reloj controlable + modulos de estado reales
   ============================================================ */

function nuevoSandbox() {
  const RealDate = Date;
  let NOW = new RealDate(2026, 0, 5, 10, 0, 0).getTime(); // lunes 5-ene-2026, 10:00

  class FakeDate extends RealDate {
    constructor(...args) { super(...(args.length ? args : [NOW])); }
    static now() { return NOW; }
  }
  const reloj = {
    fijar(ms) { NOW = ms; },
    hora(h, m) { const d = new RealDate(NOW); d.setHours(h, m || 0, 0, 0); NOW = d.getTime(); },
    masDias(n) { NOW += n * 86400000; },
    get ahora() { return new RealDate(NOW); },
  };

  const store = {};
  const localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  };

  /* React de mentira: los modulos de estado solo usan useSyncExternalStore en
     `usePace`, que la simulacion no llama. */
  const React = new Proxy({
    createElement: () => ({}), Fragment: 'F', memo: f => f,
    useSyncExternalStore: (sub, get) => get(),
  }, { get: (t, k) => (k in t ? t[k] : () => {}) });

  const toasts = [];
  const el = () => ({ style: {}, setAttribute() {}, appendChild() {}, classList: { add() {}, remove() {} } });
  const sandbox = {
    React, console, JSON, Math, Date: FakeDate, Object, Array, String, Number,
    Boolean, RegExp, Set, Map, Promise, parseInt, parseFloat, isNaN, isFinite,
    localStorage, setTimeout: () => 0, clearTimeout: () => {},
    setInterval: () => 0, clearInterval: () => {},
    navigator: { language: 'es-ES', languages: ['es-ES'] },
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    document: {
      documentElement: el(), head: el(), body: el(),
      createElement: el, getElementById: () => null, querySelector: () => null,
      querySelectorAll: () => [], addEventListener() {}, removeEventListener() {},
    },
    addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
    CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.__toasts = toasts;
  vm.createContext(sandbox);
  return { sandbox, reloj, toasts, store };
}

const FILES_ESTADO = [
  'app/glyphs/achievement-glyphs.jsx',
  'app/achievements/catalog.js',
  'app/paths/registry.js',
  'app/move/move.data.js',
  'app/extra/ExtraModule.jsx',
  'app/state-history.jsx',
  'app/state-core.jsx',
  'app/state-achievements.support.jsx',
  'app/state-achievements.jsx',
  'app/state-timer.jsx',
  'app/state-hydrate.jsx',
  'app/state-paths.jsx',
];

/* Cada modulo se envuelve en un IIFE, igual que hace el build de Etapa A: dos
   modulos declaran `const GLYPH_SVG` en su nivel superior y compartir entorno
   lexico da "already declared". Los cruces entre modulos siguen resolviendo
   porque todos re-exponen con `Object.assign(window, {...})`. */
function cargar(sandbox) {
  for (const f of FILES_ESTADO) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const out = babel.transformSync(src, {
      presets: [[require(path.join(ROOT, 'node_modules', '@babel', 'preset-react')), {}]],
      filename: f, configFile: false, babelrc: false,
    }).code;
    /* ...y al cerrar el IIFE se re-exponen los nombres de nivel superior. Hace
       falta porque los modulos NO exportan todo lo que se llaman entre si:
       `state-timer` invoca `checkTimeOfDayAchievements`, que `state-achievements`
       nunca pone en su `Object.assign`. En la app real llega por ser una
       declaracion de funcion de un script clasico; aqui hay que reponerlo. */
    const nombres = [...out.matchAll(/^(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/gm)]
      .map(m => m[1]);
    const reexpone = [...new Set(nombres)]
      .map(n => `try { window.${n} = ${n}; } catch (e) {}`).join('\n');
    try { vm.runInContext('(function(){\n' + out + '\n' + reexpone + '\n})();', sandbox, { filename: f }); }
    catch (e) { console.error('[aviso] ' + f + ': ' + e.message); }
  }
  /* engancha showToast para CONTAR avisos sin tocar el codigo de produccion */
  vm.runInContext(`
    (function () {
      var orig = showToast;
      showToast = function (t) { __toasts.push(t); return orig(t); };
      window.showToast = showToast;
    })();
  `, sandbox);
}

const ejec = (sandbox, expr) => vm.runInContext(expr, sandbox);
const logros = sandbox => Object.keys(ejec(sandbox, 'getState().achievements'));

/* ---- escenarios ---- */

function nuevoJuego() {
  const ctx = nuevoSandbox();
  cargar(ctx.sandbox);
  return ctx;
}

/* Un dia de uso "completo y honesto": 4 pomodoros, una respiracion, una
   movilidad, una calistenia y los 8 vasos. Es el techo realista de un dia. */
function diaCompleto(sandbox, reloj, { horaInicio = 10 } = {}) {
  reloj.hora(horaInicio);
  for (let i = 0; i < 4; i++) ejec(sandbox, 'completePomodoro()');
  ejec(sandbox, "completeBreathSession('breathe.box.4', 5)");
  ejec(sandbox, "completeMoveSession('move.hips.5', 5)");
  ejec(sandbox, "completeExtraSession('move.desk.quick', 5)");
  for (let i = 0; i < 8; i++) ejec(sandbox, 'addWaterGlass(1)');
}

function escenarios() {
  const out = {};

  /* A — PRIMERA sesion de la vida, temprano (el caso que reporto el usuario) */
  {
    const { sandbox, reloj, toasts } = nuevoJuego();
    reloj.hora(6, 50);
    ejec(sandbox, "completeBreathSession('breathe.box.4', 5)");
    out.primeraSesion = {
      ganados: logros(sandbox), avisados: toasts.length,
      enCola: ejec(sandbox, '(getState().achievementQueue||[]).length'),
    };
  }

  /* B — PRIMER DIA completo */
  {
    const { sandbox, reloj, toasts } = nuevoJuego();
    diaCompleto(sandbox, reloj, { horaInicio: 6 });
    out.primerDia = { ganados: logros(sandbox), avisados: toasts.length };
  }

  /* C/D/E — N dias seguidos de uso completo */
  for (const [clave, dias] of [['semana1', 7], ['dias30', 30], ['anio', 365]]) {
    const { sandbox, reloj, toasts } = nuevoJuego();
    for (let d = 0; d < dias; d++) {
      diaCompleto(sandbox, reloj, { horaInicio: 6 });
      reloj.masDias(1);
    }
    out[clave] = { dias, ganados: logros(sandbox), avisados: toasts.length };
  }

  /* F — AÑO EXHAUSTIVO: todo lo anterior + todas las rutinas de respiracion y
     movilidad que tienen detector, para ver el techo absoluto del catalogo. */
  {
    const { sandbox, reloj, toasts } = nuevoJuego();
    const respiras = ['breathe.box.4', 'breathe.box.6', 'breathe.478',
      'breathe.coherent.55', 'breathe.coherent.66', 'breathe.rounds.full',
      'breathe.rounds.express', 'breathe.bellows', 'breathe.nadi.shodhana',
      'breathe.ujjayi', 'breathe.kapalabhati', 'breathe.physiological'];
    const extras = ['move.hips.5', 'move.shoulders.5', 'move.atg.knees',
      'move.ancestral', 'move.neck.3', 'move.desk.quick'];
    for (let d = 0; d < 365; d++) {
      reloj.hora(6, 30);
      /* pomodoros de 45 min y 8 al dia: cubre master.long.focus (>=45 de una
         sentada) y master.focus.day (>=240 min en el dia), que con el preset
         de 25 se quedaban fuera y parecian inalcanzables sin serlo.
         OJO: `completePomodoro` toma la duracion de `state.focusMinutes`, no
         de un argumento — llamar ademas a `addFocusMinutes` contaria doble. */
      ejec(sandbox, 'setState({ focusMinutes: 45 })');
      for (let i = 0; i < 8; i++) ejec(sandbox, 'completePomodoro()');
      for (const r of respiras) ejec(sandbox, `completeBreathSession('${r}', 10)`);
      for (const r of extras) ejec(sandbox, `completeExtraSession('${r}', 10)`);
      ejec(sandbox, "completeMoveSession('move.custom', 10)");
      reloj.hora(21, 30);
      ejec(sandbox, "completeBreathSession('breathe.box.4', 5)");
      for (let i = 0; i < 8; i++) ejec(sandbox, 'addWaterGlass(1)');
      reloj.masDias(1);
    }
    out.anioExhaustivo = { ganados: logros(sandbox), avisados: toasts.length };
  }

  return out;
}

/* ============================================================
   INFORME
   ============================================================ */

function main() {
  const { sitios, porMapa, porTabla } = inventarioEstatico();

  const { sandbox } = nuevoJuego();
  const catalogo = ejec(sandbox, 'ACHIEVEMENT_CATALOG');
  const implementados = ejec(sandbox, '[...IMPLEMENTED_ACHIEVEMENTS]');
  const setImpl = new Set(implementados);

  const esc = escenarios();
  const alcanzables = new Set(esc.anioExhaustivo.ganados);

  /* TECHO REAL del catalogo: solo pueden ganarse los que tienen detector. Es la
     cifra contra la que hay que juzgar los logros que cuentan OTROS logros. */
  const conDetectorIds = new Set(
    catalogo.filter(a => (sitios[a.id] || []).length || (porMapa[a.id] || []).length || (porTabla[a.id] || []).length).map(a => a.id)
  );
  const TECHO = conDetectorIds.size;

  /* Un detector que vive en un componente de UI no lo dispara la simulacion
     (no hay clicks): "no alcanzado" ahi significa "no simulado", NO imposible.
     Distinguirlo es la diferencia entre un dato y una calumnia al catalogo. */
  const esUI = f => f.sitios.some(s => !/^app\/state-/.test(s));

  const motivoInalcanzable = f => {
    if (!f.detector) return 'SIN DETECTOR';
    /* logros que cuentan logros: imposibles si su umbral supera el techo */
    if (/collector/.test(f.id) && f.umbralValor > TECHO) return 'IMPOSIBLE POR ARITMETICA';
    if (esUI(f)) return 'alcanzable por UI (no simulado)';
    return 'con detector, no alcanzado en la simulacion';
  };

  const filas = catalogo.map(a => {
    const s = sitios[a.id] || [];
    const mapa = porMapa[a.id] || [];
    const tabla = porTabla[a.id] || [];
    const g = s.map(x => x.guarda).filter(Boolean)[0] || null;
    return {
      id: a.id, cat: a.cat, title: a.title, desc: a.desc, secreto: !!a.secret,
      declarado: setImpl.has(a.id),
      detector: s.length > 0 || mapa.length > 0 || tabla.length > 0,
      sitios: s.length ? s.map(x => x.file + ':' + x.linea) : tabla,
      rutinasQueLoDan: mapa,
      umbral: g ? g.expr : (s.length || mapa.length ? '(sin guarda numerica)' : null),
      umbralValor: g ? g.valor : null,
      enPrimeraSesion: esc.primeraSesion.ganados.includes(a.id),
      enPrimerDia: esc.primerDia.ganados.includes(a.id),
      enSemana1: esc.semana1.ganados.includes(a.id),
      enDia30: esc.dias30.ganados.includes(a.id),
      enAnio: esc.anio.ganados.includes(a.id),
      alcanzable: alcanzables.has(a.id),
    };
  });
  for (const f of filas) f.motivo = f.alcanzable ? null : motivoInalcanzable(f);

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ escenarios: esc, filas }, null, 1));
    return;
  }

  const n = arr => String(arr.length).padStart(3);
  /* la version se LEE del arbol: escrita a mano se queda vieja y el informe
     acaba mintiendo sobre lo que ha medido */
  const VER = (fs.readFileSync(path.join(ROOT, 'app/state-core.jsx'), 'utf8')
    .match(/PACE_VERSION = '([^']+)'/) || [, '?'])[1];
  console.log('=== CURVA DE LOGROS · medicion sobre el arbol (' + VER + ') ===\n');
  console.log('catalogo: ' + catalogo.length + ' logros · declarados IMPLEMENTED: ' + implementados.length);
  console.log('con detector REAL en codigo: ' + filas.filter(f => f.detector).length);
  console.log('');
  console.log('--- INCOHERENCIAS declarado vs detector real ---');
  const declSinDet = filas.filter(f => f.declarado && !f.detector);
  const detSinDecl = filas.filter(f => !f.declarado && f.detector && !f.secreto);
  console.log('declarados SIN detector: ' + declSinDet.length + (declSinDet.length ? ' -> ' + declSinDet.map(f => f.id).join(', ') : ''));
  console.log('con detector SIN declarar (se pintan "Pronto" pero se desbloquean): ' + detSinDecl.length + (detSinDecl.length ? ' -> ' + detSinDecl.map(f => f.id).join(', ') : ''));
  console.log('');
  console.log('--- CUANTOS SE GANAN, MEDIDO ---');
  console.log('primera sesion (Respira 6:50)      ganados ' + n(esc.primeraSesion.ganados) + ' · avisados ' + esc.primeraSesion.avisados + ' · en cola ' + esc.primeraSesion.enCola);
  console.log('primer dia completo                ganados ' + n(esc.primerDia.ganados) + ' · avisados ' + esc.primerDia.avisados);
  console.log('7 dias seguidos                    ganados ' + n(esc.semana1.ganados));
  console.log('30 dias seguidos                   ganados ' + n(esc.dias30.ganados));
  console.log('365 dias seguidos                  ganados ' + n(esc.anio.ganados));
  console.log('365 dias EXHAUSTIVOS (techo real)  ganados ' + n(esc.anioExhaustivo.ganados) + '  de ' + catalogo.length);
  console.log('');
  console.log('--- TRIVIALES: se ganan el PRIMER DIA (' + filas.filter(f => f.enPrimerDia).length + ') ---');
  for (const f of filas.filter(f => f.enPrimerDia)) {
    console.log('  ' + (f.enPrimeraSesion ? '[1a SESION] ' : '            ') + f.id.padEnd(26) + ' ' + (f.umbral || ''));
  }
  console.log('');
  console.log('--- TECHO DEL CATALOGO ---');
  console.log('  con detector = ' + TECHO + ' de ' + catalogo.length +
    '  => ' + (catalogo.length - TECHO) + ' no los puede ganar NADIE hoy (' +
    Math.round((catalogo.length - TECHO) * 100 / catalogo.length) + ' %)');
  console.log('');
  console.log('--- NO ALCANZADOS en el año exhaustivo, POR MOTIVO ---');
  const noAlc = filas.filter(f => !f.alcanzable);
  const porMotivo = {};
  for (const f of noAlc) (porMotivo[f.motivo] = porMotivo[f.motivo] || []).push(f);
  for (const [motivo, lista] of Object.entries(porMotivo)) {
    console.log('  [' + motivo + '] ' + lista.length);
    for (const f of lista) {
      console.log('       ' + (f.secreto ? 'secreto ' : '        ') + f.id.padEnd(26) +
        (f.umbral ? f.umbral : f.desc));
    }
  }
  console.log('');
  console.log('--- REPARTO TEMPORAL (uso diario constante) ---');
  const tramos = [
    ['dia 1', f => f.enPrimerDia],
    ['dias 2-7', f => f.enSemana1 && !f.enPrimerDia],
    ['dias 8-30', f => f.enDia30 && !f.enSemana1],
    ['dias 31-365', f => f.enAnio && !f.enDia30],
  ];
  const totalAnio = filas.filter(f => f.enAnio).length;
  for (const [nombre, test] of tramos) {
    const l = filas.filter(test);
    console.log('  ' + nombre.padEnd(12) + String(l.length).padStart(3) + ' logros  (' +
      String(Math.round(l.length * 100 / totalAnio)).padStart(2) + ' % de todo lo que da un año)   ' +
      l.map(f => f.id).join(', '));
  }
  console.log('  ' + 'TOTAL año'.padEnd(12) + String(totalAnio).padStart(3) +
    ' logros de ' + catalogo.length + ' del catalogo');
  console.log('');

  console.log('--- «UNA SOLA VEZ» vs REPETICION, por categoria ---');
  const cats = [...new Set(catalogo.map(a => a.cat))];
  for (const c of cats) {
    const enCat = filas.filter(f => f.cat === c && f.detector);
    const unaVez = enCat.filter(f => f.umbralValor === null || f.umbralValor <= 1);
    console.log('  ' + c.padEnd(14) + ' con detector ' + String(enCat.length).padStart(3) +
      ' · una sola vez ' + String(unaVez.length).padStart(3) +
      ' · con repeticion ' + String(enCat.length - unaVez.length).padStart(3));
  }
  const todosDet = filas.filter(f => f.detector);
  const todosUnaVez = todosDet.filter(f => f.umbralValor === null || f.umbralValor <= 1);
  console.log('  ' + 'TOTAL'.padEnd(14) + ' con detector ' + String(todosDet.length).padStart(3) +
    ' · una sola vez ' + String(todosUnaVez.length).padStart(3) +
    ' (' + Math.round(todosUnaVez.length * 100 / todosDet.length) + ' %)' +
    ' · con repeticion ' + String(todosDet.length - todosUnaVez.length).padStart(3));
  console.log('');

  console.log('--- SECRETOS: descubribles vs decorativos ---');
  const secretos = filas.filter(f => f.secreto);
  console.log('  ' + secretos.length + ' secretos · con detector ' +
    secretos.filter(f => f.detector).length + ' · SIN detector ' +
    secretos.filter(f => !f.detector).length +
    '  (los 2 grupos se pintan IGUAL: el usuario no puede distinguirlos)');
  console.log('');

  console.log('--- ESCALONES por umbral numerico ---');
  for (const f of filas.filter(f => f.umbralValor !== null).sort((a, b) => a.umbralValor - b.umbralValor)) {
    console.log('  ' + String(f.umbralValor).padStart(5) + '  ' + f.id.padEnd(26) + ' ' + f.umbral);
  }
}

main();
