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
                        ("Siéntate cómodo. Respira natural." / sessionPrepCopy)
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
          /* Las cifras de Cormorant son de texto: el 3 y el 5 bajan un cuarto
             de cuerpo por debajo de la línea, y con lineHeight 0.9 esa cola
             tocaba el caption en el móvil (y a 1280×520 se montaba). El aire va
             en em para que crezca y mengüe con cada tamaño del numeral. */
          paddingBottom: '0.12em',
          color: letraDe(accent),   /* la cifra es letra: el hondo del módulo (Ez, 2B) */
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

/* La frase de Mueve y Estira dice dónde ponerse solo cuando la rutina tiene un único sitio:
   «De pie» en una rutina de silla contradecía a su tarjeta, que dice «sentado». Con varias
   posturas no se nombra ninguna, porque `position` lista las que usa la rutina y no por cuál
   empieza (Caderas · 5 pone primero el suelo y arranca de pie). */
const PREP_SUELO = ['floor', 'supine', 'halfKneeling'];
/* LA MISMA CUENTA EN LAS TRES PANTALLAS (Ez, V5A del 24 nov. 2026): los pasos seguidos del mismo ejercicio
   son UN ejercicio con sus series, como ya los agrupaba la ficha («×2»). Antes la ficha decía «×2»,
   «Prepárate» «2 pasos» y la rutina «Paso 1 de 2» para dos series de lo mismo. Sin los descansos.
   Cada grupo: { name, idxs } con los índices de sus pasos en `routine.steps`. */
function paceGruposRutina(steps) {
  const grupos = [];
  (steps || []).forEach((s, i) => {
    if (!s || s.mode === 'rest') return;
    const ult = grupos[grupos.length - 1];
    if (ult && ult.name === s.name && ult.idxs[ult.idxs.length - 1] === paceUltimoNoDescanso(steps, i)) ult.idxs.push(i);
    else grupos.push({ name: s.name, idxs: [i] });
  });
  return grupos;
}
/* El paso con trabajo anterior a `i`: dos series separadas por su descanso siguen siendo seguidas. */
function paceUltimoNoDescanso(steps, i) {
  for (let j = i - 1; j >= 0; j--) if (steps[j] && steps[j].mode !== 'rest') return j;
  return -1;
}
/* «1 ejercicio», «4 ejercicios», «1 ejercicio, 2 series» o «2 ejercicios, 6 series». */
function paceCuentaRutina(steps, tn) {
  const g = paceGruposRutina(steps);
  const series = g.reduce((a, x) => a + x.idxs.length, 0);
  const ej = g.length === 1 ? tn('move.cuenta.ejercicios.uno', {}) : tn('move.cuenta.ejercicios', { n: g.length });
  return g.some((x) => x.idxs.length > 1) ? ej + ', ' + tn('move.cuenta.series', { n: series }) : ej;
}
function sessionPrepCopy(routine, tn) {
  const pos = Array.isArray(routine.position) ? routine.position : [];
  const donde = (pos.length && pos.every(p => PREP_SUELO.indexOf(p) !== -1)) ? 'floor'
    : (pos.length === 1 && (pos[0] === 'seated' || pos[0] === 'standing')) ? pos[0]
    : 'any';
  return tn('move.prepCopy.' + donde, { cuenta: paceCuentaRutina(routine.steps, tn) });
}

/* «Paso 2 de 4» en el runner: los pasos son los ejercicios, sin los descansos, como en «Prepárate» y en el
   cierre; en un descanso, «Descanso» sin número (Ez, 6A del 18 nov. 2026). Antes contaba el descanso: Espalda
   de pie decía «Paso 1 de 5» con «4 pasos» al empezar y al acabar. */
function sessionPasoCabecera(routine, stepIdx, t, tn) {
  const steps = (routine && routine.steps) || [];
  if (steps[stepIdx] && steps[stepIdx].mode === 'rest') return t('session.restLabel');
  /* Con series del mismo ejercicio, «Serie 1 de 2»; si no, el ejercicio entre los de la rutina (V5A). */
  const grupos = paceGruposRutina(steps);
  const g = grupos.findIndex((x) => x.idxs.indexOf(stepIdx) !== -1);
  if (g === -1) return tn('move.stepCount', { current: 1, total: Math.max(1, grupos.length) });
  const idxs = grupos[g].idxs;
  if (idxs.length > 1) return tn('move.serieCount', { current: idxs.indexOf(stepIdx) + 1, total: idxs.length });
  return tn('move.stepCount', { current: g + 1, total: grupos.length });
}

Object.assign(window, { SessionPrep, sessionPrepCopy, sessionPasoCabecera, paceGruposRutina, paceCuentaRutina });
