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
const W2_MAPS=['normandia','prokhorovka','alamein','ardenas','stalingrado','berlin','okinawa'];
for(const k of W2_MAPS){ const C=ww1Big(WW1_CFG[k]);
  WORLDS[k]={key:k,label:C.label,desc:C.desc,era:3,ww1:true,bx:C.bx,bz:C.bz,sky:C.sky,fog:C.fog,dust:k==='ardenas'?0xd8dde0:k==='alamein'?0xc8b48a:0x8a7a5a,cfg:C,
    h:(x,z)=>ww1Sample(WORLDS[k],x,z),zones:C.zones,
    spawns:{0:[{label:'Base oeste',x:-90,z:-C.spawnZ},{label:'Base este',x:90,z:-C.spawnZ}],
            1:[{label:'Retaguardia oeste',x:-90,z:C.spawnZ},{label:'Retaguardia este',x:90,z:C.spawnZ}]}}; }
WORLDS.ardenas.wxs=['nieve','nieve','niebla','dia','tarde'];
WORLDS.alamein.wxs=['dia','dia','tarde','noche'];
WORLDS.stalingrado.wxs=['dia','niebla','tarde','nieve','lluvia']; WORLDS.berlin.wxs=['dia','tarde','niebla','lluvia','noche']; WORLDS.okinawa.wxs=['lluvia','dia','niebla','lluvia','tarde'];
WORLDS.stalingrado.dust=WORLDS.berlin.dust=0x7a746a;
