/* PACE · El mando del runner de Mueve y Estira (opción A, «Mando de tres», elegida por Ez)
   ===========================================================================================
   Una sola fila de tres botones redondos: anterior, pausa en el centro y siguiente. «Siguiente»
   hace lo que toque en cada fase (empezar ya, terminar la serie, hecho, saltar el descanso,
   siguiente lado, siguiente o terminar), así que en el móvil el pie nunca pasa a dos filas y no
   cambia de forma entre pantallas. Debajo de cada botón va su palabra (Ez, P5 A del 29 oct.):
   «Anterior», «Pausar» y lo que hace la flecha ahora. Va DENTRO del botón (no en `aria-label`):
   es su nombre para un lector de pantalla y para las pruebas, y tocarla pulsa el botón. Cuelga
   por debajo a la misma altura en los tres, aunque el del centro sea mayor; el mando reserva ese
   alto siempre, así que cambiar de palabra no mueve nada.

   El «+15 s» de colocarse y del cambio de lado no vive aquí: va junto a la cuenta atrás
   (MoveSessionV1.cuerpo.jsx), que es de lo que habla.

   EL FOCO VUELVE A LA SESIÓN TRAS UN CLIC. Si se quedara en el botón, Espacio lo pulsaría otra
   vez en lugar de pausar (la sesión no roba Espacio a un control con foco): tras «siguiente»,
   Espacio volvía a saltar de paso. Solo con ratón o dedo (`detail > 0`): quien llega con el
   teclado conserva el foco donde lo puso. */

function v1SoltarFoco(e) {
  if (!e || !(e.detail > 0) || !e.currentTarget) return;
  const raiz = e.currentTarget.closest('[data-pace-session-root]');
  if (raiz) { try { raiz.focus({ preventScroll: true }); } catch (err) {} }
}

/* EL ARO DEL «›» (Ez, 1A del 25 oct.): con «Auto», se llena hasta que la pantalla pasa sola
   (`anillo`, de 0 a 1). Sin «Auto», `espera` marca el botón cuando la cuenta ya acabó y lo que
   sigue lo decide quien hace la rutina. */
function MandoV1({ accent, paused, onPause, prev, next, textos, anillo, espera, acentoModulo }) {
  const tono = acentoModulo || accent;
  const vuelta = 2 * Math.PI * 27;
  const lleno = Math.max(0, Math.min(1, anillo || 0));
  /* Los textos traen su flecha o su símbolo («← Anterior», «❚❚ Pausar»); el botón ya los dibuja. */
  const etiqueta = (s) => String(s || '').replace(/[←→❚▶]/g, '').trim();
  const pulsa = (fn) => (e) => { v1SoltarFoco(e); if (fn) fn(); };
  return (
    <div data-pace-v1-mando className="pace-v1-mando">
      <button type="button" className="pace-v1-redondo" data-pace-v1-btn="prev" onClick={pulsa(prev.onClick)} disabled={prev.disabled}
        title={etiqueta(textos.prev)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6.5 9 12l5.5 5.5" /></svg>
        <span className="pace-v1-rotulo">{etiqueta(textos.prev)}</span>
      </button>
      <button type="button" className="pace-v1-redondo pace-v1-redondo-centro" data-pace-v1-btn="pausa" onClick={pulsa(onPause)}
        title={etiqueta(paused ? textos.resume : textos.pause)} style={{ background: accent, borderColor: accent }}>
        {paused
          ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5v11l9-5.5z" className="pace-v1-relleno" /></svg>
          : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5v11M15 6.5v11" /></svg>}
        <span className="pace-v1-rotulo">{etiqueta(paused ? textos.resume : textos.pause)}</span>
      </button>
      <button type="button" className="pace-v1-redondo" data-pace-v1-btn="next" onClick={pulsa(next.onClick)} title={etiqueta(next.label)}
        {...(espera ? { 'data-pace-v1-espera': '', style: { '--v1-tono': tono } } : {})}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5" /></svg>
        {anillo != null && (
          <svg className="pace-v1-anillo" data-pace-v1-anillo={lleno.toFixed(3)} viewBox="0 0 58 58" aria-hidden="true">
            <circle cx="29" cy="29" r="27" className="pace-v1-anillo-pista" />
            <circle cx="29" cy="29" r="27" className="pace-v1-anillo-arco" transform="rotate(-90 29 29)"
              style={{ stroke: tono, strokeDasharray: `${(vuelta * lleno).toFixed(1)} ${vuelta.toFixed(1)}`, opacity: lleno > 0 ? 1 : 0 }} />
          </svg>
        )}
        <span className="pace-v1-rotulo">{etiqueta(next.label)}</span>
      </button>
    </div>
  );
}

Object.assign(window, { MandoV1, v1SoltarFoco });
