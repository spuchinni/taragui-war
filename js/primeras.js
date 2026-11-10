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
//  · Batallas 1 y 2: tu tanque no recibe daño y no hay artillería ni bombardeo (todavía no se explicaron). En la 3ª se explican
//    la reparación, los refuerzos y los apoyos y desde ahí todo funciona normal (antes en la 4ª; pedido de Sebastián). Las batallas 2 y 3 son más cortas (barras de 150 y 250).
//  · Cada explicación nueva detiene la partida hasta que el jugador la lee y aprieta "Seguir" (antes tapaba el tanque y la acción seguía).
//  · Premio de la 1ª batalla: 1.000 Yaguaretés. Al terminar la 3ª (fin del entrenamiento) la caja regala el primero de la línea de la nación elegida.
//  · Pedido de Sebastián ("demasiado cargado"): menos tanques (1ª: 2 aliados y 3 enemigos; 2ª: 3 y 4), sin infantería suelta ni
//    refuerzos en la 1ª y la 2ª (la 3ª la presenta con su cartel), sin humo, morteros, artillería ni bombardeo de nadie hasta la 3ª.
//  · El primer enemigo que aparece: pausa, zoom sobre él y "apuntá con el mouse y clic para disparar"; ese primero cae de un tiro.
//  · Después de la primera baja, el siguiente tanque a la vista: cartel del punto débil (frente fuerte, costado débil marcado; tw2_lWeak).
//  · Después, un enemigo a más de 200 m: cartel de la mira del artillero / modo francotirador (tw2_lMira).
//  · El primer punto que captura tu equipo: pausa, zoom sobre el punto y explicación de la fortificación (ametralladora, antitanque, antiaéreo).
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
    #pLesson.low{align-items:flex-end;padding-bottom:4vh;background:rgba(0,0,0,.12)}
    #pLesson .mk{position:absolute;transform:translate(-50%,-50%);width:86px;height:86px;border:4px solid currentColor;border-radius:50%;pointer-events:none;animation:mkP 1s ease-in-out infinite alternate;box-shadow:0 0 0 3px rgba(0,0,0,.45)}
    #pLesson .mk span{position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:6px;white-space:nowrap;font:800 20px 'Saira Condensed',system-ui,sans-serif;text-shadow:0 2px 4px #000,0 0 2px #000}
    @keyframes mkP{from{transform:translate(-50%,-50%) scale(.9)}to{transform:translate(-50%,-50%) scale(1.1)}}
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
  // opt.zoom: {p (THREE.Vector3), r (radio a encuadrar)} acerca la cámara · opt.marks: [{p,txt,col}] círculos que titilan · opt.low: cartel abajo
  function lesson(title,html,opt){ if(state!=='play') return false; opt=opt||{};
    state='lesson'; try{ mouseDown=false; rightDown=false; releaseAll(); if(engGain) engGain.gain.value=0; }catch(e){}
    if(document.pointerLockElement) document.exitPointerLock();
    hint.style.display='none'; hintT=0;
    let fov0=null;
    if(opt.cam) try{ fov0=camera.fov; camera.position.copy(opt.cam.pos); camera.lookAt(opt.cam.look); camera.fov=55; camera.updateProjectionMatrix(); camera.updateMatrixWorld(); }catch(e){}   // vista desde arriba (punto capturado)
    else if(opt.zoom) try{ fov0=camera.fov; const d=Math.max(1,camera.position.distanceTo(opt.zoom.p)); camera.lookAt(opt.zoom.p);
      camera.fov=Math.max(6,Math.min(fov0,2*Math.atan((opt.zoom.r||8)/d)*180/Math.PI)); camera.updateProjectionMatrix(); if(opt.low) camera.rotateX(-Math.atan(.5*Math.tan(camera.fov*Math.PI/360))); camera.updateMatrixWorld(); }catch(e){}   // con el cartel abajo, el blanco queda arriba
    les.className=opt.low?'low':'';
    let mk='', mi=0; for(const M of opt.marks||[]) try{ const v=M.p.clone().project(camera); if(v.z>1||Math.abs(v.x)>1.1||Math.abs(v.y)>1.1) continue;
      mk+=`<div class="mk" style="left:${((v.x+1)/2*100).toFixed(2)}%;top:${((1-v.y)/2*100).toFixed(2)}%;color:${M.col||'#ffd24a'}"><span style="${(mi++)%2?'top:auto;bottom:100%;margin:0 0 6px':''}">${M.txt||''}</span></div>`; }catch(e){}
    les.innerHTML=mk+`<div class="card"><div class="pause">${EN()?'⏸ GAME PAUSED':'⏸ PARTIDA EN PAUSA'}</div><h2>${title}</h2>${html}<button class="go" id="pLesOk">${EN()?'Continue':'Seguir'}</button></div>`;
    les.style.display='flex';
    const go=()=>{ document.removeEventListener('keydown',kd,true); les.style.display='none'; if(fov0!=null){ camera.fov=fov0; camera.updateProjectionMatrix(); }
      if(state==='lesson'){ state='play'; try{ releaseAll(); }catch(e){} lock(); } };
    const kd=e=>{ if(e.code==='Enter'||e.code==='Space'||e.code==='NumpadEnter'){ e.preventDefault(); e.stopPropagation(); go(); } };
    document.addEventListener('keydown',kd,true); les.querySelector('#pLesOk').onclick=go; return true; }
  const LSg=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } }, LSs=k=>{ try{ localStorage.setItem(k,'1'); }catch(e){} };
  const mob=()=>typeof MOVIL!=='undefined'&&!!MOVIL;
  const K=a=>`<kbd>${(typeof keyName==='function'?keyName(binds[a]):'')||'?'}</kbd>`;
  // lista de la munición del tanque con su tecla (pedido de Sebastián: "1 tal munición, 2 tal munición… y 4 AUTO")
  function ammoList(){ const L=(player&&player.T&&player.T.ammo)||[];
    const lk=(player&&player.ammoLock)||[]; const rows=L.slice(0,3).map((A,i)=>`<li${lk[i]?' style="opacity:.55"':''}>${mob()?`<b>${i+1}</b>`:K('ammo'+(i+1))} ${A.n}${lk[i]?(EN()?` · 🔒 unlocks at tank level ${i+1}`:` · 🔒 se desbloquea con el nivel ${i+1} del tanque`):''}</li>`);
    if(L.length>1) rows.push(`<li>${mob()?'<b>AUTO</b>':K('ammoAuto')} ${EN()?'<b>AUTO</b>: picks the best one for each target':'<b>AUTO</b>: elige la mejor para cada blanco'}</li>`);
    return `<ul style="list-style:none;padding:0;margin:.3em 0;text-align:left;display:inline-block">${rows.join('')}</ul>`; }
  function showHint(html,secs,where){ hint.innerHTML=html; hint.style.top=where==='low'?'auto':(where||'38%'); hint.style.bottom=where==='low'?'190px':'auto'; hint.style.display='block'; hintT=secs; }

  // ---- aliados ases y enemigos flojos (solo la 1ª batalla) ----
  function setSk(t,sk){ if(!t||t.isPlayer||t.sk==null) return; t.reloadMax=t.reloadMax/(1.5-t.sk*.4)*(1.5-sk*.4); t.sk=sk; }
  function aces(){ for(const t of tanks) setSk(t,t.team===0?.98:.18); }
  let medSeen=false;   // 1ª batalla: el primer tanque enemigo que sale es un mediano de su nación (pedido de Sebastián: el del punto débil siempre mediano)
  const _sc=spawnCrew; spawnCrew=function(crew,key){ if(preLvl===1&&!tut&&!net.on&&!medSeen&&crew&&crew.team!==0&&VEH[key]&&!VEH[key].static&&!VEH[key].support){ medSeen=true;
      if(VEH[key].cls!=='medio'){ const m=vehTreeE(VEH[key].nation,eraOf(key)).find(k=>VEH[k].cls==='medio'); if(m) arguments[1]=m; } }
    const n=tanks.length, r=_sc.apply(this,arguments);
    try{ if(TUT1.pre&&TUT1.stg===-1&&r&&!(crew&&crew.isPlayer)&&!r.isPlayer&&mobileT(r)) hideT(r); }catch(e){} if(B&&B.first) for(let i=n;i<tanks.length;i++) setSk(tanks[i],tanks[i].team===0?.98:.18); return r; };

  // ---- al empezar cada batalla ----
  let B=null, preLvl=4;   // estado de la batalla actual · nivel de la batalla que está arrancando (antes de que exista B)
  const curLvl=()=>tut||net.on?4:B?B.lvl:preLvl;
  const _sb=startBattle; startBattle=function(spectator){ B=null; preLvl=lvlNow(); medSeen=false; TUT1.stg=-1; TUT1.hid=[]; TUT1.pre=!spectator&&!!(window.coach&&coach.closeNext)&&!net.on;   // closeNext: todavía no lo leyó arranque.js (corre adentro)   // 1ª batalla: los demás tanques se esconden apenas aparecen (antes se veían un instante) window.TEAM_N=tut||net.on?null:preLvl===1?[2,3]:preLvl===2?[3,4]:null;
    let r; try{ r=_sb.apply(this,arguments); } finally{ window.TEAM_N=null; }
    HUD_LVL=lvlNow(); for(const n of [1,2,3]) document.body.classList.toggle('hud'+n,HUD_LVL===n); document.body.classList.remove('tkOn');
    TUT1.A=TUT1.B=null; TUT1.t=0;   // stg, hid y pre se ponen antes de armar la batalla (los tanques se esconden al aparecer)
    B={lvl:HUD_LVL,first:!!C.first,t0:null,shown:false,said:{},max:400,teach:HUD_LVL===3&&!tut&&!net.on&&battles()===2};
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
    tut1Tick();
    // carteles de las partes nuevas (2ª y 3ª batalla), unos segundos después de aparecer
    if(B.lvl===2&&!B.said.l2&&t>4&&lesson(EN()?'New: ammo, machine gun and minimap':'Nuevo: munición, ametralladora y minimapa',EN()
        ?`<p>At the bottom you choose your <b>ammo</b>:</p>${ammoList()}<p>Armor-piercing for tanks, high explosive for soldiers and cannons.</p><p>${mob()?'<b>⁞⁞</b>':K('mg')} <b>Machine gun</b>: for soldiers; it does almost nothing to tanks.</p><p>Bottom right, the <b>minimap</b>: green are allies, red are enemies, and the letters are the capture points.</p>`
        :`<p>Abajo elegís la <b>munición</b>:</p>${ammoList()}<p>Perforante para tanques, explosiva para soldados y cañones.</p><p>${mob()?'<b>⁞⁞</b>':K('mg')} <b>Ametralladora</b>: para los soldados; a los tanques casi no les hace nada.</p><p>Abajo a la derecha, el <b>minimapa</b>: verde son aliados, rojo enemigos y las letras son los puntos para capturar.</p>`)) B.said.l2=1;
    if(B.lvl===3&&!B.said.l3&&t>4&&lesson(EN()?'New: your tank and crew':'Nuevo: tu tanque y tu tripulación',EN()
        ?`<p>Bottom left you see your <b>tank and its crew</b>. When something gets hit it turns red, and if a crew member falls, another one takes their place.</p>`
        :`<p>Abajo a la izquierda ves tu <b>tanque y su tripulación</b>. Lo que recibe un impacto se pone rojo y, si cae un tripulante, otro toma su lugar.</p>`)) B.said.l3=1;
    if(B.teach&&B.said.l3&&!B.said.l4&&t>14){ const air=RULE().sup&&RULE().sup.air;
      if(lesson(EN()?'Now your tank can take damage':'Ahora tu tanque puede recibir daño',EN()
        ?`<p>${K('repair')} <b>Repair</b>: the tank stops and the crew fixes tracks, engine and gun, and puts out fires. Do it behind cover.</p><p>${K('arty')} <b>Artillery</b>${air?` · ${K('air')} <b>Air strike</b>`:''}: press the key and click on the map where it should land. They recharge on their own (the button shows the wait).</p>${infOK()?`<p>${K('inf')} <b>Call infantry</b>: ${INF_COST} points. Pick a point on the map and a half-track or paratroopers bring soldiers there to capture or defend it.</p>`:''}<p>${K('smoke')} <b>Smoke</b>: throws smoke grenades to hide your tank.</p>`
        :`<p>${K('repair')} <b>Reparar</b>: el tanque se queda quieto y la tripulación arregla orugas, motor y cañón y apaga el fuego. Hacelo a cubierto.</p><p>${K('arty')} <b>Artillería</b>${air?` · ${K('air')} <b>Bombardeo</b>`:''}: apretá la tecla y hacé clic en el mapa donde querés que caiga. Se recargan solos (el botón muestra cuánto falta).</p>${infOK()?`<p>${K('inf')} <b>Pedir infantería</b>: ${INF_COST} puntos. Elegís un punto en el mapa y un semioruga o paracaidistas llevan soldados para capturarlo o defenderlo.</p>`:''}<p>${K('smoke')} <b>Humo</b>: tira granadas de humo para esconder tu tanque.</p>`)) B.said.l4=1; }
    if(B.lvl<4&&player&&!player.dead&&!LSg('tw2_lFoe')&&!(B.first&&TUT1.stg<0)){ const e=B.first&&TUT1.A&&!TUT1.A.dead?TUT1.A:tanks.find(o=>!o.dead&&o.team!==player.team&&!(o.T&&o.T.static)&&o.visP&&o.pos.distanceTo(player.pos)<380);
      if(e&&B.first&&e===TUT1.A){ const p=e.pos.clone(); p.y+=(e.topH||2.4)*.45; const {fm,sm}=armorOf(e);   // 1ª batalla: enemigo + blindaje en un solo cartel
        if(lesson(EN()?`An enemy tank! A ${e.T.label}`:`¡Un tanque enemigo! Un ${e.T.label}`,(EN()
            ?`<p>Enemies are marked in <b style="color:#ff6a50">red</b>. ${mob()?'Drag on the right side to <b>aim</b> and tap <b>🔥</b> to <b>fire</b>.':'Aim with the <b>mouse</b> and <b>left click</b> to <b>fire</b>.'}</p><p>Armor is not the same all around. The <b style="color:#ff6a50">front</b> has <b>${fm} mm</b>: shots bounce off there. The <b style="color:#7ce07c">${armorOf(e).rear?'rear':'side'}</b> has only <b>${sm} mm</b>: aim at the <b style="color:#7ce07c">green mark</b> and it goes down with one shot.</p>`
            :`<p>Los enemigos se marcan en <b style="color:#ff6a50">rojo</b>. ${mob()?'Arrastrá en la parte derecha para <b>apuntar</b> y tocá <b>🔥</b> para <b>disparar</b>.':'<b>Apuntá</b> con el <b>mouse</b> y hacé <b>clic izquierdo</b> para <b>disparar</b>.'}</p><p>El blindaje no es igual en todos lados. El <b style="color:#ff6a50">frente</b> tiene <b>${fm} mm</b>: ahí rebotan los tiros. ${armorOf(e).rear?'La <b style="color:#7ce07c">cola</b>':'El <b style="color:#7ce07c">costado</b>'} tiene solo <b>${sm} mm</b>: apuntá a la <b style="color:#7ce07c">marca verde</b> y cae de un tiro.</p>`),
          {low:1,zoom:{p,r:7},marks:[{p:frontPt(e),txt:EN()?`Strong · ${fm} mm`:`Fuerte · ${fm} mm`,col:'#ff4a36'},{p:sidePt(e),txt:EN()?`Weak · ${sm} mm · AIM HERE`:`Débil · ${sm} mm · APUNTÁ ACÁ`,col:'#7ce07c'}]})){ LSs('tw2_lFoe'); LSs('tw2_lWeak'); } }
      else if(e&&!B.first){ const p=e.pos.clone(); p.y+=(e.topH||2.4)*.55;
        if(lesson(EN()?'An enemy tank!':'¡Un tanque enemigo!',(EN()
            ?`<p>Enemies are marked in <b style="color:#ff6a50">red</b>.</p><p>${mob()?'Drag on the right side of the screen to <b>aim</b> and tap <b>🔥</b> to <b>fire</b>.':'Aim with the <b>mouse</b> and <b>left click</b> to <b>fire</b>.'}</p>`
            :`<p>Los enemigos se marcan en <b style="color:#ff6a50">rojo</b>.</p><p>${mob()?'Arrastrá en la parte derecha de la pantalla para <b>apuntar</b> y tocá <b>🔥</b> para <b>disparar</b>.':'<b>Apuntá</b> con el <b>mouse</b> y hacé <b>clic izquierdo</b> para <b>disparar</b>.'}</p>`),
          {low:1,zoom:{p,r:9},marks:[{p,txt:EN()?'ENEMY':'ENEMIGO',col:'#ff4a36'}]})) LSs('tw2_lFoe'); } }
    // ---- punto débil (pedido de Sebastián): después de la primera baja, al ver otro tanque, antes de dispararle ----
    if(B.lvl<4&&player&&!player.dead&&!LSg('tw2_lWeak')&&(B.first?!!B.weakT:(LSg('tw2_lFoe')&&playerCrew&&playerCrew.kills>=1))){
      const e=B.first?(B.weakT&&!B.weakT.dead?B.weakT:null):tanks.find(o=>!o.dead&&o.team!==player.team&&!(o.T&&o.T.static)&&o.visP&&o.pos.distanceTo(player.pos)<380);
      if(e){ const h=e.heading||0, f=new THREE.Vector3(Math.sin(h),0,Math.cos(h)), rt=new THREE.Vector3(Math.cos(h),0,-Math.sin(h)), M=e.T.m||{}, Lh=(M.L||6)/2, Wh=(M.W||3)/2;
        const sd=Math.sign(player.pos.clone().sub(e.pos).dot(rt))||1, y=e.pos.y+(e.topH||2.4)*.38;
        const front=e.pos.clone().addScaledVector(f,Lh*.92).setY(y), side=e.pos.clone().addScaledVector(rt,sd*Wh).addScaledVector(f,-Lh*.2).setY(y);
        const A=(e.T.armor&&e.T.armor.hull)||{}, fm=A.front||'?', sm=A.side||'?';
        if(lesson(EN()?`This is a ${e.T.label}`:`Este es un ${e.T.label}`,(EN()
            ?`<p><b>Not all tanks are the same</b>, and armor is not the same all around.</p><p>The <b style="color:#ff6a50">front</b> has <b>${fm} mm</b>: shots bounce off there. The <b style="color:#7ce07c">side</b> has only <b>${sm} mm</b>: aim there to penetrate it. The rear is the weakest.</p><p>From now on <b>every shot counts</b>: look for sides and rears.</p>`
            :`<p><b>No todos los tanques son iguales</b>, y el blindaje no es igual en todos lados.</p><p>El <b style="color:#ff6a50">frente</b> tiene <b>${fm} mm</b>: ahí rebotan los tiros. El <b style="color:#7ce07c">costado</b> tiene solo <b>${sm} mm</b>: apuntá ahí para perforarlo. La parte de atrás es lo más débil.</p><p>Desde ahora <b>cada tiro cuenta</b>: buscá los costados y la cola.</p>`),
          {low:1,zoom:{p:e.pos.clone().setY(y),r:8},marks:[{p:front,txt:EN()?`Strong · ${fm} mm`:`Fuerte · ${fm} mm`,col:'#ff4a36'},{p:side,txt:EN()?`Weak · ${sm} mm · AIM HERE`:`Débil · ${sm} mm · APUNTÁ ACÁ`,col:'#7ce07c'}]})) LSs('tw2_lWeak'); } }
    if(B.lvl<4&&!LSg('tw2_lCap')&&!(B.first&&TUT1.stg<2)){ const Z=zones.find(z=>z.owner===1);
      if(!Z) B.capT=null; else if(B.capT==null) B.capT=now; else if(now-B.capT>1.5){ const F=Z.fort&&Z.fort.team===0?Z.fort:null, zp=new THREE.Vector3(Z.x,heightAt(Z.x,Z.z)+1,Z.z), marks=[];
        const up=(o,h)=>o&&o.pos?o.pos.clone().setY(o.pos.y+h):null;
        if(F){ const m=new THREE.Vector3(F.nx,heightAt(F.nx,F.nz)+1,F.nz); marks.push({p:m,txt:EN()?'Machine gun':'Ametralladora'});
          if(F.gun&&!F.gun.dead) marks.push({p:up(F.gun,1.2),txt:EN()?'Anti-tank gun':'Antitanque'});
          if(F.aa&&!F.aa.dead) marks.push({p:up(F.aa,1.5),txt:EN()?'Anti-aircraft gun':'Antiaéreo'}); }
        const parts=F?(EN()?['a <b>machine-gun nest</b>',F.gun?'an <b>anti-tank gun</b>':'',F.aa?'an <b>anti-aircraft gun</b>':'']:['un <b>nido de ametralladora</b>',F.gun?'un <b>cañón antitanque</b>':'',F.aa?'un <b>antiaéreo</b>':'']).filter(Boolean):[];
        const list=parts.length>1?parts.slice(0,-1).join(', ')+(EN()?' and ':' y ')+parts[parts.length-1]:parts[0]||'';
        if(lesson(EN()?`Point ${Z.id} is yours!`:`¡El punto ${Z.id} es tuyo!`,(EN()
            ?`${F?`<p>When your team captures a point, it <b>fortifies</b> it: ${list} defend it on their own.</p>`:''}<p>While your team holds <b>more points</b> than the enemy, <b>their bar drains</b>. Defend it!</p>`
            :`${F?`<p>Cuando tu equipo captura un punto, lo <b>fortifica</b>: ${list} lo defienden solos.</p>`:''}<p>Mientras tu equipo tenga <b>más puntos</b> que el enemigo, <b>su barra se gasta</b>. ¡Defendelo!</p>`),
          {low:1,cam:(()=>{ let dx=player.pos.x-Z.x, dz=player.pos.z-Z.z; const L=Math.hypot(dx,dz)||1, r=Math.max(18,Z.r||25); dx/=L; dz/=L;
            return {pos:new THREE.Vector3(Z.x+dx*r*1.5,zp.y+r*.9,Z.z+dz*r*1.5),look:zp.clone().setY(zp.y-r*.25)}; })(),marks})) LSs('tw2_lCap'); } }
    // ---- la mira del artillero (pedido de Sebastián: "no me enseña a usar la mira"): 2ª batalla, con un enemigo cerca.
    // Después del cartel, un aviso hasta que la use, otro para el aumento y otro para salir. Una sola vez (tw2_lMira). ----
    if(B.lvl<4&&!B.said.mira&&(B.first?TUT1.stg===1:LSg('tw2_lWeak'))&&!LSg('tw2_lMira')&&player&&!player.dead&&!scopeOn&&state==='play'){
      const e=B.first?(TUT1.B&&!TUT1.B.dead&&TUT1.B.pos.distanceTo(player.pos)>150?TUT1.B:null):tanks.find(o=>!o.dead&&o.team!==player.team&&!(o.T&&o.T.static)&&o.visP&&o.pos.distanceTo(player.pos)>200&&o.pos.distanceTo(player.pos)<750);
      if(e&&lesson(EN()?'The gunner\'s sight':'La mira del artillero',EN()
          ?`<p>That one is <b>far away</b>. To see it better and hit it, look through the gun sight (sniper mode).</p><p>${mob()?'Tap <b>◎</b> to go in and out of the sight · <b>🔍</b> zooms in more.':`${K('scope')} goes in and out of the sight · <b>right click</b> zooms in more.`}</p><p>Put the <b>center of the sight</b> on the enemy and fire. The farther it is, the higher you aim: use the marks under the center.</p>`
          :`<p>Ese está <b>lejos</b>. Para verlo mejor y pegarle, mirá por la mira del cañón (modo francotirador).</p><p>${mob()?'Tocá <b>◎</b> para entrar y salir de la mira · <b>🔍</b> acerca más.':`${K('scope')} entra y sale de la mira · <b>clic derecho</b> acerca más.`}</p><p>Poné el <b>centro de la mira</b> sobre el enemigo y disparale. Cuanto más lejos esté, más arriba apuntás: usá las marcas debajo del centro.</p>`,
          {low:1,zoom:{p:e.pos.clone().setY(e.pos.y+(e.topH||2.4)*.55),r:9},marks:[{p:e.pos.clone().setY(e.pos.y+(e.topH||2.4)*.55),txt:EN()?'Enemy':'Enemigo',col:'#ff4a36'}]})){ B.said.mira=1; B.miraT=t; } }
    if(B.said.mira===1&&state==='play'){
      if(scopeOn){ B.said.mira=2; showHint(EN()?(mob()?'<b>🔍</b> zooms in more · <b>◎</b> again to leave the sight':'<b>Right click</b> zooms in more · '+K('scope')+' again to leave the sight')
        :(mob()?'<b>🔍</b> acerca más · <b>◎</b> otra vez para salir de la mira':'<b>Clic derecho</b> acerca más · '+K('scope')+' otra vez para salir de la mira'),7); }
      else if(t-B.miraT>40){ B.said.mira=3; LSs('tw2_lMira'); }   // no la quiso usar: no insistir más
      else if(hintT<=0) showHint(EN()?(mob()?'Tap <b>◎</b> to look through the sight':'Press '+K('scope')+' to look through the sight'):(mob()?'Tocá <b>◎</b> para mirar por la mira':'Apretá '+K('scope')+' para mirar por la mira'),3,'low'); }
    if(B.said.mira===2&&!scopeOn&&state==='play'){ B.said.mira=3; LSs('tw2_lMira'); }
    if(B.lvl===3&&!B.said.inf&&t>40&&player&&!player.dead){ let s=null,sd=260; for(const P of infantry){ if(P.dead||isCiv(P)) continue; const d=P.pos.distanceTo(player.pos); if(d<sd){ sd=d; s=P; } }
      const p=s?s.pos.clone().setY(s.pos.y+1.2):null;
      if(lesson(EN()?'New: infantry':'Nuevo: la infantería',EN()
          ?'<p>From now on <b>soldiers</b> from both sides fight too. They leave from their base, and when a team captures a point, <b>reinforcements</b> arrive by half-track or by parachute.</p><p>Soldiers also capture points. Use <b>high explosive</b> shells and the <b>machine gun</b> against them.</p>'
          :'<p>Desde ahora también pelean <b>soldados</b> de los dos bandos. Salen de su base y, cuando un equipo captura un punto, le llegan <b>refuerzos</b> en semioruga o en paracaídas.</p><p>Los soldados también capturan puntos. Contra ellos usá la munición <b>explosiva</b> y la <b>ametralladora</b>.</p>',
        p?{low:1,zoom:{p,r:5},marks:[{p,txt:s.team===0?(EN()?'Ally':'Aliado'):(EN()?'Enemy':'Enemigo'),col:s.team===0?'#7ce07c':'#ff4a36'}]}:{})) B.said.inf=1; }
    if(!B.first) return;
    if(tickets[0]<FLOOR_FIRST) tickets[0]=FLOOR_FIRST;   // la 1ª se gana sí o sí
    // 1ª batalla: las barras aparecen a los 30 s con la explicación y desde ahí se gastan
    if(TUT1.stg<2) B.stg2T=t; else if(B.stg2T==null) B.stg2T=t;
    if(!B.shown&&TUT1.stg>=2&&t>=(B.stg2T||0)+2.5){ document.body.classList.add('tkOn');
      if(lesson(EN()?'Capture points and bars':'Los puntos y las barras',EN()?'<p>Now your allies and more enemies join in. The <b>capture points</b> (A, B, C) are on the map: drive into one and stay inside to capture it (follow the yellow arrow).</p><p>Each team has a <b>bar</b> at the top. It only goes down.</p><p>Hold <b>more capture points</b> than the enemy and <b>their bar drains</b> · the more points, the faster. When a bar runs out, that team loses.</p>'
        :'<p>Ahora entran tus aliados y más enemigos. En el mapa están los <b>puntos</b> (A, B, C): metete en uno y quedate adentro para capturarlo (seguí la flecha amarilla).</p><p>Cada equipo tiene una <b>barra</b> arriba. Solo baja.</p><p>Si tenés <b>más puntos capturados</b> que el enemigo, <b>se gasta la suya</b> · cuantos más puntos, más rápido. El equipo que se queda sin barra pierde.</p>')){ B.shown=true; DRAIN_K=K_FIRST; } }
    if(B.shown&&!B.said.drop){ const o0=zones.filter(Z=>Z.owner===1).length, o1=zones.filter(Z=>Z.owner===-1).length;
      if(o0!==o1&&t>40){ B.said.drop=1; showHint(o0>o1?(EN()?'The <b>enemy bar</b> is draining. Hold your points!':'¡Se está gastando la <b>barra del enemigo</b>! Mantené tus puntos.')
        :(EN()?'<b>Your bar</b> is draining: capture a point!':'Se está gastando <b>tu barra</b>: ¡capturá un punto!'),5); } }
  })();
  // al terminar una batalla se apaga el cartel
  const _fin=finish; finish=function(){ hint.style.display='none'; hintT=0; return _fin.apply(this,arguments); };

  // ---- batallas 1 a 4 sin sala online: "¡A la batalla!" abre una sala rápida (net.on) y ahí no corren las explicaciones,
  // la protección ni los equipos chicos; además las pausas de los carteles congelarían a los que entren. Se juega con bots. ----
  if(typeof jugarOnline==='function'){ const _jo=jugarOnline; jugarOnline=function(){ if(!tut&&!net.on&&battles()<4){ startBattle(false); return; } return _jo.apply(this,arguments); }; }
  // ---- batallas 1 a 3: tu tanque no recibe daño (todavía no se explicó cómo repararlo) ----
  // Todo el daño pasa por immuneT (impactos, explosiones, artillería, choques): para tu tanque vale 1 mientras dure la protección.
  function protOn(){ return !!(B&&B.lvl<3&&!tut&&!net.on); }   // batallas 1 y 2 protegidas; desde la 3ª, todo normal
  function protect(t){ let v=t.immuneT; t._prot=1;
    try{ Object.defineProperty(t,'immuneT',{configurable:true,get(){ return protOn()?Math.max(v,1):v; },set(x){ v=x; }});
      Object.defineProperty(t,'prot',{configurable:true,get:protOn}); }catch(e){ console.warn('primeras: protección',e); } }
  // ---- sin artillería ni bombardeo hasta que se expliquen (4ª batalla) ----
  const offMsg=()=>hitMsg(EN()?'Artillery and air strikes unlock in battle 3':'La artillería y el bombardeo se habilitan en la 3ª batalla','var(--paper)');
  { const _k=supKey; supKey=function(k){ if(protOn()){ if(k==='inf') hitMsg(EN()?'Calling infantry unlocks in battle 3':'Pedir infantería se habilita en la 3ª batalla','var(--paper)'); else offMsg(); return; } return _k.apply(this,arguments); }; }
  // nadie (ni los bots aliados ni los enemigos) usa artillería, bombardeo, humo ni morteros hasta la 4ª
  { const _a=callArtillery; callArtillery=function(by){ if(protOn()){ if(by&&by.isPlayer) offMsg(); return false; } return _a.apply(this,arguments); }; }
  { const _a=callAirstrike; callAirstrike=function(by){ if(protOn()){ if(by&&by.isPlayer) offMsg(); return false; } return _a.apply(this,arguments); }; }
  { const _a=callNuke; callNuke=function(by){ if(protOn()){ if(by&&by.isPlayer) offMsg(); return false; } return _a.apply(this,arguments); }; }
  { const _a=deploySmoke; deploySmoke=function(t){ if(curLvl()<3) return; return _a.apply(this,arguments); }; }
  { const _a=makePerson; makePerson=function(kind){ if(kind==='mortar'&&curLvl()<3){ const a=[...arguments]; a[0]='rifle'; return _a.apply(this,a); } return _a.apply(this,arguments); }; }
  // 1ª y 2ª: sin escuadras de infantería ni refuerzos (en la 3ª se presentan); los soldados del nido del punto sí
  { const _a=spawnSquad; spawnSquad=function(){ if(curLvl()<=2) return; return _a.apply(this,arguments); }; }
  if(typeof sendReinforcements==='function'){ const _a=sendReinforcements; sendReinforcements=function(){ if(curLvl()<=2) return; return _a.apply(this,arguments); }; }
  // ---- 1ª batalla por etapas (pedido de Sebastián: "hagámoslo progresivo") ----
  // Al desplegar: bienvenida del instructor, se esconden todos los demás tanques (aliados y enemigos) y, después de moverse 40 m y
  //   girar la torreta (arranque.js), aparece un enemigo (A) quieto a ~55 m, delante de la
  //   cámara y de costado, con la explicación del blindaje. Mientras viva, una marca verde fija muestra su costado: un tiro ahí
  //   (costado o cola) lo destruye; en el frente o la torre rebota. stg 1: otro enemigo (B) quieto a ~300 m, a la vista (con línea
  //   de tiro libre), con la explicación de la mira; cualquier impacto lo destruye. stg 2: vuelven todos a sus bases, se sueltan los
  //   bots y viene la explicación de los puntos y las barras.
  const TUT1=window.TUT1={stg:-1,A:null,B:null,hid:[],t:0};
  const tutOn=()=>!!(B&&B.first&&!tut&&!net.on&&TUT1.stg<2&&(TUT1.stg>=0||TUT1.hid.length>0));
  const mobileT=o=>!o.dead&&o!==player&&!o.isPlayer&&!(o.T&&o.T.static)&&!(o.T&&o.T.support);
  function camDir(){ const v=new THREE.Vector3(); camera.getWorldDirection(v); v.y=0; if(v.lengthSq()<1e-4) v.set(Math.sin(player.heading),0,Math.cos(player.heading)); return v.normalize(); }
  function okSpot(x,z){ if(Math.abs(x)>W.bx-25||Math.abs(z)>W.bz-25) return false; if(W.water!=null&&heightAt(x,z)<W.water+.4) return false; return true; }
  // pone el tanque delante de la cámara a la distancia d, de modo que se vea (relieve, casas y árboles) y con el ángulo face respecto del jugador
  function placeView(o,d,face){ const c=camDir(), eye=eyeOf(player);
    for(const k of [1,.9,1.1,.8,1.2]) for(const a of [0,.1,-.1,.2,-.2,.3,-.3,.42,-.42,.55,-.55]){
      const ca=Math.cos(a), sa=Math.sin(a), ux=c.x*ca+c.z*sa, uz=-c.x*sa+c.z*ca, x=player.pos.x+ux*d*k, z=player.pos.z+uz*d*k;
      if(!okSpot(x,z)) continue; const y=heightAt(x,z), tgt=new THREE.Vector3(x,y+1.2,z), tgt2=new THREE.Vector3(x,y+2,z);
      try{ if(!los(eye,tgt)||!los(camera.position.clone(),tgt2)) continue; }catch(e){}
      o.pos.set(x,y,z); o.speed=0; const tx=player.pos.x-x, tz=player.pos.z-z; o.heading=Math.atan2(tx,tz)+face;
      if(o.root){ o.root.position.copy(o.pos); o.root.rotation.y=o.heading; o.root.visible=true; } return true; }
    const x=player.pos.x+c.x*d*.6, z=player.pos.z+c.z*d*.6; o.pos.set(x,heightAt(x,z),z); o.heading=Math.atan2(player.pos.x-x,player.pos.z-z)+face;
    if(o.root){ o.root.position.copy(o.pos); o.root.rotation.y=o.heading; o.root.visible=true; } return false; }
  function hideT(o){ if(o._tutP) return; o._tutP=o.pos.clone(); o._tutH=o.heading; o.pos.x+=6000; o.speed=0; if(o.root){ o.root.position.copy(o.pos); o.root.visible=false; } TUT1.hid.push(o); }
  function showT(o){ if(!o._tutP) return; o.pos.copy(o._tutP); o.heading=o._tutH; o._tutP=null; if(o.root){ o.root.position.copy(o.pos); o.root.rotation.y=o.heading; o.root.visible=true; } }
  { const _ai=updateAI; updateAI=function(t,dt){ if(tutOn()&&t!==player){ t.speed=0; t.target=null; return; }   // durante las etapas nadie se mueve ni dispara
      return _ai.apply(this,arguments); }; }
  { const _bf=typeof botFire==='function'?botFire:null; if(_bf) botFire=function(t){ if(tutOn()&&t!==player) return; return _bf.apply(this,arguments); }; }
  // zonas del tanque A según dónde pegó: costado o cola = débil; frente, techo o torre de frente = fuerte
  function frame0(e){ const h=e.heading||0, M=e.T.m||{}; return {f:new THREE.Vector3(Math.sin(h),0,Math.cos(h)),rt:new THREE.Vector3(Math.cos(h),0,-Math.sin(h)),Lh:(M.L||6)/2,Wh:(M.W||3)/2}; }
  function weakHit(e,hit,dir){ const F=frame0(e); let p=hit&&hit.point;
    if(!p){ const d=dir.clone().setY(0).normalize(); return -d.dot(F.f)<.5; }
    const v=p.clone().sub(e.pos), lz=v.dot(F.f), lx=v.dot(F.rt);
    return lz<-F.Lh*.55||(Math.abs(lx)>F.Wh*.55&&lz<F.Lh*.6); }
  const hullA=e=>(e.T.armor&&e.T.armor.hull)||{};
  const useRear=e=>{ const A=hullA(e); return (A.side||0)>=(A.front||0)*.8&&(A.rear||99)<(A.side||0); };   // costado casi tan fuerte como el frente (Matilda): se marca la cola
  function sidePt(e){ const F=frame0(e), y=e.pos.y+(e.topH||2.4)*.36;
    if(useRear(e)) return e.pos.clone().addScaledVector(F.f,-F.Lh*1.02).setY(y);
    const sd=Math.sign(player.pos.clone().sub(e.pos).dot(F.rt))||1;
    return e.pos.clone().addScaledVector(F.rt,sd*F.Wh*1.02).addScaledVector(F.f,-F.Lh*.2).setY(y); }
  function frontPt(e){ const F=frame0(e); return e.pos.clone().addScaledVector(F.f,F.Lh*.95).setY(e.pos.y+(e.topH||2.4)*.38); }
  TUT1.sidePt=e=>sidePt(e);
  const armorOf=e=>{ const A=hullA(e), r=useRear(e); return {fm:A.front||'?',sm:(r?A.rear:A.side)||'?',rear:r}; };
  // marca verde fija sobre el costado de A (pedido de Sebastián: "que nunca me deje de mostrar el punto débil")
  const wk=document.createElement('div'); wk.id='weakMk'; wk.setAttribute('data-notr',''); document.body.appendChild(wk);
  { const st3=document.createElement('style'); st3.textContent=`#weakMk{position:fixed;z-index:7;pointer-events:none;display:none;transform:translate(-50%,-50%);width:20px;height:20px;border:3px solid #7ce07c;border-radius:50%;box-shadow:0 0 0 2px #000,0 0 12px #7ce07c;animation:wkP 1s ease-in-out infinite}
    #weakMk b{position:absolute;left:50%;bottom:100%;transform:translateX(-50%);margin-bottom:6px;white-space:nowrap;font:800 15px 'Saira Condensed',system-ui,sans-serif;color:#7ce07c;text-shadow:0 1px 3px #000,0 0 2px #000}
    @keyframes wkP{50%{transform:translate(-50%,-50%) scale(1.25)}}`; document.head.appendChild(st3); }
  function weakMark(){ const e=TUT1.A; if(TUT1.stg!==0||!e||e.dead||state!=='play'||scopeOn){ wk.style.display='none'; return; }
    const v=sidePt(e).project(camera); if(v.z>1||Math.abs(v.x)>1.05||Math.abs(v.y)>1.05){ wk.style.display='none'; return; }
    wk.style.left=((v.x+1)/2*innerWidth)+'px'; wk.style.top=((1-v.y)/2*innerHeight)+'px';
    const t=`${EN()?'AIM HERE':'APUNTÁ ACÁ'} · ${armorOf(e).sm} mm`; if(wk._t!==t){ wk._t=t; wk.innerHTML=`<b>${t}</b>`; } wk.style.display='block'; }
  function tut1Tick(){ if(B&&!B.first&&TUT1.hid.length){ for(const o of TUT1.hid) showT(o); TUT1.hid=[]; }   // por las dudas: fuera de la 1ª batalla nadie queda escondido
    if(!B||!B.first||tut||net.on||!player||player.dead){ wk.style.display='none'; return; }
    const tn=now-B.t0;
    // bienvenida del instructor (pedido de Sebastián) y primero a moverse: el enemigo aparece cuando el entrenador pasa a "disparar"
    if(TUT1.stg===-1&&!TUT1.hid.length&&tn>.3){ if(!tanks.some(o=>mobileT(o)&&o.team!==player.team)){ TUT1.stg=2; return; } for(const o of tanks) if(mobileT(o)) hideT(o); }   // al desplegar: solo vos en el mapa
    if(TUT1.stg===-1&&!B.said.welcome&&tn>1.2&&!(typeof bannerT!=='undefined'&&bannerT>0)){
      if(lesson(EN()?'Welcome to TaraWar!':'¡Bienvenido a TaraWar!',EN()
          ?`<p>I am your <b>instructor</b>. In a few minutes you will know how to drive and fight with your ${player.T.label}.</p><p>${mob()?'<b>Left stick</b>: drive · <b>drag on the right</b>: turn the turret and aim.':`${K('fwd')} forward · ${K('back')} reverse · ${K('left')} ${K('right')} turn the hull.<br>Move the <b>mouse</b> to turn the turret and aim.`}</p><p>First, get the feel of it: <b>drive about 40 m</b> and <b>turn the turret</b>.</p>`
          :`<p>Soy tu <b>instructor</b>. En unos minutos vas a saber manejar y pelear con tu ${player.T.label}.</p><p>${mob()?'<b>Palanca de la izquierda</b>: moverse · <b>arrastrá a la derecha</b>: girar la torreta y apuntar.':`${K('fwd')} avanzar · ${K('back')} retroceder · ${K('left')} ${K('right')} girar el casco.<br>Mové el <b>mouse</b> para girar la torreta y apuntar.`}</p><p>Primero agarrale la mano: <b>avanzá unos 40 m</b> y <b>girá la torreta</b>.</p>`,{low:1})) B.said.welcome=1; }
    const moveDone=window.coach&&coach.on?coach.step>=1:(B.said.welcome&&tn>10);
    if(TUT1.stg===-1&&B.said.welcome&&moveDone&&state==='play'){
      const E=TUT1.hid.filter(o=>o._tutP&&!o.dead&&o.team!==player.team); if(!E.length){ for(const o of TUT1.hid) showT(o); TUT1.hid=[]; TUT1.stg=2; return; }
      const gap=o=>{ const A=hullA(o); return (A.front||0)-Math.min(A.side||99,A.rear||99)+(o.T.cls==='medio'?1000:['ligero','pesado'].includes(o.T.cls)?100:0); };   // siempre un mediano si hay (pedido de Sebastián); si no, otro tanque antes que un cazatanques
      TUT1.A=E.slice().sort((a,b)=>gap(b)-gap(a))[0]; showT(TUT1.A); placeView(TUT1.A,55,useRear(TUT1.A)?2.3:1.15); TUT1.stg=0; }
    if(TUT1.stg===0&&(!TUT1.A||TUT1.A.dead)){ if(!TUT1.t) TUT1.t=now+1.6; else if(now>=TUT1.t){ TUT1.t=0;
      const L=TUT1.hid.filter(o=>o._tutP&&!o.dead&&o.team!==player.team); TUT1.B=L[0]||null;
      if(TUT1.B){ showT(TUT1.B); placeView(TUT1.B,300,.5); TUT1.stg=1; } else TUT1.stg=2; } }
    if(TUT1.stg===1&&(!TUT1.B||TUT1.B.dead)){ if(!TUT1.t) TUT1.t=now+1.6; else if(now>=TUT1.t){ TUT1.t=0; for(const o of TUT1.hid) showT(o); TUT1.hid=[]; TUT1.stg=2; } }
    weakMark(); }
  { const _a=hitTank; hitTank=function(by,hit,dir,pen,kind){
      const t=hit&&hit.object&&hit.object.userData.tank, me=by&&by.isPlayer&&kind==='shell'&&t&&!t.dead&&player&&t.team!==player.team;
      if(me&&tutOn()&&(t===TUT1.A||t===TUT1.B)){
        if(t===TUT1.A&&!weakHit(t,hit,dir)){ try{ hitMark(hit,0,'Rebote',dir); }catch(e){} try{ sfx('ric_'+((Math.random()*4)|0),hit.point,.8,{near:true}); }catch(e){}
          hitMsg(EN()?`Bounced off (${armorOf(t).fm} mm). Aim at the green mark`:`Rebotó (${armorOf(t).fm} mm). Apuntá a la marca verde`,'#ffb04a'); return; }
        destroy(t,by,false); return; }
      if(t&&t._tutP) return;   // escondido: no cuenta
      return _a.apply(this,arguments); }; }
  // ---- funciones bloqueadas hasta que se explican (pedido de Sebastián) ----
  // mira y zoom: hasta el cartel de la mira · munición y ametralladora: hasta el cartel de la 2ª batalla ·
  // reparar, apoyos, humo, extintor, infantería: hasta el cartel de la 3ª
  function locks(){ if(!B||tut||net.on||B.lvl>=4) return {}; const L=B.lvl;
    return {scope:!(B.said.mira||LSg('tw2_lMira')), ammo:L===1||(L===2&&!B.said.l2), sup:L<3||(L===3&&B.teach&&!B.said.l4)}; }
  const LOCK_OF={scope:'scope',ammo1:'ammo',ammo2:'ammo',ammo3:'ammo',ammoAuto:'ammo',mg:'ammo',arty:'sup',air:'sup',inf:'sup',nuke:'sup',thermal:'sup',aerial:'sup',troops:'sup',repair:'sup',crewSwap:'sup',smoke:'sup',ext:'sup'};
  let lockMsgT=0;
  function lockMsg(){ if(now-lockMsgT<2.5) return; lockMsgT=now; try{ hitMsg(EN()?'🔒 Not yet: I will explain it soon':'🔒 Todavía no: ya te lo explico','var(--paper)'); }catch(e){} }
  document.addEventListener('keydown',e=>{ if(typeof state==='undefined'||state!=='play'||!player) return; const Lk=locks();
    for(const a in LOCK_OF) if(Lk[LOCK_OF[a]]&&(e.code===binds[a]||(a==='scope'&&binds.scope==='ShiftLeft'&&e.code==='ShiftRight'))){ e.stopImmediatePropagation(); e.preventDefault(); if(!e.repeat) lockMsg(); return; } },true);
  { const _f=frame; frame=function(){ const r=_f.apply(this,arguments); try{ const Lk=locks();
      document.body.classList.toggle('lkScope',!!Lk.scope); document.body.classList.toggle('lkAmmo',!!Lk.ammo); document.body.classList.toggle('lkSup',!!Lk.sup);
      if(state==='play'&&player){ if(Lk.scope&&(scopeOn||rightDown)){ scopeOn=false; rightDown=false; lockMsg(); } } }catch(e){} return r; }; }
  { const st4=document.createElement('style'); st4.textContent=`body.lkScope #tch .tScope,body.lkScope #tch .tZoom,body.lkAmmo #tch .tMg,body.lkAmmo #ammoSlots{display:none!important}`; document.head.appendChild(st4); }
  // ---- premio de la 1ª batalla: 1.000 Yaguaretés (un tanque cuesta ~10.000); la caja sale al terminar la 3ª ----
  { const _br=battleReward; battleReward=function(){ const r=_br.apply(this,arguments); if(B&&B.first&&!tut) r.yp=Math.min(r.yp,1000); return r; }; }
  const gift=document.createElement('div'); gift.id='pGift'; gift.setAttribute('data-notr',''); document.body.appendChild(gift);
  function giftBox(k){ const V=VEH[k]; if(!V) return; const E=EN();
    try{ PROG.unlocked[k]=1; PROG.owned[k]=1; const g=garRef(V.nation,eraOf(k)); if(!g.includes(k)){ if(g.length>=3) g.pop(); g.unshift(k); } saveProg(); }catch(e){}
    gift.className=''; gift.innerHTML=`<h2>${E?'Training complete!':'¡Terminaste el entrenamiento!'}</h2><div class="sub">${E?'Here is your first tank:':'Acá está tu primer tanque:'}</div>
      <div class="crate"><div class="star">⭐</div><div class="body"><div class="q">?</div></div><div class="lid"></div></div><div class="burst"></div>
      <div class="prize">${typeof miniHTML==='function'?miniHTML(k):''}<div class="nm">${V.label}</div>
        <div class="ds">${E?'It is yours for good. Win battles to research and buy the next ones in the line.':'Es tuyo para siempre. Ganá batallas para investigar y comprar los siguientes de la línea.'}</div>
        <button class="go" id="pGiftOk">${EN()?'Great!':'¡Genial!'}</button></div>
      <button class="go openB" id="pGiftOpen">${EN()?'Open the box':'Abrir la caja'}</button>`;
    gift.style.display='flex';
    const open=()=>{ if(gift.classList.contains('open')) return; gift.classList.add('open');
      try{ if(typeof miniPedir==='function') miniPedir([k]); }catch(e){}
      try{ if(typeof sfx==='function') sfx('metal',null,.6,{near:true,rate:1.4}); }catch(e){}
      try{ if(typeof cgCall==='function') cgCall(S=>S.game.happytime()); }catch(e){} };
    gift.querySelector('.crate').onclick=open; gift.querySelector('#pGiftOpen').onclick=open;
    gift.querySelector('#pGiftOk').onclick=()=>{ gift.style.display='none'; }; }
  // al terminar la 3ª batalla (fin del entrenamiento) se saca el tanque elegido y se regala el primero de la línea de esa nación (rapida.js)
  { const _sum=summary; summary=function(winner){ const r=_sum.apply(this,arguments);
      try{ const L=PROG&&PROG.loan; if(PROG&&(PROG.train||(L&&!L.done))&&!tut&&!curSpecial&&battles()>=3&&state==='summary'){
        if(L&&window.returnLoan) returnLoan(); if(L) L.done=1; const n=(L&&L.n)||chosenNation, f=vehTreeE(n,3)[0];
        if(PROG.train){ PROG.train=0; PROG.lockN=1; PROG.openN=[n]; PROG.winBase=(PROG.stats&&PROG.stats.wins)||0; }   // las otras naciones quedan cerradas (rapida.js)
        if(f){ const G=garRef(n,3), i=G.indexOf(f); if(i>=0) G.splice(i,1); G.unshift(f); if(typeof hgSel!=='undefined') hgSel=f; chosenNation=n; }
        saveProg(); if(f) setTimeout(()=>giftBox(f),900); } }catch(e){ console.warn('entrenamiento',e); }
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
