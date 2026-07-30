PACE · Stats destino — especificación de diseño

Estado: DISEÑO. Docs-only, sin bump, CERO código (patrón s117/s109).
Fecha: 2026-07-30 · sesión 129.

REVISIÓN s133 — **el §37 se RE-DECIDIÓ y está CERRADO** (audit §37 bis). Este documento queda
**sin condicionantes** y sus §4.4/§4.5 se confirman. Dos precisiones que vienen de esa ronda:

  · **§4.4 ritmo semanal — CONFIRMADO.** Se retiran racha actual y mejor racha; «días con
    ritmo» sobre la tira de 7, criterio de día activo de s69, hueco neutro.
  · **§4.5 tipos de jornada — CONFIRMADOS** (deducidos, «con Camino» como marca superpuesta) y
    **son el criterio de color de Mes y Año**: `computeDayScore` deja de colorear.
  · **NUEVO, no estaba en este documento**: el equilibrio del día se representa con **tres
    marcas —foco · cuerpo · respiración— SIN nota agregada**; la hidratación acompaña pero no
    es un ámbito. Va en Hoy (§4.2) y alimenta el «equilibrio entre módulos» de Semana (§4.3).
  · **Check-in de cierre CONFIRMADO** como ocasional y ligado a cierres naturales ⇒ sigue en
    la Fase 2 de este documento (requiere eventos).

Historia: entre s130 y s133 el §37 estuvo PROVISIONAL y estas secciones quedaron condicionadas;
la columna vertebral nunca lo estuvo, porque se apoya en §31.4/§31.6, anteriores a esa ronda.
Referencia técnica: v0.71.0 · main · commit 6769203.
Propósito: fijar QUÉ debe ser el panel de Stats antes de tocarlo, para no invertir
trabajo en vistas que el sistema ya ha decidido mover, re-gatear o cambiar de criterio.

Jerarquía de documentos: AUDITORIA_SISTEMA_PACE.md fija el «qué/por qué» de producto;
este archivo lo traduce a un destino ejecutable de Stats; DECISIONES_PRODUCTO.md y
STATE.md fijan el «cómo/cuándo». En conflicto, gobierna el más específico para su ámbito.

--------------------------------------------------------------------------------
1. Por qué existe este documento

La s129 arrancó para ejecutar el ítem «Estabilidad de Stats» del Bloque 0 (§23 del
audit): las 4 pestañas tienen alturas distintas y el salto al cambiar es brusco. Al
auditar el sistema completo antes de implementar apareció el problema de fondo:

  el audit NO pide reestilizar el panel actual, decide un panel DISTINTO.

Dos de las cuatro pestañas actuales salen del panel gratuito (§31.6, §37.4), la
pestaña que debería verse primero NO existe, y dos mecanismos vivos están
explícitamente sustituidos por §37.3. Estabilizar la altura de las cuatro pestañas
de hoy habría sido trabajo real sobre vistas condenadas.

--------------------------------------------------------------------------------
2. Lo que ya estaba cerrado (heredado, no se re-decide)

§31.2 · Stats debe distinguir cuatro dimensiones y no reducir el éxito a minutos,
Pomodoros, días consecutivos ni volumen:
  Actividad (qué hizo) · Resultado percibido (cómo le sentó) · Retorno (regularidad)
  · Equilibrio (foco acompañado de pausas, sedentarismo interrumpido, variedad).

§31.4 · Estructura propuesta: Hoy · Semana · Mes · «Qué te ayuda».

§31.6 + DECISIONES_PRODUCTO.md:30-35 · Reparto Free/Premium:
  Free    = resumen de Hoy + tira de 7 días + datos básicos + export + borrado.
  Premium = mes, año, patrones, «qué te ayuda», comparaciones contigo mismo,
            interpretación de tendencias, progreso profundo de Caminos y Travesías.
  Principio: premium interpreta los datos, nunca se apropia de ellos.
  Condición ya escrita: el re-gating se implementa en la SESIÓN DE LICENCIA, no antes.

§37.1 (M1) · Check-in de cierre OCASIONAL, ligado a cierres naturales; sin check-in
inicial; sin panel de ánimo; máximo 1/día; opcional; nunca bloquea; no vende premium.

§37.2 (M2) · Comparación RETROSPECTIVA (contigo mismo), copy EDITORIAL y NEUTRAL: un
día imperfecto no se comunica como fracaso ni un día completo como presión.

§37.3 (M3) · Jornada ABIERTA/CERRADA (cerrar es opcional). Calendario por TIPOS de
jornada, NO por volumen ni «días perfectos». La RACHA se transforma en RITMO SEMANAL.
SIN puntuación de equilibrio: el equilibrio se representa cualitativamente.

§37.4 (M4) · Contenido inicial de Stats: HOY y SEMANA. Mes/Año e interpretación
profunda a premium y fases posteriores. «Qué te ayuda» con UMBRALES VARIABLES (no
muestra conclusiones con muestras insuficientes) y REQUIERE pace.events.v1.

--------------------------------------------------------------------------------
3. Decisiones NUEVAS de esta sesión (usuario, s129)

D1 · TIPOS DE JORNADA DEDUCIDOS. El tipo de un día se deduce de lo que hubo, de forma
cualitativa y sin puntuar. No depende del check-in (que es opcional), así que aplica
también a todo el histórico ya guardado.

D2 · LA PESTAÑA CAMINOS SE INTEGRA en Hoy y Semana: el Camino del día vive en Hoy y
los Caminos que se repiten en Semana. El progreso profundo (tabla completa, mapa del
año, rachas) es el «progreso profundo de Caminos» de §31.6 → premium.

D3 · SIDEBAR: Stats es la FUENTE ÚNICA de estos datos. El reparto exacto de qué se
asoma en la sidebar se decide al repensarla (§14), que ya requiere repensado propio.
Este documento no lo prejuzga; solo fija que no habrá dos definiciones distintas de
«cómo va mi día» (§15.4 exige denominadores únicos).

D4 · ALCANCE: se especifica el destino completo (Free y premium) por fases, porque el
criterio del usuario fue «no implementar cambios sin tener el sistema completo».

--------------------------------------------------------------------------------
4. El panel destino

4.1. Vistas

  HOY      · Free · vista de entrada (lo primero al abrir Stats, §37.4).
  SEMANA   · Free · tira de 7 días + ritmo + equilibrio.
  MES      · Premium (Fase 3) · patrones, Caminos más repetidos, evolución.
  AÑO      · Premium (Fase 3) · perspectiva larga.
  QUÉ TE AYUDA · Premium (Fase 3) · requiere eventos y umbrales variables.

  CAMINOS deja de ser pestaña de primer nivel (D2). Su contenido profundo pasa a la
  superficie premium de progreso.

4.2. HOY — contenido (§31.4)

  tiempo de Foco · pausas realizadas · movimiento · respiración · agua ·
  Camino del día · cierre opcional del día.

  Nota: «Travesía» aparece en §31.4 junto a Camino, pero las Travesías son Bloque 4 y
  NO existen todavía. Hoy muestra Camino; el hueco de Travesía se añade cuando exista.

4.3. SEMANA — contenido (§31.4)

  días en que se usó PACE · pausas activas · equilibrio entre módulos ·
  prácticas valoradas positivamente · Caminos repetidos (D2) · RITMO, no racha.

4.4. RITMO SEMANAL (sustituye a la racha)

  Definición: número de días de la semana con al menos una actividad real, con la tira
  de 7 días lunes-primero como representación. Se reutiliza el criterio ya vigente de
  «día activo» (foco, respiración o cuerpo > 0; el agua SOLA no cuenta), decidido en
  s69 y hoy implementado en YearView.jsx y en las WeekDots de la sidebar.

  Reglas de tono: sin rojo, sin «racha perdida», sin récord de mejor racha, sin
  pérdida de progreso por saltarse un día. Un día sin registro es un hueco neutro.

  Frontera: el OBJETIVO semanal suave («3 de 4 días laborables») pertenece a la sesión
  de gamificación (DECISIONES_PRODUCTO.md:566). Stats MUESTRA el ritmo; no fija metas.

4.5. TIPOS DE JORNADA (D1) — sustituyen al color por volumen

  Taxonomía propuesta, descriptiva y sin orden de mérito:

  · Sin registro      — no hubo actividad ese día. Hueco neutro, no un fallo.
  · Jornada de foco   — hubo Foco y NO hubo cuerpo ni respiración.
  · Jornada con pausas— hubo Foco Y al menos una pausa (respiración o cuerpo).
  · Jornada de cuerpo — hubo cuerpo/respiración sin Foco (se usó PACE para cuidarse).
  · Con Camino        — MARCA superpuesta, no un tipo: puede coexistir con cualquiera.

  El agua es señal ACOMPAÑANTE, no determina tipo (coherente con s69: el agua sola no
  hace día activo). Se representa dentro del día, no como categoría.

  Color: cada tipo tiene su color propio de la paleta tierra (no una rampa de
  intensidad). Esto es lo que cumple «por tipos, no por volumen» de §37.3.

  Copy: los cuatro nombres de arriba son PROVISIONALES y de trabajo. «Jornada de foco»
  debe leerse factual, nunca como reproche (§37.2). Pasada editorial pendiente.

4.6. Qué se retira

  · `computeDayScore` como criterio de color del calendario (YearView.jsx:11-24): es
    una nota agregada de las 4 dimensiones, exactamente lo que §37.3 descarta. La
    cifra visible ya se retiró en s107; queda el criterio.
  · Racha actual y mejor racha como contadores (PathStats.jsx:74-84, alimentadas por
    `computePathStreaks` en state-paths.jsx:216) → sustituidas por ritmo semanal.

--------------------------------------------------------------------------------
5. Modelo de datos — qué existe hoy y qué falta

5.1. Existe y sirve

  `history.days[iso] = {focusMinutes, breathMinutes, moveMinutes, waterGlasses}`
      (leído en YearView.jsx:13) → suficiente para los TIPOS DE JORNADA de §4.5 y para
      los minutos por módulo de Hoy y Semana. Aplicable a TODO el histórico guardado.
  `weeklyStats` = 4 arrays de 7 posiciones, lunes-primero (StatsPanel.jsx:13-30, s69)
      → tira de 7 días, ritmo semanal y equilibrio entre módulos.
  `paths.completed[id] = {count, lastDoneAt}` y `paths.history = [iso...]`
      (state-paths.jsx:69-75, 99-101) → Camino del día y Caminos repetidos.
  `getHistoryWithToday` (state-history.jsx) → el día en curso ya se fusiona en las
      vistas; no hace falta nada nuevo para que Hoy esté vivo.

5.2. Falta — y NO se puede reconstruir hacia atrás

  · Número de PAUSAS por día. Hoy solo hay minutos agregados por módulo; los
    contadores de sesión que existen son globales, no por día. «Pausas realizadas»
    (Hoy) y «pausas activas» (Semana) necesitan conteo por día.
  · HORA del día y DURACIÓN por sesión → «momento del día» y «duración que suele
    funcionar» de «Qué te ayuda» (§31.4).
  · SECUENCIA foco→pausa → «Foco acompañado de pausas» y «tiempo sedentario
    interrumpido» (§31.2/§31.4). Sin marcas de tiempo no es derivable.
  · FEEDBACK FECHADO. `routineFeedback` guarda por rutina {yes, some, no,
    lastPromptDay} (state-feedback.jsx): conteos ACUMULADOS sin fecha por respuesta ⇒
    no permite «prácticas valoradas ESTA semana» ni comparación retrospectiva.
  · JORNADA ABIERTA/CERRADA y CHECK-IN de cierre (§37.1/§37.3): no existen.

  Todo lo de 5.2 es exactamente lo que `pace.events.v1` cubre: DISEÑO CERRADO y
  APROBADO en s117 (EVENTOS_SCHEMA.md rev.5, arquitectura por adaptadores), SIN
  implementar. De aquí sale la urgencia real: cada día que pasa sin emitir eventos es
  histórico que no se podrá reconstruir.

--------------------------------------------------------------------------------
6. Fases de implementación

  FASE 0 · MARCO (independiente del contenido, se puede hacer ya)
    Altura estable del panel con independencia de la vista que lleve dentro, y scroll
    en el cuerpo con cabecera y pestañas fijas. Es lo único de la s129 original que
    NO se desperdicia: cualquier juego de pestañas futuro lo hereda y de la medición
    solo habría que reajustar una constante.
    Confinado a Stats con `:has([data-pace-stats-body])` (patrón s125), sin tocar
    `Primitives.jsx` — el resto de modales sigue creciendo con su contenido.

  FASE 1 · HOY + SEMANA, sin eventos (Free)
    Nueva vista Hoy con lo derivable de 5.1 · Semana con ritmo semanal (§4.4) y tira
    de 7 días TIPADA por §4.5 · integración de Caminos (D2) · retirada de las rachas
    (§4.6) · Hoy pasa a ser la vista de entrada.
    Lo NO derivable (conteo de pausas, prácticas valoradas de la semana, cierre) se
    deja fuera declaradamente; no se inventan datos ni se estiman.
    Los calendarios de Mes/Año NO se recolorean todavía: siguen como están hasta que
    se gaten en Fase 3, para no pintar dos veces la misma vista.

  FASE 2 · EVENTOS
    Implementar `pace.events.v1` (Fase 1 web, luego Android/iOS Capacitor) según
    EVENTOS_SCHEMA.md. Habilita conteo de pausas por día, feedback fechado, hora y
    duración por sesión, secuencia foco→pausa, y jornada abierta/cerrada + check-in
    de cierre (§37.1). Desbloquea todo lo pospuesto de Hoy y Semana.

  FASE 3 · LICENCIA Y PREMIUM
    Re-gating de Mes y Año a premium (DECISIONES_PRODUCTO.md:30-35, decisión 3) ·
    recolorear sus calendarios por tipos de jornada · «Qué te ayuda» con umbrales
    variables · comparaciones retrospectivas · progreso profundo de Caminos.

  Interinidad: hasta la Fase 3, Mes y Año siguen siendo gratuitas. No se adelanta el
  re-gating (la decisión ya escrita lo ata a la sesión de licencia).

--------------------------------------------------------------------------------
7. Medición del panel actual (s129, para el presupuesto de la Fase 0/1)

Medido en runtime sobre v0.71.0 con datos de peor caso (año completo, 7 Caminos):

  Chrome del modal (padding + cabecera + barra de pestañas): 221 px en escritorio,
  209 px en móvil ≤640.

  Contenido por pestaña          1280×1024     1366×610      360×640
    Semana                         397           397           400
    Mes                            368           368           279
    Año                            226           226           224
    Caminos                        529           529           533

  Salto actual (1280×1024): la card va de 448 a 751 px de alto (303 px) y su borde
  superior se desplaza 152 px — la mitad del delta, porque el backdrop centra con
  `placeItems:'center'` (Primitives.jsx:52).

  Espacio útil real: 298 px en 1366×610 (viewport real de una pantalla de 1366×768) y
  407 px en 360×640. Ahí Caminos se pasa 231 px y Semana 99 px. Ese exceso NO es un
  problema de CSS sino de VOLUMEN de contenido, y el destino lo resuelve por diseño:
  Hoy y Semana como vistas gratuitas, y el progreso profundo de Caminos —tabla, mapa
  del año y rachas, los 529 px— fuera de la vista de entrada.

  Restricción geométrica encontrada: la cuadrícula de Año no puede crecer para llenar
  espacio porque la limita el ANCHO (53 semanas × 13 px ya ocupan 689 de los 756
  útiles). Mes sí puede (7 columnas; la celda admite pasar de 48 a ~60 px).

--------------------------------------------------------------------------------
8. Preguntas de §36 · estado tras esta sesión

  RESUELTAS por §37 y por este documento:
    ¿Qué debe verse primero al abrir Stats? → Hoy (§37.4, §4.1).
    ¿La racha se conserva, se transforma o se elimina? → ritmo semanal (§37.3, §4.4).
    ¿Equilibrio diario o no convertir el bienestar en puntuación? → cualitativo, sin
      nota agregada (§37.3, §4.5/§4.6).
    ¿Cómo representar días imperfectos sin fracaso? → tipos descriptivos y hueco
      neutro (§37.2, §4.5).
    ¿Debe PACE preguntar «¿Cómo terminas hoy?» → sí, ocasional y en cierres (§37.1),
      implementable en Fase 2.

  ABIERTA a propósito:
    ¿Qué información pasa de Stats a la sidebar? → se decide al repensar la sidebar
      (D3), con Stats como fuente única.

--------------------------------------------------------------------------------
9. Lo que este documento NO hace

  No implementa nada (docs-only, sin bump, sin build).
  No adelanta el re-gating a premium.
  No reabre el reparto Free/Premium de §31.6 ni las decisiones M1–M4 de §37.
  No fija el objetivo semanal (es de la sesión de gamificación).
  No define la sidebar (§14).
  No toca el copy definitivo: los nombres de los tipos de jornada son de trabajo.
