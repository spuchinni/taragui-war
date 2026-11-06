# Publicar en CrazyGames

1. Armar el paquete (desde la carpeta del repo):
   `python herramientas/crazygames/armar.py` → `dist/taragui-war-crazygames.zip`
2. Crear la cuenta de desarrollador en https://developer.crazygames.com y ir a **Submit game**.
3. Tipo **HTML5**, subir el zip. Completar:
   - Nombre: TaraWar: Steel Front ("Taragüí" es una marca de yerba: en CrazyGames va TaraWar)
   - Descripción y controles (W/S/A/D manejar, mouse apuntar, clic izquierdo cañón, clic derecho zoom, Mayús mira del artillero, Espacio ametralladora, F artillería, G bombardeo).
   - Orientación: horizontal. Marcar que funciona en celular.
   - Portadas: 1920×1080, 800×470, 800×800 y 800×1200 → usar las de `portadas-juego/` (toma del juego con el logo; la
     ilustración con jets y la bomba no mostraba el juego y fue uno de los motivos del rechazo). `node armar.js` las rehace.
     Y un video corto del juego.
4. Arranca en **Basic Launch**: sin anuncios ni ganancias, miden si a la gente le gusta (tiempo de juego, cuántos vuelven).
   Si va bien pasa a **Full Launch** y ahí se reparte la publicidad. Recién entonces volver a armar con
   `python herramientas/crazygames/armar.py --premio` (activa el botón "📺 Mirá un anuncio" del resumen) y subir la versión nueva.

## Qué cambia en el juego dentro de CrazyGames (js/crazy.js)
- Arranca **en inglés** (requisito de CrazyGames; js/idioma.js). Se puede pasar a español desde Ajustes o el botón 🌐 del menú.
- Carga el SDK v3 y avisa cuándo empieza y termina la batalla (gameplayStart/Stop).
- Anuncio entre partidas al terminar cada batalla, con el sonido pausado (el SDK no deja más de uno cada 3 minutos).
- Sin inicio de sesión con Google o mail (CrazyGames no lo permite): el progreso queda en el navegador.
- Sin la portada "Hacé clic para empezar": el sitio ya tiene su botón de jugar.
- Festejo del sitio (happytime) al comprar un tanque nuevo.
- En GitHub Pages no cambia nada (js/plataforma.js dice 'web').

Probar en la PC: abrir el juego con `?plataforma=crazygames&premio=1` en localhost: el SDK muestra un cartel en vez de los anuncios.

## Segundo envío (después del rechazo del 5/11/2026: "la calidad no cumple las expectativas")
- El paquete dejaba el HUD a medias en español: `idioma.js` recorría la página antes de tener el diccionario (en el paquete
  todo va en un solo script al final del body). Arreglado: vuelve a recorrer cuando llega el diccionario.
- Primera partida: la cámara arranca horizontal (antes miraba al cielo), se ignora el salto falso del mouse al trabar el puntero,
  el giro por el borde es solo de costado y recién después de mover el mouse, HUD simple mientras dura el entrenador
  (`body.novato`) y los dos bandos salen a ~350 m (antes ~1 km: más de un minuto sin ver a nadie).
- Portadas nuevas con el juego de verdad en `portadas-juego/`.

## Revisión contra los requisitos (6/11/2026, antes del segundo envío) — en js/crazy.js
- **Sin pantalla completa propia** (CrazyGames la prohíbe): se esconde `#fsBtn` y la opción de Ajustes, se saca la acción de la tecla P y `enterFS`/`toggleFS` no hacen nada.
- **PEGI 12**: sin sangre (`bloodMat` invisible) ni desmembramientos (blast/crush → caída normal); civiles y animales no mueren, se asustan y huyen; sin "Civil abatido".
- **Idioma por el locale del SDK** (`user.systemInfo.locale`, si no, inglés): `idioma.js` arranca con el idioma del navegador y `cgLocale` corrige con el del SDK (recarga una vez y guarda `tw2_lang`). En localhost el SDK dice `en-US`, así que siempre pasa a inglés.
