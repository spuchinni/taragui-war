#!/bin/sh
# Marca una versión nueva del juego antes de subir a GitHub (correr desde la carpeta del repo: sh version.sh).
# GitHub Pages deja que el navegador guarde cada archivo 10 minutos: con ?v=<versión> en cada script y estilo,
# el navegador nunca mezcla archivos viejos y nuevos, y version.json avisa a quien tiene el juego abierto que hay una nueva.
V=$(date +%Y%m%d-%H%M)
sed -i -E "s#(src|href)=\"((js|css)/[^\"?]+)(\?v=[^\"]*)?\"#\1=\"\2?v=$V\"#g; s#window\.GAME_V='[^']*'#window.GAME_V='$V'#" index.html
printf '{"v":"%s"}\n' "$V" > version.json
echo "Versión $V"
