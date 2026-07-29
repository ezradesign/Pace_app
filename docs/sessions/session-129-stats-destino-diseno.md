# Sesión 129 — Stats destino: especificación de diseño

**Fecha:** 2026-07-30
**Tipo:** sesión SOLO-DOCUMENTAL (patrón s117/s109) — **sin versión nueva, cero código,
cero build, cero standalone**
**Versión de referencia:** v0.71.0 (`main`, commit `6769203`)
**Entregable:** [`docs/product/STATS_DESTINO_PROPUESTA.md`](../product/STATS_DESTINO_PROPUESTA.md)

---

## Cómo empezó y por qué cambió de rumbo

La sesión arrancó con el rumbo fijado al cerrar s128: implementar mejoras **tangibles**
del Bloque 0 del audit. De los cuatro candidatos, se recomendó **Estabilidad de Stats**
por valor/riesgo (presentacional, causa localizada, cabía completa con cierre) frente a
las bibliotecas (abren la decisión del campo `kind` en rutinas propias) y a los glifos +
troceo (chocan con el repensado §14 de la sidebar, pendiente de responder §36).

El usuario lo confirmó y se planificó el arreglo. Durante la ejecución pidió dos cosas
más: que **no hubiera scroll** además de no haber salto, y luego que las cuatro ventanas
midieran lo mismo con **cuadrícula mayor** en Mes/Año y un **«Ver más»** en Caminos.

Al ir a por eso, el usuario paró la sesión con el argumento correcto: *«en la AUDITORIA
se habla de cambiar cómo funcionan las stats, entre otras muchas implementaciones
pendientes; lo mejor es que audites eso antes de implementar cambios sin tener el
sistema completo»*. Se auditó, y el resultado justificó el frenazo.

## El hallazgo

**El audit no pide reestilizar el panel actual: decide un panel distinto.**

- **§37.4 (ronda M4, la más reciente)**: el contenido inicial de Stats es **HOY y
  SEMANA**. Mes, Año e interpretación profunda → premium y fases posteriores.
- **§31.6 + `DECISIONES_PRODUCTO.md:30-35`**: Free = Hoy + tira de 7 días + export y
  borrado; Premium = mes, año, patrones, «qué te ayuda», comparaciones. Con una
  condición ya escrita: **el re-gating se implementa en la sesión de licencia**.
- **§31.2**: el panel debe distinguir Actividad · Resultado percibido · Retorno ·
  Equilibrio, y no reducir el éxito a minutos, Pomodoros ni volumen.
- **§37.3**: la **racha se transforma en ritmo semanal**, el calendario se organiza por
  **tipos de jornada (no por volumen)** y **no habrá puntuación de equilibrio**.

Contra el código de hoy:

1. **No existe la pestaña «Hoy»** — las cuatro son semana/mes/año/caminos
   ([`stats.js:26-53`](../../app/i18n/strings/stats.js)), y dos de ellas están
   destinadas a salir del panel gratuito.
2. **El calendario colorea por volumen**: `computeDayScore` agrega foco + respiración +
   movimiento + agua en un número y lo mapea a 5 niveles
   ([`YearView.jsx:11-24`](../../app/stats/YearView.jsx)) — el «por volumen» que §37.3
   sustituye. (La cifra *visible* ya se retiró en s107; queda el criterio de color.)
3. **La racha sigue siendo racha**: racha actual y mejor racha en días
   ([`PathStats.jsx:74-84`](../../app/stats/PathStats.jsx), vía `computePathStreaks`).

Conclusión operativa: estabilizar la altura de las cuatro pestañas de hoy habría sido
trabajo real sobre vistas condenadas. Solo el **marco** (altura estable con
independencia de la vista) es agnóstico al contenido y sobrevive.

## La medición, que no se pierde

Antes del frenazo se midió el panel en runtime sobre v0.71.0, con datos sembrados de
peor caso (año completo, 7 Caminos). Estos números quedan en el documento destino como
presupuesto de las fases 0 y 1:

| Pestaña | 1280×1024 | 1366×610 | 360×640 |
|---|---|---|---|
| Semana | 397 | 397 | 400 |
| Mes | 368 | 368 | 279 |
| Año | **226** | 226 | 224 |
| Caminos | **529** | 529 | 533 |

Chrome del modal: **221px** escritorio / 209px móvil. Salto real: la card va de **448 a
751px** de alto y su borde superior se desplaza **152px** — la mitad del delta, porque el
backdrop centra con `placeItems:'center'` ([`Primitives.jsx:52`](../../app/ui/Primitives.jsx)).

Dos hallazgos de la medición que corrigen suposiciones:

- **La pestaña más alta es Caminos (529), no Semana (397)** — la tabla de 7 Caminos más
  el mapa del año pesan más que las barras de la semana.
- **La cuadrícula de Año no puede crecer** para llenar espacio: la limita el **ancho**
  (53 semanas × 13px ya ocupan 689 de los 756 útiles), no el alto. Mes sí puede (7
  columnas, celda de 48 a ~60px). Esto invalidaba parcialmente la idea de «cuadrícula
  más grande» como forma de igualar alturas.

Y el dato que reencuadra el problema: en **1366×610** (viewport real de una pantalla de
1366×768) el hueco útil son **298px**, así que Caminos se pasa 231px y Semana 99px. Ese
exceso no es un problema de CSS sino de **volumen de contenido** — lo que el panel
destino resuelve por diseño.

## Decisiones del usuario en esta sesión

- **Tipos de jornada DEDUCIDOS** de lo que hubo, cualitativos y sin puntuar: funcionan
  sin check-in (que es opcional) y aplican a todo el histórico ya guardado.
- **La pestaña Caminos se integra** en Hoy y Semana; su progreso profundo (tabla, mapa
  del año, rachas) pasa a premium como el «progreso profundo de Caminos» de §31.6.
- **Sidebar**: Stats es la fuente única; el reparto exacto se decide al repensarla
  (§14), que ya requiere repensado propio.
- **Alcance**: especificar el destino completo, Free y premium, por fases.

## Lo que queda especificado

Vistas (Hoy y Semana gratuitas; Mes, Año y «Qué te ayuda» premium en Fase 3), contenido
de Hoy y Semana, definición del **ritmo semanal** reutilizando el criterio de día activo
de s69 (foco/respiración/cuerpo > 0; el agua sola no cuenta), la **taxonomía de tipos de
jornada** con «Con Camino» como marca superpuesta en vez de tipo, lo que se retira, y una
tabla de **gap de datos**: qué existe hoy y sirve, y qué falta y **no se puede
reconstruir hacia atrás** (conteo de pausas por día, hora y duración por sesión,
secuencia foco→pausa, feedback fechado, jornada abierta/cerrada y check-in).

Ese gap es exactamente lo que cubre `pace.events.v1`, **diseñado y aprobado en s117** y
sin implementar. De ahí la urgencia real: cada día sin emitir eventos es histórico
irrecuperable.

**Fases:** 0 marco de altura estable (ejecutable ya) · 1 Hoy + Semana sin eventos ·
2 `pace.events.v1` · 3 licencia (re-gating de Mes/Año, «Qué te ayuda», comparaciones).

## Preguntas de §36 resueltas

Qué se ve primero al abrir Stats (Hoy) · qué pasa con la racha (ritmo semanal) ·
equilibrio sin puntuación (cualitativo) · días imperfectos sin fracaso (tipos
descriptivos + hueco neutro) · si PACE pregunta «¿cómo terminas hoy?» (sí, ocasional, en
cierres, implementable en Fase 2). Queda abierta a propósito la de la sidebar.

## Notas de proceso

- Se sembraron datos de prueba en el navegador de verificación para medir el peor caso.
  Viven solo en ese navegador aislado; no tocan el perfil del usuario ni el repo.
- Se reconfirmó la trampa de s126: el service worker sirve `app/*` cacheado en dev y hay
  que desregistrarlo + borrar la caché `pace-v*` antes de medir.
- El plan aprobado de esta sesión (marco estable + motor de encaje) queda **superado**
  por este documento: su Fase 0 recoge la parte que sí era durable.
