// Lo que se ve del punto 12, metido en la app real antes de montarla. Se evalúa DENTRO de la página.
// `aplicar(cfg)`: { escena, lang, fin (ms del fin de la semana de prueba), dosDias (ms) }.
// Sustituye `window.PremiumInvitacion` y `window.PremiumSection` por copias con la propuesta: la app
// los pide por su nombre global al pintarse, así que basta con esto. Nada de esto vive en app/.
'use strict';
module.exports = function aplicar(cfg) {
  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect;
  var en = cfg.lang === 'en';
  var esc = cfg.escena;

  Object.assign(window.PACE_STRINGS.es, {
    'v1.titulo': 'Siete días de PACE completo',
    'v1.cuerpo': 'Desde hoy, PACE completo es de pago. Como ya usabas PACE, lo tienes entero hasta el {fecha}, sin tarjeta y sin pagar nada.',
    'v1.tuyas': 'Y estas se quedan tuyas para siempre, porque ya las hiciste:',
    'v1.gratis': 'Lo gratis sigue gratis.',
    'v1.vale': 'Entendido',
    'v1.toast.eyebrow': 'PACE completo',
    'v1.toast.titulo': 'Siete días para probarlo entero',
    'v1.toast.desc': 'Hasta el {dia}. Lo que ya hiciste se queda tuyo.',
    'v1.final.titulo': 'Tu semana acaba el {dia}',
    'v1.final.cuerpo': 'Después se cierra lo de pago, menos lo que ya hiciste: estas {n} rutinas se quedan tuyas.',
    'v1.final.ver': 'Ver PACE completo',
    'v1.ajustes': 'Prueba hasta el {fecha}',
    'compra.precios': '{vida} una vez, o {mes} al mes con {dias} días gratis.',
    'compra.probar': 'Probar {dias} días gratis',
    'compra.vida': 'Prefiero pagarlo una vez, {vida}',
    'compra.aviso': 'Te avisamos dos días antes de que acabe la prueba.',
    'compra.mes.t': 'Al mes',
    'compra.mes.d': '{dias} días gratis y cancelas en dos toques',
    'compra.vida.t': 'Para siempre',
    'compra.vida.d': 'Un solo pago',
    'rec.perdido': '¿Lo has perdido? Recupéralo con tu correo',
    'rec.app.titulo': 'Recupera tu código',
    'rec.app.correo': 'El correo con el que pagaste',
    'rec.app.recibo': 'El número del recibo',
    'rec.app.boton': 'Recuperar',
    'rec.app.nota': 'PACE se conecta una vez para buscar tu compra en Stripe. Tu correo no se guarda.',
  });
  Object.assign(window.PACE_STRINGS.en, {
    'v1.titulo': 'Seven days of PACE Complete',
    'v1.cuerpo': 'From today, PACE Complete is paid. Since you were already using PACE, you have all of it until {fecha}, with no card and nothing to pay.',
    'v1.tuyas': 'And these stay yours for good, because you have already done them:',
    'v1.gratis': 'What is free stays free.',
    'v1.vale': 'Got it',
    'v1.toast.eyebrow': 'PACE Complete',
    'v1.toast.titulo': 'Seven days to try all of it',
    'v1.toast.desc': 'Until {dia}. What you have done stays yours.',
    'v1.final.titulo': 'Your week ends on {dia}',
    'v1.final.cuerpo': 'Then the paid part closes, except what you have done: these {n} routines stay yours.',
    'v1.final.ver': 'See PACE Complete',
    'v1.ajustes': 'Trial until {fecha}',
    'compra.precios': '{vida} once, or {mes} a month with {dias} days free.',
    'compra.probar': 'Try {dias} days free',
    'compra.vida': 'I would rather pay once, {vida}',
    'compra.aviso': 'We will remind you two days before the trial ends.',
    'compra.mes.t': 'Monthly',
    'compra.mes.d': '{dias} days free, cancel in two taps',
    'compra.vida.t': 'For good',
    'compra.vida.d': 'A single payment',
    'rec.perdido': 'Lost it? Get it back with your email',
    'rec.app.titulo': 'Get your code back',
    'rec.app.correo': 'The email you paid with',
    'rec.app.recibo': 'The receipt number',
    'rec.app.boton': 'Get it back',
    'rec.app.nota': 'PACE connects once to find your purchase in Stripe. Your email is not kept.',
  });

  var loc = en ? 'en-GB' : 'es-ES';
  var fin = new Date(cfg.fin);
  var fechaLarga = fin.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' });
  var fechaCorta = fin.toLocaleDateString(loc, { day: 'numeric', month: 'long' });
  var diaSemana = fin.toLocaleDateString(loc, { weekday: 'long' });

  /* Las tres de pago que esta persona hizo antes de v1, una de cada módulo. */
  var TUYAS = [['breathe.rounds.full', 'breathe'], ['extra.hang.bar', 'move'], ['move.couch.stretch', 'extra']];
  var MODULO = { breathe: en ? 'Breathe' : 'Respira', move: en ? 'Move' : 'Mueve', extra: en ? 'Stretch' : 'Estira' };
  function nombre(id) {
    var r = (window.getBreatheRoutine && window.getBreatheRoutine(id)) || null;
    if (!r) { var b = window.resolveBodyRoutine && window.resolveBodyRoutine(id); r = b ? b.routine : null; }
    if (!r) return id;
    if (!en) return r.name;
    var k = id + '.name', v = window.PACE_STRINGS.en[k];
    return v || r.name;
  }

  var st = {
    sub: Object.assign({}, displayItalic, { fontSize: 17, color: 'var(--ink-2)', margin: '0 0 14px' }),
    lista: { listStyle: 'none', padding: 0, margin: '0 0 16px', fontSize: 14, color: 'var(--ink-2)' },
    item: { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px dashed var(--line)' },
    detalle: { color: 'var(--ink-3)', fontSize: 13, textAlign: 'right' },
    v1: Object.assign({}, displayItalic, { fontSize: 18, color: 'var(--ink)', margin: '0 0 14px' }),
    ancho: { width: '100%', justifyContent: 'center', borderRadius: 'var(--r-pill)' },
    enlace: Object.assign({ display: 'block', margin: '14px auto 0', background: 'none', border: 0, cursor: 'pointer' }, displayItalic, { fontSize: 16, color: 'var(--premium)' }),
    etiqueta: { display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 },
    campo: { width: '100%', boxSizing: 'border-box', padding: '10px 12px', marginBottom: 10, fontSize: 14, fontFamily: 'var(--font-mono)',
      color: 'var(--ink)', background: 'var(--paper-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)' },
    titulo: Object.assign({}, displayItalic, { fontSize: 28, fontWeight: 500, lineHeight: 1.15, margin: '12px 36px 2px 0' }),
    nota: { fontSize: 12.5, color: 'var(--ink-3)', margin: '10px 0 0', lineHeight: 1.45 },
    par: { display: 'flex', flexWrap: 'wrap', gap: 10, width: '100%' },
    mitad: { flex: '1 1 160px', justifyContent: 'center', borderRadius: 'var(--r-pill)' },
    aviso: { fontSize: 12, color: 'var(--ink-3)', margin: '10px 0 2px', textAlign: 'center' },
    fantasma: Object.assign({ display: 'block', margin: '2px auto 0', background: 'none', border: 0, cursor: 'pointer', padding: '6px 10px' },
      displayItalic, { fontSize: 15, color: 'var(--ink-2)' }),
    plan: { flex: '1 1 160px', textAlign: 'left', padding: '12px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--line-2)',
      background: 'var(--paper)', cursor: 'pointer', color: 'var(--ink)', display: 'flex', flexDirection: 'column', gap: 2 },
    planT: { fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)' },
    planP: Object.assign({}, displayItalic, { fontSize: 26, lineHeight: 1.1, color: 'var(--ink)' }),
    planD: { fontSize: 12, color: 'var(--ink-3)' },
  };

  function useTx() {
    var u = useT();
    return { t: u.t, tn: u.tn, lang: u.lang };
  }

  function Incluye() {
    var x = useTx();
    return h('ul', { style: st.lista }, PREMIUM_INCLUYE.map(function (k) {
      return h('li', { key: k, style: st.item }, h('span', null, x.t('premium.inc.' + k)), h('span', { style: st.detalle }, x.t('premium.inc.' + k + '.d')));
    }));
  }

  /* 1 · La hoja del paso a v1 (A y C) y la del final (C). */
  function HojaV1(props) {
    var x = useTx();
    var final = props.final;
    var titulo = final ? x.tn('v1.final.titulo', { dia: diaSemana }) : x.t('v1.titulo');
    return h(Modal, { open: true, onClose: function () {}, maxWidth: 440, ariaLabel: titulo },
      h('div', { 'data-pace-premium-hoja': 'v1' },
        h(PremiumSeal),
        h('h2', { style: st.titulo }, titulo),
        h('p', { style: st.sub }, final ? x.tn('v1.final.cuerpo', { n: TUYAS.length }) : x.tn('v1.cuerpo', { fecha: fechaLarga })),
        final ? null : h('p', { style: Object.assign({}, st.etiqueta, { textTransform: 'none', letterSpacing: 0, fontSize: 13, color: 'var(--ink-2)' }) }, x.t('v1.tuyas')),
        h('ul', { style: st.lista }, TUYAS.map(function (p) {
          return h('li', { key: p[0], style: st.item }, h('span', null, nombre(p[0])), h('span', { style: st.detalle }, MODULO[p[1]]));
        })),
        final ? null : h('p', { style: st.v1 }, x.t('v1.gratis')),
        final ? h(Button, { style: st.ancho }, x.t('v1.final.ver')) : h(Button, { style: st.ancho }, x.t('v1.vale')),
        final ? h('button', { type: 'button', style: st.enlace }, x.t('v1.vale')) : null));
  }

  /* 1B · Sin hoja: el aviso de abajo, con la caja del de los códigos. */
  function AvisoV1() {
    var x = useTx();
    return h('div', { style: { position: 'fixed', bottom: 20, left: 0, right: 0, zIndex: 200, display: 'flex', justifyContent: 'center', pointerEvents: 'none' } },
      h('div', { 'data-pace-toast': 'v1', style: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', background: 'var(--paper)',
        border: '1px solid var(--premium)', borderRadius: 'var(--r-md)', boxShadow: 'var(--sh-card)', minWidth: 280, maxWidth: 'calc(100vw - 32px)' } },
        h('div', { style: { width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--premium)', display: 'grid', placeItems: 'center', flex: 'none', color: 'var(--premium)' } },
          h(PaceCandado, { size: 14, abierto: true })),
        h('div', null,
          h('div', { style: { fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--premium)' } }, x.t('v1.toast.eyebrow')),
          h('div', { style: Object.assign({}, displayItalic, { fontSize: 18, fontWeight: 500, lineHeight: 1.2 }) }, x.t('v1.toast.titulo')),
          h('div', { style: { fontSize: 11, color: 'var(--ink-3)' } }, x.tn('v1.toast.desc', { dia: diaSemana + ' ' + fin.getDate() })))));
  }

  /* 3 · La invitación con los botones de compra (A como la bienvenida, B con dos planes), y 2 · el campo
     del código con el enlace a /recuperar (A) o con la recuperación dentro (C). */
  function Invitacion() {
    var x = useTx();
    var s = useState(null), abierta = s[0], setAbierta = s[1];
    var m = useState('invita'), modo = m[0], setModo = m[1];
    useEffect(function () {
      var abrir = function (e) { var d = (e && e.detail) || {}; setAbierta({ nombre: d.nombre || null }); setModo(d.modo === 'codigo' ? 'codigo' : 'invita'); };
      window.addEventListener('pace:open-premium', abrir);
      return function () { window.removeEventListener('pace:open-premium', abrir); };
    }, []);
    if (esc === 'v1-hoja' || esc === 'v1-hoja-c') return h(HojaV1, { final: false });
    if (esc === 'v1-final') return h(HojaV1, { final: true });
    if (esc === 'v1-linea') return h(AvisoV1);
    if (!abierta) return null;
    var titulo = abierta.nombre || x.t('premium.name');
    var planes = window.paceTiendaPlanes(x.lang);
    var mes = planes.find(function (p) { return p.plan === 'mes'; }), vida = planes.find(function (p) { return p.plan === 'vida'; });
    var dias = (mes && mes.pruebaDias) || 7;
    var cuerpo;
    if (modo === 'codigo') {
      cuerpo = h('form', { onSubmit: function (e) { e.preventDefault(); } },
        h('label', { style: st.etiqueta }, x.t('premium.code.label')),
        h('input', { style: st.campo, placeholder: x.t('premium.code.placeholder'), readOnly: true }),
        h(Button, { type: 'submit', disabled: true, style: st.ancho }, x.t('premium.code.redeem')),
        h(Button, { variant: 'secondary', style: Object.assign({}, st.ancho, { marginTop: 8 }) }, x.t('premium.later')),
        esc === 'codigo-a' ? h('button', { type: 'button', 'data-pace-premium-recuperar': '', style: st.enlace }, x.t('rec.perdido')) : null);
      if (esc === 'codigo-c') {
        cuerpo = h('form', { onSubmit: function (e) { e.preventDefault(); } },
          h('p', { style: Object.assign({}, st.v1, { marginBottom: 10 }) }, x.t('rec.app.titulo')),
          h('label', { style: st.etiqueta }, x.t('rec.app.correo')),
          h('input', { style: Object.assign({}, st.campo, { fontFamily: 'var(--font-ui)' }), defaultValue: 'quien@correo.com', readOnly: true }),
          h('label', { style: st.etiqueta }, x.t('rec.app.recibo')),
          h('input', { style: st.campo, defaultValue: '2931-4470', readOnly: true }),
          h(Button, { type: 'submit', style: st.ancho }, x.t('rec.app.boton')),
          h('p', { style: st.nota }, x.t('rec.app.nota')));
      }
    } else if (esc === 'compra-b') {
      cuerpo = h(React.Fragment, null,
        h('div', { style: st.par },
          h('button', { type: 'button', style: st.plan },
            h('span', { style: st.planT }, x.t('compra.mes.t')), h('span', { style: st.planP }, mes.precio),
            h('span', { style: st.planD }, x.tn('compra.mes.d', { dias: dias }))),
          h('button', { type: 'button', style: st.plan },
            h('span', { style: st.planT }, x.t('compra.vida.t')), h('span', { style: st.planP }, vida.precio),
            h('span', { style: st.planD }, x.t('compra.vida.d')))),
        h(Button, { variant: 'secondary', style: Object.assign({}, st.ancho, { marginTop: 12 }) }, x.t('premium.later')),
        h('button', { type: 'button', style: st.enlace }, x.t('premium.code.have')));
    } else {
      cuerpo = h(React.Fragment, null,
        h('p', { style: st.v1 }, x.tn('compra.precios', { vida: vida.precio, mes: mes.precio, dias: dias })),
        h('div', { style: st.par },
          h(Button, { style: st.mitad }, x.tn('compra.probar', { dias: dias })),
          h(Button, { variant: 'secondary', style: st.mitad }, x.t('premium.later'))),
        h('p', { style: st.aviso }, x.t('compra.aviso')),
        h('button', { type: 'button', style: st.fantasma }, x.tn('compra.vida', { vida: vida.precio })),
        h('button', { type: 'button', style: Object.assign({}, st.enlace, { marginTop: 6 }) }, x.t('premium.code.have')));
    }
    return h(Modal, { open: true, onClose: function () { setAbierta(null); }, maxWidth: 440, ariaLabel: titulo },
      h('div', { 'data-pace-premium-hoja': modo },
        h(PremiumSeal),
        h('h2', { style: st.titulo }, titulo),
        h('p', { style: st.sub }, x.t('premium.part')),
        esc === 'codigo-c' ? null : h(Incluye),
        cuerpo));
  }
  window.PremiumInvitacion = Invitacion;

  /* La fila de Ajustes durante la semana de prueba. */
  var Previa = window.PremiumSection;
  window.PremiumSection = function PremiumSectionPropuesta() {
    var x = useTx();
    if (esc !== 'v1-ajustes') return h(Previa);
    return h(AjustesAccion, { derecha: h('span', { 'data-pace-licencia-estado': '', style: { color: 'var(--focus)' } }, x.tn('v1.ajustes', { fecha: fechaCorta })) }, x.t('premium.name'));
  };

  /* Después de la semana: abiertas las tres que ya hizo; las demás de pago, con su candado. */
  if (esc === 'v1-despues') {
    window.PREMIUM_ABIERTO_HASTA_V1 = false;
    var tuyas = TUYAS.map(function (p) { return p[0]; });
    var previo = window.canAccessRoutine;
    window.canAccessRoutine = function (id, o) { return tuyas.indexOf(id) !== -1 || previo(id, o); };
  }
  /* Con la tienda de la web lista: los dos Payment Links puestos (de mentira). */
  if (/^compra|^codigo/.test(esc)) {
    window.PREMIUM_ABIERTO_HASTA_V1 = false;
    window.PACE_TIENDA_WEB.enlaces = { vida: 'https://buy.stripe.com/prueba-vida', mes: 'https://buy.stripe.com/prueba-mes' };
  }
  return esc;
};
