// 🧪 Modo de pruebas (pedido de Sebastián: "probar todo sin tener que salir a partidas"). Solo para el superusuario (su cuenta, superUser.on).
// Desde el menú: elegir cualquier tanque de cualquier época (también los especiales), cualquier mapa (también los ocultos), el clima, los blancos
// (ninguno, quietos, que se mueven sin tirar o que pelean) y trucos (no se rompe, munición infinita, recarga al instante, apoyos gratis).
// Adentro: barra arriba a la izquierda para cambiar de tanque, poner un blanco adelante, cambiar el clima, los trucos y la cámara libre (L).
// No da puntos, PI, Yaguaretés ni batallas: usa el modo del campo de tiro (tut.range) que ya no da premios ni progreso.
(function(){
  const SU=()=>!!(window.superUser&&superUser.on);
  const LSg=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } }, LSs=(k,v)=>{ try{ localStorage.setItem(k,v); }catch(e){} };
  const CFG=Object.assign({tank:'m4a1',map:'alamein',wx:'dia',tgt:'quietos',tgtK:'var',god:1,ammo:1,rel:0,sup:1},(()=>{ try{ return JSON.parse(LSg('tw2_prb')||'{}'); }catch(e){ return {}; } })());
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
      <p class="s" style="margin-top:8px">Adentro: barra arriba a la izquierda (cambiar tanque, poner blancos, clima, trucos) · L = cámara libre (W A S D, Q/E, Mayús rápido, mouse mira) · Esc → Abandonar para volver.</p>
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
    lock(); updateHud(); banner(player.T.label,'🧪 Modo de pruebas · Esc → Abandonar para volver',3); paintBar(); }
  function tgtKey(){ if(CFG.tgtK&&VEH[CFG.tgtK]) return CFG.tgtK; const e=W.era||3, side=(n)=>['de','it','jp'].includes(n);
    const myAx=side(VEH[tut.key].nation), nats=Object.keys(NATIONS).filter(n=>side(n)!==myAx); let L=[]; for(const n of nats) try{ L=L.concat(vehTreeE(n,e)); }catch(e){}
    if(!L.length) L=tankList().filter(k=>eraOf(k)===e); return L[(Math.random()*L.length)|0]||tut.key; }
  function addTarget(x,z,k,noPush){ k=k||tgtKey(); const n=VEH[k].nation, c=newCrew(`Blanco · ${VEH[k].label}`,1,n,false); c.out=CFG.tgt==='quietos'; crews.push(c);
    const t=spawnCrew(c,k,{label:'',x,z}); t.dummy=CFG.tgt==='quietos'; t.prbT=1; t.immuneT=0; t.heading=Math.random()*6.28; if(!noPush) tut.pd.push({t,x,z,k}); return t; }
  // los blancos que "se mueven" no tiran
  { const _bf=botFire; botFire=function(t){ if(tut&&tut.prb&&t&&t.prbT&&CFG.tgt!=='combate') return; return _bf.apply(this,arguments); }; }
  // cada cuadro: trucos y blancos que reaparecen
  { const _ut=updateTutorial; updateTutorial=function(dt){ if(tut&&tut.prb&&player&&state==='play'){
        if(!player.dead){ if(CFG.god){ player.immuneT=Math.max(player.immuneT||0,2); player.hp=Math.max(player.hp,player.T.hp*.999); }
          if(CFG.ammo&&player.ammoCount&&player.ammoMax){ for(let i=0;i<player.ammoCount.length;i++) player.ammoCount[i]=player.ammoMax[i]; player.mgBelt=250; }
          if(CFG.rel&&player.reloadT>0) player.reloadT=0;
          if(CFG.sup){ playerCrew.sp=9999; playerCrew.artyCD=0; playerCrew.airCD=0; try{ if(typeof teamSup!=='undefined'&&teamSup[0]){ teamSup[0].arty=0; teamSup[0].air=0; } }catch(e){} } }
        for(const D of tut.pd){ if(D.t&&D.t.dead){ D.rt=(D.rt||0)+dt; if(D.rt>6){ removeTank(D.t); crews=crews.filter(c=>c!==D.t.crew); D.t=addTarget(D.x,D.z,D.k,true); D.rt=0; } } else if(D.t) D.t.spottedT=3; }
        if((tut.barT=(tut.barT||0)+dt)>1){ tut.barT=0; paintBar(true); } }
      return _ut.apply(this,arguments); }; }
  // ---- barra adentro ----
  function paintBar(soft){ if(!(tut&&tut.prb)){ bar.style.display='none'; return; } bar.style.display='flex'; if(soft&&bar.dataset.k===tut.key+F.on+CFG.god+CFG.ammo+CFG.rel+CFG.sup) return;
    bar.dataset.k=tut.key+F.on+CFG.god+CFG.ammo+CFG.rel+CFG.sup;
    bar.innerHTML=`<b>🧪 Pruebas</b><select id="bT" title="Cambiar de tanque">${tankOpts(tut.key)}</select>
      <div class="r"><button id="bG">🎯 Blanco adelante</button><button id="bC">🧹 Sacar blancos</button></div>
      <select id="bW">${wxOpts(wxKey)}</select>
      <div class="r"><button id="tG" class="${CFG.god?'on':''}">No se rompe</button><button id="tA" class="${CFG.ammo?'on':''}">Munición ∞</button><button id="tR" class="${CFG.rel?'on':''}">Recarga 0</button><button id="tS" class="${CFG.sup?'on':''}">Apoyos gratis</button></div>
      <div class="r"><button id="bL" class="${F.on?'on':''}">🎥 Cámara libre (L)</button><button id="bX">⏏ Salir</button></div>`;
    const q=s=>bar.querySelector(s);
    q('#bT').onchange=e=>{ e.target.blur(); swapTank(e.target.value); };
    q('#bG').onclick=()=>{ const d=new THREE.Vector3(); camera.getWorldDirection(d); d.y=0; d.normalize(); const p=(F.on?F.pos:player.pos).clone().addScaledVector(d,120); addTarget(p.x,p.z); };
    q('#bC').onclick=()=>{ for(const D of tut.pd){ if(D.t){ removeTank(D.t); crews=crews.filter(c=>c!==D.t.crew); } } tut.pd.length=0; };
    q('#bW').onchange=e=>{ e.target.blur(); applyWeather(e.target.value); CFG.wx=e.target.value; save(); };
    const tg=(id,k)=>q(id).onclick=()=>{ CFG[k]=CFG[k]?0:1; save(); paintBar(); }; tg('#tG','god'); tg('#tA','ammo'); tg('#tR','rel'); tg('#tS','sup');
    q('#bL').onclick=()=>setFree(!F.on); q('#bX').onclick=()=>{ try{ clearBattle(); mainMenu(); }catch(e){ location.reload(); } }; }
  function swapTank(k){ if(!VEH[k]||!player) return; const pos={label:'',x:player.pos.x,z:player.pos.z}, h=player.heading; removeTank(player);
    tut.key=k; playerCrew.lineup=[k]; player=spawnCrew(playerCrew,k,pos); player.heading=h; CFG.tank=k; save(); updateHud(); banner(player.T.label,'Tanque cambiado',1.5); paintBar(); }
  // ---- cámara libre ----
  const F={on:false,pos:new THREE.Vector3(),yaw:0,pitch:0,keys:{}}, cam=new THREE.PerspectiveCamera(60,1,.3,6000);
  function setFree(v){ F.on=!!v; if(F.on){ F.pos.copy(camera.position); const d=new THREE.Vector3(); camera.getWorldDirection(d); F.yaw=Math.atan2(d.x,d.z); F.pitch=Math.asin(Math.max(-1,Math.min(1,d.y))); }
    F.keys={}; paintBar(); }
  document.addEventListener('keydown',e=>{ if(!(tut&&tut.prb&&state==='play')) return; if(e.target&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if(e.code==='KeyL'){ setFree(!F.on); e.stopImmediatePropagation(); return; }
    if(F.on&&e.code!=='Escape'){ F.keys[e.code]=true; e.stopImmediatePropagation(); e.preventDefault(); } },true);
  document.addEventListener('keyup',e=>{ if(F.on){ F.keys[e.code]=false; e.stopImmediatePropagation(); } },true);
  document.addEventListener('mousemove',e=>{ if(!F.on||!(tut&&tut.prb)) return; if(document.pointerLockElement||e.buttons){ F.yaw-=(e.movementX||0)*.0026; F.pitch=Math.max(-1.45,Math.min(1.45,F.pitch-(e.movementY||0)*.0026)); } },true);
  { const _f=frame; frame=function(){ if(F.on&&tut&&tut.prb){ try{ releaseAll(); mouseDown=false; }catch(e){} } return _f.apply(this,arguments); }; }
  let lastT=performance.now();
  const _rr=renderer.render; renderer.render=function(sc,c){
    if(F.on&&tut&&tut.prb&&state==='play'&&sc===scene&&renderer.getRenderTarget()===null){ const t=performance.now(), dt=Math.min(.1,(t-lastT)/1000); lastT=t;
      const K=F.keys, sp=(K.ShiftLeft||K.ShiftRight?60:16)*dt, fw=new THREE.Vector3(Math.sin(F.yaw)*Math.cos(F.pitch),Math.sin(F.pitch),Math.cos(F.yaw)*Math.cos(F.pitch)), rt=new THREE.Vector3(-Math.cos(F.yaw),0,Math.sin(F.yaw));
      if(K.KeyW||K.ArrowUp) F.pos.addScaledVector(fw,sp); if(K.KeyS||K.ArrowDown) F.pos.addScaledVector(fw,-sp); if(K.KeyD||K.ArrowRight) F.pos.addScaledVector(rt,sp); if(K.KeyA||K.ArrowLeft) F.pos.addScaledVector(rt,-sp);
      if(K.KeyE||K.Space) F.pos.y+=sp; if(K.KeyQ||K.ControlLeft) F.pos.y-=sp;
      const g=(typeof heightAt==='function'?heightAt(F.pos.x,F.pos.z):0)+1.2; if(F.pos.y<g) F.pos.y=g;
      cam.aspect=c.aspect; cam.fov=60; cam.position.copy(F.pos); cam.lookAt(F.pos.clone().add(fw)); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); return _rr.call(this,sc,cam); }
    lastT=performance.now(); return _rr.call(this,sc,c); };
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
