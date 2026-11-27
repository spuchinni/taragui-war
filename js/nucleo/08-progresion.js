/* ---------- Puntos de reaparición (SP) ---------- */
function addSP(tank,n,score=0,label){ if(!tank||!tank.crew) return; tank.crew.sp+=n; tank.crew.score+=score; if(tank.crew.isPlayer) $('spT').textContent=tank.crew.sp; if(label&&score) awardNote(tank.crew,label,score); }
// Lo que vale una acción al final de la batalla (la misma cuenta que battleReward, sin el premio por ganar): PI y Yaguaretés según el rango de tu tanque
// Economía (pedido de Sebastián, 9/11/2026: "50 mil Yaguaretés en 3 batallas es mucho"): un tanque nuevo cada 4 a 6 batallas.
// Antes un tanque de rango III daba ~17.000 Yaguaretés y ~7.700 PI por batalla (un tanque por batalla). ECON los baja.
const ECON={rp:.3,yp:.2};
function actionReward(score){ const k=(player&&player.key)||selKey, K=RANK_K[k&&VEH[k]?rankOf(k):1]||1; return {rp:Math.round(score*2.5*K*ECON.rp),yp:Math.round(score*.5*K*ECON.yp)}; }
// ---------- Progresión estilo War Thunder ----------
// Línea única por nación (26/11/2026, pedido de Sebastián: "solo una línea temporal por nación, así cualquiera usa cualquier tanque que tenga
// desbloqueado, estilo WT"): cada época es un rango (I = 1ª Guerra … V = Guerra Fría) de UNA sola línea por nación, con un solo garaje.
// La puerta de entrada es el rango III (2ª Guerra, RANK_ENTRY): ahí empieza el entrenamiento y sus primeros tanques no piden nada.
// De ahí para arriba la línea sigue (IV, V) y cada rango pide RANK_NEED investigados del anterior; los rangos I y II son la parte de antes
// de la puerta: abiertos, opcionales, encadenados entre ellos. El mapa y las reglas salen del tanque de BR más alto del garaje (lineEra).
// Con PI (puntos de investigación) se investiga y con Yaguaretés se compra.
const BR_TABLE={stuart:2.0,m113:2.7,sherman:3.3,ee9:4.0,vctp:4.3,m41u:4.3,pt76:4.7,scorpion:5.0,marder:5.3,sk105:5.7,ru251:6.0,sheridan:6.3,tiran:6.3,centurion:6.7,
  t55:7.0,tam:7.0,leopard1:7.3,patagon:7.7,leo1v:7.7,m60:7.7,t62m:7.7,chieftain:8.3,leo1a5:8.7,m60a3:8.7,tam2c:9.0,leo2a4:10.0,abrams:10.3};
for(const k in VEH) VEH[k].br=VEH[k].br||BR_TABLE[k]||5;
const brTxt=b=>b.toFixed(1);
// Árbol de una nación en una época (por defecto, la elegida en el menú). Los cañones de campaña no son jugables.
function vehTreeE(n,e){ return Object.keys(VEH).filter(k=>VEH[k].nation===n&&eraOf(k)===e&&!VEH[k].static&&!VEH[k].support&&!VEH[k].special).sort((a,b)=>VEH[a].br-VEH[b].br||(VEH[a].year||0)-(VEH[b].year||0)); }
// Línea entera de una nación (todos los rangos listos), en orden de rango y BR
function vehLine(n){ return eraList().flatMap(e=>vehTreeE(n,e)); }
function vehTree(n){ return vehLine(n); }
const RANK_ROMAN=['','I','II','III','IV','V'], RANK_K={1:1,2:1.7,3:2.6,4:3.6,5:4.8}, RANK_NEED=3, RANK_ENTRY=3, YP_START=2000;
// Rango anterior de la línea que tiene tanques en esa nación (el IV, Posguerra, está vacío: el V viene después del III); 0 = no hay
function prevRank(n,r){ for(let e=r-1;e>=1;e--) if(eraReady(e)&&vehTreeE(n,e).length) return e; return 0; }
// Rango que se mira en el hangar y en el árbol (solo la vista: no cambia dónde se juega)
let viewRank=RANK_ENTRY;
const rankOf=k=>eraOf(k);
const YP='Yaguaretés', ypTxt=n=>`🐆 ${Math.round(n).toLocaleString('es-AR')}`;
// Costos: crecen con el rango y dentro del rango (los primeros tanques cuestan unas 3 batallas)
const rpCost=k=>{ const r=rankOf(k), i=Math.max(0,vehTreeE(VEH[k].nation,r).indexOf(k)); return Math.round((1800+700*i)*RANK_K[r]/50)*50; };
const ypCost=k=>Math.round(rpCost(k)*2.2/100)*100;
// Tanque que hay que tener investigado antes (null = solo pide el rango). La línea cruza épocas: el primero de una clase en un rango pide
// el último de esa clase del rango anterior (o, si no hay, el último de ese rango). En la puerta de entrada (rango III) no se mira para atrás.
function reqOf(k){ const V=VEH[k]; if(V.req!==undefined) return V.req; const r=rankOf(k), T=vehTreeE(V.nation,r), same=T.filter(x=>VEH[x].cls===V.cls), i=same.indexOf(k);
  if(i>0) return same[i-1];
  const pr=r===RANK_ENTRY?0:prevRank(V.nation,r);
  if(pr){ const P=vehTreeE(V.nation,pr), ps=P.filter(x=>VEH[x].cls===V.cls); return ps.length?ps[ps.length-1]:P[P.length-1]; }
  return T[0]!==k?T[0]:null; }
const researched=k=>!!(PROG&&PROG.unlocked[k]);
const owned=k=>!!(PROG&&PROG.owned&&PROG.owned[k]);
// Un rango arriba de la puerta de entrada se abre con RANK_NEED tanques investigados del rango anterior (o todos, si tiene menos)
const rankNeed=(n,r)=>{ const pr=prevRank(n,r); return r<=RANK_ENTRY||!pr?0:Math.min(RANK_NEED,vehTreeE(n,pr).length); };
const rankHave=(n,r)=>{ const pr=prevRank(n,r); return pr?vehTreeE(n,pr).filter(researched).length:0; };
function rankOpen(n,r){ return rankHave(n,r)>=rankNeed(n,r); }
const canResearch=k=>!researched(k)&&rankOpen(VEH[k].nation,rankOf(k))&&(!reqOf(k)||researched(reqOf(k)));
function lockReason(k){ const n=VEH[k].nation, r=rankOf(k);
  if(!rankOpen(n,r)){ const pr=prevRank(n,r), f=rankNeed(n,r)-rankHave(n,r); return `Investigá ${f} tanque${f>1?'s':''} más de rango ${RANK_ROMAN[pr]} para abrir el ${RANK_ROMAN[r]}`; }
  const q=reqOf(k); return q&&!researched(q)?`Requiere investigar el ${VEH[q].label}`:''; }
// Garaje: uno por nación, con tanques de cualquier rango (el segundo argumento, la época, quedó de antes y no se usa).
// El progreso viejo tenía uno por nación y época ('de@3'): la primera vez se juntan, primero el de la última época jugada y después
// la 2ª Guerra, hasta 3. Las claves viejas no se borran (si se vuelve a la versión anterior, siguen ahí).
function garRef(n){ const G=PROG.garage||(PROG.garage={}); if(G[n]) return G[n];
  const L=[], pe=PROG.era||RANK_ENTRY, keys=Object.keys(G).filter(x=>x.startsWith(n+'@')).sort((a,b)=>{ const w=x=>x===n+'@'+pe?0:x===n+'@'+RANK_ENTRY?1:2; return w(a)-w(b); });
  for(const x of keys) for(const k of G[x]||[]) if(VEH[k]&&!L.includes(k)&&L.length<3) L.push(k);
  return G[n]=L; }
let PROG=null;
const PROG_V=4;   // versión del progreso: al subirla se reinicia el de todos (4 = reinicio del 10/11/2026, pedido de Sebastián)
// Progreso (tw2_progress, versión 3 = rangos e investigar/comprar; las versiones anteriores se reinician). La versión 1 del juego usa tw_progress.
// Con cuenta iniciada la clave pasa a tw2_progress@<uid> (ver nube.js), así cada cuenta tiene el suyo en este navegador.
let PROG_KEY='tw2_progress';
function loadProg(){ try{ PROG=JSON.parse(localStorage.getItem(PROG_KEY)||'null'); }catch(e){ PROG=null; }
  { const cp=progLS(PROG_KEY+'#copia'); if(cp&&progBat(cp)>progBat(PROG&&PROG.v===PROG_V?PROG:null)+.5){ PROG=cp; PROG.recuperado=1; try{ localStorage.setItem(PROG_KEY,JSON.stringify(cp)); }catch(e){} } }   // se había pisado: vuelve la copia
  if(!PROG||PROG.v!==PROG_V){ for(const k of ['tw2_arranque','tw2_coach','tw2_elegido','tw2_menuFull','tw2_lFoe','tw2_lWeak','tw2_lMira','tw2_lCap']) try{ localStorage.removeItem(k); }catch(e){}   // progreso nuevo: el entrenamiento vuelve a salir
    PROG={v:PROG_V,unlocked:{},owned:{},rp:{},target:{},yp:YP_START,garage:{},stats:{battles:0,wins:0},eraOpen:{1:1},camp:{},train:1}; }   // train: entrenamiento (3 primeras batallas, rapida.js/primeras.js): sin tanques propios
  PROG.camp=PROG.camp||{}; PROG.owned=PROG.owned||{}; PROG.target=PROG.target||{};
  // cada nación arranca con el primer tanque de su línea en la puerta de entrada (rango III), investigado y comprado (los jugadores nuevos no:
  // reciben uno solo al terminar el entrenamiento; PROG.openN = naciones abiertas). Lo que ya tenías de otras épocas queda.
  // Solo se regalan los tanques de reserva (26/11/2026, pedido de Sebastián): las naciones con requisito (brasil.js) dejan su primer tanque
  // investigado pero hay que comprarlo.
  // Desde la línea única ya no hay naciones que se abren por victorias (27/11/2026, pedido de Sebastián): se borra el candado viejo
  // (PROG.lockN/openN de rapida.js) y todas las naciones sin requisito quedan abiertas con su tanque de reserva.
  if(PROG.lockN||PROG.openN){ delete PROG.lockN; delete PROG.openN; }
  giveReserves(); 
  syncEraOpen(); curEra=PROG.era&&PROG.eraOpen[PROG.era]?PROG.era:3; }
// Tanque de reserva de cada nación (el primero de su puerta de entrada), investigado y comprado; las naciones con requisito dejan el suyo
// investigado pero hay que comprarlo. Se llama al cargar el progreso y al terminar el entrenamiento.
function giveReserves(){ if(!PROG||PROG.train) return;
  for(const n in NATIONS){ if(NATIONS[n].special||(NATIONS[n].abre&&!(PROG.reqN||[]).includes(n))) continue; const T=vehTreeE(n,RANK_ENTRY); if(!T.length) continue;
    PROG.unlocked[T[0]]=1; if(NATIONS[n].abre) continue; PROG.owned[T[0]]=1; const G=garRef(n); if(!G.length) G.push(T[0]); } }
// Época en la que se juega con una nación: la del tanque de BR más alto del garaje (pone el mapa, las reglas y la sala)
function lineEra(n){ const G=PROG&&n?garageOf(n):[]; if(!G.length) return RANK_ENTRY; const k=G.reduce((a,b)=>VEH[b].br>VEH[a].br?b:a); return eraOf(k); }
function syncLineEra(n){ const e=lineEra(n); if(eraReady(e)&&e!==curEra){ curEra=e; applyEraNations(e); } return curEra; }
// Una época se puede elegir si alguna nación tiene abierto ese rango
function syncEraOpen(){ const out=[]; for(const e of eraList()) PROG.eraOpen[e]=eraPlayable(e)?1:0;
  return out; }
// Respaldo: las batallas jugadas nunca bajan, así que si lo que se va a guardar tiene menos que lo guardado, lo viejo se copia a <clave>#copia
const progBat=P=>P?((P.stats&&P.stats.battles)||0)+Object.keys(P.camp||{}).length+Object.keys(P.owned||{}).length*.01:0;
const progLS=k=>{ try{ const P=JSON.parse(localStorage.getItem(k)||'null'); return P&&P.v===PROG_V?P:null; }catch(e){ return null; } };
function saveProg(){ if(!PROG) return; PROG.era=curEra; PROG.t=Date.now();
  try{ const old=progLS(PROG_KEY), cp=progLS(PROG_KEY+'#copia'); if(old&&progBat(old)>progBat(PROG)+.5&&progBat(old)>progBat(cp)) localStorage.setItem(PROG_KEY+'#copia',JSON.stringify(old)); }catch(e){}
  try{ localStorage.setItem(PROG_KEY,JSON.stringify(PROG)); }catch(e){}
  if(typeof nubeGuardar==='function') nubeGuardar(); }
// Épocas que se abrieron recién (ya no pasa: se abren por fecha)
function checkEraUnlock(){ const out=syncEraOpen(); if(out.length) saveProg(); return out; }
// Lo que se está investigando en una nación: el elegido (si todavía se puede) o el primero investigable en orden de rango
// (primero de la puerta de entrada para arriba; los rangos de antes, al final)
function nextResearch(n){ const t=PROG.target[n]; if(t&&VEH[t]&&canResearch(t)) return t;
  const L=eraList(), ord=L.filter(e=>e>=RANK_ENTRY).concat(L.filter(e=>e<RANK_ENTRY).reverse());
  for(const e of ord){ const k=vehTreeE(n,e).find(canResearch); if(k) return k; } return null; }
function setResearch(k){ if(canResearch(k)){ PROG.target[VEH[k].nation]=k; saveProg(); } }
// Comprar un tanque investigado con Yaguaretés; entra al garaje si hay lugar
function buyTank(k){ if(!researched(k)||owned(k)) return false; const c=ypCost(k); if((PROG.yp||0)<c) return false;
  PROG.yp-=c; PROG.owned[k]=1; const g=garRef(VEH[k].nation,eraOf(k)); if(g.length<3&&!g.includes(k)) g.push(k); saveProg(); return true; }
const garageOf=n=>garRef(n).filter(k=>owned(k)&&VEH[k]);
const garageBR=n=>Math.max(...garageOf(n).map(k=>VEH[k].br),1);
// Emparejamiento: vehículos de la nación con BR dentro de ±1.0 del de la batalla (si no hay, los más cercanos)
function mmLineup(n,br){ const T=vehLine(n); let c=T.filter(k=>Math.abs(VEH[k].br-br)<=1.0);
  if(c.length<2) c=T.slice().sort((a,b)=>Math.abs(VEH[a].br-br)-Math.abs(VEH[b].br-br)).slice(0,2); return shuffle(c).slice(0,3); }
// Suma PI al tanque que se investiga en esa nación; lo que sobra pasa al siguiente. Devuelve los tanques investigados (falta comprarlos).
function addRP(n,rp){ const out=[]; let left=rp;
  while(left>0){ const k=nextResearch(n); if(!k) break; const have=PROG.rp[k]||0, need=rpCost(k)-have;
    if(left>=need){ PROG.unlocked[k]=1; delete PROG.rp[k]; if(PROG.target[n]===k) delete PROG.target[n]; left-=need; out.push(k); }
    else { PROG.rp[k]=have+left; left=0; } }
  saveProg(); return out; }
// Premio de una batalla según el rango más alto que usaste: los tanques viejos dan menos
// Estilo WT: si usaste tanques de un rango más bajo que el que investigás, los PI rinden 20 % menos por rango de diferencia (mínimo 40 %)
const rpLowK=(used,target)=>!target?1:Math.max(.4,1-.2*Math.max(0,rankOf(target)-used));
function battleReward(rank,win,score){ const K=RANK_K[rank]||1;
  return {rp:Math.round(((win?450:250)+score*2.5)*K*ECON.rp), yp:Math.round(((win?1700:900)+score*5)*K*ECON.yp/10)*10}; }
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
  nieve:{n:'Nevada',sky:0xc9ced2,fog:[60,260],hemi:.72,sun:.35,sunCol:0xdfe6f0,rain:.9,snow:true,see:.65},
  tormenta:{n:'Tormenta nocturna',sky:0x11161b,fog:[40,200],hemi:.2,sun:.14,sunCol:0x8ea4d8,rain:1.6,mud:true,night:true,storm:true,see:.45}};
let WX=WXS.dia, wxKey='dia';
function pickWeather(){ const L=typeof builtKey!=='undefined'&&WORLDS[builtKey]&&WORLDS[builtKey].wxs; if(L) return L[(Math.random()*L.length)|0]; // mapas con su propio clima (invierno en las Ardenas)
  const r=Math.random(); return r<.4?'dia':r<.55?'tarde':r<.7?'noche':r<.8?'niebla':r<.93?'lluvia':'tormenta'; }
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
const available=(crew,key)=>usesOf(crew,key)<usesLim(crew,key)&&costOf(crew,key)<=crew.sp;
const canSpawn=crew=>crew.lineup.some(k=>available(crew,k));
function zoneSpawn(Z,team){
  if(nodes){const n=nearestNode(Z.x,Z.z);return {x:n.p.x,z:n.p.z};}
  const b=W.sp[team][0], dx=b.x-Z.x, dz=b.z-Z.z, d=Math.hypot(dx,dz)||1;
  return {x:Z.x+dx/d*Z.r*.7,z:Z.z+dz/d*Z.r*.7};
}
function spawnPoints(team){
  // solo desde las bases propias (pedido de Sebastián): los puntos capturados ya no sirven para reaparecer
  return W.sp[team].map(s=>({...s}));
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
const bldOf=h=>(h.object.userData.bIdx&&buildings[h.object.userData.bIdx[h.instanceId]])||((h.object===wallsIM||h.object===roofsIM||h.object===gablesIM)&&buildings[h.instanceId])||null;

