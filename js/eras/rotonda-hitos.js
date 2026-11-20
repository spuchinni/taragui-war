/* ---------- Mapa "Ruta 12 y Av. Independencia": el Monumento a la Virgen de Itatí de la rotonda y la cancha de Boca Unidos (20/11/2026, pedido de Sebastián) ----------
   Hechos por código, como la Basílica y el Puente Belgrano.
   · Monumento (inaugurado el 5/12/1981; fotos de la Municipalidad de Corrientes y de Instagram como referencia): basamento rojo con escalinata al frente,
     columna cuadrada que se angosta, pintada de rojo y llena de placas de agradecimiento de colores, "VIRGEN DE ITATÍ BENDÍCENOS" al frente, nicho abajo,
     cornisa roja, pedestal de piedra clara en gradas y la imagen de la Virgen: manto celeste en triángulo, vestido blanco al frente, manos juntas, corona y
     resplandor dorados. Mira al oeste, a la Av. Independencia (la ciudad). ~18 m en total (alto estimado por las fotos; no hay datos publicados).
   · Cancha de Boca Unidos en el B° 17 de Agosto (complejo del club sobre la colectora de la Ruta 12; vista satelital como referencia): toma la cancha de OSM
     (la más grande de esa zona) y le pone el césped cortado a franjas con las líneas, los arcos, la tribuna popular al oeste con franjas rojas y amarillas,
     la cabecera sur en ochava con franjas amarillas y claras y el muro oscuro atrás, la platea angosta al este, alambrado olímpico al frente de las tribunas
     y los vestuarios al norte. Las tribunas de OSM (bloques de 3,5 m) se achican a nada y en su lugar van las de verdad. Indestructibles (hormigón): chocan con
     bloques bajos escondidos adentro (tanques) y con sus mallas (proyectiles y vista). */
(()=>{
  const MAT={}, mat=(k,c,o)=>MAT[k]||(MAT[k]=new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})));
  // une geometrías no indexadas con posición, normal, uv y color (el mergeBufferGeometries del núcleo no lleva color)
  function merge(gs){ const keys=['position','normal','uv'].concat(gs.every(g=>g.attributes.color)?['color']:[]), out=new THREE.BufferGeometry();
    for(const k of keys){ const n=gs[0].attributes[k].itemSize; let L=0; for(const g of gs) L+=g.attributes[k].count*n; const a=new Float32Array(L); let o=0; for(const g of gs){ a.set(g.attributes[k].array,o); o+=g.attributes[k].count*n; } out.setAttribute(k,new THREE.BufferAttribute(a,n)); }
    return out; }
  // juntador: una malla por material (pocas llamadas de dibujo)
  function Bag(){ const B={}; return {
    add(g,m,mtx){ if(mtx) g.applyMatrix4(mtx); g=g.index?g.toNonIndexed():g; if(!g.attributes.uv) g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2)); (B[m.uuid]||(B[m.uuid]={m,gs:[]})).gs.push(g); },
    box(w,h,d,x,y,z,m,ry,rx){ const g=new THREE.BoxGeometry(w,h,d); if(rx) g.rotateX(rx); if(ry) g.rotateY(ry); g.translate(x,y,z); this.add(g,m); },
    cyl(rt,rb,h,x,y,z,m,seg=12,rx,rz){ const g=new THREE.CylinderGeometry(rt,rb,h,seg); if(rx) g.rotateX(rx); if(rz) g.rotateZ(rz); g.translate(x,y,z); this.add(g,m); },
    meshes(parent){ const out=[]; for(const k in B){ const {m,gs}=B[k]; const vc=gs.every(g=>g.attributes.color); 
        const geo=merge(gs); geo.computeBoundingSphere(); const me=new THREE.Mesh(geo,m); me.castShadow=me.receiveShadow=true; parent.add(me); out.push(me); } return out; } }; }
  const colorize=(g,c)=>{ const n=g.attributes.position.count, a=new Float32Array(n*3), C=new THREE.Color(c); for(let i=0;i<n;i++){ a[i*3]=C.r; a[i*3+1]=C.g; a[i*3+2]=C.b; } g.setAttribute('color',new THREE.BufferAttribute(a,3)); return g; };
  // bloque bajo escondido adentro: choca con los tanques, frena árboles y casas, no se rompe
  function block(x,z,w,d,a,h){ addBuilding(x,z,w,d,h||.35,a,0x8a8580,0x8a8580,false,1e9,false); const b=bList[bList.length-1]; b.hp=b.max=1e9; b.pitched=false; return b; }
  // casas o bloques de OSM que caen adentro de una huella: se achican a nada (como en la Basílica: no se sacan de bList para no correr los índices)
  function clearOut(inside){ for(const b of bList){ if(b.hp>1e8) continue; if(!inside(b.x,b.z,Math.max(b.w,b.d)/2)) continue;
    b.w=b.d=.01; b.top=b.base+.02; b.hp=b.max=1e9; b.pitched=false; b.box.ob.hw=b.box.ob.hd=.005; b.box.min.set(b.x-.005,b.base,b.z-.005); b.box.max.set(b.x+.005,b.top,b.z+.005); } }

  // ================= Monumento a la Virgen de Itatí =================
  function plaquesTex(front){ const c=document.createElement('canvas'); c.width=256; c.height=512; const x=c.getContext('2d');
    x.fillStyle='#b8452d'; x.fillRect(0,0,256,512); for(let i=0;i<900;i++){ x.fillStyle=`rgba(${120+Math.random()*60|0},${40+Math.random()*30|0},${25},.25)`; x.fillRect(Math.random()*256,Math.random()*512,3,2); }
    const P=['#e9e4d8','#d8cdb0','#c9b98f','#f2efe6','#9a9a96','#b8a074','#5d6b7a','#2d3e58','#e8d26a','#7b2e2a','#ffffff','#c4c0b4','#3c5d3c'];
    const top=front?150:40; for(let y=top;y<500;){ let rowH=10+Math.random()*16|0; for(let xx=4;xx<252;){ const w=10+Math.random()*26|0; if(Math.random()<.82){ x.fillStyle=P[Math.random()*P.length|0]; x.fillRect(xx,y,Math.min(w,252-xx),rowH-2);
        if(Math.random()<.5){ x.fillStyle='rgba(30,30,30,.35)'; for(let l=0;l<2;l++) x.fillRect(xx+2,y+3+l*4,Math.min(w,252-xx)-5,1); } } xx+=w+2; } y+=rowH+1; }
    if(front){ x.fillStyle='#b8452d'; x.fillRect(0,60,256,80); x.fillStyle='#f1ead8'; x.font='bold 30px Georgia,serif'; x.textAlign='center'; x.fillText('VIRGEN DE ITATÍ',128,94); x.fillText('BENDÍCENOS',128,128);
      x.fillStyle='#2a1a14'; x.fillRect(96,430,64,82); x.fillStyle='#c8a050'; x.fillRect(100,436,56,6); }
    const t=new THREE.CanvasTexture(c); t.anisotropy=4; return t; }
  function osmVirgenRotonda(P,faceAng){ if(!P) return; const gy=heightAt(P.x,P.z), G=new THREE.Group(); G.position.set(P.x,gy,P.z); G.rotation.y=faceAng; worldGroup.add(G);
    const B=Bag(), red=mat('vRed',0xb9472f), redD=mat('vRedD',0x9a3826), con=mat('vCon',0xcac5ba), stone=mat('vStone',0xd9cba8), blue=mat('vBlue',0x4f8fd0), white=mat('vWhite',0xf1ece0), gold=mat('vGold',0xd8b04a,{emissive:0x2a1c00}), skin=mat('vSkin',0xd9b08c);
    // plaza: disco de hormigón, escalinata al frente, dos maceteros rojos
    B.cyl(13,13.2,.6,0,-.22,0,con,40);
    B.box(10.6,1.2,10.6,0,.6,0,red); B.box(10.9,.12,10.9,0,1.2,0,redD);
    for(let i=0;i<4;i++) B.box(6,.3,.42,0,.15+i*.3,5.3+(4-i)*.42-.21,con);
    for(const s of [-1,1]) B.box(1.4,1,1.4,s*4.3,.5,8.3,red);
    // columna que se angosta (4,4 → 3,8 m) con las placas y la leyenda al frente
    { const g=new THREE.BoxGeometry(4.4,7,4.4); const p=g.attributes.position; for(let i=0;i<p.count;i++) if(p.getY(i)>0){ p.setX(i,p.getX(i)*3.8/4.4); p.setZ(i,p.getZ(i)*3.8/4.4); } g.computeVertexNormals(); g.translate(0,1.2+3.5,0);
      const side=new THREE.MeshLambertMaterial({map:plaquesTex(false)}), front=new THREE.MeshLambertMaterial({map:plaquesTex(true)});
      const m=new THREE.Mesh(g,[side,side,red,red,front,side]); m.castShadow=m.receiveShadow=true; G.add(m); osmHitoMs.push(m); }
    B.box(.9,1.5,.25,0,1.95,2.15,redD); B.box(1.2,.18,.4,0,2.75,2.2,redD);                                                  // marco del nicho
    B.box(4.9,1.1,4.9,0,8.75,0,red); B.box(5.1,.14,5.1,0,9.3,0,redD);                                                        // cornisa
    // pedestal de piedra en gradas
    B.box(3,.45,3,0,9.6,0,stone); B.box(2.5,.45,2.5,0,10.05,0,stone); B.cyl(1.05,1.25,.6,0,10.55,0,stone,16); B.cyl(1.25,1.05,.25,0,10.98,0,stone,16);
    // la Virgen: manto celeste en triángulo (un poco aplastado adelante-atrás), vestido blanco al frente, manos, cara, corona y resplandor
    const vy=11.1, H=6.4;
    { const pr=[[0,0],[1.32,0],[1.3,.25],[1.12,1.6],[.9,3],[.66,4.3],[.46,5.2],[.36,5.6],[.3,5.75],[0,5.8]].map(([r,y])=>new THREE.Vector2(r,y*H/5.8));
      const g=new THREE.LatheGeometry(pr,28); g.scale(1,1,.78); g.translate(0,vy,0); B.add(g,blue);
      const f=new THREE.LatheGeometry(pr.map(v=>new THREE.Vector2(v.x*.62,v.y)),20,-.55,1.1); f.scale(1,1,1.33); f.translate(0,vy,.02); B.add(f,white);    // frente blanco
      for(const s of [-1,1]){ const e=new THREE.CylinderGeometry(.04,.04,H*.93,5); e.rotateZ(s*.17); e.rotateX(-.17); e.translate(s*.58,vy+H*.46,.62); B.add(e,gold); } }   // ribete dorado
    B.cyl(.13,.16,.36,0,vy+H*.68,.66,skin,10,-.3);                                                                             // manos juntas
    { const g=new THREE.SphereGeometry(.27,14,12); g.scale(.85,1.15,.8); g.translate(0,vy+H*.88,.24); B.add(g,skin); }           // cara
    B.cyl(.33,.27,.42,0,vy+H*1.0,.05,gold,12);                                                                                  // corona
    for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; B.cyl(.03,.05,.28,Math.cos(a)*.3,vy+H*1.0+.32,.05+Math.sin(a)*.3,gold,5); }
    B.cyl(.06,.06,.25,0,vy+H*1.0+.5,.05,gold,6); B.box(.22,.05,.05,0,vy+H*1.0+.56,.05,gold);                                   // cruz
    { const t=new THREE.TorusGeometry(.95,.035,6,28); t.translate(0,vy+H*1.0+.15,-.15); B.add(t,gold);
      for(let i=0;i<16;i++){ const a=i/16*Math.PI*2, g=new THREE.CylinderGeometry(.012,.04,.5,4); g.rotateZ(-a+Math.PI/2); g.translate(Math.cos(a)*1.2,vy+H*1.0+.15+Math.sin(a)*1.2,-.15); B.add(g,gold); } }   // resplandor
    B.meshes(G).forEach(m=>osmHitoMs.push(m)); G.updateMatrixWorld(true);
    const c=Math.cos(faceAng), s=Math.sin(faceAng), at=(lx,lz)=>[P.x+lx*c+lz*s,P.z-lx*s+lz*c];
    clearOut((x,z,r)=>Math.hypot(x-P.x,z-P.z)<14+r);
    block(P.x,P.z,10.4,10.4,faceAng,.6); { const [x,z]=at(0,6.4); block(x,z,6,2,faceAng,.3); }
    W._virgen={x:P.x,z:P.z}; }

  // ================= Cancha de Boca Unidos =================
  function pitchTex(Lg,Wg,L,Wd){ const S=4, c=document.createElement('canvas'); c.width=Math.round(Wg*S); c.height=Math.round(Lg*S); const x=c.getContext('2d');
    const n=14; for(let i=0;i<n;i++){ x.fillStyle=i%2?'#4e8a3a':'#5b9a44'; x.fillRect(0,i*c.height/n,c.width,c.height/n+1); }
    for(let i=0;i<2500;i++){ x.fillStyle=`rgba(${60+Math.random()*60|0},${90+Math.random()*50|0},40,.25)`; x.fillRect(Math.random()*c.width,Math.random()*c.height,2,2); }
    for(let i=0;i<18;i++){ x.fillStyle='rgba(150,130,80,.18)'; const r=8+Math.random()*30; x.beginPath(); x.ellipse(c.width/2+(Math.random()-.5)*c.width*.5,(Math.random()<.5?.1:.9)*c.height+(Math.random()-.5)*60,r*.7,r,0,0,7); x.fill(); }   // pasto gastado en las áreas
    const X=v=>c.width/2+v*S, Y=v=>c.height/2-v*S; x.strokeStyle='rgba(245,245,240,.92)'; x.lineWidth=.12*S*2;
    x.strokeRect(X(-Wd/2),Y(L/2),Wd*S,L*S); x.beginPath(); x.moveTo(X(-Wd/2),Y(0)); x.lineTo(X(Wd/2),Y(0)); x.stroke();
    x.beginPath(); x.arc(X(0),Y(0),9.15*S,0,7); x.stroke(); x.beginPath(); x.arc(X(0),Y(0),.4*S,0,7); x.fillStyle='#f4f4ee'; x.fill();
    for(const s of [-1,1]){ const e=s*L/2; x.strokeRect(X(-20.16),Math.min(Y(e),Y(e-s*16.5)),40.32*S,16.5*S); x.strokeRect(X(-9.16),Math.min(Y(e),Y(e-s*5.5)),18.32*S,5.5*S);
      x.beginPath(); x.arc(X(0),Y(e-s*11),.35*S,0,7); x.fill(); x.beginPath(); const a0=s>0?Math.PI*.2:Math.PI*1.2; x.arc(X(0),Y(e-s*11),9.15*S,s>0?Math.PI*.205:Math.PI*1.205,s>0?Math.PI*.795:Math.PI*1.795); x.stroke(); }
    const t=new THREE.CanvasTexture(c); t.anisotropy=8; return t; }
  // tribuna escalonada: largo en x, escalones hacia +z (atrás) subiendo; franjas de colores a lo largo
  function terrace(B,len,depth,rise,n,cols,seg,back){ const sd=depth/n, sh=rise/n, nS=Math.max(1,Math.round(len/seg)), sl=len/nS;
    for(let i=0;i<n;i++) for(let k=0;k<nS;k++){ const h=(i+1)*sh, g=new THREE.BoxGeometry(sl,h,sd); g.translate(-len/2+sl*(k+.5),h/2,sd*(i+.5)); colorize(g,cols[k%cols.length]); B.add(g,MAT.terr); }
    const wb=new THREE.BoxGeometry(len+.4,rise+1.6,.35); wb.translate(0,(rise+1.6)/2-.2,depth+.17); colorize(wb,back); B.add(wb,MAT.terr);       // muro de atrás con baranda
    for(const s of [-1,1]){ const g=new THREE.BoxGeometry(.3,rise+1,depth); g.translate(s*(len/2+.15),(rise+1)/2,depth/2); colorize(g,back); B.add(g,MAT.terr); }
    const fw=new THREE.BoxGeometry(len,1,.25); fw.translate(0,.5,-.12); colorize(fw,0xd8d4ca); B.add(fw,MAT.terr); }                              // pared baja del frente
  function fence(B,len,h){ const n=Math.round(len/3); for(let i=0;i<=n;i++) B.cyl(.04,.04,h,-len/2+i*len/n,1+h/2,-.4,MAT.post,5);
    B.cyl(.035,.035,len,0,1+h,-.4,MAT.post,5,0,Math.PI/2); const g=new THREE.PlaneGeometry(len,h); g.translate(0,1+h/2,-.4); B.add(g,MAT.mesh); }
  function meshTex(){ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'); x.strokeStyle='rgba(200,205,205,.9)'; x.lineWidth=2;
    for(let i=-64;i<128;i+=16){ x.beginPath(); x.moveTo(i,0); x.lineTo(i+64,64); x.stroke(); x.beginPath(); x.moveTo(i+64,0); x.lineTo(i,64); x.stroke(); }
    const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(30,1.2); return t; }
  function osmCanchaBoca(o,near){ let A=null, best=1e9; for(const a of o.areas){ if(a.k!=='cancha'||a.A<5000) continue; const cx=a.pts.reduce((s,p)=>s+p[0],0)/a.pts.length, cz=a.pts.reduce((s,p)=>s+p[1],0)/a.pts.length, d=Math.hypot(cx-near.x,cz-near.z); if(d<best){ best=d; A={a,cx,cz}; } }
    if(!A||best>120) return; const pts=A.a.pts.slice(0,4); A.cx=(pts[0][0]+pts[1][0]+pts[2][0]+pts[3][0])/4; A.cz=(pts[0][1]+pts[1][1]+pts[2][1]+pts[3][1])/4;
    // ejes: el lado largo hacia el norte (+z)
    let L=0, ux=0, uz=1, Wg=0; for(let i=0;i<4;i++){ const p=pts[i], q=pts[(i+1)%4], l=Math.hypot(q[0]-p[0],q[1]-p[1]); if(l>L){ L=l; ux=(q[0]-p[0])/l; uz=(q[1]-p[1])/l; } else Wg=Math.max(Wg,l); }
    if(uz<0){ ux=-ux; uz=-uz; } const th=Math.atan2(ux,uz), cx=A.cx, cz=A.cz, gy=heightAt(cx,cz), c=Math.cos(th), s=Math.sin(th);
    const at=(lx,lz)=>[cx+lx*c+lz*s,cz-lx*s+lz*c], Lg=Math.min(L,118), Wd=Math.min(Wg,90);                       // césped (de OSM): ~88 × 115 m
    const G=new THREE.Group(); G.position.set(cx,gy,cz); G.rotation.y=th; worldGroup.add(G);
    MAT.terr=MAT.terr||new THREE.MeshLambertMaterial({vertexColors:true}); MAT.post=mat('post',0x8c9094); MAT.mesh=MAT.mesh||new THREE.MeshLambertMaterial({map:meshTex(),transparent:true,alphaTest:.3,side:THREE.DoubleSide,depthWrite:false});
    // césped con las franjas y las líneas: una malla que copia el suelo
    { const g=new THREE.PlaneGeometry(Wd,Lg,24,30); g.rotateX(-Math.PI/2); const p=g.attributes.position; for(let i=0;i<p.count;i++){ const [X,Z]=at(p.getX(i),p.getZ(i)); p.setY(i,heightAt(X,Z)-gy+.07); } g.computeVertexNormals();
      const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:pitchTex(Lg,Wd,Math.min(100,Lg-12),Math.min(66,Wd-14)),polygonOffset:true,polygonOffsetFactor:-2})); m.receiveShadow=true; G.add(m); }
    const B=Bag(), wh=mat('arco',0xf4f4f0), roofM=mat('techoV',0x5a5e60), conM=mat('conV',0xbdb7aa), Lp=Math.min(100,Lg-12);
    // arcos con red
    for(const sg of [-1,1]){ const z=sg*Lp/2; for(const x of [-3.66,3.66]) B.cyl(.06,.06,2.44,x,1.22,z,wh,8); B.cyl(.06,.06,7.44,0,2.44,z,wh,8,0,Math.PI/2);
      const net=new THREE.PlaneGeometry(7.3,2.44); net.translate(0,1.22,z+sg*1.6); B.add(net,MAT.mesh); for(const x of [-3.66,3.66]){ const g=new THREE.PlaneGeometry(1.6,2.44); g.rotateY(Math.PI/2); g.translate(x,1.22,z+sg*.8); B.add(g,MAT.mesh); } }
    const Y=0xf2c230, R=0xc8322a, Wt=0xd9d5c9, Gr=0x9a968c, Dk=0x6e6a64, gap=2.2, parts=[];
    // cada tribuna: punto medio del borde de adelante (x,z), giro f (el frente mira hacia (-sin f, -cos f)), largo, fondo, alto
    const wl=74, wz=8, el=98, ez=-2, sz=-Lg/2-gap, sl=Wd-30;
    parts.push({x:Wd/2+gap,z:wz,f:Math.PI/2,len:wl,dep:21,rise:7.5,n:17,cols:[R,Y],seg:9.2,back:Dk});      // popular (oeste): rojo y amarillo
    parts.push({x:-Wd/2-gap,z:ez,f:-Math.PI/2,len:el,dep:8,rise:3.2,n:6,cols:[Y,Wt],seg:8,back:Gr});         // platea (este), angosta
    parts.push({x:0,z:sz,f:Math.PI,len:sl,dep:14,rise:5.5,n:12,cols:[Y,Wt],seg:7,back:Dk});                   // cabecera sur
    for(const [x1,z1] of [[Wd/2+gap,wz-wl/2],[-Wd/2-gap,ez-el/2]]){ const x0=Math.sign(x1)*sl/2, dx=x1-x0, dz=z1-sz, len=Math.hypot(dx,dz), mx=(x0+x1)/2, mz=(sz+z1)/2;   // ochavas
      let nx=dz/len, nz=-dx/len; if(nx*-mx+nz*-mz<0){ nx=-nx; nz=-nz; } parts.push({x:mx,z:mz,f:Math.atan2(-nx,-nz),len:len+.6,dep:14,rise:5.5,n:12,cols:[Wt,Y],seg:6.5,back:Dk}); }
    for(const P of parts){ const b=Bag(); terrace(b,P.len,P.dep,P.rise,P.n,P.cols,P.seg,P.back); fence(b,P.len,3);
      const M=new THREE.Matrix4().makeRotationY(P.f).setPosition(P.x,0,P.z); b.meshes({add:m=>{ m.geometry.applyMatrix4(M); B.add(m.geometry,m.material); }}); }
    // vestuarios al norte y el portón de entrada
    B.box(30,3.4,7,-12,1.7,Lg/2+6,conM); B.box(31,.3,8,-12,3.55,Lg/2+6,roofM); for(let i=0;i<6;i++) B.box(1.1,.9,.08,-25+i*4.6,2.2,Lg/2+2.46,mat('vidV',0x2a3a44));
    // torres de luz en las esquinas
    for(const [x,z] of [[Wd/2+6,Lg/2-6],[-Wd/2-6,Lg/2-6],[Wd/2+6,-Lg/2+2],[-Wd/2-6,-Lg/2+2]]){ B.cyl(.3,.45,24,x,12,z,mat('torreV',0x9aa0a4),8); B.box(4,2.2,.5,x,24.5,z,mat('torreV',0x9aa0a4),Math.atan2(-x,-z)); B.box(3.6,1.8,.1,x,24.5,z,mat('lampV',0xeef0dc,{emissive:0x22221a}),Math.atan2(-x,-z)); }
    B.meshes(G).forEach(m=>osmHitoMs.push(m)); G.updateMatrixWorld(true);
    // casas o tribunas de OSM adentro de la huella: afuera
    const loc=(x,z)=>{ const dx=x-cx, dz=z-cz; return [dx*c-dz*s, dx*s+dz*c]; };
    clearOut((x,z,r)=>{ const [lx,lz]=loc(x,z); return Math.abs(lx)<Wd/2+28+r*.5&&lz>-Lg/2-22-r*.5&&lz<Lg/2+12+r*.5; });
    // choque: bloques bajos debajo de cada tribuna y de los vestuarios
    for(const P of parts){ const lx=P.x+Math.sin(P.f)*P.dep/2, lz=P.z+Math.cos(P.f)*P.dep/2, [X,Z]=at(lx,lz); block(X,Z,P.len,P.dep,th+P.f,.3); }
    { const [X,Z]=at(-12,Lg/2+6); addBuilding(X,Z,30,7,.3,th,0xbdb7aa,0x5a5e60,false,1e9,false); bList[bList.length-1].hp=bList[bList.length-1].max=1e9; }
    W._cancha={x:cx,z:cz,th,L:Lg,W:Wd}; }

  // árboles: ninguno sobre la plaza del monumento ni en la cancha; pindós alrededor de la plaza (como en las fotos)
  function rotondaArboles(o){ const V=W._virgen, Cn=W._cancha; if(!o.list) return;
    for(let i=o.list.length-1;i>=0;i--){ const t=o.list[i]; let out=V&&Math.hypot(t.x-V.x,t.z-V.z)<17;
      if(!out&&Cn){ const dx=t.x-Cn.x, dz=t.z-Cn.z, c=Math.cos(Cn.th), s=Math.sin(Cn.th), lx=dx*c-dz*s, lz=dx*s+dz*c; out=Math.abs(lx)<Cn.W/2+26&&lz>-Cn.L/2-22&&lz<Cn.L/2+12; }
      if(out) o.list.splice(i,1); }
    if(V) for(let i=0;i<10;i++){ const a=(i+.5)/10*Math.PI*2, r=18.5+(i%2)*2.5; o.list.push({x:V.x+Math.cos(a)*r,z:V.z+Math.sin(a)*r,sp:'pindo',s:1+(i%3)*.08}); } }
  window.rotondaArboles=rotondaArboles;
  window.osmVirgenRotonda=osmVirgenRotonda; window.osmCanchaBoca=osmCanchaBoca;
})();
