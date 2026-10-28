/* ---------- Partida ---------- */
let state='menu', visT=0, now=0, builtKey=null, menuA=0, selKey=null, selSp=0, allyNation='ar', foeNation='uk', spectating=false;
let rainMesh=null, rainSnd=null, boltT=0;
function applyWeather(k){ wxKey=WXS[k]?k:'dia'; WX=WXS[wxKey]; sun.color.set(WX.sunCol||0xfff0d6); lastTh=null; setRain(WX.rain||0); boltT=now+rand(5,10); }
function setRain(r){
  if(rainMesh){ scene.remove(rainMesh); rainMesh.geometry.dispose(); rainMesh=null; }
  if(rainSnd){ try{ rainSnd.g.gain.setTargetAtTime(0,AC.currentTime,.4); rainSnd.s.stop(AC.currentTime+1.5); }catch(e){} rainSnd=null; }
  if(!r) return; const sn=!!WX.snow, N=Math.round(1400*r*(Q().grass?1:.5)), pos=new Float32Array(N*6);
  for(let i=0;i<N;i++){ const x=rand(-40,40), y=rand(0,30), z=rand(-40,40); pos.set(sn?[x,y,z,x+.07,y-.09,z+.05]:[x,y,z,x+.05,y-.7,z],i*6); } // nieve: copos cortos que bajan despacio
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  rainMesh=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:sn?0xffffff:0xa8b8c8,transparent:true,opacity:sn?.85:.45})); rainMesh.frustumCulled=false; scene.add(rainMesh);
  if(AC&&noiseBuf&&!sn){ const s=AC.createBufferSource(); s.buffer=noiseBuf; s.loop=true; const f=AC.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1800; f.Q.value=.4; const g2=AC.createGain(); g2.gain.value=0; g2.gain.setTargetAtTime(.09*r,AC.currentTime,1); s.connect(f).connect(g2).connect(master); s.start(); rainSnd={s,g:g2}; }
}
function updateWeather(dt){
  if(rainMesh){ const a=rainMesh.geometry.attributes.position.array; const v=WX.snow?2.4:26, dr=WX.snow?Math.sin(now*.7)*.8*dt:0; for(let i=0;i<a.length;i+=6){ a[i+1]-=v*dt; a[i+4]-=v*dt; a[i]+=dr; a[i+3]+=dr; if(a[i+4]<0){ a[i+1]+=30; a[i+4]+=30; } } rainMesh.geometry.attributes.position.needsUpdate=true;
    rainMesh.position.set(camera.position.x,camera.position.y-14,camera.position.z); }
  if(WX.storm&&now>boltT){ boltT=now+rand(7,16); hemi.intensity=1.6; scene.background.set(0x8a96a8); setTimeout(()=>{ lastTh=null; },110); setTimeout(()=>boom(.7,3.5,110),rand(600,2600)); }
}
function clearBattle(){
  tanks.slice().forEach(removeTank); colliders=[];
  shells.forEach(s=>scene.remove(s.m)); shells.length=0; arty.length=0; scorches.forEach(S=>{scene.remove(S.m);S.m.material.dispose();}); scorches.length=0;
  marks.forEach(M=>scene.remove(M.g)); marks.length=0; planes.forEach(P=>{scene.remove(P.g); if(P.snd) P.snd.stop();}); planes.length=0; stopAllLoops(); bombs.forEach(B=>scene.remove(B.m)); bombs.length=0;
  if(builtKey){buildWorld(builtKey);}
  tickets=[400,400]; tickT=0; resetZones(); player=null; hitDirs.length=0; smolder.length=0; smokes.length=0; pings.length=0; a10s.forEach(A=>{scene.remove(A.g); if(A.snd) A.snd.stop();}); a10s.length=0; { const o=document.getElementById('oob'); if(o) o.style.opacity=0; }
  infantry.slice().forEach(removeInf); infantry.length=0; clearCivLife();
  if(nuke){ if(nuke.plane){ scene.remove(nuke.plane.g); if(nuke.plane.snd) nuke.plane.snd.stop(); } if(nuke.bomb) scene.remove(nuke.bomb.m); if(nuke.cloud&&!nuke.cloud.done){ scene.remove(nuke.cloud.g); nuke.cloud.parts.forEach(P=>P.m.material.dispose()); } } nuke=null;
  if(camera.far!==1000){ camera.far=1000; camera.updateProjectionMatrix(); }
  nukeView=null; { const b=document.getElementById('nukeSum'); if(b) b.style.display='none'; }
}
function newCrew(name,team,nation,isPlayer){
  const S=curSpecial, lu=(S&&S.lu)?(isPlayer&&S.plu?S.plu:S.lu[team]).slice():(!S&&!tut&&battleBR&&!NATIONS[nation].special)?(isPlayer?garageOf(nation):mmLineup(nation,battleBR)):NATIONS[nation].lineup.slice();
  return {st:{side:0,inf:0,smoke:0},tk:{},name,team,nation,isPlayer,lineup:isPlayer?lu:[...shuffle(lu.filter(k=>!VEH[k].uses)),...lu.filter(k=>VEH[k].uses)],uses:{},sp:SP_START,artyCD:0,airCD:0,supT:rand(10,25),spawns:0,kills:0,deaths:0,caps:0,score:0,tank:null,respawnT:0,out:false};
}
let mapBag=[];
// Mapas de la época elegida (los de Corrientes y alrededores son de la Guerra Fría en adelante)
const eraMaps=e=>Object.keys(WORLDS).filter(k=>(WORLDS[k].era||5)===e&&!WORLDS[k].noRandom);
function nextRandomMap(e=curEra){
  mapBag=mapBag.filter(k=>(WORLDS[k].era||5)===e);
  if(!mapBag.length){ mapBag=shuffle(eraMaps(e)); if(mapBag.length>1&&mapBag[mapBag.length-1]===builtKey) mapBag.unshift(mapBag.pop()); }
  return mapBag.pop();
}
let curSpecial=null;
// Cañones de campaña de la IA: defienden posiciones cerca de su base (Primera Guerra Mundial)
const GUN_OF={uk:'qf18',fr:'c75',us:'c75',de:'fk96'};
function placeGuns(team,nat,n){
  const key=(typeof GUN_ERA!=='undefined'&&GUN_ERA[W.era]&&GUN_ERA[W.era][nat])||GUN_OF[nat]; if(!key||!VEH[key]||!n) return;
  const spots=(W.gunSpots&&W.gunSpots[team===0?(W.flipGuns?1:0):(W.flipGuns?0:1)])||[];
  for(let i=0;i<n;i++){ const c=newCrew(`Batería ${i+1} (${VEH[key].label})`,team,nat,false); c.lineup=[key]; c.gun=true;
    let p=spots[i]; if(!p){ const b=W.sp[team][0], Z=zones[(Math.random()*zones.length)|0]; const k=rand(.35,.55); p={x:b.x+(Z.x-b.x)*k+rand(-25,25),z:b.z+(Z.z-b.z)*k+rand(-25,25)}; }
    const pos=findSpawnPos(p), foeB=W.sp[1-team][0], h=Math.atan2(foeB.x-pos.x,foeB.z-pos.z)+rand(-.3,.3);
    c.uses[key]=1; c.spawns=1; const t=makeTank(c,key,pos.x,pos.z,h); t.immuneT=0; c.tank=t; c.respawnT=1e9; crews.push(c); }
}
function startBattle(spectator=false,forceMap=null,special=null,noBrief=false){ tut=null; summary._done=false; curSpecial=special; menuScreen='home';
  spectating=spectator; const pick=a=>a[(Math.random()*a.length)|0];
  // la época: la de la misión, la del mapa forzado o la elegida en el menú
  const era=special&&special.era?special.era:forceMap&&WORLDS[forceMap]?(WORLDS[forceMap].era||5):curEra;
  if(!special||special.mission) curEra=era; applyEraNations(era);
  const NK=special&&special.mission?[special.ally,special.foe]:eraNations(era).length?eraNations(era):Object.keys(normalNations());
  allyNation=special?special.ally:spectator?pick(NK):chosenNation;
  // con bandos históricos (Entente contra Imperios Centrales) el enemigo sale del bando contrario
  const side=eraSide(era,allyNation), foes=side<0?NK.filter(k=>k!==allyNation):NK.filter(k=>eraSide(era,k)===1-side), friends=side<0?NK.filter(k=>k!==foeNation):NK.filter(k=>eraSide(era,k)===side);
  battleBR=special?null:spectator?pick([...new Set(NK.flatMap(n=>vehTreeE(n,era)).map(k=>VEH[k].br))]):garageBR(chosenNation); foeNation=special?special.foe:pick(foes.length?foes:NK.filter(k=>k!==allyNation));
  builtKey=forceMap||(chosenMap==='rand'||(WORLDS[chosenMap]&&(WORLDS[chosenMap].era||5)!==era)?nextRandomMap(era):chosenMap);
  net.seed=(Math.random()*1e9)|0; withSeed(net.on?net.seed:0,()=>{clearBattle(); assignSpawns(allyNation);}); applyWeather(noBrief||special&&!special.mission?'dia':special&&special.wx?special.wx:pickWeather()); $('feed').innerHTML='';
  const guests=net.host?net.conns.filter(c=>c.ready):[], gA=guests.filter(c=>sideOf(c)===0), gB=guests.filter(c=>sideOf(c)===1);
  // Aliados: cada tripulación de la IA sale de una nación al azar de tu bando (puede no ser la tuya). En el modo especial y en las misiones, todos de la misma.
  const used=new Set(), allyCrews=[], nA=special&&special.nAlly!=null?special.nAlly:4, nE=special&&special.nFoe!=null?special.nFoe:5;
  const vsN=net.host&&net.mode==='vs'?Math.max(5,1+gA.length,gB.length):0; // Versus: los dos bandos con la misma cantidad de tanques
  const allyPool=friends.filter(k=>k!==foeNation).concat(side>=0?[allyNation]:[]);
  for(let i=0;i<(spectator?5:vsN?vsN-1-gA.length:Math.max(special&&special.mission?0:1,nA-gA.length));i++){ const nat=special?allyNation:pick(allyPool.length?allyPool:[allyNation]);
    const nm=NATIONS[nat].names.find(n=>!used.has(n))||NATIONS[nat].names[i%NATIONS[nat].names.length]; used.add(nm); allyCrews.push(newCrew(nm,0,nat,false)); }
  allyMixed=allyCrews.some(c=>c.nation!==allyNation);
  playerCrew=spectator?null:newCrew(net.on?net.name:'Vos',0,allyNation,true);
  crews=[...(playerCrew?[playerCrew]:[]),...guests.map(remoteCrew),...allyCrews,...Array.from({length:vsN?vsN-gB.length:Math.max(special&&special.mission?0:1,nE-gB.length)},(_,i)=>NATIONS[foeNation].names[i%NATIONS[foeNation].names.length]).map(n=>newCrew(n,1,foeNation,false))];
  if(net.host){ net.startMsg={t:'start',seed:net.seed,map:builtKey,ally:allyNation,foe:foeNation,br:battleBR,wx:wxKey}; net.inBattle=true; net.o=0; guests.forEach(c=>c.send({...net.startMsg,side:sideOf(c)})); }
  for(const c of crews){ if(c.isPlayer||c.peer) continue; const pts=W.sp[c.team]; spawnCrew(c,c.lineup[0],pts[(Math.random()*pts.length)|0]); }
  if(special&&special.tickets) tickets=special.tickets.slice();
  if(RULE().guns&&!net.guest){ const g=special&&special.guns||[1,2]; placeGuns(0,allyNation,g[0]); placeGuns(1,foeNation,g[1]); }
  now=0; noises.length=0; battleKills=0; lastKillCrew=null; teamSup[0]={...SUP_START}; teamSup[1]={...SUP_START}; if(!tut) for(const c of crews){ c.artyCD=ARTY_CD; c.airCD=AIR_CD; } updateInfantry.t=40;
  if(!net.guest){ const sq=special&&special.squads||[2,2]; for(const tm of [0,1]) for(let i=0;i<sq[tm];i++) spawnSquad(tm); if(RULE().civ){ spawnCivilians(streetSegs.length?20:12); spawnTraffic(W.city?16:streetSegs.length>20?8:0); } if(W.setup) W.setup(); }
  updateHud();
  if(typeof objStart==='function'){ curObj=null; objUI(''); if(special&&special.obj&&!spectator) objStart(special.obj); } // objetivo de la misión (objetivos.js)
  if(noBrief) openDeploy(); else openBriefing(spectator);
}
let allyMixed=false;
const allyLabel=()=>allyMixed?'Aliados':NATIONS[allyNation].label;
// Intro de cada escenario: mapa, descripción, zonas y bandos. La batalla no arranca hasta salir.
function openBriefing(spectator){
  state='brief'; syncIntro(); if(document.pointerLockElement) document.exitPointerLock();
  document.body.classList.remove('menu','spec'); document.body.classList.add('deploy','brief'); $('overlay').style.display='flex';
  const natList=[...new Set(crews.filter(c=>c.team===0&&!c.isPlayer).map(c=>NATIONS[c.nation].label))];
  const ally=spectator?(allyMixed?natList.join(', '):NATIONS[allyNation].label):(allyMixed?`Vos (${NATIONS[allyNation].label}) con aliados de ${natList.join(', ')}`:allyLabel());
  if(curSpecial&&curSpecial.mission){ $('panel').innerHTML=missionBriefHTML(missionById(curSpecial.mission)); }
  else $('panel').innerHTML=`<div class="brief"><div class="kick">${curSpecial?'Corrientes vs. Resistencia':spectator?'Ver una partida':W.era&&W.era<5?'Batalla · '+ERAS[W.era].n:'Batalla'}</div>
    <h1>${W.label}</h1><p>${W.desc||''}</p>
    <h2>Objetivo</h2><p>Capturá y mantené las zonas ${W.zones.map(z=>`<b>${z.id}</b> (${z.label})`).join(', ')}. Cada zona en manos enemigas descuenta tickets a tu equipo.</p>
    <h2>Condiciones</h2><p>${WX.n}${WX.night?' · la térmica ayuda mucho':WX.mud?' · barro: los tanques andan más lento':WX.see<1?' · se ve poco: los enemigos aparecen cerca':''}</p>
    <h2>Bandos</h2><p><span style="color:var(--ally)">Tu equipo:</span> ${ally}<br><span style="color:var(--enemy)">Enemigo:</span> ${NATIONS[foeNation].label}</p>
    <button class="go" id="briefGo">${spectator?'Mirar la partida':'Salir a la partida'}</button><button class="go alt" id="briefBack">Volver al menú</button></div>`;
  $('briefGo').onclick=()=>{ if(fsAuto) enterFS(); document.body.classList.remove('brief'); if(spectator){ state='spectate'; syncIntro(); aerial=true; aer.init=false; aer.zoom=1; specIdx=0; $('overlay').style.display='none'; document.body.classList.remove('menu','deploy'); document.body.classList.add('spec');
      banner('Modo espectador',`${allyLabel()} contra ${NATIONS[foeNation].label}`,3); } else openDeploy(); };
  $('briefBack').onclick=()=>{document.body.classList.remove('brief'); const ms=curSpecial&&curSpecial.mission; clearBattle(); if(ms){ menuScreen='hangar'; playMode='camp'; } mainMenu(); if(ms) setTimeout(()=>hgCampaign(),0); };
}
function cardsHTML(items,group,cur){
  return `<div class="pick ${items.length===2?'two':''}" role="radiogroup">${items.map(it=>
    `<button class="tk" role="radio" data-g="${group}" data-k="${it.k}" aria-checked="${it.k===cur}" aria-disabled="${!!it.off}">${it.img?miniHTML(it.k):''}<b>${it.label}</b>${it.desc||''}${it.tag?`<em>${it.tag}</em>`:''}</button>`).join('')}</div>`;
}
function openDeploy(){
  state='deploy'; syncIntro(); mouseDown=false; rightDown=false; scopeOn=false; if(artyPick) artyMap(false); if(engGain) engGain.gain.value=0;
  if(document.pointerLockElement) document.exitPointerLock();
  document.body.classList.remove('menu','spec'); document.body.classList.add('deploy');
  $('overlay').style.display='flex'; renderDeploy();
}
function handOver(){
  if(!playerCrew) return; const c=playerCrew;
  c.isPlayer=false; c.name='Vos (IA)'; if(c.tank){c.tank.isPlayer=false;c.tank.name=c.name;} else c.respawnT=2;
  if(engGain) engGain.gain.value=0; mouseDown=rightDown=scoped=scopeOn=false; artyPick=false; document.body.classList.remove('artyPick'); playerCrew=null; player=null;
  if(document.pointerLockElement) document.exitPointerLock();
}
function goSpectate(){handOver();state='spectate';aerial=true;aer.init=false;aer.zoom=1;$('overlay').style.display='none';document.body.classList.remove('deploy');document.body.classList.add('spec');banner('Modo espectador','La IA ocupa tu lugar. Esc vuelve al menú',3.5);}
function renderDeploy(){
  const c=playerCrew;
  if(!canSpawn(c)){
    $('panel').innerHTML=`<h1>Sin vehículos</h1><p>Usaste todos tus tanques o no te alcanzan los puntos de reaparición (tenés ${c.sp}). La batalla sigue con tu equipo.</p>
      <button class="go" id="spec">Ver la batalla</button><button class="go alt" id="quit">Volver al menú</button>`;
    $('spec').onclick=goSpectate;
    $('quit').onclick=()=>{clearBattle();mainMenu();};
    return;
  }
  const veh=c.lineup.map(k=>{const V=VEH[k],cost=costOf(c,k),u=usesOf(c,k);
    const eq=[`mira ${V.optic.join('/')}×`,V.fcs?'telémetro':'',V.stab?'estabilizador':'',V.thermal?'térmica':''].filter(Boolean);
    return {k,img:1,label:V.label,desc:`Tanque ${V.cls}. ${V.desc} Munición: ${V.ammo.map(A=>A.n).join(', ')}.${eq.length?' Equipo: '+eq.join(', ')+'.':''}`,off:!available(c,k),
      tag:(u>=usesMax(k)?'Sin usos':cost===0?'Gratis':`${cost} puntos${cost>c.sp?', te faltan '+(cost-c.sp):''}`)+(isFinite(usesMax(k))?`. Usos ${u} de ${usesMax(k)}`:`. Salidas: ${u}`)};});
  if(!selKey||!c.lineup.includes(selKey)||!available(c,selKey)) selKey=(veh.find(v=>!v.off)||{}).k;
  const pts=spawnPoints(0); if(selSp>=pts.length) selSp=0;
  const sp=pts.map((p,i)=>({k:String(i),label:p.label}));
  $('panel').innerHTML=`<h1>${c.spawns?'Reaparecer':'Despliegue'}</h1>
    <p>Puntos de reaparición: <span class="sp">${c.sp}</span>. Podés reaparecer las veces que quieras mientras te alcancen los puntos. El primero es gratis; volver con un tanque que ya usaste cuesta 50 % más. El de élite sale una sola vez. Ganás puntos al penetrar (+15), destruir (+90) y capturar (+60).</p>
    <h2>Vehículo</h2>${cardsHTML(veh,'veh',selKey)}
    <h2>Punto de reaparición</h2>${cardsHTML(sp,'sp',String(selSp))}
    <button class="go" id="deployBtn">Desplegar</button><button class="go alt" id="specBtn">Mirar desde el aire</button><button class="go alt" id="quit">Abandonar</button>
    <div class="note">Tickets: ${allyLabel()} ${Math.max(0,Math.ceil(tickets[0]))}, ${NATIONS[foeNation].label} ${Math.max(0,Math.ceil(tickets[1]))}. La batalla sigue mientras elegís.</div>`;
  miniPedir(c.lineup); // miniatura de cada tanque (se dibujan una vez y quedan guardadas)
  document.querySelectorAll('.tk').forEach(b=>b.onclick=()=>{
    if(b.getAttribute('aria-disabled')==='true') return;
    if(b.dataset.g==='veh') selKey=b.dataset.k; else selSp=+b.dataset.k;
    renderDeploy();
  });
  $('deployBtn').onclick=()=>{doDeploy(); lock();};
  $('specBtn').onclick=goSpectate;
  $('quit').onclick=()=>{clearBattle();mainMenu();};
}
function doDeploy(){
  const c=playerCrew;
  if(!selKey||!c.lineup.includes(selKey)||!available(c,selKey)){renderDeploy();return;}
  if(net.guest){ hostSend({t:'sp',key:selKey,i:selSp}); $('panel').innerHTML='<h1>Desplegando…</h1><p>Esperando al anfitrión.</p>'; return; }
  const pts=spawnPoints(0); const p=pts[Math.min(selSp,pts.length-1)];
  player=spawnCrew(c,selKey,p);
  camYaw=player.heading; camPitch=.1; camDist=14; state='play';
  $('overlay').style.display='none'; document.body.classList.remove('deploy');
  banner(player.T.label,`Desplegado en ${p.label.toLowerCase()}`,2.5); syncIntro(); setTimeout(()=>radio('¡Tripulación lista! ¡Adelante!',2),600);
  updateHud();
}
// Ingreso pasivo: 2 puntos por segundo, más 1 por cada punto de captura que controla el bando
function spIncome(){ if(tut) return; for(const c of crews){ const held=zones.filter(Z=>Z.owner===(c.team===0?1:-1)).length; c.sp+=SP_RATE+held; if(c.isPlayer){ $('spT').textContent=c.sp; if(state==='deploy') refreshDeploy(); } } }
const SP_RATE=2; let deploySig='';
function refreshDeploy(){ const c=playerCrew; if(!c) return; const sig=c.lineup.map(k=>available(c,k)?1:0).join('');
  if(sig!==deploySig){ deploySig=sig; renderDeploy(); } else document.querySelectorAll('#panel .sp').forEach(e=>e.textContent=c.sp); }
function teamDone(team){
  return false; // la batalla termina por tickets: con el ingreso pasivo siempre se puede volver a salir
  return !tanks.some(t=>t.team===team&&!t.dead)&&!crews.some(c=>c.team===team&&!c.out&&canSpawn(c));
}
function checkEnd(){
  if(tut||net.guest) return;
  if(!['play','deploy','spectate','paused'].includes(state)||!crews.length) return;
  if(tickets[1]<=0||teamDone(1)) finish(0);
  else if(tickets[0]<=0||teamDone(0)) finish(1);
}
let nukeView=null;
function finish(winner){
  if(lastKillCrew&&!net.guest){ award(lastKillCrew,'Último derribo',30,50); lastKillCrew=null; }
  if(net.host) netAll({t:'end',w:winner,crews:crews.map(c=>({st:c.st,tk:c.tk,name:c.name,team:c.team,uses:c.uses,kills:c.kills,assists:c.assists||0,deaths:c.deaths,caps:c.caps,score:c.score,peer:c.peer||null,h:c.isPlayer||c.peer||c.wasHuman?1:0}))});
  if(nuke&&nuke.phase>=1&&nuke.cloud){ nukeEnd(winner); return; }
  state='end'; if(typeof objUI==='function') objUI(''); const N=NATIONS[winner===0?allyNation:foeNation].label;
  banner(spectating?`Gana ${N}`:winner===0?'Victoria':'Derrota',spectating?'':`Gana ${N}`,99);
  setTimeout(()=>{if(state==='end') summary(winner);},2800);
}
let tut=null;
// Tutorial: se arma según el tanque elegido (sus habilidades y su nivel)
const tutAmmo=()=>player.ammoCount?player.ammoCount.reduce((a,b)=>a+b,0):0;
function buildTutSteps(P){
  const T=P.T, S=[], K=k=>keyName(binds[k]);
  S.push({t:'Moverse',x:`${K('fwd')} y ${K('back')} aceleran y frenan; ${K('left')} y ${K('right')} giran. Recorré unos 40 metros.`,ok:U=>U.start.distanceTo(player.pos)>40});
  S.push({t:'Mirar y apuntar',x:`Mové el mouse para mirar. Apretá ${K('scope')} para entrar a la mira del artillero y quedate unos segundos (la rueda cambia el aumento, clic derecho hace zoom; ${K('scope')} de nuevo para salir).`,ok:U=>(U.scope||0)>2.5});
  S.push({t:'Disparar',x:'Destruí el tanque ligero marcado. Clic izquierdo dispara.',ok:U=>U.d[0].dead});
  S.push({t:'Blindaje',x:'El frente es grueso; los costados y la parte de atrás, finos. Destruí el tanque medio pegándole de costado.',ok:U=>U.d[1].dead});
  if(T.ammo.length>1) S.push({t:'Munición',x:`Tu tanque lleva ${T.ammo.map((A,i)=>`<b>${i+1}</b> ${A.n}`).join(', ')}. Elegí una a mano con ${T.ammo.map((_,i)=>K('ammo'+(i+1))).join('/')} y después volvé a la automática con ${K('ammoAuto')}.`,ok:U=>U.manual&&U.autoBack});
  S.push({t:'Puntos de captura',x:'Entrá al círculo del punto A y quedate hasta que la bandera sea tuya. Capturar baja los tickets del enemigo.',ok:U=>zones[0].owner===1});
  S.push({t:'Reabastecer munición',x:'Te quedan pocos proyectiles. Quedate quieto dentro de un punto capturado (el A) hasta reponer al menos 3.',
    enter:U=>{ if(player.ammoCount){ player.ammoCount=player.ammoCount.map(n=>Math.max(1,Math.floor(n/4))); } U.ammo0=tutAmmo(); },ok:U=>!player.ammoCount||tutAmmo()>=U.ammo0+3});
  S.push({t:'Reparar',x:`¡Te rompieron la oruga y el motor! No podés moverte. Apretá ${K('repair')} y esperá: mientras reparás no podés moverte ni disparar.`,
    enter:()=>{ player.trackT=600; player.mod.engine=0; player.engT=600; radio('¡Oruga rota!',2); },ok:U=>U.rep});
  S.push({t:'Recuperar tripulación',x:`Perdiste un tripulante. Hay infantería aliada cerca: apretá ${K('crewSwap')} y un soldado corre a ocupar el puesto.`,
    enter:()=>{ const m=player.crewM.filter(m=>m.alive&&m.seat!=='driver'&&m.seat!=='gunner').pop()||player.crewM[player.crewM.length-1]; m.alive=false; m.hp=0; afterHit(player,null,false); radio(`¡Perdimos al ${SEAT_RADIO[m.seat]||'tripulante'}!`,2);
      const b=player.heading+Math.PI; for(let i=0;i<2;i++) makePerson('rifle',0,player.pos.x+Math.sin(b)*22+i*2,player.pos.z+Math.cos(b)*22); },
    ok:()=>crewAlive(player)===player.crewM.length});
  // Habilidades según el tanque y su nivel
  if(P.smoke>0) S.push({t:'Humo (nivel 2)',x:`Tu tanque tiene lanzahumos. Apretá ${K('smoke')}: la nube corta la vista del enemigo unos 20 segundos. Tenés 2 granadas por salida.`,ok:U=>U.smoke});
  if(T.thermal) S.push({t:'Visión térmica',x:`Apretá ${K('thermal')} para la visión térmica: los tanques se ven brillantes aunque haya humo o poca luz.`,ok:()=>player.thermal});
  if(hasFcs(P)) S.push({t:'Telémetro',x:`Tu tanque tiene telémetro${P.fcsX?' (mejora de nivel 5)':''}: compensa solo la caída del proyectil. Mirá con ${K('scope')} al tanque lejano y leé la distancia.`,enter:U=>{U.scope=0;},ok:U=>(U.scope||0)>2});
  if(T.troops) S.push({t:'Infantería',x:`Tu vehículo lleva soldados. Apretá ${K('troops')} para bajarlos: capturan puntos y tienen un antitanque.`,ok:()=>!player.troops});
  if(T.auto) S.push({t:'Ráfaga',x:'Tu cañón es automático: mantené el clic y dispará una ráfaga al tanque lejano. Al vaciar el cargador hay una recarga larga.',enter:U=>{U.shots=0;},ok:U=>U.shots>=3});
  else if(T.autoL) S.push({t:'Cargador automático',x:'Tu tanque tiene cargador automático: recarga a la misma velocidad aunque pierdas tripulantes. Disparale dos veces al tanque lejano.',enter:U=>{U.shots=0;},ok:U=>U.shots>=2});
  S.push({t:'Artillería',x:`Apretá ${K('arty')}: se abre el mapa; hacé clic sobre el tanque lejano (o ${K('arty')} otra vez para que caiga donde apunta la mira). Se recarga en ${ARTY_CD} s; la marcan bengalas en el suelo.`,enter:()=>{playerCrew.sp=Math.max(playerCrew.sp,600);playerCrew.artyCD=0;},ok:U=>U.arty});
  if(RULE().sup.air) S.push({t:'Ataque aéreo',x:`Apretá ${K('air')}: se abre el mapa; hacé clic donde querés las bombas (o ${K('air')} otra vez: donde apunta la mira). El avión pasa en línea desde tu tanque y suelta cuatro bombas. Se recarga en ${AIR_CD} s.`,enter:()=>{playerCrew.sp=Math.max(playerCrew.sp,600);playerCrew.airCD=0;},ok:U=>U.air});
  S.push({t:'Rematar',x:'Terminá con el tanque lejano como quieras.',skip:U=>U.d[2].dead,ok:U=>U.d[2].dead});
  if(T.arc!=null) S.splice(2,0,{t:'Sin torre',x:`Tu ${T.label} no tiene torre: el cañón gira solo ${Math.round(T.arc*180/Math.PI)}° a cada lado${T.m.ww1==='rhombo'?' (dispara el de la barbeta del costado hacia donde apuntás)':''}. Para apuntar más allá, girá el casco: dá media vuelta con ${K('left')} o ${K('right')}.`,enter:U=>{U.h0=player.heading;},ok:U=>Math.abs(wrap(player.heading-U.h0))>1.4});
  if(!RULE().sup.nuke) S.push({t:'¡Contraataque enemigo!',x:`¡Entran 5 tanques enemigos! Pedí artillería con ${K('arty')} sobre ellos y destruí al menos dos. Tu tanque está protegido en esta prueba.`,
    enter:U=>{ playerCrew.sp=Math.max(playerCrew.sp,600); playerCrew.artyCD=0; $('spT').textContent=playerCrew.sp; player.immuneT=120; tutAttack(U); },ok:U=>U.attack&&U.attack.filter(t=>t.dead).length>=2});
  else S.push({t:'¡Ataque enemigo! Nuke',x:`¡Entran 5 tanques enemigos! Te damos ${NUKE_COST} puntos: apretá ${K('nuke')}. Un B-29 cruza, suelta la bomba y arrasa a todos. Tu tanque está protegido en esta prueba.`,
    enter:U=>{ playerCrew.sp=Math.max(playerCrew.sp,NUKE_COST); $('spT').textContent=playerCrew.sp; player.immuneT=90; tutAttack(U); },ok:()=>nuke&&nuke.phase>=1});
  const nx=[2,3,4,5].filter(l=>l>P.lv).map(l=>`nivel ${l}: ${lvUp(l,P.key).n.toLowerCase()}`);
  S.push({t:'Listo',x:`¡Terminaste! ${nx.length?`Este tanque mejora con la experiencia (${nx.join(', ')}); cada mejora suma su práctica a este tutorial.`:'Este tanque ya tiene todas las mejoras.'} También tenés la vista aérea (${K('aerial')}).`,ok:()=>false});
  return S;
}
function tutAttack(U){
  const pts=W.sp[1]; U.attack=[];
  for(let i=0;i<5;i++){ const c=newCrew(NATIONS[foeNation].names[i%NATIONS[foeNation].names.length],1,foeNation,false); c.out=true; crews.push(c);
    const L=tut.foeL||NATIONS[foeNation].lineup, sp=pts[i%pts.length], k=L[i%L.length];
    const t=spawnCrew(c,k,{x:sp.x+rand(-12,12),z:sp.z+rand(-12,12)}); t.immuneT=0; t.spottedT=99; U.attack.push(t); }
  banner('¡Ataque enemigo!','5 tanques avanzan hacia vos',3);
}
function startTutorial(key){
  if(!PROG) loadProg();
  const ok=k=>k&&VEH[k]&&owned(k);
  key=ok(key)?key:(garageOf(chosenNation)[0]||vehTree(chosenNation).find(owned));
  const e=eraOf(key); battleBR=null; startBattle(false,e===1?'villers':e===2?'jarama':'campo',null,true); battleBR=null; tut={step:0,okT:0,start:null,d:[],arty:false,key};
  { const T=vehTreeE(foeNation,e); tut.foeL=T.length?[T[0],T[Math.min(1,T.length-1)],T[T.length-1]]:NATIONS[foeNation].lineup.slice(); }
  infantry.slice().forEach(removeInf); infantry.length=0; tanks.slice().forEach(removeTank);
  crews=[playerCrew]; playerCrew.sp=400; playerCrew.lineup=[key];
  const sp=W.sp[0][0], fx=0-sp.x, fz=-2-sp.z, L=Math.hypot(fx,fz), ux=fx/L, uz=fz/L;
  const foe=tut.foeL;
  [[foe[0],70,-14],[foe[1],120,18],[foe[2],205,-10]].forEach(([k,dist,side],i)=>{
    const c=newCrew(['Blanco 1','Blanco 2','Blanco 3'][i],1,foeNation,false); c.out=true; crews.push(c);
    const p={label:'',x:sp.x+ux*dist-uz*side,z:sp.z+uz*dist+ux*side};
    const t=spawnCrew(c,k,p); t.dummy=true; t.immuneT=0; t.heading=Math.atan2(ux,uz)+Math.PI/2*(i===1?1:-1); tut.d.push(t); });
  player=spawnCrew(playerCrew,key,sp); tut.start=player.pos.clone(); tut.steps=buildTutSteps(player);
  camYaw=player.heading; camPitch=.1; camDist=14; state='play'; $('overlay').style.display='none'; document.body.classList.remove('deploy','menu','home'); document.body.classList.add('tut');
  showTut(); lock(); updateHud(); banner(player.T.label,`Tutorial · nivel ${player.lv}`,2.5);
}
function showTut(){ const S=tut.steps[tut.step]; if(S.enter) S.enter(tut); $('tutbox').innerHTML=`<b>Tutorial · paso ${tut.step+1} de ${tut.steps.length}: ${S.t}</b>${S.x}`; }
function updateTutorial(dt){
  if(!player||state!=='play') return;
  if(player.dead){ tutDone(true); return; }
  if(scoped) tut.scope=(tut.scope||0)+dt;
  for(const t of tut.d) if(!t.dead) t.spottedT=3;
  if(tut.okT>0){ tut.okT-=dt; if(tut.okT<=0){ do{ tut.step++; }while(tut.step<tut.steps.length-1&&tut.steps[tut.step].skip&&tut.steps[tut.step].skip(tut));
      showTut(); if(tut.step===tut.steps.length-1) setTimeout(()=>{ if(tut&&state==='play') tutDone(); },14000); } return; }
  if(tut.steps[tut.step].ok(tut)){ hitMsg('¡Bien hecho!','var(--ally)'); tut.okT=1.4; }
}
function tutDone(failed){
  if(document.pointerLockElement) document.exitPointerLock();
  stopAllLoops(); const key=tut&&tut.key; tut=null; document.body.classList.remove('tut'); state='summary'; document.body.classList.add('menu'); $('overlay').style.display='flex';
  $('panel').innerHTML=failed?`<h1>Te destruyeron</h1><p>Probá de nuevo: en el tutorial conviene mostrar el frente y usar la mira.</p>
    <button class="go" id="tgo">Repetir el tutorial</button><button class="go alt" id="tmenu">Volver al hangar</button>`:`<h1>Tutorial completo</h1><p>Ya sabés moverte, apuntar, aprovechar el blindaje, capturar, reabastecer, reparar, recuperar tripulantes y pedir apoyo.</p>
    <button class="go" id="tgo">Repetir con este tanque</button><button class="go alt" id="tmenu">Volver al hangar</button>`;
  $('tgo').onclick=()=>{initAudio(); startTutorial(key);}; $('tmenu').onclick=()=>{menuScreen='hangar'; mainMenu();};
}
function guide(){
  $('panel').innerHTML=`<h1>Cómo jugar</h1><div class="guide">
  <h2>Objetivo</h2><p>Cada bando empieza con 400 tickets. Bajan cuando el enemigo controla más puntos de captura (A, B y C) y cuando perdés tanques. Gana quien deja al otro en cero o sin tanques para salir. La nuke, a los 1500 puntos, gana la batalla de una.</p>
  <h2>Tu línea de tanques</h2><p>Elegís un tanque ligero, medio o principal. Cada uno sale una vez y puede reaparecer otra si te alcanzan los puntos de reaparición. Los ganás penetrando, destruyendo, capturando y abatiendo infantería. El tanque de élite sale una sola vez.</p>
  <h2>Controles</h2><p>W/S acelerar y frenar, A/D girar, mouse para mirar, clic izquierdo cañón, clic derecho zoom, Espacio ametralladora, Shift entra y sale de la mira, F artillería, G ataque aéreo, N nuke, T visión térmica, V vista aérea, Esc pausa.</p>
  <h2>Apuntar en modo realista</h2><p>Los tanques con telémetro compensan solos la caída del proyectil. En los demás usá la escala de la mira: las marcas 2, 4 y 6 son 200, 400 y 600 metros. A más distancia, apuntá más arriba.</p>
  <h2>Munición</h2><p>Se elige sola mientras recargás, según lo que tengas en la mira. La cinética pierde fuerza con la distancia y rebota en ángulos cerrados; la carga hueca no pierde fuerza; la HESH ignora la inclinación pero rebota fácil; la explosiva sirve contra infantería, edificios y blindados livianos.</p>
  <h2>Blindaje y ángulo</h2><p>El frente es lo más grueso. Pegale a los costados y atrás. Si el impacto llega muy inclinado, rebota. Para protegerte, mostrá el frente un poco girado.</p>
  <h2>Daños</h2><p>Cada penetración lanza esquirlas que pueden matar tripulantes o romper el motor, el cañón o la munición. La oruga rota te deja inmóvil 10 segundos y el cañón dañado no dispara por 12. Si muere el artillero o el conductor, otro toma el puesto. El tanque cae con menos de dos tripulantes o si explota la munición.</p>
  <h2>Consejos</h2><p>No te quedes quieto en campo abierto, usá edificios y lomas para cubrirte, disparar en movimiento sin estabilizador es casi tirar al aire, y los soldados antitanque pueden sorprenderte en los barrios.</p></div>
  <button class="go" id="gtut">Hacer el tutorial</button><button class="go alt" id="gback">Volver</button>`;
  $('gtut').onclick=()=>{initAudio(); if(AC.state==='suspended')AC.resume(); startTutorial();}; $('gback').onclick=()=>mainMenu();
}
// Lo que un tanque tiene de especial (para ofrecer el tutorial al desbloquearlo)
function vehSpecial(k){ const T=VEH[k], L=[T.arc!=null&&(T.auto&&T.pen<15?'armas en las barbetas, sin torre':'cañón sin torre'),T.thermal&&'visión térmica',T.fcs&&'telémetro',T.troops&&'infantería a bordo',
    T.auto&&(T.pen<15?'ametralladoras en vez de cañón':'cañón automático'),!T.auto&&T.autoL&&'cargador automático',T.ammo&&T.ammo.length>1&&`${T.ammo.length} tipos de munición`].filter(Boolean);
  return L.length>1?L.slice(0,-1).join(', ')+' y '+L[L.length-1]:L[0]||''; }
// Probar en batalla: lo pone primero en el garaje y sale a una partida
function tryTank(k){ const n=VEH[k].nation, G=garRef(n,eraOf(k)), i=G.indexOf(k); if(i>=0) G.splice(i,1); G.unshift(k); if(G.length>3) G.pop(); saveProg();
  chosenNation=n; hgSel=k; playMode='battle'; menuScreen='hangar'; initAudio(); startBattle(false); }
function nextMapKey(){ const ks=eraMaps(W.era||5); return ks[(ks.indexOf(builtKey)+1)%ks.length]||ks[0]; }
function summary(winner){
  if(document.pointerLockElement) document.exitPointerLock();
  stopAllLoops(); state='summary'; document.body.classList.add('menu'); document.body.classList.remove('deploy','spec');
  $('banner').style.opacity=0; bannerT=0; $('overlay').style.display='flex';
  const top=crews.reduce((b,c)=>!b||c.score>b.score?c:b,null);
  const table=team=>{const rows=crews.filter(c=>c.team===team).sort((a,b)=>b.score-a.score), sm=k=>rows.reduce((a,c)=>a+(+c[k]||0),0);
    return `<h2 class="tm ${team===0?'':'foe'}">${NATIONS[team===0?allyNation:foeNation].label}${team===winner?'<span class="w">GANADOR</span>':''}<span class="tk">${Math.max(0,Math.ceil(tickets[team]))} tickets</span></h2><table class="sum"><colgroup><col style="width:21%"><col><col style="width:8.5%"><col style="width:8.5%"><col style="width:8.5%"><col style="width:8.5%"><col style="width:10%"></colgroup><thead><tr><th>Jugador</th><th>Tanques</th><th class="n">Bajas</th><th class="n">Asist.</th><th class="n">Muertes</th><th class="n">Capturas</th><th class="n">Puntos</th></tr></thead><tbody>${
      rows.map(c=>{ const ia=net.on&&!c.isPlayer&&!c.peer&&!c.wasHuman&&!c.human, tks=Object.keys(c.uses).filter(k=>VEH[k]).map(k=>VEH[k].label).join(', ')||'Ninguno';
        return `<tr class="${c.isPlayer?'me':''}"><td title="${esc(c.name)}">${esc(c.name)}${c===top&&c.score>0?'<span class="mvp" title="Mejor de la partida">★</span>':''}${ia?'<span class="ia">BOT</span>':''}</td><td title="${esc(tks)}">${esc(tks)}</td><td class="n">${c.kills|0}</td><td class="n">${c.assists|0}</td><td class="n">${c.deaths|0}</td><td class="n">${c.caps|0}</td><td class="n pts">${(c.score|0).toLocaleString('es-AR')}</td></tr>`; }).join('')}</tbody>
      <tfoot><tr><td>Total</td><td></td><td class="n">${sm('kills')}</td><td class="n">${sm('assists')}</td><td class="n">${sm('deaths')}</td><td class="n">${sm('caps')}</td><td class="n">${sm('score').toLocaleString('es-AR')}</td></tr></tfoot></table>`;};
  const N=NATIONS[winner===0?allyNation:foeNation].label;
  let rpHtml=''; const me=crews.find(c=>c.isPlayer||c.name==='Vos'||c.name==='Vos (IA)');
  const MS=curSpecial&&curSpecial.mission?missionById(curSpecial.mission):null; let mres=null, unl=[];
  if(!spectating&&(!curSpecial||MS)&&me&&PROG&&!summary._done){ summary._done=true; const n=MS?MS.ally:chosenNation, win=winner===0;
    // premio según el rango más alto que usaste: PI para investigar y Yaguaretés de plata para comprar
    const used=Object.keys(me.uses||{}).filter(k=>VEH[k]), rk=Math.max(1,...used.map(rankOf)), R=battleReward(rk,win,me.score|0), rp=R.rp;
    if(MS) mres=missionResult(MS,win);
    PROG.stats.battles++; if(win) PROG.stats.wins++; updateSkill(me,win); PROG.yp=(PROG.yp||0)+R.yp; const un=addRP(n,rp).concat(mres&&mres.un||[]), nx=nextResearch(n); unl=un;
    let xpHtml='', progHtml='';
    { const st=me.st||{}, win=winner===0, v={kills:me.kills|0,side:st.side|0,caps:me.caps|0,assists:me.assists|0,inf:st.inf|0,wins:win?1:0,badwx:['noche','niebla','lluvia','tormenta'].includes(wxKey)?1:0,smoke:st.smoke|0};
      const gx=Math.max(0,Math.round(me.score*2+(win?500:200))), r0=rankIdx(PROG.pxp||0); PROG.pxp=(PROG.pxp||0)+gx; const dn=progressDaily(v,n), r1=rankIdx(PROG.pxp);
      PROG.tstat=PROG.tstat||{}; for(const k of used){ const S=PROG.tstat[k]||(PROG.tstat[k]={b:0,w:0,k:0,d:0}); S.b++; if(win) S.w++; const tk=(me.tk||{})[k]; if(tk){ S.k+=tk.k|0; S.d+=tk.d|0; } }
      progHtml=`<br><b>+${gx.toLocaleString('es-AR')} XP de jugador</b> · ${RANKS[r1][1]}${r1>r0?` <b style="color:var(--amber)">¡Ascendiste a ${RANKS[r1][1]}!</b>`:''}`+dn.map(c=>`<br>Desafío cumplido: ${chText(c)} · <b>+1 medalla</b> y +1.000 XP`).join(''); saveProg(); }
    for(const k of used){ const xp=Math.round(rp/used.length), ups=addTankXP(k,xp), L=tankLv(k);
      xpHtml+=`<br>${VEH[k].label}: +${xp.toLocaleString('es-AR')} XP · nivel ${L}${L<5?` (${tankXP(k).toLocaleString('es-AR')} / ${LV_XP[L].toLocaleString('es-AR')})`:' (máximo)'}`+ups.map(l=>`<br>&nbsp;&nbsp;¡Nivel ${l}! <b>${lvUp(l,k).n}</b>: ${lvUp(l,k).d}`).join(''); }
    { const eu=checkEraUnlock(); progHtml+=eu.map(e=>`<br>🔓 Se abrió el rango ${RANK_ROMAN[e]}: <b>${ERAS[e].n}</b> (${ERAS[e].y}).`).join(''); }
    rpHtml=(mres?mres.html:'')+`<div class="rpbox"><b>+${rp.toLocaleString('es-AR')} PI</b> y <b>+${ypTxt(R.yp)}</b> ${YP} <small>(rango ${RANK_ROMAN[rk]})</small> · tenés <b>${ypTxt(PROG.yp)}</b>
      ${xpHtml}${progHtml}${nx?`<br>Investigando: ${VEH[nx].label} (rango ${RANK_ROMAN[rankOf(nx)]}) · ${(PROG.rp[nx]||0).toLocaleString('es-AR')} / ${rpCost(nx).toLocaleString('es-AR')} PI<div class="pbar"><i style="width:${Math.round((PROG.rp[nx]||0)/rpCost(nx)*100)}%"></i></div>`:'<br>No queda nada para investigar en '+NATIONS[n].label+' por ahora.'}</div>`;
    if(unl.length&&!net.on) rpHtml+=`<div class="rpbox unl">${unl.map(k=>`<div class="unlI" data-k="${k}">${unlHTML(k)}</div>`).join('')}</div>`; }
  $('panel').innerHTML=`<h1>${spectating?'Fin de la partida':MS?(winner===0?'Misión cumplida':'Misión fallida'):winner===0?'Victoria':'Derrota'}</h1>${rpHtml}
    <p>Gana ${N}. Tickets finales: ${allyLabel()} ${Math.max(0,Math.ceil(tickets[0]))}, ${NATIONS[foeNation].label} ${Math.max(0,Math.ceil(tickets[1]))}. Puntos: penetrar 20, destruir 100, capturar 60 y artillería 10 por impacto.</p>
    <div class="sumwrap">${table(0)}${table(1)}</div>
    <button class="go" id="again">${MS?(mres&&mres.next?'Siguiente misión: '+mres.next.title:'Reintentar la misión'):curSpecial?'Revancha en el puente':'Continuar: '+WORLDS[nextMapKey()].label}</button><button class="go alt" id="menuB">${MS?'Volver a la campaña':'Menú principal'}</button>`;
  if(net.guest){ $('again').textContent='Esperando que el anfitrión siga…'; $('again').disabled=true; $('menuB').textContent='Salir de la sala'; }
  if(net.host) $('menuB').textContent=net.quick?'Salir de la partida':'Cerrar la sala';
  if(net.host&&net.quick) setTimeout(salaSeguir,0);
  $('again').onclick=()=>{initAudio(); if(MS) startMission(mres&&mres.next?mres.next.id:MS.id); else if(curSpecial) startBattle(spectating,'puente',curSpecial); else startBattle(spectating,nextMapKey());};
  $('menuB').onclick=()=>{ if(MS){ menuScreen='hangar'; playMode='camp'; } mainMenu(); if(MS) setTimeout(()=>hgCampaign(),0); };
  const ub=document.querySelector('#panel .rpbox.unl');
  if(ub) ub.onclick=e=>{ const b=e.target.closest('button'), it=e.target.closest('.unlI'); if(!b||!it||b.disabled) return; const k=it.dataset.k;
    if(b.dataset.buy!=null){ if(buyTank(k)) it.innerHTML=unlHTML(k,true); }
    else if(b.dataset.try!=null) tryTank(k); else if(b.dataset.tut!=null){ initAudio(); startTutorial(k); } };
}
// Tanque recién investigado: comprarlo y después probarlo (o hacer el tutorial si tiene algo especial)
function unlHTML(k,justBought){ const V=VEH[k], c=ypCost(k), sp=vehSpecial(k);
  if(!owned(k)) return `<p><b>¡Investigaste el ${V.label}!</b> Para usarlo tenés que comprarlo: cuesta <b>${ypTxt(c)}</b> y tenés ${ypTxt(PROG.yp)}.</p>
    <div class="unlB">${PROG.yp>=c?`<button class="go" data-buy>Comprar · ${ypTxt(c)}</button>`:`<button class="go" disabled>Te faltan ${ypTxt(c-PROG.yp)}</button>`}</div>`;
  return `<p><b>${justBought?'¡Compraste el':'Ya tenés el'} ${V.label}!</b> ${sp?`Tiene ${sp}. ¿Querés aprender a usarlo en el tutorial o probarlo directo en batalla?`:'¿Querés probarlo en batalla?'}</p>
    <div class="unlB"><button class="go" data-try>Probar en batalla</button>${sp?`<button class="go alt" data-tut>Tutorial con este tanque</button>`:''}</div>`; }
function radios(group,obj,cur,cls,dis){
  return `<div class="pick ${cls||''}" role="radiogroup">${Object.entries(obj).map(([k,T])=>
    `<button class="tk" role="radio" data-g="${group}" data-k="${k}" aria-checked="${k===cur}" aria-disabled="${k===dis}"><b>${T.label}</b>${T.desc}</button>`).join('')}</div>`;
}
let menuOpen=null, specialSide='ctes';
const normalNations=()=>Object.fromEntries(Object.entries(NATIONS).filter(([k,v])=>!v.special));
function menuSec(id,label,html){ return `<button class="mi${menuOpen===id?' open':''}" data-s="${id}">${label}<i>▾</i></button><div class="sec"${menuOpen===id?'':' hidden'}>${html}</div>`; }
let menuScreen='home', playMode='battle';
function mainMenu(){
  stopAllLoops(); if(typeof objUI==='function'){ objUI(''); curObj=null; } if(typeof vfichaOff==='function') vfichaOff();
  if(net.on) netLeave(); if(wxKey!=='dia') applyWeather('dia');
  if(document.pointerLockElement) document.exitPointerLock();
  state='menu'; tut=null; bindCapture=null; document.body.classList.add('menu'); document.body.classList.remove('deploy','spec','tut','home'); if(!PROG) loadProg();
  $('banner').style.opacity=0; bannerT=0; $('overlay').style.display='flex'; syncIntro();
  if(!PROG.eraOpen[curEra]||!eraReady(curEra)) curEra=3; applyEraNations(curEra);
  { const EN=eraNations(curEra); if(!EN.includes(chosenNation)) chosenNation=EN[0]; }
  const go=f=>()=>{initAudio(); if(AC.state==='suspended')AC.resume(); f();};
  const gear=`<button class="setB" id="setB" title="Ajustes" aria-label="Ajustes">⚙</button>`;
  if(menuScreen==='settings'){ renderSettings(); return; }
  if(menuScreen==='play'||menuScreen==='hangar'){ renderHangar(); return; }
  if(menuScreen==='tree'){ renderTree(); return; }
  {
    document.body.classList.add('home');
    $('panel').innerHTML=`${gear}<button class="acctB" id="acctB" hidden></button><div class="homeArt"></div><div class="homeShade"></div>
      <div class="homeBar"><button class="hb main" id="playB">Jugar ahora</button><button class="hb" id="campB">Campaña</button><button class="hb" id="vehB">Vehículos</button><button class="hb" id="tutB">Tutorial</button><button class="hb" id="optB">Opciones</button></div>
      <div class="homeCopy"><button class="introL" id="introL">▶ Ver la intro</button> · Taragüí War · Frente de Acero · necesita teclado y mouse</div>`;
    $('introL').onclick=go(()=>introStart());
    const toPlay=()=>{menuScreen='hangar';if(playMode==='tut')playMode='battle';mainMenu();};
    $('playB').onclick=toPlay;
    $('vehB').onclick=()=>{menuScreen='tree';mainMenu();};
    $('campB').onclick=()=>{menuScreen='hangar';playMode='camp';mainMenu();hgCampaign();};
    $('tutB').onclick=()=>{menuScreen='hangar';playMode='tut';mainMenu();};
    $('optB').onclick=()=>{menuScreen='settings';mainMenu();};
    if(typeof nubeChip==='function'){ $('acctB').onclick=nubeAbrir; nubeChip(); }
  }
  $('setB').onclick=()=>{menuScreen='settings';mainMenu();};
}
