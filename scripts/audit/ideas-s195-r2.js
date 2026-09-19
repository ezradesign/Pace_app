/* PACE · Ideas, ronda 2: lo que pide DISEÑO (s195, tras v0.126.0)
 * ================================================================
 * Con la ronda 1 delante el usuario decidió cuatro cosas (implementadas en
 * v0.126.0) y dejó tres que piden ver variantes antes de elegir:
 *   5 · la tarjeta «¿Cuánto trabajas hoy?» por libre, sustituyendo a la del Camino,
 *       «visualmente mucho más elegante y llamativa»;
 *   6 · el interruptor de la comida, «cuadrado o más elegante: esa píldora es
 *       demasiado grande y no cuadra»;
 *   7 · la semana: «debe variar cada semana para no ser repetitiva pero sí coherente
 *       con el bienestar, y los títulos (arrancar, aire…) no me convencen».
 * Regla de s174: toda opción se PINTA antes de preguntar. Calcos con la hoja y los
 * tokens de la app; tres variantes por pieza; una recomendación por pieza.
 *
 * Uso: node scripts/audit/ideas-s195-r2.js   (no necesita servidor: no hay fotos)
 * Sale: docs/proposals/ideas-s195-r2.html
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'ideas-s195-r2.html');
const ESTILO = fs.readFileSync(path.join(ROOT, 'docs', 'proposals', 'por-donde-seguir-s194.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];
const RITMO_CSS = fs.readFileSync(path.join(ROOT, 'app', 'ritmo', 'ritmo.css.jsx'), 'utf8').match(/s\.textContent = `([\s\S]*?)`;/)[1];

/* el arco del día (5B): una cúbica en un viewBox de 1000×96; los puntos se colocan SOBRE ella */
const ARCO = [[10, 88], [260, -6], [740, -6], [990, 88]];
const enArco = (fx) => {
  /* busca t con x(t) = fx·1000 por bisección y devuelve [x%, y%] */
  const bez = (t, i) => { const u = 1 - t; return u * u * u * ARCO[0][i] + 3 * u * u * t * ARCO[1][i] + 3 * u * t * t * ARCO[2][i] + t * t * t * ARCO[3][i]; };
  let lo = 0, hi = 1; for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; if (bez(mid, 0) < fx * 1000) lo = mid; else hi = mid; }
  const t = (lo + hi) / 2; return [bez(t, 0) / 10, bez(t, 1) / 96 * 100];
};
const punto = (fx, nombre, hora, rec) => { const [x, y] = enArco(fx); return '<div class="p' + (rec ? ' rec' : '') + '" style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) + '%"><i></i><b>' + nombre + '</b><span>' + hora + '</span></div>'; };
const sel = (v) => '<span class="pace-rt-sel" style="display:inline-block;padding:0 11px 0 1px;margin:0 1px;border-bottom:1px dotted var(--line-2)">' + v + '</span>';
const chev = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 7 5\'%3E%3Cpath d=\'M.5.8 3.5 4 6.5.8\' fill=\'none\' stroke=\'%238A8372\' stroke-width=\'1.1\'/%3E%3C/svg%3E")';

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ideas, ronda 2 · lo que pide diseño</title>
${ESTILO.replace('</style>', `
  :root { --paper: #F2EDE0; --paper-2: #EAE4D4; --paper-3: #DFD8C4; --hydrate: #5E8AA6; --focus-soft: rgba(62,90,58,0.10); --r-md: 12px; --r-pill: 999px; --sh-soft: 0 1px 2px rgba(31,28,23,0.06); --dur-quick: 160ms; --ease: ease; --font-display: 'EB Garamond', Georgia, serif; }
  ${RITMO_CSS.replace(/\.pace-rt-esc \{ display: block; \}[\s\S]*?\}\n/, '')}
  .pace-rt-sel { background-image: ${chev}; background-repeat: no-repeat; background-position: right 1px center; background-size: 7px 5px; }
  .var { margin-top: 14px; }
  .var .sello { display: block; margin-bottom: 6px; }
  .opinion { border-left: 3px solid var(--focus-cta); padding: 2px 0 2px 14px; margin: 14px 0 0; font-size: 14px; color: var(--ink-2); }
  .opinion b { color: var(--ink); }
  .home { border: 1px solid var(--line); border-radius: 12px; background: var(--paper); padding: 16px 22px; font-family: 'Inter Tight', system-ui, sans-serif; box-shadow: var(--sh-soft); }
  /* A · losetas */
  .cA .t { font-family: var(--font-display); font-style: italic; font-size: 26px; color: var(--ink); line-height: 1.1; }
  .cA .s { font-family: var(--font-display); font-style: italic; font-size: 14px; color: var(--ink-3); margin-top: 3px; }
  .cA .tiles { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; margin-top: 14px; }
  .cA .tile { border: 1px solid var(--line); border-radius: 12px; padding: 14px 14px 12px; background: var(--paper); text-align: left; transition: all 160ms ease; }
  .cA .tile b { display: block; font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 20px; color: var(--ink); line-height: 1.1; }
  .cA .tile span { display: block; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); margin-top: 6px; }
  .cA .tile.rec { border-color: var(--focus-cta); background: var(--focus-soft); }
  .cA .tile.rec span { color: var(--focus-cta); }
  .cA .pie { display: flex; justify-content: space-between; margin-top: 12px; font-size: 12px; color: var(--ink-3); }
  /* B · el arco del día */
  .cB { position: relative; }
  .cB .t { font-family: var(--font-display); font-style: italic; font-size: 26px; color: var(--ink); line-height: 1.1; }
  .cB .s { font-family: var(--font-display); font-style: italic; font-size: 14px; color: var(--ink-3); margin-top: 3px; }
  .cB .arco { position: relative; height: 96px; margin: 26px 10px 44px; }
  .cB .arco svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  .cB .p { position: absolute; transform: translate(-50%, -7px); text-align: center; }
  .cB .p i { display: block; width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid var(--focus-cta); background: var(--paper); margin: 0 auto 8px; }
  .cB .sol { bottom: -34px; }
  .cB .p.rec i { background: var(--focus-cta); }
  .cB .p b { display: block; font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 17px; color: var(--ink); white-space: nowrap; }
  .cB .p span { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); white-space: nowrap; }
  .cB .sol { position: absolute; left: 0; bottom: 0; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
  .cB .sol.d { left: auto; right: 0; }
  /* C · columnas editoriales */
  .cC .cab { display: flex; justify-content: space-between; align-items: baseline; }
  .cC .t { font-family: var(--font-display); font-style: italic; font-size: 26px; color: var(--ink); line-height: 1.1; }
  .cC .s { font-family: var(--font-display); font-style: italic; font-size: 14px; color: var(--ink-3); }
  .cC .cols { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); margin-top: 14px; border-top: 1px solid var(--line); }
  .cC .col { padding: 14px 12px 12px; border-right: 1px solid var(--line); text-align: center; }
  .cC .col:last-child { border-right: 0; }
  .cC .col .n { font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 44px; line-height: 1; color: var(--ink); }
  .cC .col .n small { font-size: 20px; }
  .cC .col .l { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); margin-top: 6px; }
  .cC .col .h { font-family: var(--font-display); font-style: italic; font-size: 13px; color: var(--ink-2); margin-top: 8px; }
  .cC .col.rec { background: var(--focus-soft); }
  .cC .col.rec .l { color: var(--focus-cta); }
  @media (max-width: 720px) { .cA .tiles, .cC .cols { grid-template-columns: 1fr 1fr; } .cB .arco { height: 130px; } }
  /* 6 · los interruptores */
  .frase { font-family: var(--font-display); font-style: italic; font-size: 15px; color: var(--ink-3); line-height: 1.6; }
  .frase b { color: var(--ink); font-weight: 500; }
  .casilla { display: inline-block; width: 13px; height: 13px; border: 1px solid var(--ink-3); border-radius: 3px; vertical-align: -2px; margin-right: 6px; position: relative; background: var(--paper); }
  .casilla.on { background: var(--ink); border-color: var(--ink); }
  .casilla.on::after { content: ''; position: absolute; left: 4px; top: 1px; width: 3px; height: 7px; border: solid var(--paper); border-width: 0 1.5px 1.5px 0; transform: rotate(45deg); }
  .mini { display: inline-block; width: 22px; height: 12px; border-radius: 6px; border: 1px solid var(--ink-3); vertical-align: -1px; margin: 0 6px; position: relative; background: var(--paper); }
  .mini::after { content: ''; position: absolute; top: 1px; left: 1px; width: 8px; height: 8px; border-radius: 50%; background: var(--ink-3); }
  .mini.on { background: var(--ink); border-color: var(--ink); }
  .mini.on::after { left: 11px; background: var(--paper); }
  .tachado { text-decoration: line-through; color: var(--ink-3); }
  /* 7 · la semana */
  .tabla { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
  .tabla th { text-align: left; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); padding: 6px 8px; border-bottom: 1px solid var(--line); font-weight: 500; }
  .tabla td { padding: 8px; border-bottom: 1px solid var(--paper-3); vertical-align: top; color: var(--ink-2); }
  .tabla td b { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 15px; color: var(--ink); }
  .tabla td .no { text-decoration: line-through; color: var(--ink-3); }
  .linea-tema { font-family: var(--font-display); font-style: italic; font-size: 13px; color: var(--ink-3); margin-top: 6px; }
  .linea-tema b { color: var(--ink); font-weight: 500; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .chip { border: 1px solid var(--line); border-radius: 999px; padding: 4px 11px; font-size: 13px; color: var(--ink-2); background: var(--paper); }
  .chip.no { text-decoration: line-through; color: var(--ink-3); }
</style>`)}
</head>
<body>
<main>
  <div class="ceja">PACE · ideas, ronda 2 · después de v0.126.0</div>
  <h1>Lo que pide diseño: tres piezas, tres variantes cada una</h1>
  <p>De la ronda anterior aceptaste cuatro cosas y ya están en la app (v0.126.0: la pausa con menú y su glifo, el agua por
  tiempo, recolocar al terminar, las paradas hechas y saltadas). Quedan tres que pediste ver mejor. Cada una va con tres
  variantes calcadas con las piezas de la app y una recomendación. Elige por letra (<kbd>5B · 6A · 7C</kbd>) o dime qué mezclar.</p>

  <h2>5 · «¿Cuánto trabajas hoy?» por libre, en el sitio del Camino</h2>
  <p>Hoy, por libre, la home enseña los cuatro chips y la tarjeta del Camino sugerido con el enlace «Ponle ritmo al día» en
  pequeño. Tú: que esa tarjeta sea la del ritmo, «visualmente mucho más elegante y llamativa». Los Caminos se van a la
  biblioteca como estante (lo acordamos en la ronda 1).</p>

  <div class="var"><span class="sello gris">5A · Losetas con la hora de fin</span>
    <div class="home cA">
      <div class="t">¿Cuánto trabajas hoy?</div>
      <div class="s">Te preparo la jornada: cuándo parar, qué hacer y cuánto dura.</div>
      <div class="tiles">
        <div class="tile"><b>Una hora</b><span>hasta las 10:45</span></div>
        <div class="tile"><b>Dos horas</b><span>hasta las 11:45</span></div>
        <div class="tile"><b>Media jornada</b><span>hasta las 13:15</span></div>
        <div class="tile rec"><b>Jornada entera</b><span>hasta las 17:00 · la de siempre</span></div>
      </div>
      <div class="pie"><span>Empiezas a las 9:30 · comida a las 14:00 · sales a las 17:00</span><span>Ajustar el horario</span></div>
    </div>
    <p class="leyenda">Es la pregunta de hoy con otra jerarquía: las opciones grandes, el horario en una línea de pie. La recomendada (por la hora y por lo que sueles elegir) va en verde. Lo más cerca de lo que ya existe.</p>
  </div>

  <div class="var"><span class="sello">5B · El arco del día · recomendada</span>
    <div class="home cB">
      <div class="t">¿Cuánto trabajas hoy?</div>
      <div class="s">Toca dónde termina tu día y te lo preparo.</div>
      <div class="arco">
        <svg viewBox="0 0 1000 96" preserveAspectRatio="none"><path d="M10 88 C 260 -6, 740 -6, 990 88" fill="none" stroke="#B8AD8E" stroke-width="1.4" stroke-linecap="round"/></svg>
        ${punto(0.17, 'Una hora', '10:45')}${punto(0.30, 'Dos horas', '11:45')}${punto(0.50, 'Media jornada', '13:15')}${punto(0.90, 'Jornada entera', '17:00', true)}
        <div class="sol">9:30 · empiezas</div><div class="sol d">17:00 · sales</div>
      </div>
    </div>
    <p class="leyenda">El día es un arco (el mismo lenguaje que el aro y el atardecer de la home): sale a tu hora de inicio y se pone a la de salida; las cuatro opciones son puntos en él, a la altura de la hora en que acabarías, y tocar uno sirve el día hasta ahí. La recomendada va rellena. Es la más «PACE» de las tres y la que más se distingue de una tarjeta más.</p>
  </div>

  <div class="var"><span class="sello gris">5C · Columnas editoriales</span>
    <div class="home cC">
      <div class="cab"><div class="t">¿Cuánto trabajas hoy?</div><div class="s">de 9:30 a 17:00 · comida a las 14:00</div></div>
      <div class="cols">
        <div class="col"><div class="n">1<small> h</small></div><div class="l">Una hora</div><div class="h">hasta las 10:45</div></div>
        <div class="col"><div class="n">2<small> h</small></div><div class="l">Dos horas</div><div class="h">hasta las 11:45</div></div>
        <div class="col"><div class="n">½</div><div class="l">Media jornada</div><div class="h">hasta las 13:15</div></div>
        <div class="col rec"><div class="n">Día</div><div class="l">Jornada entera</div><div class="h">hasta las 17:00</div></div>
      </div>
    </div>
    <p class="leyenda">La cifra grande en Cormorant como protagonista, columnas separadas por líneas finas, el horario en la cabecera. Muy limpia; menos «viva» que el arco.</p>
  </div>
  <div class="opinion"><b>Recomiendo 5B.</b> Es la única que no parece otra tarjeta: usa el arco, que ya es el símbolo de la home, y hace visible de un vistazo
  cuánto es «una hora» frente a «la jornada». Coste: medio (el arco se dibuja con el mismo motor que la línea del día; las horas salen de la regla como hoy). Si te parece demasiado, 5A es la segura.</div>

  <h2>6 · Comer o no: el interruptor</h2>
  <p>La píldora «sí / no» de la ronda 1 era demasiado grande y no cuadraba con la frase. Tres formas más pequeñas, todas dentro
  de la frase de la pregunta, que sigue siendo «Empiezas a las 9:30, comes a las 14:00 durante 1 h y terminas a las 17:00».</p>
  <div class="tres">
    <div class="tarjeta"><span class="sello gris">6A · Casilla cuadrada</span>
      <p class="frase">Empiezas a las <b>${sel('9:30')}</b>, <span class="casilla on"></span>comes a las <b>${sel('14:00')}</b> durante <b>${sel('1 h')}</b> y terminas a las <b>${sel('17:00')}</b>.</p>
      <p class="frase" style="margin-top:6px">Empiezas a las <b>${sel('9:30')}</b>, <span class="casilla"></span><span class="tachado">comes a las 14:00 durante 1 h</span> y terminas a las <b>${sel('17:00')}</b>.</p>
      <p>Una casilla de 13 px delante de «comes». Apagada, el tramo de la comida se tacha y sus selectores se apagan. Lo más discreto.</p></div>
    <div class="tarjeta rec"><span class="sello">6B · La palabra conmutable · recomendada</span>
      <p class="frase">Empiezas a las <b>${sel('9:30')}</b>, <b>${sel('comes')}</b> a las <b>${sel('14:00')}</b> durante <b>${sel('1 h')}</b> y terminas a las <b>${sel('17:00')}</b>.</p>
      <p class="frase" style="margin-top:6px">Empiezas a las <b>${sel('9:30')}</b>, <b>${sel('no comes')}</b> y terminas a las <b>${sel('17:00')}</b>.</p>
      <p>«Comes» es una palabra más de la frase, con el mismo subrayado punteado y chevrón que las horas: al tocarla se cambia por «no comes» y la comida desaparece de la frase entera. No hay ningún control nuevo: es el lenguaje que la frase ya tiene.</p></div>
    <div class="tarjeta"><span class="sello gris">6C · Mini interruptor</span>
      <p class="frase">Empiezas a las <b>${sel('9:30')}</b>, comes<span class="mini on"></span>a las <b>${sel('14:00')}</b> durante <b>${sel('1 h')}</b> y terminas a las <b>${sel('17:00')}</b>.</p>
      <p class="frase" style="margin-top:6px">Empiezas a las <b>${sel('9:30')}</b>, comes<span class="mini"></span>y terminas a las <b>${sel('17:00')}</b>.</p>
      <p>Un interruptor de 22×12 en tinta, sin texto. Es el más reconocible como «interruptor» y el que más rompe la frase.</p></div>
  </div>
  <div class="opinion"><b>Recomiendo 6B.</b> La frase ya edita las horas como palabras subrayadas; la comida se apaga con la misma pieza y no aparece nada que no sea texto. Apagada, la frase se acorta y el menú no sirve comida en ningún sitio (línea, hoja, barra lateral).</div>

  <h2>7 · La semana: que varíe, que sea coherente, y sin esos títulos</h2>
  <p>Dijiste que «arrancar», «aire», «la mitad», «cerrar suave» no te convencen. Aquí van tres maneras de nombrar (o de no
  nombrar) lo que cambia cada día, y dos maneras de nombrar los temas de la semana. Lo que NO cambia: la semana sigue variando
  con la fecha (seis temas en ciclo) y cada día tiene una forma distinta.</p>

  <h3>Los días</h3>
  <table class="tabla">
    <tr><th></th><th>Hoy (ronda 1)</th><th>7A · Verbos del cuerpo</th><th>7B · Sin título: una frase</th><th>7C · Solo el tema, sin acento</th></tr>
    <tr><td><b>Lunes</b></td><td><span class="no">arrancar</span></td><td><b>Despertar</b><br>la primera pausa activa el cuerpo</td><td>«Hoy, la primera pausa te pone en pie.»</td><td rowspan="5">Ningún día lleva nombre ni frase propia. Lo que cambia entre días lo pone la regla en silencio (la región líder rota dentro de la semana) y la línea solo dice el tema: «Esta semana, la espalda».</td></tr>
    <tr><td><b>Martes</b></td><td><span class="no">sostener</span></td><td><b>Sostener</b><br>el día tal cual</td><td>«Hoy, el día tal cual: cada 45, una pausa.»</td></tr>
    <tr><td><b>Miércoles</b></td><td><span class="no">la mitad</span></td><td><b>Aflojar</b><br>la larga llega antes</td><td>«Hoy la pausa larga llega antes de comer.»</td></tr>
    <tr><td><b>Jueves</b></td><td><span class="no">aire</span></td><td><b>Respirar</b><br>antes de comer se respira</td><td>«Hoy, antes de comer, se respira.»</td></tr>
    <tr><td><b>Viernes</b></td><td><span class="no">cerrar suave</span></td><td><b>Soltar</b><br>la tarde acaba larga y suave</td><td>«Hoy la tarde se cierra despacio.»</td></tr>
  </table>
  <div class="dos" style="margin-top:14px">
    <div class="tarjeta"><span class="sello gris">Cómo se vería 7A bajo la cabecera</span>
      <div class="linea-tema"><b>Esta semana, la espalda</b> · hoy, <b>despertar</b>: la primera pausa activa el cuerpo.</div></div>
    <div class="tarjeta rec"><span class="sello">Cómo se vería 7B · recomendada</span>
      <div class="linea-tema"><b>Esta semana, la espalda.</b> Hoy la pausa larga llega antes de comer.</div></div>
  </div>

  <h3>Los temas de la semana</h3>
  <div class="dos">
    <div class="tarjeta"><span class="sello gris">Por región (ronda 1)</span>
      <div class="chips"><span class="chip">Cuello y hombros</span><span class="chip">Caderas y piernas</span><span class="chip">Manos y muñecas</span><span class="chip">Espalda y postura</span><span class="chip">El aire</span><span class="chip">Ligera</span></div>
      <p>Dice qué parte del cuerpo lidera. Claro, un poco de manual.</p></div>
    <div class="tarjeta rec"><span class="sello">Por intención · recomendada</span>
      <div class="chips"><span class="chip">Soltar el cuello</span><span class="chip">Abrir la cadera</span><span class="chip">Las manos que teclean</span><span class="chip">La espalda larga</span><span class="chip">Respirar hondo</span><span class="chip">Semana ligera</span></div>
      <p>Dice para qué: la misma región, con un verbo o una imagen. Es el tono del resto de la app («ritmo, calma», «afloja tensión», «cuerpo activo»). Y coherente con el bienestar: cada semana atiende una cosa que la silla estropea.</p></div>
  </div>
  <div class="opinion"><b>Recomiendo 7B con los temas por intención.</b> Sin títulos para los días: una frase corta bajo la cabecera dice el tema de
  la semana y, en una segunda oración, lo único que hoy cambia. Se lee como una persona y no como un menú de opciones. La variedad
  sigue viniendo de la fecha (seis temas × cinco formas de día = treinta semanas-día distintas antes de repetirse una), y con la memoria
  de las pausas (v0.126.0) la regla puede evitar insistir en lo que saltaste.</div>

  <h2 class="decide">Para decidir</h2>
  <ol class="orden">
    <li><b>La tarjeta por libre</b>: <kbd>5A</kbd> losetas · <kbd>5B</kbd> el arco del día · <kbd>5C</kbd> columnas.</li>
    <li><b>El interruptor de la comida</b>: <kbd>6A</kbd> casilla · <kbd>6B</kbd> la palabra «comes / no comes» · <kbd>6C</kbd> mini interruptor.</li>
    <li><b>Los días de la semana</b>: <kbd>7A</kbd> verbos · <kbd>7B</kbd> sin título, una frase · <kbd>7C</kbd> solo el tema.</li>
    <li><b>Los temas</b>: por región · por intención (y cámbiame los nombres que quieras).</li>
  </ol>
  <p class="pie">Calcos con la hoja de estilos real de «A tu ritmo» y los tokens de la app; nada de esto está implementado. Generada por <code>scripts/audit/ideas-s195-r2.js</code>.</p>
</main>
</body>
</html>
`;
fs.writeFileSync(SALIDA, html);
console.log('→ ' + path.relative(ROOT, SALIDA) + ' (' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB)');
