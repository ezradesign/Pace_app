# El calendario se mantiene solo · decisiones de Ez y plan de montaje (14 oct. 2026)

Página que vio Ez: `propuesta.html` (esta carpeta; publicada en https://claude.ai/artifact/BceaWgs9dbLKYWdhhpMgKb).
Las fotos son de la app real (v0.166.0) con los textos nuevos puestos encima: lo que se monte tiene
que verse así. Los scripts que la generan no se versionan: se rehacen con Playwright si hace falta.

## Lo que eligió Ez (A en las cuatro, la recomendada)

1. **Cómo se mantiene: solo, mientras PACE está abierto.** PACE reescribe cada cambio sin que pulses
   nada mientras tenga permiso: Android siempre; Outlook en la web un día por conexión; Google en la
   web una hora, y después «Poner al día» (un toque) si algo cambia.
2. **El aviso: la pausa abre el evento.** Cada evento empieza en la pausa y lleva detrás el bloque que
   la sigue, con aviso al empezar. El primer bloque y el de después de comer van solos y sin aviso; el
   cierre del día es su propio evento, con aviso. Un jueves de jornada: 10 eventos y 8 avisos.
3. **Con el Foco en marcha en PACE, avisa solo PACE.** Al empezar un bloque, PACE quita del
   calendario el aviso de la pausa que viene detrás y lo devuelve si paras el bloque. Si cierras PACE
   con el bloque en marcha, esa pausa se queda sin aviso (aceptado).
4. **Hasta v1, abierto para todos, como las rutinas** (`PREMIUM_ABIERTO_HASTA_V1`). Después, de PACE
   completo; llevar el día y esquivar reuniones siguen gratis.

Ya decidido antes (relevo de LEEME, 14 oct.): no el Foco como «Ocupado» con su modo, no las pausas
entre reuniones, no la semana entera.

## Lo que se ve (aprobado mirando las fotos)

- Hoja «Al calendario», sin conectar: bajo «Tener en cuenta mis reuniones de hoy», la casilla
  **«Mantenerlo al día solo»**, marcada de entrada, con «Si el día cambia en PACE, cambia también allí,
  y cada pausa te avisa.» Sin derecho: la misma casilla apagada, con el candado (`PaceCandado`) y «Con
  PACE completo. Llevar el día y esquivar reuniones siguen gratis.»; tocarla abre `paceAbrirPremium`.
- Conectado y al día: resumen «Tu calendario se mantiene solo: lo que queda de hoy, de {a} a {b}, con
  aviso en cada pausa.»; la fila del destino dice «Al día · lo último, a las {h}» (Android) o «Al día ·
  conectado hasta las {h}» / «hasta mañana a las {h}» (web), y su botón es **«Desconectar»** (borde).
- Desconectar: «PACE deja de tocar tu calendario. ¿Y lo que queda de hoy?» con **«Quitarlo»** (lleno)
  y **«Dejarlo»**, dentro de la hoja.
- Web, permiso acabado y el día cambiado: resumen «El día ha cambiado desde las {h} y tu calendario aún
  no lo sabe.»; fila «Al día hasta las {h}» con **«Poner al día»** (lleno); nota «Google deja escribir a
  PACE una hora cada vez. «Poner al día» abre su ventana, que se cierra sola si sigues dentro de tu
  cuenta.» (Outlook: «un día cada vez»). Añadir en esa nota un enlace pequeño «Desconectar»: en ese
  estado no hay otro camino para salir (la maqueta no lo pintó).
- El enlace del panel (`RitmoAlCalendario`): «Al calendario» → **«Calendario al día»** / **«Poner al
  día»**. En el móvil vive en la hoja de «Ver todo»: la home no gana alto.
- Detalle no pintado, a contar a Ez: con un destino mantenido, la hoja no ofrece los otros dos destinos
  conectados (escribiría el día en dos calendarios y avisaría dos veces). «Otro calendario» sigue.
- «Hoy voy por libre» quita lo que quedaba de hoy. Al día siguiente, al pulsar «Comienza», el día va
  solo. Escribe un minuto después de cada cambio, para juntar varios.

## Lo técnico (investigado)

- Google en la web, sin servidor: el pase dura 1 h (`expires_in` 3599) y no hay renovación sin un gesto
  (`requestAccessToken` o la ventana de permiso necesitan un clic, aunque ya se diera el permiso).
- Microsoft en la web (app de una página): con `offline_access`, un pase de renovación que dura 24 h
  fijas (renovarlo no alarga el plazo). Se cambia por un pase nuevo con `POST .../token`
  `grant_type=refresh_token` desde el navegador. **Permiso nuevo: `offline_access`** (añadirlo a
  `docs/CALENDARIO_ALTAS.md`, paso 5, y a `scope` en la URL y en el canje).
- Los pases siguen en `sessionStorage` (se olvidan al cerrar la pestaña, como dice `privacy.html`);
  quien teletrabaja deja PACE abierto en una pestaña todo el día. Cambiar en `privacy.html` (es / en)
  «dura una hora» por «el de Google dura una hora y el de Microsoft, como mucho un día», y añadir que con
  «Mantenerlo al día solo» PACE lo vuelve a escribir mientras está abierto y cada pausa lleva un aviso del
  calendario. Es pública: que Ez lo lea antes de subir.
- Google: no hace falta permiso nuevo (`calendar.events.owned` ya cubre crear, cambiar, borrar y los
  avisos). Su verificación, la de siempre, antes de pasar de 100 personas.
- Android: no hay permiso nuevo. El complemento (`@ebarooni/capacitor-calendar` 8.8.0) tiene
  `modifyEvent({ id, title, description, startDate, endDate, alerts })` y `createEvent({ alerts })`;
  `alerts: [0]` = aviso al empezar (el complemento invierte el signo: negativo = antes, positivo =
  después; los positivos no los acepta Google al sincronizar, no usarlos). `listEventsInRange` devuelve
  `title`, `description`, `alerts`. `modifyEvent` sobre un id que no existe no falla y deja avisos
  huérfanos: modificar solo ids que salen en la lista.
- Los avisos de calendario solo suenan al empezar un evento (o antes), en los tres: de ahí la forma 2A.
- PACE cerrado: nada se reescribe (no hay nada despierto); lo escrito y sus avisos siguen. Al abrir, lee
  reuniones y pone al día. `@capacitor/background-runner` no puede hablar con el complemento del
  calendario: descartado.

## Plan de montaje

Archivos (todos < 500 líneas; `var`/`function` en los `.js`; `Object.assign(window, …)` al final):

1. **`app/ritmo/ritmo.calendario.solo.js`** (puro, nuevo, después de `ritmo.calendario.destinos.js` en
   `PACE.html`):
   - `calendarioEventosConAviso(m, t, tn, lang, callar)` → todos los eventos del día en la forma 2A:
     `{ clave, desde, hasta, titulo, texto, aviso }`. Clave `b<k>` = el evento que contiene el bloque k;
     `cierre` = el cierre. Pausa + foco solo si el foco va pegado (`f.desde === p.desde + p.dur`); una
     pausa delante de una reunión va sola. `aviso` = empieza en pausa o cierre, salvo `desde === callar`.
     Títulos: «Estira: Escritorio express · luego foco 2 de 9», «Pausa larga · luego foco 4 de 9»,
     «Foco 1 de 9», «Cierre del día». Texto: los platos («Estira · Escritorio express (2 min).»), el
     agua, «Después, 45 min de foco.» y el pie con la marca (`CALENDARIO_PIE`).
   - `calendarioDeseados(s, textos)` → `{ fecha, eventos }` con `inicio`/`fin` en ms
     (`calendarioInstante`), o `null` si no hay opinión (`!R.dia` mientras se elige: no borrar). Con
     `R.libre`, `eventos: []`. `callar` = `ritmoFocoCorriendo() && plan.actual ? actual.desde +
     actual.dur : null` (decisión 3).
   - `calendarioIgual(a, b)`: inicio, fin, título, texto (normalizado `\r\n`→`\n`, `trim`) y aviso.
   - `calendarioCambios(deseados, existentes, ahoraMs)` → `{ crear, cambiar: [{ id, ev }], borrar }` por
     clave: los dos y distintos → cambiar si alguno acaba después de ahora (así un bloque acortado
     corrige su fin y la historia no se reescribe); solo deseado → crear si acaba después de ahora; solo
     existente (o sin clave, o repetido) → borrar si acaba después de ahora.
   - `calendarioPendiente(deseados, escrito, ahoraMs)`: lo mismo contra lo último escrito, sin red. Con
     el paso del tiempo solo, no sale nada pendiente.
2. **`app/ritmo/ritmo.calendario.motor.js`** (nuevo): lo escrito en `localStorage`
   `pace.calendario.escrito` = `{ fecha, destino, alDia, eventos: { clave: { id, inicio, fin, titulo,
   texto, aviso } } }` (del dispositivo; fuera de `pace.state.v2` y de la copia de «Tus datos»).
   - `calendarioSoloActivo()`: `c.mantener`, destino conectado y disponible, `puedeMantenerCalendario()`.
   - Revisar en cada `subscribe` del estado (juntando con `setTimeout 0`), cada 60 s y al volver
     (`visibilitychange`): si hay pendiente, escribir a los 60 s. Reuniones cada 5 min con
     `calendarioRefrescarReuniones` (ya se limita sola).
   - Escribir: acceso sin gesto (Android `paceAndroidCalendarioTienePermiso`; web el pase vivo o, en
     Microsoft, la renovación); sin acceso, estado «pendiente» para la hoja y el enlace. Con acceso:
     listar los eventos de PACE de hoy, `calendarioCambios`, aplicar, guardar lo escrito y avisar con
     `pace:calendario-solo`. Dentro de `navigator.locks.request('pace.calendario.solo')` si existe (dos
     pestañas). Un 401 borra el pase; un fallo de red reintenta a los 5 min.
   - `calendarioSoloPonerAlDia()` (con gesto: `calendarioAcceso`, puede abrir la ventana) y
     `calendarioSoloDesconectar(quitar)`: con «Quitarlo», borra lo de PACE de hoy que no ha acabado;
     luego `mantener: false`, borra lo escrito y el pase de ese proveedor.
3. **`ritmo.calendario.destinos.js`**: `calendarioLlevar(destino, { mantener })`: con `mantener`, escribe
   con `calendarioDeseados` + `calendarioCambios` (no el borrar-y-crear de hoy) y guarda `mantener:
   true`; sin él, como hoy y `mantener: false`. `calendarioRefrescarReuniones` usa el acceso sin gesto
   del motor (incluida la renovación de Microsoft).
4. **`ritmo.calendario.web.js`**: listar con contenido (Google: `privateExtendedProperty=paceDia=…`, con
   `paceClave` en `extendedProperties.private`; Microsoft: el filtro de siempre por `CALENDARIO_MS_PROP` y
   una segunda propiedad `String {7b3f2c1e-8d4a-4e6b-9a5c-2f1e0d9c8b7a} Name paceClave`, con `Prefer:
   outlook.body-content-type="text"`); crear con clave y aviso (Google `reminders.overrides: [{ method:
   'popup', minutes: 0 }]`; Microsoft `isReminderOn` + `reminderMinutesBeforeStart: 0`); `PATCH` para
   cambiar; `offline_access` y la renovación de Microsoft; `calendarioPaseHasta(prov)` para «conectado
   hasta…». Si pasa de 500 líneas, partir en `ritmo.calendario.web.api.js`.
5. **`app/ui/android.js`**: `paceAndroidCalendarioCambiar(id, ev)` (`modifyEvent`), `alerts` en crear
   (`ev.aviso ? [0] : []`) y `titulo`/`aviso` en la lista. Con el id → clave de lo escrito.
6. **`app/state-entitlement.jsx`**: `puedeMantenerCalendario()` = `hasPremiumEntitlement() ||
   PREMIUM_ABIERTO_HASTA_V1`, y el comentario de `PREMIUM_ABIERTO_HASTA_V1` dice que también abre esto.
7. **`RitmoCalendario.jsx`** y **`app/i18n/strings/calendario.js`** (es y en): lo de arriba. El enlace
   se repinta con `usePace` y con `pace:calendario-solo`.
8. **Pruebas** (`tests/ritmo-calendario-solo.spec.js`, nueva): la forma 2A (10 eventos y 8 avisos en el
   jueves de `ritmo-calendario.spec.js`), `callar`, `calendarioCambios` en tabla de casos; Android con el
   espía de `ritmo-calendario.spec.js` más `modifyEvent`: conectar, recolocar → `modifyEvent` sin
   duplicar, por libre → borra, Foco en marcha → la pausa siguiente sin aviso, desconectar con «Quitarlo»,
   el enlace «Calendario al día»; Google con su red falsa: `PATCH` dentro de la hora, pasada la hora
   «Poner al día»; Microsoft: renovación sin ventana; sin derecho: candado e invitación. Las pruebas de
   hoy de `ritmo-calendario.spec.js` desmarcan la casilla nueva (siguen probando «Añadir» de una vez).
9. **Documentos**: fila nueva arriba en `DECISIONES_TECNICAS_VIGENTES.md`; `CALENDARIO_ALTAS.md`
   (`offline_access`); `privacy.html` (para que Ez lo lea); el mensaje del commit con `CHANGELOG:`,
   `STATE:` y `DECISIONES:`.
