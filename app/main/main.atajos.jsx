/* PACE · main · LOS ATAJOS DEL ROOT — sacados de main.jsx (auditoría del 24 nov. 2026, H8A de Ez)
   ===================================================================================
   Dos efectos de PaceApp que solo tocan sus setters, movidos tal cual al tocar main.jsx las 500 líneas
   de §1: los enlaces de los atajos de la PWA (?go=…) y las teclas T, S y L. Con dependencias `[]`
   capturan lo del primer render, igual que cuando vivían en main.jsx: setters de useState, estables,
   y `abrirBiblioteca`, que solo cierra sobre setters. */

const { useEffect: useEffectAtajos } = React;

/* abrirBiblioteca(kind) · abrirAgua() */
function usePaceIrA(abrirBiblioteca, abrirAgua) {
  // Deep links de shortcuts PWA (s102): /?go=focus|breathe|move|stretch|hydrate abre
  // el módulo al arrancar (manifest.webmanifest → shortcuts). Se consume una
  // sola vez y se limpia la URL (replaceState) para que recargar no
  // re-dispare. 'focus' solo asegura el modo foco: el home YA es el Pomodoro
  // y auto-arrancar un timer sin gesto sería una sorpresa, no una ayuda. Y lo pide a la barra de
  // arriba (TopBar.jsx), que con una pausa empezada pregunta antes de cortarla, como su pestaña.
  /* Y los atajos del icono en las apps (Ez, L7A del 25 nov. 2026): llegan como `pace://go/…`
     (app/ui/nativo.atajos.js), en frío o con PACE ya abierta, y abren lo mismo. */
  useEffectAtajos(() => {
    const irA = (go) => {
      if (go === 'breathe' || go === 'move' || go === 'stretch') abrirBiblioteca(go === 'stretch' ? 'extra' : go);   // Estira es 'extra' (ids cruzados)
      else if (go === 'hydrate') abrirAgua();
      else if (go === 'focus') paceAtajoFoco();
    };
    let go = null;
    try { go = new URLSearchParams(window.location.search).get('go'); } catch (e) {}
    if (go) {
      irA(go);
      try { window.history.replaceState(null, '', window.location.pathname); } catch (e) {}
    }
    return typeof paceNativoAtajos === 'function' ? paceNativoAtajos(irA) : undefined;
  }, []);

}

/* Los tres conmutadores de useState: Ajustes, Estadísticas y Logros. */
function usePaceTeclas(setOpenTweaks, setOpenStats, setOpenAchievements) {
  // Atajos de teclado: T toggle Tweaks, S toggle Stats, L toggle Logros.
  // Ignora cuando focus esta en INPUT/TEXTAREA para no interferir con campos.
  /* s198: y con Ctrl/Cmd/Alt (Ctrl+S abria Estadisticas ademas de «Guardar
     como»), en un SELECT o un contenteditable, y con una SESION o una pantalla
     completa delante (onboarding, Caminos): una «s» en mitad de una respiracion
     abria Estadisticas encima, y el Escape siguiente se llevaba la sesion. */
  useEffectAtajos(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing || e.defaultPrevented) return;
      const tg = e.target || {};
      if (tg.isContentEditable || tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.tagName === 'SELECT') return;
      if (document.querySelector('[data-pace-session-root], [aria-modal="true"]:not([data-pace-modal-card])')) return;
      if (e.key === 't' || e.key === 'T') setOpenTweaks(o => !o);
      if (e.key === 's' || e.key === 'S') setOpenStats(o => !o);
      if (e.key === 'l' || e.key === 'L') setOpenAchievements(o => !o);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

}

Object.assign(window, { usePaceIrA, usePaceTeclas });
