/* PACE · Foco · LOS AVISOS DEL MÓVIL: EL FIN DEL BLOQUE Y EL FIN DE LA PAUSA
   ============================================================
   En las apps (Android y iPhone) el aviso de fin lo programa el sistema (ui/nativo.js), porque
   con la app en el fondo la cuenta del aro no corre. Aquí solo se le dice cuándo acaba lo que
   corre, o que no hay nada.

   EL FIN DEL BLOQUE: con «A tu ritmo», `fin` nombra la pausa que viene, como el aviso de la web
   (ritmo/ritmo.aviso.js), y `fijo` es el aviso fijo con el móvil bloqueado (N4); los dos se leen
   al irse al fondo.

   EL FIN DE LA PAUSA (auditoría externa 4.F2 y 4.F3, 12 nov. 2026): suena distinto del fin del
   bloque, para saber sin mirar si toca parar o volver. Avisa de la pausa que corre (Pausa o Larga,
   elegida a mano o la de «A tu ritmo») y, con un bloque de «A tu ritmo» en marcha, de la pausa que
   empezará sola cuando acabe (`ritmoPausaTrasBloque`). Va con el mismo «Aviso al terminar».

   Sacado de FocusTimer.jsx, que está en el tope de líneas. */

const { useEffect: useEffectAvisosFT } = React;

function useAvisosNativos({ state, running, endsAt, pausaRitmo, enPausaRitmo, t, tn, lang }) {
  useEffectAvisosFT(() => {
    if (typeof paceNativoFoco !== 'function') return;
    const vivo = running && state.focusMode === 'foco' && !!state.notifyFocusEnd;
    paceNativoFoco(vivo ? endsAt : null, { title: t('notify.focus.title'), body: t('notify.focus.body'),
      fin: () => (typeof ritmoAvisoFin === 'function' ? ritmoAvisoFin(getState(), t, tn, lang) : null),
      fijo: () => (typeof ritmoAvisoFijo === 'function' ? ritmoAvisoFijo(getState(), t, tn, lang, endsAt) : null) });   // N4: se lee al irse al fondo
  }, [running, endsAt, state.focusMode, state.notifyFocusEnd, lang]);

  const ritmoN = enPausaRitmo && pausaRitmo ? pausaRitmo.n : null;
  useEffectAvisosFT(() => {
    if (typeof paceNativoPausa !== 'function') return;
    let pausa = null;
    if (running && endsAt && state.notifyFocusEnd) {
      if (state.focusMode !== 'foco') pausa = { hasta: endsAt, n: ritmoN, total: ritmoN ? pausaRitmo.de : null };
      else if (typeof ritmoPausaTrasBloque === 'function') pausa = ritmoPausaTrasBloque(getState(), endsAt);
    }
    paceNativoPausa(pausa ? pausa.hasta : null, pausa && {
      title: t('notify.pausa.title'),
      body: pausa.n ? tn('notify.pausa.ritmo', { n: pausa.n, total: pausa.total }) : t('notify.pausa.body'),
    });
  }, [running, endsAt, state.focusMode, state.notifyFocusEnd, state.ritmo, ritmoN, lang]);
}

Object.assign(window, { useAvisosNativos });
