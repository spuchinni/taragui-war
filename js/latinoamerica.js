/* ---------- Latinoamérica: nación combinada con requisito (26/11/2026, pedido de Sebastián: "en la nación de Sudamérica me gustaría que
   también entre México, si da para que tenga su propia nación bien, si no la acoplamos"; México no da para una línea propia —solo Stuart,
   Greyhound, AMX-13 y ERC-90, ningún tanque de batalla—, así que entra acá; el nombre "Latinoamérica" lo eligió Sebastián).
   Junta a Chile, Uruguay y Paraguay (que eran naciones sueltas con 2–3 tanques de la v1) con México, Bolivia y Perú. Brasil y Argentina siguen aparte.
   Se abre al investigar el M24 Chaffee de EE. UU. (casi todos los blindados de la región llegaron de EE. UU. después de la guerra) y hay que
   comprar el primer tanque (no se regala). Cada copia lleva la bandera de su país en la chapa.
   Fuentes (26/11/2026):
   - México: mapleleafup.nl (Tratado de Río 1947: M3A1 y M5), Milenio y foro de War Thunder (17 M5), globalsecurity.org, defensa.com, armyrecognition.com (ERC-90).
   - Chile: foro de War Thunder (subárbol chileno: 12 M3A1 en 1943; 17 M4A1E9 en 1952), mapleleafup.nl/g104/rch.htm (30 Sherman por el Tratado de Río + 46 comprados).
   - Uruguay: defensa.com, tanks-encyclopedia.com, Revista del Ejército 35 (2019), armyrecognition.com (17 M24 de Corea en 1957–58; M24 UR 1983; reemplazados por M41C en 2018).
   - Bolivia: Wikipedia (SK-105, equipo de Bolivia: 54) y Los Tiempos (34 SK-105; "Bolivia ya tiene sus primeros tanques", 1979).
   - Perú: CIA Reading Room, history.state.gov (compra de 1973), militarnyi.com y defensa.com (unos 350 T-55 entre 1973 y 1978).
   Va después de brasil.js (usa copiaVeh, FLAG_INS y los requisitos de nación). */
(()=>{
  if(typeof copiaVeh!=='function') return;
  NATIONS.la={label:'Latinoamérica',desc:'México, Chile, Uruguay, Paraguay, Bolivia y Perú: Stuart, Sherman, Chaffee, SK-105, T-55, Leopard y más.',
    lineup:['st_mx','sh_cl','m24_uy'],names:['Sgto. Hernández','Cabo Rojas','Tte. Quispe','Sgto. Pereira','Cabo Mamani','Sold. Benítez'],
    camo:['#56583a','#6e6a48','#2c2d20'],abre:{veh:'m24',txt:'Investigá el M24 Chaffee de Estados Unidos'}};
  // aliados en la 2ª Guerra (México entró en 1942; los demás declararon la guerra al Eje antes de 1945)
  if(ERAS[3]&&ERAS[3].sides&&!ERAS[3].sides[0].includes('la')) ERAS[3].sides[0].push('la');
  if(typeof NAT_ERA!=='undefined'&&NAT_ERA[3]) NAT_ERA[3].la={label:'Latinoamérica',names:NATIONS.la.names};

  // ---- rango III ----
  copiaVeh('st_mx','m3stuart','la','mx',{label:'M3A1 Stuart (México)',year:1947,
    desc:'México recibió sus Stuart de EE. UU. después del Tratado de Río de 1947 (las fuentes hablan de 17 a 25, entre M3A1 y M5). Mismos números que el M3A1 Stuart.'});
  copiaVeh('sh_cl','m4a1','la','cl',{label:'M4A1 Sherman (Chile)',year:1952,
    desc:'Los Sherman llegaron a Chile después del Tratado de Río; las fuentes no coinciden (17 M4A1 en 1952, o 30 de EE. UU. y 46 comprados después). En los 80 se sumaron los M-51 israelíes con 105 mm. Modelo y números del M4A1.'});
  copiaVeh('m24_uy','m24','la','uy',{label:'M24 Chaffee (Uruguay)',year:1957,
    desc:'17 Chaffee llegaron a Uruguay entre 1957 y 1958, directo de Corea. En 1983 se repotenciaron (M24 UR) y sirvieron hasta 2018, cuando Brasil donó los M41C. Mismos números que el M24.'});
  // ---- rango V: los de Chile, Uruguay y Paraguay pasan a esta nación, más Bolivia y Perú ----
  for(const k of ['marder','leo1v','leo2a4','ee9','m41u','tiran','stuart','sherman']) if(VEH[k]) VEH[k].nation='la';
  copiaVeh('sk_bo','sk105','la','bo',{label:'SK-105 Kürassier (Bolivia)',year:1979,
    desc:'Los primeros tanques de Bolivia: cazacarros austríacos comprados a fines de los 70 (las fuentes dicen entre 34 y 54). Mismos números que el SK-105.'});
  copiaVeh('t55_pe','t55','la','pe',{label:'T-55 (Perú)',year:1973,
    desc:'Perú compró unos 350 T-55 a la Unión Soviética entre 1973 y 1978 (otras fuentes dicen menos). Mismos números que el T-55.'});
  // en los mapas del río Uruguay juega del lado de Uruguay (04-mundo.js: eastNat)

  // ---- garaje: lo que tenías en Chile, Uruguay o Paraguay pasa al de Latinoamérica ----
  { const _g=garRef; garRef=function(n){ const G=PROG.garage||(PROG.garage={});
      if(n==='la'&&!G.la){ const L=[]; for(const x of Object.keys(G)) if(/^(cl|uy|py)(@|$)/.test(x)) for(const k of G[x]||[]) if(VEH[k]&&VEH[k].nation==='la'&&!L.includes(k)&&L.length<3) L.push(k);
        if(L.length) G.la=L; }
      return _g.apply(this,arguments); }; }

  // ---- banderas ----
  const MC={}, mat=c=>MC[c]||(MC[c]=new THREE.MeshLambertMaterial({color:c}));
  // franjas: dir 'v' (verticales, de adelante hacia atrás) o 'h' (horizontales, de arriba abajo); w = pesos
  function franjas(g,dir,cols,w,s){ const H=.3*s, W=.44*s, tot=w.reduce((a,b)=>a+b,0); let acc=0;
    cols.forEach((c,i)=>{ const f=w[i]/tot, mid=(acc+f/2)-.5; acc+=f;
      if(dir==='v') box(g,.02,H,W*f,0,0,mid*W,mat(c)); else box(g,.02,H*f,W,0,-mid*H,0,mat(c)); }); }
  function flag(build){ return (parent,x,y,z,ry,s=1)=>{ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; parent.add(g); build(g,s); return g; }; }
  const disc=(g,r,c,y,z)=>{ const d=new THREE.Mesh(new THREE.CircleGeometry(r,14),mat(c)); d.rotation.y=Math.PI/2; d.position.set(.013,y,z); g.add(d); return d; };
  Object.assign(FLAG_INS,{
    mx:flag((g,s)=>{ franjas(g,'v',[0x0b6b3a,0xf2f2ee,0xc0262d],[1,1,1],s); disc(g,.045*s,0x8a5a2b,0,0); }),                       // verde, blanco, rojo y el escudo
    cl:flag((g,s)=>{ franjas(g,'h',[0xf2f2ee,0xd52b1e],[1,1],s); box(g,.022,.15*s,.15*s,0,.075*s,.145*s,mat(0x0039a6)); disc(g,.03*s,0xffffff,.075*s,.145*s); }),   // estrella blanca en el cuadro azul
    uy:flag((g,s)=>{ franjas(g,'h',[0xf2f2ee,0x2a5caa,0xf2f2ee,0x2a5caa,0xf2f2ee,0x2a5caa,0xf2f2ee,0x2a5caa,0xf2f2ee],[1,1,1,1,1,1,1,1,1],s);
      box(g,.022,.133*s,.18*s,0,.083*s,.13*s,mat(0xf2f2ee)); disc(g,.045*s,0xf5c518,.083*s,.13*s); }),                                    // franjas y el Sol de Mayo
    bo:flag((g,s)=>franjas(g,'h',[0xd52b1e,0xf9e300,0x007934],[1,1,1],s)),
    pe:flag((g,s)=>franjas(g,'v',[0xd91023,0xf2f2ee,0xd91023],[1,1,1],s)),
    co:flag((g,s)=>franjas(g,'h',[0xfcd116,0x003893,0xce1126],[2,1,1],s)),
  });
})();
