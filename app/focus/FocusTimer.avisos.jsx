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

   «AVISOS A SU HORA ›» (P4 A de Ez, 13 nov. 2026): abajo, en `useOfertaExacta`.

   Sacado de FocusTimer.jsx, que está en el tope de líneas. */

const { useEffect: useEffectAvisosFT, useState: useStateAvisosFT } = React;

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

/* Sin «Alarmas y recordatorios», Android puede retrasar el aviso unos minutos, y en una pausa de 5
   se nota. Hoy se ofrece en Ajustes; además, UNA vez en la vida de la instalación
   (`exactaOfrecida`), al empezar un Foco con el aviso encendido, sale una línea en la fila de
   «Ciclo 1 / 4», que en ese momento no dice nada: ni tapa ni mueve nada (Ez rechaza lo que se pone
   encima). Al tocarla se abre el ajuste de Android y al volver se va; si no se toca, se va al acabar
   ese Foco. Nunca abre el ajuste sin un toque. Su texto no dice «ciclo»: el motor del aro busca esa
   fila por esa palabra (home-geometry.js). */
function useOfertaExacta({ state, set, status, t }) {
  const [viva, setViva] = useStateAvisosFT(false);
  const enMarcha = status === 'running' || status === 'paused';
  const android = typeof paceAndroidAvisoExacto === 'function' && typeof pacePlataformaNativa === 'function'
    && pacePlataformaNativa() === 'android';
  const candidata = android && !state.exactaOfrecida && state.focusMode === 'foco' && !!state.notifyFocusEnd;
  useEffectAvisosFT(() => {
    if (!enMarcha || !state.notifyFocusEnd) { setViva(false); return undefined; }
    if (!candidata || status !== 'running' || paceNativoAvisoPermiso() === 'denied') return undefined;
    let vale = true;
    const ofrecer = (e) => { if (vale && e === 'denied') { setViva(true); set({ exactaOfrecida: true }); } };
    const e = paceAndroidAvisoExacto();
    if (e === 'default') paceAndroidAvisoExactoMirar().then(ofrecer, () => {});
    else ofrecer(e);
    return () => { vale = false; };
  }, [enMarcha, candidata, status, state.notifyFocusEnd]);
  if (!viva) return null;
  const pedir = () => { paceAndroidAvisoExactoPedir().then(() => setViva(false), () => setViva(false)); };
  return (
    <button type="button" className="pace-oferta-exacta" data-pace-oferta-exacta onClick={pedir}
      aria-label={t('focus.exacta.aria')}>{t('focus.exacta')}</button>
  );
}

(function paceOfertaExactaCss() {
  if (document.getElementById('pace-oferta-exacta-css')) return;
  const s = document.createElement('style');
  s.id = 'pace-oferta-exacta-css';
  s.textContent = `
.pace-oferta-exacta { background: none; border: 0; padding: 6px 4px; cursor: pointer; font-family: var(--font-ui); font-size: 11px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--focus); }
.pace-oferta-exacta:hover { color: var(--focus-2); }
.pace-oferta-exacta:focus-visible { outline: 2px solid var(--focus-cta); outline-offset: 2px; border-radius: 4px; }
`;
  document.head.appendChild(s);
})();

Object.assign(window, { useAvisosNativos, useOfertaExacta });
