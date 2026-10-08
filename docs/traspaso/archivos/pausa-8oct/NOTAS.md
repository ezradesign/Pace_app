# La pausa más elegante (8 oct. 2026)

Encargo de Ez: «¿el breakmenú puede ser más elegante y con una mejor tipografía? Desentona con el
resto de la app». La página para elegir es `pausa-8oct.html` (abre las fotos de `fotos/`). Nada de
`app/` ha cambiado: las opciones se pintan encima de la ventana real.

## Qué hay en esta carpeta

- `pausa-8oct.html`: lo que desentona hoy, las tres opciones (A «Como su tarjeta», B «Sin cajas»,
  C «En su color») con un comparador de fotos, la regla del alto medida, el texto nuevo y cinco
  preguntas. Recomendación: la B.
- `fotos.js`: el guion de las fotos. `node docs/traspaso/archivos/pausa-8oct/fotos.js [antes|despues|todo]`
  con `index.html` construido; levanta su servidor en el 8785 y se para si lo sirve otra carpeta.
  `FOTOS_CASOS=corta,libre` y `FOTOS_PALETAS=crema` repiten una parte.
- `opciones.js`: cómo se pinta cada opción encima de la ventana real, con los tokens, las letras y
  los dibujos de la app, y el texto nuevo en los dos idiomas.
- `medidas.json`: el alto de la ventana en cada una de las 144 fotos y si se desplaza por dentro.
- `fotos/`: WebP; en escritorio, también el recorte de la ventana (`*-recorte.webp`).

## Lo comprobado

- Hoy: botones en sans y con esquinas (las llamadas de la app son píldoras en serif itálica);
  todo en el terracota de Respira (`--breathe`) aunque la rutina sea de Estira (`--extra`) o Mueve
  (`--move`); Hidrátate es otra tarjeta rellena que compite con el plato; «lo que el menú tenía para
  ahora»; «A tu ritmo ·» repetido en cada motivo (`break.prop.ritmo.*`).
- La comida: `ritmoPropuesta` da `modulo: 'water'` y `rutina: null`, así que la tarjeta sale sin
  nombre, sin minutos y sin dibujo, y «Hacer la pausa» abre Hidrátate (igual que la tarjeta azul).
- El aviso «Nuevo sello» (`ui/Toast.jsx`, z-index 200) tapa el pie de la ventana en el móvil con
  el primer Pomodoro.
- A 360×640, las tres opciones miden lo mismo o menos que hoy en los cuatro casos, en crema, en
  oscuro y en inglés; ninguna foto se desplaza por dentro.
- Visto de paso, y no es un fallo: en inglés el mismo día tiene 8 bloques y en castellano 9, porque
  la hora de comer por defecto depende de la región (`RITMO_COMIDA_REGION`, 12:30 frente a 14:00).

## Decidido ya

- Atajos (Ez, 8 oct.): solo Intro (hacer la pausa propuesta) y Esc (saltarla). La línea
  «Atajo: …» desaparece del pie; B, E, M y H siguen funcionando sin enseñarse en ningún sitio.

## Al implementar, cuando Ez elija

- `app/breakmenu/BreakMenu.ritmo.jsx` y la propuesta de `BreakMenu.jsx`; `Button` no reenvía
  `data-*` y las pruebas buscan los botones por su nombre (`tests/ritmo-pausa.spec.js`,
  `tests/pausa-propone.spec.js`). Las píldoras ya existen como estilo en `RoutinePreview.jsx`
  (llena, color del módulo) y `.pace-rt-tm-pildora` (papel tonal); la línea de contexto, en
  `.pace-lib-ctx` de `app/ui/library.css.jsx`.
- Textos en `app/i18n/strings/breakmenu.js` y los motivos en `app/i18n/strings/ritmo.js`.
- La prueba de la altura a 360×640 tiene que seguir en verde; con la B, además, sobra sitio.
