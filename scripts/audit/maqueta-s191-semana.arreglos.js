/* PACE · LAS TRANSFORMACIONES DEL ARREGLO DE «SEMANA» (s191)
 * ==========================================================
 * Dos funciones que se ejecutan DENTRO de un documento: las maquetas las meten en sus
 * iframes y el banco de viewports las inyecta en la APP VIVA (sin tocar el codigo).
 * Una sola fuente: si el arreglo cambia, la maqueta y la medida cambian a la vez, y lo
 * que se aprueba mirando es exactamente lo que se midio.
 *
 * Lo que decidio el usuario (s191): el arreglo B -- barras que miden, nombre a la
 * izquierda, dias una vez -- SOLO EN MOVIL; en escritorio su diseño de siempre, y que
 * quepa sin scroll.
 *
 * Las funciones se serializan con toString(), asi que NO pueden usar nada de fuera de
 * su cuerpo: todo lo que necesitan entra por parametro.
 */
'use strict';

/* PIE EN UNA FILA -- la nota y la retencion comparten fila. La retencion era una fila
   propia al pie y empujaba la pestaña fuera de los 385 px que caben a 1536x714. El
   pie se agrupa SIEMPRE, haya retencion o no, con 8 px arriba en vez de los 10 de la
   nota: sin retencion la pestaña tambien se pasaba, por 0,9 px. */
function pieEnUnaFila(d) {
  const nota = d.querySelector('[data-pace-week-note]');
  if (!nota || nota.parentNode.hasAttribute('data-pace-week-foot')) return;
  const ret = d.querySelector('[data-pace-week-hold]');
  const pie = d.createElement('div');
  pie.setAttribute('data-pace-week-foot', '');
  pie.style.cssText = 'display:flex;gap:14px;align-items:center;margin-top:8px';
  nota.parentNode.insertBefore(pie, nota);
  pie.appendChild(nota);
  nota.style.marginTop = '0';
  nota.style.flex = '1 1 auto';
  if (ret) {
    pie.appendChild(ret);
    ret.style.marginTop = '0';
    ret.style.flex = '0 0 auto';
    ret.style.gap = '10px';
  }
}

/* FILAS QUE MIDEN (arreglo B, solo movil). Mismo vocabulario que WeekBarRow -- color
   de modulo, opacidad 0,8 salvo hoy, raya de 2 px en los dias a cero, cifra de 10 px
   en tinta 3--; cambia la GEOMETRIA:
     · el nombre del modulo va en una columna a la IZQUIERDA, asi que no hay un titulo
       encima de las barras con el que la cifra pueda chocar;
     · las barras se miden en PIXELES contra un alto que ya descuenta la cifra (la
       version de la app pide % contra una caja sin alto y todas caen a 4 px);
     · los dias se escriben UNA vez, bajo la ultima fila.
   El alto del grafico se fija con !important porque la hoja de WeekView fuerza en
   movil «height: 28px !important», que aplastaba estos 40 px. */
function filasQueMiden(d, semana, hoy) {
  const vista = d.querySelector('[data-pace-week-view]');
  if (!vista) return;
  const filas = Array.from(vista.querySelectorAll('[data-pace-week-bar-row]'));
  if (!filas.length || vista.hasAttribute('data-filas-miden')) return;
  vista.setAttribute('data-filas-miden', '');
  const claves = ['focusMinutes', 'breathMinutes', 'moveMinutes', 'waterGlasses'];
  const colores = ['var(--focus)', 'var(--breathe)', 'var(--move)', 'var(--hydrate)'];
  const COL = 58, ALTO = 40, CIFRA = 14;
  const dias = Array.from(filas[0].querySelectorAll('[data-pace-bar-chart] > div > span')).map(x => x.textContent);
  filas.forEach((fila, k) => {
    const nombre = fila.firstElementChild.firstElementChild.textContent;
    const unidad = fila.firstElementChild.lastElementChild.textContent;
    const datos = semana[claves[k]];
    const max = Math.max(1, ...datos);
    const util = ALTO - CIFRA;
    const nueva = d.createElement('div');
    nueva.setAttribute('data-pace-week-bar-row', '');
    nueva.style.cssText = 'display:grid;grid-template-columns:' + COL + 'px 1fr;gap:10px;align-items:end;margin-bottom:6px';
    nueva.innerHTML = '<div style="padding-bottom:1px;line-height:1.15">'
      + '<div style="font-family:var(--font-display);font-style:italic;font-size:13px;font-weight:500;color:var(--ink-2)">' + nombre + '</div>'
      + '<div style="font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);font-weight:500;margin-top:2px">' + unidad + '</div></div>'
      + '<div data-pace-bar-chart style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;align-items:end">'
      + datos.map((v, i) => {
          const h = v > 0 ? Math.max(4, Math.round(v / max * util)) : 2;
          return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">'
            + (v > 0 ? '<span style="font-size:10px;line-height:11px;color:var(--ink-3);margin-bottom:3px;font-variant-numeric:tabular-nums">' + v + '</span>' : '')
            + '<div style="width:100%;height:' + h + 'px;background:' + (v > 0 ? colores[k] : 'var(--line)')
            + ';opacity:' + (i === hoy ? 1 : (v > 0 ? 0.8 : 0.4)) + ';border-radius:3px 3px 0 0"></div></div>';
        }).join('')
      + '</div>';
    nueva.querySelector('[data-pace-bar-chart]').style.setProperty('height', ALTO + 'px', 'important');
    fila.replaceWith(nueva);
  });
  const todas = vista.querySelectorAll('[data-pace-week-bar-row]');
  const pieDias = d.createElement('div');
  pieDias.style.cssText = 'display:grid;grid-template-columns:' + COL + 'px 1fr;gap:10px;margin-top:-2px';
  pieDias.innerHTML = '<span></span><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">'
    + dias.map((x, i) => '<span style="text-align:center;font-size:10px;letter-spacing:.3px;color:'
      + (i === hoy ? 'var(--ink)' : 'var(--ink-3)') + ';font-weight:' + (i === hoy ? 600 : 400) + '">' + x + '</span>').join('')
    + '</div>';
  todas[todas.length - 1].after(pieDias);
}

/* SOLAPES -- texto contra texto Y texto contra barra. Una barra es un div VACIO con
   fondo en linea: las tarjetas y la nota tambien tienen fondo, pero tienen hijos. La
   primera version solo comparaba textos y dio 0 en un movil donde los dias se
   pintaban encima de las barras; calibrado en rojo en s191 (12 con el fallo, 0 sin). */
function solapesSemana(d) {
  const v = d.querySelector('[data-pace-week-view]');
  if (!v) return null;
  const visible = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const hojas = Array.from(v.querySelectorAll('span, div, strong')).filter(e => e.children.length === 0 && e.textContent.trim() && visible(e));
  const barras = Array.from(v.querySelectorAll('div')).filter(x => x.style.background && !x.children.length && !x.textContent.trim() && visible(x));
  const choca = (p, q) => Math.min(p.right, q.right) - Math.max(p.left, q.left) > 1 && Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > 1;
  const pares = [];
  for (let a = 0; a < hojas.length; a++) for (let b = a + 1; b < hojas.length; b++) {
    if (choca(hojas[a].getBoundingClientRect(), hojas[b].getBoundingClientRect()))
      pares.push('«' + hojas[a].textContent.trim() + '»/«' + hojas[b].textContent.trim() + '»');
  }
  hojas.forEach(t => barras.forEach(x => {
    if (choca(t.getBoundingClientRect(), x.getBoundingClientRect())) pares.push('«' + t.textContent.trim() + '»/barra');
  }));
  return pares;
}

/* SIN RETENCION (ronda 3). El usuario: «no quiero la parte de retencion de momento».
   La linea deja de MOSTRARSE; el dato (`weeklyStats.holdSeconds`) se sigue guardando,
   asi que puede volver sin perder nada. Y quitarla resuelve sola el scroll de
   escritorio: era la unica fila que empujaba la pestaña fuera de los 385 px. */
function sinRetencion(d) {
  d.querySelectorAll('[data-pace-week-hold]').forEach(x => x.remove());
}

/* LA NOTA, 4 PX MAS CERCA (ronda 3). Sin retencion, la pestaña mide 385,88 px y su hueco
   a 1536x714 son 385: la tarjeta del panel queda con 605 de alto util y 606 de
   contenido, 1 px de scroll -- y en Windows 1 px basta para que salga la barra. El
   banco no lo veia porque exigia MAS de 1 px de diferencia. Con la nota a 6 px en vez
   de 10, la pestaña queda 3 px por DEBAJO del hueco, no pegada a el. */
function notaMasCerca(d) {
  const nota = d.querySelector('[data-pace-week-note]');
  if (nota) nota.style.marginTop = '6px';
}

module.exports = { pieEnUnaFila, filasQueMiden, solapesSemana, sinRetencion, notaMasCerca };
