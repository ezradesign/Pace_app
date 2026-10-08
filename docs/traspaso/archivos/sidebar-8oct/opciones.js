/* PACE · las tres opciones de la barra lateral, como DOM que se inyecta en la app real
   ====================================================================================
   `datos` corre DENTRO de la página: lee lo mismo que la barra de hoy, con sus
   selectores (`selectSidebarToday`, `selectSidebarWeek`, `selectSidebarTodayCounts`,
   `ritmoDe`, `ritmoSiguiente`) y con los textos que la barra ya ha pintado (la tarjeta,
   el último logro y su sello). Los glifos de los módulos son los de `ActivityBar.jsx`,
   pintados con React en un nodo suelto. Nada de lo que se ve está inventado: si una
   opción enseña un número, ese número ya existe en el estado.

   `pintar(d)` corre en Node y devuelve { html, css } con los tokens de la app
   (`--paper`, `--ink-*`, `--line`, colores de módulo, `--font-display`).

   Cada pieza lleva `data-sb-pieza` para que `fotos.js` mida su alto. */
'use strict';

function datos() {
  const s = getState();
  const glifo = (C) => {
    if (typeof C !== 'function') return '';
    const d = document.createElement('div');
    const raiz = ReactDOM.createRoot(d);
    ReactDOM.flushSync(() => raiz.render(React.createElement(C)));
    const h = d.innerHTML;
    raiz.unmount();
    return h;
  };
  let eventos = null;
  try { const snap = window.paceEventsSnapshot && window.paceEventsSnapshot(); eventos = snap && snap.events; } catch (e) { eventos = null; }
  const R = ritmoDe(s);
  const tarjeta = document.querySelector('[data-pace-sidebar-accion]');
  const titulo = document.querySelector('[data-pace-sidebar-ultimo-titulo]');
  const fila = document.querySelector('[data-pace-sidebar-ultimo]');
  const pie = [...document.querySelectorAll('[data-pace-sidebar-escala] > *')].pop();
  return {
    fecha: fechaCortaSidebar('es'),
    hoy: selectSidebarToday(s),
    semana: selectSidebarWeek(s),
    cuentas: selectSidebarTodayCounts(eventos, todayISO()),
    /* La home enseña «A tu ritmo» (el día servido o la pregunta ya contestada): entonces
       no hay chips de actividades y la línea dice cuál es la siguiente pausa. */
    homeConRitmo: !R.libre && !!(R.dia || R.propuesta),
    siguiente: ritmoSiguiente(s),
    tarjeta: tarjeta ? {
      kind: tarjeta.getAttribute('data-kind'),
      eyebrow: tarjeta.children[0].textContent,
      titulo: tarjeta.querySelector('h4 button').textContent,
      meta: (tarjeta.querySelector('p') || {}).textContent || '',
    } : null,
    logro: titulo ? (function () {
      const id = fila.getAttribute('data-pace-sidebar-ultimo');
      const a = (window.ACHIEVEMENT_CATALOG || []).find((x) => x.id === id) || {};
      return { titulo: titulo.textContent, sello: fila.querySelector('span').innerHTML, desc: a.desc || '' };
    })() : null,
    ws: s.weeklyStats || {},
    pieHoy: pie ? pie.outerHTML : '',
    version: typeof PACE_VERSION === 'string' ? PACE_VERSION : '',
    apoyo: typeof paceApoyoVisible !== 'function' || paceApoyoVisible(),
    g: { foco: glifo(window.ABFocus), respira: glifo(window.ABBreathe), mueve: glifo(window.ABMove),
         estira: glifo(window.ABStretch), agua: glifo(window.ABDrop) },
  };
}

/* ---------- lo que comparten las tres ---------- */

const NUM = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'];
const NUMF = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'];

function horas(min) {
  if (!min) return '0 min';
  if (min < 60) return min + ' min';
  const h = Math.floor(min / 60), r = min % 60;
  return h + ' h' + (r ? ' ' + (r < 10 ? '0' : '') + r : '');
}

/* Los minutos dichos con palabras, para el cuaderno: «dos horas y media», «siete minutos».
   Hasta doce en palabras, como `ritmo.numeros`; más allá, la cifra. */
function enPalabras(min) {
  if (min < 60) return (min === 1 ? 'un minuto' : (min <= 12 ? NUM[min] : min) + ' minutos');
  const h = Math.floor(min / 60), r = min % 60;
  let t = h === 1 ? 'una hora' : (h <= 12 ? NUMF[h] : h) + ' horas';
  if (r === 30) t += ' y media';
  else if (r === 15) t += ' y cuarto';
  else if (r) t += ' y ' + (r <= 12 ? NUM[r] : r) + ' minutos';
  return t;
}
const mayus = (t) => t.charAt(0).toUpperCase() + t.slice(1);

function ic(svg, color, tam) {
  return '<span class="sbp-ic" style="width:' + tam + 'px;height:' + tam + 'px;color:' + color + '">' + svg + '</span>';
}

/* `barras`: cada día una columna con sus minutos de foco, respira y cuerpo apilados en
   el color de su módulo, leídos de `weeklyStats` con el índice lunes-primero de siempre.
   El agua no tiene barra, como no enciende el día (criterio de s69). */
function semana(d, conRacha, barras) {
  const L = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const at = (k, i) => ((d.ws[k] || [])[i]) || 0;
  const tot = (i) => at('focusMinutes', i) + at('breathMinutes', i) + at('moveMinutes', i);
  let max = 60;
  for (let i = 0; i < 7; i++) max = Math.max(max, tot(i));
  const columna = (i, x) => {
    if (!x.active) return '<span class="sbp-bar-col"><i class="vacia' + (i > d.semana.todayIndex ? ' futura' : '') + '"></i></span>';
    const alto = (m) => m ? Math.max(2, Math.round(m / max * 30)) : 0;
    return '<span class="sbp-bar-col">' +
      [['focusMinutes', 'var(--focus)'], ['breathMinutes', 'var(--breathe)'], ['moveMinutes', 'var(--move)']]
        .map(([k, c]) => alto(at(k, i)) ? '<i style="height:' + alto(at(k, i)) + 'px;background:' + c + '"></i>' : '').join('') + '</span>';
  };
  const dias = d.semana.days.map((x, i) => barras
    ? '<span class="sbp-sem-dia' + (x.isToday ? ' hoy' : '') + '">' + columna(i, x) + '<span class="sbp-sem-l">' + L[i] + '</span></span>'
    : '<span class="sbp-sem-dia' + (x.isToday ? ' hoy' : '') + '"><span class="sbp-sem-l">' + L[i] + '</span>' +
      '<span class="sbp-sem-p' + (x.active ? ' on' : '') + '"></span></span>').join('');
  const s = d.semana;
  /* La frase que ya existe en i18n (`sidebar.week.rhythm`) y que la barra dejó de pintar:
     sin días todavía no se dice nada, que «mejor 0» no acompaña. */
  let pie = '';
  if (conRacha && s.currentStreak > 0) {
    pie = '<span class="sbp-sem-pie">' + (s.currentStreak === 1 ? '1 día en ritmo' : s.currentStreak + ' días en ritmo') +
      (s.longestStreak > s.currentStreak ? ' · mejor ' + s.longestStreak : '') + '</span>';
  }
  return '<button class="sbp-sem' + (barras ? ' barras' : '') + '" data-sb-pieza="semana" title="Ver la semana en Estadísticas"><span class="sbp-sem-dias">' + dias + '</span>' + pie + '</button>';
}

function logroFila(d, conCaja) {
  if (!d.logro) {
    return '<div class="sbp-logro vacio" data-sb-pieza="logro"><span class="sbp-sello">·</span>' +
      '<span class="sbp-logro-t"><span class="sbp-logro-n">Aún no hay ninguno</span><span class="sbp-enlace">Ver la colección</span></span></div>';
  }
  return '<button class="sbp-logro' + (conCaja ? ' caja' : '') + '" data-sb-pieza="logro"><span class="sbp-sello">' + d.logro.sello + '</span>' +
    '<span class="sbp-logro-t"><span class="sbp-logro-n">' + d.logro.titulo + '</span>' +
    (d.logro.desc ? '<span class="sbp-logro-d">' + d.logro.desc + '</span>' : '') +
    '<span class="sbp-enlace">Ver la colección</span></span></button>';
}

function pieQuieto(d) {
  return '<div class="sbp-pie" data-sb-pieza="pie">' +
    '<button class="sbp-pie-fila"><span>Mis rutinas</span><span class="sbp-sello-premium">Premium</span><span class="sbp-flecha">›</span></button>' +
    (d.apoyo ? '<button class="sbp-pie-fila apoyo"><span>Da de pastar a la vaca</span><span class="sbp-flecha">›</span></button>' : '') +
    '<div class="sbp-pie-ver"><span>Pace ' + d.version + '</span><span class="sbp-firma">by @ezradesign</span></div></div>';
}

const REGLA = '<div class="sbp-regla"></div>';
const HUECO = '<div data-pace-sidebar-spacer data-sb-hueco style="flex:1;min-height:0"></div>';

const CSS_BASE = `
  [data-sb-oculto] { display: none !important; margin: 0 !important; }
  .sbp-regla { height: 1px; background: var(--line); margin: 14px 0; flex: none; }
  .sbp-meta { font-size: var(--size-meta); letter-spacing: var(--track-meta); text-transform: uppercase; color: var(--ink-3); }
  .sbp-cab { display: flex; justify-content: center; align-items: baseline; gap: 7px; margin-bottom: 11px; }
  .sbp-cab .sbp-fecha { opacity: .75; }
  [data-sb-pieza] button, button[data-sb-pieza], .sbp-puerta, .sbp-mas, .sbp-pie-fila {
    background: none; border: 0; padding: 0; font: inherit; color: inherit; cursor: pointer; text-align: inherit; }
  .sbp-ic { display: inline-grid; place-items: center; flex: none; }
  .sbp-ic svg { width: 100%; height: 100%; display: block; }
  .sbp-sem { display: block; width: 100%; padding: 2px 0; }
  .sbp-sem-dias { display: flex; gap: 6px; }
  .sbp-sem-dia { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .sbp-sem-l { font-size: 10px; letter-spacing: .08em; color: var(--ink-3); }
  .sbp-sem-p { width: 7px; height: 7px; border-radius: 50%; background: var(--line); }
  .sbp-sem-p.on { background: var(--focus); }
  .sbp-sem-dia.hoy .sbp-sem-l { color: var(--ink); font-weight: 600; }
  .sbp-sem-dia.hoy .sbp-sem-p { outline: 1.5px solid var(--ink-2); outline-offset: 2px; }
  .sbp-sem-pie { display: block; text-align: center; margin-top: 10px; font-family: var(--font-display); font-style: italic;
    font-size: 14px; color: var(--ink-2); }
  /* El sello del logro: el trazo de los dibujos finos (0,6 de 44) se pinta a 1,2 px
     reales; a este tamaño, con el trazo escalado, «Ciclo completo» era un círculo vacío. */
  .sbp-sello { width: 46px; height: 46px; flex: none; border: 1px solid var(--line); border-radius: 50%;
    display: grid; place-items: center; color: var(--ink-2); background: var(--paper); font-size: 16px; }
  .sbp-sello svg * { vector-effect: non-scaling-stroke; stroke-width: 1.2px; }
  .sbp-sello > span { width: 84% !important; height: 84% !important; }
  .sbp-logro-d { font-size: 11.5px; line-height: 1.35; color: var(--ink-3); }
  .sbp-logro .sbp-enlace { margin-top: 2px; }
  .sbp-sem.barras .sbp-sem-dia { gap: 5px; }
  .sbp-bar-col { height: 32px; width: 7px; display: flex; flex-direction: column-reverse; border-radius: 3.5px 3.5px 1px 1px; overflow: hidden; }
  .sbp-bar-col i { display: block; width: 100%; flex: none; }
  .sbp-bar-col i.vacia { height: 2px; background: var(--line-2); border-radius: 1px; }
  .sbp-bar-col i.vacia.futura { background: var(--line); }
  .sbp-sem.barras .sbp-sem-dia.hoy .sbp-sem-l { border-bottom: 1.5px solid var(--ink-2); padding-bottom: 1px; }
  .sbp-logro { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; }
  .sbp-logro.caja { border: 1px solid var(--line); border-radius: var(--r-md); padding: 10px 12px; background: var(--paper); }
  .sbp-logro.vacio .sbp-sello { color: var(--ink-3); opacity: .6; }
  .sbp-logro-t { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .sbp-logro-n { font-family: var(--font-display); font-style: italic; font-size: 16px; line-height: 1.2; color: var(--ink); }
  .sbp-logro.vacio .sbp-logro-n { color: var(--ink-3); }
  .sbp-enlace { font-size: 11px; color: var(--ink-3); text-decoration: underline; text-underline-offset: 3px; }
  .sbp-pie { display: flex; flex-direction: column; gap: 2px; border-top: 1px solid var(--line); padding-top: 8px; margin-top: 12px; }
  .sbp-pie-fila { display: flex; align-items: center; gap: 8px; width: 100%; padding: 7px 2px !important; font-size: 12px !important;
    color: var(--ink-2) !important; }
  .sbp-pie-fila.apoyo { font-family: var(--font-display) !important; font-style: italic; font-size: 14px !important; }
  .sbp-pie-fila .sbp-flecha { margin-left: auto; color: var(--ink-3); }
  .sbp-sello-premium { font-size: 9px; letter-spacing: .12em; text-transform: uppercase; font-weight: 600; color: var(--premium);
    border: 1px solid var(--premium); border-radius: var(--r-pill); padding: 2px 7px; background: var(--premium-soft); }
  .sbp-pie-ver { display: flex; justify-content: space-between; align-items: baseline; margin-top: 6px; font-size: 9px;
    letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); }
  .sbp-firma { font-family: var(--font-display); font-style: italic; letter-spacing: 0; text-transform: none; }
`;

/* ======================================================================
   A · AFINADA — las mismas piezas, en el mismo orden y con las mismas funciones.
   Cambia la forma: Hoy en una fila de cuatro columnas sin cajas, la tarjeta sin
   «Llevas…» (lo dice el aro), el logro con su sello legible. El pie, tal cual.
   ====================================================================== */
function pintarA(d) {
  const h = d.hoy, c = d.cuentas || {};
  const puntos = (n, color) => {
    let p = '';
    for (let i = 0; i < Math.min(n || 0, 8); i++) p += '<i style="background:' + color + '"></i>';
    return '<span class="sba-puntos">' + p + '</span>';
  };
  let gotas = '';
  for (let i = 0; i < h.waterGoal; i++) gotas += '<i class="' + (i < h.waterGlasses ? 'on' : '') + '"></i>';
  const col = (glifo, color, valor, unidad, nombre, extra, cero, tag) =>
    '<' + tag + ' class="sba-col' + (cero ? ' cero' : '') + '">' + ic(glifo, cero ? 'var(--ink-3)' : color, 22) +
    '<span class="sba-valor">' + valor + (unidad ? '<small>' + unidad + '</small>' : '') + '</span>' +
    '<span class="sba-nombre">' + nombre + '</span>' + extra + '</' + tag + '>';
  const foco = h.focusMinutes >= 60 ? horas(h.focusMinutes) : h.focusMinutes;
  const hoy = '<div data-sb-pieza="hoy"><div class="sbp-cab"><span class="sbp-meta" style="color:var(--ink-2)">Hoy</span><span class="sbp-meta sbp-fecha">' + d.fecha + '</span></div>' +
    '<div class="sba-fila">' +
    col(d.g.foco, 'var(--focus)', foco, h.focusMinutes >= 60 ? '' : 'min', 'Foco', puntos(c.focus, 'var(--focus)'), !h.focusMinutes, 'div') +
    col(d.g.respira, 'var(--breathe)', h.breatheMinutes, 'min', 'Respira', puntos(c.breathe, 'var(--breathe)'), !h.breatheMinutes, 'button') +
    col(d.g.mueve, 'var(--move)', h.bodyMinutes, 'min', 'Cuerpo', puntos(c.body, 'var(--move)'), !h.bodyMinutes, 'button') +
    col(d.g.agua, 'var(--hydrate)', h.waterGlasses, 'de ' + h.waterGoal, 'Agua', '<span class="sba-gotas">' + gotas + '</span>', !h.waterGlasses, 'button') +
    '</div></div>';
  const t = d.tarjeta;
  const tarjeta = t ? '<div class="sba-tarjeta" data-sb-pieza="tarjeta"><span class="sba-eyebrow' + (t.kind === 'suggest' ? '' : ' color') + '">' + t.eyebrow + '</span>' +
    '<span class="sba-titulo"><button>' + t.titulo + '</button><span class="sba-flecha">→</span></span>' +
    (t.meta ? '<span class="sba-tmeta">' + t.meta + '</span>' : '') + '</div>' : '';
  const logro = '<div data-sb-pieza="logro-sec"><div class="sbp-cab"><span class="sbp-meta">Último logro</span></div>' + logroFila(d, false) + '</div>';
  const html = REGLA + semana(d, false, false) + REGLA + hoy + (tarjeta ? REGLA + tarjeta : '') + REGLA + logro + HUECO +
    d.pieHoy.replace('<div ', '<div data-sb-pieza="pie" ');
  const css = CSS_BASE + `
    .sba-fila { display: grid; grid-template-columns: repeat(4, 1fr); }
    .sba-col { display: flex !important; flex-direction: column; align-items: center; gap: 5px; padding: 4px 0 2px !important;
      border-left: 1px solid var(--line) !important; text-align: center; }
    .sba-col:first-child { border-left: 0 !important; }
    .sba-valor { font-family: var(--font-display); font-size: 22px; line-height: 1; color: var(--ink); font-variant-numeric: tabular-nums; margin-top: 2px; }
    .sba-valor small { font-family: var(--font-ui); font-size: 9.5px; color: var(--ink-3); margin-left: 2px; }
    .sba-col.cero .sba-valor { color: var(--ink-3); opacity: .6; }
    .sba-nombre { font-size: 9px; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3); font-weight: 500; }
    .sba-puntos, .sba-gotas { display: flex; gap: 2px; justify-content: center; align-items: center; min-height: 6px; }
    .sba-puntos i { width: 4px; height: 4px; border-radius: 50%; }
    .sba-gotas i { width: 4px; height: 6px; border-radius: 0 0 50% 50% / 0 0 40% 40%; border: 1px solid var(--hydrate); opacity: .35; }
    .sba-gotas i.on { background: var(--hydrate); opacity: 1; }
    .sba-tarjeta { border: 1px solid var(--line); border-radius: var(--r-md); padding: 13px 14px 14px; background: var(--paper);
      display: flex; flex-direction: column; gap: 6px; }
    .sba-eyebrow { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; font-weight: 500; color: var(--ink-3); }
    .sba-titulo { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; font-family: var(--font-display);
      font-style: italic; font-weight: 500; font-size: 19px; line-height: 1.3; color: var(--ink); }
    .sba-flecha { color: var(--ink-3); font-size: 15px; font-style: normal; }
    .sba-tmeta { font-size: 11px; color: var(--ink-3); }
  `;
  return { html, css };
}

/* ======================================================================
   B · PUERTAS — la barra hace lo que la home no hace: abre las bibliotecas (en un
   día servido la home no trae chips de actividades) y apunta el agua con un botón
   que se ve. Cada fila de Hoy es una puerta. La siguiente pausa queda en UNA línea.
   ====================================================================== */
function pintarB(d) {
  const h = d.hoy, c = d.cuentas || {};
  const puntos = (n, color) => {
    let p = '';
    for (let i = 0; i < Math.min(n || 0, 8); i++) p += '<i style="background:' + color + '"></i>';
    return p ? '<span class="sbb-puntos">' + p + '</span>' : '';
  };
  const val = (min) => min ? horas(min) : '—';
  const fila = (glifo, color, nombre, valor, cero, extra) =>
    '<div class="sbb-fila' + (cero ? ' cero' : '') + '">' + ic(glifo, color, 20) + nombre + extra +
    '<span class="sbb-valor">' + valor + '</span></div>';
  const puerta = (t) => '<button class="sbp-puerta sbb-puerta">' + t + '<span class="sbb-chev">›</span></button>';
  let gotas = '';
  for (let i = 0; i < h.waterGoal; i++) gotas += '<i class="' + (i < h.waterGlasses ? 'on' : '') + '"></i>';
  const hoy = '<div data-sb-pieza="hoy"><div class="sbp-cab"><span class="sbp-meta" style="color:var(--ink-2)">Hoy</span><span class="sbp-meta sbp-fecha">' + d.fecha + '</span></div>' +
    '<div class="sbb-lista">' +
    fila(d.g.foco, 'var(--focus)', '<span class="sbb-nombre">Foco</span>', val(h.focusMinutes), !h.focusMinutes, puntos(c.focus, 'var(--focus)')) +
    fila(d.g.respira, 'var(--breathe)', puerta('Respira'), val(h.breatheMinutes), !h.breatheMinutes, '') +
    fila(d.g.mueve, 'var(--move)', '<span class="sbb-dos">' + puerta('Mueve') + '<span class="sbb-punto">·</span>' + puerta('Estira') + '</span>', val(h.bodyMinutes), !h.bodyMinutes, '') +
    '<div class="sbb-fila agua' + (h.waterGlasses ? '' : ' cero') + '">' + ic(d.g.agua, 'var(--hydrate)', 20) +
    '<span class="sbb-nombre">Agua</span><span class="sbb-gotas">' + gotas + '</span>' +
    '<span class="sbb-valor">' + h.waterGlasses + '<small> de ' + h.waterGoal + '</small></span>' +
    '<button class="sbp-mas sbb-mas" title="Apuntar un vaso">+ vaso</button></div>' +
    '</div></div>';
  /* La línea de la acción: con el día servido es la siguiente pausa en una línea; con la
     home preguntando por el día, ninguna (no se propone otra cosa al lado de «Comienza»);
     por libre, lo de siempre (Continúa, Repetir, Para ahora). */
  let accion = '';
  const t = d.tarjeta;
  if (t && !(d.homeConRitmo && !d.siguiente && t.kind === 'suggest')) {
    const rotulo = t.eyebrow;
    accion = '<button class="sbb-accion" data-sb-pieza="tarjeta"><span class="sbb-acc-rot">' + rotulo + '</span>' +
      '<span class="sbb-acc-tit">' + t.titulo + '</span><span class="sbb-acc-flecha">→</span></button>';
  }
  const logro = '<div data-sb-pieza="logro-sec"><div class="sbp-cab"><span class="sbp-meta">Último logro</span></div>' + logroFila(d, false) + '</div>';
  /* Sin acción y con el día en blanco, la frase de hoy (`sidebar.empty`), como ahora. */
  const blanco = (!accion && !h.focusMinutes && !h.breatheMinutes && !h.bodyMinutes && !h.waterGlasses)
    ? '<p class="sbb-blanco">Tu día empieza en blanco. Lo que hagas se queda aquí.</p>' : '';
  const html = REGLA + semana(d, true, true) + REGLA + hoy + blanco + (accion ? REGLA + accion : '') + REGLA + logro + HUECO + pieQuieto(d);
  const css = CSS_BASE + `
    .sbb-lista { display: flex; flex-direction: column; }
    .sbb-fila { display: flex; align-items: center; gap: 10px; min-height: 38px; border-top: 1px solid var(--line); padding: 0 2px; }
    .sbb-fila:first-child { border-top: 0; }
    .sbb-nombre, .sbb-puerta { font-size: 13px; color: var(--ink); }
    .sbb-puerta { display: inline-flex; align-items: baseline; gap: 4px; }
    .sbb-puerta:hover { text-decoration: underline; text-underline-offset: 3px; }
    .sbb-chev { color: var(--ink-3); font-size: 13px; }
    .sbb-dos { display: inline-flex; align-items: baseline; gap: 7px; }
    .sbb-punto { color: var(--ink-3); }
    .sbb-valor { margin-left: auto; font-family: var(--font-display); font-size: 19px; color: var(--ink); font-variant-numeric: tabular-nums; white-space: nowrap; }
    .sbb-valor small { font-family: var(--font-ui); font-size: 10px; color: var(--ink-3); }
    .sbb-fila.cero .sbb-valor { color: var(--ink-3); opacity: .6; }
    .sbb-puntos { display: inline-flex; gap: 3px; }
    .sbb-puntos i { width: 4px; height: 4px; border-radius: 50%; }
    .sbb-gotas { display: inline-flex; gap: 2px; }
    .sbb-gotas i { width: 4px; height: 6px; border-radius: 0 0 50% 50% / 0 0 40% 40%; border: 1px solid var(--hydrate); opacity: .35; }
    .sbb-gotas i.on { background: var(--hydrate); opacity: 1; }
    .sbb-fila.agua .sbb-valor { margin-left: auto; }
    .sbb-mas { font-size: 11px !important; color: var(--hydrate) !important; border: 1px solid var(--hydrate) !important;
      border-radius: var(--r-pill); padding: 3px 9px !important; white-space: nowrap; background: var(--hydrate-soft) !important; }
    .sbb-accion { display: grid !important; grid-template-columns: 1fr auto; align-items: baseline; row-gap: 3px; width: 100%;
      padding: 2px 2px !important; text-align: left; }
    .sbb-acc-rot { grid-column: 1 / 3; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); font-weight: 500; }
    .sbb-acc-tit { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 18px; color: var(--ink); line-height: 1.25; }
    .sbb-acc-flecha { color: var(--ink-3); font-size: 15px; }
    .sbb-blanco { margin: 10px 0 0; font-family: var(--font-display); font-style: italic; font-size: 14px; line-height: 1.4;
      color: var(--ink-3); text-align: center; text-wrap: balance; }
  `;
  return { html, css };
}

/* ======================================================================
   C · CUADERNO — la barra mira hacia atrás y lo cuenta con palabras. La home dice lo
   que toca; aquí se apunta lo que llevas. Sin cajas ni ceros: un día en blanco se
   dice con una frase. Con el día servido no repite la siguiente pausa.
   ====================================================================== */
/* `o` (opcional), para las variantes de `semanas.js`: `o.pausa` añade la siguiente pausa
   en una frase, `o.semana(d)` cambia el dibujo de la semana ({ html, css }) y
   `o.compacta` pone las puertas en una fila con el glifo al lado del nombre. */
function pintarC(d, o) {
  o = o || {};
  const h = d.hoy;
  const linea = (glifo, color, texto) => '<p class="sbc-linea">' + ic(glifo, color, 16) + '<span>' + texto + '</span></p>';
  const lineas = [];
  if (h.focusMinutes) lineas.push(linea(d.g.foco, 'var(--focus)', '<b>' + mayus(enPalabras(h.focusMinutes)) + '</b> de foco'));
  if (h.breatheMinutes) lineas.push(linea(d.g.respira, 'var(--breathe)', '<b>' + mayus(enPalabras(h.breatheMinutes)) + '</b> respirando'));
  if (h.bodyMinutes) lineas.push(linea(d.g.mueve, 'var(--move)', '<b>' + mayus(enPalabras(h.bodyMinutes)) + '</b> moviéndote'));
  const vasos = h.waterGlasses ? '<b>' + mayus(h.waterGlasses === 1 ? 'un vaso' : (NUM[h.waterGlasses] || h.waterGlasses) + ' vasos') + '</b> de ' + (NUM[h.waterGoal] || h.waterGoal)
    : 'Aún ningún vaso';
  const agua = '<p class="sbc-linea">' + ic(d.g.agua, 'var(--hydrate)', 16) + '<span>' + vasos + '</span>' +
    '<button class="sbp-mas sbc-mas" title="Apuntar un vaso">+ un vaso</button></p>';
  const cuerpo = lineas.length
    ? lineas.join('') + agua
    : '<p class="sbc-blanco">Tu día empieza en blanco. Lo que hagas se queda aquí.</p>' + agua;
  const hoy = '<div data-sb-pieza="hoy"><div class="sbp-cab"><span class="sbp-meta" style="color:var(--ink-2)">Hoy</span><span class="sbp-meta sbp-fecha">' + d.fecha + '</span></div>' +
    '<div class="sbc-cuaderno">' + cuerpo + '</div></div>';
  const puerta = (glifo, color, nombre) => '<button class="sbp-puerta sbc-puerta">' + ic(glifo, color, o.compacta ? 18 : 22) + '<span>' + nombre + '</span></button>';
  const puertas = '<div data-sb-pieza="puertas"><div class="sbp-cab"><span class="sbp-meta">Bibliotecas</span></div><div class="sbc-puertas' + (o.compacta ? ' compactas' : '') + '">' +
    puerta(d.g.respira, 'var(--breathe)', 'Respira') + puerta(d.g.estira, 'var(--extra)', 'Estira') + puerta(d.g.mueve, 'var(--move)', 'Mueve') + '</div></div>';
  /* Con la home enseñando «A tu ritmo», la tarjeta calla: la siguiente pausa ya está en
     la línea. Vuelve para lo que la home no dice: reanudar, repetir, para ahora (por libre). */
  const t = d.tarjeta;
  const tarjeta = (t && !d.homeConRitmo) ? '<div class="sba-tarjeta" data-sb-pieza="tarjeta"><span class="sba-eyebrow">' + t.eyebrow + '</span>' +
    '<span class="sba-titulo"><button>' + t.titulo + '</button><span class="sba-flecha">→</span></span></div>' : '';
  const logro = '<div data-sb-pieza="logro-sec"><div class="sbp-cab"><span class="sbp-meta">Último logro</span></div>' + logroFila(d, false) + '</div>';
  const sem = o.semana ? o.semana(d) : { html: semana(d, true, true), css: '' };
  const pausa = o.pausa ? pausaCuaderno(d) : '';
  const html = REGLA + sem.html + REGLA + hoy + (pausa ? REGLA + pausa : (tarjeta ? REGLA + tarjeta : '')) + REGLA + puertas + REGLA + logro + HUECO + pieQuieto(d);
  const css = CSS_BASE + sem.css + `
    .sbc-puertas.compactas .sbc-puerta { flex-direction: row; justify-content: center; gap: 7px; padding: 7px 0 !important; }
    .sbc-pausa { display: grid !important; grid-template-columns: 16px minmax(0, 1fr) auto; gap: 10px; align-items: start; width: 100%;
      padding: 0 2px !important; text-align: left; }
    .sbc-pausa .sbp-ic { margin-top: 3px; }
    .sbc-pausa-t { display: flex; flex-direction: column; gap: 2px; }
    .sbc-pausa-f { font-family: var(--font-display); font-style: italic; font-size: 17px; line-height: 1.25; color: var(--ink-2); }
    .sbc-pausa-f b { font-weight: 500; color: var(--ink); }
    .sbc-pausa-m { font-size: 11.5px; color: var(--ink-3); }
    .sbc-pausa-fl { color: var(--ink-3); font-size: 15px; align-self: center; }
    .sbc-cuaderno { display: flex; flex-direction: column; gap: 7px; padding: 0 2px; }
    .sbc-linea { display: flex; align-items: center; gap: 10px; margin: 0; font-family: var(--font-display); font-style: italic;
      font-size: 17px; line-height: 1.25; color: var(--ink-2); }
    .sbc-linea b { font-weight: 500; color: var(--ink); }
    .sbc-blanco { margin: 0 0 4px; font-family: var(--font-display); font-style: italic; font-size: 16px; line-height: 1.4;
      color: var(--ink-3); text-align: center; padding: 0 6px; }
    .sbc-mas { margin-left: auto; font-family: var(--font-ui) !important; font-style: normal !important; font-size: 11px !important;
      color: var(--hydrate) !important; border: 1px solid var(--hydrate) !important; border-radius: var(--r-pill);
      padding: 3px 9px !important; white-space: nowrap; background: var(--hydrate-soft) !important; }
    .sbc-puertas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .sbc-puerta { display: flex !important; flex-direction: column; align-items: center; gap: 6px; padding: 8px 0 7px !important;
      border-radius: var(--r-md); font-family: var(--font-display) !important; font-style: italic; font-size: 15px !important;
      color: var(--ink) !important; }
    .sbc-puerta:hover { background: var(--paper-3) !important; }
    .sba-tarjeta { border: 1px solid var(--line); border-radius: var(--r-md); padding: 12px 14px; background: var(--paper);
      display: flex; flex-direction: column; gap: 6px; }
    .sba-eyebrow { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; font-weight: 500; color: var(--ink-3); }
    .sba-titulo { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; font-family: var(--font-display);
      font-style: italic; font-weight: 500; font-size: 19px; line-height: 1.3; color: var(--ink); }
    .sba-flecha { color: var(--ink-3); font-size: 15px; font-style: normal; }
  `;
  return { html, css };
}

/* LA SIGUIENTE PAUSA DICHA COMO EL CUADERNO: una frase con la hora y la rutina, y debajo
   cuánto dura y de qué módulo. Sale de `ritmoSiguiente`, igual que la tarjeta de hoy; sin
   día servido no hay frase (en el día vacío la home está preguntando por el día). */
function pausaCuaderno(d) {
  const t = d.tarjeta, s = d.siguiente;
  if (!t || !s) return '';
  const MOD = { estira: ['estira', 'var(--extra)', 'Estira'], mueve: ['mueve', 'var(--move)', 'Mueve'],
                respira: ['respira', 'var(--breathe)', 'Respira'], cierre: ['respira', 'var(--breathe)', 'Respira'] };
  const m = MOD[s.modulo] || MOD.respira;
  const hora = Math.floor(s.hora / 60) + ':' + String(s.hora % 60).padStart(2, '0');
  const frase = (s.ahora ? 'Ahora, ' : 'A las ' + hora + ', ') + '<b>' + t.titulo + '</b>';
  const meta = s.larga ? 'Pausa larga de ' + enPalabras(s.dur) : mayus(enPalabras(s.min)) + ' de ' + m[2];
  return '<div data-sb-pieza="tarjeta"><div class="sbp-cab"><span class="sbp-meta">' + (s.ahora ? 'Tu pausa' : 'Siguiente pausa') + '</span></div>' +
    '<button class="sbc-pausa">' + ic(d.g[m[0]], m[1], 16) + '<span class="sbc-pausa-t"><span class="sbc-pausa-f">' + frase + '</span>' +
    '<span class="sbc-pausa-m">' + meta + '</span></span><span class="sbc-pausa-fl">→</span></button></div>';
}

module.exports = {
  util: { pintarC, ic, enPalabras, mayus },
  datos,
  lista: [
    { id: 'A', nombre: 'Afinada', pintar: pintarA },
    { id: 'B', nombre: 'Puertas', pintar: pintarB },
    { id: 'C', nombre: 'Cuaderno', pintar: pintarC },
  ],
};
