/* PACE · _responsive.luz.js — EL COLOR DE LA LUZ DE LA HOME
   ======================================================
   La primera parte de `_responsive.atmosfera.js` (las cuatro horas, la cadena de color-mix en OKLAB,
   el borde frío y el registro de --pace-luz y compañía con @property), movida tal cual al tocar
   aquel las 500 líneas de §1 (auditoría del 24 nov. 2026, H8A de Ez). Publica en
   `window.paceAtmosferaLuz` las piezas que `_responsive.atmosfera.js` sigue usando; lo demás
   (HORAS, TRAMOS, `cadena`) se queda dentro. Carga ANTES que `_responsive.atmosfera.js`. Usa
   `paceGrainUrl` (app/ui/SessionShell.jsx), que carga antes que los dos. */

(function paceAtmosferaLuz() {
  if (typeof document === 'undefined') return;
  if (window.paceAtmosferaLuz) return;

  const puedeMezclar = typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    && CSS.supports('background-image', 'radial-gradient(circle, color-mix(in srgb, red 50%, transparent) 0%, transparent 100%)');
  const grano = (typeof window.paceGrainUrl === 'function') ? window.paceGrainUrl() : 'none';

  /* LAS CUATRO HORAS. --pace-k viaja 0 -> 1 con el avance de la sesión y el
     tono se interpola en OKLAB, que es donde una mezcla azul->ámbar pasa por
     tonos creíbles en vez de por el gris muerto de sRGB.

       k = 0.00  amanecer    k = 0.38  mediodía
       k = 0.72  atardecer   k = 1.00  noche

     Los extremos son los DOS fríos del día y son tokens distintos: el frío del
     amanecer es azul con un punto rosa, el de la noche azul profundo. */
  const HORAS = [
    { core: 'var(--sun-dawn-core)', body: 'var(--sun-dawn-body)' },
    { core: 'var(--sun-noon-core)', body: 'var(--sun-noon-body)' },
    { core: 'var(--sun-dusk-core)', body: 'var(--sun-dusk-body)' },
    { core: 'var(--sun-night-core)', body: 'var(--sun-night-body)' },
  ];
  /* Recíprocos de la anchura de cada tramo (1/0.38, 1/0.34, 1/0.28) ya en
     porcentaje: el tramo consume su 100 % justo al llegar a la parada siguiente. */
  const TRAMOS = [[0, 263.16], [0.38, 294.12], [0.72, 357.14]];

  /* CLAMPEADO POR LOS DOS LADOS, y no es cinturón y tirantes. Un porcentaje
     NEGATIVO invalida el color-mix entero, y con él el degradado entero, y la
     capa simplemente no se pinta sin un solo aviso. Pasó en s157: con --pace-k
     por encima de 0,5 el primer tramo daba negativo y el aro se quedaba sin luz
     durante toda la sesión (medido: pico 0). */
  const peso = (desde, pendiente) => 'clamp(0%, calc(100% - (var(--pace-k, 1) - '
    + desde + ') * ' + pendiente + '%), 100%)';
  const puedeK = typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    && CSS.supports('color', 'color-mix(in oklab, red ' + peso(0, 100) + ', blue)');
  /* La cadena se lee de dentro afuera: la mezcla del tramo 1 entra como primer
     término de la del tramo 2, y así. Con el peso a 100 % gana la parada de
     entrada; con 0 %, la de salida. */
  const cadena = (papel) => {
    let acc = HORAS[0][papel];
    for (let i = 0; i < TRAMOS.length; i++) {
      acc = 'color-mix(in oklab, ' + acc + ' ' + peso(TRAMOS[i][0], TRAMOS[i][1])
          + ', ' + HORAS[i + 1][papel] + ')';
    }
    return acc;
  };
  /* Sin oklab con calc, una hora fija y contenida: la app no se queda a oscuras
     ni pinta un color imposible. Atardecer, que es el más cercano a la paleta. */
  const LUZ = puedeK ? cadena('body') : HORAS[2].body;
  const NUCLEO = puedeK ? cadena('core') : HORAS[2].core;
  /* EL BORDE FRÍO. El aire dispersa el azul, así que el último tramo de la luz
     se enfría antes de morir: es lo que separa un degradado de un fenómeno
     atmosférico. NO son cuatro tokens más — el cuerpo se mezcla hacia un único
     tono frío, así que el borde sigue la hora por construcción y al anochecer,
     con la luz ya azul, la mezcla no hace nada. Que es justo lo correcto. */
  const BORDE = puedeMezclar
    ? 'color-mix(in oklab, ' + LUZ + ' 58%, var(--sun-rim))'
    : LUZ;

  /* Las paradas consumen --pace-luz y --pace-nucleo, REGISTRADOS con @property
     como <color>. Sin registrar, un custom property se sustituye como TEXTO y
     la cadena anidada de color-mix se vuelve a resolver en CADA parada de CADA
     degradado. Registrado, se computa una vez por elemento: solo eso bajó la
     suite de s157 de 1,3 min a 42 s. @property va en su propia hoja — dentro
     del bloque de reglas no se aplica. */
  if (puedeK && typeof CSS !== 'undefined' && CSS.registerProperty) {
    try {
      CSS.registerProperty({ name: '--pace-luz', syntax: '<color>', inherits: true, initialValue: 'transparent' });
      CSS.registerProperty({ name: '--pace-nucleo', syntax: '<color>', inherits: true, initialValue: 'transparent' });
      CSS.registerProperty({ name: '--pace-borde', syntax: '<color>', inherits: true, initialValue: 'transparent' });
      /* --pace-on se registra como <number> para poder TRANSICIONARLO: un custom
         property sin registrar salta de golpe, y con el salto el horizonte del
         aro se abriría en un frame. Registrado, la apertura viaja con la luz en
         los mismos 1,6 s. Se registra ESTE y no --pace-i, que cambia 30 veces
         por sesión: ver la nota de coste en FocusTimer. */
      CSS.registerProperty({ name: '--pace-on', syntax: '<number>', inherits: true, initialValue: 0 });
      /* --pace-pausado: el INTERRUPTOR de la pausa (0/1) con su PROPIA
         transicion de 500 ms. Lo que se interpola es esto; la PROFUNDIDAD sale
         del token --sun-pausa, que es distinto por paleta. Se registra para
         poder transicionarlo, y su initialValue 0 significa «no hay pausa».
         --pace-pausa es el factor ya resuelto que consumen las tres capas; se
         registra tambien para que compute a NUMERO —sin registrar, su valor
         computado seria el texto del calc y cualquier lectura tendria que
         reimplementar la formula. */
      CSS.registerProperty({ name: '--pace-pausado', syntax: '<number>', inherits: true, initialValue: 0 });
      CSS.registerProperty({ name: '--pace-pausa', syntax: '<number>', inherits: true, initialValue: 1 });
    } catch (e) { /* ya registrados */ }
  }

  window.paceAtmosferaLuz = { puedeMezclar, puedeK, grano, LUZ, NUCLEO, BORDE };
})();
