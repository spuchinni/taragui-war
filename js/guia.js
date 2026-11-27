/* ---------- Guía del garaje al terminar el entrenamiento (26/11/2026, pedido de Sebastián: "después de las primeras partidas que también
   me explique para qué sirve todo: el garaje, los puntos, los Yaguaretés, etc.") ----------
   La primera vez que se abre el garaje con el entrenamiento terminado (y la caja del regalo cerrada), un recorrido paso a paso marca cada
   parte y explica para qué sirve. Avanza con "Siguiente", se puede saltear y no vuelve a salir (PROG.guia). Los pasos cuyo botón no está
   en pantalla se saltean. window.guiaGaraje() la vuelve a mostrar. No sale a quien ya tenía muchas batallas antes de este cambio. */
(()=>{
  const EN=()=>window.LANG==='en', T2=(es,en)=>EN()?en:es;
  const STEPS=[
    {q:'.hgRow, .hgc',t:()=>T2('Tu garaje','Your garage'),d:()=>T2('Abajo están los tanques del rango que mirás. Los que tienen ★ están en tu garaje: son los que llevás a la batalla (hasta 3) y, si te destruyen, salís con otro de ellos. Tocá uno para verlo; con "Al garaje" lo sumás o lo sacás.','Below are the tanks of the rank you are viewing. The ones with ★ are in your garage: you take them into battle (up to 3) and respawn with another if destroyed. Tap one to see it; "Al garaje" adds or removes it.')},
    {q:'#hgTree',t:()=>T2('Puntos de investigación (PI)','Research points (RP)'),d:()=>T2('Cada batalla da PI. Van al próximo tanque de tu línea: cuando llegás a lo que cuesta, queda investigado. En el árbol ves toda la línea y elegís qué investigar.','Every battle gives RP for the next tank in your line; once you reach its cost it is researched. The tree shows the whole line and lets you pick what to research.')},
    {q:'.hgRank',t:()=>T2('Yaguaretés 🐆 y grado','Yaguaretés 🐆 and rank'),d:()=>T2('Los Yaguaretés también se ganan en cada batalla: con ellos comprás los tanques que investigaste (investigar no alcanza, hay que comprarlo). La experiencia (XP) te sube de grado: Cabo, Sargento…','Yaguaretés are earned every battle too: you buy the tanks you researched with them (researching is not enough). XP raises your rank.')},
    {q:'.lvl.mods, #hgMods',t:()=>T2('Mejoras del tanque','Tank upgrades'),d:()=>T2('Cada tanque gana su propia experiencia y la usa en mejoras: humo, otras municiones, reparación rápida, control de tiro. Elegí cuál investigar o dejalo en Automático. También se elige al terminar la batalla.','Each tank earns its own XP for upgrades: smoke, more ammo types, fast repair, fire control. Pick one or leave it on Automatic. You can also pick it after a battle.')},
    {q:'.hgN',t:()=>T2('Naciones','Nations'),d:()=>T2('Todas las naciones están abiertas, cada una con su tanque de reserva: probalas cuando quieras. Brasil y Latinoamérica se abren investigando un tanque de Estados Unidos (🔒 te dice cuál).','All nations are open, each with its reserve tank: try them whenever you want. Brazil and Latin America open by researching a US tank (🔒 tells you which).')},
    {q:'.hgE',t:()=>T2('Rangos de tu línea','Ranks of your line'),d:()=>T2('Una sola línea por nación: podés llevar tanques de cualquier rango. Los rangos de arriba se abren investigando tanques del anterior. El mapa sale de tu tanque más fuerte.','One line per nation: take tanks of any rank. Higher ranks open by researching tanks of the one before. The map depends on your strongest tank.')},
    {q:'#hgCh',t:()=>T2('Desafíos','Challenges'),d:()=>T2('Tres desafíos por día: cumplilos jugando para ganar medallas.','Three daily challenges: complete them while playing to earn medals.')},
    {q:'#hgPlay',t:()=>T2('¡A la batalla!','To battle!'),d:()=>T2('Desde acá entrás a la próxima batalla. ¡Suerte!','Start your next battle from here. Good luck!')},
  ];
  let G=null;
  const st=document.createElement('style');
  st.textContent=`#guia{position:fixed;inset:0;z-index:70;pointer-events:none}#guia .gb{position:fixed;pointer-events:auto;max-width:min(360px,90vw);background:#1d1c16;color:#e8d9a0;border:1px solid #e8c45a;border-radius:6px;padding:12px 14px;box-shadow:0 6px 24px rgba(0,0,0,.6);font-size:14px;line-height:1.35}
  #guia .gb h3{margin:0 0 6px;font-size:17px;color:#f2d36b}#guia .gb .gn{display:flex;gap:8px;justify-content:flex-end;align-items:center;margin-top:10px}#guia .gb .gn small{flex:1;opacity:.6}
  #guia .ring{position:fixed;border:3px solid #f2d36b;border-radius:6px;box-shadow:0 0 0 9999px rgba(0,0,0,.55);transition:all .25s;pointer-events:none}`;
  document.head.appendChild(st);
  const vis=el=>{ if(!el) return false; const r=el.getBoundingClientRect(); return r.width>4&&r.height>4&&r.bottom>0&&r.top<innerHeight; };
  const find=q=>{ for(const s of q.split(',')){ const el=[...document.querySelectorAll(s.trim())].find(vis); if(el) return el; } return null; };
  function box(el){ const r=el.getBoundingClientRect(); if(el.matches('.hgN,.hgE,.hgc')){   // toda la fila de botones
      const sib=[...el.parentElement.children].filter(vis).map(e=>e.getBoundingClientRect()); return {l:Math.min(...sib.map(a=>a.left)),t:Math.min(...sib.map(a=>a.top)),r:Math.max(...sib.map(a=>a.right)),b:Math.max(...sib.map(a=>a.bottom))}; }
    return {l:r.left,t:r.top,r:r.right,b:r.bottom}; }
  function show(i){ if(!G) return; while(i<STEPS.length&&!find(STEPS[i].q)) i++;
    if(i>=STEPS.length) return close(); G.i=i; const S=STEPS[i], el=find(S.q); try{ el.scrollIntoView({block:'nearest'}); }catch(e){} const b=box(el), p=6;
    G.ring.style.cssText=`left:${b.l-p}px;top:${b.t-p}px;width:${b.r-b.l+p*2}px;height:${b.b-b.t+p*2}px`;
    const last=!STEPS.slice(i+1).some(s=>find(s.q));
    G.gb.innerHTML=`<h3>${S.t()}</h3><div>${S.d()}</div><div class="gn"><small>${i+1} / ${STEPS.length}</small><button class="hgB" id="gSkip">${T2('Saltear','Skip')}</button><button class="go" id="gNext">${last?T2('¡Listo!','Done!'):T2('Siguiente','Next')}</button></div>`;
    const w=G.gb.offsetWidth, h=G.gb.offsetHeight; let x=Math.min(Math.max(8,b.l),innerWidth-w-8), y=b.b+14; if(y+h>innerHeight-8) y=Math.max(8,b.t-h-14);
    G.gb.style.left=x+'px'; G.gb.style.top=y+'px';
    G.gb.querySelector('#gNext').onclick=()=>show(i+1); G.gb.querySelector('#gSkip').onclick=close; }
  function close(){ if(G){ G.el.remove(); G=null; } if(PROG&&!PROG.guia){ PROG.guia=1; saveProg(); } }
  function start(){ if(G||typeof menuScreen==='undefined'||menuScreen!=='hangar') return; const el=document.createElement('div'); el.id='guia'; el.setAttribute('data-notr','');
    el.innerHTML='<div class="ring"></div><div class="gb"></div>'; document.body.appendChild(el); G={el,ring:el.querySelector('.ring'),gb:el.querySelector('.gb'),i:0}; show(0); }
  window.guiaGaraje=()=>{ if(menuScreen!=='hangar'){ menuScreen='hangar'; renderHangar(); } setTimeout(start,300); };
  const nb=()=>(PROG&&PROG.stats&&PROG.stats.battles)||0;
  const due=()=>PROG&&!PROG.train&&!PROG.guia&&nb()>=3&&nb()<30&&state==='menu'&&menuScreen==='hangar';
  const giftOpen=()=>{ const g=document.getElementById('pGift'); return g&&g.style.display&&g.style.display!=='none'; };
  // algo tapa el garaje (novedades, la caja, la ventana de naciones, el camión…): lo que está arriba del botón de jugar no es el botón
  const covered=()=>{ const pb=document.getElementById('hgPlay'); if(!pb||!vis(pb)) return true; const r=pb.getBoundingClientRect(), e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return !e||!(e===pb||pb.contains(e)); };
  const busy=()=>giftOpen()||document.querySelector('#hgModal > *, #mdFloat.on')||covered();
  // espera a que el garaje esté quieto (sin la caja del regalo ni el camión) y arranca
  setInterval(()=>{ try{ if(G){ if(state!=='menu'||menuScreen!=='hangar') close(); else if(G.el&&!find(STEPS[G.i].q)) show(G.i); return; }
      if(due()&&!busy()){ G=null; setTimeout(()=>{ if(due()&&!busy()) start(); },600); } }catch(e){} },1000);
  // al redibujar el garaje, el recuadro sigue al botón
  { const _rh=renderHangar; renderHangar=function(){ const r=_rh.apply(this,arguments); if(G) setTimeout(()=>G&&show(G.i),50); return r; }; }
})();
