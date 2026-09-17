# s192 · A tu ritmo: el menú manda (v0.122.0)

**Fecha:** 2026-09-17 · **Versión publicada:** v0.122.0 · **Suite:** 236 → **250**

> Encargo: el usuario trae de sus entrevistas —entre ellas, con un experto en informática y SaaS—
> cinco ideas: recoger datos para saber qué funciona, el *job to be done*, el *product-market
> fit*, **demasiadas opciones**, y un **menú completo** según el tiempo disponible (o el
> calendario) en vez de una carta infinita. Acabó en cuatro rondas de maqueta y en la primera
> versión de **«A tu ritmo»**: la home pregunta «¿cuánto trabajas hoy?» y sirve la jornada.
> «Implementemos esto primero y luego vamos ajustando.»

---

## 0 · Antes de diseñar: qué había y qué chocaba

| Idea | Lo que ya existía | Lo que chocaba |
|---|---|---|
| Datos para saber qué funciona | `pace.events.v1`, pero **no sale del dispositivo** | El ROADMAP: «backend de producto y tracking: no». Y un hueco que da la razón al experto: el registro **no sabe de dónde vino una sesión** (`EVENT_CONTEXTS` = `standalone` · `path`) |
| JTBD | Los cuatro problemas del audit §27.3 (el D es «sé que debería parar, pero no sé qué me conviene») | Son hipótesis nuestras; la única evidencia eran las 5 quejas de s132 |
| Demasiadas opciones | La home abría **4 puertas a 51 rutinas**, un Camino sugerido y, en la barra lateral, **otro** recomendador | «Déjate guiar» estaba en la Fase 8 y el audit §5.1 lo quería discreto |
| Menú por tiempo | `profile.time`, el plan del día, la propuesta de la pausa (s187), los Caminos | Nada los juntaba |

**Decisiones del usuario**, con las opciones delante: datos **anónimos con permiso** (apagados por
defecto, totales semanales, con el servidor de licencias) y **Stats aparcado** (si el menú manda,
«Hoy» tiene que enseñarlo; diseñarlo antes obligaba a rehacerlo).

---

## 1 · Cuatro rondas de maqueta, y lo que destapó cada una

Todas calcan la home real (su HTML y su CSS, con fuentes e imágenes incrustadas) y se abren con
doble clic; cada pantalla mide scroll, solapes y desbordes y se lo manda a la página. Generador y
revisión en `scripts/audit/menu-s192*.js`.

| Ronda | Qué se decidió | Lo que salió pintando, no leyendo |
|---|---|---|
| **1** · `menu-del-dia-r1` | **A · el menú manda** (frente a B, un enlace discreto) | La línea de la jornada entera se pisaba a 1280 y pedía 7 px a 1536x714; un `display = ''` le quitaba el flex a Actividades; un contenedor entre el aro y la barra **rompía el selector de hermano adyacente** que da el horizonte; el reset de botones (0,1,1) le ganaba a `.pm-enlace` |
| **2** · `menu-del-dia-r2` | Nombre (cuatro candidatos) y glifos **solo en las paradas** | **La mancuerna de Mueve salía como un «−»**: la regex que quitaba `width/height` del SVG calcado se comía también los de sus `<rect>`. Y el control «hay un `<svg>`» dio 4 de 4 con el dibujo roto → se hizo **relacional** (interior idéntico al del chip) y se probó con mutante |
| **3** · `a-tu-ritmo-r3` | **«A tu ritmo»**, «Hoy voy por libre» como única salida, tenedor y cuchillo, **hora de inicio y de comer** | «Ritmo» **ya titula el panel de Stats** (medido en `app/i18n`) → la barra lateral dice «Siguiente pausa». Con dos paradas a 30 min, el reparto alterno de etiquetas no tenía sitio para el cierre → **reparto voraz** y la palabra del módulo fuera… |
| **4** · `a-tu-ritmo-r4` | «Hasta las …» **debajo** del nombre; **el módulo vuelve a la etiqueta** («por si alguien no lo sabe»); salida y duración de la comida editables; llegar tarde = **salgo a mi hora** | …que el usuario pidió de vuelta, así que el espacio se ganó con tres niveles medidos. «Una hora» esperaba **245 min libres a la comida**: la excepción «hay comida delante» se aplicaba sin foco pendiente. El umbral fijo de cola fundía los dos bloques de 25 |

---

## 2 · La implementación

- **`app/ritmo/ritmo.regla.js`** — `ritmoComponer`, **pura**: la regla de la ronda 4 con los
  pozos entrando por parámetro. Comida a su hora exacta, bloque previo acortado, colas fundidas,
  agua repartida hasta la meta, sin repetir rutina.
- **`app/state-ritmo.jsx`** — `ritmo: { horario, libre, dia }`. **El progreso sale de
  `state.cycle`** (`cicloBase` al elegir): un contador propio habría sido un segundo número del
  mismo hecho. Los **pozos salen del catálogo vivo** (sin aviso, suelo, material obligatorio ni
  retención; abiertos por acceso; rotados por día; con el **veto de la pausa y su amnistía**). La
  hora de comer por defecto, por región del navegador.
- **`RitmoHome`** va donde iban Actividades y el Camino. **El panel lleva
  `data-pace-activitybar`**: hereda el horizonte, el recorte del arco y los observadores sin
  tocar su geometría. En el motor solo cambió **qué se mide como canto de las tarjetas**
  (`[data-pace-ritmo-panel]`). La hoja va **por portal** (el horizonte es un contexto de apilado).
- **Enganches mínimos**: el aro pregunta a `ritmoAro` (una línea en `FocusTimer.jsx`, que está en
  el límite de 500); la pausa, a `ritmoPropuesta` antes que a su regla; la barra lateral pone la
  siguiente pausa detrás de reanudar y del Camino. `focusMinutes` se sincroniza **solo sin un
  bloque en marcha** (`pace.timer.v1`).
- **`ABMeal`** entra en la familia de glifos de Actividades. **53 claves** nuevas por idioma
  (censo 590 → 643).

---

## 3 · Lo que cazó la red

- **La suite entera destapó un defecto real** que ninguna maqueta podía ver: en «por libre», el
  enlace de vuelta y «Ver caminos» compartían fila con **1-2 px** de diferencia y el foco «subía»
  al tabular (`home-a11y.spec.js`, WCAG 2.4.3).
- **El banco de mutantes (`banco-ritmo-s192.js`) corrigió un comentario.** El primer intento
  mutaba el estilo del botón y **siguió verde**: aislado con un control, lo que alinea es el
  envoltorio en `inline-flex`; el estilo es solo coherencia visual. El comentario decía lo
  contrario y se reescribió. **11 de 11 muerden**, con pasada de control sin mutar.
- **Dos asertos nuevos** tras preguntarse qué defendía la compensación del rótulo: la banda del
  panel no cambia al aparecer «Hasta las», y el corte del aro queda por debajo del solapamiento
  (el motor midió el panel).

---

## 4 · Trampas de esta sesión

- **`wc -l` y el `verify` no cuentan igual**: `FocusTimer.jsx` no acaba en salto de línea, así
  que `wc` decía 500 y el trinquete 501. Se compactó un comentario.
- **Un heredoc con comillas invertidas dentro de un template** no llega a escribir nada: el
  script de Node falla al analizarse. Para editar con comentarios de código, la herramienta de
  edición.
- **El panel del navegador dejó de dibujar capturas** dos veces: la verificación visual se hizo
  con Playwright sobre el artefacto, con el reloj fijado.
- **`build-standalone.js` reescribe `PACE_standalone.html`**, congelado por s134: se restauró
  tras cada build.
- **La semilla de la suite** trae `ritmo.libre: true` (sin fecha), porque varias pruebas falsean
  el reloj y un «hoy» sembrado no casaría con el de la app.

---

## 5 · Lo que no se probó, y lo que queda

- **Ni un píxel comparado**: las fotos las miré yo, a tamaño real, en 1280x879, 1536x714, 412x844
  y 360x730.
- **Recolocar a mitad de día** no existe: si te retrasas, las horas son las del plan.
- **Llegar antes** de tu hora, y las políticas «hago mis horas» y «que me pregunte» (pintadas).
- **El contexto** («Junto a la mesa · Sin material») es fijo: onboarding contextual, Fase 8.
- **Calendario**, **datos anónimos con permiso** y el **origen de cada sesión** en los eventos.
- **Stats** aparcado con sus maquetas de s191 sin commitear.
- **Deuda documental vista**: `CHANGELOG.md` lleva 23 versiones detalladas cuando la convención
  pide dos.
