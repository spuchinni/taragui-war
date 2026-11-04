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

  // ---------------- Ju 88 A-4 ----------------
  function makeJu88(){
    const g=new THREE.Group(), m=mat(0x3c4836), u=mat(0x7f97a8), k=mat(0x222222), gl=glassM();
    M(g,fus([[-7.2,.25],[-5,.55],[-1,.82],[2.4,.9],[4.6,.86]],.9,1.05),m);
    M(g,new THREE.SphereGeometry(.92,14,10,0,Math.PI*2,0,Math.PI/2),gl,0,.0,4.6).rotation.x=Math.PI/2;                 // ojo de escarabajo
    M(g,new THREE.BoxGeometry(.7,.55,2.6),u,0,-.92,2.6); M(g,new THREE.BoxGeometry(.6,.4,.7),gl,0,-.92,3.95);            // góndola Bola
    M(g,new THREE.BoxGeometry(1.1,.45,1.8),gl,0,.9,3.2);
    M(g,fin([[-5.3,.6],[-6.3,2.6],[-7.3,2.9],[-7.7,2.4],[-7.6,.5]],.2),m);
    M(g,plan([[-3.2,-6.1],[3.2,-6.4],[3,-7.6],[-3,-7.6]],.16),m,0,.45,0);
    wing(g,m,{x0:.6,span:20,cr:3.8,ct:1.6,zle:2.2,sweep:.6,th:.38,y:-.25,dih:.08,tipR:.6});
    for(const sd of [-1,1]){ const x=sd*2.85, y=-.15; M(g,fus([[-3,.25],[-1,.6],[1.4,.74],[2.4,.78]],1,1,14),m,x,y,1.4); M(g,cylZ(.8,.8,.5,16),k,x,y,3.95); prop(g,x,y,4.3,1.7,3,k);
      decal(g,balken,1.6,1.6,sd*6.5,-.05+.55,.6,-Math.PI/2); decal(g,balken,1.3,1.3,sd*.83,.05,-3.4,0,sd*Math.PI/2); }
    return done(g); }
  window.makeJu88=makeJu88;

  // el bombardeo pedido: cambia el avión genérico por uno de la época y del bando (deja la caja de impacto de refuerzos.js)
  const _ap=airPass;
  airPass=function(by,point,dir){ const n=planes.length; _ap.apply(this,arguments); if(planes.length<=n) return; const P=planes[planes.length-1], era=W.era||5;
    const nat=(by&&by.crew&&by.crew.nation)||(typeof teamNation==='function'&&by?teamNation(by.team):by&&by.team===0?allyNation:foeNation), axis=['de','it','jp'].includes(nat);
    const mk=era>=5?window.makeA10:axis?makeJu88:()=>makeB17(Math.random()<.4); const nm=mk();
    for(const ch of P.g.children.slice()) if(ch!==P.hit) P.g.remove(ch); for(const ch of nm.children.slice()) P.g.add(ch); };
  // hélices
  const _cu=cullUpdate, t0={v:performance.now()};
  cullUpdate=function(){ _cu.apply(this,arguments); const now2=performance.now(), dt=Math.min(.1,(now2-t0.v)/1000); t0.v=now2;
    for(let i=SPIN.length-1;i>=0;i--){ const S=SPIN[i]; let o=S.bl, live=false; while(o){ if(o===scene){ live=true; break; } o=o.parent; } if(!live){ S.dead=(S.dead||0)+dt; if(S.dead>3) SPIN.splice(i,1); continue; } S.dead=0; S.bl.rotation.z+=S.w*dt; } };
})();
