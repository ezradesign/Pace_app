# PACE · Modelo de monetización

> **Manda en el detalle comercial y técnico de la licencia.** Las decisiones de producto viven en
> [`docs/product/DECISIONES_PRODUCTO.md`](./docs/product/DECISIONES_PRODUCTO.md), y qué documento
> manda en cada cosa lo dice la tabla «Dónde vive cada cosa» de [`CLAUDE.md`](./CLAUDE.md).
> `AUDITORIA_SISTEMA_PACE.md` y `AUDITORIA_DOCUMENTAL.md` son historia.

## CAMBIO DE EZ, 15 OCT. 2026: DOS PLANES (esto manda sobre el bloque de s134)

**Al lanzamiento hay dos planes: 2,99 € al mes, con 7 días gratis, y 19,99 € de por vida.** Los dos
abren lo mismo. Cobra Stripe en su modo «vende por ti», el código lo firma una función de Cloudflare
con la llave k2 y la landing vive en `pacegrass.app/premium`. Detalle y porqués en
`docs/product/DECISIONES_PRODUCTO.md` («Cómo se cobra PACE completo») y en
`docs/proposals/cobrar-pace-completo.html`. Del bloque de s134 dejan de valer «un solo plan» y
«mensual descartado»; lo demás sigue: `expiresAt` opcional, el anual a 9,99 € si llega, todo
desbloquea lo mismo y la estrategia se valida antes de abrir la tienda. El mensual ya no obliga a
pegar un código cada mes: la app lo renueva sola con la función.

**Lo que se promete y cómo se pasa a v1 (Ez, 15 oct. 2026, tras leer las reseñas de la competencia):**
lo que hoy es gratis sigue gratis, lo que compras no se quita y, si un día sube el precio, el de
quien ya paga no. El día de v1, quien ya usaba PACE recibe su semana de prueba y se queda para
siempre las rutinas premium que ya hizo. La app avisa dos días antes de que acabe la prueba y se
cancela en dos toques. Detalle en `docs/product/DECISIONES_PRODUCTO.md` («Cómo se vende PACE
completo»).

## PRECIO Y ESTRUCTURA — CERRADO en s134 (en parte sustituido: ver el bloque de arriba)

**Al lanzamiento hay UN solo plan: Lifetime 19,99 €.** *(Ya no vale: desde el 15 oct. 2026 son dos
planes, bloque de arriba.)*

- **Formato de licencia con `expiresAt` OPCIONAL desde el día uno.** Si a los ~3 meses la
  monetización no funciona, añadir un pase temporal es **un cambio de datos, no de
  arquitectura**. Esa previsión es el seguro; no implica construir nada más ahora.
- **Mensual DESCARTADO** *(ya no vale: el mensual de 2,99 € de arriba se renueva solo con la
  función, sin pegar un código cada mes)*. Sin cuentas y sin renovación automática —las dos cosas que el proyecto
  se niega a tener— un mensual obliga a **volver a comprar y pegar una clave nueva cada mes**:
  doce fricciones al año por 2,99 €. No es un plan de precios, es una fuga.
- **Si algún día llega un pase anual, va a 9,99 €, no a 4,99 €.** A 4,99 € sale al 25 % del
  lifetime y se lo canibaliza: cualquiera hace la cuenta y coge el anual. A 9,99 € el lifetime se
  amortiza en dos años y sigue teniendo sentido.
- **Todos los planes desbloquean lo mismo**: las funciones premium implementadas. **Sin eventos
  especiales ni packs de pago aparte**; las mejoras, ejercicios o sesiones que se añadan
  puntualmente entran en lo ya comprado.
- El precio queda fijado, pero **la estrategia de distribución y el posicionamiento del precio se
  validan en la Fase 9** con la revisión a fondo de Starter Story. Fijado ≠ blindado: si esa
  revisión aporta evidencia contraria, se revisa **antes** de publicar la tienda.

**Ya construido (8 oct. 2026):** la comprobación de la licencia firmada en la web
(`app/state-licencia.js`, formato `PACE1.<datos>.<firma>`, ECDSA P-256, `expiresAt` opcional), los
códigos de por vida para los testers (`scripts/licencias/`, con la llave privada fuera del repo) y su
fila en Ajustes. Lo de pago se llama **PACE completo**. En Android no se aceptan códigos propios
(Google Play): allí van los códigos promocionales de Play Console cuando haya Play Billing.

Lo que sigue es el modelo histórico de s21/s26. Su detalle técnico de licencia (clave firmada,
`expiresAt`, validación offline) **sigue vigente**; su abanico de vías queda **reducido** por la
decisión de arriba.

---

# ⚠️ A PARTIR DE AQUÍ: HISTÓRICO — NO GOBIERNA (marcado en s149)

> **Nada de lo que sigue describe lo que se va a vender.** Al lanzamiento hay **dos planes: 2,99 € al
> mes con 7 días gratis, o 19,99 € de por vida** (el primer bloque de arriba, Ez 15 oct. 2026). Este
> apartado se conserva **entero y sin recortar** porque su ingeniería de licencia —clave firmada,
> `expiresAt` opcional, validación offline— es la que se ha construido, y porque un pase temporal
> futuro sería «un cambio de datos, no de arquitectura». Pero **las cuatro vías, los precios y la
> tabla de convivencia son historia**: el Pase mensual de 3,99 € sin renovación está **descartado**
> (el mensual de hoy es otro y se renueva solo) y las Temporadas **no entran en v1**.
>
> Se marca en s149 al triar la auditoría integral, que lo señaló como contradicción documental: el
> archivo abría con la decisión correcta y a los treinta renglones vendía cuatro vías como si
> estuvieran vivas. **Se marca, no se borra** (misma regla que
> [`AUDITORIA_DOCUMENTAL.md`](./docs/product/AUDITORIA_DOCUMENTAL.md)).

---

> **Decidido en sesión 21 (2026-04-23).** Modelo C: pago único lifetime
> + temporadas opcionales + donaciones. La app sigue 100% local, sin
> backend propio, sin cuentas.
>
> **Actualizado en sesión 26 (2026-04-23, v0.12.9).** Se añade como
> cuarta vía el **Pase mensual** (pago puntual con acceso temporal,
> sin renovación automática). Sigue sin romper "todo local" porque
> la clave firmada lleva `expiresAt` y la app valida offline. No es
> una suscripción — es un pago único con caducidad.

---

## 🎯 Filosofía

> **Histórico (s21).** «No se alquila» ya no describe a PACE: desde el 15 oct. 2026 hay un mensual
> de 2,99 € que se renueva solo, junto al de por vida. Lo que sigue en pie es la falta de presión: lo
> gratis sigue gratis, la app avisa dos días antes de que acabe la prueba y se cancela en dos toques.

PACE no es un SaaS. No se alquila. La suscripción mensual clásica
(con renovación automática y validación contra servidor) choca con
el tono artesanal del producto ("antídoto a la silla", "libreta de
campo") y, más importante, rompería el pilar "todo local, sin
backend". El usuario compra **un objeto cuidado**, como un libro, no
un servicio del que depender.

- **Cero presión.** Nunca aparece un contador de días que quedan
  con tono agresivo. Si hay un Pase activo, se muestra discretamente
  su caducidad como dato, no como urgencia.
- **Coherente con "sin tracking, sin cuentas, sin backend".**
- **Monetización ≠ núcleo del producto.** El core gratuito debe
  funcionar y ser útil por sí solo.

---

## 💰 Modelo · 4 vías · **HISTÓRICO**

> Al lanzamiento se venden **dos planes** (el primer bloque de arriba, 15 oct. 2026): la vía 1, a
> **19,99 €** (no «~20 €»), y un mensual de 2,99 € con 7 días gratis que se renueva solo y que no
> es la vía 2. Las vías 2 y 3 están retiradas; la 4 (donaciones BMC) sigue viva en la web hasta v1: ese día sale, como ya
> pasa en Android (Ez, 18 oct. 2026).

### 1. Pago único · **Lifetime** — **vigente**, a 19,99 €, junto al mensual de 2,99 €
**~20 €** — compra una vez, desbloquea todo el contenido actual
premium de por vida. Sin renovaciones, sin expiraciones.

Incluye:
- Acceso a ejercicios premium de Respira, Mueve y Estira (ver
  [`CONTENT.md`](./CONTENT.md) para el listado marcado `premium: true`).
- Sesiones largas CTB (Respiración en Trance Consciente).
- Personalización de sesiones en Estira y Mueve (selección libre
  de ejercicios + duración custom).
- Soporte al desarrollo futuro.

> **Nota sobre "Lifetime".** En los Términos se define como *"vida
> útil del producto PACE"*. Dado que PACE funciona 100% offline sin
> depender de servidores, el `PACE_standalone.html` del comprador
> seguirá funcionando indefinidamente aunque el proyecto se
> discontinúe. Esta es la razón por la que podemos ofrecer Lifetime
> con tranquilidad legal.

### 2. Pago puntual · **Pase mensual** — ❌ **DESCARTADO en s134**

> No se lanza. Motivo en el bloque de arriba: sin cuentas y sin renovación automática obliga a
> recomprar y pegar clave cada mes — doce fricciones al año. **Su ingeniería sí sobrevive**: es la
> que hace barato añadir un pase temporal si algún día hiciera falta.

**3,99 €** — compra puntual que desbloquea el contenido premium
durante **30 días** desde la activación. Sin renovación automática,
sin cargo recurrente, sin cancelación que gestionar. Cuando expira,
expira. Si el usuario quiere más, compra otro Pase.

Pensado para:
- Quien quiere probar lo premium sin comprometerse a 20 €.
- Quien usa PACE en temporadas concretas (exámenes, sprints, etapas
  de vida más sedentarias).
- Quien prefiere pagos pequeños a pago grande.

**Cómo funciona técnicamente** (sigue sin backend):
- El Pase se emite como clave firmada con `expiresAt` incluido.
- La app valida la firma **offline** con la clave pública embebida.
- Cada vez que se abre PACE, se comprueba localmente si `expiresAt`
  sigue en el futuro. Si no, el contenido premium vuelve a aparecer
  bloqueado. Sin llamadas de red.
- Los **logros ya desbloqueados durante el Pase se conservan** para
  siempre (filosofía de "lo que ganas no se pierde"). Lo que expira
  es el acceso a contenido premium que no se completó.

### 3. Pago puntual · **Temporadas** — ❌ **FUERA de v1**

> Choca con la decisión de s134 de que **todos los planes desbloquean lo mismo**, sin packs de pago
> aparte. `ROADMAP.md` las mantiene en «más allá de v1».

**~5 €** puntuales — packs estacionales añadidos a lo largo del
año. Ejemplo: *"Invierno 2026: 10 rutinas nuevas + 5 sesiones CTB"*.

No son obligatorias. El Lifetime sigue siendo válido para todo el
contenido que existiera en el momento de la compra. Las temporadas
son **ediciones especiales** opt-in que se mantienen para siempre
una vez compradas (igual que un libro).

### 4. Donaciones
Buy Me a Coffee (ya integrado desde v0.11.11) sigue activo para
quien quiere apoyar sin desbloquear nada. `secret.supporter` es un
sello visible en la colección, sin más implicación funcional — ver
decisión activa en [`STATE.md`](./STATE.md).

> **Legal:** las donaciones nunca desbloquean funcionalidad. Si lo
> hicieran, podrían reclasificarse como servicio gravado con IVA.
> El sello visible sin efecto funcional mantiene la categoría fiscal
> de donación limpia.

---

## 🔀 Cómo conviven las 4 vías — **HISTÓRICO**

> **Esta tabla NO describe lo que se va a vender.** En el lanzamiento solo existen dos filas:
> «Nada» (núcleo gratuito) y «Lifetime» (todo, para siempre). Las filas de Pase y Temporada se
> conservan porque documentan cómo tendrían que convivir **si** volvieran.

| Si tienes… | Acceso a contenido premium | Acceso a temporadas |
|---|---|---|
| Nada | Core gratuito (Pomodoro, Hidrátate, 2 iniciales por módulo) | — |
| **Pase mensual activo** | Sí, durante 30 días | Solo las que hayas comprado aparte |
| **Lifetime** | Sí, para siempre | Solo las que hayas comprado aparte |
| **Temporada concreta** | Solo el contenido de esa temporada, para siempre | Solo esa |
| Donación BMC | Sello visible, nada funcional | — |

**Regla clave:** las 4 vías son **acumulables**. Alguien puede tener
Lifetime + Temporada Invierno 2026 + haber donado en BMC, y todo
convive sin conflicto. El Pase mensual existe como onramp alternativo
para quien no quiere comprometer 20 €; si el usuario compra Lifetime
**durante un Pase activo**, el Lifetime prevalece y el Pase
simplemente deja de ser relevante (no se reembolsa ni se compensa —
son productos distintos).

---

## 🔐 Validación de licencia (todo local)

Sin backend, sin cuentas, sin OAuth. Se usa validación de clave
firmada, estilo app de escritorio:

1. El usuario compra en una plataforma externa (Gumroad / Lemon
   Squeezy / similar — decisión pendiente).
2. Recibe una **clave firmada** por email. La clave contiene:
   - `type`: `"lifetime"` | `"pass"` | `"season:<id>"`
   - `expiresAt`: timestamp (solo para `pass`; `null` para los demás)
   - `issuedAt`, `keyId`
3. Pega la clave en PACE → Configuración → Licencia.
4. PACE valida la firma **offline** con la clave pública embebida.
5. La clave se guarda en `localStorage['pace.license.v1']` (array:
   un usuario puede acumular Lifetime + varias Temporadas + un Pase
   activo simultáneamente).

La validación es local. No hay llamada a servidor. No hay tracking.
Si el usuario borra localStorage, basta con volver a pegar sus
claves (las que le llegaron por email).

**Proveedor de compra:** decisión pendiente. Prioridad: que permita
emitir claves firmables por producto y que actúe como **merchant of
record** en UE (gestionan IVA OSS por nosotros). Candidatos:
Lemon Squeezy (mejor soporte de productos digitales en UE) y
Gumroad (más simple, ligeramente más limitado). Stripe directo se
descarta por obligar a gestionar IVA OSS y facturación por nuestra
cuenta.

---

## 🎁 Gating de contenido

Cada ejercicio tiene un campo `access` con uno de estos valores:

| Valor | Significado |
|---|---|
| `free` | Disponible sin desbloquear nada. |
| `locked.initial` | Bloqueado al inicio. Se desbloquea al completar uno de los 2 iniciales del módulo. |
| `locked.achievement` | Desbloqueado por un logro específico. |
| `locked.both` | Desbloqueable por logro **o** por Lifetime/Pase. |
| `premium` | Exclusivo Lifetime o Pase activo. No hay ruta de logro para desbloquearlo. |

La app arranca con **2 ejercicios `free` por módulo** (Respira,
Mueve, Estira). El resto son `locked.*` o `premium`. Al completar
los iniciales, empiezan a desbloquearse el resto según logros. Ver
[`CONTENT.md`](./CONTENT.md) para el mapeo concreto.

**Cuando un Pase expira:** los ejercicios `premium` vuelven a
aparecer bloqueados. Los `locked.both` que se desbloquearon por
logro permanecen abiertos (porque el logro no se pierde). Los
`locked.both` que solo estaban abiertos por el Pase vuelven a su
estado de logro (probablemente bloqueado).

---

## ❌ Qué NO hacemos

- ❌ **Suscripción mensual clásica con renovación automática.** El
  Pase mensual es un pago puntual con caducidad, no una suscripción:
  no renueva, no hay que cancelarla, no necesita backend para
  validarse. La suscripción clásica rompería el pilar "todo local"
  y añadiría fricción legal innecesaria (Directiva UE de suscripciones,
  deber de recordatorios, cancelación tan fácil como suscribirse, etc.).
- ❌ Backend propio solo para licencias (rompe "todo local")
- ❌ Cuentas de usuario (rompe "sin cuentas")
- ❌ Tracking post-compra (rompe "sin tracking")
- ❌ Publicidad de ningún tipo
- ❌ Gating del core (Pomodoro, Hidrátate y los 2 iniciales de
  cada módulo son y seguirán siendo gratis)
- ❌ Descuentos agresivos con contadores tipo "¡quedan 2h!"
- ❌ Recordar al usuario que "podría" comprar Lifetime. El upsell
  es discreto: una línea en Tweaks y el contenido bloqueado se ve
  con un sello `PREMIUM` tipográfico, nada más.
- ❌ Contador agresivo de "días que quedan" del Pase. Si hay Pase
  activo, se muestra la fecha de caducidad como dato, sin presión.

---

## 🛣️ Implementación en el roadmap

**Pre-v1.0:** el modelo se documenta pero no se implementa.
Prioridad antes del lanzamiento pagado:

1. Consolidar UX gratuita (app responsive móvil, loop
   post-Pomodoro, Ritmos semanal/mensual/anual).
2. Contenido suficiente para que Lifetime y Pase tengan valor real
   (CTB diseñada, rutinas premium en Mueve/Estira).
3. Elegir proveedor de compra externa y darse de alta como merchant
   of record.
4. Sistema de validación de clave offline con soporte para los 3
   tipos (`lifetime`, `pass`, `season`).
5. UI de "Introducir licencia" en Tweaks (discreta, sin upsell).
6. **Términos de Servicio + Política de Privacidad** redactados por
   abogado antes del primer cobro real.
7. Lanzamiento v1.0 con las 4 vías activas.

Ver [`ROADMAP.md`](./ROADMAP.md) para el desglose por fases.
