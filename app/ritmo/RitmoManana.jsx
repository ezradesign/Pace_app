/* PACE · A tu ritmo · EL DÍA YA CONTESTADO (Fase 3, maqueta R2-manana)
   =====================================================================
   Con la semana tipo guardada (state-ritmo.support.jsx), cada mañana la pregunta llega ya
   contestada con lo de ese día. Ez lo eligió para todos, no solo para quien pague (7 de
   octubre de 2026). `ritmoHabitual(state)` decide si toca: hay semana, hoy no se ha hecho
   nada, no es día libre y aún queda jornada. Si no, la pregunta de siempre.

     · móvil: sustituye a la pregunta. El nombre del día con «· como cada martes», la frase con
       tus horas (que se tocan como en el día servido), la línea del día que te espera y
       «Hoy es distinto» · «Comienza →». Sin «A TU RITMO» encima: Ez lo quitó de la tarjeta
       corta en v0.146.0 porque no aportaba.
     · escritorio: la pregunta de siempre con el título «Hoy, como cada martes», tu opción
       marcada y «Comienza →» junto a las opciones (RitmoPregunta). Las otras
       opciones se siguen eligiendo de un toque, así que ahí no hace falta «Hoy es distinto».

   La línea es una VISTA PREVIA: el menú que saldría al pulsar «Comienza», dibujado por
   RitmoMini sin nada hecho. No escribe nada hasta que se pulsa. */

/* El botón que empieza el día de siempre: la píldora de la tarjeta corta del móvil. */
function RitmoComienzaHabitual() {
  const { t } = useT();
  return (
    <button type="button" className="pace-rt-tm-comienza" data-pace-ritmo-habitual-comienza onClick={ritmoComenzarHabitual}>
      <span className="pace-rt-tm-pildora">
        {t('ritmo.tarjeta.comienza')}
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M1 5h13" /><path d="M10.5 1.5L14 5l-3.5 3.5" />
        </svg>
      </span>
    </button>
  );
}

function RitmoMananaMovil({ h }) {
  const { t, tn } = useT();
  const vista = { m: h.m, hechos: 0, actual: h.m.focos[0], estados: {} };
  return (
    <div className="pace-rt-panel pace-rt-mov" data-pace-ritmo-estado="habitual" data-pace-ritmo-habitual={h.opcion}>
      {/* «como cada jueves» va JUNTO AL TÍTULO (la B, elegida por Ez): en la esquina, como en
          la maqueta, le quitaba ancho a la frase y dejaba «1 h» sola en otra línea. */}
      <div className="pace-rt-cab">
        <div>
          <div className="pace-rt-titulo">
            {t('ritmo.opcion.' + h.opcion)}{' '}
            <span className="pace-rt-habitual-como">{'· ' + tn('ritmo.manana.como', { dia: ritmoNombreDia(h.diaSemana, t) })}</span>
          </div>
          <div className="pace-rt-sub pace-rt-frase"><RitmoFraseMenu plan={vista} horario={h.horario} plantilla="ritmo.frase.movil" /></div>
        </div>
      </div>
      <div className="pace-rt-mini-fila"><RitmoMini plan={vista} /></div>
      <div className="pace-rt-tm-pie pace-rt-habitual-pie">
        <button className="pace-rt-enlace" data-pace-ritmo-distinto onClick={ritmoDistinto}>{t('ritmo.manana.distinto')}</button>
        <RitmoComienzaHabitual />
      </div>
    </div>
  );
}

Object.assign(window, { RitmoComienzaHabitual, RitmoMananaMovil });
