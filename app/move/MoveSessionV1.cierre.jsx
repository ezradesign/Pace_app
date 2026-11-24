/* PACE · MoveSessionV1.cierre.jsx — LA PANTALLA FINAL DE MUEVE Y ESTIRA
   ====================================================================
   El bloque `stage === 'done'` de MoveSessionV1.jsx, movido tal cual al tocar aquel las 500 líneas
   de §1 (auditoría del 24 nov. 2026, H8A de Ez). Es una función que devuelve el mismo JSX, no un
   componente: el árbol de React no cambia. Lee los `ref` del runner por valor, en el render del
   cierre, como antes. */

function v1PintaCierre(o) {
  const { routine, displayRoutine, kind, onExit, accent, accentSoft, inPath, atmo, t } = o;
  const totalSec = o.tiempoSec;
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  // s114 · pantalla final por MÓDULO (resuelve el P3 antidoteDone universal):
  // Mueve → «Movimiento completado» · Estira → «Estiramiento completado».
  // Stats HONESTAS (s114) — el reparto por tipo de rutina vive en el support
  // desde s170 (regla §1); el criterio no cambió.
  const stats = v1DoneStats(routine, o.reps,
                            `${mins}:${String(secs).padStart(2, '0')}`, t, o.hechos, o.series);
  const doneMeta = kind === 'extra' ? t('session.stretchDone') : t('session.moveDone');
  return (
    <SessionDone
      routine={displayRoutine} onExit={onExit} accent={accent} accentSoft={accentSoft}
      doneMeta={doneMeta} doneCopy={t('move.doneCopy')}
      stats={stats}
      rootData={{ 'data-pace-active-sec': o.activeSec }}
      buttonStyle={{ background: accent, borderColor: accent }}
      doneButtonLabel={inPath ? t('session.next') : undefined}
      atmosphere={atmo}
      feedback={inPath || routine.hacerla ? undefined : <SessionFeedback routineId={routine.id} kind={kind} accent={accent} />}
      sinContar={o.sinContar}
    />
  );
}

Object.assign(window, { v1PintaCierre });
