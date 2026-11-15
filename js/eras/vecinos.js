/* ---------- Vecinos sentados en los bancos y charlando en grupos (tanda de infantería, pedido de Sebastián) ----------
   - Al armar la partida (initRefuerzos, solo el anfitrión, donde hay vecinos: escuadras.js) se sientan 1 o 2 en algunos bancos de las
     plazas (W._benchL, calles.js) y se juntan grupitos de 2 o 3 en las veredas, mirándose, uno gesticulando.
   - Mientras no pase nada se quedan; con un tanque cerca, tiros o explosiones (lo mismo que mira civThink) se levantan y salen corriendo.
     Si se cae el banco, también.
   - Rodillas: solo a los que se sientan se les parte la pierna horneada en muslo y pantorrilla (kneeSplit), así el resto no suma llamadas
     de dibujo. Poses con el codo (armIK de posturas.js). */
(()=>{
  const KNEE=-.43;
  // parte la malla horneada de la pierna en dos (por triángulo, según la altura del centro) y cuelga la pantorrilla de la rodilla
  function kneeSplit(P){ if(P.knees) return true; const p=P.parts; if(!p||!p.legL||!p.legL.geometry) return false;
    for(const L of [p.legL,p.legR]){ let g=L.geometry; if(g.index) g=g.toNonIndexed(); const at=g.attributes, n=at.position.count, up=[], lo=[];
      for(let i=0;i<n;i+=3){ const cy=(at.position.getY(i)+at.position.getY(i+1)+at.position.getY(i+2))/3; (cy<KNEE?lo:up).push(i); }
      if(!lo.length) return false;
      const mk=(list,dy)=>{ const G=new THREE.BufferGeometry(); for(const k in at){ const A=at[k], s=A.itemSize, arr=new A.array.constructor(list.length*3*s);
          let o=0; for(const i of list) for(let j=0;j<3;j++) for(let c=0;c<s;c++) arr[o++]=A.array[(i+j)*s+c];
          G.setAttribute(k,new THREE.BufferAttribute(arr,s,A.normalized)); }
        if(dy) G.translate(0,dy,0); G.computeBoundingSphere(); return G; };
      L.geometry=mk(up,0); const S=new THREE.Mesh(mk(lo,-KNEE),L.material); S.position.y=KNEE; S.castShadow=true; L.add(S); L.userData.shin=S; }
    p.shinL=p.legL.userData.shin; p.shinR=p.legR.userData.shin; P.knees=true; return true; }
  window.kneeSplit=kneeSplit;

  const threat=P=>noises.some(n=>now-n.t<3&&Math.hypot(n.x-P.pos.x,n.z-P.pos.z)<n.r)||tanks.some(t=>!t.dead&&t.pos.distanceTo(P.pos)<55);
  function standUp(P){ P.sit=null; P.chat=null; P.flee=true; P.goal=null; P.cower=now+rand(.3,.8); }
  const _ct=civThink; civThink=function(P,dt){
    if((P.sit||P.chat)&&!P.flee&&!(P.cower>now)){
      if(P.sit&&P.sit.b&&(P.sit.b.fallen||P.sit.b.gone)){ standUp(P); return _ct.apply(this,arguments); }
      P.vT=(P.vT||0)-dt; if(P.vT<=0){ P.vT=.5; if(threat(P)){ standUp(P); return _ct.apply(this,arguments); } }
      const s=P.sit||P.chat; P.goal=null; P.spd=0; P.pos.x=s.x; P.pos.z=s.z; P.heading=s.h; return; }
    return _ct.apply(this,arguments); };

  // ---- poses ----
  const v=(x,y,z)=>new THREE.Vector3(x,y,z), HL=v(0,0,0), HR=v(0,0,0), pL=v(-.4,-1,.2), pR=v(.4,-1,.2);
  const _ai=animInf; animInf=function(P,dt){ const r=_ai.apply(this,arguments);
    try{ const p=P.parts; if(!p||P.dead||P.fall||P.kind!=='civ') return r; const k=Math.min(1,dt*5);
      if(P.sit&&!P.flee){ const S=P.sit; p.hip.position.y=.5; p.hip.rotation.x=-.06;
        p.legL.rotation.set(-1.45,0,-.06); p.legR.rotation.set(-1.45,0,.06);
        if(P.knees){ p.shinL.rotation.x=1.42+S.cross*.0; p.shinR.rotation.x=S.cross?1.0:1.42; if(S.cross){ p.legR.rotation.set(-1.25,.15,-.25); } }   // a veces con la pierna cruzada
        if(window.armIK){ const t=now*1+(P.id||0);
          if(S.pose==='read'){ HL.set(-.06,.12,.32); HR.set(.06,.12,.32); }                                                  // diario o libro
          else if(S.pose==='talk'){ HL.set(-.18,.03,.24); HR.set(.18+Math.sin(t*2.1)*.05,.18+Math.max(0,Math.sin(t*1.3))*.12,.3); }
          else { HL.set(-.16,.03,.26); HR.set(.16,.03,.26); }                                                                // manos sobre las piernas
          armIK(p.armL,HL,pL); armIK(p.armR,HR,pR); } }
      else if(P.knees){ for(const s of [p.shinL,p.shinR]) s.rotation.x+=(0-s.rotation.x)*k; }
    }catch(e){} return r; };

  // ---- quién se sienta y quién charla ----
  function seat(B,i,n){ const a=B.a, sx=n===1?(Math.random()-.5)*.6:(i?.42:-.42), lz=.04, c=Math.cos(a), s=Math.sin(a);
    return {x:B.x+c*sx+s*lz, z:B.z-s*sx+c*lz, h:a+Math.PI}; }
  function seatPeople(){ const L=(W._benchL||[]).filter(o=>o.P&&props.includes(o.P)&&!o.P.fallen); let n=0;
    for(const B of L){ if(n>=10||Math.random()<.45) continue; const m=Math.random()<.4?2:1;
      for(let i=0;i<m;i++){ const st=seat(B,i,m), P=makePerson('civ',-1,st.x,st.z); if(!P||P.kind!=='civ'||!P.parts||!P.parts.legL) continue;
        if(!kneeSplit(P)) continue; P.sit={...st,b:B.P,cross:Math.random()<.3,pose:m===2&&i===0?'talk':Math.random()<.3?'read':'rest'}; P.heading=st.h; P.g.rotation.y=st.h; n++; } }
    return n; }
  function chatGroups(){ let made=0;
    for(let g=0;g<14&&made<4;g++){ const B=buildings[(Math.random()*buildings.length)|0]; if(!B) break;
      const side=Math.random()<.5?1:-1, alongX=Math.random()<.5, cx=B.x+(alongX?rand(-.4,.4)*B.w:side*(B.w/2+2.2)), cz=B.z+(alongX?side*(B.d/2+2.2):rand(-.4,.4)*B.d);
      if(!freeInf(cx,cz)) continue; const m=2+(Math.random()<.45?1:0), a0=rand(0,6.28), R=m===2?.55:.65; let ok=0;
      for(let i=0;i<m;i++){ const a=a0+i/m*Math.PI*2, x=cx+Math.cos(a)*R, z=cz+Math.sin(a)*R; if(!freeInf(x,z)) continue;
        const P=makePerson('civ',-1,x,z); if(!P||P.kind!=='civ') continue; const h=Math.atan2(cx-x,cz-z);
        P.chat={x,z,h}; P.heading=h; P.g.rotation.y=h; P.idleK=i===0?'talk':['talk','crossed','pockets','back'][(Math.random()*4)|0]; ok++; }
      if(ok) made++; }
    return made; }
  const _ir=initRefuerzos;
  initRefuerzos=function(){ const r=_ir.apply(this,arguments);
    try{ if(!net.guest&&!RULE().civ&&buildings.length&&!tut&&!(typeof curSpecial!=='undefined'&&curSpecial&&curSpecial.noCiv)){
        W._vec={sit:seatPeople(),groups:chatGroups()}; } }catch(e){ console.warn('vecinos2',e); }
    return r; };
})();
