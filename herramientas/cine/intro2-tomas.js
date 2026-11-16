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
   CAM=()=>{ const u=ease(CAM_U), p=rel(t,lerp(5,7,u),0,lerp(17,21,u)); p.y=ground(p.x,p.z)+lerp(.8,2.2,u); fov(48); camera.position.copy(p); camera.lookAt(rel(t,0,lerp(7,10,u),-20)); }; return true; })()`},
 {id:'m60',map:'itati',wx:'tarde',ed:[13.54,14.88],hits:[.82],setup:`(()=>{ const Z=spot(1); const t=act('m60a3',1,Z.x,Z.z,0);
   ON_T=s=>{ if(s>=.82&&!t._f){ t._f=1; shoot(t); } };
   CAM=()=>{ const u=CAM_U, p=rel(t,lerp(-6,-5,u),0,lerp(9,7,u)); p.y=ground(p.x,p.z)+.9; fov(38); camera.position.copy(p); camera.lookAt(rel(t,0,1.8,1)); }; return true; })()`},
 {id:'tam2c',map:'itati',wx:'tarde',ed:[14.88,16.3],hits:[.31],setup:`(()=>{ const Z=spot(2); const t=act('tam2c',0,Z.x,Z.z,0);
   ON_T=s=>{ if(s>=.31&&!t._f){ t._f=1; shoot(t); } };
   CAM=()=>{ const u=CAM_U, p=rel(t,lerp(2.6,2.2,u),0,lerp(12,10,u)); p.y=t.pos.y+1.5; fov(30); camera.position.copy(p); camera.lookAt(rel(t,0,2,0)); }; return true; })()`},
 // --- cierre: el logo sobre un campo que se aleja ---
 {id:'final',map:'itati',wx:'tarde',ed:[16.3,20.6],logo:1,setup:`(()=>{ const Z=spot(1); const L=[act('tam',0,Z.x,Z.z,0),act('tam2c',0,Z.x+9,Z.z-7,0),act('repot',0,Z.x-9,Z.z-8,0)]; L.forEach(t=>t.cine.th=.5);
   CAM=()=>{ const u=ease(CAM_U), t=L[0], p=rel(t,lerp(3,8,u),0,lerp(18,40,u)); p.y=ground(p.x,p.z)+lerp(2,16,u); fov(40); camera.position.copy(p); camera.lookAt(rel(t,0,1.5,-4)); }; return true; })()`},
];
