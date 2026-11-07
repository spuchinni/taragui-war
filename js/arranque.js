// Arranque directo (pedido de Sebastián, para CrazyGames: "que en el primer minuto quede claro qué hacer, sin leer").
// La primera vez que alguien toca "Jugar ahora" entra derecho a una batalla contra bots: sin hangar, sin pedir nombre,
// sin pantalla de despliegue (sale con el primer tanque). Adentro, un entrenador con dibujos y flechas en pantalla, un
// paso por vez, que avanza solo cuando el jugador lo hace:
//   1) moverse (teclas W A S D o la palanca del celular) · 2) apuntar con el mouse y disparar (clic o 🔥)
//   3) flecha roja al enemigo más cercano hasta destruir uno · 4) flecha amarilla al punto para capturarlo.
// Se guarda en tw2_arranque (ya entró una vez) y tw2_coach (terminó el entrenador). ?coach=1 lo fuerza para probar.
(function(){
  const LS=(k,v)=>{ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } };
  const FORCE=/[?&]coach=1/.test(location.search);
  const isMob=()=>typeof MOVIL!=='undefined'&&MOVIL;
  const newbie=()=>FORCE||(!LS('tw2_arranque')&&typeof PROG!=='undefined'&&progBat(PROG)<1);
  const C={on:false,step:0,t0:0,start:null,fired:false,kills0:0,doneT:0,auto:false};
  window.coach=C;
  // ---- entrada directa ----
  function quickStart(){
    try{ initAudio(); if(AC&&AC.state==='suspended') AC.resume(); }catch(e){}
    if(typeof netName!=='undefined'&&!netName){ netName=(window.LANG==='en'?'Player':'Jugador')+(1000+((Math.random()*9000)|0)); LS('tw-name',netName); }
    LS('tw2_arranque','1'); C.auto=true; C.on=!LS('tw2_coach')||FORCE; C.step=0; C.closeNext=true;
    const era=typeof curEra!=='undefined'?curEra:3, map=era===3&&WORLDS.alamein?'alamein':null;   // desierto abierto: se ve todo
    startBattle(false,map); try{ applyWeather('dia'); }catch(e){}           // la primera, de día y despejado
    const tick=setInterval(()=>{ if(state==='brief'&&$('briefGo')){ $('briefGo').click(); }
      else if(state==='deploy'&&typeof doDeploy==='function'){ try{ doDeploy(); }catch(e){} }
      else if(state==='play'){ clearInterval(tick); C.auto=false; } },250);
    setTimeout(()=>clearInterval(tick),20000); }
  // ---- primera batalla corta: los dos bandos salen cerca del punto del medio ----
  // En El Alamein las bases quedan a ~1 km una de otra y el primer enemigo tardaba más de un minuto en aparecer.
  // Solo en la batalla de "Jugar ahora": cada base se acerca a CLOSE m del punto más central (≈350 m entre bandos),
  // también al reaparecer. Las demás batallas no cambian.
  const CLOSE=170;
  const _sb=startBattle; startBattle=function(){ C.close=!!C.closeNext; C.closeNext=false; return _sb.apply(this,arguments); };
  const _sc=spawnCrew; spawnCrew=function(crew,key,sp){
    if(C.close&&sp&&zones&&zones.length){ let Z=zones[0]; for(const z of zones) if(Math.hypot(z.x,z.z)<Math.hypot(Z.x,Z.z)) Z=z;
      const dx=sp.x-Z.x, dz=sp.z-Z.z, d=Math.hypot(dx,dz);
      if(d>CLOSE){ const k=CLOSE/d; sp={...sp,x:Z.x+dx*k,z:Z.z+dz*k}; } }
    return _sc.call(this,crew,key,sp); };
  const _mm=mainMenu;
  mainMenu=function(){ const r=_mm.apply(this,arguments); const b=document.getElementById('playB'); if(b&&newbie()) b.onclick=quickStart; return r; };
  // ---- seguimiento de lo que hace el jugador ----
  const _fg=fireGun; fireGun=function(t){ const r=_fg.apply(this,arguments); if(t&&t===player) C.fired=true; return r; };
  // ---- dibujo ----
  const cv=document.createElement('canvas'); cv.id='coachC'; cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:7';
  document.body.appendChild(cv); const g=cv.getContext('2d');
  const card=document.createElement('div'); card.id='coachCard';
  card.style.cssText="position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:8;pointer-events:none;display:none;text-align:center;font:800 26px 'Saira Condensed',system-ui,sans-serif;color:#fff;text-shadow:0 2px 6px #000,0 0 2px #000;letter-spacing:.02em";
  document.body.appendChild(card);
  const key=(k,hl)=>`<span style="display:inline-block;min-width:46px;height:46px;line-height:44px;margin:3px;padding:0 8px;border-radius:7px;border:2px solid ${hl?'#ffd24a':'#f2e6c8'};background:rgba(16,20,26,.78);font:800 22px system-ui;color:${hl?'#ffd24a':'#fff'};box-shadow:0 3px 0 rgba(0,0,0,.6)">${k}</span>`;
  const mouse=`<svg width="40" height="56" viewBox="0 0 40 56" style="vertical-align:middle;margin:0 6px"><rect x="3" y="3" width="34" height="50" rx="17" fill="rgba(16,20,26,.8)" stroke="#f2e6c8" stroke-width="3"/><path d="M20 3v20M3 23h34" stroke="#f2e6c8" stroke-width="3"/><path d="M5 21V20a15 15 0 0 1 15-15v16z" fill="#ffd24a"/></svg>`;
  function cardHTML(){ const P=C.step;
    if(P===0) return isMob()?`<div>🕹 Usá la palanca de la izquierda para moverte</div>`:`<div>${key('W')}</div><div>${key('A')}${key('S')}${key('D')}</div><div style="margin-top:6px">Moverse</div>`;
    if(P===1) return isMob()?`<div>Arrastrá a la derecha para apuntar · tocá 🔥 para disparar</div>`:`<div>${mouse} Apuntá con el mouse · <span style="color:#ffd24a">clic</span> para disparar</div>`;
    if(P===2) return `<div style="color:#ff6a50">Destruí un tanque enemigo</div><div style="font-size:18px;opacity:.9">Seguí la flecha roja · pegale de costado</div>`;
    if(P===3){ const Z=target(); return `<div style="color:#ffd24a">Capturá el punto ${Z?Z.id:''}</div><div style="font-size:18px;opacity:.9">Entrá al círculo y quedate adentro</div>`; }
    if(P===4) return `<div style="color:#7ce07c">¡Muy bien! Ya sabés jugar</div><div style="font-size:18px;opacity:.9">Capturá los puntos y destruí a los enemigos para ganar</div>`;
    return ''; }
  function nearestEnemy(){ let b=null,bd=3000; for(const t of tanks) if(!t.dead&&t.team!==player.team&&!t.T.static){ const d=t.pos.distanceTo(player.pos); if(d<bd){bd=d;b=t;} } return b; }
  function target(){ if(C.step===2){ const e=nearestEnemy(); return e?{pos:e.pos.clone().setY(e.pos.y+(e.topH||2.4)+1.5),col:'#ff4a36',txt:'Enemigo',d:e.pos.distanceTo(player.pos)}:null; }
    if(C.step===3){ let b=null,bd=1e9; for(const Z of zones) if(Z.owner!==1){ const d=Math.hypot(Z.x-player.pos.x,Z.z-player.pos.z); if(d<bd){bd=d;b=Z;} }
      return b?{id:b.id,pos:new THREE.Vector3(b.x,heightAt(b.x,b.z)+6,b.z),col:'#ffd24a',txt:'Punto '+b.id,d:bd}:null; }
    return null; }
  const _v=new THREE.Vector3();
  function arrow(T,now){ const W=innerWidth,H=innerHeight; g.save(); g.fillStyle=T.col; g.strokeStyle='rgba(0,0,0,.75)'; g.lineWidth=3;
    g.font="800 18px 'Saira Condensed',system-ui,sans-serif"; g.textAlign='center';
    const p=project(T.pos), M=70, lbl=`${T.txt} · ${Math.round(T.d)} m`;
    if(p&&p.x>M&&p.x<W-M&&p.y>M&&p.y<H-M){ const bob=Math.sin(now*6)*7, y=p.y-28+bob;   // encima del blanco: flecha que apunta hacia abajo
      g.beginPath(); g.moveTo(p.x,y+22); g.lineTo(p.x-18,y-6); g.lineTo(p.x-7,y-6); g.lineTo(p.x-7,y-30); g.lineTo(p.x+7,y-30); g.lineTo(p.x+7,y-6); g.lineTo(p.x+18,y-6); g.closePath(); g.stroke(); g.fill();
      g.strokeText(lbl,p.x,y-38); g.fill(); g.fillText(lbl,p.x,y-38); }
    else { _v.copy(T.pos).applyMatrix4(camera.matrixWorldInverse); let x=_v.x, y=_v.y; if(_v.z>0){ x=-x; y=-y; } if(Math.abs(x)+Math.abs(y)<1e-3) y=-1;
      const a=Math.atan2(-y,x), cx=W/2, cy=H/2, rx=W/2-60, ry=H/2-70, ex=cx+Math.cos(a)*rx, ey=cy+Math.sin(a)*ry, pulse=1+.12*Math.sin(now*7);
      g.translate(ex,ey); g.rotate(a); g.scale(pulse,pulse); g.beginPath(); g.moveTo(34,0); g.lineTo(-6,-24); g.lineTo(-6,-10); g.lineTo(-30,-10); g.lineTo(-30,10); g.lineTo(-6,10); g.lineTo(-6,24); g.closePath(); g.stroke(); g.fill();
      g.setTransform(1,0,0,1,0,0); const lx=ex-Math.cos(a)*56, ly=ey-Math.sin(a)*48+6; g.strokeText(lbl,lx,ly); g.fillText(lbl,lx,ly); }
    g.restore(); }
  let last='';
  function loop(){ requestAnimationFrame(loop);
    if(cv.width!==innerWidth||cv.height!==innerHeight){ cv.width=innerWidth; cv.height=innerHeight; }
    g.clearRect(0,0,cv.width,cv.height);
    const live=C.on&&state==='play'&&typeof player!=='undefined'&&player&&!player.dead&&!scoped;
    // HUD simple mientras dura el entrenador (pedido de Sebastián tras el rechazo de CrazyGames: el primer minuto tenía demasiados datos):
    // sin cintas de ametralladora, telemetría, línea de estado ni apoyos; quedan munición, tripulación, minimapa y tickets.
    document.body.classList.toggle('novato',!!(C.on&&(state==='play'||state==='paused')));
    if(!live){ card.style.display='none'; return; }
    const now=performance.now()/1000;
    if(!C.start||C.start.ref!==player){ C.start={ref:player,x:player.pos.x,z:player.pos.z}; if(C.step<1) C.step=0; C.t0=now; C.kills0=(playerCrew&&playerCrew.kills)||0; }
    // avanzar
    const moved=Math.hypot(player.pos.x-C.start.x,player.pos.z-C.start.z);
    if(C.step===0&&moved>20){ C.step=1; C.t0=now; C.fired=false; }
    else if(C.step===1&&C.fired&&now-C.t0>1){ C.step=2; C.t0=now; C.kills0=(playerCrew&&playerCrew.kills)||0; }
    else if(C.step===2&&((playerCrew&&playerCrew.kills>C.kills0)||now-C.t0>100||!nearestEnemy())){ C.step=3; C.t0=now; }
    else if(C.step===3&&(zones.some(Z=>Z.owner===1&&Math.hypot(Z.x-player.pos.x,Z.z-player.pos.z)<Z.r+5)||now-C.t0>120)){ C.step=4; C.t0=now; }
    else if(C.step===4&&now-C.t0>5){ C.on=false; LS('tw2_coach','1'); card.style.display='none'; return; }
    if(C.step<=1&&typeof bannerT!=='undefined'&&bannerT>0){ card.style.display='none'; return; }   // primero el cartel del centro ("Desplegado en…"): se pisaban
    const h=cardHTML(); if(h!==last){ card.innerHTML=h; last=h; } card.style.display='block';
    card.style.top=C.step<=1?(isMob()?'40%':'14%'):(isMob()?'64px':'72px');   // en la PC arriba: en el 58 % tapaba el tanque
    const T=target(); if(T) arrow(T,now); }
  requestAnimationFrame(loop);
  // probar: ?coach=1 prende el entrenador también en cualquier batalla
  if(FORCE) C.on=true;

  // ---- primera batalla de 2 minutos (pedido de Sebastián: "que solo dure dos minutos"; antes duraba ~13 min con 400 tickets) ----
  // Reloj abajo al centro con el objetivo. Al llegar a cero gana el equipo con más puntos (tickets; primeras.js los explica
  // a los 30 s y los hace bajar) y si empatan, gana tu equipo: es la primera partida. Después, un resumen simple (la tabla completa queda detrás de un botón).
  // Textos en los dos idiomas acá mismo (data-notr: el traductor no los toca). ?corta=1 fuerza la batalla corta para probar.
  const FIRST_LEN=120, EN=()=>window.LANG==='en';
  const FORCE_SHORT=/[?&]corta=1/.test(location.search);
  const _sb2=startBattle; startBattle=function(){ const first=C.closeNext||FORCE_SHORT; const r=_sb2.apply(this,arguments); C.first=first; C.firstT=null; return r; };
  const clock=document.createElement('div'); clock.id='firstClock'; clock.setAttribute('data-notr','');
  clock.style.cssText="position:fixed;left:50%;bottom:118px;transform:translateX(-50%);z-index:8;pointer-events:none;display:none;font:800 22px 'Saira Condensed',system-ui,sans-serif;color:#fff;text-shadow:0 2px 6px #000,0 0 2px #000;white-space:nowrap";
  document.body.appendChild(clock);
  const mmss=s=>{ s=Math.max(0,Math.ceil(s)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
  function firstWinner(){ return tickets[1]>tickets[0]+.5?1:0; }
  (function tick(){ requestAnimationFrame(tick);
    const on=C.first&&['play','paused'].includes(state)&&!net.on;
    if(!on){ clock.style.display='none'; return; }
    if(C.firstT==null) C.firstT=now;
    const left=FIRST_LEN-(now-C.firstT);
    if(left<=0&&state==='play'){ clock.style.display='none'; C.first=false; C.firstEnd=true; C.on=false; LS('tw2_coach','1'); finish(firstWinner()); return; }
    const goal=C.on?'':(EN()?' · Hold the points until the end to win':' · Mantené los puntos hasta el final para ganar');
    clock.textContent='⏱ '+mmss(left)+goal; clock.style.color=left<=15?'#ffd24a':'#fff'; clock.style.display='block'; })();
  // resumen simple de la primera batalla
  const _sum=summary; summary=function(winner){
    const simple=C.firstEnd; C.firstEnd=false; const y0=PROG?PROG.yp||0:0;
    const r=_sum.apply(this,arguments); if(!simple) return r;
    try{ const P=$('panel'), me=playerCrew||crews.find(c=>c.isPlayer), win=winner===0, yp=Math.max(0,Math.round((PROG?PROG.yp||0:0)-y0));
      const kept=[...P.children].filter(el=>!['again','menuB','cgPremio'].includes(el.id)); kept.forEach(el=>el.style.display='none');
      const k=me?me.kills|0:0, cp=me?me.caps|0:0, n=v=>v.toLocaleString(EN()?'en-US':'es-AR');
      const box=document.createElement('div'); box.setAttribute('data-notr',''); box.style.cssText='width:100%;max-width:640px;margin:6vh auto 18px;text-align:center';
      const line='display:block;max-width:none;margin:.35em auto;text-align:center';
      box.innerHTML=`<h1 style="font-size:64px;margin:.1em 0;text-align:center">${win?(EN()?'Victory!':'¡Victoria!'):(EN()?'Defeat':'Derrota')}</h1>`+
        `<p style="${line};font-size:22px">${EN()?`You destroyed <b>${k}</b> ${k===1?'tank':'tanks'} · captured <b>${cp}</b> ${cp===1?'point':'points'}`:`Destruiste <b>${k}</b> ${k===1?'tanque':'tanques'} · capturaste <b>${cp}</b> ${cp===1?'punto':'puntos'}`}</p>`+
        (yp?`<p style="${line};font-size:20px;color:var(--amber)">+🐆 ${n(yp)} ${EN()?'silver to buy new tanks in the hangar':'de plata para comprar tanques nuevos en el hangar'}</p>`:'')+
        `<div id="firstBtns" style="margin-top:22px"></div><button class="go alt" id="detB" style="margin-top:14px;font-size:15px;opacity:.85">${EN()?'Show scoreboard':'Ver la tabla completa'}</button>`;
      P.prepend(box);
      const bt=box.querySelector('#firstBtns'), a=$('again'), m=$('menuB');
      if(a){ a.setAttribute('data-notr',''); a.textContent=EN()?'Next battle':'Siguiente batalla'; a.style.fontSize='22px'; bt.appendChild(a); }
      if(m){ m.textContent=EN()?'Main menu':'Menú principal'; bt.appendChild(m); }
      $('detB').onclick=()=>{ kept.forEach(el=>el.style.display=''); box.querySelector('h1').style.display='none'; $('detB').remove(); if(a) P.appendChild(a); if(m) P.appendChild(m); };
    }catch(e){ console.warn('resumen simple',e); }
    return r; };
})();
