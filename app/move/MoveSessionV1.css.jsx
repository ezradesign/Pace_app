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
    /* s176 · LA RESERVA BAJO LA DESCRIPCION SE RETIRA, y no es un capricho: la
       propia s171 dejo escrito que moverla «al final del bloque, despues de
       Cuidate, donde no se leeria como hueco» exigia que el bloque entero
       declarase alto minimo -- «un cambio de mecanismo con cinco tiers medidos
       detras». ESE CAMBIO LO HIZO s172b: el bloque se alinea arriba y el
       circulo queda clavado por construccion; su comentario lo dice con todas
       las letras, «con el bloque anclado no hace falta reservar ningun texto».
       La reserva se quedo por inercia y lo unico que hacia era empujar el
       contador contra el «Cuidate».
       LO QUE COSTABA, medido a 1536x714 (la pantalla del usuario): la barra de
       progreso se metia 15 px DENTRO de los botones en la pantalla de trabajo,
       y estaba 47,2 px mas abajo que en la de colocarse. Reportado mirando la
       app: «la barra casi se superpone con los botones... deberia estar siempre
       a la misma altura: referencia del colocate».
       COMPROBADO que el circulo NO se mueve al quitarla: top 76,4 px en las dos
       pantallas a 1536x714 y 58,6 en las dos a 360x730 y 375x812. */
    /* [data-pace-v1-cue] min-height: retirada en s176 -- ver arriba */
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
      /* s177 · 10 -> 6 en estos dos. Con el congelado de abajo puesto pero
         estos margenes intactos, la holgura a 1536x714 se quedaba en 5,8 px
         por lado; a 6 sube a 9,8. No es cosmetica: s176 midio que el CI, con
         otras metricas de fuente, se desvia hasta 9,4 px de lo que da el
         local, asi que 5,8 de margen es quedarse sin red. Los de la
         descripcion y «Cuidate» no hace falta tocarlos: el bloque de s177 los
         reescribe mas abajo y gana por ser la ultima regla del archivo. */
      [data-pace-v1-glyph] > div { margin-bottom: 6px !important; }
      [data-pace-v1-name] { margin-bottom: 6px !important; }
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
    @media (min-width: 641px) and (max-height: 640px) {
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

    /* VA AL FINAL DE LA HOJA A PROPOSITO, y esto costo una medida: cuatro de
       los tiers de arriba fijan «[data-pace-v1-progress] { margin-top: N px
       !important }» para controlar el hueco cuando la barra FLUIA. Con la misma
       especificidad gana la ultima regla del archivo, asi que puesta antes se
       la comian: medido tras implementarla arriba, la barra volvia a 592,7 px
       en trabajar y 545,5 en colocarse -- casi el defecto original. Aquellas
       reglas quedan inertes por diseno: no se borran porque son la unica
       memoria de cuanto aire llevaba cada tramo si algun dia se vuelve atras. */
    /* s176 · LA BARRA DE PROGRESO SE ANCLA AL CENTRO, no al contenido.
       Fluia detras del bloque, asi que su altura dependia de si la pantalla
       pintaba contador: 570,3 px en colocarse y 617,5 en trabajar, y ahi se
       metia 15 px dentro del pie. Anclada, cae a la MISMA altura pinte lo que
       pinte -- 586,5 px en las dos, con 16 px de aire hasta los botones.
       NO BASTA CON «margin-top: auto» EN LA BARRA, y esto costo una vuelta: el
       bloque que la contiene se CENTRA con margin:auto (s112), asi que su alto
       es el del contenido y «auto» la pegaba al fondo del BLOQUE, no del
       centro. Medido con solo eso: 18 px de hueco en trabajar y 52 en
       colocarse, o sea seguian a distinta altura. Hace falta que el bloque
       OCUPE el centro entero.
       El !important es por el mismo motivo de siempre: centerBody trae
       margin:auto EN LINEA desde s112, y la barra su propio margin en linea. */
    [data-pace-session-center-body]:has([data-pace-v1-body]) {
      display: flex !important; flex-direction: column !important;
      height: 100% !important; margin-bottom: 0 !important;
    }
    /* Y EL BLOQUE SE LLEVA EL HUECO, en vez de dejar que «auto» lo reparta.
       «margin-top: auto» CEDE cuando el contenido desborda: alli reparte cero y
       la barra vuelve a caer donde la deje el texto. En local sobraban 16 px y
       no se noto; en el runner de CI -otras metricas de fuente, otro sistema-
       el ejercicio se pasaba y la barra se separaba **9,4 px** de la de
       colocarse. Lo canto el aserto, no una mirada.
       Con «flex: 1» el bloque ocupa el hueco y la barra queda DESPUES, a su
       distancia del fondo, pinte lo que pinte la pantalla y mida lo que mida
       el texto. «min-height: 0» porque un item flexible no encoge por debajo
       de su contenido sin el, que es justo lo que hay que permitir aqui. */
    [data-pace-v1-body] { flex: 1 1 auto !important; min-height: 0 !important; }
    [data-pace-v1-progress] { flex: 0 0 auto !important; margin-top: 0 !important; margin-bottom: 16px !important; }

    /* ══ s177 · LA PANTALLA SE CONGELA: nada se mueve ni cambia de tamanio al
       pasar de «colocate» a «ejercicio» ══════════════════════════════════════

       LO QUE REPORTO EL USUARIO, mirando la app: la barra de progreso se
       superponia con las letras. Censadas las 28 rutinas paso a paso a
       1536x714, el «Cuidate» se metia **15,0 px DENTRO de la barra en 11 de 47
       pasos** y en 7 de las 16 rutinas libres. Lo causo el anclaje de s176: la
       barra dejo de moverse, pero el bloque lleva 'min-height: 0' y ENCOGE por
       debajo de su contenido, asi que el texto se sale y pinta encima.

       Y PIDIO ALGO MAS DURO QUE «QUE NO SOLAPE»: «que no se note la transicion
       de una pantalla a la otra, que ningun elemento se desplace de su eje o
       tamanio». Medido antes de tocar, entre las dos pantallas se movian
       CUATRO cosas -- el nombre y la descripcion 26,4 px (el rotulo de fase
       vacio, que a esta altura no se reservaba), el numero 51,2 y su etiqueta
       4,6 -- y ademas el numero cambiaba de 56 a 104 px.

       «SUBIR EL NUMERO» NO SE PODIA HACER MOVIENDOLO: el hueco de arriba era
       10,0 px y el de abajo -15,0. No habia holgura que repartir, faltaba
       sitio. Congelarlo cuesta 26,4 (rotulo) + 24,8 (descripcion a 3 lineas)
       encima de los 15 que ya faltaban, y esos 66 px salen del glifo
       (204 -> 181, en 'V1_GLYPH_WEB', que es fuente unica para que el circulo
       siga relevando al de la preparacion) y del numero.

       ELEGIDO POR EL USUARIO MIRANDOLO, entre tres tamanios pintados sobre la
       app real: 96, 76 y 56. Gana **76**, que no es ninguno de los dos de hoy.
       Esto ANULA la decision de s112 de que «el numero del gate no es el
       timer»: el tamanio se unifica. El COLOR no -- el gate sigue en tinta
       secundaria, y cambiar de color no desplaza nada.

       RESULTADO MEDIDO a 1536x714: solape 0,0 y las SIETE piezas -- glifo,
       nombre, descripcion, numero, etiqueta, cola y barra -- a 0,0 px, con las
       siete cajas midiendo lo mismo en las dos pantallas. Huecos 10,5 / 10,4.

       ALCANCE: 'min-height: 641px'. Por debajo NO se aplica y queda como hoy,
       y eso es una limitacion medida, no un olvido: con el glifo constante
       (que la regla de s119 obliga a que lo sea) a 1280x600 sigue solapando
       7,0 px con el numero a 58 y 12,7 con el numero a 64. Ese tramo necesita
       otro mecanismo, no otro valor.

       VA AL FINAL DE LA HOJA por lo mismo que la barra de s176: los tiers de
       arriba fijan 'margin-top' con '!important' y a igual especificidad gana
       la ultima regla del archivo. Puesto antes, el bloque de margenes le
       ganaba a «Cuidate» (6 px contra 14) y la cola se movia 8,0 px -- medido,
       no supuesto. */
    @media (min-width: 641px) and (min-height: 641px) {
      /* 1 · el rotulo de fase ocupa SIEMPRE: es la causa exacta del salto de
         26,4 px (12 px x 1,2 de interlineado + 12 de margen). La app ya lo
         hacia por encima de 880; ahora tambien aqui. */
      [data-pace-v1-kicker]:empty { display: block !important; min-height: 1.2em !important; }

      /* 2 · la descripcion reserva su peor caso (3 lineas) y CENTRA el texto
         dentro. Reservando a secas, un cue de 2 lineas dejaria el hueco abajo
         y el conjunto se leeria descolgado; centrado, el nombre de arriba y el
         numero de abajo quedan quietos y el texto respira igual. */
      [data-pace-v1-cue] {
        min-height: 74.4px !important;
        display: flex !important; flex-direction: column !important;
        justify-content: center !important; margin-bottom: 0 !important;
      }

      /* 3 · el numero: mismo tamanio y misma caja en las dos pantallas. El
         interlineado 0,95 no recorta nada -- los digitos no tienen
         descendentes -- y devuelve 13,5 px de los 66 que hacian falta. */
      [data-pace-v1-num] { line-height: 0.95 !important; }
      [data-pace-v1-numlabel] { margin-top: 10px !important; }

      /* 4 · la cola, con la misma caja pinte «Colocate sin prisa…» o
         «Cuidate…». Sin esto el grupo mide distinto y el centrado de abajo
         reparte distinto, que es un salto por la puerta de atras.
         SOLO ESOS DOS, Y NO el '-support-strong': la primera version reservaba 41
         px a los tres, y las pantallas que pintan DOS bloques de cola --las de
         cambio de lado, «El lado siguiente empieza solo»-- sumaban el doble.
         Medido censando las 28 rutinas: el solape original de 15,0 px se
         convertia en 35,5 en 3 pasos de «Antidoto silla» y «Caderas». Reservar
         de mas cuesta igual que no reservar. */
      [data-pace-v1-care], [data-pace-v1-support] {
        min-height: 41px !important; margin-top: 14px !important;
      }
      /* Y CUANDO LA COLA SON DOS BLOQUES, el segundo no reserva. Las pantallas
         de cambio de lado pintan la linea fuerte («El lado siguiente empieza
         solo») Y la de apoyo debajo, asi que reservar 41 px a la segunda suma
         una caja entera de mas: medido, dejaba 27,0 px de solape en 3 pasos de
         «Antidoto silla» y «Caderas» donde el defecto original eran 15,0.
         Con el par ya lleno, la reserva no hace falta -- lo que reserva es
         para que una cola de UN bloque mida lo mismo que la del otro paso. */
      [data-pace-v1-support-strong] + [data-pace-v1-support] {
        min-height: 0 !important; margin-top: 6px !important;
      }

      /* 5 · y el grupo se centra en el hueco que queda. CON 'auto' Y NO CON UN
         MARGEN FIJO: un fijo solo es equidistante a una altura concreta --
         medido, dejaba 251,7 px muertos debajo a 1920x1040 y 125,4 a 1536x900.
         'auto' reparte, y como el grupo ya mide IGUAL en las dos pantallas,
         reparte lo mismo en ambas: 10,5 / 10,4 a 714 y 130,8 / 130,8 a 1040. */
      [data-pace-v1-body] { display: flex !important; flex-direction: column !important; }
      [data-pace-v1-num] { margin-top: auto !important; }
      [data-pace-v1-body] > *:last-child { margin-bottom: auto !important; }
    }
    /* El tamanio del numero SI va por tramos -- eso es practica establecida en
       esta hoja (104 / 82 / 58) y no choca con la regla del glifo. 76 en la
       banda del usuario y hacia arriba; 58 entre 641 y 700, donde el tramo de
       abajo ya aprieta y con 76 no cabria. */
    @media (min-width: 641px) and (min-height: 701px) {
      [data-pace-v1-num] { font-size: 76px !important; }
    }
    @media (min-width: 641px) and (min-height: 641px) and (max-height: 700px) {
      [data-pace-v1-num] { font-size: 58px !important; }
    }

    /* s179 · MOVIL CORTO: es el MISMO mecanismo de s176 que s177 arreglo solo en escritorio.
       [data-pace-v1-body] lleva min-height:0 y ENCOGE por debajo de su contenido, asi que
       el texto de la cola pinta sobre la barra. Medido a 360x640: **26,3 px dentro**.
       s171b ya apreto el margen del rotulo de 8 a 3 por ESTE MISMO viewport cuando desbordaba
       3 px; ahora no queda margen que dar sin tocar las instrucciones, que la jerarquia de
       s119 prohibe.
       SE APLICA LA DECISION s114: en poca altura se oculta el ROTULO «Cuidate», NUNCA el
       contenido — la adaptacion sigue visible como linea secundaria. Es exactamente lo que ya
       hace el tramo de escritorio corto, y aqui se hace igual en vez de inventar otra cosa.
       VA AL FINAL DE LA HOJA por la razon de siempre: a igual especificidad gana la ultima
       regla del archivo, y cuatro tiers de arriba fijan margin-top con !important.

       s179b · EL UMBRAL ERA 660 Y ESTABA MAL PUESTO: se eligio por el viewport que se
       estaba mirando (360x640) en vez de medir por los DOS lados, que es exactamente el
       error que s177 cometio declarando 641 cuando el borde real estaba en 575. Barrido el
       hueco, HEAD solapa a **375x667 — el iPhone SE/8 — con 7,2 px** y a 360x661 con 10,8,
       los dos JUSTO POR ENCIMA de 660 y por tanto sin tramo que los cubriera; 360x680
       sobrevivia por 1,9 px, que no es holgura sino suerte.
       SUBE A 700, y no es un numero nuevo: es el breakpoint que esta misma hoja ya usa mas
       arriba para «retrato estrecho con poca altura» (s27, apretado por s171b). Un tramo
       mas de los que ya hay, no una frontera inventada. */
    @media (max-width: 640px) and (max-height: 700px) {
      [data-pace-v1-care-label] { display: none !important; }
      /* El NUMERO, igual que hace el tramo corto de escritorio (58 px). Medido a 360x640:
         era 72 px y solo con los margenes quedaban 8,3 px dentro de la barra. NO se toca el
         cue: mide 74,4 px porque son TRES LINEAS DE TEXTO REAL a este ancho, no una reserva,
         y la jerarquia de s119 prohibe recortar instrucciones. */
      [data-pace-v1-timer] { font-size: 58px !important; }
      /* s179b · Y EL NUMERO DE LA PANTALLA DE COLOCACION, QUE NO ES EL TIMER. Aqui estaba
         el solape que quedaba: esa pantalla pinta [data-pace-v1-num] (el numero pequenio
         de la puerta, s112) y NO -timer, asi que todos los tramos cortos —los de s119
         tambien— comprimian un elemento que en esa pantalla ni existe. Censado a 360x640,
         el texto que se metia en la barra era el de colocarse en 4 de los 5 casos que
         quedaban, con 34,0 px en «Munyecas y manos». */
      [data-pace-v1-num] { font-size: 50px !important; }
      /* El NOMBRE baja a 30 px, y 30 NO es un numero nuevo: es el SUELO que su propio
         clamp declara aceptable -- clamp(30px, 6.5vh, 52px) en MoveSessionV1.jsx. A 360 de
         ancho, 6,5vh de 640 son 41,6 px y el nombre envuelve a DOS lineas: 87,3 px de una
         pieza. Fijado al suelo del clamp cabe en una y devuelve 53,7. El cue no se toca:
         son tres lineas de texto real y la jerarquia de s119 prohibe recortar instrucciones. */
      [data-pace-v1-name] { font-size: 30px !important; line-height: 1.12 !important; }
      [data-pace-v1-glyph] > div { margin-bottom: 6px !important; }
      [data-pace-v1-name] { margin-bottom: 4px !important; }
      [data-pace-v1-cue] { margin-bottom: 6px !important; }
      [data-pace-v1-support-strong] { margin-top: 6px !important; }
      [data-pace-v1-care] { font-size: 11.5px !important; margin-top: 4px !important; }
      [data-pace-v1-support] { font-size: 12px !important; }
      [data-pace-v1-progress] { margin-top: 8px !important; }
    }

    /* s179b · MOVIL MUY CORTO: el tramo de arriba NO BASTA. A 360x600 pasaba de 54,6 px
       dentro de la barra a 15,5, que sigue siendo solape. Y 600 px de alto no es un movil
       raro: es lo que le queda a un 360x640 cuando el navegador se come su barra.
       Se sigue la escalera que ya usa el escritorio (700 -> 640 -> 430): cada tramo aprieta
       lo mismo un punto mas. Bajan el NUMERO y los cuerpos ya reducidos; NO se toca el cue,
       que a este ancho son tres lineas de texto real y no una reserva — la jerarquia de
       s119 prohibe recortar instrucciones, y esa es la razon de que aqui se pague con el
       numero y no con lo que hay que leer. */
    @media (max-width: 640px) and (max-height: 620px) {
      [data-pace-v1-timer] { font-size: 46px !important; }
      [data-pace-v1-num] { font-size: 38px !important; }
      /* s179b · el margen de la linea de apoyo, que es la que se metia: 14 px en linea desde
         el runner. Censado a 360x600 quedaba UNA rutina dentro de la barra (Flexiones de
         escritorio, 12,4 px) y esto es lo unico que queda por dar sin tocar el glifo -- que
         a esta altura son 132 px y lo tiene PROHIBIDO por la fuente unica de s177 -- ni las
         instrucciones, que prohibe s119. */
      [data-pace-v1-support] { margin-top: 6px !important; }
      [data-pace-v1-cue] { margin-bottom: 4px !important; }
      [data-pace-v1-glyph] > div { margin-bottom: 2px !important; }
      [data-pace-v1-glyph] > div { margin-bottom: 4px !important; }
      [data-pace-v1-kicker] { margin-bottom: 2px !important; }
      [data-pace-v1-name] { font-size: 24px !important; margin-bottom: 3px !important; }
      [data-pace-v1-support-strong] { font-size: 18px !important; margin-top: 4px !important; }
      [data-pace-v1-care] { margin-top: 3px !important; }
      [data-pace-v1-progress] { margin-top: 6px !important; }
    }
  `;
  document.head.appendChild(s);
}
