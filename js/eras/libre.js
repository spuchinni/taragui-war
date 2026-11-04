// Ver partida: cámara libre y automático (pedido de Sebastián: "ver correr el juego, moverme libremente por los mapas y un
// modo automático"). En el modo Ver partida (state 'spectate') aparece una barra abajo:
//  · 🎥 Cámara libre (L): volar por el mapa. W A S D o flechas = moverse, Q/E (o Espacio/Ctrl) = subir y bajar, Mayús = rápido,
//    arrastrar con el mouse = mirar, rueda = velocidad. En el celular: arrastrar con un dedo mira y avanza hacia donde mira,
//    dos dedos = subir/bajar. No atraviesa el suelo.
//  · 🎬 Automático (P): la cámara hace de director todo el tiempo (vista aérea que se acerca y se aleja y después sigue de
//    cerca al tanque que está peleando; `specDir` de elegir.js) y cuando termina la partida arranca sola otra en otro mapa
//    (el mazo de mapas de la época), sin parar.
//  · ✈ Aérea (Espacio) y ◀ ▶ (flechas) = cambiar de tanque, como antes.
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
    if(e.code==='KeyL'){ setFree(!F.on); return; } if(e.code==='KeyP'){ setAuto(!AUTO); return; }
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
    const lim=Math.max(W.bx,W.bz)+300; F.pos.x=clamp(F.pos.x,-lim,lim); F.pos.z=clamp(F.pos.z,-lim,lim);
    const g=Math.max(heightAt(F.pos.x,F.pos.z),W.water!=null?W.water:-1e9)+1.4; if(F.pos.y<g) F.pos.y=g; F.pos.y=Math.min(F.pos.y,600);
    camera.position.copy(F.pos); const cp=Math.cos(F.pitch); camera.lookAt(F.pos.x+Math.sin(F.yaw)*cp,F.pos.y+Math.sin(F.pitch),F.pos.z+Math.cos(F.yaw)*cp);
    camera.fov=65; camera.updateProjectionMatrix();
    const st=document.getElementById('specT'); if(st) st.innerHTML=isMob()?`Palanca a la izquierda para moverte · arrastrá a la derecha para mirar · ▲ ▼ subir y bajar`:`WASD moverse · Q/E bajar/subir · Mayús rápido · arrastrar mira · ${Math.round(F.speed*fast)} m/s`; }
  const _sc=spectatorCam;
  spectatorCam=function(dt){ if(state==='spectate'&&F.on){ freeStep(dt); return true; } if(state==='spectate'&&AUTO&&window.specDir&&specDir.last>0&&performance.now()-specDir.last<6000) specDir.last=0;
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
})();
