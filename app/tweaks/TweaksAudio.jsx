/* PACE · app/tweaks/TweaksAudio.jsx (sesión 176 · reescrito en s188)
   ================================================
   EL BLOQUE DE SONIDO DE AJUSTES. Sale de `TweaksPanel.jsx` en s176, que ya iba
   por 466 líneas y con esto se pasaba de las 500 de la regla §1.

   POR QUÉ TIENE ESTA FORMA, y no es una reorganización gratuita: s175 metió la
   voz pegada a `soundOn`, así que quien tenía sonido se encontró una locución
   y **no podía quitarla sin apagar todo el sonido**. Lo reportó el usuario al
   probarla, y en la misma frase dijo el problema de fondo: «es demasiado menús
   para voz / selección de género / música y sonido general on-off». O sea: la
   pregunta no era dónde meter un interruptor más, era cómo no acabar con cinco.

   LA FORMA (V3 de la maqueta de s176, elegida mirándola; afinada en s188):
   cinco controles se vuelven **dos decisiones**, porque hay dos funciones:

     · QUÉ MARCA LA FASE -> Tono · Voz clara · Voz grave. **Nunca tono y voz a
       la vez**, y eso no es una simplificación de la UI: es lo que ya hacía el
       código. `playSound` intenta la voz y **sólo si no cabe** sintetiza
       (Sound.jsx). Presentarlo como una casilla de «añadir voz» habría descrito
       mal el mecanismo. s188 mete el TIMBRE en la misma fila que el tono: sigue
       siendo una decisión (qué suena en la fase) y desaparece la sangría de dos
       niveles que hacía «raro» el bloque (feedback del usuario, s188).
     · QUÉ SUENA DETRÁS -> Nada · Ambiente · Música. Nunca dos capas a la vez.

   EL MAESTRO ATENÚA, NO ESCONDE (s188): con el sonido apagado las dos filas de
   debajo se quedan a un 38 % y sin puntero. Antes desaparecían y el panel
   saltaba 84 px; así se ve qué vuelve al encender y nada se mueve.

   LAS DOS VOCES SE LLAMAN POR SU TIMBRE, no por su género: medido decodificando
   la onda, `sulafat` va por ~193 Hz y `bradford` por ~121 -- 1,59x. «Clara» y
   «Grave» dicen lo que se oye y no afirman nada que la app no sepa.

   Las piezas (`AjustesFila`, `AjustesPildoras`, `AjustesInterruptor`) vienen de
   `TweaksPanel.parts.jsx` por `window`: un `const` no cruza la IIFE (s148). */

function TweaksAudioBlock({ state, set }) {
  const { t } = useT();

  /* El fondo son dos booleanos en el estado (`ambientOn`, `musicOn`) y tres
     pildoras aqui. s177: TRES OPCIONES Y NO DOS, pero sigue siendo UNA decision:
     la fila es excluyente y nunca suenan dos capas a la vez (decision de s176).
     Se mantiene con dos booleanos en vez de un tri-estado para no migrar el
     `localStorage` de nadie por una prueba: la exclusion la garantiza ESTA
     funcion, que es el unico sitio que los escribe. Al apagar una capa se corta
     lo que ya estuviera sonando. */
  const ponerFondo = (cual) => {
    set({ ambientOn: cual === 'amb', musicOn: cual === 'mus' });
    if (cual !== 'amb' && window.ambientDrone) window.ambientDrone.stop(400);
    if (cual !== 'mus' && window.paceMusica) window.paceMusica.stop(400);
  };

  /* Que marca la fase: 'tono' apaga la voz; 'sulafat' / 'bradford' la encienden
     con ese timbre. Al elegir voz se PRECARGA en ese momento: si se esperara a
     la primera fase de la primera sesion, el clip no estaria listo
     (`canplaythrough`) y sonaria el sintetizador esa vez -- correcto pero
     desconcertante justo despues de haber elegido una voz. */
  const ponerSenal = (cual) => {
    if (cual === 'tono') { set({ voiceOn: false }); return; }
    set({ voiceOn: true, voice: cual });
    try { if (typeof window.paceVozInit === 'function') window.paceVozInit(cual); } catch (e) { /* sin Audio no hay precarga */ }
  };

  const vozActiva = state.voice === 'bradford' ? 'bradford' : 'sulafat';
  const senal = state.voiceOn === false ? 'tono' : vozActiva;
  const fondo = state.musicOn ? 'mus' : (state.ambientOn ? 'amb' : 'nada');
  const apagado = !state.soundOn;

  return (
    <React.Fragment>
      <AjustesFila id="sound" nombre={t('settings.sound')}>
        <AjustesInterruptor on={!!state.soundOn} onChange={(v) => set({ soundOn: v })} aria={t('settings.sound')} />
      </AjustesFila>
      <AjustesFila id="signal" nombre={t('settings.signal')} atenuada={apagado}>
        <AjustesPildoras aria={t('settings.signal')} valor={senal} onChange={ponerSenal} opciones={[
          { v: 'tono', name: t('settings.signal.tone') },
          { v: 'sulafat', name: t('settings.signal.clear') },
          { v: 'bradford', name: t('settings.signal.deep') },
        ]} />
      </AjustesFila>
      <AjustesFila id="bg" nombre={t('settings.bg')} atenuada={apagado}>
        <AjustesPildoras aria={t('settings.bg')} valor={fondo} onChange={ponerFondo} opciones={[
          { v: 'nada', name: t('settings.bg.none') },
          { v: 'amb', name: t('settings.bg.ambient') },
          /* s177 · «Musica» YA SE PINTA porque ya hay un archivo: suena en las
             rutinas de Equilibrio. En las demas familias todavia no hay pieza,
             asi que elegirla equivale a «Nada» hasta que existan. */
          { v: 'mus', name: t('settings.bg.music') },
        ]} />
      </AjustesFila>
    </React.Fragment>
  );
}

Object.assign(window, { TweaksAudioBlock });
