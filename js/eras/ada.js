/* ---------- Galpón de ADA Logística en el mapa "Ruta 12, aeropuerto" (27/11/2026, pedido de Sebastián: trabaja ahí) ----------
   Hecho por código con la vista satelital de Google Maps ("Galpón ADA", Ruta 12 km 1036) y una foto del frente que pasó Sebastián:
   · Nave de chapa acanalada azul de ~65 × 40 m y ~11 m de alto, techo claro a dos aguas muy bajo, girada ~4,6° (sigue el loteo).
   · Frente al sur, sobre el patio de hormigón: letras blancas "ADA" grandes arriba con "Logística Regional del Nea" en rojo, ventanas altas
     enmarcadas, faroles de brazo, portón grande abierto (adentro oscuro, estanterías y un autoelevador amarillo), portones corredizos,
     dos paños bajos de bloques de hormigón gris con puerta y defensas amarillas y negras.
   · Al costado (sudeste del patio) la playa con techos de chapa sobre columnas, con pilas de pallets de madera abajo y el logo en el borde.
   · Cubiertas apiladas, tambores rojos y estantería azul junto al frente, como en la foto.
   Las paredes chocan con bloques indestructibles escondidos (block) y las casas de relleno que caían en la huella se achican (clearOut).
   El logo es el de camion.js (window.adaTex). */
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
    // --- al costado: playa con techos de chapa sobre columnas, pallets de madera abajo y el logo ---
    const pX0=14, pX1=W/2+8, pZ0=fz+9, pZ1=fz+21, pH=5.2, pw=pX1-pX0, pd=pZ1-pZ0, pcx=(pX0+pX1)/2, pcz=(pZ0+pZ1)/2;
    let pb=0; for(const x of [pX0,pX1]) for(const z of [pZ0,pZ1]) pb=Math.max(pb,gl(x,z)); const pT=pb+pH;   // techo parejo sobre el punto más alto
    for(let k=0;k<=4;k++){ const x=pX0+k*pw/4; for(const z of [pZ0,pZ1]){ const b=gl(x,z)-.2; B.box(.25,pT-b,.25,x,(pT+b)/2,z,steel); } B.box(.18,.35,pd,x,pT-.1,pcz,steel); }
    { const g=new THREE.BoxGeometry(pw+1.2,.12,pd+1.6); g.rotateX(-.06); g.translate(pcx,pT+.25,pcz); B.add(g,roofP); }
    B.box(pw+1.2,.9,.1,pcx,pT-.15,pZ1+.85,white);                                                // borde del techo donde va el logo
    // pilas de pallets (cada uno 1,2 × 1 × 0,15 m: tablas y tacos)
    const pallet=(x,y,z,ry)=>{ y+=gl(x,z); for(let t=0;t<5;t++) B.box(1.2,.03,.14,x+(ry?0:0),y+.135,z-.43+t*.215,wood,ry); for(const tz of [-.4,0,.4]) B.box(1.2,.1,.12,x,y+.065,z+tz,woodD,ry); B.box(1.2,.02,.12,x,y+.01,z,wood,ry); };
    let pi=0; for(let ix=0;ix<6;ix++) for(let iz=0;iz<4;iz++){ const n=3+((ix*7+iz*3)%8), x=pX0+2+ix*(pw-4)/5, z=pZ0+1.6+iz*2.8; for(let k=0;k<n;k++) pallet(x,k*.15,z,0); pi+=n; }
    // dos pilas sueltas junto al portón (las de la foto) y un auto-elevador manual
    for(let k=0;k<6;k++) pallet(doorX+doorW/2+3,k*.15,fz+3,0); for(let k=0;k<2;k++) pallet(doorX-doorW/2-2.5,k*.15,fz+2.5,0);
    // columnas de luz del patio
    for(const lx of [-20,0,20]){ { const b=gl(lx,fz+yd-3); B.cyl(.12,.16,10+b,lx,(10+b)/2,fz+yd-3,steel,6); B.box(1.4,.2,.5,lx,10+b,fz+yd-3,steel); } }
    B.meshes(G).forEach(m=>osmHitoMs.push(m));
    // letras ADA y el logo
    { const m=new THREE.Mesh(new THREE.PlaneGeometry(17,8.5),new THREE.MeshLambertMaterial({map:lettersTex(),transparent:true,depthWrite:false})); m.position.set(-9,8.2,fz+.2); G.add(m); }
    const adaM=window.adaTex&&window.adaTex();
    if(adaM){ const m=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.9),adaM); m.position.set(pcx,pT-.15,pZ1+.92); G.add(m);
      for(const sd of [-1,1]){ const m2=new THREE.Mesh(new THREE.PlaneGeometry(5,2.5),adaM); m2.position.set(sd*(W/2+.05),7.5,8); m2.rotation.y=sd*Math.PI/2; G.add(m2); }   // costados de la nave
      { const m3=new THREE.Mesh(new THREE.PlaneGeometry(4,2),adaM); m3.position.set(pcx,gl(pcx,pZ1)+1.3,pZ1+.35); G.add(m3); B2post(G,pcx,pZ1+.3,steel,gl(pcx,pZ1)); } }
    G.updateMatrixWorld(true);
    // choque: la nave y las columnas de la playa; las casas de relleno que caen adentro se achican
    clearOut((x,z,r)=>{ const dx=x-cx, dz=z-cz, lx=dx*c-dz*s, lz=dx*s+dz*c; return Math.abs(lx)<W/2+10+r*.3&&lz>-Dp/2-8-r*.3&&lz<fz+yd+r*.3; });
    block(cx,cz,W,Dp,th,.35);                                                               // bloque bajo escondido (uno alto se dibujaría como edificio)
    W2set(cx,cz,th,at,fz,yd); }
  // cartel bajo con el logo: dos postes
  function B2post(G,x,z,m,b=0){ for(const dx of [-1.8,1.8]){ const p=new THREE.Mesh(new THREE.BoxGeometry(.12,2.4,.12),m); p.position.set(x+dx,b+1.2,z-.08); G.add(p); osmHitoMs.push(p); } }
  function W2set(cx,cz,th,at,fz,yd){ const [fx,fzz]=at(-18,fz+yd*.55); W._ada={x:cx,z:cz,th,front:{x:fx,z:fzz}}; }
  window.osmADA=osmADA;
  window.adaInfo=()=>W&&W._ada;
})();
