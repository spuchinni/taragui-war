// Desafíos del Nahuel (semana 3 del plan, pedido de Sebastián): tres pruebas sacadas de hechos reales, contra el reloj o contra
// blancos, nunca contra países vecinos. Fuente: Tank Encyclopedia, "Nahuel DL 43" (basado en Sigal Fogliani, Nahuel DL 43, 2004).
//  1) desfile: 9 de julio de 1944, diez Nahuel desfilan detrás del de Baisi. Seguir al tanque guía sin perder la formación.
//  2) marcha:  1947, Villa Martelli → San Miguel por la Ruta 9. Pasar los puestos de control a tiempo y sin que se salga la oruga.
//  3) tiro:    1947, prueba de tiro en San Miguel. Parar en cada puesto y destruir los blancos; las miras se descalibraban
//              (apuntaban mirando por el tubo con un espejo): no hay mira del artillero, se apunta con la marca del cañón.
// Las orugas del Nahuel se salían a alta velocidad y en giros cerrados: en el desfile y la marcha, si vas a más del 72 % de la
// velocidad máxima y girás fuerte medio segundo, se sale la oruga (8 s quieto o R para arreglarla).
// Mapa propio "campomayo" (campo abierto de la pampa, fuera de la rotación: FOCO.hideMaps). Se juega con el Nahuel (hay que tenerlo).
// Premio la primera vez: PI para la Argentina y Yaguaretés; estrellas por desafío en PROG.desafios[id].
(function(){
  const EN=()=>window.LANG==='en', T2=(es,en)=>EN()?en:es;
  // ---- mapa: campo abierto tipo Campo de Mayo ----
  WW1_CFG.campomayo={seed:1947,era:3,label:'Campo de Mayo (Buenos Aires)',desc:'Campo de maniobras del Ejército en la pampa: pasto, alamedas y caminos de tierra.',
    bx:175,bz:155,sky:0xb6c6d4,fog:[170,560],ground:['#7f9a4e','#76904a','#8aa458','#6d8644'],grass:.95,craters:0,crR:[1,2],front:60,noTrench:1,churn:0,deadTrees:0,
    hills:[{x:-120,z:90,r:50,h:3},{x:130,z:-100,r:45,h:2.5}],
    village:{x:-140,z:-110,n:6,ruin:0,r:16,name:'Cuarteles',walls:['#e8e0cc','#ddd3bc','#efe8d6'],roofs:['#9a4a32','#8a4a36']},
    woods:[{x:-150,z:120,r:24,n:50,sp:['alamo']},{x:150,z:115,r:22,n:45,sp:['roble']},{x:155,z:-125,r:20,n:40,sp:['alamo']}],
    zones:[{id:'A',x:-120,z:0,r:18,label:'Puesto A'},{id:'B',x:0,z:0,r:18,label:'Puesto B'},{id:'C',x:120,z:0,r:18,label:'Puesto C'}]};
  { const k='campomayo', C=ww1Big(WW1_CFG[k]);
    WORLDS[k]={key:k,label:C.label,desc:C.desc,era:3,ww1:true,bx:C.bx,bz:C.bz,sky:C.sky,fog:C.fog,dust:0x8a7a5a,cfg:C,h:(x,z)=>ww1Sample(WORLDS[k],x,z),zones:C.zones,
      spawns:{0:[{label:'Base oeste',x:-90,z:-C.spawnZ},{label:'Base este',x:90,z:-C.spawnZ}],1:[{label:'Retaguardia oeste',x:-90,z:C.spawnZ},{label:'Retaguardia este',x:90,z:C.spawnZ}]}};
    WORLDS[k].wxs=['dia']; if(typeof FOCO!=='undefined'&&!FOCO.hideMaps.includes(k)) FOCO.hideMaps.push(k); }

  const DES=[
    {id:'desfile',date:T2('9 de julio de 1944','July 9, 1944'),t:T2('El desfile del 9 de Julio','The July 9 parade'),
     ctx:T2('Día de la Independencia. Diez Nahuel desfilan por primera vez ante el público, detrás del tanque que manda el propio coronel Baisi. Había miedo de que las orugas se salieran en plena avenida.',
            'Independence Day. Ten Nahuels parade in front of the public for the first time, behind the tank commanded by Colonel Baisi himself. Everyone feared the tracks would come off in the middle of the avenue.'),
     goal:T2('Seguí al tanque guía a entre 10 y 35 m, sin salirte del recorrido. No aceleres a fondo en las curvas: se sale la oruga.',
             'Follow the lead tank at 10 to 35 m without leaving the route. Do not go flat out in the bends: the track comes off.')},
    {id:'marcha',date:T2('1947','1947'),t:T2('La marcha a San Miguel','The march to San Miguel'),
     ctx:T2('Prueba final de 1947: los Nahuel modernizados salen de Villa Martelli por la Ruta 9 hacia San Miguel. Uno llegó en 30 minutos; los otros nueve tardaron 6 horas por las orugas.',
            'Final trials of 1947: the modernized Nahuels leave Villa Martelli along Route 9 toward San Miguel. One arrived in 30 minutes; the other nine took 6 hours because of their tracks.'),
     goal:T2('Pasá por todos los puestos de control antes de que se acabe el tiempo. Rápido en las rectas, despacio en las curvas.',
             'Go through every checkpoint before time runs out. Fast on the straights, slow in the bends.')},
    {id:'tiro',date:T2('1947','1947'),t:T2('La prueba de tiro','The firing trial'),
     ctx:T2('San Miguel, 1947, delante del público: entrar al campo de tiro, parar, tirar a los blancos y seguir. Las miras se descalibraban, así que a cada jefe le dieron un espejo para apuntar mirando por el tubo.',
            'San Miguel, 1947, in front of a crowd: enter the range, stop, shoot the targets and move on. The sights kept losing their zero, so each commander got a mirror to aim by looking down the barrel.'),
     goal:T2('Pará dentro de cada círculo amarillo y destruí los blancos. Sin mira del artillero: apuntá con la marca del cañón.',
             'Stop inside each yellow circle and destroy the targets. No gunner\'s sight: aim with the gun marker.')}];
  const byId=id=>DES.find(d=>d.id===id);
  const rec=()=>{ PROG.desafios=PROG.desafios||{}; return PROG.desafios; };

  // ---- estilos y cajas ----
  const st=document.createElement('style'); st.textContent=`
    #desBox{position:fixed;inset:0;z-index:63;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);padding:12px}
    #desBox .card{width:min(640px,96vw);max-height:90vh;overflow:auto;background:rgba(18,20,24,.97);border:2px solid #74acdf;border-radius:14px;padding:16px 20px;color:#fff;font:600 17px 'Saira Condensed',system-ui,sans-serif}
    #desBox h2{margin:0 0 4px;font:800 28px 'Saira Condensed',system-ui,sans-serif;color:#ffd24a;text-align:center} #desBox .sub{text-align:center;color:#cfc6b0;margin-bottom:8px}
    #desBox .it{display:flex;gap:10px;align-items:center;border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:8px 10px;margin:6px 0}
    #desBox .it div{flex:1} #desBox .it small{display:block;color:#cfc6b0;font-weight:600} #desBox .st{color:#ffd24a;letter-spacing:2px;white-space:nowrap}
    #desBox p{margin:6px 0;line-height:1.3} #desBox .row{display:flex;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap}
    #desMk{position:fixed;z-index:7;pointer-events:none;display:none;transform:translate(-50%,-50%);font:800 15px 'Saira Condensed',system-ui,sans-serif;color:#ffd24a;text-shadow:0 1px 3px #000,0 0 2px #000;text-align:center;white-space:nowrap}
    #desMk i{display:block;width:18px;height:18px;margin:0 auto 2px;border:3px solid #ffd24a;border-radius:50%;box-shadow:0 0 0 2px #000}
    body.movil #desBox .card{zoom:.8}`;
  document.head.appendChild(st);
  const box=document.createElement('div'); box.id='desBox'; box.setAttribute('data-notr',''); document.body.appendChild(box);
  const mk=document.createElement('div'); mk.id='desMk'; mk.setAttribute('data-notr',''); document.body.appendChild(mk);
  const stars=n=>'★'.repeat(n)+'☆'.repeat(3-n);

  // ---- lista (botón en el garaje con un tanque argentino) ----
  function list(){ const R=rec(), has=owned('nahuel');
    box.innerHTML=`<div class="card"><h2>🎖 ${T2('Desafíos del Nahuel','Nahuel challenges')}</h2><div class="sub">${T2('Pruebas reales de 1944 y 1947. Se juegan con el Nahuel DL-43.','Real trials from 1944 and 1947. Played with the Nahuel DL-43.')}</div>
      ${DES.map(d=>`<div class="it"><div><b>${d.t}</b><small>${d.date} · ${d.goal}</small></div><span class="st">${stars(R[d.id]||0)}</span><button class="go" data-d="${d.id}" ${has?'':'disabled'}>${T2('Jugar','Play')}</button></div>`).join('')}
      ${has?'':`<p style="color:#ff9a7a">${T2('Necesitás el Nahuel DL-43.','You need the Nahuel DL-43.')}</p>`}
      <div class="row"><button class="go alt" id="desHist">📜 ${T2('Historia del Nahuel','Nahuel history')}</button><button class="go alt" id="desX">${T2('Cerrar','Close')}</button></div></div>`;
    box.style.display='flex';
    box.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{ box.style.display='none'; startDesafio(b.dataset.d); });
    document.getElementById('desX').onclick=()=>{ box.style.display='none'; };
    document.getElementById('desHist').onclick=()=>{ if(window.nahuelHist) nahuelHist(); }; }
  window.desafiosNahuel=list;
  const _rh=renderHangar; renderHangar=function(){ const r=_rh.apply(this,arguments);
    try{ const cam=document.getElementById('hgCam'); if(cam&&chosenNation==='ar'&&!document.getElementById('hgDes')){ cam.insertAdjacentHTML('beforebegin',`<button class="hgB" id="hgDes" data-notr>🎖 ${T2('Desafíos','Challenges')}</button>`); document.getElementById('hgDes').onclick=list; } }catch(e){}
    return r; };

  // ---- utilidades de recorrido ----
  const V3=THREE.Vector3;
  function pathFrom(sp,u,n,len,amp,lam,ph){ const P=[]; for(let s=0;s<=len;s+=10){ const off=amp*Math.sin(s/lam+ph), x=sp.x+u[0]*s+n[0]*off, z=sp.z+u[1]*s+n[1]*off; P.push(new V3(x,heightAt(x,z),z)); }
    let acc=0; P[0].s=0; for(let i=1;i<P.length;i++){ acc+=P[i].distanceTo(P[i-1]); P[i].s=acc; } P.len=acc; return P; }
  function at(P,s){ s=clamp(s,0,P.len); let i=1; while(i<P.length-1&&P[i].s<s) i++; const a=P[i-1], b=P[i], k=(s-a.s)/((b.s-a.s)||1);
    const p=a.clone().lerp(b,k); p.y=heightAt(p.x,p.z); return {p,h:Math.atan2(b.x-a.x,b.z-a.z)}; }
  function nearest(P,p,hint){ let best=hint||0,bd=1e9; const i0=Math.max(1,Math.floor((hint||0)/10)-6), i1=Math.min(P.length-1,i0+40);
    for(let i=(hint==null?1:i0);i<=(hint==null?P.length-1:i1);i++){ const a=P[i-1], b=P[i], dx=b.x-a.x, dz=b.z-a.z, l=dx*dx+dz*dz; let k=l?((p.x-a.x)*dx+(p.z-a.z)*dz)/l:0; k=clamp(k,0,1);
      const d=Math.hypot(p.x-a.x-dx*k,p.z-a.z-dz*k); if(d<bd){ bd=d; best=a.s+(b.s-a.s)*k; } } return {s:best,d:bd}; }
  // banderas argentinas a los costados (solo decoración)
  let flagTex=null; function flagMat(){ if(!flagTex){ const c=document.createElement('canvas'); c.width=96; c.height=64; const g=c.getContext('2d');
      g.fillStyle='#74acdf'; g.fillRect(0,0,96,64); g.fillStyle='#fff'; g.fillRect(0,21,96,22); g.fillStyle='#f6b40e'; g.beginPath(); g.arc(48,32,7,0,7); g.fill(); flagTex=new THREE.CanvasTexture(c); }
    return new THREE.MeshLambertMaterial({map:flagTex,side:THREE.DoubleSide}); }
  const deco=[]; const poleMat=new THREE.MeshLambertMaterial({color:0xd8d2c4});
  function flag(x,z,a){ const g=new THREE.Group(), y=heightAt(x,z); const pole=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,4.2,6),poleMat); pole.position.y=2.1; g.add(pole);
    const f=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1),flagMat()); f.position.set(.75,3.6,0); g.add(f); g.position.set(x,y,z); g.rotation.y=a; scene.add(g); deco.push(g); }
  function ring(x,z,r,col){ const m=new THREE.Mesh(new THREE.RingGeometry(r-.6,r,40),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.75,side:THREE.DoubleSide,depthWrite:false}));
    m.rotation.x=-Math.PI/2; m.position.set(x,heightAt(x,z)+.25,z); scene.add(m); deco.push(m); return m; }
  function clearDeco(){ for(const g of deco) scene.remove(g); deco.length=0; mk.style.display='none'; }
  function marker(p,txt){ if(!p){ mk.style.display='none'; return; } const v=p.clone().setY(p.y+3).project(camera); let x=(v.x+1)/2*innerWidth, y=(1-v.y)/2*innerHeight;
    if(v.z>1){ x=innerWidth-x; y=innerHeight-24; } x=clamp(x,30,innerWidth-30); y=clamp(y,60,innerHeight-30);
    mk.style.left=x+'px'; mk.style.top=y+'px'; if(mk._t!==txt){ mk._t=txt; mk.innerHTML=`<i></i>${txt}`; } mk.style.display='block'; }

  function placeAt(t,x,z,h){ t.pos.set(x,heightAt(x,z),z); if(h!=null) t.heading=h; t.speed=0; if(t.root){ t.root.position.copy(t.pos); t.root.rotation.y=t.heading; } }   // spawnCrew lo corre a la base: se ubica a mano
  // ---- arranque ----
  function startDesafio(id){ const D=byId(id); if(!D||!owned('nahuel')) return; if(!PROG) loadProg();
    clearDeco(); curEra=3; applyEraNations(3); chosenNation='ar'; battleBR=null; startBattle(false,'campomayo',null,true); battleBR=null;
    tut={desafio:id,t0:null,phase:'intro',shots:0};
    infantry.slice().forEach(removeInf); infantry.length=0; tanks.slice().forEach(removeTank);
    crews=[playerCrew]; playerCrew.sp=400; playerCrew.lineup=['nahuel'];
    const sp=W.sp[0][0], cx=0, cz=0, fx=cx-sp.x, fz=cz-sp.z, l=Math.hypot(fx,fz)||1, u=[fx/l,fz/l], n=[-u[1],u[0]];
    const S={x:sp.x+u[0]*20,z:sp.z+u[1]*20}; tut.u=u; tut.n=n;
    if(id==='desfile'){ const P=pathFrom(S,u,n,760,22,95,0); tut.P=P;
      for(let s=30;s<P.len;s+=36){ const a=at(P,s), hx=Math.cos(a.h), hz=-Math.sin(a.h); for(const sd of [-1,1]) flag(a.p.x+hx*sd*11,a.p.z+hz*sd*11,a.h); }
      const c=newCrew(T2('c.121 · Tte. Cnel. Baisi','c.121 · Lt. Col. Baisi'),0,'ar',false); c.out=true; crews.push(c);
      const a0=at(P,30); const L=spawnCrew(c,'nahuel',{label:'',x:a0.p.x,z:a0.p.z}); L.dummy=true; placeAt(L,a0.p.x,a0.p.z,a0.h); tut.lead=L; tut.sL=30;
      tut.start=at(P,8); tut.form=0; tut.outT=0; tut.okT=0; tut.totT=0; }
    if(id==='marcha'){ const P=pathFrom(S,u,n,1250,60,160,.6); tut.P=P; tut.gates=[];
      for(let s=120;s<P.len;s+=125){ const a=at(P,s), hx=Math.cos(a.h), hz=-Math.sin(a.h); for(const sd of [-1,1]) flag(a.p.x+hx*sd*8,a.p.z+hz*sd*8,a.h); tut.gates.push({p:a.p,r:ring(a.p.x,a.p.z,8,0xffd24a)}); }
      tut.g=0; tut.limit=300; tut.start=at(P,4); }
    if(id==='tiro'){ const P=pathFrom(S,u,n,420,0,1,0); tut.P=P; tut.st=[]; const foe=(vehTreeE(foeNation,3).filter(k=>VEH[k].cls==='medio'||VEH[k].cls==='ligero'));
      [80,170,260,350].forEach((s,i)=>{ const a=at(P,s), side=i%2?1:-1, dist=[200,250,300,350][i];
        tut.st.push({p:a.p,s,side,dist,key:foe[i%foe.length]||'pz3j',r:null,tg:[]}); });
      tut.si=0; tut.limit=360; tut.start=at(P,4); }
    player=spawnCrew(playerCrew,'nahuel',{label:'',x:tut.start.p.x,z:tut.start.p.z}); placeAt(player,tut.start.p.x,tut.start.p.z,tut.start.h);
    camYaw=player.heading; camPitch=.02; camDist=14; $('overlay').style.display='none'; document.body.classList.remove('deploy','menu','home'); document.body.classList.add('tut');
    { const b=document.getElementById('tutbox'); if(b){ b._t=''; b.innerHTML=`<b>🎖 ${D.t}</b>${D.goal}`; } }
    try{ const h=player.heading; camera.position.set(player.pos.x-Math.sin(h)*14,player.pos.y+5,player.pos.z-Math.cos(h)*14); camera.lookAt(player.pos.x+Math.sin(h)*20,player.pos.y+1,player.pos.z+Math.cos(h)*20); }catch(e){}   // detrás del tanque mientras se lee la intro
    state='lesson'; intro(D); updateHud(); }
  window.startDesafio=startDesafio;
  function intro(D){ box.innerHTML=`<div class="card"><h2>${D.t}</h2><div class="sub">${D.date}</div><p>${D.ctx}</p><p><b style="color:#ffd24a">${T2('Objetivo','Goal')}:</b> ${D.goal}</p>
      <div class="row"><button class="go" id="desGo">${T2('¡Adelante!','Go!')}</button><button class="go alt" id="desQuit">${T2('Volver','Back')}</button></div></div>`;
    box.style.display='flex';
    document.getElementById('desGo').onclick=()=>{ box.style.display='none'; tut.phase='run'; tut.t0=now; state='play'; lock(); };
    document.getElementById('desQuit').onclick=()=>{ box.style.display='none'; clearBattle(); mainMenu(); }; }

  // ---- fin ----
  function endDesafio(win,why,nStars){ if(!tut||tut.phase==='end') return; const id=tut.desafio, D=byId(id); tut.phase='end'; state='lesson'; mk.style.display='none';
    let extra=''; if(win){ const R=rec(), first=!R[id]; R[id]=Math.max(R[id]||0,nStars||1);
      if(first){ const rp=400, yp=2500; try{ addRP('ar',rp); }catch(e){} PROG.yp=(PROG.yp||0)+yp; extra=`<p>${T2('Premio por cumplirlo la primera vez','First-time reward')}: <b>+${rp} PI</b> ${T2('y','and')} <b>+🐆 ${yp.toLocaleString('es-AR')}</b></p>`; }
      saveProg(); }
    box.innerHTML=`<div class="card"><h2>${win?T2('¡Desafío cumplido!','Challenge complete!'):T2('Desafío fallido','Challenge failed')}</h2><div class="sub">${D.t}</div>
      ${win?`<p style="text-align:center;font-size:30px" class="st">${stars(nStars||1)}</p>`:''}<p style="text-align:center">${why}</p>${extra}
      <div class="row"><button class="go" id="desAgain">${T2('Reintentar','Retry')}</button><button class="go alt" id="desBack">${T2('Volver al garaje','Back to hangar')}</button></div></div>`;
    box.style.display='flex'; if(document.pointerLockElement) document.exitPointerLock();
    document.getElementById('desAgain').onclick=()=>{ box.style.display='none'; clearBattle(); startDesafio(id); };
    document.getElementById('desBack').onclick=()=>{ box.style.display='none'; clearBattle(); mainMenu(); }; }
  { const _cb=clearBattle; clearBattle=function(){ const d=tut&&tut.desafio; clearDeco(); const o=_cb.apply(this,arguments); if(d){ menuScreen='hangar'; tut=null; } return o; }; }

  // ---- la oruga que se sale (desfile y marcha) ----
  function trackCheck(dt){ const t=player; if(!t||t.dead) return; const yr=Math.abs(((t.heading-(tut.h0??t.heading))+Math.PI*3)%(Math.PI*2)-Math.PI)/Math.max(dt,1e-3); tut.h0=t.heading;
    const fast=Math.abs(t.speed)>(t.T.maxF||10)*.72;
    if(fast&&yr>.38&&!(t.trackT>0)){ tut.thr=(tut.thr||0)+dt; if(tut.thr>.5){ tut.thr=0; t.trackT=8; t.speed*=.3; tut.thrown=(tut.thrown||0)+1;
        hitMsg(T2('¡Se salió la oruga! Muy rápido en la curva · R para arreglarla','The track came off! Too fast in the bend · R to fix it'),'#ff9a5a'); try{ sfx('metal',t.pos,.7,{near:true,rate:.6}); }catch(e){} } }
    else tut.thr=Math.max(0,(tut.thr||0)-dt); }

  // ---- lógica de cada desafío (corre con el tutorial) ----
  const _ut=updateTutorial; updateTutorial=function(dt){ if(!(tut&&tut.desafio)) return _ut.apply(this,arguments);
    if(!player||state!=='play'||tut.phase!=='run') return;
    tickets[0]=tickets[1]=400; scoped=false;
    const el=(s)=>{ const b=document.getElementById('tutbox'); if(b&&b._t!==s){ b._t=s; b.innerHTML=s; } };
    const id=tut.desafio, D=byId(id), tt=now-tut.t0, P=tut.P;
    if(id!=='tiro') trackCheck(dt);
    if(id==='desfile'){ const L=tut.lead; tut.sL=Math.min(P.len,tut.sL+4.6*dt); const a=at(P,tut.sL);
      L.pos.copy(a.p); L.heading=a.h; L.speed=4.6; if(L.root){ L.root.position.copy(L.pos); L.root.rotation.y=L.heading; }
      const q=nearest(P,player.pos,tut.sPl); tut.sPl=q.s; const gap=tut.sL-q.s, okNow=gap>=10&&gap<=35&&q.d<14;
      if(tt<5&&!okNow) return;   // 5 s para acomodarse
      tut.totT+=dt; if(okNow){ tut.okT+=dt; tut.outT=0; } else tut.outT+=dt;
      const pct=Math.round(tut.okT/Math.max(1,tut.totT)*100);
      el(`<b>🎖 ${D.t}</b>${T2('Distancia al guía','Gap to the leader')}: <span style="color:${okNow?'#7ce07c':'#ff8a6a'}">${Math.round(gap)} m</span> (10–35) · ${T2('en formación','in formation')} ${pct}%${q.d>=14?` · <span style="color:#ff8a6a">${T2('¡volvé al recorrido!','back to the route!')}</span>`:''}${tut.outT>2?` · <b style="display:inline;color:#ff8a6a">${T2('fuera de formación','out of formation')} ${Math.ceil(8-tut.outT)} s</b>`:''}`);
      marker(L.pos,T2('Guía','Leader'));
      if(tut.outT>8) return endDesafio(false,T2('Perdiste la formación delante de todo el público.','You broke formation in front of the whole crowd.'));
      if(tut.sL>=P.len-1) return endDesafio(true,T2(`Desfilaste en formación el ${pct}% del recorrido.`,`You kept formation for ${pct}% of the route.`),pct>=92?3:pct>=80?2:1); }
    if(id==='marcha'){ const G=tut.gates[tut.g], left=tut.limit-tt;
      if(G&&Math.hypot(player.pos.x-G.p.x,player.pos.z-G.p.z)<9){ G.r.material.color.setHex(0x7ce07c); tut.g++; try{ sfx('click',null,.5); }catch(e){} }
      const N=tut.gates[tut.g];
      el(`<b>🎖 ${D.t}</b>${T2('Puestos','Checkpoints')}: ${tut.g} / ${tut.gates.length} · ⏱ ${Math.floor(Math.max(0,left)/60)}:${String(Math.max(0,Math.floor(left))%60).padStart(2,'0')}${tut.thrown?` · ${T2('orugas salidas','thrown tracks')}: ${tut.thrown}`:''}`);
      if(N) marker(N.p,`${T2('Puesto','Checkpoint')} ${tut.g+1} · ${Math.round(Math.hypot(player.pos.x-N.p.x,player.pos.z-N.p.z))} m`);
      if(!N){ const used=tt; return endDesafio(true,T2(`Llegaste a San Miguel en ${Math.floor(used/60)}:${String(Math.floor(used)%60).padStart(2,'0')}.`,`You reached San Miguel in ${Math.floor(used/60)}:${String(Math.floor(used)%60).padStart(2,'0')}.`),used<200&&!tut.thrown?3:used<250?2:1); }
      if(left<=0) return endDesafio(false,T2('Se acabó el tiempo: como los nueve Nahuel que tardaron 6 horas.','Time is up: like the nine Nahuels that took 6 hours.')); }
    if(id==='tiro'){ scopeOn=false; rightDown=false; const S=tut.st[tut.si], left=tut.limit-tt;
      if(S&&!S.r) S.r=ring(S.p.x,S.p.z,7,0xffd24a);
      if(S&&!S.tg.length&&Math.hypot(player.pos.x-S.p.x,player.pos.z-S.p.z)<7&&Math.abs(player.speed)<.6){   // parado en el puesto: salen los blancos
        const [ux,uz]=tut.u, [nx,nz]=tut.n, eye=eyeOf(player);
        for(let j=0;j<2;j++){ let x=0,z=0; for(let tr=0;tr<10;tr++){ const d=S.dist+tr*15-60+j*45, lat=(j?24:-24)+tr*3; x=S.p.x+nx*S.side*d+ux*lat; z=S.p.z+nz*S.side*d+uz*lat;
            if(Math.abs(x)<W.bx-20&&Math.abs(z)<W.bz-20&&los(eye,new V3(x,heightAt(x,z)+1.2,z))) break; }
          const c=newCrew(T2('Blanco','Target'),1,foeNation,false); c.out=true; crews.push(c); const t=spawnCrew(c,S.key,{label:'',x,z}); t.dummy=true; t.immuneT=0; placeAt(t,x,z,Math.atan2(ux,uz)); t.target0=1; S.tg.push(t); }
        S.r.material.color.setHex(0x7ce07c); hitMsg(T2('¡Blancos a la vista! Apuntá con la marca del cañón','Targets in sight! Aim with the gun marker'),'#ffd24a'); }
      if(S&&S.tg.length&&S.tg.every(t=>t.dead)){ tut.si++; if(tut.st[tut.si]) hitMsg(T2('¡Bien! Seguí al próximo puesto','Good! Move on to the next station'),'#7ce07c'); }
      const N=tut.st[tut.si], live=N&&N.tg.filter(t=>!t.dead);
      el(`<b>🎖 ${D.t}</b>${T2('Puesto','Station')} ${Math.min(tut.si+1,tut.st.length)} / ${tut.st.length} · ${T2('disparos','shots')} ${tut.shots} · ⏱ ${Math.floor(Math.max(0,left)/60)}:${String(Math.max(0,Math.floor(left))%60).padStart(2,'0')}<br><small>${T2('Las miras se descalibraban: sin mira del artillero, apuntá con la marca del cañón.','The sights lost their zero: no gunner\'s sight, aim with the gun marker.')}</small>`);
      if(N){ if(live&&live.length) marker(live[0].pos,`${T2('Blanco','Target')} · ${Math.round(live[0].pos.distanceTo(player.pos))} m`); else marker(N.p,`${T2('Pará acá','Stop here')} · ${Math.round(Math.hypot(player.pos.x-N.p.x,player.pos.z-N.p.z))} m`); }
      if(!N) return endDesafio(true,T2(`Destruiste los 8 blancos con ${tut.shots} disparos.`,`You destroyed all 8 targets with ${tut.shots} shots.`),tut.shots<=10?3:tut.shots<=14?2:1);
      if(left<=0) return endDesafio(false,T2('Se acabó el tiempo.','Time is up.')); }
  };
  // tiro: cualquier impacto de cañón en un blanco lo destruye; se cuentan los disparos
  { const _a=hitTank; hitTank=function(by,hit,dir,pen,kind){ const t=hit&&hit.object&&hit.object.userData.tank;
      if(tut&&tut.desafio==='tiro'&&by&&by.isPlayer&&kind==='shell'&&t&&t.target0&&!t.dead){ try{ hitMark(hit,1,'Penetración',dir); }catch(e){} destroy(t,by,false); return; }
      return _a.apply(this,arguments); }; }
  { const _fg=fireGun; fireGun=function(t){ const r=_fg.apply(this,arguments); if(tut&&tut.desafio&&t&&t.isPlayer&&r!==false) tut.shots++; return r; }; }
})();
