/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   state-core.sanea.js — UN CAMPO ROTO NO SE LLEVA TODO LO DEMAS (s198)
   ============================================================
   EL DEFECTO, MEDIDO EN v0.130.0. `loadState` envuelve parseo, migraciones y
   rollover en UN `try`, y su `catch` devuelve el estado de fabrica. Con un
   solo campo de tipo equivocado —`weeklyStats: null`, que el import de
   Ajustes aceptaba tal cual— el rollover revienta en `archiveDayToHistory`,
   la app arranca VACIA (vuelve el onboarding) y la PRIMERA escritura persiste
   ese estado vacio encima del bueno. Sembrado en la app real: 4321 min de
   foco, un logro y un dia de historia -> 0, 0 y 0, sin copia en ninguna parte.

   LO QUE HACE ESTE ARCHIVO, en dos piezas:

   · `paceSanearEstado(parsed, defaults)` — repara CAMPO A CAMPO contra la
     forma de `defaultState`, ANTES de migrar: lo que tiene el tipo equivocado
     vuelve a su valor de fabrica, y SOLO eso. Un `weeklyStats` roto cuesta la
     semana en curso, no el año. Devuelve `{ estado, reparados }`.
   · `paceGuardarRescate(raw, motivo)` — si aun asi algo revienta, la cadena
     CRUDA se copia a `pace.state.v2.rescate` antes de que nada la pise. Sin UI
     todavia (la pantalla de «algo se ha torcido» es una decision visual que va
     a su maqueta), pero el export de «Tus datos» ya la lleva, asi que se puede
     recuperar.

   LO QUE NO HACE, a proposito:
   · No VALIDA SEMANTICA. Un `totalFocusMin` negativo es raro pero no rompe
     nada; corregirlo seria decidir por el usuario. Aqui solo entra lo que hace
     que el arranque REVIENTE: tipos.
   · No toca claves que no conoce. `defaultState` no las enumera todas (el
     `ritmo` lo añade state-ritmo.jsx), y una clave desconocida puede ser de
     una version MAS NUEVA: tirarla seria perder datos al volver atras. Las de
     otros modulos que si importan van en `FORMAS_AJENAS`.
   · No coacciona contadores a entero >= 0: esa guarda vive en UN solo sitio
     desde s190 (los agregados de eventos) y no se duplica aqui.

   `var`/`function` A PROPOSITO, como `library-rules.js`: un `const` no cruza la
   IIFE del artefacto. Carga DESPUES de state-core.support.jsx y ANTES de
   state-core.jsx, que la llama al evaluarse (`let _state = loadState()`).
   ============================================================ */

var PACE_RESCATE_KEY = 'pace.state.v2.rescate';

function paceEsObjetoPlano(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function paceCopiaDefecto(d) {
  /* `defaultState` se reparte por spread superficial en loadState, asi que un
     objeto anidado de fabrica es COMPARTIDO: devolverlo tal cual dejaria que una
     escritura posterior lo mutara para todos. Copia profunda barata (son datos). */
  return (d !== null && typeof d === 'object') ? JSON.parse(JSON.stringify(d)) : d;
}

/* Las series de la semana: SIETE numeros, lunes primero (s69). Una serie que no
   lo sea vuelve a ceros -- la semana en curso, no la historia. */
var PACE_SERIES_SEMANA = ['focusMinutes', 'breathMinutes', 'moveMinutes', 'waterGlasses', 'holdSeconds'];

function paceSerieValida(a) {
  if (!Array.isArray(a) || a.length !== 7) return false;
  for (var i = 0; i < 7; i++) if (typeof a[i] !== 'number' || !isFinite(a[i])) return false;
  return true;
}

/* Claves que NO estan en `defaultState` pero cuyo dueño las lee al montar.
   Solo se exige la forma de arriba: el dueño ya es defensivo con lo de dentro. */
var FORMAS_AJENAS = { ritmo: 'objeto' };

/* paceSanearEstado(parsed, defaults) -> { estado, reparados }
   Lanza si `parsed` no es un objeto: ahi no hay nada campo a campo que salvar,
   y el `catch` de loadState guarda el rescate. */
function paceSanearEstado(parsed, defaults) {
  if (!paceEsObjetoPlano(parsed)) throw new Error('el estado guardado no es un objeto');
  var d = defaults || {};
  var e = Object.assign({}, parsed);
  var reparados = [];
  var reparar = function (clave, valor) { e[clave] = valor; reparados.push(clave); };

  Object.keys(d).forEach(function (k) {
    if (!(k in e) || e[k] === undefined) return;   // el merge de loadState lo rellena
    var def = d[k], v = e[k];
    if (def === null) {
      /* firstSeen, lastActiveDay, supportSeenAt…: null o un primitivo. */
      if (v !== null && typeof v === 'object') reparar(k, null);
    } else if (typeof def === 'number') {
      if (typeof v !== 'number' || !isFinite(v)) {
        var n = (typeof v === 'string' && v.trim() !== '') ? Number(v) : NaN;
        reparar(k, isFinite(n) ? n : def);
      }
    } else if (typeof def === 'boolean') {
      if (typeof v !== 'boolean') reparar(k, def);
    } else if (typeof def === 'string') {
      if (typeof v !== 'string') reparar(k, def);
    } else if (Array.isArray(def)) {
      if (!Array.isArray(v)) reparar(k, paceCopiaDefecto(def));
    } else if (paceEsObjetoPlano(def)) {
      if (!paceEsObjetoPlano(v)) reparar(k, paceCopiaDefecto(def));
    }
  });

  /* Lo de DENTRO, solo donde el arranque lo lee sin defensa. Una serie que FALTA
     también se repone: `loadState` mezcla por arriba, así que un `weeklyStats: {}`
     sustituía al de fábrica entero y el primer vaso de la semana reventaba en
     `[...s.weeklyStats.waterGlasses]` (auditoría del 21 oct.). */
  if (paceEsObjetoPlano(e.weeklyStats)) {
    var ws = Object.assign({}, e.weeklyStats), tocada = false;
    PACE_SERIES_SEMANA.forEach(function (s) {
      if (!paceSerieValida(ws[s])) { ws[s] = [0, 0, 0, 0, 0, 0, 0]; tocada = true; }
    });
    if (tocada) reparar('weeklyStats', ws);
  }

  /* Las métricas de cada entrada del histórico, como números: con un '30' de una
     copia editada a mano, `acc.focusMinutes += d.focusMinutes || 0` CONCATENA y el
     mes sale '03020'. Un número escrito como texto se lee; lo demás vale 0. Si algo
     cambia, meses y años se rehacen desde los días (la migración de s69), porque los
     que había pueden venir ya concatenados. */
  var metricasNumero = function (entrada) {
    var limpia = null;
    PACE_SERIES_SEMANA.forEach(function (m) {
      var v = entrada[m];
      if (v === undefined || (typeof v === 'number' && isFinite(v))) return;
      var n = (typeof v === 'string' && v.trim() !== '') ? Number(v) : NaN;
      limpia = limpia || Object.assign({}, entrada);
      limpia[m] = isFinite(n) ? n : 0;
    });
    return limpia;
  };

  if (paceEsObjetoPlano(e.history)) {
    var h = e.history, hn = {}, rehacer = false, otraTocada = false;
    ['days', 'months', 'years'].forEach(function (nivel) {
      var src = h[nivel];
      if (!paceEsObjetoPlano(src)) { hn[nivel] = {}; if (src !== undefined) { otraTocada = true; if (nivel === 'days') rehacer = true; } return; }
      var limpio = {};
      Object.keys(src).forEach(function (clave) {
        if (!paceEsObjetoPlano(src[clave])) { otraTocada = true; if (nivel === 'days') rehacer = true; return; }
        var numeros = metricasNumero(src[clave]);
        limpio[clave] = numeros || src[clave];
        if (numeros) { otraTocada = true; rehacer = true; }
      });
      hn[nivel] = limpio;
    });
    if (otraTocada) {
      reparar('history', Object.assign({}, h, hn));
      /* Si se cayo algun DIA, o alguna metrica no era un numero, meses y años ya no
         suman lo mismo: se re-agregan con la migracion que ya existe (s69), que es
         idempotente. */
      if (rehacer) e._historyRecalculated_v0_28_8 = false;
    }
  }

  if (paceEsObjetoPlano(e.water)) {
    var w = e.water;
    if (typeof w.today !== 'number' || !isFinite(w.today) || typeof w.goal !== 'number' || !isFinite(w.goal)) {
      reparar('water', Object.assign({}, paceCopiaDefecto(d.water || {}), {
        goal: (typeof w.goal === 'number' && isFinite(w.goal)) ? w.goal : ((d.water && d.water.goal) || 8),
      }));
    }
  }

  if (paceEsObjetoPlano(e.streak)) {
    var st = e.streak;
    if (typeof st.current !== 'number' || typeof st.longest !== 'number') {
      reparar('streak', {
        current: typeof st.current === 'number' ? st.current : 0,
        longest: typeof st.longest === 'number' ? st.longest : 0,
        lastActiveDate: typeof st.lastActiveDate === 'string' ? st.lastActiveDate : null,
      });
    }
  }

  if (paceEsObjetoPlano(e.paths)) {
    var p = Object.assign({}, e.paths), pt = false;
    if (p.completed !== undefined && !paceEsObjetoPlano(p.completed)) { p.completed = {}; pt = true; }
    if (p.history !== undefined && !Array.isArray(p.history)) { p.history = []; pt = true; }
    if (p.current !== undefined && p.current !== null && !paceEsObjetoPlano(p.current)) { p.current = null; pt = true; }
    if (pt) reparar('paths', p);
  }

  /* Las rutinas propias: la lista y la tarjeta leen `r.id` y `r.steps.length` sin mirar, así que
     una entrada `null` o sin pasos tumbaba «Tus rutinas» entera (auditoría del 21 oct.). Lo que
     no se puede usar se APARTA tal cual en `customRoutinesApartadas`, que viaja en la copia: no
     se borra nada. Un paso que no es un objeto sale de su rutina, y la rutina entera, como
     estaba, va también a lo apartado. */
  if (Array.isArray(e.customRoutines)) {
    var texto = function (v) { return v === undefined || typeof v === 'string'; };
    var pasoUsable = function (p) { return paceEsObjetoPlano(p) && texto(p.name) && texto(p.cue); };
    var usables = [], apartadas = [];
    e.customRoutines.forEach(function (r) {
      var pasos = paceEsObjetoPlano(r) && Array.isArray(r.steps) ? r.steps.filter(pasoUsable) : [];
      if (!pasos.length || typeof r.id !== 'string' || !texto(r.name)) { apartadas.push(r); return; }
      if (pasos.length !== r.steps.length) { apartadas.push(r); r = Object.assign({}, r, { steps: pasos }); }
      usables.push(r);
    });
    if (apartadas.length) {
      reparar('customRoutines', usables);
      e.customRoutinesApartadas = (Array.isArray(e.customRoutinesApartadas) ? e.customRoutinesApartadas : []).concat(apartadas);
    }
  }

  Object.keys(FORMAS_AJENAS).forEach(function (k) {
    if (FORMAS_AJENAS[k] === 'objeto' && k in e && e[k] !== undefined && !paceEsObjetoPlano(e[k])) {
      e[k] = undefined; delete e[k]; reparados.push(k);
    }
  });

  return { estado: e, reparados: reparados };
}

/* paceGuardarRescate(raw, motivo) -> true si quedo guardada.
   Guarda la cadena CRUDA, no el objeto: si lo que fallo fue el JSON, el objeto
   no existe. No pisa un rescate con el MISMO contenido (cada arranque fallido
   lo intentaria), pero si uno distinto: el ultimo estado roto es el mas cercano
   a lo que la persona tenia. */
function paceGuardarRescate(raw, motivo) {
  try {
    if (typeof raw !== 'string' || raw === '') return false;
    var previo = localStorage.getItem(PACE_RESCATE_KEY);
    if (previo) {
      try { if (JSON.parse(previo).raw === raw) return true; } catch (e) {}
    }
    localStorage.setItem(PACE_RESCATE_KEY, JSON.stringify({
      v: 1,
      savedAt: Date.now(),
      motivo: String((motivo && motivo.message) || motivo || '').slice(0, 200),
      raw: raw,
    }));
    return true;
  } catch (e) { return false; }
}

/* paceLeerRescate() -> el registro o null. Lo consume el export de «Tus datos». */
function paceLeerRescate() {
  try {
    var g = JSON.parse(localStorage.getItem(PACE_RESCATE_KEY) || 'null');
    return (g && g.v === 1 && typeof g.raw === 'string') ? g : null;
  } catch (e) { return null; }
}

Object.assign(window, {
  PACE_RESCATE_KEY, paceSanearEstado, paceGuardarRescate, paceLeerRescate, paceEsObjetoPlano,
});
