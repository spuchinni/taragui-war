// Escuadras y vecinos (pedido de Sebastián):
//  · la infantería se mueve en escuadra: el primero vivo de cada escuadra (el jefe) elige adónde ir y piensa como siempre;
//    los demás lo siguen en cuña detrás de él (unos 4 m entre cada uno) y pelean por su cuenta si ven un blanco. Ahorra
//    trabajo: los que siguen piensan cada 1–1,5 s en vez de cada medio segundo.
//  · más civiles en las épocas 1–3: además de los refugiados que se van, quedan vecinos en los pueblos y las ciudades que
//    pasean por la vereda y huyen a las casas cuando empiezan los tiros (como los de la Guerra Fría).
(function(){
  let sqN=0;
  const _ss=spawnSquad;
  spawnSquad=function(team){ const n0=infantry.length; const r=_ss.apply(this,arguments);
    const M=infantry.slice(n0).filter(P=>P.team===team&&!isCiv(P)); if(M.length>1){ const S={id:++sqN,m:M}; M.forEach((P,i)=>{ P.sq=S; P.sqI=i; }); } return r; };
  window.squadOf=P=>P.sq;
  const lead=S=>S.m.find(P=>!P.dead&&!P.removed&&infantry.includes(P));
  // lugar en la cuña: atrás del jefe, alternando a izquierda y derecha
  function slot(L,i){ const k=Math.ceil(i/2), s=i%2?-1:1, back=k*3.2, side=s*k*2.6, h=L.heading||0;
    return {x:L.pos.x-Math.sin(h)*back+Math.cos(h)*side, z:L.pos.z-Math.cos(h)*back-Math.sin(h)*side}; }
  const _st=soldierThink;
  soldierThink=function(P,dt){ const S=P.sq;
    if(S&&!P.nest){ const L=lead(S);
      if(L&&L!==P&&!P.fix&&!P.embark&&!P.board&&!(P.target&&!P.target.dead)&&!P.cover){
        const i=S.m.filter(o=>!o.dead&&infantry.includes(o)).indexOf(P), g=slot(L,Math.max(1,i)), d=Math.hypot(g.x-P.pos.x,g.z-P.pos.z);
        if(d>1.5&&freeInf(g.x,g.z)) P.goal={x:g.x,z:g.z,sq:1}; else P.goal=null;          // en su lugar: espera al jefe
      } }
    const t0=P.thinkT, r=_st.apply(this,arguments);
    if(S&&P.thinkT>t0&&lead(S)!==P) P.thinkT+=.5;                      // los que siguen buscan blancos más espaciado
    return r; };
  // vecinos en épocas 1–3 (la Guerra Fría ya los tiene con spawnCivilians)
  const _ir=initRefuerzos;
  initRefuerzos=function(){ const r=_ir.apply(this,arguments);
    try{ if(!net.guest&&!RULE().civ&&buildings.length&&!tut&&!(typeof curSpecial!=='undefined'&&curSpecial&&curSpecial.noCiv)){
        const city=W.cfgC&&W.cfgC.city, n=Math.min(city?26:16,Math.round(buildings.length*(city?.08:.18)));
        if(n>0) spawnCivilians(n); } }catch(e){ console.warn('vecinos',e); }
    return r; };
})();
