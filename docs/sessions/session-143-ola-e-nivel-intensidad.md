# Sesión 143 — Fase 2, ola E: nivel e intensidad, por fin visibles

**Fecha:** 2026-07-31 · **Versión:** v0.75.0 → **v0.76.0** · Sesión de **CÓDIGO**.

La ola B sigue en pausa esperando arte, así que se ejecuta la **ola E**: consumir
los metadatos que llevaban desde s115 en los datos **sin que nadie los mirara**.

---

## 1 · Lo que la ola E NO pudo incluir, y por qué

El ROADMAP pedía tres cosas: hacer visibles nivel e intensidad, **no mezclarlos**, y
**dejar de recomendar contenido avanzado por defecto** (§29.4). La tercera **no tiene a
quién aplicarse**:

- el **BreakMenu recomienda ACTIVIDAD** (Respira / Mueve / Hidrátate), no rutina;
- los **Caminos llevan la rutina escrita** en el paso (`resolveBodyRoutine` resuelve un
  `routineId` explícito, no elige);
- no existe ningún otro selector automático de rutina.

O sea: el primer recomendador real de rutinas es la **Pausa PACE de la Fase 3.5**. Ahí
nace esa regla — y ahora, gracias a esta ola, **ya tendrá el dato para cumplirla**.

## 2 · Los datos estaban incompletos, y justo donde importaba

Medido antes de tocar nada: **22 de 28 rutinas** declaraban `level`/`intensity`. Las 6 que
no son **exactamente las 6 legacy que s121 dejó bloqueadas**. Y dentro de ellas estaban
los dos casos que el audit §29.4 nombra uno por uno.

Además, **`advanced` no existía en los datos**: solo sabían decir `accessible` o
`intermediate`. La regla «el contenido avanzado no se recomienda por defecto» era
inaplicable **por falta de dato**, no por falta de código.

Las 6, etiquetadas leyendo su contenido real:

| Rutina | Intensidad | Nivel | Por qué |
|---|---|---|---|
| Empuje · progresión | Medio | Intermedio | flexiones inclinadas → pica → flexiones |
| **Piernas · a una** | Intenso | **Avanzado** | búlgara + zancada profunda + `Sentadilla de cuádriceps` (ex Sissy squat, caso §29.4) |
| Escritorio express | Suave | Básico | hombros, muñecas, giro, tobillos, barbilla |
| Caderas · suelo | Medio | Intermedio | rana, 90/90, transiciones de suelo |
| **ATG · Rodillas a prueba** | Intenso | **Avanzado** | «progresiones profundas de rodilla», el otro caso §29.4 |
| Ancestral | Medio | Intermedio | sentadilla sostenida, gateo, suspensión |

**Las 28 declaran ya los dos ejes**: 17 básicas · 9 intermedias · **2 avanzadas** ·
13 suaves · 12 medias · 3 intensas.

## 3 · Cómo se ven (§29.2: son DOS ejes y no se mezclan)

- **Intensidad en el pie de la tarjeta**, junto al código: `CADERAS · MEDIO`. La declaran
  **todas** las rutinas, que es lo que pide el audit.
- **Nivel técnico como pastilla `muted` arriba, solo cuando NO es básico**: `INTERMEDIO`,
  `AVANZADO`. Marcar las 17 accesibles sería ruido —lo normal no necesita etiqueta— y
  encima apagaría la señal justo donde importa.

La tarjeta es **compartida por las tres bibliotecas**, así que la lectura de los
metadatos es defensiva: Respira no los declara y sus tarjetas no cambian.

## 4 · Cierre de la ola C en el copy de RUTINA

Reportado por el usuario a ojo y confirmado midiendo: las olas A y C renombraron los
nombres de **paso** y **nunca miraron los de rutina ni sus descripciones**. Resultado:
**7 de 28 rutinas** con inglés, y **3 descripciones citaban ejercicios que ya no
existen**:

| Rutina | Antes | Ahora |
|---|---|---|
| Postura reset | «Chin tucks, scapular squeeze, thoracic ext.» | «Barbilla, omóplatos y pecho. Tres gestos contra la silla.» |
| Core · plancha | «Planchas y **hollow**…» | «Planchas y **hueco abdominal**…» |
| Ancestral | «Técnicas ancestrales: **crawl, hang, squat profundo**…» | «**Gateo, suspensión y sentadilla profunda**…» |
| Hombros · 5 pasos | «**Reset** de hombros…» | «Hombros a punto…» |

**0 descripciones citan ya un nombre retirado.** Lo que queda es inglés en **nombres de
rutina** (`Grip + antebrazos`, `Core silencioso`, `Postura reset`, `Core · plancha`,
`ATG · Rodillas a prueba`) — decisión del usuario, no bug.

## 5 · Reescritura editorial: **descartada de momento**

Se propuso una muestra de 3 descripciones reescritas «más PACE» y **el usuario las
rechazó en bloque**. Queda aparcado a propósito y **sin más intentos a ciegas**: adivinar
el tono por tercera vez no lleva a ningún sitio. Lo que hace falta antes de retomarlo es
**la referencia del usuario** — dos o tres descripciones actuales que él dé por buenas—,
para derivar el patrón en vez de proponerlo.

Queda además un argumento que conviene recordar al retomarlo: hoy las descripciones hacen
**tres trabajos mezclados** —prometer una sensación, enumerar contenido y declarar
requisitos— y **§29.3 dice que los requisitos deben verse antes de empezar**, cuyo sitio
es el Preview de §18.3 (ítem 6 de la Fase 2). Reescribirlas antes de decidir eso es
escribir dos veces.

---

## 6 · Cambios en el árbol

| Archivo | Cambio |
|---|---|
| `app/breathe/BreatheLibrary.jsx` | `RoutineCard`: intensidad en el pie + pastilla de nivel (solo si no es básico), lectura defensiva |
| `app/i18n/strings/sessions.js` | `lib.intensity.*` y `lib.level.*`, ES + EN |
| `app/move/move.data.js` · `app/extra/ExtraModule.jsx` | metadatos de las 6 rutinas + 4 descripciones corregidas |

`PACE_standalone.html` **no se regenera** (s134): restaurado byte-idéntico,
`998e3e358d689036`.

## 7 · Verificación

Con SW y cachés purgados: las etiquetas se pintan en las tres bibliotecas, `BÁSICO` no
aparece nunca (0 ocurrencias), `AVANZADO` sale donde toca, las tarjetas de Respira quedan
intactas y la consola no da errores nuevos.

**Trampa propia anotada**: la primera comprobación buscó «Suave» y dio 0 — el CSS lo pinta
en mayúsculas y `innerText` devuelve «SUAVE». No fallaba el código, fallaba la
comprobación. Y ojo al contar: `MEDIO` es subcadena de `INTERMEDIO`.
