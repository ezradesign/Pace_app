/* PACE · el Cuaderno con la siguiente pausa y cuatro dibujos para la semana (8 oct. 2026)
   ====================================================================================
   Ez, después de ver la primera página: «¿y cuaderno con siguiente pausa también? ¿y unas
   barras de días de ritmo más bonitas?». Aquí van las dos cosas juntas: la opción C con la
   siguiente pausa dicha en una frase (`pausaCuaderno`, en opciones.js) y cuatro maneras de
   dibujar la semana, cada una sobre la misma C.

   Las cuatro leen lo mismo que la barra de hoy: los minutos de `weeklyStats` (foco, respira y
   cuerpo; el agua no enciende el día, criterio de s69) con el índice lunes-primero, y la
   racha de `selectSidebarWeek`. La racha se dibuja además como un hilo oliva bajo los días
   que la forman: es lo que dice la frase «4 días en ritmo», puesto en el dibujo.

     · Cápsulas: el hueco de cada día a la vista y el relleno oliva con lo que hiciste.
     · Tinta:    una barra oliva por día sobre una línea de suelo; hoy, con sus minutos.
     · Brotes:   la barra de Tinta con un punto de color encima por cada módulo más.
     · Hierba:   una mata por día, con una brizna por bloque de foco y otra por módulo. Es
                 la vaca que pace del logo («Touch grass»).

   Ez contestó después que la semana va con barras de minutos «pero mucho más elegantes y
   bonitas»: Cápsulas, Tinta y Brotes son barras; Hierba no lo es, y va aparte. */
'use strict';

const { util } = require('./opciones.js');

const L = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MODS = [['focusMinutes', 'var(--focus)'], ['breathMinutes', 'var(--breathe)'], ['moveMinutes', 'var(--move)']];

function base(d) {
  const at = (k, i) => ((d.ws[k] || [])[i]) || 0;
  const tot = (i) => MODS.reduce((n, [k]) => n + at(k, i), 0);
  let max = 60;
  for (let i = 0; i < 7; i++) max = Math.max(max, tot(i));
  return { at, tot, max, hoy: d.semana.todayIndex, dias: d.semana.days };
}

/* La racha bajo los días: termina hoy si hoy ya cuenta y, si no, ayer. Desde dos días. */
function hiloRacha(d) {
  const s = d.semana;
  if (!(s.currentStreak >= 2)) return '';
  const fin = s.days[s.todayIndex].active ? s.todayIndex : s.todayIndex - 1;
  const ini = Math.max(0, fin - s.currentStreak + 1);
  if (fin < ini || fin < 0) return '';
  return '<i class="sbw-racha" style="grid-column:' + (ini + 1) + ' / ' + (fin + 2) + '"></i>';
}

function frase(d) {
  const s = d.semana;
  if (!(s.currentStreak > 0)) return '';
  return '<span class="sbp-sem-pie">' + (s.currentStreak === 1 ? '1 día en ritmo' : s.currentStreak + ' días en ritmo') +
    (s.longestStreak > s.currentStreak ? ' · mejor ' + s.longestStreak : '') + '</span>';
}

function envolver(d, clase, columnas, css, sinHilo) {
  const dias = columnas.map((fig, i) => {
    const x = d.semana.days[i];
    return '<span class="sbw-dia' + (x.isToday ? ' hoy' : '') + (i > d.semana.todayIndex ? ' futuro' : '') + '">' +
      '<span class="sbw-fig">' + fig + '</span><span class="sbw-l">' + L[i] + '</span></span>';
  }).join('');
  const html = '<button class="sbp-sem sbw ' + clase + '" data-sb-pieza="semana" title="Ver la semana en Estadísticas">' +
    '<span class="sbw-dias">' + dias + (sinHilo ? '' : hiloRacha(d)) + '</span>' + frase(d) + '</button>';
  return { html, css: CSS_SEMANA + css };
}

const CSS_SEMANA = `
  .sbw-dias { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); row-gap: 5px; }
  .sbw-dia { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .sbw-fig { display: flex; align-items: flex-end; justify-content: center; width: 100%; }
  .sbw-l { font-size: 10px; letter-spacing: .08em; color: var(--ink-3); line-height: 1; }
  .sbw-dia.hoy .sbw-l { color: var(--ink); font-weight: 600; }
  .sbw-racha { display: block; height: 2px; border-radius: 1px; background: var(--focus); opacity: .55; margin: 0 13px; }
  .sbw .sbp-sem-pie { margin-top: 8px; }
`;

/* ---------- Cápsulas ---------- */
/* Cada día una cápsula con su hueco a la vista: el hueco entero es el mejor día de la
   semana y el relleno oliva, lo de ese día. Hoy, a tinta entera; los demás, a media. */
function capsulas(d, sinHilo) {
  const b = base(d);
  const cols = b.dias.map((x, i) => {
    const relleno = x.active ? '<span class="sbw-relleno" style="height:' + Math.max(10, Math.round(b.tot(i) / b.max * 40)) + 'px"></span>' : '';
    return '<span class="sbw-pista">' + relleno + '</span>';
  });
  return envolver(d, 'capsulas', cols, `
    .capsulas .sbw-fig { height: 40px; }
    .sbw-pista { width: 10px; height: 40px; border-radius: 5px; background: var(--paper-3); display: flex; flex-direction: column-reverse; overflow: hidden; }
    .sbw-dia.futuro .sbw-pista { opacity: .5; }
    .sbw-relleno { display: block; border-radius: 5px; background: var(--focus); opacity: .5; }
    .capsulas .sbw-dia.hoy .sbw-relleno { opacity: 1; }
  `, sinHilo);
}

/* ---------- Hierba ---------- */
/* Una mata por día. El foco pone de una a cuatro briznas (una por cada 50 minutos, que es
   un bloque), y Respira y Cuerpo una cada uno, en su color. La altura sale de los minutos
   del día; cada brizna se tuerce un poco distinto para que la mata no parezca un peine. */
function hierba(d) {
  const b = base(d);
  const FORMA = [[15, 0.0, 1.0], [11, -4.5, 0.82], [19, 4.5, 0.88], [8, -6, 0.66], [22, 6.5, 0.72], [13, -2, 0.58]];
  const cols = b.dias.map((x, i) => {
    let trazos = '';
    if (x.active) {
      const briznas = [];
      const foco = b.at('focusMinutes', i);
      for (let n = 0; n < Math.min(4, Math.ceil(foco / 50)); n++) briznas.push('var(--focus)');
      if (b.at('breathMinutes', i)) briznas.push('var(--breathe)');
      if (b.at('moveMinutes', i)) briznas.push('var(--move)');
      const alto = 14 + Math.round(b.tot(i) / b.max * 26);
      trazos = briznas.map((c, j) => {
        const [px, inc, f] = FORMA[j % FORMA.length];
        const h = Math.max(8, Math.round(alto * f));
        return '<path d="M' + px + ' 42 Q' + (px + inc * 0.1) + ' ' + (42 - h * 0.6) + ' ' + (px + inc) + ' ' + (42 - h) +
          '" style="stroke:' + c + '" />';
      }).reverse().join('');
    } else if (i <= b.hoy) {
      trazos = '<path class="seca" d="M13.5 42 Q13.5 39 12 37" /><path class="seca" d="M16.5 42 Q16.5 38.5 18 36.5" />';
    }
    return '<svg viewBox="0 0 30 42" width="30" height="42" aria-hidden="true">' + trazos + '</svg>';
  });
  return envolver(d, 'hierba', cols, `
    .hierba .sbw-fig { height: 42px; border-bottom: 1px solid var(--line); }
    .hierba .sbw-dia { gap: 7px; }
    .hierba svg { overflow: visible; display: block; }
    .hierba path { fill: none; stroke-width: 2.4; stroke-linecap: round; }
    .hierba path.seca { stroke: var(--line-2); stroke-width: 1.5; }
  `);
}

/* ---------- Tinta y Brotes ---------- */
/* Una sola barra por día, en el oliva del foco, apoyada en una línea de suelo y con la
   punta redonda. Los días pasados van a media tinta y hoy a tinta entera, con sus minutos
   encima en la itálica de los títulos. La altura es la suma de foco, respira y cuerpo.
   «Brotes» es la misma barra con un punto encima por cada módulo más que hiciste ese día
   (terracota si respiraste, tabaco si te moviste): el color sin partir la barra. */
function horasCortas(min) {
  if (min < 60) return min + ' min';
  const h = Math.floor(min / 60), r = min % 60;
  return h + ' h' + (r ? ' ' + String(r).padStart(2, '0') : '');
}
function tinta(d, brotes) {
  const b = base(d);
  const cols = b.dias.map((x, i) => {
    if (!x.active) return '';
    const alto = Math.max(4, Math.round(b.tot(i) / b.max * 30));
    const puntos = brotes ? MODS.slice(1).filter(([k]) => b.at(k, i)).map(([, c]) => '<i style="background:' + c + '"></i>').join('') : '';
    const cifra = x.isToday ? '<span class="sbw-cifra">' + horasCortas(b.tot(i)) + '</span>' : '';
    return '<span class="sbw-col">' + cifra + (puntos ? '<span class="sbw-brotes">' + puntos + '</span>' : '') +
      '<span class="sbw-tinta" style="height:' + alto + 'px"></span></span>';
  });
  return envolver(d, brotes ? 'tinta brotes' : 'tinta', cols, `
    .tinta .sbw-fig { height: ${brotes ? 56 : 46}px; border-bottom: 1px solid var(--line); }
    .tinta .sbw-dia { gap: 7px; }
    .sbw-col { display: flex; flex-direction: column; align-items: center; gap: 3px; }
    .sbw-tinta { display: block; width: 12px; border-radius: 6px 6px 0 0; background: var(--focus); opacity: .45; }
    .tinta .sbw-dia.hoy .sbw-tinta { opacity: 1; }
    .sbw-brotes { display: flex; flex-direction: column; align-items: center; gap: 2px; margin-bottom: 1px; }
    .sbw-brotes i { display: block; width: 5px; height: 5px; border-radius: 50%; }
    .sbw-cifra { white-space: nowrap; margin-bottom: 2px; font-family: var(--font-display); font-style: italic; font-size: 13px;
      line-height: 1; color: var(--ink-2); }
  `);
}

/* Con la pausa dentro, la C no cabía entera a 1280×800 (se veía al 97 %): aquí se aprietan
   un poco las separaciones, sin tocar la C de la primera página. */
const APRIETA = `
  .sbp-regla { margin: 11px 0; }
  .sbp-cab { margin-bottom: 9px; }
  .sbc-cuaderno { gap: 5px; }
  .sbw .sbp-sem-pie { margin-top: 6px; }
`;
const conPausa = (semana) => (d) => {
  const r = util.pintarC(d, { pausa: true, compacta: true, semana });
  return { html: r.html, css: r.css + APRIETA };
};

const tercera = (dentro) => (d) => {
  const r = util.pintarC(d, { pausa: !dentro, pausaEnHoy: dentro, compacta: true, aguaMeta: true,
    semana: (x) => capsulas(x, true) });
  return { html: r.html, css: r.css + APRIETA };
};

module.exports = {
  lista: [
    /* TERCERA VUELTA (Ez, 8 oct.): Cápsulas, sin el hilo de la racha («¿no es redundante?»:
       sí, la frase y las cápsulas llenas ya lo dicen), el agua con la meta de Ajustes y la
       siguiente pausa en dos sitios para elegir: con su rótulo o como última línea de Hoy. */
    { id: 'Cq-rotulo', nombre: 'Tercera vuelta · pausa con su rótulo', pintar: tercera(false) },
    { id: 'Cq-dentro', nombre: 'Tercera vuelta · pausa dentro de Hoy', pintar: tercera(true) },
    { id: 'Cp-capsulas', nombre: 'Cuaderno con pausa · Cápsulas', pintar: conPausa(capsulas) },
    { id: 'Cp-tinta', nombre: 'Cuaderno con pausa · Tinta', pintar: conPausa((d) => tinta(d, false)) },
    { id: 'Cp-brotes', nombre: 'Cuaderno con pausa · Brotes', pintar: conPausa((d) => tinta(d, true)) },
    { id: 'Cp-hierba', nombre: 'Cuaderno con pausa · Hierba', pintar: conPausa(hierba) },
  ],
};
