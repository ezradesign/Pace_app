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

## Página
- «Montado y para elegir»: https://claude.ai/artifact/A3Dc4VmgwvjkW7t6v4ZU8r (fuente: index.html y fotos/). Once
  preguntas, recomendadas todas en A. Las maquetas, pintadas sobre la app con conduce.js (semilla + cambios en
  la página); las fotos rec-*, del recorrido.

## Las letras de Ez (18 nov., literal)
«1A + 2A + 3b atenuadas y no hecha las dos + 4A + 5A + 6A + 7A + 8A + 9A + 10A + 11A». La 3: atenuadas Y con
«no hecha», sin minutos. La 4: ajustar tests/abierta-horas.spec.js (V1 A del 7 nov.). La 11: queda para la pasada de textos.
Una por commit con su prueba vista caer; al final, la suite entera con PACE_E2E_PORT=8915 y su cifra en la página.

## Letras montadas (18 nov.)
- 3B fdd3315d · 4A 809f1dc0 (ajusta abierta-horas) · 5A b25d2a40 · 6A 54c72e8c · 7A 170b2fa4 («{zona}: aún sin mover»:
  con «hoy» tres zonas partían la ventana a 360 px) · 9A 126f7c86 · 10A, primera parte, b355be74 (bienvenida y
  líneas de Ajustes; «Lo que suena al respirar», «The voice for each phase» y «What plays as you breathe», más
  cortas que la A porque partían la línea y Ajustes pedía scroll a 360 × 640). MINIMO_PRUEBAS 1702, censo 1259.

## Falta (por orden)
- 2A «Preparar jornada» en un toque: el botón de la tarjeta corta (RitmoTarjeta.jsx, data-pace-ritmo-comienza)
  llama a ritmoComenzarHabitual si hay día habitual; y hace falta «Hoy es distinto» en la tarjeta corta, que hoy
  no está (la A lo daba por hecho). Cuidado con la home sin scroll a 360 × 640 y con las pruebas que pulsan
  comienza y esperan la pregunta: inicio-modulos, home-sin-scroll, ios-calendario.safari, home-fila-recogida.
- 1A sellos: juntos, una campanita, «3 sellos nuevos · Primer paso y dos más»; al ganarlos salvo en un Foco; si
  esperaron más de 15 min, sin sonido (ToastHost en app/ui/Toast.jsx y la cola de state-core.toast.jsx).
- 8A lo de ayer: la frase de la serie cuando la elige lo de ayer («Piernas: ayer no las moviste»; ritmo.series.js).
- 10A, el resto: «6 vasos en la jornada» y el contexto sin borde en «Ver todo»; el calendario de la web «Descarga lo
  que queda de hoy y ábrelo con tu calendario» solo en la web (cal.resumen; en la app sigue «Se añade»); «Hoy,
  lunes» la primera semana (ritmo.manana.titulo; también el aviso de entrada); «hecha» en la fila de la pausa ya
  hecha. CONTENT.md:345 aún dice «sin mover hoy».
- La página «Montado» con la cifra de la suite y fotos de lo nuevo.
