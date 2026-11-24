# Auditoría de producto con Fable 5.2 · 9 y 10 nov. 2026

> Sobre `main` en 03c78e9b (v0.196.0), en la rama `claude/auditoria-fable-9nov-8401fc`. No monta nada en la app.
> Hecha en dos tandas (la noche del 9 y la mañana del 10), cortadas por el uso de la cuenta. **Miradas 1 y 2, hechas y
> vividas en la app; 3, 4 y 5, sin mirar** (`DONDE-ME-QUEDO.md`). La página para Ez: https://claude.ai/artifact/2QnMBypqSRVJCmPeNJazZA
> (cuenta de 5iWBf; copia en `pagina.html`, que se genera con `node genera.js`).
> **Lo vivido el 10 nov. está al final, en «Segunda tanda», y corrige F1 y F2 de la primera.**

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

- El lema del logo se lee «FVFN» en vez de «EVEN» en la portada de la bienvenida (foto no guardada, por peso).
  Ez ya lo sabe y lo dejó como está el 4 nov.; se apunta porque es lo primero que ve alguien nuevo.

## Decisiones de Ez que pueden frenar la venta (dicho una vez)

- **Vender el de por vida mientras todo está abierto** (5 nov.): quien compre hoy no recibe nada que no tenga ya.
  Por eso M2 importa: los únicos que comprarían ahora son quienes ya quieren a PACE, y son los que no ven el botón.

## Segunda tanda (10 nov.): vivido en la app

Con `guion/run.js` (pasos por la línea de órdenes, con el reloj de la página adelantado) y `guion/pinta.js` (las propuestas,
pintadas cambiando el DOM en la página; nada se monta). Martes 10 nov. 2026, 9:05; 360 × 740 y 1280 × 720.

### El Foco con los ejercicios, por libre (móvil) [app]

1. «Empezar foco», 25 min. Al acabar: «CICLO COMPLETADO · Pausa bien hecha · Has cerrado un bloque. Elige tu pausa.», con la
   propuesta «HOY AÚN NO HAY SESIÓN DE ESTIRA · Espalda de oficina · 3 MIN · Empezar», las otras tres en una línea y «Ahora no».
2. «Empezar» abre la ficha «Antes de empezar» (qué necesitas, posición y pasos; aquí dice «2–3 MIN»), con otro «Empezar»;
   después, «Prepárate» con su cuenta atrás. Tres toques hasta moverse.
3. La rutina en «Auto» dura 2:31. El cierre: «¿Te ayudó esta pausa?» y un solo botón, «Volver al inicio» (`fotos/cierre-hoy-360.jpg`).
4. La home al volver: el aro en «00:00», «Empezar otro ciclo» y «SIGUIENTE · CICLO 2 / 4». Por libre no hay cuenta de la pausa.

- **F1, corregido**: por libre casi siempre HAY propuesta (regla 4 de `breakPropuesta`, `BreakMenu.support.jsx:213`: lo que el
  plan del día tenga pendiente). El menú de cuatro tarjetas, que abre la biblioteca entera, solo sale con todo hecho. No es un problema.
- **F2, confirmado y precisado**: el cierre del ejercicio no nombra el Foco. Por libre deja a la persona en la home con el aro
  en 00:00; el paso siguiente («Empezar otro ciclo») está, pero a un toque y una pantalla de distancia. Es la propuesta 2.
- **F3 · «Pausa bien hecha»** titula la ventana ANTES de hacer la pausa. Con jornada, la misma ventana dice «Tu pausa».
- **F4 · Dos duraciones a un toque**: «3 MIN» en la propuesta y «2–3 MIN» en la ficha; con jornada, «2 MIN» y «1–2 MIN».

### El Foco con los ejercicios, con jornada (portátil) [app]

«Jornada entera» desde la tarjeta de la home: 9 bloques de 45 min, 7 pausas con su rutina y su hora, la comida y el cierre.
Al acabar el bloque 1: «BLOQUE 1 DE 9 · HECHO · Tu pausa · 9:50 · Lo que toca ahora. · HOMBROS: SIN MOVER HOY · Empuje sencillo ·
2 MIN», con «Hacer la pausa», «Seguir con el bloque 2», «Hidrátate · un vaso ahora ›», «Ya la hice por mi cuenta» y «Ahora no».
Tras la rutina (1:15) y «Volver al inicio», el aro dice «PAUSA CORTA 02:13 · Empezar ya el bloque 2» y la parada queda «hecha»;
al vencer, «BLOQUE 2 DE 9 · 45:00 · Pausa terminada · Empezar bloque 2». **Aquí el círculo está cerrado y bien resuelto.**

- **F5 · La primera pausa del primer día** de la semana propuesta es «Empuje sencillo» (flexiones contra la mesa, nivel MEDIO).
- **Aviso sobre el método**: con la ventana de la pausa abierta hay dos botones «Hacer la pausa» (el del aro, detrás, y el de
  la ventana). Un clic por script en el de detrás dejó la ventana encima de la sesión; una persona no puede tocarlo. No es un fallo.

### Quien no paga, desde v1 [app]

Con el interruptor apagado (`Object.defineProperty`, como en `tests/caza-v1-compra.spec.js`):

- **El día de v1**: la hoja «Siete días de PACE completo · Desde hoy, PACE completo es de pago. Como ya usabas PACE, lo tienes
  entero hasta el martes, 17 de noviembre, sin tarjeta y sin pagar nada. Lo gratis sigue gratis. · Entendido». Clara.
- **M5 · Ocho días después (19 nov.) la home es idéntica**: nada dice que la semana acabó. Idea: una nota en el sobre, una vez.
- **La invitación con la tienda abierta** (al tocar «Tus rutinas»): las cuatro filas, «Un solo pago de 19,99 €, para siempre.»,
  «Comprar, 19,99 €», «Ahora no» del mismo tamaño y «Tengo un código». Bien.
- **M1, confirmado**: ni la jornada ni la tarjeta del día enseñan nada cerrado; `PaceCandado` y `paceAbrirPremium` no aparecen
  en `app/ritmo/` (salvo el calendario), ni en la carta, ni en «Qué te ayuda».
- **M2, confirmado en la app**: con el enlace de pago puesto y todo abierto, «Tus datos» solo ofrece «PACE completo · Introducir
  código» (`fotos/ajustes-hoy-360.jpg`).

### Las propuestas pintadas (`fotos/`)

| Propuesta | Fotos | Medido |
|---|---|---|
| 1 · Fila de compra en Ajustes | `ajustes-hoy-360`, `ajustes-A-360` | Cabe; una fila más |
| 2 · El cierre dice lo que sigue | `cierre-hoy-360`, `cierre-A-360`, `cierre-hoy-1280`, `cierre-A-1280` | El enlace acaba en 686 de 740 px y en 680 de 720 |
| 3 · La línea de los lunes | `semana-hoy-1280`, `semana-A-1280`, `semana-A-360` | A 1280 cabe en la fila del resumen. **A 360 no cabe en la home: la tarjeta acaba en 742 de 740** |
| 4 · La bienvenida sin «v1» | `bienvenida-hoy-360`, `bienvenida-A-360` | Mismo alto |
