/* ---------- Puntos de reaparición (SP) ---------- */
function addSP(tank,n,score=0){ if(!tank||!tank.crew) return; tank.crew.sp+=n; tank.crew.score+=score; if(tank.crew.isPlayer) $('spT').textContent=tank.crew.sp; }
// ---------- Progresión estilo War Thunder ----------
// Cada época es un rango (I = 1ª Guerra … V = Guerra Fría). Cada nación tiene líneas por clase en orden de año: un tanque pide el
// anterior de su línea (y el primero de una clase pide el último de esa clase del rango anterior). Para pasar de rango hay que tener
// investigados RANK_NEED tanques del rango anterior. Con PI (puntos de investigación) se investiga y con Yaguaretés de plata se compra.
const BR_TABLE={stuart:2.0,m113:2.7,sherman:3.3,ee9:4.0,vctp:4.3,m41u:4.3,pt76:4.7,scorpion:5.0,marder:5.3,sk105:5.7,ru251:6.0,sheridan:6.3,tiran:6.3,centurion:6.7,
  t55:7.0,tam:7.0,leopard1:7.3,patagon:7.7,leo1v:7.7,m60:7.7,t62m:7.7,chieftain:8.3,leo1a5:8.7,m60a3:8.7,tam2c:9.0,leo2a4:10.0,abrams:10.3};
for(const k in VEH) VEH[k].br=VEH[k].br||BR_TABLE[k]||5;
const brTxt=b=>b.toFixed(1);
// Árbol de una nación en una época (por defecto, la elegida en el menú). Los cañones de campaña no son jugables.
function vehTreeE(n,e){ return Object.keys(VEH).filter(k=>VEH[k].nation===n&&eraOf(k)===e&&!VEH[k].static).sort((a,b)=>VEH[a].br-VEH[b].br||(VEH[a].year||0)-(VEH[b].year||0)); }
function vehTree(n){ return vehTreeE(n,curEra); }
const RANK_ROMAN=['','I','II','III','IV','V'], RANK_K={1:1,2:1.7,3:2.6,4:3.6,5:4.8}, RANK_NEED=3, YP_START=2000;
const rankOf=k=>eraOf(k);
const YP='Yaguaretés de plata', ypTxt=n=>`🐆 ${Math.round(n).toLocaleString('es-AR')}`;
// Costos: crecen con el rango y dentro del rango (los primeros tanques cuestan unas 3 batallas)
const rpCost=k=>{ const r=rankOf(k), i=Math.max(0,vehTreeE(VEH[k].nation,r).indexOf(k)); return Math.round((1800+700*i)*RANK_K[r]/50)*50; };
const ypCost=k=>Math.round(rpCost(k)*2.2/100)*100;
// Tanque que hay que tener investigado antes (null = solo pide el rango)
function reqOf(k){ const V=VEH[k]; if(V.req!==undefined) return V.req; const r=rankOf(k), T=vehTreeE(V.nation,r), same=T.filter(x=>VEH[x].cls===V.cls), i=same.indexOf(k);
  if(i>0) return same[i-1];
  for(let e=r-1;e>=1;e--){ const P=vehTreeE(V.nation,e); if(!P.length) continue; return P.filter(x=>VEH[x].cls===V.cls).pop()||null; }
  return T[0]!==k?T[0]:null; }
const researched=k=>!!(PROG&&PROG.unlocked[k]);
const owned=k=>!!(PROG&&PROG.owned&&PROG.owned[k]);
// Un rango se abre con RANK_NEED tanques investigados del rango anterior de esa nación (si el anterior no existe todavía, queda cerrado)
function rankOpen(n,r){ if(r<=1) return true; const P=vehTreeE(n,r-1);
  if(!P.length) return eraList().every(e=>e>=r||!vehTreeE(n,e).length)&&eraNations(r).some(m=>m!==n&&vehTreeE(m,r-1).length&&rankOpen(m,r)); // nación nueva en esta época: abre con las demás
  return P.filter(researched).length>=Math.min(RANK_NEED,P.length); }
const canResearch=k=>!researched(k)&&rankOpen(VEH[k].nation,rankOf(k))&&(!reqOf(k)||researched(reqOf(k)));
function lockReason(k){ const n=VEH[k].nation, r=rankOf(k);
  if(!rankOpen(n,r)) return vehTreeE(n,r-1).length?`Rango ${RANK_ROMAN[r]}: investigá ${RANK_NEED} tanques de rango ${RANK_ROMAN[r-1]}`:`Rango ${RANK_ROMAN[r]}: primero tienen que existir los rangos anteriores`;
  const q=reqOf(k); return q&&!researched(q)?`Requiere investigar el ${VEH[q].label}`:''; }
// Garaje: uno por nación y por época
const garRef=(n,e=curEra)=>PROG.garage[n+'@'+e]||(PROG.garage[n+'@'+e]=[]);
let PROG=null;
// Progreso (tw2_progress, versión 3 = rangos e investigar/comprar; las versiones anteriores se reinician). La versión 1 del juego usa tw_progress.
// Con cuenta iniciada la clave pasa a tw2_progress@<uid> (ver nube.js), así cada cuenta tiene el suyo en este navegador.
let PROG_KEY='tw2_progress';
function loadProg(){ try{ PROG=JSON.parse(localStorage.getItem(PROG_KEY)||'null'); }catch(e){ PROG=null; }
  if(!PROG||PROG.v!==3) PROG={v:3,unlocked:{},owned:{},rp:{},target:{},yp:YP_START,garage:{},stats:{battles:0,wins:0},eraOpen:{1:1},camp:{}};
  PROG.camp=PROG.camp||{}; PROG.owned=PROG.owned||{}; PROG.target=PROG.target||{};
  // cada nación arranca con su primer tanque de rango I, investigado y comprado
  for(const n in NATIONS){ if(NATIONS[n].special) continue; const T=vehTreeE(n,1); if(!T.length) continue; PROG.unlocked[T[0]]=1; PROG.owned[T[0]]=1;
    const G=garRef(n,1); if(!G.length) G.push(T[0]); }
  syncEraOpen(); if(PROG.era&&PROG.eraOpen[PROG.era]) curEra=PROG.era; }
// Una época se puede elegir si alguna nación tiene abierto ese rango
function syncEraOpen(){ const out=[]; for(const e of eraList()){ const o=e===1||(eraReady(e)&&eraNations(e).some(n=>rankOpen(n,e)));
    if(o&&!PROG.eraOpen[e]&&e!==1) out.push(e); PROG.eraOpen[e]=o?1:0; }
  // la primera época de cada nación le regala su primer tanque (la URSS empieza en Entreguerras)
  for(const n in NATIONS){ if(NATIONS[n].special) continue; const fe=eraList().find(e=>eraReady(e)&&vehTreeE(n,e).length); if(!fe||fe===1||!rankOpen(n,fe)) continue;
    const T=vehTreeE(n,fe); if(!PROG.unlocked[T[0]]){ PROG.unlocked[T[0]]=1; PROG.owned[T[0]]=1; const G=garRef(n,fe); if(!G.length) G.push(T[0]); } }
  return out; }
function saveProg(){ if(!PROG) return; PROG.era=curEra; PROG.t=Date.now(); try{ localStorage.setItem(PROG_KEY,JSON.stringify(PROG)); }catch(e){}
  if(typeof nubeGuardar==='function') nubeGuardar(); }
// Épocas que se abrieron recién (al investigar suficientes tanques del rango anterior)
function checkEraUnlock(){ const out=syncEraOpen(); if(out.length) saveProg(); return out; }
// Lo que se está investigando en una nación: el elegido (si todavía se puede) o el primero investigable en orden de rango
function nextResearch(n){ const t=PROG.target[n]; if(t&&VEH[t]&&canResearch(t)) return t;
  for(const e of eraList()){ const k=vehTreeE(n,e).find(canResearch); if(k) return k; } return null; }
function setResearch(k){ if(canResearch(k)){ PROG.target[VEH[k].nation]=k; saveProg(); } }
// Comprar un tanque investigado con Yaguaretés de plata; entra al garaje si hay lugar
function buyTank(k){ if(!researched(k)||owned(k)) return false; const c=ypCost(k); if((PROG.yp||0)<c) return false;
  PROG.yp-=c; PROG.owned[k]=1; const g=garRef(VEH[k].nation,eraOf(k)); if(g.length<3&&!g.includes(k)) g.push(k); saveProg(); return true; }
const garageOf=n=>garRef(n).filter(k=>owned(k)&&VEH[k]&&eraOf(k)===curEra);
const garageBR=n=>Math.max(...garageOf(n).map(k=>VEH[k].br),1);
// Emparejamiento: vehículos de la nación con BR dentro de ±1.0 del de la batalla (si no hay, los más cercanos)
function mmLineup(n,br){ const T=vehTree(n); let c=T.filter(k=>Math.abs(VEH[k].br-br)<=1.0);
  if(c.length<2) c=T.slice().sort((a,b)=>Math.abs(VEH[a].br-br)-Math.abs(VEH[b].br-br)).slice(0,2); return shuffle(c).slice(0,3); }
// Suma PI al tanque que se investiga en esa nación; lo que sobra pasa al siguiente. Devuelve los tanques investigados (falta comprarlos).
function addRP(n,rp){ const out=[]; let left=rp;
  while(left>0){ const k=nextResearch(n); if(!k) break; const have=PROG.rp[k]||0, need=rpCost(k)-have;
    if(left>=need){ PROG.unlocked[k]=1; delete PROG.rp[k]; if(PROG.target[n]===k) delete PROG.target[n]; left-=need; out.push(k); }
    else { PROG.rp[k]=have+left; left=0; } }
  saveProg(); return out; }
// Premio de una batalla según el rango más alto que usaste: los tanques viejos dan menos
function battleReward(rank,win,score){ const K=RANK_K[rank]||1;
  return {rp:Math.round(((win?450:250)+score*2.5)*K), yp:Math.round(((win?1700:900)+score*5)*K/10)*10}; }
let battleBR=null;
/* ---------- Progresión: rango de jugador, desafíos diarios, medallas y estadísticas por tanque ---------- */
const RANKS=[[0,'Soldado'],[2000,'Cabo'],[5000,'Cabo primero'],[10000,'Sargento'],[18000,'Sargento primero'],[30000,'Suboficial'],[45000,'Subteniente'],[65000,'Teniente'],
  [90000,'Teniente primero'],[120000,'Capitán'],[160000,'Mayor'],[210000,'Teniente coronel'],[270000,'Coronel'],[350000,'General']];
const rankIdx=xp=>{ let i=0; for(let k=0;k<RANKS.length;k++) if(xp>=RANKS[k][0]) i=k; return i; };
const CH_TYPES=[{id:'kills',n:k=>`Destruí ${k} tanques`,a:3,b:6},{id:'side',n:k=>`Penetrá ${k} veces de costado o por atrás`,a:4,b:8},{id:'caps',n:k=>`Capturá ${k} puntos`,a:2,b:4},
  {id:'assists',n:k=>`Conseguí ${k} asistencias`,a:2,b:5},{id:'inf',n:k=>`Abatí ${k} soldados enemigos`,a:4,b:10},{id:'wins',n:k=>`Ganá ${k} batalla${k>1?'s':''}`,a:1,b:2},
  {id:'badwx',n:k=>`Jugá ${k} batalla${k>1?'s':''} de noche, con lluvia o con niebla`,a:1,b:2},{id:'smoke',n:k=>`Usá el humo ${k} veces`,a:2,b:4},
  {id:'natk',n:(k,nat)=>`Destruí ${k} tanques jugando con ${NATIONS[nat].label}`,a:2,b:4}];
const dayKey=()=>{ const d=new Date(); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; };
function ensureDaily(){ if(!PROG) loadProg(); const k=dayKey(); if(PROG.daily&&PROG.daily.day===k) return PROG.daily;
  let h=0; for(const ch of k) h=(h*31+ch.charCodeAt(0))>>>0; const rnd=()=>{ h=(h*1664525+1013904223)>>>0; return h/4294967296; };
  // el desafío del humo solo si ya tiene abierta alguna época con lanzahumos
  const humo=Object.keys(PROG.eraOpen||{}).some(e=>eraReady(+e)&&ERAS[e].smoke!==0);
  const pool=CH_TYPES.filter(T=>T.id!=='smoke'||humo), list=[], NN=Object.keys(normalNations());
  for(let i=0;i<3;i++){ const T=pool.splice((rnd()*pool.length)|0,1)[0]; list.push({t:T.id,need:T.a+Math.round(rnd()*(T.b-T.a)),have:0,done:false,nat:NN[(rnd()*NN.length)|0]}); }
  PROG.daily={day:k,list}; saveProg(); return PROG.daily; }
const chText=c=>{ const T=CH_TYPES.find(x=>x.id===c.t); return T?T.n(c.need,c.nat):'?'; };
function progressDaily(v,nat){ const D=ensureDaily(), done=[];
  for(const c of D.list){ if(c.done) continue; const add=c.t==='natk'?(nat===c.nat?v.kills:0):(v[c.t]||0); c.have=Math.min(c.need,c.have+add);
    if(c.have>=c.need){ c.done=true; PROG.medals=(PROG.medals||0)+1; PROG.pxp=(PROG.pxp||0)+1000; done.push(c); } }
  return done; }
/* ---------- Clima y hora: se sortea en cada batalla ---------- */
const WXS={dia:{n:'Día despejado'},
  tarde:{n:'Atardecer',sky:0xd29a72,fog:[120,400],hemi:.55,sun:.75,sunCol:0xffb070,sunPos:[140,26,50]},
  noche:{n:'Noche',sky:0x0c1422,fog:[40,190],hemi:.24,sun:.2,sunCol:0x8ea4d8,night:true,see:.5},
  niebla:{n:'Niebla',sky:0xc4c9c6,fog:[25,140],hemi:.68,sun:.4,see:.45},
  lluvia:{n:'Lluvia',sky:0x7f878c,fog:[70,280],hemi:.5,sun:.35,rain:1,mud:true,see:.75},
  tormenta:{n:'Tormenta nocturna',sky:0x11161b,fog:[40,200],hemi:.2,sun:.14,sunCol:0x8ea4d8,rain:1.6,mud:true,night:true,storm:true,see:.45}};
let WX=WXS.dia, wxKey='dia';
function pickWeather(){ const r=Math.random(); return r<.4?'dia':r<.55?'tarde':r<.7?'noche':r<.8?'niebla':r<.93?'lluvia':'tormenta'; }
// Calibre de la ametralladora más pesada de cada tanque (mm): 12,7 y 14,5 penetran más y pueden cortar orugas
const MG_CAL={m113:12.7,sherman:12.7,m41u:12.7,sheridan:12.7,tiran:12.7,centurion:12.7,t55:12.7,m60:12.7,t62m:12.7,chieftain:12.7,m60a3:12.7,abrams:12.7,pt76:7.62};
const mgCal=t=>t.mgCal||(t.T&&(t.T.mgc||MG_CAL[t.key]))||7.62, mgPen=c=>c>=14?32:c>=12?25:(RULE().mgPen||16);
// ---------- Niveles por tanque: la experiencia (XP) de cada vehículo desbloquea mejoras ----------
const LV_XP=[0,1500,4000,8000,14000];
const LV_UP=[null,null,{k:'smoke',n:'Lanzahumos',d:'2 granadas de humo por salida (tecla de humo)'},{k:'rep',n:'Reparación rápida',d:'Reparás un 40 % más rápido'},
  {k:'ammo',n:'Munición mejorada',d:'+8 % de penetración y 20 % más proyectiles'},{k:'fcs',n:'Control de tiro',d:'Telémetro (o recarga 10 % más rápida si ya lo tenía)'}];
// En épocas sin lanzahumos (1ª Guerra) el nivel 2 da cintas extra de ametralladora
const LV2_NOSMOKE={k:'mg',n:'Cintas extra',d:'2 cintas más de ametralladora por salida'};
const noSmokeEra=k=>ERAS[eraOf(k)]&&ERAS[eraOf(k)].smoke===0;
const lvUp=(l,k)=>l===2&&noSmokeEra(k)?LV2_NOSMOKE:LV_UP[l];
const tankXP=k=>(PROG&&PROG.txp&&PROG.txp[k])||0;
const tankLv=k=>{ const x=tankXP(k); let l=1; for(let i=1;i<LV_XP.length;i++) if(x>=LV_XP[i]) l=i+1; return l; };
function addTankXP(k,xp){ if(!PROG||!VEH[k]) return []; PROG.txp=PROG.txp||{}; const before=tankLv(k); PROG.txp[k]=tankXP(k)+xp; const after=tankLv(k); saveProg();
  const ups=[]; for(let l=before+1;l<=after;l++) ups.push(l); return ups; }
function applyLevel(t,lv){ t.lv=lv=clamp(lv|0,1,5); t.noSmk=noSmokeEra(t.key); t.smoke=lv>=2&&!t.noSmk?2:0; t.mgX=lv>=2&&t.noSmk; t.repairK=lv>=3?.6:1; t.penK=lv>=4?1.08:1; t.fcsX=lv>=5&&!t.T.fcs;
  if(lv>=5&&t.T.fcs) t.reloadMax*=.9; }
const hasFcs=t=>!!(t&&(t.T.fcs||t.fcsX));
const usesOf=(crew,key)=>crew.uses[key]||0;
const costOf=(crew,key)=>crew.spawns===0&&!VEH[key].uses?0:Math.round(COST[VEH[key].cls]*(usesOf(crew,key)?1.5:1));
const available=(crew,key)=>usesOf(crew,key)<usesMax(key)&&costOf(crew,key)<=crew.sp;
const canSpawn=crew=>crew.lineup.some(k=>available(crew,k));
function zoneSpawn(Z,team){
  if(nodes){const n=nearestNode(Z.x,Z.z);return {x:n.p.x,z:n.p.z};}
  const b=W.sp[team][0], dx=b.x-Z.x, dz=b.z-Z.z, d=Math.hypot(dx,dz)||1;
  return {x:Z.x+dx/d*Z.r*.7,z:Z.z+dz/d*Z.r*.7};
}
function spawnPoints(team){
  const list=W.sp[team].map(s=>({...s})), mine=team===0?1:-1;
  for(const Z of zones) if(Z.owner===mine){const p=zoneSpawn(Z,team); list.push({label:`Punto ${Z.id}, ${Z.label} (capturado)`,x:p.x,z:p.z});}
  return list;
}
function nearestZone(x,z,filter){let best=null,bd=1e9;for(const Z of zones){if(filter&&!filter(Z))continue;const d=Math.hypot(Z.x-x,Z.z-z);if(d<bd){bd=d;best=Z;}}return best;}
const occupied=(x,z)=>tanks.some(t=>Math.hypot(t.pos.x-x,t.pos.z-z)<t.R*2+1);
function findSpawnPos(p){
  if(nodes){const start=nearestNode(p.x,p.z),seen=new Set([start]),q=[start];
    while(q.length&&seen.size<300){const n=q.shift(); if(!occupied(n.p.x,n.p.z)) return {x:n.p.x,z:n.p.z};
      for(const nb of n.nb) if(!seen.has(nb)){seen.add(nb);q.push(nb);}}
    return {x:start.p.x,z:start.p.z};}
  for(let i=0;i<80;i++){const r=i*.5,a=Math.random()*6.283,x=clamp(p.x+Math.cos(a)*r,-W.bx+5,W.bx-5),z=clamp(p.z+Math.sin(a)*r,-W.bz+5,W.bz-5);
    if(!occupied(x,z)&&!gridQuery(x,z,6).some(b=>obPush(x,z,5,b))&&!(W.water!=null&&heightAt(x,z)<W.water+1)) return {x,z};}
  return {x:p.x,z:p.z};
}
function spawnCrew(crew,key,sp){
  const pos=findSpawnPos(sp), Zn=nearestZone(pos.x,pos.z,Z=>Z.owner!==(crew.team===0?1:-1))||zones[0], h=Math.atan2(Zn.x-pos.x,Zn.z-pos.z);
  crew.sp-=costOf(crew,key); crew.uses[key]=usesOf(crew,key)+1;
  if(crew.spawns>0) feed(`${crew.name} reapareció en ${VEH[key].label}`,crew.team===0?'var(--ally)':'var(--enemy)');
  crew.spawns++;
  const t=makeTank(crew,key,pos.x,pos.z,h); crew.tank=t; return t;
}

/* ---------- Árboles y edificios bajo fuego ---------- */
const treeMeshes=()=>{const out=[];for(const sp in treeSets)out.push(...treeSets[sp]);return out;};
function knockTree(tr,dx,dz){ if(tr.fallen) return; const l=Math.hypot(dx,dz)||1; tr.fallen=true; tr.axis=new THREE.Vector3(dz/l,0,-dx/l); }
const treeOf=h=>h.object.userData.treeList?h.object.userData.treeList[h.instanceId]:null;
const bldOf=h=>((h.object===wallsIM||h.object===roofsIM||h.object===gablesIM)&&buildings[h.instanceId])||null;

