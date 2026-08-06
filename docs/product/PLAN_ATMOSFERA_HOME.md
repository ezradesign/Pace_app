# Plan · Atmósfera de la home (el «sol» del Pomodoro)

> ## ⚠️ SUPERSEDED por s159 — NO GOBIERNA
>
> Se conserva por su valor histórico: es el único registro de cómo se llegó al
> modelo. **No se consulta para decidir nada.** Está desfasado en las dos
> direcciones: describe como vivos defectos que s158 ya resolvió (§1) y da por
> abiertas preguntas que s159 cerró con el usuario (§6). Lo que gobierna hoy:
>
> - **el modelo y los tokens** → `DESIGN_SYSTEM.md`, «La luz del Pomodoro»
> - **las reglas que evitan regresiones** → `DECISIONES_TECNICAS_VIGENTES.md`
>   (cuatro filas de s159)
> - **cómo se llegó y qué se midió** → `docs/sessions/session-159-luz-del-pomodoro.md`
> - **lo que queda por hacer** → backlog de `STATE.md` (el remapeo del arco)
>
> Su §4 (presupuesto de rendimiento) y su §5 (trampas ya pagadas) siguen siendo
> ciertos, pero viven ahora en las decisiones técnicas, que es donde se buscan.

> Escrito al final de s157 para continuar en s158. Nada de esto está cerrado con
> el usuario todavía: las preguntas del §6 hay que responderlas ANTES de tocar
> código, porque cambian el diseño, no solo los valores.

---

## 0. Dónde estamos

`v0.89.0` publicado con la atmósfera de s156 (mancha central + línea de alba),
que el usuario **rechazó visualmente**. En el árbol de trabajo, **sin commit**,
está la reescritura de s157: corona fuera del recorte, luz de suelo, escala
Kelvin, arco de sesión, reposo frío y apagado a los 5 minutos.

Estado de la red: `npm run verify` PASA · `npm run test:e2e` **39/39** (42 s).

---

## 1. Defectos VIVOS, confirmados por el usuario mirando la app

| # | Síntoma | Causa (verificada) |
|---|---|---|
| 1 | Con el Pomodoro **parado** ya se ve halo de color cálido | La luz de suelo hace `paceGlowRamp(DAWN, 100)`: el ámbar está **escrito a fuego** y **no sigue `--pace-k`**. Es la capa de mayor superficie |
| 2 | «El color siempre parece el mismo» | **La misma causa que 1.** La corona sí viaja en Kelvin; el suelo, que es lo que se ve, no |
| 3 | Por arriba la luz **se corta antes de acabar el aro**: «es un sol raro, no da luz por todas sus partes» | La máscara `naciente` arranca en `transparent 0%` y no llega a alfa útil hasta el 54 %. Se puso así para matar el corte recto contra el borde de `[data-pace-home-body]` (que lleva `overflow-y:auto` y **recorta**), pero mató también el limbo superior del aro |
| 4 | La dirección del viaje de color está **al revés** | s157 hizo cálido → frío. El usuario quiere **frío → cálido → frío** |

**El 3 es el que exige diseño, no ajuste**: hay ~59 px entre el borde superior
del aro y el borde del contenedor que recorta. Una corona que irradie hacia
arriba con el mismo alcance que hacia abajo **no cabe**.

---

## 2. Arquitectura propuesta para s158

### 2.1 Dos capas de sol, no una

- **LIMBO**: corona corta y simétrica que abraza el aro **por los 360°**. Alcance
  hacia fuera ~0,15·D, o sea muere muy por encima del borde que recorta. Es la
  que responde a «un sol da luz por todas sus partes».
- **BLOOM**: resplandor amplio y **direccional**, enmascarado a la mitad baja.
  Es el que da la sensación de sol naciente y el que se derrama en el suelo.

Separarlas resuelve el 3 sin reabrir el corte: el alcance largo solo existe
donde hay sitio.

### 2.2 UNA sola fuente de color para TODAS las capas

`--pace-luz` y `--pace-nucleo` (ya registrados con `@property` como `<color>`)
pasan a alimentar **también** la luz de suelo y el tinte global. Ninguna capa
puede volver a llevar un tono escrito a fuego: ese fue el defecto 1 y 2.

### 2.3 El viaje de color, en la dirección correcta

La temperatura la lleva **`--pace-arc`** (triangular), no `--pace-progress`:

| momento | `--pace-arc` | tono |
|---|---|---|
| reposo / descanso | 0 | frío, azul contenido |
| inicio de sesión | 0 | frío |
| mitad | 1 | **cálido, el pico espectacular** |
| final | 0 | frío otra vez |

Los tokens `--dawn-ember` / `--dawn-soft` / `--noon-soft` / `--dusk-soft` se
recolocan: los extremos del recorrido son FRÍOS y el centro CÁLIDO.

### 2.4 Tinte de habitación (pedido explícito del usuario)

Una capa **muy** tenue sobre `[data-pace-app-root]`, por detrás de todo,
incluido el sidebar, que tiña la superficie entera con la luz del momento. Es lo
que convierte «un adorno alrededor del reloj» en «una hora del día».

Riesgos a medir antes de aceptarla:
- contraste del texto en las dos paletas;
- banding sobre un área enorme (el grano de s140 es obligatorio aquí);
- coste de repintado — ver §4.

### 2.5 Descanso

Frío estable con **ligeras variaciones en el azul**. Hay que decidir si esas
variaciones las mueve el avance del propio descanso (determinista, sin
animación) o si son una animación lenta — el usuario ya vetó las animaciones
continuas, así que por defecto: **las mueve el avance**.

---

## 3. Lo que ya está resuelto y NO hay que rehacer

- El aro nunca se tiñe por dentro: el número siempre sobre papel (medido, 1–4,7).
- Ni una arista recta arriba ni abajo (medido; las dos causas eran bordes de caja).
- La atmósfera ya **no se queda pegada** al completar un bloque.
- El sol se apaga solo a los 5 minutos de reposo, sin JS.
- El glow verde de s99 queda fuera de la home y sigue en Caminos.

---

## 4. Presupuesto de rendimiento — regla dura para s158

Una sesión de 25 min llegó a costar **21,5 s** de trabajo del navegador frente a
7,5 s de base, y la prueba del Pomodoro se quedó sin tiempo. Tres causas y sus
lecciones:

1. La caja de una capa se fue de tamaño → **el área importa**.
2. El arco se publicaba cada segundo → **cuantizado a 30 pasos**, invisible.
3. La cadena `color-mix` se re-resolvía **en cada una de las 7 paradas** →
   registrada con `@property` como `<color>`, se computa una vez. Esto solo
   bajó la suite entera de 1,3 min a 42 s.

**Regla para s158**: cualquier capa nueva —y el tinte global es GRANDE— se mide
con el banco de coste antes de darla por buena. Objetivo: que la suite siga por
debajo de un minuto.

Y una advertencia de método: entre corridas la referencia «sin sol» pasó de
8,5 s a 12,1 s. **La máquina es ruidosa**: comparar siempre en la misma pasada.

---

## 5. Trampas ya pagadas en s156/s157 (no volver a pisarlas)

- **Backticks dentro del template literal** de `_responsive.js` abortan el build.
  Pasó **tres** veces esta sesión.
- La suite conduce `index.html`: sin rebuild, el rojo miente.
- Un **porcentaje negativo** invalida el `color-mix` entero y la capa
  desaparece sin aviso. Clampear con `max(0%, …)`.
- `radial-gradient(circle, …)` mide por `farthest-corner`: en caja cuadrada las
  paradas se van a 1,41× de su sitio. Para anclar al borde del aro hace falta
  `farthest-side`.
- Una luz **no puede acabar donde acaba su caja**: tiene que llegar a
  transparente dentro de ella.

---

## 6. EL MODELO, YA DECIDIDO CON EL USUARIO (s157, cierre)

> **El aro NO tiene una atmósfera: el aro ES una fuente de luz.** La home no
> lleva decoración permanente; lleva superficies que REFLEJAN la luz del sol.
> La hora del día la marcan los segundos del Pomodoro.

Consecuencias, todas vinculantes:

1. **Pomodoro parado ⇒ CERO atmósfera.** La home queda limpia, sin halo de
   ningún color. No es «fría y tenue»: es **nada**. Esto deja obsoleto el
   apagado a los 5 minutos de s157 (se diseñó para un reposo CON luz).
2. **La luz existe solo mientras hay sesión** — foco, pausa o larga.
3. **Recorrido del día**, gobernado por el avance de la sesión:
   `amanecer → mediodía → atardecer → noche`, y **el frío del amanecer NO es el
   frío de la noche**: el primero es azul con un punto rosa; el segundo, azul
   profundo. Son dos tokens distintos, no el mismo reutilizado.
4. **Pausa y Larga = noche.** Sus «ligeras variaciones en el azul» las mueve
   **el avance del propio descanso** — determinista, sin animación continua.
5. **Alcance del tinte**: radial desde el aro, hasta **tocar las pills
   FOCO/PAUSA/LARGA** por arriba y hasta **el Camino sugerido** por abajo.
   **Solo pinta FONDOS**: todo lo demás (pills, tarjetas, chips, texto) va por
   encima y no se tiñe.
6. **Mediodía**: lo más espectacular que se pueda **sin comprometer la
   legibilidad**. El interior del aro sigue siendo intocable si hace falta para
   que el número se lea.
7. **Sin referencia visual**: el listón es «un paso del día creativo y
   agradable».

### Lo que queda por resolver al empezar s158

- **Al TERMINAR una sesión, ¿cómo se va la luz?** ¿Se desvanece con calma
  (¿cuánto?) o desaparece con el propio cierre? Es el único momento en que la
  atmósfera pasa de existir a no existir.
- **¿El sidebar también refleja?** El §6.5 delimita el alcance en la columna
  central. El usuario mencionó antes «incluido el sidebar»; hay que cerrarlo.
- **Con el BreakMenu abierto**, ¿sigue habiendo luz por detrás del modal?
