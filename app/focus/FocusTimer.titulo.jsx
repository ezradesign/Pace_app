/* PACE · La pestaña: la cuenta atrás del bloque, el icono que se llena y el «terminado»
   Mientras corre un Foco o una pausa, el título de la pestaña dice lo que queda
   («24:13 · Foco · PACE»): quien trabaja en otra pestaña ve el reloj sin volver a PACE
   (auditoría externa, pasada 5, idea 4; fila 4 de la cola). En pausa o con el reloj parado
   vuelve el nombre de siempre (`paceTituloApp`, state-core.palette.jsx).

   EL «TERMINADO» Y EL ICONO (Ez, 1C del 19 nov. 2026): el icono es un aro pequeño que se llena
   mientras corre, y se ve también con la pestaña fijada, que no enseña el título. Cuando un Foco
   acaba sin que lo mires (pestaña detrás o ventana sin el foco), la pestaña dice
   «● Foco terminado · PACE» con el icono en terracota hasta que vuelves: antes volvía al nombre
   y nadie notaba que la cuenta ya no estaba. Si lo estabas mirando, no hace falta.

   Con la pestaña oculta más de cinco minutos, Chrome despierta los temporizadores una vez
   por minuto: el título y el icono se ponen al día entonces. `remaining` sale del reloj real
   (useCountdown), así que lo que dice cuando se escribe es verdad. */

const { useEffect: useEffectTitulo, useState: useStateTitulo } = React;

function paceTituloCuenta(remaining, modo, t) {
  const seg = Math.max(0, Math.floor(remaining || 0));
  const dos = (n) => (n < 10 ? '0' : '') + n;
  const etiqueta = modo === 'foco' ? t('focus.mode.focus')
                 : modo === 'pausa' ? t('focus.mode.pause')
                 : t('focus.mode.long');
  return dos(Math.floor(seg / 60)) + ':' + dos(seg % 60) + ' · ' + etiqueta + ' · PACE';
}

/* ---- El «terminado»: vive fuera de React, porque lo enciende el final del bloque y lo apaga
   volver a la pestaña, venga de donde venga. ---- */
let _paceTabFin = false;
function paceTabMirando() {
  try { return document.visibilityState === 'visible' && document.hasFocus(); } catch (e) { return true; }
}
function paceTabFinPon(on) {
  if (_paceTabFin === !!on) return;
  _paceTabFin = !!on;
  try { window.dispatchEvent(new CustomEvent('pace:pestana-fin')); } catch (e) {}
}
/* Lo llama FocusTimer al acabar un Foco (solo la pestaña que lo cuenta). */
function paceTabTerminado() {
  if (!paceTabMirando()) paceTabFinPon(true);
}
(function paceTabVuelta() {
  const mira = () => { if (_paceTabFin && paceTabMirando()) paceTabFinPon(false); };
  ['visibilitychange', 'pointerdown', 'keydown'].forEach((e) => document.addEventListener(e, mira, true));
  window.addEventListener('focus', mira);
})();

/* ---- El icono: un aro dibujado en un lienzo. Se guardan los iconos de la página para
   devolverlos tal cual; solo se redibuja cuando cambia lo que se ve (32 pasos). ---- */
let _paceIconos = null, _paceIconoUltimo = null;
function paceIconoPon(clave) {
  try {
    if (_paceIconoUltimo === clave) return;
    if (!_paceIconos) {
      _paceIconos = Array.prototype.map.call(document.querySelectorAll('link[rel~="icon"]'), (enlace) => ({ l: enlace, href: enlace.getAttribute('href') }));
    }
    _paceIconoUltimo = clave;
    if (clave === null) { _paceIconos.forEach((o) => o.l.setAttribute('href', o.href)); return; }
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    if (!g) return;
    g.fillStyle = '#F2EDE0';
    g.beginPath(); g.arc(32, 32, 31, 0, 2 * Math.PI); g.fill();
    g.lineWidth = 7;
    g.strokeStyle = '#C9C0A8';
    g.beginPath(); g.arc(32, 32, 21, 0, 2 * Math.PI); g.stroke();
    if (clave === 'fin') {
      g.strokeStyle = '#C97A5D';
      g.beginPath(); g.arc(32, 32, 21, 0, 2 * Math.PI); g.stroke();
      g.fillStyle = '#C97A5D';
      g.beginPath(); g.arc(32, 32, 10, 0, 2 * Math.PI); g.fill();
    } else {
      g.strokeStyle = '#3E5A3A';
      g.lineCap = 'round';
      g.beginPath(); g.arc(32, 32, 21, -Math.PI / 2, -Math.PI / 2 + Math.max(0.04, clave / 32) * 2 * Math.PI); g.stroke();
    }
    const url = c.toDataURL('image/png');
    if (!_paceIconos.length) {
      const nuevo = document.createElement('link');
      nuevo.rel = 'icon';
      document.head.appendChild(nuevo);
      _paceIconos.push({ l: nuevo, href: null });
    }
    _paceIconos.forEach((o) => o.l.setAttribute('href', url));
  } catch (e) {}
}

function useTituloCuenta({ running, remaining, total, modo, lang, t }) {
  const [fin, setFin] = useStateTitulo(_paceTabFin);
  useEffectTitulo(() => {
    const oye = () => setFin(_paceTabFin);
    window.addEventListener('pace:pestana-fin', oye);
    return () => window.removeEventListener('pace:pestana-fin', oye);
  }, []);
  useEffectTitulo(() => {
    try {
      document.title = fin ? t('focus.tab.done') : running ? paceTituloCuenta(remaining, modo, t) : paceTituloApp(lang);
    } catch (e) {}
    const hecho = total > 0 ? 1 - Math.max(0, remaining) / total : 0;
    paceIconoPon(fin ? 'fin' : running ? Math.min(32, Math.floor(hecho * 32)) : null);
  }, [fin, running, remaining, total, modo, lang]);
  /* Si el aro se desmonta corriendo, la pestaña no se queda con una cuenta parada. */
  useEffectTitulo(() => () => {
    try { document.title = paceTituloApp(getState().lang); } catch (e) {}
    paceIconoPon(null);
  }, []);
}

/* Si la pestaña está diciendo «terminado»: la miniventana dice lo mismo hasta que vuelves. */
function paceTabFinEs() { return _paceTabFin; }

Object.assign(window, { useTituloCuenta, paceTituloCuenta, paceTabTerminado, paceTabFinEs });
