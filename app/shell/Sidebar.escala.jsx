/* PACE · el MOTOR DE LA ESCALA de la sidebar — extraído de `Sidebar.jsx` en s182
   ==============================================================================
   `Sidebar.jsx` llegó a 506 líneas (regla nº 1 de CLAUDE.md: < 500) al entrar la
   escala del cajón de móvil, y el `verify` lo cazó. El corte NO es por
   kilometraje: `Sidebar.jsx` es el ORQUESTADOR —compone secciones y no dibuja ni
   decide ninguna— y esto es un motor de GEOMETRÍA que mide el DOM, escribe dos
   custom properties y no sabe nada de secciones. Es la misma costura que ya
   separó la hoja de estilos en s181.

     · Sidebar.escala.jsx   (este) → el motor: mide, calcula el factor, lo aplica
     · Sidebar.hoja.jsx            → la hoja inyectada, donde vive su geometría
     · Sidebar.support.jsx         → `sidebarStyles`, los estilos en línea
     · Sidebar.selectors.js        → los selectores puros
     · Sidebar.parts.jsx           → las piezas de UI
     · Sidebar.jsx                 → el orquestador

   ORDEN DE CARGA: antes que `Sidebar.jsx`, que es quien llama al hook.

   Exporta `useSidebarEscala()`, que devuelve la ref para colgar de la envoltura
   `[data-pace-sidebar-escala]`. El hook se queda con TODO el estado del motor
   (las tres refs), así que el orquestador no lo ve.
*/

/* EL SUELO DE LA ESCALA EN EL CAJÓN (s182) · lo más pequeño que la sidebar
   puede llegar a verse en un móvil. Es UNA constante y no un número suelto
   porque mueve la frontera entera: por encima de este factor la pantalla cabe
   completa, y por debajo la columna se queda a este tamaño y se desplaza.

   POR QUÉ 0,80 Y NO OTRO, medido en `scripts/audit/banco-sidebar-movil-s182.js`
   sobre los seis viewports reales:
     · el bloque de la semana —el objetivo táctil que s180 afinó a 45 px— se
       queda en 36, que sigue muy por encima del mínimo de WCAG 2.2 AA (24) y
       es lo último que se puede ceder sin bajar de ahí con holgura;
     · hace caber ENTERO 375x667, o sea el iPhone SE / 8, que es la pantalla
       corta más común. Con 0,85 —el suelo que proponía el handoff de s181—
       todavía se quedaban 38 px fuera.
   Lo que cuesta y se dice: el texto secundario de 11 px se ve a 8,8, y las
   iniciales de los días, que son de 9, a 7,2.

   Y EL NÚMERO DEL HANDOFF ERA FALSO: decía que 0,85 haría caber «de 667 para
   arriba» porque 0,85 x 780 = 663. Faltaba contar el propio cajón — 22 px de
   padding arriba y abajo más el `min-height: 100dvh + 1px` — así que a 667 el
   hueco real son 622 y no 667. */
const SUELO_CAJON = 0.8;

/* ======================================================================
   LA ESCALA · «que se vea siempre igual, en cualquier resolucion»
   ======================================================================
   Decision del usuario (s181), con sus palabras: «si hay que hacer a la vez
   pequenos a TODOS los elementos de la sidebar, perfecto». Lo que se conserva
   es la COMPOSICION, no un tamano en pixeles.

   POR QUE UNA TRANSFORMACION Y NO APRETAR EL AIRE: se probo lo segundo y bajaba
   la columna de 835,9 a 700,3 px, pero para lograrlo cambiaba las PROPORCIONES
   -- las reglas pasaban de 12 a 5 px de margen mientras el texto seguia igual--
   y el usuario lo rechazo mirandolo. Una escala uniforme no cambia ninguna
   proporcion: es la misma sidebar, mas pequena.

   POR QUE SE MIDE Y NO SE FIJA UNA CONSTANTE: el alto natural depende del
   contenido (que la tarjeta este o no, el idioma, el titulo del logro).
   Medirlo se corrige solo; una constante habria que acordarse de tocarla.

   Y DESDE s182 TAMBIEN EN EL CAJON DE MOVIL, con suelo (`SUELO_CAJON`). Hasta
   v0.113.0 esto se apagaba por debajo de 768 px a proposito -- alli el cajon
   tiene `height: auto` y el scroll es correcto por diseno-- y esa decision
   queda ANULADA por el usuario tras verlo: el cajon natural mide 779 px y
   ninguna pantalla de movil corta los tiene, asi que hasta 428x800 el pie
   quedaba 1,4 px POR DEBAJO del borde. Lo que cambia respecto a escritorio son
   dos cosas y estan abajo, en `recalcular`: de donde sale el alto disponible, y
   que aqui la lente hay que ALTARLA a mano.

   COMO SE MIDE SIN MENTIR Y SIN MUTAR NADA: se suman los hijos con
   `offsetHeight` + sus margenes, saltando el espaciador. `offsetHeight` es un
   valor de LAYOUT y las transformaciones no lo tocan -- al contrario que
   `getBoundingClientRect`, que devuelve la caja YA transformada (trampa de
   s177). La primera version de esto anulaba el `min-height` con un atributo
   para poder leer la envoltura entera, y eso invalidaba el layout DOS veces por
   render; con el Pomodoro corriendo eso es cada segundo.

   Y LA SALVAGUARDA: `data-escalado` solo se pone a 1 cuando de verdad hay
   escala. Mientras vale 0 la sidebar conserva su `overflow-y: auto` de siempre,
   asi que si esto no llegara a ejecutarse el resultado seria el comportamiento
   de siempre -- scroll-- y nunca un recorte mudo. */
function useSidebarEscala() {
  const escalaRef = React.useRef(null);
  const ultimaEscalaRef = React.useRef(null);
  const ultimoAltoRef = React.useRef(null);

  React.useLayoutEffect(function () {
    const caja = escalaRef.current;
    if (!caja) return;
    /* La lente es su padre y el aside su abuelo. */
    const lente = caja.parentElement;
    const aside = caja.closest('[data-pace-sidebar]');
    if (!lente || !aside) return;

    function aplicar(escala, alto) {
      /* Sin escribir de mas: el navegador invalida el layout con cada cambio de
         estilo, y este efecto corre en cada render. Y desde s182 esto ademas
         CORTA UN BUCLE: el `ResizeObserver` mira la lente, cuyo alto escribimos
         nosotros en el cajon, asi que sin esta guarda cada pasada dispararia la
         siguiente. Con ella converge en una: segunda lectura, mismos numeros,
         no se escribe nada. */
      if (ultimaEscalaRef.current === escala && ultimoAltoRef.current === alto) return;
      ultimaEscalaRef.current = escala;
      ultimoAltoRef.current = alto;
      caja.style.setProperty('--sb-escala', String(escala));
      /* El alto que la columna escalada OCUPA. Solo lo usa la hoja del cajon:
         en escritorio la lente la dimensiona el flex y esta variable sobra. Se
         escribe siempre de todos modos, para que el valor no quede rancio si la
         pantalla cruza el breakpoint. */
      lente.style.setProperty('--sb-alto', alto > 0 ? alto + 'px' : 'auto');
      aside.setAttribute('data-escalado', escala < 1 ? '1' : '0');
    }

    function recalcular() {
      let natural = 0;
      const hijos = caja.children;
      for (let i = 0; i < hijos.length; i++) {
        const el = hijos[i];
        if (el.hasAttribute('data-pace-sidebar-spacer')) continue;
        const st = window.getComputedStyle(el);
        if (st.position === 'absolute' || st.position === 'fixed') continue;
        natural += el.offsetHeight
          + (parseFloat(st.marginTop) || 0)
          + (parseFloat(st.marginBottom) || 0);
      }

      /* EL ALTO DISPONIBLE SE PREGUNTA EN SITIOS DISTINTOS SEGUN LA PIEL, y no
         es una comodidad: en escritorio la lente es un hijo FLEXIBLE y su
         `clientHeight` ya es el hueco real -- viene con el padding del aside
         descontado por ser su hijo, una resta menos que hacer a mano. En el
         cajon es `display: block` y se dimensiona AL CONTENIDO, asi que
         preguntarle devolveria el alto natural y la escala saldria exactamente
         1: verde, silencioso y falso. Alli manda el cajon menos su padding. */
      const cajon = esCajon();
      let disponible;
      if (cajon) {
        const st = window.getComputedStyle(aside);
        disponible = aside.clientHeight
          - (parseFloat(st.paddingTop) || 0)
          - (parseFloat(st.paddingBottom) || 0);
      } else {
        disponible = lente.clientHeight;
      }

      if (!(natural > 0) || !(disponible > 0)) { aplicar(1, 0); return; }

      /* Nunca AGRANDA: por encima de su tamano natural la sidebar se queda como
         esta y el sobrante se va al espaciador, que es lo que ya hacia. */
      let escala = Math.min(1, disponible / natural);
      /* Y EN EL CAJON, SUELO. Decision del usuario en s182: «escalarla en todas
         las resoluciones que quede bien y en las mas pequenas aceptamos un
         pequeno scroll sin barra». Sin suelo, 360x560 pedia 0,66 y dejaba el
         texto secundario en 7,3 px con el bloque de la semana en 29,9 -- el
         propio usuario lo llamo diminuto mirandolo. */
      if (cajon && escala < SUELO_CAJON) escala = SUELO_CAJON;
      escala = Math.round(escala * 10000) / 10000;
      /* El alto solo se escribe en el cajon: en escritorio la lente ya sabe
         cuanto mide y darselo la sacaria de su flex. */
      aplicar(escala, cajon ? Math.round(natural * escala * 10) / 10 : 0);
    }

    recalcular();

    /* SE OBSERVA LA CAJA, NO LA VENTANA -- y esto no es preferencia de estilo.
       La primera version solo escuchaba `resize` de `window`, y MEDIDO: al
       cambiar el viewport desde Playwright (`setViewportSize`) ese evento NO SE
       DISPARA -- cero eventos con `innerHeight` ya cambiado-- asi que la escala
       se quedaba clavada en el valor del arranque. Se vio porque la suite daba
       0,8251 a los seis altos mientras el ratio real iba de 1,17 a 0,71.
       Si un entorno de verdad hace lo mismo (algunos webviews al recolocar
       barras), el defecto seria el mismo y silencioso.
       El `resize` de ventana se queda como segunda via para el caso de un
       navegador sin `ResizeObserver`.
       SIN DEBOUNCE a proposito: con 60 ms la sidebar iba un instante por detras
       al redimensionar, y el coste real es una lectura de layout que el
       navegador ya iba a hacer.

       SE OBSERVAN LOS DOS DESDE s182, y cada uno cubre una piel. En escritorio
       manda la LENTE, como hasta ahora. En el cajon la lente ya no sirve de
       aviso: la dimensionamos NOSOTROS con `--sb-alto`, asi que su alto cambia
       *despues* del calculo y no antes -- quien avisa alli es el ASIDE, cuyo
       alto lo fija el viewport. Observar solo el que no toca deja el aviso mudo
       en esa piel, que es el mismo fallo por omision de siempre.
       Y POR ESO `aplicar` LLEVA GUARDA: con la lente escrita por nosotros y
       observada, una pasada dispara la siguiente. Converge en una porque la
       segunda lee los mismos numeros y no escribe. */
    let observador = null;
    if (typeof window.ResizeObserver === 'function') {
      observador = new window.ResizeObserver(recalcular);
      observador.observe(lente);
      observador.observe(aside);
    }
    window.addEventListener('resize', recalcular);

    /* Y OTRA VEZ CUANDO LLEGUEN LAS FUENTES. Este no es un remate defensivo:
       lo destapo un rojo intermitente -- uno de cada tres-- y la causa era del
       PRODUCTO, no del test. El alto natural depende de las metricas de la
       fuente, asi que si las webfonts terminan de cargar DESPUES de calcular la
       escala, el numero se queda hecho con la fuente de reserva. Nada lo
       corrige: el ResizeObserver mira cajas cuyo alto no cambia porque cambien
       las fuentes. En una conexion lenta eso deja la sidebar mal escalada de
       forma permanente.
       `document.fonts.ready` es la promesa y es fiable; `document.fonts.check()`
       NO -- devuelve false con las fuentes ya cargadas (trampa de s180). */
    let vivo = true;
    if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
      document.fonts.ready.then(function () { if (vivo) recalcular(); });
    }

    return function () {
      vivo = false;
      window.removeEventListener('resize', recalcular);
      if (observador) observador.disconnect();
    };
  });

  return escalaRef;
}

/* `SUELO_CAJON` viaja tambien: la suite lo lee para no repetir el numero, que
   es como una constante y un aserto se separan sin que nadie se entere. */
Object.assign(window, { useSidebarEscala, SUELO_CAJON });
