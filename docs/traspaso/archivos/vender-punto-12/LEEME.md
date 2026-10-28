# Lo que falta para vender (punto 12 del ROADMAP), 28 oct.

Rama `claude/clever-gagarin-6701aa`, sobre `main` en 4e78f62 (v0.184.0). Las cuatro piezas que Ez decidió el 15 oct.
(`DECISIONES_PRODUCTO.md`, «Cómo se vende PACE completo» y «Cómo se cobra PACE completo») y que la auditoría del 28 oct.
encontró sin montar. Sin versión nueva: la pone la coordinadora al juntar.

Maqueta para Ez: https://claude.ai/artifact/9MnNL8b5BYWcX9Fsa7vnAa (`docs/proposals/vender-punto-12-28oct.html`),
recomendado **1A 2A 3A 4A**. Fotos de la app real (v0.184.0) con la propuesta metida antes de montar (`propuesta.js`,
`fotos.js`, `pagina.js` de esta carpeta) y del borrador de `/recuperar` (`recuperar.html`).

## Hecho (no se ve)

1. **La valoración de Google Play** (reseñas, punto 6). `android/.../PaceValoracion.java` abre la ventana de Google
   (In-App Review, `com.google.android.play:review:2.0.2`, que no pide permisos) y está registrado en `MainActivity`.
   `app/ui/valoracion.js` cuenta las pausas enteras (las mismas que dan logros: las tres `complete*Session` llaman a
   `paceValoracionPausa(entera)`), solo donde hay ventana (`PACE_VALORACION_PLATAFORMAS`, hoy `['android']`); con la
   quinta espera a que no haya nada delante (la pantalla final, otro diálogo, un sello, PACE en el fondo) y apunta
   `valoracion.pedida` ANTES de llamar, porque Google no dice si salió. Cuenta desde esta versión: quien ya hizo
   cincuenta pausas la verá tras la quinta de ahora. `verify` (verify.android.js) vigila la pieza, la librería, el
   orden de `pedida` y que cada complemento propio de la carpeta esté registrado en `MainActivity`.
   Prueba: `tests/valoracion-play.spec.js` (cae contra v0.184.0).
   **El Java no lo ha compilado nadie**: aquí no hay JDK ni SDK de Android, y lanzar el workflow Android en esta rama
   dejaría un AAB firmado llamado `PACE-0.184.0.aab`, igual que el que Ez va a subir a Play. Lo compila el workflow
   Android al juntar en `main`; si cae, es esta pieza.
2. **El paso a v1 sin quitar nada** (reseñas, punto 1), por dentro. `app/state-paso-v1.js`: el primer arranque con
   `PREMIUM_ABIERTO_HASTA_V1` en false apunta `pasoV1` una sola vez. Quien ya usaba PACE (la bienvenida acabada o algo
   hecho) recibe siete días con todo abierto y conserva las de pago que hizo: las del registro de eventos (terminadas
   o no), las de `routineCounts` (`rutina.<id>`) y las que contestó en «¿Te ayudó?». Las propias del constructor no
   entran (quedan guardadas y cerradas, como se decidió). La lista espera a los catálogos, que cargan después: sin
   ellos se fijaría vacía. Quien instala ya en v1 recibe `{ previo: false }`. En el guard, `paceAbiertoAhora()` es lo
   que abría el interruptor (hasta v1 para todos; desde v1, la semana) y `canAccessRoutine` abre además las
   conservadas (`pacePasoV1Conserva`); Estadísticas pregunta a `paceAbiertoAhora` en vez de al interruptor.
   El interruptor sigue en true. Prueba: `tests/paso-v1.spec.js`, que lo fuerza a false antes de que cargue la app.
3. **`/recuperar`, la función** (cobro, punto 2). `functions/api/recuperar.js` y `stripeBuscarCompra` en
   `cobro/stripe.js`: con el correo y el número del recibo busca la compra en Stripe en ese momento, con una llave
   restringida de solo lectura (`STRIPE_LECTURA`, paso 5 nuevo de `docs/launch/cobro-web.md`); la de por vida se
   vuelve a firmar con k2 y su pedido, y la mensual da el último código de su suscripción (410 si terminó). No guarda
   nada; diez intentos por hora por conexión, con la huella de la IP en la caché, como «Avísame». Apagada sin las tres
   piezas. Prueba: `tests/cobro-recuperar.spec.js` (en Node, con un Stripe falso).
   **Sin probar contra Stripe**: no se sabe qué número trae el recibo de Stripe en su modo «vende por ti». La función
   acepta el del recibo del cobro y el de la factura (la primera de la mensual o una renovación); se mira con el modo
   de pruebas de Stripe, como dice la guía.

## Espera a Ez (lo que se ve)

Las cuatro preguntas de la maqueta. Con la respuesta, lo que queda por montar:
- **1** · el aviso del día de v1 (con `pacePasoV1PorAvisar` y `pacePasoV1Avisado`, ya hechos) y la fila de Ajustes
  «Prueba hasta el…».
- **2** · la página `/recuperar` (el borrador es `recuperar.html`; va a `recuperar/index.html` y a `WEB_CARPETAS` de
  `scripts/web-dist.js`), los enlaces desde gracias y /premium, «¿Lo has perdido?» en la hoja del código y la frase
  de `privacy.html`.
- **3** · los botones de compra en la invitación (`PremiumInvitacion.jsx`, con `paceTiendaPlanes` y `paceComprar`).
- **4** · si es la A, la pieza del iPhone (SKStoreReviewController) y `'ios'` en `PACE_VALORACION_PLATAFORMAS`.

## Para la coordinadora, al juntar

- **CHANGELOG** (propuesta, a completar con lo que elija Ez): «Lo que faltaba para vender: la ventana de Google Play
  para valorar PACE, una vez tras la quinta pausa entera; el paso a v1 sin quitar nada (la semana de prueba de quien
  ya usaba PACE y, para siempre, las rutinas de pago que ya hizo), listo detrás de `PREMIUM_ABIERTO_HASTA_V1`;
  `/recuperar` con el correo y el número del recibo; y la invitación con los botones de compra.»
- **STATE**, en «Lo siguiente»: el punto 3 (el código que falta para vender) pasa a hecho; queda Play Billing y la
  compra de Apple. En «Espera a Ez»: la llave restringida `STRIPE_LECTURA` al crear la cuenta de Stripe (paso 5 de
  `docs/launch/cobro-web.md`) y mirar en el modo de pruebas qué número trae el recibo.
- **ROADMAP**, punto 12: hecho; el punto 17 (v1) ya solo apaga el interruptor y quita «Da de pastar a la vaca».
- El workflow Android compila `PaceValoracion.java` por primera vez en `main`.

**Antes de archivar la sesión**: `node_modules` de este worktree es un enlace (junction) al del repo principal. Se
quita con `cmd /c rmdir node_modules` desde la raíz del worktree, nunca con un borrado recursivo.
