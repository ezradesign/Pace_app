# HANDOFF · s172

**Punto de partida.** Versión **v0.101.0** en los 7 sitios · `npm run verify` PASA ·
`npm run test:e2e` **105/105** · `PACE_standalone.html` intacto en v0.71.0 ·
**árbol SIN COMMITEAR** (s171 terminó sin hacer commit: el mensaje sugerido está al final).

> `STATE.md` y `CHANGELOG.md` describen la **primera mitad** de s171. La segunda
> —la segunda tanda de arte y el anclaje del runner— está **solo aquí y en el
> diario**. Si los dos se contradicen, gana este documento.

---

## 1 · Lo primero: el emisor de la Fase 3 lleva DOS sesiones esperando

s170 cerró su prerrequisito, s171 no lo tocó (entraron defectos visuales del
usuario). El plan sigue entero en [`docs/HANDOFF_s171.md`](HANDOFF_s171.md) §2 y
**las cuatro decisiones ya están contestadas** por `docs/product/EVENTOS_SCHEMA.md`
§6.3/§6.4/§7.1/§7.2 — **leerlo antes de razonar nada**: en s170 tres de cuatro
respuestas deducidas salieron mal.

Lo único sin resolver es el **desajuste `kind:'body'`**: el registro de Caminos lo
usa y `EVENT_STEP_KINDS` no lo tiene. Sin mapear `'body'` → `move`/`stretch` por el
prefijo del `routineId`, **todos** los `path.step.completed` de cuerpo se pierden
**en silencio**. Y el enum llama `stretch` a lo que el código llama `extra`.

---

## 2 · Lo que s171 dejó a medias: el anclaje del runner

**El usuario lo verificó en su teléfono y sigue viendo un salto.** Estado medido:

| | Antes de s171 | Ahora |
|---|---|---|
| Círculo entre pasos de TRABAJO | 43–65 px | **0 px** |
| Nombre entre pasos de TRABAJO | 94 px | **0 px** |
| Círculo cruzando fases | 65 px | **~25 px** |
| Nombre cruzando fases | 94 px | **~29 px** |

**Lo que queda tiene un nombre**: el gate de tipo **`ready`** —el que espera al
usuario porque el paso pide suelo, cojín o pared, p. ej. «Flexor de cadera»— **no
pinta contador**, así que su bloque se queda ~50 px por debajo del suelo que ancla
a los demás. Está asertado como **deuda con trinquete** (tope 30 px) en
`tests/runner-circulo.spec.js`; si se arregla, hay que bajar el tope a 0.

**Cómo está montado el anclaje** (`app/move/MoveSessionV1.support.jsx`):
- `[data-pace-v1-body] { min-height: 70vh }` en móvil y `72vh` en escritorio, con
  gate `min-height: 780px` / `880px`. **Los suelos son el techo MEDIDO**, no una
  estimación: el bloque más alto que cabe es 70,1vh a 375×780 · 71,2 a 812 · 72,4
  a 844 · 76,0 a 1280×900.
- El rótulo de fase se pinta **siempre, vacío cuando no hay** (`{kicker || null}` +
  `[data-pace-v1-kicker]:empty`), y **vacío no cuesta nada fuera de los suelos**:
  a 360×640 esos 11 px eran justo los que faltaban.

### CUATRO ERRORES MÍOS QUE LA MEDIDA CORRIGIÓ — no repetirlos

1. **Reservar cada texto por separado NO funciona.** Las reservas son **aditivas**
   y el peor caso real no tenía a la vez nombre de 2 líneas y cue de 3: el bloque
   pasó de 460 a 529 y desbordó donde antes cabía.
2. **El bloque no se compara contra el alto del CENTRO.** Dentro del centro también
   vive la barra de progreso — **61 px** que no estaba contando. Por eso una medida
   decía «holgura +11» mientras el test de desborde decía «rebasa 51».
3. **Con el bloque anclado no hace falta reservar ningún texto**: por encima del
   nombre solo hay glifo y rótulo, los dos de alto fijo.
4. **Los backticks dentro del template literal del CSS**, otra vez (s139, s156,
   s157, s158, s162, s171). El build **aborta** y —con la salida silenciada— tres
   rondas de medición corrieron **contra un artefacto viejo**. Si una medida no
   cambia cuando debería, mira primero si el build pasó.

---

## 3 · La segunda tanda de arte: HECHA

**57 de 61 identidades con arte** (eran 47). Faltan **4**: `Nordics`, `Onda espinal`,
`Pica en escritorio` y `Rana`.

- El mapa de la tanda está en `scripts/glifos/mapa-tanda2.txt`.
- **13 se asignaron con evidencia** (el encargo cita una marca y el dibujo la lleva)
  y **7 las decidió el usuario**. Dos dibujos quedaron **fuera**: uno era una «V»
  invertida sin mesa que habría duplicado la silueta de `Marcha del elefante`, y
  otro una segunda sentadilla que chocaba con `Sentarse y levantarse del suelo`.
- **8 de los 10 muebles que faltaban ya entran** (silla, mesa, pared). Quedan
  **`Fondos en silla`** y **`Deslizamientos en pared`**.
- Auditoría geométrica: **0 piezas fuera del círculo** (radio 97,6–98,3 % del tope).
- Censo del verify subido a mano: `precache: 219` (dos filas por pieza).

### La trampa que más caro sale, y cómo se sorteó

**La ingesta reescribe el mapa ENTERO.** La carpeta de origen tiene que llevar
también los que ya están. Como la numeración de la hoja de contactos de s170 **no
es reproducible** (regenerarla por hash da otro orden y sus controles fallan), los
39 dibujos viejos que sobreviven se recuperaron **emparejándolos por CONTENIDO**
contra las máscaras: firma de densidad de tinta → recorte → 32×32 → correlación.
La peor pareja puntuó **0,849**, o sea sin ambigüedad. El script está en el
scratchpad de s171; si hace falta otra tanda, **hay que volver a escribirlo o
moverlo a `scripts/glifos/`**.

### Un detector que NO sirvió, para no reintentarlo

Intenté detectar el mueble por «recta larga». Tres versiones, tres respuestas
distintas: la estricta daba **falsos negativos** (la línea de la silla está
**partida por el cuerpo**), la relajada se disparaba con los contornos, y la de
tramos colineales perdía la mesa continua. **Lo que funciona es la pieza a 700 px
con la descripción del encargo al lado**, que es lo que ya midió s170.

---

## 4 · Lo que el usuario pidió y está SIN HACER

1. **Prompts para un glifo de `Descanso` y otro de `Respira`.** Pedidos al final de
   s171 y no entregados. El encargo de `Descanso` ya está escrito en
   `GLIFOS_EJERCICIOS_REDISENO.md` («una figura sentada y quieta, o un simple arco
   de reposo; debe leerse como pausa y no como gesto»). `Respira` **no es una
   identidad de ejercicio**: hoy el módulo usa `BreatheVisual` animado.
2. **Los 15 glifos por lados** (`docs/product/GLIFOS_ENCARGO_TANDA.md` §3): el
   usuario aún no ha decidido si los dibuja por duplicado. **Ojo, y está medido:
   hoy la app NO puede enseñar un glifo distinto por lado** — el mapa va por
   identidad, sin noción de lado, y el runner (que sí sabe por cuál va) no se lo
   pasa al glifo. Es un cambio pequeño, pero hay que hacerlo ANTES de que entre el
   arte o la mitad no se vería.
3. **`Puente torácico`** entró con silla en esta tanda; conviene **mirarlo a tamaño
   real** porque su versión anterior no era «le falta la silla» sino otra postura.

---

## 5 · Documentación pendiente de la 2ª mitad

`CHANGELOG.md` y `STATE.md` describen **solo la primera mitad** de s171 (miniaturas,
círculo del legacy, +30 % de escritorio). Falta destilar: la segunda tanda de arte
(47→57), el anclaje por bloque y sus cuatro correcciones. El diario
`docs/sessions/session-171-el-circulo-del-glifo.md` **tampoco** las lleva.

---

## 6 · Commit sugerido (el árbol está sin commitear)

```
feat(glifos+runner): la segunda tanda de arte, y el bloque del runner queda anclado

- 57 de 61 identidades con arte (eran 47): entran 18 dibujos nuevos, 8 de ellos
  con el mueble que les faltaba. Los 39 viejos que sobreviven se recuperaron
  emparejando por CONTENIDO (la numeracion de la hoja de s170 no es reproducible);
  peor pareja 0,849. Geometria: 0 piezas fuera del circulo. precache 199 -> 219.
- El bloque del runner declara alto minimo (70vh movil / 72vh escritorio, con
  suelo de 780/880 px MEDIDO) y el rotulo de fase se reserva vacio: el circulo y
  el nombre dejan de moverse entre pasos de trabajo (eran 43-94 px).
- Queda deuda cruzando fases (~25 px) por el gate «ready», que no pinta contador.
  Asertada con trinquete de 30 px, no anotada.

verify PASA · test:e2e 105/105
```
