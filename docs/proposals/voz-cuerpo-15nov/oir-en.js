/* «Para escoger: el inglés»: las dos versiones de cada toma, una junto a otra. Cada palabra suena como en la
   app (Sound.voz.cuerpo.js): el trozo a..b de su toma, con su volumen y un fundido de 5 ms a cada lado. La
   tabla es tomas-en/datos.js; las versiones montadas apuntan a voz/ (las tomas de la app) y las otras a
   tomas-en/. Cada toma se carga al tocarla por primera vez. Lo que suena se para al tocar otra cosa. */
(function () {
  'use strict';
  var raiz = document.querySelector('[data-oir-en]');
  var D = window.PACE_TOMAS_EN;
  if (!raiz) return;
  if (!D) { raiz.innerHTML = '<p class="nota">No se ha podido cargar la tabla de las tomas en inglés.</p>'; return; }
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
  /* Por qué la recomendada, medido en las dos: el tono de cada palabra (cuánto varía de una a otra, en
     semitonos), si cae al final, lo que dura y su tope. */
  var PORQUE = {
    sulafat: {
      numeros: 'Recomiendo la 1 con el «one» de la 2, y es lo que suena en la app: la 2 se corta en el «twenty-one» y el «one» de la 1 dura 1,9 s, más de lo que cabe entre dos repeticiones.',
      cuenta: 'Recomiendo la 2: los tres números en el mismo tono (varía 0,3 semitonos; en la 1, 1,8) y casi igual de largos.',
      avisos: 'Recomiendo la 2: las cuatro órdenes en un tono mucho más igual (0,7 semitonos frente a 4,5).',
      lados: 'Recomiendo la 2: más pareja de tono (0,8 semitonos frente a 2,5) y de volumen.'
    },
    bradford: {
      numeros: 'Recomiendo la 2: el tono varía menos de un número a otro (2,5 semitonos frente a 2,9) y cae menos al final de cada uno.',
      cuenta: 'Recomiendo la 2: cada número se queda en su tono; en la 1 caen unos 3 semitonos, y el prompt pedía que no cayeran.',
      avisos: 'Recomiendo la 1: las cuatro órdenes en un tono mucho más igual (1,6 semitonos frente a 4,1).',
      lados: 'Recomiendo la 1, por poco: algo más pareja de tono (3,8 semitonos frente a 4,3). Por lo demás, casi iguales.'
    }
  };
  /* Lo que no va en una versión: una palabra que pasa de su tope, o una toma que se queda corta. */
  var LARGAS = { 'sulafat.numeros.v1.n1': true };
  var AVISOS = {
    'sulafat.numeros.v1': 'Su «one» dura 1,9 s: no cabe entre dos repeticiones.',
    'sulafat.numeros.v2': 'Se corta en el «twenty-one»: faltan del 22 al 25.'
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
      tomas[archivo] = fetch(archivo).then(function (r) {
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
      var t = D[voz][gr[0]];
      if (!t) return;
      var g = el('div', 'oir-grupo');
      var gc = el('div', 'oir-cab');
      gc.appendChild(el('span', '', gr[1]));
      g.appendChild(gc);
      var par = el('div', 'oir-par');
      [1, 2].forEach(function (ver) {
        var m = t['v' + ver] || {};
        var base = voz + '.' + gr[0] + '.v' + ver;
        var palabras = gr[2].filter(function (p) { return m[p[0]]; });
        var col = el('div', 'oir-ver' + (t.rec === ver ? ' rec' : ''));
        var vt = el('div', 'oir-vtit');
        vt.appendChild(el('span', 'oir-vnom', 'Versión ' + ver));
        if (t.rec === ver) vt.appendChild(el('span', 'oir-tag', 'Recomendada'));
        vt.appendChild(boton('oir-btn', 'Oír seguidas', function () {
          tocar(estado, palabras.map(function (p) { return [base + '.' + p[0], m[p[0]]]; }));
        }));
        col.appendChild(vt);
        var fila = el('div', 'oir-botones');
        palabras.forEach(function (p) {
          var id = base + '.' + p[0];
          var b = boton('palabra' + (LARGAS[id] ? ' larga' : ''), p[1], function () { tocar(estado, [[id, m[p[0]]]]); });
          (botones[id] = botones[id] || []).push(b);
          fila.appendChild(b);
        });
        col.appendChild(fila);
        if (AVISOS[base]) col.appendChild(el('p', 'oir-aviso', AVISOS[base]));
        par.appendChild(col);
      });
      g.appendChild(par);
      var pq = el('p', 'oir-porque', PORQUE[voz][gr[0]]);
      if (t.montada) {
        var mont = t.montada;
        pq.appendChild(document.createTextNode(' '));
        pq.appendChild(boton('oir-btn', 'Oír la montada', function () {
          tocar(estado, gr[2].filter(function (p) { return mont[p[0]]; }).map(function (p) { return [voz + '.montada.' + p[0], mont[p[0]]]; }));
        }));
      }
      g.appendChild(pq);
      caja.appendChild(g);
    });
    raiz.appendChild(caja);
  });
})();
