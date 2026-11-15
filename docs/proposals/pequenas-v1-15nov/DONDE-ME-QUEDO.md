# Arreglos pequeños antes de v1 · dónde me quedé (15 nov. 2026)

Rama `claude/pequenas-v1-15nov-39e6cb` (worktree `landing-web-5ec1e5`, con `node_modules` enlazado: quitar el
enlace con `cmd /c rmdir` antes de borrar el worktree). Paré con el uso de 5 h al 92 %; se reinicia a las 20:30.

## Hecho, con su prueba vista caer con un mutante, `verify` en verde y subido

1. **854bd27d · Buscadores y pestaña.** El `<title>` de `index.html` sin « — vX.Y.Z» (paso 8b del build; en
   `PACE.html` sigue, es uno de los siete sitios), la `description` de la raíz con la frase de la landing,
   `robots.txt` y `sitemap.xml` propios (en `web-dist.js`; la tanda web de `verify` los vigila), y la cuenta
   atrás «24:13 · Foco · PACE» mientras corre un Foco o una pausa (`app/focus/FocusTimer.titulo.jsx`).
   `tests/pestana-cuenta.spec.js` (3); ingles-6 al día. 55 vecinas en verde.
2. **e5593c63 · El aviso de fin no pisa al siguiente.** Web: una etiqueta por bloque y el nuevo cierra los
   viejos (sigue `silent`). Android: el complemento avisa con `setOnlyAlertOnce(true)` y el mismo id, así que
   el del bloque siguiente sustituía al anterior SIN SONAR si seguía en la bandeja; ahora se quita lo entregado
   (`removeDeliveredNotifications`) antes de pedir el de otro bloque u otra pausa. iPhone, igual.
   `tests/aviso-no-pisa.spec.js` (4); 86 vecinas y las 16 del iPhone en WebKit, en verde.

`MINIMO_PRUEBAS` va en 1596. Una fila arriba en `DECISIONES_TECNICAS_VIGENTES.md` por cada punto.

## Lo que falta (en este orden), con lo ya leído

3. **Wifi mala y Safari** (2.T2, T10 y 2.T6). `sw.js:384-394`: la navegación va a la red sin tope y la copia
   solo sale en el `catch`: poner un tope de unos 3 s y, si no llega, la copia guardada (cuidado con la fila
   «SIN RED, CADA NAVEGACIÓN RECIBE SU PÁGINA O UN ERROR» de las decisiones: el respaldo a la app solo para
   `/` e `/index.html`). `app/events/events-store.js:412-418` pide `storage.persist()` solo en el móvil, a
   propósito (Firefox lo pregunta con un aviso): pedirlo también en Safari (WebKit no pregunta). Recomendar
   instalar y recordar la copia SE VE: pintarlo con opciones para Ez, no montarlo.
4. **Menos descanso** en «Levántate y sube» (`app/move/move.data.js:29-45`: 88 s de trabajo y 90 de descanso)
   y «Piernas sin pasos» (`:85-100`: 94 y 90); las dos `gentle` y gratis. Los ids van cruzados (Mueve =
   `extra.*`). Los 30 s salen del ajuste 20/30/45 (`DECISIONES_PRODUCTO.md:934`) y `MoveSessionV1.support.jsx`
   es de la rama de la voz: tocar SOLO los datos. La base (`docs/product/BASE_MUEVE_ESTIRA.md:169`) da 10-30 s
   en actividad suave; la fila no dice cuánto: decirlo en el informe.
5. **Textos.** `/beta` dice «sin rachas» en el texto alternativo (`beta/index.html:194`) y hay logros de días
   seguidos (`app/achievements/catalog.js:37-48`): es falso. Cambiarlo, también el subtítulo de la captura 6
   en `scripts/play/capturas.js` (rehacer la 6 en es y en con ese guion) y las `beta/logros-*.webp` como dice
   `docs/launch/google-play/SUBIDAS.md`. La pausa: «Pausa bien hecha» titula la ventana ANTES de hacerla, y
   «3 MIN» en la propuesta frente a «2–3 MIN» en la ficha (con jornada, «2 MIN» y «1–2 MIN»): auditoría
   F3 y F4 en la rama de la auditoría. Inglés (2.T5): `app/state-custom.jsx:77` guarda «Rutina propia» a pelo
   (la clave `custom.code` existe en `sessions.js:186`), `manifest.webmanifest` es `"lang": "es"`, el atajo de
   Mueve dice «movilidad» y Estira no tiene atajo. Y `screenshots` en el manifiesto (fila 23).
6. La página «Montado» en esta carpeta (estilo de `docs/proposals/arreglos-s3-s4-13nov/index.html`),
   publicada como Artifact, y el informe a la coordinadora.

Pruebas vecinas siempre con `--workers=1` y `PACE_E2E_PORT=8845`. Ojo: en Git Bash, una cadena entre comillas
dobles con backticks ejecuta lo de dentro, y un `node -e` con heredoc se come las barras invertidas: editar
con el Edit o con un `.js` escrito en `$TEMP`.
