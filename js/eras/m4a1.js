/* ---------- M4A1 más parecido a la referencia (24/11/2026, pedido de Sebastián con "M4A1 Sherman" de Papa_Chad en Sketchfab: "quiero que nuestro m4a1 sea lo más parecido") ----------
   Hecho por código (no se usa el modelo). Envuelve buildW2 cuando M.w2.ref==='m4a1' (VEH.m4a1 en gm3-datos.js):
   - verde oliva más verde y oscuro (camo de VEH.m4a1) y tubo del 75 M3 más grueso (gr .058) con el anillo de la boca;
   - estrellas blancas grandes calcadas sobre la chapa curva (calcas en grilla proyectadas con rayos sobre el casco fundido y la torre):
     costados del casco adelante, costados de la torre y la tapa del motor; "U.S.A." atrás en los costados. Las estrellitas planas de antes
     quedaban metidas adentro del casco redondeado y no se veían;
   - sin las chapas de blindaje extra a los costados (la referencia no las tiene);
   - tapa del motor: dos puertas con bisagras y la rejilla de atrás en vez del rectángulo negro; cajón de madera en la popa. */
(()=>{
  const _b=buildW2;
  const texC={};
  function decalTex(kind){ if(texC[kind]) return texC[kind]; const W=kind==='usa'?512:256, H=kind==='usa'?128:256, c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
    x.fillStyle='#e9e6da';
    if(kind==='usa'){ x.font='bold 92px Arial, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('U.S.A.',W/2,H/2+4); }
    else { x.beginPath(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, r=i%2?W*.19:W*.49; x.lineTo(W/2+Math.cos(a)*r,H/2+Math.sin(a)*r); } x.closePath(); x.fill(); }
    // un poco gastada: puntitos transparentes
    x.globalCompositeOperation='destination-out'; for(let i=0;i<260;i++){ x.globalAlpha=Math.random()*.6; x.fillRect(Math.random()*W,Math.random()*H,1+Math.random()*3,1+Math.random()*2); }
    const t=new THREE.CanvasTexture(c); t.anisotropy=4; return texC[kind]=t; }
  const matC={};
  const decalMat=k=>matC[k]||(matC[k]=new THREE.MeshLambertMaterial({map:decalTex(k),transparent:true,alphaTest:.45,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
  const rc=new THREE.Raycaster(), _p=new THREE.Vector3(), _o=new THREE.Vector3(), _n=new THREE.Vector3();
  // Calca: grilla w×h centrada en c (mundo), mirando hacia out, con "arriba" up; cada vértice se proyecta sobre targets y queda 8 mm afuera
  function decal(parent,targets,kind,c,out,up,w,h,seg=10){
    const right=new THREE.Vector3().crossVectors(up,out).normalize(), g=new THREE.PlaneGeometry(w,h,seg,seg), P=g.attributes.position; let miss=0;
    for(let i=0;i<P.count;i++){ const u=P.getX(i), v=P.getY(i); _p.copy(c).addScaledVector(right,u).addScaledVector(up,v);
      _o.copy(_p).addScaledVector(out,.6); rc.set(_o,_n.copy(out).negate()); rc.far=1.4; const hit=rc.intersectObjects(targets,false)[0];
      if(hit){ const n=hit.face.normal.clone().transformDirection(hit.object.matrixWorld); _p.copy(hit.point).addScaledVector(n.dot(out)<0?n.negate():n,.008); } else miss++;
      parent.worldToLocal(_p); P.setXYZ(i,_p.x,_p.y,_p.z); }
    if(miss>P.count*.3) return null;
    g.computeVertexNormals(); const m=new THREE.Mesh(g,decalMat(kind)); m.renderOrder=2; m.userData.stand=1; m.userData.decal=1; parent.add(m); return m; }
  const near=(a,b,e=.012)=>Math.abs(a-b)<e;
  function extras(t,M,mat,root){
    const I=M.w2, L=M.L, zf=L/2, zr=-L/2, deck=I.deck, tw=I.trW, iw2=M.W-tw*2+.04, tur=t.turret;
    const P0=root.position.clone(), Q0=root.quaternion.clone(), S0=root.scale.clone(), par=root.parent; if(par) par.remove(root);
    root.position.set(0,0,0); root.quaternion.identity(); root.scale.set(1,1,1); const ty0=tur.rotation.y; tur.rotation.y=0;
    try{
      root.updateMatrixWorld(true);
      const bb=new THREE.Box3(), sz=new THREE.Vector3(), kill=[];
      let hull=null;
      for(const o of root.children){ if(!o.isMesh) continue;
        if(o.geometry&&o.geometry.userData&&o.geometry.userData.castHull) hull=o;
        bb.setFromObject(o); bb.getSize(sz);
        if(o.material===_wMat&&o.geometry.type==='ShapeGeometry') kill.push(o);                                         // estrellitas planas de antes
        else if(o.material===darkMat&&near(o.position.y,deck+.03)&&near(sz.x,iw2*.62,.03)) kill.push(o);                  // rectángulo negro del motor
        else if(near(sz.x,.04,.03)&&near(sz.y,.55,.03)&&near(sz.z,.75,.03)&&Math.abs(o.position.x)>M.W/2-.2) kill.push(o); // chapas extra de los costados
      }
      root.traverse(o=>{ if(o.parent&&o.parent.parent===root&&o.isMesh&&o.material===_wMat&&o.geometry.type==='ShapeGeometry') kill.push(o.parent); });
      for(const o of new Set(kill)) o.parent&&o.parent.remove(o);
      // ---- tapa del motor: dos puertas con bisagras, rejilla atrás, tapas de combustible ----
      const zd=zr+L*.215, dl=L*.2, doors=[];
      for(const sx of [-1,1]){ doors.push(rbox(root,iw2*.43,.03,dl,sx*iw2*.225,deck+.012,zd,mat,.012));
        for(const dz of [-dl*.33,dl*.33]){ const h=cyl(root,.035,.035,.16,sx*iw2*.02,deck+.03,zd+dz,8,darkMat); h.rotation.x=Math.PI/2; }           // bisagras
        box(root,.14,.025,.04,sx*iw2*.36,deck+.035,zd-dl*.42,darkMat); }                                                                       // manijas
      for(let i=0;i<6;i++) box(root,iw2*.72,.02,.045,0,deck+.012,zr+.42+i*.075,darkMat);                                                       // rejilla de atrás
      box(root,iw2*.76,.02,.5,0,deck+.004,zr+.6,_m4Grate);
      // cajón de madera en la popa, con tablas
      { const z=zr+.1, y=deck-.12; rbox(root,iw2*.8,.26,.26,0,y,z,_wdMat,.02);
        for(const dy of [-.07,.06]) box(root,iw2*.8+.01,.012,.27,0,y+dy,z,_m4WoodD);
        for(const sx of [-1,1]) box(root,.04,.28,.28,sx*iw2*.39,y,z,darkMat); }
      root.updateMatrixWorld(true);
      // ---- calcas ----
      const yank=!I.ins||I.ins==='us';   // las copias de otras naciones (Brasil, Chile) no llevan estrellas: llevan su bandera (w2Insignia)
      if(hull&&yank){ const Ht=[hull], X=new THREE.Vector3(1,0,0), Y=new THREE.Vector3(0,1,0), Z=new THREE.Vector3(0,0,1);
        for(const sx of [-1,1]){ const out=X.clone().multiplyScalar(sx);
          decal(root,Ht,'star',new THREE.Vector3(sx*M.W/2,deck-.26,zf-L*.3),out,Y,.56,.56);                       // costados, adelante
          decal(root,Ht,'usa',new THREE.Vector3(sx*M.W/2,deck-.24,zr+L*.15),out,Y,.64,.16,12); }                    // "U.S.A." atrás
        decal(root,Ht.concat(doors),'star',new THREE.Vector3(0,deck+.05,zd),Y,Z.clone().negate(),.72,.72,8);        // tapa del motor
      }
      if(tur&&yank){ tur.updateMatrixWorld(true); const Tt=[]; tur.children.forEach(o=>{ if(o.isMesh&&o.geometry&&o.geometry.type==='LatheGeometry') Tt.push(o); });
        if(Tt.length){ const tb=new THREE.Box3(); Tt.forEach(o=>tb.expandByObject(o)); const c=tb.getCenter(new THREE.Vector3()), s=tb.getSize(new THREE.Vector3());
          for(const sx of [-1,1]) decal(tur,Tt,'star',new THREE.Vector3(c.x+sx*s.x/2,tb.min.y+s.y*.46,c.z-s.z*.08),new THREE.Vector3(sx,0,0),new THREE.Vector3(0,1,0),.46,.46); } }
      // ---- 75 mm M3: anillo de la boca ----
      if(t.barrel){ const r=cyl(t.barrel,M.gr*1.25,M.gr*1.25,.07,0,0,M.gl-.05,12,mat); r.rotation.x=Math.PI/2; }
    } finally { tur.rotation.y=ty0; root.position.copy(P0); root.quaternion.copy(Q0); root.scale.copy(S0); if(par) par.add(root); root.updateMatrixWorld(true); }
  }
  const _m4Grate=new THREE.MeshLambertMaterial({color:0x1d1d1a}), _m4WoodD=new THREE.MeshLambertMaterial({color:0x4a3826});
  buildW2=function(t,M,mat,root,lkL,lkR){ const r=_b.apply(this,arguments); if(M&&M.w2&&M.w2.ref==='m4a1'){ try{ extras(t,M,mat,root); }catch(e){ console.warn('m4a1:',e); } } return r; };
  // marca la geometría del casco fundido para encontrarlo
  const _cg=castHullGeo; castHullGeo=function(){ const g=_cg.apply(this,arguments); g.userData.castHull=1; return g; };
})();
