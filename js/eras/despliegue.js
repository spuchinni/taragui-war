/* ---------- Despliegue estilo War Thunder (25/11/2026, pedido de Sebastián: "antes que tanto dato del tanque, que me muestre el mapa más grande
   y que pueda elegir la munición con la que voy a salir; si paso el puntero por el tanque, que me muestre sus características") ----------
   Reemplaza renderDeploy: a la izquierda los tanques en tarjetas chicas (miniatura, nombre, costo y salidas que quedan; la ficha completa sale
   al pasar el mouse, vficha), debajo la munición del tanque elegido (− / + por tipo, se guarda en PROG.load como el botón del garaje);
   a la derecha el mapa grande (foto desde arriba) con los puntos, los tanques aliados, las bases enemigas y las propias para elegir dónde salir. */
(()=>{
  const EN=()=>window.LANG==='en', T2=(es,en)=>EN()?en:es;
  const totOf=V=>V.auto?Math.round(V.auto.mag*14):(V.ammoCap||(V.hp>=130?42:V.hp>=90?36:30));
  const unl=(k,i)=>typeof ammoUnlocked==='function'?ammoUnlocked(k,i):true;
  function loadCur(k){ const V=VEH[k], L=V.ammo||[], tot=totOf(V), s=PROG&&PROG.load&&PROG.load[k];
    if(s&&s.length===L.length) return s.map((n,i)=>unl(k,i)?n|0:0);
    const sh=L.length===1?[1]:L.length===2?[.6,.4]:[.5,.3,.2], w=sh.map((x,i)=>unl(k,i)?x:0), sw=w.reduce((a,b)=>a+b,0)||1; return w.map(x=>Math.round(tot*x/sw)); }
  function ammoHTML(k){ const V=VEH[k], L=V.ammo||[]; if(!L.length) return ''; const cur=loadCur(k), tot=totOf(V), used=cur.reduce((a,b)=>a+b,0);
    return `<div class="dpAm"><div class="dpH">${T2('Munición','Ammunition')} <small>${used} / ${tot}</small></div>${L.map((A,i)=>{ const op=unl(k,i);
      return `<div class="dpAr${op?'':' off'}"><span class="dpAn"><b>${A.n}</b><small>${(typeof KIND_ES!=='undefined'&&KIND_ES[A.kind])||A.kind} · ${A.pen} mm</small></span>
        ${op?`<button data-am="-${i}">−</button><b class="dpAc">${cur[i]}</b><button data-am="+${i}">+</button>`:`<span class="dpLk">🔒 ${T2('en Mejoras','in Upgrades')}</span>`}</div>`; }).join('')}</div>`; }
  function ammoStep(k,i,d){ const V=VEH[k], tot=totOf(V), cur=loadCur(k);
    if(d<0){ if(cur[i]<=0) return; cur[i]--; }
    else if(cur.reduce((a,b)=>a+b,0)<tot) cur[i]++;
    else { const j=cur.findIndex((n,x)=>x!==i&&n>0&&unl(k,x)); if(j<0) return; cur[j]--; cur[i]++; }
    PROG.load=PROG.load||{}; PROG.load[k]=cur; saveProg(); }

  // ---- mapa ----
  let MP=null;
  function drawMap(cv){ const c=playerCrew; if(!cv||!W) return; const S=cv.width, x=cv.getContext('2d');
    if(!mmBg) try{ buildMinimapBg(); }catch(e){}
    x.fillStyle='#2a2e22'; x.fillRect(0,0,S,S); if(mmBg) x.drawImage(mmBg,0,0,S,S);
    const k=S/(Math.max(W.bx,W.bz)*2+20), tx=v=>S/2-v*k, tz=v=>S/2-v*k;
    for(const Z of zones){ const col=Z.owner===1?'#4f8fd8':Z.owner===-1?'#d8503e':'#d8d2bc';
      x.beginPath(); x.arc(tx(Z.x),tz(Z.z),Math.max(9,Z.r*k),0,6.283); x.fillStyle=col+'44'; x.fill(); x.lineWidth=2; x.strokeStyle=col; x.stroke();
      x.font='700 18px "Saira Condensed",Arial'; x.textAlign='center'; x.textBaseline='middle'; x.fillStyle='#111'; x.fillText(Z.id,tx(Z.x)+1,tz(Z.z)+1); x.fillStyle='#fff'; x.fillText(Z.id,tx(Z.x),tz(Z.z)); }
    for(const t of tanks){ if(t.dead||t.team!==0||(t.T&&t.T.static)) continue; x.beginPath(); x.arc(tx(t.pos.x),tz(t.pos.z),4,0,6.283); x.fillStyle='#7fc4ff'; x.fill(); x.lineWidth=1; x.strokeStyle='#0b1a2a'; x.stroke(); }
    for(const p of (W.sp&&W.sp[1])||[]){ x.fillStyle='#d8503e'; x.strokeStyle='#2a0d08'; x.lineWidth=2; const X=tx(p.x),Y=tz(p.z); x.beginPath(); x.moveTo(X,Y-9); x.lineTo(X+9,Y+7); x.lineTo(X-9,Y+7); x.closePath(); x.fill(); x.stroke(); }
    MP={pts:spawnPoints(0).map((p,i)=>({i,X:tx(p.x),Y:tz(p.z),label:p.label}))};
    for(const p of MP.pts){ const on=p.i===selSp; x.beginPath(); x.arc(p.X,p.Y,on?13:10,0,6.283); x.fillStyle=on?'#e8d9a0':'#4f8fd8'; x.fill(); x.lineWidth=3; x.strokeStyle=on?'#1a1610':'#0b1a2a'; x.stroke();
      x.font='700 14px "Saira Condensed",Arial'; x.textAlign='center'; x.fillStyle='#fff'; x.strokeStyle='#000'; x.lineWidth=3; x.strokeText(p.label,p.X,p.Y-20); x.fillText(p.label,p.X,p.Y-20); } }

  renderDeploy=function(){
    const c=playerCrew; if(!c) return;
    if(!canSpawn(c)){
      $('panel').innerHTML=`<h1>${T2('Sin vehículos','No vehicles')}</h1><p>${T2(`Usaste todos tus tanques o no te alcanzan los puntos de reaparición (tenés ${c.sp}). La batalla sigue con tu equipo.`,`You used all your tanks or don't have enough respawn points (${c.sp}). The battle goes on with your team.`)}</p>
        <button class="go" id="spec">${T2('Ver la batalla','Watch the battle')}</button><button class="go alt" id="quit">${T2('Volver al menú','Back to menu')}</button>`;
      $('spec').onclick=goSpectate; $('quit').onclick=()=>{clearBattle();mainMenu();}; return; }
    if(!selKey||!c.lineup.includes(selKey)||!available(c,selKey)) selKey=c.lineup.find(k=>available(c,k));
    const pts=spawnPoints(0); if(selSp>=pts.length) selSp=0;
    const cards=c.lineup.map(k=>{ const V=VEH[k], cost=costOf(c,k), u=usesOf(c,k), mx=usesLim(c,k), off=!available(c,k);
      const tag=u>=mx?T2('Sin salidas','No sorties left'):cost===0?T2('Gratis','Free'):`${cost} pts${cost>c.sp?' · '+T2('faltan','need')+' '+(cost-c.sp):''}`;
      return `<button class="dpT${k===selKey?' on':''}${off?' off':''}" data-k="${k}"${off?' aria-disabled="true"':''}>${miniHTML(k)}<span class="dpTn">${V.label}</span>
        <span class="dpTi">${tag}${isFinite(mx)?` · ${T2('salidas','sorties')} ${u}/${mx}`:''}</span></button>`; }).join('');
    const P=$('panel'); P.classList.add('dp');
    P.innerHTML=`<div class="dpHead"><h1>${c.spawns?T2('Reaparecer','Respawn'):T2('Despliegue','Deployment')}</h1>
      <div class="dpInfo">${T2('Puntos de reaparición','Respawn points')}: <span class="sp">${c.sp}</span> · ${T2('Tickets','Tickets')}: ${allyLabel()} ${Math.max(0,Math.ceil(tickets[0]))} — ${NATIONS[foeNation].label} ${Math.max(0,Math.ceil(tickets[1]))}</div></div>
      <div class="dpWrap"><div class="dpL side"><div class="dpH">${T2('Vehículo','Vehicle')} <small>${T2('pasá el mouse para ver la ficha','hover for details')}</small></div>
        <div class="dpTs">${cards}</div>${selKey?ammoHTML(selKey):''}</div>
        <div class="dpR"><canvas id="dpMap" width="640" height="640"></canvas>
          <div class="dpSp">${pts.map((p,i)=>`<button class="dpS${i===selSp?' on':''}" data-sp="${i}">${p.label}</button>`).join('')}</div></div></div>
      <div class="dpBtns"><button class="go" id="deployBtn">${T2('Desplegar','Deploy')}</button><button class="go alt" id="specBtn">${T2('Mirar desde el aire','Watch from above')}</button><button class="go alt" id="quit">${T2('Abandonar','Leave')}</button></div>`;
    miniPedir(c.lineup); drawMap($('dpMap'));
    P.querySelectorAll('.dpT').forEach(b=>{ b.onclick=()=>{ if(b.getAttribute('aria-disabled')==='true') return; selKey=b.dataset.k; vfichaOff(); renderDeploy(); };
      b.onmouseenter=()=>{ try{ vficha(b.dataset.k,b); }catch(e){} }; b.onmouseleave=vfichaOff; });
    P.querySelectorAll('[data-am]').forEach(b=>b.onclick=()=>{ const s=b.dataset.am; ammoStep(selKey,+s.slice(1),s[0]==='-'?-1:1); renderDeploy(); });
    P.querySelectorAll('.dpS').forEach(b=>b.onclick=()=>{ selSp=+b.dataset.sp; renderDeploy(); });
    $('dpMap').onclick=e=>{ if(!MP) return; const r=e.target.getBoundingClientRect(), s=e.target.width/r.width, X=(e.clientX-r.left)*s, Y=(e.clientY-r.top)*s;
      let best=null,bd=40; for(const p of MP.pts){ const d=Math.hypot(p.X-X,p.Y-Y); if(d<bd){ bd=d; best=p; } } if(best){ selSp=best.i; renderDeploy(); } };
    $('deployBtn').onclick=()=>{ vfichaOff(); doDeploy(); lock(); };
    $('specBtn').onclick=()=>{ vfichaOff(); goSpectate(); };
    $('quit').onclick=()=>{ vfichaOff(); clearBattle(); mainMenu(); };
  };
  // el mapa se redibuja mientras elegís (los tanques aliados se mueven, los puntos cambian de dueño)
  setInterval(()=>{ if(typeof state!=='undefined'&&state==='deploy'&&$('dpMap')) drawMap($('dpMap')); },1000);
  // fuera del despliegue, el panel vuelve a ser el de siempre
  { const _mm=mainMenu; mainMenu=function(){ const P=$('panel'); if(P) P.classList.remove('dp'); vfichaOff(); return _mm.apply(this,arguments); }; }
  { const _dd=doDeploy; doDeploy=function(){ const P=$('panel'); vfichaOff(); const r=_dd.apply(this,arguments); if(P&&state==='play') P.classList.remove('dp'); return r; }; }

  const st=document.createElement('style'); st.textContent=`
  #panel.dp{max-width:1240px;width:100%}
  body.deploy #overlay{background:linear-gradient(90deg,rgba(24,22,18,.95) 0,rgba(24,22,18,.88) 70%,rgba(24,22,18,.7) 100%)}
  #panel.dp .dpHead{display:flex;align-items:flex-end;gap:24px;flex-wrap:wrap}
  #panel.dp h1{font-size:clamp(40px,6vw,72px)}
  #panel.dp .dpInfo{font-size:17px;padding-bottom:8px;opacity:.9}
  #panel.dp .dpWrap{display:flex;gap:18px;margin-top:12px;align-items:flex-start}
  #panel.dp .dpL{flex:0 0 360px;display:flex;flex-direction:column;gap:12px}
  #panel.dp .dpR{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}
  #panel.dp #dpMap{width:100%;max-width:calc(100vh - 230px);aspect-ratio:1;border:1px solid rgba(232,217,160,.35);border-radius:4px;cursor:pointer;background:#2a2e22}
  #panel.dp .dpH{font:700 18px "Saira Condensed",Arial;color:var(--khaki);text-transform:uppercase;letter-spacing:.04em}
  #panel.dp .dpH small{font-weight:400;text-transform:none;opacity:.6;margin-left:6px;letter-spacing:0}
  #panel.dp .dpTs{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  #panel.dp .dpT{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px;background:rgba(255,255,255,.05);border:1px solid rgba(232,217,160,.22);color:inherit;cursor:pointer;border-radius:4px;font:inherit}
  #panel.dp .dpT:hover{background:rgba(255,255,255,.1)}
  #panel.dp .dpT.on{border-color:var(--khaki);background:rgba(232,217,160,.16)}
  #panel.dp .dpT.off{opacity:.4;cursor:default}
  #panel.dp .dpT .vmini{width:100%;aspect-ratio:16/9;object-fit:contain}
  #panel.dp .dpTn{font:700 17px "Saira Condensed",Arial}
  #panel.dp .dpTi{font-size:12.5px;opacity:.8}
  #panel.dp .dpAm{background:rgba(0,0,0,.25);border:1px solid rgba(232,217,160,.2);border-radius:4px;padding:8px 10px}
  #panel.dp .dpAr{display:flex;align-items:center;gap:8px;margin-top:6px}
  #panel.dp .dpAr.off{opacity:.45}
  #panel.dp .dpAn{flex:1;display:flex;flex-direction:column;font-size:14px;line-height:1.2}
  #panel.dp .dpAn small{opacity:.7}
  #panel.dp .dpAr button{width:30px;height:30px;font:700 18px Arial;background:rgba(232,217,160,.15);border:1px solid rgba(232,217,160,.4);color:inherit;border-radius:3px;cursor:pointer}
  #panel.dp .dpAc{min-width:2.2em;text-align:center}
  #panel.dp .dpSp{display:flex;gap:8px;flex-wrap:wrap}
  #panel.dp .dpS{padding:6px 14px;background:rgba(255,255,255,.05);border:1px solid rgba(232,217,160,.25);color:inherit;font:600 16px "Saira Condensed",Arial;cursor:pointer;border-radius:3px}
  #panel.dp .dpS.on{border-color:var(--khaki);background:rgba(232,217,160,.18)}
  #panel.dp .dpBtns{margin-top:12px}
  @media (max-width:900px){ #panel.dp .dpWrap{flex-direction:column} #panel.dp .dpL{flex:none;width:100%} }`;
  document.head.appendChild(st);
})();
