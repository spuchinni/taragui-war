/* ---------- Aviso de "hay alguien jugando" (pedido de Sebastián) ----------
   Con el juego abierto (en el menú, el hangar o jugando con bots), cada 30 s mira en Firestore las salas vivas (salas.js).
   Si aparece una partida nueva o entra alguien a una, avisa: cartel arriba a la izquierda con "Unirme", un sonidito,
   el número en la pestaña "(1) Taragüí War" y, si la pestaña está de fondo y el navegador lo permite, una notificación de Windows/Android.
   Se apaga en Ajustes. Las salas no guardan nombres (reglas de Firestore), así que dice el mapa, la época y cuántos juegan. */
const AVISO_CADA=30e3, AVISO_TITULO=document.title;
const aviso={on:true,timer:0,visto:{},vivas:[],div:null};
try{ aviso.on=localStorage.getItem('tw2_aviso')!=='0'; }catch(e){}
const avisoMapa=s=>WORLDS[s.m]?WORLDS[s.m].label:(typeof OSM_CFG!=='undefined'&&OSM_CFG[s.m]&&OSM_CFG[s.m].label)||'Batalla';
const avisoEra=s=>ERAS[s.e]?ERAS[s.e].n:'';
async function avisoMirar(){
  if(!aviso.on||!nube.on) return;
  let L;
  try{ const desde=firebase.firestore.Timestamp.fromMillis(Date.now()-SALA_VIVA);
    L=(await salasCol().where('t','>',desde).get()).docs.map(d=>d.data()).filter(s=>s.p&&s.n>0&&s.c!==net.code); }
  catch(e){ console.warn('aviso',e); return; }
  const nuevas=L.filter(s=>!aviso.visto[s.c]||s.n>aviso.visto[s.c]);
  aviso.visto={}; for(const s of L) aviso.visto[s.c]=s.n; aviso.vivas=L;
  const n=L.reduce((a,s)=>a+s.n,0); document.title=n?`(${n}) ${AVISO_TITULO}`:AVISO_TITULO;
  if(!nuevas.length) return;
  const s=nuevas.sort((a,b)=>b.n-a.n)[0], txt=`${avisoMapa(s)}${avisoEra(s)?' · '+avisoEra(s):''} · ${s.n} ${s.n===1?'jugador':'jugadores'}`;
  if(state==='play'&&!net.on){ feed(`🟢 Hay alguien jugando online: ${txt}`,'var(--ally)'); }
  else if(state!=='play') avisoCartel(s,txt);
  avisoSonido();
  if(document.hidden&&'Notification' in window&&Notification.permission==='granted'){
    try{ const N=new Notification('Taragüí War: hay alguien jugando',{body:txt,icon:'img/icono-192.png',tag:'tw-sala'}); N.onclick=()=>{ window.focus(); N.close(); }; }catch(e){} }
}
function avisoCartel(s,txt){
  if(!aviso.div){ aviso.div=document.createElement('div'); aviso.div.id='aviso'; document.body.appendChild(aviso.div); }
  const D=aviso.div, puede=!net.on&&['menu','summary'].includes(state);
  D.innerHTML=`<b>🟢 Hay alguien jugando</b><span>${esc(txt)}</span>${puede?'<button class="go" id="avUnir">Unirme</button>':''}<button class="go alt" id="avNo">✕</button>`;
  D.classList.add('on'); clearTimeout(D._t); D._t=setTimeout(()=>D.classList.remove('on'),25e3);
  $('avNo').onclick=()=>D.classList.remove('on');
  if(puede) $('avUnir').onclick=()=>{ D.classList.remove('on'); avisoUnir(s); };
}
// Unirse a esa partida: cambia a su época si está abierta y entra directo (sin el filtro de BR de "¡A la batalla!")
function avisoUnir(s){
  if(s.e!==curEra){ if(!(eraPlayable(s.e)&&PROG.eraOpen[s.e])){ banner('No podés entrar',`Esa partida es de ${avisoEra(s)||'otra época'}, que no tenés abierta`,4); return; }
    curEra=s.e; applyEraNations(s.e); saveProg(); }
  if(!netName){ jugarOnline(); return; } // primero pide el nombre
  sala.busca=true; salaUnir([s],0);
}
function avisoSonido(){ try{ initAudio(); if(!AC) return; const t=AC.currentTime;
  for(const [f,d] of [[660,0],[880,.16]]){ const o=AC.createOscillator(), g=AC.createGain(); o.type='triangle'; o.frequency.value=f;
    g.gain.setValueAtTime(.0001,t+d); g.gain.linearRampToValueAtTime(.12,t+d+.02); g.gain.exponentialRampToValueAtTime(.0001,t+d+.3); o.connect(g).connect(master); o.start(t+d); o.stop(t+d+.32); } }catch(e){} }
function avisoArrancar(){ clearInterval(aviso.timer); aviso.timer=0; if(!aviso.on) return; setTimeout(avisoMirar,4e3); aviso.timer=setInterval(avisoMirar,AVISO_CADA); }
avisoArrancar();
// Ajustes: prender o apagar el aviso y permitir las notificaciones del sistema
{ const _rs=renderSettings; renderSettings=function(){ const r=_rs.apply(this,arguments); const h=document.querySelector('#panel h2');
    if(h&&!$('setAviso')){ const np='Notification' in window, ok=np&&Notification.permission==='granted';
      h.insertAdjacentHTML('beforebegin',`<h2>Avisos</h2><label class="s"><input type="checkbox" id="setAviso" ${aviso.on?'checked':''}> Avisarme cuando hay alguien jugando online</label>
        ${np?`<button class="go alt" id="setNotif" style="max-width:320px">${ok?'Notificaciones del sistema: activadas':'Activar notificaciones del sistema'}</button>`:''}`);
      $('setAviso').onchange=e=>{ aviso.on=e.target.checked; try{ localStorage.setItem('tw2_aviso',aviso.on?'1':'0'); }catch(_){} if(!aviso.on) document.title=AVISO_TITULO; avisoArrancar(); };
      if(np) $('setNotif').onclick=async()=>{ const p=await Notification.requestPermission(); $('setNotif').textContent=p==='granted'?'Notificaciones del sistema: activadas':'El navegador las bloqueó'; }; }
    return r; }; }
