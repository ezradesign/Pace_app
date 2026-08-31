/* PACE · app/ui/Sound.musica.jsx (sesión 177)
   ============================================
   LA PISTA DE FONDO DE RESPIRA. Tercera capa de sonido, junto al tono/voz de
   señal y al drone de ambiente.

   ESTO ES UNA PRUEBA, Y SE DICE: hoy sólo existe UNA pieza, la de la familia
   Equilibrio, generada con ElevenLabs y elegida por lo que midió
   `scripts/audit/banco-musica-s177.js` -- de las seis candidatas es la que deja
   el hueco de voz más limpio (15,6 % de su energía entre 200 Hz y 3 kHz y
   0,02 % en la banda de consonantes, donde las locuciones ponen entre el 14 y
   el 31 %) y la única afinada en la rejilla de la app (La2 a -0,3 cents de
   432). Las otras cinco están medidas y esperando decisión.

   LO QUE ESTA PIEZA TODAVÍA NO CUMPLE, medido y no escondido:
     · NO HACE BUCLE. Entra 30,4 dB por debajo de su cuerpo y sale 48,6 por
       debajo, o sea tiene fundidos en los dos extremos; repetirla dejaría un
       bajón a casi silencio en cada vuelta. Por eso suena UNA vez y se acaba:
       dura 4:00 y las rutinas de Equilibrio duran de 5 a 7 minutos, así que
       los últimos minutos van sin fondo. Recortar los fundidos es trabajo de
       edición, no de código.
     · Lleva una periodicidad de 1,0 s que el brief no pedía. El número dice
       que incumple; si suena bien, manda el oído.

   LA GANANCIA SE IGUALA POR RMS Y NO POR PICO, y esto costó que el usuario no
   oyera nada y lo reportara dos veces.

   El drone de ambiente arranca a pico 0.02 (`Sound.jsx`) y es el único
   precedente de «nivel de fondo» que el proyecto tiene. La primera versión
   igualó PICO con PICO: la pieza tiene el suyo en -15,89 dBFS, así que 0.12
   los dejaba iguales. Pero **el pico no es el volumen que se oye**. El drone es
   una onda pura, con 3 dB de factor de cresta; esta pieza tiene 14,6. Igualar
   picos la dejaba **11,6 dB por debajo** del drone en volumen percibido.

   MEDIDO decodificando las ondas (mismo metodo que s176 con las locuciones):
     musica            pico -15,89 dBFS   RMS -30,53
     sulafat-inhala    pico -12,26        RMS -28,07
     sulafat-exhala    pico  -8,26        RMS -29,95
     drone (sine .02)  pico -33,98        RMS -36,99

   Con ganancia 0.12 la musica quedaba en **-48,9 dBFS de RMS, unos 20 dB por
   debajo de la voz**: estaba sonando y era fisica que no se oyera. Para igualar
   el VOLUMEN del drone hace falta 0.475; se deja en **0.45**, que pone la
   musica en -37,5 dBFS -- practicamente el nivel del drone, y **7,6 dB por
   debajo de la locucion mas floja**, que es un fondo audible que no tapa.

   Y OJO CON LA LECCION GENERAL: la musica y la voz tienen casi el mismo RMS a
   ganancia 1 (-30,5 contra -28). Lo que las separa es SOLO esta ganancia.

   NUNCA SUENA A LA VEZ QUE EL DRONE. La decisión de s176 dice que «qué suena
   detrás» es UNA elección; la interfaz mantiene la exclusión, y aquí se
   defiende otra vez porque `Coherente 432` FUERZA su drone pase lo que pase
   (`BreatheSession.jsx`) y esa rutina se saltaría la regla desde el otro lado.

   Consume: getState (Sound.jsx lo publica). No exporta nada por nombre salvo
   los dos verbos en window, igual que `ambientDrone`. */

/* Catalogo TAG -> archivo. Se indexa por el `tag` de la rutina ('EQU', 'BAL',
   'ENE', 'REL', 'PRA', 'KRI') y no por el nombre del grupo: el tag viaja DENTRO
   del objeto de rutina, asi que la sesion no tiene que saber en que grupo del
   catalogo estaba. Una fila hoy; las demas entran cuando existan sus piezas.
   Un tag sin fila simplemente no suena, y eso NO es un error: es el estado
   normal de cinco de las seis familias. */
/* LA GANANCIA ES POR PIEZA Y SE CALCULA, NO SE COPIA. Las dos que hay estan
   masterizadas a niveles MUY distintos -- cuerpo -29,04 dBFS la de Equilibrio y
   -15,37 la de Energia, 13,7 dB de diferencia-- asi que darles el mismo numero
   pondria una inaudible o la otra por encima de la voz. La formula es
   `10^((objetivo - cuerpoRMS)/20)` con el objetivo en unos -36 dBFS, que es el
   nivel del drone y ~7 dB por debajo de la locucion mas floja. */
/* UNA SOLA PIEZA EN LAS SEIS FAMILIAS, Y ES PROVISIONAL A PROPOSITO.
   El catalogo final tendra una por familia -- cada brief pide otra cosa-- pero
   hoy solo hay UNA que de verdad se oiga, y el objetivo ahora es ver el
   conjunto de la app con musica, no afinar el reparto.

   POR QUE ESTA Y NO LA DE EQUILIBRIO. La de Equilibrio se probo primero y el
   usuario no la oia. Medido: el **82,6 % de su energia esta por debajo de 200
   Hz** (0,5 % entre 500 Hz y 2 kHz, 0 % por encima de 2 kHz), o sea justo donde
   los altavoces de portatil y de monitor no producen nada. Con ponderacion A
   pierde **12,7 dB** contra los 7,4 de esta. No sonaba baja: no salia.

   Y EL CRITERIO CON QUE LA ELEGI ESTABA INVERTIDO. La recomende por ser «la que
   deja el hueco de voz mas limpio» -- 15,59 % en 200 Hz-3 kHz y 0,02 % en la
   banda de consonantes-- que es exactamente la medida que la hacia inaudible.
   El brief pedia a la vez «rango medio despejado» y registro grave, y entre las
   dos cosas no queda banda que un altavoz normal reproduzca. Al reescribir los
   seis briefs hay que anadir el requisito que faltaba: **el grueso de la
   energia entre 200 Hz y 2 kHz**. */
const PACE_MUSICA = (() => {
  const pieza = { archivo: 'app/breathe/musica/energia.mp3', ganancia: 0.09, bucle: true };
  const m = {};
  ['ENE', 'EQU', 'BAL', 'REL', 'PRA', 'KRI'].forEach((tag) => { m[tag] = pieza; });
  return m;
})();

const paceMusica = (() => {
  let audio = null;
  /* POR QUE NO SUENA: cada salida de `start` deja aqui su motivo, y el objeto
     se puede leer desde la consola con `paceMusica.ultimo`.
     ESTO NO ES INSTRUMENTACION DE LUJO, ES EL ARREGLO DE UN DEFECTO. La primera
     version se tragaba TODAS las salidas en silencio -- seis returns mudos y un
     `catch` vacio sobre la promesa de `play()`-- asi que «no se oye nada» no se
     distinguia de «esta familia no tiene pieza». Costo tres vueltas de
     diagnostico averiguar cual de los dos era. */
  let ultimo = { motivo: 'sin intentar' };

  function activa() { return !!audio; }
  function no(motivo, extra) {
    ultimo = Object.assign({ motivo }, extra || {});
    return undefined;
  }

  function start(tag, forzarDrone) {
    if (audio) return no('ya sonaba');
    /* El drone forzado gana: `Coherente 432` es una rutina cuyo fondo ES el
       drone, y ponerle musica encima seria las dos capas a la vez. */
    if (forzarDrone) return no('la rutina fuerza su drone (Coherente 432)');
    let s = null;
    try { s = typeof getState === 'function' ? getState() : null; } catch (e) { s = null; }
    if (!s) return no('no hay estado');
    if (!s.soundOn) return no('el sonido maestro esta apagado');
    if (!s.musicOn) return no('el fondo no esta en Musica');
    const ficha = PACE_MUSICA[tag];
    if (!ficha) return no('esta familia no tiene pieza', { tag: tag, hay: Object.keys(PACE_MUSICA) });
    try {
      const a = new Audio(ficha.archivo);
      a.preload = 'auto';
      /* EL BUCLE SE ENCIENDE POR PIEZA. Esta dura 2:09 y las rutinas van de 3 a
         20 minutos, asi que sin bucle la mayor parte de la sesion iria en
         silencio y no se podria juzgar el conjunto. El precio esta medido y se
         oira: el archivo sale con un fundido de **-36,6 dB** en su ultimo
         segundo, o sea que en cada vuelta hay un bajon de ~1 s. Recortar ese
         fundido es edicion de audio, no codigo. */
      a.loop = ficha.bucle === true;
      a.volume = ficha.ganancia;
      /* Si el archivo no esta, no suena fondo -- el standalone no lleva los MP3
         por construccion (el build solo inlinea .webp), igual que con la voz.
         Pero se DEJA DICHO, que es lo que faltaba. */
      a.addEventListener('error', () => { audio = null; ultimo = { motivo: 'el archivo no carga', src: ficha.archivo }; });
      const pr = a.play();
      if (pr && pr.catch) pr.catch((e) => { audio = null; ultimo = { motivo: 'el navegador rechazo play()', error: e && e.name }; });
      audio = a;
      ultimo = { motivo: 'sonando', src: ficha.archivo, ganancia: ficha.ganancia };
    } catch (e) { audio = null; no('excepcion al crear el Audio', { error: e && e.message }); }
  }

  function pause() { try { if (audio) audio.pause(); } catch (e) { /* da igual */ } }
  function resume() {
    try {
      if (!audio) return;
      const pr = audio.play();
      if (pr && pr.catch) pr.catch(() => { /* el navegador manda */ });
    } catch (e) { /* da igual */ }
  }

  /* Se apaga con un fundido corto y no de golpe: un corte seco en una sesion de
     respiracion se oye como un fallo. 400 ms es lo que usa el drone. */
  function stop(ms) {
    if (!audio) return;
    const a = audio;
    audio = null;
    const paso = 40;
    const total = Math.max(paso, ms || 400);
    const caida = a.volume / (total / paso);
    const id = setInterval(() => {
      try {
        if (a.volume > caida) { a.volume = a.volume - caida; return; }
        clearInterval(id);
        a.pause();
      } catch (e) { clearInterval(id); }
    }, paso);
  }

  /* `ultimo` es una PROPIEDAD y no una copia: se lee en el momento, no en el
     momento de construir el objeto. */
  return {
    start, stop, pause, resume, isActive: activa,
    get ultimo() { return ultimo; },
  };
})();

Object.assign(window, { paceMusica, PACE_MUSICA });
