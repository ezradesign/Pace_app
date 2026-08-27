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
   y 90 ciclos en 3 minutos: ahí una palabra hablada no tendría sentido aunque
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
   de forma SÍNCRONA y sin adivinar.

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

/* La voz activa. Hoy sólo hay una; el día que entre `bradford` esto pasa a ser
   una preferencia, y entonces habrá que decidir su sitio en Ajustes MIRÁNDOLO. */
var PACE_VOZ = 'sulafat';

/* Margen sobre la duración del clip. Sin él, una locución de 2,52 s en una fase
   de exactamente 2,52 s termina en el mismo instante en que arranca la
   siguiente señal, y las dos se tocan. 150 ms es lo que separa dos palabras. */
var PACE_VOZ_MARGEN = 0.15;

/* LOS EXTREMOS DE LA VOZ DENTRO DE CADA ARCHIVO, en segundos. `ini` es donde
   empieza a sonar la palabra y `fin` donde deja de sonar; `archivo` es lo que
   dura el MP3 entero.

   ESTO NO ES UN DETALLE DE AFINADO: LOS ARCHIVOS LLEVAN SILENCIO A LOS DOS
   LADOS, y medirlos por su duracion total dio dos errores seguidos. El «exhala»
   ocupa 4,96 s de archivo y la palabra acaba a los **2,12** — hay 2,84 s de
   cola muda y 0,65 s de silencio ANTES. Con la duracion del archivo como
   criterio, la voz se caia de doce rutinas por un silencio que no molesta a
   nadie; y ademas la senal llegaba **0,65 s tarde**, que en una fase de 4 s se
   oye.

   COMO SE MIDIERON, y como se vuelven a medir si cambia un archivo: decodificando
   la onda (`decodeAudioData`) y buscando la primera y la ultima muestra por
   encima del umbral. Dos umbrales —1 % del pico y -50 dBFS— dan lo mismo dentro
   de 12 centesimas, asi que el dato es solido. NO se pueden deducir de
   `audio.duration`: son propiedad del contenido, no del contenedor. */
var PACE_VOZ_CLIPS = {
  'breathe.inhale': { archivo: 'inhala', dur: 2.44, ini: 0.386, fin: 1.79 },
  'breathe.hold': { archivo: 'manten', dur: 2.56, ini: 0.021, fin: 1.341 },
  'breathe.exhale': { archivo: 'exhala', dur: 4.96, ini: 0.644, fin: 2.122 },
};

/* Pre-rodadura al saltar el silencio inicial: arrancar EXACTAMENTE en `ini`
   corta el ataque de la consonante. 40 ms es inaudible como silencio y devuelve
   la «e» de «exhala» entera. */
var PACE_VOZ_PREV = 0.04;

var _paceVoz = null;

function paceVozInit() {
  if (_paceVoz) return _paceVoz;
  _paceVoz = {};
  Object.keys(PACE_VOZ_CLIPS).forEach(function (nombre) {
    var ficha = PACE_VOZ_CLIPS[nombre];
    var slot = { listo: false, ini: ficha.ini, palabra: ficha.fin - ficha.ini, audio: null };
    _paceVoz[nombre] = slot;
    try {
      var a = new Audio('app/breathe/voz/' + PACE_VOZ + '-' + ficha.archivo + '.mp3');
      a.preload = 'auto';
      a.addEventListener('canplaythrough', function () {
        /* GUARD: los extremos de voz estan medidos sobre ESTE archivo. Si el
           que llega dura otra cosa, ya no describen nada -- se desconfia y se
           usa el archivo entero, que es el criterio conservador (sonara en
           menos sitios, nunca encima de otra senal). */
        if (isFinite(a.duration) && a.duration > 0 &&
            Math.abs(a.duration - ficha.dur) > 0.25) {
          slot.ini = 0;
          slot.palabra = a.duration;
        }
        slot.listo = true;
      });
      /* Si el archivo no está —el standalone, o una instalación a medias— el
         clip simplemente no se marca listo y nadie se entera: suena el
         sintetizador. No se registra error porque no lo es. */
      a.addEventListener('error', function () { slot.listo = false; });
      a.load();
      slot.audio = a;
    } catch (e) { /* sin Audio() no hay voz, y ya está */ }
  });
  return _paceVoz;
}

/* ¿Cabe la locución de esta señal en una fase de `faseSeg` segundos?
   `faseSeg` ausente = no se sabe, y no saber NO es que sí: se cae al
   sintetizador, que es el comportamiento de siempre. */
function paceVozCabe(nombre, faseSeg) {
  var slot = paceVozInit()[nombre];
  if (!slot || !slot.listo) return false;
  if (typeof faseSeg !== 'number' || !isFinite(faseSeg) || faseSeg <= 0) return false;
  /* Lo que puede pisar la senal siguiente es la PALABRA, no el archivo: la cola
     muda puede seguir corriendo sin molestar a nadie. */
  return (slot.palabra + PACE_VOZ_MARGEN) <= faseSeg;
}

/* Intenta cantar la señal. Devuelve `true` SÓLO si de verdad ha arrancado la
   locución; `playSound` usa esa respuesta para decidir si además sintetiza. */
function paceVozIntenta(nombre, faseSeg) {
  if (!paceVozCabe(nombre, faseSeg)) return false;
  var slot = _paceVoz[nombre];
  try {
    /* Rebobinar en vez de clonar: la misma señal se repite decenas de veces por
       sesión y clonar dejaría un elemento nuevo por ciclo. Si el clip anterior
       siguiera sonando —no debería, porque cabe— se corta y empieza. */
    /* Se entra por donde EMPIEZA LA VOZ, no por el principio del archivo: si no,
       la senal llega tarde -- 0,65 s en el «exhala». */
    slot.audio.currentTime = Math.max(0, slot.ini - PACE_VOZ_PREV);
    var p = slot.audio.play();
    /* `play()` devuelve promesa en los navegadores modernos. Se ignora su
       rechazo A PROPÓSITO: el caso real es la política de autoplay antes del
       primer gesto, y ahí perder una señal es preferible a un error en consola.
       No se puede caer al sintetizador desde aquí: ya hemos dicho que sí. */
    if (p && typeof p.catch === 'function') p.catch(function () {});
    return true;
  } catch (e) {
    return false;
  }
}

Object.assign(window, {
  PACE_VOZ: PACE_VOZ,
  PACE_VOZ_MARGEN: PACE_VOZ_MARGEN,
  PACE_VOZ_CLIPS: PACE_VOZ_CLIPS,
  paceVozInit: paceVozInit,
  paceVozCabe: paceVozCabe,
  paceVozIntenta: paceVozIntenta,
});
