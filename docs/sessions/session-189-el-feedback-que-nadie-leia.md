# s189 · El feedback que nadie leía (v0.120.0)

**Fecha:** 2026-09-16 · **Versión publicada:** v0.120.0 · **Suite:** 224 → **228**

> Encargo: cerrar lo que queda de la **Fase 3.5** haciendo que la pausa lea
> «¿Te ayudó esta pausa?», capturado desde s116 y sin ningún consumidor en
> **veintiocho sesiones**. Lo que apareció por el camino: la pausa proponía la
> **misma rutina dos veces el mismo día**, incluso una que acabas de hacer.

---

## 0 · La auditoría, y lo que midió

El protocolo dice auditar antes de escribir, y aquí había una pregunta previa a
cualquier diseño: **¿da el dato para esto?** `routineFeedback` guarda
`{yes, some, no, lastPromptDay}` por rutina y la pregunta sale **una vez por
rutina y día local**. Antes de decidir nada se midió el techo.

**`scripts/audit/banco-feedback-s189.js`** carga los catálogos de verdad y evalúa
el recomendador de verdad (`libraryParaAhora`), no un modelo de ellos:

| Rama de la propuesta | Pozo gratis | Pozo premium | Con aviso (fuera) |
|---|---|---|---|
| Estira · bloque ≥35 min | **11** | 17 | 0 |
| Respira · tercer bloque | **12** | 14 | 6 |
| Mueve · pendiente del plan | **8** | 14 | 0 |

En 30 días se proponen **como mucho 11, 12 u 8 rutinas distintas** (gratis), o
sea que cualquier puntuación de preferencias se calcularía sobre puñados de
respuestas. **Esa medida es la que decidió el diseño**: el «Sí» no ordena nada.

---

## 1 · El defecto que la medida destapó

`libraryParaAhora` rota por **ordinal del día**. Dos días seguidos nunca
coinciden — pero **dos pausas del mismo día comparten el ISO**:

```
pausa 1 (bloque 1) -> Caderas
pausa 2 (bloque 2) -> Caderas     <- antes de s189
```

Y la rama 1 **no mira el plan**: con `plan.extra` ya cumplido hoy seguía
proponiendo la misma. No estaba en el encargo; salió de correr el banco. Es
exactamente el punto **«última pausa»** que el ROADMAP tenía pendiente en la
Fase 3.5, y se arregló aquí porque es el mismo músculo.

---

## 2 · La regla, escrita antes de codificarla

Las cuatro decisiones se le pusieron delante al usuario **con los números
medidos**, y eligió las cuatro recomendaciones:

```
1. VETO       una rutina con «No» y sin ningún «Sí»/«Un poco» sale del pozo
              de la PROPUESTA
2. AMNISTÍA   si el veto vaciara el pozo, se ignora: la rama propone igual
3. ALCANCE    solo la propuesta de la pausa; la biblioteca no cambia
4. EL «SÍ»    no ordena nada; solo impide que un «No» posterior vete
5. ROTACIÓN   día + número de bloque, así dos pausas del día no repiten
```

**Por qué la amnistía, con el número que la justifica.** Sin ella, quien
contesta «No» a todo deja Estira sin pozo en **12 días** (9 en Mueve, gratis) y
a partir de ahí un bloque de 45 minutos sentado acaba proponiéndote **beber
agua**. Antes de enmudecer, se repite una rechazada.

**Por qué «Un poco» cuenta como ayuda.** Es la razón por la que s116 guardó los
tres contadores en vez de un booleano: quien contesta «Un poco» dice que algo
hizo, no que no le sirviera.

---

## 3 · Dónde vive, y por qué ahí

| Pieza | Sitio |
|---|---|
| `breakVetadas(feedback)` — PURA, defensiva | `app/breakmenu/BreakMenu.support.jsx` |
| El veto | En el **predicado** que `breakElige` pasa a `libraryParaAhora`, donde ya vive el filtro de seguridad |
| La amnistía | La **segunda llamada** a `libraryParaAhora`, sin el veto |
| `salto` | Parámetro **opcional** de `libraryParaAhora`; sin él, comportamiento de s174 |

El veto va en un solo sitio a propósito: s187 documentó el defecto de tener el
filtro de seguridad duplicado — probando un extremo no se sabe cuál funciona.
**El `salto` es opcional** para que ninguna biblioteca se mueva: `Sidebar.jsx` y
`LibraryShell.jsx` llaman igual que antes.

**Cero estado nuevo.** El salto sale de `state.cycle`, que ya se pone a cero en
el relevo de día, así que no cruza la medianoche y no hay slice ni migración que
añadir. Y **no se leen eventos**: en `file://` el adaptador es inerte por
diseño, así que una regla basada en `pace.events.v1` se comportaría distinto
según el runtime sin decírselo a nadie.

---

## 4 · La red

| Añadido | Qué defiende |
|---|---|
| **4 tests** en `tests/pausa-propone.spec.js` (6 → 10) | El veto · que el «Sí» y «Un poco» protegen · la amnistía · que dos pausas del día no repiten · **el inglés** |
| El aserto de las **seis pausas** | Que el salto avanza de verdad: si se ignora, seis pausas colapsan en una rutina |
| El primer aserto de la pausa **en inglés** | Hueco declarado en s187. La cadena esperada se **lee de `PACE_STRINGS.en`** dentro del artefacto, no se copia aquí |

**Mutantes: 8, y los 8 muerden** (`scratchpad/mutantes-s189.js`): sin veto · el
«Sí» no protege · «Un poco» cuenta como rechazo · el veto se calcula y no se
pasa · sin amnistía · el salto se ignora en las reglas · el bloque no se pasa
desde la pausa · el copy no se enruta por idioma.

### Dos mutantes que hubo que reescribir, y lo que enseñan

- **El del alcance NO MORDÍA.** Quitar una rutina del catálogo no pone rojo
  `sigueEnElPozo`, porque ese aserto pregunta por la rutina que la regla *acaba
  de proponer*: si desaparece una, la regla propone otra y el aserto sigue
  cierto. Ese aserto **documenta** el alcance, no lo defiende. El seam que sí
  importa es otro: la regla **calcula** el veto y no lo entrega.
- **El del inglés no podía ser el copy.** El test lee la cadena del propio
  artefacto, así que cambiarla no puede ponerlo rojo — y eso es deliberado: un
  aserto relacional defiende el **cableado**, no el texto (s152). El mutante
  real es hacer que la propuesta lea el castellano crudo.

---

## 5 · Lo que NO cubre, dicho

- **Nadie ha respondido nunca a esa pregunta en una instalación real.** Lo medido
  es el **techo** de lo que el sistema puede saber, no lo que sabrá.
- **Móvil**: los cuatro asertos nuevos corren a tamaño de escritorio; el del
  inglés, en el viewport por defecto.
- **El veto no se prueba a través de la UI**: nadie pulsa «No» en el done y
  vuelve a un Pomodoro. Se prueba la regla, que es donde vive.
- **Ni un píxel**: la propuesta no cambia de forma, así que no se volvió a medir
  la altura del modal (el aserto de s187 sigue vigilándola).
- **Lo que sigue pendiente de la Fase 3.5**: zona corporal y el contexto habitual
  (que depende del onboarding contextual de la Fase 8).
