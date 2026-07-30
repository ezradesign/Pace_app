/* PACE · Respiración — Visual animado + getSequence
   Extraído de BreatheModule.jsx en sesión 34 (v0.16.0).

   s89: los 5 wrappers llevan `data-pace-essential` — exime al visual del
   kill global de prefers-reduced-motion (tokens.css). La expansión del
   círculo ES la guía de respiración: motion esencial, no decorativo.
*/

function getSequence(routine) {
  if (routine.pattern === 'rounds') {
    return [
      { label: 'Inhala', duration: 2, scale: 1.3 },
      { label: 'Exhala', duration: 2, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'box') {
    const [i, h1, e, h2] = routine.cycle;
    return [
      { label: 'Inhala', duration: i, scale: 1.3 },
      { label: 'Sostén', duration: h1, scale: 1.3 },
      { label: 'Exhala', duration: e, scale: 0.9 },
      { label: 'Sostén', duration: h2, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'coherent') {
    const [i, , e] = routine.cycle;
    return [
      { label: 'Inhala', duration: i, scale: 1.3 },
      { label: 'Exhala', duration: e, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'pattern') {
    const [i, h, e] = routine.cycle;
    return [
      { label: 'Inhala', duration: i, scale: 1.3 },
      { label: 'Sostén', duration: h, scale: 1.3 },
      { label: 'Exhala', duration: e, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'physiological') {
    return [
      { label: 'Inhala', duration: 2, scale: 1.25 },
      { label: 'Inhala más', duration: 1, scale: 1.35 },
      { label: 'Exhala', duration: 5, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'ujjayi') {
    return [
      { label: 'Inhala oceánica', duration: 5, scale: 1.3 },
      { label: 'Exhala oceánica', duration: 5, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'bhastrika' || routine.pattern === 'kapalabhati') {
    return [
      { label: 'Inhala', duration: 1, scale: 1.2 },
      { label: 'Exhala', duration: 1, scale: 0.95 },
    ];
  }
  if (routine.pattern === 'nadi') {
    return [
      { label: 'Inhala izq.', duration: 4, scale: 1.3 },
      { label: 'Sostén', duration: 2, scale: 1.3 },
      { label: 'Exhala dcha.', duration: 4, scale: 0.9 },
      { label: 'Inhala dcha.', duration: 4, scale: 1.3 },
      { label: 'Sostén', duration: 2, scale: 1.3 },
      { label: 'Exhala izq.', duration: 4, scale: 0.9 },
    ];
  }
  /* F4 (s90) — patrones nuevos */
  if (routine.pattern === 'diaphragm') {
    return [
      { label: 'Inhala al vientre', duration: 4, scale: 1.3 },
      { label: 'Exhala', duration: 4, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'yin') {
    return [
      { label: 'Inhala', duration: 3, scale: 1.3 },
      { label: 'Exhala', duration: 5, scale: 0.9 },
      { label: 'Sostén', duration: 2, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'bhramari') {
    return [
      { label: 'Inhala', duration: 4, scale: 1.3 },
      { label: 'Exhala zumbando', duration: 8, scale: 0.9 },
    ];
  }
  if (routine.pattern === 'co2') {
    return [
      { label: 'Inhala', duration: 4, scale: 1.3 },
      { label: 'Exhala', duration: 6, scale: 0.9 },
      { label: 'Sostén en vacío', duration: 10, scale: 0.9 },
    ];
  }
  return [{ label: 'Respira', duration: 4, scale: 1.2 }];
}

/* LOTO (s138) — arte del usuario integrado como MÁSCARA CSS, no como imagen.
   Motivo medido: el PNG original es línea CREMA sobre transparente y sobre el
   papel crema (`--paper #F2EDE0`) era casi invisible. Además su ALFA es solo la
   silueta (histograma bimodal), mientras el dibujo vive en la LUMINANCIA; por
   eso `scripts/ingest-loto.js` reconstruye la máscara desde la densidad de
   tinta. Aquí el color lo pone `--breathe`, así que el contraste queda
   garantizado en las tres paletas sin tocar el arte: en crema se lee como tinta
   terracota, en oscuro como línea encendida.
   La ruta relativa es la MISMA convención que las láminas de Caminos
   (`paths.index.js`): archivo en web (+ precache en `sw.js`) y el build la
   sustituye por data URI solo en el standalone. */
const LOTO_SRC = 'app/breathe/assets/loto.webp';

/* Escala máxima declarada por getSequence (physiological, «Inhala más»). El
   wrap del loto reserva el tamaño a ESTA escala, no en reposo. */
const BREATH_MAX_SCALE = 1.35;

const breathVisualStyles = {
  /* s138 — wrap PROPIO del loto. El wrap compartido mide 260x260 fijos mientras
     sus capas pintaban 420x420 por los insets negativos: el aro exterior se
     salía 6 px por encima del área de scroll de la sesión y se RECORTABA (medido
     en runtime: capa exterior en y=60, `data-pace-session-center` empieza en
     y=66). Aquí las capas viven DENTRO del wrap con insets en %, y el wrap se
     dimensiona por el viewport, así que el layout reserva exactamente lo que se
     dibuja a escala máxima y nada se recorta en ninguna altura de pantalla.
     Los otros cuatro estilos siguen con el wrap compartido, sin tocar. */
  /* s139 — REGRESIÓN de s138 corregida: manda el ALTO y el ancho lo deriva la
     proporción. El ancho salía de `min(400px, 84vw, 56vh)`, y ahí `vh` es la
     VENTANA, no el hueco real donde vive el visual: el centro es la ventana
     MENOS header, footer y padding, y encima comparte ese hueco con el texto de
     fase, el contador y la barra de progreso. Medido a 1280×740: el centro
     ofrecía 584,4 px y el contenido pedía 587,5 (400 de visual + 187,6 de
     texto/barra/gaps) ⇒ desborde, barra de 15 px, y el `margin:auto` del body
     —que centra al caber y alinea ARRIBA al desbordar— dejaba el círculo pegado
     al header. Umbral del modelo: por debajo de ~743 px de alto SIEMPRE
     desbordaba.
     El invariante de s138 sigue intacto y era correcto: el wrap reserva lo que
     se pinta a escala máxima. Lo que faltaba es que ese wrap se midiera contra
     el presupuesto vertical real, y eso no lo sabe ninguna unidad `vh`: lo sabe
     el flex del centro. Por eso el visual es ahora `flex: 0 1 auto` —el ÚNICO
     elemento que encoge— y la hoja de abajo hace que el body mida exactamente
     el hueco disponible. `min-height` es el suelo: por debajo vuelve el scroll
     (red de seguridad de s112, con la barra oculta). */
  wrapLoto: {
    position: 'relative',
    height: 'min(400px, 84vw)',
    /* Suelo: 160 px, el mismo tamaño que el `core` de los otros estilos de
       Respira. Por debajo de esto NO se sigue encogiendo la guía —dejaría de
       leerse como respiración— y entra la red de seguridad de s112: el centro
       hace scroll (con la barra oculta por la regla de s139) y el footer con la
       acción primaria sigue siempre accesible. Medido: con este suelo cabe
       hasta 1280×420; por debajo empieza el scroll invisible. */
    minHeight: 160,
    aspectRatio: '1 / 1',
    flex: '0 1 auto',
    /* El margen inferior negativo que reclama el hueco muerto NO va aquí sino en
       la hoja inyectada: depende del `gap`, que cambia por tier de altura.
       Explicación completa y aritmética del tope, abajo. */
    display: 'grid', placeItems: 'center',
  },
  aroLoto: {
    position: 'absolute',
    border: '1px solid var(--breathe)',
    borderRadius: '50%',
  },
  loto: {
    position: 'absolute', inset: 0,
    /* El color NO va aquí: lo pone la hoja inyectada abajo, por paleta
       (`[data-pace-loto]`). Un `background` inline ganaría a la hoja. */
    WebkitMaskImage: `url(${LOTO_SRC})`,
    maskImage: `url(${LOTO_SRC})`,
    WebkitMaskSize: 'contain', maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center', maskPosition: 'center',
  },
  wrap: {
    position: 'relative',
    width: 260, height: 260,
    display: 'grid', placeItems: 'center',
  },
  core: {
    width: 160, height: 160,
    borderRadius: '50%',
    position: 'relative',
  },
};

function BreathVisual({ style, phase, progress, scale = 1.2, phaseDuration = 4 }) {
  /* B1: la transición dura lo que dura la FASE (antes fija 1800 ms — una
     exhalación de 8 s animaba 1,8 s y quedaba estática; en fases de 1 s,
     Bhastrika, nunca completaba). Fases rápidas (<2 s): 85% de la fase con
     easing más directo, para que la forma asiente antes del cambio. */
  const isFastPhase = phaseDuration < 2;
  const transitionDur = `${Math.max(300, Math.round(phaseDuration * 1000 * (isFastPhase ? 0.85 : 1)))}ms`;
  const transitionEase = isFastPhase ? 'ease-in-out' : 'var(--ease)';

  /* s138 — reduced motion, matiz FINO: el subtree lleva `data-pace-essential`,
     que lo exime ENTERO del kill global de tokens.css (s89). Correcto para la
     ESCALA, que es la guía de respiración, pero el GIRO del loto es decorativo
     y no debería moverse con reduced-motion. No se puede separar por CSS (van
     en el mismo `transform`), así que se anula aquí. Se lee en cada render —el
     visual re-renderiza a cada fase— y por eso no necesita listener. */
  const sinMovimiento = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (style === 'flor') {
    /* s138 — el loto del usuario sustituye a los 6 pétalos SVG y al núcleo con
       degradado: el mandala trae su propio centro (la semilla de la vida), así
       que un círculo encima competía con él. Los dos aros se conservan: son el
       aura que respira.

       TRES ARREGLOS DE ANIMACIÓN, los tres medidos:

       (1) UN SOLO FACTOR DE ESCALA. Antes cada capa combinaba una base y un
           factor distintos (340x0,95·s · 300x1,0·s · 260x0,85·s), así que los
           huecos entre ellas pasaban de 10/36 px en reposo a 15/51 px a tope:
           se ensanchaban un 44 % al inhalar y cada capa parecía ir a su
           velocidad. Ahora las tres comparten `scale` y el tamaño se fija solo
           con el `inset` en %, así que la proporción es constante y la
           composición respira como UN objeto.

       (2) EL GIRO SALE DE `progress`. `progress` solo avanza una vez por
           segundo y llevaba encima una transición de la duración de la FASE:
           cada paso arrancaba una transición de ~4 s que no terminaba antes del
           siguiente => tirones cada segundo. Y al cambiar de fase `progress`
           volvía de 1 a 0, así que además contragiraba. El giro pasa a ser una
           animación CSS continua (`pace-loto-giro`, 180 s por vuelta, linear,
           infinita) en un elemento APARTE: no depende de ningún tick, no se
           reinicia entre fases y no compite con la transición de la escala.

       (3) EL WRAP RESERVA EL MÁXIMO. Ver `wrapLoto`.

       Y TRES CAPAS DE PROFUNDIDAD, para que no sea «una imagen que escala»:
       un halo de luz que se recoge y se abre con el aire, un loto de FONDO
       algo mayor girando MUY despacio y AL REVÉS (dos mandalas iguales a
       velocidades opuestas producen un brillo lento que lee como volumen; a
       opacidad 0,10 se intuye, no se mira), y el loto principal encima. */
    /* RESPIRACIÓN ASIMÉTRICA (idea del usuario, s138). Un círculo que escala
       igual en los dos ejes lee como «una imagen que crece»; un pecho que se
       llena sube y se ensancha MENOS de lo que se alarga. Así que el eje
       vertical recorre la excursión entera y el horizontal solo el 88 %, y el
       conjunto se eleva un poco al llenarse. Es sutil a propósito: guía sin
       convertirse en el espectáculo.
       El desplazamiento va ANTES de la escala para que no lo multiplique, y los
       `inset` suben un punto (14/16,5/20/25,5 %) para dejarle sitio dentro del
       invariante del wrap: 1 − 2×0,14 = 0,72 y 0,72 × 1,35 = 0,972, o sea ~11 px
       de holgura en un wrap de 389 para un desplazamiento máximo de 2,7 px. */
    const sx = 1 + (scale - 1) * 0.88;
    const subida = -(scale - 0.9) * 6;
    const respira = `translateY(${subida.toFixed(2)}px) scale(${sx.toFixed(4)}, ${scale})`;
    /* Curva: `--ease` es cubic-bezier(0.4,0,0.2,1), la curva de UI de Material
       —sale rápido y frena largo—, que para un CTA está bien y para un pulmón
       no. Una respiración acelera y frena de forma simétrica, así que la fase
       lenta usa easeInOutSine. Local al loto: no se toca el token compartido. */
    const curva = isFastPhase ? 'ease-in-out' : 'cubic-bezier(0.37, 0, 0.63, 1)';
    const trans = `transform ${transitionDur} ${curva}, opacity ${transitionDur} ${curva}`;
    /* La tinta gana cuerpo al llenarse y lo suelta al vaciarse: refuerza la
       guía sin añadir movimiento. Normalizado sobre el recorrido real de
       `scale` (0,9 a 1,35). */
    const llenado = Math.min(1, Math.max(0, (scale - 0.9) / (BREATH_MAX_SCALE - 0.9)));
    const gira = (seg, sentido) =>
      `pace-loto-giro ${seg}s linear infinite${sentido < 0 ? ' reverse' : ''}`;
    /* s139 — «la 2ª capa lee como un simple zoom». El diagnóstico NO era que
       faltara giro: el loto de fondo ya contragiraba desde s138. Era que no se
       NOTABA, y por dos motivos medibles a la vez:
         · a 450 s por vuelta una hoja del mandala (16 hojas ⇒ 22,5°) tarda 28 s
           en ocupar el sitio de la anterior — más que la sesión entera de una
           fase, así que el ojo no tiene referencia de movimiento;
         · a opacidad 0,10–0,16 sobre papel crema la capa es un susurro, y un
           susurro que se mueve despacio no se ve moverse.
       Se atacan los dos, sin tocar el loto principal (la 2ª capa es la que el
       usuario señaló) y sin subir el techo de opacidad:
         (1) contrarrotación 450 s → 300 s: una hoja cada 18,8 s en absoluto,
             pero lo que el ojo percibe es la velocidad RELATIVA entre los dos
             mandalas (2 + 1,2 = 3,2 °/s ⇒ una hoja cada ~7 s), que es el brillo
             lento que da volumen.
         (2) `pace-loto-vela`: la TRANSPARENCIA también se mueve, que es lo que
             pidió el usuario. Multiplica la opacidad de fase por 0,62–1, así que
             el techo sigue siendo el 0,16 de antes y solo baja el suelo. Su
             periodo (17 s) NO es múltiplo de ningún ciclo de respiración del
             catálogo (4, 8, 10, 12 s): así nunca se sincroniza con la fase y lee
             como profundidad propia, no como parte de la guía. Va en el elemento
             INTERNO para no pisar la opacidad de fase del contenedor, que es
             inline — dos animaciones sobre propiedades distintas (transform y
             opacity) no compiten.
       Invariante de s138 intacto: sigue siendo animación CSS continua, nada sale
       de `progress`, y el freno de reduced-motion vive aquí (el kill global de
       tokens.css pondría `0.01ms`, que en una animación infinita la dispara en
       vez de pararla) y ahora corta las DOS de una sola vez. */
    const animFondo = sinMovimiento
      ? 'none'
      : `${gira(300, -1)}, pace-loto-vela 17s ease-in-out infinite`;
    const animFrente = sinMovimiento ? 'none' : gira(180, 1);
    return (
      <div data-pace-essential data-pace-breathe-visual style={breathVisualStyles.wrapLoto}>
        {/* halo: la luz que se junta al llenarse. Va a 13% como el aro exterior
            —no más ancho— porque el invariante del wrap es que NINGUNA capa lo
            rebase a escala máxima: 1 − 2×0,13 = 0,74 y 0,74 × 1,35 = 1,0 justo.
            A 6% se iba a 445 px con el wrap en 389 y volvía el recorte. */}
        {/* s139 — banding: era un radial de DOS paradas y sin dither, el más
            visible de los dos que quedaban sin tratar (medido: ~6,8 px por banda
            a 1920×880, contra 3,5 del círculo de retención — el halo es el
            elemento grande, y el banding crece con los píxeles por banda).
            Pasa a la rampa compartida de cinco paradas + la capa de grano, la
            misma receta de la atmósfera de s138. Regla de s100 intacta: el alpha
            de `--breathe-soft` no se toca. */}
        <div style={{
          position: 'absolute', inset: '14%',
          borderRadius: '50%',
          background: paceGlowRamp('var(--breathe-soft)', 74),
          opacity: 0.45 + 0.55 * llenado,
          transform: respira, transition: trans,
        }}>
          <PaceDither edge={74} />
        </div>
        <div style={{
          ...breathVisualStyles.aroLoto, inset: '14%',
          opacity: 0.18 + 0.10 * llenado,
          transform: respira, transition: trans,
        }} />
        <div style={{
          ...breathVisualStyles.aroLoto, inset: '16.5%',
          opacity: 0.30 + 0.14 * llenado,
          transform: respira, transition: trans,
        }} />
        {/* loto de FONDO: mayor, contragirando y con la transparencia viva
            (s139, ver `animFondo` arriba) -> profundidad sin ruido */}
        <div style={{
          position: 'absolute', inset: '20%',
          opacity: 0.10 + 0.06 * llenado,
          transform: respira, transition: trans,
        }}>
          <div data-pace-loto style={{ ...breathVisualStyles.loto, animation: animFondo }} />
        </div>
        <div style={{
          position: 'absolute', inset: '25.5%',
          opacity: 0.80 + 0.20 * llenado,
          transform: respira, transition: trans,
        }}>
          <div data-pace-loto style={{ ...breathVisualStyles.loto, animation: animFrente }} />
        </div>
      </div>
    );
  }

  if (style === 'ondas') {
    return (
      <div data-pace-essential style={breathVisualStyles.wrap}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            border: '1px solid var(--breathe)',
            borderRadius: '50%',
            opacity: 0.15 + i * 0.1,
            transform: `scale(${scale - i * 0.15})`,
            transition: `transform ${transitionDur} ${transitionEase}`,
          }} />
        ))}
        <div style={{ ...breathVisualStyles.core, background: 'var(--breathe-soft)' }} />
      </div>
    );
  }

  if (style === 'petalo') {
    return (
      <div data-pace-essential style={breathVisualStyles.wrap}>
        <svg viewBox="-100 -100 200 200" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transition: `transform ${transitionDur} ${transitionEase}`, transform: `scale(${scale})` }}>
          {[0,1,2,3,4,5].map(i => (
            <ellipse key={i} cx="0" cy="-40" rx="20" ry="45"
              fill="var(--breathe-soft)" stroke="var(--breathe)" strokeWidth="0.8"
              transform={`rotate(${i * 60})`} opacity="0.55" />
          ))}
          <circle cx="0" cy="0" r="12" fill="var(--breathe)" opacity="0.25" />
        </svg>
      </div>
    );
  }

  if (style === 'organico') {
    return (
      <div data-pace-essential style={breathVisualStyles.wrap}>
        <div style={{
          ...breathVisualStyles.core,
          background: 'radial-gradient(circle, var(--breathe-soft) 0%, transparent 70%)',
          transform: `scale(${scale})`,
          transition: `transform ${transitionDur} ${transitionEase}`,
          borderRadius: `${42 + Math.sin(progress * Math.PI * 4) * 6}% ${58 - Math.sin(progress * Math.PI * 4) * 6}% ${46 + Math.cos(progress * Math.PI * 3) * 8}% ${54 - Math.cos(progress * Math.PI * 3) * 8}%`,
          border: '1px solid var(--breathe)',
        }} />
      </div>
    );
  }

  // Default: pulso
  return (
    <div data-pace-essential style={breathVisualStyles.wrap}>
      <div style={{ position: 'absolute', inset: -30, border: '1px solid var(--line)', borderRadius: '50%', opacity: 0.4 }} />
      <div style={{ position: 'absolute', inset: -60, border: '1px solid var(--line)', borderRadius: '50%', opacity: 0.2 }} />
      <div style={{
        ...breathVisualStyles.core,
        background: 'var(--breathe-soft)',
        border: '1.5px solid var(--breathe)',
        transform: `scale(${scale})`,
        transition: `transform ${transitionDur} ${transitionEase}`,
      }} />
      <div style={{
        position: 'absolute',
        width: 8, height: 8, borderRadius: '50%',
        background: 'var(--breathe-2)',
        top: '50%', left: '50%',
        transform: `translate(-50%, -50%) rotate(${progress * 360}deg) translateY(-110px)`,
        transition: 'transform 1s linear',
      }} />
    </div>
  );
}

/* La hoja inyectada del loto (keyframes del giro y de la vela, tinta por paleta,
   reparto de alto del centro y reclamo del hueco muerto) vive en
   `BreatheVisual.support.jsx` — extraída en s139 al rebasar este archivo las 500
   líneas de CLAUDE.md. Se carga JUSTO DESPUÉS de este archivo en PACE.html. */

Object.assign(window, { BreathVisual, getSequence });
