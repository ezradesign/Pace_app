/* PACE · «A tu ritmo» montado DENTRO del calco de la home (s192 · ronda 4)
 * ========================================================================
 * `pmMontar` se incrusta con `toString` en cada pantalla de la maqueta —junto a
 * `pmPiezas`, que pinta, y `menuJornada`, que compone— y trabaja sobre el DOM calcado
 * de la app real. Es la variante A, la elegida: la pregunta ocupa el sitio de
 * «Actividades» + «Camino sugerido»; al elegir, el aro pasa a «Bloque 1 de N» y el
 * «Para ahora» de la barra lateral anuncia la «Siguiente pausa». «Hoy voy por libre»
 * devuelve la home de siempre.
 *
 * RONDA 4: bajo el aro, «A TU RITMO» y DEBAJO «HASTA LAS 17:00» (pedido por el
 * usuario): la fila de «Ciclo» se oculta sin soltar su sitio y el rótulo sube lo que
 * mide la línea nueva, así el panel no se mueve.
 *
 * Cada vez que pinta, MIDE (scroll de la home, etiquetas que se pisan o se salen,
 * desborde del panel, glifos calcados) y se lo manda a la página con `postMessage`,
 * que funciona también abriendo el archivo con doble clic.
 * Las rondas 1 a 3 se generaron con versiones anteriores de este archivo.
 */
'use strict';

function pmMontar(cfg) {
  var d = document, MOVIL = cfg.movil, hora = menuHora, R = pmRecursos();
  var LIMPIO = { opcion: null, libre: false, hoja: false, decision: null };
  var S = Object.assign({}, LIMPIO, { cambios: {} }, cfg.estado || {});
  var H = Object.assign({ inicio: 540, comida: 840, comidaDur: 60, salida: 1020, ahora: 540 }, cfg.horario || {});
  var AJ = { tarde: cfg.tarde || 'salida' };

  function vis(sel) {
    var l = d.querySelectorAll(sel);
    for (var i = 0; i < l.length; i++) if (l[i].getBoundingClientRect().width > 0) return l[i];
    return null;
  }
  function porTexto(tag, t) {
    return Array.prototype.find.call(d.querySelectorAll(tag), function (e) {
      return e.textContent.trim() === t && e.getBoundingClientRect().width > 0;
    }) || null;
  }
  function nodo(html) { var t = d.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function politica() { return AJ.tarde === 'pregunta' ? (S.decision || 'salida') : AJ.tarde; }
  function menuDe(op, pol) {
    return menuJornada(op, Object.assign({}, H, { politica: pol || politica() }), op === S.opcion ? S.cambios : null);
  }

  /* --- lo que se calca y se toca de la app ------------------------------ */
  var bar = vis('[data-pace-activitybar]'), spc = vis('[data-pace-spc]');
  var dispBar = bar ? bar.style.display : '', dispSpc = spc ? spc.style.display : '';

  /* LOS GLIFOS SE CALCAN de los chips de la ActivityBar (ABBreathe, ABStretch, ABMove,
     ABDrop, en ese orden). El tamaño se quita SOLO de la etiqueta raíz: la mancuerna
     de Mueve está hecha de <rect> con width/height, y quitarlos en todo el dibujo la
     dejaba en un «−» (ronda 2). */
  var G = { foco: R.FOCO };
  var svgs = bar ? bar.querySelectorAll('[data-pace-activitybar-chip] svg') : [];
  ['respira', 'estira', 'mueve', 'agua'].forEach(function (k, i) {
    if (svgs[i]) G[k] = svgs[i].outerHTML.replace(/^<svg[^>]*>/, function (t) { return t.replace(/\s(width|height)="[^"]*"/g, ''); });
  });
  G.cierre = G.respira;
  var P = pmPiezas({ S: S, H: H, AJ: AJ, MOVIL: MOVIL, R: R, G: G, hora: hora, menuDe: menuDe });

  var dial = { label: vis('[data-pace-dial-label]'), num: vis('[data-pace-dial-number]'),
               sub: vis('[data-pace-dial-subtitle]'), cta: vis('[data-pace-cta]') };
  var ciclo = porTexto('span', 'Ciclo 1 / 4');
  var filaCiclo = ciclo ? ciclo.parentElement.parentElement : null;
  var durs = {};
  [15, 25, 35, 45].forEach(function (n) { durs[n] = porTexto('button', String(n)); });
  var estiloSi = durs[25] && durs[25].getAttribute('style');
  var estiloNo = durs[35] && durs[35].getAttribute('style');
  var accion = d.querySelector('[data-pace-sidebar-accion]');
  var orig = {
    label: dial.label && dial.label.textContent, num: dial.num && dial.num.textContent,
    sub: dial.sub && dial.sub.textContent, cta: dial.cta && dial.cta.textContent,
    accion: accion && accion.innerHTML,
  };

  /* --- el rótulo del corte del aro: «A tu ritmo» y, con menú, su hora ----- */
  var envol = d.createElement('div');
  envol.setAttribute('data-pm', '');
  envol.style.marginTop = bar ? getComputedStyle(bar).marginTop : '0px';
  envol.style.flexShrink = '0';
  var rotulo = bar ? bar.firstElementChild.cloneNode(true) : d.createElement('div');
  var rotTexto = rotulo.querySelector('.pace-meta') || rotulo;
  rotTexto.textContent = R.NOMBRE;
  var rotHasta = d.createElement('div');
  rotHasta.className = 'pm-hasta';
  rotTexto.parentNode.insertBefore(rotHasta, rotTexto.nextSibling);
  var dentro = d.createElement('div');
  dentro.className = 'pm-wrap';
  if (spc) dentro.style.padding = getComputedStyle(spc).padding;
  envol.appendChild(rotulo);
  envol.appendChild(dentro);

  function pintaAro(m) {
    if (!dial.num) return;
    var b = m && P.primerBloque(m);
    dial.label.textContent = b ? 'Bloque 1 de ' + b.de : orig.label;
    dial.num.textContent = b ? b.dur + ':00' : orig.num;
    dial.sub.textContent = b ? P.descriptor(b.dur) : orig.sub;
    dial.cta.textContent = b ? 'Empezar jornada' : orig.cta;
    if (filaCiclo) filaCiclo.style.visibility = b ? 'hidden' : '';
    rotHasta.textContent = b ? 'Hasta las ' + hora(m.hasta) : '';
    rotHasta.style.display = b ? '' : 'none';
    rotulo.style.marginTop = b ? -rotHasta.offsetHeight + 'px' : '';
    Object.keys(durs).forEach(function (k) {
      if (durs[k]) durs[k].setAttribute('style', (b ? +k === b.dur : +k === 25) ? estiloSi : estiloNo);
    });
    if (!accion) return;
    accion.innerHTML = orig.accion;
    if (!b) return;
    var p = P.primeraPausa(m);
    var ceja = accion.children[0], boton = accion.querySelector('h4 button'), meta = accion.children[2];
    if (ceja) ceja.textContent = 'Siguiente pausa · ' + hora(p.desde);
    if (boton) {
      var tx = Array.prototype.find.call(boton.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
      if (tx) tx.textContent = P.nombres(p); else boton.textContent = P.nombres(p);
    }
    if (meta) meta.textContent = p.larga ? 'Pausa larga · ' + p.dur + ' min' : p.platos[0].min + ' min · ' + P.MODULO[p.platos[0].modulo];
  }

  var filaVuelta = null;
  function enlaceVuelta(on) {
    if (!spc) return;
    var pie = spc.lastElementChild;
    if (!filaVuelta) {
      filaVuelta = d.createElement('div');
      filaVuelta.className = 'pm-b-fila';
      filaVuelta.setAttribute('data-pm', '');
      pie.parentNode.insertBefore(filaVuelta, pie);
      filaVuelta.appendChild(d.createElement('span'));
      filaVuelta.appendChild(pie);
    }
    filaVuelta.firstChild.innerHTML = !on ? '' : '<button class="pm-enlace pm-fuerte" data-pm-accion="volver">'
      + (MOVIL ? R.ENLACE : '¿Cuánto trabajas hoy? ' + R.ENLACE) + '</button>';
  }

  /* HASTA TRES NIVELES, repartidos de forma VORAZ: cada etiqueta va al primer nivel
     donde no choca con las que ya están. Cada nivel empieza bajo la más alta del
     anterior (medida), y la zona reservada se MIDE SIEMPRE. Las posiciones se
     escriben en px respecto a la línea, porque la etiqueta de la comida cuelga de un
     tramo y las demás de una parada. */
  function acomoda() {
    var l = Array.prototype.slice.call(d.querySelectorAll('[data-pm-etiq]'));
    var z = d.querySelector('[data-pm-zona]'), lin = d.querySelector('.pm-linea');
    if (!z || !lin || !l.length) return;
    var r = l.map(function (e) { return e.getBoundingClientRect(); });
    var niveles = [[], [], []];
    l.forEach(function (e, i) {
      var cabe = function (n) {
        return niveles[n].every(function (j) { return r[j].right + 6 <= r[i].left || r[i].right + 6 <= r[j].left; });
      };
      var n = cabe(0) ? 0 : cabe(1) ? 1 : 2;
      niveles[n].push(i);
    });
    var arriba = lin.getBoundingClientRect().top, y = 30;
    niveles.forEach(function (idx, n) {
      if (!idx.length) return;
      idx.forEach(function (i) {
        var padre = l[i].offsetParent.getBoundingClientRect().top - arriba;
        l[i].style.top = (y - padre) + 'px';
        if (n) { l[i].classList.add('pm-alta'); l[i].style.setProperty('--pm-sube', (y - 26) + 'px'); }
      });
      y += Math.max.apply(null, idx.map(function (i) { return l[i].offsetHeight; })) + 6;
    });
    var fondo = Math.max.apply(null, l.map(function (e) { return e.getBoundingClientRect().bottom; }));
    z.style.height = Math.ceil(fondo - z.getBoundingClientRect().top + 2) + 'px';
  }

  function medir() {
    var hb = vis('[data-pace-home-body]');
    var r = Array.prototype.map.call(d.querySelectorAll('[data-pm-etiq]'), function (e) { return e.getBoundingClientRect(); });
    var solapes = 0;
    for (var i = 0; i < r.length; i++) for (var j = i + 1; j < r.length; j++) {
      if (r[i].right > r[j].left && r[j].right > r[i].left && r[i].bottom > r[j].top && r[j].bottom > r[i].top) solapes++;
    }
    var panel = d.querySelector('.pm-panel');
    var visible = panel && panel.offsetParent;
    var fuera = 0;
    if (visible) {
      var pr = panel.getBoundingClientRect();
      r.forEach(function (x) { if (x.left < pr.left - 0.5 || x.right > pr.right + 0.5 || x.bottom > pr.bottom + 0.5) fuera++; });
    }
    var cuerpo = d.querySelector('[data-pm-cuerpo]');
    parent.postMessage({ pm: cfg.id, estado: { opcion: S.opcion, libre: S.libre, hoja: S.hoja },
      ajustes: { tarde: AJ.tarde, inicio: H.inicio, comida: H.comida, comidaDur: H.comidaDur, salida: H.salida, ahora: H.ahora },
      /* RELACIONAL, no censo: el interior de cada glifo tiene que ser IDÉNTICO al del
         chip calcado. «Hay un <svg>» dio 4 de 4 con la mancuerna rota. */
      glifos: ['respira', 'estira', 'mueve', 'agua'].filter(function (k, n) {
        return svgs[n] && (G[k] || '').replace(/^<svg[^>]*>|<\/svg>$/g, '') === svgs[n].innerHTML;
      }).length,
      scroll: hb ? Math.max(0, Math.round(hb.scrollHeight - hb.clientHeight)) : null,
      solapes: solapes, fuera: fuera, niveles: d.querySelectorAll('.pm-etiq.pm-alta').length,
      desborde: visible ? Math.max(0, Math.round(panel.scrollWidth - panel.clientWidth)) : 0,
      alto: visible ? Math.round(panel.getBoundingClientRect().height) : null,
      hasta: rotHasta.textContent,
      hojaScroll: cuerpo ? Math.max(0, Math.round(cuerpo.scrollHeight - cuerpo.clientHeight)) : null }, '*');
  }

  function pintar() {
    var m = S.opcion ? menuDe(S.opcion) : null;
    /* Se restaura el `display` EN LÍNEA que traía React, no ''. Y el contenedor sale
       del DOM en «por libre»: la app coloca la barra con un selector de hermano
       ADYACENTE al aro, y con el contenedor en medio perdía su margen negativo. */
    if (bar) bar.style.display = S.libre ? dispBar : 'none';
    if (spc) spc.style.display = S.libre ? dispSpc : 'none';
    if (S.libre) { if (envol.parentNode) envol.remove(); }
    else if (!envol.parentNode && bar) bar.parentNode.insertBefore(envol, bar);
    dentro.innerHTML = m ? (MOVIL ? P.panelMovil(m) : P.panelEscritorio(m)) : P.pregunta();
    enlaceVuelta(S.libre);
    pintaAro(S.libre ? null : m);
    if (m && !MOVIL && !S.libre) acomoda();
    var viejo = d.querySelector('[data-pm-velo]');
    if (viejo) viejo.remove();
    if (S.hoja) d.body.appendChild(nodo(P.hoja(m)));
    requestAnimationFrame(function () { requestAnimationFrame(medir); });
  }

  d.addEventListener('click', function (ev) {
    var t = ev.target;
    if (t.matches && t.matches('[data-pm-velo]')) { S.hoja = false; pintar(); return; }
    if (t.closest('select')) return;
    var op = t.closest('[data-pm-opcion]'), ca = t.closest('[data-pm-cambia]'),
        de = t.closest('[data-pm-decide]'), ac = t.closest('[data-pm-accion]');
    if (op) { S.opcion = op.getAttribute('data-pm-opcion'); S.cambios = {}; S.libre = false; }
    else if (ca) ca.getAttribute('data-pm-cambia').split(',').forEach(function (k) { S.cambios[k] = (S.cambios[k] || 0) + 1; });
    else if (de) { S.decision = de.getAttribute('data-pm-decide'); S.cambios = {}; }
    else if (ac) {
      var a = ac.getAttribute('data-pm-accion');
      if (a === 'cambiar') { S.opcion = null; S.decision = null; }
      else if (a === 'libre') { S.libre = true; S.opcion = null; S.hoja = false; }
      else if (a === 'volver') S.libre = false;
      else if (a === 'hoja') S.hoja = true;
      else if (a === 'cerrar') S.hoja = false;
    } else return;
    ev.preventDefault();
    ev.stopPropagation();
    pintar();
  }, true);

  /* Cambiar una hora recompone el día desde cero: las pausas que habías cambiado
     ya no están en el mismo sitio. */
  d.addEventListener('change', function (ev) {
    var campo = ev.target.getAttribute && ev.target.getAttribute('data-pm-horario');
    if (!campo) return;
    H[campo] = +ev.target.value;
    if (campo === 'inicio' && H.ahora < H.inicio) H.ahora = H.inicio;
    S.cambios = {};
    pintar();
  });

  /* La página manda el ESTADO, el HORARIO (incluida la hora a la que abres PACE) o
     la POLÍTICA de llegar tarde. Ninguno toca a los otros. */
  window.addEventListener('message', function (ev) {
    var x = ev.data;
    if (!x) return;
    if (x.pmEstado) Object.assign(S, LIMPIO, { cambios: {} }, x.pmEstado);
    else if (x.pmHorario) { Object.assign(H, x.pmHorario); S.cambios = {}; S.decision = null; }
    else if (x.pmAjustes) { Object.assign(AJ, x.pmAjustes); S.decision = null; }
    else return;
    pintar();
  });

  pintar();
}

module.exports = { pmMontar };
