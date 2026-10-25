/* ---------- Online (P2P con PeerJS): el anfitrión maneja bots, puntos y tickets ---------- */
const PEER_SRC='https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js', ROOM_PFX='taraguiwar-', MAX_GUESTS=5;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanName=s=>String(s||'').replace(/[^\p{L}\p{N} ._-]/gu,'').trim().slice(0,16);
const isRemote=t=>!!(t&&t.crew&&t.crew.peer);
function netTo(t,msg){ const c=net.conns.find(c=>c.peer===t.crew.peer); if(c&&c.open) c.send(msg); }
function tell(t,txt,color){ if(t.isPlayer) hitMsg(txt,color); else if(isRemote(t)) netTo(t,{t:'hm',txt,color}); }
function hostSend(msg){ const c=net.hostConn; if(c&&c.open) c.send(msg); } // invitado → anfitrión (durante un relevo no hay a quién mandar)
function netAll(msg,exceptPeer){ for(const c of net.conns) if(c.ready&&c.open&&c.peer!==exceptPeer) c.send(msg); }
// Mismo azar en todas las PC para armar el mapa (árboles, casas, texturas)
function withSeed(seed,f){ if(!seed) return f(); const R=Math.random; let a=seed>>>0;
  Math.random=()=>{a=(a+0x6D2B79F5)>>>0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296;};
  try{ f(); } finally{ Math.random=R; } }
function loadPeer(){ return window.Peer?Promise.resolve():new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=PEER_SRC; s.onload=res; s.onerror=()=>rej(new Error('No se pudo cargar la librería de red. Revisá la conexión.')); document.head.appendChild(s); }); }
function peerOpts(){ let q=null; try{ q=new URLSearchParams(location.search).get('peerhost'); }catch(e){}
  if(!q) return {debug:1}; const [host,port]=q.split(':'); return {host,port:+port||9000,path:'/',secure:false,debug:1}; }
const r2=v=>Math.round(v*100)/100, r3=v=>Math.round(v*1000)/1000;
let netName=''; try{ netName=localStorage.getItem('tw-name')||''; }catch(e){}
let netCodeIn='';

function onlineMenuHTML(){
  return `<h2>Tu nombre</h2><input id="onName" class="txt" maxlength="16" placeholder="Ej.: Seba" value="${esc(netName)}">
  <p class="s">Cada uno juega con su nación y su garaje. El enemigo y el mapa salen al azar. Todos en el mismo bando, contra los bots.</p>
  <button class="go" id="onHost">Crear sala</button>
  <h2>Unirse a una sala</h2><input id="onCode" class="txt" maxlength="6" placeholder="Código, ej.: K7M2Q" value="${esc(netCodeIn)}" style="text-transform:uppercase">
  <button class="go alt" id="onJoin">Unirse</button><div class="note" id="onErr"></div>`;
}
function wireOnlineMenu(go){
  const nm=$('onName'); if(!nm) return;
  nm.oninput=()=>{ netName=cleanName(nm.value); try{localStorage.setItem('tw-name',netName);}catch(e){} };
  $('onCode').oninput=()=>{ netCodeIn=$('onCode').value.toUpperCase().replace(/[^A-Z0-9]/g,''); };
  $('onHost').onclick=go(()=>netHost());
  $('onJoin').onclick=go(()=>netJoin(netCodeIn));
}
function netErr(msg){ if(!$('onErr')){ menuScreen='hangar'; playMode='online'; mainMenu(); hgOnline(); } if($('onErr')){ $('onErr').textContent=msg; $('onErr').style.color='var(--enemy)'; } }
function lobbyShell(){ state='lobby'; document.body.classList.add('menu'); document.body.classList.remove('deploy','spec','tut','home','brief'); $('overlay').style.display='flex'; if(document.pointerLockElement) document.exitPointerLock(); }
function myName(){ return netName||(net.host?'Anfitrión':'Invitado'); }

// ----- Anfitrión -----
async function netHost(quick){
  try{ await loadPeer(); }catch(e){ if(quick) jugarSolo('No se pudo cargar la red: jugás con bots.'); else netErr(e.message); return; }
  const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let code=''; for(let i=0;i<5;i++) code+=A[(Math.random()*A.length)|0];
  $('onErr')&&($('onErr').textContent='Creando sala…');
  const peer=new Peer(ROOM_PFX+code.toLowerCase(),peerOpts());
  peer.on('open',()=>{ Object.assign(net,{on:true,host:true,guest:false,peer,conns:[],code,name:myName(),inBattle:false,quick:!!quick,o:0});
    if(quick){ net.mode='vs'; startBattle(false); salaAbrir(); } else hostLobby(); }); // sala rápida: arranca enseguida y los que lleguen reemplazan bots
  peer.on('error',e=>{ if(e.type==='unavailable-id'){ peer.destroy(); netHost(quick); } else if(!net.on){ if(quick){ try{peer.destroy();}catch(_){} jugarSolo('No se pudo abrir la partida online ('+e.type+'): jugás con bots.'); } else netErr('No se pudo crear la sala ('+e.type+').'); } else console.warn(e); });
  peer.on('disconnected',()=>{ if(net.on&&net.peer===peer) try{peer.reconnect();}catch(e){} });
  peer.on('connection',hostAccept);
}
function hostAccept(conn){
  if(net.conns.length>=MAX_GUESTS){ conn.on('open',()=>{conn.send({t:'full'}); setTimeout(()=>conn.close(),500);}); return; }
  net.conns.push(conn); conn.lastT=performance.now();
  conn.on('data',d=>{ try{ hostData(conn,d); }catch(e){ console.error(e); } });
  conn.on('close',()=>hostDrop(conn)); conn.on('error',()=>hostDrop(conn));
}
function lobbyInfo(){ return {t:'lobby',code:net.code,host:net.name,mode:net.mode,players:[[net.name,chosenNation,0],...net.conns.filter(c=>c.ready).map(c=>[c.name,c.nation,sideOf(c)])]}; }
const plOne=([n,nat],i)=>esc(n)+(NATIONS[nat]?' · '+esc(NATIONS[nat].label):'')+(i===0?' (anfitrión)':'');
const plList=L=>L.mode==='vs'?`<div class="lbT"><div><b>Equipo A</b><br>${L.players.map((p,i)=>[p,i]).filter(([p])=>!p[2]).map(([p,i])=>plOne(p,i)).join('<br>')||'—'}</div><div><b>Equipo B</b><br>${L.players.map((p,i)=>[p,i]).filter(([p])=>p[2]).map(([p,i])=>plOne(p,i)).join('<br>')||'—'}</div></div><p class="s">Los lugares vacíos los ocupan bots.</p>`:L.players.map(plOne).join('<br>');
function hostLobby(){
  if(net.inBattle) return; lobbyShell();
  const L=lobbyInfo();
  $('panel').innerHTML=`<h1>Sala ${esc(net.code)}</h1>
    <p>Pasale este código a tus amigos. Entran desde el mismo link, en <b>Jugar ahora → Online con amigos → Unirse</b>.</p>
    <div style="font-size:54px;font-weight:700;letter-spacing:.12em;color:var(--amber);margin:6px 0 10px">${esc(net.code)}</div>
    <h2>Modo</h2><div class="hgOpt" style="max-width:420px"><button class="${net.mode==='coop'?'sel':''}" data-md="coop">Cooperativo (todos contra bots)</button><button class="${net.mode==='vs'?'sel':''}" data-md="vs">Versus (cada uno elige equipo)</button></div>
    <h2>Jugadores (${L.players.length} de ${MAX_GUESTS+1})</h2><p>${plList(L)}</p>
    <p class="s">${net.mode==='vs'?'Vos estás en el Equipo A. Cada amigo elige su equipo desde su pantalla.':'Enemigo y mapa al azar. Todos en el mismo bando contra los bots.'} Dejá esta pestaña a la vista: si la minimizás o te vas, la partida se frena o se corta para todos.</p>
    <button class="go" id="lbGo">Empezar la batalla</button><button class="go alt" id="lbQuit">Cerrar la sala</button>`;
  $('lbGo').onclick=()=>{ initAudio(); if(AC.state==='suspended')AC.resume(); startBattle(false); };
  document.querySelectorAll('[data-md]').forEach(b=>b.onclick=()=>{ net.mode=b.dataset.md; hostLobby(); });
  $('lbQuit').onclick=()=>mainMenu();
  netAll(L);
}
const sideOf=conn=>net.mode==='vs'?(conn.side?1:0):0;
function remoteCrew(conn){ const nat=conn.nation||allyNation, c=newCrew(conn.name,sideOf(conn),nat,false); c.lineup=conn.garage&&conn.garage.length?conn.garage.slice():NATIONS[nat].lineup.slice();
  // el invitado juega en la época de la partida: si su garaje es de otra, sale con los primeros tanques de esa época
  { const e=W.era||5; c.lineup=c.lineup.filter(k=>eraOf(k)===e); if(!c.lineup.length){ const n2=eraNations(e).includes(nat)?nat:(sideOf(conn)===0?allyNation:foeNation); c.nation=n2; c.lineup=vehTreeE(n2,e).slice(0,2); } }
  c.peer=conn.peer; c.wasHuman=true; c.lvs=conn.lvs||{}; c.cams=conn.cams||{}; conn.crew=c; return c; }
const battleOn=()=>['brief','play','deploy','spectate','end','paused'].includes(state)&&crews.length&&!tut;
function hostData(conn,d){
  if(!d||typeof d!=='object') return;
  conn.lastT=performance.now(); if(d.t==='p') return;
  if(d.t==='side'){ if(battleOn()) return; /* en plena batalla no se puede cambiar de bando */ conn.side=d.s?1:0; if(state==='lobby') hostLobby(); else conn.send(lobbyInfo()); return; }
  if(d.t==='hi'){
    let n=cleanName(d.name)||'Invitado'; const used=new Set([net.name,...net.conns.filter(c=>c.ready).map(c=>c.name)]); let k=2,b=n; while(used.has(n)) n=b+' '+(k++);
    conn.name=n; conn.ready=true; conn.side=d.side?1:0;
    if(net.quick){ const hum=tm=>crews.filter(c=>c.team===tm&&!c.out&&(c.isPlayer||c.peer)).length+net.conns.filter(c=>c.ready&&c!==conn&&!c.crew&&c.side===tm).length; conn.side=hum(1)<=hum(0)?1:0; } conn.nation=normalNations()[d.nation]?d.nation:chosenNation;
    conn.garage=(Array.isArray(d.garage)?d.garage:[]).filter(k=>typeof k==='string'&&VEH[k]).slice(0,3);
    conn.lvs={}; if(d.lvs&&typeof d.lvs==='object') for(const k of conn.garage) conn.lvs[k]=clamp((+d.lvs[k])|0,1,5);
    conn.cams={}; if(d.cams&&typeof d.cams==='object') for(const k of conn.garage) if(CAMOS[d.cams[k]]) conn.cams[k]=d.cams[k];
    salaPublicar();
    if(net.inBattle&&battleOn()){ const c=joinBattle(conn,n); conn.send({...net.startMsg,side:c.team,sw:c.team^(net.o|0)}); }
    else if(state==='summary'){ conn.send(lobbyInfo()); }
    else hostLobby();
    return;
  }
  const c=conn.crew; if(!c||!conn.ready) return;
  if(d.t==='sp'){
    if(!battleOn()) return;
    if(c.tank&&!c.tank.dead){ const t=c.tank; if(t.net) return; t.net=true; t.tgt=null; t.name=c.name; t.target=null;
      conn.send({t:'ok',id:t.id,key:t.key,x:t.pos.x,z:t.pos.z,h:t.heading,label:'tu tanque, que manejaba la IA'}); return; }
    const pts0=spawnPoints(c.team);
    if(!VEH[d.key]||!c.lineup.includes(d.key)||!available(c,d.key)){ conn.send({t:'no'}); return; }
    const pts=pts0, p=pts[clamp(d.i|0,0,pts.length-1)];
    const t=spawnCrew(c,d.key,p); t.net=true; t.name=c.name;
    conn.send({t:'ok',id:t.id,key:d.key,x:t.pos.x,z:t.pos.z,h:t.heading,label:p.label});
  } else if(d.t==='u'){
    const t=c.tank; if(!t||t.dead) return;
    t.tgt={x:+d.x||0,z:+d.z||0,h:+d.h||0,ty:+d.ty||0,gp:+d.gp||0,spd:+d.spd||0};
    for(let i=0;i<Math.min(6,d.mg|0);i++){ t.mgLock=false; fireMG(t); }
  } else if(d.t==='f'){
    const t=c.tank; if(!t||t.dead||!canFire(t)||!Array.isArray(d.p)||!Array.isArray(d.d)) return;
    t.ammoIdx=clamp(d.a|0,0,t.T.ammo.length-1);
    const mp=new THREE.Vector3(...d.p.map(Number)), dir=new THREE.Vector3(...d.d.map(Number)).normalize();
    if(mp.distanceTo(t.pos)>15) return;
    fireGun(t,{mp,dir});
  } else if(d.t==='sup'){
    const t=c.tank; if(!t||t.dead||!Array.isArray(d.p)) return; const P=new THREE.Vector3(...d.p.map(Number)); if(!isFinite(P.x+P.y+P.z)) return;
    if(d.k==='arty'){ if(!callArtillery(t,P)) tell(t,c.artyCD>0?`Artillería del equipo en espera: ${Math.ceil(c.artyCD)} s`:`Artillería: te faltan ${ARTY_COST-c.sp} puntos`,'var(--paper)'); }
    else if(d.k==='air'){ if(!callAirstrike(t,P)) tell(t,c.airCD>0?`Bombardeo del equipo en espera: ${Math.ceil(c.airCD)} s`:`Ataque aéreo: te faltan ${AIR_COST-c.sp} puntos`,'var(--paper)'); }
    else if(d.k==='nuke'){ if(!callNuke(t)) tell(t,nuke?'Ya hay un ataque nuclear en curso':`Nuke: te faltan ${NUKE_COST-c.sp} puntos`,'var(--paper)'); }
  } else if(d.t==='ping'){
    if(!Array.isArray(d.p)) return; const P=d.p.map(Number); if(!P.every(isFinite)) return; makePing(c.team,P[0],P[1],P[2],d.k,c.name,d.zid,true);
  } else if(d.t==='ext'){ const t=c.tank; if(t&&!t.dead) extinguish(t);
  } else if(d.t==='troops'){ const t=c.tank; if(t&&!t.dead&&!dismount(t)) tell(t,t.T.troops?'Ya bajaste a la infantería':'Este vehículo no lleva tropas','var(--paper)');
  } else if(d.t==='oob'){
    const t=c.tank; if(t&&!t.dead&&!t.a10){ t.a10=true; a10Strike(t); }
  } else if(d.t==='smk'){
    const t=c.tank; if(t&&!t.dead) deploySmoke(t,true);
  } else if(d.t==='rep'||d.t==='crew'){
    const t=c.tank; if(!t||t.dead) return; if(d.t==='rep') startRepair(t); else callCrew(t);
  }
}
// Entrar a una batalla ya empezada sin desequilibrar los equipos:
// 1) si se había desconectado, recupera su mismo lugar (mismo bando, mismos puntos y su tanque si sigue vivo);
// 2) si es nuevo, reemplaza a un bot de su bando (el bot termina su vida y no reaparece); si su bando no tiene bots, va al otro.
function joinBattle(conn,n){
  const back=crews.find(x=>!x.peer&&!x.isPlayer&&x.rejoin&&x.rejoin===n);
  if(back){ back.peer=conn.peer; back.name=n; back.rejoin=null; back.out=false; conn.crew=back; conn.side=back.team;
    if(back.tank&&!back.tank.dead) back.tank.name=n;
    feed(`${n} volvió a la batalla`,'var(--ally)'); return back; }
  const bots=tm=>crews.filter(x=>x.team===tm&&!x.out&&!x.isPlayer&&!x.peer&&!x.wasHuman&&!x.rejoin&&!x.lineup.every(k=>VEH[k]&&VEH[k].static));
  const c=remoteCrew(conn), alive=tm=>crews.filter(x=>x.team===tm&&!x.out&&!x.lineup.every(k=>VEH[k]&&VEH[k].static)).length;
  if(net.mode==='vs'){ const o=1-c.team; if(!bots(c.team).length&&bots(o).length||!net.quick&&alive(c.team)>alive(o)&&bots(o).length){ c.team=o; conn.side=o; } }
  const B=bots(c.team).sort((a,b)=>((a.tank&&!a.tank.dead)?1:0)-((b.tank&&!b.tank.dead)?1:0)||a.score-b.score)[0];
  if(B){ B.out=true; feed(`${n} entra a la batalla y reemplaza a ${B.name}`,'var(--ally)'); } else feed(`${n} se unió a la batalla`,'var(--ally)');
  crews.splice(1,0,c); return c;
}
function hostDrop(conn){
  const i=net.conns.indexOf(conn); if(i<0) return; net.conns.splice(i,1); salaPublicar();
  const c=conn.crew;
  if(c){ c.peer=null; c.rejoin=conn.name; c.name=conn.name+' (IA)'; if(c.tank){ c.tank.net=false; c.tank.name=c.name; c.tank.tgt=null; } else c.respawnT=3;
    if(battleOn()) feed(`${conn.name} se desconectó; la IA toma su lugar hasta que vuelva`,'var(--paper)'); }
  if(state==='lobby') hostLobby();
}
// Disparo: el anfitrión avisa a todos (menos al que disparó); el invitado avisa al anfitrión
function netShot(t,mp,dir,F){
  if(net.host) netAll({t:'shot',id:t.id,a:t.ammoIdx,p:[r2(mp.x),r2(mp.y),r2(mp.z)],d:[r3(dir.x),r3(dir.y),r3(dir.z)]},t.crew&&t.crew.peer);
  else if(net.guest&&t===player&&!F) hostSend({t:'f',a:t.ammoIdx,p:[mp.x,mp.y,mp.z],d:[dir.x,dir.y,dir.z]});
}
function netTick(dt){
  net.sendT+=dt;
  if(net.host){
    if(net.sendT<1/15) return; net.sendT=0;
    const tk=tanks.map(t=>{ const r=[t.id,t.key,t.crew?t.crew.nation:t.T.nation,t.team,t.name,r2(t.pos.x),r2(t.pos.z),r3(t.heading),r3(t.turretYaw),r3(t.gunPitch),r2(t.speed),t.dead?(t.rack?2:1):0,t.immuneT>0?1:0,t.spottedT>0?1:0,t.mgCount,t.fireT>0?1:0,t.trackT>0?1:0,t.cid||'base',(t.repairT>0?1:0)|((t.mod.barrel??100)<=0?2:(t.mod.barrel??100)<60?4:0)]; t.mgCount=0; return r; });
    const inf=infantry.map(P=>{ const r=[P.id,KIND_CODE[P.kind]??1,P.team,r2(P.pos.x),r2(P.pos.z),r3(P.heading||0),P.dead?(P.how==='blast'?2:P.how==='crush'?3:1):0,Math.round((P.spd||0)*10)/10,P.pose|0,P.shotP?[r2(P.shotP.x),r2(P.shotP.y),r2(P.shotP.z)]:0]; P.shotP=null; return r; });
    const tr=traffic.map(C=>[C.id,r2(C.x),r2(C.z),r3(C.h),C.state,C.ci]), pl=civPlanes.map(q=>[q.id,r2(q.pos.x),r2(q.pos.y),r2(q.pos.z),r3(q.yaw),r3(q.pitch),q.state]);
    const base={t:'s',tk,inf,tr,pl,z:zones.map(Z=>[Math.round(Z.cap),Z.owner]),k:[r2(tickets[0]),r2(tickets[1])]};
    net.sbT=(net.sbT||0)-1/15; if(net.sbT<=0){ net.sbT=1; base.sb=crews.map(c=>[c.name,c.team,c.kills|0,c.assists|0,c.deaths|0,c.caps|0,c.score|0,c.tank&&!c.tank.dead?c.tank.key:0,c.tank&&!c.tank.dead?1:0]); }
    for(const conn of net.conns){ if(!conn.ready||!conn.open||!conn.crew) continue; const c=conn.crew, t=c.tank;
      const me={sp:c.sp,uses:c.uses,spawns:c.spawns,ac:r2(c.artyCD),aic:r2(c.airCD)};
      if(t) Object.assign(me,{id:t.id,crew:t.crewM.map(m=>[m.seat,Math.round(m.hp),m.alive?1:0]),eng:Math.round(t.mod.engine),br:Math.round(t.mod.breech),bl:Math.round(t.mod.barrel??100),th:t.trkHP?t.trkHP.map(Math.round):[100,100],eh:t.engN|0,tm:Math.round(t.mod.trans),tr:r2(t.trackT),et:r2(t.engT),bt:r2(t.breechT),ft:r2(t.fireT),rp:r2(t.repairT||0),rpm:r2(t.repairMax||1),ex:t.ext|0,cr:r2(t.crT||0)});
      conn.send({...base,me}); }
  } else if(net.guest){
    if(net.sendT<1/20) return; net.sendT=0;
    if(player&&!player.dead){ const p=player; hostSend({t:'u',x:r2(p.pos.x),z:r2(p.pos.z),h:r3(p.heading),ty:r3(p.turretYaw),gp:r3(p.gunPitch),spd:r2(p.speed),mg:p.mgCount}); p.mgCount=0; }
  }
}
// Movimiento suave de los tanques que maneja otra PC
function netLerp(t,dt){
  const g=t.tgt; if(!g) return; const k=Math.min(1,dt*12);
  g.x+=Math.sin(g.h)*g.spd*dt; g.z+=Math.cos(g.h)*g.spd*dt;
  const ox=t.pos.x, oz=t.pos.z;
  if(Math.hypot(g.x-t.pos.x,g.z-t.pos.z)>25){ t.pos.x=g.x; t.pos.z=g.z; } else { t.pos.x+=(g.x-t.pos.x)*k; t.pos.z+=(g.z-t.pos.z)*k; }
  t.heading=wrap(t.heading+wrap(g.h-t.heading)*k); t.turretYaw=wrap(t.turretYaw+wrap(g.ty-t.turretYaw)*k); t.gunPitch+=(g.gp-t.gunPitch)*k; t.speed=g.spd;
  t.turret.rotation.y=t.turretYaw; t.gunPivot.rotation.x=-t.gunPitch;
  placeOnGround(t,dt); t.moved=Math.hypot(t.pos.x-ox,t.pos.z-oz)/Math.max(dt,1e-4);
}

// ----- Invitado -----
// onFail: en la partida rápida, si la sala ya no existe se prueba la siguiente
async function netJoin(code,onFail,quick,peerId){
  code=(code||'').toUpperCase(); if(code.length<4){ netErr('Escribí el código de la sala.'); return; }
  try{ await loadPeer(); }catch(e){ if(quick) jugarSolo('No se pudo cargar la red: jugás con bots.'); else netErr(e.message); return; }
  !quick&&$('onErr')&&($('onErr').textContent='Conectando…');
  const peer=new Peer(undefined,peerOpts()); let opened=false;
  peer.on('connection',c=>{ if(net.host) hostAccept(c); else (net.pend=net.pend||[]).push(c); }); // por si después le toca ser el anfitrión
  peer.on('error',e=>{ if(!net.on||!opened){ try{peer.destroy();}catch(_){} if(onFail){ const f=onFail; onFail=null; f(); return; } if(!onFail&&quick) return; netErr(e.type==='peer-unavailable'?'No existe una sala con ese código, o ya se cerró.':'No se pudo conectar ('+e.type+').'); try{peer.destroy();}catch(_){} } else console.warn(e); });
  peer.on('open',()=>{
    guestConnect(peer,peerId||ROOM_PFX+code.toLowerCase(),code,quick,()=>{ opened=true; });
    if(onFail) setTimeout(()=>{ if(!opened&&onFail){ const f=onFail; onFail=null; try{peer.destroy();}catch(_){} f(); } },9000); // la sala no contesta: la siguiente
  });
}
// Conecta este peer con el anfitrión (al entrar, o con el que lo reemplaza si el anfitrión se va)
function guestConnect(peer,target,code,quick,onOpen){
  const conn=peer.connect(target,{reliable:true,serialization:'json'});
  conn.on('open',()=>{ onOpen&&onOpen(); net.lastT=performance.now(); Object.assign(net,{on:true,host:false,guest:true,peer,hostConn:conn,code,name:myName(),quick:!!quick}); sala.busca=false;
    conn.send({t:'hi',name:net.name,side:net.side?1:0,nation:chosenNation,garage:garageOf(chosenNation),lvs:Object.fromEntries(garageOf(chosenNation).map(k=>[k,tankLv(k)])),cams:PROG.camo||{}});
    if(!battleOn()&&state!=='summary') guestWait(null); });
  conn.on('data',d=>{ try{ guestData(d); }catch(e){ console.error(e); } });
  conn.on('close',()=>{ if(net.guest&&net.hostConn===conn) hostGone(); });
  return conn;
}
// Se fue el anfitrión: si hay datos para seguir, la partida pasa a otro jugador (relevo.js); si no, se corta
function hostGone(){
  if(net.mig&&relevo()) return;
  const q=net.quick; netLeave(true); mainMenu();
  if(q){ banner('El anfitrión se fue','Buscando otra sala…',4); jugarOnline(); } else banner('Se cortó la conexión','El anfitrión cerró la sala o se desconectó',4);
}
function guestWait(L){
  lobbyShell();
  $('panel').innerHTML=`<h1>Sala ${esc(net.code)}</h1><p>Conectado. Esperando que el anfitrión empiece la batalla.</p>
    ${L&&Array.isArray(L.players)?`<h2>Jugadores</h2><p>${plList(L)}</p>`:''}
    ${L&&L.mode==='vs'?`<h2>Tu equipo</h2><div class="hgOpt" style="max-width:420px"><button data-sd="0" class="${!net.side?'sel':''}">Equipo A (con el anfitrión)</button><button data-sd="1" class="${net.side?'sel':''}">Equipo B (contra el anfitrión)</button></div>`:''}
    <button class="go alt" id="lbQuit">Salir de la sala</button>`;
  $('lbQuit').onclick=()=>mainMenu();
  document.querySelectorAll('[data-sd]').forEach(b=>b.onclick=()=>{ net.side=+b.dataset.sd; hostSend({t:'side',s:net.side}); });
}
const netTanks=new Map(), netInf=new Map();
function guestStart(m){
  if(!WORLDS[m.map]||!NATIONS[m.ally]||!NATIONS[m.foe]) return;
  const sw=(m.sw!=null?m.sw:m.side)?1:0; // sw: mi bando en el mapa original; side: mi bando para el anfitrión actual
  if(net.startMsg&&net.startMsg.seed===m.seed&&builtKey===m.map&&['play','deploy','paused','end','brief'].includes(state)){ // el anfitrión nuevo sigue la misma batalla
    net.swap=m.side?1:0; net.startMsg=m; if(player&&!player.dead) hostSend({t:'sp',key:player.key,i:0}); return; }
  net.swap=m.side?1:0; net.startMsg=m;
  curEra=WORLDS[m.map].era||5; applyEraNations(curEra); tut=null; curSpecial=null; spectating=false; allyNation=sw?m.foe:m.ally; foeNation=sw?m.ally:m.foe; builtKey=m.map; battleBR=+m.br||1; allyMixed=false; summary._done=false; menuScreen='home';
  netInf.clear(); withSeed(m.seed,()=>{ clearBattle(); assignSpawns(m.ally); if(sw){ const a=W.sp[0]; W.sp[0]=W.sp[1]; W.sp[1]=a; if(W.infSp){ const b=W.infSp[0]; W.infSp[0]=W.infSp[1]; W.infSp[1]=b; } } }); applyWeather(m.wx||'dia'); $('feed').innerHTML=''; netTanks.clear();
  const gn=eraNations(curEra).includes(chosenNation)?chosenNation:allyNation;
  playerCrew=newCrew(net.name,0,gn,true); if(!playerCrew.lineup.length) playerCrew.lineup=vehTreeE(gn,curEra).slice(0,2); crews=[playerCrew]; now=0; noises.length=0; updateHud();
  initAudio(); openBriefing(false);
}
function netKill(t,rack){
  t.dead=true; t.hp=0; t.speed=0; t.rack=rack; t.mat.color.setHex(0x2e2a26); t.deadT=0; t.popV=rack?rand(6,9):0; groundMark(t.pos,t.T.m.L*.7);
  if(t.trk) t.trk.mats.forEach(m=>m.color.setHex(0x555555)); if(t.ant) t.ant.visible=false; if(t.mud) t.mud.color.setHex(0x2e2a26);
  boom(distVol(t.pos,.9),1.6,600);
  for(let i=0;i<6;i++) puff(t.pos.clone().add(new THREE.Vector3(rand(-2,2),rand(1,3),rand(-2,2))),0xff8a30,rand(3,6),.5,1,1,true);
  if(t===player){ playerDeadT=3.5; banner('Vehículo destruido',canSpawn(playerCrew)?'Vas a poder elegir el siguiente':'No te quedan vehículos o puntos para reaparecer',3.5); }
  updateHud();
}
function guestSnap(m){
  if(!['play','deploy','end','paused','brief'].includes(state)) return;
  if(m.sb) net.sb=m.sb;
  const seen=new Set();
  for(const r of m.tk||[]){
    const [id,key,nat,team,name,x,z,h,ty,gp,spd,dead,imm,spot,mg,fire,trk,cid,fl]=r; if(!VEH[key]) continue; seen.add(id);
    if(player&&player.id===id){ if(dead&&!player.dead) netKill(player,dead===2); continue; }
    let t=netTanks.get(id);
    if(!t){ if(dead) continue; t=makeTank({name:String(name).slice(0,24),team:(team?1:0)^net.swap,nation:NATIONS[nat]?nat:VEH[key].nation,isPlayer:false,cams:{[key]:CAMOS[cid]?cid:'base'}},key,x,z,h,id); t.net=true; t.turretYaw=ty; netTanks.set(id,t); }
    t.tgt={x,z,h,ty,gp,spd}; t.immuneT=imm?1:0; t.fireT=fire?1:0; t.trackT=trk?1:0; t.repairT=(fl&1)?1:0; { const nb=(fl&2)?0:(fl&4)?50:100; if(nb!==(t.mod.barrel??100)){ t.mod.barrel=nb; setBarrelLook(t); } } if(spot) t.spottedT=Math.max(t.spottedT,.5);
    if(dead&&!t.dead) netKill(t,dead===2);
    for(let i=0;i<Math.min(6,mg|0);i++){ t.mgLock=false; fireMG(t); }
  }
  for(const [id,t] of netTanks) if(!seen.has(id)){ removeTank(t); netTanks.delete(id); }
  if(Array.isArray(m.inf)){ const iseen=new Set();
    for(const r of m.inf){ const [id,kc,team,x,z,h,dead,spd,pose,shot]=r; if(!isFinite(x)||!isFinite(z)) continue; iseen.add(id); let P=netInf.get(id);
      if(!P){ if(dead) continue; const kind=CODE_KIND[kc]||'rifle'; P=makePerson(kind,kind==='civ'||kind==='dog'?-1:((team?1:0)^net.swap),x,z); P.id=id; netInf.set(id,P); }
      P.tgt={x,z,h,spd:+spd||0,pose:pose|0}; if(dead&&!P.dead){ P.dead=true; P.deadT=0; infDeathFx(P,dead===2?'blast':dead===3?'crush':'shot'); }
      if(Array.isArray(shot)&&!P.dead){ const o=infEye(P), a=new THREE.Vector3(+shot[0],+shot[1],+shot[2]); tracer(o,a,P.team===0?0xffd080:0xff9a70); infAmbNote(o); boom(distVol(o,.06),.05,3000); } }
    for(const [id,P] of netInf) if(!iseen.has(id)){ removeInf(P); netInf.delete(id); } }
  if(Array.isArray(m.tr)){ const seen2=new Set();
    for(const [id,x,z,h,st,ci] of m.tr){ seen2.add(id); let C=traffic.find(c=>c.id===id);
      if(!C){ const g=carMesh(ci|0); scene.add(g); C={id,g,x,z,h,state:0,ci,V:g.userData.V,len:g.userData.len}; traffic.push(C); }
      C.tx=x; C.tz=z; C.th=h; if(st!==C.state){ if(st===2) vAbandonLook(C); if(st===3) vWreckLook(C); C.state=st; } }
    for(let i2=traffic.length-1;i2>=0;i2--) if(!seen2.has(traffic[i2].id)){ scene.remove(traffic[i2].g); traffic.splice(i2,1); } }
  if(Array.isArray(m.pl)){ const seen3=new Set();
    for(const [id,x,y,z,yaw,pitch,st] of m.pl){ seen3.add(id); let q=civPlanes.find(c=>c.id===id);
      if(!q){ const mm=airlinerMesh(); scene.add(mm.g); q={id,g:mm.g,hit:mm.hit,pos:new THREE.Vector3(x,y,z),yaw,pitch,state:st}; mm.hit.userData.plane=q; civHits.push(mm.hit); civPlanes.push(q); q.snd=movingLoop('flyover',2.4,{rate:1.6,start:1,ref:120,lp:5000}); }
      q.tp=new THREE.Vector3(x,y,z); q.tyaw=yaw; q.tpitch=pitch; if(st===3&&q.state!==3){ blast(q.tp.clone(),2.2); } q.state=st; }
    for(const q of civPlanes.slice()) if(!seen3.has(q.id)) removePlane(q); }
  (m.z||[]).forEach((v,i)=>{ const Z=zones[i]; if(!Z) return; const was=Z.owner, sg=net.swap?-1:1; Z.cap=v[0]*sg; Z.owner=v[1]*sg;
    if(was!==Z.owner) Z.mat.color.set(Z.owner===1?0x8fd16a:Z.owner===-1?0xff5a3c:0xefe7d2);
    const el=$('zb'+Z.id); if(el){const f=el.firstChild; f.style.height=Math.abs(Z.cap)+'%'; f.style.background=Z.cap>=0?'var(--ally)':'var(--enemy)'; el.style.outlineColor=Z.owner===1?'var(--ally)':Z.owner===-1?'var(--enemy)':'var(--paper)';} });
  if(m.k){ tickets=net.swap?[+m.k[1],+m.k[0]]:[+m.k[0],+m.k[1]]; $('tkA').textContent=Math.max(0,Math.ceil(tickets[0])); $('tkE').textContent=Math.max(0,Math.ceil(tickets[1])); }
  const me=m.me; if(me&&playerCrew){
    playerCrew.sp=me.sp|0; playerCrew.uses=me.uses||{}; playerCrew.spawns=me.spawns|0; playerCrew.artyCD=+me.ac||0; playerCrew.airCD=+me.aic||0; $('spT').textContent=playerCrew.sp;
    if(player&&me.id===player.id&&me.crew){ const before=player.crewM.reduce((a,x)=>a+Math.max(0,x.hp),0);
      player.crewM=me.crew.map(([seat,hp,al])=>({seat,hp,alive:!!al})); player.mod.engine=me.eng; player.mod.breech=me.br; player.mod.barrel=me.bl??100; if(Array.isArray(me.th)) player.trkHP=me.th.map(Number); player.engN=me.eh|0; setBarrelLook(player); player.mod.trans=me.tm??100;
      player.trackT=me.tr; player.engT=me.et; player.breechT=me.bt; player.fireT=me.ft; player.repairT=+me.rp||0; player.repairMax=+me.rpm||1; player.ext=me.ex|0; player.crT=+me.cr||0;
      const after=player.crewM.reduce((a,x)=>a+Math.max(0,x.hp),0); player.hp=player.T.hp*after/(player.crewM.length*100);
      if(after<before-1){ vig=.6; $('vig').style.opacity=.9; } }
    if(state==='deploy') refreshDeploy();
  }
}
function guestData(d){
  if(!d||typeof d!=='object') return;
  net.lastT=performance.now(); if(d.t==='p') return;
  switch(d.t){
    case 'lobby': if(state==='lobby') guestWait(d); break;
    case 'full': { const q=net.quick; netLeave(); if(q){ mainMenu(); jugarOnline(); } else netErr('La sala está llena.'); } break;
    case 'start': guestStart(d); break;
    case 'mig': net.mig=d; break;
    case 's': guestSnap(d); break;
    case 'ok': {
      if(!VEH[d.key]) return;
      if(player&&player.id===d.id&&!player.dead){ playerCrew.tank=player; if(state==='deploy'){ state='play'; $('overlay').style.display='none'; document.body.classList.remove('deploy'); } break; } // el anfitrión nuevo le devolvió su tanque
      if(player&&player.dead){ removeTank(player); } { const dup=netTanks.get(d.id); if(dup){ removeTank(dup); netTanks.delete(d.id); } }
      player=makeTank(playerCrew,d.key,+d.x,+d.z,+d.h,d.id); playerCrew.tank=player;
      camYaw=player.heading; camPitch=.1; camDist=14; state='play'; syncIntro(); setTimeout(()=>radio('¡Tripulación lista! ¡Adelante!',2),600);
      $('overlay').style.display='none'; document.body.classList.remove('deploy');
      banner(player.T.label,`Desplegado en ${String(d.label||'').toLowerCase()}`,2.5); updateHud(); break; }
    case 'no': renderDeploy(); break;
    case 'fd': { let col=String(d.color).slice(0,24); if(net.swap) col=col==='var(--ally)'?'var(--enemy)':col==='var(--enemy)'?'var(--ally)':col; feed(String(d.txt).slice(0,160),col,true); break; }
    case 'hm': hitMsg(String(d.txt).slice(0,120),String(d.color).slice(0,24)); break;
    case 'hf': hitFrom(+d.x,+d.z,+d.s||1); break;
    case 'a10': { const t=player&&player.id===d.id?player:netTanks.get(d.id); if(t&&!t.dead){ t.a10=true; a10Strike(t); } break; }
    case 'sup': supFx(d); break;
    case 'ping': { const P=(d.p||[]).map(Number); if(P.length===3&&P.every(isFinite)) makePing(0,P[0],P[1],P[2],d.k,String(d.name||'').slice(0,24),d.zid); break; }
    case 'aw': showAward(String(d.n).slice(0,40),d.s|0); break;
    case 'rk': { if(!Array.isArray(d.p)||!Array.isArray(d.v)) break; const o=new THREE.Vector3(...d.p.map(Number)), v=new THREE.Vector3(...d.v.map(Number)); const mm=new THREE.Mesh(shellGeo,d.m?SHELL_MAT.he:SHELL_MAT.heat); mm.position.copy(o); scene.add(mm);
      shells.push({p:o.clone(),v,owner:{team:-9},m:mm,travel:0,life:d.m?14:4,A:d.m?MORTAR:ROCKET,rocket:!d.m,fx:true}); for(let k=0;k<4;k++) puff(o.clone().addScaledVector(v.clone().normalize(),-k*.6),0xcfc8b8,rand(1.5,2.5),1.2,.4,.6); boom(distVol(o,.4),.5,1500); break; }
    case 'smk': addSmoke(+d.x||0,+d.y||0,+d.z||0); break;
    case 'bd': { const b=buildings[d.i|0]; if(b) damageBuilding(b,+d.d||0,true); break; }
    case 'shot': { const t=netTanks.get(d.id); if(!t||!Array.isArray(d.p)||!Array.isArray(d.d)) return;
      t.ammoIdx=clamp(d.a|0,0,t.T.ammo.length-1); t.root.updateMatrixWorld(true);
      fireGun(t,{mp:new THREE.Vector3(...d.p.map(Number)),dir:new THREE.Vector3(...d.d.map(Number)).normalize()}); break; }
    case 'end': {
      crews=(d.crews||[]).map(c=>({name:String(c.name).slice(0,24),team:(c.team?1:0)^net.swap,uses:Object.fromEntries(Object.entries(c.uses||{}).filter(([k])=>VEH[k])),st:c.st&&typeof c.st==='object'?{side:c.st.side|0,inf:c.st.inf|0,smoke:c.st.smoke|0}:{},tk:c.tk&&typeof c.tk==='object'?c.tk:{},kills:c.kills|0,assists:c.assists|0,deaths:c.deaths|0,caps:c.caps|0,score:c.score|0,human:!!c.h,isPlayer:c.peer===net.peer.id}));
      if(document.pointerLockElement) document.exitPointerLock();
      finish((d.w?1:0)^net.swap); break; }
  }
}
// Latido: si alguien deja de responder 10 s, se lo da por desconectado
setInterval(()=>{ if(!net.on) return; const T=performance.now();
  if(net.host){ for(const c of net.conns.slice()){ if(c.open) c.send({t:'p'}); if(c.lastT&&T-c.lastT>10000){ try{c.close();}catch(e){} hostDrop(c); } } }
  else if(net.guest&&net.hostConn){ if(net.hostConn.open) hostSend({t:'p'}); if(net.lastT&&T-net.lastT>10000){ const c=net.hostConn; net.hostConn=null; try{c.close();}catch(e){} hostGone(); } }
},2000);
// Apoyos online: el anfitrión los ejecuta y avisa a todos para que vean la artillería, los aviones y la nuke
function supNet(k,by,p){ if(!net.host||!p) return; netAll({t:'sup',k,x:p.x,y:p.y,z:p.z,team:by.team,name:by.name,bx:by.pos?by.pos.x:0,bz:by.pos?by.pos.z:0}); }
function supFx(d){
  const P=new THREE.Vector3(+d.x||0,+d.y||0,+d.z||0), tm=(d.team?1:0)^net.swap;
  const by={team:tm,name:String(d.name||'').slice(0,24),pos:new THREE.Vector3(+d.bx||0,0,+d.bz||0),isPlayer:false,crew:{sp:1e9,artyCD:0,airCD:0,isPlayer:false}};
  if(d.k==='arty') callArtillery(by,P); else if(d.k==='air') callAirstrike(by,P); else if(d.k==='nuke'){ if(!nuke) callNuke(by); }
}
function netLeave(silent){
  const p=net.peer;
  if(net.host){ netAll({t:'bye'}); salaCerrar(); }
  Object.assign(net,{on:false,host:false,guest:false,peer:null,conns:[],hostConn:null,inBattle:false,startMsg:null,quick:false,mig:null,pend:null,o:0});
  netTanks.clear();
  if(p) setTimeout(()=>{ try{p.destroy();}catch(e){} },300);
}
