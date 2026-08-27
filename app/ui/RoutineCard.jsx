/* PACE · app/ui/RoutineCard.jsx (sesión 174)
   ============================================
   LA TARJETA DE RUTINA, compartida por las TRES bibliotecas. Sale de
   `BreatheLibrary.jsx`, donde vivía desde s34 por accidente histórico: la
   consumían también MoveModule y ExtraModule a través del global, así que
   tocarla obligaba a abrir el módulo de Respira.

   LO QUE ES, decidido mirando doce maquetas en s173 y una más en s174:
     capitular a 62 px + el resto de glifos a 20 (variante «C1»)
     nivel en PILL junto al nombre
     descripción a DOS líneas -- caben las 28 sin recortar (mediana 61
       caracteres, la mayor 84)
     línea de contexto en CURSIVA display con TODO el cómo-se-hace: dónde, con
       qué, «por lado» y Premium; la cifra de minutos en EB Garamond
     línea de series SÓLO cuando dice series y repeticiones -- 8 de 28

   EL 55 % DE OPACIDAD EN LA TIRA NO VALÍA: el usuario no los registraba y
   reportó «sólo muestra un glifo». Si no se leen, no están. Van al 75 %.

   VARIANTE `breathe`: SIN capitular. Sus 20 rutinas no declaran `position`,
   `equipment` ni `level` (medido 20 de 20 en s174), así que no hay dibujo, ni
   pill, ni lugar. Lo que sí tienen y hoy no se lee en ningún sitio es el
   RITMO, y ahí es donde va. Su pantalla propia -- ordenada por tiempo y con
   los ritmos DIBUJADOS -- es otra sesión: son 13 motores de ritmo y 19 ritmos
   distintos, y el «14» del documento no sale de ninguna cuenta.

   EL GATING NO SE TOCA (s87/s95): `access: 'premium'` marca contenido de pago
   y el sello se ve siempre; el bloqueo real pasa por `canAccessRoutine`.
   Cambiar esto aquí abriría premium sin ruta de compra. */

function RoutineCard({ routine, color, onClick, variant = 'body' }) {
  const { t, tn, lang } = useT();
  const [pace] = usePace(); // suscripción reactiva: al cambiar premiumUnlocked
                            // la tarjeta re-renderiza y el guard relee el store.
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };
  const isPremium = routine.access === 'premium';
  const isLocked = window.canAccessRoutine
    ? !window.canAccessRoutine(routine.id)
    : (isPremium && !pace.premiumUnlocked);

  /* Duración DERIVADA para las rutinas del contrato v1 (s115): una sola
     promesa vía `estimateDuration`, con el preset de descanso actual. El resto
     conserva `routine.min`. Prod nunca muestra las dos. */
  const isV1 = !!(routine.steps && routine.steps.some(s => s && s.mode));
  let cifra = String(routine.min);
  if (isV1 && typeof window.estimateDuration === 'function') {
    const est = window.estimateDuration(routine, pace.restBetweenSets);
    const lo = Math.floor(est.minSec / 60), hi = Math.ceil(est.maxSec / 60);
    cifra = lo === hi ? String(lo) : (lo + '–' + hi);
  }

  const nivelKey = ['intermediate', 'advanced'].includes(routine.level) ? routine.level : null;
  const intensKey = ['gentle', 'moderate', 'strong'].includes(routine.intensity) ? routine.intensity : null;
  /* El nivel TÉCNICO manda sobre la intensidad cuando existe, y `accessible` se
     omite a propósito: marcarlo en las 16 accesibles sería ruido -- lo normal
     no necesita etiqueta-- y apagaría la señal justo donde importa. */
  const pill = nivelKey ? t('lib.level.' + nivelKey) : (intensKey ? t('lib.intensity.' + intensKey) : null);

  /* ── la línea de contexto ─────────────────────────────────────────────── */
  const trozos = [];
  if (variant === 'breathe') {
    const ritmo = routineRhythmText(routine, tn, t);
    if (ritmo) trozos.push({ k: 'ritmo', txt: ritmo });
  } else {
    const donde = routine.requiresFloor ? 'floor'
      : (routine.position && routine.position.length === 1 && routine.position[0] === 'seated') ? 'seated'
      : 'standing';
    trozos.push({ k: 'donde', txt: t('lib.where.' + donde) });
    (routine.equipment || []).forEach(e => {
      const s = t('lib.gear.' + e);
      trozos.push({ k: 'gear-' + e, txt: s === ('lib.gear.' + e) ? e : s });
    });
    if (window.libraryPorLado && window.libraryPorLado(routine)) {
      trozos.push({ k: 'lado', txt: t('lib.perSide') });
    }
  }
  if (isPremium) trozos.push({ k: 'premium', txt: t('lib.premium'), cls: 'pace-lib-pre' });

  /* ── la tira de glifos ────────────────────────────────────────────────── */
  const glifos = (variant === 'breathe' || !window.libraryGlifos) ? [] : window.libraryGlifos(routine);
  const series = (variant === 'breathe' || !window.librarySeries) ? null : window.librarySeries(routine);

  const abrir = isLocked ? undefined : onClick;
  const nombre = tR(routine.id + '.name', routine.name);
  return (
    <div
      className={'pace-lib-card' + (variant === 'breathe' ? ' pace-lib-card-resp' : '')}
      data-pace-lib-card={routine.id}
      data-locked={isLocked ? '1' : undefined}
      style={{ '--tone': color }}
    >
      {routine.safety && (
        <i className="pace-lib-safety" title={t('breathe.safety.required')} aria-label={t('breathe.safety.required')}>&#9888;</i>
      )}
      {glifos.length > 0 && (
        <span className="pace-lib-cap" aria-hidden="true">
          <ExerciseGlyph id={glifos[0]} size={62} />
        </span>
      )}
      <div className="pace-lib-txt">
        {/* LA TARJETA NO ES UN BOTÓN GIGANTE, y esto no es estilo: un elemento
            con role=button vuelve PRESENTACIONALES a sus descendientes, así que
            el nombre de la rutina deja de existir como encabezado -- y con él,
            la única forma que tiene un lector de pantalla (y la suite E2E) de
            recorrer la biblioteca. La primera versión de esta tarjeta lo hacía
            y tumbó 9 tests.
            El patrón correcto: el encabezado lleva DENTRO un botón que se
            extiende sobre toda la tarjeta con un ::after. Se conserva el
            encabezado, se gana el teclado —que `Card` nunca tuvo— y sigue
            siendo clicable de punta a punta.
            Y LA PILL VA FUERA DEL <h4>: dentro, el nombre accesible del
            encabezado pasaba a ser «Cuello · 3 min SUAVE». */}
        <div className="pace-lib-titulo">
          <h4>{abrir
            ? <button type="button" className="pace-lib-hit" onClick={abrir}>{nombre}</button>
            : nombre}</h4>
          {pill && <i className="pace-lib-pill">{pill}</i>}
        </div>
        <p>{tR(routine.id + '.desc', routine.desc)}</p>
        <div className="pace-lib-ctx">
          <b>{cifra}</b><u>{t('lib.min')}</u>
          {trozos.map(x => <em key={x.k} className={x.cls}>{x.txt}</em>)}
          {isLocked && <em className="pace-lib-soon">{t('premium.soon')}</em>}
        </div>
        {glifos.length > 1 && (
          <div className="pace-lib-tira" aria-hidden="true">
            {glifos.slice(1).map(g => <ExerciseGlyph key={g} id={g} size={20} />)}
          </div>
        )}
        {series && (
          <div className="pace-lib-pie">
            {tn('lib.series', { s: series.series, r: series.reps.join('·') })}
          </div>
        )}
      </div>
    </div>
  );
}

/* EL RITMO DE RESPIRA EN PALABRAS. Es su información más útil y la más difícil
   de leer: hoy no aparece en ninguna pantalla. Los ciclos son
   [inhala, sostén, exhala, vacío] y los ceros se caen, así que 5·0·5·0 se dice
   «5·5» y 4·16·8·0 se dice «4·16·8». Los patrones sin ciclo llevan su palabra.
   Cuando lleguen los glifos de ritmo, esta función es lo que sustituyen. */
function routineRhythmText(routine, tn, t) {
  if (!routine) return null;
  if (routine.rounds) return tn('lib.rhythm.rounds', { r: routine.rounds, b: routine.breaths });
  if (Array.isArray(routine.cycle)) {
    const n = routine.cycle.filter(v => v > 0);
    if (n.length) return n.join('·');
  }
  const k = 'lib.rhythm.' + routine.pattern;
  const s = t(k);
  return s === k ? null : s;
}

Object.assign(window, { RoutineCard, routineRhythmText });
