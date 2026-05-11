# check-session.ps1 — Diagnostico de estado Git para PACE
# Solo lectura. No modifica nada. Ejecutar antes de cerrar Claude Code.
# Uso: powershell -File scripts/check-session.ps1

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ROOT = Split-Path -Parent $PSScriptRoot
Set-Location $ROOT

Write-Host ""
Write-Host "================================================"
Write-Host " PACE -- Diagnostico de sesion Git"
Write-Host "================================================"
Write-Host ""

# --- 1. Rama actual ---
$currentBranch = git branch --show-current 2>&1
Write-Host "[1] Rama actual: $currentBranch"

$isWorktree = $currentBranch -match '^claude/'
if ($isWorktree) {
    Write-Host "    AVISO: Estas en un worktree de Claude Code, NO en main."
    Write-Host "    Debes mergear a main antes de cerrar la sesion."
} else {
    Write-Host "    OK: Estas en main (o rama de usuario)."
}
Write-Host ""

# --- 2. Cambios sin commitear ---
Write-Host "[2] Cambios sin commitear (git status --short):"
$statusLines = git status --short 2>&1
if ($statusLines) {
    $statusLines | ForEach-Object { Write-Host "    $_" }
    Write-Host "    AVISO: Hay cambios sin commitear."
} else {
    Write-Host "    OK: Working tree limpio."
}
Write-Host ""

# --- 3. Commits locales sin push ---
Write-Host "[3] Commits locales sin push (vs origin/main):"
$unpushed = git log origin/main..HEAD --oneline 2>&1
if ($unpushed -and $unpushed -notmatch 'fatal|unknown revision') {
    $unpushed | ForEach-Object { Write-Host "    $_" }
    $count = ($unpushed | Measure-Object).Count
    Write-Host "    AVISO: $count commit(s) sin pushear a origin/main."
} elseif ($unpushed -match 'fatal|unknown revision') {
    Write-Host "    INFO: No se pudo comparar con origin/main (sin remote o sin fetch)."
    Write-Host "    Ejecuta: git fetch origin"
} else {
    Write-Host "    OK: Sin commits pendientes de push."
}
Write-Host ""

# --- 4. Worktrees abiertos ---
Write-Host "[4] Worktrees abiertos (git worktree list):"
$worktrees = git worktree list 2>&1
$worktrees | ForEach-Object { Write-Host "    $_" }
$claudeWorktrees = $worktrees | Where-Object { $_ -match '\[claude/' }
if ($claudeWorktrees) {
    Write-Host "    AVISO: Hay worktree(s) de Claude activos. Mergear antes de cerrar."
} else {
    Write-Host "    OK: Sin worktrees de Claude activos."
}
Write-Host ""

# --- 5. Estado del bundle ---
Write-Host "[5] Estado de PACE_standalone.html:"
$standaloneFile = Join-Path $ROOT "PACE_standalone.html"
if (Test-Path $standaloneFile) {
    $info = Get-Item $standaloneFile
    $sizeKB = [math]::Round($info.Length / 1KB, 1)
    $modified = $info.LastWriteTime.ToString("yyyy-MM-dd HH:mm")
    Write-Host "    Existe: $sizeKB KB  |  Ultima modificacion: $modified"
    if ($sizeKB -lt 530 -or $sizeKB -gt 600) {
        Write-Host "    AVISO: Tamano fuera del rango esperado (530-600 KB). Verificar build."
    } else {
        Write-Host "    OK: Tamano dentro del rango esperado."
    }
} else {
    Write-Host "    ERROR: PACE_standalone.html no encontrado."
}
Write-Host ""

# --- Resumen final ---
Write-Host "================================================"
$issues = @()
if ($isWorktree)                                          { $issues += "Estas en worktree (mergear a main)" }
if ($statusLines)                                         { $issues += "Cambios sin commitear" }
if ($unpushed -and $unpushed -notmatch 'fatal|unknown')   { $issues += "Commits sin push a origin/main" }
if ($claudeWorktrees)                                     { $issues += "Worktree(s) de Claude sin mergear" }

if ($issues.Count -eq 0) {
    Write-Host " RESULTADO: Todo en GitHub"
} else {
    Write-Host " RESULTADO: Accion requerida:"
    $issues | ForEach-Object { Write-Host "   - $_" }
}
Write-Host "================================================"
Write-Host ""
Write-Host "Ver docs/WORKFLOW.md para los comandos de merge y push."
Write-Host ""
