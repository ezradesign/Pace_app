/* PACE · EL CIERRE DEL EJERCICIO DICE LO QUE SIGUE (Ez, 2A del 10 nov. 2026)
   ==========================================================================
   Auditoría fable-9nov, propuesta 2. Al acabar un ejercicio elegido en la pausa, el cierre solo
   decía «Volver al inicio», y en la home esperaba el aro en 00:00 con «Empezar otro ciclo»: un
   toque más y sin decir qué tocaba. Ahora, SOLO cuando el ejercicio venía de una pausa:
     · por libre: «Empezar el ciclo 2» arranca el Foco siguiente, y «Volver al inicio» debajo;
     · con jornada, mientras el aro cuenta la pausa: «Volver · te quedan 3 min de pausa» vuelve
       a la home con la pausa corriendo, y «Empezar ya el bloque 2» la corta y arranca el bloque.
   Los números son los del aro: el ciclo es el que pinta «CICLO N / 4» y los minutos, los que
   quedan hasta `pausaHasta`. Arrancar pasa por la puerta de siempre: `pace:ritmo-seguir`, que
   FocusTimer escucha (con la pausa del día, `empezarYa`; por libre, el ciclo siguiente).

   ¿VENÍA DE UNA PAUSA? Con jornada, si la pausa del día sigue contando: cualquier sesión hecha
   en ese rato la deja hecha (ritmoPausaHecha), así que es de la pausa entre por donde entre. Por
   libre, si la última sesión salió por la puerta de la pausa (`paceUltimaPuertaLeer`, la ventana
   de la pausa), sin día de «A tu ritmo», en Foco y sin un bloque en marcha o en pausa. Cualquier
   otro caso, como antes. Si la pausa acaba con el cierre delante, vuelve a «Volver al inicio».
   `var`/`function` para lo que cruza la IIFE del artefacto. */

const { useState: useStateSDS, useEffect: useEffectSDS } = React;

/* Lo que sigue a esta sesión, o null: { tipo: 'libre', n } o { tipo: 'jornada', min, n }. */
function paceCierreSigue() {
  try {
    const s = getState();
    const p = typeof ritmoPausaCuenta === 'function' ? ritmoPausaCuenta(s) : null;
    if (p) {
      const ms = p.hasta - Date.now();
      return ms > 0 ? { tipo: 'jornada', min: Math.max(1, Math.ceil(ms / 60000)), n: p.n } : null;
    }
    const puerta = typeof paceUltimaPuertaLeer === 'function' ? paceUltimaPuertaLeer() : null;
    if (!puerta || puerta.origin !== 'pausa') return null;
    if (typeof ritmoPlan === 'function' && ritmoPlan(s)) return null;
    if (s.focusMode !== 'foco' || localStorage.getItem('pace.timer.v1')) return null;
    return { tipo: 'libre', n: ((Number(s.cycle) || 0) % 4) + 1 };
  } catch (e) {
    return null;
  }
}

/* Se mira al pintar y cada 15 s con la pausa del día: los minutos bajan y, si acaba, se va. */
function usePaceCierreSigue(activo) {
  const [, setVuelta] = useStateSDS(0);
  const sigue = activo ? paceCierreSigue() : null;
  const jornada = !!(sigue && sigue.tipo === 'jornada');
  useEffectSDS(() => {
    if (!jornada) return undefined;
    const id = setInterval(() => setVuelta((x) => x + 1), 15000);
    return () => clearInterval(id);
  }, [jornada]);
  return sigue;
}

/* La salida del cierre con lo que sigue: el botón de siempre con su nombre nuevo y, debajo, un
   enlace como «Ahora no». `estilo` es el del botón del cierre (SessionDone). */
function SessionDoneSigue({ sigue, onExit, estilo }) {
  const { t, tn } = useT();
  const arrancar = () => { onExit('done'); try { window.dispatchEvent(new CustomEvent('pace:ritmo-seguir')); } catch (e) {} };
  const volver = () => onExit('done');
  const libre = sigue.tipo === 'libre';
  const cta = libre ? tn('session.sigue.ciclo', { n: sigue.n })
    : tn(sigue.min === 1 ? 'session.sigue.pausa.uno' : 'session.sigue.pausa', { min: sigue.min });
  const otra = libre ? t('session.backToHome') : tn('ritmo.pausa.ya', { n: sigue.n });
  return (
    <div data-pace-cierre-sigue={sigue.tipo} style={sessionDoneSigueStyles.caja}>
      <Button variant="secondary" onClick={libre ? arrancar : volver} style={estilo}>{cta}</Button>
      <button type="button" data-pace-cierre-otra onClick={libre ? volver : arrancar} style={sessionDoneSigueStyles.otra}>{otra}</button>
    </div>
  );
}

const sessionDoneSigueStyles = {
  caja: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  /* El enlace de debajo va como «Ahora no» (SessionFeedback.jsx). */
  otra: {
    ...displayItalic,
    fontSize: 15, color: 'var(--ink-3)',
    background: 'none', border: 'none', padding: '4px 10px', marginTop: 8,
    textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer',
  },
};

Object.assign(window, { paceCierreSigue, usePaceCierreSigue, SessionDoneSigue });
