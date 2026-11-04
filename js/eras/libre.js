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
  // celular: un dedo mira y avanza, dos dedos suben o bajan
  renderer.domElement.addEventListener('touchstart',e=>{ if(state!=='spectate'||!F.on) return; const t=e.touches; F.touch={n:t.length,x:t[0].clientX,y:t[0].clientY,y2:t.length>1?(t[0].clientY+t[1].clientY)/2:0}; },{passive:true});
  renderer.domElement.addEventListener('touchmove',e=>{ if(!F.touch||!F.on) return; const t=e.touches;
    if(t.length>1){ const y=(t[0].clientY+t[1].clientY)/2; F.pos.y+=(F.touch.y2-y)*.05; F.touch.y2=y; }
    else { F.yaw-=(t[0].clientX-F.touch.x)*.005; F.pitch=clamp(F.pitch-(t[0].clientY-F.touch.y)*.005,-1.45,1.45); F.touch.x=t[0].clientX; F.touch.y=t[0].clientY; F.touch.fwd=1; } },{passive:true});
  renderer.domElement.addEventListener('touchend',()=>{ if(F.touch) F.touch.fwd=0; F.touch=null; },{passive:true});
  function freeStep(dt){ const k=F.keys, fast=k.ShiftLeft||k.ShiftRight?3:1, v=F.speed*fast*dt;
    const fx=Math.sin(F.yaw), fz=Math.cos(F.yaw), rx=Math.cos(F.yaw), rz=-Math.sin(F.yaw);
    let f=(k.KeyW||k.ArrowUp?1:0)-(k.KeyS||k.ArrowDown?1:0)+(F.touch&&F.touch.fwd?.6:0), s=(k.KeyD||k.ArrowRight?1:0)-(k.KeyA||k.ArrowLeft?1:0), u=(k.KeyE||k.Space?1:0)-(k.KeyQ||k.ControlLeft||k.KeyC?1:0);
    F.pos.x+=(fx*f-rx*s)*v; F.pos.z+=(fz*f-rz*s)*v; F.pos.y+=u*v+(f*Math.sin(F.pitch)*v);
    const lim=Math.max(W.bx,W.bz)+300; F.pos.x=clamp(F.pos.x,-lim,lim); F.pos.z=clamp(F.pos.z,-lim,lim);
    const g=Math.max(heightAt(F.pos.x,F.pos.z),W.water!=null?W.water:-1e9)+1.4; if(F.pos.y<g) F.pos.y=g; F.pos.y=Math.min(F.pos.y,600);
    camera.position.copy(F.pos); const cp=Math.cos(F.pitch); camera.lookAt(F.pos.x+Math.sin(F.yaw)*cp,F.pos.y+Math.sin(F.pitch),F.pos.z+Math.cos(F.yaw)*cp);
    camera.fov=65; camera.updateProjectionMatrix();
    const st=document.getElementById('specT'); if(st) st.innerHTML=MOVIL?`Cámara libre · ${Math.round(F.speed*fast)} m/s`:`WASD moverse · Q/E bajar/subir · Mayús rápido · arrastrar mira · ${Math.round(F.speed*fast)} m/s`; }
  const _sc=spectatorCam;
  spectatorCam=function(dt){ if(state==='spectate'&&F.on){ freeStep(dt); return true; } if(state==='spectate'&&AUTO&&window.specDir&&specDir.last>0&&performance.now()-specDir.last<6000) specDir.last=0; return _sc.apply(this,arguments); };
  // mostrar la barra solo mirando una partida; en automático, al terminar arranca otra partida en otro mapa
  let endT=0;
  setInterval(()=>{ const sp=state==='spectate'; bar.style.display=sp?'flex':'none'; if(!sp&&F.on&&state!=='spectate') F.on=false; if(sp) paint();
    if(AUTO&&spectating&&(state==='end'||state==='summary')){ if(!endT) endT=performance.now(); if(performance.now()-endT>12000){ endT=0;
        try{ clearBattle(); startBattle(true); setTimeout(()=>{ const b=document.getElementById('briefGo'); if(b) b.click(); },400); }catch(e){ console.warn('auto',e); } } }
    else endT=0; },500);
})();
