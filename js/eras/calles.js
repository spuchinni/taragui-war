// Calles con vida (pedido de Sebastián con modelos de alumbrado e hidrantes de Sketchfab como referencia, hecho por código):
// en los mapas de las épocas 1–3 (generador de frentes) no había ningún objeto de calle. Ahora:
//  · faroles a gas de hierro fundido en las ciudades (a los dos lados de cada calle) y en los pueblos, sobre el camino;
//  · postes del telégrafo de madera con crucetas, aisladores y cables con comba a lo largo de los caminos de campo
//    (en la tierra de nadie casi todos rotos o caídos, y si se cae un poste se caen sus cables);
//  · bocas de incendio en las esquinas (Entreguerras y 2ª Guerra), columnas de avisos (Litfaßsäule) en las ciudades europeas
//    y bancos de plaza con faroles alrededor de las plazas y parques.
// Con oscurecimiento de guerra: en las épocas 1–3 los faroles no se prenden de noche. En la Guerra Fría (mapas de OSM) el
// poste genérico pasa a ser una columna de hormigón con brazo curvo y luminaria de vapor de mercurio que se prende de noche.
// Todo instanciado (una llamada de dibujo por tipo de pieza) y usa el sistema de props del núcleo: los tanques y las
// explosiones los voltean (knockProp).
(function(){
  const CAST=new THREE.MeshStandardMaterial({color:0x23271f,roughness:.55,metalness:.55});
  const GLASS=new THREE.MeshStandardMaterial({color:0xcfc7a0,roughness:.1,metalness:.2,emissive:0x000000,transparent:true,opacity:.82});
  const WOOD=new THREE.MeshLambertMaterial({color:0x5b4a38});
  const PORC=new THREE.MeshStandardMaterial({color:0xe6e2d6,roughness:.3});
  const HYD=new THREE.MeshStandardMaterial({color:0x8e2c22,roughness:.6,metalness:.3});
  const BENCH=new THREE.MeshLambertMaterial({color:0x6e5434});
  const WIRE=new THREE.LineBasicMaterial({color:0x1c1c1c,transparent:true,opacity:.7});
  // los cables se desvanecen entre 60 y 110 m: de lejos el poste (fino) deja de verse pero la línea siempre ocupa un píxel y parecía flotar (pedido de Sebastián)
  WIRE.onBeforeCompile=sh=>{ sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vWD;').replace('#include <project_vertex>','#include <project_vertex>\nvWD=-mvPosition.z;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vWD;').replace('#include <fog_fragment>','#include <fog_fragment>\ngl_FragColor.a*=1.0-smoothstep(60.0,110.0,vWD);'); };
  const merge=a=>THREE.BufferGeometryUtils.mergeBufferGeometries(a.map(g=>g.index?g.toNonIndexed():g));
  const cy=(r0,r1,h,y,s=8)=>{ const g=new THREE.CylinderGeometry(r0,r1,h,s); g.translate(0,y+h/2,0); return g; };
  const bx=(w,h,d,x,y,z)=>new THREE.BoxGeometry(w,h,d).translate(x,y,z);
  // ---- geometrías ----
  // farol a gas: base con molduras, columna acanalada que se afina, travesaño para la escalera del farolero, cuello, sombrerete con remate
  const gasPost=merge([cy(.24,.27,.14,0),cy(.17,.22,.42,.14,8),cy(.12,.15,.12,.56,8),cy(.065,.1,2.75,.68,8),cy(.1,.08,.1,3.43,8),
    bx(.62,.04,.04,0,3.18,0),cy(.035,.035,.08,3.53,6),cy(.02,.2,.16,4.03,4).rotateY(Math.PI/4),cy(.0,.03,.2,4.19,6),cy(.03,.03,.05,4.0,6)]);
  const gasGlass=cy(.2,.13,.48,3.55,4).rotateY(Math.PI/4);
  // poste del telégrafo: palo de 7,5 m con dos crucetas, riostras y aisladores
  // (segunda versión, con las referencias de Sketchfab que pasó Sebastián: palo más grueso y torneado con la punta biselada, crucetas con
  //  pernos y riostras en V, escalones de hierro para trepar, aisladores de campana sobre su perno de madera)
  const STEPS=[]; for(let i=0;i<9;i++){ const y=2.4+i*.48, sd=i%2?1:-1; STEPS.push(cy(.016,.016,.26,0,4).rotateZ(Math.PI/2).translate(sd*.2,y,0)); }
  const telePole=merge([cy(.12,.16,7.55,-.4,8),cy(.0,.12,.16,7.15,8),cy(.17,.19,.5,-.05,8),                       // palo, punta biselada, base embreada
    bx(1.75,.1,.11,0,6.95,0),bx(1.35,.09,.1,0,6.35,0),                                                           // crucetas
    bx(.035,.62,.03,.3,6.62,.07).rotateZ(-.62),bx(.035,.62,.03,-.3,6.62,.07).rotateZ(.62),                        // riostras de hierro en V
    bx(.035,.55,.03,.25,6.07,.06).rotateZ(-.62),bx(.035,.55,.03,-.25,6.07,.06).rotateZ(.62),
    cy(.02,.02,.3,0,4).rotateX(Math.PI/2).translate(0,6.95,0),cy(.02,.02,.3,0,4).rotateX(Math.PI/2).translate(0,6.35,0)].concat(STEPS));   // pernos y escalones
  const INS=[[-.75,7.0],[-.32,7.0],[.32,7.0],[.75,7.0],[-.55,6.4],[.55,6.4]];
  const teleIns=merge(INS.flatMap(([x,y])=>[cy(.018,.018,.08,y-.02,5).translate(x,0,0),cy(.06,.04,.06,y+.03,8).translate(x,0,0),cy(.04,.025,.06,y+.08,8).translate(x,0,0)]));   // perno, campana y cabeza
  const hydrant=merge([cy(.16,.18,.08,0,8),cy(.12,.12,.62,.08,8),cy(.15,.15,.06,.5,8),new THREE.SphereGeometry(.12,8,5,0,Math.PI*2,0,Math.PI/2).translate(0,.7,0),cy(.03,.03,.05,.82,6),
    cy(.05,.05,.12,0,6).rotateZ(Math.PI/2).translate(.17,.42,0),cy(.05,.05,.12,0,6).rotateZ(Math.PI/2).translate(-.05,.42,0)]);
  const columnBody=cy(.62,.62,2.7,.25,14), columnTop=merge([cy(.68,.68,.25,0,14),cy(.7,.64,.14,2.95,14),cy(.66,.12,.5,3.09,14),cy(.05,.0,.3,3.59,6)]);
  const benchWood=merge([0,1,2].map(i=>bx(1.8,.04,.11,0,.44,-.12+i*.13)).concat([0,1].map(i=>bx(1.8,.1,.04,0,.62+i*.16,.17).rotateX(-.18))));
  const benchIron=merge([-.75,.75].map(x=>merge([bx(.06,.44,.42,x,.22,0),bx(.06,.45,.05,x,.62,.2)])));
  const posterTex=(()=>{ const c=document.createElement('canvas'); c.width=256; c.height=128; const x=c.getContext('2d'); x.fillStyle='#cfc4a6'; x.fillRect(0,0,256,128);
    const cols=['#e8dcc0','#b33a2a','#2b2b2b','#d8b25a','#f0ead8','#4a6a8a','#8a3a2a','#c9c0a8'];
    for(let i=0;i<34;i++){ const w=18+Math.random()*48, h=22+Math.random()*50; x.fillStyle=cols[(Math.random()*cols.length)|0]; const X=Math.random()*256, Y=Math.random()*128; x.fillRect(X,Y,w,h); x.fillRect(X-256,Y,w,h);
      x.fillStyle='rgba(30,25,20,.55)'; for(let k=0;k<4;k++) x.fillRect(X+4,Y+6+k*9,w*(.3+Math.random()*.6),3); }
    const t=new THREE.CanvasTexture(c); t.wrapS=THREE.RepeatWrapping; return t; })();
  const POSTER=new THREE.MeshLambertMaterial({map:posterTex});
  // ---- Guerra Fría: columna de hormigón con brazo curvo y luminaria (vapor de mercurio) ----
  const coldPost=(()=>{ const parts=[cy(.13,.19,8.6,0,8)];
    // brazo: un arco de 4 tramos desde la punta del poste hacia la calle
    const P=[[0,8.4],[.35,8.85],[.9,9.05],[1.6,9.1],[2.2,9.05]]; for(let i=0;i<P.length-1;i++){ const [x0,y0]=P[i], [x1,y1]=P[i+1], L=Math.hypot(x1-x0,y1-y0), g=new THREE.CylinderGeometry(.05,.06,L,6);
      g.rotateZ(-Math.atan2(x1-x0,y1-y0)); g.translate((x0+x1)/2,(y0+y1)/2,0); parts.push(g); }
    return merge(parts).rotateY(-Math.PI/2); })();
  const coldHead=merge([new THREE.SphereGeometry(.32,10,6,0,Math.PI*2,0,Math.PI/2).scale(1.5,.5,.8).translate(0,9.0,2.45)]);
  const coldLens=new THREE.CircleGeometry(.24,10).rotateX(Math.PI/2).scale(1.4,1,.75).translate(0,8.98,2.45);
  const COLD=new THREE.MeshStandardMaterial({color:0x8d8b84,roughness:.85});
  const HEAD=new THREE.MeshStandardMaterial({color:0x5c6266,roughness:.5,metalness:.5});
  const LENS=new THREE.MeshStandardMaterial({color:0xd8dcd6,roughness:.2,emissive:0x000000,side:THREE.DoubleSide});

  const mkIM=(geo,mat,n,shadow=true)=>{ const im=new THREE.InstancedMesh(geo,mat,Math.max(1,n)); im.count=n; im.castShadow=shadow; im.receiveShadow=true; im.frustumCulled=false; worldGroup.add(im); return im; };
  const segD=(x,z,S)=>{ const dx=S.bx-S.ax, dz=S.bz-S.az, l=dx*dx+dz*dz; let t=l?((x-S.ax)*dx+(z-S.az)*dz)/l:0; t=clamp(t,0,1); return Math.hypot(x-S.ax-dx*t,z-S.az-dz*t); };
  let wireGeo=null;

  // las piezas propias (P.ims) usan el mismo pivote que los postes del núcleo: se tumban desde la base
  const _spm=setPropMatrix, _UPV=new THREE.Vector3(0,1,0);   // (antes usaba _up, que más abajo es updateProps: rotación NaN y los postes no se veían, solo los cables)
  setPropMatrix=function(P){ if(!P.ims) return _spm(P);
    _pq.setFromAxisAngle(_UPV,P.a); if(P.fallen&&P.axis){ _pq2.setFromAxisAngle(P.axis,P.t*P.t*Math.PI/2*(P.tilt||.95)); _pq.premultiply(_pq2); }
    const sink=P.sink||0; _pm.compose(_pv.set(P.x,P.y-sink*1.2,P.z),_pq,_ps.set(1,1-sink*.9,1)); if(P.gone) _pm.makeScale(0,0,0);
    for(const im of P.ims){ im.setMatrixAt(P.i,_pm); im.instanceMatrix.needsUpdate=true; }
    if(P.spans&&P.fallen&&!P.wDown){ P.wDown=1; dropSpans(P); } };
  // cables de un poste caído: quedan tirados en el suelo
  function dropSpans(P){ if(!wireGeo) return; const A=wireGeo.attributes.position;
    for(const [i0,n] of P.spans){ for(let k=i0;k<i0+n;k++){ const x=A.getX(k), z=A.getZ(k); A.setY(k,heightAt(x,z)+.04); } } A.needsUpdate=true; }
  const fell=(P,k=.95)=>{ P.fallen=true; P.t=1; P.tilt=k; P.lie=-1e9; const a=Math.random()*6.283; P.axis=new THREE.Vector3(Math.cos(a),0,Math.sin(a)); };

  function eraStreets(){
    props=[]; propGrid=new Map(); propIM={}; grassCells=new Map(); grassIM=null; wireGeo=null;
    const C=W.cfgC||{}, era=W.era||3, segs=W.roadSegs||[], R=mulberry0((C.seed||7)*31+5), rr=(a,b)=>a+R()*(b-a);
    const front=C.front||0, nml=z=>Math.abs(z)<front+25&&!C.noTrench;           // tierra de nadie (y la primera línea)
    const ok=(x,z,m)=>freeSpot(x,z,m)&&!(W.trench&&W.trench(x,z))&&!(W.wire&&W.wire(x,z));
    const lamps=[], poles=[], hyd=[], cols=[], benches=[];
    const towns=[C.village,C.hamlet,...(C.hamlets||[])].filter(Boolean);
    const inTown=(x,z)=>towns.some(V=>Math.hypot(x-V.x,z-V.z)<(V.r||30)+8);
    // ---- ciudades: faroles a los dos lados de cada calle ----
    for(const S of segs){ if(!S.city) continue; const L=Math.hypot(S.bx-S.ax,S.bz-S.az), ux=(S.bx-S.ax)/L, uz=(S.bz-S.az)/L, nx=-uz, nz=ux, off=S.w/2-1.1;
      let sd=1; for(let d=rr(4,20); d<L; d+=rr(26,34)){ sd=-sd; const x=S.ax+ux*d+nx*sd*off, z=S.az+uz*d+nz*sd*off;
        if(segs.some(T=>T!==S&&T.city&&segD(x,z,T)<T.w/2+.5)) continue; if(ok(x,z,.4)) lamps.push({x,z,a:Math.atan2(nx*sd,nz*sd)}); } }
    // ---- pueblos: faroles sobre el camino, de un lado y del otro ----
    for(const S of segs){ if(S.city) continue; const L=Math.hypot(S.bx-S.ax,S.bz-S.az); if(L<1) continue; const ux=(S.bx-S.ax)/L, uz=(S.bz-S.az)/L, nx=-uz, nz=ux;
      for(let d=rr(0,8); d<L; d+=era<=1?38:28){ const sd=R()<.5?1:-1, x=S.ax+ux*d+nx*sd*4.6, z=S.az+uz*d+nz*sd*4.6; if(inTown(x,z)&&ok(x,z,.4)) lamps.push({x,z,a:Math.atan2(nx*sd,nz*sd)}); } }
    // ---- postes del telégrafo: a lo largo de los caminos de campo, siempre del mismo lado ----
    { let acc=rr(0,40), run=[]; const flush=()=>{ if(run.length) poles.push(run); run=[]; };
      for(let i=0;i<segs.length;i++){ const S=segs[i]; if(S.city){ flush(); continue; } const prev=segs[i-1]; if(!prev||prev.city||Math.hypot(prev.bx-S.ax,prev.bz-S.az)>.5){ flush(); acc=rr(0,40); }
        const L=Math.hypot(S.bx-S.ax,S.bz-S.az); if(L<1) continue; const ux=(S.bx-S.ax)/L, uz=(S.bz-S.az)/L;
        let d=acc; for(; d<L; d+=44){ const x=S.ax+ux*d-uz*6.6, z=S.az+uz*d+ux*6.6;
          if(Math.abs(x)>W.bx-6||Math.abs(z)>W.bz-6||inTown(x,z)){ flush(); continue; }
          if(nml(z)&&R()<.55){ flush(); continue; }                                   // arrancado por la artillería
          if(!ok(x,z,.4)){ flush(); continue; } run.push({x,z,a:Math.atan2(ux,uz),down:nml(z)?R()<.5:R()<.08}); }
        acc=d-L; }
      flush(); }
    // ---- esquinas de la ciudad: bocas de incendio y columnas de avisos; plazas y parques con bancos ----
    const Ct=C.city; if(Ct&&Ct.xs){ const st=Ct.street||14, euro=!/shanghai/.test(W.key||'');
      for(const x of Ct.xs) for(const z of Ct.zs){ const cx=R()<.5?1:-1, cz=R()<.5?1:-1;
        if(era>=2&&R()<.3){ const X=x+cx*(st/2-.9), Z=z+cz*(st/2+2.2); if(ok(X,Z,.3)) hyd.push({x:X,z:Z,a:rr(0,6.28)}); }
        if(euro&&R()<.14){ const X=x-cx*(st/2-1.3), Z=z-cz*(st/2+1.3); if(ok(X,Z,.9)) cols.push({x:X,z:Z,a:rr(0,6.28)}); } }
      const rings=[...C.zones.map(Z=>[Z.x,Z.z,Z.r*.62]),...(Ct.skip||[]).filter(s=>s[2]<60).map(s=>[s[0],s[1],s[2]*.5])];
      for(const [px,pz,r] of rings){ const n=Math.max(4,Math.round(r/3)); for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+rr(-.1,.1), x=px+Math.cos(a)*r, z=pz+Math.sin(a)*r;
          if(i%2){ if(ok(x,z,.4)) lamps.push({x,z,a:0}); } else if(ok(x,z,1)) benches.push({x,z,a:Math.atan2(px-x,pz-z)+Math.PI}); } } }
    else if(era>=2) for(const V of towns) if(V===C.village){ for(let i=0;i<3;i++){ const a=rr(0,6.28), x=V.x+Math.cos(a)*6, z=V.z+Math.sin(a)*6; if(ok(x,z,1)) benches.push({x,z,a:rr(0,6.28)}); } }
    // ---- mallas ----
    const flat=poles.flat(), war=era<=3;
    const L1=mkIM(gasPost,CAST,lamps.length), L2=mkIM(gasGlass,GLASS,lamps.length,false);
    const T1=mkIM(telePole,WOOD,flat.length), T2=mkIM(teleIns,PORC,flat.length,false);
    const H1=mkIM(hydrant,HYD,hyd.length), C1=mkIM(columnBody,POSTER,cols.length), C2=mkIM(columnTop,CAST,cols.length);
    const B1=mkIM(benchWood,BENCH,benches.length), B2=mkIM(benchIron,CAST,benches.length,false);
    const put=(list,ims,r,f)=>list.forEach((o,i)=>{ const P={kind:'street',ims,i,x:o.x,z:o.z,y:heightAt(o.x,o.z)-.05,a:o.a,r,t:0}; if(f) f(P,o); addProp(P); o.P=P; });
    put(lamps,[L1,L2],.3,P=>{ if(war&&inTown(P.x,P.z)&&!C.city&&R()<(era<=1?.45:.25)) fell(P); else if(war&&C.city&&R()<.18) fell(P,.9); });
    put(flat,[T1,T2],.3,(P,o)=>{ if(o.down) fell(P,.97); });
    put(hyd,[H1],.25,P=>{ P.hyd=true; }); put(cols,[C1,C2],.75,P=>{ if(war&&R()<.12) fell(P,1); }); put(benches,[B1,B2],.8,P=>{ if(war&&R()<.15) fell(P,.5); });
    // cables con comba entre postes en pie (dos en la 1ª Guerra, cuatro después)
    const pts=[], wiresN=era<=1?[0,3]:[0,1,2,3];
    for(const run of poles) for(let i=0;i<run.length-1;i++){ const A=run[i], B=run[i+1]; if(A.down||B.down||Math.hypot(B.x-A.x,B.z-A.z)>60) continue; const i0=pts.length/3;
      for(const w of wiresN){ const [ox,oy]=INS[w], ca=Math.cos(A.a), sa=Math.sin(A.a), cb=Math.cos(B.a), sb=Math.sin(B.a);
        const ax=A.x+ox*ca, az=A.z-ox*sa, ay=A.P.y+oy+.12, bxx=B.x+ox*cb, bz=B.z-ox*sb, by=B.P.y+oy+.12, NS=6;
        for(let k=0;k<NS;k++){ for(const f of [k/NS,(k+1)/NS]) pts.push(ax+(bxx-ax)*f, ay+(by-ay)*f-.55*4*f*(1-f), az+(bz-az)*f); } }
      const n=pts.length/3-i0; (A.P.spans=A.P.spans||[]).push([i0,n]); (B.P.spans=B.P.spans||[]).push([i0,n]); }
    if(pts.length){ wireGeo=new THREE.BufferGeometry(); wireGeo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3)); const ls=new THREE.LineSegments(wireGeo,WIRE); ls.frustumCulled=false; worldGroup.add(ls); }
    props.forEach(P=>{ if(P.ims) setPropMatrix(P); });
    GLASS.emissive.setHex(0x000000);                                                   // oscurecimiento de guerra
    W._street={lamps:lamps.length,poles:flat.length,hyd:hyd.length,cols:cols.length,benches:benches.length,wires:pts.length/6};
  }
  window.eraStreets=eraStreets;

  // Guerra Fría y mapas de la v1: poste de hormigón con brazo curvo y luminaria que se prende de noche
  const _bp=buildProps;
  buildProps=function(){ _bp.apply(this,arguments); if(!propIM.post) return;
    const n=propIM.post.count; propIM.post.geometry.dispose(); propIM.lamp.geometry.dispose();
    propIM.post.geometry=coldPost; propIM.post.material=COLD; propIM.lamp.geometry=coldHead; propIM.lamp.material=HEAD;
    const lens=new THREE.InstancedMesh(coldLens,LENS,Math.max(1,n)); lens.count=n; lens.frustumCulled=false; worldGroup.add(lens); propIM.lens=lens;
    // el brazo mira a la calle más cercana
    for(const P of props) if(P.kind==='post'&&streetSegs.length){ const s=nearestSeg(P.x,P.z,streetSegs); if(s.d<20) P.a=Math.atan2(s.px-P.x,s.pz-P.z); setPropMatrix(P); } };
  const _spm2=setPropMatrix;
  setPropMatrix=function(P){ _spm2(P); if(P.kind==='post'&&propIM.lens){ propIM.post.getMatrixAt(P.i,_pm); propIM.lens.setMatrixAt(P.i,_pm); propIM.lens.instanceMatrix.needsUpdate=true; } };

  const _bw=buildWorld;
  buildWorld=function(key){ const r=_bw.apply(this,arguments); try{ if(W.ww1) eraStreets(); }catch(e){ console.warn('calles',e); } return r; };
  // de noche (sin oscurecimiento: épocas 4–5) las luminarias se prenden
  const _cu=cullUpdate;
  cullUpdate=function(){ _cu.apply(this,arguments); const on=typeof WX!=='undefined'&&WX&&WX.night&&(W.era||5)>=4; LENS.emissive.setHex(on?0xfff2c8:0x000000); LENS.emissiveIntensity=on?1.4:0; };
  // Hidrante volteado (pedido de Sebastián): chorro de agua hacia arriba unos 45 s y charco que crece. Un solo sistema de
  // partículas (Points) compartido por todos los chorros.
  const GN=900, gPos=new Float32Array(GN*3), gVel=new Float32Array(GN*3), gOwn=new Int16Array(GN).fill(-1), geysers=[];
  const gGeo=new THREE.BufferGeometry(); gGeo.setAttribute('position',new THREE.BufferAttribute(gPos,3));
  const dropTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=32; const x=c.getContext('2d'), g=x.createRadialGradient(16,16,0,16,16,16);
    g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(.45,'rgba(235,245,255,.7)'); g.addColorStop(1,'rgba(235,245,255,0)'); x.fillStyle=g; x.fillRect(0,0,32,32); return new THREE.CanvasTexture(c); })();
  const gMat=new THREE.PointsMaterial({color:0xdbe8f0,size:.5,map:dropTex,transparent:true,opacity:.8,depthWrite:false});
  const gPts=new THREE.Points(gGeo,gMat); gPts.frustumCulled=false; gPts.renderOrder=3;
  const puddleM=new THREE.MeshLambertMaterial({color:0x5a6a72,transparent:true,opacity:.55,depthWrite:false}), puddleG=new THREE.CircleGeometry(1,20).rotateX(-Math.PI/2);
  for(let i=0;i<GN;i++) gPos[i*3+1]=-1e4;
  function geyser(P){ if(geysers.length>=6) return; const y=heightAt(P.x,P.z); const pd=new THREE.Mesh(puddleG,puddleM); pd.position.set(P.x,y+.04,P.z); pd.scale.setScalar(.3); worldGroup.add(pd);
    if(!gPts.parent) worldGroup.add(gPts); geysers.push({x:P.x,z:P.z,y:y+.55,t:0,life:rand(38,50),pd,acc:0}); }
  const _kp=knockProp;
  knockProp=function(P){ const was=P.fallen; const r=_kp.apply(this,arguments); try{ if(P.hyd&&!was&&P.fallen) geyser(P); }catch(e){} return r; };
  let gi=0;
  function geyserStep(dt){ dt=Math.min(.1,dt||0); if(!geysers.length) return;
    for(let k=geysers.length-1;k>=0;k--){ const G=geysers[k]; G.t+=dt; const f=G.t<G.life-8?1:Math.max(0,(G.life-G.t)/8);
      G.pd.scale.setScalar(Math.min(7,.3+G.t*.35)); if(G.t>G.life+60){ worldGroup.remove(G.pd); geysers.splice(k,1); continue; }
      G.acc+=dt*340*f; while(G.acc>=1){ G.acc--; const i=gi=(gi+1)%GN, a=Math.random()*6.28, s=rand(0,.9);
        gPos[i*3]=G.x+rand(-.06,.06); gPos[i*3+1]=G.y; gPos[i*3+2]=G.z+rand(-.06,.06); gVel[i*3]=Math.cos(a)*s; gVel[i*3+1]=rand(9,12.5)*(.6+.4*f); gVel[i*3+2]=Math.sin(a)*s; gOwn[i]=k; } }
    for(let i=0;i<GN;i++){ if(gPos[i*3+1]<-1e3) continue; gVel[i*3+1]-=9.8*dt; gPos[i*3]+=gVel[i*3]*dt; gPos[i*3+1]+=gVel[i*3+1]*dt; gPos[i*3+2]+=gVel[i*3+2]*dt;
      if(gVel[i*3+1]<0&&gPos[i*3+1]<heightAt(gPos[i*3],gPos[i*3+2])) gPos[i*3+1]=-1e4; }
    gGeo.attributes.position.needsUpdate=true; }
  const _bw2=buildWorld;
  buildWorld=function(){ geysers.length=0; for(let i=0;i<GN;i++) gPos[i*3+1]=-1e4; if(gPts.parent) gPts.parent.remove(gPts); return _bw2.apply(this,arguments); };
  const _up=updateProps; updateProps=function(dt){ _up.apply(this,arguments); try{ geyserStep(dt); }catch(e){} };
  window.hydGeyser=geyser;
})();
