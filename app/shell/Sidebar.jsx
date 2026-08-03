/* PACE · Sidebar izquierdo — colapsable
   Secciones: Ritmo (racha), Sendero (línea del día con hitos), Logros.
   Footer: StatusBar con botón destacado Donar café.

   TROCEADO EN s148 (llegó a 570 ln; el límite de CLAUDE.md es 500). Este
   archivo queda como ORQUESTADOR: compone las secciones y no dibuja
   ninguna por dentro. Lo demás vive en dos hermanos, con el mismo patrón
   que Foco (`FocusTimer` + `.support` + `.parts`):

     · `Sidebar.support.jsx` → hoja responsive inyectada + `sidebarStyles`
                               (que viaja por window: leer su cabecera)
     · `Sidebar.parts.jsx`   → SenderoDelDia · WeekDots · AchievementsPreview
                               · achMini · StatusBar · ChevronLeftIcon

   Los dos cargan ANTES que este archivo en PACE.html.

   Historial de lo eliminado (no revivir sin justificación de producto):
     - "Plan" del día — v0.11.2 (redundante con ActivityBar).
     - "Recordatorios" — v0.11.3 (no cabía sin scroll en 1920×1080).
     - "Intención" — v0.12.1 (aporta poco valor; la misma pregunta se
       hace al usuario nuevo en la bienvenida — hoy el onboarding s106,
       antes el WelcomeModal — que la guarda en `state.intention`.
       Quitarla libera espacio vertical y deja que el botón de Donar
       gane prominencia en el footer).

   RESPONSIVE (sesión 22 · v0.12.5):
     En ≤768px el sidebar se desacopla y pasa a ser un drawer
     fullscreen por encima del main (position:fixed; inset:0;
     width:100vw). El bug previo era width:280px que dejaba un
     trozo del main visible a la derecha en móvil. Ahora el main
     sigue ocupando 100vw debajo pero el sidebar lo tapa entero
     cuando se abre. Se añade un chevron grande (hit target
     ≥44px) en esquina superior derecha para cerrar. Las reglas
     viven en `Sidebar.support.jsx`.
*/

function Sidebar() {
  const [state, set] = usePace();
  const { t, tn } = useT();

  const collapsed = !!state.sidebarCollapsed;
  const unlockedCount = Object.keys(state.achievements || {}).length;
  /* B1: total real del catalogo (106), no el 100 hardcodeado de s12. */
  /* §15.4 · denominador ÚNICO, compartido con el modal (`catalog.js`). Antes
     esto era `ACHIEVEMENT_CATALOG.length` y contaba los que NO tienen detector:
     la sidebar dividía entre 96 y el modal entre 88, y el «por descubrir»
     prometía 8 que nadie puede ganar. */
  const totalAchievements = window.ACHIEVEMENTS_AVAILABLE
    || (window.ACHIEVEMENT_CATALOG || []).length;
  const isMob = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;

  const toggle = () => set({ sidebarCollapsed: !collapsed });

  /* Colapsado → ocultar TOTALMENTE.
     La re-expansión se hace con un botón flotante que renderiza <PaceApp/>.
     (Antes era un rail de 56px con iconos; se quitó por petición del usuario
     para tener pantalla limpia como la referencia del 2026-04-22 / sesión 9.) */
  if (collapsed) return null;

  return (
    <aside style={sidebarStyles.root} data-pace-sidebar>
      {/* ============================================================
          BARRA HORIZONTAL SUPERIOR · logo
          ------------------------------------------------------------
          v0.11.7 / sesión 12 · Reestructurado por petición del usuario:
          - Logo ampliado ~2.5× ocupando toda la franja horizontal.
          - Chevron de colapsar extraído a un botón flotante en la
            esquina superior-derecha del sidebar.
          v0.28.2 / sesión 61 · Eliminado el bloque de contadores
          (pomodoros / rondas / racha) que vivía bajo el logo: aportaba
          poco y comprimía las secciones. Sin contadores el sidebar
          respira más y, en móvil, evita scroll vertical. Los iconos
          (Pomodoro/Rounds/Flame) se eliminan con su sección.
          El área del logo sigue siendo clicable para el easter egg
          "vaca feliz" (10 clicks → secret.cow.click).
          ============================================================ */}
      <button onClick={toggle} style={sidebarStyles.toggleFloating} data-pace-sidebar-toggle title={t('sidebar.collapse.title')} aria-label={t('sidebar.collapse.aria')}>
        <ChevronLeftIcon />
      </button>
      <div style={sidebarStyles.logoBar} data-pace-sidebar-logobar>
        <div
          style={{ ...sidebarStyles.logo, cursor: 'pointer' }}
          data-pace-sidebar-logo
          onClick={() => window.dispatchEvent(new CustomEvent('pace:cow-click'))}
          title={t('sidebar.logo.title')}
        >
          <PaceWordmark variant={state.logoVariant} color="var(--ink)" />
        </div>
      </div>

      <Divider style={{ margin: isMob ? '8px 0 10px' : '14px 0 16px' }} />

      {/* RITMO / RACHA */}
      <div style={sidebarStyles.section}>
        <div style={{ ...sidebarStyles.sectionHeader, marginBottom: isMob ? 6 : 10 }}>
          <Meta>{t('sidebar.section.rhythm')}</Meta>
          <span style={sidebarStyles.sectionAside}>{state.streak.longest}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ ...sidebarStyles.streakNum, fontSize: isMob ? 32 : 44 }}>{state.streak.current}</span>
          <div>
            <div style={sidebarStyles.streakLabel}>{state.streak.current === 1 ? t('sidebar.streak.day') : t('sidebar.streak.days')}</div>
            <div style={sidebarStyles.streakSub}>{tn('sidebar.streak.best', { n: state.streak.longest })}</div>
          </div>
        </div>
        <WeekDots weeklyStats={state.weeklyStats} compact={isMob} />
      </div>

      <Divider style={{ margin: isMob ? '8px 0 10px' : '16px 0 14px' }} />

      {/* SENDERO — el día como camino con hitos */}
      <div style={sidebarStyles.section}>
        <SenderoDelDia state={state} compact={isMob} />
      </div>

      <Divider style={{ margin: isMob ? '8px 0 10px' : '16px 0 14px' }} />

      {/* LOGROS */}
      <div style={sidebarStyles.section}>
        <div style={{ ...sidebarStyles.sectionHeader, marginBottom: isMob ? 6 : 10 }}>
          <Meta>{t('sidebar.section.achievements')}</Meta>
          <span style={sidebarStyles.sectionAside}>{unlockedCount}/{totalAchievements}</span>
        </div>
        <AchievementsPreview onOpen={() => window.dispatchEvent(new CustomEvent('pace:open-achievements'))} />
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('pace:open-achievements'))}
          style={sidebarStyles.linkBtn}
        >
          {tn('sidebar.achievements.discover', { n: Math.max(0, totalAchievements - unlockedCount) })}
        </button>
      </div>

      <div data-pace-sidebar-spacer style={{ flex: 1 }} />

      {/* STATUS BAR INFERIOR */}
      <StatusBar compact={isMob} />
    </aside>
  );
}

Object.assign(window, { Sidebar });
