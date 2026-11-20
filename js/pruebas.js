// 🧪 Modo de pruebas (pedido de Sebastián: "probar todo sin tener que salir a partidas"). Solo para el superusuario (su cuenta, superUser.on).
// Desde el menú: elegir cualquier tanque de cualquier época (también los especiales), cualquier mapa (también los ocultos), el clima, los blancos
// (ninguno, quietos, que se mueven sin tirar o que pelean) y trucos (no se rompe, munición infinita, recarga al instante, apoyos gratis).
// Adentro: barra arriba a la izquierda para cambiar de tanque, poner un blanco adelante, cambiar el clima, los trucos y la cámara libre (L).
// No da puntos, PI, Yaguaretés ni batallas: usa el modo del campo de tiro (tut.range) que ya no da premios ni progreso.
(function(){
  const SU=()=>!!(window.superUser&&superUser.on);
  const LSg=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } }, LSs=(k,v)=>{ try{ localStorage.setItem(k,v); }catch(e){} };
  const CFG=Object.assign({tank:'m4a1',map:'alamein',wx:'dia',tgt:'quietos',tgtK:'var',god:1,ammo:1,rel:0,sup:1,auto:0,side:'foe',addK:'var',addM:'combate',open:1},(()=>{ try{ return JSON.parse(LSg('tw2_prb')||'{}'); }catch(e){ return {}; } })());
  const save=()=>LSs('tw2_prb',JSON.stringify(CFG));
  const st=document.createElement('style'); st.textContent=`
    #prbBox{position:fixed;inset:0;z-index:70;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72)}
    #prbBox .card{width:min(620px,96vw);max-height:92vh;overflow:auto;background:rgba(18,20,24,.97);border:2px solid #7fd0ff;border-radius:14px;padding:14px 18px;color:#fff;font:600 16px 'Saira Condensed',system-ui,sans-serif}
    #prbBox h2{margin:0 0 6px;color:#7fd0ff;text-align:center;font:800 26px 'Saira Condensed',system-ui,sans-serif} #prbBox .s{color:#cfc6b0;text-align:center;margin:0 0 8px;font-size:14px}
    #prbBox label{display:block;margin:8px 0 2px;color:#cfc6b0;font-size:14px} #prbBox select{width:100%;background:#0e0f12;color:#fff;border:1px solid #555;border-radius:6px;padding:5px;font:500 15px system-ui}
    #prbBox .ck{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:8px} #prbBox .ck label{display:flex;gap:6px;align-items:center;margin:0;color:#fff}
    #prbBox .row{display:flex;gap:10px;justify-content:center;margin-top:12px}
    #prbBar{position:fixed;left:8px;top:64px;z-index:40;display:none;flex-direction:column;gap:4px;background:rgba(10,14,18,.82);border:1px solid #7fd0ff;border-radius:8px;padding:6px;font:600 13px 'Saira Condensed',system-ui,sans-serif;color:#fff;max-width:230px}
    #prbBar select,#prbBar button{font:600 13px 'Saira Condensed',system-ui,sans-serif;background:#1c2228;color:#fff;border:1px solid #456;border-radius:5px;padding:3px 5px}
    #prbBar .r{display:flex;gap:4px;flex-wrap:wrap} #prbBar b{color:#7fd0ff} #prbBar button.on{background:#2f6a3a;border-color:#7c7}
    body.prb #tutbox{display:none!important}`;
  document.head.appendChild(st);
  const box=document.createElement('div'); box.id='prbBox'; box.setAttribute('data-notr',''); document.body.appendChild(box);
  const bar=document.createElement('div'); bar.id='prbBar'; bar.setAttribute('data-notr',''); document.body.appendChild(bar);
  const ERA_N={1:'1ª Guerra',2:'Entreguerras',3:'2ª Guerra',4:'Posguerra',5:'Guerra Fría'};
  const tankList=()=>Object.keys(VEH).filter(k=>{ const V=VEH[k]; return V&&!V.support&&!V.static&&V.label; })
    .sort((a,b)=>(eraOf(a)-eraOf(b))||String(VEH[a].nation).localeCompare(VEH[b].nation)||((VEH[a].br||0)-(VEH[b].br||0)));
  const tankOpts=sel=>{ let h='', g=''; for(const k of tankList()){ const e=eraOf(k), n=VEH[k].nation, gg=`${ERA_N[e]||e} · ${(NATIONS[n]&&NATIONS[n].label)||n}`; if(gg!==g){ if(g) h+='</optgroup>'; h+=`<optgroup label="${gg}">`; g=gg; }
      h+=`<option value="${k}"${k===sel?' selected':''}>${VEH[k].label}${VEH[k].special?' ★':''}</option>`; } return h+'</optgroup>'; };
  const mapOpts=sel=>Object.keys(WORLDS).filter(k=>WORLDS[k]&&WORLDS[k].label).sort((a,b)=>((WORLDS[a].era||5)-(WORLDS[b].era||5))||WORLDS[a].label.localeCompare(WORLDS[b].label))
    .map(k=>`<option value="${k}"${k===sel?' selected':''}>[${ERA_N[WORLDS[k].era||5]||''}] ${WORLDS[k].label}</option>`).join('');
  const wxOpts=sel=>Object.keys(WXS).map(k=>`<option value="${k}"${k===sel?' selected':''}>${WXS[k].n||k}</option>`).join('');
  const TGT=[['ninguno','Ninguno: recorrer el mapa solo'],['quietos','Quietos (como el campo de tiro)'],['mueven','Se mueven, sin tirar'],['combate','Pelean de verdad']];
  function panel(){ if(!SU()) return;
    box.innerHTML=`<div class="card"><h2>🧪 Modo de pruebas</h2><p class="s">Solo para vos. No da puntos, PI, Yaguaretés ni cuenta como batalla.</p>
      <label>Tanque</label><select id="pT">${tankOpts(CFG.tank)}</select>
      <label>Mapa</label><select id="pM">${mapOpts(CFG.map)}</select>
      <label>Clima</label><select id="pW">${wxOpts(CFG.wx)}</select>
      <label>Blancos</label><select id="pG">${TGT.map(([v,t])=>`<option value="${v}"${v===CFG.tgt?' selected':''}>${t}</option>`).join('')}</select>
      <label>Tanque de los blancos</label><select id="pK"><option value="var">Variados (de la época del mapa, bando contrario)</option>${tankOpts(CFG.tgtK)}</select>
      <div class="ck"><label><input type="checkbox" id="cG" ${CFG.god?'checked':''}> No se rompe</label><label><input type="checkbox" id="cA" ${CFG.ammo?'checked':''}> Munición infinita</label>
        <label><input type="checkbox" id="cR" ${CFG.rel?'checked':''}> Recarga al instante</label><label><input type="checkbox" id="cS" ${CFG.sup?'checked':''}> Apoyos gratis</label></div>
      <p class="s" style="margin-top:8px">Tu tanque sale al nivel máximo con todo desbloqueado · Esc = pausa con el menú y la barra de pruebas (cambiar tanque, mapa, poner blancos, clima, trucos) · L = cámara libre (W A S D, Q/E, Mayús rápido, mouse mira).</p>
      <div class="row"><button class="go" id="pGo">Entrar</button><button class="go alt" id="pX">Cerrar</button></div></div>`;
    box.style.display='flex'; const v=id=>box.querySelector(id).value, c=id=>box.querySelector(id).checked?1:0;
    box.querySelector('#pK').value=CFG.tgtK in VEH?CFG.tgtK:'var';
    box.querySelector('#pX').onclick=()=>{ box.style.display='none'; };
    box.querySelector('#pGo').onclick=()=>{ Object.assign(CFG,{tank:v('#pT'),map:v('#pM'),wx:v('#pW'),tgt:v('#pG'),tgtK:v('#pK'),god:c('#cG'),ammo:c('#cA'),rel:c('#cR'),sup:c('#cS')}); save(); box.style.display='none'; start(); };
  }
  window.pruebas=panel;
  let prevEra=null;
  function start(){ const key=CFG.tank; if(!VEH[key]) return; if(!PROG) loadProg(); prevEra=curEra;
    chosenNation=VEH[key].nation; battleBR=null; startBattle(false,CFG.map,null,true); battleBR=null;
    try{ applyWeather(CFG.wx); }catch(e){}
    tut={range:true,prb:true,key,d:[],pd:[],step:0,okT:0,start:null,shots:0,hits:0};
    infantry.slice().forEach(removeInf); infantry.length=0; tanks.slice().forEach(removeTank);
    crews=[playerCrew]; playerCrew.sp=9999; playerCrew.lineup=[key];
    const sp=W.sp&&W.sp[0]&&W.sp[0][0]||{x:0,z:0}, fx=-sp.x, fz=-sp.z, l=Math.hypot(fx,fz)||1; tut.sp=sp; tut.u=[fx/l,fz/l];
    player=spawnCrew(playerCrew,key,sp); tut.start=player.pos.clone();
    if(CFG.tgt!=='ninguno') [150,260,400,550,750].forEach((d,i)=>addTarget(sp.x+tut.u[0]*d+(-tut.u[1])*(i%2?-1:1)*(20+i*10),sp.z+tut.u[1]*d+tut.u[0]*(i%2?-1:1)*(20+i*10)));
    camYaw=player.heading; camPitch=.02; camDist=14; state='play'; $('overlay').style.display='none'; document.body.classList.remove('deploy','menu','home'); document.body.classList.add('tut','prb');
    lock(); updateHud(); banner(player.T.label,'🧪 Modo de pruebas · Esc = pausa y menú (cambiar mapa)',3); paintBar(); }
  function tgtKey(){ if(CFG.tgtK&&VEH[CFG.tgtK]) return CFG.tgtK; const e=W.era||3, side=(n)=>['de','it','jp'].includes(n);
    const myAx=side(VEH[tut.key].nation), nats=Object.keys(NATIONS).filter(n=>side(n)!==myAx); let L=[]; for(const n of nats) try{ L=L.concat(vehTreeE(n,e)); }catch(e){}
    if(!L.length) L=tankList().filter(k=>eraOf(k)===e); return L[(Math.random()*L.length)|0]||tut.key; }
  function addTarget(x,z,k,noPush){ k=k||tgtKey(); const n=VEH[k].nation, c=newCrew(`Blanco · ${VEH[k].label}`,1,n,false); c.out=CFG.tgt==='quietos'; crews.push(c);
    const t=spawnCrew(c,k,{label:'',x,z}); t.dummy=CFG.tgt==='quietos'; t.prbT=1; t.immuneT=0; t.heading=Math.random()*6.28; if(!noPush) tut.pd.push({t,x,z,k}); return t; }
  // ---- tu tanque en pruebas siempre al máximo nivel (5) con todo desbloqueado: lanzahumos, reparación rápida, munición mejorada,
  // control de tiro y las 3 municiones (pedido de Sebastián). tankLv es const: mientras se arma el tanque se le presta experiencia
  // de sobra en una copia de PROG.txp y después se devuelve la original; saveProg no guarda nada en ese momento (el progreso no se toca).
  let maxing=false;
  { const _sc=spawnCrew; spawnCrew=function(c){ if(!(tut&&tut.prb&&c===playerCrew&&PROG)) return _sc.apply(this,arguments);
      const o=PROG.txp, big={}; for(const k in VEH) big[k]=1e7; PROG.txp=big; maxing=true;
      try{ return _sc.apply(this,arguments); } finally{ PROG.txp=o; maxing=false; } }; }
  { const _sp=saveProg; saveProg=function(){ if(maxing) return; return _sp.apply(this,arguments); }; }
  // ---- "No se rompe" de verdad (antes solo ponía immuneT: las esquirlas, el fuego, la ametralladora pesada, los tripulantes expuestos y
  // el cañón se seguían rompiendo, y el tanque titilaba). Ahora se bloquea el daño y cada cuadro se deja todo como nuevo.
  const godOn=t=>tut&&tut.prb&&CFG.god&&t&&t===player;
  function heal(t){ const broke=(t.mod.barrel??100)<100; t.hp=t.T.hp; for(const k in t.mod) t.mod[k]=100; t.trkHP=[100,100]; t.trackT=t.engT=t.breechT=t.fireT=0; t.sinkT=0;
    for(const m of t.crewM){ m.alive=true; m.hp=100; } if(t.immuneT>0&&!t.prbImm) t.immuneT=0;
    if(broke){ try{ setBarrelLook(t); }catch(e){} } }
  { const _d=destroy; destroy=function(t){ if(godOn(t)) return; return _d.apply(this,arguments); }; }
  { const _dm=damage; damage=function(t){ if(godOn(t)) return; return _dm.apply(this,arguments); }; }
  { const _ht=hitTank; hitTank=function(by,hit){ const t=hit&&hit.object&&hit.object.userData.tank; if(godOn(t)){ try{ explode(hit.point,'metal'); }catch(e){} return; } return _ht.apply(this,arguments); }; }
  if(typeof exposedKill==='function'){ const _ek=exposedKill; exposedKill=function(t){ if(godOn(t)) return false; return _ek.apply(this,arguments); }; }
  // ---- nada pasa solo: en pruebas los bots no piden apoyos y capturar un punto no trae refuerzos ni fortificaciones (salvo "Automático") ----
  { const _ca=callArtillery; callArtillery=function(by){ if(tut&&tut.prb&&!CFG.auto&&by&&!by.isPlayer&&!by._prb) return false; return _ca.apply(this,arguments); }; }
  { const _cs=callAirstrike; callAirstrike=function(by){ if(tut&&tut.prb&&!CFG.auto&&by&&!by.isPlayer&&!by._prb) return false; return _cs.apply(this,arguments); }; }
  { const _cn=callNuke; callNuke=function(by){ if(tut&&tut.prb&&!CFG.auto&&by&&!by.isPlayer&&!by._prb) return false; return _cn.apply(this,arguments); }; }
  if(typeof onZoneCaptured==='function'){ const _oz=onZoneCaptured; onZoneCaptured=function(){ if(tut&&tut.prb&&!CFG.auto) return; return _oz.apply(this,arguments); }; }
  // los blancos que "se mueven" (o están quietos) no tiran NADA: ni el cañón apuntado (botFire), ni la explosiva que la IA tira directo
  // con fireGun, ni la ametralladora (fireMG). Antes solo se cortaba botFire y te seguían pegando con la explosiva y la ametralladora.
  const noFire=t=>!!(tut&&tut.prb&&t&&t!==player&&t.prbT&&(t.prbM?t.prbM!=='combate':CFG.tgt!=='combate'));
  { const _bf=botFire; botFire=function(t){ if(noFire(t)) return; return _bf.apply(this,arguments); }; }
  { const _fg=fireGun; fireGun=function(t){ if(noFire(t)) return; return _fg.apply(this,arguments); }; }
  { const _fm=fireMG; fireMG=function(t){ if(noFire(t)) return; return _fm.apply(this,arguments); }; }
  // "Se mueve, no tira": antes la IA veía al jugador, frenaba para apuntar y se quedaba clavada esperando un tiro que nunca salía.
  // Ahora no busca blancos: recorre la zona donde se lo puso (puntos al azar a 40–140 m), sin perseguir a nadie.
  const prbMode=t=>t.prbM||(CFG.tgt==='mueven'?'mueve':CFG.tgt==='quietos'?'quieto':'combate');
  function wander(t,dt){ t.target=null; t.infT=null; t.thinkT=1; if(!t.prbHome) t.prbHome=t.pos.clone();
    const G=t.prbGo; if(!G||Math.hypot(G.x-t.pos.x,G.z-t.pos.z)<8||now>t.prbGoT){ const a=Math.random()*6.283, r=40+Math.random()*100, bx=(W.bx||700)-40, bz=(W.bz||700)-40;
      t.prbGo={x:clamp(t.prbHome.x+Math.sin(a)*r,-bx,bx),z:clamp(t.prbHome.z+Math.cos(a)*r,-bz,bz)}; t.prbGoT=now+25; }
    const mv=steerTo(t,t.prbGo,dt); let th=mv.throttle*.7, st=mv.steer;
    if(t.revT>0){ t.revT-=dt; th=-.8; st=t.revSteer||1; }
    else if(Math.abs(th)>.4&&(t.moved||0)<1.2){ t.stuckT=(t.stuckT||0)+dt; if(t.stuckT>1.5){ t.revT=1.4; t.revSteer=Math.random()<.5?-1:1; t.stuckT=0; t.prbGo=null; } }
    else t.stuckT=0;
    aimAt(t,new THREE.Vector3(t.pos.x+Math.sin(t.heading)*100,t.pos.y+2,t.pos.z+Math.cos(t.heading)*100),dt);
    drive(t,th,st,dt); }
  { const _ua=updateAI; updateAI=function(t,dt){ if(tut&&tut.prb&&t&&t.prbT&&t!==player){ const m=prbMode(t); if(m==='quieto'&&t.prbM){ drive(t,0,0,dt); return; } if(m==='mueve'){ wander(t,dt); return; } }
      return _ua.apply(this,arguments); }; }
  // cada cuadro: trucos y blancos que reaparecen
  // (va en el cuadro y no en updateTutorial: el envoltorio del campo de tiro de base.js no sigue la cadena con tut.range)
  function prbTick(dt){ if(tut&&tut.prb&&player&&state==='play'){
        if(!player.dead){ if(CFG.god) heal(player);
          if(CFG.ammo&&player.ammoCount&&player.ammoMax){ for(let i=0;i<player.ammoCount.length;i++) player.ammoCount[i]=player.ammoMax[i]; player.mgBelt=250; }
          if(CFG.rel&&player.reloadT>0) player.reloadT=0;
          if(CFG.sup){ playerCrew.sp=9999; playerCrew.artyCD=0; playerCrew.airCD=0; try{ if(typeof teamSup!=='undefined'&&teamSup[0]){ teamSup[0].arty=0; teamSup[0].air=0; } }catch(e){} } }
        for(const D of tut.pd){ if(D.t&&D.t.dead){ D.rt=(D.rt||0)+dt; if(D.rt>6){ removeTank(D.t); crews=crews.filter(c=>c!==D.t.crew); D.t=addTarget(D.x,D.z,D.k,true); D.rt=0; } } else if(D.t) D.t.spottedT=3; }
        if((tut.barT=(tut.barT||0)+dt)>1){ tut.barT=0; paintBar(true); } } }
  // ---- barra adentro ----
  // la barra se ve solo con el menú de Esc abierto (pedido de Sebastián: "que solo aparezca cuando presiono Esc")
  const barShow=()=>{ const on=!!(tut&&tut.prb&&state==='paused'); if(bar._on!==on){ bar._on=on; bar.style.display=on?'flex':'none'; } return on; };
  function paintBar(soft){ if(!(tut&&tut.prb)){ bar._on=false; bar.style.display='none'; return; } barShow(); if(soft&&bar.dataset.k===tut.key+F.on+PZ.on+CFG.god+CFG.ammo+CFG.rel+CFG.sup) return;
    bar.dataset.k=tut.key+F.on+PZ.on+CFG.god+CFG.ammo+CFG.rel+CFG.sup;
    bar.innerHTML=`<b>🧪 Pruebas</b><select id="bT" title="Cambiar de tanque">${tankOpts(tut.key)}</select>
      <div class="r"><button id="bG">🎯 Blanco adelante</button><button id="bC">🧹 Sacar blancos</button></div>
      <select id="bW">${wxOpts(wxKey)}</select>
      <div class="r"><button id="tG" class="${CFG.god?'on':''}">No se rompe</button><button id="tA" class="${CFG.ammo?'on':''}">Munición ∞</button><button id="tR" class="${CFG.rel?'on':''}">Recarga 0</button><button id="tS" class="${CFG.sup?'on':''}">Apoyos gratis</button></div>
      <div class="r"><button id="bL" class="${F.on?'on':''}">🎥 Cámara libre (L)</button><button id="bP" class="${PZ.on?'on':''}">${PZ.on?'▶ Seguir':'⏸ Pausa'} (P)</button><button id="bX">⏏ Salir</button></div>
      <button id="bO">${CFG.open?'▾':'▸'} Agregar donde mirás</button>
      <div id="bAdd" style="display:${CFG.open?'flex':'none'};flex-direction:column;gap:4px">
        <div class="r"><button id="sF" class="${CFG.side==='foe'?'on':''}">Enemigo</button><button id="sA" class="${CFG.side==='ally'?'on':''}">Aliado</button></div>
        <select id="aK"><option value="var">Tanque variado de la época</option>${tankOpts(CFG.addK)}</select>
        <select id="aM">${[['quieto','Quieto'],['mueve','Se mueve, no tira'],['combate','Pelea']].map(([v,t])=>`<option value="${v}"${v===CFG.addM?' selected':''}>${t}</option>`).join('')}</select>
        <div class="r"><button id="aT">🛡 Tanque</button><button id="aI">👥 Escuadra</button><button id="aP">🪂 Paracaidistas</button><button id="aH">🚛 Semioruga</button></div>
        <div class="r"><button id="aA">✸ Artillería</button><button id="aB">✈ Bombardeo</button><button id="aS">🛩 Ataque P-47/A-10</button><button id="aN">☢ Nuke</button></div>
        <div class="r"><button id="aX">🧹 Sacar todo</button><button id="aU" class="${CFG.auto?'on':''}" title="Si está prendido, los bots piden apoyos y los puntos traen refuerzos solos">Automático</button></div>
      </div>`;
    const q=s=>bar.querySelector(s);
    q('#bT').onchange=e=>{ e.target.blur(); swapTank(e.target.value); };
    q('#bG').onclick=()=>{ const d=new THREE.Vector3(); camera.getWorldDirection(d); d.y=0; d.normalize(); const p=(F.on?F.pos:player.pos).clone().addScaledVector(d,120); addTarget(p.x,p.z); };
    q('#bC').onclick=()=>{ for(const D of tut.pd){ if(D.t){ removeTank(D.t); crews=crews.filter(c=>c!==D.t.crew); } } tut.pd.length=0; };
    q('#bW').onchange=e=>{ e.target.blur(); applyWeather(e.target.value); CFG.wx=e.target.value; save(); };
    const tg=(id,k)=>q(id).onclick=()=>{ CFG[k]=CFG[k]?0:1; save(); paintBar(); }; tg('#tG','god'); tg('#tA','ammo'); tg('#tR','rel'); tg('#tS','sup');
    q('#bL').onclick=()=>setFree(!F.on); q('#bP').onclick=()=>setPause(!PZ.on);
    q('#bO').onclick=()=>{ CFG.open=CFG.open?0:1; save(); paintBar(); };
    q('#sF').onclick=()=>{ CFG.side='foe'; save(); paintBar(); }; q('#sA').onclick=()=>{ CFG.side='ally'; save(); paintBar(); };
    q('#aK').value=CFG.addK in VEH?CFG.addK:'var'; q('#aK').onchange=e=>{ e.target.blur(); CFG.addK=e.target.value; save(); }; q('#aM').onchange=e=>{ e.target.blur(); CFG.addM=e.target.value; save(); };
    q('#aT').onclick=()=>addTank(); q('#aI').onclick=()=>addSquad(); q('#aP').onclick=()=>addRef('para'); q('#aH').onclick=()=>addRef('ht');
    q('#aA').onclick=()=>addSup('arty'); q('#aB').onclick=()=>addSup('air'); q('#aS').onclick=()=>addSup('strike'); q('#aN').onclick=()=>addSup('nuke');
    q('#aX').onclick=clearAll; q('#aU').onclick=()=>{ CFG.auto=CFG.auto?0:1; save(); paintBar(); }; q('#bX').onclick=()=>{ try{ clearBattle(); mainMenu(); }catch(e){ location.reload(); } }; }
  // ---- agregar cosas donde mira la cámara (pedido de Sebastián: "no debe pasar nada sin que yo lo diga") ----
  function lookPoint(dist){ const c=F.on?cam:camera, d=new THREE.Vector3(); c.getWorldDirection(d); const o=c.position.clone();
    for(let s=4;s<1200;s+=3){ const p=o.clone().addScaledVector(d,s); if(p.y<=heightAt(p.x,p.z)+.3){ p.y=heightAt(p.x,p.z); return p; } }
    d.y=0; d.normalize(); const p=o.clone().addScaledVector(d,dist||120); p.y=heightAt(p.x,p.z); return p; }
  const teamOf=()=>CFG.side==='ally'?player.team:1-player.team;
  const sideNat=team=>{ const a=['de','it','jp'], pAx=a.includes(VEH[tut.key].nation); const ax=team===player.team?pAx:!pAx;
    if(team===player.team) return VEH[tut.key].nation; const e=W.era||3, L=Object.keys(NATIONS).filter(n=>a.includes(n)===ax&&(()=>{ try{ return vehTreeE(n,e).length; }catch(er){ return 0; } })());
    return L[(Math.random()*L.length)|0]||(ax?'de':'us'); };
  function pickTank(team){ if(CFG.addK&&VEH[CFG.addK]) return CFG.addK; const n=sideNat(team); let L=[]; try{ L=vehTreeE(n,W.era||3); }catch(e){} return L[(Math.random()*L.length)|0]||tut.key; }
  function addTank(){ const p=lookPoint(), team=teamOf(), k=pickTank(team), n=VEH[k].nation, c=newCrew(`${team===player.team?'Aliado':'Enemigo'} · ${VEH[k].label}`,team,n,false);
    c.out=true; crews.push(c); const t=spawnCrew(c,k,{label:'',x:p.x,z:p.z}); t.prbT=1; t.prbM=CFG.addM; t.dummy=CFG.addM==='quieto'; t.immuneT=0;
    t.heading=Math.atan2(player.pos.x-p.x,player.pos.z-p.z); (tut.add=tut.add||[]).push(t); feed(`➕ ${c.name}`,'var(--amber)'); }
  function addSquad(){ const p=lookPoint(), team=teamOf(); ['rifle','rifle','at','hmg','rifle','eng'].forEach(k=>{ const a=Math.random()*6.28, r=2+Math.random()*5, x=p.x+Math.cos(a)*r, z=p.z+Math.sin(a)*r;
      try{ const P=makePerson(k,team,x,z); P.prbA=1; }catch(e){ console.warn(e); } }); feed(`➕ Escuadra ${team===player.team?'aliada':'enemiga'}`,'var(--amber)'); }
  function addRef(kind){ const p=lookPoint(), team=teamOf(), Z={x:p.x,z:p.z,r:20,id:'·',owner:0};
    try{ if(kind==='para') paraDrop(Z,team); else halfTrack(Z,team); feed(kind==='para'?'➕ Paracaidistas en camino':'➕ Semioruga en camino','var(--amber)'); }catch(e){ console.warn(e); banner('No se pudo',e.message,2); } }
  function fakeBy(team,p){ const d=new THREE.Vector3(p.x-player.pos.x,0,p.z-player.pos.z); if(d.lengthSq()<1) d.set(0,0,1); d.normalize();
    const by={team,name:team===player.team?'Apoyo (pruebas)':'Enemigo (pruebas)',isPlayer:false,_prb:true,pos:p.clone().addScaledVector(d,team===player.team?-350:350),
      crew:{sp:1e7,score:0,artyCD:0,airCD:0,infCD:0,st:null,name:'Pruebas',team}}; by.crew.tank=by; return by; }
  function addSup(k){ const p=lookPoint(), team=teamOf(), by=fakeBy(team,p);
    try{ if(k==='arty') callArtillery(by,p);
      else if(k==='air'){ const S=RULE().sup, o=S.air; S.air=1; try{ callAirstrike(by,p); } finally{ S.air=o; } }
      else if(k==='strike'){ let best=null, bd=1e9; for(const t of tanks){ if(t.dead||t.team===team) continue; const d=t.pos.distanceTo(p); if(d<bd){ bd=d; best=t; } }
        if(best&&!godOn(best)) a10Strike(best); else banner('Ataque aéreo','No hay blanco del otro bando cerca de donde mirás'+(best&&godOn(best)?' (vos estás con "No se rompe")':''),2.5); }
      else if(k==='nuke'){ if(nuke&&nuke.phase>=2) nuke=null; if(nuke){ banner('Nuke','Ya hay una en curso',1.5); return; }
        const S=RULE().sup, o=S.nuke, foe=1-team, sp=W.sp[foe]; S.nuke=1; W.sp[foe]=[{x:p.x/.85,z:p.z/.85}];   // callNuke tira sobre la base enemiga: le pongo una "base" donde mirás
        try{ callNuke(by); } finally{ S.nuke=o; W.sp[foe]=sp; } } }catch(e){ console.warn(e); banner('No se pudo',e.message,2); } }
  function clearAll(){ for(const t of (tut.add||[])){ try{ removeTank(t); }catch(e){} crews=crews.filter(c=>c!==t.crew); } tut.add=[];
    for(const D of tut.pd){ if(D.t){ removeTank(D.t); crews=crews.filter(c=>c!==D.t.crew); } } tut.pd.length=0;
    for(const P of infantry.slice()) if(P.kind!=='civ'&&P.kind!=='dog') try{ removeInf(P); }catch(e){}
    for(const t of tanks.slice()) if(t!==player&&(t.T.support||t.prbT)) try{ removeTank(t); }catch(e){} feed('🧹 Listo','var(--paper)'); }
  function swapTank(k){ if(!VEH[k]||!player) return; const pos={label:'',x:player.pos.x,z:player.pos.z}, h=player.heading; removeTank(player);
    tut.key=k; playerCrew.lineup=[k]; player=spawnCrew(playerCrew,k,pos); player.heading=h; CFG.tank=k; save(); updateHud(); banner(player.T.label,'Tanque cambiado',1.5); paintBar(); }
  // ---- cámara libre ----
  const F={on:false,pos:new THREE.Vector3(),yaw:0,pitch:0,keys:{}}, cam=new THREE.PerspectiveCamera(60,1,.3,6000), PZ={on:false};
  function setPause(v){ PZ.on=!!v; if(PZ.on&&!F.on) setFree(true); banner(PZ.on?'⏸ Pausa':'▶ Sigue',PZ.on?'Todo quieto: recorré el mapa con la cámara libre (W A S D, Q/E, Mayús)':'',1.6); paintBar(); }
  function setFree(v){ F.on=!!v; if(!F.on&&PZ.on) PZ.on=false; if(F.on){ F.pos.copy(camera.position); const d=new THREE.Vector3(); camera.getWorldDirection(d); F.yaw=Math.atan2(d.x,d.z); F.pitch=Math.asin(Math.max(-1,Math.min(1,d.y))); }
    F.keys={}; paintBar(); }
  document.addEventListener('keydown',e=>{ if(!(tut&&tut.prb&&state==='play')) return; if(e.target&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if(e.code==='KeyL'){ setFree(!F.on); e.stopImmediatePropagation(); return; }
    if(e.code==='KeyP'){ setPause(!PZ.on); e.stopImmediatePropagation(); return; }
    if(F.on&&e.code!=='Escape'){ F.keys[e.code]=true; e.stopImmediatePropagation(); e.preventDefault(); } },true);
  document.addEventListener('keyup',e=>{ if(F.on){ F.keys[e.code]=false; e.stopImmediatePropagation(); } },true);
  document.addEventListener('mousemove',e=>{ if(!F.on||!(tut&&tut.prb)) return; if(document.pointerLockElement||e.buttons){ F.yaw-=(e.movementX||0)*.0026; F.pitch=Math.max(-1.45,Math.min(1.45,F.pitch-(e.movementY||0)*.0026)); } },true);
  { const _f=frame; frame=function(dt){ if(tut&&tut.prb) barShow();   // se esconde sola al volver al combate
      if(tut&&tut.prb&&((state==='play'&&PZ.on)||state==='paused')){ try{ releaseAll(); mouseDown=false; cullUpdate(); }catch(e){} renderer.render(scene,camera); return; }   // ⏸ pausa (P) o menú de Esc: todo quieto (en pruebas el menú de Esc sí pausa)
      if(F.on&&tut&&tut.prb){ try{ releaseAll(); mouseDown=false; }catch(e){} } const r=_f.apply(this,arguments); try{ prbTick(dt); }catch(e){ console.warn('prb',e); } return r; }; }
  let lastT=performance.now();
  const _rr=renderer.render; renderer.render=function(sc,c){
    if(F.on&&tut&&tut.prb&&(state==='play'||state==='paused')&&sc===scene&&renderer.getRenderTarget()===null){ const t=performance.now(), dt=Math.min(.1,(t-lastT)/1000); lastT=t;
      const K=F.keys, sp=(K.ShiftLeft||K.ShiftRight?60:16)*dt, fw=new THREE.Vector3(Math.sin(F.yaw)*Math.cos(F.pitch),Math.sin(F.pitch),Math.cos(F.yaw)*Math.cos(F.pitch)), rt=new THREE.Vector3(-Math.cos(F.yaw),0,Math.sin(F.yaw));
      if(K.KeyW||K.ArrowUp) F.pos.addScaledVector(fw,sp); if(K.KeyS||K.ArrowDown) F.pos.addScaledVector(fw,-sp); if(K.KeyD||K.ArrowRight) F.pos.addScaledVector(rt,sp); if(K.KeyA||K.ArrowLeft) F.pos.addScaledVector(rt,-sp);
      if(K.KeyE||K.Space) F.pos.y+=sp; if(K.KeyQ||K.ControlLeft) F.pos.y-=sp;
      const g=(typeof heightAt==='function'?heightAt(F.pos.x,F.pos.z):0)+1.2; if(F.pos.y<g) F.pos.y=g;
      cam.aspect=c.aspect; cam.fov=60; cam.position.copy(F.pos); cam.lookAt(F.pos.clone().add(fw)); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); return _rr.call(this,sc,cam); }
    lastT=performance.now(); return _rr.call(this,sc,c); };
  // ---- menú de Esc en pruebas (pedido de Sebastián): pausa todo, deja usar la barra de pruebas y cambiar de mapa sin salir ----
  { const _pp=pausePanel; pausePanel=function(){ const r=_pp.apply(this,arguments);
      try{ if(tut&&tut.prb){ paintBar(); const p=$('panel'), h=p&&p.querySelector('p'); if(h) h.textContent='⏸ Juego en pausa: no se mueve nada. Usá la barra de pruebas (arriba a la izquierda) o cambiá el mapa acá.';
          if(p&&!document.getElementById('prbMapR')){ const d=document.createElement('div'); d.id='prbMapR'; d.setAttribute('data-notr','');
            d.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0;font:600 15px "Saira Condensed",system-ui,sans-serif;color:#cfc6b0';
            d.innerHTML=`<span>🗺 Mapa</span><select id="prbMapS" style="flex:1;min-width:220px;background:#0e0f12;color:#fff;border:1px solid #555;border-radius:6px;padding:5px;font:500 15px system-ui">${mapOpts(builtKey||CFG.map)}</select><button class="go alt" id="prbMapG">Cambiar mapa</button>`;
            const q=$('resume'); if(q&&q.parentNode===p) p.insertBefore(d,q); else p.appendChild(d);
            d.querySelector('#prbMapG').onclick=()=>{ const m=d.querySelector('#prbMapS').value; if(!WORLDS[m]) return; CFG.map=m; CFG.tank=tut.key; save(); changeMap(); }; } } }catch(e){ console.warn('prb menú',e); }
      return r; }; }
  // rearma la batalla de pruebas en el mapa nuevo con el mismo tanque, clima y trucos (los blancos y lo agregado se van)
  function changeMap(){ const wasF=F.on; PZ.on=false; F.on=false; try{ clearBattle(); }catch(e){ console.warn(e); } start(); if(wasF) setFree(true); }
  // ---- salir: vuelve al menú y a la época de antes, sin premios ----
  { const _cb=clearBattle; clearBattle=function(){ const was=tut&&tut.prb; const o=_cb.apply(this,arguments);
      if(was){ F.on=false; bar.style.display='none'; document.body.classList.remove('prb'); menuScreen='home'; if(prevEra!=null){ curEra=prevEra; try{ applyEraNations(curEra); }catch(e){} } }
      return o; }; }
  // ---- botón en el menú principal (solo el superusuario) ----
  const _mm=mainMenu; mainMenu=function(){ const r=_mm.apply(this,arguments);
    try{ if(SU()){ const cp=document.querySelector('.homeCopy'); if(cp&&!document.getElementById('prbB')){ const b=document.createElement('button'); b.className='introL'; b.id='prbB'; b.style.marginLeft='14px'; b.style.color='#7fd0ff';
        b.textContent='🧪 Pruebas'; b.onclick=panel; cp.prepend(b); } } }catch(e){}
    return r; };
})();
