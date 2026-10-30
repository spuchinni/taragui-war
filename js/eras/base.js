/* ---------- Garaje en una base al aire libre y campo de tiro (pedido de Sebastián) ----------
   - El hangar deja de ser un cuarto oscuro: el tanque está en la explanada de una base, con el galpón de chapa atrás, sacos terreros,
     tambores, cajones, una carpa y, al costado, el campo de tiro con sus blancos de madera a 100, 200 y 400 m y un tanque viejo de blanco.
   - Cámara libre: arrastrar gira alrededor del tanque (y sube o baja), la rueda o el pellizco acercan y alejan, doble clic la centra.
     Si no se toca nada por 10 s vuelve a girar sola.
   - "🎯 Campo de tiro": salís con el tanque elegido a un campo abierto con blancos quietos a 100, 250, 450 y 700 m que reaparecen
     al destruirlos y munición que se repone sola. Esc → Abandonar para volver. */
const BASE_COL={ground:0x6c7350,apron:0x77746c,earth:0x8a7556,wood:0x8b6a44,board:0xd8cfb4,sand:0xb7a57c,steel:0x6b7068,canvas:0x6e6a4a};
function baseScene(){
  const sc=new THREE.Scene(); sc.background=new THREE.Color(0xaec2d0); sc.fog=new THREE.Fog(0xaec2d0,140,760);
  const L=c=>new THREE.MeshLambertMaterial({color:c});
  sc.add(new THREE.HemisphereLight(0xeef3f8,0x5a5240,.8));
  const sun=new THREE.DirectionalLight(0xfff1d8,1.0); sun.position.set(18,30,14); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:80}); sc.add(sun);
  const add=(geo,mat,x,y,z,ry=0)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.y=ry; m.receiveShadow=true; sc.add(m); return m; };
  // suelo, explanada de cemento con juntas y marcas del lugar del tanque
  const g=add(new THREE.PlaneGeometry(1600,1600),L(BASE_COL.ground),0,0,0); g.rotation.x=-Math.PI/2;
  const ap=add(new THREE.PlaneGeometry(34,30),L(BASE_COL.apron),-3,.02,-4); ap.rotation.x=-Math.PI/2;
  const jm=L(0x75726b); for(let i=-2;i<=2;i++){ add(new THREE.BoxGeometry(34,.02,.08),jm,-3,.03,-4+i*6); add(new THREE.BoxGeometry(.08,.02,30),jm,-3+i*6.8,.03,-4); }
  const ym=new THREE.MeshBasicMaterial({color:0xc9b14a}); for(const [x,z,w,d] of [[-4.6,0,.18,10],[4.6,0,.18,10],[0,5,9.4,.18]]) add(new THREE.BoxGeometry(w,.03,d),ym,x,.035,z);
  // galpón de chapa en arco (Nissen), abierto hacia el tanque
  { const hm=L(0x7c8277), arc=new THREE.CylinderGeometry(9,9,24,20,1,true,-Math.PI/2,Math.PI); arc.rotateZ(Math.PI/2); arc.rotateY(Math.PI/2);
    const h=add(arc,hm,-6,0,-36); h.material.side=THREE.DoubleSide; h.castShadow=true;
    const back=add(new THREE.CircleGeometry(9,20,0,Math.PI),L(0x3a3c38),-6,0,-47.9); back.material.side=THREE.DoubleSide;
    for(let i=0;i<11;i++){ const r=add(new THREE.TorusGeometry(9.05,.08,4,20,Math.PI),L(0x5c6058),-6,0,-47.5+i*2.3); }                       // costillas de la chapa
    const fl=add(new THREE.PlaneGeometry(18,24),L(0x55534e),-6,.03,-36); fl.rotation.x=-Math.PI/2; }
  // sacos terreros, tambores, cajones, carpa y mástil
  const sb=L(BASE_COL.sand), sg=new THREE.SphereGeometry(.42,8,5); sg.scale(1.45,.55,.8);
  const bags=(x,z,n,ry,rows=3)=>{ for(let r=0;r<rows;r++) for(let i=0;i<n-r%2;i++){ const m=add(sg,sb,0,0,0); const lx=(i-(n-1)/2+(r%2)*.5)*1.15; m.position.set(x+Math.cos(ry)*lx,.22+r*.4,z-Math.sin(ry)*lx); m.rotation.y=ry; m.castShadow=true; } };
  bags(15,-6,8,Math.PI/2); bags(-21,8,7,.3); bags(10,14,6,-.4,2);
  const dm=L(0x4f5b3e), dr=L(0x8a3a2a), dg=new THREE.CylinderGeometry(.3,.3,.9,12);
  for(let i=0;i<9;i++){ const m=add(dg,i%4===0?dr:dm,-19+(i%3)*.66,.45+(i>5?.9:0),-12+((i/3|0)%2)*.66); m.castShadow=true; }
  const cm=L(BASE_COL.wood); for(const [x,z,s] of [[12,-14,1],[13.3,-14,1],[12.6,-14,1.8],[-15,12,1.2],[-16.3,12.4,1]]){ const m=add(new THREE.BoxGeometry(1.2,.8,.9),cm,x,s>1.5?1.2:.4,z,.2); m.castShadow=true; }
  { const t=new THREE.CylinderGeometry(.01,3.6,3,4,1); t.rotateY(Math.PI/4); t.scale(1,1,1.6); const m=add(t,L(BASE_COL.canvas),20,1.5,10,.5); m.castShadow=true; }
  { const p=add(new THREE.CylinderGeometry(.07,.09,11,8),L(0xb0b0a8),9,5.5,-17); p.castShadow=true; baseScene.flag=add(new THREE.PlaneGeometry(2.4,1.5),new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide}),10.25,10,-17); }
  // campo de tiro: carril entre dos terraplenes, carteles de distancia, blancos de madera y un tanque viejo
  const lane=(z)=>[22+(-z)*.05,z];                                                                                                   // el carril se abre un poco hacia la derecha
  const em=L(BASE_COL.earth); for(const s of [-1,1]){ const b=add(new THREE.BoxGeometry(3,1.6,460),em,26+s*11,.5,-250,-.05); b.scale.y=1; }
  const tg=(z,big)=>{ const [x]=lane(z), k=big?1.6:1, w=add(new THREE.BoxGeometry(3*k,2.6*k,.15),L(BASE_COL.board),x,1.6*k+.6,z); w.castShadow=true;
    for(const [r,c] of [[1.1,0xb03a2a],[.75,0xece6d4],[.42,0xb03a2a],[.14,0x222222]]){ const d=add(new THREE.CircleGeometry(r*k,20),new THREE.MeshBasicMaterial({color:c}),x,1.6*k+.6,z+.09+r*.001); }
    for(const s of [-1,1]) add(new THREE.BoxGeometry(.15,1.4*k,.15),cm,x+s*1.2*k,.7*k,z);
    const sg2=add(new THREE.BoxGeometry(1.4,.6,.06),L(0xe8e0c8),x-4.5,1.4,z+3); add(new THREE.BoxGeometry(.1,1.4,.1),cm,x-4.5,.7,z+3); return sg2; };
  tg(-100,false); tg(-200,false); tg(-400,true);
  { const [x]=lane(-300), hm=L(0x4a4038), hk=new THREE.Group(); hk.position.set(x+2,0,-300); hk.rotation.y=.6; sc.add(hk);
    for(const [w,h,d,y,z] of [[3,1.1,6,.9,0],[2,.8,2.4,1.85,.3],[.15,.15,2.6,1.9,1.9]]){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),hm); m.position.set(0,y,z); m.castShadow=true; hk.add(m); }
    for(const s of [-1,1]){ const m=new THREE.Mesh(new THREE.BoxGeometry(.6,.9,6.2),L(0x2c2a28)); m.position.set(s*1.4,.45,0); hk.add(m); } }
  // lomas lejanas y algunos árboles
  for(const [x,z,r,h] of [[-260,-420,240,60],[180,-560,300,70],[-520,60,260,50],[420,-140,220,45],[60,420,280,40]]){ const m=add(new THREE.SphereGeometry(r,18,8,0,Math.PI*2,0,Math.PI/2),L(0x6f7454),x,-r+h,z); m.scale.y=h/r*1.8; }
  const tm=L(0x4a6034), tt=L(0x5a4632);
  for(let i=0;i<40;i++){ const a=i*2.39996, r=60+((i*37)%90), x=Math.cos(a)*r-10, z=Math.sin(a)*r+10; if(x>5&&x<45&&z<-20) continue;
    add(new THREE.CylinderGeometry(.18,.26,2.6,6),tt,x,1.3,z); const c=add(new THREE.IcosahedronGeometry(2.4+(i%3)*.5,0),tm,x,4.2,z); c.scale.y=1.2; }
  return sc;
}
// bandera de la nación elegida (franjas con los colores del uniforme si no hay otra cosa)
function baseFlag(nat){ const f=baseScene.flag; if(!f||!NATIONS[nat]) return; const N=NATIONS[nat], c=document.createElement('canvas'); c.width=96; c.height=64; const x=c.getContext('2d');
  const cols=N.flagC||(N.uni||N.camo||['#556','#999']); cols.forEach((k,i)=>{ x.fillStyle=typeof k==='number'?'#'+k.toString(16).padStart(6,'0'):k; x.fillRect(i*96/cols.length,0,96/cols.length+1,64); });
  if(f.material.map) f.material.map.dispose(); f.material.map=new THREE.CanvasTexture(c); f.material.needsUpdate=true; }

hgInit=function(){
  if(hg) return hg;
  const sc=baseScene(), cam=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.1,2000);
  hg={sc,cam,obj:null,key:null,yaw:.9,pitch:.3,zoom:1,drag:null,idle:0,pinch:0};
  const cv=document, touchT=()=>{ hg.idle=0; }, bg=e=>{ const t=e.target; return t===renderer.domElement||t.id==='panel'||t.id==='overlay'||(t.classList&&t.classList.contains('hg')); };   // el fondo del hangar (la capa .hg tapa el canvas)
  cv.addEventListener('mousedown',e=>{ if(hangarOn()&&bg(e)){ hg.drag=[e.clientX,e.clientY]; touchT(); } });
    document.addEventListener('mouseup',()=>{ if(hg) hg.drag=null; });
  document.addEventListener('mousemove',e=>{ if(hg&&hg.drag&&hangarOn()){ hg.yaw-=(e.clientX-hg.drag[0])*.008; hg.pitch=clamp(hg.pitch+(e.clientY-hg.drag[1])*.005,.03,1.25); hg.drag=[e.clientX,e.clientY]; touchT(); } });
  cv.addEventListener('wheel',e=>{ if(!hangarOn()||!bg(e)) return; e.preventDefault(); hg.zoom=clamp(hg.zoom*Math.exp(e.deltaY*.0012),.42,2.6); touchT(); },{passive:false});
  cv.addEventListener('dblclick',e=>{ if(hangarOn()&&bg(e)){ hg.yaw=.9; hg.pitch=.3; hg.zoom=1; } });
  // celular: un dedo gira, dos dedos acercan o alejan
  cv.addEventListener('touchstart',e=>{ if(!hangarOn()||!bg(e)) return; touchT(); if(e.touches.length===1) hg.drag=[e.touches[0].clientX,e.touches[0].clientY];
    else if(e.touches.length===2){ hg.drag=null; hg.pinch=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY); } },{passive:true});
  cv.addEventListener('touchmove',e=>{ if(!hangarOn()||!(hg.drag||hg.pinch)) return; touchT();
    if(e.touches.length===1&&hg.drag){ const t=e.touches[0]; hg.yaw-=(t.clientX-hg.drag[0])*.01; hg.pitch=clamp(hg.pitch+(t.clientY-hg.drag[1])*.006,.03,1.25); hg.drag=[t.clientX,t.clientY]; }
    else if(e.touches.length===2&&hg.pinch){ const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY); hg.zoom=clamp(hg.zoom*hg.pinch/d,.42,2.6); hg.pinch=d; } },{passive:true});
  cv.addEventListener('touchend',()=>{ if(hg){ hg.drag=null; hg.pinch=0; } },{passive:true});
  return hg;
};
hgRender=function(dt){
  const H=hgInit(); if(!H.obj) return false;
  H.idle+=dt; if(H.idle>10&&!H.drag) H.yaw+=dt*.1;
  const M=H.obj.T.m, R=Math.max(8,M.L*1.45+4.5)*H.zoom, w=innerWidth, h=innerHeight, cp=Math.cos(H.pitch);
  H.cam.aspect=w/h; H.cam.position.set(Math.sin(H.yaw)*R*cp,Math.max(.4,Math.sin(H.pitch)*R+1.2),Math.cos(H.yaw)*R*cp); H.cam.lookAt(0,M.H*.45,0);
  H.cam.setViewOffset(w,h,w>900?w*.1:0,h*.06,w,h); H.cam.updateProjectionMatrix();
  if(baseScene.flag) baseScene.flag.rotation.y=Math.sin(performance.now()*.0011)*.25;
  const sm=renderer.shadowMap.enabled; renderer.shadowMap.enabled=true; renderer.render(H.sc,H.cam); renderer.shadowMap.enabled=sm; return true;
};
{ const _hs=hgShow; hgShow=function(key,nat){ const had=hg&&hg.key; _hs.apply(this,arguments); if(hg&&hg.obj){ hg.obj.root.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); baseFlag(nat); } }; }

// ---- botones del hangar: campo de tiro y ayuda de la cámara ----
{ const _rh=renderHangar; renderHangar=function(){ const r=_rh.apply(this,arguments);
    const tb=$('hgTut'); if(tb&&!$('hgRange')){ tb.insertAdjacentHTML('afterend','<button class="hgB" id="hgRange" title="Probar el tanque contra blancos quietos">🎯 Campo de tiro</button>'); $('hgRange').onclick=goWrap(()=>startRange(hgSel)); }
    const hgD=document.querySelector('.hg'); if(hgD&&!document.querySelector('.hgHint')) hgD.insertAdjacentHTML('beforeend',`<div class="hgHint">${typeof MOVIL!=='undefined'&&MOVIL?'Un dedo: girar · dos dedos: acercar':'Arrastrá para girar · rueda para acercar · doble clic: centrar'}</div>`);
    return r; }; }

// ---- campo de tiro ----
const RANGE_D=[[100,-12],[250,22],[450,-30],[700,40]];
function startRange(key){
  if(!PROG) loadProg(); if(!key||!VEH[key]||!owned(key)) return;
  const e=eraOf(key); battleBR=null; startBattle(false,e===1?'villers':e===2?'jarama':'alamein',null,true); battleBR=null;
  tut={range:true,key,d:[],step:0,okT:0,start:null,shots:0,hits:0};
  infantry.slice().forEach(removeInf); infantry.length=0; tanks.slice().forEach(removeTank);
  crews=[playerCrew]; playerCrew.sp=400; playerCrew.lineup=[key];
  const sp=W.sp[0][0], fx=0-sp.x, fz=0-sp.z, l=Math.hypot(fx,fz)||1; tut.sp=sp; tut.u=[fx/l,fz/l];
  const T=vehTreeE(foeNation,e); tut.foeL=T.length?T:NATIONS[foeNation].lineup.slice();
  RANGE_D.forEach((_,i)=>rangeTarget(i));
  player=spawnCrew(playerCrew,key,sp); tut.start=player.pos.clone();
  camYaw=player.heading; camPitch=.1; camDist=14; state='play'; $('overlay').style.display='none'; document.body.classList.remove('deploy','menu','home'); document.body.classList.add('tut');
  rangeBox(); lock(); updateHud(); banner(player.T.label,'Campo de tiro · Esc → Abandonar para volver',3);
}
function rangeTarget(i){ const [dist,side]=RANGE_D[i], [ux,uz]=tut.u, sp=tut.sp, L=tut.foeL, k=L[Math.min(L.length-1,Math.round(i*(L.length-1)/(RANGE_D.length-1)))];
  const c=newCrew(`Blanco ${dist} m`,1,foeNation,false); c.out=true; crews.push(c);
  const t=spawnCrew(c,k,{label:'',x:sp.x+ux*dist-uz*side,z:sp.z+uz*dist+ux*side}); t.dummy=true; t.immuneT=0; t.heading=Math.atan2(ux,uz)+Math.PI/2*(i%2?1:-1); t.rangeI=i; t.dist=dist; tut.d[i]=t; }
function rangeBox(){ const d=tut.d.map(t=>t&&!t.dead?`<span>${t.T.label} · ${t.dist} m</span>`:'<span style="opacity:.5">reapareciendo…</span>').join('');
  $('tutbox').innerHTML=`<b>🎯 Campo de tiro · ${player?player.T.label:''}</b>Blancos quietos que reaparecen al destruirlos; la munición se repone sola. Probá la mira, las distancias y cada munición. Esc → Abandonar para volver al hangar.<div class="rgL">${d}</div>`; }
{ const _ut=updateTutorial; updateTutorial=function(dt){ if(!(tut&&tut.range)) return _ut.apply(this,arguments);
    if(!player||state!=='play') return;
    if(player.dead){ tut.respT=(tut.respT||0)+dt; if(tut.respT>3){ tut.respT=0; removeTank(player); playerCrew.sp=400; player=spawnCrew(playerCrew,tut.key,tut.sp); } return; }
    let ch=false; tut.d.forEach((t,i)=>{ if(!t) return; t.spottedT=3; if(t.dead){ t.rt=(t.rt||0)+dt; if(t.rt>6){ removeTank(t); crews=crews.filter(c=>c!==t.crew); rangeTarget(i); ch=true; } } });
    tickets[0]=tickets[1]=400;                                                                          // en el campo de tiro no se pierde nada
    tut.ammoT=(tut.ammoT||0)+dt; if(tut.ammoT>2&&player.ammoCount){ tut.ammoT=0; player.ammoCount=player.ammoMax.slice(); player.mgBelt=250; }
    if(ch||(tut.boxT=(tut.boxT||0)+dt)>2){ tut.boxT=0; rangeBox(); } }; }
