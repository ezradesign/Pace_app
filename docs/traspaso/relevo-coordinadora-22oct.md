# Relevo de la coordinadora · 22 oct. 2026 (noche)

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

**v0.174.5** juntada el 22 oct. hacia las 21:00 con el sí de Ez (commit 3dfe0fc): logros solo con la sesión
entera (Ez: «entera» como se montó: saltar un descanso no corta, saltar un ejercicio sí, una Respira retomada
que llega al final cuenta, Foco no cambia), Respira en dos pestañas, Intro en el menú de pausa, el aro al
volver y «Ponle ritmo al día». Suite entera con todo junto: 800 en verde y 2 saltadas. El CI de GitHub de
3dfe0fc estaba corriendo al relevo: **mirarlo primero** (`gh run list --branch main`); no subir nada a main
mientras corre, porque un push nuevo cancela el anterior. La rama `claude/logros-creditos-6ea13b` ya está
dentro; su sesión (`local_6078ef5d-…`), terminada: archivarla con el sí de Ez.

## Sesiones en marcha

| Sesión | id | Carpeta y rama | Puerto | Versión | Lleva |
|---|---|---|---|---|---|
| Maqueta: inicio, Ajustes y la voz | `local_6ea49468-69c8-4211-8b1b-e1669f2cd9a7` (antes `local_6c95115f-…`) | `.claude/worktrees/maqueta-inicio-3a2a59`, `claude/maqueta-inicio-3a2a59` | 8803 | v0.174.6 | Monta 1A 2A 3A (al relevo, pasando su suite entera); luego la maqueta nueva de «Hacerla» (abajo) y, con el sí de Ez, las pausas como v0.175.0 |

Sabe que al 85 % hacen «wip» y push, y que al 90 % dejan su punto en el bloque de arriba de
`docs/traspaso/LEEME.md` de su rama. Para retomarlas desde la otra cuenta: `docs/WORKFLOW.md` §10
(sesión nueva en la MISMA carpeta, con la misma rama y el mismo puerto; `start_session` con `cwd`).

**Al relevo (22 oct., ~21:00, al 75-90 % de esta cuenta; se repone a las 00:30):**
- La otra cuenta tiene margen desde las 21:10. Retomar «Maqueta» en su MISMA carpeta, rama y puerto
  (`node scripts/relevo-hilo.js .claude/worktrees/maqueta-inicio-3a2a59`, leer su punto arriba de
  `docs/traspaso/LEEME.md` de su rama y `start_session` con `cwd` y `use_worktree: false`).
- Lo que llevaba «Maqueta» al relevo: v0.174.6 (1A 2A 3A) montada y en su suite entera (solo cayó una de
  Android, ya arreglada); faltaba cerrar con commit, push y aviso. Después, **la maqueta nueva de «Hacerla»**
  (Ez, 22 oct. noche): al pulsar «Hacerla» sale UN ejercicio de los que ya hay en Mueve o Estira (de pie o
  sentado, sin suelo ni material), con su título, su instrucción, su duración propia aunque pase de 2 min y el
  glifo GENÉRICO del módulo, no el del ejercicio; sin consulta a ChatGPT. Ez: «la integración era para tener
  opción a hacerlos con más frecuencia en pomodoros cortos, o no». Propone dos o tres nombres para la
  invitación, porque ya no son siempre dos minutos. Se republica en https://claude.ai/artifact/LjDEPtgQssnNm16iZ8EJdA
  (esta cuenta: desde la otra, página nueva desde `docs/proposals/maqueta-inicio-22oct.html` de su rama).
- Cuando avise de v0.174.6: revisar la rama, contárselo a Ez en palabras llanas y, con su sí, juntarla (los
  choques de versión, a la más alta: main ya está en v0.174.5).
- La hoja de ruta de esta cuenta está al día (https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT); la de la otra
  (https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6) se pone al día publicando el mismo archivo con su `url`.
- La rana: Ez la deja de momento. Las dos de hoy no valían (de lado, rodillas juntas, flecha hacia delante).
  El estilo bueno es el prefijo «Classical anatomical plate…» de `PROMPTS_IMAGENES.md`; la rana se pinta de frente.
- Ez busca testers y tiene dos prompts de ChatGPT: lo legal y lo que falta para cobrar (en el chat). Lo
  que traiga, se comprueba en el código y entra en la cola.

## La cola, por orden

Cuando una sesión acaba y se junta, entra la siguiente de esta lista que no pise archivos de la otra.
El detalle de cada caso está en `STATE.md`, «Deuda conocida».

1. **Los bloques cortos (M2): la invitación** (Ez eligió la propuesta de ChatGPT «por partes»;
   `DECISIONES_PRODUCTO.md`, «Lo que Ez vio en su móvil»). **Maqueta hecha y elegida: 4a A · 4b A (solo con el
   día empezado) · 4c A** (https://claude.ai/artifact/LjDEPtgQssnNm16iZ8EJdA). La monta la sesión «Maqueta» como
   v0.175.0 cuando acabe 1A 2A 3A (ya puede: v0.174.5 está en main), tras la maqueta nueva de «Hacerla» (un
   ejercicio de Mueve o Estira con el glifo del módulo; arriba, «Al relevo») y con el sí de Ez. Las guiadas no cambian. Con la opción «A mi ritmo · Después de cada bloque» para bloques cortos (Ez, gratis; en ese modo las rutinas pueden repetirse, nunca dos seguidas). Toca
   `ritmo.regla.js` (`ritmoComponer`), `state-ritmo.jsx` (`ritmoPrevios`), `ritmo.series.js`
   (`ritmoServir`: la invitación no consume rutinas) y `FocusTimer.jsx`.
2. **Montar 1A 2A 3A de la maqueta** (M7, M6, M4) como v0.174.6, en la misma sesión de la maqueta: en marcha.
3. **Una página para captar testers de Android, `pacegrass.app/beta`** (idea de Ez, 22 oct. noche; va
   aquí porque los testers fijan la fecha de v1). En español e inglés: qué es PACE, qué se pide (instalar
   desde Play, tenerla 14 días, abrirla y contar qué falla) y PACE completo de por vida como gracias
   (`codigos-tester.csv`). Dos pasos: unirse a un grupo de Google «PACE testers» y abrir el enlace de Play.
   El grupo, como lista de testers de la prueba cerrada en Play Console, junto a «Testers PACE»: así se
   apunta cada uno y PACE no guarda correos. Lo que hace Ez: crear el grupo y añadirlo en Play. Maqueta
   primero. El enlace de Play funciona cuando Google apruebe la prueba cerrada. **Maqueta hecha: Ez eligió
   1A · 2A** (https://claude.ai/artifact/8Vj5rGU6aE9Ewr9JfYFJXL, `docs/proposals/beta-testers-22oct.html`): como
   /premium, con las capturas de Google Play en tira (Ez: «para que luzca más»), y «PACE completo de por vida,
   en la web y en Android» (en Android, con códigos de regalo de Google Play al salir v1). **La A se queda** (Ez: «en el ordenador queda
   perfecto»), **pero con la letra y los botones de PACE**: «la cursiva de los títulos grandes no me convence, las
   letras de los botones son genéricas, todo tiene que tener mucho más estilo PACE». La maqueta calcó /premium, que
   usa EB Garamond y botones genéricos; la app usa Cormorant Garamond por defecto (`data-font="cormorant"`,
   `DESIGN_SYSTEM.md`) y sus propios botones (`--focus-cta`). **Y lo mismo en /premium** (Ez: «con esto
   arreglaremos la tipografía de premium»). Antes de montarlo, un antes/después de los títulos y los botones de
   /beta y /premium, calcados de la app, para que Ez lo vea: **hecho**, https://claude.ai/artifact/KMBL3zRVKHADG5GR5uSKri
   (`docs/proposals/letra-beta-premium-22oct.html`; A Cormorant itálica y el botón de «Empezar» del Foco, la
   recomendada; B la misma letra sin cursiva). **Ez eligió A** («como la app, en cursiva») **y los colores clásicos
   de PACE, si procede, para darle un toque** (los de los módulos en `app/tokens.css`: el oliva del Foco, la
   terracota de Respira, el de Mueve, Estira y Agua). Se montan /beta y /premium a la vez; los colores, con un
   antes/después rápido si cambian algo más que un detalle.
4. **Lo que prometemos sobre los datos** (P1-P5, auditoría de privacidad de ChatGPT, comprobada): antes
   de conectar «Avísame» y antes de v1.
5. **La bienvenida y los Ajustes** (A1-A5, A7), después de M6, que también toca los Ajustes.
6. **Los dibujos** que vaya entregando Ez en `dibujos-22oct/` (fuera de git): rana, pica en escritorio,
   rotación torácica de pie, los 5 ejercicios con el dibujo equivocado y los logros
   (`docs/product/GLIFOS_A_DIBUJAR.md`, 30 en total). Comprobar cada uno antes de meterlo: la rana de
   Genspark salió dos veces mal (otra postura, fondo de cuadros pintado, pecho con detalles). Y **un repaso
   de todos los dibujos** (Ez, 22 oct. noche: «Glúteos sentado, sus glifos son de pie»; «Apretar glúteos» ya
   estaba entre los 5): una página con cada ejercicio, su dibujo y lo que dice su texto (sentado, de pie, en
   el suelo), marcando los que no casan; Ez decide cuáles se rehacen.
7. **Más ejercicios de pie para las pausas cortas** (idea de Ez; falta contenido de pie con el aro a 10
   o 15), con maqueta. Ayuda a M2.
8. **El puente del calendario de Android**, que se traga los errores (PACE ve un calendario vacío y
   puede volver a crear lo que ya estaba), junto con S6.
9. **Seguridad antes de cobrar** (S1, S2, S4, S5, S6), antes de la Fase 6.
10. **Los avisos de Android** (A1-A4): Ez ya tiene la app en su móvil; preguntarle por los avisos.
11. **La hora y la medianoche** (H1-H5), antes de marzo.
12. **«Qué te ayuda» en Estadísticas**, lo último de pago, con maqueta.
13. Con lo que Ez traiga: la Fase 6 del cobro. **Su lista, la auditoría de ChatGPT del 22 oct. noche,
    comprobada en lo que toca al código: `docs/audits/cobro-chatgpt-22oct.md`** (la tienda web y Play vacías, la
    función de desistimiento, el aviso de fin de prueba de 7 días que Stripe no cubre, el alta en Hacienda y RETA
    antes de vender, «de por vida» y la privacidad con pagos). (Cuenta de Stripe; antes de cobrar, comprobar restaurar la compra, cancelar, sin conexión y el paso desde la beta, y montar y comprobar lo prometido por escrito: las rutinas de pago usadas antes de v1 y la prueba que pide tarjeta. ChatGPT, 22 oct.: el reparto gratis/de pago ya decidido le parece bien; 19,99 € de por vida son 6,7 meses de 2,99 €, así que empuja a la compra de por vida), el llavero del calendario (altas en
    Google Cloud y Microsoft) y el logo nuevo («EVEN» se lee «FVFN»).

**Para ChatGPT** (Ez tiene uso de sobra): ya le di los prompts de «qué pasa cuando sale una versión
nueva», «volver a la app» y «los bloques del día guiado». Lo que traiga se comprueba en el código antes
de creerlo y entra en esta cola.

**Para Ez, por orden**: los testers (y, con la página de arriba, el grupo de Google), el gestor para darse
de alta y cobrar, la consulta de ChatGPT de lo legal para cobrar, los dibujos (la rana, en pausa), y cuando pueda: las altas de Google y Microsoft, Stripe, el gestor, el aviso legal, el
logo, copiar sus dos llaves a un disco y la voz «Más»/«More» del suspiro.

## Decisiones de Ez de hoy

- La comida: «B · lo que queda de comida» (`DECISIONES_PRODUCTO.md`), en v0.174.2.
- Dos pestañas a la vez (caso 8 de datos): «A · aceptarlo».
- Calendario: C3 sin pegas; C2 «A · Cuatro casos». En v0.174.3.
- «Tus rutinas»: 1A 2A 3A 4A 5A. En v0.174.4. La pared opcional: «Una pared, si la necesitas».
- Del móvil (`DECISIONES_PRODUCTO.md`, «Lo que Ez vio en su móvil»): logros solo con la sesión entera,
  y «entera» como se montó (v0.174.5). Las pausas con bloques cortos: 4a A · 4b A (solo con el día empezado)
  · 4c A, y al pulsar «Hacerla», un ejercicio de Mueve o Estira con el glifo del módulo (maqueta pendiente).
- La página para testers (`/beta`), en la cola, «en el orden que proceda».
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
