/* ---------- Partículas en lote (pedido de Sebastián: "cuando hay humo, artillería y bombardeo se ralentiza"; sin bajar la calidad) ----------
   Antes cada nube de humo (`puff`) era un Sprite con su propio material: con humo + artillería + bombardeo se juntaban ~600 objetos
   transparentes, cada uno con su llamada de dibujo y su material nuevo (y la basura al tirarlos). Lo mismo las esquirlas (`debris`, una
   malla por cubito) y las trazadoras (`tracer`, una línea con geometría y material nuevos por tiro).
   Acá se dibujan todas juntas, con el mismo aspecto (misma textura, color, opacidad que se apaga, crecimiento y subida):
   - humo y fogonazos: 2 mallas instanciadas que miran a la cámara (normal y aditiva), ordenadas de atrás para adelante, con niebla;
     además se desvanecen cuando la cámara queda adentro de la nube (lo que más carga la placa: una nube pegada a la cámara pinta la
     pantalla entera varias veces, y de todos modos tapaba todo);
   - esquirlas: una malla instanciada por material;
   - trazadoras: un solo conjunto de segmentos con su transparencia.
   Las funciones `puff`, `debris` y `tracer` se reemplazan con la misma firma: no cambia nada para el que las llama. */
(()=>{
  const MAXP=2400, NRM=0, ADD=1;
  // ---- humo y fogonazos ----
  const VS=`attribute vec3 iPos; attribute float iSize; attribute vec3 iCol; attribute float iOp;
    varying vec2 vUv; varying vec3 vCol; varying float vOp;
    #include <fog_pars_vertex>
    void main(){ vUv=uv; vCol=iCol; vOp=iOp;
      vec4 mvPosition=modelViewMatrix*vec4(iPos,1.0); mvPosition.xy+=position.xy*iSize;
      float d=-mvPosition.z; vOp*=clamp((d-.4)/(iSize*.55+.6),0.,1.);          // adentro de la nube: se desvanece (menos sobrepintado)
      gl_Position=projectionMatrix*mvPosition;
      #include <fog_vertex>
    }`;
  const FS=`uniform sampler2D map; varying vec2 vUv; varying vec3 vCol; varying float vOp;
    #include <common>
    #include <fog_pars_fragment>
    void main(){ vec4 t=texture2D(map,vUv); gl_FragColor=vec4(vCol,t.a*vOp); if(gl_FragColor.a<.004) discard;
      gl_FragColor=linearToOutputTexel(gl_FragColor);
      #include <fog_fragment>
    }`;
  function mkLayer(add){ const base=new THREE.PlaneGeometry(1,1), g=new THREE.InstancedBufferGeometry();
    g.setIndex(base.index); g.setAttribute('position',base.attributes.position); g.setAttribute('uv',base.attributes.uv);
    const A={pos:new THREE.InstancedBufferAttribute(new Float32Array(MAXP*3),3),size:new THREE.InstancedBufferAttribute(new Float32Array(MAXP),1),
      col:new THREE.InstancedBufferAttribute(new Float32Array(MAXP*3),3),op:new THREE.InstancedBufferAttribute(new Float32Array(MAXP),1)};
    for(const k in A) A[k].setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('iPos',A.pos); g.setAttribute('iSize',A.size); g.setAttribute('iCol',A.col); g.setAttribute('iOp',A.op); g.instanceCount=0;
    const m=new THREE.ShaderMaterial({uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{map:{value:smokeTex}}]),vertexShader:VS,fragmentShader:FS,
      transparent:true,depthWrite:false,fog:true,blending:add?THREE.AdditiveBlending:THREE.NormalBlending});
    m.uniforms.map.value=smokeTex;
    const mesh=new THREE.Mesh(g,m); mesh.frustumCulled=false; mesh.renderOrder=add?3:2; mesh.userData.fxBatch=1;
    return {mesh,g,A,list:[]}; }
  const L=[mkLayer(false),mkLayer(true)];
  const _c=new THREE.Color();
  function attach(){ for(const l of L) if(l.mesh.parent!==scene) scene.add(l.mesh); if(DB.root.parent!==scene) scene.add(DB.root); if(TR.mesh.parent!==scene) scene.add(TR.mesh); }
  puff=function(p,color,size,life,vy=1.5,op=.7,additive=false){ attach(); const l=L[additive?ADD:NRM];
    if(l.list.length>=MAXP){ let k=0,mn=1e9; for(let i=0;i<l.list.length;i++){ const r=l.list[i].life/l.list[i].max; if(r<mn){ mn=r; k=i; } } l.list.splice(k,1); }   // lleno: sale la que estaba por apagarse
    _c.set(color); l.list.push({x:p.x,y:p.y,z:p.z,s:size,grow:size*.9,life,max:life,vy,op,r:_c.r,g:_c.g,b:_c.b,d:0}); };
  const _cp=new THREE.Vector3();
  function updParts(dt){ _cp.copy(camera.position);
    for(let li=0;li<2;li++){ const l=L[li], P=l.list;
      for(let i=P.length-1;i>=0;i--){ const q=P[i]; q.life-=dt; if(q.life<=0){ P[i]=P[P.length-1]; P.pop(); continue; }
        q.y+=q.vy*dt; q.s+=q.grow*dt; if(li===NRM){ const dx=q.x-_cp.x, dy=q.y-_cp.y, dz=q.z-_cp.z; q.d=dx*dx+dy*dy+dz*dz; } }
      if(li===NRM&&P.length>1) P.sort((a,b)=>b.d-a.d);                             // de atrás para adelante, como hacía three con los sprites
      const A=l.A, n=P.length;
      for(let i=0;i<n;i++){ const q=P[i]; A.pos.array[i*3]=q.x; A.pos.array[i*3+1]=q.y; A.pos.array[i*3+2]=q.z; A.size.array[i]=q.s;
        A.col.array[i*3]=q.r; A.col.array[i*3+1]=q.g; A.col.array[i*3+2]=q.b; A.op.array[i]=q.op*q.life/q.max; }
      l.g.instanceCount=n; if(n){ for(const k in A){ A[k].needsUpdate=true; A[k].updateRange.offset=0; A[k].updateRange.count=n*A[k].itemSize; } }
      l.mesh.visible=n>0; } }
  // ---- esquirlas: una malla instanciada por material ----
  const DMAX=500, DB={root:new THREE.Group(),by:new Map()}; const _m4=new THREE.Matrix4(), _q=new THREE.Quaternion(), _s=new THREE.Vector3(), _p=new THREE.Vector3();
  function dPool(mat){ let P=DB.by.get(mat); if(P) return P; const im=new THREE.InstancedMesh(sGeo,mat,DMAX); im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.count=0; im.frustumCulled=false;
    DB.root.add(im); P={im,list:[]}; DB.by.set(mat,P); return P; }
  debris=function(p,n,mat,spd,scale=1){ attach(); const P=dPool(mat);
    for(let i=0;i<n;i++){ if(P.list.length>=DMAX) P.list.shift();
      P.list.push({x:p.x,y:p.y,z:p.z,vx:rand(-1,1)*spd,vy:rand(.5,2)*spd,vz:rand(-1,1)*spd,life:rand(.3,.8),s:scale}); } };
  function updDebris(dt){ for(const P of DB.by.values()){ const Lr=P.list;
      for(let i=Lr.length-1;i>=0;i--){ const d=Lr[i]; d.life-=dt; if(d.life<=0){ Lr[i]=Lr[Lr.length-1]; Lr.pop(); continue; } d.vy-=12*dt; d.x+=d.vx*dt; d.y+=d.vy*dt; d.z+=d.vz*dt; }
      for(let i=0;i<Lr.length;i++){ const d=Lr[i]; _m4.compose(_p.set(d.x,d.y,d.z),_q,_s.set(d.s,d.s,d.s)); P.im.setMatrixAt(i,_m4); }
      P.im.count=Lr.length; if(Lr.length) P.im.instanceMatrix.needsUpdate=true; } }
  // ---- trazadoras: segmentos en un solo búfer ----
  const TMAX=600, TR={list:[]};
  { const g=new THREE.BufferGeometry(), pos=new Float32Array(TMAX*6), col=new Float32Array(TMAX*8);
    g.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage)); g.setAttribute('color',new THREE.BufferAttribute(col,4).setUsage(THREE.DynamicDrawUsage)); g.setDrawRange(0,0);
    const m=new THREE.ShaderMaterial({uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog]),fog:true,transparent:true,depthWrite:false,
      vertexShader:`attribute vec4 color; varying vec4 vC;
        #include <fog_pars_vertex>
        void main(){ vC=color; vec4 mvPosition=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*mvPosition;
        #include <fog_vertex>
        }`,
      fragmentShader:`varying vec4 vC;
        #include <common>
        #include <fog_pars_fragment>
        void main(){ gl_FragColor=linearToOutputTexel(vC);
        #include <fog_fragment>
        }`});
    TR.mesh=new THREE.LineSegments(g,m); TR.mesh.frustumCulled=false; TR.g=g; }
  tracer=function(a,b,color){ attach(); if(TR.list.length>=TMAX) TR.list.shift(); _c.set(color); TR.list.push({a:a.clone(),b:b.clone(),r:_c.r,g:_c.g,bl:_c.b,life:.06,max:.06}); };
  function updTracers(dt){ const Lr=TR.list; for(let i=Lr.length-1;i>=0;i--){ Lr[i].life-=dt; if(Lr[i].life<=0) Lr.splice(i,1); }
    const P=TR.g.attributes.position.array, C=TR.g.attributes.color.array;
    for(let i=0;i<Lr.length;i++){ const t=Lr[i], o=i*6, c=i*8, al=Math.max(0,t.life/t.max)*.85;
      P[o]=t.a.x; P[o+1]=t.a.y; P[o+2]=t.a.z; P[o+3]=t.b.x; P[o+4]=t.b.y; P[o+5]=t.b.z;
      C[c]=C[c+4]=t.r; C[c+1]=C[c+5]=t.g; C[c+2]=C[c+6]=t.bl; C[c+3]=C[c+7]=al; }
    TR.g.setDrawRange(0,Lr.length*2); if(Lr.length){ TR.g.attributes.position.needsUpdate=true; TR.g.attributes.color.needsUpdate=true; } TR.mesh.visible=Lr.length>0; }
  // ---- cada cuadro, junto con los demás efectos ----
  // Además: un cráter por cuadro (craterTick, 03-mapas.js) y, al empezar cada batalla, se compilan de una los materiales de los
  // efectos (antes el primer humo o la primera explosión compilaban su sombreador en plena pelea: tirón de una fracción de segundo).
  let warm=null;
  function prewarm(){ if(state!=='play'||warm===builtKey) return; warm=builtKey; attach();
    const vis=[]; for(const l of L){ vis.push(l.mesh.visible); l.mesh.visible=true; } const tv=TR.mesh.visible; TR.mesh.visible=true;
    try{ renderer.compile(scene,camera); }catch(e){} L.forEach((l,i)=>l.mesh.visible=vis[i]); TR.mesh.visible=tv; }
  const _uf=updateFx; updateFx=function(dt){ _uf.apply(this,arguments); try{ updParts(dt); updDebris(dt); updTracers(dt); if(typeof craterTick==='function') craterTick(); prewarm(); }catch(e){ console.warn('partículas',e); } };
  // al salir de la batalla no queda nada colgado
  if(typeof clearBattle==='function'){ const _cb=clearBattle; clearBattle=function(){ warm=null; if(typeof craterQ!=='undefined') craterQ.length=0; for(const l of L) l.list.length=0; for(const P of DB.by.values()) P.list.length=0; TR.list.length=0; return _cb.apply(this,arguments); }; }
  window.fxStats=()=>({humo:L[0].list.length,fogonazos:L[1].list.length,esquirlas:[...DB.by.values()].reduce((a,P)=>a+P.list.length,0),trazadoras:TR.list.length});
})();
