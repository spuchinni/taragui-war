/* ---------- Marcas para el equipo (tecla Q): enemigo, punto o atención ---------- */
const pings=[];
function doPing(){
  if(!lastAim||!player) return; const P=lastAim; let k='att', zid=null;
  const foe=tanks.find(o=>!o.dead&&o.team!==player.team&&(o.visP||o.spottedT>0)&&o.pos.distanceTo(P)<14);
  const Z=zones.find(Z=>Math.hypot(Z.x-P.x,Z.z-P.z)<Z.r+6);
  if(foe){ k='foe'; foe.spottedT=Math.max(foe.spottedT,10); } else if(Z){ k='zone'; zid=Z.id; }
  if(net.guest){ net.hostConn.send({t:'ping',k,zid,p:[P.x,P.y,P.z]}); }
  makePing(0,P.x,P.y,P.z,k,playerCrew?playerCrew.name:'Vos',zid,!net.guest);
}
function makePing(team,x,y,z,k,name,zid,relay){
  const txt=k==='foe'?'¡Enemigo acá!':k==='zone'?`¡Vamos al punto ${zid||''}!`:'¡Atención acá!';
  if(relay&&net.host){ for(const c of net.conns) if(c.ready&&c.open&&c.crew&&c.crew.team===team&&c.crew.name!==name) c.send({t:'ping',k,zid,p:[x,y,z],name}); }
  if(team!==0) return;
  pings.push({x,y,z,k,txt,name,until:now+8}); if(pings.length>6) pings.shift();
  const fd=document.createElement('div'); fd.textContent=`${name}: ${txt}`; fd.style.color='var(--amber)'; $('feed').prepend(fd); setTimeout(()=>fd.remove(),6000);
  sfx('metal',null,.3,{near:true,rate:2.2});
  // los bots aliados cercanos responden: al enemigo marcado o al punto pedido
  if(!net.guest&&k==='zone'){ const Zp=zones.find(Q=>Q.id===zid); if(Zp) tanks.filter(t=>!t.dead&&t.team===0&&!t.isPlayer&&!t.net&&!t.target&&t.pos.distanceTo(new THREE.Vector3(x,y,z))<260).slice(0,2).forEach(t=>{
    if(nodes){ const path=astar(nearestNode(t.pos.x,t.pos.z),nearestNode(Zp.x,Zp.z)); if(path&&path.length){ t.path=path.map(n=>n.p.clone()); t.goal=t.path[t.path.length-1]; } } else { t.path=null; t.goal=new THREE.Vector3(Zp.x,0,Zp.z); } }); }
}
function drawPings(){
  for(let i=pings.length-1;i>=0;i--){ const P=pings[i]; if(now>P.until){ pings.splice(i,1); continue; }
    const s=project(new THREE.Vector3(P.x,P.y+3,P.z)); if(!s) continue; const a=.6+.4*Math.sin(now*8);
    oc.strokeStyle=`rgba(255,198,92,${a})`; oc.lineWidth=2.5; oc.beginPath(); oc.moveTo(s.x,s.y-12); oc.lineTo(s.x+12,s.y); oc.lineTo(s.x,s.y+12); oc.lineTo(s.x-12,s.y); oc.closePath(); oc.stroke();
    oc.fillStyle='#ffc65c'; oc.font='700 15px "Saira Condensed",sans-serif'; oc.fillText(`${P.txt} ${player?Math.round(Math.hypot(P.x-player.pos.x,P.z-player.pos.z))+' m':''}`,s.x,s.y-18); }
}
/* ---------- Fuera del campo de batalla: aviso, cuenta regresiva y A-10 ---------- */
const OOB_T=10, a10s=[];
function oobCheck(t,dt){
  let el=$('oob'); if(!el){ el=document.createElement('div'); el.id='oob'; el.className='hud'; document.body.appendChild(el); }
  const out=!t.dead&&!tut&&state==='play'&&outOfBounds(t.pos);
  if(out&&!t.a10){ t.oobT=(t.oobT??OOB_T)-dt; if(bannerT>0){ bannerT=0; $('banner').style.opacity=0; }
    el.innerHTML=`¡FUERA DEL CAMPO DE BATALLA!<small>Volvé dentro de la línea roja en <b>${Math.max(0,Math.ceil(t.oobT))}</b> s o ${W.era===1?'te cae encima la artillería':'te ataca un A-10'}</small>`; el.style.opacity=1;
    if(t.oobT<=0){ t.a10=true; if(net.guest) net.hostConn.send({t:'oob'}); else a10Strike(t); } }
  else { if(!out) t.oobT=null; el.style.opacity=t.a10&&!t.dead&&state==='play'?1:0; if(t.a10&&!t.dead){ const A=a10s.find(a=>a.t===t); el.innerHTML=W.era===1?`¡ARTILLERÍA SOBRE TU POSICIÓN!<small>Te pasaste del límite</small>`:`¡A-10 EN CAMINO!<small>Te pasaste del límite${A?` · a ${Math.round(A.g.position.distanceTo(t.pos))} m`:''}</small>`; } }
}
function makeA10(){
  const g=new THREE.Group(), m=new THREE.MeshLambertMaterial({color:0x4d5459,fog:false}), d=new THREE.MeshLambertMaterial({color:0x33393d,fog:false});
  box(g,1.5,1.6,15,0,0,0,m); box(g,17.5,.3,2.6,0,-.2,.8,m); box(g,5.5,.2,1.6,0,.6,-6.2,m);
  box(g,.25,2.6,1.6,2.6,1.6,-6.2,d); box(g,.25,2.6,1.6,-2.6,1.6,-6.2,d);
  for(const sx of [-1.5,1.5]) cyl(g,.75,.75,3.2,sx,1.3,-3.2,10,d).rotation.x=Math.PI/2;
  box(g,.9,.6,1.5,0,.75,4.5,new THREE.MeshLambertMaterial({color:0x2a3036,fog:false})); cyl(g,.12,.12,1.2,0,-.5,7.8,6,d).rotation.x=Math.PI/2;
  return g;
}
// Cañón GAU-8: si no hay grabación real cargada, se sintetiza el "BRRRT" (30 mm a ~65 disparos por segundo)
function gau8Sound(pos,dur){
  if(!AC) return; if(SFX.gau8&&SFX.gau8.length){ const d=pos.distanceTo(camera.position), v=clamp(1.25-d/1800,.3,1.15); setTimeout(()=>sfx('gau8',null,v,{near:true}),d/343*1000); return; }
  const d=pos.distanceTo(camera.position), t0=AC.currentTime+d/343, v=clamp(1.15-d/1600,.12,1)*.55;
  const lfo=AC.createOscillator(); lfo.type='square'; lfo.frequency.value=65;
  const n=AC.createBufferSource(); n.buffer=noiseBuf; n.loop=true; const bp=AC.createBiquadFilter(); bp.type='lowpass'; bp.frequency.value=1300;
  const am=AC.createGain(); am.gain.value=.5; const lg=AC.createGain(); lg.gain.value=.5; lfo.connect(lg).connect(am.gain);
  const o=AC.createOscillator(); o.type='sawtooth'; o.frequency.value=65; const og=AC.createGain(); og.gain.value=.35;
  const out=AC.createGain(); out.gain.setValueAtTime(.0001,t0); out.gain.exponentialRampToValueAtTime(v,t0+.06); out.gain.setValueAtTime(v,t0+dur); out.gain.exponentialRampToValueAtTime(.0001,t0+dur+.5);
  n.connect(bp).connect(am).connect(out); o.connect(og).connect(out); out.connect(master);
  [lfo,n,o].forEach(x=>{ x.start(t0); x.stop(t0+dur+.6); });
}
// Impactos de 30 mm: chasquidos secos (granadas explosivas) que llegan con la demora del sonido
function a10Crack(p){
  if(!AC) return; const d=p.distanceTo(camera.position), v=clamp(1-d/700,0,1)*.5; if(v<.01) return;
  const t0=AC.currentTime+d/343, n=AC.createBufferSource(); n.buffer=noiseBuf; n.playbackRate.value=rand(.7,1.3);
  const f=AC.createBiquadFilter(); f.type='bandpass'; f.frequency.value=rand(700,1900); f.Q.value=.8;
  const g=AC.createGain(); g.gain.setValueAtTime(v,t0); g.gain.exponentialRampToValueAtTime(.0005,t0+rand(.07,.14));
  n.connect(f).connect(g).connect(master); n.start(t0,rand(0,.5)); n.stop(t0+.2);
  if(Math.random()<.3) sfx('sboom',p,.45,{rate:rand(1.5,2.1)});
}
// Primera Guerra: en vez del A-10, una andanada de artillería sobre el tanque que se fue del campo
function oobArty(t){ const by={team:1-t.team,name:'Artillería',T:{label:'fuego de barrera'},inf:false};
  for(let i=0;i<9;i++) arty.push({t:now+3+i*.35,p:t.pos.clone().add(new THREE.Vector3(rand(-6,6),0,rand(-6,6))),by});
  markZone(t.pos.clone(),9,0xff4a32,now+6.5); feed(`${t.name} quedó bajo fuego de barrera (fuera del campo de batalla)`,'var(--enemy)'); }
function a10Strike(t){
  if(W.era===1){ oobArty(t); return; }
  if(!t||t.dead) return;
  if(net.host) netAll({t:'a10',id:t.id});
  // viene de frente a donde mira el jugador (así lo ve venir); los demás, desde el centro del mapa
  const dir=t===player?new THREE.Vector3(-Math.sin(camYaw),0,-Math.cos(camYaw)):t.pos.clone().setY(0); if(dir.lengthSq()<1) dir.set(1,0,0); dir.normalize();
  const g=makeA10(); g.scale.setScalar(1.5); const alt=heightAt(t.pos.x,t.pos.z), start=t.pos.clone().addScaledVector(dir,-1300); start.y=alt+110;
  g.position.copy(start); scene.add(g);
  a10s.push({g,t,dir,v:120,alt,phase:0,fired:0,snd:movingLoop('flyover',3.6,{rate:1.35,start:2,ref:160,lp:5000}),life:22});
  if(t.isPlayer) radio('¡Avión enemigo!',2);
  if(!net.guest) feed(`Un A-10 va por ${t.name} (fuera del campo de batalla)`,'var(--enemy)');
}
function updateA10(dt){
  for(let i=a10s.length-1;i>=0;i--){ const A=a10s[i], P=A.g.position, T=A.t, tp=T.pos;
    const to=tp.clone().sub(P), dh=Math.hypot(to.x,to.z);
    if(A.phase<2){ const aim=tp.clone().add(new THREE.Vector3(0,1.5,0)).sub(P).normalize(); const vdir=A.phase===0?new THREE.Vector3(aim.x,Math.max(aim.y,-.32),aim.z).normalize():aim;
      A.vel=(A.vel||vdir.clone()).lerp(vdir,Math.min(1,dt*1.5)).normalize(); }
    else A.vel.y=Math.min(.45,A.vel.y+dt*.5);
    P.addScaledVector(A.vel,A.v*dt); A.g.lookAt(P.clone().add(A.vel)); if(A.snd) A.snd.set(P); A.life-=dt;
    // pasada de tiro: entre 1000 y 280 m dispara y los impactos "caminan" hasta el tanque
    if(A.phase===0&&dh<750){ A.phase=1; A.fireT=0; gau8Sound(P.clone(),2.2); }
    if(A.phase===1){ A.fireT+=dt; const k=Math.min(1,A.fireT/2.1), hit=tp.clone().addScaledVector(A.vel.clone().setY(0).normalize(),-55*(1-k)+rand(-2,2)); hit.x+=rand(-2,2); hit.y=heightAt(hit.x,hit.z);
      A.tr=(A.tr||0)-dt; if(A.tr<=0){ A.tr=.035; tracer(P.clone().addScaledVector(A.vel,8),hit,0xffd080); a10Crack(hit); puff(hit,W.dust||0xb6a27f,rand(1.5,2.6),rand(.6,1),1.2,.6); if(Math.random()<.35) debris(hit,2,dirtMat,4,.5); }
      if(k>.82&&!A.hitDone&&!T.dead){ A.hitDone=true; explode(tp.clone().setY(tp.y+1),'metal'); blast(tp.clone(),.9); sfx('expl',tp,1.4,{rate:rand(.75,.9)}); sfx('sboom',tp,1.2,{rate:.8}); for(let j=0;j<6;j++) setTimeout(()=>a10Crack(tp.clone().add(new THREE.Vector3(rand(-3,3),0,rand(-3,3)))),j*40); for(let j=0;j<4;j++) puff(tp.clone().add(new THREE.Vector3(rand(-2,2),rand(.5,2),rand(-2,2))),0xffa040,rand(2,3.5),.4,1,1,true);
        if(!net.guest&&!T.dead){ T.a10K=true; T.immuneT=0; T.crewM.forEach(m=>{m.alive=false;m.hp=0;}); destroy(T,null,Math.random()<.5); } }
      if(A.fireT>2.3||dh<200){ A.phase=2; } }
    if(A.life<=0){ if(A.snd) A.snd.stop(); scene.remove(A.g); a10s.splice(i,1); } }
}
/* ---------- Dificultad de los bots según la habilidad del jugador ---------- */
const skillName=k=>k<.45?'Recluta':k<.65?'Regular':k<.82?'Veterano':'Élite';
function enemySkill(){ return clamp(PROG&&PROG.skill!=null?PROG.skill:.35,.25,1); }
function updateSkill(me,win){ if(!PROG||!me) return; const perf=clamp(.25+.12*me.kills-.08*me.deaths+.05*me.caps+(win?.15:0),0,1);
  PROG.skill=clamp(enemySkill()*.75+perf*.25,.25,1); saveProg(); }
// Cupo por bando: los bots de cada bando comparten una espera de 45 s para artillería y 90 s para ataque aéreo.
// Lo que pide el jugador también cuenta para su bando, así los dos bandos tienen el mismo ritmo.
const TEAM_ARTY_CD=45, TEAM_AIR_CD=90, teamSup={0:{arty:20,air:40},1:{arty:20,air:40}};
function botSupport(dt){
  for(const tm of [0,1]){ teamSup[tm].arty=Math.max(0,teamSup[tm].arty-dt); teamSup[tm].air=Math.max(0,teamSup[tm].air-dt); }
  for(const t of tanks){ if(t.dead||t.isPlayer||t.dummy) continue; const c=t.crew;
    if(c.supT>0){c.supT-=dt;continue;} c.supT=rand(3,6);
    // objetivo: el suyo, o el enemigo visto más cercano a un compañero (prioriza el que pelea el jugador)
    let tg=t.target&&!t.target.dead?t.target:null;
    if(!tg){ let bd=1e9; for(const o of tanks){ if(o.dead||o.team===t.team||o.spottedT<=0) continue; for(const a of tanks){ if(a.dead||a.team!==t.team) continue; const d=a.pos.distanceTo(o.pos)*(a.isPlayer?.6:1); if(d<bd&&d<250){bd=d;tg=o;} } } }
    if(!tg) continue;
    const p=tg.pos.clone().add(new THREE.Vector3(rand(-3,3),0,rand(-3,3))), S=teamSup[t.team];
    if(c.sp>=NUKE_COST&&callNuke(t)) continue;
    if(RULE().sup.air&&c.sp>=AIR_COST&&c.airCD<=0&&Math.random()<.55){ callAirstrike(t,p); }
    else if(c.sp>=ARTY_COST&&c.artyCD<=0&&Math.random()<.7){ callArtillery(t,p); }
  }
}

