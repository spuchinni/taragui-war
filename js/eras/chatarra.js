// chatarra.js — autos quemados y oxidados (pedido de Sebastián, referencia "Destroyed cars" de scanthewar en Sketchfab; hecho por código)
// 1) Todo auto destruido (vWreckLook) queda quemado de verdad: chapa abollada, techo hundido, sin vidrios, óxido, hollín y ceniza
//    (recién quemado = más hollín; los viejos = más óxido). Apoyado sobre las llantas (las cubiertas se queman).
// 2) Av. Independencia (Carrefour): autos quemados a lo largo de la avenida, una barricada en el punto B
//    y un cementerio de autos amontonados en el estacionamiento del Carrefour (como el modelo).
//    Ids fijos (9e5+) => la pose (volcado, de costado, uno arriba de otro) sale del id, igual en anfitrión e invitados.
// 3) Un tanque en marcha que pasa por arriba de un auto quemado lo aplasta (cada PC con los tanques que ve).
(()=>{
  const sootGlass=new THREE.MeshBasicMaterial({color:0x0b0a09,transparent:true,opacity:.3,depthWrite:false});
  const rustDoor=new THREE.MeshLambertMaterial({color:0x6a3a1e});
  // material compartido de la chapa quemada: manchas de óxido, hollín y ceniza calculadas en el shader
  // (los autos son de pocos vértices: con colores por vértice solo no se ven manchas)
  const burntMat=new THREE.MeshLambertMaterial({vertexColors:true}), DUMMY=new THREE.MeshLambertMaterial();
  burntMat.onBeforeCompile=sh=>{
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vBP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvBP=position+vec3(modelMatrix[3].x*.37,0.,modelMatrix[3].z*.29);');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vBP;
float h3(vec3 p){ p=fract(p*.3183099+.1); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fb(vec3 p){ return vn(p)*.55+vn(p*2.13)*.28+vn(p*4.7)*.17; }`).replace('#include <color_fragment>',`#include <color_fragment>
{ float n=fb(vBP*2.6), m=fb(vBP*4.8+11.), k=vn(vBP*22.);
  diffuseColor.rgb*=.62+.75*n+.18*(k-.5);
  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.06,.05,.045),smoothstep(.44,.26,m)*.75);
  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.42,.4,.37),smoothstep(.62,.78,m)*smoothstep(.55,1.2,vBP.y)*.75); }`); };
  const hashR=n=>mulberry(((n|0)*2654435761)>>>0);
  const nz=(x,y,z,s)=>Math.sin(x*1.7+s)*Math.sin(y*2.3+s*1.3)*Math.sin(z*1.9+s*.7)+.5*Math.sin(x*4.1+z*3.3+s*2);
  const col=new THREE.Color(), tmp=new THREE.Color(), orig=new THREE.Color();
  const RUST_A=new THREE.Color(0x3e1e0e), RUST_B=new THREE.Color(0x8c4a22), ASH=new THREE.Color(0x77706a), SOOT=new THREE.Color(0x1c1916), UNDER=new THREE.Color(0x15120f);
  const isCart=V=>!V||V.noMotor||V.k==='bike'||V.k==='cart'||V.k==='carreta';

  function burn(C,cause){ const g=C.g, u=g.userData; if(!g||u._burnt) return; u._burnt=1;
    // cuánto se hunde el techo según qué lo destruyó: pisado por un tanque o los viejos de la avenida sí; a los tiros o volado, apenas abollado
    const R=hashR(C.id), old=C.id>=9e5, crushed=cause==='crush'||old, crush=crushed?.08+R()*.28+(old?.08:0):0, dent=cause==='he'?1.6:crushed?1:.7, seed=R()*10, rust=old?.85:.25;
    g.updateMatrixWorld(true); const box=new THREE.Box3().setFromObject(g); u._h=box.max.y-g.position.y; u._w=box.max.x-box.min.x;
    g.traverse(o=>{ if(!o.isMesh) return;
      if(o.material===glassMat){ o.material=sootGlass; o.castShadow=false; return; }
      if(u.riders&&u.riders.some(r=>{ let p=o; while(p){ if(p===r.g) return true; p=p.parent; } return false; })) return;
      const geo=o.geometry; if(!geo||!geo.attributes||!geo.attributes.position) return;
      if(!(o.material&&o.material.vertexColors)){ o.material=rustDoor; return; }
      if(geo.userData&&geo.userData._shared) return;
      const P=geo.attributes.position, CA=geo.attributes.color; geo.computeBoundingBox(); const bb=geo.boundingBox, H=(bb.max.y-bb.min.y)||1;
      for(let i=0;i<P.count;i++){ let x=P.getX(i), y=P.getY(i), z=P.getZ(i); const t=(y-bb.min.y)/H;
        if(t>.7) y-=crush*((t-.7)/.3)*H*.55*(.65+.35*Math.sin(x*2.3+z*1.1+seed));      // techo hundido
        const n=nz(x,y,z,seed)*dent; x+=n*.045; y+=n*.025; z+=nz(z,x,y,seed+3)*.045*dent;          // abolladuras
        P.setXYZ(i,x,y,z);
        if(!CA) continue; orig.fromBufferAttribute(CA,i);
        const r=nz(x*4.3,y*4.3,z*4.3,seed+5)+.45*nz(x*11,y*11,z*11,seed+2), r2=nz(x*6.5,y*6.5,z*6.5,seed+9), r3=nz(x*2,y*2,z*2,seed+1);
        if(t<.22) col.copy(UNDER).lerp(RUST_A,.3*rust);
        else { col.copy(RUST_A).lerp(RUST_B,Math.max(0,Math.min(1,.45+.55*r))); col.lerp(SOOT,(1-rust)*.85);
          if(r<-.15) col.lerp(SOOT,Math.min(.9,(-.15-r)*1.6));                              // hollín
          if(t>.55&&r2>.25) col.lerp(ASH,Math.min(.8,(r2-.25)*1.8));                        // ceniza arriba
          if(r3>.75&&t<.65) col.lerp(tmp.copy(orig).multiplyScalar(.45),.65);                // restos de pintura
          col.multiplyScalar(.7+.3*t); }
        CA.setXYZ(i,col.r,col.g,col.b); }
      P.needsUpdate=true; if(CA) CA.needsUpdate=true; geo.computeVertexNormals(); geo.computeBoundingSphere(); });
    g.traverse(o=>{ if(o.isMesh&&o.material&&o.material.vertexColors&&!o.isSkinnedMesh&&(u.mats||[]).includes(o.material)) o.material=burntMat; });
    u.mats=[DUMMY]; u.m=DUMMY;   // lo que pinte después el núcleo (vWreckLook, golpes) no toca el material compartido
  }

  // a los tiros (ametralladora): queda con su pintura, vidrios rotos y agujeros; a veces se prende fuego a los segundos y recién ahí se quema
  const holeMat=new THREE.MeshBasicMaterial({color:0x0c0b0a}), holeGeo=new THREE.CircleGeometry(.045,6);
  function riddle(C){ const g=C.g, u=g.userData, R=hashR(C.id+3); if(u._riddled) return; u._riddled=1;
    g.traverse(o=>{ if(o.isMesh&&o.material===glassMat){ o.material=sootGlass; } });
    g.updateMatrixWorld(true); const box=new THREE.Box3().setFromObject(g), inv=new THREE.Matrix4().copy(g.matrixWorld).invert(), L=(box.max.x-box.min.x+box.max.z-box.min.z)/2;
    const hs=new THREE.InstancedMesh(holeGeo,holeMat,18), m=new THREE.Matrix4(), q=new THREE.Quaternion(), ray=new THREE.Raycaster(), meshes=[]; g.traverse(o=>{ if(o.isMesh&&o.material!==sootGlass) meshes.push(o); });
    let n=0; for(let k=0;k<40&&n<18;k++){ const a=R()*6.28, y=box.min.y+(box.max.y-box.min.y)*(.25+R()*.55), c=box.getCenter(new THREE.Vector3()), o=new THREE.Vector3(c.x+Math.cos(a)*L*2,y,c.z+Math.sin(a)*L*2);
      ray.set(o,new THREE.Vector3(c.x-o.x,0,c.z-o.z).normalize()); const h=ray.intersectObjects(meshes,false)[0]; if(!h||!h.face) continue;
      const nw=h.face.normal.clone().transformDirection(h.object.matrixWorld), p=h.point.clone().addScaledVector(nw,.012).applyMatrix4(inv);
      q.setFromUnitVectors(new THREE.Vector3(0,0,1),nw.clone().transformDirection(inv)); m.compose(p,q,new THREE.Vector3(1,1,1).multiplyScalar(.7+R()*.8)); hs.setMatrixAt(n++,m); }
    hs.count=n; hs.instanceMatrix.needsUpdate=true; g.add(hs); }
  const _vw=vWreckLook;
  vWreckLook=function(C){ const u=C.g&&C.g.userData; if(!u||isCart(u.V)) return _vw.apply(this,arguments);
    const cause=C._cause||(C.id>=9e5?'old':'he'), cols=(u.mats||[u.m]).map(m=>m&&m.color&&m.color.getHex());
    const r=_vw.apply(this,arguments);
    try{ if(cause==='mg'&&!C._fire){ (u.mats||[u.m]).forEach((m,i)=>{ if(m&&m.color&&cols[i]!=null) m.color.setHex(cols[i]); }); C.g.scale.y=1; riddle(C);
          const R=hashR(C.id+9); C.burn=0; if(R()<.45) C._fireAt=now+2+R()*6; return r; }       // a veces se prende fuego
        burn(C,cause); C.g.scale.y=1;
        if(cause==='he'&&!C._pose){ const R=hashR(C.id+21), q=R(); if(q<.4){ const h=u._h||1.45, w=u._w||1.8, side=R()<.55;   // la onda lo levanta: cae de costado o volcado
            const b=C._blast, away=b?Math.atan2(C.x-b.x,C.z-b.z):R()*6.28; C._pose=side?{dy:w*.48,rx:0,rz:1.5*(R()<.5?1:-1)}:{dy:h*.86,rx:(R()-.5)*.1,rz:Math.PI};
            C._jump={t:0,vy:3+R()*4,T:.9,dx:Math.sin(away)*(1+R()*2),dz:Math.cos(away)*(1+R()*2)}; } }
    }catch(e){ console.warn('chatarra',e); } return r; };

  // ---- pose de los autos ubicados (sale del id) ----
  // pila del Carrefour: [dx, dz, giro, pose, arriba] en metros respecto del centro; pose 0 llantas, 1 de costado, 2 volcado, 3 de punta
  const PILE=[[-2.5,0,.08,0,0],[0,.3,-.06,2,0],[2.6,-.2,3.1,0,0],[-1.25,.1,.25,0,1],[-2.7,5.4,-.1,0,0],[.1,5.6,3.2,0,0],[2.8,5.3,.12,2,0],[1.4,5.5,-.2,0,1],[-1.6,10.6,1.5,1,0],[1.6,10.8,.3,0,0],[5.6,2.6,1.62,3,0],[-5.4,8.4,1.4,0,0]];
  function poseOf(C){ const u=C.g.userData, R=hashR(C.id+77), h=u._h||1.45, w=u._w||1.8, p={dy:-.13,rx:(R()-.5)*.06,rz:(R()-.5)*.08};
    let k=0, up=0; if(C.id>=910000){ const s=PILE[(C.id-910000)%PILE.length]; k=s[3]; up=s[4]; }
    else { const q=R(); k=q<.72?0:q<.86?3:q<.95?1:2; }
    if(k===1){ p.rz=1.5; p.dy=w*.48; } else if(k===2){ p.rz=Math.PI+(R()-.5)*.1; p.dy=h*.86; } else if(k===3){ p.rx=.16+R()*.1; p.dy=-.05; }
    if(up){ p.dy+=1.05; p.rx+=(R()-.5)*.25; p.rz+=(R()-.5)*.3; } return p; }
  const _ut=updateTraffic;
  updateTraffic=function(dt){ const r=_ut.apply(this,arguments);
    for(const C of traffic){ if(C.state!==3) continue; const u=C.g.userData; if(!u||isCart(u.V)) continue;
      if(!C._flat) for(const t of tanks){ if(t.dead||!t.pos||Math.abs(t.speed||0)<1) continue; if(Math.hypot(C.x-t.pos.x,C.z-t.pos.z)<(t.R||3)+1.2){ C._flat=1; C.burn=0;
          debris(new THREE.Vector3(C.x,heightAt(C.x,C.z)+.6,C.z),8,rustDoor,3,1); puff(new THREE.Vector3(C.x,heightAt(C.x,C.z)+.5,C.z),0x6a5e50,3,1.2,1.4,.5); break; } }
      if(C._fireAt&&now>C._fireAt&&!C._flat){ C._fireAt=0; C._fire=1; u._burnt=0; const k=C._cause; C._cause='ap'; burn(C,'ap'); C._cause=k; C.burn=now+25;   // se prendió fuego
        for(let i=0;i<4;i++) puff(new THREE.Vector3(C.x+rand(-1,1),heightAt(C.x,C.z)+rand(.5,1.5),C.z+rand(-1,1)),0xff8a30,rand(2,3),.6,1,1,true); }
      if(C.id<9e5&&!C._flat&&!C._pose) continue;
      const p=C._pose||(C._pose=C.id>=9e5?poseOf(C):{dy:-.1,rx:0,rz:0});
      let k=1, jy=0; if(C._jump&&!C._flat){ const J=C._jump; J.t+=dt; k=Math.min(1,J.t/J.T); jy=Math.max(0,J.vy*J.t-4.9*J.t*J.t); if(k<1){ C.x+=J.dx*dt/J.T; C.z+=J.dz*dt/J.T; } else C._jump=null; }
      C.g.rotation.order='YXZ'; C.g.position.set(C.x,heightAt(C.x,C.z)+(C._flat?Math.min(p.dy,.05)*.4:p.dy*k+jy),C.z);
      C.g.rotation.set(C._flat?0:p.rx*k,C.h,C._flat?(Math.abs(p.rz)>2?Math.PI:0):p.rz*k); C.g.scale.y=C._flat?.38:1; }
    return r; };

  // ---- Av. Independencia (Carrefour) ----
  const KEYS=['sedan','hatch','falcon','fiat600','pickup','c10','suv','taxi','cupe','sedan','falcon','c10'];
  const idxOf=k=>VTYPES.findIndex(v=>v.k===k);
  const cfg=OSM_CFG.carrefour;
  if(cfg){ const ex=cfg.extra;
    cfg.extra=o=>{ if(ex) ex(o); try{ plan(o); }catch(e){ console.warn('chatarra plan',e); } }; }
  function plan(o){ const R=mulberry(4711), rr=(a,b)=>a+R()*(b-a), out=[];
    const inPlay=(x,z,m)=>Math.abs(x)<W.bx-m&&Math.abs(z)<W.bz-m;
    // a lo largo de la avenida
    const av=o.roads.filter(L=>/Independencia/.test(L.name)&&!L.br);
    for(const L of av) for(let i=0;i<L.pts.length-1;i++){ const A=L.pts[i], B=L.pts[i+1], Ls=Math.hypot(B[0]-A[0],B[1]-A[1]); if(Ls<8) continue; const ux=(B[0]-A[0])/Ls, uz=(B[1]-A[1])/Ls;
      for(let s=rr(6,40); s<Ls-4; s+=rr(55,120)){ const sd=R()<.5?1:-1, off=R()<.2?rr(-1,1):sd*(L.w/2-1.4), x=A[0]+ux*s-uz*off, z=A[1]+uz*s+ux*off;
        if(!inPlay(x,z,40)) continue; if(out.some(q=>Math.hypot(q.x-x,q.z-z)<30)) continue;
        out.push({x,z,h:Math.atan2(ux,uz)+(R()<.5?0:Math.PI)+rr(-.45,.45),t:'av'}); } }
    out.sort(()=>R()-.5); out.length=Math.min(out.length,16);
    // barricada en el punto B (autos atravesados)
    const zb=(cfg.zones||[]).find(z=>z.id==='B'); if(zb&&av.length){ let best=null;
      for(const L of av) for(let i=0;i<L.pts.length-1;i++){ const A=L.pts[i], B=L.pts[i+1], Ls=Math.hypot(B[0]-A[0],B[1]-A[1]); if(Ls<1) continue; const ux=(B[0]-A[0])/Ls, uz=(B[1]-A[1])/Ls;
        const s=Math.max(0,Math.min(Ls,(zb.x-A[0])*ux+(zb.z-A[1])*uz)), px=A[0]+ux*s, pz=A[1]+uz*s, d=Math.hypot(px-zb.x,pz-zb.z); if(!best||d<best.d) best={d,px,pz,ux,uz,w:L.w}; }
      if(best&&best.d<60){ const c=best, base=Math.atan2(c.ux,c.uz)+Math.PI/2, back=zb.r+6;
        [[-3.2,0],[0,.6],[3.4,-.3]].forEach(([l,f],n)=>{ const x=c.px+c.ux*(back+f)-c.uz*l, z=c.pz+c.uz*(back+f)+c.ux*l; out.push({x,z,h:base+rr(-.3,.3),t:'bar'}); }); } }
    // cementerio de autos en el estacionamiento del Carrefour
    let cx=null, cz=null; const ref={x:432.8,z:106.5}, za=(cfg.zones||[]).find(z=>z.id==='A');
    for(let k=0;k<400&&cx==null;k++){ const a=R()*Math.PI*2, d=8+k*.18, x=(za?(za.x+ref.x)/2:ref.x)+Math.cos(a)*d, z=(za?(za.z+ref.z)/2:ref.z)+Math.sin(a)*d;
      if(za&&Math.hypot(x-za.x,z-za.z)<za.r+4) continue;
      const pk=o.kindAt(x,z)==='estacionamiento'||k>200; if(!pk||o.roadAt(x,z)) continue;
      if([[0,0],[6,0],[-6,0],[0,9],[6,9],[-6,9]].every(([a2,b2])=>freeSpot(x+a2,z+b2,3)&&!o.roadAt(x+a2,z+b2))){ cx=x; cz=z; } }
    if(cx!=null) PILE.forEach((s,n)=>out.push({x:cx+s[0],z:cz+s[1],h:s[2],t:'pile',n}));
    W._chatarra=out; }

  function spawnWrecks(){ const L=W._chatarra; if(!L||!L.length) return; let n=0;
    const types=KEYS.map(idxOf).filter(i=>i>=0); if(!types.length) return; const bus=idxOf('colectivo');
    for(const q of L){ if(q.t!=='pile'&&!freeSpot(q.x,q.z,1.8)) continue;
      const id=q.t==='pile'?910000+q.n:900000+(n++); if(traffic.some(c=>c.id===id)) continue;
      const ti=(q.t==='av'&&n===3&&bus>=0)?bus:types[(id*7)%types.length], ci=(ti<<4)|((id*5)&15), g=carMesh(ci); scene.add(g);
      const C={id,g,S:null,dir:1,k:0,v:0,vmax:0,state:3,ci,x:q.x,z:q.z,h:q.h,len:g.userData.len,V:VTYPES[ti]};
      (g.userData.riders||[]).forEach(r=>r.g.visible=false); vWreckLook(C); C.burn=(id===900001)?now+1e6:0; traffic.push(C); } }
  const _ir=initRefuerzos;
  initRefuerzos=function(){ const r=_ir.apply(this,arguments); try{ if(!net.guest&&W===WORLDS.carrefour) spawnWrecks(); }catch(e){ console.warn('chatarra',e); } return r; };
  window.chatarraInfo=()=>({plan:(W._chatarra||[]).length,autos:traffic.filter(c=>c.id>=9e5).length});
})();
