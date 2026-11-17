/* PACE · LO QUE SE MIDE EN CADA PANTALLA CON LOS TEXTOS LARGOS (17 nov. 2026)
 * ==========================================================================
 * `medirTextos` corre dentro de la página y devuelve una lista de fallos, cada uno con su tipo, el
 * texto (o el botón) y cuántos px. Lo usan tests/textos-largos.spec.js y el script que hace las fotos
 * de la página para Ez (docs/proposals/textos-largos-17nov/genera.js). Mide lo que vería una persona:
 *   · CORTADO: un texto que un contenedor con `overflow: hidden` (o `clip`) no deja ver entero y que
 *     no acaba en puntos suspensivos (los que ya llevan `text-overflow: ellipsis` o `line-clamp` son
 *     cortes pensados y no cuentan). También el texto que sale de la ventana por un lado.
 *   · PISA: dos textos que se montan, o un texto tapado por otra cosa. Se mira la franja central de
 *     cada línea, no su caja entera: con `line-height` 1 dos líneas seguidas ya se tocan por arriba y
 *     por abajo sin que se vea nada.
 *   · FUERA: un botón que sale de la ventana o que un contenedor sin scroll corta, y al que no se
 *     llega con scroll.
 *   · SCROLL: scroll donde no debe haberlo (la raíz de `sinScroll`: la home, «Tus datos» abierta) y
 *     scroll de lado en cualquier pantalla.
 *   · SIN TRADUCIR (solo con los textos largos): un texto que se ve sin las marcas «⟦ ⟧» no pasó por
 *     i18n, y en inglés saldría en castellano (o al revés).
 */
'use strict';

function medirTextos(o) {
  const vw = innerWidth, vh = innerHeight;
  const out = [];
  const visibles = (sel) => Array.from(document.querySelectorAll(sel)).filter((e) => e.getClientRects().length);
  let raiz = document.body;
  if (o.raiz) { const rs = visibles(o.raiz); if (rs.length) raiz = rs[rs.length - 1]; }
  const corto = (s) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, 70);
  const donde = (el) => {
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const a = Array.from(e.attributes || []).find((x) => x.name.startsWith('data-pace'));
      if (a) return a.name.replace('data-pace-', '') + (a.value && a.value.length < 24 ? '=' + a.value : '');
    }
    return el.tagName.toLowerCase();
  };
  const seVe = (el) => el.checkVisibility ? el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : true;
  const corta = (s) => /(hidden|clip)/.test(s.overflowX + ' ' + s.overflowY);
  const desplaza = (s) => /(auto|scroll)/.test(s.overflowX + ' ' + s.overflowY);
  /* Los antepasados que recortan, hasta la raíz del documento, con su caja de relleno. `trasX` y
     `trasY`: entre el texto y este recorte hay un contenedor con scroll en ese eje, y lo que el
     recorte esconde se ve desplazando (una lista larga en una ventana con `overflow: hidden`). */
  const recortes = (el) => {
    const r = [];
    let trasX = false, trasY = false;
    for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (!corta(s) && !desplaza(s)) continue;
      const c = a.getBoundingClientRect();
      r.push({ el: a, s, scroll: desplaza(s), trasX, trasY, x0: c.left + a.clientLeft, y0: c.top + a.clientTop,
        x1: c.left + a.clientLeft + a.clientWidth, y1: c.top + a.clientTop + a.clientHeight,
        puntos: s.textOverflow === 'ellipsis', clamp: s.webkitLineClamp && s.webkitLineClamp !== 'none' });
      if (/(auto|scroll)/.test(s.overflowX)) trasX = true;
      if (/(auto|scroll)/.test(s.overflowY)) trasY = true;
    }
    r.trasX = trasX; r.trasY = trasY;
    return r;
  };

  /* Las unidades y el nombre se escriben igual en los dos idiomas y no pasan por i18n. */
  const IGUALES = /(?<!\p{L})(PACE|min|h|s|ml|kcal)(?!\p{L})/gu;
  const sinIguales = (s) => s.replace(IGUALES, (m) => ' '.repeat(m.length));
  const dentroDeMarcas = (n) => {
    if (!/\p{L}/u.test(sinIguales(n.nodeValue).replace(/⟦[^⟦⟧]*⟧/g, ' '))) return true;
    let a = n.parentElement;
    for (let nivel = 0; a && nivel < 5; nivel++, a = a.parentElement) {
      const r = document.createRange();
      r.setStart(a, 0); r.setEnd(n, 0);
      const desde = r.toString().length, todo = sinIguales(a.textContent);
      let hondo = 0, bien = true;
      for (let k = 0; k < desde + n.nodeValue.length && k < todo.length && bien; k++) {
        const c = todo[k];
        if (c === '⟦') hondo++;
        else if (c === '⟧') hondo = Math.max(0, hondo - 1);
        else if (k >= desde && hondo === 0 && /\p{L}/u.test(c)) bien = false;
      }
      if (bien) return true;
    }
    return false;
  };

  /* 1. Los textos: cada nodo de texto que se ve, con sus líneas. */
  const lineas = [];
  const tw = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeValue.trim() && !/^(SCRIPT|STYLE|TITLE|NOSCRIPT)$/.test(n.parentElement.tagName)) ? 1 : 3,
  });
  const vistosCortados = new Set();
  for (let n = tw.nextNode(), i = 0; n; n = tw.nextNode(), i++) {
    const el = n.parentElement;
    if (!seVe(el)) continue;
    const rango = document.createRange();
    rango.selectNodeContents(n);
    const rects = Array.from(rango.getClientRects()).filter((r) => r.width > 0.5 && r.height > 0.5);
    if (!rects.length) continue;
    const texto = corto(n.nodeValue);
    const rec = recortes(el);
    /* Escondido a propósito para la vista, pero no para el lector de pantalla (una caja de 1×1). */
    if (rec.some((c) => !c.scroll && c.x1 - c.x0 <= 1 && c.y1 - c.y0 <= 1)) continue;
    /* ¿Lo corta un contenedor sin scroll, o sale de la ventana? */
    let cortePx = 0, ladoPx = 0;
    for (const r of rects) {
      for (const c of rec) {
        if (c.scroll) continue;
        const h = Math.max(c.x0 - r.left, r.right - c.x1);
        const v = Math.max(c.y0 - r.top, r.bottom - c.y1);
        const hx = /(hidden|clip)/.test(c.s.overflowX) && !c.puntos && !c.trasX ? h : 0;
        const vy = /(hidden|clip)/.test(c.s.overflowY) && !c.clamp && !c.trasY ? v : 0;
        /* La caja de la línea lleva el hueco de la fuente por arriba y por abajo: 3 px no son corte. */
        cortePx = Math.max(cortePx, hx > 1 ? hx : 0, vy > 3 ? vy : 0);
      }
      if (!rec.trasX) ladoPx = Math.max(ladoPx, r.right - vw, -r.left);
    }
    if (cortePx > 1 && !vistosCortados.has(texto)) {
      vistosCortados.add(texto);
      out.push({ tipo: 'cortado', texto, px: Math.round(cortePx), donde: donde(el) });
    }
    if (ladoPx > 1) out.push({ tipo: 'sale de la ventana', texto, px: Math.round(ladoPx), donde: donde(el) });
    /* Para ver si se pisan: la franja central de cada línea, recortada a lo que se ve. */
    for (const r of rects) {
      let x0 = r.left, x1 = r.right, y0 = r.top + r.height * 0.3, y1 = r.bottom - r.height * 0.3;
      for (const c of rec) { x0 = Math.max(x0, c.x0); x1 = Math.min(x1, c.x1); y0 = Math.max(y0, c.y0); y1 = Math.min(y1, c.y1); }
      if (x1 - x0 > 1 && y1 - y0 > 1) lineas.push({ i, el, texto, x0, x1, y0, y1 });
    }
    /* Sin traducir: alguna letra fuera de las marcas, también mirando el texto de los antepasados
       (una frase con un desplegable en medio, «⟦De [9:00] a [17:00]⟧», llega en tres nodos). */
    if (o.pseudo && !dentroDeMarcas(n)) out.push({ tipo: 'sin traducir', texto, px: 0, donde: donde(el) });
  }
  /* 2. Dos textos que se montan. */
  const parejas = new Set();
  for (let a = 0; a < lineas.length; a++) {
    for (let b = a + 1; b < lineas.length; b++) {
      const p = lineas[a], q = lineas[b];
      if (p.i === q.i) continue;
      const ix = Math.min(p.x1, q.x1) - Math.max(p.x0, q.x0), iy = Math.min(p.y1, q.y1) - Math.max(p.y0, q.y0);
      if (ix > 1 && iy > 1) {
        const k = p.i + ':' + q.i;
        if (parejas.has(k)) continue;
        parejas.add(k);
        out.push({ tipo: 'pisa', texto: p.texto + '  ⟷  ' + q.texto, px: Math.round(Math.min(ix, iy)), donde: donde(p.el) + ' / ' + donde(q.el) });
      }
    }
  }
  /* Un texto tapado por algo que no es él: se pregunta qué hay en el centro de su línea. */
  const tapados = new Set();
  for (const l of lineas) {
    const x = (l.x0 + l.x1) / 2, y = (l.y0 + l.y1) / 2;
    if (x < 0 || y < 0 || x >= vw || y >= vh || tapados.has(l.i)) continue;
    const e = document.elementFromPoint(x, y);
    if (!e || e === l.el || l.el.contains(e) || e.contains(l.el)) continue;
    if (getComputedStyle(l.el).pointerEvents === 'none') continue;
    /* Lo transparente no tapa: la zona de toque estirada de una tarjeta (`.pace-lib-hit`, con su
       `::after` encima de toda la tarjeta). Si su propio texto pisa, lo dice «pisa». */
    const se = getComputedStyle(e);
    /* (ni un botón sin fondo que solo pinta su flechita a un lado: el de la hora del día.) */
    if (/rgba\(.*, 0\)|transparent/.test(se.backgroundColor) && !/gradient/.test(se.backgroundImage)) continue;
    /* Ni la zona de toque agrandada de un botón (toques.css: un `::after` más grande que él, que no
       se pinta): si el punto cae fuera de la caja del botón, lo que lo «tapa» es su pseudoelemento. */
    const ce = e.getBoundingClientRect();
    if (x < ce.left || x > ce.right || y < ce.top || y > ce.bottom) continue;
    tapados.add(l.i);
    out.push({ tipo: 'tapado', texto: l.texto, px: 0, donde: donde(l.el) + ' bajo ' + donde(e) });
  }

  /* 3. Botones fuera de la ventana o cortados por un contenedor sin scroll. */
  for (const b of raiz.querySelectorAll('button, a[href], input, select, textarea, [role="button"], [role="tab"]')) {
    if (!seVe(b)) continue;
    const r = b.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const rec = recortes(b.parentElement);
    const llegaY = rec.trasY || document.scrollingElement.scrollHeight > vh + 1;
    const llegaX = rec.trasX;
    let px = Math.max(llegaX ? 0 : r.right - vw, llegaX ? 0 : -r.left, llegaY ? 0 : r.bottom - vh, llegaY ? 0 : -r.top);
    for (const c of rec) {
      if (c.scroll) continue;
      if (!c.trasX) px = Math.max(px, r.right - c.x1, c.x0 - r.left);
      if (!c.trasY) px = Math.max(px, r.bottom - c.y1, c.y0 - r.top);
    }
    if (px > 1) out.push({ tipo: 'botón fuera', texto: corto(b.getAttribute('aria-label') || b.innerText || b.value || b.placeholder), px: Math.round(px), donde: donde(b) });
  }

  /* 3b. Una fila que no cabe en su caja y se mete en el margen de lo que la envuelve, sin cortarse
     ni pedir scroll: no se ve roto, pero ya no está centrada y el margen de la ventana desaparece
     (la fila de las otras tres puertas de la pausa, en castellano a 360 px). Solo filas con texto
     cuyos hijos CON TEXTO pasan de su caja de contenido (la luz del aro, sin texto, no cuenta). */
  for (const e of raiz.querySelectorAll('*')) {
    const s = getComputedStyle(e);
    if (!/flex|grid/.test(s.display) || s.flexDirection.startsWith('column') || /(auto|scroll|hidden|clip)/.test(s.overflowX)) continue;
    if (!seVe(e) || e.clientWidth < 40) continue;
    const hijos = Array.from(e.children).filter((h) => seVe(h) && h.innerText && h.innerText.trim() && getComputedStyle(h).position !== 'absolute');
    if (!hijos.length) continue;
    const c = e.getBoundingClientRect();
    const x0 = c.left + e.clientLeft + parseFloat(s.paddingLeft), x1 = c.left + e.clientLeft + e.clientWidth - parseFloat(s.paddingRight);
    /* Un margen negativo es un saliente pensado (las pestañas de Estadísticas bajo la ✕): se descuenta. */
    const sobra = Math.max(...hijos.map((h) => {
      const r = h.getBoundingClientRect(), sh = getComputedStyle(h);
      return Math.max(r.right - x1 - Math.max(0, -parseFloat(sh.marginRight)), x0 - r.left - Math.max(0, -parseFloat(sh.marginLeft)));
    }));
    if (sobra > 1) out.push({ tipo: 'se sale de su caja', texto: corto(e.innerText).slice(0, 50), px: Math.round(sobra), donde: donde(e) });
  }

  /* 4. Scroll donde no debe, y scroll de lado en cualquier sitio. */
  const se = document.scrollingElement;
  if (se.scrollWidth > vw + 1) out.push({ tipo: 'scroll de lado', texto: 'la página', px: se.scrollWidth - vw, donde: 'página' });
  for (const e of [raiz, ...raiz.querySelectorAll('*')]) {
    const s = getComputedStyle(e);
    /* Una fila hecha para deslizarse de lado (sin barra: los filtros de la biblioteca) no cuenta. */
    if (e !== raiz && s.scrollbarWidth === 'none') continue;
    if (/(auto|scroll)/.test(s.overflowX) && e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 40) {
      out.push({ tipo: 'scroll de lado', texto: corto(e.innerText).slice(0, 40), px: e.scrollWidth - e.clientWidth, donde: donde(e) });
    }
  }
  if (o.sinScroll) {
    for (const r of visibles(o.sinScroll)) {
      for (const e of [r, ...r.querySelectorAll('*')]) {
        const s = getComputedStyle(e);
        const sobra = e.scrollHeight - e.clientHeight;
        if (/(auto|scroll)/.test(s.overflowY) && sobra > 1) out.push({ tipo: 'scroll', texto: corto(e.innerText).slice(0, 40), px: sobra, donde: donde(e) });
      }
    }
    if (se.scrollHeight > vh + 1) out.push({ tipo: 'scroll', texto: 'la página', px: se.scrollHeight - vh, donde: 'página' });
  }
  return out;
}

module.exports = { medirTextos };
