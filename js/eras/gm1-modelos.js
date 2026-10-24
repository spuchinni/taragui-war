/* ---------- Modelos hechos por código de la Primera Guerra Mundial ----------
   Mark I / IV / V (romboides con barbetas), Whippet, Renault FT, Schneider CA1, Saint-Chamond, A7V, LK II y cañones de campaña.
   Cada modelo deja en el tanque lo mismo que buildModel: turret, gunPivot, barrel, muzzle, coax, colliders, hTop, topH, aimH,
   y además seatPos (dónde va sentado cada tripulante, para las esquirlas). Medidas en metros, z hacia adelante. */

// ---- Pintura de cada vehículo (no la de la nación) ----
const _vehCamo={};
function ww1Paint(cols,mode){ return (x,s)=>{
  x.fillStyle=cols[0]; x.fillRect(0,0,s,s);
  if(mode==='fr'){ // camuflaje francés de 1917: manchas grandes de colores con borde negro
    for(let i=0;i<26;i++){ const c=cols[1+(i%(cols.length-1))]; const cx=Math.random()*s, cy=Math.random()*s, P=[];
      for(let j=0;j<7;j++){ const a=j/7*Math.PI*2+rand(-.3,.3), r=rand(30,80); P.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r*.7]); }
      x.fillStyle=c; x.beginPath(); P.forEach((p,k)=>k?x.lineTo(...p):x.moveTo(...p)); x.closePath(); x.fill(); x.strokeStyle='#1b1a16'; x.lineWidth=rand(3,6); x.stroke(); } }
  else if(mode==='de'){ // A7V: gris con manchas ocre y verdes
    for(let i=0;i<30;i++){ x.fillStyle=cols[1+(i%(cols.length-1))]; x.globalAlpha=rand(.7,.95); x.beginPath(); const cx=Math.random()*s, cy=Math.random()*s;
      for(let j=0;j<9;j++){ const a=j/9*Math.PI*2, r=rand(18,60); x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r*.6); } x.fill(); } x.globalAlpha=1; }
  else { for(let i=0;i<40;i++){ x.globalAlpha=rand(.05,.15); x.fillStyle=Math.random()<.5?cols[1]:cols[2]; x.fillRect(Math.random()*s,Math.random()*s,rand(20,90),rand(10,60)); } x.globalAlpha=1; }
  // remaches, óxido y barro de trinchera
  x.fillStyle='rgba(20,18,14,.55)'; for(let yy=10;yy<s;yy+=42) for(let xx=6;xx<s;xx+=14) x.fillRect(xx,yy,2.5,2.5);
  for(let i=0;i<60;i++){ x.globalAlpha=rand(.08,.25); x.fillStyle=Math.random()<.5?'#6b5638':'#3b3022'; x.beginPath(); x.ellipse(Math.random()*s,Math.random()*s,rand(4,22),rand(3,12),rand(0,3),0,7); x.fill(); }
  x.globalAlpha=.3; x.fillStyle='#8a5a32'; for(let i=0;i<25;i++){ const X=Math.random()*s, Y=Math.random()*s; x.fillRect(X,Y,rand(1,3),rand(8,30)); }
  x.globalAlpha=1; speckle(x,s,s,2200,['#000000','#ffffff','#3a3428'],1,2.5); }; }
function vehCamo(key){ if(_vehCamo[key]) return _vehCamo[key]; const T=VEH[key], f=ww1Paint(T.camo,T.camoMode);
  return _vehCamo[key]=[canvasTex(512,f),canvasTex(512,mudPaint(f))]; }

// ---- Ayudas de geometría ----
// Perfil lateral (z,y) cerrado, extruido a lo ancho (x) y centrado en x0
function profGeo(prof,w){ const sh=new THREE.Shape(); prof.forEach(([z,y],i)=>i?sh.lineTo(z,y):sh.moveTo(z,y)); sh.closePath();
  const g=new THREE.ExtrudeGeometry(sh,{depth:w,bevelEnabled:false}); g.rotateY(-Math.PI/2); g.translate(w/2,0,0);
  const uv=g.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*.3,uv.getY(i)*.3); g.computeVertexNormals(); return g; }
function profMesh(parent,prof,w,x0,mat){ const m=new THREE.Mesh(profGeo(prof,w),mat); m.position.x=x0; m.castShadow=m.receiveShadow=true; parent.add(m); return m; }
// Planta (z,x) extruida en altura (y), para barbetas y casamatas
function planMesh(parent,plan,h,y0,mat){ const sh=new THREE.Shape(); plan.forEach(([z,x],i)=>i?sh.lineTo(x,z):sh.moveTo(x,z)); sh.closePath();
  const g=new THREE.ExtrudeGeometry(sh,{depth:h,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:1}); g.rotateX(Math.PI/2); g.translate(0,y0+h,0);
  const uv=g.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*.3,uv.getY(i)*.3); g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat); m.castShadow=m.receiveShadow=true; parent.add(m); return m; }
// Suaviza un polígono cerrado (Chaikin)
function chaikin(P,it=2){ for(let k=0;k<it;k++){ const Q=[]; for(let i=0;i<P.length;i++){ const a=P[i], b=P[(i+1)%P.length]; Q.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75]); } P=Q; } return P; }
function insetPoly(P,d){ return P.map((p,i)=>{ const a=P[(i-1+P.length)%P.length], b=P[(i+1)%P.length]; let nz=b[1]-a[1], ny=-(b[0]-a[0]); const l=Math.hypot(nz,ny)||1; return [p[0]-nz/l*d,p[1]-ny/l*d]; }); }
// Oruga cerrada alrededor de un perfil (z,y). El perfil va en sentido antihorario empezando arriba adelante,
// así los eslabones de arriba avanzan cuando el tanque va hacia adelante (la textura se desplaza en tankFX).
const linkTex=()=>{ const t=new THREE.CanvasTexture(linkCanvas); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=2; return t; };
function trackLoop(parent,prof,w,x0,linkMat,sideMat,th=.1){
  const P=chaikin(prof,3), N=P.length, nrm=P.map((p,i)=>{ const a=P[(i-1+N)%N], b=P[(i+1)%N]; let nz=b[1]-a[1], ny=-(b[0]-a[0]); const l=Math.hypot(nz,ny)||1; return [nz/l,ny/l]; });
  const pos=[], uv=[], grpA=[], grpB=[]; let s=0; const S=[0]; for(let i=1;i<=N;i++){ const a=P[i-1], b=P[i%N]; s+=Math.hypot(b[0]-a[0],b[1]-a[1]); S.push(s); }
  const v=(x,z,y,u,vv,arr)=>{ arr.push([x,y,z,u,vv]); };
  for(let i=0;i<N;i++){ const j=(i+1)%N, a=P[i], b=P[j], na=nrm[i], nb=nrm[j], ua=S[i]*.42, ub=S[i+1]*.42;
    const ai=[a[0]-na[0]*th,a[1]-na[1]*th], bi=[b[0]-nb[0]*th,b[1]-nb[1]*th];
    // banda exterior (eslabones)
    v(-w/2,a[0],a[1],ua,0,grpA); v(w/2,a[0],a[1],ua,1,grpA); v(w/2,b[0],b[1],ub,1,grpA); v(-w/2,a[0],a[1],ua,0,grpA); v(w/2,b[0],b[1],ub,1,grpA); v(-w/2,b[0],b[1],ub,0,grpA);
    // banda interior y costados
    v(-w/2,ai[0],ai[1],0,0,grpB); v(-w/2,bi[0],bi[1],0,0,grpB); v(w/2,bi[0],bi[1],0,0,grpB); v(-w/2,ai[0],ai[1],0,0,grpB); v(w/2,bi[0],bi[1],0,0,grpB); v(w/2,ai[0],ai[1],0,0,grpB);
    for(const sx of [-w/2,w/2]){ v(sx,a[0],a[1],0,0,grpB); v(sx,b[0],b[1],0,0,grpB); v(sx,bi[0],bi[1],0,0,grpB); v(sx,a[0],a[1],0,0,grpB); v(sx,bi[0],bi[1],0,0,grpB); v(sx,ai[0],ai[1],0,0,grpB); } }
  const all=grpA.concat(grpB), g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(all.flatMap(q=>[q[0],q[1],q[2]]),3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(all.flatMap(q=>[q[3],q[4]]),2));
  g.addGroup(0,grpA.length,0); g.addGroup(grpA.length,grpB.length,1); g.computeVertexNormals();
  const m=new THREE.Mesh(g,[linkMat,sideMat]); m.position.x=x0; m.castShadow=m.receiveShadow=true; parent.add(m); return m; }
function ww1Tracks(t){ // materiales de oruga con eslabones que se desplazan (los dos costados avanzan igual)
  const mk=()=>new THREE.MeshStandardMaterial({map:linkTex(),roughness:.85,metalness:.4,side:THREE.DoubleSide});
  const L=mk(), R=mk(); t.trk={sideP:L,sideN:{map:{offset:{x:0}}},top:R,mats:[L,R]}; return [L,R]; }
const sideTrkMat=new THREE.MeshStandardMaterial({color:0x2a2825,roughness:.85,metalness:.35,side:THREE.DoubleSide});
function collider(parent,w,h,d,x,y,z,t,zone){ const c=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),darkMat); c.position.set(x,y,z); c.visible=false; c.userData={tank:t,zone}; parent.add(c); colliders.push(c); return c; }
function slits(parent,n,x,y,z,ry,w=.18){ for(let i=0;i<n;i++){ const b=box(parent,w,.035,.03,0,0,0,darkMat); b.position.set(x+Math.cos(ry)*(i-(n-1)/2)*(w+.12),y,z-Math.sin(ry)*(i-(n-1)/2)*(w+.12)); b.rotation.y=ry; } }
function rivetsRow(parent,x,y,z0,z1,n,mat=darkMat){ for(let i=0;i<n;i++){ const r=cyl(parent,.025,.025,.03,x,y,z0+(z1-z0)*i/(n-1),5,mat); r.rotation.z=Math.PI/2; } }
// Cruz de hierro con borde blanco (vehículos alemanes)
const _wMat=new THREE.MeshLambertMaterial({color:0xe8e4d8}), _kMat=new THREE.MeshLambertMaterial({color:0x111111}), _rMat=new THREE.MeshLambertMaterial({color:0xa8261c});
function ironCross(parent,x,y,z,ry,s=1){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; parent.add(g);
  box(g,.02,.62*s,.2*s,0,0,0,_wMat); box(g,.02,.2*s,.62*s,0,0,0,_wMat); box(g,.03,.5*s,.1*s,0,0,0,_kMat); box(g,.03,.1*s,.5*s,0,0,0,_kMat); return g; }
// Franjas blanca-roja-blanca de reconocimiento (tanques británicos de 1918)
function wrw(parent,x,y,z,ry,h=.7){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; parent.add(g); [-.2,0,.2].forEach((dz,i)=>box(g,.02,h,.2,0,0,dz,i===1?_rMat:_wMat)); return g; }
// Cañón: grupo que gira (mount), pivote de elevación, tubo, boca y coaxial
function gunMount(t,parent,x,y,z,gl,gr,mat,opt={}){
  const mount=new THREE.Group(); mount.position.set(x,y,z); parent.add(mount);
  const gp=new THREE.Group(); mount.add(gp);
  if(opt.shield!==false){ const sh=new THREE.Mesh(new THREE.SphereGeometry(opt.shR||.24,10,8,0,Math.PI*2,0,Math.PI/2),mat); sh.rotation.x=Math.PI/2; sh.scale.set(1,.5,1); gp.add(sh); }
  const barrel=new THREE.Group(); gp.add(barrel);
  const bm=cyl(barrel,gr*.85,gr*1.1,gl,0,0,gl/2+.12,10,darkMat); bm.rotation.x=Math.PI/2;
  if(opt.jacket){ const j=cyl(barrel,gr*1.9,gr*1.9,gl*.8,0,0,gl*.42+.12,8,mat); j.rotation.x=Math.PI/2; }
  const muzzle=new THREE.Object3D(); muzzle.position.z=gl+.3; barrel.add(muzzle);
  const coax=new THREE.Object3D(); coax.position.set(.18,-.05,.3); gp.add(coax);
  const bc=new THREE.Mesh(new THREE.CylinderGeometry(Math.max(.1,gr*1.8),Math.max(.1,gr*1.8),gl*.9,6),darkMat); bc.rotation.x=Math.PI/2; bc.position.z=gl*.5+.12; bc.visible=false; bc.userData={tank:t,zone:'barrel'}; barrel.add(bc); colliders.push(bc);
  return {mount,gp,barrel,muzzle,coax,bm}; }
function useGun(t,G){ t.turret=G.mount; t.gunPivot=G.gp; t.barrel=G.barrel; t.muzzle=G.muzzle; t.coax=G.coax; t.barrelMesh=G.bm; }

// ---- Barbetas (sponsons) del Mark I/IV/V: el cañón que dispara es el del costado hacia donde se apunta ----
function sponsonAim(t){
  const S=t.sponsons, yaw=t.turretYaw;
  if(t.spSide==null) t.spSide=1;
  if(t.spSide>0&&yaw<-.12) t.spSide=-1; else if(t.spSide<0&&yaw>.12) t.spSide=1;
  for(const sd of [1,-1]){ const G=S[sd], act=sd===t.spSide;
    const want=act?clamp(yaw,sd>0?-.2:-1.8,sd>0?1.8:.2):sd*.55; G.mount.rotation.y+= (want-G.mount.rotation.y)*(act?1:.08);
    G.gp.rotation.x=act?-t.gunPitch:G.gp.rotation.x*.9; }
  useGun(t,S[t.spSide]);
}
function ww1CompPos(t){ const out={}, sp=t.seatPos; const sd=t.spSide||1;
  for(const k in sp){ const v=sp[k]; out[k]=(typeof v==='function'?v(sd,t):v).clone(); } return out; }
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);

// ---- Constructor principal ----
function buildWW1(t,M,mat){
  const root=t.root, [lkL,lkR]=M.ww1==='gun'?[null,null]:ww1Tracks(t), type=M.ww1;
  t.ant=null; t.ww1=type;
  if(type==='rhombo') return buildRhombo(t,M,mat,root,lkL,lkR);
  if(type==='ft') return buildFT(t,M,mat,root,lkL,lkR);
  if(type==='a7v') return buildA7V(t,M,mat,root,lkL,lkR);
  if(type==='schneider') return buildSchneider(t,M,mat,root,lkL,lkR);
  if(type==='stchamond') return buildStChamond(t,M,mat,root,lkL,lkR);
  if(type==='whippet'||type==='lk2') return buildWhippet(t,M,mat,root,lkL,lkR,type==='lk2');
  if(type==='gun') return buildFieldGun(t,M,mat,root);
}

// Mark I, Mark IV (macho y hembra), Mark V y el Beutepanzer
function buildRhombo(t,M,mat,root,lkL,lkR){
  const v=M.var, fem=v==='mk4f', mk1=v==='mk1', mk5=v==='mk5', beute=v==='beute', hw=M.W/2;
  // perfil de la oruga (antihorario desde arriba adelante): el romboide clásico
  const prof=[[2.75,2.45],[-3.35,2.45],[-3.85,2.2],[-4.02,1.55],[-3.8,.95],[-3.15,.22],[-2.55,0],[1.95,0],[2.65,.38],[3.6,1.15],[4.02,1.62],[3.85,2.15]];
  const fr=insetPoly(chaikin(prof,2),.16);
  for(const s of [-1,1]){ const x=s*(hw-.28);
    profMesh(root,fr,.5,x,mat);                               // bastidor lateral (los "cuernos")
    trackLoop(root,prof,.54,x,s>0?lkR:lkL,sideTrkMat,.12);       // oruga alrededor de todo el casco
    rivetsRow(root,s*(hw-.02),1.95,-2.9,2.3,14); rivetsRow(root,s*(hw-.02),.55,-2.2,1.6,11);
    // rodillos tensores asomando por los costados
    for(let i=0;i<4;i++) wheel(root,s*(hw-.28),.32,-1.8+i*1.15,.18);
  }
  // casco central, cabina adelante y escape
  box(root,M.W-1.08,1.75,6.2,0,1.35,-.35,mat);
  const cab=new THREE.Group(); cab.position.set(0,0,2.45); root.add(cab);
  profMesh(cab,[[.45,2.55],[-.55,2.55],[-.55,1.35],[.45,1.35],[.62,1.7]],1.5,0,mat);
  slits(cab,3,0,2.15,.53,0,.16); box(cab,.5,.32,.06,-.4,2.1,.55,mat); box(cab,.5,.32,.06,.4,2.1,.55,mat);
  cyl(root,.09,.09,1.6,.3,2.45,-2.1,8,darkMat).rotation.x=Math.PI/2;            // caño de escape
  cyl(root,.18,.18,.7,.3,2.5,-1.0,10,darkMat).rotation.x=Math.PI/2;             // silenciador
  if(!mk1){ // tanque de combustible blindado atrás y viga de desatasco sobre rieles
    box(root,1.0,.7,.55,0,1.25,-3.65,mat);
    for(const s of [-1,1]) box(root,.1,.1,6.6,s*.55,2.6,-.4,darkMat);
    const beam=cyl(root,.17,.17,M.W-.6,0,2.78,-2.6,10,new THREE.MeshLambertMaterial({color:0x5a4630})); beam.rotation.z=Math.PI/2;
    for(const s of [-1,1]){ const ch=box(root,.04,.04,.9,s*.9,2.7,-2.2,darkMat); ch.rotation.x=.5; } }
  else { // Mark I: cola de dos ruedas para ayudar a girar y techo de malla contra granadas
    const tail=new THREE.Group(); tail.position.set(0,0,-4.0); root.add(tail);
    box(tail,.12,.12,1.6,-.6,.8,-.6,darkMat); box(tail,.12,.12,1.6,.6,.8,-.6,darkMat);
    for(const s of [-1,1]){ const wl=cyl(tail,.62,.62,.14,s*.6,.62,-1.3,16,darkMat); wl.rotation.z=Math.PI/2; }
    const wire=new THREE.MeshBasicMaterial({color:0x3a3a34,wireframe:true});
    for(const sd of [-1,1]){ const gR=new THREE.Group(); gR.position.set(0,2.95,.4); gR.rotation.z=-sd*.55; root.add(gR); const roof=new THREE.Mesh(new THREE.PlaneGeometry(1.0,3.6,3,9),wire); roof.rotation.x=-Math.PI/2; roof.position.x=sd*.5; gR.add(roof); } }
  if(mk5){ // cúpula de observación atrás
    box(root,1.1,.55,1.0,0,2.75,-1.3,mat); slits(root,2,0,2.85,-.79,0,.2); }
  if(v==='mk4'||mk5){ wrw(root,hw+.01,1.6,3.0,0); wrw(root,-hw-.01,1.6,3.0,Math.PI); }
  if(beute){ for(const s of [-1,1]) ironCross(root,s*(hw+.01),1.5,-1.6,0,1.1); ironCross(root,0,2.25,3.25,Math.PI/2,.8); }
  // barbetas
  const spW=M.spW, S={};
  for(const s of [-1,1]){ const g=new THREE.Group(); g.position.set(s*hw,0,.55); root.add(g);
    const plan=fem?[[-.75,0],[.75,0],[.42,s*spW],[-.42,s*spW]]:[[-1.0,0],[1.0,0],[.55,s*spW],[-.6,s*spW]];
    planMesh(g,plan,fem?.95:1.0,fem?.82:.75,mat);
    box(g,.06,.5,.4,s*(spW*.6),1.25,-.45,mat);                                   // puerta de la barbeta
    collider(g,spW,1.0,fem?1.5:2.0,s*spW/2,1.25,0,t,'turret');
    const G=gunMount(t,g,s*(spW-.08),1.3,fem?.15:.42,M.gl,M.gr,mat,{jacket:fem,shR:fem?.16:.26});
    G.mount.rotation.y=s*.55; S[s]=G; }
  t.sponsons=S; t.spSide=1; useGun(t,S[1]);
  collider(root,M.W,2.45,8.0,0,1.22,0,t,'hull');
  t.hTop=2.45; t.topH=2.9; t.aimH=1.4; t.glL=1.2;
  const sx=(sd)=>sd;
  t.seatPos={driver:V3(-.35,1.75,2.3),commander:V3(.35,1.75,2.3),
    gunner:(sd)=>V3(sd*(hw+.35),1.3,.75),loader:(sd)=>V3(sd*(hw-.2),1.2,.2),mg1:(sd)=>V3(-sd*(hw+.3),1.3,.6),mg2:V3(0,1.35,-1.6),mg3:V3(0,1.6,-1.2),
    gear1:V3(-.45,1.1,-2.6),gear2:V3(.45,1.1,-2.6),mech1:V3(0,1.1,-2.4),engine:V3(0,1.1,-.6),trans:V3(0,.85,-2.9),ammo:(sd)=>V3(sd*.45,1.0,1.0),ammo2:(sd)=>V3(-sd*.45,1.0,-.2),
    breech:(sd)=>V3(sd*(hw+.4),1.3,.95)};
}

// Renault FT: torre giratoria, motor atrás, rueda tensora grande adelante y cola
function buildFT(t,M,mat,root,lkL,lkR){
  const prof=[[1.75,1.22],[-1.6,.9],[-2.0,.68],[-2.08,.3],[-1.6,0],[1.25,0],[1.95,.32],[2.22,.78],[2.08,1.1]];
  for(const s of [-1,1]){ const x=s*.7;
    profMesh(root,insetPoly(chaikin(prof,2),.12),.08,s*.52,mat);            // bastidor interior
    trackLoop(root,prof,.32,x,s>0?lkR:lkL,sideTrkMat,.09);
    profMesh(root,insetPoly(chaikin(prof,2),.14),.05,s*.88,mat);            // chapa exterior
    wheel(root,s*.7,.78,1.75,.4); for(let i=0;i<5;i++) wheel(root,s*.88,.17,-1.2+i*.55,.14); }
  // casco: frente inclinado (escotillas del conductor), techo y caja del motor atrás
  profMesh(root,[[1.25,1.55],[-.6,1.55],[-1.9,1.12],[-2.0,.42],[1.2,.38],[1.75,.8]],1.04,0,mat);
  box(root,.5,.06,.4,-.24,1.35,1.42,mat).rotation.x=-.85; box(root,.5,.06,.4,.24,1.35,1.42,mat).rotation.x=-.85;
  slits(root,2,0,1.38,1.52,0,.14);
  box(root,.7,.05,.9,0,1.42,-1.2,darkMat).rotation.x=.35;                      // rejilla del motor
  // cola para cruzar trincheras
  for(const s of [-1,1]){ const r=box(root,.07,.07,1.0,s*.4,.55,-2.35,darkMat); r.rotation.x=-.35; } box(root,.9,.07,.07,0,.38,-2.8,darkMat);
  // torre octogonal con hongo de ventilación
  const tur=new THREE.Group(); tur.position.set(0,1.55,M.tz); root.add(tur);
  const oct=cyl(tur,.5,.56,.72,0,.36,0,8,mat); oct.rotation.y=Math.PI/8;
  const mush=new THREE.Mesh(new THREE.SphereGeometry(.2,10,6,0,Math.PI*2,0,Math.PI/2),mat); mush.position.y=.82; mush.scale.y=.6; tur.add(mush); cyl(tur,.12,.14,.1,0,.74,0,8,mat);
  slits(tur,2,0,.55,.5,0,.14); box(tur,.4,.32,.05,0,.38,-.54,mat);            // escotilla trasera
  const G=gunMount(t,tur,0,.42,.5,M.gl,M.gr,mat,{shR:.17}); G.mount.position.set(0,.42,.48);
  // en el FT gira toda la torre: el grupo de la torre hace de "mount"
  t.turret=tur; t.gunPivot=G.gp; t.barrel=G.barrel; t.muzzle=G.muzzle; t.coax=G.coax; t.barrelMesh=G.bm;
  collider(tur,1.1,.8,1.1,0,.4,0,t,'turret'); collider(root,1.74,1.55,4.4,0,.78,0,t,'hull');
  t.hTop=1.55; t.topH=2.5; t.aimH=1.1; t.glL=.6;
  const tp=(x,y,z)=>(sd,T)=>{ const c=Math.cos(T.turretYaw), sn=Math.sin(T.turretYaw); return V3(x*c+z*sn,1.55+y,M.tz-x*sn+z*c); };
  t.seatPos={driver:V3(0,.95,1.2),gunner:tp(0,.25,0),engine:V3(0,.9,-1.25),trans:V3(0,.6,-1.7),ammo:V3(.3,.75,.35),breech:tp(0,.42,.3)};
}

// A7V: caja enorme sobre orugas bajas, 57 mm en la proa y cúpula de mando arriba
function buildA7V(t,M,mat,root,lkL,lkR){
  const prof=[[2.6,.85],[-2.6,.85],[-3.02,.45],[-2.7,0],[2.7,0],[3.02,.45]];
  for(const s of [-1,1]){ trackLoop(root,prof,.5,s*1.05,s>0?lkR:lkL,sideTrkMat,.1); for(let i=0;i<8;i++) wheel(root,s*1.05,.2,-2.3+i*.66,.16); }
  const body=[[2.9,2.55],[-2.9,2.55],[-3.67,2.0],[-3.67,1.25],[-3.05,.55],[3.05,.55],[3.67,1.25],[3.67,2.0]];
  profMesh(root,body,3.06,0,mat);
  for(const s of [-1,1]){ rivetsRow(root,s*1.54,2.4,-2.8,2.8,16); rivetsRow(root,s*1.54,.7,-2.9,2.9,16); rivetsRow(root,s*1.54,1.6,-3.4,3.4,18);
    for(const z of [1.9,-.1,-2.0]){ const p=cyl(root,.09,.09,.12,s*1.56,1.7,z,8,darkMat); p.rotation.z=Math.PI/2; }      // troneras de ametralladora
    ironCross(root,s*1.545,1.6,.9,0,1.15); }
  for(const z of [-3.68]){ for(const x of [-.7,.7]){ const p=cyl(root,.09,.09,.12,x,1.7,z,8,darkMat); p.rotation.x=Math.PI/2; } }
  ironCross(root,0,2.2,3.5,Math.PI/2,.8);
  // cúpula del conductor y del comandante
  const cup=new THREE.Group(); cup.position.set(0,2.55,.3); root.add(cup);
  profMesh(cup,[[.85,.65],[-.85,.65],[-.95,0],[.95,0]],1.6,0,mat); slits(cup,3,0,.45,.9,0,.2); slits(cup,3,0,.45,-.9,0,.2);
  for(const s of [-1,1]) slits(cup,2,s*.81,.45,0,Math.PI/2,.25);
  box(root,.9,.06,.6,0,2.6,-2.3,darkMat);                                       // rejillas de los motores
  const G=gunMount(t,root,0,1.65,3.62,M.gl,M.gr,mat,{shR:.3}); useGun(t,G);
  collider(root,3.06,2.6,7.34,0,1.4,0,t,'hull'); collider(root,1.4,.9,.5,0,1.65,3.55,t,'turret');
  t.hTop=2.6; t.topH=3.4; t.aimH=1.6; t.glL=.6;
  t.seatPos={driver:V3(-.3,2.75,.3),commander:V3(.3,2.85,.4),gunner:V3(0,1.6,3.0),loader:V3(.45,1.4,2.6),mg1:V3(-1.25,1.6,1.8),mg2:V3(1.25,1.6,1.8),mg3:V3(-1.25,1.6,-1.6),mg4:V3(1.25,1.6,-1.6),
    mech1:V3(-.55,1.05,0),mech2:V3(.55,1.05,0),engine:V3(0,1.0,-.1),trans:V3(0,.8,-.7),ammo:V3(0,1.0,2.0),ammo2:V3(0,1.0,-2.1),breech:V3(0,1.65,3.25)};
}

// Schneider CA1: caja con proa cortaalambres y el 75 mm a la derecha
function buildSchneider(t,M,mat,root,lkL,lkR){
  const prof=[[1.6,.75],[-1.7,.75],[-2.0,.4],[-1.7,0],[1.5,0],[1.95,.4]];
  for(const s of [-1,1]){ trackLoop(root,prof,.36,s*.8,s>0?lkR:lkL,sideTrkMat,.09); for(let i=0;i<6;i++) wheel(root,s*.8,.17,-1.4+i*.55,.14); }
  profMesh(root,[[1.6,1.95],[-2.4,1.95],[-2.6,1.7],[-2.6,.55],[2.0,.45],[3.15,.72],[2.6,1.5]],1.85,0,mat);
  box(root,1.7,.06,.3,0,.72,3.0,darkMat).rotation.x=.25;                        // filo cortaalambres
  for(const s of [-1,1]){ rivetsRow(root,s*.93,1.8,-2.3,1.4,10); rivetsRow(root,s*.93,.62,-2.4,1.8,11); }
  // cúpula del conductor (izquierda) y barbeta del 75 a la derecha
  box(root,.55,.4,.6,-.45,2.15,1.0,mat); slits(root,2,-.45,2.2,1.31,0,.12);
  planMesh(root,[[.9,.0],[2.1,.0],[2.1,.42],[.9,.42]].map(([z,x])=>[z,x+.75]),.7,.95,mat);
  // salidas de ametralladora a los costados
  for(const s of [-1,1]){ const h=cyl(root,.12,.12,.15,s*.95,1.35,-.1,8,mat); h.rotation.z=Math.PI/2; }
  for(const s of [-1,1]){ const r=box(root,.07,.07,.9,s*.5,.55,-2.95,darkMat); r.rotation.x=-.3; }   // cola
  const G=gunMount(t,root,.95,1.3,2.1,M.gl,M.gr,mat,{shR:.22}); G.mount.rotation.y=M.arcC||0; useGun(t,G); t.turretBase=0;
  collider(root,2.05,1.95,6.0,0,1.0,.2,t,'hull'); collider(root,.5,.7,1.2,.95,1.3,1.5,t,'turret');
  t.hTop=1.95; t.topH=2.6; t.aimH=1.2; t.glL=1.0;
  t.seatPos={driver:V3(-.45,1.45,1.3),gunner:V3(.7,1.3,1.4),loader:V3(.45,1.2,.8),mg1:V3(-.8,1.3,-.1),mg2:V3(.8,1.3,-.3),mech1:V3(0,1.2,-1.3),
    engine:V3(-.3,1.0,.6),trans:V3(0,.8,-1.7),ammo:V3(.3,1.0,-.6),breech:V3(.85,1.3,1.75)};
}

// Saint-Chamond: casco larguísimo, 75 mm en la proa y dos cúpulas
function buildStChamond(t,M,mat,root,lkL,lkR){
  const prof=[[2.0,.72],[-2.1,.72],[-2.45,.38],[-2.1,0],[1.9,0],[2.35,.38]];
  for(const s of [-1,1]){ trackLoop(root,prof,.42,s*1.0,s>0?lkR:lkL,sideTrkMat,.1); for(let i=0;i<7;i++) wheel(root,s*1.0,.18,-1.7+i*.56,.15); }
  profMesh(root,[[3.6,1.85],[-3.7,1.85],[-4.4,1.3],[-4.4,.75],[-3.6,.5],[3.7,.5],[4.45,.8],[4.45,1.4]],2.62,0,mat);
  for(const s of [-1,1]){ rivetsRow(root,s*1.32,1.72,-3.6,3.5,18); rivetsRow(root,s*1.32,.62,-3.5,3.6,18);
    const h=cyl(root,.1,.1,.12,s*1.33,1.2,s>0?.0:2.4,8,darkMat); h.rotation.z=Math.PI/2; }
  // cúpulas: conductor adelante a la izquierda, comandante atrás a la derecha
  cyl(root,.32,.34,.42,-.65,2.05,3.1,8,mat); slits(root,2,-.65,2.12,3.42,0,.12);
  cyl(root,.32,.34,.42,.65,2.05,-3.2,8,mat);
  box(root,1.2,.06,1.2,0,1.88,0,darkMat);                                        // rejilla del generador
  const G=gunMount(t,root,0,1.12,4.42,M.gl,M.gr,mat,{shR:.26}); useGun(t,G);
  collider(root,2.67,1.85,8.9,0,1.15,0,t,'hull'); collider(root,1.0,.9,.6,0,1.12,4.2,t,'turret');
  t.hTop=1.85; t.topH=2.45; t.aimH=1.2; t.glL=.6;
  t.seatPos={driver:V3(-.65,1.6,3.1),commander:V3(.65,1.6,-3.2),gunner:V3(0,1.15,3.8),loader:V3(.45,1.05,3.2),mg1:V3(-1.05,1.2,2.4),mg2:V3(1.05,1.2,0),mg3:V3(0,1.2,-3.6),
    mech1:V3(-.3,1.0,.6),mech2:V3(.3,1.0,-1.0),engine:V3(0,1.0,.4),trans:V3(0,.8,-.9),ammo:V3(0,1.0,2.4),breech:V3(0,1.12,4.0)};
}

// Whippet (y LK II): orugas largas y bajas, motor adelante, casamata atrás
function buildWhippet(t,M,mat,root,lkL,lkR,lk){
  const prof=lk?[[1.9,.95],[-2.2,.95],[-2.5,.5],[-2.15,0],[1.7,0],[2.4,.5]]:[[2.6,1.15],[-2.7,1.15],[-3.05,.7],[-2.6,0],[2.4,0],[3.05,.65]];
  const tx=lk?.78:1.06;
  for(const s of [-1,1]){ trackLoop(root,prof,lk?.38:.5,s*tx,s>0?lkR:lkL,sideTrkMat,.1);
    if(!lk) profMesh(root,insetPoly(chaikin(prof,2),.14),.46,s*tx,mat); else box(root,.05,.55,4.3,s*(tx+.24),.75,-.1,mat);   // bastidor / faldón
    for(let i=0;i<6;i++) wheel(root,s*tx,.2,-1.9+i*.72,.15); }
  const hw=lk?.65:.78;
  // capó del motor con rejillas y tanque de combustible adelante
  profMesh(root,[[2.45,1.15],[.2,1.35],[.2,.5],[2.6,.5]],hw*2,0,mat);
  for(let i=0;i<5;i++) box(root,hw*1.6,.04,.08,0,1.2+i*.03,1.9-i*.32,darkMat);
  // casamata (pelea) atrás
  const z0=lk?-.2:-.5, z1=lk?-2.4:-2.6, H=lk?2.25:2.6;
  profMesh(root,[[z0,H],[z1,H],[z1,.5],[z0+.25,.5],[z0+.25,1.3]],lk?1.7:2.0,0,mat);
  for(const s of [-1,1]) slits(root,2,s*(lk?.86:1.01),H-.45,(z0+z1)/2,Math.PI/2,.22);
  slits(root,2,0,H-.45,z0+.02,0,.2);
  // el arma asoma por la casamata y gira alrededor de su centro (cuatro troneras en el Whippet)
  const tur=new THREE.Group(); tur.position.set(0,H-.75,(z0+z1)/2); root.add(tur);
  const R=(z0-z1)/2+.02, G=gunMount(t,tur,0,0,R,M.gl,M.gr,mat,{jacket:!lk,shR:lk?.22:.14});
  t.turret=tur; t.gunPivot=G.gp; t.barrel=G.barrel; t.muzzle=G.muzzle; t.coax=G.coax; t.barrelMesh=G.bm;
  collider(root,M.W,1.2,M.L,0,.75,0,t,'hull'); collider(root,lk?1.7:2.0,H-.5,z0-z1,0,(H+.5)/2,(z0+z1)/2,t,'turret');
  if(lk){ for(const s of [-1,1]) ironCross(root,s*(hw+.01),.95,1.3,0,.7); }
  t.hTop=H; t.topH=H+.4; t.aimH=1.3; t.glL=1.2;
  const zc=(z0+z1)/2;
  t.seatPos={driver:V3(-.4,1.7,z0-.4),commander:V3(.4,1.8,zc-.4),gunner:V3(0,1.6,zc),mg1:V3(.5,1.6,z1+.4),engine:V3(0,.9,1.4),trans:V3(0,.75,.3),ammo:V3(0,1.0,zc-.4),breech:V3(0,H-.75,zc+R*.7)};
}

// Cañón de campaña con escudo, ruedas de rayos, cureña y servidores
const spokeMat=new THREE.MeshLambertMaterial({color:0x5a4630});
function buildFieldGun(t,M,mat,root){
  for(const s of [-1,1]){ const w=new THREE.Group(); w.position.set(s*.82,.7,0); root.add(w);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.66,.05,6,22),spokeMat); rim.rotation.y=Math.PI/2; w.add(rim);
    for(let i=0;i<12;i++){ const sp=box(w,.04,1.28,.04,0,0,0,spokeMat); sp.rotation.x=i/12*Math.PI; }
    cyl(w,.1,.1,.18,0,0,0,8,darkMat).rotation.z=Math.PI/2; }
  cyl(root,.06,.06,1.7,0,.7,0,6,darkMat).rotation.z=Math.PI/2;                     // eje
  const tr=box(root,.22,.16,3.0,0,.42,-1.5,mat); tr.rotation.x=-.24; box(root,.6,.3,.08,0,.08,-2.95,darkMat);   // cureña y pala
  const tur=new THREE.Group(); tur.position.set(0,.7,0); root.add(tur);
  const sh=box(tur,1.7,1.15,.04,0,.45,.32,mat); sh.rotation.x=-.08; box(tur,.5,.4,.04,0,-.25,.34,mat);
  const G=gunMount(t,tur,0,.38,.0,M.gl,M.gr,mat,{shield:false}); cyl(G.gp,.11,.11,1.1,0,-.12,-.05,8,darkMat).rotation.x=Math.PI/2;   // recuperador
  t.turret=tur; t.gunPivot=G.gp; t.barrel=G.barrel; t.muzzle=G.muzzle; t.coax=G.coax; t.barrelMesh=G.bm;
  collider(tur,1.7,1.2,.25,0,.45,.32,t,'turret'); collider(root,1.8,1.0,3.2,0,.6,-1.2,t,'hull');
  // servidores (decorado: se borran cuando destruyen el cañón)
  t.deco=[];
  for(const [x,z,ry] of [[-.55,-.7,0],[.6,-.9,.3],[-.9,-1.7,-.4],[.4,-2.1,.2]]){ const P=personMesh({kind:'rifle',team:t.team,nat:(t.crew&&t.crew.nation)||t.T.nation});
    P.g.position.set(x,0,z); P.g.rotation.y=ry; if(P.parts.wep) P.parts.wep.visible=false; P.parts.hip.position.y=.62; P.parts.legL.rotation.x=-1.2; P.parts.legR.rotation.x=-.2; root.add(P.g); t.deco.push(P.g); }
  t.hTop=1.0; t.topH=1.7; t.aimH=.9; t.glL=.3;
  t.seatPos={gunner:V3(-.45,.9,-.6),loader:V3(.5,.9,-.8),commander:V3(-.85,1.0,-1.6),driver:V3(.75,1.0,-1.9),mg1:V3(0,.9,-2.2),ammo:V3(1.1,.5,-1.2),engine:V3(0,.4,-2.6),trans:V3(0,.4,-2.0),breech:V3(0,1.05,-.25)};
}

// ---- Cascos de la Primera Guerra para la infantería ----
const _helmG={}; const _helmM={brodie:new THREE.MeshLambertMaterial({color:0x5b5a40}),adrian:new THREE.MeshLambertMaterial({color:0x66778a}),stahl:new THREE.MeshLambertMaterial({color:0x5a5d4b})};
function eraHelmet(head,style,female,hairC){
  const G=_helmG[style]||(_helmG[style]=(()=>{ const L=[];
    if(style==='brodie'){ const d=new THREE.SphereGeometry(.135,10,6,0,Math.PI*2,0,1.2); d.scale(1,.62,1.05); d.translate(0,.045,0); L.push(d);
      const b=new THREE.CylinderGeometry(.215,.215,.012,14); b.translate(0,.045,0); L.push(b); }
    else if(style==='adrian'){ const d=new THREE.SphereGeometry(.14,10,6,0,Math.PI*2,0,1.35); d.translate(0,.04,0); L.push(d);
      const c=new THREE.BoxGeometry(.03,.05,.22); c.translate(0,.18,0); L.push(c);
      const b=new THREE.CylinderGeometry(.17,.17,.01,14); b.scale(.9,1,1.25); b.translate(0,.035,0); L.push(b); }
    else { const d=new THREE.SphereGeometry(.15,10,7,0,Math.PI*2,0,1.62); d.translate(0,.035,-.005); L.push(d);
      const s=new THREE.CylinderGeometry(.152,.18,.06,14,1,true); s.translate(0,-.01,-.012); L.push(s); }
    return L; })());
  for(const g of G){ const m=new THREE.Mesh(g,_helmM[style]); head.add(m); }
}
