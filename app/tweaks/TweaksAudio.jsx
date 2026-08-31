/* PACE · app/tweaks/TweaksAudio.jsx (sesión 176)
   ================================================
   EL BLOQUE DE SONIDO DE AJUSTES. Sale de `TweaksPanel.jsx`, que ya iba por
   466 líneas y con esto se pasaba de las 500 de la regla §1.

   POR QUÉ CAMBIA DE FORMA, y no es una reorganización gratuita: s175 metió la
   voz pegada a `soundOn`, así que quien tenía sonido se encontró una locución
   y **no podía quitarla sin apagar todo el sonido**. Lo reportó el usuario al
   probarla, y en la misma frase dijo el problema de fondo: «es demasiado menús
   para voz / selección de género / música y sonido general on-off». O sea: la
   pregunta no era dónde meter un interruptor más, era cómo no acabar con cinco.

   LA FORMA ELEGIDA (variante V3 de la maqueta de s176, elegida mirándola):
   cinco controles se vuelven **dos decisiones**, porque hay dos funciones y no
   cinco:

     · QUÉ MARCA LA FASE -> un tono o una voz. **Nunca los dos**, y eso no es
       una simplificación de la UI: es lo que ya hacía el código. `playSound`
       intenta la voz y **sólo si no cabe** sintetiza (Sound.jsx). Presentarlo
       como una casilla de «añadir voz» habría descrito mal el mecanismo.
     · QUÉ SUENA DETRÁS -> el fondo. Hoy sólo hay «nada» y el drone de
       ambiente; la música, cuando exista, entra aquí como tercera opción y no
       como un eje nuevo. **No se pinta todavía**: un control que no hace nada
       es peor que un hueco.

   Medido en la maqueta, a 280 px de contenido (el panel son 320 con 20 de
   padding): el bloque ocupa **207 px** de alto con nueve controles. La variante
   plana ocupaba 291.

   LAS DOS VOCES SE LLAMAN POR SU TIMBRE, no por su género: medido decodificando
   la onda, `sulafat` va por ~193 Hz y `bradford` por ~121 -- 1,59x. «Clara» y
   «Grave» dicen lo que se oye y no afirman nada que la app no sepa.

   `const` a nivel de módulo NO cruza la IIFE del artefacto (trampa de s148), y
   por eso el componente se publica en `window` al final como todo lo demás. */

function TweaksAudioBlock({ state, set }) {
  const { t } = useT();

  /* La pill del panel, con los mismos valores que el resto de ejes. Vive aquí
     y no en `tweaksStyles` porque `TweaksPanel` la escribe igual en cinco
     sitios: unificarla es otra sesión y otro diff. */
  const pill = (activa) => ({
    padding: '6px 10px',
    fontSize: 11,
    fontWeight: activa ? 500 : 400,
    background: activa ? 'var(--ink)' : 'var(--paper-2)',
    color: activa ? 'var(--paper)' : 'var(--ink-2)',
    border: `1px solid ${activa ? 'var(--ink)' : 'var(--line)'}`,
    borderRadius: 'var(--r-sm)',
    transition: TWEAKS_PILL_TRANSITION,
    letterSpacing: 0.2,
  });

  const fila = (opts, extra = {}) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, ...extra }}>
      {opts.map(o => (
        <button key={o.k} onClick={o.on} style={pill(o.activa)}>{o.name}</button>
      ))}
    </div>
  );

  const rotulo = (txt) => (
    <div style={{ fontSize: 10.5, color: 'var(--ink-3)', margin: '9px 0 5px', letterSpacing: 0.1 }}>
      {txt}
    </div>
  );

  /* El fondo es un booleano en el estado (`ambientOn`) y dos pills aquí. Al
     apagarlo se corta el drone que ya estuviera sonando, como hacía la casilla
     que esto sustituye. */
  /* s177 · TRES OPCIONES Y NO DOS, pero sigue siendo UNA decision: la fila es
     excluyente y nunca suenan dos capas a la vez (decision de s176). Se
     mantiene con dos booleanos en vez de un tri-estado para no migrar el
     `localStorage` de nadie por una prueba: la exclusion la garantiza ESTA
     funcion, que es el unico sitio que los escribe. */
  const ponerFondo = (cual) => {
    set({ ambientOn: cual === 'amb', musicOn: cual === 'mus' });
    if (cual !== 'amb' && window.ambientDrone) window.ambientDrone.stop(400);
    if (cual !== 'mus' && window.paceMusica) window.paceMusica.stop(400);
  };

  /* Al elegir voz se PRECARGA en ese momento. Si se esperara a la primera fase
     de la primera sesión, el clip no estaría listo (`canplaythrough`) y sonaría
     el sintetizador esa vez -- correcto pero desconcertante justo después de
     haber elegido una voz. */
  const ponerVoz = (voz) => {
    set({ voice: voz });
    try { if (typeof window.paceVozInit === 'function') window.paceVozInit(voz); } catch (e) { /* sin Audio no hay precarga */ }
  };

  const vozActiva = state.voice === 'bradford' ? 'bradford' : 'sulafat';

  return (
    <div style={{ marginBottom: 16 }}>
      <Meta style={{ marginBottom: 4 }}>{t('settings.audio.label')}</Meta>
      <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginBottom: 6, letterSpacing: 0.1 }}>
        {t('settings.audio.hint')}
      </div>
      {fila([
        { k: 'on', name: t('settings.audio.on'), activa: !!state.soundOn, on: () => set({ soundOn: true }) },
        { k: 'off', name: t('settings.audio.off'), activa: !state.soundOn, on: () => set({ soundOn: false }) },
      ])}

      {/* Los dos ejes cuelgan del maestro: con el sonido silenciado no hay ni
          señal ni fondo que elegir, y enseñarlos sería ofrecer una decisión
          que no hace nada. Es lo que ya hacía la casilla de ambiente. */}
      {state.soundOn && (
        <React.Fragment>
          {rotulo(t('settings.signal.label'))}
          {fila([
            { k: 'tono', name: t('settings.signal.tone'), activa: state.voiceOn === false, on: () => set({ voiceOn: false }) },
            { k: 'voz', name: t('settings.signal.voice'), activa: state.voiceOn !== false, on: () => set({ voiceOn: true }) },
          ], { marginLeft: 16 })}

          {/* El timbre sólo existe si hay voz. Sangrado un escalón más: cuelga
              de «Voz», no del maestro. */}
          {state.voiceOn !== false && fila([
            { k: 'clara', name: t('settings.voice.clear'), activa: vozActiva === 'sulafat', on: () => ponerVoz('sulafat') },
            { k: 'grave', name: t('settings.voice.deep'), activa: vozActiva === 'bradford', on: () => ponerVoz('bradford') },
          ], { marginLeft: 32, marginTop: 6 })}

          {rotulo(t('settings.bg.label'))}
          {fila([
            { k: 'nada', name: t('settings.bg.none'), activa: !state.ambientOn && !state.musicOn, on: () => ponerFondo('nada') },
            { k: 'amb', name: t('settings.bg.ambient'), activa: !!state.ambientOn, on: () => ponerFondo('amb') },
            /* s177 · «Musica» YA SE PINTA porque ya hay un archivo. El brief
               decia que no se pintara hasta entonces -- «un control que no hace
               nada es peor que un hueco»-- y hoy hace algo: suena en las
               rutinas de Equilibrio. En las demas familias todavia no hay
               pieza, asi que elegirla equivale a «Nada» hasta que existan. */
            { k: 'mus', name: t('settings.bg.music'), activa: !!state.musicOn, on: () => ponerFondo('mus') },
          ], { marginLeft: 16 })}
        </React.Fragment>
      )}
    </div>
  );
}

Object.assign(window, { TweaksAudioBlock });
