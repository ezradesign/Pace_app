/* PACE · i18n helper — useT + detectInitialLang
   Sesión 35 · v0.17.0

   DEBE cargarse DESPUÉS de strings.js y ANTES de state.jsx,
   porque state.jsx llama a detectInitialLang() al evaluar loadState().
*/

function detectInitialLang() {
  const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return nav === 'es' ? 'es' : 'en';
}

/* isDev: true en localhost, 127.0.0.1 o file:// — activa console.warn
   para claves faltantes. En producción (dominio real) es silencioso. */
const _i18nIsDev = (
  ['localhost', '127.0.0.1'].includes(location.hostname) ||
  location.protocol === 'file:'
);

/* useT — hook reactivo que lee state.lang y devuelve las funciones
   de traducción t() y tn() (con variables {key}).

   Depende de usePace (state.jsx) y PACE_STRINGS (strings.js).
   Ambos deben estar cargados antes de que cualquier componente
   que use useT() se monte. */
function useT() {
  const [state] = usePace();
  const lang = state.lang || 'en';

  function t(key) {
    const strings = window.PACE_STRINGS;
    if (!strings) return key;
    if (strings[lang] && strings[lang][key] !== undefined) return strings[lang][key];
    if (strings.en && strings.en[key] !== undefined) {
      if (_i18nIsDev) console.warn(`[i18n] missing ${lang}: ${key}`);
      return strings.en[key];
    }
    if (_i18nIsDev) console.warn(`[i18n] missing key: ${key}`);
    return key;
  }

  function tn(key, vars) {
    let str = t(key);
    if (vars) {
      Object.keys(vars).forEach(k => {
        str = str.split(`{${k}}`).join(String(vars[k]));
      });
    }
    return str;
  }

  return { t, tn, lang };
}

/* Una fecha corta en el idioma de la app. En inglés Chrome escribe «Sept» (en-GB)
   y Estadísticas «Sep»: se deja «Sep», como los otros once meses (Ez, 8 oct. 2026). */
function paceFechaCorta(fecha, lang, opciones) {
  /* Una clave «AAAA-MM-DD» se lee en hora local: `new Date('2026-10-16')` es la
     medianoche UTC y en América se pintaría el 15 (CLAUDE.md, regla 10). */
  const m = typeof fecha === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(fecha);
  const s = d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', opciones);
  return lang === 'en' ? s.replace(/\bSept\b/g, 'Sep') : s;
}

Object.assign(window, { useT, detectInitialLang, paceFechaCorta });
