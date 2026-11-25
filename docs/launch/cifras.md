# PACE publicada · las tres cifras de cada lunes

Ez, L6A del 25 nov. 2026 («PACE, listo para las tiendas»). PACE no rastrea a nadie y no lo va a hacer. Aun así,
Google y Apple cuentan por su cuenta, sin que la app envíe nada, cuánta gente la instala, cuánta sigue y cuánta
paga. Basta con mirar tres cifras cada lunes para saber qué arreglar primero.

## Las tres cifras

| Cifra | Qué dice | Orientativo en apps de bienestar |
|---|---|---|
| **Quien sigue a los 7 días** | Si PACE se queda en el móvil después de la primera semana | Alrededor de 1 de cada 10 es normal; 1 de cada 5, muy bueno |
| **Pruebas que acaban en pago** | Si PACE completo convence a quien lo prueba 7 días | De 3 a 4 de cada 10 es lo habitual con una prueba que se cobra sola |
| **Cierres y fallos** | Si algo se rompe en algún móvil | Por debajo de 1 de cada 100 sesiones; Google avisa si pasa del 1,09 % |

Los valores son la referencia general del sector, no una promesa: lo que importa es si sube o baja de un lunes
a otro.

## Dónde está cada una

**Google Play Console**

- Quien sigue: **Usuarios › Adquisición de usuarios › Informes de retención** (por día de instalación).
- Pruebas que acaban en pago: **Monetizar › Productos › Suscripciones › PACE completo › Estadísticas**, y
  **Informes financieros › Suscripciones** para las altas y las bajas.
- Cierres: **Supervisar y mejorar › Android vitals › Fallos y ANR**. Cuenta lo que cierra la app entera; lo que
  falla dentro lo traen los correos de «Cuéntanoslo».
- Desinstalaciones y de dónde llega la gente: **Estadísticas**, eligiendo «Desinstalaciones de usuarios» y
  «País».

**App Store Connect**

- Quien sigue: **Analytics › Retención** (día 1, 7 y 28). Solo cuenta a quien acepta compartir datos con los
  desarrolladores al configurar su iPhone, así que es una muestra.
- Pruebas que acaban en pago: **Analytics › Suscripciones** (conversiones de la prueba gratuita).
- Cierres: **Analytics › Métricas › Bloqueos**, y en Xcode Organizer si algún día hay un Mac.

**La web**: Cloudflare ya cuenta visitas sin cookies. En /premium está apagado hasta que Ez dé el token
(`STATE.md`, «Cuentas»).

## Qué hacer si una sale baja

| Si… | Lo primero que se mira |
|---|---|
| Se van antes del día 7 | Los primeros dos minutos: la bienvenida, la semana y la visita. ¿Llegan a hacer una pausa el primer día? Pregúntalo a dos o tres personas nuevas |
| Prueban y no pagan | Qué ven durante la semana de prueba: la carta del lunes, el mes y lo que «Qué te ayuda» les dice. Si no lo abren, no saben qué pagan |
| Sube un fallo | Android vitals da el modelo de móvil y la versión de Android; con eso se reproduce |
| Muchas desinstalaciones en un país | La ficha en ese idioma, y si la app se abre en su idioma (solo hay español e inglés) |

## El ritmo

Cada lunes, cinco minutos: las tres cifras en una nota con la fecha. Durante las dos primeras semanas tras v1,
además, contestar todas las reseñas (Ez, 15 oct. 2026).
