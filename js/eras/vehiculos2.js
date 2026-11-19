// Vehículos del barrio (pedido de Sebastián, 19/11/2026, con referencias de Sketchfab; hechos por código):
//  · c10: Chevrolet C-10 de los 70 (la camioneta de todo barrio correntino): capó largo y chato, parrilla ancha cromada con barras,
//    faros redondos, paragolpes cromados, cabina con parabrisas grande, línea de carácter al costado, caja con laterales y portón,
//    a veces el techo blanco (dos colores), espejos y llantas con taza.
//  · colectivo: urbano de Corrientes (carrocería sobre Mercedes-Benz de los 80/90): frente chato con parabrisas partido, cartel
//    con el número de línea, puertas adelante y en el medio con vidrios, ventanillas con parantes, franjas de color, paragolpes negro.
//  · moto2: moto clásica tipo Honda CB 750 Four: tanque en gota, asiento largo, motor con aletas, cuatro escapes cromados, horquilla,
//    faro redondo, manubrio, guardabarros y ruedas de rayos.
// Se suman a VTYPES (11-personas.js) con su propio armado y reemplazan en el tránsito (VMIX) a la camioneta, el colectivo y la moto
// genéricos (la mitad de las camionetas pasa a ser C-10).
(function(){
  const add=(k,o)=>{ VTYPES.push(Object.assign({k},o)); return VTYPES.length-1; };
  const I_C10=add('c10',{n:'Chevrolet C-10',W:1.98,wr:.38,wz:[1.62,-1.42],v:[8,10],c2:1});
  const I_BUS=add('colectivo',{n:'Colectivo',W:2.5,wr:.5,wz:[3.25,-2.05],v:[6,8],c2:1});
  const I_MOTO=add('moto2',{n:'Moto',W:.7,wr:.32,wz:[.74,-.72],v:[9,12],two:1,c2:1});
  const C10COL=[0x7fa8c8,0xe8e6de,0x9a2a22,0x3f6a4a,0xd8b040,0xcbb68c,0x2a4a7a,0xc86a2a,0x6a6e70,0x8a6a3a,0x3a8a8a,0xe8e6de,0x1e1e20,0xa8c0b0,0xb83a30,0x4a5a2a];
  const BUSCOL=[[0xe8e4d8,0x1e5a9a,0xd8a020],[0xf0ece0,0xb02a22,0x2a2a2a],[0xd8c040,0x2a6a3a,0xf0ece0],[0x2a6aa8,0xf0ece0,0xc83a2a],[0xf0ece0,0x2e8a5a,0x1e3a6a],[0xc8382a,0xf0ece0,0x2a2a2a]];
  const M=c=>new THREE.MeshLambertMaterial({color:c}), black=M(0x161616), grey=M(0x5a5c5e), amber=new THREE.MeshBasicMaterial({color:0xe8901e}), rubber=M(0x222222);
  const disc=(g,r,x,y,z,mat,ry=0)=>{ const d=new THREE.Mesh(new THREE.CircleGeometry(r,14),mat); d.position.set(x,y,z); d.rotation.y=ry; g.add(d); return d; };
  const cyl=(g,r0,r1,h,x,y,z,mat,rx=0,rz=0,s=10)=>{ const m=new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,h,s),mat); m.position.set(x,y,z); m.rotation.set(rx,0,rz); g.add(m); return m; };
  // rueda con taza cromada y tuercas
  function hubWheel(g,x,y,z,r,w,cap){ vWheel(g,x,y,z,r,w); const sd=Math.sign(x)||1; cyl(g,r*.5,r*.5,.03,x+sd*(w/2+.01),y,z,cap||chromeMat,0,Math.PI/2,14); cyl(g,r*.16,r*.16,.04,x+sd*(w/2+.03),y,z,grey,0,Math.PI/2,8); }
  // rueda de rayos de moto
  function spokeW(g,y,z,r){ const t=new THREE.Mesh(new THREE.TorusGeometry(r,.055,8,20),rubber); t.rotation.y=Math.PI/2; t.position.set(0,y,z); g.add(t);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(r-.06,.012,4,20),chromeMat); rim.rotation.y=Math.PI/2; rim.position.set(0,y,z); g.add(rim);
    for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, s=new THREE.Mesh(new THREE.BoxGeometry(.006,r*1.84,.006),chromeMat); s.rotation.x=a; s.position.set((i%2?.03:-.03),y,z); g.add(s); }
    cyl(g,.06,.06,.12,0,y,z,grey,0,Math.PI/2,8); }

  function buildC10(V,ci,g,ud){ const col=C10COL[ci%16], m=M(col); ud.m=m; ud.mats=[m]; ud.len=5.1; const W2=V.W;
    g.add(new THREE.Mesh(vExt('c10b',[[2.56,.44],[2.6,.98],[2.5,1.07],[1.02,1.12],[.96,1.15],[-.56,1.15],[-.56,.72],[-2.5,.72],[-2.52,.46]],W2),m));
    const roofCol=ci%3===0?M(0xeeece6):m; if(roofCol!==m) ud.mats.push(roofCol);
    g.add(new THREE.Mesh(vExt('c10c',[[.96,1.14],[.58,1.74],[-.4,1.77],[-.56,1.66],[-.56,1.14]],W2-.12),roofCol));
    g.add(new THREE.Mesh(vExt('c10g',[[.9,1.17],[.56,1.69],[-.36,1.72],[-.5,1.62],[-.5,1.17]],W2-.06),glassMat));
    box(g,.06,1.0,.06,W2/2-.1,1.42,-.53,roofCol); box(g,.06,1.0,.06,-W2/2+.1,1.42,-.53,roofCol);                                   // parantes de atrás
    // caja: laterales, frente, portón y piso
    for(const sx of [-1,1]){ box(g,.07,.42,1.96,sx*(W2/2-.035),.93,-1.53,m); box(g,.1,.04,1.98,sx*(W2/2-.05),1.16,-1.53,m); }
    box(g,W2,.44,.07,0,.93,-.6,m); box(g,W2,.46,.07,0,.94,-2.48,m); box(g,W2-.14,.03,1.9,0,.74,-1.53,black);
    box(g,1.0,.03,.02,0,1.0,-2.52,chromeMat);                                                                                      // manija del portón
    // frente: parrilla con barras, faros redondos, giros, paragolpes
    box(g,1.62,.36,.06,0,.8,2.6,chromeMat); for(let i=0;i<4;i++) box(g,1.5,.035,.07,0,.68+i*.08,2.61,black); box(g,.07,.3,.07,0,.8,2.62,chromeMat);
    for(const sx of [-1,1]){ disc(g,.11,sx*.66,.82,2.64,lampW); const ring=new THREE.Mesh(new THREE.TorusGeometry(.115,.022,6,14),chromeMat); ring.position.set(sx*.66,.82,2.635); g.add(ring);
      box(g,.16,.06,.03,sx*.7,.62,2.62,amber); box(g,.07,.24,.04,sx*(W2/2-.06),.84,-2.53,lampR); }
    box(g,W2+.08,.15,.14,0,.5,2.62,chromeMat); box(g,W2+.06,.14,.14,0,.5,-2.56,chromeMat);
    // costados: línea de carácter, puertas, manijas, espejos, tanque de nafta, guardabarros marcados
    for(const sx of [-1,1]){ const x=sx*(W2/2+.005); box(g,.02,.04,4.9,x,.95,0,chromeMat); box(g,.015,.62,.015,x,.83,.94,black); box(g,.015,.62,.015,x,.83,-.5,black);
      box(g,.03,.03,.14,x+sx*.01,1.03,.0,chromeMat); cyl(g,.012,.012,.32,sx*(W2/2+.12),1.32,.95,chromeMat,0,Math.PI/2); box(g,.04,.14,.2,sx*(W2/2+.26),1.32,.95,black);
      cyl(g,.06,.06,.03,x+sx*.02,.98,-1.9,chromeMat,0,Math.PI/2);
      for(const z of V.wz){ const a=new THREE.Mesh(new THREE.TorusGeometry(V.wr+.07,.035,4,12,Math.PI),black); a.rotation.y=Math.PI/2; a.position.set(x,V.wr,z); g.add(a); } }
    for(const z of V.wz) for(const sx of [-1,1]) hubWheel(g,sx*(W2/2-.14),V.wr,z,V.wr,.25);
    const door=box(g,.06,.6,1.3,W2/2+.02,.9,.22,m); door.visible=false; ud.door=door; }

  function signTex(n){ const c=document.createElement('canvas'); c.width=128; c.height=32; const x=c.getContext('2d'); x.fillStyle='#0c0c0c'; x.fillRect(0,0,128,32);
    x.fillStyle='#ffb21e'; x.font='bold 22px Arial'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(String(n),36,17); x.font='bold 13px Arial'; x.fillText(['CENTRO','B° SOR ASUNTA','LAGUNA SECA','ITATÍ','CAMPUS'][n%5],88,17,74);
    return new THREE.CanvasTexture(c); }
  function buildBus(V,ci,g,ud){ const [c1,c2,c3]=BUSCOL[ci%BUSCOL.length], m=M(c1), m2=M(c2), m3=M(c3); ud.m=m; ud.mats=[m,m2,m3]; ud.len=10.6; const W2=V.W, F=5.28;
    g.add(new THREE.Mesh(vExt('busb',[[F,.42],[F+.04,2.96],[F-.15,3.14],[-5.1,3.14],[-5.25,2.98],[-5.25,.42]],W2),m));
    box(g,W2+.03,.55,10.4,0,.78,0,m2); box(g,W2+.035,.12,10.4,0,1.14,0,m3); box(g,W2+.03,.1,10.4,0,2.62,0,m2);                       // franjas
    // ventanillas: banda de vidrio con parantes
    for(const sx of [-1,1]){ box(g,.03,1.0,8.6,sx*(W2/2+.008),2.05,-.55,glassMat); for(let i=0;i<9;i++) box(g,.04,1.02,.1,sx*(W2/2+.02),2.05,3.7-i*1.07,m); box(g,.04,.06,8.6,sx*(W2/2+.02),2.1,-.55,m); }
    // frente: parabrisas partido, cartel con la línea, faros, paragolpes, espejos
    box(g,2.26,1.38,.04,0,1.96,F+.03,glassMat); box(g,.08,1.4,.06,0,1.96,F+.05,black); box(g,2.3,.08,.06,0,1.24,F+.05,black);
    const st=new THREE.Mesh(new THREE.PlaneGeometry(1.9,.34),new THREE.MeshBasicMaterial({map:signTex(100+(ci*7)%40)})); st.position.set(0,2.86,F+.06); g.add(st);
    for(const sx of [-1,1]){ box(g,.36,.16,.04,sx*.85,.9,F+.03,lampW); box(g,.18,.1,.04,sx*.85,.74,F+.03,amber); box(g,.05,.05,.5,sx*(W2/2+.15),2.55,F-.1,black); box(g,.06,.32,.18,sx*(W2/2+.38),2.3,F+.12,black); box(g,.16,.3,.04,sx*.95,1.0,-5.27,lampR); }
    box(g,W2+.06,.26,.16,0,.55,F+.07,black); box(g,W2+.06,.26,.16,0,.55,-5.3,black); box(g,1.6,.5,.03,0,1.25,-5.27,grey);                                    // paragolpes y rejilla del motor
    for(let i=0;i<6;i++) box(g,1.5,.03,.04,0,1.04+i*.08,-5.28,black);
    // puertas a la derecha (adelante y al medio): vidrio con marco
    for(const z of [F-.65,-.3]){ box(g,.04,2.3,1.05,W2/2+.02,1.45,z,black); box(g,.045,1.0,.42,W2/2+.03,1.95,z-.25,glassMat); box(g,.045,1.0,.42,W2/2+.03,1.95,z+.25,glassMat); box(g,.045,.8,.42,W2/2+.03,.95,z-.25,glassMat); box(g,.045,.8,.42,W2/2+.03,.95,z+.25,glassMat); }
    box(g,1.0,.12,.4,0,3.2,1.0,grey);                                                                                                     // escotilla del techo
    for(const z of V.wz) for(const sx of [-1,1]) hubWheel(g,sx*(W2/2-.16),V.wr,z,V.wr,.3,grey);
    for(const sx of [-1,1]) hubWheel(g,sx*(W2/2-.48),V.wr,V.wz[1],V.wr,.3,grey);                                                          // duales de atrás
    const door=box(g,.06,1.9,1.0,W2/2+.04,1.4,F-.65,m); door.visible=false; ud.door=door;
    const dr=rider(g,.95,F-.85,.5); dr.g.position.x=-.62; ud.riders.push(dr); }

  function buildMoto(V,ci,g,ud){ const col=[0xa82a22,0x1e1e1e,0x2a4a8a,0xd8a020,0x3a6a3a,0xe8e6de,0x6a2a6a,0xc86a2a][ci%8], m=M(col); ud.m=m; ud.mats=[m]; ud.len=2.2;
    const z1=V.wz[0], z2=V.wz[1], r=V.wr; spokeW(g,r,z1,r); spokeW(g,r,z2,r);
    // horquilla y manubrio
    for(const sx of [-1,1]) rod(g,[sx*.08,r,z1+.02],[sx*.08,1.0,z1-.22],chromeMat,2.2);
    rod(g,[-.36,1.08,z1-.32],[.36,1.08,z1-.32],chromeMat,1.6); for(const sx of [-1,1]) rod(g,[sx*.36,1.08,z1-.32],[sx*.4,1.06,z1-.42],black,2.4);
    const hl=cyl(g,.1,.1,.12,0,.96,z1-.12,chromeMat,Math.PI/2,0,12); disc(g,.085,0,.96,z1-.05,lampW); cyl(g,.07,.07,.04,0,1.1,z1-.3,black,Math.PI/2,0,10);
    const ff=new THREE.Mesh(new THREE.CylinderGeometry(r+.05,r+.05,.12,12,1,true,-.4,2.2),chromeMat); ff.rotation.z=Math.PI/2; ff.position.set(0,r,z1); g.add(ff);
    // tanque en gota, asiento, colín, motor de 4 cilindros con aletas, escapes
    const tk=new THREE.Mesh(new THREE.SphereGeometry(.2,12,8),m); tk.scale.set(.85,.62,1.5); tk.position.set(0,.98,.2); g.add(tk); box(g,.02,.06,.4,.17,.98,.2,chromeMat); box(g,.02,.06,.4,-.17,.98,.2,chromeMat);
    rbox(g,.3,.1,.72,0,.95,-.32,black,.04); rbox(g,.26,.12,.2,0,.92,-.74,m,.04); box(g,.08,.06,.04,0,.86,-.86,lampR);
    rbox(g,.44,.3,.36,0,.55,.18,grey,.04); for(let i=0;i<5;i++) box(g,.46,.012,.38,0,.42+i*.06,.18,chromeMat); rbox(g,.34,.18,.3,0,.36,-.06,grey,.04);
    rod(g,[0,.62,.32],[0,.95,.42],black,3); rod(g,[0,.62,-.1],[0,.92,-.62],black,3);                                                         // cuadro
    for(const [sx,k] of [[-1,0],[-1,1],[1,0],[1,1]]){ const x=sx*(.12+k*.08); rod(g,[x,.5,.32],[x,.26,.05],chromeMat,2.4); rod(g,[x,.26,.05],[sx*(.17+k*.06),.3+k*.08,-.82],chromeMat,2.6); }
    const rf=new THREE.Mesh(new THREE.CylinderGeometry(r+.05,r+.05,.14,12,1,true,2.6,2.0),m); rf.rotation.z=Math.PI/2; rf.position.set(0,r,z2); g.add(rf);
    for(const sx of [-1,1]) rod(g,[sx*.12,.88,-.5],[sx*.12,r,z2],chromeMat,2);                                                               // amortiguadores
    ud.riders.push(rider(g,0,-.32,.92)); if(Math.random()<.3) ud.riders.push(rider(g,0,-.72,.98)); }

  const _cm=carMesh;
  carMesh=function(ci){ const ti=VTYPES[(ci>>4)]?(ci>>4):0, V=VTYPES[ti]; if(!V.c2) return _cm(ci);
    const g=new THREE.Group(), ud={riders:[],V};
    if(V.k==='c10') buildC10(V,ci,g,ud); else if(V.k==='colectivo') buildBus(V,ci,g,ud); else buildMoto(V,ci,g,ud);
    if(!ud.riders.length&&V.k==='c10'){ const r=rider(g,.5,.25,.5); r.g.position.x=-.42; ud.riders.push(r); }
    g.userData=ud; { const skip=new Set([ud.door,...ud.riders.map(r=>r.g)].filter(Boolean)); bakeVehicle(g,skip); if(ud.door) ud.mats.push(ud.door.material); }
    g.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); return g; };
  // en el tránsito: colectivo y moto nuevos en lugar de los genéricos, y la mitad de las camionetas pasan a ser C-10
  const iP=VTYPES.findIndex(v=>v.k==='pickup'), iB=VTYPES.findIndex(v=>v.k==='bus'), iM=VTYPES.findIndex(v=>v.k==='moto'); let np=0;
  for(let i=0;i<VMIX.length;i++){ if(VMIX[i]===iB) VMIX[i]=I_BUS; else if(VMIX[i]===iM) VMIX[i]=I_MOTO; else if(VMIX[i]===iP&&(np++)%2===0) VMIX[i]=I_C10; }
  VMIX.push(I_C10);
  window.VEH2={I_C10,I_BUS,I_MOTO};
})();
