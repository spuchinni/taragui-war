/* ---------- BT-7 rehecho (24/11/2026, pedido de Sebastián con "Soviet BT-7" de oxxxxxygen en Sketchfab de referencia: "es muy diferente, hacelo idéntico"; por código) ----------
   Envuelve buildW2 cuando M.w2.ru==='bt7'. Medidas: 5,66 × 2,29 × 2,42 m.
   Christie: 4 ruedas de 830 mm con goma, tensora de rayos adelante, motriz atrás; la oruga apoya arriba en las ruedas (sin rodillos).
   Casco: trompa que se angosta en punta entre las tensoras, glacis corto, cubierta larga y plana, popa inclinada; guardabarros anchos
   que bajan adelante y atrás, tubo y cajón sobre los guardabarros, tapa del motor con tres jorobas y persianas, dos escapes atrás.
   Torre del modelo 1937: cónica y ovalada con el cesto atrás, mantelete del 45 mm 20-K con la DT, dos periscopios y escotilla.
   Estrella proyectada sobre la chapa curva de la torre (decalBT); el número táctico de realismo.js también se proyecta. */
(()=>{
  const _b=buildW2;
  buildW2=function(t,M,mat,root,lkL,lkR){ if(!(M&&M.w2&&M.w2.ru==='bt7')) return _b.apply(this,arguments); return bt7(t,M,mat,root,lkL,lkR); };

  // Loft de anillos (cada anillo = lista de [x,y,z] con la misma cantidad de puntos); tapas en las puntas; flat = caras planas
  function loft(parent,rings,mat,flat,capA=true,capB=true){
    const pos=[], uv=[], idx=[], n=rings[0].length, V=(p)=>{ pos.push(p[0],p[1],p[2]); uv.push((p[2]+p[0]*.6)*.3,p[1]*.3); return pos.length/3-1; };
    if(flat){ for(let r=0;r<rings.length-1;r++){ const A=rings[r], B=rings[r+1];
        for(let i=0;i<n;i++){ const j=(i+1)%n; const a=V(A[i]),b=V(B[i]),c=V(B[j]),d=V(A[j]); idx.push(a,b,c,a,c,d); } } }
    else { const base=rings.map(R=>R.map(V)); for(let r=0;r<rings.length-1;r++) for(let i=0;i<n;i++){ const j=(i+1)%n; idx.push(base[r][i],base[r+1][i],base[r+1][j],base[r][i],base[r+1][j],base[r][j]); } }
    const cap=(R,rev)=>{ const c=R.reduce((s,p)=>[s[0]+p[0]/n,s[1]+p[1]/n,s[2]+p[2]/n],[0,0,0]); const ci=V(c), ri=R.map(V); for(let i=0;i<n;i++){ const j=(i+1)%n; if(rev) idx.push(ci,ri[j],ri[i]); else idx.push(ci,ri[i],ri[j]); } };
    if(capA) cap(rings[0],false); if(capB) cap(rings[rings.length-1],true);
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx);
    g.computeVertexNormals();
    const m=new THREE.Mesh(g,mat); m.castShadow=m.receiveShadow=true; parent.add(m); return m; }
  // Orientación de cada triángulo: las piezas son casi convexas, así que la normal tiene que apuntar hacia afuera del centro
  function fixWinding(m){ const g=m.geometry, p=g.attributes.position, idx=g.index; g.computeBoundingBox(); const c=new THREE.Vector3(); g.boundingBox.getCenter(c);
    const a=new THREE.Vector3(), b=new THREE.Vector3(), d=new THREE.Vector3(), n=new THREE.Vector3(), e=new THREE.Vector3();
    for(let k=0;k<idx.count;k+=3){ a.fromBufferAttribute(p,idx.getX(k)); b.fromBufferAttribute(p,idx.getX(k+1)); d.fromBufferAttribute(p,idx.getX(k+2));
      n.subVectors(b,a).cross(e.subVectors(d,a)); if(n.lengthSq()<1e-12) continue; e.copy(a).add(b).add(d).multiplyScalar(1/3).sub(c);
      if(n.dot(e)<0){ const x=idx.getX(k+1); idx.setX(k+1,idx.getX(k+2)); idx.setX(k+2,x); } }
    idx.needsUpdate=true; g.computeVertexNormals(); return m; }

  // ---- calca proyectada (estrella roja con borde) ----
  let starTex=null;
  function starT(){ if(starTex) return starTex; const c=document.createElement('canvas'); c.width=c.height=256; const x=c.getContext('2d');
    const st=(r,col)=>{ x.beginPath(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, q=i%2?r*.39:r; x.lineTo(128+Math.cos(a)*q,132+Math.sin(a)*q); } x.closePath(); x.fillStyle=col; x.fill(); };
    st(122,'#c41e14'); x.globalCompositeOperation='destination-out'; for(let i=0;i<220;i++){ x.globalAlpha=Math.random()*.6; x.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*3,1+Math.random()*2); }
    starTex=new THREE.CanvasTexture(c); starTex.anisotropy=4; return starTex; }
  const rc=new THREE.Raycaster(), _p=new THREE.Vector3(), _o=new THREE.Vector3(), _n=new THREE.Vector3();
  function decalBT(parent,targets,map,c,out,up,w,h,seg=10){
    const right=new THREE.Vector3().crossVectors(up,out).normalize(), g=new THREE.PlaneGeometry(w,h,seg,seg), P=g.attributes.position; let miss=0;
    for(let i=0;i<P.count;i++){ const u=P.getX(i), v=P.getY(i); _p.copy(c).addScaledVector(right,u).addScaledVector(up,v);
      _o.copy(_p).addScaledVector(out,.7); rc.set(_o,_n.copy(out).negate()); rc.far=1.6; const hit=rc.intersectObjects(targets,false)[0];
      if(hit){ const nn=hit.face.normal.clone().transformDirection(hit.object.matrixWorld); _p.copy(hit.point).addScaledVector(nn.dot(out)<0?nn.negate():nn,.008); } else miss++;
      parent.worldToLocal(_p); P.setXYZ(i,_p.x,_p.y,_p.z); }
    if(miss>P.count*.3){ g.dispose(); return null; }
    g.computeVertexNormals(); const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map,transparent:true,alphaTest:.45,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
    m.renderOrder=2; m.userData.stand=1; m.userData.decal=1; parent.add(m); return m; }
  window.decalBT=decalBT;

  function bt7(t,M,mat,root,lkL,lkR){ shTurMG.t=t;
    const I=M.w2, L=M.L, W=M.W, zf=L/2, zr=-L/2, deck=I.deck, tw=I.trW, tx=W/2-tw/2, fy=1.0;   // fy = guardabarros
    const ghw=.86;                                                                                 // medio ancho del casco entre orugas
    // ---- tren de rodaje Christie ----
    const wy=.47, wR=.415, WZ=[1.45,.5,-.45,-1.4], IZ=2.33, IY=.52, IR=.34, SZ=-2.36, SY=.56, SR=.33;
    const prof=[[IZ,IY+IR+.06],[WZ[0],wy+wR+.06],[WZ[3],wy+wR+.06],[SZ,SY+SR+.06],[SZ-SR-.06,SY],[SZ+.05,SY-SR-.05],[WZ[3],0],[WZ[0],0],[IZ-.05,IY-IR-.04],[IZ+IR+.06,IY]];
    for(const s of [-1,1]){ const x=s*tx;
      trackLoop(root,prof,tw,x,s>0?lkR:lkL,sideTrkMat,.06);
      for(let k=0;k<26;k++){ const z=WZ[3]-.25+k*(WZ[0]-WZ[3]+.5)/25; box(root,.07,.05,.07,x,.085,z,darkMat); }          // dientes guía de la oruga (abajo, entre las ruedas)
      for(const z of WZ){ const w=dWheel(root,x,wy,z,wR,mat,{rim:.84}); cyl(w,wR*.62,wR*.62,.34,0,0,0,16,mat); cyl(w,wR*.3,wR*.34,.37,0,0,0,10,mat); cyl(w,wR*.12,wR*.12,.4,0,0,0,8,darkMat);   // goma, disco hundido, cubo
        for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; cyl(w,.018,.018,.355,Math.cos(a)*wR*.48,0,Math.sin(a)*wR*.48,5,darkMat); } }   // bulones
      { const w=wheel(root,x,IY,IZ,IR); w.children[0].visible=false; cyl(w,IR,IR,.24,0,0,0,16,mat); cyl(w,IR*.82,IR*.82,.3,0,0,0,16,darkMat);   // tensora de rayos
        for(let i=0;i<6;i++){ const a=i/6*Math.PI*2, sp=box(w,.07,.32,IR*1.55,0,0,0,mat); sp.rotation.y=a; } cyl(w,IR*.25,IR*.25,.36,0,0,0,8,mat); cyl(w,IR*.1,IR*.1,.4,0,0,0,6,darkMat); }
      { const w=wheel(root,x,SY,SZ,SR); w.children[0].visible=false; cyl(w,SR,SR,.26,0,0,0,18,mat); cyl(w,SR*.9,SR*.9,.3,0,0,0,18,mat);   // motriz: disco con agujeros y rodillos
        for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; cyl(w,SR*.17,SR*.17,.32,Math.cos(a)*SR*.56,0,Math.sin(a)*SR*.56,8,darkMat); cyl(w,.04,.04,.36,Math.cos(a+.52)*SR*.88,0,Math.sin(a+.52)*SR*.88,6,darkMat); }
        cyl(w,SR*.22,SR*.22,.36,0,0,0,10,mat); cyl(w,SR*.1,SR*.1,.4,0,0,0,6,darkMat); }
      for(const z of WZ) cyl(root,.07,.07,.12,s*(ghw+.03),wy,z,8,darkMat).rotation.z=Math.PI/2;                               // ejes de las manivelas
    }
    // ---- casco: anillos (z) con [ancho abajo, alto abajo, alto del guardabarros, ancho arriba, alto arriba] ----
    const sec=[ // z, yb, hb, ym, ht, yt
      [zf,     .52, .30, .60, .28, .64],
      [zf-.30, .38, .58, .86, .55, .98],
      [zf-.62, .33, ghw,1.00, .84,1.16],
      [zf-1.12,.32, ghw,1.00, .80,deck],
      [zr+.86, .32, ghw,1.00, .80,deck],
      [zr+.36, .34, ghw,1.00, .80,deck-.32],
      [zr+.02, .56, ghw*.95,.92,.78,deck-.56],
      [zr,     .6,  ghw*.93,.9,.76,deck-.6]];
    const rings=sec.map(([z,yb,hb,ym,ht,yt])=>[[-hb,yb,z],[hb,yb,z],[hb,ym,z],[ht,yt,z],[-ht,yt,z],[-hb,ym,z]]);
    fixWinding(loft(root,rings,mat,true));
    // ---- guardabarros (planos, bajan adelante y atrás) ----
    const fw=tw+.08, fx=W/2-fw/2+.02;
    for(const s of [-1,1]){ const x=s*fx;
      box(root,fw,.03,(zf-.62)-(zr+.42),x,fy,((zf-.62)+(zr+.42))/2,mat);
      { const a=Math.atan2(fy-.62,.62), l=Math.hypot(.62,fy-.62), b=box(root,fw,.03,l,x,(fy+.62)/2,zf-.31,mat); b.rotation.x=a; }   // adelante, hasta la punta
      { const a=Math.atan2(fy-.8,.42), l=Math.hypot(.42,fy-.8), b=box(root,fw,.03,l,x,(fy+.8)/2,zr+.21,mat); b.rotation.x=-a; }       // atrás
      box(root,.02,.08,(zf-.62)-(zr+.42),s*(W/2+.02),fy-.03,((zf-.62)+(zr+.42))/2,mat);                                           // borde
      for(const z of [1.0,0,-1.0,-1.9]) box(root,.04,fy-wy-.2,.05,s*(ghw+.06),(fy+wy+.2)/2-.04,z+.02,darkMat); }                 // soportes
    // tubo largo sobre el guardabarros izquierdo, cajón y caja de herramientas sobre el derecho
    { const c=cyl(root,.085,.085,2.1,fx,fy+.1,-.25,10,mat); c.rotation.x=Math.PI/2; for(const z of [-1.1,.6]){ box(root,.2,.03,.05,fx,fy+.19,z,darkMat); } cyl(root,.09,.09,.04,fx,fy+.1,.82,10,darkMat).rotation.x=Math.PI/2; }
    rbox(root,.24,.2,.7,-fx,fy+.11,.65,mat,.03); rbox(root,.24,.16,.9,-fx,fy+.09,-1.15,mat,.03);
    for(const z of [.65]) box(root,.1,.03,.04,-fx-.12,fy+.15,z,darkMat);
    // ---- frente: escotilla del conductor con visor, faros, ganchos ----
    { const z0=zf-.62, y0=1.16, z1=zf-1.12, a=Math.atan2(deck-y0,z0-z1);
      const h=rbox(root,.62,.07,.46,0,(y0+deck)/2+.03,(z0+z1)/2,mat,.03); h.rotation.x=a; box(h,.26,.05,.1,0,.05,.06,darkMat); box(h,.07,.06,.07,-.24,.02,-.18,darkMat); box(h,.07,.06,.07,.24,.02,-.18,darkMat);
      for(const sx of [-1,1]){ const g=new THREE.Group(); g.position.set(sx*.62,(y0+deck)/2+.12,(z0+z1)/2+.08); root.add(g);   // faros sobre soporte
        box(g,.04,.12,.04,0,-.07,0,darkMat); const f=cyl(g,.085,.075,.12,0,0,.02,10,mat); f.rotation.x=Math.PI/2; const l=cyl(g,.07,.07,.01,0,0,.085,10,_lens); l.rotation.x=Math.PI/2; } }
    { const zn=zf-.15; box(root,.5,.06,.06,0,.66,zn+.02,darkMat); for(const sx of [-1,1]){ const k=new THREE.Mesh(_tgShackle,darkMat); k.scale.setScalar(.65); k.position.set(sx*.3,.54,zf-.12); k.rotation.y=Math.PI/2; root.add(k); } }
    for(const sx of [-1,1]) rivetsRow(root,sx*(.84+.005),deck-.2,zr+.9,zf-1.2,12);
    for(const sx of [-1,1]) rivetsRow(root,sx*(ghw+.005),.86,zr+.5,zf-.7,14);
    // ---- cubierta del motor: tres jorobas, persianas y escotilla ----
    { const z0=zr+.95, zl=zr+.35;
      box(root,1.3,.06,1.5,0,deck+.03,-1.3,mat);
      for(let i=0;i<3;i++){ const z=-.75-i*.42, c=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,1.12,12,1,false,0,Math.PI),mat); c.rotation.z=Math.PI/2; c.rotation.y=0; c.position.set(0,deck+.06,z); c.scale.set(.5,1,1); c.castShadow=true; root.add(c);
        box(root,1.12,.02,.02,0,deck+.06+.095,z,darkMat); }
      { const a=Math.atan2(.32,zr+.86-(zr+.36)); for(let i=0;i<6;i++){ const u=(i+.5)/6, b=box(root,1.2,.03,.05,0,deck-.32*u+.02,zr+.86-.5*u,darkMat); b.rotation.x=a; } }   // persianas de la popa inclinada
      rbox(root,.48,.05,.4,.42,deck+.03,-.3,mat,.02); rbox(root,.48,.05,.4,-.42,deck+.03,-.3,mat,.02); }
    // escapes: dos tubos que salen atrás
    for(const sx of [-1,1]){ const e=cyl(root,.055,.055,.6,sx*.42,deck-.38,zr+.03,8,darkMat); e.rotation.x=Math.PI/2; cyl(root,.07,.07,.08,sx*.42,deck-.38,zr+.3,8,darkMat).rotation.x=Math.PI/2;  }
    for(const sx of [-1,1]){ const k=new THREE.Mesh(_tgShackle,darkMat); k.scale.setScalar(.65); k.position.set(sx*.4,.62,zr-.02); k.rotation.y=Math.PI/2; root.add(k); }
    // ---- torre cónica y ovalada con cesto ----
    const tur=new THREE.Group(); tur.position.set(0,deck,M.tz); root.add(tur);
    const N=32, ring=(y,hw,hf,hr,nb)=>{ const R=[]; for(let i=0;i<N;i++){ const a=i/N*Math.PI*2, cz=Math.cos(a), sx=Math.sin(a);
        R.push([sx*hw*(1-nb*Math.max(0,-cz)**2),y,cz>0?cz*hf:cz*hr]); } return R; };
    const th=M.th;
    const tm=loft(tur,[ring(0,.84,.82,1.04,.16),ring(.06,.84,.82,1.04,.16),ring(th,.67,.6,.96,.22)],mat,false); fixWinding(tm); tm.userData.turBody=1;
    cyl(tur,.78,.8,.06,0,-.01,0,24,darkMat);                                                                       // collar del aro
    // mantelete y cañón 45 mm 20-K
    const gy=th*.46, G=gunMount(t,tur,0,gy,.64,M.gl,M.gr,mat,{shield:false});
    rbox(G.gp,.56,.36,.2,0,.0,.06,mat,.05); rbox(G.gp,.36,.26,.12,0,0,.2,mat,.04);
    { const s=cyl(G.gp,.07,.075,.42,0,0,.42,12,mat); s.rotation.x=Math.PI/2; }
    { const c=cyl(G.gp,.022,.022,.3,.17,-.03,.32,6,darkMat); c.rotation.x=Math.PI/2; cyl(G.gp,.04,.04,.06,.17,-.03,.2,8,darkMat).rotation.x=Math.PI/2; }   // DT coaxial
    box(G.gp,.06,.07,.06,-.17,.05,.2,darkMat);                                                                       // mira
    // techo: escotilla ovalada, dos periscopios, ventilador, bisagras
    { const h=cyl(tur,.3,.3,.05,0,th+.02,-.38,16,mat); h.scale.z=1.35; box(tur,.5,.03,.04,0,th+.055,-.6,darkMat); box(tur,.05,.04,.08,.18,th+.06,-.12,darkMat); }
    for(const [x,z] of [[-.34,.22],[-.12,.34]]){ cyl(tur,.07,.08,.06,x,th+.03,z,10,mat); const p=rbox(tur,.11,.13,.14,x,th+.12,z,mat,.02); box(p,.09,.04,.02,0,.02,.075,_lens); }
    { cyl(tur,.11,.12,.07,.32,th+.035,.18,12,mat); cyl(tur,.08,.08,.03,.32,th+.085,.18,12,darkMat); }
    for(const sx of [-1,1]){ const pp=cyl(tur,.05,.05,.05,sx*.79,th*.4,-.15,8,mat); pp.rotation.z=Math.PI/2; pp.rotation.y=sx*.1; }   // troneras de pistola
    { const pp=cyl(tur,.05,.05,.05,0,th*.45,-.98,8,mat); pp.rotation.x=Math.PI/2; }
    for(const sx of [-1,1]) for(const z of [.25,-.55]) cyl(tur,.03,.03,.05,sx*.6,th+.01,z,6,darkMat);              // ganchos para izar
    t.turret=tur; t.gunPivot=G.gp; t.barrel=G.barrel; t.muzzle=G.muzzle; t.coax=G.coax; t.barrelMesh=G.bm;
    // estrella roja en los costados de la torre (proyectada sobre la chapa cónica)
    try{ const P0=root.position.clone(), Q0=root.quaternion.clone(), par=root.parent; if(par) par.remove(root); root.position.set(0,0,0); root.quaternion.identity(); root.updateMatrixWorld(true);
      for(const sx of [-1,1]) decalBT(tur,[tm],starT(),new THREE.Vector3(sx*.84,deck+th*.48,M.tz-.38),new THREE.Vector3(sx,0,0),new THREE.Vector3(0,1,0),.44,.44);
      root.position.copy(P0); root.quaternion.copy(Q0); if(par) par.add(root); root.updateMatrixWorld(true); }catch(e){ console.warn('bt7 estrella',e); }
    // ---- colisiones, alturas y puestos (como buildW2) ----
    collider(tur,1.5,th,1.8,0,th/2,-.1,t,'turret');
    collider(root,W-.1,deck-.25,L,0,(deck+.25)/2,0,t,'hull');
    t.hTop=deck; t.topH=deck+th+.18; t.aimH=deck*.7; t.glL=.5;
    const iw2=ghw*2;
    const tp=(x,y,z)=>(sd,T)=>{ const c=Math.cos(T.turretYaw), sn=Math.sin(T.turretYaw); return V3(x*c+z*sn,deck+y,M.tz-x*sn+z*c); };
    t.seatPos={driver:V3(0,deck-.45,zf-1.0),gunner:tp(-.3,th*.35,0),commander:tp(.3,th*.5,-.25),loader:tp(.3,th*.35,-.05),
      mg1:V3(.3,deck-.45,zf-1.0),mg2:V3(-.3,deck-.4,zf-1.0),engine:V3(0,deck*.55,zr+1.2),trans:V3(0,deck*.4,zr+.5),
      ammo:V3(iw2*.25,deck*.5,M.tz),breech:tp(0,gy,.3)};
  }
  const _lens=new THREE.MeshStandardMaterial({color:0xcfd8d0,roughness:.15,metalness:.6,emissive:0x111410});
})();
