/* ---------- Objetivos de las misiones de campaña: cada una se gana como se ganó (o se intentó ganar) de verdad ----------
   Tipos: take = tomar puntos y sostenerlos; reach = llegar con tu tanque a un lugar; destroy = destruir blancos (cañones o tanques);
   hold = defender puntos que ya son tuyos durante un tiempo; escort = que la infantería llegue viva; raid = entrar, hacer daño y volver.
   En las misiones con objetivo no hay sangrado de tickets por puntos: se pierde si se acaba el tiempo, si caen tus tickets o si falla
   el objetivo. objTick() corre una vez por segundo desde updateZones. */
const MISSION_OBJ={
  flers:{obj:{type:'take',zones:['B'],hold:60,time:900},
    goal:'Tomá las ruinas de Flers y sostenelas un minuto. Ese día un Mark I entró por la calle principal de Flers con la infantería detrás: fue la noticia del día en Londres.'},
  berry:{obj:{type:'reach',zone:'B',time:720},
    goal:'Llegá con tu Schneider hasta Juvincourt, la tercera línea alemana. Ese día casi ningún tanque lo logró: la artillería los vio venir desde las alturas.'},
  cambrai:{obj:{type:'destroy',what:'guns',time:900},
    goal:'Destruí todas las baterías alemanas de la loma de Flesquières. En 1917 esos cañones frenaron a decenas de Mark IV: buscalos antes de que te encuentren.'},
  villers:{obj:{type:'destroy',keys:['a7v'],time:900},
    goal:'Destruí a los A7V. Es el primer duelo de tanques de la historia: el Mark IV macho del teniente Mitchell contra el "Nixe" y sus compañeros.'},
  villersde:{obj:{type:'hold',zones:['B'],time:480},
    goal:'Villers-Bretonneux ya es tuyo: sostené el pueblo 8 minutos contra el contraataque de los Mark IV y los Whippet. Si lo pierden, la misión fracasa.'},
  stmihiel:{obj:{type:'escort',zone:'B',n:9,need:5,time:900},
    goal:'Acompañá a la infantería hasta Essey: tienen que llegar al menos 5 soldados vivos. Los FT iban delante abriendo paso entre el alambre y las ametralladoras.'},
  sesena:{obj:{type:'raid',zone:'B',kills:3,time:900},
    goal:'Hacé lo que hizo Arman: entrá a Seseña, destruí 3 enemigos y volvé a tu base con el tanque entero. Sin infantería que te cubra, no te quedes.'},
  jarama:{obj:{type:'take',zones:['B'],hold:90,time:1080},
    goal:'Tomá el cerro del Pingarrón y sostenelo un minuto y medio. Quien tiene el cerro, ve toda la carretera de Valencia.'},
  jaramade:{obj:{type:'hold',zones:['B'],time:540},
    goal:'El Pingarrón es tuyo: sostenelo 9 minutos contra los T-26 y BT-5. Si los republicanos lo recuperan, la misión fracasa.'},
  ebro:{obj:{type:'destroy',what:'guns',time:900},
    goal:'Destruí los cañones antitanque de la azucarera y del pueblo. En 1937 el ataque fracasó contra ellos: cruzá las acequias por los pasos y no te encajes.'}
};
for(const ch of CAMPAIGN) for(const m of ch.missions) if(MISSION_OBJ[m.id]) Object.assign(m,MISSION_OBJ[m.id]);
const OBJ_NAME={take:'Tomar y sostener',reach:'Llegar',destroy:'Destruir',hold:'Defender',escort:'Escolta',raid:'Incursión'};
let curObj=null;
const zoneById=id=>zones.find(Z=>Z.id===id);
const fmtT=s=>`${Math.floor(Math.max(0,s)/60)}:${String(Math.max(0,Math.floor(s))%60).padStart(2,'0')}`;
function objUI(txt){ let el=$('objT'); if(!el){ el=document.createElement('div'); el.id='objT'; el.className='hud'; document.body.appendChild(el); } el.innerHTML=txt; el.style.display=txt?'block':'none'; }
// Se llama al arrancar la batalla de una misión (startBattle, con special.obj)
function objStart(o){
  curObj={...o,t0:now,ok:false,done:false,holdT:0,phase:0,kills0:playerCrew?playerCrew.kills:0,deaths0:playerCrew?playerCrew.deaths:0};
  if(o.type==='hold') for(const id of o.zones){ const Z=zoneById(id); if(Z){ Z.cap=100; Z.owner=1; Z.mat.color.set(0x8fd16a); } }
  if(o.type==='escort'){ const Z=zoneById(o.zone), pts=(W.infSp&&W.infSp[0])||W.sp[0], b=pts[(pts.length/2)|0]; curObj.esc=[];
    for(let i=0;i<o.n;i++){ const P=makePerson(i%4===3?'hmg':'rifle',0,b.x+rand(-12,12),b.z+rand(-8,8)); P.escort=true; P.goal={x:Z.x+rand(-6,6),z:Z.z+rand(-6,6)}; curObj.esc.push(P); } }
  objTick(true);
}
function objEnd(win,why){ if(!curObj||curObj.done) return; curObj.done=true; objUI(''); banner(win?'Objetivo cumplido':'Objetivo fallido',why,4); finish(win?0:1); }
function objTick(first){
  const o=curObj; if(!o||o.done||!['play','deploy','spectate','paused'].includes(state)) return;
  const left=o.time-(now-o.t0), tTxt=`<span class="ot">${fmtT(left)}</span>`, head=`<b>${OBJ_NAME[o.type]}</b> `;
  if(o.type==='take'){ const own=o.zones.every(id=>{ const Z=zoneById(id); return Z&&Z.owner===1; }); o.holdT=own?o.holdT+1:0;
    objUI(head+`${o.zones.map(id=>`${zoneById(id).label} (punto ${id})`).join(', ')}: ${own?`sostené ${fmtT(o.hold-o.holdT)}`:'capturalo'} · ${tTxt}`);
    if(o.holdT>=o.hold) return objEnd(true,'Lo tomaron y lo sostuvieron'); }
  else if(o.type==='reach'){ const Z=zoneById(o.zone), p=player&&!player.dead?player.pos:null, inZ=p&&Math.hypot(p.x-Z.x,p.z-Z.z)<Z.r+4;
    objUI(head+`llevá tu tanque hasta ${Z.label} (${p?Math.round(Math.hypot(p.x-Z.x,p.z-Z.z))+' m':'desplegá'}) · ${tTxt}`); if(inZ) return objEnd(true,`Llegaste a ${Z.label}`); }
  else if(o.type==='destroy'){ // se cuentan los blancos destruidos por número de tanque (los restos desaparecen a los 40 s)
    if(!o.need){ o.need=o.what==='guns'?crews.filter(c=>c.team===1&&c.gun).length:crews.filter(c=>c.team===1&&c.lineup.some(k=>o.keys.includes(k))).length; o.dead=new Set(); }
    for(const t of tanks) if(t.dead&&t.team===1&&(o.what==='guns'?t.crew&&t.crew.gun:o.keys.includes(t.key))) o.dead.add(t.id);
    objUI(head+`${o.what==='guns'?'Baterías':VEH[o.keys[0]].label}: ${Math.min(o.dead.size,o.need)} de ${o.need} · ${tTxt}`);
    if(o.need&&o.dead.size>=o.need) return objEnd(true,'Destruiste todos los blancos'); }
  else if(o.type==='hold'){ const lost=o.zones.find(id=>{ const Z=zoneById(id); return Z&&Z.owner===-1; });
    objUI(head+`${o.zones.map(id=>`${zoneById(id).label} (punto ${id})`).join(', ')}: aguantá · ${tTxt}`); if(lost) return objEnd(false,`Perdiste ${zoneById(lost).label}`);
    if(left<=0) return objEnd(true,'Aguantaron hasta el final'); }
  else if(o.type==='escort'){ const Z=zoneById(o.zone), live=o.esc.filter(P=>!P.dead), inZ=live.filter(P=>Math.hypot(P.pos.x-Z.x,P.pos.z-Z.z)<Z.r+3).length;
    for(const P of live) if(!P.goal&&Math.hypot(P.pos.x-Z.x,P.pos.z-Z.z)>Z.r) P.goal={x:Z.x+rand(-6,6),z:Z.z+rand(-6,6)};
    objUI(head+`soldados vivos ${live.length} · en ${Z.label} ${inZ} de ${o.need} · ${tTxt}`);
    if(inZ>=o.need) return objEnd(true,`La infantería llegó a ${Z.label}`); if(live.length<o.need) return objEnd(false,'Murieron demasiados soldados'); }
  else if(o.type==='raid'){ const Z=zoneById(o.zone), k=(playerCrew?playerCrew.kills:0)-o.kills0, p=player&&!player.dead?player.pos:null;
    if(playerCrew&&playerCrew.deaths>o.deaths0) return objEnd(false,'Perdiste el tanque');
    if(o.phase===0&&p&&Math.hypot(p.x-Z.x,p.z-Z.z)<Z.r+10) o.inside=1;
    if(o.phase===0&&o.inside&&k>=o.kills){ o.phase=1; banner('¡Volvé!','Regresá a tu base con el tanque entero',3); }
    const b=W.sp[0][0];
    objUI(head+(o.phase===0?`entrá a ${Z.label}${o.inside?' ✓':''} y destruí ${o.kills} enemigos (${Math.min(k,o.kills)})`:`volvé a tu base (${p?Math.round(Math.hypot(p.x-b.x,p.z-b.z))+' m':''})`)+` · ${tTxt}`);
    if(o.phase===1&&p&&W.sp[0].some(s=>Math.hypot(p.x-s.x,p.z-s.z)<45)) return objEnd(true,'Volviste con el tanque entero'); }
  if(left<=0&&!first) objEnd(false,'Se acabó el tiempo');
}
