// Primeras partidas más simples (pedido de Sebastián después de probar en CrazyGames: "demasiada info sin info").
// Va después de arranque.js (usa window.coach: first/firstT de la batalla de 2 minutos).
//  · Barras en vez de números arriba (todas las batallas): verde tu equipo, roja el enemigo. Solo se gastan (la regla de
//    desgaste está en updateZones, 12-ia.js: empatados no se gasta ninguna; 1-0, 2-1, 3-0 cada vez más rápido).
//  · Pantalla por niveles según las batallas jugadas (PROG.stats.battles): 1ª limpia; 2ª suma municiones y minimapa;
//    3ª suma tripulación y blindaje; 4ª en adelante, todo. Cada parte nueva aparece con un cartelito que la explica.
//    El tutorial del menú muestra todo desde el principio. HUD_LVL=4 es la pantalla completa.
//  · 1ª batalla (se gana sí o sí): las barras no se ven ni se gastan los primeros 30 s; a los 30 s aparecen con la explicación
//    y se gastan rápido. Tus aliados son ases (puntería y recarga al máximo) y los enemigos flojos; tu barra no baja del 25 %
//    y a los 2:00 gana tu equipo (arranque.js).
//  · Batallas 1 a 3: tu tanque no recibe daño y no hay artillería ni bombardeo (todavía no se explicaron). En la 4ª se explican
//    la reparación y los apoyos y desde ahí todo funciona normal. Las batallas 2 y 3 son más cortas (barras de 150 y 250).
//  · Cada explicación nueva detiene la partida hasta que el jugador la lee y aprieta "Seguir" (antes tapaba el tanque y la acción seguía).
//  · Premio de la 1ª batalla: 1.000 de plata (antes ~4.400, casi medio tanque) y una caja misteriosa que regala el tanque con el que jugaste.
//  · En CrazyGames, un jugador nuevo arranca con Estados Unidos y un M4A1 Sherman (2ª Guerra; la portada y los videos
//    muestran el Sherman). En GitHub Pages sigue Argentina.
// Textos en los dos idiomas acá mismo (data-notr: el traductor no los toca).
(function(){
  const EN=()=>window.LANG==='en', C=window.coach||{};
  window.HUD_LVL=4; window.DRAIN_K=.42;
  const K_FIRST=.7, FLOOR_FIRST=25;
  const battles=()=>(PROG&&PROG.stats&&PROG.stats.battles)||0;
  const lvlNow=()=>tut?4:Math.min(4,battles()+1);

  // ---- estilos ----
  const st=document.createElement('style'); st.textContent=`
    body.hud1 #status,body.hud1 #ammobar,body.hud1 #mm,body.hud1 #feed,body.hud1 #counts,body.hud1 #tabB{display:none!important}
    body.hud1:not(.tkOn) #tickets{visibility:hidden}
    body.hud2 #status,body.hud2 #feed,body.hud2 #counts,body.hud2 #tabB{display:none!important}
    body.hud2 #ammobar .wt-wpn,body.hud2 #ammobar .ab-info,body.hud2 #ammoSlots .gap,body.hud2 #ammoSlots .gap~.as{display:none!important}
    body.hud3 #counts,body.hud3 #tabB{display:none!important}
    body.hud3 #status .wt-tele,body.hud3 #status .wt-state,body.hud3 #ammobar .wt-wpn,body.hud3 #ammobar .ab-info,body.hud3 #ammoSlots .gap,body.hud3 #ammoSlots .gap~.as{display:none!important}
    #tickets #tkA,#tickets #tkE{display:none!important}
    #tickets .tkBar{width:150px;height:14px;align-self:center;margin:0 8px;background:rgba(10,12,14,.65);border:1px solid rgba(239,231,210,.45);border-radius:4px;overflow:hidden;display:flex}
    #tickets .tkBar.a{justify-content:flex-end} #tickets .tkBar i{display:block;height:100%;transition:width .4s linear}
    #tickets .tkBar.a i{background:linear-gradient(180deg,#a6e27e,#5fa83c)} #tickets .tkBar.e i{background:linear-gradient(180deg,#ff7a5c,#c9381e)}
    #tickets .tkBar.low i{animation:tkLow .6s ease-in-out infinite alternate} @keyframes tkLow{to{opacity:.45}}
    #tickets .tkL{display:none;font-size:13px;letter-spacing:.08em;opacity:.85;margin:0 2px;align-self:center}
    body.hud1 #tickets .tkL,body.hud2 #tickets .tkL,body.hud3 #tickets .tkL{display:inline}
    #pHint{position:fixed;left:50%;transform:translateX(-50%);z-index:8;pointer-events:none;display:none;max-width:min(680px,92vw);text-align:center;
      font:700 20px 'Saira Condensed',system-ui,sans-serif;color:#fff;background:rgba(14,16,20,.78);border:1px solid rgba(255,210,74,.55);border-radius:10px;padding:10px 16px;
      text-shadow:0 1px 3px #000;line-height:1.25}
    #pHint b{color:#ffd24a}
    #pLesson{position:fixed;inset:0;z-index:30;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.45)}
    #pLesson .card{max-width:min(620px,92vw);background:rgba(16,18,22,.96);border:2px solid #ffd24a;border-radius:14px;padding:22px 26px 20px;text-align:center;color:#fff;
      font:600 20px 'Saira Condensed',system-ui,sans-serif;line-height:1.35;box-shadow:0 12px 40px rgba(0,0,0,.6)}
    #pLesson h2{margin:0 0 10px;font:800 30px 'Saira Condensed',system-ui,sans-serif;color:#ffd24a;letter-spacing:.02em}
    #pLesson p{margin:.45em 0} #pLesson b{color:#ffd24a} #pLesson kbd{display:inline-block;min-width:1.5em;padding:0 .35em;border:1px solid #ffd24a;border-radius:4px;background:#2a2c30;color:#ffd24a;font-weight:800}
    #pLesson .pause{font-size:14px;opacity:.7;letter-spacing:.1em;margin-bottom:6px} #pLesson button{margin-top:16px;font-size:22px;min-width:200px}
    #pGift{position:fixed;inset:0;z-index:40;display:none;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,rgba(40,34,18,.97),rgba(0,0,0,.98));
      color:#fff;font:600 20px 'Saira Condensed',system-ui,sans-serif;text-align:center;padding:16px}
    #pGift h2{margin:0 0 6px;font:800 40px 'Saira Condensed',system-ui,sans-serif;color:#ffd24a} #pGift .sub{opacity:.85;margin-bottom:18px}
    #pGift .crate{position:relative;width:220px;height:170px;cursor:pointer;animation:gWob 1.4s ease-in-out infinite;filter:drop-shadow(0 0 26px rgba(255,210,74,.45))}
    #pGift .crate .body{position:absolute;left:0;right:0;bottom:0;height:130px;border-radius:8px;background:repeating-linear-gradient(90deg,#8a5a2b 0 34px,#7a4d23 34px 36px);border:4px solid #4e3015;box-shadow:inset 0 0 0 8px rgba(0,0,0,.18)}
    #pGift .crate .lid{position:absolute;left:-10px;right:-10px;top:0;height:46px;border-radius:8px;background:linear-gradient(#a06a35,#7a4d23);border:4px solid #4e3015;transition:transform .7s cubic-bezier(.2,.9,.3,1.2),opacity .7s}
    #pGift .crate .q{position:absolute;left:0;right:0;bottom:22px;font:900 76px 'Saira Condensed',system-ui,sans-serif;color:#ffd24a;text-shadow:0 3px 0 #4e3015}
    #pGift .crate .star{position:absolute;left:50%;top:-34px;transform:translateX(-50%);font-size:30px}
    #pGift.open .crate{display:none} #pGift.open .sub{display:none}
    #pGift .burst{position:fixed;left:50%;top:50%;width:10px;height:10px;border-radius:50%;transform:translate(-50%,-50%) scale(0);background:radial-gradient(circle,rgba(255,236,170,.95),rgba(255,210,74,0) 70%);pointer-events:none}
    #pGift.open .burst{animation:gBurst 1.1s ease-out forwards}
    #pGift .prize{display:none;flex-direction:column;align-items:center} #pGift.open .prize{display:flex;animation:gIn .7s ease-out both .1s}
    #pGift .prize img{width:min(520px,86vw);aspect-ratio:16/9;object-fit:contain} #pGift .prize .nm{font:800 38px 'Saira Condensed',system-ui,sans-serif;color:#ffd24a;margin-top:-8px}
    #pGift .prize .ds{max-width:560px;opacity:.9;margin:6px 0 4px;font-size:18px}
    #pGift button{margin-top:18px;font-size:22px;min-width:220px} #pGift.open .openB{display:none}
    @keyframes gWob{0%,100%{transform:rotate(0)}20%{transform:rotate(-4deg) translateY(-4px)}40%{transform:rotate(4deg)}60%{transform:rotate(-2deg) translateY(-2px)}80%{transform:rotate(0)}}
    @keyframes gBurst{0%{transform:translate(-50%,-50%) scale(0);opacity:1}100%{transform:translate(-50%,-50%) scale(120);opacity:0}}
    @keyframes gIn{from{opacity:0;transform:scale(.6) translateY(30px)}to{opacity:1;transform:none}}`;
  document.head.appendChild(st);
  // barras y etiquetas TU / ENEMIGO a los costados de A B C
  let barA=null, barE=null;
  { const tk=document.getElementById('tickets'), a=document.getElementById('tkA'), e=document.getElementById('tkE');
    if(tk&&a&&e){ const mk=(cls)=>{ const d=document.createElement('div'); d.className='tkBar '+cls; d.innerHTML='<i style="width:100%"></i>'; return d; };
      const la=document.createElement('span'), le=document.createElement('span'); la.className=le.className='tkL'; la.setAttribute('data-notr',''); le.setAttribute('data-notr','');
      la.id='tkLA'; le.id='tkLE'; barA=mk('a'); barE=mk('e');
      tk.insertBefore(la,a); tk.insertBefore(barA,a); e.after(barE); barE.after(le); } }
  const hint=document.createElement('div'); hint.id='pHint'; hint.setAttribute('data-notr',''); document.body.appendChild(hint);
  let hintT=0;
  // explicación que detiene la partida hasta que el jugador aprieta Seguir (state 'lesson': no corre la simulación)
  const les=document.createElement('div'); les.id='pLesson'; les.setAttribute('data-notr',''); document.body.appendChild(les);
  function lesson(title,html){ if(state!=='play') return false;
    state='lesson'; try{ mouseDown=false; rightDown=false; releaseAll(); if(engGain) engGain.gain.value=0; }catch(e){}
    if(document.pointerLockElement) document.exitPointerLock();
    hint.style.display='none'; hintT=0;
    les.innerHTML=`<div class="card"><div class="pause">${EN()?'⏸ GAME PAUSED':'⏸ PARTIDA EN PAUSA'}</div><h2>${title}</h2>${html}<button class="go" id="pLesOk">${EN()?'Continue':'Seguir'}</button></div>`;
    les.style.display='flex';
    const go=()=>{ document.removeEventListener('keydown',kd,true); les.style.display='none'; if(state==='lesson'){ state='play'; try{ releaseAll(); }catch(e){} lock(); } };
    const kd=e=>{ if(e.code==='Enter'||e.code==='Space'||e.code==='NumpadEnter'){ e.preventDefault(); e.stopPropagation(); go(); } };
    document.addEventListener('keydown',kd,true); les.querySelector('#pLesOk').onclick=go; return true; }
  const K=a=>`<kbd>${(typeof keyName==='function'?keyName(binds[a]):'')||'?'}</kbd>`;
  function showHint(html,secs,where){ hint.innerHTML=html; hint.style.top=where==='low'?'auto':(where||'38%'); hint.style.bottom=where==='low'?'190px':'auto'; hint.style.display='block'; hintT=secs; }

  // ---- aliados ases y enemigos flojos (solo la 1ª batalla) ----
  function setSk(t,sk){ if(!t||t.isPlayer||t.sk==null) return; t.reloadMax=t.reloadMax/(1.5-t.sk*.4)*(1.5-sk*.4); t.sk=sk; }
  function aces(){ for(const t of tanks) setSk(t,t.team===0?.98:.18); }
  const _sc=spawnCrew; spawnCrew=function(){ const n=tanks.length, r=_sc.apply(this,arguments); if(B&&B.first) for(let i=n;i<tanks.length;i++) setSk(tanks[i],tanks[i].team===0?.98:.18); return r; };

  // ---- al empezar cada batalla ----
  let B=null;   // estado de la batalla actual
  const _sb=startBattle; startBattle=function(){ B=null; const r=_sb.apply(this,arguments);
    HUD_LVL=lvlNow(); for(const n of [1,2,3]) document.body.classList.toggle('hud'+n,HUD_LVL===n); document.body.classList.remove('tkOn');
    B={lvl:HUD_LVL,first:!!C.first,t0:null,shown:false,said:{},max:400,teach:HUD_LVL===4&&!tut&&!net.on&&battles()===3};
    if(B.first){ tickets[0]=tickets[1]=100; DRAIN_K=0; aces(); } else DRAIN_K=.42;
    if(!B.first&&!tut&&!net.on&&!curSpecial&&(HUD_LVL===2||HUD_LVL===3)) tickets[0]=tickets[1]=HUD_LVL===2?150:250;   // 2ª y 3ª más cortas
    B.max=Math.max(1,tickets[0],tickets[1]);
    hint.style.display='none'; hintT=0;
    const la=document.getElementById('tkLA'), le=document.getElementById('tkLE'); if(la) la.textContent=EN()?'YOU':'VOS'; if(le) le.textContent=EN()?'ENEMY':'ENEMIGO';
    return r; };
  // sin el cartel grande "Nahuel DL-43 · Desplegado en…" en la 1ª batalla (tapaba el entrenador)
  const _bn=banner; banner=function(t,sub){ if(HUD_LVL===1&&typeof sub==='string'&&/^Desplegado/.test(sub)) return; return _bn.apply(this,arguments); };

  // ---- cada cuadro ----
  let lastRT=performance.now();
  function bars(){ const m=B?B.max:400, pa=Math.max(0,Math.min(1,tickets[0]/m)), pe=Math.max(0,Math.min(1,tickets[1]/m));
    if(barA){ barA.firstChild.style.width=(pa*100).toFixed(1)+'%'; barA.classList.toggle('low',pa<.2); }
    if(barE){ barE.firstChild.style.width=(pe*100).toFixed(1)+'%'; barE.classList.toggle('low',pe<.2); } }
  (function tick(){ requestAnimationFrame(tick);
    const rt=performance.now(), rdt=Math.min(.1,(rt-lastRT)/1000); lastRT=rt;
    if(hintT>0){ hintT-=rdt; if(hintT<=0) hint.style.display='none'; }
    if(['play','paused','deploy','spectate','end'].includes(state)) bars();
    if(!B||!['play','paused'].includes(state)) return;
    if(tut&&B.lvl<4){ B.lvl=HUD_LVL=4; B.first=false; DRAIN_K=.42; for(const n of [1,2,3]) document.body.classList.remove('hud'+n); }   // tutorial: pantalla completa
    if(B.t0==null) B.t0=now;
    if(player&&!player._prot) protect(player);
    const t=now-B.t0;
    // carteles de las partes nuevas (2ª y 3ª batalla), unos segundos después de aparecer
    if(B.lvl===2&&!B.said.l2&&t>4&&lesson(EN()?'New: ammo and minimap':'Nuevo: munición y minimapa',EN()
        ?`<p>At the bottom, ${K('ammo1')} ${K('ammo2')} choose your <b>ammo</b>: armor-piercing for tanks, high explosive for soldiers and cannons. <b>AUTO</b> picks the best one for you.</p><p>Bottom right, the <b>minimap</b>: green are allies, red are enemies, and the letters are the capture points.</p>`
        :`<p>Abajo, ${K('ammo1')} ${K('ammo2')} eligen la <b>munición</b>: perforante para tanques, explosiva para soldados y cañones. <b>AUTO</b> elige la mejor por vos.</p><p>Abajo a la derecha, el <b>minimapa</b>: verde son aliados, rojo enemigos y las letras son los puntos para capturar.</p>`)) B.said.l2=1;
    if(B.lvl===3&&!B.said.l3&&t>4&&lesson(EN()?'New: your tank and crew':'Nuevo: tu tanque y tu tripulación',EN()
        ?`<p>Bottom left you see your <b>tank and its crew</b>. When something gets hit it turns red, and if a crew member falls, another one takes their place.</p><p>For now your tank is <b>protected</b>. In the next battle it can take damage and you will learn to repair it.</p>`
        :`<p>Abajo a la izquierda ves tu <b>tanque y su tripulación</b>. Lo que recibe un impacto se pone rojo y, si cae un tripulante, otro toma su lugar.</p><p>Por ahora tu tanque está <b>protegido</b>. En la próxima batalla ya puede recibir daño y vas a aprender a repararlo.</p>`)) B.said.l3=1;
    if(B.lvl===4&&B.teach&&!B.said.l4&&t>4){ const air=RULE().sup&&RULE().sup.air;
      if(lesson(EN()?'Now your tank can take damage':'Ahora tu tanque puede recibir daño',EN()
        ?`<p>${K('repair')} <b>Repair</b>: the tank stops and the crew fixes tracks, engine and gun, and puts out fires. Do it behind cover.</p><p>${K('arty')} <b>Artillery</b>${air?` · ${K('air')} <b>Air strike</b>`:''}: they cost the <b>points</b> you earn in battle (the number on the button). Press the key and click on the map where it should land.</p>`
        :`<p>${K('repair')} <b>Reparar</b>: el tanque se queda quieto y la tripulación arregla orugas, motor y cañón y apaga el fuego. Hacelo a cubierto.</p><p>${K('arty')} <b>Artillería</b>${air?` · ${K('air')} <b>Bombardeo</b>`:''}: se pagan con los <b>puntos</b> que ganás en la batalla (el número en el botón). Apretá la tecla y hacé clic en el mapa donde querés que caiga.</p>`)) B.said.l4=1; }
    if(!B.first) return;
    if(tickets[0]<FLOOR_FIRST) tickets[0]=FLOOR_FIRST;   // la 1ª se gana sí o sí
    // 1ª batalla: las barras aparecen a los 30 s con la explicación y desde ahí se gastan
    if(!B.shown&&t>=30){ document.body.classList.add('tkOn');
      if(lesson(EN()?'The bars':'Las barras',EN()?'<p>Each team has a <b>bar</b> at the top. It only goes down.</p><p>Hold <b>more capture points</b> than the enemy and <b>their bar drains</b> · the more points, the faster. When a bar runs out, that team loses.</p>'
        :'<p>Cada equipo tiene una <b>barra</b> arriba. Solo baja.</p><p>Si tenés <b>más puntos capturados</b> que el enemigo, <b>se gasta la suya</b> · cuantos más puntos, más rápido. El equipo que se queda sin barra pierde.</p>')){ B.shown=true; DRAIN_K=K_FIRST; } }
    if(B.shown&&!B.said.drop){ const o0=zones.filter(Z=>Z.owner===1).length, o1=zones.filter(Z=>Z.owner===-1).length;
      if(o0!==o1&&t>40){ B.said.drop=1; showHint(o0>o1?(EN()?'The <b>enemy bar</b> is draining. Hold your points!':'¡Se está gastando la <b>barra del enemigo</b>! Mantené tus puntos.')
        :(EN()?'<b>Your bar</b> is draining: capture a point!':'Se está gastando <b>tu barra</b>: ¡capturá un punto!'),5); } }
  })();
  // al terminar una batalla se apaga el cartel
  const _fin=finish; finish=function(){ hint.style.display='none'; hintT=0; return _fin.apply(this,arguments); };

  // ---- batallas 1 a 3: tu tanque no recibe daño (todavía no se explicó cómo repararlo) ----
  // Todo el daño pasa por immuneT (impactos, explosiones, artillería, choques): para tu tanque vale 1 mientras dure la protección.
  function protOn(){ return !!(B&&B.lvl<4&&!tut&&!net.on); }
  function protect(t){ let v=t.immuneT; t._prot=1;
    try{ Object.defineProperty(t,'immuneT',{configurable:true,get(){ return protOn()?Math.max(v,1):v; },set(x){ v=x; }});
      Object.defineProperty(t,'prot',{configurable:true,get:protOn}); }catch(e){ console.warn('primeras: protección',e); } }
  // ---- sin artillería ni bombardeo hasta que se expliquen (4ª batalla) ----
  const offMsg=()=>hitMsg(EN()?'Artillery and air strikes unlock in battle 4':'La artillería y el bombardeo se habilitan en la 4ª batalla','var(--paper)');
  { const _k=supKey; supKey=function(){ if(protOn()){ offMsg(); return; } return _k.apply(this,arguments); }; }
  { const _a=callArtillery; callArtillery=function(by){ if(by&&by.isPlayer&&protOn()){ offMsg(); return false; } return _a.apply(this,arguments); }; }
  { const _a=callAirstrike; callAirstrike=function(by){ if(by&&by.isPlayer&&protOn()){ offMsg(); return false; } return _a.apply(this,arguments); }; }
  { const _a=callNuke; callNuke=function(by){ if(by&&by.isPlayer&&protOn()){ offMsg(); return false; } return _a.apply(this,arguments); }; }
  // ---- premio de la 1ª batalla: 1.000 de plata (un tanque cuesta ~10.000) y la caja misteriosa ----
  { const _br=battleReward; battleReward=function(){ const r=_br.apply(this,arguments); if(B&&B.first&&!tut) r.yp=Math.min(r.yp,1000); return r; }; }
  const gift=document.createElement('div'); gift.id='pGift'; gift.setAttribute('data-notr',''); document.body.appendChild(gift);
  function giftBox(k){ const V=VEH[k]; if(!V) return;
    try{ PROG.unlocked[k]=1; PROG.owned[k]=1; const g=garRef(V.nation,eraOf(k)); if(!g.includes(k)){ if(g.length>=3) g.pop(); g.unshift(k); } saveProg(); }catch(e){}
    gift.className=''; gift.innerHTML=`<h2>${EN()?'Reward for your first victory':'Premio por tu primera victoria'}</h2><div class="sub">${EN()?'A mystery box! What could be inside?':'¡Una caja misteriosa! ¿Qué habrá adentro?'}</div>
      <div class="crate"><div class="star">⭐</div><div class="body"><div class="q">?</div></div><div class="lid"></div></div><div class="burst"></div>
      <div class="prize">${typeof miniHTML==='function'?miniHTML(k):''}<div class="nm">${V.label}</div>
        <div class="ds">${EN()?'It is yours! Your first tank stays in your hangar for good.':'¡Es tuyo! Tu primer tanque queda en tu hangar para siempre.'}</div>
        <button class="go" id="pGiftOk">${EN()?'Great!':'¡Genial!'}</button></div>
      <button class="go openB" id="pGiftOpen">${EN()?'Open the box':'Abrir la caja'}</button>`;
    gift.style.display='flex';
    const open=()=>{ if(gift.classList.contains('open')) return; gift.classList.add('open');
      try{ if(typeof miniPedir==='function') miniPedir([k]); }catch(e){}
      try{ if(typeof sfx==='function') sfx('metal',null,.6,{near:true,rate:1.4}); }catch(e){}
      try{ if(typeof cgCall==='function') cgCall(S=>S.game.happytime()); }catch(e){} };
    gift.querySelector('.crate').onclick=open; gift.querySelector('#pGiftOpen').onclick=open;
    gift.querySelector('#pGiftOk').onclick=()=>{ gift.style.display='none'; }; }
  { const _sum=summary; summary=function(winner){ const first=!!(B&&B.first&&!tut&&!B.gift), r=_sum.apply(this,arguments);
      if(first&&winner===0&&PROG&&state==='summary'){ B.gift=1; const me=crews.find(c=>c.isPlayer), k=Object.keys((me&&me.uses)||{}).find(x=>VEH[x])||(player&&player.key);
        if(k) giftBox(k); }
      return r; }; }

  // ---- CrazyGames: un jugador nuevo arranca con Estados Unidos y un Sherman ----
  // (el progreso se carga después de este archivo: se aplica al abrir el menú y al empezar la batalla, una sola vez)
  let usDone=false;
  function startUS(){ if(usDone||!window.PLATAFORMA||PLATAFORMA.id==='web'||!PROG||!VEH.m4a1) return; usDone=true;
    if(battles()>0||curEra!==3) return;
    try{ chosenNation='us'; PROG.unlocked.m4a1=1; PROG.owned.m4a1=1; const g=garRef('us',3), i=g.indexOf('m4a1'); if(i>0) g.splice(i,1); if(i!==0) g.unshift('m4a1'); if(g.length>3) g.length=3;
      if(typeof hgSel!=='undefined') hgSel='m4a1'; saveProg(); }catch(e){ console.warn('primeras: nación',e); } }
  const _mm=mainMenu; mainMenu=function(){ startUS(); return _mm.apply(this,arguments); };
  const _sb3=startBattle; startBattle=function(){ startUS(); return _sb3.apply(this,arguments); };
})();
