/* ---------- Intro: presentación hecha con el motor del juego, de la 1ª Guerra a los tanques modernos ----------
   Sale una vez por cada versión de la intro (tw_intro_vista guarda INTRO_ID: al cambiar la intro, subir INTRO_ID) y se vuelve a ver desde el inicio o Ajustes.
   Usa una escena propia (como el hangar): un campo, un tanque por toma, cámara de cine, fogonazo y textos. */
const INTRO_SHOTS=[
  {k:'mk1',t:'1916 · Primera Guerra Mundial',s:'Los primeros tanques de la historia cruzan las trincheras del Somme',sky:0x9d9a8c,gr:0x5b4c3a,ww1:1,v:1.5,cam:'side',fire:3.2,dur:6.5},
  {k:'ft17',t:'1917 · Renault FT',s:'Nace la torre que gira 360°: así son los tanques desde entonces',sky:0xa8a79c,gr:0x675a43,ww1:1,v:1.8,cam:'orbit',fire:3.4,dur:6},
  {k:'sherman',t:'1939–1945 · Segunda Guerra Mundial',s:'Próximamente: Sherman, T-34, Panzer y el Nahuel argentino',sky:0xb6b2a0,gr:0x6d6849,v:2.6,cam:'low',fire:3,dur:6},
  {k:'tam',t:'1960–hoy · Guerra Fría',s:'TAM, Leopard, M60 y T-62 en los mapas de Corrientes',sky:0xb9c4c6,gr:0x5d6a44,v:3.6,cam:'track',fire:3.4,dur:6},
  {k:'leo2a4',t:'Hoy',s:'Visión térmica, telémetro y estabilizador',sky:0x8d97a1,gr:0x6a6650,v:2.2,cam:'front',fire:2.6,dur:5.5}
].filter(S=>VEH[S.k]);
let intro=null;
const INTRO_ID='3';
const introSeen=()=>{ try{ return localStorage.getItem('tw_intro_vista')===INTRO_ID; }catch(e){ return true; } };
function introScene(){
  const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0xaaaaaa,40,190); sc.background=new THREE.Color(0xaaaaaa);
  const hemi=new THREE.HemisphereLight(0xe8ecef,0x3a342a,.85); sc.add(hemi);
  const sl=new THREE.DirectionalLight(0xfff0d8,.9); sl.position.set(30,50,20); sc.add(sl);
  // campo con relieve suave y manchas de color (los colores de cada época tiñen la base)
  const g=new THREE.PlaneGeometry(420,420,70,70); g.rotateX(-Math.PI/2); const P=g.attributes.position, col=[];
  for(let i=0;i<P.count;i++){ const x=P.getX(i), z=P.getZ(i); P.setY(i,(Math.sin(x*.07)*Math.cos(z*.05)*.6+Math.sin(x*.21+z*.17)*.15)*Math.min(1,Math.abs(x)/12)); // plano donde anda el tanque
    const c=.82+Math.random()*.28; col.push(c,c,c); }
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.computeVertexNormals();
  const gm=new THREE.MeshLambertMaterial({vertexColors:true}); const ground=new THREE.Mesh(g,gm); ground.position.y=-.05; sc.add(ground);
  // trinchera en zigzag con bolsas de arena (solo en las tomas de la 1ª Guerra)
  const ww1=new THREE.Group(), dark=new THREE.MeshLambertMaterial({color:0x2c241b}), wood=new THREE.MeshLambertMaterial({color:0x4a3a28});
  for(let i=-1;i<=1;i++){ const seg=new THREE.Mesh(new THREE.BoxGeometry(8.4,.12,2.6),dark); seg.position.set(i*8,.02,4+(i%2?1.2:-1.2)); seg.rotation.y=i%2?.28:-.28; ww1.add(seg); } // trinchera que cruza el camino del tanque
  for(let i=0;i<40;i++){ const p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,1.1,5),wood); p.position.set(rand(-20,20),.55,rand(-30,60)); p.rotation.z=rand(-.3,.3); ww1.add(p); }
  for(let i=0;i<55;i++){ const c=new THREE.Mesh(new THREE.CircleGeometry(rand(1,3.4),12),dark); c.rotation.x=-Math.PI/2; c.position.set(rand(-40,40),.03,rand(-40,90)); c.material=c.material.clone(); c.material.transparent=true; c.material.opacity=rand(.35,.7); ww1.add(c); }
  sc.add(ww1);
  // piedras y matas para que el campo no se vea vacío
  const rock=new THREE.MeshLambertMaterial({color:0x6e6a62}), bush=new THREE.MeshLambertMaterial({color:0x4f5a35});
  for(let i=0;i<70;i++){ const b=Math.random()<.55, m=new THREE.Mesh(b?new THREE.IcosahedronGeometry(rand(.5,1.3),0):new THREE.DodecahedronGeometry(rand(.25,.7),0),b?bush:rock);
    const x=rand(-60,60), z=rand(-40,120); if(Math.abs(x)<7) continue; m.position.set(x,b?.3:.1,z); m.scale.y=b?.7:.55; sc.add(m); }
  const cam=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,400);
  return {sc,cam,hemi,gm,ww1,tank:null,fx:[]};
}
function introUI(){
  let el=$('introUI'); if(el) return el;
  el=document.createElement('div'); el.id='introUI';
  el.innerHTML=`<div class="iBar t"></div><div class="iBar b"></div><div class="iFade" id="iFade"></div>
    <div class="iTxt" id="iTxt"><div class="iEra" id="iEra"></div><div class="iSub" id="iSub"></div></div>
    <div class="iLogo" id="iLogo"><img src="img/logo.jpg" alt="Taragüí War: Frente de Acero"></div>
    <div class="iStart" id="iStart"><b>Taragüí War</b><span>Hacé clic para empezar</span></div>
    <button class="iSkip" id="iSkip">Saltar intro ⏭</button>`;
  document.body.appendChild(el);
  $('iSkip').onclick=e=>{ e.stopPropagation(); introEnd(); };
  $('iStart').onclick=()=>{ initAudio(); if(AC.state==='suspended') AC.resume(); introPlay(); };
  return el;
}
document.addEventListener('keydown',e=>{ if(state!=='intro') return; if(['Escape','Enter','Space'].includes(e.code)){ e.preventDefault(); e.stopImmediatePropagation(); if(intro&&!intro.on&&e.code!=='Escape') $('iStart').click(); else introEnd(); } },true);
// Intro en video: al subir video/intro.mp4, poner INTRO_VIDEO_ON=true y se muestra ese video en vez de la hecha con el motor
const INTRO_VIDEO='video/intro.mp4', INTRO_VIDEO_ON=false;
let introVideoOk=INTRO_VIDEO_ON;
function introVideo(){
  const ui=introUI(); let v=$('iVid'); if(!v){ v=document.createElement('video'); v.id='iVid'; v.src=INTRO_VIDEO; v.playsInline=true; v.preload='auto'; ui.insertBefore(v,ui.firstChild); v.onended=()=>introEnd(); v.onerror=()=>{ introVideoOk=false; introEnd(); }; }
  v.hidden=false; v.currentTime=0; $('iFade').style.opacity=0; ui.querySelectorAll('.iBar').forEach(b=>b.hidden=true);
  if(typeof musStop==='function') musStop(); v.volume=Math.min(1,volMaster); v.play().catch(()=>{});
}
// Arranca la intro. Sin sonido habilitado todavía (primera visita) muestra "Hacé clic para empezar": el clic habilita el audio.
function introStart(){
  if(!INTRO_SHOTS.length&&!introVideoOk) return;
  if(document.pointerLockElement) document.exitPointerLock();
  stopAllLoops(); state='intro'; intro=intro||introScene(); intro.on=false; intro.i=-1; intro.t=0;
  const ui=introUI(); ui.hidden=false; document.body.classList.add('intro'); $('iLogo').style.opacity=0; $('iTxt').style.opacity=0; $('iFade').style.opacity=1;
  if(AC&&AC.state==='running') introPlay(); else $('iStart').hidden=false;
}
function introPlay(){ $('iStart').hidden=true; if(introVideoOk){ intro.on=false; intro.vid=true; introVideo(); return; } intro.vid=false; intro.on=true; intro.i=-1; introNext(); }
function introTank(key){
  const t=makeTank({name:'',team:0,nation:VEH[key].nation,isPlayer:false,cams:{}},key,0,0,0);
  const i=tanks.indexOf(t); if(i>=0) tanks.splice(i,1); colliders=colliders.filter(c=>c.userData.tank!==t);
  scene.remove(t.root); t.root.position.set(0,0,0); t.root.rotation.set(0,0,0); return t;
}
function introNext(){
  const I=intro; if(I.tank){ I.sc.remove(I.tank.root); I.tank=null; }
  I.i++; I.t=0; I.fired=false; I.dustT=0;
  if(I.i>=INTRO_SHOTS.length){ I.logoT=0; $('iTxt').style.opacity=0; $('iLogo').style.opacity=1; if(AC) sfx('cannon',null,.55,{near:true,rate:.7}); return; }
  const S=INTRO_SHOTS[I.i]; I.tank=introTank(S.k); I.sc.add(I.tank.root); I.z=-S.v*S.dur*.45;
  I.tank.turret.rotation.y=S.cam==='orbit'?.9:0; I.tank.gunPivot.rotation.x=0;
  I.sc.background.set(S.sky); I.sc.fog.color.set(S.sky); I.gm.color.set(S.gr); I.ww1.visible=!!S.ww1;
  $('iEra').textContent=S.t; $('iSub').textContent=S.s;
  if(AC&&SFX.drive&&SFX.drive.length) sfx('drive',null,.18,{near:true,rate:S.ww1?.7:1});
}
function introFx(pos,color,size,grow,life,op,add,vy){
  const m=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,color,transparent:true,opacity:op,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));
  m.position.copy(pos); m.scale.setScalar(size); intro.sc.add(m); intro.fx.push({m,size,grow,life,max:life,op,vy:vy||0});
}
function introFire(){
  const I=intro, t=I.tank, mp=new THREE.Vector3(); (t.muzzle||t.root).getWorldPosition(mp);
  const fw=new THREE.Vector3(0,0,1).applyQuaternion(t.gunPivot.getWorldQuaternion(new THREE.Quaternion()));
  introFx(mp.clone().addScaledVector(fw,.8),0xff9a30,4,4,.22,1,true);
  introFx(mp.clone().addScaledVector(fw,1.6),0xffe0a0,2.4,3,.16,1,true);
  introFx(mp.clone().addScaledVector(fw,.4),0xff6a10,3,2,.3,.9,false);
  if(!I.light){ I.light=new THREE.PointLight(0xffa040,0,30); I.sc.add(I.light); } I.light.position.copy(mp).addScaledVector(fw,1); I.light.intensity=4;
  for(let i=0;i<7;i++) introFx(mp.clone().addScaledVector(fw,rand(.5,3)).add(new THREE.Vector3(rand(-.4,.4),rand(-.2,.4),rand(-.4,.4))),0x8a857c,rand(1,1.8),rand(1.2,2.2),rand(1.6,2.6),.55,false,.35);
  for(const s of [-1,1]) introFx(mp.clone().addScaledVector(fw,-.4).add(new THREE.Vector3(s*.9,-.2,0)),0x9a9488,1.2,2,1.4,.4,false,.1);
  t.barrel.position.z=-.45; I.shake=.35;
  if(AC) sfx('cannon',null,.9,{near:true,rate:INTRO_SHOTS[I.i].ww1?.8:1});
}
function introCam(S,u,P){
  // las distancias crecen con el largo del tanque (el Mark I mide casi 10 m)
  const C=intro.cam, k=Math.max(1,intro.tank.T.m.L/6), L=new THREE.Vector3(P.x,P.y+1.3*Math.min(k,1.4),P.z);
  if(S.cam==='side'){ C.position.set(P.x+11*k,1.9*k,P.z-3*k+u*5*k); }
  else if(S.cam==='orbit'){ const a=.9+u*1.6; C.position.set(P.x+Math.sin(a)*9*k,2.6*k,P.z+Math.cos(a)*9*k); }
  else if(S.cam==='low'){ C.position.set(P.x+3.5*k,.55,P.z+(13-u*4)*k); L.y+=.4; }
  else if(S.cam==='track'){ C.position.set(P.x-6.5*k,2.1*k,P.z+(-3+u*1.5)*k); L.z+=4*k; }
  else { C.position.set(P.x+1.6*k,1.35*k,P.z+(15-u*7)*k); L.y+=.5; }
  if(intro.shake>0){ C.position.x+=rand(-1,1)*intro.shake*.25; C.position.y+=rand(-1,1)*intro.shake*.2; }
  C.lookAt(L);
}
// Un cuadro de la intro (frame() lo llama en vez del juego mientras state==='intro')
function introFrame(dt){
  const I=intro; if(I.vid){ quietEngine(); return; } syncIntro(); quietEngine();
  if(I.on&&I.i<INTRO_SHOTS.length){
    const S=INTRO_SHOTS[I.i], t=I.tank; I.t+=dt; const u=Math.min(1,I.t/S.dur);
    I.z+=S.v*dt; t.root.position.set(0,0,I.z); t.root.rotation.x=Math.sin(I.t*2.3)*.006;
    if(S.cam==='orbit') t.turret.rotation.y=.9-Math.min(.9,I.t*.35);
    if(!I.fired&&I.t>=S.fire){ I.fired=true; introFire(); }
    t.barrel.position.z=Math.min(0,t.barrel.position.z+dt*.9);
    I.dustT-=dt; if(I.dustT<=0){ I.dustT=.12; const M=t.T.m; for(const s of [-1,1]) introFx(new THREE.Vector3(s*M.W*.42,.25,I.z-M.L*.45),S.ww1?0x6e604c:0x8c8470,rand(.6,1),1.6,1.2,.35,false,.15); }
    introCam(S,u,t.root.position);
    $('iTxt').style.opacity=I.t<.5?I.t/.5:I.t>S.dur-.7?Math.max(0,(S.dur-I.t)/.7):1;
    $('iFade').style.opacity=I.t<.35?1-I.t/.35:I.t>S.dur-.35?Math.min(1,(I.t-(S.dur-.35))/.35):0;
    if(I.t>=S.dur) introNext();
  } else if(I.on){ I.logoT+=dt; $('iFade').style.opacity=I.logoT<.4?1-I.logoT/.4*.3:I.logoT>2.6?Math.min(1,.7+(I.logoT-2.6)/.5):.7; // fondo casi negro detrás del logo
    const C=I.cam; C.position.set(Math.sin(I.logoT*.1)*30,8,-40); C.lookAt(0,1,20); if(I.logoT>3.2) introEnd(); }
  else { const C=I.cam; C.position.set(12,4,-10); C.lookAt(0,1,10); }
  I.shake=Math.max(0,(I.shake||0)-dt); if(I.light) I.light.intensity=Math.max(0,I.light.intensity-dt*22);
  for(let i=I.fx.length-1;i>=0;i--){ const F=I.fx[i]; F.life-=dt; const k=1-F.life/F.max; F.m.scale.setScalar(F.size*(1+F.grow*k)); F.m.position.y+=F.vy*dt; F.m.material.opacity=F.op*(1-k);
    if(F.life<=0){ I.sc.remove(F.m); F.m.material.dispose(); I.fx.splice(i,1); } }
  const C=I.cam; C.aspect=innerWidth/innerHeight; C.updateProjectionMatrix();
  renderer.render(I.sc,C);
}
function introEnd(){
  if(state!=='intro') return;
  try{ localStorage.setItem('tw_intro_vista',INTRO_ID); }catch(e){}
  const I=intro; if(I.tank){ I.sc.remove(I.tank.root); I.tank=null; } I.fx.forEach(F=>{ I.sc.remove(F.m); F.m.material.dispose(); }); I.fx.length=0; I.on=false; I.vid=false;
  const v=$('iVid'); if(v){ v.pause(); v.hidden=true; } document.querySelectorAll('#introUI .iBar').forEach(b=>b.hidden=false);
  $('introUI').hidden=true; document.body.classList.remove('intro');
  state='menu'; menuScreen='home'; mainMenu();
}
