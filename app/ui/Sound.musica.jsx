/* PACE · app/ui/Sound.musica.jsx
   ================================
   LA MÚSICA DE FONDO DE RESPIRA, Y CÓMO RESPIRA CON EL EJERCICIO.
   Tercera capa de sonido, junto al tono/voz de señal y al drone de ambiente.

   TRES DRONES EN SOL, NO UNA PIEZA POR EJERCICIO. Salen de las pistas de
   ElevenLabs que pasaron la criba de las 20 generadas en Genspark (las otras
   16 eran canciones: melodía, acordes, batería u otra tonalidad). Van ya en
   Sol con La = 432, mono a 64 kbps, con el bucle cerrado por un fundido y al
   mismo nivel (-20 dBFS de RMS). El análisis y los scripts que los preparan
   viven en `docs/traspaso/archivos/musica-respira/`.

   LA MÚSICA RESPIRA EN DIRECTO. Decisión de Ez («mixto»): en los ejercicios de
   ciclo fijo, la música se abre al inhalar, se queda quieta al sostener y se
   cierra al exhalar. No va grabado en el archivo: `playPhaseSound` llama a
   `fase()` en cada fase con su duración, y aquí se mueven a la vez el volumen
   y el brillo (un paso-bajo) con una curva de coseno, sin aristas que suenen a
   ataque encima de la voz. Así nunca se desfasa, tampoco al pausar, y no hace
   falta un archivo por ejercicio. Con ciclos de 4 s o menos (Rondas, Bhastrika,
   Kapalabhati) la música queda quieta: moverse tan rápido cansa y compite con
   la voz.

   LA GANANCIA SE IGUALA POR RMS Y NO POR PICO. El pico no es el volumen que se
   oye: igualar picos dejó una pieza 20 dB por debajo de la voz y nadie la oía.
   0,158 sobre un drone a -20 dBFS de RMS deja el cuerpo en -36 dBFS, el nivel
   del drone de ambiente y unos 7 dB por debajo de la locución más floja.

   NUNCA SUENA A LA VEZ QUE EL DRONE. «Qué suena detrás» es UNA elección; la
   interfaz mantiene la exclusión, y aquí se defiende otra vez porque
   `Coherente 432` FUERZA su drone pase lo que pase.

   Consume: getState y paceAudioCtx (Sound.jsx los publica). Exporta los
   verbos en window, igual que `ambientDrone`. */

const PACE_MUSICA_BASES = {
  claro: 'app/breathe/musica/sol-claro.mp3',
  calido: 'app/breathe/musica/sol-calido.mp3',
  menor: 'app/breathe/musica/sol-menor.mp3',
};

/* Qué drone suena en cada familia, por el `tag` de la rutina (viaja dentro del
   objeto de rutina, así que la sesión no necesita saber de qué grupo venía).
   Cambiar el reparto es cambiar esta tabla y nada más. Claro: quinta abierta
   Sol-Re, luminosa (y la afinación Sa-Pa de un tanpura). Cálido: cuerdas largas
   con una tercera mayor suave. Menor: alfombra oscura con tercera menor. */
const PACE_MUSICA = {
  ENE: 'claro', EQU: 'calido', BAL: 'claro', REL: 'menor', PRA: 'claro', KRI: 'claro',
};

const PACE_MUSICA_GANANCIA = 0.158;

/* Cuánto respira: el volumen baja `profundidadDb` con el pulmón vacío y el
   paso-bajo se cierra hasta `cerradoHz`; con el pulmón lleno está abierto.
   `cicloMinimo`: por debajo, la música no se mueve. */
const PACE_MUSICA_RESPIRA = { profundidadDb: 3, cerradoHz: 650, abiertoHz: 9000, cicloMinimo: 5 };

const paceMusica = (() => {
  let audio = null;
  let nodos = null;
  let respira = false;
  /* La fase que llegó antes que la música: el efecto que arranca la música y el
     que suena la primera fase corren en el mismo render, en un orden que no se
     controla desde aquí. Sin esto la primera inhalación se quedaba cerrada. */
  let pendiente = null;
  /* POR QUÉ NO SUENA: cada salida de `start` deja aquí su motivo, legible desde
     la consola con `paceMusica.ultimo`. Sin él, «no se oye nada» no se distingue
     de «esta familia no tiene pieza». */
  let ultimo = { motivo: 'sin intentar' };
  /* Hacia dónde iba la fase en curso y cuándo acaba (en tiempo del contexto).
     La pausa congela la envolvente a medio camino y para el reloj de la fase;
     al reanudar, el resto de la fase tiene que seguir moviéndola o la música
     se queda quieta hasta la fase siguiente, a destiempo de la voz. */
  let objetivo = null;
  let restante = 0;
  /* El fundido de la pausa acaba en `audio.pause()` con un temporizador; si se
     reanuda antes, ese temporizador no puede llegar a pausar. */
  let pausaId = null;
  const cfg = PACE_MUSICA_RESPIRA;

  function activa() { return !!audio; }
  function no(motivo, extra) {
    ultimo = Object.assign({ motivo }, extra || {});
    return undefined;
  }
  function ctxAudio() {
    try { return typeof window.paceAudioCtx === 'function' ? window.paceAudioCtx() : null; } catch (e) { return null; }
  }
  const volDe = (v) => Math.pow(10, (v - 1) * cfg.profundidadDb / 20);
  const brilloDe = (v) => cfg.cerradoHz * Math.pow(cfg.abiertoHz / cfg.cerradoHz, v);

  /* Lleva un parámetro de donde esté a `destino` con media onda de coseno.
     cancelAndHold congela el valor real si una fase anterior se cortó (pausa);
     sin él, cancelar salta al último valor programado. */
  function rampa(p, destino, t, dur, exponencial) {
    const desde = p.value;
    const curva = new Float32Array(32);
    for (let k = 0; k < 32; k++) {
      const x = 0.5 - 0.5 * Math.cos(Math.PI * k / 31);
      curva[k] = exponencial ? desde * Math.pow(destino / desde, x) : desde + (destino - desde) * x;
    }
    if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else p.cancelScheduledValues(t);
    p.setValueCurveAtTime(curva, t + 0.005, dur);
  }

  /* tipo: 'in' abre, 'out' cierra, 'hold' deja la música donde está. */
  function fase(tipo, dur) {
    if (tipo !== 'in' && tipo !== 'out') return;
    if (!(dur > 0)) return;
    if (!audio) { pendiente = { tipo, dur, t: Date.now() }; return; }
    if (!nodos || !respira) return;
    mover(tipo === 'in' ? 1 : 0, Math.max(0.2, dur * 0.97));
  }
  function mover(v, d) {
    try {
      const t = nodos.ctx.currentTime;
      objetivo = { v, fin: t + d };
      rampa(nodos.env.gain, volDe(v), t, d, false);
      rampa(nodos.filtro.frequency, brilloDe(v), t, d, true);
    } catch (e) { /* una rampa perdida no puede parar la sesión */ }
  }

  function start(tag, forzarDrone, cicloSeg) {
    if (audio) return no('ya sonaba');
    if (forzarDrone) return no('la rutina fuerza su drone (Coherente 432)');
    let s = null;
    try { s = typeof getState === 'function' ? getState() : null; } catch (e) { s = null; }
    if (!s) return no('no hay estado');
    if (!s.soundOn) return no('el sonido maestro esta apagado');
    if (!s.musicOn) return no('el fondo no esta en Musica');
    const archivo = PACE_MUSICA_BASES[PACE_MUSICA[tag]];
    if (!archivo) return no('esta familia no tiene pieza', { tag: tag });
    try {
      const a = new Audio(archivo);
      a.preload = 'auto';
      a.loop = true;
      respira = typeof cicloSeg === 'number' && cicloSeg >= cfg.cicloMinimo;
      /* Empieza cerrada: la sesión arranca por una inhalación, que la abre. */
      const v0 = respira ? 0 : 1;
      const ctx = ctxAudio();
      nodos = null;
      if (ctx) {
        try {
          const src = ctx.createMediaElementSource(a);
          const filtro = ctx.createBiquadFilter();
          filtro.type = 'lowpass';
          filtro.Q.value = 0.5;
          filtro.frequency.value = brilloDe(v0);
          const env = ctx.createGain();
          env.gain.value = volDe(v0);
          const vol = ctx.createGain();
          vol.gain.value = PACE_MUSICA_GANANCIA;
          src.connect(filtro); filtro.connect(env); env.connect(vol); vol.connect(ctx.destination);
          nodos = { ctx, src, filtro, env, vol };
          if (ctx.state === 'suspended') ctx.resume();
        } catch (e) { nodos = null; }
      }
      /* Sin Web Audio la música suena igual, quieta y al mismo nivel. */
      if (!nodos) respira = false;
      a.volume = nodos ? 1 : PACE_MUSICA_GANANCIA;
      /* Si el archivo no está (el standalone no lleva los MP3), no suena fondo,
         pero queda dicho. */
      /* Solo si sigue siendo ESTA música: un error tardío de una sesión ya
         cerrada no puede apagar la de la sesión siguiente. */
      a.addEventListener('error', () => { if (audio === a) { audio = null; nodos = null; } ultimo = { motivo: 'el archivo no carga', src: archivo }; });
      const pr = a.play();
      if (pr && pr.catch) pr.catch((e) => { if (audio === a) { audio = null; nodos = null; } ultimo = { motivo: 'el navegador rechazo play()', error: e && e.name }; });
      audio = a;
      objetivo = null;
      restante = 0;
      ultimo = { motivo: 'sonando', src: archivo, respira: respira };
      const p = pendiente;
      pendiente = null;
      if (p && Date.now() - p.t < 1500) fase(p.tipo, p.dur - (Date.now() - p.t) / 1000);
    } catch (e) { audio = null; nodos = null; no('excepcion al crear el Audio', { error: e && e.message }); }
  }

  /* Al pausar, la música se apaga en 300 ms en vez de cortarse en seco y la
     envolvente se queda donde está. Al reanudar vuelve con otro fundido y la
     fase sigue moviéndola durante lo que le quedaba. */
  function pause() {
    try {
      if (!audio) return;
      const a = audio;
      clearTimeout(pausaId);
      if (!nodos) { a.pause(); return; }
      const t = nodos.ctx.currentTime;
      restante = objetivo ? Math.max(0, objetivo.fin - t) : 0;
      [nodos.env.gain, nodos.filtro.frequency].forEach((p) => {
        if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else { const v = p.value; p.cancelScheduledValues(t); p.setValueAtTime(v, t); }
      });
      const g = nodos.vol.gain;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(0, t + 0.3);
      pausaId = setTimeout(() => { try { a.pause(); } catch (e) {} }, 320);
    } catch (e) { /* da igual */ }
  }
  function resume() {
    try {
      if (!audio) return;
      clearTimeout(pausaId);
      pausaId = null;
      const pr = audio.play();
      if (pr && pr.catch) pr.catch(() => { /* el navegador manda */ });
      if (!nodos) return;
      const t = nodos.ctx.currentTime;
      const g = nodos.vol.gain;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(PACE_MUSICA_GANANCIA, t + 0.4);
      if (respira && objetivo && restante > 0.2) mover(objetivo.v, restante);
      restante = 0;
    } catch (e) { /* da igual */ }
  }

  /* Se apaga con un fundido corto y no de golpe: un corte seco en una sesión de
     respiración se oye como un fallo. 400 ms es lo que usa el drone. */
  function stop(ms) {
    if (!audio) return;
    const a = audio;
    const n = nodos;
    audio = null;
    nodos = null;
    pendiente = null;
    objetivo = null;
    clearTimeout(pausaId);
    pausaId = null;
    const total = Math.max(40, ms || 400);
    /* Con Web Audio el fundido va en la ganancia: Safari no deja bajar
       `volume` a un <audio> que suena a través del contexto. */
    if (n) {
      try {
        const t = n.ctx.currentTime;
        const g = n.vol.gain;
        g.cancelScheduledValues(t);
        g.setValueAtTime(g.value, t);
        g.linearRampToValueAtTime(0, t + total / 1000);
      } catch (e) { /* abajo se apaga igual */ }
      setTimeout(() => { try { a.pause(); n.vol.disconnect(); } catch (e) {} }, total + 40);
      return;
    }
    const paso = 40;
    const caida = a.volume / (total / paso);
    const id = setInterval(() => {
      try {
        if (a.volume > caida) { a.volume = a.volume - caida; return; }
        clearInterval(id);
        a.pause();
      } catch (e) { clearInterval(id); }
    }, paso);
  }

  return {
    start, stop, pause, resume, fase, isActive: activa,
    get ultimo() { return ultimo; },
  };
})();

Object.assign(window, { paceMusica, PACE_MUSICA, PACE_MUSICA_BASES, PACE_MUSICA_RESPIRA });
