/* ---------- Mapas "Av. Independencia (Carrefour)" y "Ruta 12, aeropuerto": el hipermercado y el aeropuerto (20/11/2026, pedido de Sebastián) ----------
   Hechos por código con la vista satelital y fotos de referencia; usan los ayudantes de rotonda-hitos.js (window.HITO).
   · Hipermercado: la nave grande de OSM (132 × 136 m) con chapa clara acanalada, techo con lucernarios, el bloque más alto del cine al fondo del lado este,
     frente al sur (hacia la avenida) con zócalo azul, vidriera de entrada, marquesina y cartel genérico "HIPERMERCADO" (sin la marca ni el logo),
     playa de estacionamiento con líneas, dos filas de techitos de media sombra, columnas de luz y el cartel alto (pilón) junto a la avenida.
   · Aeropuerto Piragine Niveyro: terminal de dos plantas (76 × 21 m) blanca con franjas de vidrio, hall central con techo abovedado, marquesina del lado
     de la calle y del lado de la plataforma, letras "AEROPUERTO CORRIENTES", torre de control redonda con cabina vidriada, manga de viento y un avión de
     línea en la plataforma: desde el 22/11/2026 un 737-800 y un E190 de aviones-linea.js (librea genérica argentina), con choque invisible en pierObs
     (antes bloques que se veían como losas). El punto A pasa al frente de la terminal (antes caía adentro). */
(()=>{
  const H=()=>window.HITO;
  const tex=(w,h,fn,rep)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; fn(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.anisotropy=4; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep[0],rep[1]); } return t; };
  const signTex=(txt,bg,fg,font)=>tex(1024,96,(x,w,h)=>{ x.fillStyle=bg; x.fillRect(0,0,w,h); x.fillStyle=fg; x.font=font||'bold 60px Arial,sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(txt,w/2,h/2+3,w*.94); });
  // malla con una textura repetida sobre una caja, con el uv en metros
  function boxUV(w,h,d,mpu){ const g=new THREE.BoxGeometry(w,h,d), uv=g.attributes.uv, p=g.attributes.position, n=g.attributes.normal;
    for(let i=0;i<uv.count;i++){ const ax=Math.abs(n.getX(i)), ay=Math.abs(n.getY(i)); const u=ax>.5?p.getZ(i):p.getX(i), v=ay>.5?p.getZ(i):p.getY(i); uv.setXY(i,u/mpu,v/mpu); } return g; }

  // ================= Hipermercado =================
  // el edificio más grande de OSM cerca (del json: el de bList puede faltar si el suelo no es parejo)
  function osmBig(o,near,R){ let best=null; for(const e of o.D.edif){ const x=osmW(o.D,e[0]), z=osmZ(e[1]), d=Math.hypot(x-near.x,z-near.z); if(d<R&&(!best||e[2]*e[3]>best.w*best.d*100)) best={x,z,w:e[2]/10,d:e[3]/10,a:e[4]/1000}; } return best; }
  function osmSuper(o,near){ const {Bag,block,clearOut,mat}=H(); const best=osmBig(o,near,60); if(!best) return;
    const a=best.a, th=Math.atan2(Math.cos(a),-Math.sin(a)), c=Math.cos(th), s=Math.sin(th), cx=best.x, cz=best.z, gy=heightAt(cx,cz);
    const W2=best.d, D=best.w, at=(lx,lz)=>[cx+lx*c+lz*s,cz-lx*s+lz*c], east=c>0?-1:1;            // local z = hacia el sur (la avenida); local x = a lo ancho
    const G=new THREE.Group(); G.position.set(cx,gy,cz); G.rotation.y=th; worldGroup.add(G);
    const chapa=new THREE.MeshLambertMaterial({map:tex(64,64,(x,w,h)=>{ x.fillStyle='#e4e2dc'; x.fillRect(0,0,w,h); for(let i=0;i<w;i+=8){ x.fillStyle='rgba(120,120,115,.35)'; x.fillRect(i,0,2,h); x.fillStyle='rgba(255,255,255,.5)'; x.fillRect(i+3,0,1,h); } },[1,1])});
    chapa.map.wrapS=chapa.map.wrapT=THREE.RepeatWrapping;
    const roofM=new THREE.MeshLambertMaterial({map:tex(64,64,(x,w,h)=>{ x.fillStyle='#9ea2a3'; x.fillRect(0,0,w,h); for(let i=0;i<h;i+=4){ x.fillStyle='rgba(60,60,60,.18)'; x.fillRect(0,i,w,1); } x.fillStyle='#cfd6d9'; x.fillRect(0,26,w,10); })});
    roofM.map.wrapS=roofM.map.wrapT=THREE.RepeatWrapping;
    const add=(g,m)=>{ const me=new THREE.Mesh(g,m); me.castShadow=me.receiveShadow=true; G.add(me); osmHitoMs.push(me); return me; };
    const hN=9;
    { const g=boxUV(W2,hN,D,4); g.translate(0,hN/2,0); add(g,[chapa,chapa,roofM,roofM,chapa,chapa]); }
    { const g=new THREE.PlaneGeometry(W2-1,D-1); g.rotateX(-Math.PI/2); const u=g.attributes.uv; for(let i=0;i<u.count;i++) u.setXY(i,u.getX(i)*W2/16,u.getY(i)*D/12); g.translate(0,hN+.03,0); add(g,roofM); }
    // bloque del cine, más alto, al fondo del lado este
    { const w=46, d=72, h=13.5, g=boxUV(w,h,d,4); g.translate(east*(W2/2-w/2-.5),h/2,-D/2+d/2+.5); add(g,[chapa,chapa,roofM,roofM,chapa,chapa]); }
    const B=Bag(), blue=mat('sBlue',0x1d5aa8), white=mat('sWhite',0xf3f2ee), glass=mat('sGlass',0x34505e,{emissive:0x0c1418}), dark=mat('sDark',0x2c2e30), asph=mat('sAsph',0x3c3d3f), pole=mat('sPole',0x8a8e90), shade=mat('sShade',0x2f4a3a), red=mat('sRed',0xc62828);
    const fz=D/2;                                                                                                   // frente (sur)
    B.box(W2+.4,1.6,.4,0,hN+.5,fz+.1,white);                                                                        // parapeto blanco
    B.box(W2+.2,3,.3,0,1.5,fz+.12,blue);                                                                           // zócalo azul
    const ex=-east*18;                                                                                             // la entrada, corrida hacia el oeste
    B.box(26,4.6,.3,ex,2.3,fz+.2,glass); for(let i=0;i<=8;i++) B.box(.18,4.6,.4,ex-13+i*3.25,2.3,fz+.25,dark);     // vidriera con parantes
    B.box(32,.45,7,ex,4.9,fz+3.5,white); for(const x of [-15,15]) B.box(.4,4.7,.4,ex+x,2.35,fz+6.6,pole);          // marquesina
    { const m=new THREE.Mesh(new THREE.PlaneGeometry(24,4.5),new THREE.MeshLambertMaterial({map:signTex('HIPERMERCADO','#1d5aa8','#ffffff')})); m.position.set(ex,7.2,fz+.35); G.add(m); }
    // estacionamiento: asfalto con líneas, techitos de media sombra y columnas de luz (hasta la avenida)
    const pd=Math.min(34,Math.max(14,o.lotD||30)), pw=W2-8;
    { const t=tex(512,256,(x,w,h)=>{ x.fillStyle='#45474a'; x.fillRect(0,0,w,h); for(let i=0;i<3000;i++){ x.fillStyle=`rgba(${70+Math.random()*40|0},${70+Math.random()*40|0},${70+Math.random()*40|0},.4)`; x.fillRect(Math.random()*w,Math.random()*h,2,2); }
        x.strokeStyle='rgba(240,240,235,.8)'; x.lineWidth=1; for(const y0 of [.08,.52]) for(let i=0;i<w;i+=w/(pw/2.6)){ x.beginPath(); x.moveTo(i,h*y0); x.lineTo(i,h*(y0+.3)); x.stroke(); } });
      const g=new THREE.PlaneGeometry(pw,pd,16,6); g.rotateX(-Math.PI/2); const p=g.attributes.position; for(let i=0;i<p.count;i++){ const [X,Z]=at(p.getX(i),p.getZ(i)+fz+2+pd/2); p.setY(i,heightAt(X,Z)-gy+.06); } g.translate(0,0,fz+2+pd/2);
      const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:t,polygonOffset:true,polygonOffsetFactor:-2})); m.receiveShadow=true; G.add(m); }
    for(const r of [.3,.74]){ const z=fz+2+pd*r; for(let k=-2;k<=2;k++){ const x=k*pw/5.4; B.box(pw/5.6,.12,5.2,x,2.6,z,shade,0,-.08); for(const xx of [-pw/12,pw/12]) B.box(.14,2.6,.14,x+xx,1.3,z+2.2,pole); } }
    for(let k=-3;k<=3;k++){ const x=k*pw/7, z=fz+2+pd*.52; B.cyl(.12,.16,9,x,4.5,z,pole,6); B.box(1.6,.2,.5,x,9,z,pole); }
    // pilón con el cartel, junto a la avenida
    { const x=east*(W2/2-12), z=fz+2+pd-2; B.box(2.2,18,1.2,x,9,z,blue); B.box(6,4,1.4,x,15.5,z,white); B.box(6.2,.4,1.6,x,17.7,z,red);
      for(const sd of [1,-1]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(5.6,2.4),new THREE.MeshLambertMaterial({map:signTex('HIPER','#ffffff','#1d5aa8','bold 80px Arial,sans-serif')})); m.position.set(x,15.4,z+sd*.72); m.rotation.y=sd>0?0:Math.PI; G.add(m); } }
    B.meshes(G).forEach(m=>osmHitoMs.push(m)); G.updateMatrixWorld(true);
    // la nave de OSM se achica y la reemplazan bloques bajos indestructibles
    clearOut((x,z,r)=>{ const dx=x-cx, dz=z-cz, lx=dx*c-dz*s, lz=dx*s+dz*c; return Math.abs(lx)<W2/2+2+r*.3&&lz>-D/2-2-r*.3&&lz<fz+2+pd+r*.3; });
    block(cx,cz,W2,D,th,.35); { const [x,z]=at(east*(W2/2-12),fz+2+pd-2); block(x,z,2.4,1.4,th,.35); }
    W._super={x:cx,z:cz,th,W:W2,D}; }

  // ================= Aeropuerto =================
  function airliner(){ const G=new THREE.Group(), B=H().Bag(), mat=H().mat, wh=mat('aWh',0xf2f3f4), gr=mat('aGr',0xb8bcc0), bl=mat('aBl',0x1f3f7a), dk=mat('aDk',0x1d2328), win=mat('aWin',0x223038), eng=mat('aEng',0xc9cdd1);
    const L=39.5, R=1.88;                                                                           // 737-800: 39,5 m de largo, 35,8 de envergadura, 12,5 de alto
    { const pr=[[0,0],[.5,.25],[1.1,.8],[1.6,1.8],[1.86,3.5],[R,5],[R,30],[1.6,33],[1.1,35.5],[.55,37.6],[.2,L]].map(([r,z])=>new THREE.Vector2(r,z)); const g=new THREE.LatheGeometry(pr,20); g.rotateX(-Math.PI/2); g.translate(0,3.2,L/2); B.add(g,wh); }   // fuselaje (trompa hacia +z)
    for(const sd of [-1,1]){ B.box(.05,.32,24,sd*R*.99,3.75,2.5,win); B.box(.05,.5,1.3,sd*1.25,4.35,L/2-3.4,win); }                                                                // ventanillas y cabina
    // ala con flecha (una por lado), motores, estabilizadores y deriva
    for(const sd of [-1,1]){ const sh=new THREE.Shape(); sh.moveTo(0,4.2); sh.lineTo(sd*17.2,-5.6); sh.lineTo(sd*17.9,-6.9); sh.lineTo(sd*15.5,-6.6); sh.lineTo(0,-3.4); sh.closePath();
      const g=new THREE.ExtrudeGeometry(sh,{depth:.35,bevelEnabled:false}); g.rotateX(Math.PI/2); g.rotateZ(sd*.06); g.translate(0,2.5,0); B.add(g,wh);
      const w=new THREE.BoxGeometry(.25,1.4,.9); w.translate(sd*17.8,3.3,-6.6); B.add(w,wh);                                                                                    // winglet
      const e=new THREE.CylinderGeometry(.95,.85,3.6,16); e.rotateX(Math.PI/2); e.translate(sd*5,1.75,3.6); B.add(e,eng); const f=new THREE.CircleGeometry(.85,14); f.translate(sd*5,1.75,5.41); B.add(f,dk);
      const pl=new THREE.BoxGeometry(.3,.9,2.4); pl.translate(sd*5,2.45,2.6); B.add(pl,wh);
      const st=new THREE.Shape(); st.moveTo(0,-14.2); st.lineTo(sd*6.6,-17.6); st.lineTo(sd*6.6,-18.6); st.lineTo(0,-18.4); st.closePath(); const sg=new THREE.ExtrudeGeometry(st,{depth:.22,bevelEnabled:false}); sg.rotateX(Math.PI/2); sg.translate(0,4.2,0); B.add(sg,wh); }
    { const sh=new THREE.Shape(); sh.moveTo(-13.2,0); sh.lineTo(-18.8,6.9); sh.lineTo(-20.6,6.9); sh.lineTo(-19.6,0); sh.closePath(); const g=new THREE.ExtrudeGeometry(sh,{depth:.3,bevelEnabled:false}); g.rotateY(-Math.PI/2); g.translate(.15,4.6,0); B.add(g,bl); }   // deriva azul, sin marca
    // tren de aterrizaje
    for(const [x,z] of [[0,15.4],[-2.8,-.6],[2.8,-.6]]){ B.cyl(.09,.09,1.6,x,1.3,z,dk,6); for(const dx of [-.3,.3]) B.cyl(.5,.5,.32,x+dx,.5,z,dk,12,0,Math.PI/2); }
    B.meshes(G); return G; }
  function osmAeropuerto(o,near){ const {Bag,block,clearOut,mat}=H(); const best=osmBig(o,near,30);
    const a=best?best.a:3.004, cx=near.x, cz=near.z, c=Math.cos(a), s=Math.sin(a), gy=heightAt(cx,cz), at=(lx,lz)=>[cx+lx*c+lz*s,cz-lx*s+lz*c];   // local +z = la calle (sur); −z = la plataforma
    const G=new THREE.Group(); G.position.set(cx,gy,cz); G.rotation.y=a; worldGroup.add(G);
    const B=Bag(), wh=mat('tWh',0xf1efe9), gl=mat('tGl',0x3f5f74,{emissive:0x0a141a}), gy2=mat('tGy',0x8d9396), dk=mat('tDk',0x30353a), roofV=mat('tRoof',0x6f8fa6), con=mat('tCon',0xc9c5bb), ora=mat('tOra',0xe8641c);
    const Lt=78, Dt=22, Ht=7.6;
    B.box(Lt,Ht,Dt,0,Ht/2,0,wh); B.box(Lt+.6,.7,Dt+.6,0,Ht+.2,0,wh);
    for(const sd of [-1,1]) for(const y of [2.3,5.5]) B.box(Lt-4,1.9,.12,0,y,sd*(Dt/2+.04),gl);                                                        // franjas de vidrio
    for(const sd of [-1,1]) for(let i=0;i<=13;i++) B.box(.25,Ht-1,.3,-Lt/2+3+i*(Lt-6)/13,Ht/2,sd*(Dt/2+.1),wh);                                    // columnas
    // hall central con techo abovedado
    { B.box(30,10.5,26,0,5.25,0,wh); B.box(26,7.5,.15,0,4.6,13.05,gl); B.box(26,7.5,.15,0,4.6,-13.05,gl);
      const sh=new THREE.Shape(), N=16, hw=13.6, rise=3.2, yb=10.3; for(let i=0;i<=N;i++){ const u=-hw+2*hw*i/N; sh[i?'lineTo':'moveTo'](u,yb+rise*(1-(u/hw)**2)); }
      for(let i=N;i>=0;i--){ const u=-hw+2*hw*i/N; sh.lineTo(u,yb-.35+rise*(1-(u/hw)**2)); } sh.closePath();
      const g=new THREE.ExtrudeGeometry(sh,{depth:31,bevelEnabled:false}); g.rotateY(-Math.PI/2); g.translate(15.5,0,0); B.add(g,roofV); }   // bóveda de chapa sobre el hall
    // marquesinas: calle y plataforma
    B.box(56,.4,7,0,4.4,Dt/2+3.5,gy2); for(let i=0;i<6;i++) B.box(.35,4.3,.35,-25+i*10,2.15,Dt/2+6.6,dk);
    B.box(34,.35,5,-12,3.9,-Dt/2-2.5,gy2); for(let i=0;i<4;i++) B.box(.3,3.8,.3,-27+i*10,1.9,-Dt/2-4.7,dk);
    { const m=new THREE.Mesh(new THREE.PlaneGeometry(22,2.2),new THREE.MeshLambertMaterial({map:signTex('AEROPUERTO CORRIENTES','#f1efe9','#203a5a','bold 42px Arial,sans-serif'),transparent:false})); m.position.set(0,8.6,13.12); G.add(m); }
    // torre de control: fuste redondo, cabina vidriada, techo y antena
    { const tx=Lt/2+6, tz=-6; B.cyl(1.7,2,22,tx,11,tz,con,16); B.cyl(3.4,2.2,1.6,tx,22.8,tz,con,16); B.cyl(3.2,3.2,3.2,tx,25.2,tz,gl,8); for(let i=0;i<8;i++){ const an=i/8*Math.PI*2+Math.PI/8; B.box(.2,3.2,.2,tx+Math.cos(an)*3.25,25.2,tz+Math.sin(an)*3.25,dk); }
      B.cyl(3.9,3.6,.6,tx,27.1,tz,wh,16); B.cyl(.08,.08,4,tx,29.4,tz,dk,5); B.box(4,4,4,tx-3,2,tz+4,wh); }
    // manga de viento al borde de la plataforma
    { const wx=-Lt/2-8, wz=-30; B.cyl(.08,.1,6,wx,3,wz,dk,6); for(let i=0;i<4;i++){ const g=new THREE.CylinderGeometry(.42-i*.06,.36-i*.06,.9,10,1,true); g.rotateZ(Math.PI/2); g.translate(wx+.45+i*.9,5.6-i*.08,wz); B.add(g,i%2?wh:ora); } }
    B.meshes(G).forEach(m=>osmHitoMs.push(m)); G.updateMatrixWorld(true);
    // aviones de línea en la plataforma con la trompa hacia la terminal: un 737-800 y un E190 (aviones-linea.js, librea genérica argentina)
    for(const [tipo,lx] of [['738',-16],['e190',22]]){ const P=window.avionLinea?avionLinea(tipo):airliner(), d=P.userData.dim||{L:39.5,span:17.9}, lz=-30-d.L/2, [px,pz]=at(lx,lz);
      P.position.set(px,heightAt(px,pz),pz); P.rotation.y=a; worldGroup.add(P); P.updateMatrixWorld(true); P.traverse(m=>{ if(m.isMesh) osmHitoMs.push(m); });
      // choque invisible (pierObs: frena tanques sin dibujar nada): fuselaje, tren principal y motores
      const T=window.AVION_LINEA&&AVION_LINEA[tipo], gy0=heightAt(px,pz), ob=(ox,oz,hw,hd,top)=>{ const [x,z]=at(lx+ox,lz+oz); pierObs.push({ob:{cx:x,cz:z,c,s,hw,hd},top:gy0+top}); };
      if(T){ ob(0,0,T.rx,d.L*.47,T.yc+T.ry); ob(0,d.L/2-T.gear.main,T.gear.track+.8,.9,3); for(const sd of [-1,1]) ob(sd*T.eng.x,d.L/2-T.eng.s-T.eng.len/2,T.eng.r+.1,T.eng.len/2+.3,T.eng.y+T.eng.r); }
      else block(px,pz,3.6,d.L*.92,a,.35); }
    clearOut((x,z,r)=>{ const dx=x-cx, dz=z-cz, lx=dx*c-dz*s, lz=dx*s+dz*c; return Math.abs(lx)<Lt/2+14+r*.3&&lz>-Dt/2-8-r*.3&&lz<Dt/2+9+r*.3; });
    block(cx,cz,Lt,Dt,a,.35); { const [x,z]=at(Lt/2+6,-6); block(x,z,4.6,4.6,a,.35); }
    W._aero={x:cx,z:cz,a}; }

  window.osmSuper=osmSuper; window.osmAeropuerto=osmAeropuerto;
})();
