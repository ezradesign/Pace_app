/* PACE · Tweaks — superficie premium display-only
   Creada en sesión 88 (F3b, v0.34.4) dentro de TweaksPanel; extraída a
   archivo propio en sesión 89 (v0.34.5) para devolver el panel a <500 ln.

   Sello + input de licencia SIN validación + copy honesto. No desbloquea
   nada: premiumUnlocked sigue false. La validación de clave firmada
   offline llega post-v1.0. Reusa PremiumSeal (Primitives).
*/

function PremiumSection() {
  const { t } = useT();
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ marginBottom: 8 }}>
        <PremiumSeal />
      </div>
      <div style={{ ...displayItalic, fontSize: 16, fontWeight: 500, marginBottom: 6 }}>{t('premium.tweaks.title')}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 10, letterSpacing: 0.1 }}>{t('premium.tweaks.body')}</div>
      <input
        type="text"
        disabled
        placeholder={t('premium.tweaks.placeholder')}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '8px 10px', fontSize: 11,
          color: 'var(--ink-2)', background: 'var(--paper-2)',
          border: '1px solid var(--line)', borderRadius: 'var(--r-sm)',
          letterSpacing: 0.2, marginBottom: 6, cursor: 'not-allowed',
        }}
      />
      <button
        disabled
        style={{
          width: '100%', padding: '8px', fontSize: 11, fontWeight: 500,
          color: 'var(--premium)', background: 'var(--premium-soft)',
          border: '1px solid var(--premium)', borderRadius: 'var(--r-sm)',
          letterSpacing: 0.2, cursor: 'not-allowed',
        }}
      >{t('premium.tweaks.cta')}</button>
      <div style={{ fontSize: 10, color: 'var(--ink-3)', lineHeight: 1.4, letterSpacing: 0.1, marginTop: 6 }}>
        {t('premium.tweaks.note')}
      </div>
    </div>
  );
}

Object.assign(window, { PremiumSection });
