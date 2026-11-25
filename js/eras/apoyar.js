/* ---------- Piezas apoyadas en la chapa (24/11/2026, pedido de Sebastián: "tiene cosas en el aire, volvé a verificar este y todos los tanques") ----------
   Muchos detalles se ubican con medidas del casco "de caja" y en los cascos fundidos, inclinados o redondeados quedan separados de la chapa
   (p. ej. faros y sirena del M4A1 a 10–20 cm del glacis, antenas sobre la torre, guardabarros sueltos). En vez de corregir cada constructor,
   al armar el tanque (fusion.js llama a apoyarPiezas antes de unir las mallas):
   1) se pasan las mallas visibles a triángulos y se unen las que se tocan (la caja de la más chica, agrandada TOL, contra los triángulos de la
      más grande); lo que queda unido al casco o al tren de rodaje está bien;
   2) cada grupo suelto chico (≤ MAXN piezas, ≤ MAXS m, a ≤ MAXD m) se corre por el camino más corto hasta apoyarse en la chapa más cercana.
   No se tocan el cañón (el fogonazo sale de t.muzzle), las ruedas ni las orugas. El resultado se guarda por tanque (CACHE): el cálculo se hace
   una vez por tipo de vehículo. window.APOYAR=false lo apaga; herramientas/piezas-aire.js es el detector para revisar. */
(()=>{
  const TOL=.03, MAXN=14, MAXS=1.7, MAXD=.45, SINK=.006, CACHE={};
  const _t=new THREE.Triangle(), _a=new THREE.Vector3(), _b=new THREE.Vector3(), _c=new THREE.Vector3(), _p=new THREE.Vector3(), _q=new THREE.Vector3();
  function tris(m){ const g=m.geometry; if(!g||!g.attributes||!g.attributes.position) return null;
    const P=g.attributes.position, I=g.index, n=I?I.count:P.count, out=new Float32Array(n*3);
    for(let i=0;i<n;i++){ _a.fromBufferAttribute(P,I?I.getX(i):i).applyMatrix4(m.matrixWorld); out[i*3]=_a.x; out[i*3+1]=_a.y; out[i*3+2]=_a.z; }
    return out; }
  function touches(box,T){ for(let i=0;i<T.length;i+=9){ _a.set(T[i],T[i+1],T[i+2]); _b.set(T[i+3],T[i+4],T[i+5]); _c.set(T[i+6],T[i+7],T[i+8]); _t.set(_a,_b,_c); if(box.intersectsTriangle(_t)) return true; } return false; }
  const shown=(o,R)=>{ for(let p=o;p;p=p.parent){ if(!p.visible) return false; if(p===R) return true; } return true; };
  function objsOf(v,S){ if(!v) return; if(v.isObject3D){ v.traverse(o=>S.add(o)); return; } if(Array.isArray(v)){ v.forEach(x=>objsOf(x,S)); return; }
    if(typeof v==='object') for(const k in v){ const y=v[k]; if(y&&(y.isObject3D||Array.isArray(y))) objsOf(y,S); } }
  function meshList(t){ const R=t.root, L=[]; R.traverse(o=>{ if(o.isMesh&&!o.isSkinnedMesh&&shown(o,R)&&!(o.userData&&(o.userData.collider||o.userData.sleeve))) L.push(o); }); return L; }
  // Cañón que arranca delante de la torre: en vez de moverlo (el fogonazo sale de t.muzzle), una camisa en la raíz hasta la chapa de atrás.
  // Se mide en el espacio de t.barrel (el tubo va por +z) con un rayo hacia atrás desde el arranque del tubo.
  function sleeve(t,G,base){ const B=t.barrel; if(!B) return null; B.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(B.matrixWorld).invert(), lb=new THREE.Box3();
    for(const g of G){ const T=g.T; for(let v=0;v<T.length;v+=3){ _p.set(T[v],T[v+1],T[v+2]).applyMatrix4(inv); lb.expandByPoint(_p); } }
    const ls=lb.getSize(new THREE.Vector3()); if(ls.z<Math.max(ls.x,ls.y)*3) return null;                          // no es un tubo a lo largo
    const cx=(lb.min.x+lb.max.x)/2, cy=(lb.min.y+lb.max.y)/2, o=new THREE.Vector3(cx,cy,lb.min.z+.01).applyMatrix4(B.matrixWorld),
      d=new THREE.Vector3(0,0,-1).transformDirection(B.matrixWorld), rc=new THREE.Raycaster(o,d,0,.6), hit=rc.intersectObjects(base.map(m=>m.o),false)[0];
    if(!hit||hit.distance<TOL) return null; const r=Math.max(.03,Math.min(ls.x,ls.y)*.62);
    return {x:cx,y:cy,z:lb.min.z-hit.distance/2+.005,len:hit.distance+.03,r}; }
  // grupos sueltos: [{idx:[...], move:Vector3 (mundo)}]
  function solve(t){ const R=t.root; R.updateMatrixWorld(true); const L=meshList(t), M=[];
    const gear=new Set(), gun=new Set(); objsOf(t.wheels,gear); objsOf(t.trk,gear); objsOf(t.barrel,gun);
    L.forEach((o,i)=>{ const T=tris(o); if(!T||!T.length) return; const box=new THREE.Box3().setFromBufferAttribute(new THREE.BufferAttribute(T,3)); M.push({o,i,T,box,sz:box.getSize(_a).length()}); });
    const par=M.map((_,i)=>i), f=i=>par[i]===i?i:(par[i]=f(par[i])), big=new THREE.Box3();
    for(let i=0;i<M.length;i++) for(let j=i+1;j<M.length;j++){ if(f(i)===f(j)) continue; const [S,G]=M[i].sz<=M[j].sz?[M[i],M[j]]:[M[j],M[i]];
      big.copy(S.box).expandByScalar(TOL); if(big.intersectsBox(G.box)&&touches(big,G.T)) par[f(i)]=f(j); }
    let hull=0; M.forEach((m,i)=>{ if(m.sz>M[hull].sz) hull=i; });
    const roots=new Set([f(hull)]); M.forEach((m,i)=>{ if(gear.has(m.o)) roots.add(f(i)); });
    const groups={}; M.forEach((m,i)=>{ const r=f(i); if(!roots.has(r)) (groups[r]=groups[r]||[]).push(m); });
    const base=M.filter((m,i)=>roots.has(f(i))), out=[];
    for(const G of Object.values(groups)){
      const bx=new THREE.Box3(); G.forEach(m=>bx.union(m.box)); const sz=bx.getSize(new THREE.Vector3()), dims=sz.toArray().sort((x,y)=>x-y), len=Math.hypot(...dims);
      if(len<.005) continue;
      if(G.some(m=>gun.has(m.o))){ const sl=sleeve(t,G,base); if(sl) out.push({idx:G.map(m=>m.i),sig:G.map(m=>m.o.geometry.attributes.position.count),sleeve:sl}); continue; }
      const onGun=G.some(m=>{ for(let p=m.o;p;p=p.parent) if(p===t.gunPivot) return true; return false; }), hasGear=G.some(m=>gear.has(m.o));
      const small=!hasGear&&G.length<=MAXN&&len<=MAXS, thin=!hasGear&&(!onGun||sz.y>=Math.max(sz.x,sz.z))&&dims[1]<.16&&dims[2]<6, block=G.length<=40&&len<=3.2;   // chico · fino y largo (antenas, barandas, rieles; en el cañón solo las paradas) · conjunto grande cerca (cola del Mark I)
      if(!small&&!thin&&!block) continue;
      // punto más cercano entre los vértices del grupo y los triángulos de lo que está bien
      const near=bx.clone().expandByScalar(MAXD), cand=base.filter(m=>near.intersectsBox(m.box));
      let best=MAXD*MAXD, mv=null;
      for(const g of G){ const T=g.T, step=T.length>2700?Math.ceil(T.length/2700)*3:3;
        for(let v=0;v<T.length;v+=step){ _p.set(T[v],T[v+1],T[v+2]);
          for(const c of cand){ if(c.box.distanceToPoint(_p)*c.box.distanceToPoint(_p)>=best) continue; const C=c.T;
            for(let k=0;k<C.length;k+=9){ _a.set(C[k],C[k+1],C[k+2]); _b.set(C[k+3],C[k+4],C[k+5]); _c.set(C[k+6],C[k+7],C[k+8]); _t.set(_a,_b,_c);
              _t.closestPointToPoint(_p,_q); const d=_q.distanceToSquared(_p); if(d<best){ best=d; mv=_q.clone().sub(_p); } } } } }
      if(!mv||mv.lengthSq()<1e-6) continue;
      if(!small&&!thin&&mv.length()>.12) continue;
      mv.addScaledVector(mv.clone().normalize(),SINK);                 // que quede apenas metida en la chapa, sin luz
      out.push({idx:G.map(m=>m.i),sig:G.map(m=>m.o.geometry.attributes.position.count),move:mv.toArray()}); }
    return {n:L.length,out}; }
  function apply(t,S){ const L=meshList(t); if(L.length!==S.n) return false; t.root.updateMatrixWorld(true); const W=new THREE.Vector3();
    for(const g of S.out){ if(g.idx.some((i,k)=>!L[i]||L[i].geometry.attributes.position.count!==g.sig[k])) return false; }
    for(const g of S.out){ if(g.sleeve){ const q=g.sleeve, src=L[g.idx[0]], c=new THREE.Mesh(new THREE.CylinderGeometry(q.r,q.r*1.08,q.len,14),src.material);
        c.rotation.x=Math.PI/2; c.position.set(q.x,q.y,q.z); c.castShadow=true; c.userData.sleeve=1; t.barrel.add(c); continue; }
      const set=new Set(g.idx.map(i=>L[i])), mv=new THREE.Vector3().fromArray(g.move);
      for(const m of set){ let up=false; for(let p=m.parent;p;p=p.parent) if(set.has(p)){ up=true; break; } if(up||!m.parent) continue;
        m.getWorldPosition(W).add(mv); m.parent.updateMatrixWorld(true); m.position.copy(m.parent.worldToLocal(W)); m.updateMatrixWorld(true); } }
    return true; }
  // la pose de armado: torre y cañón derechos, el tanque en el origen (si no, las mismas piezas darían otros números)
  window.apoyarPiezas=function(t){ if(window.APOYAR===false||!t||!t.root||!t.T||!t.T.m) return;
    const R=t.root, keep=[R.position.clone(),R.quaternion.clone()], tr=t.turret&&t.turret!==R?t.turret.rotation.y:null, gp=t.gunPivot?t.gunPivot.rotation.x:null;
    R.position.set(0,0,0); R.quaternion.identity(); if(tr!=null) t.turret.rotation.y=0; if(gp!=null) t.gunPivot.rotation.x=0;
    try{ const key=(t.key||'')+'|'+meshList(t).length+'|'+JSON.stringify(t.T.m.w2||t.T.m.ww1||'').length; let S=key.startsWith('|')?null:CACHE[key];
      if(!S||!apply(t,S)){ S=solve(t); if(!key.startsWith('|')) CACHE[key]=S; apply(t,S); }
      t._apoyo=S.out.length; }
    catch(e){ console.warn('apoyar',e); }
    finally{ R.position.copy(keep[0]); R.quaternion.copy(keep[1]); if(tr!=null) t.turret.rotation.y=tr; if(gp!=null) t.gunPivot.rotation.x=gp; R.updateMatrixWorld(true); } };
  window.apoyarInfo=()=>Object.fromEntries(Object.entries(CACHE).map(([k,v])=>[k,v.out.length]));
})();
