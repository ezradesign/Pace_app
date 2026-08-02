# Sesión 146 — Fase 2.5 (mitad 2): la curva de logros, y la amnistía

**Fecha:** 2026-08-02 · **Versión:** v0.78.0 → **v0.79.0**
**Tipo:** hotfix + auditoría + código

---

## 0. El incidente que abrió la sesión

El usuario reportó a media sesión que **la app no abría**. Reproducido con SW y
cachés purgados y centinela de consola:

```
ReferenceError: useState is not defined
    at PaceApp (index.html:21031)
```

**Causa.** `main.jsx` aliasa los hooks a propósito
(`const { useState: useStateMain, useEffect: useEffectMain } = React;`) y sus 12
llamadas usan `useStateMain`. La línea 134, que entró con el Preview de s144,
usaba el `useState` pelado. **Un destructuring con alias no crea el binding
`useState`**, así que ese nombre no existe en el módulo.

**Por qué se coló.** En `PACE.html` no rompe y en el artefacto compilado sí: el
build de Etapa A envuelve cada módulo en un IIFE. Verificado que el `index.html`
de **v0.77.0 ya traía el bug** (`git show HEAD~1:index.html` contiene la misma
línea): **la web llevaba rota desde s144, no desde el último push.**

**Barrido de la clase entera** sobre los 90 archivos de `app/`: **un solo caso**.
Trampa propia por el camino — la primera versión del escáner dio **0 problemas**
porque contaba la propiedad `useState:` del destructuring como declaración.
Corregido el criterio (en `{ a: b }` el binding es `b`), salió el caso real.

---

## 1. La auditoría: banco de medición, no estimación

Nuevo `scripts/audit/logros.js`, dos mitades:

- **Inventario estático** — escanea los `unlockAchievement` del árbol y captura
  la guarda numérica que los envuelve. Tres vías: llamada literal, mapa con id
  calculado (`explorationMap`) y **tabla recorrida en bucle** (`FECHAS_SENALADAS`,
  donde el id es la clave). La tercera se añadió a media sesión: sin ella el
  escáner acusaba de fantasma a 5 detectores que sí funcionaban.
- **Simulación** — carga los módulos de estado reales sobre un `window` falso con
  **reloj controlable** y juega escenarios: primera sesión, primer día, 7 / 30 /
  365 días, y un año exhaustivo que marca el techo del catálogo.

**Validación cruzada:** el banco reprodujo de forma independiente el hallazgo de
s145 (primera sesión de Respira a las 6:50 = 4 logros, 1 avisado, 3 en cola).

### Lo que salió (v0.78.1, antes de tocar nada)

| Escenario | Logros |
|---|---|
| Primera sesión | 4 |
| Primer día completo | **11** |
| 7 días | 17 |
| 30 días | 25 |
| **365 días** | **31** |

**El día 1 entregaba el 35 % de lo que da un año entero; la primera semana, el
55 %.** La curva no subía: se desplomaba.

Tres hallazgos más:

1. **52 % de los implementados (36 de 69) eran de una sola vez.** «Primeros»
   (10/10) y «exploración» (16/16) no pedían repetición **nunca**.
2. **35 % del catálogo (37 de 106) no lo podía ganar nadie**: sin detector. De
   ellos **11 eran secretos**, y un secreto sin detector **se pinta idéntico** a
   uno alcanzable.
3. **`master.collector.full` era imposible por aritmética**: pedía 100 logros y
   solo existían 69 con detector. Declarado como implementado. Es el caso exacto
   del §3.4.

Lo que **no** estaba roto: `IMPLEMENTED_ACHIEVEMENTS` y los detectores reales
cuadraban exactamente (69 y 69, cero incoherencias en ambos sentidos).

---

## 2. Las dos decisiones del usuario

**(a) Alcance de la subida: curva completa hasta el año.**

**(b) Cómo se comunica la pérdida: AMNISTÍA — nadie pierde nada.**

Esto **anula la «excepción consciente a §2.5/§2.2» aceptada en s136**. Puesto
delante de las cifras, el usuario eligió conservar. §2.5 «progreso sin culpa» y
§2.2 «nada de pérdida punitiva» quedan **intactas** y no hay nada que comunicar.

**La amnistía sale gratis por construcción**, verificado: la única escritura sobre
`state.achievements` es el spread aditivo de `unlockAchievement`
(`state-achievements.jsx:150`). Nada borra un logro nunca ⇒ subir umbrales solo
afecta a lo aún no ganado, **cero código de migración**.

Decisión secundaria: **implementar los detectores baratos y retirar los
inviables**.

---

## 3. Lo entregado

**Archivo nuevo `app/state-achievements.support.jsx`** (179 ln) — contadores
generalizados (`bumpCount`/`getCount`/`contarHoy`/`contarRutina`) y los
detectores que faltaban. Nace porque `state-achievements.jsx` no cabía bajo las
500 líneas con la curva nueva. Mismo patrón que `MoveSessionV1.support.jsx`.

**La curva:**

| Logro | Antes | Ahora |
|---|---|---|
| `explore.*` (16) | 1 sesión | **3 sesiones** de esa técnica |
| `first.day` | primera sesión de la vida | **día con 2 actividades distintas** |
| `first.plan` | **idéntico a `first.ritual`** | completar el plan **3 días** |
| `master.dawn` / `dusk` | 1 sesión | **5 días** |
| `master.long.focus` | 1 bloque de 45 | **5 bloques** |
| `master.silent.day` | 1 día | **5 días** |
| `master.box/coherent/rounds.10` | 10 | **15** |
| `master.collector.half` / `full` | 50 / 100 (imposible) | **30 / 60** |
| `stats.month.focus` | 600 min/mes (caía en 6 días) | **1200** |

**Detectores implementados (23)**, todos estaban en el catálogo sin poder
ganarse: `master.pomodoro.12` · `centurion` · `marathon` · `gardener` ·
`hips.20` · `shoulders.20` · `ancestral.10` · `antidote` (contador por etiqueta
SIT) · `hydrate.30/90` · `explore.all.breathe/move/extra` · 6 secretos
(`night.owl`, `lunch`, `zen`, `first.monday`, `new.year`, `rain`) · los 4
solsticios y equinoccios.

**Retirados (6)**, sin forma razonable de detectarlos: `explore.chrome`,
`secret.konami`, `secret.birthday`, `secret.skip.none`, `secret.tweak.all`,
`secret.pause.long`. Ninguno tenía detector ⇒ **nadie podía tenerlos** ⇒ la
amnistía no se rompe.

**Bug propio cazado por el banco.** La primera versión de `first.day` colgaba de
`updateStreak`, que **retorna pronto si el día ya está marcado** — solo corría en
la primera actividad de la jornada, cuando el plan tiene una marca, así que la
condición de dos **no se cumplía nunca**. El banco lo vio: el logro no se ganaba
ni con un año exhaustivo. Movido a `checkPlanAchievements`, que sí ve el plan.

### La curva, medida antes y después

| | v0.78.1 | v0.79.0 |
|---|---|---|
| Primera sesión | 4 | **2** |
| Primer día | 11 | **8** |
| 30 días | 25 | **29** |
| 365 días | 31 | **44** |
| **Día 1 como % del año** | **35 %** | **18 %** |
| Catálogo · con detector | 106 · 69 | 100 · **92** |
| Sin detector | 37 (35 %) | **8 (8 %)** |
| **Secretos fantasma** | **11 de 21** | **0** |

Los 8 sin detector que quedan son **no-secretos** y se pintan «Pronto»:
`master.extra.all.week`, `master.midnight.never` y las 6 estacionales de
estación completa.

---

## 4. Verificación

- Sintaxis con el **Babel del build** (no `node --check`, que no acepta `.jsx` —
  el primer intento dio un «OK» falso porque `| head` se comía el código de
  salida).
- Tamaños: `state-achievements.jsx` **397 ln** · `.support` **179** ·
  `catalog.js` **229**. Todos bajo el límite de 500.
- `index.html` regenerado; **`PACE_standalone.html` restaurado byte a byte**,
  hash `998e3e358d689036` idéntico antes y después (decisión s134).
- Navegador con SW y cachés purgados y **centinela**: consola limpia; los dos
  errores que quedan en buffer son de las cargas previas al fix, identificables
  por su URL.
- **Comportamiento en la app real, no en el simulador**: tres sesiones de Box
  seguidas ⇒ `explore.box` salta **solo en la tercera** (contador 1, 2, 3) y de
  paso entra `secret.rain`, que era indescubrible. `first.day` salta con dos
  actividades distintas.
- **Amnistía verificada en vivo**: sembrado un `explore.nadi` ganado con las
  reglas viejas y su contador nuevo a 0, sobrevive intacto a sesiones
  posteriores.
- El Preview de s144 se ve funcionar **por primera vez en el artefacto
  compilado**.

---

## 5. Queda abierto

- **Los glifos** (logro y los 20 de ejercicio de la ola B): esperan arte del
  usuario. Sin ellos, las miniaturas de la sidebar siguen con el `'✦'` fijo.
- **Reescritura editorial de las 28 descripciones**: desbloqueada desde s144,
  pero **falta la referencia de tono del usuario**. No se propuso otra ronda a
  ciegas.
- **Denominadores únicos (§15.4)**: sidebar, modal, stats y toasts deben contar
  lo mismo. No tocado.
- **Los 8 sin detector**: viables pero caros (seguimiento semanal o de estación
  entera). Anotados, no implementados.
- **Títulos y descripciones de logro son solo español**, también en inglés: salen
  literales de `catalog.js` sin pasar por i18n. Hueco pre-existente, detectado al
  comprobar el coste de cambiar una descripción.

---

# Segunda mitad de la s146 — v0.79.1

> Continuación de la misma sesión, tras el cierre de v0.79.0. Cambia de tema:
> del **umbral** al **aviso** y al **arte**.

## 1. El aviso hablaba de la actividad anterior

Lo reportó el usuario en dos frases: «hago respira y me dice calistenia» y «en
4·7·8 acabo y es primer estirón». Reproducido con una traza sobre el artefacto
compilado — el aviso iba **siempre un paso por detrás**, y lo que sí habías
ganado se quedaba en la cola.

Dos causas encadenadas, ambas del diseño de s145: la cola drenaba **FIFO** (lo
más antiguo) y drenaba **aunque la sesión no ganara nada**. Y v0.79.0 lo agravó:
23 detectores nuevos, varios de ellos oportunistas (secretos de hora,
efemérides), metían más retraso.

**La regla que faltaba:** un logro de módulo solo se anuncia en una sesión de ese
módulo. Los transversales valen en cualquier sitio porque no prometen relación
con lo que acabas de hacer. Necesitó **dos pasadas** en `flushAchievementToast`:
con una sola, los transversales se colaban por delante por ser más antiguos y
Respira seguía anunciando «Primer día».

**Medido de paso:** con la curva de v0.79.0 una sesión gana **1 logro**, no 4. El
escalonado ya casi no tiene trabajo; lo poco que hacía era desincronizar.

## 2. Revisión crítica del propio trabajo

A petición del usuario. Tres defectos reales, míos:

- **Crecimiento sin techo en localStorage**: `contarRutina` creaba una clave por
  rutina propia (`custom.<timestamp>`), para siempre, y sin servir para nada —
  `explore.all.extra` se mide contra el catálogo de Mueve.
- **Cuatro claves de estado sin declarar** en `defaultState`, rompiendo la
  convención del archivo.
- **`state-core.jsx` por encima de 500 líneas.** Dato que corrige la
  documentación: **ya estaba en 501 antes de esta sesión**; la tabla de deuda
  decía 494.

Y una trampa de medición: la primera comprobación dio «el fix no funciona»
porque **el estado no se había limpiado** —la página anterior lo re-persistió
antes de navegar— y estaba midiendo restos. Primo hermano del buffer de consola.

## 3. Cuatro secretos más eran fantasma, y corrigen una cifra mía

`secret.aged`, `secret.mono`, `secret.seal`, `secret.illustrated`: tienen
detector, pero **la palanca que los dispara ya no existe en la UI**. La paleta
«envejecido» se retiró en s71 y `loadState` la migra a crema; la tipografía no
tiene control desde s20; `logoVariant` salió de Tweaks.

Así que **«secretos fantasma 11 → 0» era falso: eran 11 → 4**. Punto ciego del
banco: da por «alcanzable» todo detector que viva en un componente, sin poder
saber si el control sigue ahí.

## 4. §15.4 · denominador único

Medido: sidebar **96**, modal **88**. La sidebar contaba los 8 sin detector, así
que su «por descubrir» prometía de más. La regla pasa a `catalog.js`, que es el
único punto que ven las dos superficies.

## 5. Los 55 glifos

El usuario aportó **91 archivos = 58 dibujos distintos** (verificado por hash de
contenido, no por nombre). Ingestados 55 como **máscara CSS**.

### Lo que se midió antes de decidir

- **El peso no era problema**, al contrario de lo que se avisó primero: a tamaño
  de sello cada máscara pesa ~5 KB. Los 200 MB de origen son lienzo de imprenta.
- **A 56 px se reconocen.** La predicción de «mancha gris» era falsa para este
  arte; valía para el ejemplo denso de la gota.
- **El problema real era el contraste**: dibujos pálidos (L 171-187) sobre papel
  L 237. La máscara lo iguala porque el color lo pone el token.

### Tres intentos para quitar el marco

1. Pico de densidad por radio → en los motivos grandes el pico **es** el motivo.
   3 de 10.
2. Cobertura angular a radio fijo → **0 de 50**. Medido el perfil: **el marco no
   está centrado ni es un círculo**; a radio fijo aparece en el 41 % de los
   ángulos. Y aflojar el umbral detecta la textura del papel.
3. **Por ángulo, el trazo más exterior.** 50 de 50.

### Y el encuadre son dos decisiones, no una

- **Centrar** sigue a la tinta **visible**: una sombra tenue a un lado desplazaba
  el dibujo sin que el ojo la viera.
- **Dimensionar** cubre **toda** la tinta, y por el **máximo**, no por percentil:
  con el percentil 99.5 el 0,5 % extremo es exactamente el que asoma — 17 de 50
  con tinta fuera del sello.

### Trampas de herramienta

- **`.sharpen()` devuelve 3 canales aunque entre 1** (1.048.576 → 3.145.728
  bytes). Leerlo como gris desplaza cada fila: la primera tanda salió en tiras.
- **sharp aplica `extract` ANTES de `extend`** aunque se encadenen al revés. El
  recorte se hace sobre el búfer.
- **El inliner del build sustituye cadenas literales**: las rutas van enteras en
  el mapa, y **ni siquiera se pueden mencionar en un comentario** — el
  guardarrail comprueba que no queda rastro del prefijo y aborta el build.
- **El mapeo iba por posición.** Al subir 8 dibujos más, con nombre en mayúscula,
  **0 de 50 posiciones seguían coincidiendo**: los 50 glifos se habrían
  reasignado sin dar un error. Pasa a clave estable.

## 6. Lo que queda abierto

- **9 apuestas del mapeo** sin revisar por el usuario, y **3 dibujos liberados**
  (bambú, vasija, llave) esperando destino.
- **4 glifos por debajo del 75 % de la mediana de tinta** — y medido, no es
  opacidad: su techo con toda la tinta opaca ya está por debajo. Solo lo
  arreglaría engordar el trazo, que sería retocar el arte.
- **41 logros sin arte propio** de los 96.
