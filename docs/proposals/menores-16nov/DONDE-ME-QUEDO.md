# Dónde me quedo · arreglos menores (19 nov. 2026)

Rama `claude/menores-valorar-16nov-87ef7b`. No se junta ni se sube a `main`: eso lo hace la coordinadora con el «júntalo» de Ez.

## Hecho
- `f86ae1b0`: junta `main` (0.211.0). Conflictos resueltos (MoveSessionV1.jsx, censo de i18n 1291, DECISIONES, index.html). verify en verde.
- `afdc8726`: los tres pasos de la 1A con el sí de Ez del 19 nov. (Círculos de brazos «Atrás.»/«Otro brazo.»,
  Gateo «Atrás.», Desliza el talón «Otra pierna.»; textos sin la frase que dice la palabra; el gateo en inglés se queda).
  Censo 1294. `tests/runner-cambios.spec.js` cubre los 8 pasos en 6 tamaños (50 casos). Vista caer con el texto
  viejo (5 rojas, 2 → 3 líneas a la letra al 115 %); con el nuevo, 56 en verde (con textos-ejercicios), y los tres
  iguales a la línea base sin palabra en líneas, hueco y dibujo. verify en verde.
- `genera.js 10` (escena nueva) corrido a las 13:05 con el build de `afdc8726`: seis fotos en `fotos/1-montada-{brazos,gateo,talon}[-1280].jpg`,
  miradas: la palabra delante, el texto en dos líneas, nada pisado (360 × 640 y 1280 × 800).

## Lo siguiente
1. Pruebas vecinas: ya no aparte (la tanda de las 12:39 murió con la app a las 12:59, 0xC0000142, y no cuenta): van en la suite.
2. Fotos: hechas (arriba).
3. Suite entera SOLO cuando la coordinadora mande «turno de suite» (corre la de la voz): `PACE_E2E_PORT=8936 npm run test:e2e -- --reporter=line`
   de fondo; 8935 y 8835 tienen servidores colgados que no se dejan matar. Rojas, repetidas solas.
4. Página `index.html` de esta carpeta: fotos nuevas, cifra de la suite, «lista para juntar». Se publica en ESTA cuenta (5iWBf)
   en su sitio, `https://claude.ai/artifact/BF18PgPNiZ2Qv6j9jhWEx3` (read y republicar encima). El par de EcLj6 queda
   PENDIENTE: cuando alguien la publique en EcLj6, apuntar [id de EcLj6, 'BF18PgPNiZ2Qv6j9jhWEx3'] en
   `docs/traspaso/archivos/hoja-ids-cuentas.js`.
5. Ojo para Ez: con «Auto» apagado no hay palabra en los pasos de repeticiones, así que el texto de brazos y
   talón ya no dice «el otro» ni «con cada pierna». Decirlo en la página.
