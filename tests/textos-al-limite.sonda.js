/* PACE · tests/textos-al-limite.sonda.js — CUÁNTO LE SOBRA A CADA TEXTO ANTES DE MOVER EL DISEÑO
   ================================================================================================
   La usa tests/textos-al-limite.mide.js, que no es una prueba de la suite: solo mide y apunta.
   El 20 nov. 2026 la 0.212.0 salió roja en el CI de Linux, que pinta la letra como Android y un
   pelo más ancha que Windows: tres textos que aquí cabían por 1 o 2 px pasaban de línea allí.

   `sondaTextos` corre dentro de la página (page.evaluate) y no toca nada que quede: cada medida se
   pone y se quita en la misma pasada síncrona, sin dejar a la app un fotograma para reaccionar.
   Para cada bloque de texto visible (el ancestro no `inline` más cercano de cada texto) mide:
     · su ancho natural: un clon con `width: max-content; white-space: nowrap`;
     · `margen`, en px: cuánto puede crecer su primera línea (un `text-indent` creciente, que no
       toca el DOM) antes de que el diseño cambie; en un texto de una línea, lo que le sobra;
     · `porLetra`, en px: cuánta separación de letra aguanta todo el bloque, que es como se parece
       más la letra de Linux (cada letra un poco más ancha, no un trozo al final).
   «El diseño cambia» es cualquiera de estas cosas: el bloque gana una línea; su texto se sale de su
   caja o de una que recorta (una línea más solo cuenta si su caja crece: ver `parte`); el bloque salta de sitio (otra fila de un flex); o un vecino (lo que
   cuelga de su tercer ancestro) gana una línea o salta. Lo que pase después (scroll, «Luego» que se
   esconde, el dibujo que encoge) lo mide `efectoPantalla` con `ponHueco`, que deja puesto lo que lo rompe. */
'use strict';

function sondaTextos(opts) {
  const MAX_HUECO = opts.maxHueco || 12;      // px: con más margen, el texto no está al límite
  const MAX_LETRA = opts.maxLetra || 0.3;     // px por letra: a 0,3, unos 12 px en una línea de 40 letras
  const SALTA = 'script,style,svg,noscript,template,canvas';
  const cs = (e) => getComputedStyle(e);
  const esInline = (e) => { const d = cs(e).display; return d === 'inline' || d === 'contents'; };

  let raices = [];
  for (const s of opts.raices) raices.push(...document.querySelectorAll(s));
  if (opts.subeDesde) {
    let c = document.querySelector(opts.subeDesde);
    while (c && c.getBoundingClientRect().height < (opts.subeAlto || 220)) c = c.parentElement;
    if (c) raices.push(c);
  }
  raices = raices.filter((r) => { const b = r.getBoundingClientRect(); return b.width > 0 && b.height > 0; });
  if (!raices.length) return { error: 'no encuentro la raíz: ' + JSON.stringify(opts.raices || opts.subeDesde) };

  /* Bloques: el ancestro no inline de cada texto, con sus textos y los inline de por medio. */
  const bloques = new Map();
  for (const raiz of raices) {
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (!/\S/.test(n.nodeValue)) continue;
      const p = n.parentElement;
      if (!p || p.closest(SALTA)) continue;
      let b = p;
      const inl = [];
      while (b !== raiz && esInline(b)) { inl.push(b); b = b.parentElement; }
      if (!bloques.has(b)) bloques.set(b, { textos: [], inline: new Set() });
      const reg = bloques.get(b);
      reg.textos.push(n);
      inl.forEach((e) => reg.inline.add(e));
    }
  }
  const vivos = [...bloques.keys()].filter((b) => {
    const r = b.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    if (r.right < 1 || r.left > innerWidth - 1) return false;
    if (opts.soloPantalla && (r.bottom < 1 || r.top > innerHeight - 1)) return false;
    /* Lo que se recorta a propósito no cuenta: el texto solo para el lector de pantalla (una caja de 1 px) y
       los nombres de las actividades plegadas en la home, que van en una caja de ancho cero. */
    if (limites(b).some((L) => L.recorta && L.right - L.left < 4)) return false;
    return true;
  });

  function lineas(b) {
    const rects = [];
    for (const t of bloques.get(b).textos) {
      const rg = document.createRange();
      rg.selectNodeContents(t);
      for (const q of rg.getClientRects()) if (q.width > 0.3 && q.height > 0) rects.push(q);
    }
    rects.sort((a, c) => a.top - c.top);
    const ls = [];
    for (const q of rects) {
      const l = ls.find((L) => Math.min(L.bottom, q.bottom) - Math.max(L.top, q.top) > 0.5 * Math.min(L.bottom - L.top, q.height));
      if (l) { l.left = Math.min(l.left, q.left); l.right = Math.max(l.right, q.right); l.top = Math.min(l.top, q.top); l.bottom = Math.max(l.bottom, q.bottom); }
      else ls.push({ top: q.top, bottom: q.bottom, left: q.left, right: q.right });
    }
    return ls;
  }
  /* Las cajas que el texto no debe pasar: la suya, las de los ancestros que recortan y la pantalla. */
  function limites(b) {
    const out = [];
    for (let e = b; e && e !== document.documentElement; e = e.parentElement) {
      if (e !== b && cs(e).overflowX === 'visible') continue;
      const r = e.getBoundingClientRect(), s = cs(e);
      out.push({ e, recorta: e !== b || s.overflowX !== 'visible',
        left: r.left + e.clientLeft + parseFloat(s.paddingLeft), right: r.left + e.clientLeft + e.clientWidth - parseFloat(s.paddingRight) });
    }
    out.push({ e: null, recorta: true, left: 0, right: innerWidth });
    return out;
  }
  function foto(b) {
    const ls = lineas(b);
    const izq = Math.min(...ls.map((l) => l.left)), der = Math.max(...ls.map((l) => l.right));
    const r = b.getBoundingClientRect();
    const fuera = limites(b).filter((L) => izq < L.left - 0.5 || der > L.right + 0.5);
    const sale = fuera.map((L) => (L.recorta ? 'se corta' : 'se sale de su caja'));
    const exceso = Math.max(0, ...fuera.map((L) => Math.max(L.left - izq, der - L.right)));
    const p = b.parentElement, pr = p.getBoundingClientRect(), ps = cs(p);
    return { n: ls.length, top: r.top, bottom: r.bottom, sale, exceso, padreAlto: pr.height,
      padreBottom: pr.bottom - parseFloat(ps.paddingBottom) - parseFloat(ps.borderBottomWidth) };
  }
  /* Una línea más solo mueve el diseño si su caja crece o se sale por abajo. En las pilas del runner, un
     texto escondido que pasa de 2 a 3 líneas no mueve nada si otro de la pila ya ocupa 3. */
  const parte = (f, f0) => f.n > f0.n && (f.padreAlto > f0.padreAlto + 0.5 || f.bottom > f0.padreBottom + 0.5);
  const abuelo = (b) => { let a = b; for (let i = 0; i < 3 && a.parentElement; i++) a = a.parentElement; return a; };
  const vecinosDe = (b) => { const a = abuelo(b); return vivos.filter((o) => o !== b && a.contains(o)); };
  /* Moverse de sitio solo cuenta si la caja que lo lleva crece: un texto con `text-wrap: balance`
     cambia qué palabra va abajo al crecer un pelo, y eso no mueve nada (la frase del día, en la home). */
  const altoAbuelo = new Map(vivos.map((b) => [b, abuelo(b).getBoundingClientRect().height]));
  const crece = (b) => Math.abs(abuelo(b).getBoundingClientRect().height - altoAbuelo.get(b)) > 0.5;
  const base = new Map(vivos.map((b) => [b, foto(b)]));
  const nombre = (b) => bloques.get(b).textos.map((t) => t.nodeValue).join('').replace(/\s+/g, ' ').trim().slice(0, 140);

  /* Lo que cambió con el bloque estirado, o null si nada. */
  function rompe(b, vecinos) {
    const f = foto(b), f0 = base.get(b);
    if (parte(f, f0)) return 'se parte en ' + f.n + ' líneas';
    const nueva = f.sale.find((s) => !f0.sale.includes(s));
    if (nueva) return nueva;
    if (Math.abs(f.top - f0.top) > 2 && crece(b)) return 'salta de sitio';
    for (const o of vecinos) {
      const g = foto(o), g0 = base.get(o);
      if (parte(g, g0)) return 'parte a su vecino «' + nombre(o).slice(0, 50) + '»';
      if (Math.abs(g.top - g0.top) > 2 && crece(b)) return 'mueve a su vecino «' + nombre(o).slice(0, 50) + '»';
    }
    return null;
  }
  /* El hueco invisible: `text-indent`, que alarga la primera línea (la única, en un texto de una) y
     cuenta en su ancho natural. NO un elemento metido tras la última letra: en Ajustes, un `span`
     de 0 px ya movía 25 px todo el panel, porque hay reglas de CSS que miran los hijos. */
  function conHueco(b, px, fn) {
    const antes = [b.style.getPropertyValue('text-indent'), b.style.getPropertyPriority('text-indent')];
    const propia = parseFloat(cs(b).textIndent) || 0;
    b.style.setProperty('text-indent', (propia + px) + 'px', 'important');
    try { return fn(); } finally {
      if (antes[0]) b.style.setProperty('text-indent', antes[0], antes[1]); else b.style.removeProperty('text-indent');
    }
  }
  /* La separación de letra, en el bloque y en sus inline (cada uno sobre la suya). */
  function conLetra(b, px, fn) {
    const els = [b, ...bloques.get(b).inline];
    const antes = els.map((e) => [e.style.getPropertyValue('letter-spacing'), e.style.getPropertyPriority('letter-spacing')]);
    const propias = els.map((e) => { const v = cs(e).letterSpacing; return v === 'normal' ? 0 : parseFloat(v); });
    els.forEach((e, i) => e.style.setProperty('letter-spacing', (propias[i] + px) + 'px', 'important'));
    try { return fn(); } finally {
      els.forEach((e, i) => { if (antes[i][0]) e.style.setProperty('letter-spacing', antes[i][0], antes[i][1]); else e.style.removeProperty('letter-spacing'); });
    }
  }
  function busca(prueba, max, pasos) {
    if (!prueba(max)) return { valor: max, mas: true };
    let lo = 0, hi = max;
    if (prueba(0)) return { valor: 0, motivo: prueba(0) };
    for (let i = 0; i < pasos; i++) { const m = (lo + hi) / 2; if (prueba(m)) hi = m; else lo = m; }
    return { valor: lo, motivo: prueba(hi) };
  }
  const caracteres = (b) => bloques.get(b).textos.map((t) => t.nodeValue).join('').replace(/\s+/g, ' ').trim().length;
  function natural(b) {
    const c = b.cloneNode(true);
    [c, ...c.querySelectorAll('*')].forEach((e) => [...e.attributes].forEach((a) => { if (a.name === 'id' || a.name.startsWith('data-') || a.name.startsWith('aria-')) e.removeAttribute(a.name); }));
    c.style.cssText += ';position:absolute!important;visibility:hidden!important;width:max-content!important;max-width:none!important;min-width:0!important;white-space:nowrap!important;left:0;top:0;';
    b.parentElement.appendChild(c);
    const r = c.getBoundingClientRect(), s = cs(c);
    const w = r.width - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight) - parseFloat(s.borderLeftWidth) - parseFloat(s.borderRightWidth);
    c.remove();
    return w;
  }
  const donde = (b) => {
    const partes = [];
    for (let e = b; e && partes.length < 3 && e !== document.body; e = e.parentElement) {
      const d = [...e.attributes].filter((a) => a.name.startsWith('data-pace')).map((a) => '[' + a.name + (a.value ? '=' + a.value.slice(0, 20) : '') + ']').slice(0, 2).join('');
      const cl = typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
      if (d || cl || e === b) partes.unshift(e.tagName.toLowerCase() + d + cl);
    }
    return partes.join(' › ');
  };

  const out = [];
  /* `solo`: trozos de texto; se miden solo los bloques que lleven alguno (los demás siguen contando
     como vecinos). Es lo que usa la prueba, que solo vigila los textos que se acortaron. */
  /* Un trozo que empieza por «=» tiene que ser el texto entero («=Move», no «Move a little»). */
  const casa = (b, s) => (s[0] === '=' ? nombre(b) === s.slice(1) : nombre(b).includes(s));
  const medibles = opts.solo ? vivos.filter((b) => opts.solo.some((s) => casa(b, s))) : vivos;
  for (const b of medibles) {
    const f0 = base.get(b);
    const vec = vecinosDe(b);
    const s = cs(b);
    const r = b.getBoundingClientRect();
    const hueco = busca((px) => conHueco(b, px, () => rompe(b, vec)), MAX_HUECO, 9);
    const letra = busca((px) => conLetra(b, px, () => rompe(b, vec)), MAX_LETRA, 9);
    const nat = f0.n === 1 ? natural(b) : null;
    out.push({
      texto: nombre(b), donde: donde(b), lineas: f0.n, letras: caracteres(b),
      reserva: s.visibility === 'hidden' || !!b.closest('[aria-hidden="true"]'),
      nowrap: s.whiteSpace === 'nowrap' || s.whiteSpace === 'pre',
      yaSale: f0.sale.length ? f0.sale.join(', ') : null,
      letraPx: parseFloat(s.fontSize), ancho: +r.width.toFixed(1),
      natural: nat == null ? null : +nat.toFixed(2),
      /* Un texto que ya se sale no tiene margen: lo que se sale va en negativo (antes contaba como holgado). */
      margen: f0.sale.length ? -(+f0.exceso.toFixed(2)) : +hueco.valor.toFixed(2), margenMas: !f0.sale.length && !!hueco.mas,
      motivo: f0.sale.length ? 'ya ' + f0.sale.join(', ') : hueco.motivo || null,
      porLetra: +letra.valor.toFixed(4), porLetraMas: !!letra.mas, motivoLetra: letra.motivo || null,
    });
  }
  return { textos: out };
}

/* Deja puesto un hueco al final del texto `texto` (el primero que case dentro de la raíz) y devuelve
   la función que lo quita. Lo que la app haga después se mide fuera, con su propia espera. */
function ponHueco({ texto, px, letra, raices }) {
  const raizSel = (raices || ['body']).join(',');
  for (const raiz of document.querySelectorAll(raizSel)) {
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    const nodos = [];
    let n;
    while ((n = w.nextNode())) nodos.push(n);
    /* El texto del bloque puede venir en varios nodos: se busca el último de una ventana que lo cubra. */
    for (let i = 0; i < nodos.length; i++) {
      let acum = '';
      for (let j = i; j < Math.min(nodos.length, i + 8); j++) {
        acum = (acum + nodos[j].nodeValue).replace(/\s+/g, ' ');
        if (acum.trim() === texto) {
          let b = nodos[j].parentElement;
          while (b && ['inline', 'contents'].includes(getComputedStyle(b).display)) b = b.parentElement;
          if (!b || b.getBoundingClientRect().width <= 0) break;
          /* En una línea, la sangría; en varias, la separación de letra que la rompe. */
          const prop = letra ? 'letter-spacing' : 'text-indent';
          const antes = b.style.getPropertyValue(prop);
          const propia = parseFloat(getComputedStyle(b)[letra ? 'letterSpacing' : 'textIndent']) || 0;
          b.style.setProperty(prop, (propia + (letra || px)) + 'px', 'important');
          window.__paceSondaQuita = () => { if (antes) b.style.setProperty(prop, antes); else b.style.removeProperty(prop); };
          return true;
        }
      }
    }
  }
  return false;
}

/* Lo que se ve de la pantalla: el scroll que piden sus cajas y las marcas con las que la app se recoge. */
function efectoPantalla() {
  const q = (s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0);
  const scroll = {};
  for (const [nom, sel] of [['home', '[data-pace-home-body]'], ['ajustes', '[data-pace-tweaks-panel]'], ['runner', '[data-pace-v1-body]']]) {
    const e = q(sel)[0];
    if (e) scroll[nom] = e.scrollHeight - e.clientHeight;
  }
  const g = q('[data-pace-v1-glyph]')[0], d = q('[data-pace-dial-fit]')[0];
  const pie = q('[data-pace-break-shortcut]')[0];
  return {
    scroll,
    luegoEscondido: q('[data-pace-home-justa]').length > 0 || document.querySelectorAll('[data-pace-home-justa]').length > 0,
    actividadesEnFila: document.querySelectorAll('[data-pace-home-fila]').length > 0,
    runnerJusto: document.querySelectorAll('[data-pace-v1-justo]').length > 0,
    dibujo: g ? Math.round(g.getBoundingClientRect().height) : null,
    aro: d ? Math.round(d.getBoundingClientRect().height) : null,
    pieDeLaPausa: pie ? Math.round(pie.getBoundingClientRect().bottom) : null,
    pantalla: innerHeight,
  };
}

module.exports = { sondaTextos, ponHueco, efectoPantalla };
