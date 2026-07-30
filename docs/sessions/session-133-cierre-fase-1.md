# Sesión 133 — §37 re-decidido y cerrado · FASE 1 completa

**Fecha:** 2026-07-30
**Tipo:** SOLO-DOCUMENTAL — sin versión nueva, cero código, cero build
**Versión de referencia:** v0.71.0

---

## Qué se cierra

El **§37 del audit** (ronda M1–M4) estaba marcado **PROVISIONAL** desde s130, porque el usuario
dijo que se había añadido «sin actualizarse o pensarse bien». Se cerró decisión a decisión, con
las alternativas y su coste sobre la mesa, y queda como **§37 bis**; el texto original se
conserva debajo como historia, no se borró.

## Las cuatro decisiones

**1 · Constancia = ritmo semanal.** Se retiran la racha de días consecutivos y el récord de mejor
racha (hoy en `PathStats.jsx:74-84`, vía `computePathStreaks`) y entran los «días con ritmo» sobre
la tira de 7, con el criterio de día activo que ya existe desde s69 (foco, respiración o cuerpo
> 0; el agua sola no cuenta) y hueco neutro para el día sin registro. Sin récord, sin racha
perdida, sin rojo. Motivo: la racha choca con §2.2 (nada de rachas punitivas) y §2.5 (progreso
sin culpa).

**2 · Equilibrio = tres marcas, sin nota.** Foco · cuerpo · respiración, como indicador de qué
ámbitos tocó el día, sin número ni nivel ni orden de mérito; la hidratación acompaña pero no es un
ámbito (coherente con s69). **Esto es nuevo: no estaba en el spec de Stats de s129.** Se eligió
frente a «solo texto» porque lo cualitativo en prosa se acaba ignorando, y frente a una nota
agregada porque eso es exactamente lo que el principio descarta.

**3 · Calendario por tipos de jornada, no por volumen.** `computeDayScore`
(`YearView.jsx:11-24`), que agrega foco + respiración + cuerpo + agua en un número, **deja de ser
el criterio de color** de Mes y Año. Cada día se colorea por el tipo que fue —con pausas · de foco
sin pausas · de cuerpo · sin registro— con **«con Camino» como marca superpuesta**, no como tipo.
Los tipos se deducen de lo que hubo (decisión del usuario en s129), así que **aplican a todo el
histórico ya guardado y no necesitan eventos**.

**4 · Check-in de cierre: sí, ocasional.** Máximo una vez al día, opcional, nunca bloquea, ligado
a cierres naturales; nunca tras cada sesión ni para vender premium. Es la única vía para saber si
alguien «termina el día mejor», que es una de las dos métricas principales de §31.1. Requiere
eventos ⇒ Fase 3.

La quinta —**comparación retrospectiva**, contigo mismo, nunca competitiva ni social, copy
editorial— se mantuvo **sin preguntar**, porque no añade nada a lo que ya prohíbe §2.2.

## Lo que se decidió NO decidir

Las **preguntas comerciales de §36** (precio objetivo de Lifetime, precio fundador, prueba
empresarial, Android o iOS primero) se **reasignan a la Fase 7 con el motivo escrito**: el propio
plan exige revisar Starter Story **a fondo antes** de fijar pricing, y móvil y empresas caen fuera
de v1. Decidirlas hoy sería inventárselas. El precio que figura en el ROADMAP (~20 € Lifetime)
queda marcado como **provisional**.

Esto es parte de «que todo quede claro»: claro no significa que todo esté decidido, significa que
está escrito **dónde y cuándo** se decide cada cosa, y por qué no antes.

## Efectos en cadena

- **`STATS_DESTINO_PROPUESTA.md` queda sin condicionantes**: sus §4.4 (ritmo) y §4.5 (tipos de
  jornada) se confirman, y se le añade el equilibrio por tres marcas, que no tenía.
- **§36 actualizado**: de las 7 preguntas de «Métricas y Stats», 5 quedan RESUELTAS, 1 pendiente
  editorial (la formulación exacta de las respuestas del check-in, en la sesión que lo implemente)
  y 1 abierta a propósito (qué pasa de Stats a la sidebar → §14).
- **FASE 1 del plan cerrada** en `ROADMAP.md`.
- **`STATE.md`**: la sección «Próxima sesión» dejó de apuntar al «resto del Bloque 0» —que ya no
  es el orden vigente— y ahora describe la sesión 1 de la Fase 2.

## Próxima sesión, ya definida

**Fase 2, sesión 1: auditoría de nombres y glifos, sin código.** Entregable: la matriz §19.2 con
los 92 nombres de paso (nombre actual · nombre propuesto en español · glifo existe/placeholder/
ausente · alias · una o dos poses · zona corporal · nivel e intensidad · si necesita revisión
fisio).

Va primero por una razón técnica, no por prudencia: **`name` en español es la clave del glifo** y
de la i18n del constructor (s93), así que renombrar obliga a tocar `exercise-glyphs.jsx` y
`app/i18n/content/*.js` en el mismo cambio (s108) o el glifo cae **en silencio** a `DefaultGlyph`.
Arreglar el idioma sin el mapa completo empeoraría justo la queja de que los glifos son flojos.
