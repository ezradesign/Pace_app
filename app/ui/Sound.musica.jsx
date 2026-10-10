/* PACE · app/ui/Sound.musica.jsx
   ================================
   LA MÚSICA DE FONDO DE RESPIRA, Y CÓMO RESPIRA CON EL EJERCICIO.
   Tercera capa de sonido, junto al tono/voz de señal y al drone de ambiente.

   TRES DRONES EN SOL Y UNA RECETA POR TÉCNICA. Los drones salen de las pistas
   de ElevenLabs que pasaron la criba de las 20 generadas en Genspark; van en
   Sol con La = 432, mono a 64 kbps, con el bucle cerrado por un fundido y al
   mismo nivel (-20 dBFS de RMS). Cada técnica los monta a su manera
   (`PACE_MUSICA_TECNICA`, en `Sound.musica.parts.jsx`): otra nota de la escala
   de Sol, un color, una segunda voz suave y, en algunas, un movimiento lento.
   Decisión de Ez del 8 oct. 2026, escuchándolas; el análisis, la página y el
   medidor viven en `docs/traspaso/archivos/musica-respira/`.

   EL MISMO MOTOR QUE LA PÁGINA DE ESCUCHA. Los drones se descodifican y suenan
   en bucle dentro de Web Audio, no en un <audio>: así lo que suena es lo que Ez
   escuchó y lo que se midió, la segunda voz puede cambiar de nota con
   `playbackRate` (un <audio> conserva el tono según el navegador) y el bucle
   salta el relleno del MP3 en vez de dejar un hueco en cada vuelta. Se
   descodifican a 22 050 Hz: los drones no tienen nada útil por encima de
   9 kHz y así un drone ocupa unos 17 MB en memoria y no 38. De paso el service
   worker los guarda enteros, que con el <audio> no pasaba (pedía trozos, 206).

   LA MÚSICA RESPIRA EN DIRECTO. Decisión de Ez («mixto»): en los ejercicios de
   ciclo fijo se abre al inhalar, se queda quieta al sostener y se cierra al
   exhalar. `playPhaseSound` llama a `fase()` en cada fase con su duración y su
   etiqueta, y aquí se mueven a la vez el volumen, el brillo (un paso-bajo), la
   segunda voz si respira más y el lado en Nadi Shodhana, con una curva de
   coseno, sin aristas que suenen a ataque encima de la voz. Con ciclos de
   menos de 5 s (Rondas, Bhastrika, Kapalabhati) la música queda quieta.

   LA GANANCIA SE IGUALA POR RMS Y NO POR PICO. 0,158 sobre un drone a -20 dBFS
   de RMS deja el cuerpo en -36 dBFS, el nivel del drone de ambiente y unos 7 dB
   por debajo de la locución más floja. El `ajusteDb` de cada receta, medido,
   deja su volumen medio igual que el del drone de su familia.

   NUNCA SUENA A LA VEZ QUE EL DRONE. «Qué suena detrás» es UNA elección; la
   interfaz mantiene la exclusión, y aquí se defiende otra vez porque
   `Coherente 432` FUERZA su drone pase lo que pase.

   Consume: getState y paceAudioCtx (Sound.jsx), PACE_MUSICA_TECNICA (.parts).
   Exporta los verbos en window, igual que `ambientDrone`. */

const PACE_MUSICA_BASES = {
  claro: 'app/breathe/musica/sol-claro.mp3',
  calido: 'app/breathe/musica/sol-calido.mp3',
  menor: 'app/breathe/musica/sol-menor.mp3',
};

/* El drone de cada familia, por el `tag` de la rutina. Es la reserva: suena así
   una técnica que no tenga receta propia (las de un viaje futuro, por ejemplo).
   Claro: quinta abierta Sol-Re. Cálido: cuerdas con una tercera mayor suave.
   Menor: alfombra oscura con tercera menor. */
const PACE_MUSICA = {
  ENE: 'claro', EQU: 'calido', BAL: 'claro', REL: 'menor', PRA: 'claro', KRI: 'claro',
};

const PACE_MUSICA_GANANCIA = 0.158;

/* La envolvente de la reserva: el volumen baja `profundidadDb` con el pulmón
   vacío y el paso-bajo se cierra hasta `cerradoHz`. `cicloMinimo`: por debajo,
   la música no se mueve. Una receta puede traer su `filtro` y su `prof`. */
const PACE_MUSICA_RESPIRA = { profundidadDb: 3, cerradoHz: 650, abiertoHz: 9000, cicloMinimo: 5 };
const PACE_MUSICA_HZ_DESCODIFICAR = 22050;

const paceMusica = (() => {
  /* La sesión de música en curso: existe desde `start` aunque los drones aún
     se estén descodificando, para que la pausa y la salida lleguen igual. */
  let sesion = null;
  /* POR QUÉ NO SUENA: cada salida de `start` deja aquí su motivo, legible desde
     la consola con `paceMusica.ultimo`. */
  let ultimo = { motivo: 'sin intentar' };
  /* La fase en curso, se oiga ya la música o no. Las fases empiezan en el mismo
     render que la música y los drones tardan en llegar: al montarse, la
     envolvente se coloca en el punto de la fase por el que va la voz. */
  let faseAhora = null;
  let metaPrevia = 0;
  const descodificados = {};

  const dbLin = (db) => Math.pow(10, (db || 0) / 20);
  function ctxAudio() {
    try { return typeof window.paceAudioCtx === 'function' ? window.paceAudioCtx() : null; } catch (e) { return null; }
  }
  function no(motivo, extra) {
    ultimo = Object.assign({ motivo }, extra || {});
    return undefined;
  }

  function descodificar(base, ctx) {
    if (!descodificados[base]) {
      descodificados[base] = fetch(PACE_MUSICA_BASES[base])
        .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
        .then((ab) => {
          let dc = ctx;
          const Fuera = window.OfflineAudioContext || window.webkitOfflineAudioContext;
          try { if (Fuera) dc = new Fuera(1, 1, PACE_MUSICA_HZ_DESCODIFICAR); } catch (e) { dc = ctx; }
          return new Promise((ok, ko) => { const p = dc.decodeAudioData(ab, ok, ko); if (p && p.then) p.then(ok, ko); });
        })
        .catch((e) => { delete descodificados[base]; throw e; });
    }
    return descodificados[base];
  }

  /* Media onda de coseno desde donde esté el parámetro. cancelAndHold congela
     el valor real si una fase anterior se cortó (pausa). */
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
  function fijar(p, v, t) {
    if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else p.cancelScheduledValues(t);
    p.setValueAtTime(v, t);
  }

  /* El grafo de una receta. Las fuentes se crean aparte porque la pausa las
     para y la reanudación las vuelve a crear en el punto en que iban. */
  function montar(ctx, rec, quieto, bufs) {
    const filtro = rec.filtro || { c: PACE_MUSICA_RESPIRA.cerradoHz, a: PACE_MUSICA_RESPIRA.abiertoHz, q: 0.5 };
    const prof = quieto ? 0 : (rec.prof != null ? rec.prof : PACE_MUSICA_RESPIRA.profundidadDb);
    const prof2 = (!quieto && rec.voz2 && rec.voz2.prof) || 0;
    const n = { ctx, rec, quieto, filtro, bufs, fuentes: [], lfos: [], deriva: null };
    n.volDe = (v) => Math.pow(10, (v - 1) * prof / 20);
    n.vol2De = (v) => Math.pow(10, (v - 1) * prof2 / 20);
    n.brilloDe = (v) => (quieto ? filtro.a : filtro.c * Math.pow(filtro.a / filtro.c, v));
    n.prof2 = prof2;
    const bq = (tipo, hz, q, db) => { const b = ctx.createBiquadFilter(); b.type = tipo; b.frequency.value = hz; if (q != null) b.Q.value = q; if (db != null) b.gain.value = db; return b; };

    const suma = ctx.createGain();
    n.g1 = ctx.createGain(); n.g1.connect(suma);
    if (rec.voz2) {
      n.lp2 = bq('lowpass', rec.voz2.lp || 20000, 0.5);
      const g2 = ctx.createGain(); g2.gain.value = dbLin(rec.voz2.db);
      n.env2 = ctx.createGain(); n.mov2 = ctx.createGain();
      n.lp2.connect(g2); g2.connect(n.env2); n.env2.connect(n.mov2); n.mov2.connect(suma);
    }
    let x = suma;
    (rec.tinte || []).forEach((tt) => { const b = bq(tt.t, tt.hz, tt.q, tt.db); x.connect(b); x = b; });
    n.filtroNodo = bq('lowpass', filtro.a, filtro.q);
    x.connect(n.filtroNodo); x = n.filtroNodo;

    /* Movimiento lento: un oscilador de muy baja frecuencia sumado al parámetro. */
    const t0 = ctx.currentTime;
    const lfo = (periodo, amp, param) => {
      const o = ctx.createOscillator(); o.frequency.value = 1 / periodo;
      const ga = ctx.createGain(); ga.gain.value = amp;
      o.connect(ga); if (param) ga.connect(param); o.start(t0); n.lfos.push(o);
      return ga;
    };
    const mov = rec.mov || {};
    if (mov.tipo === 'brillo') {
      const lpm = bq('lowpass', (mov.de + mov.a) / 2, 0.5);
      lfo(mov.periodo, (mov.a - mov.de) / 2, lpm.frequency);
      x.connect(lpm); x = lpm;
    }
    if (mov.tipo === 'voz' && n.mov2) { n.mov2.gain.value = 0.55; lfo(mov.periodo, 0.45, n.mov2.gain); }
    if (mov.tipo === 'cruce' && n.mov2) {
      n.g1.gain.value = 0.8; lfo(mov.periodo, 0.2, n.g1.gain);
      n.mov2.gain.value = 0.6; lfo(mov.periodo, -0.4, n.mov2.gain);
    }
    if (mov.tipo === 'deriva' && rec.voz2) n.deriva = lfo(mov.periodo, rec.voz2.ratio * (Math.pow(2, mov.cents / 1200) - 1), null);

    n.env = ctx.createGain(); x.connect(n.env); x = n.env;
    if (rec.pan && ctx.createStereoPanner) { n.pan = ctx.createStereoPanner(); x.connect(n.pan); x = n.pan; }
    const ajuste = ctx.createGain(); ajuste.gain.value = dbLin(rec.ajusteDb);
    n.vol = ctx.createGain(); n.vol.gain.value = 0;
    x.connect(ajuste); ajuste.connect(n.vol); n.vol.connect(ctx.destination);

    const v0 = quieto ? 1 : 0;
    n.env.gain.value = n.volDe(v0);
    n.filtroNodo.frequency.value = n.brilloDe(v0);
    if (n.env2) n.env2.gain.value = n.vol2De(v0);
    return n;
  }

  /* Bucle de un drone. Se saltan 60 ms de cada extremo: el relleno del MP3
     dejaría un hueco en cada vuelta. `pos` es el segundo del archivo por el que
     arranca (la segunda voz empieza en otro punto para no ir en fase). */
  function fuente(n, buf, ratio, pos, destino, t) {
    const s = n.ctx.createBufferSource();
    s.buffer = buf; s.loop = true;
    s.loopStart = 0.06; s.loopEnd = buf.duration - 0.06;
    s.playbackRate.value = ratio || 1;
    const vuelta = s.loopEnd - s.loopStart;
    s.connect(destino);
    s.start(t, s.loopStart + (((pos % vuelta) + vuelta) % vuelta));
    return { s, pos, ratio: ratio || 1, t };
  }
  function crearFuentes(n, t) {
    const r = n.rec;
    const pos1 = n.pos1 != null ? n.pos1 : (r.of || 0);
    n.fuentes = [fuente(n, n.bufs[r.base], r.ratio, pos1, n.g1, t)];
    if (r.voz2) {
      const pos2 = n.pos2 != null ? n.pos2 : (r.voz2.of == null ? 31 : r.voz2.of);
      const f2 = fuente(n, n.bufs[r.voz2.base], r.voz2.ratio, pos2, n.lp2, t);
      if (n.deriva) n.deriva.connect(f2.s.playbackRate);
      n.fuentes.push(f2);
    }
  }
  function pararFuentes(n, t) {
    if (n.fuentes[0]) n.pos1 = n.fuentes[0].pos + (t - n.fuentes[0].t) * n.fuentes[0].ratio;
    if (n.fuentes[1]) n.pos2 = n.fuentes[1].pos + (t - n.fuentes[1].t) * n.fuentes[1].ratio;
    n.fuentes.forEach((f) => { try { f.s.stop(t); } catch (e) { /* ya parada */ } });
    n.fuentes = [];
  }

  /* Lleva la envolvente hacia `v` (0 cerrada, 1 abierta) en `d` segundos. */
  function mover(n, v, d, lado) {
    try {
      const t = n.ctx.currentTime;
      n.objetivo = { v, fin: t + d, lado };
      rampa(n.env.gain, n.volDe(v), t, d, false);
      rampa(n.filtroNodo.frequency, n.brilloDe(v), t, d, true);
      if (n.prof2) rampa(n.env2.gain, n.vol2De(v), t, d, false);
      if (n.pan && lado) {
        const destino = lado === 'izq' ? -n.rec.pan : n.rec.pan;
        if (Math.abs(n.pan.pan.value - destino) > 0.01) rampa(n.pan.pan, destino, t, d, false);
      }
    } catch (e) { /* una rampa perdida no puede parar la sesión */ }
  }
  /* Coloca la envolvente donde va la fase en curso: la música que llega tarde
     entra en el compás de la voz y no a destiempo hasta la fase siguiente. */
  function alcanzar(n) {
    const f = faseAhora;
    if (!f || n.quieto) return;
    const pasado = (Date.now() - f.inicio) / 1000;
    const t = n.ctx.currentTime;
    if (pasado >= f.dur - 0.2) {
      fijar(n.env.gain, n.volDe(f.hasta), t); fijar(n.filtroNodo.frequency, n.brilloDe(f.hasta), t);
      if (n.prof2) fijar(n.env2.gain, n.vol2De(f.hasta), t);
      if (n.pan && f.lado) fijar(n.pan.pan, f.lado === 'izq' ? -n.rec.pan : n.rec.pan, t);
      return;
    }
    const k = 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, pasado) / f.dur);
    const v = f.desde + (f.hasta - f.desde) * k;
    fijar(n.env.gain, n.volDe(v), t); fijar(n.filtroNodo.frequency, n.brilloDe(v), t);
    if (n.prof2) fijar(n.env2.gain, n.vol2De(v), t);
    mover(n, f.hasta, (f.dur - pasado) * 0.97, f.lado);
  }

  /* tipo: 'in' abre, 'out' cierra, 'hold' deja la música donde está.
     `etiqueta` es la de la fase en pantalla: dice el lado en Nadi Shodhana y
     distingue la primera inhalación del Suspiro de «Inhala más». */
  function fase(tipo, dur, etiqueta) {
    if (tipo !== 'in' && tipo !== 'out') return;
    if (!(dur > 0)) return;
    const et = String(etiqueta || '');
    const lado = /izq\./.test(et) ? 'izq' : /dcha\./.test(et) ? 'dcha' : null;
    const rec = sesion && sesion.rec;
    let hasta = tipo === 'in' ? 1 : 0;
    if (tipo === 'in' && rec && rec.primeraInhalacion && et === 'Inhala') hasta = rec.primeraInhalacion;
    faseAhora = { desde: metaPrevia, hasta, inicio: Date.now(), dur, lado, etiqueta: et };
    metaPrevia = hasta;
    const n = sesion && sesion.nodos;
    if (!n || n.quieto || sesion.pausada) return;
    mover(n, hasta, Math.max(0.2, dur * 0.97), lado);
  }

  function start(tag, forzarDrone, cicloSeg, rutinaId) {
    if (sesion) return no('ya sonaba');
    if (forzarDrone) return no('la rutina fuerza su drone (Coherente 432)');
    let s = null;
    try { s = typeof getState === 'function' ? getState() : null; } catch (e) { s = null; }
    if (!s) return no('no hay estado');
    if (!s.soundOn) return no('el sonido maestro esta apagado');
    if (!s.musicOn) return no('el fondo no esta en Musica');
    const propia = (window.PACE_MUSICA_TECNICA || {})[rutinaId];
    const rec = propia || (PACE_MUSICA[tag] ? { base: PACE_MUSICA[tag] } : null);
    if (!rec || !PACE_MUSICA_BASES[rec.base]) return no('esta familia no tiene pieza', { tag: tag });
    const ctx = ctxAudio();
    if (!ctx) return no('sin Web Audio');
    const quieto = !(typeof cicloSeg === 'number' && cicloSeg >= PACE_MUSICA_RESPIRA.cicloMinimo);
    const yo = { rec, quieto, receta: propia ? rutinaId : null, nodos: null, pausada: false };
    sesion = yo;
    if (!faseAhora || Date.now() - faseAhora.inicio > faseAhora.dur * 1000) { faseAhora = null; metaPrevia = 0; }
    /* La primera fase pudo llegar antes de saber la receta (el mismo render). */
    if (faseAhora && rec.primeraInhalacion && faseAhora.etiqueta === 'Inhala') { faseAhora.hasta = rec.primeraInhalacion; metaPrevia = faseAhora.hasta; }
    const src = PACE_MUSICA_BASES[rec.base];
    ultimo = { motivo: 'cargando', src, receta: yo.receta, respira: !quieto };
    const bases = [rec.base].concat(rec.voz2 ? [rec.voz2.base] : []);
    /* Solo se guardan en memoria los drones de esta técnica. */
    Object.keys(descodificados).forEach((b) => { if (bases.indexOf(b) < 0) delete descodificados[b]; });
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) { /* el navegador manda */ } }
    Promise.all(bases.map((b) => descodificar(b, ctx))).then((lista) => {
      if (sesion !== yo) return;
      const bufs = {};
      bases.forEach((b, k) => { bufs[b] = lista[k]; });
      const n = montar(ctx, rec, quieto, bufs);
      yo.nodos = n;
      alcanzar(n);
      if (!yo.pausada) {
        const t = ctx.currentTime;
        crearFuentes(n, t);
        n.vol.gain.setValueAtTime(0, t);
        n.vol.gain.linearRampToValueAtTime(PACE_MUSICA_GANANCIA, t + 1.2);
      }
      ultimo = { motivo: 'sonando', src, receta: yo.receta, respira: !quieto };
    }).catch((e) => {
      /* Solo si sigue siendo ESTA música: un error tardío de una sesión ya
         cerrada no puede apagar la de la sesión siguiente. Sin los MP3 (el
         standalone no los lleva) no suena fondo, pero queda dicho. */
      if (sesion === yo) sesion = null;
      ultimo = { motivo: 'el archivo no carga', src, error: e && (e.message || e.name) };
    });
    return undefined;
  }

  /* Al pausar, la música se apaga en 300 ms en vez de cortarse en seco y la
     envolvente se queda donde está. Al reanudar vuelve con otro fundido desde
     el punto del drone en que iba, y la fase sigue moviéndola durante lo que
     le quedaba. */
  function pause() {
    try {
      if (!sesion || sesion.pausada) return;
      sesion.pausada = true;
      const n = sesion.nodos;
      if (!n) return;
      const t = n.ctx.currentTime;
      n.restante = n.objetivo ? Math.max(0, n.objetivo.fin - t) : 0;
      [n.env.gain, n.filtroNodo.frequency].concat(n.prof2 ? [n.env2.gain] : [], n.pan ? [n.pan.pan] : []).forEach((p) => {
        if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else { const v = p.value; p.cancelScheduledValues(t); p.setValueAtTime(v, t); }
      });
      const g = n.vol.gain;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0, t + 0.3);
      pararFuentes(n, t + 0.32);
    } catch (e) { /* da igual */ }
  }
  function resume() {
    try {
      if (!sesion || !sesion.pausada) return;
      sesion.pausada = false;
      const n = sesion.nodos;
      if (!n) return;
      const t = n.ctx.currentTime;
      crearFuentes(n, t);
      const g = n.vol.gain;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(PACE_MUSICA_GANANCIA, t + 0.4);
      if (!n.quieto && n.objetivo && n.restante > 0.2) mover(n, n.objetivo.v, n.restante, n.objetivo.lado);
      n.restante = 0;
    } catch (e) { /* da igual */ }
  }

  /* Se apaga con un fundido corto y no de golpe: un corte seco en una sesión de
     respiración se oye como un fallo. 400 ms es lo que usa el drone. */
  function stop(ms) {
    if (!sesion) return;
    const n = sesion.nodos;
    sesion = null;
    faseAhora = null;
    metaPrevia = 0;
    if (!n) return;
    const total = Math.max(40, ms || 400) / 1000;
    try {
      const t = n.ctx.currentTime;
      const g = n.vol.gain;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0, t + total);
      pararFuentes(n, t + total + 0.04);
      n.lfos.forEach((o) => { try { o.stop(t + total + 0.04); } catch (e) { /* ya parado */ } });
      setTimeout(() => { try { n.vol.disconnect(); } catch (e) { /* ya desconectado */ } }, total * 1000 + 120);
    } catch (e) { /* da igual */ }
  }

  /* Para la consola y las pruebas: lo que está sonando ahora mismo. */
  function estado() {
    const n = sesion && sesion.nodos;
    return {
      activa: !!sesion, pausada: !!(sesion && sesion.pausada), cargando: !!sesion && !n,
      receta: sesion ? sesion.receta : null, base: sesion ? sesion.rec.base : null,
      ratio: sesion ? (sesion.rec.ratio || 1) : null, respira: sesion ? !sesion.quieto : null,
      brilloHz: n ? n.filtroNodo.frequency.value : null,
      cerradoHz: n ? n.filtro.c : null, abiertoHz: n ? n.filtro.a : null,
      pan: n && n.pan ? n.pan.pan.value : null, volumen: n ? n.vol.gain.value : null,
      fuentes: n ? n.fuentes.length : 0,
    };
  }

  return {
    start, stop, pause, resume, fase, estado,
    isActive() { return !!sesion; },
    get ultimo() { return ultimo; },
  };
})();

Object.assign(window, { paceMusica, PACE_MUSICA, PACE_MUSICA_BASES, PACE_MUSICA_RESPIRA });
