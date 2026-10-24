/* ---------- Batallas siempre online: salas abiertas por época y BR (emparejamiento con Firestore) ----------
   "¡A la batalla!" busca partidas de tu época con BR parecido (±1.0) que tengan lugar. Si hay, te avisa y elegís unirte o empezar
   una nueva; si no hay, tu PC abre una: arranca enseguida con bots y los que lleguen reemplazan bots, alternando bandos.
   Cada sala se anuncia en salas/<código> ({c, p, e, br, m, n, t}: código, peer del anfitrión, época, BR, mapa, jugadores, último aviso)
   y se refresca cada 20 s. Si el anfitrión se va, otro jugador sigue la partida (relevo.js) y actualiza el anuncio.
   Sin conexión con Firestore se juega igual, con bots. El juego en sí es P2P (16-online.js). Reglas de Firestore: ver LEEME.md. */
const SALA_VIVA=75e3, SALA_CADA=20e3, SALA_BR=1, SALA_SIGUE=20;
const sala={timer:0,busca:false};
const salasCol=()=>firebase.firestore().collection('salas');
const salaN=()=>1+net.conns.filter(c=>c.ready).length;
function salaPublicar(){
  if(!nube.on||!net.on||!net.host||!net.quick||!net.peer) return;
  salasCol().doc(net.code).set({c:net.code,p:net.peer.id,e:curEra,br:battleBR||garageBR(chosenNation),m:builtKey||'',n:salaN(),t:firebase.firestore.FieldValue.serverTimestamp()}).catch(e=>console.warn('sala',e));
}
function salaAbrir(){ clearInterval(sala.timer); salaPublicar(); sala.timer=setInterval(salaPublicar,SALA_CADA); }
function salaCerrar(){
  clearInterval(sala.timer); sala.timer=0;
  if(nube.on&&net.host&&net.quick&&net.code&&net.peer) salasCol().doc(net.code).set({c:net.code,p:net.peer.id,e:curEra,br:1,m:'',n:0,t:firebase.firestore.FieldValue.serverTimestamp()}).catch(()=>{});
}
// Salas vivas de la época con BR parecido y lugar libre: primero las de BR más cercano y después las más llenas
async function salasAbiertas(){
  const br=garageBR(chosenNation), q=await salasCol().where('e','==',curEra).get(), ahora=Date.now();
  return q.docs.map(d=>d.data()).filter(s=>s.t&&s.p&&ahora-s.t.toMillis()<SALA_VIVA&&s.n>0&&s.n<MAX_GUESTS+1&&Math.abs(s.br-br)<=SALA_BR&&s.c!==net.code)
    .sort((a,b)=>Math.abs(a.br-br)-Math.abs(b.br-br)||b.n-a.n);
}
function salaPanel(h){ lobbyShell(); $('panel').innerHTML=`<div class="side" style="width:min(560px,96vw)"><h1 class="logo" style="font-size:46px!important">Batalla online</h1>${h}</div>`; }
function salaMsg(t){ salaPanel(`<p>${esc(t)}</p><button class="go alt" id="lbQuit">Cancelar</button>`); $('lbQuit').onclick=()=>{ sala.busca=false; mainMenu(); }; }
// Sin servidor de salas: batalla con bots en esta PC
function jugarSolo(msg){ sala.busca=false; startBattle(false); if(msg) setTimeout(()=>banner('Partida sin conexión',msg,4),400); }
async function jugarOnline(){
  if(sala.busca) return;
  if(!nube.on){ jugarSolo('No se pudo conectar al servidor de partidas: jugás con bots.'); return; }
  sala.busca=true; salaMsg(`Buscando partidas de ${ERAS[curEra]?ERAS[curEra].n:'tu época'} con BR ${brTxt(garageBR(chosenNation))}…`);
  let L;
  try{ L=await Promise.race([salasAbiertas(),new Promise((_,no)=>setTimeout(()=>no(new Error('tiempo')),8000))]); }
  catch(e){ console.warn(e); jugarSolo('No se pudo conectar al servidor de partidas: jugás con bots.'); return; }
  if(!sala.busca) return;
  if(!L.length){ salaMsg('No hay partidas abiertas de tu BR: armando una. Los que busquen partida van a entrar a la tuya.'); salaNueva(); return; }
  const s=L[0], W0=WORLDS[s.m];
  salaPanel(`<p>Hay ${L.length===1?'una partida en curso':L.length+' partidas en curso'} de tu BR.</p>
    <p><b>${W0?esc(W0.label):'Batalla'}</b> · ${s.n} ${s.n===1?'jugador':'jugadores'} · BR ${brTxt(s.br)}</p>
    <p class="s">Si te unís, tomás el lugar de un bot (en el bando que tenga menos jugadores) y entrás en el momento en que está la batalla. Tu nación y tu garaje quedan fijos hasta que termine.</p>
    <button class="go" id="slUnir">Unirme</button><button class="go alt" id="slNueva">Empezar una nueva</button><button class="go alt" id="lbQuit">Cancelar</button>`);
  $('slUnir').onclick=()=>salaUnir(L,0); $('slNueva').onclick=()=>{ salaMsg('Armando una partida nueva…'); salaNueva(); };
  $('lbQuit').onclick=()=>{ sala.busca=false; mainMenu(); };
}
function salaUnir(L,i){
  if(!sala.busca) return;
  if(i>=L.length){ salaMsg('Las partidas se llenaron o se cerraron: armando una nueva.'); salaNueva(); return; }
  salaMsg(`Entrando a la partida (${L[i].n} jugando)…`);
  netJoin(L[i].c,()=>salaUnir(L,i+1),true,L[i].p);
}
function salaNueva(){ sala.busca=false; netHost(true); }
// El anfitrión sigue solo con el próximo mapa al terminar la batalla
function salaSeguir(){
  if(!net.host||!net.quick) return; let s=SALA_SIGUE; const b=$('again'); if(!b) return;
  const tick=()=>{ if(state!=='summary'||!net.on||$('again')!==b) return; if(s<=0){ b.click(); return; } b.textContent=`Siguiente batalla en ${s} s · Seguir ahora`; s--; setTimeout(tick,1000); };
  tick();
}
