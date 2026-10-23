/* PACE · EL ARO CON BLOQUES CORTOS (Ez, 22 oct. 2026: 4a A · 4b A · 5a A · 5b B)
   ============================================================================
   Lo que el aro enseña con el aro a 5, 10 o 15. La regla (cuándo se invita, cuándo va
   la pausa, la cuenta sin día) vive en state-ritmo.bloques.jsx; aquí solo se pinta.

   · 4a · LA INVITACIÓN. Al acabar el bloque que llega a 15 min de foco seguido, sin la
     pausa detrás: bajo la hora, «Un momento para moverte»; el botón dice «Ver ejercicio»
     (Ez: «Hacerla» sonaba raro) y al lado va «Seguir», que empieza el bloque siguiente.
     Usa la misma fila que «Continuar · Reiniciar bloque», así que la home no crece. Vive
     mientras el aro está en 'completed': empezar, cambiar los minutos o el modo la quitan.
   · 4b · LA ELECCIÓN, en la línea pequeña bajo la hora («Foco breve»), con el mismo
     desplegable que las horas del día: «Ejercicio a mi ritmo» o «después de cada bloque».
     Solo con el día empezado y el aro parado (Ez: «en el otro menú con los módulos no tiene
     sentido»); al acabar un bloque, ese sitio es de la invitación si la hay.
   · 5b B · «Ver ejercicio» abre una hoja abajo con el ejercicio que toca (RitmoHacerla.jsx),
     elegido una vez por invitación (state-ritmo.hacerla.jsx). Su «Empezar» quita la
     invitación y pide la pantalla de ejercicio (`pace:hacerla`, main.eventos.jsx): al
     acabar o al salir, el aro espera el bloque siguiente.

   `inner` del aro solo existe en el estilo aro: la elección, que es un <select>, solo va
   ahí (en el analógico el subtítulo es un <text> de SVG). La invitación es texto y vale
   en los tres. Carga ANTES de FocusTimer.jsx, que llama a `useBloquesAro`. */

const { useState: useStateFB, useEffect: useEffectFB } = React;

function useBloquesAro({ state, status, isAro, t, seguir }) {
  const [invita, setInvita] = useStateFB(false);
  const [hoja, setHoja] = useStateFB(false);
  const [ejercicio, setEjercicio] = useStateFB(null);
  const foco = state.focusMode === 'foco';
  const completo = status === 'completed';
  /* Solo al cambiar el motor o el modo: `marcar` puede llegar antes o después de que el
     aro pase a 'completed', y en los dos casos tiene que quedarse. */
  useEffectFB(() => {
    if (status !== 'completed' || !foco) { setInvita(false); setHoja(false); setEjercicio(null); }
  }, [status, foco]);
  const invitando = invita && completo && foco;

  /* 4b: el plan solo se mira con el aro parado (en marcha re-renderiza cada segundo). */
  const parado = status === 'idle' || completo;
  const plan = foco && isAro && parado && !invitando && bloquesCortos(state.focusMinutes) && typeof ritmoPlan === 'function'
    ? ritmoPlan(state) : null;
  const eleccion = !!(plan && plan.actual);

  let subtitulo = null;
  if (invitando) subtitulo = <span data-pace-invita>{t('bloques.invita')}</span>;
  else if (eleccion) {
    subtitulo = (
      <span data-pace-bloques>
        {t('bloques.ejercicio')}{' '}
        <select data-pace-bloques-sel className="pace-rt-sel" aria-label={t('bloques.eleccion')}
          value={bloquesCadaUno(state) ? 'cada' : 'ritmo'} onChange={(e) => bloquesElegir(e.target.value)}>
          <option value="ritmo">{t('bloques.ritmo')}</option>
          <option value="cada">{t('bloques.cada')}</option>
        </select>
      </span>
    );
  }

  const abrirHoja = () => {
    if (!ejercicio && typeof hacerlaSiguiente === 'function') setEjercicio(hacerlaSiguiente());
    setHoja(true);
  };
  const empezar = () => {
    setHoja(false); setInvita(false); setEjercicio(null);
    if (ejercicio) window.dispatchEvent(new CustomEvent('pace:hacerla', { detail: { routine: hacerlaRutina(ejercicio), kind: ejercicio.modulo } }));
  };

  return {
    marcar: (v) => { setInvita(!!v); setEjercicio(null); },
    subtitulo,
    cta: invitando ? { label: t('bloques.hacerla'), action: abrirHoja } : null,
    seguir: invitando ? (
      <button type="button" data-pace-invita-seguir onClick={seguir} style={focusStyles.resetTextBtn}>{t('bloques.seguir')}</button>
    ) : null,
    hoja: invitando && hoja && ejercicio && typeof RitmoHacerla === 'function'
      ? ReactDOM.createPortal(<RitmoHacerla ejercicio={ejercicio} onClose={() => setHoja(false)} onEmpezar={empezar}
          onSeguir={() => { setHoja(false); seguir(); }} />, document.body)
      : null,
  };
}

Object.assign(window, { useBloquesAro });
