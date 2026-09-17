/* PACE · las PIEZAS que pinta «A tu ritmo» (s192 · ronda 4)
 * =========================================================
 * Todo lo que es HTML del panel, la línea del día, la lista y la hoja. Se incrusta con
 * `toString` junto a `pmMontar` (menu-s192-componente.js), que le pasa el contexto:
 *   X = { S, H, AJ, MOVIL, R, G, hora, menuDe, politica }
 * y recibe las funciones de dibujo. Vive aparte para que ninguno de los dos pase de
 * 500 líneas (regla §1).
 *
 * RONDA 4, lo que cambia aquí:
 *   · las etiquetas de la línea vuelven a la distribución de la ronda 2 (hora · plato ·
 *     «3 MIN · ESTIRA» con su gota), que el usuario prefería «por si alguien no sabe»
 *     qué módulo es cada glifo;
 *   · el horario tiene CUATRO horas editables en la frase: inicio, comida, cuánto dura
 *     y salida;
 *   · si llegas tarde y la política es «que me pregunte», el día ofrece las dos salidas
 *     en lugar de la línea, hasta que eliges.
 */
'use strict';

function pmPiezas(X) {
  var hora = X.hora, R = X.R;
  var COLOR = { estira: 'var(--extra)', mueve: 'var(--move)', respira: 'var(--breathe)', cierre: 'var(--breathe)',
                foco: 'var(--focus)', agua: 'var(--hydrate)', comida: 'var(--ink-2)' };
  var MODULO = { estira: 'Estira', mueve: 'Mueve', respira: 'Respira', cierre: 'Respira' };
  var DESCRIPTOR = { 15: 'Foco breve', 25: 'Concentración profunda', 35: 'Atención sostenida', 45: 'Trabajo en profundidad' };
  var CRUZ = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  var CTX = '<div class="pm-ctx"><span>Junto a la mesa</span><span>Sin material</span></div>';
  var LIBRE = '<button class="pm-enlace" data-pm-accion="libre">Hoy voy por libre</button>';
  var OPCIONES = ['1h', '2h', 'media', 'jornada'];

  function descriptor(min) { return DESCRIPTOR[min] || (min < 20 ? 'Foco breve' : min < 30 ? DESCRIPTOR[25] : min < 45 ? DESCRIPTOR[35] : min < 60 ? DESCRIPTOR[45] : 'Sesión extendida'); }
  function glifo(k, clase) {
    var dibujo = k === 'comida' ? R.COMIDA : X.G[k];
    return '<span class="pm-g' + (clase ? ' ' + clase : '') + '" style="--c:' + COLOR[k] + '" aria-hidden="true">' + (dibujo || '') + '</span>';
  }
  function gota() { return glifo('agua', 'pm-g-gota'); }
  function conGota(texto) {   /* pegada a la última palabra: suelta, a 360 px caía sola */
    var corte = texto.lastIndexOf(' ') + 1;
    return texto.slice(0, corte) + '<span style="white-space:nowrap">' + texto.slice(corte) + gota() + '</span>';
  }
  function nombres(it, sep) { return it.platos.map(function (p) { return p.nombre; }).join(sep || ' + '); }
  function claves(it) { return it.platos.map(function (p) { return p.clave; }).join(','); }
  function primerBloque(m) { return m.items.find(function (it) { return it.tipo === 'foco'; }); }
  function primeraPausa(m) { return m.items.find(function (it) { return it.tipo === 'pausa'; }) || m.items[m.items.length - 1]; }
  function duracion(min) {
    var h = Math.floor(min / 60), r = min % 60;
    return (h ? h + ' h' : '') + (h && r ? ' ' : '') + (r ? r + ' min' : '');
  }
  function resumen(m) {
    var r = m.resumen;
    return duracion(r.focoMin) + ' de foco · ' + r.pausas + (r.pausas === 1 ? ' pausa' : ' pausas') + ' · ' + r.vasos + ' vasos';
  }
  function metaPlato(it) {
    if (it.larga) return 'Pausa larga · ' + it.dur + ' min · Respira y Estira';
    var p = it.platos[0];
    return p.min + ' min · ' + MODULO[p.modulo] + ' · ' + it.motivo;
  }

  /* --- el horario, editable dentro de la frase --------------------------- */
  function selector(campo, valores, fmt) {
    var nombre = { inicio: 'Hora a la que empiezas', comida: 'Hora a la que comes', comidaDur: 'Cuánto dura la comida', salida: 'Hora a la que terminas' };
    return '<select class="pm-sel" data-pm-horario="' + campo + '" aria-label="' + nombre[campo] + '">'
      + valores.map(function (v) { return '<option value="' + v + '"' + (v === X.H[campo] ? ' selected' : '') + '>' + fmt(v) + '</option>'; }).join('')
      + '</select>';
  }
  function cada30(desde, hasta) { var l = []; for (var v = desde; v <= hasta; v += 30) l.push(v); return l; }
  function sel(campo) {
    /* Formato corto («1 h 30»): con «1 h 30 min» la frase partía en dos líneas a 360 px. */
    if (campo === 'comidaDur') return selector(campo, [30, 45, 60, 90, 120], function (v) { return v < 60 ? v + ' min' : duracion(v).replace(' min', ''); });
    var rango = { inicio: [360, 780], comida: [660, 960], salida: [720, 1320] }[campo];
    return selector(campo, cada30(rango[0], rango[1]), hora);
  }
  function fraseLarga() {
    return '<div class="pm-sub pm-frase">Empiezas a las ' + sel('inicio') + ', comes a las ' + sel('comida')
      + ' durante ' + sel('comidaDur') + ' y terminas a las ' + sel('salida') + '.</div>';
  }
  function hoyTarde(m) { return m.tarde ? ' · hoy de ' + hora(m.desde) + ' a ' + hora(m.hasta) : ''; }
  function fraseMenu(m) {
    return 'de ' + sel('inicio') + ' a ' + (m.opcion === 'jornada' ? sel('salida') : hora(m.hasta))
      + ' · comida a las ' + sel('comida') + ' durante ' + sel('comidaDur') + hoyTarde(m);
  }

  /* --- llegar tarde: «que me pregunte» ----------------------------------- */
  function preguntaTarde(m) {
    return m && m.tarde && m.opcion === 'jornada' && X.AJ.tarde === 'pregunta' && !X.S.decision;
  }
  function aviso(m) {
    var a = X.menuDe('jornada', 'salida'), b = X.menuDe('jornada', 'horas');
    return '<div class="pm-aviso"><div class="pm-aviso-t">Hoy empiezas a las ' + hora(m.desde) + '. ¿Cómo sigue el día?</div>'
      + '<div class="pm-aviso-b">'
      + '<button class="pm-chip" data-pm-decide="salida"><b>Salgo a las ' + hora(a.hasta) + '</b><span>' + duracion(a.resumen.focoMin) + ' de foco</span></button>'
      + '<button class="pm-chip" data-pm-decide="horas"><b>Hago mis horas</b><span>' + duracion(b.resumen.focoMin) + ' de foco · hasta las ' + hora(b.hasta) + '</span></button>'
      + '</div></div>';
  }

  /* --- la línea del día -------------------------------------------------- */
  function etiqueta(it, extra) {
    var n, m;
    if (it.tipo === 'comida') { n = 'Comida'; m = 'Lejos de la pantalla'; }
    else if (it.larga) { n = nombres(it, '<br>+ '); m = 'Pausa larga · ' + it.dur + ' min'; }
    else { n = nombres(it); m = it.platos[0].min + ' min · ' + MODULO[it.platos[0].modulo]; }
    return '<div class="pm-etiq' + (extra || '') + '" data-pm-etiq><div class="pm-h">' + hora(it.desde) + '</div>'
      + '<div class="pm-n">' + n + '</div><div class="pm-m">' + m + (it.agua ? gota() : '') + '</div></div>';
  }

  /* Proporcional al tiempo. Con `rotulos` (escritorio) cada parada ES su glifo en un
     aro fino; sin ellos (la línea pequeña del móvil) son puntos: a 8 px un dibujo no
     se lee. */
  function linea(m, rotulos) {
    var ultimo = m.items.length - 1;
    return m.items.map(function (it, i) {
      if (it.tipo === 'foco' || it.tipo === 'comida' || it.tipo === 'libre') {
        var ahora = it.tipo === 'foco' && it.n === 1;
        var titulo = it.tipo === 'foco' ? 'Foco · ' + it.dur + ' min · ' + hora(it.desde) : it.tipo === 'libre' ? 'Margen libre · ' + it.dur + ' min' : 'Comida · ' + duracion(it.dur);
        return '<div class="pm-seg pm-' + it.tipo + (ahora ? ' pm-ahora' : '') + '" style="flex:' + it.dur + ' 1 0" title="' + titulo + '">'
          + (ahora && rotulos ? '<span class="pm-ahora-tag">Ahora</span>' : '')
          + (it.tipo === 'comida' && rotulos ? '<span class="pm-comida-nodo" style="--c:' + COLOR.comida + '">' + glifo('comida') + '</span>' + etiqueta(it) : '')
          + '</div>';
      }
      return '<div class="pm-nodo pm-toca' + (it.larga ? ' pm-larga' : '') + (rotulos ? ' pm-gnodo' : '') + '" style="--c:' + COLOR[it.platos[0].modulo]
        + '" data-pm-cambia="' + claves(it) + '" title="' + nombres(it) + ' · toca para cambiarla">'
        + (rotulos ? it.platos.map(function (p) { return glifo(p.modulo); }).join('') + etiqueta(it, i === ultimo ? ' pm-final' : '') : '')
        + '</div>';
    }).join('');
  }

  /* --- los estados del panel --------------------------------------------- */
  function chips() {
    return '<div class="pm-chips">' + OPCIONES.map(function (op) {
      var m = X.menuDe(op);
      return '<button class="pm-chip" data-pm-opcion="' + op + '"><b>' + m.etiqueta + '</b><span>Hasta las ' + hora(m.hasta) + '</span></button>';
    }).join('') + '</div>';
  }

  function pregunta() {
    return '<div class="pm-panel"><div class="pm-cab"><div><div class="pm-titulo">¿Cuánto trabajas hoy?</div>'
      + (X.MOVIL ? '' : '<div class="pm-sub">' + R.SUB + '</div>') + fraseLarga() + '</div>'
      + (X.MOVIL ? '' : '<div class="pm-pie-der">' + LIBRE + '</div>') + '</div>'
      + chips()
      + (X.MOVIL ? '<div class="pm-pie"><span></span>' + LIBRE + '</div>' : '') + '</div>';
  }

  /* Cabecera: el nombre del día y su frase a la izquierda, el contexto a la derecha.
     El resumen y las dos acciones van ENCIMA de la línea, a la derecha, en la franja
     que ya ocupaba «Ahora»: así la frase del horario cabe en una línea. */
  function panelEscritorio(m) {
    var cuerpo = preguntaTarde(m) ? aviso(m)
      : '<div class="pm-linea"><div class="pm-sobre"><span class="pm-meta">' + resumen(m) + '</span>'
        + '<button class="pm-enlace" data-pm-accion="cambiar">Cambiar</button>' + LIBRE + '</div>'
        + linea(m, true) + '</div><div class="pm-zona" data-pm-zona></div>';
    return '<div class="pm-panel"><div class="pm-cab" style="align-items:center">'
      + '<div class="pm-titulo">' + m.etiqueta + ' <span class="pm-sub" style="display:inline">· ' + fraseMenu(m) + '</span></div>'
      + CTX + '</div>' + cuerpo
      + (preguntaTarde(m) ? '<div class="pm-pie"><span></span><span class="pm-pie-der"><button class="pm-enlace" data-pm-accion="cambiar">Cambiar</button>' + LIBRE + '</span></div>' : '')
      + '</div>';
  }

  function fila(rotulo, modulo, nombre, meta, clave) {
    return '<div class="pm-fila"><div class="pm-meta">' + rotulo + '</div><div class="pm-que">'
      + '<div class="pm-n">' + glifo(modulo, 'pm-g-fila') + nombre + '</div>'
      + '<div class="pm-m">' + meta + '</div></div>'
      + (clave ? '<button class="pm-otra" data-pm-cambia="' + clave + '">Otra</button>' : '<span></span>') + '</div>';
  }

  function panelMovil(m) {
    var b = primerBloque(m), p = primeraPausa(m);
    var cuerpo = preguntaTarde(m) ? aviso(m)
      : '<div class="pm-mini">' + linea(m, false) + '</div>'
        + fila('Ahora<br>' + hora(b.desde), 'foco', 'Foco · bloque 1 de ' + b.de, b.dur + ' min · ' + descriptor(b.dur), null)
        + fila('Luego<br>' + hora(p.desde), p.platos[0].modulo, nombres(p), p.agua ? conGota(metaPlato(p)) : metaPlato(p), claves(p));
    return '<div class="pm-panel"><div class="pm-cab"><div><div class="pm-titulo">' + m.etiqueta + '</div>'
      + '<div class="pm-sub pm-frase">De ' + sel('inicio') + ' a ' + (m.opcion === 'jornada' ? sel('salida') : hora(m.hasta))
      + ' · comida ' + sel('comida') + ' · ' + sel('comidaDur') + '</div></div>'
      + '<button class="pm-enlace" data-pm-accion="cambiar">Cambiar</button></div>'
      + cuerpo
      + '<div class="pm-pie">' + (preguntaTarde(m) ? '<span></span>' : '<button class="pm-enlace pm-fuerte" data-pm-accion="hoja">Ver la jornada entera</button>') + LIBRE + '</div></div>';
  }

  function lista(m) {
    return '<div class="pm-lista">' + m.items.map(function (it) {
      var h = '<div class="pm-h">' + hora(it.desde) + '</div>';
      if (it.tipo === 'foco' || it.tipo === 'libre') {
        return '<div class="pm-li pm-foco pm-' + it.tipo + '">' + h + '<div class="pm-eje"></div><div class="pm-txt">'
          + (it.tipo === 'libre' ? 'Margen libre · ' + it.dur + ' min' : 'Foco · ' + it.dur + ' min')
          + (it.n === 1 ? ' · <b style="color:var(--focus);font-weight:500">ahora</b>' : '') + '</div><span></span></div>';
      }
      var comida = it.tipo === 'comida';
      var modulo = comida ? 'comida' : it.platos[0].modulo;
      var meta = comida ? duracion(it.dur) + ' lejos de la pantalla' : metaPlato(it);
      var eje = '<i class="pm-gi' + (it.larga ? ' pm-larga' : '') + '" style="--c:' + COLOR[modulo] + '">'
        + (comida ? glifo('comida') : it.platos.map(function (p) { return glifo(p.modulo); }).join('')) + '</i>';
      return '<div class="pm-li pm-plato">' + h + '<div class="pm-eje">' + eje + '</div>'
        + '<div><div class="pm-plato-n">' + (comida ? 'Comida' : nombres(it, '<br>+ ')) + '</div>'
        + '<div class="pm-plato-m">' + (it.agua ? conGota(meta) : meta) + '</div></div>'
        + (comida ? '<span></span>' : '<button class="pm-otra" data-pm-cambia="' + claves(it) + '">Otra</button>') + '</div>';
    }).join('') + '</div>';
  }

  function hoja(m) {
    var cab = '<div class="pm-cab"><div><div class="pm-eyebrow">' + R.NOMBRE + '</div>'
      + '<div class="pm-titulo" style="font-size:24px;margin-top:4px">' + (m ? m.etiqueta : '¿Cuánto trabajas hoy?') + '</div>'
      + (m ? '<div class="pm-sub pm-frase">' + fraseMenu(m).replace(/^de /, 'De ') + '</div><div class="pm-sub">' + resumen(m) + '</div>' : fraseLarga())
      + '</div><button class="pm-cerrar" data-pm-accion="cerrar" aria-label="Cerrar">' + CRUZ + '</button></div>';
    var cuerpo = !m ? chips() : preguntaTarde(m) ? aviso(m)
      : '<div style="margin-top:12px">' + CTX.replace('pm-ctx"', 'pm-ctx" style="justify-content:flex-start"') + '</div>' + lista(m);
    var pie = '<div class="pm-acciones">' + (m ? '<button class="pm-enlace" data-pm-accion="cambiar">Cambiar</button><button class="pm-cta" data-pm-accion="cerrar">Empezar jornada</button>'
      : LIBRE + '<span></span>') + '</div>';
    return '<div class="pm-velo ' + (X.MOVIL ? 'pm-hoja' : 'pm-modal') + '" data-pm data-pm-velo><div class="pm-caja" role="dialog" aria-label="' + R.NOMBRE + '">'
      + (X.MOVIL ? '<div class="pm-asa"></div>' : '') + cab + '<div class="pm-cuerpo" data-pm-cuerpo>' + cuerpo + '</div>' + pie + '</div></div>';
  }

  return { COLOR: COLOR, MODULO: MODULO, descriptor: descriptor, nombres: nombres, primerBloque: primerBloque,
           primeraPausa: primeraPausa, pregunta: pregunta, panelEscritorio: panelEscritorio, panelMovil: panelMovil, hoja: hoja };
}

module.exports = { pmPiezas };
