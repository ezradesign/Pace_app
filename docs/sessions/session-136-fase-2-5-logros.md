# Sesión 136 — Fase 2.5 definida: logros (Bloque 6)

**Fecha:** 2026-07-30
**Tipo:** SOLO-DOCUMENTAL — sin versión nueva, cero código, cero build
**Versión de referencia:** v0.71.0

---

## Lo que pidió el usuario

Dos cosas sobre logros: que **dejen de ser agobiantes** —«con hacer media cosa o incluso saltando
algo ya consigues 4 logros seguidos»— y que sean más graduales y acordes al esfuerzo; y que en la
sidebar **se activen las miniaturas**, mostrando las 5 últimas y sustituyendo a las antiguas.

Las dos son literalmente lo que el audit ya tenía anotado: **§3.4** («desbloqueos iniciales
demasiado juntos») y **§15.3** («los primeros logros no deben desbloquearse todos juntos»), más
**§15.1** (las bolas deben mostrar el glifo del logro desbloqueado).

## El segundo hueco de mi plan

Los logros son el **Bloque 6 del audit** y **no estaban en ninguna de las fases**. Es el segundo
agujero que destapa la lista del usuario y no mi auditoría; el primero fue Respira y Loto (s134).

La causa es la misma en ambos: construí las fases desde el feedback beta y los bloqueantes de
venta, **sin recorrer sistemáticamente los Bloques 0–9 del audit**. Queda pendiente hacer ese
recorrido completo cuando el usuario termine de soltar su lista, para que no aparezca un tercero.

## Corrección al item de las miniaturas

Mirando el código, la mitad ya está hecha:

- **La lógica de «las 5 últimas sustituyendo a las antiguas» YA existe**: `AchievementsPreview`
  ordena por `unlockedAt` descendente y toma 5 ([`Sidebar.jsx:376-379`](../../app/shell/Sidebar.jsx)).
- **Lo que falta es el glifo**: hoy toda miniatura desbloqueada pinta un **`'✦'` fijo**
  ([`Sidebar.jsx:403`](../../app/shell/Sidebar.jsx)). Sí cambian de fondo y de color, pero todas se
  ven idénticas — por eso da la sensación de que no se activan.
- **El muro detrás**: **34 glifos de logro para 106 logros** (32 %). Meter glifos en la sidebar
  obliga a decidir qué se pinta en los ~72 restantes.

## Decisiones

**1 · Graduación: las dos cosas.** Entrega **escalonada** (máximo un logro nuevo por sesión y por
día, el resto en cola — precedente directo: los toasts ya se aplazan durante un Camino desde s105)
**y** revisión al alza de las condiciones (§15.3: repetición o variedad real, no la primera vez).
Lo primero mata el agobio de inmediato; lo segundo hace que signifiquen algo.

**2 · Recálculo completo con las reglas nuevas — excepción consciente.** El usuario eligió
recalcular todo, con la advertencia delante. Esto **contradice §2.5 («progreso sin culpa») y §2.2
(«nada de pérdida punitiva de progreso»)**: alguien puede abrir la app y ver que ha perdido logros
que tenía. Se ejecuta por decisión explícita y **queda registrado como excepción, no como
descuido**. Al implementarlo habrá que decidir cómo se comunica —un aviso único que explique el
recálculo— para que no se lea como un fallo. Contrasta con el precedente de s107, donde los ids de
logros retirados se dejaron como inofensivos en instalaciones antiguas.

**3 · Miniaturas: sello de categoría como transición.** Los ~72 logros sin glifo propio muestran
el sello de su categoría (`CAT_META` ya define las 7). No revela secretos, se ve intencional y da
variedad desde el primer día. **Y entran los glifos que el usuario ya tiene diseñados**, que se
portan **literales** (regla s84: el usuario dibuja o aprueba, se porta tal cual). El resto queda
como cola de dibujo.

**4 · Fase propia justo después de Mueve y Estira.** La matriz de logros (§15.2) y la de ejercicios
(§19.2) son el mismo tipo de trabajo y sus glifos comparten criterio visual: seguidas, se evita
repetir la discusión. Además el agobio está activo ahora mismo para los beta testers.

## Estado del plan

1 Dirección ✅ · **1.5 Pulido visible ⏭** · 1.6 Ajustes · 2 Mueve y Estira se entiendan ·
**2.5 Logros** · 3 Eventos web · 4 Stats · 5 Respira · 6 Caminos · 7 Travesías · 8 Descubrimiento ·
9 Venta.
