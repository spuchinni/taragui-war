/* ---------- Relevo del anfitrión: si el que tiene la partida se va, otro jugador la sigue desde donde estaba ----------
   Cada 2 s el anfitrión manda a los invitados lo necesario para seguir ('mig'): orden de reemplazo, tripulaciones (puntos, bajas,
   tanques usados) y el estado de cada tanque vivo (tripulantes, módulos). Las posiciones ya las tienen por las instantáneas.
   Cuando se corta: el primero de la lista pasa a ser el anfitrión con su mismo peer; los demás se conectan a él y recuperan su lugar
   (joinBattle los reconoce por el nombre). Mientras vuelven, la IA maneja sus tanques.
   Marco de equipos: cada anfitrión numera los bandos desde el suyo. net.o = cuánto difiere su numeración de la del mapa original. */
function migTick(){
  if(!net.on||!net.host||!net.conns.length) return;
  const sum=state==='summary', inB=battleOn()&&net.startMsg;
  if(!sum&&!inB) return;
  const succ=net.conns.filter(c=>c.ready&&c.open&&(sum||c.crew)).map(c=>c.peer);
  const m={t:'mig',succ,o:net.o|0,host:net.name,sum:sum?1:0};
  if(inB&&!sum){ const S=net.startMsg; Object.assign(m,{seed:S.seed,map:S.map,ally:S.ally,foe:S.foe,br:S.br,wx:S.wx,
    cr:crews.map(c=>[c.name,c.team,c.nation,c.lineup,c.uses,c.spawns|0,c.sp|0,c.kills|0,c.assists|0,c.deaths|0,c.caps|0,c.score|0,c.isPlayer?net.peer.id:(c.peer||c.rejoin&&('r:'+c.rejoin)||0),c.tank&&!c.tank.dead?c.tank.id:0,c.out?1:0,c.isPlayer||c.peer||c.rejoin?1:0,r2(c.respawnT||0),c.st,c.tk]),
    tk:tanks.filter(t=>!t.dead&&t.crewM).map(t=>[t.id,r2(t.hp),t.crewM.map(x=>[x.seat,Math.round(x.hp),x.alive?1:0]),t.mod,t.trkHP||null])}); }
  for(const c of net.conns) if(c.ready&&c.open) c.send(m);
}
setInterval(migTick,2000);
// Devuelve false si no se puede seguir (no hay datos): entonces se corta como antes
function relevo(){
  const M=net.mig, me=net.peer&&net.peer.id; if(!M||!me||!Array.isArray(M.succ)||!M.succ.length) return false;
  net.mig=null; net.hostConn=null;
  banner('El anfitrión se fue','Pasando la partida a otro jugador…',3);
  const prueba=i=>{
    if(!net.on) return;
    if(i>=M.succ.length){ const q=net.quick; netLeave(true); mainMenu(); if(q){ banner('Se cortó la partida','Buscando otra sala…',4); jugarOnline(); } else banner('Se cortó la conexión','El anfitrión cerró la sala o se desconectó',4); return; }
    if(M.succ[i]===me){ asumir(M); return; }
    let ok=false; const c=guestConnect(net.peer,M.succ[i],net.code,net.quick,()=>{ ok=true; });
    setTimeout(()=>{ if(!ok){ try{c.close();}catch(e){} prueba(i+1); } },i===0?7000:5000);
  };
  setTimeout(()=>prueba(0),300);
  return true;
}
// Este invitado pasa a ser el anfitrión
function asumir(M){
  const S=net.swap|0, me=net.peer.id;
  Object.assign(net,{host:true,guest:false,hostConn:null,conns:[],inBattle:false,o:(S^(M.o|0)),name:net.name});
  net.seq=Math.max(net.seq,...tanks.map(t=>t.id|0),...infantry.map(P=>P.id|0))+1000; // que los tanques nuevos no repitan número
  const sum=M.sum||!M.cr||!['play','deploy','paused','end','brief'].includes(state);
  if(!sum){
    net.startMsg={t:'start',seed:M.seed,map:M.map,ally:M.ally,foe:M.foe,br:M.br,wx:M.wx}; net.seed=M.seed; net.inBattle=true;
    const tkD=new Map((M.tk||[]).map(r=>[r[0],r]));
    const pr=crews.find(c=>c.isPlayer)||playerCrew; crews=[];
    for(const r of M.cr){ const [name,team,nation,lineup,uses,spawns,sp,kills,assists,deaths,caps,score,peer,tid,out,human,respawnT,st,tk]=r;
      const tm=(team?1:0)^S, mine=peer===me;
      if(!NATIONS[nation]) continue;
      const c=mine&&pr?pr:newCrew(String(name).slice(0,24),tm,nation,false);
      if(!mine){ c.lineup=(Array.isArray(lineup)?lineup:[]).filter(k=>VEH[k]); if(!c.lineup.length) c.lineup=NATIONS[nation].lineup.slice(); }
      Object.assign(c,{uses:uses||{},spawns,sp,kills,assists,deaths,caps,score,out:!!out,st:st||c.st,tk:tk||c.tk});
      if(human&&!mine){ const base=String(name).replace(/ \(IA\)$/,''); c.peer=null; c.rejoin=base; c.name=base+' (IA)'; }
      const t=tid?(player&&player.id===tid?player:netTanks.get(tid)):null;
      if(t&&!t.dead){ c.tank=t; t.crew=c; t.name=c.name; t.team=tm; t.tgt=null;
        if(!mine){ t.isPlayer=false; t.net=false; } const d=tkD.get(tid);
        if(d){ t.hp=+d[1]||t.hp; if(Array.isArray(d[2])) t.crewM=d[2].map(([seat,hp,al])=>({seat,hp,alive:!!al})); if(d[3]&&typeof d[3]==='object') Object.assign(t.mod,d[3]); if(Array.isArray(d[4])) t.trkHP=d[4].map(Number); } }
      else { c.tank=null; c.respawnT=Math.max(2,+respawnT||3); }
      crews.push(c); }
    if(!crews.includes(pr)&&pr) crews.unshift(pr);
    netTanks.clear();
    for(const P of infantry) P.tgt=null; // la infantería sigue con la IA de esta PC
    if(traffic.length){ for(const C of traffic) scene.remove(C.g); traffic.length=0; if(RULE().civ) spawnTraffic(W.city?16:streetSegs.length>20?8:0); }
    feed(`${M.host||'El anfitrión'} se fue: la partida sigue en la PC de ${net.name}`,'var(--paper)');
  }
  for(const c of net.pend||[]) hostAccept(c); net.pend=null;
  net.peer.off&&net.peer.off('connection'); net.peer.on('connection',hostAccept);
  if(net.quick) salaAbrir();
  if(sum&&state==='summary'){ const b=$('again'); if(b){ b.disabled=false; b.onclick=()=>{ initAudio(); startBattle(false); }; } if($('menuB')) $('menuB').textContent='Cerrar la sala'; salaSeguir(); }
  else if(sum){ startBattle(false); }
  banner('Ahora sos el anfitrión','La partida sigue en tu PC: no cierres esta pestaña',3.5);
}
