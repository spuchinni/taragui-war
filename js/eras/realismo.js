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

/* ---------- Tanda 2 (pedido de Sebastián) ----------
   5) Retroceso según el calibre: el tubo va para atrás de golpe (37 mm ≈ 25 cm, 88 mm ≈ 48 cm, 122 mm ≈ 63 cm) y vuelve despacio
      con el recuperador (≈ 0,9 s); el casco se sacude más con cañones grandes. El disparo levanta polvo (o nieve) delante de la boca.
   6) Escape: bocanada al arrancar, humo suave al ralentí, negro en los diésel (T-34, KV, IS, japoneses, M10, Valentine, modernos),
      vapor blanco con frío.
   7) Suspensión: cada rueda de rodaje copia los pozos del suelo y el casco cabecea al pasarlos.
   8) Orugas y ruedas de cada lado por separado: al girar, la de adentro va más lenta; girando en el lugar, una avanza y la otra retrocede. */
const DIESEL=['t34','t3485','kv1','kv2','is2','su100','valentine','m10','m4a2fr','hago','chiha','chihe','chinu'];
for(const k in VEH){ const V=VEH[k]; if(DIESEL.includes(k)||V.era>=5) V.diesel=1;
  const c=parseFloat(String(typeof gunCal==='function'?gunCal(V):'').replace(',','.'))||75; V.cal=c; V.recL=clamp(.08+c*.0045,.15,.65); }

// 5) retroceso: el núcleo pone barrel.position.z cada cuadro (15-menus.js); acá se reemplaza por la curva real
function recoilFX(t){
  if(t.T.auto||t.firedT==null||!t.barrel) return; const s=now-t.firedT; if(s<0||s>1.2) return;
  const k=s<.035?s/.035:1-((x)=>x*x*(3-2*x))(clamp((s-.035)/.9,0,1)); t.barrel.position.z=-t.T.recL*k; }
{ const _fg=fireGun; fireGun=function(t,F){ const p0=t.sPv||0, r0=t.sRv||0, ok=_fg.apply(this,arguments);
    if(ok===false||t.T.auto) return ok;
    const k=clamp((t.T.cal||75)/75,.4,1.7)/clamp((t.T.m.L||6)/6,.8,1.4); t.sPv=p0+((t.sPv||0)-p0)*k; t.sRv=r0+((t.sRv||0)-r0)*k;
    // polvo del fogonazo contra el suelo
    if(t.muzzle&&t.pos.distanceToSquared(camera.position)<400*400){ const m=t.muzzle.getWorldPosition(new THREE.Vector3()), d=t.barrel.getWorldDirection(new THREE.Vector3());
      const q=m.clone().addScaledVector(d,2.5), gh=heightAt(q.x,q.z);
      if(q.y-gh<3.2&&!(W.water!=null&&gh<W.water)){ const sz=clamp((t.T.cal||75)/75,.5,1.8), col=wxKey==='nieve'||builtKey==='ardenas'?0xe8ecef:W.dust||0xb6a27f;
        for(let i=0;i<5;i++) puff(new THREE.Vector3(q.x+d.x*i*.8+rand(-1,1),gh+.4,q.z+d.z*i*.8+rand(-1,1)),col,rand(2.5,4)*sz,rand(1.2,2),1.5,.5); } }
    return ok; }; }

// 6) escape
function exhaustFX(t,dt){
  if(t.dead||t.mod.engine<=0) return;
  const M=t.T.m, fx=Math.sin(t.heading), fz=Math.cos(t.heading), v=Math.abs(t.speed), cold=wxKey==='nieve'||wxKey==='noche'||builtKey==='ardenas';
  const thr=t.isPlayer?((down('fwd')||down('back'))?1:0):(v>1?1:0);
  if(thr&&!t.exOn&&v<2){ t.exBurst=.7; } t.exOn=!!thr;               // arranque: bocanada
  t.exI=(t.exI||0)-dt; const burst=(t.exBurst||0)>0; if(burst) t.exBurst-=dt;
  if(t.exI>0) return; t.exI=burst?.07:thr?.35:.8;
  const col=t.T.diesel?(burst?0x141210:0x2a2826):(burst?0x4a4a4e:0x8a8c90), op=burst?(t.T.diesel?.6:.38):thr?.22:.12;
  for(const sx of [-1,1]){ const x=t.pos.x-fx*(M.L/2+.15)+fz*sx*M.W*.28, z=t.pos.z-fz*(M.L/2+.15)-fx*sx*M.W*.28;
    puff(new THREE.Vector3(x,t.pos.y+t.hTop+.1,z),col,rand(.7,1.1)*(burst?1.6:1),burst?1.6:1,.9,op);
    if(cold) puff(new THREE.Vector3(x,t.pos.y+t.hTop+.3,z),0xf2f4f6,rand(.9,1.4),1.4,1.2,.25); }
}

// 7) suspensión de cada rueda + 8) orugas por lado
const _wv=new THREE.Vector3();
function runningGear(t,dt){
  const M=t.T.m; if(!t.wheels||!t.wheels.length) return;
  // 8) velocidad de cada lado (+x = izquierda: girando hacia +x esa oruga va más lenta)
  const yr=dt>0?wrap(t.heading-(t._rgH??t.heading))/dt:0; t._rgH=t.heading;
  const hw=M.W/2, dP=-yr*hw*dt, dN=yr*hw*dt; // lo que agrega el giro a cada lado (en metros este cuadro)
  if(t.trk&&t.trk.mats&&t.trk.mats.length===2&&!M.wheeled){ t.trk.top.map.offset.x=(t.trk.top.map.offset.x+dP*.42)%1; t.trk.sideP.map.offset.x=(t.trk.sideP.map.offset.x+dN*.42)%1; }
  const susp=!t.dead&&!M.wheeled&&t.pos.distanceToSquared(camera.position)<100*100; let F=0,nF=0;
  if(susp) t.root.updateMatrixWorld(true);
  let sum=0,n=0;
  for(const w of t.wheels){ const o=w.w;
    if(!M.wheeled) o.rotation.y+=(o.position.x>0?dP:dN)/w.r;
    if(!susp) continue;
    if(w.y0==null){ w.y0=o.position.y; w.road=w.r>=.18&&o.position.y<w.r*1.4+.12; w.dy=0; }
    if(!w.road) continue;
    _wv.set(o.position.x,w.y0-w.r,o.position.z).applyMatrix4(t.root.matrixWorld); w.raw=heightAt(_wv.x,_wv.z)-_wv.y; sum+=w.raw; n++; }
  // cuenta el pozo respecto del promedio (el casco ya sigue la pendiente general)
  if(susp&&n) for(const w of t.wheels){ if(!w.road) continue; const o=w.w, tgt=clamp(w.raw-sum/n,-.05,.14);
    w.dy+=(tgt-w.dy)*Math.min(1,dt*18); o.position.y=w.y0+w.dy; if(o.position.z>M.L*.15){ F+=w.dy; nF++; } }
  // el golpe en las ruedas de adelante levanta la trompa
  if(susp&&nF){ const f=F/nF; if(t._rgF!=null) t.sPv=clamp((t.sPv||0)+(f-t._rgF)*2.2*Math.min(1,Math.abs(t.speed)/4),-1.5,1.5); t._rgF=f; }
}
{ const _tf=tankFX; tankFX=function(t,dt){ _tf(t,dt); recoilFX(t); if(t.pos.distanceToSquared(camera.position)<200*200){ exhaustFX(t,dt); } runningGear(t,dt); }; }

/* ---------- Tanda 3: textura del acero (pedido de Sebastián: "más textura") ----------
   reliefTex: relieve hecho por código, repetible sin costura (512 px = 0,71 m, como metal.png).
     R = grano del acero (picado del fundido y martillado leve en todos), G = remaches en hileras con la junta de la chapa,
     B = zimmerit (la pasta antimagnética alemana de 1943–44: surcos verticales en franjas, aplicada a mano).
   El shader (tankDetail, 02-escena.js) tuerce la normal con eso, cambia el brillo del metal gastado y aclara la pasta.
   Números tácticos en la torre: alemanes (rojo con borde blanco, 3 cifras: compañía, pelotón, tanque) y soviéticos (blancos). */
let _relief=null;
function reliefTex(){ if(_relief) return _relief;
  const S=512, c=document.createElement('canvas'); c.width=c.height=S; const x=c.getContext('2d'), img=x.createImageData(S,S), d=img.data;
  // ruido de valor repetible
  const vn=(n,seed)=>{ const g=new Float32Array(n*n); let s=seed; for(let i=0;i<n*n;i++){ s=(s*16807)%2147483647; g[i]=s/2147483647; }
    return (u,v)=>{ u=u*n; v=v*n; const i=Math.floor(u), j=Math.floor(v), fu=u-i, fv=v-j, a=g[(j%n)*n+i%n], b=g[(j%n)*n+(i+1)%n], cc=g[((j+1)%n)*n+i%n], dd=g[((j+1)%n)*n+(i+1)%n],
      su=fu*fu*(3-2*fu), sv=fv*fv*(3-2*fv); return a+(b-a)*su+(cc-a)*sv+(a-b-cc+dd)*su*sv; }; };
  const n1=vn(16,11), n2=vn(48,23), n3=vn(128,37), zr=vn(9,51);
  const R=new Float32Array(S*S), Gc=new Float32Array(S*S), B=new Float32Array(S*S);
  for(let j=0;j<S;j++) for(let i=0;i<S;i++){ const u=i/S, v=j/S, k=j*S+i;
    R[k]=n1(u,v)*.45+n2(u,v)*.35+n3(u,v)*.2;
    // zimmerit: franjas horizontales de ~8 cm con surcos verticales de ~1,5 cm, cada franja corrida y un poco torcida
    const band=Math.floor(v*7), ph=zr(band/7,.37)*6.28, wob=Math.sin(v*40+band)*.01;
    const rid=.5+.5*Math.sin((u+wob)*6.2832*26+ph); B[k]=Math.pow(rid,2.2)*(.8+.2*n2(u*2,v*2))*(Math.abs(v*7-band-.5)<.47?1:.5); }
  // picaduras del fundido
  let s=9; const rnd=()=>{ s=(s*16807)%2147483647; return s/2147483647; };
  for(let p=0;p<2600;p++){ const cx=rnd()*S, cy=rnd()*S, r=1+rnd()*2.2; for(let j=-3;j<=3;j++) for(let i=-3;i<=3;i++){ const dd=Math.hypot(i,j)/r; if(dd>1) continue; const k=((Math.floor(cy)+j+S)%S)*S+(Math.floor(cx)+i+S)%S; R[k]-=(1-dd)*.35; } }
  // remaches: dos hileras horizontales (cada 0,36 m) y una vertical, uno cada ~9 cm, con la junta de la chapa
  const rivet=(cx,cy)=>{ for(let j=-7;j<=7;j++) for(let i=-7;i<=7;i++){ const dd=Math.hypot(i,j)/6; if(dd>1) continue; const k=((cy+j+S)%S)*S+(cx+i+S)%S; Gc[k]=Math.max(Gc[k],Math.sqrt(1-dd*dd)); } };
  for(const ry of [20,276]){ for(let cx=0;cx<S;cx+=64) rivet(cx+32,ry); for(let i=0;i<S;i++){ Gc[((ry+12)%S)*S+i]=Math.max(Gc[((ry+12)%S)*S+i],.25); } }
  for(let cy=0;cy<S;cy+=64) rivet(20,cy+32); for(let j=0;j<S;j++) Gc[j*S+32]=Math.max(Gc[j*S+32],.25);
  for(let k=0;k<S*S;k++){ d[k*4]=clamp(R[k],0,1)*255; d[k*4+1]=Gc[k]*255; d[k*4+2]=B[k]*255; d[k*4+3]=255; }
  x.putImageData(img,0,0);
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=Math.min(4,ANISO); _relief=t; return t; }

// qué tanques llevan qué (por tanque; la 1ª Guerra y Entreguerras casi todos remachados)
const RIVETED=['m3stuart','valentine','crusader3','pz38t','hago','chiha','chihe','l640','m1340','sem7518','p40','h39','v6cn','t26cn','m3a3cn','bt7','kv2','achilles','m10'];
const CAST=['m4a1','m4a3e8','m4a2fr','m4a4cn','matilda2','is2','t3485','s35f','h39','m26','churchill7','firefly','m36','chinu'];
const ZIMMERIT=['pz4h','panther','tiger1','stug3g','jagdpanther','tiger2'];
for(const k in VEH){ const V=VEH[k]; if(V.static) continue;
  V.rel=[RIVETED.includes(k)||(V.era<=2&&!['s35','b1bis','r35'].includes(k))?1:0, ZIMMERIT.includes(k)?1:0, CAST.includes(k)||(V.era<=2&&['s35','r35'].includes(k))?1:V.era>=5?.4:.15]; }

// números tácticos en la torre
const _numTex={};
function numTex(txt,nat){ const key=nat+txt; if(_numTex[key]) return _numTex[key];
  const c=document.createElement('canvas'); c.width=256; c.height=128; const x=c.getContext('2d'); x.font='900 92px "Saira Condensed",Arial Narrow,sans-serif'; x.textAlign='center'; x.textBaseline='middle';
  if(nat==='de'){ x.lineWidth=12; x.strokeStyle='#e8e4d8'; x.strokeText(txt,128,66); x.fillStyle='#8a1a14'; x.fillText(txt,128,66); }
  else { x.fillStyle='#ecebe4'; x.fillText(txt,128,66); }
  // pintura gastada: le saca puntos al número
  x.globalCompositeOperation='destination-out'; for(let i=0;i<260;i++){ x.globalAlpha=Math.random()*.7; x.fillRect(Math.random()*256,Math.random()*128,1+Math.random()*3,1+Math.random()*3); } x.globalAlpha=1;
  const t=new THREE.CanvasTexture(c); t.anisotropy=2; return _numTex[key]=t; }
{ const _mk=makeTank; makeTank=function(crew,key){ const t=_mk.apply(this,arguments), V=t.T, M=V.m;
    if(V.rel){ t.mat.userData.rel=V.rel; if(t.mud) t.mud.userData.rel=V.rel; }
    const nat=(crew&&crew.nation)||V.nation, I=M&&M.w2;
    if((nat==='de'||nat==='ru')&&I&&t.turret&&!V.aa&&!V.static&&!['none','open'].includes(I.tur)&&!I.case){
      const n=nat==='de'?`${1+(t.id%8)}${1+((t.id>>3)%3)}${1+((t.id>>5)%4)}`:String(100+(t.id*37)%800);
      const m=new THREE.MeshLambertMaterial({map:numTex(n,nat),transparent:true,alphaTest:.3,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
      const y=(t.gunPivot&&t.gunPivot.parent===t.turret?t.gunPivot.position.y:M.th*.5)+.05; // a la altura de las insignias
      for(const sx of [-1,1]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(.8*M.th/.95,.4*M.th/.95),m); p.position.set(sx*(M.tw/2*(['box','hex','tiger'].includes(I.tur)?1:.92)+.04),y,M.tl*.2); p.rotation.y=sx>0?Math.PI/2:-Math.PI/2; t.turret.add(p); } }
  return t; }; }

/* ---------- Sonido del motor según el tanque (pedido de Sebastián) ----------
   Cada tanque tiene su familia de motor real (V.eng). Con los mismos sonidos de siempre (motor sintético + grabaciones idle/drive)
   cambian el tono, el golpeteo de los cilindros, el ruido y el filtro: el Maybach suena agudo y liso, el diésel V-2 ronco y golpeado,
   el radial del Sherman con su zumbido de avión, el V8 Ford grave. Además se oyen los motores de los 3 tanques más cercanos (engVoices). */
// f = tono, lfo = golpeteo (Hz), dep = cuánto golpea, nz = ruido/traqueteo, lp = brillo, rate = velocidad de las grabaciones, h2 = segundo armónico
const ENGINES={
  maybach:{n:'Maybach V12 a nafta',f:1.28,lfo:24,dep:.08,nz:.22,lp:1.3,rate:1.12,h2:3.0},
  v2:{n:'Diésel V-2 V12',f:.84,lfo:12,dep:.36,nz:.6,lp:.85,rate:.9,h2:2.03},
  radial:{n:'Radial Continental (de avión)',f:1.1,lfo:7,dep:.32,nz:.3,lp:1.1,rate:1.05,h2:1.5},
  fordv8:{n:'Ford V8 a nafta',f:.95,lfo:8.5,dep:.3,nz:.3,lp:.95,rate:.95,h2:2.0},
  gmdiesel:{n:'Doble diésel GM',f:.9,lfo:13,dep:.3,nz:.5,lp:.9,rate:.92,h2:2.08},
  aero:{n:'V12 de avión',f:1.22,lfo:21,dep:.1,nz:.25,lp:1.25,rate:1.1,h2:2.0},
  multibank:{n:'Chrysler multibanco (5 motores)',f:1.05,lfo:17,dep:.22,nz:.35,lp:1.05,rate:1.0,h2:2.5},
  gas6:{n:'6 cilindros a nafta',f:1.4,lfo:18,dep:.16,nz:.3,lp:1.15,rate:1.2,h2:2.0},
  jpdiesel:{n:'Diésel refrigerado por aire',f:1.0,lfo:14,dep:.32,nz:.55,lp:.95,rate:.97,h2:2.02},
  early:{n:'Nafta de entreguerras',f:.95,lfo:10,dep:.3,nz:.4,lp:.9,rate:.95,h2:2.0},
  ww1:{n:'Motor de la 1ª Guerra (lento)',f:.6,lfo:5,dep:.45,nz:.65,lp:.7,rate:.72,h2:2.0},
  diesel:{n:'Diésel moderno',f:1.0,lfo:15,dep:.24,nz:.45,lp:1.0,rate:1.0,h2:2.03}};
const ENG_OF={maybach:['pz3j','pz4f2','pz4h','stug3g','panther','tiger1','tiger2','jagdpanther','wirbelwind','ostwind'],
  v2:['t34','t3485','kv1','kv2','is2','su100'], radial:['m3stuart','m4a1','m18','m3a3cn'], fordv8:['m4a3e8','m26','m24','m36','s35f','churchill7','b1f'],
  gmdiesel:['m10','m4a2fr','matilda2','valentine','achilles'], aero:['crusader3','cromwell','comet','bt7','nahuel','crusaderaa'],
  multibank:['firefly','m4a4cn'], gas6:['pz38t','t70','zsu37','m16mgmc','l640','h39','v6cn','t26cn'], jpdiesel:['hago','chiha','chihe','chinu','tase','m1340','sem7518','p40']};
for(const k in VEH){ const V=VEH[k]; if(V.static) continue; let e=null;
  for(const f in ENG_OF) if(ENG_OF[f].includes(k)){ e=f; break; }
  V.eng=e||(V.era<=1?'ww1':V.era===2?(['bt5'].includes(k)?'aero':'early'):V.era>=5?'diesel':V.diesel?'gmdiesel':'fordv8'); }
const engOf=T=>ENGINES[T.eng]||ENGINES.diesel;

// motor del jugador: después de lo que hace el núcleo, se corrige según la familia
{ const _eu=engineUpdate; engineUpdate=function(t,dt){ _eu(t,dt); if(!AC||!engNodes||t.dead) return; const E=engOf(t.T), now=AC.currentTime, R=t._rpm||.2, thr=(down('fwd')||down('back'))?1:0;
    const base=(24+R*42)*E.f; eng.frequency.setTargetAtTime(base,now,.05); eng2.frequency.setTargetAtTime(base*E.h2,now,.05);
    engNodes.lfo.frequency.setTargetAtTime(E.lfo*(.7+R*.6),now,.1); lfoG.gain.setTargetAtTime(E.dep+thr*.1,now,.1);
    engNodes.nzg.gain.setTargetAtTime(E.nz,now,.1); engNodes.nzf.frequency.setTargetAtTime(180*E.f,now,.1);
    engLP.frequency.setTargetAtTime((220+R*700+thr*250)*E.lp,now,.08);
    if(LOOPS.idle) LOOPS.idle.src.playbackRate.setTargetAtTime((.85+R*.45)*E.rate,now,.08);
    if(LOOPS.drive) LOOPS.drive.src.playbackRate.setTargetAtTime((.72+R*.5)*E.rate,now,.08); }; }

// motores de los otros tanques: 3 voces con posición que se reparten entre los más cercanos
const engVoices=[]; let engVT=0;
function engVoice(){ const mk=n=>{ const s=AC.createBufferSource(); s.buffer=SFX[n][0]; s.loop=true; s.loopStart=.2; s.loopEnd=.2+(LOOP_LEN[n]||2.5); const g=AC.createGain(); g.gain.value=0; s.connect(g); s.start(0,rand(.2,2)); return {s,g}; };
  const d=mk('drive'), i=mk('idle'), f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=4000; const pn=AC.createPanner(); pn.panningModel='equalpower'; pn.distanceModel='inverse'; pn.refDistance=14; pn.rolloffFactor=1.1;
  d.g.connect(f); i.g.connect(f); f.connect(pn).connect(extBus); return {d,i,f,pn,t:null}; }
function updateEngVoices(dt){
  if(!AC||!SFX.drive||!SFX.drive.length||!SFX.idle||!SFX.idle.length||!['play','spectate','deploy'].includes(state)){ for(const V of engVoices){ V.d.g.gain.value=0; V.i.g.gain.value=0; } return; }
  while(engVoices.length<3) engVoices.push(engVoice());
  engVT-=dt; if(engVT<=0){ engVT=.5; const L=tanks.filter(t=>!t.dead&&t!==player&&!t.T.static&&t.pos.distanceToSquared(camera.position)<170*170).sort((a,b)=>a.pos.distanceToSquared(camera.position)-b.pos.distanceToSquared(camera.position)).slice(0,3);
    engVoices.forEach((V,i)=>{ V.t=L[i]||null; }); }
  const now=AC.currentTime;
  for(const V of engVoices){ const t=V.t; if(!t||t.dead){ V.d.g.gain.setTargetAtTime(0,now,.3); V.i.g.gain.setTargetAtTime(0,now,.3); continue; }
    const E=engOf(t.T), v=Math.abs(t.speed), mv=clamp(v/3,0,1), r=clamp(v/Math.max(1,t.T.maxF||10),0,1), p=t.pos;
    if(V.pn.positionX){ V.pn.positionX.value=p.x; V.pn.positionY.value=p.y+1; V.pn.positionZ.value=p.z; } else V.pn.setPosition(p.x,p.y+1,p.z);
    V.f.frequency.setTargetAtTime(Math.max(500,5000*E.lp*Math.exp(-p.distanceTo(camera.position)/120)),now,.1);
    V.d.g.gain.setTargetAtTime(mv*.75,now,.2); V.i.g.gain.setTargetAtTime((1-mv*.7)*.45,now,.2);
    V.d.s.playbackRate.setTargetAtTime((.7+r*.55)*E.rate,now,.1); V.i.s.playbackRate.setTargetAtTime(.85*E.rate*(E.f>1.2?1.08:1),now,.1); }
}
{ const _ua2=updateArty; updateArty=function(dt){ _ua2(dt); updateEngVoices(dt); }; }
{ const _sl=stopAllLoops; stopAllLoops=function(){ _sl(); if(AC) for(const V of engVoices){ V.d.g.gain.value=0; V.i.g.gain.value=0; V.t=null; } }; }

// la ficha muestra el motor
{ const _vs2=vehStatsHTML; vehStatsHTML=function(k){ const h=_vs2(k), V=VEH[k]; if(!V||!V.eng||!ENGINES[V.eng]) return h;
    return h.replace(/(<span class="vst"><i>Mira<\/i>)/,`<span class="vst"><i>Motor</i>${ENGINES[V.eng].n}</span>$1`); }; }
{ const _fr=frame; frame=function(dt){ _fr(dt); if(AC&&engVoices.length&&!['play','spectate','deploy','end'].includes(state)) for(const V of engVoices){ V.d.g.gain.value=0; V.i.g.gain.value=0; } }; }

/* ---------- Giro real de la torre (pedido de Sebastián: que en todos los tanques el círculo siga al cañón con retraso) ----------
   Antes las torres giraban a 25–100°/s; las reales, a manivela, hidráulicas o eléctricas, entre 6 y 30°/s.
   T.trav (rad/s) lo usa aimAt (07-tanques.js) para el jugador y los bots; el círculo de impacto ya muestra adonde apunta el cañón. */
const TRAV_DEG={pz3j:18,pz4f2:14,pz4h:14,stug3g:10,panther:18,tiger1:10,tiger2:10,jagdpanther:8,pz38t:12,
  t70:12,t34:25,t3485:22,kv1:12,kv2:6,is2:14,su100:8,bt7:20,
  m3stuart:30,m4a1:24,m4a3e8:24,m10:10,m18:24,m24:30,m26:20,m36:10,
  matilda2:20,crusader3:25,cromwell:24,churchill7:20,firefly:24,comet:24,valentine:20,achilles:10,nahuel:15,
  l640:12,m1340:10,sem7518:8,p40:12,hago:20,chiha:12,chihe:14,chinu:10,h39:10,s35f:10,b1f:8,m4a2fr:24,v6cn:20,t26cn:15,m3a3cn:30,m4a4cn:24};
const TRAV_CLS={ligero:25,medio:18,pesado:11,cazatanques:9,principal:40};
for(const k in VEH){ const V=VEH[k]; if(V.static||V.aa||V.support||V.era<=1) continue;
  const d=TRAV_DEG[k]||(V.era>=5?40:V.era===2?Math.min(18,TRAV_CLS[V.cls]||16):TRAV_CLS[V.cls]||16); V.trav=d*deg; }
{ const _vs3=vehStatsHTML; vehStatsHTML=function(k){ const h=_vs3(k), V=VEH[k]; if(!V||V.static||V.aa||!V.trav) return h;
    return h.replace(/(<span class="vst"><i>Cañón<\/i>)/,`<span class="vst"><i>Torre</i>${Math.round(V.trav/deg)}°/s</span>$1`); }; }

/* ---------- Motores que se distingan de verdad (Sebastián: "suenan iguales") ----------
   Lo que más se oye son las grabaciones idle/drive: ahora pasan por un filtro de tono y un golpeteo de volumen propios de cada motor,
   las velocidades de reproducción se separan más y la parte sintética (que cambia de carácter) se oye más fuerte. */
// q = filtro de las grabaciones [tipo, Hz, dB], tr = golpeteo [profundidad, Hz], mix = cuánto se oye el motor sintético, rr = velocidad de las grabaciones
const ENG_SND={maybach:{q:['highshelf',1800,7],tr:[.04,20],mix:.32,rr:1.32},v2:{q:['lowshelf',160,9],tr:[.3,8.5],mix:.5,rr:.76},
  radial:{q:['peaking',420,9],tr:[.38,5.5],mix:.4,rr:1.12},fordv8:{q:['lowshelf',120,7],tr:[.24,6.5],mix:.4,rr:.88},
  gmdiesel:{q:['peaking',260,7],tr:[.28,11],mix:.45,rr:.84},aero:{q:['peaking',1300,6],tr:[.06,18],mix:.3,rr:1.26},
  multibank:{q:['peaking',700,5],tr:[.18,14],mix:.36,rr:1.04},gas6:{q:['highshelf',2200,5],tr:[.12,16],mix:.3,rr:1.42},
  jpdiesel:{q:['peaking',320,7],tr:[.28,10],mix:.45,rr:.94},early:{q:['lowpass',2200,0],tr:[.2,8],mix:.35,rr:.92},
  ww1:{q:['lowpass',1100,0],tr:[.42,3.8],mix:.45,rr:.64},diesel:{q:['peaking',300,4],tr:[.15,12],mix:.3,rr:1}};
const engSnd=T=>ENG_SND[T.eng]||ENG_SND.diesel;
let engChain=null;
function engChainFor(){ // filtro + golpeteo entre cada grabación y su volumen (se arma una sola vez)
  if(engChain||!AC||!LOOPS.idle||!LOOPS.drive) return engChain;
  const F=AC.createBiquadFilter(), T=AC.createGain(), lfo=AC.createOscillator(), lg=AC.createGain(); T.gain.value=1; lg.gain.value=0; lfo.frequency.value=8; lfo.connect(lg).connect(T.gain); lfo.start();
  for(const k of ['idle','drive']){ const L=LOOPS[k]; L.src.disconnect(); L.src.connect(L.g); L.g.disconnect(); L.g.connect(F); }
  F.connect(T).connect(engGain); engChain={F,T,lfo,lg,key:null}; return engChain; }
function applyEngSnd(C,S,now){ C.F.type=S.q[0]; C.F.frequency.setTargetAtTime(S.q[1],now,.05); C.F.gain.setTargetAtTime(S.q[2],now,.05); C.F.Q.value=S.q[0]==='peaking'?1.1:.7;
  C.lg.gain.setTargetAtTime(S.tr[0],now,.1); }
{ const _eu2=engineUpdate; engineUpdate=function(t,dt){ _eu2(t,dt); if(!AC||t.dead) return; const S=engSnd(t.T), now=AC.currentTime, R=t._rpm||.2, C=engChainFor();
    if(C){ if(C.key!==t.T.eng){ C.key=t.T.eng; applyEngSnd(C,S,now); } C.lfo.frequency.setTargetAtTime(S.tr[1]*(.75+R*.7),now,.1); }
    engMix.gain.setTargetAtTime(S.mix,now,.2);
    if(LOOPS.idle) LOOPS.idle.src.playbackRate.setTargetAtTime((.85+R*.4)*S.rr,now,.08);
    if(LOOPS.drive) LOOPS.drive.src.playbackRate.setTargetAtTime((.72+R*.48)*S.rr,now,.08); }; }
// y los motores de los otros tanques, con la misma receta (filtro + golpeteo por voz)
{ const _ev=engVoice; engVoice=function(){ const V=_ev(); const F=AC.createBiquadFilter(), T=AC.createGain(), lfo=AC.createOscillator(), lg=AC.createGain();
    T.gain.value=1; lg.gain.value=0; lfo.connect(lg).connect(T.gain); lfo.start(); V.d.g.disconnect(); V.i.g.disconnect(); V.d.g.connect(F); V.i.g.connect(F); F.connect(T).connect(V.f);
    Object.assign(V,{F,T,lfo,lg,key:null}); return V; }; }
{ const _ue=updateEngVoices; updateEngVoices=function(dt){ _ue(dt); if(!AC) return; const now=AC.currentTime;
    for(const V of engVoices){ const t=V.t; if(!t||!V.F) continue; const S=engSnd(t.T);
      if(V.key!==t.T.eng){ V.key=t.T.eng; applyEngSnd(V,S,now); V.lfo.frequency.value=S.tr[1]; }
      const r=clamp(Math.abs(t.speed)/Math.max(1,t.T.maxF||10),0,1);
      V.d.s.playbackRate.setTargetAtTime((.7+r*.5)*S.rr,now,.1); V.i.s.playbackRate.setTargetAtTime(.86*S.rr,now,.1); } }; }

/* ---------- Todas las ametralladoras tiran (pedido de Sebastián) ----------
   Con la coaxial tiran también: la de casco (t.bowMG/t.bowMuz, gm3-modelos.js) si la torre apunta hacia adelante (±15°, el arco de su rótula)
   y el ametrallador está vivo; y la antiaérea de la torre (t.aaMuz: .50, DShK, MG) si el comandante está vivo. Cada una con su cinta:
   se usa el mismo disparo del núcleo (fireMG) cambiando la boca y la dirección, y se devuelven calor y cinta de la coaxial. */
const _mgv1=new THREE.Vector3(), _mgv2=new THREE.Vector3();
{ const _fm=fireMG; fireMG=function(t){ _fm(t); if(t.dead||t.mgLock||!t.barrel) return;
    const L=[]; if(t.bowMuz&&(manned(t,'mg1')||manned(t,'codriver'))) L.push([t.bowMuz,t.bowMG,.26]);
    if(t.aaMuz&&manned(t,'commander')) L.push([t.aaMuz,t.aaMuz,.6]);
    if(!L.length) return; const sc=t.coax, sb=t.barrel, keep={h:t.mgHeat,l:t.mgLock,b:t.mgBelt,bs:t.mgBelts,r:t.mgRel};
    const bd=sb.getWorldDirection(_mgv1).clone();
    try{ for(const [muz,dirObj,arc] of L){ const d=dirObj.getWorldDirection(_mgv2); if(d.angleTo(bd)>arc) continue; t.coax=muz; t.barrel=dirObj; _fm(t); } }
    finally{ t.coax=sc; t.barrel=sb; t.mgHeat=keep.h; t.mgLock=keep.l; t.mgBelt=keep.b; t.mgBelts=keep.bs; t.mgRel=keep.r; } }; }
