/* ---------- Hangar estilo War Thunder: naciones arriba, tanque 3D al centro, fila de vehículos abajo ---------- */
let hg=null, hgSel=null, hgModal=null;
const goWrap=f=>()=>{ initAudio(); if(AC.state==='suspended')AC.resume(); f(); };
function hgInit(){
  if(hg) return hg;
  const sc=new THREE.Scene(); sc.background=new THREE.Color(0x202326); sc.fog=new THREE.Fog(0x202326,30,90);
  sc.add(new THREE.HemisphereLight(0xe6ecf2,0x2c2822,.9));
  const sl=new THREE.DirectionalLight(0xfff4e0,.95); sl.position.set(9,14,7); sc.add(sl);
  const fl=new THREE.DirectionalLight(0x9fb4d0,.35); fl.position.set(-8,5,-6); sc.add(fl);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(40,64),new THREE.MeshLambertMaterial({color:0x34363a})); floor.rotation.x=-Math.PI/2; sc.add(floor);
  const pad=new THREE.Mesh(new THREE.CircleGeometry(7.5,64),new THREE.MeshLambertMaterial({color:0x45474b})); pad.rotation.x=-Math.PI/2; pad.position.y=.01; sc.add(pad);
  const ring=new THREE.Mesh(new THREE.RingGeometry(7.4,7.6,64),new THREE.MeshBasicMaterial({color:0xc9b98a})); ring.rotation.x=-Math.PI/2; ring.position.y=.02; sc.add(ring);
  const cam=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.1,200);
  hg={sc,cam,obj:null,key:null,yaw:.9,drag:null};
  renderer.domElement.addEventListener('mousedown',e=>{ if(hangarOn()) hg.drag=e.clientX; });
  document.addEventListener('mouseup',()=>{ if(hg) hg.drag=null; });
  document.addEventListener('mousemove',e=>{ if(hg&&hg.drag!=null&&hangarOn()){ hg.yaw-=(e.clientX-hg.drag)*.008; hg.drag=e.clientX; } });
  return hg;
}
const hangarOn=()=>state==='menu'&&menuScreen==='hangar';
function hgShow(key,nat){
  hgInit(); const ck=key+'|'+nat+'|'+((PROG.camo||{})[key]||'base'); if(hg.key===ck) return;
  if(hg.obj){ hg.sc.remove(hg.obj.root); hg.obj=null; }
  const t=makeTank({name:'',team:0,nation:nat,isPlayer:false,cams:PROG.camo||{}},key,0,0,0);
  const i=tanks.indexOf(t); if(i>=0) tanks.splice(i,1); colliders=colliders.filter(c=>c.userData.tank!==t);
  scene.remove(t.root); t.root.position.set(0,0,0); t.root.rotation.set(0,0,0); hg.sc.add(t.root);
  t.turret.rotation.y=-.25; t.gunPivot.rotation.x=-.05; hg.obj=t; hg.key=ck;
}
function hgRender(dt){
  const H=hgInit(); if(!H.obj) return false;
  if(H.drag==null) H.yaw+=dt*.12;
  const M=H.obj.T.m, R=Math.max(9,M.L*1.55+5), w=innerWidth, h=innerHeight;
  H.cam.aspect=w/h; H.cam.position.set(Math.sin(H.yaw)*R,R*.32+1.5,Math.cos(H.yaw)*R); H.cam.lookAt(0,1.2,0);
  H.cam.setViewOffset(w,h,w>900?w*.1:0,h*.06,w,h); H.cam.updateProjectionMatrix();
  renderer.render(H.sc,H.cam); return true;
}
// Calibre del cañón principal, sacado del nombre de la munición (mm, cm, libras, pulgadas o la notación italiana 75/34)
function gunCal(V){ const n=(V.ammo&&V.ammo[0]&&V.ammo[0].n)||''; let m;
  if((m=n.match(/(\d+(?:[,.]\d+)?)\s*cm/))) return Math.round(parseFloat(m[1].replace(',','.'))*10)+' mm';
  if((m=n.match(/(\d+(?:[,.]\d+)?)\s*mm/))) return m[1]+' mm';
  if((m=n.match(/(\d+)\s*(?:lb|libras)/))) return ({2:'40 mm (2 libras)',3:'47 mm (3 libras)',6:'57 mm (6 libras)',17:'76,2 mm (17 libras)'})[m[1]]||m[1]+' libras';
  if((m=n.match(/(\d+)\s*in\b/))) return (+m[1]*25.4).toFixed(1).replace('.',',')+' mm';
  if((m=n.match(/\b(\d{2})\/\d{2}\b/))) return m[1]+' mm';
  return ''; }
const CLS_ES={ligero:'Ligero',medio:'Medio',pesado:'Pesado',principal:'Principal',cazatanques:'Cazatanques','antiaéreo':'Antiaéreo','de élite':'De élite','cañón':'Cañón'};
// Estado de un tanque: comprado (own), investigado sin comprar (bought=false), investigándose (res), investigable (can) o bloqueado (why)
function hgStatus(k){ const own=owned(k), done=researched(k), inG=garageOf(chosenNation).includes(k), res=!done&&k===nextResearch(VEH[k].nation);
  return {own,done,inG,res,can:canResearch(k),have:PROG.rp[k]||0,cost:rpCost(k),yc:ypCost(k),why:lockReason(k)}; }
// Bloque de compra / investigación de un tanque que todavía no tenés (hangar)
function hgGetHTML(k,S){
  if(S.done){ const falta=S.yc-(PROG.yp||0); return `<div class="lvl">Investigado. Compralo por <b>${ypTxt(S.yc)}</b> · tenés ${ypTxt(PROG.yp)}
    <div class="btns"><button class="hgB" id="hgBuy" ${falta>0?'disabled':''}>${falta>0?`Te faltan ${ypTxt(falta)}`:`Comprar · ${ypTxt(S.yc)}`}</button></div></div>`; }
  if(S.res) return `<div class="lvl">Investigando: ${S.have.toLocaleString('es-AR')} / ${S.cost.toLocaleString('es-AR')} PI<i class="pb"><i style="width:${Math.round(S.have/S.cost*100)}%"></i></i><small>Ganás PI en cada batalla con esta nación. Después lo comprás con ${YP}.</small></div>`;
  if(S.can) return `<div class="lvl">Se puede investigar · ${S.cost.toLocaleString('es-AR')} PI${S.have?` (llevás ${S.have.toLocaleString('es-AR')})`:''}<div class="btns"><button class="hgB" id="hgRes">Investigar este</button></div></div>`;
  return `<div class="lvl">🔒 ${S.why} · ${S.cost.toLocaleString('es-AR')} PI</div>`; }
function renderHangar(){
  if(!PROG) loadProg(); menuScreen='hangar'; document.body.classList.remove('home');
  const NN=Object.fromEntries(eraNations(curEra).map(k=>[k,NATIONS[k]])); if(!NN[chosenNation]) chosenNation=Object.keys(NN)[0];
  const T=vehTree(chosenNation); if(!hgSel||!T.includes(hgSel)) hgSel=garageOf(chosenNation)[0]||T[0];
  hgShow(hgSel,chosenNation);
  const V=VEH[hgSel], S=hgStatus(hgSel), lv=tankLv(hgSel), xp=tankXP(hgSel);
  const eq=[`Mira ${V.optic.join('/')}×`,`Ametralladora ${String(V.mgc||MG_CAL[hgSel]||7.62).replace('.',',')} mm`,V.arc!=null?`Sin torre: ±${Math.round(V.arc*180/Math.PI)}°`:'',V.trench?`Cruza trincheras de ${String(V.trench).replace('.',',')} m`:'',V.fcs?'Telémetro':'',V.stab?'Estabilizador':'',V.thermal?'Térmica':'',V.autoL?'Cargador automático':'',V.auto?'Cañón automático':'',V.troops?`Lleva ${V.troops} soldados`:''].filter(Boolean);
  const card=k=>{ const W2=VEH[k], s=hgStatus(k);
    return `<button class="hgc${k===hgSel?' sel':''}${s.own?'':' lock'}" data-k="${k}"><span class="br">${RANK_ROMAN[rankOf(k)]} · ${brTxt(W2.br)}</span>${s.inG?'<span class="gar" title="En el garaje">★</span>':''}
      <b>${W2.label}</b><small>${s.own?`${CLS_ES[W2.cls]||W2.cls} · Nv ${tankLv(k)}`:s.done?`Comprar · ${ypTxt(s.yc)}`:s.res?'Investigando':s.can?'Se puede investigar':'🔒 Bloqueado'}</small>
      ${s.res?`<i class="pb"><i style="width:${Math.round(s.have/s.cost*100)}%"></i></i>`:''}</button>`; };
  const upg=[2,3,4,5].map(l=>`<li class="${lv>=l?'ok':''}"><b>Nv ${l}</b> ${lvUp(l,hgSel).n}</li>`).join('');
  const modes={battle:'Batalla',camp:'Campaña',...(curEra===5?{esp:'Ctes. vs. Resistencia'}:{}),watch:'Ver partida',tut:'Tutorial'}; if(!modes[playMode]) playMode='battle';
  const playTxt=playMode==='camp'?'Abrir la campaña':playMode==='tut'?(S.own?'Tutorial con este tanque':'Tanque bloqueado'):playMode==='watch'?'Mirar una partida':playMode==='online'?'Jugar online':playMode==='esp'?'¡Al puente!':'¡A la batalla!';
  $('panel').innerHTML=`<div class="hg">
    <div class="hgTop"><button class="hgBack" id="hgBack" title="Inicio">⌂</button>${eraStripHTML()}<span class="hgBr"></span>
      ${Object.entries(NN).map(([k,N])=>`<button class="hgN${k===chosenNation?' sel':''}" data-n="${k}"><i style="background:linear-gradient(90deg,${(N.uni||N.camo).join(',')})"></i>${N.label}</button>`).join('')}
</div>
    <button class="setB" id="setB" title="Ajustes" aria-label="Ajustes">⚙</button>
    <div class="hgInfo"><div class="nm">${V.label}</div><div class="sub">${NATIONS[chosenNation].label} · ${CLS_ES[V.cls]||V.cls} · BR ${brTxt(V.br)}</div>
      <div class="st">${gunCal(V)?`<span>Cañón</span><b>${gunCal(V)}</b>`:''}<span>Penetración máx.</span><b>${Math.max(...V.ammo.map(A=>A.pen))} mm</b>
        <span>Recarga</span><b>${String(V.reload).replace('.',',')} s</b><span>Velocidad</span><b>${Math.round(V.maxF*3.6)} km/h</b>
        <span>Blindaje casco</span><b>${V.armor.hull.front} / ${V.armor.hull.side} / ${V.armor.hull.rear} mm</b><span>Blindaje torre</span><b>${V.armor.turret.front} / ${V.armor.turret.side} / ${V.armor.turret.rear} mm</b>
        <span>Tripulación</span><b>${V.crewReal||V.crew}</b><span>Pendiente máx.</span><b>${Math.round(climbOf(V)*180/Math.PI)}°</b>${typeof gunArcTxt==='function'&&!V.aa?`<span>Cañón (baja/sube)</span><b>${gunArcTxt(V)}</b>`:''}${V.year?`<span>Año</span><b>${V.year}</b>`:''}</div>
      <div class="am"><b>Munición</b>${V.ammo.map(A=>`<div><span>${A.n}</span><small>${KIND_ES[A.kind]} · ${A.pen} mm · ${Math.round(A.v)} m/s</small></div>`).join('')}</div>
      <div class="chips">${eq.map(e=>`<span>${e}</span>`).join('')}</div>
      ${S.own?`<div class="lvl"><b>Nivel ${lv}</b>${lv<5?` · ${xp.toLocaleString('es-AR')} / ${LV_XP[lv].toLocaleString('es-AR')} XP<i class="pb"><i style="width:${Math.round(xp/LV_XP[lv]*100)}%"></i></i>`:' · máximo'}<ul>${upg}</ul></div>
        ${(()=>{ const T=(PROG.tstat||{})[hgSel]; return T?`<small>Partidas ${T.b} · victorias ${T.w} · bajas ${T.k} · muertes ${T.d}${T.d?` · K/D ${(T.k/T.d).toFixed(1).replace('.',',')}`:''}</small>`:'<small>Todavía no jugaste con este tanque.</small>'; })()}
        <div class="btns"><button class="hgB" id="hgGar">${S.inG?'Quitar del garaje':'Al garaje'}</button><button class="hgB" id="hgCam">Camuflaje</button><button class="hgB" id="hgTut">Tutorial</button></div>`
       :hgGetHTML(hgSel,S)}
    </div>
    <div class="hgRow">${T.map(card).join('')}</div>
    <div class="hgRank">${(()=>{ const xp=PROG.pxp||0, r=rankIdx(xp), nx=RANKS[r+1]; return `<b>${RANKS[r][1]}</b> · ${xp.toLocaleString('es-AR')} XP · 🎖 ${PROG.medals||0} · <span title="${YP}">${ypTxt(PROG.yp||0)}</span>${nx?`<i class="pb"><i style="width:${Math.round((xp-RANKS[r][0])/(nx[0]-RANKS[r][0])*100)}%"></i></i><small>Próximo: ${nx[1]} (${nx[0].toLocaleString('es-AR')} XP)</small>`:''}`; })()}
      <div class="btns"><button class="hgB" id="hgCh">Desafíos ${(()=>{const D=ensureDaily(); return D.list.filter(c=>c.done).length+'/'+D.list.length;})()}</button><button class="hgB" id="hgTree">Árbol ▸</button></div></div>
    <div class="hgGo"><div class="garTxt">Garaje: ${garageOf(chosenNation).map(k=>VEH[k].label).join(', ')||'vacío'} · BR ${brTxt(garageBR(chosenNation))} · Enemigos: ${skillName(enemySkill())}</div>
      <div class="hgModes">${Object.entries(modes).map(([k,l])=>`<button class="${k===playMode?'sel':''}" data-m="${k}">${l}</button>`).join('')}</div>
      ${playMode==='esp'?`<div class="hgOpt"><button class="${specialSide==='ctes'?'sel':''}" data-side="ctes">Corrientes</button><button class="${specialSide==='chaco'?'sel':''}" data-side="chaco">Resistencia</button><label><input type="checkbox" id="espWatch"> solo mirar</label></div>`:''}
      <button class="hgPlay" id="hgPlay" ${playMode==='tut'&&!S.own?'disabled':''}>${playTxt}</button></div>
    <div id="hgModal"></div></div>`;
  document.querySelectorAll('.hgN[data-n]').forEach(b=>b.onclick=()=>{ chosenNation=b.dataset.n; hgSel=null; renderHangar(); });
  wireEraStrip(()=>{ hgSel=null; renderHangar(); });
  document.querySelectorAll('.hgc').forEach(b=>b.onclick=()=>{ hgSel=b.dataset.k; renderHangar(); });
  document.querySelectorAll('.hgModes button').forEach(b=>b.onclick=()=>{ playMode=b.dataset.m; renderHangar(); });
  document.querySelectorAll('.hgOpt [data-side]').forEach(b=>b.onclick=()=>{ specialSide=b.dataset.side; renderHangar(); });
  // la ficha arranca debajo de la barra de épocas y naciones (con muchas naciones esa barra ocupa dos renglones)
  // la ficha va debajo de las naciones (con zoom, en el celular, las medidas vienen achicadas)
  { const ht=document.querySelector('.hg .hgTop'), hi=document.querySelector('.hgInfo'); if(ht&&hi){ const zm=parseFloat(getComputedStyle($('overlay')).zoom)||1, y=Math.round(ht.getBoundingClientRect().bottom/zm+8); hi.style.top=y+'px'; hi.style.maxHeight=`calc(100% - ${y+214}px)`; } }
  $('hgBack').onclick=()=>{ menuScreen='home'; mainMenu(); };
  $('hgTree').onclick=()=>{ menuScreen='tree'; treeNation=chosenNation; mainMenu(); };
  $('setB').onclick=()=>{ menuScreen='settings'; mainMenu(); };
  if($('hgGar')) $('hgGar').onclick=()=>{ const G=garRef(chosenNation); const i=G.indexOf(hgSel);
    if(i>=0){ if(G.length>1) G.splice(i,1); } else { if(G.length>=3) G.shift(); G.push(hgSel); } saveProg(); renderHangar(); };
  if($('hgTut')) $('hgTut').onclick=goWrap(()=>startTutorial(hgSel));
  if($('hgBuy')) $('hgBuy').onclick=()=>{ if(buyTank(hgSel)) renderHangar(); };
  if($('hgRes')) $('hgRes').onclick=()=>{ setResearch(hgSel); renderHangar(); };
  if($('hgCam')) $('hgCam').onclick=()=>hgCamo();
  $('hgCh').onclick=()=>hgChallenges();
  $('hgPlay').onclick=goWrap(()=>{
    if(playMode==='camp') hgCampaign(); else if(playMode==='battle') jugarOnline(); else if(playMode==='watch') startBattle(true);
    else if(playMode==='esp') startBattle($('espWatch').checked,'puente',{ally:specialSide,foe:specialSide==='ctes'?'chaco':'ctes'});
    else if(playMode==='tut') startTutorial(hgSel); else if(playMode==='online') hgOnline(); });
}
function hgChallenges(){ const D=ensureDaily(), box=$('hgModal'); if(!box) return;
  box.innerHTML=`<div class="hgM"><h2>Desafíos de hoy</h2><p class="s">Cada desafío cumplido da 1 medalla 🎖 y 1.000 XP. Con las medallas desbloqueás camuflajes. Se renuevan cada día.</p>
    ${D.list.map(c=>`<div class="chI${c.done?' ok':''}"><b>${c.done?'✔ ':''}${chText(c)}</b><i class="pb"><i style="width:${Math.round(c.have/c.need*100)}%"></i></i><small>${c.have} / ${c.need}</small></div>`).join('')}
    <p class="s">Medallas: 🎖 ${PROG.medals||0}</p><button class="go alt" id="mClose" style="margin:6px 0 0">Cerrar</button></div>`;
  $('mClose').onclick=()=>{ box.innerHTML=''; }; }
function hgCamo(){ const box=$('hgModal'); if(!box) return; PROG.camoOwn=PROG.camoOwn||{base:1}; PROG.camo=PROG.camo||{}; const cur=PROG.camo[hgSel]||'base';
  const sw=k=>{ const C=CAMOS[k], cols=C.cols||NATIONS[chosenNation].camo; return `<span class="sw" style="background:${C.mode==='stripes'?`repeating-linear-gradient(20deg,${cols[0]} 0 8px,${cols[1]} 8px 13px)`:`linear-gradient(135deg,${cols[0]} 0 40%,${cols[1]} 40% 70%,${cols[2]} 70%)`}"></span>`; };
  box.innerHTML=`<div class="hgM" style="width:min(520px,94vw)"><h2>Camuflaje · ${VEH[hgSel].label}</h2><p class="s">Medallas: 🎖 ${PROG.medals||0}. Los camuflajes desbloqueados sirven para todos tus tanques.</p>
    <div class="camG">${Object.keys(CAMOS).map(k=>{ const C=CAMOS[k], own=!!PROG.camoOwn[k]; return `<button class="camI${k===cur?' sel':''}" data-c="${k}">${sw(k)}<b>${C.n}</b><small>${k===cur?'En uso':own?'Usar':`🎖 ${C.cost} para desbloquear`}</small></button>`; }).join('')}</div>
    <button class="go alt" id="mClose" style="margin:6px 0 0">Cerrar</button></div>`;
  $('mClose').onclick=()=>{ box.innerHTML=''; };
  box.querySelectorAll('.camI').forEach(b=>b.onclick=()=>{ const k=b.dataset.c, C=CAMOS[k];
    if(!PROG.camoOwn[k]){ if((PROG.medals||0)<C.cost){ b.querySelector('small').textContent=`Te faltan ${C.cost-(PROG.medals||0)} medallas`; return; } PROG.medals-=C.cost; PROG.camoOwn[k]=1; }
    PROG.camo[hgSel]=k; saveProg(); if(hg) hg.key=null; renderHangar(); hgCamo(); }); }
function hgOnline(){
  const box=$('hgModal'); if(!box) return;
  box.innerHTML=`<div class="hgM"><h2>Online con amigos</h2>${onlineMenuHTML()}<button class="go alt" id="onClose" style="margin:8px 0 0">Cerrar</button></div>`;
  wireOnlineMenu(goWrap); $('onClose').onclick=()=>{ box.innerHTML=''; };
}

let treeNation=null;
function renderTree(){
  const NN=Object.fromEntries(eraNations(curEra).map(k=>[k,NATIONS[k]])); treeNation=treeNation&&NN[treeNation]?treeNation:NN[chosenNation]?chosenNation:Object.keys(NN)[0]; const n=treeNation, T=vehTree(n), g=garageOf(n), nx=nextResearch(n);
  const row=k=>{ const V=VEH[k], S=hgStatus(k), inG=g.includes(k), q=reqOf(k);
    const st=S.own?'':S.done?`<small><br>Investigado · cuesta ${ypTxt(S.yc)}</small>`:S.res?`<div class="pbar"><i style="width:${Math.round(S.have/S.cost*100)}%"></i></div><small>Investigando: ${S.have.toLocaleString('es-AR')} / ${S.cost.toLocaleString('es-AR')} PI</small>`
      :S.can?`<small><br>Se puede investigar · ${S.cost.toLocaleString('es-AR')} PI</small>`:`<small><br>🔒 ${S.why} · ${S.cost.toLocaleString('es-AR')} PI</small>`;
    const bt=S.own?`<button data-k="${k}" data-a="gar" class="tg">${inG?'Quitar':'Al garaje'}</button>`:S.done?`<button data-k="${k}" data-a="buy" class="tg" ${(PROG.yp||0)<S.yc?'disabled':''}>Comprar</button>`:S.can&&!S.res?`<button data-k="${k}" data-a="res" class="tg">Investigar</button>`:'';
    return `<div class="vrow ${S.own?'own':S.res||S.done?'res':'lock'} ${inG?'in':''}" data-k="${k}">${miniHTML(k)}<div class="br">${RANK_ROMAN[rankOf(k)]}<small style="display:block;font-size:12px">${brTxt(V.br)}</small></div><div><b>${V.label}</b><small>${CLS_ES[V.cls]||V.cls}${V.year?' · '+V.year:''}${q?' · viene del '+VEH[q].label:''}</small>${vehStatsHTML(k)}${st}</div>
      <div>${bt}</div></div>`; };
  $('panel').innerHTML=`<div class="side" style="width:min(800px,96vw)"><button class="setB" id="setB" title="Ajustes" aria-label="Ajustes">⚙</button><h1 class="logo" style="font-size:54px!important">Vehículos</h1><div class="hgTop treeEra">${eraStripHTML()}</div><p class="s">${ERAS[curEra].n} (${ERAS[curEra].y}). ${ERAS[curEra].desc}</p>
    ${radios('tn',Object.fromEntries(Object.entries(NN).map(([k,N])=>[k,{label:N.label,desc:''}])),n,'two')}
    <p class="s">Garaje (hasta 3): ${g.map(k=>VEH[k].label).join(', ')||'vacío'} · <b>BR de batalla ${brTxt(garageBR(n))}</b> (el de tu vehículo más alto). Enemigos y aliados salen con BR de ±1.0.
    Cada batalla da puntos de investigación (PI) para el tanque que estás investigando y ${YP} para comprarlo. Tenés <b>${ypTxt(PROG.yp||0)}</b>.
    Cada época tiene su propio árbol. La 2ª Guerra se juega siempre; las demás son eventos con fecha.</p>
    <div class="tree">${T.map(row).join('')}</div><p class="s">Pasá el mouse por un vehículo para ver su ficha técnica. Tocalo para verlo en el hangar.</p>
    <button class="go alt" id="back">Volver</button></div>`;
  document.querySelectorAll('.tk').forEach(b=>b.onclick=()=>{ if(b.dataset.g==='tn'){ treeNation=b.dataset.k; renderTree(); } });
  wireEraStrip(()=>{ treeNation=null; renderTree(); });
  document.querySelectorAll('.tg').forEach(b=>b.onclick=()=>{ const k=b.dataset.k;
    if(b.dataset.a==='buy'){ buyTank(k); renderTree(); return; } if(b.dataset.a==='res'){ setResearch(k); renderTree(); return; }
    const G=garRef(n), i=G.indexOf(k); if(i>=0){ if(G.length>1) G.splice(i,1); } else { if(G.length>=3) G.shift(); G.push(k); } saveProg(); renderTree(); });
  $('back').onclick=()=>{menuScreen='hangar';chosenNation=treeNation;mainMenu();}; $('setB').onclick=()=>{menuScreen='settings';mainMenu();};
  document.querySelectorAll('.vrow').forEach(r=>{ r.onclick=e=>{ if(e.target.closest('button')) return; vfichaOff(); chosenNation=treeNation; hgSel=r.dataset.k; menuScreen='hangar'; mainMenu(); };
    r.onmouseenter=()=>vficha(r.dataset.k,r); r.onmouseleave=vfichaOff; });
  vfichaOff(); miniPedir(T);
}
// Modo retro (estilo juego de PlayStation, pedido de Sebastián): imagen a resolución baja agrandada sin suavizar, texturas con
// píxeles a la vista (filtro "nearest") y sin sombras. Las texturas nuevas (tanques que aparecen) se ajustan cada 1,5 s.
let retroT=0;
function retroTextures(on){ const seen=new Set(), fix=t=>{ if(!t||!t.isTexture||seen.has(t)) return; seen.add(t);
    const mag=on?THREE.NearestFilter:THREE.LinearFilter, min=on?THREE.NearestMipmapLinearFilter:THREE.LinearMipmapLinearFilter;
    if(t.magFilter!==mag||t.minFilter!==min){ if(t._aniso==null) t._aniso=t.anisotropy; t.magFilter=mag; t.minFilter=min; t.anisotropy=on?1:t._aniso; t.needsUpdate=true; } };
  [sueloTex(),metalTex(),typeof leafTex!=='undefined'?leafTex:null].forEach(fix);
  scene.traverse(o=>{ const M=o.material; if(!M) return; (Array.isArray(M)?M:[M]).forEach(m=>fix(m.map)); }); }
function applyGfx(){ document.body.classList.toggle('retro',!!Q().retro); retroTextures(!!Q().retro); renderer.setPixelRatio(Math.min(devicePixelRatio,Q().pr)); renderer.setSize(innerWidth,innerHeight,false); sun.castShadow=!!Q().sh; if(Q().sh&&sun.shadow.map&&sun.shadow.mapSize.x!==Q().sh){ sun.shadow.map.dispose(); sun.shadow.map=null; sun.shadow.mapSize.set(Q().sh,Q().sh); } }
function renderSettings(){
  const rows=ACTIONS.map(([k,label])=>`<span>${label}</span><button class="kb${bindCapture===k?' cap':''}" data-k="${k}">${bindCapture===k?'Presioná una tecla…':keyName(binds[k])}</button>`).join('');
  $('panel').innerHTML=`<div class="side settings"><h1 class="logo">Ajustes</h1>
    <h2>Mouse</h2><label class="sens">Sensibilidad <input type="range" id="sens" min="0.4" max="3" step="0.1" value="${sens}"><span id="sensV">${sens.toFixed(1)}</span></label>
    <p class="s">Clic izquierdo: cañón. Clic derecho: zoom (queda puesto; otro clic lo saca). Espacio: ametralladora. Mayús: entrar y salir de la mira. Rueda: aumento de la mira.</p>
    <h2>Sonido</h2><label class="sens">Volumen <input type="range" id="volR" min="0" max="1" step="0.05" value="${volMaster}"><span id="volV">${Math.round(volMaster*100)} %</span></label>
    <label class="chk"><input type="checkbox" id="radioC" ${radioOn?'checked':''}> Radio de la tripulación (voces en el idioma de cada nación)</label>
    <h2>Dificultad de los enemigos</h2><div class="hgOpt" id="difR">${Object.entries(DIF).map(([k,D])=>`<button class="${difficulty===k?'sel':''}" data-d="${k}">${D.n}</button>`).join('')}</div>
    <p class="s">Fácil y Normal: apuntan peor y piden artillería y aviones con menos frecuencia. "Se adapta a vos" sube o baja según cómo jugás. Se aplica en la próxima partida.</p>
    <h2>Calidad gráfica</h2><div class="hgOpt" id="gfxR">${['retro','baja','media','alta'].map(k=>`<button class="${gfx===k?'sel':''}" data-q="${k}">${k==='retro'?'Retro (PS1)':k[0].toUpperCase()+k.slice(1)}</button>`).join('')}</div>
    <p class="s">Retro: imagen pixelada estilo PlayStation, sin sombras. Baja: sin sombras ni pasto, para PCs viejas. Alta: todo al máximo. Las sombras y el pasto se aplican en la próxima partida.</p>
    <h2>Pantalla</h2><label class="chk"><input type="checkbox" id="fsC" ${fsAuto?'checked':''}> Pantalla completa al salir a la partida</label>
    <button class="go alt" id="introB" style="margin:4px 0 0">Ver la intro</button>
    <h2>Teclas</h2><p class="s">Hacé clic en una acción y presioná la tecla nueva. Esc cancela. Si la tecla ya estaba usada, se intercambian.</p>
    <div class="binds">${rows}</div>
    <button class="go alt" id="resetB">Restablecer teclas</button><button class="go alt" id="guideB">Guía completa</button><button class="go" id="back">Volver</button></div>`;
  $('sens').oninput=e=>{sens=+e.target.value;$('sensV').textContent=sens.toFixed(1);saveSettings();};
  $('volR').oninput=e=>{volMaster=+e.target.value;$('volV').textContent=Math.round(volMaster*100)+' %'; if(master) master.gain.value=volMaster; saveSettings();};
  $('radioC').onchange=e=>{radioOn=e.target.checked; saveSettings();};
  $('fsC').onchange=e=>{fsAuto=e.target.checked; saveSettings();};
  $('introB').onclick=goWrap(()=>{ bindCapture=null; introStart(); });
  document.querySelectorAll('#difR button').forEach(b=>b.onclick=()=>{ difficulty=b.dataset.d; saveSettings(); renderSettings(); });
  document.querySelectorAll('#gfxR button').forEach(b=>b.onclick=()=>{ gfx=b.dataset.q; saveSettings(); applyGfx(); renderSettings(); });
  document.querySelectorAll('.kb').forEach(b=>b.onclick=()=>{ bindCapture=bindCapture===b.dataset.k?null:b.dataset.k; renderSettings(); });
  $('resetB').onclick=()=>{ binds={...DEF_BINDS}; bindCapture=null; saveSettings(); renderSettings(); };
  $('guideB').onclick=guide;
  $('back').onclick=()=>{ bindCapture=null; menuScreen='home'; mainMenu(); };
  const ab=$('ammoSlots'); if(ab) ab._sig=null; // refrescar las teclas mostradas en la barra de munición
}
// Si el navegador bloquea el bloqueo del puntero (por ejemplo, dentro de una vista previa), se juega con el mouse libre:
// el movimiento del mouse gira la cámara y, al llevarlo a los bordes, sigue girando.
let freeAim=false, mx=-1, my=-1, fsAuto=true;
// íconos dibujados (el ⛶ no existe en las letras de muchos Android y salía como un cuadradito)
const FS_IN='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>', FS_OUT='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>';
// Pantalla completa: evita que el mouse salga del juego (y que el tanque quede "congelado" al perder el foco).
function enterFS(){ const el=document.documentElement; if(document.fullscreenElement||!el.requestFullscreen) return;
  try{ const r=el.requestFullscreen({navigationUI:'hide'}); if(r&&r.catch) r.catch(()=>banner('Pantalla completa bloqueada','Descargá el archivo y abrilo directo en Chrome o Edge',4)); }catch(e){} }
function toggleFS(){ if(document.fullscreenElement){ document.exitFullscreen&&document.exitFullscreen(); } else enterFS(); }
document.addEventListener('fullscreenchange',()=>{ const b=document.getElementById('fsBtn'); if(b) b.innerHTML=document.fullscreenElement?FS_OUT:FS_IN;
  if(document.fullscreenElement&&state==='play'&&!document.pointerLockElement&&!freeAim) lock(); });
function enableFreeAim(){ if(freeAim) return; freeAim=true; document.body.classList.add('freeaim');
  if(state==='paused'){ state='play'; $('overlay').style.display='none'; }
  if(state==='play') banner('Mouse libre','Mové el mouse para apuntar; en los bordes la cámara sigue girando',4); }
function lock(){initAudio(); if(AC.state==='suspended')AC.resume(); if(freeAim){ if(state==='paused'){state='play';$('overlay').style.display='none';} return; }
  try{ if(!renderer.domElement.requestPointerLock){ enableFreeAim(); return; } const r=renderer.domElement.requestPointerLock(); if(r&&r.catch) r.catch(enableFreeAim);}catch(e){ enableFreeAim(); }}
document.addEventListener('pointerlockerror',enableFreeAim);
document.addEventListener('pointerlockchange',()=>{
  if(document.pointerLockElement!==renderer.domElement) releaseAll();
  if(document.pointerLockElement===renderer.domElement){
    if(state==='paused'){ state='play'; $('overlay').style.display='none'; }
  } else if(state==='play'&&player&&!player.dead&&!artyPick){
    state='paused'; mouseDown=false; rightDown=false; if(engGain) engGain.gain.value=0;
    $('overlay').style.display='flex';
    $('panel').innerHTML=`<h1>Pausa</h1><p>La batalla te espera.</p><button class="go" id="resume">Volver al combate</button><button class="go alt" id="quit">Abandonar</button>`;
    $('resume').onclick=()=>lock(); $('quit').onclick=()=>{clearBattle();mainMenu();};
  }
});
renderer.domElement.addEventListener('click',()=>{ if(state==='play'&&!document.pointerLockElement&&!freeAim) lock(); });
document.addEventListener('mousemove',e=>{
  mx=e.clientX; my=e.clientY;
  if(state!=='play'||artyPick||!(document.pointerLockElement||freeAim)) return;
  const s=.0022*sens*(scoped?Math.max(.08,camera.fov/65):1);
  camYaw=wrap(camYaw-e.movementX*s); camPitch=clamp(camPitch-e.movementY*s,-.45,camMaxP());
});
document.addEventListener('mousedown',e=>{
  if(state==='spectate'&&e.target===renderer.domElement){
    if(aerial){const list=tanks.filter(t=>!t.dead).sort((a,b)=>a.team-b.team);let bi=-1,bd=40;
      list.forEach((t,i)=>{const p=project(t.pos);if(p){const d=Math.hypot(p.x-e.clientX,p.y-e.clientY);if(d<bd){bd=d;bi=i;}}});
      if(bi>=0){specIdx=bi;aerial=false;} return;}
    specIdx+=e.button===2?-1:1;return;}
  if(state!=='play'||artyPick||!(document.pointerLockElement||(freeAim&&e.target===renderer.domElement)))return; if(e.button===0)mouseDown=true; if(e.button===2)rightDown=!rightDown;}); // clic derecho: el zoom queda puesto hasta volver a hacer clic (pedido de Sebastián)
document.addEventListener('mouseup',e=>{if(e.button===0)mouseDown=false;});
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('mouseleave',()=>{ mx=-1; });
function edgeTurn(dt){
  if(!freeAim||state!=='play'||mx<0) return;
  const z=.07, ex=mx/innerWidth, ey=my/innerHeight, k=sens*1.8*(scoped?Math.max(.08,camera.fov/65):1);
  if(ex<z) camYaw=wrap(camYaw+(z-ex)/z*k*dt); else if(ex>1-z) camYaw=wrap(camYaw-(ex-1+z)/z*k*dt);
  if(ey<z) camPitch=clamp(camPitch+(z-ey)/z*k*.5*dt,-.45,camMaxP()); else if(ey>1-z) camPitch=clamp(camPitch-(ey-1+z)/z*k*.5*dt,-.45,camMaxP());
}
// ---------- Tabla de jugadores (mantener Tab) ----------
let tabOn=false, tabT=0;
function tabRows(){
  if(net.guest&&net.sb) return net.sb.map(r=>({name:r[0],team:(r[1]?1:0)^net.swap,kills:r[2],assists:r[3],deaths:r[4],caps:r[5],score:r[6],tk:r[7],alive:!!r[8],me:r[0]===(playerCrew&&playerCrew.name)}));
  return crews.map(c=>({name:c.name,team:c.team,kills:c.kills|0,assists:c.assists|0,deaths:c.deaths|0,caps:c.caps|0,score:c.score|0,tk:c.tank&&!c.tank.dead?c.tank.key:null,alive:!!(c.tank&&!c.tank.dead),me:c.isPlayer}));
}
function renderTab(){
  const R=tabRows(), sup=(cd)=>cd>0?Math.ceil(cd)+' s':'Lista';
  const tb=tm=>{ const rows=R.filter(r=>r.team===tm).sort((a,b)=>b.score-a.score);
    return `<div><h2 class="${tm===0?'ally':'foe'}"><span>${NATIONS[tm===0?allyNation:foeNation].label}</span><span>${Math.max(0,Math.round(tickets[tm]))} tickets</span></h2><table class="sum"><colgroup><col style="width:27%"><col><col style="width:9.5%"><col style="width:9.5%"><col style="width:11%"><col style="width:9%"><col style="width:11%"></colgroup><thead><tr><th>Jugador</th><th>Tanque</th><th class="n">Bajas</th><th class="n">Asist.</th><th class="n">Muertes</th><th class="n">Capt.</th><th class="n">Puntos</th></tr></thead><tbody>${
      rows.map(r=>`<tr class="${r.me?'me':''} ${r.alive?'':'dead'}"><td title="${esc(r.name)}">${esc(r.name)}</td><td>${r.tk&&VEH[r.tk]?VEH[r.tk].label:'—'}</td><td class="n">${r.kills}</td><td class="n">${r.assists}</td><td class="n">${r.deaths}</td><td class="n">${r.caps}</td><td class="n">${r.score}</td></tr>`).join('')}</tbody></table></div>`; };
  $('tabB').innerHTML=`<div class="cols">${tb(0)}${tb(1)}</div><div class="ft">${W.label} · Artillería del equipo: ${sup(playerCrew?playerCrew.artyCD:0)} · Bombardeo: ${sup(playerCrew?playerCrew.airCD:0)} · Nuke: ${NUKE_COST} pts (gana la partida)</div>`;
}
function tabBoard(on){ tabOn=on&&battleOn(); $('tabB').classList.toggle('on',tabOn); if(tabOn) renderTab(); }
document.addEventListener('keydown',e=>{
  if(e.target&&e.target.tagName==='INPUT'&&e.target.type!=='range'&&e.target.type!=='checkbox') return;
  if(bindCapture){ e.preventDefault(); if(e.code!=='Escape'){ const prev=Object.keys(binds).find(k=>binds[k]===e.code&&k!==bindCapture); if(prev) binds[prev]=binds[bindCapture]; binds[bindCapture]=e.code; saveSettings(); }
    bindCapture=null; renderSettings(); return; }
  keys[e.code]=true;
  if(artyPick&&e.code==='Escape'){ artyMap(false); return; }
  if(e.code===binds.ping&&state==='play'&&player&&!player.dead&&!e.repeat){ doPing(); return; }
  if(net.guest&&state==='play'&&player&&!player.dead&&lastAim&&(e.code===binds.arty||e.code===binds.air)&&!e.repeat){ supKey(e.code===binds.arty?'arty':'air'); return; }
  if(net.guest&&state==='play'&&player&&!player.dead&&lastAim&&[binds.arty,binds.air,binds.nuke].includes(e.code)&&!e.repeat){ hostSend({t:'sup',k:e.code===binds.arty?'arty':e.code===binds.air?'air':'nuke',p:[lastAim.x,lastAim.y,lastAim.z]}); return; }
  if(net.guest&&state==='play'&&e.code===binds.troops&&player&&!player.dead&&!e.repeat){ hostSend({t:'troops'}); return; }
  if(net.on&&state==='play'&&[binds.aerial].includes(e.code)){ hitMsg('No disponible en online (por ahora)','var(--paper)'); return; }
  if(net.guest&&state==='play'&&player&&!player.dead&&(e.code===binds.repair||e.code===binds.crewSwap)&&!e.repeat){ hostSend({t:e.code===binds.repair?'rep':'crew'}); return; }
  if(state==='play'&&player&&!player.dead&&!e.repeat&&(e.code===binds.scope||(binds.scope==='ShiftLeft'&&e.code==='ShiftRight'))) scopeOn=!scopeOn; // la mira queda puesta hasta volver a apretar
  if(e.code===binds.fullscreen&&!e.repeat) toggleFS();
  if(state==='play'&&player&&!player.dead){
    for(let i=0;i<3;i++) if(e.code===binds['ammo'+(i+1)]&&i<player.T.ammo.length){ if(player.ammoCount&&player.ammoCount[i]<=0) hitMsg('No queda munición de ese tipo','var(--enemy)'); else selectAmmo(player,i); }
    if(e.code===binds.repair) startRepair(player);
    if(e.code===binds.smoke&&!e.repeat&&!player.noSmk) deploySmoke(player);
    if(e.code===binds.ext&&!e.repeat){ if(net.guest) hostSend({t:'ext'}); else extinguish(player); }
    if(e.code===binds.crewSwap) callCrew(player);
    if(e.code===binds.ammoAuto&&player.T.ammo.length>1){ if(tut&&tut.manual) tut.autoBack=true; player.ammoManual=null; hitMsg('Munición automática','var(--paper)'); } }
  if(state==='spectate'){ if(e.code==='ArrowRight'){specIdx++;aerial=false;} if(e.code==='ArrowLeft'){specIdx--;aerial=false;} if(e.code==='Space'){aerial=!aerial;e.preventDefault();}
    if(e.code==='Escape'&&!playerCrew){clearBattle();mainMenu();} }
  if(state==='play'&&player&&!player.dead&&lastAim){
    if((e.code===binds.arty||e.code===binds.air)&&!e.repeat) supKey(e.code===binds.arty?'arty':'air'); }
  if(state==='play'&&(e.code===binds.mg||e.code==='Space'||e.code==='Tab')) e.preventDefault();
  if(e.code==='Tab'){ e.preventDefault(); if(!e.repeat) tabBoard(true); }
  if(state==='play'&&e.code===binds.aerial) goSpectate();
  if(state==='play'&&e.code===binds.troops&&player&&!player.dead&&!dismount(player)) hitMsg(player.T.troops?'Ya bajaste a la infantería':'Este vehículo no lleva tropas','var(--paper)');
  if(state==='play'&&player&&!player.dead){
    if(e.code===binds.nuke&&!RULE().sup.nuke) hitMsg('No hay armas nucleares en esta época','var(--paper)');
    else if(e.code===binds.nuke&&!callNuke(player)) hitMsg(nuke?'Ya hay un ataque nuclear en curso':`Nuke: te faltan ${NUKE_COST-playerCrew.sp} puntos`,'var(--paper)');
    if(e.code===binds.thermal){ if(player.T.thermal) player.thermal=!player.thermal; else hitMsg('Este tanque no tiene visión térmica','var(--paper)'); } } });
document.addEventListener('keyup',e=>{keys[e.code]=false; if(e.code==='Tab') tabBoard(false);});
// Si la ventana pierde el foco (Alt+Tab, Win+Shift+S, etc.) el keyup nunca llega: soltamos todo para que no queden teclas trabadas.
const releaseAll=()=>{ for(const k in keys) keys[k]=false; mouseDown=rightDown=false; };
function selectAmmo(t,i){
  if(tut) tut.manual=true;
  const A=t.T.ammo[i]; t.ammoManual=i;
  if(t.ammoIdx!==i){ t.ammoIdx=i; if(t.reloadT<=0&&!t.T.auto) t.reloadT=t.reloadMax*reloadFactor(t); } // cambiar el proyectil cargado obliga a recargar
  hitMsg(`${A.n} (${KIND_ES[A.kind]})`,'var(--paper)');
}
window.addEventListener('blur',releaseAll);
document.addEventListener('visibilitychange',()=>{ if(document.hidden) releaseAll(); });
renderer.domElement.addEventListener('wheel',e=>{ if(state==='play'&&player&&scoped){ e.preventDefault(); const n=(player.T.optic||[8]).length; if(n>1){ player.magIdx=clamp((player.magIdx||0)+(e.deltaY<0?1:-1),0,n-1); } return; } },{passive:false});
renderer.domElement.addEventListener('wheel',e=>{ if(state!=='spectate'||!aerial) return; e.preventDefault();
  aer.zoom=clamp(aer.zoom*(e.deltaY>0?1.12:1/1.12),.25,1.4); },{passive:false});

let last=performance.now();
function loop(ts){
  requestAnimationFrame(loop);
  const dt=Math.min(.05,(ts-last)/1000); last=ts;
  frame(dt);
}
// Un cuadro del juego: simulación + dibujo (separado del bucle para poder probarlo paso a paso)
function frame(dt){
  if(Q().retro){ retroT-=dt; if(retroT<=0){ retroT=1.5; retroTextures(true); } }
  if(state==='intro'&&typeof introFrame==='function'){ introFrame(dt); return; }
  const sim=['play','deploy','spectate','end'].includes(state)||(net.on&&(state==='paused'||state==='brief'));
  camera.up.set(0,1,0); boardMode=false; infAmbTick(dt);
  if(sim){
    now+=dt; mgMsgT-=dt; for(const c of crews){c.artyCD=Math.max(0,c.artyCD-dt);c.airCD=Math.max(0,c.airCD-dt);}
    if(tabOn){ tabT-=dt; if(tabT<=0){ tabT=.5; if(!battleOn()) tabBoard(false); else renderTab(); } }
    const gone=[];
    for(const t of tanks){
      t.reloadT=Math.max(0,t.reloadT-dt); t.recoil=Math.max(0,t.recoil-dt*4); t.barrel.position.z=-t.recoil*.5;
      t.spottedT-=dt;
      if(t.immuneT>0) t.immuneT-=dt;
      { const k=t.immuneT>0?.18+.12*Math.sin(now*8):0, th=thermalOn()?.55:0; t.mat.emissive.setRGB(k*.6+th,k*.8+th,k+th); if(t.mud) t.mud.emissive.copy(t.mat.emissive); }
      if(!t.isPlayer){t.mgHeat=Math.max(0,t.mgHeat-dt*.25); if(t.mgLock&&t.mgHeat<.3)t.mgLock=false;}
      if(t.dead){
        t.deadT+=dt;
        if(t.deadT<38){t.smokeT-=dt; if(t.smokeT<=0){t.smokeT=t.deadT<20?.3:.6;puff(t.pos.clone().add(new THREE.Vector3(rand(-1,1),2.5,rand(-1,1))),0x2a2622,rand(3,5),rand(3,5),2.5,.6);
          if(Math.random()<.4)puff(t.pos.clone().setY(t.pos.y+1.8),0xff7a20,2,.4,1,.9,true);}}
        if(t.popV){t.turret.position.y+=t.popV*dt;t.popV-=14*dt;t.turret.rotation.z+=dt*2;if(t.turret.position.y<t.hTop){t.turret.position.y=t.hTop;t.popV=0;}}
        if(t.deadT>40&&t!==player&&!(net.guest&&t.net)) gone.push(t);
        continue;
      }
      if(!net.guest){ updateModules(t,dt); if(t.dead) continue; }
      tankFX(t,dt);
      if(t.troops&&!t.isPlayer&&!t.net&&!net.guest){ const mine=t.team===0?1:-1; if(zones.some(Z=>Z.owner!==mine&&Math.hypot(Z.x-t.pos.x,Z.z-t.pos.z)<Z.r+25)||(t.target&&t.target.pos.distanceTo(t.pos)<60)) dismount(t); }
      if(t.net) netLerp(t,dt); else if(!t.isPlayer&&!t.dummy) updateAI(t,dt); else if(t.dummy) drive(t,0,0,dt);
    }
    gone.forEach(removeTank);
    if(!net.guest) updateBotCrews(dt);
    if(state==='play'&&player){ edgeTurn(dt); updatePlayer(dt); }
    else if(state==='end'&&nukeView) nukeCam(dt);
    else if(state==='spectate'||state==='end'){ if(!spectatorCam(dt)) orbitCam(dt); }
    else orbitCam(dt);
    updateListener(); { const sp=WX.sunPos||[40,90,25]; sun.position.set(camera.position.x+sp[0],sp[1],camera.position.z+sp[2]); } updateWeather(dt); sun.target.position.set(camera.position.x,0,camera.position.z);
    visT-=dt;
    if(visT<=0){visT=.25;const pe=player&&!player.dead?eyeOf(player):null;
      for(const t of tanks){if(t.team!==1||t.dead)continue;t.visP=!!pe&&t.pos.distanceTo(player.pos)<420*(player.thermal||(t.firedT||-9)>now-3?1:(WX.see||1))&&los(pe,eyeOf(t));if(t.visP)t.spottedT=Math.max(t.spottedT,2);}}
    updateSmoke(dt); updateA10(dt); updateShells(dt); updateArty(dt); updRefuerzos(dt); if(!tut&&!net.guest) botSupport(dt); updateNuke(dt); if(tut) updateTutorial(dt);
    if(state!=='end'&&!net.guest) updateZones(dt);
    if(net.on) netTick(dt);
    updateProps(dt);
    for(let i=scorches.length-1;i>=0;i--){ const S=scorches[i]; S.t+=dt; if(S.t>60){ S.m.material.opacity=.7*Math.max(0,1-(S.t-60)/10); if(S.t>70){ scene.remove(S.m); S.m.material.dispose(); scorches.splice(i,1); } } }
    for(const tr of trees){ if(!tr.fallen||tr.gone) continue;
      if(tr.t<1){tr.t=Math.min(1,tr.t+dt*1.8);setTreeMatrix(tr);}
      else { tr.lie=(tr.lie||0)+dt; if(tr.lie>25){ tr.sink=Math.min(1,(tr.lie-25)/3); if(tr.sink>=1) tr.gone=true; setTreeMatrix(tr); } } } // a los 25 s se hunde y desaparece
    for(let i=smolder.length-1;i>=0;i--){const S=smolder[i]; S.t-=dt; S.k=(S.k||0)-dt; if(S.k<=0){S.k=.5; puff(new THREE.Vector3(S.x+rand(-2,2),S.y+1.5,S.z+rand(-2,2)),0x5c564e,rand(3,5),3,1.8,.45);} if(S.t<=0) smolder.splice(i,1);}
    updateInfantry(dt);
    updateHud();
  } else if(state==='menu'||state==='summary'||state==='lobby'){
    orbitCam(dt); sun.position.set(40,90,25); sun.target.position.set(0,0,0);
  }
  updateFx(dt);
  if(vig>0){vig-=dt;if(vig<=0)$('vig').style.opacity=player&&!player.dead&&player.hp/player.T.hp<.35?.45:0;}
  if(hitT>0){hitT-=dt;if(hitT<=0)$('hitmsg').style.opacity=0;}
  if(bannerT>0){bannerT-=dt;if(bannerT<=0)$('banner').style.opacity=0;}
  $('scope').style.opacity=scoped&&state==='play'?1:0;
  const fg=WX.fog||W.fog||[150,460]; const fm=boardMode?3:nukeView?2.2:1; scene.fog.near=fg[0]*fm; scene.fog.far=fg[1]*fm;
  if(aerial&&aer.D&&(state==='spectate'||state==='end'||state==='deploy')){ scene.fog.near=Math.max(scene.fog.near,aer.D*.85); scene.fog.far=Math.max(scene.fog.far,aer.D*1.9); } // desde el aire se ve todo el campo
  document.body.classList.toggle('board',boardMode);
  { const th=thermalOn(); if(th!==lastTh){ lastTh=th; const bw=state==='menu'||state==='lobby'?WXS.dia:WX; hemi.intensity=th?.22:(bw.hemi??.75); sun.intensity=th?.15:(bw.sun??.85);
      const sky=th?0x1c1f1c:(bw.sky??W.sky??0xbcc6c4); scene.background.set(sky); scene.fog.color.set(sky); document.body.classList.toggle('thermal',th); } }
  document.body.classList.toggle('hangar',hangarOn()); syncIntro(); if(!(state==='play'&&player&&!player.dead)) quietEngine();
  cullUpdate(); if(!(hangarOn()&&hgRender(dt))) renderer.render(scene,camera);
  drawOverlay(); if(state!=='menu'&&state!=='summary') drawMinimap();
}
try{ const S=JSON.parse(localStorage.getItem('tw_settings')||'null'); if(S){ if(S.sens) sens=+S.sens; if(S.binds) binds={...DEF_BINDS,...S.binds}; if(S.vol!=null) volMaster=+S.vol; if(S.radio!=null) radioOn=!!S.radio; if(S.fs!=null) fsAuto=!!S.fs; if(DIF[S.dif]) difficulty=S.dif; } }catch(e){}

// ---- Apoyos desde el mapa (artillería con F, bombardeo con G): la tecla agranda el mapa, clic elige el lugar
// (o la misma tecla otra vez: donde apunta la mira); Esc cancela. El bombardeo pasa en línea desde tu tanque hacia el punto. ----
let artyPick=false, artyHover=null;
// tecla de apoyo: abre el mapa si el apoyo está listo; si ya está abierto con ese apoyo, tira donde apunta la mira
function supKey(k){ const c=playerCrew; if(!c) return;
  if(k==='air'&&!RULE().sup.air){ hitMsg('En esta época todavía no hay aviones de ataque a tierra','var(--paper)'); return; }
  const cd=k==='arty'?c.artyCD:c.airCD;
  if(cd>0&&!net.guest){ hitMsg(`${k==='arty'?'Artillería':'Bombardeo'} del equipo en espera: ${Math.ceil(cd)} s`,'var(--paper)'); return; }
  if(artyPick===k) artyFire(lastAim); else artyMap(k); }
function artyMap(on){ artyPick=on; artyHover=null; document.body.classList.toggle('artyPick',!!on);
  if(on){ if(document.pointerLockElement) document.exitPointerLock(); const K=keyName(on==='air'?binds.air:binds.arty);
    banner(on==='air'?'Bombardeo':'Artillería',`Clic en el mapa: dónde cae · ${K}: donde apuntás · Esc: cancelar`,3); }
  else if(state==='play'&&!freeAim&&!document.pointerLockElement) lock(); }
function mmWorld(e){ const r=mm.getBoundingClientRect(), S=400, k=S/(Math.max(W.bx,W.bz)*2+20), px=(e.clientX-r.left)/r.width*S, py=(e.clientY-r.top)/r.height*S;
  const x=(S/2-px)/k, z=(S/2-py)/k; return new THREE.Vector3(x,heightAt(x,z),z); }
function artyFire(p){ const k=artyPick||'arty'; artyMap(false); if(!player||player.dead||!p) return;
  if(net.guest){ hostSend({t:'sup',k,p:[p.x,p.y,p.z]}); return; }
  if(k==='air'){ if(callAirstrike(player,p)) teamSup[0].air=Math.max(teamSup[0].air,TEAM_AIR_CD*.6); }
  else if(callArtillery(player,p)) teamSup[0].arty=Math.max(teamSup[0].arty,TEAM_ARTY_CD*.6); }
mm.addEventListener('mousemove',e=>{ if(artyPick) artyHover=mmWorld(e); });
mm.addEventListener('mouseleave',()=>{ artyHover=null; });
mm.addEventListener('mousedown',e=>{ if(!artyPick||e.button!==0) return; e.preventDefault(); e.stopPropagation(); artyFire(mmWorld(e)); });
