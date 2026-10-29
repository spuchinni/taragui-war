/* ---------- Mapas, nombre y cámara del espectador (pedidos de Sebastián) ----------
   - Mapas sin repetir: "Al azar" saca del mazo de la época y no repite hasta haberlos jugado todos; el mazo queda guardado
     en el navegador (tw2_mapbag), así no vuelve a empezar cada vez que se abre el juego.
   - Elegir el mapa: botón "Mapa" en el hangar. Online, si elegiste uno, busca partidas en ese mapa y si no hay arma una.
   - Nombre: sin cuenta, antes de la primera batalla online pide un nombre (y se cambia en Ajustes).
   - Espectador: si nadie toca los controles, la cámara hace sola de "director": acerca y aleja la vista aérea
     y cada tanto sigue de cerca al tanque que está peleando. */
const MAPBAG_KEY='tw2_mapbag', MAPSEL_KEY='tw2_mapsel';
try{ const m=localStorage.getItem(MAPSEL_KEY); if(m&&(m==='rand'||WORLDS[m])) chosenMap=m; }catch(e){}
nextRandomMap=function(e=curEra){
  let B={}; try{ B=JSON.parse(localStorage.getItem(MAPBAG_KEY)||'{}')||{}; }catch(_){}
  let bag=(B[e]||[]).filter(k=>WORLDS[k]&&(WORLDS[k].era||5)===e&&!WORLDS[k].noRandom);
  if(!bag.length){ bag=shuffle(eraMaps(e)); if(bag.length>1&&bag[bag.length-1]===B['u'+e]) bag.unshift(bag.pop()); }   // el primero del mazo nuevo no repite el último
  const k=bag.pop(); B[e]=bag; B['u'+e]=k; try{ localStorage.setItem(MAPBAG_KEY,JSON.stringify(B)); }catch(_){}
  return k; };
const mapSel=()=>chosenMap!=='rand'&&WORLDS[chosenMap]&&(WORLDS[chosenMap].era||5)===curEra?chosenMap:'rand';
function setMap(k){ chosenMap=k; try{ localStorage.setItem(MAPSEL_KEY,k); }catch(e){} }

// ---- hangar: botón "Mapa" y la lista para elegir ----
const _rh=renderHangar; renderHangar=function(){ const r=_rh.apply(this,arguments); const go=document.querySelector('.hgGo'), md=go&&go.querySelector('.hgModes');
  if(md&&['battle','watch'].includes(playMode)){ const m=mapSel(); md.insertAdjacentHTML('beforebegin',`<button class="hgMapB" id="hgMapB" title="Elegir el mapa">🗺 Mapa: <b>${m==='rand'?'al azar, sin repetir':esc(WORLDS[m].label)}</b></button>`);
    $('hgMapB').onclick=hgMaps; }
  return r; };
function hgMaps(){ const box=$('hgModal'); if(!box) return; const cur=mapSel();
  const rows=[`<button class="camM${cur==='rand'?' ok':''}" data-k="rand"><span class="n">🎲</span><b>Al azar, sin repetir</b><small>Pasa por todos los mapas de la época antes de repetir uno</small></button>`]
    .concat(eraMaps(curEra).map((k,i)=>`<button class="camM${cur===k?' ok':''}" data-k="${k}"><span class="n">${i+1}</span><b>${esc(WORLDS[k].label)}</b><small>${esc((WORLDS[k].desc||'').slice(0,120))}${(WORLDS[k].desc||'').length>120?'…':''}</small></button>`));
  box.innerHTML=`<div class="hgM camW"><h2>Mapa · ${ERAS[curEra]?ERAS[curEra].n:''}</h2><p class="s">Elegí dónde pelear. Online buscamos una partida en ese mapa; si no hay, armamos una.</p>
    <div class="camL">${rows.join('')}</div><button class="go alt" id="mClose" style="margin:8px 0 0">Cerrar</button></div>`;
  $('mClose').onclick=()=>{ box.innerHTML=''; };
  box.querySelectorAll('.camM').forEach(b=>b.onclick=()=>{ setMap(b.dataset.k); box.innerHTML=''; renderHangar(); }); }

// ---- online: con un mapa elegido, solo partidas en ese mapa ----
{ const _sa=salasAbiertas; salasAbiertas=async function(){ const L=await _sa(), m=mapSel(); return m==='rand'?L:L.filter(s=>s.m===m); }; }

// ---- nombre del jugador sin cuenta ----
{ const _jo=jugarOnline; jugarOnline=function(){ if(netName) return _jo.apply(this,arguments);
    salaPanel(`<h2>¿Cómo te llamás?</h2><p class="s">Es el nombre que ven los demás jugadores. Lo podés cambiar en Ajustes.</p>
      <input id="nmIn" class="txt" maxlength="16" placeholder="Ej.: Seba" autocomplete="nickname"><div class="note" id="nmErr"></div>
      <button class="go" id="nmOk">¡A la batalla!</button><button class="go alt" id="lbQuit">Cancelar</button>`);
    const inp=$('nmIn'); setTimeout(()=>inp.focus(),50);
    const ok=()=>{ const n=cleanName(inp.value); if(n.length<2){ $('nmErr').textContent='Poné al menos 2 letras'; $('nmErr').style.color='var(--enemy)'; return; }
      netName=n; try{ localStorage.setItem('tw-name',n); }catch(e){} _jo(); };
    $('nmOk').onclick=ok; inp.onkeydown=e=>{ if(e.key==='Enter') ok(); }; $('lbQuit').onclick=()=>mainMenu(); }; }
{ const _rs=renderSettings; renderSettings=function(){ const r=_rs.apply(this,arguments); const h=document.querySelector('#panel h2');
    if(h&&!$('setName')){ h.insertAdjacentHTML('beforebegin',`<h2>Tu nombre</h2><input id="setName" class="txt" maxlength="16" placeholder="Ej.: Seba" value="${esc(netName)}" style="max-width:260px">`);
      $('setName').oninput=e=>{ netName=cleanName(e.target.value); try{ localStorage.setItem('tw-name',netName); }catch(_){} }; }
    return r; }; }

// ---- espectador: director automático cuando nadie toca nada ----
const dir={last:performance.now(),on:false,ph:0,t:0};
for(const ev of ['keydown','mousedown','wheel','touchstart']) document.addEventListener(ev,()=>{ dir.last=performance.now(); if(dir.on) dirOff(); },{passive:true,capture:true});
function dirOff(){ dir.on=false; chaseK=1; }
// el tanque más metido en la pelea: el que disparó hace menos tiempo (o el más cercano a un enemigo)
function dirPick(){ const L=tanks.filter(t=>!t.dead&&!t.T.static).sort((a,b)=>a.team-b.team); if(!L.length) return -1;
  let best=0,bs=-1e9; L.forEach((t,i)=>{ const f=t.firedT!=null?-(now-t.firedT):-1e6; let d=1e9; for(const e of L) if(e.team!==t.team) d=Math.min(d,e.pos.distanceTo(t.pos)); const s=f*.5-d*.05+Math.random()*3; if(s>bs){bs=s;best=i;} });
  return best; }
{ const _sc=spectatorCam; spectatorCam=function(dt){
    if(state==='spectate'&&performance.now()-dir.last>6000){
      if(!dir.on){ dir.on=true; dir.ph=0; dir.t=0; aerial=true; }
      dir.t+=dt;
      if(dir.ph===0){ aer.zoom=.3+.95*(.5+.5*Math.cos(dir.t*Math.PI/12));                                      // del aire: se acerca de a poco y se vuelve a alejar
        if(dir.t>24){ const i=dirPick(); dir.t=0; if(i>=0){ specIdx=i; aerial=false; dir.ph=1; } } }
      else { chaseK=.75+1.3*(.5-.5*Math.cos(dir.t*.45)); if(dir.t>14){ aerial=true; chaseK=1; dir.ph=0; dir.t=0; } }   // de cerca, siguiendo al que pelea: se aleja y se acerca
    } else if(dir.on) dirOff();
    return _sc(dt); }; }
