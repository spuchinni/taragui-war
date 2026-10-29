/* ---------- Versión para celulares y tablets (pedido de Sebastián: su sobrino y los amigos juegan en el celular) ----------
   Se activa sola en pantallas táctiles sin mouse (o con ?movil=1; ?movil=0 la apaga). Mismo juego y mismas partidas online que en la PC:
   - palanca a la izquierda para manejar (aparece donde apoyás el pulgar), deslizar a la derecha para mirar y apuntar;
   - botones: disparar, ametralladora, mira del artillero, zoom, marcar, tabla y pausa; la barra de munición y apoyos se toca;
   - HUD más chico (body.movil en juego.css), calidad gráfica baja por defecto, aviso para poner el celular acostado
     y, en iPhone, para agregarlo a la pantalla de inicio (así abre a pantalla completa). */
const MOVIL=/[?&]movil=1/.test(location.search)||(!/[?&]movil=0/.test(location.search)&&('ontouchstart' in window||navigator.maxTouchPoints>0)&&matchMedia('(pointer:coarse)').matches);
const IOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const STANDALONE=matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;
if(MOVIL){
  document.body.classList.add('movil'); if(IOS) document.body.classList.add('ios');
  freeAim=true; fsAuto=!IOS&&fsAuto;                                  // sin bloqueo del puntero; en iPhone no existe la pantalla completa (se usa la app de inicio)
  try{ const S=JSON.parse(localStorage.getItem('tw_settings')||'null'); if(!S||!S.gfx){ gfx='baja'; applyGfx(); } }catch(e){}
  // Pantalla completa en Android: además deja el celular acostado
  const _efs=enterFS; enterFS=function(){ if(IOS) return; _efs(); try{ const p=screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape'); if(p&&p.catch) p.catch(()=>{}); }catch(e){} };
  // sin mouse no hay giro por el borde de la pantalla (el último toque quedaba como "mouse en el borde" y la cámara giraba sola)
  edgeTurn=function(){}; mx=-1;
  // los carteles de "mouse libre" no tienen sentido acá
  const _ban=banner; banner=function(t,s,d){ if(/^Mouse libre|Pantalla completa bloqueada/.test(t)) return;
    if(s) s=s.replace(/^Clic en el mapa/,'Tocá el mapa').replace(/ \(abajo\): donde apuntás/,' otra vez: donde apuntás').replace('Esc: cancelar','☰: cancelar'); return _ban(t,s,d); };

  // ---- controles en pantalla ----
  const ui=document.createElement('div'); ui.id='tch';
  ui.innerHTML=`<div id="tStick"><i></i></div>
    <button data-t="menu" class="tb tMenu" aria-label="Pausa">☰</button>
    <button data-t="tab" class="tb tTab" aria-label="Jugadores">👥</button>
    <button data-t="ping" class="tb tPing" aria-label="Marcar">❗</button>
    <button data-t="fire" class="tb tFire" aria-label="Disparar">🔥</button>
    <button data-t="mg" class="tb tMg" aria-label="Ametralladora">⁞⁞</button>
    <button data-t="scope" class="tb tScope" aria-label="Mira">◎</button>
    <button data-t="zoom" class="tb tZoom" aria-label="Zoom">🔍</button>`;
  document.body.appendChild(ui);
  const rot=document.createElement('div'); rot.id='rotar'; rot.innerHTML='<div>📱↻</div><p>Girá el celular y ponelo acostado para jugar</p>'; document.body.appendChild(rot);
  const stick=ui.querySelector('#tStick'), knob=stick.querySelector('i'), R=52;
  const T={stick:null,look:null,hold:new Map()};
  const setKey=(a,v)=>{ keys[binds[a]]=v; };
  // tocar una tecla = mandar el mismo evento que el teclado (así sirve igual online y en el tutorial)
  const tapKey=a=>{ const c=binds[a]; if(!c) return; document.dispatchEvent(new KeyboardEvent('keydown',{code:c,bubbles:true})); setTimeout(()=>document.dispatchEvent(new KeyboardEvent('keyup',{code:c,bubbles:true})),60); };
  const SLOT={a0:'ammo1',a1:'ammo2',a2:'ammo3',auto:'ammoAuto',arty:'arty',air:'air',nuke:'nuke',rep:'repair',crew:'crewSwap',smk:'smoke',ext:'ext',th:'thermal',tr:'troops'};
  function pauseMenu(){ if(state!=='play') return; releaseAll(); stickOff(); state='paused'; if(engGain) engGain.gain.value=0; $('overlay').style.display='flex';
    $('panel').innerHTML=`<h1>Pausa</h1><p>La batalla te espera.</p><button class="go" id="resume">Volver al combate</button><button class="go alt" id="quit">Abandonar</button>`;
    $('resume').onclick=()=>lock(); $('quit').onclick=()=>{clearBattle();mainMenu();}; }
  function press(b,on){ const t=b.dataset.t; b.classList.toggle('on',on);
    if(t==='fire') mouseDown=on; else if(t==='mg') setKey('mg',on); else if(t==='zoom') rightDown=on;
    else if(!on) return; else if(t==='scope'){ if(player&&!player.dead) scopeOn=!scopeOn; }
    else if(t==='tab') tabBoard(!tabOn); else if(t==='ping'){ if(player&&!player.dead) doPing(); }
    else if(t==='menu'){ if(artyPick) artyMap(false); else pauseMenu(); } }
  function stickSet(dx,dy){ const d=Math.hypot(dx,dy), k=d>R?R/d:1; knob.style.transform=`translate(${dx*k}px,${dy*k}px)`;
    const x=dx/R, y=dy/R; setKey('fwd',y<-.3); setKey('back',y>.35); setKey('left',x<-.35); setKey('right',x>.35); }
  function stickOff(){ T.stick=null; stick.classList.remove('on'); knob.style.transform=''; stick.style.left=stick.style.top=''; for(const a of ['fwd','back','left','right']) setKey(a,false); }
  const inGame=()=>state==='play'&&!artyPick;
  document.addEventListener('touchstart',e=>{
    for(const t of e.changedTouches){ const el=t.target, b=el.closest&&el.closest('[data-t]');
      if(b&&state==='play'){ T.hold.set(t.identifier,b); press(b,true); e.preventDefault(); continue; }
      const s=el.closest&&el.closest('#ammoSlots .as'); if(s&&state==='play'){ tapKey(SLOT[s.dataset.id]); e.preventDefault(); continue; }
      if(!inGame()||el!==renderer.domElement) continue; e.preventDefault();
      if(t.clientX<innerWidth*.42&&t.clientY>innerHeight*.3&&!T.stick){ T.stick={id:t.identifier,x:t.clientX,y:t.clientY}; stick.style.left=(t.clientX-60)+'px'; stick.style.top=(t.clientY-60)+'px'; stick.classList.add('on'); stickSet(0,0); }
      else if(!T.look) T.look={id:t.identifier,x:t.clientX,y:t.clientY}; } },{passive:false});
  document.addEventListener('touchmove',e=>{ let used=false;
    for(const t of e.changedTouches){
      if(T.stick&&t.identifier===T.stick.id){ stickSet(t.clientX-T.stick.x,t.clientY-T.stick.y); used=true; }
      else if(T.look&&t.identifier===T.look.id){ const dx=t.clientX-T.look.x, dy=t.clientY-T.look.y; T.look.x=t.clientX; T.look.y=t.clientY; used=true;
        if(state!=='play') continue; const s=.0048*sens*(scoped?Math.max(.08,camera.fov/65):1);
        camYaw=wrap(camYaw-dx*s); camPitch=clamp(camPitch-dy*s,-.45,camMaxP()); }
      else if(T.hold.has(t.identifier)) used=true; }
    if(used) e.preventDefault(); },{passive:false});
  const end=e=>{ for(const t of e.changedTouches){
      if(T.stick&&t.identifier===T.stick.id) stickOff();
      if(T.look&&t.identifier===T.look.id) T.look=null;
      const b=T.hold.get(t.identifier); if(b){ T.hold.delete(t.identifier); press(b,false); } } };
  document.addEventListener('touchend',end); document.addEventListener('touchcancel',end);
  // si la batalla se corta (pausa, muerte, fin), nada queda apretado
  setInterval(()=>{ if(state!=='play'&&(T.stick||T.look||T.hold.size||mouseDown)){ stickOff(); T.look=null; T.hold.forEach(b=>b.classList.remove('on')); T.hold.clear(); mouseDown=rightDown=false; setKey('mg',false); } },300);

  // ---- resolución automática: si el celular no llega a ~24 cuadros por segundo baja la resolución; si sobra, la sube (hasta la de la calidad elegida) ----
  { let n=0, t0=performance.now(), pr=null;
    const tick=now2=>{ requestAnimationFrame(tick); if(state!=='play'){ n=0; t0=now2; return; } n++; const dt=now2-t0; if(dt<4000) return;
      const fps=n*1000/dt; n=0; t0=now2; const max=Math.min(devicePixelRatio,Q().pr); if(pr==null||pr>max) pr=max;
      const np=fps<24?Math.max(.4,pr-.1):fps>50?Math.min(max,pr+.1):pr;
      if(Math.abs(np-pr)>.01){ pr=np; renderer.setPixelRatio(pr); renderer.setSize(innerWidth,innerHeight); } };
    requestAnimationFrame(tick); }

  // ---- hangar: girar el tanque con el dedo ----
  renderer.domElement.addEventListener('touchstart',e=>{ if(hangarOn()&&hg&&e.touches.length===1) hg.drag=e.touches[0].clientX; },{passive:true});
  renderer.domElement.addEventListener('touchmove',e=>{ if(hg&&hg.drag!=null&&hangarOn()){ const x=e.touches[0].clientX; hg.yaw-=(x-hg.drag)*.008; hg.drag=x; } },{passive:true});
  renderer.domElement.addEventListener('touchend',()=>{ if(hg) hg.drag=null; });

  // ---- menú principal: cambia el aviso de teclado y, en iPhone, explica cómo instalarlo ----
  function fixHome(){ const c=document.querySelector('.homeCopy'); if(!c||c.dataset.mv) return; c.dataset.mv=1;
    for(const n of c.childNodes) if(n.nodeType===3&&n.textContent.includes('necesita teclado')) n.textContent=n.textContent.replace('necesita teclado y mouse','versión para celular');   // sin tocar el botón de la intro
    if(IOS&&!STANDALONE) c.insertAdjacentHTML('beforeend',' · <span class="iosTip">Para jugar a pantalla completa: <b>Compartir</b> → <b>Agregar a inicio</b></span>');
    }
  // tutorial y carteles: nombran los botones de la pantalla en vez de las teclas
  const TLBL={fwd:'palanca ↑',back:'palanca ↓',left:'palanca ←',right:'palanca →',scope:'◎',mg:'⁞⁞',ammo1:'la 1.ª munición (abajo)',ammo2:'la 2.ª munición (abajo)',ammo3:'la 3.ª munición (abajo)',
    ammoAuto:'AUTO (abajo)',arty:'✸ (abajo)',air:'✈ (abajo)',nuke:'☢ (abajo)',repair:'🔧 (abajo)',crewSwap:'👤 (abajo)',smoke:'☁ (abajo)',ext:'🧯 (abajo)',thermal:'◐ (abajo)',troops:'⇩ (abajo)',ping:'❗'};
  const _kn=keyName; keyName=function(c){ const a=Object.keys(binds).find(k=>binds[k]===c); return a&&TLBL[a]?TLBL[a]:_kn(c); };
  const TUT_TXT=[[/Mové el mouse para mirar/g,'Deslizá el dedo para mirar'],[/la rueda cambia el aumento, clic derecho hace zoom/g,'🔍 hace zoom'],[/Clic izquierdo dispara/g,'🔥 dispara'],
    [/mantené el clic/g,'mantené apretado 🔥'],[/hacé clic sobre/g,'tocá'],[/hacé clic donde/g,'tocá donde'],[/hacé clic/gi,'tocá']];
  const _st=showTut; showTut=function(){ const r=_st.apply(this,arguments); const b=$('tutbox'); if(b){ let h=b.innerHTML; for(const [re,t] of TUT_TXT) h=h.replace(re,t); if(h!==b.innerHTML) b.innerHTML=h; } return r; };
  // ajustes: explica los controles táctiles en vez de las teclas
  const _rs=renderSettings; renderSettings=function(){ const r=_rs.apply(this,arguments);
    for(const h of document.querySelectorAll('.settings h2,#panel h2')){ if(h.textContent==='Mouse') h.textContent='Sensibilidad del dedo';
      if(h.textContent==='Teclas'){ h.classList.add('noMovil'); const n=h.nextElementSibling; if(n&&n.tagName==='P') n.classList.add('noMovil'); } }
    for(const p of document.querySelectorAll('p.s')) if(/^Clic izquierdo/.test(p.textContent)) p.textContent='Palanca a la izquierda: manejar (aparece donde apoyás el pulgar). Deslizá el dedo a la derecha: mirar y apuntar. 🔥 cañón, ⁞⁞ ametralladora (mantener), ◎ entra y sale de la mira, 🔍 zoom (mantener). Tocá la barra de abajo para cambiar munición, pedir artillería o bombardeo (después tocá el mapa), reparar y demás. ☰ pausa.';
    return r; };
  const _mm=mainMenu; mainMenu=function(){ const r=_mm.apply(this,arguments); fixHome(); return r; }; fixHome();
}
