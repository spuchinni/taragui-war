// Munición por nivel del tanque y carga antes de salir (pedido de Sebastián, estilo War Thunder). Va después de diario.js.
//  · AMMO_LV: la 1ª munición del tanque viene siempre; la 2ª se desbloquea con el nivel 2 del tanque y la 3ª con el nivel 3
//    (tankLv: experiencia del tanque, LV_XP). La bloqueada no se carga: su casilla muestra 🔒 y el nivel que pide.
//  · Carga: en el hangar, botón "Munición" del tanque elegido: cuántos proyectiles de cada tipo (PROG.load[tanque] = cantidades).
//    Sin carga elegida, la de siempre (50/30/20 %). Las primeras 3 batallas no muestran el botón (todavía no se explicó).
// Textos en los dos idiomas acá mismo (data-notr).
(function(){
  const EN=()=>window.LANG==='en', T2=(es,en)=>EN()?en:es;
  const AMMO_LV=[1,2,3];
  const battles=()=>(PROG&&PROG.stats&&PROG.stats.battles)||0;
  const unlocked=(k,i)=>!VEH[k]||tankLv(k)>=(AMMO_LV[i]||1);
  window.ammoUnlocked=unlocked;
  const loadOf=k=>(PROG&&PROG.load&&PROG.load[k])||null;

  // ---- al cargar el tanque del jugador ----
  const _ia=initAmmo; initAmmo=function(t){ _ia.apply(this,arguments);
    try{ const k=t.key||t.T&&t.T.key, L=t.T.ammo; if(!k||!L) return;
      const tot=t.ammoMax.reduce((a,b)=>a+b,0), open=L.map((_,i)=>unlocked(k,i)), want=loadOf(k);
      let cnt;
      if(want&&want.length===L.length) cnt=want.map((n,i)=>open[i]?Math.max(0,n|0):0);
      else { const sh=L.length===1?[1]:L.length===2?[.6,.4]:[.5,.3,.2], w=sh.map((s,i)=>open[i]?s:0), sw=w.reduce((a,b)=>a+b,0)||1; cnt=w.map(s=>Math.round(tot*s/sw)); }
      let sum=cnt.reduce((a,b)=>a+b,0); if(sum>tot){ const f=tot/sum; cnt=cnt.map(n=>Math.floor(n*f)); sum=cnt.reduce((a,b)=>a+b,0); }
      if(sum<1){ cnt[0]=tot; }
      t.ammoMax=cnt.slice(); t.ammoCount=cnt.slice(); t.ammoLock=open.map(o=>!o);
      if(!(t.ammoCount[t.ammoIdx]>0)){ const j=t.ammoCount.findIndex(n=>n>0); t.ammoIdx=j>=0?j:0; }
    }catch(e){ console.warn('municion',e); } };

  // ---- casillas bloqueadas: 🔒 y el nivel; la tecla avisa en vez de elegirla ----
  const _ub=updateAmmoBar; updateAmmoBar=function(t){ const r=_ub.apply(this,arguments);
    try{ const E=$('ammoSlots')&&$('ammoSlots')._els; if(E&&t.ammoLock) t.ammoLock.forEach((lk,i)=>{ const o=E['a'+i]; if(!o) return;
      if(lk){ if(o.el._c!=='as off lock'){ o.el._c='as off lock'; o.el.className='as off lock'; } const txt=`🔒${AMMO_LV[i]}`; if(o.n.textContent!==txt) o.n.textContent=txt;
        o.el.title=T2(`Se desbloquea con el nivel ${AMMO_LV[i]} del tanque`,`Unlocks at tank level ${AMMO_LV[i]}`); } }); }catch(e){}
    return r; };
  document.addEventListener('keydown',e=>{ if(typeof state==='undefined'||state!=='play'||!player||!player.ammoLock) return;
    for(let i=0;i<3;i++) if(e.code===binds['ammo'+(i+1)]&&player.ammoLock[i]){ e.stopImmediatePropagation(); e.preventDefault();
      hitMsg(T2(`🔒 ${player.T.ammo[i].n}: se desbloquea con el nivel ${AMMO_LV[i]} del tanque`,`🔒 ${player.T.ammo[i].n}: unlocks at tank level ${AMMO_LV[i]}`),'var(--paper)'); return; } },true);

  // ---- hangar: botón "Munición" ----
  function hgAmmo(){ const box=$('hgModal'); if(!box||!hgSel) return; const k=hgSel, V=VEH[k], L=V.ammo||[];
    const tot=V.auto?Math.round(V.auto.mag*14):(V.ammoCap||(V.hp>=130?42:V.hp>=90?36:30)), lv=tankLv(k);
    PROG.load=PROG.load||{}; let cur=(loadOf(k)&&loadOf(k).length===L.length)?loadOf(k).slice():null;
    if(!cur){ const sh=L.length===1?[1]:L.length===2?[.6,.4]:[.5,.3,.2], w=sh.map((s,i)=>unlocked(k,i)?s:0), sw=w.reduce((a,b)=>a+b,0)||1; cur=w.map(s=>Math.round(tot*s/sw)); }
    const draw=()=>{ const used=cur.reduce((a,b)=>a+b,0);
      box.innerHTML=`<div class="hgM" data-notr style="width:min(560px,94vw)"><h2>${T2('Munición','Ammunition')} · ${V.label}</h2>
        <p class="s">${T2(`Elegí con qué salir. Carga total: <b>${used} / ${tot}</b>. Nivel del tanque: <b>${lv}</b>.`,`Choose what to carry. Total load: <b>${used} / ${tot}</b>. Tank level: <b>${lv}</b>.`)}</p>
        ${L.map((A,i)=>{ const op=unlocked(k,i); return `<div style="display:flex;align-items:center;gap:10px;margin:8px 0;opacity:${op?1:.5}">
          <div style="flex:1;text-align:left"><b>${A.n}</b><br><small>${(typeof KIND_ES!=='undefined'&&KIND_ES[A.kind])||A.kind} · ${A.pen} mm</small></div>
          ${op?`<button class="hgB" data-m="${i}">−</button><b style="min-width:2.4em;text-align:center">${cur[i]}</b><button class="hgB" data-p="${i}">+</button>`
            :`<span>🔒 ${T2(`nivel ${AMMO_LV[i]}`,`level ${AMMO_LV[i]}`)}</span>`}</div>`; }).join('')}
        <div style="display:flex;gap:8px;justify-content:center;margin-top:10px"><button class="go alt" id="amRst">${T2('Repartir como siempre','Default split')}</button><button class="go" id="amOk">${T2('Listo','Done')}</button></div></div>`;
      box.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.m; if(cur[i]>0){ cur[i]--; draw(); } });
      box.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.p; if(cur.reduce((a,c)=>a+c,0)<tot){ cur[i]++; draw(); } else { const j=cur.findIndex((n,x)=>x!==i&&n>0&&unlocked(k,x)); if(j>=0){ cur[j]--; cur[i]++; draw(); } } });
      $('amRst').onclick=()=>{ delete PROG.load[k]; saveProg(); box.innerHTML=''; };
      $('amOk').onclick=()=>{ PROG.load[k]=cur.slice(); saveProg(); box.innerHTML=''; }; };
    draw(); }
  const _rh=renderHangar; renderHangar=function(){ const r=_rh.apply(this,arguments); const cam=$('hgCam');
    if(cam&&!$('hgAmmo')&&battles()>=3&&owned(hgSel)&&(VEH[hgSel].ammo||[]).length>1){ cam.insertAdjacentHTML('beforebegin',`<button class="hgB" id="hgAmmo" data-notr>${T2('Munición','Ammo')}</button>`); $('hgAmmo').onclick=hgAmmo; }
    return r; };
})();
