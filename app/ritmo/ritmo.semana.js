/* PACE · A tu ritmo · LA SEMANA (s195c · v0.128.0)
   =============================================
   El norte del usuario: «acompañar el día pero ir ofreciendo propuestas para cada
   día de la semana/mes», y «cada semana del año tiene que ser diferente o al
   menos coherente con el bienestar». Lectura A (s194): TODO SALE DE LA FECHA —
   reproducible, offline, sin datos de uso—:

     tema de la semana (por semana ISO, seis en ciclo: cada uno vuelve cada seis)
     × acento del día (lunes a viernes; el fin de semana, ninguno)
     × la regla del día de siempre (ritmoComponer, que no se toca)

   El tema REORDENA los pozos (la región del tema va primero); el acento cambia
   la FORMA del día: arrancar con Mueve, la larga antes, respirar antes de comer,
   cerrar con un Respira más largo.

   Y NADA DE ESTO SE ANUNCIA. Se propusieron tres sistemas de copy y tres formas
   mínimas (un chip, una línea, nada) y el usuario eligió «nada» («menos es más»):
   la variedad se ve en la línea y no se explica. Los nombres y motivos de abajo
   quedan como DATO —para la hoja, Stats o un futuro—, no se pintan.

   LO MEDIDO ANTES (s194): junto a la mesa y gratis hay Estira 6 · Mueve 4 ·
   Respira 5 · cierre 1. Una jornada sirve ~4 platos de Estira, así que la
   repetición semanal es inevitable: lo que varía es QUÉ REGIÓN LIDERA, EN QUÉ
   ORDEN y LA FORMA DEL DÍA. Dos semanas seguidas dan 13 platos distintos cada una.

   Es PURA como la regla: no lee reloj, estado ni window. Prototipo: la REGLA de
   scripts/audit/semana-s194.js, con tres diferencias medidas al portarla:
     · «la mitad» ya no se falsea con `previos` (eso hacía empezar el día en «ahora»
       aunque eligieras antes de tu hora): es `horario.desfaseLarga`, que la regla
       entiende y que sobrevive a recolocar;
     · los acentos respetan `previos`: «arrancar» solo si la primera pausa del día
       es de esta composición, y las claves de «otra» son las de la pausa;
     · el fin de semana lleva tema y no lleva acento (el menú sigue existiendo: el
       usuario lo usa en sábado). */

/* La semana ISO de una fecha local. Sin new Date("YYYY-MM-DD") (regla §10):
   se construye por partes, en UTC, y se lee el jueves de esa semana. */
function semanaISO(iso) {
  var p = String(iso).split('-').map(Number);
  var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  var dia = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dia);
  var inicioAno = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return { n: Math.ceil(((d - inicioAno) / 86400000 + 1) / 7), ano: d.getUTCFullYear(), diaSemana: dia };
}

/* LOS TEMAS: qué región lidera. Los tags son los del catálogo (SIT · SHLD · SPN ·
   HIP · LEG · GRND · WRST · POST · STEALTH · GRIP · BACK · REL · BAL · EQU).
   `respiraLarga`: los Respira largos delante; `corta`: los platos cortos delante.
   (El prototipo llevaba un campo `larga` que nadie leía: fuera, lección de s194.) */
var SEMANA_TEMAS = [
  { id: 'cuello', nombre: 'Soltar el cuello', estira: ['SIT', 'SHLD'], mueve: ['POST'], respira: ['REL'] },
  { id: 'caderas', nombre: 'Abrir la cadera', estira: ['HIP', 'LEG', 'GRND'], mueve: ['STEALTH', 'LEG'], respira: ['BAL'] },
  { id: 'manos', nombre: 'Las manos que teclean', estira: ['WRST', 'SIT'], mueve: ['GRIP'], respira: ['EQU'] },
  { id: 'espalda', nombre: 'La espalda larga', estira: ['SPN', 'SHLD', 'HIP'], mueve: ['POST', 'BACK'], respira: ['REL'] },
  { id: 'aire', nombre: 'Respirar hondo', estira: ['SIT'], mueve: ['STEALTH'], respira: ['BAL', 'EQU'], respiraLarga: true },
  { id: 'ligera', nombre: 'Semana ligera', estira: ['SIT', 'WRST'], mueve: ['STEALTH', 'GRIP'], respira: ['REL'], corta: true },
];

/* LOS ACENTOS del día (1 = lunes … 7 = domingo). Cambian la forma, no los platos. */
var SEMANA_ACENTOS = {
  1: { id: 'arranque' },   /* la primera pausa activa el cuerpo (Mueve) */
  2: { id: 'sostener' },   /* el día tal cual */
  3: { id: 'mitad' },      /* la pausa larga llega antes: la segunda, no la tercera */
  4: { id: 'aire' },       /* antes de comer se respira, no se estira */
  5: { id: 'cierre' },     /* el cierre es el Respira más largo que quede */
  6: { id: 'libre' },
  7: { id: 'libre' },
};

function semanaDe(iso) {
  var s = semanaISO(iso);
  return { n: s.n, ano: s.ano, diaSemana: s.diaSemana, tema: SEMANA_TEMAS[(s.n - 1) % SEMANA_TEMAS.length], acento: SEMANA_ACENTOS[s.diaSemana] };
}

/* Ordena un pozo: primero lo que casa con los tags del tema (en ese orden) y el
   resto tal cual venía (que ya rota por día). Con `corta`, los de menos minutos
   delante. Sort estable: dentro de un tag, el orden del día se conserva. */
function semanaOrdenar(pozo, tags, corta) {
  var peso = function (r) {
    var i = tags.indexOf(r.tag);
    return (i === -1 ? tags.length : i) * 100 + (corta ? (r.min || 0) : 0);
  };
  return (pozo || []).slice().sort(function (a, b) { return peso(a) - peso(b); });
}
function semanaPozos(pozos, semana) {
  var t = semana.tema;
  var respira = semanaOrdenar(pozos.respira, t.respira, t.corta);
  if (t.respiraLarga) respira = respira.slice().sort(function (a, b) { return (b.min || 0) - (a.min || 0); });
  return { estira: semanaOrdenar(pozos.estira, t.estira, t.corta), mueve: semanaOrdenar(pozos.mueve, t.mueve, t.corta), respira: respira, cierre: pozos.cierre || [] };
}

/* El día con acento: la regla de siempre sobre los pozos del tema, y luego se
   retocan los PLATOS de tres paradas como mucho. Las claves de «otra» siguen
   siendo las de la pausa, así que pedir otra en una parada retocada rota igual. */
function semanaComponer(opcion, horario, pozos, cambios, meta, semana, previos) {
  var P = semanaPozos(pozos, semana);
  var a = semana.acento ? semana.acento.id : 'libre';
  var h = a === 'mitad' ? Object.assign({}, horario, { desfaseLarga: 1 }) : horario;
  var m = ritmoComponer(opcion, h, P, cambios, meta, previos);
  if (!m) return m;
  cambios = cambios || {};
  var usados = {};
  if (previos) (previos.usados || []).forEach(function (id) { usados[id] = true; });
  m.items.forEach(function (it) { (it.platos || []).forEach(function (p) { usados[p.id] = true; }); });
  var toma = function (modulo, clave) {
    var libres = P[modulo].filter(function (r) { return !usados[r.id]; });
    if (!libres.length) libres = P[modulo];
    var r = libres[(cambios[clave] || 0) % libres.length];
    if (!r) return null;
    usados[r.id] = true;
    return { modulo: modulo, id: r.id, name: r.name, min: r.min, clave: clave, rutina: r };
  };
  var pausas = m.items.filter(function (it) { return it.tipo === 'pausa'; });
  /* ARRANCAR: la primera pausa DEL DÍA es de Mueve. Si el día se recompuso con
     pausas ya hechas, la primera de esta composición no es la del día: nada. */
  if (a === 'arranque' && !(previos && previos.pausas > 0) && pausas[0] && !pausas[0].larga && pausas[0].platos[0] && pausas[0].platos[0].modulo !== 'mueve') {
    var conMueve = pausas.find(function (p) { return !p.larga && p.platos[0] && p.platos[0].modulo === 'mueve'; });
    delete usados[pausas[0].platos[0].id];
    if (conMueve) {
      var tmp = pausas[0].platos; pausas[0].platos = conMueve.platos; conMueve.platos = tmp;
      conMueve.motivo = 'estira';
    } else {
      var plato = toma('mueve', pausas[0].platos[0].clave);
      if (plato) pausas[0].platos = [plato];
    }
    pausas[0].motivo = 'mueve';
  }
  /* AIRE: la última pausa corta antes de comer es de Respira. */
  if (a === 'aire') {
    var comidaI = m.items.findIndex(function (it) { return it.tipo === 'comida'; });
    for (var i = comidaI - 1; i >= 0; i--) {
      var it = m.items[i];
      if (it.tipo === 'pausa' && !it.larga && it.platos[0] && it.platos[0].modulo !== 'respira') {
        delete usados[it.platos[0].id];
        var r = toma('respira', it.platos[0].clave);
        if (r) { it.platos = [r]; it.motivo = 'respira'; }
        break;
      }
    }
  }
  /* CERRAR SUAVE: el cierre es el Respira más largo que quede sin servir. */
  if (a === 'cierre' && m.items.length) {
    var cierre = m.items[m.items.length - 1];
    var largos = P.respira.filter(function (x) { return !usados[x.id]; }).sort(function (x, y) { return (y.min || 0) - (x.min || 0); });
    if (cierre && cierre.tipo === 'cierre' && largos[0]) {
      cierre.platos = [{ modulo: 'respira', id: largos[0].id, name: largos[0].name, min: largos[0].min, clave: 'cierre', rutina: largos[0] }];
      cierre.motivo = 'cierre';
    }
  }
  return m;
}

Object.assign(window, { semanaISO, SEMANA_TEMAS, SEMANA_ACENTOS, semanaDe, semanaPozos, semanaComponer });
