#!/bin/sh
# Arma el zip para subir a itch.io (HTML): solo un index.html que muestra el juego publicado en GitHub Pages.
cd "$(dirname "$0")" && mkdir -p ../../dist && rm -f ../../dist/tarawar-itch.zip && (cd paquete && zip -q ../../../dist/tarawar-itch.zip index.html) && echo "listo: dist/tarawar-itch.zip"
