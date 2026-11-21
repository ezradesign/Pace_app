/* PACE · app/ui/Sound.voz.cuerpo.js — LA VOZ DE MUEVE Y ESTIRA
   ===============================================================
   Ez, 15 nov. 2026 (docs/proposals/voz-cuerpo-15nov/, 4A): la misma «Marca la fase» que Respira decide si
   suena voz, y cuál. Las palabras viven en tomas (Ez graba los 25 números seguidos, la cuenta atrás y los
   avisos), y `scripts/voz-cuerpo-tomas.js` escribe dónde está cada una (Sound.voz.cuerpo.datos.js): aquí
   se suena SOLO ese trozo, con un fundido de 5 ms a cada lado y el volumen que la iguala con Respira.

   CUANDO NO PUEDE, DEVUELVE false Y SUENA EL CUENCO O LA MADERA DE SIEMPRE: sin la palabra en la tabla (una
   voz o un idioma sin grabar), sin descodificar todavía, sin Web Audio, si la palabra no cabe en lo que
   dura su momento (`max`) o si tendría que esperar demasiado en la fila. Nunca dice que sí sin sonar: una
   palabra tirada en silencio deja la rutina muda. Solo Web Audio, sin `<audio>` de reserva: la rutina
   empieza con un toque, así que el contexto ya corre, y un `<audio>` no sabe sonar un trozo con precisión.
   Con el contexto suspendido (al volver del fondo) la palabra se programa igual: suena cuando arranca.

   LA COLA: la última repetición se dice entera y lo que viene después («Descansa», «Siguiente») espera a
   que acabe la palabra, en vez de pisarla. Si tuviera que esperar más de 2 s, llegaría tarde: suena su tono.
   (La palabra más larga ocupa 1,4 s y, tras la última repetición, deja 0,35: con menos, «Último paso» no
   sonaba.)

   LO QUE OCUPA UNA PALABRA es su trozo entero, de `a` a `b`, porque eso es lo que suena (la cola de la última
   sílaba va de `fin` a `b`), más un hueco antes de la siguiente: 0,15 s, como Respira, y 0,35 s tras la
   última repetición, para que «Descansa» no se lea pegado al número (Ez lo oyó montado el 16 nov.). Con eso
   se mide también si cabe en su momento: medirlo con la palabra sola dejaba que cada número empujara al
   siguiente.

   `var`/`function` a propósito: un `const` top-level no cruza la IIFE del artefacto. */

var PACE_VOZ_CUERPO_HUECO = 0.15;
var PACE_VOZ_CUERPO_TRAS_SERIE = 0.35;
var PACE_VOZ_CUERPO_ESPERA = 2;
var _paceVozCuerpoTomas = {};   // idioma.voz → { archivo: { buffer } }
var _paceVozCuerpoLibre = 0;    // cuándo acaba (en el reloj del contexto) la palabra que suena
var _paceVozCuerpoVivas = [];   // lo que suena o espera en la fila: [{ s, g }], para callarlo

function paceVozCuerpoJuego() {
  var idioma = typeof paceVozIdioma === 'function' ? paceVozIdioma() : 'es';
  var voz = typeof paceVozActiva === 'function' ? paceVozActiva() : 'sulafat';
  var tabla = window.PACE_VOZ_CUERPO || {};
  return { clave: idioma + '.' + voz, palabras: (tabla[idioma] || {})[voz] || {} };
}

/* Descodifica las tomas de la voz e idioma activos (cuatro archivos). Se llama al abrir una rutina, con
   `reintentar`: solo entonces se vuelve a pedir una toma que no bajó (cada palabra también la llama, y sin
   red pediría la toma en cada repetición). */
function paceVozCuerpoPrecarga(reintentar) {
  try {
    if (typeof paceVozEncendida === 'function' && !paceVozEncendida()) return;
    var j = paceVozCuerpoJuego();
    var tomas = _paceVozCuerpoTomas[j.clave] || (_paceVozCuerpoTomas[j.clave] = {});
    Object.keys(j.palabras).forEach(function (k) {
      var archivo = j.palabras[k].archivo;
      /* Solo las de tu voz y tu idioma, al abrir la rutina, y no van al precache (Ez, 6A del 21 nov. 2026):
         la que no bajó (sin conexión, la primera vez) se vuelve a pedir al abrir otra; mientras, suena la madera. */
      if (!archivo || (tomas[archivo] && !(reintentar && tomas[archivo].fallo))) return;
      tomas[archivo] = { buffer: null };
      if (typeof paceVozDescodifica === 'function') paceVozDescodifica(tomas[archivo], 'app/move/voz/' + archivo);
    });
  } catch (e) { /* sin voz suenan los cuencos */ }
}

/* LOS CUENCOS Y LAS MADERAS TAMBIÉN OCUPAN LA FILA: cuando una palabra no está o no cabe, suena su tono, y
   la palabra que viene detrás no puede entrar encima. Lo que tapa cada uno, en segundos (Sound.jsx): la
   madera, su golpe; el cuenco, el golpe y lo primero de su cola, no toda, que tarda segundos en irse y
   haría llegar tarde a «Descansa». playSound llama aquí cuando suena el tono de Mueve o Estira. */
var PACE_VOZ_CUERPO_TAPA = { 'move.rep': 0.12, 'move.warn': 0.12, 'move.go': 0.4, 'move.start': 0.6, 'move.rest': 0.8, 'move.side': 1 };
function paceVozCuerpoOcupa(nombre) {
  try {
    var tapa = PACE_VOZ_CUERPO_TAPA[nombre];
    var ctx = tapa && typeof window.paceAudioCtx === 'function' ? window.paceAudioCtx() : null;
    if (ctx) {
      _paceVozCuerpoSuena = Math.max(_paceVozCuerpoSuena, ctx.currentTime + tapa);
      _paceVozCuerpoLibre = Math.max(_paceVozCuerpoLibre, ctx.currentTime + tapa + PACE_VOZ_CUERPO_HUECO);
    }
  } catch (e) { /* sin fila, la palabra entra cuando le toca */ }
}

/* Lo que ocupa una palabra con su hueco. ¿Cabe en `max`? */
function paceVozCuerpoCabe(e, max) {
  return !!e && (e.b - e.a) + PACE_VOZ_CUERPO_HUECO <= max;
}

/* Suena la palabra `palabra` (n1…n25, c3…c1, colocate, siguiente, ya, ultimo, izquierda, derecha, cambia,
   descansa) si está y cabe en `max` segundos. `op` es lo que pasa el runner (MoveSessionV1.voz.jsx):
   `ultima`, la última repetición de una serie; `serie`, las palabras de su serie, y `primera`, la palabra
   que la abre. true = suena o ya está en la cola.

   UNA PALABRA CON `max` VA A SU HORA (los números y la cuenta atrás): no hace fila, porque una repetición
   que empieza tarde se mete en la siguiente. Si la de antes aún suena, madera. Y LA SERIE SE DECIDE ENTERA:
   si una de sus palabras no cabe, ninguna, para no oír unos números con voz y otros con madera; y lo que
   decide su primera palabra vale para las demás. Antes se decidía palabra a palabra: si el «tres» no podía
   sonar (la palabra de antes aún sonaba, la toma sin descodificar) y el «dos» sí, la cuenta salía a medias.
   Dentro de una serie que ya suena, la siguiente solo espera a que acabe el trozo de la anterior, no a su
   hueco: van a un segundo o más una de otra, y un tic que llega 80 ms tarde tiraba la siguiente a madera. */
var _paceVozCuerpoSerie = null;   // { clave, voz }: la serie en curso y lo que decidió su primera palabra
var _paceVozCuerpoSuena = 0;      // cuándo acaba de sonar lo último (palabra o tono), sin el hueco
function paceVozCuerpoIntenta(palabra, max, op) {
  var clave = typeof max === 'number' && op && op.serie ? op.serie.join(' ') : null;
  var sigue = !!clave && !op.primera && !!_paceVozCuerpoSerie && _paceVozCuerpoSerie.clave === clave;
  if (sigue && !_paceVozCuerpoSerie.voz) return false;
  var dijo = _paceVozCuerpoSuenaPalabra(palabra, max, op, sigue);
  if (clave && !sigue) _paceVozCuerpoSerie = { clave: clave, voz: dijo };
  return dijo;
}

function _paceVozCuerpoSuenaPalabra(palabra, max, op, sigue) {
  try {
    if (typeof paceVozEncendida === 'function' && !paceVozEncendida()) return false;
    var j = paceVozCuerpoJuego();
    var e = j.palabras[palabra];
    if (!e) return false;
    var aSuHora = typeof max === 'number';
    if (aSuHora && !paceVozCuerpoCabe(e, max)) return false;
    if (aSuHora && op && op.serie && !op.serie.every(function (p) { return paceVozCuerpoCabe(j.palabras[p], max); })) return false;
    paceVozCuerpoPrecarga();
    var toma = (_paceVozCuerpoTomas[j.clave] || {})[e.archivo];
    if (!toma || !toma.buffer) return false;
    var ctx = typeof window.paceAudioCtx === 'function' ? window.paceAudioCtx() : null;
    if (!ctx) return false;
    if (ctx.state === 'closed') return false;
    if (ctx.state !== 'running') { try { ctx.resume(); } catch (er) {} }   // suspendido o interrumpido: arranca y suena
    var ahora = ctx.currentTime;
    if (aSuHora && (sigue ? _paceVozCuerpoSuena : _paceVozCuerpoLibre) > ahora) return false;
    var t0 = aSuHora ? ahora : Math.max(ahora, _paceVozCuerpoLibre);
    if (t0 - ahora > PACE_VOZ_CUERPO_ESPERA) return false;   // llegaría tarde: su tono, no el silencio
    var dur = Math.min(e.b, toma.buffer.duration) - e.a;
    if (!(dur > 0.02)) return false;
    var vol = typeof e.vol === 'number' ? e.vol : 1;
    var f = 0.005;
    var s = ctx.createBufferSource();
    var g = ctx.createGain();
    s.buffer = toma.buffer;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + f);
    g.gain.setValueAtTime(vol, t0 + dur - f);
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    s.connect(g);
    g.connect(ctx.destination);
    s.start(t0, e.a);
    s.stop(t0 + dur + 0.01);
    var viva = { s: s, g: g };
    _paceVozCuerpoVivas.push(viva);
    s.onended = function () {
      try { g.disconnect(); } catch (er) {}
      _paceVozCuerpoVivas = _paceVozCuerpoVivas.filter(function (v) { return v !== viva; });
    };
    _paceVozCuerpoSuena = t0 + dur;
    _paceVozCuerpoLibre = t0 + dur + (op && op.ultima ? PACE_VOZ_CUERPO_TRAS_SERIE : PACE_VOZ_CUERPO_HUECO);
    return true;
  } catch (err) {
    return false;
  }
}

/* AL PAUSAR, SALTAR O SALIR, la voz se calla: lo que suena sale con un fundido corto, lo que esperaba en la
   fila ya no suena, y la fila queda vacía. Si no, al pausar la palabra seguía, y al saltar se apilaban las
   de los pasos que pasaban (el runner llama aquí desde useV1Vuelta, MoveSessionV1.parts.jsx). */
function paceVozCuerpoCalla() {
  try {
    var ctx = typeof window.paceAudioCtx === 'function' ? window.paceAudioCtx() : null;
    var ahora = ctx ? ctx.currentTime : 0;
    _paceVozCuerpoVivas.forEach(function (v) {
      try {
        v.g.gain.cancelScheduledValues(ahora);
        v.g.gain.setValueAtTime(v.g.gain.value, ahora);
        v.g.gain.linearRampToValueAtTime(0, ahora + 0.02);
        v.s.stop(ahora + 0.03);
      } catch (e) { /* ya acabó */ }
    });
  } catch (err) { /* nada que callar */ }
  _paceVozCuerpoVivas = [];
  _paceVozCuerpoLibre = 0;
  _paceVozCuerpoSuena = 0;
  _paceVozCuerpoSerie = null;
}

Object.assign(window, { paceVozCuerpoPrecarga: paceVozCuerpoPrecarga, paceVozCuerpoIntenta: paceVozCuerpoIntenta,
  paceVozCuerpoOcupa: paceVozCuerpoOcupa, paceVozCuerpoCalla: paceVozCuerpoCalla });
