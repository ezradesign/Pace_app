# Roadmap

Visión a medio y largo plazo del proyecto PACE.
Para estado actual del día a día, ver [`STATE.md`](./STATE.md).
Para modelo de monetización, ver [`MONETIZATION.md`](./MONETIZATION.md).

---

## 🎯 Corto plazo — próximas 1-3 sesiones

### Responsive móvil (bloqueante para uso real)
La app se usa también desde móvil vía web. Dos requisitos concretos:

- **Sidebar desacoplada en móvil → fullscreen.** Cuando el usuario
  abre la sidebar desde el botón ≡ flotante en una pantalla
  estrecha, debe ocupar el 100% del viewport, no un panel lateral.
- **Home acoplada cabe en viewport de móvil.** El Pomodoro
  central + los 4 accesos rápidos (Respira, Mueve, Estira,
  Hidrátate) deben encajar sin scroll en pantallas ~375×812.

Media query breakpoint tentativo: `max-width: 768px`. La escala
tipográfica del timer tendrá que ajustarse (`clamp` ya ayuda).

### Loop post-Pomodoro
Al terminar un Pomodoro, el `BreakMenu` actual se expande para
sugerir explícitamente una acción de pausa activa: *estirar*,
*moverse* o *hidratarse*. Una sola tarjeta por sugerencia, rotando
entre las 3 según últimos usos (no repetir la misma dos veces
seguidas).

Objetivo: crear un **loop natural foco → pausa activa → foco**.
Sin gamificación, sin popups invasivos — sigue abriendo el
BreakMenu que ya existe, solo con copy más claro y orden
priorizado.

### Progresión de desbloqueo inicial (2+2+2)
La app arranca con **2 ejercicios desbloqueados** en cada módulo
(Respira, Mueve, Estira). Al completar cada uno, se desbloquea el
siguiente. Algunos quedan como `locked.achievement` (vía logros),
otros como `premium` exclusivo Lifetime, otros como `locked.both`
(logro o Lifetime). Ver mapeo en [`CONTENT.md`](./CONTENT.md) y
modelo de gating en [`MONETIZATION.md`](./MONETIZATION.md).

### Sonidos sutiles
Hay toggle en tweaks pero no hay archivos. Añadir:
- Campana suave al iniciar Pomodoro
- Campana de cierre al completar
- Tick sutil en transiciones de fase de respiración

Formato WAV pequeño, licencia libre (CC0 o propia).

### Triggers pendientes de logros (13 → 0)
Detallado en [`STATE.md`](./STATE.md) backlog. Prioridad:
`first.ritual/cycle/plan`, `streak.14/60/365`, luego los
`.sessions.*` y `.all.*`.

---

## 🌱 Medio plazo — próximas 4-10 sesiones

### Ritmos · vista semanal/mensual/anual
El módulo actual `WeeklyStats` muestra la semana. Evolución a un
apartado **Ritmos** con tres vistas conmutables:

- **Semanal** — barras diarias por módulo (como ahora, pulidas).
- **Mensual** — vista tipo heatmap mes completo.
- **Anual** — "año en pace", calendario anual estilo GitHub
  contributions pero con tierra/oliva en lugar de verde neón.
  Intensidad según minutos acumulados del día.

Las tres vistas comparten paleta, tipografía y tono (sin números
abrumadores, siempre con contexto: "semana tranquila", "mes
constante"). La narrativa importa tanto como los datos.

### CTB · Respiración en Trance Consciente (premium)
Sección premium dentro de Respira. Sesiones largas (20-45 min) que
combinan:

- **Música ambiental** sin voz (licencia libre, ~3-4 pistas por
  sesión, fade in/out entre fases).
- **Respiración guiada** con rondas prolongadas, retenciones
  conscientes y visualización pausada.
- **Timer silencioso** con hitos visuales en vez de interrupciones
  verbales.

Número tentativo: 4-6 sesiones CTB en el lanzamiento Lifetime.
Cada una con su nombre propio y su estética (ej: "Manantial",
"Noche larga", "Campo abierto").

Entregable mínimo antes de código: guion de 1 sesión + pista
musical seleccionada + mockup de la pantalla inmersiva.

### Sesiones personalizadas · Estira y Mueve (premium)
Parte Lifetime. El usuario construye una rutina a medida:

- Selecciona N ejercicios (de los desbloqueados + los premium).
- Define duración por ejercicio o total de la sesión.
- Guarda la rutina con nombre → aparece como acceso rápido.

UI en línea con el resto de la app: cards arrastrables, timer
integrado, sin configuración barroca. Máximo 3 rutinas guardadas
para evitar parálisis.

### Retos semanales
Reto opcional que aparece el lunes (ej: "3 sesiones de Respira
esta semana"). Sin penalización por no completar. Al completarlo
se desbloquea un sello de colección. Tres niveles de dificultad
que se ajustan según el histórico del usuario.

### Notificaciones inteligentes (Web Notifications API)
El state conserva `reminders: []` por decisión activa. Reintroducir
UI como modal opt-in explícito:

- Recordatorio de hidratación (horario configurable).
- Aviso de pausa activa tras X horas sin moverse (detección de
  inactividad del tab).
- Sugerencia contextual: tras 2h de foco → rutina de caderas.

Sin notificaciones por defecto. Sin espam. El usuario decide qué
activa y cuándo.

### Feedback personalizado
Al final de semana/mes, texto breve en Ritmos que contextualiza
el histórico sin juzgar:

- "Semana de foco profundo. Menos movilidad de lo habitual —
  mañana empezamos suave."
- "Más respiración que otras semanas. Tu racha aguanta."

Literario, no numérico. Sin alarmas rojas. Sin metas impuestas.

### Mockups extensión Chrome
Dos superficies reusando componentes existentes:
- **Popup** 340×480 px — resumen compacto + acciones rápidas
- **Nueva pestaña** — pantalla completa como newtab, sustituyendo
  el tab por defecto

Consideraciones: persistencia cross-tab vía `chrome.storage.sync`,
Manifest V3, permisos mínimos (`storage`, `alarms`).

---

## 🌲 Largo plazo — visión v1.0+

### Lanzamiento pagado v1.0
Ver [`MONETIZATION.md`](./MONETIZATION.md) para el modelo completo.

- Lifetime único ~20 € (compra en plataforma externa, validación
  de clave offline).
- Temporadas opcionales ~5 € (packs estacionales).
- Donaciones BMC siguen activas.

Pre-requisitos: app responsive, Ritmos completo, al menos 2 CTB
grabadas, sesiones personalizadas funcionales.

### App Android
- Mockups en `android_frame` con storyboard completo
- Export a Capacitor o Expo para wrapping
- Adaptación de layout a móvil (heredada del trabajo responsive)
- Widget de pantalla de inicio (próximo break + vasos de agua)

### Widget flotante Chrome
- Overlay sobre cualquier web
- Timer siempre visible
- Acceso rápido a rutinas de respiración
- Respeta pantalla completa

### Modo "Retiro"
Sesión larga combinando módulos:
- 30-60 min de respiración + movilidad guiada
- Transiciones entre técnicas
- Música ambiental opcional (sin voz)

Muy cercano al concepto CTB — podrían converger en una sola
sección premium de "sesiones largas".

---

## 💭 Ideas sueltas (explorar / descartar)

- Reloj de escritorio macOS/Windows (electron ligero)
- Modo team: compartir streaks con compañeros
- Recordatorios contextuales (detectar inactividad del ratón)
- Versión para Apple Watch / Wear OS
- Plugin para Notion / Obsidian (insertar "espacio de respiración"
  entre bloques)
- Exportar .ics del plan del día para Google Calendar / Apple
  Calendar (sin OAuth, alineado con "todo local")

---

## 🚫 Fuera de alcance (nunca)

- Gamificación agresiva (streaks rojos, notificaciones push
  abrumadoras)
- Emojis en la UI
- Tracking / analytics sin opt-in explícito
- Publicidad o monetización intrusiva
- Suscripción mensual (ver [`MONETIZATION.md`](./MONETIZATION.md))
- Consejos médicos sin disclaimer para técnicas de riesgo
- Copia literal de listas de rutinas de terceros
- Biometría / integración con wearables (decisión explícita del
  usuario en sesión 21 — no encaja con el tono artesanal)
