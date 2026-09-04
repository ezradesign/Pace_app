# Sesión 183 · La auditoría de premisas, y el logro que hablaba en español

> **v0.114.1** · 2026-09-03/04 · sobre v0.114.0 (`32d1ccc`)
>
> Dos entregas: el único defecto medido que quedaba de s182, y una auditoría del
> proyecto entero contra el código. En medio, cinco vueltas de diseño de Stats que
> **no entran en producto** y que están registradas porque cada una cerró una decisión.

---

## 1 · El logro que hablaba en español con la app en inglés

Venía de s181 y estaba **publicado**. Con la app en inglés, la fila del último logro de
la sidebar decía «Regresas» en vez de «You return».

**La causa, y por qué sobrevivió a s167.** `achMini()` devolvía `a.title` crudo del
catálogo. s167 enrutó por `tR()` las dos superficies que **entonces** decían el nombre de
un logro —el panel y el toast— y la sidebar no lo decía: pintaba una rejilla de cinco
sellos **sin texto**, sólo dibujo. **s180 la sustituyó por UNA fila que sí dice el
nombre**, y el hueco se abrió sin que nadie tocara i18n.

**El arreglo.** `achMini(id, tR)` recibe la función por parámetro —es una función suelta,
no un componente, así que no puede llamar a `useT()`— y `SidebarLatestAchievement`
construye el mismo `tR` de tres líneas que ya repiten diez archivos. El secreto sigue
siendo `'?'` y no `ach.seal.secret`: ahí no se oculta una traducción, se oculta el logro.

**El aserto, que había que escribir porque la suite no cubría esto.** Dos tests nuevos en
`tests/logros-i18n.spec.js`, relacionales como sus hermanos: eligen del catálogo **dentro
del artefacto** el primer logro no secreto cuyos títulos ES y EN difieran, y comparan
contra lo que la fila pinta. Ni el id ni las cadenas están escritos a mano.

**Calibrado con dos mutantes, y los dos muerden:**

| mutante | resultado |
|---|---|
| `achMini` devuelve `a.title` crudo | rojo: `Expected "First step" · Received "Primer paso"` |
| el tooltip sale de `ultimo.id` en vez de `mini.title` | rojo **por los dos lados**, EN y ES |

Con el mutante 1 el test en español **sigue verde**, que es lo que demuestra que el par no
se está midiendo a sí mismo.

**Y el gancho es del título, no de la fila** (`data-pace-sidebar-ultimo-titulo`): el
`textContent` de la fila arrastra también el glifo cuando es un carácter (`↻`, `☾`, `III`),
y un aserto de igualdad exacta mediría dos cosas a la vez.

---

## 2 · Stats: cinco vueltas de diseño, cero líneas en producto

El usuario eligió la Fase 4 y pidió pintar antes de construir. **No se implementó nada**, y
la razón está dicha: el diseño no le convenció. Lo que sí queda son **decisiones cerradas**
y una página de revisión con todo medido.

Revisión: **https://claude.ai/code/artifact/ed6f4e5b-e5cf-4e0f-8cc1-0fb015862bbf**

### Lo que se decidió por el camino

1. **«Hoy» NO entra.** «La pestaña de hoy no va a existir, ya está en la sidebar.» Esto
   **anula el §4.1 y el §37.4** de `STATS_DESTINO_PROPUESTA.md`, y es coherente con la D3
   de ese mismo documento: no puede haber dos superficies contestando «cómo va mi día». La
   Fase 4 se queda en **una sola vista**, la Semana.
2. **La vista no se rehace.** «¿No se puede aprovechar nada del diseño viejo? Tampoco me
   disgustaba, simplemente era un poco difícil de interpretar las barras.» Se tiraron tres
   rediseños completos ya pintados.
3. **La barra: cinta escalonada.**
4. **El día: arco por tipo de jornada, con relleno** — de cuatro familias (cuadrada,
   redonda, anillos, trazo) salió el trazo, y de sus cuatro afinados, el que dice qué
   *tipo* de jornada fue en vez de enumerar ámbitos.
5. **Los Caminos no entran de momento** y su pestaña se queda donde está.

### El defecto de la barra actual, nombrado

**El valor va en el GROSOR de la línea.** Una barra de 2 min y otra de 100 se distinguen
sólo en lo gorda que es, y las finas desaparecen contra el papel. Ninguna otra pieza de PACE
codifica así. Arrastra cuatro consecuencias: no hay línea de base, el cero y el casi-cero se
dibujan igual, la cifra sólo aparece a veces y flotando, y los rótulos de día se repiten
cuatro veces — **28 etiquetas para 7 días**.

### Cuatro cosas que aprendí midiendo, y que valen fuera de Stats

**El suelo de 385 de s176 se calibró sobre la nada.** `tests/stats-pestanas.spec.js` siembra
el estado vacío, así que su verde no dice nada del panel con datos. Con un año de uso
sembrado, a 1536×714: «Semana» **se corta 33 px** —lo causa la línea de retención de s166,
que sólo ve quien practica apnea— y «Caminos» de **60 a 146** según cuántos Caminos haya. A
1920×1080 no se corta pero las cuatro pestañas dejan de medir lo mismo: **59,5 px de salto**.

**Mi propia maqueta proponía el defecto que denunciaba.** La primera «Semana» medía **432 px**
sobre un suelo de 385. Se arregló usando el ancho en vez de apilar.

**Dos rejillas de siete que no se alinean sólo se ven mirándolas.** La tira del ritmo iba a
todo lo ancho y las barras dentro de una columna: ninguna medida lo habría cazado.

**Y el banco volvió a mentir por lo mismo de siempre.** La primera tabla daba «Semana» a
**1192,3 px** de ancho donde las otras tres daban 1240 — el **96 % exacto**, o sea el
`scale(.96)` de la entrada del modal. Es la trampa que s176 dejó escrita: `getAnimations()`
no estima, pregunta. **Una tabla que se contradice a sí misma es la señal.**

---

## 3 · La auditoría de premisas

Encargo del usuario: «audita todo el proyecto para detectar premisas obsoletas, saber qué
tareas vamos a hacer y avanzar de manera ordenada».

Documento completo con evidencia: [`audit-premisas-v0.114.0.md`](../audits/audit-premisas-v0.114.0.md).

**Se reutilizaron los dos checkers de s178** en vez de inventar otros —cero símbolos
inertes, 16 filas sospechosas de las clases que s178 ya declaró falsos positivos— y el
trabajo se centró en **la clase que aquellos instrumentos declararon no poder ver**: una
decisión cuyo símbolo sigue vivo pero que ya describe mal lo que el código hace.

### Los ocho hallazgos, en corto

| | premisa | medido |
|---|---|---|
| **A** | `CLAUDE.md`: árbol de `app/` con 14 carpetas · `WeeklyStats.jsx` · dato de Estira en `ExtraModule.jsx` · «65 tests, ~25 s» | **19** carpetas · no existe · vive en `extra.data.js` + `.piernas.js` · **187 tests, 3,1 min** |
| **B** | `CONTENT.md` refleja «v0.37.0» y da Estira a 14 | **v0.114.0** y Estira **17** |
| **C** | `EVENTOS_SCHEMA.md`: «ninguna parte se ha cableado» | 5 archivos, **1.453 líneas**, 4 emisores, 5 specs |
| **D** | Fase 8.5: trocear `tokens.css` 613, `exercise-glyphs` 513, `Sidebar` 510 | **322 · 261 · 318** — y de 239 archivos ninguno pasa de 500 |
| **E** | «los briefs de música necesitan el requisito que faltaba» | **contradicen** ese requisito, y esa contradicción es la causa medida en s177 |
| **F** | `STATS_DESTINO`: «Hoy» de entrada · su Fase 2 pendiente | anulado hoy · **hecha** desde s155/s172 |
| **G** | `stats-pestanas.spec.js` en verde | verde **sobre el estado vacío** |
| **H** | «106 logros» | **96** · 88 con detector · 88 el denominador |

**El más peligroso es E**, porque alimenta a un generador: `MUSICA_RESPIRA_BRIEFS.md` pide
«rango medio despejado (≈200 Hz–3 kHz)» en cinco de sus seis prompts, y la decisión de s177
que GOBIERNA pide justo lo contrario —«el grueso de la energía entre 200 Hz y 2 kHz»— porque
midió que aquella restricción **era la causa** de que la pieza no sonara. **Quien genere
música hoy reproduce el defecto de s177.**

**Y A3 es la tercera vez que ese párrafo miente**: s176 corrigió los ids y cruzó las rutas;
s178 arregló las rutas y **el troceo del mismo día** volvió a dejarlas obsoletas.

### Lo que NO está obsoleto, para que nadie lo reabra

El BreakMenu efectivamente sólo ordena (`computeScore` mira sólo `plan` y `water`) ·
`routineFeedback` sigue sin consumidor de recomendación · el onboarding sigue sin focus
trap · la lista de archivar de s130 sí se ejecutó · la voz de Respira está entregada, con 6
archivos en disco, y de música hay **una sola pieza** de las seis.

### Tanda 0, ejecutada aquí

Corregidos `CLAUDE.md`, `EVENTOS_SCHEMA.md`, `ROADMAP.md`, `STATS_DESTINO_PROPUESTA.md` y
`CONTENT.md`. **Lo que no hace:** rehacer `CONTENT.md` ficha a ficha; sólo declara la deriva
y dice qué cifra manda.

---

## 4 · Trampas medidas en esta sesión

- **Cité el verify en «18,9 s» y al re-medirlo dio 11,4.** Oscila con la carga de la
  máquina, así que en `CLAUDE.md` va como **rango**. Un número que se mueve un 65 % no se
  escribe como si fuera fijo.
- **Mi propia auditoría citó mal una línea**: dijo que `CONTENT.md:158` daba Estira a 14, y
  esa línea habla de **Mueve**, donde 14 es correcto. Corregido en el documento. Con los ids
  cruzados, una cita mal atribuida es el error que este proyecto ya ha cometido tres veces.
- **Contar rutinas con `grep` sobre las fuentes da 14 para Estira, no 17**, porque el dato
  vive en dos archivos y uno no se llama como uno esperaría. El número bueno sale de
  **evaluar el objeto** (`verify.integridad.js:427-439`). Es la regla de s182 otra vez.
- **El heredoc de bash volvió a morder** con contenido largo (`unexpected EOF`) y a comerse
  un backslash en una ruta. Los scripts se escriben con la herramienta de escritura.
- **Un marcador de «aquí iba la pieza que se quita» ocupa sitio**, así que las variantes que
  sacrificaban la nota del pie salían infladas y las tres parecían no caber. Lo que falta se
  dice en el texto, no dentro de la medida.
- **Describí en una maqueta un trazo que unía los puntos y no lo había dibujado.** Se pintó.
  Lo que el texto promete tiene que estar en el dibujo.

---

## 5 · Estado al cerrar

| | |
|---|---|
| Versión | **v0.114.1** |
| `npm run verify` | PASA · 0 problemas |
| `npm run test:e2e` | **187/187** sobre el artefacto regenerado |
| CI de v0.114.0 | **verde**, comprobado con `gh run list` (cierra la duda del handoff de s182) |
| Artefactos | `index.html` al día · `PACE_standalone.html` intacto |
