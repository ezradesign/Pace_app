/* El motor de las variaciones: monta en un AudioContext (en directo o fuera de línea) la receta de
   una técnica sobre los drones base y la hace respirar con sus fases. Lo usan la página de escucha
   y el medidor, así que lo que se mide es exactamente lo que suena.

   Cadena: voz principal + segunda voz → tinte → paso-bajo de la respiración → movimiento de
   brillo → volumen de la respiración → paneo → ajuste de nivel → salida.
   La envolvente es la de app/ui/Sound.musica.jsx: media onda de coseno por fase, volumen de
   -prof dB a 0 dB y paso-bajo exponencial de `c` a `a`. */
(function (g) {
  const FILTRO_HOY = { c: 650, a: 9000, q: 0.5 };
  const dbLin = (db) => Math.pow(10, (db || 0) / 20);

  /* Lo que suena hoy en esa técnica: el drone de su familia con la envolvente de la app. */
  function recetaHoy(fam) { return { base: fam.hoy, ratio: 1, filtro: FILTRO_HOY, prof: 3 }; }

  function curva(desde, hasta, n, fn) {
    const a = new Float32Array(n);
    for (let k = 0; k < n; k++) { const x = 0.5 - 0.5 * Math.cos(Math.PI * k / (n - 1)); a[k] = fn(desde + (hasta - desde) * x); }
    return a;
  }

  /* Bucle de un drone. Se saltan 60 ms de cada extremo: el relleno del MP3 dejaría un hueco en cada
     vuelta. `of` arranca la voz en otro punto del archivo para que dos copias no vayan en fase. */
  function fuente(ctx, buf, ratio, t0, of) {
    const s = ctx.createBufferSource();
    s.buffer = buf; s.loop = true;
    s.loopStart = 0.06; s.loopEnd = buf.duration - 0.06;
    s.playbackRate.value = ratio || 1;
    s.start(t0, Math.min(buf.duration - 1, 0.06 + (of || 0)));
    return s;
  }

  function biquad(ctx, tipo, hz, q, db) {
    const b = ctx.createBiquadFilter();
    b.type = tipo; b.frequency.value = hz;
    if (q != null) b.Q.value = q;
    if (db != null) b.gain.value = db;
    return b;
  }

  function montar(ctx, rec, bufs, destino, t0, quieto) {
    const filtro = rec.filtro || FILTRO_HOY;
    const fuentes = [];
    const suma = ctx.createGain();

    const s1 = fuente(ctx, bufs[rec.base], rec.ratio, t0, rec.of || 0);
    const g1 = ctx.createGain();
    s1.connect(g1); g1.connect(suma); fuentes.push(s1);

    let s2 = null, g2env = null, g2mov = null;
    if (rec.voz2) {
      const v = rec.voz2;
      s2 = fuente(ctx, bufs[v.base], v.ratio, t0, v.of == null ? 31 : v.of);
      const lp2 = biquad(ctx, 'lowpass', v.lp || 20000, 0.5);
      const g2 = ctx.createGain(); g2.gain.value = dbLin(v.db);
      g2env = ctx.createGain(); g2mov = ctx.createGain();
      s2.connect(lp2); lp2.connect(g2); g2.connect(g2env); g2env.connect(g2mov); g2mov.connect(suma);
      fuentes.push(s2);
    }

    let x = suma;
    (rec.tinte || []).forEach((t) => { const b = biquad(ctx, t.t, t.hz, t.q, t.db); x.connect(b); x = b; });
    const fr = biquad(ctx, 'lowpass', filtro.a, filtro.q);
    x.connect(fr); x = fr;

    /* Movimiento lento: un oscilador de muy baja frecuencia sumado al parámetro. */
    const lfo = (periodo, amp, param) => {
      const o = ctx.createOscillator(); o.frequency.value = 1 / periodo;
      const ga = ctx.createGain(); ga.gain.value = amp;
      o.connect(ga); ga.connect(param); o.start(t0); fuentes.push(o);
    };
    const mov = rec.mov || {};
    if (mov.tipo === 'brillo') {
      const lpm = biquad(ctx, 'lowpass', (mov.de + mov.a) / 2, 0.5);
      lfo(mov.periodo, (mov.a - mov.de) / 2, lpm.frequency);
      x.connect(lpm); x = lpm;
    }
    if (mov.tipo === 'voz' && g2mov) { g2mov.gain.value = 0.55; lfo(mov.periodo, 0.45, g2mov.gain); }
    if (mov.tipo === 'cruce' && g2mov) {
      g1.gain.value = 0.8; lfo(mov.periodo, 0.2, g1.gain);
      g2mov.gain.value = 0.6; lfo(mov.periodo, -0.4, g2mov.gain);
    }
    if (mov.tipo === 'deriva' && s2) lfo(mov.periodo, rec.voz2.ratio * (Math.pow(2, mov.cents / 1200) - 1), s2.playbackRate);

    const env = ctx.createGain();
    x.connect(env);
    let pan = null, y = env;
    if (rec.pan && ctx.createStereoPanner) { pan = ctx.createStereoPanner(); env.connect(pan); y = pan; }
    const ajuste = ctx.createGain(); ajuste.gain.value = dbLin(rec.ajusteDb);
    y.connect(ajuste); ajuste.connect(destino);

    const prof = quieto ? 0 : (rec.prof != null ? rec.prof : 3);
    const prof2 = (!quieto && rec.voz2 && rec.voz2.prof) || 0;
    const ganDe = (m) => Math.pow(10, (m - 1) * prof / 20);
    const gan2De = (m) => Math.pow(10, (m - 1) * prof2 / 20);
    const freqDe = (m) => (quieto ? filtro.a : filtro.c * Math.pow(filtro.a / filtro.c, m));
    const m0 = quieto ? 1 : 0;
    env.gain.setValueAtTime(ganDe(m0), t0);
    fr.frequency.setValueAtTime(freqDe(m0), t0);
    if (g2env) g2env.gain.setValueAtTime(gan2De(m0), t0);
    let panAhora = 0;
    if (pan) pan.pan.setValueAtTime(0, t0);

    return {
      /* Una fase que lleva la apertura de `desde` a `hasta` (0 cerrada, 1 abierta) en `d` s. */
      fase(desde, hasta, t, d, lado) {
        if (quieto) return;
        const dd = d * 0.98;
        if (hasta !== desde) {
          env.gain.setValueCurveAtTime(curva(desde, hasta, 64, ganDe), t, dd);
          fr.frequency.setValueCurveAtTime(curva(desde, hasta, 64, freqDe), t, dd);
          if (prof2) g2env.gain.setValueCurveAtTime(curva(desde, hasta, 64, gan2De), t, dd);
        }
        if (pan && lado) {
          const destinoPan = lado === 'izq' ? -rec.pan : rec.pan;
          if (destinoPan !== panAhora) { pan.pan.setValueCurveAtTime(curva(panAhora, destinoPan, 64, (p) => p), t, dd); panAhora = destinoPan; }
        }
      },
      parar(t) { fuentes.forEach((s) => { try { s.stop(t); } catch (e) { /* ya parada */ } }); },
    };
  }

  /* El drone propio de Coherente 432, copiado de ambientDrone (app/ui/Sound.jsx): un seno en Sol
     grave (96,22 Hz con La = 432) a 0,02, con un vaivén de ±0,002 cada 10 s. No pasa por la
     ganancia de la música: en la app suena a ese nivel absoluto. */
  function montar432(ctx, destino, t0) {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 432 * Math.pow(2, -26 / 12);
    const gn = ctx.createGain(); gn.gain.value = 0.02;
    const l = ctx.createOscillator(); l.frequency.value = 0.1;
    const lg = ctx.createGain(); lg.gain.value = 0.002;
    l.connect(lg); lg.connect(gn.gain); o.connect(gn); gn.connect(destino);
    o.start(t0); l.start(t0);
    return { fase() {}, parar(t) { try { o.stop(t); l.stop(t); } catch (e) { /* ya parado */ } } };
  }

  /* Programa todas las fases que empiezan antes de `tFin`. Igual que la app: la inhalación abre,
     la primera del suspiro llega a 0,8, la exhalación cierra y el sostén deja la música quieta. */
  function programarHasta(plan, tec, motor, tFin, alSenal) {
    while (plan.t < tFin) {
      const p = tec.f[plan.idx % tec.f.length];
      const hasta = p.t === 'i' ? 1 : p.t === 'i2' ? 0.8 : p.t === 'e' ? 0 : plan.m;
      motor.fase(plan.m, hasta, plan.t, p.d, p.lado);
      if (alSenal) alSenal(p, plan.t);
      plan.fases.push({ t: plan.t, d: p.d, txt: p.txt, desde: plan.m, hasta });
      if (plan.fases.length > 8) plan.fases.shift();
      plan.m = hasta; plan.t += p.d; plan.idx++;
    }
  }

  g.PACE_MOTOR = { montar, montar432, programarHasta, recetaHoy, FILTRO_HOY, dbLin };
})(typeof window !== 'undefined' ? window : globalThis);
