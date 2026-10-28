/* ---------- Campaña histórica: misiones en orden cronológico ----------
   Cada capítulo es una época. Las misiones se desbloquean de a una; al ganar, dan PI a la nación de la misión.
   Los capítulos de las épocas que son eventos (1ª Guerra, Entreguerras) se juegan solo en su fecha. */
const CAMPAIGN=[
  {era:1,title:'La Gran Guerra',missions:[
    {id:'flers',date:'15 de septiembre de 1916',title:'Flers-Courcelette',map:'somme',ally:'uk',foe:'de',plu:['mk1'],lu:{0:['mk1'],1:[]},nAlly:3,nFoe:0,guns:[0,3],squads:[3,4],tickets:[400,260],wx:'niebla',
      ctx:'Batalla del Somme. Después de dos meses de matanza, los británicos estrenan un arma secreta que los soldados llaman "tanques" (en clave, eran "tanques de agua"). Son 49 Mark I; muchos se rompen antes de llegar. Los alemanes nunca vieron nada igual.',
      goal:'Cruzá la tierra de nadie con tu Mark I, pasá por encima de las trincheras y tomá las ruinas de Flers, el Bosque Delville y la granja. Los cañones de campaña alemanes son tu peor enemigo: cuidá los costados.',
      tip:'Tu tanque no tiene torre: los cañones están en las barbetas de los costados. Para tirar adelante, girá un poco el casco. Si mueren los cambistas, el tanque gira muy despacio.'},
    {id:'berry',date:'16 de abril de 1917',title:'Berry-au-Bac',map:'berry',ally:'fr',foe:'de',plu:['schneider'],lu:{0:['schneider'],1:[]},nAlly:4,nFoe:0,guns:[0,4],squads:[3,4],tickets:[400,280],wx:'dia',
      ctx:'Ofensiva Nivelle, en el Chemin des Dames. El primer ataque de tanques franceses: 128 Schneider CA1. La artillería alemana los ve venir desde las alturas y los tanques, con el combustible a los costados, se incendian con facilidad.',
      goal:'Avanzá con los Schneider, abrí paso a la infantería y tomá las tres posiciones. No te quedes quieto bajo el fuego de los cañones.',
      tip:'El 75 mm del Schneider es corto y solo apunta hacia adelante a la derecha: alineá el casco con el blanco. Es explosivo: sirve contra cañones, trincheras e infantería.'},
    {id:'cambrai',date:'20 de noviembre de 1917',title:'Cambrai: Flesquières',map:'cambrai',ally:'uk',foe:'de',plu:['mk4m','mk4f'],lu:{0:['mk4m','mk4f'],1:[]},nAlly:4,nFoe:0,guns:[0,5],squads:[3,5],tickets:[400,300],wx:'niebla',
      ctx:'Casi 400 tanques Mark IV atacan juntos la Línea Hindenburg, sin bombardeo previo para no avisar. Pasan las alambradas como si fueran pasto. Pero en la loma de Flesquières esperan las baterías alemanas, que destruyen decenas de tanques.',
      goal:'Rompé la Línea Hindenburg: tomá el Bosque de Orival, el pueblo de Flesquières y la granja de Premy. Encontrá y destruí los cañones de la loma antes de que te encuentren a vos.',
      tip:'Las trincheras alemanas son anchísimas: el Mark IV las cruza, los tanques cortos se hunden un poco. Las hembras llevan ametralladoras para limpiar trincheras.'},
    {id:'villers',date:'24 de abril de 1918',title:'Villers-Bretonneux',map:'villers',ally:'uk',foe:'de',plu:['mk4m'],lu:{0:['mk4f','mk4f','whippet','whippet'],1:['a7v']},nAlly:4,nFoe:3,guns:[0,1],squads:[3,3],tickets:[400,400],wx:'niebla',
      ctx:'Ofensiva de primavera alemana. Entre la niebla y el gas aparecen tres A7V. Un Mark IV macho y dos hembras les salen al cruce: es el primer combate entre tanques de la historia. Las hembras, sin cañón, tienen que retirarse.',
      goal:'Con tu Mark IV macho, enfrentá a los A7V y recuperá el pueblo, el bosque y la aldea de Cachy. Los Whippet te van a ayudar en el contraataque.',
      tip:'El A7V tiene 30 mm al frente, más de lo que perfora tu 6 libras de lejos. Acercate y pegale de costado (20 mm) o al cañón. Los disparos que no perforan igual pueden matar tripulantes adentro.'},
    {id:'villersde',date:'24 de abril de 1918',title:'Villers-Bretonneux: el lado alemán',map:'villers',ally:'de',foe:'uk',plu:['a7v'],lu:{0:['a7v','beute4'],1:['mk4m','mk4f','whippet']},nAlly:3,nFoe:5,guns:[1,1],squads:[4,3],tickets:[400,400],wx:'niebla',
      ctx:'El mismo día, del otro lado. Los A7V "Nixe", "Siegfried" y "Schnuck" encabezan el ataque con la infantería de asalto. Son pocos (Alemania construyó solo 20) y cada uno lleva 18 hombres adentro.',
      goal:'Llevá tu A7V hasta Villers-Bretonneux y sostené el pueblo, el bosque y Cachy contra los Mark IV y los Whippet británicos.',
      tip:'El A7V es lento y se encaja en las trincheras anchas, pero su frente aguanta. Mostrale siempre el frente al enemigo. Si muere el artillero, otro tripulante toma su lugar.'},
    {id:'stmihiel',date:'12 de septiembre de 1918',title:'Saint-Mihiel',map:'stmihiel',ally:'us',foe:'de',plu:['ftus'],lu:{0:['ftus','ftus','mk5us'],1:['beute4']},nAlly:4,nFoe:1,guns:[0,3],squads:[4,4],tickets:[400,300],wx:'lluvia',
      ctx:'La primera gran ofensiva del ejército estadounidense en Francia. Los Renault FT del Cuerpo de Tanques avanzan con la infantería entre barro, lluvia y alambradas viejas.',
      goal:'Avanzá con tu Renault FT junto a la infantería y tomá el bosque, Essey y Pannes. Los cañones alemanes se retiran: no los dejes llevarse las piezas.',
      tip:'El FT tiene torre de 360°: es el primer tanque "moderno". Pero es chico: solo dos tripulantes. Si cae uno, el tanque queda fuera de combate.'}
  ]}
];
// El mapa del Chemin des Dames (Berry-au-Bac) es otra configuración del generador de frentes
WW1_CFG.berry={seed:1917.4,label:'Berry-au-Bac (Chemin des Dames, 1917)',desc:'16 de abril de 1917: el primer ataque de tanques franceses. Llanura de tiza abierta frente a las alturas del Chemin des Dames, el camino a Juvincourt y la artillería alemana mirando desde arriba.',
  bx:170,bz:150,sky:0xb6b6ae,fog:[120,400],ground:['#8a8266','#7a7458','#9a9274','#6a6448'],grass:.35,craters:300,crR:[1.2,4.5],front:58,tw:[2.0,2.4],td:1.9,wire:[1,2],ridge:9,
  village:{x:-8,z:18,n:14,ruin:.7,r:24,name:'Juvincourt',church:1},woods:[{x:-105,z:6,r:26,n:90,dead:.6}],hamlet:{x:104,z:-6,n:6,ruin:.6,r:12},
  zones:[{id:'A',x:-105,z:6,r:19,label:'Bosque de Beau-Marais'},{id:'B',x:-8,z:18,r:18,label:'Juvincourt'},{id:'C',x:104,z:-6,r:18,label:'Granja del Choléra'}]};
{ const k='berry', C=ww1Big(WW1_CFG[k]); WORLDS[k]={key:k,label:C.label,desc:C.desc,era:1,ww1:true,bx:C.bx,bz:C.bz,sky:C.sky,fog:C.fog,dust:0x8a7e62,cfg:C,h:(x,z)=>ww1Sample(WORLDS[k],x,z),zones:C.zones,
  spawns:{0:[{label:'Base oeste',x:-90,z:-C.spawnZ},{label:'Base este',x:90,z:-C.spawnZ}],1:[{label:'Retaguardia oeste',x:-90,z:C.spawnZ},{label:'Retaguardia este',x:90,z:C.spawnZ}]}}; }

const allMissions=()=>CAMPAIGN.flatMap(ch=>ch.missions.map(m=>({...m,era:ch.era})));
const missionById=id=>allMissions().find(m=>m.id===id);
const missionDone=id=>!!(PROG&&PROG.camp&&PROG.camp[id]);
// Una misión se juega si tenés comprado alguno de sus tanques (y cumpliste la anterior del capítulo)
// la primera misión de cada capítulo se juega con el tanque que presta la campaña (así se puede empezar enseguida)
const missionTank=M=>M.plu.some(owned)||CAMPAIGN.some(ch=>ch.missions[0]&&ch.missions[0].id===M.id);
const missionNeed=M=>`comprar el ${M.plu.map(k=>VEH[k].label).join(' o el ')}`;
function missionPrevDone(id){ const L=allMissions(), i=L.findIndex(m=>m.id===id); if(i<=0) return true; const m=L[i];
  if(!PROG.eraOpen[m.era]) return false; const prev=L.slice(0,i).reverse().find(x=>x.era===m.era); return !prev||missionDone(prev.id); }
const missionOpen=id=>missionPrevDone(id)&&missionTank(missionById(id));
function campChapterDone(e){ const ch=CAMPAIGN.find(c=>c.era===e); return !!ch&&ch.missions.every(m=>missionDone(m.id)); }
const nextMission=id=>{ const L=allMissions(), i=L.findIndex(m=>m.id===id); return L[i+1]||null; };

// Arranca una misión: bandos, tanques y ayudas fijas (las del hecho histórico)
function startMission(id){ const M=missionById(id); if(!M) return; curEra=M.era; applyEraNations(M.era);
  startBattle(false,M.map,{mission:M.id,era:M.era,ally:M.ally,foe:M.foe,plu:M.plu,lu:M.lu,nAlly:M.nAlly,nFoe:M.nFoe,guns:M.guns,squads:M.squads,tickets:M.tickets,wx:M.wx,obj:M.obj}); }

// Intro de la misión (reemplaza a la de la batalla común)
function missionBriefHTML(M){
  return `<div class="brief"><div class="kick">Campaña · ${ERAS[M.era].n} · ${M.date}</div><h1>${M.title}</h1>
    <h2>Contexto histórico</h2><p>${M.ctx}</p><h2>Objetivo</h2><p>${M.goal}</p>
    <h2>Tu tanque</h2><p>${M.plu.map(k=>`<b>${VEH[k].label}</b>`).join(' o ')}. ${M.tip}</p>
    <h2>Condiciones</h2><p>${W.label} · ${WX.n}. Tickets: ${M.tickets[0]} tuyos contra ${M.tickets[1]} del enemigo.</p>
    <button class="go" id="briefGo">Salir a la misión</button><button class="go alt" id="briefBack">Volver a la campaña</button></div>`; }

// Resultado de la misión (se agrega al resumen de la partida)
function missionResult(M,win){
  if(!win) return {html:`<div class="rpbox"><b>Misión fallida.</b> Podés reintentarla las veces que quieras.</div>`,next:null};
  const first=!missionDone(M.id); PROG.camp[M.id]=1; let html=`<div class="rpbox"><b>¡Misión cumplida: ${M.title}!</b>`, un=[];
  // premio extra la primera vez (no regala tanques: suma PI y Yaguaretés como una buena batalla)
  if(first){ const K=RANK_K[M.era]||1, rp=Math.round(600*K), yp=Math.round(2000*K); un=addRP(M.ally,rp); PROG.yp=(PROG.yp||0)+yp;
    html+=`<br>Premio por la misión: +${rp.toLocaleString('es-AR')} PI y +${ypTxt(yp)}`; }
  const N=nextMission(M.id); if(N&&N.era===M.era) html+=`<br>Próxima misión: <b>${N.title}</b> (${N.date})${missionOpen(N.id)?'.':` · necesitás ${missionNeed(N)}.`}`;
  else if(campChapterDone(M.era)) html+=`<br><b>¡Terminaste el capítulo "${CAMPAIGN.find(c=>c.era===M.era).title}"!</b>`;
  saveProg(); return {html:html+'</div>',next:N&&missionOpen(N.id)?N:null,un}; }

// Ventana de la campaña (en el hangar)
function hgCampaign(){ const box=$('hgModal'); if(!box) return;
  const rows=CAMPAIGN.map(ch=>`<h2 style="margin:10px 0 4px">${ERAS[ch.era].n} <small style="opacity:.7">(${ERAS[ch.era].y})${eventTxt(ch.era)?' · '+eventTxt(ch.era):''}</small></h2>`+ch.missions.map((m,i)=>{ const M={...m,era:ch.era}, open=missionOpen(m.id), done=missionDone(m.id), tank=missionTank(M);
      const why=!PROG.eraOpen[ch.era]?'🔒 '+eventTxt(ch.era):!missionPrevDone(m.id)?'🔒 Cumplí la anterior':!tank?`🔒 Necesitás ${M.plu.map(k=>VEH[k].label).join(' o ')}`:'';
      return `<button class="camM${open?'':' lock'}${done?' ok':''}" data-m="${m.id}" ${open?'':'disabled'}><span class="n">${i+1}</span><b>${m.title}</b><small>${m.date} · ${NATIONS[m.ally]?(NAT_ERA[ch.era]&&NAT_ERA[ch.era][m.ally]||NATIONS[m.ally]).label:''} · ${m.plu.map(k=>VEH[k].label).join(' / ')}${why?` · ${why}`:''}</small><i>${done?'✔ Cumplida':open?'Jugar ▸':'🔒'}</i></button>`; }).join('')).join('')
    +eraList().filter(e=>!CAMPAIGN.some(c=>c.era===e)).map(e=>`<h2 style="margin:10px 0 4px;opacity:.55">${ERAS[e].n} <small>(${ERAS[e].y})</small></h2><p class="s" style="opacity:.55">Próximamente.</p>`).join('');
  box.innerHTML=`<div class="hgM camW"><h2>Campaña histórica</h2><p class="s">Las batallas reales, en orden. Cada misión se abre cuando cumpliste la anterior y tenés comprado su tanque. La primera vez que la ganás da un premio extra de PI y ${YP}.</p>
    <div class="camL">${rows}</div><button class="go alt" id="mClose" style="margin:8px 0 0">Cerrar</button></div>`;
  $('mClose').onclick=()=>{ box.innerHTML=''; };
  box.querySelectorAll('.camM:not(.lock)').forEach(b=>b.onclick=goWrap(()=>startMission(b.dataset.m))); }

// Selector de época del hangar y del árbol: las épocas cerradas muestran cómo se abren
function eraStripHTML(){ return `<span class="hgEra">${eraList().map(e=>{ const E=ERAS[e], open=eraPlayable(e)&&PROG.eraOpen[e], ev=eraReady(e)?eventTxt(e):'';
    return `<button class="hgE${e===curEra?' sel':''}${open?'':' lock'}" data-e="${e}" title="${E.n} (${E.y})${E.ready?'':' · en construcción'}${ev?' · '+ev:''}">${open?ev?'★ ':'':'🔒 '}${E.y}<small>${E.n}${ev?` · ${ev}`:''}</small></button>`; }).join('')}</span>`; }
function wireEraStrip(redraw){ document.querySelectorAll('.hgE').forEach(b=>b.onclick=()=>{ const e=+b.dataset.e;
  if(eraPlayable(e)&&PROG.eraOpen[e]){ curEra=e; applyEraNations(e); saveProg(); redraw(); return; }
  const box=$('hgModal'), w=eventWin(e), msg=!eraReady(e)?`<b>${ERAS[e].n}</b> (${ERAS[e].y}) todavía está en construcción: ${ERAS[e].desc}`
    :`<b>${ERAS[e].n}</b> es un evento: se juega del <b>${fmtDia(w[0])}</b> al <b>${fmtDia(new Date(w[1].getTime()-864e5))}</b>, por el ${ERA_EVENT[e].n}. Tu progreso de esa época queda guardado para la próxima vez.`;
  if(box){ box.innerHTML=`<div class="hgM"><h2>Época cerrada</h2><p class="s">${msg}</p><button class="go alt" id="mClose" style="margin:6px 0 0">Cerrar</button></div>`; $('mClose').onclick=()=>{ box.innerHTML=''; }; }
  else hitMsg(msg.replace(/<[^>]+>/g,''),'var(--paper)'); }); }
