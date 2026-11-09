// Arranque nuevo y partidas rápidas (pedido de Sebastián: "a los que probaron no les gustó arrancar lento, con tanques débiles
// y con demasiadas cosas"). Va después de primeras.js y antes de inicio.js.
//  · Primera vez: antes de la primera batalla se elige el tanque entre los tres famosos (Sherman, T-34, Panzer IV); el elegido
//    queda PRESTADO y primero en el garaje las primeras 3 batallas (tw2_elegido, PROG.loan).
//  · Menú simple las primeras 3 batallas: "Jugar ahora" va derecho a la batalla (sin hangar) y solo están Jugar, el tanque
//    (con "Cambiar") y Opciones. Desde la 3ª aparecen Campaña, Vehículos y Tutorial con un aviso (tw2_menuFull).
//  · Partida rápida (por defecto, tw2_modo='rapida'): las bases salen a QUICK_R m del punto del medio y la batalla dura
//    QUICK_LEN s; al terminar el tiempo gana el que tiene más barra. "Grande" = como antes (mapas de 1,5 km, 12–15 min).
//    Se elige en el hangar. No corre en tutorial, campaña, misiones, espectador ni para los invitados online (decide el anfitrión).
// Textos en los dos idiomas acá mismo (data-notr).
(function(){
  const EN=()=>window.LANG==='en';
  const LS=(k,v)=>{ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } };
  const battles=()=>(typeof PROG!=='undefined'&&PROG&&PROG.stats&&PROG.stats.battles)||0;
  const PICK=[{n:'us',k:'m4a1',es:'Confiable y fácil de manejar. Buen cañón para todo.',en:'Reliable and easy to drive. A good all-round gun.'},
              {n:'ru',k:'t34',es:'Rápido, con blindaje inclinado que hace rebotar los tiros.',en:'Fast, with sloped armor that makes shots bounce.'},
              {n:'de',k:'pz4h',es:'Cañón largo y preciso: perfora de lejos.',en:'Long, accurate gun: penetrates from far away.'}];
  const QUICK_R=200, QUICK_LEN=300;

  // ---- estilos ----
  const st=document.createElement('style'); st.textContent=`
    #tkPick{position:fixed;inset:0;z-index:60;display:none;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:16px;
      background:radial-gradient(ellipse at center,rgba(30,28,20,.96),rgba(0,0,0,.97));color:#fff;font:600 18px 'Saira Condensed',system-ui,sans-serif;text-align:center}
    #tkPick h2{margin:0;font:800 38px 'Saira Condensed',system-ui,sans-serif;color:#ffd24a;letter-spacing:.02em}
    #tkPick .sub{opacity:.8;margin-top:-6px}
    #tkPick .row{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;max-width:1100px}
    #tkPick .c{width:min(320px,88vw);background:rgba(22,24,28,.95);border:2px solid rgba(232,200,120,.35);border-radius:14px;padding:10px 12px 14px;cursor:pointer;
      transition:transform .12s,border-color .12s;color:#fff;font:inherit}
    #tkPick .c:hover,#tkPick .c:focus{transform:translateY(-4px);border-color:#ffd24a;outline:none}
    #tkPick .c img{width:100%;aspect-ratio:16/9;object-fit:contain;display:block}
    #tkPick .c b{display:block;font:800 26px 'Saira Condensed',system-ui,sans-serif;color:#ffd24a;margin-top:4px}
    #tkPick .c i{display:block;font-style:normal;opacity:.7;font-size:15px;letter-spacing:.06em;text-transform:uppercase}
    #tkPick .c span{display:block;margin-top:6px;font-size:17px;opacity:.92}
    #tkPick .x{position:absolute;top:14px;right:16px;font-size:26px;background:none;border:0;color:#fff;cursor:pointer;opacity:.7}
    .homeTank{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(76px + env(safe-area-inset-bottom,0px));z-index:6;display:flex;gap:8px;align-items:center;
      background:rgba(16,20,26,.8);border:1px solid rgba(232,200,120,.45);border-radius:8px;padding:6px 8px 6px 14px;font:600 17px 'Saira Condensed',system-ui,sans-serif;color:#f2e6c8}
    .homeTank b{color:#ffd24a} .homeTank button{font:700 15px 'Saira Condensed',system-ui,sans-serif;padding:4px 10px}
    body.movil .homeTank{bottom:calc(64px + env(safe-area-inset-bottom,0px));font-size:14px}
    .hgModeB{margin:0 0 6px;width:100%}
    #quickClock{position:fixed;left:50%;top:calc(46px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:8;pointer-events:none;display:none;
      font:800 20px 'Saira Condensed',system-ui,sans-serif;color:#fff;text-shadow:0 2px 6px #000,0 0 2px #000}`;
  document.head.appendChild(st);

  // ---- 1) elegir el primer tanque ----
  // El elegido es PRESTADO para las primeras 3 batallas (PROG.loan): al terminar la 3ª se devuelve y queda el primero de la línea (primeras.js).
  function returnLoan(){ const L=PROG&&PROG.loan; if(!L||L.done) return;
    try{ if(!L.was){ delete PROG.owned[L.k]; delete PROG.unlocked[L.k]; const g=garRef(L.n,3), i=g.indexOf(L.k); if(i>=0) g.splice(i,1); } }catch(e){} }
  window.returnLoan=returnLoan;
  function giveTank(n,k){
    try{ curEra=3; applyEraNations(3); chosenNation=n;
      if(PROG.loan&&!PROG.loan.done&&PROG.loan.k!==k) returnLoan();
      if(!PROG.loan||PROG.loan.done||PROG.loan.k!==k) PROG.loan={k,n,was:owned(k)};
      PROG.unlocked[k]=1; PROG.owned[k]=1;
      const g=garRef(n,3), i=g.indexOf(k); if(i>=0) g.splice(i,1); g.unshift(k); if(g.length>3) g.length=3;
      if(typeof hgSel!=='undefined') hgSel=k; saveProg(); LS('tw2_elegido',k); }catch(e){ console.warn('rapida: tanque',e); } }
  const box=document.createElement('div'); box.id='tkPick'; box.setAttribute('data-notr',''); document.body.appendChild(box);
  function picker(then,closable){
    const L=EN();
    box.innerHTML=`${closable?'<button class="x" id="tkPickX">✕</button>':''}<h2>${L?'Choose your tank':'Elegí tu tanque'}</h2>
      <div class="sub">${L?'The most famous tanks of World War II. We lend it to you for your first 3 battles.':'Los tanques más famosos de la Segunda Guerra. Te lo prestamos para tus primeras 3 batallas.'}</div>
      <div class="row">${PICK.filter(p=>VEH[p.k]).map(p=>`<button class="c" data-k="${p.k}"><img class="vmini" data-k="${p.k}" alt="">
        <b>${VEH[p.k].label}</b><i>${NATIONS[p.n]?NATIONS[p.n].label:''}</i><span>${L?p.en:p.es}</span></button>`).join('')}</div>`;
    box.style.display='flex';
    if(typeof miniPedir==='function') miniPedir(PICK.map(p=>p.k));
    box.querySelectorAll('.c').forEach(b=>b.onclick=()=>{ const p=PICK.find(q=>q.k===b.dataset.k); giveTank(p.n,p.k); box.style.display='none'; if(then) then(); });
    const x=document.getElementById('tkPickX'); if(x) x.onclick=()=>{ box.style.display='none'; }; }
  window.tkPicker=picker;

  // ---- arranque directo de una batalla (sin hangar, sin resumen del mapa ni despliegue) ----
  function directBattle(){
    try{ initAudio(); if(AC&&AC.state==='suspended') AC.resume(); }catch(e){}
    if(typeof netName!=='undefined'&&!netName){ netName=(EN()?'Player':'Jugador')+(1000+((Math.random()*9000)|0)); LS('tw-name',netName); }
    curEra=3; applyEraNations(3); startBattle(false);
    const tick=setInterval(()=>{ if(state==='brief'&&$('briefGo')) $('briefGo').click();
      else if(state==='deploy'&&typeof doDeploy==='function'){ try{ doDeploy(); }catch(e){} }
      else if(state==='play'){ clearInterval(tick); } },250);
    setTimeout(()=>clearInterval(tick),20000); }

  // ---- 2) menú simple las primeras 3 batallas ----
  const _mm=mainMenu;
  mainMenu=function(){ const r=_mm.apply(this,arguments);
    const b=document.getElementById('playB'); if(!b||!document.body.classList.contains('home')) return r;
    const L=EN(), nb=battles();
    if(!LS('tw2_elegido')&&nb<1){ const orig=b.onclick; b.onclick=()=>picker(orig); return r; }   // la primera vez: elegir el tanque y después la batalla con el entrenador
    if(nb<3){
      for(const id of ['campB','vehB','tutB']){ const e=document.getElementById(id); if(e) e.style.display='none'; }
      b.onclick=directBattle;
      const k=(garRef(chosenNation,3)||[])[0]; if(k&&VEH[k]){
        const t=document.createElement('div'); t.className='homeTank'; t.setAttribute('data-notr','');
        t.innerHTML=`${L?'Your tank':'Tu tanque'}: <b>${VEH[k].label}</b>${PROG.loan&&!PROG.loan.done&&PROG.loan.k===k?` <small>(${L?'on loan':'prestado'})</small>`:''}<button id="tkChg">${L?'Change':'Cambiar'}</button>`;
        $('panel').appendChild(t); document.getElementById('tkChg').onclick=()=>picker(()=>mainMenu(),true); }
    } else if(!LS('tw2_menuFull')){ LS('tw2_menuFull','1');
      setTimeout(()=>{ try{ banner(L?'New!':'¡Nuevo!',L?'Campaign, Vehicles and Tutorial are now open':'Se abrieron Campaña, Vehículos y Tutorial',4); }catch(e){} },600); }
    return r; };

  // ---- 3) partida rápida ----
  const modo=()=>LS('tw2_modo')||'rapida';
  const Q={on:false,t0:null};
  const _sb=startBattle; startBattle=function(spectator,forceMap,special){
    const first=window.coach&&(window.coach.closeNext);   // la primera batalla tiene su propio reloj de 2 minutos (arranque.js)
    Q.on=modo()==='rapida'&&!spectator&&!special&&!first&&!(typeof net!=='undefined'&&net.guest); Q.t0=null;
    const r=_sb.apply(this,arguments); if(tut||curSpecial) Q.on=false; return r; };
  const _sc=spawnCrew; spawnCrew=function(crew,key,sp){
    if(Q.on&&sp&&typeof zones!=='undefined'&&zones&&zones.length){ let Z=zones[0]; for(const z of zones) if(Math.hypot(z.x,z.z)<Math.hypot(Z.x,Z.z)) Z=z;
      const dx=sp.x-Z.x, dz=sp.z-Z.z, d=Math.hypot(dx,dz); if(d>QUICK_R){ const k=QUICK_R/d; sp={...sp,x:Z.x+dx*k,z:Z.z+dz*k}; } }
    return _sc.call(this,crew,key,sp); };
  const clock=document.createElement('div'); clock.id='quickClock'; clock.setAttribute('data-notr',''); document.body.appendChild(clock);
  const mmss=s=>{ s=Math.max(0,Math.ceil(s)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
  (function tick(){ requestAnimationFrame(tick);
    const on=Q.on&&['play','paused','lesson'].includes(state)&&!(window.coach&&window.coach.first);
    if(!on){ clock.style.display='none'; return; }
    if(Q.t0==null) Q.t0=now;
    const left=QUICK_LEN-(now-Q.t0);
    if(left<=0&&state==='play'){ Q.on=false; clock.style.display='none'; finish(tickets[0]>=tickets[1]?0:1); return; }
    clock.textContent='⏱ '+mmss(left); clock.style.color=left<=30?'#ffd24a':'#fff'; clock.style.display='block'; })();
  const _fin=finish; finish=function(){ Q.on=false; clock.style.display='none'; return _fin.apply(this,arguments); };

  // botón en el hangar: Rápida (5 min) / Grande
  const _rh=renderHangar; renderHangar=function(){ const r=_rh.apply(this,arguments);
    const go=document.querySelector('.hgGo'), md=go&&go.querySelector('.hgModes');
    if(md&&playMode==='battle'){ const L=EN(), q=modo()==='rapida';
      md.insertAdjacentHTML('beforebegin',`<button class="hgMapB hgModeB" id="hgModeB" data-notr title="${L?'Battle length':'Duración de la batalla'}">${q?(L?'⏱ Quick battle: <b>5 min, close bases</b>':'⏱ Batalla rápida: <b>5 min, bases cerca</b>'):(L?'🗺 Big battle: <b>full map, 12–15 min</b>':'🗺 Batalla grande: <b>mapa entero, 12–15 min</b>')}</button>`);
      document.getElementById('hgModeB').onclick=()=>{ LS('tw2_modo',q?'grande':'rapida'); mainMenu(); }; }
    return r; };
})();
