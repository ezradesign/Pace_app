# PACE en la App Store · la ficha

Lo que pide App Store Connect en **la app › Distribución › Información de la app** y en la ficha de cada
versión, listo para copiar y pegar (Ez, L4A del 25 nov. 2026, «PACE, listo para las tiendas»). Las cuentas
de caracteres están hechas. La descripción larga es la de Play (`docs/launch/google-play/ficha.md`), que no
nombra Android ni Google Play (regla 2.3.10), con dos cambios: «tu móvil» pasa a «tu iPhone» y, en v1, el
párrafo de PACE completo lleva lo que Apple pide a una suscripción.

## El nombre, igual en las dos tiendas

La guía del iPhone decía «PACE: pausas activas y foco»; la ficha de Play, desde el 20 oct., «PACE: pausas
activas, Pomodoro». **Se usa el de Play en las dos**, para que quien busque PACE vea el mismo nombre. Si
prefieres el otro, se cambia en las dos a la vez.

| Campo (máx.) | Español (es-ES, y México si lo abres) | Inglés (en-US, el principal, como en Play) |
|---|---|---|
| Nombre (30) | `PACE: pausas activas, Pomodoro` (30) | `PACE: Pomodoro, Break Reminder` (30) |
| Subtítulo (30) | `Estira, respira y bebe agua` (27) | `Desk stretches and breathing` (28) |
| Palabras clave (100) | `estiramientos,oficina,escritorio,postura,teletrabajo,respiración,foco,temporizador,espalda,cuello` (97) | `stretch,posture,office,work,focus,timer,mobility,neck,back,water,hydration,wellness,sitting` (91) |
| Texto promocional (170) | ver abajo (144) | ver abajo (152) |
| Categoría principal | Salud y forma física | Health & Fitness |
| Categoría secundaria | Productividad | Productivity |
| URL de soporte | `https://pacegrass.app/support` | la misma (la página lleva el inglés en `#en`) |
| URL de marketing | `https://pacegrass.app/` | la misma |
| URL de la política de privacidad | `https://pacegrass.app/privacy` | la misma |
| Copyright | `2026 ` y tu nombre legal | igual |

Las palabras clave no repiten las del nombre ni las del subtítulo: Apple ya las cuenta, y repetirlas gasta
sitio. Van separadas por comas y sin espacios.

## Texto promocional

Es lo primero que se lee debajo de las capturas y se cambia cuando quieras, sin pasar revisión.

```
Pausas que caben entre dos tareas: respira, estira y bebe agua sin dejar tu mesa. Sin cuentas ni anuncios, y lo que haces se queda en tu iPhone.
```

```
Breaks that fit between two tasks: breathe, stretch and drink water without leaving your desk. No account, no ads, and what you do stays on your iPhone.
```

## Descripción

La de Play, en los dos idiomas, cambiando estas frases:

| En Play | En la App Store |
|---|---|
| «Lo que haces en PACE se queda en tu móvil» | «Lo que haces en PACE se queda en tu iPhone» |
| «What you do in PACE stays on your phone» | «What you do in PACE stays on your iPhone» |
| «PACE las lee del calendario del móvil» | «PACE las lee del calendario del iPhone» |
| «reads them from your phone calendar» | «reads them from your iPhone calendar» |

**En v1**, el párrafo de PACE completo de Play y, al final de la descripción, lo que Apple pide a una
suscripción que se renueva sola (regla 3.1.2): el precio, el periodo, que se renueva y dónde se cancela, y
los dos enlaces.

```
PACE completo se renueva cada mes por 2,99 € salvo que lo canceles al menos 24 horas antes de que acabe el periodo, en Ajustes del iPhone › tu nombre › Suscripciones. El pago se carga a tu cuenta de Apple al confirmar la compra.
Condiciones de uso: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Privacidad: https://pacegrass.app/privacy
```

```
PACE Complete renews every month for €2.99 unless you cancel at least 24 hours before the end of the period, in iPhone Settings › your name › Subscriptions. Payment is charged to your Apple Account when you confirm the purchase.
Terms of Use: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Privacy: https://pacegrass.app/privacy
```

El enlace de las condiciones es el contrato estándar de Apple. Si cuando acabe la revisión profesional
prefieres las condiciones de PACE (`/legal/condiciones`), se cambia ese enlace aquí y en «Contrato de
licencia» de App Store Connect.

## Lo demás de la ficha

- **Clasificación por edades**: el cuestionario nuevo, «No» a todo menos a los temas de salud y bienestar
  (`guia.html`, punto 5).
- **Privacidad de la app**: «Datos no recopilados» (`guia.html`, punto 6).
- **Accesibilidad**: las etiquetas de `docs/launch/accesibilidad.md`.
- **Capturas**: 6,9″ (1320 × 2868), de 3 a 10. Las saca `docs/launch/capturas-25nov/` cuando Ez elija la maqueta.
- **Notas para quien revisa** (App Review Information › Notes):

```
PACE works fully offline with no account or sign-in. Everything stays on the device. To try it: tap "Comenzar", optionally set your week, then "Empezar foco" on the main screen, or open Respira / Estira / Mueve below the timer. Intense breathing techniques (Respira › Energía) show a safety notice before starting. Long-press the app icon for quick actions.
```
