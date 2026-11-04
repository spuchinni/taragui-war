// Gente detallada (pedido de Sebastián: probar los paquetes Ultimate Modular Men/Women de Quaternius, licencia CC0).
// `modelos/gente.json` lo arma `herramientas/gente/convertir.py` desde los .g3dj de Quaternius: cada personaje en su pose de
// reposo ya en metros (y arriba, mirando +z), colores por vértice (paleta), 2 huesos por vértice y un esqueleto Mixamo
// reducido a 22 huesos. Acá se arma una SkinnedMesh por persona (una llamada de dibujo) y se la mueve con la animación
// de siempre: la persona hecha por código sigue existiendo como "títere" invisible (P.parts) y cada cuadro los huesos
// apuntan piernas, brazos y cadera hacia donde apuntan las del títere (`g3Pose`). De lejos (más de G3_LOD m) se vuelve a
// ver la persona hecha por código, que es mucho más liviana.
// Solo civiles adultos (los soldados siguen con sus uniformes de época hechos por código). Qué ropa según la época:
// `G3_ERA`. Ajustes → "Gente detallada" (`tw2_gente3d`).
(function(){
  const G3={data:null,tpl:{},loading:null};
  let G3_ON=true; try{ G3_ON=localStorage.getItem('tw2_gente3d')!=='0'; }catch(e){}
  const G3_LOD=55;
  window.G3=G3;
  const mat=new THREE.MeshLambertMaterial({vertexColors:true,skinning:true});
  const b64=s=>{ const bin=atob(s), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); return u.buffer; };
  G3.load=function(){ if(G3.loading) return G3.loading;
    G3.loading=fetch('modelos/gente.json?v=1').then(r=>r.ok?r.json():null).then(d=>{ G3.data=d; return d; }).catch(()=>null); return G3.loading; };
  function template(name){ if(G3.tpl[name]) return G3.tpl[name]; const C=G3.data&&G3.data.chars[name]; if(!C) return null;
    const P=new Int16Array(b64(C.pos)), S=new Uint8Array(b64(C.sk)), CI=new Uint8Array(b64(C.ci)), raw=b64(C.idx), I=C.n<65536?new Uint16Array(raw):new Uint32Array(raw);
    const n=C.n, pos=new Float32Array(n*3), col=new Float32Array(n*3), si=new Uint16Array(n*4), sw=new Float32Array(n*4);
    for(let i=0;i<n;i++){ pos[i*3]=P[i*3]/1000; pos[i*3+1]=P[i*3+1]/1000; pos[i*3+2]=P[i*3+2]/1000; const c=C.pal[CI[i]]; col[i*3]=c[0]/255; col[i*3+1]=c[1]/255; col[i*3+2]=c[2]/255;
      si[i*4]=S[i*3]; si[i*4+1]=S[i*3+1]; const w=S[i*3+2]/255; sw[i*4]=w; sw[i*4+1]=1-w; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3));
    g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4)); g.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4)); g.setIndex(new THREE.BufferAttribute(I,1)); g.computeVertexNormals(); g.computeBoundingSphere();
    g.boundingSphere.radius=Math.max(g.boundingSphere.radius,2.2);
    const T={g,skel:C.skel,h:C.h}; G3.tpl[name]=T; return T; }
  const NB=()=>G3.data.bones, bi=n=>NB().indexOf(n);
  // arma una persona: malla con su esqueleto propio (22 huesos), en reposo con los brazos bajados
  G3.make=function(name){ const T=template(name); if(!T) return null; const bones=T.skel.map(s=>{ const b=new THREE.Bone(); if(s){ b.position.fromArray(s.t); b.quaternion.fromArray(s.q); } return b; });
    let root=null; T.skel.forEach((s,i)=>{ if(!s) return; if(s.p<0) root=bones[i]; else bones[s.p].add(bones[i]); });
    const m=new THREE.SkinnedMesh(T.g,mat); m.add(root); m.updateMatrixWorld(true); const sk=new THREE.Skeleton(bones); m.bind(sk); m.castShadow=true; m.frustumCulled=true;
    const rest=bones.map(b=>b.quaternion.clone()), restP=bones.map(b=>b.position.clone());
    // dirección de reposo de cada hueso de miembro (hacia el hijo), en su espacio local
    const dir={}; for(const [a,c] of [['LeftArm','LeftForeArm'],['LeftForeArm','LeftHand'],['RightArm','RightForeArm'],['RightForeArm','RightHand'],['LeftUpLeg','LeftLeg'],['LeftLeg','LeftFoot'],['RightUpLeg','RightLeg'],['RightLeg','RightFoot']]){
      const ib=bi(a), ic=bi(c); if(bones[ib]&&bones[ic]) dir[a]=bones[ic].position.clone().normalize(); }
    // lado de cada miembro (x del mundo en reposo): el brazo "izquierdo" del títere (x<0) puede ser el Right de Mixamo
    const wx=n=>{ const v=new THREE.Vector3(); bones[bi(n)].getWorldPosition(v); return v.x; };
    const side={arm:wx('LeftArm')<0?['Left','Right']:['Right','Left'], leg:wx('LeftUpLeg')<0?['Left','Right']:['Right','Left']};
    return {m,bones,rest,restP,dir,side,hipY:restP[bi('Hips')].y}; };
  // ---- retargeting: los huesos copian hacia dónde apunta el títere ----
  const _q=new THREE.Quaternion(), _q2=new THREE.Quaternion(), _v=new THREE.Vector3(), _v2=new THREE.Vector3(), DOWN=new THREE.Vector3(0,-1,0), FWD=new THREE.Vector3(0,0,1);

  function aim(R,name,pWorld,target){ const i=bi(name), b=R.bones[i]; _q.copy(pWorld).multiply(R.rest[i]); _v2.copy(R.dir[name]).applyQuaternion(_q);
    _q2.setFromUnitVectors(_v2,target); const wq=_q2.multiply(_q).clone(); b.quaternion.copy(pWorld.clone().invert().multiply(wq)); return wq; }
  function chain(R,names,start){ let q=start.clone(); for(const n of names){ const i=bi(n); R.bones[i].quaternion.copy(R.rest[i]); q.multiply(R.rest[i]); } return q; }
  G3.pose=function(R,p){ const hipQ=p.hip.quaternion, H=bi('Hips');
    R.bones[H].position.copy(R.restP[H]); R.bones[H].position.y=R.hipY*(p.hip.position.y/.88);
    R.bones[H].quaternion.copy(hipQ).multiply(R.rest[H]); const wH=R.bones[H].quaternion.clone();
    const fwd=_v.copy(FWD).applyQuaternion(hipQ).clone();
    // brazos: hombro en reposo, brazo hacia donde apunta el del títere y antebrazo un poco doblado hacia adelante
    const wS2=chain(R,['Spine','Spine1','Spine2'],wH); chain(R,['Neck','Head'],wS2);
    for(const [k,L] of [[0,p.armL],[1,p.armR]]){ const S=R.side.arm[k]; const wSh=chain(R,[S+'Shoulder'],wS2);
      const t=DOWN.clone().applyQuaternion(L.quaternion).applyQuaternion(hipQ).normalize(); const wA=aim(R,S+'Arm',wSh,t);
      const t2=t.clone().addScaledVector(fwd,.35).normalize(); aim(R,S+'ForeArm',wA,t2); }
    for(const [k,L] of [[0,p.legL],[1,p.legR]]){ const S=R.side.leg[k];
      const t=DOWN.clone().applyQuaternion(L.quaternion).applyQuaternion(hipQ).normalize(); const wU=aim(R,S+'UpLeg',wH,t);
      const bend=clamp((.88-p.hip.position.y)*1.6,0,1.3); const t2=t.clone().addScaledVector(fwd,-bend).normalize(); aim(R,S+'Leg',wU,t2); } };

  // ---- qué ropa según la época, el sexo y el oficio ----
  // null = esa persona sigue con la ropa de época hecha por código (en las épocas viejas el paquete casi no tiene ropa que sirva)
  const G3_ERA={old:{m:['m_Suit','m_Farmer',null,null,null],f:['f_Formal',null,null,null]},
    new:{m:['m_Casual','m_Casual2','m_Suit','m_Worker','m_Farmer','m_Adventurer','m_Casual','m_Casual2'],f:['f_Casual','f_Casual','f_Formal','f_Suit','f_Worker','f_Adventurer','f_Soldier']}};
  const JOB={granjero:'m_Farmer',obrero:'m_Worker',policia:'m_Swat'};
  function pickChar(P){ const era=W_era(), set=era<=4?G3_ERA.old:G3_ERA.new, sx=P.female?'f':'m';
    if(P.job){ const j=JOB[P.job]; if(j&&!P.female&&(era>=5||j==='m_Farmer')&&G3.data.chars[j]) return j; return null; }   // los demás oficios tienen su ropa hecha por código
    let L=set[sx].filter(n=>n===null||G3.data.chars[n]); if(sx==='m'&&era>=5&&typeof facadeStyle==='function'&&facadeStyle()===1&&G3.data.chars.m_Beach) L=L.concat(['m_Beach']);
    return L.length?L[(Math.random()*L.length)|0]:null; }
  const W_era=()=>(typeof W!=='undefined'&&W&&W.era)||5;
  // engancha: después de crear un civil adulto, si el paquete ya cargó, le pone la malla detallada
  const _mp=makePerson;
  makePerson=function(kind,team,x,z){ const kid=!!window._kidNext; const P=_mp.apply(this,arguments);
    try{ if(G3_ON&&kind==='civ'&&!kid&&G3.data){ const name=pickChar(P); if(name){ const R=G3.make(name); if(R){ R.name=name; P.g3=R; P.g.add(R.m); R.m.visible=false; } } } }catch(e){ console.warn('gente3d',e); }
    return P; };
  const PARTS=['torso','head','legL','legR','armL','armR'];
  function setDetail(P,on){ if(P.g3d===on) return; P.g3d=on; P.g3.m.visible=on; for(const k of PARTS){ const o=P.parts[k]; if(o) o.visible=!on; } }
  const _ui=updateInfantry;
  updateInfantry=function(dt){ _ui.apply(this,arguments); const cp=camera.position;
    for(const P of infantry){ if(!P.g3) continue; if(P.how==='blast'){ setDetail(P,false); continue; }
      const near=P.g.visible&&P.pos.distanceToSquared(cp)<G3_LOD*G3_LOD; setDetail(P,near); if(near) G3.pose(P.g3,P.parts); } };
  // se baja apenas abre el juego (de fondo); los civiles que aparecen antes de que llegue quedan con la persona por código
  setTimeout(()=>{ if(G3_ON) G3.load(); },3000);
  // Ajustes
  const _rs=renderSettings; renderSettings=function(){ const r=_rs.apply(this,arguments); const g=document.getElementById('pastoR'); if(!g) return r;
    const d=document.createElement('div'); d.innerHTML=`<h2>Gente detallada</h2><div class="hgOpt" id="g3R"><button class="${G3_ON?'sel':''}" data-v="1">Sí</button><button class="${G3_ON?'':'sel'}" data-v="0">No</button></div><p class="s">Civiles con modelos más reales (paquete de Quaternius, CC0). De lejos se ven como siempre. "No" si la PC anda justa.</p>`;
    const p=g.nextElementSibling; (p&&p.classList.contains('s')?p:g).after(...d.childNodes);
    document.querySelectorAll('#g3R button').forEach(b=>b.onclick=()=>{ G3_ON=b.dataset.v==='1'; try{ localStorage.setItem('tw2_gente3d',G3_ON?'1':'0'); }catch(e){} if(G3_ON) G3.load(); renderSettings(); });
    return r; };
})();
