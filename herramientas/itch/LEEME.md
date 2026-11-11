# TaraWar en itch.io (semana 4: salir al mundo)

El juego **no se copia** a itch.io: el zip tiene un solo `index.html` que muestra adentro la versión publicada en GitHub Pages.
Así, cada vez que se sube algo a `main`, itch.io ya tiene la última versión sin volver a subir nada.

## Armar el zip

```bash
sh herramientas/itch/armar.sh
```

Deja `dist/tarawar-itch.zip` (no se sube al repo).

## Crear la página (una sola vez)

1. Entrar a itch.io → **Upload new project**.
2. **Title**: `TaraWar: Frente de Acero` · **Project URL**: `tarawar`.
3. **Short description**: la frase corta de abajo.
4. **Classification**: Games · **Kind of project**: **HTML**.
5. **Release status**: In development · **Pricing**: **No payments** (o "Donate" si querés que dejen algo; el Cafecito va en la descripción).
6. **Uploads**: subir `dist/tarawar-itch.zip` y tildar **"This file will be played in the browser"**.
7. **Embed options**:
   - Viewport: **1280 × 720**, tildar **Mobile friendly** (orientación horizontal), **Fullscreen button** y **Automatically start on page load** destildado (mejor con clic).
   - **No** tildar "SharedArrayBuffer support" (agrega cabeceras que pueden romper fuentes y Firebase).
8. **Cover image**: `herramientas/itch/portada-630x500.jpg` (para la página en inglés, `portada-en-630x500.jpg`).
9. **Screenshots**: las de `herramientas/itch/capturas/`.
10. **Genre**: Simulation (o Action) · **Tags** (de a una): `tanks`, `ww2`, `world-war-ii`, `3d`, `multiplayer`, `browser`, `military`, `historical`, `argentina`, `free`.
11. **Description**: el texto largo de abajo (los dos idiomas, primero castellano).
12. **Community**: Comments (para que dejen opiniones ahí también).
13. **Visibility**: primero **Draft** para probar; cuando ande, **Public**.

Probar en la página: que cargue, que el mouse quede trabado al jugar (clic en el juego), la pantalla completa (botón de itch.io o el ⛶ del juego) y desde el celular.

## Textos

### Frase corta (Short description)
Tanques de la 2ª Guerra en el navegador, con los blindados argentinos: del Nahuel al TAM. Gratis, sin instalar, online.

*(EN)* WW2 tank battles in your browser, featuring Argentine armor from the Nahuel to the TAM. Free, no install, online.

### Descripción (castellano)
**TaraWar: Frente de Acero** es un juego de tanques en 3D que se juega en el navegador, gratis y sin instalar nada. Está hecho en Corrientes, Argentina.

- **La 2ª Guerra como puerta de entrada**: Sherman, T-34, Panzer IV, Tiger, Panther, IS-2, Churchill y más, cada uno con su blindaje, cañón, velocidad y mira de época.
- **Los blindados argentinos**: el **Nahuel DL-43**, el primer tanque hecho en la Argentina (1943), con su historia y tres desafíos basados en hechos reales: el desfile del 9 de Julio de 1944, la marcha a San Miguel y la prueba de tiro de 1947.
- **Mapas históricos**: Villers-Bocage, Prokhorovka, El Alamein, Bastogne, Stalingrado, Berlín, Kasserine y Montecassino.
- **Campaña** con 8 misiones de los dos lados.
- **Online**: se busca partida sola; si no hay nadie, arrancás con bots y los que entran los reemplazan.
- **Daño realista**: blindaje por zonas, orugas, motor y cañón que se rompen, reparación con la tripulación, artillería y bombardeo.
- **Para todos**: entrenamiento corto al principio, dificultad ajustable y versión para celular.

Se juega con teclado y mouse (W A S D para moverte, mouse para apuntar, clic para disparar) o con la pantalla táctil.

¿Encontraste un error o tenés una idea? Usá el botón **💬 Dar opinión** del juego o dejá un comentario acá.

### Description (English)
**TaraWar: Steel Front** is a free 3D tank game you play in your browser — no download, no install. Made in Corrientes, Argentina.

- **World War II tanks**: Sherman, T-34, Panzer IV, Tiger, Panther, IS-2, Churchill and more, each with period armor, gun, speed and sights.
- **Argentine armor**: the **Nahuel DL-43**, the first tank built in Argentina (1943), with its history and three challenges based on real events.
- **Historical maps**: Villers-Bocage, Prokhorovka, El Alamein, Bastogne, Stalingrad, Berlin, Kasserine and Monte Cassino.
- **Campaign** with 8 missions from both sides.
- **Online**: automatic matchmaking; if nobody is around you start with bots and players replace them as they join.
- **Realistic damage**: armor zones, tracks, engine and gun that break, crew repairs, artillery and air strikes.
- **Easy to start**: short training, adjustable difficulty and a mobile version.

Controls: W A S D to drive, mouse to aim, click to fire (touch controls on phones).

Found a bug or have an idea? Use the **💬 Give feedback** button in the game or leave a comment here.

## Para difundir (después de publicar)

### Discord (servidor propio)
Canales sugeridos: `#anuncios`, `#novedades` (pegar las líneas de 📰 Novedades), `#buscar-partida`, `#errores`, `#ideas`, `#capturas`.
Mensaje de bienvenida:
> ¡Bienvenido al cuartel de TaraWar! Juego de tanques gratis en el navegador, hecho en Corrientes. Jugá en <link de itch.io>. Avisá en #buscar-partida cuando entres así se arma una batalla online.

### Reddit
- Dónde: r/WWIIgames, r/tanks, r/WebGames, r/IndieGaming, r/playmygame, r/argentina (los viernes, con la etiqueta que corresponda). Leer las reglas de cada uno antes; en varios hay que ser el autor y responder comentarios.
- Título: *I'm making a free WW2 tank game that runs in the browser, featuring Argentina's first tank (Nahuel DL-43)*
- Cuerpo:
> Hi! I'm a solo dev from Corrientes, Argentina. TaraWar is a free 3D tank game that runs in the browser (no install), with WW2 tanks and Argentine armor. The Nahuel DL-43 was the first tank designed and built in Argentina (1943); the game has a short history page and three challenges based on its real trials.
> Play: <link>
> Feedback very welcome — there's a feedback button in the game.

### Grupos (Facebook, WhatsApp)
> Hice un juego de tanques gratis que se juega en el navegador, con los blindados argentinos: arranca en la 2ª Guerra y tiene al Nahuel DL-43, el primer tanque argentino, con su historia y desafíos. Está hecho en Corrientes. Se juega acá: <link>. Si lo prueban, ¡díganme qué les pareció!

Fuentes de lo que se dice del Nahuel: ver `js/nahuel.js` (Tank Encyclopedia y Sigal Fogliani, *Nahuel DL 43*, Dunken 2004).
