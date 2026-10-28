/* ---------- Infantería y civiles ---------- */
const infantry=[], noises=[];
/* ---------- Infantería, civiles, perros, tránsito y aviones civiles ---------- */
const skinMat=new THREE.MeshLambertMaterial({color:0xc69c78}), CIV_COL=[0x2f5d8a,0xb33a3a,0xd9c27a,0x5e8a4a,0xeeeeee,0x6b4e8a,0xd98a3a];
const helmetMat=new THREE.MeshLambertMaterial({color:0x3d4230}), bootMat=new THREE.MeshLambertMaterial({color:0x2a2622});
const RIFLE={n:'Fusil',kind:'ke',pen:8,v:600}, ROCKET0={n:'Cohete antitanque',kind:'heat',pen:330,v:150}, MORTAR0={n:'Mortero 81 mm',kind:'he',pen:12,v:95,sc:.6};
let ROCKET=ROCKET0, MORTAR=MORTAR0; // cambian con la época (ver buildWorld)
const IGEO=(()=>{ const pv=(w,h,d)=>{ const g=new THREE.BoxGeometry(w,h,d); g.translate(0,-h/2,0); return g; };
  const bl=new THREE.CircleGeometry(1,10); bl.rotateX(-Math.PI/2);
  return {torso:new THREE.BoxGeometry(.44,.6,.26),head:new THREE.SphereGeometry(.15,8,6),helm:new THREE.SphereGeometry(.18,8,5,0,Math.PI*2,0,1.45),
    leg:pv(.17,.86,.18),arm:pv(.12,.58,.12),gun:new THREE.BoxGeometry(.07,.07,.95),tube:new THREE.CylinderGeometry(.08,.08,1.1,6),hmg:new THREE.BoxGeometry(.11,.13,1.35),
    mort:new THREE.CylinderGeometry(.06,.07,1.0,6),pack:new THREE.BoxGeometry(.34,.4,.18),dogB:new THREE.BoxGeometry(.28,.3,.75),dogH:new THREE.BoxGeometry(.2,.2,.32),dogL:pv(.08,.36,.08),blood:bl}; })();
const bloodMat=new THREE.MeshBasicMaterial({color:0x4a120d,transparent:true,opacity:.7,depthWrite:false});
const gibGeo=new THREE.BoxGeometry(.13,.1,.12), gibMat=new THREE.MeshLambertMaterial({color:0x6a1a12});
const INF_KIND={rifle:'Fusilero',at:'Soldado antitanque',hmg:'Ametralladora pesada',sniper:'Francotirador',eng:'Ingeniero',mortar:'Mortero',civ:'Civil',dog:'Perro'};
const KIND_CODE={civ:0,rifle:1,at:2,hmg:3,sniper:4,eng:5,mortar:6,dog:7}, CODE_KIND=Object.fromEntries(Object.entries(KIND_CODE).map(([k,v])=>[v,k]));
let infSeq=0;
// ---------- Personas: cuerpos de hombre y de mujer, ropa, pelo, equipo y armas (geometrías compartidas) ----------
const _pmat=new Map(); const pMat=hex=>{ let m=_pmat.get(hex); if(!m){ m=new THREE.MeshLambertMaterial({color:hex}); _pmat.set(hex,m); } return m; };
const SKINS=[0xe3bc9a,0xd4a882,0xc69c78,0xb0825e,0x8f6444,0x6e4a32], HAIRS=[0x15110e,0x2a1e16,0x3e2a1c,0x5a3c24,0x7a5a36,0xb08a52,0x8a8478];
const SHIRTS=[0xf2f0ea,0x2f5d8a,0xb33a3a,0xd9c27a,0x5e8a4a,0x6b4e8a,0xd98a3a,0x2a2a2a,0x8ab0c8,0xc87a9a,0x3a6a6a,0xe8d8b0];
const PANTS=[0x2c3446,0x3a4a6a,0x22324a,0x4a3b2a,0x2a2a2a,0x6a6458,0xb8ae96];
const PG=(()=>{ const T=(rt,rb,h,seg=8)=>{ const g=new THREE.CylinderGeometry(rt,rb,h,seg); g.translate(0,-h/2,0); return g; };
  const sph=(r,w=10,h=8,ts=0,tl=Math.PI)=>new THREE.SphereGeometry(r,w,h,0,Math.PI*2,ts,tl);
  const torsoM=new THREE.CylinderGeometry(.205,.165,.58,10); torsoM.scale(1,1,.6);
  const torsoF=new THREE.CylinderGeometry(.175,.15,.56,10); torsoF.scale(1,1,.6);
  const hips=new THREE.CylinderGeometry(.16,.19,.2,10); hips.scale(1,1,.68);
  const head=sph(.112,12,10); head.scale(.88,1.06,.98);
  const hairS=sph(.12,12,7,0,1.55); hairS.scale(.92,1.02,1.02);
  const hairL=sph(.125,12,9,0,2.2); hairL.scale(.95,1.12,1.06);
  const pony=new THREE.CylinderGeometry(.05,.025,.26,6); pony.translate(0,-.13,0);
  const helm=sph(.152,12,6,0,1.45); helm.scale(1,.86,1.06);
  const brim=new THREE.CylinderGeometry(.165,.165,.02,14);
  const crewH=sph(.14,10,7,0,1.7); crewH.scale(1,.95,1.08);
  const cap=sph(.122,10,6,0,1.5); const visor=new THREE.CylinderGeometry(.09,.09,.015,10,1,false,-Math.PI/2,Math.PI); visor.scale(1,1,1.2);
  const skirt=new THREE.CylinderGeometry(.165,.27,.48,12,1,true); skirt.translate(0,-.24,0);
  const bust=sph(.07,8,6); bust.scale(1.05,.78,.5);
  const vest=new THREE.BoxGeometry(.4,.36,.28); const belt=new THREE.CylinderGeometry(.17,.17,.06,10); belt.scale(1,1,.65);
  const shoe=new THREE.BoxGeometry(.1,.08,.25); shoe.translate(0,0,.05);
  const boot=new THREE.BoxGeometry(.115,.16,.27); boot.translate(0,.04,.05);
  const hand=sph(.042,6,5); const neck=new THREE.CylinderGeometry(.05,.055,.1,6);
  const pack=new THREE.BoxGeometry(.32,.42,.17), bag=new THREE.BoxGeometry(.06,.24,.3), pouch=new THREE.BoxGeometry(.09,.1,.06);
  // fusil: cajón, cañón, cargador y culata
  const rifle=(()=>{ const parts=[[.06,.09,.5,0,0,.05],[.035,.035,.42,0,.015,.5],[.05,.16,.07,0,-.1,.12],[.05,.11,.26,0,-.03,-.3],[.04,.06,.1,0,-.06,-.06]];
    const gs=parts.map(([w,h,d,x,y,z])=>{ const g=new THREE.BoxGeometry(w,h,d); g.translate(x,y,z); return g; }); return gs; })();
  return {legM:T(.085,.058,.86),legF:T(.078,.052,.84),armM:T(.056,.042,.58),armF:T(.048,.036,.56),torsoM,torsoF,hips,head,hairS,hairL,pony,helm,brim,crewH,cap,visor,skirt,bust,vest,belt,shoe,boot,hand,neck,pack,bag,pouch,rifle,
    tube:new THREE.CylinderGeometry(.075,.075,1.1,8),hmg:new THREE.BoxGeometry(.11,.13,1.35),mort:new THREE.CylinderGeometry(.06,.07,1.0,8)}; })();
// Unir mallas en una sola con colores por vértice (menos llamadas de dibujo: personas y vehículos corren livianos)
const vcMat=new THREE.MeshLambertMaterial({vertexColors:true}), _bc=new THREE.Color();
function mergeColored(list,root){ // list: [{mesh,color}] -> BufferGeometry en el espacio de root
  root.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(root.matrixWorld).invert(), P=[], N=[], C=[], m4=new THREE.Matrix4(), nm=new THREE.Matrix3();
  for(const {mesh,color} of list){ let g=mesh.geometry; if(g.index) g=g.toNonIndexed(); m4.multiplyMatrices(inv,mesh.matrixWorld); nm.getNormalMatrix(m4);
    const pa=g.attributes.position, na=g.attributes.normal, v=new THREE.Vector3(); _bc.set(color);
    for(let i=0;i<pa.count;i++){ v.fromBufferAttribute(pa,i).applyMatrix4(m4); P.push(v.x,v.y,v.z); if(na){ v.fromBufferAttribute(na,i).applyMatrix3(nm).normalize(); N.push(v.x,v.y,v.z); } else N.push(0,1,0); C.push(_bc.r,_bc.g,_bc.b); } }
  const G=new THREE.BufferGeometry(); G.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); G.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); G.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); G.computeBoundingSphere(); return G; }
// Une cada parte del cuerpo con sus accesorios (pelo, casco, chaleco, zapatos, mano…) en una sola malla
function bakePart(part){ const list=[]; part.traverse(o=>{ if(o.isMesh) list.push({mesh:o,color:o.material.color.getHex()}); }); if(list.length<2) return part;
  const G=mergeColored(list,part); for(const ch of part.children.slice()) part.remove(ch); part.geometry=G; part.material=vcMat; return part; }
// Une todas las piezas fijas de un vehículo: una malla opaca con colores por vértice y otra para los vidrios
function bakeVehicle(g,skip){ const op=[], gl=[]; g.updateMatrixWorld(true);
  g.traverse(o=>{ if(!o.isMesh||skip.has(o)) return; for(let p=o.parent;p&&p!==g;p=p.parent) if(skip.has(p)) return; (o.material===glassMat?gl:op).push({mesh:o,color:o.material.color?o.material.color.getHex():0xffffff}); });
  const kill=[...op,...gl].map(x=>x.mesh); const ud=g.userData, body=new THREE.MeshLambertMaterial({vertexColors:true});
  if(op.length){ const m=new THREE.Mesh(mergeColored(op,g),body); m.castShadow=true; g.add(m); }
  if(gl.length){ const m=new THREE.Mesh(mergeColored(gl,g),glassMat); g.add(m); }
  for(const k of kill) k.parent&&k.parent.remove(k); ud.mats=[body]; ud.m=body; }
const _rifG={}; function rifleMesh(len){ const k=len||1; if(!_rifG[k]){ const g=new THREE.Group(); PG.rifle.forEach((geo,i)=>{ const m=new THREE.Mesh(geo,i===3?pMat(0x3a2e22):darkMat); g.add(m); }); g.scale.z=k; const G2=new THREE.Group(); G2.add(g); _rifG[k]=mergeColored([...g.children].map(m=>({mesh:m,color:m.material.color.getHex()})),G2); } return new THREE.Mesh(_rifG[k],vcMat); }
function personMesh(o){
  const kind=o.kind, civ=kind==='civ', crew=kind==='crew', g=o.g||new THREE.Group();
  const female=civ?Math.random()<.5:(!crew&&RULE().female!==0&&Math.random()<.08);
  const skin=pMat(apick(SKINS)), hairC=pMat(Math.random()<.12&&civ?0x8a8478:apick(HAIRS.slice(0,6)));
  const nat=o.nat||(o.team===0?allyNation:foeNation), camo=NATIONS[nat]?new THREE.Color((NATIONS[nat].uni||NATIONS[nat].camo)[0]).multiplyScalar(NATIONS[nat].uni?1:.85).getHex():0x4a5236;
  const top=pMat(civ?apick(SHIRTS):crew?0x34382c:camo), dress=civ&&female&&Math.random()<.45;
  const bottom=dress?top:pMat(civ?(female&&Math.random()<.3?apick([0x1e1e22,0x7a2e3a,0xd8d0c0,0x3a4a6a]):apick(PANTS)):crew?0x34382c:camo);
  const hip=new THREE.Group(); hip.position.y=female?.86:.88; g.add(hip);
  const torso=new THREE.Mesh(female?PG.torsoF:PG.torsoM,top); torso.position.y=.3; hip.add(torso);
  const hp=new THREE.Mesh(PG.hips,dress?top:bottom); hp.position.y=.02; torso.add(hp); hp.position.y=-.28;
  const neck=new THREE.Mesh(PG.neck,skin); neck.position.y=.33; torso.add(neck);
  const head=new THREE.Mesh(PG.head,skin); head.position.y=.74; hip.add(head);
  // pelo y gorros
  if(civ){ if(female){ const h=new THREE.Mesh(PG.hairL,hairC); h.position.set(0,.02,-.012); head.add(h); if(Math.random()<.4){ const pt=new THREE.Mesh(PG.pony,hairC); pt.position.set(0,.02,-.12); pt.rotation.x=.35; head.add(pt); } }
    else if(Math.random()<.22){ const c=new THREE.Mesh(PG.cap,pMat(apick([0x1e2a44,0xb33a3a,0xeeeeee,0x2a2a2a]))); c.position.y=.025; head.add(c); const v=new THREE.Mesh(PG.visor,c.material); v.position.set(0,.03,.1); head.add(v); }
    else if(Math.random()>.08){ const h=new THREE.Mesh(PG.hairS,hairC); h.position.y=.012; head.add(h); } }
  else if(crew){ const h=new THREE.Mesh(PG.crewH,pMat(0x2a2622)); h.position.y=.02; head.add(h); }
  else if(NATIONS[nat]&&NATIONS[nat].helm) eraHelmet(head,NATIONS[nat].helm,female,hairC);
  else { const hm=new THREE.Mesh(PG.helm,helmetMat); hm.position.y=.045; head.add(hm); const br=new THREE.Mesh(PG.brim,helmetMat); br.position.y=.035; head.add(br);
    if(female){ const pt=new THREE.Mesh(PG.pony,hairC); pt.position.set(0,-.02,-.12); pt.rotation.x=.5; head.add(pt); } }
  // piernas, pies, brazos y manos
  const LG=female?PG.legF:PG.legM, legMat=dress?skin:bottom;
  const legL=new THREE.Mesh(LG,legMat), legR=new THREE.Mesh(LG,legMat); const lx=female?.085:.1; legL.position.set(-lx,0,0); legR.position.set(lx,0,0); hip.add(legL,legR);
  const footG=civ?PG.shoe:PG.boot, footM=civ?pMat(apick([0x2a2622,0x4a3626,0xeeeeee,0x1e1e22])):bootMat;
  for(const L of [legL,legR]){ const f=new THREE.Mesh(footG,footM); f.position.y=-.84; L.add(f); }
  if(dress){ const sk=new THREE.Mesh(PG.skirt,top); sk.position.y=.06; hip.add(sk); }
  const AG=female?PG.armF:PG.armM, sl=civ&&Math.random()<.5?skin:top, ax=female?.2:.235;
  const armL=new THREE.Mesh(AG,sl), armR=new THREE.Mesh(AG,sl); armL.position.set(-ax,.56,0); armR.position.set(ax,.56,0); hip.add(armL,armR);
  for(const A of [armL,armR]){ const h=new THREE.Mesh(PG.hand,skin); h.position.y=-.6; A.add(h); }
  // equipo militar
  if(!civ){ const vm=pMat(crew?0x2a2e24:new THREE.Color(camo).multiplyScalar(.7).getHex());
    if(!crew){ const v=new THREE.Mesh(PG.vest,vm); v.position.y=.06; torso.add(v); for(const sx of [-.1,0,.1]){ const pu=new THREE.Mesh(PG.pouch,vm); pu.position.set(sx,-.08,.16); torso.add(pu); } }
    const bt=new THREE.Mesh(PG.belt,pMat(0x2a2622)); bt.position.y=-.27; torso.add(bt); }
  else if(Math.random()<.3){ const bg=new THREE.Mesh(PG.bag,pMat(apick([0x5a3a22,0x2a2a2a,0x8a2a2a,0xc8b090]))); bg.position.set(female?-.2:-.24,-.22,0); torso.add(bg); }
  let wep=null;
  if(kind==='rifle'||kind==='eng'){ wep=rifleMesh(1); wep.position.set(.1,.36,.3); }
  else if(kind==='sniper'){ wep=rifleMesh(1.4); wep.position.set(.1,.38,.34); const sc=new THREE.Mesh(PG.hand,darkMat); sc.scale.set(.6,.6,2.2); sc.position.set(0,.08,.05); wep.add(sc); }
  else if(kind==='at'&&RULE().at&&!RULE().at.tube){ wep=rifleMesh(1.7); wep.position.set(.1,.36,.36); } // fusil antitanque (Primera Guerra y Entreguerras); en la 2ª, lanzacohetes (tubo)
  else if(kind==='at'){ wep=new THREE.Mesh(PG.tube,pMat(0x4a5a3a)); wep.rotation.x=Math.PI/2; wep.position.set(.22,.62,.1); }
  else if(kind==='hmg'){ wep=new THREE.Mesh(PG.hmg,darkMat); wep.position.set(0,.3,.5); }
  else if(kind==='mortar'){ wep=new THREE.Mesh(PG.mort,darkMat); wep.rotation.x=.4; wep.position.set(0,.45,-.22); }
  if(wep) hip.add(wep);
  if(kind==='eng'||kind==='mortar'||(kind==='rifle'&&Math.random()<.5)){ const pk=new THREE.Mesh(PG.pack,pMat(0x4a4a36)); pk.position.set(0,.32,-.2); hip.add(pk); }
  if(female) g.scale.setScalar(.95);
  for(const pt of [torso,head,legL,legR,armL,armR]) bakePart(pt);
  for(const ch of hip.children.slice()) if(ch!==torso&&ch!==head&&ch!==legL&&ch!==legR&&ch!==armL&&ch!==armR&&ch!==wep&&ch.isMesh&&ch.geometry.type!=='BufferGeometry'){ }
  g.traverse(m=>{ if(m.isMesh) m.castShadow=true; });
  return {g,female,parts:{hip,torso,head,legL,legR,armL,armR,wep}};
}
function makePerson(kind,team,x,z){
  const g=new THREE.Group(), civ=kind==='civ', dog=kind==='dog';
  const P={kind,team:civ||dog?-1:team,g,pos:g.position,dead:false,deadT:0,inf:true,isPlayer:false,heading:rand(0,6.28),thinkT:rand(0,.5),fireT:rand(1,4),target:null,goal:null,
    flee:false,name:INF_KIND[kind]||'Soldado',T:{label:'Infantería',m:{gr:.05}},topH:dog?.6:1.7,aimH:dog?.4:1.1,R:.5,bob:rand(0,6),pose:0,parts:{},spd:0,mv:0};
  if(dog){ const fur=new THREE.MeshLambertMaterial({color:[0x6b4a2a,0x2a2622,0xc8b08a,0x8a6a4a][(Math.random()*4)|0]});
    const b=new THREE.Mesh(IGEO.dogB,fur); b.position.y=.5; g.add(b); const h=new THREE.Mesh(IGEO.dogH,fur); h.position.set(0,.68,.48); g.add(h);
    P.parts.legs=[[-.1,.3],[.1,.3],[-.1,-.28],[.1,-.28]].map(([lx,lz])=>{ const l=new THREE.Mesh(IGEO.dogL,fur); l.position.set(lx,.38,lz); g.add(l); return l; });
    P.parts.body=b; P.parts.head=h; }
  else { const pm=personMesh({kind,team,g}); P.parts=pm.parts; P.armed=!civ; P.female=pm.female; }
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  g.position.set(x,heightAt(x,z),z); scene.add(g);
  P.id=++infSeq; infantry.push(P); return P;
}
// Animación: caminar/correr, agacharse, cuerpo a tierra, cubrirse la cabeza (civiles)
function animInf(P,dt){
  const p=P.parts; if(!p||P.dead) return; const spd=P.spd||0;
  if(P.kind==='dog'){ P.bob+=dt*(2+spd*3); const a=spd>.2?Math.sin(P.bob)*.7:0; p.legs.forEach((l,i)=>l.rotation.x=(i===0||i===3)?a:-a); P.g.rotation.y=P.heading; return; }
  P.bob+=dt*(1.5+spd*2.2); const sw=spd>.2?Math.sin(P.bob)*Math.min(.95,.3+spd*.14):0, k=Math.min(1,dt*8);
  let hy=.88, lean=spd>3.5?.25:0, legF=0;
  if(P.pose===1){ hy=.58; legF=.8; lean=.3; } else if(P.pose===2){ hy=.2; lean=1.45; } else if(P.pose===3){ hy=.48; legF=1.1; lean=.7; } else if(P.pose===4){ hy=.72; legF=.4; lean=.5; } // 4 = corre agachado
  p.hip.position.y+=(hy-p.hip.position.y)*k; p.hip.rotation.x+=(lean-p.hip.rotation.x)*k;
  const lf=P.pose===2?-1.45:-legF*.6;
  p.legL.rotation.x=lf+(P.pose===2?0:sw); p.legR.rotation.x=lf-(P.pose===2?0:sw);
  if(P.pose===3){ p.armL.rotation.x=-2.6; p.armR.rotation.x=-2.6; }
  else if(P.armed&&(spd<3.5||P.pose===4)&&P.kind!=='mortar'){ const kk=now-(P.kickT||0)<.12?.22:0; p.armL.rotation.x=-1.15-kk; p.armR.rotation.x=-1.0-kk; } // retroceso al tirar
  else { p.armL.rotation.x=-sw*.9; p.armR.rotation.x=sw*.9; }
  P.g.rotation.y=P.heading;
}
// Muerte: cae, queda aplastado, o se desmiembra si lo alcanza una explosión
function infDeathFx(P,how){
  P.how=how;
  if(how==='crush'){ P.g.scale.y=.18; P.g.position.y=heightAt(P.pos.x,P.pos.z)+.05; }
  else if(how==='blast'&&P.parts&&P.parts.hip){ P.gibs=[]; P.g.updateMatrixWorld(true);
    for(const key of ['head','armL','armR','legL','legR','torso']){ const m=P.parts[key]; if(!m) continue; const wp=new THREE.Vector3(), wq=new THREE.Quaternion(); m.getWorldPosition(wp); m.getWorldQuaternion(wq);
      const c=new THREE.Mesh(m.geometry,m.material); c.position.copy(wp); c.quaternion.copy(wq); scene.add(c);
      P.gibs.push({m:c,v:new THREE.Vector3(rand(-4,4),rand(3,8),rand(-4,4)),av:new THREE.Vector3(rand(-9,9),rand(-9,9),rand(-9,9)),rest:false}); }
    // pedazos chicos (carne, tela y equipo) que vuelan más lejos
    for(let i=0;i<7;i++){ const c=new THREE.Mesh(gibGeo,i<4?gibMat:i<6&&P.parts.torso?P.parts.torso.material:darkMat); c.scale.set(rand(.5,1.3),rand(.4,1),rand(.5,1.3));
      c.position.copy(P.pos).add(new THREE.Vector3(rand(-.3,.3),rand(.6,1.4),rand(-.3,.3))); scene.add(c);
      P.gibs.push({m:c,v:new THREE.Vector3(rand(-7,7),rand(4,10),rand(-7,7)),av:new THREE.Vector3(rand(-12,12),rand(-12,12),rand(-12,12)),rest:false}); }
    P.g.visible=false;
    for(let i=0;i<4;i++) puff(P.pos.clone().add(new THREE.Vector3(rand(-.6,.6),rand(.5,1.5),rand(-.6,.6))),0x5a1810,rand(.8,1.4),.7,.6,.6);
    const bl=new THREE.Mesh(IGEO.blood,bloodMat); bl.scale.setScalar(rand(.9,1.6)); bl.position.set(P.pos.x,heightAt(P.pos.x,P.pos.z)+.06,P.pos.z); scene.add(bl); P.blood=bl; }
  else { P.g.rotation.x=-Math.PI/2*(Math.random()<.5?1:-1); P.g.position.y+=.22;
    if(P.parts&&P.parts.hip){ P.parts.hip.rotation.x=0; P.parts.hip.position.y=.88; } }
}
function updGibs(P,dt){ if(!P.gibs) return; for(const gb of P.gibs){ if(gb.rest) continue; gb.v.y-=9.8*dt; gb.m.position.addScaledVector(gb.v,dt);
    gb.m.rotation.x+=gb.av.x*dt; gb.m.rotation.y+=gb.av.y*dt; gb.m.rotation.z+=gb.av.z*dt; const gh=heightAt(gb.m.position.x,gb.m.position.z)+.08;
    if(gb.m.position.y<gh){ gb.m.position.y=gh; gb.v.multiplyScalar(.3); gb.v.y=Math.abs(gb.v.y)*.3; if(gb.v.length()<.6) gb.rest=true; } } }
function removeInf(P){ scene.remove(P.g); if(P.gibs) P.gibs.forEach(G=>scene.remove(G.m)); if(P.blood) scene.remove(P.blood); const i=infantry.indexOf(P); if(i>=0) infantry.splice(i,1); }
function dismount(t){
  if(!t.troops||t.dead) return false; const n=t.troops; t.troops=0;
  const back=new THREE.Vector3(-Math.sin(t.heading),0,-Math.cos(t.heading)), mine=t.team===0?1:-1;
  const Z=nearestZone(t.pos.x,t.pos.z,Z=>Z.owner!==mine)||nearestZone(t.pos.x,t.pos.z);
  for(let i=0;i<n;i++){ const p=t.pos.clone().addScaledVector(back,t.T.m.L*.6+1).add(new THREE.Vector3(rand(-2,2),0,rand(-2,2)));
    const P=makePerson(i===0?'at':i===1&&n>3?'hmg':'rifle',t.team,p.x,p.z); P.noEmb=now+60; if(Z){const a=rand(0,6.28),r=rand(0,Z.r*.7); P.goal={x:Z.x+Math.cos(a)*r,z:Z.z+Math.sin(a)*r};} }
  feed(`${t.name} bajó a la infantería (${t.T.label})`,t.team===0?'var(--ally)':'var(--enemy)');
  tell(t,'Infantería desplegada','var(--ally)');
  return true;
}
function spawnSquad(team){
  const pts=(W.infSp&&W.infSp[team])||W.sp[team], sp=pts[(Math.random()*pts.length)|0], r0=Math.random(); // en los mapas grandes, la infantería entra por su trinchera
  const special=r0<.3?'hmg':r0<.5?'sniper':r0<.75?'eng':'mortar';
  ['rifle','rifle','at',special,Math.random()<.5?'rifle':'at'].forEach(k=>{ const a=rand(0,6.28), r=rand(4,10); makePerson(k,team,sp.x+Math.cos(a)*r,sp.z+Math.sin(a)*r); });
}
const freeInf=(x,z)=>!gridQuery(x,z,1).some(b=>obInside(b,x,z))&&(W.water==null||heightAt(x,z)>W.water+.5)&&(!W.boundary||inPoly(x,z,W.boundary))&&Math.abs(x)<W.bx-2&&Math.abs(z)<W.bz-2;
function spawnCivilians(n){
  for(let i=0;i<n;i++){ let x,z,ok=false;
    for(let k=0;k<20&&!ok;k++){ const B=buildings.length?buildings[(Math.random()*buildings.length)|0]:null;
      x=B?B.x+rand(-1,1)*(B.w/2+3):rand(-W.bx*.6,W.bx*.6); z=B?B.z+rand(-1,1)*(B.d/2+3):rand(-W.bz*.6,W.bz*.6); ok=freeInf(x,z); }
    if(ok) makePerson(i%6===5?'dog':'civ',-1,x,z); }
}
function noise(p,r){ noises.push({x:p.x,z:p.z,r,t:now}); if(noises.length>40) noises.shift(); }
const isCiv=P=>P.kind==='civ'||P.kind==='dog';
function killInf(P,by,how){
  if(P.dead||net.guest) return; P.dead=true; P.deadT=0; infDeathFx(P,how||'shot');
  if(P.board) P.board.boarding=null;
  const crew=by&&by.crew&&!by.inf?by.crew:null;
  if(isCiv(P)){ if(crew) award(crew,P.kind==='dog'?'Animal herido':'Civil abatido',P.kind==='dog'?-20:-50,P.kind==='dog'?-20:-60); return; }
  if(crew&&by.team!==P.team){ addSP(by,8,10,'Soldado abatido'); if(crew.st) crew.st.inf++; if(by.isPlayer) hitMsg(`Baja: ${P.name.toLowerCase()}`,'var(--amber)'); }
}
function infBlast(p,r,by){
  for(const P of infantry){ if(P.dead||(by&&!isCiv(P)&&P.team===by.team)) continue; const d=P.pos.distanceTo(p);
    if(d<r&&Math.random()<(d<r*.6?1:.5)) killInf(P,by,r>2.5||d<r*.7?'blast':'shot'); // cerca de la explosión: destrozado
    else if(d<r*3){ P.supT=now+rand(3,6); if(isCiv(P)){ P.cower=now+rand(.8,1.8); P.flee=true; P.goal=null; } else if(Math.random()<.6) P.proneT=now+rand(1.5,3); } }
  for(const t of tanks) if(t.mech&&(!by||by.team!==t.team)&&t.mech.g.position.distanceTo(p)<r) mechKill(t,by);
  carsBlast(p,r,by);
}
// how='blast': un proyectil de cañón destroza al soldado
function infOnRay(o,d,len,by,chance,how){ for(const P of infantry){ if(P.dead||(by&&!isCiv(P)&&P.team===by.team)) continue;
    const c=P.pos.clone().setY(P.pos.y+(P.pose===2?.3:1)), s=clamp(c.clone().sub(o).dot(d),0,len); if(c.distanceTo(o.clone().addScaledVector(d,s))<.6&&Math.random()<chance){killInf(P,by,how);return s;} }
  // el tripulante que repara afuera también recibe tiros
  for(const t of tanks){ if(!t.mech||(by&&by.team===t.team)) continue; const c=t.mech.g.position.clone(); c.y+=.8; const s=clamp(c.clone().sub(o).dot(d),0,len);
    if(c.distanceTo(o.clone().addScaledVector(d,s))<.55&&Math.random()<chance){ mechKill(t,by&&by.tank?by.tank:by); return s; } }
  return -1; }
function walk(P,tx,tz,spd,dt){
  const dx=tx-P.pos.x, dz=tz-P.pos.z, l=Math.hypot(dx,dz); if(l<.5){ P.spd=0; return true; }
  P.heading=Math.atan2(dx,dz); const ox=P.pos.x, oz=P.pos.z;
  if(W.wire&&W.wire(P.pos.x,P.pos.z)) spd*=.3; // la alambrada frena muchísimo a la infantería
  P.pos.x+=dx/l*spd*dt; P.pos.z+=dz/l*spd*dt; P.spd=spd;
  for(const b of gridQuery(P.pos.x,P.pos.z,1.5)){const push=obPush(P.pos.x,P.pos.z,.45,b); if(push){P.pos.x+=push.x;P.pos.z+=push.z;}}
  if((W.water!=null&&heightAt(P.pos.x,P.pos.z)<W.water+.3)||(W.boundary&&!inPoly(P.pos.x,P.pos.z,W.boundary)&&!P.flee)){P.pos.x=ox;P.pos.z=oz;P.heading+=1.2;}
  for(const t of tanks){ if(t.dead) continue; const ex=P.pos.x-t.pos.x, ez=P.pos.z-t.pos.z, e=Math.hypot(ex,ez), m=t.R+.4; if(e<m&&e>.01){P.pos.x+=ex/e*(m-e);P.pos.z+=ez/e*(m-e);} }
  return false;
}
const infEye=P=>new THREE.Vector3(P.pos.x,P.pos.y+(P.pose===2?.4:P.pose===1?1.1:1.5),P.pos.z);
// Cobertura: el costado de una casa opuesto a la amenaza
function coverPoint(P,from){
  if(W.trenchCover){ const c=W.trenchCover(P.pos.x,P.pos.z); if(c&&Math.hypot(c.x-P.pos.x,c.z-P.pos.z)<35) return c; }
  let best=null,bd=1e9;
  for(const b of gridQuery(P.pos.x,P.pos.z,28)){ const o=b.ob; if(!o||b.mir||b.dead) continue; const dx=o.cx-from.x, dz=o.cz-from.z, L=Math.hypot(dx,dz)||1, r=Math.max(o.hw,o.hd)+1.2;
    const x=o.cx+dx/L*r, z=o.cz+dz/L*r; if(!freeInf(x,z)) continue; const d=Math.hypot(x-P.pos.x,z-P.pos.z); if(d<bd&&d<35){bd=d;best={x,z};} }
  return best;
}
function doorPoint(P){ let best=null,bd=80; for(const B of buildings){ if(!(B.hp>0)||!isFinite(B.hp)) continue; const d=Math.hypot(B.x-P.pos.x,B.z-P.pos.z); if(d<bd){bd=d;best=B;} }
  if(!best) return null; const dx=P.pos.x-best.x, dz=P.pos.z-best.z, L=Math.hypot(dx,dz)||1, r=Math.min(best.w,best.d)/2+.4; return {x:best.x+dx/L*r,z:best.z+dz/L*r,door:true}; }
function sidewalkGoal(P){ if(!streetSegs.length) return {x:P.pos.x+rand(-8,8),z:P.pos.z+rand(-8,8)};
  const S=streetSegs[(Math.random()*streetSegs.length)|0];
  const k=Math.random(), x=S.ax+(S.bx-S.ax)*k, z=S.az+(S.bz-S.az)*k, L=Math.hypot(S.bx-S.ax,S.bz-S.az)||1, side=Math.random()<.5?1:-1;
  const gx=x+(S.bz-S.az)/L*5*side, gz=z-(S.bx-S.ax)/L*5*side; return Math.hypot(gx-P.pos.x,gz-P.pos.z)<70&&freeInf(gx,gz)?{x:gx,z:gz}:{x:P.pos.x+rand(-10,10),z:P.pos.z+rand(-10,10)}; }
let infAmb=null, infAmbT=-99;
function infAmbNote(o){ if(o&&camera&&o.distanceTo(camera.position)<220) infAmbT=performance.now()/1000; }
function infAmbTick(dt){ if(!AC||!SFX.infamb||!SFX.infamb.length) return;
  const on=['play','spectate','deploy'].includes(state)&&performance.now()/1000-infAmbT<5, tg=on?.5:0;
  if(!infAmb){ if(!on) return; const src=AC.createBufferSource(); src.buffer=SFX.infamb[0]; src.loop=true; const g=AC.createGain(); g.gain.value=0; src.connect(g).connect(extBus); src.start(0,rand(0,40)); infAmb={src,g,v:0}; }
  infAmb.v+=(tg-infAmb.v)*Math.min(1,dt*(on?1.2:.5)); infAmb.g.gain.value=infAmb.v;
  if(!on&&infAmb.v<.01){ infAmb.src.stop(); infAmb=null; } }
function infShoot(P,o,aim,col){ infAmbNote(o); tracer(o,aim,col||(P.team===0?0xffd080:0xff9a70)); P.shotP=aim.clone(); boom(distVol(o,.06),.05,3000); noise(o,50); }
function updateInfantry(dt){
  if(!['play','deploy','spectate','end','paused','brief'].includes(state)) return;
  for(const P of infantry){ if(P.dead){ updGibs(P,dt); } }
  if(net.guest){ for(let i=infantry.length-1;i>=0;i--){ const P=infantry[i]; if(P.dead||!P.tgt) continue; const g=P.tgt, k=Math.min(1,dt*10);
      if(Math.hypot(g.x-P.pos.x,g.z-P.pos.z)>15){ P.pos.x=g.x; P.pos.z=g.z; } else { P.pos.x+=(g.x-P.pos.x)*k; P.pos.z+=(g.z-P.pos.z)*k; }
      P.heading=wrap(P.heading+wrap(g.h-P.heading)*k); P.spd=g.spd||0; P.pose=g.pose||0; P.pos.y=heightAt(P.pos.x,P.pos.z); animInf(P,dt); }
    updateTraffic(dt); updatePlanes(dt); return; }
  for(let i=infantry.length-1;i>=0;i--){ const P=infantry[i];
    if(P.dead){ P.deadT+=dt; if(P.deadT>25) removeInf(P); continue; }
    // los tanques que pasan por encima aplastan (enemigos, civiles y animales)
    for(const t of tanks){ if(t.dead||(!isCiv(P)&&t.team===P.team)) continue; if(Math.abs(t.speed)>1.5&&P.pos.distanceTo(t.pos)<t.R*.85) killInf(P,t,'crush'); }
    if(P.dead) continue;
    P.spd=0; P.pose=0;
    if(isCiv(P)) civThink(P,dt);
    else soldierThink(P,dt);
    if(P.removed){ removeInf(P); continue; }
    P.mv=P.spd; P.pos.y=heightAt(P.pos.x,P.pos.z); animInf(P,dt);
  }
  // refuerzos: escuadras de 5 hasta 2 por bando
  updateInfantry.t=(updateInfantry.t||0)-dt;
  if(updateInfantry.t<=0&&!tut){ updateInfantry.t=40; for(const tm of [0,1]) if(infantry.filter(P=>!P.dead&&P.team===tm).length<6) spawnSquad(tm); }
  updateTraffic(dt); updatePlanes(dt);
}
function civThink(P,dt){
  const dog=P.kind==='dog';
  if(P.cower>now){ P.pose=dog?0:3; return; }
  if(!P.flee){ P.thinkT-=dt; if(P.thinkT<=0){ P.thinkT=.5;
      if(noises.some(n=>now-n.t<3&&Math.hypot(n.x-P.pos.x,n.z-P.pos.z)<n.r)||tanks.some(t=>!t.dead&&t.pos.distanceTo(P.pos)<(dog?40:55))){
        P.flee=true; P.goal=dog?null:doorPoint(P); }
      else if(!P.goal||Math.random()<.04) P.goal=dog?{x:P.pos.x+rand(-12,12),z:P.pos.z+rand(-12,12)}:sidewalkGoal(P); } }
  if(P.flee&&!P.goal){ // sin casa cerca: se aleja de la amenaza
    let tx=0,tz=0; for(const n of noises) if(now-n.t<5){ tx+=P.pos.x-n.x; tz+=P.pos.z-n.z; } for(const t of tanks) if(!t.dead&&t.pos.distanceTo(P.pos)<80){ tx+=P.pos.x-t.pos.x; tz+=P.pos.z-t.pos.z; }
    const L=Math.hypot(tx,tz)||1; P.goal={x:P.pos.x+tx/L*40+rand(-8,8),z:P.pos.z+tz/L*40+rand(-8,8)}; }
  if(P.goal){ const v=P.flee?(dog?6.5:4.6):(dog?1.6:1.15); if(walk(P,P.goal.x,P.goal.z,v,dt)){ if(P.goal.door){ P.removed=true; return; } P.goal=null; } }
  if(P.flee){ P.stuck=(P.stuck||0)+dt; if(Math.hypot(P.pos.x-(P.lx??P.pos.x),P.pos.z-(P.lz??P.pos.z))>2){P.stuck=0;P.lx=P.pos.x;P.lz=P.pos.z;} if(P.stuck>3){ P.goal=null; P.stuck=0; }
    if(Math.abs(P.pos.x)>W.bx+2||Math.abs(P.pos.z)>W.bz+2) P.removed=true; }
}
function soldierThink(P,dt){
  // subir a un VCTP/M113 aliado que está quieto cerca
  if(P.embark){ const t=P.embark; if(t.dead||!tanks.includes(t)||t.troops>=t.T.troops){ P.embark=null; }
    else { walk(P,t.pos.x,t.pos.z,4.2,dt); if(P.pos.distanceTo(t.pos)<t.R+1.2){ t.troops++; tell(t,`Soldado a bordo (${t.troops}/${t.T.troops})`,'var(--ally)'); P.removed=true; } return; } }
  // reemplazar a un tripulante caído (tecla C)
  if(P.board){ const t=P.board; if(t.dead||!tanks.includes(t)){ P.board=null; if(t) t.boarding=null; return; }
    walk(P,t.pos.x,t.pos.z,4.4,dt);
    if(P.pos.distanceTo(t.pos)<t.R+1.2){ const m=t.crewM.find(x=>!x.alive)||null; if(m){ m.alive=true; m.hp=70; tell(t,`Nuevo ${SEAT_RADIO[m.seat]||'tripulante'} a bordo`,'var(--ally)'); } t.boarding=null; P.removed=true; }
    return; }
  P.thinkT-=dt;
  if(P.thinkT<=0){ P.thinkT=rand(.5,.9); const e=infEye(P), K=P.kind;
    const rng=K==='sniper'?360:K==='at'?200:K==='hmg'?260:K==='mortar'?380:150; let best=null,bd=rng;
    for(const t of tanks){ if(t.dead||t.team===P.team) continue; const d=t.pos.distanceTo(P.pos);
      if(d>=bd) continue; if(K==='mortar'?(t.spottedT>0&&d>60):((K==='at'||K==='hmg'||K==='sniper'||d<60)&&los(e,eyeOf(t)))){best=t;bd=d;} }
    if(K!=='at'||!best) for(const o of infantry){ if(o.dead||isCiv(o)||o.team===P.team) continue; const d=o.pos.distanceTo(P.pos); if(d<Math.min(bd,K==='sniper'?360:K==='mortar'?380:180)&&(K==='mortar'?d>50:los(e,infEye(o)))){best=o;bd=d;} }
    P.target=K==='eng'?null:best;
    // amenaza: un tanque enemigo cerca que lo puede ver
    P.threat=null; for(const t of tanks){ if(t.dead||t.team===P.team) continue; if(t.pos.distanceTo(P.pos)<150&&los(eyeOf(t),e)){ P.threat=t.pos.clone(); break; } }
    if((P.threat||P.supT>now)&&!P.cover&&K!=='mortar'&&Math.random()<.7){ const c=coverPoint(P,P.threat||P.pos); if(c) P.cover=c; }
    if(!P.threat&&P.cover&&P.supT<now&&Math.random()<.15) P.cover=null;
    // subir a un vehículo aliado
    if(!P.target&&!P.embark&&!(P.noEmb>now)) for(const t of tanks) if(!t.dead&&t.team===P.team&&t.T.troops&&t.troops<t.T.troops&&(t.stillT||0)>2&&t.pos.distanceTo(P.pos)<30){ P.embark=t; break; }
    // ingeniero: va a reparar al tanque aliado dañado más cercano
    if(K==='eng'&&!P.fix){ let bt=null,bd2=160; for(const t of tanks) if(!t.dead&&t.team===P.team&&(t.repairT>0||(needsRepair(t)&&!(t.engCD>now)))){ const d=t.pos.distanceTo(P.pos); if(d<bd2){bd2=d;bt=t;} } P.fix=bt; }
    if(!P.goal&&!P.hold){ const mine=P.team===0?1:-1, Z=nearestZone(P.pos.x,P.pos.z,Z=>Z.owner!==mine)||nearestZone(P.pos.x,P.pos.z);
      if(Z){ const back=K==='mortar'?60:0, a=rand(0,6.28), r=rand(0,Z.r*.8)+back; P.goal={x:Z.x+Math.cos(a)*r,z:Z.z+Math.sin(a)*r}; } } }
  const T=P.target&&!P.target.dead?P.target:null, K=P.kind;
  if(P.proneT>now) P.pose=2;
  // ingeniero reparando
  if(K==='eng'&&P.fix){ const t=P.fix; if(t.dead||!(needsRepair(t)||t.repairT>0)){ P.fix=null; }
    else if(P.pos.distanceTo(t.pos)>t.R+1.6){ walk(P,t.pos.x,t.pos.z,4.2,dt); }
    else { P.pose=1; P.heading=Math.atan2(t.pos.x-P.pos.x,t.pos.z-P.pos.z); P.fixT=(P.fixT||0)+dt;
      if(t.repairT>0){ (t.help||(t.help=new Map())).set(P,now); P.fixT=0; }
      else if(Math.abs(t.speed)<1&&P.fixT>7){ P.fixT=0; t.trackT=0; t.mod.engine=100; t.mod.breech=100; t.mod.trans=100; t.mod.barrel=100; t.trkHP=[100,100]; setBarrelLook(t); t.engT=0; t.breechT=0; t.fireT=0; t.engCD=now+40; tell(t,'Un ingeniero reparó tu tanque','var(--ally)'); P.fix=null; } }
    return; }
  if(T){
    P.heading=Math.atan2(T.pos.x-P.pos.x,T.pos.z-P.pos.z); P.fireT-=dt; const d=T.pos.distanceTo(P.pos);
    if(P.pose!==2) P.pose=K==='hmg'||K==='mortar'||K==='sniper'?(K==='hmg'?2:1):(P.supT>now&&K!=='at'&&!P.cover?2:1); // rodilla en tierra; cuerpo a tierra bajo fuego
    // el antitanque busca el costado: si el tanque lo mira de frente, se mueve antes de tirar
    if(K==='at'&&!T.inf&&!P.flanked){ const face=wrap(T.heading+(T.turretYaw||0)-Math.atan2(P.pos.x-T.pos.x,P.pos.z-T.pos.z));
      if(Math.abs(face)<.8&&d<190){ if(!P.flankP){ const a=Math.atan2(P.pos.x-T.pos.x,P.pos.z-T.pos.z)+(Math.random()<.5?1:-1)*1.1, R=Math.max(40,d*.8), x=T.pos.x+Math.sin(a)*R, z=T.pos.z+Math.cos(a)*R; P.flankP=freeInf(x,z)?{x,z}:null; P.flankT=now+12; }
        if(P.flankP&&now<P.flankT){ if(walk(P,P.flankP.x,P.flankP.z,3.6,dt)) P.flanked=true; P.pose=0; return; } }
      P.flanked=true; }
    if(P.cover&&Math.hypot(P.cover.x-P.pos.x,P.cover.z-P.pos.z)>1.2&&K!=='hmg'){ walk(P,P.cover.x,P.cover.z,4,dt); P.pose=4; }
    if(P.fireT<=0){ const o=infEye(P), aim=T.inf?infEye(T).setY(T.pos.y+1):T.pos.clone().setY(T.pos.y+(T.aimH||1));
      if(K==='at'&&!T.inf){ P.fireT=rand(12,16);
        const miss=!infHit(P,T,d,.12), dx=aim.x-o.x, dz=aim.z-o.z, hd=Math.hypot(dx,dz), yaw=Math.atan2(dx,dz)+rand(-1,1)*.012+(miss?(Math.random()<.5?-1:1)*rand(4,8)/Math.max(hd,20):0), pit=ballisticPitch(hd,aim.y-o.y,ROCKET.v)+rand(-1,1)*.01+(miss?rand(-1,1)*2/Math.max(hd,20):0);
        const v=new THREE.Vector3(Math.sin(yaw)*Math.cos(pit),Math.sin(pit),Math.cos(yaw)*Math.cos(pit)).multiplyScalar(ROCKET.v);
        launchInf(P,o,v,ROCKET,SHELL_MAT.heat); for(let k=0;k<4;k++) puff(o.clone().addScaledVector(v.clone().normalize(),-k*.6),0xcfc8b8,rand(1.5,2.5),1.2,.4,.6); boom(distVol(o,.4),.5,1500); }
      else if(K==='mortar'){ P.fireT=rand(10,14);
        const tp=T.pos.clone().add(new THREE.Vector3(rand(-1,1),0,rand(-1,1)).multiplyScalar(d*.05)), dx=tp.x-o.x, dz=tp.z-o.z, hd=Math.hypot(dx,dz), v2=MORTAR.v*MORTAR.v, dy=tp.y-o.y, disc=v2*v2-G*(G*hd*hd+2*dy*v2);
        if(disc>0){ const pit=Math.atan((v2+Math.sqrt(disc))/(G*hd)), yaw=Math.atan2(dx,dz); launchInf(P,o.clone().setY(o.y+.5),new THREE.Vector3(Math.sin(yaw)*Math.cos(pit),Math.sin(pit),Math.cos(yaw)*Math.cos(pit)).multiplyScalar(MORTAR.v),MORTAR,SHELL_MAT.he);
          puff(o.clone().setY(o.y+1),0xcfc8b8,2,1,.8,.6); sfx('thump',o,.5,{rate:1.3}); } }
      else if(K==='hmg'){ P.fireT=rand(1.8,2.6); // ráfaga de 12,7 mm: hiere infantería y puede cortar orugas
        const sp=(T.isPlayer||(T.crew&&T.crew.peer)||T.net)?2.8-enemySkill()*2:1; // contra jugadores la ráfaga se abre según la dificultad
        for(let k=0;k<5;k++){ const dir=aim.clone().sub(o).normalize(); dir.x+=rand(-1,1)*.012*sp; dir.y+=rand(-1,1)*.008*sp; dir.z+=rand(-1,1)*.012*sp; dir.normalize();
          if(!T.inf){ ray.set(o,dir); ray.far=280; const h=ray.intersectObjects(colliders,false).filter(x=>x.object.userData.tank&&x.object.userData.tank.team!==P.team); ray.far=Infinity;
            if(h.length){ hitTank(P,h[0],dir,25,'mg'); infShoot(P,o,h[0].point); } else infShoot(P,o,o.clone().addScaledVector(dir,d)); }
          else { infShoot(P,o,aim.clone().add(new THREE.Vector3(rand(-1,1),rand(-.3,.3),rand(-1,1)))); if(Math.random()<.35) killInf(T,P); } }
        if(T.inf) for(const Q of infantry) if(Q!==T&&!Q.dead&&!isCiv(Q)&&Q.team!==P.team&&Q.pos.distanceTo(T.pos)<2.5&&Math.random()<.3) killInf(Q,P); }
      else if(K==='sniper'){ P.fireT=rand(4,7);
        if(T.inf){ infShoot(P,o,aim,0xfff2c0); if(Math.random()<clamp(.75-d/900,.3,.7)) killInf(T,P); }
        else if(Math.abs(T.speed)<2.5&&T.crewM.some(m=>m.alive&&m.seat==='commander')&&Math.random()<.3&&infHit(P,T,d,.05)){ const m=T.crewM.find(x=>x.alive&&x.seat==='commander'); m.alive=false; m.hp=0; infShoot(P,o,aim,0xfff2c0);
          tell(T,'¡Francotirador! Perdimos al comandante','var(--enemy)'); if(T.isPlayer) radio('¡Perdimos al comandante!',2); T.hp=T.T.hp*T.crewM.reduce((a,x)=>a+Math.max(0,x.hp),0)/(T.crewM.length*100); if(crewAlive(T)<2) destroy(T,P,false); } }
      else if(!T.inf&&T.mech&&(K==='rifle'||K==='eng'||K==='at')&&d<220&&Math.random()<.5){ P.fireT=rand(.8,1.4); const mp=T.mech.g.position.clone(); mp.y+=.9; infShoot(P,o,mp); if(Math.random()<clamp(.45-d/500,.08,.4)) mechKill(T,P); } // le tiran al que repara afuera
      else if(K==='rifle'){ P.fireT=rand(.7,1.5); P.kickT=now; P.mag=(P.mag??5)-1; if(P.mag<=0){ P.mag=5; P.fireT=rand(2.5,3.5); }
        infShoot(P,o,aim.clone().add(new THREE.Vector3(rand(-1,1),rand(-.5,.5),rand(-1,1)).multiplyScalar(d*.01)));
        if(T.inf){ if(Math.random()<clamp(.35-d/400,.06,.3)) killInf(T,P); } else debris(aim,1,sparkMat,2,.4); }
      else P.fireT=1; }
    return; }
  // sin blanco: avanza por tramos, se cubre si hay amenaza
  if(P.cover&&(P.threat||P.supT>now)){ P.pose=4; if(walk(P,P.cover.x,P.cover.z,4,dt)) P.pose=1; return; }
  P.advT=(P.advT||0)-dt; if(P.advT<=0){ P.hold=!P.hold&&!!P.threat; P.advT=P.hold?rand(2.5,4.5):rand(5,9); }
  if(P.hold){ P.pose=1; return; }
  if(P.goal&&W.bridge&&Math.sign(P.pos.x)!==Math.sign(P.goal.x)&&Math.abs(P.pos.x)>DECK_END-4&&Math.abs(P.pos.z)>3){ walk(P,Math.sign(P.pos.x)*(DECK_END+2),0,2.6,dt); }
  else if(P.goal&&W.bridge&&Math.sign(P.pos.x)!==Math.sign(P.goal.x)){ walk(P,-Math.sign(P.pos.x)*(DECK_END+3),0,2.6,dt); }
  else if(P.goal){ if(P.threat&&!isCiv(P)) P.pose=4; if(walk(P,P.goal.x,P.goal.z,P.threat?3.8:2.6,dt)) P.goal=Math.random()<.3?null:{x:P.pos.x+rand(-5,5),z:P.pos.z+rand(-5,5)}; }
}
// Infantería contra el tanque de un jugador: misma vara que los bots (dificultad, distancia, si se mueve) y el primer tiro de cada soldado falla
function infHit(P,T,d,base){ const human=T.isPlayer||(T.crew&&T.crew.peer)||T.net; if(!human) return true;
  if(P.warnT!==T){ P.warnT=T; return false; } const sk=enemySkill(); return Math.random()<(base+.5*sk*sk)*clamp(1.2-d/220,.3,1)*(Math.abs(T.speed||0)>2?.6:1); }
function launchInf(P,o,v,A,mat){
  const m=new THREE.Mesh(shellGeo,mat); m.position.copy(o); scene.add(m);
  shells.push({p:o.clone(),v:v.clone(),owner:P,m,travel:0,life:A===MORTAR?14:4,A,rocket:A===ROCKET}); noise(o,90);
  if(net.host) netAll({t:'rk',p:[r2(o.x),r2(o.y),r2(o.z)],v:[r2(v.x),r2(v.y),r2(v.z)],m:A===MORTAR?1:0});
}
/* ----- Tránsito: autos que circulan por las calles y se abandonan cuando empieza el combate ----- */
const traffic=[]; let carSeq=0; const CAR_COL=[0xb03a2e,0x2e5cb0,0xd9d4c6,0x2a2a2a,0x6b8a3a,0xc9a23a,0x7a7a80,0xeeeeea,0x8a1e22,0x1e3a5a,0x9aa0a6,0x4a3a2a,0xc8c2b0,0x2e6a5a,0xd8a030,0x5a2a4a];
// ---------- Vehículos civiles y militares: perfiles laterales extruidos (no cajas), ruedas, vidrios, luces y conductores ----------
// p: perfil de la carrocería [largo, alto]; g: vidrios; r: techo; wz: ejes; wr: radio de rueda
const VTYPES=[
  {k:'sedan',n:'Sedán',W:1.78,wr:.32,wz:[1.35,-1.35],v:[8,11],p:[[2.3,.32],[2.32,.62],[2.15,.8],[1.1,.92],[.55,.95],[-1.2,.97],[-2.05,.95],[-2.28,.8],[-2.3,.32]],g:[[.95,.95],[.35,1.4],[-.85,1.42],[-1.55,.97]]},
  {k:'hatch',n:'Hatchback',W:1.7,wr:.3,wz:[1.2,-1.2],v:[8,11],p:[[1.95,.3],[1.98,.6],[1.8,.78],[.95,.9],[.45,.93],[-1.7,.98],[-1.95,.9],[-1.98,.3]],g:[[.85,.93],[.25,1.4],[-1.45,1.42],[-1.85,.98]]},
  {k:'falcon',n:'Ford Falcon',W:1.85,wr:.33,wz:[1.45,-1.45],v:[7,10],p:[[2.45,.33],[2.45,.82],[1.0,.86],[.7,.9],[-1.45,.9],[-2.45,.84],[-2.45,.33]],g:[[.85,.9],[.25,1.38],[-1.05,1.38],[-1.5,.9]]},
  {k:'fiat600',n:'Fiat 600',W:1.4,wr:.26,wz:[1.0,-1.0],v:[6,8],p:[[1.65,.28],[1.66,.55],[1.35,.8],[.75,.86],[-1.2,.86],[-1.6,.62],[-1.65,.28]],g:[[.7,.86],[.35,1.3],[-.75,1.32],[-1.15,.86]]},
  {k:'taxi',n:'Taxi',W:1.78,wr:.32,wz:[1.35,-1.35],v:[8,11],taxi:1,p:[[2.3,.32],[2.32,.62],[2.15,.8],[1.1,.92],[.55,.95],[-1.2,.97],[-2.05,.95],[-2.28,.8],[-2.3,.32]],g:[[.95,.95],[.35,1.4],[-.85,1.42],[-1.55,.97]]},
  {k:'pickup',n:'Camioneta',W:1.9,wr:.38,wz:[1.6,-1.55],v:[8,10],bed:[-.45,-2.65,1.05],p:[[2.65,.42],[2.68,.88],[2.4,1.06],[1.25,1.12],[1.0,1.15],[-.45,1.15],[-.45,1.05],[-2.65,1.05],[-2.65,.42]],g:[[1.1,1.15],[.55,1.75],[-.38,1.77],[-.42,1.15]]},
  {k:'van',n:'Utilitario',W:1.9,wr:.34,wz:[1.6,-1.7],v:[7,9],p:[[2.5,.36],[2.55,.85],[2.25,1.12],[1.6,1.95],[1.3,2.15],[-2.45,2.15],[-2.5,1.9],[-2.5,.36]],g:[[2.2,1.12],[1.55,1.92],[1.15,1.95],[1.15,1.2]],side:[[.6,1.25],[-1.9,1.25],[-1.9,1.8],[.6,1.8]]},
  {k:'amb',n:'Ambulancia',W:1.95,wr:.34,wz:[1.6,-1.7],v:[9,12],amb:1,p:[[2.5,.36],[2.55,.85],[2.25,1.12],[1.6,1.95],[1.3,2.25],[-2.45,2.25],[-2.5,1.95],[-2.5,.36]],g:[[2.2,1.12],[1.55,1.92],[1.15,1.95],[1.15,1.2]]},
  {k:'bus',n:'Colectivo',W:2.5,wr:.5,wz:[3.4,-2.6],v:[6,8],p:[[5.6,.45],[5.65,2.7],[5.45,3.05],[-5.5,3.05],[-5.6,2.8],[-5.6,.45]],g:[[5.5,1.15],[5.6,2.8],[4.9,2.8],[4.9,1.15]],side:[[5.0,1.45],[-5.3,1.45],[-5.3,2.55],[5.0,2.55]]},
  {k:'truck',n:'Camión',W:2.4,wr:.52,wz:[2.9,-1.6,-2.9],v:[6,8],box:[1.2,-3.9,3.3],p:[[3.95,.6],[3.98,1.55],[3.75,2.55],[2.0,2.65],[1.4,2.6],[1.4,.6]],g:[[3.85,1.75],[3.7,2.45],[2.6,2.5],[2.6,1.75]]},
  {k:'cart',n:'Carro con caballo',W:1.5,wr:.62,wz:[-1.1],v:[2,3],cart:1},
  {k:'bike',n:'Bicicleta',W:.5,wr:.34,wz:[.52,-.52],v:[4,5.5],two:1},
  {k:'moto',n:'Moto',W:.6,wr:.3,wz:[.68,-.68],v:[9,12],two:1,moto:1},
  {k:'jeep',n:'Jeep militar',W:1.75,wr:.38,wz:[1.25,-1.25],v:[9,11],mil:1,p:[[1.95,.42],[1.98,1.0],[1.0,1.1],[.6,1.12],[-1.95,1.12],[-1.95,.42]],g:[[.65,1.12],[.6,1.55],[.55,1.55],[.5,1.12]]},
  {k:'miltruck',n:'Camión militar',W:2.45,wr:.55,wz:[2.7,-1.4,-2.7],v:[7,9],mil:1,tarp:[1.0,-3.7,2.6],p:[[3.7,.62],[3.75,1.5],[3.5,2.45],[1.2,2.5],[1.2,.62]],g:[[3.62,1.65],[3.48,2.35],[2.5,2.4],[2.5,1.65]]}];
const VMIX=['sedan','sedan','hatch','hatch','falcon','fiat600','taxi','taxi','pickup','pickup','van','bus','truck','cart','bike','bike','moto','moto','moto','amb','jeep','miltruck'].map(k=>VTYPES.findIndex(v=>v.k===k));
const _vgeo=new Map();
function vExt(key,pts,depth){ let g=_vgeo.get(key); if(g) return g; const sh=new THREE.Shape(); pts.forEach(([x,y],i)=>i?sh.lineTo(x,y):sh.moveTo(x,y));
  g=new THREE.ExtrudeGeometry(sh,{depth:Math.max(.02,depth-.12),bevelEnabled:true,bevelThickness:.06,bevelSize:.05,bevelSegments:2,curveSegments:2}); g.rotateY(-Math.PI/2); g.translate(depth/2-.06,0,0); g.computeVertexNormals(); _vgeo.set(key,g); return g; }
const glassMat=new THREE.MeshStandardMaterial({color:0x1d2a33,roughness:.15,metalness:.6}), tireMat=new THREE.MeshLambertMaterial({color:0x1a1a1a}), rimMat=new THREE.MeshLambertMaterial({color:0xa8a8a8}),
  lampW=new THREE.MeshBasicMaterial({color:0xfff4d8}), lampR=new THREE.MeshBasicMaterial({color:0xb81a14}), chromeMat=new THREE.MeshStandardMaterial({color:0xcfcfcf,roughness:.25,metalness:.8}), canvasMat=new THREE.MeshLambertMaterial({color:0x5a5a3e});
const VG={tire:(()=>{const g=new THREE.CylinderGeometry(1,1,1,14); g.rotateZ(Math.PI/2); return g;})(), torus:(()=>{const g=new THREE.TorusGeometry(1,.09,6,16); g.rotateY(Math.PI/2); return g;})(), rod:new THREE.CylinderGeometry(.02,.02,1,5)};
function vWheel(G,x,y,z,r,w){ const t=new THREE.Mesh(VG.tire,tireMat); t.scale.set(w,r,r); t.position.set(x,y,z); G.add(t); const h=new THREE.Mesh(VG.tire,rimMat); h.scale.set(w+.02,r*.55,r*.55); h.position.set(x,y,z); G.add(h); return t; }
function rod(G,a,b,mat,r=1){ const A=new THREE.Vector3(...a), B=new THREE.Vector3(...b), m=new THREE.Mesh(VG.rod,mat); m.position.copy(A).add(B).multiplyScalar(.5); m.scale.set(r,A.distanceTo(B),r); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize()); G.add(m); return m; }
function rider(G,y,z,seat){ const pm=personMesh({kind:'civ'}); const p=pm.parts; pm.g.position.set(0,y,z); p.hip.position.y=seat; p.legL.rotation.x=p.legR.rotation.x=-1.0; p.armL.rotation.x=p.armR.rotation.x=-1.0; p.hip.rotation.x=.25; G.add(pm.g); return pm; }
function carMesh(ci){
  const ti=VTYPES[(ci>>4)]?(ci>>4):0, V=VTYPES[ti], g=new THREE.Group(); let col=CAR_COL[(ci&15)%CAR_COL.length];
  if(V.taxi) col=0x1e1e1e; if(V.amb) col=0xf2f2ee; if(V.mil) col=[0x4a5236,0x5a5a3a,0x3e4a32][ci%3];
  const m=new THREE.MeshLambertMaterial({color:col}), ud={m,mats:[m],riders:[],V,len:V.p?Math.abs(V.p[0][0]-V.p[V.p.length-1][0]):V.two?1.8:4.6};
  if(V.p){ const body=new THREE.Mesh(vExt(V.k+'b',V.p,V.W),m); g.add(body);
    const gl=new THREE.Mesh(vExt(V.k+'g',V.g,V.W-.16),glassMat); g.add(gl);
    if(V.side){ const sw=new THREE.Mesh(vExt(V.k+'s',V.side,V.W+.04),glassMat); g.add(sw); }
    const L=V.p[0][0], R=V.p[V.p.length-1][0];
    for(const sx of [-1,1]){ box(g,.3,.13,.06,sx*(V.W/2-.3),V.p[1][1]-.12,L+.02,lampW); box(g,.26,.14,.06,sx*(V.W/2-.25),V.p[V.p.length-2][1]-.15,R-.02,lampR); }
    box(g,V.W+.04,.16,.12,0,V.p[0][1]+.08,L+.04,V.mil?m:chromeMat); box(g,V.W+.04,.16,.12,0,V.p[0][1]+.08,R-.04,V.mil?m:chromeMat);
    for(const sx of [-1,1]){ const mi=box(g,.05,.1,.16,sx*(V.W/2+.06),V.g[0][1]+.08,V.g[0][0]-.1,m); mi.castShadow=false; }
    if(V.taxi){ const tm=new THREE.MeshLambertMaterial({color:0xf2c62e}); const roof=V.g[1][1]+.06; box(g,V.W-.2,.06,1.6,0,roof,(V.g[1][0]+V.g[2][0])/2,tm); box(g,.5,.18,.22,0,roof+.12,(V.g[1][0]+V.g[2][0])/2,lampW); ud.mats.push(tm); }
    if(V.amb){ const rm=new THREE.MeshLambertMaterial({color:0xc81e1e}); box(g,.06,.22,4.6,V.W/2+.02,1.3,-.1,rm); box(g,.06,.22,4.6,-V.W/2-.02,1.3,-.1,rm); box(g,1.1,.14,.3,0,2.33,1.2,rm); box(g,.5,.14,.3,0,2.33,1.2,new THREE.MeshBasicMaterial({color:0x3a6aff})); ud.mats.push(rm); }
    if(V.bed){ const [z0,z1,y]=V.bed; for(const sx of [-1,1]) box(g,.08,.45,z0-z1,sx*(V.W/2-.04),y+.22,(z0+z1)/2,m); box(g,V.W,.45,.08,0,y+.22,z1+.04,m); box(g,V.W-.16,.05,z0-z1,0,y+.02,(z0+z1)/2,darkMat); }
    if(V.box){ const [z0,z1,h]=V.box, bm=new THREE.MeshLambertMaterial({color:apick([0xe8e4dc,0xc8c0a8,0x2e5cb0,0x8a1e22,0xd8a030])}); rbox(g,V.W+.1,h,z0-z1,0,.95+h/2,(z0+z1)/2,bm,.06); box(g,V.W-.2,.2,z0-z1,0,.75,(z0+z1)/2,darkMat); ud.mats.push(bm); }
    if(V.tarp){ const [z0,z1,h]=V.tarp; box(g,V.W,.5,z0-z1,0,1.05,(z0+z1)/2,m); const tp=new THREE.Mesh(new THREE.CylinderGeometry(V.W/2,V.W/2,z0-z1,10,1,false,0,Math.PI),canvasMat); tp.rotation.set(Math.PI/2,0,Math.PI/2); tp.rotation.order='ZXY'; tp.position.set(0,1.3,(z0+z1)/2); tp.scale.set(1,1,1.15); g.add(tp); box(g,V.W,h-1.3,z0-z1,0,1.3+(h-1.3)/2-.02,(z0+z1)/2,canvasMat); }
    if(V.k==='bus'){ const rm=new THREE.MeshLambertMaterial({color:apick([0xd8a030,0x2e8a5a,0xe8e4dc,0xc83a2a])}); box(g,V.W+.06,.5,11,0,.85,0,rm); box(g,1.4,.32,.1,0,2.88,5.62,lampW); ud.mats.push(rm); }
    if(V.mil&&V.k==='jeep'){ box(g,.05,.5,V.W,0,1.4,.6,m).rotation.y=Math.PI/2; vWheel(g,0,.95,-2.05,.36,.24); }
    for(const z of V.wz) for(const sx of [-1,1]) vWheel(g,sx*(V.W/2-.12),V.wr,z,V.wr,.24*(V.wr>.45?1.2:1));
    const door=box(g,.06,.55,1.0,V.W/2+.02,V.p[1][1]+.1,.2,m); door.visible=false; ud.door=door;
    if(V.mil){ const dr=personMesh({kind:'crew',team:-1,nat:'ar'}); dr.g.position.set(-.38,.42,V.g[0][0]-.9); dr.parts.hip.position.y=.5; dr.parts.legL.rotation.x=dr.parts.legR.rotation.x=-1.4; dr.parts.armL.rotation.x=dr.parts.armR.rotation.x=-1.1; g.add(dr.g); ud.riders.push(dr); }
  } else if(V.cart){ // carro con caballo: caja de madera, dos ruedas grandes, varas y caballo
    const wood=new THREE.MeshLambertMaterial({color:0x7a5a3a}); ud.mats=[wood]; ud.m=wood; ud.len=5;
    box(g,1.5,.5,2.2,0,.95,-1.1,wood); box(g,1.5,.08,2.2,0,.72,-1.1,wood); for(const sx of [-1,1]){ const w=new THREE.Mesh(VG.torus,wood); w.scale.setScalar(.62); w.position.set(sx*.85,.62,-1.1); g.add(w); rod(g,[sx*.85,.62,-1.1],[sx*.2,.62,-1.1],wood,3); }
    for(const sx of [-1,1]) rod(g,[sx*.45,.9,0],[sx*.42,1.1,1.9],wood,2.2);
    const hc=new THREE.MeshLambertMaterial({color:apick([0x6b4a2a,0x3a2a1e,0xa88a6a,0xd8d0c0])}); ud.mats.push(hc);
    const body=new THREE.Mesh(new THREE.CylinderGeometry(.34,.36,1.5,10),hc); body.rotation.x=Math.PI/2; body.position.set(0,1.3,2.0); g.add(body);
    const nk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.24,.8,8),hc); nk.position.set(0,1.75,2.75); nk.rotation.x=-.7; g.add(nk);
    const hd=new THREE.Mesh(new THREE.BoxGeometry(.2,.24,.55),hc); hd.position.set(0,2.0,3.05); hd.rotation.x=.5; g.add(hd);
    ud.legs=[[-.2,1.5],[.2,1.5],[-.2,2.5],[.2,2.5]].map(([x,z])=>{ const l=new THREE.Mesh(new THREE.CylinderGeometry(.06,.05,1.1,6),hc); l.geometry.translate(0,-.55,0); l.position.set(x,1.15,z); g.add(l); return l; });
    const tl=new THREE.Mesh(new THREE.CylinderGeometry(.04,.08,.6,5),pMat(0x1e1612)); tl.position.set(0,1.2,1.2); tl.rotation.x=.4; g.add(tl);
    ud.riders.push(rider(g,.75,-.5,.42));
  } else { // bicicleta o moto con su conductor
    const fm=new THREE.MeshLambertMaterial({color:V.moto?apick([0x1e1e1e,0xb03a2e,0x2e5cb0,0xd8d8d8]):apick([0xb03a2e,0x2e5cb0,0x2a2a2a,0x5e8a4a,0xd8c060])}); ud.mats=[fm]; ud.m=fm;
    const r=V.wr, z1=V.wz[0], z2=V.wz[1];
    for(const z of [z1,z2]){ const w=new THREE.Mesh(VG.torus,tireMat); w.scale.set(V.moto?2.2:1,r,r); w.position.set(0,r,z); g.add(w); }
    if(V.moto){ rbox(g,.3,.32,.75,0,.6,0,fm,.1); rbox(g,.26,.12,.6,0,.85,-.25,pMat(0x1a1a1a),.05); rbox(g,.24,.28,.35,0,.82,.3,fm,.08); rod(g,[0,.3,z1],[0,1.0,.42],chromeMat,2); rod(g,[-.32,1.0,.42],[.32,1.0,.42],darkMat,1.5); rod(g,[0,.36,z2],[0,.62,-.2],chromeMat,2); box(g,.14,.1,.06,0,.95,.5,lampW); box(g,.12,.06,.05,0,.75,-.88,lampR); }
    else { rod(g,[0,r,z2],[0,.72,-.12],fm); rod(g,[0,r,z2],[0,.4,.05],fm); rod(g,[0,.4,.05],[0,.72,-.12],fm); rod(g,[0,.4,.05],[0,.78,.42],fm); rod(g,[0,.72,-.12],[0,.8,.42],fm); rod(g,[0,r,z1],[0,.95,.45],fm); rod(g,[-.25,.97,.45],[.25,.97,.45],darkMat); box(g,.12,.05,.24,0,.86,-.15,pMat(0x1a1a1a)); }
    ud.riders.push(rider(g,0,V.moto?-.3:-.18,V.moto?.86:.95)); if(V.moto&&Math.random()<.35) ud.riders.push(rider(g,0,-.68,.9));
  }
  g.userData=ud; { const skip=new Set([ud.door,...(ud.legs||[]),...ud.riders.map(r=>r.g)].filter(Boolean)); bakeVehicle(g,skip); if(ud.door) ud.mats.push(ud.door.material); }
  g.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); return g; }
function spawnTraffic(n){
  if(net.guest||streetSegs.length<4) return; const segs=streetSegs.filter(S=>Math.hypot(S.bx-S.ax,S.bz-S.az)>12&&inMapXZ(S.ax,S.az)&&inMapXZ(S.bx,S.bz)); if(!segs.length) return;
  for(let i=0;i<n;i++){ const S=segs[(Math.random()*segs.length)|0], ti=apick(VMIX), ci=(ti<<4)|((Math.random()*16)|0), g=carMesh(ci), V=VTYPES[ti]; scene.add(g);
    traffic.push({id:++carSeq,g,S,dir:Math.random()<.5?1:-1,k:Math.random(),v:0,vmax:rand(V.v[0],V.v[1]),state:0,ci,x:0,z:0,h:0,len:g.userData.len,V}); }
}
const inMapXZ=(x,z)=>Math.abs(x)<W.bx-3&&Math.abs(z)<W.bz-3&&(!W.boundary||inPoly(x,z,W.boundary));
function nextSeg(C){ const E=C.dir>0?{x:C.S.bx,z:C.S.bz}:{x:C.S.ax,z:C.S.az}; const cand=[];
  for(const S of streetSegs){ if(S===C.S) continue; if(Math.hypot(S.ax-E.x,S.az-E.z)<7&&inMapXZ(S.bx,S.bz)) cand.push([S,1]); else if(Math.hypot(S.bx-E.x,S.bz-E.z)<7&&inMapXZ(S.ax,S.az)) cand.push([S,-1]); if(cand.length>6) break; }
  if(!cand.length){ C.dir=-C.dir; C.k=C.dir>0?0:1; return; } const [S,d]=cand[(Math.random()*cand.length)|0]; C.S=S; C.dir=d; C.k=d>0?0:1; }
function carPlace(C){ const S=C.S, dx=S.bx-S.ax, dz=S.bz-S.az, L=Math.hypot(dx,dz)||1, fx=dx/L*C.dir, fz=dz/L*C.dir, h=Math.atan2(fx,fz);
  const off=C.V&&C.V.two?2.9:C.V&&C.V.k==='cart'?2.7:1.9; C.x=S.ax+dx*C.k+fz*off; C.z=S.az+dz*C.k-fx*off; C.h=h; }
function vAbandonLook(C){ const u=C.g.userData, d=u.door; if(d){ d.visible=true; d.rotation.y=-1.1; d.position.x+=.33; d.position.z+=.45; } (u.riders||[]).forEach(r=>{ if(!(u.V&&u.V.mil)) r.g.visible=false; }); if(u.V&&u.V.two){ C.lay=true; } }
function vWreckLook(C){ const u=C.g.userData; (u.mats||[u.m]).forEach(m=>m.color.setHex(0x1e1c1a)); (u.riders||[]).forEach(r=>r.g.visible=false); C.g.scale.y=.75; C.burn=now+20; }
function abandonCar(C){ if(C.state!==0&&C.state!==1) return; C.state=2; C.v=0; vAbandonLook(C); const u=C.g.userData;
  const n=u.V&&u.V.mil?0:u.riders&&u.riders.length?u.riders.length:1+(Math.random()<.5?1:0)+(u.V&&u.V.k==='bus'?3:0); for(let i=0;i<n;i++){ const P=makePerson('civ',-1,C.x+Math.cos(C.h)*2.4,C.z-Math.sin(C.h)*2.4); P.flee=true; P.goal=null; } }
function wreckCar(C,by,occupied){ if(C.state===3) return; C.state=3; C.v=0; vWreckLook(C);
  for(let i=0;i<5;i++) puff(new THREE.Vector3(C.x+rand(-1.5,1.5),heightAt(C.x,C.z)+rand(.5,2),C.z+rand(-1.5,1.5)),0xff8a30,rand(2,3.5),.6,1,1,true);
  if(occupied&&by&&by.crew&&!by.inf) award(by.crew,'Civil abatido',-50,-60); }
function carsBlast(p,r,by){ if(net.guest) return; for(const C of traffic){ if(C.state===3) continue; const d=Math.hypot(C.x-p.x,C.z-p.z); if(d<r+2.2) wreckCar(C,by,C.state<2); else if(d<r*4+20) abandonCar(C); } }
function crushCars(t){ if(net.guest||!traffic.length||Math.abs(t.speed)<1) return; for(const C of traffic){ if(C.state===3) continue; if(Math.hypot(C.x-t.pos.x,C.z-t.pos.z)<t.R+1.8) wreckCar(C,t,C.state<2); } }
function updateTraffic(dt){
  for(const C of traffic){
    if(C.state===3){ if(now<C.burn){ C.bt=(C.bt||0)-dt; if(C.bt<=0){ C.bt=.4; puff(new THREE.Vector3(C.x,heightAt(C.x,C.z)+1.4,C.z),0x2a2622,rand(2.5,4),2.5,2,.6); } } }
    else if(!net.guest&&C.state<2){
      if(noises.some(n=>now-n.t<2&&Math.hypot(n.x-C.x,n.z-C.z)<Math.min(n.r,45))||tanks.some(t=>!t.dead&&Math.hypot(t.pos.x-C.x,t.pos.z-C.z)<25)){ abandonCar(C); }
      else { const fx=Math.sin(C.h), fz=Math.cos(C.h); let block=false;
        for(const t of tanks){ const dx=t.pos.x-C.x, dz=t.pos.z-C.z; if(dx*fx+dz*fz>0&&Math.hypot(dx,dz)<12) block=true; }
        for(const D of traffic){ if(D===C||D.state===3) continue; const dx=D.x-C.x, dz=D.z-C.z, f=dx*fx+dz*fz; if(f>0&&f<(C.len||4.6)/2+(D.len||4.6)/2+2.5&&Math.abs(dx*fz-dz*fx)<1.5) block=true; }
        for(const P of infantry){ if(P.dead) continue; const dx=P.pos.x-C.x, dz=P.pos.z-C.z, f=dx*fx+dz*fz; if(f>0&&f<7&&Math.abs(dx*fz-dz*fx)<1.6) block=true; }
        C.state=block?1:0; C.v+=clamp((block?0:C.vmax)-C.v,-dt*8,dt*2.5);
        const S=C.S, L=Math.hypot(S.bx-S.ax,S.bz-S.az)||1; C.k+=C.dir*C.v*dt/L; if(C.k>1||C.k<0){ C.k=clamp(C.k,0,1); nextSeg(C); } carPlace(C); } }
    if(C.tx!=null&&net.guest){ const k=Math.min(1,dt*8); C.x+=(C.tx-C.x)*k; C.z+=(C.tz-C.z)*k; C.h=wrap(C.h+wrap(C.th-C.h)*k); }
    C.g.position.set(C.x,heightAt(C.x,C.z)+(C.lay?.15:0),C.z); C.g.rotation.y=C.h; if(C.lay) C.g.rotation.z=1.35;
    const u=C.g.userData; if(u.V&&C.state<2){ C.ph=(C.ph||0)+dt*(C.v||0)*(u.V.k==='cart'?3:2.5);
      if(u.legs) u.legs.forEach((l,i)=>l.rotation.x=Math.sin(C.ph+(i%2?Math.PI:0)+(i>1?1.6:0))*.5);
      if(u.V.k==='bike'&&u.riders[0]){ const p=u.riders[0].parts; p.legL.rotation.x=-1.1+Math.sin(C.ph)*.5; p.legR.rotation.x=-1.1-Math.sin(C.ph)*.5; } } }
}
/* ----- Aeropuerto: aviones de pasajeros que despegan huyendo; derribarlos penaliza ----- */
const civPlanes=[], civHits=[]; let planeSeq=0, planeNextT=0;
function airlinerMesh(){ const g=new THREE.Group(), w=new THREE.MeshLambertMaterial({color:0xf0efe8}), b=new THREE.MeshLambertMaterial({color:0x2c5aa0}), e=new THREE.MeshLambertMaterial({color:0x9a9ea3});
  const f=cyl(g,1.5,1.5,26,0,2.6,0,12,w); f.rotation.x=Math.PI/2; const n=cyl(g,.2,1.5,3,0,2.6,14.5,12,w); n.rotation.x=Math.PI/2;
  box(g,26,.3,4,0,2.1,1,w); box(g,9,.25,2.4,0,3.2,-11.5,w); box(g,.3,4.5,3,0,5,-11.8,b); box(g,3.05,.35,22,0,3.3,0,b);
  for(const sx of [-6,6]){ const en=cyl(g,.75,.75,3,sx,1.3,2.5,10,e); en.rotation.x=Math.PI/2; }
  for(const [wx,wz] of [[0,10],[-2.4,0],[2.4,0]]) box(g,.4,1.3,.6,wx,.65,wz,darkMat);
  const hit=new THREE.Mesh(new THREE.BoxGeometry(26,5,30),new THREE.MeshBasicMaterial({visible:false})); hit.position.y=2.6; g.add(hit);
  return {g,hit}; }
function updatePlanes(dt){
  if(!net.guest&&W===WORLDS.aeropuerto&&state!=='end'&&civPlanes.filter(P=>P.state<3).length<1&&now>planeNextT&&civPlanes.length<4&&now>15){
    planeNextT=now+rand(45,75); const a=aW(...RUNWAY[0]), b=aW(...RUNWAY[1]), m=airlinerMesh(), dir=new THREE.Vector3(b.x-a.x,0,b.z-a.z).normalize();
    const pl={id:++planeSeq,g:m.g,hit:m.hit,pos:new THREE.Vector3(a.x,heightAt(a.x,a.z),a.z),dir,v:0,vy:0,pitch:0,state:0,hp:150,yaw:Math.atan2(dir.x,dir.z)};
    m.hit.userData.plane=pl; civHits.push(m.hit); scene.add(m.g); civPlanes.push(pl); pl.snd=movingLoop('flyover',2.4,{rate:1.6,start:1,ref:120,lp:5000});
    feed('Un avión de pasajeros intenta despegar para huir','var(--paper)'); }
  for(let i=civPlanes.length-1;i>=0;i--){ const pl=civPlanes[i], P=pl.pos;
    if(!net.guest){
      if(pl.state===0){ pl.v=Math.min(78,pl.v+dt*4.2); if(pl.v>62){ pl.state=1; } }
      else if(pl.state===1){ pl.v=Math.min(95,pl.v+dt*2); pl.pitch+=(.16-pl.pitch)*Math.min(1,dt); }
      else if(pl.state===2){ pl.vy-=9.8*dt; pl.pitch+=(-.6-pl.pitch)*Math.min(1,dt*.8); pl.st=(pl.st||0)-dt; if(pl.st<=0){ pl.st=.12; puff(P.clone().setY(P.y+2),0x2a2622,rand(3,5),3,1.5,.7); puff(P.clone().setY(P.y+2),0xff8a30,2,.5,1,1,true); } }
      const gy=heightAt(P.x,P.z);
      if(pl.state<3){ P.addScaledVector(pl.dir,pl.v*dt*Math.cos(pl.pitch)); P.y+=pl.state===2?pl.vy*dt:pl.v*Math.sin(pl.pitch)*dt; if(P.y<gy) P.y=gy; }
      if(pl.state===2&&P.y<=gy+.5){ pl.state=3; pl.v=0; blast(P.clone(),2.2); addCrater(P.clone(),6,1.8); infBlast(P.clone(),14,pl.by||null); pl.burn=now+30; boom(distVol(P,1),2,300); }
      if(pl.state===3&&now<pl.burn){ pl.bt=(pl.bt||0)-dt; if(pl.bt<=0){ pl.bt=.35; puff(P.clone().add(new THREE.Vector3(rand(-8,8),3,rand(-8,8))),0x2a2622,rand(4,7),3,2.5,.7); } }
      if((pl.state===1&&P.distanceTo(new THREE.Vector3(0,P.y,0))>1500)||(pl.state===3&&now>pl.burn+20)){ removePlane(pl); continue; } }
    else if(pl.tp){ const k=Math.min(1,dt*6); P.lerp(pl.tp,k); pl.yaw=wrap(pl.yaw+wrap(pl.tyaw-pl.yaw)*k); pl.pitch+=(pl.tpitch-pl.pitch)*k; }
    pl.g.position.copy(P); pl.g.rotation.set(-pl.pitch,pl.yaw,0,'YXZ'); if(pl.snd) pl.snd.set(P); }
}
function removePlane(pl){ scene.remove(pl.g); if(pl.snd) pl.snd.stop(); const i=civPlanes.indexOf(pl); if(i>=0) civPlanes.splice(i,1); const j=civHits.indexOf(pl.hit); if(j>=0) civHits.splice(j,1); }
function planeHit(pl,dmg,by){
  if(net.guest||pl.state>=2) return; pl.hp-=dmg; puff(pl.pos.clone().setY(pl.pos.y+3),0x5a5550,2,1.5,1,.6);
  if(pl.hp<=0){ pl.by=by; if(pl.state===0){ pl.state=3; blast(pl.pos.clone(),2); pl.burn=now+30; infBlast(pl.pos.clone(),10,by); } else { pl.state=2; pl.vy=pl.v*Math.sin(pl.pitch); }
    feed('¡Derribaron un avión de pasajeros!','var(--enemy)'); if(by&&by.crew&&!by.inf) award(by.crew,'Avión civil derribado',-150,-200); }
}
function clearCivLife(){ traffic.forEach(C=>scene.remove(C.g)); traffic.length=0; civPlanes.slice().forEach(removePlane); civHits.length=0; planeNextT=0; }


