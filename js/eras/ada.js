/* ---------- Galpón de ADA Logística en el mapa "Ruta 12, aeropuerto" (27/11/2026, pedido de Sebastián: trabaja ahí) ----------
   Hecho por código con la vista satelital de Google Maps ("Galpón ADA", Ruta 12 km 1036) y una foto del frente que pasó Sebastián:
   · Nave de chapa acanalada azul de ~65 × 40 m y ~11 m de alto, techo claro a dos aguas muy bajo, girada ~4,6° (sigue el loteo).
   · Frente al sur, sobre el patio de hormigón: letras blancas "ADA" grandes arriba con "Logística Regional del Nea" en rojo, ventanas altas
     enmarcadas, faroles de brazo, portón grande abierto (adentro oscuro, estanterías y un autoelevador amarillo), portones corredizos,
     dos paños bajos de bloques de hormigón gris con puerta y defensas amarillas y negras.
   · Al costado (sudeste del patio) la playa con techos de chapa sobre columnas, con pilas de pallets de madera abajo y el logo en el borde.
   · Cubiertas apiladas, tambores rojos y estantería azul junto al frente, como en la foto.
   Las paredes chocan con bloques indestructibles escondidos (block) y las casas de relleno que caían en la huella se achican (clearOut).
   El logo es el de camion.js (window.adaTex).
   Segunda tanda (27/11/2026, 24 fotos de Sebastián): zócalo de bloques, oficinas al oeste, pasillo con cerco, tanque y grupo electrógeno, garita, alero con
   autos y motos, playón de tierra con pallets, nave baja atrás al este y letras ADA en los costados (ver CLAUDE.md). */
(()=>{
  const H=()=>window.HITO;
  const tex=(w,h,fn,rep)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; fn(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.anisotropy=4; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep[0],rep[1]); } return t; };
  // caja con el uv en metros (para la chapa acanalada)
  function boxUV(w,h,d,mpu){ const g=new THREE.BoxGeometry(w,h,d), uv=g.attributes.uv, p=g.attributes.position, n=g.attributes.normal;
    for(let i=0;i<uv.count;i++){ const ax=Math.abs(n.getX(i)), ay=Math.abs(n.getY(i)); const u=ax>.5?p.getZ(i):p.getX(i), v=ay>.5?p.getZ(i):p.getY(i); uv.setXY(i,u/mpu,v/mpu); } return g; }
  const chapaTex=(base,hi,lo)=>{ const t=tex(64,64,(x,w,h)=>{ x.fillStyle=base; x.fillRect(0,0,w,h); for(let i=0;i<w;i+=8){ x.fillStyle=lo; x.fillRect(i,0,3,h); x.fillStyle=hi; x.fillRect(i+4,0,1,h); } }); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; };
  const lettersTex=()=>tex(1024,512,(x,w,h)=>{ x.clearRect(0,0,w,h);
    x.fillStyle='#d23a2a'; x.font='italic bold 58px Arial,sans-serif'; x.textAlign='center'; x.fillText('Logística Regional del Nea',w/2,70);
    // las letras ADA del logo (misma forma que el calco del camión, en blanco y sin fondo)
    x.save(); x.translate(w/2-300,118); x.scale(.82,.82); x.translate(-235,-117); x.fillStyle='#f4f6f8';
    x.beginPath(); x.moveTo(235,515); x.lineTo(298,117); x.lineTo(390,117); x.lineTo(448,458); x.lineTo(585,458); x.quadraticCurveTo(612,458,612,430);
    x.lineTo(612,205); x.quadraticCurveTo(612,172,580,172); x.lineTo(548,172); x.lineTo(548,418); x.lineTo(482,418); x.lineTo(482,117); x.lineTo(605,117);
    x.quadraticCurveTo(678,117,678,190); x.lineTo(678,440); x.quadraticCurveTo(678,515,605,515); x.lineTo(390,515); x.lineTo(342,222); x.lineTo(295,515); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(700,515); x.lineTo(765,117); x.lineTo(855,117); x.lineTo(918,515); x.lineTo(857,515); x.lineTo(808,222); x.lineTo(760,515); x.closePath(); x.fill(); x.restore(); });
  const ADA_GEO=[-27.444072,-58.742835];                                                       // centro de la nave (Google Maps: "Galpón ADA")
  function osmADA(o){ const {Bag,block,clearOut,mat}=H(); const D=o.D; if(!D||typeof osmGeo!=='function') return;
    const P=osmGeo(D,ADA_GEO[0],ADA_GEO[1]), cx=P.x, cz=P.z;
    const th=Math.PI-.08, c=Math.cos(th), s=Math.sin(th);                                       // local +z = frente (sur, apenas al oeste); local +x = este
    const at=(lx,lz)=>[cx+lx*c+lz*s,cz-lx*s+lz*c];
    let gy=1e9; for(const [lx,lz] of [[-33,-20],[33,-20],[-33,20],[33,20],[0,0]]){ const [X,Z]=at(lx,lz); gy=Math.min(gy,heightAt(X,Z)); }
    const gl=(lx,lz)=>{ const [X,Z]=at(lx,lz); return Math.max(0,heightAt(X,Z)-gy); };          // suelo en coordenadas locales
    const G=new THREE.Group(); G.position.set(cx,gy,cz); G.rotation.y=th; worldGroup.add(G);
    const W=65, Dp=40, hW=11, ridge=1.4, fz=Dp/2;
    const azul=new THREE.MeshLambertMaterial({map:chapaTex('#1f3fa8','rgba(120,150,230,.55)','rgba(10,20,70,.35)')});
    const techo=new THREE.MeshLambertMaterial({map:chapaTex('#a3a8ab','rgba(230,235,238,.45)','rgba(70,75,80,.3)')});
    const add=(g,m)=>{ const me=new THREE.Mesh(g,m); me.castShadow=me.receiveShadow=true; G.add(me); osmHitoMs.push(me); return me; };
    // nave: paredes + techo a dos aguas (cumbrera a lo largo) con los hastiales azules
    { const g=boxUV(W,hW+.6,Dp,1.6); g.translate(0,(hW+.6)/2-.6,0); add(g,[azul,azul,techo,techo,azul,azul]); }
    for(const sd of [-1,1]){ const g=new THREE.PlaneGeometry(W+.6,Math.hypot(Dp/2+.3,ridge)); const u=g.attributes.uv; for(let i=0;i<u.count;i++) u.setXY(i,u.getX(i)*W/1.6,u.getY(i)*12); g.rotateX(-Math.PI/2); g.rotateX(sd*Math.atan2(ridge,Dp/2)); g.translate(0,hW+ridge/2,sd*(Dp/4)); add(g,techo); }
    for(const sd of [-1,1]){ const sh=new THREE.Shape(); sh.moveTo(-Dp/2,0); sh.lineTo(Dp/2,0); sh.lineTo(0,ridge); sh.closePath(); const g=new THREE.ShapeGeometry(sh); g.rotateY(sd*Math.PI/2); g.translate(sd*(W/2+.01),hW,0); add(g,azul); }
    const B=Bag(), dark=mat('adaDark',0x0d1016), frame=mat('adaFrame',0x16245e), block1=mat('adaBlock',0xa9a7a0), grey=mat('adaGrey',0x6f747a), yel=mat('adaYel',0xf2c418), blk=mat('adaBlk',0x1b1b1b),
      steel=mat('adaSteel',0x8d9296), rack=mat('adaRack',0x2a54c8), orange=mat('adaOr',0xe07a1a), wood=mat('adaWood',0xb88a55), woodD=mat('adaWoodD',0x8c6438), rubber=mat('adaRub',0x1e1f21),
      red=mat('adaRed',0xb3241c), conc=mat('adaConc',0xb9b6ae), roofP=mat('adaRoofP',0x7f868b), white=mat('adaWhite',0xe9ecef);
    // --- frente (local +z): faja horizontal, portones, portón abierto, paños de bloques, ventanas y faroles ---
    B.box(W,.25,.12,0,5.4,fz+.06,frame);                                                       // faja divisoria (riel de los portones)
    const doorX=6, doorW=11, doorH=7.4;                                                          // portón grande abierto
    B.box(doorW,doorH,.1,doorX,doorH/2,fz+.02,dark);
    B.box(.3,doorH+.3,.3,doorX-doorW/2-.15,doorH/2,fz+.15,frame); B.box(.3,doorH+.3,.3,doorX+doorW/2+.15,doorH/2,fz+.15,frame); B.box(doorW+.6,.3,.3,doorX,doorH+.15,fz+.15,frame);
    // adentro: estanterías con cajas y un autoelevador amarillo (se ve por el portón)
    for(const rx of [-3,3]){ for(let k=0;k<4;k++) B.box(.12,6,.12,doorX+rx+(k%2?1.1:-1.1),3,fz-3-(k>1?2.6:0),rack); for(let l=1;l<=3;l++) B.box(2.4,.1,3,doorX+rx,l*1.7,fz-4.3,orange); for(let l=0;l<3;l++) B.box(2,1.1,2.6,doorX+rx,l*1.7+.65,fz-4.3,wood); }
    { const fx=doorX-1.5, fzz=fz-1.2; B.box(1.1,1.1,2,fx,.85,fzz,yel); B.box(1,1.1,.8,fx,1.9,fzz+.4,yel); B.box(.08,2.4,.08,fx-.4,1.6,fzz-1.1,blk); B.box(.08,2.4,.08,fx+.4,1.6,fzz-1.1,blk); B.box(1,.06,1.1,fx,.15,fzz-1.6,steel);
      for(const [wx,wz] of [[-.55,.5],[.55,.5],[-.55,-.7],[.55,-.7]]) B.cyl(.3,.3,.25,fx+wx,.3,fzz+wz,blk,10,0,Math.PI/2); }
    // portones corredizos (chapa azul con marco) a los costados del abierto
    for(const px of [-8,-17,22]){ B.box(.14,5.3,.14,px-4.4,2.65,fz+.1,frame); B.box(.14,5.3,.14,px+4.4,2.65,fz+.1,frame); B.box(8.9,.14,.14,px,5.25,fz+.1,frame); }
    // paños bajos de bloques de hormigón con una puerta (abajo a la izquierda en la foto)
    for(const [bx,bw] of [[-27.5,5],[-12.5,6]]){ B.box(bw,3.6,.25,bx,1.8,fz+.12,block1); for(let r=1;r<9;r++) B.box(bw,.03,.27,bx,r*.4,fz+.13,grey); }
    B.box(1,2.1,.1,-12.5,1.05,fz+.26,grey);
    // ventanas altas enmarcadas (paños oscuros con marco)
    for(const [wx,wy,ww,wh] of [[-26,7.6,2.2,1.6],[-20,8.4,2.6,1.8],[-1,8.9,5.2,2.8],[17,9.6,7.4,2.2]]){ B.box(ww,wh,.12,wx,wy,fz+.08,frame); B.box(ww-.3,wh-.3,.14,wx,wy,fz+.1,mat('adaWin',0x223a8c)); }
    // faroles de brazo
    for(const lx of [-24,-14,-4,14,26]){ B.box(.08,.08,1.8,lx,9.8,fz+.9,steel,0,.25); B.box(.5,.18,.8,lx,9.6,fz+1.75,steel); }
    // defensas amarillas y negras al pie del frente
    for(let i=0;i<10;i++){ const bx=-26+i*3.6; if(Math.abs(bx-doorX)<doorW/2) continue; for(let k=0;k<4;k++) B.cyl(.09,.09,.22,bx,gl(bx,fz+.5)+.11+k*.22,fz+.5,k%2?blk:yel,8); }
    for(const bx of [doorX-doorW/2-.6,doorX+doorW/2+.6]) for(let k=0;k<5;k++) B.cyl(.1,.1,.22,bx,gl(bx,fz+.5)+.11+k*.22,fz+.5,k%2?blk:yel,8);
    // cubiertas apiladas, estantería azul y tambores rojos a la derecha del frente (como en la foto)
    { const rx=W/2-3, rz=fz+2.4; for(const k of [-1,1]) for(const kk of [-1,1]) B.box(.12,4.2,.12,rx+k*1.4,2.1,rz+kk*.6,rack); for(const y of [1.4,2.8,4.1]) B.box(3,.1,1.3,rx,y,rz,rack);
      for(let i=0;i<5;i++) B.cyl(.55,.55,.28,rx-.5,1.6+i*.3,rz,rubber,14);
      for(let i=0;i<4;i++) B.cyl(.55,.55,.28,rx-4.2,.22+i*.3,rz+.6,rubber,14); B.box(1.2,.14,1,rx-4.2,.07,rz+.6,wood);
      for(let i=0;i<3;i++) B.cyl(.3,.3,.9,rx+1.6+i*.65,.45,rz+1.6,red,12); }
    // --- patio de hormigón al frente ---
    const yd=30;
    { const t=tex(256,256,(x,w,h)=>{ x.fillStyle='#8f8c86'; x.fillRect(0,0,w,h); for(let i=0;i<2500;i++){ x.fillStyle=`rgba(${100+Math.random()*50|0},${98+Math.random()*45|0},${92+Math.random()*40|0},.35)`; x.fillRect(Math.random()*w,Math.random()*h,2,2); }
        x.strokeStyle='rgba(80,80,78,.45)'; x.lineWidth=2; for(let i=0;i<=w;i+=64){ x.beginPath(); x.moveTo(i,0); x.lineTo(i,h); x.stroke(); x.beginPath(); x.moveTo(0,i); x.lineTo(w,i); x.stroke(); } x.fillStyle='rgba(60,55,50,.25)'; for(let i=0;i<8;i++) x.fillRect(Math.random()*w,Math.random()*h,28,10); },[(W+16)/16,yd/16]);
      const g=new THREE.PlaneGeometry(W+16,yd,20,8); g.rotateX(-Math.PI/2); const p=g.attributes.position; for(let i=0;i<p.count;i++){ const [X,Z]=at(p.getX(i),p.getZ(i)+fz+yd/2); p.setY(i,Math.max(.02,heightAt(X,Z)-gy+.06)); } g.translate(0,0,fz+yd/2);
      const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:t,polygonOffset:true,polygonOffsetFactor:-2})); m.receiveShadow=true; G.add(m); }
    const pallet=(x,y,z,ry)=>{ y+=gl(x,z); for(let t=0;t<5;t++) B.box(1.2,.03,.14,x+(ry?0:0),y+.135,z-.43+t*.215,wood,ry); for(const tz of [-.4,0,.4]) B.box(1.2,.1,.12,x,y+.065,z+tz,woodD,ry); B.box(1.2,.02,.12,x,y+.01,z,wood,ry); };
    // dos pilas sueltas junto al portón (las de la foto) y un auto-elevador manual
    for(let k=0;k<6;k++) pallet(doorX+doorW/2+3,k*.15,fz+3,0); for(let k=0;k<2;k++) pallet(doorX-doorW/2-2.5,k*.15,fz+2.5,0);
    // ====== segunda tanda con las fotos de Sebastián (27/11/2026): costados, atrás y alrededores ======
    const glass=mat('adaGlass',0x2b333d), tankM=mat('adaTank',0x2f8fdc), tankD=mat('adaTankD',0x2577bd), truss=mat('adaTruss',0xd9dcdf);
    const drape=(x0,x1,z0,z1,m)=>{ const w=x1-x0, d=z1-z0, g=new THREE.PlaneGeometry(w,d,Math.ceil(w/4),Math.ceil(d/4)); g.rotateX(-Math.PI/2); g.translate((x0+x1)/2,0,(z0+z1)/2);
      const p=g.attributes.position, uv=g.attributes.uv; for(let i=0;i<p.count;i++){ const [X,Z]=at(p.getX(i),p.getZ(i)); p.setY(i,Math.max(.02,heightAt(X,Z)-gy+.06)); }
      for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*w/16,uv.getY(i)*d/16); const me=new THREE.Mesh(g,m); me.receiveShadow=true; G.add(me); return me; };
    const rep=t=>{ t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; };
    const noise=(x,w,h,n,r,g,b,a)=>{ for(let i=0;i<n;i++){ x.fillStyle=`rgba(${r+Math.random()*40|0},${g+Math.random()*40|0},${b+Math.random()*35|0},${a})`; x.fillRect(Math.random()*w,Math.random()*h,2,2); } };
    // zócalo de bloques de hormigón gris (~4 m) en los dos costados y atrás: textura de 1,6 m, hiladas de 20 cm y bloques de 40
    const bloqM=new THREE.MeshLambertMaterial({map:rep(tex(128,128,(x,w,h)=>{ x.fillStyle='#b3b4ac'; x.fillRect(0,0,w,h); noise(x,w,h,1400,120,121,115,.3);
      x.strokeStyle='rgba(85,87,83,.55)'; x.lineWidth=2; for(let r=0;r<8;r++){ const y=r*16; x.beginPath(); x.moveTo(0,y); x.lineTo(w,y); x.stroke(); for(let k=0;k<4;k++){ const xx=k*32+(r%2?16:0); x.beginPath(); x.moveTo(xx,y); x.lineTo(xx,y+16); x.stroke(); } } }))});
    const zB=3.9;
    for(const [w,d,x,z] of [[.3,Dp+.3,-W/2-.08,0],[.3,Dp+.3,W/2+.08,0],[W+.3,.3,0,-Dp/2-.08]]){ const g=boxUV(w,zB+.6,d,1.6); g.translate(x,(zB+.6)/2-.6,z); add(g,bloqM); }
    // suelos: tierra al este (playón de pallets y autos) y pasillo de hormigón al oeste
    const dirtM=new THREE.MeshLambertMaterial({map:rep(tex(256,256,(x,w,h)=>{ x.fillStyle='#93806b'; x.fillRect(0,0,w,h); noise(x,w,h,4000,115,95,72,.35);
      x.strokeStyle='rgba(110,78,52,.35)'; x.lineWidth=5; for(let i=0;i<6;i++){ x.beginPath(); const y=Math.random()*h; x.moveTo(0,y); x.bezierCurveTo(w*.3,y+30*(Math.random()-.5),w*.6,y+30*(Math.random()-.5),w,y); x.stroke(); }
      for(let i=0;i<14;i++){ x.fillStyle='rgba(95,120,60,.35)'; x.beginPath(); x.arc(Math.random()*w,Math.random()*h,4+Math.random()*10,0,7); x.fill(); } })),polygonOffset:true,polygonOffsetFactor:-1});
    const concM=new THREE.MeshLambertMaterial({map:rep(tex(128,128,(x,w,h)=>{ x.fillStyle='#a9a7a1'; x.fillRect(0,0,w,h); noise(x,w,h,1500,130,128,122,.3); x.strokeStyle='rgba(80,80,78,.4)'; x.lineWidth=2; for(let i=0;i<=h;i+=32){ x.beginPath(); x.moveTo(0,i); x.lineTo(w,i); x.stroke(); } })),polygonOffset:true,polygonOffsetFactor:-2});
    drape(W/2,W/2+30,-Dp/2-16,fz+yd,dirtM);
    // --- oficinas: bloque de dos pisos de bloques grises pegado al frente en la punta oeste (fotos 8 y 10) ---
    const oX0=-W/2-7.5, oX1=-W/2+.2, oZ0=fz-11, oZ1=fz+.8, oH=7.4, ow=oX1-oX0, od=oZ1-oZ0, ocx=(oX0+oX1)/2, ocz=(oZ0+oZ1)/2;
    { const g=boxUV(ow,oH+.6,od,1.6); g.translate(ocx,(oH+.6)/2-.6,ocz); add(g,bloqM); }
    B.box(ow+.3,.35,od+.3,ocx,oH+.17,ocz,grey);
    const win=(x,y,z,ax)=>{ if(ax){ B.box(.1,1.4,1.7,x,y,z,white); B.box(.14,1.15,1.45,x,y,z,glass); } else { B.box(1.7,1.4,.1,x,y,z,white); B.box(1.45,1.15,.14,x,y,z,glass); } };
    for(const y of [1.7,5.1]){ win(oX0+2,y,oZ1+.02,0); for(const dz of [-3.2,1.2]) win(oX0-.02,y,ocz+dz,1); win(oX0+2,y,oZ0-.02,0); }
    B.box(1,2.2,.12,oX0+5,1.1,oZ1+.03,grey); B.box(1,2.2,.12,-W/2-2.6,1.1,oZ0-.03,grey);                // puertas: al patio y al pasillo
    for(const [x,y] of [[oX0+4.4,3.4],[oX0+5.6,6.6]]) B.box(.9,.6,.35,x,y,oZ0-.2,white);                // aires acondicionados
    B.box(.5,.7,.2,oX0+6.5,1.5,oZ1+.12,grey);                                                            // caja del medidor
    // --- pasillo de hormigón al oeste entre la pared y el cerco olímpico, con tanque de agua y grupo electrógeno al fondo (fotos 0, 1, 3 y 4) ---
    const fX=-W/2-6.2, fZ0=-Dp/2-7, fZ1=oZ0;
    drape(fX+.2,-W/2,fZ0+.2,oZ0,concM);
    const meshT=tex(64,64,(x,w,h)=>{ x.clearRect(0,0,w,h); x.strokeStyle='rgba(150,155,150,.95)'; x.lineWidth=2; for(let i=-64;i<128;i+=16){ x.beginPath(); x.moveTo(i,0); x.lineTo(i+64,64); x.stroke(); x.beginPath(); x.moveTo(i,64); x.lineTo(i+64,0); x.stroke(); } });
    rep(meshT); const meshM=new THREE.MeshLambertMaterial({map:meshT,transparent:true,alphaTest:.4,side:THREE.DoubleSide});
    // tramo de cerco de (x0,z0) a (x1,z1); out = hacia dónde se inclinan los postes (afuera)
    const cerco=(x0,z0,x1,z1,ox,oz)=>{ const L=Math.hypot(x1-x0,z1-z0), ry=Math.atan2(x1-x0,z1-z0), n=Math.max(1,Math.round(L/3));
      for(let i=0;i<=n;i++){ const x=x0+(x1-x0)*i/n, z=z0+(z1-z0)*i/n, b=gl(x,z); B.box(.18,2.5,.18,x,b+1.2,z,conc);
        const g=new THREE.BoxGeometry(.13,.75,.13); g.rotateZ(-ox*.6); g.rotateX(oz*.6); g.translate(x+ox*.2,b+2.7,z+oz*.2); B.add(g,conc); }
      const mx=(x0+x1)/2, mz=(z0+z1)/2, b=gl(mx,mz);
      B.box(.22,.5,L,mx,b+.2,mz,block1,ry);                                                                 // murito de bloques abajo
      for(const k of [1,2,3]) B.box(.03,.03,L,mx+ox*.12*k,b+2.35+k*.15,mz+oz*.12*k,steel,ry);             // alambre de púas
      const g=new THREE.PlaneGeometry(L,1.9); const u=g.attributes.uv; for(let i=0;i<u.count;i++) u.setXY(i,u.getX(i)*L/.6,u.getY(i)*1.9/.6);
      const m=new THREE.Mesh(g,meshM); m.position.set(mx,b+1.4,mz); m.rotation.y=ry+Math.PI/2; G.add(m); };
    cerco(fX,fZ1,fX,fZ0,-1,0); cerco(fX,fZ0,-W/2+12,fZ0,0,-1);
    { const tx=-W/2-3.1, tz=-Dp/2-2.4, b=gl(tx,tz); B.cyl(1.75,1.75,4.6,tx,b+2.3,tz,tankM,22); B.cyl(.35,1.75,.55,tx,b+4.87,tz,tankM,22); B.cyl(.32,.32,.18,tx,b+5.2,tz,tankD,12);
      for(let k=1;k<6;k++) B.cyl(1.8,1.8,.12,tx,b+k*.78,tz,tankD,22); B.cyl(.06,.06,4,tx+1.6,b+2,tz+.6,white,6); }
    { const gx=-W/2-1.1, gz=-Dp/2+5, b=gl(gx,gz); B.box(1.5,2,3.6,gx,b+1,gz,white); B.box(.05,1.1,1.6,gx-.76,b+1.1,gz-.6,grey); B.box(1.55,.1,3.65,gx,b+2.03,gz,steel); B.box(1.6,.15,3.8,gx,b+.07,gz,blk); }
    // --- frente este: garita blanca, caño blanco y alero pegado a la pared con autos y motos abajo (fotos 5, 15, 16, 18 y 21) ---
    { const gx=W/2+2.3, gz=fz-2.4, b=gl(gx,gz); B.box(2.3,2.4,2.4,gx,b+1.25,gz,white); B.box(2.8,.15,2.9,gx,b+2.55,gz,white);
      B.box(1.7,.9,.06,gx,b+1.6,gz+1.22,glass); B.box(.06,.9,1.6,gx+1.17,b+1.6,gz,glass); B.box(.06,.9,1.6,gx-1.17,b+1.6,gz,glass); B.box(.8,1.9,.06,gx+.5,b+1,gz-1.22,white); B.box(.6,.45,.06,gx+.5,b+1.5,gz-1.24,glass); }
    B.cyl(.3,.3,11.2,W/2+.5,5.2,fz-6.5,white,10);
    const cZ0=-9, cZ1=fz-5, cX=W/2+6.4, cl=cZ1-cZ0, ccz=(cZ0+cZ1)/2;
    { const t0=4.5, t1=4.1; const g=new THREE.BoxGeometry(cX-W/2+.5,.1,cl); g.rotateZ(-Math.atan2(t0-t1,cX-W/2)); g.translate((W/2+cX)/2,(t0+t1)/2,ccz); B.add(g,roofP);
      for(const y of [t1-.05,t1-.6]) B.box(.08,.08,cl,cX,y,ccz,truss);                                     // viga reticulada blanca del borde
      for(let k=0;k<cl/.6;k++){ const z=cZ0+k*.6+.3; const g2=new THREE.BoxGeometry(.05,.78,.05); g2.rotateX(k%2?.75:-.75); g2.translate(cX,t1-.33,z); B.add(g2,truss); }
      for(let k=0;k<=3;k++){ const z=cZ0+k*cl/3, b=gl(cX,z)-.1, hh=t1-.6-b;                             // columnas reticuladas triangulares
        for(const [dx,dz] of [[-.17,-.15],[-.17,.15],[.17,0]]) B.box(.05,hh,.05,cX+dx,b+hh/2,z+dz,truss);
        for(let j=0;j<hh/.5;j++){ const y=b+.25+j*.5; B.box(.03,.03,.34,cX-.17,y,z,truss); B.box(.36,.03,.03,cX,y,z+(j%2?.08:-.08),truss); } } }
    const car=(x,z,col,pick)=>{ const b=gl(x,z), cm=mat('adaCar'+col.toString(16),col); B.box(4.3,.75,1.8,x,b+.65,z,cm); B.box(pick?1.7:2.3,.6,1.65,x+(pick?.65:.2),b+1.3,z,glass); B.box(pick?1.5:2.1,.08,1.6,x+(pick?.65:.2),b+1.63,z,cm);
      if(pick){ B.box(1.9,.4,1.8,x-1.15,b+1.15,z,cm); B.box(4.32,.14,1.82,x,b+.75,z,frame); }
      for(const [wx,wz] of [[-1.35,-.85],[1.35,-.85],[-1.35,.85],[1.35,.85]]) B.cyl(.34,.34,.25,x+wx,b+.34,z+wz,rubber,10,Math.PI/2); };
    const moto=(x,z,col)=>{ const b=gl(x,z); B.box(1.5,.45,.25,x,b+.7,z,mat('adaMoto'+col.toString(16),col)); B.box(.6,.12,.28,x-.3,b+.98,z,blk); B.box(.05,.5,.6,x+.65,b+1.05,z,steel);
      for(const wx of [-.7,.7]) B.cyl(.3,.3,.1,x+wx,b+.3,z,rubber,10,Math.PI/2); };
    car(W/2+3.4,fz-7.5,0xf2f3f4,1); car(W/2+3.4,fz-10.6,0xd8dadc,0); car(W/2+3.4,fz-13.6,0xb9bcc0,0); car(W/2+3.4,fz-19.5,0x3d4248,0);
    moto(W/2+2.6,fz-16,0x1a1a1a); moto(W/2+2.6,fz-16.9,0xc22a2a); moto(W/2+2.6,fz-22.5,0x2a63c8); moto(W/2+2.6,fz-23.4,0x1a1a1a);
    // --- pilas de pallets: contra la pared este pasando el alero hasta el fondo, y el murallón suelto sobre la tierra (fotos 7, 19 y 22) ---
    const palTex=(base,dk)=>rep(tex(128,128,(x,w,h)=>{ x.fillStyle=dk; x.fillRect(0,0,w,h);
      for(let p=0;p<8;p++){ const y=p*16; x.fillStyle=base; x.fillRect(0,y,w,3); x.fillRect(0,y+13,w,2); for(const bx of [0,52,108]) x.fillRect(bx,y+3,20,10); }
      noise(x,w,h,900,90,60,30,.35); }));
    const palM=[new THREE.MeshLambertMaterial({map:palTex('#b98c58','#3a2a1a')}),new THREE.MeshLambertMaterial({map:palTex('#8f7a62','#2e261d')})];
    const stack=(x,z,n,ry)=>{ const h=n*.15, b=gl(x,z)-.02, g=boxUV(1.2,h,1,1.2); g.translate(0,h/2,0); if(ry) g.rotateY(ry); g.translate(x,b,z); B.add(g,palM[(x*7+z*3|0)&1]); };
    const rnd=(i)=>{ const v=Math.sin(i*12.9898)*43758.5453; return v-Math.floor(v); };
    let si=0;
    for(let z=cZ0-1; z>-Dp/2-13; z-=1.05) for(let ix=0;ix<4;ix++){ si++; stack(W/2+1.2+ix*1.25,z,11+(rnd(si)*7|0),(rnd(si+99)-.5)*.08); }
    for(let z=fz-3; z>-Dp/2-13; z-=1.05) for(let ix=0;ix<2;ix++){ si++; if(rnd(si)<.06) continue; stack(W/2+16+ix*1.25,z,12+(rnd(si)*6|0),(rnd(si+99)-.5)*.1); }
    // --- nave baja azul pegada atrás, del lado este (se ve detrás de los pallets) ---
    const aX0=W/2-24, aX1=W/2, aZ0=-Dp/2-14, aZ1=-Dp/2, aH=7, aw=aX1-aX0, ad=aZ1-aZ0, acx=(aX0+aX1)/2, acz=(aZ0+aZ1)/2;
    { const g=boxUV(aw,aH+.6,ad,1.6); g.translate(acx,(aH+.6)/2-.6,acz); add(g,[azul,azul,techo,techo,azul,azul]); const g2=boxUV(aw+.3,zB+.6,ad+.3,1.6); g2.translate(acx,(zB+.6)/2-.6,acz); add(g2,bloqM); }
    for(const ax of [acx-5,acx+5]) B.box(8,5,.12,ax,2.5,aZ0-.1,frame);
    // columnas de luz del patio
    for(const lx of [-20,0,20]){ { const b=gl(lx,fz+yd-3); B.cyl(.12,.16,10+b,lx,(10+b)/2,fz+yd-3,steel,6); B.box(1.4,.2,.5,lx,10+b,fz+yd-3,steel); } }
    B.meshes(G).forEach(m=>osmHitoMs.push(m));
    // letras ADA y el logo
    { const lm=new THREE.MeshLambertMaterial({map:lettersTex(),transparent:true,depthWrite:false}); const m=new THREE.Mesh(new THREE.PlaneGeometry(17,8.5),lm); m.position.set(-9,8.2,fz+.2); G.add(m);
      for(const [sd,z,y] of [[1,fz-11,8],[-1,fz-19,8.4]]){ const m2=new THREE.Mesh(new THREE.PlaneGeometry(13,6.5),lm); m2.position.set(sd*(W/2+.2),y,z); m2.rotation.y=sd*Math.PI/2; G.add(m2); } }   // también en los dos costados (fotos 4 y 19)
    G.updateMatrixWorld(true);
    // choque: la nave y las columnas de la playa; las casas de relleno que caen adentro se achican
    clearOut((x,z,r)=>{ const dx=x-cx, dz=z-cz, lx=dx*c-dz*s, lz=dx*s+dz*c; return lx>-W/2-22-r*.3&&lx<W/2+30+r*.3&&lz>-Dp/2-17-r*.3&&lz<fz+yd+r*.3; });
    block(cx,cz,W,Dp,th,.35);                                                               // bloque bajo escondido (uno alto se dibujaría como edificio)
    { const lb=(x0,x1,z0,z1)=>{ const [X,Z]=at((x0+x1)/2,(z0+z1)/2); block(X,Z,x1-x0,z1-z0,th,.35); };   // oficinas, nave baja, garita, tanque, grupo y pilas de pallets
      lb(oX0,oX1,oZ0,oZ1); lb(aX0,aX1,aZ0,aZ1); lb(W/2+1.1,W/2+3.5,fz-3.6,fz-1.2); lb(-W/2-4.9,-W/2-1.3,-Dp/2-4.2,-Dp/2-.6); lb(-W/2-1.9,-W/2-.3,-Dp/2+3.2,-Dp/2+6.8);
      lb(W/2+.6,W/2+6,-Dp/2-13,cZ0-.5); lb(W/2+15.4,W/2+17.5,-Dp/2-13,fz-2.5); }
    W2set(cx,cz,th,at,fz,yd); }
  // cartel bajo con el logo: dos postes
  function B2post(G,x,z,m,b=0){ for(const dx of [-1.8,1.8]){ const p=new THREE.Mesh(new THREE.BoxGeometry(.12,2.4,.12),m); p.position.set(x+dx,b+1.2,z-.08); G.add(p); osmHitoMs.push(p); } }
  function W2set(cx,cz,th,at,fz,yd){ const [fx,fzz]=at(-18,fz+yd*.55); W._ada={x:cx,z:cz,th,front:{x:fx,z:fzz}}; }
  window.osmADA=osmADA;
  window.adaInfo=()=>W&&W._ada;
})();
