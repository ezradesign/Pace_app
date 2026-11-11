# Dos textos para auditar fuera con Fable (11 nov. 2026)

Para pegar tal cual en la app externa de Ez, uno por conversación. Cuando Ez traiga la respuesta, se guarda en
`docs/audits/fable-9nov/` de la rama `claude/auditoria-fable-9nov-8401fc` y se comprueba como las otras seis pasadas
(cada hallazgo, contra el código, antes de sumarlo a `cola.md`).

## Séptima pasada: lo que se montó el 11 nov., antes de publicarlo

```
Eres un auditor externo de PACE, una app de pausas activas (React 18 sin bundler, PWA y Capacitor). El repositorio es público: https://github.com/ezradesign/Pace_app. Lee primero CLAUDE.md y docs/product/DECISIONES_TECNICAS_VIGENTES.md en main.

Audita SOLO lo que cambia en estas cuatro ramas respecto a main (míralas con la comparación de GitHub, main...rama):
1. claude/caza-ci-landing-noche-5ea50b: persistState deja de escribir mientras la landing está delante.
2. claude/montar-auditoria-10nov-3ef28c: fila de compra en Ajustes, el cierre del ejercicio nombra lo que sigue, la línea de los lunes (sobre, cajón y panel), bienvenida e invitación sin «v1», el día de v1 solo se quedan las rutinas de pago acabadas, y los logros Ocaso y Búho con reglas nuevas.
3. claude/chatgpt-jornada-9nov: «Cambiar» con un Foco en marcha pasa el bloque al día nuevo; las sesiones por tu cuenta, aparte en Estadísticas › Hoy; los minutos de una pausa hecha son los que se hicieron (dato nuevo dia.sesiones).
4. claude/caza-aro-fijo-10nov: el tamaño del aro de la home con el horario abierto.

Busca, por este orden: (a) pérdida o corrupción de datos: estados guardados con versiones anteriores que no traen los campos nuevos, el cambio de día y la medianoche, dos pestañas abiertas, importar una copia vieja; (b) caminos en los que la app deja de guardar cuando debería (por ejemplo al pasar de la landing a la app en la misma carga) o guarda cuando no debería; (c) logros: quien ya tenía Ocaso o Búho, quien cumple la regla nueva con datos viejos, y dobles avisos; (d) cuentas que no cuadran entre la línea del día, la lista de la jornada y Estadísticas; (e) cruces entre las cuatro ramas al juntarlas: el mismo archivo tocado dos veces, archivos que pasan de 500 líneas, textos que faltan en inglés; (f) pruebas nuevas que no pueden fallar o que dependen de la hora a la que se pasan.

Para cada hallazgo: número, gravedad (grave, medio, leve), archivo y línea, qué le pasa a la persona que usa la app, cómo reproducirlo y el arreglo más pequeño. Separa lo que has comprobado leyendo el código de lo que supones. No elogies ni resumas lo que funciona. Si algo ya está decidido en DECISIONES_TECNICAS_VIGENTES.md o en docs/product/DECISIONES_PRODUCTO.md, no lo discutas: dilo en una línea. Termina con las preguntas que solo puede contestar el dueño (como mucho cinco, cada una con tu recomendación) y con las pruebas que hay que hacer a mano en un móvil. En español llano.
```

## Octava pasada: las pruebas, que son la red de todo lo demás

```
Eres un auditor externo de PACE, una app de pausas activas (React 18 sin bundler, PWA y Capacitor). El repositorio es público: https://github.com/ezradesign/Pace_app. Lee primero CLAUDE.md, docs/BANCOS.md y docs/product/DECISIONES_TECNICAS_VIGENTES.md en main.

Audita la red de seguridad, no la app: scripts/verify*.js, la carpeta tests/ (Playwright), playwright.config.js y .github/workflows/. Ayer una prueba caía solo entre las 22:00 y las 24:00 porque instalaba el reloj a la hora real, y destapó un fallo de verdad que llevaba semanas sin verse. Quiero saber qué más se nos está escapando así.

Busca, por este orden: (a) pruebas que dependen de la hora, del día de la semana, del mes, del idioma o de la zona horaria de la máquina; (b) asertos que no pueden fallar (toHaveCount(0) sobre algo que nunca existió, esperas que no esperan, condiciones siempre ciertas, pruebas que se saltan en silencio); (c) lo que la app promete y ninguna prueba defiende: empieza por «no se pierde ningún dato», «nada tapa nada», «la home no hace scroll», «nada se guarda con la landing delante», lo de pago y el modal de seguridad de la apnea; (d) pruebas frágiles con la máquina cargada (esperas fijas, orden entre pruebas, estado compartido, puertos); (e) diferencias entre lo que pasa el CI y lo que se prueba en local, y cosas vigiladas solo en el YAML; (f) comprobaciones de verify que miden por un solo lado o que se pueden cumplir sin cumplir lo que quieren defender.

Para cada hallazgo: número, gravedad (grave, medio, leve), archivo y línea, qué fallo real de la app dejaría pasar, y la prueba o el cambio más pequeño que lo cierra. Separa lo comprobado leyendo el código de lo que supones. No elogies ni resumas lo que funciona. Termina con las diez pruebas que añadirías primero, por orden de lo que protegen, y con las preguntas que solo puede contestar el dueño (como mucho cinco, con tu recomendación). En español llano.
```
