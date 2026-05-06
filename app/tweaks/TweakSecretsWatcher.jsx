/* PACE · TweakSecretsWatcher
   ============================================================
   Detectores de secretos ligados a tweaks (palette, font, logo).
   Extraído de TweaksPanel.jsx en sesión 41 para mantener ambos
   archivos bajo el límite de 500 líneas.

   Monta siempre (en main.jsx) para que los secretos se disparen
   al cambiar un tweak desde Ajustes O por import JSON — no solo
   cuando el panel está abierto.
   ============================================================ */

const { useEffect: useEffectSW } = React;

/* Días en paleta oscura — clave independiente de pace.state.v2.
   Solo alimenta secret.dark.mode; no engordar el state principal. */
const DARK_DAYS_KEY = 'pace.darkDays.v1';

function TweakSecretsWatcher() {
  const [state] = usePace();

  // secret.aged — paleta 'envejecido' activa.
  useEffectSW(() => {
    if (state.palette === 'envejecido') unlockAchievement('secret.aged');
  }, [state.palette]);

  /* secret.mono — el Tweak de tipografía se retiró en sesión 20.
     Sigue escuchando por si el valor llega vía import JSON o devtools. */
  useEffectSW(() => {
    if (state.font === 'mono') unlockAchievement('secret.mono');
  }, [state.font]);

  /* Logros de logoVariant — conservados por compat / easter eggs futuros. */
  useEffectSW(() => {
    if (state.logoVariant === 'sello') unlockAchievement('secret.seal');
    if (state.logoVariant === 'ilustrado') unlockAchievement('secret.illustrated');
  }, [state.logoVariant]);

  /* secret.dark.mode — "7 días en oscuro" (días de calendario distintos,
     no necesariamente consecutivos). Cap de 30 fechas. */
  useEffectSW(() => {
    if (state.palette !== 'oscuro') return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const raw = localStorage.getItem(DARK_DAYS_KEY);
      let days;
      try { days = new Set(JSON.parse(raw || '[]')); } catch (e) { days = new Set(); }
      if (!days.has(today)) {
        days.add(today);
        const arr = Array.from(days).slice(-30);
        localStorage.setItem(DARK_DAYS_KEY, JSON.stringify(arr));
        if (arr.length >= 7) unlockAchievement('secret.dark.mode');
      } else if (days.size >= 7) {
        unlockAchievement('secret.dark.mode');
      }
    } catch (e) { /* silencioso */ }
  }, [state.palette]);

  return null;
}

Object.assign(window, { TweakSecretsWatcher });
