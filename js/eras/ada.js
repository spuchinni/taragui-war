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
    // dos portones grandes abiertos (el del medio y el de la derecha) con un paño alto de bloques entre los dos (fotos del frente completo)
    const DOORS=[[-1,10],[17,9]], doorH=7.4, doorX=DOORS[0][0], doorW=DOORS[0][1];
    // el adentro se pinta en el portón (la nave es una caja maciza): estanterías altas con mercadería en la penumbra
    const inT=tex(256,192,(x,w,h)=>{ x.fillStyle='#0e1116'; x.fillRect(0,0,w,h); const C=['#3d5a3f','#7a2f28','#5b6470','#c9c2ae','#2f4a6b'];
      for(let c=0;c<4;c++){ const x0=8+c*62; x.fillStyle='#8a4a20'; x.fillRect(x0,10,3,h-20); x.fillRect(x0+52,10,3,h-20);
        for(let l=0;l<4;l++){ const y=h-18-l*44; x.fillStyle='#c06a24'; x.fillRect(x0,y,55,3); for(let k=0;k<3;k++){ x.fillStyle=C[(c*3+l*2+k)%5]; x.globalAlpha=.55; x.fillRect(x0+4+k*17,y-30,15,30); x.globalAlpha=1; } } }
      const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(0,0,0,.55)'); g.addColorStop(1,'rgba(0,0,0,.1)'); x.fillStyle=g; x.fillRect(0,0,w,h);
      x.fillStyle='#4a4d52'; x.fillRect(0,h-10,w,10); });
    for(const [dx,dw] of DOORS){ const dm=new THREE.Mesh(new THREE.PlaneGeometry(dw,doorH),new THREE.MeshBasicMaterial({map:inT,color:0x9a9a9a})); dm.position.set(dx,doorH/2,fz+.04); G.add(dm);
      B.box(.3,doorH+.3,.3,dx-dw/2-.15,doorH/2,fz+.15,frame); B.box(.3,doorH+.3,.3,dx+dw/2+.15,doorH/2,fz+.15,frame); B.box(dw+.6,.3,.3,dx,doorH+.15,fz+.15,frame);
      // adentro: estanterías altas con mercadería (se ven por los portones)
      for(const rx of [-dw/4,dw/4]){ for(let k=0;k<4;k++) B.box(.12,7,.12,dx+rx+(k%2?1.1:-1.1),3.5,fz-3-(k>1?2.6:0),rack); for(let l=1;l<=3;l++) B.box(2.4,.1,3,dx+rx,l*1.8,fz-4.3,orange);
        for(let l=0;l<4;l++) B.box(2,1.2,2.6,dx+rx,l*1.8+.7,fz-4.3,l%2?mat('adaCaja',0x2f5d3a):wood); } }
    { const [mx]=DOORS[1]; for(let i=0;i<3;i++) B.box(.9,1.6,.9,mx+2.5,.8,fz-1.5-i*1.1,red); }      // cosas rojas en el portón de la derecha
    B.box(4.2,doorH,.25,8.25,doorH/2,fz+.12,block1); for(let r=1;r<18;r++) B.box(4.2,.03,.27,8.25,r*.4,fz+.13,grey);   // paño alto de bloques entre los portones
    // portones corredizos (chapa azul con marco) a la izquierda y a la derecha
    for(const px of [-10.5,-19.5,27]){ B.box(.14,5.3,.14,px-4.4,2.65,fz+.1,frame); B.box(.14,5.3,.14,px+4.4,2.65,fz+.1,frame); B.box(8.9,.14,.14,px,5.25,fz+.1,frame); }
    // paños bajos de bloques de hormigón con una puerta (abajo a la izquierda)
    for(const [bx,bw] of [[-27.5,5],[-15,5]]){ B.box(bw,3.6,.25,bx,1.8,fz+.12,block1); for(let r=1;r<9;r++) B.box(bw,.03,.27,bx,r*.4,fz+.13,grey); }
    B.box(1,2.1,.1,-15,1.05,fz+.26,grey);
    // ventanas altas enmarcadas (paños oscuros con marco)
    for(const [wx,wy,ww,wh] of [[-26,7.6,2.2,1.6],[-20,8.4,2.6,1.8],[-5,8.9,5.2,2.8],[24,9.6,7.4,2.2]]){ B.box(ww,wh,.12,wx,wy,fz+.08,frame); B.box(ww-.3,wh-.3,.14,wx,wy,fz+.1,mat('adaWin',0x223a8c)); }
    // faroles de brazo
    for(const lx of [-24,-14,-4,14,26]){ B.box(.08,.08,1.8,lx,9.8,fz+.9,steel,0,.25); B.box(.5,.18,.8,lx,9.6,fz+1.75,steel); }
    // defensas amarillas y negras al pie del frente y a los lados de cada portón
    for(let i=0;i<10;i++){ const bx=-26+i*3.6; if(DOORS.some(([dx,dw])=>Math.abs(bx-dx)<dw/2+.8)) continue; for(let k=0;k<4;k++) B.cyl(.09,.09,.22,bx,gl(bx,fz+.5)+.11+k*.22,fz+.5,k%2?blk:yel,8); }
    for(const [dx,dw] of DOORS) for(const bx of [dx-dw/2-.6,dx+dw/2+.6]) for(let k=0;k<5;k++) B.cyl(.1,.1,.22,bx,gl(bx,fz+.5)+.11+k*.22,fz+.5,k%2?blk:yel,8);
    // esquina este: rack azul contra la pared con tambores de aceite abajo y cubiertas arriba, cubiertas sobre un pallet al lado y un poste de madera
    { const rx=W/2-1.6, rz=fz+.75, b=gl(rx,rz); for(const k of [-1,1]) for(const kk of [-1,1]) B.box(.1,5.2,.1,rx+k*.6,b+2.6,rz+kk*.5,rack);
      for(const y of [.15,2.2,5.1]) B.box(1.35,.1,1.1,rx,b+y,rz,rack); for(const k of [-1,1]){ const g=new THREE.BoxGeometry(.06,2.6,.06); g.rotateX(k*.35); g.translate(rx+k*.62,b+3.6,rz); B.add(g,rack); }
      for(let i=0;i<2;i++) for(let j=0;j<2;j++) B.cyl(.29,.29,.88,rx-.3+i*.6,b+.65,rz-.25+j*.5,red,12);
      for(let i=0;i<5;i++) B.cyl(.55,.55,.28,rx,b+2.45+i*.3,rz,rubber,14);
      const tx=rx-2.2, b2=gl(tx,rz); B.box(1.2,.14,1,tx,b2+.07,rz,wood); for(let i=0;i<4;i++) B.cyl(.55,.55,.28,tx,b2+.3+i*.29,rz,rubber,14);
      { const g=new THREE.CylinderGeometry(.13,.17,10,8); g.rotateZ(.07); g.translate(W/2+.35,b+5,fz+.9); B.add(g,mat('adaPoste',0x9a8f7a)); } }
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
    // costados con zócalo parejo; atrás paños de bloques intercalados con chapa (foto de la parte de atrás de punta a punta)
    for(const [w,d,x,z] of [[.3,Dp+.3,-W/2-.08,0],[.3,Dp+.3,W/2+.08,0],[13,.3,-W/2+6.5,-Dp/2-.08],[7,.3,-W/2+18,-Dp/2-.08],[7,.3,-2,-Dp/2-.08],[9,.3,W/2-4.5,-Dp/2-.08]]){ const g=boxUV(w,zB+.6,d,1.6); g.translate(x,(zB+.6)/2-.6,z); add(g,bloqM); }
    for(const [x,w] of [[-W/2+24,5],[6,10],[W/2-14,8]]) B.box(w,2.6,.1,x,1.3,-Dp/2-.12,frame);            // portones bajos de chapa entre los paños
    // ventanas altas de atrás
    for(const x of [-22,-8,8,22]){ B.box(4,2,.12,x,8.6,-Dp/2-.08,frame); B.box(3.7,1.7,.14,x,8.6,-Dp/2-.1,mat('adaWin',0x223a8c)); }
    // suelos: tierra al este (autos y pallets) y pasillo de hormigón al oeste
    const dirtM=new THREE.MeshLambertMaterial({map:rep(tex(256,256,(x,w,h)=>{ x.fillStyle='#93806b'; x.fillRect(0,0,w,h); noise(x,w,h,4000,115,95,72,.35);
      x.strokeStyle='rgba(110,78,52,.35)'; x.lineWidth=5; for(let i=0;i<6;i++){ x.beginPath(); const y=Math.random()*h; x.moveTo(0,y); x.bezierCurveTo(w*.3,y+30*(Math.random()-.5),w*.6,y+30*(Math.random()-.5),w,y); x.stroke(); }
      for(let i=0;i<14;i++){ x.fillStyle='rgba(95,120,60,.35)'; x.beginPath(); x.arc(Math.random()*w,Math.random()*h,4+Math.random()*10,0,7); x.fill(); } })),polygonOffset:true,polygonOffsetFactor:-1});
    const concM=new THREE.MeshLambertMaterial({map:rep(tex(128,128,(x,w,h)=>{ x.fillStyle='#a9a7a1'; x.fillRect(0,0,w,h); noise(x,w,h,1500,130,128,122,.3); x.strokeStyle='rgba(80,80,78,.4)'; x.lineWidth=2; for(let i=0;i<=h;i+=32){ x.beginPath(); x.moveTo(0,i); x.lineTo(w,i); x.stroke(); } })),polygonOffset:true,polygonOffsetFactor:-2});
    drape(W/2,W/2+28,-Dp/2-4,fz+yd,dirtM);
    // --- oficinas: bloque de dos pisos de bloques grises al ras del frente en la punta oeste ---
    const oX0=-W/2-7.5, oX1=-W/2+.2, oZ0=fz-11, oZ1=fz+.3, oH=7.4, ow=oX1-oX0, od=oZ1-oZ0, ocx=(oX0+oX1)/2, ocz=(oZ0+oZ1)/2;
    { const g=boxUV(ow,oH+.6,od,1.6); g.translate(ocx,(oH+.6)/2-.6,ocz); add(g,bloqM); }
    B.box(ow+.3,.35,od+.3,ocx,oH+.17,ocz,grey);
    const win=(x,y,z,ax)=>{ if(ax){ B.box(.1,1.4,1.9,x,y,z,white); B.box(.14,1.15,1.65,x,y,z,glass); } else { B.box(1.9,1.4,.1,x,y,z,white); B.box(1.65,1.15,.14,x,y,z,glass); } };
    for(const y of [1.8,5.2]){ win(oX0+3.2,y,oZ1+.02,0); for(const dz of [-3.2,1.2]) win(oX0-.02,y,ocz+dz,1); win(oX0+3.2,y,oZ0-.02,0); }
    B.box(1,2.2,.12,oX0+6.2,1.1,oZ1+.03,grey); B.box(1,2.2,.12,-W/2-2.6,1.1,oZ0-.03,white);              // puertas: al patio y al pasillo
    for(const [x,y] of [[oX0+4.6,3.2],[oX0+5.8,3.2]]) B.box(.9,.6,.35,x,y,oZ0-.2,white);                // aires acondicionados
    B.cyl(.32,.32,.06,oX0+2,oH+.9,oZ0+1,white,14,Math.PI/2.4); B.box(.05,.6,.05,oX0+2,oH+.5,oZ0+1,steel);   // antena satelital
    B.box(.5,.7,.2,oX0+1,1.5,oZ1+.12,grey);                                                              // caja del medidor
    for(const dx of [-1.2,-.6]) B.cyl(.28,.22,.55,-W/2-2.9+dx,.28,oZ0-.6,mat('adaMaceta',0xd9d4c8),10);   // macetas en la puerta del pasillo
    // --- pasillo de hormigón al oeste entre la pared y el cerco olímpico; al fondo el grupo electrógeno contra la pared y el tanque de agua ---
    const fX=-W/2-6.2, fZ0=-Dp/2-3.6;
    drape(fX+.2,-W/2,fZ0,oZ0,concM);
    const meshT=tex(64,64,(x,w,h)=>{ x.clearRect(0,0,w,h); x.strokeStyle='rgba(150,155,150,.95)'; x.lineWidth=2; for(let i=-64;i<128;i+=16){ x.beginPath(); x.moveTo(i,0); x.lineTo(i+64,64); x.stroke(); x.beginPath(); x.moveTo(i,64); x.lineTo(i+64,0); x.stroke(); } });
    rep(meshT); const meshM=new THREE.MeshLambertMaterial({map:meshT,transparent:true,alphaTest:.4,side:THREE.DoubleSide});
    const cerco=(x0,z0,x1,z1,ox,oz)=>{ const L=Math.hypot(x1-x0,z1-z0), ry=Math.atan2(x1-x0,z1-z0), n=Math.max(1,Math.round(L/3));
      for(let i=0;i<=n;i++){ const x=x0+(x1-x0)*i/n, z=z0+(z1-z0)*i/n, b=gl(x,z); B.box(.18,2.5,.18,x,b+1.2,z,conc);
        const g=new THREE.BoxGeometry(.13,.75,.13); g.rotateZ(-ox*.6); g.rotateX(oz*.6); g.translate(x+ox*.2,b+2.7,z+oz*.2); B.add(g,conc); }
      const mx=(x0+x1)/2, mz=(z0+z1)/2, b=gl(mx,mz);
      B.box(.22,.5,L,mx,b+.2,mz,block1,ry);
      for(const k of [1,2,3]) B.box(.03,.03,L,mx+ox*.12*k,b+2.35+k*.15,mz+oz*.12*k,steel,ry);
      const g=new THREE.PlaneGeometry(L,1.9); const u=g.attributes.uv; for(let i=0;i<u.count;i++) u.setXY(i,u.getX(i)*L/.6,u.getY(i)*1.9/.6);
      const m=new THREE.Mesh(g,meshM); m.position.set(mx,b+1.4,mz); m.rotation.y=ry+Math.PI/2; G.add(m); };
    cerco(fX,oZ0,fX,-Dp/2-46,-1,0);                                                                       // sigue derecho hasta el fondo del terreno, pasando el taller
    { const tx=-W/2-3.1, tz=-Dp/2-1.4, b=gl(tx,tz); B.cyl(1.75,1.75,4.6,tx,b+2.3,tz,tankM,22); B.cyl(.35,1.75,.55,tx,b+4.87,tz,tankM,22); B.cyl(.32,.32,.18,tx,b+5.2,tz,tankD,12);
      for(let k=1;k<6;k++) B.cyl(1.8,1.8,.12,tx,b+k*.78,tz,tankD,22); }
    { const gx=-W/2-1.1, gz=-Dp/2+3.4, b=gl(gx,gz); B.box(1.5,2,3.4,gx,b+1.05,gz,white); B.box(.05,1.1,1.6,gx-.76,b+1.1,gz-.6,grey); B.box(1.55,.1,3.45,gx,b+2.08,gz,steel); B.box(1.6,.15,3.6,gx,b+.07,gz,blk); B.cyl(.08,.08,.5,gx+.3,b+2.35,gz+1.2,steel,8); }
    // vecino del oeste: lote con un mixer viejo detrás del cerco del pasillo
    const veh=(x,z,ry,fn)=>{ const g=new THREE.Group(), b=Bag(); fn(b); b.meshes(g).forEach(m=>osmHitoMs.push(m)); g.position.set(x,gl(x,z)-.02,z); g.rotation.y=ry; G.add(g); return g; };
    const wheels=(b,list,r,w)=>{ for(const [x,z] of list) b.cyl(r,r,w,x,r,z,rubber,12,Math.PI/2); };
    veh(-W/2-11,-Dp/2+4,.3,b=>{ const cab=mat('adaMixCab',0xd8d6cf), rus=mat('adaRust',0x8a7a5c); b.box(2.3,2.3,2.3,2.8,1.9,0,cab); b.box(6.5,.5,1.2,-.6,1,0,blk); b.box(.9,.7,2.2,4,1.1,0,rus);
      { const g=new THREE.CylinderGeometry(1.15,1.35,4.2,14); g.rotateZ(Math.PI/2-.18); g.translate(-.8,2.6,0); b.add(g,mat('adaMix',0xc8c5b8)); } b.cyl(.35,.6,.8,-3.3,3.4,0,rus,10,0,1.2);
      wheels(b,[[2.8,1],[2.8,-1],[-1.6,1],[-1.6,-1],[-2.9,1],[-2.9,-1]],.5,.35); });
    // --- frente este: garita blanca de puerta al frente, caño blanco y alero pegado a la pared con autos y motos abajo ---
    { const gx=W/2+1.75, gz=fz+.3, b=gl(gx,gz); B.box(2.2,2.5,2.3,gx,b+1.3,gz,white); B.box(2.5,.18,2.6,gx,b+2.62,gz,white);
      B.box(.75,2,.06,gx-.6,b+1.05,gz+1.17,mat('adaPuerta',0xd9d6cc)); B.box(.4,.7,.07,gx-.6,b+1.55,gz+1.19,glass); B.box(.06,.2,.06,gx-.32,b+1,gz+1.2,blk);
      for(const dx of [-.05,.4,.85]) B.box(.38,.7,.07,gx+dx,b+1.65,gz+1.19,glass); B.box(.06,.7,1.4,gx+1.12,b+1.65,gz,glass); }
    { const x=W/2-1.6, z=fz+.75, b=gl(x,z)+5.15; B.box(1,1,1,x,b+.5,z,mat('adaIBC',0xeeeeea)); for(const k of [-1,1]) for(const kk of [-1,1]) B.box(.04,1.02,.04,x+k*.5,b+.5,z+kk*.5,steel); }   // tanque IBC sobre el rack
    for(const dz of [0,.4]) B.cyl(.18,.18,11.2,W/2+.4,5.2,fz-2.2-dz,white,10);
    const cZ0=1, cZ1=fz-4, cX=W/2+6.4, cl=cZ1-cZ0, ccz=(cZ0+cZ1)/2;
    { const t0=4.5, t1=4.1; const g=new THREE.BoxGeometry(cX-W/2+.5,.1,cl); g.rotateZ(-Math.atan2(t0-t1,cX-W/2)); g.translate((W/2+cX)/2,(t0+t1)/2,ccz); B.add(g,roofP);
      for(const y of [t1-.05,t1-.6]) B.box(.08,.08,cl,cX,y,ccz,truss);
      for(let k=0;k<cl/.6;k++){ const z=cZ0+k*.6+.3; const g2=new THREE.BoxGeometry(.05,.78,.05); g2.rotateX(k%2?.75:-.75); g2.translate(cX,t1-.33,z); B.add(g2,truss); }
      for(let k=0;k<=2;k++){ const z=cZ0+k*cl/2, b=gl(cX,z)-.1, hh=t1-.6-b;
        for(const [dx,dz] of [[-.17,-.15],[-.17,.15],[.17,0]]) B.box(.05,hh,.05,cX+dx,b+hh/2,z+dz,truss);
        for(let j=0;j<hh/.5;j++){ const y=b+.25+j*.5; B.box(.03,.03,.34,cX-.17,y,z,truss); B.box(.36,.03,.03,cX,y,z+(j%2?.08:-.08),truss); } } }
    // autos genéricos (de culata a la pared: largo en x)
    const car=(x,z,col,suv)=>veh(x,z,0,b=>{ const cm=mat('adaCar'+col.toString(16),col); b.box(4.1,suv?.85:.7,1.78,0,suv?.75:.62,0,cm); b.box(2.3,.6,1.62,.1,suv?1.5:1.25,0,glass); b.box(2.1,.08,1.62,.1,suv?1.82:1.57,0,cm);
      b.box(.06,.18,1.5,-2.06,.7,0,mat('adaFaroR',0x9a1a14)); wheels(b,[[-1.3,-.84],[1.3,-.84],[-1.3,.84],[1.3,.84]],suv?.38:.32,.24); });
    const moto=(x,z,col,ry=0)=>veh(x,z,ry,b=>{ b.box(1.5,.45,.25,0,.7,0,mat('adaMoto'+col.toString(16),col)); b.box(.6,.12,.28,-.3,.98,0,blk); b.box(.05,.5,.6,.65,1.05,0,steel); b.cyl(.3,.3,.1,-.7,.3,0,rubber,10,Math.PI/2); b.cyl(.3,.3,.1,.7,.3,0,rubber,10,Math.PI/2); });
    car(W/2+3.2,9.6,0xe9eaec,1); car(W/2+3.2,6.4,0xb9bcc0,0);
    moto(W/2+2.4,4.4,0x8a1f1f); moto(W/2+2.4,3.5,0x1a1a1a); moto(W/2+2.4,2.4,0x1a1a1a); moto(W/2+3.6,fz+1.2,0x1c1c1e,.15);
    // Ford Falcon Deluxe celeste acero gastado (fotos de Sebastián) contra los pallets, al final del alero, con la motito azul adelante
    const falcon=veh(W/2+3.3,-1.4,0,b=>{ const cm=mat('adaFalcon',0x5f8799), chrome=mat('adaChrome',0xd6d9dc);
      const prof=[[2.38,.32],[2.42,.78],[1.05,.86],[-1.5,.86],[-2.36,.84],[-2.4,.32]]; const sh=new THREE.Shape(); sh.moveTo(prof[0][0],prof[0][1]); for(const [px,py] of prof.slice(1)) sh.lineTo(px,py); sh.closePath();
      { const g=new THREE.ExtrudeGeometry(sh,{depth:1.8,bevelEnabled:false}); g.translate(0,0,-.9); b.add(g,cm); }
      const gh=new THREE.Shape(); gh.moveTo(1.02,.86); gh.lineTo(.32,1.3); gh.lineTo(-.95,1.3); gh.lineTo(-1.48,.86); gh.closePath();
      { const g=new THREE.ExtrudeGeometry(gh,{depth:1.66,bevelEnabled:false}); g.translate(0,0,-.83); b.add(g,glass); }
      b.box(1.3,.06,1.68,-.32,1.32,0,cm); for(const z of [-.82,.82]){ b.box(.06,.5,.06,.65,1.08,z,cm); b.box(.06,.46,.06,-1.22,1.08,z,cm); b.box(.06,.44,.06,-.3,1.08,z,cm); }
      for(const x of [2.47,-2.45]) b.box(.1,.16,1.86,x,.42,0,chrome);                                    // paragolpes cromados
      b.box(.04,.26,1.0,2.43,.6,0,mat('adaGrille',0x2a2c2e)); for(let k=0;k<5;k++) b.box(.05,.02,1.0,2.44,.5+k*.05,0,chrome);
      for(const z of [-.66,-.42,.42,.66]){ b.cyl(.115,.115,.05,2.43,.62,z,chrome,14,0,Math.PI/2); b.cyl(.09,.09,.06,2.44,.62,z,mat('adaFaro',0xf2f0e0),14,0,Math.PI/2); }   // faros dobles redondos
      b.box(.9,.07,.38,1.55,.885,0,cm); b.box(.25,.05,.25,1.15,.9,0,cm);                                      // joroba del capó
      for(const z of [-.66,.66]){ b.cyl(.12,.12,.05,-2.42,.64,z,chrome,14,0,Math.PI/2); b.cyl(.095,.095,.06,-2.43,.64,z,mat('adaFaroR',0x9a1a14),14,0,Math.PI/2); }   // faroles redondos
      b.box(.03,.2,1.05,-2.42,.64,0,chrome); b.box(4.6,.03,.02,0,.62,.905,chrome); b.box(4.6,.03,.02,0,.62,-.905,chrome);
      wheels(b,[[-1.45,-.8],[1.45,-.8],[-1.45,.8],[1.45,.8]],.33,.22); for(const [x,z] of [[-1.45,-.92],[1.45,-.92],[-1.45,.92],[1.45,.92]]) b.cyl(.17,.17,.02,x,.33,z,chrome,12,Math.PI/2); });
    falcon.rotation.y=Math.PI;                                                                            // de trompa a la pared, como en la foto
    moto(W/2+5.6,-1.6,0x2a63c8,.5);
    // --- pallets: contra la pared este pasando el Falcon hasta el fondo, y el murallón casi de punta a punta con un rack de mercadería rota en el medio ---
    const palTex=(base,dk)=>rep(tex(128,128,(x,w,h)=>{ x.fillStyle=dk; x.fillRect(0,0,w,h);
      for(let p=0;p<8;p++){ const y=p*16; x.fillStyle=base; x.fillRect(0,y,w,3); x.fillRect(0,y+13,w,2); for(const bx of [0,52,108]) x.fillRect(bx,y+3,20,10); }
      noise(x,w,h,900,90,60,30,.35); }));
    const palM=[new THREE.MeshLambertMaterial({map:palTex('#b98c58','#3a2a1a')}),new THREE.MeshLambertMaterial({map:palTex('#8f7a62','#2e261d')})];
    const stack=(x,z,n,ry)=>{ const h=n*.15, b=gl(x,z)-.02, g=boxUV(1.2,h,1,1.2); g.translate(0,h/2,0); if(ry) g.rotateY(ry); g.translate(x,b,z); B.add(g,palM[(x*7+z*3|0)&1]); };
    const rnd=(i)=>{ const v=Math.sin(i*12.9898)*43758.5453; return v-Math.floor(v); };
    let si=0;
    const rkZ=-14;
    for(let z=-4.2; z>-Dp/2-13; z-=1.05){ for(let ix=0;ix<5;ix++){ if(ix>=3&&Math.abs(z-rkZ)<1.8) continue; si++; if(ix==4&&rnd(si)<.15) continue; stack(W/2+1.2+ix*1.25,z,11+(rnd(si)*7|0),(rnd(si+99)-.5)*.08); } }
    { const rx=W/2+5.6, rz=rkZ, b=gl(rx,rz); for(const k of [-1,1]) for(const kk of [-1,1]) B.box(.1,3.4,.1,rx+kk*.55,b+1.7,rz+k*1.4,rack); for(const y of [.2,1.6,3.0]) B.box(1.2,.1,2.9,rx,b+y,rz,orange);
      for(let i=0;i<8;i++){ const y=[.75,2.15][i>>2], z=rz-1.05+(i&3)*.7; B.box(.6+rnd(i)*.3,.7+rnd(i+5)*.4,.55,rx-.1+rnd(i+9)*.2,b+y,z,[mat('adaCaja1',0xc9b48a),mat('adaCaja2',0xa33b2a),mat('adaCaja3',0xe8e6e0)][i%3],(rnd(i)-.5)*.4); } }
    // --- taller: nave azul suelta ~15 m detrás del galpón, borde este alineado, abierta hacia el oeste (fotos del fondo) ---
    const tX0=W/2-24, tX1=W/2, tZ1=-Dp/2-15, tZ0=tZ1-18, tH=8, tw=tX1-tX0, td=tZ1-tZ0, tcx=(tX0+tX1)/2, tcz=(tZ0+tZ1)/2;
    for(const [w,d,x,z] of [[tw,.25,tcx,tZ0],[tw,.25,tcx,tZ1],[.25,td,tX1,tcz]]){ const g=boxUV(w,tH+.6,d,1.6); g.translate(x,(tH+.6)/2-.6,z); add(g,azul); const g2=boxUV(w+.08,3.4,d+.08,1.6); g2.translate(x,1.1,z); add(g2,bloqM); }
    { const g=boxUV(tw+.6,.25,td+.6,1.6); g.translate(tcx,tH+.1,tcz); add(g,techo); }
    for(let k=0;k<=3;k++) B.box(.3,tH,.3,tX0+.2,tH/2,tZ0+k*td/3,frame);                                   // columnas del lado abierto
    B.box(tw-.6,.05,td-.5,tcx,.04,tcz,mat('adaPisoT',0x7c786f));
    B.box(2.6,1,.8,tX1-2,.5,tZ0+2,mat('adaBanco',0x5d4a35)); B.box(1.4,2,.6,tX1-1,1,tcz,mat('adaArm',0x3a5c8c));
    // camiones del taller y del fondo
    const truck=(x,z,ry,cabC,bedC,o={})=>veh(x,z,ry,b=>{ const cm=mat('adaTk'+cabC.toString(16),cabC), bm=mat('adaTb'+bedC.toString(16),bedC);
      b.box(1.9,2.2,2.3,3.1,1.75,0,cm); b.box(.06,.8,1.9,4.06,2.05,0,glass); b.box(7,.35,.9,-.2,.95,0,blk);
      if(o.tarp){ b.box(5.4,2.4,2.4,-.9,2.4,0,mat('adaLona',0x1c3d7a)); } else if(o.cage){ for(let k=0;k<7;k++) for(const zz of [-1.15,1.15]) b.box(.08,1.5,.08,-3.5+k*.9,1.9,zz,bm); for(const y of [1.5,2.2,2.6]) for(const zz of [-1.15,1.15]) b.box(5.5,.08,.08,-.8,y,zz,bm); b.box(5.5,.15,2.4,-.8,1.2,0,bm); }
      else { b.box(5.4,.2,2.4,-.9,1.25,0,bm); for(const zz of [-1.15,1.15]) b.box(5.4,.45,.06,-.9,1.55,zz,bm); }
      wheels(b,[[3.1,1],[3.1,-1],[-2.2,1],[-2.2,-1],[-3.3,1],[-3.3,-1]],.5,.35); });
    truck(tX0-6,tZ1-3,0,0xf1f1ee,0x1c3d7a,{tarp:1}); truck(tX0+5,tcz,0,0xf1f1ee,0xd6d3c8); truck(tX1+5,tZ0+4,Math.PI/2,0xe9e6dc,0xb7975a); truck(tX0-14,tZ0+3,.2,0xece9e2,0xc9c6be);
    veh(tX1+6,tZ0+12,Math.PI/2,b=>{ const ym=mat('adaAcopl',0xc2a056); b.box(7,.3,2.4,0,1.2,0,ym); for(const zz of [-1.1,1.1]) b.box(7,.9,.08,0,1.8,zz,ym); b.box(.1,1.8,2.4,3.4,2.1,0,ym); wheels(b,[[-2.2,1],[-2.2,-1],[-3.3,1],[-3.3,-1]],.5,.35); });
    car(tX1+5,tZ1+2,0xa9adb2,0);
    // --- galpón del vecino al oeste del frente: chapa gris a dos aguas, a ~15 m, con su cerco sobre la calle de tierra ---
    const vX1=-W/2-23, vX0=vX1-20, vZ1=fz+2, vZ0=vZ1-42, vH=9.5, vw=vX1-vX0, vd=vZ1-vZ0, vcx=(vX0+vX1)/2, vcz=(vZ0+vZ1)/2;
    const grisCh=new THREE.MeshLambertMaterial({map:chapaTex('#a9b0b5','rgba(230,236,240,.55)','rgba(70,76,82,.35)')}), grisBaj=mat('adaVecBaj',0x8e959a);
    { const g=boxUV(vw,vH+.6,vd,1.6); g.translate(vcx,(vH+.6)/2-.6,vcz); add(g,[grisCh,grisCh,grisCh,grisCh,grisCh,grisCh]); B.box(vw+.1,3.2,vd+.1,vcx,1.1,vcz,grisBaj);
      for(const sd of [-1,1]){ const L=Math.hypot(vw/2+.3,2.6), g2=new THREE.PlaneGeometry(L,vd+.4); g2.rotateX(-Math.PI/2); g2.rotateZ(-sd*Math.atan2(2.6,vw/2)); g2.translate(vcx+sd*vw/4,vH+1.3,vcz); add(g2,techo); }
      for(const sd of [-1,1]){ const sh=new THREE.Shape(); sh.moveTo(-vw/2,0); sh.lineTo(vw/2,0); sh.lineTo(0,2.6); sh.closePath(); const g3=new THREE.ShapeGeometry(sh); if(sd<0) g3.rotateY(Math.PI); g3.translate(vcx,vH,sd>0?vZ1+.01:vZ0-.01); add(g3,grisCh); }
      for(let k=0;k<4;k++) B.box(.1,1.4,2.2,vX1+.06,7.2,vZ1-8-k*9,mat('adaRejV',0x5e6468)); for(let k=0;k<6;k++) B.box(.15,vH,.25,vX1+.1,vH/2,vZ1-1-k*8,mat('adaColV',0xc9ced2)); }
    cerco(vX1+3,vZ1+6,vX1+3,vZ0-4,1,0);
    // --- Hiper Gas, cruzando la calle frente a ADA: galpones blancos viejos con techo de chapa oxidada, torre de ladrillo con el tanque, antena y acoplados ---
    { const hz=118, rus=mat('adaRustRoof',0x8a5a3c), blanco=mat('adaHGW',0xe4e5e0), zocA=mat('adaHGz',0x6f8fb0);
      const shed=(x,z,w,d,h)=>{ const b0=gl(x,z); B.box(w,h,d,x,b0+h/2,z,blanco); B.box(w+.05,.5,d+.05,x,b0+.25,z,zocA);
        for(const sd of [-1,1]){ const g=new THREE.BoxGeometry(w/2+.4,.1,d+.4); g.rotateZ(-sd*.18); g.translate(x+sd*w/4,b0+h+.45,z); B.add(g,rus); }
        for(const sd of [-1,1]){ const g=new THREE.CylinderGeometry(w/2,w/2,.3,16,1,false,-Math.PI/2,Math.PI); g.rotateX(Math.PI/2); g.translate(x,b0+h-.3,z+sd*(d/2)); B.add(g,blanco); } };
      shed(-30,hz,10,32,5); shed(-6,hz+14,9,14,4.5); B.box(6,4,9,6,gl(6,hz+20)+2,hz+20,blanco);
      { const x=22, z=hz+6, b0=gl(x,z); B.box(3.2,7.5,3.2,x,b0+3.75,z,mat('adaLadr',0xa4553a)); B.box(3.4,2.2,3.4,x,b0+8.6,z,mat('adaHGt',0xd8cfa8)); B.box(.6,.5,.1,x,b0+4.5,z-1.62,glass); }
      { const x=30, z=hz+18, b0=gl(x,z); for(let i=0;i<3;i++){ const a=i*2.094; B.box(.05,34,.05,x+Math.cos(a)*.35,b0+17,z+Math.sin(a)*.35,mat('adaAnt',0xd7d9db)); } for(let k=0;k<34;k+=1.5) B.box(.75,.03,.03,x,b0+k,z,mat('adaAnt',0xd7d9db)); }
      { const x=-2, z=hz-4, b0=gl(x,z); B.cyl(.1,.14,10,x,b0+5,z,steel,6); B.box(1.4,.2,.5,x+.6,b0+10,z,steel); }
      truck(-12,hz+2,Math.PI/2,0xe2e2dc,0x2f5fa8,{cage:1}); truck(-16,hz+4,Math.PI/2+.1,0xe2e2dc,0x2f5fa8,{cage:1});
      for(let k=0;k<14;k++){ const x=-44+k*5, z=hz-12, b0=gl(x,z); B.box(.12,1.9,.12,x,b0+.95,z,mat('adaPosteV',0x6a6050)); }
      { const g=new THREE.PlaneGeometry(65,1.7); const u=g.attributes.uv; for(let i=0;i<u.count;i++) u.setXY(i,u.getX(i)*65/.6,u.getY(i)*1.7/.6); const m=new THREE.Mesh(g,meshM); m.position.set(-11.5,gl(-11.5,hz-12)+.9,hz-12); G.add(m); } }
    // --- el árbol grande al final de la playa y columnas de luz ---
    { const x=W/2+26, z=fz+22, b0=gl(x,z); B.cyl(.55,.8,4.2,x,b0+2.1,z,mat('adaTronco',0x5a4632),8);
      for(const [dx,dy,dz,r] of [[0,7,0,5.5],[3.5,6,2,4],[-3.5,6.2,-1.5,4.2],[1.5,8.5,-2.5,3.6],[-2,8,3,3.8],[4,5.5,-3,3.2]]){ const g=new THREE.IcosahedronGeometry(r,1); g.scale(1,.62,1); g.translate(x+dx,b0+dy,z+dz); B.add(g,mat('adaCopa',0x4f6e34)); } }
    for(const lz of [fz+6,fz+20]){ const lx=W/2+32, b=gl(lx,lz); B.cyl(.1,.14,11,lx,b+5.5,lz,white,6); B.box(1.6,.18,.45,lx-.8,b+11,lz,steel); }
    // columnas de luz del patio
    for(const lx of [-20,0,20]){ { const b=gl(lx,fz+yd-3); B.cyl(.12,.16,10+b,lx,(10+b)/2,fz+yd-3,steel,6); B.box(1.4,.2,.5,lx,10+b,fz+yd-3,steel); } }
    // --- vehículos que se mueven: la Fiat Strada de ADA (2024, doble cabina, con el ploteo) que a ratos da una vuelta por la playa, y el autoelevador del encargado ---
    const mover=fn=>{ const g=new THREE.Group(), b=Bag(); fn(b,g); b.meshes(g); G.add(g); return g; };
    const driver=(b,x,y,z,shirt,pants)=>{ b.box(.42,.55,.36,x,y+.3,z,mat('adaCam'+shirt.toString(16),shirt)); b.box(.4,.18,.5,x+.2,y,z,mat('adaPan'+pants.toString(16),pants));
      { const g=new THREE.SphereGeometry(.12,10,8); g.translate(x+.02,y+.72,z); b.add(g,mat('adaPiel',0xb98a64)); } { const g=new THREE.SphereGeometry(.125,10,6,0,Math.PI*2,0,Math.PI/2); g.translate(x,y+.76,z); b.add(g,mat('adaPelo',0x1d1a18)); }
      for(const dz of [-.2,.2]) b.box(.4,.1,.1,x+.25,y+.38,z+dz,mat('adaCam'+shirt.toString(16),shirt)); };
    const plotT=tex(512,128,(x,w,h)=>{ x.fillStyle='#f4f5f6'; x.fillRect(0,0,w,h);
      x.fillStyle='#d23a2a'; x.beginPath(); x.moveTo(0,h*.6); x.lineTo(w,h*.46); x.lineTo(w,h*.54); x.lineTo(0,h*.68); x.fill();
      x.fillStyle='#1f3fa8'; x.beginPath(); x.moveTo(0,h*.68); x.lineTo(w,h*.54); x.lineTo(w,h); x.lineTo(0,h); x.fill();
      x.fillStyle='#1f3fa8'; x.font='bold 34px Arial,sans-serif'; x.fillText('ADA',w*.6,h*.33); x.font='bold 13px Arial,sans-serif'; x.fillText('TEL. 3794 62-4903',w*.6,h*.46);
      x.fillStyle='#ffffff'; x.font='bold 12px Arial,sans-serif'; x.fillText('Corrientes / Chaco · Formosa / Misiones · Santa Fe',w*.5,h*.86); x.fillText('www.adalogistica.com',w*.06,h*.88); });
    const plotM=new THREE.MeshLambertMaterial({map:plotT,polygonOffset:true,polygonOffsetFactor:-2});
    const strada=mover((b,g)=>{ const wm=mat('adaStrada',0xf2f3f4);
      const sh=new THREE.Shape(); [[2.24,.33],[2.26,.76],[1.3,.97],[-2.2,1.0],[-2.24,.33]].forEach(([px,py],i)=>i?sh.lineTo(px,py):sh.moveTo(px,py)); sh.closePath();
      { const e=new THREE.ExtrudeGeometry(sh,{depth:1.73,bevelEnabled:false}); e.translate(0,0,-.865); b.add(e,wm); }
      const gh=new THREE.Shape(); [[1.25,.97],[.45,1.5],[-.62,1.52],[-.72,.98]].forEach(([px,py],i)=>i?gh.lineTo(px,py):gh.moveTo(px,py)); gh.closePath();
      { const e=new THREE.ExtrudeGeometry(gh,{depth:1.58,bevelEnabled:false}); e.translate(0,0,-.79); b.add(e,glass); }
      b.box(1.1,.07,1.6,-.08,1.535,0,wm); b.box(.08,.55,1.6,-.7,1.25,0,wm);
      b.box(1.45,.03,1.5,-1.45,1.005,0,blk); b.box(4.5,.14,1.76,0,.4,0,blk); b.box(.06,.25,1.1,2.25,.58,0,blk);
      for(const z of [-.6,.6]){ b.box(.05,.1,.32,2.26,.74,z,mat('adaFaro',0xf2f0e0)); b.box(.05,.22,.1,-2.24,.78,z,mat('adaFaroR',0x9a1a14)); }
      wheels(b,[[-1.35,-.82],[1.35,-.82],[-1.35,.82],[1.35,.82]],.34,.24);
      driver(b,.05,.72,-.38,0x1b2a44,0x1a1a1c);
      for(const sd of [-1,1]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(4.45,.62),plotM); m.position.set(0,.68,sd*.868); if(sd<0) m.rotation.y=Math.PI; g.add(m); } });
    const fork=mover((b,g)=>{ b.box(1.7,.75,1.1,0,.75,0,yel); b.box(.6,.95,1.1,-.75,1.1,0,yel); b.box(.5,.08,.5,-.2,1.2,0,blk);
      for(const [x,z] of [[.55,-.5],[.55,.5],[-.6,-.5],[-.6,.5]]) b.box(.06,1.15,.06,x,1.7,z,blk); b.box(1.25,.06,1.1,0,2.28,0,blk);
      for(const z of [-.32,.32]) b.box(.1,2.4,.1,.95,1.3,z,blk);
      wheels(b,[[.6,-.5],[.6,.5],[-.6,-.5],[-.6,.5]],.3,.22);
      driver(b,-.25,1.25,0,0x1b2a44,0x151515);
      const fk=new THREE.Group(), fb=Bag(); fb.box(.05,.55,.95,1.03,.45,0,steel); for(const z of [-.3,.3]) fb.box(1.1,.05,.12,1.6,.2,z,steel); fb.meshes(fk); g.add(fk); g.userData.fk=fk; });
    const AN={G,gl,car:{g:strada,park:[W/2+3.2,13.5,Math.PI],st:'idle',wait:25+Math.random()*30,i:0,
      path:[[W/2+9.5,13.5,1],[W/2+9.5,fz+8],[W/2-2,fz+16],[-22,fz+16],[-27,fz+24],[-10,fz+27.5],[20,fz+26],[W/2+9.5,fz+12],[W/2+9.5,13.5],[W/2+3.2,13.5]],sp:4.5},
      fork:{g:fork,park:[doorX-2.5,fz+1.6,Math.PI/2],st:'idle',wait:3,i:0,path:[[doorX-2.5,fz+4.5],[doorX+5.5,fz+5],[doorX+7.6,fz+4.6],[doorX+3,fz+5.2,1],[doorX-2.5,fz+4.5],[doorX-2.5,fz+1.6,1]],sp:2},
      };
    adaSet(AN); for(const v of [AN.car,AN.fork]){ const [x,z,h]=v.park; v.x=x; v.z=z; v.h=h; v.g.position.set(x,gl(x,z),z); v.g.rotation.y=-h; }
    hookAda();
    B.meshes(G).forEach(m=>osmHitoMs.push(m));
    // letras ADA y el logo
    { const lm=new THREE.MeshLambertMaterial({map:lettersTex(),transparent:true,depthWrite:false}); const m=new THREE.Mesh(new THREE.PlaneGeometry(17,8.5),lm); m.position.set(-9,8.2,fz+.2); G.add(m);
      for(const [sd,z,y] of [[1,fz-11,8],[-1,fz-19,8.4]]){ const m2=new THREE.Mesh(new THREE.PlaneGeometry(13,6.5),lm); m2.position.set(sd*(W/2+.2),y,z); m2.rotation.y=sd*Math.PI/2; G.add(m2); } }   // también en los dos costados (fotos 4 y 19)
    G.updateMatrixWorld(true);
    // choque: la nave y las columnas de la playa; las casas de relleno que caen adentro se achican
    clearOut((x,z,r)=>{ const dx=x-cx, dz=z-cz, lx=dx*c-dz*s, lz=dx*s+dz*c; return (lx>-W/2-48-r*.3&&lx<W/2+32+r*.3&&lz>-Dp/2-48-r*.3&&lz<fz+yd+r*.3)||(lx>-50&&lx<40&&lz>95&&lz<150); });
    block(cx,cz,W,Dp,th,.35);                                                               // bloque bajo escondido (uno alto se dibujaría como edificio)
    { const lb=(x0,x1,z0,z1)=>{ const [X,Z]=at((x0+x1)/2,(z0+z1)/2); block(X,Z,x1-x0,z1-z0,th,.35); };   // oficinas, nave baja, garita, tanque, grupo y pilas de pallets
      lb(oX0,oX1,oZ0,oZ1); lb(tX0,tX1,tZ0,tZ1); lb(vX0,vX1,vZ0,vZ1); lb(W/2+.6,W/2+2.9,fz-.9,fz+1.5); lb(-W/2-4.9,-W/2-1.3,-Dp/2-3.2,-Dp/2+.4); lb(-W/2-1.9,-W/2-.3,-Dp/2+1.6,-Dp/2+5.2);
      lb(W/2+.6,W/2+6.8,-Dp/2-13.5,-3.7); }
    W2set(cx,cz,th,at,fz,yd); }
  // cartel bajo con el logo: dos postes
  function B2post(G,x,z,m,b=0){ for(const dx of [-1.8,1.8]){ const p=new THREE.Mesh(new THREE.BoxGeometry(.12,2.4,.12),m); p.position.set(x+dx,b+1.2,z-.08); G.add(p); osmHitoMs.push(p); } }
  function W2set(cx,cz,th,at,fz,yd){ const [fx,fzz]=at(-18,fz+yd*.55); W._ada={x:cx,z:cz,th,front:{x:fx,z:fzz}}; }
  // un paso de los vehículos que se mueven (Strada y autoelevador): siguen su recorrido, giran hacia donde van (o marcha atrás) y esperan entre vuelta y vuelta
  function stepV(v,dt,gl,onEnd){
    if(v.st==='idle'){ v.wait-=dt; if(v.wait<=0){ v.st='go'; v.i=0; } return; }
    const P=v.path[v.i], dx=P[0]-v.x, dz=P[1]-v.z, d=Math.hypot(dx,dz), rev=!!P[2];
    if(d<.25){ v.i++; if(v.i>=v.path.length){ v.st='idle'; onEnd(v); } return; }
    const want=Math.atan2(dz,dx)+(rev?Math.PI:0); let dh=want-v.h; dh=Math.atan2(Math.sin(dh),Math.cos(dh)); v.h+=dh*Math.min(1,dt*3);
    const k=Math.max(.25,Math.cos(dh)), st=Math.min(d,v.sp*k*dt); v.x+=dx/d*st; v.z+=dz/d*st;
    v.g.position.set(v.x,gl(v.x,v.z),v.z); v.g.rotation.y=-v.h; }
  function adaTick(dt){ const A=W&&W._adaAnim; if(!A||!A.G.parent) return; if(!['play','deploy','spectate','end','brief'].includes(state)) return; dt=Math.min(dt,.1);
    stepV(A.car,dt,A.gl,v=>{ v.wait=60+Math.random()*60; v.h=v.park[2]; v.g.rotation.y=-v.h; });
    const F=A.fork; stepV(F,dt,A.gl,v=>{ v.wait=5+Math.random()*6; });
    const fk=F.g.userData.fk; if(fk){ const up=F.st==='go'&&F.i>=3&&F.i<=4?.9:0; fk.position.y+=(up-fk.position.y)*Math.min(1,dt*1.5); } }
  function adaSet(a){ W._adaAnim=a; }
  let hooked=false;
  function hookAda(){ if(hooked||typeof frame!=='function') return; hooked=true; const _f=frame; frame=function(dt){ const r=_f.apply(this,arguments); try{ adaTick(dt); }catch(e){} return r; }; }
  window.osmADA=osmADA;
  window.adaInfo=()=>W&&W._ada;
})();
