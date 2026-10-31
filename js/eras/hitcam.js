/* ---------- Cámara de impacto (como War Thunder; pedido de Sebastián con un video) ----------
   Cuando tu proyectil le pega a un tanque aparece un recuadro arriba a la derecha: el tanque enemigo en "rayos X" (casco transparente con
   los bordes marcados), el recorrido del proyectil en naranja (con el cono de esquirlas si penetró, o el rebote), los tripulantes y los
   módulos por dentro pintados según el daño (blanco bien, amarillo dañado, rojo destruido o muerto) y, al final, el tanque como quedó.
   Se dibuja con un segundo render en un recuadro de la misma pantalla (tijera), sobre una copia del tanque en una escena aparte. */
const HC={on:false,t:0,dur:5.4,g:null,edges:[],path:[],mods:[],txt:''};
const hcScene=new THREE.Scene(); hcScene.background=new THREE.Color(0x10161c); hcScene.fog=new THREE.Fog(0x10161c,500,1000);   // misma variante de shader que la escena principal
hcScene.add(new THREE.HemisphereLight(0xf2f4ff,0x40382e,.95)); { const s=new THREE.DirectionalLight(0xffffff,.7); s.position.set(4,8,5); hcScene.add(s); }
const hcCam=new THREE.PerspectiveCamera(34,1.6,.1,200);
const hcGhost=new THREE.MeshBasicMaterial({color:0x7f93ab,transparent:true,opacity:.1,depthWrite:false});
const hcEdge=new THREE.LineBasicMaterial({color:0xdde6f2,transparent:true,opacity:.6});
const hcCol={ok:0xd8dee8,dmg:0xf2b33a,dead:0xe0402a}, hcM={}; for(const k in hcCol) hcM[k]=new THREE.MeshBasicMaterial({color:hcCol[k]});
const hcShellM=new THREE.MeshBasicMaterial({color:0xff7a1a}), hcSpallM=new THREE.MeshBasicMaterial({color:0xffc04a,transparent:true,opacity:.85});
const hcBox=document.createElement('div'); hcBox.id='hcBox'; hcBox.innerHTML='<canvas></canvas><b></b><small></small>'; document.body.appendChild(hcBox);
// cilindro de A a B (para el proyectil y las esquirlas)
function hcBeam(a,b,r,mat){ const L=a.distanceTo(b), m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,1,6),mat); m.position.copy(a).add(b).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()); m.scale.y=Math.max(.01,L); m.userData.L=L; return m; }
function hcClear(){ if(HC.g){ hcScene.remove(HC.g); for(const e of HC.edges) e.geometry.dispose(); for(const p of HC.path) p.geometry.dispose(); } HC.g=null; HC.edges=[]; HC.path=[]; HC.mods=[]; }
function hitcamShow(t,hit,dir,res){
  if(!t||!t.root||!dir) return; hcClear(); t.root.updateMatrixWorld(true);
  const g=new THREE.Group(); HC.g=g; hcScene.add(g);
  const ud=[]; t.root.traverse(o=>{ ud.push(o.userData); o.userData={col:!!o.userData.tank,mark:!!o.userData.mark}; });   // userData del tanque se apunta a sí mismo: no se puede copiar
  const c=t.root.clone(true); { let i=0; t.root.traverse(o=>{ o.userData=ud[i++]; }); } c.position.set(0,0,0); g.add(c); let ne=0;
  // casco en rayos X: transparente con los bordes marcados
  c.traverse(o=>{ if(!o.isMesh) return; if(o.userData.col){ o.visible=false; return; } o.userData.hcOrig=o.material; o.material=hcGhost; o.castShadow=false;
    const gm=o.geometry; if(!gm.boundingSphere) gm.computeBoundingSphere(); if(ne<90&&gm.boundingSphere.radius>.18&&!o.userData.mark){ const e=new THREE.LineSegments(new THREE.EdgesGeometry(gm,32),hcEdge); o.add(e); HC.edges.push(e); ne++; } });
  // módulos y tripulantes por dentro, con el color según el daño
  const q=t.root.quaternion, P=compPos(t), st=v=>v<=0?'dead':v<100?'dmg':'ok';
  const mod=(k,w,h,d,s)=>{ if(!P[k]) return; const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),hcM[s]); m.position.copy(P[k]).applyQuaternion(q); m.quaternion.copy(q); g.add(m); HC.mods.push(m); HC.path.push(m); };
  mod('engine',.95,.62,.85,st(t.mod.engine)); mod('trans',.75,.4,.5,st(t.mod.trans)); mod('breech',.32,.3,.7,st(t.mod.breech)); mod('ammo',.55,.42,.6,t.rack?'dead':'ok');
  for(const cm of t.crewM){ const p=P[cm.seat]; if(!p) continue; const s=!cm.alive?'dead':cm.hp<100?'dmg':'ok', f=new THREE.Group();
    f.add(new THREE.Mesh(new THREE.CylinderGeometry(.13,.15,.5,8),hcM[s])); const hd=new THREE.Mesh(new THREE.SphereGeometry(.11,8,6),hcM[s]); hd.position.y=.36; f.add(hd);
    f.position.copy(p).applyQuaternion(q); g.add(f); HC.mods.push(f); f.children.forEach(o=>HC.path.push(o)); }
  // recorrido del proyectil: entra, sigue adentro y abre el cono de esquirlas; o rebota
  const ent=hit.point.clone().sub(t.root.position), d=dir.clone().normalize(), wn=hit.face?hit.face.normal.clone().transformDirection(hit.object.matrixWorld):d.clone().negate();
  const seg=[], pen=res==='Penetración'||res==='Destruido'||res==='Estiba de munición';
  seg.push(hcBeam(ent.clone().addScaledVector(d,-4.5),ent,.045,hcShellM));
  if(pen){ seg.push(hcBeam(ent,ent.clone().addScaledVector(d,1.8),.04,hcShellM));
    const up=Math.abs(d.y)<.9?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0), a1=new THREE.Vector3().crossVectors(d,up).normalize(), a2=new THREE.Vector3().crossVectors(d,a1);
    for(let i=0;i<14;i++){ const ang=i/14*Math.PI*2, sp=rand(.12,.42), v=d.clone().addScaledVector(a1,Math.cos(ang)*sp).addScaledVector(a2,Math.sin(ang)*sp).normalize();
      seg.push(hcBeam(ent.clone().addScaledVector(d,.15),ent.clone().addScaledVector(v,rand(1.1,2.2)),.016,hcSpallM)); } }
  else if(res==='Rebote'){ const r=d.clone().sub(wn.clone().multiplyScalar(2*d.dot(wn))); seg.push(hcBeam(ent,ent.clone().addScaledVector(r,3),.04,hcShellM)); }
  seg.forEach((m,i)=>{ m.userData.k=i; m.scale.y=.001; g.add(m); HC.path.push(m); }); HC.seg=seg;
  // cámara: del lado de donde vino el tiro, un poco arriba y corrida
  const side=new THREE.Vector3(-d.z,0,d.x).normalize(), M=t.T.m;
  HC.look=new THREE.Vector3(0,M.H*.55,0).lerp(ent,.35); HC.cam0=HC.look.clone().addScaledVector(d,-6.8).addScaledVector(side,1.8).add(new THREE.Vector3(0,2.2,0));
  HC.side=side; HC.t=0; HC.on=true; HC.phase=0;
  const hurt=[]; for(const cm of t.crewM) if(!cm.alive) hurt.push(SEAT_ES[cm.seat]||cm.seat);
  hcBox.querySelector('b').textContent=`${t.T.label} · ${t.dead?(t.rack?'Estiba de munición':'Destruido'):res}`;
  hcBox.querySelector('small').textContent=hurt.length?'Fuera de combate: '+hurt.join(', '):t.mod.engine<=0?'Motor destruido':t.mod.breech<=0?'Cañón dañado':'';
  hcBox.classList.add('on'); }

function hitcamUpd(dt){ if(!HC.on) return; HC.t+=dt; const T=HC.t;
  // el proyectil avanza y después se abren las esquirlas
  if(HC.seg) HC.seg.forEach(m=>{ const k=m.userData.k, t0=k===0?0:k===1?.35:.6, f=clamp((T-t0)/(k<2?.35:.4),0,1); m.scale.y=Math.max(.001,m.userData.L*f); });
  // al final, el tanque como quedó (sin rayos X)
  if(T>3.3&&HC.phase===0){ HC.phase=1; HC.g.traverse(o=>{ if(o.userData.hcOrig){ o.material=o.userData.hcOrig; } }); for(const e of HC.edges) e.visible=false; for(const m of HC.mods) m.visible=false; if(HC.seg) HC.seg.forEach(m=>m.visible=false); }
  const a=T*.12; hcCam.position.copy(HC.cam0).applyAxisAngle(new THREE.Vector3(0,1,0),a*(HC.phase?1.6:1)); hcCam.lookAt(HC.look);
  if(T>HC.dur||state!=='play'){ HC.on=false; hcBox.classList.remove('on'); hcClear(); } }
function hitcamDraw(){ const r=hcBox.getBoundingClientRect(); if(r.width<10) return;
  hcCam.aspect=r.width/r.height; hcCam.updateProjectionMatrix();
  const y=innerHeight-r.bottom; renderer.setScissorTest(true); renderer.setScissor(r.left,y,r.width,r.height); renderer.setViewport(r.left,y,r.width,r.height);
  _hcRender(hcScene,hcCam); renderer.setScissorTest(false); renderer.setViewport(0,0,innerWidth,innerHeight);
  // copia del recuadro a un lienzo propio que queda encima de la mira (el velo negro de #scope tapaba la cámara de impacto)
  const cv=hcBox.querySelector('canvas'), pr=renderer.getPixelRatio(), w=Math.round(r.width*pr), h=Math.round(r.height*pr);
  if(cv.width!==w||cv.height!==h){ cv.width=w; cv.height=h; }
  try{ cv.getContext('2d').drawImage(renderer.domElement,Math.round(r.left*pr),Math.round(r.top*pr),w,h,0,0,w,h); }catch(e){} }
const _hcRender=renderer.render.bind(renderer);
renderer.render=function(sc,cam){ _hcRender(sc,cam); if(HC.on&&sc===scene&&renderer.getRenderTarget()===null) hitcamDraw(); };
// quién disparó (hitMark recibe el resultado del impacto)
let hcBy=null;
{ const _ht=hitTank; hitTank=function(by){ hcBy=by; try{ return _ht.apply(this,arguments); } finally{ hcBy=null; } }; }
{ const _hm=hitMark; hitMark=function(hit,pen,res,dir,A){ _hm.apply(this,arguments); const t=hit.object.userData.tank; if(hcBy&&hcBy.isPlayer&&t&&t.team!==hcBy.team) hitcamShow(t,hit,dir,res); }; }
{ const _ua=updateArty; updateArty=function(dt){ _ua(dt); hitcamUpd(dt); }; }
{ const _cb=clearBattle; clearBattle=function(){ HC.on=false; hcBox.classList.remove('on'); hcClear(); return _cb.apply(this,arguments); }; }
