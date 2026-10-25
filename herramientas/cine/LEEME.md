# Cine: la intro filmada con el motor del juego

1. Servir el repo: `python3 -m http.server 8766` (desde la raíz).
2. Filmar: `THREE_JS=/ruta/a/three.min.js node herramientas/cine/cam.js full` (three r128; `preview` saca solo 3 cuadros por toma). Deja los cuadros en `herramientas/cine/frames/` y los sonidos en `sonido.json`.
3. Armar: `python3 herramientas/cine/armar.py . <video_gemini_1.mp4> <video_gemini_2.mp4>` → `video/intro.mp4`.

Las tomas se definen en `tomas.js` (protagonista + movimiento de cámara). `frames/`, `tmp/` y `sonido.json` no se suben.
