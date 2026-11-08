# Revisión de ChatGPT de los textos en inglés (7 nov. 2026)

Ez le pasó a ChatGPT el texto de su hoja («Pasar a ChatGPT la revisión de los textos en inglés») y trajo
la respuesta, que está entera en `revision.md`. Son 281 propuestas: `app/i18n/strings/*`,
`app/i18n/content/*` y las páginas `premium/`, `beta/`, `gracias/`, `recuperar/` y `desistir/`.

## Lo comprobado

- **Las 257 claves que cita existen y tienen hoy exactamente el texto que dice** (`main` 0.192.0,
  comparadas cargando los archivos de `app/i18n/` en el orden de `PACE.html`). Los 24 textos de las
  páginas web también están donde dice.
- **Las cinco cosas en que el inglés no dice lo mismo que el español son verdad**: `session.hold`
  («Hold your breath» frente a «Retén sin aire»), `lib.empty.floor.n` y `lib.empty.any.n` (el inglés perdió
  `{n}`), `breathe.phase.inhala.mas` (`content/breathe.js` pisa el «Inhale more» de `sessions.js` con
  «again»: la deuda D-1), «Shrug + round» (en español solo se suben y se relajan los hombros) y
  «Latest stamp» frente a «Último logro». Se arreglan sin preguntar.
- **En qué se equivoca**: en `premium.trial.cancel` se inventa «cancel in Settings», cuando el botón para
  cancelar está en la misma hoja (`PremiumAvisoPrueba`, `app/ui/PremiumInvitacion.jsx`); y propone inglés
  británico, cuando la app está casi toda en americano (center ×5, favorite ×9, license ×5, catalog ×2;
  solo «centre», «catalogue» y «energising», una vez cada una) y la ficha de Play es en-US (Ez, 20 oct.).
  Las fechas sí van en en-GB («7 November»), que se lee bien en los dos.

El detalle fila a fila, con el texto que queda, en `comprobado.md`: **239 se ponen tal cual, 15 con un retoque,
4 no** (y en dos de ellas va un texto mío), **y 23 esperan una letra de Ez**.

## Lo que decide Ez (la página: ver la hoja de pasos)

**Ez eligió 1A 2A 3A 4A 5A (7 nov. 2026, ~13:00)**: las cinco recomendadas. Inglés americano; «The antidote to
sitting» (y «to desk work», «to typing»); las promesas de Respira, fuera en los dos idiomas; «sin equipo» y «nadie se
entera», corregidos en los dos; y las promesas de lo gratis se quedan, mejorando solo el inglés.

| | Pregunta | Recomendada |
|---|---|---|
| P1 | Inglés americano (A) o británico (B), igual en toda la app y la web | **A**: es lo que ya hay y la ficha de Play; cambian tres palabras en vez de veinticinco |
| P2 | «Antídoto a la silla» en inglés (seis sitios): «The antidote to sitting» (A), «A break from sitting» de ChatGPT (B) o como está (C) | **A**: frase natural en inglés que guarda la idea |
| P3 | Las descripciones de Respira que prometen un efecto («Regula el sistema nervioso», «Calma mental y foco sostenido», «Entrena la calma con menos aire», «La mente se aquieta»…): quitar la promesa en los dos idiomas (A), solo en inglés (B) o dejarlas (C) | **A**: ningún consejo de salud sin aviso, y Apple y Google miran las promesas de salud |
| P4 | «Sin equipo» en Mueve (hay rutinas con banda y barra) y «Nadie se entera» / «Glúteos invisibles»: corregirlo en los dos idiomas (A) o solo en inglés (B) | **A**: en español tampoco es verdad del todo, y el copy no usa absolutos (s151) |
| P5 | Las promesas de lo gratis («lo esencial, siempre», «Y lo seguirá siendo», «Para siempre»): dejarlas en los dos idiomas (A) o suavizarlas como ChatGPT, también en español (B) | **A**: es el compromiso de Ez con lo gratis, y v1 lo cumple |

## Para montarlo

Una rama nueva sobre `main` (`claude/textos-ingles-7nov`). El encargo: poner `comprobado.md` tal cual, con la columna
«Queda» como texto final, y en las filas «Ez Pn» la letra de arriba; con P1 = A, lo británico de las propuestas va en
americano (color theme, practice, catalog, center, license, analog, toward) y las tres palabras británicas que hay hoy
(«centre», «catalogue», «energising») también. Con P3 = A y P4 = A, el español nuevo se escribe con el mismo criterio
que el inglés, sin prometer efectos ni absolutos, y va a la página de Ez para que lo vea antes de juntar. Las claves no cambian nunca (las de contenido son ids:
`custom.ex.Shrug + round.name` es el alias de las rutinas guardadas, y el `code: 'Equilibrio'` de Respira
se queda); solo el texto. Si P3 o P4 son A, el español va en los datos (`app/breathe/BreatheLibrary.jsx`,
`app/move/move.data.js`) y en `CONTENT.md`. Lo que pide comprobarse a 360 px: las etiquetas de fase de Respira
(«Hold after exhaling», «Inhale more»), los botones de «A tu ritmo» y la barra lateral. Hay pruebas que buscan
textos en inglés: la suite entera antes de juntar. Choca con `claude/accesibilidad-7nov-e36d06`, que añade dos
claves en `app/i18n/strings/sessions.js`: juntar primero esa rama.
