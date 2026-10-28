/* ---------- Tanques y modelos ---------- */
const tanks=[]; let colliders=[];
const darkMat=new THREE.MeshStandardMaterial({color:0x2b2a26,roughness:.55,metalness:.45}), trackMat=new THREE.MeshStandardMaterial({color:0x2a2825,roughness:.8,metalness:.35});
const headMat=new THREE.MeshStandardMaterial({color:0xd8d2b8,emissive:0x2a2618,roughness:.3,metalness:.2}), antGeo=new THREE.CylinderGeometry(.012,.02,2.3,4);
const scorchGeo=new THREE.CircleGeometry(1,12), scorchMat=new THREE.MeshBasicMaterial({color:0x14110e,transparent:true,opacity:.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});
const groundScorch=new THREE.MeshBasicMaterial({color:0x1a1612,transparent:true,opacity:.7,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});
const camoTex={}, mudTex={};
// Pintura del tanque: manchas (por defecto), rayas (tigre) o pixelado (digital), con desgaste
function camoPaint(c,mode){ return (x,s)=>{x.fillStyle=c[0];x.fillRect(0,0,s,s);
    if(mode==='stripes'){ x.fillStyle=c[1]; for(let i=0;i<14;i++){ const y=Math.random()*s; x.save(); x.translate(0,y); x.rotate(rand(-.5,.5)); x.fillRect(-20,0,s+40,rand(8,22)); x.restore(); } x.fillStyle=c[2]; for(let i=0;i<8;i++){ const y=Math.random()*s; x.save(); x.translate(0,y); x.rotate(rand(-.4,.4)); x.fillRect(-20,0,s+40,rand(5,12)); x.restore(); } }
    else if(mode==='pixel'){ const q=16; for(let yy=0;yy<s;yy+=q) for(let xx=0;xx<s;xx+=q){ const r=Math.random(); if(r<.33){ x.fillStyle=c[1]; x.fillRect(xx,yy,q,q); } else if(r<.5){ x.fillStyle=c[2]; x.fillRect(xx,yy,q,q); } } }
    else for(let i=0;i<22;i++){x.fillStyle=i%3===2?c[2]:c[1];x.beginPath();const cx=Math.random()*s,cy=Math.random()*s;
      for(let j=0;j<9;j++){const a=j/9*Math.PI*2,r=rand(30,90);x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r*.6);}x.fill();}
    for(let i=0;i<60;i++){const g=x.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'rgba(150,130,100,.18)');g.addColorStop(1,'rgba(150,130,100,0)');
      x.save();x.translate(Math.random()*s,Math.random()*s);x.scale(rand(20,70),rand(10,40));x.fillStyle=g;x.beginPath();x.arc(0,0,1,0,7);x.fill();x.restore();}
    speckle(x,s,s,2600,['#000000','#ffffff','#3a3428'],1,2.5);
    x.globalAlpha=.35;x.strokeStyle='#d8d0bc';x.lineWidth=1;for(let i=0;i<70;i++){const X=Math.random()*s,Y=Math.random()*s,a=rand(0,6.28),l=rand(4,22);x.beginPath();x.moveTo(X,Y);x.lineTo(X+Math.cos(a)*l,Y+Math.sin(a)*l);x.stroke();}
    x.globalAlpha=.55;x.fillStyle='#2a2620';for(let i=0;i<40;i++){const r=rand(1.5,4);x.fillRect(Math.random()*s,Math.random()*s,r,r*rand(.6,1.4));}
    x.globalAlpha=.18;for(let i=0;i<10;i++){const X=Math.random()*s,Y=Math.random()*s,g=x.createLinearGradient(X,Y,X,Y+rand(30,80));g.addColorStop(0,'#1e1a14');g.addColorStop(1,'rgba(30,26,20,0)');x.fillStyle=g;x.fillRect(X,Y,rand(2,5),80);}
    x.globalAlpha=1; }; }
const mudPaint=camo=>(x,s)=>{camo(x,s); for(let i=0;i<140;i++){x.globalAlpha=rand(.15,.5);x.fillStyle=Math.random()<.5?'#5b4a34':'#7a6448';x.beginPath();x.ellipse(Math.random()*s,Math.random()*s,rand(6,34),rand(4,18),rand(0,3),0,7);x.fill();}
    speckle(x,s,s,4000,['#4a3c2a','#8a7558'],1,3); x.globalAlpha=1;};
for(const k in NATIONS){ const camo=camoPaint(NATIONS[k].camo); camoTex[k]=canvasTex(512,camo); mudTex[k]=canvasTex(512,mudPaint(camo)); }
const CAMOS={base:{n:'Estándar de la nación',cost:0},desierto:{n:'Desierto',cols:['#c2a878','#a88a5c','#7a6a4a'],cost:2},invierno:{n:'Invierno',cols:['#e2e4e0','#b4b8b4','#6a6e6a'],cost:3},
  urbano:{n:'Urbano',cols:['#8a8c8e','#5a5c5e','#2e3032'],cost:3},tarague:{n:'Selva Taragüí',cols:['#3e5a2a','#6b7a3a','#2a3a1e'],cost:4},
  tigre:{n:'Tigre',cols:['#8a7a42','#2a2a1e','#4a4a2e'],mode:'stripes',cost:5},digital:{n:'Digital',cols:['#5e6a4a','#3a4430','#8a8a6a'],mode:'pixel',cost:6},dorado:{n:'Ceremonial dorado',cols:['#b8962e','#8a6a1e','#e0c060'],cost:10}};
const _camoC={};
function camoFor(nat,cid){ if(!cid||cid==='base'||!CAMOS[cid]) return [camoTex[nat],mudTex[nat]]; if(!_camoC[cid]){ const C=CAMOS[cid], f=camoPaint(C.cols,C.mode); _camoC[cid]=[canvasTex(512,f),canvasTex(512,mudPaint(f))]; } return _camoC[cid]; }
const _rbCache=new Map();
function rboxGeo(w,h,d,r){ const key=[w,h,d,r].map(v=>v.toFixed(3)).join(); let g=_rbCache.get(key); if(g) return g;
  r=Math.min(r,w/2-.01,h/2-.01,d/2-.01); const sh=new THREE.Shape(), x0=-w/2+r, x1=w/2-r, y0=-h/2+r, y1=h/2-r;
  sh.moveTo(x0,-h/2); sh.lineTo(x1,-h/2); sh.absarc(x1,y0,r,-Math.PI/2,0); sh.lineTo(w/2,y1); sh.absarc(x1,y1,r,0,Math.PI/2); sh.lineTo(x0,h/2); sh.absarc(x0,y1,r,Math.PI/2,Math.PI); sh.lineTo(-w/2,y0); sh.absarc(x0,y0,r,Math.PI,Math.PI*1.5);
  g=new THREE.ExtrudeGeometry(sh,{depth:Math.max(.01,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:0,bevelSegments:2,curveSegments:3});
  g.translate(0,0,-(d-2*r)/2); const uv=g.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*.28,uv.getY(i)*.28); g.computeVertexNormals(); _rbCache.set(key,g); return g; }
function rbox(parent,w,h,d,x,y,z,m,r=.08){const b=new THREE.Mesh(rboxGeo(w,h,d,r),m);b.position.set(x,y,z);b.castShadow=true;b.receiveShadow=true;parent.add(b);return b;}
function box(parent,w,h,d,x,y,z,m){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);b.castShadow=true;b.receiveShadow=true;parent.add(b);return b;}
function cyl(parent,rt,rb,h,x,y,z,seg,m){const c=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),m);c.position.set(x,y,z);c.castShadow=true;parent.add(c);return c;}
let _wl=null; // lista de ruedas del tanque que se está armando (para hacerlas girar)
function wheel(parent,x,y,z,r){const w=cyl(parent,r,r,.28,x,y,z,14,trackMat);w.rotation.order='ZYX';w.rotation.z=Math.PI/2;
  const hub=new THREE.Mesh(hubGeo,darkMat); hub.scale.set(r*1.5,1,r*.28); w.add(hub); if(_wl) _wl.push({w,r}); return w;}
const hubGeo=new THREE.BoxGeometry(1,.3,1);
// Textura de eslabones de oruga (se desplaza con la velocidad)
const linkCanvas=(()=>{const c=document.createElement('canvas');c.width=64;c.height=16;const x=c.getContext('2d');
  x.fillStyle='#1d1c1a';x.fillRect(0,0,64,16); for(let i=0;i<4;i++){x.fillStyle='#3a3833';x.fillRect(i*16+2,1,11,14);x.fillStyle='#4c4942';x.fillRect(i*16+5,3,5,10);x.fillStyle='#111';x.fillRect(i*16+14,0,2,16);} return c;})();
function trackMats(len){
  const mk=rot=>{const tx=new THREE.CanvasTexture(linkCanvas); tx.wrapS=tx.wrapT=THREE.RepeatWrapping; tx.anisotropy=2;
    if(rot){tx.center.set(.5,.5);tx.rotation=Math.PI/2;} tx.repeat.set(len*.42,1); return new THREE.MeshStandardMaterial({map:tx,roughness:.85,metalness:.4});};
  const sideP=mk(false), sideN=mk(false), top=mk(true); return {list:[sideP,sideN,top,top,trackMat,trackMat],sideP,sideN,top,mats:[sideP,sideN,top]};
}
const _tankG=new Map(); function tankG(k,f){ let g=_tankG.get(k); if(!g){ g=f(); _tankG.set(k,g); } return g; }
function facetTurret(tur,M,mat,lk,z0){ const w=M.tw/2, l=M.tl*lk/2, key='ft'+[w,l,M.th].map(v=>v.toFixed(2)).join();
  const g=tankG(key,()=>{ const sh=new THREE.Shape(), P=[[-w*.62,l],[w*.62,l],[w,l*.25],[w*.96,-l],[-w*.96,-l],[-w,l*.25]]; P.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z)); sh.lineTo(P[0][0],-P[0][1]);
    const ge=new THREE.ExtrudeGeometry(sh,{depth:M.th-.14,bevelEnabled:true,bevelThickness:.07,bevelSize:.07,bevelSegments:2}); ge.rotateX(-Math.PI/2); ge.translate(0,.07,0); return ge; });
  const m=new THREE.Mesh(g,mat); m.position.z=z0; m.castShadow=m.receiveShadow=true; tur.add(m); return m; }
function buildModel(t,M,mat){
  if(M.ww1) return buildWW1(t,M,mat);
  const root=t.root, th=M.wr*2+.25, W2=M.W/2;
  if(M.wheeled) for(const s of [-1,1]){ for(let i=0;i<M.wheels;i++){const z=-M.L*.32+i*(M.L*.64/(M.wheels-1)); wheel(root,s*(W2-.15),M.wr,z,M.wr);} box(root,.15,.08,M.L*.9,s*(W2-.05),M.wr*2+.05,0,mat); }
  else for(const s of [-1,1]){
    if(!t.trk) t.trk=trackMats(M.L+.2);
    box(root,.6,th,M.L+.2-th*.9,s*(W2-.3),th/2,0,t.trk.list);
    for(const ez of [-1,1]){ const e=new THREE.Mesh(tankG('trkEnd',()=>{ const g=new THREE.CylinderGeometry(1,1,1,14,1,false,0,Math.PI); g.rotateZ(Math.PI/2); return g; }),trackMat); e.scale.set(.6,th/2,th/2*1.05); e.rotation.x=ez>0?0:Math.PI; e.position.set(s*(W2-.3),th/2,ez*(M.L+.2-th*.9)/2); e.castShadow=true; root.add(e); }
    if(!M.wheeled&&M.wheels>=5) for(let i=0;i<3;i++) wheel(root,s*(W2-.05),th-.12,-M.L*.3+i*M.L*.3,.1);
    if(M.bogie){ for(let i=0;i<3;i++){const z=-M.L*.3+i*M.L*.3; box(root,.25,.5,1.1,s*(W2+.06),M.wr+.2,z,darkMat);
      for(const dz of [-.33,.33]) wheel(root,s*(W2+.12),M.wr,z+dz,M.wr);} }
    else for(let i=0;i<M.wheels;i++){const z=-M.L*.38+i*(M.L*.76/(M.wheels-1)); wheel(root,s*(W2+.02),M.wr,z,M.wr);}
    wheel(root,s*(W2+.02),th*.62,M.L/2-.15,M.wr*.75); wheel(root,s*(W2+.02),th*.62,-M.L/2+.15,M.wr*.75);
    if(M.skirts) rbox(root,.08,th*.72,M.L*.9,s*(W2+.2),th*.6,0,t.mud,.03);
    if(M.skirtsShort) rbox(root,.08,th*.35,M.L*.85,s*(W2+.18),th*.8,0,t.mud,.03);
    box(root,.72,.06,M.L+.25,s*(W2-.3),th+.03,0,mat);
  }
  const hullY=th*.55, hTop=hullY+M.H;
  const col=box(root,M.W,M.H,M.L,0,hullY+M.H/2,0,mat); col.visible=false; col.userData={tank:t,zone:'hull'}; colliders.push(col);
  rbox(root,M.W-1.25,M.H*.65,M.L*.95,0,hullY+M.H*.33,0,t.mud,.08);
  const glL=M.longGlacis?M.L*.42:M.L*.18, upL=M.L-glL;
  { const hw=(M.W-.1)/2, h2=M.H*.25, g=tankG('hullUp'+[hw,h2,upL].map(v=>v.toFixed(2)).join(),()=>{ const sh=new THREE.Shape(); sh.moveTo(-hw,-h2); sh.lineTo(hw,-h2); sh.lineTo(hw,h2*.15); sh.lineTo(hw-.3,h2); sh.lineTo(-hw+.3,h2); sh.lineTo(-hw,h2*.15); sh.lineTo(-hw,-h2);
      const ge=new THREE.ExtrudeGeometry(sh,{depth:upL-.12,bevelEnabled:true,bevelThickness:.06,bevelSize:.05,bevelSegments:1}); ge.translate(0,0,-(upL-.12)/2); return ge; });
    const hu=new THREE.Mesh(g,mat); hu.position.set(0,hTop-M.H*.25,-glL/2); hu.castShadow=hu.receiveShadow=true; root.add(hu); }
  for(const sx of [-1,1]){ box(root,.1,.08,M.L+.1,sx*(W2-.02),th+.1,0,mat); box(root,.5,.28,.9,sx*(W2-.5),hTop+.14,-M.L*.36,mat); }
  const drop=M.H*.75, plen=Math.hypot(glL,drop), gl=box(root,M.W-.15,.12,plen,0,hTop-drop/2,M.L/2-glL/2,mat);
  gl.rotation.x=Math.atan2(drop,glL);
  box(root,M.W-.6,.06,M.L*.28,0,hTop+.03,-M.L*.33,darkMat);
  box(root,.5,.12,.5,-M.W*.25,hTop+.06,upL/2-glL/2-.5,mat);
  const tur=new THREE.Group(); tur.position.set(0,hTop,M.tz); root.add(tur); t.turret=tur;
  const tc=box(tur,M.tw,M.th,M.tl,0,M.th/2,0,mat); tc.visible=false; tc.userData={tank:t,zone:'turret'}; colliders.push(tc);
  let gy=M.th*.5, gz=M.tl/2, cupY=M.th;
  if(M.tur==='round'){
    const c=cyl(tur,M.tw/2*.92,M.tw/2,M.th,0,M.th/2,0,16,mat); c.scale.z=M.tl/M.tw;
    rbox(tur,.95,.6,.35,0,gy,gz-.05,mat,.08);
  } else if(M.tur==='amx'){
    cyl(tur,M.tw*.62,M.tw*.66,.38,0,.19,0,14,mat);
    const uh=M.th-.38; rbox(tur,M.tw,uh,M.tl*.8,0,.38+uh/2,.1,mat,.14); rbox(tur,M.tw*.85,uh*.8,1.0,0,.38+uh*.45,-M.tl*.4-.3,mat,.1);
    gy=.38+uh*.5; gz=M.tl*.5; cupY=M.th;
  } else if(M.tur==='facet'){
    const c=cyl(tur,1,1.08,M.th,0,M.th/2,0,8,mat); c.scale.set(M.tw/2,1,M.tl/2); c.rotation.y=Math.PI/8;
    if(M.bustle) rbox(tur,M.tw*.8,M.th*.7,1.1,0,M.th*.45,-M.tl/2-.4,mat,.1);
    box(tur,.25,.25,.5,M.tw*.45,M.th*.6,M.tl*.15,darkMat); box(tur,.25,.25,.5,-M.tw*.45,M.th*.6,M.tl*.15,darkMat);
  } else if(M.tur==='wedge'){
    facetTurret(tur,M,mat,.7,-M.tl*.15);
    const fp=box(tur,M.tw*.95,.12,M.tl*.42,0,M.th*.72,M.tl*.3,mat); fp.rotation.x=.35;
    rbox(tur,M.tw*.9,M.th*.55,M.tl*.3,0,M.th*.3,M.tl*.32,mat,.08);
  } else if(M.tur==='big'){
    facetTurret(tur,M,mat,1,0);
    rbox(tur,M.tw*.9,M.th*.8,1.0,0,M.th*.45,-M.tl/2-.45,mat,.1);
    rbox(tur,1.4,.75,1.4,0,M.th+.37,-M.tl/2+.9,mat,.1); cupY=M.th+.75;
    box(tur,.8,.2,.25,0,M.th+.5,-M.tl/2+1.65,darkMat);
  } else if(M.tur==='dome'){
    const dm=new THREE.Mesh(new THREE.SphereGeometry(1,18,9,0,Math.PI*2,0,Math.PI/2),mat); dm.scale.set(M.tw/2,M.th*1.15,M.tl/2); dm.castShadow=true; tur.add(dm);
    gy=M.th*.4; gz=M.tl/2*.88; cupY=M.th*1.05;
  }
  if(M.tur!=='big') cyl(tur,.36,.4,.36,-M.tw*.22,cupY+.18,-M.tl*.15,10,mat);
  box(tur,.06,.06,.9,M.tw*.22,cupY+.15,-M.tl*.1,darkMat);
  const gp=new THREE.Group(); gp.position.set(0,gy,gz); tur.add(gp); t.gunPivot=gp;
  { const mt=new THREE.Mesh(tankG('mant',()=>{ const g=new THREE.CylinderGeometry(.5,.5,1,12,1,false,-Math.PI/2,Math.PI); g.rotateZ(Math.PI/2); return g; }),mat); mt.scale.set(M.tur==='amx'?.7:1.0,.6,.9); mt.position.set(0,0,.2); mt.rotation.y=0; mt.castShadow=true; gp.add(mt); rbox(gp,M.tur==='amx'?.7:1.0,.6,.3,0,0,.08,mat,.07); }
  if(M.tur!=='dome') for(const sx of [-1,1]) for(let i=0;i<3;i++){ const c=cyl(tur,.07,.07,.32,sx*(M.tw/2+.02),M.th*.62+i*.11,M.tl*.18,6,darkMat); c.rotation.x=-1.0; c.rotation.z=sx*.35; }
  if(M.tur!=='dome'&&M.tur!=='round') box(tur,M.tw*.8,M.th*.5,.5,0,M.th*.4,-(M.tur==='big'?M.tl/2+.95:M.tl/2+.25),mat);
  const barrel=new THREE.Group(); gp.add(barrel); t.barrel=barrel;
  const bm=cyl(barrel,M.gr*.9,M.gr*1.1,M.gl,0,0,M.gl/2+.35,10,darkMat); bm.rotation.x=Math.PI/2;
  for(const f of [.28,.52]){ const sl=cyl(bm,M.gr*1.35,M.gr*1.35,M.gl*.18,0,(f-.5)*M.gl,0,10,mat); sl.castShadow=true; }
  if(M.evac){const e=cyl(barrel,M.gr*1.8,M.gr*1.8,.75,0,0,.35+M.gl*(M.evacEnd?.88:.62),10,darkMat);e.rotation.x=Math.PI/2;}
  if(M.brake) box(barrel,M.gr*3.4,M.gr*2.6,.55,0,0,M.gl+.35,darkMat);
  const muzzle=new THREE.Object3D(); muzzle.position.z=M.gl+.7; barrel.add(muzzle); t.muzzle=muzzle; t.barrelMesh=bm;
  { const br=Math.max(.14,M.gr*1.7), bc=new THREE.Mesh(new THREE.CylinderGeometry(br,br,M.gl*.92,6),darkMat); bc.rotation.x=Math.PI/2; bc.position.z=M.gl*.54+.35; bc.visible=false; bc.userData={tank:t,zone:'barrel'}; barrel.add(bc); colliders.push(bc); }
  box(gp,.07,.07,.4,.42,.05,.45,darkMat);
  const coax=new THREE.Object3D(); coax.position.set(.42,.05,.7); gp.add(coax); t.coax=coax;
  // Detalle: escapes, faros, cable de remolque, eslabones de repuesto, periscopios, escotilla y antena
  for(const sx of [-1,1]){ const ex=cyl(root,.11,.13,.5,sx*M.W*.3,hTop-.05,-M.L/2-.05,8,darkMat); ex.rotation.x=Math.PI/2; }
  for(const sx of [-1,1]){ const hl=box(root,.22,.18,.12,sx*(M.W/2-.35),hTop+.02,M.L/2-glL+.1,headMat); hl.castShadow=false; }
  for(const sx of [-1,1]) box(root,.05,.05,M.L*.7,sx*(M.W/2-.02),hTop-.15,-M.L*.05,darkMat);
  if(!M.wheeled) for(let i=0;i<3;i++){ const sp=box(root,M.W*.18,.07,.32,(i-1)*M.W*.2,hTop-drop*.45+.08,M.L/2-glL*.55,trackMat); sp.rotation.x=gl.rotation.x; }
  for(let i=0;i<4;i++){ const a=i/4*Math.PI*2+.4, cx=(M.tur==='big'?0:-M.tw*.22)+Math.sin(a)*.38, cz=(M.tur==='big'?-M.tl/2+.9:-M.tl*.15)+Math.cos(a)*.38;
    box(tur,.1,.12,.08,cx,cupY+(M.tur==='big'?.8:.3),cz,darkMat).rotation.y=a; }
  { const hz=M.tur==='big'?-M.tl/2+.9:-M.tl*.15, hx=M.tur==='big'?0:-M.tw*.22, ht=box(tur,.62,.06,.62,hx,cupY+(M.tur==='big'?.78:.4),hz-.45,mat); ht.rotation.x=-1.2; }
  const ant=new THREE.Group(); ant.position.set(M.tw*.36,M.tur==='dome'?M.th*.9:M.th,-M.tl*.38); tur.add(ant);
  const aw=new THREE.Mesh(antGeo,darkMat); aw.position.y=1.15; ant.add(aw); t.ant=ant;
  t.hTop=hTop; t.topH=hTop+cupY+.4; t.aimH=hullY+M.H*.8; t.glL=glL;
}
function makeTank(crew,key,x,z,heading,id){
  const T=VEH[key], M=T.m;
  const nat=(crew&&crew.nation)||T.nation;
  const cid=crew&&crew.isPlayer?(PROG&&PROG.camo&&PROG.camo[key]):(crew&&crew.cams&&crew.cams[key]), CT=(T.camo&&(!cid||cid==='base'))?vehCamo(key):camoFor(nat,cid);
  const mat=new THREE.MeshStandardMaterial({map:CT[0],roughness:.78,metalness:.18});
  const mud=new THREE.MeshStandardMaterial({map:CT[1],roughness:.95,metalness:.05});
  const root=new THREE.Group(); tankDetail(mat,root.position,W.dust); tankDetail(mud,root.position,W.dust);
  const t={crew,key,team:crew.team,name:crew.name,isPlayer:crew.isPlayer,T,mat,hp:T.hp,dead:false,deadT:0,heading,speed:0,turretYaw:0,gunPitch:0,
    pitch:0,roll:0,reloadT:0,reloadMax:T.reload*(crew.isPlayer?1:rand(1.1,1.3)),recoil:0,smokeT:0,R:Math.max(2.2,M.L*.4),cr:M.W/2+.1,co:Math.max(0,M.L/2-M.W/2-.1),
    target:null,thinkT:0,goal:null,path:null,stuckT:0,revT:0,errScale:1,prefRange:rand(110,180),angleOff:rand(.3,.5)*(Math.random()<.5?-1:1),
    eY:rand(-1,1)*.035,eP:rand(-1,1)*.01,visP:false,immuneT:IMMUNE,spottedT:0,mgHeat:0,mgLock:false,mgNext:0,mgN:0,mgBurst:0,moved:5};
  const seats=T.seats?T.seats.slice():T.crew===3?['driver','gunner','commander']:T.crew===5?['driver','gunner','commander','loader','codriver']:['driver','gunner','commander','loader'];
  t.crewM=seats.map(st=>({seat:st,hp:100,alive:true})); t.mod={engine:100,breech:100,trans:100,barrel:100}; t.trkHP=[100,100]; t.ext=2; t.trackT=0; t.engT=0; t.breechT=0; t.fireT=0; t.swapT=0;
  t.ammoIdx=0; t.thermal=false; t.troops=T.troops||0; t.id=id||++net.seq; t.mgCount=0; t.cid=cid&&CAMOS[cid]?cid:'base';
  applyLevel(t,crew&&crew.isPlayer?tankLv(key):crew&&crew.lvs?crew.lvs[key]||1:1);
  if(!crew.isPlayer){ t.sk=clamp((crew.team===1||net.quick?enemySkill():.55)+rand(-.07,.07),.15,1); t.reloadMax*=1.5-t.sk*.4; /* online: los bots de los dos bandos igual de hábiles */ t.eY*=1.6-t.sk; t.eP*=1.6-t.sk; t.smokeN=t.noSmk?0:t.sk>.8?2:t.sk>.45?1:0; t.mode='adv'; }
  if(crew&&crew.isPlayer) initAmmo(t);
  t.root=root; root.rotation.order='YXZ';
  t.wheels=_wl=[]; t.mud=mud; buildModel(t,M,mat); _wl=null; scene.add(root);
  t.pos=root.position; t.pos.set(x,heightAt(x,z),z);
  tanks.push(t); placeOnGround(t,1); return t;
}
const looseTrkMat=new THREE.MeshLambertMaterial({color:0x2a2825});
function tankFX(t,dt){
  mechSync(t);
  t.stillT=Math.abs(t.speed)<.5?(t.stillT||0)+dt:0;
  if(t.trackT>0&&!t.looseTrk&&!t.dead){ const M=t.T.m, side=Math.random()<.5?1:-1, c=Math.cos(t.heading), s=Math.sin(t.heading);
    const m=new THREE.Mesh(new THREE.BoxGeometry(.55,.12,M.L*.75),looseTrkMat); const x=t.pos.x+c*side*(M.W/2+.9)-s*M.L*.15, z=t.pos.z-s*side*(M.W/2+.9)-c*M.L*.15;
    m.position.set(x,heightAt(x,z)+.08,z); m.rotation.y=t.heading+rand(-.25,.25); scene.add(m); t.looseTrk=m; }
  else if((!(t.trackT>0)||t.dead)&&t.looseTrk&&!(t.dead&&t.deadT<30)){ scene.remove(t.looseTrk); t.looseTrk.geometry.dispose(); t.looseTrk=null; }
  if(net.guest&&t.fireT>0&&!t.dead){ t.fxF=(t.fxF||0)-dt; if(t.fxF<=0){ t.fxF=.35; puff(t.pos.clone().add(new THREE.Vector3(rand(-1,1),t.topH,rand(-1,1))),0xff7020,rand(2,3),.6,2,1,true); puff(t.pos.clone().setY(t.pos.y+t.topH+1),0x2a2622,rand(3,5),2,3,.6); } }
  if(t.ammoCount){ if(t.mgRel>0) t.mgRel=Math.max(0,t.mgRel-dt);
    const mine=t.team===0?1:-1, Z=zones.find(Z=>Z.owner===mine&&Math.hypot(Z.x-t.pos.x,Z.z-t.pos.z)<Z.r);
    const full=t.ammoCount.every((c,i)=>c>=t.ammoMax[i])&&t.mgBelts>=3&&t.mgBelt>=250;
    t.resupply=!!Z&&Math.abs(t.speed)<1&&!full;
    if(t.resupply){ t.rsT=(t.rsT||0)+dt; if(t.rsT>=1.1){ t.rsT=0; let j=-1,w=1; t.ammoCount.forEach((c,i)=>{const f=c/t.ammoMax[i]; if(f<w){w=f;j=i;}}); if(j>=0) t.ammoCount[j]++; }
      t.rsM=(t.rsM||0)+dt; if(t.rsM>=4){ t.rsM=0; if(t.mgBelt<250) t.mgBelt=250; else if(t.mgBelts<3) t.mgBelts++; } } else { t.rsT=0; t.rsM=0; } }
  const ds=t.speed*dt, near=t.pos.distanceToSquared(camera.position)<330*330;
  if(t.trk){ const k=ds*.42; // los eslabones de arriba avanzan respecto del casco
    t.trk.sideP.map.offset.x=(t.trk.sideP.map.offset.x+k)%1; t.trk.sideN.map.offset.x=(t.trk.sideN.map.offset.x-k)%1; t.trk.top.map.offset.x=(t.trk.top.map.offset.x+k)%1; }
  if(near) for(const w of t.wheels) w.w.rotation.y+=ds/w.r;
  if(!near) return;
  const fx=Math.sin(t.heading), fz=Math.cos(t.heading), v=Math.abs(t.speed), M=t.T.m;
  t.dustT=(t.dustT||0)-dt;
  if(v>2.5&&t.dustT<=0){ t.dustT=clamp(.32-v*.012,.1,.3);
    for(const sx of [-1,1]){ const q=t.pos.clone().add(new THREE.Vector3(fz*sx*M.W*.45-fx*M.L*.5,.4,-fx*sx*M.W*.45-fz*M.L*.5));
      puff(q,W.dust||0xb6a27f,rand(1.8,2.6)+v*.08,rand(1.2,1.8),.8,clamp(.16+v*.012,.16,.42)); } }
  // Humo del escape al acelerar
  t.exT=(t.exT||0)-dt; const thr=t.isPlayer?((down('fwd')||down('back'))?1:0):(v>1?1:0);
  if(thr&&t.exT<=0&&(t.sP||0)>.012){ t.exT=.12; puff(t.pos.clone().add(new THREE.Vector3(-fx*(M.L/2+.3),t.hTop+.2,-fz*(M.L/2+.3))),0x3a3836,rand(1,1.6),1.2,1.2,.45); }
  // Humo de motor dañado / poca vida
  if(t.hp<t.T.hp*.45||t.mod.engine<100){ t.dmgT=(t.dmgT||0)-dt; if(t.dmgT<=0){ t.dmgT=.35;
    puff(t.pos.clone().add(new THREE.Vector3(-fx*M.L*.32+rand(-.4,.4),t.hTop+.4,-fz*M.L*.32+rand(-.4,.4))),t.hp<t.T.hp*.25?0x2a2724:0x6b6660,rand(1.6,2.4),2.5,1.6,.5); } }
}
// Marcas de impacto en el blindaje y manchas quemadas en el suelo
function hitMark(hit,pen){
  const o=hit.object, par=o.parent; if(!par||!hit.face) return; const t=o.userData.tank; if(!t) return;
  t.marks=t.marks||[]; if(t.marks.length>=10){ const old=t.marks.shift(); old.parent&&old.parent.remove(old); }
  const m=new THREE.Mesh(scorchGeo,scorchMat); const r=pen?rand(.28,.38):rand(.16,.24); m.scale.setScalar(r);
  const n=hit.face.normal.clone(); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),n);
  m.position.copy(par.worldToLocal(hit.point.clone())).addScaledVector(n,.03); par.add(m); t.marks.push(m);
}
const scorches=[];
function groundMark(p,r){
  const m=new THREE.Mesh(scorchGeo,groundScorch.clone()); m.rotation.x=-Math.PI/2; m.scale.setScalar(r); m.position.set(p.x,heightAt(p.x,p.z)+.08,p.z); scene.add(m);
  scorches.push({m,t:0}); if(scorches.length>40){ const o=scorches.shift(); scene.remove(o.m); o.m.material.dispose(); }
}
// Munición limitada (jugador): carga según el vehículo, repartida entre los tipos; ametralladora en cintas de 250.
function initAmmo(t){ const L=t.T.ammo, tot=t.T.auto?Math.round(t.T.auto.mag*14):(t.T.ammoCap||(t.T.hp>=130?42:t.T.hp>=90?36:30));
  const sh=L.length===1?[1]:L.length===2?[.6,.4]:[.5,.3,.2]; t.ammoMax=L.map((_,i)=>Math.max(2,Math.round(tot*sh[i]*(t.lv>=4?1.2:1)))); t.ammoCount=t.ammoMax.slice(); t.mgBelt=250; t.mgBelts=t.mgX?5:3; t.mgRel=0; }
const needsRepair=t=>t.trackT>0||t.mod.engine<100||t.mod.breech<100||t.mod.trans<100||(t.mod.barrel??100)<100||t.fireT>0||(t.trkHP&&Math.min(...t.trkHP)<100);
function removeTank(t){
  if(t.mech){ scene.remove(t.mech.g); t.mech=null; }
  scene.remove(t.root); if(t.looseTrk){ scene.remove(t.looseTrk); t.looseTrk=null; } const i=tanks.indexOf(t); if(i>=0)tanks.splice(i,1);
  colliders=colliders.filter(c=>c.userData.tank!==t);
}
function placeOnGround(t,dt){
  if(W.wireCrush&&!t.dead&&Math.abs(t.speed)>.3) W.wireCrush(t.pos.x,t.pos.z,t.T.m.W*.55);
  curSpan=t.T.trench||(t.T.m.L*.4); try{ return placeOnGround0(t,dt); } finally { curSpan=0; } }
function placeOnGround0(t,dt){
  const p=t.pos, s=Math.sin(t.heading), c=Math.cos(t.heading), L=t.T.m.L*.42, Wd=t.T.m.W*.45;
  const Y=p.y+.5, HA=(x,z)=>hAtY(x,z,Y);
  let hL=HA(p.x+c*Wd,p.z-s*Wd), hR=HA(p.x-c*Wd,p.z+s*Wd), hc=HA(p.x,p.z);
  // Borde (puente, barranco): si un costado queda sin apoyo, el tanque se desliza hacia el vacío y cae
  if(!t.air&&!t.dead&&dt<.5){ const dl=hc-hL, dr=hc-hR;
    if(Math.max(dl,dr)>2){ const k2=(dl>dr?1:-1)*dt*3; p.x+=c*k2; p.z-=s*k2; t.speed*=1-dt*.5;
      hL=HA(p.x+c*Wd,p.z-s*Wd); hR=HA(p.x-c*Wd,p.z+s*Wd); hc=HA(p.x,p.z); } }
  const cl=h=>clamp(h,hc-1.4,hc+1.4);
  const hF=cl(HA(p.x+s*L,p.z+c*L)), hB=cl(HA(p.x-s*L,p.z-c*L)); hL=cl(hL); hR=cl(hR);
  const tp=clamp(Math.atan2(hF-hB,L*2),-.6,.6), tr=clamp(Math.atan2(hL-hR,Wd*2),-.55,.55);
  t.gP=Math.atan2(HA(p.x+s*L,p.z+c*L)-HA(p.x-s*L,p.z-c*L),L*2); t.gR=Math.atan2(HA(p.x+c*Wd,p.z-s*Wd)-HA(p.x-c*Wd,p.z+s*Wd),Wd*2); // pendiente real del suelo (sin recortar), para la física de drive
  // ladera muy inclinada de costado: el tanque se desliza hacia abajo
  if(!t.air&&!t.dead&&dt<.5&&Math.abs(t.gR)>MU*.9){ const k=Math.sign(t.gR)*(Math.abs(t.gR)-MU*.9)*G*dt*.6; p.x-=c*k; p.z+=s*k; }
  const gy=(hF+hB+hL+hR)/4;
  // Gravedad: si el suelo quedó más abajo (se fue de un borde), cae; al tocar el suelo, el golpe lastima a la tripulación
  if(!t.dead&&dt<.5&&(t.air||p.y>gy+.9)){
    t.air=true; t.vy=(t.vy||0)-G*dt; p.y+=t.vy*dt; t.pitch+=dt*.35*Math.sign(t.speed||1);
    if(p.y<=gy){ const imp=-t.vy; p.y=gy; t.air=false; t.vy=0;
      if(t.isPlayer) shake=Math.max(shake,Math.min(1.5,imp*.08));
      if(imp>7&&!net.guest&&!(t.immuneT>0)){ for(const m of t.crewM) if(m.alive){ m.hp-=(imp-7)*7*rand(.7,1.2); if(m.hp<=0) m.alive=false; }
        if(imp>10) t.trackT=Math.max(t.trackT,10); tell(t,`¡Caída de ${Math.round(imp*imp/(2*G))} m!`,'var(--enemy)'); afterHit(t,t.lastBy||null,false); } }
  } else { const k=Math.min(1,dt*8); t.pitch+=(tp-t.pitch)*k; t.roll+=(tr-t.roll)*k; p.y=gy; }
  // Suspensión: el casco cabecea al acelerar/frenar y se inclina en las curvas (resorte amortiguado)
  if(dt<.5&&!t.dead){ const acc=(t.speed-(t._ls??t.speed))/dt, yr=wrap(t.heading-(t._lh??t.heading))/dt; t._ls=t.speed; t._lh=t.heading;
    const tgP=clamp(acc*.011,-.07,.07), tgR=clamp(-yr*t.speed*.006,-.05,.05);
    t.sPv=(t.sPv||0)+(((tgP-(t.sP||0))*65)-(t.sPv||0)*7)*dt; t.sP=(t.sP||0)+t.sPv*dt;
    t.sRv=(t.sRv||0)+(((tgR-(t.sR||0))*55)-(t.sRv||0)*6)*dt; t.sR=(t.sR||0)+t.sRv*dt;
    if(t.ant){ t.ant.rotation.x=clamp(-(t.sP||0)*4-t.sPv*.15,-.5,.5); t.ant.rotation.z=clamp((t.sR||0)*4,-.4,.4); } }
  t.root.rotation.set(-(t.pitch+(t.sP||0)),t.heading,t.roll+(t.sR||0));
}
function drive(t,throttle,steer,dt){
  curSpan=t.T.trench||(t.T.m.L*.4); try{ return drive0(t,throttle,steer,dt); } finally { curSpan=0; } }
function drive0(t,throttle,steer,dt){
  if(!canMove(t)||t.air){throttle=0;steer=0;}
  // Potencia según el daño: motor dañado = menos velocidad y aceleración; transmisión rota = sin marchas altas
  const T=t.T, pw=(t.mod.engine>=100?1:.35+.65*clamp(t.mod.engine,0,100)/100)*(WX.mud?.82:1), tx=t.mod.trans>0, vF=Math.min(T.maxF*pw,tx?1e9:4.2), vR=Math.min(T.maxR*pw,tx?1e9:2);
  // Pendientes: la gravedad empuja cuesta abajo (g·sen a); el motor la compensa hasta la pendiente máxima del tanque (climbOf)
  // y la oruga agarra hasta MU (≈37°). Más empinado: no sube, patina y se va para atrás. Cerca del límite sube muy despacio.
  const a=t.air?0:(t.gP||0), cl=climbOf(T)*Math.sqrt(pw), gA=-G*Math.sin(a), dirT=Math.sign(throttle)||0, upA=a*dirT;
  let vF2=vF, vR2=vR; if(upA>0){ const f=clamp(1-Math.sin(upA)/Math.sin(cl),.08,1)**.6; if(dirT>0) vF2*=f; else vR2*=f; }
  const want=throttle>0?throttle*vF2:throttle<0?throttle*vR2:0;
  { const d=want-t.speed, dAcc=clamp(d/dt,-(want===0?6:5),Math.sign(d)===Math.sign(t.speed)||t.speed===0?3.5*pw:6); // aceleración buscada (como en llano)
    let req=dAcc-gA; // lo que tiene que hacer el motor (o los frenos) además de la gravedad
    const cap=Math.min(dirT&&Math.sign(req)===dirT?G*Math.sin(cl)*Math.abs(throttle):6,G*MU*Math.cos(a)); // empuje del motor / frenos, y agarre de la oruga
    t.slip=Math.abs(req)>cap&&Math.abs(a)>.12; req=clamp(req,-cap,cap); t.speed+=(req+gA)*dt;
    if(!dirT&&!t.slip&&Math.abs(t.speed)<.2) t.speed=0; }
  const gk=T.gears?.35+.65*t.crewM.filter(m=>m.alive&&m.seat.startsWith('gear')).length/2:1;
  t.heading=wrap(t.heading+steer*dt*gk*(T.turn-Math.min(T.turn*.3,Math.abs(t.speed)*.015)));
  const p=t.pos, ox=p.x, oz=p.z, yO=p.y;
  if(t.air) t.speed*=1-dt*.2; else if(W.water!=null&&W.water-heightAt(p.x,p.z)>.3) t.speed*=1-dt*1.6; // en el aire no hay control; en el agua frena
  p.x+=Math.sin(t.heading)*t.speed*dt; p.z+=Math.cos(t.heading)*t.speed*dt;
  { const lim=(t.isPlayer||t.net)?OUT:0; p.x=clamp(p.x,-W.bx-lim,W.bx+lim); p.z=clamp(p.z,-W.bz-lim,W.bz+lim); }
  // Casco = dos círculos (adelante y atrás) contra edificios orientados: se desliza en vez de trabarse
  const fx=Math.sin(t.heading), fz=Math.cos(t.heading), cr=t.cr, dir=Math.sign(t.speed)||0;
  for(let it=0;it<2;it++) for(const k of [1,-1]){
    const cx=p.x+fx*t.co*k, cz=p.z+fz*t.co*k;
    for(const b of gridQuery(cx,cz,cr+1)){ const push=obPush(cx,cz,cr,b); if(!push) continue;
      p.x+=push.x; p.z+=push.z;
      const n=Math.hypot(push.x,push.z)||1, into=-(fx*push.x+fz*push.z)/n*dir;
      // embestir casas: un tanque rápido y pesado las derrumba de a poco
      if(it===0&&b.bld&&into>.4&&Math.abs(t.speed)>3) damageBuilding(b.bld,Math.abs(t.speed)*t.T.hp*.09*dt*into);
      if(into>0&&it===0) t.speed*=1-Math.min(.9,into*dt*10);
    }
    for(const b of pierObs){ if(yO>b.top||Math.abs(cx-b.ob.cx)>b.ob.hw+cr+1||Math.abs(cz-b.ob.cz)>b.ob.hd+cr+1) continue; const push=obPush(cx,cz,cr,b); if(!push) continue;
      p.x+=push.x; p.z+=push.z; const n=Math.hypot(push.x,push.z)||1, into=-(fx*push.x+fz*push.z)/n*dir; if(into>0&&it===0) t.speed*=1-Math.min(.9,into*dt*10); }
  }
  { const gN=hAtY(p.x,p.z,yO+.5), bot=!t.isPlayer&&!t.net;
    // no se trepan paredes ni escalones de más de 1,2 m; la IA además evita el agua y los precipicios
    if((bot&&W.boundary&&!inPoly(p.x,p.z,W.boundary))||(!t.air&&gN-yO>1.2)||(bot&&((W.water!=null&&gN<W.water+.4)||yO-gN>2.5))){p.x=ox;p.z=oz;t.speed*=.5;} }
  for(const o of tanks){ if(o===t) continue; const dx=p.x-o.pos.x, dz=p.z-o.pos.z, dd=Math.hypot(dx,dz), m=t.R+o.R*.9;
    if(dd<m&&dd>0.01){p.x+=dx/dd*(m-dd)*.6;p.z+=dz/dd*(m-dd)*.6; const into=-(fx*dx+fz*dz)/dd*dir; if(into>0)t.speed*=1-Math.min(.9,into*dt*8);} }
  crushCars(t);
  propsNear(p.x,p.z,t.co+cr+3,P=>{ if(P.fallen||P.crushed||P.gone) return; for(const k of [1,-1]){ const dx=P.x-(p.x+fx*t.co*k), dz=P.z-(p.z+fz*t.co*k);
      if(dx*dx+dz*dz<(cr+P.r)**2&&Math.abs(t.speed)>.6){ knockProp(P,dx*dir||fx,dz*dir||fz); t.speed*=P.kind==='car'?.8:.95; break; } } });
  if(Math.abs(t.speed)>.3) grassNear(p.x,p.z,t.co+cr,G=>{ if(G.flat) return; if((G.x-p.x)**2+(G.z-p.z)**2<(t.co+cr*.8)**2){ G.flat=1; setGrass(G); } });
  for(const tr of trees){ if(tr.fallen) continue;
    for(const k of [1,-1]){const dx=tr.x-(p.x+fx*t.co*k), dz=tr.z-(p.z+fz*t.co*k);
      if(dx*dx+dz*dz<(cr+tr.r)**2){tr.fallen=true; tr.axis=new THREE.Vector3(fz*dir||fz,0,-(fx*dir||fx)).normalize(); t.speed*=.92; break;}} }
  placeOnGround(t,dt);
  t.moved=Math.hypot(p.x-ox,p.z-oz)/Math.max(dt,1e-4);
}

/* ---------- Puntería ---------- */
const VEL=330, G=9.8, IMMUNE=6, MU=.65; // MU: agarre de la oruga en tierra (≈33°, con tierra suelta)
// Pendiente máxima que sube cada tanque (rad), según potencia y peso: los de la 1ª Guerra ~22°, entreguerras ~27°, modernos ~31°
const CLIMB_ERA={1:.38,2:.47,3:.52,4:.54,5:.55};
const climbOf=T=>T.climb||CLIMB_ERA[T.era||5]||.55;
let lastTh=false;
const thermalOn=()=>state==='play'&&player&&!player.dead&&player.thermal;
// Elige la munición según lo que se apunta mientras dura la recarga; una vez cargada, queda.
function bestAmmo(t,info){
  const L=t.T.ammo; if(L.length<2||!info) return t.ammoIdx;
  let bi=t.ammoIdx, bv=-1e9;
  L.forEach((A,i)=>{ let v;
    if(info.soft) v={he:40,hesh:35,heat:20,ke:5}[A.kind];
    else { const pen=A.kind==='ke'?A.pen*Math.max(.5,1-info.d/3000):A.pen, ric={ke:.26,heat:.17,hesh:.34,he:0}[A.kind];
      const eff=A.kind==='hesh'?info.armor:info.armor/Math.max(info.cos,.2), ok=pen*.95>eff&&info.cos>=ric;
      v=ok?100+{ke:30,heat:22,hesh:15,he:8}[A.kind]+pen*.01:pen/eff*50; }
    if(v>bv){bv=v;bi=i;} });
  return bi;
}
function aimInfo(t){
  const o=camera.position.clone(), d=camera.getWorldDirection(new THREE.Vector3()); ray.set(o,d); ray.far=600;
  const h=ray.intersectObjects(colliders.filter(c=>c.userData.tank!==t).concat(houseMeshes),false); ray.far=Infinity;
  if(h.length&&h[0].object.userData.tank){ const T=h[0].object.userData.tank; if(T.dead||T.team===t.team) return null;
    const wn=h[0].face.normal.clone().transformDirection(h[0].object.matrixWorld), sd=h[0].point.clone().sub(t.pos).normalize();
    return {armor:T.T.armor[h[0].object.userData.zone][faceOf(h[0].face.normal)],cos:Math.abs(sd.dot(wn)),d:h[0].point.distanceTo(t.pos)}; }
  if(h.length) return {soft:true};
  if(lastAim&&infantry.some(P=>!P.dead&&P.kind!=='civ'&&P.team!==t.team&&P.pos.distanceTo(lastAim)<5)) return {soft:true};
  return null;
}
const ammoOf=t=>t.T.ammo[t.ammoIdx]||t.T.ammo[0];
function ballisticPitch(d,dy,v=VEL){const v2=v*v,disc=v2*v2-G*(G*d*d+2*dy*v2);if(disc<0)return .5;return Math.atan((v2-Math.sqrt(disc))/(G*d));}
const qInv=new THREE.Quaternion();
function aimAt(t,point,dt,eY=0,eP=0){
  t.root.updateMatrixWorld(true);
  const gp=t.gunPivot.getWorldPosition(new THREE.Vector3());
  const dx=point.x-gp.x, dz=point.z-gp.z, d=Math.max(5,Math.hypot(dx,dz));
  const v=ammoOf(t).v, manual=t.isPlayer&&realMode&&!hasFcs(t);
  const wy=Math.atan2(dx,dz)+eY, wp=(manual?Math.atan2(point.y-gp.y,d)+ballisticPitch(200,0,v):ballisticPitch(d,point.y-gp.y,v))+eP;
  const dir=new THREE.Vector3(Math.sin(wy)*Math.cos(wp),Math.sin(wp),Math.cos(wy)*Math.cos(wp));
  qInv.copy(t.root.quaternion).invert(); dir.applyQuaternion(qInv);
  const ly0=Math.atan2(dir.x,dir.z); let ly=ly0; const lp=clamp(Math.asin(clamp(dir.y,-1,1)),-.14,t.T.elev||.35); // los antiaéreos suben casi vertical (T.elev)
  if(t.T.arc!=null){ const c0=t.T.arcC||0; ly=c0+clamp(wrap(ly-c0),-t.T.arc,t.T.arc); }
  t.turretYaw=stepAng(t.turretYaw,ly,t.T.trav*dt);
  const ps=t.T.aa?1.1:.5; t.gunPitch+=clamp(lp-t.gunPitch,-ps*dt,ps*dt);
  if(t.sponsons) sponsonAim(t); else { t.turret.rotation.y=t.turretYaw-(t.turretBase||0); t.gunPivot.rotation.x=-t.gunPitch; }
  return Math.abs(wrap(ly0-t.turretYaw))+Math.abs(lp-t.gunPitch);
}

