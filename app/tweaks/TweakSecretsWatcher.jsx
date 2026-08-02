/* PACE · TweakSecretsWatcher
   ============================================================
   Detectores de secretos ligados a tweaks (palette, font, logo).
   Extraído de TweaksPanel.jsx en sesión 41 para mantener ambos
   archivos bajo el límite de 500 líneas.

   Monta siempre (en main.jsx) para que los secretos se disparen
   al cambiar un tweak desde Ajustes O por import JSON — no solo
   cuando el panel está abierto.
   ============================================================ */

const { useEffect: useEffectSW, useRef: useRefSW } = React;

/* Días en paleta oscura — clave independiente de pace.state.v2.
   Solo alimenta secret.dark.mode; no engordar el state principal. */
const DARK_DAYS_KEY = 'pace.darkDays.v1';

function TweakSecretsWatcher() {
  const [state] = usePace();

  // secret.aged — paleta 'envejecido' activa.
  useEffectSW(() => {
    /* s146b — `secret.aged` SALIO del catalogo: la paleta 'envejecido' se
       retiró de Ajustes en s71 y `loadState` la migra a 'crema', así que nadie
       podía llegar aquí. Mismo caso que `secret.mono` (tipografía sin control
       desde s20) y `secret.seal`/`secret.illustrated` (`logoVariant` retirado
       de Tweaks). El detector se queda A PROPÓSITO: si algún día vuelve la
       opción, devolver el logro al catálogo es una línea y esto ya funciona.
       Llamar a `unlockAchievement` con un id fuera del catálogo es inofensivo
       —la UI solo pinta lo que está en él—, igual que los ids de apnea de s107. */
    if (state.palette === 'envejecido') unlockAchievement('secret.aged');
  }, [state.palette]);

  /* secret.mono — el Tweak de tipografía se retiró en sesión 20.
     Sigue escuchando por si el valor llega vía import JSON o devtools. */
  useEffectSW(() => {
    if (state.font === 'mono') unlockAchievement('secret.mono');
  }, [state.font]);

  /* secret.bilingual (B1, sustituto de apnea) — usar la app en los dos
     idiomas: cualquier cambio de idioma tras el montaje implica haber
     estado en ambos. El primer render solo siembra la referencia. */
  /* s139 — guard del modo AUTO. El logro premia haber USADO la app en los dos
     idiomas, que es un gesto deliberado; en Auto el idioma lo elige el sistema,
     no la persona. Sin este guard, elegir «Auto» estando en el idioma contrario
     al del sistema cambiaría `state.lang` y regalaría el secreto por tocar un
     ajuste. Los arranques en Auto ya son inofensivos por otra vía (se resuelven
     en `loadState`, antes de montar, así que `prevLangRef` nace con el valor
     final). Casos que SÍ siguen contando: es↔en explícitos, y salir de Auto
     eligiendo el otro idioma a mano —ahí `langAuto` ya es false—. */
  const prevLangRef = useRefSW(null);
  useEffectSW(() => {
    const prev = prevLangRef.current;
    prevLangRef.current = state.lang;
    if (prev != null && prev !== state.lang && state.langAuto !== true) {
      unlockAchievement('secret.bilingual');
    }
  }, [state.lang]);

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
      const today = toISODate(new Date()); // local, no UTC (s105)
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
