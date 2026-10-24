/* ---------- Jugador y cámara ---------- */
// ---------- Ajustes: sensibilidad y teclas personalizables (se guardan en el navegador) ----------
const ACTIONS=[['fwd','Avanzar','KeyW'],['back','Retroceder','KeyS'],['left','Girar a la izquierda','KeyA'],['right','Girar a la derecha','KeyD'],
  ['scope','Mira telescópica (mantener)','ShiftLeft'],['mg','Ametralladora','Space'],['ammo1','Munición 1','Digit1'],['ammo2','Munición 2','Digit2'],['ammo3','Munición 3','Digit3'],
  ['ammoAuto','Munición automática','Digit4'],['arty','Artillería','KeyF'],['air','Ataque aéreo','KeyG'],['nuke','Nuke','KeyN'],['thermal','Visión térmica','KeyT'],
  ['aerial','Vista aérea (la IA maneja)','KeyV'],['troops','Bajar la infantería','KeyE'],['fullscreen','Pantalla completa','KeyP'],['repair','Reparar','KeyR'],['crewSwap','Reemplazar tripulante (infantería)','KeyC'],['smoke','Granadas de humo','KeyX'],['ping','Marcar: enemigo / punto / atención','KeyQ'],['ext','Extintor (apagar incendio)','KeyZ']];
const DEF_BINDS=Object.fromEntries(ACTIONS.map(a=>[a[0],a[2]]));
let binds={...DEF_BINDS}, bindCapture=null, difficulty='normal';
const keyName=c=>!c?'—':c.startsWith('Key')?c.slice(3):c.startsWith('Digit')?c.slice(5):c.startsWith('Numpad')?'Num '+c.slice(6):
  ({ShiftLeft:'Shift izq.',ShiftRight:'Shift der.',ControlLeft:'Ctrl izq.',ControlRight:'Ctrl der.',AltLeft:'Alt',AltRight:'Alt Gr',Space:'Espacio',Tab:'Tab',CapsLock:'Bloq Mayús',
    Enter:'Enter',Backspace:'Retroceso',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Backquote:'º',Minus:'-',Equal:'=',Comma:',',Period:'.',Slash:'-',Semicolon:'Ñ',Quote:'´',BracketLeft:'`',BracketRight:'+'}[c]||c);
const down=a=>{ const c=binds[a]; return !!(keys[c]||(c==='ShiftLeft'&&keys.ShiftRight)||(c==='ControlLeft'&&keys.ControlRight)); };
function saveSettings(){ try{ localStorage.setItem('tw_settings',JSON.stringify({sens,binds,vol:volMaster,radio:radioOn,fs:fsAuto,gfx,dif:difficulty})); }catch(e){} }
let player=null, playerCrew=null, crews=[], camYaw=0, camPitch=.12, sens=1.2, scoped=false, mouseDown=false, rightDown=false, shake=0, vig=0, lastAim=null, camDist=14, playerDeadT=0, specIdx=0;
const keys={};
function aimPoint(){
  const o=camera.position.clone(), d=camera.getWorldDirection(new THREE.Vector3());
  ray.set(o,d); ray.far=600;
  const h=ray.intersectObjects(colliders.filter(c=>c.userData.tank!==player).concat(houseMeshes),false); ray.far=Infinity;
  let best=h.length?h[0].distance:600;
  for(let s=4;s<best;s+=1.5){const p=o.clone().addScaledVector(d,s); if(p.y<hAtY(p.x,p.z,p.y)){best=s;break;}}
  return o.addScaledVector(d,best);
}
function predictImpact(t){
  t.root.updateMatrixWorld(true);
  const p=t.muzzle.getWorldPosition(new THREE.Vector3()), v=t.barrel.getWorldDirection(new THREE.Vector3()).multiplyScalar(ammoOf(t).v);
  for(let i=0;i<140;i++){
    const h=.02; v.y-=G*h; p.addScaledVector(v,h);
    if(p.y<hAtY(p.x,p.z,p.y)) return p;
    for(const b of gridQuery(p.x,p.z,0)) if(b.containsPoint(p)&&obInside(b,p.x,p.z)) return p;
    for(const o of tanks) if(o!==t&&Math.abs(p.x-o.pos.x)<o.R*.7&&Math.abs(p.z-o.pos.z)<o.R*.7&&p.y<o.pos.y+o.topH) return p;
  }
  return p;
}
function chaseCam(t,dt,dir){
  const piv=t.pos.clone(); piv.y+=t.topH+.8;
  let want=Math.max(10,t.T.m.L*1.9); const back=dir.clone().negate();
  ray.set(piv,back); ray.far=want; const hh=ray.intersectObjects(houseMeshes,false); ray.far=Infinity;
  if(hh.length) want=Math.max(4,hh[0].distance-.8);
  camDist+=(want-camDist)*Math.min(1,dt*(want<camDist?20:4));
  const cp=piv.clone().addScaledVector(dir,-camDist); cp.y=Math.max(cp.y,hAtY(cp.x,cp.z,piv.y)+1);
  camera.position.copy(cp); camera.lookAt(piv.clone().addScaledVector(dir,10));
}
function updatePlayer(dt){
  const t=player;
  if(!t.dead){
    const th=(down('fwd')?1:0)-(down('back')?1:0), st=(down('left')?1:0)-(down('right')?1:0);
    drive(t,th,st,dt);
  }
  scoped=!t.dead&&down('scope');
  const dir=new THREE.Vector3(Math.sin(camYaw)*Math.cos(camPitch),Math.sin(camPitch),Math.cos(camYaw)*Math.cos(camPitch));
  if(scoped){
    t.root.updateMatrixWorld(true);
    const tp=t.turret.getWorldPosition(new THREE.Vector3()); tp.y+=t.T.m.th+.4;
    camera.position.copy(tp); camera.lookAt(tp.clone().add(dir));
    const mags=t.T.optic||[8], mag=mags[Math.min(t.magIdx||0,mags.length-1)], tf=2*Math.atan(Math.tan(32.5*Math.PI/180)/mag)*180/Math.PI;
    camera.fov+=(tf-camera.fov)*Math.min(1,dt*12);
  } else { chaseCam(t,dt,dir); camera.fov+=(65-camera.fov)*Math.min(1,dt*12); }
  if(shake>0){shake-=dt;camera.position.x+=rand(-1,1)*shake*.25;camera.position.y+=rand(-1,1)*shake*.25;}
  camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  t.root.visible=!scoped;
  t.mgHeat=Math.max(0,t.mgHeat-dt*(rightDown&&!t.mgLock?.05:.3)); if(t.mgLock&&t.mgHeat<.35) t.mgLock=false;
  if(!t.dead){
    lastAim=aimPoint();
    aimAt(t,lastAim,dt);
    if(mouseDown) fireGun(t);
    if((rightDown||down('mg'))&&now>t.mgNext){fireMG(t);t.mgNext=now+.085;}
    if(t.reloadT>0&&t.ammoManual==null){ t.ammoT=(t.ammoT||0)-dt; if(t.ammoT<=0){ t.ammoT=.2; let n=bestAmmo(t,aimInfo(t)); if(t.ammoCount&&t.ammoCount[n]<=0) n=t.ammoCount.findIndex(c=>c>0); if(n>=0&&n!==t.ammoIdx) t.ammoIdx=n; } }
    const showR=!realMode||hasFcs(t); $('rngR').style.display=showR?'':'none';
    if(showR) $('rngT').textContent=Math.round(lastAim.distanceTo(t.pos))+' m';
  }
  engineUpdate(t,dt); radioWatch(t);
  txt('spd',Math.round(Math.abs(t.speed)*3.6)+' km/h'); txt('rpmT',Math.round((700+(t._rpm||.18)*1900)/50)*50);
  { const mx=Math.max(1,t.T.maxF||10), r=Math.abs(t.speed)/mx;
    const g=t.speed<-.4?'R':Math.abs(t.speed)<.4?'N':String(Math.min(5,1+Math.floor(r*5)));
    txt('gearT',g); setCls('gearT','gear'+(g==='R'?' rev':g==='N'?' neu':'')); }
  const gunTxt=(t.mod.barrel??100)<=0?'Cañón destruido: repará':t.mod.breech<=0?`Dañado, ${Math.ceil(t.breechT)} s`:!manned(t,'gunner')?'Sin artillero':t.reloadT>0?t.reloadT.toFixed(1)+' s':'Listo';
  txt('rld',gunTxt); col('rld',gunTxt==='Listo'?'var(--ally)':(t.mod.breech<=0||(t.mod.barrel??100)<=0||!manned(t,'gunner'))?'var(--enemy)':'');
  if(mouseDown&&!canFire(t)&&mgMsgT<=0){ hitMsg((t.mod.barrel??100)<=0?'Cañón destruido: no podés disparar hasta repararlo':t.mod.breech<=0?'Cañón dañado: no podés disparar hasta repararlo':'Sin artillero: esperá el cambio de puesto','var(--enemy)'); mgMsgT=1.2; }
  txt('mgT',t.mgLock?'Recalentada':t.mgHeat>.05?Math.round(t.mgHeat*100)+'% calor':'Lista');
  col('mgT',t.mgLock?'var(--enemy)':t.mgHeat>.6?'var(--amber)':'');
  const sup=(cd,cost)=>cd>0?Math.ceil(cd)+' s':playerCrew.sp<cost?`${cost} pts`:'Lista';
  txt('artT',sup(playerCrew.artyCD,ARTY_COST)); col('artT',$('artT').textContent==='Lista'?'var(--ally)':'');
  txt('airT',sup(playerCrew.airCD,AIR_COST)); col('airT',$('airT').textContent==='Lista'?'var(--ally)':'');
  oobCheck(t,dt);
  if(t.dead&&state==='play'){ playerDeadT-=dt; if(playerDeadT<=0) openDeploy(); }
}
let aerial=true; const aer={yaw:.7,zoom:1,fx:0,fz:0,init:false};
function aerialCam(dt){
  const live=tanks.filter(t=>!t.dead); let cx=0,cz=0;
  if(live.length){ live.forEach(t=>{cx+=t.pos.x;cz+=t.pos.z;}); cx/=live.length; cz/=live.length; }
  if(!aer.init){aer.fx=cx;aer.fz=cz;aer.init=true;}
  const k=1-Math.exp(-dt*.6); aer.fx+=(cx-aer.fx)*k; aer.fz+=(cz-aer.fz)*k;
  if(down('left')||keys.ArrowLeft) aer.yaw+=dt*.8; else if(down('right')||keys.ArrowRight) aer.yaw-=dt*.8; else aer.yaw+=dt*.04;
  if(down('fwd')||keys.ArrowUp) aer.zoom=clamp(aer.zoom*(1-dt*.8),.25,1.4); if(down('back')||keys.ArrowDown) aer.zoom=clamp(aer.zoom*(1+dt*.8),.25,1.4);
  let spread=60; live.forEach(t=>{spread=Math.max(spread,Math.hypot(t.pos.x-cx,t.pos.z-cz));});
  aer.sp=(aer.sp||spread)+(spread-(aer.sp||spread))*k;
  const D=clamp(aer.sp*2.3,110,Math.max(W.bx,W.bz)*2)*aer.zoom, el=.9, gy=heightAt(aer.fx,aer.fz);
  camera.position.set(aer.fx+Math.sin(aer.yaw)*Math.cos(el)*D, gy+Math.sin(el)*D, aer.fz+Math.cos(aer.yaw)*Math.cos(el)*D);
  camera.lookAt(aer.fx,gy,aer.fz); camera.fov=55; camera.updateProjectionMatrix(); boardMode=true;
  txt('specT','Vista aérea. Rueda o W/S: zoom. A/D: girar. Clic en un tanque: seguirlo. Espacio: volver al aire');
  return true;
}
let boardMode=false;
// Final por nuke, estilo War Thunder: se corta el control, la cámara muestra el hongo y aparece VICTORIA/DERROTA.
function nukeEnd(winner){
  state='end'; const N=winner===0?allyLabel():NATIONS[foeNation].label;
  if(document.pointerLockElement) document.exitPointerLock(); mouseDown=rightDown=scoped=false; if(engGain) engGain.gain.value=0;
  document.body.classList.remove('deploy','brief'); document.body.classList.add('spec'); $('specT').innerHTML='';
  const p=nuke.p, a=Math.atan2(camera.position.x-p.x,camera.position.z-p.z);
  nukeView={p:p.clone(),a:isFinite(a)?a:0,t:0};
  banner(spectating?`Gana ${N}`:winner===0?'VICTORIA':'DERROTA',spectating?'Ataque nuclear':winner===0?'Ataque nuclear: el enemigo fue arrasado':'El enemigo usó un arma nuclear',99);
  let btn=$('nukeSum'); if(!btn){ btn=document.createElement('button'); btn.id='nukeSum'; btn.className='go'; document.body.appendChild(btn); }
  btn.textContent='Ver resumen'; btn.style.display='block'; btn.onclick=()=>{ btn.style.display='none'; summary(winner); };
}
function nukeCam(dt){
  const V=nukeView; V.t+=dt; V.a+=dt*.035; const C=nuke&&nuke.cloud, H=C?40+300*(1-Math.exp(-C.age/4)):150;
  const r=430, x=V.p.x+Math.sin(V.a)*r, z=V.p.z+Math.cos(V.a)*r;
  camera.position.set(x,Math.max(heightAt(x,z)+25,V.p.y+45),z); camera.lookAt(V.p.x,V.p.y+H*.55,V.p.z);
  camera.fov=65; camera.updateProjectionMatrix();
}
function spectatorCam(dt){
  const list=tanks.filter(t=>!t.dead).sort((a,b)=>a.team-b.team);
  if(aerial||!list.length) return aerialCam(dt);
  specIdx=((specIdx%list.length)+list.length)%list.length;
  const t=list[specIdx];
  camYaw=stepAng(camYaw,t.heading+t.turretYaw,dt*1.5);
  chaseCam(t,dt,new THREE.Vector3(Math.sin(camYaw)*Math.cos(.18),Math.sin(.18),Math.cos(camYaw)*Math.cos(.18)));
  camera.fov=65; camera.updateProjectionMatrix();
  $('specT').innerHTML=`<span style="color:${t.team===0?'var(--ally)':'var(--enemy)'}">${t.name}</span>, ${t.T.label} (${NATIONS[t.crew?t.crew.nation:t.T.nation].label}). Clic o flechas para cambiar, espacio para vista aérea`;
  return t;
}
function orbitCam(dt){
  menuA+=dt*.05; const r=Math.max(W.bx,W.bz)*.75;
  camera.position.set(Math.sin(menuA)*r,85,Math.cos(menuA)*r); camera.lookAt(0,0,0);
  camera.fov=65; camera.updateProjectionMatrix();
}

/* ---------- HUD ---------- */
const hitDirs=[];
function hitFrom(x,z,str){ if(!player) return; const a=Math.atan2(x-player.pos.x,z-player.pos.z);
  const near=hitDirs.find(h=>Math.abs(wrap(h.a-a))<.2); if(near){near.t=1.8;near.s=Math.max(near.s,str);} else hitDirs.push({a,t:1.8,s:str}); }
function drawHitDirs(dt){
  const cx=innerWidth/2, cy=innerHeight/2, R=Math.min(innerWidth,innerHeight)*.17;
  for(let i=hitDirs.length-1;i>=0;i--){const h=hitDirs[i]; h.t-=dt; if(h.t<=0){hitDirs.splice(i,1);continue;}
    const rel=wrap(h.a-camYaw), ang=-Math.PI/2-rel, al=Math.min(1,h.t)*(.5+.5*h.s);
    oc.strokeStyle=`rgba(230,40,20,${al})`; oc.lineWidth=8+6*h.s; oc.lineCap='round';
    oc.beginPath(); oc.arc(cx,cy,R,ang-.28,ang+.28); oc.stroke();
    oc.fillStyle=`rgba(230,40,20,${al})`; oc.beginPath();
    oc.moveTo(cx+Math.cos(ang)*(R+26),cy+Math.sin(ang)*(R+26)); oc.lineTo(cx+Math.cos(ang-.1)*(R+10),cy+Math.sin(ang-.1)*(R+10)); oc.lineTo(cx+Math.cos(ang+.1)*(R+10),cy+Math.sin(ang+.1)*(R+10)); oc.fill();}
  oc.lineCap='butt';
}
let hitT=0, bannerT=0;
function hitMsg(msg,color){const h=$('hitmsg');h.textContent=msg;h.style.color=color;h.style.opacity=1;hitT=1.5;
  h.style.animation='none'; void h.offsetHeight; h.style.animation='hitPop .45s ease-out';}
const SHELL_COL={ke:'#e6dcb4',heat:'#5aa6e6',hesh:'#e08a3a',he:'#e0603a'};
const shellIcon=k=>`<svg viewBox="0 0 26 40"><path d="M9 38V15l4-12 4 12v23z" fill="#c9a24a"/><path d="M9 15l4-12 4 12z" fill="${SHELL_COL[k]||'#ccc'}"/><rect x="8" y="34" width="10" height="4" fill="#8a6d2c"/></svg>`;
function updateAmmoBar(t){
  const box=$('ammoSlots'), L=t.T.ammo, c=playerCrew;
  const slots=[...L.map((A,i)=>({id:'a'+i,key:binds['ammo'+(i+1)],ic:shellIcon(A.kind),title:`${A.n} (${KIND_ES[A.kind]})`})),
    ...(L.length>1?[{id:'auto',key:binds.ammoAuto,ic:'<span style="font-size:13px">AUTO</span>',title:'Munición automática'}]:[]),{gap:1},
    {id:'arty',key:binds.arty,ic:'✸',title:'Artillería'},...(RULE().sup.air?[{id:'air',key:binds.air,ic:'✈',title:'Ataque aéreo'}]:[]),...(RULE().sup.nuke?[{id:'nuke',key:binds.nuke,ic:'☢',title:'Nuke'}]:[]),
    {id:'rep',key:binds.repair,ic:'🔧',title:'Reparar'},{id:'crew',key:binds.crewSwap,ic:'👤',title:'Reemplazar tripulante con infantería'},...(t.noSmk?[]:[{id:'smk',key:binds.smoke,ic:'☁',title:'Granadas de humo (nivel 2)'}]),{id:'ext',key:binds.ext,ic:'🧯',title:'Extintor'},
    ...(t.T.thermal?[{id:'th',key:binds.thermal,ic:'◐',title:'Visión térmica'}]:[]),...(t.troops?[{id:'tr',key:binds.troops,ic:'⇩',title:'Bajar infantería'}]:[])];
  const sig=t.T.label+'|'+(W.era||5)+'|'+JSON.stringify(binds);
  if(box._sig!==sig){ box._sig=sig; box.innerHTML=slots.map(S=>S.gap?'<span class="gap"></span>':`<div class="as" data-id="${S.id}" title="${S.title}"><div class="k">${keyName(S.key)}</div><div class="ic">${S.ic}<span class="n"></span><span class="cd"></span></div></div>`).join('');
    box._els=Object.fromEntries([...box.querySelectorAll('.as')].map(el=>[el.dataset.id,{el,n:el.querySelector('.n'),cd:el.querySelector('.cd')}])); }
  const E=box._els, set=(id,cls,n,cd)=>{ const o=E[id]; if(!o) return; const C='as'+cls; if(o.el._c!==C){o.el._c=C;o.el.className=C;} n=String(n??''); if(o.n.textContent!==n) o.n.textContent=n; const h=Math.round(clamp(cd||0,0,1)*100)+'%'; if(o.cd._h!==h){o.cd._h=h;o.cd.style.height=h;} };
  const full=t.reloadMax*reloadFactor(t);
  L.forEach((A,i)=>{ const n=t.ammoCount?t.ammoCount[i]:'∞', sel=i===t.ammoIdx; set('a'+i,(sel?' sel':'')+(n===0?' empty':''),n,sel&&t.reloadT>0?t.reloadT/full:0); });
  set('auto',t.ammoManual==null?' sel':'','',0);
  set('arty',c.artyCD>0||c.sp<ARTY_COST?' off':'',c.artyCD>0?Math.ceil(c.artyCD):c.sp<ARTY_COST?ARTY_COST:'',c.artyCD/ARTY_CD);
  set('air',c.airCD>0||c.sp<AIR_COST?' off':'',c.airCD>0?Math.ceil(c.airCD):c.sp<AIR_COST?AIR_COST:'',c.airCD/AIR_CD);
  set('nuke',nuke||c.sp<NUKE_COST?' off':'',c.sp<NUKE_COST?NUKE_COST:'',0);
  set('rep',t.repairT>0?' sel':needsRepair(t)?'':' off',t.repairT>0?Math.ceil(t.repairT):'',t.repairT>0?t.repairT/t.repairMax:0);
  const lost=t.crewM.length-crewAlive(t); set('crew',lost&&!t.boarding?'':' off',lost||'',0);
  set('smk',t.smoke>0?'':' off',t.lv>=2?t.smoke:'🔒',0);
  set('ext',t.fireT>0&&t.ext>0?' sel':t.ext>0?'':' off',t.ext,0);
  set('th',t.thermal?' sel':'','',0);
  // Barras de arma (cañón: proyectiles del tipo cargado; ametralladora: cintas de repuesto + cinta actual)
  const gn=t.ammoCount?t.ammoCount[t.ammoIdx]:'∞'; txt('gunN',gn); { const B=$('gunBar'), w=(t.reloadT>0?Math.round((1-t.reloadT/full)*100):100)+'%'; if(B._w!==w){B._w=w;B.style.width=w;} }
  txt('mgN',t.mgBelts!=null?t.mgBelts:'∞'); { const B=$('mgBar'), w=(t.mgBelt!=null?(t.mgRel>0?0:Math.round(t.mgBelt/250*100)):100)+'%'; if(B._w!==w){B._w=w;B.style.width=w;} }
  txt('ammoTot',t.ammoCount?t.ammoCount.reduce((a,b)=>a+b,0):'∞');
}
function updateXray(t){
  { const g=$('wtTur'), d=(-(t.turretYaw||0)*180/Math.PI).toFixed(1); if(g._d!==d){g._d=d; g.setAttribute('transform',`rotate(${d})`);} }
  setCls('wtStab','wt-lbl'+(t.T.stab?'':' off')); setCls('wtTerm','wt-lbl'+(t.T.thermal?(t.thermal?'':''):' off'));
  const lv=(v,full,dead)=>dead?'xr-dead':v<full?'xr-dmg':'xr-ok';
  setCls('xr-eng',t.fireT>0?'xr-fire':lv(t.mod.engine,100,t.mod.engine<=0));
  setCls('xr-gun',lv(Math.min(t.mod.breech,t.mod.barrel??100),100,t.mod.breech<=0||(t.mod.barrel??100)<=0));
  const th=t.trkHP||[100,100], tc=i=>t.trackT>0&&(th[i]>=th[1-i])?'xr-dead':th[i]<100?'xr-dmg':'xr-ok'; setCls('xr-trkL',t.trackT>0&&th[0]===th[1]?'xr-dead':tc(0)); setCls('xr-trkR',t.trackT>0&&th[0]===th[1]?'xr-dead':tc(1));
  for(const sn of ['driver','codriver','gunner','commander','loader']){
    const m=t.crewM.find(c=>c.seat===sn); setCls('xr-'+sn,'crew '+(!m?'xr-off':!m.alive?'xr-dead':m.hp<100?'xr-dmg':'xr-ok')); }
  updateAmmoBar(t);
}
function feed(txt,color,fromNet){if(net.guest&&!fromNet) return; if(net.host) netAll({t:'fd',txt,color});const d=document.createElement('div');d.textContent=txt;d.style.color=color;$('feed').prepend(d);
  setTimeout(()=>d.remove(),6000); while($('feed').children.length>6)$('feed').lastChild.remove();}
function banner(t,sub,dur=3){$('banner').innerHTML=t+(sub?`<small>${sub}</small>`:'');$('banner').style.opacity=1;bannerT=dur;}
function updateHud(){
  const a=tanks.filter(t=>t.team===0&&!t.dead).length, e=tanks.filter(t=>t.team===1&&!t.dead).length;
  txt('counts',`${a} ${a===1?'aliado':'aliados'} y ${e} ${e===1?'enemigo':'enemigos'} en el campo. ${allyLabel()} contra ${NATIONS[foeNation].label}`);
  if(playerCrew) txt('spT',playerCrew.sp);
  if(player){const hp=Math.max(0,Math.round(player.hp/player.T.hp*100));txt('hpT',`${crewAlive(player)}/${player.crewM.length}`);{const B=$('hpB'),w=hp+'%'; if(B.style.width!==w) B.style.width=w;}
    const st=[]; if(player.mod.engine<=0)st.push(`motor ${Math.ceil(player.engT)} s`); else if(player.mod.engine<100) st.push(`motor ${Math.round(player.mod.engine)} %`);
    if(player.mod.trans<=0) st.push('transmisión rota (máx. 15 km/h)'); else if(player.mod.trans<100) st.push(`transmisión ${Math.round(player.mod.trans)} %`); if(player.trackT>0)st.push(`oruga ${Math.ceil(player.trackT)} s`);
    if((player.mod.barrel??100)<=0) st.push('cañón destruido'); else if((player.mod.barrel??100)<60) st.push(`cañón dañado ${Math.round(player.mod.barrel)} %`); if(player.mod.breech<=0)st.push(`cierre ${Math.ceil(player.breechT)} s`);
    if(player.trkHP&&!(player.trackT>0)&&Math.min(...player.trkHP)<100) st.push(`oruga ${Math.round(Math.min(...player.trkHP))} %`); if(player.fireT>0)st.push('¡incendio!');
    for(const sn of ['driver','gunner','loader']) if(!player.T.autoL||sn!=='loader') if(player.crewM.some(m=>m.seat===sn)&&!manned(player,sn)) st.push('sin '+SEAT_ES[sn]);
    txt('modT',player.repairT>0?`Reparando… ${Math.ceil(player.repairT)} s${player.engN?` · ${player.engN} ingeniero${player.engN>1?'s':''} ayudando`:''}`:player.crT>0?`Sumando tripulante… ${Math.ceil(10-player.crT)} s`:player.resupply?'Reabasteciendo munición…':st.length?st.join(', '):'Todo en orden');
    col('modT',player.repairT>0||player.resupply?'var(--amber)':st.length?'var(--enemy)':'');
    { const mg=player.T.optic||[8]; txt('optT',mg.map((v,i)=>i===(player.magIdx||0)?`<${v}×>`:`${v}×`).join(' ').replace(/</g,'[').replace(/>/g,']')); }
    const A=ammoOf(player); txt('ammoT',`${A.n} (${KIND_ES[A.kind]})`+(player.reloadT>0?' · cargando':'')+(player.thermal?' · térmica':''));
    txt('nukeT',nuke?'En curso':playerCrew.sp>=NUKE_COST?'Lista':`${NUKE_COST} pts`); col('nukeT',playerCrew.sp>=NUKE_COST&&!nuke?'var(--ally)':'');
    {const B=$('hpB'),c=hp<35?'var(--enemy)':hp<65?'var(--amber)':'var(--ally)'; if(B._bg!==c){B._bg=c; B.style.background=c;}}
    updateXray(player);
    txt('typeT',`${player.T.label}, ${player.T.cls}`+(player.immuneT>0?` · protegido ${Math.ceil(player.immuneT)} s`:''));}
}
const tmpV=new THREE.Vector3();
function project(p){tmpV.copy(p).applyMatrix4(camera.matrixWorldInverse);if(tmpV.z>-1)return null;
  tmpV.copy(p).project(camera);return {x:(tmpV.x+1)/2*innerWidth,y:(1-tmpV.y)/2*innerHeight};}
function drawOverlay(){
  oc.clearRect(0,0,innerWidth,innerHeight);
  if(!['play','end','spectate'].includes(state)) return;
  oc.font='600 14px "Saira Condensed",sans-serif'; oc.textAlign='center';
  const spec=state==='spectate'||!playerCrew;
  for(const t of tanks){
    if(t===player||t.dead) continue;
    if(t.team===1&&!t.visP&&!spec) continue;
    const s=project(t.pos.clone().setY(t.pos.y+t.topH+1.2)); if(!s) continue;
    oc.fillStyle=t.team===0?'#8fd16a':'#ff5a3c';
    oc.beginPath(); oc.moveTo(s.x-6,s.y-8); oc.lineTo(s.x+6,s.y-8); oc.lineTo(s.x,s.y); oc.fill();
    const d=player?Math.round(t.pos.distanceTo(player.pos)):0;
    oc.fillText(spec?`${t.name} (${t.T.label})`:t.team===1?`${t.T.label} ${d} m`:`${t.name} (${t.T.label})`,s.x,s.y-12);
  }
  oc.font='700 20px "Saira Condensed",sans-serif';
  for(const Z of zones){const zs=project(new THREE.Vector3(Z.x,heightAt(Z.x,Z.z)+11,Z.z));
    if(zs){oc.fillStyle=Z.owner===1?'#8fd16a':Z.owner===-1?'#ff5a3c':'#efe7d2';oc.fillText(Z.id,zs.x,zs.y);}}

  for(const A of a10s){ if(A.t!==player&&!(A.t&&A.t.isPlayer)) continue; const s=project(A.g.position), dist=Math.round(A.g.position.distanceTo(camera.position));
    if(!s||s.x<20||s.y<20||s.x>innerWidth-20||s.y>innerHeight-20){ // fuera de la pantalla: flecha en el borde que apunta al avión
      const rel=wrap(Math.atan2(A.g.position.x-camera.position.x,A.g.position.z-camera.position.z)-camYaw), ang=-Math.PI/2-rel, R=Math.min(innerWidth,innerHeight)*.3, cx=innerWidth/2, cy=innerHeight/2;
      const x=cx+Math.cos(ang)*R, y=cy+Math.sin(ang)*R, bl=.55+.45*Math.sin(now*10);
      oc.fillStyle=`rgba(255,74,50,${bl})`; oc.beginPath(); oc.moveTo(x+Math.cos(ang)*22,y+Math.sin(ang)*22); oc.lineTo(x+Math.cos(ang+2.4)*14,y+Math.sin(ang+2.4)*14); oc.lineTo(x+Math.cos(ang-2.4)*14,y+Math.sin(ang-2.4)*14); oc.fill();
      oc.font='700 16px "Saira Condensed",sans-serif'; oc.fillText(`A-10 ${dist} m`,x-Math.cos(ang)*22,y-Math.sin(ang)*22+5); continue; }
    oc.strokeStyle='#ff4a32'; oc.lineWidth=2; oc.beginPath(); oc.moveTo(s.x,s.y-11); oc.lineTo(s.x+11,s.y); oc.lineTo(s.x,s.y+11); oc.lineTo(s.x-11,s.y); oc.closePath(); oc.stroke();
    oc.fillStyle='#ff4a32'; oc.font='700 15px "Saira Condensed",sans-serif'; oc.fillText(`A-10 ${Math.round(A.g.position.distanceTo(camera.position))} m`,s.x,s.y-16); }
  drawPings();
  if(state==='play'&&player&&!player.dead) drawHitDirs(1/60);
  if(state!=='play'||!player||player.dead) return;
  const cx=innerWidth/2, cy=innerHeight/2;
  if(scoped){ oc.fillStyle='rgba(255,255,255,.9)'; oc.beginPath(); oc.arc(cx,cy,2.2,0,7); oc.fill(); }
  else { // Mira central estilo War Thunder: anillo fino con borde oscuro y punto central
    oc.lineWidth=3.5; oc.strokeStyle='rgba(0,0,0,.45)'; oc.beginPath(); oc.arc(cx,cy,9,0,7); oc.stroke();
    oc.lineWidth=1.5; oc.strokeStyle='rgba(255,255,255,.92)'; oc.beginPath(); oc.arc(cx,cy,9,0,7); oc.stroke();
    oc.fillStyle='rgba(0,0,0,.5)'; oc.beginPath(); oc.arc(cx,cy,2.4,0,7); oc.fill();
    oc.fillStyle='rgba(255,255,255,.95)'; oc.beginPath(); oc.arc(cx,cy,1.4,0,7); oc.fill(); }
  if(scoped){oc.strokeStyle='rgba(20,20,20,.9)';oc.lineWidth=1.5;oc.beginPath();
    oc.moveTo(cx-200,cy);oc.lineTo(cx-14,cy);oc.moveTo(cx+14,cy);oc.lineTo(cx+200,cy);oc.moveTo(cx,cy+14);oc.lineTo(cx,cy+160);oc.stroke();}
  const manual=realMode&&!hasFcs(player);
  if(scoped&&manual){ // escala de alzas: marcas para 100 a 600 m
    const v=ammoOf(player).v, z0=ballisticPitch(200,0,v), ppr=innerHeight/(2*Math.tan(camera.fov*Math.PI/360));
    oc.strokeStyle='rgba(20,20,20,.95)'; oc.fillStyle='rgba(20,20,20,.95)'; oc.lineWidth=1.5; oc.font='600 13px "Saira Condensed",sans-serif'; oc.textAlign='left';
    for(let d=100;d<=600;d+=100){ const y=cy+Math.tan(ballisticPitch(d,0,v)-z0)*ppr, w=d%200===0?16:9;
      oc.beginPath(); oc.moveTo(cx-w,y); oc.lineTo(cx+w,y); oc.stroke(); if(d%200===0) oc.fillText(String(d/100),cx+w+4,y+4); }
    oc.textAlign='center';
  }
  if(manual&&player.reloadT>0){ oc.strokeStyle='#ffc65c';oc.lineWidth=3;oc.beginPath();oc.arc(cx,cy,20,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-player.reloadT/(player.reloadMax*reloadFactor(player))));oc.stroke(); }
  const ip=manual?null:project(predictImpact(player));
  if(ip){
    const ready=player.reloadT<=0, onTarget=Math.hypot(ip.x-cx,ip.y-cy)<10;
    oc.lineWidth=2; oc.strokeStyle=ready?(onTarget?'rgba(143,209,106,1)':'rgba(239,231,210,.85)'):'rgba(239,231,210,.45)';
    oc.beginPath(); oc.arc(ip.x,ip.y,12,0,7); oc.stroke();
    oc.beginPath(); oc.moveTo(ip.x-18,ip.y); oc.lineTo(ip.x-12,ip.y); oc.moveTo(ip.x+12,ip.y); oc.lineTo(ip.x+18,ip.y); oc.stroke();
    if(!ready){oc.strokeStyle='#ffc65c';oc.lineWidth=3;oc.beginPath();
      oc.arc(ip.x,ip.y,20,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-player.reloadT/(player.reloadMax*reloadFactor(player))));oc.stroke();}
  }
}
const mm=$('mm'), mc=mm.getContext('2d');
function drawMinimap(){
  const S=400, k=S/(Math.max(W.bx,W.bz)*2+20); mc.clearRect(0,0,S,S);
  if(mmBg) mc.drawImage(mmBg,0,0);
  const tx=x=>S/2-x*k, tz=z=>S/2-z*k;
  if(mmDirty){mmDirty=false;buildMinimapBg();mc.drawImage(mmBg,0,0);}
  mc.font='700 22px "Saira Condensed",sans-serif'; mc.textAlign='center'; mc.textBaseline='middle';
  for(const Z of zones){const c=Z.owner===1?'#8fd16a':Z.owner===-1?'#ff5a3c':'#ffffff'; mc.strokeStyle=c; mc.lineWidth=3;
    mc.beginPath(); mc.arc(tx(Z.x),tz(Z.z),Z.r*k,0,7); mc.stroke(); mc.fillStyle=c; mc.fillText(Z.id,tx(Z.x),tz(Z.z));}
  for(const s of W.sp[0]){mc.fillStyle='rgba(143,209,106,.85)';mc.fillRect(tx(s.x)-7,tz(s.z)-7,14,14);}
  if(!playerCrew) for(const s of W.sp[1]){mc.fillStyle='rgba(255,90,60,.85)';mc.fillRect(tx(s.x)-7,tz(s.z)-7,14,14);}
  for(const t of tanks){
    if(t.team===1&&!t.dead&&t.spottedT<=0) continue;
    mc.save(); mc.translate(tx(t.pos.x),tz(t.pos.z)); mc.rotate(-t.heading+Math.PI);
    mc.fillStyle=t.dead?'#444':t.isPlayer?'#fff':t.team===0?'#8fd16a':'#ff5a3c';
    mc.strokeStyle='#000'; mc.lineWidth=1.5;
    mc.beginPath(); mc.moveTo(0,-10); mc.lineTo(7,8); mc.lineTo(-7,8); mc.closePath(); mc.fill(); mc.stroke(); mc.restore();
  }
  for(const P of infantry){ if(P.dead) continue; if(P.team===1&&playerCrew&&!tanks.some(t=>t.team===0&&!t.dead&&t.pos.distanceTo(P.pos)<120)) continue;
    mc.fillStyle=isCiv(P)?'#e8e2cf':P.team===0?'#8fd16a':'#ff5a3c'; mc.beginPath(); mc.arc(tx(P.pos.x),tz(P.pos.z),isCiv(P)?2.5:3.5,0,7); mc.fill(); }
  if(player&&!player.dead&&state==='play'){mc.strokeStyle='rgba(255,255,255,.6)';mc.lineWidth=2;mc.beginPath();
    mc.moveTo(tx(player.pos.x),tz(player.pos.z));mc.lineTo(tx(player.pos.x+Math.sin(camYaw)*60),tz(player.pos.z+Math.cos(camYaw)*60));mc.stroke();}
}

