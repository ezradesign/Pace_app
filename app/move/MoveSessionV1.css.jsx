/* PACE · Runner v1 — LA HOJA DE ESTILO (s172b)
   =============================================
   Cortada de `MoveSessionV1.support.jsx` al rebasar aquel las 500 lineas
   (regla §1 de CLAUDE.md: trocear, no recortar comentarios). Aqui vive TODO el
   CSS del runner guiado: el pulso de las reps, el anclaje del bloque y los
   tiers de compactacion por ALTURA de viewport.
   No exporta nada y no lo consume nadie por nombre: se inyecta al cargar, con
   el mismo guard de id que tenia. Puede cargar en cualquier punto DESPUES de
   que exista `document.head`.

   OJO AL EDITARLO — la trampa que ha vuelto en s139, s156, s157, s158, s162,
   s171 y s172: **ni un solo backtick dentro del template literal**. El build
   ABORTA, y si la salida esta silenciada las medidas siguientes corren contra
   un artefacto viejo sin avisar. Si una medida no cambia cuando deberia, lo
   primero que hay que mirar es si el build paso. */

const _paceMoveV1Css = document.getElementById('pace-move-v1-css');
if (!_paceMoveV1Css) {
  const s = document.createElement('style');
  s.id = 'pace-move-v1-css';
  s.textContent = `
    @keyframes pace-rep-pulse {
      0%   { transform: scale(1); }
      50%  { transform: scale(0.86); }
      100% { transform: scale(1); }
    }
    /* s125 · BARRA DE SCROLL OCULTA — LA REGLA SE MUDÓ, NO SE BORRÓ (s139).
       El diagnóstico de s125 sigue siendo válido y vale la pena conservarlo: en
       el régimen ANCHO (≥641px) el centro NO desborda (las reservas cue/care de
       s119 absorben las 2 líneas); en MÓVIL (≤640px, sin reservas) un paso de
       NOMBRE largo —«World's greatest stretch», <h1> clamp a 2 líneas a 360px—
       rebasa el centro por pocos px a alturas ≤~624px (medido: 360×620 = 3 px).
       El scroll es LEGÍTIMO; la barra clásica de 17 px para 3 px de recorrido
       es lo que sobra.
       En s139 el usuario elevó esto a REGLA DE PRODUCTO —ninguna actividad en
       curso enseña barra— así que las dos declaraciones que vivían aquí,
       confinadas con :has([data-pace-v1-progress]), pasaron a
       app/ui/SessionShell.responsive.js aplicadas a todo
       [data-pace-session-center]. Aquí quedarían como subconjunto exacto y
       redundante, y una regla duplicada acaba divergiendo. NO reintroducirlas:
       si alguna vez hay que devolver la barra a alguna superficie, la excepción
       se declara allí, en un solo sitio.
       OJO: este comentario vive DENTRO de un template literal — nada de
       backticks aquí, cierran la cadena y rompen el runner (pasó en s139). */
    /* s119 · ALTURAS RESERVADAS (anclaje del glifo, sin saltos tipográficos).
       El bloque de contenido mantiene alto CONSTANTE entre pasos de TRABAJO: el
       cue reserva 2 líneas (la acción más larga medida) y «Cuídate» reserva 2
       líneas SIEMPRE, aunque el paso no la tenga. Así un paso con cue/care corto
       (o sin care) no sube el glifo respecto a sus vecinos — el footer ya estaba
       pinneado; lo que se movía era el glifo por el centrado del bloque de alto
       variable. em → escala con el tamaño de cada tier (2 líneas exactas). El
       min-height es SUELO: la colocación (setup de 3 líneas) sigue creciendo.
       SOLO ≥641 px: en móvil (≤640) el slack de centrado es pequeño (~12 px de
       salto potencial, ya presente pre-s119) y el coste de las reservas —con el
       nombre a 2 líneas y fuentes grandes— desbordaba el retrato; ahí se
       renuncia a la reserva y se conserva el ajuste móvil previo (que cabía). */
    /* s171 · LAS RESERVAS PASAN A SER DE LAS DOS PIELES. El usuario midió en su
       teléfono lo que s119 había aceptado como coste: el círculo se mueve entre
       pasos. Medido aquí antes de tocar nada: top 98 → 108 → 151 px en móvil,
       43 px de deriva con el círculo del MISMO tamaño. La renuncia de s119 era
       a las reservas «con el nombre a 2 líneas y fuentes grandes», y desde
       entonces el nombre móvil ya es un clamp; el desborde se vuelve a medir en
       360×640, 375×812 y 390×844 abajo, que es donde aquella decisión dolía. */
    [data-pace-v1-cue]  { min-height: 3.1em; }   /* 2 líneas × 1.55 */
    [data-pace-v1-care] { min-height: 3em; }     /* 2 líneas × 1.5 */

    /* s171b · EL BLOQUE ENTERO DECLARA ALTO MINIMO, y es lo unico que hace falta.
       El circulo y el nombre se movian hasta 65 y 94 px entre pantallas de la
       misma rutina, por TRES causas distintas: un cue de 3 lineas, un nombre de
       2, y el gate de tipo «ready» —el que espera al usuario porque el paso pide
       suelo, cojin o pared— que NO PINTA CONTADOR y dejaba el bloque 130 px mas
       corto que el de trabajo. NO era la linea «Empiezas por», que fue la
       primera sospecha: es la AUSENCIA del contador.
       PRIMERO INTENTE RESERVAR CADA TEXTO y fue un error que la medida corrigio
       dos veces. Uno: las reservas son ADITIVAS y el peor caso real no tenia a
       la vez nombre de 2 lineas y cue de 3, asi que el bloque crecio de 460 a
       529 y desbordo donde antes cabia. Dos: al comprobarlo compare el bloque
       contra el alto del CENTRO, y dentro del centro tambien vive la barra de
       progreso — 61 px que no estaba contando. El desborde real era de 51 px.
       CON EL BLOQUE ANCLADO NO HACE FALTA RESERVAR NINGUN TEXTO: por encima del
       nombre solo hay glifo y rotulo, los dos de alto fijo, asi que el circulo y
       el nombre quedan clavados aunque el cue crezca. Lo que varie lo hace por
       DEBAJO, y la holgura cae detras de «Cuidate», donde no se lee como hueco.
       EN VH Y NO EN PX porque no hay un px que valga: el bloque crece con la
       altura del viewport (el glifo es 0,22 x alto) y su techo tambien, y los
       intervalos validos de 780 y de 844 NO SE SOLAPAN — medido.
       LOS SUELOS SON EL TECHO MEDIDO, no una estimacion: el bloque mas alto que
       cabe es 70,1vh a 375x780 · 71,2 a 812 · 72,4 a 844 · 76,0 a 1280x900.
       LO QUE ESTO NO ARREGLA, dicho: por debajo de 780 (movil) y 880 (escritorio)
       el circulo sigue moviendose. Ahi el centro no da para anclarlo sin robarle
       altura a las instrucciones, y esa jerarquia la fijo s119. */
    /* s172b · EL BLOQUE SE ALINEA ARRIBA, y esto es lo que de verdad ancla el
       circulo. Los min-height en vh de abajo solo funcionaban POR ENCIMA de sus
       suelos: medido, con UN PIXEL menos el anclaje se apaga entero y el salto
       vuelve — 61 px a 1280x879 y 53 px a 360x730, los dos viewports reales del
       usuario. Era un ACANTILADO, no una curva.
       La causa vive un nivel mas arriba: centerBody centra con margin:auto
       (s112) un bloque cuya ALTURA VARIA con el contenido —la pantalla de
       colocarse no pinta contador—, asi que el centrado reparte una holgura
       distinta en cada pantalla y el circulo baja la mitad de esa diferencia.
       Ningun alto minimo del bloque arregla eso por debajo del suelo: ahi el
       bloque ya no llega a ese alto.
       Se anula el margen SUPERIOR y se conserva el inferior, asi que la holgura
       cae DEBAJO —donde s171 la queria— y el circulo queda clavado a cualquier
       altura. El :has() acota el cambio al runner v1: Respira, Foco y Caminos
       siguen centrando igual. Y NO se toca la regla de s112 en SessionShell:
       margin:auto alinea arriba cuando el contenido DESBORDA, que es lo que
       evita que un justify-content:center recorte el principio. */
    /* El !important no es pereza: centerBody trae margin:auto como estilo
       EN LINEA desde s112, y ninguna hoja gana a un inline sin el. Sin esto la
       regla se aplica, no falla, y no cambia NADA — que es como se ve igual que
       antes y uno cree que el arreglo no sirve. */
    [data-pace-session-center-body]:has([data-pace-v1-body]) { margin-top: 0 !important; }

    /* El rotulo de fase se pinta SIEMPRE —vacio cuando no hay— para que el
       NOMBRE no suba y baje 29 px en cada cambio de fase. Pero VACIO NO CUESTA
       NADA fuera de los suelos: a 360x640 esos 11 px eran justo los que
       faltaban, y alli se prefiere que el nombre salte a que aparezca barra. */
    /* s172b · EL ROTULO CIERRA SU PROPIA CAJA. s171 reservo 1.2em para el rotulo
       VACIO, pero el lleno se pintaba con el interlineado normal de la fuente
       (12 px x ~1.45 = 17,4), asi que la reserva quedaba 3 px CORTA y el nombre
       seguia saltando esos 3 px entre colocarse y trabajar — con el circulo ya
       clavado, eran lo unico que se movia. Fijar el interlineado hace que las
       dos formas midan lo mismo por construccion, en vez de que una reserva
       adivine lo que la otra mide. */
    [data-pace-v1-kicker] { line-height: 1.2; }
    [data-pace-v1-kicker]:empty { display: none; }
    @media (max-width: 640px) and (min-height: 780px) {
      [data-pace-v1-body] { min-height: 70vh; }
      [data-pace-v1-kicker]:empty { display: block; min-height: 1.2em; }
    }
    @media (min-width: 641px) and (min-height: 880px) {
      [data-pace-v1-body] { min-height: 72vh; }
      [data-pace-v1-kicker]:empty { display: block; min-height: 1.2em; }
    }

    /* s171 · EL AIRE ALREDEDOR DEL CONTADOR, en la piel ancha y SOLO donde no
       hay compactación (min-height 769: por debajo mandan los tiers de abajo,
       que ya aprietan estos mismos márgenes). El usuario pidió el círculo un
       30 % mayor «quitando el aire de la segunda frase de la descripción y el
       contador de segundos»: el aumento cabe sin desbordar (medido: 0 px a
       1440×900), así que esto no lo financia — recorta lo que él señaló.
       La línea vacía bajo el cue NO se toca y es deliberado: ES el anclaje del
       círculo. Quitarla devuelve la deriva que la mitad de este cambio arregla;
       moverla al final del bloque (después de «Cuídate», donde no se leería
       como hueco) exige que el bloque entero declare alto mínimo, y eso es un
       cambio de mecanismo con cinco tiers medidos detrás. Queda propuesto. */
    @media (min-width: 641px) and (min-height: 769px) {
      [data-pace-v1-cue] { margin-bottom: 10px !important; }
      [data-pace-v1-timer] + div { margin-top: 8px !important; }
      [data-pace-v1-care] { margin-top: 10px !important; }
    }

    /* s119 · banda de portátil 701–768 px: con el glifo ya continuo (v1GlyphSize
       sin salto en 720) pero SIN compactar, el bloque con reservas rebasa el
       centro por pocos px → barra fantasma (1366×768). Se recupera altura
       apretando el número y los espacios; NUNCA instrucciones. min-height:701
       para no pisar el tier ≤700 (más agresivo, gobierna por debajo). */
    @media (min-width: 641px) and (min-height: 701px) and (max-height: 768px) {
      [data-pace-v1-timer] { font-size: 104px !important; }   /* v1 only, no legacy */
      [data-pace-v1-glyph] > div { margin-bottom: 10px !important; }
      [data-pace-v1-name] { margin-bottom: 10px !important; }
      [data-pace-v1-cue] { margin-bottom: 10px !important; }
      [data-pace-v1-care] { margin-top: 10px !important; }
      [data-pace-v1-progress] { margin-top: 16px !important; }
    }
    @media (min-width: 641px) and (max-height: 700px) {
      /* s114: la capa «Cuídate» suma una línea — se recupera altura apretando
         espacios (nunca instrucciones) para mantener el delta 0 de s113.
         s119: con las reservas (cue+care a 2 líneas) el bloque de trabajo
         rebasaba ~21 px a 1280×600 — se recupera apretando MÁRGENES y el NÚMERO
         (nunca instrucciones ni las reservas). */
      [data-pace-v1-timer] { font-size: 82px !important; }   /* v1 only, no legacy */
      [data-pace-v1-glyph] > div { margin-bottom: 4px !important; }
      [data-pace-v1-name] { margin-bottom: 4px !important; }
      [data-pace-v1-cue] { margin-bottom: 4px !important; }
      [data-pace-v1-care] { margin-top: 4px !important; }
      [data-pace-v1-progress] { margin-top: 10px !important; }
    }
    @media (min-width: 641px) and (max-height: 560px) {
      /* s119: con las reservas (cue+care a 2 líneas) el bloque de trabajo
         rebasaba ~35 px a 1024×512 — se recupera apretando MÁRGENES, NÚMERO y
         bajando un punto las fuentes ya reducidas (nunca instrucciones ni las
         propias reservas). Es un viewport muy corto: la compactación es fuerte
         a propósito. */
      [data-pace-v1-timer] { font-size: 58px !important; }   /* v1 only, no legacy */
      [data-pace-v1-glyph] > div { margin-bottom: 4px !important; }
      [data-pace-v1-kicker] { margin-bottom: 6px !important; }
      [data-pace-v1-name] { font-size: 24px !important; margin-bottom: 4px !important; }
      [data-pace-v1-cue] { font-size: 13px !important; margin-bottom: 4px !important; }
      [data-pace-v1-support-strong] { font-size: 18px !important; margin-top: 8px !important; }
      [data-pace-v1-support] { font-size: 12px !important; }
      /* s114: en poca altura se oculta el RÓTULO «Cuídate», nunca el contenido
         (decisión A) — la adaptación sigue visible como línea secundaria. */
      [data-pace-v1-care] { font-size: 11px !important; margin-top: 4px !important; }
      [data-pace-v1-care-label] { display: none !important; }
      [data-pace-v1-progress] { margin-top: 8px !important; }
    }
    @media (min-width: 641px) and (max-height: 430px) {
      [data-pace-v1-glyph] { display: none !important; }
      [data-pace-v1-name] { font-size: 22px !important; margin-bottom: 6px !important; }
      [data-pace-v1-cue] { font-size: 13px !important; margin-bottom: 8px !important; }
      [data-pace-v1-care] { font-size: 11.5px !important; margin-top: 8px !important; }
    }
    /* Retrato estrecho con poca altura (360×640: el paso de reps desbordaba
       18 px): SOLO espacios — la tipografía ya la gobierna el bloque móvil
       por anchura de SessionShell/MoveModule (s27). */
    @media (max-width: 640px) and (max-height: 700px) {
      [data-pace-v1-glyph] > div { margin-bottom: 12px !important; }
      /* s171b · de 8 a 3: el rotulo pasa a pintarse SIEMPRE (reserva del nombre)
         y eso cuesta ~11 px en todo viewport. Aqui no sobraban: 360x640 quedaba
         desbordando 3 px. Se recupera del margen del propio rotulo, que es lo
         que lo causo, y no de las instrucciones — la jerarquia de s119. */
      [data-pace-v1-kicker] { margin-bottom: 3px !important; }
      [data-pace-v1-name] { margin-bottom: 8px !important; }
      [data-pace-v1-cue] { margin-bottom: 10px !important; }
      [data-pace-v1-support-strong] { margin-top: 10px !important; }
      [data-pace-v1-care] { margin-top: 8px !important; }
      [data-pace-v1-progress] { margin-top: 12px !important; }
    }
  `;
  document.head.appendChild(s);
}
