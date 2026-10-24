/* PACE · A tu ritmo · LAS SERIES (Ez, 15 oct. 2026; el cuerpo entero, 20 oct.)
   ==========================================================================
   Qué rutina sirve cada parada del día. Ez eligió mirando la app real las series con lógica
   (docs/traspaso/archivos/series-15oct/) y, el 20 oct., que cada día mueva el cuerpo entero
   «de manera equilibrada y diferente», con las rutinas enteras que ya hay
   (docs/traspaso/archivos/dias-disenados/, medido con medir/medir-cuerpo.js).

   LA SECUENCIA (primero el módulo de cada parada):
     · la primera pausa del día: Mueve, de pie; después de comer, una como cualquier otra
       (Ez, 20 oct.: «B · Se quita»);
     · la larga: Respira y una Estira de pie;
     · las cortas, la cadencia de siempre (`it.n`: la de antes de la larga, Mueve; las
       demás, Estira); y si la anterior fue sentada o la saltaste, esta, de pie;
     · el jueves, la última corta antes de comer es Respira (el acento que se queda);
     · el cierre rota entre los Respira lentos de 5 min o menos.
     Si el módulo no tiene nada mejor para la parada (de pie, corto, sin cargar una zona,
     sin dejar el cuerpo a medias), sirve el otro si lo tiene.

   EL CUERPO ENTERO (gratis): las seis zonas de RITMO_ZONAS, repartidas entre las pausas del
   día. `ritmoSeriesCuenta` sabe cuánto pueden mover aún las paradas que quedan, en su orden
   (la primera, Mueve de pie; la larga, Estira de pie) y sin dos sentadas seguidas; si van justas, solo vale lo que no
   deja una zona fuera, aunque sea sentado. Si el cuerpo entero no cabe de ninguna forma
   («Una hora», «Dos horas» con dos pausas), levantarse manda y después, lo que más mueve; lo
   que el último día no movió pesa más que las seis juntas, así que va primero.

   LA PUNTUACIÓN (la capa 1 de «PACE que aprende»): primero se aparta, y solo si queda otra
   cosa, lo ya hecho hoy (en el plan o fuera) y, si toca levantarse, lo sentado. Luego suma
   +3 si mueve una zona que hoy no se ha movido, −3 si repite zona con la parada anterior y
   resta las veces que ya se ha movido hoy la más movida de sus zonas: el día, equilibrado.
   Empata el orden del pozo, que es el del tema de la semana. «Otra» recorre esa lista en
   orden, también lo apartado.

   LO DIFERENTE (PACE completo, `mem.varia`): lo del último día se aparta (en esta parada y
   en todas) sin cargar de más una zona, se planea el cuerpo entero con lo que no salió si
   cabe, −1 si salió en otra parada y empata la que hace más días que no sale. Sin pagar,
   ninguna de estas cuatro cosas: el cuerpo entero sí, la variedad no.

   LA FRASE B, encima del nombre (la pausa y la línea): la razón que más pesó, en `it.frase`
   — el cierre, la larga de unas dos horas, los minutos sentado o la zona sin mover hoy. Sin
   razón, la de siempre (`it.motivo`).

   LO APRENDIDO (el motor de la semana, ritmo.motor.js; con PACE completo), en
   `mem.aprendido`: lo que descansa va al final de la lista, como lo apartado; en la pausa
   que sueles saltar, lo de 2 minutos o menos; lo que te ayudó suma dos puntos; y con
   «menos Mueve», la cadencia sirve Estira (la primera, no).

   PURA como la regla: lo que sabe del pasado entra por `mem` (state-ritmo.series.jsx).
   `var` y `function`: el build solo re-expone esos nombres. */

/* Zona y si te levanta, por rutina: todo lo que puede entrar en los pozos de Estira y
   Mueve (lo vigila tests/ritmo-series.spec.js). Lo de Respira no tiene zona. */
var RITMO_SERIES_META = {
  /* «Para empezar» (Ez, 23 oct. 2026: 2A), lo que se propone sin pagar. Sentarse y levantarse
     mueve la cadera tanto como las piernas; cuenta si se hace por libre. */
  'extra.chair.squats': { z: ['piernas', 'caderas'], pie: true },
  'extra.desk.pushups': { z: ['hombros'], pie: true },
  /* Lo que pide una pared, que cuenta como la mesa (ritmoPozos): en una habitación siempre
     hay una (los días diseñados, 20 oct. 2026). */
  /* La sentadilla alta contra la pared trabaja glúteo y muslo: cadera, como «Glúteos invisibles».
     Sin ella, Mueve no tendría nada de pie para la cadera y la primera pausa pasaría a Estira. */
  'extra.legs.standing': { z: ['piernas', 'caderas'], pie: true },
  'move.neck.3': { z: ['cuello'], pie: false },
  /* Los deslizamientos en pared mueven la espalda alta, como en «Espalda de oficina». */
  'move.shoulder.circles': { z: ['hombros', 'espalda'], pie: true },
  'move.wrists': { z: ['manos'], pie: false },
  'move.spine.chair': { z: ['espalda'], pie: false },
  /* El isquio va llevando la cadera atrás: cuenta también como cadera, y sin él no habría
     caderas gratis (sentarse y levantarse pide una silla sin ruedas y no entra en los pozos). */
  'move.hamstrings.standing': { z: ['piernas', 'caderas'], pie: true },
  /* El resto, con PACE completo (sin «Con material» ni «Para ir a más»). */
  'extra.calves': { z: ['piernas'], pie: false },
  'extra.glutes.stealth': { z: ['caderas'], pie: false },
  'extra.core.stealth': { z: ['espalda'], pie: false },
  'move.desk.quick': { z: ['cuello', 'manos', 'espalda'], pie: false },
  'extra.posture.set': { z: ['espalda'], pie: false },
  'extra.grip.squeeze': { z: ['manos'], pie: false },
  'move.shoulders.5': { z: ['hombros'], pie: true },
  'extra.back.desk': { z: ['espalda', 'hombros'], pie: true },
  'move.back.standing': { z: ['espalda'], pie: true },
  /* Sentadilla profunda, sentadilla lateral y zancada: mueve las piernas tanto como la
     cadera (Ez, 20 oct. 2026: «mezclar los ejercicios que ya tenemos»). */
  'move.hips.standing': { z: ['caderas', 'piernas'], pie: true },
  'move.hamstrings': { z: ['piernas'], pie: true },
};
/* Las seis zonas que un día mueve entero (Ez, 20 oct. 2026). */
var RITMO_ZONAS = ['piernas', 'caderas', 'espalda', 'hombros', 'cuello', 'manos'];
/* Lo hecho fuera de los pozos (una rutina de suelo, por libre) también mueve su zona: se
   lee de su etiqueta del catálogo. */
var RITMO_SERIES_ZONA_TAG = {
  SHLD: 'hombros', SPN: 'espalda', POST: 'espalda', BACK: 'espalda', CORE: 'espalda', HIP: 'caderas',
  GRND: 'caderas', LEG: 'piernas', ATG: 'piernas', WRST: 'manos', GRIP: 'manos', PUSH: 'hombros', HANG: 'hombros',
  FLOW: 'espalda',
};
var RITMO_SERIES_LARGA = 105;  /* minutos desde la última larga (o el inicio, o la comida) para decir «Dos horas»: 1 h 45 o más */

function ritmoSeriesZonas(id, tag) {
  var m = RITMO_SERIES_META[id];
  if (m) return m.z;
  return RITMO_SERIES_ZONA_TAG[tag] ? [RITMO_SERIES_ZONA_TAG[tag]] : [];
}
function ritmoSeriesDePie(id) { var m = RITMO_SERIES_META[id]; return !!(m && m.pie); }

/* Las zonas como seis bits, para contarlas deprisa. */
function ritmoSeriesBits(zonas) {
  var b = 0;
  (zonas || []).forEach(function (z) { var k = RITMO_ZONAS.indexOf(z); if (k !== -1) b |= 1 << k; });
  return b;
}

/* EL CUERPO ENTERO, contado. `huecos`: lo que puede servir cada parada que queda, en orden
   (la larga, solo Estira). `alcance(k, falta, sentada)`: cuánto de `falta` (bits) pueden
   mover todavía las paradas desde la k, sin dos sentadas seguidas (`sentada`: la de antes
   lo fue); con `pesos` ({ zona: n }), la suma de sus pesos. Se recuerda lo calculado: son
   como mucho una docena de paradas × 64 × 2 posturas, una vez por día servido. */
function ritmoSeriesCuenta(huecos, pesos) {
  pesos = pesos || {};
  var peso = function (b) {
    var n = 0;
    RITMO_ZONAS.forEach(function (z, k) { if (b & (1 << k)) n += pesos[z] || 1; });
    return n;
  };
  var trozos = huecos.map(function (rutinas) {
    var vistos = {}, out = [];
    rutinas.forEach(function (r) {
      var t = { b: ritmoSeriesBits(ritmoSeriesZonas(r.id, r.tag)), sentada: !ritmoSeriesDePie(r.id) };
      var clave = t.b * 2 + (t.sentada ? 1 : 0);
      if (t.b && !vistos[clave]) { vistos[clave] = true; out.push(t); }
    });
    return out;
  });
  var memo = {};
  function alcance(k, falta, sentada) {
    if (k >= huecos.length || !falta) return 0;
    var clave = k * 128 + falta * 2 + (sentada ? 1 : 0);
    if (memo[clave] != null) return memo[clave];
    var mejor = alcance(k + 1, falta, false);   /* una de pie que no mueve nada nuevo */
    trozos[k].forEach(function (t) {
      var b = falta & t.b;
      if (b && !(sentada && t.sentada)) mejor = Math.max(mejor, peso(b) + alcance(k + 1, falta & ~b, t.sentada));
    });
    return (memo[clave] = mejor);
  }
  return { alcance: alcance, peso: peso };
}

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
   `mem.varia`: con PACE completo, las rutinas cambian de un día a otro.
   `opts.aire`: el acento del jueves. */
function ritmoServir(m, pozos, cambios, previos, mem, opts) {
  if (!m || !m.items) return m;
  var P = pozos || {};
  cambios = cambios || {};
  mem = mem || {};
  var estados = mem.estados || {}, ultima = mem.ultima || {}, dias = mem.dias || {}, hechas = mem.hechas || [];
  var ap = mem.aprendido || {}, descansa = ap.descansa || {}, ayuda = ap.ayuda || {};
  var varia = !!mem.varia, todas = (P.estira || []).concat(P.mueve || []), todasBits = 0;
  todas.forEach(function (r) { todasBits |= ritmoSeriesBits(ritmoSeriesZonas(r.id)); });
  var usados = {}, movidas = {}, veces = {}, vez = 0;   /* usados: { id: la vez que salió hoy (1, 2, …) }; veces: { zona: n } */
  (previos && previos.usados || []).forEach(function (id) { usados[id] = usados[id] || ++vez; });
  /* `previos` ya dice si hubo pausas o comida antes de recomponer; lo congelado lo repasa abajo */
  var previa = null, ord = 0;
  var huboPausa = !!(previos && (previos.pausas > 0 || previos.comidaHecha));
  var inicio = mem.inicio != null ? mem.inicio : m.desde;
  var ultimaPie = inicio, desdeLarga = inicio;
  var otraVez = {};
  Object.keys(ultima).forEach(function (k) { (ultima[k] || []).forEach(function (id) { otraVez[id] = true; }); });
  /* Las zonas que el último día no movió (no cupieron) pesan más que las seis juntas: si
     hoy tampoco cabe todo, van primero. */
  var ayerMovidas = {}, pesos = {};
  Object.keys(otraVez).forEach(function (id) { ritmoSeriesZonas(id).forEach(function (z) { ayerMovidas[z] = true; }); });
  if (Object.keys(otraVez).length) RITMO_ZONAS.forEach(function (z) { if (!ayerMovidas[z]) pesos[z] = 7; });

  /* Lo ya pasado (congelado al recolocar) cuenta igual que lo servido: zonas, de pie, saltada. */
  function pasar(it, ids, saltada) {
    var zonas = [];
    if (!saltada) ids.forEach(function (id) { ritmoSeriesZonas(id).forEach(function (z) { movidas[z] = true; veces[z] = (veces[z] || 0) + 1; zonas.push(z); }); });
    var pie = !saltada && ids.some(ritmoSeriesDePie);
    if (pie) ultimaPie = it.desde + it.dur;
    if (it.larga) desdeLarga = it.desde + it.dur;
    ids.forEach(function (id) { usados[id] = usados[id] || ++vez; });
    previa = { zonas: zonas, pie: pie, saltada: saltada };
    if (it.tipo === 'pausa') huboPausa = true;
  }
  function comer(it) { previa = null; ultimaPie = desdeLarga = it.desde + it.dur; }
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
    /* Lo que salió ayer solo se mira con PACE completo: es la variedad entre días. */
    var aqui = {};
    if (varia) (ultima[c.clave] || []).forEach(function (id) { aqui[id] = true; });
    /* EL CUERPO ENTERO: cuánto de lo que aún no se ha movido hoy pueden mover las paradas
       que quedan (`cuenta`), con cada candidata y sin ella. Con paradas de sobra, cualquiera
       vale; si van justas, solo las que no dejan una zona fuera, aunque sea sentada. Si el
       cuerpo entero no cabe de ninguna forma, levantarse manda y después, la que más mueve. */
    var cuerpo = c.hueco != null, falta = 0;
    RITMO_ZONAS.forEach(function (z, k) { if (!movidas[z] && !fuera.z[z]) falta |= 1 << k; });
    var tope = cuerpo ? cuenta.alcance(c.hueco, falta, c.sentada) : 0;
    var cabe = cuerpo && tope >= cuenta.peso(falta & todasBits);
    var alcanza = function (r) {
      var b = falta & ritmoSeriesBits(ritmoSeriesZonas(r.id));
      return cuenta.peso(b) + cuenta.alcance(c.hueco + 1, falta & ~b, !ritmoSeriesDePie(r.id));
    };
    /* Con PACE completo, si el cuerpo entero aún cabe con lo que ayer no salió, se planea con
       eso: así una zona no repite rutina de un día al siguiente. */
    var nuevo = cabe && !!fresca && fresca.alcance(c.hueco, falta, c.sentada) >= tope;
    var alcanzaNueva = function (r) {
      if (otraVez[r.id]) return -1;
      var b = falta & ritmoSeriesBits(ritmoSeriesZonas(r.id));
      return fresca.peso(b) + fresca.alcance(c.hueco + 1, falta & ~b, !ritmoSeriesDePie(r.id));
    };
    /* equilibrada: lo que ya se ha movido hoy la más movida de sus zonas */
    var cargaDe = function (r) {
      return Math.max.apply(null, ritmoSeriesZonas(r.id).map(function (x) { return (veces[x] || 0) + (fuera.z[x] ? 1 : 0); }).concat([0]));
    };
    var entero = function (cuanto) {
      var mx = -1;
      t0.forEach(function (r) { mx = Math.max(mx, cuanto(r)); });
      t0 = t0.filter(function (r) { return cuanto(r) >= mx; });
    };
    /* levantarse manda sobre «la misma parada la última vez»: nunca dos sentadas
       seguidas si hay algo de pie (medido: al revés, la jornada tenía dos seguidas) */
    var t0 = base;
    var sinDescanso = t0.filter(function (r) { return !descansa[r.id]; });
    if (sinDescanso.length) t0 = sinDescanso;
    if (c.sentada || c.firme) { var dePie = t0.filter(function (r) { return ritmoSeriesDePie(r.id); }); if (dePie.length) t0 = dePie; }
    if (nuevo) entero(alcanzaNueva);
    if (cabe) entero(alcanza);
    if (c.corta) { var cortos = t0.filter(function (r) { return (r.min || 0) <= c.corta; }); if (cortos.length) t0 = cortos; }
    if (c.levantar) { var pie = t0.filter(function (r) { return ritmoSeriesDePie(r.id); }); if (pie.length) t0 = pie; }
    if (cuerpo && !cabe) entero(alcanza);
    if (varia) {
      var sinAyer = t0.filter(function (r) { return !aqui[r.id]; });
      if (sinAyer.length) t0 = sinAyer;
      /* sin cargar de más una zona: el equilibrio va antes que la variedad */
      var leve = Math.min.apply(null, t0.map(cargaDe));
      var nada = t0.filter(function (r) { return !otraVez[r.id] && cargaDe(r) <= leve + 1; });
      if (nada.length) t0 = nada;
    }
    var puntuar = function (r) {
      var z = ritmoSeriesZonas(r.id), p = 0;
      var nueva = z.filter(function (x) { return !movidas[x] && !fuera.z[x]; });
      if (nueva.length) p += 3;
      if (ayuda[r.id]) p += 2;   /* lo que te ayudó vuelve antes: como si su zona se hubiera movido dos veces menos */
      var carga = cargaDe(r);
      p -= carga;
      if (previa && z.some(function (x) { return previa.zonas.indexOf(x) !== -1; })) p -= 3;
      if (varia && otraVez[r.id] && !aqui[r.id]) p -= 1;
      return { r: r, p: p, hace: varia && dias[r.id] != null ? dias[r.id] : 99, hoy: usados[r.id] || 0, i: pozo.indexOf(r),
               nueva: nueva[0] || null, aqui: !!aqui[r.id], ayuda: ayuda[r.id] ? 1 : 0, carga: carga,
               deja: !cuerpo ? 0 : !cabe ? (alcanza(r) < tope ? 1 + (tope - alcanza(r)) / (tope + 1) : 0) : alcanza(r) < tope ? 8 : nuevo && alcanzaNueva(r) < tope ? 0.5 : 0 };
    };
    /* Empata la que te ayudó y, con PACE completo, la que hace más días que no sale; si ya
       salió todo hoy, la que salió antes. */
    var orden = function (xs) {
      return xs.map(puntuar).sort(function (a, b) { return (a.deja - b.deja) || (b.p - a.p) || (a.hoy - b.hoy) || (b.ayuda - a.ayuda) || (b.hace - a.hace) || (a.i - b.i); });
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
  /* Las paradas que aún mueven el cuerpo: las pausas, menos la de respirar del jueves. */
  /* La primera del día es Mueve de pie, y la Estira de la larga y la de antes de respirar del
     jueves, de pie: así las cuenta también lo que queda por mover. */
  var dePie = function (rs) { return rs.filter(function (r) { return ritmoSeriesDePie(r.id); }); };
  var huecos = m.items.filter(function (it) { return it.tipo === 'pausa' && it !== aireIt; }).map(function (it, k) {
    if (it.larga) return dePie(P.estira || []);
    if (k === 0 && !huboPausa) return dePie(P.mueve || []);
    return it === antesAire ? dePie(todas) : todas;
  });
  var cuenta = ritmoSeriesCuenta(huecos, pesos), hueco = 0;
  var fresca = varia ? ritmoSeriesCuenta(huecos.map(function (rs) { return rs.filter(function (r) { return !otraVez[r.id]; }); }), pesos) : null;

  var i = previos ? previos.claves || 0 : 0;   /* las claves de «Otra» siguen la numeración del día */
  m.items.forEach(function (it) {
    if (it.tipo === 'comida') return comer(it);
    if (it.tipo !== 'pausa' && it.tipo !== 'cierre') return;
    ord++;
    var key = it.tipo === 'cierre' ? 'c' : String(ord);
    var platos = [], frase = null;
    var sentada = !!(previa && (!previa.pie || previa.saltada));
    if (it.tipo === 'cierre') {
      var xc = elegir('cierre', { clave: key, desde: it.desde, cabe: it.dur }, 'cierre');
      if (xc) platos.push(plato('respira', xc, 'cierre'));
      it.motivo = 'cierre';
      frase = { k: 'cierre' };
    } else if (it.larga) {
      var clave = 'p' + (++i);
      var xr = elegir('respira', { clave: key, desde: it.desde }, clave + 'a');
      if (xr) platos.push(plato('respira', xr, clave + 'a'));
      var xe = elegir('estira', { clave: key, desde: it.desde, levantar: true, firme: true, hueco: hueco++, sentada: sentada }, clave + 'b');
      if (xe) platos.push(plato('estira', xe, clave + 'b'));
      it.motivo = 'larga';
      if (it.desde - desdeLarga >= RITMO_SERIES_LARGA) frase = { k: 'larga' };
      else if (xe && xe.nueva) frase = { k: 'zona', zona: xe.nueva };
    } else {
      var claveC = 'p' + (++i);
      var primera = !huboPausa;
      var porPrevia = sentada;
      var cadencia = it.n % 3 === 2 && ap.menos !== 'mueve' ? 'mueve' : 'estira';
      var modulo = it === aireIt ? 'respira' : primera ? 'mueve' : cadencia;
      var corta = null;
      (ap.cortas || []).forEach(function (k) { if (Math.abs(k.hora - it.desde) <= k.margen) corta = k.min; });
      var c = { clave: key, desde: it.desde, levantar: modulo !== 'respira' && (primera || porPrevia || it === antesAire),
                cabe: modulo === 'respira' ? it.dur : null, corta: modulo === 'respira' ? null : corta,
                hueco: modulo === 'respira' ? null : hueco++, sentada: sentada, firme: primera || it === antesAire };
      var x = elegir(modulo, c, claveC);
      /* Toca levantarse y este módulo solo tiene algo sentado, o lo de pie salió aquí la
         última vez, o la pausa es corta y aquí no hay nada tan corto: el otro módulo, si
         tiene algo mejor. Un módulo vacío sirve el otro. */
      var nota = function (z) {
        /* la primera es Mueve: solo cambia si el cuerpo entero no cabría */
        return !z ? 9 : (primera ? (z.deja >= 8 ? 8 : 0) : z.deja + z.carga / 2) + (c.corta && (z.r.min || 0) > c.corta ? 4 : 0) + (c.levantar && !ritmoSeriesDePie(z.r.id) ? 2 : 0) + (z.hoy ? 3 : 0) + (z.aqui ? 1 : 0);
      };
      if (modulo !== 'respira' && (!x || ((c.levantar || c.corta || x.hoy || (primera ? x.deja >= 8 : x.deja || x.carga > 1)) && nota(x) > 0))) {
        var otro = modulo === 'mueve' ? 'estira' : 'mueve';
        var y = elegir(otro, c, claveC);
        if (nota(y) < nota(x)) { x = y; modulo = otro; }
      }
      if (x) platos.push(plato(modulo, x, claveC));
      it.motivo = platos[0] ? platos[0].modulo : 'estira';
      var pie = !!(x && ritmoSeriesDePie(x.r.id));
      if (porPrevia && pie && !primera) frase = { k: 'sentado', n: Math.round(it.desde - ultimaPie) };
      else if (x && x.nueva) frase = { k: 'zona', zona: x.nueva };
    }
    if (platos.length) it.platos = platos;
    it.frase = frase;
    pasar(it, (it.platos || []).map(function (p) { return p.id; }), false);
  });
  return m;
}

Object.assign(window, { RITMO_SERIES_META, RITMO_SERIES_ZONA_TAG, RITMO_ZONAS, ritmoSeriesZonas, ritmoSeriesDePie, ritmoSeriesBits, ritmoSeriesCuenta, ritmoSeriesClaves, ritmoServir });
