/* PACE · Tweaks — sección "Tus datos" (Export / Import JSON)
   Extraída de TweaksPanel.jsx en sesión 89 (v0.34.5) para devolver el panel
   a <500 líneas. Lógica de sesión 17 (v0.12.0) intacta.

   EXPORT — descarga un JSON con el estado completo de PACE.
   Refuerza la promesa "todo local" del modal BMC: ahora es local
   Y portátil. El archivo incluye:
     - version: para migración futura si el schema cambia.
     - exportedAt: timestamp legible.
     - state: copia literal de localStorage['pace.state.v2'].

   IMPORT — lee un JSON y lo mergea/reemplaza en localStorage.
   Valida estructura mínima (app === 'PACE' + state como objeto)
   y pregunta confirmación explícita antes de sobrescribir.
   Tras confirmar, recarga la página para que useSyncExternalStore
   re-lea el nuevo estado desde cero (evita estados inconsistentes).
*/

const { useState: useStateTD, useRef: useRefTD } = React;

function TweaksDataSection() {
  const { t, tn } = useT();
  const fileInputRef = useRefTD(null);
  const [msg, setMsg] = useStateTD(null); // {kind, text} para feedback Export/Import

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
      const yyyymmdd = toISODate(new Date()).replace(/-/g, ''); // local, no UTC (s105)
      a.href = url;
      a.download = `pace-backup-${yyyymmdd}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMsg({ kind: 'ok', text: t('tweaks.msg.exported') });
      setTimeout(() => setMsg(null), 2200);
      /* secret.backup (B1, sustituto de apnea): exportar tus datos. */
      unlockAchievement('secret.backup');
    } catch (e) {
      setMsg({ kind: 'err', text: t('tweaks.msg.export.err') });
      setTimeout(() => setMsg(null), 2600);
    }
  };

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
    <div>
      <Meta style={{ marginBottom: 8 }}>{t('tweaks.data.meta')}</Meta>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button
          onClick={exportJSON}
          style={tweaksDataStyles.dataBtn}
          title={t('tweaks.data.export.title')}
        >
          <DownloadIcon /> <span>{t('tweaks.data.export')}</span>
        </button>
        <button
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={tweaksDataStyles.dataBtn}
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

const tweaksDataStyles = {
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

Object.assign(window, { TweaksDataSection });
