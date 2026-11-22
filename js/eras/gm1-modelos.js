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
  else if(mode==='w2de'){ // 2ª Guerra: Dunkelgelb con franjas onduladas Olivgrün y Rotbraun (rociadas: bordes suaves)
    for(let i=0;i<9;i++){ const c=cols[1+(i%2)], y0=Math.random()*s, a=rand(-.5,.5), w=rand(10,22);
      x.strokeStyle=c; x.lineCap='round'; x.lineJoin='round';
      for(const [lw,al] of [[w*1.9,.25],[w,.9]]){ x.globalAlpha=al; x.lineWidth=lw; x.beginPath();
        for(let k=0;k<=24;k++){ const X=-20+k*(s+40)/24, Y=y0+(X-s/2)*Math.tan(a)+Math.sin(k*.9+i)*rand(8,16); k?x.lineTo(X,Y):x.moveTo(X,Y); } x.stroke(); } }
    x.globalAlpha=1; }
  else if(mode==='de'){ // A7V: gris con manchas ocre y verdes
    for(let i=0;i<30;i++){ x.fillStyle=cols[1+(i%(cols.length-1))]; x.globalAlpha=rand(.7,.95); x.beginPath(); const cx=Math.random()*s, cy=Math.random()*s;
      for(let j=0;j<9;j++){ const a=j/9*Math.PI*2, r=rand(18,60); x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r*.6); } x.fill(); } x.globalAlpha=1; }
  else { for(let i=0;i<40;i++){ x.globalAlpha=rand(.03,.08); x.fillStyle=Math.random()<.5?cols[1]:cols[2]; x.fillRect(Math.random()*s,Math.random()*s,rand(20,90),rand(10,60)); } x.globalAlpha=1; }
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
const WW1_TYPES={rhombo:1,ft:1,a7v:1,schneider:1,stchamond:1,whippet:1,lk2:1};
function ww1Tracks(t,type){ // materiales de oruga con eslabones que se desplazan (los dos costados avanzan igual)
  const lt=()=>{ if(!WW1_TYPES[type]) return linkTex(); const x=new THREE.CanvasTexture(ww1LinkCanvas); x.wrapS=x.wrapT=THREE.RepeatWrapping; x.anisotropy=4; return x; };
  const mk=()=>new THREE.MeshStandardMaterial({map:lt(),roughness:.85,metalness:.4,side:THREE.DoubleSide});
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
// ---- Detalles (2.ª tanda, 16/11/2026, referencias de Sketchfab, hecho por código) ----
// Oruga de la 1ª Guerra: tejas anchas de ~30 cm con nervio, remaches y barro (la de siempre tenía eslabones de 60 cm)
const ww1LinkCanvas=(()=>{ const c=document.createElement('canvas'); c.width=256; c.height=48; const x=c.getContext('2d');
  x.fillStyle='#161512'; x.fillRect(0,0,256,48);
  for(let i=0;i<8;i++){ const X=i*32, g=x.createLinearGradient(X,0,X+32,0);
    g.addColorStop(0,'#2b2823'); g.addColorStop(.18,'#5b564c'); g.addColorStop(.5,'#4a463e'); g.addColorStop(.85,'#38352f'); g.addColorStop(1,'#201e1a');
    x.fillStyle=g; x.fillRect(X+1,2,29,44);
    x.fillStyle='#716b60'; x.fillRect(X+12,2,3,44); x.fillStyle='#1c1a17'; x.fillRect(X+15,2,2,44);      // nervio
    x.fillStyle='#1e1c19'; for(const y of [7,19,29,41]){ x.beginPath(); x.arc(X+5,y,1.7,0,7); x.fill(); x.beginPath(); x.arc(X+25,y,1.7,0,7); x.fill(); }
    x.globalAlpha=.4; x.fillStyle=i%2?'#5a4a33':'#4a3c2a'; x.fillRect(X+1,(i*13)%30,29,10+(i*7)%12); x.globalAlpha=1;
    x.fillStyle='#0b0a09'; x.fillRect(X+30,0,2,48); }
  x.fillStyle='#0e0d0b'; x.fillRect(0,0,256,2); x.fillRect(0,46,256,2); return c; })();
// Remaches siguiendo una línea (z,y) sobre el plano x (cerrada si closed)
function rivetsAlong(parent,P,x,step,mat,closed=true){ const Q=closed?P.concat([P[0]]):P; let L=0; const S=[0];
  for(let i=1;i<Q.length;i++){ L+=Math.hypot(Q[i][0]-Q[i-1][0],Q[i][1]-Q[i-1][1]); S.push(L); }
  const n=Math.max(2,Math.round(L/step)); let i=1;
  for(let k=0;k<n;k++){ const s=L*k/n; while(i<S.length-1&&S[i]<s) i++; const f=(s-S[i-1])/((S[i]-S[i-1])||1);
    const r=cyl(parent,.022,.026,.035,x,Q[i-1][1]+(Q[i][1]-Q[i-1][1])*f,Q[i-1][0]+(Q[i][0]-Q[i-1][0])*f,5,mat); r.rotation.z=Math.PI/2; } }
// Remaches en una línea recta en el espacio (para techos y frentes); axis = eje de la cabeza ('x','y','z')
function rivetsLine(parent,a,b,n,axis,mat){ for(let k=0;k<n;k++){ const f=n>1?k/(n-1):.5;
  const r=cyl(parent,.022,.026,.035,a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f,5,mat);
  if(axis==='x') r.rotation.z=Math.PI/2; else if(axis==='z') r.rotation.x=Math.PI/2; } }
// Rótula de ametralladora con camisa de enfriamiento (local +z = hacia afuera)
function ballMG(parent,x,y,z,ry,mat,jk=true){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; parent.add(g);
  const ring=cyl(g,.15,.16,.05,0,0,0,12,mat); ring.rotation.x=Math.PI/2;
  const b=new THREE.Mesh(new THREE.SphereGeometry(.11,10,8),mat); b.scale.z=.7; b.position.z=.03; b.castShadow=true; g.add(b);
  const br=cyl(g,.02,.02,.42,0,0,.3,6,darkMat); br.rotation.x=Math.PI/2;
  if(jk){ const j=cyl(g,.048,.048,.3,0,0,.24,8,darkMat); j.rotation.x=Math.PI/2; } return g; }
// Visera del conductor/comandante: chapa abisagrada arriba con su ranura
function visor(parent,x,y,z,ry,w,h,mat,open=.18){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; parent.add(g);
  box(g,w+.06,h+.06,.025,0,0,-.01,darkMat);
  const f=new THREE.Group(); f.position.set(0,h/2,0); f.rotation.x=-open; g.add(f); box(f,w,h,.04,0,-h/2,.025,mat);
  box(f,w*.7,.03,.02,0,-h*.45,.05,darkMat); cyl(g,.025,.025,w*.9,0,h/2,.02,6,mat).rotation.z=Math.PI/2; return g; }
// Puerta con bisagras y manija (local +z = hacia afuera)
function hDoor(parent,x,y,z,ry,w,h,mat){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; parent.add(g);
  box(g,w,h,.04,0,0,.02,mat); box(g,w+.04,h+.04,.015,0,0,0,darkMat);
  for(const yy of [h*.32,-h*.32]){ const hg=cyl(g,.03,.03,.12,-w/2,yy,.04,6,mat); }
  box(g,.12,.025,.03,w*.3,0,.06,darkMat); rivetsLine(g,[-w/2+.05,h/2-.05,.045],[w/2-.05,h/2-.05,.045],Math.max(2,Math.round(w/.12)),'z',mat);
  rivetsLine(g,[-w/2+.05,-h/2+.05,.045],[w/2-.05,-h/2+.05,.045],Math.max(2,Math.round(w/.12)),'z',mat); return g; }
// Rejilla de persianas (sobre un techo, centrada en x,y,z)
function louvres(parent,w,d,n,x,y,z,mat,ry=0){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; parent.add(g);
  box(g,w+.08,.05,d+.08,0,0,0,mat); box(g,w,.02,d,0,.03,0,darkMat);
  for(let i=0;i<n;i++){ const s=box(g,w-.04,.015,d/n*.85,0,.05,-d/2+(i+.5)*d/n,mat); s.rotation.x=.55; } return g; }
// Rueda de rayos (eje x)
function spokeWheelX(parent,x,y,z,r,n,mat,w=.12){ const g=new THREE.Group(); g.position.set(x,y,z); parent.add(g);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(r*.93,r*.08,6,24),mat); rim.rotation.y=Math.PI/2; rim.scale.z=w/(r*.16); rim.castShadow=true; g.add(rim);
  const tire=new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,24,1,true),mat); tire.rotation.z=Math.PI/2; g.add(tire);
  for(let i=0;i<n;i++){ const sp=box(g,w*.5,r*1.75,.05,0,0,0,mat); sp.rotation.x=i/n*Math.PI; }
  const hub=cyl(g,r*.2,r*.2,w+.08,0,0,0,10,mat); hub.rotation.z=Math.PI/2; return g; }
// Riel tubular por una lista de puntos (x,y,z)
function tubeRail(parent,pts,r,mat){ const cv=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)),false,'catmullrom',.1);
  const m=new THREE.Mesh(new THREE.TubeGeometry(cv,Math.max(8,pts.length*6),r,6,false),mat); m.castShadow=true; parent.add(m); return m; }
// Gancho de remolque (local +z afuera)
function towHook(parent,x,y,z,ry,mat){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; parent.add(g);
  box(g,.1,.16,.08,0,0,.04,mat); const t=new THREE.Mesh(new THREE.TorusGeometry(.07,.02,5,10,Math.PI*1.4),darkMat); t.position.z=.12; t.rotation.y=Math.PI/2; g.add(t); return g; }
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
  const root=t.root, [lkL,lkR]=M.ww1==='gun'||M.ww1==='aa'?[null,null]:ww1Tracks(t,M.ww1), type=M.ww1;
  t.ant=null; t.ww1=type;
  if(type==='rhombo') return buildRhombo(t,M,mat,root,lkL,lkR);
  if(type==='ft') return buildFT(t,M,mat,root,lkL,lkR);
  if(type==='a7v') return buildA7V(t,M,mat,root,lkL,lkR);
  if(type==='schneider') return buildSchneider(t,M,mat,root,lkL,lkR);
  if(type==='stchamond') return buildStChamond(t,M,mat,root,lkL,lkR);
  if(type==='whippet'||type==='lk2') return buildWhippet(t,M,mat,root,lkL,lkR,type==='lk2');
  if(type==='gun') return buildFieldGun(t,M,mat,root);
  if(type==='iw') return buildIW(t,M,mat,root,lkL,lkR); // Entreguerras (gm2-modelos.js)
  if(type==='w2') return buildW2(t,M,mat,root,lkL,lkR); // Segunda Guerra (gm3-modelos.js)
  if(type==='ht') return buildHT(t,M,mat,root,lkL,lkR); // semioruga
  if(type==='aa') return buildAA(t,M,mat,root);            // antiaéreo
}

// Mark I, Mark IV (macho y hembra), Mark V y el Beutepanzer
// 2.ª tanda (16/11/2026, referencias de Sketchfab): bastidores con dos hileras de remaches y juntas, cabina con viseras y ametralladora,
// barbetas con remaches, puerta y Hotchkiss/Lewis atrás, rieles de la viga sobre las orugas, persianas del radiador, cola de rayos del Mark I.
function buildRhombo(t,M,mat,root,lkL,lkR){
  const v=M.var, fem=v==='mk4f', mk1=v==='mk1', mk5=v==='mk5', beute=v==='beute', hw=M.W/2;
  // perfil de la oruga (antihorario desde arriba adelante): el romboide clásico
  const prof=[[2.75,2.45],[-3.35,2.45],[-3.85,2.2],[-4.02,1.55],[-3.8,.95],[-3.15,.22],[-2.55,0],[1.95,0],[2.65,.38],[3.6,1.15],[4.02,1.62],[3.85,2.15]];
  const sm=chaikin(prof,2), fr=insetPoly(sm,.16);
  for(const s of [-1,1]){ const x=s*(hw-.28), xo=s*(hw-.01);
    profMesh(root,fr,.5,x,mat);                               // bastidor lateral (los "cuernos")
    trackLoop(root,prof,.54,x,s>0?lkR:lkL,sideTrkMat,.12);       // oruga alrededor de todo el casco
    rivetsAlong(root,insetPoly(sm,.25),xo,.21,mat);              // borde del bastidor
    rivetsAlong(root,insetPoly(sm,.6),xo,.3,mat);                // segunda hilera (refuerzo interior)
    for(const [z,y0,y1] of [[-3.05,.75,2.1],[-1.8,.42,2.12],[2.3,.5,2.12],[3.5,1.15,1.95]]){   // juntas verticales de las chapas
      box(root,.02,y1-y0,.08,xo+s*.01,(y0+y1)/2,z,mat); rivetsLine(root,[xo+s*.025,y0+.05,z],[xo+s*.025,y1-.05,z],Math.round((y1-y0)/.16),'x',mat); }
    for(let i=0;i<4;i++) wheel(root,s*(hw-.28),.32,-1.8+i*1.15,.18);   // rodillos tensores asomando por los costados
  }
  // casco central, techo con remaches, escotilla y persianas
  const cw=M.W-1.08; box(root,cw,1.75,6.2,0,1.35,-.35,mat);
  for(const s of [-1,1]) rivetsLine(root,[s*(cw/2-.06),2.235,-3.3],[s*(cw/2-.06),2.235,2.5],26,'y',mat);
  box(root,.7,.06,.62,0,2.26,-.55,mat); box(root,.12,.04,.04,0,2.31,-.55,darkMat);
  if(!mk1) louvres(root,cw-.25,.75,6,0,2.25,-2.75,mat);
  // cabina adelante: viseras del conductor y del jefe, ametralladora en el medio (salvo el Mark I) y escotilla
  const cab=new THREE.Group(); cab.position.set(0,0,2.45); root.add(cab);
  profMesh(cab,[[.45,2.55],[-.55,2.55],[-.55,1.35],[.45,1.35],[.62,1.7]],1.5,0,mat);
  for(const sx of [-.42,.42]){ const vz=visor(cab,sx,2.12,.54,0,.36,.26,mat); vz.rotation.x=-.2; }
  if(!mk1){ const b=ballMG(cab,0,2.05,.57,0,mat); b.rotation.x=-.2; } else slits(cab,1,0,2.15,.55,0,.16);
  rivetsLine(cab,[-.7,2.56,.4],[.7,2.56,.4],10,'y',mat); rivetsLine(cab,[-.7,2.56,-.5],[.7,2.56,-.5],10,'y',mat);
  box(cab,.55,.05,.42,0,2.58,-.08,mat); box(cab,.1,.03,.03,0,2.62,-.08,darkMat);
  towHook(root,-.42,.95,3.0,0,mat); towHook(root,.42,.95,3.0,0,mat);
  cyl(root,.09,.09,1.6,.3,2.45,-2.1,8,darkMat).rotation.x=Math.PI/2;            // caño de escape
  if(!mk1) cyl(root,.18,.18,.7,.3,2.5,-1.0,10,darkMat).rotation.x=Math.PI/2;    // silenciador (el Mark I largaba el escape abierto)
  else cyl(root,.11,.09,.5,.3,2.55,-.9,8,darkMat);
  if(!mk1){ // tanque de combustible blindado atrás, rieles de la viga sobre las orugas y la viga de desatasco
    box(root,1.0,.7,.55,0,1.25,-3.65,mat); rivetsLine(root,[-.45,1.57,-3.93],[.45,1.57,-3.93],7,'z',mat); rivetsLine(root,[-.45,.93,-3.93],[.45,.93,-3.93],7,'z',mat);
    const rx=hw-.42;
    for(const s of [-1,1]){ const x=s*rx;
      tubeRail(root,[[x,2.6,-3.55],[x,2.7,-2.6],[x,2.72,0],[x,2.7,2.3],[x,2.55,3.1],[x,2.3,3.55]],.045,darkMat);
      for(const z of [-3.1,-1.4,.4,2.1]) box(root,.06,.22,.06,x,2.58,z,darkMat); }
    const beam=cyl(root,.17,.17,2*rx+.25,0,2.9,-2.6,10,new THREE.MeshLambertMaterial({color:0x5a4630})); beam.rotation.z=Math.PI/2;
    for(const s of [-1,1]){ box(root,.05,.36,.05,s*(rx-.25),2.9,-2.6,darkMat); const ch=box(root,.04,.04,.9,s*(rx+.05),2.72,-2.2,darkMat); ch.rotation.x=.5; } }
  else { // Mark I: cola de dos ruedas de rayos para ayudar a girar y techo de malla contra granadas
    const tail=new THREE.Group(); tail.position.set(0,0,-4.0); root.add(tail);
    box(tail,.12,.12,1.6,-.6,.8,-.6,darkMat); box(tail,.12,.12,1.6,.6,.8,-.6,darkMat); box(tail,1.3,.1,.1,0,.75,-1.3,darkMat);
    box(tail,1.3,.1,.1,0,.8,-.8,darkMat); { const ps=cyl(tail,.06,.06,1.18,0,1.29,-.375,6,darkMat); ps.rotation.x=.8; }   // pistón hidráulico: del travesaño de la cola a la popa (antes flotaba)
    for(const s of [-1,1]) spokeWheelX(tail,s*.6,.62,-1.3,.62,12,darkMat,.14);
    const wire=new THREE.MeshBasicMaterial({color:0x3a3a34,wireframe:true});
    for(const sd of [-1,1]){ const gR=new THREE.Group(); gR.position.set(0,2.95,.4); gR.rotation.z=-sd*.55; root.add(gR); const roof=new THREE.Mesh(new THREE.PlaneGeometry(1.0,3.6,3,9),wire); roof.rotation.x=-Math.PI/2; roof.position.x=sd*.5; gR.add(roof); }
    for(const z of [-1.3,.4,2.1]) for(const s of [-1,1]){ const p=box(root,.05,.75,.05,s*.55,2.55,z,darkMat); p.rotation.z=-s*.5; } }
  if(mk5){ // cúpula de observación atrás con escotilla
    box(root,1.1,.55,1.0,0,2.75,-1.3,mat); slits(root,2,0,2.85,-.79,0,.2); for(const s of [-1,1]) slits(root,1,s*.56,2.85,-1.3,Math.PI/2,.22);
    box(root,.7,.05,.6,0,3.05,-1.35,mat); rivetsLine(root,[-.5,3.03,-.83],[.5,3.03,-.83],7,'y',mat); }
  if(v==='mk4'||mk5){ wrw(root,hw+.01,1.6,3.0,0); wrw(root,-hw-.01,1.6,3.0,Math.PI); }
  if(beute){ for(const s of [-1,1]) ironCross(root,s*(hw+.01),1.5,-1.6,0,1.1); ironCross(root,0,2.25,3.25,Math.PI/2,.8); }
  // barbetas
  const spW=M.spW, S={};
  for(const s of [-1,1]){ const g=new THREE.Group(); g.position.set(s*hw,0,.55); root.add(g);
    const plan=fem?[[-.75,0],[.75,0],[.42,s*spW],[-.42,s*spW]]:[[-1.0,0],[1.0,0],[.55,s*spW],[-.6,s*spW]];
    const y0=fem?.82:.75, h=fem?.95:1.0;
    planMesh(g,plan,h,y0,mat);
    // remaches arriba y abajo en las caras de afuera, y una hilera en cada esquina
    for(let i=1;i<plan.length;i++){ const a=plan[i], b=plan[(i+1)%plan.length]; if(i===plan.length-1&&Math.abs(b[1])<.01&&Math.abs(a[1])<.01) continue;
      const n=Math.max(2,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/.15));
      rivetsLine(g,[a[1],y0+h+.03,a[0]],[b[1],y0+h+.03,b[0]],n,'y',mat); }
    for(const p of plan.slice(2)) rivetsLine(g,[p[1]*1.01,y0+.1,p[0]],[p[1]*1.01,y0+h-.1,p[0]],5,'x',mat);
    // cara de atrás: puerta y ametralladora (Hotchkiss en el macho, la segunda Lewis en la hembra)
    const A=plan[3], B=plan[0], cz=(A[0]+B[0])/2, cx=(A[1]+B[1])/2;
    const dz=A[0]-B[0], dx=A[1]-B[1]; let nz=-dx, nx=dz; if(nz>0){ nz=-nz; nx=-nx; } const nl=Math.hypot(nz,nx); nz/=nl; nx/=nl; const ry=Math.atan2(nx,nz);
    hDoor(g,cx+nx*.02,y0+h*.42,cz+nz*.02,ry,fem?.36:.42,h*.62,mat);
    const fM=.72, mx=B[1]+(A[1]-B[1])*fM, mz=B[0]+(A[0]-B[0])*fM; ballMG(g,mx+nx*.02,y0+h*.78,mz+nz*.02,ry,mat,true);
    collider(g,spW,1.0,fem?1.5:2.0,s*spW/2,1.25,0,t,'turret');
    const G=gunMount(t,g,s*(spW-.08),1.3,fem?.15:.42,M.gl,M.gr,mat,{jacket:fem,shR:fem?.16:.28});
    G.mount.rotation.y=s*.55; S[s]=G; }
  t.sponsons=S; t.spSide=1; useGun(t,S[1]);
  collider(root,M.W,2.45,8.0,0,1.22,0,t,'hull');
  t.hTop=2.45; t.topH=2.9; t.aimH=1.4; t.glL=1.2;
  t.seatPos={driver:V3(-.35,1.75,2.3),commander:V3(.35,1.75,2.3),
    gunner:(sd)=>V3(sd*(hw+.35),1.3,.75),loader:(sd)=>V3(sd*(hw-.2),1.2,.2),mg1:(sd)=>V3(-sd*(hw+.3),1.3,.6),mg2:V3(0,1.35,-1.6),mg3:V3(0,1.6,-1.2),
    gear1:V3(-.45,1.1,-2.6),gear2:V3(.45,1.1,-2.6),mech1:V3(0,1.1,-2.4),engine:V3(0,1.1,-.6),trans:V3(0,.85,-2.9),ammo:(sd)=>V3(sd*.45,1.0,1.0),ammo2:(sd)=>V3(-sd*.45,1.0,-.2),
    breech:(sd)=>V3(sd*(hw+.4),1.3,.95)};
}

// Renault FT: torre giratoria remachada, motor atrás, tensora grande de rayos adelante, viga del ballestón y cola
function buildFT(t,M,mat,root,lkL,lkR){
  const prof=[[1.75,1.22],[-1.6,.9],[-2.0,.68],[-2.08,.3],[-1.6,0],[1.25,0],[1.95,.32],[2.22,.78],[2.08,1.1]];
  const sl=Math.atan2(1.22-.9,1.75+1.6);
  for(const s of [-1,1]){ const x=s*.7, xo=s*.9;
    profMesh(root,insetPoly(chaikin(prof,2),.12),.08,s*.52,mat);            // bastidor interior
    trackLoop(root,prof,.32,x,s>0?lkR:lkL,sideTrkMat,.09);
    // viga de arriba (tapa el ballestón y apoya el tramo de retorno) con remaches
    const beam=box(root,.07,.26,3.3,xo,1.0,.0,mat); beam.rotation.x=-sl;
    const yb=z=>1.0+z*Math.tan(sl);
    rivetsLine(root,[xo+s*.04,yb(-1.55)+.08,-1.55],[xo+s*.04,yb(1.55)+.08,1.55],16,'x',mat);
    rivetsLine(root,[xo+s*.04,yb(-1.55)-.08,-1.55],[xo+s*.04,yb(1.55)-.08,1.55],16,'x',mat);
    // cajas de los bogies abajo, con los resortes a la vista
    box(root,.06,.24,2.7,xo,.36,-.3,mat); rivetsLine(root,[xo+s*.035,.44,-1.55],[xo+s*.035,.44,.95],12,'x',mat);
    for(const z of [-1.3,-.3,.7]){ cyl(root,.045,.045,.42,xo-s*.05,.68,z,6,darkMat); box(root,.08,.04,.16,xo-s*.05,.48,z,darkMat); }
    spokeWheelX(root,s*.7,.78,1.75,.42,10,mat,.2);                        // tensora grande de rayos
    spokeWheelX(root,s*.7,.58,-1.7,.3,8,darkMat,.2);                      // motriz atrás
    for(let i=0;i<5;i++) wheel(root,s*.82,.17,-1.2+i*.55,.14); }
  // casco: frente inclinado (escotillas del conductor), techo y caja del motor atrás
  profMesh(root,[[1.25,1.55],[-.6,1.55],[-1.9,1.12],[-2.0,.42],[1.2,.38],[1.75,.8]],1.04,0,mat);
  for(const s of [-1,1]){ rivetsLine(root,[s*.53,1.5,-.55],[s*.53,1.5,1.2],10,'x',mat); rivetsLine(root,[s*.53,.48,-1.9],[s*.53,.48,1.15],16,'x',mat);
    rivetsLine(root,[s*.53,.62,1.3],[s*.53,1.38,1.3],5,'x',mat); }
  // escotilla del conductor en tres piezas: tapa del frente con visor y dos puertas laterales
  const fh=visor(root,0,1.33,1.43,0,.44,.3,mat,.25); fh.rotation.x=-.75;
  for(const s of [-1,1]){ const d=box(root,.04,.32,.4,s*.3,1.42,1.32,mat); d.rotation.x=-.3; cyl(root,.02,.02,.4,s*.32,1.6,1.25,6,mat).rotation.x=Math.PI/2-.3; }
  rivetsLine(root,[-.45,.9,1.62],[.45,.9,1.62],7,'z',mat);
  // persianas del motor sobre la cubierta inclinada, silenciador a la izquierda y cola para cruzar trincheras
  const lv=louvres(root,.72,.85,6,0,1.38,-1.25,mat); lv.rotation.x=-.32;
  const sil=cyl(root,.09,.09,.75,-.6,1.15,-1.25,10,darkMat); sil.rotation.x=Math.PI/2; cyl(root,.04,.04,.4,-.6,1.2,-1.75,6,darkMat).rotation.x=Math.PI/2;
  for(const s of [-1,1]){ const r=box(root,.07,.07,1.0,s*.4,.55,-2.35,darkMat); r.rotation.x=-.35; } box(root,.9,.07,.07,0,.38,-2.8,darkMat);
  towHook(root,0,.6,-2.0,Math.PI,mat);
  // torre octogonal remachada con hongo de ventilación
  const tur=new THREE.Group(); tur.position.set(0,1.55,M.tz); root.add(tur);
  const oct=cyl(tur,.5,.56,.72,0,.36,0,8,mat); oct.rotation.y=Math.PI/8;
  const mush=new THREE.Mesh(new THREE.SphereGeometry(.2,10,6,0,Math.PI*2,0,Math.PI/2),mat); mush.position.y=.82; mush.scale.y=.6; tur.add(mush); cyl(tur,.12,.14,.1,0,.74,0,8,mat);
  for(let i=0;i<8;i++){ const fg=new THREE.Group(); fg.rotation.y=i*Math.PI/4; tur.add(fg);
    rivetsLine(fg,[-.16,.64,.472],[.16,.64,.472],3,'z',mat); rivetsLine(fg,[-.18,.1,.515],[.18,.1,.515],3,'z',mat);
    if(i===1||i===7||i===3||i===5) box(fg,.14,.03,.02,0,.5,.49,darkMat); }
  box(tur,.62,.04,.62,0,.72,0,mat);
  slits(tur,2,0,.55,.5,0,.14); box(tur,.4,.32,.05,0,.38,-.54,mat); cyl(tur,.02,.02,.3,-.2,.38,-.57,6,mat);   // escotilla trasera
  const G=gunMount(t,tur,0,.42,.5,M.gl,M.gr,mat,{shR:.17}); G.mount.position.set(0,.42,.48);
  box(tur,.34,.3,.06,0,.4,.5,mat);                                         // marco de la rótula
  // en el FT gira toda la torre: el grupo de la torre hace de "mount"
  t.turret=tur; t.gunPivot=G.gp; t.barrel=G.barrel; t.muzzle=G.muzzle; t.coax=G.coax; t.barrelMesh=G.bm;
  collider(tur,1.1,.8,1.1,0,.4,0,t,'turret'); collider(root,1.74,1.55,4.4,0,.78,0,t,'hull');
  t.hTop=1.55; t.topH=2.5; t.aimH=1.1; t.glL=.6;
  const tp=(x,y,z)=>(sd,T)=>{ const c=Math.cos(T.turretYaw), sn=Math.sin(T.turretYaw); return V3(x*c+z*sn,1.55+y,M.tz-x*sn+z*c); };
  t.seatPos={driver:V3(0,.95,1.2),gunner:tp(0,.25,0),engine:V3(0,.9,-1.25),trans:V3(0,.6,-1.7),ammo:V3(.3,.75,.35),breech:tp(0,.42,.3)};
}

// A7V: caja enorme sobre orugas bajas con faldones, 57 mm en la proa, 6 Maxim en rótulas, cúpula de mando y persianas de los motores
function buildA7V(t,M,mat,root,lkL,lkR){
  const prof=[[2.6,.85],[-2.6,.85],[-3.02,.45],[-2.7,0],[2.7,0],[3.02,.45]];
  for(const s of [-1,1]){ trackLoop(root,prof,.5,s*1.05,s>0?lkR:lkL,sideTrkMat,.1); for(let i=0;i<8;i++) wheel(root,s*1.05,.2,-2.3+i*.66,.16); }
  const body=[[2.9,2.55],[-2.9,2.55],[-3.67,2.0],[-3.67,1.25],[-3.05,.55],[3.05,.55],[3.67,1.25],[3.67,2.0]];
  profMesh(root,body,3.06,0,mat);
  for(const s of [-1,1]){ const xo=s*1.545;
    rivetsAlong(root,insetPoly(body,.07),xo,.22,mat); rivetsRow(root,s*1.54,1.6,-3.4,3.4,18);
    for(const z of [-2.4,-1.3,2.3]){ box(root,.02,1.75,.08,xo+s*.01,1.55,z,mat); rivetsLine(root,[xo+s*.03,.75,z],[xo+s*.03,2.4,z],10,'x',mat); }
    // faldón bajo que tapa la mitad de la oruga
    box(root,.06,.34,6.1,s*1.5,.42,0,mat); rivetsLine(root,[s*1.535,.5,-2.9],[s*1.535,.5,2.9],22,'x',mat);
    for(const z of [1.8,-1.6]) ballMG(root,s*1.56,1.7,z,s*Math.PI/2,mat);      // dos Maxim por costado
    hDoor(root,xo+s*.02,1.32,-.55,s*Math.PI/2,.62,.85,mat);                    // puerta lateral
    ironCross(root,s*1.57,1.6,.9,0,1.15);
    towHook(root,s*.95,.85,3.15,0,mat); towHook(root,s*.95,.85,-3.15,Math.PI,mat); }
  for(const x of [-.7,.7]) ballMG(root,x,1.7,-3.69,Math.PI,mat);                 // dos Maxim atrás
  ironCross(root,0,2.2,3.5,Math.PI/2,.8);
  rivetsLine(root,[-1.4,2.0,3.69],[1.4,2.0,3.69],12,'z',mat); rivetsLine(root,[-1.4,1.27,3.69],[1.4,1.27,3.69],12,'z',mat);
  // cúpula del conductor y del comandante, con viseras y escotillas
  const cup=new THREE.Group(); cup.position.set(0,2.55,.3); root.add(cup);
  profMesh(cup,[[.85,.65],[-.85,.65],[-.95,0],[.95,0]],1.6,0,mat); slits(cup,3,0,.45,.9,0,.2); slits(cup,3,0,.45,-.9,0,.2);
  for(const s of [-1,1]) slits(cup,2,s*.81,.45,0,Math.PI/2,.25);
  for(const sx of [-.45,.45]){ const vz=visor(cup,sx,.36,.93,0,.3,.18,mat,.3); vz.rotation.x=-.1; }
  for(const sx of [-.4,.4]){ box(cup,.55,.05,.6,sx,.68,-.15,mat); box(cup,.1,.03,.03,sx,.72,-.15,darkMat); }
  rivetsLine(cup,[-.75,.66,.82],[.75,.66,.82],8,'y',mat); rivetsLine(cup,[-.75,.66,-.82],[.75,.66,-.82],8,'y',mat);
  louvres(root,1.3,.7,7,0,2.58,-2.2,mat); louvres(root,1.3,.6,6,0,2.58,1.95,mat);   // persianas de los dos Daimler
  for(const s of [-1,1]) for(const z of [-2.7,2.7]){ const e=new THREE.Mesh(new THREE.TorusGeometry(.07,.02,5,10),darkMat); e.position.set(s*1.3,2.62,z); root.add(e); }
  const G=gunMount(t,root,0,1.65,3.62,M.gl,M.gr,mat,{shR:.3}); useGun(t,G);
  box(root,.95,.08,.08,0,2.0,3.7,mat); box(root,.95,.08,.08,0,1.3,3.7,mat); for(const s of [-1,1]) box(root,.08,.7,.08,s*.47,1.65,3.7,mat);   // marco de la tronera
  collider(root,3.06,2.6,7.34,0,1.4,0,t,'hull'); collider(root,1.4,.9,.5,0,1.65,3.55,t,'turret');
  t.hTop=2.6; t.topH=3.4; t.aimH=1.6; t.glL=.6;
  t.seatPos={driver:V3(-.3,2.75,.3),commander:V3(.3,2.85,.4),gunner:V3(0,1.6,3.0),loader:V3(.45,1.4,2.6),mg1:V3(-1.25,1.6,1.8),mg2:V3(1.25,1.6,1.8),mg3:V3(-1.25,1.6,-1.6),mg4:V3(1.25,1.6,-1.6),
    mech1:V3(-.55,1.05,0),mech2:V3(.55,1.05,0),engine:V3(0,1.0,-.1),trans:V3(0,.8,-.7),ammo:V3(0,1.0,2.0),ammo2:V3(0,1.0,-2.1),breech:V3(0,1.65,3.25)};
}

// Schneider CA1: caja con proa cortaalambres, el 75 mm a la derecha, Hotchkiss en rótulas, puertas dobles atrás y cola
function buildSchneider(t,M,mat,root,lkL,lkR){
  const prof=[[1.6,.75],[-1.7,.75],[-2.0,.4],[-1.7,0],[1.5,0],[1.95,.4]];
  for(const s of [-1,1]){ trackLoop(root,prof,.36,s*.8,s>0?lkR:lkL,sideTrkMat,.09); for(let i=0;i<6;i++) wheel(root,s*.8,.17,-1.4+i*.55,.14); }
  const body=[[1.6,1.95],[-2.4,1.95],[-2.6,1.7],[-2.6,.55],[2.0,.45],[3.15,.72],[2.6,1.5]];
  profMesh(root,body,1.85,0,mat);
  // proa cortaalambres: filo abajo, nervio en la trompa y dos tirantes
  box(root,1.7,.06,.3,0,.72,3.0,darkMat).rotation.x=.25;
  const rib=box(root,.12,.95,.07,0,1.11,2.9,mat); rib.rotation.x=-.62;
  for(const s of [-1,1]){ const st=box(root,.05,.05,1.0,s*.5,.62,2.6,darkMat); st.rotation.x=-.25; st.rotation.y=-s*.2; }
  for(const s of [-1,1]){ const xo=s*.935; rivetsAlong(root,insetPoly(body,.07),xo,.22,mat);
    for(const z of [-1.4,.4]){ box(root,.02,1.3,.07,xo+s*.01,1.2,z,mat); rivetsLine(root,[xo+s*.025,.6,z],[xo+s*.025,1.85,z],8,'x',mat); }
    ballMG(root,s*.95,1.35,-.1,s*Math.PI/2,mat); }                        // Hotchkiss a los costados
  // cúpula del conductor (izquierda) y barbeta del 75 a la derecha
  box(root,.55,.4,.6,-.45,2.15,1.0,mat); slits(root,2,-.45,2.2,1.31,0,.12); box(root,.45,.04,.45,-.45,2.37,.95,mat);
  const vz=visor(root,-.45,2.12,1.31,0,.4,.18,mat,.25);
  planMesh(root,[[.9,.0],[2.1,.0],[2.1,.42],[.9,.42]].map(([z,x])=>[z,x+.75]),.7,.95,mat);
  rivetsLine(root,[1.18,1.68,.95],[1.18,1.68,2.05],7,'y',mat);
  // techo: ventilador y escotilla; atrás: puertas dobles, tanques de combustible y cola
  cyl(root,.2,.24,.14,.25,2.02,-.6,10,mat); const cap=new THREE.Mesh(new THREE.SphereGeometry(.2,10,5,0,Math.PI*2,0,Math.PI/2),mat); cap.position.set(.25,2.09,-.6); cap.scale.y=.5; root.add(cap);
  box(root,.55,.05,.5,-.3,1.98,-1.6,mat);
  for(const s of [-1,1]) hDoor(root,s*.31,1.15,-2.61,Math.PI,.56,.95,mat);
  for(const s of [-1,1]){ const ft=cyl(root,.17,.17,.55,s*.55,1.75,-2.75,10,mat); ft.rotation.x=Math.PI/2; box(root,.04,.04,.4,s*.55,1.93,-2.75,darkMat); }
  cyl(root,.05,.05,.9,-.75,1.0,-2.3,6,darkMat).rotation.x=Math.PI/2;
  for(const s of [-1,1]){ const r=box(root,.07,.07,.9,s*.5,.55,-2.95,darkMat); r.rotation.x=-.3; }   // cola
  box(root,1.1,.07,.07,0,.42,-3.35,darkMat);
  const G=gunMount(t,root,.95,1.3,2.1,M.gl,M.gr,mat,{shR:.22}); G.mount.rotation.y=M.arcC||0; useGun(t,G); t.turretBase=0;
  collider(root,2.05,1.95,6.0,0,1.0,.2,t,'hull'); collider(root,.5,.7,1.2,.95,1.3,1.5,t,'turret');
  t.hTop=1.95; t.topH=2.6; t.aimH=1.2; t.glL=1.0;
  t.seatPos={driver:V3(-.45,1.45,1.3),gunner:V3(.7,1.3,1.4),loader:V3(.45,1.2,.8),mg1:V3(-.8,1.3,-.1),mg2:V3(.8,1.3,-.3),mech1:V3(0,1.2,-1.3),
    engine:V3(-.3,1.0,.6),trans:V3(0,.8,-1.7),ammo:V3(.3,1.0,-.6),breech:V3(.85,1.3,1.75)};
}

// Saint-Chamond: casco larguísimo de techo a dos aguas, 75 mm en la proa, dos cúpulas, Hotchkiss en rótulas y puertas laterales
function buildStChamond(t,M,mat,root,lkL,lkR){
  const prof=[[2.0,.72],[-2.1,.72],[-2.45,.38],[-2.1,0],[1.9,0],[2.35,.38]];
  for(const s of [-1,1]){ trackLoop(root,prof,.42,s*1.0,s>0?lkR:lkL,sideTrkMat,.1); for(let i=0;i<7;i++) wheel(root,s*1.0,.18,-1.7+i*.56,.15);
    for(const z of [-1.4,0,1.4]){ box(root,.1,.22,.5,s*.82,.66,z,darkMat); cyl(root,.05,.05,.25,s*.82,.88,z,6,darkMat); } }
  const body=[[3.6,1.85],[-3.7,1.85],[-4.4,1.3],[-4.4,.75],[-3.6,.5],[3.7,.5],[4.45,.8],[4.45,1.4]];
  profMesh(root,body,2.62,0,mat);
  for(const s of [-1,1]){ const xo=s*1.32;
    rivetsAlong(root,insetPoly(body,.07),xo,.24,mat);
    for(const z of [-2.5,-.9,.9,2.6]){ box(root,.02,1.2,.08,xo+s*.01,1.17,z,mat); rivetsLine(root,[xo+s*.03,.6,z],[xo+s*.03,1.75,z],7,'x',mat); }
    const ed=box(root,.55,.05,7.1,s*1.08,1.86,0,mat); ed.rotation.z=s*.32;                  // techo a dos aguas
    hDoor(root,xo+s*.02,1.1,-1.7,s*Math.PI/2,.6,.72,mat);
    cyl(root,.06,.06,1.4,s*1.36,1.55,-3.0,6,darkMat).rotation.x=Math.PI/2;              // escape
    towHook(root,s*.8,.75,4.47,0,mat); towHook(root,s*.8,.75,-4.42,Math.PI,mat); }
  ballMG(root,-1.33,1.2,2.4,-Math.PI/2,mat); ballMG(root,1.33,1.2,0,Math.PI/2,mat); ballMG(root,0,1.2,-4.42,Math.PI,mat);
  ballMG(root,-.75,1.15,4.47,0,mat);                                                     // Hotchkiss del frente, al lado del 75
  rivetsLine(root,[-1.2,1.4,4.47],[1.2,1.4,4.47],11,'z',mat); rivetsLine(root,[-1.2,.82,4.47],[1.2,.82,4.47],11,'z',mat);
  // cúpulas: conductor adelante a la izquierda, comandante atrás a la derecha
  for(const [x,z] of [[-.65,3.1],[.65,-3.2]]){ cyl(root,.32,.34,.42,x,2.05,z,8,mat); box(root,.42,.04,.42,x,2.28,z,mat); box(root,.08,.03,.03,x,2.31,z,darkMat); }
  slits(root,2,-.65,2.12,3.42,0,.12); slits(root,2,.65,2.12,-3.52,0,.12); for(const s of [-1,1]) slits(root,1,-.65+s*.33,2.12,3.1,Math.PI/2,.14);
  louvres(root,1.2,1.2,7,0,1.88,0,mat);                                                 // rejilla del generador
  const G=gunMount(t,root,0,1.12,4.42,M.gl,M.gr,mat,{shR:.26}); useGun(t,G);
  box(root,.7,.06,.06,0,1.45,4.48,mat); box(root,.7,.06,.06,0,.8,4.48,mat);
  collider(root,2.67,1.85,8.9,0,1.15,0,t,'hull'); collider(root,1.0,.9,.6,0,1.12,4.2,t,'turret');
  t.hTop=1.85; t.topH=2.45; t.aimH=1.2; t.glL=.6;
  t.seatPos={driver:V3(-.65,1.6,3.1),commander:V3(.65,1.6,-3.2),gunner:V3(0,1.15,3.8),loader:V3(.45,1.05,3.2),mg1:V3(-1.05,1.2,2.4),mg2:V3(1.05,1.2,0),mg3:V3(0,1.2,-3.6),
    mech1:V3(-.3,1.0,.6),mech2:V3(.3,1.0,-1.0),engine:V3(0,1.0,.4),trans:V3(0,.8,-.9),ammo:V3(0,1.0,2.4),breech:V3(0,1.12,4.0)};
}

// Whippet (y LK II): orugas largas con bocas para el barro, motor adelante, casamata atrás con cantos achaflanados
function buildWhippet(t,M,mat,root,lkL,lkR,lk){
  const prof=lk?[[1.9,.95],[-2.2,.95],[-2.5,.5],[-2.15,0],[1.7,0],[2.4,.5]]:[[2.5,1.45],[-2.6,1.45],[-3.05,.9],[-2.6,0],[2.4,0],[3.05,.8]];
  const tx=lk?.78:1.06;
  for(const s of [-1,1]){ trackLoop(root,prof,lk?.38:.5,s*tx,s>0?lkR:lkL,sideTrkMat,.1);
    if(!lk){ const sm=chaikin(prof,2); profMesh(root,insetPoly(sm,.14),.46,s*tx,mat); const xo=s*(tx+.235);
      rivetsAlong(root,insetPoly(sm,.22),xo,.22,mat);
      for(let i=0;i<6;i++) box(root,.02,.26,.34,xo+s*.005,.72,-1.85+i*.74,darkMat);        // bocas para el barro
      for(const z of [-1.5,1.5]) rivetsLine(root,[xo+s*.01,.3,z],[xo+s*.01,1.2,z],6,'x',mat); }
    else { box(root,.05,.55,4.3,s*(tx+.24),.75,-.1,mat); rivetsLine(root,[s*(tx+.27),.97,-2.1],[s*(tx+.27),.97,1.9],18,'x',mat); rivetsLine(root,[s*(tx+.27),.53,-2.1],[s*(tx+.27),.53,1.9],18,'x',mat); }
    for(let i=0;i<6;i++) wheel(root,s*tx,.2,-1.9+i*.72,.15); }
  const hw=lk?.65:.78;
  // capó del motor con persianas y, adelante, el tanque de combustible blindado (Whippet) o el radiador (LK II)
  const hk=lk?0:.22; profMesh(root,[[2.45,1.15+hk],[.2,1.35+hk],[.2,.5],[2.6,.5]],hw*2,0,mat);
  for(let i=0;i<5;i++) box(root,hw*1.6,.04,.08,0,1.2+hk+i*.03,1.9-i*.32,darkMat);
  for(const s of [-1,1]) rivetsLine(root,[s*(hw-.05),1.2+hk,2.4],[s*(hw-.05),1.37+hk,.3],10,'y',mat);
  if(!lk){ box(root,hw*2,.62,.32,0,.88,2.72,mat); rivetsLine(root,[-hw+.08,1.15,2.89],[hw-.08,1.15,2.89],9,'z',mat); cyl(root,.06,.06,.06,.3,1.22,2.72,8,darkMat);
    const ex=cyl(root,.055,.055,2.3,-hw-.02,1.45,.9,6,darkMat); ex.rotation.x=Math.PI/2; }
  else { for(let i=0;i<9;i++) box(root,.03,.55,.03,-hw*.8+i*hw*.2,.8,2.62,darkMat); box(root,hw*1.9,.06,.1,0,1.1,2.6,mat); box(root,hw*1.9,.06,.1,0,.52,2.62,mat); }
  // casamata (pelea) atrás, con los cantos achaflanados
  const z0=lk?-.2:-.5, z1=lk?-2.4:-2.6, H=lk?2.25:2.6, CW=lk?1.7:2.0, c=.2;
  const plan=(w,d)=>[[z0-d,-w/2+c],[z0-d,w/2-c],[z0-d-c,w/2],[z1+d+c,w/2],[z1+d,w/2-c],[z1+d,-w/2+c],[z1+d+c,-w/2],[z0-d-c,-w/2]];
  planMesh(root,plan(CW,0),H-.62,.5,mat); planMesh(root,plan(CW-.16,.08),.14,H-.14,mat);
  const zc=(z0+z1)/2;
  for(const s of [-1,1]){ slits(root,2,s*(CW/2+.01),H-.45,zc,Math.PI/2,.22);
    rivetsLine(root,[s*(CW/2+.01),H-.17,z0-.25],[s*(CW/2+.01),H-.17,z1+.25],8,'x',mat); rivetsLine(root,[s*(CW/2+.01),.65,z0-.25],[s*(CW/2+.01),.65,z1+.25],8,'x',mat);
    if(!lk){ const r=cyl(root,.14,.15,.05,s*(CW/2+.01),H-.75,zc+.35,12,mat); r.rotation.z=Math.PI/2; } }   // troneras de las Hotchkiss
  slits(root,2,0,H-.45,z0+.02,0,.2);
  hDoor(root,lk?0:.42,1.25,z1-.02,Math.PI,.55,.95,mat);
  if(!lk){ const r=cyl(root,.14,.15,.05,-.45,H-.75,z1-.01,12,mat); r.rotation.x=Math.PI/2; }
  box(root,.5,.05,.45,0,H+.02,zc-.2,mat); box(root,.1,.03,.03,0,H+.06,zc-.2,darkMat);
  towHook(root,0,.65,lk?2.45:2.95,0,mat);
  // el arma asoma por la casamata y gira alrededor de su centro (cuatro troneras en el Whippet)
  const tur=new THREE.Group(); tur.position.set(0,H-.75,zc); root.add(tur);
  const R=(z0-z1)/2+.02, G=gunMount(t,tur,0,0,R,M.gl,M.gr,mat,{jacket:!lk,shR:lk?.22:.14});
  t.turret=tur; t.gunPivot=G.gp; t.barrel=G.barrel; t.muzzle=G.muzzle; t.coax=G.coax; t.barrelMesh=G.bm;
  collider(root,M.W,lk?1.2:1.5,M.L,0,.75,0,t,'hull'); collider(root,CW,H-.5,z0-z1,0,(H+.5)/2,zc,t,'turret');
  if(lk){ for(const s of [-1,1]) ironCross(root,s*(hw+.01),.95,1.3,0,.7); }
  t.hTop=H; t.topH=H+.4; t.aimH=1.3; t.glL=1.2;
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
    else if(style==='m1'||style==='jpn'){ const d=new THREE.SphereGeometry(.15,10,7,0,Math.PI*2,0,1.5); d.scale(1,.9,1.08); d.translate(0,.03,0); L.push(d);   // M1 estadounidense: redondo, sin ala
      const r=new THREE.TorusGeometry(.148,.012,4,16); r.rotateX(Math.PI/2); r.scale(1,1,1.08); r.translate(0,.04,0); L.push(r); }
    else { const d=new THREE.SphereGeometry(.15,10,7,0,Math.PI*2,0,1.62); d.translate(0,.035,-.005); L.push(d);
      const s=new THREE.CylinderGeometry(.152,.18,.06,14,1,true); s.translate(0,-.01,-.012); L.push(s); }
    return L; })());
  for(const g of G){ const m=new THREE.Mesh(g,_helmM[style]); head.add(m); }
}
