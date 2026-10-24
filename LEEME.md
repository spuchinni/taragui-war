# Taragüí War: Frente de Acero

Juego de tanques en el navegador. Se juega en https://spuchinni.github.io/taragui-war/

## Versión 2: por épocas, desde la Primera Guerra Mundial

- **index.html**: el juego nuevo (arranca en 1916).
- **v1/**: la versión anterior completa, tal cual (Guerra Fría y mapas de Corrientes). Se juega en `/v1/` y guarda su progreso aparte.
- **css/juego.css**: estilos.
- **js/nucleo/**: el motor de la versión 1, separado por partes (escena, mapas, tanques, combate, infantería, IA, jugador, partida, menús, online). Se reutiliza tal cual con algunos ajustes para las épocas.
- **js/eras/**: lo nuevo.
  - `eras.js`: las épocas y sus reglas (apoyos, armas de la infantería, bandos históricos).
  - `gm1-datos.js`: naciones y tanques de la Primera Guerra (Reino Unido, Francia, Imperio alemán y EE. UU.) y los cañones de campaña.
  - `gm1-modelos.js`: los modelos hechos por código (Mark I/IV/V, Whippet, Renault FT, Schneider, Saint-Chamond, A7V, LK II, cañones) y los cascos de época.
  - `gm1-mapas.js`: el generador de frentes de trincheras (Somme, Cambrai, Villers-Bretonneux, Saint-Mihiel).
  - `campana.js`: la campaña histórica, el mapa de Berry-au-Bac y el selector de épocas.
- **js/salas.js**, **js/relevo.js**: batallas siempre online (ver abajo).
- **js/miniaturas.js**: miniaturas de los tanques y ficha técnica en la pantalla de Vehículos.
- **video/intro.mp4**: la intro.
- **snd/**, **voz/**, **img/**: sonidos, voces de radio y portada (compartidos por las dos versiones).

## Épocas

| Época | Estado |
|---|---|
| 1916–1918 · Primera Guerra Mundial | Lista (árbol + campaña de 6 misiones) |
| 1919–1938 · Entreguerras | Próximamente |
| 1939–1945 · Segunda Guerra Mundial | Próximamente |
| 1946–1959 · Posguerra y Corea | Próximamente |
| 1960–hoy · Guerra Fría y actualidad | Los tanques y mapas de la versión 1 |

Una época se abre al terminar su capítulo de campaña o al investigar todos los tanques de una nación de la época anterior.

## Batallas online

"¡A la batalla!" siempre es online. El juego busca una partida de tu época con BR parecido (±1.0) que tenga lugar:
si hay, te avisa y elegís unirte (tomás el lugar de un bot, en el bando con menos jugadores) o empezar una nueva;
si no hay, tu PC arma una con bots y los que lleguen se van sumando. Si el anfitrión se va, otro jugador sigue la partida.
Sin conexión se juega igual, con bots.

Las partidas abiertas se anuncian en Firestore (colección `salas`). **Hay que pegar `firestore.rules` en la consola de Firebase**
(Firestore Database → Reglas → reemplazar todo → Publicar); sin eso nadie encuentra las partidas de los demás y cada uno juega con bots.
