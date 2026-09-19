/* PACE · El copy de la semana (7B «aunque creo que se puede mejorar más») · s195c
 * ==============================================================================
 * El usuario eligió 7B —sin título para los días: una frase bajo la cabecera que
 * dice el tema de la semana y, en una segunda oración, lo único que hoy cambia—
 * y dijo que el copy se puede mejorar. Aquí van TRES sistemas de copy completos
 * (los seis temas y las cinco formas de día), cada uno leído de lunes a viernes tal
 * como saldría bajo la cabecera del panel, calcada. No hay nada implementado: la
 * regla de la semana se implementa con el sistema que elija (o su mezcla).
 *
 * Uso: node scripts/audit/semana-copy-s195.js   →  docs/proposals/semana-copy-s195.html
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'semana-copy-s195.html');
const ESTILO = fs.readFileSync(path.join(ROOT, 'docs', 'proposals', 'por-donde-seguir-s194.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const SISTEMAS = [
  { id: 'A', nombre: 'Cercano', quien: 'Te habla a ti, en presente: «hoy», «te», «se». Es el tono de la frase de la primera vez («al acabar, te sirvo la pausa que toca»).',
    temas: ['Soltar el cuello', 'Abrir la cadera', 'Las manos que teclean', 'La espalda larga', 'Respirar hondo', 'Semana ligera'],
    dias: ['Hoy la primera pausa te pone en pie.', 'Hoy, el día tal cual: cada tres cuartos, una pausa.', 'Hoy la pausa larga llega antes de comer.', 'Hoy, antes de comer, se respira.', 'Hoy la tarde se cierra despacio.'],
    linea: (t, d) => 'Esta semana, <b>' + t.charAt(0).toLowerCase() + t.slice(1) + '</b>. ' + d, rec: true },
  { id: 'B', nombre: 'Sobrio', quien: 'Sin «hoy» ni «te»: nombra la cosa y para. Más cerca de los rótulos de la app («ritmo, calma», «afloja tensión»).',
    temas: ['Cuello y hombros, sin carga', 'Caderas que se abren', 'Muñecas y manos', 'La columna entera', 'Aire', 'Ligera'],
    dias: ['La primera pausa activa el cuerpo.', 'Una pausa cada tres cuartos.', 'La larga, antes de comer.', 'Respirar antes de comer.', 'Cierre suave por la tarde.'],
    linea: (t, d) => '<b>' + t + '</b> · ' + d },
  { id: 'C', nombre: 'Con motivo', quien: 'Cada cosa lleva su porqué, como la propuesta de la pausa («antídoto a la silla»). Más largo; el motivo es lo que hace que la variedad no parezca arbitraria.',
    temas: ['Soltar el cuello, donde se acumula la pantalla', 'Abrir la cadera, que la silla acorta', 'Las manos que teclean todo el día', 'La espalda larga, de la nuca al sacro', 'Respirar hondo, más despacio', 'Semana ligera: descansar también cuenta'],
    dias: ['La primera pausa te pone en pie, para no arrancar sentado.', 'El día tal cual: cada tres cuartos, una pausa.', 'La pausa larga antes de comer, que a mitad de semana cuesta más.', 'Antes de comer se respira, para llegar a la tarde con aire.', 'La tarde se cierra despacio.'],
    linea: (t, d) => 'Esta semana: <b>' + t.charAt(0).toLowerCase() + t.slice(1) + '</b>. Hoy: ' + d.charAt(0).toLowerCase() + d.slice(1) },
];

const cab = (linea) => `
  <div class="panel">
    <div class="cab"><div class="t">Jornada entera <span class="s">· de 9:00 a 17:00 · comida a las 14:00 durante 1 h</span></div><div class="der"><span class="chip">Junto a la mesa</span><span class="chip">Sin material</span><span class="pill">Hoy voy por libre</span></div></div>
    <div class="linea">${linea}</div>
    <div class="tira"><div class="s a" style="flex:45 1 0"></div><i></i><div class="s" style="flex:45 1 0"></div><i></i><div class="s" style="flex:45 1 0"></div><i class="l"></i><div class="s" style="flex:45 1 0"></div><i></i><div class="s" style="flex:45 1 0"></div><i></i><div class="s com" style="flex:60 1 0"></div><div class="s" style="flex:45 1 0"></div><i></i><div class="s" style="flex:45 1 0"></div><i></i><div class="s" style="flex:30 1 0"></div><i></i></div>
  </div>`;

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>El copy de la semana · tres sistemas</title>
${ESTILO.replace('</style>', `
  .panel { border: 1px solid var(--line); border-radius: 12px; background: var(--paper); padding: 14px 20px 14px; font-family: 'Inter Tight', system-ui, sans-serif; margin-top: 8px; }
  .panel .cab { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .panel .t { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-weight: 500; font-size: 18px; color: var(--ink); }
  .panel .s { font-size: 12px; color: var(--ink-3); font-weight: 400; }
  .panel .der { display: flex; gap: 6px; align-items: center; }
  .panel .chip { font-size: 10px; letter-spacing: 0.08em; color: var(--ink-2); border: 1px solid var(--line); border-radius: 999px; padding: 3px 9px; white-space: nowrap; }
  .panel .pill { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--focus-cta); border: 1px solid var(--focus-cta); border-radius: 999px; padding: 4px 10px; white-space: nowrap; }
  .panel .linea { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-size: 13.5px; color: var(--ink-3); margin-top: 6px; }
  .panel .linea b { color: var(--ink); font-weight: 500; }
  .panel .tira { display: flex; align-items: center; height: 18px; margin-top: 14px; }
  .panel .tira .s { height: 4px; border-radius: 2px; background: var(--paper-3); }
  .panel .tira .s.a { background: color-mix(in srgb, var(--focus) 35%, var(--paper-3)); }
  .panel .tira .s.com { background: repeating-linear-gradient(90deg, var(--line) 0 4px, transparent 4px 8px); height: 2px; }
  .panel .tira i { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(107,122,143,0.5); background: var(--paper); margin: 0 2px; flex: 0 0 auto; }
  .panel .tira i.l { width: 26px; border-radius: 7px; border-color: rgba(201,122,93,0.5); }
  .sistema { margin-top: 26px; }
  .quien { font-size: 14px; color: var(--ink-2); margin: 4px 0 8px; }
  .temas { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 4px; }
  .tema { border: 1px solid var(--line); border-radius: 999px; padding: 4px 11px; font-size: 13px; color: var(--ink-2); background: var(--paper); font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-size: 14px; }
  .tema.hoy { border-color: var(--focus-cta); background: var(--focus-soft); color: var(--ink); }
  .semana-lineas { margin-top: 10px; display: grid; gap: 6px; }
  .dia-linea { display: grid; grid-template-columns: 90px minmax(0,1fr); gap: 10px; align-items: baseline; font-size: 13px; }
  .dia-linea .d { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); }
  .dia-linea .l { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-size: 15px; color: var(--ink-2); }
  .dia-linea .l b { color: var(--ink); font-weight: 500; }
  .opinion { border-left: 3px solid var(--focus-cta); padding: 2px 0 2px 14px; margin: 14px 0 0; font-size: 14px; color: var(--ink-2); }
  .opinion b { color: var(--ink); }
</style>`)}
</head>
<body>
<main>
  <div class="ceja">PACE · el copy de la semana · 7B, mejorado</div>
  <h1>Tres maneras de decir la semana</h1>
  <p>Elegiste 7B: sin títulos para los días, una frase bajo la cabecera con el tema de la semana y lo único que hoy cambia.
  Dijiste que se puede mejorar. Aquí van tres sistemas de copy completos —los seis temas y las cinco formas de día— leídos
  de lunes a viernes tal como saldrían, y uno de ellos puesto en el panel calcado. La regla de la semana (tema por semana ISO
  en ciclo × forma del día × la regla de siempre) es la misma en los tres: solo cambia lo que se lee. Elige uno, mezcla, o
  cámbiame palabras: la frase es dato, no código.</p>

  ${SISTEMAS.map((S) => `
  <div class="sistema">
    <h2>${S.id} · ${S.nombre}${S.rec ? ' <span class="sello">· recomendado</span>' : ''}</h2>
    <p class="quien">${S.quien}</p>
    <div class="ceja" style="margin-top:12px">Los seis temas, en ciclo (la semana 38 lleva el segundo)</div>
    <div class="temas">${S.temas.map((t, i) => '<span class="tema' + (i === 1 ? ' hoy' : '') + '">' + t + '</span>').join('')}</div>
    <div class="ceja" style="margin-top:12px">La semana 38, de lunes a viernes, bajo la cabecera</div>
    <div class="semana-lineas">${DIAS.map((d, i) => '<div class="dia-linea"><span class="d">' + d + '</span><span class="l">' + S.linea(S.temas[1], S.dias[i]) + '</span></div>').join('')}</div>
    ${S.rec ? '<div class="ceja" style="margin-top:14px">En el panel, el miércoles</div>' + cab(S.linea(S.temas[1], S.dias[2])) : ''}
  </div>`).join('')}

  <h2>Dos cosas que hay que decidir con el copy</h2>
  <div class="dos">
    <div class="tarjeta"><span class="sello gris">El martes</span><span class="t">¿Frase o silencio?</span>
      <p>El martes no cambia nada («el día tal cual»). Puede llevar frase igual (como arriba) o solo el tema: «<i>Esta semana, abrir la cadera.</i>» y nada más. Yo lo dejaría en silencio: una frase que dice que no pasa nada, sobra.</p></div>
    <div class="tarjeta"><span class="sello gris">Después del primer bloque</span><span class="t">¿Se queda la línea?</span>
      <p>La frase de la primera vez se va con el primer bloque hecho. La de la semana debería quedarse el día entero (es el motivo de lo que ves en la línea). Propongo que se quede, y que en móvil vaya en una sola línea con el tema en negrita.</p></div>
  </div>

  <div class="opinion"><b>Recomiendo A.</b> Es el tono con el que ya te habla el panel («te sirvo la pausa que toca»), cabe en una línea en escritorio y en dos en móvil,
  y el tema por intención dice para qué sin sonar a manual. C es el más convincente cuando lo lees una vez y el más pesado cuando lo lees cada día.</div>

  <h2 class="decide">Para decidir</h2>
  <ol class="orden">
    <li><b>El sistema</b>: <kbd>A</kbd> cercano · <kbd>B</kbd> sobrio · <kbd>C</kbd> con motivo — o una mezcla («temas de A, días de B»).</li>
    <li><b>Palabras</b>: cualquier tema o frase que quieras cambiar, tal cual la escribirías.</li>
    <li><b>El martes</b>: con frase · en silencio.</li>
    <li><b>Tras el primer bloque</b>: la línea se queda · se va.</li>
  </ol>
  <p class="pie">Sin fotos: es copy. La regla de la semana está prototipada en <code>scripts/audit/semana-s194.js</code> y se implementa con el sistema que elijas. Generada por <code>scripts/audit/semana-copy-s195.js</code>.</p>
</main>
</body>
</html>
`;
fs.writeFileSync(SALIDA, html);
console.log('→ ' + path.relative(ROOT, SALIDA) + ' (' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB)');
