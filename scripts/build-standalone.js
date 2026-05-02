#!/usr/bin/env node
/*
 * build-standalone.js — inliner zero-deps para PACE
 *
 * Lee PACE.html y produce PACE_standalone.html con todos los scripts,
 * estilos y assets locales referenciados embebidos inline.
 *
 *  - Scripts/links de CDN (http://, https://, //) NO se tocan: se
 *    conservan tal cual con sus integrity/crossorigin.
 *  - Imágenes locales (`<img src="ruta/local.png">`) se inlinean como
 *    data URI base64 (Opción 1: bundle 100% portable).
 *  - Antes de sobrescribir el standalone existente, se rota a
 *    `backups/PACE_standalone_vX.Y_YYYYMMDD.html` (máx 5 backups).
 *
 * Uso:
 *   node scripts/build-standalone.js
 *
 * Sin dependencias npm. Solo Node ≥ 14 (usa `fs`, `path`).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENTRY = path.join(ROOT, 'PACE.html');
const OUTPUT = path.join(ROOT, 'PACE_standalone.html');
const BACKUPS_DIR = path.join(ROOT, 'backups');
const MAX_BACKUPS = 5;

// ---------------------------------------------------------------- helpers ---

function fail(msg) {
  console.error('\n[build-standalone] ✗ ' + msg);
  process.exit(1);
}

function log(msg) {
  console.log('[build-standalone] ' + msg);
}

function isLocalUrl(url) {
  if (!url) return false;
  if (url.startsWith('http://') || url.startsWith('https://')) return false;
  if (url.startsWith('//')) return false;
  if (url.startsWith('data:')) return false;
  return true;
}

function readUtf8(filePath) {
  if (!fs.existsSync(filePath)) {
    fail('No existe el archivo referenciado: ' + path.relative(ROOT, filePath));
  }
  return fs.readFileSync(filePath, 'utf8');
}

function readBuffer(filePath) {
  if (!fs.existsSync(filePath)) {
    fail('No existe el archivo referenciado: ' + path.relative(ROOT, filePath));
  }
  return fs.readFileSync(filePath);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function detectVersion(html) {
  const m = html.match(/<title>[^<]*?v(\d+\.\d+\.\d+)[^<]*?<\/title>/);
  if (!m) fail('No se pudo detectar la versión en <title> de PACE.html.');
  return m[1];
}

function todayStamp() {
  const d = new Date();
  return d.getFullYear().toString()
    + String(d.getMonth() + 1).padStart(2, '0')
    + String(d.getDate()).padStart(2, '0');
}

function mimeFor(ext) {
  const e = ext.toLowerCase().replace(/^\./, '');
  if (e === 'png') return 'image/png';
  if (e === 'jpg' || e === 'jpeg') return 'image/jpeg';
  if (e === 'svg') return 'image/svg+xml';
  if (e === 'gif') return 'image/gif';
  if (e === 'webp') return 'image/webp';
  return 'application/octet-stream';
}

// ----------------------------------------------------------------- backups ---

function rotateBackups(currentVersion) {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    log('Carpeta backups/ creada (no existía).');
  }
  if (!fs.existsSync(OUTPUT)) {
    log('PACE_standalone.html no está en raíz — no hay nada que rotar a backups/.');
    return;
  }
  const backupName = `PACE_standalone_v${currentVersion}_${todayStamp()}.html`;
  const backupPath = path.join(BACKUPS_DIR, backupName);
  if (fs.existsSync(backupPath)) {
    log(`Backup ${backupName} ya existe — se sobrescribe.`);
  }
  fs.copyFileSync(OUTPUT, backupPath);
  const size = fs.statSync(backupPath).size;
  log(`Backup creado: backups/${backupName} (${formatBytes(size)})`);
  pruneBackups();
}

function pruneBackups() {
  const re = /^PACE_standalone_v[\d.]+_\d{8}(?:_\d{4})?\.html$/;
  const files = fs.readdirSync(BACKUPS_DIR)
    .filter((f) => re.test(f))
    .map((f) => {
      const p = path.join(BACKUPS_DIR, f);
      return { name: f, path: p, mtime: fs.statSync(p).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
  if (files.length <= MAX_BACKUPS) return;
  for (const f of files.slice(MAX_BACKUPS)) {
    fs.unlinkSync(f.path);
    log(`Backup viejo eliminado: backups/${f.name}`);
  }
}

// ------------------------------------------------------------- inline pass ---

function inlineHtml(html) {
  const inlined = [];

  // <link rel="stylesheet" href="..."> → <style>...</style>
  html = html.replace(/<link\b[^>]*>/g, (match) => {
    const rel = match.match(/rel\s*=\s*"([^"]*)"/i);
    const href = match.match(/href\s*=\s*"([^"]*)"/i);
    if (!rel || !href) return match;
    if (rel[1].toLowerCase() !== 'stylesheet') return match;
    if (!isLocalUrl(href[1])) return match;
    const fullPath = path.resolve(ROOT, href[1]);
    const content = readUtf8(fullPath);
    inlined.push({ kind: 'css', src: href[1], bytes: Buffer.byteLength(content, 'utf8') });
    return `<style>\n${content}\n</style>`;
  });

  // <script ... src="..."></script> → <script ...>...</script>
  // Solo matchea scripts cuyo cuerpo está vacío (whitespace) — los
  // <script> con código inline (ej. mount script al final) NO se tocan.
  html = html.replace(
    /<script\s+([^>]*?)>\s*<\/script>/g,
    (match, attrs) => {
      const src = attrs.match(/src\s*=\s*"([^"]*)"/i);
      if (!src) return match;
      if (!isLocalUrl(src[1])) return match;
      const fullPath = path.resolve(ROOT, src[1]);
      const content = readUtf8(fullPath);
      const otherAttrs = attrs.replace(/\s*src\s*=\s*"[^"]*"\s*/i, ' ').trim();
      inlined.push({ kind: 'js', src: src[1], bytes: Buffer.byteLength(content, 'utf8') });
      const openTag = otherAttrs ? `<script ${otherAttrs}>` : '<script>';
      return `${openTag}\n${content}\n</script>`;
    }
  );

  // <img ... src="..."> → <img ... src="data:...;base64,...">
  html = html.replace(
    /<img\s+([^>]*?)(\s*\/?)>/g,
    (match, attrs, tail) => {
      const src = attrs.match(/src\s*=\s*"([^"]*)"/i);
      if (!src) return match;
      if (!isLocalUrl(src[1])) return match;
      const fullPath = path.resolve(ROOT, src[1]);
      const buf = readBuffer(fullPath);
      const ext = path.extname(src[1]);
      const dataUri = `data:${mimeFor(ext)};base64,${buf.toString('base64')}`;
      const newAttrs = attrs.replace(/src\s*=\s*"[^"]*"/i, `src="${dataUri}"`);
      inlined.push({ kind: 'img', src: src[1], bytes: dataUri.length });
      return `<img ${newAttrs}${tail}>`;
    }
  );

  return { html, inlined };
}

// ----------------------------------------------------------------- main ---

function main() {
  log('Leyendo PACE.html...');
  const original = readUtf8(ENTRY);
  const version = detectVersion(original);
  log(`Versión detectada en <title>: v${version}`);

  log('Rotando backups...');
  rotateBackups(version);

  log('Inlineando referencias locales...');
  const { html: result, inlined } = inlineHtml(original);

  fs.writeFileSync(OUTPUT, result, 'utf8');
  const finalSize = fs.statSync(OUTPUT).size;

  console.log('');
  console.log('  Archivos inlineados:');
  for (const item of inlined) {
    const kind = `[${item.kind}]`.padEnd(6);
    const src = item.src.padEnd(48);
    console.log(`    ${kind} ${src} ${formatBytes(item.bytes)}`);
  }
  console.log('');
  log(`Standalone escrito: PACE_standalone.html (${formatBytes(finalSize)})`);
  log(`Total: ${inlined.length} archivos inlineados.`);
  log('OK.');
}

main();
