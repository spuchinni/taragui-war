/* ---------- T-70 rehecho (25/11/2026, pedido de Sebastián con "T-70" de Advisor en Sketchfab de referencia: "horrible el que tenemos"; por código) ----------
   Envuelve buildW2 cuando M.w2.ru==='t70'. Medidas: 4,29 × 2,32 × 2,04 m. Usa loftBT/fixWindingBT/decalBT de bt7.js.
   Tren: 5 ruedas de 550 mm con goma, 3 rodillos de retorno, motriz adelante con dientes, tensora atrás del tamaño de una rueda.
   Casco bajo: glacis largo con la escotilla del conductor a la izquierda y faro, chapa baja del frente, cubierta con persianas,
   popa inclinada con silenciador atravesado y escape; guardabarros con cajones. Torre soldada facetada corrida a la izquierda,
   costados muy inclinados, escotilla redonda con periscopio, mantelete fundido con el 45 mm 20-K y la camisa del recuperador abajo. */
(()=>{
  const _b=buildW2;
  buildW2=function(t,M,mat,root,lkL,lkR){ if(!(M&&M.w2&&M.w2.ru==='t70')) return _b.apply(this,arguments); return t70(t,M,mat,root,lkL,lkR); };
  const lens=new THREE.MeshStandardMaterial({color:0xcfd8d0,roughness:.15,metalness:.6,emissive:0x111410});
  function t70(t,M,mat,root,lkL,lkR){ shTurMG.t=t;
    const loft=window.loftBT, fixW=window.fixWindingBT;
    const I=M.w2, L=M.L, W=M.W, zf=L/2, zr=-L/2, deck=I.deck, tw=I.trW, tx=W/2-tw/2, fy=.92, ghw=.88;
    // ---- tren de rodaje ----
    const wy=.32, wR=.275, WZ=[1.25,.6,-.05,-.7,-1.35], SZ=1.8, SY=.55, SR=.27, IZ=-1.83, IY=.4, IR=.26, RY=.72, RZ=[.95,-.05,-1.0];
    const prof=[[SZ,SY+SR+.05],[RZ[0],RY+.14],[RZ[2],RY+.14],[IZ,IY+IR+.05],[IZ-IR-.05,IY],[IZ+.05,IY-IR-.05],[WZ[4],0],[WZ[0],0],[SZ-.05,SY-SR-.04],[SZ+SR+.05,SY]];
    for(const s of [-1,1]){ const x=s*tx;
      trackLoop(root,prof,tw,x,s>0?lkR:lkL,sideTrkMat,.05);
      for(let k=0;k<22;k++){ const z=WZ[4]-.2+k*(WZ[0]-WZ[4]+.4)/21; box(root,.06,.045,.06,x,.07,z,darkMat); }       // dientes guía
      for(const z of WZ){ const w=dWheel(root,x,wy,z,wR,mat,{rim:.76}); cyl(w,wR*.5,wR*.55,.33,0,0,0,14,mat); cyl(w,wR*.2,wR*.2,.37,0,0,0,8,darkMat);
        for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; cyl(w,.016,.016,.35,Math.cos(a)*wR*.38,0,Math.sin(a)*wR*.38,5,darkMat); } }
      for(const z of RZ){ const r=dWheel(root,x,RY,z,.09,mat,{rim:.7}); r.scale.y=.8; }
      sprocketT(root,x,SY,SZ,SR,13,mat);
      { const w=dWheel(root,x,IY,IZ,IR,mat,{rim:.76}); cyl(w,IR*.5,IR*.5,.33,0,0,0,12,mat); }
      for(const z of WZ){ const a=box(root,.06,.07,.32,s*(ghw+.02),wy+.08,z+.12,darkMat); a.rotation.x=-.35; }               // brazos de la suspensión
      cyl(root,.05,.05,.12,s*(ghw+.02),SY,SZ,8,darkMat).rotation.z=Math.PI/2;
    }
    // ---- casco (anillos z: yb, hb, ym, ht, yt) ----
    const sec=[
      [zf,     .70, .78, .74, .76, .80],
      [zf-.26, .30, ghw, .90, .84, .96],
      [1.22,   .28, ghw, fy,  .80, deck],
      [zr+.62, .28, ghw, fy,  .80, deck],
      [zr+.2,  .30, ghw, fy,  .80, deck-.22],
      [zr,     .42, ghw*.97,.84,.78, deck-.36]];
    fixW(loft(root,sec.map(([z,yb,hb,ym,ht,yt])=>[[-hb,yb,z],[hb,yb,z],[hb,ym,z],[ht,yt,z],[-ht,yt,z],[-hb,ym,z]]),mat,true));
    // ---- guardabarros ----
    const fw=tw+.1, fx=W/2-fw/2+.02;
    for(const s of [-1,1]){ const x=s*fx;
      box(root,fw,.03,(zf-.3)-(zr+.25),x,fy,((zf-.3)+(zr+.25))/2,mat);
      { const a=Math.atan2(fy-.66,.42), l=Math.hypot(.42,fy-.66), b=box(root,fw,.03,l,x,(fy+.66)/2,zf-.09,mat); b.rotation.x=a; }
      { const b=box(root,fw,.03,.3,x,fy-.05,zr+.12,mat); b.rotation.x=-.35; }
      box(root,.02,.07,(zf-.3)-(zr+.25),s*(W/2+.02),fy-.025,((zf-.3)+(zr+.25))/2,mat);
      for(const z of [1.1,0,-1.1]) box(root,.04,fy-wy-.3,.05,s*(ghw+.05),(fy+wy+.3)/2-.03,z,darkMat); }
    rbox(root,.24,.2,.75,fx,fy+.11,.35,mat,.03); rbox(root,.24,.2,.75,fx,fy+.11,-.7,mat,.03);           // cajones
    rbox(root,.24,.16,.9,-fx,fy+.09,-.4,mat,.03); { const c=cyl(root,.07,.07,.9,-fx,fy+.08,.75,8,_wd); c.rotation.x=Math.PI/2; }   // cajón y tronco/palanca
    // ---- glacis: escotilla del conductor a la izquierda, faro, ganchos ----
    { const zg0=zf-.26, zg1=1.22, a=Math.atan2(deck-.96,zg0-zg1), mz=(zg0+zg1)/2, my=(deck+.96)/2;
      const h=rbox(root,.56,.06,.48,.34,my+.03,mz,mat,.03); h.rotation.x=a; box(h,.22,.05,.05,0,.04,.14,darkMat); box(h,.05,.06,.06,-.2,.03,-.16,darkMat); box(h,.05,.06,.06,.2,.03,-.16,darkMat);
      for(const sx of [-1,1]) rivetsRow(root,sx*.6,my+.01,mz-.25,mz+.25,4);
      const g=new THREE.Group(); g.position.set(fx-.04,fy+.14,zf-.42); root.add(g); box(g,.04,.12,.04,0,-.07,0,darkMat);
      const f=cyl(g,.08,.07,.12,0,0,.02,10,mat); f.rotation.x=Math.PI/2; const l=cyl(g,.065,.065,.01,0,0,.085,10,lens); l.rotation.x=Math.PI/2; }
    for(const sx of [-1,1]){ const k=new THREE.Mesh(_tgShackle,darkMat); k.scale.setScalar(.6); k.position.set(sx*.42,.6,zf-.08); k.rotation.y=Math.PI/2; root.add(k); }
    box(root,1.3,.05,.06,0,.74,zf+.005,darkMat);
    for(const sx of [-1,1]) rivetsRow(root,sx*(.82+.004),deck-.18,zr+.6,1.1,10);
    // ---- cubierta del motor: persianas, tapas, silenciador atravesado en la popa ----
    { box(root,1.0,.04,1.0,-.15,deck+.02,-1.15,mat); for(let i=0;i<7;i++) box(root,.9,.03,.04,-.15,deck+.05,-.75-i*.13,darkMat);
      rbox(root,.5,.05,.55,.42,deck+.025,-1.2,mat,.02); box(root,.12,.04,.06,.42,deck+.07,-1.0,darkMat);
      const a=Math.atan2(.22,.42); for(let i=0;i<4;i++){ const u=(i+.5)/4, b=box(root,1.2,.03,.04,0,deck-.22*u+.02,zr+.62-.42*u,darkMat); b.rotation.x=a; } }
    { const m=cyl(root,.13,.13,1.2,0,deck-.42,zr-.12,12,mat); m.rotation.z=Math.PI/2; for(const x of [-.55,.55]) cyl(root,.14,.14,.03,x,deck-.42,zr-.12,12,darkMat).rotation.z=Math.PI/2;
      for(const x of [-.4,.4]) box(root,.05,.18,.12,x,deck-.42,zr-.03,darkMat);
      const e=cyl(root,.04,.04,.25,.62,deck-.42,zr-.12,8,darkMat); e.rotation.z=Math.PI/2; }
    for(const sx of [-1,1]){ const k=new THREE.Mesh(_tgShackle,darkMat); k.scale.setScalar(.6); k.position.set(sx*.45,.55,zr-.02); k.rotation.y=Math.PI/2; root.add(k); }
    // ---- torre soldada facetada, corrida a la izquierda ----
    const tur=new THREE.Group(); tur.position.set(I.tx||0,deck,M.tz); root.add(tur);
    const th=M.th, plan=[[-.42,.66],[.42,.66],[.68,.2],[.64,-.52],[.42,-.74],[-.42,-.74],[-.64,-.52],[-.68,.2]];
    const ring=(y,k,kz)=>plan.map(([x,z])=>[x*k,y,z*(z>0?kz:1)*k+(z>0?0:(1-k)*.25)]);
    const tm=loft(tur,[ring(0,1,1),ring(.06,1,1),ring(th,.76,.78)],mat,true); fixW(tm);
    cyl(tur,.62,.64,.06,0,-.01,-.04,20,darkMat);
    const gy=th*.44, G=gunMount(t,tur,0,gy,.6,M.gl,M.gr,mat,{shield:false});
    rbox(G.gp,.5,.34,.18,0,0,.04,mat,.06); rbox(G.gp,.3,.24,.14,0,.01,.18,mat,.05);
    { const s=cyl(G.gp,.06,.065,.5,0,-.09,.42,10,mat); s.rotation.x=Math.PI/2; cyl(G.gp,.066,.066,.04,0,-.09,.66,10,darkMat).rotation.x=Math.PI/2; }   // camisa del recuperador abajo del tubo
    { const c=cyl(G.gp,.022,.022,.3,.17,-.02,.3,6,darkMat); c.rotation.x=Math.PI/2; }
    box(G.gp,.06,.07,.06,-.16,.07,.15,darkMat);
    { const h=cyl(tur,.26,.26,.06,-.05,th+.02,-.25,16,mat); box(tur,.36,.03,.04,-.05,th+.055,-.48,darkMat); const p=rbox(tur,.1,.14,.13,.12,th+.12,-.12,mat,.02); box(p,.08,.04,.02,0,.02,.07,lens); cyl(tur,.07,.07,.05,.12,th+.03,-.12,10,mat); }
    { const p=rbox(tur,.1,.12,.12,-.32,th+.08,.22,mat,.02); box(p,.08,.04,.02,0,.02,.065,lens); }
    for(const sx of [-1,1]){ const pp=cyl(tur,.045,.045,.05,sx*.6,th*.42,-.2,8,mat); pp.rotation.z=Math.PI/2; pp.rotation.y=sx*.08; rivetsRow(tur,sx*.5,th*.85,-.5,.1,4); }
    for(const sx of [-1,1]) cyl(tur,.028,.028,.05,sx*.36,th+.01,-.45,6,darkMat);
    t.turret=tur; t.gunPivot=G.gp; t.barrel=G.barrel; t.muzzle=G.muzzle; t.coax=G.coax; t.barrelMesh=G.bm;
    try{ const P0=root.position.clone(), Q0=root.quaternion.clone(), par=root.parent; if(par) par.remove(root); root.position.set(0,0,0); root.quaternion.identity(); root.updateMatrixWorld(true);
      const sp=new THREE.Vector3(); for(const sx of [-1,1]) decalBT(tur,[tm],starTex(),sp.set((I.tx||0)+sx*.66,deck+th*.48,M.tz-.36).clone(),new THREE.Vector3(sx,0,0),new THREE.Vector3(0,1,0),.3,.3,8);
      root.position.copy(P0); root.quaternion.copy(Q0); if(par) par.add(root); root.updateMatrixWorld(true); }catch(e){ console.warn('t70 estrella',e); }
    collider(tur,1.3,th,1.4,0,th/2,-.04,t,'turret');
    collider(root,W-.1,deck-.25,L,0,(deck+.25)/2,0,t,'hull');
    t.hTop=deck; t.topH=deck+th+.15; t.aimH=deck*.7; t.glL=.9;
    const tp=(x,y,z)=>(sd,T)=>{ const c=Math.cos(T.turretYaw), sn=Math.sin(T.turretYaw); return V3((I.tx||0)+x*c+z*sn,deck+y,M.tz-x*sn+z*c); };
    t.seatPos={driver:V3(.34,deck-.4,1.45),gunner:tp(-.15,th*.4,0),commander:tp(-.15,th*.5,-.2),loader:tp(.2,th*.35,-.05),
      mg1:V3(-.3,deck-.4,1.4),mg2:V3(-.3,deck-.4,1.3),engine:V3(-.2,deck*.55,zr+1.0),trans:V3(0,deck*.4,zf-.5),
      ammo:V3(.4,deck*.5,M.tz),breech:tp(0,gy,.25)};
  }
  let _st=null;
  function starTex(){ if(_st) return _st; const c=document.createElement('canvas'); c.width=c.height=256; const x=c.getContext('2d'); x.beginPath();
    for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, q=i%2?122*.39:122; x.lineTo(128+Math.cos(a)*q,132+Math.sin(a)*q); } x.closePath(); x.fillStyle='#c41e14'; x.fill();
    x.globalCompositeOperation='destination-out'; for(let i=0;i<200;i++){ x.globalAlpha=Math.random()*.6; x.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*3,1+Math.random()*2); }
    _st=new THREE.CanvasTexture(c); _st.anisotropy=4; return _st; }
  const _wd=new THREE.MeshLambertMaterial({color:0x6b5236});
})();
