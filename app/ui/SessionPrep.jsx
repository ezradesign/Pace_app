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
/* s174 PUSO AQUÍ EL ARTE DE LA RUTINA y s175 LO QUITA. Queda escrito porque la
   razón de s174 sigue siendo cierta y hay que saberla antes de volver a
   intentarlo: entre la capitular de la tarjeta y el círculo del runner hay DOS
   pantallas —el Preview y ésta— y el círculo tarda **3.114 ms** en existir desde
   que pulsas «Empezar», así que ninguna transición continua puede llegar hasta
   allí. Esta pantalla era el único punto intermedio posible.
   POR QUÉ SE QUITA IGUAL: decisión del usuario, mirándola en Mueve y Estira
   —«el prepárate no debería tener ningún glifo, sólo el contador regresivo»—.
   Respira nunca lo tuvo: sus 20 rutinas no declaran `steps`, así que la rama del
   arte no se tomaba nunca para ellas. Ahora las tres pantallas son la misma.
   CONSECUENCIA QUE NO SE PUEDE PASAR POR ALTO: `[data-pace-session-prep-art]`
   era el ÚNICO destino del vuelo de la capitular (`library-transition.js`), que
   a partir de aquí no encuentra dónde aterrizar y se retira solo.
   s178 · «SE RETIRA SOLO» NO ERA GRATIS: seguía clonando un nodo y gastando 24
   frames por sesión buscando este selector. El módulo se borró entero. */
function SessionPrep({ routine, onExit, accent, prepCount, copy, onSkip, atmosphere }) {
  const { t } = useT();
  /* s175 · LA PREPARACION NO LLEVA ARTE, SOLO EL CONTADOR. Decision del
     usuario mirandola en Mueve y Estira, que eran las unicas que lo tenian
     (Respira nunca lo tuvo: sus 20 rutinas no declaran `steps`).
     LO QUE SE VA CON ELLO, y no es poco: el circulo de arte era el DESTINO del
     vuelo de la capitular desde la biblioteca (s174), asi que
     `paceVueloDestino()` deja de encontrar nada y el vuelo se retira solo --
     esta escrito para eso, sin ruido y sin romper la entrada a la sesion.
     (s178: retirarse solo costaba un clon y 24 frames por sesion, medido en la
     auditoria. El modulo del vuelo se borro entero.)
     Y CON EL ARTE SE VAN SUS TRES REGLAS DE HOJA: el anclaje arriba existia
     para que el circulo estuviera donde iba a aparecer el del paso, el numeral
     se dimensionaba con ese circulo, y el CTA recogido (s175) reparaba el hueco
     que dejaba el anclaje. Sin arte, esta pantalla vuelve a centrarse sola:
     medido en la version sin arte que ya usa Respira, numeral de 200 px y el
     CTA a 40 px del borde, sin ningun hueco en medio. */
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


Object.assign(window, { SessionPrep });
