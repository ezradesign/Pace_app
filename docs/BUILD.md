# BUILD.md — PACE build pipeline

> Documenta el proceso de generacion de `PACE_standalone.html` a partir de los
> fuentes modulares en `app/`. Actualizado en sesion 56 (v0.27.3).

---

## Como funciona el build

El script `build-standalone.js` toma `PACE.html` (entry point de desarrollo)
e inlinea todos sus assets locales para producir `PACE_standalone.html`, un
archivo HTML completamente autocontenido que funciona en cualquier navegador
sin servidor ni conexion a internet.

El pipeline ejecuta en este orden:

1. **Validacion sintactica de `app/`** — todos los `.js` y `.jsx` bajo `app/`
   son parseados con el TypeScript parser real (modo JSX activado para `.jsx`).
   Si cualquier archivo tiene un error de sintaxis, el build aborta con el
   archivo, linea:columna y un snippet de 5 lineas de contexto.

2. **Validacion de scripts inline de `PACE.html`** — los bloques `<script>`
   sin atributo `src` son extraidos y parseados. Los `type="text/babel"` se
   tratan como JSX, los demas como JS puro. Los comentarios HTML se eliminan
   antes de buscar etiquetas de script para evitar falsos positivos.

3. **Inlinado de assets:**
   - `app/tokens.css` se convierte en `<style>` inline.
   - Cada `<script type="text/babel" src="...">` es reemplazado por el
     contenido del archivo correspondiente.
   - `app/ui/pace-logo.png` se convierte en data URI base64.
   - Se elimina `<link rel="manifest">` (causa errores CORS en `file://`).

4. **Verificacion de null bytes** en el bundle resultante.

5. **Escritura** de `PACE_standalone.html`.

---

## Validaciones aplicadas

El validador usa `typescript` (ya instalado en el workspace como dependencia
del SDK de Anthropic) en lugar de `@babel/parser` para evitar dependencias de
red. La API usada es:

```js
ts.createSourceFile(label, content, ts.ScriptTarget.Latest, true, kind)
// kind = ts.ScriptKind.JSX para .jsx y scripts Babel inline
// kind = ts.ScriptKind.JS  para .js y scripts JS puros
```

Los errores de sintaxis se extraen de `sourceFile.parseDiagnostics`. Solo se
detectan errores **sintacticos** — no errores semanticos (variables no
definidas, tipos incorrectos, etc.).

Plugins activos de forma implicita en el modo JSX del parser de TS:
- Sintaxis JSX (`<Component />`, `<div>...</div>`)
- Template literals
- Optional chaining y nullish coalescing
- Async/await, destructuring, spread

---

## Como ejecutar el build localmente

```bash
# Desde la raiz del proyecto:
node build-standalone.js

# O con el script de npm (requiere package.json presente):
npm run build
```

El build imprime el progreso en 5 pasos y termina con:

```
=== Build completado: PACE_standalone.html -- NNN KB ===
```

El bundle esperado esta entre **540 KB y 590 KB**. Si el tamanyo se aleja
significativamente de ese rango, revisar si falta algun archivo o si hay
contenido duplicado.

---

## Que hacer si el build aborta

### Error en un archivo `app/`

```
  [ERROR] Syntax error in app/focus/FocusTimer.jsx at 312:4
  '}' expected.

     310 |   return (
     311 |     <div className="timer">
  >  312 |
     313 |
  [ERROR] Abortando build. Reparar el archivo antes de continuar.
```

1. Abrir el archivo indicado en la linea senalada con `>`.
2. El marcador `>` apunta a donde el parser detecto el problema; el error real
   suele estar en las lineas inmediatamente anteriores (cierre faltante,
   truncamiento, etc.).
3. Reparar el archivo, guardar, y volver a ejecutar `node build-standalone.js`.

### Error en un script inline de `PACE.html`

```
  [ERROR] Syntax error in .../PACE.html inline script #36 at 8:0
  ';' expected.
```

Abrir `PACE.html` y localizar el script inline segun su indice (contando desde
0, excluyendo scripts con `src="..."`). Reparar y reintentar.

### El build siempre pasa pero la app falla en el navegador

El parser solo detecta errores de sintaxis. Errores logicos o de runtime
(variable no definida, componente no exportado a `window`, etc.) no son
detectables en build time. Revisar la consola del navegador.

---

## Como anadir nuevos archivos al pipeline

### Nuevo archivo `.js` o `.jsx` en `app/`

No se requiere configuracion adicional. `validateAppFiles()` recorre `app/`
recursivamente con `fs.readdirSync` y valida automaticamente cualquier archivo
con extension `.js` o `.jsx` que encuentre.

Para que el archivo se incluya en el bundle, debe existir una etiqueta
`<script type="text/babel" src="app/...">` correspondiente en `PACE.html`.

### Nuevo script inline en `PACE.html`

Tampoco requiere configuracion. `validateInlineScripts()` extrae y valida
automaticamente todos los bloques `<script>` sin `src`.

### Nuevo asset CSS

Si se anaden hojas de estilo adicionales, hay que agregar la logica de inlinado
en la seccion 4 de `main()` siguiendo el patron de `tokens.css`.

---

## Despues del build

El build genera `PACE_standalone.html` pero **no commitea ni pushea nada automaticamente**.
Antes de cerrar Claude Code, el usuario debe:

1. Verificar que el bundle tiene el tamano esperado (540-590 KB).
2. Ejecutar `scripts/check-session.ps1` para detectar commits sin push y worktrees sin mergear.
3. Mergear el worktree de Claude a `main` si es necesario (ver [`docs/WORKFLOW.md`](./WORKFLOW.md)).
4. Hacer `git push origin main` manualmente.

```powershell
# Diagnostico rapido antes de cerrar:
powershell -File scripts/check-session.ps1
```

---

## Limitaciones conocidas

- **Solo sintaxis, no semantica.** El parser no detecta variables no definidas,
  imports faltantes, props incorrectos, ni errores de tipo. Para eso, ejecutar
  `tsc --noEmit` manualmente (requiere configuracion adicional de tsconfig).

- **No detecta truncamiento semantico.** Si un archivo termina con una funcion
  valida pero le falta logica interna, el parser no lo detectara porque la
  sintaxis puede ser correcta.

- **No valida PACE.html como HTML.** Solo valida los bloques `<script>` dentro
  del HTML. Errores de markup HTML no son detectados.

- **Ruta de TypeScript hardcodeada.** El require apunta a
  `/usr/local/lib/node_modules_global/lib/node_modules/typescript`. Si el
  entorno cambia (maquina diferente, Docker distinto), hay que actualizar esa
  ruta o instalar TypeScript via `npm install --save-dev typescript`.

- **Sesion 56 · implementacion.** Se uso el TypeScript parser en lugar de
  `@babel/parser` porque npm estaba bloqueado en el entorno de build del
  workspace. Si en el futuro se tiene acceso a npm, se puede migrar a
  `@babel/parser` con `plugins: ['jsx']` para mayor fidelidad con el runtime
  de Babel standalone usado en produccion.
