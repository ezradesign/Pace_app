/* PACE · state-settings.jsx
   Configuracion: setLang y helpers de settings.
   Split de state.jsx (sesion 57 / v0.27.5).
   Depende de: state-core (setState).
*/

function setLang(lang) {
  setState({ lang });
}

Object.assign(window, {
  setLang,
});
