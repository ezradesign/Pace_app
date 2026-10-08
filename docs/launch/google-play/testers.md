# PACE en Google Play · la prueba cerrada con 12 testers

Google pide, en cuentas personales nuevas, **12 testers apuntados sin interrupción durante 14 días**
antes de poder publicar. Si alguien se sale y vuelve a entrar, sus 14 días empiezan de cero. Por eso
conviene apuntar **15**: si se cae alguno, sigues llegando a 12.

Lo que necesitas de cada tester: **el correo de su cuenta de Google** (la que usa en Play Store en su
móvil Android). Un iPhone no sirve.

---

## Antes de empezar

- Google te ha confirmado la identidad en Play Console.
- La app está creada en Play Console con la ficha y «Contenido de la app» rellenos
  ([ficha.md](ficha.md) y
  [contenido-de-la-app.md](contenido-de-la-app.md)).
- Tienes el archivo firmado para Play, `PACE-X.Y.Z.aab`. GitHub lo firma en cada push a `main` y lo
  guarda en el borrador de release de su versión (GitHub → Releases → `vX.Y.Z`); también sale como
  artefacto `pace-play-vX.Y.Z` del workflow «Android», que caduca a los 90 días.

## Paso a paso en Play Console

1. Entra en Play Console y abre **PACE**.
2. En el menú de la izquierda: **Probar y publicar > Pruebas > Pruebas cerradas**.
3. Verás una pista que se llama **«Alpha»** (o «Prueba cerrada»). Pulsa **Gestionar pista**.
4. Pestaña **Testers**:
   1. Pulsa **Crear lista de correo electrónico**.
   2. Nombre: `Testers PACE`.
   3. Pega los correos separados por comas y pulsa **Guardar cambios**.
   4. Marca la casilla de esa lista.
   5. En «Comentarios», pon tu correo: es adonde te escribirán los testers.
   6. **Guardar**.
5. Pestaña **Países / regiones**: añade **España** y los países donde vivan tus testers.
6. Arriba, **Crear nueva versión**:
   1. Si pregunta por la **firma de apps de Google Play**, acepta la opción recomendada: Google guarda
      la clave de publicación y tú solo subes.
   2. Sube el `.aab`.
   3. En «Notas de la versión» pega las novedades de [ficha.md](ficha.md).
   4. **Siguiente** y después **Guardar**.
7. Ve a **Resumen de la publicación** (menú de la izquierda) y pulsa **Enviar cambios a revisión**.
8. Google revisa la app (suele tardar de unas horas a unos días). Cuando la apruebe, vuelve a
   **Pruebas cerradas > Gestionar pista > Testers** y copia el **enlace para unirse** (abajo del
   todo, «Unirse desde la web»).
9. Manda ese enlace a los testers con la invitación de abajo.
10. Desde ese día cuentan los 14. En **Panel** verás cuántos testers llevan apuntados.

## Cuando pasen los 14 días

En el **Panel** aparece **Solicitar acceso a producción**. Google hace unas preguntas sobre la prueba.
Al final de este archivo hay un borrador de respuestas para rellenar entonces.

---

## Para encontrar más testers (WhatsApp y LinkedIn)

Con 5 o 6 apalabrados faltan unos 10. Estos dos mensajes son para pedirlo en abierto: el de WhatsApp,
para grupos o para reenviar; el de LinkedIn, como publicación. A quien conteste se le manda después
«La invitación» de abajo.

### WhatsApp (grupos y reenvíos)

```
¡Hola! Un favor pequeño: estoy sacando PACE, una app de pausas activas para quien trabaja sentado (foco, respiración, estiramientos y agua; sin cuentas ni anuncios).

Para publicarla, Google me pide que la prueben 12 personas durante 14 días. Solo hace falta un móvil Android y dejarla instalada esas dos semanas; usarla, cuando te apetezca.

Si te animas, contéstame con el correo de tu cuenta de Google (el de Play Store) y te mando el enlace. Y si se lo pasas a alguien que pase el día delante del ordenador, mejor todavía. ¡Gracias!
```

### LinkedIn (publicación)

```
Llevo meses construyendo PACE, una app para quien pasa la jornada sentado frente a una pantalla: reparte el día en bloques de foco y te sirve pausas cortas y guiadas (respirar, estirar, moverte, beber agua) que caben entre dos tareas.

Sin cuentas, sin anuncios y con tus datos solo en tu móvil.

Ya está lista para Android, y antes de publicarla Google pide una prueba cerrada: 12 personas durante 14 días. Busco a esas personas.

Si tienes un móvil Android y te apetece probarla (y decirme qué echarías de menos), escríbeme por privado o comenta «yo» y te paso el enlace. Solo necesito el correo de tu cuenta de Google.

La versión web ya se puede probar en pacegrass.app

#productividad #bienestar #pomodoro #pausasactivas #android
```

La misma, en inglés, para quien te siga desde fuera (PACE también está en inglés):

```
I've spent months building PACE, an app for people who spend the workday sitting in front of a screen: it splits your day into focus blocks and serves short, guided breaks (breathe, stretch, move, drink water) that fit between two tasks.

No accounts, no ads, and your data stays on your phone.

It's ready for Android, and before it goes public Google asks for a closed test: 12 people for 14 days. I'm looking for those people.

If you have an Android phone and fancy trying it (and telling me what you'd miss), send me a message or comment "me" and I'll share the link. All I need is the email of your Google account.

You can already try the web version at pacegrass.app

#productivity #wellbeing #pomodoro #activebreaks #android
```

Los comentarios de LinkedIn son públicos: pide el correo por mensaje privado, nunca en el hilo.

---

## La invitación (WhatsApp o correo)

```
¡Hola! Estoy a punto de sacar PACE en Google Play, una app de pausas activas para quien trabaja sentado: foco, respiración, estiramientos y agua, sin cuentas ni anuncios.

Google me pide que la prueben 12 personas durante 14 días antes de publicarla. ¿Me ayudas? Solo necesito un móvil Android.

1. Pásame el correo de la cuenta de Google que usas en Play Store.
2. Cuando te mande el enlace, ábrelo en el móvil y pulsa «Hacerte tester».
3. Instala PACE desde Play Store con el botón que aparece.
4. Déjala instalada 14 días y ábrela cuando te apetezca. Si algo falla o echas algo de menos, me lo cuentas.

¡Gracias!
```

## El segundo mensaje (con el enlace)

```
¡Ya está! Este es el enlace para unirte a la prueba de PACE:
[ENLACE]

Ábrelo en el móvil con tu cuenta de Google, pulsa «Hacerte tester» y después instálala desde Play Store. Tarda unos minutos en aparecer; si te dice que no está disponible, espera un poco y vuelve a probar.

Lo único importante: no desinstales la app ni salgas de la prueba en 14 días.
```

## A mitad de prueba (día 7)

```
¡Vamos por la mitad de la prueba de PACE! Gracias por seguir ahí. Si has visto algo raro o tienes una idea, cuéntamela. Y recuerda no desinstalarla hasta el [FECHA].
```

## Al final (día 14)

```
¡Prueba terminada, gracias de verdad! Una última pregunta, que me ayuda mucho: si mañana PACE desapareciera, ¿qué echarías de menos? Con una frase vale.
```

Esa pregunta está en el ROADMAP: sirve para decidir qué va gratis y qué de pago en v1.

---

## Borrador para «Solicitar acceso a producción»

Rellenar al terminar, cambiando lo que está entre corchetes:

- **¿Cómo encontraste a los testers?** Amigos, familia y compañeros de trabajo que pasan la jornada
  sentados frente a una pantalla, que es el público de PACE.
- **¿Cómo de difícil fue?** Fácil / normal.
- **¿Cómo usaron la app?** La abrieron durante su jornada para el foco y las pausas guiadas
  (respiración y movilidad). [Añadir lo que te cuenten.]
- **Comentarios recibidos:** [resumen de lo que te hayan dicho].
- **Público objetivo:** adultos que trabajan sentados, en oficina o en casa.
- **Qué aporta:** reparte la jornada en bloques de foco con pausas activas cortas y guiadas, sin
  cuenta y con los datos solo en el móvil.
- **Descargas previstas el primer año:** [una cifra prudente, por ejemplo 1.000 – 10.000].
- **Cambios hechos tras la prueba:** [lo que se arregle con lo que digan].
- **¿Está lista?** Sí.
