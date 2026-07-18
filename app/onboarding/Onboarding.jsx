/* PACE · Onboarding de primera vez (sesión 106 / v0.51.0)
   ============================================================
   Sustituye al WelcomeModal (s17): la bienvenida deja de ser un modal
   de una pantalla y pasa a un flujo full-screen de 5 pasos sobre las
   láminas de Caminos (arte D-4, s104):

     0. Bienvenida    — manifiesto + 3 valores (reusa welcome.* de ui.js).
     1-3. Preguntas   — necesidad / tiempo / entorno → state.profile.
     4. Primer Camino — pickFirstPath(profile); el CTA cierra a la HOME
        con ese Camino destacado (setLastViewedPath → getSuggestedPath #1).
        Decisión de sesión: sugerir, NO auto-arrancar el runner.

   MECÁNICA (hereda el contrato del WelcomeModal):
     - Se muestra una sola vez, cuando state.firstSeen == null; al cerrar
       por cualquier vía se fija firstSeen (bienvenida, no trámite).
     - Sin retraso de montaje: cubre la app entera desde el primer frame
       (el modal antiguo esperaba 1.2s; aquí sería un flash feo).
     - Cada pregunta se puede saltar (el campo queda null y pickFirstPath
       cae a getSuggestedPath). "prefiero saltarlo" en la bienvenida
       cierra el flujo entero.
     - Sin Escape ni backdrop-click: cerrar por accidente = perder la
       bienvenida para siempre. Salir es siempre un gesto explícito.
     - Re-abrir a mano (dev / curiosidad): evento `pace:open-onboarding`.

   Arte: raíz con data-pace-scene-card ("sobre el arte siempre es de
   día", s104) — en paleta oscura la tinta/papel/acentos se re-mapean a
   los valores crema dentro del flujo. Todo el motion es decorativo →
   el kill global de prefers-reduced-motion lo congela.
   ============================================================ */

const { useState: useStateONB, useEffect: useEffectONB } = React;

function Onboarding() {
  const [state, set] = usePace();
  const { t } = useT();
  const [open, setOpen] = useStateONB(() => state.firstSeen == null);
  const [step, setStep] = useStateONB(0);
  const [draft, setDraft] = useStateONB({ need: null, time: null, environment: null });
  const [freeText, setFreeText] = useStateONB('');
  const [picked, setPicked] = useStateONB(null);

  // Re-abrir a mano (dev / curiosidad) — mismo patrón que pace:open-support.
  useEffectONB(() => {
    const h = () => { setStep(0); setOpen(true); };
    window.addEventListener('pace:open-onboarding', h);
    return () => window.removeEventListener('pace:open-onboarding', h);
  }, []);

  if (!open) return null;

  const questions = window.ONBOARDING_QUESTIONS || [];
  const isQuestion = step >= 1 && step <= questions.length;
  const q = isQuestion ? questions[step - 1] : null;
  const isSummary = step === questions.length + 1;

  const pickedPath = (isSummary && picked && typeof getPath === 'function') ? getPath(picked) : null;
  const sceneId = step === 0 ? 'path.dawn'
    : isQuestion ? q.sceneId
    : (picked || 'path.dawn');

  /* La pregunta actual cuenta como respondida si eligió chip — o, en la
     de necesidad, si escribió algo en el campo libre. */
  const answered = isQuestion &&
    (!!draft[q.field] || (q.free && freeText.trim().length > 0));

  const back = () => setStep(s => Math.max(s - 1, 0));
  const next = () => {
    if (step === questions.length) {
      /* El pick se congela al ENTRAR al resumen (no en render): así no
         puede cambiar bajo el usuario si un re-render cruza un límite
         horario de getSuggestedPath. */
      setPicked(typeof pickFirstPath === 'function' ? pickFirstPath(draft) : null);
    }
    setStep(s => s + 1);
  };

  const finish = (opts) => {
    const now = Date.now();
    const patch = {
      firstSeen: now,
      /* completedAt = "el flujo se cerró"; los campos null significan
         pregunta saltada (pickFirstPath ya lo contempla). */
      profile: { ...draft, completedAt: now },
    };
    const trimmed = freeText.trim();
    if (trimmed) patch.intention = trimmed.slice(0, 120); // cap defensivo (s17)
    set(patch);
    if (opts && opts.pick && picked && typeof setLastViewedPath === 'function') {
      /* La home destaca el Camino elegido: lastViewed es la prioridad #1
         de getSuggestedPath ("la preferencia del usuario manda", s78).
         El scoring perfil→Camino de verdad es s107. */
      setLastViewedPath(picked);
    }
    setOpen(false);
  };

  const toggleLang = () => set({ lang: state.lang === 'es' ? 'en' : 'es' });

  return (
    <div
      data-pace-scene-card=""
      role="dialog"
      aria-modal="true"
      aria-label={t('welcome.greeting')}
      style={onboardingStyles.root}
    >
      <OnbScene pathId={sceneId} />

      {/* Chrome superior: atrás · progreso · ES·EN */}
      <div style={onboardingStyles.header}>
        <div style={{ width: 86, display: 'flex' }}>
          {step > 0 && (
            <button onClick={back} style={onboardingStyles.ghostBtn}>
              ← {t('onboarding.back')}
            </button>
          )}
        </div>
        {isQuestion ? <OnbDots total={questions.length} active={step - 1} /> : <span />}
        <div style={{ width: 86, display: 'flex', justifyContent: 'flex-end' }}>
          {step === 0 && (
            <button
              onClick={toggleLang}
              title={t(state.lang === 'es' ? 'welcome.lang.toggle.toEn' : 'welcome.lang.toggle.toEs')}
              style={onboardingStyles.langToggle}
            >
              <span style={{ fontWeight: state.lang === 'es' ? 600 : 400 }}>ES</span>
              <span style={{ color: 'var(--line-2)' }}> · </span>
              <span style={{ fontWeight: state.lang === 'en' ? 600 : 400 }}>EN</span>
            </button>
          )}
        </div>
      </div>

      {/* Contenido — key={step} remonta la columna y re-dispara el reveal
          escalonado (pace-reveal-rise, tokens.css). margin:auto centra Y
          permite scroll sin recortar por arriba si no cabe. */}
      <div style={onboardingStyles.scroll}>
        <div key={step} data-pace-reveal style={onboardingStyles.column}>

          {/* ---------- 0 · BIENVENIDA ---------- */}
          {step === 0 && (
            <React.Fragment>
              <OnbLogo />
              <h1 style={onboardingStyles.title}>
                {t('welcome.tagline')}{' '}
                <span style={{ color: 'var(--ink-3)' }}>{t('welcome.tagline.sub')}</span>
              </h1>
              <p style={onboardingStyles.lede}>{t('welcome.lede')}</p>
              <div style={onboardingStyles.valuesPlate}>
                {['local', 'accounts', 'free'].map((k) => (
                  <div key={k} style={{ flex: 1, padding: '0 6px' }}>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontStyle: 'italic',
                      fontSize: 14, color: 'var(--ink)', lineHeight: 1.15,
                    }}>{t('welcome.value.' + k + '.label')}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 3 }}>
                      {t('welcome.value.' + k + '.sub')}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pace-meta" style={{ marginTop: 2 }}>
                {t('onboarding.welcome.hint')}
              </div>
              <button data-pace-cta onClick={next} style={onboardingStyles.cta}>
                {t('onboarding.welcome.cta')}
              </button>
              <button onClick={() => finish({ pick: false })} style={onboardingStyles.ghostBtn}>
                {t('onboarding.skip')}
              </button>
            </React.Fragment>
          )}

          {/* ---------- 1-3 · PREGUNTAS ---------- */}
          {isQuestion && (
            <React.Fragment>
              <div className="pace-meta">{t(q.kickerKey)}</div>
              <h2 style={onboardingStyles.title}>{t(q.titleKey)}</h2>
              <div role="radiogroup" aria-label={t(q.titleKey)} style={onboardingStyles.options}>
                {q.options.map((o) => (
                  <OnbChoice
                    key={o.value}
                    label={t(o.labelKey)}
                    sub={t(o.subKey)}
                    accent={o.accent}
                    selected={draft[q.field] === o.value}
                    onSelect={() => setDraft(d => ({ ...d, [q.field]: o.value }))}
                  />
                ))}
              </div>
              {q.free && (
                <div style={onboardingStyles.freeBlock}>
                  <label htmlFor="pace-onb-free" style={onboardingStyles.freeLabel}>
                    {t('onboarding.need.free.label')}
                    <span style={onboardingStyles.freeOptional}>
                      {t('onboarding.need.free.optional')}
                    </span>
                  </label>
                  <input
                    id="pace-onb-free"
                    type="text"
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && answered) next(); }}
                    placeholder={t('onboarding.need.free.placeholder')}
                    maxLength={120}
                    style={onboardingStyles.freeInput}
                  />
                </div>
              )}
              {/* Deshabilitado = contorno neutro (NO opacity: el fill de
                  pace-reveal-rise en los hijos del reveal termina en
                  opacity:1 y le gana al inline — hallazgo s106). */}
              <button
                data-pace-cta
                onClick={next}
                disabled={!answered}
                style={{
                  ...onboardingStyles.cta,
                  ...(answered ? null : onboardingStyles.ctaDisabled),
                }}
              >
                {t('onboarding.next')}
              </button>
              {!answered && (
                <button onClick={next} style={onboardingStyles.ghostBtn}>
                  {t('onboarding.skip.question')}
                </button>
              )}
            </React.Fragment>
          )}

          {/* ---------- 4 · TU PRIMER CAMINO ---------- */}
          {isSummary && (
            <React.Fragment>
              <div className="pace-meta">{t('onboarding.first.kicker')}</div>
              <p style={onboardingStyles.lede}>{t('onboarding.first.lede')}</p>
              <h2 style={onboardingStyles.pathName}>
                {pickedPath ? (t(pickedPath.nameKey) || picked) : ''}
              </h2>
              {pickedPath && t(pickedPath.taglineKey) ? (
                <p style={onboardingStyles.tagline}>{t(pickedPath.taglineKey)}</p>
              ) : null}
              {pickedPath && (
                <div style={onboardingStyles.kindsPlate}>
                  {pickedPath.steps
                    .map((s) => t('paths.kind.' + s.kind + '.name') || s.kind)
                    .join(' · ')}
                </div>
              )}
              <button data-pace-cta onClick={() => finish({ pick: true })} style={onboardingStyles.cta}>
                {t('onboarding.first.cta')}
              </button>
              <button onClick={() => finish({ pick: false })} style={onboardingStyles.ghostBtn}>
                {t('onboarding.first.explore')}
              </button>
            </React.Fragment>
          )}

        </div>
      </div>
    </div>
  );
}

/* Estilos — nombre único según regla CLAUDE.md. */
const onboardingStyles = {
  root: {
    position: 'fixed', inset: 0, zIndex: 120,
    /* Sobre los modales (100), bajo UpdatePrompt (150) y Toast (200). */
    background: 'var(--paper)',
    color: 'var(--ink)',
    display: 'flex', flexDirection: 'column',
    isolation: 'isolate',
    overflow: 'hidden',
    animation: 'pace-fade-in 320ms ease',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', flexShrink: 0, minHeight: 56,
  },
  scroll: {
    flex: 1, overflowY: 'auto', display: 'flex',
    padding: '0 24px',
  },
  column: {
    margin: 'auto', width: '100%', maxWidth: 460,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    /* paddingBottom 30 → 16 (s112): la pregunta 1 (4 chips + campo libre +
       CTA + saltar) desbordaba ~35px en 360×640; junto al ajuste de chips
       (OnbChoice) vuelve a caber sin scroll. */
    gap: 16, textAlign: 'center', padding: '8px 0 16px',
  },
  title: {
    fontFamily: 'var(--font-display)', fontStyle: 'italic',
    fontSize: 'clamp(28px, 5.4vw, 38px)', fontWeight: 500,
    lineHeight: 1.12, margin: 0, color: 'var(--ink)',
    /* Halo de papel sobre el arte (mismo recurso que el runner s104). */
    textShadow: '0 0 22px var(--paper), 0 0 10px var(--paper)',
  },
  lede: {
    fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)',
    margin: 0, maxWidth: 400,
    textShadow: '0 0 16px var(--paper), 0 0 8px var(--paper)',
  },
  valuesPlate: {
    display: 'flex', alignItems: 'center', width: '100%',
    padding: '12px 10px',
    background: 'rgba(242,237,224,0.82)',
    border: '1px solid rgba(184,173,142,0.5)',
    borderRadius: 'var(--r-md)',
    backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
  },
  options: {
    display: 'flex', flexDirection: 'column', gap: 8,
    width: '100%', marginTop: 4,
  },
  freeBlock: {
    display: 'flex', flexDirection: 'column', gap: 6,
    width: '100%', marginTop: 2,
  },
  freeLabel: {
    fontFamily: 'var(--font-display)', fontStyle: 'italic',
    fontSize: 13, color: 'var(--ink)',
    display: 'flex', alignItems: 'baseline',
    justifyContent: 'space-between', gap: 8,
  },
  freeOptional: {
    fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em',
    textTransform: 'uppercase', fontStyle: 'normal',
  },
  freeInput: {
    width: '100%', padding: '10px 14px', fontSize: 14,
    fontFamily: 'var(--font-display)', fontStyle: 'italic',
    color: 'var(--ink)',
    background: 'rgba(242,237,224,0.82)',
    border: '1px solid rgba(184,173,142,0.6)',
    borderRadius: 'var(--r-md)', outline: 'none',
    backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
    boxSizing: 'border-box',
  },
  pathName: {
    fontFamily: 'var(--font-display)', fontStyle: 'italic',
    fontSize: 'clamp(38px, 7vw, 54px)', fontWeight: 500,
    lineHeight: 1.08, margin: 0, color: 'var(--ink)',
    textShadow: '0 0 24px var(--paper), 0 0 10px var(--paper)',
  },
  tagline: {
    fontFamily: 'var(--font-display)', fontStyle: 'italic',
    fontSize: 16, color: 'var(--ink-2)', margin: 0,
    textShadow: '0 0 16px var(--paper), 0 0 8px var(--paper)',
  },
  kindsPlate: {
    fontFamily: 'var(--font-display)', fontStyle: 'italic',
    fontSize: 14, color: 'var(--ink-2)',
    padding: '9px 20px',
    background: 'rgba(242,237,224,0.82)',
    border: '1px solid rgba(184,173,142,0.5)',
    borderRadius: 'var(--r-pill)',
    backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
  },
  cta: {
    marginTop: 6,
    padding: '13px 44px', borderRadius: 'var(--r-pill)',
    background: 'var(--focus-cta)', border: '1px solid var(--focus-cta)',
    color: 'var(--paper)', cursor: 'pointer',
    fontSize: 13, letterSpacing: '0.12em',
    fontFamily: 'var(--font-ui)',
    transition: 'all 180ms var(--ease)',
  },
  ctaDisabled: {
    background: 'rgba(242,237,224,0.6)',
    border: '1px solid var(--line-2)',
    color: 'var(--ink-3)',
    cursor: 'not-allowed',
  },
  ghostBtn: {
    fontFamily: 'var(--font-display)', fontStyle: 'italic',
    fontSize: 12.5, color: 'var(--ink-3)',
    background: 'transparent', border: 'none',
    padding: '4px 10px', cursor: 'pointer',
    textShadow: '0 0 14px var(--paper), 0 0 6px var(--paper)',
  },
  langToggle: {
    padding: '3px 8px', fontSize: 10, letterSpacing: '0.08em',
    color: 'var(--ink-3)',
    background: 'rgba(242,237,224,0.82)',
    border: '1px solid rgba(184,173,142,0.5)',
    borderRadius: 'var(--r-pill)', cursor: 'pointer',
    fontFamily: 'var(--font-ui)', lineHeight: 1.6,
  },
};

Object.assign(window, { Onboarding });
