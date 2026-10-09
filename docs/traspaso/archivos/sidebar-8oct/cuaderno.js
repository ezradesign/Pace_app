/* PACE · el Cuaderno elegido, en los dos idiomas, para la cuarta vuelta (8 oct. 2026)
   ==================================================================================
   Lo que Ez ya eligió, junto: la semana en Cápsulas sin el hilo de la racha, la racha
   debajo, Hoy dicho con palabras, el agua con la meta de Ajustes, las tres puertas a las
   bibliotecas y el pie en dos filas de texto. La siguiente pausa va en las dos formas que
   quedan por elegir (`o.pausa`: 'dentro' o 'rotulo').

   Lo nuevo frente a `opciones.js` es lo que la tercera vuelta no midió:
     · el INGLÉS (`d.lang`), con las frases escritas para caber en una línea;
     · el día POR LIBRE: con la forma de dentro, lo que la tarjeta de hoy dice
       («Continúa», «Repetir», «Para ahora») pasa a ser la última línea de Hoy;
     · el CAJÓN del móvil, que es la misma columna dentro de otra caja.
   `o.capsula` cambia el dibujo de la semana para compararlo: 'actual' (la de la tercera
   vuelta) o 'tinta' (la propuesta de esta vuelta, ver `capsulas`). */
'use strict';

/* Corre DENTRO de la página: lo mismo que `opciones.js`, más el idioma, las cadenas
   que ya existen en i18n y el módulo de la rutina de la tarjeta (los ids de Mueve y
   Estira van cruzados: se pregunta al catálogo, nunca al prefijo). */
function datos() {
  const s = getState();
  const lang = s.lang === 'en' ? 'en' : 'es';
  const S = (window.PACE_STRINGS || {})[lang] || {};
  const glifo = (C) => {
    const d = document.createElement('div');
    const raiz = ReactDOM.createRoot(d);
    ReactDOM.flushSync(() => raiz.render(React.createElement(C)));
    const h = d.innerHTML;
    raiz.unmount();
    return h;
  };
  let eventos = null;
  try { const snap = window.paceEventsSnapshot && window.paceEventsSnapshot(); eventos = snap && snap.events; } catch (e) { eventos = null; }
  const tarjeta = document.querySelector('[data-pace-sidebar-accion]');
  const titulo = document.querySelector('[data-pace-sidebar-ultimo-titulo]');
  const fila = document.querySelector('[data-pace-sidebar-ultimo]');
  let modTarjeta = 'respira';
  if (tarjeta) {
    /* La sugerencia sale como en `Sidebar.jsx`: la regla de la biblioteca sobre Cuerpo. */
    const todas = [];
    [window.MOVE_ROUTINES, window.EXTRA_ROUTINES].forEach((cat) => Object.keys(cat || {}).forEach((g) =>
      ((cat[g] || {}).items || []).forEach((r) => todas.push(r))));
    const abiertas = todas.filter((r) => !r.safety && (!window.canAccessRoutine || window.canAccessRoutine(r.id)));
    const sug = (libraryParaAhora(abiertas, todayISO(), 1) || [])[0];
    const id = (selectSidebarPrimaryAction(s, { events: eventos, ritmo: ritmoSiguiente(s), sugerencia: sug && sug.id,
      reanudable: (window.leerRespiraGuardada && window.leerRespiraGuardada()) || null }) || {}).targetId;
    const b = id && window.resolveBodyRoutine && window.resolveBodyRoutine(id);
    if (b) modTarjeta = b.source === 'move' ? 'mueve' : 'estira';
  }
  const R = ritmoDe(s);
  return {
    lang,
    S: Object.fromEntries(['sidebar.today', 'sidebar.empty', 'sidebar.latest', 'sidebar.latest.none', 'sidebar.collection',
      'sidebar.mine', 'support.sidebar.label', 'sidebar.days', 'activity.breathe.label', 'activity.stretch.label',
      'activity.move.label'].map((k) => [k, S[k] || k])),
    fecha: fechaCortaSidebar(lang),
    hoy: selectSidebarToday(s),
    semana: selectSidebarWeek(s),
    homeConRitmo: !R.libre && !!(R.dia || R.propuesta),
    siguiente: ritmoSiguiente(s),
    tarjeta: tarjeta ? {
      kind: tarjeta.getAttribute('data-kind'),
      titulo: tarjeta.querySelector('h4 button').textContent,
      meta: (tarjeta.querySelector('p') || {}).textContent || '',
      modulo: tarjeta.getAttribute('data-kind') === 'resume' ? 'respira' : modTarjeta,
    } : null,
    logro: titulo ? (function () {
      const id = fila.getAttribute('data-pace-sidebar-ultimo');
      const a = (window.ACHIEVEMENT_CATALOG || []).find((x) => x.id === id) || {};
      const desc = lang === 'en' ? (window.PACE_STRINGS.en['ach.item.' + id + '.desc'] || a.desc || '') : (a.desc || '');
      return { titulo: titulo.textContent, sello: fila.querySelector('span').innerHTML, desc };
    })() : null,
    ws: s.weeklyStats || {},
    version: typeof PACE_VERSION === 'string' ? PACE_VERSION : '',
    apoyo: typeof paceApoyoVisible !== 'function' || paceApoyoVisible(),
    g: { foco: glifo(window.ABFocus), respira: glifo(window.ABBreathe), mueve: glifo(window.ABMove),
         estira: glifo(window.ABStretch), agua: glifo(window.ABDrop) },
  };
}

/* ---------- las palabras ---------- */

const NUM = {
  es: ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'],
  en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
};
const NUMF_ES = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'];
const n12 = (lang, k, fem) => (k <= 12 ? (fem && lang === 'es' ? NUMF_ES : NUM[lang])[k] : String(k));
const mayus = (t) => t.charAt(0).toUpperCase() + t.slice(1);

/* Los minutos con palabras: «dos horas y media», «una hora y 40 minutos». Hasta doce
   con letra, como `ritmo.numeros`; más allá, la cifra. */
function enPalabras(min, lang) {
  if (lang === 'en') {
    if (min < 60) return min === 1 ? 'one minute' : n12('en', min) + ' minutes';
    const h = Math.floor(min / 60), r = min % 60;
    const hs = h === 1 ? 'one hour' : n12('en', h) + ' hours';
    if (r === 30) return h === 1 ? 'an hour and a half' : n12('en', h) + ' and a half hours';
    if (r === 15) return h === 1 ? 'an hour and a quarter' : n12('en', h) + ' and a quarter hours';
    return r ? hs + ' and ' + (r === 1 ? 'one minute' : n12('en', r) + ' minutes') : hs;
  }
  if (min < 60) return min === 1 ? 'un minuto' : n12('es', min) + ' minutos';
  const h = Math.floor(min / 60), r = min % 60;
  let t = h === 1 ? 'una hora' : n12('es', h, true) + ' horas';
  if (r === 30) t += ' y media';
  else if (r === 15) t += ' y cuarto';
  else if (r) t += ' y ' + (r === 1 ? 'un minuto' : n12('es', r) + ' minutos');
  return t;
}

/* El agua con la meta de Ajustes (de 4 a 12), en una línea junto a «+ vaso». */
function fraseAgua(n, m, lang) {
  const meta = n12(lang, m);
  if (lang === 'en') {
    if (!n) return 'None of ' + meta + ' glasses';
    if (n === m) return '<b>All ' + meta + ' glasses</b> today';
    return '<b>' + mayus(n === 1 ? 'one glass' : n12('en', n) + ' glasses') + '</b> of ' + meta;
  }
  if (!n) return 'Ningún vaso de ' + meta;
  if (n === m) return '<b>Los ' + meta + ' vasos</b> del día';
  return '<b>' + mayus(n === 1 ? 'un vaso' : n12('es', n) + ' vasos') + '</b> de ' + meta;
}

const TX = {
  es: { foco: ' de foco', respira: ' respirando', cuerpo: ' moviéndote', vaso: '+ vaso', bibliotecas: 'Bibliotecas',
        luego: 'Luego, ', ahora: 'Ahora, ', aLas: 'A las ', siguiente: 'Siguiente pausa', tuPausa: 'Tu pausa',
        de: ' de ', larga: 'pausa larga de ', premium: 'Premium',
        resume: 'Continúa, ', path: 'Continúa, ', repeat: 'Otra vez, ', suggest: 'Para ahora, ',
        rotulos: { resume: 'Continúa', path: 'Continúa', repeat: 'Repetir', suggest: 'Para ahora' },
        racha: (n, m) => (n === 1 ? '1 día en ritmo' : n + ' días en ritmo') + (m > n ? ' · mejor ' + m : '') },
  en: { foco: ' of focus', respira: ' breathing', cuerpo: ' moving', vaso: '+ glass', bibliotecas: 'Libraries',
        luego: 'Next, ', ahora: 'Now, ', aLas: 'At ', siguiente: 'Next break', tuPausa: 'Your break',
        de: ' of ', larga: 'a long break of ', premium: 'Premium',
        resume: 'Continue, ', path: 'Continue, ', repeat: 'Again, ', suggest: 'Right now, ',
        rotulos: { resume: 'Continue', path: 'Continue', repeat: 'Repeat', suggest: 'Right now' },
        racha: (n, m) => (n === 1 ? '1 day in rhythm' : n + ' days in rhythm') + (m > n ? ' · best ' + m : '') },
};

/* ---------- las piezas ---------- */

function ic(svg, color, tam) {
  return '<span class="cq-ic" style="width:' + tam + 'px;height:' + tam + 'px;color:' + color + '">' + svg + '</span>';
}
const MOD = { estira: ['estira', 'var(--extra)', 'activity.stretch.label'], mueve: ['mueve', 'var(--move)', 'activity.move.label'],
              respira: ['respira', 'var(--breathe)', 'activity.breathe.label'], cierre: ['respira', 'var(--breathe)', 'activity.breathe.label'] };

/* LA SEMANA EN CÁPSULAS, sin el hilo. El hueco entero es el mejor día de la semana
   (o una hora, si ninguno llega) y el relleno, los minutos de foco, respira y cuerpo
   de ese día. 'actual' es la de la tercera vuelta; 'tinta' la afina: el tubo es un
   trazo y no una mancha, la cápsula es más fina y los días pasados van en un oliva
   claro y sólido en vez de transparente (sobre el beige se volvía gris). */
function capsulas(d, forma) {
  const at = (k, i) => ((d.ws[k] || [])[i]) || 0;
  const tot = (i) => at('focusMinutes', i) + at('breathMinutes', i) + at('moveMinutes', i);
  let max = 60;
  for (let i = 0; i < 7; i++) max = Math.max(max, tot(i));
  const L = d.S['sidebar.days'].split(',');
  const s = d.semana;
  const dias = s.days.map((x, i) => {
    const alto = x.active ? Math.max(forma === 'tinta' ? 8 : 10, Math.round(tot(i) / max * 40)) : 0;
    return '<span class="cq-dia' + (x.isToday ? ' hoy' : '') + (i > s.todayIndex ? ' futuro' : '') + '">' +
      '<span class="cq-pista">' + (alto ? '<span class="cq-relleno" style="height:' + alto + 'px"></span>' : '') + '</span>' +
      '<span class="cq-l">' + L[i] + '</span></span>';
  }).join('');
  const pie = s.currentStreak > 0 ? '<span class="cq-racha">' + TX[d.lang].racha(s.currentStreak, s.longestStreak) + '</span>' : '';
  return '<button class="cq-sem ' + forma + '" data-sb-pieza="semana"><span class="cq-dias">' + dias + '</span>' + pie + '</button>';
}

/* La siguiente pausa, o con el día por libre lo que diga la tarjeta de hoy.
   `dentro`: última línea de Hoy («Luego, Caderas de pie» · «A las 12:25 · cuatro
   minutos de Estira»). Si no, sección con su rótulo, como en la tercera vuelta. */
function pausa(d, dentro) {
  const X = TX[d.lang], t = d.tarjeta, s = d.siguiente;
  if (!t) return '';
  let frase, meta, rot, m;
  if (s) {
    m = MOD[s.modulo] || MOD.respira;
    const hora = Math.floor(s.hora / 60) + ':' + String(s.hora % 60).padStart(2, '0');
    const queEs = s.larga ? X.larga + enPalabras(s.dur, d.lang) : enPalabras(s.min, d.lang) + X.de + d.S[m[2]];
    rot = s.ahora ? X.tuPausa : X.siguiente;
    if (dentro) {
      frase = (s.ahora ? X.ahora : X.luego) + '<b>' + t.titulo + '</b>';
      meta = mayus((s.ahora ? '' : X.aLas + hora + ' · ') + queEs);
    } else {
      frase = (s.ahora ? X.ahora : X.aLas + hora + ', ') + '<b>' + t.titulo + '</b>';
      meta = mayus(queEs);
    }
  } else {
    /* Con la home preguntando cómo es el día no se propone nada al lado de «Comienza». */
    if (d.homeConRitmo) return '';
    m = MOD[t.modulo] || MOD.respira;
    frase = X[t.kind] + '<b>' + t.titulo + '</b>';
    meta = t.meta;
    rot = null;
  }
  const cuerpo = '<button class="cq-pausa' + (dentro ? ' dentro' : '') + '" data-sb-pausa>' + ic(d.g[m[0]], m[1], 16) +
    '<span class="cq-pausa-t"><span class="cq-pausa-f">' + frase + '</span><span class="cq-pausa-m">' + meta + '</span></span>' +
    '<span class="cq-flecha">→</span></button>';
  if (dentro) return cuerpo;
  /* Por libre y con rótulo, el rótulo es el de la tarjeta de hoy y la frase, solo el título. */
  const rotulo = rot || X.rotulos[t.kind];
  return '<div data-sb-pieza="tarjeta"><div class="cq-cab"><span class="cq-meta">' + rotulo + '</span></div>' +
    (rot ? cuerpo : cuerpo.replace(X[t.kind], '')) + '</div>';
}

function pintar(d, o) {
  o = o || {};
  const X = TX[d.lang], h = d.hoy;
  const linea = (glifo, color, texto) => '<p class="cq-linea">' + ic(glifo, color, 16) + '<span>' + texto + '</span></p>';
  const lineas = [];
  if (h.focusMinutes) lineas.push(linea(d.g.foco, 'var(--focus)', '<b>' + mayus(enPalabras(h.focusMinutes, d.lang)) + '</b>' + X.foco));
  if (h.breatheMinutes) lineas.push(linea(d.g.respira, 'var(--breathe)', '<b>' + mayus(enPalabras(h.breatheMinutes, d.lang)) + '</b>' + X.respira));
  if (h.bodyMinutes) lineas.push(linea(d.g.mueve, 'var(--move)', '<b>' + mayus(enPalabras(h.bodyMinutes, d.lang)) + '</b>' + X.cuerpo));
  const agua = '<p class="cq-linea">' + ic(d.g.agua, 'var(--hydrate)', 16) + '<span>' + fraseAgua(h.waterGlasses, h.waterGoal, d.lang) + '</span>' +
    '<button class="cq-mas">' + X.vaso + '</button></p>';
  const dentro = o.pausa !== 'rotulo';
  const luego = dentro ? pausa(d, true) : '';
  const blanco = lineas.length ? '' : '<p class="cq-blanco">' + d.S['sidebar.empty'] + '</p>';
  const hoy = '<div data-sb-pieza="hoy"><div class="cq-cab"><span class="cq-meta" style="color:var(--ink-2)">' + d.S['sidebar.today'] +
    '</span><span class="cq-meta cq-fecha">' + d.fecha + '</span></div><div class="cq-cuaderno">' + blanco + lineas.join('') + agua + luego + '</div></div>';
  const puerta = (glifo, color, nombre) => '<button class="cq-puerta">' + ic(glifo, color, 18) + '<span>' + nombre + '</span></button>';
  const puertas = '<div data-sb-pieza="puertas"><div class="cq-cab"><span class="cq-meta">' + X.bibliotecas + '</span></div><div class="cq-puertas">' +
    puerta(d.g.respira, 'var(--breathe)', d.S['activity.breathe.label']) + puerta(d.g.estira, 'var(--extra)', d.S['activity.stretch.label']) +
    puerta(d.g.mueve, 'var(--move)', d.S['activity.move.label']) + '</div></div>';
  const logro = '<div data-sb-pieza="logro-sec"><div class="cq-cab"><span class="cq-meta">' + d.S['sidebar.latest'] + '</span></div>' +
    (d.logro
      ? '<button class="cq-logro"><span class="cq-sello">' + d.logro.sello + '</span><span class="cq-logro-t"><span class="cq-logro-n">' + d.logro.titulo + '</span>' +
        (d.logro.desc ? '<span class="cq-logro-d">' + d.logro.desc + '</span>' : '') + '<span class="cq-enlace">' + d.S['sidebar.collection'] + '</span></span></button>'
      : '<div class="cq-logro vacio"><span class="cq-sello">·</span><span class="cq-logro-t"><span class="cq-logro-n">' + d.S['sidebar.latest.none'] +
        '</span><span class="cq-enlace">' + d.S['sidebar.collection'] + '</span></span></div>') + '</div>';
  const pie = '<div class="cq-pie" data-sb-pieza="pie">' +
    '<button class="cq-pie-fila"><span>' + d.S['sidebar.mine'] + '</span><span class="cq-premium">' + X.premium + '</span><span class="cq-chev">›</span></button>' +
    (d.apoyo ? '<button class="cq-pie-fila apoyo"><span>' + d.S['support.sidebar.label'] + '</span><span class="cq-chev">›</span></button>' : '') +
    '<div class="cq-pie-ver"><span>Pace ' + d.version + '</span><span class="cq-firma">by @ezradesign</span></div></div>';
  const R = '<div class="cq-regla"></div>';
  const fuera = dentro ? '' : pausa(d, false);
  const piezas = [capsulas(d, o.capsula || 'actual'), hoy, fuera, puertas, logro].filter(Boolean);
  const html = piezas.map((p) => R + p).join('') + '<div data-pace-sidebar-spacer data-sb-hueco style="flex:1;min-height:0"></div>' + pie;
  return { html, css: CSS };
}

const CSS = `
  [data-sb-oculto] { display: none !important; margin: 0 !important; }
  .cq-regla { height: 1px; background: var(--line); margin: 11px 0; flex: none; }
  .cq-meta { font-size: var(--size-meta); letter-spacing: var(--track-meta); text-transform: uppercase; color: var(--ink-3); }
  .cq-cab { display: flex; justify-content: center; align-items: baseline; gap: 7px; margin-bottom: 9px; }
  .cq-fecha { opacity: .75; }
  [data-sb-op] button, button[data-sb-op] { background: none; border: 0; padding: 0; font: inherit; color: inherit; cursor: pointer; text-align: inherit; }
  .cq-ic { display: inline-grid; place-items: center; flex: none; }
  .cq-ic svg { width: 100%; height: 100%; display: block; }

  .cq-sem { display: block; width: 100%; padding: 2px 0 !important; }
  .cq-dias { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
  .cq-dia { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .cq-l { font-size: 10px; letter-spacing: .08em; color: var(--ink-3); line-height: 1; }
  .cq-dia.hoy .cq-l { color: var(--ink); font-weight: 600; }
  .cq-pista { display: flex; flex-direction: column-reverse; overflow: hidden; height: 40px; }
  .cq-relleno { display: block; }
  .cq-racha { display: block; text-align: center; margin-top: 6px; font-family: var(--font-display); font-style: italic; font-size: 14px; color: var(--ink-2); }
  .actual .cq-pista { width: 10px; border-radius: 5px; background: var(--paper-3); }
  .actual .cq-dia.futuro .cq-pista { opacity: .5; }
  .actual .cq-relleno { border-radius: 5px; background: var(--focus); opacity: .5; }
  .actual .cq-dia.hoy .cq-relleno { opacity: 1; }
  .tinta .cq-pista { width: 7px; border-radius: 3.5px; box-shadow: inset 0 0 0 1px var(--line); }
  .tinta .cq-dia.futuro .cq-pista { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--line) 55%, transparent); }
  .tinta .cq-relleno { border-radius: 3.5px; background: color-mix(in oklab, var(--focus) 58%, var(--paper-2)); }
  .tinta .cq-dia.hoy .cq-relleno { background: var(--focus); }

  .cq-cuaderno { display: flex; flex-direction: column; gap: 5px; padding: 0 2px; }
  .cq-linea { display: flex; align-items: center; gap: 10px; margin: 0; font-family: var(--font-display); font-style: italic;
    font-size: 17px; line-height: 1.25; color: var(--ink-2); text-wrap: balance; }
  .cq-linea b, .cq-pausa-f b { font-weight: 500; color: var(--ink); }
  .cq-blanco { margin: 0 0 4px; font-family: var(--font-display); font-style: italic; font-size: 16px; line-height: 1.4;
    color: var(--ink-3); text-align: center; padding: 0 6px; text-wrap: balance; }
  .cq-mas { margin-left: auto; font-family: var(--font-ui) !important; font-style: normal !important; font-size: 11px !important;
    color: var(--hydrate) !important; border: 1px solid var(--hydrate) !important; border-radius: var(--r-pill);
    padding: 3px 9px !important; white-space: nowrap; background: var(--hydrate-soft) !important; flex: none; }
  .cq-pausa { display: grid !important; grid-template-columns: 16px minmax(0, 1fr) auto; gap: 10px; align-items: start; width: 100%;
    padding: 0 2px !important; text-align: left; }
  .cq-pausa .cq-ic { margin-top: 3px; }
  .cq-pausa-t { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .cq-pausa-f { font-family: var(--font-display); font-style: italic; font-size: 17px; line-height: 1.25; color: var(--ink-2); }
  .cq-pausa-m { font-size: 11.5px; color: var(--ink-3); }
  .cq-flecha { color: var(--ink-3); font-size: 15px; align-self: center; }
  .cq-pausa.dentro { position: relative; margin-top: 7px; padding-top: 10px !important; }
  .cq-pausa.dentro::before { content: ''; position: absolute; top: 0; left: 28px; right: 0; height: 1px; background: var(--line); }

  .cq-puertas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .cq-puerta { display: flex !important; align-items: center; justify-content: center; gap: 7px; padding: 7px 0 !important;
    border-radius: var(--r-md); font-family: var(--font-display) !important; font-style: italic; font-size: 15px !important; color: var(--ink) !important; }

  .cq-logro { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; }
  .cq-sello { width: 46px; height: 46px; flex: none; border: 1px solid var(--line); border-radius: 50%;
    display: grid; place-items: center; color: var(--ink-2); background: var(--paper); font-size: 16px; }
  .cq-sello svg * { vector-effect: non-scaling-stroke; stroke-width: 1.2px; }
  .cq-sello > span { width: 84% !important; height: 84% !important; }
  .cq-logro.vacio .cq-sello { color: var(--ink-3); opacity: .6; }
  .cq-logro-t { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .cq-logro-n { font-family: var(--font-display); font-style: italic; font-size: 16px; line-height: 1.2; color: var(--ink); }
  .cq-logro.vacio .cq-logro-n { color: var(--ink-3); }
  .cq-logro-d { font-size: 11.5px; line-height: 1.35; color: var(--ink-3); }
  .cq-enlace { font-size: 11px; color: var(--ink-3); text-decoration: underline; text-underline-offset: 3px; margin-top: 2px; }

  .cq-pie { display: flex; flex-direction: column; gap: 2px; border-top: 1px solid var(--line); padding-top: 8px; margin-top: 12px; }
  .cq-pie-fila { display: flex; align-items: center; gap: 8px; width: 100%; padding: 7px 2px !important; font-size: 12px !important; color: var(--ink-2) !important; }
  .cq-pie-fila.apoyo { font-family: var(--font-display) !important; font-style: italic; font-size: 14px !important; }
  .cq-chev { margin-left: auto; color: var(--ink-3); }
  .cq-premium { font-size: 9px; letter-spacing: .12em; text-transform: uppercase; font-weight: 600; color: var(--premium);
    border: 1px solid var(--premium); border-radius: var(--r-pill); padding: 2px 7px; background: var(--premium-soft); }
  .cq-pie-ver { display: flex; justify-content: space-between; align-items: baseline; margin-top: 6px; font-size: 9px;
    letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); }
  .cq-firma { font-family: var(--font-display); font-style: italic; letter-spacing: 0; text-transform: none; }
`;

module.exports = { datos, pintar, enPalabras, fraseAgua };
