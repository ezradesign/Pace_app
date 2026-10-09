/* PACE · las opciones de la pausa, pintadas encima de la ventana real (8 oct. 2026)
   ==============================================================================
   Lo usa fotos.js. Cada opción esconde lo que hay dentro de la ventana de la pausa (sin
   quitarlo: React sigue siendo su dueño) y pone delante su versión, con los tokens, las
   letras y los dibujos de la app: los glifos salen de sus propios componentes
   (ExerciseGlyph, ABBreathe, ABDrop, ABMeal) y los datos del día, de ritmoPlan y
   breakPropuesta. Nada de esto está en app/: es solo para que Ez elija mirándolo.

     A · Como su tarjeta: el plato es la tarjeta de su rutina en la biblioteca (papel
         tonal, filo de 3 px del módulo, capitular, línea de contexto en serif).
     B · Sin cajas: el plato entre dos filetes, y el agua y «Saltar» en una sola línea.
     C · En su color: la ventana de hoy, en el color del módulo de la rutina.

   Las tres comparten las píldoras en serif itálica (las de «Empezar foco» y «Comienza»)
   y el texto nuevo. Y ninguna enseña atajos (Ez, 8 oct.): Intro hace la pausa propuesta y
   Esc la salta; B, E, M y H siguen funcionando sin aparecer en ningún sitio. */
'use strict';

const OPCIONES = { A: 'Como su tarjeta', B: 'Sin cajas', C: 'En su color' };

const TEXTOS = {
  es: {
    tag: 'Bloque {n} de {m} · hecho', titulo: 'Tu pausa', sub: '{h} · Lo que toca ahora.',
    motivo: { estira: 'Antídoto a la silla', mueve: 'Cuerpo activo', larga: 'Pausa larga: respira y suelta',
      cierre: 'Para cerrar la jornada', respira: 'Bajar revoluciones', comida: 'Lejos de la pantalla' },
    hacer: 'Hacer la pausa', comer: 'Ir a comer', seguir: 'Seguir con el bloque {n}', comida: 'Hora de comer',
    agua: 'y un vaso de agua', conAgua: 'con un vaso de agua', hidratate: 'Hidrátate', vaso: 'un vaso ahora',
    saltar: 'Saltar esta pausa',
    modulo: { extra: 'Estira', move: 'Muévete', breathe: 'Respira', water: 'Hidrátate' },
    libreTag: 'Ciclo completado', libreTitulo: 'Pausa bien hecha', libreSub: 'Has cerrado un bloque. Elige tu pausa.',
    sentado: 'Llevas {n} minutos sentado', empezar: 'Empezar',
  },
  en: {
    tag: 'Block {n} of {m} · done', titulo: 'Your break', sub: '{h} · What comes next.',
    motivo: { estira: 'Antidote to the chair', mueve: 'Active body', larga: 'Long break: breathe and let go',
      cierre: 'To close the day', respira: 'Slow down', comida: 'Away from the screen' },
    hacer: 'Take the break', comer: 'Go and eat', seguir: 'Go on to block {n}', comida: 'Lunchtime',
    agua: 'and a glass of water', conAgua: 'with a glass of water', hidratate: 'Hydrate', vaso: 'a glass now',
    saltar: 'Skip this break',
    modulo: { extra: 'Stretch', move: 'Move', breathe: 'Breathe', water: 'Hydrate' },
    libreTag: 'Cycle complete', libreTitulo: 'Well-earned break', libreSub: "You've closed a block. Pick your break.",
    sentado: 'You have been sitting for {n} minutes', empezar: 'Start',
  },
};

/* La hoja de las tres opciones. Las píldoras calcan las de la app: «Empezar» de la vista
   previa (llena, color del módulo) y «Comienza» (papel tonal con borde). La línea de
   contexto calca .pace-lib-ctx de la biblioteca, con la cifra en EB Garamond. */
const HOJA = `
[data-opcion] { display: flex; flex-direction: column; color: var(--ink); }
[data-opcion] button { font: inherit; cursor: pointer; text-align: left; }
.op-tag { margin-bottom: 6px; }
.op-h2 { font-family: var(--font-display); font-style: italic; font-size: 32px; font-weight: 500; margin: 0; line-height: 1.1; }
.op-sub { color: var(--ink-3); font-size: 14px; margin: 6px 0 0; }
.op-motivo { font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; font-weight: 500; color: var(--c); line-height: 1.35; }
.op-nombre { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 26px; line-height: 1.12; margin: 2px 0 3px; color: var(--ink); }
.op-ctx { font-family: var(--font-display); font-style: italic; font-size: 15px; color: var(--ink-2); display: flex; flex-wrap: wrap; gap: 0 4px; align-items: baseline; line-height: 1.35; }
.op-ctx b { font-family: 'EB Garamond', Georgia, serif; font-style: normal; font-size: 19px; font-weight: 400; color: var(--ink-2); line-height: 1; }
.op-ctx u { font-family: var(--font-ui); font-style: normal; text-decoration: none; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3); margin-left: 1px; }
.op-ctx u::after, .op-ctx em:not(:last-child)::after { content: '\\B7'; color: var(--line-2); font-style: normal; margin-left: .34em; }
.op-glifo { color: var(--c); display: grid; place-items: center; line-height: 1; }
.op-glifo > svg { width: 74%; height: 74%; }
.opA-agua .op-glifo > svg, .opB-agua .op-glifo > svg, .opC-agua .op-glifo > svg { width: 22px; height: 22px; }
.op-acciones { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.op-pill { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 44px; box-sizing: border-box; padding: 0 24px;
  border-radius: var(--r-pill); font-family: var(--font-display) !important; font-style: italic; font-weight: 500; font-size: 17px; line-height: 1; white-space: nowrap; }
.op-lleno { background: var(--c); color: var(--paper); border: 1px solid var(--c); }
.op-tonal { background: var(--paper-2); color: var(--ink); border: 1px solid var(--line-2); }
.op-borde { background: transparent; color: var(--ink); border: 1px solid var(--line-2); }
.op-enlace { background: none; border: 0; padding: 10px 0; font-family: var(--font-display) !important; font-style: italic; font-size: 15px; color: var(--ink-3);
  text-decoration: underline; text-underline-offset: 3px; white-space: nowrap; }
.op-pie { display: flex; justify-content: flex-end; align-items: center; gap: 12px; }
.opB-pie { justify-content: space-between; }

/* A · como su tarjeta */
.opA-plato { --pad: 14px; background: var(--paper-2); border-radius: var(--r-md); border-left: 3px solid var(--c);
  padding: 14px 16px 14px 14px; display: grid; grid-template-columns: 60px minmax(0, 1fr); gap: 0 16px; align-items: center; }
.opA-plato .op-glifo { width: 60px; height: 60px; font-size: 42px; }
.opA-plato.sin-glifo { grid-template-columns: minmax(0, 1fr); }
.opA-agua { display: flex; align-items: center; gap: 12px; width: 100%; background: none; border: 0; border-top: 1px solid var(--line); padding: 12px 2px 4px; color: var(--ink); }
.opA-agua .op-glifo { --c: var(--hydrate); width: 22px; height: 22px; font-size: 22px; }
.opA-agua b { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 19px; }
.opA-agua span.op-mas { font-family: var(--font-display); font-style: italic; font-size: 15px; color: var(--ink-3); }
.opA-agua i { margin-left: auto; font-style: normal; color: var(--ink-3); font-size: 18px; }

/* B · sin cajas */
.opB-plato { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 18px 0; display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 0 18px; align-items: center; }
.opB-plato .op-glifo { width: 72px; height: 72px; font-size: 50px; }
.opB-plato .op-nombre { font-size: 30px; }
.opB-plato.sin-glifo { grid-template-columns: minmax(0, 1fr); }
.opB-agua { display: inline-flex; align-items: center; gap: 9px; background: none; border: 0; padding: 10px 0; font-family: var(--font-display) !important; font-style: italic; font-size: 17px; color: var(--ink-2); }
.opB-agua .op-glifo { --c: var(--hydrate); width: 18px; height: 18px; font-size: 18px; }
.opB-puertas button { background: var(--paper) !important; border-color: var(--line) !important; }

/* C · en su color */
.opC-plato { background: var(--c-soft); border: 1.5px solid var(--c); border-radius: var(--r-md); padding: 14px 16px;
  display: grid; grid-template-columns: 62px minmax(0, 1fr); gap: 0 16px; align-items: center; }
.opC-plato .op-glifo { width: 62px; height: 62px; font-size: 44px; }
.opC-plato .op-motivo { text-transform: none; letter-spacing: .03em; font-size: 12px; }
.opC-plato .op-nombre { font-size: 24px; }
.opC-plato.sin-glifo { grid-template-columns: minmax(0, 1fr); }
.opC-agua { --c: var(--hydrate); display: grid; grid-template-columns: 62px minmax(0, 1fr) auto; gap: 0 16px; align-items: center; width: 100%;
  background: var(--hydrate-soft); border: 1.5px solid var(--hydrate); border-radius: var(--r-md); padding: 10px 16px; color: var(--ink); }
.opC-agua .op-glifo { width: 62px; height: 26px; font-size: 26px; }
.opC-agua b { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 20px; }
.opC-agua span { font-family: var(--font-display); font-style: italic; font-size: 15px; color: var(--ink-2); }

/* El móvil: las dos píldoras una debajo de otra y a lo ancho, como «Empezar» en la vista previa. */
@media (max-width: 640px) {
  .op-acciones { flex-direction: column; align-items: stretch; gap: 8px; }
  .op-acciones .op-pill { width: 100%; }
  .opA-plato { grid-template-columns: 52px minmax(0, 1fr); gap: 0 14px; }
  .opA-plato .op-glifo { width: 52px; height: 52px; font-size: 38px; }
  .opB-plato { grid-template-columns: 60px minmax(0, 1fr); gap: 0 14px; padding: 14px 0; }
  .opB-plato .op-glifo { width: 60px; height: 60px; font-size: 44px; }
  .opB-plato .op-nombre { font-size: 27px; }
  .opC-plato { grid-template-columns: 52px minmax(0, 1fr); gap: 0 14px; }
  .opC-plato .op-glifo { width: 52px; height: 52px; font-size: 38px; }
  .opC-agua { grid-template-columns: 52px minmax(0, 1fr) auto; gap: 0 14px; }
  .opC-agua .op-glifo { width: 52px; }
}
`;

/* Lo que corre dentro de la página. */
function enLaPagina({ op, T, hoja }) {
  const card = document.querySelector('[data-pace-modal-card]');
  if (!card) throw new Error('no hay ventana');
  if (!document.getElementById('op-hoja')) {
    const st = document.createElement('style'); st.id = 'op-hoja'; st.textContent = hoja; document.head.appendChild(st);
  }
  const f = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  /* Un componente de la app, pintado a HTML con su propio React. */
  const html = (Comp, props) => {
    if (typeof Comp !== 'function') return '';
    const d = document.createElement('div');
    const root = ReactDOM.createRoot(d);
    ReactDOM.flushSync(() => root.render(React.createElement(Comp, props || {})));
    const out = d.innerHTML; root.unmount(); return out;
  };
  const s = getState();
  const prop = breakPropuesta(s, {});
  const plan = ritmoPlan(s);
  const conMenu = !!(prop && String(prop.porque).indexOf('ritmo.') === 0 && plan && plan.pausa);
  const COLOR = { extra: 'var(--extra)', move: 'var(--move)', breathe: 'var(--breathe)', water: 'var(--hydrate)' };
  const SUAVE = { extra: 'var(--extra-soft)', move: 'var(--move-soft)', breathe: 'var(--breathe-soft)', water: 'var(--hydrate-soft)' };
  const nombreDe = (r) => (s.lang === 'en' && window.PACE_STRINGS.en[r.id + '.name']) || r.name;

  /* EL PLATO: lo mismo en las tres, cambia el vestido. */
  let plato;
  if (conMenu && prop.porque === 'ritmo.comida') {
    plato = { c: 'var(--ink-2)', suave: 'var(--paper-2)', glifo: html(window.ABMeal), motivo: T.motivo.comida, nombre: T.comida,
      ctx: '<b>' + plan.pausa.dur + '</b><u>min</u><em>' + T.conAgua + '</em>', boton: T.comer, botonC: 'var(--focus-cta)', comida: true };
  } else if (prop && prop.rutina) {
    const r = prop.rutina;
    const glifos = prop.modulo !== 'breathe' && window.libraryGlifos ? window.libraryGlifos(r) : [];
    const glifo = glifos.length ? html(window.ExerciseGlyph, { id: glifos[0], size: matchMedia('(max-width: 640px)').matches ? 52 : 60 }) : html(window.ABBreathe);
    const motivo = conMenu ? T.motivo[prop.porque.slice(6)] : prop.porque === 'sitting' ? f(T.sentado, { n: prop.datos.n }) : null;
    const extra = conMenu && plan.pausa.agua ? '<em>' + T.agua + '</em>' : '';
    plato = { c: COLOR[prop.modulo], suave: SUAVE[prop.modulo], glifo, motivo: motivo || '', nombre: nombreDe(r),
      ctx: '<b>' + r.min + '</b><u>min</u><em>' + T.modulo[prop.modulo] + '</em>' + extra, boton: conMenu ? T.hacer : T.empezar, botonC: COLOR[prop.modulo] };
  }

  const cabeza = conMenu
    ? { tag: f(T.tag, { n: plan.hechos, m: plan.total }), titulo: T.titulo, sub: f(T.sub, { h: ritmoHora(plan.pausa.desde) }) }
    : { tag: T.libreTag, titulo: T.libreTitulo, sub: T.libreSub };
  const gota = html(window.ABDrop);

  const platoHTML = (clase, conBoton) => {
    if (!plato) return '';
    return '<div class="' + clase + (plato.glifo ? '' : ' sin-glifo') + '" style="--c:' + plato.c + ';--c-soft:' + plato.suave + '">' +
      (plato.glifo ? '<span class="op-glifo">' + plato.glifo + '</span>' : '') +
      '<div>' + (plato.motivo ? '<div class="op-motivo">' + esc(plato.motivo) + '</div>' : '') +
      '<div class="op-nombre">' + esc(plato.nombre) + '</div><div class="op-ctx">' + plato.ctx + '</div>' +
      (conBoton ? '<div class="op-acciones" style="margin-top:12px"><button class="op-pill op-lleno" style="--c:' + plato.botonC + '">' + esc(plato.boton) + '</button></div>' : '') +
      '</div></div>';
  };
  const acciones = (claseSeg) => '<div class="op-acciones" style="margin-top:16px">' +
    '<button class="op-pill op-lleno" style="--c:' + plato.botonC + '">' + esc(plato.boton) + '</button>' +
    '<button class="op-pill ' + claseSeg + '">' + esc(f(T.seguir, { n: plan.hechos + 1 })) + '</button></div>';

  let cuerpo = '<div data-pace-modal-head style="margin-bottom:var(--s-5)"><div class="pace-meta op-tag">' + esc(cabeza.tag) + '</div>' +
    '<h2 class="op-h2">' + esc(cabeza.titulo) + '</h2><p class="op-sub">' + esc(cabeza.sub) + '</p></div>';

  if (conMenu) {
    if (op === 'A') {
      cuerpo += platoHTML('opA-plato', false) + acciones('op-tonal') +
        (plato.comida ? '' : '<button class="opA-agua" style="margin-top:16px"><span class="op-glifo">' + gota + '</span><b>' + T.hidratate + '</b><span class="op-mas">· ' + T.vaso + '</span><i>›</i></button>') +
        '<div class="op-pie" style="margin-top:6px"><button class="op-enlace">' + T.saltar + '</button></div>';
    } else if (op === 'B') {
      cuerpo += platoHTML('opB-plato', false) + acciones('op-borde') +
        '<div class="op-pie opB-pie" style="margin-top:10px">' +
        (plato.comida ? '<span></span>' : '<button class="opB-agua"><span class="op-glifo">' + gota + '</span>' + T.hidratate + ' · ' + T.vaso + '</button>') +
        '<button class="op-enlace">' + T.saltar + '</button></div>';
    } else {
      cuerpo += platoHTML('opC-plato', false) + acciones('op-borde') +
        (plato.comida ? '' : '<button class="opC-agua" style="margin-top:14px"><span class="op-glifo">' + gota + '</span><b>' + T.hidratate + '</b><span>' + T.vaso + '</span></button>') +
        '<div class="op-pie" style="margin-top:8px"><button class="op-enlace">' + T.saltar + '</button></div>';
    }
  } else {
    /* Sin «A tu ritmo»: la propuesta y las cuatro puertas de siempre (las de la app,
       clonadas). Solo B las pasa a papel, como los chips de la home. */
    const puertas = card.querySelector('[data-pace-break-shortcut]').previousElementSibling.cloneNode(true);
    puertas.removeAttribute('data-pace-break-prop');
    const clasePlato = op === 'A' ? 'opA-plato' : op === 'B' ? 'opB-plato' : 'opC-plato';
    cuerpo += '<div style="margin:0 0 12px">' + platoHTML(clasePlato, true) + '</div>' +
      '<div class="' + (op === 'B' ? 'opB-puertas' : '') + '">' + puertas.outerHTML + '</div>' +
      '<div class="op-pie" style="margin-top:8px"><button class="op-enlace">' + T.saltar + '</button></div>';
  }

  const ocultos = [];
  [...card.children].forEach((el) => {
    if (el.hasAttribute('data-pace-modal-close')) return;
    ocultos.push([el, el.style.display]); el.style.display = 'none';
  });
  const caja = document.createElement('div');
  caja.setAttribute('data-opcion', op);
  caja.innerHTML = cuerpo;
  card.appendChild(caja);
  window.__paceRestaurar = () => { caja.remove(); ocultos.forEach(([el, d]) => { el.style.display = d; }); window.__paceRestaurar = null; };
}

async function pintar(page, op, caso, lang) {
  await page.evaluate(enLaPagina, { op, T: TEXTOS[lang], hoja: HOJA });
  await page.evaluate(() => document.fonts.ready);
}

module.exports = { OPCIONES, TEXTOS, pintar };
