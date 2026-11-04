// Animales (pedido de Sebastián): vacas (hereford, holando, negras y cebú), caballos criollos, ovejas, cabras, gallinas,
// perros, camellos en el desierto, búfalos de agua en el Pacífico y carpinchos en Corrientes. Usan el sistema de la
// infantería como "perro" (kind 'dog'): pastan dando vueltas, huyen de los tanques y del ruido (civThink), los matan la
// ametralladora, el cañón y las explosiones, y los tanques los atropellan (civiles.js). Matar uno resta (−20, "Animal herido",
// no cuenta para el castigo por civiles). Cada animal: cuerpo y cabeza en una malla con colores por vértice y 4 patas que
// caminan (2 en las gallinas). Online: el tipo viaja en el bando (`team` = −10 − tipo) y el invitado arma el mismo animal.
// Dónde: rebaños en el campo, lejos de la tierra de nadie (`spawnAnimals` desde initRefuerzos, solo el anfitrión), según el mapa
// (`HERDS`): pastos de Europa, desierto, nieve, Pacífico, ciudades (perros y caballos de tiro) y Corrientes.
(function(){
  const TYPES=['perro','vaca','caballo','oveja','cabra','gallina','camello','bufalo','carpincho','cebu','rata'];
  const NAME={perro:'perro',vaca:'vaca',caballo:'caballo',oveja:'oveja',cabra:'cabra',gallina:'gallina',camello:'camello',bufalo:'búfalo',carpincho:'carpincho',cebu:'vaca',rata:'rata'};
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
  // pata con forma (muslo grueso, rodilla, caña fina y pezuña oscura), colores por vértice, pivote arriba
  const _legC={};
  function legGeo(len,r,col,hoof){ const k=len+'|'+r+'|'+col+'|'+hoof; if(_legC[k]) return _legC[k];
    const pts=[[0,0],[r*.55,-.001],[r,-len*.05],[r*.92,-len*.3],[r*.55,-len*.5],[r*.5,-len*.56],[r*.42,-len*.86],[r*.5,-len*.9],[r*.55,-len],[0,-len]].map(([x,y])=>new THREE.Vector2(x,y)).reverse();
    const g=new THREE.LatheGeometry(pts,7); const P=g.attributes.position, c=new Float32Array(P.count*3), a=new THREE.Color(col), h=new THREE.Color(hoof);
    for(let i=0;i<P.count;i++){ const cc=P.getY(i)<-len*.88?h:a; c[i*3]=cc.r; c[i*3+1]=cc.g; c[i*3+2]=cc.b; } g.setAttribute('color',new THREE.BufferAttribute(c,3)); g.deleteAttribute('uv'); g.computeVertexNormals();
    return _legC[k]=g; }
  const rx=(g,a)=>{ g.rotateX(a); return g; };
  // cada tipo: body (partes), head {p:pivote, parts relativas}, legs:[[x,y,z]], leg:[largo, radio, color, pezuña], h (alto), graze (baja la cabeza a comer)
  function build(t){ const R=Math.random();
    if(t==='vaca'||t==='cebu'||t==='bufalo'){ const raza=t==='cebu'?'cebu':t==='bufalo'?'bufalo':pick(['hereford','hereford','holando','angus','criolla']);
      const c=raza==='hereford'?0x7a3a1e:raza==='holando'?0xf0ece4:raza==='angus'?0x1c1a18:raza==='cebu'?0xbab6aa:raza==='bufalo'?0x3a3836:pick([0x8a5a32,0x6a4a2a,0xc8b08a]);
      const face=raza==='hereford'?0xf0ece4:c, dark=0x2a2420;
      const L=[[S(.48,1,.95,1.75,0,1.1,0),c],[S(.42,1,1.08,1,0,1.1,.62),c],[S(.4,1.05,.95,1,0,1.18,-.7),c],[S(.25,1,.8,1.3,0,1.36,.42),c],
        [S(.1,1,1,1,-.27,1.36,-.62,6,5),c],[S(.1,1,1,1,.27,1.36,-.62,6,5),c],[rx(C(.2,.27,.55,0,0,0),1.15).translate(0,1.3,1.02),c],[B(.06,.2,.3,0,1.02,1.0),c],
        [rx(C(.025,.03,.85,0,0,0,0,5),.18).translate(0,.92,-1.1),c],[S(.07,1,1.5,1,0,.5,-1.17,6,5),dark]];
      if(raza==='holando') for(let i=0;i<6;i++) L.push([S(.24,1.05,.8,1.2,(Math.random()<.5?-1:1)*.34,1.1+(Math.random()-.5)*.3,(Math.random()-.5)*1.5,7,5),0x1a1816]);
      if(raza==='cebu'){ L.push([S(.22,1,1.2,1.1,0,1.58,.58),c]); L[7]=[B(.06,.3,.4,0,.98,1.04),c]; }
      if(R<.5&&raza!=='bufalo'&&raza!=='angus') L.push([S(.16,1,.7,1,0,.7,-.35),0xe0a898]);
      const H=[[B(.38,.4,.44,0,0,.22),face],[B(.32,.28,.26,0,-.13,.5),face],[B(.3,.15,.06,0,-.16,.63),0x3a2a26],[S(.045,1,1,1,-.19,.07,.34,5,4),dark],[S(.045,1,1,1,.19,.07,.34,5,4),dark],
        [B(.22,.07,.13,-.29,.1,.12),c],[B(.22,.07,.13,.29,.1,.12),c]];
      if(raza!=='angus'&&raza!=='holando') for(const sx of [-1,1]){ const hg=new THREE.CylinderGeometry(.025,.05,raza==='bufalo'?.55:.3,5); hg.rotateZ(sx*-1.15); hg.translate(sx*(raza==='bufalo'?.38:.27),.2,.12); H.push([hg,raza==='bufalo'?0x2a2826:0xe8e0c8]); }
      return {body:L,head:{p:[0,1.3,1.26],parts:H},legs:[[-.27,.84,.6],[.27,.84,.6],[-.27,.84,-.72],[.27,.84,-.72]],leg:[.84,.12,c,dark],h:1.45,graze:1}; }
    if(t==='caballo'){ const c=pick([0x5a3220,0x7a4a26,0x1c1816,0x9a9690,0xa8743a,0xe8e0d0]), mane=c===0xe8e0d0||c===0x9a9690?0xc8c0b0:0x1a1410, leg=R<.4?0x1a1410:c;
      const L=[[S(.42,1,.95,1.85,0,1.38,0),c],[S(.38,1,1.08,1,0,1.4,.62),c],[S(.41,1,1,1,0,1.44,-.66),c],[rx(C(.15,.3,1.0,0,0,0),.62).translate(0,1.85,1.0),c],
        [rx(B(.07,.85,.13,0,0,0),.62).translate(0,1.95,.9),mane],[rx(C(.05,.13,.95,0,0,0,0,6),.35).translate(0,1.12,-1.08),mane]];
      if(R<.35) L.push([B(.64,.08,.66,0,1.82,-.02),0x5a3a22],[B(.66,.32,.08,0,1.66,-.02),0x4a2e1a],[B(.7,.06,.5,0,1.88,-.02),0x2a2a2a]);   // recado criollo
      const hg=[[B(.21,.25,.36,0,0,.12),c],[B(.17,.2,.34,0,-.08,.4),c],[B(.15,.08,.06,0,-.1,.58),0x2a2420],[B(.06,.14,.05,-.07,.17,.0),c],[B(.06,.14,.05,.07,.17,.0),c],[B(.04,.12,.3,0,.1,-.08),mane]];
      hg.forEach(([g])=>g.rotateX(.95));
      return {body:L,head:{p:[0,2.2,1.32],parts:hg},legs:[[-.2,1.06,.62],[.2,1.06,.62],[-.2,1.06,-.62],[.2,1.06,-.62]],leg:[1.06,.085,leg,0x1a1410],h:1.75,graze:1}; }
    if(t==='oveja'){ const w=pick([0xe8e2d4,0xdcd4c0,0xe8e2d4,0x3a3430]), hc=w===0x3a3430?0x1c1a18:pick([0x2a2622,0xe8e2d4,0x2a2622]);
      const L=[[S(.4,1,.88,1.3,0,.74,0,9,7),w]]; for(let i=0;i<7;i++){ const a=i/7*6.28; L.push([S(.2,1,1,1,Math.cos(a)*.3,.78+Math.sin(a*2)*.1,Math.sin(a)*.42,7,5),w]); } L.push([S(.22,1,1,1,0,.9,.36,8,6),w]);
      return {body:L,head:{p:[0,.86,.48],parts:[[B(.16,.2,.3,0,-.04,.12),hc],[B(.17,.05,.09,-.13,.03,.04),hc],[B(.17,.05,.09,.13,.03,.04),hc]]},legs:[[-.15,.46,.28],[.15,.46,.28],[-.15,.46,-.3],[.15,.46,-.3]],leg:[.46,.05,hc,0x1a1410],h:.95,graze:1}; }
    if(t==='cabra'){ const c=pick([0xf0ece4,0x6a4a2a,0x2a2622,0xa88a6a]);
      const H=[[B(.14,.18,.3,0,0,.12),c],[B(.04,.14,.04,0,-.15,.22),0x3a3430],[B(.14,.05,.08,-.11,.06,.02),c],[B(.14,.05,.08,.11,.06,.02),c]];
      for(const sx of [-1,1]){ const hg=new THREE.CylinderGeometry(.012,.03,.32,4); hg.rotateX(-1.0); hg.translate(sx*.05,.2,-.06); H.push([hg,0x6a6458]); }
      return {body:[[S(.3,1,.95,1.6,0,.78,0,9,7),c],[S(.24,1,1.05,1,0,.78,.36),c],[rx(C(.09,.13,.42,0,0,0),.6).translate(0,.98,.48),c],[rx(C(.02,.04,.2,0,0,0,0,4),-.7).translate(0,.95,-.46),c]],
        head:{p:[0,1.12,.6],parts:H},legs:[[-.12,.55,.32],[.12,.55,.32],[-.12,.55,-.32],[.12,.55,-.32]],leg:[.55,.045,c,0x2a2420],h:1.05,graze:1}; }
    if(t==='gallina'){ const c=pick([0xf0ece4,0x8a4a22,0x2a2622,0xa86a32,0xd8b080]);
      return {body:[[S(.16,1,.95,1.2,0,.32,0,8,6),c],[rx(B(.05,.22,.16,0,0,0),-.5).translate(0,.44,-.16),c===0xf0ece4?0xe0dcd0:0x1a1410],[S(.09,1,1.2,1,0,.42,.1,7,5),c]],
        head:{p:[0,.48,.12],parts:[[S(.075,1,1,1,0,.06,.04,7,5),c],[B(.025,.06,.08,0,.13,.04),0xc81e1e],[B(.025,.05,.03,0,0,.1),0xc81e1e],[rx(C(.0,.03,.08,0,0,0,0,5),Math.PI/2).translate(0,.05,.13),0xd8a030]]},
        legs:[[-.05,.18,0],[.05,.18,0]],leg:[.18,.018,0xd8a030,0xd8a030],h:.5,small:1,graze:2}; }
    if(t==='camello'){ const c=pick([0xb8925a,0xc8a46a,0xa8804a]);
      return {body:[[S(.45,.82,.85,1.55,0,1.65,0),c],[S(.36,.78,1.0,1.15,0,2.02,-.05),c],[S(.34,.85,1,1,0,1.6,.6),c],[rx(C(.15,.24,.75,0,0,0),2.05).translate(0,1.45,1.1),c],
        [rx(C(.12,.15,.7,0,0,0),.3).translate(0,1.82,1.42),c],[rx(C(.03,.05,.55,0,0,0,0,5),.3).translate(0,1.48,-.9),c]],
        head:{p:[0,2.15,1.52],parts:[[B(.2,.22,.32,0,.02,.12),c],[B(.16,.16,.26,0,-.04,.36),c],[B(.05,.12,.05,-.07,.15,0),c],[B(.05,.12,.05,.07,.15,0),c]]},
        legs:[[-.24,1.42,.55],[.24,1.42,.55],[-.24,1.42,-.55],[.24,1.42,-.55]],leg:[1.42,.09,c,0x6a5a42],h:2.4,graze:1}; }
    if(t==='carpincho'){ const c=pick([0x7a5a3a,0x8a6a42,0x6a4a2e]);
      return {body:[[S(.33,1,.9,1.55,0,.5,0,9,7),c],[S(.32,1.05,1,1,0,.54,-.32),c]],head:{p:[0,.6,.42],parts:[[B(.27,.3,.42,0,-.02,.14),c],[B(.24,.2,.1,0,-.08,.36),0x4a3626],[S(.03,1,1,1,-.13,.06,.18,5,4),0x1a1410],[S(.03,1,1,1,.13,.06,.18,5,4),0x1a1410],[B(.06,.08,.05,-.11,.15,.0),c],[B(.06,.08,.05,.11,.15,.0),c]]},
        legs:[[-.18,.28,.3],[.18,.28,.3],[-.18,.28,-.3],[.18,.28,-.3]],leg:[.28,.065,c,0x2a2018],h:.75,graze:1}; }
    if(t==='rata'){ const c=pick([0x4a4440,0x5a4a3e,0x3a3430]);
      return {body:[[S(.06,1,.9,1.9,0,.07,0,7,5),c],[rx(C(.006,.012,.26,0,0,0,0,4),Math.PI/2-.15).translate(0,.06,-.24),0xb8908a]],head:{p:[0,.08,.1],parts:[[rx(C(.0,.045,.12,0,0,0,0,6),Math.PI/2).translate(0,0,.05),c],[B(.04,.04,.01,-.03,.04,0),0xb8908a],[B(.04,.04,.01,.03,.04,0),0xb8908a]]},
        legs:[],leg:[.05,.01,c,c],h:.15,small:1,graze:2}; }
    // perro criollo
    const c=pick([0x6b4a2a,0x2a2622,0xc8b08a,0x8a6a4a,0xe8e0d0,0xa8743a]), c2=Math.random()<.4?0xe8e0d0:c;
    return {body:[[S(.17,1,1,2.3,0,.5,0,8,6),c],[S(.16,1,1.15,1,0,.52,.25,8,6),c2],[rx(C(.08,.11,.25,0,0,0),.7).translate(0,.62,.4),c],[rx(C(.02,.035,.36,0,0,0,0,5),-.9).translate(0,.64,-.5),c]],
      head:{p:[0,.72,.48],parts:[[S(.11,1,1,1.1,0,0,.02,8,6),c],[B(.08,.08,.17,0,-.03,.14),c2],[B(.04,.035,.03,0,-.01,.23),0x1a1410],[B(.06,.12,.04,-.07,.1,-.02),c],[B(.06,.12,.04,.07,.1,-.02),c]]},
      legs:[[-.09,.38,.24],[.09,.38,.24],[-.09,.38,-.25],[.09,.38,-.25]],leg:[.38,.04,c,0x2a2420],h:.75}; }
  // arma el animal sobre el "perro" de la infantería: cuerpo, cabeza con pivote (para comer) y patas
  function dress(P,t){ const g=P.g; for(const ch of g.children.slice()) g.remove(ch);
    const A=build(t), body=new THREE.Mesh(bake(A.body),vmat); body.castShadow=!A.small||t==='gallina'; g.add(body);
    const hp=new THREE.Group(); hp.position.fromArray(A.head.p); g.add(hp); const head=new THREE.Mesh(bake(A.head.parts),vmat); head.castShadow=body.castShadow; hp.add(head);
    const LG=legGeo(...A.leg); P.parts={body,head:hp,legs:A.legs.map(([x,y,z])=>{ const l=new THREE.Mesh(LG,vmat); l.position.set(x,y,z); l.castShadow=!A.small; g.add(l); return l; })};
    P.animal=t; P.graze=A.graze||0; P.name='Animal ('+NAME[t]+')'; P.topH=A.h; P.aimH=A.h*.6; P.R=A.small?.25:t==='perro'||t==='oveja'||t==='cabra'||t==='carpincho'?.5:.9; }
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
    ciudad:[['perro',2,4],['perro',1,3],['caballo',1,2],['gallina',3,5],['rata',4,7],['rata',3,6]],
    trinchera:[['caballo',1,2],['perro',1,2],['vaca',2,3],['rata',4,8],['rata',4,8]],
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
  // pastar: si está quieto, de a ratos baja la cabeza (las gallinas y las ratas picotean); si huye, la levanta
  const _ui0=updateInfantry;
  updateInfantry=function(dt){ _ui0.apply(this,arguments);
    for(const P of infantry){ if(!P.animal||P.dead||!P.parts.head) continue; const H=P.parts.head; let tg=0;
      if(P.graze&&!P.flee&&(P.spd||0)<.4){ P.grT=(P.grT??Math.random()*6)-dt; if(P.grT<-(P.graze===2?.35:4)) P.grT=P.graze===2?rand(.3,1.5):rand(3,9); if(P.grT<0) tg=P.graze===2?.9+Math.sin(now*22)*.3:1.0; }
      else if(P.flee) tg=-.15;
      H.rotation.x+=(tg-H.rotation.x)*Math.min(1,dt*(P.graze===2?14:3)); } };
  // de lejos (más de 70 m) no se dibujan las patas: un animal pasa de 5 llamadas de dibujo a 1
  const _ui=updateInfantry;
  updateInfantry=function(dt){ _ui.apply(this,arguments); const cp=camera.position;
    for(const P of infantry){ if(!P.animal||!P.parts.legs) continue; const near=P.pos.distanceToSquared(cp)<4900; if(P._ln!==near){ P._ln=near; P.parts.legs.forEach(l=>l.visible=near); } } };
  const _ir=initRefuerzos;
  initRefuerzos=function(){ const r=_ir.apply(this,arguments); try{ spawnAnimals(); }catch(e){ console.warn('animales',e); } return r; };
})();
