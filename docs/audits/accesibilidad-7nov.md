# Auditoría de accesibilidad de PACE · 0.192.0 · 7 de noviembre de 2026

> Rama `claude/accesibilidad-7nov-e36d06`, sobre `main` en 6a75e948 (0.192.0). La empezó una sesión de la
> cuenta EcLj6 por la mañana; al llegar esa cuenta al 92 %, la coordinadora guardó lo hecho sin pasar `verify`
> ni pruebas (828d6060 y e1432c8a) y añadió cinco cambios más sin guardar. La terminó por la tarde una sesión de
> la otra cuenta. No sube versión ni toca `STATE.md` ni `CHANGELOG.md`: eso lo hace la coordinadora al juntarla.

## En una frase

Lo que oye quien usa un lector de pantalla y lo que hace quien va con teclado está arreglado y vigilado por
24 pruebas: quitar cualquiera de los arreglos pone en rojo al menos una. Lo que se vería distinto (el contraste de algunos textos) espera a
Ez en una página con opciones.

## Qué se miró y con qué

| Qué | Cómo | Dónde |
|---|---|---|
| Lo que dice el lector de pantalla | axe-core inyectado en la página (mañana) y, por la tarde, el árbol de accesibilidad de Chromium (`Accessibility.getFullAXTree`): cada botón, enlace, campo, imagen y diálogo sin nombre o con un nombre que es solo un signo | Home, bibliotecas de Respira, Mueve y Estira, «Antes de empezar», el aviso de la apnea, una sesión de Respira, Hidrátate, Estadísticas (Hoy y Semana), Logros, Ajustes, la bienvenida, `/premium/` y `/beta/` |
| El teclado | Tab y Mayús+Tab de verdad, 45-60 pulsaciones por pantalla: si el foco se ve, si cae dentro de la ventana, si queda tapado por otra capa y adónde vuelve al cerrar | Home, Respira, Estadísticas y Ajustes, a 360 y a 1280 px, en claro y oscuro |
| El contraste | Un medidor propio (`getComputedStyle` de cada texto visible, su fondo componiendo las capas semitransparentes y la opacidad heredada) contra el mínimo de WCAG 2.2 AA: 4,5 a 1, o 3 a 1 desde 24 px (18,66 px en negrita) | Las mismas pantallas, a 360 y a 1280 px, en crema y en oscuro; las páginas sueltas, en claro y oscuro del sistema |
| Menos movimiento | `prefers-reduced-motion: reduce` emulado, con `document.getAnimations()` en la retención de Rondas express | Respira |
| Texto grande y zoom | La letra va en px: crece con el zoom del navegador y no con el tamaño de letra del sistema. La home a 640×400 de CSS (1280×800 al 200 %) y a 320×568: nada se sale por los lados, y lo que no cabe se alcanza con el scroll propio de la home (`data-pace-home-body`) y con Tab | Home |

## Qué se arregló, y su prueba

Ninguno cambia un píxel. Cada uno tiene su prueba, y cada prueba cae cuando se quita su arreglo del `index.html`
compilado (los 20 mutantes, abajo).

| Lo que pasaba | Arreglo | Prueba |
|---|---|---|
| Los minutos del Foco se oían «15, botón», sin unidad y sin decir cuál estaba puesto; el campo de «Otro» no tenía nombre | Grupo «Minutos del bloque de foco», cada cifra «15 minutos» con `aria-pressed`, el campo con su nombre (`FocusTimer.parts.jsx`; claves `focus.minutes.grupo` y `.n`) | `accesibilidad-nombres` · los minutos del Foco, y en inglés |
| Foco, Pausa y Larga no decían cuál estaba elegido | `aria-pressed` (`TopBar.jsx`) | `accesibilidad-nombres` · Foco, Pausa y Larga |
| Las pestañas de Estadísticas no decían cuál estaba abierta | `aria-pressed` (`StatsPanel.jsx`) | `accesibilidad-nombres` · pestañas de Estadísticas |
| Las bibliotecas, el aviso de la apnea y «Da de pastar a la vaca» eran «diálogo» a secas | Cada `Modal` lleva el nombre de su título (`LibraryShell.jsx`, `BreatheLibrary.jsx`, `SupportModule.jsx`) | `accesibilidad-nombres` · los diálogos tienen nombre, y en inglés |
| Los filtros se oían «Sin retención8» | El nombre separa la cifra: «Sin retención (8)» (`LibraryShell.jsx`) | `accesibilidad-nombres` · la biblioteca de Respira |
| El ⚠ de las técnicas con aviso se leía «⚠»: su nombre estaba en una `<i>` sin rol | `role="img"` (`RoutineCard.jsx`); el ⚠ grande del aviso, oculto al lector | `accesibilidad-nombres` · el aviso de la apnea |
| Salir de una sesión se oía «por Salir»: la × iba dentro del texto | La × pasa a un `<span aria-hidden>` y `session.exit` queda «Salir» / «Exit»; se sigue viendo «× Salir» (`SessionShell.jsx`) | `accesibilidad-nombres` · salir de una sesión |
| El idioma de la bienvenida se oía «E S punto E N» | `aria-label` con lo que hace: «Cambiar a English» (`Onboarding.jsx`) | `accesibilidad-nombres` · el idioma de la bienvenida |
| El último logro de la barra lateral empezaba por «·» | El sello, oculto al lector (`Sidebar.parts.jsx`) | `accesibilidad-nombres` · el último logro |
| Los vasos de Hidrátate se oían «1», «2», «3», sin decir si estaban llenos (tarde) | Cada vaso dice «Vaso 3 de 8, lleno» o «vacío» (`HydrateModule.jsx`; claves `hydrate.vaso.lleno` y `.vacio`) | `accesibilidad-nombres` · los vasos de Hidrátate |
| El aro del Foco eran dos «imagen» sin nombre, fuera de todo botón (tarde) | El anillo y el punto, ocultos al lector: el tiempo ya lo dice el número (`TimerDial.jsx`) | `accesibilidad-nombres` · el aro del Foco |
| `/premium/`, `/beta/`, `/gracias/`, `/recuperar/` y `/desistir/` no tenían región principal | La caja que ya las envolvía pasa de `<div class="marco">` a `<main class="marco">`: misma clase, mismo aspecto | `accesibilidad-nombres` · la página … tiene una región principal (×5) |
| Al salir de una sesión el foco caía en `<body>`: la biblioteca se cierra en el mismo render en que se monta la sesión | `usePaceDialogo` guarda una cadena de a quién devolver el foco y, si quien lo tenía ya no existe, lo da a quien abrió el diálogo de debajo; ahora vuelve al chip (`Dialogo.jsx`) | `accesibilidad-teclado` · al salir con Escape, y con «Salir» desde Mueve |
| Con Ajustes abierto, el foco se quedaba en la rueda y el Tab caía en botones que el panel tapa (6 de 38 paradas a 360 px, 3 de 54 a 1280) | El foco entra en el panel, da la vuelta dentro y vuelve a la rueda al cerrar; para el ratón sigue sin ser modal (`TweaksPanel.jsx`) | `accesibilidad-teclado` · Ajustes a 360 y a 1280, y su control con el ratón |
| Con «reducir movimiento», el círculo de «Retén» temblaba entre 0,96 y 1,05: aplastar la duración de una animación infinita la hace dar cien mil vueltas por segundo | El kill de `motion.css` deja cada animación en una vuelta (`animation-iteration-count: 1`); lo esencial (`data-pace-essential`) sigue igual | `movimiento-reducido` |

Siete pruebas viejas buscaban un botón por el nombre que tenía antes («15», «× Salir», «ES · EN») y pasan a
buscarlo por el nuevo: `caza-foco`, `estado-saneado`, `onboarding-semana`, `retencion`, `ritmo-bloque-siguiente`,
`ritmo-pausa-entera` y `ritmo-pausa`. La regla nueva está arriba del todo en `DECISIONES_TECNICAS_VIGENTES.md`;
el panel de Ajustes, en `DESIGN_SYSTEM.md` («Focus visible»), y el censo de claves sube a 1150 (+4: dos del Foco y dos de los vasos).

### Las pruebas vecinas

Corridas sobre el `index.html` de esta rama en el puerto 8886: `caza-foco`, `estado-saneado`, `onboarding-semana`,
`retencion`, `hidratate-botones`, `checklist-estado`, `capa-de-arriba`, `logros-capas`, `teclado-foco` y
`pausa-teclado`, 61 de 61. Dos cayeron en la primera pasada, con el PC cargado por otras cuatro sesiones
(`capa-de-arriba` · Atrás de Android en Respira y `retencion` · el último tramo), y solas pasan las cinco de esas
líneas. La suite entera se paró en la prueba 294 de 1341, sin ningún rojo hasta ahí (entran las cuatro de Ajustes,
`bienvenida-ajustes` y las del aro), porque a ese ritmo eran dos horas.

**Dónde me quedo (89 % de las 5 h):** falta correr en local las 26 `ritmo-*`, que cambian solo de nombre de botón
(«15 minutos», «Salir»). La coordinadora puede correrlas al juntar o esperar al CI, que corre la suite entera.

### Los mutantes

Cada arreglo se quitó del `index.html` compilado (o de las cinco páginas sueltas), se corrió su prueba y se
devolvió el archivo. Los 20 salen en rojo:

| Mutante | Qué se quita | Caen |
|---|---|---|
| minutos | nombre y `aria-pressed` de las cifras | 2 |
| modos | `aria-pressed` de Foco, Pausa y Larga | 1 |
| logro | `aria-hidden` del «·» | 1 |
| biblioteca-nombre | el nombre del diálogo de la biblioteca | 1 |
| chip-cifra | el nombre de los filtros | 1 |
| aviso-img | `role="img"` del ⚠ | 1 |
| aviso-nombre | el nombre del aviso de la apnea | 2 |
| stats | `aria-pressed` de las pestañas | 1 |
| vaca | el nombre de «Da de pastar a la vaca» | 1 |
| salir | la × vuelve al texto | 1 |
| bienvenida | el nombre del botón del idioma | 1 |
| main | `<main>` vuelve a `<div>` en las cinco páginas | 5 |
| cadena-entera | el foco vuelve solo a quien lo tenía | 2 |
| cadena-suelta | sin la cadena del diálogo que se cerró | 2 |
| ajustes-entra | el foco no entra en Ajustes al abrir | 2 |
| ajustes-vuelta | el Tab no da la vuelta dentro | 2 |
| ajustes-devuelve | el foco no vuelve a la rueda | 2 |
| movimiento | `animation-iteration-count: 1` | 1 |
| aro | `aria-hidden` del anillo del Foco | 1 |
| vasos | el nombre de los vasos | 1 |


Lo que el recorrido con Tab de la tarde **no** encontró: en la home, Respira y Estadísticas, a 360 y 1280 px y en
claro y oscuro, todas las paradas tienen aro, caen dentro de la ventana y ninguna queda tapada. Dos parecían
sin aro y no lo eran: «Empezar foco» y Foco/Pausa/Larga llevan `transition: all` y el aro tarda 200 ms en pasar
de 3 px del color del papel a 2 px de oliva; «Preparar jornada» pinta el aro en la píldora de dentro.

## Lo que se vería distinto: espera a Ez

Medido con el medidor de la tarde (peor fondo de cada caso). La página «Contraste de PACE» las enseña con fotos
de la app real a 360 y 1280 px, en claro y oscuro, con cada opción pintada encima solo en la foto. **No se ha
montado ninguna.** Página: https://claude.ai/artifact/2Fv1mCERFo1zLQ8XJyDvoV (privada: se abre con la cuenta de Claude que la publicó, la de la tarde; desde la otra hay que compartirla en
su menú «Compartir»).

| | Qué pasa | Opciones | Recomendación |
|---|---|---|---|
| **1. Lo apagado** | Los logros sin ganar van al 55 % de opacidad entera: 2,0 a 1 en claro, 3,2 en oscuro. La fecha de la barra («sáb 7 nov») al 75 %: 2,6 en claro, 4,48 en oscuro | A como está · B se apaga el sello y el borde, y el nombre y la frase van en el gris de siempre (4,2); la fecha sin transparencia (3,9) | **B** |
| **2. La letra de color** | Títulos y marcas en el color del módulo («¿Es tu primera vez? Empieza aquí», «Para ahora», «Premium», el ⚠, «+ vaso», los títulos de familia de Logros): Respira 2,3-2,8, Mueve 2,8-3,4, Estira 3,0-3,7, Hidrátate 2,6-3,2, Logros 2,1-2,5, Premium 3,2-3,9. En oscuro fallan Mueve, Estira e Hidrátate (3,2-4,4) | A como está · B cada módulo con una versión de su color solo para la letra (OKLCH, mismo tono y croma, otra luz), 4,6 o más sobre cualquier fondo · C esa letra en `--ink-2` y el color solo en el dibujo | **B** |
| **3. Botones de color** | «Hacer la pausa» 2,8-3,7 según el módulo, «Empezar» de Mueve 3,4 y de Estira 3,7, «Un vaso más» 3,2; en oscuro, Mueve y Estira 4,0-4,4 | A como está · B el relleno en el color hondo de la 2B (5,5 o más; en oscuro 5,8) | **B** |

Los colores de la 2B: en claro, Respira `#93492D`, Mueve `#75582C`, Estira `#4F5E72`, Hidrátate `#396373`, Logros
`#7B5900` y Premium `#81520D`; en oscuro, Mueve `#B09063`, Estira `#8696AB` e Hidrátate `#719CAE` (los otros tres
ya pasan). Si Ez elige, cada uno sería un token nuevo por módulo en `app/tokens.css` (en claro y oscuro, y falta
medir el envejecido), usado solo en la letra y en el relleno de esos botones.

**Lo que no se pregunta:** el gris de los rótulos (`--ink-3`) da 4,2 a 1 sobre el crema y 3,9 sobre la barra y las
tarjetas, por debajo del 4,5. Lo eligió Ez el 16 oct. (`docs/audits/gris-16oct.html`) y se queda; en /premium y
/beta, 4,4.

## Montado: 1B · 2B · 3B (Ez, 7 nov.)

Ez eligió la B de las tres. **1B:** en el logro sin ganar se apagan el sello (55 %) y el borde de puntos, y el
nombre y la frase van enteros en el gris de los rótulos; la fecha de la barra, sin transparencia. **2B y 3B:** cada
módulo tiene un token hondo en `app/tokens.css` (`--breathe-deep`, `--move-deep`, `--extra-deep`, `--hydrate-deep`,
`--achievement-deep`, `--premium-deep`), con el mismo tono y croma en OKLCH y otra luz, para la letra de color y el
relleno de los botones con la letra del papel. En los componentes que reciben el color como prop
(`'var(--breathe)'`), `letraDe()` (`Primitives.jsx`) da el hondo del mismo módulo; en las hojas, `--tone-deep` y
`--cd`. Dibujos, puntos, filos, barras y fondos suaves siguen en el color de siempre.

**El papel envejecido no existe:** se retiró en la 0.28.9 y el estado viejo migra a crema (`state-core.jsx`).
Las paletas son crema y oscuro; «auto» elige una de las dos. No hay tercera que medir.

Medido con `scripts/audit/contraste-7nov.js` (21 pantallas, 360 y 1280 px, crema y oscuro; el peor caso de cada
pieza):

| Pieza | Crema antes → después | Oscuro antes → después |
|---|---|---|
| «¿Es tu primera vez? Empieza aquí» (Respira) | 2,80 → 5,56 | 6,99 → 6,99 |
| «Para ahora» de Mueve / Estira | 3,38 / 3,74 → 5,63 / 5,66 | 4,40 / 3,97 → 5,80 / 5,76 |
| ⚠ en la tarjeta / en el aviso | 2,32 / 2,50 → 4,62 / 4,98 | 5,03 / 5,51 → igual |
| «Premium» (tarjeta, lateral, barra) | 3,63 / 3,44 / 3,19 → 5,26 / 4,98 / 4,61 | 6,28 / 6,02 / 5,50 → igual |
| «Tus rutinas ›» | 3,94 → 5,71 | 6,82 → igual |
| «+ vaso» de la barra | 2,64 → 4,61 | 3,66 → 4,63 |
| Títulos de Logros: Maestría, Exploración, La jornada, Estacionales | 2,46-3,38 → 5,49-5,63 | 4,40-6,99 → 5,80-6,99 |
| Duración en «Antes de empezar» (Mueve / Estira) | 3,38 / 3,74 → 5,63 / 5,66 | 4,40 / 3,97 → 5,80 / 5,76 |
| Motivo de la pausa («Piernas: sin mover hoy») | 3,11-3,44 → 5,19-5,21 | 3,65-4,05 → 5,30-5,34 |
| Cifra de Hidrátate / de la cuenta atrás de Respira | 3,21 / 2,80 → 5,60 / 5,56 | 4,62 / 6,99 → 5,84 / 6,99 |
| **Botón** «Hacer la pausa» (Mueve) / «Empezar» de la pausa (Estira) | 3,38 / 3,74 → 5,63 / 5,66 | 4,40 / 3,97 → 5,80 / 5,76 |
| **Botón** «Empezar» de Mueve / Estira | 3,38 / 3,74 → 5,63 / 5,66 | 4,40 / 3,97 → 5,80 / 5,76 |
| **Botón** «Un vaso más» | 3,21 → 5,60 | 4,62 → 5,84 |
| Logro sin ganar: nombre y frase | 2,02 → 3,88 | 3,17 → 5,51 |
| La fecha de la barra | 2,60 → 3,88 | 4,48 → 6,85 |

Sobre el papel del modal de Logros y de la barra (`--paper-2`) el gris de los rótulos da 3,9, no el 4,2 que daba
la página sobre el crema: es el gris que Ez eligió el 16 oct., y se queda. Suspensos por pantalla en crema, antes →
después: Respira 44 → 29, Mueve 51 → 42, Estira 54 → 48, la pausa 7-9 → 5-7, Hidrátate 15 → 13; en oscuro, Logros
180 → 13 y todo lo de color de módulo a cero. Lo que queda en rojo es el gris de los rótulos y, fuera de estas tres
preguntas: botones desactivados (exentos en WCAG: «Empezar sesión» antes de marcar el aviso, las filas atenuadas
de Ajustes), puntos de adorno, el gris de `/premium/` y `/beta/` (4,36) y un falso aviso del medidor («AHORA» de A
tu ritmo va encima de su barra, no sobre ella).

**La prueba:** `tests/contraste-modulos.spec.js`, 9 de 9. Las dos primeras leen los tokens (mismo tono y croma,
letra de 4,5 o más sobre papel, tarjeta y fondo suave, botón de 5,45 o más en crema y 5,7 en oscuro); las otras
siete miran la app pintada y hacen un censo: ninguna letra ni botón en el color de módulo. Diez mutantes sobre el
`index.html` compilado, los diez en rojo: token claro (1 cae), token oscuro (2), la letra de la biblioteca (1), el
botón de la pausa (1), «Un vaso más» (1), «+ vaso» (1), la fecha al 75 % (1), la tarjeta del logro apagada entera
(1), `letraDe` devolviendo el color de módulo (4) y el «Empezar» de «Antes de empezar» (1).

**Dónde me quedo (WIP, 76 % de las 5 h):** el código, los tokens, el medidor, la prueba y sus mutantes están
hechos, y las 28 fotos del después están en `docs/audits/accesibilidad-7nov/fotos/` con la letra D
(`<caso>-D-<tema>-<ancho>.webp`, sacadas con `node scripts/audit/contraste-7nov.fotos.js 8887`). Falta: (1) la sección
«Montado» de `pagina-ez.html` con la A y la D lado a lado, y publicarla; (2) el resultado de las 26 `ritmo-*`, las
de accesibilidad y las vecinas de los botones cambiados (`hidratate-botones`, `logros-capas`, `pausa-sin-repetir`,
`aviso-antes-de-empezar`): estaban corriendo con `PACE_E2E_PORT=8886` al parar y no se leyeron; (3) `npm run verify`,
que aún no ha corrido sobre esto. La paleta ya está en `DESIGN_SYSTEM.md` y la regla, arriba en
`DECISIONES_TECNICAS_VIGENTES.md`.

## Lo que esta auditoría no cubre

- **Un lector de pantalla de verdad.** Se miró lo que Chromium entrega al lector (el árbol de accesibilidad), no
  lo que dicen NVDA, VoiceOver o TalkBack con su voz. Antes de v1, una pasada con TalkBack en el Android de Ez y
  con VoiceOver en el iPhone de TestFlight.
- **La letra grande del sistema.** La letra va en px: crece con el zoom del navegador, pero no con «tamaño de
  letra» de Android o iOS. Si la app de Android la sigue o no depende del WebView y no se probó en un móvil.
- **Las sesiones por dentro.** Mueve y Estira se miraron hasta «Antes de empezar»; el runner, la cuenta atrás y
  la pausa de cada ejercicio, no. Respira se miró en la preparación y, con menos movimiento, en la retención.
- **El contraste sobre la luz del sol de la home.** El medidor compone el fondo de cada caja, no lo que pinta
  detrás otra capa (la luz del aro, los degradados): lo que va encima de la luz se miró en las fotos.
- **El papel envejecido** no se midió porque no existe: se retiró en la 0.28.9.
- **Las páginas sueltas en oscuro** salen igual que en claro en lo que importa (el gris de los rótulos), y no se
  midieron una a una.
- **Lo que no se lee con los ojos ni con el teclado:** voz y control por voz, subtítulos (la app no tiene vídeo)
  y el tiempo para leer (los avisos que se van solos, `Toast`, no se midieron).
