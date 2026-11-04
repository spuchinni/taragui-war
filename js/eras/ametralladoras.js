/* ---------- Ametralladoras: todas funcionan y cada una gira por su cuenta (pedido de Sebastián) ----------
   Cada ametralladora montada (mgMount en gm3-modelos.js: rótula de casco, antiaérea del jefe o del cargador, trasera de la torre, a control
   remoto, fijas del glacis) apunta sola hacia el blanco dentro de los límites de su montaje (t.mgs[i].yaw / .pitch, relativos a su base):
   - jugador: hacia donde marca la mira (lastAim); bots: hacia el tanque o el soldado que atacan; sin blanco vuelven al frente.
   - Gira a su velocidad (las de rótula más lento que las de pivote) y tira solo si el blanco entra en su arco, la apuntó y el tripulante que
     la maneja (seat) está vivo. Cada una tiene su cinta, su calor y su cambio de cinta. La coaxial sigue con el cañón como siempre. */
const _mgP=new THREE.Vector3(), _mgL=new THREE.Vector3();
function mgAim(t){ if(t.isPlayer) return lastAim||null;
  if(t.target&&!t.target.dead) return _mgP.copy(t.target.pos).setY(t.target.pos.y+(t.target.aimH||1.2));
  if(t.infT&&!t.infT.dead) return _mgP.copy(t.infT.pos).setY(t.infT.pos.y+.8);
  return null; }
function mgUpdate(t,dt){ const L=t.mgs; if(!L||t.dead) return; const P=mgAim(t);
  for(const M of L){ let wy=0, wp=0; M.can=false;
    if(P&&M.base.parent){ _mgL.copy(P); M.base.worldToLocal(_mgL); const y=Math.atan2(_mgL.x,_mgL.z), p=Math.atan2(_mgL.y,Math.hypot(_mgL.x,_mgL.z));
      M.can=y>=M.yaw[0]-.06&&y<=M.yaw[1]+.06&&p>=M.pitch[0]-.06&&p<=M.pitch[1]+.06;
      if(M.can){ wy=clamp(y,M.yaw[0],M.yaw[1]); wp=clamp(p,M.pitch[0],M.pitch[1]); } }
    const sp=(M.yaw[1]-M.yaw[0]>3?2.6:1.6)*dt;                                                                    // pivote: más rápido que una rótula
    M.y+=clamp(wy-M.y,-sp,sp); M.p+=clamp(wp-M.p,-sp,sp); M.yg.rotation.y=M.y; M.pg.rotation.x=-M.p;
    M.err=Math.abs(wy-M.y)+Math.abs(wp-M.p);
    if(M.rel>0) M.rel=Math.max(0,M.rel-dt); M.heat=Math.max(0,M.heat-dt*.12); if(M.lock&&M.heat<.35) M.lock=false; } }
{ const _tf=tankFX; tankFX=function(t,dt){ const r=_tf.apply(this,arguments); try{ mgUpdate(t,dt); }catch(e){} return r; }; }
// disparar: la coaxial (núcleo) y, en el mismo momento, cada montada que esté lista; se usa el disparo del núcleo cambiando la boca,
// la dirección y la cinta por las de esa ametralladora
{ const _fm=fireMG; fireMG=function(t){ _fm(t); const L=t.mgs; if(!L||t.dead||!t.barrel) return;
    const sc=t.coax, sb=t.barrel, keep={h:t.mgHeat,l:t.mgLock,b:t.mgBelt,bs:t.mgBelts,r:t.mgRel,n:t.mgN};
    try{ for(const M of L){ if(!M.can||M.err>.07||!M.seat.some(s=>manned(t,s))) continue;
        t.coax=M.muz; t.barrel=M.pg; t.mgHeat=M.heat; t.mgLock=M.lock; t.mgBelt=M.belt; t.mgBelts=M.belts; t.mgRel=M.rel; t.mgN=M.n=(M.n??(L.indexOf(M)+1));   // cada una con su contador de trazadoras (antes era uno solo y las trazadoras salían todas de la misma)
        _fm(t); M.heat=t.mgHeat; M.lock=t.mgLock; M.belt=t.mgBelt; M.belts=t.mgBelts; M.rel=t.mgRel; M.n=t.mgN; } }
    finally{ t.coax=sc; t.barrel=sb; t.mgHeat=keep.h; t.mgLock=keep.l; t.mgBelt=keep.b; t.mgBelts=keep.bs; t.mgRel=keep.r; t.mgN=keep.n; } }; }

// Barra de arriba de la munición (pedido de Sebastián): solo las cintas de las ametralladoras (la munición del cañón ya está
// en las casillas de abajo). Una caja por cada ametralladora del tanque: la coaxial (la de siempre, #mgN) y una por montaje
// de `t.mgs`, con las cintas que le quedan y la cinta puesta.
{ const _uab=updateAmmoBar;
  updateAmmoBar=function(t){ const r=_uab.apply(this,arguments); const box=document.querySelector('#ammobar .wt-wpn'); if(!box||!t) return r;
    const L=(t.mgs||[]).filter(M=>M&&M.muz); let ex=box.querySelectorAll('.w.mgx');
    if(ex.length!==L.length||box._t!==t){ ex.forEach(e=>e.remove()); box._t=t;
      L.forEach((M,i)=>{ const s=document.createElement('span'); s.className='w mgx'; s.innerHTML=`<small style="font-size:10px;opacity:.7">${M.cal>=11?'12,7':'MG'}</small><svg viewBox="0 0 40 10"><rect x="0" y="4" width="24" height="2"/><rect x="22" y="2" width="16" height="6"/></svg><b>-</b><i class="bar"><i></i></i>`; box.appendChild(s); });
      ex=box.querySelectorAll('.w.mgx'); }
    L.forEach((M,i)=>{ const s=ex[i]; if(!s) return; const b=s.querySelector('b'), v=String(M.belts??'∞'); if(b.textContent!==v) b.textContent=v;
      const w=(M.rel>0?0:Math.round((M.belt??250)/250*100))+'%', bar=s.querySelector('.bar i'); if(bar._w!==w){ bar._w=w; bar.style.width=w; } });
    return r; }; }
