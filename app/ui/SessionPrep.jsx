/* PACE · app/ui/SessionPrep.jsx (sesión 174)
   ============================================
   LA PANTALLA DE PREPARACIÓN, extraída de `SessionShell.jsx` al rebasar aquel
   las 500 líneas (regla §1 de CLAUDE.md, vigilada con trinquete desde s162:
   trocear, NO añadir a la tabla de deuda).

   Se eligió ESTA costura y no otra porque `SessionPrep` es una PANTALLA
   completa y autónoma —consume el shell, no lo define—, mientras que el resto
   del archivo es el shell, su cabecera, la atmósfera y el grano, que sí se
   necesitan entre sí. Lo que sale es lo único que podía irse sin arrastrar
   nada detrás.

   CARGA DESPUÉS de `SessionShell.jsx` (usa `SessionShell` y
   `sessionShellStyles`) y ANTES de los runners, que la montan. */

/* ============================================================
   SessionPrep — pantalla de cuenta atrás 3-2-1
   Props:
     - routine        → header passthrough
     - onExit         → header passthrough
     - accent         → color del número gigante (var CSS)
     - prepCount      → número a mostrar (3..0)
     - copy           → línea italic bajo el número
                        ("Siéntate cómodo. Respira natural." / "De pie. Sin prisa. 6 pasos.")
     - onSkip         → callback del botón "Empezar ahora"
   ============================================================ */
/* s174 · LA CUENTA ATRÁS PUEDE LLEVAR EL ARTE DE LA RUTINA, y ese es el destino
   de la transición desde la biblioteca (opción A).
   POR QUÉ AQUÍ Y NO EN EL CÍRCULO DEL RUNNER, que es lo que el diseño decía:
   medido en s174, entre la capitular de la tarjeta y el círculo del runner hay
   DOS pantallas —el Preview y esta— y el círculo tarda **3.114 ms** en existir
   desde que pulsas «Empezar». Los dos elementos nunca están cerca en el tiempo,
   así que no hay movimiento continuo posible hasta allí. Esta pantalla SÍ está
   a un frame, y además es el sitio donde va a aparecer el círculo: el arte
   aterriza en su tamaño y su posición, y cuando la cuenta termina el círculo
   del runner lo releva sin que nada salte.
   De regalo arregla algo real: hasta hoy esta pantalla era un número sobre nada
   y no decía qué ibas a hacer.
   `stepName` AUSENTE = comportamiento de siempre, byte a byte. Respira no pasa
   arte (sus rutinas no tienen glifo de ejercicio) y no se entera de nada. */
function SessionPrep({ routine, onExit, accent, accentSoft, prepCount, copy, onSkip, atmosphere }) {
  const { t } = useT();
  /* EL ARTE SE DERIVA AQUÍ, no lo pasan los runners. Los dos lo habrían pasado
     con la misma expresión, y entonces «qué dibujo enseña la preparación y de
     qué tamaño» sería una decisión escrita en tres sitios que hay que mantener
     de acuerdo. El tamaño sale de `v1GlyphSize`, que es la MISMA fuente que usa
     el círculo del runner: por eso el relevo no salta.
     RESPIRA NO SE ENTERA: sus 20 rutinas no tienen `steps` (llevan `pattern` y
     `cycle`), así que aquí no hay nombre de paso y la pantalla es la de
     siempre, byte a byte. */
  const primerPaso = routine && routine.steps && routine.steps[0] && routine.steps[0].name;
  const glyphSize = (typeof v1GlyphSizeAhora === 'function') ? v1GlyphSizeAhora() : 0;
  const stepName = primerPaso;
  const conArte = !!stepName && typeof StepGlyph === 'function' && glyphSize > 0;
  const numero = prepCount > 0 ? prepCount : '·';
  if (conArte) {
    return (
      <SessionShell
        routine={routine}
        onExit={onExit}
        atmosphere={atmosphere}
        footer={<button onClick={onSkip} style={sessionShellStyles.ctrlBtn}>{t('session.startNow')}</button>}
      >
        <div data-pace-session-prep style={{ textAlign: 'center', maxWidth: 460 }}>
          {/* EL CÍRCULO VA PRIMERO, y el rótulo debajo. No es composición: es la
              única forma de que el arte esté DONDE va a estar el círculo del
              paso. Medido antes de moverlo: con el rótulo encima, al terminar
              la cuenta el dibujo pegaba un salto de **171 px** en escritorio y
              **221 px** en móvil -- el runner ancla su bloque ARRIBA (s172b) y
              esta pantalla se centraba, así que el relevo, que era justo lo que
              la transición venía a arreglar, saltaba más que antes. */}
          <div data-pace-session-prep-art style={{
            position: 'relative', width: glyphSize, margin: '0 auto',
            /* el numeral se dimensiona CON el círculo, no con el breakpoint: la
               hoja responsive fija 128 px al de siempre, y aquí eso llenaría el
               círculo entero. Viaja como token para que una sola regla lo lea. */
            '--pace-prep-num': Math.round(glyphSize * 0.34) + 'px',
          }}>
            <StepGlyph stepName={stepName} accent={accent} accentSoft={accentSoft} size={glyphSize} />
            <div data-pace-session-prep-num data-pace-prep-en-arte style={{
              position: 'absolute', left: 0, top: 0, width: glyphSize, height: glyphSize,
              display: 'grid', placeItems: 'center', pointerEvents: 'none',
              ...displayItalic, fontWeight: 400, lineHeight: 1, color: accent,
              opacity: 0.34, fontVariantNumeric: 'tabular-nums',
            }}>{numero}</div>
          </div>
          <div style={{
            fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--ink-3)', marginTop: 20,
          }}>{t('session.prep')}</div>
          <div data-pace-session-prep-copy style={{
            ...displayItalic, fontSize: 20, color: 'var(--ink-2)', marginTop: 10,
          }}>{copy}</div>
        </div>
      </SessionShell>
    );
  }
  return (
    <SessionShell
      routine={routine}
      onExit={onExit}
      atmosphere={atmosphere}
      footer={<button onClick={onSkip} style={sessionShellStyles.ctrlBtn}>{t('session.startNow')}</button>}
    >
      <div data-pace-session-prep style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{
          fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--ink-3)', marginBottom: 18,
        }}>{t('session.prep')}</div>
        <div data-pace-session-prep-num style={{
          ...displayItalic,
          fontSize: 200, fontWeight: 400, lineHeight: 0.9,
          color: accent,
          fontVariantNumeric: 'tabular-nums',
        }}>{prepCount > 0 ? prepCount : '·'}</div>
        <div data-pace-session-prep-copy style={{
          ...displayItalic,
          /* marginTop 20 -> 40: el numeral (200px, lineHeight 0.9) baja su
             tinta sobre el caption con solo 20px de aire -> solapamiento
             (bug s96). Empujar el caption ~20px lo separa limpio. En movil
             el override reduce el numeral a 128px, alli 20px basta. (s97) */
          fontSize: 20, color: 'var(--ink-2)', marginTop: 40,
        }}>{copy}</div>
      </div>
    </SessionShell>
  );
}


/* La hoja de ESTA pantalla, con su guard de id (patrón de
   `MoveSessionV1.css.jsx`). Dos reglas, las dos sobre el modo CON ARTE:

   1. EL MISMO ANCLAJE QUE EL RUNNER. `centerBody` centra con `margin:auto` y
      el runner lo mata con una regla gemela (`:has([data-pace-v1-body])`,
      s172b). Sin esto la preparación se centra y el paso se ancla arriba, y el
      círculo salta al relevarse -- 171 px en escritorio, 221 en móvil.
   2. EL NUMERAL SE DIMENSIONA CON EL CÍRCULO y no con el breakpoint. La hoja
      responsive de sesión fija el numeral en 128 / 96 px con `!important`, y
      dentro de un círculo de 161 eso lo llena entero. Gana por ESPECIFICIDAD
      (dos atributos contra uno) y no por orden, así que sigue ganando aunque
      mañana se añada un breakpoint más. */
(function () {
  if (document.getElementById('pace-session-prep-css')) return;
  const s = document.createElement('style');
  s.id = 'pace-session-prep-css';
  s.textContent = [
    '[data-pace-session-center-body]:has([data-pace-session-prep-art]) { margin-top: 0 !important; }',
    '[data-pace-session-prep-num][data-pace-prep-en-arte] { font-size: var(--pace-prep-num, 72px) !important; }',
  ].join(String.fromCharCode(10));
  document.head.appendChild(s);
})();

Object.assign(window, { SessionPrep });
