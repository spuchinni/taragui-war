/* ---------- Daños más reales (pedido de Sebastián) ----------
   - Marcas en el blindaje: agujero con borde de metal brillante y hollín si penetra; golpe con salpicadura si no; surco brillante si rebota.
   - Piezas que se caen: cajones, eslabones, faldones, herramientas y cables que salen volando con los impactos de cañón.
   - Fuego por zonas: llamas por el motor y la escotilla mientras arde, humo negro del motor roto.
   - Tanque destruido que queda ardiendo: el fuego crece y, si llega a la munición (más probable con mucha munición), explota a los 20–60 s.
   - Cañón roto: el tubo queda partido a la mitad, caído, con la punta desgarrada y quemada; el pedazo cae al suelo. Dañado: abollado.
   - Impactos en el suelo: cráter de tierra removida, quemado del explosivo y terrones; la artillería y las bombas dejan cráteres grandes.
   - Edificios: se derrumban de a poco con una nube de polvo; escombros de formas irregulares, losas partidas, hierros y paredes rotas. */

// ---- texturas hechas por código ----
const _dTex=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; f(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.anisotropy=2; return t; };
const _jag=(x,cx,cy,r0,r1,n,R)=>{ x.beginPath(); for(let i=0;i<=n;i++){ const a=i/n*Math.PI*2, r=r0+(r1-r0)*R(); i?x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r):x.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r); } x.closePath(); };
const holeTexT=_dTex(128,128,(x,w)=>{ const R=mulberry0(11), c=w/2;
  const g=x.createRadialGradient(c,c,8,c,c,62); g.addColorStop(0,'rgba(18,15,12,.95)'); g.addColorStop(.45,'rgba(26,22,18,.7)'); g.addColorStop(1,'rgba(30,26,22,0)'); x.fillStyle=g; x.fillRect(0,0,w,w);  // hollín
  x.fillStyle='#bdb7aa'; _jag(x,c,c,17,26,26,R); x.fill();                                                          // borde de metal brillante, desgarrado
  x.strokeStyle='rgba(90,80,70,.8)'; x.lineWidth=2; x.stroke();
  x.fillStyle='#050505'; _jag(x,c,c,10,17,22,R); x.fill(); });                                                      // el agujero
const dentTex=_dTex(128,128,(x,w)=>{ const R=mulberry0(12), c=w/2;
  const g=x.createRadialGradient(c,c,6,c,c,60); g.addColorStop(0,'rgba(40,34,28,.75)'); g.addColorStop(1,'rgba(40,34,28,0)'); x.fillStyle=g; x.fillRect(0,0,w,w);
  x.fillStyle='#a9a398'; _jag(x,c,c,9,16,18,R); x.fill(); x.fillStyle='#d8d2c6'; _jag(x,c,c,4,8,12,R); x.fill();       // salpicadura de metal
  x.strokeStyle='rgba(200,194,182,.7)'; x.lineWidth=1.5; for(let i=0;i<10;i++){ const a=R()*6.28; x.beginPath(); x.moveTo(c+Math.cos(a)*14,c+Math.sin(a)*14); x.lineTo(c+Math.cos(a)*(22+R()*16),c+Math.sin(a)*(22+R()*16)); x.stroke(); } });
const gougeTex=_dTex(128,32,(x,w,h)=>{ const g=x.createLinearGradient(0,0,w,0); g.addColorStop(0,'rgba(220,214,200,0)'); g.addColorStop(.15,'rgba(225,219,206,.95)'); g.addColorStop(.8,'rgba(170,164,152,.8)'); g.addColorStop(1,'rgba(150,144,132,0)');
  x.fillStyle='rgba(30,26,22,.35)'; x.fillRect(4,6,w-8,h-12); x.fillStyle=g; x.beginPath(); x.ellipse(w/2,h/2,w/2-4,h/4,0,0,7); x.fill(); });
const craterTex=_dTex(128,128,(x,w)=>{ const R=mulberry0(13), c=w/2;
  const g=x.createRadialGradient(c,c,4,c,c,62); g.addColorStop(0,'rgba(34,28,20,.95)'); g.addColorStop(.42,'rgba(58,46,32,.85)'); g.addColorStop(.62,'rgba(120,100,74,.7)'); g.addColorStop(.8,'rgba(96,80,58,.35)'); g.addColorStop(1,'rgba(96,80,58,0)');
  x.fillStyle=g; x.fillRect(0,0,w,w);
  for(let i=0;i<90;i++){ const a=R()*6.28, r=26+R()*34; x.fillStyle=R()<.5?'rgba(70,56,40,.8)':'rgba(140,120,92,.7)'; x.fillRect(c+Math.cos(a)*r,c+Math.sin(a)*r,1+R()*4,1+R()*3); } });   // terrones alrededor
const scorchTex2=_dTex(128,128,(x,w)=>{ const R=mulberry0(14), c=w/2;
  const g=x.createRadialGradient(c,c,4,c,c,62); g.addColorStop(0,'rgba(12,10,8,.85)'); g.addColorStop(.5,'rgba(20,16,12,.5)'); g.addColorStop(1,'rgba(20,16,12,0)'); x.fillStyle=g; x.fillRect(0,0,w,w);
  for(let i=0;i<40;i++){ const a=R()*6.28, r=10+R()*44; x.fillStyle=`rgba(14,12,10,${.12+R()*.25})`; x.beginPath(); x.ellipse(c+Math.cos(a)*r,c+Math.sin(a)*r,3+R()*7,2+R()*4,a,0,7); x.fill(); } });   // tierra quemada salpicada
const dustTex=_dTex(128,128,(x,w)=>{ const R=mulberry0(15), c=w/2;
  const g=x.createRadialGradient(c,c,6,c,c,62); g.addColorStop(0,'rgba(120,112,100,.7)'); g.addColorStop(1,'rgba(120,112,100,0)'); x.fillStyle=g; x.fillRect(0,0,w,w);
  for(let i=0;i<160;i++){ const a=R()*6.28, r=R()*58; x.fillStyle=`rgba(${80+R()*60|0},${74+R()*50|0},${64+R()*40|0},.8)`; x.fillRect(c+Math.cos(a)*r,c+Math.sin(a)*r,1+R()*3,1+R()*3); } });
const _decM=map=>new THREE.MeshLambertMaterial({map,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
const holeMat=_decM(holeTexT), dentMat=_decM(dentTex), gougeMat=_decM(gougeTex), _decGeo=new THREE.PlaneGeometry(1,1);

// ---- 1) marcas en el blindaje ----
hitMark=function(hit,pen,res,dir){
  const o=hit.object, par=o.parent; if(!par||!hit.face) return; const t=o.userData.tank; if(!t) return;
  t.marks=t.marks||[]; if(t.marks.length>=16){ const old=t.marks.shift(); old.parent&&old.parent.remove(old); }
  const n=hit.face.normal.clone(), rico=res==='Rebote', m=new THREE.Mesh(_decGeo,pen?holeMat:rico?gougeMat:dentMat); m.userData.mark=1;
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),n);
  if(rico&&dir){ par.updateMatrixWorld(true); const dl=dir.clone().transformDirection(new THREE.Matrix4().copy(par.matrixWorld).invert()); dl.addScaledVector(n,-dl.dot(n));   // el surco sigue la dirección del tiro
    if(dl.lengthSq()>1e-4){ dl.normalize(); const ax=new THREE.Vector3(1,0,0).applyQuaternion(q), ang=Math.atan2(new THREE.Vector3().crossVectors(ax,dl).dot(n),ax.dot(dl)); q.premultiply(new THREE.Quaternion().setFromAxisAngle(n,ang)); } }
  else q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),rand(0,6.28)));
  m.quaternion.copy(q); if(rico) m.scale.set(rand(.9,1.3),rand(.22,.3),1); else m.scale.setScalar(pen?rand(.5,.68):rand(.32,.46));
  m.position.copy(par.worldToLocal(hit.point.clone())).addScaledVector(n,.02); par.add(m); t.marks.push(m);
  if(rico) debris(hit.point,8,sparkMat,9,.5);
  if(!net.guest&&res!=='Rebote') shedParts(t,hit.point,pen);
};

// ---- 2) piezas que se caen ----
const shed=[];
function shedParts(t,pW,big){
  if(t.dead&&!big) return; if(Math.random()>(big?.55:.3)) return;
  const wheels=new Set((t.wheels||[]).map(w=>w.w)), deco=new Set(t.deco||[]), cand=[], wp=new THREE.Vector3();
  t.root.updateMatrixWorld(true);
  t.root.traverse(o=>{ if(!o.isMesh||!o.visible||o.userData.tank||o.userData.mark||o.isInstancedMesh) return;
    for(let p=o;p&&p!==t.root;p=p.parent) if(wheels.has(p)||deco.has(p)||p===t.gunPivot||p===t.barrel) return;
    const g=o.geometry; if(!g.boundingSphere) g.computeBoundingSphere(); o.getWorldScale(wp); const r=g.boundingSphere.radius*Math.max(wp.x,wp.y,wp.z);
    if(r<.06||r>.9) return; o.getWorldPosition(wp); if(wp.y-t.pos.y<.8||wp.distanceTo(pW)>(big?1.5:1.0)) return; cand.push(o); });
  const n=Math.min(cand.length,big?(Math.random()<.5?2:1):1);
  for(let i=0;i<n;i++){ const o=cand.splice((Math.random()*cand.length)|0,1)[0]; scene.attach(o);
    const out=o.position.clone().sub(t.pos).setY(0).normalize();
    shed.push({o,t,v:out.multiplyScalar(rand(2,4.5)).add(new THREE.Vector3(0,rand(2.5,5.5),0)),w:new THREE.Vector3(rand(-6,6),rand(-6,6),rand(-6,6)),rest:false,age:0}); }
}
function updShed(dt){ for(let i=shed.length-1;i>=0;i--){ const S=shed[i]; S.age+=dt;
    if(!S.rest){ S.v.y-=G*dt; S.o.position.addScaledVector(S.v,dt); S.o.rotation.x+=S.w.x*dt; S.o.rotation.y+=S.w.y*dt; S.o.rotation.z+=S.w.z*dt;
      const gh=heightAt(S.o.position.x,S.o.position.z)+.08; if(S.o.position.y<gh&&S.v.y<0){ S.o.position.y=gh; S.v.multiplyScalar(.35); S.v.y=Math.abs(S.v.y)*.3; S.w.multiplyScalar(.4); if(S.v.length()<.8) S.rest=true; } }
    if(S.age>60||!tanks.includes(S.t)){ scene.remove(S.o); shed.splice(i,1); } } }

// ---- 3) fuego por zonas y munición que explota en los tanques destruidos ----
const _fwd=new THREE.Vector3();
function flameAt(p,k){ puff(p.clone().add(new THREE.Vector3(rand(-.35,.35),rand(0,.4),rand(-.35,.35))),Math.random()<.5?0xff7a1a:0xffb03a,rand(1,1.8)*k,rand(.35,.6),2.6*k,1,true); }
function burnFX(t,dt){
  const M=t.T.m, fx=Math.sin(t.heading), fz=Math.cos(t.heading), eng=t.T.engF?1:-1;
  const engP=t.pos.clone().add(new THREE.Vector3(fx*eng*M.L*.32,(t.hTop||M.H*.6)+.25,fz*eng*M.L*.32));
  const hatch=t.turret&&!t.turretOff?t.turret.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,(M.th||.8)+.1,0)):t.pos.clone().setY(t.pos.y+(t.hTop||1.5)+.3);
  if(!t.dead){
    if(t.fireT>0){ t.flT=(t.flT||0)-dt; if(t.flT<=0){ t.flT=.11; flameAt(engP,1); if(Math.random()<.5) flameAt(hatch,.8);
      if(Math.random()<.35) puff(engP.clone().setY(engP.y+1.2),0x1e1b18,rand(2.5,3.6),rand(2.2,3.2),2.4,.62); } }
    else if(t.mod.engine<=0){ t.esT=(t.esT||0)-dt; if(t.esT<=0){ t.esT=.18; puff(engP,0x24211e,rand(1.8,2.6),rand(2.4,3.4),1.8,.6); } }   // motor roto: humo negro espeso
    return; }
  if(!t.burn) return;
  // el fuego crece con el tiempo hasta que llega a la munición (o se apaga solo)
  const f=t.cookAt?clamp(t.deadT/t.cookAt,.15,1):clamp(1.1-t.deadT/40,0,1)*.7, cooked=t.cooked;
  t.flT=(t.flT||0)-dt; if(t.flT<=0&&f>0){ t.flT=cooked?.08:.22-.12*f; flameAt(engP,.8+.8*f); if(Math.random()<f) flameAt(hatch,.7+.9*f);
    if(Math.random()<.5) puff(hatch.clone().setY(hatch.y+1.5),0x15130f,rand(3,5)*(.6+f),rand(4,6),2.8+2*f,.62); }
  if(t.cookAt&&!cooked&&t.deadT>=t.cookAt){ t.cooked=1; t.keepT=t.deadT+28;
    if(typeof rackBlow==='function'&&!t.turretOff) rackBlow(t); else { blast(t.pos.clone().setY(t.pos.y+1.5),1.4); t.cookT=rand(3.5,6); t.cookN=0; }
    if(!net.guest) infBlast(t.pos.clone().setY(t.pos.y+1),8,null);
    if(t.isPlayer||t.pos.distanceTo(camera.position)<500) feed(`El ${t.T.label} destruido explotó: el fuego llegó a la munición`,'var(--paper)'); }
}
// Al quedar destruido: ¿sigue ardiendo? ¿llega el fuego a la munición? (mismo resultado en el anfitrión y en los invitados: sale del número del tanque)
function deadFate(t,rack){
  if(rack||t.drowned||t.cooked){ t.burn=!t.drowned; t.cooked=1; t.keepT=45; return; }
  const R=mulberry0((t.id||1)*7919+31), odds=typeof rackOdds==='function'?rackOdds(t):.7;
  t.burn=R()<.85; t.keepT=45;
  if(t.burn&&R()<.12+.55*odds){ t.cookAt=20+R()*40; t.keepT=t.cookAt+30; } }
{ const _d=destroy; destroy=function(t,by,rack){ const was=t.dead; _d.apply(this,arguments); if(!was&&t.dead) deadFate(t,rack); }; }
{ const _nk=netKill; netKill=function(t,rack){ const was=t.dead; _nk.apply(this,arguments); if(!was&&t.dead) deadFate(t,rack); }; }

// ---- 4) cañón roto y abollado ----
const _tipMat=new THREE.MeshLambertMaterial({color:0x2a2420}), _scarMat=new THREE.MeshLambertMaterial({color:0x4a4038});
const _tipGeo=(()=>{ const g=new THREE.CylinderGeometry(1,1,1,10,1,true), p=g.attributes.position, R=mulberry0(21);   // boca desgarrada (bordes irregulares)
  for(let i=0;i<p.count;i++) if(p.getY(i)>0){ p.setY(i,p.getY(i)+R()*.9); p.setX(i,p.getX(i)*(1+R()*.35)); p.setZ(i,p.getZ(i)*(1+R()*.35)); } g.computeVertexNormals(); return g; })();
setBarrelLook=function(t){
  const m=t.barrelMesh, G=t.barrel; if(!m||!G) return; const b=t.mod.barrel??100, L=t.T.m.gl, r=t.T.m.gr||.05;
  if(!t._bl){ t._bl={pos:m.position.z,sy:m.scale.y,kids:G.children.filter(c=>c!==m&&c.position.z>L*.5&&c.isMesh)}; }
  const B=t._bl, broken=b<=0;
  m.scale.y=broken?B.sy*.5:B.sy; m.position.z=broken?B.pos-L*.25:B.pos; m.rotation.x=Math.PI/2+(b<60&&!broken?.03:0);
  for(const k of B.kids) k.visible=!broken;
  G.rotation.x=broken?.07:0;                                                                         // lo que queda del tubo cae un poco
  if(broken&&!t._tip){ const tip=new THREE.Mesh(_tipGeo,_tipMat); tip.scale.set(r*1.25,.22,r*1.25); tip.rotation.x=Math.PI/2; tip.position.z=B.pos+.0; G.add(tip); t._tip=tip;
    if(!t._bentDone){ t._bentDone=1; t.root.updateMatrixWorld(true); const wp=G.localToWorld(new THREE.Vector3(0,0,L*.75)), piece=new THREE.Mesh(new THREE.CylinderGeometry(r,r,L*.5,8),_tipMat);   // el pedazo cae al suelo
      piece.position.copy(wp); piece.rotation.set(Math.PI/2,0,-(t.heading+t.turretYaw)+rand(-.4,.4),'YXZ'); scene.add(piece); shed.push({o:piece,t,v:new THREE.Vector3(rand(-1,1),rand(1,2),rand(-1,1)),w:new THREE.Vector3(0,0,0),rest:false,age:0}); } }   // cae acostado
  if(!broken&&t._tip){ G.remove(t._tip); t._tip=null; t._bentDone=0; }
  if(b<60&&!broken&&!t._scar){ const s=new THREE.Mesh(new THREE.CylinderGeometry(r*1.18,r*1.18,.16,10),_scarMat); s.rotation.x=Math.PI/2; s.position.z=L*rand(.45,.7); G.add(s); t._scar=s; }   // abolladura quemada
  if(b>=60&&t._scar){ G.remove(t._scar); t._scar=null; }
};

// ---- 5) impactos en el suelo: cráteres, quemado y terrones ----
const DEC_G=240; let gDec=null;
function gDecInit(){ if(gDec) return; const geo=new THREE.PlaneGeometry(1,1); geo.rotateX(-Math.PI/2);
  gDec={}; for(const [k,tx] of [['cr',craterTex],['sc',scorchTex2],['du',dustTex]]){ const im=new THREE.InstancedMesh(geo,_decM(tx),DEC_G); im.frustumCulled=false; im.renderOrder=1;
    const m=new THREE.Matrix4().makeScale(0,0,0); for(let i=0;i<DEC_G;i++) im.setMatrixAt(i,m); scene.add(im); gDec[k]={im,i:0}; } }
function groundDecal(kind,x,z,r){ gDecInit(); const D=gDec[kind], e=1.2, y=heightAt(x,z), nx=heightAt(x-e,z)-heightAt(x+e,z), nz=heightAt(x,z-e)-heightAt(x,z+e);
  const n=new THREE.Vector3(nx,2*e,nz).normalize(), q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),n).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),rand(0,6.28)));
  const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y+.07,z),q,new THREE.Vector3(r*2,1,r*2)); D.im.setMatrixAt(D.i,m); D.i=(D.i+1)%DEC_G; D.im.instanceMatrix.needsUpdate=true; }
const clodMat=new THREE.MeshLambertMaterial({color:0x4a3a28});
function groundHit(p,A){ if(!p) return; const he=A&&(A.kind==='he'||A.kind==='hesh'), sc=(A&&A.sc)||1, snow=(W.dust||0)===0xd8dde0;
  clodMat.color.setHex(snow?0xe8ecee:0x4a3a28);
  groundDecal('cr',p.x,p.z,he?rand(1.1,1.6)*sc:rand(.45,.7)); if(he) groundDecal('sc',p.x,p.z,rand(1.8,2.6)*sc);
  debris(p.clone().setY(p.y+.2),he?7:4,clodMat,he?7:5,he?1.6:1.1);                                                         // terrones
  puff(p.clone().setY(p.y+.3),snow?0xe8ecee:(W.dust||0x7a6a52),rand(2,3)*(he?1.4:1),rand(1.4,2.2),.6,.55); }
// la mancha quemada debajo del tanque destruido: la misma, más suave y apoyada en el suelo
groundMark=function(p,r){ groundDecal('sc',p.x,p.z,r*1.15); };
{ const _ac=addCrater; addCrater=function(p,r,d){ _ac(p,r,d); groundDecal('cr',p.x,p.z,r*1.05); groundDecal('sc',p.x,p.z,r*1.6); }; }

// ---- 6) edificios: derrumbe de a poco, polvo y escombros más reales ----
const falling=[];
{ const _db=damageBuilding; damageBuilding=function(b,dmg,fromNet){ const alive=b&&b.hp>0; _db.apply(this,arguments);
    if(alive&&b.hp<=0){ falling.push({b,t:0}); const g=heightAt(b.x,b.z), H=b.top-b.base;
      for(let k=0;k<14;k++){ const a=k/14*Math.PI*2, r=Math.max(b.w,b.d)*rand(.3,.7); puff(new THREE.Vector3(b.x+Math.cos(a)*r,g+rand(.5,H*.5),b.z+Math.sin(a)*r),0x9e958a,rand(6,10),rand(4,7),rand(.6,1.8),.75); }   // nube de polvo que se abre
      groundDecal('du',b.x,b.z,Math.max(b.w,b.d)*1.1); } }; }
function updFalling(dt){ for(let i=falling.length-1;i>=0;i--){ const F=falling[i], b=F.b; F.t+=dt; const k=Math.min(1,F.t/1.4), e=k*k, H=b.top-b.base, h=H+(1.2-H)*e;
    const m=new THREE.Matrix4(), q=new THREE.Quaternion().setFromEuler(new THREE.Euler(e*.06,b.a,e*.05));
    m.compose(new THREE.Vector3(b.x,b.base+h/2,b.z),q,new THREE.Vector3(b.w*(1+e*.04),h,b.d*(1+e*.04))); wallsIM.setMatrixAt(b.i,m); wallsIM.instanceMatrix.needsUpdate=true;
    if(F.t%.25<dt) debris(new THREE.Vector3(b.x+rand(-b.w/2,b.w/2),b.base+h,b.z+rand(-b.d/2,b.d/2)),3,dirtMat,3,1.2);
    if(k>=1){ m.compose(new THREE.Vector3(b.x,b.base+1.05,b.z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),b.a),new THREE.Vector3(b.w*.98,.6,b.d*.98)); wallsIM.setMatrixAt(b.i,m); wallsIM.instanceMatrix.needsUpdate=true; falling.splice(i,1); } } }
// Escombros: trozos irregulares (no cajas), losas partidas, ladrillos, vigas, hierros retorcidos y paredes con el borde roto
const chunkGeo=(()=>{ const g=new THREE.IcosahedronGeometry(.6,0), p=g.attributes.position, R=mulberry0(31), K=new Map();   // mismo corrimiento para los vértices repetidos: sin rajaduras
  for(let i=0;i<p.count;i++){ const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(3)).join(); if(!K.has(key)) K.set(key,.7+R()*.55); const k=K.get(key); p.setXYZ(i,p.getX(i)*k,p.getY(i)*k*.7,p.getZ(i)*k); } g.computeVertexNormals(); return g; })();
const rodGeo=new THREE.CylinderGeometry(.025,.025,1,4); rodGeo.translate(0,.5,0);
rubble=function(b,g){
  const H=b.top-b.base, c=Math.cos(b.a), sn=Math.sin(b.a), W2=b.w/2, D2=b.d/2, pileH=Math.min(H*.3,3)+.5, tall=H>8;
  const heap=(lx,lz)=>{ const r=Math.max(Math.abs(lx)/(W2*1.2),Math.abs(lz)/(D2*1.2)); return r>=1?0:pileH*(1-r*r)*(.85+.15*Math.sin(lx*1.7+lz*1.3)); };
  const Wp=(lx,lz)=>[b.x+lx*c+lz*sn, b.z-lx*sn+lz*c], col=new THREE.Color(), m=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), up=new THREE.Vector3(0,1,0);
  const brick=(b.wall>>16)>150&&((b.wall>>8)&255)<110;                                                         // pared de ladrillo
  // paredes que quedan en pie, con el borde de arriba roto (tramos de distinta altura)
  const walls=[]; for(const [ax,len,off] of [[0,b.w,D2],[0,b.w,-D2],[1,b.d,W2],[1,b.d,-W2]]){ if(Math.random()<.3) continue;
    const segs=3+((Math.random()*4)|0), sl=len/segs; let hh=rand(1,Math.max(1.4,H*.6));
    for(let s2=0;s2<segs;s2++){ if(Math.random()<.25){ hh=rand(.6,2); continue; } hh=clamp(hh+rand(-1.6,1.6),.6,Math.max(1.2,H*.7)); const u=-len/2+sl*(s2+.5);
      walls.push(ax?{lx:off,lz:u,w:.35,d:sl*.98,h:hh}:{lx:u,lz:off,w:sl*.98,d:.35,h:hh}); } }
  const nC=Math.round(clamp(b.w*b.d/1.3,30,150)), nS=tall?(6+((Math.random()*6)|0)):3, nR=tall?(10+((Math.random()*14)|0)):0;
  const imB=new THREE.InstancedMesh(rubGeo,new THREE.MeshLambertMaterial({color:0xffffff}),walls.length+nS+6), imC=new THREE.InstancedMesh(chunkGeo,new THREE.MeshLambertMaterial({color:0xffffff}),nC);
  let i=0; q.setFromAxisAngle(up,b.a);
  for(const S of walls){ const [x,z]=Wp(S.lx,S.lz), gy=Math.min(heightAt(x,z),g); m.compose(new THREE.Vector3(x,gy+S.h/2-.3,z),q,new THREE.Vector3(S.w,S.h+.3,S.d)); imB.setMatrixAt(i,m); imB.setColorAt(i,col.set(b.wall).multiplyScalar(rand(.55,.8))); i++; }
  for(let k=0;k<nS;k++,i++){ const lx=rand(-W2,W2), lz=rand(-D2,D2), [x,z]=Wp(lx,lz), y=heightAt(x,z)+heap(lx,lz)*.8;          // losas partidas, inclinadas sobre la pila
    e.set(rand(-.5,.5),rand(0,3.14),rand(-.5,.5)); q.setFromEuler(e); m.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(rand(1.8,3.6),.22,rand(1.4,2.8))); imB.setMatrixAt(i,m); imB.setColorAt(i,col.set(0x8a857c).multiplyScalar(rand(.65,.9))); }
  for(let k=0;k<6;k++,i++){ const lx=rand(-W2,W2), lz=rand(-D2,D2), [x,z]=Wp(lx,lz), y=heightAt(x,z)+heap(lx,lz)+.1;              // vigas (madera o acero)
    e.set(rand(-.35,.35),rand(0,3.14),rand(-.35,.35)); q.setFromEuler(e); m.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(.24,.24,rand(2.5,4.5))); imB.setMatrixAt(i,m); imB.setColorAt(i,col.set(tall?0x3a3734:0x5b4632)); }
  for(let k=0;k<nC;k++){ const lx=rand(-W2*1.2,W2*1.2), lz=rand(-D2*1.2,D2*1.2), [x,z]=Wp(lx,lz), hp=heap(lx,lz), s=rand(.5,1.9)*(Math.random()<.2?.45:1);
    e.set(rand(0,3),rand(0,6.28),rand(0,3)); q.setFromEuler(e); m.compose(new THREE.Vector3(x,heightAt(x,z)+hp+s*.15-(hp>0?.15:0),z),q,new THREE.Vector3(s,s*rand(.5,1),s)); imC.setMatrixAt(k,m);
    imC.setColorAt(k,col.set(k%4===0?b.roof:k%4===1?0x8a8178:brick&&k%2?0x8a4434:b.wall).multiplyScalar(rand(.5,.85))); }
  for(const im of [imB,imC]){ im.castShadow=im.receiveShadow=true; im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; worldGroup.add(im); }
  if(nR){ const imR=new THREE.InstancedMesh(rodGeo,new THREE.MeshLambertMaterial({color:0x3e2c22}),nR);                       // hierros retorcidos que asoman
    for(let k=0;k<nR;k++){ const lx=rand(-W2,W2), lz=rand(-D2,D2), [x,z]=Wp(lx,lz); e.set(rand(-.9,.9),rand(0,6.28),rand(-.9,.9)); q.setFromEuler(e);
      m.compose(new THREE.Vector3(x,heightAt(x,z)+heap(lx,lz)*.7,z),q,new THREE.Vector3(1,rand(1,2.6),1)); imR.setMatrixAt(k,m); }
    imR.castShadow=true; imR.instanceMatrix.needsUpdate=true; worldGroup.add(imR); }
  b.heap={pileH}; smolder.push({x:b.x,z:b.z,y:g,t:25});
};

// ---- cuadro por cuadro y limpieza ----
{ const _ua=updateArty; updateArty=function(dt){ _ua(dt); updShed(dt); updFalling(dt); for(const t of tanks) burnFX(t,dt); }; }
{ const _cb=clearBattle; clearBattle=function(){ for(const S of shed) scene.remove(S.o); shed.length=0; falling.length=0;
    if(gDec){ const m=new THREE.Matrix4().makeScale(0,0,0); for(const k in gDec){ for(let i=0;i<DEC_G;i++) gDec[k].im.setMatrixAt(i,m); gDec[k].im.instanceMatrix.needsUpdate=true; gDec[k].i=0; } }
    return _cb.apply(this,arguments); }; }
