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

   UN MOTOR, DOS PIELES (corregido en s149; hasta aquí esta cabecera seguía
   diciendo «encapsulado en Desktop, en mobile/tablet borra las dos variables y
   sale», y **eso dejó de ser cierto en s128**). El motor corre en TODO viewport
   y publica las dos variables siempre; lo que cambia por debajo de 769px son las
   CONSTANTES de la piel —el aro arranca por ANCHO en vez de por altura, y su
   suelo es mayor por legibilidad—, no el algoritmo. `DESKTOP_MQ` sigue
   existiendo para elegir piel y para reaccionar al cruce del breakpoint, no para
   apagarse. Ver la nota de s128 junto a `WIDTH_CAP_MOBILE`, más abajo.

   QUÉ NODOS SON OBLIGATORIOS Y CUÁLES NO (s156). Obligatorios: la región de la
   home y el aro. **Actividades y la tarjeta de Camino son OPCIONALES**: se miden
   si están y no se echan de menos si no. Hasta s156 el guard los exigía a los
   cuatro, y como `getSuggestedPath()` nunca devuelve null con catálogo no vacío
   (state-paths.jsx:169-174), el único estado real sin tarjeta —un Camino en
   curso— **apagaba el motor entero**: Desktop caía al fallback y pintaba el aro
   SIN horizonte. Un nodo opcional no puede decidir si hay geometría.

   CÓMO SE RECUPERA ANTE MONTAJE/DESMONTAJE (s156). `attach()` corría UNA vez y
   dejaba el ResizeObserver mirando el nodo de la tarjeta de ese momento; React
   monta OTRO nodo al volver del Camino, así que el observador quedaba apuntando
   a un nodo desconectado y la home no despertaba sin un resize del usuario.
   Ahora hay dos fases: una espera al montaje de la home y se desconecta, y otra
   vigila el `childList` DIRECTO del stack —los tres bloques son sus hijos
   inmediatos— para re-suscribir el ResizeObserver a los nodos VIVOS. Sin
   `subtree`, sin `attributes` y sin `characterData`: el número del Pomodoro
   cambia por texto y no puede despertar a nadie.

   CUÁNDO GOBIERNA JS Y CUÁL ES EL FALLBACK. Gobierna JS desde el primer montaje:
   la primera pasada es SÍNCRONA a propósito. Antes salía por `requestAnimationFrame`
   y en el arranque los frames están hambrientos (medido: DOM listo a 67 ms, primera
   publicación a 1345 ms y solo DOS frames por medio), así que el aro se pintaba al
   fallback y saltaba un segundo después. Mientras JS no haya publicado —y si no hay
   JS— manda el fallback CSS, que es UNO SOLO para las dos pieles: ver
   `--pace-dial-d` y `--pace-horizon` en app/main/_responsive.js.

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
  /* s128: el motor corre también en móvil/tablet (≤768). Constantes propias de
     esa piel: el aro arranca por ANCHO y el mismo bucle lo encoge solo si no
     cabe; suelo un poco mayor por legibilidad en pantalla pequeña. La rama
     Desktop (arriba) NO cambia.

     s156: 0.86 → 0.92. NO es un número de gusto: es el ancho REALMENTE usable.
     En móvil `[data-pace-main-content]` tiene 12 px de padding lateral
     (_responsive.js), así que la caja del aro dispone de W−24 px, o sea 0.925·W
     a 320 y 0.944·W a 430. El techo se queda JUSTO por debajo del más estrecho
     de esos dos. El motivo es medido: en teléfonos el aro queda limitado por
     ANCHO y sobraban 163-235 px verticales (a 390×844 el aro usaba el 40 % del
     alto y el 22 % del viewport quedaba en vacío repartido arriba y abajo). Lo
     que el techo no puede dar lo reparte `--pace-home-slack`, más abajo. */
  var WIDTH_CAP_MOBILE = 0.92;
  var D_FLOOR_MOBILE = 240;
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
  var mo = null;
  var reintentos = 0;   // ver «NUNCA ENCOGER A CIEGAS» en compute()
  var rootStyle = document.documentElement.style;

  /* s128: `clearVars()` (borraba las 3 vars fuera de Desktop) se retiró junto con
     el guard: el motor publica geometría en TODO viewport, así que ya no hay
     estado en el que haya que devolver el CSS a sus fallbacks. */

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
    /* s128: el motor corre AHORA también en móvil/tablet. isDesktop solo elige las
       CONSTANTES (la rama Desktop queda byte-idéntica); el resto del cálculo es
       común. El «horizonte» (clip + solapamiento) lo aplica el CSS al elemento que
       toca en cada piel — Desktop: Actividades; móvil: tarjeta de Camino —, así
       que el motor no sabe de pieles: solo mide y publica D, solapamiento y squeeze. */
    var isDesktop = !!(window.matchMedia && window.matchMedia(DESKTOP_MQ).matches);
    var body = document.querySelector('[data-pace-home-body]');
    var dial = document.querySelector('[data-pace-dial-fit]');
    /* s156: SOLO estos dos. La tarjeta de Camino y Actividades son opcionales
       (ver cabecera) y ninguno de los dos hace falta para calcular: el techo del
       solapamiento sale del CICLO, que vive DENTRO del aro. */
    if (!body || !dial) return;

    var widthCap = isDesktop ? WIDTH_CAP : WIDTH_CAP_MOBILE;
    var dFloor = isDesktop ? D_FLOOR : D_FLOOR_MOBILE;

    /* La compactación va ANTES de medir: cambia el presupuesto exterior y, por
       tanto, la altura útil que le queda al aro. Depende solo de innerHeight
       (no de lo que medimos después) → sin circularidad. */
    var vh = window.innerHeight || body.clientHeight;
    var sq = (SQUEEZE_START - vh) / (SQUEEZE_START - SQUEEZE_FULL);
    sq = Math.max(0, Math.min(1, sq));
    setVar('--pace-home-squeeze', String(Math.round(sq * 1000) / 1000));

    /* El reparto del sobrante va a CERO antes de medir: si no, el bucle de
       abajo mediría el desbordamiento con el sesgo de la pasada ANTERIOR y, al
       encoger el viewport, encogería el aro más de la cuenta. Se vuelve a
       publicar al final, ya con el aro fijado. */
    setVar('--pace-home-slack', '0px');

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
    var D = Math.min(widthCap * w, D_MAX);
    if (D < dFloor) D = dFloor;
    D = Math.round(D);
    applyD(D, dial);

    /* s156: el desbordamiento se mide sobre el STACK, no sobre `scrollHeight`
       de la región. `scrollHeight` es la envolvente de TODO lo que sobresale —
       incluida cualquier decoración absoluta o un hijo desplazado por
       transform— y no vuelve a bajar aunque el aro encoja, así que el bucle
       agotaba sus 8 pasadas restando de más.

       No es teórico: con `prefers-reduced-motion: reduce` el aro salía a 244 px
       en vez de 406 (v0.88.1, medido a 1280×720), o sea que quien pide menos
       movimiento se llevaba además una home encogida un 40 %. El stack es
       exactamente lo que este bucle controla, así que medirlo a él converge. */
    var stackFit = document.querySelector('[data-pace-home-stack]');
    var medirOver = function () {
      return stackFit
        ? stackFit.offsetHeight - body.clientHeight
        : body.scrollHeight - body.clientHeight;
    };
    var overPrevio = null;
    var dPrevio = D;
    for (var i = 0; i < MAX_FIT_PASSES; i++) {
      var over = medirOver();
      if (over <= 1 || D <= dFloor) { reintentos = 0; break; }
      /* NUNCA ENCOGER A CIEGAS (s156). Si la pasada anterior redujo D y el
         desbordamiento no mejoró, la medida no está respondiendo al cambio y
         seguir restando es dar palos: se vuelve al último D no desmentido y se
         sale. Medido a 1280×720 con `prefers-reduced-motion: reduce`: el alto
         del stack se quedaba clavado mientras D bajaba de 420 a 322, y el
         bucle agotaba sus ocho pasadas — de ahí el aro de 244 px de v0.88.1.
         Con esto, cuando no se puede medir manda el techo por ancho, que es la
         respuesta correcta ante una medida que no informa: como mucho quedan
         unos píxeles de scroll, que la región ya admite por diseño. */
      if (overPrevio !== null && over >= overPrevio) {
        D = dPrevio;
        applyD(D, dial);
        /* UN reintento, no más: en el siguiente frame el layout ya está
           asentado y la medida vuelve a responder, así que la pasada de después
           sí converge. El contador se reinicia solo cuando una pasada converge
           de forma normal, de modo que esto no puede encadenarse. */
        if (reintentos < 1) { reintentos++; schedule(); }
        break;
      }
      overPrevio = over;
      dPrevio = D;
      // reducir D: la huella vertical del aro tras solapar es ~0.84·D, así que
      // ΔD ≈ over/0.84 acerca el ajuste en una pasada (converge en 1-2).
      D = Math.max(dFloor, D - Math.ceil(over / 0.84));
      applyD(D, dial);
    }

    /* SOBRANTE VERTICAL (s156). Con el aro ya fijado, lo que queda libre en la
       región de la home. El CSS lo reparte en móvil dando MENOS aire arriba que
       abajo: la composición deja de flotar centrada y se asienta como un
       amanecer (masa alta, suelo bajo). Es una medida, no un número elegido: en
       teléfonos el aro topa por ancho y el sobrante es estructural, así que la
       única decisión de diseño es dónde ponerlo. Publicarlo NO realimenta —
       mueve el stack, no lo redimensiona—, y con sobrante 0 el móvil vuelve al
       centrado de siempre. */
    var stack = document.querySelector('[data-pace-home-stack]');
    if (stack) {
      var libre = Math.max(0, Math.round(body.clientHeight - stack.offsetHeight));
      setVar('--pace-home-slack', libre + 'px');
    }
  }

  function schedule() {
    if (!rafId) rafId = requestAnimationFrame(compute);
  }

  /* Recálculo pedido desde FUERA (resize, rotación, relayout, cruce de
     breakpoint, montaje/desmontaje). Devuelve el reintento del bucle a su
     estado inicial: el presupuesto de un reintento es por episodio, no uno
     para toda la vida de la página. */
  function reprogramar() {
    reintentos = 0;
    schedule();
  }

  /* Re-suscribe el ResizeObserver a los nodos QUE EXISTEN AHORA. Se llama al
     arrancar y cada vez que cambian los hijos del stack. Nunca observa el
     contenedor del aro: eso sí sería un bucle (cambiar D cambiaría su tamaño). */
  function observarNodos() {
    if (!ro) return;
    ro.disconnect();
    var body = document.querySelector('[data-pace-home-body]');
    var spc = document.querySelector('[data-pace-spc]');
    var act = document.querySelector('[data-pace-activitybar]');
    if (body) ro.observe(body);
    if (spc) ro.observe(spc);   // Camino: altura varía con contenido/idioma
    if (act) ro.observe(act);   // Actividades: idem
  }

  function attach(stack) {
    if (window.ResizeObserver) {
      ro = new ResizeObserver(schedule);
      observarNodos();
    }
    /* Vigilancia de montaje/desmontaje. `childList` a secas sobre el stack: sus
       hijos DIRECTOS son los tres bloques de la home, así que entrar y salir de
       un Camino se ve aquí y nada más se ve. Sin `subtree`, `attributes` ni
       `characterData` — el Pomodoro cambia texto cada segundo y con `subtree`
       esto recalcularía sesenta veces por minuto. */
    if (window.MutationObserver && stack) {
      mo = new MutationObserver(function () { observarNodos(); reprogramar(); });
      mo.observe(stack, { childList: true });
    }
    window.addEventListener('resize', reprogramar);
    window.addEventListener('orientationchange', reprogramar);
    window.addEventListener('pace:home-relayout', reprogramar);
    if (window.matchMedia) {
      // recalcular al cruzar el umbral mobile/desktop
      var mq = window.matchMedia(DESKTOP_MQ);
      if (mq.addEventListener) mq.addEventListener('change', reprogramar);
      else if (mq.addListener) mq.addListener(reprogramar);
    }
    /* SÍNCRONA, no `schedule()`: ver la cabecera. En el arranque los frames
       están hambrientos y esperar uno dejaba el aro al fallback ~1,3 s. */
    compute();
    /* Las métricas del CICLO —de donde sale el techo del solapamiento— cambian
       cuando entra la fuente real. Una sola pasada más, sin sondeo. */
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(schedule).catch(function () {});
    }
  }

  /* Fase 1: esperar a que la home exista. React monta de forma asíncrona, así
     que al cargar el script puede no haber nada todavía. Este observador se
     desconecta en cuanto encuentra la home y NO vuelve a correr. */
  function esperarHome() {
    var stack = document.querySelector('[data-pace-home-stack]');
    var body = document.querySelector('[data-pace-home-body]');
    if (body && stack) { attach(stack); return; }
    if (!window.MutationObserver) { requestAnimationFrame(esperarHome); return; }
    var espera = new MutationObserver(function () {
      var s = document.querySelector('[data-pace-home-stack]');
      var b = document.querySelector('[data-pace-home-body]');
      if (!b || !s) return;
      espera.disconnect();
      attach(s);
    });
    espera.observe(document.documentElement, { childList: true, subtree: true });
  }

  esperarHome();
})();
