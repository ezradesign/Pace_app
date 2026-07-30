# Sesión 134 — Precio, artefactos y plan de 9 fases

**Fecha:** 2026-07-30
**Tipo:** SOLO-DOCUMENTAL — sin versión nueva, cero código, cero build
**Versión de referencia:** v0.71.0

---

## Precio: cerrado

**19,99 € lifetime como único plan al lanzamiento**, con una previsión barata: el formato de
licencia nace con **`expiresAt` opcional desde el día uno**, así que si a los tres meses la
monetización no funciona, añadir un pase temporal es **un cambio de datos, no de arquitectura**.

**El mensual queda descartado**, y no por el precio. El proyecto no tiene cuentas ni backend y
prohíbe la renovación automática engañosa: sin auto-renovación, un mensual significa **volver a
comprar y pegar una clave nueva cada mes**. Doce fricciones al año por 2,99 € no es un plan de
precios, es una fuga.

**Si algún día llega un anual, va a 9,99 €, no a 4,99 €.** A 4,99 € sale al 25 % del lifetime y
se lo canibaliza: cualquiera hace la cuenta. A 9,99 € el lifetime se amortiza en dos años y sigue
teniendo sentido. La intuición del usuario ya apuntaba ahí.

Todos los planes desbloquean lo mismo. Sin packs de pago aparte: las mejoras, ejercicios o
sesiones que se añadan puntualmente entran en lo ya comprado.

## Artefactos: el standalone deja de mandar

Pregunta del usuario: con sesiones CTB de 20 a 60 minutos, y siendo iOS y Android los usuarios
importantes vía Capacitor, **¿qué importancia tiene el standalone?**

Respuesta con evidencia, porque el caso es más fuerte de lo que parecía:

- **Una hora de audio en Opus a 48 kbps mono son ~21 MB**, y en base64 ~28 MB **por sesión**. Un
  HTML de 150 MB no es un artefacto.
- **No comparte `localStorage` con la web**: abierto desde `file://` tiene otro origen. No es una
  herramienta de portabilidad de datos — eso lo hace el export/import JSON.
- **Ya nace incompleto para lo que viene**: el esquema de eventos aprobado decide que
  **`file://` no emite eventos**. Sin histórico, sin «qué te ayuda», sin comparaciones.
- **Como canal de instalación es contraproducente**, y está demostrado: el bug de s128 (icono
  blanco y sin pantalla completa) salió de instalar desde `/PACE_standalone.html`, que no lleva
  `manifest`.
- **Cuesta en cada cierre** (regenerar, rotar 20 backups, verificar) y **condiciona la
  arquitectura**: sin `type="module"`, todo inlineado.

Decisión: **web y Capacitor son los objetivos canónicos**; el standalone pasa a **export bajo
demanda**. No se retira —sigue cubriendo el caso «abro un archivo y funciona»— pero deja de
regenerarse en cada cierre y deja de condicionar decisiones. El checklist de `CLAUDE.md` se
actualizó en consecuencia, junto con el árbol de arquitectura y el versionado.

## Audio: archivos, y una sesión empaquetada

El audio real viaja **como archivos** en web y Capacitor, exactamente el patrón que ya usan las 7
láminas y las 12 fuentes. La pista de fondo se cachea al usarla, no en el precache, para no
inflar la instalación.

Para las sesiones largas: **una sesión CTB completa empaquetada** —que además cumple el «al menos
un Viaje completo gratuito» que el §20.5 ya prometía— y **el resto bajo demanda** desde hosting
estático. Eso no rompe el principio local-first: el propio plan dice «local-first ≠ cero
servicios: infraestructura de compra y licencias sí, backend de producto y tracking no», y un CDN
que sirve archivos de audio no es ninguna de las dos cosas.

Si el material se genera con IA, hay que **verificar y guardar constancia de los términos de uso
comercial**. Y la regla **voz/TTS: NUNCA** sigue intacta: esto es aire y música, no locución.

## Un hueco del plan, reconocido

Las 7 fases que escribí en s132 **se dejaron fuera el Bloque 1 del audit: Respira y Loto**. Lo
destapó la lista del usuario, no yo. El plan pasa a **9 fases más una 1.5**, y Respira queda
troceada por decisión suya: **el loto entra ya** en el pulido visible, y **sonido + catálogo +
separar Técnicas de Viajes** son la Fase 5.

También se fija que **Caminos se repiensa antes de diseñar Travesías**, porque las Travesías se
construyen encima: una de 14 capítulos sobre Caminos que se sienten como playlists hereda el
problema catorce veces.

## El plan resultante

1 Dirección ✅ · **1.5 Pulido visible ⏭** · 2 Que Mueve y Estira se entiendan · 3 Eventos web ·
4 Stats · 5 Respira (sonido y catálogo) · 6 Caminos repensados · 7 Travesías 3/7/14 ·
8 Descubrimiento · 9 Venta.

## Propuesto, no aprobado

Para enriquecer el pomodoro como sol amaneciendo (§13 ya aprobó la dirección): reutilizar el
**horizonte que ya construimos** en s126/s128 para que **el sol suba** un 2–3 % del diámetro con
un `translateY` que no toca el layout · luz interior que gana temperatura muy despacio · arco algo
más grueso en el tramo final («más completo, no más urgente», literal del §13.3) · las cuatro
bolas del CICLO como soles completados · y un remate cálido antes de abrir el BreakMenu en vez del
corte seco. Con `prefers-reduced-motion`: segmentos y luminosidad, sin desplazamiento.

Queda como **propuesta**: el usuario preguntó qué se me ocurría y no lo ha aprobado todavía.

## Pendiente de él

Dijo «tengo más» implementaciones. Conviene que las suelte de golpe para repartirlas en una sola
pasada en vez de ir reabriendo el plan.
