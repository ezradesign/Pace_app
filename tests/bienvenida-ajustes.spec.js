/* PACE · la bienvenida y los Ajustes: los fallos de la auditoría externa del 21-22 oct.
 * ===================================================================================
 * Uno por caso (STATE.md, «Deuda conocida»), y cada uno cae sin su arreglo. El Atrás de
 * Android (A2) vive en android-nativo.spec.js, que tiene el Capacitor falso.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, CLAVE_ESTADO, RUTA_ARTEFACTO } = require('./helpers');

const leerEstado = (page) => page.evaluate((clave) => JSON.parse(localStorage.getItem(clave) || '{}'), CLAVE_ESTADO);

test('A1 · el idioma que se elige en la bienvenida quita «Auto» y sigue al volver a abrir', async ({ page }) => {
  await page.goto(RUTA_ARTEFACTO);
  await expect(page.getByRole('button', { name: 'Comenzar' })).toBeVisible();

  await page.getByTitle('Cambiar a English').click();
  await expect(page.getByRole('button', { name: 'Begin' })).toBeVisible();
  const st = await leerEstado(page);
  expect(st.lang).toBe('en');
  expect(st.langAuto, 'la bienvenida dejó el idioma en «Auto»').toBe(false);

  /* El navegador va en español (playwright.config.js): con «Auto» volvería a él. */
  await page.reload();
  await expect(page.getByRole('button', { name: 'Begin' }), 'al volver a abrir, el idioma volvió al del sistema').toBeVisible();
});

test('A3 · volver atrás desde «¿Cómo es tu semana?» no borra lo que ya se había tocado', async ({ page }) => {
  const EDITOR = '[data-pace-semana-editor]';
  const dia = (n) => page.locator(EDITOR + ' [data-pace-semana-dia="' + n + '"]');
  await page.goto(RUTA_ARTEFACTO);
  await page.getByRole('button', { name: 'Comenzar' }).click();
  await page.locator(EDITOR).waitFor({ state: 'visible' });

  await dia(3).click();                 // miércoles: jornada → media
  await page.locator(EDITOR + ' [data-pace-ritmo-horario="inicio"]').selectOption('480');
  await expect(dia(3)).toHaveAttribute('aria-label', 'miércoles, Media');

  await page.getByRole('button', { name: /Atrás/ }).click();
  await page.getByRole('button', { name: 'Comenzar' }).click();
  await page.locator(EDITOR).waitFor({ state: 'visible' });
  await expect(dia(3), 'volver atrás borró el día tocado').toHaveAttribute('aria-label', 'miércoles, Media');
  await expect(page.locator(EDITOR + ' [data-pace-ritmo-horario="inicio"]'), 'volver atrás borró la hora').toHaveValue('480');

  /* Sigue sin escribir nada hasta guardar, y lo que guarda es el borrador entero. */
  expect(await leerEstado(page)).toEqual({});
  await page.locator('[data-pace-semana-guardar]').click();
  const st = await leerEstado(page);
  expect(st.ritmo.semanaTipo[2]).toBe('media');
  expect(st.ritmo.horario).toEqual({ inicio: 480 });
});

test('A4 · con el sonido apagado, lo que cuelga de él tampoco se cambia con el teclado', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, voiceOn: false, ambientOn: false, musicOn: false });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  const sonido = page.locator('[data-pace-aj-fila="sound"] .pace-aj-sw');
  await expect(sonido).toHaveAttribute('aria-checked', 'false');

  /* Tab desde el interruptor: el foco se salta las dos filas atenuadas. */
  await sonido.focus();
  await page.keyboard.press('Tab');
  const enAtenuada = () => page.evaluate(() => !!(document.activeElement && document.activeElement.closest('[data-atenuada]')));
  expect(await enAtenuada(), 'Tab entró en una fila atenuada').toBe(false);

  /* Y una píldora atenuada no coge el foco, así que Enter y Espacio no la cambian. Se suelta
     el foco antes: si no, la tecla le llegaría a lo que lo tuviera (la «Tu semana» de al lado). */
  const soltar = () => page.evaluate(() => document.activeElement && document.activeElement.blur());
  await soltar();
  await page.locator('[data-pace-aj-fila="signal"] .pace-aj-pild').nth(1).focus();
  expect(await enAtenuada(), 'una píldora atenuada cogió el foco').toBe(false);
  await page.keyboard.press('Enter');
  await soltar();
  await page.locator('[data-pace-aj-fila="bg"] .pace-aj-pild').nth(1).focus();
  await page.keyboard.press('Space');
  const st = await leerEstado(page);
  expect(st.voiceOn, 'Enter cambió «Marca la fase» con el sonido apagado').toBe(false);
  expect(st.ambientOn, 'Espacio cambió «Suena detrás» con el sonido apagado').toBe(false);

  /* Control: con el sonido encendido, las mismas píldoras sí responden. */
  await sonido.click();
  await page.locator('[data-pace-aj-fila="signal"] .pace-aj-pild').nth(1).focus();
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await leerEstado(page)).voiceOn).toBe(true);
});
/* Lo que tiene el foco, en una línea que se lee en el fallo. */
const quienTieneElFoco = (page) => page.evaluate(() => {
  const a = document.activeElement;
  if (!a || a === document.body) return 'body';
  return a.tagName.toLowerCase() + ':' + (a.getAttribute('data-pace-aj-volver') != null ? 'volver' : (a.innerText || a.getAttribute('aria-label') || '').trim().slice(0, 40));
});

test('A5 · en la bienvenida, el foco pasa al título del paso nuevo y no se pierde', async ({ page }) => {
  await page.goto(RUTA_ARTEFACTO);
  const comenzar = page.getByRole('button', { name: 'Comenzar' });
  await comenzar.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: '¿Cómo es tu semana?' })).toBeVisible();
  expect(await quienTieneElFoco(page), 'al pasar a la semana el foco cayó fuera').toBe('h2:¿Cómo es tu semana?');

  /* «← Atrás» desaparece al volver a la primera pantalla: el foco va a su título. */
  await page.getByRole('button', { name: /Atrás/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTitle('Cambiar a English')).toBeVisible();
  expect(await quienTieneElFoco(page), 'al volver atrás el foco cayó fuera').toMatch(/^h1:/);
});

test('A5 · en los Ajustes del móvil, entrar y salir de «Tus datos» no pierde el foco', async ({ page, context }) => {
  await sembrar(context);
  await page.setViewportSize({ width: 360, height: 740 });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  const abrirDatos = page.locator('[data-pace-tweaks-panel] [data-pace-aj-plegada] .pace-aj-sec-accion');
  await abrirDatos.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-pace-aj-volver]')).toBeVisible();
  expect(await quienTieneElFoco(page), 'al abrir «Tus datos» el foco cayó fuera').toBe('button:volver');

  await page.keyboard.press('Enter');
  await expect(abrirDatos).toBeVisible();
  expect(await quienTieneElFoco(page), 'al volver de «Tus datos» el foco cayó fuera').toMatch(/^button:Copias/);
});