/* ---------- Tanques en pocas piezas (pedido de Sebastián: rendimiento "como War Thunder", sin bajar la calidad) ----------
   Cada tanque eran 185–320 piezas sueltas (una llamada de dibujo cada una, y otra para la sombra). Después de armarlo (makeTank):
   1) Lo fijo se une: las piezas del casco y de la torre que no se mueven ni las toca el juego se juntan en una malla por material
      (y por tamaño: las chicas aparte, así rendimiento.js las sigue apagando de lejos). Nada de lo que el juego mueve o cambia se toca:
      todo lo que cuelga de una propiedad del tanque (cañón, ruedas, ametralladoras con sus tiradores, tripulantes, antena, orugas,
      colisionadores, marcas) queda como estaba, igual que lo que es invisible.
   2) Ruedas: todas juntas en una malla articulada por material, con un hueso por rueda (`skinWheels`): siguen girando y copiando
      los pozos (las ruedas de verdad quedan invisibles y son las que mueve runningGear; el hueso las copia cada cuadro).
   3) Piezas que saltan con los impactos (danos.js): cada pieza unida queda anotada (`t._vp`); si le toca saltar, se crea suelta
      donde estaba y en la malla unida se achica a nada.
   Mismo aspecto: son las mismas piezas en el mismo lugar con el mismo material. */
(()=>{
  const SKIP=new Set(['target','infT','lastBy','crew','T','by','embark','board','killer','root','_lod','_fu','_vp','path','goal']);
  function refsOf(t){ const S=new Set(), seen=new Set();
    const visit=(v,d)=>{ if(!v||typeof v!=='object'||seen.has(v)) return; seen.add(v);
      if(v.isObject3D){ S.add(v); return; } if(v.isMaterial||v.isTexture||v.isBufferGeometry||v.isVector3||v.isColor||v.isQuaternion) return;
      if(d>=3) return; if(Array.isArray(v)){ for(const x of v) visit(x,d+1); return; }
      const pr=Object.getPrototypeOf(v); if(pr!==Object.prototype&&pr!==null) return;
      for(const k in v) visit(v[k],d+1); };
    for(const k in t){ if(SKIP.has(k)) continue; visit(t[k],0); }
    return S; }
  const LODR=typeof LOD_R!=='undefined'?LOD_R:.28;
  const _m=new THREE.Matrix4(), _inv=new THREE.Matrix4(), _n3=new THREE.Matrix3(), _v=new THREE.Vector3(), _s=new THREE.Vector3(), _sph=new THREE.Sphere();
  const okMesh=o=>o.isMesh&&!o.isInstancedMesh&&!o.isSkinnedMesh&&o.visible&&!o.children.length&&o.material&&!Array.isArray(o.material)&&o.geometry&&o.geometry.attributes&&o.geometry.attributes.position&&
    !(o.userData&&(o.userData.tank||o.userData.mark||o.userData.noMerge||o.userData.merged||o.userData.skW||o.userData.crewFig))&&!o.material.isShaderMaterial&&!o.morphTargetInfluences;
  // junta las partes {g, m (matriz respecto de la raíz)} en una geometría indexada con posición, normal y uv
  function mergeParts(parts){ let nv=0, ni=0; for(const p of parts){ const g=p.g, c=g.attributes.position.count; nv+=c; ni+=g.index?g.index.count:c; }
    const pos=new Float32Array(nv*3), nor=new Float32Array(nv*3), uv=new Float32Array(nv*2), idx=nv>65535?new Uint32Array(ni):new Uint16Array(ni);
    let vo=0, io=0;
    for(const p of parts){ const g=p.g, P=g.attributes.position, N=g.attributes.normal, U=g.attributes.uv, c=P.count; p.start=vo; p.count=c;
      _n3.getNormalMatrix(p.m); const flip=p.m.determinant()<0;
      for(let i=0;i<c;i++){ _v.fromBufferAttribute(P,i).applyMatrix4(p.m); pos[(vo+i)*3]=_v.x; pos[(vo+i)*3+1]=_v.y; pos[(vo+i)*3+2]=_v.z;
        if(N){ _v.fromBufferAttribute(N,i).applyMatrix3(_n3).normalize(); nor[(vo+i)*3]=_v.x; nor[(vo+i)*3+1]=_v.y; nor[(vo+i)*3+2]=_v.z; }
        if(U){ uv[(vo+i)*2]=U.getX(i); uv[(vo+i)*2+1]=U.getY(i); } }
      if(g.index){ const I=g.index; for(let i=0;i<I.count;i+=3){ const a=I.getX(i),b=I.getX(i+1),d=I.getX(i+2); idx[io++]=vo+a; if(flip){ idx[io++]=vo+d; idx[io++]=vo+b; } else { idx[io++]=vo+b; idx[io++]=vo+d; } } }
      else for(let i=0;i<c;i+=3){ idx[io++]=vo+i; if(flip){ idx[io++]=vo+i+2; idx[io++]=vo+i+1; } else { idx[io++]=vo+i+1; idx[io++]=vo+i+2; } }
      vo+=c; }
    const G=new THREE.BufferGeometry(); G.setAttribute('position',new THREE.BufferAttribute(pos,3)); G.setAttribute('normal',new THREE.BufferAttribute(nor,3));
    G.setAttribute('uv',new THREE.BufferAttribute(uv,2)); G.setIndex(new THREE.BufferAttribute(idx,1)); G.computeBoundingSphere(); G.computeBoundingBox(); return G; }
  function radiusOf(o){ const g=o.geometry; if(!g.boundingSphere) g.computeBoundingSphere(); o.getWorldScale(_s); return g.boundingSphere.radius*Math.max(_s.x,_s.y,_s.z); }
  // 1) lo fijo de una raíz (casco o torre)
  function fuseRoot(t,R,refs,vp){ R.updateMatrixWorld(true); _inv.copy(R.matrixWorld).invert(); const groups=new Map(), take=[];
    const walk=o=>{ for(const c of o.children){ if(refs.has(c)||c===t.turret) continue; if(c.userData&&(c.userData.tank||c.userData.mark||c.userData.noMerge)) continue; if(!c.visible) continue;
        if(okMesh(c)) take.push(c); else if(!c.isMesh||c.children.length) walk(c); } };
    walk(R);
    for(const o of take){ const r=radiusOf(o), det=r<LODR, key=o.material.uuid+'|'+(o.castShadow?1:0)+(o.receiveShadow?1:0)+'|'+(det?1:0);
      let G=groups.get(key); if(!G){ G={mat:o.material,cs:o.castShadow,rs:o.receiveShadow,det,parts:[]}; groups.set(key,G); }
      G.parts.push({g:o.geometry,m:new THREE.Matrix4().multiplyMatrices(_inv,o.matrixWorld),r,o}); }
    let made=0;
    for(const G of groups.values()){ if(G.parts.length<2) continue;
      const geo=mergeParts(G.parts), M=new THREE.Mesh(geo,G.mat); M.castShadow=G.cs; M.receiveShadow=G.rs; M.userData.merged=1; if(G.det) M.userData.lodDet=1; R.add(M); made++;
      for(const p of G.parts){ p.o.parent&&p.o.parent.remove(p.o); if(p.r>=.06&&p.r<=.9){ _sph.copy(p.g.boundingSphere).applyMatrix4(p.m); vp.push({R,g:p.g,mat:G.mat,m:p.m,mesh:M,start:p.start,count:p.count,c:_sph.center.clone(),r:p.r}); } } }
    return made; }
  // 2) ruedas: todas en una malla articulada por material (un hueso por rueda, como en War Thunder). La rueda de verdad queda invisible
  //    y sigue siendo la que mueven runningGear (giro y pozos): cada cuadro el hueso copia su posición, giro y escala.
  //    Materiales: el skinning necesita su propia copia (r128): la del camuflaje es por tanque y copia el brillo (inmune, térmica) cada cuadro.
  const SKC=new Map();
  function skMat(t,m){ if(m===t.mat||m===t.mud){ const c=m.clone(); c.skinning=true; c.onBeforeCompile=m.onBeforeCompile; c.extensions=m.extensions; c.userData=m.userData; (t._skM||(t._skM=[])).push([m,c]); return c; }
    let c=SKC.get(m); if(!c){ c=m.clone(); c.skinning=true; c.onBeforeCompile=m.onBeforeCompile; c.extensions=m.extensions; c.userData=m.userData; SKC.set(m,c); } return c; }
  function skinWheels(t){ const R=t.root, W=(t.wheels||[]).filter(w=>w.w&&w.w.parent===R&&w.w.visible); if(W.length<2) return null;
    R.updateMatrixWorld(true); _inv.copy(R.matrixWorld).invert(); const groups=new Map(), bones=[];
    W.forEach((w,bi)=>{ const b=new THREE.Bone(); b.position.copy(w.w.position); b.quaternion.copy(w.w.quaternion); b.scale.copy(w.w.scale); R.add(b); bones.push(b);
      w.w.traverse(o=>{ if(!o.isMesh||!o.material||Array.isArray(o.material)||!o.geometry||!o.geometry.attributes.position) return;
        let vis=true; for(let p=o;p&&p!==R;p=p.parent) if(!p.visible) vis=false; if(!vis) return;
        const key=o.material.uuid+'|'+(o.castShadow?1:0); let G=groups.get(key); if(!G){ G={mat:o.material,cs:o.castShadow,parts:[]}; groups.set(key,G); }
        G.parts.push({g:o.geometry,m:new THREE.Matrix4().multiplyMatrices(_inv,o.matrixWorld),bi}); }); });
    R.updateMatrixWorld(true); const sk=new THREE.Skeleton(bones), meshes=[];
    for(const G of groups.values()){ const geo=mergeParts(G.parts), n=geo.attributes.position.count, si=new Uint16Array(n*4), sw=new Float32Array(n*4);
      for(const p of G.parts) for(let k=p.start;k<p.start+p.count;k++){ si[k*4]=p.bi; sw[k*4]=1; }
      geo.setAttribute('skinIndex',new THREE.BufferAttribute(si,4)); geo.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4));
      const M=new THREE.SkinnedMesh(geo,skMat(t,G.mat)); M.castShadow=G.cs; M.receiveShadow=true; M.userData.skW=1; M.frustumCulled=false; R.add(M); M.bind(sk); meshes.push(M); }
    for(const w of W){ w.w.visible=false; w.w.userData.wheelReal=1; }
    return {bones,W,meshes}; }
  function skinSync(t){ const S=t._fu&&t._fu.sk; if(!S) return; for(let i=0;i<S.W.length;i++){ const o=S.W[i].w, b=S.bones[i]; b.position.copy(o.position); b.quaternion.copy(o.quaternion); b.scale.copy(o.scale); }
    if(t._skM) for(const [m,c] of t._skM){ c.emissive.copy(m.emissive); c.color.copy(m.color); c.opacity=m.opacity; } }
  function fuse(t){ if(!t||!t.root||t._fu) return; const t0=performance.now();
    try{ const refs=refsOf(t), vp=[]; refs.delete(t.root);
      let made=fuseRoot(t,t.root,refs,vp);
      if(t.turret&&t.turret!==t.root){ refs.delete(t.turret); made+=fuseRoot(t,t.turret,refs,vp); refs.add(t.turret); }
      const sk=skinWheels(t); t._fu={sk,ms:performance.now()-t0,made}; t._vp=vp; t._lod=null; }
    catch(e){ console.warn('fusion',e); t._fu={err:1}; } }
  { const _tf=tankFX; tankFX=function(t){ const r=_tf.apply(this,arguments); try{ skinSync(t); }catch(e){} return r; }; }
  const _mt=makeTank; makeTank=function(){ const t=_mt.apply(this,arguments);
    try{ if(t.T&&t.T.m&&t.T.m.ww1==='w2'&&typeof snapSides==='function') snapSides(t,t.root,t.T.m,t.T.m.w2); }catch(e){ console.warn('snapSides',e); }   // otra pasada con todo ya puesto (insignias y piezas que suman otros archivos después de buildW2)
    try{ if(typeof apoyarPiezas==='function') apoyarPiezas(t); }catch(e){ console.warn('apoyar',e); }   // piezas en el aire: se apoyan en la chapa antes de unir (apoyar.js)
    try{ if(window.FUSION!==false) fuse(t); }catch(e){ console.warn('fusion',e); } return t; };
  window.fuseTank=fuse;

  // ---- rendimiento.js: las mallas unidas chicas siguen siendo "detalle"; las ruedas de verdad de cerca y la copia de lejos ----
  if(typeof lodScan==='function'){
    lodScan=function(t){ const det=[], big=[]; t.root.updateMatrixWorld(true);
      t.root.traverse(o=>{ if(!o.isMesh||!o.geometry||(o.userData&&o.userData.tank)) return; if(o._cs0===undefined) o._cs0=o.castShadow;
        if(o.userData.merged||o.userData.skW){ (o.userData.lodDet?det:big).push(o); return; } (radiusOf(o)<LODR?det:big).push(o); });
      t._lod={det,big,t:5,lv:-1}; }; }
  // ---- danos.js: piezas que saltan, también las que quedaron unidas ----
  if(typeof shedParts==='function'){ const _sp=shedParts, wp=new THREE.Vector3();
    shedParts=function(t,pW,big){ if(!t||!t._vp||!t._vp.length) return _sp.apply(this,arguments);
      if(t.dead&&!big) return; if(Math.random()>(big?.55:.3)) return;
      const cand=[]; t.root.updateMatrixWorld(true);
      for(const p of t._vp){ if(p.gone) continue; wp.copy(p.c).applyMatrix4(p.R.matrixWorld); if(wp.y-t.pos.y<.8||wp.distanceTo(pW)>(big?1.5:1.0)) continue; cand.push(p); }
      const n=Math.min(cand.length,big?(Math.random()<.5?2:1):1);
      for(let i=0;i<n;i++){ const p=cand.splice((Math.random()*cand.length)|0,1)[0]; p.gone=true;
        const o=new THREE.Mesh(p.g,p.mat); o.castShadow=true; _m.multiplyMatrices(p.R.matrixWorld,p.m); _m.decompose(o.position,o.quaternion,o.scale); scene.add(o);
        const P=p.mesh.geometry.attributes.position, x=P.getX(p.start), y=P.getY(p.start), z=P.getZ(p.start);   // en la malla unida se achica a un punto
        for(let k=p.start;k<p.start+p.count;k++) P.setXYZ(k,x,y,z); P.needsUpdate=true;
        const out=o.position.clone().sub(t.pos).setY(0).normalize();
        shed.push({o,t,v:out.multiplyScalar(rand(2,4.5)).add(new THREE.Vector3(0,rand(2.5,5.5),0)),w:new THREE.Vector3(rand(-6,6),rand(-6,6),rand(-6,6)),rest:false,age:0}); } }; }
})();
