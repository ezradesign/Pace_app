# Prompt de arranque · s177

> Copiar y pegar tal cual al abrir la sesión.

---

Arrancamos s177 de PACE. Sigue el protocolo de arranque de `CLAUDE.md` y
confírmame el estado antes de tocar nada.

**Contexto.** s176 cerró en **v0.106.0**, commiteado y pusheado. `npm run verify`
PASA, `npm run test:e2e` da **146/146** y **los 12 mutantes calibrados muerden**.

Lee `docs/HANDOFF_s177.md` ANTES de proponer nada. Y antes de tocar la
biblioteca, el runner, Stats o el sonido, lee las **seis filas de s176** de
`docs/product/DECISIONES_TECNICAS_VIGENTES.md` — una de ellas anula la decisión
de s174 sobre Respira, y otra corrige las cifras de voz que esa misma tabla
llevaba mal.

## LO PRIMERO, y manda sobre todo lo demás

**s176 salió entera de lo que vi al probar, y sus cuatro defectos reprodujeron.**
Pregúntame qué he visto desde entonces antes de proponer plan. Si traigo
defectos, tienen prioridad.

Y hay **dos preguntas mías sin cerrar, las dos ya pintadas y de una línea**:

1. **El aside de familia en Respira.** Elegí E y me corregí a C; se diferencian
   en el rail (que ya está) y en el aside. Está en los marcos **D** y **E** de
   `_maqueta-s176-respira.html` — regenéralo con
   `node scripts/audit/maqueta-s176.autonoma.js` y enséñamelo.
2. **Un tercer chip para Respira**: hoy lleva dos. Si propones «Discreta»
   (14 de 20), **píntalo antes de preguntarme**.

## Cómo quiero que trabajes

- **El diseño se aprueba MIRÁNDOLO, y toda opción que me propongas tiene que
  estar PINTADA antes de preguntarme** — también las alternativas que inventes
  dentro de una pregunta. Maqueta con viewports reales, contenido real del
  catálogo y los tokens de `DESIGN_SYSTEM.md`. **Mi pantalla es 1536 CSS px**
  (1920×1080 al 125 %): a 1920 mis defectos no reproducen.
- **Auditoría antes de tocar.** No reinventes lo que existe.
- **No implementes la opción más sencilla si no es la más profesional y útil.**
- **Verificación medida en cada bloque**: `verify` + `test:e2e`, y **cada aserto
  nuevo se pone ROJO a propósito** — y el mutante tiene que llegar al
  **artefacto**, no sólo a las fuentes, porque la suite corre sobre `index.html`.
  Si un mutante no muerde, dilo y retira el aserto.
- Cuando algo que yo dé por sabido no cuadre con lo que midas, **dímelo con el
  número delante**. En s176 pasó cuatro veces, una de ellas con un número tuyo
  que estuviste a punto de darme mal.
- **Los commits nunca llevan coautoría.**

## Lo que viene, por orden (si no traigo defectos)

1. **Las dos preguntas de arriba.**
2. **FASE 4 · Stats de verdad.** s176 arregló lo que pedí —mismo tamaño, sin
   scroll— pero **eso no es la fase**: el destino de `STATS_DESTINO_PROPUESTA.md`
   sigue entero. Es «el escaparate del free».
3. **La música**, si genero las piezas: los briefs están en
   `docs/product/MUSICA_RESPIRA_BRIEFS.md` y el hueco en Ajustes también.
4. **El arte**: `Rana` y los **19 glifos de logro**. Y **las 18 piezas de la 2ª
   tanda siguen sin mirarse**.
5. **FASE 8 · onboarding contextual.**

## Trampas de s176 que no quiero volver a pagar

- **Un modal medido a medias da el 96 %**, y **«dos lecturas iguales» no basta
  para esperarlo** — la curva se aplana y coinciden a mitad del fundido. Se usa
  `esperarModalAsentado` (`tests/helpers.js`).
- **El preview se abre ENCIMA de la biblioteca**: `querySelector` del modal
  devuelve el de abajo.
- **«Empezar» encuentra el «Empezar foco» de la home** y arranca el Pomodoro.
- **Un `</script>` dentro de un bloque de datos** vacía los iframes sin dar un
  solo error en consola.
- **Toda consulta al DOM de la biblioteca filtra por caja no nula.** Van NUEVE.

## Lo que NO conviene abrir todavía

**Travesías** (van después de reescribir los Caminos), **la sidebar** (636
líneas y ningún diagnóstico), **CTB** (fuera de v1 por escrito) y **Capacitor**
(~4–6 sesiones, detrás de casi todo).
