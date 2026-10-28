/* ---------- Cañón ---------- */
const shells=[]; const ray=new THREE.Raycaster();
const shellGeo=new THREE.SphereGeometry(.18,6,6), shellMat=new THREE.MeshBasicMaterial({color:0xffe2a0});
const SHELL_MAT={ke:new THREE.MeshBasicMaterial({color:0xfff6dc}),heat:new THREE.MeshBasicMaterial({color:0xffa040}),hesh:new THREE.MeshBasicMaterial({color:0xffd060}),he:new THREE.MeshBasicMaterial({color:0xffd060})};
function fireGun(t,F){
  if(!F&&(t.reloadT>0||t.dead||!canFire(t))) return false;
  t.firedT=now;
  if(t.ammoCount){ if(t.ammoCount[t.ammoIdx]<=0){ const j=t.ammoCount.findIndex(n=>n>0);
      if(j<0){ if(t.isPlayer&&now>(t.noAmmoMsg||0)){ t.noAmmoMsg=now+2; hitMsg('¡Sin munición! Volvé a un punto capturado','var(--enemy)'); } return false; } t.ammoIdx=j; }
    t.ammoCount[t.ammoIdx]--; }
  if(t.T.auto){ t.mag=(t.mag??t.T.auto.mag)-1; if(t.mag<=0){ t.mag=t.T.auto.mag; t.reloadT=t.reloadMax*reloadFactor(t); } else t.reloadT=t.T.auto.rof; t.recoil=.25; t.immuneT=0; }
  else { t.reloadT=t.reloadMax*reloadFactor(t); t.recoil=1; t.immuneT=0; const ky=t.turretYaw||0; t.sPv=(t.sPv||0)+Math.cos(ky)*.9; t.sRv=(t.sRv||0)-Math.sin(ky)*.7; }
  t.root.updateMatrixWorld(true);
  const A=ammoOf(t), mp=F?F.mp:t.muzzle.getWorldPosition(new THREE.Vector3()), dir=F?F.dir:t.barrel.getWorldDirection(new THREE.Vector3());
  if(!F){ const bk=(t.mod.barrel??100)<60?1+(60-t.mod.barrel)/15:1, spread=(.0012+Math.abs(t.speed)*(t.T.stab?.0003:.0035))*bk;
  dir.x+=rand(-1,1)*spread; dir.y+=rand(-1,1)*spread; dir.z+=rand(-1,1)*spread; dir.normalize(); }
  const m=new THREE.Mesh(shellGeo,SHELL_MAT[A.kind]); m.position.copy(mp); scene.add(m);
  shells.push({p:mp.clone(),v:dir.clone().multiplyScalar(A.v),owner:t,m,travel:0,life:4,A,fx:net.guest}); noise(mp,120); if(tut&&t===player) tut.shots=(tut.shots||0)+1;
  if(net.on) netShot(t,mp,dir,F);
  const big=t.T.m.gr*10;
  if(t.T.auto){ puff(mp,0xffc060,1.2,.06,0,1,true); boom(t.isPlayer?.18:distVol(mp,.15),.12,2200); if(t.isPlayer) shake=Math.max(shake,.06); return true; }
  // fogonazo y humo más grandes cuanto más lejos está la cámara: en los mapas de 1,5 km un tiro a 400 m tiene que verse
  const far=t.isPlayer?0:clamp((camera.position.distanceTo(mp)-60)/100,0,6);
  puff(mp,0xffb050,2.5*big*(1+far*.7),.12+far*.05,0,1,true); for(let i=0;i<4;i++) puff(mp.clone().addScaledVector(dir,i*.8),0xb0aa9a,rand(1.5,3)*(1+far*.5),rand(.8,1.5)*(1+far*.4),.6,.5);
  if(sfx('cannon',mp,t.isPlayer?1.1:.9,{near:t.isPlayer})){ if(t.isPlayer) boom(.35,.5,260); } else boom(t.isPlayer?.6:distVol(mp,.5),.8,t.isPlayer?1200:700);
  if(t.isPlayer) shake=.4*big;
  return true;
}
function updateShells(dt){
  for(let i=shells.length-1;i>=0;i--){
    const s=shells[i]; let done=false;
    for(let k=0;k<3&&!done;k++){
      const h=dt/3, p0=s.p.clone();
      s.v.y-=G*h; s.p.addScaledVector(s.v,h); const seg=s.p.distanceTo(p0); s.travel+=seg;
      const dir=s.p.clone().sub(p0).normalize();
      if(!s.fx&&infOnRay(p0,dir,seg,s.owner,.8)>=0&&s.A.kind!=='ke'){ blast(s.p,.3); infBlast(s.p,3,s.owner); done=true; break; }
      ray.set(p0,dir); ray.far=seg;
      let hits=ray.intersectObjects(colliders.concat(houseMeshes,treeMeshes(),civHits),false).filter(x=>x.object.userData.tank!==s.owner);
      ray.far=Infinity;
      hits=hits.filter(x=>{const tr=treeOf(x); if(!tr) return true; if(!tr.fallen){knockTree(tr,dir.x,dir.z);debris(x.point,4,dirtMat,3,.6);} return false;});
      if(hits.length){ const hit=hits[0];
        if(hit.object.userData.plane){ explode(hit.point,'metal'); if(!s.fx) planeHit(hit.object.userData.plane,s.A.kind==='ke'?55:110,s.owner); done=true; break; }
        if(s.fx){ const tk=hit.object.userData.tank; explode(hit.point,tk?'metal':'ground'); { const fb=bldOf(hit); if(fb) markBuilding(hit,fb,rand(.6,1.2),'big'); } if(tk) clang(distVol(hit.point,.25)); else boom(distVol(hit.point,.25),.5,500); done=true; break; }
        if(s.rocket){ blast(hit.point,.25); noise(hit.point,80); }
        infBlast(hit.point,(s.A.kind==='he'?6:s.A.kind==='hesh'?4:1.8)*(s.A.sc<1?.4:1),s.owner);
        if(hit.object.userData.tank) hitTank(s.owner,hit,dir,(s.A.kind==='ke'?s.A.pen*Math.max(.5,1-s.travel/3000):s.A.pen)*(s.owner.penK||1),'shell',s.A);
        else { if((s.A.kind==='he'||s.A.kind==='hesh')&&s.A.sc<1){explode(hit.point,'ground');heSplash(hit.point,s.owner,s.A);} else if(s.A.kind==='he'||s.A.kind==='hesh'){blast(hit.point,.35);heSplash(hit.point,s.owner,s.A);} else {explode(hit.point,'ground');boom(distVol(hit.point,.25),.5,500);}
          const b=bldOf(hit); if(b){ const big=s.A.kind==='he'||s.A.kind==='hesh'; markBuilding(hit,b,big?rand(1.1,1.7)*(s.A.sc<1?.7:1):s.A.kind==='heat'?rand(.6,.85):rand(.4,.6),big||s.A.kind==='heat'?'big':'ke'); damageBuilding(b,(15+s.owner.T.m.gr*250)*({ke:.6,heat:1,hesh:2.2,he:2.2})[s.A.kind]*(s.A.sc||1)); } }
        done=true; break; }
      const gh=hAtY(s.p.x,s.p.z,s.p.y);
      if(s.p.y<gh&&s.fx){ s.p.y=gh; explode(s.p,'ground'); boom(distVol(s.p,.25),.5,500); done=true; }
      else if(s.p.y<gh){ s.p.y=gh; infBlast(s.p,(s.A.kind==='he'?6:s.A.kind==='hesh'?4:1.8)*(s.A.sc<1?.4:1),s.owner); noise(s.p,70); if((s.A.kind==='he'||s.A.kind==='hesh')&&!(s.A.sc<1)){blast(s.p,.35);heSplash(s.p,s.owner,s.A);} else {explode(s.p,'ground'); boom(distVol(s.p,.25),.5,500);} done=true; }
    }
    s.life-=dt; s.m.position.copy(s.p);
    if(done||s.life<=0||Math.abs(s.p.x)>W.bx+OUT+60||Math.abs(s.p.z)>W.bz+OUT+60){scene.remove(s.m);shells.splice(i,1);}
  }
}
function faceOf(n){return n.y>.6?'top':n.z>.6?'front':n.z<-.6?'rear':'side';}
const FACE_ES={front:'frontal',side:'lateral',rear:'trasero',top:'superior'};
let mgMsgT=0;
const SEAT_ES={codriver:'ayudante',driver:'conductor',gunner:'artillero',commander:'comandante',loader:'cargador',mg1:'ametrallador',mg2:'ametrallador',mg3:'ametrallador',mg4:'ametrallador',mech1:'mecánico',mech2:'mecánico',gear1:'cambista',gear2:'cambista'};
// Tripulante que puede pasar a otro puesto: primero los que sobran (ametralladores, mecánicos, cambistas), después el cargador y el comandante
const spareOf=t=>{ for(const pre of ['mg','mech','gear','loader','commander']){ const m=t.crewM.find(x=>x.alive&&x.seat.startsWith(pre)); if(m) return m; } return null; };
const manned=(t,seat)=>t.crewM.some(m=>m.alive&&m.seat===seat);
const crewAlive=t=>t.crewM.filter(m=>m.alive).length;
const flooded=t=>W.water!=null&&W.water-hAtY(t.pos.x,t.pos.z,t.pos.y+.5)>1.3;
const canMove=t=>t.mod.engine>0&&t.trackT<=0&&manned(t,'driver')&&!(t.repairT>0)&&!flooded(t);
const canFire=t=>t.mod.breech>0&&(t.mod.barrel??100)>0&&manned(t,'gunner'); // reparando se puede disparar si el cañón está sano
const reloadFactor=t=>t.T.autoL||manned(t,'loader')?1:1.8;
function compPos(t){ // posiciones locales del casco (x lateral, y alto, z adelante)
  if(t.seatPos) return ww1CompPos(t);
  const M=t.T.m, hy=(M.wr*2+.25)*.55, H=M.H, L=M.L, Wd=M.W, ef=t.T.engF?1:-1;
  const tur=(x,y,z)=>{const c=Math.cos(t.turretYaw),sn=Math.sin(t.turretYaw);return new THREE.Vector3(x*c+z*sn,hy+H+y,M.tz-x*sn+z*c);};
  const out={driver:new THREE.Vector3(-Wd*.25,hy+H*.55,L*.3),engine:new THREE.Vector3(ef>0?Wd*.2:0,hy+H*.5,ef*L*.32),trans:new THREE.Vector3(ef>0?-Wd*.15:0,hy+H*.25,ef*L*.44),
    ammo:new THREE.Vector3(ef>0?0:Wd*.22,hy+H*.4,ef>0?-L*.3:L*.1),
    gunner:tur(-M.tw*.25,M.th*.35,0),commander:tur(-M.tw*.18,M.th*.55,-M.tl*.28),loader:tur(M.tw*.25,M.th*.35,-M.tl*.05),breech:tur(0,M.th*.45,M.tl*.08)};
  if(M.bustle) out.ammo2=tur(0,M.th*.5,-M.tl*.45);
  return out;
}
const SPALL={ke:{base:140,r0:.25,sp:.32,len:6},heat:{base:110,r0:.15,sp:.16,len:4},hesh:{base:95,r0:.7,sp:.5,len:1.8},he:{base:85,r0:.8,sp:.45,len:2.5}};
function spall(t,pointW,dirW,kind,by,sc=1,over=1){
  t.lastBy=by; noteHit(t,by);
  t.root.updateMatrixWorld(true);
  const inv=new THREE.Matrix4().copy(t.root.matrixWorld).invert(), P=pointW.clone().applyMatrix4(inv);
  const d=dirW.clone().transformDirection(inv).normalize(), S0=SPALL[kind], ov=clamp(over,1,2.2), S={...S0,len:S0.len*(.8+ov*.35),base:S0.base*(.9+ov*.15)}, C=compPos(t), hurt=[];
  let rack=false;
  for(const [name,c] of Object.entries(C)){
    const s0=clamp(c.clone().sub(P).dot(d),0,S.len), q=P.clone().addScaledVector(d,s0), dist=c.distanceTo(q), r=S.r0+s0*S.sp+.35;
    if(dist>r) continue;
    const dmg=S.base*sc*(1-dist/r)*(1-s0/(S.len*1.5))*rand(.75,1.15);
    if(name==='ammo'||name==='ammo2'){ if(dmg>45&&Math.random()<.45) rack=true; else if(Math.random()<.3){ t.fireT=Math.max(t.fireT,30); hurt.push('¡incendio!'); } hurt.push('munición'); continue; }
    if(name==='engine'){ t.mod.engine-=dmg; if(t.mod.engine<=0){t.engT=20; hurt.push('motor destruido'); if(Math.random()<.4){ t.fireT=Math.max(t.fireT,30); hurt.push('¡incendio!'); } } else hurt.push('motor'); continue; }
    if(name==='trans'){ t.mod.trans-=dmg; hurt.push(t.mod.trans<=0?'transmisión rota':'transmisión'); continue; }
    if(name==='breech'){ t.mod.breech-=dmg; if(t.mod.breech<=0){t.breechT=12; hurt.push('cañón inutilizado');} continue; }
    const m=t.crewM.find(x=>x.alive&&x.seat===name); if(!m) continue;
    m.hp-=dmg*1.3; if(m.hp<=0){m.alive=false; hurt.push(SEAT_ES[name]+' muerto');} else hurt.push(SEAT_ES[name]+' herido');
  }
  afterHit(t,by,rack);
  return hurt;
}
function afterHit(t,by,rack){
  if(t.dead) return;
  t.hp=t.T.hp*t.crewM.reduce((a,m)=>a+Math.max(0,m.hp),0)/(t.crewM.length*100);
  if(t.isPlayer){vig=.6;$('vig').style.opacity=.9;}
  if(rack) destroy(t,by,true); else if(crewAlive(t)<2) destroy(t,by,false);
  if(!t.dead&&!t.swapT&&(!manned(t,'driver')||!manned(t,'gunner'))&&spareOf(t)) t.swapT=t.T.seats&&t.T.seats.length>5?3:5;
  updateHud();
}
let playerFocus=null, playerFocusT=0;
function hitTank(by,hit,dir,pen,kind,A){
  const t=hit.object.userData.tank, zone=hit.object.userData.zone, face=faceOf(hit.face.normal);
  if(kind==='shell'){explode(hit.point,'metal'); if(!sfx('metal',hit.point,t.isPlayer?1.2:.9,{rate:rand(.55,.72),near:t.isPlayer})) clang(distVol(hit.point,.25));}
  else debris(hit.point,2,sparkMat,3,.5);
  if(t.dead) return;
  if(t.team===by.team){ if(by.isPlayer&&kind==='shell') hitMsg('Fuego amigo: sin daño','var(--paper)'); return; }
  if(t.immuneT>0){ if(by.isPlayer) hitMsg('Protegido: recién aparecido','var(--paper)'); return; }
  if(by&&!by.inf) by.shotAt={tank:t,t:now};
  if((by.isPlayer||isRemote(by))&&kind==='shell'&&by.team===0){ playerFocus=t; playerFocusT=now; t.spottedT=6; }
  if(zone==='barrel'){ barrelHit(t,by,kind,pen,A); return; }
  const wn=hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
  const cos=Math.abs(dir.dot(wn)); let armor=t.T.armor[zone][face], spot='';
  // Puntos débiles y fuertes: placa inferior, tronera del conductor, anillo de la torre y mantelete del cañón
  if(kind!=='mg'&&(face==='front'||face==='side')){ t.root.updateMatrixWorld(true); const q=hit.point.clone().applyMatrix4(new THREE.Matrix4().copy(t.root.matrixWorld).invert()), M=t.T.m, hy=(M.wr*2+.25)*.55;
    if(zone==='hull'&&face==='front'){ if(q.y<hy+M.H*.38){ armor*=.62; spot='placa inferior'; } else if(q.y>hy+M.H*.62&&Math.abs(q.x+M.W*.25)<.35){ armor*=.7; spot='tronera del conductor'; } }
    else if(zone==='turret'&&!M.ww1){ const c=Math.cos(t.turretYaw), sn=Math.sin(t.turretYaw), lx=q.x*c-(q.z-M.tz)*sn;
      if(q.y<hy+M.H+M.th*.2){ armor*=.7; spot='anillo de la torre'; } else if(face==='front'&&Math.abs(lx)<M.tw*.18){ armor*=1.25; spot='mantelete'; } } }
  let res, hurt=[];
  if(kind==='mg'){
    if(pen*rand(.9,1.1)>armor/Math.max(cos,.2)){ res='mg'; damage(t,1.6,by,false); } else res='No penetró';
    // ametralladora contra la oruga: cada impacto la desgasta; aguanta unas 50 balas de 7,62 o unas 20 de 12,7 en la misma oruga
    if(zone==='hull'&&!(t.trackT>0)&&!t.T.m.wheeled){ t.root.updateMatrixWorld(true); const q=hit.point.clone().applyMatrix4(new THREE.Matrix4().copy(t.root.matrixWorld).invert()), M=t.T.m;
      if(Math.abs(q.x)>M.W/2-.75&&q.y<(M.wr*2+.25)*.55+M.H*.3){ const sd=q.x>0?0:1; t.trkHP=t.trkHP||[100,100];
        t.trkHP[sd]-=(pen>=25?5:2)*rand(.8,1.2); res='trk';
        if(t.trkHP[sd]<=0){ t.trkHP[sd]=100; t.trackT=10; hurt.push('oruga rota'); res='Oruga cortada'; afterHit(t,by,false); } } }
  } else {
    const k=A.kind, ric={ke:.26,heat:.17,hesh:.34,he:0}[k], eff=k==='hesh'?armor:armor/Math.max(cos,.2);
    // Orugas: impacto bajo en el costado
    t.root.updateMatrixWorld(true);
    const lp=hit.point.clone().applyMatrix4(new THREE.Matrix4().copy(t.root.matrixWorld).invert()), M=t.T.m;
    if(zone==='hull'&&Math.abs(lp.x)>M.W/2-.75&&lp.y<(M.wr*2+.25)*.55+M.H*.3&&Math.random()<.75*Math.sqrt(A.sc||1)){ t.trackT=Math.max(t.trackT,10); hurt.push('oruga rota'); }
    if(zone==='turret'&&face==='front'&&Math.random()<.22*(A.sc||1)&&t.mod.breech>0){ t.mod.breech=0; t.breechT=12; hurt.push('cañón dañado'); }
    if(cos<ric&&k!=='he') res='Rebote';
    else if(pen*rand(.9,1.1)>eff){
      res='Penetración'; if(!(A.sc<1)||Math.random()<.25) addSP(by,15,20,'Penetración'); if(by.crew&&by.crew.st&&(face==='side'||face==='rear')) by.crew.st.side++;
      hurt=hurt.concat(spall(t,hit.point,k==='hesh'||k==='he'?wn.clone().negate():dir,k,by,A.sc||1,k==='ke'?pen/eff:1));
      if(t.dead) res=t.rack?'Estiba de munición':'Destruido';
    } else {
      res='No penetró';
      if(k==='he'||k==='hesh') heSplash(hit.point,by,A,t);
      if(hurt.length) afterHit(t,by,false);
    }
  }
  const det=hurt.length?' · '+[...new Set(hurt)].slice(0,3).join(', '):'';
  if(kind==='shell') hitMark(hit,res==='Penetración');
  if(kind==='shell'&&res==='Rebote') sfx('ric',hit.point,t.isPlayer?1:.8,{near:t.isPlayer});
  if(kind==='shell'&&by.isPlayer&&!t.dead){ if(res==='Rebote') radio('¡Rebotó!'); else if(res==='No penetró') radio('No penetró.'); else if(res==='Penetración') radio('¡Penetración!'); }
  if(kind==='shell'&&t.isPlayer){ if(res==='Penetración') radio('¡Nos penetraron!',2); else if(res==='Rebote') radio('¡Rebotó en el blindaje!'); else if(res==='No penetró') radio('El blindaje aguantó.'); }
  if(by.isPlayer||isRemote(by)){
    // ametralladora: solo "Impacto"; el detalle aparece cuando rompe algo (oruga, daño que pasa el blindaje, destruido)
    if(kind==='mg'){ const big=t.dead||res==='Oruga cortada', m=t.dead?'Destruido':res==='Oruga cortada'?'Impacto · oruga cortada':res==='mg'?'Impacto · daño':'Impacto';
      if(big||(by.isPlayer?mgMsgT<=0:(by.mgMsgT||0)<now)){ by.mgMsgT=now+.8; if(by.isPlayer) mgMsgT=.8; tell(by,m,big||res==='mg'?'var(--amber)':'var(--paper)'); } }
    else tell(by,res+(['Penetración','No penetró','Rebote'].includes(res)?' · '+(spot||FACE_ES[face]):'')+det, ['Penetración','Destruido','Estiba de munición'].includes(res)?'var(--amber)':'var(--paper)');
  }
  if(t.isPlayer&&by) hitFrom(by.pos.x,by.pos.z,kind==='mg'?.5:1);
  else if(by&&isRemote(t)) netTo(t,{t:'hf',x:by.pos.x,z:by.pos.z,s:kind==='mg'?.5:1});
  if((t.isPlayer||isRemote(t))&&kind==='shell'){
    if(res==='Penetración') tell(t,'Te penetraron'+det,'var(--enemy)');
    else if(res==='Rebote'||res==='No penetró') tell(t,(res==='Rebote'?'Rebotó en tu blindaje':'Tu blindaje aguantó')+det,'var(--ally)');
  }
  if(!t.isPlayer&&t.team!==by.team){ if(by.inf) t.infT=by; else {t.target=by;t.errScale=Math.min(t.errScale,.8);} }
}
// Impacto en el tubo del cañón: con daño leve se puede disparar (peor puntería); destruido, no dispara hasta repararlo
function barrelHit(t,by,kind,pen,A){
  const b0=t.mod.barrel??100;
  const dmg=kind==='mg'?(pen>=25?3:.5)*rand(.7,1.3):((A.kind==='he'||A.kind==='hesh')?75:50+Math.min(55,pen*.12))*rand(.8,1.2)*(A.sc||1);
  t.mod.barrel=Math.max(0,b0-dmg); t.lastBy=by; noteHit(t,by); setBarrelLook(t);
  const st=t.mod.barrel<=0?'cañón destruido':t.mod.barrel<60?'cañón dañado':'cañón rozado';
  if(kind!=='mg'&&(by.isPlayer||isRemote(by))) tell(by,'Impacto en el cañón · '+st,'var(--amber)');
  if(kind==='mg'&&(by.isPlayer||isRemote(by))){ const ch=(b0>0&&t.mod.barrel<=0)||(b0>=60&&t.mod.barrel<60);
    if(ch||(by.isPlayer?mgMsgT<=0:(by.mgMsgT||0)<now)){ by.mgMsgT=now+.8; if(by.isPlayer) mgMsgT=.8; tell(by,ch?'Impacto · '+st:'Impacto',ch?'var(--amber)':'var(--paper)'); } }
  if((t.isPlayer||isRemote(t))&&(kind!=='mg'||(b0>0&&t.mod.barrel<=0)||(b0>=60&&t.mod.barrel<60))) tell(t,'Te pegaron en el cañón · '+st+(t.mod.barrel<=0?': repará para volver a disparar':t.mod.barrel<60?': dispara con menos precisión':''),'var(--enemy)');
  if(kind!=='mg'&&!(A.sc<1)) addSP(by,8,15,'Cañón dañado');
  if(t.isPlayer&&by) hitFrom(by.pos.x,by.pos.z,kind==='mg'?.4:.8); else if(by&&isRemote(t)) netTo(t,{t:'hf',x:by.pos.x,z:by.pos.z,s:.8});
  if(!t.isPlayer&&t.team!==by.team){ if(by.inf) t.infT=by; else t.target=by; }
  updateHud();
}
function setBarrelLook(t){ const m=t.barrelMesh; if(!m) return; const b=t.mod.barrel??100;
  if(b<=0){ m.scale.y=.6; m.position.z=t.T.m.gl*.3+.35; m.rotation.x=Math.PI/2+.12; }
  else { m.scale.y=1; m.position.z=t.T.m.gl/2+.35; m.rotation.x=Math.PI/2+(b<60?.035:0); } }
// Mecánico: al reparar, un tripulante se baja y trabaja al costado del tanque (lo pueden herir)
function mechSync(t){
  const want=t.repairT>0&&!t.dead;
  if(want&&!t.mech){ const P=personMesh({kind:'crew',team:t.team,nat:t.crew&&t.crew.nation}); P.g.userData.mech=true; scene.add(P.g); t.mech=P; t.mechA=0; }
  if(!want&&t.mech){ scene.remove(t.mech.g); t.mech=null; }
  if(t.mech){ const M=t.T.m, side=t.trackT>0||(t.trkHP&&t.trkHP[1]<t.trkHP[0])?-1:1, c=Math.cos(t.heading), sn=Math.sin(t.heading), lx=side*(M.W/2+.75), lz=M.L*.12;
    const x=t.pos.x+lx*c+lz*sn, z=t.pos.z-lx*sn+lz*c; const g=t.mech.g; g.position.set(x,heightAt(x,z),z); g.rotation.y=t.heading-side*Math.PI/2;
    t.mechA=(t.mechA||0)+.016*9; const p=t.mech.parts; p.hip.position.y=.5; p.hip.rotation.x=.55; p.legL.rotation.x=-1.3; p.legR.rotation.x=-.4; p.armR.rotation.x=-1.6+Math.sin(t.mechA)*.6; p.armL.rotation.x=-1.1; }
}
// Explosivo que no entra: onda sobre tanques cercanos con blindaje fino y orugas
function heSplash(p,by,A,direct){
  const r=(A.kind==='he'?4:2.5)*(A.sc<1?.5:1);
  if(A.sc<1&&Math.random()<.5) return;
  for(const t of tanks){ if(t.dead||t.team===by.team||t.immuneT>0) continue; const d=t.pos.distanceTo(p)-t.R*.6; if(d>r) continue;
    const top=t.T.armor.hull.top, side=t.T.armor.hull.side, k=1-Math.max(0,d)/r;
    if(Math.random()<.5*k){t.trackT=Math.max(t.trackT,8);}
    if(Math.min(top,side)<A.pen*.6) damage(t,22*k*(A.kind==='he'?1:.7)*(A.sc||1),by,false);
  }
}
function damage(t,dmg,by,rack){
  if(t.dead||t.immuneT>0||(by&&by!==t&&by.team===t.team)) return;
  noteHit(t,by);
  const live=t.crewM.filter(m=>m.alive); if(!live.length) return;
  const n=dmg>12?2:1;
  for(let i=0;i<n;i++){const m=live[(Math.random()*live.length)|0]; m.hp-=dmg*2.2/n; if(m.hp<=0) m.alive=false;}
  if(dmg>10&&Math.random()<dmg/80) t.trackT=Math.max(t.trackT,8);
  if(dmg>15&&Math.random()<.25){t.mod.engine-=dmg*1.5; if(t.mod.engine<=0)t.engT=20;}
  afterHit(t,by,rack);
}
// Reparaciones, cambio de puestos e incendios
// Reparación manual: el tanque queda quieto y sin disparar; arregla orugas, motor, cañón y apaga el fuego.
// Un soldado de infantería aliado corre hasta el tanque y ocupa el puesto de un tripulante caído.
function callCrew(t){
  const lost=t.crewM.filter(m=>!m.alive); if(!lost.length){ tell(t,'La tripulación está completa','var(--paper)'); return; }
  if(t.boarding){ tell(t,'Ya viene un soldado en camino','var(--paper)'); return; }
  let best=null,bd=150; for(const P of infantry){ if(P.dead||isCiv(P)||P.team!==t.team||P.board||P.embark) continue; const d=P.pos.distanceTo(t.pos); if(d<bd){bd=d;best=P;} }
  if(!best){ tell(t,'No hay infantería aliada a menos de 150 m','var(--enemy)'); return; }
  best.board=t; best.goal=null; best.target=null; t.boarding=best; tell(t,`Un soldado viene a reemplazar al ${SEAT_RADIO[lost[0].seat]||'tripulante'} (${Math.round(bd)} m)`,'var(--ally)');
}
function extinguish(t){
  if(!t||t.dead) return false;
  if(!(t.fireT>0)){ tell(t,'No hay fuego a bordo','var(--paper)'); return false; }
  if(!(t.ext>0)){ tell(t,'No quedan extintores: reparar también apaga el fuego','var(--enemy)'); return false; }
  t.ext--; t.fireT=0; t.fireAge=0; t.extAt=0; tell(t,`Fuego apagado · quedan ${t.ext} extintores`,'var(--ally)'); if(t.isPlayer) radio('¡Tripulación lista! ¡Adelante!');
  for(let i=0;i<6;i++) puff(t.pos.clone().add(new THREE.Vector3(rand(-1.5,1.5),t.topH+rand(0,1),rand(-1.5,1.5))),0xeeeeee,rand(1.5,2.5),1.2,1.2,.7);
  return true;
}
function startRepair(t){
  if(t.repairT>0){ t.repairT=0; tell(t,'Reparación cancelada','var(--paper)'); return; }
  if(!needsRepair(t)){ tell(t,'No hay nada que reparar','var(--paper)'); return; }
  const k=crewAlive(t)/t.crewM.length; t.repairMax=t.repairT=Math.round(9/Math.max(.4,k)*(t.repairK||1)); t.speed=0; tell(t,`Reparando… ${t.repairT} s`,'var(--amber)');
}
function updateModules(t,dt){
  if(!t.isPlayer&&!t.net&&!isRemote(t)&&(t.mod.barrel??100)<=0&&!(t.repairT>0)&&!t.dead) startRepair(t); // la IA arregla el cañón destruido
  { const lost=t.crewM.some(m=>!m.alive), mine=t.team===0?1:-1;
    if(lost&&Math.abs(t.speed)<1&&zones.some(Z=>Z.owner===mine&&Math.hypot(Z.x-t.pos.x,Z.z-t.pos.z)<Z.r)){ t.crT=(t.crT||0)+dt;
      if(t.crT>=10){ t.crT=0; const m=t.crewM.find(x=>!x.alive); m.alive=true; m.hp=80; tell(t,`Nuevo ${SEAT_RADIO[m.seat]||'tripulante'} a bordo`,'var(--ally)'); t.hp=t.T.hp*t.crewM.reduce((a,x)=>a+Math.max(0,x.hp),0)/(t.crewM.length*100); } }
    else t.crT=0; }
  // Agua profunda: el motor se ahoga y el tanque se hunde; a los 5 s la tripulación se ahoga
  if(!t.air&&flooded(t)){ if(!t.sinkT){ t.sinkT=0; tell(t,'¡Nos hundimos! Entra agua al tanque','var(--enemy)'); if(t.isPlayer) radio('¡Nos hundimos!',2); }
    t.sinkT+=dt; t.bubT=(t.bubT||0)-dt; if(t.bubT<=0){ t.bubT=.25; puff(new THREE.Vector3(t.pos.x+rand(-1.5,1.5),W.water+.2,t.pos.z+rand(-1.5,1.5)),0xdfe8ea,rand(1,1.8),.8,.6,.6); }
    if(t.sinkT>5){ t.crewM.forEach(m=>{m.alive=false;m.hp=0;}); t.drowned=true; destroy(t,t.lastBy&&t.lastBy.team!==t.team&&now-(t.lastHitT||0)<15?t.lastBy:null,false); return; } }
  else t.sinkT=0;
  if(t.repairT>0){ let nh=0; if(t.help) for(const [P,tm] of t.help){ if(P.dead||now-tm>.4) t.help.delete(P); else nh++; } t.engN=nh;
    if(nh&&!t.engMsg){ t.engMsg=true; tell(t,nh>1?`${nh} ingenieros te ayudan: reparación más rápida`:'Un ingeniero te ayuda: reparación más rápida','var(--ally)'); }
    t.repairT-=dt*(1+.8*Math.min(3,nh)); if(t.repairT<=0){ t.engMsg=false; t.repairT=0; t.trackT=0; t.mod.engine=100; t.mod.breech=100; t.mod.trans=100; t.mod.barrel=100; t.trkHP=[100,100]; setBarrelLook(t); t.engT=0; t.breechT=0; t.fireT=0;
    tell(t,'Reparación terminada','var(--ally)'); if(t.isPlayer){ radio('¡Tripulación lista! ¡Adelante!'); if(tut) tut.rep=true; } } }
  if(t.trackT>0) t.trackT-=dt;
  if(t.mod.engine<=0){ t.engT-=dt; if(t.engT<=0&&t.fireT<=0) t.mod.engine=40; }
  if(t.mod.breech<=0){ t.breechT-=dt; if(t.breechT<=0) t.mod.breech=50; }
  if(t.swapT>0){ t.swapT-=dt; if(t.swapT<=0){ t.swapT=0;
    for(const seat of ['gunner','driver']) if(!manned(t,seat)){ const m=spareOf(t); if(m) m.seat=seat; }
    tell(t,'La tripulación cambió de puesto','var(--paper)'); } }
  if(t.fireT>0){ t.fireT-=dt; t.fireTick=(t.fireTick||0)-dt;
    t.fireAge=(t.fireAge||0)+dt;
    if(!t.isPlayer&&!t.net&&t.ext>0&&t.fireAge>(t.extAt||(t.extAt=rand(2,5)))) extinguish(t); // la IA usa el extintor
    if(t.fireTick<=0){ t.fireTick=1; const live=t.crewM.filter(m=>m.alive); if(live.length){const m=live[(Math.random()*live.length)|0]; m.hp-=7; if(m.hp<=0)m.alive=false;}
      if(Math.random()<.012&&t.fireT>0){ tell(t,'¡El fuego llegó a la munición!','var(--enemy)'); destroy(t,t.lastBy&&t.lastBy.team!==t.team?t.lastBy:null,true); return; }
      afterHit(t,t.lastBy||null,false); puff(t.pos.clone().add(new THREE.Vector3(rand(-1,1),t.topH,rand(-1,1))),0xff7020,rand(2,3),.6,2,1,true); puff(t.pos.clone().setY(t.pos.y+t.topH+1),0x2a2622,rand(3,5),2,3,.6); } }
}

/* ---------- Premios estilo War Thunder ---------- */
let battleKills=0, lastKillCrew=null;
function noteHit(t,by){ if(!by||!by.crew||by.team===t.team) return; (t.hitters||(t.hitters=new Map())).set(by.crew,now); t.tookDmg=true; }
function award(c,name,sp,score){
  if(!c) return; c.sp+=sp; c.score+=score; c.awards=c.awards||{}; c.awards[name]=(c.awards[name]||0)+1;
  if(c.isPlayer) $('spT').textContent=c.sp; awardNote(c,name,score);
}
// muestra la acción (en tu pantalla, o en la del invitado que la hizo)
function awardNote(c,name,score){ if(c.isPlayer) showAward(name,score); else if(c.peer){ const k=net.conns.find(x=>x.peer===c.peer); if(k&&k.open) k.send({t:'aw',n:name,s:score}); } }
function showAward(name,score){
  let box=$('awards'); if(!box){ box=document.createElement('div'); box.id='awards'; box.className='hud'; document.body.appendChild(box); }
  const R=actionReward(score), sg=v=>v<0?String(v):'+'+v.toLocaleString('es-AR'); // PI y Yaguaretés que suma la acción
  const d=document.createElement('div'); d.innerHTML=`<b${score<0?' style="color:var(--enemy)"':''}>${name}</b><small><em>${sg(R.rp)} PI</em><u>🐆 ${sg(R.yp)}</u></small>`; box.appendChild(d); setTimeout(()=>d.classList.add('out'),2600); setTimeout(()=>d.remove(),3300);
  sfx('metal',null,.25,{near:true,rate:1.8});
}
function killAwards(t,by){
  const kc=by&&by.crew&&by.team!==t.team&&!by.inf?by.crew:null, vc=t.crew;
  if(kc){
    if(battleKills===0) award(kc,'Primera sangre',50,60);
    battleKills++; lastKillCrew=kc;
    if(kc.lastKiller===vc){ award(kc,'Ojo por ojo',50,60); kc.lastKiller=null; }
    if(vc&&(vc.recent||[]).some(k=>k.team===kc.team&&k.crew!==kc&&now-k.t<30)) award(kc,'Vengador',40,50);
    const sa=t.shotAt; if(sa&&sa.tank&&!sa.tank.dead&&sa.tank.team===by.team&&sa.tank!==by&&now-sa.t<8) award(kc,'Rescatista',40,50);
    kc.streak=(kc.streak||[]).filter(x=>now-x<20); kc.streak.push(now);
    if(kc.streak.length===2) award(kc,'Doble derribo',30,40); else if(kc.streak.length===3) award(kc,'Triple derribo',60,80); else if(kc.streak.length>3) award(kc,'Imparable',80,100);
    if(!by.tookDmg&&!by.cleanAw){ by.cleanAw=true; award(kc,'Sin un rasguño',30,40); }
    (kc.recent||(kc.recent=[])).push({crew:vc,team:t.team,t:now}); if(kc.recent.length>6) kc.recent.shift();
    if(vc) vc.lastKiller=kc;
  }
  // asistencias: los que le hicieron daño en los últimos 30 s
  if(t.hitters) for(const [c,tt] of t.hitters){ if(c===kc||now-tt>30||c.team===t.team) continue; c.assists=(c.assists||0)+1; award(c,'Asistencia',40,50); }
}
function destroy(t,by,rack){
  t.dead=true; t.hp=0; t.speed=0; t.rack=rack; t.mat.color.setHex(0x2e2a26); t.deadT=0; groundMark(t.pos,t.T.m.L*.7);
  if(t.trk) t.trk.mats.forEach(m=>m.color.setHex(0x555555)); if(t.ant) t.ant.visible=false; if(t.deco) t.deco.forEach(o=>o.visible=false); if(t.mud) t.mud.color.setHex(0x2e2a26);
  t.popV=rack?rand(6,9):0;
  t.crew.deaths++;
  if(by&&by.team!==t.team&&by.crew){by.crew.kills++; addSP(by,90,100,'Tanque destruido'); if(by.key&&by.crew.tk){ (by.crew.tk[by.key]||(by.crew.tk[by.key]={k:0,d:0})).k++; } }
  if(t.crew&&t.crew.tk){ (t.crew.tk[t.key]||(t.crew.tk[t.key]={k:0,d:0})).d++; }
  killAwards(t,by);
  tickets[t.team]-=TICKET_KILL;
  t.crew.respawnT=7;
  feed(by?`${by.inf?(by.team===0?allyLabel():NATIONS[foeNation].label)+', '+by.name.toLowerCase():by.name} (${by.T.label}) ✕ ${t.name} (${t.T.label})`:`${t.name} (${t.T.label}) ${t.a10K?'fue fusilado por un A-10 (fuera del campo de batalla)':t.drowned?'se hundió: la tripulación se ahogó':'se incendió'}`, by&&by.isPlayer?'var(--amber)':(t.team===0?'var(--enemy)':'var(--ally)'));
  if(!sfx('expl',t.pos,1.1,{rate:rand(.72,.85)})) boom(distVol(t.pos,.9),1.6,600);
  if(by&&by.isPlayer&&t.team!==by.team) radio('¡Blanco destruido!',2);
  for(let i=0;i<6;i++) puff(t.pos.clone().add(new THREE.Vector3(rand(-2,2),rand(1,3),rand(-2,2))),0xff8a30,rand(3,6),.5,1,1,true);
  if(t.isPlayer){ playerDeadT=3.5; banner(t.a10K?'Fusilado por el A-10':t.drowned?'Tanque hundido':'Vehículo destruido',canSpawn(playerCrew)?'Vas a poder elegir el siguiente':'No te quedan vehículos o puntos para reaparecer',3.5); }
  updateHud(); checkEnd();
}

/* ---------- Ametralladora ---------- */
function fireMG(t){
  if(t.dead||t.mgLock) return;
  if(t.mgBelt!=null){ if(t.mgRel>0) return;
    if(t.mgBelt<=0){ if(t.mgBelts>0){ t.mgBelts--; t.mgBelt=250; t.mgRel=5; if(t.isPlayer) hitMsg('Cambiando cinta…','var(--paper)'); }
      else if(t.isPlayer&&now>(t.noMgMsg||0)){ t.noMgMsg=now+2; hitMsg('Sin munición de ametralladora','var(--enemy)'); } return; }
    t.mgBelt--; }
  t.immuneT=0; t.mgCount++;
  t.mgHeat=Math.min(1,t.mgHeat+.03); if(t.mgHeat>=1) t.mgLock=true;
  t.root.updateMatrixWorld(true);
  const o=t.coax.getWorldPosition(new THREE.Vector3()), d=t.barrel.getWorldDirection(new THREE.Vector3());
  // jugador: la coaxial dispara a donde marca la mira (centro de la pantalla), si la torre ya apunta hacia ahí
  if(t.isPlayer&&lastAim&&lastAim.distanceTo(o)>4){ const to=lastAim.clone().sub(o).normalize(); if(to.angleTo(d)<.2) d.copy(to); }
  d.x+=rand(-1,1)*.007; d.y+=rand(-1,1)*.007; d.z+=rand(-1,1)*.007; d.normalize();
  ray.set(o,d); ray.far=380;
  const hits=ray.intersectObjects(colliders.concat(houseMeshes,treeMeshes(),civHits),false).filter(x=>x.object.userData.tank!==t&&!(treeOf(x)&&treeOf(x).fallen));
  ray.far=Infinity;
  let dist=380, hit=hits[0]||null; if(hit) dist=hit.distance;
  { const s=infOnRay(o,d,dist,t,.3); if(s>=0){dist=s;hit=null;} }
  for(let s=3;s<dist;s+=3){const p=o.clone().addScaledVector(d,s); if(p.y<heightAt(p.x,p.z)){dist=s;hit=null;debris(p,2,dirtMat,2,.5);break;}}
  const end=o.clone().addScaledVector(d,dist);
  if(t.mgN++%3===0) tracer(o,end,t.team===0?0xffd080:0xff9a70);
  if(hit&&hit.object.userData.plane){ debris(hit.point,2,sparkMat,2,.5); planeHit(hit.object.userData.plane,2,t); hit=null; }
  if(hit){ const tr=treeOf(hit); if(tr){ tr.hp-=1; debris(hit.point,2,leafMat,2,.5); if(tr.hp<=0) knockTree(tr,d.x,d.z); }
    else if(hit.object.userData.tank){ if(!net.guest) hitTank(t,hit,d,mgPen(mgCal(t)),'mg'); } else { debris(hit.point,2,dirtMat,2,.5); const b=bldOf(hit); if(b){ if(Math.random()<.6) markBuilding(hit,b,rand(.14,.24)*(mgCal(t)>=12?1.6:1),'mg'); if(Math.random()<.15) damageBuilding(b,mgCal(t)>=12?8:2.5); } } }
  if(t.isPlayer&&LOOPS.mgburst){ mgLastShot=AC.currentTime; } else if(!sfx('mgshot',o,.55,{rate:rand(.95,1.1),maxD:700})) boom(t.isPlayer?.12:distVol(o,.08),.06,2500);
}

/* ---------- Apoyo: artillería y ataque aéreo ---------- */
// Pedido de Sebastián: los apoyos no cuestan puntos, se recargan con el tiempo (artillería cada 45 s, bombardeo cada 1:30)
const ARTY_COST=0, AIR_COST=0, ARTY_CD=45, AIR_CD=90;
// La recarga es del equipo: cuando alguien pide un apoyo, todo su equipo espera
const teamCD=(team,k,v)=>{ for(const c of crews) if(c.team===team) c[k]=Math.max(c[k]||0,v); };
const arty=[], marks=[], planes=[], bombs=[];
const ringGeo=new THREE.RingGeometry(.9,1,64); ringGeo.rotateX(-Math.PI/2);
// Marca de un apoyo en el suelo: bengalas clavadas (una en el centro y otras alrededor) que brillan, titilan y largan humo de color.
// Sin luces de verdad (agregar o sacar una luz recompila todos los materiales): el brillo es un sprite aditivo sin niebla.
const flareGeo=new THREE.CylinderGeometry(.035,.04,.4,5); flareGeo.translate(0,.2,0);
function markZone(p,r,color,until){
  const g=new THREE.Group(), fl=[], n=r>40?8:r>15?5:4; scene.add(g);
  for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+rand(-.4,.4), d=i?r*rand(.35,.7):0, x=p.x+Math.cos(a)*d, z=p.z+Math.sin(a)*d, y=heightAt(x,z);
    const st=new THREE.Mesh(flareGeo,darkMat); st.position.set(x,y,z); st.rotation.set(rand(-.5,.5),0,rand(-.5,.5)); g.add(st);
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,color,transparent:true,opacity:.95,depthWrite:false,fog:false,blending:THREE.AdditiveBlending}));
    glow.position.set(x,y+.45,z); glow.scale.setScalar(2.2); g.add(glow); fl.push({glow,x,y,z,ph:rand(0,6),smT:rand(0,.3)}); }
  marks.push({g,fl,until,p:p.clone(),r,color,smoke:new THREE.Color(color).lerp(new THREE.Color(0x8a8078),.45).getHex()});
}
function blast(p,big){
  flash.position.copy(p).setY(p.y+3); flash.intensity=7*big;
  for(let i=0;i<4;i++) puff(p.clone().add(new THREE.Vector3(rand(-1.5,1.5),rand(.5,2.5),rand(-1.5,1.5)).multiplyScalar(big)),0xff8a2a,rand(7,11)*big,rand(.35,.6),3,1,true);
  for(let i=0;i<6;i++) puff(p.clone().add(new THREE.Vector3(rand(-2,2),rand(1,4),rand(-2,2)).multiplyScalar(big)),0x2e2a26,rand(8,13)*big,rand(4,6.5),rand(3.5,6),.8);
  for(let i=0;i<4;i++) puff(p.clone().add(new THREE.Vector3(rand(-4,4),.5,rand(-4,4)).multiplyScalar(big)),0x7a6a52,rand(8,12)*big,rand(2,3.5),.8,.65);
  debris(p,14,dirtMat,9*big,1.4); debris(p,6,sparkMat,10*big,1);
  const sw=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:0xfff0d0,transparent:true,opacity:.7,depthWrite:false}));
  sw.position.copy(p).setY(p.y+.3); scene.add(sw); fx.push({m:sw,life:.5,max:.5,shock:true,size:20*big});
  groundMark(p,2.2*Math.min(2.5,big)); noise(p,140); if(!sfx('expl',p,.95*Math.min(1.3,big),{rate:big>1.2?.78:rand(.9,1.05)})) boom(distVol(p,.9),1.6*big,650); shake=Math.max(shake,clamp(1-p.distanceTo(camera.position)/120,0,.6));
}
function splash(p,by,r,power,bldDmg){
  if(net.guest) return;
  for(const t of tanks){ if(t.dead) continue; const d=t.pos.distanceTo(p); if(d>r) continue;
    if(t.team===by.team) continue;
    const top=t.T.armor.hull.top, side=t.T.armor.hull.side, k=Math.pow(1-d/(r+1),1.4), thin=clamp(35/Math.max(top,10),.6,3), dmg=power*55*k*thin;
    if(t.immuneT<=0) addSP(by,10,10,'Daño por explosión');
    if(t.isPlayer) hitFrom(p.x,p.z,1);
    if(t.immuneT<=0){ if(Math.random()<k*.85) t.trackT=Math.max(t.trackT,10); if(Math.random()<k*.5){t.mod.engine-=60*k*power; if(t.mod.engine<=0)t.engT=20;}
      if(d<2.5&&top<=power*25&&Math.random()<.5) t.fireT=Math.max(t.fireT,30);
      // Esquirlas: atraviesan blindaje fino y hieren a la tripulación (más si el tanque es liviano o la explosión fue cerca)
      const sh=clamp(25/Math.max(side,8),.15,2.5)*k*power*.55; for(const m of t.crewM) if(m.alive&&Math.random()<sh){ m.hp-=rand(25,55)*k*power; if(m.hp<=0){m.alive=false; if(t.isPlayer) hitMsg('Esquirlas: tripulante herido','var(--enemy)');} }
      if(Math.random()<k*.35*power) { t.mod.breech-=40*k; if(t.mod.breech<=0){t.mod.breech=0;t.breechT=12;} } }
    if(t.mech&&d<r+2&&t.immuneT<=0){ const m=t.crewM.find(x=>x.alive&&x.seat!=='driver'&&x.seat!=='gunner')||t.crewM.find(x=>x.alive); if(m){ m.alive=false; m.hp=0; } t.repairT=0; tell(t,'¡Hirieron al tripulante que reparaba afuera!','var(--enemy)'); }
    if(Math.random()<k*.3) { t.mod.barrel=Math.max(0,(t.mod.barrel??100)-50*k*power); setBarrelLook(t); }
    damage(t,dmg,by,false);
    if(by.isPlayer&&t.immuneT<=0) hitMsg('Impacto de apoyo','var(--amber)');
    if(!t.isPlayer&&!t.dead) t.revT=1;
  }
  for(const b of gridQuery(p.x,p.z,r+4)){ if(!b.bld) continue; const B=b.bld, d=Math.max(0,Math.hypot(B.x-p.x,B.z-p.z)-Math.min(B.w,B.d)/2);
    if(d<r+3) damageBuilding(B,bldDmg*(1-d/(r+4))); }
  infBlast(p,r+3,by);
  for(const tr of trees) if(!tr.fallen&&Math.hypot(tr.x-p.x,tr.z-p.z)<r*.8) knockTree(tr,tr.x-p.x,tr.z-p.z);
  propsNear(p.x,p.z,r,P=>{ const d=Math.hypot(P.x-p.x,P.z-p.z); if(d>r) return; if(P.kind==='car'){ if(!P.burnt){P.burnt=true; burnCar(P,.18); if(d<r*.6&&!P.crushed){P.crushed=true; setPropMatrix(P);} } } else knockProp(P,P.x-p.x,P.z-p.z); });
  grassNear(p.x,p.z,r*.7,G=>{ if(!G.flat&&Math.hypot(G.x-p.x,G.z-p.z)<r*.7){ G.flat=1; setGrass(G); } });
}
function callArtillery(by,point){
  const c=by.crew; if(c.sp<ARTY_COST||c.artyCD>0) return false;
  if(tut&&by.isPlayer) tut.arty=true;
  c.sp-=ARTY_COST; c.artyCD=ARTY_CD; teamCD(by.team,'artyCD',ARTY_CD); if(c.isPlayer) $('spT').textContent=c.sp;
  const ww=W.era<=2, nS=ww?10:7, sp=ww?14:10;
  for(let i=0;i<nS;i++) arty.push({t:now+4+i*.4,p:point.clone().add(new THREE.Vector3(rand(-sp,sp),0,rand(-sp,sp))),by});
  markZone(point,13,0xffb43c,now+4+7*.4+.6);
  if(AC&&SFX.thump&&SFX.thump.length){ for(let i=0;i<4;i++) setTimeout(()=>sfx('thump',null,.35,{rate:rand(.55,.75)}),i*260+rand(0,120)); } else whistle();
  supNet('arty',by,point); feed(`${by.name} pidió artillería`,by.team===0?'var(--amber)':'var(--enemy)'); return true;
}
function callAirstrike(by,point){
  const c=by.crew; if(!RULE().sup.air||c.sp<AIR_COST||c.airCD>0) return false;
  if(tut&&by.isPlayer) tut.air=true;
  c.sp-=AIR_COST; c.airCD=AIR_CD; teamCD(by.team,'airCD',AIR_CD); if(c.isPlayer) $('spT').textContent=c.sp;
  const dir=new THREE.Vector3(point.x-by.pos.x,0,point.z-by.pos.z); if(dir.lengthSq()<1) dir.set(0,0,1); dir.normalize();
  const g=new THREE.Group(), pm=new THREE.MeshLambertMaterial({color:by.team===0?0x4b5440:0x5a5348});
  box(g,1.3,1.3,10,0,0,0,pm); box(g,13,.25,2.4,0,0,.5,pm); box(g,4.6,.2,1.3,0,.1,-4.3,pm); box(g,.2,1.8,1.4,0,1,-4.3,pm);
  cyl(g,.5,.7,1.2,0,0,5.3,8,darkMat).rotation.x=Math.PI/2;
  const alt=heightAt(point.x,point.z)+65, start=point.clone().addScaledVector(dir,-420); start.y=alt;
  g.position.copy(start); g.lookAt(start.clone().add(dir)); scene.add(g);
  const drops=[-16,-5,6,17].map(o=>point.clone().addScaledVector(dir,o)), tf=Math.sqrt(2*65/G);
  planes.push({g,dir,v:105,by,drops:drops.map(d=>({at:d.clone().addScaledVector(dir,-105*tf),hit:d,done:false})),life:9,snd:movingLoop(SFX.plane&&SFX.plane.length?'plane':'prop',2.6,{rate:1,start:rand(0,15),ref:80})});
  markZone(point.clone(),20,0xff4b32,now+420/105+tf+1);
  supNet('air',by,point); feed(`${by.name} pidió un ataque aéreo`,by.team===0?'var(--amber)':'var(--enemy)');
  if(AC&&SFX.prop&&SFX.prop.length){ /* el sonido viaja con el avión (ver updateArty) */ }
  else if(AC){const t=AC.currentTime,o=AC.createOscillator(),gn=AC.createGain();o.type='sawtooth';o.frequency.setValueAtTime(70,t);o.frequency.linearRampToValueAtTime(140,t+4);o.frequency.linearRampToValueAtTime(60,t+7);
    gn.gain.setValueAtTime(.001,t);gn.gain.linearRampToValueAtTime(.05,t+3.8);gn.gain.exponentialRampToValueAtTime(.001,t+7.5);o.connect(gn).connect(master);o.start(t);o.stop(t+7.6);}
  return true;
}
const bombGeo=new THREE.CylinderGeometry(.25,.25,1.6,8); bombGeo.rotateX(Math.PI/2);
function updateArty(dt){
  for(let i=arty.length-1;i>=0;i--){ const a=arty[i]; if(!a.fl&&now>=a.t-3.2){ a.fl=true; gunFlash(a.by.team,a.p); } // fogonazo de la batería, 3 s antes de caer
    if(!a.w&&now>=a.t-1.6){ a.w=true; incoming(a.p.clone().setY(heightAt(a.p.x,a.p.z)),a.t-now,.5,'shell'); } if(now<a.t) continue;
    a.p.y=heightAt(a.p.x,a.p.z); blast(a.p,1); addCrater(a.p,3.4,1.1); splash(a.p,a.by,13,1.25,120); arty.splice(i,1); }
  for(let i=planes.length-1;i>=0;i--){ const P=planes[i]; P.g.position.addScaledVector(P.dir,P.v*dt); P.life-=dt; if(P.snd) P.snd.set(P.g.position);
    for(const d of P.drops){ if(d.done) continue; const rel=P.g.position.clone().sub(d.at); rel.y=0;
      if(rel.dot(P.dir)>=0){ d.done=true; const m=new THREE.Mesh(bombGeo,darkMat); m.position.copy(P.g.position).setY(P.g.position.y-1); m.lookAt(m.position.clone().add(P.dir));
        scene.add(m); bombs.push({m,v:P.dir.clone().multiplyScalar(P.v),by:P.by});
        { const gh=heightAt(d.hit.x,d.hit.z), tf=Math.sqrt(Math.max(1,2*(m.position.y-gh)/G)); incoming(d.hit.clone().setY(gh),tf,.6,'bomb'); } } }
    if(P.life<=0){ if(P.snd) P.snd.stop(); scene.remove(P.g); planes.splice(i,1); } }
  for(let i=bombs.length-1;i>=0;i--){ const B=bombs[i]; B.v.y-=G*dt; B.m.position.addScaledVector(B.v,dt); B.m.lookAt(B.m.position.clone().add(B.v));
    const p=B.m.position, gh=heightAt(p.x,p.z);
    if(p.y<=gh+.3){ const q=p.clone().setY(gh); scene.remove(B.m); bombs.splice(i,1); blast(q,1.6); addCrater(q,5.2,1.7); splash(q,B.by,19,2.4,300); } }
  for(let i=marks.length-1;i>=0;i--){ const M=marks[i];
    if(now>M.until){ scene.remove(M.g); M.fl.forEach(F=>F.glow.material.dispose()); marks.splice(i,1); continue; }
    for(const F of M.fl){ const k=.75+.25*Math.sin(now*23+F.ph)*Math.sin(now*7.3+F.ph*2); F.glow.material.opacity=.6+.35*k; F.glow.scale.setScalar(1.6+1.2*k);
      F.smT-=dt; if(F.smT<=0){ F.smT=.28; puff(new THREE.Vector3(F.x+rand(-.15,.15),F.y+.6,F.z+rand(-.15,.15)),M.smoke,rand(.9,1.4),rand(2.2,3.2),1.6,.42); } } }
}
const NUKE_COST=2000; let nuke=null;
function callNuke(by){
  const c=by.crew; if(!RULE().sup.nuke||nuke||!c||c.sp<NUKE_COST||!['play','spectate','deploy','paused','brief'].includes(state)) return false;
  c.sp-=NUKE_COST; if(c.isPlayer) $('spT').textContent=c.sp;
  const foe=1-by.team, pts=W.sp[foe], p=new THREE.Vector3(0,0,0);
  pts.forEach(q=>{p.x+=q.x;p.z+=q.z;}); p.x/=pts.length; p.z/=pts.length; p.x*=.85; p.z*=.85; p.y=heightAt(p.x,p.z);
  nuke={by,team:by.team,p,t:now+12,phase:0}; markZone(p,90,0xff2a1a,now+16);
  { const home=W.sp[by.team], hx=home.reduce((a,q)=>a+q.x,0)/home.length, hz=home.reduce((a,q)=>a+q.z,0)/home.length;
    const dir=new THREE.Vector3(p.x-hx,0,p.z-hz); if(dir.lengthSq()<1) dir.set(1,0,0); dir.normalize();
    const v=110, alt=150, tf=Math.sqrt(2*alt/G), start=p.clone().addScaledVector(dir,-(v*12)); start.y=p.y+alt;
    const g=makeB29(); g.position.copy(start); g.lookAt(start.clone().add(dir)); scene.add(g);
    nuke.plane={g,dir,v,rel:v*tf,dropped:false,snd:movingLoop(SFX.plane&&SFX.plane.length?'plane':'flyover',3.6,{rate:.72,start:rand(0,15),ref:160,lp:3500})}; }
  supNet('nuke',by,p); banner('¡Ataque nuclear!',`${by.name} lo pidió. Impacto en 12 s`,4); feed(`${by.name} pidió un ataque nuclear`,'var(--enemy)');
  if(AC&&SFX.siren&&SFX.siren.length){ sfx('siren',null,.9); }
  else if(AC){ const t=AC.currentTime, o=AC.createOscillator(), g=AC.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(420,t);
    for(let i=0;i<12;i++){o.frequency.linearRampToValueAtTime(820,t+i+.5);o.frequency.linearRampToValueAtTime(420,t+i+1);}
    g.gain.setValueAtTime(.04,t); g.gain.setValueAtTime(.04,t+11.8); g.gain.linearRampToValueAtTime(.001,t+12); o.connect(g).connect(master); o.start(t); o.stop(t+12.1); }
  return true;
}
function makeB29(){
  const g=new THREE.Group(), m=new THREE.MeshLambertMaterial({color:0xc9ccd0}), dk=new THREE.MeshLambertMaterial({color:0x3a3c40});
  const fus=new THREE.Mesh(new THREE.CylinderGeometry(1.45,1.2,30,14),m); fus.rotation.x=Math.PI/2; g.add(fus);
  const nose=new THREE.Mesh(new THREE.SphereGeometry(1.45,14,10),new THREE.MeshLambertMaterial({color:0xaab4be,transparent:true,opacity:.85})); nose.position.z=15; nose.scale.z=1.3; g.add(nose);
  box(g,43,.45,4.6,0,-.3,2,m); box(g,14,.3,3.4,0,.4,-13.5,m); box(g,.4,6.5,4.6,0,3.4,-13,m);
  for(const ex of [-7.2,-13,7.2,13]){ const e=new THREE.Mesh(new THREE.CylinderGeometry(.85,.75,4.2,10),m); e.rotation.x=Math.PI/2; e.position.set(ex,-.4,4.2); g.add(e);
    const pr=new THREE.Mesh(new THREE.CircleGeometry(2,16),new THREE.MeshBasicMaterial({color:0x222222,transparent:true,opacity:.35,side:THREE.DoubleSide})); pr.position.set(ex,-.4,6.4); g.add(pr); }
  const bay=new THREE.Mesh(new THREE.BoxGeometry(1.6,.2,6),dk); bay.position.set(0,-1.35,1); g.add(bay); g.userData.bay=bay;
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;}); return g;
}
// Hongo nuclear realista: bola de fuego que sube, casquete ancho y achatado que se enrolla (toroide + cúpula),
// columna gruesa que se abre hacia arriba, collar de hielo, anillo de condensación (nube de Wilson) y oleada de polvo en la base.
// Sprites sin niebla con una textura propia que trae luz de arriba y sombra abajo.
const nukeTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  const base=x.createRadialGradient(64,58,0,64,64,62); base.addColorStop(0,'rgba(245,245,245,.9)'); base.addColorStop(.55,'rgba(215,215,215,.7)'); base.addColorStop(1,'rgba(160,160,160,0)');
  x.fillStyle=base; x.fillRect(0,0,128,128);
  for(let i=0;i<60;i++){const px=64+rand(-34,34),py=64+rand(-34,34),r=rand(10,26),g=x.createRadialGradient(px,py-r*.3,0,px,py,r);
    const l=(232-(py-64)*.9+rand(-12,12))|0; g.addColorStop(0,`rgba(${l},${l},${l},.35)`); g.addColorStop(1,`rgba(${l},${l},${l},0)`); x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill();}
  const m=x.getImageData(0,0,128,128),d=m.data; for(let y=0;y<128;y++)for(let X=0;X<128;X++){const i=(y*128+X)*4,q=Math.hypot(X-64,y-64)/64; d[i+3]=d[i+3]*Math.max(0,1-q*q);}
  x.putImageData(m,0,0); return new THREE.CanvasTexture(c);})();
function nukeCloud(p){
  const g=new THREE.Group(); g.position.copy(p); scene.add(g);
  const mk=(color,op,add,tex)=>{const m=new THREE.Sprite(new THREE.SpriteMaterial({map:tex||nukeTex,color,transparent:true,opacity:op,depthWrite:false,fog:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending})); m.material.rotation=Math.random()*6.28; g.add(m); return m;};
  const P=[];
  for(let i=0;i<150;i++) P.push({m:mk(0xffa050,.95),k:'torus',th:Math.random()*Math.PI*2,ph:Math.random()*Math.PI*2,rr:rand(.85,1.08),sz:rand(.75,1.15),j:Math.random()});
  for(let i=0;i<46;i++) P.push({m:mk(0xffa050,.95),k:'dome',th:Math.random()*Math.PI*2,rr:Math.sqrt(Math.random())*.85,sz:rand(.8,1.2),j:Math.random()});
  for(let i=0;i<24;i++) P.push({m:mk(0xffb060,.9,true,smokeTex),k:'glow',th:Math.random()*Math.PI*2,rr:rand(.3,.9),sz:rand(.6,1)});
  for(let i=0;i<70;i++) P.push({m:mk(0x9a8068,.9),k:'stem',h:Math.random(),th:Math.random()*Math.PI*2,rr:Math.sqrt(Math.random()),sz:rand(1.3,1.9),j:Math.random()});
  for(let i=0;i<64;i++) P.push({m:mk(0xf2f2f0,0),k:'wilson',th:i/64*Math.PI*2+rand(-.04,.04),dy:rand(-1,1),sz:rand(.8,1.2)});
  for(let i=0;i<30;i++) P.push({m:mk(0xe8e8ea,0),k:'collar',th:i/30*Math.PI*2+rand(-.1,.1),sz:rand(.8,1.15)});
  for(let i=0;i<80;i++) P.push({m:mk(0xa8957a,.85),k:'surge',th:i/80*Math.PI*2+rand(-.05,.05),rr:rand(.75,1.15),sz:rand(.9,1.5)});
  const fb=mk(0xffffff,1,true,smokeTex); P.push({m:fb,k:'ball'}); const fb2=mk(0xffd890,1,true,smokeTex); P.push({m:fb2,k:'ball2'});
  const L=new THREE.PointLight(0xffb060,16,3500,1.1); L.position.y=60; g.add(L);
  return {g,parts:P,L,age:0,done:false};
}
const hotC=new THREE.Color(0xff8a30), warmC=new THREE.Color(0xc0704a), topC=new THREE.Color(0xeee6d8), midC=new THREE.Color(0xb6a896), lowC=new THREE.Color(0x7a6d60), tmpC=new THREE.Color();
function animNukeCloud(C,dt){
  C.age+=dt; const t=C.age, e=x=>1-Math.exp(-t/x);
  const H=40+330*e(4.2), R=24+135*e(5), r=12+40*e(4.5), stemR=12+26*e(4), surgeR=40+300*e(2.2);
  const heat=Math.exp(-t/4.5), fade=t<28?1:Math.max(0,1-(t-28)/10), roll=t*.42, cool=clamp((t-2)/12,0,1);
  C.L.intensity=16*Math.exp(-t/2.5); C.L.position.y=H*.8;
  for(const Q of C.parts){ const m=Q.m, mat=m.material; let x=0,y=0,z=0,sz=10,op=.9,h=0,vy=0;
    if(Q.k==='ball'){ y=12+70*e(1.4); sz=70+240*e(.5); op=Math.max(0,1-t/2.2); }
    else if(Q.k==='ball2'){ y=16+110*e(1.8); sz=50+160*e(.8); op=Math.max(0,.95-t/5.5); }
    else if(Q.k==='torus'){ // anillo achatado que se enrolla: afuera sube, adentro baja
      const ph=Q.ph+roll, Rr=R*Q.rr, rx=Rr+r*Math.cos(ph); x=Math.cos(Q.th)*rx; z=Math.sin(Q.th)*rx; vy=Math.sin(ph); y=H+r*vy*.45;
      sz=r*Q.sz*1.35; op=.95; h=heat*(Math.cos(ph)<0?1.2:.6)*(vy<0?1.2:.7); }
    else if(Q.k==='dome'){ const rx=R*Q.rr; x=Math.cos(Q.th)*rx; z=Math.sin(Q.th)*rx; vy=.6; y=H+r*.55*(1-Q.rr*Q.rr)+r*.25; sz=r*Q.sz*1.5; op=.95; h=heat*.5; }
    else if(Q.k==='glow'){ const rx=R*Q.rr*.8; x=Math.cos(Q.th+t*.1)*rx; z=Math.sin(Q.th+t*.1)*rx; y=H-r*.35; sz=r*Q.sz*1.6; op=.75*Math.max(0,1-t/10); }
    else if(Q.k==='stem'){ Q.h=(Q.h+dt*.05)%1; const hh=Q.h, w=stemR*(hh<.15?1.9-hh*6:hh>.8?1+(hh-.8)*5:1); // base ancha, cintura, se abre arriba
      x=Math.cos(Q.th+t*.12)*w*Q.rr; z=Math.sin(Q.th+t*.12)*w*Q.rr; y=hh*(H-r*.4); vy=-.2+hh*.4;
      sz=stemR*Q.sz*(1+hh*.5); op=.9*Math.min(1,hh*10)*Math.min(1,(1-hh)*12+.3); h=heat*(1-hh)*.8; }
    else if(Q.k==='wilson'){ const a=t-1, rw=70+150*Math.max(0,a)/(1+Math.max(0,a)*.5); x=Math.cos(Q.th)*rw; z=Math.sin(Q.th)*rw; y=H*.42+Q.dy*6; sz=46*Q.sz;
      op=a<0?0:a<.5?a/.5*.8:Math.max(0,.8-(a-.5)*.14); vy=.8; }
    else if(Q.k==='collar'){ const a=t-2.5, rr=stemR*(2.2+cool*.6); x=Math.cos(Q.th+t*.05)*rr; z=Math.sin(Q.th+t*.05)*rr; y=H*.62; sz=stemR*2.4*Q.sz; op=a<0?0:Math.min(.7,a*.25)*Math.max(0,1-(t-16)/8); vy=.7; }
    else if(Q.k==='surge'){ const rr=surgeR*Q.rr; x=Math.cos(Q.th)*rr; z=Math.sin(Q.th)*rr; y=6+Q.sz*7; sz=(18+34*e(2))*Q.sz; op=.8*Math.min(1,t*1.5)*Math.max(.35,1-t/30); vy=-.3; }
    m.position.set(x,y,z); m.scale.setScalar(sz); mat.opacity=op*fade;
    if(Q.k==='torus'||Q.k==='dome'||Q.k==='stem'){ // color: humo claro arriba (iluminado), oscuro abajo; brasa naranja al principio
      const lit=clamp(.5+vy*.5,0,1); tmpC.copy(lowC).lerp(midC,lit).lerp(topC,Math.max(0,lit-.45)*1.6*cool+lit*.25);
      const hh=clamp(h,0,1); if(hh>0) tmpC.lerp(warmC,Math.min(1,hh*1.4)).lerp(hotC,Math.max(0,hh-.4)*1.5); mat.color.copy(tmpC); }
  }
  if(t>40){ scene.remove(C.g); C.parts.forEach(Q=>Q.m.material.dispose()); C.done=true; }
}
function makeFatMan(){
  const g=new THREE.Group(), m=new THREE.MeshLambertMaterial({color:0x5c5f3a});
  const b=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),m); b.scale.set(1,1,1.6); g.add(b);
  for(const r of [0,Math.PI/2]){ const f=new THREE.Mesh(new THREE.BoxGeometry(2.4,.08,1),m); f.position.z=-1.9; f.rotation.z=r; g.add(f); }
  return g;
}
function updateNuke(dt){
  if(!nuke) return;
  if(nuke.cloud&&!nuke.cloud.done) animNukeCloud(nuke.cloud,dt);
  const PL=nuke.plane;
  if(PL){ PL.g.position.addScaledVector(PL.dir,PL.v*dt); if(PL.snd) PL.snd.set(PL.g.position);
    if(!PL.dropped){ const rel=nuke.p.clone().sub(PL.g.position); rel.y=0;
      if(rel.dot(PL.dir)<=PL.rel){ PL.dropped=true; const bm=makeFatMan(); bm.position.copy(PL.g.position).setY(PL.g.position.y-2.5); scene.add(bm);
        nuke.bomb={m:bm,v:PL.dir.clone().multiplyScalar(PL.v)}; banner('¡Bomba lanzada!','El B-29 abrió la bodega',2);
        { const gh=heightAt(nuke.p.x,nuke.p.z), tf=Math.sqrt(Math.max(1,2*(bm.position.y-gh-30)/G)); incoming(nuke.p.clone().setY(gh+30),tf,.8,'nuke'); } } }
    if(PL.g.position.distanceTo(nuke.p)>1700){ if(PL.snd) PL.snd.stop(); scene.remove(PL.g); nuke.plane=null; } }
  if(nuke.bomb){ const B=nuke.bomb; B.v.y-=G*dt; B.m.position.addScaledVector(B.v,dt); B.m.lookAt(B.m.position.clone().add(B.v));
    if(B.m.position.y<=heightAt(B.m.position.x,B.m.position.z)+30){ scene.remove(B.m); nuke.bomb=null; nuke.p.x=B.m.position.x; nuke.p.z=B.m.position.z; nuke.p.y=heightAt(nuke.p.x,nuke.p.z); nuke.hit=true; } }
  if(nuke.phase===0){ const left=Math.ceil(nuke.t-now); if(left!==nuke.left&&!PL?.dropped){nuke.left=left; if(left>0) banner('¡Ataque nuclear!',`B-29 en camino: ${left} s`,1.2);}
    if(!nuke.hit&&now<nuke.t+8) return;
    nuke.phase=1; nuke.end=now+1.6; const p=nuke.p, by=nuke.by;
    $('nflash').style.transition='none'; $('nflash').style.opacity=1; setTimeout(()=>{$('nflash').style.transition='opacity 3s';$('nflash').style.opacity=0;},120);
    blast(p,5); shake=2.5; boom(1,4,300); boom(.8,6,120); nukeSound(p);
    nuke.cloud=nukeCloud(p); addCrater(p,38,6); camera.far=5000; camera.updateProjectionMatrix();
    const sw=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:0xfff2d8,transparent:true,opacity:.8,depthWrite:false,fog:false}));
    sw.position.copy(p).setY(p.y+.5); scene.add(sw); fx.push({m:sw,life:3.5,max:3.5,shock:true,size:420});
    { const d=Math.round(Math.hypot(p.x-camera.position.x,p.z-camera.position.z)); hitMsg(`¡Detonación nuclear a ${d} m!`,'#ffb060'); }
    if(!net.guest){ for(const t of tanks) if(!t.dead){ if(tut&&t.isPlayer) continue; t.immuneT=0; destroy(t,t.team===nuke.team?null:by,Math.random()<.5); }
      if(!tut) for(const c of crews) c.out=true; }
    for(const P of infantry) if(!P.dead) killInf(P,null,'blast');
    buildings.filter(B=>B.hp>0&&isFinite(B.hp)).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z)).slice(0,160).forEach(B=>damageBuilding(B,1e5));
    for(const tr of trees) if(!tr.fallen&&Math.hypot(tr.x-p.x,tr.z-p.z)<450) knockTree(tr,tr.x-p.x,tr.z-p.z);
    feed('Ataque nuclear: no quedó nada en pie','var(--enemy)');
  } else if(nuke.phase===1&&now>=nuke.end){ nuke.phase=2; if(!tut) tickets[1-nuke.team]=0; }
}
