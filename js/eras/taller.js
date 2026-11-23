/* ---------- Garaje: oficina técnica (mesa de dibujo con el plano) y taller en el galpón (23/11/2026, pedido de Sebastián) ----------
   Referencias de Sketchfab que pasó él (solo de referencia, todo hecho por código): "Art Drafting Desk" (Raffey), "Old Drafting Table" (RendeRum),
   "Car Garage – Desert Garage Environment" (DevPoly3D), "Autoservice Props Pack" (kanistra), "Engine Hoist" (dinoxwave), "Old Work Bench" (OliverTriple).
   - Oficina técnica a la izquierda de la explanada: mesa de dibujo inclinada con el plano de lo que se está investigando (azul, con el tanque en líneas
     blancas sacado de su miniatura, cotas y rótulo), lámpara, banqueta, archivo, pizarrón con planos y un toldo de lona.
   - Taller en la boca del galpón: pórtico con aparejo y un motor colgando, banco de trabajo con morsa y herramientas, tablero de herramientas,
     carro de soldadura con tubos, ruedas y eslabones de repuesto, motor en caballete, caja de herramientas y dos mecánicos trabajando.
   - Escenas cortas al volver al garaje (`tallerQ`, la llena el resumen de la batalla): tanque investigado → la cámara va a la mesa y aparece su plano;
     mejora de un tanque (nivel nuevo, munición) → el taller con chispas de soldadura y el cartel de la mejora. También al elegir qué investigar en el árbol
     (plano nuevo). Clic, toque o Esc saltea. `tallerVer('res'|'up'|'pick', k)` en la consola las repite. */
(function(){
  const TL={p:null,cut:null,q:[]}; window.tallerQ=TL.q; window._TL=TL;
  const L=c=>new THREE.MeshLambertMaterial({color:c});
  const M={wood:L(0x7a5a36),dark:L(0x2e2b26),steel:L(0x5d625c),red:L(0x9a2c22),yel:L(0xc9a43a),canvas:L(0x6e6a4a),paper:L(0xe8e2cc),rub:L(0x1d1c1a),eng:L(0x4a4e46),cork:L(0x8a6a44)};
  const en=()=>window.LANG==='en', T2=(a,b)=>en()?b:a;
  function box(p,w,h,d,x,y,z,m,ry=0){ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); o.rotation.y=ry; o.castShadow=o.receiveShadow=true; p.add(o); return o; }
  function cyl(p,r1,r2,h,x,y,z,m,s=10){ const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,s),m); o.position.set(x,y,z); o.castShadow=o.receiveShadow=true; p.add(o); return o; }

  // ---- plano azul (canvas): grilla, marco, rótulo y el tanque en líneas blancas (bordes de su miniatura) ----
  const BP={c:null,tex:null,k:null};
  function bpDraw(k){ if(!BP.c){ BP.c=document.createElement('canvas'); BP.c.width=1024; BP.c.height=720; BP.tex=new THREE.CanvasTexture(BP.c); BP.tex.anisotropy=4; }
    const c=BP.c, x=c.getContext('2d'), V=VEH[k]; BP.k=k;
    x.fillStyle='#1e4f86'; x.fillRect(0,0,1024,720);
    x.strokeStyle='rgba(255,255,255,.08)'; x.lineWidth=1; for(let i=0;i<1024;i+=32){ x.beginPath(); x.moveTo(i,0); x.lineTo(i,720); x.stroke(); } for(let j=0;j<720;j+=32){ x.beginPath(); x.moveTo(0,j); x.lineTo(1024,j); x.stroke(); }
    x.strokeStyle='rgba(255,255,255,.85)'; x.lineWidth=4; x.strokeRect(22,22,980,676); x.lineWidth=1.5; x.strokeRect(32,32,960,656);
    // rótulo
    x.strokeRect(620,560,372,128); x.beginPath(); x.moveTo(620,600); x.lineTo(992,600); x.moveTo(620,640); x.lineTo(992,640); x.stroke();
    x.fillStyle='#fff'; x.font='bold 30px sans-serif'; x.textBaseline='middle'; x.fillText(V?V.label:'—',632,580,350);
    x.font='20px sans-serif'; x.fillText(V?`${(NATIONS[V.nation]||{}).label||''} · ${T2('rango','rank')} ${typeof RANK_ROMAN!=='undefined'?RANK_ROMAN[rankOf(k)]||'':''} · ${V.year||''}`:'',632,620,350);
    x.fillText(T2('PLANO N.º ','DRAWING No. ')+String(Math.abs([...k].reduce((a,ch)=>a*31+ch.charCodeAt(0),7))%9000+1000)+'  ·  '+T2('Oficina técnica','Design office'),632,664,350);
    // tanque: bordes de la miniatura en blanco
    let img=null; try{ if(typeof mini!=='undefined'&&typeof miniInit==='function'&&miniInit()){ let u=mini.img.get(k); if(!u){ u=miniDibujar(k); mini.img.set(k,u); } img=u; } }catch(e){}
    if(img){ const im=new Image(); im.onload=()=>{ if(BP.k!==k) return; edgeDraw(x,im); BP.tex.needsUpdate=true; }; im.src=img; }
    // cotas
    if(V&&V.m){ x.strokeStyle='rgba(255,255,255,.7)'; x.lineWidth=1.5; x.font='18px sans-serif';
      x.beginPath(); x.moveTo(110,520); x.lineTo(560,520); x.moveTo(110,510); x.lineTo(110,530); x.moveTo(560,510); x.lineTo(560,530); x.stroke(); x.fillText(`${(V.m.L||0).toFixed(2).replace('.',',')} m`,300,540);
      x.beginPath(); x.moveTo(600,150); x.lineTo(600,480); x.moveTo(590,150); x.lineTo(610,150); x.moveTo(590,480); x.lineTo(610,480); x.stroke(); x.save(); x.translate(625,330); x.rotate(-Math.PI/2); x.fillText(`${(V.m.H||V.m.W||0).toFixed(2).replace('.',',')} m`,-30,0); x.restore();
      x.font='17px sans-serif'; x.fillStyle='rgba(255,255,255,.85)'; const A=V.armor||{}, H=A.hull||{};
      [[T2('Cañón','Gun'),V.ammo&&V.ammo[0]?V.ammo[0].n:''],[T2('Blindaje','Armor'),H.front?`${H.front} / ${H.side||'?'} / ${H.rear||'?'} mm`:''],[T2('Tripulación','Crew'),V.crewReal||V.crew||''],[T2('Velocidad','Speed'),V.maxF?Math.round(V.maxF*3.6/(V.era>=3?1:1))+' km/h':'']]
        .forEach(([a,b],i)=>{ if(b!=='') x.fillText(`${a}: ${b}`,660,90+i*30,320); }); }
    x.font='bold 22px sans-serif'; x.fillStyle='#fff'; x.fillText(T2('INVESTIGACIÓN','RESEARCH'),50,60);
    BP.tex.needsUpdate=true; }
  function edgeDraw(x,im){ const w=560,h=315, c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); g.drawImage(im,0,0,w,h);
    const D=g.getImageData(0,0,w,h), s=D.data, o=g.createImageData(w,h), od=o.data, lum=new Float32Array(w*h), al=new Float32Array(w*h);
    for(let i=0;i<w*h;i++){ lum[i]=(s[i*4]*.3+s[i*4+1]*.59+s[i*4+2]*.11)/255; al[i]=s[i*4+3]/255; }
    for(let yy=1;yy<h-1;yy++) for(let xx=1;xx<w-1;xx++){ const i=yy*w+xx;
      const gx=lum[i+1]-lum[i-1]+(al[i+1]-al[i-1])*1.5, gy=lum[i+w]-lum[i-w]+(al[i+w]-al[i-w])*1.5, e=Math.min(1,Math.hypot(gx,gy)*2.6);
      od[i*4]=od[i*4+1]=od[i*4+2]=255; od[i*4+3]=e>.18?Math.round(e*255):(al[i]>.5?18:0); }
    g.putImageData(o,0,0); x.drawImage(c,70,110,520,292); }

  // ---- escenografía ----
  function build(sc){
    const P={}, g=new THREE.Group(); sc.add(g);
    // oficina técnica (izquierda de la explanada, mirando hacia la cámara de siempre)
    const of=new THREE.Group(); of.position.set(-13.5,0,-13); of.rotation.y=.75; g.add(of); P.of=of;
    for(const [x,z] of [[-2.2,-1.6],[2.2,-1.6],[-2.2,1.8],[2.2,1.8]]) cyl(of,.06,.06,2.9,x,1.45,z,M.wood,6);                       // toldo de lona sobre 4 postes
    { const r=box(of,4.8,.05,3.8,0,2.92,.1,M.canvas); r.rotation.x=-.06; }
    // mesa de dibujo: patas, tablero inclinado con el plano, regla paralela y lámpara de brazo
    const dk=new THREE.Group(); dk.position.set(0,0,0); of.add(dk); P.dk=dk;
    for(const sx of [-1,1]){ box(dk,.06,.95,.06,sx*.78,.47,-.42,M.wood); box(dk,.06,.95,.06,sx*.78,.47,.42,M.wood); box(dk,.05,.05,.9,sx*.78,.18,0,M.wood); }
    box(dk,1.6,.05,.05,0,.18,-.42,M.wood);
    const brd=new THREE.Group(); brd.position.set(0,1.0,0); brd.rotation.x=.52; dk.add(brd);
    box(brd,1.72,.05,1.06,0,0,0,M.wood);
    bpDraw(Object.keys(VEH).find(k=>VEH[k].era===3&&!VEH[k].support&&!VEH[k].static)||Object.keys(VEH)[0]);
    const bp=new THREE.Mesh(new THREE.PlaneGeometry(1.58,1.0),new THREE.MeshLambertMaterial({map:BP.tex})); bp.rotation.x=-Math.PI/2; bp.position.y=.03; bp.receiveShadow=true; brd.add(bp); P.bp=bp;
    box(brd,1.66,.025,.05,0,.05,.2,M.dark);                                                                                         // regla paralela
    { const t=box(brd,.02,.03,.4,.45,.05,-.05,M.yel); t.rotation.y=.6; box(brd,.18,.02,.03,-.5,.045,.4,M.red); cyl(brd,.012,.012,.17,-.3,.045,.42,M.dark,6).rotation.z=Math.PI/2; }   // escuadra, goma y lápiz
    { const a=cyl(dk,.025,.025,.8,.82,1.35,-.42,M.dark,6); const b=cyl(dk,.02,.02,.7,.65,1.78,-.22,M.dark,6); b.rotation.x=.9; const sh=cyl(dk,.04,.16,.18,.52,1.92,.08,M.steel,12); sh.rotation.x=-.5; P.lamp=sh; }
    cyl(dk,.2,.2,.05,0,.72,.85,M.dark,12); cyl(dk,.03,.03,.7,0,.36,.85,M.steel,6);                                                // banqueta
    // archivo, pizarrón con planos y una caja de rollos
    box(of,.6,1.3,.6,-1.6,.65,-1.0,M.steel); for(let i=0;i<3;i++) box(of,.5,.02,.02,-1.6,.35+i*.4,-.69,M.dark);
    { const b=new THREE.Group(); b.position.set(1.6,0,-1.1); b.rotation.y=-.35; of.add(b); box(b,1.4,1.0,.05,0,1.55,0,M.cork); for(const s of [-1,1]) box(b,.06,1.9,.06,s*.65,.95,.03,M.wood);
      const sm=new THREE.MeshLambertMaterial({color:0x2a5a92}); box(b,.55,.4,.01,-.3,1.65,.035,sm); box(b,.5,.42,.01,.32,1.5,.035,M.paper); box(b,.4,.3,.01,.1,1.25,.035,sm); }
    { const r=box(of,.7,.35,.5,1.2,.18,.9,M.wood); for(let i=0;i<5;i++){ const c=cyl(of,.04,.04,.8,1.0+i*.1,.45,.9,i%2?M.paper:new THREE.MeshLambertMaterial({color:0x2a5a92}),8); c.rotation.z=Math.PI/2; } }
    // ---- taller en la boca del galpón (el galpón está centrado en x=-6, abierto hacia z=-24) ----
    const sh=new THREE.Group(); sh.position.set(-6,0,-28); g.add(sh); P.sh=sh;
    // pórtico con aparejo: dos patas en A, viga en I y motor colgando de la cadena
    for(const sx of [-1,1]){ const x=-3.6+sx*2.4; for(const sz of [-1,1]){ const l=box(sh,.14,4.3,.14,x,2.1,sz*.7,M.yel); l.rotation.x=-sz*.16; } box(sh,.12,.12,1.6,x,.06,0,M.yel); }
    box(sh,5.2,.22,.14,-3.6,4.25,0,M.yel); box(sh,.4,.25,.3,-3.6,4.05,0,M.dark);                                                   // viga y carro del aparejo
    const ch=box(sh,.04,1.9,.04,-3.6,3.0,0,M.dark);
    const en1=new THREE.Group(); en1.position.set(-3.6,1.75,0); sh.add(en1); P.engH=en1;                                         // motor V colgado
    box(en1,1.3,.6,.8,0,0,0,M.eng); for(const s of [-1,1]){ const hd=box(en1,1.2,.22,.34,0,.4,s*.24,M.steel); hd.rotation.x=s*.5; for(let i=0;i<6;i++) cyl(en1,.035,.035,.18,-.5+i*.2,.45,s*.46,M.dark,6).rotation.x=Math.PI/2; }
    cyl(en1,.28,.28,.12,.72,-.05,0,M.dark,16).rotation.z=Math.PI/2; box(en1,.6,.08,.6,0,-.35,0,M.dark);
    for(const s of [-1,1]){ const c=box(sh,.02,.7,.02,-3.6+s*.4,2.35,s*.0,M.dark); c.rotation.z=s*.35; }
    // banco de trabajo con morsa y herramientas, tablero de herramientas atrás
    const bn=new THREE.Group(); bn.position.set(2.6,0,-2.2); sh.add(bn); P.bn=bn;
    box(bn,3.2,.1,.9,0,.92,0,M.wood); for(const sx of [-1,1]) for(const sz of [-1,1]) box(bn,.08,.9,.08,sx*1.5,.45,sz*.38,M.wood); box(bn,3.0,.05,.8,0,.3,0,M.wood);
    box(bn,.25,.18,.2,-1.2,1.06,.3,M.steel); box(bn,.06,.06,.3,-1.2,1.06,.48,M.dark);                                              // morsa
    for(let i=0;i<5;i++){ const t=box(bn,.3,.03,.06,-.4+i*.25,.99,.1-i*.05,i%2?M.dark:M.red); t.rotation.y=i*.4; }
    { const pg=box(bn,3.2,1.6,.05,0,1.95,-.48,new THREE.MeshLambertMaterial({map:pegTex()})); pg.castShadow=false; }
    box(bn,.7,.9,.5,2.1,.45,0,M.red); for(let i=0;i<4;i++) box(bn,.6,.02,.02,2.1,.2+i*.2,.26,M.dark);                              // caja de herramientas
    // carro de soldadura, motor en caballete, ruedas y eslabones de repuesto, tambores
    { const w=new THREE.Group(); w.position.set(-.6,0,1.2); sh.add(w); box(w,.6,.5,.45,0,.35,0,M.steel); cyl(w,.13,.13,1.2,-.15,1.0,-.08,new THREE.MeshLambertMaterial({color:0x2a5a3a}),10); cyl(w,.11,.11,1.0,.15,.9,-.08,new THREE.MeshLambertMaterial({color:0x8a2a2a}),10);
      for(const s of [-1,1]){ const r=cyl(w,.12,.12,.05,s*.3,.12,.15,M.rub,10); r.rotation.z=Math.PI/2; } }
    { const e=new THREE.Group(); e.position.set(.6,0,-1.0); e.rotation.y=.4; sh.add(e); box(e,1.0,.5,.7,0,.75,0,M.eng); box(e,.9,.18,.5,0,1.1,0,M.steel); for(const s of [-1,1]) box(e,.06,.5,.6,s*.45,.25,0,M.dark); }
    for(let i=0;i<4;i++){ const r=cyl(sh,.38,.38,.18,3.6,.1+i*.19,1.6,i%2?M.steel:M.rub,14); }
    for(let i=0;i<7;i++){ const l=box(sh,.55,.06,.22,2.6+((i%3)-1)*.08,.04+i*.06,2.6,M.dark); l.rotation.y=(i%2?.2:-.1); }
    for(let i=0;i<3;i++) cyl(sh,.3,.3,.9,-6.8+i*.65,.45,-1.6,i===1?M.red:new THREE.MeshLambertMaterial({color:0x4f5b3e}),12);
    // chispas de la soldadura (se prenden en la escena de la mejora y de a ratos)
    { const n=48, geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(n*3),3));
      const pm=new THREE.PointsMaterial({color:0xffc060,size:.07,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}); const pts=new THREE.Points(geo,pm); pts.position.set(-3.6,1.2,.55); pts.frustumCulled=false; sh.add(pts);
      const fl=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),new THREE.MeshBasicMaterial({color:0xcfe4ff})); fl.position.copy(pts.position); sh.add(fl);
      P.sp={pts,fl,v:new Float32Array(n*3),life:new Float32Array(n),n,on:0}; }
    // mecánicos
    P.mech=[];
    try{ if(typeof personMesh==='function'){ for(const [x,z,ry,pose] of [[2.4,-1.5,Math.PI,'bench'],[-3.6,1.1,Math.PI,'weld']]){ const pm=personMesh({kind:'crew',team:0,nat:'us'}); const p=pm.g; p.position.set(x,0,z); p.rotation.y=ry; sh.add(p);
        p.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); if(pm.parts&&pm.parts.wep) pm.parts.wep.visible=false; P.mech.push({pm,pose}); } } }catch(e){ console.warn('taller: mecánicos',e); }
    // cámaras de las escenas (en coordenadas del mundo)
    of.updateMatrixWorld(true); sh.updateMatrixWorld(true);
    P.camDesk=[of.localToWorld(new THREE.Vector3(.2,2.15,1.65)),of.localToWorld(new THREE.Vector3(0,1.0,0))];
    P.camDesk0=[of.localToWorld(new THREE.Vector3(1.6,3.2,4.6)),of.localToWorld(new THREE.Vector3(0,1.2,0))];
    P.camShop=[sh.localToWorld(new THREE.Vector3(1.2,2.6,5.4)),sh.localToWorld(new THREE.Vector3(-2.2,1.5,-.4))];
    P.camShop0=[sh.localToWorld(new THREE.Vector3(4.8,3.6,8.5)),sh.localToWorld(new THREE.Vector3(-1,1.4,-1))];
    return P; }
  function pegTex(){ const c=document.createElement('canvas'); c.width=256; c.height=128; const x=c.getContext('2d'); x.fillStyle='#b9a27a'; x.fillRect(0,0,256,128);
    x.fillStyle='rgba(60,40,20,.5)'; for(let i=6;i<256;i+=10) for(let j=6;j<128;j+=10){ x.beginPath(); x.arc(i,j,1.2,0,7); x.fill(); }
    x.fillStyle='#2b2b2b'; x.strokeStyle='#2b2b2b'; x.lineWidth=5; const T=[[20,20,20,90],[45,25,45,95],[70,18,70,60],[95,30,120,30],[150,20,150,100],[180,25,200,90],[230,20,230,70]]; T.forEach(([a,b,c2,d])=>{ x.beginPath(); x.moveTo(a,b); x.lineTo(c2,d); x.stroke(); });
    x.fillStyle='#8a2a22'; x.fillRect(95,60,30,40); x.fillStyle='#c9a43a'; x.beginPath(); x.arc(205,30,9,0,7); x.fill(); return new THREE.CanvasTexture(c); }

  { const _bs=baseScene; baseScene=function(){ const sc=_bs.apply(this,arguments); try{ TL.p=build(sc); }catch(e){ console.warn('taller',e); } return sc; }; }

  // ---- animación de todos los días: mecánicos que trabajan y chispas de a ratos ----
  function idle(dt,tm,hot){ const P=TL.p; if(!P) return;
    for(const m of P.mech){ const pt=m.pm.parts; if(!pt) continue; const a=Math.sin(tm*(m.pose==='bench'?6:2.2));
      if(m.pose==='bench'){ pt.armR&&(pt.armR.rotation.x=-1.2+a*.35); pt.armL&&(pt.armL.rotation.x=-.9); pt.torso&&(pt.torso.rotation.x=.25); }
      else { pt.armR&&(pt.armR.rotation.x=-1.0+a*.08); pt.armL&&(pt.armL.rotation.x=-1.1); pt.torso&&(pt.torso.rotation.x=.15); } }
    const S=P.sp; if(!S) return; const want=hot||((tm%7)<2.2); S.on=want?1:Math.max(0,S.on-dt*3);
    const pa=S.pts.geometry.attributes.position, A=pa.array;
    for(let i=0;i<S.n;i++){ S.life[i]-=dt; if(S.life[i]<=0){ if(want&&Math.random()<.6){ S.life[i]=.25+Math.random()*.5; A[i*3]=A[i*3+1]=A[i*3+2]=0; S.v[i*3]=(Math.random()-.5)*2.4; S.v[i*3+1]=Math.random()*2.2; S.v[i*3+2]=Math.random()*1.8; } else { A[i*3+1]=-99; continue; } }
      S.v[i*3+1]-=9.8*dt; A[i*3]+=S.v[i*3]*dt; A[i*3+1]+=S.v[i*3+1]*dt; A[i*3+2]+=S.v[i*3+2]*dt; if(A[i*3+1]<-1.15){ A[i*3+1]=-1.15; S.v[i*3+1]*=-.3; } }
    pa.needsUpdate=true; S.fl.visible=want&&Math.random()<.7; S.fl.scale.setScalar(.6+Math.random()*.8);
    if(P.engH) P.engH.rotation.y=Math.sin(tm*.4)*.06; }

  // ---- escenas ----
  const box2=()=>document.getElementById('tallerBox');
  function caption(kind,k,extra){ let b=box2(); if(!b){ b=document.createElement('div'); b.id='tallerBox'; b.setAttribute('data-notr',''); document.body.appendChild(b); }
    const V=VEH[k]||{label:k}, top=kind==='res'?T2('📐 Investigación terminada','📐 Research complete'):kind==='pick'?T2('📐 Plano nuevo en la mesa','📐 New blueprint on the table'):T2('🔧 Mejora instalada','🔧 Upgrade installed');
    const sub=kind==='res'?(owned(k)?T2('Ya lo tenés en el garaje','Already in your garage'):T2('Ya lo podés comprar en el árbol de Vehículos','You can buy it now in Vehicles')):kind==='pick'?T2('Los PI de las próximas batallas van a este tanque','Research points from your next battles go to this tank'):(extra||'');
    b.innerHTML=`<div class="tbT">${top}</div><div class="tbN">${esc(V.label)}</div><div class="tbS">${sub}</div><div class="tbK">${T2('Tocá para seguir','Tap to continue')}</div>`; b.style.opacity=1; }
  function start(ev){ const P=TL.p; if(!P||!hg) return false; const kind=ev.kind, k=ev.k;
    if(kind!=='up') bpDraw(k);
    TL.cut={kind,k,t:0,dur:kind==='pick'?3.6:5.2,from:[hg.cam.position.clone(),new THREE.Vector3(0,1.2,0)]};
    document.body.classList.add('taller'); caption(kind,k,ev.txt); try{ if(typeof sfx==='function'&&kind!=='up') sfx('ui',null,.4); }catch(e){} return true; }
  function finish(){ if(!TL.cut) return; TL.cut=null; document.body.classList.remove('taller'); const b=box2(); if(b){ b.style.opacity=0; } if(hg){ hg.idle=0; }
    if(TL.q.length) setTimeout(next,450); else if(hg&&hg.key) try{ const n=VEH[hg.key]&&VEH[hg.key].nation, r=n&&nextResearch(n); if(r) bpDraw(r); }catch(e){} }
  function next(){ if(TL.cut||!TL.q.length||!hangarOn()||!hg||!hg.obj||document.body.classList.contains('llega')) return; start(TL.q.shift()); }
  const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
  function step(dt){ const C=TL.cut, P=TL.p; C.t+=dt; const u=Math.min(1,C.t/1.6), e=ease(u);
    const [p0,l0]=C.kind==='up'?P.camShop0:P.camDesk0, [p1,l1]=C.kind==='up'?P.camShop:P.camDesk;
    const a=u<1?C.from[0].clone().lerp(p0,e):p0.clone().lerp(p1,ease(Math.min(1,(C.t-1.6)/(C.dur-1.6)))), l=u<1?C.from[1].clone().lerp(l0,e):l0.clone().lerp(l1,ease(Math.min(1,(C.t-1.6)/(C.dur-1.6))));
    const w=innerWidth,h=innerHeight; hg.cam.aspect=w/h; hg.cam.position.copy(a); hg.cam.lookAt(l); hg.cam.clearViewOffset(); hg.cam.updateProjectionMatrix();
    if(C.t>C.dur+.6) finish(); }
  { const _r=hgRender; hgRender=function(dt){ const tm=performance.now()/1000; try{ idle(Math.min(dt||.016,.1),tm,TL.cut&&TL.cut.kind==='up'); }catch(e){}
      if(TL.cut&&hg&&hg.obj&&hangarOn()&&!document.body.classList.contains('llega')){ step(Math.min(dt||.016,.1));
        if(TL.cut){ if(baseScene.flag) baseScene.flag.rotation.y=Math.sin(tm*1.1)*.25; const sm=renderer.shadowMap.enabled; renderer.shadowMap.enabled=true; renderer.render(hg.sc,hg.cam); renderer.shadowMap.enabled=sm; return true; } }
      else if(TL.cut&&!hangarOn()) finish();
      return _r.apply(this,arguments); }; }
  const skip=e=>{ if(TL.cut&&hangarOn()&&TL.cut.t>.5){ finish(); if(e&&e.type==='keydown') e.stopPropagation(); } };
  document.addEventListener('pointerdown',skip,true); document.addEventListener('keydown',e=>{ if(e.key==='Escape') skip(e); },true);
  { const st=document.createElement('style'); st.textContent=`body.taller .hg>*:not(canvas){opacity:0!important;pointer-events:none!important;transition:opacity .4s} body.taller .hgHint{display:none}
    #tallerBox{position:fixed;left:50%;bottom:9%;transform:translateX(-50%);z-index:60;text-align:center;color:#fff;pointer-events:none;text-shadow:0 2px 6px #000,0 0 2px #000;transition:opacity .5s;opacity:0;background:rgba(10,9,7,.55);padding:10px 26px 8px;border:1px solid rgba(239,231,210,.25);border-radius:4px;min-width:340px}
    #tallerBox .tbT{font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:#ffd47a} #tallerBox .tbN{font-size:30px;font-weight:800;margin-top:2px} #tallerBox .tbS{font-size:15px;margin-top:3px;color:#e8e0c8} #tallerBox .tbK{font-size:11px;opacity:.65;margin-top:5px}`; document.head.appendChild(st); }

  // ---- cuándo: al volver al garaje después de investigar o mejorar (lo encola el resumen), y al elegir qué investigar ----
  { const _hs=hgShow; hgShow=function(key,nat){ _hs.apply(this,arguments);
      try{ if(TL.p&&!TL.cut){ const n=nat||(VEH[key]&&VEH[key].nation), r=n&&nextResearch(n); if(r&&BP.k!==r) bpDraw(r); }
        if(TL.q.length) setTimeout(next,700); }catch(e){ console.warn('taller',e); } }; }
  { const _sr=setResearch; setResearch=function(k){ const was=VEH[k]&&PROG&&PROG.target[VEH[k].nation]; const r=_sr.apply(this,arguments);
      try{ if(PROG&&VEH[k]&&PROG.target[VEH[k].nation]===k&&was!==k&&!TL.q.some(e=>e.kind==='pick')) TL.q.push({kind:'pick',k}); }catch(e){} return r; }; }
  window.tallerVer=(kind,k)=>{ TL.q.push({kind:kind||'res',k:k||(hg&&hg.key),txt:kind==='up'?T2('Nv 2: Lanzahumos','Lv 2: Smoke launchers'):''}); next(); };
})();
