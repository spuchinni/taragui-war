// Premio diario con racha de 14 días y tanque especial (pedido de Sebastián: "un poco de cada uno, mejoras, stickers, accesorios,
// camuflaje, y días seguidos"). Va después de rapida.js y antes de inicio.js.
//  · PROG.racha={last,n,ciclo}: un premio por día (fecha local). Si se saltea un día la racha vuelve a 1. El día 14 regala un
//    tanque especial (SPECIALS, uno distinto por ciclo) y la racha arranca de nuevo.
//  · Premios: Yaguaretés (PROG.yp) y experiencia (PROG.pxp), calcomanías, accesorios, camuflajes exclusivos (CAMOS con daily:1, no se
//    compran con medallas) y mejoras de una batalla (doble PI o +50 % de Yaguaretés).
//  · Calcomanías y accesorios: PROG.cos={stk,acc (los que tenés), sel:{tanque:{stk,acc:[]}}, boost:{xp,ag}}. Se ponen solo en
//    tu tanque (en batalla y en el garaje); los demás jugadores online no los ven. Botón "Calcomanías y accesorios" en el hangar.
//  · Tanques especiales: copias de un tanque famoso con nombre y pintura propios (mismos números), fuera del árbol: van al garaje.
// Textos en los dos idiomas acá mismo (data-notr).
(function(){
  const EN=()=>window.LANG==='en';
  const T2=(es,en)=>EN()?en:es;

  // ---- camuflajes exclusivos ----
  Object.assign(CAMOS,{
    franjas:{n:'Franjas 44',cols:['#8a7f5a','#5f6a46','#6b5038'],mode:'stripes',cost:0,daily:1},
    pampa:{n:'Pampa',cols:['#8a7a48','#5a6a34','#a8956a'],cost:0,daily:1},
    nocturno:{n:'Nocturno',cols:['#3e444c','#262a30','#5c636c'],cost:0,daily:1},
    turba:{n:'Turba',cols:['#6a5a3e','#4a4a32','#8a7a5a'],mode:'stripes',cost:0,daily:1}});
  const DAILY_CAMOS=['franjas','pampa','nocturno','turba'];

  // ---- calcomanías y accesorios ----
  const STK={yaguarete:{es:'Yaguareté',en:'Jaguar',e:'🐆'},as:{es:'As de espadas',en:'Ace of spades',e:'♠️'},calavera:{es:'Calavera',en:'Skull',e:'💀'},
    rayo:{es:'Rayo',en:'Lightning',e:'⚡'},estrella:{es:'Estrella dorada',en:'Gold star',e:'⭐'},sol:{es:'Sol',en:'Sun',e:'🌞'},dados:{es:'Dados',en:'Dice',e:'🎲'},trebol:{es:'Trébol',en:'Clover',e:'🍀'}};
  const ACC={sacos:{es:'Sacos terreros',en:'Sandbags',e:'🧱'},troncos:{es:'Troncos',en:'Logs',e:'🪵'},ramas:{es:'Ramas de camuflaje',en:'Foliage',e:'🌿'},
    bidones:{es:'Bidones',en:'Jerrycans',e:'🛢️'},eslabones:{es:'Eslabones de repuesto',en:'Spare track links',e:'⛓️'}};
  const cos=()=>{ PROG.cos=PROG.cos||{}; const C=PROG.cos; C.stk=C.stk||{}; C.acc=C.acc||{}; C.sel=C.sel||{}; C.boost=C.boost||{xp:0,ag:0}; return C; };

  // ---- tanques especiales (uno por ciclo de 14 días) ----
  const SPECIALS=[{k:'esp_m4a1',base:'m4a1',es:'M4A1 Sherman «Pampa»',en:'M4A1 Sherman "Pampa"',camo:['#8a7a48','#5a6a34','#a8956a'],mode:'w2de'},
    {k:'esp_t34',base:'t34',es:'T-34 «Invierno del 41»',en:'T-34 "Winter of 41"',camo:['#dfe2dc','#aeb3ab','#7a7f74'],mode:'flat'},
    {k:'esp_pz4h',base:'pz4h',es:'Panzer IV H «As»',en:'Panzer IV H "Ace"',camo:['#3e444c','#5c636c','#262a30'],mode:'w2de'},
    {k:'esp_nahuel',base:'nahuel',es:'Nahuel DL-43 «Corrientes»',en:'Nahuel DL-43 "Corrientes"',camo:['#c7b48a','#7a8a4a','#a8946a'],mode:'w2de'}].filter(S=>VEH[S.base]);
  for(const S of SPECIALS){ const B=VEH[S.base];
    VEH[S.k]={...B,label:S.es,special:1,camo:S.camo,camoMode:S.mode,
      desc:`${T2('Tanque especial del premio de 14 días seguidos.','Special tank from the 14-day streak reward.')} ${B.desc||''}`};
    if(typeof OPTIC!=='undefined'&&OPTIC[S.base]&&!OPTIC[S.k]) OPTIC[S.k]=OPTIC[S.base]; }
  const specialOf=c=>SPECIALS[c%SPECIALS.length];

  // ---- la racha y la ruleta de premios (pedido de Sebastián: "en un carrusel y al azar, no calendario") ----
  // Días 1 a 13: un premio al azar de POOL (más grande cuanto más larga la racha). Día 14: el tanque especial, seguro.
  const DAYS=14;
  const RAR=[{es:'Común',en:'Common',c:'#9aa3ab'},{es:'Raro',en:'Rare',c:'#4aa3ff'},{es:'Épico',en:'Epic',c:'#b067ff'},{es:'Legendario',en:'Legendary',c:'#ffc23a'}];
  const POOL=[
    {w:30,rar:0,make:d=>({yp:400+100*d,xp:250+60*d})},
    {w:10,rar:1,make:d=>({yp:1500+150*d,xp:900+80*d})},
    {w:16,rar:1,make:()=>({stk:1}),ok:()=>Object.keys(STK).some(k=>!cos().stk[k])},
    {w:12,rar:1,make:()=>({boost:'xp',n:1})},
    {w:10,rar:2,make:()=>({boost:'ag',n:2})},
    {w:12,rar:2,make:()=>({acc:1}),ok:()=>Object.keys(ACC).some(k=>!cos().acc[k])},
    {w:6,rar:3,make:()=>({camo:1}),ok:()=>DAILY_CAMOS.some(k=>!(PROG.camoOwn||{})[k])}];
  const ymd=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const today=()=>ymd(new Date()), yesterday=()=>{ const d=new Date(); d.setDate(d.getDate()-1); return ymd(d); };
  const racha=()=>{ PROG.racha=PROG.racha||{last:null,n:0,ciclo:0}; return PROG.racha; };
  const canClaim=()=>PROG&&racha().last!==today();
  const broken=()=>{ const R=racha(); return R.n>0&&R.last!==today()&&R.last!==yesterday(); };
  const pickNew=(all,own)=>{ const f=Object.keys(all).filter(k=>!own[k]); return f.length?f[(Math.random()*f.length)|0]:null; };
  function rollPool(day,any){ const L=POOL.filter(p=>any||!p.ok||p.ok()), tot=L.reduce((a,p)=>a+p.w,0); let x=Math.random()*tot;
    for(const p of L){ x-=p.w; if(x<=0) return {...p.make(day),rar:p.rar}; } return {...L[0].make(day),rar:L[0].rar}; }
  // lo que muestra cada tarjeta de la ruleta
  function cardOf(r,c){ if(r.tank){ const S=specialOf(c); return {i:'🎁',t:T2('Tanque especial','Special tank'),s:S?T2(S.es,S.en):''}; }
    if(r.yp) return {i:'🐆',t:`${r.yp.toLocaleString('es-AR')} Yaguaretés`,s:`+${r.xp.toLocaleString('es-AR')} XP`};
    if(r.stk) return {i:'🏷️',t:T2('Calcomanía','Sticker'),s:T2('para tu tanque','for your tank')};
    if(r.acc) return {i:'🎒',t:T2('Accesorio','Accessory'),s:T2('para tu tanque','for your tank')};
    if(r.camo) return {i:'🎨',t:T2('Camuflaje','Camouflage'),s:T2('exclusivo','exclusive')};
    if(r.boost==='xp') return {i:'⚡',t:T2('Doble PI','Double RP'),s:T2('1 batalla','1 battle')};
    if(r.boost==='ag') return {i:'💰',t:T2('+50 % de Yaguaretés','+50% Yaguaretés'),s:T2(`${r.n||1} batallas`,`${r.n||1} battles`)}; return {i:'?',t:'',s:''}; }
  function give(r,c){ const C=cos(), K=cardOf(r,c); let msg=`${K.i} ${K.t}${K.s?' · '+K.s:''}`;
    if(r.yp){ PROG.yp=(PROG.yp||0)+r.yp; PROG.pxp=(PROG.pxp||0)+r.xp; }
    if(r.stk){ const k=pickNew(STK,C.stk); if(k){ C.stk[k]=1; msg='🏷️ '+T2('Calcomanía','Sticker')+': '+STK[k].e+' '+T2(STK[k].es,STK[k].en); } else { PROG.yp+=800; msg='🐆 800'; } }
    if(r.acc){ const k=pickNew(ACC,C.acc); if(k){ C.acc[k]=1; msg='🎒 '+T2(ACC[k].es,ACC[k].en)+' '+ACC[k].e; } else { PROG.yp+=800; msg='🐆 800'; } }
    if(r.camo){ PROG.camoOwn=PROG.camoOwn||{base:1}; const k=DAILY_CAMOS.find(x=>!PROG.camoOwn[x]); if(k){ PROG.camoOwn[k]=1; msg='🎨 '+T2('Camuflaje','Camo')+': '+CAMOS[k].n; } else { PROG.yp+=1000; msg='🐆 1.000'; } }
    if(r.boost){ C.boost[r.boost]=(C.boost[r.boost]||0)+(r.n||1); }
    if(r.tank){ const S=specialOf(c); if(S){ msg='🎁 '+T2(S.es,S.en); const V=VEH[S.k]; PROG.unlocked[S.k]=1; PROG.owned[S.k]=1; const g=garRef(V.nation,eraOf(S.k)); const i=g.indexOf(S.k); if(i>=0) g.splice(i,1); g.unshift(S.k); if(g.length>3) g.length=3; } }
    return msg; }
  // se cobra ANTES de que gire la ruleta (cerrar a mitad de giro no da otro tiro)
  function claim(){ const R=racha(); if(!canClaim()) return null; if(broken()) R.n=0;
    const day=R.n, c=R.ciclo||0, r=day===DAYS-1?{tank:1,rar:3}:rollPool(day); const msg=give(r,c); R.n=day+1; R.last=today();
    if(R.n>=DAYS){ R.n=0; R.ciclo=c+1; } saveProg(); return {day,c,r,msg,tank:!!r.tank}; }

  // ---- ventana con la ruleta ----
  const CW=132, CG=10;   // ancho de cada tarjeta y espacio
  const st=document.createElement('style'); st.textContent=`
    #dayBox{position:fixed;inset:0;z-index:55;display:none;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,rgba(40,34,18,.92),rgba(0,0,0,.94));padding:12px}
    #dayBox .card{width:min(820px,96vw);text-align:center;color:#fff;font:600 16px 'Saira Condensed',system-ui,sans-serif}
    #dayBox h2{margin:0;font:800 38px 'Saira Condensed',system-ui,sans-serif;color:#ffd24a;letter-spacing:.02em} #dayBox .sub{opacity:.85;margin:2px 0 14px}
    #dayBox .win{position:relative;height:178px;overflow:hidden;border-radius:12px;background:rgba(10,12,14,.7);border:1px solid rgba(255,210,74,.35);
      -webkit-mask-image:linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent);mask-image:linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent)}
    #dayBox .strip{position:absolute;left:0;top:14px;display:flex;gap:${CG}px;will-change:transform}
    #dayBox .it{box-sizing:border-box;flex:0 0 ${CW}px;width:${CW}px;height:150px;border-radius:10px;background:linear-gradient(180deg,rgba(46,50,56,.95),rgba(24,26,30,.95));border:2px solid var(--rc);
      box-shadow:inset 0 -40px 40px -30px var(--rc);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:6px}
    #dayBox .it .i{font-size:46px;line-height:1.1} #dayBox .it .t{font:800 17px 'Saira Condensed',system-ui,sans-serif;line-height:1.05} #dayBox .it .s{font-size:13px;opacity:.75;line-height:1.1}
    #dayBox .it .r{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--rc);margin-top:2px}
    #dayBox .it.won{animation:dWin .9s ease-in-out infinite alternate} @keyframes dWin{to{transform:scale(1.07);box-shadow:0 0 26px var(--rc),inset 0 -40px 40px -30px var(--rc)}}
    #dayBox .mark{position:absolute;left:50%;top:0;bottom:0;width:3px;margin-left:-1.5px;background:#ffd24a;box-shadow:0 0 10px #ffd24a;z-index:2}
    #dayBox .mark::before,#dayBox .mark::after{content:'';position:absolute;left:50%;transform:translateX(-50%);border:9px solid transparent}
    #dayBox .mark::before{top:0;border-top-color:#ffd24a} #dayBox .mark::after{bottom:0;border-bottom-color:#ffd24a}
    #dayBox .dots{display:flex;justify-content:center;gap:6px;margin:14px 0 4px;flex-wrap:wrap} #dayBox .dot{width:22px;height:22px;border-radius:50%;border:2px solid rgba(239,231,210,.35);font-size:11px;line-height:18px;color:#cfc6b0}
    #dayBox .dot.ok{background:#ffd24a;border-color:#ffd24a;color:#1a1a1a} #dayBox .dot.now{border-color:#ffd24a;box-shadow:0 0 10px #ffd24a} #dayBox .dot.tk{width:auto;padding:0 8px;border-radius:11px}
    #dayBox .res{min-height:30px;margin:8px 0 0;font:800 24px 'Saira Condensed',system-ui,sans-serif;color:#ffd24a}
    #dayBox button{margin-top:8px;font-size:20px;min-width:200px}
    @media (max-height:520px){ #dayBox h2{font-size:26px} #dayBox .sub{font-size:14px;margin-bottom:8px} #dayBox .win{height:136px} #dayBox .strip{top:10px}
      #dayBox .it{height:116px} #dayBox .it .i{font-size:32px} #dayBox .it .t{font-size:15px} #dayBox .dots{margin:8px 0 2px} #dayBox .dot{width:18px;height:18px;line-height:14px;font-size:10px}
      #dayBox .res{font-size:19px;min-height:24px;margin-top:4px} #dayBox button{margin-top:4px;font-size:16px;padding-top:6px;padding-bottom:6px} }
    .dayB{position:relative} .dayB i{position:absolute;top:-6px;right:-6px;width:14px;height:14px;border-radius:50%;background:#ff4a36;box-shadow:0 0 0 2px #111}`;
  document.head.appendChild(st);
  const box=document.createElement('div'); box.id='dayBox'; box.setAttribute('data-notr',''); document.body.appendChild(box);
  const itemHTML=(r,c)=>{ const K=cardOf(r,c), R=RAR[r.rar||0]; return `<div class="it" style="--rc:${R.c}"><div class="i">${K.i}</div><div class="t">${K.t}</div><div class="s">${K.s}</div><div class="r">${T2(R.es,R.en)}</div></div>`; };
  function tick(){ try{ if(typeof AC==='undefined'||!AC||AC.state!=='running') return; const o=AC.createOscillator(), g=AC.createGain(); o.type='square'; o.frequency.value=1400;
    g.gain.setValueAtTime(.05,AC.currentTime); g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+.04); o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime+.05); }catch(e){} }
  function dotsHTML(cur,done){ let h=''; for(let i=0;i<DAYS;i++){ const last=i===DAYS-1; h+=`<span class="dot${i<done?' ok':''}${i===cur?' now':''}${last?' tk':''}">${last?'🎁 14':i+1}</span>`; } return h; }
  function showDaily(){ if(!PROG) return; const R=racha(), can=canClaim(), brk=can&&broken(), cur=brk?0:R.n, c=R.ciclo||0, S=specialOf(c), done=can?cur:(R.n||DAYS);
    // tira de muestra: premios al azar para ver qué puede salir (el día 14 muestra el tanque)
    const sample=[]; for(let i=0;i<9;i++) sample.push(cur===DAYS-1&&can?{tank:1,rar:3}:rollPool(cur,true));
    box.innerHTML=`<div class="card"><h2>${T2('Premio diario','Daily reward')}</h2>
      <div class="sub">${brk?T2('Se cortó tu racha: empezás de nuevo desde el día 1.','Your streak was broken: back to day 1.'):cur===DAYS-1&&can?T2('¡Día 14! Hoy te llevás el tanque especial.','Day 14! Today you win the special tank.'):T2(`Girá la ruleta todos los días. ${DAYS} días seguidos = tanque especial${S?': <b>'+S.es+'</b>':''}.`,`Spin every day. ${DAYS} days in a row = special tank${S?': <b>'+S.en+'</b>':''}.`)}</div>
      <div class="win"><div class="strip" id="dayStrip">${sample.map(r=>itemHTML(r,c)).join('')}</div><div class="mark"></div></div>
      <div class="dots">${dotsHTML(can?cur:-1,done)}</div>
      <div class="res" id="dayRes">${can?'':T2('Ya giraste hoy. ¡Volvé mañana para seguir la racha!','You already spun today. Come back tomorrow to keep the streak!')}</div>
      ${can?`<button class="go" id="dayGo">🎰 ${T2('Girar','Spin')}</button>`:''}<br><button class="go alt" id="dayX">${T2('Cerrar','Close')}</button></div>`;
    box.style.display='flex';
    const strip=document.getElementById('dayStrip'), win=box.querySelector('.win');
    const center=()=>win.clientWidth/2, posOf=i=>center()-(i*(CW+CG)+CW/2);
    strip.style.transform=`translateX(${posOf(4)}px)`;
    let spinning=false;
    document.getElementById('dayX').onclick=()=>{ if(spinning) return; box.style.display='none'; if(state==='menu') mainMenu(); };
    const g=document.getElementById('dayGo'); if(g) g.onclick=()=>{ if(spinning) return; try{ initAudio(); if(AC&&AC.state==='suspended') AC.resume(); }catch(e){}
      const C2=claim(); if(!C2) return; spinning=true; g.disabled=true; g.style.visibility='hidden';
      // tira larga: relleno al azar y el premio ganado en la posición WIN
      const WIN=38, L=[]; for(let i=0;i<WIN+5;i++) L.push(i===WIN?C2.r:(C2.tank&&i>WIN-3&&i<WIN+3?rollPool(C2.day,true):rollPool(C2.day,true)));
      strip.style.transition='none'; strip.innerHTML=L.map(r=>itemHTML(r,C2.c)).join(''); strip.style.transform=`translateX(${posOf(1)}px)`; strip.offsetWidth;
      const jitter=(Math.random()-.5)*(CW*.6), end=posOf(WIN)+jitter, dur=5200;
      strip.style.transition=`transform ${dur}ms cubic-bezier(.12,.8,.18,1)`; strip.style.transform=`translateX(${end}px)`;
      let lastI=-1; const t0=performance.now();
      (function watch(){ const m=new DOMMatrixReadOnly(getComputedStyle(strip).transform), i=Math.floor((center()-m.m41)/(CW+CG)); if(i!==lastI){ lastI=i; tick(); }
        if(performance.now()-t0<dur+80) requestAnimationFrame(watch); })();
      setTimeout(()=>{ spinning=false; const it=strip.children[WIN]; if(it) it.classList.add('won');
        box.querySelector('.dots').innerHTML=dotsHTML(-1,C2.tank?DAYS:C2.day+1);
        document.getElementById('dayRes').innerHTML=(C2.tank?T2('¡Tanque especial! Ya está en tu garaje: ','Special tank! It\'s in your garage: '):T2('¡Ganaste! ','You won! '))+C2.msg;
        try{ sfx('metal',null,.5,{near:true,rate:1.5}); }catch(e){} try{ if(typeof cgCall==='function') cgCall(S=>S.game.happytime()); }catch(e){} },dur+120); }; }
  window.showDaily=showDaily;
  // botón en el menú principal y apertura sola una vez por día
  let shownDay=null;
  const _mm=mainMenu; mainMenu=function(){ const r=_mm.apply(this,arguments);
    // automático (pedido de Sebastián): sin botón; al entrar al menú, si hoy no giró, se abre la ruleta y gira sola.
    // Se puede girar de nuevo desde las 0 h (fecha local del aparato). El que nunca jugó la ve después de su 1ª batalla.
    if(!document.querySelector('.homeBar')||!PROG) return r;
    const nb=(PROG.stats&&PROG.stats.battles)||0;
    if(canClaim()&&nb>=1&&shownDay!==today()){ shownDay=today(); setTimeout(()=>{ if(state==='menu'&&document.body.classList.contains('home')){ showDaily(); setTimeout(()=>{ const g=document.getElementById('dayGo'); if(g&&box.style.display==='flex') g.click(); },900); } },700); }
    return r; };

  // ---- mejoras de una batalla ----
  const BST={xp:0,ag:0};
  const _sb=startBattle; startBattle=function(spectator){ BST.xp=BST.ag=0;
    if(!spectator&&PROG){ const C=cos(); if(C.boost.xp>0){ C.boost.xp--; BST.xp=1; } if(C.boost.ag>0){ C.boost.ag--; BST.ag=1; } if(BST.xp||BST.ag) saveProg(); }
    const r=_sb.apply(this,arguments);
    if(BST.xp||BST.ag) setTimeout(()=>{ try{ hitMsg((BST.xp?T2('⚡ Doble PI en esta batalla','⚡ Double RP this battle'):'')+(BST.xp&&BST.ag?' · ':'')+(BST.ag?T2('💰 +50 % de Yaguaretés','💰 +50% Yaguaretés'):''),'#ffd24a'); }catch(e){} },6000);
    return r; };
  const _br=battleReward; battleReward=function(){ const r=_br.apply(this,arguments); if(BST.xp) r.rp*=2; if(BST.ag) r.yp=Math.round(r.yp*1.5/10)*10; return r; };

  // ---- calcomanías y accesorios en tu tanque ----
  const stkTex={}; function stickerTex(k){ if(stkTex[k]) return stkTex[k]; const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d');
    x.font='96px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(STK[k].e,64,70);
    const t=new THREE.CanvasTexture(c); t.encoding=renderer.outputEncoding; return stkTex[k]=t; }
  const M={sand:new THREE.MeshLambertMaterial({color:0x9a8a62}),wood:new THREE.MeshLambertMaterial({color:0x6b4a2c}),leaf:new THREE.MeshLambertMaterial({color:0x4a6a2a,flatShading:true}),
    can:new THREE.MeshLambertMaterial({color:0x4a5034}),link:new THREE.MeshLambertMaterial({color:0x2e2c28})};
  const G={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,10),leaf:new THREE.IcosahedronGeometry(1,0)};
  const add=(p,g,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0)=>{ const o=new THREE.Mesh(g,m); o.position.set(x,y,z); o.scale.set(sx,sy,sz); o.rotation.set(rx,ry,rz); o.castShadow=true; p.add(o); return o; };
  function dress(t,key){ const C=cos(), S=C.sel[key]; if(!S||(!S.stk&&!(S.acc&&S.acc.length))) return;
    const R=t.root, P=R.position.clone(), Q=R.quaternion.clone(); R.position.set(0,0,0); R.quaternion.identity(); R.updateMatrixWorld(true);
    try{ const tb=new THREE.Box3(), hb=new THREE.Box3();
      if(t.turret){ t.turret.traverse(o=>{ if(o.isMesh&&o!==t.barrelMesh&&!(t.barrel&&isChild(o,t.barrel))) tb.expandByObject(o); }); }
      for(const c of R.children) if(c!==t.turret) hb.expandByObject(c);
      const deck=t.turret?t.turret.position.y:hb.max.y, W=hb.max.x-hb.min.x, zf=hb.max.z, zr=hb.min.z;
      if(S.stk&&STK[S.stk]&&t.turret&&!tb.isEmpty()){ const mat=new THREE.MeshLambertMaterial({map:stickerTex(S.stk),transparent:true,alphaTest:.25,depthWrite:false});
        const tp=t.turret.position, hw=Math.max(Math.abs(tb.max.x),Math.abs(tb.min.x))-tp.x, y=(tb.min.y+(tb.max.y-tb.min.y)*.42)-tp.y, z=(tb.min.z+tb.max.z)/2-tp.z;
        for(const s of [-1,1]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(.5,.5),mat); p.position.set(s*(hw+.012),y,Math.min(z,0)); p.rotation.y=s*Math.PI/2; t.turret.add(p); } }
      const A=S.acc||[];
      if(A.includes('sacos')) for(let i=0;i<4;i++) for(let j=0;j<2;j++) add(R,G.box,M.sand,(-1.5+i)*W*.17,deck+.08+j*.12,zf-1.15-j*.08,W*.16,.13,.34,0,(i+j)%2?.06:-.05,0);
      if(A.includes('troncos')){ const l=add(R,G.cyl,M.wood,0,deck+.16,zr+.45,.15,W*.72,.15,0,0,Math.PI/2); }
      if(A.includes('ramas')){ let h=7; const rnd=()=>{ h=(h*16807)%2147483647; return h/2147483647; };
        for(let i=0;i<12;i++){ const s=i%2?1:-1, r=.22+rnd()*.18; add(R,G.leaf,M.leaf,s*(W/2-.15-rnd()*.25),deck+.1+rnd()*.15,zr+.6+rnd()*(zf-zr-1.4),r,r*.7,r,rnd()*3,rnd()*3,0); }
        if(t.turret) for(let i=0;i<4;i++){ const r=.2+rnd()*.12; add(t.turret,G.leaf,M.leaf,(i%2?1:-1)*.5,.55+rnd()*.15,-.4-rnd()*.4,r,r*.7,r,rnd()*3,rnd()*3,0); } }
      if(A.includes('bidones')) for(let i=0;i<4;i++) add(R,G.box,M.can,(-1.5+i)*W*.13,deck-.3,zr-.08,.17,.32,.12);
      if(A.includes('eslabones')&&t.turret&&!tb.isEmpty()){ const hw=Math.max(Math.abs(tb.max.x),Math.abs(tb.min.x))-t.turret.position.x;
        for(const s of [-1,1]) for(let i=0;i<4;i++) add(t.turret,G.box,M.link,s*(hw+.03),(tb.max.y-tb.min.y)*.35,-.55+i*.3,.05,.14,.27); }
    }catch(e){ console.warn('diario: accesorios',e); }
    R.position.copy(P); R.quaternion.copy(Q); R.updateMatrixWorld(true); }
  const isChild=(o,p)=>{ for(let q=o;q;q=q.parent) if(q===p) return true; return false; };
  const _mk=makeTank; makeTank=function(crew,key){ const t=_mk.apply(this,arguments);
    try{ if(PROG&&crew&&(crew.isPlayer||(PROG.camo&&crew.cams===PROG.camo))) dress(t,key); }catch(e){ console.warn('diario: decorar',e); }
    return t; };

  // ---- hangar: botón "Calcomanías y accesorios" ----
  function hgDeco(){ const box2=$('hgModal'); if(!box2||!hgSel) return; const C=cos(), S=C.sel[hgSel]=C.sel[hgSel]||{stk:null,acc:[]};
    const ownS=Object.keys(STK).filter(k=>C.stk[k]), ownA=Object.keys(ACC).filter(k=>C.acc[k]);
    const nothing=!ownS.length&&!ownA.length;
    box2.innerHTML=`<div class="hgM" data-notr style="width:min(560px,94vw)"><h2>${T2('Calcomanías y accesorios','Stickers and accessories')} · ${VEH[hgSel].label}</h2>
      <p class="s">${nothing?T2('Todavía no tenés. Se ganan con el 📅 premio diario.','You have none yet. Win them with the 📅 daily reward.'):T2('Se ganan con el 📅 premio diario. Solo se ven en tu tanque.','Won with the 📅 daily reward. Only shown on your tank.')}
      ${C.boost.xp||C.boost.ag?'<br>'+T2('Mejoras guardadas','Saved boosts')+`: ${C.boost.xp?'⚡ '+C.boost.xp+' ':''}${C.boost.ag?'💰 '+C.boost.ag:''} (${T2('se usan solas en la próxima batalla','used automatically next battle')})`:''}</p>
      ${ownS.length?`<h3>${T2('Calcomanía','Sticker')}</h3><div class="camG"><button class="camI${!S.stk?' sel':''}" data-s="">—<b>${T2('Sin calcomanía','None')}</b></button>${ownS.map(k=>`<button class="camI${S.stk===k?' sel':''}" data-s="${k}"><span style="font-size:30px">${STK[k].e}</span><b>${T2(STK[k].es,STK[k].en)}</b></button>`).join('')}</div>`:''}
      ${ownA.length?`<h3>${T2('Accesorios','Accessories')}</h3><div class="camG">${ownA.map(k=>`<button class="camI${(S.acc||[]).includes(k)?' sel':''}" data-a="${k}"><span style="font-size:28px">${ACC[k].e}</span><b>${T2(ACC[k].es,ACC[k].en)}</b><small>${(S.acc||[]).includes(k)?T2('Puesto','On'):T2('Poner','Add')}</small></button>`).join('')}</div>`:''}
      <button class="go alt" id="mClose" style="margin:6px 0 0">${T2('Cerrar','Close')}</button></div>`;
    $('mClose').onclick=()=>{ box2.innerHTML=''; };
    const redo=()=>{ saveProg(); if(hg) hg.key=null; renderHangar(); hgDeco(); };
    box2.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{ S.stk=b.dataset.s||null; redo(); });
    box2.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{ const k=b.dataset.a; S.acc=S.acc||[]; const i=S.acc.indexOf(k); if(i>=0) S.acc.splice(i,1); else S.acc.push(k); redo(); }); }
  const _rh=renderHangar; renderHangar=function(){ if(PROG&&!PROG.camo) PROG.camo={};   // el modelo del garaje se reconoce por cams===PROG.camo
    const r=_rh.apply(this,arguments); const cam=$('hgCam');
    if(cam&&!$('hgDeco')){ cam.insertAdjacentHTML('afterend',`<button class="hgB" id="hgDeco" data-notr>${T2('Calcomanías y accesorios','Stickers & gear')}</button>`); $('hgDeco').onclick=hgDeco; }
    return r; };
})();
