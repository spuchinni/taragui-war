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
  s.onload=async()=>{ try{ await window.CrazyGames.SDK.init(); CG.sdk=window.CrazyGames.SDK; CG.ready=CG.sdk.environment!=='disabled'; cgCall(S=>S.game.loadingStart()); cgSync(); cgMute(); cgLocale();
      if(state!=='intro') cgCall(S=>S.game.loadingStop()); }catch(e){ console.warn('crazygames init',e); } };
  s.onerror=()=>console.warn('crazygames: no se pudo cargar el SDK (bloqueador de anuncios): el juego sigue igual');
  document.head.appendChild(s);
  // sin portada: directo al menú
  { const _cs=coverStart; coverStart=function(){ _cs.apply(this,arguments); setTimeout(()=>{ const c=document.getElementById('iCover'); if(c) c.click(); cgCall(S=>S.game.loadingStop()); },50); }; }
  // sin inicio de sesión externo
  { const _nc=nubeChip; nubeChip=function(){ _nc.apply(this,arguments); const b=$('acctB'); if(b) b.hidden=true; }; }
  // gameplayStart / gameplayStop cuando se entra o se sale de la batalla
  { const _fr=frame; frame=function(dt){ _fr(dt); if(typeof master!=='undefined'&&master) master.gain.value=CG.mute?0:volMaster; const p=state==='play'&&!CG.adOn;
      if(p!==CG.playing){ CG.playing=p; cgCall(S=>p?S.game.gameplayStart():S.game.gameplayStop()); } }; }
  // Sin pantalla completa propia (requisito de CrazyGames: el sitio la da y un botón propio interfiere con los anuncios):
  // se esconde el botón y la opción de Ajustes, se saca la acción de la tecla P y enterFS/toggleFS no hacen nada.
  { const st=document.createElement('style'); st.textContent='body.crazy #fsBtn{display:none!important} body.crazy label.chk:has(#fsC){display:none}';
    document.head.appendChild(st); enterFS=function(){}; toggleFS=function(){}; fsAuto=false;
    const i=ACTIONS.findIndex(a=>a[0]==='fullscreen'); if(i>=0) ACTIONS.splice(i,1); }
  // PEGI 12 (público de 13 años en adelante): sin sangre ni desmembramientos, los soldados caen y nada más,
  // y los civiles y los animales no mueren: se asustan y se van corriendo. Sin puntos ni castigo por "Civil abatido".
  { bloodMat.visible=false;
    const _df=infDeathFx; infDeathFx=function(P,how){ return _df.call(this,P,how==='blast'||how==='crush'?'shot':how); };
    const _ki=killInf; killInf=function(P,by,how){
      if(P&&isCiv(P)&&!P.dead){ P.flee=true; P.cower=0; P.supT=now+rand(3,6);
        const o=by&&by.pos?by.pos:P.pos, dx=P.pos.x-o.x, dz=P.pos.z-o.z, d=Math.hypot(dx,dz)||1, a=d<.01?rand(0,6.28):0;
        P.goal=d<.01?{x:P.pos.x+Math.cos(a)*12,z:P.pos.z+Math.sin(a)*12}:{x:P.pos.x+dx/d*12,z:P.pos.z+dz/d*12}; return; }
      return _ki.apply(this,arguments); };
    const _aw=award; award=function(c,name){ if(typeof name==='string'&&name.startsWith('Civil abatido')) return; return _aw.apply(this,arguments); }; }
}
// Idioma según el locale del SDK (requisito de CrazyGames). Solo si el jugador no eligió idioma y todavía no está jugando:
// I18N.set guarda la elección y recarga una sola vez (casi siempre coincide con el idioma del navegador y no hace falta).
function cgLocale(){ cgCall(S=>{ if(!window.I18N||!I18N.auto) return; const si=S.user&&S.user.systemInfo, loc=si&&si.locale; if(!loc) return;
  const want=/^es\b/i.test(loc)?'es':'en'; if(want!==I18N.lang&&(state==='intro'||state==='menu')) I18N.set(want); }); }
// Progreso con el Data Module del SDK (CrazyGames lo pide para guardar: queda asociado a la cuenta de CrazyGames y entre
// dispositivos). Se guardan el progreso y unas pocas preferencias; gana el progreso con más batallas (progBat) y la primera
// vez se copia lo que ya había en el navegador. https://docs.crazygames.com/sdk/html5-v3/data
const CG_KEYS=['tw2_progress','tw2_lang','tw2_arranque','tw2_coach','tw-name','tw2_settings'];
function cgData(){ try{ return CG.ready&&CG.sdk&&CG.sdk.data?CG.sdk.data:null; }catch(e){ return null; } }
function cgSync(){ const D=cgData(); if(!D) return;
  try{ const rem=D.getItem('tw2_progress'), loc=localStorage.getItem('tw2_progress'); let R=null,L=null; try{ R=JSON.parse(rem||'null'); }catch(e){} try{ L=JSON.parse(loc||'null'); }catch(e){}
    if(R&&progBat(R)>progBat(L)){ localStorage.setItem('tw2_progress',rem); for(const k of CG_KEYS.slice(1)){ const v=D.getItem(k); if(v!=null) localStorage.setItem(k,v); } loadProg(); if(state==='menu') mainMenu(); }
    else for(const k of CG_KEYS){ const v=localStorage.getItem(k); if(v!=null) D.setItem(k,v); } }catch(e){ console.warn('crazygames data',e); } }
if(CG.on){ const _sp=saveProg; saveProg=function(){ const r=_sp.apply(this,arguments); const D=cgData(); if(D) try{ for(const k of CG_KEYS){ const v=localStorage.getItem(k); if(v!=null) D.setItem(k,v); } }catch(e){} return r; }; }
// silencio pedido desde CrazyGames (botón de sonido del sitio): settings.muteAudio y su aviso de cambios
function cgMute(){ cgCall(S=>{ const G=S.game; if(!G||!G.settings) return; CG.mute=!!G.settings.muteAudio;
  if(G.addSettingsChangeListener) G.addSettingsChangeListener(st=>{ CG.mute=!!(st&&st.muteAudio); }); }); }
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
