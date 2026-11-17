/* PACE · A tu ritmo · EL CALENDARIO A LA VISTA
   ===========================================
   Ez, 16 nov. 2026, mirando «¿Cuánto trabajas hoy?» en la web: «¿no habría que poner una opción
   para sincronizar el calendario? Es una de las cosas que más valor le dan a la app». Hasta
   entonces «Al calendario» solo salía después de elegir el día. Eligió mirando las fotos
   (docs/proposals/calendario-vista-16nov/): 1A, un enlace que dice cómo está, y 2A, que abre la
   hoja de siempre sin día (RitmoCalendarioHoja con `plan` null) para conectar ya.

   DÓNDE: en el ordenador, en la cabecera de la tarjeta, delante de «Ajustar el horario»; en el
   móvil, al final del esquema del día, como «Ver todo» al final de la línea del día elegido.
   NO PUEDE AÑADIR ALTO: la home no pide scroll en ningún momento (tests/home-sin-scroll.spec.js),
   tampoco con la letra al 115 %. Por eso en el móvil la letra va con su alto de línea fijo
   (14 px, el del esquema) y el dedo tiene 44 px con un relleno que el margen negativo devuelve.

   QUÉ DICE: «Al calendario», o «Calendario conectado» cuando el día irá solo al elegirlo
   (`calendarioConectadoAhora`); en el móvil, «Conectado», porque al final del esquema el largo
   se salía de la tarjeta con la letra al 115 % (medido en la maqueta). El dibujo dice de qué.

   NI UN BACKTICK DENTRO DEL TEMPLATE LITERAL (trampa de s172b). */

(function () {
  if (document.getElementById('pace-ritmo-cal-tarjeta-css')) return;
  const s = document.createElement('style');
  s.id = 'pace-ritmo-cal-tarjeta-css';
  s.textContent = `
.pace-rt-cal-ir { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer;
  padding: 6px 0; margin: -6px 0; white-space: nowrap; }
.pace-rt-cal-ir svg { flex: 0 0 auto; }
.pace-rt-cal-ir:focus-visible { outline: 2px solid var(--focus-cta); outline-offset: 2px; border-radius: 2px; }
.pace-rt-esq-fila { display: flex; align-items: center; gap: 12px; margin-top: 14px; }
.pace-rt-esq-fila .pace-rt-esquema { flex: 1 1 auto; min-width: 0; margin-top: 0; }
.pace-rt-esq-fila .pace-rt-cal-ir { flex: 0 0 auto; font-size: 13px; line-height: 14px; padding: 15px 0; margin: -15px 0; }
@media (max-height: 700px) { .pace-rt-esq-fila { margin-top: 4px; } }
`;
  document.head.appendChild(s);
})();

/* El calendario en línea, de la familia de los iconos de PACE: 12 px, trazo 1,1, currentColor. */
function RitmoCalendarioIcono() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1.2" y="2.2" width="9.6" height="8.6" rx="1.6" /><path d="M1.2 4.9h9.6" /><path d="M3.9 1v2.3M8.1 1v2.3" />
    </svg>
  );
}

/* El enlace. `corto`: el del móvil. Repinta con el estado (usePace) y con el motor del calendario
   (`pace:calendario-solo`), que es quien sabe si el permiso sigue vivo. */
function RitmoCalendarioTarjeta({ corto }) {
  const { t } = useT();
  usePace();
  useCalendarioSolo();
  const conectado = typeof calendarioConectadoAhora === 'function' && calendarioConectadoAhora();
  const texto = !conectado ? t('cal.enlace') : t(corto ? 'cal.enlace.conectado.corto' : 'cal.enlace.conectado');
  return (
    <button type="button" className="pace-rt-enlace pace-rt-fuerte pace-rt-cal-ir" data-pace-ritmo-tarjeta-calendario
      data-pace-cal-estado={conectado ? 'conectado' : 'no'} onClick={ritmoCalendarioAbrir}>
      <RitmoCalendarioIcono /><span>{texto}</span>
    </button>
  );
}

Object.assign(window, { RitmoCalendarioTarjeta, RitmoCalendarioIcono });
