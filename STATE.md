# PACE · Estado

**Versión:** v0.174.0 · 20 de octubre de 2026. Qué trajo cada versión: `CHANGELOG.md`. Las reglas que
no se pueden romper: `docs/product/DECISIONES_TECNICAS_VIGENTES.md`.

## Dónde estamos

- **Web** en https://pacegrass.app (y `paceweb.pages.dev`, sin redirigir), con `/premium` y su lista
  «Avísame», que se enciende al conectar el KV (`docs/launch/avisame.md`).
- **Android** (Fase 2 de `ROADMAP.md`) hecho en código y sin probar en un móvil: cada push a `main`
  compila el APK de prueba y el AAB firmado para Play. **iPhone** preparado (v0.164.0); la App Store,
  después de v1.
- **«A tu ritmo»** sirve el día según tu semana, elige cada pausa con lógica, lleva el día al
  calendario y, desde v0.173.0, aprende de tu semana (`app/ritmo/ritmo.motor.js`, la carta del lunes).
  Desde v0.174.0 cada día mueve el cuerpo entero y equilibrado (gratis) y, con PACE completo, las
  rutinas cambian de un día a otro (`puedeVariar`).
- **PACE completo**, abierto hasta v1 (`PREMIUM_ABIERTO_HASTA_V1`): toda compra pasa por
  `app/state-entitlement.jsx`, con tiendas aún vacías (`app/state-compra.js`); en la web, un código de
  por vida firmado lo abre todo. «Qué te ayuda» (Estadísticas) sigue sin hacer y ya puede leer
  `ritmo.aprendido`. Los Caminos, ocultos hasta después de v1 (`SHOW_CAMINOS`).

## Lo siguiente

0. **Play Console, con Ez paso a paso** (20 oct.; la página de pasos de Ez, abajo): app creada como
   «PACE: Pomodoro, Break Reminder», en inglés como idioma principal y Gratis (`nombre-en-play.html`).
   Van los cuestionarios; luego la ficha, la prueba interna y la cerrada. «Tus rutinas» se abrió
   hasta v1 (v0.173.3) para que el acceso restringido sea «No» de verdad: se sube 0.174.0 o posterior.
   Gráfico destacado nuevo, el logo de Ez (`grafico/logo-ez.jpg`); las capturas se rehacen con 0.174.0.
1. **Fase 2**: probar el APK en un móvil (icono, arranque de día y de noche, importar una copia, que lo
   guardado sobreviva a una actualización, el aviso de Foco). Subidas: `docs/launch/google-play/guia.html`.
2. **Antes de cobrar** (Ez, 16 oct.), cada uno en su sesión: **los días diseñados**, en `main` con
   v0.174.0 (Ez los aprobó mirando la semana, https://claude.ai/artifact/HjcDYcPgAm4fG13uMvKaVm, el
   20 oct.). Y, del calendario total en la web, **el llavero** (Ez, 18 oct.; espera sus
   altas). La revisión de los ejercicios y el motor de la semana, hechos; lo total con PACE
   cerrado, después de v1.
3. **Fase 6, tras /premium**: la página de gracias y la firma con k2, el aviso dos días antes del fin
   de la prueba, «Gestionar» en Ajustes, la invitación con los botones de compra y lo legal de /premium.
   El día de v1, «Da de pastar a la vaca» sale de la web (Ez, 18 oct.).
4. **Auditoría del 18 oct.** (`docs/audits/auditoria-v0.173.0.md`, página para Ez en
   https://claude.ai/artifact/7YxZbjgoK33rtT5C84wnGs): la pasada de texto y el e2e en dos trozos,
   hechos. Ez decidió (`DECISIONES_PRODUCTO.md`, «Tras la auditoría del 18 oct.»): pacegrass.app
   publica solo la app, lo de PACE va al calendario como **libre** y el llavero entra en v1. «Libre»
   en el calendario (v0.173.1) y publicar solo la app (v0.173.2, `dist/` con `scripts/web-dist.js`),
   en `main` desde el 20 oct. con el sí de Ez, que ese día puso en Cloudflare Pages el comando
   `node scripts/web-dist.js` y la salida `dist`. Las ramas ya juntadas, borradas (copia en
   `PACE-ramas-borradas-18oct.bundle`, junto a la carpeta del proyecto), y las sesiones terminadas,
   archivadas.

## Espera a Ez

La lista, por orden y sin jerga, en la hoja de ruta del 20 oct.
(`docs/traspaso/hoja-de-ruta-20oct.html`, https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT). Ez se
pierde con mucho abierto: a «¿qué toca?», una sola cosa.

- **Lo que fija la fecha de v1**: crear la app en Play Console, subir el AAB y reunir unos 15 testers
  (tiene 5 o 6); el gestor, la cuenta de Stripe con Managed Payments y los datos del aviso legal;
  volver a exportar el logo (`app/ui/pace-logo.png`: «EVEN» se lee «FVFN», también en /premium).
- Copiar `PACE-llave-play` y `PACE-llave-licencias` a su disco duro y mandar a cada tester su enlace
  de `codigos-tester.csv` (funcionan en la web).
- «Avísame»: el nombre que firma su privacidad, el KV `pace-avisame` conectado como `AVISAME` y el
  token de Web Analytics solo para /premium; mirar el registro previo de Play.
- Las altas de PACE en Google Cloud y Microsoft Entra, con sus dos ids (`docs/CALENDARIO_ALTAS.md`; para el
  llavero, el cliente de Google como «aplicación web» con su secreto).
- Leer `privacy.html` (es pública) y probar en su Android el calendario que se mantiene solo.
- Oír la voz de Respira en pacegrass.app (desde v0.167.0 con fundido, `PACE_VOZ_FUNDIDO`) y los
  cuencos de Mueve y Estira; grabar «Más» y «More» del suspiro (`encargos-16oct/PROMPTS_AUDIO_SUSPIRO.md`).
- Los dibujos que faltan: la cuenta y los prompts, en `docs/product/GLIFOS_A_DIBUJAR.md`.
- iPhone: la cuenta de Apple Developer y su llave (`docs/launch/app-store/guia.html`, puntos 3 y 4), y
  pasar a su tester qué mirar en Safari, sobre todo el sonido.
- Apagar las propuestas automáticas de Dependabot, dejando las alertas.

## Deuda conocida, sin fecha

- **Desde el 27 oct.**, comprobar por tamaño que pacegrass.app ya no sirve /STATE.md, /CLAUDE.md,
  /docs/traspaso/LEEME.md, /docs/product/DECISIONES_PRODUCTO.md ni /package.json. Tras pasar a
  `dist/` (20 oct.), Pages siguió dando la copia vieja de lo ya pedido (`s-maxage=604800`, una
  semana): no la quitan ni un despliegue nuevo ni Purge Everything de la zona, que Ez hizo. Lo
  demás ya da la app.

- A 320×568 la home del móvil pide scroll (Ez lo acepta) · las escenas con scroll anteriores a
  v0.130.0.
- En «A tu ritmo»: el cierre que nunca es «Ahora», la lectura C (espera a que `origin` tenga semanas
  de datos) y la tarde sin rutinas de pie con el aro a 10 o 15 (falta contenido de pie).
- Tests del estado más allá del saneador · i18n con plurales y pseudolocalización · las deudas de
  claves D-1, D-2 y D-3.

El `STATE.md` anterior, con el mapa de archivos, el índice de decisiones y el backlog antiguo, está en
`docs/archive/STATE_HASTA_S200.md`.
