# Caza del 19 nov. · dónde me quedo

Rama `claude/caza-19nov-c2077c`. Ez contestó: «todas sí a lo recomendado menos 6B + EL 10 SE QUEDA COMO ESTA».
Se monta aquí; ni bump, ni juntar, ni subir a main. **Parado en «wip» con las 5 h de la cuenta al 96 %.**

## Hecho (un commit por hallazgo, cada uno con su prueba vista caer antes del arreglo)

| Nº | Commit | Prueba |
|---|---|---|
| 1 · panel del móvil cerrado al abrir | `551c4f58` | `tests/caza-19nov-cajon.spec.js` (+ `abrirCajon` en helpers; sidebar-movil y sidebar-redesign lo abren a mano) |
| 2 · el cajón es un diálogo | `74ae64d5` | `tests/caza-19nov-cajon.spec.js` |
| 3 · el aviso en el idioma de ahora | `b88ed7d9` | `tests/caza-19nov-textos.spec.js` (solo la parte 3) |
| 4A · Ajustes sin scroll con avisos bloqueados (solo web) | `6aa71736` | `tests/caza-19nov-ajustes.spec.js` |
| 5A · Privacidad y Seguridad en inglés (`#en`, «English ↓») | `92b834a9` | `tests/caza-19nov-ajustes.spec.js` |
| 7 · logros con «Foco» | — | **ya hecho en `claude/arreglos-tester-18nov` (a47d3bd5)**: no se duplica, llega al juntar |
| 10 · «25·12 reps» | — | se queda como está |

`npm run verify` en verde tras el 2 y tras el 5.

## En el wip (código escrito, sin cerrar)

- **6B** (losetas de noche apagadas, «Ya no cabe hoy»): código en `RitmoPanel.jsx` (`ritmoNoCabe`, `ritmoOpcionVacia`),
  `RitmoTarjeta.jsx`, `ritmo.js` (`ritmo.nocabe`) y el censo a 1287. `tests/caza-19nov-noche.spec.js` **en verde (7)**
  con el build del 6. Vecinas (14 archivos: abierta-horas, aro-jornada, ritmo-*, husos-noche, hora-y-medianoche…), con el
  build del 6: **102 en verde y 1 roja**, `tests/ritmo-pausa.spec.js:106` («Hacer la pausa» entra en el plato…). Sin mirar
  aún si es del 6 o de carga (corrían otras suites a la vez): repetirla sola antes del commit del 6.
- **8A, 9A, 11A**: código escrito sin construir ni probar: `StatsAyuda.jsx` + `stats.ayuda.tras.cero` (censo +1 → 1288,
  **falta subirlo**), `FocusTimer.parts.jsx` (`Math.min(180, …)`), `StatsSemana.jsx` (`fmtTime` en h y min; el 78 sin
  rótulo) y `tests/stats-auditoria.spec.js` (E3/E4 al día). `tests/caza-19nov-textos.spec.js` va ya entero en el wip
  (3, 8, 9 y 11); la parte 8/9/11 se vio caer sobre la 0.211.0 (8 rojas) y aún no se ha visto pasar.
- `index.html` está construido con el 6, no con 8/9/11.

## Lo que falta

1. Repetir sola `ritmo-pausa.spec.js:106`; si cae, mirar si es del 6 → commit del 6 (con `index.html` del 6 solo).
2. `node build-standalone.js`, `caza-19nov-textos` entero y vecinas (stats-ayuda, stats-auditoria, caza-ingles, foco-minimo,
   foco-libre-minutos) → un commit por 8, 9 y 11 (censo a 1288 en el del 8).
3. `npm run verify`.
4. Fotos «después»: `node docs/proposals/caza-19nov/guiones/montaje-fotos.js despues` (las «antes» ya están en `fotos/montaje/`).
5. La página: `montado.html` tiene ya las once secciones con fotos y pruebas; pasarla a `index.html` (es la que se publica)
   y publicarla en **EcLj6** como artifact nuevo (las fotos en `files`: `fotos/…` y `fotos/montaje/…`). Apuntar aquí su id.
   La de **5iWBf** (`NmCXPrtbSuCt69NUnKUdPK`) queda por republicar.

## Publicada (la propuesta, antes de montar)

- Cuenta **5iWBf**: https://claude.ai/artifact/NmCXPrtbSuCt69NUnKUdPK (por republicar con lo montado).
- Cuenta **EcLj6**: aún nada.
