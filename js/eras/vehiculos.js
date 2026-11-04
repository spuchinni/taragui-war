// Vehículos de época y carreta criolla (pedido de Sebastián). Se suman a VTYPES (11-personas.js) con su propio armado:
//  · auto30: sedán de los años 30 (tipo Ford V8 / Opel Olympia): capó largo con parrilla cromada vertical, cabina alta con
//    techo de chapa, guardabarros sueltos sobre cada rueda, estribos, faros redondos sobre los guardabarros, rueda de auxilio atrás.
//  · camion30: camión de la época (tipo Opel Blitz / Ford V8): capó, cabina, caja de madera con tablas, ruedas traseras dobles,
//    a veces con lona.
//  · bus30: colectivo con trompa (capó adelante), dos colores, fila de ventanillas.
//  · carreta: la carreta criolla del litoral y el Chaco: dos ruedas enormes de rayos (2,2 m) con masa de madera, caja alta de
//    tablas con techo de cuero en arco, pértigo largo hasta el yugo y dos bueyes (con cuernos, patas que caminan) y el boyero
//    sentado adelante con la picana. Sin motor: si le pegan se rompe y se vuelca sin fuego (como el carro con caballo).
// Dónde salen: refugiados de las épocas 1–3 (`REF_VEH` según época y mapa: carretas en el Chaco), autos y camiones de época
// abandonados o quemados en las calles de las ciudades en guerra (Berlín, Stalingrado, Cassino, Shanghái), y alguna carreta
// en el tránsito de Corrientes.
(function(){
  const add=(k,o)=>{ VTYPES.push(Object.assign({k},o)); return VTYPES.length-1; };
  const I_AUTO=add('auto30',{n:'Auto (años 30)',W:1.68,wr:.36,wz:[1.3,-1.35],v:[6,9],per:1});
  const I_CAM=add('camion30',{n:'Camión (años 30)',W:2.1,wr:.45,wz:[2.0,-1.5],v:[5,7],per:1});
  const I_BUS=add('bus30',{n:'Colectivo (años 30)',W:2.3,wr:.48,wz:[2.9,-2.4],v:[5,7],per:1});
  const I_CAR=add('carreta',{n:'Carreta criolla',W:1.7,wr:1.1,wz:[0],v:[1,1.5],per:1,noMotor:1});
  const COL30=[0x1c1c1e,0x22301f,0x3a1e1e,0x1e2638,0x6a6450,0x4a4038,0x2a2a2a,0x5a2a22];
  const wood=new THREE.MeshLambertMaterial({color:0x6e5234}), woodD=new THREE.MeshLambertMaterial({color:0x4a3624}), hide=new THREE.MeshLambertMaterial({color:0x8a6a48});
  const blackM=new THREE.MeshLambertMaterial({color:0x151515});
  // rueda con rayos (carreta, carros viejos): llanta, rayos, masa
  function spokeWheel(g,x,y,z,r,w,n,mat,hub){ const t=new THREE.Mesh(new THREE.TorusGeometry(r,w*.5,6,22),mat); t.rotation.y=Math.PI/2; t.position.set(x,y,z); g.add(t);
    for(let i=0;i<n;i++){ const a=i/n*Math.PI*2, s=new THREE.Mesh(new THREE.BoxGeometry(w*.5,r*2*.92,w*.6),mat); s.rotation.x=a; s.position.set(x,y,z); g.add(s); }
    const h=new THREE.Mesh(new THREE.CylinderGeometry(hub,hub*1.1,w*2.2,10),mat); h.rotation.z=Math.PI/2; h.position.set(x,y,z); g.add(h); return t; }
  // guardabarros suelto: medio cilindro hueco sobre la rueda
  function fender(g,x,z,r,w,mat,y){ const geo=new THREE.CylinderGeometry(r,r,w,14,1,true,0,Math.PI); geo.rotateZ(Math.PI/2); const f=new THREE.Mesh(geo,mat); f.position.set(x,y,z); g.add(f); return f; }
  function lamp(g,x,y,z){ const l=new THREE.Mesh(new THREE.SphereGeometry(.11,10,8),chromeMat); l.position.set(x,y,z); g.add(l); const f=new THREE.Mesh(new THREE.CircleGeometry(.085,10),lampW); f.position.set(x,y,z+.1); g.add(f); }
  function buildPer(V,ci,g,ud){ const k=V.k;
    if(k==='auto30'){ const col=COL30[ci%COL30.length], m=new THREE.MeshLambertMaterial({color:col}); ud.m=m; ud.mats=[m]; ud.len=4.4;
      const body=new THREE.Mesh(vExt('a30b',[[2.15,.5],[2.18,.98],[.75,1.08],[-1.55,1.1],[-2.05,1.0],[-2.2,.62],[-2.15,.5]],V.W-.3),m); g.add(body);
      const cab=new THREE.Mesh(vExt('a30c',[[.75,1.06],[.5,1.6],[-1.05,1.64],[-1.55,1.3],[-1.62,1.08]],V.W-.32),m); g.add(cab);
      const gl=new THREE.Mesh(vExt('a30g',[[.66,1.12],[.47,1.52],[-.98,1.55],[-1.42,1.27],[-1.48,1.12]],V.W-.24),glassMat); g.add(gl);
      box(g,.6,.55,.08,0,.82,2.2,chromeMat); for(let i=0;i<6;i++) box(g,.02,.5,.1,-.25+i*.1,.82,2.22,blackM);         // parrilla
      for(const sx of [-1,1]){ fender(g,sx*(V.W/2-.12),1.3,V.wr+.12,.3,m,V.wr); fender(g,sx*(V.W/2-.12),-1.35,V.wr+.12,.3,m,V.wr);
        box(g,.22,.05,1.8,sx*(V.W/2-.05),.42,0,blackM); lamp(g,sx*.55,1.05,1.95); box(g,.12,.08,.06,sx*.6,.72,-2.2,lampR); }
      box(g,V.W-.25,.1,.12,0,.45,2.25,chromeMat); box(g,V.W-.25,.1,.12,0,.45,-2.25,chromeMat);
      const sp=new THREE.Mesh(VG.tire,tireMat); sp.scale.set(.18,.34,.34); sp.rotation.y=Math.PI/2; sp.position.set(0,.85,-2.3); g.add(sp);
      for(const z of V.wz) for(const sx of [-1,1]) vWheel(g,sx*(V.W/2-.1),V.wr,z,V.wr,.18);
      const door=box(g,.06,.55,.9,V.W/2-.1,1.0,-.3,m); door.visible=false; ud.door=door; }
    else if(k==='camion30'){ const col=[0x3a4232,0x2e3a2a,0x4a4a44,0x22301f,0x3a2a1e][ci%5], m=new THREE.MeshLambertMaterial({color:col}); ud.m=m; ud.mats=[m]; ud.len=6.2;
      const body=new THREE.Mesh(vExt('c30b',[[3.05,.72],[3.08,1.35],[1.9,1.42],[1.85,2.28],[.95,2.32],[.9,.72]],V.W-.3),m); g.add(body);
      const gl=new THREE.Mesh(vExt('c30g',[[1.86,1.5],[1.84,2.15],[1.0,2.18],[1.0,1.5]],V.W-.26),glassMat); g.add(gl);
      box(g,.75,.6,.08,0,1.05,3.1,col===0x4a4a44?chromeMat:blackM);
      for(const sx of [-1,1]){ fender(g,sx*(V.W/2-.2),2.0,V.wr+.13,.35,m,V.wr); lamp(g,sx*.62,1.42,2.6); box(g,.25,.05,.9,sx*(V.W/2-.08),.6,1.25,blackM); }
      // caja de madera con tablas (o con lona)
      box(g,V.W,.12,3.8,0,1.0,-1.1,woodD); for(const sx of [-1,1]) for(let i=0;i<3;i++) box(g,.06,.14,3.8,sx*(V.W/2-.03),1.18+i*.2,-1.1,wood);
      for(let i=0;i<3;i++) box(g,V.W,.14,.06,0,1.18+i*.2,-3.0,wood); box(g,V.W,.6,.06,0,1.32,.82,wood);
      if(ci%3===0){ const tp=new THREE.Mesh(new THREE.CylinderGeometry(V.W/2,V.W/2,3.8,10,1,false,0,Math.PI),canvasMat); tp.geometry.rotateZ(Math.PI/2); tp.geometry.rotateY(Math.PI/2); tp.position.set(0,1.6,-1.1); g.add(tp); box(g,V.W,.5,3.8,0,1.35,-1.1,canvasMat); }
      for(const sx of [-1,1]){ vWheel(g,sx*(V.W/2-.1),V.wr,2.0,V.wr,.22); vWheel(g,sx*(V.W/2-.1),V.wr,-1.5,V.wr,.22); vWheel(g,sx*(V.W/2-.36),V.wr,-1.5,V.wr,.22); }
      const door=box(g,.06,.6,.8,V.W/2-.12,1.6,1.35,m); door.visible=false; ud.door=door; }
    else if(k==='bus30'){ const c1=[0xc8b890,0xa83a2a,0x2e5a3a,0x2a3a5a][ci%4], c2=[0x6a1e1a,0xe8e0c8,0xe0d8b8,0xd8c890][ci%4], m=new THREE.MeshLambertMaterial({color:c1}), m2=new THREE.MeshLambertMaterial({color:c2});
      ud.m=m; ud.mats=[m,m2]; ud.len=9.2;
      const body=new THREE.Mesh(vExt('b30b',[[4.6,.6],[4.62,1.3],[3.6,1.38],[3.45,2.9],[3.2,3.05],[-4.4,3.05],[-4.6,2.8],[-4.6,.6]],V.W-.2),m); g.add(body);
      box(g,V.W,.3,8.0,0,1.5,-.55,m2); box(g,V.W-.1,.18,8.0,0,3.0,-.55,m2);
      const gl=new THREE.Mesh(vExt('b30g',[[3.4,1.8],[3.3,2.75],[-4.35,2.75],[-4.35,1.8]],V.W-.12),glassMat); g.add(gl);
      for(let i=0;i<8;i++) for(const sx of [-1,1]) box(g,.04,.95,.08,sx*(V.W/2-.04),2.27,3.0-i*.95,m);   // parantes de las ventanillas
      box(g,.8,.55,.08,0,.98,4.65,chromeMat); for(const sx of [-1,1]){ fender(g,sx*(V.W/2-.15),2.9,V.wr+.12,.32,m,V.wr); lamp(g,sx*.7,1.4,4.1); }
      for(const z of V.wz) for(const sx of [-1,1]) vWheel(g,sx*(V.W/2-.12),V.wr,z,V.wr,.24);
      const door=box(g,.06,1.6,.8,V.W/2-.06,1.6,2.8,m); door.visible=false; ud.door=door; }
    else if(k==='carreta'){ ud.m=wood; ud.mats=[wood,woodD,hide]; ud.len=9;
      // dos ruedas enormes de rayos y el eje
      for(const sx of [-1,1]) spokeWheel(g,sx*1.05,1.1,0,1.1,.16,12,woodD,.2); rod(g,[-1.1,1.1,0],[1.1,1.1,0],woodD,5);
      // caja alta de tablas y techo de cuero en arco
      box(g,1.6,.12,3.6,0,1.45,-.1,wood); for(const sx of [-1,1]) for(let i=0;i<3;i++) box(g,.07,.15,3.6,sx*.78,1.62+i*.22,-.1,wood);
      for(let i=0;i<5;i++) for(const sx of [-1,1]) box(g,.08,.75,.08,sx*.78,1.85,-1.8+i*.85,woodD);
      const roof=new THREE.Mesh(new THREE.CylinderGeometry(.86,.86,3.7,12,1,true,0,Math.PI),hide); roof.geometry.rotateZ(Math.PI/2); roof.geometry.rotateY(Math.PI/2); roof.material.side=THREE.DoubleSide;
      roof.position.set(0,2.2,-.1); roof.scale.y=.75; g.add(roof);
      box(g,1.6,.95,.06,0,1.95,-1.92,hide);
      // pértigo largo al yugo
      rod(g,[0,1.45,1.7],[0,1.15,5.6],woodD,3.5); box(g,2.0,.14,.16,0,1.5,5.55,woodD);
      // dos bueyes
      ud.legs=[]; const oc=[0x7a4a2a,0x3a2a1e,0xa88a6a,0x6a3a22][ci%4], om=new THREE.MeshLambertMaterial({color:oc}), oc2=new THREE.MeshLambertMaterial({color:ci%2?0xe8e0d0:oc}); ud.mats.push(om,oc2);
      for(const sx of [-.55,.55]){ const b=new THREE.Mesh(new THREE.CylinderGeometry(.42,.45,1.9,10),om); b.rotation.x=Math.PI/2; b.position.set(sx,1.25,4.85); b.scale.set(.9,1,1.08); g.add(b);
        const hump=new THREE.Mesh(new THREE.SphereGeometry(.3,8,6),om); hump.position.set(sx,1.6,5.4); g.add(hump);
        const nk=new THREE.Mesh(new THREE.CylinderGeometry(.2,.3,.6,8),om); nk.position.set(sx,1.3,5.95); nk.rotation.x=1.1; g.add(nk);
        const hd=new THREE.Mesh(new THREE.BoxGeometry(.3,.32,.55),oc2); hd.position.set(sx,1.15,6.3); hd.rotation.x=.35; g.add(hd);
        for(const hx of [-1,1]){ const hn=new THREE.Mesh(new THREE.ConeGeometry(.04,.45,6),pMat(0xd8d0b8)); hn.position.set(sx+hx*.2,1.4,6.22); hn.rotation.z=-hx*1.0; g.add(hn); }
        const tl=new THREE.Mesh(new THREE.CylinderGeometry(.03,.05,.8,5),om); tl.position.set(sx,1.05,3.85); tl.rotation.x=.25; g.add(tl);
        for(const [lx,lz] of [[-.2,4.2],[.2,4.2],[-.2,5.5],[.2,5.5]]){ const l=new THREE.Mesh(new THREE.CylinderGeometry(.08,.07,1.0,6),om); l.geometry.translate(0,-.5,0); l.position.set(sx+lx,1.05,lz); g.add(l); ud.legs.push(l); } }
      // el boyero sentado adelante con la picana
      const r=rider(g,1.5,1.6,.42); ud.riders.push(r); const pic=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,4.2,5),woodD); pic.position.set(.3,2.4,3.2); pic.rotation.x=1.05; g.add(pic); }
  }
  // armado: los de época usan su propio constructor; el resto, el de siempre
  const _cm=carMesh;
  carMesh=function(ci){ const ti=VTYPES[(ci>>4)]?(ci>>4):0, V=VTYPES[ti]; if(!V.per) return _cm(ci);
    const g=new THREE.Group(), ud={riders:[],V}; buildPer(V,ci,g,ud); if(!ud.riders.length&&V.k!=='carreta'){ const r=rider(g,.55,V.k==='bus30'?3.2:V.k==='camion30'?1.4:.3,.5); r.g.position.x=-.35; ud.riders.push(r); }
    g.userData=ud; { const skip=new Set([ud.door,...(ud.legs||[]),...ud.riders.map(r=>r.g)].filter(Boolean)); bakeVehicle(g,skip); if(ud.door) ud.mats.push(ud.door.material); }
    g.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); return g; };
  // la carreta no tiene motor: se rompe y se vuelca sin fuego, el boyero sale corriendo
  const _wc=wreckCar;
  wreckCar=function(C,by,occupied){ const u=C.g&&C.g.userData; if(!(u&&u.V&&u.V.noMotor)||C.state===3) return _wc.apply(this,arguments);
    C.state=3; C.v=0; (u.riders||[]).forEach(r=>r.g.visible=false); const y=heightAt(C.x,C.z);
    const P=makePerson('civ',-1,C.x+rand(-1.5,1.5),C.z+rand(-1.5,1.5)); P.flee=true; P.goal=null; debris(new THREE.Vector3(C.x,y+1.2,C.z),14,_woodBits,4,1.4);
    (u.mats||[]).forEach(m=>m.color&&m.color.multiplyScalar(.8)); C.lay=1; C.burn=0; if(occupied&&by&&by.crew&&!by.inf) award(by.crew,'Civil abatido',-50,-60); };
  // patas que caminan también en los vehículos de refugiados (estado 5)
  const _urc=updateRefugeeCars;
  updateRefugeeCars=function(dt){ _urc.apply(this,arguments); for(const C of traffic){ const u=C.g.userData; if(C.state!==5||!u.legs) continue; C.ph=(C.ph||0)+dt*(C.v||0)*3;
      u.legs.forEach((l,i)=>l.rotation.x=Math.sin(C.ph+(i%2?Math.PI:0)+(i%4>1?1.6:0))*.45); } };
  // vehículos de los refugiados según la época y el mapa
  const idx=k=>VTYPES.findIndex(v=>v.k===k);
  const _sr=spawnRefugees;
  spawnRefugees=function(){ const e=W.era||3, chaco=/chaco/.test(W.key||'');
    const L=chaco?['carreta','carreta','cart','bike']:e<=1?['cart','cart','bike','camion30']:e===2?['cart','bike','auto30','camion30']:['cart','bike','auto30','camion30','bus30','auto30'];
    REF_VEH.length=0; L.forEach(k=>REF_VEH.push(idx(k))); for(let i=REF_VEH.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [REF_VEH[i],REF_VEH[j]]=[REF_VEH[j],REF_VEH[i]]; }
    return _sr.apply(this,arguments); };
  // tránsito de Corrientes (Guerra Fría): de vez en cuando una carreta
  VMIX.push(I_CAR);
  // autos y camiones de época abandonados o quemados en las calles de las ciudades en guerra
  function parkedWrecks(){ const C=W.cfgC, segs=W.roadSegs; if(!C||!C.city||!segs||(W.era||5)>3) return; const city=segs.filter(S=>S.city); if(!city.length) return;
    let n=0; for(let tries=0;tries<80&&n<12;tries++){ const S=city[(Math.random()*city.length)|0], L=Math.hypot(S.bx-S.ax,S.bz-S.az), d=rand(10,L-10), ux=(S.bx-S.ax)/L, uz=(S.bz-S.az)/L, sd=Math.random()<.5?1:-1;
      const x=S.ax+ux*d-uz*sd*(S.w/2-2.2), z=S.az+uz*d+ux*sd*(S.w/2-2.2); if(!freeSpot(x,z,2.4)) continue;
      const ti=Math.random()<.65?I_AUTO:I_CAM, ci=(ti<<4)|((Math.random()*16)|0), g=carMesh(ci); scene.add(g); const h=Math.atan2(ux,uz)+(Math.random()<.5?0:Math.PI)+rand(-.15,.15);
      const T={id:++carSeq,g,S:null,dir:1,k:0,v:0,vmax:0,state:2,ci,x,z,h,len:g.userData.len,V:VTYPES[ti]}; (g.userData.riders||[]).forEach(r=>r.g.visible=false);
      if(Math.random()<.45){ T.state=3; vWreckLook(T); T.burn=0; } else vAbandonLook(T); traffic.push(T); n++; } }
  const _ir=initRefuerzos;
  initRefuerzos=function(){ const r=_ir.apply(this,arguments); try{ if(!net.guest) parkedWrecks(); }catch(e){ console.warn('vehiculos',e); } return r; };
  window.VEH30={I_AUTO,I_CAM,I_BUS,I_CAR};
})();
