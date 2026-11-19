# Dónde me quedo · arreglos menores (19 nov. 2026)

Rama `claude/menores-valorar-16nov-87ef7b`. No se junta ni se sube a `main`: eso lo hace la coordinadora con el «júntalo» de Ez.

## Hecho
- `f86ae1b0`: junta `main` (0.211.0). Conflictos resueltos (MoveSessionV1.jsx, censo de i18n 1291, DECISIONES, index.html). verify en verde.
- `afdc8726`: los tres pasos de la 1A con el sí de Ez del 19 nov. (Círculos de brazos «Atrás.»/«Otro brazo.»,
  Gateo «Atrás.», Desliza el talón «Otra pierna.»; textos sin la frase que dice la palabra; el gateo en inglés se queda).
  Censo 1294. `tests/runner-cambios.spec.js` cubre los 8 pasos en 6 tamaños (50 casos). Vista caer con el texto
  viejo (5 rojas, 2 → 3 líneas a la letra al 115 %); con el nuevo, 56 en verde (con textos-ejercicios), y los tres
  iguales a la línea base sin palabra en líneas, hueco y dibujo. verify en verde.
- `genera.js 10` (escena nueva): las fotos de los tres a 360 × 640 y 1280 × 800.

## Lo siguiente
1. Pruebas vecinas (runner-*, voz-cuerpo*, glifos-*, cierre-dibujo, mueve-reloj, revision-ejercicios, ver-ejercicio,
   preview-ejercicio, biblioteca, linea-ficha, tus-rutinas-auditoria, tus-rutinas-chatgpt) con `--workers=1`, puerto 8935.
2. Fotos: `node build-standalone.js` y `node docs/proposals/menores-16nov/genera.js 10` (puerto 8885).
3. Suite entera con `PACE_E2E_PORT=8935` SOLO si no escucha nada en 8915 ni 8925; rojas, repetidas solas.
4. Página `index.html` de esta carpeta: fotos nuevas, cifra de la suite, «listo para juntar». Publicarla en la
   cuenta EcLj6 (la de antes, `BF18PgPNiZ2Qv6j9jhWEx3`, es de la otra cuenta) y apuntar el par en
   `docs/traspaso/archivos/hoja-ids-cuentas.js` como [id nuevo, 'BF18PgPNiZ2Qv6j9jhWEx3'].
5. Ojo para Ez: con «Auto» apagado no hay palabra en los pasos de repeticiones, así que el texto de brazos y
   talón ya no dice «el otro» ni «con cada pierna». Decirlo en la página.
