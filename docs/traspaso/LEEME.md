# Traspaso de PACE: léelo primero

Este archivo es para un Claude que empieza de cero, en esta cuenta o en otra, y tiene que retomar
PACE sin preguntarle a Ez lo que ya se decidió. Junto con `CLAUDE.md` y `STATE.md`, basta para seguir.
Se actualiza en cada hito (regla en `CLAUDE.md`). Última actualización: 7 de octubre de 2026, 08:50 UTC, v0.143.1.

## Cómo seguir desde otra cuenta

1. Ez crea un proyecto nuevo en la otra cuenta con el repo `ezradesign/Pace_app` y pega la frase de
   arranque que está al final de este archivo.
2. El Claude nuevo lee, por este orden: `CLAUDE.md`, `STATE.md`, este archivo y la fila del
   subsistema que vaya a tocar en `docs/product/DECISIONES_TECNICAS_VIGENTES.md`.
3. Lo que estaba solo en la carpeta del proyecto anterior ya está en el repo: `docs/traspaso/archivos/`
   (glifos, música, maquetas en imagen) y `docs/launch/google-play/` (ficha de Play).
4. Las maquetas publicadas como artifacts (enlaces abajo) pertenecen a la cuenta anterior y puede que
   no se abran desde otra. Lo decidido en ellas está escrito aquí, así que no hace falta abrirlas.

## Dónde lo dejamos (7 oct, 08:50 UTC)

Esto es lo último y manda sobre la tabla de «Líneas abiertas» donde no coincidan. Ez alterna dos
cuentas de Claude según el uso que le queda a cada una, y las dos suben a `main`: haz `git pull`
antes de trabajar y mira en `git log` qué subió la otra.

- **Home del móvil:** Ez eligió la opción 2. Se estaban maquetando versiones mejor colocadas; no hay
  nada subido. Ez elige entre ellas.
- **Música de Respira:** hay tres drones en Sol hechos con las tomas de ElevenLabs de Ez: Sol claro
  para Energía, Balance y Pranayama; Sol cálido para Equilibrio; Sol menor para Relajación. La app les
  aplicaría una envolvente que respira en vivo (se abre al inhalar, se queda en el sostén, se cierra al
  exhalar). Ez estaba eligiendo en una página de escucha. Siguiente paso: el cambio de código,
  enseñado a Ez antes de subirlo. Los tres drones están en `archivos/musica-respira/bases/`, con la
  página de escucha (`escucha-respira.html`), los scripts de procesado y su `README.md`.
- **Glifos:** cuatro prompts de ejercicio con figuras sin ropa, de la familia de los 59. El prompt A es
  solo para GPT Image 2; el B es el preámbulo original más dos dibujos de referencia, por si A se
  bloquea. Falta comprobar qué modelo de Genspark acepta la figura. Empezar por «descanso». Prompts en
  `archivos/glifos/prompts-glifos.md` y referencias en `archivos/glifos/referencias/`.
- **Dominio:** hecho en v0.143.0. PACE vive en https://pacegrass.app (el mismo proyecto de Cloudflare
  Pages, con la app en la raíz) y `paceweb.pages.dev` sigue sirviendo lo mismo sin redirigir, porque
  los datos de la web son de cada dominio. Enlaces legales de Android, calendario y privacidad usan
  el dominio nuevo, y el calendario aún reconoce sus eventos con la marca vieja. La privacidad lleva
  el correo de contacto `hola.ezradesign@gmail.com`, que desde v0.143.1 se lee también sin
  JavaScript (Cloudflare lo escondía).
- **«A tu ritmo» semanal (lo de pago), segunda ronda:** «¿Cómo es tu semana?» en la bienvenida
  (gratis); cada mañana la tarjeta del día llega ya contestada, con «Hoy es distinto» (gratis); una
  carta corta el lunes con lo que ayudó, la semana en cinco barras y uno o dos cambios aplicados con
  «Vale» (premium); nada de tira semanal en la home. La maqueta estará en `archivos/semana/` si el
  hilo de la maqueta llegó a subirla. Nada de código hasta que Ez elija.
- **Android:** la llave de subida a Play existe desde el 7 de octubre. El original y su contraseña
  están en la carpeta `PACE-llave-play` del usuario de Ez en su PC, y GitHub tiene una copia en los
  secretos del repo, con la que el workflow `Android` firma el AAB en cada push a `main` (artefacto
  `pace-android-play`).
- **Caza de bugs:** si `CHANGELOG.md` no tiene una versión con los arreglos del móvil después de
  v0.143.0, siguen pendientes (v0.143.1 solo arregla el correo de la privacidad). Toman el siguiente
  número de versión libre.
- **Google Play:** la ficha está en `docs/launch/google-play/`. Espera a la revisión de identidad de
  Google y a unos 15 testers; el AAB firmado ya sale del workflow.

## Qué es PACE

App de pausas activas para quien trabaja sentado: Foco (Pomodoro), Respira, Mueve, Estira, Hidrátate,
logros y «A tu ritmo», una guía del día que reparte bloques de foco y pausas. Web/PWA en
https://pacegrass.app (Cloudflare Pages publica cada push a `main`, y `paceweb.pages.dev` sirve lo
mismo) y Android con Capacitor 8 (el workflow `Android` compila un APK de prueba, artefacto
`pace-android-debug`). React 18 sin bundler. El objetivo de Ez es **vender pronto**: v1.0 es la
primera versión de pago, en web y Android.

## Cómo trabaja Ez

- Se le habla en español, con frases completas y sin jerga. No se maneja con cuentas ni ajustes: si
  hace falta que configure algo, pasos numerados y concretos, o evitarlo.
- Delega con facilidad («abre los que tú recomiendes»): se elige, se dice cuál y se sigue.
- Antes de un cambio visual quiere una maqueta con opciones y una recomendación, y elige él.
- Commits directos a `main`, sin PR y **sin línea `Co-Authored-By`**. Varios hilos pueden subir a la
  vez: `git pull` justo antes del push, ediciones pequeñas en `STATE.md`, y quien sube segundo toma
  el siguiente número de versión. Los cambios solo de documentación no suben versión.
- Diseña recursos (música, glifos) en herramientas externas de IA y agradece un brief listo para
  pegar en un `.md`.
- Las auditorías son de solo lectura hasta que Ez decide.
- Móvil de pruebas: Doogee Blade 20 Max (360×718). El APK ya corre ahí.

## Decisiones de Ez que siguen en pie

- **v1 = web + Android, pago único 19,99 €.** Gratis: Pomodoro, «A tu ritmo» del día, 32 rutinas,
  Hidrátate, logros, estadísticas de Hoy. De pago: «A tu ritmo» semanal, 19 rutinas premium, el
  constructor de rutinas y las estadísticas de semana y año.
- **Los pagos esperan a cerrar Android** (Fase 6 del `ROADMAP.md`). Ruta prevista: Google Play Billing
  en Android y, en la web, Lemon Squeezy o Paddle con una clave firmada que se pega en Ajustes. Todo
  abre un único interruptor, `app/state-entitlement.jsx`. Ez descartó la prueba de pago de 3 días a
  3,99 €; cuando lleguen los pagos sopesará una prueba gratis de 7 días o una suscripción mensual.
- **Hasta v1 las rutinas premium están abiertas para todos** (`PREMIUM_ABIERTO_HASTA_V1`), con su
  «Premium» y sin «Pronto». El constructor sigue cerrado.
- Travesías y Caminos fuera de v1 (Caminos ocultos con `SHOW_CAMINOS` en `app/flags.js`).
- Icono de la app: Crema. Estilo del aro: «Aro grande». Id de la app: `com.ezradesign.pace`.
- Home del móvil: por libre, el móvil lleva la tarjeta corta de «A tu ritmo» (v0.141.0): «A TU RITMO»,
  «¿Cuánto trabajas hoy?», la línea del día sin horas, «Tú eliges las horas» y la píldora «Comienza →»
  en estilo «papel tonal». El escritorio no cambia.
- Mueve y Estira se pausan al salir de su pantalla (lo vigila un test).
- «Al calendario» en «A tu ritmo» (v0.140.0): calendario del móvil en Android (reuniones leídas en el
  dispositivo como «Ocupado», sin nombre), Google Calendar y Outlook en la web y un `.ics` en los dos.
- Música de Respira: seis pistas, una por familia (energía, equilibrio, balance-10, balance-12,
  relajación, pranayama), con una firma sonora común, en Sol. Sin percusión, banda 200 Hz–2 kHz,
  volumen plano, en bucle. Solo valen las generadas con ElevenLabs pidiendo la tonalidad de Sol. Las
  mareas de Balance de 10 y 12 s las sintetiza Claude exactas sobre un drone de Sol. Coherente 432
  nunca lleva música. El código que la carga es `app/ui/Sound.musica.jsx`.
- Glifos nuevos: misma familia y estilo que los 59 dibujos existentes. Ez rechazó figuras vestidas.

## Líneas abiertas y su siguiente paso

| Línea | Dónde está | Siguiente paso |
|---|---|---|
| Home del móvil antes de contestar el día | Ez eligió «la 2, pero mejor maquetada»: una sola frase, «Hoy voy por libre» junto a la pregunta y las horas de media jornada al elegirla. Hoy pide 28 px de scroll a 375×667 y 46 a 360×640. | Enseñar varias maquetaciones de la 2, que Ez elija, montarla con su prueba y subirla. Imagen de las opciones en `archivos/home-movil/`. |
| Android, Fase 2 | v0.142.0: el aviso de Foco llega a su hora sin abrir ajustes, lleva la vaca, icono de avisos (la C), `privacy.html` cubre la app y el workflow firma el AAB con la llave de subida, que está en los secretos desde el 7 oct. | Probar el APK en el Doogee (lista en `STATE.md`) y subir el AAB firmado (artefacto `pace-android-play`) a la prueba cerrada cuando Google apruebe la identidad de Ez. |
| Ficha de Google Play | Lista en `docs/launch/google-play/`: textos, respuestas de contenido (no recoge datos, 18+), icono, gráfico, capturas y el kit de testers. | Subirla cuando Google apruebe la identidad de Ez. Las URLs ya usan `pacegrass.app` y el correo de contacto es `hola.ezradesign@gmail.com`. |
| Dominio propio | Hecho en v0.143.0: `pacegrass.app`, comprado por Ez en Cloudflare, sirve la app en la raíz y `paceweb.pages.dev` sigue abierto sin redirigir (los datos son de cada dominio). | Nada. `www.pacegrass.app` no tiene DNS: si Ez la quiere, se añade en Cloudflare. |
| Landing | No hace falta ya. Hará falta antes de la verificación de Google y antes de vender. | Entonces: landing en la raíz y la app en `/app` del mismo dominio, con maqueta antes. |
| Calendario con Google y Microsoft | Hecho en código; sin ids la web solo ofrece el `.ics`. | Ez da de alta PACE en Google Cloud y Microsoft Entra (`docs/CALENDARIO_ALTAS.md`) y pasa los dos ids, que van en `CALENDARIO_IDS` de `app/ritmo/ritmo.calendario.web.js`. Con Google, verificación antes de pasar de 100 usuarios. |
| Música de Respira | De 20 tomas distintas de Ez solo 4 sirven, todas de ElevenLabs. Se estaba midiendo con un medidor propio. Pendiente que Ez decida si la música «respira» al ritmo del ejercicio (recomendado: mixto, sí en los de ritmo fijo y quieta en Rondas, Bhastrika y Kapalabhati). | Con las tomas nuevas: bajar a 432 (−31,77 cents), mono 64 kbps, bucle sin costura, medir banda y ciclo. Brief en `archivos/musica-respira/`. |
| Glifos | Faltan 3 de ejercicio (rana, pica en escritorio, descanso) y 19 de los 96 de logro. GPT Image bloquea las figuras desnudas y Ez no las quiere vestidas. | Rehacer los prompts desde el preámbulo con el que se hicieron los 59, sin ropa y sin que salte el filtro. Prompts y nombres de archivo en `archivos/glifos/prompts-glifos.md`. |
| «A tu ritmo» semanal | Es lo que se paga en v1 (Fase 3). | Maqueta con opciones para Ez. |
| Caza de bugs | v0.143.2: «Primera calistenia» y «Primer estirón» iban cruzados entre Mueve y Estira y los logros decían «Extra»; arreglado, y a quien ya los tenía se le corrigen solos. | Revisar la app a 360 px y 1280 px y arreglar la lista de Ez. |

## Lo que espera a Ez

1. Guardar una copia de la carpeta `PACE-llave-play` de su PC (la llave de subida a Play y su
   contraseña) fuera del ordenador: un USB y su Drive, por ejemplo.
2. Dar de alta PACE en Google Cloud y Microsoft Entra y pasar los ids.
3. Que Google termine de revisar su identidad en Play Console; luego reunir unos 15 testers con
   Android (Google pide 12 durante 14 días).
4. Nuevas tomas de música con ElevenLabs (2 o 3 de pranayama con tanpura) y los glifos que falten.

## Maquetas publicadas (cuenta anterior)

- Tarjeta por libre en el móvil (elegida la R3-tono): https://claude.ai/artifact/2jmBfnmmpq1K66372JwQTa
- PACE al calendario: https://claude.ai/artifact/MAK3Wc3LuK5RqnxLo2Crri
- Icono de avisos (elegida la C): https://claude.ai/artifact/AeRGsq65WfvGm8DXe8aEZu
- Imágenes guardadas en el repo: `archivos/tarjeta-hoy/` y `archivos/home-movil/`.

## Lo que no está en el repo, a propósito

Claves, contraseñas, tokens y correos personales no se suben nunca. La llave de Play va en los
secretos de GitHub, y su original, con la contraseña, en la carpeta `PACE-llave-play` del PC de Ez.
El correo de contacto de PACE, `hola.ezradesign@gmail.com`, sí está: es público a propósito
(privacidad y ficha de Play). El historial de las conversaciones no se migra: lo que importa está
aquí y en `git log`.

## Frase de arranque para la otra cuenta

> Retoma el proyecto PACE desde el repo ezradesign/Pace_app. Antes de nada lee CLAUDE.md, STATE.md y
> docs/traspaso/LEEME.md, y dime en pocas líneas dónde estamos y qué harías ahora. Háblame en español.
