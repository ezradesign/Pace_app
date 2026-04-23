# PACE · Modelo de monetización

> **Decidido en sesión 21 (2026-04-23).** Modelo C: pago único lifetime
> + temporadas opcionales + donaciones. La app sigue 100% local, sin
> backend propio, sin cuentas.

---

## 🎯 Filosofía

PACE no es un SaaS. No se alquila. La suscripción mensual choca con
el tono artesanal del producto ("antídoto a la silla", "libreta de
campo"). El usuario compra **un objeto cuidado**, como un libro, no
un servicio del que depender.

- **Cero presión.** Nunca aparece un contador de días que quedan.
- **Coherente con "sin tracking, sin cuentas, sin backend".**
- **Monetización ≠ núcleo del producto.** El core gratuito debe
  funcionar y ser útil por sí solo.

---

## 💰 Modelo C · Híbrido

### 1. Pago único · **Lifetime**
**~20 €** — compra una vez, desbloquea todo el contenido actual
premium de por vida. Sin renovaciones, sin expiraciones.

Incluye:
- Acceso a ejercicios premium de Respira, Mueve y Estira (ver
  [`CONTENT.md`](./CONTENT.md) para el listado marcado `premium: true`).
- Sesiones largas CTB (Respiración en Trance Consciente).
- Personalización de sesiones en Estira y Mueve (selección libre
  de ejercicios + duración custom).
- Soporte al desarrollo futuro.

### 2. Temporadas opcionales
**~5 €** puntuales — packs estacionales añadidos a lo largo del
año. Ejemplo: *"Invierno 2026: 10 rutinas nuevas + 5 sesiones CTB"*.

No son obligatorias. El Lifetime sigue siendo válido para todo el
contenido que existiera en el momento de la compra. Las temporadas
son **ediciones especiales** opt-in.

### 3. Donaciones
Buy Me a Coffee (ya integrado desde v0.11.11) sigue activo para
quien quiere apoyar sin desbloquear nada. `secret.supporter` es un
sello visible en la colección, sin más implicación funcional — ver
decisión activa en [`STATE.md`](./STATE.md).

---

## 🔐 Validación de licencia (todo local)

Sin backend, sin cuentas, sin OAuth. Se usa validación de clave
firmada, estilo app de escritorio:

1. El usuario compra en una plataforma externa (Gumroad / Lemon
   Squeezy / similar — decisión pendiente).
2. Recibe una **clave firmada** por email.
3. Pega la clave en PACE → Configuración → Licencia.
4. PACE valida la firma **offline** con la clave pública embebida.
5. La clave se guarda en `localStorage['pace.license.v1']`.

La validación es local. No hay llamada a servidor. No hay tracking.
Si el usuario borra localStorage, basta con volver a pegar su clave.

**Proveedor de compra:** decisión pendiente. Prioridad: que permita
emitir claves firmables y no requiera SDK invasivo. Gumroad y Lemon
Squeezy son candidatos razonables.

---

## 🎁 Gating de contenido

Cada ejercicio tiene un campo `access` con uno de estos valores:

| Valor | Significado |
|---|---|
| `free` | Disponible sin desbloquear nada. |
| `locked.initial` | Bloqueado al inicio. Se desbloquea al completar uno de los 2 iniciales del módulo. |
| `locked.achievement` | Desbloqueado por un logro específico. |
| `locked.both` | Desbloqueable por logro **o** por Lifetime. |
| `premium` | Exclusivo Lifetime. No hay ruta de logro para desbloquearlo. |

La app arranca con **2 ejercicios `free` por módulo** (Respira,
Mueve, Estira). El resto son `locked.*` o `premium`. Al completar
los iniciales, empiezan a desbloquearse el resto según logros. Ver
[`CONTENT.md`](./CONTENT.md) para el mapeo concreto.

---

## ❌ Qué NO hacemos

- ❌ Suscripción mensual (choca con filosofía calma)
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

---

## 🛣️ Implementación en el roadmap

**Pre-v1.0:** el modelo se documenta pero no se implementa.
Prioridad antes del lanzamiento pagado:

1. Consolidar UX gratuita (app responsive móvil, loop
   post-Pomodoro, Ritmos semanal/mensual/anual).
2. Contenido suficiente para que el Lifetime tenga valor real
   (CTB diseñada, rutinas premium en Mueve/Estira).
3. Elegir proveedor de compra externa.
4. Sistema de validación de clave offline.
5. Lanzamiento v1.0 con Lifetime activo.

Ver [`ROADMAP.md`](./ROADMAP.md) para el desglose por fases.
