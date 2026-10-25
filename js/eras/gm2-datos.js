/* ---------- Entreguerras (1919–1938): naciones y vehículos ----------
   Los primeros tanques con torre de verdad: ligeros con ametralladoras, los medios con cañón de 37 a 47 mm, los rápidos BT con
   suspensión Christie y los primeros "tanques de apoyo" con cañón corto de 75/76 mm. La Guerra Civil Española (1936–1939) fue su prueba.
   Velocidades reales × 1,2. Blindaje en mm, penetración a quemarropa. m.ww1='iw' usa el constructor de gm2-modelos.js. */
const kmh2=v=>+(v/3.6*1.2).toFixed(2);
Object.assign(ERAS[2],{ready:1,
  desc:'Tanques ligeros con torre, los primeros medios con cañón, los rápidos BT soviéticos y la Guerra Civil Española (1936–1939).',
  sup:{arty:1,air:0,nuke:0},civ:0,traffic:0,mgPen:13,female:0,guns:1,
  smoke:0,                                       // casi ningún tanque de la época tenía lanzahumos
  sides:null,                                    // sin bandos fijos: cualquiera contra cualquiera
  at:{n:'Fusil antitanque Boys',kind:'ke',pen:23,v:750},
  mortar:{n:'Mortero de 81 mm',kind:'he',pen:12,v:85,sc:.7}});
NAT_ERA[2]={
  uk:{label:'Reino Unido',names:['Sgt. Walker','Cpl. Hughes','Lt. Pemberton','Tpr. Davies','Sgt. Clarke'],uni:['#7a7350','#665f40','#45402c'],helm:'brodie'},
  fr:{label:'Francia',names:['Sgt. Dubois','Cpl. Mercier','Lt. Lefèvre','Sdt. Garnier','Sgt. Bonnet'],uni:['#6f6a4e','#5c583f','#3c392a'],helm:'adrian'},
  de:{label:'Alemania',names:['Uffz. Weber','Gefr. Fischer','Ltn. Hoffmann','Pz.Sch. Becker','Fw. Schulz'],uni:['#5d6150','#4c4f41','#33352c'],helm:'stahl'},
  ru:{label:'Unión Soviética',names:['Sgt. Ivanov','Cpl. Petrov','Lt. Arman','Ryadovoy Volkov','Sgt. Sokolov'],uni:['#6b6b48','#58583a','#3b3b27'],helm:'ssh'},
  us:{label:'Estados Unidos',names:['Sgt. Miller','Cpl. Johnson','Lt. Patton','Pvt. Wilson','Sgt. Moore'],uni:['#6b6646','#585338','#3c3927'],helm:'brodie'}};
Object.assign(VEH,{
  // ---- Reino Unido ----
  vmk2:{nation:'uk',era:2,year:1925,br:2.3,cls:'medio',label:'Vickers Medium Mk II',desc:'El tanque británico de los años 20: torre giratoria con 3 libras de 47 mm, motor junto al conductor y suspensión de bogies. Lento pero confiable; duró hasta 1939.',
    maxF:kmh2(25),maxR:2,turn:.55,trav:.6,reload:4.5,pen:32,hp:85,crewReal:5,seats:['driver','commander','gunner','loader','mg1'],
    armor:{hull:{front:8,side:8,rear:6,top:5},turret:{front:8,side:8,rear:6,top:5}},camo:['#5f6a48','#4d5638','#343a27'],camoMode:'flat',mgc:7.7,
    m:{ww1:'iw',L:5.33,W:2.78,H:2.7,tz:.2,tw:1.7,th:.95,tl:1.8,gl:1.3,gr:.04,
      iw:{trW:.45,trH:1.05,trF:.95,trR:.9,deck:1.7,glacis:.9,nW:7,wR:.22,bog:1,ret:4,skirt:.55,tur:'bevel',tx:0,cup:0,mgs:[{x:-.45,z:.75,side:1}],eng:'side',ins:'uk'}}},
  lt6b:{nation:'uk',era:2,year:1936,br:2.0,cls:'ligero',label:'Light Tank Mk VIB',desc:'Tanque ligero rápido para patrullar el Imperio: ametralladora pesada Vickers de 12,7 mm y otra de 7,7 mm en una torre chica. Blindaje de 14 mm.',
    auto:{mag:25,rof:.14},maxF:kmh2(56),maxR:3,turn:.85,trav:1.0,reload:4,pen:20,hp:60,crewReal:3,seats:['driver','commander','gunner'],
    armor:{hull:{front:14,side:10,rear:8,top:4},turret:{front:14,side:10,rear:8,top:4}},camo:['#6a6c4a','#575a3b','#3a3c28'],camoMode:'flat',mgc:12.7,
    m:{ww1:'iw',L:4.0,W:2.08,H:2.25,tz:-.2,tw:1.25,th:.75,tl:1.4,gl:1.0,gr:.03,
      iw:{trW:.3,trH:.7,trF:.65,trR:.7,deck:1.35,glacis:.6,nW:4,wR:.3,bog:1,ret:1,tur:'bevel',tx:.12,cup:1,coax:1,ins:'uk'}}},
  a9:{nation:'uk',era:2,year:1938,br:2.7,cls:'medio',label:'Cruiser Mk I (A9)',desc:'El primer "crucero" británico: torre motorizada con el nuevo 2 libras de 40 mm, que perfora más que cualquier otro cañón de su tamaño, y dos torrecitas con ametralladoras adelante.',
    maxF:kmh2(40),maxR:2.5,turn:.7,trav:.9,reload:3.2,pen:57,hp:85,crewReal:6,seats:['driver','commander','gunner','loader','mg1','mg2'],
    armor:{hull:{front:14,side:14,rear:10,top:6},turret:{front:14,side:14,rear:10,top:6}},camo:['#626c49','#4f5838','#353b27'],camoMode:'flat',mgc:7.7,
    m:{ww1:'iw',L:5.8,W:2.5,H:2.65,tz:-.1,tw:1.6,th:.85,tl:1.8,gl:2.0,gr:.035,
      iw:{trW:.38,trH:.95,trF:.9,trR:.95,deck:1.75,glacis:.9,nW:6,wR:.3,bog:1,ret:3,tur:'bevel',cup:1,sub:[{x:-.62,z:1.85},{x:.62,z:1.85}],ins:'uk'}}},
  a13:{nation:'uk',era:2,year:1938,br:3.0,cls:'medio',label:'Cruiser Mk III (A13)',desc:'Copiado de los tanques de Christie que los británicos vieron en las maniobras soviéticas: ruedas grandes y casi 50 km/h. Mismo 2 libras que el A9, blindaje fino.',
    maxF:kmh2(48),maxR:2.8,turn:.75,trav:.9,reload:3.2,pen:57,hp:80,crewReal:4,seats:['driver','commander','gunner','loader'],
    armor:{hull:{front:14,side:10,rear:10,top:6},turret:{front:14,side:14,rear:10,top:6}},camo:['#626c49','#4f5838','#353b27'],camoMode:'flat',mgc:7.7,
    m:{ww1:'iw',L:6.0,W:2.54,H:2.6,tz:.15,tw:1.75,th:.85,tl:2.0,gl:2.0,gr:.035,
      iw:{trW:.36,trH:1.05,trF:.95,trR:.95,deck:1.65,glacis:.7,nW:4,wR:.5,chr:1,ret:0,tur:'bevel',cup:0,coax:1,ins:'uk'}}},
  // ---- Francia ----
  r35:{nation:'fr',era:2,year:1936,br:2.3,cls:'ligero',label:'Renault R35',desc:'El heredero del FT: casco de acero fundido de 40 mm, imposible de perforar para muchos cañones de la época, pero lento y con el viejo 37 mm corto. El tanque más fabricado de Francia.',
    maxF:kmh2(20),maxR:1.5,turn:.6,trav:.6,reload:4.5,pen:23,hp:70,crewReal:2,seats:['driver','gunner'],
    armor:{hull:{front:40,side:40,rear:40,top:25},turret:{front:40,side:40,rear:40,top:25}},camo:['#7a7a52','#5d6a3c','#3d3326','#9a8a5e'],camoMode:'fr',mgc:7.5,
    m:{ww1:'iw',L:4.02,W:1.87,H:2.13,tz:.1,tw:1.15,th:.85,tl:1.25,gl:.75,gr:.045,
      iw:{trW:.3,trH:.75,trF:.85,trR:.6,deck:1.25,glacis:.55,nW:5,wR:.2,bog:1,ret:3,cast:1,tur:'cast',cup:1,ins:'fr'}}},
  s35:{nation:'fr',era:2,year:1936,br:3.0,cls:'medio',label:'Somua S35',desc:'Para muchos, el mejor tanque de 1940: casco fundido de 47 mm, 47 mm SA35 que perfora a todos los alemanes y radio. Su punto débil: el comandante hace todo solo en la torre.',
    maxF:kmh2(40),maxR:2.5,turn:.65,trav:.6,reload:4.5,pen:50,hp:100,crewReal:3,seats:['driver','commander','gunner'],
    armor:{hull:{front:47,side:40,rear:25,top:15},turret:{front:56,side:46,rear:46,top:20}},camo:['#7a7a52','#5d6a3c','#3d3326','#9a8a5e'],camoMode:'fr',mgc:7.5,
    m:{ww1:'iw',L:5.38,W:2.12,H:2.62,tz:-.1,tw:1.45,th:.95,tl:1.6,gl:1.4,gr:.045,
      iw:{trW:.33,trH:1.0,trF:.95,trR:.8,deck:1.55,glacis:.8,nW:9,wR:.2,bog:1,ret:2,skirt:.7,cast:1,tur:'cast',cup:1,ins:'fr'}}},
  b1bis:{nation:'fr',era:2,year:1937,br:3.3,cls:'pesado',label:'Char B1 bis',desc:'Fortaleza de 60 mm con dos cañones: 47 mm en la torre y un obús de 75 mm en el casco que se apunta girando todo el tanque. Carísimo, lento y gastador, pero casi invulnerable en 1938.',
    maxF:kmh2(28),maxR:1.8,turn:.45,trav:.5,reload:4.8,pen:50,hp:140,crewReal:4,seats:['driver','commander','gunner','loader'],
    armor:{hull:{front:60,side:55,rear:55,top:25},turret:{front:56,side:46,rear:46,top:25}},camo:['#7a7a52','#5d6a3c','#3d3326','#9a8a5e'],camoMode:'fr',mgc:7.5,
    m:{ww1:'iw',L:6.37,W:2.5,H:2.79,tz:-.4,tw:1.4,th:.95,tl:1.55,gl:1.4,gr:.045,
      iw:{trW:.5,trH:1.55,trF:1.55,trR:1.35,deck:1.85,glacis:.35,nW:8,wR:.22,bog:1,ret:0,skirt:.95,tur:'cast',cup:1,hg:{x:.55,z:2.8,gl:.9,gr:.08},ins:'fr',rhombo:1}}},
  // ---- Alemania ----
  pz1a:{nation:'de',era:2,year:1934,br:2.0,cls:'ligero',label:'Panzer I Ausf. A',desc:'Tanque de instrucción convertido en tanque de combate: dos ametralladoras MG 13 en una torre corrida a la derecha y 13 mm de blindaje. En España los T-26 lo superaban de lejos.',
    auto:{mag:25,rof:.09},maxF:kmh2(37),maxR:2.5,turn:.8,trav:1.0,reload:4,pen:14,hp:55,crewReal:2,seats:['driver','gunner'],
    armor:{hull:{front:13,side:13,rear:13,top:6},turret:{front:13,side:13,rear:13,top:6}},camo:['#5e6250','#7a6a48','#45503a'],camoMode:'de',mgc:7.92,
    m:{ww1:'iw',L:4.02,W:2.06,H:1.72,tz:.2,tw:1.15,th:.62,tl:1.25,gl:.75,gr:.02,
      iw:{trW:.28,trH:.75,trF:.65,trR:.75,deck:1.1,glacis:.55,nW:4,wR:.27,ret:3,tur:'bevel',tx:.3,twin:1,ins:'de'}}},
  pz2a:{nation:'de',era:2,year:1937,br:2.3,cls:'ligero',label:'Panzer II Ausf. A',desc:'El caballo de batalla de los primeros años: cañón automático de 20 mm (ráfagas de 10 tiros) y 14 mm de blindaje. Rápido y fácil de manejar.',
    auto:{mag:10,rof:.22},maxF:kmh2(40),maxR:2.5,turn:.8,trav:1.0,reload:4,pen:24,hp:65,crewReal:3,seats:['driver','commander','gunner'],
    armor:{hull:{front:14,side:14,rear:14,top:10},turret:{front:14,side:14,rear:14,top:10}},camo:['#5e6250','#7a6a48','#45503a'],camoMode:'de',mgc:7.92,
    m:{ww1:'iw',L:4.81,W:2.22,H:1.99,tz:.2,tw:1.4,th:.7,tl:1.6,gl:1.2,gr:.025,
      iw:{trW:.3,trH:.8,trF:.75,trR:.8,deck:1.3,glacis:.6,nW:6,wR:.27,ret:4,tur:'bevel',tx:.2,coax:1,ins:'de'}}},
  pz3a:{nation:'de',era:2,year:1937,br:2.7,cls:'medio',label:'Panzer III Ausf. A',desc:'El tanque de combate pensado por Guderian: cinco tripulantes con radio, comandante con cúpula y 37 mm KwK 36. Solo 10 unidades con sus cinco ruedas grandes.',
    maxF:kmh2(32),maxR:2.2,turn:.7,trav:.8,reload:3.4,pen:40,hp:85,crewReal:5,seats:['driver','commander','gunner','loader','mg1'],
    armor:{hull:{front:15,side:15,rear:15,top:10},turret:{front:15,side:15,rear:15,top:10}},camo:['#5e6250','#7a6a48','#45503a'],camoMode:'de',mgc:7.92,
    m:{ww1:'iw',L:5.69,W:2.81,H:2.34,tz:0,tw:1.8,th:.85,tl:2.0,gl:1.75,gr:.035,
      iw:{trW:.36,trH:.95,trF:.9,trR:.9,deck:1.5,glacis:.7,nW:5,wR:.4,ret:2,tur:'bevel',cup:1,bus:1,coax:1,ins:'de'}}},
  pz4a:{nation:'de',era:2,year:1937,br:3.0,cls:'medio',label:'Panzer IV Ausf. A',desc:'El "tanque de apoyo": 75 mm KwK 37 corto, pensado para tirar explosivo a cañones y fortines. Con munición perforante igual le alcanza contra los tanques ligeros.',
    maxF:kmh2(31),maxR:2.2,turn:.65,trav:.7,reload:5,pen:41,hp:95,crewReal:5,seats:['driver','commander','gunner','loader','mg1'],
    armor:{hull:{front:15,side:15,rear:10,top:10},turret:{front:20,side:20,rear:10,top:10}},camo:['#5e6250','#7a6a48','#45503a'],camoMode:'de',mgc:7.92,
    m:{ww1:'iw',L:5.6,W:2.9,H:2.65,tz:.1,tw:1.9,th:.85,tl:2.1,gl:1.25,gr:.06,
      iw:{trW:.38,trH:.9,trF:.95,trR:.85,deck:1.7,glacis:.6,nW:8,wR:.24,bog:1,ret:4,tur:'bevel',cup:1,bus:1,coax:1,ins:'de'}}},
  // ---- Unión Soviética ----
  t26:{nation:'ru',era:2,year:1933,br:2.3,cls:'ligero',label:'T-26 mod. 1933',desc:'Copia soviética del Vickers 6 toneladas con el excelente 45 mm 20K. En España (1936–1939) dominó a los Panzer I y a las tanquetas italianas.',
    maxF:kmh2(31),maxR:2.2,turn:.7,trav:.8,reload:3.6,pen:50,hp:70,crewReal:3,seats:['driver','commander','gunner'],
    armor:{hull:{front:15,side:15,rear:15,top:6},turret:{front:15,side:15,rear:15,top:6}},camo:['#5c6440','#4a5232','#333923'],camoMode:'flat',mgc:7.62,
    m:{ww1:'iw',L:4.65,W:2.44,H:2.24,tz:-.05,tw:1.65,th:.75,tl:1.9,gl:1.8,gr:.04,
      iw:{trW:.3,trH:.8,trF:.8,trR:.75,deck:1.45,glacis:.6,nW:8,wR:.18,bog:1,ret:4,tur:'cyl',bus:1,coax:1,rail:1,ins:'ru'}}},
  bt5:{nation:'ru',era:2,year:1933,br:2.7,cls:'ligero',label:'BT-5',desc:'"Tanque rápido" con suspensión Christie: más de 70 km/h, casi volando. Mismo 45 mm que el T-26 y blindaje fino. En Fuentes de Ebro (1937) cargaron con la infantería encima.',
    maxF:kmh2(72),maxR:3.5,turn:.9,trav:.8,reload:3.6,pen:50,hp:65,crewReal:3,seats:['driver','commander','gunner'],
    armor:{hull:{front:13,side:13,rear:10,top:6},turret:{front:15,side:15,rear:15,top:6}},camo:['#5c6440','#4a5232','#333923'],camoMode:'flat',mgc:7.62,
    m:{ww1:'iw',L:5.58,W:2.23,H:2.25,tz:.35,tw:1.65,th:.75,tl:1.9,gl:1.8,gr:.04,
      iw:{trW:.27,trH:.95,trF:.9,trR:.85,deck:1.45,glacis:.85,nW:4,wR:.41,chr:1,ret:0,tur:'cyl',bus:1,coax:1,nose:1,ins:'ru'}}},
  t28:{nation:'ru',era:2,year:1933,br:3.0,cls:'medio',label:'T-28',desc:'Tanque de tres torres para romper frentes: 76 mm KT-28 corto en la del medio y dos torrecitas con ametralladoras adelante. Seis tripulantes y 30 mm de frente.',
    maxF:kmh2(37),maxR:2,turn:.5,trav:.6,reload:5.5,pen:38,hp:125,crewReal:6,seats:['driver','commander','gunner','loader','mg1','mg2'],
    armor:{hull:{front:30,side:20,rear:20,top:15},turret:{front:20,side:20,rear:20,top:15}},camo:['#5c6440','#4a5232','#333923'],camoMode:'flat',mgc:7.62,
    m:{ww1:'iw',L:7.44,W:2.81,H:2.82,tz:-.1,tw:2.0,th:.95,tl:2.3,gl:1.3,gr:.06,
      iw:{trW:.4,trH:1.0,trF:1.0,trR:.95,deck:1.85,glacis:.9,nW:12,wR:.2,bog:1,ret:4,skirt:.6,tur:'cyl',bus:1,coax:1,rail:1,sub:[{x:-.68,z:2.05,r:.42},{x:.68,z:2.05,r:.42}],ins:'ru'}}},
  // ---- Estados Unidos ----
  m2a2:{nation:'us',era:2,year:1935,br:2.3,cls:'ligero',label:'M2A2 "Mae West"',desc:'Tanque ligero de dos torres (le decían Mae West): una con ametralladora de 12,7 mm y otra con una de 7,62 mm. Muy rápido y con suspensión de goma.',
    auto:{mag:25,rof:.12},maxF:kmh2(72),maxR:3,turn:.9,trav:1.1,reload:4,pen:22,hp:65,crewReal:4,seats:['driver','commander','gunner','mg1'],
    armor:{hull:{front:16,side:16,rear:16,top:6},turret:{front:16,side:16,rear:16,top:6}},camo:['#5b5a3c','#4a4930','#2e2d1f'],camoMode:'flat',mgc:12.7,
    m:{ww1:'iw',L:4.14,W:2.38,H:2.36,tz:-.2,tw:1.0,th:.8,tl:1.1,gl:1.1,gr:.03,
      iw:{trW:.3,trH:.85,trF:.75,trR:.9,deck:1.45,glacis:.65,nW:4,wR:.3,bog:1,ret:2,tur:'cyl',tx:-.42,twinT:1,ins:'us'}}},
  m2a4:{nation:'us',era:2,year:1938,br:2.7,cls:'ligero',label:'M2A4',desc:'El M2 con una sola torre y el cañón de 37 mm M5: perfora más que el Panzer III. Blindaje de 25 mm. Lo heredó directamente el M3 Stuart.',
    maxF:kmh2(58),maxR:3,turn:.85,trav:1.0,reload:3.2,pen:46,hp:75,crewReal:4,seats:['driver','commander','gunner','mg1'],
    armor:{hull:{front:25,side:25,rear:25,top:10},turret:{front:25,side:25,rear:25,top:10}},camo:['#5b5a3c','#4a4930','#2e2d1f'],camoMode:'flat',mgc:7.62,
    m:{ww1:'iw',L:4.43,W:2.47,H:2.49,tz:-.1,tw:1.55,th:.85,tl:1.6,gl:1.6,gr:.035,
      iw:{trW:.3,trH:.85,trF:.75,trR:.9,deck:1.5,glacis:.65,nW:4,wR:.3,bog:1,ret:2,tur:'oct',coax:1,ins:'us'}}},
  // ---- Cañones antitanque (solo los usa la IA) ----
  pak36:{nation:'de',era:2,static:1,uses:1,br:2,cls:'cañón',label:'3,7 cm Pak 36',desc:'El antitanque alemán: liviano y bajo, lo mueven dos hombres.',
    maxF:0,maxR:0,turn:.25,trav:.4,reload:3,pen:40,hp:45,arc:.5,crewReal:4,seats:['gunner','loader','commander','driver'],
    armor:{hull:{front:5,side:2,rear:2,top:2},turret:{front:5,side:2,rear:2,top:2}},camo:['#5f6150','#4b4d3f','#2f3128'],camoMode:'flat',mgc:7.92,
    m:{ww1:'gun',L:3.4,W:1.65,H:.85,wr:.4,wheels:0,tz:.4,tw:1.0,th:.6,tl:.4,gl:1.6,gr:.025}},
  at45:{nation:'ru',era:2,static:1,uses:1,br:2,cls:'cañón',label:'45 mm 53-K',desc:'El antitanque soviético de 45 mm, mismo cañón que el T-26.',
    maxF:0,maxR:0,turn:.25,trav:.4,reload:3.5,pen:50,hp:45,arc:.5,crewReal:4,seats:['gunner','loader','commander','driver'],
    armor:{hull:{front:5,side:2,rear:2,top:2},turret:{front:5,side:2,rear:2,top:2}},camo:['#5c6440','#4a5232','#333923'],camoMode:'flat',mgc:7.62,
    m:{ww1:'gun',L:3.6,W:1.65,H:.9,wr:.45,wheels:0,tz:.4,tw:1.0,th:.6,tl:.4,gl:1.85,gr:.03}},
  pdr2:{nation:'uk',era:2,static:1,uses:1,br:2,cls:'cañón',label:'Cañón de 2 libras',desc:'El antitanque británico de 40 mm, sobre su trípode.',
    maxF:0,maxR:0,turn:.25,trav:.4,reload:3,pen:57,hp:45,arc:.5,crewReal:4,seats:['gunner','loader','commander','driver'],
    armor:{hull:{front:5,side:2,rear:2,top:2},turret:{front:5,side:2,rear:2,top:2}},camo:['#5c5a44','#4a4836','#2e2d22'],camoMode:'flat',mgc:7.7,
    m:{ww1:'gun',L:3.4,W:1.7,H:.9,wr:.4,wheels:0,tz:.4,tw:1.0,th:.6,tl:.4,gl:2.0,gr:.025}},
  at25:{nation:'fr',era:2,static:1,uses:1,br:2,cls:'cañón',label:'25 mm Hotchkiss',desc:'Antitanque francés de 25 mm: chico y preciso.',
    maxF:0,maxR:0,turn:.25,trav:.4,reload:2.8,pen:40,hp:40,arc:.5,crewReal:4,seats:['gunner','loader','commander','driver'],
    armor:{hull:{front:5,side:2,rear:2,top:2},turret:{front:5,side:2,rear:2,top:2}},camo:['#6f7a6a','#59634f','#383f33'],camoMode:'flat',mgc:7.5,
    m:{ww1:'gun',L:3.2,W:1.55,H:.8,wr:.38,wheels:0,tz:.4,tw:1.0,th:.6,tl:.4,gl:1.6,gr:.02}},
  at37us:{nation:'us',era:2,static:1,uses:1,br:2,cls:'cañón',label:'37 mm M3',desc:'Antitanque estadounidense de 37 mm.',
    maxF:0,maxR:0,turn:.25,trav:.4,reload:3,pen:46,hp:45,arc:.5,crewReal:4,seats:['gunner','loader','commander','driver'],
    armor:{hull:{front:5,side:2,rear:2,top:2},turret:{front:5,side:2,rear:2,top:2}},camo:['#5b5a3c','#4a4930','#2e2d1f'],camoMode:'flat',mgc:7.62,
    m:{ww1:'gun',L:3.4,W:1.6,H:.85,wr:.4,wheels:0,tz:.4,tw:1.0,th:.6,tl:.4,gl:1.75,gr:.025}}
});
Object.assign(AMMO_DEF,{
  vmk2:[['Perforante 3 lb (47 mm)','ke',32,540],['Explosivo 3 lb','he',6,540]],
  lt6b:[['Vickers 12,7 mm perforante','ke',20,760]],
  a9:[['Perforante 2 lb (40 mm)','ke',57,790]],
  a13:[['Perforante 2 lb (40 mm)','ke',57,790]],
  r35:[['Perforante 37 mm SA18','ke',23,388],['Explosivo 37 mm','he',3,388]],
  s35:[['Perforante 47 mm SA35','ke',50,660],['Explosivo 47 mm','he',5,590]],
  b1bis:[['Perforante 47 mm SA35','ke',50,660],['Obús de casco 75 mm','he',17,470]],
  pz1a:[['MG 13 perforante (SmK)','ke',14,800]],
  pz2a:[['Perforante 20 mm PzGr','ke',24,780],['Explosivo 20 mm','he',3,780]],
  pz3a:[['Perforante 37 mm PzGr','ke',40,745],['Explosivo 37 mm','he',4,745]],
  pz4a:[['Perforante 75 mm K.Gr.rot Pz.','ke',41,385],['Explosivo 75 mm','he',18,420]],
  t26:[['Perforante 45 mm BR-240','ke',50,760],['Explosivo 45 mm O-240','he',5,335]],
  bt5:[['Perforante 45 mm BR-240','ke',50,760],['Explosivo 45 mm O-240','he',5,335]],
  t28:[['Perforante 76 mm','ke',38,381],['Explosivo 76 mm','he',16,381]],
  m2a2:[['Browning 12,7 mm perforante','ke',22,810]],
  m2a4:[['Perforante 37 mm M51','ke',46,880],['Explosivo 37 mm','he',4,790]],
  pak36:[['Perforante 37 mm','ke',40,745]],
  at45:[['Perforante 45 mm','ke',50,760],['Explosivo 45 mm','he',5,335]],
  pdr2:[['Perforante 2 lb','ke',57,790]],
  at25:[['Perforante 25 mm','ke',40,900]],
  at37us:[['Perforante 37 mm','ke',46,880]]
});
for(const k of ['vmk2','lt6b','a9','a13','r35','s35','b1bis','pz1a','pz2a','pz3a','pz4a','t26','bt5','t28','m2a2','m2a4','pak36','at45','pdr2','at25','at37us']){
  FC[k]={crew:VEH[k].seats.length}; OPTIC[k]=VEH[k].static?[2.5]:['pz3a','pz4a','s35','a9','a13','m2a4'].includes(k)?[2.5]:[2]; }
FC.lt6b.autoL=1; FC.pz1a.autoL=1; FC.m2a2.autoL=1;
// Línea de cada clase: el primero de una clase en el rango II viene del último del rango I (si la nación tenía), o de este tanque
Object.assign(VEH.lt6b,{req:'whippet'}); Object.assign(VEH.pz1a,{req:'lk2'}); Object.assign(VEH.pz3a,{req:'pz2a'}); Object.assign(VEH.t28,{req:'bt5'});
// Cañones antitanque de cada nación en esta época (placeGuns)
const GUN_ERA={2:{de:'pak36',ru:'at45',uk:'pdr2',fr:'at25',us:'at37us'}};
// Pendiente máxima (rad) de los que se apartan del promedio de la época (CLIMB_ERA en 07-tanques.js)
Object.assign(VEH.mk1,{climb:.42}); Object.assign(VEH.mk4m,{climb:.42}); Object.assign(VEH.mk4f,{climb:.42}); Object.assign(VEH.mk5,{climb:.44}); Object.assign(VEH.mk5us,{climb:.44}); Object.assign(VEH.beute4,{climb:.42});
Object.assign(VEH.a7v,{climb:.3}); Object.assign(VEH.stchamond,{climb:.3}); Object.assign(VEH.schneider,{climb:.33}); Object.assign(VEH.ft17,{climb:.45}); Object.assign(VEH.ftus,{climb:.45});
Object.assign(VEH.bt5,{climb:.52}); Object.assign(VEH.lt6b,{climb:.5}); Object.assign(VEH.b1bis,{climb:.45}); Object.assign(VEH.t28,{climb:.44}); Object.assign(VEH.vmk2,{climb:.42});
