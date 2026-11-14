/* PACE · traer una copia de tus datos (Importar)
   ===============================================
   Lo de «Importar una copia» de Ajustes › Tus datos, entero: leer el archivo, preguntar con el
   aviso de PACE lo que trae, y escribirlo por la barrera y recargar. Vive aparte porque tiene
   DOS puertas, y las dos tienen que dejar la app igual: Ajustes (TweaksData.jsx) y la
   bienvenida, con «¿Tienes una copia? Tráela» bajo «Comenzar» (Ez, N3 A, 8 nov. 2026: quien
   estrena móvil pasaba la bienvenida entera para que la copia sustituyera lo contestado).

   `usePaceTraerCopia(decir, capa)` devuelve `elegir()`, que abre el selector de archivos, y
   `piezas`, el <input> escondido y los dos avisos, que se pintan donde viva la puerta. `decir`
   recibe los avisos cortos (`kind`, clave de i18n); `capa`, la del aviso: sobre la bienvenida
   (120) va por encima de ella. */

const { useState: useStateImp, useRef: useRefImp } = React;

/* Lo pasajero que vuelve al recargar: el Foco en marcha o en pausa, y la Respira, el Mueve o el
   Estira a medias. Al importar es de ANTES de la copia, así que no se reanuda con ella: un bloque
   ya vencido se contaría en la historia que acaba de entrar (auditoría del 21 oct.). Cada clave
   la borra su dueño. */
function paceOlvidarPasajero() {
  try { if (typeof olvidarFocoGuardado === 'function') olvidarFocoGuardado(); } catch (e) {}
  try { if (typeof olvidarRespiraGuardada === 'function') olvidarRespiraGuardada(); } catch (e) {}
  try { if (typeof olvidarCuerpoGuardada === 'function') olvidarCuerpoGuardada(); } catch (e) {}
}

/* Lo que la copia dice de sí misma, para la pregunta (sexta pasada externa, nº 25 y nº 5; Ez,
   13 nov. 2026): de qué día es (`exportedAt`, que escribe exportar) y si la hizo una versión de
   PACE más nueva que esta. Una copia más nueva entra igual, porque el saneador guarda lo que no
   conoce: solo se avisa, para que actualice antes si puede. Sin fecha o versión legibles, no se
   dice nada. La fecha es la ISO entera, con hora y zona, nunca un «YYYY-MM-DD» suelto. */
function paceDiaDeLaCopia(iso, lang) {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(iso)) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const opciones = { day: 'numeric', month: 'long' };
  if (d.getFullYear() !== new Date().getFullYear()) opciones.year = 'numeric';
  return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', opciones);
}

function paceCopiaMasNueva(version) {
  const numeros = (v) => { const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(String(v || '')); return m ? m.slice(1).map(Number) : null; };
  const a = numeros(version), b = numeros(PACE_VERSION);
  if (!a || !b) return false;
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return false;
}

function usePaceTraerCopia(decir, capa) {
  const { t, tn, lang } = useT();
  const fileInputRef = useRefImp(null);
  const [pidiendoImportar, setPidiendoImportar] = useStateImp(null); // lo que trae la copia, mientras se pregunta
  const [avisoParcial, setAvisoParcial] = useStateImp(false);       // la copia entró sin su registro

  const importJSON = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = String(ev.target.result || '');
        let payload = JSON.parse(raw);
        /* La copia de rescate (Ajustes) lleva el estado como la cadena CRUDA que un arranque no
           pudo leer. Si ahora se lee, entra como una copia normal, por el mismo saneado; si no,
           es un JSON roto y lo dice el catch (caza del 10 oct., estado-4). */
        if (payload && payload.kind === 'rescate' && payload.rescate && typeof payload.rescate.raw === 'string') {
          payload = { app: 'PACE', state: JSON.parse(payload.rescate.raw) };
        }

        // Validación mínima: tiene que parecerse a una copia de PACE.
        const looksValid = payload && (
          (payload.app === 'PACE' && payload.state && typeof payload.state === 'object')
          || (payload.achievements !== undefined || payload.weeklyStats !== undefined)
        );
        if (!looksValid) { decir('err', 'settings.msg.import.invalid'); return; }

        // Soporta dos formatos: {app, state:{...}} o state plano (fallback).
        const bruto = (payload.state && typeof payload.state === 'object') ? payload.state : payload;
        /* s198 · A-7, EL IMPORT SANEADO. Lo que entra pasa por el MISMO saneador que
           el arranque (state-core.sanea.js): antes se escribia tal cual, y un
           `weeklyStats: null` dentro de una copia bastaba para que el siguiente
           arranque cayera al estado de fabrica y borrara la historia. Una copia
           que no es un objeto se rechaza aqui, no al recargar. */
        if (!paceEsObjetoPlano(bruto)) { decir('err', 'settings.msg.import.invalid'); return; }
        const incoming = paceSanearEstado(bruto, defaultState).estado;

        /* Lo que trae, para el aviso que pregunta antes de escribir (un aviso de PACE, no la
           ventanita del navegador: Ez, 3A del 27 oct.). Se escribe al decir que sí. */
        setPidiendoImportar({
          incoming, eventsSection: payload.events,
          dia: paceDiaDeLaCopia(payload.exportedAt, lang), nueva: paceCopiaMasNueva(payload.version),
          logros: incoming.achievements ? Object.keys(incoming.achievements).length : 0,
          foco: incoming.totalFocusMin || 0,
        });
      } catch (e) {
        decir('err', 'settings.msg.import.json.err');
      }
    };
    reader.readAsText(file);
  };

  /* Al decir que sí: se escribe y se recarga para empezar de un estado limpio.
     s155 — el estado legacy y `pace.events.v1` son DOS almacenes y entre
     ellos NO hay atomicidad, asi que la escritura pasa por la barrera:
     marcador -> estado legacy (la verdad canonica va primero) ->
     contenedor de eventos REINICIADO con `activatedAt` nuevo y el
     baseline recapturado del estado que acaba de entrar.
     Que pasa con el contenedor depende de SI LA COPIA TRAE EVENTOS (s169):
       · CON seccion  -> se REEMPLAZA por completo con la de la copia
         (§17: sin merge, sin deduplicar, idempotente).
       · SIN seccion  -> se REINICIA con `activatedAt` nuevo y el
         baseline recapturado del estado que entra. Dejar el contenedor
         de antes junto a un estado importado seria exactamente la MEZCLA
         de historial anterior con estado nuevo que hay que evitar.
     Y si la seccion viene CORRUPTA, la barrera aborta el import ENTERO
     sin escribir el estado legacy: una copia a medias no es una copia.
     La recarga de 900 ms no es la garantia: si el proceso muriera antes
     de que la barrera termine, el MARCADOR sobrevive y la siguiente
     inicializacion completa el reinicio (§22), que es idempotente.
     La seccion de eventos NO se valida aqui -- lo hace la barrera, que es
     quien puede garantizar el «antes de tocar nada» de §17. */
  const importarDeVerdad = () => {
    const pendiente = pidiendoImportar;
    setPidiendoImportar(null);
    if (!pendiente) return;
    /* EL CÓDIGO DE PACE COMPLETO NO SE VA CON LA COPIA: viaja dentro del estado y una hecha antes
       de comprar lo pisaba (revisión de ChatGPT del 5 nov., punto 2). `paceLicenciaConservar`
       (state-licencia.js) dice cuál se queda; comprobar dos códigos es asíncrono, y lo demás espera.
       Lo mismo con la semana del día de v1 y las rutinas que se quedan (`paceConservarAlImportar`,
       state-entitlement.jsx): una copia de antes de v1 no la trae y volvía a empezar. */
    paceConservarAlImportar(getState(), pendiente.incoming).then((incoming) => escribirCopia(incoming, pendiente.eventsSection));
  };

  const escribirCopia = (incoming, eventsSection) => {
    /* EN CUANTO LA COPIA ESTÁ ESCRITA, LO QUE HAY EN MEMORIA ES LA COPIA, y nada guarda hasta
       recargar (revisión de ChatGPT del 28 oct., A5). Lo de antes seguía en memoria los 900 ms
       de la recarga, o lo que tardara en cerrarse el aviso de la copia a medias, y cualquier
       cambio de ese rato (un Foco que acaba, el cambio de día, el resumen de «A tu ritmo») lo
       guardaba encima de la copia. Desde que se escribe, siempre se recarga.
       La copia se lee como al arrancar, igual que la de otra pestaña (state-core.pestanas.js):
       el objeto que entra no lleva lo que añaden las migraciones, y dibujarlo tumba la app. Si
       no se pudiera leer, lo de memoria se queda, pero tampoco se guarda. */
    const writeLegacy = () => {
      localStorage.setItem('pace.state.v2', JSON.stringify(incoming));
      let copia = getState();
      try { copia = loadState(true); } catch (e) {}
      try { paceAdoptarEstado(copia, true); } catch (e) {}
    };
    /* SE ESPERA A LA BARRERA, y el exito se anuncia solo si de verdad lo hubo: si `setItem`
       fallaba por cuota o por almacenamiento bloqueado, la UI decia «importado» y recargaba. */
    paceEventsStoreBarrier('import', writeLegacy, incoming, eventsSection).then((r) => {
      if (!r || !r.legacyWritten) { decir('err', 'settings.msg.import.storage.err'); return; }
      /* El estado entró, pero `legacyWritten` no dice si entró el registro de sesiones: la
         barrera lo da también cuando el almacén falló al reemplazarlo (`interrupted`; al
         arrancar, el marcador lo deja vacío) o cuando este navegador no tiene dónde
         guardarlo (`unavailable`). Si la copia traía registro y no entró, se dice con un
         aviso que hay que cerrar, y al cerrarlo se recarga (auditoría del 21 oct.): hasta
         entonces la app sigue con la copia en memoria y sin guardar nada. */
      const traiaRegistro = !!(eventsSection && Array.isArray(eventsSection.events) && eventsSection.events.length);
      if (traiaRegistro && r.result !== 'committed') { setAvisoParcial(true); return; }
      decir('ok', 'settings.msg.imported');
      setTimeout(() => { paceOlvidarPasajero(); location.reload(); }, 900);
    });
  };

  const elegir = () => fileInputRef.current && fileInputRef.current.click();

  /* El selector, sin `accept`: una copia que llega por WhatsApp o se baja de Drive puede venir
     sin el tipo de JSON, y Android no la enseñaba en la lista (sexta pasada externa, nº 6). Lo que
     entra se valida arriba: un archivo que no es una copia de PACE no toca nada. */
  const p = pidiendoImportar;
  const piezas = (
    <React.Fragment>
      <input
        ref={fileInputRef}
        type="file"
        data-pace-traer-copia
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files && e.target.files[0];
          importJSON(f);
          e.target.value = ''; // permitir re-importar el mismo archivo
        }}
      />
      <AjustesAviso abierto={!!pidiendoImportar} capa={capa} titulo={t('settings.import.titulo')} si={t('settings.import.si')}
        onSi={importarDeVerdad} onNo={() => setPidiendoImportar(null)}>
        {p ? tn(p.dia ? 'settings.import.cuerpo.dia' : 'settings.import.cuerpo', { dia: p.dia, logros: p.logros, foco: p.foco }) : null}
        {p && p.nueva ? <span data-pace-copia-nueva style={{ display: 'block', marginTop: 10 }}>{t('settings.import.nueva')}</span> : null}
      </AjustesAviso>
      <AjustesAviso abierto={avisoParcial} capa={capa} titulo={t('settings.import.parcial.titulo')} si={t('guardar.entendido')}
        onNo={() => { paceOlvidarPasajero(); location.reload(); }}>
        {t('settings.msg.import.partial')}
      </AjustesAviso>
    </React.Fragment>
  );

  return { elegir, piezas };
}

Object.assign(window, { usePaceTraerCopia, paceOlvidarPasajero });
