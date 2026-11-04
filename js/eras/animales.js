// Animales (pedido de Sebastián): vacas (hereford, holando, negras y cebú), caballos criollos, ovejas, cabras, gallinas,
// perros, camellos en el desierto, búfalos de agua en el Pacífico y carpinchos en Corrientes. Usan el sistema de la
// infantería como "perro" (kind 'dog'): pastan dando vueltas, huyen de los tanques y del ruido (civThink), los matan la
// ametralladora, el cañón y las explosiones, y los tanques los atropellan (civiles.js). Matar uno resta (−20, "Animal herido",
// no cuenta para el castigo por civiles). Cada animal: cuerpo y cabeza en una malla con colores por vértice y 4 patas que
// caminan (2 en las gallinas). Online: el tipo viaja en el bando (`team` = −10 − tipo) y el invitado arma el mismo animal.
// Dónde: rebaños en el campo, lejos de la tierra de nadie (`spawnAnimals` desde initRefuerzos, solo el anfitrión), según el mapa
// (`HERDS`): pastos de Europa, desierto, nieve, Pacífico, ciudades (perros y caballos de tiro) y Corrientes.
(function(){
  const TYPES=['perro','vaca','caballo','oveja','cabra','gallina','camello','bufalo','carpincho','cebu'];
  const NAME={perro:'perro',vaca:'vaca',caballo:'caballo',oveja:'oveja',cabra:'cabra',gallina:'gallina',camello:'camello',bufalo:'búfalo',carpincho:'carpincho',cebu:'vaca'};
  const B=(w,h,d,x=0,y=0,z=0)=>new THREE.BoxGeometry(w,h,d).translate(x,y,z);
  const S=(r,sx,sy,sz,x,y,z,ws=10,hs=8)=>new THREE.SphereGeometry(r,ws,hs).scale(sx,sy,sz).translate(x,y,z);
  const C=(r0,r1,h,x,y,z,rx=0,s=8)=>{ const g=new THREE.CylinderGeometry(r0,r1,h,s); g.rotateX(rx); g.translate(x,y,z); return g; };
  const leg=(r,h)=>{ const g=new THREE.CylinderGeometry(r,r*.75,h,6); g.translate(0,-h/2,0); return g; };
  // cuerpo: lista de [geometría, color]; se hornea en una malla con colores por vértice
  function bake(list){ const parts=[]; for(const [g,c] of list){ const n=g.index?g.toNonIndexed():g, col=new Float32Array(n.attributes.position.count*3), cc=new THREE.Color(c);
      for(let i=0;i<col.length;i+=3){ col[i]=cc.r; col[i+1]=cc.g; col[i+2]=cc.b; } n.setAttribute('color',new THREE.BufferAttribute(col,3)); n.deleteAttribute('uv'); parts.push(n); }
    const out=new THREE.BufferGeometry(); for(const k of ['position','normal','color']){ const arrs=parts.map(p=>p.attributes[k].array), A=new Float32Array(arrs.reduce((a,b)=>a+b.length,0)); let o=0; for(const a of arrs){ A.set(a,o); o+=a.length; } out.setAttribute(k,new THREE.BufferAttribute(A,3)); }
    out.computeBoundingSphere(); return out; }
  const vmat=new THREE.MeshLambertMaterial({vertexColors:true}), _lm=new Map(), lmat=c=>{ let m=_lm.get(c); if(!m){ m=new THREE.MeshLambertMaterial({color:c}); _lm.set(c,m); } return m; };
  const pick=a=>a[(Math.random()*a.length)|0];
  // cada tipo: arma {body (geometría), legs:[[x,y,z]], legGeo, legCol, h (alto para apuntar)}
  function build(t){ const R=Math.random();
    if(t==='vaca'||t==='cebu'||t==='bufalo'){ const raza=t==='cebu'?'cebu':t==='bufalo'?'bufalo':pick(['hereford','hereford','holando','angus','criolla']);
      const c=raza==='hereford'?0x7a3a1e:raza==='holando'?0xf0ece4:raza==='angus'?0x1c1a18:raza==='cebu'?0xb8b4a8:raza==='bufalo'?0x3a3836:pick([0x8a5a32,0x6a4a2a,0xc8b08a]);
      const face=raza==='hereford'?0xf0ece4:c, L=[[S(.5,1,.95,1.8,0,1.12,0),c],[S(.36,1,1,1.1,0,1.2,.75),c],[C(.18,.24,.55,0,1.25,1.15,1.1),c],[B(.3,.32,.5,0,1.25,1.48),face],[B(.24,.2,.16,0,1.17,1.74),0x3a2a22],
        [B(.12,.06,.18,-.2,1.38,1.38),c],[B(.12,.06,.18,.2,1.38,1.38),c],[C(.025,.04,.5,0,.95,-.95,.35,5),c],[S(.07,1,1.4,1,0,.68,-1.1),0x1a1612]];
      if(raza!=='angus'&&raza!=='holando') for(const sx of [-1,1]){ const hg=new THREE.CylinderGeometry(.025,.05,raza==='bufalo'?.5:.3,5); hg.rotateZ(sx*-1.1); hg.translate(sx*(raza==='bufalo'?.32:.24),1.42,1.38); L.push([hg,raza==='bufalo'?0x2a2826:0xe8e0c8]); }
      if(raza==='holando') for(let i=0;i<5;i++) L.push([S(.22,1,.8,1.2,(Math.random()-.5)*.9,1.15+(Math.random()-.5)*.4,(Math.random()-.5)*1.4,8,6),0x1a1816]);
      if(raza==='cebu') L.push([S(.22,1,1.1,1,0,1.62,.62),c]);
      if(R<.5&&raza!=='bufalo') L.push([S(.16,1,.7,1,0,.72,-.35),0xe8b0a0]);
      return {body:bake(L),legs:[[-.28,.85,.6],[.28,.85,.6],[-.28,.85,-.65],[.28,.85,-.65]],legGeo:leg(.11,.85),legCol:c,h:1.4}; }
    if(t==='caballo'){ const c=pick([0x5a3220,0x7a4a26,0x1c1816,0x9a9690,0xa8743a,0xe8e0d0]), mane=c===0xe8e0d0?0xc8c0b0:0x1a1410;
      const L=[[S(.42,1,.95,1.85,0,1.38,0),c],[C(.17,.27,.95,0,1.85,.82,.72),c],[B(.24,.28,.62,0,2.12,1.25),c],[B(.2,.2,.2,0,2.02,1.52),c],[B(.08,.3,.7,0,1.98,.9),mane],
        [B(.06,.14,.06,-.08,2.33,1.05),c],[B(.06,.14,.06,.08,2.33,1.05),c],[C(.05,.11,.75,0,1.15,-.85,.4,6),mane]];
      if(R<.35) L.push([B(.62,.08,.62,0,1.8,-.05),0x5a3a22],[B(.64,.32,.08,0,1.66,-.05),0x5a3a22]);   // recado criollo
      return {body:bake(L),legs:[[-.2,1.05,.6],[.2,1.05,.6],[-.2,1.05,-.6],[.2,1.05,-.6]],legGeo:leg(.075,1.05),legCol:c,h:1.7}; }
    if(t==='oveja'){ const w=pick([0xe8e2d4,0xdcd4c0,0xe8e2d4,0x3a3430]), hc=w===0x3a3430?0x1c1a18:pick([0x2a2622,0xe8e2d4,0x2a2622]);
      return {body:bake([[S(.4,1,.9,1.3,0,.72,0,9,7),w],[S(.32,1,1,1,0,.82,.32),w],[B(.18,.22,.3,0,.82,.68),hc],[B(.18,.06,.1,-.14,.88,.6),hc],[B(.18,.06,.1,.14,.88,.6),hc]]),
        legs:[[-.15,.45,.28],[.15,.45,.28],[-.15,.45,-.3],[.15,.45,-.3]],legGeo:leg(.045,.45),legCol:hc,h:.9}; }
    if(t==='cabra'){ const c=pick([0xf0ece4,0x6a4a2a,0x2a2622,0xa88a6a]);
      return {body:bake([[S(.3,1,.95,1.6,0,.75,0,9,7),c],[C(.1,.13,.4,0,.98,.42,.6),c],[B(.15,.2,.32,0,1.08,.62),c],[B(.04,.14,.04,0,.92,.75),0x3a3430],[C(.015,.03,.3,-.06,1.28,.5,-.6,4),0x8a8478],[C(.015,.03,.3,.06,1.28,.5,-.6,4),0x8a8478],[C(.02,.04,.18,0,.95,-.45,-.6,4),c]]),
        legs:[[-.12,.55,.3],[.12,.55,.3],[-.12,.55,-.3],[.12,.55,-.3]],legGeo:leg(.035,.55),legCol:c,h:1}; }
    if(t==='gallina'){ const c=pick([0xf0ece4,0x8a4a22,0x2a2622,0xa86a32,0xd8b080]);
      return {body:bake([[S(.16,1,.95,1.25,0,.32,0,8,6),c],[S(.08,1,1,1,0,.5,.14,8,6),c],[B(.03,.07,.08,0,.6,.15),0xc81e1e],[B(.03,.05,.03,0,.44,.2),0xc81e1e],[C(.0,.035,.08,0,.5,.24,Math.PI/2,5),0xd8a030],[S(.1,.4,1,1.2,0,.42,-.18,6,5),c===0xf0ece4?0xe0dcd0:0x1a1410]]),
        legs:[[-.05,.17,0],[.05,.17,0]],legGeo:leg(.012,.17),legCol:0xd8a030,h:.5,small:1}; }
    if(t==='camello'){ const c=pick([0xb8925a,0xc8a46a,0xa8804a]);
      return {body:bake([[S(.5,1,.9,1.6,0,1.75,0),c],[S(.38,1,1.2,1,0,2.25,-.05),c],[C(.13,.2,1.1,0,2.0,.95,-.25),c],[C(.12,.14,.6,0,2.45,1.15,.5),c],[B(.2,.24,.5,0,2.62,1.45),c],[C(.03,.06,.5,0,1.6,-.85,.3,5),c]]),
        legs:[[-.25,1.4,.55],[.25,1.4,.55],[-.25,1.4,-.55],[.25,1.4,-.55]],legGeo:leg(.08,1.4),legCol:c,h:2.4}; }
    if(t==='carpincho'){ const c=pick([0x7a5a3a,0x8a6a42,0x6a4a2e]);
      return {body:bake([[S(.32,1,.9,1.6,0,.5,0,9,7),c],[B(.28,.3,.38,0,.58,.55),c],[B(.24,.2,.12,0,.52,.76),0x4a3626],[B(.06,.08,.04,-.12,.76,.5),c],[B(.06,.08,.04,.12,.76,.5),c]]),
        legs:[[-.18,.26,.32],[.18,.26,.32],[-.18,.26,-.32],[.18,.26,-.32]],legGeo:leg(.06,.26),legCol:c,h:.7}; }
    // perro: criollo de varios colores
    const c=pick([0x6b4a2a,0x2a2622,0xc8b08a,0x8a6a4a,0xe8e0d0,0xa8743a]), c2=Math.random()<.4?0xe8e0d0:c;
    return {body:bake([[S(.17,1,1,2.5,0,.48,0,8,6),c],[S(.14,1,1,1,0,.62,.4,8,6),c],[B(.14,.12,.18,0,.58,.55),c2],[B(.05,.05,.04,0,.6,.66),0x1a1410],[B(.06,.12,.04,-.08,.75,.36),c],[B(.06,.12,.04,.08,.75,.36),c],[C(.02,.04,.35,0,.58,-.48,-.6,5),c]]),
      legs:[[-.09,.36,.26],[.09,.36,.26],[-.09,.36,-.26],[.09,.36,-.26]],legGeo:leg(.035,.36),legCol:c,h:.7}; }
  // arma el animal sobre el "perro" de la infantería
  function dress(P,t){ const g=P.g; for(const ch of g.children.slice()) g.remove(ch);
    const A=build(t), body=new THREE.Mesh(A.body,vmat); body.castShadow=true; g.add(body);
    const lm=lmat(A.legCol); P.parts={body,head:body,legs:A.legs.map(([x,y,z])=>{ const l=new THREE.Mesh(A.legGeo,lm); l.position.set(x,y,z); l.castShadow=!A.small; g.add(l); return l; })};
    P.animal=t; P.name='Animal ('+NAME[t]+')'; P.topH=A.h; P.aimH=A.h*.6; P.R=A.small?.25:t==='perro'||t==='oveja'||t==='cabra'||t==='carpincho'?.5:.9; }
  const _mp=makePerson;
  makePerson=function(kind,team,x,z){ const P=_mp.apply(this,arguments); if(kind!=='dog') return P;
    let t=window._animalNext; window._animalNext=null; if(!t&&team<=-10) t=TYPES[-team-10]; t=t||'perro';
    try{ dress(P,t); P.team=-10-TYPES.indexOf(t); }catch(e){ console.warn('animales',e); } return P; };
  // muerte: queda de costado (en vez de boca arriba como el perro viejo) con un charco
  const _idf=infDeathFx;
  infDeathFx=function(P,how){ if(!P.animal||how==='crush') return _idf.apply(this,arguments); P.how=how;
    P.g.rotation.z=(Math.random()<.5?1:-1)*1.45; P.g.position.y+=(P.topH||1)*.18; (P.parts.legs||[]).forEach(l=>l.rotation.x=(Math.random()-.5)*.6);
    const bl=new THREE.Mesh(IGEO.blood,bloodMat); bl.scale.setScalar(P.R>.6?1.1:.45); bl.position.set(P.pos.x,heightAt(P.pos.x,P.pos.z)+.05,P.pos.z); scene.add(bl); P.blood=bl; };
  // online: el tipo viaja en el bando
  // (16-online.js crea al animal del invitado con makePerson('dog', team) y el wrapper de arriba lo reconoce)

  // ---- rebaños según el mapa ----
  const HERDS={
    europa:[['vaca',4,8],['vaca',3,6],['caballo',2,4],['oveja',6,12],['gallina',4,8],['perro',1,2]],
    desierto:[['camello',3,6],['cabra',4,9],['camello',2,4],['perro',1,2]],
    nieve:[['vaca',3,5],['caballo',2,3],['perro',1,2]],
    pacifico:[['bufalo',2,4],['cabra',3,6],['gallina',4,8],['perro',1,2]],
    ciudad:[['perro',2,4],['perro',1,3],['caballo',1,2],['gallina',3,5]],
    trinchera:[['caballo',1,2],['perro',1,2],['vaca',2,3]],
    chaco:[['cebu',4,8],['caballo',2,4],['cabra',3,6],['perro',1,3],['gallina',3,6]],
    corrientes:[['vaca',4,8],['cebu',3,6],['caballo',2,4],['perro',2,4],['perro',1,3],['gallina',3,6],['carpincho',3,6]]};
  function herdSet(){ const k=W.key||''; if(W.osm) return 'corrientes'; if(/chaco/.test(k)) return 'chaco'; if(/alamein|kasserine/.test(k)) return 'desierto';
    if(/ardenas/.test(k)) return 'nieve'; if(/okinawa|saipan/.test(k)) return 'pacifico'; if(W.cfgC&&W.cfgC.city) return 'ciudad'; if((W.era||3)<=1) return 'trinchera'; return 'europa'; }
  const okSpot=(x,z,m)=>freeInf(x,z)&&!(W.trench&&W.trench(x,z))&&!(W.wire&&W.wire(x,z))&&gridQuery(x,z,m+2).every(b=>!obPush(x,z,m,b));
  function spawnAnimals(){ if(net.guest) return; const set=HERDS[herdSet()], front=(W.cfgC&&!W.cfgC.noTrench?W.cfgC.front:0)||0; let total=0;
    for(const [t,a,b] of set){ for(let tries=0;tries<40;tries++){ let x=rand(-W.bx*.9,W.bx*.9), z=rand(-W.bz*.9,W.bz*.9);
        if(t==='carpincho'&&W.water!=null){ let ok=false; for(let k=0;k<30&&!ok;k++){ x=rand(-W.bx*.9,W.bx*.9); z=rand(-W.bz*.9,W.bz*.9); const h=heightAt(x,z); ok=h>W.water+.4&&h<W.water+2.2; } if(!ok) break; }
        if(front&&Math.abs(z)<front+50) continue;                                                              // no en la tierra de nadie
        if(W.zones.some(Z=>Math.hypot(Z.x-x,Z.z-z)<Z.r+25)||!okSpot(x,z,1.5)) continue;
        if(W.osm&&['vaca','cebu','caballo'].includes(t)&&streetSegs.length&&distSegs(x,z,streetSegs)<24) continue;   // en Corrientes, las vacas y los caballos en los baldíos y campos, no en las calles
        if(t==='gallina'||t==='perro'){ if(buildings.length){ const Bd=buildings[(Math.random()*buildings.length)|0]; x=Bd.x+rand(-1,1)*(Bd.w/2+4); z=Bd.z+rand(-1,1)*(Bd.d/2+4); if(!okSpot(x,z,.5)) continue; } }
        const n=a+((Math.random()*(b-a+1))|0); for(let i=0;i<n;i++){ const px=x+rand(-6,6), pz=z+rand(-6,6); if(!okSpot(px,pz,.6)) continue; window._animalNext=t; const P=makePerson('dog',-1,px,pz); P.heading=rand(0,6.28); total++; }
        break; } }
    return total; }
  window.spawnAnimals=spawnAnimals;
  // de lejos (más de 70 m) no se dibujan las patas: un animal pasa de 5 llamadas de dibujo a 1
  const _ui=updateInfantry;
  updateInfantry=function(dt){ _ui.apply(this,arguments); const cp=camera.position;
    for(const P of infantry){ if(!P.animal||!P.parts.legs) continue; const near=P.pos.distanceToSquared(cp)<4900; if(P._ln!==near){ P._ln=near; P.parts.legs.forEach(l=>l.visible=near); } } };
  const _ir=initRefuerzos;
  initRefuerzos=function(){ const r=_ir.apply(this,arguments); try{ spawnAnimals(); }catch(e){ console.warn('animales',e); } return r; };
})();
