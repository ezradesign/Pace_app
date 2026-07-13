/* PACE · Panel de Ajustes (antes Tweaks)
   ============================================================
   Ejes vigentes: idioma, audio, paleta, timer, breath, layout
   + objetivo de agua (s89). Export/Import y superficie premium
   extraídos a TweaksData.jsx / PremiumSection.jsx (split s89).
   Sesión 37 (v0.19.0): renombrado a "Ajustes", audio movido al
   primer eje con pills "Activado / Silenciado", eliminados
   circle/numero de timer y editorial de layout.

   Retirados por decisión "menos variantes, más identidad":
     - logoVariant + supportCopyVariant (sesión 19).
     - font / tipografía display (sesión 20). La identidad
       tipográfica de PACE es Cormorant Garamond (default) +
       EB Garamond fijo para cifras de identidad (número de
       racha, número del timer futuro). No tiene sentido dejar
       al usuario elegir entre 3 alternativas — decide PACE.

   Los campos del state (`font`, `logoVariant`, `supportCopyVariant`)
   se conservan por compatibilidad con localStorage existente pero
   no son editables desde la UI.

   Sesión 17 (v0.12.0) — sigue vigente:
     - Export/Import JSON (backup local portátil).
     - tweak-secrets reaccionando a combinaciones específicas:
         · secret.aged       → paleta 'envejecido'.
         · secret.dark.mode  → paleta 'oscuro' durante 7 días (acumulado).
         · explore.tweaks    → abrir este panel por primera vez.
     - Secretos dormidos (el eje que los disparaba fue retirado;
       quedan en código por si se reintroducen como easter egg):
         · secret.mono       → font 'mono'.
         · secret.seal       → logo 'sello'.
         · secret.illustrated→ logo 'ilustrado'.
       Patrón: hook ligero que llama unlockAchievement() cuando la
       condición se cumple. La idempotencia la garantiza
       unlockAchievement (no dispara dos veces el mismo id).
   ============================================================ */

const { useEffect: useEffectTW } = React;

function TweaksPanel({ open, onClose }) {
  const [state, set] = usePace();
  const { t, tn } = useT();

  /* s102 · PWA: el aviso de fin de Foco y los enlaces /safety /privacy solo
     tienen sentido servidos por web — en el standalone file:// no hay SW ni
     rutas. Un solo gate para ambos bloques. */
  const isWeb = location.protocol === 'http:' || location.protocol === 'https:';
  const canNotify = isWeb && typeof Notification !== 'undefined';

  /* Activar el aviso pide el permiso del navegador AQUÍ (gesto del usuario,
     nunca al arrancar ni al terminar un pomodoro). Si está bloqueado, el
     hint de abajo lo explica; el toggle no puede encenderse. */
  const enableNotify = () => {
    if (!canNotify) return;
    if (Notification.permission === 'granted') { set({ notifyFocusEnd: true }); return; }
    if (Notification.permission === 'denied') return;
    try {
      Notification.requestPermission().then((p) => {
        /* La rama denegada escribe el MISMO false: el objeto de state nuevo
           fuerza el re-render que hace visible el hint 'blocked' (permission
           no es reactivo por sí solo). */
        if (p === 'granted') set({ notifyFocusEnd: true });
        else set({ notifyFocusEnd: false });
      });
    } catch (e) {}
  };

  /* ============================================================
     SECRETS — detectores simples que viven mientras el panel existe.
     No dependen de que el panel esté abierto (el hook monta siempre
     dentro del componente, pero como TweaksPanel retorna null cuando
     !open, el hook efectivamente sólo observa cambios mientras el
     panel está visible). Para los secretos que NO dependen de la UI
     de tweaks (aged, mono, seal, ilustrado, dark-days), movemos la
     detección a un componente separado que SÍ monta siempre:
     <TweakSecretsWatcher />, en app/tweaks/TweakSecretsWatcher.jsx (sesión 41).
     ============================================================ */

  // explore.tweaks — abrir el panel una vez. Se dispara al abrir.
  useEffectTW(() => {
    if (open) unlockAchievement('explore.tweaks');
  }, [open]);

  if (!open) return null;

  /* Ejes de personalización.
     Sesión 37: circle/numero retirados de timer, editorial retirado
     de layout, audio promovido al primer eje como pills separadas. */
  /* Ejes orden: palette → timer → breath → layout (por frecuencia de uso).
     'envejecido' retirado en s71 / v0.28.9. */
  const ejes = [
    { key: 'palette', label: t('tweaks.eje.palette'), options: [
      { v: 'crema', name: t('tweaks.palette.crema') },
      { v: 'oscuro', name: t('tweaks.palette.oscuro') },
    ]},
    { key: 'timerStyle', label: t('tweaks.eje.timer'), options: [
      { v: 'aro', name: t('tweaks.timer.aro') },
      { v: 'barra', name: t('tweaks.timer.barra') },
      { v: 'analogico', name: t('tweaks.timer.analogico') },
    ]},
    { key: 'breathStyle', label: t('tweaks.eje.breath'), options: [
      { v: 'flor', name: t('tweaks.breath.flor') },
      { v: 'pulso', name: t('tweaks.breath.pulso') },
      { v: 'petalo', name: t('tweaks.breath.petalo') },
      { v: 'ondas', name: t('tweaks.breath.ondas') },
      { v: 'organico', name: t('tweaks.breath.organico') },
    ]},
    { key: 'layout', label: t('tweaks.eje.layout'), options: [
      { v: 'sidebar', name: t('tweaks.layout.sidebar') },
      { v: 'minimal', name: t('tweaks.layout.minimal') },
    ]},
    /* 'logoVariant' y 'supportCopyVariant' retirados de los Tweaks
       (sesión post-v0.12.1). Los campos del state se conservan por
       compatibilidad con instalaciones existentes. */
  ];

  /* Export/Import JSON: extraído a TweaksData.jsx (split s89 / v0.34.5).
     La superficie premium (s88) vive en PremiumSection.jsx. */

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Meta>{t('tweaks.meta')}</Meta>
          <div style={{ ...displayItalic, fontSize: 22, fontWeight: 500 }}>{t('settings.title')}</div>
        </div>
        <button onClick={onClose} style={{ fontSize: 18, color: 'var(--ink-3)', width: 26, height: 26, display: 'grid', placeItems: 'center' }}>×</button>
      </div>

      {/* Idioma — primer eje (s71: movido al top por frecuencia de uso) */}
      <div style={{ marginBottom: 16 }}>
        <Meta style={{ marginBottom: 6 }}>{t('tweaks.eje.lang')}</Meta>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {[
            { v: 'es', name: t('tweaks.lang.es') },
            { v: 'en', name: t('tweaks.lang.en') },
          ].map(opt => {
            const active = state.lang === opt.v;
            return (
              <button key={opt.v} onClick={() => set({ lang: opt.v })}
                style={{
                  padding: '6px 10px',
                  fontSize: 11,
                  fontWeight: active ? 500 : 400,
                  background: active ? 'var(--ink)' : 'var(--paper-2)',
                  color: active ? 'var(--paper)' : 'var(--ink-2)',
                  border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
                  borderRadius: 'var(--r-sm)',
                  transition: 'all 180ms',
                  letterSpacing: 0.2,
                }}>{opt.name}</button>
            );
          })}
        </div>
      </div>

      <Divider style={{ margin: '14px 0' }} />

      {/* Audio */}
      <div style={{ marginBottom: 16 }}>
        <Meta style={{ marginBottom: 4 }}>{t('settings.audio.label')}</Meta>
        <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginBottom: 6, letterSpacing: 0.1 }}>{t('settings.audio.hint')}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {[
            { v: true, name: t('settings.audio.on') },
            { v: false, name: t('settings.audio.off') },
          ].map(opt => {
            const active = state.soundOn === opt.v;
            return (
              <button key={String(opt.v)} onClick={() => set({ soundOn: opt.v })}
                style={{
                  padding: '6px 10px',
                  fontSize: 11,
                  fontWeight: active ? 500 : 400,
                  background: active ? 'var(--ink)' : 'var(--paper-2)',
                  color: active ? 'var(--paper)' : 'var(--ink-2)',
                  border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
                  borderRadius: 'var(--r-sm)',
                  transition: 'all 180ms',
                  letterSpacing: 0.2,
                }}>{opt.name}</button>
            );
          })}
        </div>
        {state.soundOn && (
          <div style={{ marginTop: 8, marginLeft: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => {
                const next = !state.ambientOn;
                set({ ambientOn: next });
                if (!next && window.ambientDrone) window.ambientDrone.stop(400);
              }}
              style={{
                width: 14, height: 14, borderRadius: 3, padding: 0,
                border: `1px solid ${state.ambientOn ? 'var(--focus)' : 'var(--line-2)'}`,
                background: state.ambientOn ? 'var(--focus)' : 'transparent',
                display: 'grid', placeItems: 'center',
                color: 'var(--paper)', cursor: 'pointer', flexShrink: 0,
              }}
              aria-label={t('settings.audio.ambient')}
            >
              {state.ambientOn && (
                <svg width="9" height="9" viewBox="0 0 16 16" fill="none"
                     stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8L7 12L13 4"/>
                </svg>
              )}
            </button>
            <span
              style={{ fontSize: 11, color: 'var(--ink-2)', letterSpacing: 0.2, cursor: 'pointer' }}
              onClick={() => {
                const next = !state.ambientOn;
                set({ ambientOn: next });
                if (!next && window.ambientDrone) window.ambientDrone.stop(400);
              }}
            >+ {t('settings.audio.ambient')}</span>
          </div>
        )}
      </div>

      {/* Aviso de fin de Foco (s102 · PWA). Solo en web con Notification
          disponible; el permiso se pide al activar (enableNotify). */}
      {canNotify && (
        <div style={{ marginBottom: 16 }}>
          <Meta style={{ marginBottom: 4 }}>{t('tweaks.notify.label')}</Meta>
          <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginBottom: 6, letterSpacing: 0.1 }}>{t('tweaks.notify.hint')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {[
              { v: true, name: t('tweaks.notify.on') },
              { v: false, name: t('tweaks.notify.off') },
            ].map(opt => {
              const active = !!state.notifyFocusEnd === opt.v;
              return (
                <button key={String(opt.v)}
                  onClick={() => { opt.v ? enableNotify() : set({ notifyFocusEnd: false }); }}
                  style={{
                    padding: '6px 10px',
                    fontSize: 11,
                    fontWeight: active ? 500 : 400,
                    background: active ? 'var(--ink)' : 'var(--paper-2)',
                    color: active ? 'var(--paper)' : 'var(--ink-2)',
                    border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
                    borderRadius: 'var(--r-sm)',
                    transition: 'all 180ms',
                    letterSpacing: 0.2,
                  }}>{opt.name}</button>
              );
            })}
          </div>
          {Notification.permission === 'denied' && (
            <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 6, letterSpacing: 0.1 }}>{t('tweaks.notify.blocked')}</div>
          )}
        </div>
      )}

      <Divider style={{ margin: '14px 0' }} />

      {ejes.map(eje => (
        <div key={eje.key} style={{ marginBottom: 16 }}>
          <Meta style={{ marginBottom: 6 }}>{eje.label}</Meta>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {eje.options.map(opt => {
              const active = state[eje.key] === opt.v;
              return (
                <button key={opt.v} onClick={() => set({ [eje.key]: opt.v })}
                  style={{
                    padding: '6px 10px',
                    fontSize: 11,
                    fontWeight: active ? 500 : 400,
                    background: active ? 'var(--ink)' : 'var(--paper-2)',
                    color: active ? 'var(--paper)' : 'var(--ink-2)',
                    border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
                    borderRadius: 'var(--r-sm)',
                    transition: 'all 180ms',
                    letterSpacing: 0.2,
                  }}>{opt.name}</button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Objetivo de hidratación (s89 · P0 auditoría). El state (water.goal)
          siempre lo soportó; esto solo expone la UI. Rango 4-12: el grid de
          vasos del tracker rinde bien hasta 12 columnas. */}
      <div style={{ marginBottom: 16 }}>
        <Meta style={{ marginBottom: 6 }}>{t('tweaks.eje.water')}</Meta>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Patch funcional (no closure): clics rápidos en el mismo render
              leen siempre el goal fresco del store. */}
          <button
            onClick={() => set(s => ({ ...s, water: { ...s.water, goal: Math.max(4, (s.water.goal || 8) - 1) } }))}
            style={tweaksStyles.stepBtn}
            aria-label={t('hydrate.less')}
          >−</button>
          <span style={{ fontSize: 12, minWidth: 84, textAlign: 'center', color: 'var(--ink-2)', letterSpacing: 0.2 }}>
            {tn('tweaks.water.value', { n: state.water.goal || 8 })}
          </span>
          <button
            onClick={() => set(s => ({ ...s, water: { ...s.water, goal: Math.min(12, (s.water.goal || 8) + 1) } }))}
            style={tweaksStyles.stepBtn}
            aria-label={t('hydrate.more')}
          >+</button>
        </div>
      </div>

      <Divider style={{ margin: '14px 0' }} />

      {/* Datos — Export / Import JSON (sesión 17 / v0.12.0; extraído a
          TweaksData.jsx en el split de sesión 89) */}
      <TweaksDataSection />

      <Divider style={{ margin: '14px 0' }} />

      {/* Premium — superficie display-only (s88 F3b; extraída a
          PremiumSection.jsx en el split de sesión 89) */}
      <PremiumSection />

      <Divider style={{ margin: '14px 0' }} />

      {/* Reset */}
      <button
        onClick={() => { if (confirm(t('tweaks.confirm.reset'))) { localStorage.removeItem('pace.state.v2'); location.reload(); } }}
        style={{
          width: '100%',
          padding: '8px',
          fontSize: 11,
          color: 'var(--ink-3)',
          border: '1px dashed var(--line)',
          borderRadius: 'var(--r-sm)',
          letterSpacing: 0.2,
        }}
      >{t('tweaks.reset')}</button>

      {/* Enlaces /safety y /privacy (s102; páginas estáticas de s101).
          Solo en web: en file:// esas rutas no resuelven. Nueva pestaña
          para no matar un timer corriendo. */}
      {isWeb && (
        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 10.5, letterSpacing: 0.2 }}>
          <a href="/safety" target="_blank" rel="noopener" style={tweaksStyles.legalLink}>{t('tweaks.legal.safety')}</a>
          <span style={{ color: 'var(--ink-3)', margin: '0 8px' }}>·</span>
          <a href="/privacy" target="_blank" rel="noopener" style={tweaksStyles.legalLink}>{t('tweaks.legal.privacy')}</a>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Estilos (nombres únicos). Los iconos Download/Upload y el
   estilo dataBtn viven ahora en TweaksData.jsx (split s89).
   ============================================================ */
const tweaksStyles = {
  legalLink: {
    color: 'var(--ink-3)',
    textDecoration: 'none',
    borderBottom: '1px solid var(--line)',
    paddingBottom: 1,
  },
  stepBtn: {
    width: 26, height: 26,
    display: 'grid', placeItems: 'center',
    fontSize: 14,
    color: 'var(--ink-2)',
    background: 'var(--paper-2)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-sm)',
    cursor: 'pointer',
  },
};

/* ============================================================
   CSS responsive del TweaksPanel (sesión 27 · v0.12.10).

   El TweaksPanel es el único "modal" que no usa <Modal> — es un
   panel flotante 320×auto anclado bottom-right. En móvil eso
   rompe: 320 de 375 tapa casi toda la pantalla con los bordes
   pegados a la derecha, queda un rail de 31px inútil a la izq,
   y la animación `slide-up` empuja contra el borde sin margen.

   Patrón resuelto: bottom sheet. Pegado a bottom:0 left:0 right:0,
   esquinas superiores redondeadas, sin border laterales (el border
   superior actúa como handle visual), maxHeight 72vh para que el
   backdrop oscuro de fondo (que no hay — TweaksPanel no tiene
   overlay) deje ver que la home sigue viva detrás.

   Nota: TweaksPanel no tiene backdrop, pero eso también es
   coherente con que se use como "afinador" mientras la app sigue
   funcionando. Se conserva la filosofía.
   ============================================================ */
const _paceTweaksResponsive = document.getElementById('pace-tweaks-responsive-css');
if (!_paceTweaksResponsive) {
  const s = document.createElement('style');
  s.id = 'pace-tweaks-responsive-css';
  s.textContent = `
    @media (max-width: 640px) {
      [data-pace-tweaks-panel] {
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: auto !important;
        max-height: 72vh !important;
        max-height: 72dvh !important;
        border-radius: var(--r-lg) var(--r-lg) 0 0 !important;
        border-left: 0 !important;
        border-right: 0 !important;
        border-bottom: 0 !important;
        padding: 16px 18px 24px !important;
        box-shadow: 0 -8px 32px rgba(31, 28, 23, 0.18) !important;
      }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { TweaksPanel });