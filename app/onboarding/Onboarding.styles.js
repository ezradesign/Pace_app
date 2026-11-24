/* PACE · Onboarding.styles.js — LOS ESTILOS DE LA BIENVENIDA
   ==========================================================
   Los de Onboarding.jsx y del último paso (OnboardingCompleto.jsx), movidos tal cual al tocar
   Onboarding.jsx las 500 líneas de §1 (auditoría del 24 nov. 2026, H8A de Ez). Nombre único, como
   pide CLAUDE.md; `var` a propósito: un `const` top-level no cruza la IIFE del artefacto. Carga antes
   que OnboardingCompleto.jsx y Onboarding.jsx, que los leen al pintar. */

var onboardingStyles = {
  root: {
    position: 'fixed', inset: 0, zIndex: 120,
    /* Sobre los modales (100), bajo UpdatePrompt (150) y Toast (200). */
    background: 'var(--paper)',
    color: 'var(--ink)',
    display: 'flex', flexDirection: 'column',
    isolation: 'isolate',
    overflow: 'hidden',
    /* SIN FUNDIDO EN LA RAÍZ (Ez, 1A del 23 nov. 2026): con él, el papel entraba de 0 a 1 en 320 ms
       y quien abría PACE por primera vez veía debajo las actividades y «¿Cuánto trabajas hoy?». El
       papel tapa la home desde el primer cuadro; lo que entra con calma es el texto (data-pace-reveal). */
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
    /* Sin aro: el foco que recibe al cambiar de paso lo pone la app, no la persona (la regla
       de los contenedores de s198, DESIGN_SYSTEM.md). */
    outline: 'none',
    /* Halo de papel sobre el arte (mismo recurso que el runner s104). */
    textShadow: '0 0 22px var(--paper), 0 0 10px var(--paper)',
  },
  lede: {
    fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)',
    margin: 0, maxWidth: 400,
    textShadow: '0 0 16px var(--paper), 0 0 8px var(--paper)',
  },
  valuesPlate: {
    /* stretch, no center: las tres columnas comparten alto y sus subs se
       alinean solas aunque un label envuelva (s151). */
    display: 'flex', alignItems: 'stretch', width: '100%',
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
    lineHeight: 1.08, margin: 0, color: 'var(--ink)', outline: 'none',
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

Object.assign(window, { onboardingStyles: onboardingStyles });
