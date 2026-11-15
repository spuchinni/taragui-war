/* ---------- Infantería con huesos (pedido de Sebastián, después de los tanques en pocas piezas) ----------
   Cada persona eran ~8–12 mallas (torso, cabeza, piernas, brazos, antebrazos, pantorrillas…), una llamada de dibujo cada una y otra en
   la sombra. Ahora, al armarla (personMesh), todas las piezas de un solo color o con colores por vértice se juntan en UNA malla
   articulada (SkinnedMesh) cuyos "huesos" son las mismas piezas: las animaciones (caminar, apuntar con IK, caer, sentarse, rodillas,
   civiles con poses) siguen moviendo las piezas como siempre y la malla las copia sola. Las piezas quedan en la capa 31 (no se
   dibujan ni hacen sombra) y siguen existiendo para todo lo demás: pedazos de las explosiones, el títere de gente3d, etc.
   Quedan sueltas: el arma (se suelta al morir), lo que tiene textura (insignias) y lo que se agrega después (valijas, canastas).
   gente3d: cuando el civil detallado está cerca oculta las piezas (visible=false); la malla copia esa visibilidad (`skinVis`). */
(()=>{
  const HID=31, skMat=new THREE.MeshLambertMaterial({vertexColors:true,skinning:true}), _inv=new THREE.Matrix4(), _m=new THREE.Matrix4(), _n3=new THREE.Matrix3(), _v=new THREE.Vector3(), _c=new THREE.Color();
  const okPart=o=>o.isMesh&&!o.isSkinnedMesh&&!o.isInstancedMesh&&o.material&&!Array.isArray(o.material)&&!o.material.map&&!o.material.transparent&&o.geometry&&o.geometry.attributes&&o.geometry.attributes.position&&!(o.userData&&(o.userData.noSkin||o.userData.skP));
  function skinPerson(pm){ const g=pm.g, wep=pm.parts&&pm.parts.wep; if(!g) return null;
    if(g.userData.sk){ const old=g.userData.sk; old.parent&&old.parent.remove(old); old.geometry.dispose(); for(const b of old.skeleton.bones) b.layers.set(0); g.userData.sk=null; }
    g.updateMatrixWorld(true); _inv.copy(g.matrixWorld).invert(); const parts=[];
    g.traverse(o=>{ if(o===g||!okPart(o)) return; for(let p=o;p&&p!==g;p=p.parent) if(p===wep) return; if(!o.visible) return; parts.push(o); });
    if(parts.length<3) return null;
    let nv=0, ni=0; for(const o of parts){ const G=o.geometry, c=G.attributes.position.count; nv+=c; ni+=G.index?G.index.count:c; }
    const pos=new Float32Array(nv*3), nor=new Float32Array(nv*3), col=new Float32Array(nv*3), si=new Uint16Array(nv*4), sw=new Float32Array(nv*4), idx=nv>65535?new Uint32Array(ni):new Uint16Array(ni);
    let vo=0, io=0;
    parts.forEach((o,bi)=>{ const G=o.geometry, P=G.attributes.position, N=G.attributes.normal, C=o.material.vertexColors?G.attributes.color:null, c=P.count;
      _m.multiplyMatrices(_inv,o.matrixWorld); _n3.getNormalMatrix(_m); const flip=_m.determinant()<0; _c.copy(o.material.color||_c.set(0xffffff));
      for(let i=0;i<c;i++){ const k=vo+i; _v.fromBufferAttribute(P,i).applyMatrix4(_m); pos[k*3]=_v.x; pos[k*3+1]=_v.y; pos[k*3+2]=_v.z;
        if(N){ _v.fromBufferAttribute(N,i).applyMatrix3(_n3).normalize(); nor[k*3]=_v.x; nor[k*3+1]=_v.y; nor[k*3+2]=_v.z; }
        if(C){ col[k*3]=C.getX(i)*_c.r; col[k*3+1]=C.getY(i)*_c.g; col[k*3+2]=C.getZ(i)*_c.b; } else { col[k*3]=_c.r; col[k*3+1]=_c.g; col[k*3+2]=_c.b; }
        si[k*4]=bi; sw[k*4]=1; }
      if(G.index){ const I=G.index; for(let i=0;i<I.count;i+=3){ const a=I.getX(i),b=I.getX(i+1),d=I.getX(i+2); idx[io++]=vo+a; if(flip){ idx[io++]=vo+d; idx[io++]=vo+b; } else { idx[io++]=vo+b; idx[io++]=vo+d; } } }
      else for(let i=0;i<c;i+=3){ idx[io++]=vo+i; if(flip){ idx[io++]=vo+i+2; idx[io++]=vo+i+1; } else { idx[io++]=vo+i+1; idx[io++]=vo+i+2; } }
      vo+=c; });
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));
    geo.setAttribute('color',new THREE.BufferAttribute(col,3)); geo.setAttribute('skinIndex',new THREE.BufferAttribute(si,4)); geo.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4));
    geo.setIndex(new THREE.BufferAttribute(idx,1)); geo.computeBoundingSphere(); geo.boundingSphere.radius*=1.6;   // de margen: al caer o sentarse se estira
    const sm=new THREE.SkinnedMesh(geo,skMat); sm.castShadow=parts.some(o=>o.castShadow); sm.receiveShadow=true; sm.userData.skP=1; g.add(sm);
    sm.bind(new THREE.Skeleton(parts));                                                 // los huesos son las mismas piezas
    for(const o of parts) o.layers.set(HID);
    g.userData.sk=sm; g.userData.skT=pm.parts&&pm.parts.torso; return sm; }
  window.skinPerson=skinPerson;
  if(typeof personMesh==='function'){ const _pm=personMesh; personMesh=function(){ const pm=_pm.apply(this,arguments);
      try{ if(window.HUESOS!==false) skinPerson(pm); }catch(e){ console.warn('huesos',e); } return pm; }; }
  // gente3d oculta las piezas cuando muestra al civil detallado: la malla copia esa visibilidad
  function skinVis(){ for(const P of infantry){ const sm=P.g&&P.g.userData.sk; if(!sm) continue; const T=P.g.userData.skT; sm.visible=!T||T.visible!==false; } }
  const _ui=updateInfantry; updateInfantry=function(){ const r=_ui.apply(this,arguments); try{ skinVis(); }catch(e){} return r; };
  // al sacar a una persona se libera su malla en la placa de video (three no lo hace solo)
  if(typeof removeInf==='function'){ const _ri=removeInf; removeInf=function(P){ const r=_ri.apply(this,arguments); try{ const sm=P&&P.g&&P.g.userData.sk; if(sm){ sm.geometry.dispose(); P.g.userData.sk=null; } }catch(e){} return r; }; }
  // vecinos.js parte la pierna en muslo y pantorrilla para sentarlos: hay que volver a armar la malla
  if(typeof kneeSplit==='function'){ const _ks=kneeSplit; window.kneeSplit=kneeSplit=function(P){ const was=P.knees, r=_ks.apply(this,arguments); try{ if(r&&!was&&P.g&&P.g.userData.sk){ P.parts.legL.layers.set(0); P.parts.legR.layers.set(0); skinPerson({g:P.g,parts:P.parts}); } }catch(e){ console.warn('huesos',e); } return r; }; }
})();
