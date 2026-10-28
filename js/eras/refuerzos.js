/* ---------- Puntos fortificados, refuerzos, antiaéreos y refugiados (pedidos de Sebastián) ----------
   - Al capturar un punto, el bando lo fortifica: nido de ametralladora con sacos terreros, un cañón antitanque y (2ª Guerra) un antiaéreo.
   - Después llegan refuerzos de infantería al punto: un avión de transporte que tira paracaidistas o un semioruga que baja a los soldados.
     Los dos se pueden destruir antes de que lleguen (el avión, con antiaéreos o con la ametralladora y el cañón de los tanques).
   - Antiaéreos (Flak 38, Bofors 40 mm) en las bases y en los puntos: les tiran a los aviones enemigos (bombarderos y transportes).
   - Refugiados: civiles, carros y bicicletas que salen de los pueblos y escapan hacia los costados del mapa.
   Todo lo decide el anfitrión (o la PC sin red); los invitados ven los tanques (semiorugas y antiaéreos) por la sincronización normal. */
const transports=[], chutes=[], fortProps=[], refPending=[];
const axisOf=team=>eraSide(W.era||3,teamNation(team))===1;
const baseOf=team=>{ const B=W.sp[team]; return {x:B.reduce((a,s)=>a+s.x,0)/B.length,z:B.reduce((a,s)=>a+s.z,0)/B.length}; };
// Un cañón (antitanque o antiaéreo) fijo, manejado por la IA, que no reaparece
function rfGun(team,key,x,z,h,label){ if(!key||!VEH[key]) return null; const nat=teamNation(team), c=newCrew(label,team,nat,false); c.lineup=[key]; c.gun=true;
  const p=findSpawnPos({x,z}); c.uses[key]=1; c.spawns=1; const t=makeTank(c,key,p.x,p.z,h); t.immuneT=0; c.tank=t; c.respawnT=1e9; crews.push(c); return t; }
const sandMat=new THREE.MeshLambertMaterial({color:0x9a8a64}), sandGeo=new THREE.BoxGeometry(.7,.28,.38);
function sandRing(x,z,r,open){ const g=new THREE.Group(), y=heightAt(x,z); scene.add(g); fortProps.push(g);
  for(let row=0;row<3;row++) for(let i=0;i<14;i++){ const a=i/14*Math.PI*2+(row%2)*.22; if(Math.abs(wrap(a-open))<.5) continue; const b=new THREE.Mesh(sandGeo,sandMat);
    b.position.set(x+Math.cos(a)*r,y+.14+row*.26,z+Math.sin(a)*r); b.rotation.y=-a+Math.PI/2+rand(-.1,.1); b.castShadow=b.receiveShadow=true; g.add(b); }
  return g; }
// Fortificar un punto recién capturado
function fortifyZone(Z,team){
  if(net.guest||!RULE().guns) return; const F=Z.fort; if(F&&F.team===team&&((F.mg&&!F.mg.dead)||(F.gun&&!F.gun.dead))) return;
  const eb=baseOf(1-team); let dx=eb.x-Z.x, dz=eb.z-Z.z; const L=Math.hypot(dx,dz)||1; dx/=L; dz/=L; const px=-dz, pz=dx, nat=teamNation(team);
  const mx=Z.x+dx*Z.r*.55+px*rand(-6,6), mz=Z.z+dz*Z.r*.55+pz*rand(-6,6);
  const ring=sandRing(mx,mz,1.7,Math.atan2(-dz,-dx));                                     // abierto hacia atrás
  const mg=makePerson('hmg',team,mx,mz); mg.hold=true; mg.goal=null; mg.nest=true;
  const rf=makePerson('rifle',team,mx+px*1.2,mz+pz*1.2); rf.hold=true; rf.goal=null;
  const key=(typeof GUN_ERA!=='undefined'&&GUN_ERA[W.era]&&GUN_ERA[W.era][nat])||GUN_OF[nat], h=Math.atan2(dx,dz);
  const gun=rfGun(team,key,Z.x+dx*Z.r*.35-px*9,Z.z+dz*Z.r*.35-pz*9,h,`Antitanque del punto ${Z.id}`);
  const aa=W.era===3?rfGun(team,axisOf(team)?'aa_de':'aa_al',Z.x-dx*6+px*5,Z.z-dz*6+pz*5,h,`Antiaéreo del punto ${Z.id}`):null;
  Z.fort={team,mg,gun,aa,ring}; feed(`${NATIONS[nat].label} fortifica el punto ${Z.id}: ametralladora${gun?', antitanque':''}${aa?' y antiaéreo':''}`,team===0?'var(--ally)':'var(--enemy)');
}
function onZoneCaptured(Z,team){ if(net.guest) return; fortifyZone(Z,team);
  if(W.era===3&&now>(Z.refT||0)){ Z.refT=now+100; refPending.push({Z,team,t:now+rand(8,16)}); } }

// ---- Refuerzos ----
function sendReinforcements(Z,team){ if(Math.random()<.5) paraDrop(Z,team); else halfTrack(Z,team); }
function halfTrack(Z,team){ const nat=teamNation(team), key=axisOf(team)?'ht_de':'ht_al', B=W.sp[team][(Math.random()*W.sp[team].length)|0], c=newCrew(`Semioruga (${NATIONS[nat].label})`,team,nat,false);
  c.lineup=[key]; c.gun=true; const p=findSpawnPos(B), t=makeTank(c,key,p.x,p.z,Math.atan2(Z.x-p.x,Z.z-p.z)); c.uses[key]=1; c.spawns=1; c.tank=t; c.respawnT=1e9; crews.push(c);
  t.convoyZ=Z; t.convoyT=now; t.goal=null; feed(`Un semioruga lleva infantería al punto ${Z.id}`,team===0?'var(--ally)':'var(--enemy)'); }
// El semioruga va derecho al punto (en vez de elegir otro) hasta bajar a los soldados
{ const _pickGoal=pickGoal; pickGoal=function(t){ if(t.convoyZ&&!t.dismounted){ const Z=t.convoyZ; t.path=null; t.goal=new THREE.Vector3(Z.x+rand(-Z.r*.3,Z.r*.3),0,Z.z+rand(-Z.r*.3,Z.r*.3)); return; } _pickGoal(t); }; }
// Avión de transporte (Ju 52 / C-47): fuselaje, alas, tres o dos motores
function transportMesh(axis){ const g=new THREE.Group(), m=new THREE.MeshLambertMaterial({color:axis?0x4f5440:0x5a5a40}), dk=darkMat;
  const f=cyl(g,1.1,.8,18,0,0,0,10,m); f.rotation.x=Math.PI/2; const n=cyl(g,.2,1.1,2.4,0,0,10.2,10,m); n.rotation.x=Math.PI/2;
  box(g,28,.3,3.2,0,-.3,1.5,m); box(g,9,.22,1.8,0,.4,-8.2,m); box(g,.25,3.2,2.2,0,1.8,-8.4,m);
  for(const sx of axis?[-6,0,6]:[-5,5]){ const e=cyl(g,.6,.6,2.2,sx,sx?-.2:0,sx?2.6:11.2,8,dk); e.rotation.x=Math.PI/2; }
  const hit=new THREE.Mesh(new THREE.BoxGeometry(28,3,20),new THREE.MeshBasicMaterial({visible:false})); g.add(hit); return {g,hit}; }
function paraDrop(Z,team){ const axis=axisOf(team), B=baseOf(team); let dx=Z.x-B.x, dz=Z.z-B.z; const L=Math.hypot(dx,dz)||1; dx/=L; dz/=L;
  const M=transportMesh(axis), alt=Math.max(heightAt(Z.x,Z.z),heightAt(B.x,B.z))+120, start=new THREE.Vector3(Z.x-dx*1100,alt,Z.z-dz*1100);
  M.g.position.copy(start); M.g.lookAt(start.clone().add(new THREE.Vector3(dx,0,dz))); scene.add(M.g);
  const P={g:M.g,hit:M.hit,dir:new THREE.Vector3(dx,0,dz),v:62,team,Z,hp:90,left:6,dropT:0,life:45,snd:movingLoop(SFX.plane&&SFX.plane.length?'plane':'prop',2.8,{rate:.8,start:rand(0,15),ref:90})};
  M.hit.userData.wplane=P; civHits.push(M.hit); transports.push(P);
  feed(`Paracaidistas en camino al punto ${Z.id}`,team===0?'var(--ally)':'var(--enemy)'); }
const canopyGeo=new THREE.SphereGeometry(3.2,12,6,0,Math.PI*2,0,Math.PI/2.2), canopyMat=[new THREE.MeshLambertMaterial({color:0xe8e4d8,side:THREE.DoubleSide}),new THREE.MeshLambertMaterial({color:0x6b6a48,side:THREE.DoubleSide})];
function dropChute(T){ const p=T.g.position.clone().addScaledVector(T.dir,-6); p.y-=2; const g=new THREE.Group(); g.position.copy(p); scene.add(g);
  const kind=T.left===4?'at':T.left===2?'hmg':'rifle', man=personMesh({kind,team:T.team,nat:teamNation(T.team)}); man.parts.legL.rotation.x=.2; man.parts.legR.rotation.x=-.1; man.parts.armL.rotation.x=man.parts.armR.rotation.x=-2.8; g.add(man.g);
  const c=new THREE.Mesh(canopyGeo,canopyMat[T.team===0?0:1]); c.position.y=6.2; c.scale.y=.6; g.add(c);
  for(const [x,z] of [[2.8,0],[-2.8,0],[0,2.8],[0,-2.8]]) rod(g,[0,1.6,0],[x,6.2,z],darkMat,1.2);
  chutes.push({g,kind,team:T.team,Z:T.Z,vy:-14,open:0,ph:rand(0,6)}); T.left--; }
// Daño a un avión (bombardero o transporte): con muchos impactos se incendia y cae
function wplaneHit(P,dmg,by){ if(net.guest||P.down) return; P.hp-=dmg; puff(P.g.position.clone(),0x4a4440,2.5,1.2,0,.7);
  if(P.hp<=0){ P.down=true; P.vy=0; P.killer=by||null; const team=P.team??(P.by&&P.by.team); feed(`${by&&by.name?by.name:'El antiaéreo'} derribó un avión ${team===0?'aliado':'enemigo'}`,team===0?'var(--enemy)':'var(--ally)');
    if(by&&by.crew&&by.team!==team&&!by.inf) addSP(by,40,50,'Avión derribado'); } }
// Caída en llamas: devuelve true cuando tocó el suelo
function planeFall(P,dt){ P.vy=(P.vy||0)-G*dt*.7; P.g.position.addScaledVector(P.dir,P.v*.75*dt); P.g.position.y+=P.vy*dt; P.g.rotateX(dt*.25); P.g.rotateZ(dt*.6);
  P.ft=(P.ft||0)-dt; if(P.ft<=0){ P.ft=.08; puff(P.g.position.clone(),0x2a2622,rand(3,5),3,1.2,.75); puff(P.g.position.clone(),0xff8a30,2.2,.4,0,1,true); }
  const q=P.g.position, gh=heightAt(q.x,q.z); if(q.y>gh+1) return false;
  const pt=q.clone().setY(gh); blast(pt,2); addCrater(pt,6,1.8); infBlast(pt,12,P.killer); boom(distVol(pt,1),2,250); return true; }
function unhit(P){ if(!P.hit) return; const j=civHits.indexOf(P.hit); if(j>=0) civHits.splice(j,1); }
// Los bombarderos del ataque aéreo también se pueden derribar
{ const _cas=callAirstrike; callAirstrike=function(by,point){ const n=planes.length, r=_cas(by,point);
    if(r&&planes.length>n){ const P=planes[planes.length-1], hit=new THREE.Mesh(new THREE.BoxGeometry(14,2.5,11),new THREE.MeshBasicMaterial({visible:false})); P.g.add(hit); P.hit=hit; P.hp=60; P.team=by.team; hit.userData.wplane=P; civHits.push(hit); }
    return r; }; }

// ---- Antiaéreos ----
function aaTargets(team){ const L=[]; for(const P of planes) if(!P.down&&P.by&&P.by.team!==team) L.push({P,pos:P.g.position,vel:P.dir.clone().multiplyScalar(P.v)});
  for(const P of transports) if(!P.down&&P.team!==team) L.push({P,pos:P.g.position,vel:P.dir.clone().multiplyScalar(P.v)}); return L; }
function updateAA(t,dt){
  const L=aaTargets(t.team); let best=null,bd=750; for(const o of L){ const d=o.pos.distanceTo(t.pos); if(d<bd){bd=d;best=o;} }
  t.aaBusy=!!best; if(!best) return;
  const A=ammoOf(t), v=A.v||850, lead=best.pos.clone().addScaledVector(best.vel,bd/v);
  const err=aimAt(t,lead,dt); t.aaT=(t.aaT||0)-dt; if(err>.12||t.aaT>0) return;
  t.aaT=t.T.auto?t.T.auto.rof*rand(.9,1.4):.3; t.root.updateMatrixWorld(true);
  const o=t.muzzle.getWorldPosition(new THREE.Vector3()), end=lead.clone().add(new THREE.Vector3(rand(-1,1),rand(-1,1),rand(-1,1)).multiplyScalar(4+bd*.02));
  tracer(o,end,0xffd27a); puff(o,0xffb050,.8,.08,0,1,true); if(!sfx('mgshot',o,.5,{rate:t.key==='aa_al'?.55:.8,maxD:900})) boom(distVol(o,.06),.05,1500);
  if(t.T.pen>30) puff(end,0x2a2622,rand(2.5,3.5),1.8,.3,.8);                                      // 40 mm: nubecitas negras
  if(Math.random()<clamp(.2-bd/4500,.04,.18)) wplaneHit(best.P,t.T.pen>30?24:10,t); }
{ const _ai=updateAI; updateAI=function(t,dt){ if(t.T.aa&&t.aaBusy) return; return _ai(t,dt); }; }

// ---- Refugiados: civiles y vehículos que salen de los pueblos hacia los costados del mapa ----
const REF_VEH=['cart','cart','bike','bike','truck'].map(k=>VTYPES.findIndex(v=>v.k===k));
function spawnRefugees(){
  if(net.guest||!buildings.length||RULE().civ) return; const nP=10+((Math.random()*6)|0), nV=4;
  const edge=x=>{ const s=x<0?-1:1; return s*(W.bx-4); };
  for(let i=0;i<nP;i++){ const B=buildings[(Math.random()*buildings.length)|0]; const x=B.x+rand(-1,1)*(B.w/2+3), z=B.z+rand(-1,1)*(B.d/2+3); if(!freeInf(x,z)) continue;
    const P=makePerson(Math.random()<.12?'dog':'civ',-1,x,z); P.flee=true; P.refugee=true; P.goal={x:edge(x),z:z+rand(-60,60),door:true};
    if(P.kind!=='civ') continue; refCarry(P);
    if(Math.random()<.35&&freeInf(x+.8,z)){ const C=makePerson('civ',-1,x+.8,z); C.g.scale.setScalar(rand(.55,.68)); C.child=true; C.flee=true; C.refugee=true; C.goal={...P.goal,x:P.goal.x+.8}; } }
  for(let i=0;i<nV;i++){ const B=buildings[(Math.random()*buildings.length)|0], ti=REF_VEH[i%REF_VEH.length]; if(ti<0) continue;
    const ci=(ti<<4)|((Math.random()*16)|0), g=carMesh(ci), V=VTYPES[ti]; scene.add(g); const x=B.x+B.w/2+4, z=B.z;
    traffic.push({id:++carSeq,g,S:null,dir:1,k:0,v:0,vmax:rand(V.v[0],V.v[1])*.8,state:5,ci,x,z,h:0,len:g.userData.len,V,ref:{x:edge(x)*1.02,z:z+rand(-40,40)}}); }
}
// Lo que se llevan: una valija, un atado de ropa o una bolsa al hombro
const refCarryM=[0x4a3626,0x6a4e30,0x2a2a2a,0x8a7a5a,0xb8a888,0x5a3a3a].map(c=>new THREE.MeshLambertMaterial({color:c}));
function refCarry(P){ const A=P.parts&&P.parts.armR; if(!A) return; const r=Math.random();
  if(r<.5){ const m=new THREE.Mesh(PG.suitcase,refCarryM[(Math.random()*3)|0]); m.position.set(0,-.62,0); A.add(m); }
  else if(r<.85){ const m=new THREE.Mesh(PG.bundle,refCarryM[3+((Math.random()*3)|0)]); m.position.set(0,-.72,0); m.scale.set(1,.8,1.1); A.add(m); } }
function updateRefugeeCars(dt){
  for(let i=traffic.length-1;i>=0;i--){ const C=traffic[i]; if(!C.ref||C.state!==5) continue;
    if(noises.some(n=>now-n.t<2&&Math.hypot(n.x-C.x,n.z-C.z)<Math.min(n.r,40))||tanks.some(t=>!t.dead&&Math.hypot(t.pos.x-C.x,t.pos.z-C.z)<18)){ C.state=0; abandonCar(C); continue; }
    const dx=C.ref.x-C.x, dz=C.ref.z-C.z, d=Math.hypot(dx,dz); if(d<6){ scene.remove(C.g); traffic.splice(i,1); continue; }
    C.v+=clamp(C.vmax-C.v,-dt*6,dt*1.5); C.h=wrap(C.h+clamp(wrap(Math.atan2(dx,dz)-C.h),-dt*.8,dt*.8)); C.x+=Math.sin(C.h)*C.v*dt; C.z+=Math.cos(C.h)*C.v*dt; } }

// ---- Arranque, cuadro por cuadro y limpieza ----
function initRefuerzos(){ if(net.guest) return;
  if(W.era===3) for(const team of [0,1]){ const B=baseOf(team), eb=baseOf(1-team), h=Math.atan2(eb.x-B.x,eb.z-B.z); rfGun(team,axisOf(team)?'aa_de':'aa_al',B.x+rand(-20,20),B.z+(team?-1:1)*rand(25,40),h,'Antiaéreo de la base'); }
  if(W.era<=3) spawnRefugees(); }
function updRefuerzos(dt){
  for(let i=refPending.length-1;i>=0;i--){ const R=refPending[i]; if(now<R.t) continue; refPending.splice(i,1); if(!net.guest&&R.Z.owner===(R.team===0?1:-1)) sendReinforcements(R.Z,R.team); }
  for(const t of tanks){ if(t.dead) continue; if(t.T.aa&&!net.guest&&!t.isPlayer&&!(t.crew&&t.crew.peer)) updateAA(t,dt);
    if(t.convoyZ&&!t.dismounted){ const Z=t.convoyZ; if(Math.hypot(t.pos.x-Z.x,t.pos.z-Z.z)<Z.r+10||now-t.convoyT>120){ t.dismounted=true; t.speed=0; dismount(t); } } }
  for(let i=transports.length-1;i>=0;i--){ const T=transports[i];
    if(T.down){ if(planeFall(T,dt)){ if(T.snd) T.snd.stop(); scene.remove(T.g); unhit(T); transports.splice(i,1); } continue; }
    T.g.position.addScaledVector(T.dir,T.v*dt); T.life-=dt; if(T.snd) T.snd.set(T.g.position);
    const rel=T.g.position.clone().sub(new THREE.Vector3(T.Z.x,T.g.position.y,T.Z.z)), along=rel.dot(T.dir);
    if(T.left>0&&along>-T.Z.r*1.2){ T.dropT-=dt; if(T.dropT<=0){ T.dropT=.45; dropChute(T); } }
    if(T.life<=0){ if(T.snd) T.snd.stop(); scene.remove(T.g); unhit(T); transports.splice(i,1); } }
  for(let i=chutes.length-1;i>=0;i--){ const C=chutes[i]; C.vy=Math.min(-4.5,C.vy+dt*12); C.ph+=dt; C.g.position.y+=C.vy*dt; C.g.position.x+=Math.sin(C.ph*.7)*dt*1.2; C.g.rotation.z=Math.sin(C.ph)*.08;
    const q=C.g.position, gh=heightAt(q.x,q.z); if(q.y>gh+.2) continue;
    scene.remove(C.g); chutes.splice(i,1); const P=makePerson(C.kind,C.team,q.x,q.z); P.noEmb=now+90; const a=rand(0,6.28), r=rand(0,C.Z.r*.6); P.goal={x:C.Z.x+Math.cos(a)*r,z:C.Z.z+Math.sin(a)*r}; }
  updateRefugeeCars(dt);
}
function clearRefuerzos(){ transports.forEach(T=>{ scene.remove(T.g); if(T.snd) T.snd.stop(); unhit(T); }); transports.length=0; chutes.forEach(C=>scene.remove(C.g)); chutes.length=0;
  fortProps.forEach(g=>scene.remove(g)); fortProps.length=0; refPending.length=0; for(const Z of zones||[]){ Z.fort=null; Z.refT=0; } }
// Al bajar la infantería, el semioruga queda vacío
{ const _dm=dismount; dismount=function(t){ const r=_dm(t); if(r!==false&&t.seated) t.seated.forEach(g=>g.visible=false); return r; }; }
// Con un antiaéreo la cámara sube casi vertical (para seguir a los aviones)
const camMaxP=()=>player&&!player.dead&&player.T.aa?1.25:.6;
// Mira de adelanto para el jugador con antiaéreo: un círculo donde va a estar cada avión enemigo cuando llegue el tiro
{ const _ov=drawOverlay; drawOverlay=function(){ _ov(); if(state!=='play'||!player||player.dead||!player.T.aa) return;
    const v=ammoOf(player).v||850; oc.strokeStyle='#ffd27a'; oc.lineWidth=1.5;
    for(const o of aaTargets(player.team)){ const d=o.pos.distanceTo(player.pos); if(d>1100) continue;
      const s=project(o.pos.clone().addScaledVector(o.vel,d/v)), s0=project(o.pos.clone()); if(!s) continue;
      oc.beginPath(); oc.arc(s.x,s.y,9,0,Math.PI*2); oc.stroke(); oc.beginPath(); oc.moveTo(s.x-4,s.y); oc.lineTo(s.x+4,s.y); oc.moveTo(s.x,s.y-4); oc.lineTo(s.x,s.y+4); oc.stroke();
      if(s0){ oc.setLineDash([3,4]); oc.beginPath(); oc.moveTo(s0.x,s0.y); oc.lineTo(s.x,s.y); oc.stroke(); oc.setLineDash([]); }
      oc.fillStyle='#ffd27a'; oc.fillText(`${Math.round(d)} m`,s.x,s.y-14); } }; }
