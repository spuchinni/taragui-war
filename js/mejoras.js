/* ---------- Mejoras por tanque que elegís investigar (25/11/2026, pedido de Sebastián: "que me deje elegir lo que quiero investigar de cada tanque") ----------
   Antes la experiencia del tanque subía niveles fijos (Nv 2 lanzahumos + 2ª munición, Nv 3 reparación + 3ª munición, Nv 4 munición mejorada,
   Nv 5 control de tiro). Ahora, como en War Thunder, cada tanque tiene su lista de mejoras con su costo en experiencia y vos elegís cuál
   investigar: la experiencia que gana el tanque en batalla va a esa mejora y, al completarla, pasa sola a la siguiente que falte.
   PROG.mods[tanque] = {d:[ids hechas], c:id que se investiga, x:experiencia puesta en ella}. La primera vez se arma con lo que ya tenía el tanque
   por su nivel viejo (nadie pierde nada). Los efectos los pone applyLevel (envuelto): con lv>=100 llega la máscara de mejoras (online: crew.lvs). */
const MOD_DEF=[
  {id:'smk',bit:1,xp:1500,n:'Lanzahumos',en:'Smoke launchers',d:'2 granadas de humo por salida (tecla de humo)',de:'2 smoke grenades per sortie'},
  {id:'am2',bit:2,xp:1500,n:'2ª munición',en:'2nd ammo',d:'Podés cargar la segunda munición',de:'You can carry the second ammo type'},
  {id:'rep',bit:4,xp:2500,n:'Reparación rápida',en:'Fast repair',d:'Reparás un 40 % más rápido',de:'Repairs 40 % faster'},
  {id:'am3',bit:8,xp:4000,n:'3ª munición',en:'3rd ammo',d:'Podés cargar la tercera munición',de:'You can carry the third ammo type'},
  {id:'pen',bit:16,xp:4500,n:'Munición mejorada',en:'Improved ammo',d:'+8 % de penetración',de:'+8 % penetration'},
  {id:'fcs',bit:32,xp:6000,n:'Control de tiro',en:'Fire control',d:'Telémetro (o recarga 10 % más rápida si ya lo tenía)',de:'Rangefinder (or 10 % faster reload if it had one)'}];
const MOD_MG={id:'smk',bit:1,xp:1500,n:'Cintas extra',en:'Extra belts',d:'2 cintas más de ametralladora por salida',de:'2 more MG belts per sortie'};
function modsOf(k){ const V=VEH[k]; if(!V) return []; const nA=(V.ammo||[]).length;
  return MOD_DEF.filter(m=>!(m.id==='am2'&&nA<2)&&!(m.id==='am3'&&nA<3)).map(m=>{ let o=m.id==='smk'&&noSmokeEra(k)?MOD_MG:m;
    if(m.id==='am2'||m.id==='am3'){ const A=V.ammo[m.id==='am2'?1:2]; o={...m,n:A.n,en:A.n,sh:m.n,she:m.en,d:`${A.n} (${(typeof KIND_ES!=='undefined'&&KIND_ES[A.kind])||A.kind}, ${A.pen} mm)`,de:`${A.n} (${A.kind}, ${A.pen} mm)`}; }
    return o; }); }
function modState(k){ if(!PROG||!VEH[k]) return {d:[],c:null,x:0}; PROG.mods=PROG.mods||{}; let S=PROG.mods[k];
  if(!S){ const lv=tankLv(k), d=[]; if(lv>=2) d.push('smk','am2'); if(lv>=3) d.push('rep','am3'); if(lv>=4) d.push('pen'); if(lv>=5) d.push('fcs');   // lo que ya tenía por su nivel viejo
    S=PROG.mods[k]={d:d.filter(id=>modsOf(k).some(m=>m.id===id)),c:null,x:0}; }
  if(S.c&&(S.d.includes(S.c)||!modsOf(k).some(m=>m.id===S.c))) S.c=null;
  if(!S.c){ const n=modsOf(k).find(m=>!S.d.includes(m.id)); S.c=n?n.id:null; S.x=0; }
  return S; }
const modHas=(k,id)=>{ if(window._modAll) return true; return modState(k).d.includes(id); };
const modCode=k=>100+modsOf(k).reduce((a,m)=>a+(modHas(k,m.id)?m.bit:0),0);
const modDone=k=>modState(k).d.length, modTotal=k=>modsOf(k).length;
function modPick(k,id){ const S=modState(k); if(S.d.includes(id)||S.c===id) return; S.c=id; S.x=0; saveProg(); }   // cambiar de mejora reinicia lo puesto (como en War Thunder)
// reparte experiencia del tanque en las mejoras: devuelve {done:[mejoras completadas], cur, f0, f1, have, cost}
function modGain(k,xp){ const S=modState(k), L=modsOf(k), done=[]; let left=xp|0, f0=null, cur=null;
  while(left>0&&S.c){ const m=L.find(z=>z.id===S.c); if(!m){ S.c=null; break; } if(f0==null){ f0=S.x/m.xp; cur=m; }
    const need=m.xp-S.x, put=Math.min(need,left); S.x+=put; left-=put;
    if(S.x>=m.xp){ S.d.push(m.id); done.push(m); S.c=null; S.x=0; modState(k); } }
  const m2=L.find(z=>z.id===S.c); saveProg();
  return {done,cur:m2||null,f0:f0==null?1:f0,f1:m2?S.x/m2.xp:1,have:S.x,cost:m2?m2.xp:0}; }

// ---- efectos en el tanque ----
{ const _al=applyLevel; applyLevel=function(t,lv){
    let mask; if(lv>=100) mask=lv-100; else { lv=lv|0; mask=(lv>=2?3:0)|(lv>=3?12:0)|(lv>=4?16:0)|(lv>=5?32:0); }   // número viejo (invitados con la versión anterior)
    const r=_al.call(this,t,1); const has=b=>!!(mask&b);
    t.mods=mask; t.lv=has(1)?2:1;                                                                                 // t.lv>=2 = tiene lanzahumos (lo miran el HUD y la IA)
    t.smoke=has(1)&&!t.noSmk?2:0; t.mgX=has(1)&&t.noSmk; t.repairK=has(4)?.6:1; t.penK=has(16)?1.08:1; t.fcsX=has(32)&&!t.T.fcs;
    if(has(32)&&t.T.fcs) t.reloadMax*=.9;
    return r; }; }

// ---- garaje: lista de mejoras del tanque elegido; tocás una para investigarla ----
(()=>{ const EN=()=>window.LANG==='en', T2=(es,en)=>EN()?en:es, nm=m=>EN()?(m.she||m.en):(m.sh||m.n), ds=m=>EN()?m.de:m.d, fmt=n=>Math.round(n).toLocaleString(EN()?'en-US':'es-AR');
  function box(k){ const S=modState(k), L=modsOf(k), c=L.find(m=>m.id===S.c);
    return `<div class="lvl mods" data-notr><b>${T2('Mejoras','Upgrades')}</b> · ${S.d.length} / ${L.length}${c?` · ${T2('investigando','researching')} <b>${nm(c)}</b> ${Math.round(S.x/c.xp*100)} %<i class="pb"><i style="width:${Math.round(S.x/c.xp*100)}%"></i></i>`:` · ${T2('todas listas','all done')}`}
      <button class="hgB" id="hgMods">${T2('Elegir qué investigar','Choose research')}</button></div>`; }
  function modal(k){ const bx=$('hgModal'); if(!bx) return; const S=modState(k), L=modsOf(k), V=VEH[k];
    bx.innerHTML=`<div class="hgM mods" data-notr style="width:min(560px,94vw)"><h2>${T2('Mejoras','Upgrades')} · ${V.label}</h2>
      <p class="s">${T2('La experiencia que gana este tanque en batalla va a la mejora elegida. Al terminarla sigue sola con la próxima. Cambiar de mejora reinicia lo puesto en ella.','The XP this tank earns goes to the chosen upgrade. When done it moves on to the next one. Switching resets its progress.')}</p>
      <ul>${L.map(m=>{ const ok=S.d.includes(m.id), cur=S.c===m.id, f=cur?S.x/m.xp:0;
        return `<li class="${ok?'ok':''}${cur?' cur':''}" data-mod="${m.id}"><b>${ok?'✓':cur?'⚙':'○'} ${EN()?m.en:m.n}</b><small>${ds(m)}</small>
          <span class="mx">${ok?T2('Lista','Done'):cur?`${fmt(S.x)} / ${fmt(m.xp)} XP`:`${fmt(m.xp)} XP · ${T2('investigar','research')}`}</span>${cur?`<i class="pb"><i style="width:${Math.round(f*100)}%"></i></i>`:''}</li>`; }).join('')}</ul>
      <div style="text-align:center;margin-top:10px"><button class="go" id="mdOk">${T2('Listo','Done')}</button></div></div>`;
    bx.querySelectorAll('li[data-mod]').forEach(li=>li.onclick=()=>{ if(li.classList.contains('ok')) return; modPick(k,li.dataset.mod); modal(k); });
    $('mdOk').onclick=()=>{ bx.innerHTML=''; renderHangar(); }; }
  window.modsModal=modal;
  const _rh=renderHangar; renderHangar=function(){ const r=_rh.apply(this,arguments);
    try{ const el=document.querySelector('#panel .lvl'); if(el&&hgSel&&owned(hgSel)){ el.outerHTML=box(hgSel); const k=hgSel; $('hgMods').onclick=()=>modal(k); }
      document.querySelectorAll('#panel .hgc[data-k]').forEach(b=>{ const k=b.dataset.k, s=b.querySelector('small'); if(s&&owned(k)) s.innerHTML=s.innerHTML.replace(/Nv \d/,`${modDone(k)}/${modTotal(k)} ${T2('mejoras','upgrades')}`); }); }catch(e){ console.warn('mejoras',e); }
    return r; };
  const st=document.createElement('style'); st.textContent=`.lvl.mods .pb{display:block;margin:3px 0}.lvl.mods #hgMods{margin-top:4px}
    .hgM.mods ul{list-style:none;padding:0;margin:8px 0;text-align:left}.hgM.mods li{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px;padding:7px 10px;margin:5px 0;border:1px solid rgba(232,217,160,.22);border-radius:4px;cursor:pointer}
    .hgM.mods li:hover{background:rgba(232,217,160,.1)}.hgM.mods li b{flex:1 1 60%}.hgM.mods li small{flex:1 1 100%;opacity:.75;order:3}.hgM.mods li .mx{font-size:13px;opacity:.85}
    .hgM.mods li.ok{cursor:default;color:#b8d890}.hgM.mods li.cur{background:rgba(232,217,160,.16);border-color:rgba(232,217,160,.6)}.hgM.mods li .pb{flex:1 1 100%;order:4;display:block}`; document.head.appendChild(st);
})();
