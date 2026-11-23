#!/bin/sh
# Fotografía cada opción de la página con su maqueta encima (desde la raíz del repo).
M=docs/proposals/sidebar-23nov/maquetas
C=docs/proposals/sidebar-23nov/banco/fotos.config.js
export PACE_E2E_PORT=${PACE_E2E_PORT:-9001}
foto() { env "$@" npx playwright test -c $C fotos --workers=2 >/dev/null 2>&1 && echo "ok $1" || echo "FALLA $*"; }
foto FOTOS_NOMBRE=1a FOTOS_JS=$M/1a-suelo.js FOTOS_SOLO=jornada,libre FOTOS_LANGS=es FOTOS_PALS=crema FOTOS_VPS=1274x579,1092x496
foto FOTOS_NOMBRE=1b FOTOS_CSS=$M/1b-recoge.css FOTOS_JS=$M/1a-suelo.js FOTOS_SOLO=jornada,libre FOTOS_LANGS=es FOTOS_PALS=crema FOTOS_VPS=1274x579,1092x496
foto FOTOS_NOMBRE=2a FOTOS_JS=$M/2a-deshacer.js FOTOS_SOLO=libre FOTOS_LANGS=es,en FOTOS_PALS=crema,oscuro FOTOS_VPS=1280x720,360x640
foto FOTOS_NOMBRE=2b FOTOS_JS=$M/2b-menos.js FOTOS_SOLO=libre FOTOS_LANGS=es,en FOTOS_PALS=crema,oscuro FOTOS_VPS=1280x720,360x640
foto FOTOS_NOMBRE=3b FOTOS_CSS=$M/3b-una-linea.css FOTOS_JS=$M/3-sin-logro.js FOTOS_SOLO=libre,primer FOTOS_LANGS=es FOTOS_PALS=crema FOTOS_VPS=1280x720,360x640
foto FOTOS_NOMBRE=3c FOTOS_JS=$M/3c-fuera.js FOTOS_SOLO=libre FOTOS_LANGS=es FOTOS_PALS=crema FOTOS_VPS=1280x720,360x640
foto FOTOS_NOMBRE=4b FOTOS_JS=$M/4b-seguidos.js FOTOS_SOLO=libre FOTOS_LANGS=es,en FOTOS_PALS=crema FOTOS_VPS=1280x720,360x640
foto FOTOS_NOMBRE=4c FOTOS_JS=$M/4c-racha.js FOTOS_SOLO=libre FOTOS_LANGS=es,en FOTOS_PALS=crema FOTOS_VPS=1280x720,360x640
