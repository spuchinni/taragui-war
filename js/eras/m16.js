/* ---------- M16 MGMC rehecho (22/11/2026, pedido de Sebastián con "M16 MGMC (War Thunder)" de Sketchfab de referencia; por código) ----------
   Medidas del TM 9-710: 6,17 × 2,16 × 2,34 m, distancia entre ejes 3,43 m, cubiertas 8,25-20 (0,95 m), oruga de goma con un bogie de 4 ruedas.
   Semioruga M3 con trompa de persianas blindadas, rodillo para zanjas, guardabarros curvos, cabina abierta con parabrisas blindado
   y la caja de atrás con los costados de arriba rebatidos (en el M16 se bajaban para que el montaje gire los 360°).
   Montaje Maxson M45: torreta en un pedestal, el apuntador sentado en el medio detrás de la chapa del frente con las dos "orejas" curvas,
   y a cada lado dos Browning M2 de 12,7 mm (una arriba de otra) con su cajón de 200 tiros afuera; armas y cajones suben juntos (gunPivot).
   Tripulación a la vista (t.crewFig, se apaga si muere ese puesto): conductor y jefe en la cabina, apuntador en el montaje (gira con él)
   y dos cargadores parados en la caja. */
(()=>{
  const _b=buildHT;
  buildHT=function(t,M,mat,root,lkL,lkR){ if(!(M.ht&&M.ht.m16)) return _b.apply(this,arguments); return m16(t,M,mat,root,lkL,lkR); };
  const prism=(parent,pts,w,x,mat)=>{ const g=profGeo(pts,w); const m=new THREE.Mesh(g,mat); m.position.x=x; m.castShadow=m.receiveShadow=true; parent.add(m); return m; };
  function sit(P,legs){ const p=P.parts; p.hip.position.y-=.42; p.legL.rotation.x=p.legR.rotation.x=-(legs||1.45); }
  function m16(t,M,mat,root,lkL,lkR){
    const W=2.16, hw=W/2, zf=3.0, zr=-3.08, fy=.98;                       // fy = piso de la caja
    const add=g=>{ const m=new THREE.Mesh(g,mat); m.castShadow=m.receiveShadow=true; root.add(m); return m; };
    // ---- oruga de goma: bogie de 4 ruedas con su viga, motriz adelante con dientes, tensora atrás ----
    const tl=2.55, tz0=-1.38, tw=.31, tx=hw-tw/2-.06;
    const prof=[[tz0+tl/2-.1,.66],[tz0-tl/2+.12,.66],[tz0-tl/2,.42],[tz0-tl/2+.32,0],[tz0+tl/2-.5,0],[tz0+tl/2-.12,.18],[tz0+tl/2,.46]];
    for(const s of [-1,1]){ const x=s*tx; trackLoop(root,prof,tw,x,s>0?lkR:lkL,sideTrkMat,.05);
      for(let i=0;i<4;i++) dWheel(root,x,.21,tz0-.78+i*.5,.2,mat,{rim:.7});
      rbox(root,.07,.16,1.7,x+s*.14,.3,tz0-.03,darkMat,.03); cyl(root,.06,.06,.5,x+s*.15,.42,tz0,8,darkMat).rotation.z=Math.PI/2;   // viga del bogie y resorte
      for(const z of [tz0-.6,tz0+.5]) dWheel(root,x,.56,z,.09,mat,{rim:.8});                                   // rodillos de arriba
      sprocketT(root,x,.42,tz0+tl/2-.28,.3,18,mat); dWheel(root,x,.36,tz0-tl/2+.24,.3,mat,{rim:.62,holes:6}); }
    // ---- ruedas delanteras con cubierta militar y guardabarros curvo ----
    for(const s of [-1,1]){ const x=s*(hw-.2), wz=2.1;
      const w=dWheel(root,x,.475,wz,.475,mat,{rim:.56,holes:8}); cyl(root,.09,.09,.34,x+s*.02,.475,wz,8,darkMat).rotation.z=Math.PI/2;
      const fg=new THREE.Mesh(new THREE.CylinderGeometry(.58,.58,.4,14,1,true,-.2,Math.PI*.82),mat); fg.material=mat; fg.rotation.z=Math.PI/2; fg.rotation.y=0; fg.position.set(x,.5,wz); fg.castShadow=true; root.add(fg);
      box(root,.42,.04,.95,x,1.0,1.15,mat);                                                                    // estribo/guardabarros hasta la cabina
      box(root,.3,.12,.04,x,.72,.68,mat); }                                                                     // faldón detrás de la rueda
    // ---- chasis, paragolpes con rodillo para zanjas y faros ----
    for(const s of [-1,1]) box(root,.1,.18,5.6,s*.42,.62,.1,darkMat);
    { const r=cyl(root,.16,.16,1.78,0,.62,zf+.02,14,darkMat); r.rotation.z=Math.PI/2; for(const s of [-1,1]){ box(root,.08,.12,.42,s*.86,.64,zf-.18,mat); cyl(root,.18,.18,.06,s*.88,.62,zf+.02,12,mat).rotation.z=Math.PI/2; } }
    for(const s of [-1,1]){ const h=cyl(root,.085,.085,.12,s*.62,1.02,2.78,10,darkMat); h.rotation.x=Math.PI/2; box(root,.22,.04,.2,s*.62,1.1,2.76,darkMat); }  // faros con visera
    // ---- capó: persianas blindadas al frente, chapas laterales con rejillas, bisagra al medio ----
    prism(root,[[2.78,1.33],[1.22,1.36],[1.22,.78],[2.8,.78]],1.18,0,mat);
    rbox(root,1.2,.6,.06,0,1.05,2.82,mat,.02); for(let i=0;i<8;i++) box(root,1.08,.03,.06,0,.82+i*.064,2.86,darkMat);   // persianas
    box(root,.03,.03,1.5,0,1.36,2.0,darkMat); for(const s of [-1,1]){ for(let i=0;i<4;i++) box(root,.02,.05,.42,s*.6,1.12-i*.08,1.75,darkMat); }
    // ---- cabina abierta: parabrisas blindado alzado con dos visores, puertas bajas con la chapa de arriba, tablero y volante ----
    { const ws=box(root,W-.08,.52,.05,0,1.62,1.18,mat); ws.rotation.x=-.08; for(const sx of [-.48,.48]) box(root,.42,.07,.07,sx,1.66,1.2,darkMat);
      for(const s of [-1,1]) box(root,.05,.55,.08,s*(hw-.06),1.6,1.18,mat); }
    for(const s of [-1,1]){ box(root,.04,.42,1.1,s*(hw-.02),1.18,.62,mat); box(root,.04,.3,1.1,s*(hw-.02),1.52,.62,mat).rotation.z=s*-.06;   // puerta y chapa de arriba
      box(root,.05,.03,.2,s*hw,1.3,.25,darkMat); }                                                               // manija
    box(root,W-.12,.22,.06,0,1.22,1.12,darkMat);                                                                 // tablero
    { const sw=new THREE.Mesh(new THREE.TorusGeometry(.2,.022,6,16),darkMat); sw.position.set(-.42,1.42,.88); sw.rotation.x=-1.0; root.add(sw); cyl(root,.025,.025,.5,-.42,1.25,.98,6,darkMat).rotation.x=-1.0; }
    for(const s of [-1,1]) rbox(root,.5,.12,.5,s*.42,1.22,.42,darkMat,.04);                                    // asientos de adelante
    // ---- caja de atrás: piso, costados bajos con la chapa de arriba rebatida hacia afuera, popa con puerta, cajones ----
    box(root,W-.1,.06,3.1,0,fy,-1.48,darkMat);
    add(profGeo([[.05,fy],[zr,fy],[zr,.62],[.05,.62]],W-.04));
    for(const s of [-1,1]){ box(root,.05,.42,3.12,s*(hw-.03),fy+.21,-1.48,mat);                                // costado bajo
      const fl=box(root,.04,.46,2.6,s*(hw+.16),fy+.38,-1.72,mat); fl.rotation.z=s*-1.2;                          // chapa de arriba rebatida
      for(const z of [-.6,-1.7,-2.8]) box(root,.06,.08,.12,s*(hw+.02),fy+.44,z,darkMat); }                      // bisagras
    box(root,W-.1,.45,.05,0,fy+.22,zr+.02,mat); box(root,.6,.4,.03,.35,fy+.22,zr-.01,mat); box(root,.04,.08,.05,.12,fy+.25,zr-.04,darkMat);
    for(const s of [-1,1]) rbox(root,.4,.3,.9,s*.72,fy+.18,-.4,mat,.03);                                        // cajones de munición contra la cabina
    { const a=cyl(root,.012,.012,2.0,-hw+.18,2.4,-.15,4,darkMat); box(root,.12,.1,.12,-hw+.18,1.38,-.15,darkMat); }
    // ---- insignias: estrella en los costados ----
    if(M.ht.ins) for(const s of [-1,1]) w2Insignia(root,M.ht.ins,s*(hw+.005),fy+.22,-1.3,s>0?0:Math.PI,.55);
    // ---- montaje Maxson M45 ----
    const mz=-1.75, tur=new THREE.Group(); tur.position.set(0,fy+.04,mz); root.add(tur);
    cyl(root,.42,.5,.22,0,fy+.11,mz,14,darkMat);                                                                // pedestal
    cyl(tur,.62,.62,.1,0,.12,0,18,mat); cyl(tur,.5,.56,.26,0,.3,0,16,mat);                                      // aro y cuerpo de la torreta
    box(tur,.36,.06,.38,0,.43,-.05,darkMat); box(tur,.06,.2,.06,0,.35,-.2,darkMat); box(tur,.36,.42,.05,0,.68,-.24,darkMat);   // asiento y respaldo del apuntador
    { const fr=box(tur,.86,.62,.05,0,.82,.36,mat); fr.rotation.x=-.18; box(tur,.18,.08,.06,0,1.08,.31,darkMat);   // chapa del frente con la mira
      for(const s of [-1,1]){ const ear=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.5,10,1,true,s>0?0:Math.PI*.62,Math.PI*.38),mat);
        ear.position.set(s*.1,1.22,.0); ear.castShadow=true; tur.add(ear); } }                                    // "orejas" curvas a los costados de la cabeza
    const G=gunMount(t,tur,0,1.02,.05,1.2,.022,mat,{shield:false}); G.bm.visible=false;
    // a cada lado: cuna con dos M2 (camisa con agujeros, cajón de mecanismos) y el cajón de 200 tiros afuera
    for(const s of [-1,1]){
      box(G.gp,.1,.62,.7,s*.46,0,-.05,mat);                                                                     // placa de la cuna
      for(const dy of [.17,-.17]){ const gx=s*.58;
        box(G.barrel,.13,.14,.62,gx,dy,-.02,darkMat);                                                           // cajón de mecanismos
        const jk=cyl(G.barrel,.04,.04,.55,gx,dy,.55,10,darkMat); jk.rotation.x=Math.PI/2;                        // camisa perforada
        const b=cyl(G.barrel,.016,.016,1.15,gx,dy,1.0,6,darkMat); b.rotation.x=Math.PI/2;                        // caño
        const mb=cyl(G.barrel,.03,.022,.08,gx,dy,1.58,8,darkMat); mb.rotation.x=Math.PI/2;                       // apagallamas
        box(G.barrel,.05,.08,.12,gx,dy-.08,-.36,darkMat);                                                       // empuñaduras
        rbox(G.gp,.2,.24,.5,s*.8,dy,-.06,mat,.06);                                                              // cajón de munición
        box(G.gp,.08,.04,.12,s*.68,dy+.04,.06,darkMat); }                                                       // tolva de la cinta
    }
    G.muzzle.position.set(0,0,1.62);
    t.turret=tur; t.gunPivot=G.gp; t.barrel=G.barrel; t.muzzle=G.muzzle; t.coax=G.coax; t.barrelMesh=G.bm;
    // ---- tripulación a la vista ----
    const L=t.crewFig=t.crewFig||[];
    const crew=(seat,parent,x,y,z,ry,o={})=>{ const P=crewFig(t); if(!P) return; P.g.position.set(x,y,z); P.g.rotation.y=ry||0;
      if(o.sit) sit(P,o.sit); if(o.arms){ P.parts.armL.rotation.x=o.arms[0]; P.parts.armR.rotation.x=o.arms[1]; }
      parent.add(P.g); (t.deco||(t.deco=[])).push(P.g); L.push({P,seat}); return P; };
    if(!t.T.static){
      crew('driver',root,-.42,fy-.2,.38,0,{sit:1.5,arms:[-1.1,-1.1]});                                          // conductor, manos en el volante
      crew('commander',root,.42,fy-.2,.38,0,{sit:1.5,arms:[-.3,-.6]});                                         // jefe
      crew('gunner',tur,0,-.04,-.06,0,{sit:1.45,arms:[-1.35,-1.35]});                                             // apuntador en el asiento del montaje
      crew('loader',root,-.7,fy+.04,-2.75,.5,{arms:[-.5,-.9]}); crew('loader',root,.72,fy+.04,-2.7,-.6,{arms:[-.7,-.4]}); }   // cargadores
    collider(tur,1.9,1.0,1.0,0,.8,0,t,'turret'); collider(root,W,1.5,6.1,0,.8,0,t,'hull');
    t.hTop=1.55; t.topH=2.34; t.aimH=1.2; t.glL=.6;
    t.seatPos={driver:V3(-.42,1.25,.4),commander:V3(.42,1.25,.4),gunner:V3(0,1.6,mz),loader:V3(0,1.3,-2.7),mg1:V3(0,1.3,-2.7),
      engine:V3(0,1.0,2.0),trans:V3(0,.7,1.0),ammo:V3(.72,1.15,-.4),breech:V3(0,2.0,mz+.2)};
  }
})();
