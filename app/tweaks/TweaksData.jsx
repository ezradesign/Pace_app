/* PACE · Ajustes — sección "Tus datos" (Export / Import JSON)
   Extraída de TweaksPanel.jsx en sesión 89 (v0.34.5) para devolver el panel
   a <500 líneas. Lógica de sesión 17 (v0.12.0) intacta.

   s188: LA SECCION ENTERA VIVE AQUI. Exportar, importar, borrar todo, la fila
   de la licencia (PremiumSection) y el pie con la promesa de privacidad y los
   enlaces legales, como FILAS (`AjustesAccion`, de TweaksPanel.parts.jsx) en
   vez de dos botones al 50 % y una nota. El BORRADO se ejecuta en
   TweaksPanel.jsx (`onReset`), no aqui: `scripts/verify.eventos.js` comprueba
   que el reset del panel pase por `paceEventsWipeAll` leyendo ESE archivo, y
   moverlo habria dejado el checker ciego sin que nadie lo notara.

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

/* s198 · v0.132.0 — LA COPIA, FUERA DEL PANEL. La pide tambien la pantalla
   global de error (ui/RedDeError.jsx), que existe justo cuando el arbol de React
   se ha caido: por eso lee de `localStorage` y no del store, y si el estado no
   se puede leer viaja CRUDO (`stateRaw`) en vez de no viajar. Devuelve si se
   pudo; los mensajes los pone quien la llama.
   En Android el WebView no descarga: la copia sale por el menu de compartir
   (ui/android.js), desde el que se guarda en Drive o en Archivos. */
function paceBajarJSON(payload, nombre) {
  const texto = JSON.stringify(payload, null, 2);
  if (typeof paceAndroidGuardarArchivo === 'function' && paceAndroidGuardarArchivo(nombre, texto)) return;
  const blob = new Blob([texto], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function paceEnlaceLegal(ruta) {
  return typeof paceEnlaceWeb === 'function' ? paceEnlaceWeb(ruta) : ruta;
}

function paceDiaArchivo() {
  return toISODate(new Date()).replace(/-/g, ''); // local, no UTC (s105)
}

function paceDescargarCopia() {
  try {
    const raw = localStorage.getItem('pace.state.v2') || '{}';
    let parsed = null;
    try { parsed = JSON.parse(raw); } catch (e) {}
    /* s169 — LA SECCION DE EVENTOS ENTRA EN EL BACKUP. `privacy.html`
       promete exportar «todo tu estado» e importarlo en otro dispositivo, y
       desde que hay emisores eso incluye `pace.events.v1`, que vive en OTRA
       clave. Va como seccion hermana de `state` y no dentro, porque son dos
       almacenes con ciclos de vida independientes (s155) y mezclarlos en el
       JSON invitaria a escribirlos como si fueran uno.
       Si el subsistema no puede leer, `paceEventsExport()` devuelve un
       contenedor vacio normalizado: el backup sale igual, con la seccion
       puesta y sin eventos. El export NUNCA falla por esto. */
    const payload = {
      app: 'PACE',
      version: PACE_VERSION,
      exportedAt: new Date().toISOString(),
      state: parsed,
      events: paceEventsExport(),
    };
    if (parsed === null) payload.stateRaw = raw;
    /* s198 · si un arranque no pudo leer el estado, su cadena CRUDA vive en
       `pace.state.v2.rescate` (state-core.sanea.js). Viaja en el backup para
       que se pueda recuperar; el import la ignora. */
    const rescate = typeof paceLeerRescate === 'function' ? paceLeerRescate() : null;
    if (rescate) payload.rescate = rescate;
    paceBajarJSON(payload, 'pace-backup-' + paceDiaArchivo() + '.json');
    return true;
  } catch (e) { return false; }
}

/* s198 · B2 (decision del usuario): la copia de rescate se descarga SOLA, desde su
   fila en «Tus datos», que solo existe si hay rescate. */
function paceDescargarRescate() {
  try {
    const r = typeof paceLeerRescate === 'function' ? paceLeerRescate() : null;
    if (!r) return false;
    paceBajarJSON({ app: 'PACE', kind: 'rescate', version: PACE_VERSION, exportedAt: new Date().toISOString(), rescate: r },
      'pace-rescate-' + paceDiaArchivo() + '.json');
    return true;
  } catch (e) { return false; }
}

function TweaksDataSection({ onReset, isWeb }) {
  const { t, tn, lang } = useT();
  const fileInputRef = useRefTD(null);
  const [msg, setMsg] = useStateTD(null); // {kind, text} para feedback Export/Import

  const exportJSON = () => {
    if (paceDescargarCopia()) {
      const enAndroid = typeof paceEsAndroid === 'function' && paceEsAndroid();
      setMsg({ kind: 'ok', text: t(enAndroid ? 'settings.msg.exported.android' : 'settings.msg.exported') });
      setTimeout(() => setMsg(null), 2200);
      /* secret.backup (B1, sustituto de apnea): exportar tus datos. */
      unlockAchievement('secret.backup');
    } else {
      setMsg({ kind: 'err', text: t('settings.msg.export.err') });
      setTimeout(() => setMsg(null), 2600);
    }
  };

  /* La fila del rescate (B2): la fecha, corta y en el idioma de la app. */
  const rescate = typeof paceLeerRescate === 'function' ? paceLeerRescate() : null;
  const rescateFecha = rescate
    ? paceFechaCorta(rescate.savedAt, lang, { day: 'numeric', month: 'short' })
    : null;

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
          setMsg({ kind: 'err', text: t('settings.msg.import.invalid') });
          setTimeout(() => setMsg(null), 2600);
          return;
        }

        // Soporta dos formatos: {app, state:{...}} o state plano (fallback).
        const bruto = (payload.state && typeof payload.state === 'object') ? payload.state : payload;
        /* s198 · A-7, EL IMPORT SANEADO. Lo que entra pasa por el MISMO saneador que
           el arranque (state-core.sanea.js): antes se escribia tal cual, y un
           `weeklyStats: null` dentro de un backup bastaba para que el siguiente
           arranque cayera al estado de fabrica y borrara la historia. Un backup
           que no es un objeto se rechaza aqui, no al recargar. */
        if (!paceEsObjetoPlano(bruto)) {
          setMsg({ kind: 'err', text: t('settings.msg.import.invalid') });
          setTimeout(() => setMsg(null), 2600);
          return;
        }
        const incoming = paceSanearEstado(bruto, defaultState).estado;

        // Contador rápido para el aviso de confirmación.
        const nLogros = incoming.achievements ? Object.keys(incoming.achievements).length : 0;
        const nFoco = incoming.totalFocusMin || 0;
        const ok = confirm(tn('settings.confirm.import', { logros: nLogros, foco: nFoco }));
        if (!ok) return;

        /* Escribimos y recargamos para estado limpio.
           s155 — el estado legacy y `pace.events.v1` son DOS almacenes y entre
           ellos NO hay atomicidad, asi que la escritura pasa por la barrera:
           marcador -> estado legacy (la verdad canonica va primero) ->
           contenedor de eventos REINICIADO con `activatedAt` nuevo y el
           baseline recapturado del estado que acaba de entrar.
           Que pasa con el contenedor depende de SI EL BACKUP TRAE EVENTOS, y
           s169 cambio esto: antes ningun backup los traia y el contenedor se
           reiniciaba siempre.
             · CON seccion  -> se REEMPLAZA por completo con la del backup
               (§17: sin merge, sin deduplicar, idempotente).
             · SIN seccion  -> se REINICIA con `activatedAt` nuevo y el
               baseline recapturado del estado que entra. Dejar el contenedor
               de antes junto a un estado importado seria exactamente la MEZCLA
               de historial anterior con estado nuevo que hay que evitar — el
               baseline se habria capturado de unos contadores que ya no son
               los de este estado.
           Y si la seccion viene CORRUPTA, la barrera aborta el import ENTERO
           sin escribir el estado legacy: un backup a medias no es un backup.
           La recarga de 900 ms no es la garantia: si el proceso muriera antes
           de que la barrera termine, el MARCADOR sobrevive y la siguiente
           inicializacion completa el reinicio (§22), que es idempotente. */
        /* La seccion de eventos, si el backup la trae. Los backups anteriores
           a s169 no la llevan y `undefined` mantiene el camino de siempre:
           reiniciar el contenedor. NO se valida aqui -- lo hace la barrera,
           que es quien puede garantizar el «antes de tocar nada» de §17. */
        const eventsSection = payload.events;

        const writeLegacy = () => localStorage.setItem('pace.state.v2', JSON.stringify(incoming));
        /* SE ESPERA A LA BARRERA, y el exito se anuncia solo si de verdad lo
           hubo. Antes se lanzaba sin esperar: si `setItem` fallaba por cuota o
           por almacenamiento bloqueado, el estado nuevo no se guardaba, el
           contenedor de eventos se reiniciaba igual, la UI decia «importado» y
           la pagina recargaba. Cuatro mentiras seguidas sobre una promesa de
           integridad. */
        paceEventsStoreBarrier('import', writeLegacy, incoming, eventsSection).then((r) => {
          if (!r || !r.legacyWritten) {
            setMsg({ kind: 'err', text: t('settings.msg.import.storage.err') });
            setTimeout(() => setMsg(null), 2600);
            return;
          }
          setMsg({ kind: 'ok', text: t('settings.msg.imported') });
          setTimeout(() => location.reload(), 900);
        });
      } catch (e) {
        setMsg({ kind: 'err', text: t('settings.msg.import.json.err') });
        setTimeout(() => setMsg(null), 2600);
      }
    };
    reader.readAsText(file);
  };

  return (
    <React.Fragment>
      <AjustesAccion onClick={exportJSON} title={t('settings.data.export.title')} derecha={<DownloadIcon />}>
        {t('settings.data.export')}
      </AjustesAccion>
      <AjustesAccion onClick={() => fileInputRef.current && fileInputRef.current.click()} title={t('settings.data.import.title')} derecha={<UploadIcon />}>
        {t('settings.data.import')}
      </AjustesAccion>
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
      {msg && (
        <div className="pace-aj-msg" role="status" style={{ color: msg.kind === 'err' ? 'var(--breathe)' : 'var(--focus)' }}>{msg.text}</div>
      )}
      {rescate && (
        <AjustesAccion onClick={() => paceDescargarRescate()} title={t('settings.data.rescate.title')} derecha={<DownloadIcon />}>
          <span data-pace-aj-rescate>{t('settings.data.rescate')} <span style={{ color: 'var(--ink-3)', fontSize: '.92em' }}>· {rescateFecha}</span></span>
        </AjustesAccion>
      )}
      <AjustesAccion suave onClick={onReset} derecha="›">{t('settings.data.reset')}</AjustesAccion>
      <PremiumSection />
      {/* El pie: la promesa de privacidad -- es de marca, se queda-- y los
          enlaces /safety y /privacy (s102; paginas estaticas de s101), solo en
          web: en file:// esas rutas no resuelven. Nueva pestana para no matar
          un timer corriendo. En Android van a la web publicada, que se abre en
          el navegador: en el APK no hay servidor que resuelva esas rutas. */}
      <div className="pace-aj-pie">
        <span>{t(typeof paceEsAndroid === 'function' && paceEsAndroid() ? 'settings.foot.android' : 'settings.foot')}</span>
        {isWeb && (
          <span>
            <a href={paceEnlaceLegal('/safety')} target="_blank" rel="noopener">{t('settings.legal.safety')}</a>
            <span style={{ margin: '0 5px' }}>·</span>
            <a href={paceEnlaceLegal('/privacy')} target="_blank" rel="noopener">{t('settings.legal.privacy')}</a>
          </span>
        )}
      </div>
    </React.Fragment>
  );
}

/* ============================================================
   Iconos (los mismos desde s17; el estilo de fila vive en la hoja pace-aj-*)
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


Object.assign(window, { TweaksDataSection, paceDescargarCopia, paceDescargarRescate });
