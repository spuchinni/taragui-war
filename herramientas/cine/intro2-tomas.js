// Tomas del video de la intro (2.ª versión, con los tanques mejorados), sincronizadas con "War Horn and Drums" (18,15 s).
// Cada toma: mapa, clima, duración, setup (JS que corre en la página y arma actores + CAM) y los golpes de la música en tiempo de la toma.
// En la página: act(k,equipo,x,z,rumbo) pone un tanque manejado por guion (t.cine={th,st}); CAM() mueve la cámara con CAM_U (0→1) y CAM_T (s);
// ON_T(t) corre cada cuadro para los disparos y explosiones. ed = [inicio, fin] en el video final.
module.exports=[
 // --- cuerno (0–6 s): tomas lentas, una por época ---
 {id:'mk1',map:'somme',wx:'niebla',ed:[0,1.97],cap:'1916',grade:'old',setup:`(()=>{ const Z=spot(1,140); const t=act('mk1',0,Z.x,Z.z,0); t.cine.th=1;
   CAM=()=>{ const u=ease(CAM_U), p=rel(t,lerp(15,13,u),0,lerp(7,-1,u)); p.y=ground(p.x,p.z)+1.3; fov(36); camera.position.copy(p); camera.lookAt(rel(t,0,1.8,1.5)); }; return true; })()`},
 {id:'tiger',map:'normandia',wx:'tarde',ed:[1.97,3.82],cap:'1944',setup:`(()=>{ const Z=spot(1); const t=act('tiger1',1,Z.x,Z.z,0); t.cine.th=.45; t.turretYaw=1.1;
   ON_T=s=>{ t.turretYaw=Math.max(.35,1.1-s*.4); t.gunPitch=0; t.turret.rotation.y=t.turretYaw; t.gunPivot.rotation.x=0; };
   CAM=()=>{ const u=ease(CAM_U), p=rel(t,lerp(-3.5,-2.5,u),0,lerp(11.5,9,u)); p.y=ground(p.x,p.z)+.9; fov(34); camera.position.copy(p); camera.lookAt(rel(t,0,2.1,0)); }; return true; })()`},
 {id:'nahuel',map:'campomayo',wx:'tarde',ed:[3.82,5.42],cap:'Nahuel DL-43 · 1944',setup:`(()=>{ const Z=spot(1); const t=act('nahuel',0,Z.x,Z.z,1.2); t.cine.th=.8;
   CAM=()=>{ const u=CAM_U, p=rel(t,-9,0,lerp(-3,2,u)); p.y=ground(p.x,p.z)+1.6; fov(38); camera.position.copy(p); camera.lookAt(rel(t,0,1.4,.5)); }; return true; })()`},
 // --- tambores (6–16,3 s): cortes en los golpes ---
 {id:'tigerfire',map:'normandia',wx:'tarde',ed:[5.9,7.45],hits:[.12],setup:`(()=>{ const Z=spot(1,30,22); const t=act('tiger1',1,Z.x,Z.z,0); t.gunPivot.rotation.x=0;
   ON_T=s=>{ if(s>=.12&&!t._f){ t._f=1; shoot(t); } };
   CAM=()=>{ const u=CAM_U, p=rel(t,lerp(6.5,7.2,u),0,lerp(9,10,u)); p.y=t.pos.y+1.2; fov(40); camera.position.copy(p); camera.lookAt(rel(t,0,2,3.5)); }; return true; })()`},
 {id:'t34',map:'prokhorovka',wx:'dia',ed:[7.45,8.8],hits:[.42],setup:`(()=>{ const Z=spot(1); const t=act('t3485',0,Z.x,Z.z,0); t.cine.th=1; for(let i=0;i<20;i++){ t.speed=Math.min(t.T.maxF,9); }
   const c=V3(0,0,0).copy(rel(t,5.5,0,24)); c.y=ground(c.x,c.z)+.5;
   { const a=rel(t,-4,0,-2), g=rel(t,-4,0,70), b=rel(t,4.5,0,-6), h=rel(t,4.5,0,70); squad(0,'ru',a.x,a.z,g.x,g.z,4); squad(0,'ru',b.x,b.z,h.x,h.z,4); }   // infantería que corre con el tanque
   ON_T=s=>{ t.speed=Math.max(t.speed,Math.min(t.T.maxF,10)); if(s>=.42&&!t._f){ t._f=1; shoot(t); } };
   CAM=()=>{ fov(40); camera.position.copy(c); camera.lookAt(t.pos.x,t.pos.y+1.6,t.pos.z); }; return true; })()`},
 {id:'sherman',map:'normandia',wx:'tarde',ed:[8.8,9.9],hits:[.33],setup:`(()=>{ const Z=spot(1,-40); const t=act('m4a1',0,Z.x,Z.z,1.5); t.cine.th=.5;
   ON_T=s=>{ if(s>=.33&&!t._f){ t._f=1; const P=t.pos.clone(); P.y+=1.6; explode(P,'metal',1.5); destroy(t,null,true); try{ rackBlow(t); }catch(e){} } };
   CAM=()=>{ const u=CAM_U; const p=t._cp||(t._cp=rel(t,-4,0,17)); p.y=ground(p.x,p.z)+1.4; fov(40); camera.position.copy(p); camera.lookAt(t.pos.x,t.pos.y+1.5+u*1.2,t.pos.z); }; return true; })()`},
 {id:'arty',map:'alamein',wx:'dia',ed:[9.9,11.85],hits:[.05,.6,1.15,1.6],setup:`(()=>{ const Z=spot(1,90); const A=[act('pz4f2',1,Z.x,Z.z,0),act('pz3j',1,Z.x+12,Z.z-8,0),act('pz3j',1,Z.x-13,Z.z-6,0)]; A.forEach(t=>t.cine.th=.55);
   const C=V3(Z.x,ground(Z.x,Z.z),Z.z+12), H=[.05,.6,1.15,1.6].map(h=>({h,p:V3(C.x+rand(-22,22),0,C.z+rand(-6,22))}));
   ON_T=s=>{ for(const e of H) if(s>=e.h&&!e.d){ e.d=1; e.p.y=ground(e.p.x,e.p.z); boom(e.p); } };
   CAM=()=>{ const u=ease(CAM_U), a=2.25+u*.3, r=lerp(44,36,u); fov(44); camera.position.set(C.x+Math.sin(a)*r,C.y+lerp(7,5,u),C.z+Math.cos(a)*r); camera.lookAt(C.x,C.y+2,C.z); }; return true; })()`},
 {id:'tam',map:'itati',wx:'tarde',ed:[11.85,13.54],cap:'TAM · Argentina',setup:`(()=>{ const Z=spot(0,0,1); const t=act('tam',0,Z.x,Z.z,Math.PI); t.cine.th=.55;
   { const a=rel(t,-4.5,0,-2), g=rel(t,-4.5,0,60), c=rel(t,4.5,0,-5), h=rel(t,4.5,0,60); squad(0,'ar',a.x,a.z,g.x,g.z,4); squad(0,'ar',c.x,c.z,h.x,h.z,3); }   // infantería con el tanque
   CAM=()=>{ const u=ease(CAM_U), p=rel(t,lerp(5,7,u),0,lerp(17,21,u)); p.y=ground(p.x,p.z)+lerp(.8,2.2,u); fov(48); camera.position.copy(p); camera.lookAt(rel(t,0,lerp(7,10,u),-20)); }; return true; })()`},
 {id:'m60',map:'itati',wx:'tarde',ed:[13.54,14.88],hits:[.82],setup:`(()=>{ const Z=spot(1); const t=act('m60a3',1,Z.x,Z.z,0);
   ON_T=s=>{ if(s>=.82&&!t._f){ t._f=1; shoot(t); } };
   CAM=()=>{ const u=CAM_U, p=rel(t,lerp(-6,-5,u),0,lerp(9,7,u)); p.y=ground(p.x,p.z)+.9; fov(38); camera.position.copy(p); camera.lookAt(rel(t,0,1.8,1)); }; return true; })()`},
 {id:'tam2c',map:'itati',wx:'tarde',ed:[14.88,15.66],hits:[.31],setup:`(()=>{ const Z=spot(2); const t=act('tam2c',0,Z.x,Z.z,0);
   ON_T=s=>{ if(s>=.31&&!t._f){ t._f=1; shoot(t); } };
   CAM=()=>{ const u=CAM_U, p=rel(t,lerp(2.6,2.2,u),0,lerp(12,10,u)); p.y=t.pos.y+1.5; fov(30); camera.position.copy(p); camera.lookAt(rel(t,0,2,0)); }; return true; })()`},
 // civiles que escapan por la calle y soldados que van para el otro lado (pedido de Sebastián)
 {id:'civ',map:'itati',wx:'tarde',ed:[15.66,16.99],setup:`(()=>{ const Z=spot(1,0,false,6); const C=V3(Z.x,0,Z.z); C.y=ground(C.x,C.z);
   for(let i=0;i<12;i++){ const P=makePerson('civ',-1,C.x+rand(-5,5),C.z-7-rand(0,13)); P.flee=true; P.cower=0; P.goal={x:C.x+rand(-5,5),z:C.z+60}; P.noEmb=now+99; }
   squad(0,'ar',C.x+4,C.z+2,C.x+4,C.z-80,5);
   CAM=()=>{ const u=CAM_U; fov(46); camera.position.set(C.x+1,C.y+1.6,C.z+4-u*2); camera.lookAt(C.x,C.y+1.3,C.z-10); }; return true; })()`},
 // --- cierre: el B-29 pasa sobre los tanques y suelta la bomba (16,99 s); la nuke estalla en el último golpe (17,95 s) y después entra la portada ---
 {id:'final',map:'itati',wx:'tarde',ed:[16.99,17.95],setup:`(()=>{ const Z=spot(0), H=Math.PI, dir=V3(0,0,-1); const L=[act('tam',0,Z.x,Z.z,H),act('tam2c',0,Z.x+8,Z.z+7,H),act('repot',0,Z.x-8,Z.z+8,H)]; L.forEach(t=>t.cine.th=0);   // quietos mientras se espera al avión (si no, la cámara terminaba adentro de una casa)
   { const a=rel(L[0],-4,0,-3), g=rel(L[0],-4,0,-80); squad(0,'ar',a.x,a.z,g.x,g.z,5); }
   const P=L[0].pos.clone().addScaledVector(dir,608); P.y=ground(P.x,P.z); nukeAt(L[0],P,dir); window._NK={P,dir,L,Z};
   const PL=()=>nuke&&nuke.plane; while(PL()&&!PL().dropped&&P.clone().sub(PL().g.position).setY(0).dot(dir)-PL().rel>PL().v*(.25+20/30)){ REC=null; frame(1/30); }
   L.forEach(t=>t.cine.th=.3); ON_T=()=>{ if(nuke&&nuke.bomb) nuke.bomb.m.scale.setScalar(3); };   // la bomba un poco más grande para que se vea caer for(const P of infantry) if(!P.dead&&P.goal) P.pos.set(P.pos.x,P.pos.y,P.pos.z);
   window._dropT=null; const _on=ON_T; ON_T=s=>{ _on(s); if(nuke&&nuke.bomb&&_dropT==null) _dropT=s; };
   CAM=()=>{ const PLn=nuke&&nuke.plane; if(!PLn) return; const g=PLn.g.position, d=PLn.dir, sd=V3(d.z,0,-d.x);   // la cámara sigue al B-29 desde atrás y abajo, y baja la vista a la bomba
     fov(46); camera.position.copy(g).addScaledVector(d,-42).addScaledVector(sd,16).add(V3(0,-7,0));
     const look=g.clone().addScaledVector(d,12), B=nuke.bomb, k=_dropT==null?0:Math.min(1,(CAM_T-_dropT)/.45);
     camera.lookAt(B?look.lerp(B.m.position.clone().add(V3(0,-6,0)),k*.75):look); }; return true; })()`},   // sin mirar derecho para arriba
 {id:'nuke',map:'itati',wx:'tarde',keep:1,ed:[17.95,22.8],logo:1,setup:`(()=>{ const N=window._NK; if(!N||!nuke) return false; window.WARM=0;
   const ttl=()=>{ const B=nuke.bomb; if(!B) return 0; const gh=ground(B.m.position.x,B.m.position.z)+30, y=B.m.position.y, vy=B.v.y; return (vy+Math.sqrt(Math.max(0,vy*vy+2*G*(y-gh))))/G; };
   for(let i=0;i<600&&(nuke.plane&&!nuke.plane.dropped||ttl()>.04);i++){ REC=null; frame(1/30); }
   const C=V3(N.Z.x-120,0,N.Z.z+70); C.y=ground(C.x,C.z)+45;   // de costado y alto: la basílica a la izquierda y el hongo sobre la ciudad
   CAM=()=>{ const u=ease(CAM_U); fov(46); camera.position.set(C.x-u*12,C.y+u*8,C.z+u*10); camera.lookAt(N.P.x,N.P.y+lerp(70,150,u),N.P.z); }; return true; })()`},
];
