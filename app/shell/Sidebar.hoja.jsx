/* PACE · la HOJA de estilos del Sidebar — extraída de `Sidebar.support.jsx` en s181
   ==================================================================
   `Sidebar.support.jsx` llegó a 526 líneas (regla nº 1 de CLAUDE.md: < 500) al
   entrar la geometría de la escala de s181, y el `verify` lo cazó. El corte NO
   es por kilometraje: el archivo llevaba DOS cosas que su propia cabecera ya
   nombraba por separado -- la hoja CSS que se inyecta una vez y el objeto de
   estilos en línea-- y son de naturaleza distinta.

     · Sidebar.hoja.jsx     (este) → la hoja inyectada: responsive, la rejilla
                                     de Hoy, el recorte del logo, la lente y la
                                     envoltura que escala
     · Sidebar.support.jsx         → `sidebarStyles`, los estilos en línea
     · Sidebar.selectors.js        → los selectores puros
     · Sidebar.parts.jsx           → las piezas de UI
     · Sidebar.jsx                 → el orquestador

   AQUI VIVE LO QUE NO PUEDE IR EN LINEA, y no es una preferencia: React no crea
   pseudo-elementos desde un estilo en línea (el `::after` que hace clicable la
   tarjeta entera), las media queries no existen en línea, y un estilo en línea
   GANA a la hoja sin `!important` -- por eso el recorte del logo lo lleva.

   CUIDADO AL EDITAR: todo esto vive dentro de un template literal, así que un
   backtick en un comentario ROMPE el archivo. Ha pasado CINCO veces (s180 tres,
   s181 una, s182 una) y siempre lo caza el `verify` como error de sintaxis.
   Los comentarios nuevos citan con «comillas latinas» por eso.

   ORDEN DE CARGA: antes que `Sidebar.support.jsx`. */

/* Inyecta reglas responsive del sidebar una sola vez.
   Patrón ya usado en FocusTimer para spinners de number input.
   Mantiene los inline styles intactos y sólo reescribe el layout
   a partir del breakpoint móvil. */
if (typeof document !== 'undefined' && !document.getElementById('pace-sidebar-responsive-css')) {
  const s = document.createElement('style');
  s.id = 'pace-sidebar-responsive-css';
  s.textContent = `
    @media (max-width: 768px) {
      [data-pace-sidebar] {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        /* Alto del drawer fullscreen · SCROLL ASIMÉTRICO (sesión 24, v0.12.7).
           A diferencia de la home (que usa 100dvh puro para que los 4
           botones quepan siempre sin scroll), el sidebar FUERZA scroll
           latente para que el navegador móvil oculte su barra de URL
           y el contenido real (ritmo + sendero + logros + footer) tenga
           espacio para respirar. Técnica: min-height 1px por encima
           del viewport visible. Ese píxel extra activa el detector de
           scroll del navegador → auto-hide de la barra → el usuario
           recupera ~56-100px que el drawer aprovecha.
             - min-height: calc(100dvh + 1px) con fallback 100vh+1px
               — 1px invisible, no hay artefacto.
             - height: auto — el drawer se dimensiona al contenido,
               no al viewport. Sin límites artificiales.
             - max-height: none — no limitamos arriba. Si el contenido
               es más largo que el viewport, scroll natural.
             - overflow-y: auto — red de seguridad para viewports
               patológicos (landscape muy bajo).
           Coste conocido: pequeño tirón la primera vez que se abre el
           drawer (aparece con barra URL visible, el usuario desliza,
           la barra se recoge, el drawer crece). A partir del segundo
           uso con la barra ya oculta, se abre directamente expandido. */
        min-height: calc(100vh + 1px) !important;
        min-height: calc(100dvh + 1px) !important;
        height: auto !important;
        max-height: none !important;
        z-index: 60 !important;
        padding: 22px 22px !important;
        border-right: none !important;
        overflow-y: auto !important;
      }
      /* Chevron de cerrar: hit target ≥44px en móvil, más notorio */
      [data-pace-sidebar] [data-pace-sidebar-toggle] {
        top: 14px !important;
        right: 14px !important;
        width: 44px !important;
        height: 44px !important;
        opacity: 1 !important;
      }
      /* Logo bar con un poco menos de altura mínima para que quepa
         ritmo + sendero + logros + footer sin scroll en móviles medios.
         Los márgenes negativos se mantienen — el logo respira igual. */
      [data-pace-sidebar] [data-pace-sidebar-logobar] {
        min-height: 84px !important;
      }
    }
    /* s63 (v0.28.4): Compactación sidebar en móviles ≤640px.
       s64 (v0.28.5): márgenes negativos neutralizados para evitar clip lateral.
       s66 (v0.28.6): eliminado max-height + overflow:hidden que recortaban logo
       y tagline; logo limitado a max-width 200px con data-pace-sidebar-logo. */
    @media (max-width: 640px) {
      [data-pace-sidebar] [data-pace-sidebar-logobar] {
        /* Márgenes neutralizados + overflow visible para mostrar logo+tagline íntegros */
        overflow: visible !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        padding: 6px 4px !important;
      }
      [data-pace-sidebar] [data-pace-sidebar-logo] {
        max-width: 200px !important;
        width: 100% !important;
        margin: 0 auto !important;
      }
      /* Spacer flex:1 oculto: el contenido se apila desde arriba y
         el espacio sobrante queda al final, antes del footer. */
      [data-pace-sidebar] [data-pace-sidebar-spacer] {
        display: none !important;
      }
    }

    /* ============================================================
       s180 · EL RECORTE DEL LOGO, Y POR QUE VA EN CSS
       ------------------------------------------------------------
       'app/ui/pace-logo.png' es 716x471 pero su DIBUJO ocupa solo 488x194:
       medido sobre el canal alfa, hay 85 px transparentes a la izquierda,
       143 a la derecha, 123 arriba y 154 abajo, y el 93,53 % del lienzo esta
       a alfa 0. Puesto en la banda de 271 px de la sidebar eso gastaba
       178,3 px de alto de los que 104,9 eran aire, y ademas la imagen
       DESBORDABA su banda 13,7 px sin que se notara -- justamente porque lo
       que desbordaba era transparencia.

       NO se crea un 'pace-logo-sidebar.png' a proposito. El '<img
       id="pace-logo-src">' lo leen DOS consumidores ('CowLogo.jsx' y
       'OnboardingScreens.jsx'), asi que cambiarlo de sitio le tocaria el logo
       al onboarding; y anadir un segundo archivo lo inlinearia otra vez en el
       artefacto (~100 KB de base64 por un dibujo que se pinta una vez).
       Recortar por CSS deja el PNG intacto para todo el mundo.

       LA ARITMETICA (si algun dia cambia el PNG, hay que volver a medirla):
         ancho de la imagen = 716/488            = 146,72 %
         izquierda          = -85/488            = -17,42 %
         alto de la caja    = 194/488 del ancho  =  39,75 %
         arriba: la imagen mide 0,96517 W de alto y hay que subirla
                 123/471 de eso = 0,25207 W, que sobre una caja de
                 0,39754 W de alto es                -63,41 %
       ============================================================ */
    [data-pace-sidebar] [data-pace-sidebar-logo] {
      position: relative;
      overflow: hidden;
      aspect-ratio: 488 / 194;
      display: block;
    }
    /* NECESITA !important, y no es pereza: 'PaceLogoImage' pinta la <img> con
       width/maxWidth/height EN LINEA, y un estilo en linea gana a la hoja sin
       que haga falta un !important del otro lado. Medido: sin esto la caja
       recortaba (107,8 px de alto, correcto) pero el dibujo seguia a 271x178,4,
       o sea el recorte no hacia nada. Mismo mordisco que s174 con el padding
       en linea del modal. */
    [data-pace-sidebar] [data-pace-sidebar-logo] img {
      position: absolute !important;
      width: 146.72% !important;
      max-width: none !important;
      height: auto !important;
      left: -17.42% !important;
      top: -63.41% !important;
    }

    /* Hoy · rejilla 2x2. Las celdas son BOTONES: abren su modulo. Antes, para
       ir a Respira habia que salir de la sidebar. */
    [data-pace-sidebar] [data-pace-hoy] {
      display: grid; grid-template-columns: 1fr 1fr; gap: 9px;
      /* Sin esto la fila del agua crece con sus ocho vasos y la rejilla queda
         con filas de 87 y 99 px. Medido en la app, no supuesto. */
      grid-auto-rows: 1fr;
    }
    [data-pace-sidebar] [data-pace-hoy-celda] {
      border: 1px solid var(--line); border-radius: var(--r-sm);
      padding: 9px 10px 8px; background: var(--paper);
      display: flex; flex-direction: column; gap: 5px;
      min-height: 74px; width: 100%; align-items: center; text-align: center;
      transition: border-color 180ms, background 180ms;
    }
    [data-pace-sidebar] [data-pace-hoy-celda]:hover { border-color: var(--line-2); }
    [data-pace-sidebar] [data-pace-hoy-celda][data-cero="1"] { background: transparent; }
    [data-pace-sidebar] [data-pace-hoy-celda][data-cero="1"] [data-pace-hoy-ic] { opacity: 0.3; }

    /* El «+1» de agua NO puede ser hermano suelto de la celda: el grid le daria
       su propia casilla y la rejilla pasaria de cuatro a cinco. Va envuelto. */
    /* LA TARJETA ENTERA ES EL OBJETIVO, y esto NO puede vivir en los estilos
       en linea: React no crea pseudo-elementos. Sin esta regla el objetivo es
       solo el titulo -- medido, 74 x 23 px de una tarjeta de 243 x 117, y un
       click en la mitad de abajo cae en un div. Lo reporto el usuario, y luego
       un corte de CSS se la llevo por delante: la cazo su test, que prueba las
       CUATRO esquinas y el centro.
       El patron es el de s174: el encabezado lleva DENTRO el boton y este se
       extiende con un '::after' absoluto, para conservar el <h4> en el arbol de
       accesibilidad. */
    [data-pace-sidebar] [data-pace-sidebar-accion] h4 button::after {
      content: ''; position: absolute; inset: 0; z-index: 1;
    }
    [data-pace-sidebar] [data-pace-sidebar-accion]:hover { border-color: var(--line-2); }

    /* La semana entera es UN objetivo. Siete de 44 px no caben: 7x44 = 308 y el
       ancho util son 243. Asi el objetivo pasa a 243 x ~59 y cuesta 0 px. */
    /* SIN ROTULO, EL BOTON TIENE QUE PONER SU PROPIO ALTO. La fila de puntos
       mide 21 px y el minimo tactil son 44: el padding de 12 lo sube a 45 sin
       anadir nada visible. Antes ese alto lo daba el rotulo de la seccion, que
       se retiro. */
    [data-pace-sidebar] [data-pace-semana] {
      display: block; width: 100%; text-align: left;
      border-radius: var(--r-sm); padding: 12px 6px; margin: -12px -6px;
    }
    [data-pace-sidebar] [data-pace-semana]:hover { background: var(--focus-soft); }

    /* LA ENVOLTURA QUE SE ESCALA (s181). La sidebar se ve IGUAL en cualquier
       resolucion: cuando no cabe, encoge entera en vez de recolocarse. El
       factor lo calcula y lo escribe Sidebar.jsx en --sb-escala; aqui solo
       vive la geometria.
       LOS DOS calc NO SON ADORNO: una transformacion no cambia la caja de
       layout, asi que para que el resultado ESCALADO mida justo el ancho y el
       alto disponibles, la caja SIN escalar tiene que medir eso dividido entre
       el factor. Con --sb-escala: 1 los dos calc valen 100% y esto no hace
       absolutamente nada, que es como arranca. */
    [data-pace-sidebar] [data-pace-sidebar-escala] {
      --sb-escala: 1;
      display: flex;
      flex-direction: column;
      flex: none;
      width: calc(100% / var(--sb-escala));
      min-height: calc(100% / var(--sb-escala));
      transform: scale(var(--sb-escala));
      transform-origin: top left;
    }

    /* Y por eso mismo la envoltura DESBORDA en layout aunque a la vista quepa.
       Se tapa ese desborde SOLO cuando hay escala de verdad: mientras
       data-escalado valga 0 la sidebar conserva su overflow-y: auto, asi
       que si el calculo no llegara a correr el resultado seria el
       comportamiento de siempre -- scroll-- y nunca un recorte mudo. */
    /* LA LENTE. La envoltura escalada mide 100%/escala, o sea que DESBORDA su
       caja de layout aunque a la vista quepa -- una transformacion no cambia la
       caja. Ese desborde tiene que morir aqui y no llegar al aside: si llega,
       el aside declara scroll horizontal (medido: 52 px a 1280x720) y se lleva
       por delante el guard que ya existia contra el scroll lateral.
       Y SOLO RECORTA CUANDO HAY ESCALA DE VERDAD: con data-escalado a 0 deja
       pasar el desborde al aside, que tiene overflow-y auto, asi que si el
       calculo no llegara a correr saldria scroll -- el comportamiento de
       siempre-- y nunca un recorte mudo. */
    [data-pace-sidebar] [data-pace-sidebar-lente] {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
    }
    [data-pace-sidebar][data-escalado="1"] [data-pace-sidebar-lente] { overflow: hidden; }

    /* EL CAJON DE MOVIL TAMBIEN ESCALA DESDE s182 (v0.114.0), y hasta v0.113.0
       no lo hacia: aqui vivian tres «!important» que apagaban la geometria
       entera. La decision del usuario, con sus palabras: «escalarla en todas
       las resoluciones que quede bien y en las mas pequenas aceptamos un
       pequeno scroll sin barra».

       LO QUE SIGUE SIENDO DISTINTO, y por eso este bloque no desaparece: en el
       cajon la lente NO es un hijo flexible con un hueco que rellenar -- el
       aside tiene «height: auto»-- asi que es «display: block» y se dimensiona
       al contenido. Cuando hay escala, el alto que la columna OCUPA ya no es el
       suyo de layout, y ese numero no se puede calcular en CSS: lo escribe
       «Sidebar.jsx» en «--sb-alto» y aqui solo se consume. Sin esto la columna
       encogeria a la vista y el cajon seguiria midiendo lo de antes, o sea que
       la escala no habria servido de nada. */
    @media (max-width: 768px) {
      [data-pace-sidebar] [data-pace-sidebar-lente] {
        display: block !important;
        flex: none !important;
        overflow: visible !important;
      }
      [data-pace-sidebar][data-escalado="1"] [data-pace-sidebar-lente] {
        height: var(--sb-alto, auto);
        overflow: hidden !important;
      }
      /* El «min-height: calc(100% / escala)» de la envoltura es para RELLENAR
         un hueco, y en el cajon no hay hueco que rellenar. El «width» y el
         «transform» de la regla base SI valen aqui: con --sb-escala a 1 los dos
         son la identidad, asi que sin escala esto se comporta como siempre. */
      [data-pace-sidebar] [data-pace-sidebar-escala] { min-height: 0 !important; }

      /* «UN PEQUENO SCROLL SIN BARRA» (s182). Por debajo del suelo de la escala
         el cajon se desplaza, y el usuario pidio expresamente que no salga la
         barra. Mismo patron que el centro de sesion (s125/s163): se oculta la
         barra y se CONSERVA el scroll -- «overflow: hidden» lo mataria y
         dejaria contenido inalcanzable. */
      [data-pace-sidebar] {
        scrollbar-width: none;            /* Firefox */
        -ms-overflow-style: none;         /* Edge/IE legacy */
      }
      [data-pace-sidebar]::-webkit-scrollbar {
        display: none;                    /* WebKit / Blink */
      }

      /* EL AIRE DE LA TARJETA, SOLO EN EL CAJON (s182, encargo B del usuario).
         Bajo la ultima linea habia 28 px -- 16 de padding mas 12 del descender--
         y bajar el padding a 8 devuelve 8 px exactos: a 428x800 el pie pasa de
         quedar 1,4 px por DEBAJO del borde a tener 6,6 dentro.
         VA AQUI Y NO EN «sidebarStyles.accion» porque ese objeto lo comparten
         las dos pieles, y en escritorio el aire se afino mirandolo en s180.
         Y LLEVA «!important» POR NECESIDAD, NO POR PEREZA: el padding lo pone un
         estilo EN LINEA, que gana a la hoja sin que haga falta «!important» del
         otro lado (misma trampa que s180 con el recorte del logo). */
      [data-pace-sidebar] [data-pace-sidebar-accion] { padding-bottom: 8px !important; }
    }

    @media (max-width: 640px) {
      /* El logo ya iba capado a 200 px desde s66; con el recorte eso son
         200 x 79,5 en vez de los 121 de alto que daba sin tope a 390 px. */
      [data-pace-sidebar] [data-pace-hoy] { gap: 8px; }
    }
  `;
  document.head.appendChild(s);
}
