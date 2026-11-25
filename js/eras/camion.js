/* ---------- Tanque nuevo que llega en camión (pedido de Sebastián, 20/11/2026, con el "Oshkosh M1070 HET M1A1 Abrams" de Sketchfab de referencia) ----------
   Cada vez que un tanque pasa a ser tuyo (comprado, regalado por el entrenamiento, el premio diario, una nación nueva…), la primera vez que
   aparece en el garaje no está ahí: llega por la explanada arriba de un transporte de tanques Oshkosh M1070 + semirremolque M1000 (hecho por
   código), frena, baja las rampas, el tanque baja marcha atrás, gira en el lugar hasta su lugar y el camión se va. Tocar/clic o Esc lo saltea.
   Solo para tanques desbloqueados mientras jugás (PROG.llegaPend): los que ya tenías no vuelven a llegar (ver sync, 22/11/2026). */
(()=>{
  const S=()=>document.getElementById('llegaBox');
  { const st=document.createElement('style'); st.textContent='body.llega .hg>*:not(canvas){opacity:0!important;pointer-events:none!important;transition:opacity .4s} body.llega .hgHint{display:none}'; document.head.appendChild(st); }
  const M=c=>new THREE.MeshLambertMaterial({color:c});
  const MAT={tan:M(0xb8a57c),oli:M(0x5d6343),dark:M(0x2c2c2a),tire:M(0x1e1e1d),rim:M(0x6b6a60),glass:new THREE.MeshLambertMaterial({color:0x2a3a44,emissive:0x0b1418}),
    steel:M(0x6f706a),red:new THREE.MeshBasicMaterial({color:0x8a1a12}),amber:new THREE.MeshBasicMaterial({color:0xd08a1a}),lens:new THREE.MeshBasicMaterial({color:0xe8e4cc})};
  const bx=(p,w,h,d,x,y,z,m)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); b.position.set(x,y,z); b.castShadow=b.receiveShadow=true; p.add(b); return b; };
  const cy=(p,r,len,x,y,z,m,seg=14,axis='z')=>{ const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,seg),m); if(axis==='z') c.rotation.x=Math.PI/2; else if(axis==='x') c.rotation.z=Math.PI/2; c.position.set(x,y,z); c.castShadow=true; p.add(c); return c; };
  // rueda de camión: goma, llanta con cubo y tuercas (el eje va en z: el camión anda hacia +x)
  function tire(p,x,y,z,r,w,L,face){ const g=new THREE.Group(); g.position.set(x,y,z); p.add(g);
    cy(g,r,w,0,0,0,MAT.tire,18); cy(g,r*.62,w+.02,0,0,0,MAT.rim,14); cy(g,r*.2,w+.06,0,0,0,MAT.dark,8);
    for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; cy(g,.03,w+.08,Math.cos(a)*r*.4,Math.sin(a)*r*.4,0,MAT.dark,5); }
    for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, b=bx(g,.07,.05,w+.01,Math.cos(a)*r*.98,Math.sin(a)*r*.98,0,MAT.tire); b.rotation.z=a; }      // tacos
    L.push({g,r}); return g; }
  // ---- el equipo: tractor M1070 (8x8, 9,1 × 2,59 m) + semirremolque M1000 (5 ejes, 40 ruedas, piso de 3,66 m de ancho) ----
  // Origen = centro del piso del semirremolque, a la altura del piso (DECK). Adelante = +x.
  const DECK=1.05, DL=11.2, RAMP=2.5, REAR=-DL/2;
  function buildRig(col){ const rig=new THREE.Group(), W=[], P=MAT[col], ramps=[];
    // semirremolque: piso, largueros, cuello de cisne, ejes
    const tr=new THREE.Group(); rig.add(tr);
    bx(tr,DL,.18,3.66,0,-.09,0,P); bx(tr,DL,.32,.14,0,-.3,1.72,P); bx(tr,DL,.32,.14,0,-.3,-1.72,P);                                   // piso y vigas de los bordes
    for(let i=0;i<14;i++) bx(tr,.1,.03,3.6,REAR+.4+i*.8,.01,0,MAT.dark);                                                             // listones del piso
    for(const z of [-1.82,1.82]) for(let i=0;i<9;i++) bx(tr,.06,.08,.06,REAR+.6+i*1.25,.0,z,MAT.dark);                                // argollas para las cadenas
    bx(tr,DL-1,.5,.9,0,-.45,0,P);                                                                                                     // viga central
    { const g=new THREE.Group(); g.position.set(DL/2,0,0); tr.add(g);                                                              // cuello de cisne
      const sh=new THREE.Shape(); sh.moveTo(0,-.4); sh.lineTo(0,.05); sh.lineTo(.9,.95); sh.lineTo(3.4,.95); sh.lineTo(3.4,.45); sh.lineTo(1.1,.45); sh.lineTo(.5,-.4); sh.closePath();
      const geo=new THREE.ExtrudeGeometry(sh,{depth:2.5,bevelEnabled:false}); geo.translate(0,0,-1.25);
      const m=new THREE.Mesh(geo,P); m.castShadow=m.receiveShadow=true; g.add(m); bx(g,.12,1.3,3.66,.0,-.2,0,P); }
    // 5 ejes atrás, 4 ruedas por lado (dos pares)
    for(let a=0;a<5;a++){ const x=REAR+1.0+a*1.12; cy(tr,.08,3.4,x,-.62,0,MAT.dark,8);
      for(const z of [-1.55,-1.1,1.1,1.55]) tire(tr,x,-.6,z,.42,.36,W);
      for(const s of [-1,1]) bx(tr,.9,.06,.95,x,-.15,s*1.33,MAT.dark); }
    // luces atrás y las rampas (bisagra en el borde de atrás; levantadas = paradas)
    for(const s of [-1,1]){ bx(tr,.06,.12,.3,REAR-.04,-.25,s*1.55,MAT.red); bx(tr,.06,.08,.12,REAR-.04,-.25,s*1.25,MAT.amber); }
    for(const s of [-1,1]){ const h=new THREE.Group(); h.position.set(REAR,0,s*1.15); tr.add(h);
      const r=new THREE.Group(); h.add(r); bx(r,RAMP,.1,1.15,-RAMP/2,-.05,0,P); for(let i=0;i<6;i++) bx(r,.06,.04,1.1,-.25-i*.4,.02,0,MAT.dark);
      for(const zz of [-.55,.55]) bx(r,RAMP,.16,.06,-RAMP/2,-.08,zz,P); ramps.push(h); }
    // tractor M1070
    const tk=new THREE.Group(); tk.position.set(DL/2+2.6,0,0); rig.add(tk);
    bx(tk,8.6,.4,1.1,1.6,-.25,0,MAT.dark);                                                                                             // chasis
    bx(tk,1.6,.12,1.6,-.6,.88,0,MAT.dark); cy(tk,.55,.1,-.6,.95,0,MAT.steel,14,'y');                                                 // quinta rueda
    for(const x of [-1.15,.25,3.45,5.0]){ cy(tk,.08,2.3,x,-.42,0,MAT.dark,8); for(const s of [-1,1]) tire(tk,x,-.42,s*1.07,.63,.45,W); }   // 4 ejes (8x8)
    for(const s of [-1,1]){ bx(tk,2.9,.08,.62,-.45,.32,s*1.06,P); bx(tk,3.2,.08,.62,4.2,.32,s*1.06,P); }                              // guardabarros
    // cabina de lados planos con parabrisas partido, techo con ganchos, capó corto con parrilla grande
    const cab=new THREE.Group(); cab.position.set(3.8,0,0); tk.add(cab);
    bx(cab,2.3,1.75,2.5,0,1.3,0,P); bx(cab,2.4,.1,2.55,0,2.22,0,P);
    for(const s of [-1,1]){ const w=bx(cab,.06,.8,1.05,1.16,1.62,s*.6,MAT.glass); w.rotation.z=-.12; bx(cab,1.1,.68,.05,.15,1.62,s*1.26,MAT.glass); bx(cab,.55,1.2,.05,-.75,1.15,s*1.26,P); }
    bx(cab,1.0,1.15,2.5,1.65,.85,0,P); bx(cab,.06,.8,2.0,2.16,.9,0,MAT.dark);                                                          // capó y parrilla
    for(let i=0;i<7;i++) bx(cab,.07,.06,1.9,2.19,.55+i*.11,0,P);
    for(const s of [-1,1]){ cy(cab,.11,.08,2.17,.55,s*.95,MAT.lens,12,'x'); bx(cab,.06,.08,.18,2.18,1.35,s*1.15,MAT.amber); }
    bx(cab,.3,.3,2.7,2.3,.22,0,MAT.dark);                                                                                              // paragolpes
    for(const s of [-1,1]){ const e=bx(cab,.05,.35,.25,1.0,1.75,s*1.42,MAT.dark); bx(cab,.25,.04,.04,1.0,1.65,s*1.33,MAT.dark); }      // espejos
    cy(cab,.09,2.4,-1.35,2.2,1.0,MAT.steel,10,'y'); cy(cab,.13,.5,-1.35,1.05,1.0,MAT.dark,10,'y');                                     // escape vertical detrás de la cabina
    bx(cab,.6,.9,.8,-1.5,.95,-.85,P); cy(tk,.6,.42,-.1,1.35,-.95,MAT.tire,16,'z').rotation.y=0;                                        // caja de herramientas y auxilio
    bx(cab,.25,.25,.45,-1.4,.55,1.1,MAT.dark);                                                                                         // tanque de aire
    // dos malacates detrás de la cabina (el tanque sube con cable)
    for(const s of [-1,1]) cy(tk,.28,.6,1.9,.95,s*.55,MAT.dark,12,'z');
    rig.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
    return {rig,W,ramps};
  }
  // ---- animación ----
  const L={on:false};
  const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2, out=u=>1-Math.pow(1-u,3), cl=u=>Math.max(0,Math.min(1,u));
  function sndLoop(name,vol,rate){ if(typeof AC==='undefined'||!AC||!SFX[name]||!SFX[name].length) return null;
    const s=AC.createBufferSource(); s.buffer=SFX[name][0]; s.loop=true; s.playbackRate.value=rate||1; const g=AC.createGain(); g.gain.value=0;
    s.connect(g).connect(master); s.start(0,.3); return {s,g,set(v,r){ g.gain.setTargetAtTime(v,AC.currentTime,.25); if(r) s.playbackRate.setTargetAtTime(r,AC.currentTime,.3); },
      stop(){ try{ g.gain.setTargetAtTime(0,AC.currentTime,.3); s.stop(AC.currentTime+1.5); }catch(e){} }}; }
  function start(t,k){
    if(L.on) finish(true); L.cp=null;
    const H=hg, T=t.T.m, len=T.L||7, col=eraOf(k)>=5?'tan':'oli', R=buildRig(col);
    // dónde para: el tanque, marcha atrás por las rampas, tiene que terminar en (0,0,0)
    const xT=(len/2)-REAR+RAMP+len/2+.8, xStop=xT, x0=xStop-95;
    H.sc.add(R.rig); R.rig.position.set(x0,DECK,0);
    H.sc.remove(t.root); R.rig.add(t.root); t.root.position.set(0,0,0); t.root.rotation.set(0,Math.PI/2,0);       // arriba del piso, mirando para adelante
    t.turret.rotation.y=0; t.gunPivot.rotation.x=0;
    document.body.classList.add('llega');
    L.hid=[]; H.sc.children.forEach(o=>{ const p=o.position; if(o.isMesh&&p.z>2&&p.x>3&&p.x<30&&p.y<6&&o.visible){ o.visible=false; L.hid.push(o); } });   // carpa y sacos entre la cámara y el camión
    Object.assign(L,{on:true,t,k,R,x0,xStop,xT,len,time:0,truck:sndLoop('truck',.0,.8),eng:null,prevX:x0});
    if(L.truck) L.truck.set(.55,1);
    const nm=(VEH[k]&&VEH[k].label)||k, en=window.LANG==='en';
    let b=S(); if(!b){ b=document.createElement('div'); b.id='llegaBox'; b.setAttribute('data-notr',''); document.body.appendChild(b); }
    b.innerHTML=`<div class="llT">🚚 ${en?'Your new tank has arrived':'¡Llegó tu tanque nuevo!'}</div><div class="llN">${nm}</div><div class="llS">${en?'Click to skip':'Tocá para saltear'}</div>`;
    b.style.cssText='position:fixed;left:50%;top:9%;transform:translateX(-50%);z-index:60;text-align:center;color:#fff;font-family:inherit;pointer-events:none;text-shadow:0 2px 6px #000,0 0 2px #000;transition:opacity .6s;opacity:1';
    b.querySelector('.llT').style.cssText='font-size:15px;letter-spacing:.08em;text-transform:uppercase;color:#ffd47a';
    b.querySelector('.llN').style.cssText='font-size:30px;font-weight:800;margin-top:2px';
    b.querySelector('.llS').style.cssText='font-size:12px;opacity:.75;margin-top:4px';
  }
  const DUR={come:6.2,ramp:1.4,down:4.2,turn:1.8,go:4.5};
  function finish(skip){ if(!L.on) return; const t=L.t, H=hg; L.on=false;
    if(t&&t.root.parent) t.root.parent.remove(t.root); if(H&&t&&hg.obj===t){ H.sc.add(t.root); t.root.position.set(0,0,0); t.root.rotation.set(0,0,0); t.turret.rotation.y=-.25; t.gunPivot.rotation.x=-.05; }
    if(L.R&&L.R.rig.parent) L.R.rig.parent.remove(L.R.rig);
    if(L.R) L.R.rig.traverse(o=>{ if(o.isMesh&&o.geometry) o.geometry.dispose(); });
    if(L.truck) L.truck.stop(); if(L.eng) L.eng.stop(); L.truck=L.eng=null;
    if(H){ H.yaw=.32; H.pitch=.26; H.idle=0; }
    document.body.classList.remove('llega'); (L.hid||[]).forEach(o=>o.visible=true); L.hid=[];
    const b=S(); if(b){ b.style.opacity=0; setTimeout(()=>{ if(!L.on&&b.parentNode) b.remove(); },700); } }
  function step(dt){ const t=L.t, R=L.R; if(!hg||hg.obj!==t||!hangarOn()){ finish(true); return; }
    L.time+=dt; const T=L.time; let u, rx=R.rig.position.x;
    const t1=DUR.come, t2=t1+DUR.ramp, t3=t2+DUR.down, t4=t3+DUR.turn, t5=t4+DUR.go;
    // 1) llega y frena
    if(T<t1){ u=out(T/t1); rx=L.x0+(L.xStop-L.x0)*u; if(L.truck) L.truck.set(.25+.35*(1-u),.65+.35*(1-u)); }
    else if(T<t4) rx=L.xStop;
    else { u=cl((T-t4)/DUR.go); rx=L.xStop+u*u*90; if(L.truck) L.truck.set(.5,.7+u*.5); }
    const dx=rx-R.rig.position.x; R.rig.position.x=rx; for(const w of R.W) w.g.rotation.z-=dx/w.r;
    // 2) bajan las rampas (y suben antes de irse)
    const down=Math.asin(Math.min(.98,DECK/RAMP)), rr=T<t1?0:T<t2?ease((T-t1)/DUR.ramp):T<t4?1:1-cl((T-t4)/.9);
    for(const h of R.ramps) h.rotation.z=(1-rr)*(-Math.PI/2)+rr*down;                                             // paradas → apoyadas en el suelo
    // 3) el tanque baja marcha atrás, 4) gira en el lugar
    if(T>=t2&&T<t4){ if(!L.eng){ L.eng=sndLoop('drive',0,.8); if(L.eng) L.eng.set(.45,.9); if(R.rig.children.includes(t.root)){ R.rig.remove(t.root); hg.sc.add(t.root); } }
      const xs=L.xStop, xe=0, u2=ease(cl((T-t2)/DUR.down)), x=xs+(xe-xs)*u2;                                                       // centro del tanque en el mundo
      const rearW=xs+REAR, hFor=xx=>DECK*cl((xx-(rearW-RAMP))/RAMP), xb=x-L.len/2*.85, xf=x+L.len/2*.85, yb=hFor(xb), yf=hFor(xf);
      t.root.position.set(x,(yb+yf)/2,0); const pit=Math.atan2(yf-yb,xf-xb);
      const u3=ease(cl((T-t3)/DUR.turn)); t.root.rotation.set(0,0,0); t.root.rotation.order='YXZ'; t.root.rotation.y=Math.PI/2*(1-u3); t.root.rotation.x=-pit*(1-u3);
      t.turret.rotation.y=-.25*u3; if(T>t3&&L.eng) L.eng.set(.35,.7); }
    if(T>=t4&&L.eng){ L.eng.stop(); L.eng=null; if(t.root.parent!==hg.sc){ t.root.parent&&t.root.parent.remove(t.root); hg.sc.add(t.root); } t.root.position.set(0,0,0); t.root.rotation.set(0,0,0); t.turret.rotation.y=-.25; }
    // cámara: sigue al camión cuando llega, al tanque cuando baja, y se acerca a la toma de siempre
    // llega: de costado y lejos para ver el equipo entero (~21 m); baja: más cerca del tanque; al final, la toma del garaje
    const H=hg, w=innerWidth, h=innerHeight, mid=rx+4.3, tx=t.root.position.x;
    const P=T<t2?[mid+4,5.5,25,mid,1.8]:T<t3?[tx+7,4.4,17,tx+1.5,1.5]:T<t4?[tx+6,4,15,tx,1.4]:[7,4.4,15,0,1.3];
    if(!L.cp){ L.cp=new THREE.Vector3(P[0],P[1],P[2]); L.cl=new THREE.Vector3(P[3],P[4],0); }
    const k=T<t1*.92?1:Math.min(1,dt*1.8); L.cp.lerp(new THREE.Vector3(P[0],P[1],P[2]),k); L.cl.lerp(new THREE.Vector3(P[3],P[4],0),k);
    H.cam.aspect=w/h; H.cam.position.copy(L.cp); H.cam.lookAt(L.cl); H.cam.setViewOffset(w,h,0,h*.04,w,h); H.cam.updateProjectionMatrix();
    if(T>t5) finish(false);
    return true; }
  // engancha el render del garaje: mientras llega el camión, la cámara es la de la animación
  { const _r=hgRender; hgRender=function(dt){ if(L.on&&hg&&hg.obj){ const ok=step(Math.min(dt,.1)); if(L.on&&ok){
        if(baseScene.flag) baseScene.flag.rotation.y=Math.sin(performance.now()*.0011)*.25;
        const sm=renderer.shadowMap.enabled; renderer.shadowMap.enabled=true; renderer.render(hg.sc,hg.cam); renderer.shadowMap.enabled=sm; return true; } }
      return _r.apply(this,arguments); }; }
  // saltear: clic, toque o Esc en el garaje
  const skip=e=>{ if(L.on&&hangarOn()&&L.time>.4){ finish(true); if(e&&e.type==='keydown') e.stopPropagation(); } };
  document.addEventListener('pointerdown',skip,true); document.addEventListener('keydown',e=>{ if(e.key==='Escape') skip(e); },true);
  // ¿cuándo llega? (22/11/2026, pedido de Sebastián: "debe ser cuando se desbloquea un tanque nuevo, no cuando voy al hangar")
  // Antes salía para todo tanque tuyo que no estuviera en PROG.llego, y si esa lista se desfasaba (progreso que llega de la nube, de otro aparato…)
  // el camión traía tanques que ya tenías cada vez que entrabas al garaje. Ahora: los que tenés al cargar el progreso son la base; solo un tanque
  // que pasa a ser tuyo mientras jugás (comprado, regalado, premio) queda "en camino" (PROG.llegaPend) y el camión lo trae la primera vez que el
  // garaje lo muestra: en el acto si lo compraste ahí, o la próxima vez que entrás si lo ganaste en otra pantalla.
  // 24/11/2026 (pedido de Sebastián: "no salió la animación del tanque llegando en el camión"): (1) comprar marca el tanque en camino en el acto
  // (buyTank envuelto), sin depender de comparar listas; (2) lo que está en camino se guarda también fuera de PROG (enCamino), porque la nube
  // reemplaza el objeto PROG al juntar progresos y la marca se perdía; (3) al entrar al garaje, si hay un tanque en camino de esa nación y época,
  // el garaje lo elige solo (antes había que seleccionarlo: si lo compraste en el árbol o en el resumen, el camión no salía).
  let base=null, baseP=null; const enCamino=new Set();
  const llegaOk=k=>VEH[k]&&!VEH[k].support&&!(PROG.loan&&PROG.loan.k===k);
  const marcar=k=>{ (PROG.llegaPend=PROG.llegaPend||{})[k]=1; enCamino.add(k); };
  function sync(){ if(!PROG) return; const own=PROG.owned||{};
    if(PROG!==baseP||!base){ baseP=PROG; base=new Set(Object.keys(own));                                     // progreso nuevo (al cargar, otra cuenta, la nube): base sin animar
      for(const k in (PROG.llegaPend||{})) enCamino.add(k);
      for(const k of enCamino) if(own[k]&&llegaOk(k)) (PROG.llegaPend=PROG.llegaPend||{})[k]=1;                // lo que ya estaba en camino sigue en camino
      return; }
    for(const k in own) if(!base.has(k)){ base.add(k); if(llegaOk(k)) marcar(k); } }
  { const _sp=saveProg; saveProg=function(){ try{ sync(); }catch(e){} return _sp.apply(this,arguments); }; }
  { const _l=loadProg; loadProg=function(){ const r=_l.apply(this,arguments); try{ sync(); }catch(e){} return r; }; }
  { const _b=buyTank; buyTank=function(k){ const r=_b.apply(this,arguments);
      try{ if(r&&PROG&&llegaOk(k)){ sync(); if(base) base.add(k); marcar(k); saveProg(); } }catch(e){ console.warn('camión',e); } return r; }; }
  const pendHere=()=>{ if(!PROG||!PROG.llegaPend) return null; const G=garageOf(chosenNation);
    return Object.keys(PROG.llegaPend).find(k=>VEH[k]&&owned(k)&&G.includes(k))||null; };
  { const _hs=hgShow; hgShow=function(key){ _hs.apply(this,arguments);
      try{ if(!PROG||!hg||!hg.obj||!key||!VEH[key]||PROG.train) return; sync();
        if(owned(key)&&PROG.llegaPend&&PROG.llegaPend[key]){ delete PROG.llegaPend[key]; enCamino.delete(key); saveProg(); start(hg.obj,key); return; }
        const k=hangarOn()&&!L.on&&pendHere();
        if(k&&k!==key) setTimeout(()=>{ if(hangarOn()&&!L.on&&PROG.llegaPend&&PROG.llegaPend[k]){ hgSel=k; renderHangar(); } },0); }catch(e){ console.warn('camión',e); } }; }
  { const st=document.createElement('style'); st.textContent='body.llega #tallerBox{opacity:0!important}'; document.head.appendChild(st); }   // el cartel del taller espera a que se vaya el camión
  // 25/11/2026 (pedido de Sebastián: "terminé la partida, compré un tanque y no salió el camión"): después de la batalla "Salir de la partida"
  // vuelve a la portada del menú y de ahí "Jugar ahora" va derecho a otra batalla, así que el garaje nunca se mostraba. Ahora, si hay un tanque
  // en camino de la época, el menú abre el garaje de su nación con ese tanque y el camión lo trae en el acto.
  { const _mm=mainMenu; let busy=false; mainMenu=function(){ const r=_mm.apply(this,arguments);
      try{ if(busy||!PROG||PROG.train||state!=='menu'||L.on) return r; sync();
        const k=Object.keys(PROG.llegaPend||{}).find(k=>VEH[k]&&owned(k)&&llegaOk(k)&&(VEH[k].era||3)===curEra);
        if(k&&!(menuScreen==='hangar'&&hgSel===k)&&(menuScreen==='hangar'||document.body.classList.contains('home'))){
          busy=true; chosenNation=VEH[k].nation; hgSel=k; menuScreen='hangar'; try{ _mm.call(this); }finally{ busy=false; } } }catch(e){ console.warn('camión',e); }
      return r; }; }
  { const _sb=startBattle; startBattle=function(){ try{ if(L.on) finish(true); }catch(e){} return _sb.apply(this,arguments); }; }   // si arranca una batalla, el camión se saltea (no queda el cartel)
  window.llegaCamion=k=>{ if(hg&&hg.obj) start(hg.obj,k||hgSel); };                                                 // para probar desde la consola
})();
