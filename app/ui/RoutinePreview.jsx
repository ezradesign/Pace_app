/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   RoutinePreview — «antes de empezar» (§18.3 del audit) · s144
   ============================================================
   QUÉ RESUELVE. Hasta ahora, tocar una tarjeta te metía DIRECTO en la sesión:
   el 3-2-1 de `SessionPrep`, o el gate de colocación del runner v1. Si te
   faltaba la silla, la pared o sitio en el suelo, te enterabas a mitad. Y §29.3
   es explícito: los requisitos «deben indicarse antes de comenzar».

   POR QUÉ ESTABA ESCONDIDO. Los datos existían desde s115 —`equipment`,
   `position`, `requiresFloor` en 22 de las 28 rutinas— y no los leía nadie,
   igual que pasaba con `level`/`intensity` antes de la ola E. La prueba de que
   faltaba el sitio: **16 de las 28 descripciones llevaban el requisito escrito
   A MANO** («Silla estable y sin ruedas», «Necesitas pared; barra opcional»,
   «Pasarás por el suelo»). Este componente es ese sitio, y por eso desbloquea
   la reescritura editorial: saca el requisito de la descripción.

   DÓNDE SALE, Y DÓNDE NO. Solo al lanzar desde la BIBLIOTECA. Dentro de un
   Camino la rutina ya viene elegida y el ritmo manda, así que `PathBodyStep`
   monta el runner directamente y no pasa por aquí — por construcción: el
   preview vive en los handlers de main.jsx, que son la puerta de la biblioteca.
   Precedente exacto de esta forma: el modal de seguridad de Respira (s90).

   El gate `setup:'ready'` del runner v1 NO hace este trabajo: es por PASO
   («colócate para este ejercicio»), no de rutina, y llega cuando ya entraste.
   ============================================================ */

function RoutinePreview({ routine, kind = 'move', onStart, onClose }) {
  const { t, lang } = useT();
  const [pace] = usePace();
  if (!routine) return null;

  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };
  const accent = kind === 'extra' ? 'var(--extra)' : 'var(--move)';

  /* Requisitos. `requiresFloor` es un booleano aparte del material porque el
     suelo no es material: es sitio. Se muestra como una necesidad más. */
  const equipo = Array.isArray(routine.equipment) ? routine.equipment : [];
  const necesita = equipo.map(e => t(`preview.eq.${e}`));
  if (routine.requiresFloor) necesita.push(t('preview.eq.floor'));

  const posiciones = (Array.isArray(routine.position) ? routine.position : [])
    .map(p => t(`preview.pos.${p}`));

  /* Duración: MISMA fuente que la tarjeta (s115) — `estimateDuration` para el
     contrato v1, `min` para el resto. Nunca las dos. */
  const isV1 = !!(routine.steps && routine.steps.some(s => s && s.mode));
  let durLabel = `${routine.min} min`;
  if (isV1 && typeof window.estimateDuration === 'function') {
    const est = window.estimateDuration(routine, pace.restBetweenSets);
    const lo = Math.floor(est.minSec / 60), hi = Math.ceil(est.maxSec / 60);
    durLabel = lo === hi ? `${lo} min` : `${lo}–${hi} min`;
  }

  const intensidad = ['gentle', 'moderate', 'strong'].includes(routine.intensity)
    ? t(`lib.intensity.${routine.intensity}`) : null;
  const nivel = ['intermediate', 'advanced'].includes(routine.level)
    ? t(`lib.level.${routine.level}`) : null;

  /* Los pasos, sin descansos: lo que vas a HACER. El glifo es el mismo que
     verás dentro, así que la lista ya te va enseñando el vocabulario visual. */
  /* OJO al índice: las claves EN son POSICIONALES sobre el array COMPLETO
     (`<id>.s4.name` cuenta los descansos), así que se conserva el índice
     original al filtrar o el inglés se desplaza. */
  const sinDescansos = (routine.steps || [])
    .map((s, idx) => ({ s, idx }))
    .filter(({ s }) => s && s.mode !== 'rest' && s.name !== 'Descanso');
  /* Series del MISMO ejercicio se agrupan: «Fondos en silla» tres veces
     seguidas es ruido, no información. Se colapsan las repeticiones
     CONSECUTIVAS y se anota el número; si el ejercicio vuelve más tarde en la
     rutina, vuelve a aparecer, que es lo que de verdad pasa. */
  const pasos = [];
  for (const p of sinDescansos) {
    const ult = pasos[pasos.length - 1];
    if (ult && ult.s.name === p.s.name) { ult.veces++; continue; }
    pasos.push({ ...p, veces: 1 });
  }

  const Seccion = ({ titulo, children }) => (
    <div style={{ marginBottom: 18 }}>
      <div className="pace-meta" style={{ marginBottom: 8 }}>{titulo}</div>
      {children}
    </div>
  );

  return (
    <Modal open={true} onClose={onClose} maxWidth={560}
           tagLabel={t('preview.tag')} title={tR(`${routine.id}.name`, routine.name)}>
      <div style={{ marginTop: 4 }}>
        <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6, margin: '0 0 18px' }}>
          {tR(`${routine.id}.desc`, routine.desc)}
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          <Tag color={accent}>{durLabel}</Tag>
          {intensidad && <Tag muted>{intensidad}</Tag>}
          {nivel && <Tag muted>{nivel}</Tag>}
        </div>

        <Seccion titulo={t('preview.need')}>
          {necesita.length === 0 ? (
            <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>{t('preview.need.none')}</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)' }}>
              {necesita.map(n => <li key={n}>{n}</li>)}
            </ul>
          )}
        </Seccion>

        {posiciones.length > 0 && (
          <Seccion titulo={t('preview.position')}>
            <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>{posiciones.join(' · ')}</div>
          </Seccion>
        )}

        {pasos.length > 0 && (
          <Seccion titulo={t('preview.steps')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {pasos.map(({ s, idx, veces }) => (
                <div key={`${s.name}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                  <span style={{ color: accent, flexShrink: 0, display: 'grid', placeItems: 'center', width: 30, height: 30 }}>
                    {typeof ExerciseGlyph === 'function'
                      ? <ExerciseGlyph id={s.name} size={30} />
                      : null}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--ink)' }}>
                    {tR(`${routine.id}.s${idx}.name`, s.name)}
                    {veces > 1 && (
                      <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>{` ×${veces}`}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </Seccion>
        )}

        <button onClick={onStart} data-pace-cta style={{
          width: '100%', marginTop: 6, padding: '13px 20px',
          background: accent, color: 'var(--paper)', border: 'none',
          borderRadius: 'var(--r-pill)', cursor: 'pointer', minHeight: 44,
          fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, fontWeight: 500,
        }}>{t('preview.start')}</button>
      </div>
    </Modal>
  );
}

Object.assign(window, { RoutinePreview });
