/* La página de las marcadas (marcadas.html): cada técnica con su receta marcada `m` y la de ahora
   `a`, el recorrido de 12 s por todas y el resumen para pegar. El audio es el de
   escucha-por-tecnica.html: el mismo motor.js, la misma voz y la misma ganancia de la app. */
(function () {
  const D = window.PACE_POR_TECNICA, M = window.PACE_MOTOR, MED = window.PACE_MEDIDAS || {};
  const $ = (id) => document.getElementById(id);
  const TEC = {}, ORDEN = [];
  D.FAMILIAS.forEach((fa) => fa.tecnicas.forEach((t) => { t.fam = fa; TEC[t.id] = t; if (t.m) ORDEN.push(t.id); }));
  const ICONO_PLAY = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" fill="currentColor"/></svg>';
  const ICONO_STOP = '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2.5" y="2.5" width="7" height="7" rx="1" fill="currentColor"/></svg>';
  const num = (x, d) => (x < 0 ? '−' : '') + Math.abs(x).toFixed(d == null ? 1 : d).replace('.', ',');
  const signo = (x) => (x > 0 ? '+' : '') + num(x);
  const MODO = { m: 'marcada', a: 'ahora', hoy: 'su drone' };

  function ritmo(t) {
    const ciclo = t.f.reduce((a, p) => a + p.d, 0);
    const txt = t.f.map((p) => p.txt.replace(/\.$/, '') + ' ' + p.d).join(' · ');
    return (t.f.length > 4 ? 'Ciclo de ' + ciclo + ' s, alternando lados' : txt) + (t.quieto ? ' · música quieta' : '') + ' · ' + t.min + ' min';
  }

  /* ---------- elecciones ---------- */
  const OPCIONES = [['m', 'La marcada'], ['a', 'La de ahora']];
  const ESTADO = { elecciones: {}, nota: '' };
  const CLAVE = 'pace.respiraMarcadas.v1';
  try { const g = JSON.parse(localStorage.getItem(CLAVE) || 'null'); if (g && g.elecciones) Object.assign(ESTADO, g); } catch (e) { /* sin almacenamiento */ }
  function guarda() { try { localStorage.setItem(CLAVE, JSON.stringify(ESTADO)); } catch (e) { /* sin almacenamiento */ } }
  function elige(id, op) { ESTADO.elecciones[id] = op; guarda(); pintaEleccion(id); pintaResumen(); }

  /* ---------- pintar ---------- */
  function cifras() {
    const d = ORDEN.map((id) => MED[id] && MED[id].distinta).filter(Boolean);
    const caja = $('cifras'); caja.textContent = '';
    if (!d.length || !d[0].m) return;
    const minA = Math.min(...d.map((x) => x.a.d)), minM = Math.min(...d.map((x) => x.m.d));
    const gemelasA = d.filter((x) => x.a.d < 4).length, gemelasM = d.filter((x) => x.m.d < 4).length;
    [[num(minA), 'la pareja más parecida, ahora', false], [num(minM), 'la pareja más parecida, marcadas', true],
      [String(gemelasA), 'casi gemelas ahora (a menos de 4)', false], [String(gemelasM), 'casi gemelas con las marcadas', true]].forEach(([b, s, nueva]) => {
      const c = document.createElement('div'); c.className = 'cifra' + (nueva ? ' nueva' : '');
      c.innerHTML = '<b></b><span></span>'; c.querySelector('b').textContent = b; c.querySelector('span').textContent = s;
      caja.appendChild(c);
    });
  }
  function boton(t, modo, txt, principal) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (principal ? '' : ' sec');
    b.dataset.id = t.id; b.dataset.modo = modo; b.dataset.txt = txt; b.setAttribute('aria-pressed', 'false');
    b.innerHTML = ICONO_PLAY + '<span></span>'; b.querySelector('span').textContent = txt;
    b.addEventListener('click', () => { pararRecorrido(); tocar(t.id, modo); });
    return b;
  }
  function pintaFamilias() {
    const raiz = $('familias'); raiz.textContent = '';
    D.FAMILIAS.forEach((fa) => {
      const sec = document.createElement('section'); sec.className = 'familia';
      sec.innerHTML = '<div class="familia-cab"><h3></h3><span class="aside"></span></div><div class="rejilla"></div>';
      sec.querySelector('h3').textContent = fa.nombre;
      sec.querySelector('.aside').textContent = fa.aside;
      const rej = sec.querySelector('.rejilla');
      fa.tecnicas.forEach((t) => {
        const art = document.createElement('article'); art.className = 'tec'; art.id = 't-' + t.slug;
        art.innerHTML = '<div class="tec-cab"><h3></h3><span class="ritmo"></span></div><p class="cambia"></p>' +
          '<dl class="receta"><dt>Nota</dt><dd data-k="nota"></dd><dt>Segunda voz</dt><dd data-k="voz2"></dd><dt>Color</dt><dd data-k="color"></dd><dt>Movimiento</dt><dd data-k="mov"></dd></dl>' +
          '<div class="botones"></div><p class="distinta"></p><div class="eleccion" role="group"></div>';
        art.querySelector('h3').textContent = t.n;
        art.querySelector('.ritmo').textContent = ritmo(t);
        art.querySelector('.cambia').textContent = t.drone432 ? 'Se queda como está: su propio drone, sin música encima.' : t.qm;
        const fichas = t.cm || t.chips;
        art.querySelectorAll('[data-k]').forEach((dd) => { dd.textContent = fichas[dd.dataset.k]; });
        const bot = art.querySelector('.botones');
        if (t.drone432) bot.appendChild(boton(t, 'hoy', 'Escuchar su drone', true));
        else { bot.appendChild(boton(t, 'm', 'Marcada', true)); bot.appendChild(boton(t, 'a', 'Ahora', false)); }
        const dist = art.querySelector('.distinta');
        const d = MED[t.id] && MED[t.id].distinta;
        if (d && d.m) {
          dist.innerHTML = 'Se parece más a <b></b> (<span class="dm"></span>). Ahora, a <span class="na"></span> (<span class="da"></span>).';
          dist.querySelector('b').textContent = TEC[d.m.vecina].n;
          dist.querySelector('.dm').textContent = num(d.m.d) + ' puntos';
          dist.querySelector('.na').textContent = TEC[d.a.vecina].n;
          dist.querySelector('.da').textContent = num(d.a.d);
        } else dist.remove();
        const el = art.querySelector('.eleccion');
        if (t.drone432) el.remove();
        else {
          el.setAttribute('aria-label', 'Tu elección para ' + t.n);
          el.innerHTML = '<span class="lab">Me quedo con</span>';
          OPCIONES.forEach(([op, txt]) => {
            const p = document.createElement('button'); p.type = 'button'; p.className = 'pill'; p.dataset.op = op; p.textContent = txt;
            p.addEventListener('click', () => elige(t.id, ESTADO.elecciones[t.id] === op ? null : op));
            el.appendChild(p);
          });
        }
        rej.appendChild(art);
      });
      raiz.appendChild(sec);
    });
    Object.keys(TEC).forEach(pintaEleccion);
  }
  function pintaEleccion(id) {
    const art = $('t-' + TEC[id].slug); if (!art) return;
    art.querySelectorAll('.eleccion .pill').forEach((p) => p.setAttribute('aria-pressed', String(ESTADO.elecciones[id] === p.dataset.op)));
  }
  function textoResumen() {
    const L = ['Respira, más distintas: mis elecciones', ''];
    ORDEN.forEach((id) => { const op = OPCIONES.find((o) => o[0] === ESTADO.elecciones[id]); L.push('- ' + TEC[id].n + ': ' + (op ? op[1].toLowerCase() : 'sin elegir')); });
    const nota = (ESTADO.nota || '').trim();
    if (nota) L.push('', 'Además: ' + nota);
    return L.join('\n');
  }
  function pintaResumen() { $('resumen').textContent = textoResumen(); }
  function pintaMedidas() {
    const tb = $('tabla-medidas'); tb.textContent = '';
    const f = (x) => (x == null || !isFinite(x) ? '—' : num(x));
    const tope = Math.max(...Object.values(MED).filter((x) => x.a).map((x) => x.hoy.agudos));
    ORDEN.forEach((id) => {
      const t = TEC[id], m = MED[id]; if (!m || !m.m) return;
      const tr = document.createElement('tr');
      [t.n, f(m.hoy.ciclo), f(m.m.ciclo), f(m.m.abierto), signo(m.m.agudos - tope) + ' dB', signo(m.m.banda - m.hoy.banda) + ' dB', f(m.distinta.a.d), f(m.distinta.m.d)].forEach((c, k) => {
        const td = document.createElement('td'); td.textContent = c; if (k) td.className = 'n'; tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
  }
  function copiar(txt, bt) {
    const antes = bt.textContent;
    const ok = () => { bt.textContent = 'Copiado'; setTimeout(() => { bt.textContent = antes; }, 1600); };
    const selecciona = () => { const r = document.createRange(); r.selectNodeContents($('resumen')); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); bt.textContent = 'Seleccionado: cópialo'; };
    try { navigator.clipboard.writeText(txt).then(ok, selecciona); } catch (e) { selecciona(); }
  }

  /* ---------- audio (como escucha-por-tecnica.html) ---------- */
  const GANANCIA_APP = 0.158;
  const ARCHIVO = { claro: 'sol-claro', calido: 'sol-calido', menor: 'sol-menor' };
  const CLIPS = {
    sulafat: { inhale: ['inhala', 0.386, 1.79], hold: ['manten', 0.021, 1.341], exhale: ['exhala', 0.644, 2.122] },
    bradford: { inhale: ['inhala', 0.001, 0.912], hold: ['manten', 0.001, 1.219], exhale: ['exhala', 0.108, 3.68] },
  };
  let ctx = null, bus = null, musicaBus = null, vozBus = null;
  const decod = {};
  const est = { voz: 'sulafat', nivel: 0, sonando: null, recorrido: null };
  let motor = null, entrada = null, plan = null, timer = 0, raf = 0, vivos = [];

  async function bytes(nombre, carpeta) {
    for (const url of ['audio/' + nombre + '.mp3', carpeta + nombre + '.mp3']) {
      try { const r = await fetch(url); if (r.ok) return await r.arrayBuffer(); } catch (e) { /* siguiente sitio */ }
    }
    throw new Error('No encuentro ' + nombre + '.mp3');
  }
  function decodifica(nombre, carpeta) {
    if (!decod[nombre]) decod[nombre] = bytes(nombre, carpeta).then((ab) => ctx.decodeAudioData(ab)).catch((e) => { delete decod[nombre]; throw e; });
    return decod[nombre];
  }
  const drone = (k) => decodifica(ARCHIVO[k], '../bases/');
  const voz = (v, a) => decodifica(v + '-' + a, '../../../../../app/breathe/voz/');
  function asegura() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    bus = ctx.createGain(); bus.gain.value = M.dbLin(est.nivel); bus.connect(ctx.destination);
    musicaBus = ctx.createGain(); musicaBus.gain.value = GANANCIA_APP; musicaBus.connect(bus);
    vozBus = ctx.createGain(); vozBus.connect(bus);
  }
  function receta(t, modo) {
    if (modo === 'm') return Object.assign({}, t.m, { ajusteDb: (MED[t.id] && MED[t.id].m && MED[t.id].m.ajusteDb) || 0 });
    return Object.assign({}, t.a, { ajusteDb: (MED[t.id] && MED[t.id].ajusteDb) || 0 });
  }

  async function tocar(id, modo, etiqueta) {
    if (!etiqueta && est.sonando && est.sonando.id === id && est.sonando.modo === modo) { parar(); return; }
    parar(true);
    asegura();
    try { await ctx.resume(); } catch (e) { /* el navegador manda */ }
    const t = TEC[id];
    const yo = { id, modo, etiqueta };
    est.sonando = yo; pintaSonando('Cargando…');
    const rec = t.drone432 ? null : receta(t, modo);
    const bases = rec ? [rec.base].concat(rec.voz2 ? [rec.voz2.base] : []) : [];
    const bufs = {};
    try {
      const lista = await Promise.all(bases.map((k) => drone(k).then((b) => [k, b])));
      lista.forEach(([k, b]) => { bufs[k] = b; });
      if (est.voz) await Promise.all(['inhala', 'exhala', 'manten'].map((a) => voz(est.voz, a))).catch(() => null);
    } catch (e) {
      if (est.sonando === yo) { est.sonando = null; pintaSonando(); $('ahora-fase').textContent = 'No se han podido cargar los sonidos: abre la página desde el servidor de PACE.'; }
      return;
    }
    if (est.sonando !== yo) return;
    const t0 = ctx.currentTime + 0.1;
    entrada = ctx.createGain();
    entrada.gain.setValueAtTime(0, t0); entrada.gain.linearRampToValueAtTime(1, t0 + 1.5);
    entrada.connect(t.drone432 ? vozBus : musicaBus);
    motor = t.drone432 ? M.montar432(ctx, entrada, t0) : M.montar(ctx, rec, bufs, entrada, t0, !!t.quieto);
    plan = { idx: 0, t: t0 + 1.5, m: t.quieto ? 1 : 0, fases: [], tec: t };
    const programa = () => { if (est.sonando === yo) M.programarHasta(plan, t, motor, ctx.currentTime + 1.5, senal); };
    programa(); timer = setInterval(programa, 200);
    pintaSonando(); dibuja();
  }
  function parar(desdeTocar) {
    clearInterval(timer); cancelAnimationFrame(raf);
    if (ctx && entrada) {
      const tt = ctx.currentTime, e = entrada, m = motor;
      e.gain.cancelScheduledValues(tt); e.gain.setValueAtTime(e.gain.value, tt); e.gain.linearRampToValueAtTime(0, tt + 0.4);
      m.parar(tt + 0.5);
      vivos.forEach((s) => { try { s.stop(tt); } catch (er) { /* ya parada */ } });
      setTimeout(() => { try { e.disconnect(); } catch (er) { /* ya desconectada */ } }, 700);
    }
    entrada = null; motor = null; plan = null; vivos = [];
    est.sonando = null;
    if (desdeTocar !== true) pararRecorrido();
    pintaSonando();
  }

  /* El recorrido: 12 s de cada técnica, seguidas. Un token para que pulsar otra cosa lo corte. */
  function recorrer(modo) {
    if (est.recorrido && est.recorrido.modo === modo) { parar(); return; }
    pararRecorrido();
    const yo = { modo, k: 0, id: 0 };
    est.recorrido = yo;
    const paso = () => {
      if (est.recorrido !== yo) return;
      if (yo.k >= ORDEN.length) { parar(); return; }
      const id = ORDEN[yo.k];
      tocar(id, modo, (yo.k + 1) + ' de ' + ORDEN.length);
      yo.k++;
      yo.id = setTimeout(paso, 12000);
    };
    paso(); pintaRecorrido();
  }
  function pararRecorrido() {
    if (est.recorrido) clearTimeout(est.recorrido.id);
    est.recorrido = null; pintaRecorrido();
  }
  function pintaRecorrido() {
    [['rec-m', 'm'], ['rec-a', 'a']].forEach(([id, modo]) => {
      const b = $(id), on = !!est.recorrido && est.recorrido.modo === modo;
      b.setAttribute('aria-pressed', String(on));
      b.innerHTML = (on ? ICONO_STOP : ICONO_PLAY) + '<span></span>';
      b.querySelector('span').textContent = on ? 'Parar el recorrido' : b.dataset.txt;
    });
  }

  function senal(p, tt) {
    if (est.voz) {
      const c = CLIPS[est.voz][p.voz];
      const k = est.voz + '-' + (c && c[0]);
      if (c && (c[2] - c[1]) + 0.15 <= p.d && decod[k]) {
        decod[k].then((buf) => {
          if (!plan) return;
          const s = ctx.createBufferSource(); s.buffer = buf; s.connect(vozBus);
          s.start(Math.max(tt, ctx.currentTime), Math.max(0, c[1] - 0.04)); vivos.push(s);
          s.onended = () => { vivos = vivos.filter((x) => x !== s); };
        });
        return;
      }
    }
    if (p.voz === 'hold') return;
    soplo(p, tt);
  }
  /* El soplo de la app (breathNoise): ruido por un paso-bajo que barre 200→800 Hz al inhalar y al revés. */
  let ruido = null;
  function soplo(p, tt) {
    if (!ruido) { ruido = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = ruido.getChannelData(0); for (let k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1; }
    const s = ctx.createBufferSource(); s.buffer = ruido; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 1.5;
    const gn = ctx.createGain(); s.connect(f); f.connect(gn); gn.connect(vozBus);
    const sube = p.voz === 'inhale';
    f.frequency.setValueAtTime(sube ? 200 : 800, tt); f.frequency.linearRampToValueAtTime(sube ? 800 : 200, tt + p.d);
    gn.gain.setValueAtTime(0, tt); gn.gain.linearRampToValueAtTime(0.05, tt + Math.min(0.4, p.d / 3));
    gn.gain.setValueAtTime(0.05, tt + p.d * 0.7); gn.gain.linearRampToValueAtTime(0, tt + p.d);
    s.start(tt); s.stop(tt + p.d + 0.05); vivos.push(s);
  }

  function pintaSonando(txt) {
    const s = est.sonando;
    document.querySelectorAll('.tec').forEach((a) => a.classList.remove('sonando'));
    document.querySelectorAll('.tec .botones .btn').forEach((b) => {
      const on = !!s && b.dataset.id === s.id && b.dataset.modo === s.modo;
      b.setAttribute('aria-pressed', String(on));
      b.querySelector('svg').outerHTML = on ? ICONO_STOP : ICONO_PLAY;
      b.querySelector('span').textContent = on ? 'Parar' : b.dataset.txt;
    });
    $('parar').disabled = !s && !est.recorrido;
    if (!s) { $('ahora-nombre').textContent = 'Nada sonando'; $('ahora-fase').textContent = 'Pulsa Marcada o Ahora en una técnica'; $('aro').style.transform = 'scale(0.9)'; return; }
    const t = TEC[s.id];
    $('t-' + t.slug).classList.add('sonando');
    $('ahora-nombre').textContent = t.n + ' · ' + MODO[s.modo] + (s.etiqueta ? ' · ' + s.etiqueta : '');
    if (txt) $('ahora-fase').textContent = txt;
  }
  function dibuja() {
    if (!plan) return;
    const tt = ctx.currentTime;
    const f = plan.fases.filter((x) => x.t <= tt).pop();
    if (f) {
      const x = Math.min(1, (tt - f.t) / f.d), k = 0.5 - 0.5 * Math.cos(Math.PI * x);
      const m = f.desde + (f.hasta - f.desde) * k;
      $('aro').style.transform = 'scale(' + (0.7 + 0.5 * m).toFixed(3) + ')';
      $('ahora-fase').textContent = f.txt + ' · ' + Math.max(1, Math.ceil(f.d - (tt - f.t))) + ' s' + (plan.tec.quieto ? ' · música quieta' : '');
    } else { $('ahora-fase').textContent = 'Prepárate'; }
    raf = requestAnimationFrame(dibuja);
  }

  /* ---------- mandos ---------- */
  $('parar').addEventListener('click', () => parar());
  $('rec-m').addEventListener('click', () => recorrer('m'));
  $('rec-a').addEventListener('click', () => recorrer('a'));
  $('voz').addEventListener('change', (ev) => {
    est.voz = ev.target.value;
    if (ctx && est.voz) ['inhala', 'exhala', 'manten'].forEach((a) => voz(est.voz, a).catch(() => null));
  });
  $('nivel').addEventListener('input', (ev) => {
    est.nivel = Number(ev.target.value);
    if (bus) bus.gain.setTargetAtTime(M.dbLin(est.nivel), ctx.currentTime, 0.1);
  });
  $('copiar-resumen').addEventListener('click', (ev) => copiar(textoResumen(), ev.currentTarget));
  $('nota').value = ESTADO.nota || '';
  $('nota').addEventListener('input', (ev) => { ESTADO.nota = ev.target.value; guarda(); pintaResumen(); });

  cifras(); pintaFamilias(); pintaMedidas(); pintaResumen(); pintaRecorrido();
  window.PACE_MARCADAS = { textoResumen, recorrer, tocar, parar, est };
})();
