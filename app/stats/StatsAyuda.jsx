/* PACE · Estadísticas · «QUÉ TE AYUDA», LA VISTA (Ez, 1A 2A 3A del 27 oct. 2026)
   ============================================================================
   Una pestaña más, de PACE completo (3A): candado e invitación sin él, como Mes y Año. Cada
   idea es una tarjeta con el lenguaje de los totales de Estadísticas: el papel de `paper-2`, la
   franja del color de su módulo, el título en versalitas, la frase en cursiva y, debajo, de dónde
   sale. Lo que se puede decir lo calcula `statsAyuda` (stats-ayuda.js) con sus umbrales.

   ANTES DE TENER BASTANTE (2A), CALLADO: «Todavía es pronto» y una frase, sin contadores ni
   barras, porque un contador se lee como algo por llenar. Con una o dos ideas fuera, las que faltan
   no se nombran: «Lo demás saldrá cuando haya bastante para decirlo».

   AL PIE, SIEMPRE QUE HAYA IDEAS: de dónde sale todo y que no es un consejo médico. Las respuestas
   son de quien las da; PACE no dice qué le conviene a nadie.

   SIN ALMACÉN (`file://`), el registro llega vacío y la vista dice «Todavía es pronto». */

function statsAyudaEventos() {
  try {
    const snap = window.paceEventsSnapshot && window.paceEventsSnapshot();
    return (snap && Array.isArray(snap.events)) ? snap.events : [];
  } catch (e) { return []; }
}

function statsAyudaSemanas(n, clave, t, tn) { return n === 1 ? t(clave + '.1') : tn(clave, { n }); }

/* Lo aprendido de «A tu ritmo» (la carta del lunes) ya trae antes alguna de estas rutinas. */
function statsAyudaEnRitmo(state, rutinas, hoy) {
  try {
    if (!(window.puedeAprender && window.puedeAprender())) return false;
    const v = ritmoMotorVigente(state && state.ritmo && state.ritmo.aprendido, hoy);
    return rutinas.some((x) => v.ayuda[x.id]);
  } catch (e) { return false; }
}

function StatsAyudaTarjeta({ idea, color, titulo, fuente, children }) {
  return (
    <div className="pace-ay-t" data-pace-ayuda-idea={idea} style={{ '--c': color }}>
      <span className="pace-ay-franja" aria-hidden="true" />
      <Meta style={{ fontSize: 10 }}>{titulo}</Meta>
      {children}
      <div className="pace-ay-fuente">{fuente}</div>
    </div>
  );
}

function StatsAyudaBien({ bien, enRitmo }) {
  const { t, tn, lang } = useT();
  const fuente = tn('stats.ayuda.bien.fuente', { n: bien.respuestas }) + ' · ' + statsAyudaSemanas(bien.semanas, 'stats.ayuda.semanas', t, tn);
  return (
    <StatsAyudaTarjeta idea="bien" color="var(--extra)" titulo={t('stats.ayuda.bien')} fuente={fuente}>
      <div className="pace-ay-filas">
        {bien.rutinas.map((x) => {
          const modulo = x.modulo || 'estira';
          return (
            <div key={x.id} className="pace-ay-fila" data-pace-ayuda-rutina={x.id} style={{ '--c': RITMO_COLOR[modulo] }}>
              <i className="pace-ay-aro"><RitmoGlifo modulo={modulo} /></i>
              <span className="pace-ay-n">{ritmoNombre(resolveAnyRoutine(x.id), t, lang)}</span>
              <span className="pace-ay-c">{tn('stats.ayuda.de', { a: x.a, b: x.b })}</span>
            </div>
          );
        })}
      </div>
      <div className="pace-ay-nota">{t('stats.ayuda.bien.nota') + (enRitmo ? ' ' + t('stats.ayuda.bien.ritmo') : '')}</div>
    </StatsAyudaTarjeta>
  );
}

function statsAyudaHoraFrase(h, t, tn) {
  if (!h.franja || !h.ventana) return t('stats.ayuda.hora.reparto');
  const v = h.ventana;
  const una = (v.hasta - v.desde + 24) % 24 === 1;
  return tn('stats.ayuda.hora.' + h.franja + (una ? '.una' : ''), { desde: v.desde, hasta: v.hasta });
}

/* Los Focos terminados por hora de empezar: barras del color de Foco, sin cifras (la frase ya
   dice lo que importa) y las horas que son múltiplo de cuatro debajo de su barra. */
function StatsAyudaHoras({ hora }) {
  const horas = [];
  for (let h = hora.desde; h <= hora.hasta; h++) horas.push(h);
  const max = Math.max(1, ...horas.map((h) => hora.porHora[h]));
  return (
    <div aria-hidden="true">
      <div className="pace-ay-horas">
        {horas.map((h) => {
          const n = hora.porHora[h];
          return <i key={h} className={n ? '' : 'pace-ay-cero'} style={{ height: n ? (n / max * 100) + '%' : undefined }} />;
        })}
      </div>
      <div className="pace-ay-eje">
        {horas.map((h) => <span key={h}>{h % 4 === 0 ? h : ''}</span>)}
      </div>
    </div>
  );
}

function StatsAyudaHora({ hora }) {
  const { t, tn } = useT();
  const fuente = tn('stats.ayuda.hora.fuente', { n: hora.focos }) + ' · ' + statsAyudaSemanas(hora.semanas, 'stats.ayuda.semanas', t, tn);
  return (
    <StatsAyudaTarjeta idea="hora" color="var(--focus)" titulo={t('stats.ayuda.hora')} fuente={fuente}>
      <div className="pace-ay-frase">{statsAyudaHoraFrase(hora, t, tn)}</div>
      <StatsAyudaHoras hora={hora} />
      {hora.duracion ? <div className="pace-ay-nota">{tn('stats.ayuda.hora.' + hora.duracion, { n: hora.focos, m: hora.minutos })}</div> : null}
    </StatsAyudaTarjeta>
  );
}

function StatsAyudaTras({ tras }) {
  const { t, tn } = useT();
  return (
    <StatsAyudaTarjeta idea="tras" color="var(--move)" titulo={t('stats.ayuda.tras')} fuente={t('stats.ayuda.tras.fuente')}>
      <div className="pace-ay-frase">{tn('stats.ayuda.tras.frase', { a: tras.a, b: tras.b })}</div>
      {tras.manana ? (
        <div className="pace-ay-nota">{tn('stats.ayuda.tras.franjas', { ma: tras.manana[0], mb: tras.manana[1], ta: tras.tarde[0], tb: tras.tarde[1] })}</div>
      ) : null}
    </StatsAyudaTarjeta>
  );
}

function StatsAyuda({ state }) {
  const { t, tn } = useT();
  const hoy = typeof todayISO === 'function' ? todayISO() : '';
  /* Una rutina que ya no existe (una tuya borrada) no tiene nombre que enseñar: no entra. */
  const r = statsAyuda(statsAyudaEventos(), hoy, (id) => !!resolveAnyRoutine(id));
  const ideas = ['bien', 'hora', 'tras'].filter((k) => r[k]);

  if (!ideas.length) {
    return (
      <div className="pace-ay" data-pace-ayuda-view="pronto">
        <div className="pace-ay-pronto">
          <div className="pace-ay-frase">{t('stats.ayuda.pronto')}</div>
          <p>{t('stats.ayuda.pronto.texto')}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="pace-ay" data-pace-ayuda-view="ideas">
      <div className="pace-ay-cab" data-pace-ayuda-cab=""><Meta>{statsAyudaSemanas(r.semanas, 'stats.ayuda.cab', t, tn)}</Meta></div>
      <div className="pace-ay-rejilla">
        {r.bien ? <StatsAyudaBien bien={r.bien} enRitmo={statsAyudaEnRitmo(state, r.bien.rutinas, hoy)} /> : null}
        {r.hora ? <StatsAyudaHora hora={r.hora} /> : null}
        {r.tras ? <StatsAyudaTras tras={r.tras} /> : null}
      </div>
      {ideas.length < 3 ? <p className="pace-ay-pie" data-pace-ayuda-resto="">{t('stats.ayuda.resto')}</p> : null}
      <p className="pace-ay-pie" data-pace-ayuda-pie="">{t('stats.ayuda.pie')}</p>
    </div>
  );
}

Object.assign(window, { StatsAyuda, statsAyudaEventos });
