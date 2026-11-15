/* ---------- Guerra Fría, 2.ª tanda: los 13 que seguían con el modelo de la v1 (pedido de Sebastián, 15/11/2026) ----------
   Comparados con modelos de Sketchfab (solo de referencia: no se bajan) y rehechos por código con el constructor detallado (m.ww1='w2').
   M1 Abrams, Leopard 2A4, Centurion Mk.10, Chieftain Mk.3, M113, M551 Sheridan, FV101 Scorpion, PT-76B, Marder 1A3, Ru 251,
   EE-9 Cascavel (a ruedas: m.w2.noTrk), Tiran-5Sh (sobre DET.t55) y el M3 Stuart paraguayo (el modelo del M3A1 de la 2.ª Guerra).
   Datos de juego (velocidad, blindaje, cañón, munición) sin cambios: solo cambia el modelo. Medidas: Wikipedia, Tank Encyclopedia y
   Military Today (Ru 251: 6,2 × 3,0 × 2,49 m sobre el chasis del Kanonenjagdpanzer, 90 mm BK 90/L40). */
(()=>{
  const rubM=new THREE.MeshLambertMaterial({color:0x262624}), lens=()=>_shLensMat();
  const rot=(m,x,y,z)=>{ m.rotation.set(x||0,y||0,z||0); return m; };
  const tube=(p,r,len,x,y,z,mat,seg)=>rot(cyl(p,r,r,len,x,y,z,seg||10,mat),Math.PI/2);                               // cilindro a lo largo de z
  const wheelsAt=(root,x,r,zs,mat,o)=>{ for(const z of zs) dWheel(root,x,r+.02,z,r,mat,o||{rim:.8}); };
  const rollers=(root,x,y,zs,mat)=>{ for(const z of zs) dWheel(root,x,y,z,.1,mat,{rim:.7}); };
  const span=(a,b,n)=>[...Array(n)].map((_,i)=>a+(b-a)*i/Math.max(1,n-1));
  const smoke=(tur,x,y,z,n,sx,rows=1)=>{ for(let r=0;r<rows;r++) for(let k=0;k<n;k++){ const c=cyl(tur,.045,.045,.26,x,y+r*.1,z-k*.1,8,darkMat); c.rotation.set(-.6,0,sx*1.0); } };
  const plan=(hw,hl,P)=>P.map(([a,b])=>[a*hw,b*hl]);
  const lights=(root,x,y,z,s=1)=>{ const h=rbox(root,.26*s,.17*s,.16*s,x,y,z,darkMat,.03); cyl(h,.055*s,.055*s,.04,0,0,.08*s,10,lens()).rotation.x=Math.PI/2; const g=new THREE.Mesh(_shGuard,darkMat); g.position.set(x,y+.04,z+.08); root.add(g); };
  const shackles=(root,x,y,z)=>{ for(const sx of [-1,1]){ const k=new THREE.Mesh(_tgShackle,darkMat); k.scale.setScalar(.8); k.position.set(sx*x,y,z); k.rotation.y=Math.PI/2; root.add(k); } };
  const hatchP=(root,x,y,z,r,n,mat,fz)=>{ cyl(root,r,r*1.04,.07,x,y+.03,z,14,mat); for(let k=0;k<n;k++) box(root,.1,.07,.06,x+(k-(n-1)/2)*.14,y+.07,z+(fz??r*.95),darkMat); };
  const grille=(root,w,l,x,y,z,mat,n)=>{ box(root,w,.03,l,x,y+.01,z,darkMat); for(let i=0;i<n;i++) box(root,w*.97,.04,.035,x,y+.03,z-l/2+(i+.5)*l/n,mat); };
  const cupola=(tur,x,y,z,r,h,n,mat)=>{ cyl(tur,r,r*1.06,h,x,y+h/2,z,16,mat); for(let k=0;k<n;k++){ const a=k/n*Math.PI*2; box(tur,.09,.06,.03,x+Math.sin(a)*(r+.01),y+h*.6,z+Math.cos(a)*(r+.01),_shGlass).rotation.y=a; } cyl(tur,r*.86,r*.86,.06,x,y+h+.03,z,14,mat); };
  const basket=(tur,w,h,l,y,z,fill)=>{ const g=new THREE.Group(); g.position.set(0,y,z); tur.add(g);
    box(g,w,.04,l,0,-h/2,0,darkMat); for(const sx of [-1,1]) box(g,.04,h,l,sx*w/2,0,0,darkMat); box(g,w,h,.04,0,0,-l/2,darkMat);
    for(let k=1;k<4;k++) box(g,w,.03,.03,0,-h/2+k*h/4,-l/2,darkMat); if(fill) rbox(g,w*.8,h*.7,l*.7,0,-h*.12,.02,_wdMat,.06); return g; };
  const antennas=(tur,pts,h=2.1)=>{ for(const [x,y,z] of pts){ cyl(tur,.04,.05,.1,x,y+.05,z,6,darkMat); cyl(tur,.012,.012,h,x,y+h/2,z,4,darkMat); } };
  const skirtPanels=(root,x,s,tw,y,h,z0,z1,n,mat,front)=>{ const so=x+s*(tw/2+.06), L=(z0-z1)/n;
    for(let k=0;k<n;k++){ const heavy=k<(front||0); rbox(root,heavy?.12:.05,h,L-.03,so+(heavy?s*.03:0),y-h/2,z0-(k+.5)*L,mat,.015); } };

  // ================= M1 Abrams (det 'abr') =================
  // 7 ruedas con barras de torsión, 2 rodillos, motriz atrás; faldones con las 3 primeras placas gruesas. Casco en cuña chato, conductor
  // al medio, rejilla grande de la turbina en la popa. Torre soldada de caras planas (blindaje Chobham) muy ancha y con el cesto atrás;
  // 105 mm M68 con manga térmica y evacuador, visor GPS a la derecha, cúpula del jefe con la .50, M240 del cargador, lanzahumos M250.
  function abrGear(root,I,x,s,tw,zf,zr,mat){ const r=.32, zs=span(zf-1.15,zr+1.1,7);
    wheelsAt(root,x,r,zs,mat,{rim:.78,holes:6}); rollers(root,x,I.trF-.05,[zs[1]-.3,zs[4]+.2],mat);
    sprocketT(root,x,I.trR*.62,zr+.36,.32,11,mat); dWheel(root,x,I.trF*.62,zf-.4,.3,mat,{rim:.75});
    skirtPanels(root,x,s,tw,I.trF+.1,.72,zf-.3,zr+.35,7,mat,3); }
  function abrHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const hw=M.W/2, fy=Math.max(I.trF,I.trR)+.06;
    { const p=glacisPt(I,deck,gz,zf,.08,.04); hatchP(root,0,p.y,p.z-.25,.26,3,mat,.28); }                                        // conductor al medio
    for(const sx of [-1,1]){ lights(root,sx*(hw-.3),fy+.12,zf-.18); box(root,I.trW*.95,.03,.35,sx*(hw-I.trW/2),fy-.02,zf-.05,rubM); }  // faros y guardabarros
    shackles(root,iw2*.32,.62,zf+.02);
    grille(root,iw2*.85,2.3,0,deck,zr+1.3,mat,12);                                                                             // rejillas del motor
    { const g=rbox(root,iw2*.6,.42,.08,0,deck-.32,zr-.02,darkMat,.02); for(let i=0;i<6;i++) box(g,iw2*.58,.03,.03,0,-.16+i*.065,.05,mat); }   // escape de la turbina
    for(const sx of [-1,1]){ const c=tube(root,.03,L*.55,sx*(hw-.06),deck-.1,-.3,darkMat,6); } }
  function abrTurret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
    prism(tur,plan(hw,hl,[[-.3,1],[.3,1],[.96,.5],[1,-.55],[.9,-1],[-.9,-1],[-1,-.55],[-.96,.5]]),th,.1,0,0,0,mat);           // caras planas, frente en cuña
    rbox(G.gp,.62,.5,.4,0,0,.05,mat,.04);                                                                                     // mantelete hundido
    tube(G.barrel,M.gr*1.3,M.gl*.72,0,0,M.gl*.42+.15,mat); tube(G.barrel,M.gr*1.8,.55,0,0,M.gl*.48,mat,12);                // manga térmica y evacuador
    tube(G.gp,.025,.35,-.28,-.05,.32,darkMat,6);
    { const b=rbox(tur,.55,.38,.6,hw*.5,th+.17,hl*.45,mat,.04); box(b,.38,.2,.02,0,.04,.31,lens()); }                          // visor GPS del apuntador
    cupola(tur,hw*.45,th,-hl*.05,.36,.3,6,mat);                                                                             // cúpula del jefe
    mgMount(tur,hw*.45,th+.62,hl*.1,{post:.3,cal:12.7,...MG_AA,seat:['commander']});                                          // .50 M2
    cyl(tur,.3,.3,.06,-hw*.42,th+.03,-hl*.1,14,mat); mgMount(tur,-hw*.42,th+.45,hl*.05,{post:.3,...MG_AA,seat:['loader']});   // M240 del cargador
    for(const sx of [-1,1]) smoke(tur,sx*hw*.93,th*.55,hl*.42,3,sx,2);                                                       // M250: 6 por lado
    basket(tur,M.tw*.82,.45,.7,th*.65,-hl-.32,true);                                                                        // cesto
    cyl(tur,.02,.02,.5,0,th+.25,-hl*.85,4,darkMat); cyl(tur,.06,.06,.08,0,th+.52,-hl*.85,8,darkMat);                          // sensor de viento cruzado
    antennas(tur,[[-hw*.7,th,-hl*.8],[hw*.7,th,-hl*.8]]); }
  DET.abr={gear:abrGear,hull:abrHull,tur:abrTurret};

  // ================= Leopard 2A4 (det 'leo2') =================
  // 7 ruedas dobles, 4 rodillos, motriz atrás, faldones con las 2 placas de adelante blindadas. Torre de caras verticales con el frente plano,
  // 120 mm L/44 con manga térmica y evacuador, visor EMES 15 en su caja a la derecha adelante, PERI R17 del jefe, MG3 del cargador, 8 lanzahumos
  // por lado y cajones atrás. Casco con el conductor a la derecha y rejillas grandes del motor.
  function leo2Gear(root,I,x,s,tw,zf,zr,mat){ const r=.35, zs=span(zf-1.05,zr+1.0,7);
    for(const z of zs) for(const d of [-tw*.22,tw*.22]) dWheel(root,x+d,r+.02,z,r,mat,{sc:.45,rim:.8});
    rollers(root,x,I.trF-.05,[zs[0]-.4,zs[2]-.2,zs[4]-.1,zs[6]+.2].map(z=>z),mat);
    sprocketT(root,x,I.trR*.6,zr+.36,.32,12,mat); dWheel(root,x,I.trF*.6,zf-.38,.3,mat,{rim:.75});
    skirtPanels(root,x,s,tw,I.trF+.12,.6,zf-.2,zr+.4,8,mat,2); box(root,.04,.15,zf-zr-1.5,x+s*(tw/2+.07),I.trF-.55,(zf+zr)/2-.4,rubM); }
  function leo2Hull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const hw=M.W/2, fy=Math.max(I.trF,I.trR)+.06;
    { const p=glacisPt(I,deck,gz,zf,.06,.04); hatchP(root,iw2*.28,p.y,p.z-.25,.25,3,mat,.27); }
    for(const sx of [-1,1]){ lights(root,sx*(hw-.3),fy+.12,zf-.15); box(root,.02,.16,.1,sx*(hw-.06),fy+.42,zf-.3,darkMat); cyl(root,.01,.01,.3,sx*(hw-.06),fy+.25,zf-.3,4,darkMat); }
    shackles(root,iw2*.3,.65,zf+.02);
    grille(root,iw2*.88,2.5,0,deck,zr+1.35,mat,13);
    for(const sx of [-1,1]){ const g=rbox(root,.75,.32,.06,sx*iw2*.3,deck-.3,zr-.01,darkMat,.02); for(let i=0;i<4;i++) box(g,.7,.03,.02,0,-.1+i*.07,.04,mat); }   // escapes en la popa
    for(const sx of [-1,1]) tube(root,.03,L*.5,sx*(hw-.06),deck-.1,-.3,darkMat,6); }
  function leo2Turret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
    prism(tur,plan(hw,hl,[[-.62,1],[.62,1],[1,.72],[.97,-.75],[.9,-1],[-.9,-1],[-.97,-.75],[-1,.72]]),th,.03,0,0,0,mat);
    rbox(G.gp,.9,.62,.3,0,0,.08,mat,.03);                                                                                    // mantelete plano
    tube(G.barrel,M.gr*1.32,M.gl*.78,0,0,M.gl*.45+.12,mat); tube(G.barrel,M.gr*1.8,.6,0,0,M.gl*.36,mat,12);
    tube(G.gp,.025,.35,-.32,-.05,.3,darkMat,6);
    { const e=rbox(tur,.62,.46,.6,hw*.42,th+.2,hl*.62,mat,.03); box(e,.42,.24,.02,0,.04,.31,lens()); }                       // EMES 15
    { const pr=cyl(tur,.13,.14,.38,hw*.42,th+.19,-hl*.05,10,darkMat); const h=rbox(tur,.32,.24,.32,hw*.42,th+.48,-hl*.05,darkMat,.04); box(h,.2,.1,.02,0,0,.17,lens()); }   // PERI R17
    cupola(tur,hw*.42,th,-hl*.35,.3,.12,6,mat);
    cyl(tur,.3,.3,.06,-hw*.42,th+.03,-hl*.25,14,mat); mgMount(tur,-hw*.42,th+.42,-hl*.25,{post:.3,...MG_AA,seat:['loader','commander']});
    for(const sx of [-1,1]){ smoke(tur,sx*(hw+.02),th*.45,-hl*.3,4,sx,2); rbox(tur,.35,th*.65,1.2,sx*(hw+.15),th*.45,-hl*.62,mat,.04); }   // lanzahumos y cajones
    rbox(tur,M.tw*.75,th*.6,.45,0,th*.42,-hl-.2,mat,.04);
    cyl(tur,.02,.02,.45,-hw*.2,th+.22,-hl*.8,4,darkMat);
    antennas(tur,[[-hw*.6,th,-hl*.75],[hw*.6,th,-hl*.75]]); }
  DET.leo2={gear:leo2Gear,hull:leo2Hull,tur:leo2Turret};

  // ================= Centurion Mk.10 y Chieftain Mk.3: suspensión Horstmann (bogies de a dos ruedas con el resorte afuera) =================
  function horstmann(root,I,x,s,tw,zf,zr,mat,n,r,ret){ const zs=span(zf-1.35,zr+1.35,n);
    for(const z of zs){ for(const d of [-.36,.36]) dWheel(root,x,r+.02,z+d,r,mat,{rim:.8,holes:0}); rbox(root,.16,.2,.9,x+s*(tw/2+.04),r+.05,z,darkMat,.04); }   // par de ruedas y su caja de resortes
    rollers(root,x,I.trF-.05,span(zf-1.1,zr+1.0,ret),mat);
    sprocketT(root,x,I.trR*.62,zr+.36,.32,12,mat); dWheel(root,x,I.trF*.62,zf-.4,.3,mat,{rim:.75}); }
  // Centurion: 3 bogies (6 ruedas), 6 rodillos, motriz atrás; faldones "antibazuca" en 4 chapas. Casco con cajones grandes en los guardabarros.
  // Torre fundida redonda con cesto largo y los cajones laterales que la rodean, cúpula del jefe a la derecha, 105 mm L7 con evacuador,
  // 2 grupos de 6 lanzahumos adelante y la .50 de puntería (Mk.10) arriba del mantelete.
  function centGear(root,I,x,s,tw,zf,zr,mat){ horstmann(root,I,x,s,tw,zf,zr,mat,3,.31,6); skirtPanels(root,x,s,tw,I.trF+.12,.62,zf-.35,zr+.35,4,mat,0); }
  function centHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const hw=M.W/2, ft=hw-I.trW/2, fy=Math.max(I.trF,I.trR)+.06;
    { const p=glacisPt(I,deck,gz,zf,.06,.04); hatchP(root,iw2*.28,p.y,p.z-.22,.24,2,mat,.25); }
    for(const sx of [-1,1]) lights(root,sx*(hw-.28),fy+.12,zf-.25); shackles(root,iw2*.3,.6,zf+.02);
    for(let k=0;k<2;k++) for(const sx of [-1,1]) rbox(root,I.trW*.85,.38,.75,sx*ft,fy+.19,zf-.75-k*.85,mat,.03);                  // cajones de adelante
    grille(root,iw2*.85,2.4,0,deck,zr+1.3,mat,10);
    for(const sx of [-1,1]){ const e=tube(root,.1,.5,sx*iw2*.3,deck-.3,zr-.15,darkMat,8); }
    for(const sx of [-1,1]) tube(root,.03,L*.5,sx*(hw-.06),deck-.1,-.4,darkMat,6); }
  function centTurret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
    castTurret(tur,M.tw,M.tl*.8,th,mat,[[0,0],[1,0],[1.02,.4],[.95,.78],[.72,.97],[.35,1],[0,1]]).position.z=hl*.12;
    rbox(tur,M.tw*.78,th*.75,1.0,0,th*.4,-hl+.35,mat,.08);                                                                  // cesto largo
    for(const sx of [-1,1]) rbox(tur,.36,th*.62,M.tl*.7,sx*(hw+.12),th*.38,-hl*.15,mat,.04);                                   // cajones laterales
    { const m=cyl(G.gp,.55,.55,.38,0,0,.1,14,mat); m.rotation.x=Math.PI/2; m.scale.x=1.3; }                                    // mantelete fundido
    tube(G.barrel,M.gr*1.8,.55,0,0,M.gl*.5,darkMat,12);
    tube(G.gp,.03,.6,.38,.25,.3,darkMat,6);                                                                                  // .50 de puntería
    cupola(tur,hw*.42,th*.92,-hl*.2,.33,.25,8,mat); mgMount(tur,hw*.42+.2,th+.4,-hl*.2+.2,{post:.25,...MG_AA,seat:['commander']});
    cyl(tur,.28,.28,.06,-hw*.4,th*.95,-hl*.2,14,mat);
    for(const sx of [-1,1]) smoke(tur,sx*hw*.82,th*.5,hl*.48,3,sx,2);
    antennas(tur,[[-hw*.6,th*.8,-hl*.7],[hw*.6,th*.8,-hl*.7]]); }
  DET.cent={gear:centGear,hull:centHull,tur:centTurret};
  // Chieftain: casco bajo con el glacis largo y muy inclinado (conductor acostado), 3 bogies, 4 rodillos, faldones. Torre fundida muy inclinada
  // adelante, sin mantelete (collar), 120 mm L11 con manga térmica y evacuador, reflector infrarrojo en su caja a la izquierda de la torre,
  // cúpula N.º 15 del jefe con la ametralladora, paquete NBC y cesto atrás, 6 lanzahumos por lado.
  function chiefGear(root,I,x,s,tw,zf,zr,mat){ horstmann(root,I,x,s,tw,zf,zr,mat,3,.3,4); skirtPanels(root,x,s,tw,I.trF+.12,.55,zf-.4,zr+.35,5,mat,0); }
  function chiefHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const hw=M.W/2, fy=Math.max(I.trF,I.trR)+.06;
    { const p=glacisPt(I,deck,gz,zf,.12,.04); hatchP(root,0,p.y,p.z-.15,.26,1,mat,.28); }
    for(const sx of [-1,1]) lights(root,sx*(hw-.28),fy+.1,zf-.3); shackles(root,iw2*.3,.55,zf+.02);
    grille(root,iw2*.85,2.2,0,deck,zr+1.2,mat,10);
    rbox(root,iw2*.7,.3,.3,0,deck-.3,zr-.1,darkMat,.03);
    for(const sx of [-1,1]){ rbox(root,I.trW*.85,.3,.9,sx*(hw-I.trW/2),fy+.15,zr+1.0,mat,.03); tube(root,.03,L*.5,sx*(hw-.06),deck-.1,-.3,darkMat,6); } }
  function chiefTurret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
    { const m=castTurret(tur,M.tw,M.tl,th,mat,[[0,0],[1,0],[1.02,.35],[.92,.75],[.68,.95],[.3,1],[0,1]]), P=m.geometry.attributes.position;
      for(let i=0;i<P.count;i++){ const z=P.getZ(i); if(z<=0) continue; const k=z/hl; P.setX(i,P.getX(i)*(1-.45*k*k)); P.setY(i,P.getY(i)*(1-.35*k)); P.setZ(i,z*1.1); }   // frente muy inclinado y bajo
      m.geometry.computeVertexNormals(); }
    G.gp.position.y=th*.32;
    tube(G.gp,.22,.3,0,0,.05,mat,12);                                                                                       // collar (sin mantelete)
    tube(G.barrel,M.gr*1.3,M.gl*.7,0,0,M.gl*.42+.15,mat); tube(G.barrel,M.gr*1.8,.55,0,0,M.gl*.45,darkMat,12);
    { const s=rbox(tur,.45,.55,.8,-hw-.18,th*.55,hl*.1,mat,.04); box(s,.02,.45,.62,-.23,0,0,darkMat); box(s,.34,.42,.02,0,0,.41,lens()); }   // reflector IR a la izquierda
    cupola(tur,hw*.35,th,-hl*.2,.36,.3,8,mat); mgMount(tur,hw*.35,th+.55,-hl*.2+.25,{ball:.1,mat,yaw:[-Math.PI,Math.PI],pitch:[-.15,1],len:.8,seat:['commander'],op:false});
    cyl(tur,.28,.28,.06,-hw*.35,th+.02,-hl*.3,14,mat);
    for(const sx of [-1,1]) smoke(tur,sx*hw*.8,th*.55,hl*.2,3,sx,2);
    rbox(tur,M.tw*.6,.5,.45,0,th*.6,-hl-.15,mat,.04); basket(tur,M.tw*.75,.4,.55,th*.55,-hl-.62,true);                     // NBC y cesto
    antennas(tur,[[-hw*.55,th*.8,-hl*.7],[hw*.55,th*.8,-hl*.7]]); }
  DET.chief={gear:chiefGear,hull:chiefHull,tur:chiefTurret};

  // ================= M113 (det 'm113') =================
  // Caja de aluminio: frente con la chapa de arriba inclinada y la tabla rompeolas, conductor adelante a la izquierda, motor adelante a la derecha
  // (rejilla y escape al costado), rampa trasera con su puerta, escotilla de carga grande arriba atrás. 5 ruedas sin rodillos, motriz adelante.
  // La "torre" es la cúpula del jefe con la .50 M2 y el escudo (ACAV).
  function m113Gear(root,I,x,s,tw,zf,zr,mat){ const r=.3; wheelsAt(root,x,r,span(zf-.75,zr+.8,5),mat,{rim:.78,holes:0});
    sprocketT(root,x,I.trF*.62,zf-.33,.28,10,mat); dWheel(root,x,I.trR*.62,zr+.36,.27,mat,{rim:.75}); }
  function m113Hull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const hw=M.W/2;
    { const p=glacisPt(I,deck,gz,zf,.55,.05), v=box(root,M.W*.82,.05,gz*.75,0,p.y,p.z,mat); v.rotation.x=p.a; for(let i=0;i<3;i++){ const r=box(root,M.W*.82,.04,.04,0,p.y+.04,p.z,darkMat); r.rotation.x=p.a; r.position.z+=(i-1)*.22*Math.cos(p.a); r.position.y+=(i-1)*.22*Math.sin(p.a); } }   // rompeolas
    { const p=glacisPt(I,deck,gz,zf,.08,.04); hatchP(root,-hw*.45,deck,zf-gz-.25,.26,4,mat,.3); }
    grille(root,.8,.7,hw*.35,deck,zf-gz-.55,mat,6);                                                                          // motor adelante a la derecha
    { const e=tube(root,.08,.6,hw+.02,deck-.25,zf-gz-.2,darkMat,8); const g=box(root,.04,.4,.5,hw+.01,deck-.5,zf-gz-.9,darkMat); }
    for(const sx of [-1,1]){ const p=glacisPt(I,deck,gz,zf,.95,.05); lights(root,sx*(hw-.25),p.y+.08,p.z+.05,.9); }
    shackles(root,hw*.6,.6,zf+.02);
    rbox(root,1.3,.06,1.5,0,deck+.03,zr+1.05,mat,.02);                                                                       // escotilla de carga
    { const d=rbox(root,M.W*.84,deck-.5,.08,0,(deck+.4)/2,zr-.02,mat,.03); rbox(root,.7,1.05,.04,-.35,(deck+.45)/2,zr-.08,mat,.02); tube(root,.04,.08,-.1,deck*.55,zr-.1,darkMat,6); }   // rampa y puerta
    for(const sx of [-1,1]){ box(root,.04,.6,.06,sx*(hw-.1),deck*.55,zr-.06,darkMat); box(root,.06,.06,1.5,sx*(hw+.01),deck-.15,-.3,darkMat); } }
  function m113Turret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
    cyl(tur,hw,hw*1.04,th*.55,0,th*.27,0,16,mat); for(let k=0;k<5;k++){ const a=(k/5-.4)*Math.PI*1.4; box(tur,.1,.06,.03,Math.sin(a)*hw,th*.38,Math.cos(a)*hw,_shGlass).rotation.y=a; }
    cyl(tur,hw*.9,hw*.9,.05,0,th*.57,-.1,14,mat);
    G.gp.position.y=th*.85; box(G.gp,.18,.2,.4,0,0,-.05,darkMat); tube(G.barrel,M.gr*1.6,.4,0,0,.25,darkMat,8);           // cuna de la M2 y el manguito
    box(tur,.95,.5,.04,0,th*.85,hl*.62,mat); for(const sx of [-1,1]) rot(box(tur,.04,.45,.7,sx*.5,th*.82,hl*.3,mat),0,sx*.25,0);   // escudo ACAV
    antennas(tur,[[0,0,-hl-.6]],2.2); }
  DET.m113={gear:m113Gear,hull:m113Hull,tur:m113Turret};

  // ================= M551 Sheridan (det 'sher551') =================
  // Casco de aluminio con la cortina de flotación plegada en el borde de arriba, rompeolas adelante, 5 ruedas sin rodillos, motriz atrás.
  // Torre de acero baja y larga con cesto, cañón-lanzamisiles corto y grueso de 152 mm, reflector AN/VSS-3 arriba del cañón, cúpula
  // del jefe con la .50 y el escudo ACAV, 4 lanzahumos por lado.
  function shGear(root,I,x,s,tw,zf,zr,mat){ wheelsAt(root,x,.33,span(zf-.95,zr+.95,5),mat,{rim:.78,holes:6});
    sprocketT(root,x,I.trR*.62,zr+.35,.3,11,mat); dWheel(root,x,I.trF*.62,zf-.37,.28,mat,{rim:.75}); }
  function shHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const hw=M.W/2;
    for(const sx of [-1,1]) tube(root,.07,L-gz-.3,sx*(hw-.05),deck+.05,(zr+zf-gz)/2,rubM,8);                                      // cortina de flotación plegada
    tube(root,.07,M.W-.1,0,deck+.05,zr+.12,rubM,8).rotation.set(0,0,Math.PI/2);
    { const p=glacisPt(I,deck,gz,zf,.5,.05), v=box(root,M.W*.85,.05,gz*.7,0,p.y,p.z,mat); v.rotation.x=p.a; }
    { const p=glacisPt(I,deck,gz,zf,.05,.04); hatchP(root,0,deck,zf-gz-.2,.24,3,mat,.27); }
    for(const sx of [-1,1]){ const p=glacisPt(I,deck,gz,zf,.85,.05); lights(root,sx*(hw-.28),p.y+.08,p.z+.05,.9); }
    shackles(root,iw2*.32,.55,zf+.02); grille(root,iw2*.85,1.6,0,deck,zr+.95,mat,9); }
  function shTurret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
    prism(tur,plan(hw,hl,[[-.5,1],[.5,1],[1,.4],[1,-.7],[.82,-1],[-.82,-1],[-1,-.7],[-1,.4]]),th,.18,0,0,0,mat);
    rbox(tur,M.tw*.7,th*.7,.6,0,th*.4,-hl-.25,mat,.05);
    rbox(G.gp,.7,.5,.4,0,0,.1,mat,.06); tube(G.barrel,M.gr*1.15,M.gl*.6,0,0,M.gl*.35+.1,mat,14);                              // tubo grueso del 152 mm
    { const l=rbox(G.gp,.6,.45,.35,0,.5,.1,darkMat,.04); box(l,.5,.36,.02,0,0,.18,lens()); }                                   // reflector arriba del cañón
    cupola(tur,hw*.4,th,-hl*.25,.32,.28,6,mat); mgMount(tur,hw*.4,th+.55,-hl*.05,{post:.25,cal:12.7,...MG_AA,shield:1,mat,seat:['commander']});
    for(const sx of [-1,1]){ box(tur,.04,.45,.6,hw*.4+sx*.38,th+.5,-hl*.15,mat); smoke(tur,sx*hw*.9,th*.5,hl*.35,4,sx); }
    cyl(tur,.26,.26,.06,-hw*.4,th+.02,-hl*.25,14,mat);
    antennas(tur,[[-hw*.6,th,-hl*.8],[hw*.6,th,-hl*.8]]); }
  DET.sher551={gear:shGear,hull:shHull,tur:shTurret};

  // ================= FV101 Scorpion (det 'scorp') =================
  // Chico y de aluminio: motor adelante a la derecha con la rejilla y el escape al costado, conductor adelante a la izquierda, 5 ruedas grandes
  // sin rodillos, motriz adelante. Torre soldada de costados inclinados con el 76 mm L23 corto, 4 lanzahumos por lado y cajones atrás.
  function scGear(root,I,x,s,tw,zf,zr,mat){ wheelsAt(root,x,.3,span(zf-.72,zr+.68,5),mat,{rim:.8,holes:0});
    sprocketT(root,x,I.trF*.62,zf-.3,.26,10,mat); dWheel(root,x,I.trR*.62,zr+.32,.25,mat,{rim:.75}); }
  function scHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const hw=M.W/2;
    { const p=glacisPt(I,deck,gz,zf,.1,.04); hatchP(root,-hw*.42,p.y,p.z-.18,.22,1,mat,.24); }
    grille(root,.75,.8,hw*.38,deck,zf-gz-.45,mat,6);
    { const e=rbox(root,.18,.2,.5,hw+.03,deck-.25,zf-gz-.5,darkMat,.03); }
    for(const sx of [-1,1]){ const p=glacisPt(I,deck,gz,zf,.85,.05); lights(root,sx*(hw-.22),p.y+.07,p.z+.05,.8); }
    shackles(root,iw2*.32,.5,zf+.02);
    rbox(root,M.W*.7,.5,.06,0,deck-.45,zr-.01,mat,.03); for(const sx of [-1,1]) box(root,.06,.06,1.2,sx*(hw+.01),deck-.12,-.4,darkMat); }
  function scTurret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
    prism(tur,plan(hw,hl,[[-.55,1],[.55,1],[1,.35],[1,-.75],[.8,-1],[-.8,-1],[-1,-.75],[-1,.35]]),th,.26,0,0,0,mat);
    rbox(G.gp,.42,.32,.25,0,0,.06,mat,.05); tube(G.barrel,M.gr*1.25,.5,0,0,.35,mat,10);
    tube(G.gp,.022,.3,.2,-.04,.25,darkMat,6);
    { const b=rbox(tur,.24,.22,.26,hw*.45,th+.1,hl*.45,mat,.03); box(b,.15,.09,.02,0,.02,.14,lens()); }
    cupola(tur,-hw*.35,th,-hl*.15,.25,.18,7,mat); cyl(tur,.22,.22,.05,hw*.38,th+.02,-hl*.2,12,mat);
    for(const sx of [-1,1]) smoke(tur,sx*hw*.95,th*.4,hl*.55,2,sx,2);
    rbox(tur,M.tw*.7,th*.6,.35,0,th*.35,-hl-.15,_wdMat,.05);
    antennas(tur,[[-hw*.6,th*.8,-hl*.75]],1.8); }
  DET.scorp={gear:scGear,hull:scHull,tur:scTurret};

  // ================= PT-76B (det 'pt76') =================
  // Casco de bote largo y alto, 6 ruedas huecas (flotan) sin rodillos, motriz atrás, rompeolas plegado en el glacis y las dos salidas de los
  // hidrojets en la popa. Torre en cono truncado con la escotilla grande y el D-56TM con freno de boca multiranura y evacuador.
  function ptGear(root,I,x,s,tw,zf,zr,mat){ wheelsAt(root,x,.34,span(zf-.95,zr+.9,6),mat,{rim:.82,holes:6});
    sprocketT(root,x,I.trR*.6,zr+.34,.3,12,mat); dWheel(root,x,I.trF*.6,zf-.36,.28,mat,{rim:.75}); }
  function ptHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const hw=M.W/2;
    { const p=glacisPt(I,deck,gz,zf,.6,.05), v=box(root,M.W*.8,.05,gz*.6,0,p.y,p.z,mat); v.rotation.x=p.a+.15; }                // rompeolas plegado
    { const p=glacisPt(I,deck,gz,zf,.05,.04); hatchP(root,0,deck,zf-gz-.15,.24,3,mat,.26); }
    for(const sx of [-1,1]){ const p=glacisPt(I,deck,gz,zf,.8,.06); lights(root,sx*(hw-.3),p.y+.08,p.z+.05,.85); }
    shackles(root,iw2*.3,.6,zf+.02);
    grille(root,iw2*.8,2.0,0,deck,zr+1.15,mat,11);
    for(const sx of [-1,1]){ const j=tube(root,.2,.08,sx*.7,deck*.45,zr-.01,darkMat,14); cyl(root,.22,.22,.02,sx*.7,deck*.45,zr-.05,14,mat).rotation.x=Math.PI/2; }   // hidrojets
    for(const sx of [-1,1]){ tube(root,.03,L*.55,sx*(hw-.06),deck-.1,-.2,darkMat,6); rbox(root,.3,.25,.8,sx*(hw-.25),deck+.12,zr+1.0,mat,.03); } }
  function ptTurret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
    { const c=cyl(tur,hw*.78,hw,th,0,th/2,0,18,mat); c.scale.z=hl/hw; }                                                      // cono truncado ovalado
    rbox(G.gp,.4,.3,.25,0,0,.06,mat,.06);
    for(let k=0;k<4;k++) tube(G.barrel,M.gr*1.7,.06,0,0,M.gl-.04-k*.09,darkMat,10); tube(G.barrel,M.gr*1.35,.38,0,0,M.gl-.17,darkMat,10);   // freno multiranura
    tube(G.barrel,M.gr*1.6,.4,0,0,M.gl*.72,darkMat,10);                                                                      // evacuador (PT-76B)
    tube(G.gp,.022,.3,.22,-.04,.25,darkMat,6);
    { const h=cyl(tur,.42,.42,.06,0,th+.02,-hl*.2,16,mat); h.scale.z=.8; }                                                     // escotilla grande ovalada
    for(const sx of [-1,1]){ box(tur,.1,.08,.06,sx*hw*.4,th+.04,hl*.3,darkMat); }
    rbox(tur,.24,.22,.22,-hw*.3,th+.1,hl*.15,darkMat,.04);
    antennas(tur,[[hw*.5,th*.9,-hl*.4]],2); }
  DET.pt76={gear:ptGear,hull:ptHull,tur:ptTurret};

  // ================= Marder 1A3 (det 'marder'): el casco del Marder del TAM/VCTP (DET.tam) con su torre biplaza =================
  // Torre chica con el Rh 202 de 20 mm montado afuera, arriba a la derecha, y el lanzador MILAN a la izquierda; el 1A3 suma las placas de
  // blindaje abulonadas a los costados del casco y de la torre, 6 lanzahumos y la rampa trasera.
  function mdGear(root,I,x,s,tw,zf,zr,mat){ DET.tam.gear(root,Object.assign({},I,{tam:'vctp'}),x,s,tw,zf,zr,mat); }
  function mdHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const hw=M.W/2;
    const sv=vctpHull; vctpHull=()=>{}; try{ DET.tam.hull(root,M,Object.assign({},I,{tam:'vctp'}),mat,iw2,deck,gz,zf,zr,L); } finally{ vctpHull=sv; }   // lo común del casco del Marder (sin lo del VCTP)
    for(const sx of [-1,1]){ for(let k=0;k<4;k++){ const zc=zf-gz-.5-k*1.05; const p=rbox(root,.08,.5,1.0,sx*(hw+.03),deck-.3,zc,mat,.02); p.rotation.z=-sx*.32;   // placas del 1A3
        for(const dz of [-.35,.35]) cyl(root,.035,.035,.04,sx*(hw+.09),deck-.25,zc+dz,6,darkMat).rotation.z=Math.PI/2; } }
    rbox(root,M.W*.6,deck-.55,.1,0,(deck+.4)/2,zr-.02,mat,.03);                                                               // rampa trasera
    for(let k=0;k<2;k++) rbox(root,.6,.05,.55,(k?-1:1)*iw2*.22,deck+.03,zr+1.3,mat,.02); }
  function mdTurret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
    prism(tur,plan(hw,hl,[[-.6,1],[.6,1],[1,.4],[1,-.8],[.85,-1],[-.85,-1],[-1,-.8],[-1,.4]]),th,.2,0,0,0,mat);
    for(const sx of [-1,1]) rot(box(tur,.06,th*.8,M.tl*.85,sx*(hw+.04),th*.42,-hl*.05,mat),0,0,sx*.25);                          // placas del 1A3
    G.gp.position.set(hw*.55,th+.25,hl*.35);                                                                                  // el 20 mm va afuera, arriba a la derecha
    rbox(G.gp,.32,.32,1.0,0,0,-.3,mat,.04); tube(G.barrel,M.gr*1.8,.5,0,0,.25,darkMat,10); tube(G.barrel,M.gr*1.4,.2,0,0,M.gl-.08,darkMat,8);
    rbox(tur,.3,.25,.5,hw*.55,th+.08,hl*.2,darkMat,.03);
    { const m=new THREE.Group(); m.position.set(-hw*.55,th+.35,-hl*.05); tur.add(m); box(m,.3,.28,.3,0,0,0,darkMat); tube(m,.07,1.2,0,.05,.35,_shGreenBox||mat,10); }   // MILAN
    cyl(tur,.26,.26,.06,-hw*.3,th+.02,-hl*.3,14,mat); cupola(tur,hw*.1,th,-hl*.45,.24,.12,6,mat);
    for(const sx of [-1,1]) smoke(tur,sx*hw*.9,th*.5,hl*.55,3,sx);
    antennas(tur,[[-hw*.7,th,-hl*.8]],2); }
  DET.marder={gear:mdGear,hull:mdHull,tur:mdTurret};

  // ================= Ru 251 (det 'ru251') =================
  // Chasis del Kanonenjagdpanzer: 5 ruedas, 3 rodillos, motriz atrás, frente en punta. Torre soldada larga y baja en cuña con el 90 mm
  // BK 90/L40 (evacuador), cúpula del jefe, reflector infrarrojo a la izquierda, MG3 y lanzahumos.
  function ruGear(root,I,x,s,tw,zf,zr,mat){ const zs=span(zf-.95,zr+.95,5); wheelsAt(root,x,.33,zs,mat,{rim:.8,holes:6});
    rollers(root,x,I.trF-.05,[zs[0]-.4,zs[2],zs[4]+.4],mat); sprocketT(root,x,I.trR*.62,zr+.34,.3,12,mat); dWheel(root,x,I.trF*.62,zf-.36,.28,mat,{rim:.75}); }
  function ruHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const hw=M.W/2, fy=Math.max(I.trF,I.trR)+.06;
    { const p=glacisPt(I,deck,gz,zf,.06,.04); hatchP(root,-iw2*.25,p.y,p.z-.2,.24,2,mat,.25); }
    for(const sx of [-1,1]) lights(root,sx*(hw-.28),fy+.1,zf-.2); shackles(root,iw2*.3,.58,zf+.02);
    grille(root,iw2*.8,1.6,0,deck,zr+.95,mat,9);
    for(const sx of [-1,1]){ const g=box(root,.03,.3,.7,sx*(hw-.02),deck-.3,zr+.8,darkMat); rbox(root,I.trW*.85,.28,.8,sx*(hw-I.trW/2),fy+.14,zf-1.2,mat,.03); tube(root,.03,L*.5,sx*(hw-.06),deck-.1,-.2,darkMat,6); } }
  function ruTurret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
    prism(tur,plan(hw,hl,[[-.35,1],[.35,1],[1,.3],[1,-.8],[.85,-1],[-.85,-1],[-1,-.8],[-1,.3]]),th,.22,0,0,0,mat);
    rbox(G.gp,.6,.42,.3,0,0,.08,mat,.06); tube(G.barrel,M.gr*1.75,.5,0,0,M.gl*.55,darkMat,12);
    tube(G.gp,.022,.3,-.25,-.04,.25,darkMat,6);
    { const l=rbox(tur,.4,.42,.36,-hw-.1,th*.6,hl*.35,darkMat,.04); box(l,.32,.32,.02,0,0,.19,lens()); }
    cupola(tur,hw*.4,th,-hl*.2,.3,.22,6,mat); cyl(tur,.26,.26,.06,-hw*.38,th+.02,-hl*.25,14,mat);
    mgMount(tur,-hw*.38,th+.42,-hl*.25,{post:.3,...MG_AA,seat:['loader','commander']});
    for(const sx of [-1,1]) smoke(tur,sx*hw*.85,th*.5,-hl*.3,4,sx);
    rbox(tur,M.tw*.7,th*.6,.4,0,th*.4,-hl-.18,mat,.05);
    antennas(tur,[[-hw*.6,th,-hl*.8],[hw*.6,th,-hl*.8]]); }
  DET.ru251={gear:ruGear,hull:ruHull,tur:ruTurret};

  // ================= EE-9 Cascavel (det 'ee9', a ruedas: m.w2.noTrk) =================
  // 6×6: una rueda adelante y el bogie "boomerang" atrás con dos ruedas unidas por la viga. Casco de acero bimetálico con la trompa larga
  // inclinada, faros, conductor adelante al medio y puertas a los costados. Torre ET-90 con el EC-90 de 90 mm (freno de boca), mira y lanzahumos.
  function eeGear(root,I,x,s,tw,zf,zr,mat){ const r=I.wR;
    for(const z of [zf-1.05,zr+1.7,zr+.75]){ dWheel(root,x,r,z,r,mat,{rim:.55,holes:0}); }                                     // gomas grandes
    rbox(root,.12,.22,1.4,x-s*.12,r,zr+1.22,darkMat,.04);                                                                    // viga del boomerang
    box(root,tw+.08,.05,.95,x,r*2+.08,zf-1.05,mat); box(root,tw+.08,.05,2.1,x,r*2+.08,zr+1.22,mat); }                          // guardabarros
  function eeHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const hw=M.W/2;
    { const p=glacisPt(I,deck,gz,zf,.15,.04); hatchP(root,0,p.y,p.z-.15,.24,3,mat,.26); }
    for(const sx of [-1,1]){ const p=glacisPt(I,deck,gz,zf,.75,.05); lights(root,sx*(hw-.32),p.y+.06,p.z+.05,.85);
      rbox(root,.05,.65,.6,sx*(hw-.08),deck-.45,-.3,mat,.02);                                                                 // puertas laterales
      rbox(root,.06,.08,1.0,sx*(hw-.05),deck-.08,zr+1.1,darkMat,.02); }
    shackles(root,iw2*.25,.62,zf+.02); grille(root,iw2*.75,1.1,0,deck,zr+.7,mat,7);
    { const e=tube(root,.08,.4,hw*.55,deck-.3,zr-.1,darkMat,8); } }
  function eeTurret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
    prism(tur,plan(hw,hl,[[-.5,1],[.5,1],[1,.3],[.95,-.8],[.75,-1],[-.75,-1],[-.95,-.8],[-1,.3]]),th,.24,0,0,0,mat);
    rbox(tur,M.tw*.62,th*.65,.45,0,th*.38,-hl-.18,mat,.05);
    rbox(G.gp,.5,.4,.28,0,0,.08,mat,.06); tube(G.barrel,M.gr*1.3,M.gl*.45,0,0,M.gl*.25+.15,mat,10);
    for(let k=0;k<3;k++) tube(G.barrel,M.gr*2,.07,0,0,M.gl-.05-k*.1,darkMat,10); tube(G.barrel,M.gr*1.5,.3,0,0,M.gl-.14,darkMat,10);   // freno de boca
    tube(G.gp,.022,.3,.22,-.04,.25,darkMat,6);
    { const b=rbox(tur,.26,.24,.3,-hw*.4,th+.11,hl*.35,mat,.03); box(b,.16,.1,.02,0,.03,.16,lens()); }
    cupola(tur,hw*.38,th,-hl*.2,.26,.18,6,mat); mgMount(tur,hw*.38,th+.48,-hl*.05,{post:.28,cal:12.7,...MG_AA,seat:['commander']});
    for(const sx of [-1,1]) smoke(tur,sx*hw*.85,th*.5,hl*.15,3,sx);
    antennas(tur,[[-hw*.6,th*.9,-hl*.8]],2); }
  DET.ee9={gear:eeGear,hull:eeHull,tur:eeTurret};

  // ================= Tiran-5Sh: T-55 de base (DET.t55) con el 105 mm M68 y lo israelí =================
  // 105 mm M68 con el evacuador cerca del medio, .50 arriba del cañón, dos ametralladoras en las escotillas, cesto grande atrás de la torre y
  // cajones a los costados; sin el reflector infrarrojo soviético.
  const _tT=DET.t55.tur;
  DET.t55.tur=function(tur,G,M,I,mat,gy){ if(I.t55!=='tiran') return _tT.apply(this,arguments);
    _tT.call(this,tur,G,M,Object.assign({},I,{t55:'base',t62:1}),mat,gy);
    G.gp.children.filter(c=>Math.abs(c.position.x+.62)<.01).forEach(c=>c.visible=false);                                                  // saca el reflector L-2
    const hw=M.tw/2, hl=M.tl/2, th=M.th;
    tube(G.barrel,M.gr*1.8,.55,0,0,M.gl*.55,darkMat,12);
    tube(G.gp,.03,.9,0,.42,.35,darkMat,6); box(G.gp,.14,.14,.4,0,.42,.0,darkMat);                                              // .50 arriba del cañón
    mgMount(tur,-hw*.38,th+.55,-hl*.1,{post:.28,...MG_AA,seat:['commander']});
    basket(tur,M.tw*.75,.45,.75,th*.45,-hl-.3,true);
    for(const sx of [-1,1]) rbox(tur,.3,th*.45,.9,sx*(hw*.92),th*.35,-hl*.35,mat,.04); };

  // ---- los modelos nuevos (los datos de juego no cambian) ----
  const set=(k,m)=>{ if(VEH[k]){ const o=VEH[k].m||{}; if(o.wheeled) m.wheeled=1; VEH[k].m=m; } };
  const W=(o)=>Object.assign({trH:.95,lowF:.45,sideH:.55,tur:'none',ins:0,coax:0},o);
  set('abrams',{ww1:'w2',L:7.92,W:3.66,H:2.44,tz:-.3,tw:3.45,th:.78,tl:4.7,gl:5.2,gr:.07,w2:W({trW:.64,trF:.95,trR:.95,deck:1.6,glacis:1.9,lowF:.48,nW:7,wR:.32,ret:2,rearDrive:true,det:'abr'})});
  set('leo2a4',{ww1:'w2',L:7.72,W:3.7,H:2.79,tz:-.25,tw:3.35,th:.82,tl:4.4,gl:5.3,gr:.075,w2:W({trW:.64,trF:1.0,trR:.95,deck:1.65,glacis:1.6,lowF:.5,nW:7,wR:.35,ret:4,rearDrive:true,det:'leo2'})});
  set('centurion',{ww1:'w2',L:7.6,W:3.39,H:3.0,tz:.2,tw:2.75,th:.85,tl:3.7,gl:5.3,gr:.07,w2:W({trW:.6,trF:1.05,trR:1.05,deck:1.75,glacis:1.25,sideH:.6,nW:6,wR:.31,ret:6,rearDrive:true,det:'cent'})});
  set('chieftain',{ww1:'w2',L:7.52,W:3.5,H:2.9,tz:-.1,tw:3.0,th:.85,tl:3.9,gl:6.2,gr:.075,w2:W({trW:.6,trF:1.0,trR:1.0,deck:1.6,glacis:2.1,lowF:.4,nW:6,wR:.3,ret:4,rearDrive:true,det:'chief'})});
  set('m113',{ww1:'w2',L:4.86,W:2.69,H:2.5,tz:.6,tw:.9,th:.5,tl:1.0,gl:1.4,gr:.035,w2:W({trW:.38,trF:.7,trR:.72,deck:1.82,glacis:.95,lowF:.55,sideH:1.05,nW:5,wR:.3,ret:0,rearDrive:false,mant:'none',det:'m113'})});
  set('sheridan',{ww1:'w2',L:6.3,W:2.82,H:2.95,tz:-.15,tw:2.3,th:.68,tl:2.9,gl:2.3,gr:.1,w2:W({trW:.46,trF:.78,trR:.78,deck:1.55,glacis:1.15,lowF:.5,sideH:.7,nW:5,wR:.33,ret:0,rearDrive:true,det:'sher551'})});
  set('scorpion',{ww1:'w2',L:4.9,W:2.2,H:2.1,tz:-.45,tw:1.75,th:.58,tl:2.0,gl:2.2,gr:.055,w2:W({trW:.42,trF:.68,trR:.7,deck:1.4,glacis:1.0,lowF:.4,sideH:.55,nW:5,wR:.3,ret:0,rearDrive:false,det:'scorp'})});
  set('pt76',{ww1:'w2',L:6.91,W:3.15,H:2.33,tz:.7,tw:2.15,th:.6,tl:2.35,gl:3.5,gr:.045,w2:W({trW:.36,trF:.75,trR:.75,deck:1.65,glacis:1.25,lowF:.55,sideH:.75,slope:.08,nW:6,wR:.34,ret:0,rearDrive:true,ins:'ru',det:'pt76'})});
  set('marder',{ww1:'w2',L:6.79,W:3.24,H:3.0,tz:-.05,tw:1.85,th:.55,tl:1.8,gl:2.3,gr:.035,w2:W({trW:.45,trH:1,trF:1,trR:.95,deck:1.75,glacis:2.1,lowF:.4,sideH:.55,slope:.3,nW:6,wR:.33,ret:3,engF:1,det:'marder'})});
  set('ru251',{ww1:'w2',L:6.2,W:3.0,H:2.49,tz:-.15,tw:2.35,th:.62,tl:3.0,gl:3.7,gr:.055,w2:W({trW:.5,trF:.85,trR:.85,deck:1.55,glacis:1.3,lowF:.45,nW:5,wR:.33,ret:3,rearDrive:true,ins:'de',det:'ru251'})});
  set('ee9',{ww1:'w2',L:5.2,W:2.64,H:2.68,tz:-.3,tw:1.95,th:.62,tl:2.1,gl:3.2,gr:.055,w2:W({trW:.42,trF:1.0,trR:1.0,deck:1.65,glacis:1.5,lowF:.6,sideH:.75,slope:.15,nW:0,wR:.5,ret:0,noTrk:1,det:'ee9'})});
  if(VEH.t55) set('tiran',Object.assign({},VEH.t55.m,{gl:5.0,gr:.07,w2:Object.assign({},VEH.t55.m.w2,{t55:'tiran',ins:0})}));
  if(VEH.m3stuart) set('stuart',Object.assign({},VEH.m3stuart.m,{w2:Object.assign({},VEH.m3stuart.m.w2,{ins:'py'})}));
})();
