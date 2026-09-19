# s196 · HANDOFF · lo decidido con páginas, sin implementar

**Fecha:** 2026-09-19 · **Versión publicada:** v0.128.1 (`39783ad`, CI en verde) · **Suite:** 286 · **Árbol:** limpio salvo lo de esta sesión (páginas de propuestas y sus generadores, y este documento)

> El usuario se quedó sin sesión y **migra a otra cuenta**. Este documento es el handoff: todo lo decidido en
> s196 con las cuatro páginas de propuestas delante, en el orden en que se decidió, con lo que queda por decidir
> y el plan de implementación. **La siguiente sesión empieza aquí, no en la memoria del asistente** (que la otra
> cuenta no tiene). Léelo entero antes de tocar nada; el arranque de CLAUDE.md sigue valiendo.

---

## 0 · Dónde está el repo

- `main` = `origin/main` en `39783ad` **fix(ritmo): los acentos sirven lo que cabe (v0.128.1)**, tras `fa5cc56`
  **feat(ritmo): la semana, sin decirlo (v0.128.0)**. Diario de ambas: `session-195c-la-semana-sin-decirlo.md`.
- Lo que hay en la app tras s195 (cinco versiones): la pausa con memoria (v0.126.0), el agua por tiempo, recolocar
  también al terminar, hecha/saltada en la línea, la tarjeta por libre y la comida como interruptor (v0.127.0), la semana
  sin decirlo (v0.128.0) y el arreglo de «cada plato cabe en su parada» (v0.128.1).
- **Deuda declarada**: `STATE.md` acumula cinco bloques de «LO QUE QUEDA» (tres caducados: se añadió en vez de
  reescribir); `MoveSessionV1.jsx` en 500 y `ritmo.spec.js` en 465; el miércoles con tres largas «como sale».

## 1 · Las cuatro páginas de esta sesión (todas en `docs/proposals/`, generadas por `scripts/audit/`)

| Página | Qué enseña | Decidido con ella |
|---|---|---|
| `por-donde-seguir-s196.html` (`por-donde-seguir-s196.js`) | Dónde estamos, la semana como se ve (dos lunes reales), cinco rutas con ficha, fotos de la tarde y de la tableta | El usuario pidió verlo todo pintado |
| `lo-hecho-contado-s196.html` (`lo-hecho-contado-s196.js`) | La barra lateral con lo hecho (nada · frase · «4 de 7» · puntos), la hoja del día con hecha/saltada, media jornada con horas, miércoles, oscuro, tableta con las dos pieles | **B** hoja con hecha/saltada · C3 rechazado por redundante · **tableta con piel de móvil** («así se ve perfecto») |
| `decidir-s196.html` (`decidir-s196.js`) | La frase o nada; cinco pantallas verticales reales (iPad 768 · Air 820 · Pro 11" 834 · Pro 12,9" 1024 · ventana 900) hoy y **con la piel de móvil forzada**; el orden; la media jornada | **C1** una frase · **D vertical hasta 1024** |
| `ronda4-s196.html` (`ronda4-s196.js`) | La frase en cuatro tipografías; la media jornada explicada (tabla de casos) con loseta y cabecera calcadas | La frase cuenta bloques y pausas · **media jornada = horario, sin comida** |

Las fotos son de la app real (v0.128.1) con el DOM retocado con las clases de la app; nada dibujado a mano. Regla que
sigue valiendo: **el usuario decide con una página**; a cuatro preguntas seguidas contestó «dame un html para ver».

## 2 · LO DECIDIDO (letra del usuario, en orden)

### B · La hoja del día (teléfono) con hecha / saltada
- Hoy la hoja (`RitmoHoja.jsx`, «Ver la jornada entera», solo existe en la copia móvil) atenúa **todo** lo pasado al 50 %
  (`.pace-rt-li.pace-rt-pasado`), hecho o no («lo atenuado lee como no hecho», s193).
- Decidido: cada parada pasada con su estado, la misma regla de la línea: **hecha** con tinta normal (sin `pasado`), el glifo
  del eje con `border: 1.5px solid var(--c)` y `background: color-mix(in srgb, var(--c) 22%, var(--paper))`, meta «hecha · 4 min»;
  **saltada** al 40 %, borde punteado, meta «saltada». Los estados vienen de `ritmoPlan(state).estados` por ordinal
  (`ritmoOrdinal(m, it)`), como en `RitmoLinea.jsx:168-176`.
- Calco aprobado: `lo-hecho-contado-s196.html`, sección «B · La hoja del día».

### C1 · La frase en la tarjeta «Siguiente pausa» de la barra lateral
- Bajo el meta («2 min · Estira»), con un hilo encima (`border-top: 1px solid var(--line)`, 8-9 px), en **la itálica serif de las
  losetas** (`font-family: var(--font-display); font-style: italic; font-size: 13px; color: var(--ink-2)`).
- Texto decidido: **«Llevas seis bloques y cuatro pausas»** — cuenta la concentración con la palabra de la app («bloque»,
  como «Bloque 7 de 9» en el aro y «Seguir con el bloque 7» en la pausa) y las pausas hechas; **las saltadas no se nombran**
  (la línea ya las enseña en gris; nombrarlas es un reproche). El usuario pidió «cuatro ciclos de concentración o algo así»;
  se acordó «bloques» por ser la palabra que la app ya usa.
- Números: bloques = `ritmoPlan(state).hechos`; pausas = las de `estados` con valor `hecha`. **Sin decidir y mío**: en
  palabras hasta doce y en cifra después; singular («Llevas un bloque y una pausa»); **no aparece hasta que hay un bloque
  hecho**; inglés («Six blocks and four pauses so far» o similar).
- C2 («4 de 7» en la cejilla) rechazado: marcador. C3 (los puntos en miniatura) rechazado: **redundante** con la línea a
  300 px en escritorio y con la copia compacta en móvil.
- Calco de las cuatro tipografías: `ronda4-s196.html`; la elegida es la B (itálica) con el texto de C reformulado.

### D · La tableta vertical lleva la piel de móvil, hasta 1024
- Regla: **`(orientation: portrait) and (max-width: 1024px)` → piel de móvil**; apaisada, escritorio. Cubre iPad (768),
  iPad Air (820), iPad Pro 11" (834), iPad Pro 12,9" (1024) **y una ventana de escritorio más alta que ancha** (900×1200).
- Medido (grep): el corte vive **entero** en `(max-width: 768px)` / `(min-width: 769px)` en **18 archivos** (CSS inyectado y
  `matchMedia` en `home-geometry.js:70` `DESKTOP_MQ`, `Sidebar.jsx:310`, `state-core.support.jsx:40`,
  `MoveSessionV1.support.jsx`); **ningún `innerWidth`**. Por eso la foto pudo forzarlo: `decidir-s196.js` reescribe
  `matchMedia` antes de cargar y las media queries del CSSOM después, y la barra lateral desaparece en los cuatro anchos.
- Opciones de implementación (sin decidir, técnica): (a) reescribir las 18 apariciones como
  `(max-width: 768px), ((orientation: portrait) and (max-width: 1024px))` y su complemento con `not`; (b) mejor: **un solo
  sitio** — JS pone `data-pace-piel="movil|escritorio"` en `<html>` desde una única función `pielDe()` y el CSS pasa a
  selectores de atributo. (b) es un refactor de 18 archivos pero deja un corte único; el trinquete §1 (500 líneas) vigila
  `_responsive.pieles.js` (498).
- Va en **v0.130.0**, con la auditoría de viewports (`auditoria-viewports-s195.js`) re-medida y los cinco de arriba dentro.

### Media jornada = un HORARIO, como la completa
El usuario lo explicó así y se confirmó dos veces: **cada usuario tiene su horario real; la app lo pide, no lo supone.**
- **Jornada completa** = de tu entrada a tu salida con la comida dentro, todo editable (ya es así: `horario.inicio/comida/
  comidaDur/salida`, se edita en la cabecera del panel y en «Ajustar el horario»). Por defecto 8 h (9:00–17:00, comida 14:00).
  **Es la única que come.**
- **Media jornada** = medio día: **una mañana o una tarde**, de tu hora a tu hora, **sin comida** («cuando se acabe ya se hace la
  comida»). Por defecto **4 h desde tu entrada** (9:00–13:00). **Recuerda sus horas como preferencia** («elegida por el usuario
  previamente, posteriormente la recuerda… aunque la permite cambiar»): `horario.media = { inicio, salida }`, independiente del
  de la completa. **Se edita en su cabecera, como la completa** («Media jornada · de 9:00 ⌄ a 13:00 ⌄», dos selectores, ninguno
  de comida) y también en «Ajustar el horario». La loseta dice el tramo: «Media jornada · De 9:00 a 13:00» (hoy dice «Hasta
  las 12:30» porque es una duración de 3 h de foco desde que pulsas: `RITMO_FORMAS.media = { bloque: 45, foco: 180 }`).
- **La hora de fin manda** en las dos: empezar tarde acorta (recolocar), no corre el tramo.
- **Fuera de hora**: si son las 14:00 y tu media jornada es 9:00–13:00, la loseta se apaga y dice «fuera de hora», como la
  completa tras la salida; te quedan Una hora / Dos horas o cambiar las horas en «Ajustar el horario». (No cae a «4 h desde ahora».)
- **La comida solo en la jornada completa, también para Una hora y Dos horas**: dos horas de 13:00 a 15:00 ya no sirven la
  comida. La regla se simplifica: `comeA = opcion === 'jornada' && !horario.sinComida ? horario.comida : Infinity`.
- **Una hora / Dos horas** siguen siendo un rato desde ahora.
- **Pendiente de ver (pedido en html, no hecho por falta de sesión)**: cómo queda «Ajustar el horario» con las horas de la media
  jornada junto a las de la completa. El usuario: «entiendo que en ajustar horario pero muéstramelo en un html». Calco a hacer
  sobre el estado `pregunta` del panel (`RitmoPanel.jsx`, `ritmo.frase` con `RitmoSel`): una segunda frase «Media jornada: de
  {inicio} a {salida}.» con dos selectores, debajo de la de la completa. **Hacerlo antes de implementar**.

### Paquete
- Pregunta hecha tres veces sin respuesta directa (el usuario pidió seguir preguntando y luego el handoff). Recomendación
  vigente y no contradicha: **v0.129.0 = lo hecho (hoja + frase) + media jornada con horas; v0.130.0 = la tableta.**
  Confirmar al arrancar; si no, seguir la recomendación.

## 3 · Plan de implementación (para v0.129.0)

1. **Regla** (`app/ritmo/ritmo.regla.js`): `media` deja de ser `foco: 180` y pasa a horario: `finTrabajo` = `horario.media.salida`,
   `comeA = Infinity` salvo `jornada`. `ritmoMenu` pasa el horario que toca según `opcion`. Banco nuevo o ampliar
   `banco-recolocar-s194.js` (recolocar con media jornada; fuera de hora; sin comida en 2h que cruza las 14:00).
2. **Estado** (`app/state-ritmo.jsx`): `horario.media = { inicio: horario.inicio, salida: horario.inicio + 240 }` por defecto,
   migración para instalaciones existentes (Fase 1.6: migrar valores huérfanos), `ritmoHorario('media.inicio' …)` o un setter
   propio.
3. **Panel** (`RitmoPanel.jsx` `RitmoFraseMenu`): la cabecera de `media` con dos `RitmoSel` (inicio/salida de `horario.media`)
   y `ritmo.frase.menu.sin`; la tarjeta (`RitmoTarjeta.jsx`) con la loseta «De X a Y» (`ritmo.tramo` nuevo) y `ritmo.fuera`
   cuando `ahora >= media.salida − MINIMO`; «Ajustar el horario» (estado `pregunta`) con la segunda frase.
4. **Hoja** (`RitmoHoja.jsx` + `ritmo.css.jsx`): estado por parada como en la línea (`.pace-rt-li.pace-rt-hecha/.pace-rt-saltada`).
5. **Barra lateral** (`Sidebar.parts.jsx` línea ~277, `Sidebar.jsx`): `frase` en el objeto de la acción cuando `accion.ritmo`, y el
   párrafo en la tarjeta. Claves i18n `ritmo.llevas` (es/en) con números en palabras; censo `i18nClaves` en
   `scripts/verify.integridad.js` (hoy 662) sube.
6. **Tests** (calibrados en rojo contra HEAD, `git show HEAD:index.html > index.html` y restaurar): hoja con estados (móvil),
   frase (escritorio y cajón), media jornada (loseta con tramo, cabecera con selectores, fuera de hora, sin comida en 2h),
   `ritmo-panel.spec.js` / `ritmo.spec.js` (465: **no crece**, spec nuevo `ritmo-media.spec.js`).
7. **Cierre**: verify → build → e2e → docs (diario `session-196-…`, CHANGELOG, STATE **reescrito y podado**, DECISIONES
   fila «media jornada = horario; comida solo en completa», CONTENT, CLAUDE.md contador) → commit sin coautoría.

## 4 · Trampas de esta sesión (para no repetirlas)

- **Sembrar una tarde con bloques hechos**: `cycle` solo cuenta si `lastActiveDay` va en el formato del rollover
  (`new Date(...).toDateString()`) y `_historyMigrated: true`; si no, el relevo del día pone `cycle` a cero y la escena es de
  las 9:00 (`ritmoPlan`: `hechos = cycle − cicloBase`, no la hora).
- **La hoja no existe en escritorio**: «Ver la jornada entera» solo es visible en la copia móvil (`isMobile` + 390 de ancho).
- **El panel del navegador del app sirvió v0.125.3** por un service worker caducado en `localhost:8765`: `unregister` + borrar
  caches antes de mirar; las fotos van con `serviceWorkers: 'block'`.
- **Re-medir sobre el commit antes de informar**: así salió v0.128.1 (un Respira de 10' en una pausa de 5'). La semana se mide
  con `semana-medida.js` (scratchpad; el patrón está en `por-donde-seguir-s196.js`).
- **Backticks en el HTML de las páginas**: se escapan a `<code>` con una regex solo dentro del template (los comentarios JS
  también llevan backticks). Y `\n` dentro de un patch de Python entra como salto real en el JS: constantes en una línea.
- Las páginas se miran **a 1280 con Playwright** (`pds-*.png` en el scratchpad) antes de enviarlas; el panel del app no
  renderiza bien páginas de 700 KB+ con data URIs.

## 5 · Lo que NO se decidió (y quién decide)

- El texto exacto de la frase en singular/plural y en inglés — **mío**, dentro de la letra de arriba.
- El mecanismo del breakpoint ((a) o (b) del apartado D) — **técnico, mío**, con DECISIONES_TECNICAS_VIGENTES.
- «Ajustar el horario» con la media jornada — **del usuario, a la vista del html pendiente**.
- Media jornada de tarde por defecto para quien trabaja de tarde — no hace falta: se pone una vez y se recuerda.
- El miércoles con tres largas, el modo oscuro del panel (foto en `lo-hecho-contado-s196.html`: pasa, sin defecto visible),
  el cierre nunca «Ahora», la larga con un plato de dos — siguen declarados, sin fecha.
