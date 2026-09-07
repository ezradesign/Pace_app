/* PACE · Menú post-Pomodoro
   Aparece tras completar un ciclo de foco.
   Las 3 opciones se reordenan según lo que el usuario ha hecho menos hoy:
   primero la actividad más necesaria, con indicador "Para ti".
*/

const { useEffect: useEffectBM, useRef: useRefBM } = React;

/* Score: cuánto se necesita esta actividad en este momento.
   Mayor → más prioritaria. Water usa escala 0-3 según vasos restantes. */
function computeScore(key, state) {
  const { plan, water } = state;
  if (key === 'breathe') return plan.respira ? 0 : 2;
  if (key === 'extra') return plan.extra ? 0 : 2;
  if (key === 'move') return plan.muevete ? 0 : 2;
  if (key === 'water') {
    if (water.today === 0) return 3;
    if (water.today < water.goal) return 1;
    return 0;
  }
  return 0;
}

function BreakMenu({ open, onClose, onChoose }) {
  const { t, tn, lang } = useT();
  const tR = (key, fb) => { const v = t(key); return v === key ? fb : v; };
  const state = getState();

  /* LA PROPUESTA (s187). La regla vive en `BreakMenu.support.jsx` y es PURA;
     aqui solo se pinta. Si devuelve `null` el menu es exactamente el de antes:
     una propuesta sin motivo seria publicidad. */
  const prop = (typeof breakPropuesta === 'function') ? breakPropuesta(state, {}) : null;
  const rutinaProp = prop && prop.rutina;
  const nombreProp = rutinaProp
    ? (lang === 'en' ? tR(rutinaProp.id + '.name', rutinaProp.name) : rutinaProp.name)
    : null;
  /* El atajo lee la propuesta por REFERENCIA: el efecto de teclado se suscribe
     una vez por apertura, y meter un objeto que se recrea en cada render en sus
     dependencias lo re-suscribiria sin parar. */
  const propRef = useRefBM(null);
  propRef.current = prop;

  /* `first.cycle` — Pomodoro completado + pausa activa elegida.
     El BreakMenu sólo se abre tras `completePomodoro`, así que aquí
     basta con detectar que el usuario eligió una de las 3 micro-pausas
     activas (Respira, Mueve, Hidrátate). "Saltar" no cuenta — la
     filosofía del logro es que se cierre el ciclo de verdad.
     Sesión 28. */
  const handleChoose = (key, rutina) => {
    if (key === 'breathe' || key === 'extra' || key === 'move' || key === 'water') {
      try { unlockAchievement('first.cycle'); } catch (e) {}
    }
    /* La rutina viaja como SEGUNDO argumento y es opcional: quien pulse una
       tarjeta sigue abriendo su biblioteca, exactamente como antes. */
    onChoose(key, rutina || null);
  };

  // Atajos: B (Respira) · E (Estira) · M (Muévete) · H (Hidrátate) · Esc (Saltar).
  // Los atajos siguen mapeados por actividad (no por posición visual),
  // así el reordenamiento inteligente no los rompe.
  useEffectBM(() => {
    if (!open) return;
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const k = e.key.toLowerCase();
      if (k === 'b') { e.preventDefault(); handleChoose('breathe'); }
      else if (k === 'e') { e.preventDefault(); handleChoose('extra'); }
      else if (k === 'm') { e.preventDefault(); handleChoose('move'); }
      else if (k === 'h') { e.preventDefault(); handleChoose('water'); }
      else if (e.key === 'Enter' && propRef.current) {
        /* La propuesta estrena atajo propio y NO roba ninguno: B · E · M · H
           siguen mapeados por actividad desde s28. */
        e.preventDefault();
        handleChoose(propRef.current.modulo, propRef.current.rutina);
      }
      else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onChoose, onClose]);

  if (!open) return null;

  /* s105: mismos glifos que la ActivityBar de la home (AB*, expuestos desde
     main/ActivityBar.jsx) + Estira anadido -> el menu ofrece las 4 actividades
     de la home, coherencia total. Orden = el de la home (Respira/Estira/
     Mueve/Hidratate); el score luego reordena poniendo primero "Para ti". */
  const baseOpts = [
    { key: 'breathe', label: t('break.breathe.label'), desc: t('break.breathe.desc'), color: 'var(--breathe)', bg: 'var(--breathe-soft)', icon: <ABBreathe /> },
    { key: 'extra',   label: t('break.stretch.label'), desc: t('break.stretch.desc'), color: 'var(--extra)',   bg: 'var(--extra-soft)',   icon: <ABStretch /> },
    { key: 'move',    label: t('break.move.label'),    desc: t('break.move.desc'),    color: 'var(--move)',    bg: 'var(--move-soft)',    icon: <ABMove /> },
    { key: 'water',   label: t('break.water.label'),   desc: t('break.water.desc'),   color: 'var(--hydrate)', bg: 'var(--hydrate-soft)', icon: <ABDrop /> },
  ];

  // Ordenar por score descendente; empate → orden original (sort estable).
  const opts = baseOpts
    .map(o => ({ ...o, score: computeScore(o.key, state) }))
    .sort((a, b) => b.score - a.score);

  /* CON PROPUESTA NO HAY «PARA TI»: la razon se ha mudado arriba, con nombre y
     duracion, y dos recomendaciones a la vez en el mismo modal se contradicen.
     Ese hueco reservado (s139) es ademas parte del sitio que la propuesta
     necesita para que el modal NO crezca -- medido: 616 px fijos, y a 360x640
     solo sobran 24. */
  const topScore = prop ? 0 : opts[0].score;

  return (
    <Modal open={open} onClose={onClose} tagLabel={t('break.tag')} title={t('break.title')} subtitle={t('break.subtitle')} maxWidth={720}>
      {prop && (
        <div data-pace-break-prop style={{
          margin: '18px 0 12px', padding: '14px 15px',
          border: '1.5px solid var(--breathe)', background: 'var(--breathe-soft)',
          borderRadius: 'var(--r-md)', display: 'grid', gap: 5,
        }}>
          <div style={{ fontSize: 11.5, letterSpacing: '0.03em', color: 'var(--breathe-2)', fontWeight: 500 }}>
            {prop.porque === 'sitting'
              ? tn('break.prop.sitting', { n: prop.datos.n })
              : t('break.prop.' + prop.porque)}
          </div>
          {nombreProp && <div style={{ ...displayItalic, fontSize: 24 }}>{nombreProp}</div>}
          {rutinaProp && (
            <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
              {tn('break.prop.meta', {
                n: rutinaProp.min,
                m: t('break.' + (prop.modulo === 'extra' ? 'stretch' : prop.modulo) + '.label'),
              })}
            </div>
          )}
          <div style={{ marginTop: 6 }}>
            <Button variant="terracota" onClick={() => handleChoose(prop.modulo, rutinaProp)}>
              {t('break.prop.start')}
            </Button>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: prop ? 10 : 12, margin: prop ? '0 0 4px' : '20px 0' }}>
        {opts.map((o, i) => {
          const done = o.score === 0;
          const recommended = i === 0 && topScore > 0;
          return (
            <button key={o.key}
              onClick={() => handleChoose(o.key)}
              style={{
                position: 'relative',
                padding: prop ? '13px 14px' : '24px 18px',
                background: o.bg,
                border: `1.5px solid ${done ? 'var(--line)' : o.color}`,
                borderRadius: 'var(--r-md)',
                textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: 12,
                transition: 'all 220ms var(--ease)',
                cursor: 'pointer',
                color: 'var(--ink)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--sh-card)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Indicador de actividad ya completada hoy (punto color módulo) */}
              {done && (
                <span style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 6, height: 6, borderRadius: '50%',
                  background: o.color, opacity: 0.6,
                }} />
              )}
              {/* Tag "Para ti" en la opción recomendada.
                  s139 · ALTURA RESERVADA (decisión s119, mismo arreglo que el
                  contador de Respira). El Tag se montaba SOLO en la
                  recomendada y la tarjeta es flex column con `gap:12`, así que
                  esa tarjeta empujaba su glifo, su título y su descripción
                  —altura del Tag + 12 px— respecto a la vecina de la MISMA
                  fila: las dos columnas dejaban de cuadrar (reportado por el
                  usuario). Ahora el hueco existe siempre y solo se oculta el
                  contenido. `visibility:hidden` lo saca además del árbol de
                  accesibilidad, así que «Para ti» no se anuncia en las tres
                  tarjetas que no lo son. */}
              {!prop && (
                <div style={{ visibility: recommended ? 'visible' : 'hidden' }}>
                  <Tag color="var(--focus)">{t('break.recommended')}</Tag>
                </div>
              )}
              <div style={{ color: o.color, fontSize: 28, lineHeight: 1 }}>{o.icon}</div>
              <div>
                <div style={{ ...displayItalic, fontSize: 22, fontWeight: 500, marginBottom: 4 }}>{o.label}</div>
                {/* Con propuesta arriba la descripcion sobra: ya hay una rutina
                    con nombre y duracion, y estas cuatro vuelven a ser lo que
                    siempre fueron -- cuatro puertas. LOS GLIFOS SE QUEDAN: son
                    los mismos de la ActivityBar y son lo que hace la tarjeta
                    reconocible de un vistazo (peticion del usuario, s187). */}
                {!prop && (
                  <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                    {done ? t('break.done') : o.desc}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div data-pace-break-shortcut style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <Meta>{t('break.shortcut')}</Meta>
        <Button variant="ghost" onClick={onClose}>{t('break.skip')}</Button>
      </div>
    </Modal>
  );
}

/* s105: los iconos locales BM* (viento / monigote / gota generica) se
   retiraron -- el menu usa ahora los glifos AB* de la ActivityBar (pulmones /
   puente / mancuerna / gota), importados via window desde main/ActivityBar.jsx. */

/* Responsive móvil — mismo patrón que SessionShell (sesión 27). */
const _paceBreakResponsive = document.getElementById('pace-break-responsive-css');
if (!_paceBreakResponsive) {
  const s = document.createElement('style');
  s.id = 'pace-break-responsive-css';
  s.textContent = `
    @media (max-width: 640px) {
      [data-pace-break-shortcut] .pace-meta {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { BreakMenu });