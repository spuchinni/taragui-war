# Taragüí War: Frente de Acero — contexto para Claude

Juego de tanques 3D en el navegador, estilo War Thunder, que Sebastián (Corrientes, Argentina) desarrolla con Claude.
Publicado en GitHub Pages: https://spuchinni.github.io/taragui-war/ (repo `spuchinni/taragui-war`, rama `main`).
Hablar siempre en español rioplatense (vos), respuestas concretas y breves.

## Estructura (versión 2)
- `index.html` → juego nuevo por épocas (arranca en 1916). Carga three.js r128 desde cdnjs y los scripts de `js/` en orden.
- `v1/` → versión anterior completa (Guerra Fría + mapas de Corrientes). No tocar salvo pedido. Guarda progreso en `tw_progress`; la v2 usa `tw2_progress`.
- `css/juego.css` → estilos.
- `js/nucleo/00..16-*.js` → motor de la v1 separado en partes (escena, mapas, mundo, audio, efectos, tanques, progresión, combate, apoyos, personas, IA, jugador, partida, menús, online). Scripts clásicos, todo en el ámbito global (no son módulos ES): el orden de carga en `index.html` importa.
- `js/eras/` → lo nuevo:
  - `eras.js`: épocas (`ERAS`), reglas por época (`RULE()`: apoyos, armas de infantería, bandos históricos), nombres/uniformes/cascos por época (`NAT_ERA`, `applyEraNations`).
  - `gm1-datos.js`: tanques de la 1ª Guerra (UK, Francia, Imperio alemán, EE. UU.) + cañones de campaña (`static:1`, solo IA). Velocidades reales ×1,4.
  - `gm1-modelos.js`: modelos hechos por código (`buildWW1`): Mark I/IV/V con barbetas (`sponsonAim`), Whippet, Renault FT, Schneider, Saint-Chamond, A7V, LK II, cañones; cascos Brodie/Adrian/Stahlhelm.
  - `gm1-mapas.js`: generador de frentes de trincheras con semilla fija (Somme, Cambrai, Villers-Bretonneux, Saint-Mihiel): trincheras en zigzag que los tanques largos cruzan (`W.trench`, `curSpan`), alambradas (`W.wire`), embudos, pueblos en ruinas.
  - `campana.js`: campaña histórica (`CAMPAIGN`, 6 misiones 1916–1918 + mapa Berry-au-Bac), selector de épocas del hangar/árbol.
- `snd/`, `voz/`, `img/` → sonidos CC0, voces de radio por idioma (es, en-gb, en-us, de, ru) y portada. Compartidos por v1 y v2.

## Épocas
1 = 1ª Guerra (lista) · 2 Entreguerras · 3 2ª Guerra · 4 Posguerra/Corea (próximamente) · 5 = Guerra Fría (tanques y mapas de la v1).
Una época se abre al terminar su capítulo de campaña o al investigar todo el árbol de una nación de la época anterior.
Cada vehículo y mapa tiene `era`; garaje por nación y época (`garRef`).

## Decisiones de diseño (pedidas por Sebastián)
- Rehacer "a foja cero" en orden cronológico desde la 1ª Guerra, con campaña histórica + árbol por épocas y naciones históricas de cada época; conservar la v1 y reutilizar sus recursos.
- Modelos hechos por código (no modelos 3D descargados). Personas con sexo definido; vehículos y edificios menos cuadrados.
- Prioridad: que corra bien en una PC común (cuidar triángulos y llamadas de dibujo; instanciar).
- Menús estilo War Thunder sin scroll: hangar con tanque 3D, árbol aparte, ⚙ para sensibilidad y teclas. Intro de mapa antes de cada partida. HUD estilo War Thunder.
- Niveles por tanque según experiencia; el tutorial se adapta al tanque y suma prácticas al subir de nivel.
- Daño realista: blindaje por zonas, orugas que aguantan mucho la ametralladora, cañón que se daña, reparación con un tripulante afuera y ayuda de ingenieros, hundirse en agua profunda.
- Sonido: grabaciones reales CC0 (Freesound); voces de radio TTS en el idioma de cada nación con efecto de radio.
- Online P2P (PeerJS/WebRTC) con su PC de anfitrión; sus amigos tienen que poder jugar sin tener Claude.
- Modo especial ficticio Corrientes vs. Resistencia (época 5).
- Mapas urbanos de Corrientes a partir de capturas satelitales que él pasa.

## Pendientes / ideas
- Épocas 2, 3 y 4 (Entreguerras, 2ª Guerra con el Nahuel argentino, Posguerra/Corea) con sus tanques, mapas y capítulos de campaña.
- Probar rendimiento real de los mapas de trincheras en su PC.
- Voces en francés (los franceses usan las de español).

## Cómo trabajar
- Probar en Chromium headless (Playwright) antes de entregar: sin errores de consola, partida y misión completas.
- Commits en español; subir a `main` (GitHub Pages publica desde ahí) salvo que pida otra cosa.
