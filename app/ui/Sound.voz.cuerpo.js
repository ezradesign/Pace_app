/* PACE · app/ui/Sound.voz.cuerpo.js — LA VOZ DE MUEVE Y ESTIRA
   ===============================================================
   Ez, 15 nov. 2026 (docs/proposals/voz-cuerpo-15nov/, 4A): la misma «Marca la fase» que Respira decide si
   suena voz, y cuál. Las palabras viven en tomas (Ez graba los 25 números seguidos, la cuenta atrás y los
   avisos), y `scripts/voz-cuerpo-tomas.js` escribe dónde está cada una (Sound.voz.cuerpo.datos.js): aquí
   se suena SOLO ese trozo, con un fundido de 5 ms a cada lado y el volumen que la iguala con Respira.

   CUANDO NO PUEDE, DEVUELVE false Y SUENA EL CUENCO O LA MADERA DE SIEMPRE: sin la palabra en la tabla (una
   voz o un idioma sin grabar), sin descodificar todavía, sin Web Audio en marcha, o si la palabra no cabe
   en lo que dura su momento (`max`). Solo Web Audio, sin `<audio>` de reserva: la rutina empieza con un
   toque, así que el contexto ya corre, y un `<audio>` no sabe sonar un trozo con precisión.

   LA COLA: la última repetición se dice entera y lo que viene después («Descansa», «Siguiente») espera a
   que acabe la palabra, en vez de pisarla. Si tuviera que esperar más de 2 s, se deja: llegaría tarde. (La
   palabra más larga ocupa 1,4 s y, tras la última repetición, deja 0,35: con menos, «Último paso» se perdía.)

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

function paceVozCuerpoJuego() {
  var idioma = typeof paceVozIdioma === 'function' ? paceVozIdioma() : 'es';
  var voz = typeof paceVozActiva === 'function' ? paceVozActiva() : 'sulafat';
  var tabla = window.PACE_VOZ_CUERPO || {};
  return { clave: idioma + '.' + voz, palabras: (tabla[idioma] || {})[voz] || {} };
}

/* Descodifica las tomas de la voz e idioma activos (cuatro archivos). Se llama al abrir una rutina. */
function paceVozCuerpoPrecarga() {
  try {
    if (typeof paceVozEncendida === 'function' && !paceVozEncendida()) return;
    var j = paceVozCuerpoJuego();
    var tomas = _paceVozCuerpoTomas[j.clave] || (_paceVozCuerpoTomas[j.clave] = {});
    Object.keys(j.palabras).forEach(function (k) {
      var archivo = j.palabras[k].archivo;
      if (!archivo || tomas[archivo]) return;
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
    if (ctx) _paceVozCuerpoLibre = Math.max(_paceVozCuerpoLibre, ctx.currentTime + tapa + PACE_VOZ_CUERPO_HUECO);
  } catch (e) { /* sin fila, la palabra entra cuando le toca */ }
}

/* Lo que ocupa una palabra con su hueco. ¿Cabe en `max`? */
function paceVozCuerpoCabe(e, max) {
  return !!e && (e.b - e.a) + PACE_VOZ_CUERPO_HUECO <= max;
}

/* Suena la palabra `palabra` (n1…n25, c3…c1, colocate, siguiente, ya, ultimo, izquierda, derecha, cambia,
   descansa) si está y cabe en `max` segundos. `op` es lo que pasa el runner (MoveSessionV1.voz.jsx):
   `ultima`, la última repetición de una serie, y `serie`, las palabras de su serie. true = suena o ya está
   en la cola.

   UNA PALABRA CON `max` VA A SU HORA (los números y la cuenta atrás): no hace fila, porque una repetición
   que empieza tarde se mete en la siguiente. Si la de antes aún suena, madera. Y LA SERIE SE DECIDE ENTERA:
   si una de sus palabras no cabe, ninguna, para no oír unos números con voz y otros con madera. */
function paceVozCuerpoIntenta(palabra, max, op) {
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
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (er) {} }
    if (ctx.state !== 'running') return false;
    var ahora = ctx.currentTime;
    if (aSuHora && _paceVozCuerpoLibre > ahora) return false;
    var t0 = Math.max(ahora, _paceVozCuerpoLibre);
    if (t0 - ahora > PACE_VOZ_CUERPO_ESPERA) return true;   // llegaría tarde: se deja, sin tono encima
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
    s.onended = function () { try { g.disconnect(); } catch (er) {} };
    _paceVozCuerpoLibre = t0 + dur + (op && op.ultima ? PACE_VOZ_CUERPO_TRAS_SERIE : PACE_VOZ_CUERPO_HUECO);
    return true;
  } catch (err) {
    return false;
  }
}

Object.assign(window, { paceVozCuerpoPrecarga: paceVozCuerpoPrecarga, paceVozCuerpoIntenta: paceVozCuerpoIntenta, paceVozCuerpoOcupa: paceVozCuerpoOcupa });
