/* PACE - Caminos - SuggestedPathCard - sesion 53 / v0.27.0
   Sugiere el camino del momento o el favorito del usuario (prioritario).
   Boton "Ver caminos" abre PathsLibrary via CustomEvent.

   Sesion 61 (v0.28.2): compactado en movil. El bug previo era que la regla
   CSS `[data-pace-spc] > div { flex-direction: column !important }` aplicaba
   tambien al PathMiniCard suelto (no solo al contenedor dual), forzando una
   tarjeta apilada de ~250px de alto que aplastaba al timer. Ahora:
     - El contenedor dual lleva data-pace-spc-dual y solo ese se apila.
     - PathMiniCard se identifica con data-pace-spc-card y reduce padding,
       tipos y oculta el tagline en movil para acercarse al layout web
       horizontal (nombre + iconos + boton en una fila).

   Sesion 122 (CLARIDAD UX de la home): la tarjeta se explica MEJOR sin dejar
   de ser compacta (decision del usuario: conservar el diseno original, con la
   secuencia en ICONOS pequenos, no en palabras).
     - Eyebrow SIEMPRE visible: "Camino sugerido" / "Camino favorito" +
       duracion aproximada (~N min) leyendo los .min de cada paso. Da la senal
       "esto es un Camino" y su tiempo sin abrirlo.
     - La secuencia sigue en iconos de paso (respira/foco/cuerpo/agua).
     - CTA "Iniciar camino" (antes "Comenzar", que colisionaba con el verbo
       del timer). Relleno, como el original.
*/

const { useState: useStateSPC } = React;

/* Reglas responsive del modulo Caminos sugeridos. Inyectadas una vez.
   Movil: padding lateral mas estrecho, card en fila pero compacta. */
if (typeof document !== 'undefined' && !document.getElementById('pace-spc-responsive-css')) {
  const s = document.createElement('style');
  s.id = 'pace-spc-responsive-css';
  s.textContent = `
    /* Solapamiento editorial "sol amaneciendo" (s122, petición del usuario):
       la tarjeta sube y tapa el arco INFERIOR del círculo del timer hasta rozar
       los puntos de CICLO, para que el aro se lea como un sol saliendo tras la
       tarjeta y no como un círculo entero.
       Se hace con "transform: translateY" NEGATIVO (NO margin): un margen
       negativo libera hueco del flujo y, como el timer es flex:1, este lo
       reclama y RECENTRA el aro hacia abajo en vez de que la tarjeta suba. El
       transform no toca el flujo, el aro se queda quieto y la tarjeta pinta
       por encima (orden del DOM + z-index). Se sube también la ActivityBar el
       mismo desplazamiento para que la sigan sin abrir un hueco entre ambas
       (el espacio sobrante queda al fondo de la pantalla, inocuo).
       La distancia CICLO→tarjeta es ~130px de forma estable entre ~760 y
       ~1080px de alto (el aro escala con la altura y el hueco lo acompaña), así
       que un desplazamiento fijo aterriza ~10-20px por debajo del CICLO en ese
       rango, sin taparlo ni tapar el botón. GATE a alturas ≥760px: por debajo,
       el aro ya desborda y la tarjeta ya solapa (caso corto, diferido a §0). */
    /* Solapamiento "atardecer" (s123): la tarjeta de Camino sube el 12% del
       DIÁMETRO del aro (var --pace-home-sunset-overlap, definida en _responsive.js
       sobre [data-pace-home-body]) mediante margin-top NEGATIVO, cruzando el
       tramo inferior decorativo del aro (el "horizonte" bajo un "sol"). SIEMPRE
       presente y progresivo: más aro => más solapamiento, sin gate binario ni
       breakpoints. z-index:2 la pinta SOBRE el aro. El margin negativo arrastra
       también a la ActivityBar (flujo normal), así que Camino y Actividades
       quedan pegadas sin abrir hueco — sin necesidad de mover la ActivityBar.
       Los controles del aro (CTA, bolas, CICLO) viven en su centro, muy por
       encima del 12% inferior, así que el solapamiento nunca los tapa. */
    [data-pace-spc] {
      position: relative;
      z-index: 2;
      /* s128: el solapamiento lo mide AHORA el motor (home-geometry.js) desde el
         CICLO real. La tarjeta es el "horizonte" del móvil: sube y el aro se
         recorta en su borde superior (clip en [data-pace-dial-fit]).
         s156: se consume --pace-horizon, el token que resuelve motor-o-fallback
         en UN solo sitio (_responsive.js). Antes esta regla traía su propia
         cadena de fallbacks y el recorte del aro traía otra distinta, así que
         con el motor apagado la tarjeta subía sobre un aro sin recortar. */
      margin-top: calc(var(--pace-horizon) * -1);
    }
    /* s123: el SWAP por flex-order que había aquí (Actividades vs Camino en
       ancho+corto) ROMPIA la jerarquia invariante Timer -> Camino -> Actividades
       y fue eliminado. En su lugar, la geometria del aro es sensible a la altura
       util (se encoge por altura, ver [data-pace-dial-fit] en _responsive.js) y
       la region de la home hace scroll de ultimo recurso (data-pace-home-body en
       main.jsx). Por debajo de 760px simplemente NO hay solapamiento; el orden
       del DOM se respeta en todos los viewports. */
    @media (max-width: 640px) {
      [data-pace-spc] { padding: 0 14px 10px !important; }
      /* Solo el contenedor dual se apila; la card unica queda en row */
      [data-pace-spc-dual] { flex-direction: column !important; gap: 8px !important; }
      [data-pace-spc-card] { padding: 10px 12px !important; gap: 10px !important; }
      [data-pace-spc-card] [data-pace-spc-bar] { display: none !important; }
      [data-pace-spc-card] [data-pace-spc-label] { font-size: 9px !important; margin-bottom: 2px !important; }
      [data-pace-spc-card] [data-pace-spc-name] { font-size: 15px !important; }
      [data-pace-spc-card] [data-pace-spc-tagline] { display: none !important; }
      [data-pace-spc-card] [data-pace-spc-steps] { margin-top: 4px !important; gap: 4px !important; }
      [data-pace-spc-card] [data-pace-spc-step] { width: 16px !important; height: 16px !important; }
      [data-pace-spc-card] [data-pace-spc-cta] { padding: 7px 12px !important; font-size: 11px !important; }
    }
  `;
  document.head.appendChild(s);
}

/* Duracion aproximada de un Camino en minutos: suma los .min de cada paso.
   - focus: step.min directo.
   - breathe / body: se resuelve la rutina (getBreatheRoutine / resolveBodyRoutine)
     y se lee su .min (todas las rutinas lo conservan, incluso las migradas al
     contrato v1 — "cero drift de min").
   - hydrate / opcional: tiempo despreciable, no suma.
   Solo LEE datos ya expuestos a window; no toca el runner ni los Caminos. */
function pathDurationMin(pathObj) {
  if (!pathObj || !pathObj.steps) return 0;
  let total = 0;
  for (let i = 0; i < pathObj.steps.length; i++) {
    const st = pathObj.steps[i];
    if (st.kind === 'focus') { total += st.min || 0; continue; }
    if (st.kind === 'breathe') {
      const r = (typeof window.getBreatheRoutine === 'function') ? window.getBreatheRoutine(st.routineId) : null;
      total += (r && r.min) || 0;
      continue;
    }
    if (st.kind === 'body') {
      const res = (typeof window.resolveBodyRoutine === 'function') ? window.resolveBodyRoutine(st.routineId) : null;
      total += (res && res.routine && res.routine.min) || 0;
      continue;
    }
    /* hydrate / desconocido: no suma */
  }
  return total;
}

/* Iconos de paso: stroke fino 14x14 */
function SPCIconBreathe() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"><path d="M8 2.5v7" /><path d="M5 7.5C3.6 7.8 2.5 8.8 2.2 10.2c-.4 1.7.2 3.4 1.8 3.5.9.1 1.4-.5 1.6-1.3.3-1.3.4-2.9.4-4.5z" /><path d="M11 7.5c1.4.3 2.5 1.3 2.8 2.7.4 1.7-.2 3.4-1.8 3.5-.9.1-1.4-.5-1.6-1.3-.3-1.3-.4-2.9-.4-4.5z" /></svg>;
}
function SPCIconFocus() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"><circle cx="8" cy="8" r="5.5" /><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" /></svg>;
}
function SPCIconBody() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"><path d="M2.5 12c1.8-4.5 4-7 5.5-7s3.7 2.5 5.5 7" /><circle cx="8" cy="4" r="1.2" /></svg>;
}
function SPCIconHydrate() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"><path d="M8 1.5c-2 3-4.5 4.8-4.5 7.5a4.5 4.5 0 0 0 9 0c0-2.7-2.5-4.5-4.5-7.5z" /></svg>;
}

const SPC_STEP_ICONS = { breathe: SPCIconBreathe, focus: SPCIconFocus, body: SPCIconBody, hydrate: SPCIconHydrate };

/* PathMiniCard — reutilizable para sugerido y favorito */
function PathMiniCard({ pathObj, label, doneToday, onStart }) {
  const { t } = useT();
  const name = t(pathObj.nameKey) || pathObj.id;
  const tagline = t(pathObj.taglineKey) || '';
  const durMin = pathDurationMin(pathObj);
  const eyebrow = durMin > 0
    ? label + ' · ' + (t('paths.suggested.approxMin') || '~{n} min').replace('{n}', durMin)
    : label;

  return (
    <div data-pace-spc-card style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '14px 20px',
      background: doneToday ? 'var(--paper-2)' : 'var(--paper)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      boxShadow: 'var(--sh-soft)',
      cursor: doneToday ? 'default' : 'pointer',
      transition: 'all var(--dur-quick) var(--ease)',
      flex: 1, minWidth: 0,
    }}
    onClick={!doneToday ? onStart : undefined}
    onMouseEnter={!doneToday ? function(e) { e.currentTarget.style.boxShadow = 'var(--sh-card), 0 2px 18px var(--focus-soft)'; e.currentTarget.style.transform = 'translateY(-1px)'; } : undefined}
    onMouseLeave={!doneToday ? function(e) { e.currentTarget.style.boxShadow = 'var(--sh-soft)'; e.currentTarget.style.transform = 'translateY(0)'; } : undefined}
    >
      {/* Acento gradiente --focus -> --focus-cta (s99 · Sesion B) */}
      <div data-pace-spc-bar style={{ width: 3, height: 40, background: 'linear-gradient(180deg, var(--focus), var(--focus-cta))', borderRadius: 2, flexShrink: 0 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Eyebrow: contexto (Camino sugerido/favorito) + duracion aprox.
            SIEMPRE presente (antes se ocultaba en el caso sugerido simple). */}
        <div data-pace-spc-label style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 4 }}>{eyebrow}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span data-pace-spc-name style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 17, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.1 }}>{name}</span>
          {doneToday && (
            <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', padding: '2px 6px', border: '1px solid var(--line)', borderRadius: 'var(--r-pill)' }}>
              {t('path.card.done') || 'Hecho hoy'}
            </span>
          )}
        </div>
        <div data-pace-spc-tagline style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.2 }}>{tagline}</div>
        {/* Secuencia EN TEXTO (no solo iconos): explica que un Camino es una
            rutina guiada y de cuántos pasos, para cumplir el criterio de
            claridad sin depender de interpretar los iconos. Los iconos quedan
            como acento visual de la secuencia. */}
        <div data-pace-spc-steps style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span data-pace-spc-guided style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.2 }}>
            {(t('paths.suggested.guidedSteps') || 'Rutina guiada · {n} pasos').replace('{n}', pathObj.steps.length)}
          </span>
          <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
            {pathObj.steps.map(function(step, i) {
              const Icon = SPC_STEP_ICONS[step.kind] || null;
              return <span key={i} data-pace-spc-step style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, color: 'var(--ink-3)' }}>{Icon ? <Icon /> : null}</span>;
            })}
          </span>
        </div>
      </div>

      {!doneToday && (
        <button data-pace-spc-cta
          onClick={function(e) { e.stopPropagation(); onStart(); }}
          style={{ padding: '8px 16px', fontSize: 12, letterSpacing: '0.06em', fontFamily: 'var(--font-display)', fontStyle: 'italic', background: 'transparent', color: 'var(--focus-cta)', border: '1px solid var(--focus-cta)', borderRadius: 'var(--r-sm)', cursor: 'pointer', flexShrink: 0, transition: 'all var(--dur-quick) var(--ease)' }}
          onMouseEnter={function(e) { e.currentTarget.style.background = 'var(--focus-soft)'; }}
          onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; }}
        >
          {t('path.card.start') || 'Iniciar camino'}
        </button>
      )}
      {doneToday && (
        <span style={{ fontSize: 18, color: 'var(--focus)', flexShrink: 0, lineHeight: 1, fontFamily: 'var(--font-display)' }}>*</span>
      )}
    </div>
  );
}

function SuggestedPathCard() {
  const [state] = usePace();
  const { t } = useT();

  // Si ya hay camino activo, PathRunner lo gestiona
  if (state.paths && state.paths.current) return null;

  const todayISO = (typeof window.todayISO === 'function')
    ? window.todayISO() // local, no UTC (s105)
    : new Date().toISOString().slice(0, 10);

  // Camino sugerido por hora del dia
  const suggestedId = (typeof getSuggestedPath === 'function') ? getSuggestedPath() : null;
  const suggested = (suggestedId && typeof getPath === 'function') ? getPath(suggestedId) : null;

  // Favorito del usuario
  const favoriteId = state.paths && state.paths.favorite;
  const favorite = (favoriteId && typeof getPath === 'function') ? getPath(favoriteId) : null;

  // Si no hay ninguno, no renderizar
  if (!suggested && !favorite) return null;

  // Mostrar dual solo si el favorito es diferente del sugerido
  const showDual = favorite && suggested && favoriteId !== suggestedId;

  function isDoneToday(pathId) {
    const compl = state.paths && state.paths.completed && state.paths.completed[pathId];
    return !!(compl && compl.lastDoneAt === todayISO);
  }

  function handleStart(pathId) {
    if (typeof startPath === 'function') startPath(pathId);
  }

  function handleOpenLibrary() {
    window.dispatchEvent(new CustomEvent('pace:open-paths-library'));
  }

  return (
    <div data-pace-spc style={{ padding: '0 40px 12px', flexShrink: 0 }}>
      {/* Fila superior: cards (una o dos) */}
      {showDual ? (
        <div data-pace-spc-dual style={{ display: 'flex', gap: 10 }}>
          <PathMiniCard
            pathObj={favorite}
            label={t('paths.suggested.favorite') || 'Camino favorito'}
            doneToday={isDoneToday(favoriteId)}
            onStart={function() { handleStart(favoriteId); }}
          />
          <PathMiniCard
            pathObj={suggested}
            label={t('paths.suggested.label') || 'Camino sugerido'}
            doneToday={isDoneToday(suggestedId)}
            onStart={function() { handleStart(suggestedId); }}
          />
        </div>
      ) : (
        <PathMiniCard
          pathObj={favorite || suggested}
          label={favorite ? (t('paths.suggested.favorite') || 'Camino favorito') : (t('paths.suggested.label') || 'Camino sugerido')}
          doneToday={isDoneToday(favorite ? favoriteId : suggestedId)}
          onStart={function() { handleStart(favorite ? favoriteId : suggestedId); }}
        />
      )}

      {/* Enlace a la biblioteca de Caminos */}
      <div style={{ textAlign: 'right', marginTop: 6 }}>
        <button
          onClick={handleOpenLibrary}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-3)', fontFamily: 'var(--font-display)', fontStyle: 'italic', padding: '2px 0', textDecoration: 'underline', textUnderlineOffset: 3 }}
        >
          {t('paths.library.viewAll') || 'Ver caminos'}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { SuggestedPathCard });
