# Roadmap

Visión a medio y largo plazo del proyecto PACE.
Para estado actual del día a día, ver [`STATE.md`](./STATE.md).

---

## 🎯 Corto plazo — próximas 1-3 sesiones

### Layout "Editorial"
El tweak está listado pero aún no tiene implementación visual distinta al sidebar. Diseñar variante tipo revista:
- Hero grande con timer
- Dos columnas inferiores (plan + logros / intención + respirar)
- Tipografía display más generosa
- Espaciado editorial

### Mockups extensión Chrome
Dos superficies a diseñar reusando componentes existentes:
- **Popup** 340×480 px — resumen compacto + acciones rápidas
- **Nueva pestaña** — pantalla completa como newtab, sustituyendo el tab por defecto

Consideraciones:
- Persistencia cross-tab vía `chrome.storage.sync`
- Manifest V3 (scripts locales, no CDN)
- Permisos mínimos: `storage`, `alarms`

### Sonidos sutiles
Hay toggle en tweaks pero no hay archivos. Añadir:
- Campana suave al iniciar Pomodoro
- Campana de cierre al completar
- Tick sutil en transiciones de fase de respiración

Formato WAV pequeño, licencia libre (CC0 o propia).

### Más triggers automáticos de logros
De los 100 logros, solo ~30 tienen trigger automático. Cubrir al menos:
- Maestría (46-70): X sesiones completadas, X minutos acumulados
- Estacionales (91-100): detección de fecha
- Secretos (71-90): combinaciones específicas

---

## 🌱 Medio plazo — próximas 4-10 sesiones

### App Android
- Mockups en `android_frame` con storyboard completo
- Export a Capacitor o Expo para wrapping
- Adaptación de layout a móvil (sidebar colapsable, bottom bar)
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

---

## 🌲 Largo plazo — visión

### Sincronización online (opt-in)
- Backend minimalista (Supabase o similar)
- Opt-in explícito con disclaimer de privacidad
- Export/import de JSON como alternativa offline
- Sync entre dispositivos (web + Chrome + Android)

### Integraciones
- **Calendario** — no interrumpir durante reuniones detectadas en Google Calendar / Apple Calendar
- **Apple Health / Google Fit** — exportar minutos de movilidad y respiración
- **Slack / Teams status** — auto-set "En foco" durante Pomodoro

### Estadísticas agregadas
- Mensuales con gráficas de tendencias
- Comparativas semana sobre semana
- Export PDF de progreso

### Voz guiada
Si el feedback lo pide — locutor/a suave español para sesiones de respiración y movilidad. Decisión pendiente: puede ser demasiado invasivo para el tono actual.

---

## 💭 Ideas sueltas (explorar / descartar)

- Reloj de escritorio macOS/Windows (electron ligero)
- Modo team: compartir streaks con compañeros
- Recordatorios contextuales (detectar inactividad del ratón)
- Versión para Apple Watch / Wear OS
- Plugin para Notion / Obsidian (insertar "espacio de respiración" entre bloques)

---

## 🚫 Fuera de alcance (nunca)

- Gamificación agresiva (streaks rojos, notificaciones push abrumadoras)
- Emojis en la UI
- Tracking / analytics de cualquier tipo sin opt-in explícito
- Publicidad o monetización intrusiva
- Consejos médicos sin disclaimer para técnicas de riesgo
- Copia literal de listas de rutinas de terceros
