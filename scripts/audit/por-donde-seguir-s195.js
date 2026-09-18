/* PACE · «Por dónde seguir» después de v0.125.1 (s195)
 * =====================================================
 * El usuario pidió «un html para verlo gráficamente» a dos preguntas: por dónde
 * seguir, y dónde se dice el tema de la semana. Regla de s194: el usuario decide
 * con una PÁGINA —mapa, una ficha por opción, bocetos de lo ambiguo y una lista
 * de decisiones con letras al final—. Y la de s173: lo existente se CALCA de la
 * app, no se dibuja a mano.
 *
 * Las fotos de «dónde se dice» salen del artefacto real a 1536×704 (el viewport
 * del usuario), lunes 14 de septiembre a las 9:00 (semana ISO 38, tema «Caderas y
 * piernas» según la regla de semana-s194.js), inyectando la frase en el DOM con
 * las clases de la app. El estilo de la página es el de por-donde-seguir-s194.html
 * (se copia su <style>).
 *
 * Uso: node .claude/static-server.js   (aparte, puerto 8765)
 *      node scripts/audit/por-donde-seguir-s195.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));

const BASE = process.env.PACE_BASE || 'http://localhost:8765';
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'por-donde-seguir-s195.html');
const ESTILO = fs.readFileSync(path.join(ROOT, 'docs', 'proposals', 'por-donde-seguir-s194.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];

const SEMILLA = {
  firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema',
  profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 },
  ritmo: { dia: { fecha: '2026-09-14', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } },
};
const TEMA = 'Caderas y piernas';
const MOTIVO = 'la silla las acorta; esta semana se alargan';
const LINEA = '<b style="font-weight:500;color:var(--ink)">Semana 38 · ' + TEMA + '</b>, ' + MOTIVO + ' · hoy, arrancar';

const uri = (buf) => 'data:image/png;base64,' + buf.toString('base64');

/* Inyecta la frase donde diga `donde` (A · B · C, acumulativas) y fotografía. */
async function foto(b, donde) {
  const ctx = await b.newContext({ viewport: { width: 1536, height: 704 }, deviceScaleFactor: 1, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block' });
  await ctx.addInitScript((s) => localStorage.setItem('pace.state.v2', JSON.stringify(s)), SEMILLA);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-09-14T09:00:00+02:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  /* SIN esperar a document.fonts.ready desde fuera: medido, esa espera deja las etiquetas de la
     línea en tres niveles (zona 122 px, aro 308) cuando el estado asentado es de dos (107, 325).
     Con 1,5 s de reloj de pared la página llega sola al estado asentado; se comprueba abajo. */
  await page.waitForTimeout(1500);
  await page.evaluate(({ t, donde, tema }) => {
    /* A · la línea bajo la cabecera, en el sitio de la frase de la primera vez */
    document.querySelectorAll('.pace-rt-panel[data-pace-ritmo-estado="menu"]').forEach((panel) => {
      const cab = panel.querySelector('.pace-rt-cab');
      const d = document.createElement('div'); d.className = 'pace-rt-sub pace-rt-como';
      d.innerHTML = t; cab.insertAdjacentElement('afterend', d);
      const como = panel.querySelector('[data-pace-ritmo-como]'); if (como) como.remove();
    });
    /* B · además, bajo «HASTA LAS 17:00» en el rótulo del aro (sube 15 px más para que el panel no se mueva) */
    if (donde === 'B') {
      document.querySelectorAll('.pace-rt-rotulo').forEach((r) => {
        const h = r.querySelector('.pace-rt-hasta'); if (!h) return;
        const d = document.createElement('div'); d.className = 'pace-rt-hasta'; d.textContent = 'Semana 38 · ' + tema;
        h.insertAdjacentElement('afterend', d);
        r.style.marginTop = '-30px';
      });
    }
    /* C · además, en la tarjeta «Siguiente pausa» de la barra lateral */
    if (donde === 'C') {
      const acc = document.querySelector('[data-pace-sidebar-accion]');
      const meta = acc && acc.querySelector('p');
      if (meta) {
        const d = meta.cloneNode(false); d.textContent = 'Semana 38 · ' + tema + ' · hoy, arrancar'; d.style.marginTop = '2px';
        meta.insertAdjacentElement('afterend', d);
      }
    }
  }, { t: LINEA, donde, tema: TEMA });
  await page.waitForTimeout(600);
  const png = await page.screenshot({ type: 'png' });
  const m = await page.evaluate(() => {
    const q = (s) => Array.from(document.querySelectorAll(s)).find((e) => e.getBoundingClientRect().width > 0);
    const body = q('[data-pace-home-body]');
    return { scroll: body.scrollHeight - body.clientHeight, panelTop: Math.round(q('[data-pace-ritmo-estado="menu"]').getBoundingClientRect().top), D: getComputedStyle(document.documentElement).getPropertyValue('--pace-timer-d').trim(), zona: q('[data-pace-ritmo-estado="menu"]').querySelector('.pace-rt-zona').style.height };
  });
  await ctx.close();
  const rec = { A: { left: 300, top: 420, width: 1236, height: 284 }, B: { left: 300, top: 330, width: 1236, height: 374 }, C: { left: 0, top: 330, width: 1536, height: 374 } }[donde];
  return { entera: uri(png), recorte: uri(await sharp(png).extract(rec).png().toBuffer()), recW: rec.width, m };
}

/* ------------------------------------------------------------------ la página */
const TEMAS6 = ['Cuello y hombros', 'Caderas y piernas', 'Manos y muñecas', 'Espalda y postura', 'El aire', 'Ligera'];
const TEMAS4 = ['Cuello y hombros', 'Caderas y piernas', 'Espalda y postura', 'El aire'];
const chipsSemanas = (temas, desde, n) => {
  let h = '<div class="chips">';
  for (let i = 0; i < n; i++) {
    const s = desde + i;
    const t = temas.length ? temas[(s - 1) % temas.length] : '—';
    h += '<span class="chip' + (i === 0 ? ' hoy' : '') + '"><i>S' + s + '</i>' + t + '</span>';
  }
  return h + '</div>';
};
/* una mini línea del día: paradas con color, la larga como píldora */
const tira = (paradas, opts) => {
  opts = opts || {};
  let h = '<div class="tira mini">';
  paradas.forEach((p, i) => {
    h += '<div class="s' + (i === 0 && opts.ahora ? ' a' : '') + '" style="flex:' + (p.foco || 45) + ' 1 0"></div>';
    if (p.tipo === 'comida') h += '<div class="s com" style="flex:60 1 0"></div>';
    else h += '<div class="p' + (p.larga ? ' larga' : '') + (p.on ? ' on' : '') + '" style="--c:' + p.c + '" title="' + (p.n || '') + '"></div>';
  });
  h += '<div class="s" style="flex:45 1 0"></div></div>';
  return h;
};
const C = { extra: 'var(--extra)', move: 'var(--move)', breathe: 'var(--breathe)' };
const DIA_BASE = [{ c: C.extra }, { c: C.move }, { c: C.breathe }, { c: C.extra, larga: true }, { tipo: 'comida' }, { c: C.extra }, { c: C.move }, { c: C.breathe, larga: true }, { c: C.breathe }];

function pagina(F) {
  const fichaRuta = (sello, titulo, que, ahora, coste, riesgo, rec) => `
    <div class="tarjeta${rec ? ' rec' : ''}">
      <span class="sello${rec ? '' : ' gris'}">${sello}</span>
      <span class="t">${titulo}</span>
      <dl class="ficha">
        <dt>Qué verías</dt><dd>${que}</dd>
        <dt>Por qué ahora</dt><dd>${ahora}</dd>
        <dt>Coste</dt><dd>${coste}</dd>
        <dt>Riesgo</dt><dd>${riesgo}</dd>
      </dl>
    </div>`;
  const fotoBloque = (letra, titulo, texto, f) => `
    <div class="tarjeta foto">
      <span class="sello gris">Dónde se dice · <kbd>${letra}</kbd></span>
      <span class="t">${titulo}</span>
      <p>${texto}</p>
      <img class="rec" style="max-width:${f.recW}px" src="${f.recorte}" alt="${titulo}, recorte a tamaño real">
      <details><summary>La pantalla entera (1536×704)</summary><img src="${f.entera}" alt="${titulo}, pantalla entera"></details>
      <p class="pie">Medido en la foto: scroll ${f.m.scroll} px · aro ${f.m.D} · el panel empieza en ${f.m.panelTop} px.</p>
    </div>`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Por dónde seguir · después de v0.125.1</title>
${ESTILO.replace('</style>', `
  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .chip { border: 1px solid var(--line); border-radius: 999px; padding: 4px 11px 4px 8px; font-size: 13px; color: var(--ink-2); background: var(--paper); white-space: nowrap; }
  .chip i { font-style: normal; font-size: 10px; letter-spacing: 0.1em; color: var(--ink-3); margin-right: 6px; }
  .chip.hoy { border-color: var(--focus-cta); background: var(--focus-soft); color: var(--ink); }
  .tira.mini { height: 22px; margin: 8px 0 4px; }
  .tira.mini .p { width: 14px; height: 14px; margin: 0 1px; }
  .tira.mini .p.larga { width: 26px; border-radius: 7px; }
  .cinco { display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 10px; margin-top: 12px; }
  @media (max-width: 820px) { .cinco { grid-template-columns: minmax(0,1fr); } }
  .cinco .dia { text-align: left; padding: 10px 12px; }
  .cinco .dia .h { font-size: 17px; margin: 0; }
  .cinco .dia p { font-size: 12px; margin: 4px 0 0; color: var(--ink-3); max-width: none; }
  .foto img { display: block; width: 100%; height: auto; border: 1px solid var(--line); border-radius: 8px; margin-top: 10px; }
  .foto details { margin-top: 8px; }
  .foto summary { cursor: pointer; font-size: 13px; color: var(--ink-3); }
  .recom { border-left: 3px solid var(--focus-cta); padding: 4px 0 4px 16px; margin: 18px 0 0; }
  .recom p { margin: 4px 0; }
</style>`)}
</head>
<body>
<main>
  <div class="ceja">PACE · por dónde seguir · después de v0.125.1</div>
  <h1>Lo que hay, lo que falta y en qué orden</h1>
  <p>v0.125.1 cierra lo que viste en tu captura (la barra rayada, «AHORA» pisando el resumen) y un scroll de la luz que
  nadie veía. Lo que sigue en el aire es <b>la pieza 3 del norte</b>: el menú que cambia con la semana. Esta página
  pone las cuatro rutas posibles una al lado de otra, y para la semana <b>enseña</b> —con fotos de la app real a tu
  viewport— cada cosa que hay que decidir. Al final, la lista con letras para contestar en una línea.</p>

  <h2>Dónde estamos</h2>
  <div class="tres">
    <div class="tarjeta hecha"><span class="sello gris">Hecho · s194</span><span class="t">El origen y recolocar</span>
      <p>Cada sesión dice de dónde vino (aro · pausa · biblioteca · barra lateral · parada · camino). Y si empiezas un bloque
      tarde, el resto del día se recompone desde ahora; llegar antes es empezar.</p></div>
    <div class="tarjeta hecha"><span class="sello gris">Hecho · s195</span><span class="t">Lo que viste esta tarde</span>
      <p>El hueco del retraso tenía la caja de la píldora (un nombre de clase repetido), «AHORA» pisaba el resumen cada
      tarde en todos los viewports, y la luz hacía 46–52 px de scroll con la rueda. Los tres, con su test y su control.</p></div>
    <div class="tarjeta"><span class="sello">Pendiente de ti</span><span class="t">El hilo de la semana</span>
      <p>La maqueta <code>semana-r1.html</code> está enviada desde s194 y sin decidir. Aquí abajo, cada decisión con su dibujo
      o su foto, para no tener que volver a ella.</p></div>
  </div>

  <h2>Las cuatro rutas</h2>
  <p>No se excluyen todas entre sí: la segunda (usarla un día) es lo único que nadie puede hacer por ti, y cabe
  <b>en paralelo</b> con cualquiera de las otras.</p>
  <div class="dos">
    ${fichaRuta('Ruta 1 · recomendada', 'La semana: el menú cambia con el día', 'Bajo la cabecera del menú, una línea: «Semana 38 · Caderas y piernas, la silla las acorta; esta semana se alargan · hoy, arrancar». Y el menú de cada día responde a eso: la región líder manda en más pausas, el lunes arranca con Mueve, el miércoles la larga llega antes, el jueves antes de comer se respira, el viernes cierra suave. Dos semanas seguidas dan 13 platos distintos cada una (medido en s194).', 'Es el norte que dijiste («propuestas para cada día de la semana/mes») y la lectura A es la barata: no necesita datos, solo la fecha. El origen (s194) ya está grabando para poder medir después si funciona.', 'Una sesión larga: la regla (tema × acento × la regla del día, pura y asertable), el motivo visible, un spec nuevo, un banco de mutantes, y las decisiones de abajo.', 'Que la variedad parezca arbitraria si el motivo no se ve — por eso la línea. Y que una semana «pida suelo» o material: los pozos se filtran igual que hoy (junto a la mesa, gratis).', true)}
    ${fichaRuta('Ruta 2 · en paralelo', 'Usarla tú un día entero', 'Nada nuevo: tú usas «A tu ritmo» una jornada de verdad, con la línea moviéndose, y apuntas lo que chirría. En diez minutos encontraste tres cosas que 260 tests no veían; una jornada dará la cola de verdad.', 'Nadie lo ha usado todavía en una jornada real con recolocar. Cada pieza nueva que se ponga encima hereda lo que chirríe.', 'Cero para mí; una tarde para ti. Lo que salga se arregla como hoy: reproducir, medir, arreglar, test.', 'Ninguno. El único coste es que si se hace después de la semana, habrá más cosas encima.', false)}
    ${fichaRuta('Ruta 3', 'Los huecos pequeños del menú', 'El modo oscuro del panel, del hueco punteado y del resumen (hoy no está pensado) · el cierre del día nunca es «Ahora» (al acabar el último bloque el día se cierra sin ofrecer el cierre) · la pausa larga propone UN plato cuando lleva dos. (Uno más salió haciendo esta página y ya está cerrado en v0.125.2: las etiquetas de la línea no se recolocaban al llegar la fuente.)', 'Son defectos conocidos y acotados; no dependen de nada.', 'Una sesión corta. Cada uno con su test.', 'Bajo. El del cierre toca <code>ritmoPlan</code> (cuándo «terminado»), que hoy vigila la suite.', false)}
    ${fichaRuta('Ruta 4', 'La deuda: cuatro archivos al límite', '<code>MoveSessionV1.jsx</code> en 500 · <code>ritmo.spec.js</code> en 465 · <code>_responsive.atmosfera.js</code> en 500 · <code>_responsive.js</code> en 499. Nada cambia en pantalla: se trocean para que el siguiente cambio no los rompa (el verify no deja pasar de 500).', 'Cada uno de ellos va a tocarse pronto: la semana crece en el estado y en la hoja de «A tu ritmo»; la luz cada vez que cambie un vecino de la home.', 'Media sesión, mecánica. Riesgo de ámbito del build (el crash de s144), que el verify caza.', 'Bajo si se hace solo. Alto si se mezcla con una pieza nueva: dos cosas en un commit y ninguna se puede revertir sola.', false)}
  </div>
  <div class="recom">
    <p><b>Recomendación:</b> <b>1 con 2 en paralelo</b>. Yo hago la semana (con tu letra de abajo) mientras tú la usas un día
    entero; lo que encuentres entra en la misma versión o en la siguiente. Los huecos (3) caen dentro de la semana donde toquen
    (el cierre del viernes ya obliga a mirar «el cierre nunca es Ahora»). La deuda (4) se paga en cuanto una pieza vaya a tocar
    ese archivo: <code>ritmo.spec.js</code> ya no se toca (la semana lleva spec propio), y la hoja de «A tu ritmo» está en 200.</p>
  </div>

  <h2>La semana, vista</h2>
  <p>Cinco decisiones. Las tres primeras son de regla y se dibujan; la cuarta es de pantalla y va con <b>fotos de la app
  real</b> a 1536×704, lunes 14 de septiembre a las 9:00 (semana ISO 38: por la regla le toca «Caderas y piernas»).</p>

  <h3>1 · El tema de cada semana</h3>
  <div class="tres">
    <div class="tarjeta rec"><span class="sello">A · seis temas en ciclo (lo pintado)</span>
      ${chipsSemanas(TEMAS6, 38, 8)}
      <p class="frase">«<b>Semana 38 · Caderas y piernas</b>, la silla las acorta; esta semana se alargan»</p>
      <p>Cada semana ISO, uno; se repite cada seis. Con los pozos que hay junto a la mesa (Estira 6 · Mueve 4 · Respira 5 · cierre 1)
      lo que cambia entre semanas es la región líder, el orden y la forma del día, no que cada plato sea nuevo.</p></div>
    <div class="tarjeta"><span class="sello gris">B · cuatro temas, más marcados</span>
      ${chipsSemanas(TEMAS4, 38, 8)}
      <p class="frase">«<b>Semana 38 · Caderas y piernas</b>: esta semana, tres de cada cuatro pausas van a caderas y piernas»</p>
      <p>Menos temas y cada uno pesa más: la región líder manda en casi todas las pausas de Estira, no solo en la primera.
      Se nota más el tema; se repite antes (cada cuatro semanas) y los pozos pequeños (Mueve 4) se agotan antes.</p></div>
    <div class="tarjeta"><span class="sello gris">C · sin tema, solo el acento del día</span>
      ${chipsSemanas([], 38, 8)}
      <p class="frase">«<b>Hoy, arrancar</b>: la primera pausa activa el cuerpo»</p>
      <p>Todas las semanas iguales; la variedad la pone el día (lunes, miércoles, jueves, viernes). Más simple, y la línea
      solo tiene que explicar el acento. Contradice lo que pediste («cada semana del año tiene que ser diferente o al menos coherente»).</p></div>
  </div>

  <h3>2 · Los acentos del día</h3>
  <p>Cada día de lunes a viernes lleva un acento sobre la regla de siempre (o ninguno: martes). Marca los que se quedan.</p>
  <div class="cinco">
    <div class="dia"><div class="d">Lunes</div><div class="h">arrancar</div>
      ${tira([{ c: C.move, on: true, n: 'Mueve' }, { c: C.extra }, { c: C.breathe }, { c: C.extra, larga: true }, { tipo: 'comida' }, { c: C.extra }, { c: C.move }, { c: C.breathe, larga: true }, { c: C.breathe }])}
      <p>La primera pausa activa el cuerpo (Mueve), no estira.</p></div>
    <div class="dia"><div class="d">Martes</div><div class="h">sostener</div>
      ${tira(DIA_BASE)}
      <p>El día tal cual lo sirve la regla. Sin acento.</p></div>
    <div class="dia"><div class="d">Miércoles</div><div class="h">la mitad</div>
      ${tira([{ c: C.extra }, { c: C.extra, larga: true, on: true }, { c: C.breathe }, { c: C.move }, { tipo: 'comida' }, { c: C.extra }, { c: C.move }, { c: C.breathe, larga: true }, { c: C.breathe }])}
      <p>La pausa larga llega antes: la segunda, no la tercera.</p></div>
    <div class="dia"><div class="d">Jueves</div><div class="h">aire</div>
      ${tira([{ c: C.extra }, { c: C.move }, { c: C.extra }, { c: C.breathe, larga: true, on: true }, { tipo: 'comida' }, { c: C.extra }, { c: C.move }, { c: C.breathe, larga: true }, { c: C.breathe }])}
      <p>Antes de comer se respira, no se estira.</p></div>
    <div class="dia"><div class="d">Viernes</div><div class="h">cerrar suave</div>
      ${tira([{ c: C.extra }, { c: C.move }, { c: C.breathe }, { c: C.extra, larga: true }, { tipo: 'comida' }, { c: C.extra }, { c: C.move }, { c: C.breathe, larga: true }, { c: C.breathe, larga: true, on: true }])}
      <p>La tarde acaba con la larga y un cierre más largo.</p></div>
  </div>
  <p class="leyenda">Cada tira es un día: los puntos son pausas (Estira · Mueve · Respira), la píldora ancha es la pausa larga, el
  punteado la comida. El punto relleno es lo que el acento cambia.</p>
  <div class="dos">
    <div class="tarjeta"><span class="sello gris">El miércoles, en detalle</span><span class="t">¿Cuántas largas antes de comer?</span>
      <p>Adelantar la larga a la segunda pausa hace que la cadencia de siempre meta <b>otra</b> larga a las 13:15 (salió así en la
      maqueta). <kbd>A</kbd> dos largas antes de comer, como sale · <kbd>B</kbd> solo se adelanta la primera y la cadencia
      se reinicia · <kbd>C</kbd> quitar el acento.</p></div>
    <div class="tarjeta"><span class="sello gris">El viernes, en detalle</span><span class="t">¿Cuánto dura el cierre?</span>
      <p>El pozo de cierre tiene un plato de 10 min y el hueco del cierre es de 5. <kbd>A</kbd> el cierre se alarga a 10 min
      (la línea lo enseña) · <kbd>B</kbd> sigue de 5 y solo cambia el plato.</p></div>
  </div>

  <h3>3 · El fin de semana</h3>
  <p><kbd>A</kbd> sábado y domingo van <b>por libre</b> (la carta, sin menú; la semana empieza el lunes) ·
  <kbd>B</kbd> un <b>menú corto si lo pides</b> («Una hora» o «Dos horas», sin tema ni acento).</p>

  <h3>4 · Dónde se dice — fotos</h3>
  <p>Las tres son acumulativas: B lleva lo de A, C lleva lo de A (y podría llevar lo de B). La línea bajo la cabecera
  ocupa el sitio de la frase de la primera vez, que se va con el primer bloque hecho; el tema, no.</p>
  ${fotoBloque('A', 'Solo la línea bajo la cabecera', 'Una línea en la misma cursiva pequeña que la frase de la primera vez. El panel no crece: la sustituye. Después del primer bloque, la línea del tema se queda.', F.A)}
  ${fotoBloque('B', 'También bajo «A TU RITMO» en el aro', 'Una tercera línea en versalita bajo «HASTA LAS 17:00». Para que el panel no se mueva, el rótulo sube 15 px más y se acerca al botón del aro: mira si te cabe.', F.B)}
  ${fotoBloque('C', 'También en la barra lateral', 'Una línea más bajo «3 min · Estira» en la tarjeta «Siguiente pausa». La barra lateral ya escala cuando no cabe (s181): una línea más la encoge un poco.', F.C)}

  <h2 class="decide">Lo que hay que decidir</h2>
  <p>Basta una línea, p. ej. <kbd>1+2 · A · L X J V · A · A · A · A · nombres bien</kbd>.</p>
  <ol class="orden">
    <li><b>La ruta</b>: <kbd>1</kbd> la semana · <kbd>2</kbd> usarla un día · <kbd>3</kbd> los huecos · <kbd>4</kbd> la deuda (se pueden combinar: «1+2»).</li>
    <li><b>El tema por semana</b>: <kbd>A</kbd> seis en ciclo · <kbd>B</kbd> cuatro, más marcados · <kbd>C</kbd> ninguno.</li>
    <li><b>Los acentos</b>: cuáles se quedan (<kbd>L</kbd> arrancar · <kbd>X</kbd> la mitad · <kbd>J</kbd> aire · <kbd>V</kbd> cerrar suave), o «todos» o «ninguno».</li>
    <li><b>El miércoles</b>: <kbd>A</kbd> dos largas antes de comer · <kbd>B</kbd> solo se adelanta la primera · <kbd>C</kbd> quitar el acento.</li>
    <li><b>El viernes</b>: <kbd>A</kbd> el cierre se alarga a 10 min · <kbd>B</kbd> sigue de 5 y cambia el plato.</li>
    <li><b>Dónde se dice</b>: <kbd>A</kbd> la línea · <kbd>B</kbd> también en el aro · <kbd>C</kbd> también en la barra lateral (o «B+C»).</li>
    <li><b>El fin de semana</b>: <kbd>A</kbd> por libre · <kbd>B</kbd> un menú corto si lo pides.</li>
    <li><b>Los nombres</b> de los temas: «bien», o los que quieras cambiar.</li>
  </ol>
  <p class="pie">Fotos: artefacto v0.125.2 a 1536×704, reloj fijado al lunes 14 de septiembre a las 9:00, frase inyectada con las
  clases de la app (nada de esto está implementado). Generada por <code>scripts/audit/por-donde-seguir-s195.js</code>.</p>
</main>
</body>
</html>
`;
}

(async () => {
  const b = await chromium.launch();
  const F = {};
  for (const donde of ['A', 'B', 'C']) {
    F[donde] = await foto(b, donde);
    console.log('foto ' + donde + ' ' + JSON.stringify(F[donde].m));
  }
  await b.close();
  fs.writeFileSync(SALIDA, pagina(F));
  console.log('→ ' + path.relative(ROOT, SALIDA) + ' (' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB)');
})().catch((e) => { console.error(e); process.exit(1); });
