/* «El inglés, elegido»: las tomas en inglés que eligió Ez (16 nov. 2026: «me quedo con todas tus
   recomendaciones»), tal como suenan en la app (Sound.voz.cuerpo.js): el trozo a..b de su toma, con su volumen y
   un fundido de 5 ms a cada lado. La tabla es la de la app (datos.js, que es app/ui/Sound.voz.cuerpo.datos.js)
   y las tomas, las mismas (voz/, que es app/move/voz/). Cada toma se carga al tocarla por primera vez. Lo que
   suena se para al tocar otra cosa. */
(function () {
  'use strict';
  var raiz = document.querySelector('[data-oir-en]');
  var D = (window.PACE_VOZ_CUERPO || {}).en;
  if (!raiz) return;
  if (!D) { raiz.innerHTML = '<p class="nota">No hay tomas en inglés en la tabla.</p>'; return; }
  var NUM = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
    'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'twenty-one', 'twenty-two',
    'twenty-three', 'twenty-four', 'twenty-five'];
  var VOCES = [['sulafat', 'Voz clara'], ['bradford', 'Voz grave']];
  var GRUPOS = [
    ['numeros', 'Números', NUM.map(function (n, i) { return ['n' + (i + 1), n]; })],
    ['cuenta', 'Cuenta atrás', [['c3', 'three'], ['c2', 'two'], ['c1', 'one']]],
    ['avisos', 'Avisos', [['colocate', 'Get set'], ['siguiente', 'Next'], ['ya', 'Go'], ['ultimo', 'Last step']]],
    ['lados', 'Lados y descanso', [['izquierda', 'Left'], ['derecha', 'Right'], ['cambia', 'Switch sides'], ['descansa', 'Rest']]]
  ];
  /* Qué versión es y por qué se recomendó, medido en las dos: el tono de cada palabra (cuánto varía de una a
     otra, en semitonos), si cae al final, lo que dura y su tope. */
  var ELEGIDA = {
    sulafat: {
      numeros: ['la 1 con el «one» de la 2', 'la 2 se corta en el «twenty-one» y el «one» de la 1 dura 1,9 s, más de lo que cabe entre dos repeticiones.'],
      cuenta: ['la 2', 'los tres números en el mismo tono (varía 0,3 semitonos; en la 1, 1,8) y casi igual de largos.'],
      avisos: ['la 2', 'las cuatro órdenes en un tono mucho más igual (0,7 semitonos frente a 4,5).'],
      lados: ['la 2', 'más pareja de tono (0,8 semitonos frente a 2,5) y de volumen.']
    },
    bradford: {
      numeros: ['la 2', 'el tono varía menos de un número a otro (2,5 semitonos frente a 2,9) y cae menos al final de cada uno.'],
      cuenta: ['la 2', 'cada número se queda en su tono; en la 1 caen unos 3 semitonos, y el prompt pedía que no cayeran.'],
      avisos: ['la 1', 'las cuatro órdenes en un tono mucho más igual (1,6 semitonos frente a 4,1).'],
      lados: ['la 1', 'algo más pareja de tono (3,8 semitonos frente a 4,3); por lo demás, casi iguales.']
    }
  };

  var ctx = null, tomas = {}, botones = {}, vivos = [], relojes = [];
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}

  /* El contexto nace y arranca dentro del toque: Safari no deja sonar sin él. */
  function contexto() {
    if (!ctx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
      try { var b = ctx.createBuffer(1, 1, 22050); var s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0); } catch (e) {}
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function toma(archivo) {
    if (!tomas[archivo]) {
      tomas[archivo] = fetch('voz/' + archivo).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.arrayBuffer();
      }).then(function (datos) {
        return new Promise(function (ok, ko) { ctx.decodeAudioData(datos, ok, ko); });
      });
      tomas[archivo].catch(function () { delete tomas[archivo]; });
    }
    return tomas[archivo];
  }
  function para() {
    vivos.forEach(function (s) { try { s.stop(); } catch (e) {} });
    vivos = [];
    relojes.forEach(clearTimeout);
    relojes = [];
    raiz.querySelectorAll('.suena').forEach(function (b) { b.classList.remove('suena'); });
  }
  function marca(id, on) {
    (botones[id] || []).forEach(function (b) { b.classList.toggle('suena', on); });
  }
  /* Programa una palabra en t0 (reloj del contexto). Devuelve cuándo acaba. */
  function programa(e, id, t0, bufs) {
    var buf = bufs[e.archivo];
    var dur = Math.min(e.b, buf.duration) - e.a;
    var vol = typeof e.vol === 'number' ? e.vol : 1, f = 0.005;
    var s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = buf;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + f);
    g.gain.setValueAtTime(vol, t0 + dur - f);
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    s.connect(g); g.connect(ctx.destination);
    s.start(t0, e.a); s.stop(t0 + dur + 0.01);
    vivos.push(s);
    var desde = Math.max(0, (t0 - ctx.currentTime) * 1000);
    relojes.push(setTimeout(function () { marca(id, true); }, desde));
    relojes.push(setTimeout(function () { marca(id, false); }, desde + dur * 1000));
    return t0 + dur;
  }
  /* Suena una lista de palabras [[id, entrada]], seguidas con 0,6 s entre ellas (una sola, sin más). */
  function tocar(estado, lista) {
    para();
    if (!contexto()) { estado.textContent = 'Este navegador no puede sonar audio.'; return; }
    var archivos = [];
    lista.forEach(function (p) { if (archivos.indexOf(p[1].archivo) < 0) archivos.push(p[1].archivo); });
    var espera = setTimeout(function () { estado.textContent = 'Cargando la toma…'; }, 150);
    Promise.all(archivos.map(toma)).then(function (bs) {
      clearTimeout(espera); estado.textContent = '';
      var bufs = {};
      archivos.forEach(function (a, i) { bufs[a] = bs[i]; });
      var t0 = ctx.currentTime + 0.05;
      lista.forEach(function (p) { t0 = programa(p[1], p[0], t0, bufs) + 0.6; });
    }, function () {
      clearTimeout(espera); estado.textContent = 'No se ha podido cargar la toma. Prueba otra vez.';
    });
  }
  function boton(clase, texto, alPulsar) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = clase; b.textContent = texto;
    b.addEventListener('click', alPulsar);
    return b;
  }
  function el(tag, clase, texto) {
    var x = document.createElement(tag);
    if (clase) x.className = clase;
    if (texto) x.textContent = texto;
    return x;
  }

  VOCES.forEach(function (v) {
    var voz = v[0];
    if (!D[voz]) return;
    var caja = el('section', 'oir-voz');
    var cab = el('div', 'oir-vcab');
    var h = el('h3', '', v[1] + ' ');
    h.appendChild(el('small', '', voz));
    cab.appendChild(h);
    var estado = el('p', 'oir-estado'); estado.setAttribute('aria-live', 'polite');
    caja.appendChild(cab);
    caja.appendChild(estado);
    GRUPOS.forEach(function (gr) {
      var palabras = gr[2].filter(function (p) { return D[voz][p[0]]; });
      if (!palabras.length) return;
      var lista = palabras.map(function (p) { return [voz + '.' + p[0], D[voz][p[0]]]; });
      var g = el('div', 'oir-grupo');
      var gc = el('div', 'oir-cab');
      gc.appendChild(el('span', '', gr[1]));
      gc.appendChild(boton('oir-btn', 'Oír seguidas', function () { tocar(estado, lista); }));
      g.appendChild(gc);
      var fila = el('div', 'oir-botones');
      lista.forEach(function (p, i) {
        var b = boton('palabra', palabras[i][1], function () { tocar(estado, [p]); });
        (botones[p[0]] = botones[p[0]] || []).push(b);
        fila.appendChild(b);
      });
      g.appendChild(fila);
      var el1 = (ELEGIDA[voz] || {})[gr[0]];
      if (el1) {
        var pq = el('p', 'oir-porque');
        pq.appendChild(el('span', 'oir-tag', 'Elegida'));
        pq.appendChild(document.createTextNode(' ' + el1[0].charAt(0).toUpperCase() + el1[0].slice(1) + ', la recomendada: ' + el1[1]));
        g.appendChild(pq);
      }
      caja.appendChild(g);
    });
    raiz.appendChild(caja);
  });
})();
