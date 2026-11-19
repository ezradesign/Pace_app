'use strict';
/* PACE · verify.plurales.js — NINGÚN «1 LOGROS» NI «1 DAYS»
   ============================================================
   `tn` (app/i18n/useT.jsx) solo sustituye {huecos}: no sabe de plurales. El singular es una
   clave hermana que el código elige con la cifra en la mano, como
   `tn(n === 1 ? 'sidebar.week.rhythm.one' : 'sidebar.week.rhythm', { n })`. Este barrido
   mira cada clave cuyo texto, en español o en inglés, pone una cifra delante de una palabra
   en plural («{n} días», «{logros} achievements») y exige una de dos cosas:

   1. que tenga su singular (la misma clave con .uno, .una, .one o .1 detrás, o en lugar de
      .n / .many, o antes del último trozo, como 'sidebar.week.rhythm.one.sin'), y que el
      archivo que nombra la clave del plural nombre también la del singular: un singular
      que nadie elige no arregla nada;
   2. o que esté abajo, en SIN_SINGULAR, con el motivo por el que esa cifra nunca vale 1.

   Una clave nueva con cifra y sin singular no pasa: hay que darle su singular o escribir su
   motivo. Y un motivo que ya no hace falta (la clave cambió o se fue) también falla, para
   que la lista no envejezca. */

var fs = require('fs');
var path = require('path');
var sandbox = require('./verify.sandbox.js');

/* Una cifra delante de una palabra de dos letras o más que acaba en s. La «s» sola de los
   segundos («{s} s») y «min» no cuentan: no cambian con el número. */
var PLURAL = /\{(\w+)\}\s+([\p{L}]{2,})/gu;
var SUFIJOS = ['uno', 'una', 'one', '1'];

var SIN_SINGULAR = {
  'premium.compra.pendiente': '{tienda} es Google o Apple, nunca una cifra (PremiumPendiente, ui/PremiumInvitacion.tienda.jsx)',
  'ach.toast.varios': 'solo con dos sellos o más a la vez: con uno dice «Nuevo sello» (selloTextos, ui/Toast.jsx)',
  'premium.fin.sobre.mas': 'solo con más de tres rutinas, y nombra dos: {n} empieza en 2 (premiumFinLista, ui/PremiumFinPrueba.jsx)',
  'settings.copia.hace': 'con 0 dice «hoy» y con 1 «ayer» (TweaksData.copia.jsx): «hace» siempre va de 2 días en adelante',
  'sidebar.streak.best': 'sin uso: ninguna pantalla la lee',
  'sidebar.agua.meta.x': 'la meta de agua va de 4 a 12 (Ajustes, TweaksPanel.jsx)',
  'stats.hoy.vasos.de': 'la meta de agua va de 4 a 12',
  'ritmo.vasos': 'la meta de agua va de 4 a 12 (ritmoMetaVasos, 8 si no hay)',
  'focus.minutes.n': 'los minutos de un Foco empiezan en FOCO_MINIMO (5)',
  'break.prop.sitting': '35 min o más, o lo que suman Focos de 5 min o más',
  'stats.ayuda.hora.todos': '{m} son los minutos de un Foco, y {n} pasa de AYUDA_HORA_FOCOS (12)',
  'stats.ayuda.hora.casi': '{m} son los minutos de un Foco (5 o más)',
  'stats.ayuda.hora.sobre': '{m} son los minutos de un Foco (5 o más)',
  'stats.ayuda.hora.fuente': 'la idea sale con AYUDA_HORA_FOCOS (12) o más',
  'stats.ayuda.tras.frase': 'la idea sale con AYUDA_TRAS_FOCOS (10) o más',
  'stats.ayuda.bien.fuente': 'la idea sale con dos rutinas de tres respuestas o más',
  'custom.limit': 'el tope de «Tus rutinas», 10',
  'custom.save.tope': 'el tope de «Tus rutinas», 10',
  'lib.journey.parts': 'los viajes de Respira tienen cinco tramos',
  'lib.series': 'librarySeries solo da 2 series o más, y las reps del catálogo empiezan en 5',
  'lib.series.cada': 'librarySeries solo da 2 ejercicios o más, de 2 series o más',
  'lib.rhythm.rounds': 'las rondas de Respira van de 2 a 5',
  'move.repsOf': 'las repeticiones del catálogo empiezan en 5',
  'paths.runner.complete.steps': 'un Camino tiene varios pasos (ocultos hasta después de v1)',
  'paths.suggested.guidedSteps': 'un Camino tiene varios pasos (ocultos hasta después de v1)',
  'premium.onb.precios': 'los días de prueba, 7',
  'premium.onb.probar': 'los días de prueba, 7',
  'premium.onb.abierto.precios': 'los días de prueba, 7',
  'premium.pasov1.mas': '«más» y «more» no son un plural',
  'ritmo.comida.lista': '{d} es una duración ya escrita («45 min»)',
  'ritmo.llevas.bloques': 'sin uso: ninguna pantalla la lee',
  'ritmo.llevas.pausas': 'sin uso: ninguna pantalla la lee',
  'ritmo.carta.descansa': 'tres veces o más (MOTOR_PRUEBAS), y en letra',
  'ritmo.carta.descansa.dos': 'tres veces o más (MOTOR_PRUEBAS), y en letra',
  'ritmo.carta.menos': 'tres veces o más (MOTOR_PRUEBAS)',
  'ritmo.carta.corta': 'tres días o más (MOTOR_PRUEBAS), y en letra',
  'ritmo.carta.corta.dos': 'tres días o más (MOTOR_PRUEBAS), y en letra',
  'ritmo.carta.inicio.dia': '{dias} son nombres de días («los lunes»)',
  'ritmo.carta.salida.dia': '{dias} son nombres de días («los lunes»)',
  'ritmo.aprendido.inicio': '{dias} son nombres de días («los lunes»)',
  'ritmo.aprendido.salida': '{dias} son nombres de días («los lunes»)',
  'ritmo.aprendido.descansa': '{rutina} es un nombre',
};

function esSingular(k) {
  var trozos = k.split('.');
  return trozos.some(function (t, i) { return i > 0 && SUFIJOS.indexOf(t) !== -1; });
}

/* Las claves que pueden ser el singular de `k`, de las que existen. */
function singulares(k, en) {
  var c = SUFIJOS.map(function (s) { return k + '.' + s; });
  var base = k.replace(/\.(n|many)$/, '');
  if (base !== k) c = c.concat(SUFIJOS.map(function (s) { return base + '.' + s; }));
  var i = k.lastIndexOf('.');
  c = c.concat(SUFIJOS.map(function (s) { return k.slice(0, i) + '.' + s + k.slice(i); }));
  return c.filter(function (x) { return x !== k && en[x] !== undefined; });
}

function recorrer(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (d) {
    var p = path.join(dir, d.name);
    if (d.isDirectory()) { if (d.name !== 'i18n') recorrer(p, out); }
    else if (/\.(js|jsx)$/.test(d.name)) out.push(p);
  });
  return out;
}

function nombra(src, k) {
  return src.indexOf("'" + k + "'") !== -1 || src.indexOf('"' + k + '"') !== -1 || src.indexOf('`' + k + '`') !== -1;
}

/* Lo que de verdad se barre, aparte para que la prueba lo pueda llamar con textos de mentira. */
function barre(S, fuentes) {
  var es = S.es || {}, en = S.en || {};
  var faltan = [], sinElegir = [], viejos = [], conSingular = 0, conMotivo = 0;
  var marcadas = {};
  Object.keys(en).forEach(function (k) {
    if (esSingular(k)) return;
    var hay = [es[k], en[k]].some(function (v) {
      if (typeof v !== 'string') return false;
      var m; PLURAL.lastIndex = 0;
      while ((m = PLURAL.exec(v))) if (/s$/i.test(m[2])) return true;
      return false;
    });
    if (!hay) return;
    marcadas[k] = true;
    var sing = singulares(k, en);
    if (sing.length) {
      conSingular++;
      /* Vale nombrar el singular entero o su cola, como `clave + '.1'` (statsAyudaSemanas). */
      var elige = function (src) {
        return sing.some(function (s) { return nombra(src, s) || (s.indexOf(k + '.') === 0 && nombra(src, s.slice(k.length))); });
      };
      fuentes.forEach(function (f) {
        if (nombra(f.src, k) && !elige(f.src)) sinElegir.push(k + ' en ' + f.rel);
      });
    } else if (SIN_SINGULAR[k]) conMotivo++;
    else faltan.push(k);
  });
  Object.keys(SIN_SINGULAR).forEach(function (k) {
    if (!marcadas[k] || singulares(k, en).length) viejos.push(k);
  });
  return { faltan: faltan, sinElegir: sinElegir, viejos: viejos, conSingular: conSingular, conMotivo: conMotivo };
}

function tandaPlurales(ctx, declarados) {
  console.log('\n[plurales] Una cifra delante de un plural tiene su singular, o el motivo de no tenerlo');
  var sb = sandbox.nuevoSandbox();
  declarados.filter(function (f) { return /^app\/i18n\/(strings|content)\//.test(f); })
    .forEach(function (f) { var e = sandbox.cargar(ctx, sb, f); if (e) ctx.falla('plurales: no se pudo evaluar ' + e); });
  var fuentes = recorrer(path.join(ctx.ROOT, 'app'), []).map(function (p) {
    return { rel: path.relative(ctx.ROOT, p).replace(/\\/g, '/'), src: fs.readFileSync(p, 'utf8') };
  });
  var r = barre(sb.PACE_STRINGS || {}, fuentes);
  if (r.faltan.length) ctx.falla('plurales: ' + r.faltan.length + ' clave(s) con una cifra delante de un plural y sin singular: ' +
    r.faltan.join(', ') + '. Dale su singular (la clave con .uno detrás) y elígelo con n === 1, o escribe en SIN_SINGULAR ' +
    '(scripts/verify.plurales.js) por qué esa cifra nunca vale 1.');
  if (r.sinElegir.length) ctx.falla('plurales: el singular existe pero ese archivo no lo elige: ' + r.sinElegir.join(', '));
  if (r.viejos.length) ctx.falla('plurales: SIN_SINGULAR tiene motivos que ya no hacen falta (la clave cambió, se fue o ya tiene singular): ' + r.viejos.join(', '));
  if (!r.faltan.length && !r.sinElegir.length && !r.viejos.length) {
    ctx.ok('plurales: ' + r.conSingular + ' claves con su singular elegido y ' + r.conMotivo + ' con el motivo de no tenerlo');
  }
}

var NO_CUBRE = [
  'plurales: se mira la palabra que sigue a la cifra dentro de la clave; una cifra pegada en el código delante de ' +
    'otra clave («n + \' \' + t(...)») no la ve este barrido',
];

module.exports = { tandaPlurales: tandaPlurales, barre: barre, SIN_SINGULAR: SIN_SINGULAR, NO_CUBRE: NO_CUBRE };
