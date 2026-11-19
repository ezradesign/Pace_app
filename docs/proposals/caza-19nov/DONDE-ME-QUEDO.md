# Caza del 19 nov. · dónde me quedo

Rama `claude/caza-19nov-c2077c`. Ez contestó: «todas sí a lo recomendado menos 6B + EL 10 SE QUEDA COMO ESTA».
**Montado entero en la rama.** Ni bump, ni juntar, ni subir a main: la suite entera la pasa la coordinadora.

## Hecho (un commit por hallazgo, cada uno con su prueba vista caer antes del arreglo)

| Nº | Commit | Prueba |
|---|---|---|
| 1 · panel del móvil cerrado al abrir | `551c4f58` | `tests/caza-19nov-cajon.spec.js` (+ `abrirCajon` en helpers; sidebar-movil y sidebar-redesign lo abren a mano) |
| 2 · el cajón es un diálogo | `74ae64d5` | `tests/caza-19nov-cajon.spec.js` |
| 3 · el aviso en el idioma de ahora | `b88ed7d9` | `tests/caza-19nov-textos.spec.js` |
| 4A · Ajustes sin scroll con avisos bloqueados (solo web) | `6aa71736` | `tests/caza-19nov-ajustes.spec.js` |
| 5A · Privacidad y Seguridad en inglés (`#en`, «English ↓») | `92b834a9` | `tests/caza-19nov-ajustes.spec.js` |
| 6B · losetas de noche apagadas, «Ya no cabe hoy» | `777ff465` | `tests/caza-19nov-noche.spec.js` (las de 1280 se ajustaron después de caer por no encontrar las losetas: esas tres no se vieron caer por el fallo) |
| 7 · logros con «Foco» | — | **ya hecho en `claude/arreglos-tester-18nov` (a47d3bd5)**: no se duplica, llega al juntar |
| 8A · «Después del Foco» con cero | `21afbbf0` | `tests/caza-19nov-textos.spec.js` |
| 9A · «Otro» por encima de 180 se queda en 180 | `5ed5a1d6` | `tests/caza-19nov-textos.spec.js` |
| 10 · «25·12 reps» | — | se queda como está |
| 11A · línea del Mes en h y min | `c759f467` | `tests/caza-19nov-textos.spec.js` (+ stats-auditoria E3/E4 al día) |

- Censo de claves i18n: 1288 (+1 el 2, +1 el 6B, +1 el 8A; el 4A cambia una por otra).
- `npm run verify` en verde con todo (tras el 11A).
- Vecinas pasadas, todas con `--workers=1` en el 8945: sidebar-movil, sidebar-redesign, accesibilidad-teclado, sello-aro,
  sello-espera, logros-i18n, premium-codigo, ajustes*, android-avisos, android-nativo, compra-apps, feedback-porque, sw-legales,
  cabeceras, web-dist, 14 de «A tu ritmo» (la roja de `ritmo-pausa.spec.js:106` era de carga: sola y con su archivo, verde),
  stats-ayuda, foco-minimo, foco-libre-minutos, stats-auditoria, caza-ingles, plurales.
- Los dos wip de antes (fa816880 y 2aec6b79) siguen en la historia: se rehicieron como commits limpios y se juntaron con
  un merge «ours» (`f6e97710`), porque el push forzado no estaba permitido. El árbol es el de `c759f467`.

## La página

- `index.html` de esta carpeta: los once con lo elegido, foto de antes y después (`fotos/montaje/`) y su prueba.
  Guion de las fotos: `guiones/montaje-fotos.js antes|despues`.
- Cuenta **EcLj6**: https://claude.ai/artifact/2h8vx4y2YvrzaJV55cSavH (nueva, con lo montado).
- Cuenta **5iWBf**: https://claude.ai/artifact/NmCXPrtbSuCt69NUnKUdPK (la propuesta) **queda por republicar** con este `index.html`.

## Lo que no se hizo

- La suite entera (la pasa la coordinadora antes de juntar).
- En Android y en el iPhone la nota de avisos bloqueados sigue como estaba; no se midió si allí pide scroll.
- Las páginas de la web (inicio, /premium, /beta) enlazan /privacy y /safety sin `#en`; quien llega de ahí tiene el «English ↓».
