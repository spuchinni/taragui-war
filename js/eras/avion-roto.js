/* ---------- Aviones de línea que se rompen según el daño (22/11/2026, pedido de Sebastián) ----------
   "Que se desprendan las alas al ir cayendo, en la pista que se parta al medio o que explote y vuelen las alas, los motores, etc.,
   según el daño recibido, no que siempre pase lo mismo." El avión viene por partes (aviones-linea.js: trompa, centro, cola, alas, motores)
   y acá se separan las que corresponden según dónde pegó y con qué:
   · En tierra: cañonazo en un ala → el combustible del ala explota, el ala se quiebra en la raíz y el motor sale volando; en el fuselaje →
     se parte (adelante o atrás según dónde pegó) y la trompa o la cola cae; con explosivo, a veces revienta entero y vuelan alas, motores y cola.
     A balazos: se prende fuego un motor y unos segundos después se rompe.
   · En el aire: se desprende el ala del lado del impacto y cae girando hacia ese lado; o se prende fuego y cae en picada; con explosivo a veces
     estalla en el aire y caen los pedazos por separado. Al llegar al suelo se despedaza hacia adelante.
   · Solo las partes que se queman quedan negras; los pedazos ruedan, rebotan y quedan acostados; los que arden largan humo un buen rato.
   · Los dos estacionados en la plataforma también se pueden destruir (parkPlane, desde super-aero.js).
   Solo el anfitrión decide (los invitados ven el avión entero como antes). */
(()=>{
  const pieces=[], fires=[], parked=[];
  const _v=new THREE.Vector3(), _q=new THREE.Quaternion(), _q2=new THREE.Quaternion(), UP=new THREE.Vector3(0,1,0);
  const PART_KEYS=['nose','mid','tail','w-1','w1','e-1','e1'];
  const partsOf=pl=>pl.g.userData.parts||null;
  function burn(o){ if(!o) return; o.traverse(m=>{ if(m.isMesh&&m.material&&m.material.visible!==false) m.material=burntMat; }); }
  function localBox(o){ const bb=new THREE.Box3(); o.traverse(m=>{ if(m.isMesh){ if(!m.geometry.boundingBox) m.geometry.computeBoundingBox(); const b=m.geometry.boundingBox.clone(); if(m!==o) b.applyMatrix4(m.matrix); bb.union(b); } }); return bb; }
  const corners=bb=>{ const a=bb.min, b=bb.max; return [[a.x,a.y,a.z],[b.x,a.y,a.z],[a.x,b.y,a.z],[b.x,b.y,a.z],[a.x,a.y,b.z],[b.x,a.y,b.z],[a.x,b.y,b.z],[b.x,b.y,b.z]].map(c=>new THREE.Vector3(...c)); };
  // separa una parte del avión: pasa a la escena con su lugar actual y sale con esa velocidad y giro
  function detach(pl,key,v,w,opt={}){ const P=partsOf(pl)&&partsOf(pl)[key]; if(!P||P.userData.off) return null;
    pl.g.updateMatrixWorld(true); const m=P.matrixWorld.clone(); P.userData.off=1; scene.add(P); m.decompose(P.position,P.quaternion,P.scale);
    const pc={o:P,v:v.clone(),w:w.clone(),c:corners(localBox(P)),rest:false,bounce:0,key,flat:opt.flat};
    pieces.push(pc); if(opt.fire) fires.push({o:P,t:now+opt.fire,next:0,big:opt.big}); if(opt.burn) burn(P); return pc; }
  const velOf=pl=>{ const d=pl.dir||new THREE.Vector3(Math.sin(pl.yaw),0,Math.cos(pl.yaw)), v=pl.state>=1&&pl.state<3||pl._air?pl.v||0:0; return d.clone().multiplyScalar(v*Math.cos(pl.pitch||0)).setY((pl.vy||0)); };
  const axes=pl=>{ const f=new THREE.Vector3(Math.sin(pl.yaw),0,Math.cos(pl.yaw)); return {f,s:new THREE.Vector3(f.z,0,-f.x)}; };   // s = +x local (ala 'w1')
  function rnd3(k){ return new THREE.Vector3(rand(-k,k),rand(-k,k),rand(-k,k)); }
  function fireball(p,size,n=8){ for(let i=0;i<n;i++) puff(p.clone().add(new THREE.Vector3(rand(-1,1)*size,rand(0,1)*size*.6,rand(-1,1)*size)),i%3?0xff8a30:0xffd27a,rand(.7,1.2)*size,rand(.8,1.4),rand(2,4),1,true);
    for(let i=0;i<Math.ceil(n*.6);i++) puff(p.clone().add(new THREE.Vector3(rand(-1,1)*size,rand(.3,1)*size,rand(-1,1)*size)),0x1f1c1a,size*rand(1,1.5),rand(3,5),rand(3,6),.75);
    debris(p.clone(),Math.round(size*1.5),darkMat,size*1.2,2); boom(distVol(p,Math.min(1,size/10)),1.8,200);
    shake=Math.max(shake,Math.min(1,size/12)*clamp(1-camera.position.distanceTo(p)/700,0,1)); noise(p,300); }
  const partPos=(pl,key)=>{ const P=partsOf(pl)&&partsOf(pl)[key]; if(!P) return pl.pos.clone(); pl.g.updateMatrixWorld(true); return P.getWorldPosition(new THREE.Vector3()); };

  // ---- qué le pasa según dónde y con qué le pegaron ----
  function hitInfo(pl){ const H=pl._hit||{}; return {lx:H.lx||0,lz:H.lz||0,he:!!H.he,mg:!!H.mg,big:!!H.big}; }
  function sideOf(pl,lx){ const d=pl.g.userData.dim||{span:17}; return Math.abs(lx)>(window.AVION_LINEA?2.6:2.2)?(lx>0?1:-1):0; }
  function groundBreak(pl){ const I=hitInfo(pl), sd=sideOf(pl,I.lx), L=(pl.g.userData.dim||{L:36}).L, V0=velOf(pl), {f,s}=axes(pl), R=Math.random();
    const cata=I.he?(R<.4):(!I.mg&&R<.18);
    if(cata) return explodeAll(pl,V0,1);
    if(I.mg) return { mode:'burn' };
    if(sd){ breakWing(pl,sd,V0,true); return {mode:'wing'}; }
    // fuselaje: se parte adelante o atrás del ala según dónde pegó
    breakFuse(pl,I.lz>L*.06?'nose':'tail',V0,true); if(Math.random()<.35) breakWing(pl,Math.random()<.5?1:-1,V0,true); return {mode:'split'}; }
  function breakWing(pl,sd,V0,ground){ const {f,s}=axes(pl), out=s.clone().multiplyScalar(sd), p=partPos(pl,'w'+sd);
    fireball(p.clone().addScaledVector(out,-4),ground?7:6,7);
    detach(pl,'w'+sd,V0.clone().addScaledVector(out,ground?3:5).add(new THREE.Vector3(0,ground?5:2,0)),new THREE.Vector3(rand(-.4,.4),rand(-.6,.6),sd*rand(1,2.4)),{fire:rand(25,40),burn:Math.random()<.6,flat:1});
    detach(pl,'e'+sd,V0.clone().addScaledVector(out,ground?7:4).add(new THREE.Vector3(rand(-2,2),ground?8:3,rand(-2,2))),rnd3(3),{fire:rand(15,30),burn:true});
    burn(partsOf(pl).mid); pl.roll=(pl.roll||0); if(ground){ pl.rollT=sd*.13; pl.noGear=Math.random()<.5; }
    return true; }
  function breakFuse(pl,key,V0,ground){ const {f}=axes(pl), p=partPos(pl,key), sign=key==='nose'?1:-1;
    fireball(p.clone().addScaledVector(f,-sign*4),ground?6:5,6); pl.noGear=true;
    detach(pl,key,V0.clone().addScaledVector(f,sign*(ground?1.5:3)).add(new THREE.Vector3(0,ground?1.5:1,0)),new THREE.Vector3(0,0,0).addScaledVector(new THREE.Vector3(f.z,0,-f.x),sign*rand(.25,.6)).add(new THREE.Vector3(0,rand(-.2,.2),0)),{fire:rand(20,35),burn:Math.random()<.5});
    burn(partsOf(pl).mid); if(ground) pl.pitchT=sign*.06; }
  function explodeAll(pl,V0,ground){ const P=pl.pos.clone().setY(pl.pos.y+3), {f,s}=axes(pl);
    fireball(P,ground?14:12,14); blast(P.clone(),3);
    for(const k of PART_KEYS){ const p=partPos(pl,k), out=p.clone().sub(P).setY(0); if(out.lengthSq()<.1) out.copy(rnd3(1).setY(0)); out.normalize();
      const big=k==='mid', sp=big?rand(1,3):rand(6,15);
      detach(pl,k,V0.clone().addScaledVector(out,sp).add(new THREE.Vector3(0,big?rand(2,4):rand(5,13),0)),rnd3(big?.4:2.5),{fire:rand(25,45),burn:Math.random()<.8,big}); }
    pl.g.visible=false; pl._gone=true; return {mode:'cata'}; }
  function airBreak(pl){ const I=hitInfo(pl), sd=sideOf(pl,I.lx), V0=velOf(pl), R=Math.random();
    pl._air=true;
    if(I.he&&R<.28){ explodeAll(pl,V0,0); pl.state=3; pl.burn=now; return; }                     // estalla en el aire
    if(sd&&!I.mg){ breakWing(pl,sd,V0,false); pl.spin=sd*rand(1.4,2.4); pl.turn=-sd*rand(.25,.45); return; }   // pierde el ala: cae girando
    // fuego: cae en picada; a veces se le sale un ala al rato
    const e=Math.random()<.5?1:-1; fires.push({o:partsOf(pl)['e'+e],t:now+60,next:0}); pl.spin=e*rand(.15,.5);
    if(Math.random()<.5) pl.lateWing={t:now+rand(2,4),sd:e}; }
  function impact(pl){ const V0=velOf(pl).multiplyScalar(.45).setY(0), R=Math.random();
    if(R<.6) explodeAll(pl,V0,1); else { breakFuse(pl,Math.random()<.5?'nose':'tail',V0,true); for(const sd of [-1,1]) if(Math.random()<.6) breakWing(pl,sd,V0,true); } }

  function install(){
    if(typeof planeBoom!=='function'||typeof planeHit!=='function') return;
    const _ph=planeHit;
    planeHit=function(pl,dmg,by,pt,A){
      try{ if(pt&&pl.g){ pl.g.updateMatrixWorld(true); const l=pl.g.worldToLocal(pt.clone()); pl._hit={lx:l.x,lz:l.z,he:!!A&&(A.kind==='he'||A.kind==='hesh'||A.kind==='heat'),mg:!A,big:!!A}; } }catch(e){}
      return _ph.apply(this,arguments); };
    // reemplaza la explosión de siempre: ahora depende del daño
    const legacyBoom=planeBoom;
    planeBoom=function(pl,ground){ try{
      if(!partsOf(pl)){ return legacyBoom(pl,ground); }
      const P=pl.pos.clone().setY(pl.pos.y+2.5);
      if(ground&&pl._air){ impact(pl); pl.sec=sec(pl,4); return; }                                  // llegó al suelo después de caer
      if(!ground){ airBreak(pl); return; }
      const r=groundBreak(pl);
      if(r.mode==='burn'){ const e=Math.random()<.5?1:-1, ep=partPos(pl,'e'+e); fireball(ep,4,4); burn(partsOf(pl)['e'+e]); fires.push({o:partsOf(pl)['e'+e],t:now+50,next:0});
        pl.stage2={t:now+rand(4,8)}; pl.sec=[]; return; }
      pl.sec=sec(pl,r.mode==='cata'?3:r.mode==='split'?3:2);
    }catch(e){ console.error('avion-roto',e); } };
    const sec=(pl,n)=>{ const L=(pl.g.userData.dim&&pl.g.userData.dim.L)||36; return Array.from({length:n},(_,i)=>({t:now+.5+i*.55+rand(0,.3),o:rand(-L*.35,L*.35),s:rand(-5,5)})); };
    // cada cuadro: pedazos, fuegos, giro del que cae sin ala, segunda etapa de los incendiados, estacionados
    const _up=updatePlanes; updatePlanes=function(dt){ const r=_up.apply(this,arguments); try{ tick(dt); }catch(e){ console.error('avion-roto',e); } return r; };
    const _cl=clearCivLife; clearCivLife=function(){ for(const p of pieces) if(p.o.parent) p.o.parent.remove(p.o); pieces.length=0; fires.length=0; return _cl.apply(this,arguments); };
  }
  function tick(dt){
    for(const pl of civPlanes.concat(parked)){ if(!pl.g) continue;
      if(pl.spin&&pl.state===2){ pl.roll=(pl.roll||0)+pl.spin*dt; if(pl.turn){ pl.yaw=wrap(pl.yaw+pl.turn*dt); pl.dir.set(Math.sin(pl.yaw),0,Math.cos(pl.yaw)); } }
      if(pl.lateWing&&now>pl.lateWing.t&&pl.state===2){ const sd=pl.lateWing.sd; pl.lateWing=null; breakWing(pl,sd,velOf(pl),false); pl.spin=sd*rand(1.4,2.2); pl.turn=-sd*.35; }
      if(pl.rollT!=null) pl.roll=(pl.roll||0)+(pl.rollT-(pl.roll||0))*Math.min(1,dt*3);
      if(pl.roll||pl.pitchT){ pl.g.rotation.set(-(pl.pitch||0)+(pl.pitchT||0),pl.yaw,pl.roll||0,'YXZ'); }
      if(pl.stage2&&now>pl.stage2.t&&!net.guest){ pl.stage2=null; const sd=Math.random()<.5?1:-1; if(Math.random()<.55) breakWing(pl,sd,new THREE.Vector3(),true); else breakFuse(pl,Math.random()<.5?'nose':'tail',new THREE.Vector3(),true); pl.sec=sec2(pl); }
      const gr=pl.g.userData.gear; if(gr&&pl.noGear&&pl.state>=3) gr.visible=false; }
    // estacionados: explosiones secundarias y humo (los que despegan los maneja 11-personas.js)
    for(let i=parked.length-1;i>=0;i--){ const pl=parked[i]; if(!pl.g.parent){ parked.splice(i,1); const j=civHits.indexOf(pl.hit); if(j>=0) civHits.splice(j,1); continue; }
      if(!civHits.includes(pl.hit)&&pl.state<3) civHits.push(pl.hit);
      if(pl.sec&&pl.sec.length&&now>=pl.sec[0].t){ const e=pl.sec.shift(), {f,s}=axes(pl), q=pl.pos.clone().addScaledVector(f,e.o).addScaledVector(s,e.s).setY(pl.pos.y+2); blast(q,1.4); puff(q.clone(),0xff9a40,rand(7,11),1,3,1,true); boom(distVol(q,.6),1.2,260); }
      if(pl.state===3&&now<pl.burn){ pl.bt=(pl.bt||0)-dt; if(pl.bt<=0){ pl.bt=.4; puff(pl.pos.clone().add(new THREE.Vector3(rand(-8,8),3,rand(-8,8))),0x2a2622,rand(4,7),3,2.5,.7); } } }
    // pedazos sueltos
    for(const pc of pieces){ if(pc.rest) continue; const o=pc.o;
      pc.v.y-=G*dt; o.position.addScaledVector(pc.v,dt); const wl=pc.w.length(); if(wl>1e-4){ _q.setFromAxisAngle(_v.copy(pc.w).divideScalar(wl),wl*dt); o.quaternion.premultiply(_q); }
      o.updateMatrixWorld(true); let lo=1e9, lp=null; for(const c of pc.c){ const w=c.clone().applyMatrix4(o.matrixWorld); if(w.y<lo){ lo=w.y; lp=w; } }
      const gy=heightAt(o.position.x,o.position.z);
      if(lo<gy){ o.position.y+=gy-lo;
        if(pc.v.y<-4&&pc.bounce<2){ pc.bounce++; pc.v.y=-pc.v.y*.22; pc.v.x*=.55; pc.v.z*=.55; pc.w.multiplyScalar(.45);
          puff(lp.clone().setY(gy+.5),W.dust||0x8a7a62,rand(3,5),rand(1.5,2.5),.6,.6); debris(lp.clone().setY(gy+.3),5,dirtMat,4,1); if(pc.bounce===1) boom(distVol(lp,.4),.6,180); }
        else { pc.v.y=Math.max(0,pc.v.y); const k=Math.max(0,1-dt*3); pc.v.x*=k; pc.v.z*=k; pc.w.multiplyScalar(Math.max(0,1-dt*4));
          // se acuesta: el "arriba" de la pieza va hacia el arriba (o el abajo) del mundo
          const up=_v.set(0,1,0).applyQuaternion(o.quaternion), tgt=up.y>=0||pc.key==='mid'?UP:new THREE.Vector3(0,-1,0); _q2.setFromUnitVectors(up.clone(),tgt); _q.identity().slerp(_q2,Math.min(1,dt*3)); o.quaternion.premultiply(_q);
          pc.gt=(pc.gt||0)+dt; if(pc.v.lengthSq()<.04&&pc.w.lengthSq()<.01&&(Math.abs(up.y)>.97||pc.gt>6)) pc.rest=true;   /* no queda parada de canto: termina de acostarse */ } } }
    // fuegos de los pedazos y de los motores
    for(let i=fires.length-1;i>=0;i--){ const F=fires[i]; if(!F.o||now>F.t||!F.o.parent&&!F.o.userData){ fires.splice(i,1); continue; } F.next-=dt; if(F.next>0) continue; F.next=F.big?.25:.4;
      const p=F.o.getWorldPosition(new THREE.Vector3()); puff(p.clone().add(new THREE.Vector3(rand(-1,1),1,rand(-1,1))),0x24201d,rand(3,5)*(F.big?1.6:1),rand(2.5,4),2.2,.7); if(Math.random()<.6) puff(p.clone().setY(p.y+.4),0xff8a30,rand(1.5,2.5)*(F.big?1.5:1),.5,1.2,1,true); }
  }
  const sec2=pl=>{ const L=(pl.g.userData.dim&&pl.g.userData.dim.L)||36; return [0,1].map(i=>({t:now+.4+i*.6,o:rand(-L*.3,L*.3),s:rand(-4,4)})); };
  // los dos de la plataforma (super-aero.js): blanco destruible con la misma vida que los que despegan
  window.parkPlane=function(P,a){ const d=P.userData.dim||{L:36,span:17}; const hit=new THREE.Mesh(new THREE.BoxGeometry(d.span*2*.75,5,d.L*.85),new THREE.MeshBasicMaterial({visible:false})); hit.position.y=3; P.add(hit);
    const pl={id:'p'+parked.length,g:P,hit,pos:P.position,yaw:a,dir:new THREE.Vector3(Math.sin(a),0,Math.cos(a)),v:0,vy:0,pitch:0,state:-2,hp:150,parked:true}; hit.userData.plane=pl; parked.push(pl); civHits.push(hit); return pl; };
  window.avionRotoInfo=()=>({pieces:pieces.length,fires:fires.length,parked:parked.map(p=>p.state)});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install); else install();
})();
