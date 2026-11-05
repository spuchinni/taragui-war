// Ver partida: cámara libre y automático (pedido de Sebastián: "ver correr el juego, moverme libremente por los mapas y un
// modo automático"). En el modo Ver partida (state 'spectate') aparece una barra abajo:
//  · 🎥 Cámara libre (L): volar por el mapa. W A S D o flechas = moverse, Q/E (o Espacio/Ctrl) = subir y bajar, Mayús = rápido,
//    arrastrar con el mouse = mirar, rueda = velocidad. En el celular: arrastrar con un dedo mira y avanza hacia donde mira,
//    dos dedos = subir/bajar. No atraviesa el suelo.
//  · 🎬 Automático (P): la cámara hace de director todo el tiempo (vista aérea que se acerca y se aleja y después sigue de
//    cerca al tanque que está peleando; `specDir` de elegir.js) y cuando termina la partida arranca sola otra en otro mapa
//    (el mazo de mapas de la época), sin parar.
//  · ✈ Aérea (Espacio) y ◀ ▶ (flechas) = cambiar de tanque, como antes.
//  · ☰ Unidades (U): lista de unidades para seguir una y ver desde ella (más abajo).
(function(){
  const F={on:false,pos:new THREE.Vector3(),yaw:0,pitch:-.15,speed:16,keys:{},drag:null,touch:null};
  let AUTO=false; try{ AUTO=localStorage.getItem('tw2_autover')==='1'; } catch(e){}
  window.freeCam=F;
  // barra de botones
  const bar=document.createElement('div'); bar.id='specBar'; bar.className='hud';
  bar.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:calc(58px + env(safe-area-inset-bottom,0px));display:none;gap:8px;z-index:6;pointer-events:auto';
  const mk=(id,txt,title)=>`<button id="${id}" title="${title}" style="font:700 15px 'Saira Condensed',system-ui,sans-serif;padding:7px 13px;border-radius:4px;border:1px solid rgba(232,200,120,.5);background:rgba(16,20,26,.78);color:#f2e6c8;cursor:pointer">${txt}</button>`;
  bar.innerHTML=mk('fcPrev','◀','Tanque anterior (flecha izquierda)')+mk('fcAer','✈ Aérea','Vista aérea (Espacio)')+mk('fcFree','🎥 Cámara libre','Volar libremente por el mapa (L)')+mk('fcAuto','🎬 Automático','La cámara elige sola y sigue de mapa en mapa (P)')+mk('fcNext','▶','Tanque siguiente (flecha derecha)');
  document.body.appendChild(bar);
  const isMob=()=>typeof MOVIL!=='undefined'&&MOVIL;   // movil.js se carga después que este archivo
  const $b=id=>document.getElementById(id);
  function paint(){ const on=(b,v)=>{ b.style.background=v?'rgba(200,150,40,.85)':'rgba(16,20,26,.78)'; b.style.color=v?'#1a1408':'#f2e6c8'; };
    on($b('fcFree'),F.on); on($b('fcAuto'),AUTO); on($b('fcAer'),!F.on&&typeof aerial!=='undefined'&&aerial); }
  function setFree(v){ F.on=v; if(v){ F.pos.copy(camera.position); const d=new THREE.Vector3(); camera.getWorldDirection(d); F.yaw=Math.atan2(d.x,d.z); F.pitch=clamp(Math.asin(d.y),-1.4,1.4); AUTO=false; saveAuto(); } paint(); }
  function saveAuto(){ try{ localStorage.setItem('tw2_autover',AUTO?'1':'0'); }catch(e){} }
  function setAuto(v){ AUTO=v; saveAuto(); if(v){ F.on=false; if(window.specDir) specDir.last=0; } paint(); }
  $b('fcFree').onclick=e=>{ e.stopPropagation(); setFree(!F.on); };
  $b('fcAuto').onclick=e=>{ e.stopPropagation(); setAuto(!AUTO); };
  $b('fcAer').onclick=e=>{ e.stopPropagation(); setFree(false); setAuto(false); aerial=!aerial; paint(); };
  $b('fcPrev').onclick=e=>{ e.stopPropagation(); setFree(false); setAuto(false); specIdx--; aerial=false; paint(); };
  $b('fcNext').onclick=e=>{ e.stopPropagation(); setFree(false); setAuto(false); specIdx++; aerial=false; paint(); };
  bar.addEventListener('mousedown',e=>e.stopPropagation(),true);
  // teclado
  document.addEventListener('keydown',e=>{ if(state!=='spectate') return;
    if(e.code==='KeyL'){ if(window.superUser&&superUser.on) setFree(!F.on); return; } if(e.code==='KeyP'){ setAuto(!AUTO); return; }
    if(F.on){ F.keys[e.code]=true; if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault(); }
    else if(AUTO&&['ArrowLeft','ArrowRight','Space'].includes(e.code)) setAuto(false);
    setTimeout(paint,0); },true);
  document.addEventListener('keyup',e=>{ F.keys[e.code]=false; });
  // mouse: arrastrar para mirar; rueda = velocidad
  document.addEventListener('mousedown',e=>{ if(state==='spectate'&&F.on&&e.target===renderer.domElement){ F.drag={x:e.clientX,y:e.clientY}; e.stopPropagation(); } },true);
  document.addEventListener('mousemove',e=>{ if(!F.drag) return; F.yaw-=(e.clientX-F.drag.x)*.0045; F.pitch=clamp(F.pitch-(e.clientY-F.drag.y)*.0045,-1.45,1.45); F.drag={x:e.clientX,y:e.clientY}; });
  document.addEventListener('mouseup',()=>{ F.drag=null; });
  renderer.domElement.addEventListener('wheel',e=>{ if(state!=='spectate'||!F.on) return; e.preventDefault(); e.stopPropagation(); F.speed=clamp(F.speed*(e.deltaY<0?1.15:.87),3,120); },{passive:false,capture:true});
  // ---- celular ----
  // Cámara libre: palanca donde se apoya el pulgar izquierdo (mitad izquierda) para moverse, arrastrar en la mitad derecha
  // para mirar, botones ▲ ▼ para subir y bajar y ⚡ para ir rápido. Vista aérea: arrastrar gira, pellizcar acerca.
  const joy=document.createElement('div'); joy.id='fcJoy';
  joy.style.cssText='position:fixed;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;border:2px solid rgba(242,230,200,.45);background:rgba(16,20,26,.25);display:none;z-index:6;pointer-events:none';
  joy.innerHTML='<div style="position:absolute;left:50%;top:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:rgba(242,230,200,.55)"></div>'; document.body.appendChild(joy); const knob=joy.firstChild;
  const side=document.createElement('div'); side.id='fcSide'; side.style.cssText='position:fixed;right:calc(14px + env(safe-area-inset-right,0px));top:32%;display:none;flex-direction:column;gap:10px;z-index:6';
  const sb=(id,t)=>`<button id="${id}" style="width:58px;height:58px;border-radius:50%;border:1px solid rgba(232,200,120,.5);background:rgba(16,20,26,.7);color:#f2e6c8;font:700 24px system-ui">${t}</button>`;
  side.innerHTML=sb('fcUp','▲')+sb('fcDn','▼')+sb('fcFast','⚡'); document.body.appendChild(side);
  const hold=(id,k)=>{ const b=$b(id); b.addEventListener('touchstart',e=>{ e.preventDefault(); e.stopPropagation(); F.keys[k]=true; },{passive:false}); b.addEventListener('touchend',e=>{ e.preventDefault(); F.keys[k]=false; },{passive:false}); };
  hold('fcUp','KeyE'); hold('fcDn','KeyQ');
  $b('fcFast').addEventListener('touchstart',e=>{ e.preventDefault(); e.stopPropagation(); F.fast=!F.fast; $b('fcFast').style.background=F.fast?'rgba(200,150,40,.85)':'rgba(16,20,26,.7)'; },{passive:false});
  F.joy=null; F.look=null; let pinch=null;
  const cv=renderer.domElement;
  cv.addEventListener('touchstart',e=>{ if(state!=='spectate') return;
    for(const t of e.changedTouches){
      if(F.on){ if(t.clientX<innerWidth*.45&&!F.joy){ F.joy={id:t.identifier,x0:t.clientX,y0:t.clientY,dx:0,dy:0}; joy.style.left=t.clientX+'px'; joy.style.top=t.clientY+'px'; joy.style.display='block'; knob.style.transform=''; }
        else if(!F.look) F.look={id:t.identifier,x:t.clientX,y:t.clientY}; }
      else if(aerial){ if(e.touches.length===2){ const a=e.touches[0], b=e.touches[1]; pinch={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),z:aer.zoom}; F.look=null; } else if(!F.look) F.look={id:t.identifier,x:t.clientX,y:t.clientY}; } } },{passive:true});
  cv.addEventListener('touchmove',e=>{ if(state!=='spectate') return;
    if(!F.on&&aerial&&pinch&&e.touches.length>=2){ const a=e.touches[0], b=e.touches[1], d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY); aer.zoom=clamp(pinch.z*pinch.d/Math.max(20,d),.25,1.4); return; }
    for(const t of e.changedTouches){
      if(F.joy&&t.identifier===F.joy.id){ let dx=t.clientX-F.joy.x0, dy=t.clientY-F.joy.y0; const L=Math.hypot(dx,dy), m=50; if(L>m){ dx*=m/L; dy*=m/L; } F.joy.dx=dx/m; F.joy.dy=dy/m; knob.style.transform=`translate(${dx}px,${dy}px)`; }
      else if(F.look&&t.identifier===F.look.id){ const dx=t.clientX-F.look.x, dy=t.clientY-F.look.y; F.look.x=t.clientX; F.look.y=t.clientY;
        if(F.on){ F.yaw-=dx*.006; F.pitch=clamp(F.pitch-dy*.006,-1.45,1.45); } else if(aerial) aer.yaw-=dx*.006; } } },{passive:true});
  cv.addEventListener('touchend',e=>{ for(const t of e.changedTouches){ if(F.joy&&t.identifier===F.joy.id){ F.joy=null; joy.style.display='none'; } if(F.look&&t.identifier===F.look.id) F.look=null; } if(e.touches.length<2) pinch=null; },{passive:true});
  function freeStep(dt){ const k=F.keys, fast=k.ShiftLeft||k.ShiftRight||F.fast?3:1, v=F.speed*fast*dt;
    const fx=Math.sin(F.yaw), fz=Math.cos(F.yaw), rx=Math.cos(F.yaw), rz=-Math.sin(F.yaw);
    let f=(k.KeyW||k.ArrowUp?1:0)-(k.KeyS||k.ArrowDown?1:0)-(F.joy?F.joy.dy:0), s=(k.KeyD||k.ArrowRight?1:0)-(k.KeyA||k.ArrowLeft?1:0)+(F.joy?F.joy.dx:0), u=(k.KeyE||k.Space?1:0)-(k.KeyQ||k.ControlLeft||k.KeyC?1:0);
    F.pos.x+=(fx*f-rx*s)*v; F.pos.z+=(fz*f-rz*s)*v; F.pos.y+=u*v+(f*Math.sin(F.pitch)*v);
    F.pos.x=clamp(F.pos.x,-W.bx-60,W.bx+60); F.pos.z=clamp(F.pos.z,-W.bz-60,W.bz+60);   // solo el sector del mapa
    const g=Math.max(heightAt(F.pos.x,F.pos.z),W.water!=null?W.water:-1e9)+1.4; if(F.pos.y<g) F.pos.y=g; F.pos.y=Math.min(F.pos.y,600);
    camera.position.copy(F.pos); const cp=Math.cos(F.pitch); camera.lookAt(F.pos.x+Math.sin(F.yaw)*cp,F.pos.y+Math.sin(F.pitch),F.pos.z+Math.cos(F.yaw)*cp);
    camera.fov=65; camera.updateProjectionMatrix();
    const st=document.getElementById('specT'); if(st) st.innerHTML=isMob()?`Palanca a la izquierda para moverte · arrastrá a la derecha para mirar · ▲ ▼ subir y bajar`:`WASD moverse · Q/E bajar/subir · Mayús rápido · arrastrar mira · ${Math.round(F.speed*fast)} m/s`; }
  const _sc=spectatorCam;
  spectatorCam=function(dt){ if(state==='spectate'&&F.on){ freeStep(dt); return true; } if(state==='spectate'&&U.t){ unitCam(U.t,dt); return U.t; } if(state==='spectate'&&AUTO&&window.specDir&&specDir.last>0&&performance.now()-specDir.last<6000) specDir.last=0;
    const r=_sc.apply(this,arguments);
    if(isMob()&&state==='spectate'){ const st=document.getElementById('specT'); if(st){ if(aerial) st.textContent=AUTO?'Automático: la cámara elige sola':'Vista aérea · arrastrá para girar, pellizcá para acercar, tocá un tanque para seguirlo';
        else st.innerHTML=st.innerHTML.replace(/\. Clic o flechas para cambiar, espacio para vista aérea/,' · ◀ ▶ para cambiar de tanque'); } }
    return r; };
  // mostrar la barra solo mirando una partida; en automático, al terminar arranca otra partida en otro mapa
  let endT=0;
  setInterval(()=>{ const sp=state==='spectate'; bar.style.display=sp?'flex':'none'; side.style.display=sp&&F.on&&isMob()?'flex':'none'; if(!F.on&&F.joy){ F.joy=null; joy.style.display='none'; } if(!sp&&F.on&&state!=='spectate') F.on=false; if(sp) paint();
    if(AUTO&&spectating&&(state==='end'||state==='summary')){ if(!endT) endT=performance.now(); if(performance.now()-endT>12000){ endT=0;
        try{ clearBattle(); startBattle(true); setTimeout(()=>{ const b=document.getElementById('briefGo'); if(b) b.click(); },400); }catch(e){ console.warn('auto',e); } } }
    else endT=0; },500);
  // ---- Unidades (pedido de Sebastián: "un listadito al costado para ir seleccionando las unidades y ver desde ellas, tipo
  // testing"): panel a la izquierda con todos los tanques y cañones por bando; tocar uno lo sigue (U.t) con cuatro vistas:
  // persecución, artillero (por la mira, con el aumento real), comandante (arriba de la torre, mirando hacia donde gira) y
  // órbita (arrastrar gira alrededor, rueda acerca). Arrastrar en las otras vistas también mira para los costados.
  const U={t:null,view:'chase',oy:0,op:0,od:1,drag:null,open:null};   // open null = según el aparato (en el celular, cerrado)
  try{ const s=localStorage.getItem('tw2_unidades'); if(s!=null) U.open=s==='1'; }catch(e){}
  window.specUnits=U;
  const pnl=document.createElement('div'); pnl.id='specList'; pnl.className='hud';
  pnl.style.cssText="position:fixed;left:calc(10px + env(safe-area-inset-left,0px));top:64px;width:250px;max-height:calc(100vh - 190px);display:none;flex-direction:column;z-index:6;pointer-events:auto;background:rgba(16,20,26,.82);border:1px solid rgba(232,200,120,.4);border-radius:5px;font:600 13px 'Saira Condensed',system-ui,sans-serif;color:#f2e6c8";
  const vb=(v,t,ti)=>`<button data-v="${v}" title="${ti}" style="flex:1;font:700 12px 'Saira Condensed',system-ui;padding:5px 2px;border:1px solid rgba(232,200,120,.35);border-radius:3px;background:rgba(30,36,44,.9);color:#f2e6c8;cursor:pointer">${t}</button>`;
  pnl.innerHTML=`<div style="display:flex;align-items:center;padding:6px 8px;border-bottom:1px solid rgba(232,200,120,.25)"><b style="flex:1;font-size:15px">Unidades</b><span id="ulN" style="opacity:.7"></span></div>
    <div id="ulV" style="display:flex;gap:3px;padding:5px 6px">${vb('chase','🎯 Atrás','Persecución')+vb('gun','🔭 Mira','Mira del artillero')+vb('cmd','👁 Jefe','Desde la escotilla del comandante')+vb('orbit','🔄 Órbita','Girar alrededor (arrastrar y rueda)')}</div>
    <div id="ulI" style="padding:2px 8px 6px;font-size:12px;line-height:1.35;display:none"></div>
    <div id="ulL" style="overflow-y:auto;flex:1;padding:0 4px 6px;-webkit-overflow-scrolling:touch"></div>`;
  document.body.appendChild(pnl);
  bar.insertAdjacentHTML('afterbegin',mk('fcList','☰ Unidades','Lista de unidades para seguir y ver desde ellas (U)'));
  const uid=t=>t._uid||(t._uid=++uid.n); uid.n=0;
  const natL=t=>{ const n=NATIONS[t.crew?t.crew.nation:t.T.nation]; return n?n.label:''; };
  function follow(t){ if(U.t&&U.t!==t&&U.t.root) U.t.root.visible=true; U.t=t; U.oy=0; U.op=0; if(t){ F.on=false; AUTO=false; saveAuto(); aerial=false; } paint(); listHTML(true); }
  function setView(v){ U.view=v; U.oy=0; U.op=0; U.od=1; if(U.t&&U.t.root) U.t.root.visible=true; paintV(); }
  function paintV(){ for(const b of pnl.querySelectorAll('#ulV button')){ const on=b.dataset.v===U.view; b.style.background=on?'rgba(200,150,40,.85)':'rgba(30,36,44,.9)'; b.style.color=on?'#1a1408':'#f2e6c8'; } }
  pnl.querySelector('#ulV').onclick=e=>{ const b=e.target.closest('button'); if(!b) return; e.stopPropagation(); setView(b.dataset.v); if(!U.t){ const l=tanks.filter(t=>!t.dead); if(l.length) follow(l[0]); } };
  pnl.querySelector('#ulL').onclick=e=>{ const r=e.target.closest('[data-u]'); if(!r) return; e.stopPropagation(); const t=tanks.find(o=>uid(o)==r.dataset.u); if(t) follow(U.t===t?null:t); };
  for(const ev of ['mousedown','touchstart','wheel']) pnl.addEventListener(ev,e=>e.stopPropagation(),{capture:true,passive:true});
  $b('fcList').onclick=e=>{ e.stopPropagation(); U.open=!(U.open??!isMob()); try{ localStorage.setItem('tw2_unidades',U.open?'1':'0'); }catch(e){} listHTML(true); };
  let lastSig='';
  function listHTML(force){ if(U.open==null) U.open=!isMob(); if(isMob()){ pnl.style.top='8px'; pnl.style.maxHeight='calc(100vh - 112px)'; pnl.style.width='230px'; } pnl.style.display=state==='spectate'&&U.open&&SU.on?'flex':'none'; if(pnl.style.display==='none') return;
    const L=tanks.slice().sort((a,b)=>a.team-b.team||(a.T.static?1:0)-(b.T.static?1:0));
    const sig=L.map(t=>uid(t)+(t.dead?'d':'')+(U.t===t?'s':'')+Math.round(t.hp/Math.max(1,t.T.hp)*10)).join(',');
    if(!force&&sig===lastSig) return; lastSig=sig;
    pnl.querySelector('#ulN').textContent=L.filter(t=>!t.dead).length+' vivas';
    let h='', tm=null;
    for(const t of L){ if(t.team!==tm){ tm=t.team; h+=`<div style="margin:6px 4px 2px;font-size:12px;letter-spacing:.06em;color:${tm===0?'var(--ally)':'var(--enemy)'}">${tm===0?'▲ BANDO A':'▼ BANDO B'}</div>`; }
      const hp=Math.max(0,Math.round(t.hp/Math.max(1,t.T.hp)*100)), sel=U.t===t;
      h+=`<div data-u="${uid(t)}" style="display:flex;align-items:center;gap:6px;padding:4px 5px;margin:1px 0;border-radius:3px;cursor:pointer;${sel?'background:rgba(200,150,40,.35);':''}${t.dead?'opacity:.42;':''}">
        <span style="width:8px;height:8px;border-radius:50%;flex:none;background:${t.team===0?'var(--ally)':'var(--enemy)'}"></span>
        <span style="flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.T.static?'⛬ ':''}${t.T.label}<span style="opacity:.6;font-weight:500"> · ${t.isPlayer||t.crew&&t.crew.human?'👤 ':''}${t.name||''}</span></span>
        <span style="font-size:11px;opacity:.85">${t.dead?'✖':hp+'%'}</span></div>`; }
    pnl.querySelector('#ulL').innerHTML=h; }
  function info(t){ const el=pnl.querySelector('#ulI'); if(!t){ el.style.display='none'; return; } el.style.display='block';
    const hp=Math.max(0,Math.round(t.hp/Math.max(1,t.T.hp)*100)), tg=t.target&&!t.target.dead?t.target.T.label:'—';
    const m=t.mod||{}, bad=[(t.trkHP||[]).some(v=>v<=0)?'oruga':null,m.engine<=0?'motor':null,m.breech<=0?'cierre':null,(m.barrel??100)<=0?'cañón':null,t.fireT>0?'🔥 incendio':null].filter(Boolean);
    el.innerHTML=`<b style="color:${t.team===0?'var(--ally)':'var(--enemy)'}">${t.T.label}</b> · ${natL(t)}<br>${t.dead?'<span style="color:var(--enemy)">Destruido</span>':`Vida ${hp}% · ${Math.round(Math.abs(t.speed)*3.6)} km/h · ${t.reloadT>0?'recarga '+t.reloadT.toFixed(1)+' s':'listo'}`}<br>Blanco: ${tg}${bad.length?'<br><span style="color:var(--amber)">Roto: '+bad.join(', ')+'</span>':''}`; }
  // mirar arrastrando mientras se sigue una unidad (y que el clic no cambie de tanque)
  document.addEventListener('mousedown',e=>{ if(state==='spectate'&&!F.on&&U.t&&e.target===renderer.domElement){ U.drag={x:e.clientX,y:e.clientY}; e.stopPropagation(); } },true);
  document.addEventListener('mousemove',e=>{ if(!U.drag) return; U.oy-=(e.clientX-U.drag.x)*.005; U.op=clamp(U.op-(e.clientY-U.drag.y)*.004,-.9,1.1); U.drag={x:e.clientX,y:e.clientY}; });
  document.addEventListener('mouseup',()=>{ U.drag=null; });
  renderer.domElement.addEventListener('wheel',e=>{ if(state!=='spectate'||F.on||!U.t) return; e.preventDefault(); e.stopPropagation(); U.od=clamp(U.od*(e.deltaY<0?.88:1.14),.35,4); },{passive:false,capture:true});
  cv.addEventListener('touchstart',e=>{ if(state!=='spectate'||F.on||!U.t) return; const t=e.changedTouches[0]; if(e.touches.length===2){ const a=e.touches[0], b=e.touches[1]; U.pinch={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),z:U.od}; U.drag=null; } else U.drag={x:t.clientX,y:t.clientY,id:t.identifier}; },{passive:true});
  cv.addEventListener('touchmove',e=>{ if(state!=='spectate'||F.on||!U.t) return;
    if(U.pinch&&e.touches.length>=2){ const a=e.touches[0], b=e.touches[1]; U.od=clamp(U.pinch.z*U.pinch.d/Math.max(20,Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)),.35,4); return; }
    for(const t of e.changedTouches) if(U.drag&&t.identifier===U.drag.id){ U.oy-=(t.clientX-U.drag.x)*.007; U.op=clamp(U.op-(t.clientY-U.drag.y)*.005,-.9,1.1); U.drag.x=t.clientX; U.drag.y=t.clientY; } },{passive:true});
  cv.addEventListener('touchend',e=>{ if(e.touches.length<2) U.pinch=null; if(!e.touches.length) U.drag=null; },{passive:true});
  const _v=new THREE.Vector3(), _d=new THREE.Vector3();
  function unitCam(t,dt){ const V=U.view; t.root.updateMatrixWorld(true); let fov=65;
    t.root.visible=!(V==='gun'&&!t.dead);
    if(V==='gun'&&!t.dead&&t.gunPivot&&t.barrel){ const p=t.gunPivot.getWorldPosition(_v); p.y+=.35; const gd=t.barrel.getWorldDirection(_d);
      const gy=Math.atan2(gd.x,gd.z)+U.oy*.15, gp=Math.asin(clamp(gd.y,-1,1))+U.op*.15; camera.position.copy(p);
      camera.lookAt(p.x+Math.sin(gy)*Math.cos(gp),p.y+Math.sin(gp),p.z+Math.cos(gy)*Math.cos(gp));
      const mags=t.T.optic||[5]; fov=2*Math.atan(Math.tan(17*Math.PI/180)/(mags[0]*U.od**-1))*180/Math.PI; fov=clamp(fov,2,70); }
    else if(V==='cmd'&&!t.dead){ const p=_v.copy(t.pos); p.y+=(t.topH||2.4)+.55; const y=t.heading+t.turretYaw+U.oy, pc=-.05+U.op;
      camera.position.copy(p); camera.lookAt(p.x+Math.sin(y)*Math.cos(pc),p.y+Math.sin(pc),p.z+Math.cos(y)*Math.cos(pc)); fov=clamp(62/U.od,8,80); }
    else if(V==='orbit'){ U.oa=(U.oa??t.heading)+(U.drag?0:dt*.12); const y=U.oa+U.oy, pc=clamp(.35+U.op,.05,1.35), D=Math.max(8,t.T.m.L*2.2)*U.od;
      const c=_v.copy(t.pos); c.y+=(t.topH||2)*.6; camera.position.set(c.x-Math.sin(y)*Math.cos(pc)*D,c.y+Math.sin(pc)*D,c.z-Math.cos(y)*Math.cos(pc)*D);
      camera.position.y=Math.max(camera.position.y,heightAt(camera.position.x,camera.position.z)+1); camera.lookAt(c); }
    else { camYaw=stepAng(camYaw,t.heading+t.turretYaw,dt*1.5); const y=camYaw+U.oy, pc=clamp(.18+U.op,-.3,1.2); const k0=chaseK; chaseK=U.od;
      chaseCam(t,dt,new THREE.Vector3(Math.sin(y)*Math.cos(pc),Math.sin(pc),Math.cos(y)*Math.cos(pc))); chaseK=k0; }
    camera.fov=fov; camera.updateProjectionMatrix();
    const st=document.getElementById('specT'); if(st) st.innerHTML=`<span style="color:${t.team===0?'var(--ally)':'var(--enemy)'}">${t.name||''}</span>, ${t.T.label} (${natL(t)})${t.dead?' · destruido':''} · ${isMob()?'arrastrá para mirar, pellizcá para acercar':'arrastrá para mirar, rueda para acercar'}`;
    info(t); }
  document.addEventListener('keydown',e=>{ if(state!=='spectate') return; if(e.code==='KeyU'&&SU.on){ U.open=!(U.open??!isMob()); listHTML(true); }
    if(U.t&&!F.on&&['Digit1','Digit2','Digit3','Digit4'].includes(e.code)) setView(['chase','gun','cmd','orbit'][+e.code.slice(5)-1]); });
  // ◀ ▶ y la vista aérea dejan de seguir la unidad elegida; ◀ ▶ pasan a la siguiente de la lista si había una elegida
  const step=d=>{ const L=tanks.filter(t=>!t.dead).sort((a,b)=>a.team-b.team); if(!L.length) return; const i=L.indexOf(U.t); follow(L[((i<0?0:i+d)%L.length+L.length)%L.length]); };
  $b('fcPrev').onclick=e=>{ e.stopPropagation(); if(U.t){ step(-1); return; } setFree(false); setAuto(false); specIdx--; aerial=false; paint(); };
  $b('fcNext').onclick=e=>{ e.stopPropagation(); if(U.t){ step(1); return; } setFree(false); setAuto(false); specIdx++; aerial=false; paint(); };
  for(const id of ['fcAer','fcFree','fcAuto']){ const b=$b(id), f=b.onclick; b.onclick=e=>{ follow(null); f(e); }; }
  setInterval(()=>{ if(U.t&&(!tanks.includes(U.t)||state!=='spectate')){ if(U.t.root) U.t.root.visible=true; U.t=null; if(state!=='spectate') info(null); } listHTML(false); },500);
  paintV();
  // ---- Superusuario para probar (pedido de Sebastián: "yo voy a ser como un super usuario para testear; los demás solo ven la
  // partida"). Solo con su cuenta (se compara el hash del mail; el aparato lo recuerda en tw2_super) o `?super=1` en localhost.
  // Los demás ven ◀ ▶, Aérea y Automático. Él además tiene: cámara libre, lista de unidades, clic en el minimapa = ir ahí con la
  // cámara libre, ⏩ velocidad ×1/×2/×4/×8 (V; se simula varias veces por cuadro sin dibujar) y ⏭ mapa siguiente (N; recorre
  // en orden los mapas de la época, sin esperar a que termine la batalla).
  const SU={on:false,spd:1,skip:false}; window.superUser=SU;
  const SU_H='d00b6ca80289605a41d2f27bdc6392c3c8e232d7f335a92fe17a7f6c92e07019';
  try{ if(localStorage.getItem('tw2_super')==='1') SU.on=true; }catch(e){}
  if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&/[?&]super=1/.test(location.search)) SU.on=true;
  let suMail='';
  setInterval(async()=>{ const u=typeof nube!=='undefined'&&nube.user; const m=u&&u.emailVerified?String(u.email||'').toLowerCase():''; if(m===suMail) return; suMail=m;
    if(!m||!crypto.subtle) return; const h=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(m)))].map(b=>b.toString(16).padStart(2,'0')).join('');
    if(h===SU_H){ SU.on=true; try{ localStorage.setItem('tw2_super','1'); }catch(e){} } },2000);
  bar.insertAdjacentHTML('beforeend',mk('fcSpd','⏩ ×1','Velocidad de la batalla (V)')+mk('fcMap','⏭ Mapa','Pasar al mapa siguiente (N)'));
  const st2=document.createElement('style'); st2.textContent='body.spec.su #mm{pointer-events:auto;cursor:crosshair}'; document.head.appendChild(st2);
  const SU_ONLY=['fcFree','fcList','fcSpd','fcMap'];
  function suPaint(){ document.body.classList.toggle('su',SU.on&&state==='spectate'); for(const id of SU_ONLY) $b(id).style.display=SU.on?'':'none';
    if(!SU.on&&F.on) F.on=false;
    const b=$b('fcSpd'); b.textContent='⏩ ×'+SU.spd; b.style.background=SU.spd>1?'rgba(200,150,40,.85)':'rgba(16,20,26,.78)'; b.style.color=SU.spd>1?'#1a1408':'#f2e6c8';
    const L=typeof eraMaps==='function'?eraMaps(curEra):[], i=L.indexOf(builtKey), nk=L[(i+1)%Math.max(1,L.length)];
    $b('fcMap').title=nk&&WORLDS[nk]?`Mapa siguiente: ${WORLDS[nk].label} (${(i+1)%L.length+1} de ${L.length}) · N`:'Mapa siguiente (N)'; }
  function cycleSpd(){ SU.spd=SU.spd>=8?1:SU.spd*2; suPaint(); }
  function nextMap(){ const L=eraMaps(curEra); if(!L.length) return; const k=L[(L.indexOf(builtKey)+1)%L.length]; follow(null); F.on=false;
    try{ clearBattle(); startBattle(true,k); setTimeout(()=>{ const b=document.getElementById('briefGo'); if(b) b.click(); },400); }catch(e){ console.warn('mapa siguiente',e); } }
  $b('fcSpd').onclick=e=>{ e.stopPropagation(); cycleSpd(); };
  $b('fcMap').onclick=e=>{ e.stopPropagation(); nextMap(); };
  document.addEventListener('keydown',e=>{ if(!SU.on||!['spectate','end','summary'].includes(state)) return; if(e.code==='KeyN'){ e.stopPropagation(); nextMap(); } else if(e.code==='KeyV'&&state==='spectate') cycleSpd(); },true);
  // clic o toque en el minimapa: la cámara libre va a ese lugar (40 m de alto, mirando hacia el punto)
  mm.addEventListener('pointerdown',e=>{ if(state!=='spectate'||!SU.on||artyPick) return; e.preventDefault(); e.stopPropagation();
    const p=mmWorld(e); follow(null); setFree(true); F.pitch=-.55; const d=55; F.pos.set(p.x-Math.sin(F.yaw)*d,Math.max(heightAt(p.x,p.z),W.water??-1e9)+38,p.z-Math.cos(F.yaw)*d); paint(); });
  // velocidad: se corre la simulación varias veces por cuadro y se dibuja solo la última
  const _rr=renderer.render.bind(renderer); renderer.render=function(){ if(SU.skip) return; return _rr.apply(null,arguments); };
  const _fr=frame; frame=function(dt){ const k=state==='spectate'&&SU.on?SU.spd:1;
    if(k>1){ SU.skip=true; try{ for(let i=1;i<k&&state==='spectate';i++) _fr(dt); } finally{ SU.skip=false; } }
    return _fr.apply(this,arguments); };
  setInterval(()=>{ if(state==='spectate') suPaint(); else if(SU.spd>1&&state==='menu') SU.spd=1; document.body.classList.toggle('su',SU.on&&state==='spectate'); },500);
  suPaint();
})();
