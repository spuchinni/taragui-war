/* ---------- Guerra Fría: M60, Leopard 1, M41 y T-62 rehechos por código (pedido de Sebastián, capítulo TAM: los rivales y vecinos) ----------
   Pasan del modelo viejo de la v1 al constructor detallado (m.ww1='w2', buildW2) con su tren de rodaje, casco y torre propios.
   Datos de juego (velocidad, blindaje, cañón, munición) sin cambios: solo cambia el modelo.
   Fuentes: Tank Encyclopedia y Wikipedia (medidas), DTIC y Military Wiki (M60: 6 ruedas por lado con barras de torsión y 3 rodillos de
   retorno, contra 5 del M48), notas de modelismo y wikis de Leopard 1A5 (EMES 18 en el techo, ex 1A1A1 con blindaje Blohm & Voss),
   otm-uswot y Tank Encyclopedia (M41UR uruguayo: 22 modernizados por Bernardini en 1991 con el 90 mm Cockerill Mk IV y diésel Scania). */
(()=>{
  const rubM=new THREE.MeshLambertMaterial({color:0x262624}), lens=()=>_shLensMat();
  const wheelsAt=(root,x,r,zs,mat,o)=>{ for(const z of zs) dWheel(root,x,r+.02,z,r,mat,o||{rim:.8}); };
  const rollers=(root,x,y,zs,mat)=>{ for(const z of zs) dWheel(root,x,y,z,.1,mat,{rim:.7}); };
  const smokeTubes=(tur,x,y,z,n,dir,ry)=>{ for(let k=0;k<n;k++){ const c=cyl(tur,.045,.045,.26,x+dir*k*.09,y+(k%2)*.05,z-k*.05,8,darkMat); c.rotation.set(-.85,ry||0,0); } };

  // ================= M60A1 / M60A3 (m.w2.det='m60', I.m60='a1'|'a3') =================
  // Torsión con 6 ruedas por lado y 3 rodillos de retorno, motriz atrás. Casco fundido con trompa en forma de bote, guardabarros con cajones,
  // faros en grupo, rejillas del motor y escapes atrás. Torre fundida larga ("nariz de aguja") con cúpula M19 y la .50 M85 adentro, reflector
  // AN/VSS-1 arriba del mantelete y canasto atrás. A3: manga térmica del 105 mm, telémetro láser, 6 lanzahumos M239 por lado.
  function m60Gear(root,I,x,s,tw,zf,zr,mat){ const r=.335, z0=zf-1.15, dz=(zf-zr-2.25)/5;
    wheelsAt(root,x,r,[0,1,2,3,4,5].map(i=>z0-i*dz),mat,{rim:.78,holes:6});
    rollers(root,x,I.trF-.05,[z0-dz*.6,z0-dz*2.5,z0-dz*4.3],mat);
    sprocketT(root,x,I.trR*.62,zr+.38,.33,11,mat); dWheel(root,x,I.trF*.62,zf-.42,.3,mat,{rim:.75});
    for(let i=0;i<6;i++){ const a=box(root,.08,.09,.5,x+s*(tw/2+.03),r+.12,z0-i*dz+.2,darkMat); a.rotation.x=.45; } }
  function m60Hull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const hw=M.W/2, ft=hw-I.trW/2, fy=Math.max(I.trF,I.trR)+.06;
    for(const sx of [-1,1]){ const p=glacisPt(I,deck,gz,zf,.15,.05);                                                                            // faros en su caja con protector
      const hb=rbox(root,.32,.2,.22,sx*(hw-.32),fy+.12,zf-.25,mat,.03); for(const dx of [-.08,.08]){ const h=cyl(hb,.05,.05,.04,dx,0,.11,10,lens()); h.rotation.x=Math.PI/2; }
      const k=new THREE.Mesh(_tgShackle,darkMat); k.scale.setScalar(.85); k.position.set(sx*iw2*.32,.62,zf+.02); k.rotation.y=Math.PI/2; root.add(k); }
    { const p=glacisPt(I,deck,gz,zf,.06,.04); cyl(root,.24,.26,.1,0,p.y+.02,p.z-.2,14,mat); for(const dx of [-.12,0,.12]) box(root,.08,.07,.06,dx,p.y+.08,p.z+.02,darkMat); }   // escotilla del conductor en el medio con 3 periscopios
    for(let k=0;k<3;k++){ rbox(root,I.trW*.85,.32,.85,ft,fy+.16,zf-1.4-k*1.1,mat,.04); rbox(root,I.trW*.85,.32,.85,-ft,fy+.16,zf-1.4-k*1.1,mat,.04); }   // cajones sobre los guardabarros
    box(root,iw2*.82,.03,1.6,0,deck+.02,zr+1.05,darkMat); for(let i=0;i<9;i++) box(root,iw2*.8,.04,.04,0,deck+.04,zr+.32+i*.18,mat);                 // rejillas del motor
    for(const sx of [-1,1]){ const g=rbox(root,.75,.3,.08,sx*iw2*.28,deck-.38,zr-.03,darkMat,.02); for(let i=0;i<4;i++) box(g,.68,.03,.02,0,-.1+i*.07,.05,mat); }   // rejillas de los escapes en la popa
    { const c=cyl(root,.03,.03,L*.55,hw-.05,deck-.12,0,6,darkMat); c.rotation.x=Math.PI/2; } }
  function m60Turret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th, a3=I.m60==='a3';
    { const m=castTurret(tur,M.tw,M.tl,th,mat,[[0,0],[1,0],[1.02,.4],[.93,.78],[.7,.96],[.35,1],[0,1]]), P=m.geometry.attributes.position;   // torre fundida "nariz de aguja":
      for(let i=0;i<P.count;i++){ const z=P.getZ(i); if(z<=0) continue; const k=z/hl; P.setX(i,P.getX(i)*(1-.5*k*k)); P.setY(i,P.getY(i)*(1-.28*k*k)); P.setZ(i,z*1.08); }   // angosta y baja hacia adelante
      m.geometry.computeVertexNormals(); }
    rbox(G.gp,.95,.55,.35,0,0,.12,mat,.1);                                                                                                  // mantelete
    { const e=cyl(G.barrel,M.gr*1.75,M.gr*1.75,.62,0,0,M.gl*.55,12,darkMat); e.rotation.x=Math.PI/2; }                                    // evacuador
    if(a3){ const s=cyl(G.barrel,M.gr*1.3,M.gr*1.3,M.gl*.75,0,0,M.gl*.45+.15,10,mat); s.rotation.x=Math.PI/2; for(let k=1;k<5;k++){ const b=cyl(G.barrel,M.gr*1.45,M.gr*1.45,.05,0,0,.3+k*M.gl*.17,10,darkMat); b.rotation.x=Math.PI/2; } }   // manga térmica con sus fajas
    cyl(G.gp,.025,.025,.4,.32,-.05,.35,6,darkMat).rotation.x=Math.PI/2;                                                                    // coaxial
    { const sl=rbox(G.gp,.72,.42,.4,0,.52,.05,darkMat,.05); box(sl,.6,.32,.02,0,0,.21,lens()); }                                           // reflector AN/VSS-1 arriba del mantelete
    if(a3){ const lr=rbox(tur,.22,.2,.3,hw*.5,th+.05,hl*.45,darkMat,.03); box(lr,.12,.08,.02,0,0,.16,lens()); for(const sx of [-1,1]) smokeTubes(tur,sx*hw*.62,th*.55,hl*.55,6,sx,-sx*.4); }   // telémetro láser y lanzahumos M239
    // cúpula M19 del jefe (derecha atrás) con la .50 M85 adentro, escotilla del cargador a la izquierda
    { const cx=hw*.38, cz=-hl*.2; cyl(tur,.42,.46,.36,cx,th+.16,cz,16,mat); for(let k=0;k<8;k++){ const a=k/8*Math.PI*2; box(tur,.09,.06,.03,cx+Math.sin(a)*.44,th+.2,cz+Math.cos(a)*.44,_shGlass).rotation.y=a; }
      cyl(tur,.36,.36,.06,cx,th+.37,cz-.05,14,mat);
      mgMount(tur,cx+.1,th+.25,cz+.3,{ball:.1,mat,yaw:[-Math.PI,Math.PI],pitch:[-.15,1],len:.95,cal:12.7,seat:['commander'],op:false}); }   // M85 (se maneja desde adentro)
    cyl(tur,.3,.3,.06,-hw*.4,th+.03,-hl*.25,14,mat); box(tur,.16,.08,.1,-hw*.4,th+.08,-hl*.05,darkMat);
    { const bk=new THREE.Group(); bk.position.set(0,th*.65,-hl-.25); tur.add(bk); box(bk,M.tw*.85,.04,.55,0,-.25,0,darkMat); for(const sx of [-1,1]) box(bk,.04,.45,.55,sx*M.tw*.42,0,0,darkMat); box(bk,M.tw*.85,.04,.04,0,.2,-.27,darkMat); }   // canasto atrás
    for(const sx of [-1,1]) for(let k=0;k<2;k++){ const r=new THREE.Mesh(new THREE.TorusGeometry(.06,.014,5,10),darkMat); r.position.set(sx*hw*.6,th+.02,hl*.2-k*hl*.9); r.rotation.x=Math.PI/2; tur.add(r); }   // argollas
    cyl(tur,.012,.012,2.4,-hw*.6,th+1.2,-hl*.7,4,darkMat); cyl(tur,.012,.012,2.4,hw*.75,th+1.2,-hl*.8,4,darkMat); }
  DET.m60={gear:m60Gear,hull:m60Hull,tur:m60Turret};

  // ================= Leopard 1A1 / 1A5 / 1V (m.w2.det='leo', I.leo='a1'|'a5'|'v') =================
  // 7 ruedas dobles con barras de torsión, 4 rodillos, motriz atrás, faldones de goma. Casco soldado en cuña con el motor atrás, faros y
  // retrovisores adelante. Torre fundida redondeada con manga térmica en el L7 de 105 mm, 4 lanzahumos por lado atrás, MG3 en la escotilla
  // del cargador (izquierda), periscopio TRP-2A del jefe. 1A5 y 1V: placas de blindaje Blohm & Voss abulonadas alrededor del mantelete y a los
  // costados; 1A5: caja blindada del visor EMES 18 adelante a la izquierda del techo.
  function leoGear(root,I,x,s,tw,zf,zr,mat){ const r=.35, z0=zf-1.0, dz=(zf-zr-1.95)/6;
    for(let i=0;i<7;i++){ const z=z0-i*dz; for(const d of [-tw*.22,tw*.22]) dWheel(root,x+d,r+.02,z,r,mat,{sc:.45,rim:.8}); }
    rollers(root,x,I.trF-.05,[z0-dz*.5,z0-dz*2.2,z0-dz*3.9,z0-dz*5.6],mat);
    sprocketT(root,x,I.trR*.6,zr+.36,.32,12,mat); dWheel(root,x,I.trF*.6,zf-.38,.3,mat,{rim:.75});
    const so=x+s*(tw/2+.05); box(root,.04,.42,zf-zr-.7,so,I.trF-.05,(zf+zr)/2+.1,rubM); }                                                       // faldón de goma
  function leoHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const hw=M.W/2, fy=Math.max(I.trF,I.trR)+.06;
    for(const sx of [-1,1]){ const h=rbox(root,.2,.16,.16,sx*(hw-.2),fy+.14,zf-.2,mat,.03); cyl(h,.055,.055,.04,0,0,.09,10,lens()).rotation.x=Math.PI/2;   // faros con su caja
      const m=box(root,.02,.16,.1,sx*(hw-.06),fy+.42,zf-.3,darkMat); cyl(root,.01,.01,.3,sx*(hw-.06),fy+.25,zf-.3,4,darkMat);                         // retrovisores
      const k=new THREE.Mesh(_tgShackle,darkMat); k.scale.setScalar(.8); k.position.set(sx*iw2*.3,.62,zf); k.rotation.y=Math.PI/2; root.add(k); }
    { const p=glacisPt(I,deck,gz,zf,.04,.04); cyl(root,.24,.25,.07,iw2*.28,p.y+.02,p.z-.25,14,mat); for(const dx of [-.1,.05,.18]) box(root,.08,.06,.05,iw2*.28+dx-.04,p.y+.06,p.z,darkMat); }   // escotilla del conductor (derecha)
    box(root,iw2*.85,.03,2.1,0,deck+.02,zr+1.25,darkMat); for(let i=0;i<11;i++) box(root,iw2*.83,.04,.04,0,deck+.04,zr+.28+i*.19,mat);              // rejillas del motor
    for(const sx of [-1,1]){ const g=box(root,.03,.32,.75,sx*(hw-.02),deck-.32,zr+.9,darkMat); for(let i=0;i<5;i++) box(root,.035,.03,.7,sx*(hw-.01),deck-.45+i*.065,zr+.9,mat); }   // salidas del escape a los costados
    rbox(root,iw2*.5,.25,.22,0,deck-.35,zr-.05,mat,.03);                                                                                    // caja de la popa
    { const c=cyl(root,.03,.03,L*.6,-(hw-.05),deck-.1,-.2,6,darkMat); c.rotation.x=Math.PI/2; } }
  function leoTurret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th, apl=I.leo==='a5'||I.leo==='v';
    rbox(G.gp,.82,.55,.32,0,0,.1,mat,.12);                                                                                                  // mantelete
    { const s=cyl(G.barrel,M.gr*1.35,M.gr*1.35,M.gl*.72,0,0,M.gl*.42+.15,10,mat); s.rotation.x=Math.PI/2; const e=cyl(G.barrel,M.gr*1.75,M.gr*1.75,.55,0,0,M.gl*.5,12,mat); e.rotation.x=Math.PI/2; }   // manga térmica y evacuador
    cyl(G.gp,.025,.025,.35,-.3,-.05,.32,6,darkMat).rotation.x=Math.PI/2;                                                                    // coaxial MG3
    if(apl){ for(const sx of [-1,1]){ const p=prism(tur,[[-.32,.45],[.32,.45],[.4,-.5],[-.3,-.5]],th*.78,.08,sx*hw*.55,th*.06,hl*.5,mat); p.rotation.y=-sx*.35;   // placas Blohm & Voss adelante
        for(const dz of [.25,-.25]) cyl(tur,.03,.03,.05,sx*hw*.82,th*.5,hl*.5+dz,6,darkMat).rotation.z=Math.PI/2;
        const sd=box(tur,.06,th*.7,hl*1.1,sx*(hw*.98),th*.42,-hl*.15,mat); sd.rotation.z=sx*.18; }                                        // y a los costados (espaciadas)
      box(tur,M.tw*.8,th*.55,.06,0,th*.4,-hl-.02,mat); }
    else for(const sx of [-1,1]){ const r=new THREE.Mesh(new THREE.TorusGeometry(.16,.02,6,14),darkMat); r.position.set(sx*hw*.82,th*.62,hl*.3); r.rotation.y=Math.PI/2; tur.add(r); }   // ventanas del telémetro óptico (1A1)
    if(I.leo==='a5'){ const e=rbox(tur,.5,.42,.55,-hw*.45,th+.18,hl*.5,mat,.04); box(e,.34,.22,.02,0,.04,.28,lens()); }                 // EMES 18 (visor con térmica y láser)
    for(const sx of [-1,1]) smokeTubes(tur,sx*hw*.82,th*.6,-hl*.45,4,0,sx*.9);                                                            // 4 lanzahumos por lado
    // jefe a la derecha con el periscopio TRP-2A, cargador a la izquierda con la MG3
    cyl(tur,.32,.34,.12,hw*.38,th+.06,-hl*.15,14,mat); { const pr=cyl(tur,.11,.12,.35,hw*.38,th+.3,-hl*.05,10,darkMat); box(tur,.18,.14,.12,hw*.38,th+.46,hl*.02,darkMat); }
    cyl(tur,.3,.3,.06,-hw*.38,th+.03,-hl*.2,14,mat);
    mgMount(tur,-hw*.38,th+.42,-hl*.2,{post:.3,...MG_AA,seat:['loader','commander']});                                                     // MG3 del cargador
    { const bx=rbox(tur,M.tw*.7,th*.6,.5,0,th*.38,-hl-.22,mat,.06); }                                                                    // cesto/cajón atrás
    cyl(tur,.012,.012,2.2,-hw*.5,th+1.1,-hl*.75,4,darkMat); cyl(tur,.012,.012,2.2,hw*.5,th+1.1,-hl*.75,4,darkMat); }
  DET.leo={gear:leoGear,hull:leoHull,tur:leoTurret};

  // ================= M41 Walker Bulldog / M41UR uruguayo (m.w2.det='m41') =================
  // 5 ruedas con barras de torsión, 3 rodillos de retorno, motriz atrás. Casco soldado chato con el motor atrás y rejillas grandes.
  // Torre soldada angulosa con el cesto trasero largo, cúpula del jefe a la derecha con la .50 en pivote (se maneja desde afuera).
  // M41UR: 90 mm Cockerill Mk IV (sin freno de boca, con evacuador) y chapas extra en el frente.
  function m41Gear(root,I,x,s,tw,zf,zr,mat){ const r=.32, z0=zf-.95, dz=(zf-zr-1.85)/4;
    wheelsAt(root,x,r,[0,1,2,3,4].map(i=>z0-i*dz),mat,{rim:.78,holes:6}); rollers(root,x,I.trF-.05,[z0-dz*.5,z0-dz*2,z0-dz*3.5],mat);
    sprocketT(root,x,I.trR*.62,zr+.34,.3,12,mat); dWheel(root,x,I.trF*.6,zf-.38,.28,mat,{rim:.75}); }
  function m41Hull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const hw=M.W/2, ft=hw-I.trW/2, fy=Math.max(I.trF,I.trR)+.06;
    { const p=glacisPt(I,deck,gz,zf,.45,.05), c=box(root,iw2*.92,.06,gz*.8,0,p.y,p.z,mat); c.rotation.x=p.a; }                                    // chapa extra del frente (M41UR)
    for(const sx of [-1,1]){ const hb=rbox(root,.26,.18,.18,sx*(hw-.28),fy+.12,zf-.2,mat,.03); cyl(hb,.05,.05,.04,0,0,.1,10,lens()).rotation.x=Math.PI/2;
      const k=new THREE.Mesh(_tgShackle,darkMat); k.scale.setScalar(.75); k.position.set(sx*iw2*.32,.55,zf+.02); k.rotation.y=Math.PI/2; root.add(k); }
    { const p=glacisPt(I,deck,gz,zf,.05,.04); cyl(root,.23,.24,.07,-iw2*.28,p.y+.02,p.z-.22,14,mat); box(root,.12,.07,.06,-iw2*.28,p.y+.07,p.z+.02,darkMat); }
    for(let k=0;k<2;k++){ rbox(root,I.trW*.85,.3,.8,ft,fy+.15,zf-1.3-k*1.0,mat,.04); rbox(root,I.trW*.85,.3,.8,-ft,fy+.15,zf-1.3-k*1.0,mat,.04); }
    box(root,iw2*.85,.03,1.7,0,deck+.02,zr+1.0,darkMat); for(let i=0;i<9;i++) box(root,iw2*.83,.04,.04,0,deck+.04,zr+.25+i*.18,mat);
    for(const sx of [-1,1]){ const e=cyl(root,.09,.09,.3,sx*iw2*.3,deck-.35,zr-.08,8,darkMat); e.rotation.x=Math.PI/2+.4; }
    { const c=cyl(root,.03,.03,L*.5,hw-.05,deck-.12,0,6,darkMat); c.rotation.x=Math.PI/2; } }
  function m41Turret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
    rbox(tur,M.tw*.82,th*.82,1.0,0,th*.42,-hl-.35,mat,.06);                                                                                 // cesto trasero largo
    rbox(G.gp,.6,.45,.3,0,0,.1,mat,.06);
    { const e=cyl(G.barrel,M.gr*1.8,M.gr*1.8,.5,0,0,M.gl*.6,12,darkMat); e.rotation.x=Math.PI/2; }                                         // evacuador del Cockerill Mk IV
    cyl(G.gp,.022,.022,.35,.26,-.04,.3,6,darkMat).rotation.x=Math.PI/2;
    { const rf=rbox(tur,.24,.18,.3,-hw*.55,th+.06,hl*.35,darkMat,.03); box(rf,.12,.08,.02,0,0,.16,lens()); }                              // telémetro/visor nuevo
    cyl(tur,.36,.38,.22,hw*.42,th+.1,-hl*.15,14,mat); for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; box(tur,.08,.05,.03,hw*.42+Math.sin(a)*.37,th+.15,-hl*.15+Math.cos(a)*.37,_shGlass).rotation.y=a; }
    mgMount(tur,hw*.42,th+.62,-hl*.15+.2,{post:.38,cal:12.7,...MG_AA,seat:['commander','loader']});                                       // .50 del jefe
    cyl(tur,.28,.28,.06,-hw*.4,th+.03,-hl*.2,14,mat);
    for(const sx of [-1,1]) smokeTubes(tur,sx*hw*.85,th*.6,hl*.2,3,0,sx*.9);
    cyl(tur,.012,.012,2,-hw*.6,th+1,-hl-.5,4,darkMat); }
  DET.m41={gear:m41Gear,hull:m41Hull,tur:m41Turret};

  // ================= T-62M: sobre el T-55 (DET.t55) con sus diferencias =================
  // Ruedas con el espacio más grande entre la 3.ª-4.ª y la 4.ª-5.ª (al revés que el T-55), torre más grande y chata, 115 mm U-5TS de ánima
  // lisa con el evacuador a un tercio de la boca, manga térmica (M) y la portañuela para tirar las vainas atrás. T-62M: cejas BDD, faldones,
  // telémetro KTD-2 arriba del cañón, lanzahumos 902B y chapa extra en el glacis (como el T-55AM).
  const _t55G=DET.t55.gear, _t55T=DET.t55.tur;
  DET.t55.gear=function(root,I,x,s,tw,zf,zr,mat){ if(I.t55!=='t62') return _t55G.apply(this,arguments);
    const r=.4, zs=[zf-1.0,zf-1.95,zf-2.9,zf-4.05,zf-5.25]; for(const z of zs) dWheel(root,x,r+.02,z,r,mat,{rim:.82,holes:0});
    sprocketT(root,x,I.trR*.6,zr+.34,.33,13,mat); dWheel(root,x,I.trF*.6,zf-.34,.3,mat,{rim:.78});
    const so=x+s*(tw/2+.04); for(let k=0;k<6;k++) box(root,.03,.5,(zf-zr-1.4)/6-.05,so,I.trF-.12,zf-.75-(k+.5)*(zf-zr-1.4)/6,rubM); };
  DET.t55.tur=function(tur,G,M,I,mat,gy){ if(I.t55!=='t62') return _t55T.apply(this,arguments);
    const J=Object.assign({},I,{t55:'am',t62:1}); _t55T.call(this,tur,G,M,J,mat,gy);                                                                 // lo del T-55AM (cejas, KTD-2, 902B, DShK)
    const hl=M.tl/2, th=M.th; { const s=cyl(G.barrel,M.gr*1.3,M.gr*1.3,M.gl*.5,0,0,M.gl*.3+.15,10,mat); s.rotation.x=Math.PI/2; }        // manga térmica (la parte de atrás del tubo)
    { const e=cyl(G.barrel,M.gr*1.75,M.gr*1.75,.55,0,0,M.gl*.66,12,darkMat); e.rotation.x=Math.PI/2; }                                     // evacuador a un tercio de la boca
    rbox(tur,.4,.3,.06,0,th*.62,-hl-.01,darkMat,.02); };                                                                                    // portañuela de las vainas

  // ---- los modelos nuevos (los datos de juego no cambian) ----
  const set=(k,m)=>{ if(VEH[k]) VEH[k].m=m; };
  const M60=(v)=>({ww1:'w2',L:6.95,W:3.63,H:3.05,tz:.05,tw:2.75,th:.95,tl:3.7,gl:5.3,gr:.07,
    w2:{trW:.62,trH:.95,trF:.95,trR:.95,deck:1.78,glacis:1.35,lowF:.5,sideH:.5,slope:.12,nW:6,wR:.335,ret:3,tur:'none',ins:'us',coax:0,det:'m60',m60:v}});
  set('m60',M60('a1')); set('m60a3',M60('a3'));
  const LEO=(v,ins)=>({ww1:'w2',L:7.09,W:3.25,H:2.62,tz:-.15,tw:2.7,th:.85,tl:3.2,gl:5.55,gr:.07,
    w2:{trW:.55,trH:.95,trF:.95,trR:.9,deck:1.62,glacis:1.55,lowF:.45,sideH:.5,slope:.2,nW:7,wR:.35,ret:4,tur:'cast',ins:ins,coax:0,det:'leo',leo:v}});
  set('leopard1',LEO('a1',0)); set('leo1a5',LEO('a5',0)); set('leo1v',LEO('v',0));
  set('m41u',{ww1:'w2',L:5.82,W:3.2,H:2.45,tz:.35,tw:2.25,th:.62,tl:2.4,gl:4.3,gr:.06,
    w2:{trW:.53,trH:.85,trF:.85,trR:.85,deck:1.55,glacis:1.05,lowF:.4,sideH:.5,slope:.1,nW:5,wR:.32,ret:3,tur:'bevel',ins:0,coax:0,det:'m41'}});
  set('t62m',{ww1:'w2',L:6.63,W:3.3,H:2.4,tz:.35,tw:2.6,th:.85,tl:2.7,gl:5.4,gr:.075,
    w2:{trW:.58,trH:.9,trF:.9,trR:.9,deck:1.42,glacis:1.3,lowF:.35,sideH:.45,nW:5,wR:.4,ret:0,tur:'dome',ins:'ru',coax:0,det:'t55',t55:'t62'}});
  // descripciones corregidas con las fuentes
  if(VEH.leo1a5) VEH.leo1a5.desc='Leopard 1A1A1 con el visor EMES 18 (láser y térmica) en el techo y la torre fundida con blindaje Blohm & Voss abulonado.';
  if(VEH.m41u) VEH.m41u.desc='M41 Walker Bulldog modernizado en 1991 por Bernardini para Uruguay: cañón Cockerill de 90 mm y motor diésel Scania. Liviano y ágil.';
})();
