/* PACE · Panel de Ajustes (antes Tweaks)
   ============================================================
   5 ejes vigentes: audio, paleta, layout, timer, breath.
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

const { useState: useStateTW, useEffect: useEffectTW, useRef: useRefTW } = React;

function TweaksPanel({ open, onClose }) {
  const [state, set] = usePace();
  const { t, tn } = useT();
  const fileInputRef = useRefTW(null);
  const [msg, setMsg] = useStateTW(null); // {kind, text} para feedback Export/Import

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
  const ejes = [
    { key: 'palette', label: t('tweaks.eje.palette'), options: [
      { v: 'crema', name: t('tweaks.palette.crema') },
      { v: 'oscuro', name: t('tweaks.palette.oscuro') },
      { v: 'envejecido', name: t('tweaks.palette.envejecido') },
    ]},
    { key: 'layout', label: t('tweaks.eje.layout'), options: [
      { v: 'sidebar', name: t('tweaks.layout.sidebar') },
      { v: 'minimal', name: t('tweaks.layout.minimal') },
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
    /* 'logoVariant' y 'supportCopyVariant' retirados de los Tweaks
       (sesión post-v0.12.1). Los campos del state se conservan por
       compatibilidad con instalaciones existentes. */
  ];

  /* ============================================================
     EXPORT — descarga un JSON con el estado completo de PACE.
     Refuerza la promesa "todo local" del modal BMC: ahora es local
     Y portátil. El archivo incluye:
       - version: para migración futura si el schema cambia.
       - exportedAt: timestamp legible.
       - state: copia literal de localStorage['pace.state.v2'].
     ============================================================ */
  const exportJSON = () => {
    try {
      const raw = localStorage.getItem('pace.state.v2') || '{}';
      const parsed = JSON.parse(raw);
      const payload = {
        app: 'PACE',
        version: PACE_VERSION,
        exportedAt: new Date().toISOString(),
        state: parsed,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      a.href = url;
      a.download = `pace-backup-${yyyymmdd}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMsg({ kind: 'ok', text: t('tweaks.msg.exported') });
      setTimeout(() => setMsg(null), 2200);
    } catch (e) {
      setMsg({ kind: 'err', text: t('tweaks.msg.export.err') });
      setTimeout(() => setMsg(null), 2600);
    }
  };

  /* ============================================================
     IMPORT — lee un JSON y lo mergea/reemplaza en localStorage.
     Valida estructura mínima (app === 'PACE' + state como objeto)
     y pregunta confirmación explícita antes de sobrescribir.
     Tras confirmar, recarga la página para que useSyncExternalStore
     re-lea el nuevo estado desde cero (evita estados inconsistentes).
     ============================================================ */
  const importJSON = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = String(ev.target.result || '');
        const payload = JSON.parse(raw);

        // Validación mínima: tiene que parecerse a un backup de PACE.
        const looksValid = payload && (
          (payload.app === 'PACE' && payload.state && typeof payload.state === 'object')
          || (payload.achievements !== undefined || payload.weeklyStats !== undefined)
        );
        if (!looksValid) {
          setMsg({ kind: 'err', text: t('tweaks.msg.import.invalid') });
          setTimeout(() => setMsg(null), 2600);
          return;
        }

        // Soporta dos formatos: {app, state:{...}} o state plano (fallback).
        const incoming = (payload.state && typeof payload.state === 'object') ? payload.state : payload;

        // Contador rápido para el aviso de confirmación.
        const nLogros = incoming.achievements ? Object.keys(incoming.achievements).length : 0;
        const nFoco = incoming.totalFocusMin || 0;
        const ok = confirm(tn('tweaks.confirm.import', { logros: nLogros, foco: nFoco }));
        if (!ok) return;

        // Escribimos y recargamos para estado limpio.
        localStorage.setItem('pace.state.v2', JSON.stringify(incoming));
        setMsg({ kind: 'ok', text: t('tweaks.msg.imported') });
        setTimeout(() => location.reload(), 900);
      } catch (e) {
        setMsg({ kind: 'err', text: t('tweaks.msg.import.json.err') });
        setTimeout(() => setMsg(null), 2600);
      }
    };
    reader.readAsText(file);
  };

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

      {/* Audio — primer eje (sesión 37: reubicado desde sección "Sound" inferior) */}
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
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
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

      <Divider style={{ margin: '14px 0' }} />

      {/* Idioma */}
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

      {/* ============================================================
          Datos — Export / Import JSON (sesión 17 / v0.12.0)
          ============================================================ */}
      <Meta style={{ marginBottom: 8 }}>{t('tweaks.data.meta')}</Meta>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button
          onClick={exportJSON}
          style={tweaksStyles.dataBtn}
          title={t('tweaks.data.export.title')}
        >
          <DownloadIcon /> <span>{t('tweaks.data.export')}</span>
        </button>
        <button
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={tweaksStyles.dataBtn}
          title={t('tweaks.data.import.title')}
        >
          <UploadIcon /> <span>{t('tweaks.data.import')}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files && e.target.files[0];
            importJSON(f);
            e.target.value = ''; // permitir re-importar el mismo archivo
          }}
        />
      </div>
      {msg && (
        <div style={{
          fontSize: 10.5,
          color: msg.kind === 'err' ? 'var(--breathe)' : 'var(--focus)',
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          marginBottom: 8,
          letterSpacing: 0.1,
          textAlign: 'center',
        }}>{msg.text}</div>
      )}
      <div style={{
        fontSize: 10,
        color: 'var(--ink-3)',
        lineHeight: 1.4,
        letterSpacing: 0.1,
        marginBottom: 4,
      }}>
        {t('tweaks.data.note')}
      </div>

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
    </div>
  );
}

/* ============================================================
   Iconos + estilos (nombres únicos)
   ============================================================ */
function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
         stroke="currentColor" strokeWidth="1.3"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2.5v8" />
      <path d="M4.5 7L8 10.5 11.5 7" />
      <path d="M3 13h10" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
         stroke="currentColor" strokeWidth="1.3"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 10.5v-8" />
      <path d="M4.5 6L8 2.5 11.5 6" />
      <path d="M3 13h10" />
    </svg>
  );
}

const tweaksStyles = {
  dataBtn: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '8px 10px',
    fontSize: 11,
    color: 'var(--ink-2)',
    background: 'var(--paper-2)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-sm)',
    letterSpacing: 0.2,
    cursor: 'pointer',
    transition: 'all 180ms',
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
