/* PACE · state-settings.jsx
   Configuracion: setLang, el modo AUTO de paleta y helpers de settings.
   Split de state.jsx (sesion 57 / v0.27.5).
   Depende de: state-core (getState, setState, detectInitialPalette).
*/

function setLang(lang) {
  setState({ lang });
}

/* ============================================================
   PALETA AUTOMATICA (s161) — seguir al sistema EN CALIENTE
   ============================================================
   REVISA la decision de s89, que no se borra: aquella dijo que el sistema solo
   manda en el PRIMER arranque, y su razon sigue siendo buena — una eleccion
   manual no puede perderse porque el SO cambie. Lo que cambia es que ahora esa
   eleccion incluye «que mande el sistema», y entonces mandar es lo correcto.

   POR SISTEMA Y NO POR HORA, y no es preferencia: esta app YA tiene un dia, y
   dura 25 minutos. `--pace-k` recorre amanecer -> mediodia -> atardecer ->
   noche DENTRO de cada bloque (FocusTimer.jsx). Una paleta por hora del reloj
   mete un SEGUNDO ciclo de dia a otra velocidad: a las 19:00 el papel seria
   noche mientras el aro amanece porque acabas de empezar. Ademas el SO ya trae
   programacion horaria, asi que seguirlo INCLUYE la hora sin que PACE tenga que
   decidir umbrales que dependen de latitud y estacion.

   `palette` nunca vale 'auto' — ver la nota de `paletteAuto` en defaultState.
   ============================================================ */

/* La paleta que el sistema pide AHORA, o null si este navegador no sabe.
   Reutiliza `detectInitialPalette` (state-core.support.jsx) en vez de repetir
   el media query: una sola fuente de verdad para «que quiere el sistema». */
function _paletaDelSistema() {
  try {
    if (!window.matchMedia) return null;
    return detectInitialPalette();
  } catch (e) { return null; }
}

/* ¿Hay un bloque VIVO en pantalla?

   Se lee del DOM A PROPOSITO, y no es pereza: el estado vivo del contador no
   esta en `pace.state.v2` —sale de `useCountdown`, que es estado de React
   dentro de FocusTimer—, asi que la alternativa seria que el Pomodoro publicara
   una bandera nueva en el store. `TimerDial` YA publica dos atributos
   declarativos para esto mismo desde s156 (`data-pace-dial-running` y
   `data-pace-dial-paused`, TimerDial.jsx:93-94), que es exactamente el
   `haySesion = running || status === 'paused'` de FocusTimer expresado en el
   DOM. Consumirlos no toca una linea del Pomodoro.

   COBERTURA, dicha entera: `TimerDial` lo comparten la home y el paso de foco
   de un Camino, asi que esto cubre las dos. NO cubre Respira ni Mueve, cuyas
   sesiones montan `SessionShell` y no un aro; ahi la paleta si cambiaria en
   vivo. Queda declarado, no resuelto: es otra decision de producto. */
function _hayBloqueVivo() {
  try {
    return !!document.querySelector('[data-pace-dial-running], [data-pace-dial-paused]');
  } catch (e) { return false; }
}

/* La paleta que el sistema pidio mientras corria un bloque y todavia no se ha
   aplicado. null = no hay nada pendiente. Vive en memoria y NO se persiste a
   proposito: si la app se cierra con algo pendiente, el `paletteAuto` de
   `loadState` resuelve la paleta buena en el siguiente arranque. Persistirlo
   seria guardar un estado transitorio que ya sabe reconstruirse solo. */
let _paletaPendiente = null;
let _vigilante = null;

function _volcarPendiente() {
  if (_vigilante) { _vigilante.disconnect(); _vigilante = null; }
  const destino = _paletaPendiente;
  _paletaPendiente = null;
  if (!destino) return;
  /* Se relee el modo: entre que se aparco y ahora, la persona ha podido salir
     de Auto tocando una pill — y entonces esto no tiene ningun derecho a
     cambiarle el papel. */
  const s = getState();
  if (!s.paletteAuto) return;
  if (s.palette !== destino) setState({ palette: destino });
}

/* Espera a que el bloque termine. El observador se instala SOLO mientras hay
   algo pendiente y se desconecta al volcar, asi que en el caso normal —que es
   el 100 % del tiempo— esto no observa nada.

   `childList` ademas de los atributos porque el aro puede DESAPARECER entero
   (salir de la home, cerrar el Camino) en vez de perder su atributo, y ese
   final tambien cuenta. El filtro de atributos deja fuera todo lo demas: sin
   el, las ~197 publicaciones de luz por bloque despertarian el observador. */
function _esperarAlFinDelBloque() {
  if (_vigilante) return;
  try {
    _vigilante = new MutationObserver(() => {
      if (!_hayBloqueVivo()) _volcarPendiente();
    });
    _vigilante.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-pace-dial-running', 'data-pace-dial-paused'],
    });
  } catch (e) { /* sin observador, lo resuelve el proximo arranque */ }
}

/* El sistema ha cambiado de tema. */
function _alCambiarElSistema() {
  if (!getState().paletteAuto) return;
  const destino = _paletaDelSistema();
  if (!destino) return;
  if (_hayBloqueVivo()) {
    /* SUSPENDER Y APLICAR AL TERMINAR (decision s161). Dos motivos medidos:
       cambiar en vivo cuesta 32 de 66 frames en la ventana del fundido, y sobre
       todo NO cambia solo el papel — en la paleta oscura `--sun-shade` y
       `--sun-cast` valen exactamente CERO por decision de s158, asi que a mitad
       de bloque el sol perderia su sombra y su proyeccion. El aro ES el sol: no
       se cambia el escenario a mitad de funcion. */
    _paletaPendiente = destino;
    _esperarAlFinDelBloque();
    return;
  }
  if (getState().palette !== destino) setState({ palette: destino });
}

/* Entrar o salir de Auto. Al ENTRAR se resuelve ya, para que el panel cambie en
   el momento y no al recargar — igual que hace la pill de idioma (s139). */
function setPaletteAuto(auto) {
  if (!auto) {
    _paletaPendiente = null;
    if (_vigilante) { _vigilante.disconnect(); _vigilante = null; }
    setState({ paletteAuto: false });
    return;
  }
  const destino = _paletaDelSistema();
  setState(destino ? { paletteAuto: true, palette: destino } : { paletteAuto: true });
}

/* Elegir una paleta a mano APAGA Auto. Es la misma salida que el idioma y la
   que hace que la tercera pill no necesite explicacion: tocar una de las otras
   dos es decir «esta, y no la que diga el sistema». */
function setPalette(palette) {
  _paletaPendiente = null;
  if (_vigilante) { _vigilante.disconnect(); _vigilante = null; }
  setState({ paletteAuto: false, palette });
}

/* Se engancha al evaluar el modulo, como `applyTheme()` en state-core: el
   listener no necesita DOM y el observador se instala solo si hace falta.
   `addEventListener` con caida a `addListener` para WebViews viejos (Capacitor
   es objetivo de v1.0). */
function startPaletteAutoWatcher() {
  try {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', _alCambiarElSistema);
    else if (mq.addListener) mq.addListener(_alCambiarElSistema);
  } catch (e) { /* sin listener, cada arranque sigue resolviendo Auto */ }
}

startPaletteAutoWatcher();

Object.assign(window, {
  setLang,
  setPalette,
  setPaletteAuto,
  startPaletteAutoWatcher,
});
