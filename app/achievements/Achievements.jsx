/* PACE · Achievements · sesión 83 / v0.33.3
   Modal de catálogo + componente Seal.

   Tras s83 este archivo es SOLO UI. Los datos viven en archivos hermanos:
   - app/glyphs/achievement-glyphs.jsx  →  window.ACHIEVEMENT_GLYPHS (s83)
   - app/achievements/catalog.js        →  window.ACHIEVEMENT_CATALOG,
                                            window.CAT_META,
                                            window.IMPLEMENTED_ACHIEVEMENTS

   Orden de carga en PACE.html (linea ~169): glifos → catalogo → este archivo. */
const ACHIEVEMENT_CATALOG = window.ACHIEVEMENT_CATALOG || [];
const CAT_META = window.CAT_META || {};
const IMPLEMENTED_ACHIEVEMENTS = window.IMPLEMENTED_ACHIEVEMENTS || new Set();

/* Renderiza el glifo de un logro. Si tiene glyphSvg (Constelaciones), lo inyecta
   via dangerouslySetInnerHTML. Fallback: glyph unicode en italic. El wrapper hereda
   currentColor del contenedor padre, así el mismo SVG funciona en cualquier paleta. */
function renderGlyph(a, style) {
  if (a.glyphSvg) {
    return (
      <span
        style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%', ...style }}
        dangerouslySetInnerHTML={{ __html: a.glyphSvg }}
      />
    );
  }
  return <span style={{ fontStyle: 'italic', ...style }}>{a.glyph}</span>;
}

function isImplemented(a) {
  // Los secretos siempre se pintan como secretos (revelen o no).
  // El estado "Pronto" es para logros visibles no-secretos sin trigger.
  return a.secret || IMPLEMENTED_ACHIEVEMENTS.has(a.id);
}

function Achievements({ open, onClose }) {
  const [state] = usePace();
  const { t } = useT();
  const unlocked = state.achievements || {};
  const unlockedCount = Object.keys(unlocked).length;
  // Clasificación sesión 15: disponibles = con trigger hoy; próximamente = sin trigger.
  // Los secretos se cuentan como disponibles (su mecánica es "intriga", no "pronto").
  const availableCount = ACHIEVEMENT_CATALOG.filter(isImplemented).length;
  const comingSoonCount = ACHIEVEMENT_CATALOG.length - availableCount;

  return (
    <Modal open={open} onClose={onClose} tagLabel={t('ach.tag')} title={t('ach.title')} subtitle={t('ach.subtitle')} maxWidth={920}>
      {/* Counter */}
      <div style={{ display: 'flex', gap: 20, margin: '8px 0 24px', padding: '16px 20px', background: 'var(--paper-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)' }}>
        <div>
          <div style={{ ...displayItalic, fontSize: 36, fontWeight: 500, lineHeight: 1 }}>
            {unlockedCount}<span style={{ color: 'var(--ink-3)', fontSize: 20 }}> / {availableCount}</span>
          </div>
          <Meta style={{ marginTop: 4 }}>{t('ach.available')}</Meta>
        </div>
        <Divider style={{ width: 1, height: 'auto', background: 'var(--line)' }} />
        <div>
          <div style={{ ...displayItalic, fontSize: 36, fontWeight: 500, lineHeight: 1 }}>
            {comingSoonCount}
          </div>
          <Meta style={{ marginTop: 4 }}>{t('ach.coming.soon')}</Meta>
        </div>
      </div>

      {Object.entries(CAT_META).map(([cat, meta]) => {
        const items = ACHIEVEMENT_CATALOG.filter(a => a.cat === cat);
        const gotThisCat = items.filter(a => unlocked[a.id]).length;
        return (
          <div key={cat} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <h3 style={{ ...displayItalic, fontSize: 22, margin: 0, fontWeight: 500, color: meta.color }}>{t(meta.labelKey)}</h3>
              <Meta>{gotThisCat} / {items.length}</Meta>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: 12 }}>
              {items.map(a => (
                <Seal
                  key={a.id}
                  achievement={a}
                  unlocked={!!unlocked[a.id]}
                  implemented={isImplemented(a)}
                  color={meta.color}
                />
              ))}
            </div>
          </div>
        );
      })}
    </Modal>
  );
}

/* Tres estados del sello:
   1. unlocked         → borde color sólido, opacidad 1, descripción visible.
   2. locked           → borde dashed gris, opacidad 0.55, descripción visible
                         (guía al usuario: "esto se puede cazar").
   3. comingSoon       → borde dotted gris, opacidad 0.38, glifo opaco 0.25,
                         descripción sustituida por "Pronto" (crea curiosidad
                         sin ser opaco). Badge "Pronto" en esquina.
   Los secretos no-desbloqueados saltan siempre a modo secreto (glifo ?,
   título "Secreto") — su mecánica es intriga, no señalización. */
function Seal({ achievement, unlocked, implemented, color }) {
  const { t } = useT();
  const a = achievement;
  const isSecret = a.secret && !unlocked;
  const isComingSoon = !unlocked && !implemented && !a.secret;

  const borderStyle = unlocked ? 'solid' : (isComingSoon ? 'dotted' : 'dashed');
  const borderColor = unlocked ? color : 'var(--line)';
  const opacity = unlocked ? 1 : (isComingSoon ? 0.38 : 0.55);

  return (
    <div
      style={{
        aspectRatio: '1/1.15',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '14px 8px',
        border: `1px ${borderStyle} ${borderColor}`,
        borderRadius: 'var(--r-md)',
        background: unlocked ? 'var(--paper)' : 'transparent',
        opacity,
        position: 'relative',
        transition: 'all 220ms',
        cursor: 'default',
        textAlign: 'center',
      }}
      title={isComingSoon ? t('ach.coming.soon') : a.desc}
    >
      {/* Badge "Pronto" — solo en estado coming-soon */}
      {isComingSoon && (
        <div style={{
          position: 'absolute',
          top: 6, right: 6,
          fontFamily: 'var(--font-ui)',
          fontSize: 7.5,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          border: '0.5px solid var(--line-2)',
          borderRadius: 999,
          padding: '2px 6px',
          lineHeight: 1,
        }}>{t('ach.seal.soon')}</div>
      )}

      {/* Sello circular */}
      <div style={{
        width: 56, height: 56,
        borderRadius: '50%',
        border: `1.2px solid ${unlocked ? color : 'var(--line-2)'}`,
        display: 'grid', placeItems: 'center',
        marginBottom: 10,
        color: unlocked ? color : 'var(--ink-3)',
        fontFamily: 'var(--font-display)',
        fontSize: 22,
        position: 'relative',
      }}>
        <span style={{ opacity: isComingSoon ? 0.25 : 1, width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
          {isSecret ? <span style={{ fontStyle: 'italic' }}>?</span> : renderGlyph(a)}
        </span>
        {/* Anillo externo sutil */}
        <div style={{
          position: 'absolute', inset: -4,
          borderRadius: '50%',
          border: `0.5px solid ${unlocked ? color : 'var(--line)'}`,
          opacity: 0.4,
        }} />
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.15,
        marginBottom: 4,
        color: unlocked ? 'var(--ink)' : 'var(--ink-3)',
      }}>{isSecret ? t('ach.seal.secret') : a.title}</div>
      <div style={{ fontSize: 9.5, letterSpacing: '0.05em', color: 'var(--ink-3)', lineHeight: 1.3 }}>
        {isSecret ? '?????' : (isComingSoon ? t('ach.seal.soon') : a.desc)}
      </div>
    </div>
  );
}

Object.assign(window, { Achievements });
