# PACE · Decisiones de evolución de producto

> **GOBIERNA — nivel 2 (ejecución destilada).** Índice de autoridad:
> [`AUDITORIA_DOCUMENTAL.md`](./AUDITORIA_DOCUMENTAL.md).
>
> **Canónico de la evolución post-v0.51.0.** Destilado de los documentos de
> evolución ([`docs/archive/PACE_EVOLUTION_CONTEXT.md`](../archive/PACE_EVOLUTION_CONTEXT.md)
> —ARCHIVADO en s130, no gobierna— + 2 bloques de ideas, 2026-07)
> contrastados con el código real en
> [`audit-evolucion-v0.51.0`](../audits/audit-evolucion-v0.51.0.md).
> Las sesiones que toquen contenido, actividades, Caminos, stats o el plan
> de evolución leen **este archivo**, no los documentos originales ni la
> auditoría completa. Se actualiza al cerrar cada sesión del plan
> (sustituir, no acumular — mismo contrato que STATE.md).
>
> **Jerarquía:** la dirección integral de producto vive en
> [`AUDITORIA_SISTEMA_PACE.md`](./AUDITORIA_SISTEMA_PACE.md) (nivel 1, el «qué/por
> qué»); este archivo destila el «cómo/cuándo» ejecutable (nivel 2); `STATE.md` fija
> el presente + siguiente sesión (nivel 3). Si el audit y este archivo divergen en una
> decisión de producto, gana el audit; en detalle de ejecución, gana este archivo.

---

## Decisiones tomadas (2026-07-16, sesión de auditoría)

1. **Apnea — retirar.** Fuera los 3 logros secretos `secret.breath.hold.60/90/120`
   y la cifra-récord del hold (160 px). La retención pasa a guía calmada con
   salida siempre visible. Se sustituyen por 3 secretos de exploración sin
   marca temporal.
2. **Calendario — B1+B2 antes de s107.** El saneamiento y los fundamentos se
   insertan antes de seguir el plan maestro (ROADMAP). La pre-venta se
   retrasa ~3-4 sesiones; After Pomodoro y la taxonomía nacen sobre el
   contrato nuevo.
3. **Stats Free/Premium — dirección fijada** (implementación en la sesión de
   licencia, no antes): Free = resumen de Hoy + tira de 7 días + export y
   borrado siempre gratis. Premium = mes, año, patrones, «qué te ayuda»,
   comparaciones contigo mismo. Premium bloquea interpretación, nunca
   propiedad de los datos. Copy: «Free te ayuda hoy · Premium te ayuda a
   entender tu ritmo».
   **AMPLIADO s129** → el destino completo del panel está especificado en
   [`STATS_DESTINO_PROPUESTA.md`](./STATS_DESTINO_PROPUESTA.md) (diseño, docs-only).
   Decisiones nuevas del usuario: **tipos de jornada DEDUCIDOS** de lo que hubo
   (cualitativos, sin puntuar, aplicables al histórico ya guardado) · la **pestaña
   Caminos se INTEGRA** en Hoy y Semana y su progreso profundo va a premium · la
   **sidebar** se decide al repensarla (§14), con Stats como fuente única. **HECHO en s180/v0.111.0**: la sidebar se repensó entera y no duplica ningún
   cálculo -- todo sale de `weeklyStats`, `water`, `streak` y `achievements` con
   las mismas reglas (índice lunes-primero de s69, «el agua sola no enciende el
   día»), en `app/shell/Sidebar.selectors.js`. Fases:
   **0** marco de altura estable (agnóstico al contenido, ejecutable ya) · **1** Hoy
   + Semana sin eventos · **2** `pace.events.v1` · **3** licencia (re-gating de
   Mes/Año + «Qué te ayuda»). Se retiran `computeDayScore` como criterio de color y
   las rachas de PathStats (§37.3).
4. **Descartado definitivamente:** renombrar `extra.*`→`stretch.*` (IDs
   persistidos, swap s14 blindado) · vídeo/fotografía de ejercicios · IA en
   producto · Travesías (12-21 etapas) por ahora.
5. **Contrato de pasos v1 aprobado** (ver B2) con fallback total al formato
   actual.

---

## Home · claridad UX (s122 · v0.65.0)

Pieza **A (claridad)** de [`HOME_REDISENO_PROPUESTA.md`](./HOME_REDISENO_PROPUESTA.md).
Objetivo: que una persona entienda la home sin explicaciones. Lo APLICADO:

- **§1 jerarquía:** Camino sugerido POR ENCIMA de Actividades (Timer → Camino →
  Actividades); actividades como accesos manuales secundarios.
- **§3 tarjeta de Camino:** eyebrow «CAMINO SUGERIDO/FAVORITO · ~N min» (duración
  aproximada calculada de los pasos) + **línea de texto «Rutina guiada · N pasos»**
  (explica qué es un Camino y su composición sin depender de iconos) + iconos de
  acento + CTA propio «Iniciar camino» en **contorno** (secundario; el único CTA
  primario es el timer). La auditoría de coherencia añadió el texto y bajó el CTA a
  contorno; el usuario había pedido iconos para la secuencia, no eliminar el texto.
- **§4 timer:** rótulo **«FOCO MANUAL»/«MANUAL FOCUS» DENTRO del círculo** (no una
  línea suelta — decisión del usuario, para no encoger el aro); el aro conserva su
  tamaño «sol amaneciendo» (~70-80% visible).
- **§5 actividades:** ya eran botones de ancho completo; quedan al fondo como
  secundarias.
- **§6 a11y:** los 3 iconos superiores ya tenían `aria-label`; `:focus-visible`
  global; áreas táctiles de las tarjetas OK.
- **Sistema verbal** (rompe la colisión «Comenzar»): timer «Empezar foco», Camino
  «Iniciar camino», biblioteca «Ver caminos». EN: «Start focus / Start path /
  Browse paths». Cada verbo = su consecuencia.
- **§0 solapamiento editorial «sol» (s122) — SUPERADO por el modelo «atardecer» de
  s123.** En s122 fue un `transform: translateY(-118px)` con gate binario ≥760px + un
  swap por `order` en ancho+corto. La prueba real destapó que ese swap rompía la
  jerarquía y el `overflow:hidden` recortaba el aro → ver la sección s123.

**PENDIENTE (tras s122):**
- **Prueba real** con una persona sin explicaciones (la hizo el usuario tras s122 → el
  modelo responsive de s123 salió de ahí).
- **§7**: pills Tweaks + estabilidad del contenedor de Estadísticas.

---

## Home · modelo «atardecer» responsive (s123 · v0.66.0)

La prueba real de s122 destapó una **regresión bloqueante** (el swap por `order` ponía
Actividades antes que Camino en ancho+corto; el `overflow:hidden` recortaba la base del
aro). s123 reencuadró la sesión (el timer editorial pasa a s124) y resolvió la parte de
§0 **sensible a la altura**. Decisiones canónicas:

- **Jerarquía INVARIANTE** Timer → Camino → Actividades = orden del DOM. **Prohibido
  `order`** para intercambiar secciones en cualquier viewport (el swap de s122 se eliminó).
- **Aro por altura útil, mínimo GENEROSO** (`min(86vw, 520px, max(300px, 58dvh))`): NO se
  encoge agresivamente para que todo entre por encima del fold — se **prefiere scroll
  vertical**. Nunca reducir aro/tipografía/CTA/objetivos táctiles para evitar scroll.
- **«Atardecer» SIEMPRE presente y PROGRESIVO** (no un gate binario): la tarjeta cruza el
  arco inferior del aro con `margin-top` negativo adaptativo hasta el **19% del diámetro**
  donde hay holgura, **mínimo pero visible** en pantallas bajas, **nunca tapando** CTA /
  bolas / CICLO (≥8px de holgura). El «sol/horizonte» existe en todos los viewports.
- **Barra de scroll OCULTA** en la home conservando el scroll funcional (rueda/trackpad/
  gesto/teclado; el foco de teclado autodesplaza). Ninguna barra vertical antiestética;
  ningún `overflow:hidden` que oculte contenido; un solo contenedor scrollable.

Detalle técnico (variables, fórmulas, el porqué del `margin` negativo ahora sí) en
`DESIGN_SYSTEM.md` → «Modelo atardecer de la home». HOME_REDISENO_PROPUESTA sigue siendo
el canónico del DISEÑO editorial; §0 «sensible a la altura» ya implementado en s123.

**PENDIENTE (tras s123):** ~~**s124** timer editorial~~ (HECHO) · ~~**s125** scrollbar del
runner v1~~ (HECHO) · §7 · ~~trocear `FocusTimer.jsx`~~ (hecho en s124, 449 ln).

> **Vigencia (s126 · v0.69.0):** en **Desktop (≥769px)** las reglas ejecutables de arriba
> quedan **SUPERADAS** por «Home Desktop · composición proporcional y horizonte» (más
> abajo): el aro ya no se dimensiona con `min(86vw,520px,max(300px,58dvh))` sino por altura
> disponible, y el solapamiento deja de ser el `margin-top` negativo adaptativo hasta el
> 19 % para ser un 16 % nominal con recorte del aro. **En móvil/tablet (≤768px) el modelo
> «atardecer» de s123 sigue INTACTO y vigente tal cual está descrito aquí.** La jerarquía
> invariante y la barra de scroll oculta siguen vigentes en todos los viewports.

---

## Home Desktop · composición proporcional y horizonte (s126 · v0.69.0)

Contrato **ejecutable** para la home en Desktop (≥769px). En móvil/tablet manda s123.

- **Jerarquía invariante** (heredada de s123): Timer → Camino → Actividades es el orden del
  DOM. En Desktop la composición de referencia coloca las Actividades bajo el aro y el
  Camino al fondo mediante `order` **visual**, sin alterar el DOM.
- **El Pomodoro es una composición proporcional.** D (diámetro) es la unidad base y el
  interior escala con él. **D lo manda la ALTURA disponible**: arranca en
  `min(0.42·W, 520px)` y encoge hasta que no hay scroll (suelo 205px). Fijarlo por ancho
  confundía causa con efecto — en la referencia v0.64 la proporción 0.255·W era
  CONSECUENCIA de la altura (`flex:1 + 56vh`).
- **Sol amaneciendo, con recorte real.** Las Actividades solapan el arco inferior y el aro
  se **recorta** en esa línea (`clip-path` sobre el marco del aro, no sobre el `<svg>`, que
  va rotado). Es la composición buscada, no el accidente de `overflow:hidden` de v0.64 que
  s123 corrigió.
- **Solapamiento nominal 16 % de D**, aceptación 0.14–0.17, medido como
  `(circleRect.bottom − activitiesRect.top) / circleRect.height`. El CICLO medido actúa solo
  de **techo de seguridad**: el horizonte nunca sube por encima de los puntos de ciclo.
- **Suelo de accesibilidad intocable**: CTA de 44×44 CSS px. Nunca se encoge para ganar
  altura; antes se degrada el solapamiento que tapar el CICLO o achicar el botón.
- **En alturas cortas se recupera AIRE, no contenido.** Por debajo de 700px de alto se
  compacta progresivamente el presupuesto vertical exterior (TopBar, huecos del selector de
  minutos, paddings de Actividades y de la tarjeta) y lo liberado va íntegro al diámetro del
  aro. **Nunca se tocan textos, tamaños de fuente ni glifos.** Por encima de 700px la
  compactación es cero. Esto es lo que hace que una pantalla de 1366×768 —cuyo viewport real
  ronda los 610px por el chrome del navegador— conserve la composición. Límite residual en
  `AUDITORIA_SISTEMA_PACE.md` §32.6.
- **Consecuencia asumida**: con el timer en marcha, el arco de progreso y el punto guía
  quedan ocultos bajo el horizonte (~94° de aro, ~37–63 % de la sesión). Decisión explícita
  del usuario (corte duro, descartado el desvanecido), igual que en la referencia v0.64.
- **El copy NO se revierte**: de la captura v0.64 se toma SOLO la geometría. Siguen vigentes
  las decisiones de s122/s124 («FOCO MANUAL», «Empezar foco», «CICLO 1 / 4», «Ver caminos»,
  eyebrow «CAMINO SUGERIDO»).

Detalle e implementación en [`session-126`](../sessions/session-126-home-desktop-horizonte.md).

---

## Foco · timer editorial (s124 · v0.67.0)

El temporizador de Foco deja de ser un cronómetro mudo con un descriptor fijo y pasa a
tener **voz editorial por duración** y **estados coherentes**, SIN tocar la contabilidad
(delta cero: minutos, `state.cycle`, logros, notificaciones, menú post-Pomodoro,
persistencia y el motor `useCountdown` intactos). Decisiones canónicas:

- **Descriptor de Foco por DURACIÓN** (sustituye al fijo «Concentración profunda»): el
  subtítulo del timer nombra el TIPO de sesión según los minutos elegidos, dando intención
  a cada duración. Mapa editorial (ES / EN), tramos inclusivos:

  | Duración   | ES                     | EN                  |
  |------------|------------------------|---------------------|
  | 1–19 min   | Foco breve             | Quick focus         |
  | 20–29 min  | Concentración profunda | Deep focus          |
  | 30–44 min  | Atención sostenida     | Sustained attention |
  | 45–59 min  | Trabajo en profundidad | Deep work           |
  | 60+ min    | Sesión extendida       | Extended session    |

  La lógica vive en un helper PURO `getFocusDescriptorKey(minutes)` (devuelve solo la key
  i18n; fallback 25 si no es finito) compartido por el timer de la home y el Foco dentro de
  un Camino (que ya lo usa como nombre del paso, según `step.min`). Las PAUSAS conservan su
  copy propio (el descriptor solo aplica a modo foco).
- **CTA sin iconos**: cápsula RELLENA serif itálica, coherente con el tono artesanal (fuera
  los glifos `▶`/`❚❚`). El estado running («Pausar») baja a contorno (menos primario).
- **El ciclo terminado ya no deja un botón muerto**: al completar, «Empezar otro ciclo»
  arranca un bloque nuevo del mismo preset (feedback «Ciclo completado» en el propio slot
  del subtítulo, sin añadir bloques que empujen el layout). Es presentación + recuperación,
  NO contabilidad: iniciar otro ciclo no acredita ni incrementa nada.
- **Reset como acción secundaria discreta**: solo aparece cuando tiene sentido (en pausa),
  como texto («Reiniciar bloque»), nunca como botón que compita con el CTA. El «Reiniciar»
  del Foco dentro de un Camino es independiente y no cambia.
- **Ritmo Pomodoro explícito**: «CICLO N / 4» (y «SIGUIENTE · CICLO N / 4» al terminar)
  hace legible dónde estás en el cuarteto, sin gamificación (solo presentación; N derivado
  de `state.cycle`, sin tocar la lógica).

Detalle de controles/estados/tokens en `DESIGN_SYSTEM.md` → «Timer de Foco · controles y
estados».

**PENDIENTE (tras s124):** **s125** scrollbar del runner v1 · §0 solapamiento responsive
<720px · §7 · ola editorial de las 6 rutinas legacy.

---

## Plan de bloques (antes de s107; después sigue el plan maestro)

### B1 · Saneamiento — CERRADO (B1.1 s107/v0.52.0 · B1.2 s108/v0.53.0)

**B1.1 hecho** (s107, 2026-07-16; diario
[session-107](../sessions/session-107-b1-saneamiento.md)):
`parseLocalDateKey()` + fix `computePathStreaks` + regla #10 CLAUDE.md
(migrar `lastActiveDay` a ISO sigue POSPUESTO) · contador de logros
dinámico (/106) · «acciones» del año retirada → «días con ritmo» real
(+ tooltip «intensidad {n}», coherencia no aprobada en bloque — revisable) ·
sendero del día abstracto · acento de Estira por `kind` en MoveSession ·
BreatheVisual transición = duración de fase (<2 s → 85 % + ease-in-out) ·
7 duraciones recalibradas (2/4/3/4/5/4/2; CONTENT.md alineado) · apnea
retirada (hold = guía calmada; sustitutos `secret.bilingual` /
`secret.backup` / `secret.safety.read` con detector) · claims de Respira
orientativos ES+EN.

**B1.2 hecho** (s108, 2026-07-16; diario
[session-108](../sessions/session-108-b1-2-editorial-seguridad.md)):
editorial de seguridad ES+EN completo con criterio BASE §7-9 + memoria
`feedback-realismo-ejercicios` — «al fallo»/«al límite»/«más bajo si
puedes»/«aguanta» secos/«al máximo» reescritos (reps limpias, respiración
normal, mantener con condición técnica) · «el hombro nace para colgar» y
el «marco» de puerta → «barra firme que soporte tu peso» ·
«indestructibles» fuera (desc ATG + EN `Knees over toes` + logro) · chin
tuck sin «papada» (4 sitios) · tag `PULL`→`PUSH` en fondos · **Dead hang ·
opcional** con alternativa en cue (decisión del usuario: opcional, no
fuera; key de glifo renombrada en sincronía) · 12 descs anuncian
suelo/pared/barra firme/silla estable sin ruedas · **curación
Respira·Energía**: Bhastrika (PRA) → grupo Pranayama y `rounds.express` a
FREE · **defaults opt-out**: `soundOn:true` + `notifyFocusEnd:true`
(instalaciones nuevas; permiso en el primer «Comenzar» de Foco, denegar
apaga el flag). Extras §9 incluidos por decisión del usuario; el «Aguanta
10 segundos, suelta» de Glúteos invisibles se conservó (estructura, no
competición). **Regla viva: el contenido nuevo (B2+) nace ya con este
lenguaje.**

**Feedback s107-cierre pendiente de rutar** (registrado también en STATE):
**salir de un Camino a la home**: el «×» del paso avanza al siguiente
(diseño s99) y en móvil no existe Esc → hace falta vía táctil explícita de
abandono · visual de Respira **«Loto»** (PNG del usuario como estilo NUEVO
de tweak, sin retirar «flor»; falta el PNG en el repo) · **láminas de
Caminos en más resolución** (el usuario las tiene; re-ingesta con
`ingest-lamina.js` — REGLA D-4: re-medir, jamás swap directo del asset).
Los defaults de audio/aviso quedaron HECHOS en B1.2.

### B2 · Fundamentos (2-3 sesiones)

> **Base de conocimiento offline** (usuario, s107-cierre):
> [`BASE_MUEVE_ESTIRA.md`](./BASE_MUEVE_ESTIRA.md) — NHS/ACSM/OMS
> traducidas a reglas de PACE. Gobierna B2 y el editorial: unidad por tipo
> (fuerza=reps · movilidad=ciclos · estático/isometría=tiempo por lado ·
> postural=reps+retención) · duración CALCULADA (setup+activo+lados+
> transiciones+descansos+cierre) · runner por modo (timer nunca arranca
> mientras se lee la colocación; reps terminan en manual) · explicación
> mínima de 6 partes · molestia≠esfuerzo≠dolor · rangos de producto ·
> **auditoría ejercicio-a-ejercicio con ficha ANTES de tocar código**.

**B2.1 auditoría — HECHA** (s109, 2026-07-16; diario
[session-109](../sessions/session-109-b2-1-auditoria-ejercicios.md); tabla
[`audit-b2-ejercicios-v0.53.0.md`](../audits/audit-b2-ejercicios-v0.53.0.md)).
28 rutinas + 66 fichas §11 auditadas SIN tocar código. Hallazgos clave:
**R1-R5 del runner** (prep sin colocación por paso · auto-avance sin
«Terminé» · sin cambio de lado · **stats acreditan `routine.min` declarado,
no el real** · descansos sin tipar) que se arreglan UNA vez en el contrato
v1. Contenido: reps encerradas en timer (100 % de la fuerza de Mueve) ·
estáticos sin tiempo por lado · transiciones invisibles (11 rutinas) ·
declarado ≠ real (19/28) · el **Pigeon de `move.hips.5`** es imposible
(«40s/lado» en `dur:60`) y vive en `path.midday` free. **Decisiones de la
tabla:** 0 retirar · reescribir 4 cues + 2 rutinas (`legs.single`,
`atg.knees`) · **revisar con fisioterapeuta 4** (Nordics, Sissy squat, Fondos
en silla, Couch stretch) · unificar 4 duplicados vía `visualId` · **sustituir
Nordics** en `move.atg.knees` (degustado gratis en `path.weekend`). **Piloto
v1 propuesto (6):** diafragmática + coherente 5·5 + desk.pushups + chair.squats
+ neck.3 + chair.antidote (suplente `move.hips.5`) — cubren biblioteca Y runner
de Caminos. **Pendiente de aprobación antes de B2.2:** la tabla completa, las
4 fichas de fisio, la sustitución de Nordics y si `path.weekend` cambia de
degustación.

**B2.2a — HECHA** (s110, 2026-07-17; v0.54.0; diario
[session-110](../sessions/session-110-b2-2a-contrato-pasos.md)). Decisiones
resueltas antes de código (AskUserQuestion): fichas fisio → B4 · **Nordics
sustituido** por «Puente isquio a una pierna» en `move.atg.knees`,
`path.weekend` **intacto** · 6 pilotos confirmados · corte visualId+contrato
hoy / resto mañana.

- **`visualId` + mapa de alias — HECHO**: `exercise-aliases.js`
  (`resolveVisualId`) unifica 4 duplicados de glifo; `step.name` ES sigue
  resolviendo, NO se toca localStorage. Rib pull NO unificado (caso
  reescribir). El renombrado EN→ES de títulos queda para una ola de contenido.
- **Contrato de pasos v1 — HECHO (pilotado)**: `mode: timed | reps | perSide
  | rest`, fallback `sin mode → legacy`. `MoveSessionV1.jsx` (runner por modo)
  + `MoveSession` dispatcher. **R1-R5** resueltos: placement gate por paso ·
  reps con «Terminé» · cambio de lado real · **minutos reales** (no
  `routine.min`, ambos runners) · rest tipado. Pilotos: `desk.pushups`,
  `chair.squats`, `neck.3`, `chair.antidote` (2 Respira = control `timed`
  conceptual). `transition`/`manual` reservados (ningún piloto los usa; el
  cambio de posición lo absorbe el placement gate). Split `MOVE_ROUTINES` →
  `move.data.js` (MoveModule 451→331 ln).

**B2.2 método — HECHO** (s111, 2026-07-17; v0.55.0; diario
[session-111](../sessions/session-111-b2-metodo-runner.md)). Refina el
**método** del runner v1 (feedback de cierre s110: demasiado gatillado), sin
contenido nuevo. Decisiones (AskUserQuestion): gate «auto + condicional» ·
reps «objetivo suave + Terminé siempre» · corte «solo el método».

- **Gate de colocación**: deja de exigir tap → **cuenta-atrás que fluye sola**
  («Colócate… 5·4·3·2·1» → arranca el reloj al 0) con «Empezar ya» (salta) +
  «Más tiempo» (+5 s). **Condicional derivado del `mode`** (sin metadatos):
  solo `timed`/`perSide` e **idx>0** — `reps`/`rest` fluyen directos y el paso 0
  hereda el prep 3·2·1 (evita la doble cuenta). **R1 intacto** (la cuenta es de
  colocación, no el timer). `step.setup` por paso queda disponible (sin uso) para
  colocaciones largas suelo/pared → refinar en B2.2b con los metadatos.
- **Reps**: el número deja de leerse como cuota (label «reps · a tu ritmo»);
  «Terminé» avanza en cualquier momento, sin botón +/−. **R2 intacto**.
- Solo `MoveSessionV1.jsx` + `strings/sessions.js` (4 keys). Runner legacy y
  `step.name` intactos.

**B2.2a.5 — HECHA** (s112, 2026-07-18; v0.56.0; diario
[session-112](../sessions/session-112-b2-2a5-afinado-ux-runner.md)). Auditoría
runtime con entregable ANTES de código (3×P1: primaria recortada sin scroll en
poca altura · copy funcional oculto en móvil por el hint del shell · lado
destino invisible) + corte aprobado por AskUserQuestion:

- **Setup con tres modos** (aprobado): `setup:'ready'` por paso = «Colócate»
  SIN cuenta + única primaria «Estoy listo» → directo a work (cualquier mode,
  incluso paso 0); `setup:número` = segundos del gate auto; sin `setup` →
  derivación s111. `ready` declarado en Flexor/WGS de `chair.antidote`.
- **Jerarquía visual B** (aprobada): kicker único · copy funcional VISIBLE
  («Empiezas por: {lado}» / «Ahora: Derecha») · gate con identidad propia ·
  glifo escalado por altura · UNA primaria rellena · SessionShell con centro
  scrollable (footer siempre accesible) · toasts aplazados en sesiones.
- **5º piloto**: `move.couch.stretch` (estático pared/suelo, perSide+ready).
- **Welcome auditada: CUMPLE el contrato** («Entiendo → Me sirve → Empiezo»);
  solo micro-fix de espaciado (pregunta 1 en 360×640). Sin más cambios.
- Diseño pendiente: diagramas de dos poses (los itera el usuario, D-4;
  candidatos Flexiones inclinadas + Flexor de cadera).

**GIRO — runner guiado (s113 motor HECHA · s114 capa editorial HECHA →
**GIRO CERRADO** 2026-07-21; decisión del usuario 2026-07-18, post-s112)**. Origen: capturas del usuario + auditoría externa con
navegación (verificó repo=deploy en v0.56.0, commit `2bda34c`). Hallazgos:
scrollbar vertical en pasos de ejercicio (el centro scrollable de s112
desborda en alturas ~600 px) · el runner exige tocar la pantalla continuamente
(gate «Listo» entre lados, «Terminé» como única salida de reps — inviable en
suelo/pared/manos ocupadas) · cues demasiado escuetos para ejecutar con
confianza. **Principio rector nuevo: «el usuario toca para empezar, pausar o
adaptar; NO para empujar la rutina hacia delante»**. B2.2b-1 pasa a DESPUÉS,
alimentado por el comportamiento real.

- **ENMIENDAS registradas** (el usuario es la autoridad; precedente s111
  «matizar BASE por comodidad»):
  - **R2 / BASE §3-A** («las reps nunca auto-avanzan») se matiza: en modo
    guiado, las reps avanzan SOLAS al completar el objetivo con cadencia. Lo
    que se preserva del espíritu: el pacer NO es cuenta atrás competitiva,
    «Terminar antes» siempre visible, y solo se acreditan las reps realmente
    guiadas (nunca el objetivo como resultado).
  - **R3** (gate manual «Cambia de lado» → «Listo», s110): pasa a transición
    AUTOMÁTICA de 8–12 s con señal sonora, pantalla con el cue del lado
    siguiente, y botones opcionales («Empezar ya» / «Más tiempo» / «Pausar»).
  - **«Terminé» (s111)**: deja de ser la única salida; queda como salida
    anticipada dentro del modo guiado.
- **s113 — motor guiado — HECHA** (2026-07-20; v0.57.0; diario
  [session-113](../sessions/session-113-runner-guiado-motor.md)). Decisiones
  de arranque (AskUserQuestion): guiado **SUSTITUYE** al libre · pulso **+
  tick suave** (familia actual, receta `tick`) · transición de lado **10 s**.
  Implementado: reps guiadas (~4 s/rep fuerza; **`step.repSeconds` por paso**
  — chin tucks de neck.3 = 8 s, retención postural; base del `tempo` de
  B2.2b-1; pulso + tick + «n de N» + avance auto; «Terminar antes» + pausa;
  **`repsGuidedRef` acredita solo reps guiadas reales** → lo consume la
  pantalla final de s114) · transición auto de lado 10 s con lado siguiente
  visible (`ready` de s112 sigue siendo el único gate manual) · prep 5 s
  (legacy 3) · rest entre series 30 s + `restKind:'betweenSets'` SOLO pilotos
  (el «Reset respiración» de chair.antidote quedó SIN tipar, con
  comentario-guard) · layout compacto por ALTURA verificado sin scrollbar en
  1280×600 · 1024×512 · 844×390 · 360×640 (tiers 700/560/430 + glifo oculto
  ≤430; scroll solo red de seguridad) · `min` desk.pushups 2→3 (real medido
  3:00-3:25). Extra: fix del warning React «setState durante render»
  (side-effects fuera de los updaters; pre-existía desde s110) + split
  `MoveSessionV1.support.jsx`. Verificado: desk.pushups completo SIN tocar la
  pantalla · cambios de lado automáticos en vivo · reduced-motion · silencio.
- **s114 — capa editorial — HECHA (CIERRA el GIRO)** (2026-07-21; v0.58.0;
  diario [session-114](../sessions/session-114-runner-guiado-editorial.md)). Las
  4 decisiones abiertas se delegaron al criterio profesional (1A meta por
  módulo · 2A aviso también en pasos con reloj · 3A bloque «Sesiones» · 4A
  «Cuídate» siempre visible). Implementado: **instrucciones por capas** en los 5
  pilotos (`placeCue` en colocación · `cue`=shortCue en ejecución · `careCue`
  «Cuídate» siempre visible; `cue` fallback → cero re-indexado EN, solo keys
  nuevas `id.sN.placeCue/careCue`; **colocación AUTO para el 1er set de fuerza**
  —reps con placeCue no tras rest—; lado INTEGRADO en el cue perSide, no kicker)
  · **pantalla final por módulo** (Mueve «Movimiento completado» · Estira
  «Estiramiento completado» → resuelve el P3 `antidoteDone`) con stats honestas
  consumiendo `repsGuidedRef` (tiempo · series · reps guiadas reales; nunca el
  objetivo) · **Tweaks «Sesiones»** `restBetweenSets` 20/30/45 (default 30) SOLO
  en `restKind:'betweenSets'` (cierre respiratorio en 30) + el descanso guía
  («Luego: {serie}» + aviso ~5 s) · **audio SIN voz** (`move.warn` aviso único
  ~5 s en descansos y clocked; `move.side` cambio de lado; familia move 432).
  Verificado dev+standalone: 5 pilotos, delta 0 en los 4 viewports (RE-MEDIDOS),
  legacy intacto, honestidad de reps (Series 3 · Reps 16, no 30).

**B2.2b — DESPUÉS del runner guiado, re-ordenada en cortes** (B2.2b-1
contrato+duración sobre los 5 pilotos — formaliza además `completion.mode`,
`tempo`, `transition`, `restKind`, `instruction.*`, `setup {mode:
none|auto|ready, estimatedSeconds}` con ready≠0 s, y `perSide` sin doble
conteo (dur = POR LADO en los pilotos) → B2.2b-2 feedback → B2.2b-3 eventos
solo diseño; alcance original abajo):

- **B2.2b-1 contrato + duración derivada — HECHA** (s115, 2026-07-21; v0.59.0;
  diario [session-115](../sessions/session-115-b2-2b-1-contrato-duracion.md)).
  Decisiones (AskUserQuestion): migración **atómica** de `instruction.*` (sin
  fallback dual) · duración **solo en la tarjeta** · esquema «ritmo guiado» / «a
  tu ritmo» (manual) aprobado · **5 metadatos** completos. Los 5 pilotos migran
  a `instruction:{setup,action,care}` + `tempo:{down,hold,up}` (suma = seg/rep) +
  `transition:{seconds}` (perSide) + `completion:{mode:'guided'}` + **los dos
  «setup» distintos** `setup:{mode:'ready',estimatedSeconds}` (comportamiento;
  ready nunca countdown) vs `instruction.setup` (copy) + metadatos `position/
  equipment/requiresFloor/intensity/level` (sin `discrete`). `v1StepSetup` es la
  ÚNICA fuente del gate; se retiran placeCue/cue/careCue de los pilotos (`cue`
  legacy intacto). **Fuente única de segundos**: `v1StepWeight` pasa a
  `v1StepDur` (fix: peso de barra ya no diverge con preset 20/45). **Duración
  derivada**: helper PURO `estimateDuration` (perSide dur×2+1 transición; reps
  guided = target×tempo; NO se guarda como dato); la tarjeta muestra el rango en
  rutinas v1, dev-check `min` vs rango de minutos. Retirada `move.repsGuidedHint`.
  Legacy byte-idéntico. **Hallazgo (→ B2.3)**: `couch.stretch` declara min 5 pero
  calcula 6–7 min (único fuera de rango; se conserva `min` como baseline).

- **Metadatos de rutina**: `position / equipment / requiresFloor /
  intensity / level` (base de la taxonomía s108). **SIN `discrete`**
  (decisión s112: semántica ambigua — preferir `execution.mode` +
  `completion`).
- **Duración derivada** de pasos + rangos honestos («3–5 min · a tu ritmo»
  para reps); en dev comparar declarada vs calculada, en prod UNA promesa.
- **Feedback ligero «¿Te ayudó esta pausa?»** (Sí · Un poco · No · Ahora no —
  pregunta y respuestas semánticamente alineadas, s112) — **HECHO s116 (v0.60.0,
  B2.2b-2)**: bloque discreto DENTRO del DONE (fuera de Caminos, solo `stage:
  'done'`), slice `routineFeedback:{[id]:{yes,some,no,lastPromptDay}}` — **conteos
  completos** (NO `{done,helped}`: la decisión s116 supera el shape original para
  conservar la señal «Un poco»; `answered`/`helpScore` se DERIVAN, nunca se
  persisten). «Ahora no» no cuenta pero escribe el día; frecuencia 1×/rutina/día;
  guard de teclado del done. SIN sistema de eventos y **SIN consumidor visible**
  (nada de porcentajes). Alimentará la Pausa PACE y el «qué te ayuda» premium
  cuando lleguen.
- **B2.2b-3 — esquema de eventos (solo DISEÑO) HECHA** (s117, 2026-07-21;
  **solo-docs, sin bump**; diseño canónico [`EVENTOS_SCHEMA.md`](./EVENTOS_SCHEMA.md),
  rev.5, APTO). El P0 de escritura única (single-writer) se resolvió con
  **arquitectura por adaptadores**: modelo canónico backend-independiente
  (envelope/tipos/correlación tipada/orden `{occurredAt,id}`/baseline/retención
  120 d/export = **reemplazo total**) + un **adaptador por runtime** (contrato
  EventStore) — Web/PWA con **Web Locks**, **`file://` no emite** (legacy intacto),
  **Android e iOS (Capacitor)** con **SQLite** nativo + Preferences/UserDefaults.
  **NADA implementado** (cero `state-events.jsx`/EventStore/emisores/adaptadores/
  Capacitor/SQLite): la implementación (Fase 1 web → Fase Android/iOS) va **antes
  de stats premium / licencia**.
- **B2.3 — multi-ola, EN CURSO**. Migrar las rutinas legacy al contrato + las
  reescrituras. Decisión s118 (AskUserQuestion): migración **mecánica** en olas de
  5–6 · **reescrituras aparte** en su propia ola editorial · glifos D-4 sin tocar.
  - **OLA 1 — HECHA** (s118, 2026-07-22; v0.61.0; diario
    [session-118](../sessions/session-118-b2-3-migracion-ola-1.md)): 5 rutinas
    **Mueve** gratuitas sin suelo (`chair.dips`, `calves`, `grip.squeeze`,
    `glutes.stealth`, `posture.set`) migradas — `mode` + `instruction.*` + `tempo`/
    `completion` en reps + `restKind:'betweenSets'` + 5 metadatos; keys EN
    `cue`→`instruction.*`; ningún `name` cambió (glifos intactos). Candidato
    `couch.stretch.min` **5→6** aplicado. Cada `min` DENTRO del rango derivado (sin
    drift). Conteo real: **23** legacy antes de OLA 1 (no 22), **18** tras ella.
  - **OLA 2 — HECHA** (s119, 2026-07-22; v0.62.0; diario
    [session-119](../sessions/session-119-layout-runner-y-b2-3-ola-2.md)): 5 rutinas
    **Estira** gratuitas (`wrists`, `shoulders.5`, `shoulder.circles`, `hips.5`,
    `morning.flow`). Clasificación BASE §3: movilidad/estático central → `timed`,
    estiramiento bilateral → `perSide`+`transition`, fuerza → `reps`, flujo →
    `timed`+`rest` de cierre; **gate `ready`** en pasos de suelo/pared/barra (wall
    slides, dead hang, 90/90, Gato-camello). Migración atómica `instruction.*` +
    keys EN `cue`→`instruction.*`; ningún `name` cambió. Cada `min` dentro de rango
    (dev-check «dentro»). Nota: **precedió FASE A** (pulido de layout del runner v1
    — barra fantasma, anclaje del glifo, warning rep-pulse) para que perSide+copy
    variable de Estira naciera sobre layout estable. **18 → 13** legacy tras OLA 2.
  - **OLA 3 — HECHA** (s120, 2026-07-22; v0.63.0; diario
    [session-120](../sessions/session-120-b2-3-ola-3.md)): 5 rutinas **mixtas**
    (Mueve + Estira): `hang.bar`(P), `core.stealth`(P), `back.desk`(free),
    `spine.waves`(P), `hamstrings`(P). Clasificación BASE §3: aguantes isométricos
    + movilidad → `timed`; estiramiento bilateral (Isquio a una pierna) → `perSide`+
    `transition`; fuerza (Scapular squeeze, **Superman**) → `reps`+`tempo`. Novedad:
    **rests entre holds SUAVES** (sin `restKind`, conservan `dur`, patrón
    glutes.stealth; cue vacío de core.stealth → literal «Suelta.» reutilizado) y
    **Superman `reps`+`ready` sobre suelo — 1ª combinación del catálogo**. Copy
    reutilizado de OLA 1/2 para ejercicios compartidos. Puente torácico
    (`spine.waves`): su escalón de regresión queda a la ola editorial. Cada `min`
    dentro de rango. **13 → 8** legacy tras OLA 3.
    - **Acceso — NO se aplicó intercambio (decisión del usuario, s120).** El corte
      proponía `core.stealth` premium→FREE / `back.desk` FREE→premium para elegir la
      rutina Mueve de entrada, justificándolo con «mantener 1 Mueve free + 6
      premium». Esa cifra describía **solo el subconjunto de 7 Mueve todavía
      legacy**, no el catálogo (real: **8 Mueve free / 6 premium**). El usuario
      decidió **no tocar `access` en s120** (core.stealth sigue premium, back.desk
      free); `canAccessRoutine` intacto; sin cambios en IDs/historial/logros. El
      posible cambio de rutina de entrada se evalúa **aparte** como decisión de
      producto. La distribución del catálogo permanece inalterada.
  - **OLA 4 — HECHA (s121, 2026-07-24; v0.64.0; diario
    [session-121](../sessions/session-121-b2-3-ola-4-cierre-mecanico.md)): CIERRA la
    migración MECÁNICA.** Las **2 ÚNICAS** rutinas legacy que quedaban mecánicamente
    tractables sin tocar copy, dosis, estructura, lateralidad ni escalones:
    `core.plank`(P, min 4) y `wall.sit`(P, 2), ambas **Mueve premium**. Clasificación
    BASE §3: aguantes isométricos (Plancha, Hollow hold, Wall sit) → `timed` con
    `care` de rodillas/altura (adaptación **DERIVADA**, NO cambia dosis); Plancha
    lateral «30 s por lado» en `dur:60` → `perSide` `dur:30` POR LADO (2×30 = 60 =
    **dosis legacy conservada**) + `transition:{seconds:10}`; **rests entre holds
    SUAVES** (sin `restKind`, conservan `dur`; cues legacy «Respira.»/«Suave.»
    preservados **verbatim** — no estaban vacíos); **gate `ready`** en el 1er paso de
    suelo (Plancha) / de pared (Wall sit). **Disciplina de dosis (lección s120):**
    wall.sit conserva **60 s** por tanda; el `care` gradúa la altura, NO la dosis.
    Migración atómica `instruction.*` + keys EN `cue`→`instruction.*`; ningún `name`
    cambió. **Acceso INTACTO** (ambas siguen premium; `canAccessRoutine` sin cambios).
    Cada `min` dentro de rango (dev-check «dentro»: core.plank 250 s [4–5], wall.sit
    175 s [2–3]). **8 → 6** legacy tras OLA 4.
  - **MIGRACIÓN MECÁNICA DE B2.3 CERRADA (s121).** Quedan **6 rutinas legacy
    BLOQUEADAS** por reescritura editorial / progresión técnica / revisión fisio.
    **No son deuda mecánica**; no se abrirá una OLA 5 mecánica salvo que una auditoría
    NUEVA demuestre que alguna puede migrarse sin cambiar copy, dosis, estructura,
    lateralidad ni escalones. Bloqueador concreto por rutina:
    - `push.ladder` → editorial: negativas sin nº de reps + Pica sin escalón.
    - `legs.single` → editorial: reescribir (aritmética imposible + 3/4 avanzados).
    - `desk.quick` → editorial: Seated twist (falta 2º lado).
    - `hips.ground` → editorial: Ground transitions (alternativa «con manos»).
    - `ancestral` → editorial: Ground transitions + Rib pull (identidad).
    - `atg.knees` → editorial + **BLOQUEADA por revisión FISIO de Sissy squat** (B4).
    - \+ pendiente heredado: escalón de regresión de Puente torácico (`spine.waves`).

    **La siguiente sesión (s122) NO es migración**: es CLARIDAD UX de la home
    (HOME_REDISENO_PROPUESTA.md). La ola editorial es s123. **OJO tamaño**:
    `ExtraModule.jsx` a 447 ln → trocear los datos de Estira antes de retomar Estira.

### B3 · s107-109 ampliadas (el plan maestro absorbe)

- **s107**: After Pomodoro / **Pausa PACE** — el BreakMenu recomienda UNA
  rutina concreta con razón explicable + «Otra opción» + «Ahora no» (el menú
  actual queda detrás). Scoring v2 de `getSuggestedPath` (señales aprobadas:
  hora +4 · favorito +3 — `paths.favorite` existe y hoy NO se consulta —
  repetido hoy −4 · ayer −2 · duración compatible +3 · premium bloqueado
  −10/teaser). Home contextual: la SuggestedPathCard se transforma
  temporalmente post-foco (no se añade superficie nueva). Mini-Caminos 2-3
  min. Regla: **una sola recomendación principal a la vez** en la home.
- **s108-109**: taxonomía + primera capa por NECESIDAD (Activarme / Soltar
  cuello y hombros / Sin levantarme…) + segunda por zona · tarjetas
  enriquecidas (beneficio + 3-4 chips legibles: SENTADO/SUELO/SUAVE, fuera
  SIT/SHLD/ATG/ANC) · vista previa de rutina («Necesitarás… / Harás…») ·
  jerarquía instructiva en sesión (capas: prepárate → muévete → nota →
  ajusta; alternativa fácil; el temporizador deja de dominar).

### B4 · Piloto visual dos-poses (tras B3, junto a la revisión de glifos pre-venta)

12 ejercicios prioritarios con diagrama inicio/final + flecha + zona +
apoyo (candidatos: flexiones inclinadas, sentadilla a silla, chin tucks,
flexor de cadera, rotación torácica, apertura de pecho, 90/90, muñecas,
wall slides, cuello y trapecios, calf raises, cadena posterior).
**REGLA s84 intacta**: el usuario dibuja/aprueba, se porta literal. Los
glifos 44×44 actuales se conservan como sellos/miniaturas (identificar ≠
enseñar). SVG animado SOLO si el estático valida.

---

## Pospuesto (no abrir hasta su fase)

- **Eventos** (`schemaVersion`, retención 120 días, agregados permanentes):
  **DISEÑO CERRADO en s117** — [`EVENTOS_SCHEMA.md`](./EVENTOS_SCHEMA.md) (rev.5,
  arquitectura por adaptadores; APTO). Falta **IMPLEMENTAR** (Fase 1 web + Fase
  Android/iOS Capacitor): antes de stats premium / licencia.
- **Re-gating de stats** (decisión 3): sesión de licencia.
- ~~**Sidebar Ahora/Hoy/Repetir/Mis pausas**~~ **HECHO en s180/v0.111.0**, y con
  más de lo que este apunte esperaba: «Hoy» y la racha compacta entraron, pero
  también **«Repetir»**, que sí necesitaba los eventos y ya los tenía -- sale de
  la última `session.completed` de `pace.events.v1`. Lo que **NO** entró es «Mis
  pausas», y la tarjeta **nunca sugiere**: solo puede decir CONTINUAR o REPETIR.
- Rituales personales (extensión del builder F7) · objetivo semanal suave
  («3 de 4 días laborables», va a la sesión de gamificación) · check-in
  «¿cómo llegas?» · portadas de rutina (nivel 2) · migrar `lastActiveDay` a
  ISO · sendero cronológico real (necesita eventos).

## No re-verificar (auditado 2026-07-16 contra v0.51.0)

- Los glifos **NO** se rompen en inglés: los 3 consumidores de
  `ExerciseGlyph` pasan siempre el nombre canónico ES (MoveModule.jsx:414,
  CustomBuilder.jsx:93,139). La hipótesis llegó 2 veces y está refutada.
- Los IDs de rutina son estables; los IDs cruzados módulo↔prefijo (swap
  s14) están blindados en CONTENT.md — **no tocar**.
- `getSuggestedPath` dominado por `lastViewed` es deliberado (s78) y el
  onboarding s106 depende de ello; el scoring v2 lo evoluciona en s107.
- Hallazgos completos con evidencia file:line, tabla de duraciones y
  cobertura de glifos: ver la auditoría enlazada arriba.
