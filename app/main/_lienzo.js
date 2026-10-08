/* PACE · EL LIENZO QUE CRECE (opción 2 de la escala con el zoom, elegida por Ez)
   ==============================================================================
   QUÉ RESUELVE. Con el zoom del navegador al 33 %, la ventana pasa a medir para la app
   tres veces más (unos 4600 × 2100 en el portátil de Ez) y PACE se quedaba en su tamaño,
   pequeña en el centro. Lo mismo en un monitor grande al 100 %. Ahora, si la ventana es
   más grande que el lienzo de referencia, la app crece en proporción y se ve como en el
   portátil de Ez al 100 % (1530 × 702 útiles). Ampliar para leer (zoom por encima del
   100 %) sigue funcionando: la ventana se hace más pequeña que el lienzo y no se toca.

   CÓMO. `zoom` CSS en la raíz, con la escala = el menor de ancho/1536 y alto/704. Bajo
   `zoom`, el navegador maquetaría la app a un tamaño efectivo de ventana dividido por la
   escala... salvo en tres cosas, que son las que rompían la prueba ingenua (la home salía
   tres veces más alta y el aro en su mínimo):
     · `vh`, `dvh` y `vw` siguen midiendo la ventana REAL y luego se multiplican por la
       escala. Por eso se publican `--pace-vh` y `--pace-dvh` con el alto efectivo, y las
       hojas los usan solo mientras la raíz lleva `[data-pace-lienzo]` (sin lienzo, todo
       queda como siempre). Los `vw` no hacen falta: con el lienzo puesto el ancho efectivo
       nunca baja de 1536, y ahí todos los `vw` de la app ya topan con su máximo en px.
     · `innerHeight` e `innerWidth` dan la ventana real: el alto efectivo es
       `paceLienzoAlto()`.
     · `getBoundingClientRect` devuelve px de PANTALLA, mientras `offsetHeight`,
       `clientHeight` y los estilos van en px CSS. Mezclarlos sin más desencaja todo lo que
       mide; `paceCaja(el)` devuelve la caja en px CSS.
   Las media queries también miran la ventana real, pero no cambian nada: las de ancho son
   de móvil (≤ 768 o vertical hasta 1024) y las de alto cortan en 700 o menos, y el lienzo
   nunca deja la ventana efectiva por debajo de 1536 × 704.

   POR QUÉ 704 Y NO 700: el portátil de Ez tiene 702 de alto, justo encima del corte de
   700 de las hojas (sesiones, Respira, el panel del día). Con 704 la ventana efectiva
   queda siempre por encima de ese corte, aunque la escala se redondee. Y la escala se
   redondea HACIA ABAJO para que la ventana efectiva no baje nunca del lienzo.

   ORDEN DE CARGA: el primero de todos. Los demás registran su `resize` después, así que
   cuando les llega el evento la escala ya está al día. */

var PACE_LIENZO_ANCHO = 1536;
var PACE_LIENZO_ALTO = 704;

(function () {
  var raiz = document.documentElement;
  var escala = 1;

  function calcular() {
    var w = window.innerWidth || 0;
    var h = window.innerHeight || 0;
    if (!w || !h) return 1;
    var s = Math.min(w / PACE_LIENZO_ANCHO, h / PACE_LIENZO_ALTO);
    return s > 1 ? Math.floor(s * 1000) / 1000 : 1;
  }

  var ultima = '';
  function aplicar() {
    var s = calcular();
    /* Sin escribir de más: este cálculo corre en cada `resize` y cada aviso del
       observador, y escribir estilos invalida el layout aunque el valor no cambie. */
    var clave = s + '|' + window.innerHeight;
    if (clave === ultima) return;
    ultima = clave;
    if (s === 1) {
      raiz.style.removeProperty('zoom');
      raiz.style.removeProperty('--pace-vh');
      raiz.style.removeProperty('--pace-dvh');
      raiz.removeAttribute('data-pace-lienzo');
    } else {
      var vh = (window.innerHeight / s / 100).toFixed(4) + 'px';
      raiz.style.setProperty('zoom', String(s));
      raiz.style.setProperty('--pace-vh', vh);
      raiz.style.setProperty('--pace-dvh', vh);
      raiz.setAttribute('data-pace-lienzo', String(s));
    }
    var cambia = s !== escala;
    escala = s;
    window.paceLienzo.escala = s;
    if (cambia) {
      try { window.dispatchEvent(new CustomEvent('pace:lienzo', { detail: { escala: s } })); } catch (e) {}
    }
  }

  window.paceLienzo = { escala: 1 };
  window.paceLienzoAlto = function () { return (window.innerHeight || 0) / escala; };
  window.paceLienzoAncho = function () { return (window.innerWidth || 0) / escala; };
  /* La caja de un elemento en px CSS, como sus `offsetHeight` y sus estilos. Sin lienzo
     devuelve la de siempre, sin copiarla. */
  window.paceCaja = function (el) {
    var r = el.getBoundingClientRect();
    if (escala === 1) return r;
    return {
      top: r.top / escala, bottom: r.bottom / escala, left: r.left / escala, right: r.right / escala,
      width: r.width / escala, height: r.height / escala, x: r.x / escala, y: r.y / escala,
    };
  };

  /* Las dos reglas de las hojas que van en dvh, y que por eso no admiten un var() con
     respaldo (en un navegador sin dvh, un var() que acaba en dvh no cae a la declaración
     anterior: queda inválido). Solo actúan con el lienzo puesto, y ganan por especificidad
     a las de `_responsive.js` (el alto de la raíz y el aro de la home). */
  if (!document.getElementById('pace-lienzo-css')) {
    var hoja = document.createElement('style');
    hoja.id = 'pace-lienzo-css';
    hoja.textContent = [
      'html[data-pace-lienzo] [data-pace-app-root] {',
      '  height: calc(100 * var(--pace-vh));',
      '  max-height: calc(100 * var(--pace-vh));',
      '}',
      'html[data-pace-lienzo] [data-pace-home-body] {',
      '  --pace-home-timer-size: min(86vw, 520px, max(300px, calc(58 * var(--pace-vh))));',
      '}',
    ].join(String.fromCharCode(10));
    document.head.appendChild(hoja);
  }

  aplicar();
  window.addEventListener('resize', aplicar);
  /* Y SE OBSERVA LA RAÍZ, como hace la escala de la barra lateral: hay entornos que
     cambian el tamaño de la ventana sin lanzar `resize` (Playwright al cambiar el
     viewport, y algunos webviews al recolocar barras). Converge en una pasada: si la
     escala no cambia, `aplicar` no escribe nada. */
  if (typeof window.ResizeObserver === 'function') {
    try { new window.ResizeObserver(aplicar).observe(raiz); } catch (e) {}
  }
})();

Object.assign(window, { PACE_LIENZO_ANCHO, PACE_LIENZO_ALTO });
