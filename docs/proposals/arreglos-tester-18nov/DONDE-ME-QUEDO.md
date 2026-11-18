# Dónde me quedo · arreglos del recorrido de tester (18 nov. 2026)

Rama `claude/arreglos-tester-18nov`, desde `main` 0.210.0 (cf9cc9d3). Ez (18 nov.): «todo menos» lo de las
actividades con el día servido (se queda como está). Recorrido: https://claude.ai/artifact/T8J9vT4s5aodPFLd1k3iYM

## Montado (cada uno con su prueba vista caer; verify en verde; MINIMO_PRUEBAS 1693; censo i18n 1258)
1. 258d66ba Estadísticas › Hoy dice lo hecho en cada pausa (`ritmoPlatosVistos`, tests/stats-hoy-lo-hecho.spec.js).
2. 6e1248c6 + 72f60064 El sello del aro no se pinta encima del cajón del móvil (Toast.jsx, tests/sello-cajon.spec.js).
3. a47d3bd5 Logros: Foco y no Pomodoro, «Cinco bloques de Foco de 45 min», 9:00, PACE, sin «SIT» (es y en).
4. 07cd65e8 Escritorio express, «5 movimientos» (es y en).
5. db4c120a «Prepárate» cuenta los pasos sin descansos, como el cierre (Levántate y sube: 4 pasos).
6. 21d12b91 Respira en la pausa larga de «sal de la silla»: «De pie o sentado» (`ritmoPausaDeLevantarse`).
   Las 4 de textos, en tests/textos-verdad.spec.js.
7. 462adbd3 Los porqués del «No» y «Deshacer», 24 px de alto (tests/feedback-toques.spec.js).

## No era fallo
- «Pausa terminada» horas después: la V1 A de Ez (7 nov.) lo pide (tests/abierta-horas.spec.js, «de 8:10 a
  12:10 el aro dice Pausa terminada»). Deshecho; va a la página como opinión.

## Falta
- La página «Montado y para elegir» (docs/proposals/arreglos-tester-18nov/index.html) con las opiniones
  pintadas sobre la app: sellos (cuándo y cuántos), «Preparar jornada» en un toque, Estadísticas con las no
  hechas, «Pausa terminada», la jornada cerrada con dos botones, el runner que aún cuenta el descanso en
  «Paso X de N» (tras el arreglo 5, es el único), «Hombros: sin mover hoy», lo de ayer, y los textos (inglés
  «Day complete», «I did it my own way», bienvenida, Ajustes, Ver todo, nombres, calendario web).
- Suite entera sin pasar (solo las vecinas con --workers=1 en el puerto 8915).
