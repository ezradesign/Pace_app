# Mueve y Estira: primera comprobación de la respuesta de ChatGPT (23 oct. 2026)

La respuesta, tal cual: `mueve-estira-chatgpt-respuesta-23oct.md`. El inventario de partida:
`mueve-estira-inventario-23oct.html` (https://claude.ai/artifact/AvZHxJKrvrHQUcJKB2NEqp). Esto es una primera
pasada de la coordinadora; lo siguiente es la página para que Ez elija, con maqueta de cada decisión.

## Tras la segunda respuesta (manda sobre lo de abajo)

Ez le señaló a ChatGPT que retiraba ejercicios ya hechos, y ChatGPT corrigió: **quitar una rutina repetida no
obliga a retirar sus ejercicios**. Su propuesta corregida, al final de `mueve-estira-chatgpt-respuesta-23oct.md`:

- **Tres capas**: *pausas recomendadas* (rutinas sencillas y breves, las que propone «A tu ritmo»), *catálogo libre*
  (todos los ejercicios revisados, también los exigentes, que la persona filtra y elige) y *rutinas de progresión*
  (para quien busca más esfuerzo, elegidas a propósito, nunca por sorpresa entre bloques).
- **Nada se borra por exigente**: búlgara, pica, hueco abdominal, puente a una pierna, fondos en silla, suspensiones
  (en «Con barra»), paloma, cuádriceps en pared, rezo invertido, palmas al suelo, gateo y levantarse del suelo se
  quedan si superan la revisión, con preparación y dosis de entrada. «Hueco en silla», «Puente torácico» y
  «Sentadilla de cuádriceps» se revisan antes de clasificarlos: el nombre no dice qué movimiento son (y son tres de
  los dibujos que Ez marcó). «Ancestral» sí sale como rutina; sus ejercicios, no.
- **Cada ejercicio dice**: qué exige (fuerza, movilidad, equilibrio, apoyo en manos), dónde (sentado, de pie,
  suelo), qué necesita (silla, mesa, pared, banda, barra), por dónde empezar, cómo graduarlo y cómo salir.
- **Dificultad y acceso, dos etiquetas aparte**: de pago no quiere decir avanzado.
- **Los 22 nuevos, antes de dibujarlos, se revisan**: primero ver qué huecos cubre lo que ya hay.

Con esto, las decisiones de Ez pasan a ser: (1) las tres capas (recomendable: encaja con «A tu ritmo», que ya
propone una pausa); (2) conservar todo ejercicio que pase la revisión; (3) dificultad y acceso por separado;
(4) las pausas recomendadas con dos ejercicios y dosis de entrada baja; (5) cómo se reparte gratis y de pago;
(6) los abdominales; (7) cuántos ejercicios nuevos de verdad, tras cruzar los huecos con lo que hay. El catálogo
libre con filtros es pantalla nueva: maqueta antes.

## Lo que cuadra con los datos y con lo que pidió Ez (primera respuesta)

- **La frontera**: Mueve = fuerza contra tu peso, una resistencia o tu mano; Estira = recorrer una articulación y
  estirar sin forzar. Es lo que pidió Ez («Estira casi yoga o pilates; Mueve calistenia en un cuarto»).
- **Los traslados y las bajas** coinciden con los solapes que mide el inventario (22 parejas al 50 % o más):
  «Postura reset», «Grip + antebrazos» y la mitad de «Espalda de oficina» pasan a Estira; los puentes, a Mueve;
  «Hombros» y «Hombros · círculos» se funden; «ATG», «Ancestral», «Antídoto silla» y «Despertar matinal» salen del
  catálogo; las tres de caderas quedan en tres distintas.
- **Banda y barra**: solo en dos rutinas de pago «con material» (M11, M12), cada ejercicio con su alternativa sin
  banda, dicha como «alternativa», no como «el mismo ejercicio». La barra desaparece. Es lo que pidió Ez.
- **Los dibujos que Ez marcó** casi todos salen del catálogo: «Hueco en silla» (Core silencioso), «Sentadilla de
  cuádriceps», «Rodar hacia abajo», «Puente torácico», «Sentarse y levantarse del suelo» y «Paloma». Se quedan
  «Gato-camello» y «90/90», que siguen pidiendo dibujo mejor.
- **Seguridad**: dosis de entrada bajas (2 × 5-8 en vez de 3 × 12), esfuerzos cortos (plancha 2 × 10 s, pared
  2 × 20 s), sin profundidad como objetivo, sin tirar de la cabeza, silla sin ruedas y mesa fija. Encaja con
  `base_mueve_estira` (NHS/ACSM/OMS) y con «ningún consejo de salud sin aviso». Las «Fuente» de su texto llegaron
  sin enlace: no se citan en la app sin comprobarlas.

## Lo que decide Ez (para la página, cada una con su recomendación)

1. **26 rutinas (12 + 14) en vez de 33.** Menos títulos, cada uno con motivo. Recomendable.
2. **Dos ejercicios por rutina, siempre.** Es un cambio fuerte: hoy tienen de 1 a 5. Más claro en pausas de 2-4
   min, pero menos variado. Alternativa: 2 en las gratis y 3 en algunas de pago.
3. **Gratis 13 y de pago 13** (hoy, unas 20 gratis). Toca lo que se vende como PACE completo
   (`cobrar_web_15oct`, `vender_resenas_15oct`): mirar que lo de pago siga valiendo la compra.
4. **Abdominales**: Ez pidió «abdominales, sentadillas, flexiones». ChatGPT no pone encogimientos clásicos; el
   tronco va con plancha, plancha lateral, «Desliza el talón» y «Brazo y pierna». Preguntar si basta.
5. **22 ejercicios nuevos = 22 dibujos o más** (N1, N3, N5, N12, N14 y N20 piden dos posturas). Es el grueso del
   trabajo de Ez. ChatGPT recomienda sacar primero lo gratis y probarlo con gente que no entrena.

## Lo que cuesta por dentro (antes de prometer fechas)

- **No se borran ids** (CLAUDE.md, «los ids van cruzados»; un `catch` de fábrica es un borrado diferido): las
  rutinas que salen se ocultan, no se borran, para que el historial, «Continúa», los logros y los eventos con su
  `routineId` sigan leyéndose. Las nuevas, con ids nuevos.
- **Todo pasa por el motor**: los días de cuerpo entero (v0.174.0, `ritmo.motor.js`, el equilibrio por zonas), el
  reparto de «Ver ejercicio» (31 ejercicios, `state-ritmo.hacerla.jsx`), la pausa que propone y los logros de Mueve
  y Estira leen el catálogo. Cada uno se vuelve a probar.
- **Inglés**: el inglés es el idioma principal en Play; cada rutina y cada ficha nueva necesita su texto en inglés.
- **Un paso, una instrucción**: «Estiramiento de muñeca, palma arriba y palma abajo» son dos pasos en el runner.
- **Dibujos reutilizados**: comprobar que cada dibujo enseña la versión de la ficha nueva (ChatGPT lo avisa:
  «rotación torácica», «apertura de pecho», «isquio a una pierna»…), con el dibujo delante y no por el nombre.

## Orden propuesto

1. Página para Ez con las cinco decisiones (maqueta de una rutina nueva en la app: hoja y pantalla de ejercicio).
2. Con su sí, Estira y Mueve gratis primero (v0.176), con los dibujos que haya y los genéricos del módulo mientras.
3. Lo de pago y «con material» después, a medida que lleguen los dibujos.
