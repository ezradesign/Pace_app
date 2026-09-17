/* PACE · la PAGINA de la maqueta de «Semana» (s191)
 * ================================================
 * Troceada de `maqueta-s191-semana.js` por la regla §1 (el generador llego a 501
 * lineas). Aqui vive solo el HTML, la hoja y el guion de la pagina: recibe los dos
 * calcos del panel real (escritorio y movil) y no sabe como se capturaron.
 */
'use strict';

function pagina(esc, mov) {
  /* Los modales calcados se guardan como PLANTILLAS: la pagina los clona una vez por
     variante y rellena la vista. Asi no hay dos copias escritas a mano que puedan
     separarse. */
  const plantilla = (id, html) => '<template id="' + id + '">' + html + '</template>';
  return `<!doctype html>
<html lang="es" data-font="cormorant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Stats · Semana · ronda 1</title>
<link rel="stylesheet" href="/app/tokens.css">
<link rel="stylesheet" href="/app/motion.css">
<style>/* ===== estilos que la app inyecta, calcados ===== */
${esc.estilos}
</style>
<style>/* ===== la pagina de la maqueta ===== */
  body { padding: 26px 22px 70px; background: var(--paper-2); }
  .cab { max-width: 1320px; margin: 0 auto 22px; }
  .cab h1 { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 30px; margin: 0 0 8px; }
  .cab p { font-size: 13px; color: var(--ink-2); line-height: 1.6; max-width: 940px; margin: 0 0 6px; }
  .cab b { color: var(--ink); }
  .mandos { display: flex; gap: 6px; margin: 14px 0 0; flex-wrap: wrap; align-items: center; }
  .mandos button { font-size: 11px; padding: 6px 11px; border: 1px solid var(--line); border-radius: 8px; background: var(--paper); color: var(--ink-2); cursor: pointer; }
  .mandos button.on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .mandos .hueco { width: 14px; }
  .bloque { max-width: 1320px; margin: 0 auto 50px; overflow-x: auto; }
  .rot { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); font-weight: 500; margin-bottom: 4px; }
  .rot b { color: var(--ink); }
  .porque { font-size: 12.5px; color: var(--ink-2); line-height: 1.55; max-width: 860px; margin: 0 0 14px; border-left: 2px solid var(--line-2); padding-left: 11px; }
  .porque b { color: var(--ink); }
  .medida { font-size: 11.5px; color: var(--ink-2); margin: 8px 0 18px; line-height: 1.6; }
  .medida b { color: var(--ink); }
  .mal { color: var(--breathe); font-weight: 600; }
  .bien { color: var(--focus); font-weight: 600; }
  .par { display: flex; gap: 26px; align-items: flex-start; width: max-content; padding-bottom: 6px; }
  .par > * { flex: 0 0 auto; }
  /* El modal calcado vive en la pagina, no en una capa fija: se le quita la
     posicion y la animacion de entrada, y se le fija el ANCHO MEDIDO. */
  .maq { position: relative !important; inset: auto !important; transform: none !important; animation: none !important; opacity: 1 !important; margin: 0 !important; }
  .maq.esc { width: ${esc.ancho}px !important; max-height: none !important; }
  .maq.mov { width: ${mov.ancho}px !important; max-height: none !important; }
  .etiq { font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 6px; }

  /* ===== piezas de las variantes (vocabulario de la app: tokens y nada mas) ===== */
  .sv-meta { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); font-weight: 500; }
  .sv-disp { font-family: var(--font-display); font-style: italic; font-weight: 500; line-height: 1.1; }
  .sv-frase { font-family: var(--font-display); font-style: italic; font-size: 21px; line-height: 1.3; margin: 2px 0 14px; }
  .sv-frase b { font-style: normal; font-weight: 500; }
  .sv-totales { display: flex; gap: 22px; flex-wrap: wrap; font-size: 12px; color: var(--ink-2); }
  .sv-totales b { font-family: var(--font-display); font-style: italic; font-size: 18px; color: var(--ink); font-weight: 500; margin-right: 3px; }
  .sv-nota { margin-top: 12px; padding: 8px; background: var(--paper-2); border-radius: var(--r-sm); font-size: 11px; color: var(--ink-2); line-height: 1.5; }
  .sv-nota strong { color: var(--ink); font-style: italic; font-family: var(--font-display); }
  .sv-puntos { display: flex; gap: 3px; justify-content: center; flex-wrap: wrap; min-height: 6px; }
  .sv-puntos i { width: 6px; height: 6px; border-radius: 50%; display: block; background: var(--c); }
  .sv-dia { font-size: 10.5px; color: var(--ink-3); letter-spacing: .3px; }
  .sv-dia.hoy { color: var(--ink); font-weight: 600; }
  .sv-sep { height: 1px; background: var(--line); margin: 14px 0; }

  /* S1 · una rejilla */
  .s1-graf { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; align-items: end; height: 170px; }
  .s1-col { display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
  .s1-num { font-size: 10.5px; color: var(--ink-3); font-variant-numeric: tabular-nums; min-height: 13px; }
  .s1-pila { width: 100%; max-width: 64px; display: flex; flex-direction: column-reverse; border-radius: 3px 3px 0 0; overflow: hidden; }
  .s1-pila span { display: block; width: 100%; }
  .s1-base { width: 100%; max-width: 64px; height: 2px; background: var(--line); }
  .s1-fut { opacity: .45; }
  .s1-leyenda { display: flex; gap: 14px; font-size: 11px; color: var(--ink-3); margin-top: 12px; flex-wrap: wrap; }
  .s1-leyenda span { display: flex; align-items: center; gap: 5px; }
  .s1-leyenda i { width: 9px; height: 9px; border-radius: 2px; display: block; background: var(--c); }

  /* S2 · como fue cada dia */
  .s2-fila { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
  .s2-dia { border: 1px solid var(--line); border-radius: var(--r-md); background: var(--paper-2); padding: 10px 10px 11px; min-height: 128px; display: flex; flex-direction: column; gap: 5px; }
  .s2-dia.hoy { border-color: var(--ink-2); }
  .s2-dia.fut { background: none; border-style: dashed; }
  .s2-dia.vacio { background: none; }
  /* SIN wrap: con la pastilla de Camino bajando a su linea, el tipo de lunes y
     sabado quedaba mas abajo que el de los otros cinco dias. */
  .s2-cab { display: flex; justify-content: space-between; align-items: baseline; gap: 6px; flex-wrap: nowrap; }
  .s2-dia .sv-puntos { justify-content: flex-start; }
  .s2-tipo { font-family: var(--font-display); font-style: italic; font-size: 16px; line-height: 1.15; color: var(--ink); min-height: 37px; }
  .s2-dia.fut .s2-tipo, .s2-dia.vacio .s2-tipo { color: var(--ink-3); }
  .s2-barra { height: 5px; border-radius: 3px; background: var(--focus); }
  .s2-min { font-size: 11px; color: var(--ink-2); margin-top: auto; }
  .s2-camino { font-size: 9px; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-2); white-space: nowrap; }
  .s2-pie { display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap; align-items: baseline; margin-top: 14px; }
  .s2-ayuda { font-size: 12px; color: var(--ink-2); }
  .s2-ayuda .sv-disp { font-size: 15px; color: var(--ink); }
  .s2-lista .s2-dia { min-height: 0; flex-direction: row; align-items: center; gap: 10px; padding: 8px 10px; }
  .s2-lista .s2-tipo { min-height: 0; font-size: 15px; flex: 1; }
  .s2-lista .s2-min { margin: 0; white-space: nowrap; }
  .s2-lista { display: flex; flex-direction: column; gap: 6px; }

  /* S3 · foco acompanado */
  .s3-filas { display: flex; flex-direction: column; gap: 7px; }
  /* El dato va PEGADO a sus bloques, no al borde: a 1166 px de vista, una columna
     alineada a la derecha quedaba a 700 px de su fila. */
  .s3-fila { display: grid; grid-template-columns: 64px 170px 1fr; gap: 14px; align-items: center; }
  .s3-bloques { display: flex; gap: 6px; flex-wrap: wrap; }
  .s3-b { width: 30px; height: 18px; border-radius: 4px; background: var(--focus); position: relative; }
  .s3-b.sola { background: none; border: 1.5px dashed var(--line-2); }
  .s3-b i { position: absolute; right: -4px; top: 50%; width: 7px; height: 7px; border-radius: 50%; background: var(--c); transform: translateY(-50%); border: 1.5px solid var(--paper); }
  .s3-nada { font-size: 11px; color: var(--ink-3); }
  .s3-dato { font-size: 11.5px; color: var(--ink-2); text-align: left; }
  /* En movil el dato baja a su propia linea, y tiene que quedar PEGADO a sus bloques:
     con el hueco de 14 px de la rejilla aplicado tambien entre filas, «2 de 3 con
     pausa» se leia como del dia siguiente. */
  .s3-mov { gap: 12px; }
  .s3-mov .s3-fila { grid-template-columns: 38px 1fr; row-gap: 3px; column-gap: 10px; }
  .s3-mov .s3-dato { grid-column: 2; }
  .maq.mov .sv-totales { gap: 4px 16px; }
</style>
</head>
<body>

<div class="cab">
  <h1>Stats · la pestaña Semana</h1>
  <p>El panel de estas maquetas <b>no está dibujado: está calcado de la app</b>. Cabecera, pestañas, marco y
     estilos salen del <code>index.html</code> corriendo; solo cambia lo de dentro de la pestaña. Modal de
     escritorio de <b>${esc.ancho} px</b> con una vista de <b>${esc.vistaAncho} × ${esc.vistaAlto} px</b>; en móvil,
     <b>${mov.ancho} px</b> con una vista de <b>${mov.vistaAncho} px</b> de ancho.</p>
  <p><b>S0 es la pestaña de hoy</b>, capturada tal cual, para comparar. S1, S2 y S3 son tres direcciones. Ninguna
     repite la sidebar: la tira de días de la sidebar solo dice <i>si</i> hubo actividad; aquí se ve <i>qué</i>.</p>
  <div class="mandos">
    <button data-tema="light" class="on">Crema</button><button data-tema="dark">Oscuro</button>
    <span class="hueco"></span>
    <button data-dia="mie" class="on">Miércoles (a mitad)</button><button data-dia="dom">Domingo (completa)</button>
    <span class="hueco"></span>
    <button data-v="todas" class="on">Todas</button><button data-v="s0">S0</button><button data-v="s1">S1</button><button data-v="s2">S2</button><button data-v="s3">S3</button>
    <span class="hueco"></span>
    <button data-ajuste="ajustar" class="on">Ajustar al ancho</button><button data-ajuste="real">Tamaño real</button>
  </div>
  <p style="font-size:11.5px;color:var(--ink-3);margin-top:10px">«Ajustar» ESCALA cada fila entera con sus proporciones;
     las medidas se toman siempre a tamaño real, antes de escalar. S0 es una captura de un miércoles, así que no
     cambia con el botón de día.</p>
</div>

<div class="bloque" data-bloque="s0">
  <div class="rot"><b>S0 · lo que hay hoy</b> — capturado de la app</div>
  <p class="porque">Cuatro totales y cuatro filas de barras, cada una con su propia fila de días: <b>28 etiquetas
     «Lun…Dom»</b> para una sola semana, y los totales de arriba son la suma de las filas de abajo. A 1536×714
     <b>scrollea 33 px</b> (medido esta mañana). <b>En móvil las cifras se montan sobre el nombre de cada fila</b>:
     el «75» pisa «Foco». Y no dice nada de lo que el plan pide: ni días con ritmo, ni tipo de día, ni pausas.</p>
  <div class="par"><div><div class="etiq">Escritorio</div><div data-montar="s0" data-modo="esc"></div></div></div>
  <div class="medida" data-salida="s0-esc"></div>
  <div class="par"><div><div class="etiq">Móvil</div><div data-montar="s0" data-modo="mov"></div></div></div>
  <div class="medida" data-salida="s0-mov"></div>
</div>

<div class="bloque" data-bloque="s1">
  <div class="rot"><b>S1 · un solo gráfico</b> — la misma información, sin repetirla</div>
  <p class="porque">Las cuatro filas se funden en <b>una columna por día</b>: el foco abajo, respira y cuerpo encima,
     con el total arriba y <b>un punto por cada pausa</b> debajo. Los días se escriben una vez. Arriba, una frase
     con el ritmo de la semana en vez de cuatro tarjetas que repetían las filas. Es la opción más cercana a lo que
     ya hay: si te gusta el panel y solo te sobra el ruido, es esta.</p>
  <div class="par"><div><div class="etiq">Escritorio</div><div data-montar="s1" data-modo="esc"></div></div></div>
  <div class="medida" data-salida="s1-esc"></div>
  <div class="par"><div><div class="etiq">Móvil</div><div data-montar="s1" data-modo="mov"></div></div></div>
  <div class="medida" data-salida="s1-mov"></div>
</div>

<div class="bloque" data-bloque="s2">
  <div class="rot"><b>S2 · cómo fue cada día</b> — los tipos de jornada del plan (§4.5)</div>
  <p class="porque">Una tarjeta por día que dice <b>qué tipo de día fue</b> («Foco y pausas», «Solo foco»,
     «Solo pausas», «Sin registro») con los minutos y las pausas. <b>El tipo NO lleva color propio</b>: los
     colores del panel ya significan módulos (verde es Foco), y pintar los tipos con ellos los confundiría; el
     color solo aparece en la barra y los puntos, donde sigue diciendo el módulo. Los días que aún no han llegado
     van con borde discontinuo y vacíos, que no es lo mismo que «sin registro». Al pie, lo que <b>te ayudó</b> esta
     semana (tus «Sí» fechados, que existen desde que emiten los eventos). Los nombres de los tipos son
     provisionales, como dice el plan.</p>
  <div class="par"><div><div class="etiq">Escritorio</div><div data-montar="s2" data-modo="esc"></div></div></div>
  <div class="medida" data-salida="s2-esc"></div>
  <div class="par"><div><div class="etiq">Móvil</div><div data-montar="s2" data-modo="mov"></div></div></div>
  <div class="medida" data-salida="s2-mov"></div>
</div>

<div class="bloque" data-bloque="s3">
  <div class="rot"><b>S3 · foco acompañado</b> — la pregunta del producto, a lo largo de la semana</div>
  <p class="porque">Cada bloque de foco es un rectángulo; <b>si después hubo pausa lleva su punto</b>, del color de la
     pausa, y si no la hubo va en discontinuo, sin rojo ni aviso. Arriba, la frase que lo resume. Es la variante
     que más se aleja de lo que hay y la única que responde a «¿estoy parando entre bloques?», que es para lo que
     existe PACE. Necesita los eventos, así que solo cubre desde v0.102.0.</p>
  <div class="par"><div><div class="etiq">Escritorio</div><div data-montar="s3" data-modo="esc"></div></div></div>
  <div class="medida" data-salida="s3-esc"></div>
  <div class="par"><div><div class="etiq">Móvil</div><div data-montar="s3" data-modo="mov"></div></div></div>
  <div class="medida" data-salida="s3-mov"></div>
</div>

${plantilla('modal-esc', esc.modal)}
${plantilla('modal-mov', mov.modal)}
${plantilla('s0-esc', esc.semana)}
${plantilla('s0-mov', mov.semana)}

<script>
const VISTA_ALTO = ${JSON.stringify(esc.vistaAlto)};
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const FECHAS = [14, 15, 16, 17, 18, 19, 20];

/* Dos momentos de la misma semana. Lunes-primero. «bloques» y «tras» (bloques con
   pausa detras) y «pausas» salen de los EVENTOS; los minutos, de weeklyStats. */
const DATOS = {
  mie: { hoy: 2,
    foco: [75, 50, 25, 0, 0, 0, 0], respira: [10, 0, 5, 0, 0, 0, 0], cuerpo: [8, 0, 0, 0, 0, 0, 0],
    agua: [6, 4, 3, 0, 0, 0, 0],
    bloques: [3, 2, 1, 0, 0, 0, 0],
    /* por bloque: 'b' respira detras, 'c' cuerpo detras, '' sin pausa */
    tras: [['b', 'c', ''], ['', ''], ['b'], [], [], [], []],
    pausas: [[ 'b', 'c', 'b' ], [], ['b'], [], [], [], []],
    camino: [true, false, false, false, false, false, false],
    ayudaron: ['Caderas', 'Box 4·4·4·4'] },
  dom: { hoy: 6,
    foco: [75, 50, 25, 90, 45, 0, 0], respira: [10, 0, 5, 12, 0, 15, 0], cuerpo: [8, 0, 0, 6, 4, 10, 0],
    agua: [6, 4, 3, 7, 5, 2, 0],
    bloques: [3, 2, 1, 4, 2, 0, 0],
    tras: [['b', 'c', ''], ['', ''], ['b'], ['c', 'b', 'c', ''], ['c', ''], [], []],
    pausas: [['b', 'c', 'b'], [], ['b'], ['c', 'b', 'c', 'b'], ['c'], ['b', 'c'], []],
    camino: [true, false, false, false, false, true, false],
    ayudaron: ['Caderas', 'Box 4·4·4·4', 'Hombros ligeros'] },
};
const COLOR = { b: 'var(--breathe)', c: 'var(--move)' };

function tipo(d, i) {
  if (i > d.hoy) return { nombre: '—', clase: 'fut' };
  const f = d.foco[i] > 0, p = (d.respira[i] + d.cuerpo[i]) > 0;
  if (f && p) return { nombre: 'Foco y pausas', clase: '' };
  if (f) return { nombre: 'Solo foco', clase: '' };
  if (p) return { nombre: 'Solo pausas', clase: '' };
  return { nombre: 'Sin registro', clase: 'vacio' };
}
const suma = a => a.reduce((x, y) => x + y, 0);
/* «Dia en ritmo»: el criterio vigente de s69 -- foco, respira o cuerpo; el agua sola no. */
const enRitmo = d => d.foco.filter((v, i) => i <= d.hoy && (v + d.respira[i] + d.cuerpo[i]) > 0).length;
const puntos = lista => '<div class="sv-puntos">' + lista.map(k => '<i style="--c:' + COLOR[k] + '"></i>').join('') + '</div>';
const nPausas = d => d.pausas.reduce((a, p) => a + p.length, 0);
const nTras = d => d.tras.reduce((a, t) => a + t.filter(Boolean).length, 0);

const NOTA = '<div class="sv-nota"><strong>Nota:</strong> no medimos para juzgarte. Los números están aquí para que reconozcas tus ritmos, no para que los persigas.</div>';

function totales(d) {
  return '<div class="sv-totales">'
    + '<span><b>' + suma(d.foco) + '</b>min de foco</span>'
    + '<span><b>' + nPausas(d) + '</b>pausas</span>'
    + '<span><b>' + (suma(d.respira) + suma(d.cuerpo)) + '</b>min de pausa</span>'
    + '<span><b>' + suma(d.agua) + '</b>vasos</span></div>';
}

const R = {
  s1(d, modo) {
    const tot = d.foco.map((f, i) => f + d.respira[i] + d.cuerpo[i]);
    const max = Math.max(1, ...tot);
    const alto = modo === 'mov' ? 110 : 150;
    const cols = DIAS.map((dia, i) => {
      const fut = i > d.hoy;
      const h = v => (v / max) * alto;
      const pila = tot[i] > 0
        ? '<div class="s1-pila">'
          + '<span style="height:' + h(d.foco[i]) + 'px;background:var(--focus)"></span>'
          + '<span style="height:' + h(d.respira[i]) + 'px;background:var(--breathe)"></span>'
          + '<span style="height:' + h(d.cuerpo[i]) + 'px;background:var(--move)"></span></div>'
        : '';
      return '<div class="s1-col' + (fut ? ' s1-fut' : '') + '">'
        + '<div class="s1-num">' + (tot[i] > 0 ? tot[i] : '') + '</div>'
        + pila + '<div class="s1-base"></div>'
        + puntos(d.pausas[i])
        + '<div class="sv-dia' + (i === d.hoy ? ' hoy' : '') + '">' + dia + '</div></div>';
    }).join('');
    return '<div class="sv-frase">' + (modo === 'mov' ? '' : 'Esta semana, ') + '<b>' + enRitmo(d) + ' días en ritmo</b>'
      + (modo === 'mov' ? '' : ' y ' + nPausas(d) + ' pausas.') + '</div>'
      + '<div class="s1-graf" style="height:' + (alto + 56) + 'px' + (modo === 'mov' ? ';gap:5px' : '') + '">' + cols + '</div>'
      + '<div class="s1-leyenda"><span style="--c:var(--focus)"><i></i>Foco</span><span style="--c:var(--breathe)"><i></i>Respira</span>'
      + '<span style="--c:var(--move)"><i></i>Cuerpo</span><span><i style="border-radius:50%;width:6px;height:6px;background:var(--ink-3)"></i>una pausa</span></div>'
      + '<div class="sv-sep"></div>' + totales(d)
      + (modo === 'mov' ? '' : NOTA);
  },
  s2(d, modo) {
    const maxF = Math.max(1, ...d.foco);
    const tarjetas = DIAS.map((dia, i) => {
      const t = tipo(d, i);
      const fut = t.clase === 'fut';
      const pausa = d.respira[i] + d.cuerpo[i];
      /* «0 min» no se escribe nunca: en un dia sin foco se leia como que las pausas
         habian durado cero. El foco se nombra si lo hubo; si no, los minutos de pausa. */
      const partes = [];
      if (!fut && d.foco[i] > 0) partes.push(d.foco[i] + ' min');
      if (!fut && d.foco[i] === 0 && pausa > 0) partes.push(pausa + ' min de pausa');
      if (!fut && d.pausas[i].length) partes.push(d.pausas[i].length + (d.pausas[i].length === 1 ? ' pausa' : ' pausas'));
      const meta = partes.join(' · ');
      if (modo === 'mov') {
        return '<div class="s2-dia ' + t.clase + (i === d.hoy ? ' hoy' : '') + '">'
          + '<span class="sv-dia' + (i === d.hoy ? ' hoy' : '') + '" style="width:30px">' + dia + '</span>'
          + '<span class="s2-tipo">' + t.nombre + '</span>'
          + (fut ? '' : puntos(d.pausas[i]))
          + '<span class="s2-min">' + meta + '</span></div>';
      }
      return '<div class="s2-dia ' + t.clase + (i === d.hoy ? ' hoy' : '') + '">'
        + '<div class="s2-cab"><span class="sv-dia' + (i === d.hoy ? ' hoy' : '') + '">' + dia + ' ' + FECHAS[i] + '</span>'
        + (d.camino[i] ? '<span class="s2-camino">Camino</span>' : '') + '</div>'
        + '<div class="s2-tipo">' + t.nombre + '</div>'
        + (fut ? '' : '<div class="s2-barra" style="width:' + Math.max(d.foco[i] ? 8 : 0, d.foco[i] / maxF * 100) + '%"></div>')
        + (fut ? '' : puntos(d.pausas[i]))
        + '<div class="s2-min">' + meta + (pausa && !fut && d.foco[i] > 0 ? '<br><span style="color:var(--ink-3)">' + pausa + ' min de pausa</span>' : '') + '</div></div>';
    }).join('');
    const cuerpo = modo === 'mov'
      ? '<div class="s2-lista">' + tarjetas + '</div>'
      : '<div class="s2-fila">' + tarjetas + '</div>';
    return '<div class="sv-frase"><b>' + enRitmo(d) + ' días en ritmo</b>' + (modo === 'mov' ? '' : ' esta semana.') + '</div>'
      + cuerpo
      + '<div class="s2-pie"><div class="s2-ayuda"><span class="sv-meta">Te ayudó</span><br><span class="sv-disp">'
      + d.ayudaron.join(' · ') + '</span></div>' + (modo === 'mov' ? '' : totales(d)) + '</div>';
  },
  s3(d, modo) {
    const filas = DIAS.map((dia, i) => {
      if (i > d.hoy) return '';
      const bl = d.tras[i];
      const cont = bl.length
        ? '<div class="s3-bloques">' + bl.map(k => '<span class="s3-b' + (k ? '' : ' sola') + '">' + (k ? '<i style="--c:' + COLOR[k] + '"></i>' : '') + '</span>').join('') + '</div>'
        : '<span class="s3-nada">' + (d.pausas[i].length ? 'Sin foco · ' + d.pausas[i].length + ' pausas sueltas' : 'Sin registro') + '</span>';
      const dato = bl.length ? (bl.filter(Boolean).length + ' de ' + bl.length + ' con pausa · ' + d.foco[i] + ' min') : '';
      return '<div class="s3-fila"><span class="sv-dia' + (i === d.hoy ? ' hoy' : '') + '">' + dia + (modo === 'mov' ? '' : ' ' + FECHAS[i]) + '</span>'
        + cont + '<span class="s3-dato">' + dato + '</span></div>';
    }).join('');
    const total = suma(d.bloques);
    return '<div class="sv-frase">De tus <b>' + total + ' bloques</b> de foco, <b>' + nTras(d) + ' llevaron pausa detrás</b>.</div>'
      + '<div class="s3-filas' + (modo === 'mov' ? ' s3-mov' : '') + '">' + filas + '</div>'
      + '<div class="s1-leyenda"><span><i style="background:var(--focus)"></i>bloque de foco</span>'
      + '<span><i style="background:none;border:1.5px dashed var(--line-2)"></i>sin pausa detrás</span>'
      + '<span style="--c:var(--breathe)"><i style="border-radius:50%"></i>Respira</span><span style="--c:var(--move)"><i style="border-radius:50%"></i>Cuerpo</span></div>'
      + '<div class="sv-sep"></div>' + totales(d);
  },
};

let DIA = 'mie';

/* CADA MODAL VIVE EN UN IFRAME DEL ANCHO DEL DISPOSITIVO, y no es un capricho: las
   reglas «@media (max-width: 640px)» de la app se evaluan contra el ancho de la
   VENTANA. Pintado directamente en esta pagina (1440 px), el modal de movil llevaba
   las reglas de escritorio -- su vista medía 300 px en vez de 316 y NO reproducia el
   solape de cifras que la app real tiene. El iframe es el unico sitio donde un
   calco de movil se comporta como movil. */
const VIEWPORT = { esc: ${esc.viewport}, mov: ${mov.viewport} };

function docDe(slot) {
  const f = slot.querySelector('iframe');
  return f && f.contentDocument;
}

function montar() {
  document.querySelectorAll('[data-montar]').forEach(slot => {
    const v = slot.getAttribute('data-montar'), modo = slot.getAttribute('data-modo');
    slot.innerHTML = '';
    const marco = document.createElement('iframe');
    marco.style.cssText = 'display:block;border:0;background:transparent;width:' + VIEWPORT[modo] + 'px';
    slot.appendChild(marco);
    const d = marco.contentDocument;
    d.open();
    d.write('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
    d.close();
    /* Las hojas se CLONAN de esta pagina: asi la copia autocontenida, que lleva los
       tokens y las fuentes incrustados aqui arriba, los lleva tambien dentro. */
    document.querySelectorAll('head style, head link[rel=stylesheet]').forEach(h => d.head.appendChild(h.cloneNode(true)));
    d.documentElement.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') || 'light');
    d.documentElement.setAttribute('data-font', 'cormorant');
    d.body.style.cssText = 'margin:0;padding:12px 0;background:transparent';
    const tpl = document.getElementById('modal-' + modo).content.cloneNode(true);
    const modal = tpl.firstElementChild;
    modal.classList.add('maq', modo);
    modal.style.marginLeft = 'auto';
    modal.style.marginRight = 'auto';
    const vista = modal.querySelector('[data-pace-stats-vistas]');
    vista.setAttribute('data-medir', v + '-' + modo);
    vista.innerHTML = v === 's0'
      ? document.getElementById('s0-' + modo).innerHTML
      : R[v](DATOS[DIA], modo);
    d.body.appendChild(modal);
  });
}

/* El alto del iframe se ajusta a lo que tiene dentro, cada vez que cambia algo. */
function altoMarcos() {
  document.querySelectorAll('[data-montar] iframe').forEach(f => {
    const d = f.contentDocument;
    if (d && d.body) f.style.height = Math.ceil(d.body.scrollHeight) + 'px';
  });
}

function medir() {
  const vistas = [];
  document.querySelectorAll('[data-montar]').forEach(slot => {
    const d = docDe(slot);
    if (d) d.querySelectorAll('[data-medir]').forEach(x => vistas.push(x));
  });
  vistas.forEach(vista => {
    const id = vista.getAttribute('data-medir');
    const out = document.querySelector('[data-salida="' + id + '"]');
    if (!out) return;
    const hijos = Array.from(vista.children);
    let alto = 0;
    hijos.forEach(c => {
      const cs = c.ownerDocument.defaultView.getComputedStyle(c);
      alto += c.getBoundingClientRect().height + parseFloat(cs.marginTop || 0) + parseFloat(cs.marginBottom || 0);
    });
    alto = Math.round(alto * 10) / 10;
    const mov = id.endsWith('-mov');
    /* El techo de escritorio es el de s176: lo que cabe a 1536x714. */
    const techo = 385;
    const cabe = alto <= techo;
    /* Solapes: una etiqueta que se monta sobre otra, lo que S0 hace en movil. */
    const textos = Array.from(vista.querySelectorAll('span, div')).filter(e => e.children.length === 0 && e.textContent.trim() && e.getBoundingClientRect().width > 0);
    let solapes = 0;
    for (let a = 0; a < textos.length; a++) for (let b = a + 1; b < textos.length; b++) {
      const p = textos[a].getBoundingClientRect(), q = textos[b].getBoundingClientRect();
      const x = Math.min(p.right, q.right) - Math.max(p.left, q.left);
      const y = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top);
      if (x > 2 && y > 2 && !textos[a].contains(textos[b]) && !textos[b].contains(textos[a])) solapes++;
    }
    out.innerHTML = '<b>' + id + '</b>: contenido <b>' + alto + ' px</b>'
      + (mov ? ' (en móvil el panel scrollea; se compara entre variantes)'
             : ' · techo ' + techo + ' → <span class="' + (cabe ? 'bien' : 'mal') + '">'
               + (cabe ? 'cabe, sobran ' + Math.round((techo - alto) * 10) / 10 + ' px' : 'se pasa ' + Math.round((alto - techo) * 10) / 10 + ' px') + '</span>')
      + ' · textos que se pisan: <span class="' + (solapes ? 'mal' : 'bien') + '">' + solapes + '</span>'
      + ' · ancho de la vista <b>' + Math.round(vista.getBoundingClientRect().width) + ' px</b>';
  });
}

function ajustar() {
  const modo = document.documentElement.getAttribute('data-ajuste') || 'ajustar';
  const filas = Array.from(document.querySelectorAll('.par'));
  filas.forEach(p => { p.style.zoom = 1; });
  altoMarcos();
  medir();
  if (modo !== 'ajustar') return;
  filas.forEach(p => {
    const natural = p.getBoundingClientRect().width, disp = p.parentElement.clientWidth;
    if (natural > 0 && disp > 0) p.style.zoom = Math.min(1, disp / natural);
  });
}

function todo() { montar(); ajustar(); }

function grupo(attr, alPulsar) {
  document.querySelectorAll('[' + attr + ']').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('[' + attr + ']').forEach(o => o.classList.toggle('on', o === b));
    alPulsar(b.getAttribute(attr));
  }));
}
grupo('data-tema', t => {
  document.documentElement.setAttribute('data-theme', t);
  document.querySelectorAll('[data-montar] iframe').forEach(f => f.contentDocument && f.contentDocument.documentElement.setAttribute('data-theme', t));
  ajustar();
});
grupo('data-dia', d => { DIA = d; todo(); });
grupo('data-v', q => {
  document.querySelectorAll('[data-bloque]').forEach(x => { x.hidden = !(q === 'todas' || x.getAttribute('data-bloque') === q); });
  ajustar();
});
grupo('data-ajuste', a => { document.documentElement.setAttribute('data-ajuste', a); ajustar(); });
document.documentElement.setAttribute('data-theme', 'light');
document.documentElement.setAttribute('data-ajuste', 'ajustar');
window.addEventListener('resize', ajustar);
window.addEventListener('load', todo);
todo();
setTimeout(ajustar, 400);
setTimeout(ajustar, 1200);
</script>
</body>
</html>
`;
}

module.exports = { pagina };
