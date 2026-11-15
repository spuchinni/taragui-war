/* ---------- Posturas con el arma (tanda de infantería, pedido de Sebastián: "los brazos pasan de largo el fusil") ----------
   Los brazos ahora tienen codo (personas.js: armL/armR + userData.fore). Acá, después de la animación de siempre (animInf), los soldados
   con fusil, subfusil, fusil antitanque o lanzacohetes ponen el arma donde corresponde y las manos sobre ella (IK de dos huesos):
   - apuntando (quieto, rodilla en tierra, cuerpo a tierra o recién tiró): culata en el hombro, mejilla en la culata, mano derecha en el
     pistolete con el codo afuera y la izquierda bajo la caja;
   - caminando o corriendo: el arma cruzada sobre el pecho ("arma terciada"), boca arriba a la izquierda.
   Todo en el espacio de la cadera (los brazos y el arma cuelgan de ella), así sigue la inclinación del cuerpo. */
(()=>{
  const L1=.29, L2=.29, Y_=new THREE.Vector3(0,-1,0);
  const _S=new THREE.Vector3(), _E=new THREE.Vector3(), _n=new THREE.Vector3(), _p=new THREE.Vector3(), _q=new THREE.Quaternion(), _qi=new THREE.Quaternion(), _d=new THREE.Vector3(),
    _m=new THREE.Matrix4(), _x=new THREE.Vector3(), _y=new THREE.Vector3(), _z=new THREE.Vector3();
  // brazo A (hombro en A.position) hacia la mano H, con el codo hacia "pole" (todo en el espacio de la cadera)
  function ik(A,H,pole){ const F=A.userData.fore; if(!F) return; _S.copy(A.position);
    _d.subVectors(H,_S); let d=_d.length(); if(d<1e-4) return; _n.copy(_d).multiplyScalar(1/d); d=Math.min(d,L1+L2-.002);
    const a=(L1*L1-L2*L2+d*d)/(2*d), h=Math.sqrt(Math.max(0,L1*L1-a*a));
    _p.copy(pole).addScaledVector(_n,-pole.dot(_n)).normalize();
    _E.copy(_S).addScaledVector(_n,a).addScaledVector(_p,h);
    _d.subVectors(_E,_S).normalize(); A.quaternion.setFromUnitVectors(Y_,_d);
    _d.subVectors(H,_E).normalize(); _qi.copy(A.quaternion).invert(); _d.applyQuaternion(_qi); F.quaternion.setFromUnitVectors(Y_,_d); }
  // pone el arma: culata en B, apuntando hacia dir, con "arriba" up
  function place(w,B,dir,up,zMin){ _z.copy(dir).normalize(); _x.crossVectors(up,_z).normalize(); _y.crossVectors(_z,_x);
    _m.makeBasis(_x,_y,_z); w.quaternion.setFromRotationMatrix(_m); w.position.copy(B).addScaledVector(_z,-zMin*w.scale.z); }
  const info=w=>{ if(w.userData.pi&&w.userData.pi.g===w.geometry) return w.userData.pi; const g=w.geometry; if(!g) return null; if(!g.boundingBox) g.computeBoundingBox();
    const b=g.boundingBox; return w.userData.pi={g,z0:b.min.z,len:(b.max.z-b.min.z)}; };
  const OK={rifle:1,eng:1,sniper:1,at:1};
  const poleR=new THREE.Vector3(), poleL=new THREE.Vector3(), Hr=new THREE.Vector3(), Hl=new THREE.Vector3(), B=new THREE.Vector3(), D=new THREE.Vector3(), U=new THREE.Vector3(),
    Fw=new THREE.Vector3(), Up=new THREE.Vector3(), X=new THREE.Vector3(1,0,0), B2=new THREE.Vector3(), D2=new THREE.Vector3(), Hr2=new THREE.Vector3(), Hl2=new THREE.Vector3();
  function hold(P,dt){ const p=P.parts, w=p&&p.wep; if(!w||!p.armL.userData.fore||!p.armR.userData.fore||w.parent!==p.hip) return;
    const I=info(w); if(!I) return; const bb=w.geometry.boundingBox, tube=P.kind==='at'&&(bb.max.y-bb.min.y)>(bb.max.z-bb.min.z)*2;   // el tubo está parado sobre su eje y
    // ¿apunta o lleva el arma? (se mezcla de a poco)
    const aiming=P.pose===1||P.pose===2||(P.spd||0)<.3||now-(P.kickT||0)<2.5, k=Math.min(1,dt*5);
    P.aimK=(P.aimK??(aiming?1:0))+((aiming?1:0)-(P.aimK??0))*k; const a=P.aimK;
    // marco "del mundo" visto desde la cadera inclinada: adelante y arriba horizontales
    const l=p.hip.rotation.x; Fw.set(0,Math.sin(l),Math.cos(l)); Up.set(0,Math.cos(l),-Math.sin(l));
    const kick=now-(P.kickT||0)<.12?.05:0;
    if(tube){ // lanzacohetes al hombro derecho; las dos manos en las empuñaduras de abajo
      const c=_p.set(.2,.56,0).addScaledVector(Up,.1); w.position.copy(c).addScaledVector(Fw,.12-kick); w.quaternion.setFromUnitVectors(_d.set(0,1,0),Fw);
      Hr.copy(c).addScaledVector(Fw,.22).addScaledVector(Up,-.12); Hl.copy(c).addScaledVector(Fw,.5).addScaledVector(Up,-.1).addScaledVector(X,-.04);
      ik(p.armR,Hr,poleR.set(.7,-1,-.2)); ik(p.armL,Hl,poleL.set(-.4,-1,0)); return; }
    const len=I.len*w.scale.z, short=len<1;
    // apuntando: culata en el hombro, la línea de mira a la altura del ojo derecho
    B.set(.075,.56,0).addScaledVector(Up,.1).addScaledVector(Fw,.04-kick); D.copy(Fw).addScaledVector(Up,-.03);
    Hr.copy(B).addScaledVector(Fw,.2).addScaledVector(Up,-.09).addScaledVector(X,.025);                       // pistolete
    Hl.copy(B).addScaledVector(Fw,short?.36:Math.min(.5,len*.42)).addScaledVector(Up,-.07).addScaledVector(X,-.01);   // bajo la caja
    // llevándola: cruzada sobre el pecho, boca arriba a la izquierda
    B2.set(.2,.26,.22); D2.set(-.72,.62,.3).normalize();
    Hr2.copy(B2).addScaledVector(D2,.17).add(_d.set(0,-.02,.04)); Hl2.copy(B2).addScaledVector(D2,short?.36:.5).add(_d.set(-.02,-.03,.05));
    B.lerpVectors(B2,B,a); D.lerpVectors(D2,D,a).normalize(); Hr.lerpVectors(Hr2,Hr,a); Hl.lerpVectors(Hl2,Hl,a);
    U.copy(Up).lerp(_d.set(.35,.25,-1).normalize(),1-a).normalize();                                             // llevándola, la mira hacia la cara
    place(w,B,D,U,I.z0);
    ik(p.armR,Hr,poleR.set(.9,-1+a*.5,-.3)); ik(p.armL,Hl,poleL.set(-.3,-1,0)); }
  const _ai=animInf; animInf=function(P,dt){ const r=_ai.apply(this,arguments);
    try{ if(P&&!P.dead&&P.armed&&OK[P.kind]&&P.pose!==3&&!P.nest&&!P.fall&&P.parts) hold(P,dt); }catch(e){} return r; };
  window.infHold=hold; window.armIK=ik;
})();
