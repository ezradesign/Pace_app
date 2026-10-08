/* PACE · A tu ritmo · «¿CÓMO ES TU SEMANA?»
   =======================================
   El editor de la semana tipo (state-ritmo.support.jsx): siete días que se tocan para
   pasar de jornada a media y a libre, y las horas una vez, dentro de la frase como en
   la pregunta del día. Lo usan dos sitios con la misma cara (maqueta R2-bienvenida,
   elegida por Ez el 7 de octubre de 2026):

     · la bienvenida, como su segundo paso (Onboarding.jsx);
     · la hoja «Tu semana» de Ajustes, para quien instaló antes y nunca vio la bienvenida
       nueva. La hoja la monta RitmoSemanaRaiz una vez en main.jsx y se abre con un
       evento de ventana, como la del calendario.

   El editor no guarda: trabaja sobre un borrador (`dias` y las horas tocadas) y quien lo
   usa decide cuándo (ritmoGuardarSemana). Así abrir la bienvenida no escribe nada. */

const { useState: useStateRST, useEffect: useEffectRST } = React;

/* El dibujo de un tipo de día: lleno, medio o vacío (punteado). */
function RitmoSemanaGlifo({ tipo, alto }) {
  const base = { ...ritmoSemanaStyles.glifo, height: alto || 30 };
  if (tipo === 'jornada') return <span aria-hidden="true" style={{ ...base, background: 'var(--focus-cta)' }} />;
  if (tipo === 'media') return (
    <span aria-hidden="true" style={{ ...base, background: 'var(--paper-3)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
      <span style={{ height: '50%', background: 'var(--focus-cta)' }} />
    </span>
  );
  return <span aria-hidden="true" style={{ ...base, border: '1.5px dotted var(--line-2)', boxSizing: 'border-box' }} />;
}

/* dias: los siete tipos, lunes primero · onDias(nuevos) · horario: el normalizado con el
   borrador aplicado · onHora(campo, minutos). Devuelve UN solo elemento: dentro de la
   bienvenida cuenta como un hijo del reveal escalonado, que tiene retrasos para ocho. */
function RitmoSemanaEditor({ dias, onDias, horario, onHora }) {
  const { t } = useT();
  const letras = String(t('stats.month.days.short')).split(',');
  const huecos = ritmoHuecos(horario, onHora);
  const nombre = (tipo) => <b style={ritmoSemanaStyles.nombre}>{t('ritmo.st.tipo.' + tipo)}</b>;
  return (
    <div data-pace-semana-editor style={ritmoSemanaStyles.editor}>
      <div style={ritmoSemanaStyles.dias}>
        {dias.map((tipo, i) => (
          <button key={i} type="button" data-pace-semana-dia={i + 1} data-pace-semana-tipo={tipo || ''}
            aria-label={t('ritmo.st.aria').replace('{dia}', ritmoNombreDia(i + 1, t)).replace('{tipo}', t('ritmo.st.tipo.' + (tipo || 'libre')))}
            onClick={() => onDias(dias.map((d, j) => (j === i ? ritmoTipoSiguiente(d) : d)))}
            style={{ ...ritmoSemanaStyles.dia, ...(tipo === 'libre' ? ritmoSemanaStyles.diaLibre : null) }}>
            <span style={{ ...ritmoSemanaStyles.letra, color: tipo === 'libre' ? 'var(--ink-3)' : 'var(--ink)' }}>{letras[i]}</span>
            <RitmoSemanaGlifo tipo={tipo} />
          </button>
        ))}
      </div>
      <p style={ritmoSemanaStyles.toca}>{t('ritmo.st.toca')}</p>
      <div style={ritmoSemanaStyles.leyenda}>
        <div style={ritmoSemanaStyles.fila}>
          <RitmoSemanaGlifo tipo="jornada" alto={18} />
          <span style={ritmoSemanaStyles.frase}><RitmoFrase plantilla={t(horario.sinComida ? 'ritmo.st.jornada.sin' : 'ritmo.st.jornada')} huecos={{ ...huecos, nombre: nombre('jornada') }} /></span>
        </div>
        <div style={ritmoSemanaStyles.fila}>
          <RitmoSemanaGlifo tipo="media" alto={18} />
          <span style={ritmoSemanaStyles.frase}><RitmoFrase plantilla={t('ritmo.st.media')} huecos={{ ...huecos, nombre: nombre('media') }} /></span>
        </div>
        <div style={ritmoSemanaStyles.fila}>
          <RitmoSemanaGlifo tipo="libre" alto={18} />
          <span style={ritmoSemanaStyles.frase}><RitmoFrase plantilla={t('ritmo.st.libre')} huecos={{ nombre: nombre('libre') }} /></span>
        </div>
      </div>
    </div>
  );
}

/* El borrador que comparten la bienvenida y la hoja: los días y las horas tocadas. */
function useRitmoSemanaBorrador(state) {
  const R = ritmoDe(state);
  const [dias, setDias] = useStateRST(() => (R.semanaTipo ? R.semanaTipo.map((d) => d || 'libre') : RITMO_SEMANA_DEFECTO.slice()));
  const [horas, setHoras] = useStateRST({});
  const crudo = state && state.ritmo ? state.ritmo.horario : null;
  return {
    dias, setDias, horas,
    horario: ritmoHorarioCon(R.horario, horas, crudo),
    onHora: (campo, v) => setHoras((h) => ({ ...h, [campo]: v })),
  };
}

function ritmoSemanaAbrir() {
  window.dispatchEvent(new CustomEvent('pace:ritmo-semana'));
}

/* La hoja de Ajustes. Mira si está abierta ANTES de leer el estado. */
function RitmoSemanaRaiz() {
  const [abierta, setAbierta] = useStateRST(false);
  useEffectRST(() => {
    const abrir = () => setAbierta(true);
    window.addEventListener('pace:ritmo-semana', abrir);
    return () => window.removeEventListener('pace:ritmo-semana', abrir);
  }, []);
  if (!abierta) return null;
  return <RitmoSemanaHoja onClose={() => setAbierta(false)} />;
}

function RitmoSemanaHoja({ onClose }) {
  const { t } = useT();
  const [state] = usePace();
  const b = useRitmoSemanaBorrador(state);
  const guardar = (tipo) => { ritmoGuardarSemana(tipo, b.horas); onClose(); };
  return (
    <Modal open onClose={onClose} maxWidth={460} tagLabel={t('ritmo.nombre')} title={t('ritmo.st.titulo')} subtitle={t('ritmo.st.sub')}>
      <div data-pace-semana-hoja style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <RitmoSemanaEditor dias={b.dias} onDias={b.setDias} horario={b.horario} onHora={b.onHora} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <button type="button" data-pace-semana-guardar onClick={() => guardar(b.dias)} style={ritmoSemanaStyles.guardar}>
            <span style={ritmoSemanaStyles.pildora}>{t('ritmo.st.guardar')}</span>
          </button>
          <button type="button" data-pace-semana-saltar onClick={() => guardar(null)} style={ritmoSemanaStyles.saltar}>{t('ritmo.st.saltar')}</button>
        </div>
      </div>
    </Modal>
  );
}

const ritmoSemanaStyles = {
  editor: { width: '100%', display: 'flex', flexDirection: 'column', gap: 10 },
  dias: { display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 },
  dia: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
    height: 84, padding: '10px 0 9px', boxSizing: 'border-box', minWidth: 0,
    border: '1px solid var(--line)', borderRadius: 12, background: 'var(--paper)',
    color: 'var(--ink)', cursor: 'pointer', font: 'inherit',
  },
  diaLibre: { borderStyle: 'dashed', background: 'transparent' },
  letra: { fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)' },
  glifo: { width: 12, borderRadius: 6, display: 'block', flexShrink: 0, justifySelf: 'center' },
  toca: { margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-3)', textAlign: 'center' },
  leyenda: {
    marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--paper-3)',
    display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left',
  },
  fila: { display: 'grid', gridTemplateColumns: '26px minmax(0, 1fr)', gap: 10, alignItems: 'center', justifyItems: 'center' },
  frase: { justifySelf: 'start', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, lineHeight: 1.5, color: 'var(--ink-2)' },
  nombre: { fontWeight: 500, color: 'var(--ink)' },
  guardar: { minHeight: 44, display: 'flex', alignItems: 'center', border: 0, background: 'none', padding: 0, cursor: 'pointer' },
  pildora: {
    display: 'flex', alignItems: 'center', height: 34, padding: '0 18px', borderRadius: 17,
    background: 'var(--paper-2)', border: '1px solid rgba(62,90,58,.35)', color: 'var(--focus)',
    fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18,
  },
  saltar: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-3)', background: 'transparent', border: 'none', padding: '8px 10px', cursor: 'pointer' },
};

Object.assign(window, { RitmoSemanaGlifo, RitmoSemanaEditor, useRitmoSemanaBorrador, ritmoSemanaAbrir, RitmoSemanaRaiz, RitmoSemanaHoja });
