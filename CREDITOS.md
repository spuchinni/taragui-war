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
| drive_0 (tanque en marcha) | Freesound #329800: greatmganga, "t26_moving_01.wav" | CC0 | ✅ (verificado por Sebastián, 19/11/2026) |
| static_0, squelch_0 (radio) | Freesound #524204 / #524205: JovianSounds, "Radio Static" y "Radio Sign Off / Squelch" | CC0 | ✅ (verificado 19/11/2026) |
| metal_0/1 (impacto en el blindaje) | Freesound #264889 / #267284: EpicWizard, "Metal Shed Door" | CC0 | ✅ (verificado 19/11/2026) |
| ric_0 / ric_1 (rebote) | Freesound #148840 / #148827: cedarstudios, "ricochet.mp3" / ".22 ricochet.mp3" | CC0 | ✅ (verificado 19/11/2026) |
| thump_0–3 (cañonazos lejanos de la artillería) | Freesound #517747 danlucaz, #879283 qvantor, #320788 kostrava ("distant explosion(s)") | CC0 | ✅ (verificado 19/11/2026) |
| prop_0 (avioneta, bucle de 3,7 s) | Freesound #648720: itinerantmonk108, "bi-plane flyby" | CC0 | ✅ (verificado 19/11/2026; también se probaron #431206 oscaraudiogeek y #251971 clif_creates) |
| jettaxi_0 / jetroar_0 / jetfar_0 (aviones de línea del aeropuerto: rodaje, plena potencia de cerca y despegue lejano, bucles de 6–7 s) | Freesound #843280 joeffl "Airport, Exterior, Orlando International (MCO)", #436511 Sonicwave32 "Airbus A330 takeoff", #251973 clif_creates "Takeoff 1 (Distant)" | CC0 | ✅ (verificado en Freesound, 22/11/2026) |
| m2quad_0 / m2tail_0 (ráfaga de las 4 M2 del M16 MGMC armada con los tiros de una .50 real, y el eco al soltar) | Freesound #160355 qubodup "Air Defense Artillery Avenger Training .50cal" | CC0 | ✅ (verificado en Freesound, 22/11/2026) |
| mgburst_0, mgshot_0, siren_0, flyover_0 | Pixabay (freesound_community) | Licencia de contenido de Pixabay (uso comercial permitido dentro del juego; no se puede revender el sonido suelto) | ✅ |
| fighter_0 (aviones de apoyo de la 2ª Guerra: tramo a plena potencia en bucle de 3,15 s) | Pixabay: "Sound Effect WW2 Fighter Plane Takeoff" de scottishperson (n.º 333260) | Licencia de contenido de Pixabay | ✅ |
| menu_0 (tema del menú, 12,3 s del medio en bucle) | Pixabay: "Military War" de mfcc (n.º 620908) | Licencia de contenido de Pixabay | ✅ |
| smg_0 (subfusil Sterling), hatcho_0 / hatchc_0 (escotilla), pass_0 (tanque que pasa), mag_0 / magshot_0 (MAG del TAM: grabación de una M240B), tool_0 / chain_0 (herramientas del mecánico: clavadora y cadenas), truck_0 (motor de las semiorugas: grabación de un camión grúa) | GFXSounds (cuenta gratis) | Licencia estándar de GFXSounds: uso permitido con crédito y link a https://gfxsounds.com; no se pueden repartir los sonidos sueltos | ✅ (crédito en el juego: Ajustes → Créditos) |
| video/intro.mp4 e intro-en.mp4 (música) | Pixabay: "War Horn and Drums" de soundmarker33 (n.º 512545) | Licencia de contenido de Pixabay | ✅ |
| plane_0, ric_2/3, shellin_0–3, bombw_0, nukew_0, nukeb_0, gau8_0 | **Hechos por código** para el juego (`herramientas/sonidos/sintetizar.py`, ruido y osciladores) | Propios | ✅ |
| infamb_0, intro_0 | Mezcla hecha por código con las grabaciones CC0 de qubodup + ráfagas y viento sintéticos | Propios + CC0 | ✅ |

Hasta noviembre de 2026 varios de esos eran grabaciones de Freesound/Pixabay (greatmganga, JovianSounds, PWLPL, TommyLynn,
EpicWizard, cedarstudios y otros) cuya licencia no se pudo confirmar; se reemplazaron para poder publicar y cobrar sin dudas. El 19/11/2026 Sebastián confirmó en Freesound que greatmganga, JovianSounds, EpicWizard y cedarstudios son CC0 y esas grabaciones volvieron (el ric_1 que había en el repo estaba roto; Sebastián pasó el original). La avioneta y los cañonazos lejanos pasaron a grabaciones CC0 nuevas que eligió él (thump_0–3, prop_0).
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
