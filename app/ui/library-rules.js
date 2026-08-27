/* PACE · app/ui/library-rules.js (sesión 174)
   =============================================
   LAS REGLAS DE LAS BIBLIOTECAS, SIN UNA LÍNEA DE UI. Filtros, orden, «Para
   ahora», la tira de glifos y la línea de series viven aquí como funciones
   puras: lo que la maqueta v13 demostró mirando, escrito de forma que se pueda
   asertar sin abrir un navegador.

   POR QUÉ UN ARCHIVO APARTE. `LibraryShell.jsx` pinta y `RoutineCard.jsx`
   también; si estas reglas vivieran dentro, la única manera de probar que
   «Corto» filtra bien sería levantar Chromium y contar tarjetas. Separadas, el
   `verify` puede cruzarlas contra el catálogo real en ~5 s.

   `var` y `function` a propósito (no `const`): el build re-expone
   function/var top-level como global (collectGlobalNames, s103), y un `const`
   NO cruza la IIFE del artefacto — la trampa de s148, que ya se cobró una
   sesión. El `Object.assign` final es el cinturón encima de los tirantes.

   CARGA ANTES de `RoutineCard.jsx` y `LibraryShell.jsx`, y DESPUÉS de
   `exercise-aliases.js` (usa `resolveVisualId`, leído de `window` por si el
   orden fallara). */

/* Los tres filtros, en el orden en que se pintan. Medido en s174: los tres
   chips ocupan 277 px de los 328 disponibles a 360 px de ancho, así que un
   cuarto no cabe sin deslizar — y deslizar chips esconde el que no ves. */
var LIB_FILTROS = ['aqui', 'sinmat', 'corto'];

/* LOS DE RESPIRA SON OTROS, y no por gusto: sus 20 rutinas no declaran
   `position`, `equipment` ni `requiresFloor` (20 de 20, medido en s174), asi
   que «Aqui mismo» y «Sin material» las dejarian pasar TODAS -- dos chips que
   no filtran nada. Lo que Respira si tiene es duracion y forma de respirar.

   SON DOS Y NO TRES, y esto se midio antes de cablearlo: la maqueta de s176
   llevaba un tercero, «Sin rondas», y resulto ser un SUBCONJUNTO ESTRICTO del
   segundo -- quita `rounds.express`, `rounds.full` y `rounds.long`, que son
   exactamente las tres que «Sin retencion» ya quita, porque ninguna declara
   `cycle` y las tres llevan `safety`. Un chip que no puede cambiar el resultado
   de otro es decoracion.
   Recuentos sobre el catalogo: «<= 5 min» deja 9 de 20 y «Sin retencion» 11. */
var LIB_FILTROS_RESPIRA = ['corto', 'sinreten'];

/* «Con retencion» = la respiracion se PARA en algun momento, llena o vacia.
   El dato vive en `cycle` como [inhala, sosten, exhala, vacio], asi que basta
   con mirar las posiciones 1 y 3. Las rutinas SIN `cycle` -rondas, kapalabhati,
   los patrones con motor propio- no lo declaran, y ahi manda `safety`: las seis
   que llevan aviso son precisamente las de apnea o hiperventilacion. */
function libraryConRetencion(r) {
  if (!r) return false;
  if (Array.isArray(r.cycle)) return r.cycle[1] > 0 || r.cycle[3] > 0;
  return !!r.safety;
}

/* EL UMBRAL DE «CORTO» ES RELATIVO A CADA BIBLIOTECA, y no un número escrito
   aquí. Medido en s174: con «≤ 3 min» fijo, el chip deja 12 de 14 en Mueve
   —quita dos: no filtra— y 3 de 14 en Estira. El mismo texto hacía dos cosas
   distintas porque Mueve va de 1 a 4 min y Estira de 2 a 6.
   Regla: el mayor umbral cuyo recuento NO pase de la mitad de la biblioteca.
   Sale ≤ 2 min en Mueve (7 de 14) y ≤ 4 min en Estira (6 de 14). El chip
   ENSEÑA su umbral, así que no miente aunque cambie de biblioteca. */
function libraryUmbralCorto(rutinas) {
  if (!rutinas || !rutinas.length) return 0;
  var mins = [];
  rutinas.forEach(function (r) { if (mins.indexOf(r.min) === -1) mins.push(r.min); });
  mins.sort(function (a, b) { return a - b; });
  var mitad = Math.ceil(rutinas.length / 2);
  var t = mins[0];
  mins.forEach(function (m) {
    var n = rutinas.filter(function (r) { return r.min <= m; }).length;
    if (n <= mitad) t = m;
  });
  return t;
}

/* «Aquí mismo» = lo que se puede hacer donde estás: sin tirarse al suelo y sin
   una barra de la que colgarse. Medido: 11 de 14 en Mueve y 5 de 14 en Estira.
   «De pie» y «Con suelo» se cayeron en s173 por no discriminar — el primero
   está contenido entero en «Aquí mismo» y el segundo es su complemento exacto:
   un filtro con dos nombres. */
function libraryPredicado(clave, umbral) {
  if (clave === 'aqui') return function (r) {
    return !r.requiresFloor && (r.equipment || []).indexOf('bar') === -1;
  };
  if (clave === 'sinmat') return function (r) { return (r.equipment || []).length === 0; };
  if (clave === 'corto') return function (r) { return r.min <= umbral; };
  if (clave === 'sinreten') return function (r) { return !libraryConRetencion(r); };
  return function () { return true; };
}

/* Aplica el conjunto de filtros ACTIVOS (todos en Y). Sin filtros, identidad. */
function libraryFiltrar(rutinas, activos, umbral) {
  if (!activos || !activos.length) return rutinas;
  var preds = activos.map(function (k) { return libraryPredicado(k, umbral); });
  return rutinas.filter(function (r) {
    return preds.every(function (p) { return p(r); });
  });
}

/* ORDEN DENTRO DEL GRUPO: libres primero, luego por duración.
   La primera mitad ya existía desde s90 en Respira («free primero, premium al
   final»: el usuario free ve antes lo que puede usar); la segunda es el único
   orden intrínseco que tiene el dato. Y hace legible el filtro de duración —lo
   más corto ya está arriba, así que el chip confirma lo que ves en vez de
   reordenarte la pantalla.
   `slice()` antes de `sort` porque el catálogo NO se ordena en su sitio, y el
   sort de JS es estable desde ES2019: a igualdad de las dos claves se conserva
   el orden de catálogo. */
function libraryOrdenar(rutinas) {
  return (rutinas || []).slice().sort(function (a, b) {
    var pa = a.access === 'premium' ? 1 : 0;
    var pb = b.access === 'premium' ? 1 : 0;
    if (pa !== pb) return pa - pb;
    return a.min - b.min;
  });
}

/* LA TIRA DE GLIFOS: las identidades VISUALES distintas de la rutina, en orden
   de aparición. La primera hace de capitular a 62 px y el resto va a 20.
   `Descanso` se cae: sale 18 veces en 10 rutinas de Mueve, todavía no tiene
   dibujo (es una de las 3 de la cola) y no es un ejercicio — dibujar el
   descanso en la tira sería contar como contenido lo que es una pausa.
   Se resuelve por IDENTIDAD y no por nombre: varios ejercicios comparten dibujo
   vía VISUAL_ALIAS (s110), y mapear por nombre duplicaría entradas. */
function libraryGlifos(rutina) {
  var out = [];
  var resolver = window.resolveVisualId || function (n) { return n; };
  ((rutina && rutina.steps) || []).forEach(function (s) {
    if (!s || !s.name || s.name === 'Descanso') return;
    var v = resolver(s.name);
    if (out.indexOf(v) === -1) out.push(v);
  });
  return out;
}

/* LA LÍNEA DE SERIES SOBREVIVE SÓLO CUANDO DICE SERIES Y REPETICIONES, que es
   lo único que ningún dibujo puede contar: las demás decían «5 posturas», y eso
   ya lo dicen los glifos contándose.
   Y EXIGE DOS SERIES. Defecto visto MIRANDO la maqueta v13, no leyendo el
   diseño: la regla de s173 daba la línea a toda rutina con algún paso `reps`, y
   en Estira eso son dos rutinas con un ÚNICO paso de repeticiones entre cuatro
   y cinco (`move.neck.3`, `move.wrists`) — la tarjeta afirmaba «1 SERIES · 5
   REPS» de un movimiento de los cuatro. Una serie no es una serie.
   Medido: 10 de 28 -> 8 de 28, y las 8 son de Mueve. */
function librarySeries(rutina) {
  var reps = ((rutina && rutina.steps) || []).filter(function (s) {
    return s && s.mode === 'reps';
  });
  if (reps.length < 2) return null;
  var valores = [];
  reps.forEach(function (s) {
    var n = (s.reps && typeof s.reps === 'object') ? s.reps.target : s.reps;
    if (typeof n === 'number' && valores.indexOf(n) === -1) valores.push(n);
  });
  if (!valores.length) return null;
  return { series: reps.length, reps: valores };
}

/* «por lado» se lleva a la línea de contexto, con el resto del cómo-se-hace. */
function libraryPorLado(rutina) {
  return ((rutina && rutina.steps) || []).some(function (s) { return s && s.mode === 'perSide'; });
}

/* Ordinal de día a partir de una clave ISO LOCAL. `Math.round` y no `floor`:
   el cambio de hora mueve la medianoche local ±1 h y el redondeo lo absorbe,
   así que el ordinal sube exactamente uno por día también en marzo y octubre.
   NO se usa `new Date('YYYY-MM-DD')` — la regla §10 de CLAUDE.md lo prohíbe
   (parsea medianoche UTC y en husos negativos cae en el día anterior). */
function libraryDiaOrdinal(iso) {
  var p = String(iso || '').split('-');
  if (p.length !== 3) return 0;
  var d = new Date(+p[0], +p[1] - 1, +p[2]);
  if (isNaN(d.getTime())) return 0;
  return Math.round(d.getTime() / 86400000);
}

/* «PARA AHORA» — CONTEXTO + ROTACIÓN DIARIA (decidido en s174).
   Fuera los dos ids escritos a mano, que en s173 dejaron el bloque VACÍO dos
   versiones por asumir el prefijo `extra.*` en Estira (cuyas 14 rutinas
   empiezan por `move.`, la trampa que s172 prohíbe expresamente).
   El pozo es el CONTEXTO —lo que se puede hacer donde estás—, ordenado por
   duración, y entra por el día. Determinista: sin reloj de horas (s161 ya
   decidió que la paleta Auto va por SISTEMA y no por hora, porque «la app ya
   tiene un día de 25 min», y meter franjas horarias aquí sería un segundo
   modelo de tiempo dentro de la misma app), sin historial (que sólo tiene
   `pace.events.v1`, y en Capacitor el adaptador es null) y asertable con
   page.clock.
   MEDIDO al elegir el pozo: con «aquí mismo» Y «sin material» son 3 rutinas en
   Estira y 5 en Mueve, y enseñando 2 de 3 casi siempre sale lo mismo. Con
   «aquí mismo» a secas son 5 y 11, que sí rotan. */
function libraryParaAhora(rutinas, iso, cuantas, pozoPred) {
  var n = cuantas || 2;
  /* EL POZO ES «LO QUE PUEDES HACER AHORA», y eso no significa lo mismo en
     todas las bibliotecas. En cuerpo es el contexto (`aqui`). En Respira ese
     predicado deja pasar las 20 -no hay suelo ni material- y la sugerencia
     acababa cayendo en cosas como `Kumbhaka 1:4:2`, que es apnea avanzada con
     modal de seguridad: lo destapo la maqueta de s176 al pintarla.
     Por eso el predicado ENTRA por parametro y el de cuerpo queda de defecto:
     ninguna biblioteca cambia de comportamiento por esto. */
  var pozo = (rutinas || []).filter(pozoPred || libraryPredicado('aqui'));
  pozo = pozo.slice().sort(function (a, b) { return a.min - b.min; });
  if (pozo.length <= n) return pozo;
  var i = libraryDiaOrdinal(iso) % pozo.length;
  if (i < 0) i += pozo.length;
  var out = [];
  for (var k = 0; k < n; k++) out.push(pozo[(i + k) % pozo.length]);
  return out;
}

/* EL GRUPO QUE SE QUEDA VACÍO. Medido en s174: ninguna combinación de los tres
   filtros vacía una biblioteca entera (el mínimo es 2, en Estira), pero con
   «Aquí mismo» Estira deja `caderas` en 0 de 5 y `flujos` en 0 de 2 — dos
   cabeceras con nada debajo, que es el mismo fallo que el verify vigila en las
   familias de logro desde s168. La cabecera se queda y dice POR QUÉ.
   Devuelve la CLAVE del motivo, no la frase: el texto vive en i18n, en los dos
   idiomas y con su forma de singular. */
function libraryMotivoVacio(ocultas) {
  if (!ocultas || !ocultas.length) return null;
  var suelo = ocultas.filter(function (r) { return r.requiresFloor; }).length;
  return suelo === ocultas.length ? 'floor' : 'any';
}

Object.assign(window, {
  LIB_FILTROS: LIB_FILTROS,
  LIB_FILTROS_RESPIRA: LIB_FILTROS_RESPIRA,
  libraryConRetencion: libraryConRetencion,
  libraryUmbralCorto: libraryUmbralCorto,
  libraryPredicado: libraryPredicado,
  libraryFiltrar: libraryFiltrar,
  libraryOrdenar: libraryOrdenar,
  libraryGlifos: libraryGlifos,
  librarySeries: librarySeries,
  libraryPorLado: libraryPorLado,
  libraryDiaOrdinal: libraryDiaOrdinal,
  libraryParaAhora: libraryParaAhora,
  libraryMotivoVacio: libraryMotivoVacio,
});
