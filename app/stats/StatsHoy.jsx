/* PACE · Estadísticas · HOY (Fase 4 de «Camino a v1.0»)
   =====================================================
   «Hoy» enseña el menú del día de «A tu ritmo» y es gratis (Ez, 8 oct. 2026). Ez eligió las
   formas mirando fotos de la app el 15 oct. (`docs/proposals/stats-hoy-fase4-ligera.html`):
   arriba, los cuatro totales de hoy con la misma pieza que la semana, el mes y el año
   (`StatsTotales`); debajo, UNA TARJETA POR PARADA del menú con lo que pasó: hecha, saltada, la
   que toca ahora o la que viene. Por libre no hay menú, así que salen las pausas que hiciste
   hoy, con su hora, del registro de eventos (`session.completed`).

   LOS TOTALES SON LOS DE LA BARRA LATERAL (`selectSidebarToday`): Estadísticas es la fuente
   única de «cómo va mi día» y no puede haber dos cuentas distintas del mismo número.

   LOS ESTADOS SON LOS DE LA LÍNEA (`dia.estados`, por ordinal de parada): la hecha lleva su aro
   relleno al 22 % con borde entero, la saltada va al 40 % y a trazos, y lo pasado sin marca se
   queda como estaba. Mismas reglas y mismos colores (`RITMO_COLOR`).

   LO HECHO POR TU CUENTA SE VE (Ez, 6A del 11 nov. 2026; revisión de ChatGPT, punto 6). Con el día
   elegido solo salían las paradas del plan: una Respira antes de elegirlo, o una rutina entre dos
   pausas, sumaba en los totales de arriba y no salía debajo. Ahora, tras las paradas, un título
   pequeño, «Además, por tu cuenta», y esas sesiones con las mismas tarjetas, por hora. Son las de
   hoy que no apuntó ninguna pausa del día (`dia.sesiones`, por `runId`): una rutina hecha en una
   pausa sale una vez, en su parada, aunque otra con el mismo nombre se hiciera suelta.

   UN DÍA LARGO CABE IGUAL: con más de diez paradas las tarjetas van en una línea (y en el
   móvil, en dos columnas), y con más de quince el escritorio pone seis por fila. Así una
   jornada de 5:00 a 23:30 no pide scroll en el escritorio. */

const STATS_HOY_MODULO = { breathe: 'respira', move: 'mueve', stretch: 'estira' };

/* Las paradas del menú (pausas, cierre y comida) con su estado. */
function statsHoyParadas(plan) {
  const m = plan.m;
  const iActual = ritmoIndiceAhora(plan);
  const out = [];
  m.items.forEach((it, i) => {
    if (it.tipo === 'comida') { out.push({ it, comida: true }); return; }
    if (!(it.tipo === 'pausa' || it.tipo === 'cierre') || !it.platos || !it.platos.length) return;
    const n = ritmoOrdinal(m, it);
    const marca = (plan.estados || {})[n] || null;
    /* la de ahora sigue con su marco de «ahora» (`estado`), pero si ya la hiciste lo dice (`marca`, 7A) */
    out.push({ it, n, marca, estado: i === iActual ? 'ahora' : i < iActual ? (marca || 'pasada') : null });
  });
  return out;
}

/* Las pausas de hoy por libre: las sesiones de Respira, Mueve y Estira que el registro
   guardó con el día local de hoy. Sin almacén (`file://`), ninguna. Sus minutos son los que
   se sumaron a la semana (Ez, 2A del 22 oct.): las tarjetas suman lo mismo que el total de
   arriba. Las guardadas antes de v0.174.4 no los traen y siguen con su cifra de ejercicio. */
function statsHoySesiones() {
  return ritmoSesionesHoy()
    .map((e) => {
      const f = new Date(e.occurredAt);
      const rutina = (window.resolveAnyRoutine && window.resolveAnyRoutine(e.payload.routineId)) || { id: e.payload.routineId, name: e.payload.routineId };
      return { modulo: STATS_HOY_MODULO[e.payload.module], rutina, desde: f.getHours() * 60 + f.getMinutes(),
               min: sessionCreditedMinutes(e), cuando: f.getTime(), runId: e.runId || null };
    })
    /* Por el instante y no por la hora de reloj: el día que se atrasa la hora, de 2:00 a
       3:00 pasa dos veces y lo de la segunda vuelta salía antes que lo de la primera. */
    .sort((a, b) => a.cuando - b.cuando);
}

/* Con el día elegido, las sesiones de hoy que no son de ninguna de sus pausas (6A). */
function statsHoySueltas(state) {
  const por = (ritmoDe(state).dia || {}).sesiones || {};
  const suyas = new Set();
  Object.keys(por).forEach((n) => (Array.isArray(por[n]) ? por[n] : []).forEach((id) => suyas.add(id)));
  return statsHoySesiones().filter((s) => !s.runId || !suyas.has(s.runId));
}

/* Las sesiones sueltas: la misma tarjeta, hecha, con su hora y sus minutos. */
function StatsHoySesiones({ sesiones, t, lang }) {
  return (
    <StatsHoyRejilla n={sesiones.length}>
      {sesiones.map((s, k) => (
        <StatsHoyTarjeta key={k} modulos={[s.modulo]} nombre={ritmoNombre(s.rutina, t, lang)}
          hora={ritmoHora(s.desde)} meta={s.min + ' min'} estado="hecha" />
      ))}
    </StatsHoyRejilla>
  );
}

/* Los cuatro totales de hoy. El agua, contra la meta de Ajustes: «5 de 8 vasos». */
function statsHoyTotales(state, t) {
  const h = selectSidebarToday(state);
  const v = { focus: h.focusMinutes, breath: h.breatheMinutes, move: h.bodyMinutes, water: h.waterGlasses };
  return statsSeries(t).map((s) => ({ key: s.key, label: s.label, color: s.color, valor: v[s.key],
    unidad: s.key === 'water' ? t('stats.hoy.vasos.de').replace('{m}', h.waterGoal) : s.unit }));
}

/* Una parada (o una pausa por libre): el glifo en su aro y, al lado, el nombre y una línea
   con la hora y lo que pasó. */
function StatsHoyTarjeta({ modulos, nombre, hora, meta, estado, larga }) {
  return (
    <div className={'pace-sh-t' + (estado ? ' pace-sh-' + estado : '')} data-pace-hoy-parada={estado || 'luego'}
      style={{ '--c': RITMO_COLOR[modulos[0]], '--cd': letraDe(RITMO_COLOR[modulos[0]]) }}>
      <i className={'pace-sh-aro' + (larga ? ' pace-sh-larga' : '')}>
        {modulos.map((m, k) => <RitmoGlifo key={k} modulo={m} />)}
      </i>
      <div className="pace-sh-txt">
        <div className="pace-sh-n">{nombre}</div>
        <div className="pace-sh-m"><span className="pace-sh-h">{hora}</span>{meta ? ' · ' + meta : ''}</div>
      </div>
    </div>
  );
}

/* Una pausa hecha dice los minutos que hiciste, no los del hueco (Ez, 7A del 11 nov. 2026;
   `ritmoMinutosHechos`, state-ritmo.pausa.jsx); la de ahora, si ya la hiciste, también. */
function statsHoyMeta(p, t, hechas) {
  const { it } = p;
  const estado = p.estado === 'ahora' && (p.marca === 'hecha' || p.marca === 'cuenta') ? p.marca : p.estado;
  if (p.comida) return ritmoDuracion(it.dur);
  if (estado === 'hecha') return ritmoMetaHecha((hechas || {})[p.n], t);
  if (estado === 'saltada') return t('ritmo.saltada');
  if (estado === 'cuenta') return t('ritmo.cuenta');   /* sin minutos: no hubo sesión (4A del 8 nov.) */
  if (estado === 'ahora') return t('ritmo.ahora.min');
  return it.dur + ' min';
}

function StatsHoyRejilla({ n, children }) {
  const clase = 'pace-sh-rejilla' + (n > 10 ? ' pace-sh-mucho' : '') + (n > 15 ? ' pace-sh-muchisimo' : '');
  return <div className={clase} data-pace-hoy-rejilla={n}>{children}</div>;
}

function StatsHoy({ state, onClose }) {
  const { t, lang } = useT();
  const R = ritmoDe(state);
  const plan = R.libre ? null : ritmoPlan(state);

  if (plan) {
    const paradas = statsHoyParadas(plan);
    const hechas = ritmoMinutosHechos(state);
    const sueltas = statsHoySueltas(state);
    return (
      <div data-pace-hoy-view="menu">
        <StatsTotales items={statsHoyTotales(state, t)} />
        <div className="pace-sh-cab">
          <Meta>{t('ritmo.opcion.' + plan.m.opcion) + ' · ' + ritmoHora(plan.m.desde) + '–' + ritmoHora(plan.m.hasta)}</Meta>
        </div>
        <StatsHoyRejilla n={paradas.length}>
          {paradas.map((p, k) => {
            const modulos = p.comida ? ['comida'] : p.it.platos.map((x) => x.modulo);
            return <StatsHoyTarjeta key={k} modulos={modulos} larga={p.it.larga}
              nombre={p.comida ? t('ritmo.comida') : ritmoPlatos(p.it, t, lang)} hora={ritmoHora(p.it.desde)}
              meta={statsHoyMeta(p, t, hechas)} estado={p.comida ? 'comida' : p.estado} />;
          })}
        </StatsHoyRejilla>
        {sueltas.length ? (
          <div data-pace-hoy-sueltas={sueltas.length}>
            <div className="pace-sh-cab pace-sh-suelta"><Meta>{t('stats.hoy.suelta')}</Meta></div>
            <StatsHoySesiones sesiones={sueltas} t={t} lang={lang} />
          </div>
        ) : null}
      </div>
    );
  }

  /* Sin menú: por libre, o sin haber contestado hoy. «Ponle ritmo al día» cierra Estadísticas: la
     pregunta del día sale en la home, y con el panel delante no se veía nada (M5, 22 oct.). */
  const sesiones = statsHoySesiones();
  const volver = () => { ritmoVolver(); if (onClose) onClose(); };
  return (
    <div data-pace-hoy-view="libre">
      <StatsTotales items={statsHoyTotales(state, t)} />
      <div className="pace-sh-cab">
        <Meta>{t('stats.hoy.libre')}</Meta>
        <button type="button" className="pace-rt-enlace pace-rt-fuerte" data-pace-hoy-volver onClick={volver}>{t('ritmo.volver')}</button>
      </div>
      {sesiones.length ? <StatsHoySesiones sesiones={sesiones} t={t} lang={lang} /> : <p className="pace-sh-vacio" data-pace-hoy-vacio>{t('stats.hoy.vacio')}</p>}
    </div>
  );
}

Object.assign(window, { StatsHoy, statsHoyParadas, statsHoySesiones, statsHoySueltas, statsHoyTotales });
