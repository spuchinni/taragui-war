// Novedades (documento de diseño: "cada semana cierra con 3 líneas de qué cambió"). Va después de diario.js.
// Botón 📰 Novedades en el menú principal con un puntito mientras haya una novedad sin ver (tw2_nov = id de la última vista).
// Para sumar una semana: agregar una entrada ARRIBA de todo en NOV (id nuevo, fecha y las líneas en los dos idiomas).
// También pone el lema del juego en la portada del menú. Textos en los dos idiomas acá mismo (data-notr).
(function(){
  const EN=()=>window.LANG==='en';
  const LS=(k,v)=>{ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } };
  const NOV=[
    {id:'2026-11-19',fecha:'19/11/2026',
     es:['El mecánico que baja a reparar ahora suena: cadenas si arregla la oruga, herramientas si arregla el motor o el cañón.','B° Sor Asunta rehecho: casas de barrio con techo de chapa, de tejas o losa con parapeto, tanque de agua, antena, aire acondicionado y galería; frentes con tapial y reja, alambrado o muro, con portón.',
         'Postes de madera de la luz con cruceta, aisladores, transformador y farol de brazo que se prende de noche, cables con comba y acometidas a las casas; si se cae un poste, sus cables quedan en el suelo. Carteles con el nombre de las calles en las esquinas.',
         'Calles de tierra con huellas, charcos y cunetas; Las Margaritas de hormigón con juntas y cordón cuneta; veredas y entradas de autos.',
         'Vehículos nuevos en el tránsito de Corrientes: la Chevrolet C-10, el colectivo urbano con su cartel de línea y una moto clásica.',
         'Las casas de los mapas reales de Corrientes (Itatí, Laguna Brava, Paso de la Patria, el centro y los demás) también pasan a ser casas de barrio, con sus techos, tanques, rejas y cercos.',
         'Trincheras de la 1ª Guerra rehechas: parapeto de sacos terreros trabados, revestimiento de tablones y chapa acanalada, pasarelas de listones, cajones de munición, barriles y escaleras de asalto.',
         'Arreglado: las paredes de los edificios salían llenas de puntitos en algunas placas de video (en todos los mapas).'],
     en:['The mechanic who climbs out to repair now makes sound: chains when fixing the track, tools when fixing the engine or the gun.','Sor Asunta neighborhood rebuilt: houses with corrugated metal, tiled or flat roofs with parapets, water tanks, TV antennas, air conditioners and porches; front walls with railings, chain-link or brick, with gates.',
         'Wooden power poles with crossarms, insulators, transformers and street lights that turn on at night, sagging wires and service drops to the houses; if a pole falls, its wires drop to the ground. Street name signs on the corners.',
         'Dirt streets with tire ruts, puddles and ditches; Las Margaritas paved in concrete with joints and curbs; sidewalks and driveways.',
         'New vehicles in Corrientes traffic: the Chevrolet C-10 pickup, the city bus with its route sign and a classic motorcycle.',
         'Houses on the real Corrientes maps (Itatí, Laguna Brava, Paso de la Patria, downtown and the rest) also become neighborhood houses, with their roofs, water tanks, railings and fences.',
         'WWI trenches rebuilt: interlocking sandbag parapets, plank and corrugated iron revetments, duckboards, ammo crates, barrels and assault ladders.',
         'Fixed: building walls were covered in little dots on some graphics cards (on every map).']},
    {id:'2026-11-15',fecha:'15/11/2026',
     es:['La ametralladora MAG del TAM, TAM 2C, VCTP, SK-105 y Patagón suena con su grabación propia.','Grabaciones reales para los cañonazos lejanos de la artillería (4 distintos) y para la avioneta.','Vuelven las grabaciones reales del tanque en marcha (motor y orugas), la radio, el impacto en el blindaje y el rebote.','Sonidos nuevos: la escotilla cuando el mecánico baja a reparar y vuelve a subir, la ráfaga de los subfusiles (MP 40, PPSh, Thompson, Sten) y las orugas de los tanques que te pasan cerca.','Celular: el selector de tanques entra en la pantalla sin bajar, los carteles del entrenamiento son más chicos, el botón ☰ Menú (para abandonar) está siempre a mano y ya no se traba la 1ª batalla si cerrás el juego en el medio.','Puente General Belgrano rehecho: pilones en A de 84 m, obenques en abanico y defensas en el mapa del puente, y se ve de fondo desde la Costanera.','Intro nueva: un video de 41 s filmado con el juego, de la 1ª Guerra al TAM, el Puente General Belgrano y la nuke, con música de cuerno y tambores. Sale antes de la portada; desde la segunda vez se saltea con Esc.','Música nueva en el menú.',
         'Luces de freno en los tanques de la Guerra Fría y chirrido de los frenos al frenar (cada tanque con su tono).',
         'Manejo: frenos por tanque (la 1ª Guerra frena mal, la Guerra Fría con discos hidráulicos; los pesados frenan peor), soltar el acelerador deja rodar unos metros y la S frena; en marcha atrás la A lleva la cola a la izquierda, como un auto.',
         'Guerra Fría, segunda tanda: M1 Abrams, Leopard 2A4, Centurion, Chieftain, M113, M551 Sheridan, Scorpion, PT-76B, Marder 1A3, Ru 251, EE-9 Cascavel (con sus 6 ruedas y el bogie boomerang), Tiran-5Sh y el M3 Stuart paraguayo rehechos con el modelo detallado, comparados con modelos de Sketchfab.',
         'Guerra Fría: M60A1 y M60A3, Leopard 1A1, 1A5 y 1V, M41 uruguayo y T-62M rehechos con el modelo detallado (torre "nariz de aguja" del M60, faldones y manga térmica del Leopard, 90 mm Cockerill del M41UR, evacuador a un tercio del T-62).',
         'M10 Wolverine rehecho: torre abierta de verdad con los contrapesos "pico de pato", escudo grande del cañón de 3 pulgadas, la .50 atrás y los bulones del blindaje extra en el casco.',
         'Tripulación a la vista en las torres abiertas (M10, M18, M36 y los antiaéreos): apuntador, cargador y jefe; si cae uno, desaparece.',
         'Las ametralladoras de pivote se tiran desde afuera: en el Sherman, el IS-2, el TAM y otros, el tirador asoma de la escotilla mientras la usa. Y como está expuesto, lo pueden voltear la infantería, las ametralladoras y las esquirlas.',
         'Los soldados sostienen el arma de verdad: culata al hombro y codos doblados al apuntar, el arma cruzada al pecho al caminar y el lanzacohetes al hombro.',
         'Equipo con volumen: cantimplora con su vaso, pala en la funda, mochilas redondeadas y la marmita alemana.',
         'Vecinos sentados en los bancos de las plazas (leyendo o charlando) y grupitos conversando en las veredas; se levantan y escapan si se acerca un tanque o hay tiros.',
         'Mucho más fluido: cada tanque se dibuja en pocas piezas, como en War Thunder (las ruedas siguen girando y copiando los pozos), y cada soldado o civil en una sola pieza con huesos. En una batalla con humo y explosiones, menos de la mitad de trabajo para la placa de video.',
         'Con mucho humo en pantalla, el humo se dibuja a media resolución si en tu PC conviene (lo mide solo) y ahora se funde suave contra el suelo y las paredes.',
         'Más fluido en los combates: el humo, las explosiones, las esquirlas y las trazadoras se dibujan todos juntos (antes cada nube era un objeto aparte) y los cráteres ya no traban el cuadro. Se ve igual.',
         'Guerra Fría: ahora se puede pedir infantería (B): llega un M113 que baja la escuadra en el punto.',
         'Las animaciones de la artillería y del bombardeo salen en todos los mapas y épocas, también si entrás a la partida de otro.',
         'M10 Wolverine, segunda versión: escudo del cañón en cuña, contrapesos en pentágono atrás, la .50 bien alta en su pivote y el interior de la torre (recámara, munición, radio, mira, asientos).'],
     en:['The MAG machine gun on the TAM, TAM 2C, VCTP, SK-105 and Patagón has its own recording.','Real recordings for distant artillery fire (4 different ones) and the propeller plane.','The real recordings are back for the moving tank (engine and tracks), the radio, armor hits and ricochets.','New sounds: the hatch when the mechanic climbs out to repair and back in, submachine gun bursts (MP 40, PPSh, Thompson, Sten) and the tracks of tanks that pass close by.','Mobile: the tank picker fits on screen without scrolling, the training cards are smaller, the ☰ Menu button (to leave) is always at hand and the 1st battle no longer gets stuck if you close the game halfway.','General Belgrano Bridge rebuilt: 84 m A-shaped pylons, fan stay cables and pier fenders on the bridge map, and it shows in the distance from the Costanera.','New intro: a 41-second video filmed in the game, from WWI to the TAM, the General Belgrano Bridge and the nuke, with horn and drum music. It plays before the cover; from the second time on, Esc skips it.','New menu music.',
         'Brake lights on Cold War tanks and brake squeal when braking (each tank with its own pitch).',
         'Driving: brakes per tank (WWI tanks brake poorly, Cold War ones have hydraulic discs; heavies brake worse), releasing the throttle lets the tank roll a few metres and S brakes; in reverse, A swings the tail to the left, like a car.',
         'Cold War, second batch: M1 Abrams, Leopard 2A4, Centurion, Chieftain, M113, M551 Sheridan, Scorpion, PT-76B, Marder 1A3, Ru 251, EE-9 Cascavel (with its 6 wheels and boomerang bogie), Tiran-5Sh and the Paraguayan M3 Stuart rebuilt with the detailed model, compared against Sketchfab models.',
         'Cold War: M60A1 and M60A3, Leopard 1A1, 1A5 and 1V, Uruguayan M41 and T-62M rebuilt with the detailed model (M60 "needle nose" turret, Leopard skirts and thermal sleeve, M41UR Cockerill 90 mm, T-62 fume extractor one third from the muzzle).',
         'M10 Wolverine rebuilt: a real open-top turret with the "duckbill" counterweights, the big 3-inch gun shield, the .50 at the rear and the appliqué armor bosses on the hull.',
         'Visible crew in open-top turrets (M10, M18, M36 and the AA vehicles): gunner, loader and commander; if one is lost, he disappears.',
         'Pintle-mounted machine guns are fired from outside: on the Sherman, IS-2, TAM and others, the gunner pops out of the hatch while using it. Since he is exposed, infantry, machine guns and shrapnel can take him out.',
         'Soldiers hold their weapons properly: stock to the shoulder and bent elbows when aiming, weapon across the chest when walking, and the rocket launcher on the shoulder.',
         'Gear with volume: canteen with its cup, shovel in its cover, rounded packs and the German mess tin.',
         'Townsfolk sitting on park benches (reading or chatting) and small groups talking on the sidewalks; they get up and run if a tank comes close or shooting starts.',
         'Much smoother: each tank is drawn in a few pieces, like in War Thunder (the wheels still spin and follow the bumps), and each soldier or civilian in a single boned piece. In a battle with smoke and explosions, less than half the work for the graphics card.',
         'With lots of smoke on screen, smoke is drawn at half resolution when it helps on your PC (it measures by itself), and it now blends softly into the ground and walls.',
         'Smoother battles: smoke, explosions, debris and tracers are drawn together (each cloud used to be a separate object) and craters no longer stall the frame. Looks the same.',
         'Cold War: you can now call infantry (B): an M113 drops the squad at the point.',
         'The artillery and air strike animations play on every map and era, also when you join someone else\'s battle.',
         'M10 Wolverine, second version: wedge gun shield, pentagonal counterweights at the back, the .50 high on its pintle and the turret interior (breech, ammo, radio, sight, seats).']},
    {id:'2026-11-14b',fecha:'14/11/2026',
     es:['Aviones y cañones de cada país: apoyo aéreo con Ju 87 Stuka, Il-2, P-47, Typhoon y el Northrop 8A-2 argentino; paracaidistas en Ju 52, C-47, Dakota y Li-2; artillería con leFH 18, M-30, M2A1, 25 libras y los Schneider y Bofors argentinos.',
         'Cada ejército con sus armas y cascos: Kar98k, MP 40 y Stahlhelm; Mosin, PPSh y SSh-40; Garand, Thompson y M1; Lee-Enfield, Sten y Brodie; Mauser 1909 argentino. Y los civiles con poses más naturales.',
         'La animación de la artillería y del avión sale la primera vez que la pide tu equipo en cada partida, y una versión corta cuando la pide el enemigo.',
         'Arreglos de lo que reportaron: los postes del telégrafo, faroles, bancos e hidrantes no se veían (quedaban solo los cables en el aire). Postes nuevos, con crucetas, riostras, escalones y aisladores de campana.',
         'Semiorugas de los refuerzos rehechas: Sd.Kfz. 251 y M3 Half-track.',
         'Las animaciones de la artillería y el bombardeo ya no se cortan al tocar una tecla (tienen botón Saltear).',
         'Cuando cae un tripulante, un cartel explica qué pasa y cómo recuperarlo; en un punto propio se recupera aunque no haya infantería cerca.',
         'Las novedades se abren solas cuando hay algo nuevo.'],
     en:['Aircraft and guns for each country: air support with Ju 87 Stuka, Il-2, P-47, Typhoon and the Argentine Northrop 8A-2; paratroopers in Ju 52, C-47, Dakota and Li-2; artillery with leFH 18, M-30, M2A1, 25-pounder and the Argentine Schneider and Bofors.',
         'Each army with its own weapons and helmets: Kar98k, MP 40 and Stahlhelm; Mosin, PPSh and SSh-40; Garand, Thompson and M1; Lee-Enfield, Sten and Brodie; Argentine Mauser 1909. And more natural civilian poses.',
         'The artillery and air support animation plays the first time your team calls it in each battle, and a short version when the enemy does.',
         'Fixes from your reports: telegraph poles, street lamps, benches and hydrants were invisible (only the wires showed). New poles with crossarms, braces, steps and bell insulators.',
         'Reinforcement half-tracks rebuilt: Sd.Kfz. 251 and M3 Half-track.',
         'The artillery and air strike animations no longer stop when you press a key (they have a Skip button).',
         'When a crew member is down, a message explains what happens and how to get him back; in your own point you get crew back even with no infantry nearby.',
         'News opens by itself when there is something new.']},
    {id:'2026-11-14',fecha:'14/11/2026',
     es:['Capítulo TAM, semana 1: nuevo tanque argentino, el Sherman Repotenciado (1978), un Firefly con cañón de 105 mm de Río Tercero y motor diésel.',
         'Botón 📜 Historia con su historia y sus fuentes, del Sherman de 1946 a la crisis del Beagle.',
         'Por ahora está en la línea argentina de la Guerra Fría; la semana que viene esa línea se abre todo el año.'],
     en:['TAM chapter, week 1: a new Argentine tank, the Sherman Repotenciado (1978), a Firefly with a 105 mm gun from Río Tercero and a diesel engine.',
         '📜 History button with its story and sources, from the 1946 Shermans to the Beagle crisis.',
         'For now it is in the Argentine Cold War line; next week that line opens all year round.']},
    {id:'2026-11-13',fecha:'13/11/2026',
     es:['TaraWar ya está en itch.io: spuchinni.itch.io/tarawar.',
         'Abrimos el Discord del juego para armar partidas, avisar errores y proponer ideas (botón 👥 Discord en el menú).',
         'Botón 💬 Dar opinión: lo leo todo.'],
     en:['TaraWar is now on itch.io: spuchinni.itch.io/tarawar.',
         'The game\'s Discord is open: find battles, report bugs and suggest ideas (👥 Discord button in the menu).',
         '💬 Give feedback button: I read everything.']},
    {id:'2026-11-10b',fecha:'10/11/2026',
     es:['Capítulo Nahuel: la historia del primer tanque argentino, con fuentes (botón 📜 Historia en el garaje).',
         'Tres desafíos del Nahuel basados en hechos reales: el desfile del 9 de Julio de 1944, la marcha a San Miguel y la prueba de tiro de 1947 (botón 🎖 Desafíos).',
         'El cañón dañado ahora se ve: quemado, abollado y humeando.',
         'Cuando te queda poca munición, te explica cómo reponerla en un punto de tu bando.',
         'Apoyos: la artillería cuesta 150 puntos y el bombardeo 300; la radio dicta las coordenadas y la primera vez se ve la batería disparando y el bombardero llegando.'],
     en:['Nahuel chapter: the story of the first Argentine tank, with sources (📜 History button in the hangar).',
         'Three Nahuel challenges based on real events: the July 9, 1944 parade, the march to San Miguel and the 1947 firing trial (🎖 Challenges button).',
         'A damaged gun is now visible: burnt, dented and smoking.',
         'When you run low on ammo, you learn how to resupply at a point your side holds.',
         'Support: artillery costs 150 points and air strikes 300; the radio reads out the coordinates, and the first time you see the battery firing and the bomber coming in.']},
    {id:'2026-11-10',fecha:'10/11/2026',
     es:['Arrancamos de cero: se reinició el progreso de todos.',
         'Con 2 victorias después del entrenamiento se abre la Argentina con el Nahuel; después, cada 5 victorias elegís una nación nueva.'],
     en:['Fresh start: everyone\'s progress was reset.',
         'After the training, 2 wins unlock Argentina and the Nahuel; then every 5 wins you choose a new nation.']},
    {id:'2026-11-09',fecha:'9/11/2026',
     es:['Premio diario en ruleta: gira sola al entrar y vuelve a las 0 h.',
         'Primeras batallas: te enseña el punto débil de cada tanque y a usar la mira de lejos.',
         'La munición se desbloquea con el nivel del tanque y en el garaje elegís cuánta llevar.',
         'Cuando te destruyen, la cámara de muerte te muestra el tiro y quién fue. Un tanque nuevo ahora cuesta unas 5 batallas.',
         'La 1ª batalla va por pasos: un tanque cerca para aprender dónde pegar, otro lejos para la mira. Al terminar el entrenamiento (3 batallas) recibís tu primer tanque.'],
     en:['Daily reward wheel: spins on its own when you log in and resets at midnight.',
         'First battles: learn each tank\'s weak spot and how to use the sight at long range.',
         'Ammo unlocks with tank level, and in the garage you choose how much to carry.',
         'When you are destroyed, the death cam shows the shot and who fired it. A new tank now takes about 5 battles.',
         'The first battle goes step by step: a close tank to learn where to hit, a far one for the sight. After the training (3 battles) you get your first tank.']},
    {id:'2026-11-08',fecha:'8/11/2026',
     es:['Elegí tu primer tanque: Sherman, T-34 o Panzer IV, y a pelear en segundos.',
         'Batallas rápidas de 5 minutos (en el garaje podés volver a la batalla grande).',
         'Premio diario: girá la ruleta cada día y ganá Yaguaretés, calcomanías, accesorios o camuflajes. 14 días seguidos = tanque especial.',
         'Panzer IV con sus medidas reales y pintura más prolija en todos los tanques. Se puede jugar sin internet.',
         'TaraWar se enfoca en la 2ª Guerra y en los blindados argentinos: las demás épocas y países quedan guardados por ahora.'],
     en:['Pick your first tank: Sherman, T-34 or Panzer IV, and fight within seconds.',
         'Quick 5-minute battles (switch back to big battles in the garage).',
         'Daily reward: spin the wheel every day for Yaguaretés, stickers, gear or camouflage. 14 days in a row = a special tank.',
         'Panzer IV with real dimensions and cleaner paint on every tank. You can now play offline.',
         'TaraWar now focuses on World War II and Argentine armor: other eras and nations are stored for later.']}];
  const st=document.createElement('style'); st.textContent=`
    #novBox{position:fixed;inset:0;z-index:55;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);padding:12px}
    #novBox .card{width:min(640px,96vw);max-height:90vh;overflow:auto;background:rgba(18,20,24,.97);border:2px solid #ffd24a;border-radius:14px;padding:16px 20px;color:#fff;font:600 17px 'Saira Condensed',system-ui,sans-serif}
    #novBox h2{margin:0 0 8px;font:800 30px 'Saira Condensed',system-ui,sans-serif;color:#ffd24a;text-align:center}
    #novBox h3{margin:12px 0 4px;color:#cfc6b0;font-size:16px;letter-spacing:.06em} #novBox ul{margin:0;padding-left:20px} #novBox li{margin:4px 0;line-height:1.3}
    #novBox .x{display:block;margin:14px auto 0;min-width:180px;font-size:20px}
    #introL{display:none} .homeCopy{left:0;right:0;text-align:center;bottom:calc(2px + env(safe-area-inset-bottom,0px))}
    .homeBar{bottom:calc(26px + env(safe-area-inset-bottom,0px))!important}
    .novB{position:relative} .novB i{position:absolute;top:-2px;right:-10px;width:10px;height:10px;border-radius:50%;background:#ff4a36;box-shadow:0 0 0 2px #111}
    .homeTag{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(122px + env(safe-area-inset-bottom,0px));z-index:5;pointer-events:none;white-space:nowrap;
      font:700 20px 'Saira Condensed',system-ui,sans-serif;letter-spacing:.06em;color:#ffd24a;text-shadow:0 2px 6px #000,0 0 2px #000}
    body.movil .homeTag{font-size:14px;bottom:calc(100px + env(safe-area-inset-bottom,0px))}`;
  document.head.appendChild(st);
  const box=document.createElement('div'); box.id='novBox'; box.setAttribute('data-notr',''); document.body.appendChild(box);
  function showNov(){ const L=EN();
    box.innerHTML=`<div class="card"><h2>${L?'What\'s new':'Novedades'}</h2>${NOV.map(n=>`<h3>${n.fecha}</h3><ul>${(L?n.en:n.es).map(x=>`<li>${x}</li>`).join('')}</ul>`).join('')}
      <button class="go alt x" id="novX">${L?'Close':'Cerrar'}</button></div>`;
    box.style.display='flex'; LS('tw2_nov',NOV[0].id);
    document.getElementById('novX').onclick=()=>{ box.style.display='none'; if(state==='menu') mainMenu(); }; }
  window.showNov=showNov;
  const _mm=mainMenu; mainMenu=function(){ const r=_mm.apply(this,arguments);
    const bar=document.querySelector('.homeBar'); if(!bar) return r;
    // menú liviano (pedido de Sebastián: "muy cargada"): Jugar, Campaña, Vehículos y Opciones. El Tutorial está en el garaje.
    const tb=document.getElementById('tutB'); if(tb) tb.style.display='none';
    // Novedades: link chico abajo, en lugar de "Ver la intro" (la intro hoy es la portada quieta y se encimaba con Opciones)
    const cp=document.querySelector('.homeCopy'); if(cp){ const b=document.createElement('button'); b.className='introL novB'; b.id='novB'; b.setAttribute('data-notr','');
      b.innerHTML=`📰 ${EN()?'News':'Novedades'}${LS('tw2_nov')!==NOV[0].id?'<i></i>':''}`; b.onclick=showNov; cp.prepend(b); }
    // lema: de qué se trata el juego (no tapa el tanque elegido de las primeras batallas: va más arriba)
    const t=document.createElement('div'); t.className='homeTag'; t.setAttribute('data-notr','');
    t.textContent=EN()?'Argentine armor, from the Nahuel to the TAM · made in Corrientes':'Los blindados argentinos, del Nahuel al TAM · hecho en Corrientes';
    $('panel').appendChild(t);
    // se abre sola al llegar al menú si hay una novedad sin ver (pedido de Sebastián), para todos (también el que recién llega),
    // esperando a que se vaya la portada y a que no haya otra caja abierta (ruleta del premio diario, etc.)
    // el que recién llega no la ve antes de su 1ª batalla (se le abría encima del entrenador)
    if(!novShown&&!autoT&&LS('tw2_nov')!==NOV[0].id){ let n=0; autoT=setInterval(()=>{ n++;
      if(state!=='menu'||!$('playB')){ n=0; return; }   // todavía en la portada o fuera del menú: espera (sigue mirando hasta que se pueda)
      const busy=[...document.querySelectorAll('#dayBox,#natPick,#tkPick,#giftBox,#opBox,#nahBox,#iosGuide')].some(e=>e&&getComputedStyle(e).display!=='none');
      if(!busy&&n>=3){ clearInterval(autoT); autoT=0; novShown=true; if(LS('tw2_nov')!==NOV[0].id&&state==='menu'&&!(PROG&&PROG.train&&!(PROG.stats&&PROG.stats.battles))) showNov(); } },500); }
    return r; };
  let autoT=0, novShown=false;
})();
