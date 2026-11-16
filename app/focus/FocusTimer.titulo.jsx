/* PACE · La cuenta atrás del bloque en la pestaña
   Mientras corre un Foco o una pausa, el título de la pestaña dice lo que queda
   («24:13 · Foco · PACE»): quien trabaja en otra pestaña ve el reloj sin volver a PACE
   (auditoría externa, pasada 5, idea 4; fila 4 de la cola). En pausa, al acabar o con
   el reloj parado, vuelve el nombre de siempre (`paceTituloApp`, state-core.palette.jsx).

   Con la pestaña oculta más de cinco minutos, Chrome despierta los temporizadores una vez
   por minuto: el título se pone al día entonces. `remaining` sale del reloj real
   (useCountdown), así que lo que dice cuando se escribe es verdad. */

const { useEffect: useEffectTitulo } = React;

function paceTituloCuenta(remaining, modo, t) {
  const seg = Math.max(0, Math.floor(remaining || 0));
  const dos = (n) => (n < 10 ? '0' : '') + n;
  const etiqueta = modo === 'foco' ? t('focus.mode.focus')
                 : modo === 'pausa' ? t('focus.mode.pause')
                 : t('focus.mode.long');
  return dos(Math.floor(seg / 60)) + ':' + dos(seg % 60) + ' · ' + etiqueta + ' · PACE';
}

function useTituloCuenta({ running, remaining, modo, lang, t }) {
  useEffectTitulo(() => {
    try {
      document.title = running ? paceTituloCuenta(remaining, modo, t) : paceTituloApp(lang);
    } catch (e) {}
  }, [running, remaining, modo, lang]);
  /* Si el aro se desmonta corriendo, la pestaña no se queda con una cuenta parada. */
  useEffectTitulo(() => () => {
    try { document.title = paceTituloApp(getState().lang); } catch (e) {}
  }, []);
}

Object.assign(window, { useTituloCuenta, paceTituloCuenta });
