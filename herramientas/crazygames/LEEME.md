# Publicar en CrazyGames

1. Armar el paquete (desde la carpeta del repo):
   `python herramientas/crazygames/armar.py` → `dist/taragui-war-crazygames.zip`
2. Crear la cuenta de desarrollador en https://developer.crazygames.com y ir a **Submit game**.
3. Tipo **HTML5**, subir el zip. Completar:
   - Nombre: Taragüí War: Frente de Acero
   - Descripción y controles (W/S/A/D manejar, mouse apuntar, clic izquierdo cañón, clic derecho zoom, Mayús mira del artillero, Espacio ametralladora, F artillería, G bombardeo).
   - Orientación: horizontal. Marcar que funciona en celular.
   - Portadas: 1920×1080, 800×470 y 800×1200 (se pueden sacar de `img/portada-nueva.jpg`), y un video corto del juego.
4. Arranca en **Basic Launch**: sin anuncios ni ganancias, miden si a la gente le gusta (tiempo de juego, cuántos vuelven).
   Si va bien pasa a **Full Launch** y ahí se reparte la publicidad. Recién entonces volver a armar con
   `python herramientas/crazygames/armar.py --premio` (activa el botón "📺 Mirá un anuncio" del resumen) y subir la versión nueva.

## Qué cambia en el juego dentro de CrazyGames (js/crazy.js)
- Carga el SDK v3 y avisa cuándo empieza y termina la batalla (gameplayStart/Stop).
- Anuncio entre partidas al terminar cada batalla, con el sonido pausado (el SDK no deja más de uno cada 3 minutos).
- Sin inicio de sesión con Google o mail (CrazyGames no lo permite): el progreso queda en el navegador.
- Sin la portada "Hacé clic para empezar": el sitio ya tiene su botón de jugar.
- Festejo del sitio (happytime) al comprar un tanque nuevo.
- En GitHub Pages no cambia nada (js/plataforma.js dice 'web').

Probar en la PC: abrir el juego con `?plataforma=crazygames&premio=1` en localhost: el SDK muestra un cartel en vez de los anuncios.
