/* ---------- Más realismo en los tanques (pedido de Sebastián, "tanda 1") ----------
   1) Cuánto baja y sube el cañón de cada tanque (T.depr / T.elevMax, en grados; aimAt en 07-tanques.js). Los soviéticos bajaban poco
      (torres bajas: −3° a −5°), los estadounidenses y británicos mucho (−10° a −15°): cambia cómo se pelea detrás de una loma.
   2) Velocidad con que sube y baja el cañón según la clase (T.elevSp, rad/s; antes 28°/s para todos): a manivela, 6–12°/s.
   3) Huellas de orugas en el suelo: marcadas en nieve y barro, suaves en el desierto (updateTracks).
   4) Estiba de munición: la torre sale volando y cae al costado, chorro de fuego y la munición que sigue reventando (rackBlow).
      Menos probable con poca munición a bordo y con estiba húmeda (T.wet: Sherman "W", Pershing). */

// [depresión, elevación] en grados
const GUN_ARC_NAT={de:[8,20],ru:[5,25],us:[10,20],uk:[12,20],fr:[10,20],it:[10,20],jp:[9,20],cn:[8,20],ar:[8,20]};
const GUN_ARC={
  pz3j:[10,20],pz4f2:[8,20],pz4h:[8,20],stug3g:[6,20],panther:[8,18],tiger1:[8,15],tiger2:[8,15],jagdpanther:[8,14],pz38t:[10,25],
  t70:[6,20],t34:[5,25],t3485:[5,22],kv1:[5,25],kv2:[3,18],is2:[3,20],su100:[2,17],bt7:[6,25],t26cn:[6,22],
  m3stuart:[10,20],m4a1:[10,25],m4a3e8:[10,25],m10:[10,19],m18:[10,19],m24:[10,15],m26:[10,20],m36:[10,20],
  matilda2:[15,20],crusader3:[12,20],cromwell:[12,20],churchill7:[12,20],firefly:[5,20],comet:[12,20],valentine:[8,20],achilles:[10,19],
  chiha:[9,20],chihe:[9,20],chinu:[9,20],hago:[9,20],nahuel:[8,20]};
// grados por segundo al subir o bajar el cañón
const ELEV_SP={ligero:12,medio:9,pesado:6,cazatanques:7,principal:20};
const WET_STOW=['m4a3e8','m26','m24','m36'];
const deg=Math.PI/180;
for(const k in VEH){ const V=VEH[k]; if(V.aa||V.support) continue;
  let a=GUN_ARC[k];
  if(!a){ if(V.static) a=[5,V.era<=2?40:25]; else if(V.era<=2) a=V.nation==='ru'?[5,25]:[6,20]; else if(V.era>=5) a=V.nation==='ru'?[5,15]:[9,20]; else a=GUN_ARC_NAT[V.nation]||[8,20]; }
  V.depr=a[0]; V.elevMax=a[1];
  V.elevSp=(V.era>=5?20:V.static?6:ELEV_SP[V.cls]||9)*deg;
  if(WET_STOW.includes(k)) V.wet=1; }
const gunArcTxt=V=>V.aa?'antiaéreo':`−${V.depr??8}° / +${V.elevMax??20}°`;

// ficha del hangar y tarjetas: rango del cañón al lado de la pendiente
{ const _vs=vehStatsHTML; vehStatsHTML=function(k){ const h=_vs(k), V=VEH[k]; if(!V||V.depr==null) return h;
    return h.replace(/(<span class="vst"><i>Mira<\/i>)/,`<span class="vst"><i>Cañón</i>${gunArcTxt(V)}</span>$1`); }; }

// ---- 3) Huellas de orugas ----
// Una malla instanciada (todas las huellas en una sola llamada de dibujo); las más viejas se reemplazan por las nuevas.
const TRK_N=3000, trk={mesh:null,key:null,i:0};
function tracksMesh(){
  if(trk.mesh&&trk.key===builtKey&&trk.mesh.parent) return trk.mesh;
  if(trk.mesh){ scene.remove(trk.mesh); trk.mesh.material.dispose(); }
  const g=new THREE.PlaneGeometry(1,1); g.rotateX(-Math.PI/2);
  const snow=wxKey==='nieve'||builtKey==='ardenas', sand=builtKey==='alamein'||(W.dust&&new THREE.Color(W.dust).getHSL({}).l>.55&&!snow);
  const col=snow?0x6e767c:new THREE.Color(W.dust||0x7a6a52).multiplyScalar(.55).getHex(), op=(snow?.6:sand?.3:.42)*(WX&&WX.rain?1.25:1);
  const m=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:Math.min(.75,op),depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
  const M=new THREE.InstancedMesh(g,m,TRK_N); M.frustumCulled=false; M.count=0; M.renderOrder=1; scene.add(M);
  trk.mesh=M; trk.key=builtKey; trk.i=0; return M;
}
const _tq=new THREE.Quaternion(), _tm=new THREE.Matrix4(), _tp=new THREE.Vector3(), _ts=new THREE.Vector3(), _ty=new THREE.Quaternion(), _ax=new THREE.Vector3(0,1,0);
function updateTracks(){
  if(!builtKey) return;
  const M=tracksMesh(); let dirty=false;
  if(now<(trk.now||0)-1){ M.count=0; trk.i=0; for(const t of tanks) t.trkLast=null; } trk.now=now; // batalla nueva en el mismo mapa: suelo limpio
  for(const t of tanks){ if(t.dead||t.T.static||!t.root.visible&&!t.isPlayer) continue;
    if(t.pos.distanceToSquared(camera.position)>260*260){ t.trkLast=null; continue; }
    const last=t.trkLast; if(last&&Math.hypot(t.pos.x-last.x,t.pos.z-last.z)<.85) continue;
    if(!last||Math.hypot(t.pos.x-last.x,t.pos.z-last.z)>4){ t.trkLast={x:t.pos.x,z:t.pos.z}; continue; } // recién aparecido o teletransportado
    const Md=t.T.m, I=Md.w2||Md.iw, tw=Md.wheeled?.35:(I&&I.trW)||Md.W*.2, tx=Md.W/2-tw/2, mx=(t.pos.x+last.x)/2, mz=(t.pos.z+last.z)/2, len=Math.hypot(t.pos.x-last.x,t.pos.z-last.z)+.08;
    const h=Math.atan2(t.pos.x-last.x,t.pos.z-last.z), c=Math.cos(h), sn=Math.sin(h);
    _ty.setFromAxisAngle(_ax,h);
    for(const sx of [-1,1]){ const x=mx+sx*tx*c, z=mz-sx*tx*sn, y=heightAt(x,z);
      if(W.water!=null&&y<W.water-.05) continue;
      // inclinación del suelo bajo la oruga
      const ya=heightAt(x+sn*.6,z+c*.6), yb=heightAt(x-sn*.6,z-c*.6), pitch=Math.atan2(yb-ya,1.2);
      _tq.copy(_ty).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),pitch));
      _tm.compose(_tp.set(x,y+.04,z),_tq,_ts.set(tw,1,len)); M.setMatrixAt(trk.i,_tm); trk.i=(trk.i+1)%TRK_N; M.count=Math.min(TRK_N,M.count+1); }
    t.trkLast={x:t.pos.x,z:t.pos.z}; dirty=true; }
  if(dirty) M.instanceMatrix.needsUpdate=true;
}

// ---- 4) Estiba de munición ----
// Probabilidad según la munición que queda y la estiba húmeda: se aplica en spall (09-combate.js) por medio de rackOdds
const rackOdds=t=>{ let k=1; if(t.ammoCount&&t.ammoMax){ const sum=L=>L.reduce((a,n)=>a+Math.max(0,n),0); k=.3+.7*clamp(sum(t.ammoCount)/Math.max(1,sum(t.ammoMax)),0,1); } return k*(t.T.wet?.35:1); };
const flying=[];
function rackBlow(t){
  const P=t.pos.clone(); P.y=heightAt(P.x,P.z)+1.5;
  blast(P,1.5); sfx('sboom',P,1.2,{rate:.75});
  // la torre se suelta del casco y vuela girando; cae al costado
  if(t.turret&&!t.sponsons&&t.T.arc==null){ t.root.updateMatrixWorld(true); const tu=t.turret, wp=tu.getWorldPosition(new THREE.Vector3()), wq=tu.getWorldQuaternion(new THREE.Quaternion());
    scene.attach(tu); tu.position.copy(wp); tu.quaternion.copy(wq);
    const heavy=clamp((t.T.hp||100)/150,.6,1.4), a=rand(0,Math.PI*2), vh=rand(2,4.5)/heavy;
    flying.push({o:tu,v:new THREE.Vector3(Math.cos(a)*vh,rand(9,14)/heavy,Math.sin(a)*vh),w:new THREE.Vector3(rand(-3,3),rand(-2,2),rand(-3,3)),t:0}); t.turretOff=tu; }
  // chorro de fuego por las escotillas y munición que sigue reventando unos segundos
  t.cookT=rand(3.5,6); t.cookN=0;
}
function updateRack(dt){
  for(let i=flying.length-1;i>=0;i--){ const F=flying[i]; F.t+=dt; F.v.y-=G*dt; F.o.position.addScaledVector(F.v,dt);
    F.o.rotation.x+=F.w.x*dt; F.o.rotation.y+=F.w.y*dt; F.o.rotation.z+=F.w.z*dt;
    if(F.t%.08<dt) puff(F.o.position.clone(),0x2a2622,rand(1.5,2.5),rand(1.5,2.5),.6,.6);
    const gh=heightAt(F.o.position.x,F.o.position.z);
    if(F.v.y<0&&F.o.position.y<gh+.4){ F.o.position.y=gh+.4; F.o.rotation.x=rand(-.4,.4)+(Math.random()<.3?Math.PI:0); F.o.rotation.z=rand(-.5,.5);
      debris(F.o.position.clone(),8,dirtMat,4,.8); puff(F.o.position.clone(),W.dust||0x7a6a52,rand(4,6),rand(1.5,2.5),1,.7);
      if(!sfx('metal',F.o.position,.9,{rate:.5})) clang(distVol(F.o.position,.3)); flying.splice(i,1); } }
  for(const t of tanks){ if(!(t.cookT>0)) continue; t.cookT-=dt;
    const p=t.pos.clone(); p.y=heightAt(p.x,p.z)+t.T.m.H+.6;
    if(t.cookT>2&&Math.random()<dt*14) puff(p.clone().add(new THREE.Vector3(rand(-.4,.4),rand(0,2),rand(-.4,.4))),0xff8a2a,rand(1.5,2.8),rand(.3,.5),5,1,true); // chorro hacia arriba
    if(Math.random()<dt*3.5){ const q=p.clone().add(new THREE.Vector3(rand(-1.2,1.2),rand(-.5,.5),rand(-1.2,1.2))); debris(q,4,sparkMat,rand(5,9),.6);
      puff(q,0xffa040,rand(1,2),.25,1,1,true); if(t.cookN++%2===0&&!sfx('mgshot',q,.6,{rate:rand(.4,.6)})) boom(distVol(q,.15),.1,900); } }
}
{ const _rm=removeTank; removeTank=function(t){ if(t.turretOff){ scene.remove(t.turretOff); const j=flying.findIndex(F=>F.o===t.turretOff); if(j>=0) flying.splice(j,1); t.turretOff=null; } return _rm.apply(this,arguments); }; }
{ const _d=destroy; destroy=function(t,by,rack){ const was=t.dead; _d.apply(this,arguments); if(rack&&!was&&t.dead){ t.popV=0; rackBlow(t); } }; }
{ const _nk=netKill; netKill=function(t,rack){ const was=t.dead; _nk.apply(this,arguments); if(rack&&!was){ t.popV=0; rackBlow(t); } }; }
{ const _ua=updateArty; updateArty=function(dt){ _ua(dt); updateTracks(); updateRack(dt); }; }
