/* ---------- CrazyGames (pedido de Sebastián: publicar y ganar con publicidad) ----------
   Solo actúa con PLATAFORMA.id==='crazygames' (plataforma.js); en GitHub Pages no hace nada.
   - SDK v3 (https://docs.crazygames.com/sdk/intro/): loadingStart/Stop, gameplayStart/Stop según el estado del juego.
   - Anuncio entre partidas (midgame) al terminar cada batalla, con el sonido suspendido mientras se ve (el SDK limita a uno cada 3 min).
   - Anuncio con premio (opcional, PLATAFORMA.premio): en el resumen, "📺 Duplicar los Yaguaretés"; sin anuncio no se premia.
   - Reglas de CrazyGames: sin inicio de sesión externo (se esconde Google/mail; el progreso queda en el navegador),
     sin portada "Hacé clic" (el sitio ya tiene su botón de jugar), sin anuncios que no sean del SDK. */
const CG={on:PLATAFORMA&&PLATAFORMA.id==='crazygames',sdk:null,ready:false,playing:false,adOn:false,noAds:false};
function cgCall(f){ try{ if(CG.ready) f(CG.sdk); }catch(e){ console.warn('crazygames',e); } }
if(CG.on){
  document.body.classList.add('crazy');
  const s=document.createElement('script'); s.src='https://sdk.crazygames.com/crazygames-sdk-v3.js';
  s.onload=async()=>{ try{ await window.CrazyGames.SDK.init(); CG.sdk=window.CrazyGames.SDK; CG.ready=CG.sdk.environment!=='disabled'; cgCall(S=>S.game.loadingStart());
      if(state!=='intro') cgCall(S=>S.game.loadingStop()); }catch(e){ console.warn('crazygames init',e); } };
  s.onerror=()=>console.warn('crazygames: no se pudo cargar el SDK (bloqueador de anuncios): el juego sigue igual');
  document.head.appendChild(s);
  // sin portada: directo al menú
  { const _cs=coverStart; coverStart=function(){ _cs.apply(this,arguments); setTimeout(()=>{ const c=document.getElementById('iCover'); if(c) c.click(); cgCall(S=>S.game.loadingStop()); },50); }; }
  // sin inicio de sesión externo
  { const _nc=nubeChip; nubeChip=function(){ _nc.apply(this,arguments); const b=$('acctB'); if(b) b.hidden=true; }; }
  // gameplayStart / gameplayStop cuando se entra o se sale de la batalla
  { const _fr=frame; frame=function(dt){ _fr(dt); const p=state==='play'&&!CG.adOn;
      if(p!==CG.playing){ CG.playing=p; cgCall(S=>p?S.game.gameplayStart():S.game.gameplayStop()); } }; }
}
// sonido apagado y juego quieto mientras corre un anuncio
function cgAd(kind,onOk,onFail){
  if(!CG.ready||CG.noAds){ if(onFail) onFail({code:'adsDisabled'}); return; }
  cgCall(S=>S.ad.requestAd(kind,{
    adStarted:()=>{ CG.adOn=true; try{ if(AC) AC.suspend(); }catch(e){} },
    adFinished:()=>{ CG.adOn=false; try{ if(AC) AC.resume(); }catch(e){} if(onOk) onOk(); },
    adError:e=>{ CG.adOn=false; try{ if(AC) AC.resume(); }catch(_){} if(e&&(e.code==='adsDisabled'||e.code==='adblock')) CG.noAds=true; if(onFail) onFail(e); } }));
}
if(CG.on){
  { const _sum=summary; summary=function(winner){ const y0=PROG?PROG.yp||0:0; _sum.apply(this,arguments); const won=(PROG?PROG.yp||0:0)-y0;
      // fin de la batalla: pausa lógica para el anuncio; el botón con premio aparece recién cuando ese anuncio termina (no dos a la vez)
      const ofrecer=()=>{ if(!PLATAFORMA.premio||!CG.ready||won<=0||CG.noAds||net.guest||state!=='summary'||$('cgPremio')) return; const a=$('again'); if(!a) return;
        a.insertAdjacentHTML('beforebegin',`<button class="go alt" id="cgPremio">📺 Mirá un anuncio: +${ypTxt(won)} ${YP} (duplicás lo ganado)</button>`);
        const b=$('cgPremio'); b.onclick=()=>{ b.disabled=true; b.textContent='Cargando el anuncio…';
          cgAd('rewarded',()=>{ PROG.yp=(PROG.yp||0)+won; saveProg(); b.textContent=`✔ ¡Premio! +${ypTxt(won)} ${YP} · tenés ${ypTxt(PROG.yp)}`; banner('¡Premio!',`+${ypTxt(won)} ${YP}`,2.5); },
            e=>{ b.textContent=e&&e.code==='adCooldown'?'Probá en un rato':'Anuncio no disponible'; }); }; };
      cgAd('midgame',ofrecer,ofrecer); }; }
  // un festejo del sitio cuando se compra un tanque nuevo (logro grande, con moderación)
  { const _bt=buyTank; buyTank=function(k){ const ok=_bt.apply(this,arguments); if(ok) cgCall(S=>S.game.happytime()); return ok; }; }
}
