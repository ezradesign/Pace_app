# WORKFLOW.md — Protocolo de cierre de sesion Git

> Guia operativa para evitar que el trabajo quede atrapado en worktrees de
> Claude Code sin llegar a `main` ni a GitHub.
> Ultima actualizacion: 2026-05-11 — sesion 58 (v0.27.6)

---

## Por que existe este documento

Entre las sesiones 46 y 57, semanas de trabajo se acumularon en worktrees
aislados (`.claude/worktrees/`) sin llegar a `origin/main`. Recuperar ese
trabajo requirio esfuerzo extra. Este protocolo previene que se repita.

**Causa raiz:** Claude Code abre cada sesion en un worktree temporal. Los
commits se hacen ahi, no en `main`. Si el usuario no mergea y pushea al final,
el trabajo se queda invisible para GitHub.

---

## 1. Verificar donde estas

Antes de cerrar sesion, siempre ejecuta:

```powershell
# Ver todos los worktrees abiertos (main + temporales):
git worktree list

# Ver en que rama esta el worktree actual:
git branch --show-current
```

**Si la rama NO es `main`**, estas en un worktree y debes mergear antes de cerrar.

Ejemplo de salida que indica worktree activo:
```
C:/...Pace_app                              955dba1 [main]
C:/...Pace_app/.claude/worktrees/abc123     a1b2c3d [claude/abc123]   <- aqui estas
```

---

## 2. Commits locales sin push

```powershell
# Commits en este worktree que aun no estan en origin/main:
git log origin/main..HEAD --oneline

# Version mas informativa (autor + fecha):
git log origin/main..HEAD --oneline --decorate
```

Si la salida esta vacia: todo esta en GitHub.
Si hay lineas: hay trabajo sin pushear.

---

## 3. Comandos para mergear worktree → main → push

**Desde el worktree de Claude** (donde trabajaste):

```powershell
# Paso 1: revisar que no hay nada sin commitear
git status --short

# Paso 2: ver los commits que vas a llevar a main
git log origin/main..HEAD --oneline
```

**Luego, en una terminal separada (en el repo principal):**

```powershell
# Paso 3: ir al repo principal (NO al worktree)
cd "C:\Users\ezrav\Desktop\Proyectos\Desarrollo de aplicaciones\Pace_app"

# Paso 4: asegurarte de estar en main
git checkout main

# Paso 5: traer los cambios del worktree
git merge claude/<nombre-del-worktree>

# Paso 6: verificar que el merge fue correcto
git log --oneline -5
git status

# Paso 7: pushear a GitHub
git push origin main
```

**Nombre del worktree:** es lo que `git branch --show-current` muestra en el
worktree de Claude (por ejemplo `claude/affectionate-vaughan-327fa1`).

---

## 4. Checklist de fin de sesion

Ejecutar en orden antes de cerrar Claude Code:

- [ ] `git status --short` → sin cambios sin commitear
- [ ] `git log origin/main..HEAD --oneline` → sin commits sin pushear
- [ ] `git worktree list` → identificar si hay worktrees activos
- [ ] `npm run verify` en verde (paso 2 del cierre en `CLAUDE.md`; si falla, no se sigue)
- [ ] `index.html` regenerado y verificado (`node build-standalone.js`)
- [ ] `PACE_standalone.html` **NO** se regenera — congelado desde s134 (export bajo
      demanda). El `verify` lo restaura solo; si corriste el build a mano,
      `git checkout -- PACE_standalone.html` y comprobar el hash
- [ ] `STATE.md` reescrito con la sesion actual
- [ ] `CHANGELOG.md` actualizado con la nueva version
- [ ] Diario de sesion creado en `docs/sessions/session-NN-xxx.md`
- [ ] Merge del worktree a `main` completado
- [ ] `git push origin main` ejecutado por el usuario
- [ ] GitHub refleja los commits mas recientes

---

## 5. Senales de alarma

Estas situaciones indican que el trabajo NO esta a salvo en GitHub:

| Senal | Que significa | Que hacer |
|---|---|---|
| `git worktree list` muestra ramas `claude/...` | Worktrees de Claude abiertos | Mergear a main antes de cerrar |
| `git log origin/main..HEAD` tiene lineas | Commits locales sin push | `git push origin main` |
| `git status` muestra archivos modificados | Cambios sin commitear | Commitear primero |
| `index.html` no coincide con el build de las fuentes | Artefacto sin regenerar tras tocar `app/` | `node build-standalone.js` y commitear. **El CI lo caza**: es el ultimo paso de `.github/workflows/ci.yml` |
| El check `verify` sale rojo en GitHub | La red de seguridad no pasa | Reproducirlo en local con `npm run verify` — el CI no comprueba nada que no corra ahi |
| `STATE.md` muestra version anterior | Sesion no cerrada formalmente | Completar el cierre de sesion |

---

## 6. Limpieza de worktrees obsoletos

Despues de mergear, puedes eliminar el worktree temporal:

```powershell
# Desde el repo principal (NO desde dentro del worktree a eliminar):
git worktree remove .claude/worktrees/<nombre>

# Si da error "worktree contains modified or untracked files":
git worktree remove --force .claude/worktrees/<nombre>
```

**Precaucion:** solo eliminar si ya mergeaste todos los commits a `main`.

---

## 7. Script de verificacion rapida

Ejecuta `scripts/check-session.ps1` para un diagnostico rapido de todo lo
anterior en un solo comando:

```powershell
powershell -File scripts/check-session.ps1
```

---

## 8. Integracion continua y proteccion de `main` (s153)

### Que corre en GitHub

`.github/workflows/ci.yml` — un solo job, `verify`, en `ubuntu-latest` con Node 24:

1. `npm ci` (instala el lockfile exacto; falla si se desincroniza de `package.json`)
2. **`npm run verify`** — la misma red de seguridad local, invocada tal cual
3. **`index.html` == build de las fuentes** — lo unico que el workflow anade por su
   cuenta, porque el `verify` no puede comprobarlo: corre justo ANTES de regenerar,
   asi que su aviso de deriva es `[INFO]` y nunca se pondra rojo

**El CI no comprueba nada que no corra en local.** Si sale rojo, se reproduce con
`npm run verify` (o `node build-standalone.js` para el tercer paso). Vigilancia nueva
= se anade al `verify`, no al YAML.

### Proteger `main` — lo hace el usuario, no Claude

Requiere permisos de administracion del repo, y `gh` **no esta instalado** en esta
maquina (comprobado en s153), asi que la afirmacion de la auditoria integral de que
`main` esta sin proteger **sigue sin verificar**. Se hace desde la web:

> **Settings → Rules → Rulesets → New ruleset → New branch ruleset**
> - **Name:** `main protegida`
> - **Enforcement status:** Active
> - **Target branches:** Include default branch
> - **Rules:** marcar **Restrict deletions** y **Block force pushes**
> - **NO marcar** «Require a pull request before merging»

Con eso `main` no se puede borrar ni reescribir, y el cierre de sesion sigue siendo un
push directo, como hasta ahora.

**Por que NO se marca «Require status checks to pass»**, aunque suene a lo que uno
quiere: un check solo puede pasar DESPUES de que el commit exista, asi que exigirlo
**bloquea el push directo** — GitHub lo rechaza porque en ese momento no hay ningun
run verde para ese commit. Requerir checks y empujar directo a `main` son
incompatibles: el gate real solo existe con pull requests de por medio.

Si algun dia se quiere ese gate de verdad, el cambio no es una casilla sino el flujo
entero de cierre — rama → push → PR → esperar a `verify` → merge —, y entonces se
anaden **Require a pull request before merging** y **Require status checks to pass**
con el check **`verify`**. Ojo: ese check **solo aparece en el selector de GitHub
despues del primer run del workflow**; hasta entonces la lista sale vacia.

---

Ver tambien: [`docs/BUILD.md`](./BUILD.md) para el pipeline de build.
