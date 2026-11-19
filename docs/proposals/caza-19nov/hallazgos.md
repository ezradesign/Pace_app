# Caza del 19 nov. 2026 (0.211.0) · hallazgos comprobados, sin montar nada

Recorrido con Playwright sobre `index.html` (puerto 8945) y `dist/` (8946). Guiones en `guiones/` (se corren desde una carpeta con `lib.js`; `WT` apunta al worktree). Fotos en `fotos/`. Página para Ez: `index.html` (ver `DONDE-ME-QUEDO.md`).

## Bugs
1. **El panel del móvil se abre solo al volver.** Si cierras PACE con el panel abierto, la siguiente vez arranca tapando el reloj (`sidebarCollapsed:false` se guarda y `loadState` solo lo cierra si falta). 360×640, cualquier hora: abrir panel → recargar. Foto `cajon-tras-recargar.png`. Arreglo: en el móvil, arrancar siempre con el panel cerrado (no guardar el estado del cajón). Afecta también a quien pasa del ordenador al móvil (el estado de la 0.191.1 de las testers lo trae abierto).
2. **El panel del móvil y la tableta no se maneja con teclado ni lector.** Sin `role=dialog`, Escape no lo cierra y Tab sale a los botones de la home que quedan detrás (tras 10 tabulaciones, «Ver estadísticas», «Empezar foco»…). 360×640 y 820×1180. Foto `cajon-esc-m.png`. Arreglo: darle `usePaceDialogo` (diálogo, Escape, foco encerrado y devuelto a «Abrir panel»).
3. **El sello sale en el idioma de antes.** Cambias de idioma (aquí o en otra pestaña) sin recargar y el aviso dice «New stamp · Primer paso». Causa: `ToastHost` (`app/ui/Toast.jsx:173`) se suscribe con `useEffect(..., [])` y guarda el `tR`/`t` del primer pintado. Igual el aviso del código. Foto `fm-4-fin.png`. Arreglo: resolver título y texto al pintar, o `t` en un ref.
4. **Ajustes del móvil pide scroll con los avisos bloqueados.** Rompe la regla «los Ajustes del móvil no piden scroll» (fila v0.174.6): la línea «Notificaciones bloqueadas» añade 12 px a 360×640 (es y en) y 6 px a 1280×720; la fila «Tus datos» queda cortada. Foto `aj-bloq-360x640-en.png`. Arreglo: sumar esa línea a `umbralBajo` o ponerla en la línea pequeña de «Aviso al terminar».
5. **En inglés, Privacidad y Seguridad abren en español.** El inglés está al final (≈8000 px abajo a 360) sin enlace. Foto `web_privacym-light-en.png`. Arreglo: `id="en"` en la sección, enlace «English ↓» arriba y la app enlaza `/privacy#en` y `/safety#en` en inglés.

## Arreglos menores
6. **De noche las losetas dicen lo mismo.** A las 23:30 «Una hora» y «Dos horas» dicen «Hasta las 0:00» (Dos horas da 30 min); a las 22:45 «Dos horas · Hasta las 0:00» son 1 h 15. Foto `noche-2330.png`. A: decir lo que dura de verdad («Hasta las 0:00 · 30 min»); B: esconder la que ya no cabe.
7. **Los logros dicen «Pomodoro»** («Completa tu primer Pomodoro», «12 Pomodoros», «8 Pomodoros en un día»); la app dice «Foco» (Ez quitó «pomodoro» del aro). Foto `m-es-1-Ver_logros.png`. es y en.
8. **«Tras 0 de tus 60 Focos, una pausa.»** (Qué te ayuda) suena raro con cero. Foto `vet-16-9-m-st-Quteayuda.png`. A: otra frase con cero («Aún no has parado justo después de un Foco»); B: no enseñar la tarjeta hasta que haya una.
9. **«Otro» con más de 180 minutos se ignora sin decir nada** (vuelve a 25), y con menos de 5 sube a 5. A: subir/bajar al límite igual en los dos lados.
10. **«2 series · 25·12 reps»** se lee como multiplicación. Foto `zoom-reps.png`. Propuesta: «25 y 12 reps».
11. **Resumen del mes**: «78» va con estilo de rótulo y las horas en decimales («20,6h», «1,1h»). Foto `zoom-mes.png`.

## Comprobado y sin problema
Sin errores de consola en ningún recorrido; sin conexión funciona (Respira incluido); dos pestañas se sincronizan (Foco, agua, idioma); la visita guiada entera; Hidrátate por encima de la meta y a medianoche; la web (landing, /premium, /beta, /recuperar, /gracias, /desistir, 404) en 360 y 1280, es/en, claro/oscuro, sin scroll lateral. El contraste del gris (4,2 y 3,9) ya lo eligió Ez; no se propone.
