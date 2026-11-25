/* Detector de piezas en el aire (24/11/2026). Pegar en la consola con el juego abierto (o cargar con <script>) y llamar:
     await piezasAire('m4a1')        → lista de grupos de piezas que no tocan el resto del tanque
     await piezasAire()              → todos los vehículos (VEH), devuelve {tanque: [grupos]}
   Arma el tanque sin fusion.js (FUSION=false), pasa cada malla visible a triángulos en el mundo y une las que se tocan
   (caja de la pieza agrandada TOL m contra los triángulos de la otra). Lo que no queda unido al casco ni al tren de rodaje
   (ruedas/orugas) es un grupo suelto: se informa con su tamaño, dónde está y la distancia al resto. */
(function(){
  const TOL=.03;
  const tri=new THREE.Triangle(), a=new THREE.Vector3(), b=new THREE.Vector3(), c=new THREE.Vector3();
  function meshTris(m){ const g=m.geometry; if(!g||!g.attributes||!g.attributes.position) return null;
    const P=g.attributes.position, I=g.index, n=I?I.count:P.count, out=new Float32Array(n*3); m.updateMatrixWorld(true);
    for(let i=0;i<n;i++){ const j=I?I.getX(i):i; a.fromBufferAttribute(P,j).applyMatrix4(m.matrixWorld); out[i*3]=a.x; out[i*3+1]=a.y; out[i*3+2]=a.z; }
    return out; }
  function touches(boxA,T){ for(let i=0;i<T.length;i+=9){ a.set(T[i],T[i+1],T[i+2]); b.set(T[i+3],T[i+4],T[i+5]); c.set(T[i+6],T[i+7],T[i+8]); tri.set(a,b,c);
      if(boxA.intersectsTriangle(tri)) return true; } return false; }
  function visibleUp(o,root){ for(let p=o;p&&p!==root.parent;p=p.parent) if(!p.visible) return false; return true; }
  function analyze(t){ const root=t.root, M=[];
    root.traverse(o=>{ if(!o.isMesh||o.isSkinnedMesh||!visibleUp(o,root)) return; if(o.layers&&o.layers.mask===0) return;
      if(o.userData&&(o.userData.collider||o.userData.hcE)) return; const T=meshTris(o); if(!T||!T.length) return;
      const box=new THREE.Box3().setFromBufferAttribute(new THREE.BufferAttribute(T,3)); M.push({o,T,box,vol:box.getSize(a).length()}); });
    const gear=new Set(); for(const k of ['wheels','wl','wr','trk','tracks']){ const v=t[k]; if(!v) continue; const L=Array.isArray(v)?v:[v];
      const add=x=>{ if(!x) return; if(x.isObject3D) x.traverse(o=>gear.add(o)); else if(typeof x==='object') for(const q in x){ const y=x[q]; if(y&&y.isObject3D) y.traverse(o=>gear.add(o)); else if(Array.isArray(y)) y.forEach(z=>z&&z.isObject3D&&z.traverse(o=>gear.add(o))); } };
      L.forEach(add); }
    const isTrack=m=>gear.has(m.o)||/track|oruga|rueda|wheel/i.test(m.o.name||'');
    const par=M.map((_,i)=>i), f=i=>par[i]===i?i:(par[i]=f(par[i])), u=(i,j)=>{ par[f(i)]=f(j); };
    const big=new THREE.Box3();
    // siempre la caja de la pieza más chica contra los triángulos de la más grande (al revés, una pieza grande "tocaba" todo lo que cae en su caja)
    for(let i=0;i<M.length;i++) for(let j=i+1;j<M.length;j++){ if(f(i)===f(j)) continue; const [S,L]=M[i].vol<=M[j].vol?[M[i],M[j]]:[M[j],M[i]];
      big.copy(S.box).expandByScalar(TOL); if(!big.intersectsBox(L.box)) continue; if(touches(big,L.T)) u(i,j); }
    let hull=0; M.forEach((m,i)=>{ if(m.vol>M[hull].vol) hull=i; });
    const roots=new Set([f(hull)]); M.forEach((m,i)=>{ if(isTrack(m)) roots.add(f(i)); });
    const groups={}; M.forEach((m,i)=>{ const r=f(i); if(roots.has(r)) return; (groups[r]=groups[r]||[]).push(m); });
    const rootT=M.filter((m,i)=>roots.has(f(i)));
    return Object.values(groups).filter(G=>G.some(m=>m.vol>.005)).map(G=>{ const bx=new THREE.Box3(); G.forEach(m=>bx.union(m.box)); const s=bx.getSize(new THREE.Vector3()), ctr=bx.getCenter(new THREE.Vector3());
      // distancia al resto: se agranda la caja hasta tocar
      let d=null; for(const e of [.06,.1,.2,.4,.8]){ const B=bx.clone().expandByScalar(e); if(rootT.some(m=>B.intersectsBox(m.box)&&touches(B,m.T))){ d=e; break; } }
      return {n:G.length,names:[...new Set(G.map(m=>m.o.name||m.o.parent&&m.o.parent.name||'?'))].slice(0,4).join(','),
        size:[s.x,s.y,s.z].map(v=>+v.toFixed(2)), at:[ctr.x,ctr.y,ctr.z].map(v=>+v.toFixed(2)), gap:d==null?'>0.8':'≤'+d, mats:[...new Set(G.map(m=>m.o.material&&m.o.material.color?m.o.material.color.getHexString():'?'))].join(',')}; }); }
  window._paAnalyze=analyze;
  window.piezasAire=async function(k){ const keys=k?[k]:Object.keys(VEH).filter(x=>!VEH[x].static), out={}, was=window.FUSION; window.FUSION=false;
    for(const key of keys){ let t; try{ t=makeTank({name:'',team:0,nation:VEH[key].nation,isPlayer:false,cams:{}},key,0,0,0); }catch(e){ out[key]='error: '+e.message; continue; }
      t.root.position.set(0,0,0); t.root.rotation.set(0,0,0); t.root.updateMatrixWorld(true);
      try{ out[key]=analyze(t); }catch(e){ out[key]='error: '+e.message; }
      scene.remove(t.root);
      const i=tanks.indexOf(t); if(i>=0) tanks.splice(i,1); colliders=colliders.filter(c=>c.userData.tank!==t);
      if(!k) await new Promise(r=>setTimeout(r,0)); }
    window.FUSION=was; return k?out[k]:out; };
})();
