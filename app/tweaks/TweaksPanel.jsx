/* PACE · Panel de Ajustes (antes Tweaks)
   ============================================================
   s188 · REDISEÑADO ENTERO, y la forma se eligió MIRÁNDOLA en cinco rondas de
   maqueta (docs/proposals/ajustes-rediseno*.html; la aprobada es P1+ de la
   ronda 5). Lo que había: diez secciones sin agrupar, 30 pastillas, siete
   líneas de explicación, 1412 px de contenido (1,9 pantallas a 1280×800, 2,2
   en móvil), un bloque de audio con dos niveles de sangría y un bloque premium
   de 221 px que era un `<input disabled>`. Lo que hay:

     VER        idioma · paleta                      (lo de toda la app)
     OÍR        sonido · marca la fase · suena detrás (TweaksAudio.jsx)
     SESIONES   aviso · círculo · descanso · vasos    (uno por módulo, con su color)
     TUS DATOS  exportar · importar · borrar · licencia · pie (TweaksData.jsx)

   Cada ajuste es una FILA: nombre en cursiva a la izquierda, control a la
   derecha. Las piezas viven en `TweaksPanel.parts.jsx`; la hoja, en
   `TweaksPanel.support.jsx` (las razones de cada decisión visual están allí).
   Medido en la maqueta: 775 px, 1,03 pantallas.

   Ejes vigentes: idioma, paleta, audio, aviso de fin de foco, círculo de
   Respira, descanso entre series, objetivo de agua, datos. Tras bandera en
   `app/flags.js` (el código sigue vivo, ver allí): estilo del timer (s139),
   círculo 'orgánico' (s139) y **disposición sidebar/minimal (s188)** — este
   último se retira porque duplicaba el botón de plegar la barra.

   Retirados por decisión "menos variantes, más identidad":
     - logoVariant + supportCopyVariant (sesión 19).
     - font / tipografía display (sesión 20). La identidad
       tipográfica de PACE es Cormorant Garamond (default) +
       EB Garamond fijo para cifras de identidad. Decide PACE.
   Los campos del state (`font`, `logoVariant`, `supportCopyVariant`)
   se conservan por compatibilidad con localStorage existente.

   Sesión 17 (v0.12.0) — sigue vigente:
     - Export/Import JSON (backup local portátil), en TweaksData.jsx.
     - tweak-secrets reaccionando a combinaciones específicas:
         · secret.aged       → paleta 'envejecido'.
         · secret.dark.mode  → paleta 'oscuro' durante 7 días (acumulado).
         · explore.tweaks    → abrir este panel por primera vez.
       Los que no dependen de la UI de este panel viven en
       <TweakSecretsWatcher /> (app/tweaks/TweakSecretsWatcher.jsx, s41).
   ============================================================ */

const { useEffect: useEffectTW } = React;

/* `tweaksStyles` y las piezas `Ajustes*` llegan por `window` desde
   TweaksPanel.support.jsx y TweaksPanel.parts.jsx, que CARGAN ANTES: un `const`
   suyo no cruzaría la IIFE del build (la trampa de s148 con `sidebarStyles`).
   Aquí se referencian pelados a propósito. */

function TweaksPanel({ open, onClose }) {
  const [state, set] = usePace();
  const { t, tn } = useT();

  /* s102 · PWA: el aviso de fin de Foco y los enlaces /safety /privacy solo
     tienen sentido servidos por web — en el standalone file:// no hay SW ni
     rutas. Un solo gate para ambos bloques. */
  const isWeb = location.protocol === 'http:' || location.protocol === 'https:';
  const canNotify = isWeb && typeof Notification !== 'undefined';

  /* Activar el aviso pide el permiso del navegador AQUÍ (gesto del usuario,
     nunca al arrancar ni al terminar un pomodoro). Si está bloqueado, la nota
     de debajo lo explica; el interruptor no puede encenderse. */
  const enableNotify = () => {
    if (!canNotify) return;
    if (Notification.permission === 'granted') { set({ notifyFocusEnd: true }); return; }
    if (Notification.permission === 'denied') return;
    try {
      Notification.requestPermission().then((p) => {
        /* La rama denegada escribe el MISMO false: el objeto de state nuevo
           fuerza el re-render que hace visible la nota 'blocked' (permission
           no es reactivo por sí solo). */
        if (p === 'granted') set({ notifyFocusEnd: true });
        else set({ notifyFocusEnd: false });
      });
    } catch (e) {}
  };

  /* Reset — s155: `paceEventsWipeAll` borra los DOS almacenes por la barrera;
     sin eso `privacy.html` mentiría al prometer borrado total. Se DEFINE aquí y
     se pinta en TweaksData.jsx: `scripts/verify.eventos.js` comprueba que el
     reset del panel pase por la barrera leyendo ESTE archivo. */
  const borrarTodo = () => {
    if (confirm(t('settings.confirm.reset'))) paceEventsWipeAll(() => location.reload());
  };

  // explore.tweaks — abrir el panel una vez. Se dispara al abrir.
  useEffectTW(() => {
    if (open) unlockAchievement('explore.tweaks');
  }, [open]);

  if (!open) return null;

  /* Idioma y paleta comparten gramática (s139 / s161): «Auto» es un MODO que
     vive en `langAuto` / `paletteAuto`, y las otras opciones son valores.
     Elegir un valor APAGA el modo (lo hace `setPalette`; para el idioma se
     escribe aquí). Al entrar en Auto se resuelve YA, para que el panel cambie
     en el momento y no al recargar. */
  const langValor = state.langAuto ? 'auto' : state.lang;
  const ponerLang = (v) => set(v === 'auto'
    ? { langAuto: true, lang: detectInitialLang() }
    : { langAuto: false, lang: v });
  const palValor = state.paletteAuto ? 'auto' : state.palette;
  const ponerPaleta = (v) => (v === 'auto' ? setPaletteAuto(true) : setPalette(v));

  /* El círculo de Respira: cuatro dibujos (y el orgánico, tras bandera). El
     nombre del elegido va en la línea del módulo, no en la pildora: así las
     cuatro caben en su fila (medido en la maqueta, ronda 5). */
  const estilosCirculo = ['flor', 'pulso', 'petalo', 'ondas']
    .concat(window.SHOW_BREATH_ORGANICO === false ? [] : ['organico']);
  const circuloValor = estilosCirculo.indexOf(state.breathStyle) !== -1 ? state.breathStyle : 'flor';

  const goal = (state.water && state.water.goal) || 8;
  /* Rango 4-12: el grid de vasos del tracker rinde bien hasta 12 columnas.
     Patch funcional (no closure): clics rápidos leen siempre el goal fresco. */
  const ponerGoal = (d) => set(s => ({ ...s, water: { ...s.water, goal: Math.max(4, Math.min(12, (s.water.goal || 8) + d)) } }));

  return (
    <div data-pace-tweaks-panel style={{
      position: 'fixed',
      right: 24, bottom: 24,
      width: 320,
      maxHeight: 'calc(100vh - 48px)',
      overflowY: 'auto',
      background: 'var(--paper)',
      border: '1px solid var(--line-2)',
      borderRadius: 'var(--r-md)',
      boxShadow: 'var(--sh-modal)',
      padding: 20,
      zIndex: 80,
      animation: 'pace-slide-up 280ms var(--ease)',
    }}>
      <div className="pace-aj-cab">
        <div className="pace-aj-titulo">{t('settings.title')}</div>
        <button type="button" className="pace-aj-cerrar" onClick={onClose} aria-label={t('common.close')}>×</button>
      </div>

      <AjustesSeccion titulo={t('settings.sec.ver')}>
        <AjustesFila id="lang" nombre={t('settings.lang')}>
          <AjustesPildoras aria={t('settings.lang')} valor={langValor} onChange={ponerLang} opciones={[
            { v: 'auto', name: t('settings.lang.auto') },
            { v: 'es', name: t('settings.lang.es') },
            { v: 'en', name: t('settings.lang.en') },
          ]} />
        </AjustesFila>
        <AjustesFila id="palette" nombre={t('settings.palette')}>
          <AjustesPildoras aria={t('settings.palette')} valor={palValor} onChange={ponerPaleta} opciones={[
            { v: 'auto', name: t('settings.palette.auto'), picto: <MuestraPaleta cual="auto" /> },
            { v: 'crema', name: t('settings.palette.crema'), picto: <MuestraPaleta cual="crema" /> },
            { v: 'oscuro', name: t('settings.palette.oscuro'), picto: <MuestraPaleta cual="oscuro" /> },
          ]} />
        </AjustesFila>
        {/* s139 · Fase 1.6 — el eje de estilo de timer se OCULTA entero (queda
            siempre «aro»). Cuelga de `app/flags.js`; el código de las variantes
            sigue vivo. NO borrar: leer la cabecera de flags.js. */}
        {window.SHOW_TIMER_STYLE !== false && (
          <AjustesFila id="timer" nombre={t('settings.timer')}>
            <AjustesPildoras aria={t('settings.timer')} valor={state.timerStyle} onChange={(v) => set({ timerStyle: v })} opciones={[
              { v: 'aro', name: t('settings.timer.aro') },
              { v: 'barra', name: t('settings.timer.barra') },
              { v: 'analogico', name: t('settings.timer.analogico') },
            ]} />
          </AjustesFila>
        )}
        {/* s188 · «Disposición» sale tras bandera: duplicaba el botón de plegar
            la barra. La migración de 'minimal' vive en loadState. */}
        {window.SHOW_LAYOUT_AXIS !== false && (
          <AjustesFila id="layout" nombre={t('settings.layout')}>
            <AjustesPildoras aria={t('settings.layout')} valor={state.layout} onChange={(v) => set({ layout: v })} opciones={[
              { v: 'sidebar', name: t('settings.layout.sidebar') },
              { v: 'minimal', name: t('settings.layout.minimal') },
            ]} />
          </AjustesFila>
        )}
      </AjustesSeccion>

      <AjustesSeccion titulo={t('settings.sec.oir')}>
        <TweaksAudioBlock state={state} set={set} />
      </AjustesSeccion>

      <AjustesSeccion titulo={t('settings.sec.sesiones')}>
        {/* Aviso de fin de Foco (s102 · PWA). Solo en web con Notification
            disponible; el permiso se pide al activar (enableNotify). */}
        {canNotify && (
          <AjustesFila id="notify" nombre={t('settings.notify')} sub={t('settings.notify.sub')} modulo="focus">
            <AjustesInterruptor on={!!state.notifyFocusEnd && Notification.permission !== 'denied'} aria={t('settings.notify')}
              onChange={(v) => { v ? enableNotify() : set({ notifyFocusEnd: false }); }} />
          </AjustesFila>
        )}
        {canNotify && Notification.permission === 'denied' && (
          <div className="pace-aj-nota">{t('settings.notify.blocked')}</div>
        )}
        <AjustesFila id="circle" nombre={t('settings.circle')} modulo="breathe"
                     sub={tn('settings.circle.sub', { name: t('settings.circle.' + circuloValor) })}>
          <AjustesPildoras aria={t('settings.circle')} valor={circuloValor} onChange={(v) => set({ breathStyle: v })}
            opciones={estilosCirculo.map(e => ({ v: e, aria: t('settings.circle.' + e), picto: <PictoCirculo estilo={e} /> }))} />
        </AjustesFila>
        {/* Descanso entre series (s114): SOLO afecta a los rests con
            restKind:'betweenSets' del runner v1; los cierres respiratorios no
            cambian. Default 30 = recomendado. */}
        <AjustesFila id="rest" nombre={t('settings.rest')} sub={t('settings.rest.sub')} modulo="move">
          <AjustesPildoras aria={t('settings.rest')} valor={state.restBetweenSets || 30} onChange={(v) => set({ restBetweenSets: v })} opciones={[
            { v: 20, name: t('settings.rest.20') },
            { v: 30, name: t('settings.rest.30') },
            { v: 45, name: t('settings.rest.45') },
          ]} />
        </AjustesFila>
        {/* Objetivo de hidratación (s89): el state (water.goal) siempre lo
            soportó; esto solo expone la UI. */}
        <AjustesFila id="water" nombre={t('settings.water')} sub={t('settings.water.sub')} modulo="hydrate">
          <AjustesPaso valor={goal} onMenos={() => ponerGoal(-1)} onMas={() => ponerGoal(1)}
                       ariaMenos={t('hydrate.less')} ariaMas={t('hydrate.more')} />
        </AjustesFila>
      </AjustesSeccion>

      <AjustesSeccion titulo={t('settings.sec.datos')} ultima>
        <TweaksDataSection onReset={borrarTodo} isWeb={isWeb} />
      </AjustesSeccion>
    </div>
  );
}

Object.assign(window, { TweaksPanel });
