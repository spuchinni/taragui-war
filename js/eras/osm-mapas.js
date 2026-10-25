/* ---------- Mapas reales a escala 1:1 (Guerra Fría): calles, edificios, agua y relieve de OpenStreetMap ----------
   Los datos los arma herramientas/osm/bajar.py en js/osm/<mapa>.json (© colaboradores de OpenStreetMap, ODbL).
   Coordenadas del juego: x = oeste, z = norte (igual que toW). En los datos: x = este, z = norte, en decímetros.
   Donde OSM no tiene edificios (casi todo Corrientes) las manzanas se completan con casas sobre las calles reales. */
const OSM_CACHE={};
function osmData(key){
  if(OSM_CACHE[key]) return OSM_CACHE[key];
  const x=new XMLHttpRequest(); x.open('GET','js/osm/'+key+'.json?v='+(window.GAME_V||''),false); x.send(); // síncrono: buildWorld no espera
  return OSM_CACHE[key]=JSON.parse(x.responseText);
}
// se bajan de fondo al rato de abrir el juego, así la partida no espera
function osmPrefetch(){ let d=0; for(const k in OSM_CFG){ if(OSM_CACHE[k]) continue; setTimeout(()=>fetch('js/osm/'+k+'.json?v='+(window.GAME_V||'')).then(r=>r.ok?r.json():null).then(j=>{ if(j&&!OSM_CACHE[k]) OSM_CACHE[k]=j; }).catch(()=>{}),d+=700); } }
setTimeout(osmPrefetch,5000);

const OSM_AREAS=['bosque','monte','pasto','parque','campo','cancha','arena','banado','cementerio','estacionamiento','industrial','barrio','comercio','roca','nieve','pista','plaza','golf','turba'];
const OSM_ROADS=['motorway','trunk','primary','secondary','tertiary','unclassified','residential','living_street','service','track','pedestrian','footway','path','cycleway','steps','road','rail','runway','taxiway','dam'];
const OSM_CAR=new Set([0,1,2,3,4,5,6,7,8,9,15,17,18,19]);        // por donde andan autos y tanques (la IA)
const OSM_FRONT=new Set([2,3,4,5,6,7,15]);                 // calles con casas a los costados
const OSM_NOBUILD=new Set([3,5,7,8,9,15,16,17]);           // plazas, canchas, bañados, cementerios, playas de estacionamiento, pistas, golf
const OSM_COL={bosque:'#4d5e34',monte:'#6f7444',pasto:'#7d8a4c',parque:'#5f7a3c',campo:'#9c9361',cancha:'#5c8a3e',arena:'#cdbb8a',banado:'#5d6b4a',cementerio:'#7f8a64',
  estacionamiento:'#77746c',industrial:'#8f877a',barrio:'#8d8a70',comercio:'#8f8a7c',roca:'#8a8478',nieve:'#e8ecef',pista:'#7a7a76',plaza:'#a39a86',golf:'#6f9a4a',turba:'#7a6e4a'};

// Configuración de cada mapa: zonas y bases en coordenadas del juego (x = oeste, z = norte)
const OSM_CFG={
  centro:{label:'Corrientes, centro',desc:'El centro real de Corrientes, a escala: Plaza Torrent, la Catedral, Plaza Libertad, la rotonda de Plaza España y las avenidas Pedro Ferré y 3 de Abril. Manzanas de 86 m y combate calle por calle.',
    sky:0xbcc4c8,fog:[260,820],urban:1,ground:'#8b8770',pisos:[1,1,2,2,2,3,3,4,5,8,12],fill:{p:.97,row2:.85,fr:[7,15],dp:[11,20],gap:[0,.5]},
    sp:{calle:['lapacho','jacaranda','lapacho','timbo','ceibo'],parque:['lapacho','jacaranda','pindo','timbo','ceibo'],bosque:['timbo','algarrobo','lapacho']},calleArb:.35,
    zones:[{id:'A',x:600,z:-51,r:22,label:'Plaza Torrent'},{id:'B',x:48,z:20,r:20,label:'San Martín y Paraguay'},{id:'C',x:-455,z:67,r:22,label:'Plaza Libertad'}],
    spawns:{0:[{label:'Base sur, Av. Pedro Ferré',x:150,z:-655},{label:'Base sudeste, Av. Pedro Ferré',x:-350,z:-655}],
            1:[{label:'Base norte, Carlos Pellegrini',x:150,z:660},{label:'Base noreste, Plaza España',x:-350,z:660}]}},
  costanera:{label:'Costanera de Corrientes',desc:'La Avenida Costanera General San Martín a lo largo del Paraná, el Parque Camba Cuá, el Paseo Arazaty y la cabecera del Puente General Belgrano, a escala real.',
    sky:0xb8c4c8,fog:[260,820],urban:1,ground:'#8b8770',pisos:[1,1,2,2,2,3,4,6,10],fill:{p:.95,row2:.8,fr:[7,15],dp:[11,20],gap:[0,.6]},deckH:28,shoreSand:0,waterCol:[86,96,82],waterHex:0x4e5c52,
    sp:{calle:['lapacho','jacaranda','lapacho','timbo','ceibo','pindo'],parque:['lapacho','jacaranda','pindo','timbo','ceibo'],bosque:['timbo','ceibo','algarrobo']},calleArb:.35,
    zones:[{id:'A',x:560,z:-540,r:24,label:'Cabecera del puente'},{id:'B',x:450,z:0,r:22,label:'Costanera, Padre Lavagna'},{id:'C',x:-120,z:447,r:24,label:'Parque Camba Cuá'}],
    spawns:{0:[{label:'Base sur, Av. 3 de Abril',x:-200,z:-690},{label:'Base sudoeste, Elías Abad',x:100,z:-690}],
            1:[{label:'Base norte, 25 de Mayo',x:-420,z:640},{label:'Base noreste, La Merced',x:-640,z:500}]}},
  rotonda:{label:'Ruta 12 y Av. Independencia',desc:'La rotonda de la Ruta 12 y Av. Independencia, la plaza del Mercosur, los barrios del oeste, la cancha de Boca Unidos y los descampados con lagunas del otro lado de la ruta. Calles reales, a escala.',
    sky:0xbcc6c8,fog:[260,820],urban:1,ground:'#83864f',pisos:[1,1,1,1,2,2,3],fill:{p:.9,row2:.6,fr:[7,13],dp:[9,16],gap:[.4,3]},pitch:.15,
    sp:{calle:['lapacho','jacaranda','timbo','ceibo','pindo'],parque:['lapacho','jacaranda','pindo','timbo'],bosque:['timbo','algarrobo','espinillo'],monte:['espinillo','algarrobo']},calleArb:.3,
    zones:[{id:'A',x:144,z:390,r:24,label:'Plaza del Mercosur'},{id:'B',x:-108,z:-29,r:22,label:'Ruta 12, Hotel Hawai'},{id:'C',x:-128,z:-540,r:24,label:'Cancha de Boca Unidos'}],
    spawns:{0:[{label:'Base oeste, Perito Moreno',x:600,z:-200},{label:'Base noroeste, Necochea',x:620,z:250}],
            1:[{label:'Base este, Av. Armando Romero',x:-600,z:150},{label:'Base sudeste, descampado',x:-620,z:-200}]}},
  cordillera:{label:'Paso Cristo Redentor',desc:'El paso real a 3.832 m entre Mendoza y Chile: el Cristo Redentor de los Andes en la cumbre, el camino de cornisa argentino y los caracoles del lado chileno. Laderas que muchos tanques no pueden subir.',
    propK:.1,sky:0xc8d4dc,fog:[420,1150],ground:'#8a7f6c',nieve:240,smooth:1,step:4,talud:7,eastNat:['ar','ctes'],
    sp:{calle:['tojo'],parque:['tojo'],bosque:['tojo']},
    hitos:o=>osmEstatua(o.poi('Monumento del Cristo'),{base:7,ped:9,alto:7,col:0x5a5246,rot:-1.2}),
    zones:[{id:'A',x:397,z:324,r:24,label:'Camino argentino'},{id:'B',x:-4,z:2,r:26,label:'Al pie del Cristo'},{id:'C',x:191,z:-252,r:24,label:'Caracoles chilenos'}],
    spawns:{east:[{label:'Mendoza, Acceso al Cristo',x:291,z:700},{label:'Mendoza, cornisa',x:357,z:493}],
            west:[{label:'Chile, caracoles',x:494,z:-464},{label:'Chile, Portillo',x:76,z:-668}]}},
  carrefour:{label:'Av. Independencia (Carrefour)',desc:'Av. Independencia de doble mano entre el Carrefour, el Cinemacenter y el Hospital Pediátrico, con los barrios Villa Celia, Santa Teresita y Villa Chiquita a cada lado. Calles reales, a escala.',
    sky:0xbcc6c8,fog:[260,820],urban:1,ground:'#83864f',pisos:[1,1,1,2,2,3,4],fill:{p:.93,row2:.7,fr:[7,14],dp:[10,17],gap:[0,2]},pitch:.08,
    sp:{calle:['lapacho','jacaranda','timbo','ceibo','pindo'],parque:['lapacho','jacaranda','pindo','timbo'],bosque:['timbo','algarrobo']},calleArb:.32,
    zones:[{id:'A',x:350,z:100,r:24,label:'Carrefour'},{id:'B',x:0,z:-30,r:22,label:'Av. Independencia'},{id:'C',x:-576,z:-413,r:22,label:'Monte de los Olivos'}],
    spawns:{0:[{label:'Base sur, Villa Chiquita',x:0,z:-690},{label:'Base sudoeste, Santa Teresita',x:350,z:-690}],
            1:[{label:'Base norte, Comisaría 5.ª',x:150,z:690},{label:'Base noreste, Shopping',x:-300,z:690}]}},
  aeropuerto:{label:'Ruta 12, aeropuerto',desc:'El Aeropuerto Piragine Niveyro con su pista, el Corsódromo Nolo Alías, la Ruta 12 y el cruce de La Reina. Mucho campo abierto: combate a larga distancia.',
    bx:800,sky:0xbcc6c8,fog:[300,900],urban:1,ground:'#7f8a4c',pisos:[1,1,1,2],fill:{p:.85,row2:.5,fr:[7,13],dp:[9,15],gap:[1,4]},pitch:.15,rural:.15,
    sp:{calle:['lapacho','timbo','ceibo','pindo'],parque:['lapacho','jacaranda','pindo','timbo'],bosque:['timbo','algarrobo','espinillo'],monte:['espinillo','algarrobo']},calleArb:.2,
    zones:[{id:'A',x:492,z:-457,r:26,label:'Terminal del aeropuerto'},{id:'B',x:-200,z:-120,r:26,label:'Corsódromo'},{id:'C',x:-600,z:-330,r:24,label:'Cruce de La Reina'}],
    spawns:{0:[{label:'Base oeste, pista',x:720,z:0},{label:'Base sudoeste, cabecera de pista',x:650,z:-650}],
            1:[{label:'Base este, Ruta 12',x:-720,z:100},{label:'Base sudeste, barrio',x:-650,z:-650}]}},
  lagunabrava:{label:'Laguna Brava',desc:'El pueblo de Laguna Brava, en las afueras de Corrientes, con la laguna al norte, la Ruta 12, la plaza 6 de Mayo y las quintas alrededor. La costa tiene juncos y se puede vadear.',
    sky:0xbcc8c4,fog:[300,900],urban:1,ground:'#7d8a4c',pisos:[1,1,1,2],fill:{p:.8,row2:.45,fr:[7,12],dp:[9,14],gap:[1,6]},pitch:.25,rural:.12,shoreSand:6,depth:3.5,waterCol:[78,98,84],waterHex:0x4a5e52,
    sp:{calle:['lapacho','timbo','ceibo','pindo','espinillo'],parque:['lapacho','jacaranda','pindo','timbo'],bosque:['timbo','algarrobo','espinillo'],monte:['espinillo','algarrobo']},calleArb:.25,
    zones:[{id:'A',x:325,z:-310,r:24,label:'Plaza 6 de Mayo'},{id:'B',x:-29,z:105,r:24,label:'Costa de la laguna'},{id:'C',x:-433,z:0,r:24,label:'Quintas del este'}],
    spawns:{0:[{label:'Base oeste, Ruta 12',x:600,z:60},{label:'Base sudoeste, pueblo',x:500,z:-560}],
            1:[{label:'Base este, quintas',x:-620,z:100},{label:'Base sudeste, campo',x:-560,z:-500}]}},
  pasopatria:{label:'Paso de la Patria',desc:'El pueblo de pescadores frente al Paraná, casa por casa como es: la costanera, la playa, la plaza central, la Prefectura y los barrios Esperanza y Malvinas.',
    sky:0xb8c6c8,fog:[280,860],urban:1,ground:'#80864e',pisos:[1,1,1,1,2],fill:{p:.7,row2:.3,fr:[7,12],dp:[9,14],gap:[1,6]},pitch:.3,rural:.1,shoreSand:14,waterCol:[86,96,82],waterHex:0x4e5c52,
    sp:{calle:['lapacho','timbo','ceibo','pindo','jacaranda'],parque:['lapacho','jacaranda','pindo','timbo'],bosque:['timbo','ceibo','algarrobo']},calleArb:.3,
    zones:[{id:'A',x:502,z:296,r:24,label:'Prefectura, costanera'},{id:'B',x:58,z:154,r:26,label:'Plaza del pueblo'},{id:'C',x:8,z:-414,r:24,label:'Barrio Esperanza'}],
    spawns:{0:[{label:'Base oeste, terminal',x:650,z:-450},{label:'Base sudoeste, acceso',x:300,z:-690}],
            1:[{label:'Base este, Barrio Malvinas',x:-650,z:200},{label:'Base sudeste, 30 Viviendas',x:-600,z:-300}]}},
  itati:{label:'Itatí',desc:'La Basílica de Nuestra Señora de Itatí y su cúpula de 80 m sobre la barranca del Paraná, el pueblo manzana por manzana, la terminal y la plaza Ex Combatiente Guillermo Núñez.',
    sky:0xbac6ca,fog:[280,860],urban:1,ground:'#80864e',pisos:[1,1,1,1,2],fill:{p:.7,row2:.3,fr:[7,12],dp:[9,14],gap:[1,6]},pitch:.3,rural:.1,shoreSand:6,waterCol:[86,96,82],waterHex:0x4e5c52,
    sp:{calle:['lapacho','timbo','ceibo','pindo','jacaranda'],parque:['lapacho','jacaranda','pindo','timbo'],bosque:['timbo','ceibo','algarrobo']},calleArb:.3,
    hitos:o=>osmCupula(o.poi('Basílica'),{cuerpo:20,tambor:16,r:14,radio:90,col:0x5d7f9c}),
    zones:[{id:'A',x:-15,z:330,r:26,label:'Plaza de la Basílica'},{id:'B',x:-108,z:-163,r:24,label:'Terminal de ómnibus'},{id:'C',x:530,z:-141,r:24,label:'Plaza Ex Combatiente Núñez'}],
    spawns:{0:[{label:'Base sur, acceso',x:100,z:-680},{label:'Base sudoeste, bomberos',x:500,z:-620}],
            1:[{label:'Base este, costa',x:-620,z:420},{label:'Base este, barrio',x:-650,z:-50}]}},
  malvinas:{label:'Puerto Argentino y Sapper Hill',desc:'El oeste de Puerto Argentino frente a la bahía, el Museo, el Monumento a la Batalla y el camino a Sapper Hill, donde se peleó el 14 de junio de 1982. Turba y piedra, sin árboles.',
    propK:.35,sky:0xa7b1b6,fog:[260,820],ground:'#7d7a52',pisos:[1,1,2],fill:{p:.25,row2:.1,fr:[7,11],dp:[8,12],gap:[3,10]},pitch:.8,rural:.05,aguaAlta:3,waterCol:[70,88,96],waterHex:0x3e5a6a,walls:[0xe8e4dc,0xd8dce0,0xe6d8c0,0xc8d4d8,0xf0ece4],roofs:[0x9a2f2a,0x3f5a6a,0x5a6a3a,0x7a7e80,0xa04030],
    sp:{calle:['tojo'],parque:['tojo','tussac'],bosque:['tojo'],monte:['tojo']},
    zones:[{id:'A',x:53,z:-379,r:28,label:'Sapper Hill'},{id:'B',x:-245,z:-216,r:24,label:'Cruce del camino a Darwin'},{id:'C',x:-94,z:600,r:24,label:'Museo, Ross Road'}],
    spawns:{east:[{label:'Puerto Argentino, Falkland College',x:-600,z:330},{label:'Puerto Argentino, oeste',x:350,z:500}],
            west:[{label:'Ladera de Sapper Hill',x:450,z:-640},{label:'Camino a Darwin',x:144,z:-692}]}},
  puente:{label:'Corrientes – Resistencia',desc:'El Puente General Belgrano real: 1,7 km sobre el Paraná entre la costanera de Corrientes y la orilla chaqueña. Es el único paso entre las dos ciudades.',
    bx:1120,bz:430,sky:0xb8c4c8,fog:[300,950],urban:1,ground:'#80864e',pisos:[1,1,2,2,3,4],fill:{p:.9,row2:.6,fr:[7,14],dp:[10,17],gap:[0,2]},deckH:30,shoreSand:0,waterCol:[86,96,82],waterHex:0x4e5c52,eastNat:['ar','ctes'],
    sp:{calle:['lapacho','jacaranda','timbo','ceibo','pindo'],parque:['lapacho','jacaranda','pindo','timbo','ceibo'],bosque:['timbo','ceibo','algarrobo']},calleArb:.3,
    zones:[{id:'A',x:-868,z:20,r:24,label:'Cabecera Corrientes'},{id:'B',x:0,z:0,r:16,label:'Centro del puente'},{id:'C',x:887,z:20,r:24,label:'Cabecera chaqueña'}],
    spawns:{east:[{label:'Corrientes, Av. Costanera',x:-1050,z:150},{label:'Corrientes, Plaza Pedro Arambulo',x:-1000,z:330}],
            west:[{label:'Chaco, Ruta 16',x:1000,z:150},{label:'Chaco, costa',x:1000,z:-150}]}},
  posadas:{label:'Posadas – Encarnación',desc:'El puente internacional San Roque González de Santa Cruz real, 2,5 km sobre el Paraná, entre el Parque San José de Posadas y la costanera de Encarnación.',
    bx:1480,bz:520,sky:0xb8c4c8,fog:[300,950],urban:1,ground:'#80864e',pisos:[1,1,2,2,3,4],fill:{p:.9,row2:.6,fr:[7,14],dp:[10,17],gap:[0,2]},deckH:28,waterCol:[86,96,82],waterHex:0x4e5c52,eastNat:['ar','ctes'],
    sp:{calle:['lapacho','jacaranda','timbo','ceibo','pindo'],parque:['lapacho','jacaranda','pindo','timbo','ceibo'],bosque:['timbo','ceibo','algarrobo']},calleArb:.3,
    zones:[{id:'A',x:-1244,z:-12,r:24,label:'Cabecera Posadas'},{id:'B',x:0,z:0,r:16,label:'Centro del puente'},{id:'C',x:1206,z:-12,r:24,label:'Cabecera Encarnación'}],
    spawns:{east:[{label:'Posadas, Parque San José',x:-1393,z:-249},{label:'Posadas, Gendarmería',x:-1418,z:-100}],
            west:[{label:'Encarnación, Plaza San Jorge',x:1368,z:-298},{label:'Encarnación, costanera',x:1293,z:-50}]}},
  salto:{label:'Represa de Salto Grande',desc:'La represa real sobre el río Uruguay: 2,5 km de camino sobre el paredón entre Concordia y Salto, con el lago arriba y el río abajo. Es el único cruce.',
    bx:1250,bz:420,propK:.3,sky:0xb8c4c8,fog:[320,1000],ground:'#7d8a4c',deckH:12,waterCol:[74,92,92],waterHex:0x46606a,eastNat:['uy'],
    sp:{calle:['timbo','espinillo'],parque:['timbo','ceibo'],bosque:['timbo','algarrobo','espinillo'],monte:['espinillo','algarrobo']},
    extra:o=>osmPresa({...o,ancho:28}),
    zones:[{id:'A',x:647,z:216,r:26,label:'Cabecera Concordia'},{id:'B',x:0,z:259,r:22,label:'Sobre la represa'},{id:'C',x:-863,z:216,r:26,label:'Cabecera Salto'}],
    spawns:{west:[{label:'Concordia, monte',x:1078,z:-108},{label:'Concordia, Ruta 14',x:863,z:-323}],
            east:[{label:'Salto, Ruta 3',x:-1078,z:-108},{label:'Salto sur',x:-863,z:-323}]}}
};

const osmW=(D,v)=>-v/10, osmZ=v=>v/10; // datos (dm, x = este) -> juego (m, x = oeste)

function buildOSM(key){
  const C=OSM_CFG[key], D=osmData(key), R=mulberry(([...key].reduce((a,c)=>a*31+c.charCodeAt(0),7)>>>0)), rr=(a,b)=>a+R()*(b-a), pick=a=>a[(R()*a.length)|0];
  const EX=D.ex, EZ=D.ez, bx=W.bx, bz=W.bz; W.ex=EX; W.ez=EZ;
  // ---- relieve: grilla de los datos (suavizada) -> grilla de 2 m con el agua ----
  const E=D.elev, enx=E.nx, enz=E.nz, ER=E.r; let ev=Float32Array.from(E.d,v=>v/10);
  for(let pass=0;pass<(C.smooth??2);pass++){ const o=new Float32Array(ev.length); for(let j=0;j<enz;j++) for(let i=0;i<enx;i++){ let s=0,n=0;
      for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){ const a=i+di, b=j+dj; if(a<0||b<0||a>=enx||b>=enz) continue; s+=ev[b*enx+a]; n++; } o[j*enx+i]=s/n; } ev=o; }
  const baseH=(e,n)=>{ const fx=clamp((e+EX)/ER,0,enx-1.001), fz=clamp((n+EZ)/ER,0,enz-1.001), i=fx|0, j=fz|0, u=fx-i, v=fz-j;
    return ev[j*enx+i]*(1-u)*(1-v)+ev[j*enx+i+1]*u*(1-v)+ev[(j+1)*enx+i]*(1-u)*v+ev[(j+1)*enx+i+1]*u*v; };
  const RG=2, nx=Math.round(2*EX/RG)+1, nz=Math.round(2*EZ/RG)+1, HG=new Float32Array(nx*nz), WM=new Uint8Array(nx*nz);
  if(D.agua){ let k=0,v=0; for(const n of D.agua.rle){ if(v) WM.fill(1,k,Math.min(WM.length,k+n)); k+=n; v^=1; } }
  // charcos y arroyos muy por encima del nivel del agua principal (turba, montaña): quedan como tierra, si no serían pozos
  if(D.agua) for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){ const k=j*nx+i; if(WM[k]&&baseH(-EX+i*RG,-EZ+j*RG)>(C.aguaAlta||4)) WM[k]=0; }
  const hasW=!!D.agua&&WM.some(v=>v);
  const dist=(want)=>{ const d=new Float32Array(nx*nz); for(let k=0;k<d.length;k++) d[k]=WM[k]===want?1e6:0; // distancia (en m) a la celda más cercana del otro tipo
    for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){ const k=j*nx+i; if(!d[k]) continue; let m=d[k]; if(i) m=Math.min(m,d[k-1]+RG); if(j) m=Math.min(m,d[k-nx]+RG); if(i&&j) m=Math.min(m,d[k-nx-1]+RG*1.41); if(j&&i<nx-1) m=Math.min(m,d[k-nx+1]+RG*1.41); d[k]=m; }
    for(let j=nz-1;j>=0;j--) for(let i=nx-1;i>=0;i--){ const k=j*nx+i; if(!d[k]) continue; let m=d[k]; if(i<nx-1) m=Math.min(m,d[k+1]+RG); if(j<nz-1) m=Math.min(m,d[k+nx]+RG); if(i<nx-1&&j<nz-1) m=Math.min(m,d[k+nx+1]+RG*1.41); if(j<nz-1&&i) m=Math.min(m,d[k+nx-1]+RG*1.41); d[k]=m; }
    return d; };
  const dW=hasW?dist(1):null, dL=hasW?dist(0):null;
  // calles talladas en el relieve: el ancho de la calle queda a la altura de su eje (en la montaña, caminos de cornisa transitables)
  const BH=new Float32Array(nx*nz); for(let j=0;j<nz;j++) for(let i=0;i<nx;i++) BH[j*nx+i]=baseH(-EX+i*RG,-EZ+j*RG);
  if(C.aplanar!==0) for(const r of D.calles){ if(r[2]&3||[11,12,13,14,16].includes(r[0])) continue; const w=r[1]/10, m=w/2+(C.talud||5); for(let q=5;q<r.length-2;q+=2){
      const ae=r[q]/10, an=r[q+1]/10, be=r[q+2]/10, bn=r[q+3]/10, ha=baseH(ae,an), hb=baseH(be,bn), dx=be-ae, dn=bn-an, l=dx*dx+dn*dn; if(!l) continue;
      const i0=Math.max(0,Math.floor((Math.min(ae,be)-m+EX)/RG)), i1=Math.min(nx-1,Math.ceil((Math.max(ae,be)+m+EX)/RG)), j0=Math.max(0,Math.floor((Math.min(an,bn)-m+EZ)/RG)), j1=Math.min(nz-1,Math.ceil((Math.max(an,bn)+m+EZ)/RG));
      for(let j=j0;j<=j1;j++) for(let i=i0;i<=i1;i++){ const e=-EX+i*RG, n=-EZ+j*RG; let t=((e-ae)*dx+(n-an)*dn)/l; t=t<0?0:t>1?1:t; const d=Math.hypot(e-ae-dx*t,n-an-dn*t); if(d>=m) continue;
        const hc=ha+(hb-ha)*t, f=d<w/2+1?1:1-(d-w/2-1)/(m-w/2-1), k=j*nx+i; BH[k]=BH[k]+(hc-BH[k])*f; } } }
  for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){ const k=j*nx+i, e=-EX+i*RG, n=-EZ+j*RG; let h=BH[k];
    if(hasW){ if(WM[k]) h=-Math.min(C.depth||5,.7+dW[k]*.09); else h=Math.max(h,.45+Math.min(dL[k],25)*.03); }
    HG[k]=h; }
  const hg=(x,z)=>{ const fx=clamp((-x+EX)/RG,0,nx-1.001), fz=clamp((z+EZ)/RG,0,nz-1.001), i=fx|0, j=fz|0, u=fx-i, v=fz-j;
    return HG[j*nx+i]*(1-u)*(1-v)+HG[j*nx+i+1]*u*(1-v)+HG[(j+1)*nx+i]*(1-u)*v+HG[(j+1)*nx+i+1]*u*v; };
  const wetAt=(x,z)=>{ if(!hasW) return false; const i=Math.round((-x+EX)/RG), j=Math.round((z+EZ)/RG); return i>=0&&j>=0&&i<nx&&j<nz&&WM[j*nx+i]===1; };
  W.water=hasW?0:undefined;
  // ---- calles (en metros del juego) ----
  const roads=D.calles.map(r=>{ const pts=[]; for(let i=5;i<r.length;i+=2) pts.push([osmW(D,r[i]),osmZ(r[i+1])]); return {t:r[0],w:r[1]/10,br:!!(r[2]&1),tun:!!(r[2]&2),dirt:!!(r[2]&4),lay:r[3],name:r[4]>=0?D.nombres[r[4]]:'',pts}; });
  // ---- puentes: tableros por encima del agua o de otras calles ----
  const decks=[]; { const bl=roads.filter(L=>L.br&&(OSM_CAR.has(L.t)||L.t===16)&&L.pts.length>1);
    // une los tramos de un mismo puente (comparten punta)
    const used=new Set(); for(const L of bl){ if(used.has(L)) continue; used.add(L); let pts=L.pts.slice(), grow=true;
      while(grow){ grow=false; for(const M of bl){ if(used.has(M)||M.t!==L.t) continue; const a=M.pts[0], b=M.pts[M.pts.length-1], e=pts[pts.length-1], s=pts[0], near=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1])<1;
        if(near(e,a)){ pts=pts.concat(M.pts.slice(1)); } else if(near(e,b)){ pts=pts.concat(M.pts.slice(0,-1).reverse()); } else if(near(s,b)){ pts=M.pts.slice(0,-1).concat(pts); } else if(near(s,a)){ pts=M.pts.slice(1).reverse().concat(pts); } else continue; used.add(M); grow=true; } }
      const cum=[0]; for(let i=1;i<pts.length;i++) cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1])); const Lt=cum[cum.length-1]; if(Lt<6) continue;
      let wet=0; for(let s=0;s<=Lt;s+=4){ const p=polyAt(pts,cum,s); if(wetAt(p[0],p[1])) wet++; }
      const y0=hg(...pts[0])+.25, y1=hg(...pts[pts.length-1])+.25, over=wet>0, Hm=over?(C.deckH&&Lt>300?C.deckH:Math.min(7,2.2+Lt*.03)):(L.lay>0&&Lt>25?6.2:0);
      const ys=cum.map((s,i)=>{ const base=y0+(y1-y0)*s/Lt, rise=Math.min(Hm,Math.min(s,Lt-s)*(over?.075:.09)); return Math.max(base+rise,hg(...pts[i])+.25); });
      decks.push({pts,cum,ys,w:Math.max(L.w,L.t===16?4.5:6)+1.2,rail:L.t===16,over,name:L.name}); } }
  const DG=new Map(), dk=(x,z)=>Math.floor(x/16)*7919+Math.floor(z/16), dsegs=[];
  for(const Dk of decks) for(let i=0;i<Dk.pts.length-1;i++){ const S={ax:Dk.pts[i][0],az:Dk.pts[i][1],bx:Dk.pts[i+1][0],bz:Dk.pts[i+1][1],ya:Dk.ys[i],yb:Dk.ys[i+1],hw:Dk.w/2}; dsegs.push(S);
    for(let x=Math.floor((Math.min(S.ax,S.bx)-S.hw)/16);x<=Math.floor((Math.max(S.ax,S.bx)+S.hw)/16);x++) for(let z=Math.floor((Math.min(S.az,S.bz)-S.hw)/16);z<=Math.floor((Math.max(S.az,S.bz)+S.hw)/16);z++){ const k=x*7919+z; if(!DG.has(k)) DG.set(k,[]); DG.get(k).push(S); } }
  const deckAt=(x,z)=>{ const L=DG.get(dk(x,z)); if(!L) return null; let best=null; for(const S of L){ const dx=S.bx-S.ax, dz=S.bz-S.az, l=dx*dx+dz*dz; let t=l?((x-S.ax)*dx+(z-S.az)*dz)/l:0; t=clamp(t,0,1);
      if(Math.hypot(x-S.ax-dx*t,z-S.az-dz*t)<S.hw){ const y=S.ya+(S.yb-S.ya)*t; if(best===null||y>best) best=y; } } return best; };
  W.deckAt=decks.length?deckAt:null;
  W.h=(x,z)=>{ const g=hg(x,z); if(!decks.length) return g; const d=deckAt(x,z); return d!==null&&d>g?d:g; };
  W.under=decks.length?(x,z,y)=>{ const d=deckAt(x,z); if(d===null) return null; const g=hg(x,z)+(craters.length?craterH(x,z):0); return d-g>3.4&&y<d-3.2?g:null; }:null;
  W.groundH=hg;
  // ---- usos del suelo: raster de 2 m para saber qué hay en cada lugar ----
  const KR=2, knx=Math.ceil(2*EX/KR), knz=Math.ceil(2*EZ/KR), kc=document.createElement('canvas'); kc.width=knx; kc.height=knz; const kx=kc.getContext('2d');
  const kp=(x,z)=>[(EX-x)/KR,(EZ-z)/KR]; // x del juego = oeste -> a la derecha va el este
  const areas=D.areas.map(a=>{ const pts=[]; for(let i=2;i<a.length;i+=2) pts.push([osmW(D,a[i]),osmZ(a[i+1])]); let A=0; for(let i=0,j=pts.length-1;i<pts.length;j=i++) A+=pts[j][0]*pts[i][1]-pts[i][0]*pts[j][1]; return {k:OSM_AREAS[a[0]],ki:a[0],pier:a[1]===1,pts,A:Math.abs(A)/2}; }).sort((a,b)=>b.A-a.A);
  for(const A of areas){ kx.fillStyle=`rgb(${(A.ki+1)*12},0,0)`; kx.beginPath(); A.pts.forEach((p,i)=>i?kx.lineTo(...kp(...p)):kx.moveTo(...kp(...p))); kx.fill(); }
  kx.lineCap='round'; kx.lineJoin='round';
  for(const L of roads){ if(L.tun) continue; kx.strokeStyle=OSM_CAR.has(L.t)||L.t===16||L.t>=17?'rgb(0,255,0)':'rgb(0,128,0)'; kx.lineWidth=L.w/KR; kx.globalCompositeOperation='lighter'; kx.beginPath(); L.pts.forEach((p,i)=>i?kx.lineTo(...kp(...p)):kx.moveTo(...kp(...p))); kx.stroke(); kx.globalCompositeOperation='source-over'; }
  const KD=kx.getImageData(0,0,knx,knz).data;
  const kindAt=(x,z)=>{ const i=((EX-x)/KR)|0, j=((EZ-z)/KR)|0; if(i<0||j<0||i>=knx||j>=knz) return null; const r=KD[(j*knx+i)*4]; return r%12===0&&r?OSM_AREAS[r/12-1]:null; };
  const roadAt=(x,z)=>{ const i=((EX-x)/KR)|0, j=((EZ-z)/KR)|0; if(i<0||j<0||i>=knx||j>=knz) return 0; return KD[(j*knx+i)*4+1]; };
  // ---- segmentos de calles: autos, civiles, postes y caminos de la IA ----
  const inPlay=(x,z,m=0)=>Math.abs(x)<bx+m&&Math.abs(z)<bz+m;
  streetSegs=[]; for(const L of roads){ if(!OSM_CAR.has(L.t)||L.t===9||L.t===17||L.t===18||L.tun) continue; for(let i=0;i<L.pts.length-1;i++){ const [a,b]=[L.pts[i],L.pts[i+1]]; if(!inPlay(a[0],a[1],40)&&!inPlay(b[0],b[1],40)) continue; streetSegs.push({ax:a[0],az:a[1],bx:b[0],bz:b[1],w:L.w}); } }
  W.propK=C.propK||(C.urban?.45:.7); // postes y autos estacionados (menos en los mapas grandes; casi nada en la montaña)
  // ---- suelo pintado ----
  const TS=2048, TX=EX>=EZ?TS:Math.round(TS*EX/EZ), TZ=EZ>=EX?TS:Math.round(TS*EZ/EX), cv=document.createElement('canvas'); cv.width=TX; cv.height=TZ; const x=cv.getContext('2d');
  const px=X=>(EX-X)/(2*EX)*TX, py=Z=>(EZ-Z)/(2*EZ)*TZ, pm=TX/(2*EX), P=(X,Z)=>[px(X),py(Z)];
  x.fillStyle=C.ground||'#7d8a4c'; x.fillRect(0,0,TX,TZ); speckle(x,TX,TZ,60000,['rgba(0,0,0,.06)','rgba(255,255,255,.05)','rgba(60,50,30,.07)'],1,4);
  const poly=(pts)=>{ x.beginPath(); pts.forEach((p,i)=>i?x.lineTo(...P(...p)):x.moveTo(...P(...p))); x.closePath(); };
  for(const A of areas){ x.fillStyle=OSM_COL[A.k]||'#7d8a4c'; if(A.pier) x.fillStyle='#8a847a'; poly(A.pts); x.fill(); if(A.k==='cancha'){ x.strokeStyle='rgba(240,240,230,.7)'; x.lineWidth=.3*pm; x.stroke(); } }
  // pasto en los bordes de las calles y veredas (en la ciudad)
  x.lineCap='round'; x.lineJoin='round';
  const stroke=(L,w,col)=>{ x.strokeStyle=col; x.lineWidth=Math.max(1,w*pm); x.beginPath(); L.pts.forEach((p,i)=>i?x.lineTo(...P(...p)):x.moveTo(...P(...p))); x.stroke(); };
  const vis=roads.filter(L=>!L.tun);
  if(C.urban) for(const L of vis) if(OSM_FRONT.has(L.t)||L.t<5) stroke(L,L.w+3.6,'#b3ab9c');
  for(const L of vis) if(L.t===16){ stroke(L,3.4,'#7a6a58'); }
  for(const L of vis) if(L.t===17||L.t===18) stroke(L,L.w,'#6c6c68');
  for(const L of vis) if(L.t<16&&(L.dirt||L.t===9)) stroke(L,L.w,'#9b8564');
  for(const L of vis) if(L.t>=11&&L.t<=14&&!L.dirt) stroke(L,L.w,'#a8a295');
  for(const L of vis) if((L.t<11||L.t===15)&&!L.dirt&&L.t!==9) stroke(L,L.w+.6,'#3f3f3c');
  for(const L of vis) if((L.t<11||L.t===15)&&!L.dirt&&L.t!==9) stroke(L,L.w-.4,'#555450');
  for(const L of vis) if(L.t===19) stroke(L,L.w,'#9a968c');
  for(const L of vis) if(L.t===16){ x.setLineDash([.4*pm,.6*pm]); stroke(L,2.4,'#4a3a2c'); x.setLineDash([]); stroke(L,1.45,'#6e6e6e'); stroke(L,1.0,'#7a6a58'); }
  // líneas blancas: eje de las avenidas y pista
  x.setLineDash([3*pm,4*pm]); for(const L of vis) if(L.t<5&&!L.dirt&&L.w>=8) stroke(L,.35,'rgba(235,230,215,.8)'); x.setLineDash([]);
  for(const L of vis) if(L.t===17){ x.setLineDash([12*pm,10*pm]); stroke(L,1,'rgba(240,240,235,.9)'); x.setLineDash([]); }
  // agua y orillas
  let img=x.getImageData(0,0,TX,TZ); const id=img.data, wc=C.waterCol||[88,98,80], sand=C.shoreSand?[205,190,150]:null;
  if(hasW||C.nieve) for(let j=0;j<TZ;j++){ const Z=EZ-(j+.5)/TZ*2*EZ, gj=Math.round((Z+EZ)/RG); for(let i=0;i<TX;i++){ const X=EX-(i+.5)/TX*2*EX, gi=Math.round((-X+EX)/RG), k=gj*nx+gi; if(gi<0||gj<0||gi>=nx||gj>=nz) continue;
      const o=(j*TX+i)*4;
      if(C.nieve){ // nieve en lo alto y en las laderas suaves; roca en las empinadas
        const h=HG[k], sl=Math.abs(HG[Math.min(k+1,HG.length-1)]-h)+Math.abs(HG[Math.min(k+nx,HG.length-1)]-h), f=clamp((h-C.nieve)/80,0,1)*clamp(1.6-sl*.9,0,1)*(roadAt(X,Z)?.25:1);
        id[o]+=(238-id[o])*f; id[o+1]+=(242-id[o+1])*f; id[o+2]+=(246-id[o+2])*f; if(!hasW) continue; }
      if(WM[k]){ const d=Math.min(1,dW[k]/40); id[o]=wc[0]*(1-.3*d); id[o+1]=wc[1]*(1-.3*d); id[o+2]=wc[2]*(1-.25*d); }
      else if(sand&&dL[k]<C.shoreSand&&!roadAt(X,Z)){ const f=1-dL[k]/C.shoreSand; id[o]+=(sand[0]-id[o])*f; id[o+1]+=(sand[1]-id[o+1])*f; id[o+2]+=(sand[2]-id[o+2])*f; } } }
  x.putImageData(img,0,0); img=null;
  const tex=new THREE.CanvasTexture(cv); tex.anisotropy=ANISO; tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;
  // ---- terreno en sectores (con versión liviana de lejos) ----
  const step=C.step||3, xs=[], zs=[]; for(let v=-EX;v<EX;v+=step) xs.push(v); xs.push(EX); for(let v=-EZ;v<EZ;v+=step) zs.push(v); zs.push(EZ);
  const det=canvasTex(256,(c,s)=>{ c.fillStyle='#ffffff'; c.fillRect(0,0,s,s); speckle(c,s,s,9000,['#cfc8bc','#eae4da','#b8b0a2','#f6f2ea'],1,3); });
  const mat=new THREE.MeshLambertMaterial({map:tex});
  mat.onBeforeCompile=sh=>{ sh.uniforms.det={value:det}; sh.fragmentShader=sh.fragmentShader.replace('#include <map_pars_fragment>','#include <map_pars_fragment>\nuniform sampler2D det;')
    .replace('#include <map_fragment>',`#include <map_fragment>\n diffuseColor.rgb*=texture2D(det,vUv*vec2(${(EX*2/5).toFixed(1)},${(EZ*2/5).toFixed(1)})).rgb*.95;`); };
  const uvOf=(X,Z)=>[(EX-X)/(2*EX),(Z+EZ)/(2*EZ)];
  const CH=60; for(let i0=0;i0<xs.length-1;i0+=CH) for(let j0=0;j0<zs.length-1;j0+=CH){
    const X=xs.slice(i0,Math.min(xs.length,i0+CH+1)), Z=zs.slice(j0,Math.min(zs.length,j0+CH+1));
    const mk=(SX,SZ,dy)=>{ const g=new THREE.PlaneGeometry(1,1,SX.length-1,SZ.length-1); g.rotateX(-Math.PI/2); const pos=g.attributes.position, uv=g.attributes.uv;
      for(let i=0;i<pos.count;i++){ const a=SX[i%SX.length], b=SZ[(i/SX.length)|0]; pos.setXYZ(i,a,hg(a,b)-dy,b); uv.setXY(i,...uvOf(a,b)); } g.computeVertexNormals(); g.computeBoundingSphere(); return g; };
    const sub=A=>{ const o=[]; for(let i=0;i<A.length;i+=3) o.push(A[i]); if(o[o.length-1]!==A[A.length-1]) o.push(A[A.length-1]); return o; };
    const g=mk(X,Z,0), gl=mk(sub(X),sub(Z),.06), terr=new THREE.Mesh(g,mat), lo=new THREE.Mesh(gl,mat); terr.receiveShadow=lo.receiveShadow=true; terr.userData.ground=true;
    worldGroup.add(terr); worldGroup.add(lo); const S=g.boundingSphere; cullAdd(terr,S.center.x,S.center.y,S.center.z,S.radius,0,{m:lo,d:150}); }
  if(hasW){ waterMesh=new THREE.Mesh(new THREE.PlaneGeometry(EX*2+2400,EZ*2+2400),new THREE.MeshLambertMaterial({color:C.waterHex||0x4a5a50,transparent:true,opacity:.88}));
    waterMesh.rotation.x=-Math.PI/2; waterMesh.position.y=W.water; worldGroup.add(waterMesh); }
  W.mmCanvas=(()=>{ const m=document.createElement('canvas'); m.width=m.height=512; m.getContext('2d').drawImage(cv,0,0,512,512); return m; })(); W.mmEX=EX; W.mmEZ=EZ;
  // ---- puentes: tablero, barandas y pilas ----
  if(decks.length){ const dg=[], rg=[], m4=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), piers=[];
    for(const Dk of decks){ for(let i=0;i<Dk.pts.length-1;i++){ const [a,b]=[Dk.pts[i],Dk.pts[i+1]], L=Math.hypot(b[0]-a[0],b[1]-a[1]); if(L<.2) continue;
        const ang=Math.atan2(b[0]-a[0],b[1]-a[1]), ya=Dk.ys[i], yb=Dk.ys[i+1], pitch=Math.atan2(yb-ya,L);
        const box=new THREE.BoxGeometry(Dk.w,1.1,L+.6); box.rotateX(-pitch); box.rotateY(ang); box.translate((a[0]+b[0])/2,(ya+yb)/2-.55,(a[1]+b[1])/2); dg.push(box);
        for(const sd of [-1,1]){ const r=new THREE.BoxGeometry(.3,1.0,L+.3); r.rotateX(-pitch); r.translate(sd*(Dk.w/2-.15),.5,0); r.rotateY(ang); r.translate((a[0]+b[0])/2,(ya+yb)/2,(a[1]+b[1])/2); rg.push(r); }
        for(let s=(i?0:8); s<L; s+=Dk.over&&Dk.ys[i]>12?42:24){ const t=s/L, X=a[0]+(b[0]-a[0])*t, Z=a[1]+(b[1]-a[1])*t, y=ya+(yb-ya)*t, g=hg(X,Z); if(y-g>3.5) piers.push({X,Z,y,g,ang,w:Dk.w}); } } }
    const deckMat=new THREE.MeshLambertMaterial({color:0x6a6862}), railMat=new THREE.MeshLambertMaterial({color:0xb8b4aa});
    const dm=new THREE.Mesh(THREE.BufferGeometryUtils.mergeBufferGeometries(dg),deckMat); dm.castShadow=dm.receiveShadow=true; worldGroup.add(dm); houseMeshes.push(dm);
    const rm=new THREE.Mesh(THREE.BufferGeometryUtils.mergeBufferGeometries(rg),railMat); rm.castShadow=true; worldGroup.add(rm);
    const pg=new THREE.BoxGeometry(1,1,1), pim=new THREE.InstancedMesh(pg,new THREE.MeshLambertMaterial({color:0x8e8a80}),Math.max(1,piers.length));
    piers.forEach((p,i)=>{ q.setFromAxisAngle(up,p.ang); const H=p.y-p.g+1.5; m4.compose(new THREE.Vector3(p.X,p.g-1.5+H/2-1.1,p.Z),q,new THREE.Vector3(p.w*.55,H,2.2)); pim.setMatrixAt(i,m4);
      pierObs.push({ob:{cx:p.X,cz:p.Z,c:Math.cos(p.ang),s:Math.sin(p.ang),hw:p.w*.28,hd:1.1},top:p.y-1.3}); });
    pim.count=piers.length; pim.castShadow=true; worldGroup.add(pim); houseMeshes.push(pim); }
  // ---- edificios: los de OSM y casas sobre las calles donde OSM no tiene ----
  const WALLS=C.walls||[0xece6da,0xe0d6c4,0xd8cfbd,0xcfc6b6,0xe6dccb,0xd4c4a8,0xc9c2b8,0xe8e0d0,0xbdb6aa,0xdcd2c0,0xd9c7a8,0xe2d0c0], ROOFS=C.roofs||[0x7d7e7b,0x9c9a93,0x8a8f93,0x7e4e38,0x8a573f,0x9c4a32];
  const flat=(cx,cz,w,d,a)=>{ const c=Math.cos(a), s=Math.sin(a); let lo=1e9,hi=-1e9; for(const [lx,lz] of [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[0,0]]){ const X=cx+lx*c+lz*s, Z=cz-lx*s+lz*c; if(wetAt(X,Z)||(W.deckAt&&deckAt(X,Z)!==null)) return 99; const h=hg(X,Z); lo=Math.min(lo,h); hi=Math.max(hi,h); } return hi-lo; };
  const maxD=Math.max(bx,bz)+220, nearZone=(X,Z,m)=>W.zones.some(Zn=>Math.hypot(X-Zn.x,Z-Zn.z)<Zn.r*.6+m)||Object.values(W.spawns).flat().some(S=>Math.hypot(X-S.x,Z-S.z)<28+m);
  const osmB=[]; for(const b of D.edif){ const cx=osmW(D,b[0]), cz=osmZ(b[1]); if(Math.abs(cx)>maxD||Math.abs(cz)>maxD) continue; const w=b[2]/10, d=b[3]/10, a=b[4]/1000, h=b[5]/10;
    if(flat(cx,cz,w,d,a)>4||nearZone(cx,cz,0)) continue; osmB.push([cx,cz,w,d,a,h,b[6],b[7]]); }
  osmB.sort((p,q)=>q[2]*q[3]-p[2]*p[3]);
  for(const [cx,cz,w,d,a,h,kind,hs] of osmB){ const wall=kind===1?0xeee8dc:WALLS[hs%WALLS.length], roof=kind===1?0x8e4a35:h>8?[0x7d7e7b,0x9c9a93,0x8a8f93][hs%3]:ROOFS[hs%ROOFS.length];
    addBuilding(cx,cz,w,d,h,a,wall,roof,true,h>15?260:h>7?200:110,!C.urban&&kind===0&&h<6&&w*d<160&&hs%3===0); }
  const nOSM=bList.length;
  const F=C.fill; if(F){ const ROOFR=[0x7d7e7b,0x9c9a93,0x8a8f93], hgt=()=>{ const p=pick(C.pisos||[1,1,2]); return p*3.1+rr(.2,1); };
    const tryHouse=(cx,cz,w,d,a,h)=>{ if(Math.abs(cx)>maxD||Math.abs(cz)>maxD) return false; const c=Math.cos(a), s=Math.sin(a), ob={cx,cz,c,s,hw:w/2,hd:d/2};
      for(const [lx,lz] of [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[0,0],[0,d/2],[0,-d/2],[w/2,0],[-w/2,0]]){ const X=cx+lx*.8*c+lz*.8*s, Z=cz-lx*.8*s+lz*.8*c; if(roadAt(X,Z)||OSM_NOBUILD.has(OSM_AREAS.indexOf(kindAt(X,Z)))) return false; }
      if(flat(cx,cz,w,d,a)>2.5||nearZone(cx,cz,4)) return false;
      for(const b of gridQuery(cx,cz,Math.max(w,d)+2)) if(b.ob&&obOverlap(ob,b.ob)) return false;
      const pit=h<6.5&&R()<(C.pitch||0); addBuilding(cx,cz,w,d,h,a,pick(WALLS),h>7?pick(ROOFR):pick(ROOFS),false,h>15?260:h>7?200:110,pit); return true; };
    const FT=C.fillTipos?new Set(C.fillTipos):OSM_FRONT; // tipos de calle con casas (en los pueblos, solo las del pueblo)
    for(const L of roads){ if(!FT.has(L.t)||L.br||L.tun) continue; const pf=F.p*(L.t<=3?.85:1);
      for(let i=0;i<L.pts.length-1;i++){ const A=L.pts[i], B=L.pts[i+1], dx=B[0]-A[0], dz=B[1]-A[1], Ls=Math.hypot(dx,dz); if(Ls<6) continue; const ux=dx/Ls, uz=dz/Ls, nx2=-uz, nz2=ux, a=Math.atan2(-uz,ux);
        if(!inPlay(A[0],A[1],200)&&!inPlay(B[0],B[1],200)) continue;
        for(const sd of [-1,1]){ const urb=(X,Z)=>{ const k=kindAt(X,Z); return k==='barrio'||k==='comercio'||(k===null&&C.urban); };
          for(let s0=rr(0,3); s0<Ls-2; ){ const w=rr(F.fr[0],F.fr[1]), d1=rr(F.dp[0],F.dp[1]), along=s0+w/2; if(along>Ls-1){ break; }
            const h=hgt(), dd=h>15?Math.min(16,Math.max(d1,w*.9)):d1, off=L.w/2+(C.urban?2.2:3.5)+dd/2, cx=A[0]+ux*along+nx2*sd*off, cz=A[1]+uz*along+nz2*sd*off;
            if(R()>(urb(cx,cz)?pf:pf*(C.rural||.25))){ s0+=w+rr(2,8); continue; }
            const ok=tryHouse(cx,cz,w,dd,a,h); s0+=ok?w+rr(F.gap[0],F.gap[1]):2.5;
            if(ok&&R()<F.row2){ const d2=rr(F.dp[0],F.dp[1]), o2=off+dd/2+rr(.5,3)+d2/2; tryHouse(A[0]+ux*along+nx2*sd*o2,A[1]+uz*along+nz2*sd*o2,w*rr(.8,1.1),d2,a,Math.min(h,rr(3,7))); } } } } } }
  if(C.hitos) C.hitos({R,rr,pick,hg,D,roads,areas,poi:n=>{ const p=D.pois.find(q=>q[0]&&q[0].includes(n)); return p?{x:osmW(D,p[1]),z:osmZ(p[2])}:null; }});
  finalizeBuildings();
  // ---- árboles ----
  const list=[], tOk=(X,Z,m)=>!roadAt(X,Z)&&!wetAt(X,Z)&&!gridQuery(X,Z,4).some(b=>b.ob&&obPush(X,Z,m,b))&&!W.zones.some(Zn=>Math.hypot(X-Zn.x,Z-Zn.z)<Zn.r-3)&&(!W.deckAt||deckAt(X,Z)===null);
  const sp=C.sp||{calle:['timbo'],parque:['timbo'],bosque:['timbo']}, inT=(X,Z)=>Math.abs(X)<EX-4&&Math.abs(Z)<EZ-4;
  for(let i=0;i<D.arboles.length;i+=2){ const X=osmW(D,D.arboles[i]), Z=osmZ(D.arboles[i+1]); if(inT(X,Z)&&tOk(X,Z,1)) list.push({x:X,z:Z,sp:pick(sp.calle),s:rr(.7,1)}); }
  for(const A of areas){ const dens=A.k==='bosque'?1/70:A.k==='monte'?1/110:A.k==='parque'||A.k==='plaza'?1/150:A.k==='cementerio'||A.k==='golf'?1/500:A.k==='banado'?1/260:0; if(!dens) continue;
    const xs2=A.pts.map(p=>p[0]), zs2=A.pts.map(p=>p[1]), x0=Math.max(-EX,Math.min(...xs2)), x1=Math.min(EX,Math.max(...xs2)), z0=Math.max(-EZ,Math.min(...zs2)), z1=Math.min(EZ,Math.max(...zs2));
    const n=Math.min(2500,Math.round(A.A*dens)), pool=A.k==='bosque'?sp.bosque:A.k==='monte'?(sp.monte||['espinillo']):A.k==='banado'?['junco','espinillo']:sp.parque;
    for(let k=0,m=0;k<n*6&&m<n;k++){ const X=rr(x0,x1), Z=rr(z0,z1); if(!inPoly(X,Z,A.pts)||!inT(X,Z)||!tOk(X,Z,1.5)) continue; list.push({x:X,z:Z,sp:pick(pool),s:rr(.75,1.15)}); m++; } }
  if(C.calleArb) for(const L of roads){ if(!OSM_FRONT.has(L.t)||L.br) continue; for(let i=0;i<L.pts.length-1;i++){ const A=L.pts[i], B=L.pts[i+1], dx=B[0]-A[0], dz=B[1]-A[1], Ls=Math.hypot(dx,dz); if(Ls<4||(!inPlay(A[0],A[1],120)&&!inPlay(B[0],B[1],120))) continue; const ux=dx/Ls, uz=dz/Ls;
    for(let s0=rr(3,10); s0<Ls; s0+=rr(9,15)){ if(R()>C.calleArb) continue; const sd=R()<.5?1:-1, o=L.w/2+1.2, X=A[0]+ux*s0-uz*sd*o, Z=A[1]+uz*s0+ux*sd*o; if(inT(X,Z)&&!gridQuery(X,Z,3).some(b=>b.ob&&obPush(X,Z,1,b))&&!wetAt(X,Z)) list.push({x:X,z:Z,sp:pick(sp.calle),s:rr(.55,.85)}); } } }
  if(C.extra) C.extra({R,rr,pick,hg,list,roads,areas,kindAt,roadAt,wetAt,tOk});
  // tope de árboles (los montes enormes, como en Salto Grande, se ralean al azar)
  const TOPE=C.maxArb||4500; while(list.length>TOPE) list.splice((R()*list.length)|0,1);
  buildTrees(list);
  // ---- caminos de la IA (grafo sobre las calles reales dentro del mapa) ----
  nodes=[]; const NG=new Map(), nk=(X,Z)=>Math.floor(X/10)*7919+Math.floor(Z/10);
  for(const L of roads){ if(!OSM_CAR.has(L.t)||L.tun) continue; let prev=null;
    for(let i=0;i<L.pts.length-1;i++){ const A=L.pts[i], B=L.pts[i+1], len=Math.hypot(B[0]-A[0],B[1]-A[1]), n=Math.max(1,Math.round(len/12));
      for(let k=(i===0?0:1);k<=n;k++){ const t=k/n, p=new THREE.Vector3(A[0]+(B[0]-A[0])*t,0,A[1]+(B[1]-A[1])*t);
        if(!inPlay(p.x,p.z,-3)){ prev=null; continue; }
        const nd={p,nb:[],s:L}; nodes.push(nd); const key2=nk(p.x,p.z); if(!NG.has(key2)) NG.set(key2,[]); NG.get(key2).push(nd); if(prev){ prev.nb.push(nd); nd.nb.push(prev); } prev=nd; } } }
  for(const nd of nodes){ const cx=Math.floor(nd.p.x/10), cz=Math.floor(nd.p.z/10); for(let a=cx-1;a<=cx+1;a++) for(let b=cz-1;b<=cz+1;b++){ const L=NG.get(a*7919+b); if(!L) continue;
    for(const o of L) if(o!==nd&&o.s!==nd.s&&!nd.nb.includes(o)&&nd.p.distanceTo(o.p)<8){ nd.nb.push(o); o.nb.push(nd); } } }
  nodes.near=NG; if(!nodes.length) nodes=null;
  W.boundary=[[-bx,-bz],[-bx,bz],[bx,bz],[bx,-bz]];
  console.log(`Mapa ${key}: ${nOSM} edificios de OSM + ${buildings.length-nOSM} casas sobre calles, ${list.length} árboles, ${streetSegs.length} tramos de calle, ${nodes?nodes.length:0} nodos, ${decks.length} puentes`);
}
// punto a una distancia s sobre una polilínea
function polyAt(pts,cum,s){ for(let i=1;i<pts.length;i++) if(cum[i]>=s){ const t=(s-cum[i-1])/((cum[i]-cum[i-1])||1); return [pts[i-1][0]+(pts[i][0]-pts[i-1][0])*t,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*t]; } return pts[pts.length-1]; }

// Fuera del área con datos: el relieve sigue en espejo, sin detalle
function osmOuter(){
  const EX=W.ex, EZ=W.ez, E=Math.max(EX,EZ)+900, n=Math.round(E*2/24), g=new THREE.PlaneGeometry(E*2,E*2,n,n); g.rotateX(-Math.PI/2);
  const pos=g.attributes.position, uv=g.attributes.uv, mir=(v,L)=>{ v=((v+L)%(4*L)+4*L)%(4*L)-L; return v>L?2*L-v:v; };
  for(let i=0;i<pos.count;i++){ const x=pos.getX(i), z=pos.getZ(i), inside=Math.abs(x)<EX-9&&Math.abs(z)<EZ-9, mx=mir(x,EX), mz=mir(z,EZ);
    pos.setY(i,W.groundH(mx,mz)-(inside?6:.08)); uv.setXY(i,(EX-mx)/(2*EX),(mz+EZ)/(2*EZ)); }
  g.computeVertexNormals();
  const terr=worldGroup.children.find(o=>o.isMesh&&o.userData.ground);
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:terr?terr.material.map:null,color:0xe0dcd4})); m.receiveShadow=true; worldGroup.add(m);
}
// Los mapas de la Guerra Fría que pasan a ser reales (reemplazan a los comprimidos)
for(const k in OSM_CFG){ const C=OSM_CFG[k], D0=WORLDS[k]||{};
  WORLDS[k]={key:k,label:C.label,desc:C.desc,osm:true,bx:C.bx||750,bz:C.bz||750,sky:C.sky||D0.sky,fog:C.fog||[240,780],h:(x,z)=>0,zones:C.zones,spawns:C.spawns,eastNat:C.eastNat,city:!!C.urban,dust:C.dust}; }

// ---- Hitos que OSM no tiene en 3D ----
// Cúpula de iglesia sobre el edificio más grande cerca del punto (Basílica de Itatí)
function osmCupula(P,o){ if(!P) return; let best=null; for(const b of bList){ const d=Math.hypot(b.x-P.x,b.z-P.z); if(d<(o.radio||60)&&(!best||b.w*b.d>best.w*best.d)) best=b; } if(!best) return;
  best.top=best.base+1+o.cuerpo; best.box.max.y=best.top+.4; best.hp=best.max=1e9; best.wall=0xeee6d6; best.roof=0x9a8f80; const g=heightAt(best.x,best.z)+o.cuerpo, M=new THREE.MeshLambertMaterial({color:0xeee6d6}), Mc=new THREE.MeshLambertMaterial({color:o.col||0x6d8fa8});
  const grp=new THREE.Group(); grp.position.set(best.x,g,best.z);
  const tam=new THREE.Mesh(new THREE.CylinderGeometry(o.r,o.r,o.tambor,24),M); tam.position.y=o.tambor/2; grp.add(tam);
  const cup=new THREE.Mesh(new THREE.SphereGeometry(o.r*1.04,24,12,0,Math.PI*2,0,Math.PI/2),Mc); cup.scale.y=1.25; cup.position.y=o.tambor; grp.add(cup);
  const lin=new THREE.Mesh(new THREE.CylinderGeometry(o.r*.18,o.r*.2,o.r*.5,12),M); lin.position.y=o.tambor+o.r*1.3+o.r*.2; grp.add(lin);
  const cruz=new THREE.Mesh(new THREE.BoxGeometry(.5,4,.5),new THREE.MeshLambertMaterial({color:0xc9b26a})); cruz.position.y=o.tambor+o.r*1.3+o.r*.5+2; grp.add(cruz);
  grp.traverse(m=>{ if(m.isMesh){ m.castShadow=true; m.receiveShadow=true; } }); worldGroup.add(grp); grp.updateMatrixWorld(true); grp.children.forEach(m=>houseMeshes.push(m)); }
// Estatua sobre un pedestal (Cristo Redentor de los Andes)
function osmEstatua(P,o){ if(!P) return; const g=heightAt(P.x,P.z); addBuilding(P.x,P.z,o.base,o.base,o.ped,0,0xa8a49a,0x8e8a80,false,1e9,false); bList[bList.length-1].hp=bList[bList.length-1].max=1e9;
  const M=new THREE.MeshLambertMaterial({color:o.col||0x5f5a4e}), grp=new THREE.Group(); grp.position.set(P.x,g+o.ped,P.z); grp.rotation.y=o.rot||0; const H=o.alto;
  const tun=new THREE.Mesh(new THREE.CylinderGeometry(H*.09,H*.17,H*.78,12),M); tun.position.y=H*.39; grp.add(tun);
  const pecho=new THREE.Mesh(new THREE.CylinderGeometry(H*.1,H*.09,H*.16,12),M); pecho.position.y=H*.83; grp.add(pecho);
  const bra=new THREE.Mesh(new THREE.BoxGeometry(H*.7,H*.06,H*.07),M); bra.position.y=H*.84; grp.add(bra);
  const cab=new THREE.Mesh(new THREE.SphereGeometry(H*.065,12,10),M); cab.position.y=H*.96; grp.add(cab);
  const cruz=new THREE.Mesh(new THREE.BoxGeometry(H*.04,H*.5,H*.04),M); cruz.position.set(H*.12,H*.55,0); grp.add(cruz);
  grp.traverse(m=>{ if(m.isMesh){ m.castShadow=true; m.receiveShadow=true; } }); worldGroup.add(grp); grp.updateMatrixWorld(true); grp.children.forEach(m=>houseMeshes.push(m)); }
// Paredón de la represa: un muro de hormigón debajo del camino (los tramos de puente sobre el agua)
function osmPresa(o){ const M=new THREE.MeshLambertMaterial({color:0xb4b0a6}), gs=[];
  for(const L of o.roads){ if(!L.br||L.t>5) continue; for(let i=0;i<L.pts.length-1;i++){ const [a,b]=[L.pts[i],L.pts[i+1]], len=Math.hypot(b[0]-a[0],b[1]-a[1]); if(len<1) continue;
    const mx=(a[0]+b[0])/2, mz=(a[1]+b[1])/2; if(!o.wetAt(mx,mz)&&o.hg(mx,mz)>1) continue; const top=(W.deckAt(mx,mz)??4)-1.2, bot=-7, g=new THREE.BoxGeometry(o.ancho,top-bot,len+.5);
    g.translate(0,(top+bot)/2,0); g.rotateY(Math.atan2(b[0]-a[0],b[1]-a[1])); g.translate(mx,0,mz); gs.push(g); } }
  if(!gs.length) return; const m=new THREE.Mesh(THREE.BufferGeometryUtils.mergeBufferGeometries(gs),M); m.castShadow=m.receiveShadow=true; worldGroup.add(m); houseMeshes.push(m); }
