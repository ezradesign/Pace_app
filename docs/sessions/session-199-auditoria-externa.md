# Sesión 199 · Auditoría externa y el artefacto sin comentarios (v0.133.2)

**Fecha:** 2026-10-05 · **Dónde:** sesión en la nube (Claude Code en un proyecto de claude.ai), no en el PC.

## Encargo

«Revisa todo el proyecto, audita y analicemos su desarrollo». Informe completo:
[`docs/audits/audit-externa-v0.133.1.md`](../audits/audit-externa-v0.133.1.md).

## Lo que se midió

- `npm run verify`: pasa (15 s). `npm run test:e2e`: 322/323. Falla `eventos-barrera.spec.js:23`.
- **El rojo es un bug real.** Repetido 20 veces con 2 workers: 7 a 12 fallos según la carga. Medido dentro del lock
  y tras esperar 1,5 s: el almacén tiene de verdad menos eventos (llegó a quedarse con 10 de 20: una pestaña pisó
  el lote entero de la otra). Causa inferida: Chromium propaga `localStorage` entre procesos de forma asíncrona, y
  Web Locks serializa pero no puede forzar una lectura fresca. **No se arregla en esta sesión**: el arreglo es
  mover el adaptador web a IndexedDB, que no es un cambio barato.
- `index.html` llevaba 732 KB de comentarios (39 % de su JS).
- La documentación pesa 3,6 MB frente a 1,8 MB de código, y el 44 % del código fuente es comentario.

## Lo que cambió (v0.133.2)

- `build-standalone.js`: solo se conservan los comentarios de copyright y licencia. `index.html`: 2.039.657 →
  1.470.507 bytes.
- `backups/` sale del repo y entra en `.gitignore`.

## Decisiones del usuario

- Pace es un producto para **vender pronto**. Lo han usado más de una semana de 1 a 5 personas de fuera.
- **Android entra en v1.** **Travesías y Caminos (Fases 6 y 7) salen de v1**, porque el producto ha girado al
  método guiado día a día. Los 7 Caminos se quedan como están y fuera de la home.
- **Qué se paga**: «A tu ritmo» a lo largo de la semana, las 19 rutinas premium, el constructor y las stats de
  semana y año. Gratis: Pomodoro, «A tu ritmo» del día, 32 rutinas, Hidrátate, logros y stats «Hoy». Se afina con
  la pregunta «¿qué echarías de menos?» al final de la prueba cerrada de Android.
- La documentación por sesión es **sobre todo para Claude**: se puede adelgazar.

## Siguiente

Reescribir «Camino a v1.0» con estas decisiones (pendiente de revisión) · IndexedDB para los eventos · adelgazar
el método.
