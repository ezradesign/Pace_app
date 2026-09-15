# s188 · Ajustes en cuatro temas

**Fecha:** 2026-09-15 · **Versión publicada:** v0.119.0 · **Suite:** 215 → **224**

> Empezó como una sesión de «¿por dónde seguimos?» con tres candidatas del
> usuario (CTB, el sistema de pago, la visibilidad de los ajustes) y acabó
> siendo el rediseño del panel de Ajustes, elegido **mirándolo** en cinco
> rondas de maqueta con los tokens, las fuentes y el copy reales. Antes, se
> cerró la deuda documental que s187 había dejado a medias.

---

## 0 · El cierre que s187 no hizo

El commit de v0.118.0 tocó `STATE.md` en cuatro líneas: la cabecera y dos
filas de la tabla. La sección **«Última sesión» seguía siendo la de s186**, el
ROADMAP decía de la FASE 3.5 que *«hoy el BreakMenu solo ordena»* cuando ya
proponía, y `DECISIONES_TECNICAS_VIGENTES.md` no tenía fila de s187 aunque la
sesión había fijado dos reglas (la quinta rama es `null`; un filtro de acceso o
seguridad vive en un solo sitio). Se cerró primero, antes de tocar código.

**Lo reutilizable**: al arrancar, comprobar que «Última sesión» coincide con el
último diario, no solo que la versión de la cabecera es la última. Aquí la
versión estaba bien y la sección no.

## 1 · Las tres candidatas, medidas contra el repo

| | Veredicto | El dato que lo decide |
|---|---|---|
| **CTB** | No ahora, y no por mí | Fuera de v1 por decisión del usuario **dos veces** (s132, s180); la música —la tercera pata— no existe: las piezas de `Audio - Respira` son las de s177, medidas inaudibles |
| **Sistema de pago** | Sí, acotado al mecanismo | `premiumUnlocked` es un booleano que **nadie puede poner a `true`**: 6/14 de Mueve, 6/17 de Estira, 7 de Respira y el constructor están cerrados y **ni la suite los prueba** (215 tests, cero con premium). La UI de licencia era un `<input disabled>` |
| **Ajustes** | Elegida por el usuario, con capturas | Ver §2 |

El sistema de pago queda como recomendación escrita: la ingeniería de la FASE
10 (clave firmada, verificación offline, `hasPremiumEntitlement` derivando de
la licencia, tests del camino premium) no depende de material ni de contenido y
está en el camino crítico de v1. La tienda, no.

## 2 · La auditoría del panel: lo que se medía, no lo que se veía

A 1280×800 el panel mide 320×752 y su contenido **1412 px**: 1,9 pantallas de
scroll; en móvil (hoja de 608) 2,2. Por bloques, los dos más altos eran
**Audio (233 px)** y **Contenido premium (221 px)** —y el segundo era un input
deshabilitado que no hacía nada. 30 pastillas, 7 líneas de explicación, 10
secciones sin agrupar, «(default)» en tres etiquetas, «Musica» sin tilde y
«Layout» en inglés en la interfaz española.

Lo que el usuario había dicho con sus capturas: *no están ordenados, tienen
información de más, no son intuitivos ni bonitos, el apartado de audio está
raro*. La medida lo confirmaba y le ponía número.

## 3 · Cinco rondas, cada una pintada antes de preguntar

Regla de s174: toda opción que yo proponga se PINTA. Cada ronda fue un HTML en
`docs/proposals/` con `tokens.css` y `motion.css` reales, servido desde el
proyecto para que resolvieran las fuentes, y con la altura y el contraste
**calculados por la propia página**, no escritos.

| Ronda | Qué se decidió | Lo que salió midiendo |
|---|---|---|
| 1 · [ajustes-rediseno.html](../proposals/ajustes-rediseno.html) | **V2 · Filas** frente a cuatro bloques y acordeón | 1412 → 770 px; el acordeón (703) era el más corto pero «lo que no ves no invita a probarlo» |
| 2 · [-r2](../proposals/ajustes-rediseno-r2.html) | **A · lavado de módulo**: el color dice de qué módulo es el ajuste | Terracota, tabaco y azul con texto claro dan **2,8–3,3:1**; el único reparto que pasa es lavado + borde + texto en tinta (el de la tarjeta de Viajes, s186): **10,9:1** |
| 3 · [-r3](../proposals/ajustes-rediseno-r3.html) | **T1 · etiquetas en cursiva**, como las tarjetas de actividad | Las secciones se quedan en versalita porque son *sistema* (regla ya escrita en `library.css.jsx:49`); dos niveles de cursiva (T3) se parecían demasiado |
| 4 · [-r4](../proposals/ajustes-rediseno-r4.html) | **P1 · píldoras**, la pieza de FOCO · PAUSA · LARGA | Las cajas «poco elegantes» eran el borde de color; P2 (marca + palabra) tenía dos defectos que solo se vieron pintada: la muestra «Oscuro» parecía elegida, y tres anillos no cabían junto a la etiqueta |
| 5 · [-r5](../proposals/ajustes-rediseno-r5.html) | **P1+**: pista sin borde, círculo por pictogramas dentro de su fila, más aire bajo los títulos, título a 24, **y el sonido apagado atenúa en vez de esconder** | 775 px, 1,03 pantallas. El estado apagado no lo había mirado nadie en cuatro rondas: escondía dos filas y el panel saltaba 84 px |

**Lo que el usuario pidió con palabras y lo que resultó ser**: «algo de
color dependiendo de lo que se seleccione» → el color no puede ser una
píldora pintada de otro color (contraste), así que es un *lavado* del color
del módulo con el texto en tinta, y solo donde hay módulo. «Me falla la
tipografía» → el panel era todo Inter salvo el título, y la voz de PACE está
en la cursiva de los nombres. «Los cuadrados quedan poco elegantes» → quitar
el borde y redondear la pista. Tres frases, tres medidas, tres decisiones.

## 4 · Lo construido

- **`app/i18n/strings/settings.js`**, dominio nuevo: `ui.js` estaba en 457 y
  el copy nuevo lo pasaba de 500. Salen 69 claves (`tweaks.*`, `settings.*`,
  `premium.tweaks.*` — ninguna con consumidor, comprobado clave a clave) y
  entran 59 bajo `settings.*`. Censo 598 → **588**. Los nombres de idioma
  («Español», «English») no se traducen.
- **`app/tweaks/TweaksPanel.parts.jsx`**, nuevo: `AjustesSeccion`, `AjustesFila`,
  `AjustesPildoras`, `AjustesInterruptor`, `AjustesPaso`, `AjustesAccion`, las
  muestras de paleta y los cuatro pictogramas del círculo calcados de
  `BreatheVisual.jsx`. El color de módulo entra por la FILA
  (`data-pace-aj-modulo` + dos custom properties), no por el control.
- **`TweaksPanel.support.jsx`**: la hoja `pace-aj-*`, con cada decisión visual
  escrita al lado. `color-mix` al 22 % con el `-soft` de respaldo.
- **`TweaksPanel.jsx`** 410 → 223 líneas; **`TweaksAudio.jsx`**: la voz entra
  en la misma fila que el tono (sigue siendo UNA decisión, s176) y el maestro
  atenúa; **`PremiumSection.jsx`** de 221 px a una fila «Licencia · pronto»;
  **`TweaksData.jsx`**: filas, y el pie con la promesa de privacidad y los
  enlaces legales. El reset se DEFINE en `TweaksPanel.jsx` y se pinta en
  `TweaksData.jsx`, porque `verify.eventos.js` comprueba `paceEventsWipeAll`
  leyendo el primero: moverlo habría dejado el checker ciego.
- **«Disposición» sale tras bandera** (`SHOW_LAYOUT_AXIS`, regla s139): duplicaba
  el botón de plegar la barra. Quien tuviera «minimal» pasa a `sidebar` con la
  barra plegada — conserva lo que veía y gana el botón para abrirla.
- El interruptor del aviso de foco **dice la verdad**: con el permiso bloqueado
  no puede estar encendido (antes se pintaba encendido con la nota de
  «bloqueadas» debajo).
- Tooltip y `aria-label` de la TopBar: «Tweaks (T)» / «Abrir tweaks» pasan a
  «Ajustes (T)» / «Abrir ajustes». Cinco specs actualizados.

## 5 · Lo que la app real enseñó que la maqueta no

- **En headless, `Notification.permission` es `'denied'` siempre**, aunque el
  contexto conceda el permiso. La app pinta la nota de dos líneas y el panel
  crece 35 px que en un navegador de verdad no existen. El test fija el permiso
  a `'default'` desde un init script: es lo que ve una instalación nueva.
- **La barra de scroll se come 17 px.** En el panel del navegador de escritorio
  (barra clásica) el ancho útil baja de 278 a 263 y «Marca la fase» ya no cabía
  junto a sus tres píldoras: partía el nombre en dos. La fila ahora ENVUELVE y
  el control baja a su propia línea, a la derecha. En headless la barra es
  superpuesta y no pasa; en la app de verdad pasa en cualquier pantalla de menos
  de ~790 px de alto.
- Medido en cuatro escritorios: 1280×800, 1536×864 y 1920×1080 **sin scroll**
  (743 en 743); 1366×768 scrollea 25 px. Móvil 390×844: **1,22 pantallas**
  (antes 2,2).

## La red

| Añadido | Qué defiende |
|---|---|
| **9 tests** en `tests/ajustes.spec.js` | Orden de temas y filas; «Disposición» fuera; cabe en una pantalla a 1280×800; móvil < 1,3; apagar el sonido no mueve el panel; el color de módulo con contraste ≥ 4,5 en las dos paletas; el círculo por pictogramas con el nombre en la línea del módulo; «Marca la fase» como una decisión; **inglés**; la migración de «minimal» |
| 5 specs actualizados | `checklist-estado`, `eventos-backup`, `eventos-barrera`, `eventos`, `paleta-auto` — el helper de la paleta pasa a `[data-pace-aj-fila="palette"]` |

**Mutantes: 8, y los 8 muerden.** Esconder las filas al apagar el sonido · las
filas de módulo sin lavado · píldora de módulo pintada del color con texto claro
· sin migración de «minimal» · el eje «Disposición» de vuelta · filas más altas
(vuelve el scroll) · el nombre del círculo que no baja · «Voz grave» sin timbre.

## Lo que NO cubre

- **Ningún píxel**: que las píldoras «sean elegantes» lo decidió el usuario
  mirando la ronda 5, y eso no lo aserta nadie.
- El **estilo del timer** y el **orgánico** siguen tras bandera y sus filas no
  se prueban (no se pintan).
- El **aviso de fin de foco** se prueba solo en su presencia; pedir el permiso
  del navegador no se ejercita.
- La hoja de **móvil sigue siendo de 72 dvh** (s27); con 1,22 pantallas se
  podría subir, y es una decisión aparte.
