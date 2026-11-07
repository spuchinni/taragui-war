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
    #pHint b{color:#ffd24a}`;
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
  function showHint(html,secs,where){ hint.innerHTML=html; hint.style.top=where==='low'?'auto':(where||'38%'); hint.style.bottom=where==='low'?'190px':'auto'; hint.style.display='block'; hintT=secs; }

  // ---- aliados ases y enemigos flojos (solo la 1ª batalla) ----
  function setSk(t,sk){ if(!t||t.isPlayer||t.sk==null) return; t.reloadMax=t.reloadMax/(1.5-t.sk*.4)*(1.5-sk*.4); t.sk=sk; }
  function aces(){ for(const t of tanks) setSk(t,t.team===0?.98:.18); }
  const _sc=spawnCrew; spawnCrew=function(){ const n=tanks.length, r=_sc.apply(this,arguments); if(B&&B.first) for(let i=n;i<tanks.length;i++) setSk(tanks[i],tanks[i].team===0?.98:.18); return r; };

  // ---- al empezar cada batalla ----
  let B=null;   // estado de la batalla actual
  const _sb=startBattle; startBattle=function(){ B=null; const r=_sb.apply(this,arguments);
    HUD_LVL=lvlNow(); for(const n of [1,2,3]) document.body.classList.toggle('hud'+n,HUD_LVL===n); document.body.classList.remove('tkOn');
    B={lvl:HUD_LVL,first:!!C.first,t0:null,shown:false,said:{},max:400};
    if(B.first){ tickets[0]=tickets[1]=100; DRAIN_K=0; aces(); } else DRAIN_K=.42;
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
    const t=now-B.t0;
    // carteles de las partes nuevas (2ª y 3ª batalla), unos segundos después de aparecer
    if(B.lvl===2&&!B.said.l2&&t>4){ B.said.l2=1;
      showHint(EN()?'New: <b>1 2 3</b> at the bottom choose your ammo (<b>AUTO</b> picks the best one for you) · bottom right, the <b>minimap</b>: green are allies, red are enemies'
        :'Nuevo: abajo, <b>1 2 3</b> eligen la munición (<b>AUTO</b> elige la mejor por vos) · abajo a la derecha, el <b>minimapa</b>: verde son aliados, rojo enemigos',9,'low'); }
    if(B.lvl===3&&!B.said.l3&&t>4){ B.said.l3=1;
      showHint(EN()?'New: bottom left, your <b>tank and crew</b>. Damaged parts turn red · if a crew member falls, someone takes their place'
        :'Nuevo: abajo a la izquierda, tu <b>tanque y tripulación</b>. Lo dañado se pone rojo · si cae un tripulante, otro toma su lugar',9,'low'); }
    if(!B.first) return;
    if(tickets[0]<FLOOR_FIRST) tickets[0]=FLOOR_FIRST;   // la 1ª se gana sí o sí
    // 1ª batalla: las barras aparecen a los 30 s con la explicación y desde ahí se gastan
    if(!B.shown&&t>=30){ B.shown=true; DRAIN_K=K_FIRST; document.body.classList.add('tkOn');
      showHint(EN()?'Each team has a <b>bar</b> at the top. It only goes down.<br>Hold <b>more capture points</b> than the enemy and <b>their bar drains</b> · the more points, the faster.'
        :'Cada equipo tiene una <b>barra</b> arriba. Solo baja.<br>Si tenés <b>más puntos capturados</b> que el enemigo, <b>se gasta la suya</b> · cuantos más puntos, más rápido.',9); }
    if(B.shown&&!B.said.drop){ const o0=zones.filter(Z=>Z.owner===1).length, o1=zones.filter(Z=>Z.owner===-1).length;
      if(o0!==o1&&t>40){ B.said.drop=1; showHint(o0>o1?(EN()?'The <b>enemy bar</b> is draining. Hold your points!':'¡Se está gastando la <b>barra del enemigo</b>! Mantené tus puntos.')
        :(EN()?'<b>Your bar</b> is draining: capture a point!':'Se está gastando <b>tu barra</b>: ¡capturá un punto!'),5); } }
  })();
  // al terminar una batalla se apaga el cartel
  const _fin=finish; finish=function(){ hint.style.display='none'; hintT=0; return _fin.apply(this,arguments); };

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
