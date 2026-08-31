/* PACE · Módulo Estira (Estiramientos / Movilidad)
   Botón: "Estira" · afloja tensión.

   v0.11.9 — SWAP de contenido (sesión 14):
   Las rutinas de estiramiento/movilidad pasaron a este módulo (antes vivían
   en MoveModule). La calistenia y la fuerza pasaron a MoveModule (botón
   "Mueve"). Los ids (`move.*` / `extra.*`) y funciones de state
   (completeMoveSession / completeExtraSession) se conservan para no
   invalidar localStorage ni logros de usuarios existentes — solo cambia
   qué contenedor visual los muestra.

   F5 (s91): 7 → 14 rutinas, biblioteca agrupada como Respira (4 grupos,
   free primero dentro de cada grupo). Inspiración: Strengthside (caderas/
   hombros/columna, movilidad de suelo, flujos diarios cortos). Los pasos
   nuevos sin glifo aprobado renderizan DefaultGlyph hasta el port (D-4). */


/* s178 · EL DATO SE FUE A `extra.data.js` + `extra.data.piernas.js`. Este archivo llego a
   553 lineas al entrar las tres rutinas de oficina y la regla §1 manda TROCEAR, no
   registrar deuda; la tabla de STATE.md ya lo tenia planificado desde s148. Aqui queda
   solo la pantalla, igual que `MoveModule.jsx` quedo con su `move.data.js` en s110.
   SE LEE POR `window.` Y NO PELADO: `EXTRA_ROUTINES` es un `const` en otro archivo y en el
   artefacto cada modulo viaja en su propia IIFE, asi que el binding NO cruza (s148). */


/* s174 · Espejo exacto de `MoveLibrary`: la pantalla es `LibraryShell` y aquí
   sólo queda el dato, el color y el prefijo de i18n. Ver la nota de
   `MoveModule.jsx` para el porqué de que sean gemelas.
   OJO CON LOS IDS: las 17 rutinas de ESTIRA empiezan por `move.` y las 14 de
   MUEVE por `extra.` — el swap de s14, blindado en CONTENT.md. Asumir el
   prefijo es la trampa que s172 prohíbe expresamente y que en s173 dejó un
   bloque VACÍO durante dos versiones de la maqueta. */
function ExtraLibrary({ open, onClose, onStart }) {
  const { t } = useT();
  return (
    <LibraryShell
      open={open} onClose={onClose} onStart={onStart}
      groups={window.EXTRA_ROUTINES} tone="var(--extra)" catPrefix="extra"
      title={t('lib.extra.title')} subtitle={t('lib.extra.subtitle')} />
  );
}

/* Sesión 49 — helper de lookup para Caminos (s91: adaptado a grupos) */
function getExtraRoutine(id) {
  for (const group of Object.values(window.EXTRA_ROUTINES)) {
    const found = group.items.find(r => r.id === id);
    if (found) return found;
  }
  return null;
}
window.getExtraRoutine = getExtraRoutine;
Object.assign(window, { ExtraLibrary });
