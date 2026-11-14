// Aviones más fieles (pedido de Sebastián con búsquedas de Sketchfab del A-10, B-17 y B-29 como referencia; hecho por
// código con las medidas reales). Reemplaza makeA10 (10-marcas-apoyo.js) y makeB29 (09-combate.js) y cambia el avión
// genérico del bombardeo pedido (airPass): B-17G para los Aliados en la 2ª Guerra, Ju 88 A-4 para el Eje y A-10 en la
// Guerra Fría.
//  · A-10A Thunderbolt II (16,26 × 17,53 m): fuselaje achatado, GAU-8 asomando abajo de la trompa, cabina de burbuja,
//    ala recta baja con las puntas caídas, carenados del tren, dos turbofán TF34 en góndolas arriba atrás, deriva doble
//    en las puntas del estabilizador, cargas bajo las alas; gris "Compass Ghost" de dos tonos e insignia de baja
//    visibilidad.
//  · B-17G Flying Fortress (22,66 × 31,62 m): trompa de plexiglás con torreta de mentón, cabina escalonada, torreta
//    dorsal, ventral esférica (Sperry), ventanas laterales con ametralladoras, puesto de cola, deriva enorme con aleta
//    dorsal, 4 radiales Wright Cyclone con hélices de 3 palas; metal natural o verde oliva, estrellas con barras.
//  · B-29 Superfortress (30,18 × 43,05 m): fuselaje cilíndrico con trompa redonda vidriada (con el marco), ala larga y
//    angosta, 4 góndolas largas con hélices de 4 palas, deriva alta, 4 torretas a control remoto y cola; bodega (`bay`).
//  · Ju 88 A-4 (14,36 × 20 m): trompa vidriada "ojo de escarabajo", góndola ventral, 2 Jumo 211 con radiador anular,
//    deriva simple; verde RLM 70 con cruces.
// Las hélices giran (lista SPIN, se actualiza envolviendo cullUpdate).
(function(){
  const SPIN=[];
  const mat=(c,o={})=>new THREE.MeshLambertMaterial(Object.assign({color:c},o));
  const glassM=o=>new THREE.MeshStandardMaterial(Object.assign({color:0x7d97a8,roughness:.08,metalness:.5,transparent:true,opacity:.6},o));
  // fuselaje torneado a lo largo de z: perfil [[z, radio]], sección escalada en x/y
  function fus(prof,sx=1,sy=1,seg=16){ const g=new THREE.LatheGeometry(prof.map(([z,r])=>new THREE.Vector2(Math.max(r,.001),z)),seg); g.rotateX(Math.PI/2); g.scale(sx,sy,1); return g; }
  // ala o plano: planta en x/z ([x, z]) extruida con un espesor, centrada en y
  function plan(pts,th){ const sh=new THREE.Shape(); pts.forEach(([x,z],i)=>i?sh.lineTo(x,z):sh.moveTo(x,z)); const g=new THREE.ExtrudeGeometry(sh,{depth:th,bevelEnabled:false}); g.rotateX(Math.PI/2); g.translate(0,th/2,0); return g; }
  // deriva: perfil en y/z ([z, y]) extruido en x
  function fin(pts,th){ const sh=new THREE.Shape(); pts.forEach(([z,y],i)=>i?sh.lineTo(z,y):sh.moveTo(z,y)); const g=new THREE.ExtrudeGeometry(sh,{depth:th,bevelEnabled:false}); g.rotateY(-Math.PI/2); g.translate(th/2,0,0); return g; }
  const M=(g,geo,m,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); o.rotation.set(rx,ry,rz); g.add(o); return o; };
  const cylZ=(r0,r1,l,s=12)=>{ const g=new THREE.CylinderGeometry(r0,r1,l,s); g.rotateX(Math.PI/2); return g; };
  // ala completa (dos mitades con diedro): semiala de raíz (x0) a punta, cuerda de raíz/punta, borde de ataque en z
  function wing(g,m,{x0=0,span,cr,ct,zle,sweep=0,th=.35,dih=0,y=0,tipR=0}){ for(const sd of [-1,1]){ const h=span/2-x0, P=[[0,zle],[h,zle-sweep],[h,zle-sweep-ct],[0,zle-cr]];
      if(tipR) P.splice(2,0,[h+tipR,zle-sweep-ct*.5]); const w=new THREE.Mesh(plan(P,th),m); w.scale.x=sd; w.position.set(sd*x0,y,0); w.rotation.z=sd*dih; g.add(w); } }
  // hélice: disco transparente + palas que giran
  const discM=new THREE.MeshBasicMaterial({color:0x222222,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false});
  function prop(g,x,y,z,R,n,bm){ const hub=new THREE.Group(); hub.position.set(x,y,z); g.add(hub); const sp=new THREE.Mesh(new THREE.SphereGeometry(R*.11,8,6),bm); sp.scale.z=1.6; hub.add(sp);
    const bl=new THREE.Group(); hub.add(bl); for(let i=0;i<n;i++){ const b=new THREE.Mesh(new THREE.BoxGeometry(R*.12,R,R*.03),bm); b.geometry.translate(0,R/2,0); b.rotation.z=i/n*Math.PI*2; bl.add(b); }
    const d=new THREE.Mesh(new THREE.CircleGeometry(R,20),discM); hub.add(d); SPIN.push({g,bl,w:rand(38,46)}); }
  // insignias
  const usStar=(()=>{ const c=document.createElement('canvas'); c.width=256; c.height=128; const x=c.getContext('2d'); const cx=128, cy=64, R=46;
    x.fillStyle='#2a3a6a'; x.fillRect(cx-R*2.05,cy-R*.42,R*4.1,R*.84); x.fillStyle='#fff'; x.fillRect(cx-R*1.95,cy-R*.32,R*3.9,R*.64);
    x.fillStyle='#2a3a6a'; x.beginPath(); x.arc(cx,cy,R,0,7); x.fill(); x.fillStyle='#fff'; x.beginPath();
    for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, r=i%2?R*.38:R*.95; x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r); } x.fill(); return new THREE.CanvasTexture(c); })();
  const lowStar=(()=>{ const c=document.createElement('canvas'); c.width=256; c.height=128; const x=c.getContext('2d'); const cx=128, cy=64, R=44; x.strokeStyle='#3a3f44'; x.lineWidth=5;
    x.strokeRect(cx-R*2,cy-R*.36,R*4,R*.72); x.fillStyle='#7a8186'; x.fillRect(cx-R*1.4,cy-R*.4,R*2.8,R*.8); x.beginPath(); x.arc(cx,cy,R,0,7); x.fill(); x.beginPath();
    for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, r=i%2?R*.38:R*.95; x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r); } x.closePath(); x.stroke(); return new THREE.CanvasTexture(c); })();
  const balken=(()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(14,44,100,40); x.fillRect(44,14,40,100);
    x.fillStyle='#111'; x.fillRect(24,52,80,24); x.fillRect(52,24,24,80); return new THREE.CanvasTexture(c); })();
  function decal(g,tex,w,h,x,y,z,rx,ry=0,rz=0){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:tex,transparent:true,alphaTest:.1,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));
    m.position.set(x,y,z); m.rotation.set(rx,ry,rz); g.add(m); return m; }
  const done=g=>{ g.traverse(o=>{ if(o.isMesh&&o.material!==discM) o.castShadow=true; }); return g; };

  // ---------------- A-10A ----------------
  window.makeA10=function(){
    const g=new THREE.Group(), m=mat(0x767d82,{fog:false}), d=mat(0x5d6469,{fog:false}), k=mat(0x2a2d30,{fog:false}), gl=glassM({fog:false});
    M(g,fus([[-7.7,.22],[-6.5,.42],[-4,.68],[-1,.8],[2,.82],[4.2,.76],[5.6,.64],[6.8,.5],[7.6,.34],[8.0,.2]],.95,1.0),m);
    M(g,new THREE.SphereGeometry(.55,12,8,0,Math.PI*2,0,Math.PI/2),gl,0,.62,4.7).scale.set(.85,.75,1.7);           // burbuja
    M(g,new THREE.BoxGeometry(.8,.12,1.6),d,0,.6,3.4);                                                               // lomo detrás de la cabina
    M(g,cylZ(.13,.13,.9,8),k,-.18,-.38,8.15); M(g,cylZ(.2,.2,.3,10),k,-.18,-.38,7.8);                                  // GAU-8
    wing(g,m,{x0:.6,span:7.2,cr:3.1,ct:2.8,zle:1.6,th:.36,y:-.48}); wing(g,m,{x0:3.6,span:17.5,cr:2.75,ct:1.9,zle:1.48,sweep:.1,th:.28,y:-.48,dih:.12});
    for(const sx of [-1,1]){ M(g,fus([[-1.4,.1],[-.6,.34],[.9,.36],[2.4,.2]],1,1.15,10),d,sx*2.45,-.85,0);              // carenados del tren
      // góndola TF34 sobre un pilón
      M(g,fus([[-5.2,.42],[-4.9,.56],[-3.2,.64],[-1.6,.64],[-1.25,.58]],1,1,14),m,sx*1.62,1.12,0); M(g,new THREE.CircleGeometry(.55,14),k,sx*1.62,1.12,-1.24);
      M(g,new THREE.CircleGeometry(.4,12),k,sx*1.62,1.12,-5.21).rotation.y=Math.PI; M(g,new THREE.BoxGeometry(.18,.55,1.8),d,sx*1.15,.75,-3.4);
      M(g,fin([[-1.2,0],[1.1,0],[.7,2.8],[-.6,2.8],[-1.5,1.4]],.16),d,sx*2.85,-.3+.25,-6.6);                              // derivas en las puntas
      M(g,cylZ(.12,.12,2.4,8),mat(0x9aa0a4,{fog:false}),sx*4.8,-1.05,.6); M(g,cylZ(.17,.17,1.8,8),mat(0x55603a,{fog:false}),sx*6.2,-1.05,.5); }   // Maverick y bomba
    M(g,plan([[-2.85,.3],[2.85,.3],[2.85,-1.25],[-2.85,-1.25]],.18),m,0,.25,-6.2);                                     // estabilizador
    for(const sx of [-1,1]){ decal(g,lowStar,2,1,sx*5.5,-.2,.6,-Math.PI/2,0,sx>0?Math.PI:0); decal(g,lowStar,1.5,.75,sx*.78,.1,-3.2,0,sx*Math.PI/2); }
    return done(g); };

  // ---------------- B-17G ----------------
  function makeB17(olive){
    const g=new THREE.Group(), c=olive?0x4f5236:0xb8bdc2, m=mat(c), d=mat(olive?0x3e402a:0x9aa0a6), k=mat(0x2a2a2a), gl=glassM(), dk=mat(0x1a1a1a);
    M(g,fus([[-11.3,.3],[-10.2,.55],[-7,.95],[-3,1.2],[2,1.28],[6.2,1.22],[8.4,1.08],[9.6,.92]],.92,1.05),m);
    M(g,fus([[9.55,.92],[10.4,.8],[11.0,.55],[11.35,.15]],.92,1.05),gl);                                                 // trompa de plexiglás
    M(g,new THREE.BoxGeometry(1.5,.55,1.8),gl,0,1.15,6.6); M(g,new THREE.BoxGeometry(1.2,.5,1.2),m,0,1.0,5.3);       // cabina escalonada
    M(g,new THREE.SphereGeometry(.6,12,8,0,Math.PI*2,0,Math.PI/2),gl,0,1.25,4.6);                                       // torreta dorsal
    M(g,new THREE.SphereGeometry(.62,12,10),gl,0,-1.25,-.8); M(g,new THREE.BoxGeometry(.8,.45,.7),d,0,-.95,10.5);        // ventral y mentón
    for(const sx of [-.12,.12]){ M(g,cylZ(.035,.035,1.2,5),k,sx,-.95,11.2); M(g,cylZ(.035,.035,1.3,5),k,sx,1.32,5.4); M(g,cylZ(.035,.035,1,5),k,sx,-1.25,-.1); }
    for(const sx of [-1,1]){ M(g,new THREE.BoxGeometry(.04,.55,1.1),dk,sx*1.1,.25,-4.3); M(g,cylZ(.03,.03,1,5),k,sx*1.15,.25,-4.1).rotation.y=sx*.6; }
    M(g,new THREE.BoxGeometry(.7,.75,.8),gl,0,.15,-11.1);                                                                // puesto de cola
    M(g,fin([[-3.5,.9],[-6.5,1.6],[-9.4,4.2],[-10.6,5.0],[-11.6,4.8],[-11.5,.8]],.3),d,0,0,0);                         // deriva con aleta dorsal
    M(g,plan([[-6.7,-9.1],[6.7,-9.6],[6.4,-11.3],[-6.4,-11.3]].map(([x,z])=>[x,z]),.22),m,0,.45,0);                       // estabilizador
    wing(g,m,{x0:.9,span:31.6,cr:5.9,ct:2.4,zle:3.4,sweep:1.6,th:.5,y:-.35,dih:.07,tipR:.5});
    for(const ex of [3.6,7.7]) for(const sd of [-1,1]){ const x=sd*ex, y=-.35+ex*.07;
      M(g,fus([[-1.8,.35],[-.2,.62],[1.6,.74],[2.2,.72]],1,1,14),d,x,y,2.6); M(g,cylZ(.76,.72,.9,16),k,x,y,4.75);
      prop(g,x,y,5.3,1.75,3,k); }
    for(const sd of [-1,1]){ decal(g,usStar,3.8,1.9,sd*11,-.05+.7,.8,-Math.PI/2,0,sd>0?Math.PI:0); decal(g,usStar,2.4,1.2,sd*1.13,.2,-6.2,0,sd*Math.PI/2); }
    return done(g); }
  window.makeB17=makeB17;

  // ---------------- B-29 ----------------
  const _b29=typeof makeB29==='function'?makeB29:null;
  window.makeB29=function(){
    const g=new THREE.Group(), m=mat(0xc4c9ce), d=mat(0xaab0b6), k=mat(0x2a2a2a), gl=glassM({opacity:.55}), fr=mat(0x8a9096);
    M(g,fus([[-15.1,.35],[-13.6,.85],[-10.5,1.4],[10.5,1.47],[12.4,1.42]],1,1,18),m);
    M(g,fus([[12.35,1.42],[13.6,1.28],[14.5,.95],[15.0,.5],[15.15,.05]],1,1,18),gl);                                    // trompa redonda vidriada
    for(const z of [12.9,13.6,14.3]){ const r=z<13?1.38:z<14?1.2:.98; M(g,new THREE.TorusGeometry(r,.025,4,24),fr,0,0,z); }
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; const b=M(g,new THREE.BoxGeometry(.04,.04,2.8),fr,Math.cos(a)*1.0,Math.sin(a)*1.0,13.8); b.lookAt(0,0,16); }
    M(g,fin([[-6,1.1],[-9.5,2.5],[-12.6,6.3],[-14.1,6.6],[-15,6.0],[-14.9,1]],.35),d);                                  // deriva alta
    M(g,plan([[-5,-11.7],[5,-12.4],[4.8,-14],[-4.8,-14]],.24),m,0,.6,0);
    wing(g,m,{x0:1.2,span:43,cr:5.6,ct:2.0,zle:4.2,sweep:1.3,th:.5,y:-.25,dih:.045,tipR:.4});
    for(const ex of [7.4,13.0]) for(const sd of [-1,1]){ const x=sd*ex, y=-.35+ex*.045;
      M(g,fus([[-3.4,.3],[-1,.68],[2.2,.8],[3.3,.78]],1,1,14),d,x,y,2.9); M(g,cylZ(.8,.78,.8,16),k,x,y,6.2); prop(g,x,y,6.7,2.5,4,k); }
    for(const [y,z] of [[1.35,8.5],[1.35,-3.8],[-1.35,6],[-1.35,-5.5]]){ M(g,new THREE.SphereGeometry(.42,10,6,0,Math.PI*2,0,Math.PI/2),fr,0,y,z).rotation.x=y<0?Math.PI:0;
      for(const sx of [-.1,.1]) M(g,cylZ(.03,.03,1,5),k,sx,y+(y<0?-.18:.18),z+.6); }
    M(g,new THREE.BoxGeometry(.7,.8,.7),gl,0,.2,-15.0); for(const sx of [-.12,.12]) M(g,cylZ(.035,.035,1,5),k,sx,.1,-15.6);
    const bay=M(g,new THREE.BoxGeometry(1.6,.12,6),mat(0x3a3c40),0,-1.42,1); g.userData.bay=bay;
    for(const sd of [-1,1]){ decal(g,usStar,4.2,2.1,sd*15,.6,.6,-Math.PI/2,0,sd>0?Math.PI:0); decal(g,usStar,2.8,1.4,sd*1.47,.1,-8.5,0,sd*Math.PI/2); }
    return done(g); };

  // ---------------- Ju 88 A-4 (14,36 × 20,08 m) ----------------
  // camuflaje astillado RLM 70/71 arriba (textura hecha por código) y RLM 65 abajo
  const splinter=(()=>{ const c=document.createElement('canvas'); c.width=c.height=256; const x=c.getContext('2d'); x.fillStyle='#3a4733'; x.fillRect(0,0,256,256); x.fillStyle='#2b3527';
    const R=mulberry0(88); for(let i=0;i<9;i++){ x.beginPath(); let px=R()*256, py=R()*256; x.moveTo(px,py); for(let k=0;k<4;k++){ px+=(R()-.5)*180; py+=(R()-.5)*180; x.lineTo(px,py); } x.closePath(); x.fill(); }
    const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(.18,.18); return t; })();
  function makeJu88(){
    const g=new THREE.Group(), m=mat(0xffffff,{map:splinter}), u=mat(0x8aa4b8), k=mat(0x1e1e1e), gl=glassM({opacity:.5}), fr=mat(0x2b3527), yel=mat(0xd8b830);
    M(g,fus([[-7.25,.18],[-6.4,.36],[-4,.66],[-1.2,.84],[1.6,.88],[2.6,.86]],.88,1.08,16),m);
    // cabina "ojo de escarabajo": cúpula vidriada que avanza hasta la trompa, con marcos
    const dome=M(g,new THREE.SphereGeometry(1,16,12),gl,0,.2,3.0); dome.scale.set(.86,1.0,1.75);
    for(const a of [-.9,-.45,0,.45,.9]){ const r=M(g,new THREE.TorusGeometry(1,.02,4,24,Math.PI),fr,0,.2,3.0); r.scale.set(.87,1.01,1.76); r.rotation.set(0,Math.PI/2,a); }
    for(const z of [2.2,3.4,4.2]){ const rr=Math.sqrt(Math.max(0,1-((z-3)/1.75)**2)); const t2=M(g,new THREE.TorusGeometry(rr,.02,4,24),fr,0,.2,z); t2.scale.set(.87,1.01,1); }
    M(g,fus([[-.2,.3],[.4,.52],[1.4,.56],[2.0,.45]],1,.8,10),gl,0,.98,0.9);                                       // puesto del artillero de atrás
    M(g,cylZ(.025,.025,.9,5),k,0,1.05,-.3).rotation.x=-.25;
    // góndola ventral "Bola" corrida a la derecha, con vidrio atrás y la MG
    M(g,fus([[-.6,.18],[.2,.42],[2.4,.46],[3.1,.3]],1.05,1,10),u,.22,-.78,1.4); M(g,new THREE.SphereGeometry(.4,10,8),gl,.22,-.8,.9).scale.set(1.05,1,1.2); M(g,cylZ(.022,.022,.8,5),k,.22,-.82,.3);
    // alas con puntas redondas, frenos de picada abajo, alerones
    wing(g,m,{x0:.5,span:20.08,cr:3.75,ct:1.7,zle:2.1,sweep:.5,th:.42,y:-.32,dih:.09,tipR:.7});
    for(const sd of [-1,1]){ M(g,new THREE.BoxGeometry(2.6,.05,.25),k,sd*6.2,-.68,.95); }
    // motores Jumo 211 con radiador anular (frente redondo, anillo y cuernos de escape)
    for(const sd of [-1,1]){ const x=sd*2.85, y=-.16;
      M(g,fus([[-3.6,.18],[-1.6,.52],[1.2,.72],[2.7,.8],[3.25,.82]],1,1.05,16),m,x,y,0); M(g,new THREE.TorusGeometry(.72,.12,8,20),k,x,y,3.3);
      M(g,new THREE.CircleGeometry(.62,18),mat(0x2a2a2a),x,y,3.35); M(g,new THREE.TorusGeometry(.74,.04,4,20),yel,x,y,3.42);
      for(const sx of [-1,1]) for(let i=0;i<3;i++) M(g,new THREE.BoxGeometry(.1,.06,.18),mat(0x4a2e22),x+sx*.78,y+.15-i*.18,2.4-i*.3);
      prop(g,x,y,3.55,1.65,3,k); M(g,new THREE.ConeGeometry(.2,.45,10),yel,x,y,3.72).rotation.x=Math.PI/2;
      M(g,fus([[-1.3,.1],[-.6,.36],[.4,.4],[1.0,.28]],1,1,8),u,x,y-.62,.6);                                         // carenado del tren
      decal(g,balken,1.7,1.7,sd*7.3,-.32+7.3*.09+.23,.4,-Math.PI/2); decal(g,balken,1.2,1.2,sd*.75,.05,-3.6,0,sd*Math.PI/2); }
    // cola: deriva alta con la punta redonda, timón y estabilizador con puntas redondas
    M(g,fin([[-5.2,.55],[-6.3,2.2],[-6.8,3.05],[-7.3,3.1],[-7.7,2.7],[-7.8,.4]],.18),m);
    M(g,plan([[-3.3,-6.0],[-3.6,-6.6],[-3.3,-7.25],[3.3,-7.25],[3.6,-6.6],[3.3,-6.0]],.15),m,0,.35,0);
    M(g,new THREE.CylinderGeometry(.85,.85,.6,16,1,true),yel,0,0,-3.9).rotation.x=Math.PI/2;                       // franja amarilla del frente oriental
    M(g,new THREE.CylinderGeometry(.01,.01,1.2,4),k,0,1.35,.2);                                                       // mástil de la antena
    return done(g); }
  window.makeJu88=makeJu88;

  // ---------------- P-47D-25 Thunderbolt (11,0 × 12,42 m) ----------------
  function makeP47(){
    const nm=Math.random()<.45, g=new THREE.Group(), m=mat(nm?0xb8bdc2:0x4f5236), u=mat(nm?0xa8aeb4:0x8a8e8a), k=mat(0x1c1c1c), gl=glassM({opacity:.45}), fr=mat(nm?0x9aa0a6:0x3e402a),
      cowlC=mat([0xc02020,0xe8c020,0x2a4aa0,0xf0f0f0][(Math.random()*4)|0]), wht=mat(0xf0f0ec), blk=mat(0x111111);
    // fuselaje gordo y ovalado (el turbocompresor va abajo, atrás): la sección baja más que sube
    const f=M(g,fus([[-6.4,.12],[-5.6,.32],[-3.2,.62],[-.8,.8],[1.6,.84],[3.4,.82],[4.2,.8]],.82,1.12,18),m); f.position.y=-.08;
    M(g,cylZ(.8,.8,.75,20),cowlC,0,-.08,4.55); M(g,new THREE.TorusGeometry(.72,.07,6,20),cowlC,0,-.08,4.95);           // capó con el anillo de color
    M(g,new THREE.CircleGeometry(.68,20),k,0,-.08,4.94); for(let i=0;i<9;i++){ const a=i/9*Math.PI*2; M(g,cylZ(.07,.07,.3,6),mat(0x5a5a5a),Math.cos(a)*.48,-.08+Math.sin(a)*.48,4.82); }
    M(g,new THREE.SphereGeometry(.42,12,8),k,0,-.82,4.2).scale.set(1.2,.55,1.6);                                     // toma de aire del mentón
    // burbuja y parabrisas, lomo bajo detrás
    const cb=M(g,new THREE.SphereGeometry(.5,14,10,0,Math.PI*2,0,Math.PI/2),gl,0,.64,1.25); cb.scale.set(.85,1.0,2.0);
    M(g,new THREE.BoxGeometry(.7,.3,.5),gl,0,.74,2.15).rotation.x=-.45; M(g,new THREE.TorusGeometry(.42,.025,4,16,Math.PI),fr,0,.66,2.0);
    // alas elípticas con 4 ametralladoras .50 en cada una, cohetes HVAR y bombas
    const ell=[]; for(let i=0;i<=12;i++){ const x=i/12*5.85, c=2.75*Math.sqrt(Math.max(.02,1-(x/6.1)**2)); ell.push([x,.95-(2.75-c)*.3]); } for(let i=12;i>=0;i--){ const x=i/12*5.85, c=2.75*Math.sqrt(Math.max(.02,1-(x/6.1)**2)); ell.push([x,.95-(2.75-c)*.3-c]); }
    for(const sd of [-1,1]){ const w=M(g,plan(ell,.34),m,sd*.35,-.55,0); w.scale.x=sd; w.rotation.z=sd*.07;
      for(let i=0;i<4;i++){ const x=sd*(2.35+i*.32); M(g,cylZ(.025,.025,.9,5),k,x,-.48+Math.abs(x)*.07,1.25); }
      for(let i=0;i<3;i++){ const x=sd*(3.9+i*.5); M(g,cylZ(.06,.06,1.6,6),mat(0x6a6e5a),x,-.88+Math.abs(x)*.07,.2); M(g,new THREE.BoxGeometry(.03,.14,1.2),k,x,-.76+Math.abs(x)*.07,.3); }
      M(g,cylZ(.19,.19,1.5,10),mat(0x44473a),sd*2.0,-.98,.5); M(g,new THREE.ConeGeometry(.19,.4,10),mat(0x44473a),sd*2.0,-.98,1.45).rotation.x=Math.PI/2;
      // franjas de invasión (blanco y negro) sobre el ala
      for(let b=0;b<5;b++) M(g,new THREE.BoxGeometry(.02,.36,.26),b%2?blk:wht,sd*(3.0+b*.26),-.55+(3.0+b*.26)*.07,-.55).rotation.y=Math.PI/2;
      decal(g,usStar,2.4,1.2,sd*4.6,-.55+4.6*.07+.19,-.4,-Math.PI/2,0,sd>0?Math.PI:0); decal(g,usStar,1.4,.7,sd*.71,-.05,-1.6,0,sd*Math.PI/2); }
    for(let b=0;b<5;b++){ const r=M(g,new THREE.CylinderGeometry(.5-b*.012,.5-b*.012,.16,16,1,true),b%2?blk:wht,0,-.12,-3.9-b*.16); r.rotation.x=Math.PI/2; r.scale.set(1.25,1.5,1); }
    M(g,cylZ(.3,.3,2.1,12),mat(0x8a8e8a),0,-.98,.6); M(g,new THREE.ConeGeometry(.3,.6,12),mat(0x8a8e8a),0,-.98,1.95).rotation.x=Math.PI/2;      // tanque ventral
    // cola: deriva con aleta dorsal, estabilizador elíptico
    M(g,fin([[-3.2,.5],[-5.4,1.3],[-6.0,2.05],[-6.45,2.0],[-6.6,1.5],[-6.5,.2]],.16),m);
    const st=[]; for(let i=0;i<=8;i++){ const x=i/8*2.35, c=1.35*Math.sqrt(Math.max(.03,1-(x/2.45)**2)); st.push([x,-5.25-(1.35-c)*.25]); } for(let i=8;i>=0;i--){ const x=i/8*2.35, c=1.35*Math.sqrt(Math.max(.03,1-(x/2.45)**2)); st.push([x,-5.25-(1.35-c)*.25-c]); }
    for(const sd of [-1,1]){ const s=M(g,plan(st,.12),m,0,.15,0); s.scale.x=sd; }
    prop(g,0,-.08,5.15,1.9,4,k); M(g,new THREE.ConeGeometry(.24,.5,12),cowlC,0,-.08,5.3).rotation.x=Math.PI/2;
    return done(g); }
  window.makeP47=makeP47;

  // ================= Aviones por país (pedido de Sebastián con búsquedas de Sketchfab; hecho por código con las medidas reales) =================
  // Apoyo (G): Ju 87 B-2 Stuka (Eje), Il-2 Shturmovik (URSS), P-47 (EE. UU.), Hawker Typhoon Mk Ib (R. Unido), Northrop 8A-2 (Argentina, 30 llegados en 1938).
  // Paracaidistas: Ju 52/3m (Alemania; Argentina tuvo Ju 52 en la Escuadrilla de Transporte de El Palomar desde 1939), C-47 Skytrain (EE. UU.),
  // Dakota (R. Unido) y Li-2 (URSS: el DC-3 hecho bajo licencia, con torreta dorsal).
  const redStar=(()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'), st=(R,col)=>{ x.fillStyle=col; x.beginPath();
      for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, r=i%2?R*.4:R; x.lineTo(64+Math.cos(a)*r,66+Math.sin(a)*r); } x.closePath(); x.fill(); };
    st(60,'#b01818'); st(52,'#f4f0e6'); st(44,'#c41e1e'); return new THREE.CanvasTexture(c); })();
  const roundel=cols=>{ const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'); cols.forEach(([col,r])=>{ x.fillStyle=col; x.beginPath(); x.arc(64,64,r,0,7); x.fill(); }); return new THREE.CanvasTexture(c); };
  const rafC1=roundel([['#e8c020',62],['#24346a',56],['#f0eee6',34],['#b8202a',22]]), rafB=roundel([['#24346a',62],['#b8202a',30]]);
  const argR=roundel([['#6cace4',62],['#f6f6f2',42],['#6cace4',20]]);
  const stripesTex=cols=>{ const c=document.createElement('canvas'); c.width=96; c.height=64; const x=c.getContext('2d'); cols.forEach((col,i)=>{ x.fillStyle=col; x.fillRect(i*96/cols.length,0,96/cols.length+1,64); }); return new THREE.CanvasTexture(c); };
  const argRud=stripesTex(['#6cace4','#f6f6f2','#6cace4']);
  // chapa corrugada del Junkers: franjas claras y oscuras a lo largo
  const corr=(rep)=>{ const c=document.createElement('canvas'); c.width=64; c.height=8; const x=c.getContext('2d'); for(let i=0;i<64;i++){ const v=Math.round(200+40*Math.sin(i/64*Math.PI*2*4)); x.fillStyle=`rgb(${v},${v},${v})`; x.fillRect(i,0,1,8); }
    const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep,1); return t; };
  const struts=(g,m,a,b,r=.035)=>{ const A=new THREE.Vector3(...a), B=new THREE.Vector3(...b), L=A.distanceTo(B), o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,5),m);
    o.position.copy(A).add(B).multiplyScalar(.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize()); g.add(o); return o; };
  const spat=(g,m,k,x,y,z,len=1.3,r=.32)=>{ M(g,fus([[-len*.55,.06],[-len*.2,r],[len*.25,r*1.02],[len*.5,.08]],.6,1,10),m,x,y,z); M(g,new THREE.CylinderGeometry(r*.92,r*.92,.12,12),k,x,y-.05,z).rotation.z=Math.PI/2; };

  // ---------------- Ju 87 B-2 Stuka (11,1 × 13,8 m): ala de gaviota invertida, tren fijo carenado, cabina larga, sirena "trompeta de Jericó" ----------------
  function makeJu87(){
    const g=new THREE.Group(), m=mat(0xffffff,{map:splinter}), u=mat(0x8aa4b8), k=mat(0x1c1c1c), gl=glassM({opacity:.5}), fr=mat(0x2b3527), yel=mat(0xd8b830), bm=mat(0x4a4a3e);
    M(g,fus([[-5.6,.12],[-4.6,.34],[-2,.6],[0,.68],[2,.7],[3.6,.66],[4.7,.55],[5.4,.36]],.82,1.15,16),m);
    M(g,new THREE.BoxGeometry(.9,.5,1.5),k,0,-.78,3.9); M(g,new THREE.BoxGeometry(.75,.08,1.2),mat(0x333333),0,-1.04,3.9);   // radiador bajo la trompa
    for(const sx of [-1,1]) for(let i=0;i<6;i++) M(g,cylZ(.04,.05,.18,5),k,sx*.52,.12-i*.1,4.6-i*.12).rotation.y=sx*.4;    // escapes del Jumo 211
    // cabina larga de dos plazas con marcos y la MG 15 trasera
    const cb=M(g,new THREE.SphereGeometry(1,14,10,0,Math.PI*2,0,Math.PI/2),gl,0,.62,.6); cb.scale.set(.46,.52,1.9);
    for(const z of [-.9,-.2,.5,1.2,1.9]) M(g,new THREE.TorusGeometry(.44,.025,4,14,Math.PI),fr,0,.64,z).scale.set(1,1.1,1);
    M(g,cylZ(.03,.03,1.1,5),k,0,.95,-1.5).rotation.x=-.25;
    // ala de gaviota invertida: tramo interior que baja y exterior que sube
    wing(g,m,{x0:.4,span:5.4,cr:2.55,ct:2.35,zle:1.25,th:.36,y:-.32,dih:-.26});
    wing(g,m,{x0:2.62,span:13.8,cr:2.3,ct:1.15,zle:1.17,sweep:.25,th:.28,y:-.9,dih:.1,tipR:.25});
    for(const sd of [-1,1]){ const kx=sd*2.62;
      for(let i=0;i<3;i++) M(g,new THREE.BoxGeometry(.9,.04,.12),k,sd*(3.6+i*1.0),-.95+(1+i)*.1,.2);                    // frenos de picada bajo el ala
      M(g,new THREE.BoxGeometry(.16,1.0,.5),m,kx,-1.4,1.0); spat(g,m,k,kx,-2.05,1.0,1.4,.36);                              // pata del tren con su carenado
      if(sd<0){ M(g,new THREE.CylinderGeometry(.11,.11,.3,8),bm,kx-.18,-1.25,1.55).rotation.x=Math.PI/2; prop(g,kx-.18,-1.25,1.74,.18,2,k); }   // sirena
      decal(g,balken,1.3,1.3,sd*5.4,-.9+2.8*.1+.16,.55,-Math.PI/2); decal(g,balken,.9,.9,sd*.6,.1,-2.4,0,sd*Math.PI/2); }
    M(g,cylZ(.2,.2,1.9,10),bm,0,-.95,.9); M(g,new THREE.ConeGeometry(.2,.4,10),bm,0,-.95,1.95).rotation.x=Math.PI/2;             // bomba de 250 kg
    M(g,fin([[-3.9,.55],[-4.9,1.3],[-5.3,1.85],[-5.75,1.8],[-5.85,.9],[-5.7,.3]],.14),m);
    for(const sd of [-1,1]){ const s=M(g,plan([[0,-4.55],[2.4,-4.85],[2.4,-5.45],[0,-5.6]],.12),m,0,.25,0); s.scale.x=sd; struts(g,k,[sd*.2,-.2,-5.0],[sd*1.4,.27,-5.05],.025); }
    prop(g,0,0,5.65,1.7,3,k); M(g,new THREE.ConeGeometry(.28,.55,12),yel,0,0,5.85).rotation.x=Math.PI/2;
    return done(g); }
  window.makeJu87=makeJu87;

  // ---------------- Il-2 Shturmovik (11,6 × 14,6 m): trompa blindada, cabina de dos plazas con el ametrallador atrás, cohetes RS-82 ----------------
  function makeIl2(){
    const g=new THREE.Group(), m=mat(0x4a5a35), d=mat(0x2a3020), u=mat(0x8aa6b8), k=mat(0x1c1c1c), gl=glassM({opacity:.5}), fr=mat(0x3a4a2a);
    M(g,fus([[-6,.12],[-5,.3],[-2.2,.58],[0,.72],[2,.74],[3.6,.7],[4.8,.55],[5.5,.38]],.85,1.05,16),m);
    M(g,new THREE.BoxGeometry(.95,.42,1.6),d,0,-.42,3.6);                                                                    // bañera blindada (más oscura)
    M(g,new THREE.BoxGeometry(.6,.22,.9),d,0,.6,3.7);                                                                       // toma de aire arriba
    const cb=M(g,new THREE.SphereGeometry(1,14,10,0,Math.PI*2,0,Math.PI/2),gl,0,.66,.9); cb.scale.set(.44,.5,1.35);
    for(const z of [.1,.8,1.5]) M(g,new THREE.TorusGeometry(.42,.025,4,14,Math.PI),fr,0,.68,z);
    M(g,new THREE.TorusGeometry(.32,.04,5,12),k,0,.78,-.6).rotation.x=Math.PI/2; M(g,cylZ(.035,.035,1.1,5),k,0,.95,-1.2).rotation.x=-.2;   // ametrallador UBT atrás
    wing(g,m,{x0:.45,span:4.6,cr:3.0,ct:2.9,zle:1.5,th:.4,y:-.4});
    wing(g,m,{x0:2.3,span:14.6,cr:2.9,ct:1.3,zle:1.5,sweep:.75,th:.3,y:-.4,dih:.09,tipR:.25});
    for(const sd of [-1,1]){ M(g,fus([[-1.5,.1],[-.5,.36],[.8,.38],[1.5,.15]],.9,1.2,10),m,sd*2.3,-.75,.4);                // góndolas del tren
      M(g,cylZ(.05,.05,1.2,6),k,sd*2.9,-.55,1.9);                                                                            // cañón VYa de 23 mm
      for(let i=0;i<4;i++){ const x=sd*(3.6+i*.6), y=-.5+(Math.abs(x)-2.3)*.09-.22; M(g,cylZ(.05,.05,.95,6),mat(0x6a6a5a),x,y,.6); M(g,new THREE.BoxGeometry(.03,.1,1.1),k,x,y+.08,.6); }
      decal(g,redStar,1.4,1.4,sd*5.8,-.4+3.5*.09-.17,.4,Math.PI/2); decal(g,redStar,.95,.95,sd*.62,.0,-2.6,0,sd*Math.PI/2); }
    M(g,fin([[-4.1,.55],[-5.2,1.25],[-5.7,1.9],[-6.15,1.85],[-6.25,.9],[-6.05,.3]],.14),m); decal(g,redStar,.7,.7,.09,1.15,-5.5,0,Math.PI/2); decal(g,redStar,.7,.7,-.09,1.15,-5.5,0,-Math.PI/2);
    for(const sd of [-1,1]){ const s=M(g,plan([[0,-4.6],[2.4,-4.9],[2.4,-5.55],[0,-5.75]],.12),m,0,.2,0); s.scale.x=sd; }
    prop(g,0,0,5.7,1.7,3,k); M(g,new THREE.ConeGeometry(.3,.6,12),d,0,0,5.9).rotation.x=Math.PI/2;
    return done(g); }
  window.makeIl2=makeIl2;

  // ---------------- Hawker Typhoon Mk Ib (9,73 × 12,67 m): gran radiador en el mentón, burbuja, 4 cañones de 20 mm, 8 cohetes RP-3, franjas de invasión ----------------
  function makeTyphoon(){
    const g=new THREE.Group(), m=mat(0x4b5236), k=mat(0x1c1c1c), gl=glassM({opacity:.45}), wht=mat(0xf0f0ec), blk=mat(0x111111), sky=mat(0xb8c8a8), fr=mat(0x3a4028);
    M(g,fus([[-5.3,.1],[-4.2,.3],[-1.6,.56],[1,.64],[3,.64],[4.2,.6],[4.6,.52]],.85,1.1,16),m);
    const ch=M(g,new THREE.SphereGeometry(1,14,10),k,0,-.72,3.45); ch.scale.set(.62,.42,1.0); M(g,new THREE.CircleGeometry(.5,14),mat(0x333333),0,-.72,4.42).scale.set(1.15,.75,1);   // radiador del mentón
    for(const sx of [-1,1]) for(let i=0;i<4;i++) M(g,cylZ(.04,.05,.16,5),k,sx*.55,.15,3.6-i*.25).rotation.y=sx*.5;
    const cb=M(g,new THREE.SphereGeometry(.5,14,10,0,Math.PI*2,0,Math.PI/2),gl,0,.6,.9); cb.scale.set(.85,1.0,1.9); M(g,new THREE.TorusGeometry(.42,.025,4,16,Math.PI),fr,0,.62,1.75);
    for(let b=0;b<1;b++) M(g,new THREE.CylinderGeometry(.5,.5,.32,16,1,true),sky,0,-.05,-3.6).rotation.x=Math.PI/2;   // franja "sky" de la cola
    wing(g,m,{x0:.4,span:12.67,cr:2.65,ct:1.25,zle:1.1,sweep:.3,th:.42,y:-.42,dih:.07,tipR:.3});
    for(const sd of [-1,1]){
      for(const x of [2.1,2.55]) M(g,cylZ(.045,.045,1.5,6),k,sd*x,-.42+x*.07,1.6);                                          // Hispano de 20 mm
      for(let i=0;i<4;i++){ const x=sd*(3.0+i*.55), y=-.42+Math.abs(x)*.07-.3; M(g,cylZ(.04,.04,1.4,5),mat(0x6a6e5a),x,y,.4); M(g,cylZ(.08,.08,.5,8),mat(0x55583e),x,y,1.25); M(g,new THREE.BoxGeometry(.03,.12,1.4),k,x,y+.12,.35); }
      for(let b=0;b<5;b++) M(g,new THREE.BoxGeometry(.02,.44,.28),b%2?blk:wht,sd*(2.1+b*.28),-.42+(2.1+b*.28)*.07,-.25).rotation.y=Math.PI/2;
      decal(g,rafB,1.5,1.5,sd*4.6,-.42+4.6*.07+.22,.0,-Math.PI/2); decal(g,rafC1,1.0,1.0,sd*.66,-.05,-2.2,0,sd*Math.PI/2); }
    for(let b=0;b<5;b++){ const r=M(g,new THREE.CylinderGeometry(.45-b*.015,.45-b*.015,.16,16,1,true),b%2?blk:wht,0,-.1,-2.9-b*.16); r.rotation.x=Math.PI/2; r.scale.set(1.2,1.4,1); }
    M(g,fin([[-3.9,.5],[-4.7,1.2],[-5.15,1.85],[-5.55,1.8],[-5.6,.8],[-5.4,.25]],.14),m);
    for(const sd of [-1,1]){ const s=M(g,plan([[0,-4.3],[2.35,-4.6],[2.35,-5.25],[0,-5.45]],.12),m,0,.2,0); s.scale.x=sd; }
    prop(g,0,0,4.85,2.0,4,k); M(g,new THREE.ConeGeometry(.3,.6,12),blk,0,0,5.0).rotation.x=Math.PI/2;
    return done(g); }
  window.makeTyphoon=makeTyphoon;

  // ---------------- Northrop 8A-2 (9,8 × 14,5 m): radial Cyclone con anillo, tren fijo con "pantalones", cabina larga de dos plazas ----------------
  function makeNorthrop(){
    const g=new THREE.Group(), m=mat(0x5a5c40), k=mat(0x1c1c1c), gl=glassM({opacity:.45}), fr=mat(0x45472f), bm=mat(0x4a4a3e);
    M(g,fus([[-5.1,.1],[-4,.28],[-1.6,.55],[1,.62],[2.8,.62],[3.6,.6]],.9,1.1,16),m);
    M(g,cylZ(.7,.68,.7,18),m,0,0,3.95); M(g,new THREE.CircleGeometry(.6,18),k,0,0,4.31); for(let i=0;i<9;i++){ const a=i/9*Math.PI*2; M(g,cylZ(.06,.06,.25,6),mat(0x5a5a5a),Math.cos(a)*.42,Math.sin(a)*.42,4.22); }
    const cb=M(g,new THREE.SphereGeometry(1,14,10,0,Math.PI*2,0,Math.PI/2),gl,0,.6,.3); cb.scale.set(.42,.5,2.1);
    for(const z of [-1.2,-.4,.4,1.2,1.9]) M(g,new THREE.TorusGeometry(.4,.025,4,14,Math.PI),fr,0,.62,z);
    M(g,cylZ(.03,.03,1,5),k,0,.95,-1.7).rotation.x=-.2;
    wing(g,m,{x0:.45,span:14.5,cr:3.1,ct:1.3,zle:1.4,sweep:.6,th:.38,y:-.45,dih:.08,tipR:.3});
    for(const sd of [-1,1]){ M(g,fus([[-1.1,.06],[-.3,.3],[.5,.32],[.9,.12]],.55,1,10),m,sd*1.9,-1.1,1.0); M(g,new THREE.BoxGeometry(.2,.6,.9),m,sd*1.9,-.7,1.0); spat(g,m,k,sd*1.9,-1.55,1.0,1.4,.36);   // "pantalones" del tren
      for(let i=0;i<2;i++) M(g,cylZ(.11,.11,.9,8),bm,sd*(3.4+i*.7),-.75+(3.4+i*.7)*.08-.15,.6);
      decal(g,argR,1.3,1.3,sd*5.3,-.45+5.3*.08+.2,.2,-Math.PI/2); decal(g,argR,.85,.85,sd*.58,.05,-2.0,0,sd*Math.PI/2); }
    M(g,fin([[-3.9,.5],[-4.7,1.2],[-5.1,1.8],[-5.5,1.75],[-5.55,.8],[-5.4,.25]],.13),m);
    for(const sd of [-1,1]) decal(g,argRud,.7,1.1,sd*.075,1.05,-5.15,0,sd*Math.PI/2);
    for(const sd of [-1,1]){ const s=M(g,plan([[0,-4.3],[2.3,-4.6],[2.3,-5.2],[0,-5.4]],.12),m,0,.2,0); s.scale.x=sd; }
    prop(g,0,0,4.45,1.55,3,k); M(g,new THREE.ConeGeometry(.24,.45,12),mat(0x8a8a80),0,0,4.6).rotation.x=Math.PI/2;
    return done(g); }
  window.makeNorthrop=makeNorthrop;

  // ---------------- Ju 52/3m (18,9 × 29,25 m): trimotor de chapa corrugada, tren fijo, flaps "ala doble" Junkers ----------------
  function makeJu52(nat){
    const ar=nat==='ar', base=ar?0x8a8c80:0x55603f, cf=corr(40), cw=corr(1), g=new THREE.Group(), m=mat(base,{map:cf}), w=mat(base,{map:cw}), k=mat(0x1c1c1c), gl=glassM({opacity:.5}), dk=mat(ar?0x6a6c62:0x3e4630), yel=mat(0xd8b830);
    cw.repeat.set(5,5);
    M(g,fus([[-9.6,.15],[-8,.45],[-4,1.0],[0,1.15],[4,1.15],[6.4,1.06],[7.7,.85],[8.5,.6]],.85,1.25,8),m);
    for(const sx of [-1,1]){ for(let i=0;i<5;i++) M(g,new THREE.BoxGeometry(.05,.42,.55),k,sx*.98,.35,3.2-i*1.25); M(g,new THREE.BoxGeometry(.05,.45,1.2),gl,sx*.75,.95,6.6).rotation.z=-sx*.35; }
    M(g,new THREE.BoxGeometry(1.3,.35,1.2),gl,0,1.25,6.5);                                                                     // cabina
    // motores BMW 132 con anillo Townend: uno en la trompa y dos en el ala
    const eng=(x,y,z)=>{ M(g,cylZ(.72,.7,.65,16),dk,x,y,z); M(g,new THREE.CircleGeometry(.6,16),k,x,y,z+.33); M(g,fus([[-1.8,.25],[-.6,.55],[0,.62]],1,1,10),dk,x,y,z-.35); prop(g,x,y,z+.55,1.5,3,k); };
    eng(0,-.05,8.9); for(const sd of [-1,1]) eng(sd*5.0,-.55,4.4);
    wing(g,w,{x0:.85,span:29.25,cr:5.0,ct:2.0,zle:3.4,sweep:1.6,th:.5,y:-.85,dih:.07,tipR:.3});
    for(const sd of [-1,1]){ M(g,new THREE.BoxGeometry(12.5,.06,.7),w,sd*7.6,-1.15+7.6*.07,-1.9).rotation.z=sd*.07;            // flaps "ala doble"
      struts(g,k,[sd*5,-1.0,3],[sd*5,-2.7,3.1],.07); struts(g,k,[sd*1.1,-1.15,3.1],[sd*5,-2.7,3.1],.06); spat(g,dk,k,sd*5,-2.85,3.1,1.6,.45); }
    M(g,fin([[-6.6,1.1],[-8.4,2.4],[-9.0,3.6],[-9.7,3.6],[-9.9,1.0]],.18),w);
    for(const sd of [-1,1]){ const s=M(g,plan([[0,-7.6],[4.6,-8.1],[4.6,-9.2],[0,-9.6]],.16),w,0,.55,0); s.scale.x=sd; struts(g,k,[sd*.6,-.3,-8.4],[sd*2.6,.58,-8.6],.03); }
    if(ar){ for(const sd of [-1,1]){ decal(g,argR,2.2,2.2,sd*10,-.85+10*.07+.27,1.6,-Math.PI/2); decal(g,argR,1.5,1.5,sd*.92,.2,-3.8,0,sd*Math.PI/2); decal(g,argRud,1.2,2,sd*.1,2.3,-9.2,0,sd*Math.PI/2); } }
    else { for(const sd of [-1,1]){ decal(g,balken,2.2,2.2,sd*10,-.85+10*.07+.27,1.6,-Math.PI/2); decal(g,balken,1.4,1.4,sd*.92,.2,-4.5,0,sd*Math.PI/2); }
      M(g,new THREE.CylinderGeometry(1.06,1.06,.6,10,1,true),yel,0,0,-5.6).rotation.x=Math.PI/2; }
    return done(g); }
  window.makeJu52=makeJu52;

  // ---------------- C-47 Skytrain / Dakota / Li-2 (19,4 × 29 m) ----------------
  function makeC47(nat){
    const ru=nat==='ru', uk=nat==='uk', g=new THREE.Group(), m=mat(ru?0x4c5a38:uk?0x5a5638:0x5a5a3c), u=mat(ru?0x8aa6b8:0x7e8288), k=mat(0x1c1c1c), gl=glassM({opacity:.5}), d=mat(ru?0x3c4a2c:0x48482e),
      wht=mat(0xf0f0ec), blk=mat(0x111111);
    M(g,fus([[-9.7,.15],[-8,.55],[-4,1.12],[0,1.28],[4,1.28],[6.4,1.18],[8.2,.88],[9.2,.48],[9.7,.12]],1,1.08,18),m);
    for(const sx of [-1,1]){ for(let i=0;i<7;i++) M(g,new THREE.BoxGeometry(.05,.36,.42),k,sx*1.27,.32,4.2-i*1.15); M(g,new THREE.BoxGeometry(.6,.3,.05),gl,sx*.45,.62,8.45).rotation.y=sx*.6; }
    M(g,new THREE.BoxGeometry(.05,1.7,1.4),d,-1.29,-.05,-4.6);                                                                  // puerta de carga (izquierda)
    if(ru){ M(g,new THREE.SphereGeometry(.55,12,8,0,Math.PI*2,0,Math.PI/2),gl,0,1.32,-.8); M(g,cylZ(.035,.035,1.2,5),k,0,1.6,-1.5); }   // torreta dorsal del Li-2
    wing(g,m,{x0:1.0,span:29,cr:4.4,ct:1.6,zle:3.6,sweep:2.0,th:.5,y:-.75,dih:.08,tipR:.3});
    for(const sd of [-1,1]){ const x=sd*3.75, y=-.75+3.75*.08;
      M(g,fus([[-3.0,.2],[-1,.62],[1.8,.78],[2.6,.76]],1,1.05,14),m,x,y,2.5); M(g,cylZ(.8,.76,.8,16),d,x,y,5.4); M(g,new THREE.CircleGeometry(.66,16),k,x,y,5.81); prop(g,x,y,6.0,1.75,3,k);
      if(!ru&&!uk) for(let b=0;b<5;b++) M(g,new THREE.BoxGeometry(.02,.5,.36),b%2?blk:wht,sd*(5.2+b*.36),-.75+(5.2+b*.36)*.08,1.6).rotation.y=Math.PI/2;
      const T=ru?redStar:uk?rafC1:usStar, tw=ru||uk?2.2:3.6;
      decal(g,T,tw,2.2,sd*10.5,-.75+10.5*.08+.27,1.4,-Math.PI/2,0,!ru&&!uk&&sd>0?Math.PI:0); decal(g,T,ru||uk?1.5:2.6,1.3+(ru||uk?.2:0),sd*1.25,.15,-4.0,0,sd*Math.PI/2); }
    if(!ru&&!uk) for(let b=0;b<5;b++){ const r=M(g,new THREE.CylinderGeometry(1.0-b*.03,1.0-b*.03,.3,18,1,true),b%2?blk:wht,0,0,-5.4-b*.3); r.rotation.x=Math.PI/2; r.scale.set(1,1.08,1); }
    M(g,fin([[-5.6,1.0],[-7.6,1.8],[-8.9,3.6],[-9.6,3.7],[-9.9,1.0]],.2),m);
    if(ru) for(const sd of [-1,1]) decal(g,redStar,1.1,1.1,sd*.11,2.3,-9.0,0,sd*Math.PI/2);
    for(const sd of [-1,1]){ const s=M(g,plan([[0,-7.4],[4.9,-8.0],[4.9,-9.0],[0,-9.6]],.16),m,0,.5,0); s.scale.x=sd; }
    return done(g); }
  window.makeC47=makeC47;

  // avión de apoyo según el país (2ª Guerra); en la Guerra Fría, el A-10
  const SUPPORT_PLANE={de:makeJu87,it:makeJu87,jp:makeJu87,ru:makeIl2,us:makeP47,fr:makeP47,cn:makeP47,uk:makeTyphoon,ar:makeNorthrop};
  window.SUPPORT_PLANE=SUPPORT_PLANE;
  // transporte de paracaidistas según el país (reemplaza transportMesh de refuerzos.js; paraDrop deja el país en window._paraNat)
  const TRANSPORT={de:()=>makeJu52('de'),it:()=>makeJu52('de'),jp:()=>makeJu52('de'),ar:()=>makeJu52('ar'),us:()=>makeC47('us'),fr:()=>makeC47('us'),cn:()=>makeC47('us'),uk:()=>makeC47('uk'),ru:()=>makeC47('ru')};
  window.TRANSPORT=TRANSPORT;
  if(typeof transportMesh==='function'){ const _tm=transportMesh; transportMesh=function(axis){ const nat=window._paraNat, mk=TRANSPORT[nat];
      if(!mk) return _tm.apply(this,arguments); const g=mk(), hit=new THREE.Mesh(new THREE.BoxGeometry(28,3,20),new THREE.MeshBasicMaterial({visible:false})); g.add(hit); return {g,hit}; }; }
  if(typeof paraDrop==='function'){ const _pd=paraDrop; paraDrop=function(Z,team){ try{ window._paraNat=teamNation(team); }catch(e){ window._paraNat=null; } try{ return _pd.apply(this,arguments); } finally{ window._paraNat=null; } }; }

  // el bombardeo pedido: cambia el avión genérico por uno de la época y del bando (deja la caja de impacto de refuerzos.js)
  const _ap=airPass;
  airPass=function(by,point,dir){ const n=planes.length; _ap.apply(this,arguments); if(planes.length<=n) return; const P=planes[planes.length-1], era=W.era||5;
    const nat=(by&&by.crew&&by.crew.nation)||(typeof teamNation==='function'&&by?teamNation(by.team):by&&by.team===0?allyNation:foeNation), axis=['de','it','jp'].includes(nat);
    const mk=era>=5?window.makeA10:(SUPPORT_PLANE[nat]||(axis?makeJu87:makeP47)); const nm=mk();
    for(const ch of P.g.children.slice()) if(ch!==P.hit) P.g.remove(ch); for(const ch of nm.children.slice()) P.g.add(ch); };
  // hélices
  const _cu=cullUpdate, t0={v:performance.now()};
  cullUpdate=function(){ _cu.apply(this,arguments); const now2=performance.now(), dt=Math.min(.1,(now2-t0.v)/1000); t0.v=now2;
    for(let i=SPIN.length-1;i>=0;i--){ const S=SPIN[i]; let o=S.bl, live=false; while(o){ if(o===scene){ live=true; break; } o=o.parent; } if(!live){ S.dead=(S.dead||0)+dt; if(S.dead>3) SPIN.splice(i,1); continue; } S.dead=0; S.bl.rotation.z+=S.w*dt; } };
})();
