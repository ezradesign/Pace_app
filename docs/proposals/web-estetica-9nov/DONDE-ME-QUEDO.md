# Estética de la web (landing + /premium + /beta) · dónde me quedo

10 nov. 2026, tarde. **Terminada y publicada para Ez:** https://claude.ai/artifact/6DsS35xJXsmcZrdtZiXhoL
(versión 3, en la cuenta de esta sesión; desde la otra cuenta, abrir `index.html` de esta carpeta, que
lleva sus fotos). Nada de `landing/`, `premium/` ni `beta/` está tocado: la landing B sigue lista para
juntar en 39e7476e.

## Qué hay

- Los nueve defectos de hoy, medidos y con foto (`recortes.js`).
- Las tres direcciones, pintadas sobre el marcado real de las tres páginas, a 360 y 1280 px, es/en,
  claro/oscuro (`maqueta.js` con `dir-a.css`, `dir-b.css` y `dir-c.css`; 96 fotos en `fotos/`):
  **A · Cuaderno de campo** (la recomendada), **B · Una jornada** y **C · Pulido sobrio**.
- Peso de cada una (`pesos.json`): A 3,2 KB comprimido, B 3,5 y C 2,0. La landing sigue saliendo en
  menos de 0,12 s con cualquiera (siete pasadas; las diferencias son ruido). Ningún color de texto nuevo.
- Cinco letras para Ez al final de la página.

## Rehacer las fotos

Desde la raíz del repo, con `index.html` compilado:
`node docs/proposals/web-estetica-9nov/maqueta.js --dirs=hoy,a,b,c --idiomas=es,en --temas=claro,oscuro`,
después `node docs/proposals/web-estetica-9nov/recortes.js --dist=<la carpeta de dist que usó>` y
`node docs/proposals/web-estetica-9nov/pagina.js`.

## Montada: la B (Ez, 10 nov.)

En 769ea1b8: el CSS de la B en `landing/landing.css` y en los `<style>` de `premium/index.html` y
`beta/index.html`; la portada de /beta en dos grupos (`.cabeza`); la pantalla de la app de /premium por
idioma y tema (`premium/app-*-{es,en}-{claro,oscuro}.webp`, de `capturas-app.js`); y las letras 3, 4 y 5
recomendadas. **Falta la 2**: rehacer en oscuro las capturas de /beta y de PACE completo con su marco.
Las fotos de lo montado son `fotos/montada-*`; `comparar.js` las cruza con las de la maqueta de la B.
