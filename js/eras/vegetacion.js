// Vegetación más real (pedido de Sebastián con árboles y pasto de Sketchfab como referencia; hecho por código):
//  · Pasto 3D cerca de la cámara: matas de hojas cruzadas en una grilla de 1,5 m alrededor de la cámara (hasta 28–46 m
//    según la calidad, Ajustes → Pasto 3D), del color del suelo que tienen abajo (foto del mapa `W.mmCanvas`), solo donde
//    el suelo es verde (no en barro, arena, nieve, calles, trincheras ni edificios), que se mueven con el viento y que los
//    tanques dejan aplastadas al pasar. Una sola malla instanciada que se rearma cuando la cámara se mueve 3 m.
//  · Copas con hojas: a los árboles de hoja ancha se les suma una capa de "tarjetas" de follaje con transparencia sobre la
//    copa (borde calado en vez de bola lisa), con el mismo color por árbol. Una malla más por especie y sector; se apaga
//    de lejos (140 m) y con la calidad Baja.
(function(){
  let PASTO='auto'; try{ PASTO=localStorage.getItem('tw2_pasto')||'auto'; }catch(e){}
  const radio=()=>({no:0,poco:28,mucho:46})[PASTO]??(Q().grass>=1?44:Q().grass>0?30:0);
  // ---- textura de las matas: hojas finas que se afinan, oscuras abajo y claras en la punta ----
  const bladeTex=(()=>{ const c=document.createElement('canvas'); c.width=128; c.height=128; const x=c.getContext('2d'); x.clearRect(0,0,128,128);
    for(let i=0;i<46;i++){ const X=6+Math.random()*116, h=50+Math.random()*76, b=(Math.random()-.5)*34, w=2+Math.random()*2.6;
      const g=x.createLinearGradient(0,128,0,128-h); const v=150+Math.random()*60|0; g.addColorStop(0,`rgb(${v*.55|0},${v*.6|0},${v*.5|0})`); g.addColorStop(1,`rgb(${v+30},${v+40},${v})`);
      x.fillStyle=g; x.beginPath(); x.moveTo(X-w,128); x.quadraticCurveTo(X+b*.3,128-h*.55,X+b,128-h); x.quadraticCurveTo(X+b*.3+w*.4,128-h*.5,X+w,128); x.fill(); }
    const t=new THREE.CanvasTexture(c); return t; })();
  const tuftGeo=(()=>{ const ps=[]; for(let k=0;k<3;k++){ const g=new THREE.PlaneGeometry(1.1,.62); g.translate(0,.31,0); g.rotateY(k*Math.PI/3); ps.push(g.toNonIndexed()); const b=g.clone(); b.scale(-1,1,1); ps.push(b.toNonIndexed()); }
    const g=THREE.BufferGeometryUtils.mergeBufferGeometries(ps), N=g.attributes.normal; for(let i=0;i<N.count;i++) N.setXYZ(i,0,1,0); return g; })();  // normales hacia arriba: se iluminan como el suelo
  const tuftMat=new THREE.MeshLambertMaterial({map:bladeTex,alphaTest:.45});
  const U={t:{value:0}};
  tuftMat.onBeforeCompile=sh=>{ sh.uniforms.uT=U.t; sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>',
    `#include <begin_vertex>
     #ifdef USE_INSTANCING
       float ph=instanceMatrix[3].x*.31+instanceMatrix[3].z*.23;
       float k=uv.y*uv.y; transformed.x+=sin(uT*1.6+ph)*.09*k; transformed.z+=cos(uT*1.3+ph*1.7)*.06*k;
     #endif`); };
  const GF={im:null,R:0,last:new THREE.Vector2(1e9,1e9),mask:new Map(),flat:new Set(),px:null,pw:0,ph:0,key:null};
  const CS=1.5, MAXN=4200;
  const hash=(i,j,s)=>{ let h=Math.imul(i,73856093)^Math.imul(j,19349663)^Math.imul(s,83492791); h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
  function pixel(x,z){ if(!GF.px) return null; const u=Math.floor((W.mmEX-x)/(2*W.mmEX)*GF.pw), v=Math.floor((W.mmEZ-z)/(2*W.mmEZ)*GF.ph); if(u<0||v<0||u>=GF.pw||v>=GF.ph) return null; const k=(v*GF.pw+u)*4; return [GF.px[k],GF.px[k+1],GF.px[k+2]]; }
  // densidad 0–1 de la celda (se calcula una vez): suelo verde = mucho, barro y arena = casi nada; nunca en calles, trincheras, agua ni edificios
  function cellInfo(i,j){ const key=i*100003+j; let m=GF.mask.get(key); if(m!==undefined) return m;
    const x=(i+.5)*CS, z=(j+.5)*CS, p=pixel(x,z); m=0;
    if(p&&Math.abs(x)<W.bx+40&&Math.abs(z)<W.bz+40){ const g=p[1]-(p[0]+p[2])/2, lum=(p[0]+p[1]+p[2])/3; let d=clamp(g/24,0,1)*(lum<40?.3:1);
      if(d>.04){ const h=heightAt(x,z); if(W.water!=null&&h<W.water+.3) d=0;
        else if(W.trench&&W.trench(x,z)) d=0;
        else if(W.roadSegs&&W.roadSegs.some(S=>!S.city&&Math.abs(S.ax-x)<60&&segD(x,z,S)<3.6)) d=0;
        else if(gridQuery(x,z,3).some(b=>!b.dead&&obPush(x,z,.8,b))) d=0;
        else if(typeof roadAt==='function'&&W.osm&&roadAt(x,z)) d=0; }
      m=d>.04?{d,c:new THREE.Color(p[0]/255,p[1]/255,p[2]/255).multiplyScalar(1.15)}:0; }
    GF.mask.set(key,m); return m; }
  const segD=(x,z,S)=>{ const dx=S.bx-S.ax, dz=S.bz-S.az, l=dx*dx+dz*dz; let t=l?((x-S.ax)*dx+(z-S.az)*dz)/l:0; t=clamp(t,0,1); return Math.hypot(x-S.ax-dx*t,z-S.az-dz*t); };
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _v=new THREE.Vector3(), _s=new THREE.Vector3(), _c=new THREE.Color(), _y=new THREE.Vector3(0,1,0);
  function rebuild(cx,cz){ const R=GF.R, im=GF.im; let n=0; const i0=Math.floor((cx-R)/CS), i1=Math.floor((cx+R)/CS), j0=Math.floor((cz-R)/CS), j1=Math.floor((cz+R)/CS);
    for(let i=i0;i<=i1&&n<MAXN;i++) for(let j=j0;j<=j1&&n<MAXN;j++){ const m=cellInfo(i,j); if(!m) continue; if(hash(i,j,1)>m.d) continue;
      const x=(i+hash(i,j,2))*CS, z=(j+hash(i,j,3))*CS, d=Math.hypot(x-cx,z-cz); if(d>R) continue;
      const fl=GF.flat.has(i*100003+j), s=(.75+hash(i,j,4)*.6)*clamp((R-d)/7,0,1);
      _q.setFromAxisAngle(_y,hash(i,j,5)*6.283); _m.compose(_v.set(x,heightAt(x,z)-.03,z),_q,_s.set(s,s*(fl?.22:(.8+hash(i,j,6)*.5)),s)); im.setMatrixAt(n,_m);
      im.setColorAt(n,_c.copy(m.c).multiplyScalar(fl?.7:.92+hash(i,j,7)*.2)); n++; }
    im.count=n; im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; GF.last.set(cx,cz); }
  function setup(){ if(GF.im){ worldGroup.remove(GF.im); GF.im.dispose(); GF.im=null; } GF.mask=new Map(); GF.flat=new Set(); GF.px=null; GF.last.set(1e9,1e9);
    GF.R=radio(); GF.key=W.key; if(!GF.R||!(W.ww1||W.osm)||!W.mmCanvas) return;
    try{ const c=W.mmCanvas, d=c.getContext('2d').getImageData(0,0,c.width,c.height); GF.px=d.data; GF.pw=c.width; GF.ph=c.height; }catch(e){ return; }
    const im=new THREE.InstancedMesh(tuftGeo,tuftMat,MAXN); im.setColorAt(0,_c.set(1,1,1)); im.count=0; im.frustumCulled=false; im.receiveShadow=true; im.castShadow=false; GF.im=im; worldGroup.add(im); }
  // tanques que pasan: aplastan las matas de sus celdas
  function flatten(){ let ch=false; for(const t of tanks){ if(t.dead||!t.pos||Math.abs(t.speed||0)<.3) continue; const p=t.pos, r=(t.R||2.6)*.85;
      for(let i=Math.floor((p.x-r)/CS);i<=Math.floor((p.x+r)/CS);i++) for(let j=Math.floor((p.z-r)/CS);j<=Math.floor((p.z+r)/CS);j++){ const k=i*100003+j; if(!GF.flat.has(k)){ GF.flat.add(k); ch=true; } } } return ch; }
  let acc=0, lastT=performance.now();
  window.grassField=GF;
  const _bw=buildWorld;
  buildWorld=function(key){ const r=_bw.apply(this,arguments); try{ setup(); }catch(e){ console.warn('pasto',e); } return r; };
  const _cu=cullUpdate;
  cullUpdate=function(){ _cu.apply(this,arguments); if(!GF.im) return; const now=performance.now(); U.t.value=now/1000; const dt=(now-lastT)/1000; lastT=now;
    const show=W.key===GF.key&&!(typeof player!=='undefined'&&player&&player.thermal); GF.im.visible=show; if(!show) return;
    const cp=camera.position, far=cp.y-heightAt(cp.x,cp.z)>GF.R*.9; if(far){ GF.im.visible=false; return; }     // vista aérea: no hace falta
    acc+=dt; let ch=false; if(acc>.25){ acc=0; ch=flatten(); }
    if(ch||Math.hypot(cp.x-GF.last.x,cp.z-GF.last.y)>3) rebuild(cp.x,cp.z); };

  // ---- copas con hojas: tarjetas de follaje calado sobre la copa de los árboles de hoja ancha ----
  const leafCard=(()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'); x.clearRect(0,0,128,128);
    for(let i=0;i<260;i++){ const a=Math.random()*6.283, r=Math.pow(Math.random(),.7)*54, X=64+Math.cos(a)*r, Y=64+Math.sin(a)*r*.9, v=(150+Math.random()*105)|0;
      x.fillStyle=`rgb(${v},${v},${v})`; x.beginPath(); x.ellipse(X,Y,3+Math.random()*4,1.6+Math.random()*2,Math.random()*3.14,0,7); x.fill(); }
    return new THREE.CanvasTexture(c); })();
  const cardMat=new THREE.MeshLambertMaterial({map:leafCard,alphaTest:.5,side:THREE.DoubleSide,vertexColors:true});
  const cardC={};
  const broad=(sp,S)=>!S.layers&&/Sphere|Icosahedron|Dodecahedron/.test(S.crown.toString())&&!['tojo','tussac','junco'].includes(sp);
  function cardsGeo(sp,S){ if(cardC[sp]) return cardC[sp];
    const g=treeCrown(sp,S); g.scale(...S.cs); g.translate(0,S.cy,0); g.computeBoundingSphere(); const P=g.attributes.position, N=g.attributes.normal, CO=g.attributes.color;
    const R0=mulberry0(sp.length*131+7), r=g.boundingSphere.radius, q=clamp(r*.62,.9,2.6), n=Math.round(clamp(r*12,18,60)), parts=[];
    for(let k=0;k<n;k++){ const i=(R0()*P.count)|0, p=new THREE.Vector3(P.getX(i),P.getY(i),P.getZ(i)), nn=new THREE.Vector3(N.getX(i),N.getY(i),N.getZ(i)).normalize();
      const c=new THREE.PlaneGeometry(q,q); c.lookAt(nn); const rot=new THREE.Matrix4().makeRotationAxis(nn,R0()*6.283); c.applyMatrix4(rot);
      const tilt=new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(R0()-.5,R0()-.5,R0()-.5).normalize(),.5); c.applyMatrix4(tilt);
      c.translate(p.x+nn.x*q*.12,p.y+nn.y*q*.12,p.z+nn.z*q*.12); const cg=c.toNonIndexed(), cn=cg.attributes.normal, col=new Float32Array(cn.count*3), k0=CO?CO.getX(i):1;
      for(let v=0;v<cn.count;v++){ cn.setXYZ(v,nn.x,nn.y,nn.z); col[v*3]=col[v*3+1]=col[v*3+2]=k0*1.05; } cg.setAttribute('color',new THREE.BufferAttribute(col,3)); parts.push(cg); }
    g.dispose(); const out=mergeC(parts); cardC[sp]=out; return out; }
  // une posición, normal, uv y color
  function mergeC(list){ const out=new THREE.BufferGeometry(); for(const name of ['position','normal','uv','color']){ const arrs=list.map(g=>g.attributes[name].array), len=arrs.reduce((a,b)=>a+b.length,0), A=new Float32Array(len); let o=0; for(const a of arrs){ A.set(a,o); o+=a.length; }
      out.setAttribute(name,new THREE.BufferAttribute(A,list[0].attributes[name].itemSize)); } return out; }
  const _bt=buildTrees;
  buildTrees=function(list){ _bt.apply(this,arguments); if(!(Q().grass>0)||PASTO==='no') return;
    const big=list.length>400;
    for(const key in treeSets){ const set=treeSets[key], sp=key.split('@')[0], S=SPECIES[sp]; if(!S||!broad(sp,S)) continue; const crown=set[1], recs=crown.userData.treeList;
      const im=new THREE.InstancedMesh(cardsGeo(sp,S),cardMat,crown.count); im.instanceMatrix.array.set(crown.instanceMatrix.array); im.instanceMatrix.needsUpdate=true;
      if(crown.instanceColor){ im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(crown.instanceColor.array),3); }
      im.frustumCulled=false; im.castShadow=false; im.receiveShadow=true; im.userData.treeList=recs; set[2]=im; worldGroup.add(im);
      let cx=0,cz=0; recs.forEach(t=>{cx+=t.x;cz+=t.z;}); cx/=recs.length; cz/=recs.length; const r=Math.max(...recs.map(t=>Math.hypot(t.x-cx,t.z-cz)))+12;
      cullAdd(im,cx,heightAt(cx,cz)+5,cz,r,big?140:1e9); } };
  const _stm=setTreeMatrix;
  setTreeMatrix=function(tr){ _stm(tr); const set=treeSets[tr.key||tr.sp]; if(set&&set[2]){ set[2].setMatrixAt(tr.i,tm4); set[2].instanceMatrix.needsUpdate=true; } };

  // ---- Ajustes → Pasto 3D ----
  const _rs=renderSettings; renderSettings=function(){ const r=_rs.apply(this,arguments); const g=document.getElementById('gfxR'); if(!g) return r;
    const d=document.createElement('div'); d.innerHTML=`<h2>Pasto 3D y hojas</h2><div class="hgOpt" id="pastoR">${[['auto','Según la calidad'],['no','Apagado'],['poco','Poco'],['mucho','Mucho']].map(([k,n])=>`<button class="${PASTO===k?'sel':''}" data-p="${k}">${n}</button>`).join('')}</div><p class="s">Pasto que se mueve con el viento alrededor de la cámara y copas de los árboles con hojas. "Mucho" pide más a la placa de video. Se aplica en la próxima partida.</p>`;
    const p=g.nextElementSibling; (p&&p.classList.contains('s')?p:g).after(...d.childNodes);
    document.querySelectorAll('#pastoR button').forEach(b=>b.onclick=()=>{ PASTO=b.dataset.p; try{ localStorage.setItem('tw2_pasto',PASTO); }catch(e){} renderSettings(); });
    return r; };
})();
