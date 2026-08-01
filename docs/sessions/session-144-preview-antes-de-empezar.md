# Sesión 144 — Preview «antes de empezar» (§18.3)

**Fecha:** 2026-07-31 · **Versión:** v0.76.0 → **v0.77.0** · Sesión de **CÓDIGO**.

Ítem 6 de la Fase 2. Se eligió por tres razones: los datos **ya existían sin consumidor**
(igual que en la ola E), el audit lo pide explícitamente, y **desbloquea la reescritura
editorial** que quedó aparcada en s143.

---

## 1 · La prueba de que faltaba el sitio

Medido antes de escribir nada: **16 de las 28 descripciones llevan el requisito escrito a
mano**.

> «Tríceps en 3 series. **Silla estable y sin ruedas**.» · «Hombros a punto… **Necesitas
> pared; barra opcional**.» · «Antídoto exacto a 4 h sentado… **Pasarás por el suelo**.»

No es que estén mal escritas: es que el requisito **no tenía dónde ir**, así que se coló en
la descripción. Ese es el mismo síntoma que hacía sonar desiguales a las 28 (s143), y por eso
este ítem va antes que la reescritura.

Y los datos estaban ahí desde s115: `equipment`, `position` y `requiresFloor` en **22 de 28**
rutinas, sin que los leyera nadie.

## 2 · Qué se hizo

**`app/ui/RoutinePreview.jsx`** (nuevo): modal entre la tarjeta y la sesión con
**qué necesitas** · **posición** · **duración** · **intensidad y nivel** · **los pasos con su
glifo** · CTA.

Decisiones que conviene tener escritas:

- **Sale solo desde la BIBLIOTECA, no dentro de un Camino.** En un Camino la rutina ya viene
  elegida y el ritmo manda. Sale gratis **por construcción**: el preview se engancha en los
  handlers de `main.jsx`, que son la puerta de la biblioteca; `PathBodyStep` monta el runner
  por su cuenta y no pasa por ahí.
- **La biblioteca se queda abierta detrás**: cerrar el preview te devuelve a ella, no a la
  home. Precedente exacto de la forma: el modal de seguridad de Respira (s90).
- **El gate `setup:'ready'` del runner v1 NO hacía este trabajo**: es por PASO («colócate
  para este ejercicio») y llega cuando ya entraste.
- **La duración sale de la misma fuente que la tarjeta** (`estimateDuration` para v1, `min`
  para el resto): una sola promesa, nunca dos.
- **El suelo es una necesidad más, no material**: `requiresFloor` se pinta junto al
  equipamiento («Sitio para tumbarte en el suelo»), porque para quien lo lee es lo mismo.
- **Las series del mismo ejercicio se agrupan**: «Fondos en silla» tres veces seguidas es
  ruido; se colapsan las repeticiones **consecutivas** con un `×3`. Si el ejercicio vuelve
  más tarde, vuelve a aparecer — que es lo que de verdad pasa.

**Requisitos completados en las 6 rutinas que no los declaraban** (las 6 legacy bloqueadas; la
ola E ya les había puesto nivel e intensidad). En dos casos el valor salía de su propia
descripción: `ATG · Rodillas a prueba` decía «Necesitas pared y suelo» y `Ancestral`, «Suelo y
barra firme». **Las 28 declaran ya sus requisitos** (11 necesitan suelo).

## 3 · Bug propio, cazado antes de que llegara a pantalla

La lista de pasos filtra los descansos, y las claves EN son **posicionales sobre el array
completo** (`<id>.s4.name` cuenta los descansos). Filtrar y usar el índice nuevo habría
desplazado **todos los nombres en inglés**. Se conserva el índice original.

## 4 · Verificación

Con SW y cachés purgados: el preview abre sobre la biblioteca, muestra requisitos, posición,
duración, intensidad y los pasos con glifo; «Empezar» lanza la sesión y cierra la biblioteca;
la agrupación de series muestra `Fondos en silla ×3`. Consola sin errores.

## 5 · Hallazgo anotado, no tocado

La pantalla de preparación dice **«De pie. Sin prisa. 5 pasos.»** también en rutinas
**sentadas** (`Fondos en silla`). Es copy genérico anterior a esto, pero ahora que `position`
está declarado en las 28 se puede derivar. Queda para la ola editorial.

## 6 · Cambios en el árbol

| Archivo | Cambio |
|---|---|
| `app/ui/RoutinePreview.jsx` | **NUEVO** — el preview |
| `app/main.jsx` | estado del preview + intercepción de los dos handlers de biblioteca |
| `app/i18n/strings/sessions.js` | `preview.*` (7 equipamientos + 5 posiciones + secciones), ES+EN |
| `app/move/move.data.js` · `app/extra/ExtraModule.jsx` | requisitos de las 6 rutinas que faltaban |
| `PACE.html` | carga del componente tras `exercise-glyphs` |
| `scripts/audit/inventario.js` | captura `desc`, `access`, `equipment`, `position`, `requiresFloor` a nivel de rutina (antes solo de paso) — y corrige que el campo de pago es `access`, no `premium` |

`PACE_standalone.html` **no se regenera** (s134): restaurado byte-idéntico,
`998e3e358d689036`.
