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
  /* s146 — el arte del usuario entra como MÁSCARA y GANA al SVG heráldico, para
     que la tanda pueda llegar por partes sin dejar huecos: lo que aún no tiene
     dibujo sigue con el sistema viejo. `currentColor` de fondo es lo que
     conserva el tintado por estado, igual que en la rama SVG. */
  const mask = window.achievementMaskUrl && window.achievementMaskUrl(a.id);
  if (mask) {
    const url = `url("${mask}")`;
    return (
      <span style={{
        display: 'block', width: '100%', height: '100%',
        backgroundColor: 'currentColor',
        WebkitMaskImage: url, maskImage: url,
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        WebkitMaskSize: 'contain', maskSize: 'contain',
        ...style,
      }} />
    );
  }
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

/* §15.4: la regla vive en catalog.js y la comparten sidebar y modal. */
function isImplemented(a) {
  return window.achievementIsAvailable
    ? window.achievementIsAvailable(a)
    : !!(a.secret || IMPLEMENTED_ACHIEVEMENTS.has(a.id));
}

function Achievements({ open, onClose }) {
  const [state] = usePace();
  const { t } = useT();
  const unlocked = state.achievements || {};
  const unlockedCount = Object.keys(unlocked).length;
  const availableCount = window.ACHIEVEMENTS_AVAILABLE
    || ACHIEVEMENT_CATALOG.filter(isImplemented).length;
  /* Un logro sin detector no se ve ni se cuenta (Ez, 5 nov. 2026): su tarjeta
     decía «Pronto» y la cabecera los sumaba como «Próximamente», una promesa sin
     fecha. Aparece solo el día que su id entra en IMPLEMENTED_ACHIEVEMENTS. Si
     ya lo tienes, se queda, como los de ATG y Ancestral en catalog.js. */
  const visibles = ACHIEVEMENT_CATALOG.filter(a => isImplemented(a) || unlocked[a.id]);

  return (
    <Modal open={open} onClose={onClose} tagLabel={t('ach.tag')} title={t('ach.title')} subtitle={t('ach.subtitle')} maxWidth={920}>
      {/* Counter */}
      <div style={{ display: 'flex', gap: 20, margin: '8px 0 24px', padding: '16px 20px', background: 'var(--paper-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--line)' }}>
        <div data-pace-ach-cuenta>
          <div style={{ ...displayItalic, fontSize: 36, fontWeight: 500, lineHeight: 1 }}>
            {unlockedCount}<span style={{ color: 'var(--ink-3)', fontSize: 20 }}> / {availableCount}</span>
          </div>
          <Meta style={{ marginTop: 4 }}>{t('ach.collected')}</Meta>
        </div>
      </div>

      {Object.entries(CAT_META).map(([cat, meta]) => {
        const items = visibles.filter(a => a.cat === cat);
        if (!items.length) return null;
        const gotThisCat = items.filter(a => unlocked[a.id]).length;
        return (
          <div key={cat} data-pace-ach-cat={cat} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <h3 style={{ ...displayItalic, fontSize: 22, margin: 0, fontWeight: 500, color: letraDe(meta.color) }}>{t(meta.labelKey)}</h3>
              <Meta>{gotThisCat} / {items.length}</Meta>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: 12 }}>
              {items.map(a => (
                <Seal
                  key={a.id}
                  achievement={a}
                  unlocked={!!unlocked[a.id]}
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

/* Dos estados del sello:
   1. unlocked         → borde color sólido, opacidad 1, descripción visible.
   2. locked           → borde dashed gris y el sello al 55 %; el nombre y la frase,
                         enteros en el gris de los rótulos (guía al usuario: "esto se
                         puede cazar", y se lee qué es y cómo se gana). Hasta el 7 nov.
                         iba al 55 % la tarjeta entera y la letra daba 2,0 a 1 (Ez, 1B).
   Los secretos no-desbloqueados saltan siempre a modo secreto (glifo ?,
   título "Secreto") — su mecánica es intriga, no señalización. */
function Seal({ achievement, unlocked, color }) {
  const { t, lang } = useT();
  /* s167 — hasta hoy el titulo y la descripcion salian CRUDOS del catalogo, asi
     que en ingles se leian en español (hallazgo de s146, abierto dos versiones).
     Mismo patron que Respira/Mueve/Extra: el castellano sigue viviendo SOLO en
     `catalog.js` y el ingles llega de `i18n/content/achievements.js`; si falta
     la clave, cae al dato. */
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };
  const a = achievement;
  const isSecret = a.secret && !unlocked;

  const borderStyle = unlocked ? 'solid' : 'dashed';
  /* Apagado = lo que antes hacía la opacidad de la tarjeta, solo en el borde y el sello. */
  const borderColor = unlocked ? color : 'color-mix(in srgb, var(--line) 55%, transparent)';
  const opacity = unlocked ? 1 : 0.55;

  return (
    <div
      /* s167 — el id en el DOM para que la suite pueda comparar sello a sello.
         Sin el, un aserto de idioma solo puede mirar el texto ENTERO del panel
         con `includes`, que casa por SUBCADENA: el ingles «Coherent» aparecia
         dentro del castellano «Coherente» y daba un falso positivo. */
      data-pace-ach={a.id}
      style={{
        /* s147 — el sello se anclaba al CENTRO de la tarjeta, así que flotaba con
           el largo de la descripción: reportado por el usuario con «Setenta y
           cinco sellos» (1 línea) al lado de «Cartógrafa» (3 líneas). Medido
           sobre los 96 sellos, tres posiciones distintas —15, 20 y 26 px del
           borde— y 11 px de deriva dentro de la misma fila.

           Se ancla ARRIBA, que es la regla de alturas reservadas de s119: con el
           ancla arriba se alinean los sellos Y los títulos, y lo que varía —la
           descripción— cae hacia el hueco de abajo.

           s167 — AQUÍ VIVÍA `aspectRatio: '1/1.15'`, y era el defecto que el
           usuario reportó como «mucho aire por debajo»: ataba el ALTO de la
           tarjeta a su ANCHO. Con `minmax(128px, 1fr)`, al estrechar el viewport
           caben menos columnas, cada tarjeta se ensancha y la proporción la
           estira — mientras el texto sigue midiendo lo mismo. Medido sobre los
           96 en siete anchos: a 1440 sobran 24 px bajo el último texto, pero a
           320 la tarjeta mide 283 px y 157 son aire, el 55 % vacía.

           Sin alto fijo lo marca el CONTENIDO, y la rejilla iguala por FILA
           (`align-items: stretch` es el defecto del grid). La regla de s147
           sigue en pie: su defecto era la deriva DENTRO de una fila, y el
           estirado por fila la impide igual porque todas las tarjetas de una
           fila siguen midiendo lo mismo. Se pierde la regularidad ENTRE filas;
           se gana que la tarjeta deje de crecer sola en móvil. */
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
        padding: '14px 8px',
        border: `1px ${borderStyle} ${borderColor}`,
        borderRadius: 'var(--r-md)',
        background: unlocked ? 'var(--paper)' : 'transparent',
        position: 'relative',
        transition: 'all 220ms',
        cursor: 'default',
        textAlign: 'center',
      }}
      title={tR('ach.item.' + a.id + '.desc', a.desc)}
    >
      {/* Sello circular */}
      <div data-pace-ach-sello style={{
        opacity,
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
        <span style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
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
      }}>{isSecret ? t('ach.seal.secret') : tR('ach.item.' + a.id + '.title', a.title)}</div>
      <div style={{ fontSize: 9.5, letterSpacing: '0.05em', color: 'var(--ink-3)', lineHeight: 1.3 }}>
        {isSecret ? '?????' : tR('ach.item.' + a.id + '.desc', a.desc)}
      </div>
    </div>
  );
}

/* `renderGlyph` sale a window (s146) para que la MINIATURA del sidebar pinte el
   glifo real en vez de un `✦` fijo. Es la misma funcion, no una copia: si un
   glifo cambia, cambian las dos superficies a la vez. */
Object.assign(window, { Achievements, renderGlyph });
