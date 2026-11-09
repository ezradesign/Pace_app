# Auditoría de producto con Fable 5.2 · 9 nov. 2026 · A MEDIAS

> Sobre `main` en 03c78e9b (v0.196.0), en la rama `claude/auditoria-fable-9nov-8401fc`. No monta nada en la app.
> **Está a medias**: la sesión paró al 83 % de las 5 h, con otras dos sesiones corriendo a la vez. Lo que hay
> abajo es lo que dio tiempo a comprobar; lo que falta, y cómo seguir, está en `DONDE-ME-QUEDO.md`.
> **La página para Ez no está hecha.**

Cada punto dice cómo se comprobó: **[código]** es leído en el archivo y la línea que se citan; **[app]** es visto
en la web de este worktree (puerto 8920) con Playwright, con su foto en `fotos/`; **[idea]** es propuesta, sin
comprobar ni decidir.

## Qué se miró y qué no

| Mirada | Estado |
|---|---|
| 1 · Monetización | A medias: leído qué es de pago, dónde se invita y dónde se puede comprar; vivida solo la bienvenida. Sin mirar: la app con el interruptor apagado (lo que ve quien no paga desde v1), /premium, la hoja del día de v1, la valoración, la carta del lunes |
| 2 · El Foco con los ejercicios | Solo leído el menú de la pausa y lo que pasa al elegir. **Sin vivir en la app**: ni un bloque entero, ni la pausa con jornada, ni la vuelta al Foco, ni el móvil bloqueado |
| 3 · Flujos de ejercicios | Sin mirar |
| 4 · Interfaz | Solo la bienvenida y la home a 360 px en claro. Sin 1280, sin oscuro |
| 5 · Dudas del resto | Dos textos, de paso |

## 1 · Monetización

### Qué es de pago hoy [código]

Todo pasa por `app/state-entitlement.jsx`. PACE completo son seis cosas:

| Qué | Cómo se decide | Dónde se ve cerrado |
|---|---|---|
| 20 rutinas: 7 de Respira, 7 de Mueve, 6 de Estira | `canAccessRoutine` (línea 92); `access: 'premium'` en `BreatheLibrary.jsx`, `move.data.js` y `extra.data.piernas.js` | La tarjeta con su candado: `RoutineCard.jsx:98` |
| «Tus rutinas», el constructor | `puedeCrearRutinas` (133) | `CustomRoutines.jsx:61` y `main.eventos.jsx:45` |
| El calendario que se mantiene solo | `puedeMantenerCalendario` (124) | `RitmoCalendario.jsx:269` |
| Mes, año y «Qué te ayuda» en Estadísticas | `StatsPanel.jsx:258` | La pestaña: `StatsPanel.jsx:291` |
| La semana que aprende y la carta del lunes | `puedeAprender` (140) | **En ningún sitio** |
| Que las rutinas cambien de un día a otro | `puedeVariar` (147) | **En ningún sitio** |

### M1 · Lo más propio de PACE completo es lo único que no se ve cerrado [código]

`puedeAprender` y `puedeVariar` se consultan en `state-ritmo.motor.jsx:31`, `state-ritmo.jsx:160`,
`state-ritmo.series.jsx:56` y `StatsAyuda.jsx:29`, y en los cuatro la respuesta «no» solo apaga la función. Las
cinco llamadas a `paceAbrirPremium` de la app están en las otras cuatro filas de la tabla. Es decir: desde v1, a
quien no pague, «A tu ritmo» le servirá las mismas rutinas cada día y no le escribirá la carta, y nada en pantalla
le dirá que eso existe. Lo que se enseña cerrado (rutinas sueltas, estadísticas) es lo que menos distingue a PACE
de otras apps; lo que no se enseña es justo lo que la invitación llama «Una semana a tu medida».

*Falta comprobarlo en la app con `PREMIUM_ABIERTO_HASTA_V1` apagado: puede que la hoja del día o la carta digan
algo que el grep no ve.*

**[idea]** Que cada una tenga su sitio donde tocar, sin tapar nada: el lunes, donde iría el sobre de la carta, una
línea «La carta del lunes es de PACE completo»; y en la tarjeta del día, junto a la frase que ya hay, «Hoy, como
ayer. Con PACE completo cambia cada día». Las dos abren la invitación de siempre. Hay que pintarlo antes.

### M2 · Antes de v1, quien ya usa PACE no tiene dónde comprar dentro de la app [código]

Ez decidió vender ya el de por vida en la web. Los botones de compra viven en dos sitios: la última pantalla de la
bienvenida (`OnboardingCompleto.jsx`, una vez, a quien llega nuevo) y la invitación en su modo `invita`
(`PremiumInvitacion.jsx:174`). La invitación solo se abre al tocar algo cerrado, y hasta v1 no hay nada cerrado;
la fila de Ajustes la abre en modo `codigo` (`PremiumSection.jsx:76-98`), que no enseña la tienda. Resultado: al
encender el enlace de Stripe, los testers y quien ya usa PACE cada día, que son quienes antes pagarían, no verán
ningún botón. Solo les queda llegar por su cuenta a pacegrass.app/premium.

**[idea]** Con la tienda abierta, una fila más en Ajustes, dentro de «PACE completo»: «Tenerlo para siempre ·
19,99 €», que abre la invitación en modo `invita`. No salta sola ni tapa nada. Poco trabajo.

### M3 · La bienvenida habla de «v1» a quien no sabe qué es [app]

La última pantalla de la bienvenida dice «PACE es gratis. Y hasta v1, PACE completo también está abierto para
todos», «Después, 2,99 € al mes con 7 días gratis, o 19,99 € una vez» y, bajo el botón, «Al llegar v1 tendrás tu
semana de prueba, y las rutinas que ya hayas hecho se te quedan» (`fotos/p1-02-onb-sig-0.png`). «v1» es palabra
de casa: alguien nuevo no sabe qué es ni cuándo llega. La invitación dice lo mismo de otro modo: «Llega con la
versión 1» (`premium.js:24`). **[idea]** «Mientras PACE está en pruebas, PACE completo está abierto para todos»
y «Cuando salga a la venta tendrás…». Los textos están en la lista `PACE_TEXTOS_V1`, así que el cambio es de
cuatro frases y sus dos idiomas.

### M4 · La bienvenida, vivida [app]

Tres pantallas y una visita de cuatro paradas: portada con «Todo local · Sin cuentas · Gratis, lo esencial,
siempre»; «¿Cómo es tu semana?», con su «Ahora no, quiero probar primero»; PACE completo; y la visita (el aro,
Actividades, Tu día, Ajustes). Sin errores en la consola. Aceptando la semana propuesta, la home a 360 × 740
queda entera sin scroll, con «Hoy, como cada martes · Jornada entera, 9:00–17:00 · Preparar jornada»
(`fotos/p1-04-home-primera-vez.png`). Dos cosas que mirar con calma al seguir:

- La pantalla de PACE completo llega **antes** de que la persona haya hecho nada. Lee cuatro promesas («la carta
  del lunes», «qué te ayuda») que aún no puede entender. Es decisión de Ez (15 oct., «la venta se decide en la
  bienvenida») y no se reabre; solo se apunta que, hasta v1, esa pantalla no vende nada y sí alarga la entrada.
- Tras la visita, la home ofrece a la vez «Empezar foco», cuatro actividades y «Preparar jornada». Falta vivir
  qué pasa con cada una como primera acción.

## 2 · El Foco con los ejercicios

Solo leído; nada de esto está vivido todavía.

- **Qué pasa al acabar un bloque [código]**: `handleFocusFinish` (`main.jsx:212`) abre el menú de la pausa. Si hay
  propuesta (`breakPropuesta`, `BreakMenu.support.jsx:158`), sale una rutina con su motivo y un botón, y las otras
  tres actividades en una línea. Sin propuesta, cuatro tarjetas con «Para ti» en la más necesaria.
- **F1 · Sin propuesta, elegir una actividad abre la biblioteca entera [código]** (`main.jsx:269-272`): tras 25
  minutos de trabajo, tocar «Estira» lleva a elegir entre todas las rutinas. Es el momento de menos ganas de
  decidir. Con propuesta se entra directo. **Falta ver en la app cuántas veces sale el menú sin propuesta.**
- **F2 · Al cerrar el ejercicio se vuelve a la home [código]** (`alSalirDeSesion`, `main.jsx:236`), salvo que la
  pausa de «A tu ritmo» tenga otro plato detrás. Con jornada, el aro cuenta la pausa y vuelve al Foco sin
  arrancarlo (`state-ritmo.pausa.jsx`, cabecera). **Falta ver qué dice la home sin jornada al volver**: si invita
  al bloque siguiente o deja a la persona sin saber qué toca.

## 5 · De paso

- El lema del logo se lee «FVFN» en vez de «EVEN» en la portada de la bienvenida (`fotos/p1-01-bienvenida-1.png`).
  Ez ya lo sabe y lo dejó como está el 4 nov.; se apunta porque es lo primero que ve alguien nuevo.

## Decisiones de Ez que pueden frenar la venta (dicho una vez)

- **Vender el de por vida mientras todo está abierto** (5 nov.): quien compre hoy no recibe nada que no tenga ya.
  Por eso M2 importa: los únicos que comprarían ahora son quienes ya quieren a PACE, y son los que no ven el botón.
