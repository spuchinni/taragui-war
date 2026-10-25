/* ---------- Mapas de Entreguerras (1919–1938) ----------
   Usan el mismo generador que los frentes de la 1ª Guerra (gm1-mapas.js) con otras opciones: sin trincheras o con trincheras
   angostas sin alambre, acequias de riego, cerros, pueblos encalados de Castilla y Aragón, olivares y el monte del Chaco.
   Equipo 0 al sur, equipo 1 al norte. */
Object.assign(SPECIES,{
  olivo:{tr:.22,th:1.3,crown:()=>new THREE.IcosahedronGeometry(1.9,1),cs:[1,.62,1],cy:2.4,col:[0x6b7652,0x75805c,0x626d4a]},
  quebracho:{tr:.3,th:4.2,crown:()=>new THREE.IcosahedronGeometry(3.2,1),cs:[1.25,.55,1.25],cy:6.0,col:[0x3f4e2a,0x485830,0x3a4826]},
  espinillo:{tr:.12,th:1.2,crown:()=>new THREE.IcosahedronGeometry(1.4,0),cs:[1.2,.6,1.2],cy:1.9,col:[0x5a6634,0x66703c,0x525c30]}
});
const IW_CAST={walls:[0xe9e3d3,0xdcd2b8,0xcdb88f,0xe2d6bc],roofs:[0xa0522d,0x8f4a2a,0x9c5a3a,0xab6440]};
Object.assign(WW1_CFG,{
  sesena:{seed:1936,era:2,label:'Seseña (Toledo, 1936)',desc:'29 de octubre de 1936: el primer combate de tanques de la Guerra Civil Española. Los T-26 soviéticos del capitán Arman entran al pueblo encalado en medio de la llanura de La Sagra.',
    bx:175,bz:155,sky:0xc3c6c2,fog:[150,480],ground:['#a8916a','#9a835c','#b39c74','#8c7650'],grass:.15,craters:25,crR:[1,2.5],front:60,noTrench:1,churn:.1,deadTrees:0,
    village:{x:0,z:12,n:30,ruin:.08,r:36,name:'Seseña',church:1,...IW_CAST},hamlet:{x:110,z:-30,n:5,ruin:0,r:12,...IW_CAST},
    woods:[{x:-105,z:-15,r:36,n:140,dead:0,sp:['olivo']},{x:100,z:45,r:28,n:90,dead:0,sp:['olivo']}],
    zones:[{id:'A',x:-105,z:-15,r:19,label:'El olivar'},{id:'B',x:0,z:12,r:19,label:'Seseña'},{id:'C',x:110,z:-30,r:17,label:'Casa de labor'}]},
  jarama:{seed:1937,era:2,label:'Jarama: el Pingarrón (1937)',desc:'Febrero de 1937: la batalla por la carretera de Valencia. Trincheras en las lomas, olivares, el cerro del Pingarrón y los tanques de los dos bandos peleando por cada colina.',
    bx:175,bz:155,sky:0xb8bebc,fog:[130,440],ground:['#8a7d55','#7d724c','#968a62','#6e6644'],grass:.55,craters:140,crR:[1,3.5],front:62,tw:[1.4,1.5],td:1.5,wire:[0,0],ridge:5,
    hills:[{x:-20,z:55,r:45,h:9},{x:120,z:-20,r:30,h:5}],deadTrees:6,churn:.4,
    village:{x:105,z:-15,n:10,ruin:.35,r:20,name:'San Martín de la Vega',...IW_CAST},
    woods:[{x:-110,z:-10,r:34,n:150,dead:.05,sp:['olivo']},{x:-15,z:50,r:24,n:60,dead:.1,sp:['olivo','espinillo']},{x:60,z:-80,r:22,n:60,dead:0,sp:['olivo']}],
    zones:[{id:'A',x:-110,z:-10,r:19,label:'Olivares'},{id:'B',x:-20,z:52,r:19,label:'El Pingarrón'},{id:'C',x:105,z:-15,r:18,label:'San Martín'}]},
  ebro:{seed:1937.8,era:2,label:'Fuentes de Ebro (1937)',desc:'13 de octubre de 1937: los BT-5 del Regimiento Internacional cargan con la infantería encima a través de campos de riego. Las acequias los frenan y los cañones antitanque los esperan junto a la azucarera.',
    bx:175,bz:155,sky:0xbfc4c0,fog:[140,460],ground:['#7d7a52','#6f6d48','#8b885e','#646240'],grass:.8,craters:60,crR:[1,3],front:60,tw:[1.4,1.4],td:1.4,wire:[0,1],trenchSides:[1],churn:.2,deadTrees:0,
    ditches:[[[-200,-30],[200,-26]],[[-200,25],[200,30]],[[-60,-160],[-55,160]],[[70,-160],[66,160]]],
    village:{x:-10,z:70,n:22,ruin:.25,r:28,name:'Fuentes de Ebro',church:1,...IW_CAST},hamlet:{x:110,z:5,n:4,ruin:.2,r:10,sz:1.8,hz:1.4,walls:[0xb07a56,0xa06c4a],roofs:[0x6a4a3a]},
    woods:[{x:-120,z:0,r:22,n:60,dead:0,sp:['alamo']}],poplars:1,
    zones:[{id:'A',x:-120,z:0,r:18,label:'Choperas'},{id:'B',x:-10,z:70,r:19,label:'Fuentes de Ebro'},{id:'C',x:110,z:5,r:17,label:'La azucarera'}]},
  chaco:{seed:1933,era:2,label:'Gran Chaco: Nanawa (1933)',desc:'Guerra del Chaco entre Bolivia y Paraguay. Los Vickers bolivianos atacan los fortines paraguayos de Nanawa a través del monte: quebrachos, espinillos, picadas angostas y un calor de 45 °C.',
    bx:175,bz:155,sky:0xc9c3b2,fog:[110,380],ground:['#8a6a4a','#7a5c3e','#94744f','#6e5236'],grass:.9,craters:40,crR:[1,2.5],front:58,tw:[1.3,1.3],td:1.4,wire:[0,1],trenchSides:[1],churn:.1,deadTrees:0,
    village:{x:0,z:85,n:9,ruin:.2,r:20,name:'Fortín Nanawa',sz:.7,hz:.6,walls:[0xa8845e,0x9a7a56],roofs:[0x8a7a52,0x7a6a48]},
    woods:[{x:-110,z:10,r:48,n:260,dead:.05,sp:['quebracho','quebracho','espinillo']},{x:110,z:-10,r:48,n:260,dead:.05,sp:['quebracho','espinillo','espinillo']},
      {x:0,z:-60,r:30,n:90,dead:0,sp:['espinillo','quebracho']},{x:-40,z:30,r:20,n:60,dead:0,sp:['espinillo']}],
    zones:[{id:'A',x:-110,z:10,r:19,label:'Picada oeste'},{id:'B',x:0,z:85,r:19,label:'Fortín Nanawa'},{id:'C',x:110,z:-10,r:18,label:'Aguada'}]}
});
for(const k of ['sesena','jarama','ebro','chaco']){ const C=ww1Big(WW1_CFG[k]);
  WORLDS[k]={key:k,label:C.label,desc:C.desc,era:2,ww1:true,bx:C.bx,bz:C.bz,sky:C.sky,fog:C.fog,dust:0x8a7a5a,cfg:C,
    h:(x,z)=>ww1Sample(WORLDS[k],x,z),zones:C.zones,
    spawns:{0:[{label:'Base oeste',x:-90,z:-C.spawnZ},{label:'Base este',x:90,z:-C.spawnZ}],
            1:[{label:'Retaguardia oeste',x:-90,z:C.spawnZ},{label:'Retaguardia este',x:90,z:C.spawnZ}]}}; }
