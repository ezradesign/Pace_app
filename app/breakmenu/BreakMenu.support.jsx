/* PACE · La PROPUESTA del menú de pausa (s187)
   ============================================
   Al terminar un Pomodoro la app sabe tres cosas —cuánto llevabas sentado, qué
   has hecho hoy y qué hora es— y hasta s187 no usaba ninguna: ofrecía cuatro
   módulos y te dejaba elegir entre 17 rutinas de Estira.

   ESTO ES PURO Y VIVE APARTE a propósito: la regla se puede asertar sin abrir un
   navegador, y `BreakMenu.jsx` se queda con el dibujo. Mismo patrón que
   `library-rules.js`, del que además se reutiliza el recomendador.

   LA REGLA, y su orden no es estético: va de lo que ACABA DE PASAR a lo que es
   cierto en general. La primera condición que se cumple gana, y **si no se
   cumple ninguna no se propone nada** — una propuesta sin motivo es publicidad,
   y el menú vuelve a ser el de siempre.

     1. bloque de 35 min o más  → Estira   · «Llevas 45 minutos sentado»
     2. cero vasos y ya es tarde → agua    · «Aún no has bebido hoy»
     3. tercer bloque de hoy     → Respira · «Tercer bloque de hoy»
     4. algo pendiente del plan  → ese     · «Hoy aún no has movido el cuerpo»
     5. nada                     → null

   POR QUÉ «DE HOY» Y NO «SEGUIDO»: `state.cycle` se pone a cero en el relevo de
   día (`state-core.support.jsx`), así que cuenta los bloques de HOY — pero no
   dice nada de si fueron seguidos o con tres horas en medio. Decir «tercer
   bloque seguido» sería afirmar algo que el dato no sostiene.

   LO QUE NO ENTRA, y está decidido: lo que hiciste AYER (está en
   `pace.events.v1`, pero un menú que se abre dos segundos no es sitio para
   comparar días), el PERFIL del onboarding (mezcla una intención de hace semanas
   con lo que pasa ahora) y cualquier RACHA o total (es presión disfrazada de
   dato, y esto es una pausa).

   LA RUTINA CONCRETA LA ELIGE `libraryParaAhora`, que ya rota por día, ordena
   por duración y respeta el acceso premium. No se inventa un segundo
   recomendador. Y el pozo excluye SIEMPRE las rutinas con aviso de seguridad:
   una apnea no se propone sola al salir de un bloque de trabajo. */

/* breakPozo(catalogo) -> las rutinas abiertas de un catálogo agrupado.

   AQUI NO SE FILTRA LA SEGURIDAD, y es deliberado: ese filtro vive UNA sola vez,
   en el predicado que `breakElige` le pasa a `libraryParaAhora`. La primera
   version lo tenía en los dos sitios y el banco de mutaciones lo destapó --
   quitarlo de aquí no ponía rojo nada, o sea que no se podía saber si alguno de
   los dos funcionaba. Es exactamente el defecto que s166 encontró con el reloj
   de retención.

   Total: cualquier cosa rara devuelve lista vacía, y una lista vacía hace que la
   regla siga a la condición siguiente en vez de proponer un módulo sin nada. */
function breakPozo(catalogo) {
  const out = [];
  try {
    Object.keys(catalogo || {}).forEach(function (g) {
      ((catalogo[g] || {}).items || []).forEach(function (r) {
        if (!r) return;
        if (window.canAccessRoutine && !window.canAccessRoutine(r.id)) return;
        out.push(r);
      });
    });
  } catch (e) { return []; }
  return out;
}

/* breakElige(catalogo, iso) -> UNA rutina, o null. */
function breakElige(catalogo, iso) {
  const pozo = breakPozo(catalogo);
  if (!pozo.length || typeof libraryParaAhora !== 'function') return null;
  const elegidas = libraryParaAhora(pozo, iso, 1, function (r) { return !r.safety; });
  return (elegidas && elegidas[0]) || null;
}

/* breakPropuesta(state, ctx) -> { modulo, porque, datos, rutina } o null.
   PURA: `ctx` trae la hora y el día para poder fijarlos en un test (el mismo
   truco que `libraryParaAhora`, que recibe el ISO en vez de mirar el reloj).

   `modulo` usa las MISMAS claves que las tarjetas del menú ('extra' es Estira y
   'move' es Muévete, con los ids cruzados de siempre), así que elegir la
   propuesta entra exactamente por donde entra pulsar su tarjeta. */
function breakPropuesta(state, ctx) {
  const s = state || {};
  const c = ctx || {};
  const iso = c.iso || (typeof todayISO === 'function' ? todayISO() : '');
  const hora = typeof c.hora === 'number' ? c.hora : new Date().getHours();
  const agua = s.water || { today: 0, goal: 8 };
  const plan = s.plan || {};
  const minutos = Number(s.focusMinutes) || 0;
  /* El bloque que ACABA de terminar: `completePomodoro` ya subió el contador
     antes de que este menú se abra, así que el que cuenta es el anterior. */
  const bloqueDeHoy = Math.max(1, Number(s.cycle) || 1);

  const con = (modulo, porque, rutina, extra) => ({
    modulo: modulo, porque: porque, rutina: rutina || null,
    datos: Object.assign({}, extra || {}),
  });

  /* 1 · lo que acaba de pasar. 35 min es el primer preset que ya no es «una
     pausa corta»: a partir de ahí el cuerpo lleva sentado más de media hora. */
  if (minutos >= 35) {
    const r = breakElige(window.EXTRA_ROUTINES, iso);
    if (r) return con('extra', 'sitting', r, { n: minutos });
  }

  /* 2 · el agua no necesita rutina ni nombre: es un vaso. Solo a partir del
     mediodía -- a las nueve de la mañana «aún no has bebido» no es un reproche
     útil, es la hora que es. */
  if (agua.today === 0 && hora >= 12) return con('water', 'water', null, {});

  /* 3 · el tercero de hoy. Ni el primero (aún no hay historia) ni el cuarto
     (ahí ya toca la pausa larga, que es otra conversación). */
  if (bloqueDeHoy === 3) {
    const r = breakElige(window.BREATHE_ROUTINES, iso);
    if (r) return con('breathe', 'third', r, {});
  }

  /* 4 · lo que el plan del día tenga pendiente. El orden -- cuerpo antes que
     respiración- es el que ya tenía el score del menú. */
  const pendientes = [
    { modulo: 'extra', hecho: plan.extra, cat: window.EXTRA_ROUTINES, key: 'pending.extra' },
    { modulo: 'move', hecho: plan.muevete, cat: window.MOVE_ROUTINES, key: 'pending.move' },
    { modulo: 'breathe', hecho: plan.respira, cat: window.BREATHE_ROUTINES, key: 'pending.breathe' },
  ];
  for (let i = 0; i < pendientes.length; i++) {
    const p = pendientes[i];
    if (p.hecho) continue;
    const r = breakElige(p.cat, iso);
    if (r) return con(p.modulo, p.key, r, {});
  }

  /* 5 · todo hecho: no se propone nada, y eso es correcto. */
  return null;
}

Object.assign(window, { breakPozo, breakElige, breakPropuesta });
