# PACE · Estado

**Versión:** v0.221.0 · 26 nov. 2026, en la rama `claude/primera-impresion-26nov` hasta el «júntalo» de Ez (la primera impresión: el aro lleva la jornada, los precios tras la primera pausa, la visita en tres paradas). En `main`, la 0.220.0. Los testers tienen la 0.205.0. Qué trajo cada versión: `CHANGELOG.md`. Las reglas que no se pueden
romper: `docs/product/DECISIONES_TECNICAS_VIGENTES.md`.

## Punto de partida (25 nov.)

Ez limpió el proyecto para retomar desde lo publicado: **`main` = 0.220.0** más el arreglo de `ritmo.spec` (ef0e2be, CI en
verde). No hay más ramas ni PRs abiertos. Lo que no entró (las V, M5A/M12A, las tiendas 0.221.0, los diagnósticos) quedó
guardado en etiquetas `archive/*-25nov` (lista en `docs/traspaso/LEEME.md`); nada de eso cuenta como pendiente salvo que
Ez lo pida. La dirección siguiente es la **«A»**: avisos durante la jornada sin pulsar nada (en diseño, sin código).

## Dónde estamos

- **Web** en https://pacegrass.app, publicada desde `dist/` (`node scripts/web-dist.js`). La raíz tiene dos caras
  (`landing/cara.js`): quien ya usa PACE ve la app y quien llega nuevo, la landing. `/premium` con «Avísame», `/beta`, `/gracias`
  y `/recuperar`.
- **Android**: cada push a `main` compila el APK y el AAB firmado (`pace-play-vX.Y.Z`). **iPhone**, dentro de v1: TestFlight se
  sube desde GitHub sin Mac. La 0.205.0 está en revisión en la prueba cerrada de Play y en TestFlight desde el 15 nov.
- **La app**, entera: Foco, Respira, Mueve, Estira, Hidrátate, logros, Estadísticas con «Qué te ayuda» y «A tu ritmo».
  PACE completo, abierto para todos hasta v1 (`PREMIUM_ABIERTO_HASTA_V1`); la compra de las tres tiendas está escrita y
  apagada hasta las altas (0.211.0). Los Caminos, ocultos hasta después de v1 (`SHOW_CAMINOS`).

## Lo siguiente

El orden hasta v1 está en `ROADMAP.md` («Lo que queda hasta v1.0», al día el 23 nov.). El tramo de código está hecho: **la
fecha de v1 la ponen los 12 testers con sus 14 días seguidos, que aún no han empezado, y las altas de Ez para cobrar.**

1. Subir la 0.220.0 de prueba a Play y a TestFlight. Las
   notas y el «Qué probar» de la 0.218.0 (`docs/launch/google-play/SUBIDAS.md`) siguen siendo ciertas en la 0.220.0.
2. Los testers: 12 durante 14 días seguidos (hay 5 o 6; `/beta` y el grupo, listos: `testers.md`).
3. Las altas: perfil de pagos de Play; acuerdo de apps de pago de Apple (banco, W-8BEN, programa para pequeñas empresas y
   una dirección visible en la UE); los datos del aviso legal (nombre, NIF y contacto), la revisión profesional y Resend
   (`/desistir`); Google y Microsoft para el calendario de la web (v1 sale con él «en pruebas», Ez, 16 nov.).
4. El día de v1: apagar `PREMIUM_ABIERTO_HASTA_V1`, quitar «Da de pastar a la vaca» y probar comprar, restaurar y cancelar.

## Espera a Ez

- **La «A»**: elegir las reglas de los avisos (R1-R6) antes de montar nada.
- **Subir la 0.220.0** a la prueba interna de Play (y de ahí a la cerrada) y a TestFlight, con las notas de `SUBIDAS.md`.
  «Escríbenos» ya escribe a `hola.ezradesign@gmail.com` (Ez, 24 nov.).
- **Probar en sus aparatos**: la miniventana en su Chrome, el aviso de la web del móvil con la pantalla bloqueada (la 4 del
  móvil, 22 nov.), los pasos de cinco minutos de la página de las apps, lo privado del calendario en Android, la voz de Respira.
- **Play Console**, al subir la siguiente beta: volver a pegar el párrafo «A tu ritmo» de `docs/launch/google-play/ficha.md`
  (es y en). **TestFlight**: dar la versión al grupo «Testers iPhone».
- **Stripe** (`docs/launch/cobro-web.md`): el modo real está activado y con su aviso y su llave; para vender el de por vida
  en la web faltan lo legal, Resend y la dirección del enlace real. El mensual llega con v1.
- **Sin decidir**: S3, el código portable. **Sin empezar**: la revisión de un fisioterapeuta que pide `CONTENT.md`; los
  dibujos de dos logros (Año nuevo, que se repite, y Vaca feliz).
- **Cuentas**: la verificación en dos pasos en GitHub, Cloudflare, Stripe, Google y Apple; mandar a cada tester su enlace
  de `codigos-tester.csv`; una segunda copia de las llaves privadas fuera de casa (dónde están, lo sabe Ez). «Avísame»: el
  nombre que firma su privacidad, el KV `pace-avisame` y el token de Web Analytics solo para /premium.

La lista por orden y sin jerga, en `docs/traspaso/hoja-de-ruta-20oct.html` (al día el 24 nov.), que se publica como la hoja de pasos de cada cuenta (https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6 y
https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT) y la de solo lo pendiente (UkETeVK2Ee97N8kSvupwC8 y LtUEUn4yjYXjyq4AqJEtqV).
Ez se pierde con mucho abierto: a «¿qué toca?», una sola cosa.

## Deuda conocida, sin fecha

- A 320×568 la home del móvil pide scroll (Ez lo acepta), y por debajo de ~470 px de alto en el ordenador ampliado.
- El aviso a mitad de un bloque largo · N9, la barra lateral durante un Foco (falta el vídeo de Ez) · los botones del aviso
  fijo de Android (la C de N4) · la pseudolocalización.
- Riesgo aceptado (Ez, 22 oct.): dos pestañas que apuntan algo a la vez (`tests/pestanas-estado.spec.js`).
- Al volver los Caminos, tres casos de la auditoría del 21 oct. (`olvidarCuerpoGuardada` con `inPath`, «¿Salir del Camino?»
  sin suspender la sesión de debajo y sin `usePaceDialogo`). Y, después de v1, borrar el reloj de barra, el analógico y el
  círculo «orgánico» (D6 B de Ez, 23 nov.; `app/flags.js`).

La historia: `CHANGELOG.md`, `git log -- STATE.md` y `docs/traspaso/LEEME.md`. El `STATE.md` de antes de s200, en
`docs/archive/STATE_HASTA_S200.md`.
