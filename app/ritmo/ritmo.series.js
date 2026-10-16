/* PACE · A tu ritmo · LAS SERIES (Ez, 15 oct. 2026)
   ===============================================
   Qué rutina sirve cada parada del día. En «Dos horas», junto a la mesa, casi todas las
   pausas eran «Escritorio express» y una de cada ocho te levantaba de la silla. Ez eligió
   mirando la app real (docs/traspaso/archivos/series-15oct/): la forma 2, «series con
   lógica», con la frase B, y gratis.

   LA SECUENCIA (primero el módulo de cada parada):
     · la primera pausa del día y la primera después de comer: Mueve, de pie;
     · la larga: Respira y una Estira de pie;
     · las cortas, la cadencia de siempre (`it.n`: la de antes de la larga, Mueve; las
       demás, Estira); y si la anterior fue sentada o la saltaste, esta, de pie;
     · el jueves, la última corta antes de comer es Respira (el acento que se queda);
     · el cierre rota entre los Respira lentos de 5 min o menos.
     Si el módulo no tiene nada de pie y toca levantarse, sirve el otro si lo tiene.

   LA CAPA 1 DE «PACE QUE APRENDE» (la puntuación): primero se aparta, y solo si queda otra
   cosa, lo ya hecho hoy (en el plan o fuera), lo que salió en esta parada la última vez y,
   si toca levantarse, lo sentado. Luego suma: +3 si mueve una zona que hoy no se ha movido,
   −3 si repite zona con la parada anterior, −1 si la última vez salió en otra parada. Empata
   la que hace más días que no sale, y después el orden del pozo, que es el del tema de la
   semana. «Otra» recorre esa lista en orden, también lo apartado.

   LA FRASE B, encima del nombre (la pausa y la línea): la razón que más pesó, en `it.frase`
   — el cierre, después de comer, la larga de unas dos horas, los minutos sentado o la zona
   sin mover hoy. Sin razón, la de siempre (`it.motivo`).

   PURA como la regla: lo que sabe del pasado entra por `mem` (state-ritmo.series.jsx).
   `var` y `function`: el build solo re-expone esos nombres. */

/* Zona y si te levanta, por rutina: todo lo que puede entrar en los pozos de Estira y
   Mueve (lo vigila tests/ritmo-series.spec.js). Lo de Respira no tiene zona. */
var RITMO_SERIES_META = {
  'move.neck.3': { z: ['cuello'], pie: false },
  'move.desk.quick': { z: ['cuello', 'manos', 'espalda'], pie: false },
  'move.wrists': { z: ['manos'], pie: false },
  'move.shoulder.circles': { z: ['hombros'], pie: false },
  'move.hips.standing': { z: ['caderas'], pie: true },
  'move.hamstrings.standing': { z: ['piernas'], pie: true },
  'move.back.standing': { z: ['espalda'], pie: true },
  'extra.calves': { z: ['piernas'], pie: false },
  'extra.grip.squeeze': { z: ['manos'], pie: false },
  'extra.glutes.stealth': { z: ['caderas'], pie: false },
  'extra.posture.set': { z: ['espalda'], pie: false },
  'extra.core.stealth': { z: ['espalda'], pie: false },
  'extra.desk.pushups': { z: ['hombros'], pie: true },
  /* Sin el Superman ya no pide suelo y entra en el pozo (revisión de los ejercicios). */
  'extra.back.desk': { z: ['espalda', 'hombros'], pie: true },
  'extra.legs.standing': { z: ['piernas'], pie: true },
};
/* Lo hecho fuera de los pozos (una rutina de suelo, por libre) también mueve su zona: se
   lee de su etiqueta del catálogo. */
var RITMO_SERIES_ZONA_TAG = {
  SHLD: 'hombros', SPN: 'espalda', POST: 'espalda', BACK: 'espalda', CORE: 'espalda', HIP: 'caderas',
  GRND: 'caderas', LEG: 'piernas', ATG: 'piernas', WRST: 'manos', GRIP: 'manos', PUSH: 'hombros', HANG: 'hombros',
};
var RITMO_SERIES_LARGA = 105;  /* minutos desde la última larga (o el inicio, o la comida) para decir «Dos horas»: 1 h 45 o más */

function ritmoSeriesZonas(id, tag) {
  var m = RITMO_SERIES_META[id];
  if (m) return m.z;
  return RITMO_SERIES_ZONA_TAG[tag] ? [RITMO_SERIES_ZONA_TAG[tag]] : [];
}
function ritmoSeriesDePie(id) { var m = RITMO_SERIES_META[id]; return !!(m && m.pie); }

/* La clave de cada parada para «la misma parada la última vez»: su ordinal en el día, y
   el cierre, «c». Devuelve { clave: [ids] } de un día ya servido. */
function ritmoSeriesClaves(items) {
  var out = {}, n = 0;
  (items || []).forEach(function (it) {
    if (it.tipo !== 'pausa' && it.tipo !== 'cierre') return;
    n++;
    var ids = (it.platos || []).map(function (p) { return p.id; }).filter(Boolean);
    if (ids.length) out[it.tipo === 'cierre' ? 'c' : String(n)] = ids;
  });
  return out;
}

/* ritmoServir(m, pozos, cambios, previos, mem, opts) -> m con los platos de cada parada.
   `mem` = { pasado: [tramos congelados], estados: { ordinal: 'hecha'|'saltada' },
   ultima: { clave: [ids] } (el último día servido), dias: { id: días desde que salió },
   hechas: [{ id, t, z }] (lo terminado hoy, a su minuto), inicio }; todo opcional.
   `opts.aire`: el acento del jueves. */
function ritmoServir(m, pozos, cambios, previos, mem, opts) {
  if (!m || !m.items) return m;
  var P = pozos || {};
  cambios = cambios || {};
  mem = mem || {};
  var estados = mem.estados || {}, ultima = mem.ultima || {}, dias = mem.dias || {}, hechas = mem.hechas || [];
  var usados = {}, movidas = {}, vez = 0;   /* usados: { id: la vez que salió hoy (1, 2, …) } */
  (previos && previos.usados || []).forEach(function (id) { usados[id] = usados[id] || ++vez; });
  /* `previos` ya dice si hubo pausas o comida antes de recomponer; lo congelado lo repasa abajo */
  var previa = null, ord = 0;
  var huboPausa = !!(previos && (previos.pausas > 0 || previos.comidaHecha));
  var trasComer = !!(previos && previos.comidaHecha && !previos.pausas);
  var inicio = mem.inicio != null ? mem.inicio : m.desde;
  var ultimaPie = inicio, desdeLarga = inicio;
  var otraVez = {};
  Object.keys(ultima).forEach(function (k) { (ultima[k] || []).forEach(function (id) { otraVez[id] = true; }); });

  /* Lo ya pasado (congelado al recolocar) cuenta igual que lo servido: zonas, de pie, saltada. */
  function pasar(it, ids, saltada) {
    var zonas = [];
    if (!saltada) ids.forEach(function (id) { ritmoSeriesZonas(id).forEach(function (z) { movidas[z] = true; zonas.push(z); }); });
    var pie = !saltada && ids.some(ritmoSeriesDePie);
    if (pie) ultimaPie = it.desde + it.dur;
    if (it.larga) desdeLarga = it.desde + it.dur;
    ids.forEach(function (id) { usados[id] = usados[id] || ++vez; });
    previa = { zonas: zonas, pie: pie, saltada: saltada };
    if (it.tipo === 'pausa') { huboPausa = true; trasComer = false; }
  }
  function comer(it) { trasComer = true; previa = null; ultimaPie = desdeLarga = it.desde + it.dur; }
  (mem.pasado || []).forEach(function (it) {
    if (it.tipo === 'comida') return comer(it);
    if (it.tipo !== 'pausa' && it.tipo !== 'cierre') return;
    ord++;
    pasar(it, (it.platos || []).map(function (p) { return p.id; }), estados[ord] === 'saltada');
  });

  /* Lo hecho fuera del plan cuenta para las paradas de DESPUÉS de hacerlo: así una
     parada que ya pasó no cambia por lo que hiciste luego. */
  function hechoAntes(desde) {
    var u = {}, z = {};
    hechas.forEach(function (h) { if (h && h.t < desde) { u[h.id] = true; (h.z || []).forEach(function (x) { z[x] = true; }); } });
    return { u: u, z: z };
  }

  /* Los candidatos de un pozo, en el orden en que se ofrecen («Otra» sigue esa lista). */
  function lista(pozo, c) {
    var pool = c.cabe != null ? pozo.filter(function (r) { return (r.min || 0) <= c.cabe; }) : pozo.slice();
    if (!pool.length) return [];
    var fuera = hechoAntes(c.desde);
    var libres = pool.filter(function (r) { return !usados[r.id] && !fuera.u[r.id]; });
    var base = libres.length ? libres : pool;
    var aqui = {};
    (ultima[c.clave] || []).forEach(function (id) { aqui[id] = true; });
    /* levantarse manda sobre «la misma parada la última vez»: nunca dos sentadas
       seguidas si hay algo de pie (medido: al revés, la jornada tenía dos seguidas) */
    var t0 = base;
    if (c.levantar) { var pie = t0.filter(function (r) { return ritmoSeriesDePie(r.id); }); if (pie.length) t0 = pie; }
    var sinAyer = t0.filter(function (r) { return !aqui[r.id]; });
    if (sinAyer.length) t0 = sinAyer;
    var puntuar = function (r) {
      var z = ritmoSeriesZonas(r.id), p = 0;
      var nueva = z.filter(function (x) { return !movidas[x] && !fuera.z[x]; });
      if (nueva.length) p += 3;
      if (previa && z.some(function (x) { return previa.zonas.indexOf(x) !== -1; })) p -= 3;
      if (otraVez[r.id] && !aqui[r.id]) p -= 1;
      return { r: r, p: p, hace: dias[r.id] == null ? 99 : dias[r.id], hoy: usados[r.id] || 0, i: pozo.indexOf(r),
               nueva: nueva[0] || null, aqui: !!aqui[r.id] };
    };
    /* Empata la que hace más días que no sale; si ya salió todo hoy, la que salió antes. */
    var orden = function (xs) {
      return xs.map(puntuar).sort(function (a, b) { return (b.p - a.p) || (a.hoy - b.hoy) || (b.hace - a.hace) || (a.i - b.i); });
    };
    return orden(t0).concat(orden(base.filter(function (r) { return t0.indexOf(r) === -1; })));
  }
  function plato(modulo, x, clave) {
    usados[x.r.id] = usados[x.r.id] || ++vez;
    return { modulo: modulo, id: x.r.id, name: x.r.name, min: x.r.min, clave: clave, rutina: x.r };
  }
  /* `claveOtra`: la clave de «Otra» de ese plato, la misma que pone la regla. */
  function elegir(modulo, c, claveOtra) {
    var xs = lista(P[modulo] || [], c);
    return xs.length ? xs[(cambios[claveOtra] || 0) % xs.length] : null;
  }

  /* El jueves: la última corta antes de comer es Respira, y la de antes, de pie (si no,
     son dos sentadas seguidas). */
  var aireIt = null, antesAire = null;
  if (opts && opts.aire) {
    var iComida = m.items.findIndex(function (it) { return it.tipo === 'comida'; });
    for (var k = iComida - 1; k >= 0; k--) {
      var x0 = m.items[k];
      if (x0.tipo !== 'pausa') continue;
      if (!aireIt) { if (!x0.larga) aireIt = x0; } else { antesAire = x0; break; }
    }
  }

  var i = previos ? previos.claves || 0 : 0;   /* las claves de «Otra» siguen la numeración del día */
  m.items.forEach(function (it) {
    if (it.tipo === 'comida') return comer(it);
    if (it.tipo !== 'pausa' && it.tipo !== 'cierre') return;
    ord++;
    var key = it.tipo === 'cierre' ? 'c' : String(ord);
    var platos = [], frase = null;
    if (it.tipo === 'cierre') {
      var xc = elegir('cierre', { clave: key, desde: it.desde, cabe: it.dur }, 'cierre');
      if (xc) platos.push(plato('respira', xc, 'cierre'));
      it.motivo = 'cierre';
      frase = { k: 'cierre' };
    } else if (it.larga) {
      var clave = 'p' + (++i);
      var xr = elegir('respira', { clave: key, desde: it.desde }, clave + 'a');
      if (xr) platos.push(plato('respira', xr, clave + 'a'));
      var xe = elegir('estira', { clave: key, desde: it.desde, levantar: true }, clave + 'b');
      if (xe) platos.push(plato('estira', xe, clave + 'b'));
      it.motivo = 'larga';
      if (it.desde - desdeLarga >= RITMO_SERIES_LARGA) frase = { k: 'larga' };
      else if (xe && xe.nueva) frase = { k: 'zona', zona: xe.nueva };
    } else {
      var claveC = 'p' + (++i);
      var primera = !huboPausa, tras = trasComer;
      var porPrevia = !!(previa && (!previa.pie || previa.saltada));
      var modulo = it === aireIt ? 'respira' : (primera || tras) ? 'mueve' : (it.n % 3 === 2 ? 'mueve' : 'estira');
      var c = { clave: key, desde: it.desde, levantar: modulo !== 'respira' && (primera || tras || porPrevia || it === antesAire), cabe: modulo === 'respira' ? it.dur : null };
      var x = elegir(modulo, c, claveC);
      /* Toca levantarse y este módulo solo tiene algo sentado, o lo de pie salió aquí la
         última vez: el otro módulo, si tiene algo mejor. Un módulo vacío sirve el otro. */
      var nota = function (z) { return !z ? 9 : (c.levantar && !ritmoSeriesDePie(z.r.id) ? 2 : 0) + (z.aqui ? 1 : 0); };
      if (modulo !== 'respira' && (!x || (c.levantar && nota(x) > 0))) {
        var otro = modulo === 'mueve' ? 'estira' : 'mueve';
        var y = elegir(otro, c, claveC);
        if (nota(y) < nota(x)) { x = y; modulo = otro; }
      }
      if (x) platos.push(plato(modulo, x, claveC));
      it.motivo = platos[0] ? platos[0].modulo : 'estira';
      var pie = !!(x && ritmoSeriesDePie(x.r.id));
      if (tras && pie) frase = { k: 'comida' };
      else if (porPrevia && pie && !primera) frase = { k: 'sentado', n: Math.round(it.desde - ultimaPie) };
      else if (x && x.nueva) frase = { k: 'zona', zona: x.nueva };
    }
    if (platos.length) it.platos = platos;
    it.frase = frase;
    pasar(it, (it.platos || []).map(function (p) { return p.id; }), false);
  });
  return m;
}

Object.assign(window, { RITMO_SERIES_META, RITMO_SERIES_ZONA_TAG, ritmoSeriesZonas, ritmoSeriesDePie, ritmoSeriesClaves, ritmoServir });
