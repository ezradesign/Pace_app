/* PACE · Glifos canónicos de logros · sesión 83 / v0.33.3
   Extraídos literalmente de app/achievements/Achievements.jsx (v0.32.0, s78).

   Glifos Dirección D — portados literalmente de design/glyphs-explorations.html.
   Última verificación: sesión 48d (re-aplicada en hotfix 48d.1 tras truncamiento).
   currentColor para que el Seal aplique tono según estado.
   NO modificar a ojo: editar primero la exploración y volver a portar.
   Excepción: secret.cow.click (sin canónico, es secreto).

   ALMACENAMIENTO: strings de SVG envueltos por g(body), no JSX. El consumidor
   renderGlyph() en Achievements.jsx los inyecta via dangerouslySetInnerHTML.

   CONVIVENCIA: este archivo es hermano de app/glyphs/exercise-glyphs.jsx
   (s60, v0.28.1). Dos sistemas visuales distintos (heráldica vs line-art)
   conviviendo en app/glyphs/. NO unificar: son sistemas conceptualmente
   independientes con reglas de dibujo distintas.

   Se expone via window.ACHIEVEMENT_GLYPHS para uso desde catalog.js (que
   construye las entradas del catálogo con glyphSvg). Eventualmente otros
   módulos (Toast, CompletionScreen) podrían leerlo si necesitan pintar
   un glifo suelto sin tirar del catálogo entero. */
const SVG_PFX = `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">`;
const SVG_SFX = `</svg>`;
const g = (body) => SVG_PFX + body + SVG_SFX;

const GLYPH_SVG = {
  'first.step':               g(`<circle cx="22" cy="22" r="2.4" fill="currentColor"/> <circle cx="22" cy="22" r="8" stroke="currentColor" stroke-width="0.6" fill="none" opacity="0.6"/>`),
  'first.breath':             g(`<circle cx="10" cy="22" r="2" fill="currentColor"/> <circle cx="22" cy="14" r="2" fill="currentColor"/> <circle cx="34" cy="22" r="2" fill="currentColor"/> <path d="M10 22 Q22 14 34 22" stroke="currentColor" stroke-width="0.6" fill="none"/>`),
  'first.stretch':            g(`<circle cx="22" cy="10" r="2" fill="currentColor"/> <circle cx="34" cy="22" r="2" fill="currentColor"/> <circle cx="22" cy="34" r="2" fill="currentColor"/> <circle cx="10" cy="22" r="2" fill="currentColor"/> <path d="M22 10 L34 22 L22 34 L10 22 Z" stroke="currentColor" stroke-width="0.6" fill="none"/>`),
  'first.sip':                g(`<circle cx="22" cy="22" r="2.4" fill="currentColor"/> <circle cx="22" cy="22" r="11" stroke="currentColor" stroke-width="0.6" fill="none"/>`),
  'first.extra':              g(`<circle cx="14" cy="14" r="2" fill="currentColor"/> <circle cx="30" cy="30" r="2" fill="currentColor"/> <circle cx="30" cy="14" r="2" fill="currentColor"/> <circle cx="14" cy="30" r="2" fill="currentColor"/> <path d="M14 14 L30 30 M30 14 L14 30" stroke="currentColor" stroke-width="0.6"/>`),
  'first.cycle':              g(`<circle cx="22" cy="22" r="11" stroke="currentColor" stroke-width="0.6" fill="none"/> <circle cx="22" cy="11" r="2" fill="currentColor"/>`),
  'first.ritual':             g(`<circle cx="22" cy="8" r="1.8" fill="currentColor"/> <circle cx="36" cy="22" r="1.8" fill="currentColor"/> <circle cx="22" cy="36" r="1.8" fill="currentColor"/> <circle cx="8" cy="22" r="1.8" fill="currentColor"/> <circle cx="22" cy="22" r="2.4" fill="currentColor"/> <path d="M22 8 L22 36 M8 22 L36 22 M22 22 L22 22" stroke="currentColor" stroke-width="0.5" opacity="0.5"/>`),
  'first.day':                g(`<circle cx="34" cy="14" r="2" fill="currentColor"/> <path d="M30 12 A12 12 0 1 0 34 28" stroke="currentColor" stroke-width="0.6" fill="none"/>`),
  'streak.3':                 g(`<circle cx="14" cy="22" r="2" fill="currentColor"/> <circle cx="22" cy="22" r="2" fill="currentColor"/> <circle cx="30" cy="22" r="2" fill="currentColor"/> <path d="M14 22 L30 22" stroke="currentColor" stroke-width="0.5" opacity="0.5"/>`),
  'streak.7':                 g(`<circle cx="8" cy="22" r="1.6" fill="currentColor"/> <circle cx="14" cy="14" r="1.6" fill="currentColor"/> <circle cx="22" cy="10" r="1.6" fill="currentColor"/> <circle cx="30" cy="14" r="1.6" fill="currentColor"/> <circle cx="36" cy="22" r="1.6" fill="currentColor"/> <circle cx="30" cy="30" r="1.6" fill="currentColor"/> <circle cx="14" cy="30" r="1.6" fill="currentColor"/> <path d="M8 22 L14 14 L22 10 L30 14 L36 22 L30 30 L14 30 Z" stroke="currentColor" stroke-width="0.5" fill="none" opacity="0.5"/>`),
  'streak.30':                g(`<circle cx="22" cy="22" r="11" stroke="currentColor" stroke-width="0.6" fill="none"/> <circle cx="22" cy="22" r="3" fill="currentColor"/>`),
  'streak.365':               g(`<circle cx="22" cy="6" r="1.6" fill="currentColor"/> <circle cx="36" cy="13" r="1.6" fill="currentColor"/> <circle cx="38" cy="28" r="1.6" fill="currentColor"/> <circle cx="28" cy="38" r="1.6" fill="currentColor"/> <circle cx="14" cy="36" r="1.6" fill="currentColor"/> <circle cx="6" cy="24" r="1.6" fill="currentColor"/> <circle cx="10" cy="10" r="1.6" fill="currentColor"/> <circle cx="22" cy="22" r="2.4" fill="currentColor"/> <path d="M22 6 L36 13 L38 28 L28 38 L14 36 L6 24 L10 10 Z" stroke="currentColor" stroke-width="0.5" fill="none" opacity="0.5"/>`),
  'focus.hours.100':          g(`<text x="22" y="29" text-anchor="middle" font-family="EB Garamond" font-style="italic" font-size="18" fill="currentColor">C</text>`),
  'breathe.sessions.10':      g(`<circle cx="10" cy="22" r="1.6" fill="currentColor"/> <circle cx="18" cy="16" r="1.6" fill="currentColor"/> <circle cx="26" cy="28" r="1.6" fill="currentColor"/> <circle cx="34" cy="18" r="1.6" fill="currentColor"/> <path d="M10 22 Q14 19 18 16 Q22 22 26 28 Q30 23 34 18" stroke="currentColor" stroke-width="0.5" fill="none" opacity="0.5"/>`),
  'breathe.sessions.50':      g(`<circle cx="8" cy="14" r="1.4" fill="currentColor"/> <circle cx="16" cy="20" r="1.4" fill="currentColor"/> <circle cx="24" cy="14" r="1.4" fill="currentColor"/> <circle cx="32" cy="20" r="1.4" fill="currentColor"/> <circle cx="8" cy="26" r="1.4" fill="currentColor"/> <circle cx="16" cy="32" r="1.4" fill="currentColor"/> <circle cx="24" cy="26" r="1.4" fill="currentColor"/> <circle cx="32" cy="32" r="1.4" fill="currentColor"/>`),
  'move.sessions.25':         g(`<circle cx="14" cy="14" r="1.6" fill="currentColor"/> <circle cx="30" cy="14" r="1.6" fill="currentColor"/> <circle cx="14" cy="22" r="1.6" fill="currentColor"/> <circle cx="30" cy="22" r="1.6" fill="currentColor"/> <circle cx="14" cy="30" r="1.6" fill="currentColor"/> <circle cx="30" cy="30" r="1.6" fill="currentColor"/> <path d="M14 14 L30 14 M14 22 L30 22 M14 30 L30 30" stroke="currentColor" stroke-width="0.5" opacity="0.4"/>`),
  'explore.box':              g(`<circle cx="11" cy="11" r="2" fill="currentColor"/> <circle cx="33" cy="11" r="2" fill="currentColor"/> <circle cx="33" cy="33" r="2" fill="currentColor"/> <circle cx="11" cy="33" r="2" fill="currentColor"/> <rect x="11" y="11" width="22" height="22" stroke="currentColor" stroke-width="0.6" fill="none" opacity="0.5"/>`),
  'explore.coherent':         g(`<circle cx="22" cy="6" r="2" fill="currentColor"/> <circle cx="22" cy="38" r="2" fill="currentColor"/> <circle cx="22" cy="22" r="2.4" fill="currentColor"/> <path d="M22 6 C28 14 28 30 22 38 C16 30 16 14 22 6 Z" stroke="currentColor" stroke-width="0.6" fill="none" opacity="0.5"/>`),
  'explore.rounds':           g(`<circle cx="22" cy="8" r="2" fill="currentColor"/> <circle cx="36" cy="22" r="2" fill="currentColor"/> <circle cx="22" cy="36" r="2" fill="currentColor"/> <circle cx="8" cy="22" r="2" fill="currentColor"/> <path d="M22 8 A14 14 0 1 1 8 22" stroke="currentColor" stroke-width="0.6" fill="none" opacity="0.6"/>`),
  'explore.nadi':             g(`<circle cx="14" cy="22" r="1.8" fill="currentColor"/> <circle cx="30" cy="22" r="1.8" fill="currentColor"/> <circle cx="22" cy="14" r="1.8" fill="currentColor"/> <circle cx="22" cy="30" r="1.8" fill="currentColor"/> <ellipse cx="22" cy="22" rx="6" ry="14" stroke="currentColor" stroke-width="0.5" fill="none" opacity="0.5"/> <ellipse cx="22" cy="22" rx="14" ry="6" stroke="currentColor" stroke-width="0.5" fill="none" opacity="0.5"/>`),
  'explore.physiological':    g(`<circle cx="10" cy="30" r="2" fill="currentColor"/> <circle cx="22" cy="22" r="2" fill="currentColor"/> <circle cx="33" cy="14" r="2" fill="currentColor"/> <path d="M10 30 Q14 22 22 22 Q28 22 33 14" stroke="currentColor" stroke-width="0.5" fill="none" opacity="0.6"/> <path d="M28 11 L33 14 L31 19" stroke="currentColor" stroke-width="0.6" fill="none" opacity="0.6"/>`),
  'explore.hips':             g(`<circle cx="22" cy="8" r="2" fill="currentColor"/> <circle cx="36" cy="22" r="2" fill="currentColor"/> <circle cx="22" cy="36" r="2" fill="currentColor"/> <circle cx="8" cy="22" r="2" fill="currentColor"/> <path d="M22 8 L36 22 L22 36 L8 22 Z" stroke="currentColor" stroke-width="0.5" fill="none" opacity="0.5"/>`),
  'explore.atg':              g(`<circle cx="22" cy="9" r="2" fill="currentColor"/> <circle cx="34" cy="31" r="2" fill="currentColor"/> <circle cx="10" cy="31" r="2" fill="currentColor"/> <path d="M22 9 L34 31 L10 31 Z" stroke="currentColor" stroke-width="0.5" fill="none" opacity="0.5"/>`),
  'explore.ancestral':        g(`<circle cx="14" cy="11" r="1.8" fill="currentColor"/> <circle cx="30" cy="11" r="1.8" fill="currentColor"/> <circle cx="36" cy="22" r="1.8" fill="currentColor"/> <circle cx="30" cy="33" r="1.8" fill="currentColor"/> <circle cx="14" cy="33" r="1.8" fill="currentColor"/> <circle cx="8" cy="22" r="1.8" fill="currentColor"/> <path d="M14 11 L30 11 L36 22 L30 33 L14 33 L8 22 Z" stroke="currentColor" stroke-width="0.5" fill="none" opacity="0.5"/>`),
  'master.pomodoro.8':        g(`<text x="22" y="29" text-anchor="middle" font-family="EB Garamond" font-style="italic" font-size="14" fill="currentColor">VIII</text>`),
  'master.long.focus':        g(`<circle cx="8" cy="22" r="2" fill="currentColor"/> <circle cx="36" cy="22" r="2" fill="currentColor"/> <path d="M8 22 L36 22" stroke="currentColor" stroke-width="0.6" opacity="0.6"/>`),
  'master.dawn':              g(`<circle cx="22" cy="22" r="6" stroke="currentColor" stroke-width="0.6" fill="none"/> <circle cx="22" cy="6" r="1.6" fill="currentColor"/> <circle cx="22" cy="38" r="1.6" fill="currentColor"/> <circle cx="6" cy="22" r="1.6" fill="currentColor"/> <circle cx="38" cy="22" r="1.6" fill="currentColor"/> <path d="M22 6 L22 38 M6 22 L38 22" stroke="currentColor" stroke-width="0.4" opacity="0.4"/>`),
  'master.dusk':              g(`<circle cx="22" cy="22" r="11" stroke="currentColor" stroke-width="0.6" fill="none"/> <circle cx="14" cy="14" r="1.6" fill="currentColor"/> <circle cx="30" cy="30" r="1.6" fill="currentColor"/>`),
  'master.focus.day':         g(`<circle cx="22" cy="22" r="11" stroke="currentColor" stroke-width="0.6" fill="none"/> <circle cx="22" cy="22" r="2" fill="currentColor"/> <circle cx="22" cy="13" r="1.4" fill="currentColor"/> <circle cx="29" cy="26" r="1.4" fill="currentColor"/> <path d="M22 22 L22 13 M22 22 L29 26" stroke="currentColor" stroke-width="0.5" opacity="0.6"/>`),
  'master.retreat':           g(`<circle cx="22" cy="22" r="2.4" fill="currentColor"/> <circle cx="14" cy="22" r="1.4" fill="currentColor"/> <circle cx="30" cy="22" r="1.4" fill="currentColor"/> <path d="M14 22 Q22 12 30 22 Q22 32 14 22 Z" stroke="currentColor" stroke-width="0.5" fill="none" opacity="0.6"/>`),
  'master.marathon':          g(`<circle cx="6" cy="32" r="1.8" fill="currentColor"/> <circle cx="22" cy="12" r="1.8" fill="currentColor"/> <circle cx="38" cy="32" r="1.8" fill="currentColor"/> <path d="M6 32 L22 12 L38 32" stroke="currentColor" stroke-width="0.5" fill="none" opacity="0.5"/>`),
  'master.centurion':         g(`<text x="22" y="30" text-anchor="middle" font-family="EB Garamond" font-style="italic" font-size="22" fill="currentColor">C</text>`),
  'secret.cow.click':         g(`<circle cx="12.8" cy="16.5" r="2.2" fill="currentColor"/><circle cx="22" cy="25.7" r="2.2" fill="currentColor"/><circle cx="31.2" cy="16.5" r="2.2" fill="currentColor"/><circle cx="9.2" cy="31.2" r="2.2" fill="currentColor"/><circle cx="34.8" cy="31.2" r="2.2" fill="currentColor"/><circle cx="36.7" cy="12.8" r="1.8" fill="currentColor" opacity="0.7"/><path d="M9.2 31.2 L12.8 16.5 L22 25.7 L31.2 16.5 L34.8 31.2" stroke="currentColor" stroke-width="0.5" fill="none" opacity="0.4"/>`),
  /* s78 - master.path.all7: heptagono regular con 7 vertices + centro.
     Familia visual de streak.7/streak.365 (puntos pequenos en poligono
     mas linea uniendolos en opacity 0.5). El centro 2.4 marca "completo". */
  'master.path.all7':         g(`<circle cx="22" cy="6" r="1.6" fill="currentColor"/> <circle cx="35" cy="13" r="1.6" fill="currentColor"/> <circle cx="38" cy="26" r="1.6" fill="currentColor"/> <circle cx="29" cy="37" r="1.6" fill="currentColor"/> <circle cx="15" cy="37" r="1.6" fill="currentColor"/> <circle cx="6" cy="26" r="1.6" fill="currentColor"/> <circle cx="9" cy="13" r="1.6" fill="currentColor"/> <circle cx="22" cy="22" r="2.4" fill="currentColor"/> <path d="M22 6 L35 13 L38 26 L29 37 L15 37 L6 26 L9 13 Z" stroke="currentColor" stroke-width="0.5" fill="none" opacity="0.5"/>`),
};
/* first.plan comparte glifo con first.ritual (misma trigger — decisión s28) */
GLYPH_SVG['first.plan'] = GLYPH_SVG['first.ritual'];

Object.assign(window, { ACHIEVEMENT_GLYPHS: GLYPH_SVG });
