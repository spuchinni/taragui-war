/* ---------- Ruinas (pedido de Sebastián: "los escombros flotan, el tanque traspasa las ruinas y los edificios se caen de una") ----------
   - Vida de los edificios según su tamaño (antes tope de 320: una bomba o dos granadas voltean cualquier cosa) y el cañón pega la mitad.
   - Daño de a poco: con 72 % boquetes grandes y cascotes que caen de la pared; con 42 % se derrumban los pisos de arriba (la pared
     baja animada, borde roto arriba, sin techo, montoncito al pie); en 0 se cae todo (danos.js) y queda la montaña de escombros.
   - La montaña es una malla de verdad (`moundGeo`) y es sólida: `W.under` le suma su altura al suelo (los tanques suben por encima,
     los tiros y la vista chocan). Cascotes, losas y vigas se apoyan en su superficie: nada en el aire.
   - Pedazos de pared que quedan en pie: los altos frenan al tanque (rejilla de choques); de rápido los tira (`knockStub`, 07-tanques.js).
   - Los cascotes que se desprenden caen con gravedad, rebotan y quedan en el suelo (`chipIM` de 04-mundo.js), en vez de desaparecer en el aire.
   - Edificios famosos: cúpulas, dinteles y torretas (`L.ex`, gm1-mapas.js) se caen cuando se derrumba la parte que las sostiene.
   - Peso: antes cada derrumbe eran 3 mallas propias con ~150 cascotes (Berlín: ~950 mallas y 930 mil triángulos solo de escombros,
     dibujadas siempre). Ahora van en mallas compartidas por sector de 220 m (`ruPool`), con recorte por cámara y distancia. */
const RU={sec:new Map(), heaps:[], hg:new Map(), fall:[], drop:[], parts:[]}, RU_SEC=220, RU_CELL=20;
const _rm=new THREE.Matrix4(), _rq=new THREE.Quaternion(), _re=new THREE.Euler(), _rv=new THREE.Vector3(), _rs=new THREE.Vector3(), _rc=new THREE.Color(), _rup=new THREE.Vector3(0,1,0), _rZ=new THREE.Matrix4().makeScale(0,0,0);
// perfil de la pila (0 afuera, 1 en el medio): borde suave para que un tanque pueda trepar (máx. ~25°)
const ruProf=(u,v)=>{ const r=Math.cbrt(Math.abs(u*u*u)+Math.abs(v*v*v)); return r>=1?0:(1-r*r)**2*(.88+.12*Math.cos(u*5.3)*Math.cos(v*4.1)); };
const ruTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'); x.fillStyle='#8e887e'; x.fillRect(0,0,128,128);
  for(let i=0;i<420;i++){ const v=105+Math.random()*90|0, br=Math.random()<.09; x.fillStyle=br?`rgb(${v+10},${v*.72|0},${v*.62|0})`:`rgb(${v},${v-4},${v-10})`;
    const X=Math.random()*128, Y=Math.random()*128, r=2+Math.random()*6; x.beginPath(); for(let k=0;k<6;k++){ const a=k/6*6.28+Math.random()*.6; x.lineTo(X+Math.cos(a)*r*(.6+Math.random()*.5),Y+Math.sin(a)*r*(.6+Math.random()*.5)); } x.fill();
    if(Math.random()<.5){ x.fillStyle='rgba(20,18,16,.35)'; x.fillRect(X+r*.4,Y+r*.4,r*.8,r*.5); } }
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; })();
const moundGeo=(()=>{ const g=new THREE.PlaneGeometry(2,2,16,16); g.rotateX(-Math.PI/2); const p=g.attributes.position, uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){ const u=p.getX(i), v=p.getZ(i), f=ruProf(u,v), n=Math.sin(u*23.1+v*7.7)*Math.cos(v*19.3-u*3.1);
    p.setY(i,f>0?f+n*.05*Math.min(1,f*4):-.18); uv.setXY(i,u*1.5,v*1.5); }
  g.computeVertexNormals(); return g; })();
const ruMat={B:new THREE.MeshLambertMaterial({color:0xffffff}), C:new THREE.MeshLambertMaterial({color:0xffffff}), R:new THREE.MeshLambertMaterial({color:0x3e2c22}), M:new THREE.MeshLambertMaterial({color:0xffffff,map:ruTex})};
const RU_CAP={B:700,C:1300,R:220,M:70}, RU_FAR={B:900,C:380,R:240,M:1400};
function ruPool(x,z){ const ix=Math.floor(x/RU_SEC), iz=Math.floor(z/RU_SEC), k=ix+','+iz; let P=RU.sec.get(k);
  if(P&&P.M.parent===worldGroup) return P;
  P={n:{B:0,C:0,R:0,M:0}}; const geo={B:rubGeo,C:chunkGeo,R:rodGeo,M:moundGeo}, cx=(ix+.5)*RU_SEC, cz=(iz+.5)*RU_SEC;
  for(const K of ['M','B','C','R']){ const im=new THREE.InstancedMesh(geo[K],ruMat[K],RU_CAP[K]); for(let i=0;i<RU_CAP[K];i++){ im.setMatrixAt(i,_rZ); im.setColorAt(i,_rc.set(0xffffff)); }
    im.count=0; im.frustumCulled=false; im.receiveShadow=true; im.castShadow=K==='B'||K==='M'; worldGroup.add(im); cullAdd(im,cx,6,cz,RU_SEC*.71+30,RU_FAR[K]); P[K]=im; }
  RU.sec.set(k,P); return P; }
function ruAdd(P,K,m,col){ const im=P[K], cap=RU_CAP[K], i=P.n[K]%cap; P.n[K]++; im.setMatrixAt(i,m); if(col) im.setColorAt(i,col); im.count=Math.min(cap,P.n[K]);
  im.instanceMatrix.needsUpdate=true; if(col) im.instanceColor.needsUpdate=true; return i; }
function ruDel(P,K,i){ P[K].setMatrixAt(i,_rZ); P[K].instanceMatrix.needsUpdate=true; }
// ---- suelo de las pilas (lo usan los tanques, los tiros y la vista por W.under → hAtY) ----
function ruHeap(b,pileH,g){ let H=b.ruH;
  if(!H){ H={x:b.x,z:b.z,c:Math.cos(b.a),s:Math.sin(b.a),ex:b.w/2*1.3,ez:b.d/2*1.3,g,p:0}; b.ruH=H; RU.heaps.push(H); const r=Math.hypot(H.ex,H.ez);
    for(let i=Math.floor((b.x-r)/RU_CELL);i<=Math.floor((b.x+r)/RU_CELL);i++) for(let j=Math.floor((b.z-r)/RU_CELL);j<=Math.floor((b.z+r)/RU_CELL);j++){ const k=i+','+j; if(!RU.hg.has(k)) RU.hg.set(k,[]); RU.hg.get(k).push(H); } }
  H.p=Math.max(H.p,pileH); return H; }
function ruUnder(x,z){ const a=RU.hg.get(Math.floor(x/RU_CELL)+','+Math.floor(z/RU_CELL)); if(!a) return null; let best=null;
  for(const H of a){ const dx=x-H.x, dz=z-H.z, f=ruProf((dx*H.c-dz*H.s)/H.ex,(dx*H.s+dz*H.c)/H.ez); if(f>0){ const y=H.g+H.p*f; if(best===null||y>best) best=y; } }
  return best===null?null:Math.max(best,heightAt(x,z)); }
function ruInstallUnder(){ if(W._ruOn) return; W._ruPrev=W.under; W._ruOn=true; const prev=W.under;
  W.under=(x,z,y)=>{ if(prev){ const u=prev(x,z,y); if(u!=null) return u; } return RU.heaps.length?ruUnder(x,z):null; }; }
{ const _bw=buildWorld; buildWorld=function(key){ const Wk=WORLDS[key]; if(Wk&&Wk._ruOn){ Wk.under=Wk._ruPrev; Wk._ruOn=false; }
    RU.sec.clear(); RU.heaps.length=0; RU.hg.clear(); RU.parts.length=0; RU.drop.length=0; for(const F of RU.fall) scene.remove(F.m); RU.fall.length=0;
    const r=_bw.apply(this,arguments); ruInstallUnder(); return r; }; }
// ---- vida según el tamaño ----
{ const _ab=addBuilding; addBuilding=function(x,z,w,d,h,a,wall,roof,check,hp,pitched){ const ok=_ab.apply(this,arguments);
    if(ok){ const r=bList[bList.length-1], H=r.top-r.base; r.H0=H; r.hp=r.max=Math.round(clamp(Math.max(hp||0,120+w*d*.9+w*d*Math.max(0,H-1)*.12),150,3500)); } return ok; }; }
// ---- ayudas ----
const ruWp=(b,lx,lz)=>[b.x+lx*Math.cos(b.a)+lz*Math.sin(b.a), b.z-lx*Math.sin(b.a)+lz*Math.cos(b.a)];
const ruMatC={}; const ruFallMat=hex=>ruMatC[hex]||(ruMatC[hex]=new THREE.MeshLambertMaterial({color:hex}));
function ruRng(b,k){ return mulberry0((b.i+1)*7919+k*104729); }
// cascotes que se desprenden: caen, rebotan y quedan en el suelo (pasan a la reserva de cascotes chipIM)
function ruChunks(p,nx,nz,n,hex,spd=1){ for(let k=0;k<n;k++){ if(RU.fall.length>110) return;
    const s=rand(.18,.55), m=new THREE.Mesh(chunkGeo,ruFallMat(hex)); m.scale.set(s,s*rand(.55,.9),s); m.position.set(p.x+rand(-.8,.8),p.y+rand(-.6,.6),p.z+rand(-.8,.8)); m.rotation.set(rand(0,3),rand(0,6),rand(0,3));
    m.castShadow=true; scene.add(m); RU.fall.push({m,s,hex,b:0,v:new THREE.Vector3(nx*rand(1,3.5)*spd+rand(-1,1),rand(-.5,2),nz*rand(1,3.5)*spd+rand(-1,1)),w:new THREE.Vector3(rand(-6,6),rand(-6,6),rand(-6,6))}); } }
function ruChunkUpd(dt){ for(let i=RU.fall.length-1;i>=0;i--){ const F=RU.fall[i], m=F.m; F.v.y-=G*dt; m.position.addScaledVector(F.v,dt); m.rotation.x+=F.w.x*dt; m.rotation.y+=F.w.y*dt; m.rotation.z+=F.w.z*dt;
    const gy=hAtY(m.position.x,m.position.z,m.position.y+1); if(m.position.y-F.s*.3>gy) continue;
    if(F.b<1&&F.v.y<-3){ F.b++; m.position.y=gy+F.s*.3; F.v.y*=-.28; F.v.x*=.45; F.v.z*=.45; F.w.multiplyScalar(.4); continue; }
    decPools(); _rm.compose(_rv.set(m.position.x,gy+F.s*.18,m.position.z),m.quaternion,m.scale); chipIM.setMatrixAt(chipK,_rm); chipIM.setColorAt(chipK,_rc.set(F.hex));
    chipK=(chipK+1)%CHIP_N; chipIM.instanceMatrix.needsUpdate=true; chipIM.instanceColor.needsUpdate=true; scene.remove(m); RU.fall.splice(i,1); } }
// ---- 1) boquetes: agujeros grandes con hollín y la pared que se desarma ----
function ruBreach(b,n,k0){ const R=ruRng(b,k0), H=b.top-b.base-1, W2=b.w/2, D2=b.d/2, hex=_rc.set(b.wall).multiplyScalar(.7).getHex();
  for(let k=0;k<n;k++){ const f=(R()*4)|0, nx=f===2?1:f===3?-1:0, nz=f===0?1:f===1?-1:0, lx=nx?nx*W2:(R()*2-1)*(W2-1), lz=nz?nz*D2:(R()*2-1)*(D2-1);
    const [x,z]=ruWp(b,lx,lz), y=b.base+1+1.2+R()*Math.max(.5,H-2.4), p=new THREE.Vector3(x,y,z), wn=new THREE.Vector3(nx,0,nz).applyAxisAngle(_rup,b.a);
    markBuilding({point:p,face:{normal:new THREE.Vector3(nx,0,nz)}},b,1.4+R()*1.3,'big'); ruChunks(p.addScaledVector(wn,.4),wn.x,wn.z,5,hex);
    puff(p.clone(),0xa89c8a,rand(3,5),rand(1.5,2.5),.6,.6); } }
// ---- 2) derrumbe parcial: se caen los pisos de arriba ----
function ruTopsOff(b){ _rm.makeScale(0,0,0); roofsIM.setMatrixAt(b.i,_rm); gablesIM.setMatrixAt(b.i,_rm); roofsIM.instanceMatrix.needsUpdate=gablesIM.instanceMatrix.needsUpdate=true; if(rtankIM){ rtankIM.setMatrixAt(b.i,_rm); rtankIM.instanceMatrix.needsUpdate=true; } }
function ruWall(b,h){ _rq.setFromAxisAngle(_rup,b.a); _rm.compose(_rv.set(b.x,b.base+h/2,b.z),_rq,_rs.set(b.w,h,b.d)); wallsIM.setMatrixAt(b.i,_rm); wallsIM.instanceMatrix.needsUpdate=true; }
function ruPartial(b,instant){ const H=b.top-b.base, R=ruRng(b,7), nh=Math.max(3.2,H*(.42+R()*.2)); b.H0=b.H0||H; b.top=b.base+nh; b.box.max.y=b.top+.4; ruTopsOff(b); clearMarks(b);
  ruExtras(b); if(instant){ ruWall(b,nh); ruPartialEnd(b); return; }
  RU.parts.push({b,t:0,h0:H,h1:nh}); const g=heightAt(b.x,b.z), hex=_rc.set(b.wall).multiplyScalar(.7).getHex();
  for(let k=0;k<8;k++){ const a=k/8*6.28, r=Math.max(b.w,b.d)*.5; puff(new THREE.Vector3(b.x+Math.cos(a)*r,b.base+nh+rand(0,H-nh),b.z+Math.sin(a)*r),0x9e958a,rand(5,8),rand(3,5),rand(.4,1.2),.7); }
  for(let k=0;k<4;k++){ const a=rand(0,6.28); ruChunks(new THREE.Vector3(b.x+Math.cos(a)*b.w*.45,b.base+nh+1,b.z+Math.sin(a)*b.d*.45),Math.cos(a),Math.sin(a),5,hex,1.3); }
  if(!sfx('expl',new THREE.Vector3(b.x,g,b.z),.45,{rate:.7})) boom(distVol(new THREE.Vector3(b.x,g,b.z),.35),1,300); }
function ruPartialEnd(b){ const R=ruRng(b,11), P=ruPool(b.x,b.z), top=b.top, W2=b.w/2, D2=b.d/2, g=heightAt(b.x,b.z); b.ru=b.ru||{B:[],M:null,P};
  _rq.setFromAxisAngle(_rup,b.a);
  for(const [ax,len,off] of [[0,b.w,D2],[0,b.w,-D2],[1,b.d,W2],[1,b.d,-W2]]){ const segs=3+((R()*4)|0), sl=len/segs;      // borde de arriba roto: tramos de pared de distinta altura
    for(let s=0;s<segs;s++){ if(R()<.3) continue; const hh=.4+R()*2.4, u=-len/2+sl*(s+.5), [x,z]=ruWp(b,ax?off:u,ax?u:off);
      _rm.compose(_rv.set(x,top+hh/2-.05,z),_rq,_rs.set(ax?.34:sl*.97,hh,ax?sl*.97:.34)); b.ru.B.push(ruAdd(P,'B',_rm,_rc.set(b.wall).multiplyScalar(.55+R()*.2))); } }
  const pileH=clamp(b.H0*.07,.5,1.1); _rm.compose(_rv.set(b.x,g-.05,b.z),_rq,_rs.set(W2*1.3,pileH,D2*1.3));                  // lo que cayó al pie
  b.ru.M=ruAdd(P,'M',_rm,_rc.set(b.wall).lerp(new THREE.Color(0x8a8478),.6).multiplyScalar(.85)); ruHeap(b,pileH,g); }
function ruPartUpd(dt){ for(let i=RU.parts.length-1;i>=0;i--){ const A=RU.parts[i], b=A.b; A.t+=dt; const k=Math.min(1,A.t/1.1), e=k*k;
    ruWall(b,A.h0+(A.h1-A.h0)*e); if(A.t%.2<dt) ruChunks(new THREE.Vector3(b.x+rand(-b.w/2,b.w/2),b.base+A.h0+(A.h1-A.h0)*e,b.z+rand(-b.d/2,b.d/2)),rand(-1,1),rand(-1,1),2,_rc.set(b.wall).multiplyScalar(.7).getHex(),.6);
    if(k>=1){ RU.parts.splice(i,1); ruPartialEnd(b); } } }
// ---- 3) derrumbe total: la montaña de escombros (reemplaza la de danos.js) ----
rubble=function(b,g){
  const R=ruRng(b,3), rr=(a,c)=>a+R()*(c-a), H0=b.H0||(b.top-b.base), W2=b.w/2, D2=b.d/2, tall=H0>8, P=ruPool(b.x,b.z);
  if(b.ru){ for(const i of b.ru.B) ruDel(b.ru.P,'B',i); b.ru.B.length=0; }                                                // el borde roto del derrumbe parcial ya no está
  const pileH=clamp(H0*.2,.9,2.6)*rr(.85,1.1), brick=(b.wall>>16)>150&&((b.wall>>8)&255)<110, up=_rup;
  _rq.setFromAxisAngle(up,b.a); _rm.compose(_rv.set(b.x,g-.05,b.z),_rq,_rs.set(W2*1.3,pileH,D2*1.3));
  const mc=_rc.set(b.wall).lerp(new THREE.Color(0x8a8478),.55).multiplyScalar(rr(.75,.92));
  if(b.ru&&b.ru.M!=null){ b.ru.P.M.setMatrixAt(b.ru.M,_rm); b.ru.P.M.setColorAt(b.ru.M,mc); b.ru.P.M.instanceMatrix.needsUpdate=b.ru.P.M.instanceColor.needsUpdate=true; } else { b.ru={B:[],M:ruAdd(P,'M',_rm,mc),P}; }
  ruHeap(b,pileH,g);
  const on=(lx,lz)=>{ const [x,z]=ruWp(b,lx,lz), f=ruProf(lx/(W2*1.3),lz/(D2*1.3)), gh=heightAt(x,z); return [x,z,f>0?Math.max(gh,g+pileH*f):gh]; };
  // paredes que quedan en pie con el borde de arriba roto; las altas frenan al tanque
  for(const [ax,len,off] of [[0,b.w,D2],[0,b.w,-D2],[1,b.d,W2],[1,b.d,-W2]]){ if(R()<.3) continue;
    const segs=3+((R()*4)|0), sl=len/segs; let hh=rr(1,Math.max(1.4,H0*.5));
    for(let s=0;s<segs;s++){ if(R()<.25){ hh=rr(.6,1.6); continue; } hh=clamp(hh+rr(-1.6,1.6),.6,Math.max(1.2,H0*.6)); const u=-len/2+sl*(s+.5), [x,z]=ruWp(b,ax?off:u,ax?u:off), gy=Math.min(heightAt(x,z),g);
      _rq.setFromAxisAngle(up,b.a); _rm.compose(_rv.set(x,gy+hh/2-.3,z),_rq,_rs.set(ax?.35:sl*.98,hh+.3,ax?sl*.98:.35)); const i=ruAdd(P,'B',_rm,_rc.set(b.wall).multiplyScalar(rr(.55,.8)));
      if(hh>1.4) ruStub(b,P,i,x,z,ax?.18:sl*.49,ax?sl*.49:.18,gy,hh); } }
  for(let k=0;k<(tall?6:3);k++){ const [x,z,y]=on(rr(-W2,W2)*.8,rr(-D2,D2)*.8); _re.set(rr(-.45,.45),rr(0,3.14),rr(-.45,.45)); _rq.setFromEuler(_re);      // losas partidas sobre la pila
    _rm.compose(_rv.set(x,y-.04,z),_rq,_rs.set(rr(1.6,3.2),.22,rr(1.2,2.6))); ruAdd(P,'B',_rm,_rc.set(0x8a857c).multiplyScalar(rr(.65,.9))); }
  for(let k=0;k<4;k++){ const [x,z,y]=on(rr(-W2,W2)*.9,rr(-D2,D2)*.9); _re.set(rr(-.3,.3),rr(0,3.14),rr(-.3,.3)); _rq.setFromEuler(_re);                  // vigas
    _rm.compose(_rv.set(x,y+.06,z),_rq,_rs.set(.24,.24,rr(2.5,4.2))); ruAdd(P,'B',_rm,_rc.set(tall?0x3a3734:0x5b4632)); }
  const nC=Math.round(clamp(b.w*b.d/5,12,45));                                                                               // cascotes apoyados en la pila
  for(let k=0;k<nC;k++){ const [x,z,y]=on(rr(-W2,W2)*1.25,rr(-D2,D2)*1.25), s=rr(.35,1.3)*(R()<.25?.5:1); _re.set(rr(0,3),rr(0,6.28),rr(0,3)); _rq.setFromEuler(_re);
    _rm.compose(_rv.set(x,y+s*.1,z),_rq,_rs.set(s,s*rr(.5,.9),s)); ruAdd(P,'C',_rm,_rc.set(k%4===0?b.roof:k%4===1?0x8a8178:brick&&k%2?0x8a4434:b.wall).multiplyScalar(rr(.5,.85))); }
  if(tall) for(let k=0,n=6+((R()*8)|0);k<n;k++){ const [x,z,y]=on(rr(-W2,W2)*.9,rr(-D2,D2)*.9); _re.set(rr(-.9,.9),rr(0,6.28),rr(-.9,.9)); _rq.setFromEuler(_re);  // hierros que asoman
    _rm.compose(_rv.set(x,y-.15,z),_rq,_rs.set(1,rr(1,2.4),1)); ruAdd(P,'R',_rm); }
  b.heap={pileH}; smolder.push({x:b.x,z:b.z,y:g,t:25});
};
// pedazos de pared en pie: chocan; un tanque rápido los voltea
function ruStub(b,P,i,x,z,hw,hd,gy,h){ const c=Math.cos(b.a), s=Math.sin(b.a); let a=1e9,A=-1e9,e=1e9,E=-1e9;
  for(const [lx,lz] of [[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]]){ const wx=x+lx*c+lz*s, wz=z-lx*s+lz*c; a=Math.min(a,wx); A=Math.max(A,wx); e=Math.min(e,wz); E=Math.max(E,wz); }
  const box=new THREE.Box3(new THREE.Vector3(a,gy-1,e),new THREE.Vector3(A,gy+h,E)); box.ob={cx:x,cz:z,c,s,hw,hd}; box.stub={P,i,x,z,gy,h,hw,hd,a:b.a,col:b.wall}; gridAdd(box); }
function knockStub(box,t,dx,dz){ const S=box.stub; if(box.dead) return; box.dead=true; t.speed*=.7;
  _rq.setFromAxisAngle(_rup,S.a); _rm.compose(_rv.set(S.x+dx*S.h*.35,S.gy+.12,S.z+dz*S.h*.35),_rq,_rs.set(Math.max(S.hw*2,.5)*1.05,.35,Math.max(S.hd*2,.5)*1.05)); S.P.B.setMatrixAt(S.i,_rm); S.P.B.instanceMatrix.needsUpdate=true;
  const p=new THREE.Vector3(S.x,S.gy+S.h*.5,S.z); puff(p.clone(),0xa89c8a,rand(4,6),rand(1.5,2.5),.6,.65); ruChunks(p,dx,dz,6,_rc.set(S.col).multiplyScalar(.7).getHex(),.8);
  if(!sfx('expl',p,.25,{rate:1.4})) boom(distVol(p,.2),.6,250); }
// ---- cúpulas, torres y dinteles de los edificios famosos: se caen con lo que las sostiene ----
function ruExtras(b){ const L=b.lm; if(!L||!L.ex) return;
  for(const o of L.ex){ if(o.userData.ruF) continue; let sup=null, top=-1e9;
    for(const q of L.bs){ const dx=o.position.x-q.x, dz=o.position.z-q.z, c=Math.cos(q.a), s=Math.sin(q.a); if(Math.abs(dx*c-dz*s)<q.w/2+.5&&Math.abs(dx*s+dz*c)<q.d/2+.5&&q.H0>top){ sup=q; top=q.H0; } }
    if(sup&&sup!==b&&sup.hp>0&&!(sup.ruSt>=2)) continue;                                                                      // la sostiene otra parte que sigue entera
    o.userData.ruF=1; const bb=new THREE.Box3().setFromObject(o), hy=(bb.max.y-bb.min.y)/2, big=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z,hy*2), k=Math.min(1,5/big);   // las largas giran poco
    RU.drop.push({o,hy,off:o.position.y-(bb.min.y+bb.max.y)/2,r0:o.rotation.clone(),v:new THREE.Vector3(rand(-1.5,1.5)*k,0,rand(-1.5,1.5)*k),w:new THREE.Vector3(rand(-.7,.7)*k,0,rand(-.7,.7)*k)}); } }
function ruDropUpd(dt){ for(let i=RU.drop.length-1;i>=0;i--){ const D=RU.drop[i], o=D.o; D.v.y-=G*dt; o.position.addScaledVector(D.v,dt); o.rotation.x+=D.w.x*dt; o.rotation.z+=D.w.z*dt;
    const gy=hAtY(o.position.x,o.position.z,o.position.y), bot=o.position.y-D.off-D.hy*.55; if(bot>gy) continue;
    o.rotation.x=D.r0.x+clamp(o.rotation.x-D.r0.x,-.15,.15); o.rotation.z=D.r0.z+clamp(o.rotation.z-D.r0.z,-.15,.15);                  // queda acostada, apenas torcida
    o.position.y+=gy-bot; RU.drop.splice(i,1); const p=o.position.clone().setY(gy+1);
    for(let k=0;k<6;k++) puff(p.clone().add(new THREE.Vector3(rand(-4,4),rand(0,2),rand(-4,4))),0x9e958a,rand(6,10),rand(3,5),rand(.5,1.5),.75);
    ruChunks(p,0,0,10,0x8a8478,1.5); if(!sfx('expl',p,.7,{rate:.55})) boom(distVol(p,.6),1.3,350); shake=Math.max(shake,clamp(1-p.distanceTo(camera.position)/150,0,.5)); } }
// ---- etapas según la vida que le queda ----
function ruStage(b){ const f=b.hp/b.max, st=b.ruSt||0;
  if(st<1&&f<.72){ b.ruSt=1; ruBreach(b,2+(b.w*b.d>150?1:0),1); }
  if(st<2&&f<.42){ b.ruSt=2; if(b.top-b.base>5.5) ruPartial(b,false); else { ruTopsOff(b); ruBreach(b,2,2); } } }
{ const _db=damageBuilding; damageBuilding=function(b,dmg,fromNet){ const was=b?b.hp:0; const r=_db.apply(this,arguments);
    try{ if(b&&b.hp<was){ if(b.hp>0) ruStage(b); else if(was>0){ RU.parts=RU.parts.filter(A=>A.b!==b); b.ruSt=3; ruExtras(b);
          const g=heightAt(b.x,b.z), hex=_rc.set(b.wall).multiplyScalar(.7).getHex(); for(let k=0;k<5;k++){ const a=rand(0,6.28); ruChunks(new THREE.Vector3(b.x+Math.cos(a)*b.w*.5,g+rand(2,Math.max(3,b.top-g)),b.z+Math.sin(a)*b.d*.5),Math.cos(a),Math.sin(a),4,hex,1.4); } } } }
    catch(e){ console.error(e); } return r; }; }
// casas en ruinas desde el arranque: algunas ya con los pisos de arriba caídos (sorteo fijo por edificio: igual en todas las PCs)
{ const _rb=ruinBuilding; ruinBuilding=function(b,collapse){ const r=_rb.apply(this,arguments);
    if(!collapse&&b.top-b.base>5.5&&ruRng(b,5)()<.5){ b.ruSt=2; ruPartial(b,true); } else if(!collapse) b.ruSt=1; return r; }; }
// ---- cuadro por cuadro ----
{ const _ua=updateArty; updateArty=function(dt){ _ua(dt); ruChunkUpd(dt); ruPartUpd(dt); ruDropUpd(dt); }; }
