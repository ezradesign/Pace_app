/* PACE · A tu ritmo · LA CARTA DEL LUNES (el motor de la semana, 16 oct. 2026)
   ========================================================================
   La carta que Ez aceptó en la página del motor (docs/traspaso/archivos/motor-semana/,
   opción B): una ventana, en el móvil y en el escritorio, la primera vez que PACE se abre
   en la semana, también cuando no cambia nada. Cabecera con lo que te ayudó, las pausas
   hechas y sus barras; debajo, los cambios con su porqué, o la pregunta de tus horas.
   «Vale» aplica, «Dejarla como estaba» deja la semana igual. Si además hay pregunta, sale
   DESPUÉS, en la misma ventana: cada paso pide una sola cosa (Ez, 17 oct., opción B, con
   las fotos de la app real en docs/traspaso/archivos/motor-semana/carta/). Solo con PACE
   completo (`ritmoCartaPendiente`, state-ritmo.motor.jsx).

   Espera, como los avisos, a que no haya nada encima de la home: ni un diálogo (la pausa,
   la bienvenida, cualquier ventana) ni una sesión.

   Y LO APRENDIDO, en «Tu semana» (RitmoSemanaTipo.jsx): una línea, «PACE ha aprendido 4
   cosas ›», que abre la lista con el «Olvidar» de cada cosa (Ez, 17 oct., opción B: la hoja
   no crece ni pide scroll). */

const { useState: useStateRC, useEffect: useEffectRC } = React;

const ritmoCartaStyles = {
  cab: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  meta: { fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)' },
  fechas: { fontSize: 12, color: 'var(--ink-3)', whiteSpace: 'nowrap' },
  resumen: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 12, alignItems: 'end' },
  ayudo: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 21, lineHeight: 1.12, color: 'var(--ink)' },
  hechas: { fontSize: 12, color: 'var(--ink-3)', marginTop: 3 },
  barras: { display: 'flex', alignItems: 'flex-end', gap: 4, height: 58 },
  barra: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, width: 18 },
  letra: { fontSize: 9, letterSpacing: '0.12em', color: 'var(--ink-3)' },
  parte: { borderTop: '1px solid var(--line)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 },
  cambio: { display: 'grid', gridTemplateColumns: '10px minmax(0,1fr)', gap: 9, alignItems: 'baseline', fontSize: 13, lineHeight: 1.4, color: 'var(--ink-2)' },
  punto: { width: 8, height: 8, borderRadius: '50%', borderWidth: 1.5, borderStyle: 'solid', display: 'block', transform: 'translateY(-1px)' },
  rutina: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink)' },
  pregunta: { fontSize: 13, lineHeight: 1.4, color: 'var(--ink-2)' },
  aprendido: { display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--line)', paddingTop: 14 },
  fila: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, fontSize: 13, lineHeight: 1.35, color: 'var(--ink-2)' },
  abrir: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, width: '100%', textAlign: 'left',
           fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-2)' },
};

function ritmoCartaNumero(n, t) {
  const xs = t('ritmo.carta.numeros').split(',');
  return n >= 0 && n < xs.length ? xs[n] : String(n);
}
function ritmoCartaRutina(id, t, lang) {
  return ritmoNombre(ritmoRutinaPorId(id) || { id: id, name: id }, t, lang);
}
function ritmoCartaDiasPlural(d, t) { return t('ritmo.carta.diasPlural').split(',')[d - 1] || ''; }
function ritmoCartaFecha(f, lang) { return paceFechaCorta(f, lang, { day: 'numeric', month: 'short' }); }

/* «del 5 al 9 oct»: de lunes a viernes, o al domingo si el fin de semana hubo «A tu ritmo». */
function ritmoCartaFechas(res, tn, lang) {
  const finde = res.barras.slice(5).some((b) => b.total > 0);
  const hasta = finde ? res.semana.hasta : motorFecha(res.semana.desde, 4);
  const mismoMes = res.semana.desde.slice(0, 7) === hasta.slice(0, 7);
  const a = mismoMes ? String(Number(res.semana.desde.slice(8))) : ritmoCartaFecha(res.semana.desde, lang);
  return tn('ritmo.carta.fechas', { a: a, b: ritmoCartaFecha(hasta, lang) });
}

/* Un cambio: el punto del color de su módulo y la frase con su porqué. */
function RitmoCartaCambio({ c }) {
  const { t, tn, lang } = useT();
  let texto;
  if (c.tipo === 'descansa') {
    const nombre = <em style={ritmoCartaStyles.rutina}>{ritmoCartaRutina(c.id, t, lang)}</em>;
    texto = <RitmoFrase plantilla={t(c.semanas > 1 ? 'ritmo.carta.descansa.dos' : 'ritmo.carta.descansa')} huecos={{ rutina: nombre, n: ritmoCartaNumero(c.veces, t) }} />;
  } else if (c.tipo === 'menos') texto = tn('ritmo.carta.menos', { n: c.veces, m: c.de });
  else texto = tn(c.semanas > 1 ? 'ritmo.carta.corta.dos' : 'ritmo.carta.corta', { hora: ritmoHora(c.hora), n: ritmoCartaNumero(c.veces, t) });
  return (
    <div data-pace-carta-cambio={c.tipo} style={ritmoCartaStyles.cambio}>
      <i style={{ ...ritmoCartaStyles.punto, borderColor: RITMO_COLOR[c.modulo] || 'var(--ink-3)' }} />
      <span>{texto}</span>
    </div>
  );
}

function ritmoCartaPreguntaTexto(p, t, tn) {
  return tn('ritmo.carta.' + p.campo + (p.dia ? '.dia' : ''), { hora: ritmoHora(p.hora), dias: p.dia ? ritmoCartaDiasPlural(p.dia, t) : '' });
}

const ritmoCartaFlecha = (
  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 5h13" /><path d="M10.5 1.5L14 5l-3.5 3.5" />
  </svg>
);

/* El pie: el enlace a la izquierda (si lo hay) y la píldora a la derecha, como la tarjeta. */
function RitmoCartaPie({ enlace, onEnlace, pildora, onPildora, datos }) {
  return (
    <div className="pace-rt-tm-pie" data-pace-carta-pie={datos}>
      {enlace ? <button type="button" className="pace-rt-enlace" data-pace-carta-no onClick={onEnlace}>{enlace}</button> : <span />}
      <button type="button" className="pace-rt-tm-comienza" data-pace-carta-si onClick={onPildora}>
        <span className="pace-rt-tm-pildora">{pildora} {ritmoCartaFlecha}</span>
      </button>
    </div>
  );
}

function RitmoCartaVentana({ carta }) {
  const { t, tn, lang } = useT();
  const res = carta.res;
  const cambios = ritmoCartaCambios(carta);
  const pregunta = ritmoCartaPregunta(carta);
  const lleva = ritmoCartaLleva(carta);
  const pasoCambios = lleva.respuesta && !carta.respuesta;
  const pasoPregunta = !!pregunta && !carta.hora && !pasoCambios;
  const dia = t('ritmo.dias').split(',')[motorDiaSemana(ritmoHoy()) - 1] || '';
  const letras = t('ritmo.carta.letras').split(',');
  const barras = res.barras.filter((b, i) => i < 5 || b.total > 0);
  const nombres = res.ayudo.map((id) => ritmoCartaRutina(id, t, lang));
  const ayudo = nombres.length > 1 ? tn('ritmo.y', { a: nombres[0], b: nombres[1] }) : nombres[0];
  const hechas = tn('ritmo.carta.hechas', { h: res.hechas, t: res.total });
  const S = ritmoCartaStyles;
  return (
    <Modal open maxWidth={420} relleno="20px 18px 14px" ariaLabel={t('ritmo.carta.aria')}>
      <div data-pace-carta style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={S.cab}>
          <span style={S.meta}>{tn('ritmo.carta.titulo', { dia: dia.charAt(0).toUpperCase() + dia.slice(1) })}</span>
          <span style={S.fechas}>{ritmoCartaFechas(res, tn, lang)}</span>
        </div>
        <div style={S.resumen}>
          <div>
            <div style={{ ...S.meta, marginBottom: 3 }}>{t(ayudo ? 'ritmo.carta.ayudo' : 'ritmo.carta.tusemana')}</div>
            <div data-pace-carta-ayudo style={S.ayudo}>{ayudo || hechas}</div>
            {ayudo && <div style={S.hechas}>{hechas}</div>}
          </div>
          <div style={S.barras} aria-hidden="true">
            {barras.map((b) => {
              const v = b.total ? b.hechas / b.total : 0;
              return (
                <div key={b.d} style={S.barra}>
                  <b style={{ display: 'block', width: 14, height: Math.round(6 + v * 38), borderRadius: '4px 4px 2px 2px', background: 'var(--focus)', opacity: (0.35 + v * 0.45).toFixed(2) }} />
                  <span style={S.letra}>{letras[b.d - 1]}</span>
                </div>
              );
            })}
          </div>
        </div>
        {pasoCambios && (
          <div style={S.parte} data-pace-carta-cambios>
            <div style={S.meta}>{t('ritmo.carta.semana')}</div>
            {cambios.length
              ? cambios.map((c) => <RitmoCartaCambio key={ritmoMotorClave(c)} c={c} />)
              : <div style={S.pregunta}>{t('ritmo.carta.igual')}</div>}
          </div>
        )}
        {pasoPregunta && (
          <div style={S.parte} data-pace-carta-pregunta>
            <div style={S.meta}>{t('ritmo.carta.pregunta')}</div>
            <div style={S.pregunta}>{ritmoCartaPreguntaTexto(pregunta, t, tn)}</div>
          </div>
        )}
        {pasoCambios
          ? <RitmoCartaPie datos="cambios" enlace={cambios.length ? t('ritmo.carta.dejar') : null} onEnlace={ritmoCartaDejar}
              pildora={t('ritmo.carta.vale')} onPildora={ritmoCartaVale} />
          : <RitmoCartaPie datos="pregunta" enlace={t('ritmo.carta.no')} onEnlace={() => ritmoCartaHora(false)}
              pildora={t('ritmo.carta.si')} onPildora={() => ritmoCartaHora(true)} />}
      </div>
    </Modal>
  );
}

/* La raíz: mira si hay carta y espera a que la home esté libre para abrirla. */
function RitmoCartaRaiz() {
  const [state] = usePace();
  const [libre, setLibre] = useStateRC(false);
  let carta = null;
  try { carta = ritmoCartaPendiente(state); } catch (e) { carta = null; }
  const hay = !!carta;
  useEffectRC(() => {
    if (!hay || libre) return undefined;
    let timer = null;
    /* La pila de diálogos no lo tiene todo: Ajustes es un `role="dialog"` propio. Cuenta lo
       que se ve. */
    const visible = (sel) => Array.prototype.some.call(document.querySelectorAll(sel), (el) => el.getClientRects().length > 0);
    const mirar = () => {
      const tapa = (typeof paceHayDialogo === 'function' && paceHayDialogo()) || visible('[data-pace-session-root], [role="dialog"], [aria-modal="true"]');
      if (tapa) timer = setTimeout(mirar, 500); else setLibre(true);
    };
    timer = setTimeout(mirar, 400);
    return () => clearTimeout(timer);
  }, [hay, libre]);
  if (!carta || !libre) return null;
  return <RitmoCartaVentana carta={carta} />;
}

/* LO APRENDIDO en «Tu semana»: cada cosa en una frase y su «Olvidar». Sin PACE completo o
   sin nada aprendido, no se pinta. */
function ritmoAprendidoTexto(x, t, tn, lang) {
  const fecha = x.hasta ? ritmoCartaFecha(x.hasta, lang) : '';
  if (x.tipo === 'descansa') return tn('ritmo.aprendido.descansa', { rutina: ritmoCartaRutina(x.id, t, lang), fecha: fecha });
  if (x.tipo === 'menos') return tn('ritmo.aprendido.menos', { fecha: fecha });
  if (x.tipo === 'corta') return tn('ritmo.aprendido.corta', { hora: ritmoHora(x.hora), fecha: fecha });
  if (x.tipo === 'ayuda') {
    const n = x.ids.map((id) => ritmoCartaRutina(id, t, lang));
    return tn('ritmo.aprendido.ayuda', { rutinas: n.length > 1 ? tn('ritmo.y', { a: n[0], b: n[1] }) : n[0] });
  }
  return tn('ritmo.aprendido.' + x.campo, { dias: ritmoCartaDiasPlural(x.dia, t), hora: ritmoHora(x.hora) });
}

function RitmoAprendido({ state }) {
  const { t, tn, lang } = useT();
  const [abierto, setAbierto] = useStateRC(false);
  if (!ritmoPuedeAprender()) return null;
  const lista = ritmoAprendidoLista(state);
  if (!lista.length) return null;
  const S = ritmoCartaStyles;
  const filas = lista.map((x) => (
    <div key={x.clave} style={S.fila} data-pace-aprendido={x.clave}>
      <span>{ritmoAprendidoTexto(x, t, tn, lang)}</span>
      <button type="button" className="pace-rt-enlace" onClick={() => ritmoAprendidoOlvidar(x.clave)}>{t('ritmo.aprendido.olvidar')}</button>
    </div>
  ));
  if (!abierto) {
    return (
      <div style={S.aprendido} data-pace-aprendidos>
        <button type="button" style={S.abrir} data-pace-aprendidos-abrir onClick={() => setAbierto(true)}>
          <span>{lista.length > 1 ? tn('ritmo.aprendido.linea', { n: lista.length }) : t('ritmo.aprendido.linea.1')}</span><span aria-hidden="true">›</span>
        </button>
      </div>
    );
  }
  return (
    <div style={S.aprendido} data-pace-aprendidos>
      <div style={S.meta}>{t('ritmo.aprendido.titulo')}</div>
      {filas}
    </div>
  );
}

Object.assign(window, { ritmoCartaStyles, RitmoCartaVentana, RitmoCartaRaiz, RitmoAprendido });
