// «Qué te ayuda», metido en la app real antes de montarla. Se evalúa DENTRO de la página.
// `aplicar(cfg)`: { dice: 'a'|'b'|'c', datos: 'lleno'|'medio'|'vacio', antes: 'a'|'b'|'c',
//   sitio: 'pestana'|'dentro', cerrado: bool }. Sustituye `window.StatsPanel` por una copia con la
// propuesta: el panel de verdad lo pide por su nombre global al pintarse, así que basta con esto.
// Los datos son DE EJEMPLO y la vista lo dice: no salen de ningún registro.
'use strict';
module.exports = function aplicar(cfg) {
  var h = React.createElement;
  var useState = React.useState;
  var es = cfg.lang !== 'en';

  /* Los textos de la propuesta, en los dos idiomas. */
  Object.assign(window.PACE_STRINGS.es, {
    'qta.tab': 'Qué te ayuda',
    'qta.cab': 'Tus últimas 6 semanas',
    'qta.ejemplo': 'Datos de ejemplo',
    'qta.pie': 'Sale de lo que contestas y lo que haces, guardado en este dispositivo. No es un consejo médico.',
    'qta.bien': 'Lo que te sienta bien',
    'qta.bien.de': '{a} de {b}',
    'qta.bien.nota': 'Veces que contestaste «Sí» o «Un poco».',
    'qta.bien.ritmo': 'A tu ritmo ya las trae antes.',
    'qta.bien.fuente': '15 respuestas a «¿Te ayudó?»',
    'qta.bien.fuente.c': '41 respuestas a «¿Te ayudó?»',
    'qta.hora': 'Tu hora de Foco',
    'qta.hora.frase': 'Sobre todo por la mañana, de 9 a 12.',
    'qta.hora.nota': 'Casi todos, de 25 minutos.',
    'qta.hora.fuente': '35 Focos terminados',
    'qta.tras': 'Después del Foco',
    'qta.tras.frase': 'Tras 21 de tus 35 Focos, una pausa.',
    'qta.tras.nota': 'Por la mañana, 17 de 25. Por la tarde, 4 de 10.',
    'qta.tras.fuente': 'Una pausa en los 15 minutos siguientes',
    'qta.dia': 'Las pausas de tu día',
    'qta.dia.frase': 'La de media mañana es la que más haces.',
    'qta.dia.nota': 'La de después de comer, la que más saltas: 6 de 16. Desde el lunes dura 2 minutos.',
    'qta.dia.fuente': '18 días con A tu ritmo',
    'qta.no': 'Lo que no te convenció',
    'qta.no.veces': '«No», 2 veces',
    'qta.no.nota': 'La pausa ya no te la propone. Sigue en Estira si la buscas.',
    'qta.no.fuente': 'Tus «No» a «¿Te ayudó?»',
    'qta.modulo': 'Por módulo',
    'qta.modulo.nota': 'Veces que contestaste «Sí» o «Un poco», en cada uno.',
    'qta.modulo.fuente': 'Desde 8 respuestas en cada módulo',
    'qta.pronto': 'Todavía es pronto.',
    'qta.pronto.texto': 'Aquí saldrá lo que se repite en tus pausas y tus Focos, cuando haya bastante para decirlo. Se llena solo: no hace falta hacer nada más.',
    'qta.resto': 'Lo demás saldrá cuando haya bastante para decirlo.',
    'qta.vendra.bien': 'Qué pausas te ayudan, según tus respuestas.',
    'qta.vendra.hora': 'A qué hora terminas tus Focos.',
    'qta.vendra.tras': 'Si después de un Foco haces la pausa.',
    'qta.aun': 'Aún no',
    'qta.hay': 'Llevas 3 respuestas a «¿Te ayudó?» y 5 Focos terminados.',
    'qta.hay.texto': 'Con unos pocos más, PACE podrá decir algo.',
    'qta.linea.semana': 'Esta semana te ayudó: {a} y {b}.',
    'qta.linea.mes': 'Tus Focos, sobre todo por la mañana. Tras 21 de 35, una pausa.',
    'qta.semanas': '6 semanas',
    'premium.inc.stats': 'Tu mes, tu año y qué te ayuda',
  });
  Object.assign(window.PACE_STRINGS.en, {
    'qta.tab': 'What helps',
    'qta.cab': 'Your last 6 weeks',
    'qta.ejemplo': 'Sample data',
    'qta.pie': 'Drawn from what you answer and what you do, kept on this device. It is not medical advice.',
    'qta.bien': 'What suits you',
    'qta.bien.de': '{a} of {b}',
    'qta.bien.nota': 'Times you answered “Yes” or “A little”.',
    'qta.bien.ritmo': 'At your pace already brings them sooner.',
    'qta.bien.fuente': '15 answers to “Did it help?”',
    'qta.bien.fuente.c': '41 answers to “Did it help?”',
    'qta.hora': 'Your Focus hours',
    'qta.hora.frase': 'Mostly in the morning, 9 to 12.',
    'qta.hora.nota': 'Nearly all of them 25 minutes long.',
    'qta.hora.fuente': '35 Focus blocks finished',
    'qta.tras': 'After Focus',
    'qta.tras.frase': 'After 21 of your 35 Focus blocks, a break.',
    'qta.tras.nota': 'In the morning, 17 of 25. In the afternoon, 4 of 10.',
    'qta.tras.fuente': 'A break within the next 15 minutes',
    'qta.dia': 'The breaks in your day',
    'qta.dia.frase': 'The mid-morning one is the one you do most.',
    'qta.dia.nota': 'The one after lunch, the one you skip most: 6 of 16. Since Monday it lasts 2 minutes.',
    'qta.dia.fuente': '18 days with At your pace',
    'qta.no': 'What did not suit you',
    'qta.no.veces': '“No”, twice',
    'qta.no.nota': 'The break no longer suggests it. It is still in Stretch if you want it.',
    'qta.no.fuente': 'Your “No” answers to “Did it help?”',
    'qta.modulo': 'By module',
    'qta.modulo.nota': 'Times you answered “Yes” or “A little”, in each.',
    'qta.modulo.fuente': 'From 8 answers in each module',
    'qta.pronto': 'It is still early.',
    'qta.pronto.texto': 'What repeats in your breaks and your Focus will show up here, once there is enough to say it. It fills in on its own: nothing more to do.',
    'qta.resto': 'The rest will show up once there is enough to say it.',
    'qta.vendra.bien': 'Which breaks help you, from your answers.',
    'qta.vendra.hora': 'When you finish your Focus blocks.',
    'qta.vendra.tras': 'Whether you take the break after Focus.',
    'qta.aun': 'Not yet',
    'qta.hay': 'So far, 3 answers to “Did it help?” and 5 Focus blocks finished.',
    'qta.hay.texto': 'With a few more, PACE will be able to say something.',
    'qta.linea.semana': 'This week, {a} and {b} helped you.',
    'qta.linea.mes': 'Your Focus, mostly in the morning. After 21 of 35, a break.',
    'qta.semanas': '6 weeks',
    'premium.inc.stats': 'Your month, your year and what helps',
  });

  if (cfg.cerrado) window.PREMIUM_ABIERTO_HASTA_V1 = false;

  /* Los datos de ejemplo. Las rutinas son de verdad (su nombre sale del catálogo, en los dos
     idiomas); las cuentas, inventadas y creíbles para seis semanas de uso. */
  var BIEN = [
    { id: 'move.neck.3', modulo: 'estira', a: 5, b: 6 },
    { id: 'breathe.coherent.55', modulo: 'respira', a: 4, b: 5 },
    { id: 'extra.chair.squats', modulo: 'mueve', a: 3, b: 4 },
  ];
  var BIEN_C = BIEN.concat([
    { id: 'move.spine.chair', modulo: 'estira', a: 3, b: 4 },
    { id: 'breathe.box.4', modulo: 'respira', a: 3, b: 4 },
  ]);
  var MEDIO = [BIEN[0], { id: 'breathe.coherent.55', modulo: 'respira', a: 3, b: 3 }];
  var NO = [{ id: 'move.shoulder.circles', modulo: 'estira' }];
  var MODULOS = [
    { modulo: 'estira', label: 'activity.stretch.label', a: 11, b: 13 },
    { modulo: 'respira', label: 'activity.breathe.label', a: 7, b: 8 },
    { modulo: 'mueve', label: 'activity.move.label', a: 5, b: 9 },
  ];
  /* Focos terminados por hora de empezar, de 8 a 20. */
  var HORAS = [2, 7, 8, 6, 2, 0, 0, 3, 4, 3, 0, 0, 0];

  var css = `
    .pace-qta { position: relative; }
    .pace-qta-cab { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin: 0 2px 8px; }
    .pace-qta-ej { font-size: 9.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3);
      border: 1px dashed var(--line); border-radius: 999px; padding: 2px 7px; white-space: nowrap; }
    .pace-qta-rejilla { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
    .pace-qta-t { position: relative; overflow: hidden; background: var(--paper-2); border-radius: var(--r-md);
      padding: 10px 12px 9px; min-width: 0; }
    .pace-qta-t > .pace-qta-franja { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--c); }
    .pace-qta-frase { font-family: var(--font-display); font-style: italic; font-size: 17px; line-height: 1.2; color: var(--ink); margin: 3px 0 2px; }
    .pace-qta-nota { font-size: 11px; line-height: 1.4; color: var(--ink-2); margin-top: 3px; }
    .pace-qta-fuente { font-size: 10px; color: var(--ink-3); margin-top: 5px; letter-spacing: .01em; }
    .pace-qta-filas { display: grid; gap: 0; margin-top: 4px; }
    .pace-qta-fila { display: flex; align-items: center; gap: 8px; min-height: 24px; border-bottom: 1px solid var(--paper-3); }
    .pace-qta-fila:last-child { border-bottom: 0; }
    .pace-qta-aro { flex: none; width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center;
      background: color-mix(in srgb, var(--c) 22%, var(--paper)); border: 1.5px solid var(--c); }
    .pace-qta-aro .pace-rt-g { width: 12px; height: 12px; }
    .pace-qta-n { flex: 1; min-width: 0; font-family: var(--font-display); font-style: italic; font-size: 15px; color: var(--ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pace-qta-c { flex: none; font-size: 11px; color: var(--ink-2); font-variant-numeric: tabular-nums; }
    .pace-qta-horas { display: flex; align-items: flex-end; gap: 3px; height: 30px; margin: 6px 0 2px; }
    .pace-qta-horas i { flex: 1; background: var(--focus); border-radius: 2px 2px 1px 1px; min-height: 2px; opacity: .85; }
    .pace-qta-horas i.cero { background: var(--line); opacity: .5; }
    .pace-qta-eje { display: flex; justify-content: space-between; font-size: 9px; color: var(--ink-3); font-variant-numeric: tabular-nums; }
    .pace-qta-pie { font-size: 10.5px; color: var(--ink-3); margin: 10px 2px 0; line-height: 1.45; }
    .pace-qta-vacio { padding: 26px 6px 10px; max-width: 30em; }
    .pace-qta-vacio .pace-qta-frase { font-size: 22px; margin-bottom: 8px; }
    .pace-qta-vacio p { font-size: 13px; color: var(--ink-2); line-height: 1.55; margin: 0 0 10px; }
    .pace-qta-vendra { background: transparent; border: 1px dashed var(--line); }
    .pace-qta-vendra .pace-qta-franja { opacity: .35; }
    .pace-qta-vendra .pace-qta-frase { color: var(--ink-3); font-size: 15px; }
    .pace-qta-linea { margin-top: 10px; padding: 8px 10px; background: var(--paper-2); border-radius: var(--r-sm);
      font-size: 11px; color: var(--ink-2); line-height: 1.5; }
    .pace-qta-linea strong { color: var(--ink); font-style: italic; font-family: var(--font-display); font-size: 13px; font-weight: 500; }
    .pace-qta-linea .pace-qta-ej { float: right; margin: 1px 0 0 8px; }
    @media ${window.PACE_CORTE_ESC} {
      .pace-qta-rejilla { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
      .pace-qta-rejilla.dos { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .pace-qta-t { padding: 13px 15px 12px; }
      .pace-qta-frase { font-size: 20px; margin: 6px 0 4px; }
      .pace-qta-nota { font-size: 12px; }
      .pace-qta-fuente { font-size: 10.5px; margin-top: 8px; }
      .pace-qta-fila { min-height: 30px; }
      .pace-qta-n { font-size: 16px; }
      .pace-qta-horas { height: 54px; margin-top: 10px; }
      .pace-qta-vacio { padding: 54px 6px 10px; margin: 0 auto; text-align: center; }
      .pace-qta-vacio .pace-qta-frase { font-size: 28px; }
      .pace-qta-vacio p { font-size: 14px; }
      .pace-qta-cab { margin-bottom: 12px; }
    }
    /* Con cinco ideas el ordenador pone tres y dos, más bajas. */
    @media ${window.PACE_CORTE_ESC} {
      .pace-qta-rejilla.cinco .pace-qta-t { padding: 10px 13px 9px; }
      .pace-qta-rejilla.cinco .pace-qta-frase { font-size: 17px; margin: 3px 0 2px; }
      .pace-qta-rejilla.cinco .pace-qta-horas { height: 30px; margin-top: 6px; }
      .pace-qta-rejilla.cinco .pace-qta-fila { min-height: 25px; }
      .pace-qta-rejilla.cinco .pace-qta-fuente { margin-top: 4px; }
    }
  `;
  var st = document.createElement('style');
  st.id = 'pace-qta-css';
  st.textContent = css;
  document.head.appendChild(st);

  function nombre(id, t, lang) {
    var r = (window.resolveAnyRoutine && window.resolveAnyRoutine(id)) || { id: id, name: id };
    return window.ritmoNombre(r, t, lang);
  }
  function Ejemplo() {
    var t = window.useT().t;
    return h('span', { className: 'pace-qta-ej', 'data-pace-qta-ejemplo': '' }, t('qta.ejemplo'));
  }
  function Tarjeta(p) {
    return h('div', { className: 'pace-qta-t' + (p.clase ? ' ' + p.clase : ''), 'data-pace-qta-idea': p.idea, style: { '--c': p.color } },
      h('span', { className: 'pace-qta-franja', 'aria-hidden': 'true' }),
      h(window.Meta, { style: { fontSize: 10 } }, p.titulo),
      p.children,
      p.fuente ? h('div', { className: 'pace-qta-fuente' }, p.fuente) : null);
  }
  function Filas(p) {
    var u = window.useT(), t = u.t, lang = u.lang;
    return h('div', { className: 'pace-qta-filas' }, p.items.map(function (x, k) {
      return h('div', { key: k, className: 'pace-qta-fila', style: { '--c': window.RITMO_COLOR[x.modulo] } },
        h('i', { className: 'pace-qta-aro' }, h(window.RitmoGlifo, { modulo: x.modulo })),
        h('span', { className: 'pace-qta-n' }, x.label ? t(x.label) : nombre(x.id, t, lang)),
        h('span', { className: 'pace-qta-c' }, x.texto || t('qta.bien.de').replace('{a}', x.a).replace('{b}', x.b)));
    }));
  }

  var IDEAS = {
    bien: function (t, items, fuente) {
      return h(Tarjeta, { key: 'bien', idea: 'bien', color: 'var(--extra)', titulo: t('qta.bien'), fuente: fuente || (t('qta.bien.fuente') + ' · ' + t('qta.semanas')) },
        h(Filas, { items: items || BIEN }),
        h('div', { className: 'pace-qta-nota' }, t('qta.bien.nota') + (items ? '' : ' ' + t('qta.bien.ritmo'))));
    },
    hora: function (t) {
      var max = Math.max.apply(null, HORAS);
      return h(Tarjeta, { key: 'hora', idea: 'hora', color: 'var(--focus)', titulo: t('qta.hora'), fuente: t('qta.hora.fuente') + ' · ' + t('qta.semanas') },
        h('div', { className: 'pace-qta-frase' }, t('qta.hora.frase')),
        h('div', { className: 'pace-qta-horas', 'aria-hidden': 'true' }, HORAS.map(function (n, k) {
          return h('i', { key: k, className: n ? '' : 'cero', style: { height: n ? (n / max * 100) + '%' : 2 } });
        })),
        h('div', { className: 'pace-qta-eje', 'aria-hidden': 'true' }, ['8', '12', '16', '20'].map(function (x) { return h('span', { key: x }, x); })),
        h('div', { className: 'pace-qta-nota' }, t('qta.hora.nota')));
    },
    tras: function (t) {
      return h(Tarjeta, { key: 'tras', idea: 'tras', color: 'var(--move)', titulo: t('qta.tras'), fuente: t('qta.tras.fuente') },
        h('div', { className: 'pace-qta-frase' }, t('qta.tras.frase')),
        h('div', { className: 'pace-qta-nota' }, t('qta.tras.nota')));
    },
    dia: function (t) {
      return h(Tarjeta, { key: 'dia', idea: 'dia', color: 'var(--breathe)', titulo: t('qta.dia'), fuente: t('qta.dia.fuente') },
        h('div', { className: 'pace-qta-frase' }, t('qta.dia.frase')),
        h('div', { className: 'pace-qta-nota' }, t('qta.dia.nota')));
    },
    no: function (t) {
      return h(Tarjeta, { key: 'no', idea: 'no', color: 'var(--ink-3)', titulo: t('qta.no'), fuente: t('qta.no.fuente') },
        h(Filas, { items: NO.map(function (x) { return Object.assign({ texto: t('qta.no.veces') }, x); }) }),
        h('div', { className: 'pace-qta-nota' }, t('qta.no.nota')));
    },
    modulo: function (t) {
      return h(Tarjeta, { key: 'modulo', idea: 'modulo', color: 'var(--breathe)', titulo: t('qta.modulo'), fuente: t('qta.modulo.fuente') },
        h(Filas, { items: MODULOS }),
        h('div', { className: 'pace-qta-nota' }, t('qta.modulo.nota')));
    },
  };

  /* La vista de la pestaña: las ideas que ya se pueden decir, o lo de antes. */
  function QueTeAyuda() {
    var t = window.useT().t;
    var cab = function (texto) {
      return h('div', { className: 'pace-qta-cab' }, h(window.Meta, null, texto), h(Ejemplo));
    };
    var pie = h('p', { className: 'pace-qta-pie' }, t('qta.pie'));
    if (cfg.datos === 'vacio') {
      if (cfg.antes === 'b') {
        return h('div', { className: 'pace-qta', 'data-pace-qta-view': 'vendra' },
          cab(t('qta.pronto').replace(/\.$/, '')),
          h('div', { className: 'pace-qta-rejilla' }, [['bien', 'var(--extra)'], ['hora', 'var(--focus)'], ['tras', 'var(--move)']].map(function (x) {
            return h(Tarjeta, { key: x[0], idea: x[0], clase: 'pace-qta-vendra', color: x[1], titulo: t('qta.' + x[0]), fuente: t('qta.aun') },
              h('div', { className: 'pace-qta-frase' }, t('qta.vendra.' + x[0])));
          })),
          h('p', { className: 'pace-qta-pie' }, t('qta.pronto.texto').split('. ').slice(1).join('. ')));
      }
      return h('div', { className: 'pace-qta', 'data-pace-qta-view': cfg.antes === 'c' ? 'hay' : 'pronto' },
        h('div', { className: 'pace-qta-cab', style: { justifyContent: 'flex-end' } }, h(Ejemplo)),
        h('div', { className: 'pace-qta-vacio' },
          h('div', { className: 'pace-qta-frase' }, t(cfg.antes === 'c' ? 'qta.hay' : 'qta.pronto')),
          h('p', null, t(cfg.antes === 'c' ? 'qta.hay.texto' : 'qta.pronto.texto'))));
    }
    if (cfg.datos === 'medio') {
      return h('div', { className: 'pace-qta', 'data-pace-qta-view': 'medio' },
        cab(t('qta.cab').replace('6', '2')),
        h('div', { className: 'pace-qta-rejilla' }, IDEAS.bien(t, MEDIO, t('qta.bien.fuente').replace('15', '9') + ' · ' + t('qta.semanas').replace('6', '2'))),
        h('p', { className: 'pace-qta-pie' }, t('qta.resto')));
    }
    var ideas = cfg.dice === 'b' ? ['bien', 'hora', 'tras', 'dia', 'no']
      : cfg.dice === 'c' ? ['bienC', 'modulo', 'no'] : ['bien', 'hora', 'tras'];
    return h('div', { className: 'pace-qta', 'data-pace-qta-view': 'ideas-' + cfg.dice },
      cab(t('qta.cab')),
      h('div', { className: 'pace-qta-rejilla' + (ideas.length > 3 ? ' cinco' : '') }, ideas.map(function (k) {
        return k === 'bienC' ? IDEAS.bien(t, BIEN_C, t('qta.bien.fuente.c') + ' · ' + t('qta.semanas')) : IDEAS[k](t);
      })),
      pie);
  }

  /* 3B: una línea al pie de la semana y del mes. Sin PACE completo no sale nada. */
  function Linea(p) {
    var u = window.useT(), t = u.t, lang = u.lang;
    if (cfg.cerrado) return null;
    var texto = p.de === 'semana'
      ? t('qta.linea.semana').replace('{a}', nombre(BIEN[0].id, t, lang)).replace('{b}', nombre(BIEN[1].id, t, lang))
      : t('qta.linea.mes');
    return h('div', { className: 'pace-qta-linea', 'data-pace-qta-linea': p.de },
      h(Ejemplo), h('strong', null, t('qta.tab')), ' ', texto);
  }

  /* El panel, copiado de StatsPanel.jsx con la propuesta dentro. Los estilos de las pestañas son
     los de allí; con «Qué te ayuda» cada pestaña toma el ancho de su nombre. */
  var tabStyles = {
    container: { display: 'flex', gap: 2, flex: '1 1 100%', marginTop: 'var(--s-5)', background: 'var(--paper-2)', borderRadius: 'var(--r-sm)', padding: 3 },
    tab: function (active, ancho) {
      return { flex: ancho ? '1 1 auto' : 1, padding: ancho ? '7px 4px' : '7px 0', border: 'none', borderRadius: 'var(--r-sm)', whiteSpace: 'nowrap',
        cursor: 'pointer', fontSize: 12, fontWeight: active ? 600 : 400, letterSpacing: 0.5,
        background: active ? 'var(--paper)' : 'transparent', color: active ? 'var(--ink)' : 'var(--ink-3)',
        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' };
    },
  };
  var conPestana = cfg.sitio === 'pestana';
  function StatsPanelPropuesta(props) {
    var state = window.usePace()[0];
    var t = window.useT().t;
    var ts = useState(window.__qtaTab || 'today'), tab = ts[0], setTab = ts[1];
    window.__qtaSetTab = setTab;
    var cerrada = function (key) {
      return (key === 'month' || key === 'year' || key === 'ayuda')
        && !(window.PREMIUM_ABIERTO_HASTA_V1 || (window.hasPremiumEntitlement && window.hasPremiumEntitlement()));
    };
    var history = window.getHistoryWithToday(state);
    var lang = state.lang || 'es';
    var lista = [{ key: 'today', label: t('stats.tab.today') }, { key: 'week', label: t('stats.tab.week') },
      { key: 'month', label: t('stats.tab.month') }, { key: 'year', label: t('stats.tab.year') }];
    if (conPestana) lista.push({ key: 'ayuda', label: t('qta.tab') });
    var pestanas = h('div', { 'data-pace-stats-tabs': true, style: tabStyles.container }, lista.map(function (x) {
      return h('button', { key: x.key, style: tabStyles.tab(tab === x.key, conPestana), 'data-pace-stats-tab': x.key,
        'data-pace-stats-cerrada': cerrada(x.key) ? '' : undefined,
        'aria-label': cerrada(x.key) ? x.label + ' · ' + t('stats.cerrado') : undefined,
        onClick: function () { if (cerrada(x.key)) { window.paceAbrirPremium({ nombre: x.label }); return; } setTab(x.key); } },
      cerrada(x.key) ? h(window.PaceCandado, { size: 10 }) : null, x.label);
    }));
    return h(window.Modal, { open: props.open, onClose: props.onClose, cabecera: pestanas,
      tagLabel: t('stats.tag'), title: t('stats.title'), subtitle: t('stats.subtitle'), maxWidth: 1240 },
    h('div', { 'data-pace-stats-vistas': true },
      tab === 'today' && h(window.StatsHoy, { state: state, onClose: props.onClose }),
      tab === 'week' && (conPestana ? h(window.WeekView, { state: state })
        : h('div', null, h(window.WeekView, { state: state }), h(Linea, { de: 'semana' }))),
      tab === 'month' && (conPestana ? h(window.MonthHeatmap, { history: history, lang: lang })
        : h('div', null, h(window.MonthHeatmap, { history: history, lang: lang }), h(Linea, { de: 'mes' }))),
      tab === 'year' && h(window.YearView, { history: history, lang: lang, firstSeen: state.firstSeen, onNavigateToMonth: function () { setTab('month'); } }),
      tab === 'ayuda' && h(QueTeAyuda)));
  }
  window.StatsPanel = StatsPanelPropuesta;
  return JSON.stringify(cfg) + (es ? '' : ' en');
};
