/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   Ayudante de geometría de la HOME DESKTOP (s126).

   OBJETIVO. Reproducir la composición de la captura de referencia (v0.64 a
   1920×1080 · Windows 125 % → viewport CSS efectivo 1536×700) y mantenerla
   IDÉNTICA en cualquier resolución de escritorio, como un único lienzo
   proporcional:
     - el círculo del Pomodoro es la unidad base D (diámetro);
     - la fila de Actividades SOLAPA el arco inferior del círculo, quedando
       justo bajo los puntos CICLO (el «solapamiento de las actividades en el
       Pomodoro» de la referencia, ≈16.8 %·D);
     - el Camino queda como tarjeta ancha al fondo;
     - todo llena el alto sin scroll.

   POR QUÉ JS. En v0.64 ese solapamiento era un accidente de `flex:1 + 56vh`
   que solo ocurría cerca de 700 px de alto. Para que sea CONSTANTE hay que
   elegir D en función del espacio y anclar las Actividades bajo el CICLO real
   — cosas que CSS no puede expresar. El ayudante publica dos custom
   properties en :root y el resto lo deriva el CSS (app/main/_responsive.js):
     --pace-timer-d            → tamaño del aro y escalas interiores (calc)
     --pace-activities-overlap → cuánto suben las Actividades sobre el círculo

   ENCAPSULADO EN DESKTOP. Solo actúa con `min-width: 769px`. En mobile/tablet
   BORRA las dos variables y sale → el comportamiento actual queda intacto (el
   CSS de esas variables vive todo bajo la misma media query).

   SIN lógica de temporizador, sin estado de negocio, sin eventos. Solo mide y
   publica geometría. SIN bucle de layout: observa los hermanos que NO contienen
   el aro (Actividades, Camino) y el alto útil (fijado por el flex del padre);
   cambiar las variables reescala el aro y reubica Actividades, pero no altera
   esas medidas → converge en una pasada. */

(function paceHomeGeometry() {
  if (typeof document === 'undefined') return;

  var DESKTOP_MQ = '(min-width: 769px)';
  /* D lo manda la ALTURA, no el ancho — como en la referencia v0.64, donde el
     aro salía de `flex:1 + 56vh`. Se arranca del mayor aro admisible y el bucle
     de abajo lo ENCOGE hasta que no haya scroll: así D es siempre el círculo
     más grande que cabe, que es lo que lo mantiene protagonista (§6).

     Antes se arrancaba de 0.255·W (la proporción medida en la captura de
     referencia, 1536×700 → 392). Reproducía el ancho de la referencia pero
     confundía causa con efecto: en la referencia ese 0.255 era CONSECUENCIA de
     la altura disponible. Al fijarlo por ancho, a 1280×720 salía D=326 —
     dejando altura sin usar y, sobre todo, rompiendo el contrato de
     solapamiento: el interior tiene ~72px FIJOS (CTA 44px por a11y + fila de
     CICLO) y a D pequeño esos fijos se comen el 16 % (ratio real 0.135).
     Con D por altura, a 1536×700 sale D≈378 ≈ la referencia. */
  var WIDTH_CAP = 0.42;        // techo por ancho: el aro nunca acapara la fila
  var D_MAX = 520;             // tope absoluto del aro (identidad); deja «espacio
                               // negativo» en monitores grandes
  var D_FLOOR = 205;           // suelo con interior aún legible; por debajo, scroll
                               // de seguridad en viewports extremos
  var CICLO_GAP = 4;           // px de aire MÍNIMO entre CICLO y el borde de Actividades
  var OVERLAP_TARGET = 0.16;   // solapamiento nominal del contrato (§0): 16 % de D
  var MAX_FIT_PASSES = 8;      // iteraciones de ajuste «encoger hasta caber»

  /* COMPACTACIÓN EN ALTURAS CORTAS (s126b). Publica --pace-home-squeeze de 0 a 1;
     el CSS interpola con calc() los paddings/huecos EXTERIORES de la home (TopBar,
     selector de minutos, Actividades, tarjeta de Camino). Libera ~62px a squeeze=1,
     que van al aro: a 1366×610 el aro pasa de 256 a ~343 y el solapamiento de
     0.078 a ~0.14.

     Por qué hace falta: por debajo de ~672px de alto el 16 % es inalcanzable porque
     el interior del aro tiene ~72px FIJOS (CTA 44px por a11y + fila de CICLO) —
     ver AUDITORIA_SISTEMA_PACE.md §32.6. La única salida sin tocar contenido ni
     accesibilidad es recuperar presupuesto vertical EXTERIOR (§7 del corte).

     La curva es PROGRESIVA, no un breakpoint: cero por encima de 700px (la altura
     de la captura de referencia del usuario queda BYTE-IDÉNTICA) y completa a 610.
     No se compacta nunca por debajo de 610 más de lo ya alcanzado. */
  var SQUEEZE_START = 700;     // ≥ esta altura: compactación CERO
  var SQUEEZE_FULL = 610;      // ≤ esta altura: compactación COMPLETA
  var CICLO_RE = /\b(ciclo|cycle)\b/i;

  var rafId = 0;
  var ro = null;
  var rootStyle = document.documentElement.style;

  function clearVars() {
    if (rootStyle.getPropertyValue('--pace-timer-d')) rootStyle.removeProperty('--pace-timer-d');
    if (rootStyle.getPropertyValue('--pace-activities-overlap')) rootStyle.removeProperty('--pace-activities-overlap');
    if (rootStyle.getPropertyValue('--pace-home-squeeze')) rootStyle.removeProperty('--pace-home-squeeze');
  }

  function setVar(name, val) {
    if (rootStyle.getPropertyValue(name) !== val) rootStyle.setProperty(name, val);
  }

  function cicloBottomWithin(dial) {
    // Localiza los puntos CICLO por texto (i18n: «Ciclo N/4» / «Cycle N/4»),
    // toma el borde inferior más bajo entre las coincidencias. Sin hook JSX.
    var best = null;
    var nodes = dial.querySelectorAll('span, div');
    for (var i = 0; i < nodes.length; i++) {
      if (CICLO_RE.test(nodes[i].textContent || '')) {
        var b = nodes[i].getBoundingClientRect().bottom;
        if (best == null || b > best) best = b;
      }
    }
    return best;
  }

  // Fija D y, con D ya aplicado (getBoundingClientRect fuerza layout), ancla las
  // Actividades JUSTO bajo el CICLO real → solapamiento seguro y constante,
  // independientemente de la altura del botón (a11y 44px) o del interior.
  function applyD(D, dial) {
    setVar('--pace-timer-d', D + 'px');
    var dialBottom = dial.getBoundingClientRect().bottom;
    var cicloBottom = cicloBottomWithin(dial);
    /* El solapamiento es el 16 % de D (contrato §0). El CICLO medido NO fija el
       valor: solo actúa de TECHO de seguridad, para que el horizonte no suba
       nunca por encima de los puntos de ciclo.

       Por qué hace falta el techo: el interior no puede ser 100 % proporcional
       a D — el CTA tiene un suelo de 44px por accesibilidad. A D pequeño ese
       suelo empuja el CICLO hacia abajo y deja menos del 16 % libre; ahí el
       techo recorta el objetivo (ratio real ~0.147, dentro de la tolerancia
       0.14–0.17) en lugar de tapar el ciclo. A D grande manda el 16 % exacto.
       Antes se usaba el techo como valor: el ratio variaba 0.147→0.176 y a
       1920×1080 se salía del contrato. */
    var maxOverlap = (cicloBottom != null)
      ? Math.max(0, Math.round(dialBottom - cicloBottom - CICLO_GAP))
      : Math.round(D * OVERLAP_TARGET); // fallback si no se encuentra el CICLO
    var overlap = Math.min(Math.round(D * OVERLAP_TARGET), maxOverlap);
    setVar('--pace-activities-overlap', overlap + 'px');
  }

  function compute() {
    rafId = 0;
    // Guard Desktop: en mobile/tablet no tocamos nada (vars fuera → CSS actual).
    if (!window.matchMedia || !window.matchMedia(DESKTOP_MQ).matches) {
      clearVars();
      return;
    }
    var body = document.querySelector('[data-pace-home-body]');
    var dial = document.querySelector('[data-pace-dial-fit]');
    var spc = document.querySelector('[data-pace-spc]');
    var act = document.querySelector('[data-pace-activitybar]');
    if (!body || !dial || !spc || !act) return;

    /* La compactación va ANTES de medir: cambia el presupuesto exterior y, por
       tanto, la altura útil que le queda al aro. Depende solo de innerHeight
       (no de lo que medimos después) → sin circularidad. */
    var vh = window.innerHeight || body.clientHeight;
    var sq = (SQUEEZE_START - vh) / (SQUEEZE_START - SQUEEZE_FULL);
    sq = Math.max(0, Math.min(1, sq));
    setVar('--pace-home-squeeze', String(Math.round(sq * 1000) / 1000));

    var hUtil = body.clientHeight;
    var w = body.clientWidth;
    if (!hUtil || !w) return;

    // Estimación GENEROSA por ancho (proporción de la referencia); luego se
    // ENCOGE hasta que no haya scroll. Así D es el mayor círculo que cabe:
    //  - viewport alto → limita el ancho (0.255·W), sobra alto (se centra);
    //  - viewport bajo → encoge hasta caber, sin recortar contenido.
    // Medir la altura fija por partes es frágil (paddings del root, tarjeta de
    // Camino más alta con el eyebrow s122…), así que se mide el desbordamiento
    // real y se corrige — robusto ante idioma/contenido.
    var D = Math.min(WIDTH_CAP * w, D_MAX);
    if (D < D_FLOOR) D = D_FLOOR;
    D = Math.round(D);
    applyD(D, dial);

    for (var i = 0; i < MAX_FIT_PASSES; i++) {
      var over = body.scrollHeight - body.clientHeight;
      if (over <= 1 || D <= D_FLOOR) break;
      // reducir D: la huella vertical del aro tras solapar es ~0.84·D, así que
      // ΔD ≈ over/0.84 acerca el ajuste en una pasada (converge en 1-2).
      D = Math.max(D_FLOOR, D - Math.ceil(over / 0.84));
      applyD(D, dial);
    }
  }

  function schedule() {
    if (!rafId) rafId = requestAnimationFrame(compute);
  }

  function attach() {
    var body = document.querySelector('[data-pace-home-body]');
    if (!body) { requestAnimationFrame(attach); return; }
    if (window.ResizeObserver) {
      ro = new ResizeObserver(schedule);
      ro.observe(body);
      var spc = document.querySelector('[data-pace-spc]');
      var act = document.querySelector('[data-pace-activitybar]');
      if (spc) ro.observe(spc);   // Camino: altura varía con contenido/idioma
      if (act) ro.observe(act);   // Actividades: idem
    }
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    window.addEventListener('pace:home-relayout', schedule);
    if (window.matchMedia) {
      // recalcular al cruzar el umbral mobile/desktop
      var mq = window.matchMedia(DESKTOP_MQ);
      if (mq.addEventListener) mq.addEventListener('change', schedule);
      else if (mq.addListener) mq.addListener(schedule);
    }
    schedule();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
