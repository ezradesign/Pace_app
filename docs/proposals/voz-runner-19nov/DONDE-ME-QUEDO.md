# Voz del runner (Mueve y Estira) · dónde me quedo

Rama `claude/voz-runner-19nov`, worktree `.claude/worktrees/voz-runner-19nov`, suite en el puerto 8925.
No se junta ni se sube a `main` desde aquí: eso es de la coordinadora con el «júntalo» de Ez.

## Lo que estaba mal (medido en un Chromium con el reloj de verdad)

1. **Los números iban una repetición tarde.** La pantalla (`repsDe`, `MoveSessionV1.jsx`) cuenta la
   repetición que empieza; la voz contaba la que acababa. En el mismo instante: pantalla «2», voz «uno».
   En todas las series guiadas, es y en.
2. **La cuenta de entrada salía a medias** («tres, madera, uno»). El contexto de audio nacía con el
   primer «tres» y tarda en arrancar (0,54 s medido): el «tres» sonaba tarde y el «dos» caía a madera.
3. **La serie se decidía palabra a palabra**, aunque la regla vigente dice «entera»: un «tres» a madera
   y un «dos» con voz daban cuenta a medias; un tic 80 ms tarde tiraba el «dos».

## Commits

- `284551fa` la voz dice el número que la pantalla acaba de poner (`v1VozRep(n, repSec, total)`, serie n2…nN)
- `9dba8399` la serie se decide con su primera palabra (`op.primera`, `_paceVozCuerpoSerie`, `_paceVozCuerpoSuena`)
- `9c970812` el audio se despierta al montar el runner (`v1VozPrecarga`)
- `9afebe8e` fila nueva arriba en `DECISIONES_TECNICAS_VIGENTES.md`
- `e7161860` la página para Ez (`index.html` de esta carpeta)

Pruebas: `tests/voz-runner-sincro.spec.js` (sincro-1, 1b, 2, 3), las cuatro vistas caer contra `main`
antes del arreglo. `voz-1`, `fila-3` y `fila-4` cambiadas a la serie nueva. `MINIMO_PRUEBAS` = 1699.
`npm run verify` en verde. Las 17 pruebas de voz en verde. Medido otra vez en real: «tres, dos, uno»
enteros y cada número a la vez que su cifra (queda la latencia del altavoz, ~50 ms).

## Lo que espera a Ez

Página: https://claude.ai/artifact/U8qW3hFxwdsUDRDiBJdkwo (recomendado 1A · 2A · 3A).

1. Cuentas que empiezan en 5 (entrada, colocarse 5 s en 33 rutinas, cambio de lado 5 s en 4): A sin voz
   (madera en 3, 2, 1) · B la voz cuenta las cinco con «cinco» y «cuatro» de la toma de números (en
   inglés con sulafat «five» no cabe en 1 s) · C grabar «cinco» y «cuatro» y, mientras, A.
2. Cuentas largas: A «tres, dos, uno» al final como ahora · B sin voz.
3. Primera repetición: A «Ya, dos, tres…» (como queda ahora) · B «Uno» en vez de «Ya».

## Lo siguiente

- La suite entera en el 8925 estaba corriendo al escribir esto (lanzada el 19 nov. a las 12:36). Si murió,
  repetirla: `PACE_E2E_PORT=8925 npm run test:e2e`, sin otra suite a la vez.
- Cuando Ez conteste: 1A se hace en `v1VozCuenta` (pasar dónde empieza la cuenta: `V1_PREP_SECONDS`,
  `totalesRef.current.place/change`) y devolver `null` si empieza en más de 3 y menos de 6; con su prueba.

- Página en 5iWBf (19 nov., 13:25, la coordinadora): https://claude.ai/artifact/HK1v4xCyvV6TH7U2MC1xoX, par de U8qW3h… apuntado en `hoja-ids-cuentas.js`. Suite entera relanzada por la coordinadora en el **8926** (la del 8925 murió a las 12:59 al cambiar de cuenta).
- **Suite entera en el 8926 (19 nov., 13:05-13:50): 1744 en verde, 2 saltadas a propósito, 0 rojas** (log en `suite-19nov.log` de esta carpeta). Ez eligió «1A + 2A + 3A» (19 nov.): falta montar la 1A con su prueba.

## La 1A, montada (19 nov., tarde)

- `97ea5420` las cuentas que empiezan en 4 o 5 (entrada, colocarse 5 s, cambio de lado 5 s) van sin voz, a
  madera en 3, 2, 1: `v1VozCuenta(n, desde)` recibe `V1_PREP_SECONDS`, `totalesRef.current.place/change`
  o `effDur`. La vuelta de la pausa (empieza en 3) y las cuentas largas (2A) siguen con voz. La 2A y la 3A
  ya eran así: nada que tocar.
- Prueba nueva `tests/voz-cuenta-cinco.spec.js` (cinco-1 con «Manos y muñecas», cinco-2 con la función),
  las dos vistas caer antes del arreglo. `voz-1` y `sincro-2` puestas al día (la entrada ya no dice
  «tres»). `MINIMO_PRUEBAS` = 1701. Las 25 de voz en verde en el 8926 y `npm run verify` en verde.
  **La suite entera no se ha pasado tras la 1A**: la pasa la coordinadora antes de juntar.
- Página en EcLj6 republicada con la 1A montada: https://claude.ai/artifact/U8qW3hFxwdsUDRDiBJdkwo.
  **Falta republicar su par de 5iWBf** (`HK1v4xCyvV6TH7U2MC1xoX`) desde esa cuenta con el `index.html`
  de esta carpeta.
- Sin bump, sin juntar con `main`: eso, con el «júntalo» de Ez.
