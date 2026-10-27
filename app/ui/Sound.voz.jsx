/* PACE · app/ui/Sound.voz.jsx (sesión 175)
   ==========================================
   LA VOZ DE RESPIRA. Locuciones grabadas para las señales de la respiración
   guiada, empezando por la voz `sulafat`.

   ESTO ANULA UNA REGLA ESCRITA, y conviene saberlo antes de tocarlo: «Voz/TTS:
   NUNCA» estaba en cuatro filas de `DECISIONES_TECNICAS_VIGENTES.md` y dos veces
   en `ROADMAP.md`. La anula una decisión explícita del usuario en s175, y las
   apariciones viejas quedan marcadas `SUPERSEDED por s175` en vez de borradas.

   ── LO QUE GOBIERNA EL DISEÑO ──────────────────────────────────────────────
   UNA LOCUCIÓN DURA LO QUE DURA. El sonido sintetizado recibe la duración de la
   fase (`playSound('breathe.inhale', phaseDur)`) y se estira con ella; un
   archivo no. Por eso hay que saber, fase a fase, si la palabra entra.

   Y LO QUE ENTRA O NO ES **LA PALABRA**, NO EL ARCHIVO. Medido en s175 contra
   `getSequence()` de las 20 rutinas: las palabras de `sulafat` duran **1,40 ·
   1,32 · 1,48 s** y **caben en 17 de 20**. Las tres que quedan fuera son las de
   bombeo —`Suspiro fisiológico`, `Bhastrika`, `Kapalabhati`—, con fases de 1 s
   y 60 respiraciones en 3 minutos: ahí una palabra hablada no tendría sentido aunque
   cupiera.

   ESTA CIFRA COSTÓ DOS EQUIVOCACIONES MÍAS, y las dos van escritas porque la
   forma de equivocarse se repite: medir el CONTENEDOR en vez del CONTENIDO.
   Primero calculé la duración desde la cabecera MPEG (salía casi la mitad de la
   real, y con ella un «14 de 20» falso); luego usé `audio.duration`, que es
   correcta pero incluye los silencios, y salió «8 de 20» — también engañosa,
   porque el «exhala» ocupa 4,96 s de archivo y **la palabra acaba a los 2,12**.
   Reproducible: `node scripts/audit/censo-respira-fases.js`.

   POR ESO LA DECISIÓN ES **POR FASE Y NO GLOBAL**: `paceVozIntenta` recibe los
   segundos de la fase y sólo suena si la locución entra entera con su margen.
   Cuando no cabe devuelve `false` y `playSound` sigue con el sintetizador de
   siempre, que es exactamente lo que sonaba ayer.

   ── POR QUÉ «LISTO» SE SABE ANTES DE SONAR ─────────────────────────────────
   `audio.play()` es asíncrono: si el archivo no está, el fallo llega DESPUÉS y
   ya sería tarde para caer al sintetizador — se habría perdido la señal. Por eso
   cada clip se precarga al arrancar y sólo entra en juego cuando el navegador
   dice `canplaythrough`. Así la pregunta «¿puedo cantar esta fase?» se contesta
   de forma SÍNCRONA y sin adivinar. Y si aun así el `<audio>` de reserva no
   arranca (su `play()` se rechaza), `playSound` deja el tono de la fase como
   respaldo y suena él: la fase nunca se queda muda.

   Consecuencia buscada: **en `PACE_standalone.html` no hay voz**. Los clips
   nunca quedan listos allí, así que suena el motor sintetizado — que es lo que
   decidió s134.

   Y POR ESO VIVEN EN `app/breathe/voz/` Y NO EN LA CARPETA DE ARTE DE RESPIRA:
   el build recorre las carpetas de arte inlineando cada `.webp` y luego **aborta
   si el prefijo de esa carpeta sigue apareciendo en el artefacto** — señal de
   una referencia que no ha podido convertir en data URI. Un MP3 ahí dentro deja
   `node build-standalone.js` sin escribir. El guard es correcto; lo que estaba
   mal era la carpeta.

   AVISO PARA QUIEN EDITE ESTE COMENTARIO: el guard busca la CADENA, no una
   referencia real, así que escribir aquí la ruta de aquella carpeta —aunque sea
   en prosa y dentro de un comentario— vuelve a abortar el build. Babel conserva
   los comentarios en el artefacto. Pasó al escribir esta misma nota.

   `var`/`function` a propósito: un `const` top-level no cruza la IIFE del
   artefacto (trampa de s148). */

/* LAS DOS VOCES. `sulafat` entro en s175; `bradford` en s176, ya medida.
   La ACTIVA no se decide aqui: sale del estado (`state.voice`), porque desde
   s176 es una preferencia del usuario con su sitio en Ajustes. */
var PACE_VOZ_DEFECTO = 'sulafat';
var PACE_VOCES = ['sulafat', 'bradford'];

/* Margen sobre la duracion del clip. Sin el, una locucion de 2,52 s en una fase
   de exactamente 2,52 s termina en el mismo instante en que arranca la
   siguiente senal, y las dos se tocan. 150 ms es lo que separa dos palabras. */
var PACE_VOZ_MARGEN = 0.15;

/* LOS EXTREMOS DE LA VOZ DENTRO DE CADA ARCHIVO, en segundos. `ini` es donde
   empieza a sonar la palabra y `fin` donde deja de sonar; `dur` es lo que dura
   el MP3 entero.

   ESTO NO ES UN DETALLE DE AFINADO: LOS ARCHIVOS LLEVAN SILENCIO A LOS DOS
   LADOS, y medirlos por su duracion total dio dos errores seguidos. El «exhala»
   de sulafat ocupa 4,96 s de archivo y la palabra acaba a los **2,12** -- hay
   2,84 s de cola muda y 0,65 s de silencio ANTES. Con la duracion del archivo
   como criterio, la voz se caia de doce rutinas por un silencio que no molesta
   a nadie; y ademas la senal llegaba **0,65 s tarde**, que en una fase de 4 s
   se oye.

   COMO SE MIDIERON, y como se vuelven a medir si cambia un archivo: decodificando
   la onda (`decodeAudioData`) y buscando la primera y la ultima muestra por
   encima del umbral. **EL UMBRAL QUE MANDA ES -50 dBFS**, que es el que se uso
   para sulafat; el «1 % del pico» va como segunda opinion y en s176 se separo
   1,73 s en un archivo de bradford por tener el pico bajo. NO se pueden deducir
   de `audio.duration`: son propiedad del contenido, no del contenedor.

   BRADFORD ES OTRA GRABACION, NO LA MISMA CON OTRA VOZ: sus palabras son mas
   CORTAS que las de sulafat (inhala 0,911, manten 1,218 y exhala 1,201 contra
   1,404, 1,320 y 1,478). Reproducible: `node scripts/audit/censo-respira-fases.js`.

   SU «EXHALA» ACABA A LOS 1,309 s, NO AL FINAL DEL ARCHIVO. Detras hay 2,3 s de
   silencio y, en los ultimos ~15 ms del MP3, un chasquido a -21 dBFS. La medida
   del ultimo punto sobre -50 dBFS tomo ese chasquido por el final de la palabra
   (fin 3,68) y la voz no cabia en las fases de 2 s de las tres de rondas, donde
   sonaba el tono. Con el fin bueno cabe; y como la voz calla en `fin` mas
   `PACE_VOZ_COLA` (abajo), el chasquido ya no suena en ninguna rutina (Ez, 3A
   del 22 oct. 2026, oyendolo en `docs/proposals/maqueta-inicio-22oct.html`).

   EN INGLES, LAS MISMAS DOS VOCES DICEN «Inhale / Hold / Exhale» (14 oct. 2026),
   medidas igual, a -50 dBFS. Las de bradford son las mas cortas de todas (0,74 ·
   0,58 · 0,93 s) y caben en las 17 tecnicas con voz. Las de sulafat no: su
   «Inhale» dura 1,97 s y no entra en las inhalaciones de 2 s de las tres de
   rondas, donde suena el tono al inhalar (Ez lo eligio asi); su «Exhale» dura
   1,82 s porque se apaga despacio, y cabe en las 17. El «Inhale» de sulafat es
   un archivo de 6,88 s con casi todo silencio detras: no molesta, ver `fin`.
   Por eso la tabla va POR IDIOMA y dentro POR VOZ: el idioma lo pone la app
   (`state.lang`) y la voz, Ajustes. */
var PACE_VOZ_CLIPS = {
  es: {
    sulafat: {
      'breathe.inhale': { archivo: 'inhala', dur: 2.44, ini: 0.386, fin: 1.79 },
      'breathe.hold': { archivo: 'manten', dur: 2.56, ini: 0.021, fin: 1.341 },
      'breathe.exhale': { archivo: 'exhala', dur: 4.96, ini: 0.644, fin: 2.122 },
    },
    bradford: {
      'breathe.inhale': { archivo: 'inhala', dur: 2.64, ini: 0.001, fin: 0.912 },
      'breathe.hold': { archivo: 'manten', dur: 2.4, ini: 0.001, fin: 1.219 },
      'breathe.exhale': { archivo: 'exhala', dur: 3.68, ini: 0.108, fin: 1.309 },
    },
  },
  en: {
    sulafat: {
      'breathe.inhale': { archivo: 'inhale', dur: 6.88, ini: 0.29, fin: 2.26 },
      'breathe.hold': { archivo: 'hold', dur: 1.52, ini: 0.149, fin: 1.134 },
      'breathe.exhale': { archivo: 'exhale', dur: 2.68, ini: 0.831, fin: 2.65 },
    },
    bradford: {
      'breathe.inhale': { archivo: 'inhale', dur: 0.96, ini: 0.056, fin: 0.799 },
      'breathe.hold': { archivo: 'hold', dur: 0.72, ini: 0.031, fin: 0.612 },
      'breathe.exhale': { archivo: 'exhale', dur: 1.2, ini: 0.057, fin: 0.987 },
    },
  },
};

/* NINGUNA VOZ EN UNA FASE DE 1 s, quepa o no la palabra. En castellano ninguna
   cabia, y Suspiro fisiologico («Inhala mas»), Bhastrika y Kapalabhati sonaban
   con el tono; las palabras inglesas de bradford si cabrian, y esas dos tecnicas
   dirian «Inhale» cada segundo, noventa veces. Ez eligio (14 oct. 2026) que
   sigan con el tono en cualquier idioma. Las fases del catalogo son de segundos
   enteros: el corte cae entre 1 y 2. */
var PACE_VOZ_FASE_MIN = 1.5;

/* Pre-rodadura al saltar el silencio inicial: arrancar EXACTAMENTE en `ini`
   corta el ataque de la consonante. 40 ms es inaudible como silencio y devuelve
   la «e» de «exhala» entera. */
var PACE_VOZ_PREV = 0.04;

/* LA VOZ SALE POR WEB AUDIO, CON UN FUNDIDO DE 5 ms AL ENTRAR Y AL SALIR. Las
   palabras de bradford en castellano empiezan en el primer milisegundo del
   archivo («inhala» y «mantén», ini 0,001): un `<audio>` las arranca y las corta
   de golpe, y eso se oye como un clic entre palabra y palabra (Ez, en
   «Exhalación 4·6», en el PC). Con el
   fundido no hay clic sea cual sea el archivo, y la voz va por el mismo Web
   Audio que la música, que es lo que se sospecha del entrecortado del móvil.
   5 ms no se oyen como fundido: no le quitan nada a la consonante.
   El `<audio>` sigue cargándose: dice cuándo la palabra está lista
   (`canplaythrough`) y suena él si el Web Audio no puede (sin contexto, o
   todavía suspendido antes del primer gesto). */
var PACE_VOZ_FUNDIDO = 0.005;

/* LA VOZ CALLA AL ACABAR LA PALABRA, NO AL ACABAR EL ARCHIVO: suena hasta `fin`
   y 100 ms mas, y ahi sale con su fundido. Lo que queda detras de `fin` esta por
   debajo de -50 dBFS, salvo el chasquido del final del «exhala» de bradford, que
   sonaba unos 3,6 s despues de cada «exhala» en las rutinas lentas. Cambiar solo
   la cifra de `fin` lo dejaba sonando encima de la fase siguiente. */
var PACE_VOZ_COLA = 0.1;

/* Se descodifica fuera de línea, como la música (Sound.musica.jsx): así no hace
   falta el contexto de audio de la app, que antes del primer gesto no puede
   arrancar. Un AudioBuffer vale para cualquier contexto. */
function paceVozDescodifica(slot, url) {
  try {
    var Fuera = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!Fuera || typeof fetch !== 'function') return;
    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
      .then(function (ab) {
        var dc = new Fuera(1, 1, 44100);
        return new Promise(function (ok, ko) { var p = dc.decodeAudioData(ab, ok, ko); if (p && p.then) p.then(ok, ko); });
      })
      .then(function (buf) { slot.buffer = buf; })
      .catch(function () { /* sin buffer suena el <audio>, como antes */ });
  } catch (e) { /* idem */ }
}

/* Suena la palabra desde `desde` (segundos del archivo) con el fundido a los dos
   lados. Devuelve false si no puede, y entonces suena el `<audio>`. */
function paceVozWebAudio(slot, desde) {
  var ctx = typeof window.paceAudioCtx === 'function' ? window.paceAudioCtx() : null;
  if (!ctx || !slot.buffer) return false;
  if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
  if (ctx.state !== 'running') return false;
  var f = PACE_VOZ_FUNDIDO;
  var t0 = ctx.currentTime;
  /* La palabra anterior de este mismo clip, si aún sonara, sale con su fundido. */
  if (slot.fuente) {
    try {
      slot.fuente.g.gain.cancelScheduledValues(t0);
      slot.fuente.g.gain.setValueAtTime(slot.fuente.g.gain.value, t0);
      slot.fuente.g.gain.linearRampToValueAtTime(0, t0 + f);
      slot.fuente.s.stop(t0 + f + 0.01);
    } catch (e) {}
  }
  var resto = Math.min(slot.buffer.duration, slot.fin + PACE_VOZ_COLA) - desde;
  if (!(resto > 2 * f)) return false;
  var s = ctx.createBufferSource();
  var g = ctx.createGain();
  s.buffer = slot.buffer;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(1, t0 + f);
  g.gain.setValueAtTime(1, t0 + resto - f);
  g.gain.linearRampToValueAtTime(0, t0 + resto);
  s.connect(g);
  g.connect(ctx.destination);
  s.start(t0, desde);
  s.stop(t0 + resto + 0.01);
  var esta = { s: s, g: g };
  slot.fuente = esta;
  s.onended = function () { if (slot.fuente === esta) slot.fuente = null; try { g.disconnect(); } catch (e) {} };
  return true;
}

/* QUE VOZ SUENA, Y SI SUENA SIQUIERA. Las dos preguntas se contestan leyendo el
   estado en el MOMENTO de sonar, no al cargar: el usuario puede cambiarlas
   desde Ajustes en mitad de una sesion.
   `voiceOn` es la novedad de s176 y arranca en `true` para que quien ya tenia
   la voz de s175 no la pierda por una actualizacion. */
function paceVozEstado() {
  try { return (typeof getState === 'function') ? getState() : null; } catch (e) { return null; }
}
function paceVozActiva() {
  var st = paceVozEstado();
  var v = st && st.voice;
  return PACE_VOCES.indexOf(v) !== -1 ? v : PACE_VOZ_DEFECTO;
}
function paceVozEncendida() {
  var st = paceVozEstado();
  /* sin estado no se adivina: se cae al sintetizador, que es lo de siempre */
  if (!st) return false;
  return st.voiceOn !== false;
}
/* El idioma de las palabras es el de la app: cambiarlo en Ajustes a mitad de
   una sesion cambia la siguiente palabra (la primera vez, mientras se precarga,
   suena el tono). */
function paceVozIdioma() {
  var st = paceVozEstado();
  return st && st.lang === 'en' ? 'en' : 'es';
}

/* UN JUEGO DE CLIPS POR VOZ E IDIOMA. Se precarga el que este activo, no los
   cuatro: son doce archivos y solo suena uno de cada tres. Al cambiar de voz en
   Ajustes la nueva se precarga en ese momento (`TweaksPanel` llama a
   `paceVozInit`), asi que para cuando empieza una sesion ya esta lista. Si no lo
   estuviera, `paceVozCabe` dice que no y suena el sintetizador -- nunca un
   silencio. */
var _paceVoz = {};

function paceVozInit(voz) {
  var cual = PACE_VOCES.indexOf(voz) !== -1 ? voz : paceVozActiva();
  var idioma = paceVozIdioma();
  var clave = idioma + '.' + cual;
  if (_paceVoz[clave]) return _paceVoz[clave];
  var juego = {};
  _paceVoz[clave] = juego;
  var fichas = (PACE_VOZ_CLIPS[idioma] || {})[cual] || {};
  Object.keys(fichas).forEach(function (nombre) {
    var ficha = fichas[nombre];
    var slot = { listo: false, ini: ficha.ini, fin: ficha.fin, palabra: ficha.fin - ficha.ini, audio: null, buffer: null, fuente: null, corte: null };
    juego[nombre] = slot;
    var url = 'app/breathe/voz/' + cual + '-' + ficha.archivo + '.mp3';
    paceVozDescodifica(slot, url);
    try {
      var a = new Audio(url);
      a.preload = 'auto';
      a.addEventListener('canplaythrough', function () {
        /* GUARD: los extremos de voz estan medidos sobre ESTE archivo. Si el
           que llega dura otra cosa, ya no describen nada -- se desconfia y se
           usa el archivo entero, que es el criterio conservador (sonara en
           menos sitios, nunca encima de otra senal). */
        if (isFinite(a.duration) && a.duration > 0 &&
            Math.abs(a.duration - ficha.dur) > 0.25) {
          slot.ini = 0;
          slot.fin = a.duration;
          slot.palabra = a.duration;
        }
        slot.listo = true;
      });
      /* Si el archivo no esta -el standalone, o una instalacion a medias- el
         clip simplemente no se marca listo y nadie se entera: suena el
         sintetizador. No se registra error porque no lo es. */
      a.addEventListener('error', function () { slot.listo = false; });
      a.load();
      slot.audio = a;
    } catch (e) { /* sin Audio() no hay voz, y ya esta */ }
  });
  return juego;
}

/* ¿Cabe la locución de esta señal en una fase de `faseSeg` segundos?
   `faseSeg` ausente = no se sabe, y no saber NO es que sí: se cae al
   sintetizador, que es el comportamiento de siempre. */
function paceVozCabe(nombre, faseSeg) {
  /* EL INTERRUPTOR VA PRIMERO, antes incluso de precargar: si el usuario ha
     elegido «Tono», ni siquiera se pide el archivo. */
  if (!paceVozEncendida()) return false;
  var slot = paceVozInit(paceVozActiva())[nombre];
  if (!slot || !slot.listo) return false;
  if (typeof faseSeg !== 'number' || !isFinite(faseSeg) || faseSeg < PACE_VOZ_FASE_MIN) return false;
  /* Lo que puede pisar la senal siguiente es la PALABRA, no el archivo: la cola
     muda puede seguir corriendo sin molestar a nadie. */
  return (slot.palabra + PACE_VOZ_MARGEN) <= faseSeg;
}

/* Medio segundo: lo que puede tardar en llegar un `play()` que falla de verdad (el
   permiso, el formato), que suele ser al instante. Uno que llega más tarde es el de
   cortar la palabra (`slot.corte`) y entonces la fase ya va por otro sitio. */
var PACE_VOZ_RESPALDO_MS = 500;

/* Intenta cantar la señal. Devuelve `true` si la locución ha arrancado o va a
   arrancar; `playSound` usa esa respuesta para decidir si además sintetiza. Por el
   `<audio>`, `play()` es asíncrono y el «sí» se da antes de saber: si luego falla,
   suena `alFallar`, el tono de la fase. */
function paceVozIntenta(nombre, faseSeg, alFallar) {
  if (!paceVozCabe(nombre, faseSeg)) return false;
  var slot = paceVozInit(paceVozActiva())[nombre];
  try {
    /* Rebobinar en vez de clonar: la misma señal se repite decenas de veces por
       sesión y clonar dejaría un elemento nuevo por ciclo. Si el clip anterior
       siguiera sonando —no debería, porque cabe— se corta y empieza. */
    /* Se entra por donde EMPIEZA LA VOZ, no por el principio del archivo: si no,
       la senal llega tarde -- 0,65 s en el «exhala». */
    var desde = Math.max(0, slot.ini - PACE_VOZ_PREV);
    if (paceVozWebAudio(slot, desde)) return true;
    slot.audio.currentTime = desde;
    var pedida = Date.now();
    var p = slot.audio.play();
    /* el `<audio>` tampoco sigue detras de la palabra (ver PACE_VOZ_COLA) */
    clearTimeout(slot.corte);
    var a = slot.audio;
    var corte = slot.corte = setTimeout(function () { try { a.pause(); } catch (e) {} }, (slot.fin + PACE_VOZ_COLA - desde) * 1000);
    /* `play()` devuelve promesa en los navegadores modernos, y su rechazo (la
       política de autoplay, un formato que no lee) llega cuando ya hemos dicho que
       sí: entonces suena el tono, sin error en consola. A destiempo, nada. */
    if (p && typeof p.catch === 'function') {
      p.catch(function () {
        if (slot.corte === corte) clearTimeout(corte);
        if (typeof alFallar === 'function' && Date.now() - pedida <= PACE_VOZ_RESPALDO_MS) {
          try { alFallar(); } catch (e) {}
        }
      });
    }
    return true;
  } catch (e) {
    return false;
  }
}

Object.assign(window, {
  PACE_VOCES: PACE_VOCES,
  PACE_VOZ_DEFECTO: PACE_VOZ_DEFECTO,
  paceVozActiva: paceVozActiva,
  paceVozEncendida: paceVozEncendida,
  paceVozIdioma: paceVozIdioma,
  PACE_VOZ_MARGEN: PACE_VOZ_MARGEN,
  PACE_VOZ_FASE_MIN: PACE_VOZ_FASE_MIN,
  PACE_VOZ_FUNDIDO: PACE_VOZ_FUNDIDO,
  PACE_VOZ_COLA: PACE_VOZ_COLA,
  PACE_VOZ_CLIPS: PACE_VOZ_CLIPS,
  paceVozInit: paceVozInit,
  paceVozCabe: paceVozCabe,
  paceVozIntenta: paceVozIntenta,
});
