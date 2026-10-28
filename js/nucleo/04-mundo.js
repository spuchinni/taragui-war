/* ---------- Construcción del mundo ---------- */
const worldGroup=new THREE.Group(); scene.add(worldGroup);
let houseMeshes=[], houseBoxes=[], trees=[], treeSets={}, nodes=null, mmBg=null, mmDirty=false, groundCanvas=null, streetSegs=[], buildings=[], wallsIM=null, roofsIM=null, gablesIM=null, rtankIM=null, rList=[], waterMesh=null;
const CELL=16; let grid=new Map();
const gk=(i,j)=>i*100003+j;
function gridAdd(b){for(let i=Math.floor(b.min.x/CELL);i<=Math.floor(b.max.x/CELL);i++)for(let j=Math.floor(b.min.z/CELL);j<=Math.floor(b.max.z/CELL);j++){const k=gk(i,j);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(b);}}
function gridQuery(x,z,r){const out=[];for(let i=Math.floor((x-r)/CELL);i<=Math.floor((x+r)/CELL);i++)for(let j=Math.floor((z-r)/CELL);j<=Math.floor((z+r)/CELL);j++){const a=grid.get(gk(i,j));if(a)for(const b of a)if(!b.dead)out.push(b);}return out;}
// Con muchos tramos (mapas reales) se busca en una grilla de 24 m alrededor del punto; más allá de ~70 m da "lejos" (1e9)
const segGridC=new WeakMap();
function segGrid(segs){ let G=segGridC.get(segs); if(G&&G.n===segs.length) return G; G={n:segs.length,m:new Map()};
  for(const s of segs) for(let i=Math.floor(Math.min(s.ax,s.bx)/24);i<=Math.floor(Math.max(s.ax,s.bx)/24);i++) for(let j=Math.floor(Math.min(s.az,s.bz)/24);j<=Math.floor(Math.max(s.az,s.bz)/24);j++){ const k=i*7919+j; let a=G.m.get(k); if(!a){a=[];G.m.set(k,a);} a.push(s); }
  segGridC.set(segs,G); return G; }
function nearestSeg(x,z,segs){ if(segs.length>300){ const G=segGrid(segs), ci=Math.floor(x/24), cj=Math.floor(z/24), seen=new Set(), near=[];
    for(let i=ci-3;i<=ci+3;i++) for(let j=cj-3;j<=cj+3;j++){ const a=G.m.get(i*7919+j); if(a) for(const s of a) if(!seen.has(s)){ seen.add(s); near.push(s); } }
    return nearestSeg0(x,z,near); } return nearestSeg0(x,z,segs); }
function nearestSeg0(x,z,segs){let m=1e9,best=null;for(const s of segs){const dx=s.bx-s.ax,dz=s.bz-s.az,l=dx*dx+dz*dz;let t=l?((x-s.ax)*dx+(z-s.az)*dz)/l:0;t=clamp(t,0,1);
  const px=s.ax+dx*t,pz=s.az+dz*t,d=Math.hypot(x-px,z-pz);if(d<m){m=d;best={d,px,pz};}}return best||{d:1e9,px:x,pz:z};}
const distSegs=(x,z,segs)=>nearestSeg(x,z,segs).d;
// Choque círculo contra edificio orientado: devuelve el empuje para sacar el círculo
function obPush(cx,cz,R,b){
  const o=b.ob, dx=cx-o.cx, dz=cz-o.cz, lx=dx*o.c-dz*o.s, lz=dx*o.s+dz*o.c;
  const qx=clamp(lx,-o.hw,o.hw), qz=clamp(lz,-o.hd,o.hd), ex=lx-qx, ez=lz-qz, d=Math.hypot(ex,ez);
  if(d>=R) return null;
  let ux,uz,m;
  if(d>1e-4){ux=ex/d;uz=ez/d;m=R-d;}
  else {const px=o.hw-Math.abs(lx),pz=o.hd-Math.abs(lz); if(px<pz){ux=Math.sign(lx)||1;uz=0;m=px+R;} else {ux=0;uz=Math.sign(lz)||1;m=pz+R;}}
  return {x:(ux*o.c+uz*o.s)*m, z:(-ux*o.s+uz*o.c)*m};
}
function obInside(b,x,z){const o=b.ob,dx=x-o.cx,dz=z-o.cz;return Math.abs(dx*o.c-dz*o.s)<=o.hw&&Math.abs(dx*o.s+dz*o.c)<=o.hd;}

let bList=[];
function addBuilding(x,z,w,d,h,a,wall,roof,check=true,hp=100,pitched=false){
  const c=Math.cos(a),s=Math.sin(a);
  let mnx=1e9,mxx=-1e9,mnz=1e9,mxz=-1e9,base=1e9;
  for(const [lx,lz] of [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]]){
    const wx=x+lx*c+lz*s, wz=z-lx*s+lz*c; mnx=Math.min(mnx,wx);mxx=Math.max(mxx,wx);mnz=Math.min(mnz,wz);mxz=Math.max(mxz,wz);base=Math.min(base,heightAt(wx,wz));}
  base-=1; const top=heightAt(x,z)+h;
  const box=new THREE.Box3(new THREE.Vector3(mnx,base,mnz),new THREE.Vector3(mxx,top+.4,mxz));
  box.ob={cx:x,cz:z,c,s,hw:w/2,hd:d/2};
  if(check){if(gridQuery(x,z,Math.max(w,d)).some(o=>obPush(x,z,Math.max(w,d)*.5,o)))return false;}
  gridAdd(box); houseBoxes.push(box);
  hp=Math.min(320,Math.max(hp,110+w*d*1.1));
  const rec={x,z,w,d,a,base,top,wall,roof,hp,max:hp,box,i:bList.length,pitched}; box.bld=rec; bList.push(rec); return true;
}
// Fachadas: ventanas con marco, alféizar y línea de piso, repetidas según el tamaño real de cada pared (una cada 3,5 m de ancho y 3 m de alto)
const facadeTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=256; const x=c.getContext('2d'); x.fillStyle='#f4f2ec'; x.fillRect(0,0,256,256);
  speckle(x,256,256,900,['#dcdad4','#ecebe6','#cfccc4'],1,3);
  x.fillStyle='rgba(0,0,0,.10)'; x.fillRect(0,248,256,8); x.fillStyle='rgba(255,255,255,.35)'; x.fillRect(0,244,256,3);
  x.fillStyle='#8e8a82'; x.fillRect(70,58,116,118); x.fillStyle='#2c3a44'; x.fillRect(78,66,100,102);
  const g=x.createLinearGradient(78,66,178,168); g.addColorStop(0,'rgba(170,200,220,.45)'); g.addColorStop(.5,'rgba(60,80,95,.1)'); g.addColorStop(1,'rgba(150,180,200,.3)'); x.fillStyle=g; x.fillRect(78,66,100,102);
  x.fillStyle='#8e8a82'; x.fillRect(125,66,6,102); x.fillRect(78,112,100,5);
  x.fillStyle='#bdb8ae'; x.fillRect(64,176,128,9); x.fillStyle='rgba(0,0,0,.18)'; x.fillRect(64,185,128,4);
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=ANISO; return t; })();
function facadeMat(){ const m=new THREE.MeshLambertMaterial({map:facadeTex});
  m.onBeforeCompile=sh=>{ sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
  #ifdef USE_INSTANCING
    vec3 sc=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));
    if(abs(normal.y)>.5) vUv=vec2(.04,.04);
    else { float w=abs(normal.x)>.5?sc.z:sc.x; float nw=max(1.,floor(w/3.5+.5)); vUv=vec2(uv.x*nw,(uv.y*sc.y-1.15)/3.0); }
  #endif`); }; return m; }
function finalizeBuildings(){
  if(bList.length>1500) return finalizeBuildingsSec();
  const n=bList.length, geo=new THREE.BoxGeometry(1,1,1);
  const walls=new THREE.InstancedMesh(geo,facadeMat(),n);
  const roofs=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff}),n);
  const tri=new THREE.Shape(); tri.moveTo(-.5,0); tri.lineTo(.5,0); tri.lineTo(0,1); tri.lineTo(-.5,0);
  const pg=new THREE.ExtrudeGeometry(tri,{depth:1,bevelEnabled:false}); pg.translate(0,0,-.5);
  const gables=new THREE.InstancedMesh(pg,new THREE.MeshLambertMaterial({color:0xffffff}),n); gablesIM=gables;
  const m=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), col=new THREE.Color();
  bList.forEach((b,i)=>{
    q.setFromAxisAngle(up,b.a); const H=b.top-b.base;
    m.compose(new THREE.Vector3(b.x,b.base+H/2,b.z),q,new THREE.Vector3(b.w,H,b.d)); walls.setMatrixAt(i,m); walls.setColorAt(i,col.set(b.wall));
    if(b.pitched){ m.compose(new THREE.Vector3(b.x,b.top,b.z),q,new THREE.Vector3(b.w+.5,Math.min(b.w,b.d)*.38,b.d+.4)); gables.setMatrixAt(i,m); gables.setColorAt(i,col.set(b.roof));
      m.makeScale(0,0,0); roofs.setMatrixAt(i,m); roofs.setColorAt(i,col.set(b.roof)); }
    else { m.compose(new THREE.Vector3(b.x,b.top+.12,b.z),q,new THREE.Vector3(b.w+.5,.24,b.d+.5)); roofs.setMatrixAt(i,m); roofs.setColorAt(i,col.set(b.roof));
      m.makeScale(0,0,0); gables.setMatrixAt(i,m); gables.setColorAt(i,col.set(b.roof)); }
  });
  { const tg=new THREE.CylinderGeometry(.55,.6,1.1,10); tg.translate(0,.55,0); const tk=new THREE.InstancedMesh(tg,new THREE.MeshLambertMaterial({color:0xffffff}),n); rtankIM=tk;
    bList.forEach((b,i)=>{ const H=b.top-b.base; if(b.pitched||H>16||b.w<5||b.d<5||Math.random()<.4||!isFinite(b.max)||b.max>1e8){ m.makeScale(0,0,0); tk.setMatrixAt(i,m); tk.setColorAt(i,col.set(0xffffff)); return; }
      const ox=rand(-b.w/4,b.w/4), oz=rand(-b.d/4,b.d/4), c=Math.cos(b.a), s2=Math.sin(b.a); q.setFromAxisAngle(up,0); m.compose(new THREE.Vector3(b.x+ox*c+oz*s2,b.top+.24,b.z-ox*s2+oz*c),q,new THREE.Vector3(1,1,1)); tk.setMatrixAt(i,m); tk.setColorAt(i,col.set(Math.random()<.6?0x1c1c1c:0xd8cfb0)); });
    tk.castShadow=true; tk.frustumCulled=false; tk.instanceMatrix.needsUpdate=true; tk.instanceColor.needsUpdate=true; worldGroup.add(tk); }
  [walls,roofs,gables].forEach(im=>{im.castShadow=im.receiveShadow=true;im.frustumCulled=false;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;worldGroup.add(im);});
  walls.userData.blds=bList; buildings=bList; wallsIM=walls; roofsIM=roofs; houseMeshes=[walls,roofs,gables]; bList=[];
  if(rList.length) finalizeRocks();
}

// Muchos edificios (mapas reales de 1,5 km): una malla por sector de 260 m que se dibuja solo si se ve (cullAdd).
// wallsIM, roofsIM, gablesIM y rtankIM pasan a ser "repartidores": reciben el índice del edificio y escriben en la malla de su sector.
function finalizeBuildingsSec(){
  const geo=new THREE.BoxGeometry(1,1,1), wm=facadeMat(), rm=new THREE.MeshLambertMaterial({color:0xffffff}), gm=new THREE.MeshLambertMaterial({color:0xffffff}), tm=new THREE.MeshLambertMaterial({color:0xffffff});
  const tri=new THREE.Shape(); tri.moveTo(-.5,0); tri.lineTo(.5,0); tri.lineTo(0,1); tri.lineTo(-.5,0);
  const pg=new THREE.ExtrudeGeometry(tri,{depth:1,bevelEnabled:false}); pg.translate(0,0,-.5); const tg=new THREE.CylinderGeometry(.55,.6,1.1,8); tg.translate(0,.55,0);
  const m=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), col=new THREE.Color(), Z0=new THREE.Matrix4().makeScale(0,0,0), all=[];
  for(const [,list] of cells(bList,260)){ const N=list.length, mk=(g,mt)=>{ const im=new THREE.InstancedMesh(g,mt,N); im.castShadow=im.receiveShadow=true; im.frustumCulled=false; im.userData.bIdx=list.map(b=>b.i); worldGroup.add(im); return im; };
    const S={w:mk(geo,wm),r:mk(geo,rm),g:mk(pg,gm),t:mk(tg,tm)}; S.t.receiveShadow=false;
    let cx=0,cz=0,top=0,bot=1e9; list.forEach((b,j)=>{ b.S=S; b.j=j; cx+=b.x; cz+=b.z; top=Math.max(top,b.top); bot=Math.min(bot,b.base);
      q.setFromAxisAngle(up,b.a); const H=b.top-b.base;
      m.compose(new THREE.Vector3(b.x,b.base+H/2,b.z),q,new THREE.Vector3(b.w,H,b.d)); S.w.setMatrixAt(j,m); S.w.setColorAt(j,col.set(b.wall));
      if(b.pitched){ m.compose(new THREE.Vector3(b.x,b.top,b.z),q,new THREE.Vector3(b.w+.5,Math.min(b.w,b.d)*.38,b.d+.4)); S.g.setMatrixAt(j,m); S.g.setColorAt(j,col.set(b.roof)); S.r.setMatrixAt(j,Z0); S.r.setColorAt(j,col); }
      else { m.compose(new THREE.Vector3(b.x,b.top+.12,b.z),q,new THREE.Vector3(b.w+.5,.24,b.d+.5)); S.r.setMatrixAt(j,m); S.r.setColorAt(j,col.set(b.roof)); S.g.setMatrixAt(j,Z0); S.g.setColorAt(j,col); }
      if(b.pitched||H>16||b.w<5||b.d<5||Math.random()<.4){ S.t.setMatrixAt(j,Z0); S.t.setColorAt(j,col.set(0xffffff)); }
      else { const ox=rand(-b.w/4,b.w/4), oz=rand(-b.d/4,b.d/4), c=Math.cos(b.a), s2=Math.sin(b.a); m.compose(new THREE.Vector3(b.x+ox*c+oz*s2,b.top+.24,b.z-ox*s2+oz*c),q.identity(),new THREE.Vector3(1,1,1)); S.t.setMatrixAt(j,m); S.t.setColorAt(j,col.set(Math.random()<.6?0x1c1c1c:0xd8cfb0)); } });
    cx/=N; cz/=N; const r=Math.max(...list.map(b=>Math.hypot(b.x-cx,b.z-cz)+Math.max(b.w,b.d)*.71)), cy=(top+bot)/2, R=Math.hypot(r,(top-bot)/2)+2;
    for(const im of [S.w,S.r,S.g,S.t]){ im.instanceMatrix.needsUpdate=true; im.instanceColor.needsUpdate=true; cullAdd(im,cx,cy,cz,R,im===S.t?230:0); }
    if(!list.some(b=>b.pitched)) S.g.count=0; // sin techos a dos aguas en el sector: una llamada de dibujo menos
    all.push(S.w,S.r,S.g); }
  const prox=f=>({setMatrixAt(i,mx){ const b=buildings[i], im=b.S[f]; im.setMatrixAt(b.j,mx); im.instanceMatrix.needsUpdate=true; },
    setColorAt(i,c){ const b=buildings[i], im=b.S[f]; im.setColorAt(b.j,c); im.instanceColor.needsUpdate=true; }, instanceMatrix:{}, instanceColor:{}});
  buildings=bList; wallsIM=prox('w'); roofsIM=prox('r'); gablesIM=prox('g'); rtankIM=prox('t'); houseMeshes=all; bList=[];
  if(rList.length) finalizeRocks();
}
const rubGeo=new THREE.BoxGeometry(1,1,1), beamMat=new THREE.MeshLambertMaterial({color:0x5b4632});
// Agujeros de bala y de proyectil en las paredes (calcomanías) y cascotes que caen al pie
const holeTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d');
  const g=x.createRadialGradient(32,32,2,32,32,31); g.addColorStop(0,'rgba(5,4,3,1)'); g.addColorStop(.4,'rgba(12,10,8,1)'); g.addColorStop(.52,'rgba(150,104,80,.9)'); g.addColorStop(.75,'rgba(190,170,145,.5)'); g.addColorStop(1,'rgba(190,170,145,0)');
  x.fillStyle=g; x.beginPath(); for(let i=0;i<=24;i++){ const a=i/24*Math.PI*2, r=24+Math.random()*8; x.lineTo(32+Math.cos(a)*r,32+Math.sin(a)*r); } x.fill();
  const t=new THREE.CanvasTexture(c); return t; })();
const scorchTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d');
  const g=x.createRadialGradient(32,32,4,32,32,31); g.addColorStop(0,'rgba(10,9,8,.6)'); g.addColorStop(.5,'rgba(25,22,20,.3)'); g.addColorStop(1,'rgba(25,22,20,0)'); x.fillStyle=g; x.fillRect(0,0,64,64);
  return new THREE.CanvasTexture(c); })();
const DEC_N=900, CHIP_N=700; let decIM=null, scIM=null, chipIM=null, decK=0, scK=0, chipK=0, decOwner=[];
const _dm=new THREE.Matrix4(), _dq=new THREE.Quaternion(), _dv=new THREE.Vector3(), _ds=new THREE.Vector3(), _dz=new THREE.Vector3(0,0,1);
function decPools(){
  if(decIM&&decIM.parent===worldGroup) return;
  const mk=(tex,n)=>{ const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),new THREE.MeshLambertMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}),n);
    _dm.makeScale(0,0,0); for(let i=0;i<n;i++) im.setMatrixAt(i,_dm); im.frustumCulled=false; im.renderOrder=2; worldGroup.add(im); return im; };
  decIM=mk(holeTex,DEC_N); scIM=mk(scorchTex,300); decK=scK=chipK=0; decOwner=new Array(DEC_N).fill(-1);
  chipIM=new THREE.InstancedMesh(rubGeo,new THREE.MeshLambertMaterial({color:0xffffff}),CHIP_N); _dm.makeScale(0,0,0);
  for(let i=0;i<CHIP_N;i++){ chipIM.setMatrixAt(i,_dm); chipIM.setColorAt(i,new THREE.Color(0x888888)); } chipIM.castShadow=chipIM.receiveShadow=true; chipIM.frustumCulled=false; worldGroup.add(chipIM);
}
function hitNormal(hit,b){ // normal de la cara en el mundo (las casas solo giran sobre el eje vertical)
  const n=hit.face?hit.face.normal.clone():new THREE.Vector3(0,0,1); n.applyAxisAngle(new THREE.Vector3(0,1,0),b?b.a:0); return n.normalize(); }
function markBuilding(hit,b,size,kind){
  if(!hit||!b||b.hp<=0) return; decPools();
  const n=hitNormal(hit,b), p=hit.point.clone().addScaledVector(n,.04);
  _dq.setFromUnitVectors(_dz,n); _dq.multiply(new THREE.Quaternion().setFromAxisAngle(_dz,rand(0,6.28)));
  _dm.compose(p,_dq,_ds.set(size,size,1)); decIM.setMatrixAt(decK,_dm); decOwner[decK]=b.i; decK=(decK+1)%DEC_N; decIM.instanceMatrix.needsUpdate=true;
  if(kind==='big'){ _dm.compose(p.clone().addScaledVector(n,-.01),_dq,_ds.set(size*1.7,size*1.7,1)); scIM.setMatrixAt(scK,_dm); scK=(scK+1)%300; scIM.instanceMatrix.needsUpdate=true; }
  // cascotes al pie de la pared, apoyados en el suelo
  const nc=kind==='big'?rand(5,9)|0:Math.random()<.35?1:0, col=new THREE.Color();
  for(let k=0;k<nc;k++){ const x=p.x+n.x*rand(.3,1.8)+rand(-.8,.8)*size, z=p.z+n.z*rand(.3,1.8)+rand(-.8,.8)*size, sz=kind==='big'?rand(.18,.55):rand(.06,.14), gy=heightAt(x,z);
    _dq.setFromEuler(new THREE.Euler(rand(-.5,.5),rand(0,3.1),rand(-.5,.5))); _dm.compose(_dv.set(x,gy+sz*.3,z),_dq,_ds.set(sz*rand(.8,1.6),sz,sz*rand(.8,1.4)));
    chipIM.setMatrixAt(chipK,_dm); chipIM.setColorAt(chipK,col.set(Math.random()<.6?b.wall:0x8a8178).multiplyScalar(rand(.55,.85))); chipK=(chipK+1)%CHIP_N; }
  if(nc){ chipIM.instanceMatrix.needsUpdate=true; chipIM.instanceColor.needsUpdate=true; }
}
function clearMarks(b){ if(!decIM) return; let ch=false; _dm.makeScale(0,0,0); for(let i=0;i<DEC_N;i++) if(decOwner[i]===b.i){ decIM.setMatrixAt(i,_dm); decOwner[i]=-1; ch=true; } if(ch) decIM.instanceMatrix.needsUpdate=true; }
// Derrumbe: montaña de escombros apoyada en el suelo, restos de paredes en pie y vigas caídas (nada flota)
function rubble(b,g){
  const H=b.top-b.base, c=Math.cos(b.a), sn=Math.sin(b.a), W2=b.w/2, D2=b.d/2, pileH=Math.min(H*.28,2.6)+.5;
  const heap=(lx,lz)=>{ const r=Math.max(Math.abs(lx)/(W2*1.2),Math.abs(lz)/(D2*1.2)); return r>=1?0:pileH*(1-r*r)*(.85+.15*Math.sin(lx*1.7+lz*1.3)); };
  const W=(lx,lz)=>[b.x+lx*c+lz*sn, b.z-lx*sn+lz*c];
  const n=Math.round(clamp(b.w*b.d/1.6,26,110)), stubs=[];
  for(const [ax,len,off,nx,nz] of [[0,b.w,D2,0,1],[0,b.w,-D2,0,-1],[1,b.d,W2,1,0],[1,b.d,-W2,-1,0]]){ if(Math.random()<.35) continue;
    const L=len*rand(.25,.65), h=rand(1,Math.max(1.3,H*.55)), u=rand(-(len-L)/2,(len-L)/2); stubs.push(ax?{lx:off,lz:u,w:.35,d:L,h}:{lx:u,lz:off,w:L,d:.35,h}); }
  const tot=n+6+stubs.length, im=new THREE.InstancedMesh(rubGeo,new THREE.MeshLambertMaterial({color:0xffffff}),tot);
  const m=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), col=new THREE.Color(); let i=0;
  for(const S of stubs){ const [x,z]=W(S.lx,S.lz), gy=Math.min(heightAt(x,z),g); q.setFromAxisAngle(new THREE.Vector3(0,1,0),b.a);
    m.compose(new THREE.Vector3(x,gy+S.h/2-.3,z),q,new THREE.Vector3(S.w,S.h+.3,S.d)); im.setMatrixAt(i,m); im.setColorAt(i,col.set(b.wall).multiplyScalar(rand(.6,.8))); i++; }
  for(let k=0;k<n+6;k++,i++){
    const beam=k>=n, lx=rand(-W2*1.15,W2*1.15), lz=rand(-D2*1.15,D2*1.15), [x,z]=W(lx,lz), hp=heap(lx,lz), gy=heightAt(x,z);
    const sz=beam?new THREE.Vector3(.25,.25,rand(2.5,4.5)):new THREE.Vector3(rand(.5,1.9),rand(.25,.9),rand(.5,1.7));
    const y=gy+hp+(beam?.12:sz.y*.15)-(hp>0?.1:0);
    e.set(beam?rand(-.35,.35):rand(-.4,.4),rand(0,3.14),beam?rand(-.35,.35):rand(-.4,.4)); q.setFromEuler(e); m.compose(new THREE.Vector3(x,y,z),q,sz); im.setMatrixAt(i,m);
    im.setColorAt(i,beam?col.set(0x5b4632):col.set(k%3===0?b.roof:k%3===1?0x8a8178:b.wall).multiplyScalar(rand(.5,.8)));
  }
  im.castShadow=im.receiveShadow=true; im.instanceMatrix.needsUpdate=true; im.instanceColor.needsUpdate=true; worldGroup.add(im);
  b.heap={pileH}; smolder.push({x:b.x,z:b.z,y:g,t:25});
}
const smolder=[];
function damageBuilding(b,dmg,fromNet){
  if(!b||b.hp<=0||!isFinite(b.hp)) return;
  if(net.guest&&!fromNet) return;
  if(net.host) netAll({t:'bd',i:buildings.indexOf(b),d:dmg});
  b.hp-=dmg; const col=new THREE.Color(b.wall);
  if(b.hp<=0){
    b.box.dead=true; mmDirty=true;
    const m=new THREE.Matrix4(), q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),b.a), g=heightAt(b.x,b.z);
    const gl=b.base+1; m.compose(new THREE.Vector3(b.x,gl+.05,b.z),q,new THREE.Vector3(b.w*.98,.6,b.d*.98)); wallsIM.setMatrixAt(b.i,m); wallsIM.setColorAt(b.i,col.set(0x6f675d)); clearMarks(b);
    m.makeScale(0,0,0); roofsIM.setMatrixAt(b.i,m); m.makeScale(0,0,0); gablesIM.setMatrixAt(b.i,m); if(rtankIM){ rtankIM.setMatrixAt(b.i,m); rtankIM.instanceMatrix.needsUpdate=true; }
    wallsIM.instanceMatrix.needsUpdate=roofsIM.instanceMatrix.needsUpdate=gablesIM.instanceMatrix.needsUpdate=true; wallsIM.instanceColor.needsUpdate=true;
    for(let k=0;k<6;k++) puff(new THREE.Vector3(b.x+rand(-3,3),g+rand(1,4),b.z+rand(-3,3)),0x9a8f80,rand(4,7),rand(2,3.5),1.5,.8);
    rubble(b,g);
    if(!sfx('expl',new THREE.Vector3(b.x,g,b.z),.6,{rate:.6})) boom(distVol(new THREE.Vector3(b.x,g,b.z),.5),1.2,400);
  } else {
    wallsIM.setColorAt(b.i,col.multiplyScalar(.5+.5*b.hp/b.max)); wallsIM.instanceColor.needsUpdate=true;
    if(!b.sag&&b.hp<b.max*.45){ b.sag=true; const m=new THREE.Matrix4(), q=new THREE.Quaternion().setFromEuler(new THREE.Euler(rand(-.12,.12),b.a,rand(-.12,.12)));
      if(b.pitched){ m.compose(new THREE.Vector3(b.x,b.top-.35,b.z),q,new THREE.Vector3(b.w+.3,Math.min(b.w,b.d)*.3,b.d+.2)); gablesIM.setMatrixAt(b.i,m); gablesIM.instanceMatrix.needsUpdate=true; }
      else { m.compose(new THREE.Vector3(b.x,b.top-.2,b.z),q,new THREE.Vector3(b.w+.3,.24,b.d+.3)); roofsIM.setMatrixAt(b.i,m); roofsIM.instanceMatrix.needsUpdate=true; } }
    const g=heightAt(b.x,b.z);
    for(let k=0;k<2;k++) puff(new THREE.Vector3(b.x+rand(-b.w/3,b.w/3),g+rand(1,b.top-g),b.z+rand(-b.d/3,b.d/3)),0xa89c8a,rand(2.5,4),rand(1,1.8),.8,.6);
    debris(new THREE.Vector3(b.x,g+2,b.z),6,dirtMat,4,.9);
  }
}
const rockMat=new THREE.MeshLambertMaterial({color:0xffffff}); let rocksIM=null;
function addRock(x,z,w,d,h,a){
  const c=Math.cos(a),s=Math.sin(a), g=heightAt(x,z);
  let mnx=1e9,mxx=-1e9,mnz=1e9,mxz=-1e9;
  for(const [lx,lz] of [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]]){const wx=x+lx*c+lz*s, wz=z-lx*s+lz*c; mnx=Math.min(mnx,wx);mxx=Math.max(mxx,wx);mnz=Math.min(mnz,wz);mxz=Math.max(mxz,wz);}
  const box=new THREE.Box3(new THREE.Vector3(mnx,g-1,mnz),new THREE.Vector3(mxx,g+h,mxz)); box.ob={cx:x,cz:z,c,s,hw:w/2*.85,hd:d/2*.85};
  gridAdd(box); houseBoxes.push(box); rList.push({x,z,w,d,h,a,g});
}
function finalizeRocks(){
  const geo=new THREE.DodecahedronGeometry(.6,0); rocksIM=new THREE.InstancedMesh(geo,rockMat,rList.length);
  const m=new THREE.Matrix4(), col=new THREE.Color();
  rList.forEach((r,i)=>{m.compose(new THREE.Vector3(r.x,r.g+r.h*.35,r.z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rand(-.2,.2),r.a,rand(-.2,.2))),new THREE.Vector3(r.w,r.h,r.d));
    rocksIM.setMatrixAt(i,m); rocksIM.setColorAt(i,col.setHSL(.1,.04,rand(.42,.58)));});
  rocksIM.castShadow=rocksIM.receiveShadow=true; rocksIM.frustumCulled=false; worldGroup.add(rocksIM); houseMeshes.push(rocksIM); rList=[];
}
// Árboles nativos de Corrientes
const SPECIES={
  timbo:    {tr:.38,th:3.4,crown:()=>new THREE.SphereGeometry(5,10,7),cs:[1,.42,1],cy:5.6,col:[0x3c5a2a,0x46632f]},
  lapacho:  {tr:.26,th:3.2,crown:()=>new THREE.IcosahedronGeometry(3,1),cs:[1,.72,1],cy:5.2,col:[0xd683b0,0xc96aa0,0x55703a]},
  jacaranda:{tr:.24,th:3.0,crown:()=>new THREE.IcosahedronGeometry(3.1,1),cs:[1,.7,1],cy:5.0,col:[0x8a7fbf,0x7c74b0,0x5d7a3a]},
  ceibo:    {tr:.3,th:2.0,crown:()=>new THREE.IcosahedronGeometry(2.4,1),cs:[1,.8,1],cy:3.6,col:[0x5b7a33,0x6a7d36]},
  pindo:    {tr:.17,th:8.0,crown:()=>{const g=new THREE.ConeGeometry(2.8,1.6,9);g.rotateX(Math.PI);return g;},cs:[1,1,1],cy:8.4,col:[0x4b6b2b,0x58773a]},
  espinillo:{tr:.12,th:1.2,crown:()=>new THREE.SphereGeometry(1.9,8,6),cs:[1,.5,1],cy:2.0,col:[0x7c8a44,0x8d9550,0x9a9a4a]},
  algarrobo:{tr:.25,th:2.2,crown:()=>new THREE.SphereGeometry(3,9,6),cs:[1,.55,1],cy:3.6,col:[0x5f7038,0x55663a]},
  tojo:     {tr:.08,th:.4,crown:()=>new THREE.SphereGeometry(1.4,8,6),cs:[1,.6,1],cy:.9,col:[0xc4b236,0x7a8a34,0xb0a83a]},
  junco:    {tr:.04,th:.3,crown:()=>new THREE.ConeGeometry(.8,2.8,6),cs:[1,1,1],cy:1.6,col:[0x7f8f45,0x6d7d3a,0x9a9a55]},
  tussac:   {tr:.35,th:.7,crown:()=>new THREE.ConeGeometry(1.2,2.2,8),cs:[1,1,1],cy:1.7,col:[0x8f8c55,0x7f7d4a]}
};
const tm4=new THREE.Matrix4(), tq=new THREE.Quaternion(), tqY=new THREE.Quaternion(), _up=new THREE.Vector3(0,1,0);
// Copa más natural, hecha una vez por especie: las de hoja ancha pasan a ser 4-5 grupos de follaje deformados (no una bola),
// los pinos, conos escalonados; todas con normales suaves y más oscuras abajo (vertexColors × color de cada árbol).
const _crownC={};
// Textura de hojas (gris, multiplica el color de cada árbol): manchas claras y oscuras chicas, como follaje visto de lejos
const leafTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'); x.fillStyle='#d8d8d8'; x.fillRect(0,0,128,128);
  for(let i=0;i<900;i++){ const v=Math.random()<.5?rand(150,200):rand(225,255); x.fillStyle=`rgb(${v|0},${v|0},${v|0})`; x.beginPath(); x.ellipse(Math.random()*128,Math.random()*128,rand(1.5,4),rand(1,2.5),rand(0,3),0,7); x.fill(); }
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(3,3); return t; })();
function treeCrown(sp,S){ if(_crownC[sp]) return _crownC[sp].clone();
  const base=S.crown(), type=base.type; let g;
  const R=mulberry0(sp.length*7919+sp.charCodeAt(0)), rn=(a,b)=>a+R()*(b-a);
  if(/Cone/.test(type)&&S.layers){ const parts=[]; base.computeBoundingBox(); const bb=base.boundingBox, r=(bb.max.x-bb.min.x)/2, h=bb.max.y-bb.min.y;
    for(let i=0;i<3;i++){ const c=new THREE.ConeGeometry(r*(1-i*.22),h*.48,9); c.translate(0,-h*.32+i*h*.27,0); parts.push(c.toNonIndexed()); } g=THREE.BufferGeometryUtils.mergeBufferGeometries(parts); }
  else if(/Sphere|Icosahedron|Dodecahedron/.test(type)){ base.computeBoundingSphere(); const r=base.boundingSphere.radius, parts=[], n=S.lobes||5;
    for(let i=0;i<n;i++){ const c=new THREE.IcosahedronGeometry(r*(i?rn(.5,.68):.78),i?0:1), a=i/(n-1)*Math.PI*2+rn(-.4,.4);
      if(i) c.translate(Math.cos(a)*r*rn(.38,.55),rn(-.2,.32)*r,Math.sin(a)*r*rn(.38,.55)); parts.push(c.toNonIndexed()); }
    g=THREE.BufferGeometryUtils.mergeBufferGeometries(parts); }
  else g=base.index?base.toNonIndexed():base;
  // irregular: cada vértice se corre un poco (igual en las copias del mismo punto, así no se abren grietas)
  const P=g.attributes.position, key=(x,y,z)=>`${Math.round(x*50)},${Math.round(y*50)},${Math.round(z*50)}`, off={}, nrm={};
  g.computeBoundingBox(); const bb=g.boundingBox, rr0=Math.max(bb.max.x-bb.min.x,bb.max.y-bb.min.y)*.5;
  for(let i=0;i<P.count;i++){ const k=key(P.getX(i),P.getY(i),P.getZ(i)); if(!off[k]) off[k]=[rn(-1,1)*rr0*.07,rn(-1,1)*rr0*.07,rn(-1,1)*rr0*.07]; const o=off[k]; P.setXYZ(i,P.getX(i)+o[0],P.getY(i)+o[1],P.getZ(i)+o[2]); }
  g.computeVertexNormals(); const N=g.attributes.normal;
  for(let i=0;i<P.count;i++){ const k=key(P.getX(i),P.getY(i),P.getZ(i)), v=nrm[k]||(nrm[k]=[0,0,0]); v[0]+=N.getX(i); v[1]+=N.getY(i); v[2]+=N.getZ(i); }
  for(let i=0;i<P.count;i++){ const v=nrm[key(P.getX(i),P.getY(i),P.getZ(i))], l=Math.hypot(...v)||1; N.setXYZ(i,v[0]/l,v[1]/l,v[2]/l); }
  g.computeBoundingBox(); const y0=g.boundingBox.min.y, y1=g.boundingBox.max.y, col=new Float32Array(P.count*3);
  for(let i=0;i<P.count;i++){ const f=(P.getY(i)-y0)/Math.max(.01,y1-y0), k=.62+.52*f+rn(-.05,.05); col[i*3]=col[i*3+1]=col[i*3+2]=k; }
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  _crownC[sp]=g; return g.clone(); }
const mulberry0=s=>()=>{ s=(s+0x6D2B79F5)>>>0; let t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; };
function setTreeMatrix(tr){
  tqY.setFromAxisAngle(_up,tr.ry||0); if(tr.fallen) tq.setFromAxisAngle(tr.axis,tr.t*tr.t*Math.PI/2*.92).multiply(tqY); else tq.copy(tqY);
  const k=tr.sink?Math.max(0,1-tr.sink):1, sc=tr.gone?0:tr.s*(.4+.6*k);
  tm4.compose(new THREE.Vector3(tr.x,tr.y-(tr.sink||0)*2.5,tr.z),tq,new THREE.Vector3(sc,sc*tr.hs,sc));
  const set=treeSets[tr.key||tr.sp]; set[0].setMatrixAt(tr.i,tm4); set[1].setMatrixAt(tr.i,tm4);
  set[0].instanceMatrix.needsUpdate=set[1].instanceMatrix.needsUpdate=true;
}
function buildTrees(list){
  treeSets={}; trees=[]; const col=new THREE.Color();
  const by={}, CELL=list.length>400?160:1e6; // muchos árboles (mapas grandes): un grupo por especie y por sector de 160 m
  list.forEach(t=>{const sp=t.sp||'timbo', k=sp+'@'+Math.floor(t.x/CELL)+','+Math.floor(t.z/CELL);(by[k]=by[k]||[]).push(t);});
  for(const key in by){
    const sp=key.split('@')[0], S=SPECIES[sp], items=by[key];
    const tg=new THREE.CylinderGeometry(S.tr*.75,S.tr,S.th,6); tg.translate(0,S.th/2,0);
    const cg=treeCrown(sp,S); cg.scale(...S.cs); cg.translate(0,S.cy,0);
    const trunk=new THREE.InstancedMesh(tg,new THREE.MeshLambertMaterial({color:sp==='pindo'?0x7a6e5c:0x4a3826}),items.length);
    const crown=new THREE.InstancedMesh(cg,new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true,map:/Cone/.test(S.crown.toString())&&!S.layers?null:leafTex}),items.length);
    treeSets[key]=[trunk,crown]; const recs=[]; trunk.userData.treeList=recs; crown.userData.treeList=recs;
    if(CELL<1e6){ let cx=0,cz=0; items.forEach(t=>{cx+=t.x;cz+=t.z;}); cx/=items.length; cz/=items.length; const r=Math.max(...items.map(t=>Math.hypot(t.x-cx,t.z-cz)))+12;
      cullAdd(trunk,cx,heightAt(cx,cz)+5,cz,r,300); cullAdd(crown,cx,heightAt(cx,cz)+5,cz,r); }
    items.forEach((t,i)=>{const tr={sp,key,i,ry:Math.random()*6.283,x:t.x,z:t.z,y:heightAt(t.x,t.z)-.1,s:t.s||rand(.8,1.15),hs:t.hs||1,fallen:false,t:0,axis:null,r:S.tr*2};
      tr.hp=sp==='timbo'?14:sp==='tojo'||sp==='tussac'||sp==='espinillo'?3:8; recs.push(tr); trees.push(tr); setTreeMatrix(tr); crown.setColorAt(i,col.set(S.col[(Math.random()*S.col.length)|0]));});
    [trunk,crown].forEach(im=>{im.castShadow=true;im.frustumCulled=false;if(im.instanceColor)im.instanceColor.needsUpdate=true;worldGroup.add(im);});
  }
}
// ---------- Detalle del mapa: postes, cercos, autos estacionados y pasto alto (todo instanciado, se puede romper/aplastar) ----------
if(!THREE.BufferGeometryUtils) THREE.BufferGeometryUtils={ mergeBufferGeometries(list){ // une geometrías no indexadas (posición, normal, uv)
  const gs=list.map(g=>g.index?g.toNonIndexed():g), out=new THREE.BufferGeometry();
  for(const name of ['position','normal','uv']){ const arrs=gs.map(g=>g.attributes[name].array), len=arrs.reduce((a,b)=>a+b.length,0), A=new Float32Array(len); let o=0; for(const a of arrs){A.set(a,o);o+=a.length;}
    out.setAttribute(name,new THREE.BufferAttribute(A,gs[0].attributes[name].itemSize)); } return out; } };
let props=[], propGrid=new Map(), propIM={}, grassIM=null, grassCells=new Map();
const PCELL=10, pk=(x,z)=>Math.floor(x/PCELL)+','+Math.floor(z/PCELL);
const CAR_COLS=[0xb8b4ac,0x2f3b4a,0x7a1e1e,0xd9d4c8,0x3d4a32,0x8a7a5a,0x1e1e1e,0x5a6a7a,0xc9a43a];
const tuftTex=(()=>{const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d');x.clearRect(0,0,64,64);
  for(let i=0;i<26;i++){const X=4+Math.random()*56, h=30+Math.random()*32, b=rand(-10,10); x.strokeStyle=`rgb(${90+rand(0,50)|0},${110+rand(0,50)|0},${50+rand(0,25)|0})`;x.lineWidth=rand(1.5,3);
    x.beginPath();x.moveTo(X,64);x.quadraticCurveTo(X+b*.4,64-h*.6,X+b,64-h);x.stroke();} const t=new THREE.CanvasTexture(c); return t;})();
function freeSpot(x,z,m){ if(gridQuery(x,z,m+2).some(b=>!b.dead&&obPush(x,z,m,b))) return false; const h=heightAt(x,z); if(W.water!=null&&h<W.water+.5) return false;
  if(W.boundary&&!inPoly(x,z,W.boundary)) return false; return Math.abs(x)<W.bx-4&&Math.abs(z)<W.bz-4; }
function addProp(P){ props.push(P); const k=pk(P.x,P.z); let a=propGrid.get(k); if(!a){a=[];propGrid.set(k,a);} a.push(P); }
function buildProps(){
  props=[]; propGrid=new Map(); propIM={}; grassCells=new Map(); grassIM=null;
  const posts=[], fences=[], cars=[];
  // a lo largo de las calles: postes de luz cada ~24 m, autos estacionados y tramos de cerco
  for(const S of streetSegs){ const dx=S.bx-S.ax, dz=S.bz-S.az, L=Math.hypot(dx,dz); if(L<2) continue; const ux=dx/L, uz=dz/L, nx=-uz, nz=ux, a=Math.atan2(ux,uz);
    for(let d=rand(0,24); d<L; d+=24/W.propK){ const sd=Math.random()<.5?1:-1, x=S.ax+ux*d+nx*sd*6, z=S.az+uz*d+nz*sd*6; if(freeSpot(x,z,.6)) posts.push({x,z}); }
    for(let d=rand(5,40); d<L; d+=rand(26,60)/W.propK){ const sd=Math.random()<.5?1:-1, x=S.ax+ux*d+nx*sd*4.2, z=S.az+uz*d+nz*sd*4.2; if(freeSpot(x,z,2.6)&&distSegs(x,z,streetSegs)>3.4) cars.push({x,z,a:a+(Math.random()<.5?0:Math.PI)}); }
    if(Math.random()<.35*W.propK){ const sd=Math.random()<.5?1:-1, d0=rand(0,Math.max(1,L-12)); for(let d=d0; d<Math.min(L,d0+rand(8,20)); d+=2.4){ const x=S.ax+ux*d+nx*sd*8, z=S.az+uz*d+nz*sd*8; if(freeSpot(x,z,1.3)) fences.push({x,z,a}); } } }
  for(const o of W.extraCars||[]) if(freeSpot(o.x,o.z,2.2)) cars.push(o);
  // sin calles (campo): alambrados y postes en líneas sueltas
  if(!streetSegs.length) for(let k=0;k<14;k++){ const x0=rand(-W.bx*.8,W.bx*.8), z0=rand(-W.bz*.8,W.bz*.8), a=rand(0,Math.PI);
    for(let d=0; d<rand(30,80); d+=2.4){ const x=x0+Math.sin(a)*d, z=z0+Math.cos(a)*d; if(freeSpot(x,z,1.3)) fences.push({x,z,a}); } }
  const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), col=new THREE.Color(), up=new THREE.Vector3(0,1,0);
  const mkIM=(geo,mat,n,shadow=true)=>{const im=new THREE.InstancedMesh(geo,mat,Math.max(1,n)); im.count=n; im.castShadow=shadow; im.receiveShadow=true; im.frustumCulled=false; worldGroup.add(im); return im;};
  // postes
  const pg=new THREE.CylinderGeometry(.09,.13,7,6); pg.translate(0,3.5,0); const lg=new THREE.BoxGeometry(.25,.12,1.4); lg.translate(0,6.8,.55);
  propIM.post=mkIM(pg,new THREE.MeshStandardMaterial({color:0x6d6a62,roughness:.7,metalness:.3}),posts.length); propIM.lamp=mkIM(lg,darkMat,posts.length);
  posts.forEach((o,i)=>addProp({kind:'post',i,x:o.x,z:o.z,y:heightAt(o.x,o.z),a:rand(0,6.28),r:.35,t:0}));
  // cercos (tramos de 2,4 m: dos travesaños + poste)
  const fg=new THREE.BufferGeometry(); { const parts=[new THREE.BoxGeometry(.08,.08,2.4).translate(0,.45,0),new THREE.BoxGeometry(.08,.08,2.4).translate(0,.95,0),new THREE.BoxGeometry(.12,1.2,.12).translate(0,.6,-1.15)];
    const merged=THREE.BufferGeometryUtils?THREE.BufferGeometryUtils.mergeBufferGeometries(parts):null; if(merged) fg.copy(merged); else fg.copy(parts[0]); }
  propIM.fence=mkIM(fg.attributes.position?fg:new THREE.BoxGeometry(.1,1,2.4),new THREE.MeshLambertMaterial({color:0x6b5a44}),fences.length,false);
  fences.forEach((o,i)=>addProp({kind:'fence',i,x:o.x,z:o.z,y:heightAt(o.x,o.z),a:o.a,r:1.2,t:0}));
  // autos: carrocería + cabina, color por auto
  const SV=VTYPES[0], cb=vExt('sedanb',SV.p,SV.W), cc=vExt('sedang',SV.g,SV.W-.16);
  { const ws=[]; for(const [x,z] of [[-.85,1.35],[.85,1.35],[-.85,-1.35],[.85,-1.35]]){ const w=new THREE.CylinderGeometry(.34,.34,.24,10); w.rotateZ(Math.PI/2); w.translate(x,.34,z); ws.push(w); }
    propIM.wheels=mkIM(THREE.BufferGeometryUtils.mergeBufferGeometries(ws),darkMat,cars.length,false); }
  propIM.car=mkIM(cb,new THREE.MeshStandardMaterial({color:0xffffff,roughness:.35,metalness:.55}),cars.length); propIM.cab=mkIM(cc,new THREE.MeshStandardMaterial({color:0xffffff,roughness:.2,metalness:.6}),cars.length);
  cars.forEach((o,i)=>{ const P={kind:'car',i,x:o.x,z:o.z,y:heightAt(o.x,o.z),a:o.a,r:2.2,t:0,col:CAR_COLS[(Math.random()*CAR_COLS.length)|0]}; addProp(P);
    propIM.car.setColorAt(i,col.set(P.col)); propIM.cab.setColorAt(i,col.set(0x26343e)); });
  [propIM.car,propIM.cab].forEach(im=>{ if(im.instanceColor) im.instanceColor.needsUpdate=true; });
  props.forEach(setPropMatrix);
  // pasto alto: matas en zonas abiertas (lejos de calles y casas); los tanques lo aplastan
  const N=Math.round(Math.min(7000,W.bx*W.bz*.05)*Q().grass), gg=new THREE.PlaneGeometry(1.6,1.1); gg.translate(0,.55,0);
  const g2=gg.clone(); g2.rotateY(Math.PI/2); const tuft=THREE.BufferGeometryUtils?THREE.BufferGeometryUtils.mergeBufferGeometries([gg,g2]):gg;
  grassIM=new THREE.InstancedMesh(tuft,new THREE.MeshLambertMaterial({map:tuftTex,alphaTest:.5,side:THREE.DoubleSide}),N); grassIM.frustumCulled=false; grassIM.receiveShadow=true;
  let n=0; for(let tries=0;tries<N*3&&n<N;tries++){ const cx=rand(-W.bx,W.bx), cz=rand(-W.bz,W.bz); if((streetSegs.length&&distSegs(cx,cz,streetSegs)<7)||!freeSpot(cx,cz,1)) continue;
    for(let j=0;j<8&&n<N;j++){ const x=cx+rand(-5,5), z=cz+rand(-5,5); if(!freeSpot(x,z,.5)) continue; const G={i:n,x,z,y:heightAt(x,z),s:rand(.7,1.3),a:rand(0,3.14),flat:0};
      setGrass(G); const k=pk(x,z); let a=grassCells.get(k); if(!a){a=[];grassCells.set(k,a);} a.push(G); n++; } }
  grassIM.count=n; worldGroup.add(grassIM);
}
const _pm=new THREE.Matrix4(), _pq=new THREE.Quaternion(), _pq2=new THREE.Quaternion(), _pv=new THREE.Vector3(), _ps=new THREE.Vector3();
function setPropMatrix(P){
  _pq.setFromAxisAngle(new THREE.Vector3(0,1,0),P.a);
  if(P.fallen&&P.axis){ _pq2.setFromAxisAngle(P.axis,P.t*P.t*Math.PI/2*.95); _pq.premultiply(_pq2); }
  const sink=P.sink||0, crush=P.crushed?.4:1;
  _pm.compose(_pv.set(P.x,P.y-sink*1.2,P.z),_pq,_ps.set(1,crush*(1-sink*.9),1)); if(P.gone) _pm.makeScale(0,0,0);
  if(P.kind==='post'){ propIM.post.setMatrixAt(P.i,_pm); propIM.lamp.setMatrixAt(P.i,_pm); propIM.post.instanceMatrix.needsUpdate=propIM.lamp.instanceMatrix.needsUpdate=true; }
  else if(P.kind==='fence'){ propIM.fence.setMatrixAt(P.i,_pm); propIM.fence.instanceMatrix.needsUpdate=true; }
  else if(P.kind==='car'){ propIM.car.setMatrixAt(P.i,_pm); propIM.cab.setMatrixAt(P.i,_pm); propIM.wheels.setMatrixAt(P.i,_pm); propIM.car.instanceMatrix.needsUpdate=propIM.cab.instanceMatrix.needsUpdate=propIM.wheels.instanceMatrix.needsUpdate=true; }
}
function setGrass(G){ _pq.setFromAxisAngle(new THREE.Vector3(0,1,0),G.a); _pm.compose(_pv.set(G.x,G.y,G.z),_pq,_ps.set(G.s,G.s*(G.flat?.18:1),G.s)); grassIM.setMatrixAt(G.i,_pm); grassIM.instanceMatrix.needsUpdate=true; }
function knockProp(P,dx,dz){ if(P.fallen||P.crushed) return; if(P.kind==='car'){ P.crushed=true; setPropMatrix(P); burnCar(P,.55); return; }
  P.fallen=true; const l=Math.hypot(dx,dz)||1; P.axis=new THREE.Vector3(dz/l,0,-dx/l); }
function burnCar(P,k){ const c=new THREE.Color(P.col).multiplyScalar(k); propIM.car.setColorAt(P.i,c); propIM.cab.setColorAt(P.i,c.multiplyScalar(.6)); propIM.car.instanceColor.needsUpdate=propIM.cab.instanceColor.needsUpdate=true; }
function propsNear(x,z,r,fn){ for(let i=Math.floor((x-r)/PCELL);i<=Math.floor((x+r)/PCELL);i++) for(let j=Math.floor((z-r)/PCELL);j<=Math.floor((z+r)/PCELL);j++){ const a=propGrid.get(i+','+j); if(a) for(const P of a) fn(P); } }
function grassNear(x,z,r,fn){ for(let i=Math.floor((x-r)/PCELL);i<=Math.floor((x+r)/PCELL);i++) for(let j=Math.floor((z-r)/PCELL);j<=Math.floor((z+r)/PCELL);j++){ const a=grassCells.get(i+','+j); if(a) for(const G of a) fn(G); } }
function updateProps(dt){
  for(const P of props){ if(P.fallen&&P.t<1){ P.t=Math.min(1,P.t+dt*2.2); setPropMatrix(P); }
    else if(P.fallen&&!P.gone){ P.lie=(P.lie||0)+dt; if(P.lie>30){ P.sink=Math.min(1,(P.lie-30)/3); if(P.sink>=1) P.gone=true; setPropMatrix(P); } } }
}
function buildTerrain(tex,vertexColors){
  const g=new THREE.PlaneGeometry(W.bx*2+60,W.bz*2+60,Math.round(W.bx/2),Math.round(W.bz/2)); g.rotateX(-Math.PI/2);
  const pos=g.attributes.position, cols=[], c=new THREE.Color();
  const grass=new THREE.Color(0x6f7f44), dry=new THREE.Color(0x9a8f5c), mud=new THREE.Color(0x6b5a40);
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),h=heightAt(x,z);pos.setY(i,h);
    if(vertexColors){const sl=Math.abs(heightAt(x+1,z)-h)+Math.abs(heightAt(x,z+1)-h);
      c.copy(grass).lerp(dry,clamp((h+2)/10,0,1)).lerp(mud,clamp(sl*1.4-.2,0,.8)); if(Math.abs(x)<4+Math.sin(z*.05)*2)c.lerp(mud,.6); cols.push(c.r,c.g,c.b);}}
  if(vertexColors) g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  g.computeVertexNormals();
  if(!vertexColors){const uv=g.attributes.uv; for(let i=0;i<pos.count;i++){const [px,py]=toPx(pos.getX(i),pos.getZ(i));uv.setXY(i,(px+PAD)/(IW+2*PAD),1-(py+PAD)/(IH+2*PAD));}}
  const t=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:tex,vertexColors})); t.receiveShadow=true; worldGroup.add(t);
}
function buildZones(){
  for(const Z of W.zones){
    Z.mat=new THREE.MeshBasicMaterial({color:0xefe7d2,side:THREE.DoubleSide});
    const pg=new THREE.CylinderGeometry(.15,.15,1.2,6);
    for(let i=0;i<24;i++){const a=i/24*Math.PI*2,x=Z.x+Math.sin(a)*Z.r,z=Z.z+Math.cos(a)*Z.r;
      if(gridQuery(x,z,1).some(b=>obInside(b,x,z))||(W.water!=null&&heightAt(x,z)<W.water)) continue;
      const p=new THREE.Mesh(pg,Z.mat);p.position.set(x,heightAt(x,z)+.6,z);worldGroup.add(p);}
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,8,8),new THREE.MeshLambertMaterial({color:0x777066}));
    pole.position.set(Z.x,heightAt(Z.x,Z.z)+4,Z.z);pole.castShadow=true;worldGroup.add(pole);
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.4),Z.mat); flag.position.set(Z.x+1.1,heightAt(Z.x,Z.z)+7.2,Z.z); worldGroup.add(flag);
  }
}

function buildCampo(){
  buildTerrain(grassTex,true);
  [[-14,-8,8,7,5],[-14,8,7,9,5],[14,-12,9,7,6],[14,6,7,7,5],[0,20,10,6,5],[-2,-34,8,6,4],
   [-30,-2,6,10,5],[30,-2,6,8,5],[85,40,9,7,5],[-90,-45,8,8,5],[100,-70,7,9,5],[-80,70,9,6,5]]
   .forEach(h=>addBuilding(h[0],h[1],h[2],h[3],h[4],0,0xcfc2a4,0x8a4430,false));
  finalizeBuildings();
  const list=[], sps=['timbo','algarrobo','espinillo','lapacho','pindo'];
  for(let i=0;i<190;i++){const x=rand(-190,190),z=rand(-190,190);
    if(Math.abs(z)>135&&Math.abs(x)<70)continue; if(W.zones.some(Z=>Math.hypot(x-Z.x,z-Z.z)<Z.r+3))continue;
    if(gridQuery(x,z,5).some(b=>x>b.min.x-4&&x<b.max.x+4&&z>b.min.z-4&&z<b.max.z+4))continue;
    list.push({x,z,sp:sps[i%sps.length]});}
  buildTrees(list);
  nodes=null; W.boundary=null;
}

function drawSorGround(ctx,sc,labels){
  ctx.save(); ctx.scale(sc,sc); ctx.translate(PAD,PAD);
  ctx.fillStyle='#6b7246'; ctx.fillRect(-PAD,-PAD,IW+2*PAD,IH+2*PAD);
  const blot=(cols,n,rmin,rmax,poly)=>{for(let i=0;i<n;i++){const x=rand(-PAD,IW+PAD),y=rand(-PAD,IH+PAD);if(poly&&!inPoly(x,y,poly))continue;
    ctx.fillStyle=cols[i%cols.length];ctx.globalAlpha=rand(.35,.8);ctx.beginPath();ctx.ellipse(x,y,rand(rmin,rmax),rand(rmin,rmax)*.7,rand(0,3),0,7);ctx.fill();}ctx.globalAlpha=1;};
  blot(['#857d5a','#5f6a3c','#8c8162','#76794f'],500,6,22);
  ctx.fillStyle='#64703f'; ctx.beginPath(); SOR_MONTE.forEach((q,i)=>i?ctx.lineTo(...q):ctx.moveTo(...q)); ctx.fill();
  blot(['#56633a','#4a5733','#6f7a48'],300,5,18,SOR_MONTE);
  ctx.lineCap='round'; ctx.lineJoin='round';
  for(const s of SOR_STREETS){ctx.strokeStyle=s.pav?'#7f7d77':'#94805f';ctx.lineWidth=s.pav?27:24;
    ctx.beginPath(); s.p.forEach((q,i)=>i?ctx.lineTo(...q):ctx.moveTo(...q)); ctx.stroke();
    ctx.strokeStyle=s.pav?'#8b8982':'#a08b69';ctx.lineWidth=s.pav?20:14;ctx.beginPath(); s.p.forEach((q,i)=>i?ctx.lineTo(...q):ctx.moveTo(...q)); ctx.stroke();}
  if(labels){
    ctx.fillStyle='rgba(255,255,255,.8)'; ctx.font='600 15px "Saira Condensed",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    for(const s of SOR_STREETS){ if(!s.n) continue; for(let k=1;k<s.p.length-1;k+=2){const a=s.p[k],b=s.p[k+1];
      let ang=Math.atan2(b[1]-a[1],b[0]-a[0]); if(ang>Math.PI/2)ang-=Math.PI; if(ang<-Math.PI/2)ang+=Math.PI;
      ctx.save(); ctx.translate((a[0]+b[0])/2,(a[1]+b[1])/2); ctx.rotate(ang); ctx.fillText(s.n,0,0); ctx.restore();}}
  }
  ctx.restore();
}
function buildSor(){
  const SC=3; groundCanvas=document.createElement('canvas'); groundCanvas.width=(IW+2*PAD)*SC; groundCanvas.height=(IH+2*PAD)*SC;
  const gx=groundCanvas.getContext('2d'); drawSorGround(gx,SC,true);
  speckle(gx,groundCanvas.width,groundCanvas.height,90000,['#6d6a52','#b5ab8c','#5f6a3e','#a39e86'],1,3);
  const tex=new THREE.CanvasTexture(groundCanvas); tex.anisotropy=ANISO;
  buildTerrain(tex,false);
  const streets=SOR_STREETS.map(s=>({...s,w:s.p.map(q=>toW(...q))}));
  streetSegs=[]; streets.forEach(s=>{for(let i=0;i<s.w.length-1;i++)streetSegs.push({ax:s.w[i].x,az:s.w[i].z,bx:s.w[i+1].x,bz:s.w[i+1].z});});
  const A=toW(170,492),B=toW(444,425), ang=Math.atan2(-(B.z-A.z),B.x-A.x);
  const WALLS=[0xeeeae0,0xe2d8c4,0xf1e6cf,0xd9cfbd,0xe8d2bc,0xcfc8bb,0xe6dcc0];
  const ROOF={g:[0x7d7e7b,0x767879,0x868580],l:[0x9c9a93,0xa4a29b],d:[0x585b5f,0x4d5054],r:[0x7e4e38,0x8a573f],b:[0x3c455c,0x353d52],w:[0xc9c7c1]};
  const pick=a=>a[(Math.random()*a.length)|0];
  const place=(arr)=>arr.forEach(([px,py,pw,ph,rk])=>{
    let {x,z}=toW(px,py); const w=pw*SPX, d=ph*SPX;
    for(let k=0;k<3;k++){const n=nearestSeg(x,z,streetSegs),req=Math.min(w,d)/2+4.2;
      if(n.d<req&&n.d>.01){x+=(x-n.px)/n.d*(req-n.d); z+=(z-n.pz)/n.d*(req-n.d);}}
    if(rk==='church') addBuilding(x,z,w,d,7,ang,0xf2efe8,0x8e4a35,false);
    else if(rk==='corralon') addBuilding(x,z,w,d,5.5,ang,0xd2c8b4,0x8c8f90,false);
    else addBuilding(x,z,w,d,rand(3,3.8),ang,pick(WALLS),pick(ROOF[rk]||ROOF.g),false);
  });
  place(SOR_BLD); place(SOR_OUT);
  finalizeBuildings();
  const free=(x,z,m)=>!gridQuery(x,z,4).some(b=>obPush(x,z,m,b));
  const list=[];
  for(const [px,py,sp] of SOR_TREES){const {x,z}=toW(px,py); if(distSegs(x,z,streetSegs)>3.5&&free(x,z,.5)) list.push({x,z,sp});}
  const monteSp=['espinillo','espinillo','espinillo','algarrobo','algarrobo','timbo','pindo','ceibo'];
  for(let i=0,n=0;i<3000&&n<130;i++){const px=rand(-PAD,IW),py=rand(380,IH+PAD); if(!inPoly(px,py,SOR_MONTE))continue;
    const {x,z}=toW(px,py); if(distSegs(x,z,streetSegs)<5||!free(x,z,2))continue; list.push({x,z,sp:pick(monteSp)}); n++;}
  const yardSp=['lapacho','jacaranda','ceibo','pindo','espinillo','timbo'];
  for(let i=0,n=0;i<4000&&n<55;i++){const px=rand(-PAD,IW+PAD),py=rand(-PAD,IH+PAD); if(inPoly(px,py,SOR_MONTE))continue;
    const {x,z}=toW(px,py); if(distSegs(x,z,streetSegs)<5.5||!free(x,z,2.2))continue; list.push({x,z,sp:pick(yardSp),s:rand(.6,.95)}); n++;}
  buildTrees(list);
  W.boundary=SOR_BOUND.map(q=>{const p=toW(...q);return [p.x,p.z];});
  nodes=[];
  for(const s of streets){ let prev=null;
    for(let i=0;i<s.w.length-1;i++){const A=s.w[i],B=s.w[i+1],L=Math.hypot(B.x-A.x,B.z-A.z),n=Math.max(1,Math.round(L/6));
      for(let k=(i===0?0:1);k<=n;k++){const t=k/n,p=new THREE.Vector3(A.x+(B.x-A.x)*t,0,A.z+(B.z-A.z)*t);
        if(!inPoly(p.x,p.z,W.boundary)){prev=null;continue;}
        const nd={p,nb:[],s}; nodes.push(nd); if(prev){prev.nb.push(nd);nd.nb.push(prev);} prev=nd;}}}
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j];
    if(a.s!==b.s&&a.p.distanceTo(b.p)<6.5){a.nb.push(b);b.nb.push(a);}}
}
function nearestNode(x,z){
  if(nodes.near){ const ci=Math.floor(x/10), cj=Math.floor(z/10); for(let r=0;r<=8;r++){ let best=null,bd=1e9; for(let i=ci-r;i<=ci+r;i++) for(let j=cj-r;j<=cj+r;j++){ if(Math.max(Math.abs(i-ci),Math.abs(j-cj))!==r) continue; const L=nodes.near.get(i*7919+j); if(L) for(const n of L){ const d=(n.p.x-x)**2+(n.p.z-z)**2; if(d<bd){bd=d;best=n;} } } if(best) return best; } }
  let best=null,bd=1e9;for(const n of nodes){const d=(n.p.x-x)**2+(n.p.z-z)**2;if(d<bd){bd=d;best=n;}}return best;}
function astar(a,b){ // con montículo binario: en los mapas reales hay miles de nodos
  const g=new Map([[a,0]]),from=new Map(),done=new Set(),H=[[a.p.distanceTo(b.p),a]];
  const push=e=>{H.push(e);let i=H.length-1;while(i){const p=(i-1)>>1;if(H[p][0]<=H[i][0])break;[H[p],H[i]]=[H[i],H[p]];i=p;}};
  const pop=()=>{const top=H[0],last=H.pop();if(H.length){H[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<H.length&&H[l][0]<H[m][0])m=l;if(r<H.length&&H[r][0]<H[m][0])m=r;if(m===i)break;[H[m],H[i]]=[H[i],H[m]];i=m;}}return top[1];};
  while(H.length){let cur=pop(); if(done.has(cur)) continue;
    if(cur===b){const path=[cur];while(from.has(cur)){cur=from.get(cur);path.unshift(cur);}return path;}
    done.add(cur);
    for(const nb of cur.nb){ if(done.has(nb)) continue; const ng=g.get(cur)+cur.p.distanceTo(nb.p);if(ng<(g.has(nb)?g.get(nb):1e18)){from.set(nb,cur);g.set(nb,ng);push([ng+nb.p.distanceTo(b.p),nb]);}}}
  return [b];
}
// Mapa con textura pintada a partir del relieve (Malvinas)
const MAL_ROADS=[[[205,-20],[160,-15],[120,-5],[70,8],[20,14],[-10,12],[-60,20],[-120,35],[-180,30],[-235,25]],
  [[-60,20],[-95,60],[-120,92],[-150,118]],[[20,14],[40,-40],[55,-100],[60,-150],[70,-230]],[[120,-5],[110,60],[100,120],[95,175]]];
const TOWN_ST=[[[200,-70],[200,90]],[[185,-70],[185,90]],[[170,-60],[170,80]],[[155,-50],[155,70]],[[150,-60],[205,-60]],[[150,-30],[205,-30]],[[150,0],[205,0]],[[150,30],[205,30]],[[150,60],[205,60]]];
let malCanvas=null; const MAL_E=270, MAL_N=1024;
const malPx=(x,z)=>[(MAL_E-x)/(2*MAL_E)*MAL_N,(MAL_E-z)/(2*MAL_E)*MAL_N];
function paintMalvinas(){
  const N=MAL_N, c=document.createElement('canvas'); c.width=c.height=N; const x=c.getContext('2d'), img=x.createImageData(N,N), d=img.data;
  const sea=[52,74,88], shore=[132,124,98], peat=[92,88,62], moor=[118,112,76], grass=[104,118,70], rock=[128,126,118];
  for(let py=0;py<N;py++)for(let px=0;px<N;px++){
    const wx=MAL_E-px/N*2*MAL_E, wz=MAL_E-py/N*2*MAL_E, h=malvH(wx,wz), sl=Math.abs(malvH(wx+1.5,wz)-h)+Math.abs(malvH(wx,wz+1.5)-h);
    let col; if(h<W.water-.2){const k=clamp((W.water-h)/6,0,1);col=sea.map((v,i)=>v*(1-k*.3));}
    else if(h<W.water+.6) col=shore;
    else { const n=(Math.sin(wx*.37+wz*.21)+Math.sin(wx*.13-wz*.29))*.25+Math.random()*.25;
      col=moor.map((v,i)=>v+(peat[i]-v)*clamp(n+.3,0,1)); col=col.map((v,i)=>v+(grass[i]-v)*clamp((6-h)/8,0,.6));
      col=col.map((v,i)=>v+(rock[i]-v)*clamp(sl*1.1-.6,0,1)); }
    const o=(py*N+px)*4; d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];d[o+3]=255;}
  x.putImageData(img,0,0);
  x.lineCap='round'; x.lineJoin='round';
  const line=(pts,w,cl)=>{x.strokeStyle=cl;x.lineWidth=w;x.beginPath();pts.forEach((p,i)=>{const q=malPx(-p[0],p[1]);i?x.lineTo(...q):x.moveTo(...q);});x.stroke();};
  // arroyo Moody Brook
  const brook=[]; for(let wx=-240;wx<200;wx+=8) brook.push([wx,12+14*Math.sin(wx*.02)]); line(brook,4,'#4f6672');
  MAL_ROADS.forEach(r=>{line(r,14,'#7b7058');line(r,9,'#968a6c');});
  TOWN_ST.forEach(r=>{line(r,12,'#6f6c66');line(r,8,'#8a877f');});
  x.fillStyle='rgba(255,255,255,.8)'; x.font='600 9px "Saira Condensed",sans-serif'; x.textAlign='center';
  for(const [t,wx,wz] of [['Puerto Argentino',178,-90],['Moody Brook',-10,-10],['Monte Longdon',-150,150],['Monte Tumbledown',-135,-140],['Wireless Ridge',-15,165],['Sapper Hill',60,-195]]){const q=malPx(-wx,wz);x.fillText(t,q[0],q[1]);}
  for(let i=0;i<9000;i++){x.fillStyle=['#5e5a40','#8a8460','#6e7448','#7d6f4f'][i%4];x.globalAlpha=rand(.08,.3);const q=[Math.random()*N,Math.random()*N];x.fillRect(q[0],q[1],2,2);} x.globalAlpha=1;
  malCanvas=c; return c;
}
function buildMalvinas(){
  const c=paintMalvinas(), tex=new THREE.CanvasTexture(c); tex.anisotropy=ANISO;
  const g=new THREE.PlaneGeometry(MAL_E*2,MAL_E*2,200,200); g.rotateX(-Math.PI/2);
  const pos=g.attributes.position, uv=g.attributes.uv;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,malvH(x,z));const q=malPx(x,z);uv.setXY(i,q[0]/MAL_N,1-q[1]/MAL_N);}
  g.computeVertexNormals();
  const t=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:tex})); t.receiveShadow=true; worldGroup.add(t);
  waterMesh=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.MeshLambertMaterial({color:0x3e5a6a,transparent:true,opacity:.88}));
  waterMesh.rotation.x=-Math.PI/2; waterMesh.position.y=W.water; worldGroup.add(waterMesh);
  // Puerto Argentino: casas de chapa con techos de colores, catedral de ladrillo
  const roofs=[0xb03a2e,0x3d6b3e,0x3a5a8a,0xc9c7c1,0xa8452f,0x5d7d4c], walls=[0xf2efe6,0xe8e2d2,0xf4f1e8,0xd9d3c3];
  for(let zz=-62;zz<=82;zz+=11) for(const xx of [148,162,177,192,206]){
    const x=-(xx+rand(-2,2)), z=zz+rand(-2,2); if(malvH(x,z)<W.water+.8) continue;
    if(Math.abs(zz-(-30))<5||Math.abs(zz-0)<5||Math.abs(zz-30)<5||Math.abs(zz-60)<5) continue;
    if(Math.random()<.18) continue;
    addBuilding(x,z,rand(6,8.5),rand(6,9),rand(3.2,4.6),Math.PI/2,walls[(Math.random()*walls.length)|0],roofs[(Math.random()*roofs.length)|0],true,100,true);
  }
  addBuilding(-178,-46,10,22,8,Math.PI/2,0x8a4a3a,0x5b5f63,true,220,true);
  addBuilding(-178,-60,4,4,16,0,0x8a4a3a,0x5b5f63,false,160,true);
  // Cuartel de Moody Brook
  [[-30,30],[-5,32],[20,30]].forEach(([x,z])=>addBuilding(-x,z,28,8,4,-0.05,0xd8d2c4,0x6f7275,true,160,true));
  addBuilding(48,0,9,7,3.5,0,0xd8d2c4,0x7d7e7b,true,100,true);
  // Corrales y casillas sueltas
  [[-170,-40],[-60,-70],[90,90],[-100,-10],[30,-80]].forEach(([x,z])=>addBuilding(-x,z,7,6,3.2,rand(0,1.5),0xe8e2d2,0xb03a2e,true,100,true));
  // Piedra: corridas de piedra en las crestas
  const crests=[[-150,120,75,.15],[-135,-105,60,-.35],[-15,140,85,.1],[60,-165,40,0],[-215,-10,40,1.4]];
  for(const [cx,cz,len,a] of crests) for(let i=0;i<26;i++){const u=rand(-len,len)*.9,v=rand(-10,10),x=-(cx+u*Math.cos(a)-v*Math.sin(a)),z=cz+u*Math.sin(a)+v*Math.cos(a);
    if(W.zones.some(Z=>Math.hypot(x-Z.x,z-Z.z)<Z.r*.7))continue; addRock(x,z,rand(2.5,7),rand(2,5),rand(1.5,4.5),rand(0,3));}
  for(let i=0;i<40;i++){const x=-rand(-230,190),z=rand(-230,230); if(malvH(x,z)<W.water+1)continue; addRock(x,z,rand(1.5,3.5),rand(1.5,3),rand(1,2),rand(0,3));}
  finalizeBuildings();
  // Vegetación de las islas: tojo cerca del pueblo y tussac en la costa
  const list=[];
  for(let i=0;i<4000&&list.length<170;i++){const dx=rand(-240,215),x=-dx,z=rand(-240,240),h=malvH(x,z);
    if(h<W.water+.3)continue; if(gridQuery(x,z,4).some(b=>obPush(x,z,2,b)))continue;
    const nearTown=dx>110&&dx<215&&z>-90&&z<100, coast=h<W.water+2.2;
    if(coast&&Math.random()<.8) list.push({x,z,sp:'tussac'}); else if(nearTown&&Math.random()<.6) list.push({x,z,sp:'tojo'}); else if(Math.random()<.12) list.push({x,z,sp:'tojo',s:rand(.6,.9)});}
  buildTrees(list);
  nodes=null; W.boundary=[[-238,-238],[-238,238],[238,238],[238,-238]];
}
function buildMinimapBg(){
  const S=400; mmBg=document.createElement('canvas'); mmBg.width=mmBg.height=S; const x=mmBg.getContext('2d');
  const k=S/(Math.max(W.bx,W.bz)*2+20), tx=v=>S/2-v*k, tz=v=>S/2-v*k;
  if(W.mmCanvas){ x.drawImage(W.mmCanvas,tx(W.mmEX),tz(W.mmEZ),W.mmEX*2*k,W.mmEZ*2*k); }
  else if(W===WORLDS.sor){ x.save(); x.translate(tx(W.bx),tz(W.bz)); drawSorGround(x,k*SPX,false); x.restore(); }
  else if(W===WORLDS.malvinas){ x.drawImage(malCanvas,tx(MAL_E),tz(MAL_E),MAL_E*2*k,MAL_E*2*k); }
  else if(W===WORLDS.cordillera){ x.drawImage(kCanvas,tx(KX),tz(KZ),KX*2*k,KZ*2*k); }
  else if(W===WORLDS.salto||W===WORLDS.posadas){ x.drawImage(xCanvas[W.key],tx(XX),tz(XZ),XX*2*k,XZ*2*k); }
  else if(W.town||W.city){ x.drawImage(townCanvas[W.key],tx(TX),tz(TZ),TX*2*k,TZ*2*k); }
  else if(W===WORLDS.puente){ x.drawImage(puenteCanvas,tx(PX),tz(PZ),PX*2*k,PZ*2*k); }
  else if(W===WORLDS.costanera){ x.drawImage(costCanvas,tx(CEX),tz(CEZ),CEX*2*k,CEZ*2*k); }
  else if(W===WORLDS.aeropuerto){ const EX=(AW/2+APAD)*AS, EZ=(AH/2+APAD)*AS; x.drawImage(aerCanvas,tx(EX),tz(EZ),EX*2*k,EZ*2*k); }
  else { x.fillStyle='#55603a'; x.fillRect(tx(W.bx),tz(W.bz),W.bx*2*k,W.bz*2*k); }
  x.fillStyle='rgba(235,228,210,.85)';
  for(const b of houseBoxes){if(b.dead)continue;const o=b.ob; x.save(); x.translate(tx(o.cx),tz(o.cz)); x.rotate(o.s?Math.atan2(o.s,o.c):0); x.fillRect(-o.hw*k,-o.hd*k,o.hw*2*k,o.hd*2*k); x.restore();}
  if(W.boundary){x.strokeStyle='rgba(255,255,255,.5)';x.setLineDash([6,5]);x.lineWidth=2;x.beginPath();W.boundary.forEach((p,i)=>i?x.lineTo(tx(p[0]),tz(p[1])):x.moveTo(tx(p[0]),tz(p[1])));x.closePath();x.stroke();}
}
// Recorte por sectores: en los mapas grandes el terreno, los árboles y el revestimiento de trincheras van partidos en sectores;
// cada sector se dibuja solo si está dentro de la cámara y más cerca que la niebla (los instanciados no se recortan solos).
const cullList=[], _frus=new THREE.Frustum(), _cullPM=new THREE.Matrix4();
// maxD: distancia máxima a la que vale la pena dibujarlo (detalles chicos); lod: versión liviana que se usa de lejos (a más de lod.d metros)
function cullAdd(o,cx,cy,cz,r,maxD,lod){ const s=new THREE.Sphere(new THREE.Vector3(cx,cy,cz),r); cullList.push({o,s,maxD:maxD||1e9,lod});
  // los rayos (tiros, visión de la IA) prueban primero la esfera del sector antes de revisar cada instancia
  if(o.isInstancedMesh&&!o.userData.rc){ const f=o.raycast; o.userData.rc=1; o.raycast=function(rc,out){ if(rc.ray.intersectsSphere(s)&&rc.ray.origin.distanceTo(s.center)-s.radius<=rc.far) f.call(this,rc,out); }; } }
function cullUpdate(){ if(!cullList.length) return; _cullPM.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse); _frus.setFromProjectionMatrix(_cullPM);
  const far=scene.fog.far+40, cp=camera.position;
  for(const c of cullList){ const d=c.s.center.distanceTo(cp)-c.s.radius, v=d<far&&d<c.maxD&&_frus.intersectsSphere(c.s);
    if(c.lod){ const near=d<c.lod.d; c.o.visible=v&&near; c.lod.m.visible=v&&!near; } else c.o.visible=v; } }
// Agrupa una lista de elementos (con x,z) en sectores cuadrados de 'cell' metros
function cells(list,cell,X=e=>e.x,Z=e=>e.z){ const M=new Map(); for(const e of list){ const k=Math.floor(X(e)/cell)+','+Math.floor(Z(e)/cell); if(!M.has(k)) M.set(k,[]); M.get(k).push(e); } return M; }
function buildWorld(key){
  W=WORLDS[key]; craters.length=0; cullList.length=0;
  // misiones de campaña con un punto como objetivo (tomar, llegar, defender, escoltar, incursión): figura solo ese punto
  if(!W.zones0) W.zones0=W.zones; { const ob=typeof curSpecial!=='undefined'&&curSpecial&&curSpecial.obj, keep=ob&&(ob.zones||(ob.zone&&[ob.zone]));
    W.zones=keep?W.zones0.filter(Z=>keep.includes(Z.id)):W.zones0; }
  worldGroup.children.slice().forEach(o=>{worldGroup.remove(o);if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map&&o.material.map!==grassTex&&o.material.map!==wallTex)o.material.map.dispose();if(o.material!==rockMat)o.material.dispose();}});
  W.mmCanvas=null; W.HG=null; W.deckAt=null; W.propK=1; W.trench=null; W.wire=null; W.wireCrush=null; W.trenchCover=null; W.setup=null;
  houseMeshes=[];houseBoxes=[];trees=[];grid=new Map();pierObs=[];bList=[];rList=[];streetSegs=[];buildings=[];waterMesh=null;
  scene.background.set(W.sky||0xbcc6c4); scene.fog.near=(W.fog||[150,460])[0]; scene.fog.far=(W.fog||[150,460])[1]; scene.fog.color.set(W.sky||0xbcc6c4);
  if(WORLDS[key].osm) buildOSM(key); else if(key==='sor') buildSor(); else if(key==='malvinas') buildMalvinas(); else if(key==='aeropuerto') buildAeropuerto(); else if(key==='costanera') buildCostanera(); else if(key==='puente') buildPuente(); else if(key==='cordillera') buildCordillera(); else if(key==='salto'||key==='posadas') buildCross(key); else if(WORLDS[key].ww1) buildWW1Map(key); else if(WORLDS[key].city) buildCity(key); else if(WORLDS[key].town) buildTown(key); else buildCampo();
  if(!W.ww1) buildProps(); else { props=[]; }
  buildZones(); buildMinimapBg(); findGround(); buildOuter();
  // armas de la infantería y nombres de las naciones según la época del mapa
  ROCKET=RULE().at||ROCKET0; MORTAR=RULE().mortar||MORTAR0; applyEraNations(W.era||5);
}
function buildOuter(){
  // Medida real del escenario construido (sin el agua, que es un plano enorme)
  const bb=new THREE.Box3(), tmp=new THREE.Box3(); let ex=W.bx+30, ez=W.bz+30;
  for(const o of worldGroup.children){ if(o===waterMesh||!o.geometry||o.isInstancedMesh) continue; o.geometry.computeBoundingBox(); tmp.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
    if(tmp.max.x-tmp.min.x>60&&tmp.max.x-tmp.min.x<1500) bb.union(tmp); }
  if(!bb.isEmpty()){ ex=Math.max(W.bx+5,Math.min(Math.abs(bb.min.x),bb.max.x)); ez=Math.max(W.bz+5,Math.min(Math.abs(bb.min.z),bb.max.z)); }
  W.ex=ex; W.ez=ez; if(W.osm){ W.ex=W.mmEX; W.ez=W.mmEZ; }
  if(W.ww1) ww1Outer(); else if(W.osm){ W.ex=W.mmEX; W.ez=W.mmEZ; osmOuter(); } else {
  // Copias en espejo del escenario alrededor (terreno, casas, árboles, postes): sin pasto para que corra liviano
  const mq=Q().mir, big=o=>o.isMesh&&!o.isInstancedMesh&&o.geometry&&(o.geometry.boundingSphere||o.geometry.computeBoundingSphere()||o.geometry.boundingSphere).radius>40;
  const isB=o=>o===wallsIM||o===roofsIM||o===gablesIM;
  const src=worldGroup.children.filter(o=>o!==waterMesh&&o!==grassIM&&(big(o)||(o.isInstancedMesh&&(mq==='todo'||(mq==='medio'&&(isB(o)||Object.values(treeSets).some(x=>x.includes(o))))))));
  for(const [sx,sz] of mq==='terreno'?[[1,0],[-1,0],[0,1],[0,-1]]:[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
    const g=new THREE.Group(); g.scale.set(sx?-1:1,1,sz?-1:1); g.position.set(sx*2*ex,0,sz*2*ez); g.userData.mirror=true;
    const band=OUT+70, inB=(x,z)=>(!sx||(sx>0?x>ex-band:x<-ex+band))&&(!sz||(sz>0?z>ez-band:z<-ez+band));
    for(const o of src){
      if(o.isInstancedMesh){ // solo las instancias cerca del borde que se refleja
        const keep=[], a=o.instanceMatrix.array; for(let k=0;k<o.count;k++) if(inB(a[k*16+12],a[k*16+14])) keep.push(k);
        if(!keep.length) continue; const c=new THREE.InstancedMesh(o.geometry,o.material,keep.length);
        keep.forEach((k,n)=>{ for(let e=0;e<16;e++) c.instanceMatrix.array[n*16+e]=a[k*16+e]; if(o.instanceColor){ if(!c.instanceColor) c.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(keep.length*3),3); for(let e=0;e<3;e++) c.instanceColor.array[n*3+e]=o.instanceColor.array[k*3+e]; } });
        c.frustumCulled=false; c.receiveShadow=true; g.add(c); continue; }
      if(o.geometry.index){ // terreno: solo los triángulos de la franja cercana al borde
        const G=o.geometry, P=G.attributes.position, I=G.index.array, v=new THREE.Vector3(), ok=new Uint8Array(P.count);
        o.updateMatrixWorld(); for(let k=0;k<P.count;k++){ v.fromBufferAttribute(P,k).applyMatrix4(o.matrixWorld); ok[k]=inB(v.x,v.z)?1:0; }
        const idx=[]; for(let k=0;k<I.length;k+=3) if(ok[I[k]]||ok[I[k+1]]||ok[I[k+2]]) idx.push(I[k],I[k+1],I[k+2]);
        if(!idx.length) continue; const NG=new THREE.BufferGeometry(); for(const nm in G.attributes) NG.setAttribute(nm,G.attributes[nm]); NG.setIndex(idx);
        const c=new THREE.Mesh(NG,o.material); c.position.copy(o.position); c.rotation.copy(o.rotation); c.scale.copy(o.scale); c.receiveShadow=true; g.add(c); continue; }
      const ud=o.userData; o.userData={}; const c=o.clone(); o.userData=ud; c.castShadow=false; g.add(c); } worldGroup.add(g); }
  // Las casas reflejadas también chocan (solo de decorado: no se rompen)
  if(mq!=='terreno') for(const b of buildings){ const B=b.box, o=B.ob;
    for(const [sx,sz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const fx=v=>sx?sx*2*ex-v:v, fz=v=>sz?sz*2*ez-v:v, cx=fx(o.cx), cz=fz(o.cz);
      if(Math.abs(cx)>ex+OUT+20||Math.abs(cz)>ez+OUT+20) continue;
      const x1=fx(B.min.x), x2=fx(B.max.x), z1=fz(B.min.z), z2=fz(B.max.z);
      const box=new THREE.Box3(new THREE.Vector3(Math.min(x1,x2),B.min.y,Math.min(z1,z2)),new THREE.Vector3(Math.max(x1,x2),B.max.y,Math.max(z1,z2)));
      box.ob={cx,cz,c:o.c,s:(sx&&sz)?o.s:-o.s,hw:o.hw,hd:o.hd}; box.mir=true; gridAdd(box); } }
  }
  // línea roja del límite en el suelo
  const Bd=W.boundary||[[-W.bx,-W.bz],[-W.bx,W.bz],[W.bx,W.bz],[W.bx,-W.bz]], pts=[];
  for(let i=0;i<Bd.length;i++){ const a=Bd[i], b=Bd[(i+1)%Bd.length], L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.ceil(L/4));
    for(let j=0;j<n;j++){ const x=a[0]+(b[0]-a[0])*j/n, z=a[1]+(b[1]-a[1])*j/n; pts.push(new THREE.Vector3(x,heightAt(x,z)+.35,z)); } }
  pts.push(pts[0].clone()); const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xff3b2a})); worldGroup.add(ln);
}
const outOfBounds=p=>Math.abs(p.x)>W.bx||Math.abs(p.z)>W.bz||(W.boundary&&!inPoly(p.x,p.z,W.boundary));
function assignSpawns(nat0){
  const east=W.eastNat?W.eastNat.includes(nat0):(nat0==='ar'||nat0==='ctes');
  const sp=W.spawns.west?{0:east?W.spawns.east:W.spawns.west,1:east?W.spawns.west:W.spawns.east}:W.spawns;
  W.sp={0:[],1:[]}; for(const tm of [0,1]) for(const s of sp[tm]){const p=s.px?toW(...s.px):{x:s.x,z:s.z}; W.sp[tm].push({label:s.label,x:p.x,z:p.z});}
}

