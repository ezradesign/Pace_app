/* PACE · la PÁGINA de la maqueta del «menú del día» (s192 · ronda 1)
 * ===================================================================
 * Autocontenida (se abre con doble clic): el CSS de la app va UNA vez en una cadena y
 * cada pantalla es un iframe `srcdoc` que se monta en el navegador con ese CSS, su
 * calco y el componente. Las medidas llegan de cada iframe por `postMessage`.
 */
'use strict';

const seguro = (v) => JSON.stringify(v).replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '<\\!--');

const PRESETS = {
  A: [
    ['Antes de elegir', {}], ['Una hora', { opcion: '1h' }], ['Dos horas', { opcion: '2h' }],
    ['Media jornada', { opcion: 'media' }], ['Jornada entera', { opcion: 'jornada' }],
    ['Jornada · lista abierta', { opcion: 'jornada', hoja: true }], ['Por libre', { libre: true }],
  ],
  B: [
    ['Cerrado', {}], ['Pregunta abierta', { hoja: true }],
    ['Jornada elegida', { hoja: true, opcion: 'jornada' }], ['Jornada empezada', { opcion: 'jornada', empezada: true }],
  ],
};

function marcas(foto) {
  const n = { paraAhora: 1, actividades: 2, camino: 3 };
  return Object.keys(n).filter((k) => foto.rects[k]).map((k) => {
    const r = foto.rects[k];
    return `<div class="marca" style="left:${(r.x / foto.w) * 100}%;top:${(r.y / foto.h) * 100}%;width:${(r.w / foto.w) * 100}%;height:${(r.h / foto.h) * 100}%"><b>${n[k]}</b></div>`;
  }).join('');
}

function tablaRegla(m, hora) {
  return '<table class="regla"><thead><tr><th>Hora</th><th>Qué</th><th>Por qué</th></tr></thead><tbody>'
    + m.items.map((it) => {
      const que = it.tipo === 'foco' ? `Foco · ${it.dur} min <span class="gris">(${it.n} de ${it.de})</span>`
        : it.tipo === 'comida' ? 'Comida · una hora lejos de la pantalla'
        : it.platos.map((p) => `<i>${p.nombre}</i> <span class="gris">${p.min} min</span>`).join(' + ');
      const porque = it.tipo === 'foco' ? '' : it.tipo === 'comida' ? 'Un vaso' : it.motivo + (it.agua ? ' · un vaso' : '');
      return `<tr class="${it.tipo}"><td>${hora(it.desde)}</td><td>${que}</td><td class="gris">${porque}</td></tr>`;
    }).join('') + '</tbody></table>';
}

function seccion(v, titulo, texto, vps) {
  const botones = PRESETS[v].map(([et, est], i) => `<button data-preset="${v}" data-i="${i}"${i === 0 ? ' class="on"' : ''}>${et}</button>`).join('');
  const pantallas = (grupo) => vps.filter((p) => (grupo === 'e') === !p.movil).map((p) => `
      <figure class="${p.movil ? 'movil' : 'escritorio'}">
        <figcaption><b>${p.w}×${p.h}</b> · ${p.movil ? 'móvil' : 'escritorio'}${p.nota ? ' · ' + p.nota : ''}</figcaption>
        <div class="marco" data-marco="${v}-${p.id}"><iframe data-v="${v}" data-vp="${p.id}" width="${p.w}" height="${p.h}" title="${titulo} · ${p.w}×${p.h}"></iframe></div>
        <div class="medida" data-medida="${v}-${p.id}">midiendo…</div>
      </figure>`).join('');
  return `
  <section id="sec-${v}">
    <h2>${titulo}</h2>
    ${texto}
    <div class="presets">${botones}</div>
    <div class="fila-e">${pantallas('e')}</div>
    <div class="fila-m">${pantallas('m')}</div>
  </section>`;
}

function pagina({ css, cssMenu, calcos, vps, fotos, codigo, jornada, media, hora }) {
  const datos = { css, cssMenu, codigo, calcos, vps: vps.map((p) => ({ id: p.id, w: p.w, h: p.h, movil: p.movil })), presets: PRESETS };
  return `<!doctype html>
<html lang="es" data-palette="crema">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Menú del día · ronda 1</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; background: var(--paper, #F2EDE0); color: var(--ink, #1F1C17); font-family: 'Inter Tight', system-ui, sans-serif; font-size: 15px; line-height: 1.5; }
  main { max-width: 1320px; margin: 0 auto; padding: 40px 24px 80px; }
  h1, h2 { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-weight: 500; letter-spacing: -0.01em; }
  h1 { font-size: 44px; margin: 6px 0 12px; line-height: 1.05; }
  h2 { font-size: 30px; margin: 56px 0 8px; }
  h3 { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-3); margin: 26px 0 8px; font-weight: 500; }
  p, li { max-width: 78ch; color: var(--ink-2); }
  .ceja { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-3); }
  .gris { color: var(--ink-3); }
  code { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12.5px; background: var(--paper-2); padding: 1px 5px; border-radius: 4px; }
  .aviso { border-left: 3px solid var(--focus-cta); background: var(--focus-soft); padding: 12px 16px; border-radius: 0 8px 8px 0; max-width: 78ch; }
  .presets { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0 14px; position: sticky; top: 0; z-index: 5; background: var(--paper); padding: 10px 0; }
  .presets button, .util button { font: inherit; font-size: 13px; border: 1px solid var(--line); background: var(--paper); color: var(--ink-2); border-radius: 999px; padding: 6px 14px; cursor: pointer; }
  .presets button.on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .util { display: flex; gap: 8px; align-items: center; font-size: 13px; color: var(--ink-3); }
  figure { margin: 0 0 22px; }
  figcaption { font-size: 12px; color: var(--ink-3); margin-bottom: 6px; }
  .marco { position: relative; overflow: hidden; border: 1px solid var(--line); border-radius: 10px; background: var(--paper-2); box-shadow: 0 1px 3px rgba(31,28,23,.06); }
  .marco iframe { border: 0; display: block; transform-origin: 0 0; background: var(--paper); }
  body.real .marco { overflow: auto; }
  .fila-m { display: flex; gap: 28px; flex-wrap: wrap; align-items: flex-start; }
  .medida { font-size: 12px; margin-top: 6px; color: var(--ink-3); }
  .medida b.ko { color: #A0452B; } .medida b.ok { color: var(--focus); }
  .hoy { display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start; }
  .foto { position: relative; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
  .foto img { display: block; width: 100%; height: auto; }
  .marca { position: absolute; border: 2px solid #A0452B; border-radius: 10px; }
  .marca b { position: absolute; left: -12px; top: -12px; width: 24px; height: 24px; border-radius: 50%; background: #A0452B; color: #fff; font-size: 13px; display: grid; place-items: center; }
  ol.leyenda li { margin: 4px 0; }
  table { border-collapse: collapse; font-size: 13.5px; margin: 8px 0; }
  th, td { text-align: left; padding: 6px 14px 6px 0; border-bottom: 1px solid var(--paper-3); vertical-align: top; }
  th { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); font-weight: 500; }
  table.regla tr.foco td { color: var(--ink-3); font-size: 12.5px; padding-top: 3px; padding-bottom: 3px; }
  table.regla i { font-family: 'EB Garamond', Georgia, serif; font-size: 16px; color: var(--ink); }
  .dos { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
  @media (max-width: 900px) { .dos { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<main>
  <div class="ceja">PACE · maqueta · s192 · ronda 1</div>
  <h1>Menú del día</h1>
  <p>Las entrevistas dijeron lo mismo que los beta testers: el problema no es que falte contenido, es <b>elegir</b>.
  Hoy la home abre cuatro puertas a 51 rutinas, un Camino sugerido y, en la barra lateral, otra sugerencia más.
  Aquí PACE hace <b>una sola pregunta</b> —<i>¿cuánto trabajas hoy?</i>— y sirve la jornada: los bloques de foco y,
  entre ellos, pausas con nombre, duración y motivo. La carta completa sigue debajo, a un toque.</p>
  <p class="aviso"><b>Cómo mirarla.</b> Cada pantalla es la app <b>calcada</b> (su HTML y su CSS reales, con el reloj
  fijo a un jueves a las 9:00), no un dibujo: se puede pulsar. Toca una pausa de la línea o «Otra» para cambiarla.
  Los botones de cada sección ponen todas sus pantallas en el mismo estado. Debajo de cada una, lo que mide.</p>
  <div class="util"><button id="real">Tamaño real</button><span id="escala-nota">Las pantallas de escritorio van escaladas para caber.</span></div>

  <h2>Dónde vive hoy</h2>
  <p>Tres recomendadores que no se hablan entre sí (y un cuarto que solo sale al terminar un bloque):</p>
  <div class="hoy">
    ${fotos.map((f) => `<figure style="width:${f.movil ? 300 : 820}px"><figcaption><b>${f.w}×${f.h}</b> · la app de hoy (v0.121.0)</figcaption>
      <div class="foto"><img src="${f.png}" alt="Home actual a ${f.w}×${f.h}">${marcas(f)}</div></figure>`).join('')}
  </div>
  <ol class="leyenda">
    <li><b>«Para ahora»</b> — barra lateral (en móvil, dentro del cajón): una rutina suelta que rota por día.</li>
    <li><b>«Actividades»</b> — la carta: cuatro puertas a Respira (20), Estira (17), Mueve (14) e Hidrátate.</li>
    <li><b>«Camino sugerido»</b> — un Camino elegido por la hora del día.</li>
    <li class="gris">La <b>propuesta de la pausa</b> (s187) — sale al acabar un bloque; no se ve en la home.</li>
  </ol>

  ${seccion('A', 'A · El menú manda', `
    <p>La pregunta ocupa el sitio de <b>Actividades</b> y del <b>Camino sugerido</b>. Al elegir, el aro pasa a
    «Bloque 1 de N» con su duración, y «Para ahora» anuncia la primera pausa: los tres recomendadores pasan a ser uno.
    «Ver la carta» y «Hoy voy por libre» devuelven la home de siempre, con un enlace para volver al menú.</p>
    <p class="gris">Cambia la jerarquía que fijó la auditoría (§5.1 pedía un «Déjate guiar» discreto que no tocara la home).</p>`, vps)}

  ${seccion('B', 'B · Discreto', `
    <p>La home no cambia. Un enlace junto a «Ver caminos» abre la pregunta en un <b>modal</b> (escritorio) o en una
    <b>hoja</b> (móvil). Al empezar, el enlace dice hasta qué hora va tu jornada, el aro pasa a «Bloque 1 de N» y
    «Para ahora» anuncia la primera pausa.</p>
    <p class="gris">Respeta la auditoría tal cual, pero la carta sigue siendo lo primero que se ve.</p>`, vps)}

  <h2>La regla que sirve el menú</h2>
  <div class="dos">
    <div>
      <h3>Cómo se compone</h3>
      <ol>
        <li><b>Bloques</b>: 1 h → 2 de 25 min · 2 h → 3 de 35 · media jornada → 4 de 45 · jornada → 8 de 45 con una hora de comida en medio.</li>
        <li><b>Tras el 3.er bloque</b> de cada media jornada, pausa larga (15 min): <b>Respira + Estira</b>.</li>
        <li><b>La 2.ª pausa</b> de cada media jornada: <b>Mueve</b>.</li>
        <li><b>Las demás</b>: <b>Estira</b>, el antídoto a la silla (lo mismo que ya propone la pausa desde s187).</li>
        <li><b>Un vaso</b> en cada pausa, en la comida y en el cierre: la jornada entera suma <b>8</b>, la meta por defecto.</li>
        <li><b>Cierre</b>: una respiración corta. <b>Ninguna rutina se repite</b> en el día.</li>
      </ol>
      <p>Las rutinas son <b>reales y gratuitas</b>, y caben junto a la mesa: sin suelo, sin material obligatorio y sin aviso
      de seguridad. Medido sobre el catálogo vivo: quedan <b>6 de Estira, 4 de Mueve y 12 de Respira</b>. Con premium el pozo crece.</p>
      <p class="gris">En la app, la rutina concreta la elegiría <code>libraryParaAhora</code>, como ya hacen la pausa y
      «Para ahora»: no nace un cuarto recomendador, se juntan los tres.</p>
    </div>
    <div>
      <h3>Jornada entera, desde las 9:00</h3>
      ${tablaRegla(jornada, hora)}
    </div>
  </div>

  <h2>Lo que esta ronda no decide</h2>
  <ul>
    <li><b>Qué pasa si te saltas una pausa o empiezas tarde.</b> La propuesta: el menú se recoloca desde la hora real, sin marcar nada como fallado.</li>
    <li><b>El contexto</b> («Junto a la mesa · Sin material») está fijo. En la app saldría del onboarding contextual (Fase 8) y se podría editar.</li>
    <li><b>La pregunta.</b> «¿Cuánto trabajas hoy?» es una hipótesis; la alternativa es «¿Cuánto tiempo tienes?», que mezcla trabajo y pausa.</li>
    <li><b>El calendario</b> queda fuera: esta ronda solo pregunta. Si la gente usa la pregunta, el calendario la automatiza después.</li>
    <li><b>Stats y el registro de eventos</b>: dónde se guarda el menú y cómo se cuenta (Stats está aparcado).</li>
    <li><b>No está pintado</b>: inglés, modo oscuro ni la pantalla de pausa cuando la propuesta viene del menú.</li>
    <li class="gris">Media jornada de ejemplo: ${media.items.filter((i) => i.platos).map((i) => hora(i.desde) + ' ' + i.platos.map((p) => p.nombre).join(' + ')).join(' · ')}.</li>
  </ul>
</main>

<script>
const PM = ${seguro(datos)};
(function () {
  /* Fuentes y tokens del CSS de la app, también para esta página. */
  const caras = (PM.css.match(/@font-face\\s*\\{[^}]*\\}/g) || []).join('\\n');
  const raiz = (PM.css.match(/:root\\s*\\{[^}]*--paper:[^}]*\\}/) || [''])[0];
  const st = document.createElement('style'); st.textContent = caras + '\\n' + raiz; document.head.appendChild(st);

  const attrs = (a) => a.map(([k, v]) => k + '="' + String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"').join(' ');
  const srcdoc = (vp, v) => {
    const c = PM.calcos[vp.id];
    const cfg = { id: v + '-' + vp.id, variante: v, movil: vp.movil, inicio: 540 };
    return '<!doctype html><html ' + attrs(c.htmlAttrs) + '><head><meta charset="utf-8"><style>' + PM.css + '</style><style>' + PM.cssMenu
      + '</style></head><body ' + attrs(c.bodyAttrs) + '>' + c.html + '<scr' + 'ipt>' + PM.codigo + '\\npmMontar(' + JSON.stringify(cfg) + ');</scr' + 'ipt></body></html>';
  };

  const marcos = Array.from(document.querySelectorAll('iframe[data-vp]'));
  const escalar = () => {
    const real = document.body.classList.contains('real');
    marcos.forEach((f) => {
      const vp = PM.vps.find((p) => p.id === f.dataset.vp);
      const caja = f.parentElement;
      const disp = caja.parentElement.parentElement.clientWidth;
      const k = real || vp.movil ? 1 : Math.min(1, disp / vp.w);
      f.style.transform = 'scale(' + k + ')';
      caja.style.width = (real ? Math.min(vp.w, disp) : vp.w * k) + 'px';
      caja.style.height = (vp.h * k) + 'px';
    });
  };
  marcos.forEach((f) => { f.srcdoc = srcdoc(PM.vps.find((p) => p.id === f.dataset.vp), f.dataset.v); });
  escalar();
  addEventListener('resize', escalar);
  document.getElementById('real').onclick = (e) => {
    document.body.classList.toggle('real');
    e.target.textContent = document.body.classList.contains('real') ? 'Escalar para caber' : 'Tamaño real';
    escalar();
  };

  document.querySelectorAll('[data-preset]').forEach((b) => b.onclick = () => {
    const v = b.dataset.preset, est = PM.presets[v][+b.dataset.i][1];
    document.querySelectorAll('[data-preset="' + v + '"]').forEach((x) => x.classList.toggle('on', x === b));
    marcos.filter((f) => f.dataset.v === v).forEach((f) => f.contentWindow.postMessage({ pmEstado: est }, '*'));
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
    else if (m.alto !== null && m.estado.opcion && !m.estado.hoja) partes.push(bien(true, 'ninguna etiqueta se pisa'));
    if (m.desborde) partes.push(bien(false, 'el panel desborda ' + m.desborde + ' px'));
    if (m.hojaScroll !== null) partes.push('lista: ' + (m.hojaScroll ? m.hojaScroll + ' px más con scroll' : 'cabe entera'));
    el.innerHTML = partes.join(' · ');
    el.dataset.json = JSON.stringify(m);
  });
})();
</script>
</body>
</html>`;
}

module.exports = { pagina, PRESETS, seguro, tablaRegla };
