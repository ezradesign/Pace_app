# Relevo de la coordinadora · 22 oct. 2026 (tarde)

Coordina desde las 19:30 del 22 oct. la sesión `local_40565a0f-bb09-49ec-af11-5f5f20bdc5bb`, en la cuenta
de la hoja https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT (5 h al 1 % y la semana al 62 % al empezar). Antes,
`local_f20bfd4a-d23a-4420-8608-915558f91136` en la otra cuenta (llegó al 93 %) y `local_7f8a7a6d-68cd-45e8-9548-a7425f60ae05`.
Este archivo es lo que necesita la siguiente para seguir, también desde la otra cuenta de Claude.
**La cola de abajo es la única lista de lo pendiente** (Ez, 22 oct.: «todo lo que vaya quedando
pendiente vete organizando para ir haciéndolo y no perder nada»): lo que aparece, entra aquí.

## Quién soy y qué hago

Coordino desde la carpeta principal (`main`). Las sesiones trabajan cada una en su rama y su worktree,
**nunca suben a main**. Cuando una acaba: reviso su rama, se lo enseño a Ez en palabras llanas y, con
su sí, la junto (`git merge --no-commit`, choques de versión a la más alta), build, `verify`, la suite
entera con todo junto y push. Como mucho dos sesiones a la vez, con archivos y puertos
(`PACE_E2E_PORT`) repartidos. Commits sin `Co-Authored-By` (`verify` lo rechaza).

## Dónde está main

v0.174.4 juntada el 22 oct. por la tarde con el sí de Ez: el calendario que se mantiene solo (C1-C3,
v0.174.3) y «Tus rutinas» con Estadísticas (once casos y las cinco A de su maqueta, v0.174.4), más la
frase de la pared opcional que eligió Ez. Suite entera con todo junto: 790 en verde y 2 saltadas, sin fallos. Las ramas `claude/happy-allen-d915c3` y
`claude/beautiful-perlman-2b642c` ya están dentro; sus sesiones, paradas (archivarlas, con el sí de Ez).

## Sesiones en marcha

| Sesión | id | Carpeta y rama | Puerto | Versión | Lleva |
|---|---|---|---|---|---|
| Pausas, logros y créditos | `local_6078ef5d-836f-4398-8487-c2dbe44ea7e6` (antes `local_ff2ad2d7-…`) | `.claude/worktrees/logros-creditos-6ea13b`, `claude/logros-creditos-6ea13b` | 8801 | v0.174.5 | M3 logros solo con la sesión entera, A9 Respira retomada en dos pestañas (acreditar una vez por id), A8 Intro en el menú de pausa, M1 el aro al volver, M5 «Ponle ritmo al día» en Estadísticas |
| Maqueta: inicio, Ajustes y la voz | `local_6ea49468-69c8-4211-8b1b-e1669f2cd9a7` (antes `local_6c95115f-…`) | `.claude/worktrees/maqueta-inicio-3a2a59`, `claude/maqueta-inicio-3a2a59` | 8803 | v0.174.6 si monta | Una página para Ez: M7 abrir con los módulos, M6 Ajustes más altos, M4 la voz grave en Rondas (para oír). Monta solo lo que Ez elija |

Las dos saben que al 85 % hacen «wip» y push, y que al 90 % dejan su punto en el bloque de arriba de
`docs/traspaso/LEEME.md` de su rama. Para retomarlas desde la otra cuenta: `docs/WORKFLOW.md` §10
(sesión nueva en la MISMA carpeta, con la misma rama y el mismo puerto; `start_session` con `cwd`).

**Retomadas a las 19:30 del 22 oct. en esta cuenta** (mismas carpetas, ramas y puertos):
- «Pausas, logros y créditos»: M3, A9, A8 y M1 ya en commits; M5 («Ponle ritmo al día») estaba sin commitear
  y la rama nunca se había subido. Encargo: «wip» y push, terminar M5 y cerrar v0.174.5 con la suite en el 8801.
- «Maqueta»: rama limpia en ba71467, nada montado y SIN la pregunta 4. Encargo: primero la pregunta 4 en una
  página NUEVA de esta cuenta (el enlace RHBJDiTX… es de la otra) y mandar el enlace; después montar 1A 2A 3A
  como v0.174.6. Nada de pausas hasta que Ez conteste la 4.
- CI de main en 96845c5: CI, Android e iOS en verde.

**Al relevo (80-90 % de uso, 22 oct. hacia las 18:00; esta cuenta se repone a las 21:10):**
- **Al 91 %:** la sesión «Maqueta» publicó su página (https://claude.ai/artifact/RHBJDiTX5Rix3EXYfN8ugj, de esta
  cuenta) y **Ez eligió 1A 2A 3A** (`DECISIONES_PRODUCTO.md`). Se le mandó guardar el HTML en su carpeta
  (`docs/proposals/maqueta-inicio-22oct.html`, con `maqueta-inicio-hallazgos.md`), hacer «wip» y push, y
  montar 1A 2A 3A si el uso le deja. Comprobar en su rama qué llegó. La pregunta 4 (pausas con bloques
  cortos) se añade republicando la página desde ese HTML en la otra cuenta.
- La rana, 22 oct. por la noche: el dibujo nuevo de Ez tampoco vale (de tres cuartos, con las manos y no los
  antebrazos, las rodillas sin abrir, la flecha hacia delante y color en los muslos). Se le dio un prompt corto.
- La rana, antes: Genspark sigue sin la postura (espinillas a los lados y tronco erguido); Ez tiene el texto para
  corregirlo, o probar la vista de tres cuartos.
- Las dos sesiones siguen en marcha y saben que al 85 % hacen «wip» y push, y al 90 % dejan su punto en LEEME
  de su rama. Mira su carpeta por si quedó algo sin commitear (`node scripts/relevo-hilo.js <carpeta>`).
- A «Maqueta» se le pidió una **cuarta pregunta** en su página: la invitación de 2 min y «A mi ritmo ·
  Después de cada bloque» (solo maqueta). Comprobar en su rama que llegó. Su página, cuando la publique, es
  lo primero que se enseña a Ez; Ez contesta con letras y la sesión monta lo elegido.
- A «Pausas, logros y créditos» se le dijo que, si algún arreglo cambia lo que se ve más allá del fallo,
  mande capturas antes/después para Ez antes de montarlo (Ez: «todo esto quiero verlo en una maqueta antes
  de implementarlo»).
- CI de `main`: verde en la suite local con todo junto (790); el de GitHub de los últimos commits de docs,
  sin mirar al relevo (`gh run list --branch main`).
- Ez tiene pendiente: los correos de los testers, la rana (prompt de solo postura, en el chat) y la consulta
  a ChatGPT de los 8 movimientos de 2 min (prompt dado).

## La cola, por orden

Cuando una sesión acaba y se junta, entra la siguiente de esta lista que no pise archivos de la otra.
El detalle de cada caso está en `STATE.md`, «Deuda conocida».

1. **Los bloques cortos (M2): la invitación de 2 min** (Ez eligió la propuesta de ChatGPT «por partes»;
   `DECISIONES_PRODUCTO.md`, «Lo que Ez vio en su móvil»). **Maqueta hecha y elegida: 4a A · 4b A (solo con el
   día empezado) · 4c A** (https://claude.ai/artifact/LjDEPtgQssnNm16iZ8EJdA). La monta la sesión «Maqueta» como
   v0.175.0 cuando acabe 1A 2A 3A y «Pausas, logros y créditos» esté en main (toca el aro); no se junta sin el
   texto de los dos minutos que trae Ez de ChatGPT. Las guiadas no cambian. Con la opción «A mi ritmo · Después de cada bloque» para bloques cortos (Ez, gratis; en ese modo las rutinas pueden repetirse, nunca dos seguidas). Toca
   `ritmo.regla.js` (`ritmoComponer`), `state-ritmo.jsx` (`ritmoPrevios`), `ritmo.series.js`
   (`ritmoServir`: la invitación no consume rutinas) y `FocusTimer.jsx`. Lo que se hace en esos 2 min, se
   puede consultar a ChatGPT (movimientos sin mirar la pantalla, con alternativa sentada).
2. **Montar 1A 2A 3A de la maqueta** (M7, M6, M4) como v0.174.6, en la misma sesión de la maqueta: en marcha.
3. **Lo que prometemos sobre los datos** (P1-P5, auditoría de privacidad de ChatGPT, comprobada): antes
   de conectar «Avísame» y antes de v1.
4. **La bienvenida y los Ajustes** (A1-A5, A7), después de M6, que también toca los Ajustes.
5. **Los dibujos** que vaya entregando Ez en `dibujos-22oct/` (fuera de git): rana, pica en escritorio,
   rotación torácica de pie, los 5 ejercicios con el dibujo equivocado y los logros
   (`docs/product/GLIFOS_A_DIBUJAR.md`, 30 en total). Comprobar cada uno antes de meterlo: la rana de
   Genspark salió dos veces mal (otra postura, fondo de cuadros pintado, pecho con detalles).
6. **Más ejercicios de pie para las pausas cortas** (idea de Ez; falta contenido de pie con el aro a 10
   o 15), con maqueta. Ayuda a M2.
7. **El puente del calendario de Android**, que se traga los errores (PACE ve un calendario vacío y
   puede volver a crear lo que ya estaba), junto con S6.
8. **Seguridad antes de cobrar** (S1, S2, S4, S5, S6), antes de la Fase 6.
9. **Los avisos de Android** (A1-A4): Ez ya tiene la app en su móvil; preguntarle por los avisos.
10. **La hora y la medianoche** (H1-H5), antes de marzo.
11. **«Qué te ayuda» en Estadísticas**, lo último de pago, con maqueta.
12. Con lo que Ez traiga: la Fase 6 del cobro (cuenta de Stripe; antes de cobrar, comprobar restaurar la compra, cancelar, sin conexión y el paso desde la beta, y montar y comprobar lo prometido por escrito: las rutinas de pago usadas antes de v1 y la prueba que pide tarjeta. ChatGPT, 22 oct.: el reparto gratis/de pago ya decidido le parece bien; 19,99 € de por vida son 6,7 meses de 2,99 €, así que empuja a la compra de por vida), el llavero del calendario (altas en
    Google Cloud y Microsoft) y el logo nuevo («EVEN» se lee «FVFN»).

**Para ChatGPT** (Ez tiene uso de sobra): ya le di los prompts de «qué pasa cuando sale una versión
nueva», «volver a la app» y «los bloques del día guiado». Lo que traiga se comprueba en el código antes
de creerlo y entra en esta cola.

**Para Ez, por orden**: los correos de los testers en Play, la rana (y el resto de dibujos), la consulta
de los bloques, y cuando pueda: las altas de Google y Microsoft, Stripe, el gestor, el aviso legal, el
logo, copiar sus dos llaves a un disco y la voz «Más»/«More» del suspiro.

## Decisiones de Ez de hoy

- La comida: «B · lo que queda de comida» (`DECISIONES_PRODUCTO.md`), en v0.174.2.
- Dos pestañas a la vez (caso 8 de datos): «A · aceptarlo».
- Calendario: C3 sin pegas; C2 «A · Cuatro casos». En v0.174.3.
- «Tus rutinas»: 1A 2A 3A 4A 5A. En v0.174.4. La pared opcional: «Una pared, si la necesitas».
- Del móvil (`DECISIONES_PRODUCTO.md`, «Lo que Ez vio en su móvil»): logros solo con la sesión entera;
  los bloques cortos, en espera de su consulta.
- Privacidad: la respuesta «No» de Play se mantiene (escribir en el calendario lo pide la persona;
  `/premium` no va en el APK); se corrigen las frases que prometen de más.
- **Uso de la cuenta:** «cuando quede un 90 % de esta sesión migramos hacia otra cuenta de Claude sin
  perder absolutamente nada». Leído como 90 % usado.

## Play Console

App creada, ficha y cuestionarios hechos. Prueba cerrada e interna enviadas con 0.174.0. Ez ya instaló la
interna en su Android y la probó (22 oct.). Pendiente de Ez: los correos de los testers (a la lista
«Testers PACE»). Detalle en la memoria `play_console_21oct`.

## Cómo trabajar con Ez

- A «¿qué toca?», una sola cosa. Sin jerga. Las decisiones, con AskUserQuestion y la recomendada primero;
  lo que no se entiende, con una tabla de casos.
- Su página de pasos (`docs/traspaso/hoja-de-ruta-20oct.html`) se republica en cada paso. Hay una por
  cuenta: https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT en una y
  https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6 en la otra; cada coordinadora pone al día la suya.
- Ez pasa auditorías de ChatGPT: comprobar cada punto en el código antes de creerlo, decir qué es cierto,
  qué ya está arreglado y qué no urge, y meterlo en la cola de arriba.
- Las imágenes que Ez pega sí llegan a esta cuenta. Los dibujos van a `dibujos-22oct/`.
- Una sesión solo se puede abrir en un turno que empezó Ez con un mensaje suyo; desde un aviso
  automático, se deja como tarjeta para que Ez la arranque.
- Un mensaje a una sesión dice «queued», no «leído»: comprobar en su rama que una decisión llegó.
