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

   IMPORT — vive en TweaksData.importar.jsx (`usePaceTraerCopia`), porque se
   llega también desde la bienvenida (Ez, N3 A, 8 nov. 2026). Valida, pregunta
   con el aviso de PACE y, al decir que sí, escribe por la barrera y recarga.
*/

const { useState: useStateTD, useRef: useRefTD } = React;

/* s198 · v0.132.0 — LA COPIA, FUERA DEL PANEL. La pide tambien la pantalla
   global de error (ui/RedDeError.jsx), que existe justo cuando el arbol de React
   se ha caido: por eso lee de `localStorage` y no del store, y si el estado no
   se puede leer viaja CRUDO (`stateRaw`) en vez de no viajar. Devuelve si se
   pudo; los mensajes los pone quien la llama.
   En las apps (Android y iPhone) el WebView no descarga: la copia sale por el
   menu de compartir (ui/nativo.js), desde el que se guarda en Drive, en Archivos
   o en iCloud.
   Devuelve 'descargada' en la web, y en las apps la promesa de lo que pasó con el menú:
   'compartida', 'cancelada' o 'fallo' (ui/nativo.js). `alAbrir`, al abrirse el menú. */
function paceBajarJSON(payload, nombre, alAbrir) {
  const texto = JSON.stringify(payload, null, 2);
  const enApp = typeof paceNativoGuardarArchivo === 'function' ? paceNativoGuardarArchivo(nombre, texto, alAbrir) : false;
  if (enApp) return enApp;
  const blob = new Blob([texto], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return 'descargada';
}

function paceEnlaceLegal(ruta) {
  return typeof paceNativoEnlace === 'function' ? paceNativoEnlace(ruta) : ruta;
}

function paceDiaArchivo() {
  return toISODate(new Date()).replace(/-/g, ''); // local, no UTC (s105)
}

/* `enMemoria`: el estado de la app. Ajustes y el aviso de «No se puede guardar» lo pasan (`getState()`);
   sin él (`null`) se lee del disco, que es la vía de la pantalla de error y de los rescates, donde la
   interfaz puede estar caída y lo guardado ser viejo o ni poder leerse. Devuelve lo de `paceBajarJSON`, o false si ni se armó. */
function paceDescargarCopia(enMemoria, alAbrir) {
  try {
    let raw = '{}';
    if (!enMemoria) { try { raw = localStorage.getItem('pace.state.v2') || '{}'; } catch (e) {} }
    let parsed = enMemoria || null;
    if (!parsed) { try { parsed = JSON.parse(raw); } catch (e) {} }
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
    return paceBajarJSON(payload, 'pace-backup-' + paceDiaArchivo() + '.json', alAbrir);
  } catch (e) { return false; }
}

/* s198 · B2 (decision del usuario): la copia de rescate se descarga SOLA, desde su
   fila en «Tus datos», que solo existe si hay rescate. Devuelve lo mismo que la copia normal
   (lo de `paceBajarJSON`, o false si ni se armó) para que su fila diga cómo le fue: antes daba
   `true` sin esperar a la hoja de compartir (revisión de ChatGPT del 5 nov., punto 4). */
function paceDescargarRescate(alAbrir) {
  try {
    const r = typeof paceLeerRescate === 'function' ? paceLeerRescate() : null;
    if (!r) return false;
    return paceBajarJSON({ app: 'PACE', kind: 'rescate', version: PACE_VERSION, exportedAt: new Date().toISOString(), rescate: r },
      'pace-rescate-' + paceDiaArchivo() + '.json', alAbrir);
  } catch (e) { return false; }
}

/* La copia lleva dentro el logro que gana («Cuaderno a salvo»): se da al salir la copia, después
   de armarla, y sin esto quien la trae a otro móvil (o tras «Borrar todos mis datos») perdía justo
   ese logro. Si la copia no sale, el archivo no existe y el logro no se da: no hay nada que corregir. */
function paceConLogroDeLaCopia(s) {
  if (!s || !s.achievements || s.achievements['secret.backup']) return s;
  return Object.assign({}, s, { achievements: Object.assign({}, s.achievements, { 'secret.backup': { unlockedAt: Date.now() } }) });
}

function TweaksDataSection({ onReset, isWeb }) {
  const { t, lang } = useT();
  const [msg, setMsg] = useStateTD(null); // {kind, text} para feedback Export/Import

  /* Un aviso no lo borra el temporizador de otro anterior: en las apps, el de la hoja abierta
     y el de cómo acabó van seguidos. */
  const avisoTimerRef = useRefTD(null);
  const avisar = (kind, clave, ms) => {
    setMsg({ kind, text: t(clave) });
    clearTimeout(avisoTimerRef.current);
    avisoTimerRef.current = setTimeout(() => setMsg(null), ms);
  };

  /* En las apps la copia sale por el menú de compartir y el resultado llega después: con el
     menú abierto, «elige dónde guardarla»; si se cierra sin elegir, o el archivo no se pudo
     escribir, no se da por hecha ni da su logro (auditoría del 21 oct.). Lo que haga después
     la app elegida no se sabe, así que nunca se dice «guardada». */
  const avisarSalida = (como) => {
    if (como === 'descargada') avisar('ok', 'settings.msg.exported', 2200);
    else if (como === 'cancelada') avisar('ok', 'settings.msg.export.cancel', 2600);
    else if (como !== 'compartida') avisar('err', 'settings.msg.export.err', 2600);
  };

  const exportJSON = () => {
    const alAbrir = () => avisar('ok', 'settings.msg.exported.app', 4000);
    /* Desde la app funcionando, lo que se ve: el estado en memoria, que es lo único al día si el
       navegador no deja guardar (revisión de ChatGPT del 5 nov., punto 1). Leer del disco es solo
       para la pantalla de error, que existe cuando el árbol se ha caído. */
    Promise.resolve(paceDescargarCopia(paceConLogroDeLaCopia(getState()), alAbrir)).then((como) => {
      avisarSalida(como);
      /* secret.backup (B1, sustituto de apnea): exportar tus datos. */
      if (como === 'descargada' || como === 'compartida') unlockAchievement('secret.backup');
    });
  };

  /* La copia de rescate dice cómo le fue igual que la normal, pero no da el logro de exportar. */
  const bajarRescate = () => {
    Promise.resolve(paceDescargarRescate(() => avisar('ok', 'settings.msg.exported.app', 4000))).then(avisarSalida);
  };

  /* La fila del rescate (B2): la fecha, corta y en el idioma de la app. */
  const rescate = typeof paceLeerRescate === 'function' ? paceLeerRescate() : null;
  const rescateFecha = rescate
    ? paceFechaCorta(rescate.savedAt, lang, { day: 'numeric', month: 'short' })
    : null;

  /* El borrado (TweaksPanel.jsx) llama a esto si el navegador no dejó borrar: no se recarga y se
     dice aquí, donde salen los demás avisos de «Tus datos». */
  const noBorro = () => avisar('err', 'settings.msg.reset.err', 3200);

  /* Importar vive en TweaksData.importar.jsx, porque también se llega desde la bienvenida
     (Ez, N3 A). Sus avisos cortos salen aquí, con los de exportar. */
  const traer = usePaceTraerCopia((kind, clave) => avisar(kind, clave, 2600));

  return (
    <React.Fragment>
      <AjustesAccion onClick={exportJSON} title={t('settings.data.export.title')} derecha={<DownloadIcon />}>
        {t('settings.data.export')}
      </AjustesAccion>
      <AjustesAccion onClick={traer.elegir} title={t('settings.data.import.title')} derecha={<UploadIcon />}>
        {t('settings.data.import')}
      </AjustesAccion>
      {traer.piezas}
      {msg && (
        <div className="pace-aj-msg" role="status" style={{ color: msg.kind === 'err' ? 'var(--breathe-deep)' : 'var(--focus)' }}>{msg.text}</div>
      )}
      {rescate && (
        <AjustesAccion onClick={bajarRescate} title={t('settings.data.rescate.title')} derecha={<DownloadIcon />}>
          <span data-pace-aj-rescate>{t('settings.data.rescate')} <span style={{ color: 'var(--ink-3)', fontSize: '.92em' }}>· {rescateFecha}</span></span>
        </AjustesAccion>
      )}
      <AjustesAccion suave onClick={() => onReset(noBorro)} derecha="›">{t('settings.data.reset')}</AjustesAccion>
      <PremiumSection />
      {/* El pie: la promesa de privacidad -- es de marca, se queda-- y los
          enlaces /safety y /privacy (s102; paginas estaticas de s101), solo en
          web: en file:// esas rutas no resuelven. Nueva pestana para no matar
          un timer corriendo. En las apps (Android y iPhone) van a la web
          publicada, que se abre en el navegador: dentro de la app no hay servidor
          que resuelva esas rutas. */}
      <div className="pace-aj-pie">
        <span>{t(typeof paceEsNativo === 'function' && paceEsNativo() ? 'settings.foot.app' : 'settings.foot')}</span>
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
