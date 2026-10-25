/* ---------- IA ---------- */
function eyeOf(t){return new THREE.Vector3(t.pos.x,t.pos.y+t.topH-.2,t.pos.z);}
// Humo: nubes que cortan la línea de vista (la IA no ve a través)
const smokes=[];
function smokeBlocks(a,b){ for(const S of smokes){ if(now>S.until) continue; const ab=b.clone().sub(a), L=ab.length(); if(L<1) continue; ab.divideScalar(L);
  const c=new THREE.Vector3(S.x,S.y,S.z), k=clamp(c.clone().sub(a).dot(ab),0,L); if(c.distanceTo(a.clone().addScaledVector(ab,k))<S.r) return true; } return false; }
function addSmoke(x,y,z){ smokes.push({x,y:y+3,z,r:9,until:now+22,k:0}); if(smokes.length>12) smokes.shift();
  for(let i=0;i<16;i++) puff(new THREE.Vector3(x+rand(-7,7),y+rand(.5,4),z+rand(-7,7)),i%3?0xd8d6d0:0xbfbcb4,rand(6,9),rand(16,22),.08,.85); }
function updateSmoke(dt){ for(let i=smokes.length-1;i>=0;i--){ const S=smokes[i]; if(now>S.until){ smokes.splice(i,1); continue; }
  S.k-=dt; if(S.k<=0&&S.until-now>4){ S.k=1.2; puff(new THREE.Vector3(S.x+rand(-6,6),S.y-2+rand(0,3),S.z+rand(-6,6)),0xd2d0c9,rand(6,8),rand(8,11),.06,.75); } } }
function deploySmoke(t,force){
  if(!t||t.dead) return false;
  if(!force){ if(!t.lv||t.lv<2){ tell(t,'Este tanque todavía no tiene lanzahumos (se desbloquea en el nivel 2)','var(--paper)'); return false; }
    if(!(t.smoke>0)){ tell(t,'No quedan granadas de humo','var(--enemy)'); return false; } t.smoke--; }
  if(net.guest&&t===player){ hostSend({t:'smk'}); tell(t,'¡Humo!','var(--ally)'); if(t.isPlayer) radio('¡Humo!'); return true; }
  const f=t.turretYaw+t.heading, x=t.pos.x+Math.sin(f)*10, z=t.pos.z+Math.cos(f)*10, y=heightAt(x,z);
  if(tut&&t.isPlayer) tut.smoke=true; if(t.crew&&t.crew.st) t.crew.st.smoke++;
  addSmoke(x,y,z); sfx('metal',t.pos,.3,{rate:1.4}); if(t.isPlayer){ tell(t,'¡Humo!','var(--ally)'); radio('¡Humo!'); }
  if(net.host) netAll({t:'smk',x,y,z});
  return true;
}
// Follaje: las copas de los árboles tapan la vista. Grilla de copas (centro y radio) que se rearma si cambia el bosque.
let _crowns=null, _crownsFor=null, _crownsN=-1;
const CROWN_CELL=10, crownKey=(i,j)=>i*4096+j;
function crownOf(sp){ const S=SPECIES[sp]; if(!S._c){ const g=S.crown(); g.scale(...S.cs); g.computeBoundingSphere(); S._c={r:g.boundingSphere.radius,y:S.cy+g.boundingSphere.center.y}; g.dispose(); } return S._c; }
function crownGrid(){
  if(_crownsFor===trees&&_crownsN===trees.length) return _crowns;
  _crowns=new Map(); _crownsFor=trees; _crownsN=trees.length;
  for(const tr of trees){ const c=crownOf(tr.sp); tr.cy=tr.y+c.y*tr.s*tr.hs; tr.cr=c.r*tr.s*.8;
    const k=crownKey(Math.floor(tr.x/CROWN_CELL),Math.floor(tr.z/CROWN_CELL)); let L=_crowns.get(k); if(!L) _crowns.set(k,L=[]); L.push(tr); }
  return _crowns;
}
// ¿Cuántos metros de copas cruza la línea? Se ignoran los 4 m de cada punta (un tanque metido entre arbustos igual ve afuera)
function foliageBlocks(a,b){
  if(!trees.length) return false; const G=crownGrid(), d=a.distanceTo(b), n=Math.ceil(d/2); let inside=0;
  for(let i=1;i<n;i++){ const k=i/n; if(k*d<4||(1-k)*d<4) continue; const x=a.x+(b.x-a.x)*k, y=a.y+(b.y-a.y)*k, z=a.z+(b.z-a.z)*k;
    const L=G.get(crownKey(Math.floor(x/CROWN_CELL),Math.floor(z/CROWN_CELL))); if(!L) continue;
    // cada árbol tapa como un cilindro del suelo a la copa (troncos, ramas bajas y monte bajo), un poco más angosto que la copa
    for(const tr of L){ if(tr.fallen||tr.gone||y>tr.cy+tr.cr) continue; const dx=x-tr.x, dz=z-tr.z, r=tr.cr*.75; if(dx*dx+dz*dz<r*r){ if(++inside>=2) return true; break; } } }
  return false;
}
function los(a,b){
  if(smokes.length&&smokeBlocks(a,b)) return false;
  const d=a.distanceTo(b), n=Math.ceil(d/4);
  for(let i=1;i<n;i++){const k=i/n, x=a.x+(b.x-a.x)*k, y=a.y+(b.y-a.y)*k, z=a.z+(b.z-a.z)*k; if(y<hAtY(x,z,y)+.4) return false;}
  if(foliageBlocks(a,b)) return false;
  ray.set(a,b.clone().sub(a).normalize()); ray.far=d; const h=ray.intersectObjects(houseMeshes,false).length; ray.far=Infinity;
  return h===0;
}
function landPoint(){for(let k=0;k<30;k++){const x=rand(-W.bx*.8,W.bx*.8),z=rand(-W.bz*.8,W.bz*.8);
  if(W.boundary&&!inPoly(x,z,W.boundary))continue; if(W.water!=null&&heightAt(x,z)<W.water+1.5)continue; return new THREE.Vector3(x,0,z);} return new THREE.Vector3(0,0,0);}
// ---------- Ayudas de la IA: moverse a un punto, seguir un camino, buscar cobertura y flanquear ----------
function steerTo(t,p,dt){
  const dx=p.x-t.pos.x, dz=p.z-t.pos.z, dist=Math.hypot(dx,dz); if(dist<1.5) return {throttle:0,steer:0};
  const a=Math.atan2(dx,dz), diff=wrap(a-t.heading);
  if(Math.abs(diff)>1.9){ const back=wrap(a+Math.PI-t.heading); return {steer:clamp(-back*2.5,-1,1),throttle:-(Math.abs(back)<.6?1:.4)}; } // está atrás: va en reversa
  return {steer:clamp(diff*2.5,-1,1),throttle:(Math.abs(diff)<.6?1:Math.abs(diff)<1.2?.4:.15)*(dist<8?.5:1)};
}
function followPath(t,dt){
  let wp=t.goal; if(!wp) return null;
  if(t.path&&t.path.length){ wp=t.path[0]; if(Math.hypot(wp.x-t.pos.x,wp.z-t.pos.z)<5){ t.path.shift(); if(!t.path.length){ t.goal=null; return null; } wp=t.path[0]; } }
  else if(Math.hypot(wp.x-t.pos.x,wp.z-t.pos.z)<8){ t.goal=null; return null; }
  const m=steerTo(t,wp,dt); if(m.throttle<0) m.throttle=.3; return m;
}
const freeSpotAI=(x,z)=>Math.abs(x)<W.bx-8&&Math.abs(z)<W.bz-8&&(!W.boundary||inPoly(x,z,W.boundary))&&!(W.water!=null&&heightAt(x,z)<W.water+.8)&&!gridQuery(x,z,5).some(b=>obPush(x,z,3.6,b));
function findCover(t,tgt){
  const a=Math.atan2(tgt.pos.x-t.pos.x,tgt.pos.z-t.pos.z), fx=Math.sin(a), fz=Math.cos(a), rx=fz, rz=-fx, te=eyeOf(tgt), y0=heightAt(t.pos.x,t.pos.z);
  const C=[[9,0],[-9,0],[7,-6],[-7,-6],[0,-9],[13,-3],[-13,-3],[4,-12],[-4,-12]];
  for(const [l,f] of C){ const x=t.pos.x+rx*l+fx*f, z=t.pos.z+rz*l+fz*f; if(!freeSpotAI(x,z)) continue; const h=heightAt(x,z); if(Math.abs(h-y0)>3) continue;
    if(!los(new THREE.Vector3(x,h+t.topH-.3,z),te)) return new THREE.Vector3(x,h,z); }
  return null;
}
function planFlank(t,tgt){
  if(t.flankTried) return; t.flankTried=true; const sk=t.sk||.6; if(Math.random()>.15+.5*sk) return;
  const d=tgt.pos.distanceTo(t.pos); if(d<90) return;
  // uno fija y los otros rodean: flanquea solo si un compañero está más cerca del mismo enemigo
  const mates=tanks.filter(o=>o!==t&&!o.dead&&o.team===t.team&&o.target===tgt&&o.pos.distanceTo(tgt.pos)<d&&o.pos.distanceTo(t.pos)<140);
  if(!mates.length) return;
  const rel=t.pos.clone().sub(tgt.pos), base=Math.atan2(rel.x,rel.z), side=Math.random()<.5?-1:1;
  for(const sd of [side,-side]){ const ang=base+sd*rand(1.0,1.4), R=clamp(d*.6,70,130), x=tgt.pos.x+Math.sin(ang)*R, z=tgt.pos.z+Math.cos(ang)*R;
    if(!freeSpotAI(x,z)) continue;
    if(nodes){ const path=astar(nearestNode(t.pos.x,t.pos.z),nearestNode(x,z)); if(!path||path.length<2) continue; t.path=path.map(n=>n.p.clone()); t.goal=t.path[t.path.length-1]; }
    else { t.path=null; t.goal=new THREE.Vector3(x,0,z); }
    t.mode='flank'; t.modeT=now+28; return; }
}
function pickGoal(t){
  const mine=t.team===0?1:-1, open=zones.filter(Z=>Z.owner!==mine);
  let Z=null;
  if(open.length&&Math.random()<.8){ open.sort((a,b)=>Math.hypot(a.x-t.pos.x,a.z-t.pos.z)-Math.hypot(b.x-t.pos.x,b.z-t.pos.z)); Z=Math.random()<.65?open[0]:open[(Math.random()*open.length)|0]; }
  else if(Math.random()<.5) Z=zones[(Math.random()*zones.length)|0];
  if(nodes){
    const goal=Z?nearestNode(Z.x+rand(-6,6),Z.z+rand(-6,6)):nodes[(Math.random()*nodes.length)|0];
    t.path=astar(nearestNode(t.pos.x,t.pos.z),goal).map(n=>n.p.clone()); t.goal=t.path[t.path.length-1];
  } else { t.path=null; t.goal=Z?new THREE.Vector3(Z.x+rand(-Z.r*.5,Z.r*.5),0,Z.z+rand(-Z.r*.5,Z.r*.5)):landPoint(); }
}
function updateAI(t,dt){
  t.thinkT-=dt;
  const mine=t.team===0?1:-1, inZone=zones.some(Z=>Z.owner!==mine&&Math.hypot(t.pos.x-Z.x,t.pos.z-Z.z)<Z.r-3);
  if(t.thinkT<=0){
    // no ven más lejos de lo que ve el jugador: el tope es la mitad de la niebla del mapa (salvo con térmica)
    const sk=t.sk||.6, fg=WX.fog||W.fog||[150,460], fogV=(fg[0]+fg[1])/2, vr0=Math.min(260+120*sk,fogV*1.15), vr=t.T.thermal?vr0:Math.min(vr0*(WX.see||1),fogV); t.thinkT=rand(.4,.7)*(1.6-sk);
    const e=eyeOf(t); let best=null,bd=1e9;
    for(const o of tanks){ if(o.dead||o.team===t.team) continue; const d=o.pos.distanceTo(t.pos);
      if(d<((o.firedT||-9)>now-3?vr0:vr)&&d<bd&&los(e,eyeOf(o))){best=o;bd=d;} }
    // aliados: si el jugador está peleando con alguien que ven, se suman
    if(t.team===0&&playerFocus&&!playerFocus.dead&&now-playerFocusT<10){ const d=playerFocus.pos.distanceTo(t.pos); if(d<380&&los(e,eyeOf(playerFocus))) best=playerFocus; }
    // cualquier bando: enemigo marcado por un compañero, si lo ven
    if(!best){ let bd=1e9; for(const o of tanks){ if(o.dead||o.team===t.team||o.spottedT<=0) continue; const d=o.pos.distanceTo(t.pos); if(d<Math.min(380,vr0)&&d<bd&&los(e,eyeOf(o))){best=o;bd=d;} } }
    // blanco nuevo: tarda en reaccionar antes del primer disparo (menos cuanto más hábil)
    if(best!==t.target){ t.target=best; t.errScale=1; t.flankTried=false; t.reactT=now+rand(2,4)*(1.6-sk); if(t.mode==='cover'||t.mode==='peek'||t.mode==='flank') t.mode='adv'; }
    if(best&&t.mode==='adv') planFlank(t,best);
    if(t.target) t.target.spottedT=3;
    if(!best&&(!t.infT||t.infT.dead)){ t.infT=null; let bi=160; for(const P of infantry){ if(P.dead||isCiv(P)||P.team===t.team) continue; const d=P.pos.distanceTo(t.pos); if(d<bi&&los(e,infEye(P))){bi=d;t.infT=P;} } }
    if(!t.goal) pickGoal(t);
  }
  let throttle=0, steer=0, aimErr=1;
  const tgt=t.target&&!t.target.dead?t.target:null;
  if(tgt){
    const dx=tgt.pos.x-t.pos.x, dz=tgt.pos.z-t.pos.z, d=Math.hypot(dx,dz), want=Math.atan2(dx,dz), sk=t.sk||.6;
    // Retirada: dañado o con módulos rotos -> humo, retroceder mirando al enemigo y reparar
    if(t.mode!=='retreat'&&!(t.repairT>0)&&sk>.3&&now>(t.retryT||0)&&(needsRepair(t)||t.hp<t.T.hp*.45)){
      t.retryT=now+18; if(t.smokeN>0&&Math.random()<.4+sk*.5){ t.smokeN--; deploySmoke(t,true); }
      if(canMove(t)&&Math.random()<.35+sk*.6){ t.mode='retreat'; t.modeT=now+rand(3.5,6.5); } else if(needsRepair(t)) startRepair(t); }
    let mv=null;
    if(t.mode==='retreat'){
      if(now>t.modeT||!canMove(t)){ t.mode='adv'; if(needsRepair(t)) startRepair(t); }
      else { const diff=wrap(want-t.heading); mv={steer:clamp(diff*2,-1,1),throttle:-.9}; } }
    else if(t.mode==='flank'){
      if(now>t.modeT||!t.goal||d<70){ t.mode='adv'; t.goal=null; t.path=null; } else mv=followPath(t,dt); }
    else if(t.mode==='cover'){
      if(t.reloadT<.9||now>t.modeT){ t.mode='peek'; t.modeT=now+4; } else mv=steerTo(t,t.coverP,dt); }
    else if(t.mode==='peek'){
      if(Math.hypot(t.peekP.x-t.pos.x,t.peekP.z-t.pos.z)<2.5||now>t.modeT){ t.mode='adv'; } else mv=steerTo(t,t.peekP,dt); }
    if(mv){ throttle=mv.throttle; steer=mv.steer; }
    else if(!nodes&&d>t.prefRange){ const diff=wrap(want-t.heading); steer=clamp(diff*2,-1,1); throttle=Math.abs(diff)<.8?1:.3; }
    else if(sk>.4&&!(t.repairT>0)){ // quieto: mostrar el frente un poco girado (ángulo) para que reboten los impactos
      const diff=wrap(want+t.angleOff*(.6+sk*.4)-t.heading); steer=Math.abs(diff)>.06?clamp(diff*2,-1,1):0; }
    // el error baja mientras apunta, pero nunca a cero: los menos hábiles siguen errando bastante
    t.errScale=Math.max(.2+(1-sk)*.5,t.errScale-dt*.12*(.5+sk));
    { const arm=Math.max(tgt.T.armor.hull.front,tgt.T.armor.turret.front); let bi=0,bv=-1;
      t.T.ammo.forEach((A,i)=>{ const p=A.kind==='ke'?A.pen*(1-d/3000):A.pen; const v=p>arm*1.2?1000+(A.kind==='he'?50:0):p; if(v>bv){bv=v;bi=i;} }); t.ammoIdx=bi; }
    aimErr=aimAt(t,tgt.pos.clone().setY(tgt.pos.y+tgt.aimH),dt,t.eY*t.errScale,t.eP*t.errScale);
    // sin torre (barbetas, casamatas, cañones de campaña): gira el casco para que el blanco entre en el arco del cañón
    if(t.T.arc!=null){ const off=wrap(want-t.heading-(t.T.arcC||0)); if(Math.abs(off)>t.T.arc*.85){ steer=clamp(off*2.5,-1,1); if(!mv) throttle=Math.min(throttle,.15); } }
    if(t.reloadT<=0&&now>(t.reactT||0)&&aimErr<.02&&Math.abs(t.speed)<(t.T.stab?9:4)&&t.mode!=='cover'&&t.mode!=='retreat'){ botFire(t,tgt,d,sk); if(tgt.isPlayer) t.spottedT=Math.max(t.spottedT||0,6); /* el fogonazo lo delata: queda marcado */ t.eY=rand(-1,1)*.035*(1.6-sk); t.eP=rand(-1,1)*.01*(1.6-sk); t.errScale*=.7;
      // dispara y se cubre mientras recarga (tirar y esconderse)
      if(t.mode==='adv'&&sk>.35&&t.reloadMax>2.5&&Math.random()<sk*.9){ const cp=findCover(t,tgt); if(cp){ t.coverP=cp; t.peekP=t.pos.clone(); t.mode='cover'; t.modeT=now+t.reloadMax+2; } } }
    if(d<220&&aimErr<.06&&!t.mgLock&&now>t.mgNext){
      fireMG(t); t.mgBurst++; t.mgNext=now+.1; if(t.mgBurst>14){t.mgBurst=0;t.mgNext=now+rand(1.2,2.2);}
    }
  } else if(t.infT&&!t.infT.dead&&t.infT.pos.distanceTo(t.pos)<180){
    const P=t.infT, d=P.pos.distanceTo(t.pos), he=t.T.ammo.findIndex(A=>A.kind==='he'||A.kind==='hesh');
    const err=aimAt(t,P.pos.clone().setY(P.pos.y+.6),dt,t.eY*.5,t.eP*.5);
    if(err<.05&&!t.mgLock&&now>t.mgNext&&d<200){ fireMG(t); t.mgBurst++; t.mgNext=now+.1; if(t.mgBurst>16){t.mgBurst=0;t.mgNext=now+rand(1,2);} }
    if(he>=0&&d>60&&err<.02&&t.reloadT<=0&&Math.random()<.02){ t.ammoIdx=he; fireGun(t); }
  } else {
    if(t.goal){
      let wp=t.goal;
      if(t.path&&t.path.length){ wp=t.path[0]; t.wpT=(t.wpT||0)+dt;
        if(Math.hypot(wp.x-t.pos.x,wp.z-t.pos.z)<5){t.path.shift();t.wpT=0; if(!t.path.length) t.goal=null;}
        else if(t.wpT>5){t.wpT=0;t.revT=1.2;t.revSteer=Math.random()<.5?-1:1;t.goal=null;t.path=null;} }
      else if(Math.hypot(t.goal.x-t.pos.x,t.goal.z-t.pos.z)<10) t.goal=null;
      const dx=wp.x-t.pos.x, dz=wp.z-t.pos.z, diff=wrap(Math.atan2(dx,dz)-t.heading);
      steer=clamp(diff*2.5,-1,1); throttle=Math.abs(diff)<.6?1:Math.abs(diff)<1.2?.4:.15;
      if(inZone){throttle=0; t.goal=t.goal||t.pos.clone();}
    }
    aimAt(t,new THREE.Vector3(t.pos.x+Math.sin(t.heading)*100,t.pos.y+2,t.pos.z+Math.cos(t.heading)*100),dt);
  }
  if(t.revT>0){t.revT-=dt;throttle=-1;steer=t.revSteer||1;}
  else if(throttle>.5&&t.moved<1.2){t.stuckT+=dt;if(t.stuckT>1.2){t.revT=1.4;t.revSteer=Math.random()<.5?-1:1;t.stuckT=0;t.goal=null;t.path=null;}}
  else t.stuckT=0;
  drive(t,throttle,steer,dt);
}
function updateBotCrews(dt){
  for(const c of crews){
    if(c.isPlayer||c.peer||c.out||(c.tank&&!c.tank.dead)) continue;
    c.respawnT-=dt; if(c.respawnT>0) continue;
    const key=c.lineup.filter(k=>available(c,k)).sort((x,y)=>usesOf(c,x)-usesOf(c,y))[0];
    if(!key){c.respawnT=3;continue;}
    const pts=spawnPoints(c.team); spawnCrew(c,key,pts[(Math.random()*pts.length)|0]);
  }
}

/* ---------- Zona y tickets ---------- */
let zones=[], tickets=[400,400], tickT=0;
function resetZones(){
  zones=W.zones.map(Z=>({...Z,cap:0,owner:0})); zones.forEach(Z=>Z.mat.color.set(0xefe7d2));
  $('zones').innerHTML=zones.map(Z=>`<div class="zb" id="zb${Z.id}"><i></i><span>${Z.id}</span></div>`).join('');
}
const TICKET_KILL=6; let bleed=0;
function updateZones(dt){
  for(const Z of zones){
    let a=0,e=0; const inside=[];
    for(const t of tanks){ if(t.dead) continue; if(Math.hypot(t.pos.x-Z.x,t.pos.z-Z.z)<Z.r){ inside.push(t); if(t.team===0)a++; else e++; } }
    // la infantería también captura: cada soldado cuenta medio tanque
    for(const P of infantry){ if(P.dead||isCiv(P)) continue; if(Math.hypot(P.pos.x-Z.x,P.pos.z-Z.z)<Z.r){ if(P.team===0)a+=.5; else e+=.5; } }
    if(a&&!e) Z.cap=Math.min(100,Z.cap+dt*9*Math.min(a,3));
    if(e&&!a) Z.cap=Math.max(-100,Z.cap-dt*9*Math.min(e,3));
    const award=team=>inside.forEach(t=>{if(t.team===team){addSP(t,60,60);t.crew.caps++;}});
    const mine=playerCrew?0:0;
    if(Z.cap>=100&&Z.owner!==1){Z.owner=1;feed(`Punto ${Z.id} (${Z.label}) capturado por ${NATIONS[teamNation(0)].label}`,'var(--ally)');Z.mat.color.set(0x8fd16a);award(0);}
    if(Z.cap<=-100&&Z.owner!==-1){Z.owner=-1;feed(`Punto ${Z.id} (${Z.label}) capturado por ${NATIONS[teamNation(1)].label}`,'var(--enemy)');Z.mat.color.set(0xff5a3c);award(1);}
    if((Z.owner===1&&Z.cap<=0)||(Z.owner===-1&&Z.cap>=0)){Z.owner=0;Z.mat.color.set(0xefe7d2);feed(`El punto ${Z.id} quedó neutral`,'var(--paper)');}
    const el=$('zb'+Z.id); if(el){const f=el.firstChild; f.style.height=Math.abs(Z.cap)+'%'; f.style.background=Z.cap>=0?'var(--ally)':'var(--enemy)';
      el.style.outlineColor=Z.owner===1?'var(--ally)':Z.owner===-1?'var(--enemy)':'var(--paper)';}
  }
  tickT+=dt; if(tickT>=1){tickT=0; spIncome(); const o0=zones.filter(Z=>Z.owner===1).length, o1=zones.filter(Z=>Z.owner===-1).length;
    // Sangrado de tickets estilo War Thunder: pierde el equipo con menos zonas; cuanto mayor la diferencia, más rápido.
    const dif=Math.abs(o0-o1), big=W.bx>400, rate=(dif===0||(big&&now<150)?0:dif===1?1.2:dif===2?2.6:4.5)*(big?.3:1); // mapas grandes: más lento y nada los primeros 2,5 min (todavía se están acercando) bleed=o0>o1?-1:o1>o0?1:0;
    if(o0>o1) tickets[1]-=rate; else if(o1>o0) tickets[0]-=rate; checkEnd();}
  { const a=$('tkA'),e=$('tkE'); if(a&&e){ a.classList.toggle('bleed',bleed===1); e.classList.toggle('bleed',bleed===-1); } }
  $('tkA').textContent=Math.max(0,Math.ceil(tickets[0])); $('tkE').textContent=Math.max(0,Math.ceil(tickets[1]));
}
const teamNation=team=>team===0?allyNation:foeNation;


// Disparo de un bot: no todos sus tiros pegan. La chance de acertar depende de la habilidad, la distancia y si el blanco se mueve;
// contra un jugador humano, el primer tiro de cada bot siempre pasa cerca (aviso). El que falla, falla de verdad: corto, largo o al costado.
function botHitChance(t,tgt,d,sk){
  const human=tgt.isPlayer||(tgt.crew&&tgt.crew.peer)||tgt.net;
  let p=(.08+.55*sk*sk)*clamp(1.2-d/350,.3,1)*(Math.abs(tgt.speed||0)>2?.6:1);
  if(human&&t.warnTgt!==tgt){ t.warnTgt=tgt; return 0; }
  return human?p:p*1.6; // entre bots se pegan más, así la batalla avanza
}
function botFire(t,tgt,d,sk){
  if(Math.random()<botHitChance(t,tgt,d,sk)){ fireGun(t); return; }
  const yaw=t.turretYaw, pitch=t.gunPitch, m=rand(3,7)/Math.max(d,20)*(Math.random()<.5?-1:1);
  if(Math.random()<.5){ t.turretYaw+=m; } else t.gunPitch+=rand(.6,1.4)*(Math.random()<.6?-1:1)*2.5/Math.max(d,20);
  t.turret.rotation.y=t.turretYaw; t.gunPivot.rotation.x=-t.gunPitch;
  fireGun(t);
  t.turretYaw=yaw; t.gunPitch=pitch; t.turret.rotation.y=yaw; t.gunPivot.rotation.x=-pitch;
}
