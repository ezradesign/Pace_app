/* PACE · la PÁGINA de la ronda 4: «A tu ritmo» con salida, comida y llegar tarde (s192)
 * ====================================================================================
 * Decidido en la ronda 3: nombre «A tu ritmo», «Siguiente pausa» en la barra lateral,
 * «Hoy voy por libre», tenedor y cuchillo. Pedido para esta: «A TU RITMO» arriba y
 * «HASTA LAS …» debajo en el aro, las etiquetas de la ronda 2 (con el módulo), y
 * decidir lo pendiente —llegar tarde, cuánto dura la comida, hora de salida—
 * mirándolo.
 */
'use strict';

const { seguro } = require('./menu-s192-pagina');

const PRESETS = {
  A: [
    ['Antes de elegir', {}], ['Media jornada', { opcion: 'media' }], ['Jornada entera', { opcion: 'jornada' }],
    ['Jornada · lista abierta', { opcion: 'jornada', hoja: true }], ['Hoy voy por libre', { libre: true }],
  ],
};
/* Horario: «inicio-comida-duración-salida», en minutos. */
const MANDOS = [
  ['horario', [['540-840-60-1020', '9:00–17:00 · comes a las 14:00, 1 h'], ['480-720-30-960', '8:00–16:00 · 12:00, 30 min'],
               ['600-810-90-1140', '10:00–19:00 · 13:30, 1 h 30'], ['720-840-60-1200', '12:00–20:00 · 14:00, 1 h']]],
  ['llegada', [['0', 'Abres PACE a tu hora'], ['90', 'Hora y media después']]],
  ['tarde', [['salida', 'Salgo a mi hora'], ['horas', 'Hago mis horas'], ['pregunta', 'Que me pregunte']]],
];
const ETIQUETA = { horario: 'Horario', llegada: 'Llegas', tarde: 'Si tarde' };
const INICIAL = { preset: 2, horario: '540-840-60-1020', llegada: '0', tarde: 'salida' };

/* Del par de mandos al horario que recibe la regla. */
function horarioDe(horario, llegada) {
  const [inicio, comida, comidaDur, salida] = horario.split('-').map(Number);
  return { inicio, comida, comidaDur, salida, ahora: inicio + Number(llegada) };
}

function pagina({ css, cssMenu, calcos, vps, codigo }) {
  const datos = { css, cssMenu, codigo, calcos, vps: vps.map((p) => ({ id: p.id, w: p.w, h: p.h, movil: p.movil })),
                  presets: PRESETS, inicial: INICIAL, horarioDe: horarioDe.toString() };
  const pantallas = (movil) => vps.filter((p) => !!p.movil === movil).map((p) => `
      <figure>
        <figcaption><b>${p.w}×${p.h}</b> · ${p.movil ? 'móvil' : 'escritorio'}${p.nota ? ' · ' + p.nota : ''}</figcaption>
        <div class="marco"><iframe data-v="A" data-vp="${p.id}" width="${p.w}" height="${p.h}" title="${p.w}×${p.h}"></iframe></div>
        <div class="medida" data-medida="A-${p.id}">midiendo…</div>
      </figure>`).join('');
  const mandos = MANDOS.map(([g, vals]) => `<div class="mando"><span>${ETIQUETA[g]}</span>`
    + vals.map(([v, et]) => `<button data-ajuste="${g}" data-valor="${v}"${v === INICIAL[g] ? ' class="on"' : ''}>${et}</button>`).join('') + '</div>').join('');
  return `<!doctype html>
<html lang="es" data-palette="crema">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>A tu ritmo · ronda 4</title>
<style>
  body { margin: 0; background: var(--paper, #F2EDE0); color: var(--ink, #1F1C17); font-family: 'Inter Tight', system-ui, sans-serif; font-size: 15px; line-height: 1.5; }
  main { max-width: 1320px; margin: 0 auto; padding: 40px 24px 80px; }
  h1, h2 { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-weight: 500; }
  h1 { font-size: 44px; margin: 6px 0 12px; line-height: 1.05; }
  h2 { font-size: 30px; margin: 48px 0 8px; }
  h3 { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-3); margin: 22px 0 6px; font-weight: 500; }
  p, li { max-width: 80ch; color: var(--ink-2); }
  .ceja { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-3); }
  .gris { color: var(--ink-3); }
  .mandos { position: sticky; top: 0; z-index: 5; background: var(--paper); padding: 12px 0 10px; border-bottom: 1px solid var(--paper-3); margin: 22px 0 18px; display: grid; gap: 8px; }
  .mando { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .mando > span { width: 74px; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); }
  .mando button { font: inherit; font-size: 13px; border: 1px solid var(--line); background: var(--paper); color: var(--ink-2); border-radius: 999px; padding: 5px 13px; cursor: pointer; }
  .mando button.on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .mando button:disabled { opacity: 0.4; cursor: default; }
  figure { margin: 0 0 22px; }
  figcaption { font-size: 12px; color: var(--ink-3); margin-bottom: 6px; }
  .marco { position: relative; overflow: hidden; border: 1px solid var(--line); border-radius: 10px; background: var(--paper-2); }
  .marco iframe { border: 0; display: block; transform-origin: 0 0; background: var(--paper); }
  .fila-m { display: flex; gap: 28px; flex-wrap: wrap; align-items: flex-start; }
  .medida { font-size: 12px; margin-top: 6px; color: var(--ink-3); }
  .medida b.ko { color: #A0452B; } .medida b.ok { color: var(--focus); }
  .tres { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 8px; }
  @media (max-width: 900px) { .tres { grid-template-columns: 1fr; } }
  .opcion { border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; background: var(--paper); }
  .opcion.rec { border-color: var(--focus-cta); background: var(--focus-soft); }
  .opcion b.t { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-weight: 500; font-size: 19px; display: block; color: var(--ink); }
  .opcion p { font-size: 14px; margin: 6px 0 0; }
  .sello { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--focus-cta); }
</style>
</head>
<body>
<main>
  <div class="ceja">PACE · maqueta · s192 · ronda 4</div>
  <h1>A tu ritmo: salida, comida y llegar tarde</h1>
  <p>Con lo decidido en la ronda 3 ya puesto (nombre, «Siguiente pausa», «Hoy voy por libre», tenedor y cuchillo), esta ronda
  trae tres cambios: bajo el aro, <b>«A tu ritmo»</b> arriba y <b>«Hasta las …»</b> debajo; las etiquetas de la línea vuelven a
  decir el <b>módulo</b>; y lo pendiente, <b>pintado para decidirlo</b>: la hora de salida, cuánto dura la comida y qué pasa si llegas tarde.</p>

  <div class="mandos">
    ${mandos}
    <div class="mando"><span>Estado</span>${PRESETS.A.map(([et], i) => `<button data-preset="A" data-i="${i}"${i === INICIAL.preset ? ' class="on"' : ''}>${et}</button>`).join('')}</div>
  </div>

  <div class="fila-e">${pantallas(false)}</div>
  <div class="fila-m">${pantallas(true)}</div>

  <h2>Lo pendiente, pintado</h2>
  <h3>Hora de salida y duración de la comida</h3>
  <p>La frase del horario tiene ahora <b>cuatro horas</b>, todas editables ahí mismo: «<i>Empiezas a las 9:00, comes a las 14:00 durante
  1 h y terminas a las 17:00</i>». <b>«Jornada entera»</b> llena ese hueco hasta tu salida; las otras opciones sirven sus minutos de
  foco, pero <b>nunca pasan de tu hora de salida</b>. La comida dura entre 30 min y 2 h. Y el final del día ya no deja colas de 15 min:
  si sobra poco, se sirve en uno o en dos bloques iguales.</p>

  <h3>Si llegas tarde</h3>
  <p>Pulsa <b>«Hora y media después»</b> en los mandos: PACE se abre a las 10:30 con un horario de 9:00 a 17:00. El día empieza
  <b>ahora</b>, nunca antes, y en ningún sitio pone «tarde»: la frase dice «<i>hoy de 10:30 a 17:00</i>». Lo que cambia es qué se conserva:</p>
  <div class="tres">
    <div class="opcion rec"><span class="sello">Recomendado</span><b class="t">Salgo a mi hora</b>
      <p>El día se acorta y hoy hay menos foco. Es lo que cuida: PACE no te empuja a quedarte más. Y si hoy quieres salir más tarde,
      la hora de salida está en la misma frase, a un toque.</p></div>
    <div class="opcion"><b class="t">Hago mis horas</b>
      <p>Se sirve el foco de un día normal y la salida se mueve (con el horario de ejemplo, a las 18:40). Útil para quien cumple
      horas, pero decide por ti que hoy sales más tarde.</p></div>
    <div class="opcion"><b class="t">Que me pregunte</b>
      <p>Ese día, en lugar de la línea, dos opciones con sus números. Respeta cada caso, pero es una decisión más, y las entrevistas
      pedían justo menos.</p></div>
  </div>

  <h2>Lo que queda después de esta ronda</h2>
  <ul>
    <li><b>Qué pasa a mitad del día</b> si te saltas una pausa o paras antes: la propuesta es la misma que al llegar tarde, recolocar desde ahora.</li>
    <li><b>Llegar antes de tu hora</b>: hoy el día espera a tu inicio; podría ofrecer empezar ya.</li>
    <li><b>No está pintado</b>: inglés, modo oscuro y la pantalla de pausa cuando la propuesta viene del menú.</li>
  </ul>
</main>

<script>
const PM = ${seguro(datos)};
(function () {
  const caras = (PM.css.match(/@font-face\\s*\\{[^}]*\\}/g) || []).join('\\n');
  const raiz = (PM.css.match(/:root\\s*\\{[^}]*--paper:[^}]*\\}/) || [''])[0];
  const st = document.createElement('style'); st.textContent = caras + '\\n' + raiz; document.head.appendChild(st);

  const horarioDe = new Function('return ' + PM.horarioDe)();
  const aj = { horario: PM.inicial.horario, llegada: PM.inicial.llegada, tarde: PM.inicial.tarde };
  const attrs = (a) => a.map(([k, v]) => k + '="' + String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"').join(' ');
  const srcdoc = (vp) => {
    const c = PM.calcos[vp.id];
    const cfg = { id: 'A-' + vp.id, movil: vp.movil, horario: horarioDe(aj.horario, aj.llegada), tarde: aj.tarde,
                  estado: PM.presets.A[PM.inicial.preset][1] };
    return '<!doctype html><html ' + attrs(c.htmlAttrs) + '><head><meta charset="utf-8"><style>' + PM.css + '</style><style>' + PM.cssMenu
      + '</style></head><body ' + attrs(c.bodyAttrs) + '>' + c.html + '<scr' + 'ipt>' + PM.codigo + '\\npmMontar(' + JSON.stringify(cfg) + ');</scr' + 'ipt></body></html>';
  };
  const marcos = Array.from(document.querySelectorAll('iframe[data-vp]'));
  const escalar = () => marcos.forEach((f) => {
    const vp = PM.vps.find((p) => p.id === f.dataset.vp);
    const disp = f.parentElement.parentElement.parentElement.clientWidth;
    const k = vp.movil ? 1 : Math.min(1, disp / vp.w);
    f.style.transform = 'scale(' + k + ')';
    f.parentElement.style.width = vp.w * k + 'px';
    f.parentElement.style.height = vp.h * k + 'px';
  });
  marcos.forEach((f) => { f.srcdoc = srcdoc(PM.vps.find((p) => p.id === f.dataset.vp)); });
  escalar();
  addEventListener('resize', escalar);
  const enviar = (msg) => marcos.forEach((f) => f.contentWindow.postMessage(msg, '*'));
  const marcar = (sel, b) => document.querySelectorAll(sel).forEach((x) => x.classList.toggle('on', x === b));
  /* «Si tarde» no significa nada si llegas a tu hora: se atenúa, no se esconde. */
  const atenuar = () => document.querySelectorAll('[data-ajuste="tarde"]').forEach((x) => { x.disabled = aj.llegada === '0'; });
  atenuar();

  document.querySelectorAll('[data-ajuste]').forEach((b) => b.onclick = () => {
    const g = b.dataset.ajuste;
    aj[g] = b.dataset.valor;
    marcar('[data-ajuste="' + g + '"]', b);
    atenuar();
    if (g === 'tarde') enviar({ pmAjustes: { tarde: aj.tarde } });
    else enviar({ pmHorario: horarioDe(aj.horario, aj.llegada) });
  });
  document.querySelectorAll('[data-preset]').forEach((b) => b.onclick = () => {
    marcar('[data-preset]', b);
    enviar({ pmEstado: PM.presets.A[+b.dataset.i][1] });
  });

  const bien = (ok, t) => '<b class="' + (ok ? 'ok' : 'ko') + '">' + t + '</b>';
  addEventListener('message', (ev) => {
    const m = ev.data;
    if (!m || !m.pm) return;
    const el = document.querySelector('[data-medida="' + m.pm + '"]');
    if (!el) return;
    const partes = [bien(m.scroll === 0, m.scroll === 0 ? 'la home cabe sin scroll' : 'la home pide ' + m.scroll + ' px de scroll')];
    if (m.alto !== null) partes.push('panel de ' + m.alto + ' px');
    if (m.solapes || m.fuera) partes.push(bien(false, m.solapes + ' etiquetas se pisan · ' + m.fuera + ' se salen'));
    if (m.desborde) partes.push(bien(false, 'el panel desborda ' + m.desborde + ' px'));
    if (m.glifos !== 4) partes.push(bien(false, 'solo ' + m.glifos + ' de 4 glifos calcados'));
    if (m.hojaScroll !== null) partes.push('lista: ' + (m.hojaScroll ? m.hojaScroll + ' px más con scroll' : 'cabe entera'));
    el.innerHTML = partes.join(' · ');
    el.dataset.json = JSON.stringify(m);
  });
})();
</script>
</body>
</html>`;
}

module.exports = { pagina, PRESETS, MANDOS, INICIAL, horarioDe };
