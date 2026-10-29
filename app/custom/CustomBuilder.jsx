/* PACE · Constructor de rutinas premium (F7 · s93 · v0.38.0)

   Modal overlay singleton (montado en main.jsx, abierto vía CustomEvent
   `pace:open-custom-builder` con detail.id = rutina a editar o null).
   Mientras está abierto, main.jsx oculta MoveLibrary para que solo un
   Modal escuche Escape; al cerrar, la biblioteca reaparece.

   Dos vistas internas:
     - editor: nombre + lista de pasos (glifo, dur stepper, reordenar,
       quitar) + total en vivo + Guardar/Cancelar (+ Eliminar en edición,
       confirmación en dos toques).
     - picker: registro de ejercicios agrupado (EXERCISE_REGISTRY); un
       toque añade el paso con su dur por defecto.

   Solo se llega aquí con `puedeCrearRutinas()` (la sección de la
   biblioteca no ofrece nada clicable en estado bloqueado). Los steppers
   usan la forma funcional de setState local (decisión s89).

   CERRAR NO PREGUNTA NADA (Ez, «U1 B · Tu borrador te espera», 29 oct.): lo que llevas se
   guarda solo como borrador (`setCustomDraft`, uno solo) y se abre donde lo dejaste. Se escribe
   un rato después de cada cambio, y enseguida al cerrar, al guardar mal, al ocultarse la página
   o al cerrarse la pestaña, así que también lo salva la app que se cierra. */

const { useState: useStateCB, useEffect: useEffectCB, useRef: useRefCB } = React;

/* Un paso guardado con un nombre de antes se edita con el de hoy, y así se guarda. */
function customPasosDeHoy(lista) {
  return lista.map(p => ({ ...p, name: typeof ejercicioNombreDeHoy === 'function' ? ejercicioNombreDeHoy(p.name) : p.name }));
}

function CustomBuilder({ editId, onClose }) {
  const { t, tn, lang } = useT();
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };
  const tEx = (name) => tR(`custom.ex.${name}.name`, name);

  /* De qué es: null para una rutina nueva. «Guardarla como nueva» (C6) la pasa a null. */
  const [target, setTarget] = useStateCB(editId || null);
  const existing = target ? getCustomRoutine(target) : null;
  /* El borrador se retoma si es de lo mismo que se abre: la rutina nueva o esta rutina. */
  const [retomado, setRetomado] = useStateCB(() => {
    const b = getCustomDraft();
    return b && b.editId === target ? b : null;
  });
  const [name, setName] = useStateCB(() => (retomado ? retomado.name : existing ? existing.name : ''));
  const [steps, setSteps] = useStateCB(() => customPasosDeHoy(retomado ? retomado.steps : existing ? existing.steps : []));
  const [view, setView] = useStateCB('editor'); // 'editor' | 'picker'
  const [confirmDelete, setConfirmDelete] = useStateCB(false);
  const [noGuarda, setNoGuarda] = useStateCB(null); // null | 'tope' | 'borrada' (C6)
  const limits = window.CUSTOM_LIMITS;

  /* Igual que lo guardado (o vacía, si es nueva) no hay nada que esperar: sin borrador. */
  const igualQueGuardada = (n, lista) => {
    const base = existing ? customPasosDeHoy(existing.steps) : [];
    return n.trim() === (existing ? existing.name : '').trim() && lista.length === base.length
      && lista.every((p, i) => p.name === base[i].name && p.dur === base[i].dur);
  };
  const ultimo = useRefCB(null);   // lo último que cambiaste y aún no está en el borrador
  const espera = useRefCB(null);
  const montado = useRefCB(false);
  const guardarBorrador = () => {
    clearTimeout(espera.current);
    const u = ultimo.current;
    ultimo.current = null;
    if (!u) return;
    if (!u.igual) setCustomDraft(u.target, u.name, u.steps);
    else if (getCustomDraft() && getCustomDraft().editId === u.target) clearCustomDraft();
  };
  /* Al guardar o al empezar de cero, lo pendiente ya no vale, y el borrador, si es de esto, se va. */
  const soltarBorrador = (ids = [target]) => {
    clearTimeout(espera.current);
    ultimo.current = null;
    if (getCustomDraft() && ids.indexOf(getCustomDraft().editId) >= 0) clearCustomDraft();
  };
  useEffectCB(() => {
    if (!montado.current) { montado.current = true; return; }
    ultimo.current = { target, name, steps, igual: igualQueGuardada(name, steps) };
    clearTimeout(espera.current);
    espera.current = setTimeout(guardarBorrador, 400);
  }, [name, steps]);
  useEffectCB(() => {
    const oculta = () => { if (document.visibilityState === 'hidden') guardarBorrador(); };
    window.addEventListener('pagehide', guardarBorrador);
    document.addEventListener('visibilitychange', oculta);
    return () => {
      window.removeEventListener('pagehide', guardarBorrador);
      document.removeEventListener('visibilitychange', oculta);
      guardarBorrador();   // cerrar por cualquier vía: Cancelar, la ×, Escape o tocar fuera
    };
  }, []);

  const deCero = () => {
    soltarBorrador();
    setRetomado(null);
    setName(existing ? existing.name : '');
    setSteps(customPasosDeHoy(existing ? existing.steps : []));
  };

  /* El total es el de la tarjeta y la vista previa (`customMinutos`). Un paso por lados dura
     su tiempo en cada lado, y su tiempo lo dice. */
  const totalMin = customMinutos(steps);
  const segundos = (s) => (ejercicioPorLados(s.name) ? tn('custom.step.perSide', { s: s.dur }) : `${s.dur} s`);
  /* Solo con descansos no hay rutina: no se guarda, y se dice por qué. */
  const sinTrabajo = steps.length > 0 && !customTieneTrabajo(steps);
  const canSave = steps.length >= limits.minSteps && !sinTrabajo && name.trim().length > 0;

  const addStep = (ex) => {
    setSteps(prev => prev.length >= limits.maxSteps
      ? prev
      : [...prev, { name: ex.name, dur: ex.dur }]);
  };
  const removeStep = (idx) => setSteps(prev => prev.filter((_, i) => i !== idx));
  const moveStep = (idx, delta) => setSteps(prev => {
    const j = idx + delta;
    if (j < 0 || j >= prev.length) return prev;
    const next = [...prev];
    const [item] = next.splice(idx, 1);
    next.splice(j, 0, item);
    return next;
  });
  const nudgeDur = (idx, delta) => setSteps(prev => prev.map((s, i) => i === idx
    ? { ...s, dur: Math.min(limits.maxDur, Math.max(limits.minDur, s.dur + delta)) }
    : s));

  /* LO QUE NO DEJA GUARDAR SE DICE ENCIMA DE GUARDAR (Ez, «C6 A», 29 oct.): diez rutinas ya (la
     décima, quizá de otra pestaña) o la rutina borrada en otra pestaña. Guardar no hacía nada y
     no decía por qué; ahora la rutina sigue en pantalla y en el borrador, que se escribe ya. */
  const guardarComo = (id) => {
    const motivo = id && !getCustomRoutine(id) ? 'borrada'
      : !id && getCustomRoutines().length >= limits.maxRoutines ? 'tope' : null;
    if (motivo) {
      clearTimeout(espera.current);
      ultimo.current = null;
      setCustomDraft(id, name, steps);
      setNoGuarda(motivo);
      return;
    }
    const draft = { name, steps };
    const ok = id ? updateCustomRoutine(id, draft) : addCustomRoutine(draft);
    if (ok) { soltarBorrador([id, target]); onClose(); }
  };
  const save = () => guardarComo(target);
  const comoNueva = () => { setTarget(null); guardarComo(null); };
  const del = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    soltarBorrador();
    deleteCustomRoutine(target);
    onClose();
  };

  // ── Vista PICKER ──────────────────────────────────────────────────
  /* Escape, la × y tocar fuera vuelven a tu rutina, como «← Volver» (U1): no la cierran. */
  if (view === 'picker') {
    return (
      <Modal open={true} onClose={() => setView('editor')} tagLabel={t('custom.builder.tag')} title={t('custom.picker.title')} maxWidth={720}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button onClick={() => setView('editor')} style={customBuilderStyles.ghostBtn}>
            {t('custom.picker.back')}
          </button>
          <Meta>{steps.length === 1 ? t('custom.steps.one') : tn('custom.steps.many', { n: steps.length })}</Meta>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {Object.entries(EXERCISE_REGISTRY).map(([key, group]) => (
            <div key={key}>
              <h4 style={{ ...displayItalic, fontSize: 16, margin: '0 0 8px', fontWeight: 500 }}>
                {tR(`custom.cat.${key}.label`, group.label)}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
                {group.items.map(ex => (
                  <button
                    key={ex.name}
                    onClick={() => { addStep(ex); if (steps.length + 1 >= limits.maxSteps) setView('editor'); }}
                    disabled={steps.length >= limits.maxSteps}
                    style={customBuilderStyles.pickRow}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--move)'; e.currentTarget.style.background = 'var(--paper-2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={customBuilderStyles.pickGlyph}>
                      <ExerciseGlyph id={ex.name} size={22} />
                    </span>
                    <span style={{ flex: 1, textAlign: 'left', fontSize: 13, lineHeight: 1.25 }}>{tEx(ex.name)}</span>
                    <span style={{ fontSize: 11, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>{segundos(ex)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    );
  }

  // ── Vista EDITOR ──────────────────────────────────────────────────
  return (
    <Modal
      open={true}
      onClose={onClose}
      tagLabel={t('custom.builder.tag')}
      title={target ? t('custom.builder.title.edit') : t('custom.builder.title.new')}
      subtitle={t('custom.builder.subtitle')}
      maxWidth={720}
    >
      {retomado && (target
        ? <CustomAviso tipo="borrador" texto={tn('custom.draft.sigues.edit', { name: existing ? existing.name : retomado.name })}
            boton={t('custom.draft.deshacer')} onBoton={deCero} />
        : <CustomAviso tipo="borrador" texto={tn('custom.draft.sigues', { cuando: customBorradorCuando(retomado.savedAt, tn, lang) })}
            boton={t('custom.draft.cero')} onBoton={deCero} />)}
      <div style={{ marginBottom: 18 }}>
        <Meta style={{ marginBottom: 6 }}>{t('custom.builder.name.label')}</Meta>
        <input
          type="text"
          value={name}
          maxLength={limits.maxNameLen}
          placeholder={t('custom.builder.name.placeholder')}
          onChange={(e) => setName(e.target.value)}
          style={customBuilderStyles.nameInput}
        />
      </div>

      <Meta style={{ marginBottom: 8 }}>{t('custom.builder.steps.label')}</Meta>
      {steps.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 14px', lineHeight: 1.5 }}>
          {t('custom.builder.empty')}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          {steps.map((s, idx) => (
            <div key={`${s.name}-${idx}`} style={customBuilderStyles.stepRow}>
              <span style={customBuilderStyles.stepGlyph}>
                <ExerciseGlyph id={s.name} size={24} />
              </span>
              <span style={customBuilderStyles.stepName}>{tEx(s.name)}</span>
              <span style={customBuilderStyles.controles}>
              <span style={customBuilderStyles.durGroup}>
                <button onClick={() => nudgeDur(idx, -limits.durStep)} disabled={s.dur <= limits.minDur} aria-label="−5 s" style={customBuilderStyles.iconBtn}>−</button>
                <span style={customBuilderStyles.durValue}>{segundos(s)}</span>
                <button onClick={() => nudgeDur(idx, limits.durStep)} disabled={s.dur >= limits.maxDur} aria-label="+5 s" style={customBuilderStyles.iconBtn}>+</button>
              </span>
              <span style={{ display: 'inline-flex', gap: 2 }}>
                <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} title={t('custom.step.up')} aria-label={t('custom.step.up')} style={customBuilderStyles.iconBtn}>↑</button>
                <button onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1} title={t('custom.step.down')} aria-label={t('custom.step.down')} style={customBuilderStyles.iconBtn}>↓</button>
                <button onClick={() => removeStep(idx)} title={t('custom.step.remove')} aria-label={t('custom.step.remove')} style={customBuilderStyles.iconBtn}>×</button>
              </span>
              </span>
            </div>
          ))}
        </div>
      )}

      {sinTrabajo && (
        <p data-pace-custom-sin-trabajo style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 12px', lineHeight: 1.5 }}>
          {t('custom.builder.needWork')}
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <button
          onClick={() => setView('picker')}
          disabled={steps.length >= limits.maxSteps}
          style={{ ...customBuilderStyles.ghostBtn, opacity: steps.length >= limits.maxSteps ? 0.4 : 1 }}
        >
          + {t('custom.builder.add')}
        </button>
        {steps.length > 0 && (
          <Meta>{`${steps.length === 1 ? t('custom.steps.one') : tn('custom.steps.many', { n: steps.length })} · ${tn('custom.builder.approx', { min: totalMin })}`}</Meta>
        )}
      </div>

      {noGuarda === 'tope' && (
        <CustomAviso tipo="tope" tono="var(--breathe)" texto={tn('custom.save.tope', { n: limits.maxRoutines })} />
      )}
      {noGuarda === 'borrada' && (
        <CustomAviso tipo="borrada" tono="var(--breathe)" texto={t('custom.save.borrada')}
          boton={t('custom.save.comoNueva')} onBoton={comoNueva} />
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 16 }}>
        <div>
          {target && (
            <button
              onClick={del}
              style={{
                ...customBuilderStyles.ghostBtn,
                color: confirmDelete ? 'var(--paper)' : 'var(--breathe)',
                borderColor: 'var(--breathe)',
                background: confirmDelete ? 'var(--breathe)' : 'transparent',
              }}
            >
              {confirmDelete ? t('custom.builder.delete.confirm') : t('custom.builder.delete')}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>{t('custom.builder.cancel')}</Button>
          <Button
            onClick={save}
            disabled={!canSave}
            style={{ background: 'var(--move)', borderColor: 'var(--move)' }}
          >{t('custom.builder.save')}</Button>
        </div>
      </div>
    </Modal>
  );
}

/* Una línea dentro del constructor que dice qué pasa y qué puedes hacer, como en la maqueta que
   eligió Ez: arriba la del borrador, con el color de Mueve; encima de Guardar, la que no deja guardar. */
function CustomAviso({ tipo, texto, boton, onBoton, tono = 'var(--move)' }) {
  return (
    <p data-pace-custom-aviso={tipo} style={{ ...customBuilderStyles.aviso, borderLeft: '3px solid ' + tono }}>
      <span>{texto}</span>
      {boton && <button type="button" onClick={onBoton} style={customBuilderStyles.avisoBtn}>{boton}</button>}
    </p>
  );
}

const customBuilderStyles = {
  aviso: {
    display: 'flex', flexWrap: 'wrap', gap: '6px 12px', alignItems: 'baseline',
    margin: '0 0 14px', padding: '10px 12px',
    borderRadius: 'var(--r-sm)', background: 'var(--paper-2)',
    fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-2)',
  },
  avisoBtn: {
    padding: 0, border: 0, background: 'none', font: 'inherit', fontSize: 13.5,
    color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer',
  },
  nameInput: {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', fontSize: 15,
    color: 'var(--ink)', background: 'var(--paper-2)',
    border: '1px solid var(--line)', borderRadius: 'var(--r-sm)',
    letterSpacing: 0.2,
  },
  /* SI NO CABEN, LOS CONTROLES BAJAN A SU LÍNEA (Ez, 13 oct.: a 360 px el nombre se montaba
     encima del «−»: dibujo, duración y flechas fijas dejaban al nombre unos 20 px). El nombre
     pide 120 px antes de partirse; si no los tiene, duración y flechas pasan abajo, a la derecha. */
  stepRow: {
    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', rowGap: 6,
    padding: '8px 10px',
    border: '1px solid var(--line)', borderRadius: 'var(--r-sm)',
    background: 'var(--paper)',
  },
  stepGlyph: {
    width: 36, height: 36, flexShrink: 0,
    borderRadius: '50%',
    background: 'var(--move-soft)', color: 'var(--move)',
    display: 'grid', placeItems: 'center',
  },
  stepName: { flex: '1 1 120px', fontSize: 14, lineHeight: 1.3, minWidth: 0 },
  controles: { display: 'inline-flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexShrink: 0 },
  durGroup: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    flexShrink: 0,
  },
  durValue: {
    fontSize: 12, color: 'var(--ink-2)',
    minWidth: 38, textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  iconBtn: {
    width: 24, height: 24,
    display: 'grid', placeItems: 'center',
    fontSize: 13, lineHeight: 1,
    color: 'var(--ink-2)', background: 'transparent',
    border: '1px solid var(--line)', borderRadius: 'var(--r-sm)',
    cursor: 'pointer',
  },
  ghostBtn: {
    padding: '7px 14px', fontSize: 13,
    color: 'var(--ink-2)', background: 'transparent',
    border: '1px solid var(--line-2)', borderRadius: 'var(--r-md)',
    cursor: 'pointer',
    transition: 'all 160ms',
  },
  pickRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 10px',
    border: '1px solid var(--line)', borderRadius: 'var(--r-sm)',
    background: 'transparent', color: 'var(--ink)',
    cursor: 'pointer', textAlign: 'left',
    transition: 'all 160ms',
  },
  pickGlyph: {
    width: 30, height: 30, flexShrink: 0,
    borderRadius: '50%',
    background: 'var(--move-soft)', color: 'var(--move)',
    display: 'grid', placeItems: 'center',
  },
};

Object.assign(window, { CustomBuilder });
