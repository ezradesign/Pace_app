# Cómo portar PACE a otros stacks / plataformas

Notas prácticas extraídas del handoff original (v0.9). Siguen válidas en el
momento en el que alguien quiera portar el proyecto fuera del HTML + React +
Babel standalone actual.

---

## 1. A Next.js / Vite / otro bundler React

Los JSX están escritos con **React 18 puro**, sin magia. Portar implica:

1. `npm install react@18.3.1 react-dom@18.3.1`
2. Convertir los exports `Object.assign(window, { ... })` → `export` nombrado.
3. Sustituir imports implícitos (scope global del navegador) por imports
   explícitos entre módulos.
4. Mover `app/tokens.css` a `globals.css` o a módulos CSS.
5. Sustituir `localStorage` directo por una lib con persistencia (ej.
   [`zustand`](https://github.com/pmndrs/zustand) con `persist`,
   [`jotai`](https://jotai.org/) + `atomWithStorage`, o
   [`@tanstack/react-store`](https://tanstack.com/store)).
6. Los hooks de React se desestructuran del global (`const { useState } =
   React`). En el port se usa import normal: `import { useState } from
   'react'`.

La estructura de carpetas `app/**` ya está pensada para mapear 1:1 a un
proyecto Next.js App Router o a `src/components/` en Vite.

---

## 2. A extensión Chrome (MV3)

Dos superficies a diseñar reutilizando componentes existentes:

- **Popup** 340×480 px — resumen compacto + acciones rápidas.
- **Nueva pestaña** — pantalla completa como `newtab.html`, sustituyendo el
  tab por defecto del navegador.

Pasos:

1. Usar `PACE.html` como base para `popup.html` / `newtab.html`.
2. Crear `manifest.json` (MV3):
   ```json
   {
     "manifest_version": 3,
     "name": "PACE",
     "version": "0.11.7",
     "action": { "default_popup": "popup.html" },
     "chrome_url_overrides": { "newtab": "newtab.html" },
     "permissions": ["storage", "alarms"],
     "icons": { "16": "...", "48": "...", "128": "..." }
   }
   ```
3. **Permisos mínimos:** `storage` (para `chrome.storage.sync` en vez de
   `localStorage`) y `alarms` (para recordatorios).
4. **MV3 no permite scripts remotos.** Mover las dependencias CDN (React +
   Babel) a archivos locales dentro de la extensión. Esto hincha el bundle
   pero es obligatorio.
5. Adaptar el state layer: reemplazar `localStorage` por
   `chrome.storage.sync` (async) — requiere convertir algunos selectores
   en `useEffect` o similar.
6. Los Pomodoros deben disparar con `chrome.alarms` en lugar de
   `setInterval` para funcionar con la pestaña cerrada.

Consideración adicional: persistencia cross-tab. Con `chrome.storage.sync`
se resuelve automáticamente (cambios en una pestaña se notifican a las
demás vía `chrome.storage.onChanged`).

---

## 3. A app Android

Opciones, de menor a mayor esfuerzo:

### Wrapping con Capacitor / Expo WebView
- Empaquetar `PACE_standalone.html` como app. Resulta en PWA empaquetada.
- Pro: mínimo esfuerzo, reutiliza el 100% del código.
- Contra: no accede a APIs nativas (notificaciones programadas avanzadas,
  widgets de home screen, tiles de Wear OS, etc.).

### React Native (port nativo)
- Reescribir las pantallas con componentes nativos.
- Pro: feel nativo, notificaciones y widgets completos.
- Contra: port completo de la UI; CSS no aplica, hay que usar StyleSheet
  o `styled-components`.

### Consideraciones específicas de Android
- Adaptación de layout a móvil: sidebar colapsable por defecto, bottom bar
  con los 4 módulos en vez de ActivityBar horizontal.
- Widget de pantalla de inicio (próximo break + vasos de agua) — solo
  viable con React Native o Jetpack Compose nativo.
- Notificaciones programadas para recordatorios de hidratación y
  Pomodoros (requiere `AlarmManager` o `WorkManager`).

---

## 4. A reloj de escritorio macOS/Windows

- Electron ligero envolviendo `PACE_standalone.html`.
- Modo "always on top" configurable para tener el Pomodoro siempre visible.
- Persistencia compartida con la web via `localStorage` si el webview
  apunta al mismo dominio (no trivial; más sencillo duplicar estado).

---

## 5. Compatibilidad navegadores (actual)

- Chrome/Edge 90+
- Firefox 90+
- Safari 14+ (algunos tweaks CSS pueden verse distintos)
- **Requiere:** `CSS custom properties`, `localStorage`, `ES2020`.

---

## Notas generales sobre el port

- Datos muy pequeños (< 50 KB por usuario). Cualquier solución de
  persistencia sirve. IndexedDB sería overkill.
- Zero tracking actual — si el port añade sync online, **opt-in explícito**
  con disclaimer. No romper esa promesa.
- Copia literal de listas de rutinas de terceros: **prohibido**. Las
  rutinas están inspiradas en canales citados (Breathe With Sandy,
  Strengthside, Jess Martin) pero escritas originales.
