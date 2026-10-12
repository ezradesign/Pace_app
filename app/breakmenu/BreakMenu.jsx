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

function BreakMenu({ open, onClose, onChoose, onSeguir }) {
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
       tarjeta sigue abriendo su biblioteca, exactamente como antes. El TERCERO
       (s194) dice si esa rutina es el plato que sirvió «A tu ritmo»: lo sabe el
       motivo de la propuesta (`break.prop.ritmo.*`), y va al origen del evento. */
    const p = propRef.current;
    const desdeMenu = !!(rutina && p && p.rutina && p.rutina.id === rutina.id
      && typeof p.porque === 'string' && p.porque.indexOf('ritmo.') === 0);
    onChoose(key, rutina || null, desdeMenu);
  };
  /* La propuesta del agua dice «Un vaso más», así que lo suma antes de abrir Hidrátate, donde se
     ve contado y se deshace con «Un vaso menos». Las demás entran en su rutina.
     LA COMIDA de «A tu ritmo» («Ir a comer») suma el vaso que lleva y cierra la pausa: no
     hay rutina que abrir, y abrir Hidrátate era lo mismo que la fila de debajo (Ez, 8 oct.).
     Cuenta como pausa elegida, igual que cuando abría Hidrátate. */
  const elegirPropuesta = (p) => {
    if (p.modulo === 'water') {
      addWaterGlass(1);
      try { playSound('hydrate.sip'); } catch (e) {}
    }
    if (p.porque === 'ritmo.comida') {
      try { unlockAchievement('first.cycle'); } catch (e) {}
      onClose();
      return;
    }
    handleChoose(p.modulo, p.rutina);
  };

  // Atajos: Intro (la propuesta) y Esc (saltar) son los únicos que se enseñan... en
  // ningún sitio: Ez quitó la línea de atajos del pie (8 oct.). B (Respira) · E (Estira) ·
  // M (Muévete) · H (Hidrátate) siguen funcionando, mapeados por actividad y no por
  // posición visual, así el reordenamiento inteligente no los rompe.
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
        elegirPropuesta(propRef.current);
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
     Con propuesta tampoco hay tarjetas: las otras tres van en una línea (abajo),
     así que «Para ti» solo vive en las cuatro tarjetas del menú sin propuesta. */
  const topScore = opts[0].score;

  /* s195: CON MENÚ, OTRO MODAL. Si la propuesta es el plato de «A tu ritmo» y hay
     una pausa abierta, la pregunta es una sola (¿haces la pausa, o sigues?) y la
     pinta BreakMenu.ritmo.jsx. Sin menú, o por libre, este modal no cambia. */
  const plan = (prop && typeof prop.porque === 'string' && prop.porque.indexOf('ritmo.') === 0 && typeof ritmoPlan === 'function') ? ritmoPlan(state) : null;
  if (plan && plan.pausa && typeof BreakMenuRitmo === 'function') {
    return <BreakMenuRitmo open={open} onClose={onClose} onSeguir={onSeguir} prop={prop} plan={plan} nombre={nombreProp}
      opciones={baseOpts} onChoose={(key, rutina) => handleChoose(key, rutina)} onPropuesta={() => elegirPropuesta(prop)} />;
  }

  /* La propuesta va vestida como la tarjeta de su rutina, con su botón dentro (la opción A
     de Ez, BreakMenu.css.jsx); el agua no tiene rutina y lleva la gota y «Hidrátate». */
  const colorProp = prop ? BREAK_COLOR[prop.modulo] : null;
  return (
    <Modal open={open} onClose={onClose} tagLabel={t('break.tag')} title={t('break.title')} subtitle={t('break.subtitle')} maxWidth={720}>
      {prop && (
        <div style={{ margin: '0 0 12px' }}>
          <BreakPlato color={colorProp} glifo={breakGlifo(prop.modulo, rutinaProp)} datos={{ 'data-pace-break-prop': '' }}
            motivo={prop.porque === 'sitting' ? tn('break.prop.sitting', { n: prop.datos.n }) : t('break.prop.' + prop.porque)}
            nombre={nombreProp || (prop.modulo === 'water' ? t('break.water.label') : null)}
            ctx={rutinaProp ? <><b>{rutinaProp.min}</b><u>{t('lib.min')}</u><em>{t('break.' + (prop.modulo === 'extra' ? 'stretch' : prop.modulo) + '.label')}</em></> : null}>
            <div className="pace-break-acciones" style={{ marginTop: 12 }}>
              <button type="button" className="pace-break-pildora pace-break-llena" style={{ '--c': colorProp }} onClick={() => elegirPropuesta(prop)}>
                {t(prop.modulo === 'water' ? 'hydrate.more' : 'break.prop.start')}
              </button>
            </div>
          </BreakPlato>
        </div>
      )}
      {/* Con propuesta, las otras tres en una sola línea, con su dibujo y sin caja (la B de
          Ez, 9 oct., docs/traspaso/archivos/pausa-repetida-9oct/): la puerta del módulo
          propuesto ya está arriba, y repetirla abajo decía dos veces lo mismo («te
          recomienda Hidrátate y abajo también sale Hidrátate»). Sin propuesta, las cuatro
          tarjetas de siempre. */}
      {prop && (
        <div className="pace-break-otras" data-pace-break-otras>
          {opts.filter((o) => o.key !== prop.modulo).map((o) => (
            <button key={o.key} type="button" className="pace-break-otra" style={{ '--c': o.color }} onClick={() => handleChoose(o.key)}>
              <span className="pace-break-otra-glifo">{o.icon}</span>
              <span className="pace-break-otra-nombre">{o.label}</span>
            </button>
          ))}
        </div>
      )}
      {!prop && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, margin: '20px 0' }}>
        {opts.map((o, i) => {
          const done = o.score === 0;
          const recommended = i === 0 && topScore > 0;
          return (
            <button key={o.key}
              onClick={() => handleChoose(o.key)}
              style={{
                position: 'relative',
                padding: '24px 18px',
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
              <div style={{ visibility: recommended ? 'visible' : 'hidden' }}>
                <Tag color="var(--focus)">{t('break.recommended')}</Tag>
              </div>
              <div style={{ color: o.color, fontSize: 28, lineHeight: 1 }}>{o.icon}</div>
              <div>
                <div style={{ ...displayItalic, fontSize: 22, fontWeight: 500, marginBottom: 4 }}>{o.label}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                  {done ? t('break.done') : o.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>}

      {/* El pie, sin línea de atajos (Ez, 8 oct.); su `data-*` lo usan las pruebas. */}
      <div data-pace-break-shortcut className="pace-break-pie" style={{ marginTop: prop ? 8 : 4 }}>
        <button type="button" className="pace-break-saltar" onClick={onClose}>{t('break.skip')}</button>
      </div>
    </Modal>
  );
}

/* s105: los iconos locales BM* (viento / monigote / gota generica) se
   retiraron -- el menu usa ahora los glifos AB* de la ActivityBar (pulmones /
   puente / mancuerna / gota), importados via window desde main/ActivityBar.jsx. */

Object.assign(window, { BreakMenu });