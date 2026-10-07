/* PACE · El mando del runner de Mueve y Estira (opción A, «Mando de tres», elegida por Ez)
   ===========================================================================================
   Una sola fila de tres botones redondos: anterior, pausa en el centro y siguiente. «Siguiente»
   hace lo que toque en cada fase (empezar ya, terminar antes, siguiente, terminar o saltar), así
   que en el móvil el pie nunca pasa a dos filas y no cambia de forma entre pantallas. Cada botón
   lleva su acción escrita en un texto oculto (no en `aria-label`): así la lee un lector de pantalla
   y la encuentran las pruebas que miran el texto del botón.

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

function MandoV1({ accent, paused, onPause, prev, next, textos }) {
  /* Los textos traen su flecha o su símbolo («← Anterior», «❚❚ Pausar»); el botón ya los dibuja. */
  const etiqueta = (s) => String(s || '').replace(/[←→❚▶]/g, '').trim();
  const pulsa = (fn) => (e) => { v1SoltarFoco(e); if (fn) fn(); };
  return (
    <div data-pace-v1-mando className="pace-v1-mando">
      <button type="button" className="pace-v1-redondo" data-pace-v1-btn="prev" onClick={pulsa(prev.onClick)} disabled={prev.disabled}
        title={etiqueta(textos.prev)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6.5 9 12l5.5 5.5" /></svg>
        <span className="pace-v1-oculto">{etiqueta(textos.prev)}</span>
      </button>
      <button type="button" className="pace-v1-redondo pace-v1-redondo-centro" data-pace-v1-btn="pausa" onClick={pulsa(onPause)}
        title={etiqueta(paused ? textos.resume : textos.pause)} style={{ background: accent, borderColor: accent }}>
        {paused
          ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5v11l9-5.5z" className="pace-v1-relleno" /></svg>
          : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5v11M15 6.5v11" /></svg>}
        <span className="pace-v1-oculto">{etiqueta(paused ? textos.resume : textos.pause)}</span>
      </button>
      <button type="button" className="pace-v1-redondo" data-pace-v1-btn="next" onClick={pulsa(next.onClick)} title={etiqueta(next.label)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5" /></svg>
        <span className="pace-v1-oculto">{etiqueta(next.label)}</span>
      </button>
    </div>
  );
}

Object.assign(window, { MandoV1, v1SoltarFoco });
