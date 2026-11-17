# Créditos y licencias de terceros

Lo que el juego usa y no hizo su autor. Todo lo de esta lista permite uso comercial. En el juego: Ajustes → Créditos (`js/creditos.js`).

## Bibliotecas
| Qué | Uso | Licencia | ¿Uso comercial? |
|---|---|---|---|
| three.js r128 (cdnjs) | motor 3D | MIT | Sí |
| PeerJS (unpkg) | partidas online P2P | MIT | Sí |
| Firebase (gstatic) | cuentas y salas | Términos de Google Firebase | Sí |
| Saira Condensed (Google Fonts) | tipografía | SIL Open Font License | Sí |
| SDK de CrazyGames | solo en el paquete de CrazyGames | Términos de CrazyGames | Sí, dentro de CrazyGames |

## Sonidos (`snd/`)
Recortados y comprimidos para el juego.

| Archivo | Origen | Licencia | Estado |
|---|---|---|---|
| cannon_0/1, expl_0, idle_0, turret_0, sboom_0 | Freesound, qubodup | CC0 / dominio público | ✅ |
| mgburst_0, mgshot_0, siren_0, flyover_0 | Pixabay (freesound_community) | Licencia de contenido de Pixabay (uso comercial permitido dentro del juego; no se puede revender el sonido suelto) | ✅ |
| menu_0 (tema del menú, 12,3 s del medio en bucle) | Pixabay: "Military War" de mfcc (n.º 620908) | Licencia de contenido de Pixabay | ✅ |
| smg_0 (subfusil Sterling), hatcho_0 / hatchc_0 (escotilla), pass_0 (tanque que pasa) | GFXSounds (cuenta gratis) | Licencia estándar de GFXSounds: uso permitido con crédito y link a https://gfxsounds.com; no se pueden repartir los sonidos sueltos | ✅ (crédito en el juego: Ajustes → Créditos) |
| video/intro.mp4 e intro-en.mp4 (música) | Pixabay: "War Horn and Drums" de soundmarker33 (n.º 512545) | Licencia de contenido de Pixabay | ✅ |
| drive_0, static_0, squelch_0, prop_0, plane_0, thump_0/1, metal_0/1, ric_0/1, shellin_0–3, bombw_0, nukew_0, nukeb_0, gau8_0 | **Hechos por código** para el juego (`herramientas/sonidos/sintetizar.py`, ruido y osciladores) | Propios | ✅ |
| infamb_0, intro_0 | Mezcla hecha por código con las grabaciones CC0 de qubodup + ráfagas y viento sintéticos | Propios + CC0 | ✅ |

Antes (hasta noviembre de 2026) varios de esos eran grabaciones de Freesound/Pixabay (greatmganga, JovianSounds, PWLPL, TommyLynn,
EpicWizard, cedarstudios y otros) cuya licencia no se pudo confirmar; se reemplazaron para poder publicar y cobrar sin dudas.
Si se agrega un sonido nuevo, anotarlo acá con su página y licencia (solo CC0 o licencias que permitan uso comercial).

## Voces de radio (`voz/`)
Generadas con **TTSMaker** (es, en-gb, en-us, de, ru; 14 frases por idioma). ✅ El sitio oficial (ttsmaker.com) dice que el audio generado se puede usar
comercialmente gratis y que el usuario tiene todos los derechos de uso. Guardar una captura de esa página por si cambian la política.

Voz de radio en castellano (`voz/radio/`: coordenadas, números, "¡Fuego!", Alfa/Bravo/Charlie, capturamos, perdimos, bombarderos en camino): grabada por Sebastián Puchinni, autor del juego. ✅ Propia.

## Imágenes
- `img/portada-nueva.jpg` y el logo: ilustración del autor hecha con herramientas de IA (Gemini / ChatGPT). Se pueden usar; la protección legal de imágenes hechas con IA todavía no está clara.
- Texturas del suelo y del acero: hechas por código (`herramientas/suelo/`).
- Mapas reales de Corrientes: datos de © colaboradores de OpenStreetMap (ODbL, **pide mencionarlo**: el juego muestra "© colaboradores de OpenStreetMap" junto al minimapa en esos mapas y en Ajustes → Créditos) y relieve de las teselas Terrarium (Mapzen/AWS, datos públicos).

## Datos históricos
Medidas y datos de los tanques: Tank Encyclopedia y manuales de época (los datos no tienen derechos; no se copian textos ni imágenes).


## Modelos 3D de personas
- **Ultimate Modular Men Pack** y **Ultimate Modular Women Pack**, de Quaternius (https://quaternius.com) — licencia **CC0 1.0** (dominio público). Convertidos para el juego en `modelos/gente.json` (civiles detallados).
