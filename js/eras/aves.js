// Aves (pedido de Sebastián): bandadas que comen en el suelo y levantan vuelo cuando hay tiros, explosiones o se acerca un
// tanque; dan vueltas y se vuelven a posar en otro lado. Según el mapa: palomas (ciudades), cuervos (Europa, trincheras),
// gaviotas (Pacífico y costas), garzas blancas y biguás (Corrientes), y buitres que planean en círculos altos sobre el campo
// de batalla (desierto, Chaco y cerca de los puntos). Puramente visual (cada máquina hace las suyas, no viajan por la red).
// Todo en 3 mallas instanciadas (cuerpo y dos alas con colores por instancia): unas 60 aves = 3 llamadas de dibujo.
(function(){
  const MAXB=90;
  const bodyG=(()=>{ const a=new THREE.SphereGeometry(.5,8,6); a.scale(.55,.5,1.3); const h=new THREE.SphereGeometry(.22,6,5); h.translate(0,.12,.62);
    const bk=new THREE.ConeGeometry(.07,.25,5); bk.rotateX(Math.PI/2); bk.translate(0,.1,.88); const tl=new THREE.BoxGeometry(.4,.04,.4); tl.translate(0,.02,-.75);
    return THREE.BufferGeometryUtils.mergeBufferGeometries([a,h,bk,tl].map(g=>g.index?g.toNonIndexed():g)); })();
  const wingG=(()=>{ const s=new THREE.Shape(); s.moveTo(0,.25); s.lineTo(1.05,.05); s.lineTo(1.25,-.18); s.lineTo(.5,-.3); s.lineTo(0,-.32); const g=new THREE.ShapeGeometry(s); g.rotateX(Math.PI/2); return g; })();
  const mat=new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide});
  let IMb=null, IMl=null, IMr=null; const birds=[];
  const KIND={paloma:{s:.32,c:[0x8a8e96,0x6a6e78,0xb8b8b8],fl:9},cuervo:{s:.42,c:[0x16161a,0x22222a],fl:8},gaviota:{s:.45,c:[0xf2f2f0,0xd8dcdc],fl:6},
    garza:{s:.7,c:[0xf6f6f2],fl:4.2},bigua:{s:.5,c:[0x1a1a1e],fl:6},buitre:{s:1.1,c:[0x2a2420,0x3a2e26],fl:1.6,soar:1}};
  function setsFor(){ const k=W.key||''; if(W.osm) return [['garza',5],['bigua',6],['paloma',10],['cuervo',6]];
    if(/alamein|kasserine/.test(k)) return [['buitre',5],['paloma',6]]; if(/chaco/.test(k)) return [['buitre',4],['garza',5],['cuervo',6]];
    if(/okinawa|saipan/.test(k)) return [['gaviota',10],['gaviota',8],['garza',4]]; if(W.cfgC&&W.cfgC.city) return [['paloma',12],['paloma',10],['cuervo',6]];
    return [['cuervo',10],['cuervo',8],['paloma',8],['buitre',2]]; }
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(0,0,0,'YXZ'), _p=new THREE.Vector3(), _s=new THREE.Vector3(), _c=new THREE.Color(), _w=new THREE.Matrix4();
  function setup(){ for(const im of [IMb,IMl,IMr]) if(im){ worldGroup.remove(im); im.dispose(); } birds.length=0;
    IMb=new THREE.InstancedMesh(bodyG,mat,MAXB); IMl=new THREE.InstancedMesh(wingG,mat,MAXB); IMr=new THREE.InstancedMesh(wingG,mat,MAXB);
    for(const im of [IMb,IMl,IMr]){ im.setColorAt(0,_c.set(1,1,1)); im.count=0; im.frustumCulled=false; im.castShadow=false; worldGroup.add(im); }
    for(const [k,n] of setsFor()){ const K=KIND[k]; let cx=rand(-W.bx*.8,W.bx*.8), cz=rand(-W.bz*.8,W.bz*.8);
      if(W.zones.length&&K.soar){ const Z=W.zones[(Math.random()*W.zones.length)|0]; cx=Z.x+rand(-60,60); cz=Z.z+rand(-60,60); }
      for(let i=0;i<n&&birds.length<MAXB;i++){ const B={k,K,col:K.c[(Math.random()*K.c.length)|0],x:cx+rand(-5,5),z:cz+rand(-5,5),y:0,h:rand(0,6.28),ph:rand(0,6.28),state:K.soar?'soar':'ground',cx,cz,
          r:K.soar?rand(30,70):rand(18,40),alt:K.soar?rand(60,110):rand(12,30),t:rand(0,20),om:(Math.random()<.5?1:-1)*rand(.25,.45)};
        B.y=heightAt(B.x,B.z); birds.push(B); } }
    IMb.count=IMl.count=IMr.count=birds.length; birds.forEach((B,i)=>{ _c.set(B.col); IMb.setColorAt(i,_c); _c.multiplyScalar(.85); IMl.setColorAt(i,_c); IMr.setColorAt(i,_c); });
    for(const im of [IMb,IMl,IMr]) if(im.instanceColor) im.instanceColor.needsUpdate=true; }
  const scared=B=>noises.some(n=>now-n.t<1.5&&Math.hypot(n.x-B.x,n.z-B.z)<Math.max(60,n.r))||tanks.some(t=>!t.dead&&Math.hypot(t.pos.x-B.x,t.pos.z-B.z)<28);
  function update(dt){ if(!IMb||!birds.length) return; const live=['play','spectate','deploy','paused','brief'].includes(state); IMb.visible=IMl.visible=IMr.visible=live; if(!live) return;
    birds.forEach((B,i)=>{ const K=B.K;
      if(B.state==='ground'){ B.y=heightAt(B.x,B.z); B.ph+=dt*3; if(Math.random()<dt*.3) B.h+=rand(-1,1); B.x+=Math.sin(B.h)*dt*.15; B.z+=Math.cos(B.h)*dt*.15;
        if(scared(B)){ B.state='fly'; B.t=rand(18,40); B.cx=B.x+rand(-80,80); B.cz=B.z+rand(-80,80); } }
      else{ // vuela en círculos alrededor de (cx,cz) a cierta altura; los que no planean, después se posan en otro lado
        B.ph+=dt*(K.soar?1:K.fl*(B.state==='land'?.5:1)); const gy=heightAt(B.x,B.z);
        if(B.state==='land'){ const dx=B.tx-B.x, dz=B.tz-B.z, d=Math.hypot(dx,dz); B.h=Math.atan2(dx,dz); const v=Math.min(9,d*1.2+2); B.x+=dx/(d||1)*v*dt; B.z+=dz/(d||1)*v*dt; B.y+=((heightAt(B.tx,B.tz))-B.y)*Math.min(1,dt*(d<6?3:.6));
          if(d<.6&&B.y-heightAt(B.x,B.z)<.3){ B.state='ground'; } if(scared(B)){ B.state='fly'; B.t=rand(15,30); } }
        else { B.a=(B.a??Math.atan2(B.x-B.cx,B.z-B.cz))+B.om*dt*(K.soar?.5:1.4); const tx=B.cx+Math.sin(B.a)*B.r, tz=B.cz+Math.cos(B.a)*B.r;
          const dx=tx-B.x, dz=tz-B.z; B.h=Math.atan2(dx,dz); const v=K.soar?9:14; const d=Math.hypot(dx,dz)||1; B.x+=dx/d*v*dt; B.z+=dz/d*v*dt;
          B.y+=(gy+B.alt-B.y)*Math.min(1,dt*.8); B.t-=dt;
          if(!K.soar&&B.t<0){ let tx2=B.cx+rand(-60,60), tz2=B.cz+rand(-60,60); tx2=clamp(tx2,-W.bx+10,W.bx-10); tz2=clamp(tz2,-W.bz+10,W.bz-10); B.tx=tx2; B.tz=tz2; B.state='land'; } } }
      const fly=B.state!=='ground', flap=fly?(K.soar?Math.sin(B.ph*.6)*.08+.05:Math.sin(B.ph*6.28)*.85):(Math.sin(B.ph)*.05-1.1);
      const bank=fly&&B.state!=='land'?-B.om*(K.soar?.5:.6):0, pitch=fly?(B.state==='land'?.2:0):(Math.sin(B.ph*1.3)>.6?.6:0);
      _e.set(pitch,B.h,bank); _q.setFromEuler(_e); _p.set(B.x,B.y+(fly?0:K.s*.35),B.z); _s.setScalar(K.s); _m.compose(_p,_q,_s); IMb.setMatrixAt(i,_m);
      _w.makeRotationZ(flap); _w.setPosition(.12,.12,0); IMl.setMatrixAt(i,_m.clone().multiply(_w));
      _w.makeRotationZ(Math.PI-flap); _w.setPosition(-.12,.12,0); IMr.setMatrixAt(i,_m.clone().multiply(_w).multiply(new THREE.Matrix4().makeScale(1,-1,1))); });
    IMb.instanceMatrix.needsUpdate=IMl.instanceMatrix.needsUpdate=IMr.instanceMatrix.needsUpdate=true; }
  const _bw=buildWorld;
  buildWorld=function(key){ const r=_bw.apply(this,arguments); try{ setup(); }catch(e){ console.warn('aves',e); } return r; };
  let last=performance.now();
  const _cu=cullUpdate;
  cullUpdate=function(){ _cu.apply(this,arguments); const t=performance.now(), dt=Math.min(.1,(t-last)/1000); last=t; try{ update(dt); }catch(e){} };
  window.birds=birds;
})();
