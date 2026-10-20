/* PACE · A tu ritmo · LA SEMANA (s195c · v0.128.0)
   =============================================
   El norte del usuario: «acompañar el día pero ir ofreciendo propuestas para cada
   día de la semana/mes», y «cada semana del año tiene que ser diferente o al
   menos coherente con el bienestar». Lectura A (s194): TODO SALE DE LA FECHA —
   reproducible, offline, sin datos de uso—:

     tema de la semana (por semana ISO, seis en ciclo: cada uno vuelve cada seis)
     × acento del día (lunes a viernes; el fin de semana, ninguno)
     × la regla del día de siempre (ritmoComponer, que no se toca)

   El tema REORDENA los pozos (la región del tema va primero), y desde las series
   (15 oct. 2026) eso solo desempata; el acento cambia la FORMA del día: la larga antes
   el miércoles y respirar antes de comer el jueves. Arrancar con Mueve (lunes) y el
   cierre más largo (viernes) son ya de todos los días (ritmo.series.js).

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
       aunque eligieras antes de tu hora): es `horario.adelantaLarga`, que la regla
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

/* LOS ACENTOS del día (1 = lunes … 7 = domingo): la forma del día y, de lunes a viernes,
   SU INTENCIÓN (los días diseñados, 17 oct. 2026): `zonas` es lo que el día inclina en las
   series (ritmo.series.js) y `estira`, que las cortas sean de Estira. */
var SEMANA_ACENTOS = {
  1: { id: 'arranque', zonas: ['piernas'] },            /* arrancar de pie */
  2: { id: 'sostener', zonas: ['hombros', 'cuello'] },
  3: { id: 'mitad', zonas: ['espalda'] },               /* y la primera larga llega antes */
  4: { id: 'aire', zonas: ['manos'] },                  /* y antes de comer se respira */
  5: { id: 'cierre', zonas: ['caderas'], estira: true }, /* soltar: más Estira que Mueve */
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

/* El día de la semana: la regla de siempre sobre los pozos del tema (los tramos, y «la
   mitad» del miércoles), y después LAS SERIES (ritmo.series.js) eligen el plato de cada
   parada. Desde el 15 oct. 2026 (Ez, las series con lógica) el tema solo desempata —es el
   orden de los pozos—, el arranque con Mueve del lunes y el cierre largo del viernes son
   de todos los días, y el jueves sigue respirando antes de comer. `memoria` es lo que el
   estado sabe del pasado (state-ritmo.series.jsx); sin las series cargadas, los platos son
   los de la regla. */
function semanaComponer(opcion, horario, pozos, cambios, meta, semana, previos, memoria) {
  var P = semanaPozos(pozos, semana);
  var a = semana.acento ? semana.acento.id : 'libre';
  /* «La mitad» adelanta la primera larga, y solo donde la hay: en la media y en la
     jornada. «Dos horas» no tiene larga ningún día, y el miércoles le metía una. */
  var mitad = a === 'mitad' && (opcion === 'media' || opcion === 'jornada');
  var h = mitad ? Object.assign({}, horario, { adelantaLarga: true }) : horario;
  var m = ritmoComponer(opcion, h, P, cambios, meta, previos);
  if (!m || typeof ritmoServir !== 'function') return m;
  var dia = semana.acento && semana.acento.zonas ? semana.acento : null;
  return ritmoServir(m, P, cambios, previos, memoria, { aire: a === 'aire', momentos: true, dia: dia, frase: !!dia });
}

Object.assign(window, { semanaISO, SEMANA_TEMAS, SEMANA_ACENTOS, semanaDe, semanaPozos, semanaComponer });
