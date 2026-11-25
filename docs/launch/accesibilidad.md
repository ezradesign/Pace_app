# PACE · el lector de pantalla y las etiquetas de accesibilidad de Apple

Ez, L8A del 25 nov. 2026 («PACE, listo para las tiendas»). App Store Connect tiene unas **etiquetas de
accesibilidad** (Accessibility Nutrition Labels) que salen en la ficha: se declara qué funciones de
accesibilidad soporta la app en sus tareas habituales. No son obligatorias, pero hay quien cuenta en el foro de
Apple que sin ellas la app no sale al filtrar por accesibilidad. Solo se marca lo que se ha probado en un
iPhone de verdad.

Las pruebas automáticas ya miran que cada botón tenga nombre (`tests/accesibilidad-nombres.spec.js`), que todo
se pueda hacer con el teclado (`accesibilidad-teclado.spec.js`, `home-a11y.spec.js`) y que la home quepa con la
letra grande en Android (`DECISIONES_TECNICAS_VIGENTES.md`). Lo que no ha hecho nadie es una pausa entera con
el lector de pantalla.

## La prueba (15 minutos, en el iPhone y luego en Android)

Enciende el lector: en el iPhone, **Ajustes › Accesibilidad › VoiceOver** (o pide a Siri «activa VoiceOver»);
en Android, **Ajustes › Accesibilidad › TalkBack**. Se navega deslizando un dedo a la derecha y se toca dos
veces para pulsar. Apunta lo que no se entienda o no se pueda hacer.

1. Abre PACE desde cero (o con «Borrar todos mis datos»): ¿se lee la bienvenida y se puede pulsar «Comenzar»?
2. En «¿Cómo es tu semana?», cambia un día de Jornada a Libre y pulsa «Continuar».
3. Salta la visita guiada.
4. En la home, elige 15 minutos y pulsa «Empezar foco». ¿Dice cuánto queda si tocas el aro?
5. Pausa el Foco y termínalo.
6. Abre Respira y empieza una técnica suave (Coherente 5·5). ¿Se entiende cuándo inspirar y espirar sin mirar?
7. Abre Estira, empieza una rutina y pasa al paso siguiente.
8. En Hidrátate, apunta un vaso. ¿Dice cuántos llevas?
9. Abre Estadísticas y Logros, y vuelve atrás.
10. En Ajustes, apaga el sonido y vuelve a encenderlo.

Después, sin el lector:

- **Texto más grande** (iPhone: Ajustes › Accesibilidad › Pantalla y tamaño del texto › Texto más grande, al
  máximo): ¿cambia la letra de PACE? Hoy la vista web del iPhone no sigue ese ajuste por sí sola, así que lo
  probable es que no.
- **Reducir movimiento** (Ajustes › Accesibilidad › Movimiento): el aro y las transiciones deberían quedarse
  quietos; PACE lo respeta en el código.
- **Modo oscuro**: toda la app en oscuro, sin zonas blancas.

## Qué se marca en App Store Connect (la app › Accesibilidad)

Por dispositivo (solo iPhone). Con la prueba hecha:

| Etiqueta | Marcar | Por qué |
|---|---|---|
| VoiceOver | Si los 10 pasos se hacen sin ver | Es la que más se busca |
| Control por voz | Si los botones se pueden decir por su nombre | Va con los nombres que ya miran las pruebas |
| Texto más grande | **No**, salvo que la prueba diga lo contrario | La vista web del iPhone no sigue el tamaño del sistema |
| Interfaz oscura | Sí | PACE tiene modo oscuro y sigue al del iPhone |
| Diferenciar sin color | Sí | Cada módulo lleva su nombre y su icono además de su color |
| Contraste suficiente | Sí | El gris más claro del texto da 4,9 a 1 sobre el papel (`--ink-3`, F5A del 24 nov.), por encima del 4,5 que pide WCAG AA |
| Movimiento reducido | Si la prueba lo confirma | El código lo respeta |
| Subtítulos y Audiodescripción | No aplica | PACE no tiene vídeo |

Si algo de la prueba falla, apúntalo en una línea y lo arreglo antes de marcar esa etiqueta.

## Para después

Seguir el tamaño de letra del iPhone (Dynamic Type) en la vista web es posible con la letra del sistema
(`-apple-system-body`) y reescalando la app, pero toca la home entera, que ya se mide al píxel. Queda para
después de v1, con maqueta.
