/* ---------- Mapas de la Segunda Guerra Mundial (1939–1945) ----------
   Mismo generador que los frentes de la 1ª Guerra (gm1-mapas.js), con opciones de esta guerra: setos del bocage normando con sus bordos
   de tierra (hedges), estepa de Kursk con zanjas antitanque (ditches anchas y hondas), el desierto de El Alamein con sus lomas y las
   Ardenas nevadas con bosques de pinos y su propio clima (wxs). Equipo 0 al sur, equipo 1 al norte. */
Object.assign(SPECIES,{
  seto:{lobes:3,tr:.1,th:.5,crown:()=>new THREE.DodecahedronGeometry(1.45,0),cs:[1.5,1.3,1.5],cy:1.45,col:[0x587a38,0x627f3c,0x4f6e32,0x6a8440]},
  manzano:{tr:.16,th:1.4,crown:()=>new THREE.IcosahedronGeometry(2.0,1),cs:[1,.75,1],cy:2.7,col:[0x557038,0x5f7a3e,0x4d6634]},
  pino:{layers:1,tr:.2,th:2.2,crown:()=>{ const g=new THREE.ConeGeometry(2.4,9,8); return g; },cs:[1,1,1],cy:7.2,col:[0x2c3f2c,0x334833,0x283a28]},
  pinoN:{layers:1,tr:.2,th:2.2,crown:()=>{ const g=new THREE.ConeGeometry(2.4,9,8); return g; },cs:[1,1,1],cy:7.2,col:[0x8a9a92,0x6f8278,0xb8c4c0]}, // pino con nieve
  palmera:{tr:.16,th:7.5,crown:()=>{ const g=new THREE.ConeGeometry(3.2,1.6,8,1,true); return g; },cs:[1,1,1],cy:7.9,col:[0x4f6a2c,0x5b7432,0x45602a]},   // palmera: copa de hojas que cuelgan
  pinoR:{tr:.22,th:4.2,crown:()=>new THREE.IcosahedronGeometry(2.6,1),cs:[1.35,.45,1.35],cy:5.4,col:[0x2f4a2a,0x36522e,0x2a4226]},                     // pino de Okinawa (copa chata, en sombrilla)
  abedul:{tr:.14,th:3.5,crown:()=>new THREE.IcosahedronGeometry(2.2,1),cs:[1,1.4,1],cy:6.0,col:[0x7a8a4a,0x6f8042,0x87964f]}
});
const W2_NOR={walls:[0xb8ae9a,0xa89e88,0xc4b9a2,0x9a9282],roofs:[0x4a4e54,0x55595e,0x6a4a3a,0x3e4246]},
  W2_RU={walls:[0x7a5e40,0x6a5238,0x8a6c4a,0xc8c0a8],roofs:[0x8a7a5a,0x5a5e60,0x7a6a4a]},
  W2_EG={walls:[0xe2d8c2,0xd6c9ae],roofs:[0xcfc3a8,0xbfb398]},
  W2_ARD={walls:[0x8e8a84,0x7a766f,0x9a958c],roofs:[0x3c4046,0x45494f,0x34383d]};
Object.assign(WW1_CFG,{
  normandia:{seed:1944,era:3,label:'Villers-Bocage (Normandía, 1944)',desc:'13 de junio de 1944: el bocage normando, potreros cerrados por setos sobre bordos de tierra donde un tanque no ve a 50 m. Los Cromwell de la 7.ª Blindada entran al pueblo y el Tiger de Michael Wittmann los espera en la Cota 213.',
    bx:175,bz:155,sky:0xb4bcbe,fog:[120,420],ground:['#5f7a3c','#56703a','#6c8444','#4c6434'],grass:1,craters:40,crR:[1,3],front:62,noTrench:1,churn:.05,deadTrees:0,
    hedges:{cell:[90,140],keep:.6},
    village:{x:5,z:15,n:30,ruin:.2,r:34,name:'Villers-Bocage',church:1,...W2_NOR},hamlet:{x:-105,z:30,n:5,ruin:.1,r:12,...W2_NOR},
    hills:[{x:110,z:40,r:40,h:7}],
    woods:[{x:-105,z:-25,r:22,n:60,dead:0,sp:['manzano']},{x:110,z:40,r:20,n:50,dead:0,sp:['roble','manzano']}],
    zones:[{id:'A',x:-105,z:30,r:19,label:'Tracy-Bocage'},{id:'B',x:5,z:15,r:19,label:'Villers-Bocage'},{id:'C',x:110,z:40,r:18,label:'Cota 213'}]},
  prokhorovka:{seed:1943,era:3,label:'Prokhorovka (Kursk, 1943)',desc:'12 de julio de 1943: la batalla de tanques más grande de la historia. Estepa abierta de trigo, la vía del tren, el sovjós Oktiabrski sobre la loma, barrancos (balkas) y zanjas antitanque. Los T-34 cargan a toda velocidad para acortar la distancia contra los Tiger.',
    bx:175,bz:155,sky:0xb9c2c6,fog:[150,500],ground:['#9a9058','#8c8450','#a89c62','#7c7848'],grass:.7,craters:180,crR:[1,3.5],front:60,noTrench:1,churn:.3,deadTrees:4,
    ditches:[[[-200,-12],[200,-5]],[[-150,60],[-30,95]],[[60,-90],[180,-60]]],ditchW:4.5,ditchD:2.2,ditchGap:150,ridge:4,
    hills:[{x:-10,z:40,r:55,h:8},{x:120,z:-40,r:30,h:4}],
    village:{x:-10,z:40,n:16,ruin:.3,r:26,name:'Sovjós Oktiabrski',...W2_RU},hamlet:{x:-110,z:-20,n:7,ruin:.2,r:14,...W2_RU},
    woods:[{x:115,z:-40,r:22,n:60,dead:.1,sp:['abedul']}],
    zones:[{id:'A',x:-110,z:-20,r:19,label:'Andréyevka'},{id:'B',x:-10,z:40,r:19,label:'Sovjós Oktiabrski'},{id:'C',x:115,z:-40,r:18,label:'Bosquecito de abedules'}]},
  alamein:{seed:1942,era:3,label:'El Alamein (Egipto, 1942)',desc:'Octubre de 1942: Montgomery rompe la línea del Afrika Korps. Desierto abierto con lomas bajas (Kidney Ridge, Tel el Aqqaqir), poco para cubrirse y combate a larga distancia. Las tormentas de arena tapan todo.',
    bx:175,bz:155,sky:0xd4cbb6,fog:[160,520],ground:['#cdb78a','#c2ab7e','#d6c296','#b89f72'],grass:0,craters:260,crR:[1,3.5],front:62,noTrench:1,churn:.5,deadTrees:0,
    hills:[{x:-90,z:30,r:45,h:6},{x:80,z:-35,r:40,h:5},{x:100,z:70,r:30,h:4}],
    village:{x:20,z:-5,n:5,ruin:.4,r:16,name:'Puesto de Tel el Eisa',sz:.8,hz:.7,...W2_EG},
    woods:[],
    zones:[{id:'A',x:-90,z:30,r:19,label:'Kidney Ridge'},{id:'B',x:20,z:-5,r:19,label:'Tel el Eisa'},{id:'C',x:80,z:-35,r:18,label:'Tel el Aqqaqir'}]},
  ardenas:{seed:1945,era:3,label:'Bastogne (Ardenas, 1944)',desc:'Diciembre de 1944: la ofensiva de las Ardenas en la nieve. Los paracaidistas de la 101.ª, rodeados en Bastogne, aguantan en los bosques de pinos mientras los Panther atacan por los caminos. Frío, niebla y pocas horas de luz.',
    bx:175,bz:155,sky:0xc8cdd2,fog:[100,360],ground:['#e4e8ea','#d8dde0','#eef1f3','#c9cfd2'],grass:0,craters:120,crR:[1,2.8],front:58,tw:[1.4,1.4],td:1.4,wire:[0,0],trenchSides:[-1],churn:.15,deadTrees:6,ridge:5,
    hills:[{x:-20,z:70,r:50,h:7}],
    village:{x:15,z:-25,n:26,ruin:.25,r:30,name:'Bastogne',church:1,...W2_ARD},hamlet:{x:-10,z:85,n:8,ruin:.3,r:14,...W2_ARD},
    woods:[{x:-110,z:10,r:40,n:220,dead:.03,sp:['pinoN','pinoN','pino']},{x:110,z:20,r:36,n:180,dead:.03,sp:['pinoN','pino']},{x:60,z:90,r:22,n:70,dead:0,sp:['pinoN']}],
    zones:[{id:'A',x:-110,z:10,r:19,label:'Bois Jacques'},{id:'B',x:15,z:-25,r:19,label:'Bastogne'},{id:'C',x:-10,z:85,r:18,label:'Foy'}]}
});
// ---- Ciudades y Pacífico (pedido de Sebastián: más mapas para la 2ª Guerra) ----
// Las ciudades usan la cuadrícula de C.city (gm1-mapas.js), con coordenadas ya en la escala grande (±740 m): calles cada 60 m
// alineadas con la grilla de 12 m del grafo de la IA. Los puntos (zones) van en la escala chica, como en los demás mapas.
const _lmM=c=>new THREE.MeshLambertMaterial({color:c});
const W2_STG={walls:[0xb8ab98,0xa49884,0x9a5a44,0xc8bca6,0x8a8274,0xb0a48c],roofs:[0x5a5e60,0x6a4a3a,0x4e5256]},
  W2_BER={walls:[0xb0a690,0x9c9484,0x8c8478,0xa8a090,0x7a7268,0xbcb29a],roofs:[0x4a4e52,0x5a4a40,0x3e4246]};
Object.assign(WW1_CFG,{
  stalingrado:{seed:1942.9,era:3,label:'Stalingrado (1942)',desc:'Otoño de 1942: el 6.º Ejército alemán pelea casa por casa contra el 62.º Ejército soviético, con el Volga a la espalda. Manzanas en ruinas, el elevador de granos, la Casa de Pávlov y la fábrica Octubre Rojo. "No hay tierra para nosotros más allá del Volga."',
    bx:175,bz:155,sky:0xa9b1b6,fog:[110,380],ground:['#7a746a','#6e685e','#857e72','#5f5a52'],grass:0,craters:420,crR:[1,3.2],front:58,noTrench:1,noRoads:1,churn:.4,deadTrees:12,
    village:{x:0,z:0,n:0,r:4,...W2_STG},hills:[{x:-135,z:12,r:24,h:6}],woods:[{x:-20,z:-62,r:10,n:24,dead:.75,sp:['roble','alamo']}],
    city:{x0:-538,x1:542,z0:-358,z1:362,bw:46,bd:46,street:14,lot:15.3,h:[7,19],ruin:.72,col:.5,open:.12,pitched:.08,...W2_STG,skip:[[-84,-260,30],[-567,50,105]],
      lm:[{x:-252,z:-208,w:40,d:16,h:34,wall:0xbcb4a2,roof:0x8a8478,parts:[[0,0,40,16,34],[26,0,12,12,44]],pad:14},
          {x:30,z:96,w:34,d:12,h:15,wall:0xc4b49a,roof:0x6a5e52,pad:6},
          {x:-52,z:-12,w:20,d:14,h:13,wall:0x9a5a44,roof:0x5a4a40,pad:6},
          {x:336,z:180,w:110,d:66,h:16,wall:0x8e7f70,roof:0x5a5450,parts:[[0,-20,110,28,16],[0,20,110,24,13]],pad:10,
           extra:y=>{ const m=_lmM(0x7a4a3a); for(const dx of [-40,-14,12,38]) cyl(worldGroup,1.8,2.4,44,336+dx,y+22,212,10,m); }}]},
    zones:[{id:'A',x:-75,z:-30,r:18,label:'Elevador de granos'},{id:'B',x:0,z:10,r:18,label:'Casa de Pávlov'},{id:'C',x:80,z:25,r:18,label:'Fábrica Octubre Rojo'}]},
  berlin:{seed:1945.4,era:3,label:'Berlín (1945)',desc:'Abril de 1945: el Ejército Rojo entra al centro de Berlín. Avenidas entre edificios de cinco pisos quemados, el Tiergarten destrozado con su torre antiaérea, la Puerta de Brandeburgo y el Reichstag, donde se izó la bandera roja el 30 de abril.',
    bx:175,bz:155,sky:0xb0b4b4,fog:[110,390],ground:['#6f6c66','#65625c','#7b776f','#5c5954'],grass:.15,craters:300,crR:[1,3],front:58,noTrench:1,noRoads:1,churn:.3,deadTrees:20,
    village:{x:0,z:0,n:0,r:4,...W2_BER},woods:[{x:-112,z:-10,r:26,n:110,dead:.5,sp:['roble','alamo']}],
    city:{x0:-358,x1:602,z0:-358,z1:362,bw:46,bd:46,street:14,lot:15.3,h:[11,20],ruin:.5,col:.45,open:.08,...W2_BER,
      lm:[{x:42,z:236,w:96,d:62,h:21,wall:0xb3a98e,roof:0x5a5e5a,pad:10,extra:y=>{ const m=_lmM(0xb3a98e), d=_lmM(0x4f5a54);
             for(const [dx,dz] of [[-42,-25],[42,-25],[-42,25],[42,25]]) box(worldGroup,12,9,12,42+dx,y+25,236+dz,m);                        // torres de las esquinas
             cyl(worldGroup,14,14,6,42,y+24,236,20,m); const dm=new THREE.Mesh(new THREE.SphereGeometry(13.5,16,8,0,Math.PI*2,0,Math.PI/2),d); dm.position.set(42,y+27,236); worldGroup.add(dm); }},  // cúpula
          {x:-168,z:-84,w:62,d:11,h:15,wall:0xc2b89e,roof:0xc2b89e,pad:4,parts:[-27.5,-16.5,-5.5,5.5,16.5,27.5].map(dx=>[dx,0,3,10,15]),
           extra:y=>{ const m=_lmM(0xc2b89e); box(worldGroup,63,4.6,11.5,-168,y+17.3,-84,m); box(worldGroup,10,3.5,4,-168,y+21.3,-84,_lmM(0x4a5a50)); }},   // Puerta de Brandeburgo
          {x:-462,z:-160,w:66,d:66,h:39,wall:0x8a8780,roof:0x77746e,pad:8,extra:y=>{ const m=_lmM(0x8a8780); for(const [dx,dz] of [[-27,-27],[27,-27],[-27,27],[27,27]]){ cyl(worldGroup,8,8,6,-462+dx,y+42,-160+dz,12,m); box(worldGroup,1.2,1.2,9,-462+dx,y+46,-160+dz+4,darkMat); } }}]},   // torre antiaérea del Zoo
    zones:[{id:'A',x:-110,z:-10,r:18,label:'Tiergarten'},{id:'B',x:10,z:40,r:18,label:'Reichstag'},{id:'C',x:-40,z:-20,r:18,label:'Puerta de Brandeburgo'}]},
  okinawa:{seed:1945.6,era:3,label:'Okinawa: la línea Shuri (1945)',desc:'Mayo de 1945: los marines y el ejército de EE. UU. atacan la línea Shuri bajo la lluvia. Crestas de coral llenas de cuevas y búnkeres, aldeas de tejas rojas, palmeras y pinos, y barro. Los Chi-Ha japoneses esperan enterrados en las laderas.',
    bx:175,bz:155,sky:0xb6c0c2,fog:[110,400],ground:['#6b6a3c','#5e5c34','#7a6e46','#4f5030'],grass:.6,craters:220,crR:[1,3.4],front:58,tw:[1.4,1.4],td:1.4,wire:[0,1],trenchSides:[1],churn:.5,deadTrees:6,bunkers:6,
    hills:[{x:-95,z:25,r:36,h:10},{x:85,z:30,r:28,h:11},{x:0,z:85,r:55,h:8},{x:-20,z:-65,r:30,h:3},{x:150,z:80,r:30,h:7},{x:-150,z:90,r:30,h:6}],
    village:{x:5,z:5,n:22,ruin:.45,r:26,name:'Maeda',walls:[0xc9c1a8,0xb9af98,0xd2c8b0],roofs:[0xa04a34,0xb2583a,0x8e4430]},hamlet:{x:-60,z:-45,n:6,ruin:.3,r:12,walls:[0xc9c1a8,0xb9af98],roofs:[0xa04a34,0xb2583a]},
    woods:[{x:-95,z:25,r:22,n:60,dead:.3,sp:['pinoR','palmera']},{x:85,z:30,r:18,n:40,dead:.5,sp:['pinoR']},{x:-140,z:-40,r:24,n:60,dead:.1,sp:['palmera','pinoR','palmera']},{x:130,z:-50,r:22,n:50,dead:.1,sp:['palmera','pinoR']}],
    zones:[{id:'A',x:-95,z:25,r:19,label:'Cresta Kakazu'},{id:'B',x:5,z:5,r:19,label:'Aldea de Maeda'},{id:'C',x:85,z:30,r:18,label:'Sugar Loaf'}]}
});
// ---- Mapas para Italia, Japón y China (pedido de Sebastián: que las naciones nuevas tengan dónde pelear) ----
const W2_TUN={walls:[0xe2dac6,0xd4c8ae,0xe8e0cc,0xc8bc9e],roofs:[0xd0c4a8,0xc2b698,0xb8ab8c]},
  W2_ITA={walls:[0xc8b896,0xb8a888,0xd2c4a4,0xa89a7c,0xbfae8c],roofs:[0xa0583c,0x8e4c34,0xb06444,0x7a4a38]},
  W2_CHN={walls:[0x8a8a86,0x7c7c78,0x9a968c,0x6e6c66,0xa8a296,0x8c7c6a],roofs:[0x3e4246,0x4a4e52,0x55585c,0x5a4a40]},
  W2_SAI={walls:[0xd8d0bc,0xc8c0aa,0xb8ae96,0xe0d8c4],roofs:[0x8a5a3a,0x6a6e70,0x9a6040,0x5a5e60]};
Object.assign(WW1_CFG,{
  kasserine:{seed:1943.2,era:3,label:'Paso de Kasserine (Túnez, 1943)',desc:'Febrero de 1943: Rommel ataca por el paso de Kasserine, entre dos cordones de montañas peladas (los djebels). Los Panzer y la División Centauro italiana con sus M13/40 y Semovente arrollan a la 1.ª Blindada de EE. UU. en su primera gran batalla. Uadis secos, olivares y pedregal.',
    bx:175,bz:155,sky:0xcfc8b4,fog:[150,500],ground:['#b9a67c','#ab9870','#c4b288','#9c8a64'],grass:.12,craters:160,crR:[1,3.2],front:60,noTrench:1,churn:.25,deadTrees:2,ridge:3,
    hills:[{x:-150,z:15,r:48,h:9},{x:-140,z:-70,r:32,h:6},{x:150,z:30,r:46,h:9},{x:150,z:-60,r:30,h:6},{x:-30,z:90,r:30,h:3}],
    ditches:[[[-120,-40],[-40,-20],[30,-35],[120,-10]]],ditchW:7,ditchD:1.6,ditchGap:70,
    village:{x:5,z:10,n:16,ruin:.25,r:22,name:'Kasserine',...W2_TUN},hamlet:{x:95,z:-30,n:6,ruin:.2,r:12,...W2_TUN},
    woods:[{x:-70,z:40,r:24,n:70,dead:0,sp:['olivo']},{x:60,z:55,r:20,n:50,dead:0,sp:['olivo']},{x:-110,z:-30,r:22,n:40,dead:0,sp:['espinillo']},{x:120,z:5,r:20,n:35,dead:0,sp:['espinillo']}],
    zones:[{id:'A',x:-95,z:15,r:19,label:'Djebel Chambi'},{id:'B',x:5,z:10,r:19,label:'Kasserine'},{id:'C',x:95,z:-30,r:18,label:'Cruce de Thala'}]},
  saipan:{seed:1944.6,era:3,label:'Saipán (Marianas, 1944)',desc:'Noche del 16 al 17 de junio de 1944: el 9.º Regimiento de Tanques japonés lanza el ataque de tanques más grande del Pacífico contra la cabeza de playa de los marines. Cañaverales, palmeras, el pueblo de Charan Kanoa y el ingenio azucarero, con el monte Tapochau atrás.',
    bx:175,bz:155,sky:0xb8c6cc,fog:[120,440],ground:['#7c8a46','#6f7e3e','#8a9450','#a69a6a'],grass:.85,craters:200,crR:[1,3.2],front:58,noTrench:1,churn:.3,deadTrees:6,bunkers:5,
    hills:[{x:20,z:160,r:60,h:12},{x:-140,z:60,r:34,h:5},{x:130,z:70,r:30,h:6}],
    village:{x:-5,z:-5,n:20,ruin:.4,r:26,name:'Charan Kanoa',church:1,...W2_SAI},hamlet:{x:100,z:40,n:7,ruin:.35,r:14,...W2_SAI},
    woods:[{x:-100,z:-35,r:26,n:70,dead:.2,sp:['palmera']},{x:-120,z:55,r:22,n:60,dead:.1,sp:['palmera','pinoR']},{x:60,z:-50,r:22,n:50,dead:.2,sp:['palmera']},{x:110,z:95,r:24,n:60,dead:.1,sp:['pinoR','palmera']}],
    zones:[{id:'A',x:-100,z:-15,r:19,label:'Playa Verde'},{id:'B',x:-5,z:-5,r:19,label:'Charan Kanoa'},{id:'C',x:100,z:40,r:18,label:'Ingenio azucarero'}]},
  cassino:{seed:1944.2,era:3,label:'Montecassino (Italia, 1944)',desc:'Mayo de 1944: la cuarta batalla de Montecassino. El pueblo de Cassino reducido a escombros por los bombardeos, la estación del ferrocarril y, arriba del cerro, las ruinas de la abadía benedictina. Los paracaidistas alemanes aguantan cuatro meses; polacos, británicos y franceses los desalojan.',
    bx:175,bz:155,sky:0xb8bec0,fog:[120,420],ground:['#7c7454','#70684a','#8a8060','#625c44'],grass:.4,craters:500,crR:[1,3.4],front:58,noTrench:1,noRoads:1,churn:.45,deadTrees:20,
    hills:[{x:118,z:66,r:36,h:16},{x:-150,z:80,r:40,h:7}],
    village:{x:0,z:0,n:0,r:4,...W2_ITA},woods:[{x:-120,z:40,r:26,n:80,dead:.4,sp:['olivo']},{x:40,z:-80,r:24,n:60,dead:.2,sp:['olivo']},{x:150,z:-30,r:20,n:40,dead:.6,sp:['roble']}],
    city:{x0:-358,x1:122,z0:-238,z1:122,bw:46,bd:46,street:14,lot:15.3,h:[6,14],ruin:.85,col:.7,open:.18,pitched:.35,...W2_ITA,
      lm:[{x:500,z:282,w:96,d:56,h:13,wall:0xcfc4ac,roof:0x8a8478,pad:6,ruin:.35,parts:[[-30,0,36,14,13],[18,0,24,14,9],[40,0,16,14,12],[-28,42,40,14,11],[24,42,48,14,7],[-41,21,14,28,12],[41,21,14,28,6],[0,21,30,16,17]],hp:1200},   // abadía de Montecassino (claustro)
          {x:-292,z:-190,w:50,d:14,h:9,wall:0xc4b48e,roof:0x8e4c34,pad:6,pitched:1}]},                                                                          // estación del ferrocarril
    zones:[{id:'A',x:-75,z:-35,r:18,label:'Estación'},{id:'B',x:-20,z:5,r:18,label:'Cassino'},{id:'C',x:100,z:48,r:18,label:'Cota 593'}]},
  shanghai:{seed:1937.8,era:3,label:'Shanghái: el almacén Sihang (1937)',desc:'Octubre de 1937: la batalla de Shanghái. Los "800 héroes" del Ejército Nacional Revolucionario defienden el almacén Sihang, junto al arroyo Suzhou, mientras el distrito de Zhabei arde. Los Ha-Go y Chi-Ha japoneses avanzan por las calles contra los Vickers chinos.',
    bx:175,bz:155,sky:0xa8aeb0,fog:[110,380],ground:['#6c6a62','#625f58','#76736a','#58564f'],grass:.1,craters:320,crR:[1,3],front:58,noTrench:1,noRoads:1,churn:.3,deadTrees:14,
    village:{x:0,z:0,n:0,r:4,...W2_CHN},woods:[{x:110,z:-60,r:20,n:50,dead:.3,sp:['alamo','roble']}],
    city:{x0:-538,x1:542,z0:-358,z1:362,bw:46,bd:46,street:12,lot:12,h:[6,15],ruin:.6,col:.5,open:.1,pitched:.45,...W2_CHN,skip:[[460,-250,90]],
      lm:[{x:378,z:96,w:64,d:54,h:25,wall:0x9a948a,roof:0x6e6a64,pad:12,hp:2000},                                                                              // almacén Sihang (hormigón, 6 pisos)
          {x:-312,z:-130,w:80,d:22,h:14,wall:0xb0a490,roof:0x4e5256,pad:10,parts:[[0,0,80,22,14],[0,0,18,18,22]]},                                             // Estación Norte
          {x:-90,z:20,w:30,d:20,h:12,wall:0x8c7c6a,roof:0x3e4246,pad:6,pitched:1}]},
    zones:[{id:'A',x:-75,z:-30,r:18,label:'Estación Norte'},{id:'B',x:0,z:5,r:18,label:'Zhabei'},{id:'C',x:85,z:20,r:18,label:'Almacén Sihang'}]}
});
const W2_MAPS=['normandia','prokhorovka','alamein','ardenas','stalingrado','berlin','okinawa','kasserine','saipan','cassino','shanghai'];
for(const k of W2_MAPS){ const C=ww1Big(WW1_CFG[k]);
  WORLDS[k]={key:k,label:C.label,desc:C.desc,era:3,ww1:true,bx:C.bx,bz:C.bz,sky:C.sky,fog:C.fog,dust:k==='ardenas'?0xd8dde0:k==='alamein'||k==='kasserine'?0xc8b48a:0x8a7a5a,cfg:C,
    h:(x,z)=>ww1Sample(WORLDS[k],x,z),zones:C.zones,
    spawns:{0:[{label:'Base oeste',x:-90,z:-C.spawnZ},{label:'Base este',x:90,z:-C.spawnZ}],
            1:[{label:'Retaguardia oeste',x:-90,z:C.spawnZ},{label:'Retaguardia este',x:90,z:C.spawnZ}]}}; }
WORLDS.ardenas.wxs=['nieve','nieve','niebla','dia','tarde'];
WORLDS.alamein.wxs=['dia','dia','tarde','noche'];
WORLDS.stalingrado.wxs=['dia','niebla','tarde','nieve','lluvia']; WORLDS.berlin.wxs=['dia','tarde','niebla','lluvia','noche']; WORLDS.okinawa.wxs=['lluvia','dia','niebla','lluvia','tarde'];
WORLDS.stalingrado.dust=WORLDS.berlin.dust=0x7a746a;
WORLDS.kasserine.wxs=['dia','dia','tarde','niebla','noche']; WORLDS.saipan.wxs=['noche','noche','dia','tarde','lluvia']; WORLDS.cassino.wxs=['dia','niebla','lluvia','tarde']; WORLDS.shanghai.wxs=['dia','niebla','lluvia','tarde','noche'];
WORLDS.cassino.dust=WORLDS.shanghai.dust=0x7a746a;
// naciones que pelearon en cada batalla: el enemigo sale de acá si es del bando contrario (14-partida.js)
Object.assign(WORLDS.normandia,{hist:['uk','us','fr','de']}); Object.assign(WORLDS.prokhorovka,{hist:['ru','de']}); Object.assign(WORLDS.alamein,{hist:['uk','de','it']});
Object.assign(WORLDS.ardenas,{hist:['us','uk','de']}); Object.assign(WORLDS.stalingrado,{hist:['ru','de','it']}); Object.assign(WORLDS.berlin,{hist:['ru','de']});
Object.assign(WORLDS.okinawa,{hist:['us','jp']}); Object.assign(WORLDS.kasserine,{hist:['us','uk','fr','de','it']}); Object.assign(WORLDS.saipan,{hist:['us','jp']});
Object.assign(WORLDS.cassino,{hist:['uk','us','fr','de']}); Object.assign(WORLDS.shanghai,{hist:['cn','jp']});
