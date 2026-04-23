/* PACE · Panel de Tweaks
   ============================================================
   4 ejes vigentes: paleta, layout, timer, breath.

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

/* Clave donde se persiste el racking de "días en paleta oscura" para el
   secret.dark.mode. Independiente de la racha principal — sólo cuenta
   días de calendario distintos con palette === 'oscuro'. */
const DARK_DAYS_KEY = 'pace.darkDays.v1';

function TweaksPanel({ open, onClose }) {
  const [state, set] = usePace();
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
     <TweakSecretsWatcher />, exportado al final.
     ============================================================ */

  // explore.tweaks — abrir el panel una vez. Se dispara al abrir.
  useEffectTW(() => {
    if (open) unlockAchievement('explore.tweaks');
  }, [open]);

  if (!open) return null;

  const ejes = [
    { key: 'palette', label: 'Paleta', options: [
      { v: 'crema', name: 'Crema día' },
      { v: 'oscuro', name: 'Oscuro noche' },
      { v: 'envejecido', name: 'Papel envejecido' },
    ]},
    { key: 'layout', label: 'Layout', options: [
      { v: 'sidebar', name: 'Sidebar (default)' },
      { v: 'minimal', name: 'Minimal' },
      { v: 'editorial', name: 'Editorial' },
    ]},
    { key: 'timerStyle', label: 'Estilo del timer', options: [
      { v: 'aro', name: 'Aro (default)' },
      { v: 'circulo', name: 'Círculo' },
      { v: 'barra', name: 'Barra' },
      { v: 'numero', name: 'Número gigante' },
      { v: 'analogico', name: 'Analógico' },
    ]},
    { key: 'breathStyle', label: 'Círculo de respiración', options: [
      { v: 'flor', name: 'Flor (default)' },
      { v: 'pulso', name: 'Pulso' },
      { v: 'petalo', name: 'Pétalo' },
      { v: 'ondas', name: 'Ondas' },
      { v: 'organico', name: 'Orgánico' },
    ]},
    /* 'logoVariant' y 'supportCopyVariant' retirados de los Tweaks
       (sesión post-v0.12.1). El logo queda fijo en 'pace' (oficial)
       y el copy del botón de apoyo consolidado en una sola variante
       ("Da de pastar a la vaca" + icono de vaca). Los campos del
       state se conservan por compatibilidad con instalaciones
       existentes, pero ya no son configurables desde la UI. */
  ];

  /* ============================================================
     EXPORT — descarga un JSON con el estado completo de PACE.
     Refuerza la promesa "todo local" del modal BMC: ahora es local
     Y portátil. El archivo incluye:
       - version: para migración futura si el schema cambia.
       - exportedAt: timestamp legible.
       - state: copia literal de localStorage['pace.state.v1'].
     ============================================================ */
  const exportJSON = () => {
    try {
      const raw = localStorage.getItem('pace.state.v1') || '{}';
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
      setMsg({ kind: 'ok', text: 'Backup descargado.' });
      setTimeout(() => setMsg(null), 2200);
    } catch (e) {
      setMsg({ kind: 'err', text: 'No se pudo exportar.' });
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
          setMsg({ kind: 'err', text: 'Archivo no reconocido.' });
          setTimeout(() => setMsg(null), 2600);
          return;
        }

        // Soporta dos formatos: {app, state:{...}} o state plano (fallback).
        const incoming = (payload.state && typeof payload.state === 'object') ? payload.state : payload;

        // Contador rápido para el aviso de confirmación.
        const nLogros = incoming.achievements ? Object.keys(incoming.achievements).length : 0;
        const nFoco = incoming.totalFocusMin || 0;
        const ok = confirm(
          `¿Sobreescribir tus datos con los del archivo?\n\n` +
          `Archivo contiene: ${nLogros} logros, ${nFoco} min de foco.\n` +
          `Esta acción no se puede deshacer.`
        );
        if (!ok) return;

        // Escribimos y recargamos para estado limpio.
        localStorage.setItem('pace.state.v1', JSON.stringify(incoming));
        setMsg({ kind: 'ok', text: 'Importado — recargando…' });
        setTimeout(() => location.reload(), 900);
      } catch (e) {
        setMsg({ kind: 'err', text: 'JSON inválido.' });
        setTimeout(() => setMsg(null), 2600);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{
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
          <Meta>Panel</Meta>
          <div style={{ ...displayItalic, fontSize: 22, fontWeight: 500 }}>Tweaks</div>
        </div>
        <button onClick={onClose} style={{ fontSize: 18, color: 'var(--ink-3)', width: 26, height: 26, display: 'grid', placeItems: 'center' }}>×</button>
      </div>

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

      {/* Sound */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Meta>Sonidos</Meta>
        <button onClick={() => set({ soundOn: !state.soundOn })}
          style={{
            padding: '4px 10px',
            background: state.soundOn ? 'var(--focus)' : 'var(--paper-2)',
            color: state.soundOn ? 'var(--paper)' : 'var(--ink-2)',
            border: `1px solid ${state.soundOn ? 'var(--focus)' : 'var(--line)'}`,
            borderRadius: 'var(--r-pill)',
            fontSize: 11, letterSpacing: 0.2,
          }}>{state.soundOn ? 'Activo' : 'Silencio'}</button>
      </div>

      <Divider style={{ margin: '14px 0' }} />

      {/* ============================================================
          Datos — Export / Import JSON (sesión 17 / v0.12.0)
          ============================================================ */}
      <Meta style={{ marginBottom: 8 }}>Tus datos</Meta>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button
          onClick={exportJSON}
          style={tweaksStyles.dataBtn}
          title="Descarga un JSON con tu estado actual"
        >
          <DownloadIcon /> <span>Exportar</span>
        </button>
        <button
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={tweaksStyles.dataBtn}
          title="Sobreescribe tus datos con un backup"
        >
          <UploadIcon /> <span>Importar</span>
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
        Todo vive en tu navegador. El backup es un archivo JSON
        local — sin servidor, sin cuenta.
      </div>

      <Divider style={{ margin: '14px 0' }} />

      {/* Reset */}
      <button
        onClick={() => { if (confirm('¿Resetear todos los datos de PACE?')) { localStorage.removeItem('pace.state.v1'); location.reload(); } }}
        style={{
          width: '100%',
          padding: '8px',
          fontSize: 11,
          color: 'var(--ink-3)',
          border: '1px dashed var(--line)',
          borderRadius: 'var(--r-sm)',
          letterSpacing: 0.2,
        }}
      >Resetear todo</button>
    </div>
  );
}

/* ============================================================
   TweakSecretsWatcher — monta siempre, observa combinaciones
   ------------------------------------------------------------
   Vive en el árbol aunque el panel de Tweaks esté cerrado, así
   los secretos se disparan cuando el usuario cambia el tweak
   correspondiente (desde Tweaks o por import JSON).

   unlockAchievement es idempotente (no dispara el mismo id dos
   veces), así que los efectos no necesitan guardas adicionales.
   ============================================================ */
function TweakSecretsWatcher() {
  const [state] = usePace();

  // Instantáneos: cambio de palette/font/logo → desbloqueo inmediato.
  useEffectTW(() => {
    if (state.palette === 'envejecido') unlockAchievement('secret.aged');
  }, [state.palette]);

  /* secret.mono — el Tweak de tipografía se retiró en sesión 20.
     El watcher sigue escuchando por si el valor llega vía import
     JSON (backup de un usuario pre-v0.12.4) o dev tools. Es
     idempotente gracias a unlockAchievement. */
  useEffectTW(() => {
    if (state.font === 'mono') unlockAchievement('secret.mono');
  }, [state.font]);

  /* Logros ligados a logoVariant. Tras retirar el Tweak del panel
     (sesión 19) ya no hay forma estándar de dispararlos desde la
     UI, pero se conservan por si se vuelven a exponer o se activan
     vía devtools / futuros easter eggs. */
  useEffectTW(() => {
    if (state.logoVariant === 'sello') unlockAchievement('secret.seal');
    if (state.logoVariant === 'ilustrado') unlockAchievement('secret.illustrated');
  }, [state.logoVariant]);

  /* secret.dark.mode — "7 días en oscuro" (días de calendario distintos
     con palette === 'oscuro', no necesariamente consecutivos; la
     definición original del logro dice "7 días en oscuro" sin exigir
     racha seguida, y es la lectura más amable).

     Implementación: set de cadenas `YYYY-MM-DD` persistido en una
     clave propia (`pace.darkDays.v1`) para no engordar el state
     principal — es un contador auxiliar de un único logro, no un
     dato de producto. Se suma el día actual cada vez que cambia el
     state mientras palette === 'oscuro' (la primera por día).
  */
  useEffectTW(() => {
    if (state.palette !== 'oscuro') return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const raw = localStorage.getItem(DARK_DAYS_KEY);
      let set;
      try { set = new Set(JSON.parse(raw || '[]')); } catch (e) { set = new Set(); }
      if (!set.has(today)) {
        set.add(today);
        // Cap defensivo: guardamos máximo 30 fechas (suficiente para el logro).
        const arr = Array.from(set).slice(-30);
        localStorage.setItem(DARK_DAYS_KEY, JSON.stringify(arr));
        if (arr.length >= 7) unlockAchievement('secret.dark.mode');
      } else if (set.size >= 7) {
        // Ya acumulado en sesiones anteriores, desbloqueamos ahora.
        unlockAchievement('secret.dark.mode');
      }
    } catch (e) { /* silencioso — no es crítico */ }
  }, [state.palette]);

  return null;
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

Object.assign(window, { TweaksPanel, TweakSecretsWatcher });
