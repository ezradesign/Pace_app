# Estética de la web (landing + /premium + /beta) · dónde me quedo

10 nov. 2026. **Publicada para Ez:** https://claude.ai/artifact/6DsS35xJXsmcZrdtZiXhoL (cuenta de esta
sesión; desde la otra, abrir `index.html` de esta carpeta, que lleva sus fotos). Nada de `landing/`,
`premium/` ni `beta/` está tocado: la landing B sigue lista para juntar en 39e7476e.

## Hecho

- Los defectos de hoy, medidos y recortados (nueve, con foto).
- **A · Cuaderno de campo** (la recomendada), pintada en las tres páginas, a 360 y 1280, es/en,
  claro/oscuro: `dir-a.css` y los dos retoques de marcado de `maqueta.js` (la portada de /beta en dos
  grupos; la pantalla de la app de /premium rehecha por idioma y tema, en `capturas/`).
  Peso: 3,2 KB comprimido; el primer pintado de la landing no cambia (80-92 ms en las tres pasadas,
  dentro del ruido; mediana de 7).
- **C · Pulido sobrio**, pintada igual (`dir-c.css`, 2,0 KB comprimido) y en la página.
  Ningún color de texto nuevo: todo sale de los tokens que ya usan las páginas.
- La página para Ez con el visor (dirección, página, idioma, tema, móvil y ordenador) y cinco letras.

## Lo que falta

1. **B · Una jornada**: escribir `dir-b.css` (la idea está en su tarjeta de `pagina.js`; el retoque de
   la portada de /beta ya vale para la B en `maqueta.js`) y fotografiarla:
   `node docs/proposals/web-estetica-9nov/maqueta.js --dirs=b --idiomas=es,en --temas=claro,oscuro`
   Después `recortes.js --dist=<la misma carpeta>` (rehace `pesos.json`) y `pagina.js`, y republicar
   la misma página (mismo `index.html`, con `root` en esta carpeta y las fotos nuevas en `files`).
   En `pagina.js`, rellenar `arregla` y `cambia` de la B.
2. Al montar la que elija Ez: pasar el CSS de la dirección a `landing/landing.css` y a los `<style>` de
   `premium/index.html` y `beta/index.html` (sin los prefijos `html body main.marco` de la maqueta),
   los dibujos de los módulos como en `maqueta.glifos.js`, y los dos retoques de marcado al HTML.
   Las 17 pruebas de `landing-cara` y las de `premium-pagina` y `beta-pagina` tienen que seguir en verde.
