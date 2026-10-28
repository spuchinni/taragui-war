/* ---------- Mapas de la Segunda Guerra Mundial (1939–1945) ----------
   Mismo generador que los frentes de la 1ª Guerra (gm1-mapas.js), con opciones de esta guerra: setos del bocage normando con sus bordos
   de tierra (hedges), estepa de Kursk con zanjas antitanque (ditches anchas y hondas), el desierto de El Alamein con sus lomas y las
   Ardenas nevadas con bosques de pinos y su propio clima (wxs). Equipo 0 al sur, equipo 1 al norte. */
Object.assign(SPECIES,{
  seto:{lobes:3,tr:.1,th:.5,crown:()=>new THREE.DodecahedronGeometry(1.45,0),cs:[1.5,1.3,1.5],cy:1.45,col:[0x587a38,0x627f3c,0x4f6e32,0x6a8440]},
  manzano:{tr:.16,th:1.4,crown:()=>new THREE.IcosahedronGeometry(2.0,1),cs:[1,.75,1],cy:2.7,col:[0x557038,0x5f7a3e,0x4d6634]},
  pino:{layers:1,tr:.2,th:2.2,crown:()=>{ const g=new THREE.ConeGeometry(2.4,9,8); return g; },cs:[1,1,1],cy:7.2,col:[0x2c3f2c,0x334833,0x283a28]},
  pinoN:{layers:1,tr:.2,th:2.2,crown:()=>{ const g=new THREE.ConeGeometry(2.4,9,8); return g; },cs:[1,1,1],cy:7.2,col:[0x8a9a92,0x6f8278,0xb8c4c0]}, // pino con nieve
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
const W2_MAPS=['normandia','prokhorovka','alamein','ardenas'];
for(const k of W2_MAPS){ const C=ww1Big(WW1_CFG[k]);
  WORLDS[k]={key:k,label:C.label,desc:C.desc,era:3,ww1:true,bx:C.bx,bz:C.bz,sky:C.sky,fog:C.fog,dust:k==='ardenas'?0xd8dde0:k==='alamein'?0xc8b48a:0x8a7a5a,cfg:C,
    h:(x,z)=>ww1Sample(WORLDS[k],x,z),zones:C.zones,
    spawns:{0:[{label:'Base oeste',x:-90,z:-C.spawnZ},{label:'Base este',x:90,z:-C.spawnZ}],
            1:[{label:'Retaguardia oeste',x:-90,z:C.spawnZ},{label:'Retaguardia este',x:90,z:C.spawnZ}]}}; }
WORLDS.ardenas.wxs=['nieve','nieve','niebla','dia','tarde'];
WORLDS.alamein.wxs=['dia','dia','tarde','noche'];
