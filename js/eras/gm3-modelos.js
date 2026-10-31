/* ---------- Modelos hechos por código de la Segunda Guerra Mundial (1939–1945) ----------
   Un constructor para todos (buildW2, m.ww1='w2', parámetros en m.w2). Respecto del de Entreguerras suma lo que distingue a los
   tanques de esta guerra: blindaje inclinado (costados que se cierran hacia arriba: T-34, Panther), torres fundidas (Sherman, T-34-85, IS-2),
   hexagonales (T-34/76), de caja (Tiger) o abiertas (M10), casamatas sin torre (StuG), mantelete, freno de boca, ruedas grandes
   intercaladas (Tiger, Panther), suspensión Christie (Cromwell, Crusader), bogies (Sherman, Pz IV), faldones (Schürzen), orugas
   envueltas (Churchill, Matilda), cajas de herramientas, tanques de combustible y las insignias de cada nación.
   Deja en el tanque lo mismo que los demás constructores (turret, gunPivot, barrel, muzzle, coax, colliders, hTop, topH, aimH, seatPos). */
_helmM.m1=new THREE.MeshLambertMaterial({color:0x4f5238});   // casco M1 estadounidense
_helmM.arg=new THREE.MeshLambertMaterial({color:0x58603f});  // casco argentino modelo 1938 (forma alemana)
_helmM.ita=new THREE.MeshLambertMaterial({color:0x5e5a44}); _helmM.jpn=new THREE.MeshLambertMaterial({color:0x5f5a3a}); _helmM.chn=new THREE.MeshLambertMaterial({color:0x4f5640}); // Italia (M33), Japón (Tipo 90), China (M35 alemán)
const _celMat=new THREE.MeshLambertMaterial({color:0x74acdf});
// Escarapela argentina (celeste, blanco, celeste)
function arRoundel(parent,x,y,z,ry,s=1){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; parent.add(g);
  const c=(r,m,o)=>{ const d=new THREE.Mesh(new THREE.CircleGeometry(r*s,18),m); d.rotation.y=Math.PI/2; d.position.x=o; g.add(d); };
  c(.26,_celMat,0); c(.17,_wMat,.004); c(.08,_celMat,.008); return g; }
const _verdeMat=new THREE.MeshLambertMaterial({color:0x2e7d3a}), _amaMat=new THREE.MeshLambertMaterial({color:0xd6b23a}), _azulCn=new THREE.MeshLambertMaterial({color:0x1f3f8f});
// Insignias de las naciones nuevas: Italia (franjas verde, blanca y roja), Japón (estrella amarilla del Ejército),
// China nacionalista (cielo azul y sol blanco)
function w2Insignia2(parent,kind,x,y,z,ry,s=1){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; parent.add(g);
  if(kind==='it'){ [_verdeMat,_wMat,_rMat].forEach((m,i)=>box(g,.02,.32*s,.14*s,0,0,(i-1)*.14*s,m)); }
  else if(kind==='jp'){ const sh=new THREE.Shape(); for(let i=0;i<10;i++){ const a=i/10*Math.PI*2-Math.PI/2, r=(i%2?.09:.22)*s; i?sh.lineTo(Math.cos(a)*r,-Math.sin(a)*r):sh.moveTo(Math.cos(a)*r,-Math.sin(a)*r); }
    const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),_amaMat); m.rotation.y=Math.PI/2; g.add(m); }
  else if(kind==='cn'){ const c=(r,m,o)=>{ const d=new THREE.Mesh(new THREE.CircleGeometry(r*s,18),m); d.rotation.y=Math.PI/2; d.position.x=o; g.add(d); };
    c(.25,_azulCn,0); c(.13,_wMat,.004); for(let i=0;i<12;i++){ const r=box(g,.012,.05*s,.05*s,.006,Math.sin(i/12*6.283)*.17*s,Math.cos(i/12*6.283)*.17*s,_wMat); r.rotation.x=i/12*6.283; } }
  return g; }
function w2Insignia(parent,kind,x,y,z,ry,s=1){
  if(kind==='it'||kind==='jp'||kind==='cn') return w2Insignia2(parent,kind,x,y,z,ry,s);
  if(kind==='de') return ironCross(parent,x,y,z,ry,s*.85);
  if(kind==='ar') return arRoundel(parent,x,y,z,ry,s);
  if(kind==='uk'){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; parent.add(g); box(g,.02,.3*s,.55*s,0,0,0,_wMat); box(g,.025,.3*s,.18*s,0,0,0,_rMat); return g; } // franjas de reconocimiento
  return iwInsignia(parent,kind,x,y,z,ry,s); }

// Inclina los costados: los vértices por encima de y0 se acercan al eje x (k = cuánto se cierra arriba, 0 a .4)
function slopeX(geo,y0,y1,k){ const p=geo.attributes.position; for(let i=0;i<p.count;i++){ const y=p.getY(i), f=clamp((y-y0)/Math.max(.01,y1-y0),0,1); p.setX(i,p.getX(i)*(1-k*f)); } geo.computeVertexNormals(); return geo; }
// Prisma de planta (x,z) extruido en y con los costados que se cierran hacia arriba (torres, casamatas)
function prismGeo(plan,h,taper=0){ const sh=new THREE.Shape(); plan.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z)); sh.closePath();
  const g=new THREE.ExtrudeGeometry(sh,{depth:h,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:1}); g.rotateX(-Math.PI/2);
  const p=g.attributes.position; for(let i=0;i<p.count;i++){ const f=clamp(p.getY(i)/h,0,1)*taper; p.setX(i,p.getX(i)*(1-f)); p.setZ(i,p.getZ(i)*(1-f*.6)); }
  const uv=g.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*.3,uv.getY(i)*.3); g.computeVertexNormals(); return g; }
function prism(parent,plan,h,taper,x,y,z,mat){ const m=new THREE.Mesh(prismGeo(plan,h,taper),mat); m.position.set(x,y,z); m.castShadow=m.receiveShadow=true; parent.add(m); return m; }
// Torre fundida: perfil de revolución (radio, altura) estirado a lo largo
function castTurret(parent,w,l,h,mat,shape){ const r=w/2, P=(shape||[[.0,0],[1,0],[1.02,.35],[.95,.75],[.75,.95],[.4,1.0],[0,1.0]]).map(([a,b])=>new THREE.Vector2(a*r,b*h));
  const g=new THREE.LatheGeometry(P,16); g.scale(1,1,l/w); const uv=g.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*1.2,uv.getY(i)*.5);
  const m=new THREE.Mesh(g,mat); m.castShadow=m.receiveShadow=true; parent.add(m); return m; }

// Forma de la torre; devuelve la altura del cañón
function w2Turret(tur,M,I,mat){ const w=M.tw, l=M.tl, h=M.th, hw=w/2, hl=l/2;
  switch(I.tur){
    case 'cast': castTurret(tur,w,l,h,mat); if(I.bus) castTurret(tur,w*.75,l*.45,h*.8,mat).position.z=-hl*.7; break;          // Sherman, T-34-85, IS-2, Churchill VII
    case 'tiger': { const P=[[-hw*.93,hl],[hw*.93,hl],[hw,hl*.62],[hw,-hl*.12]];                           // Tiger I: herradura (costados que siguen por atrás)
      for(let i=1;i<12;i++){ const a=i/12*Math.PI; P.push([hw*Math.cos(a),-hl*.12-hl*.88*Math.sin(a)]); } P.push([-hw,-hl*.12],[-hw,hl*.62]);
      prism(tur,P,h,.035,0,0,0,mat); break; }
    case 't23': { // torre T23 del Sherman 76 mm (Easy Eight): costados más rectos, frente inclinado y un cesto trasero largo de contrapeso
      const b=castTurret(tur,w,l*.82,h,mat,[[0,0],[1,0],[1.01,.5],[.95,.82],[.72,.98],[.3,1],[0,1]]); b.position.z=hl*.08;
      const r=castTurret(tur,w*.84,l*.6,h*.86,mat,[[0,0],[1,0],[1,.6],[.9,.9],[.5,1],[0,1]]); r.position.z=-hl*.48; break; }
    case 'chur': { const P=[]; for(let i=0;i<24;i++){ const t=i/24*Math.PI*2, c=Math.cos(t), n=Math.sin(t); P.push([Math.sign(c)*Math.abs(c)**.5*hw,Math.sign(n)*Math.abs(n)**.5*hl]); }
      prism(tur,P,h,.06,0,0,0,mat); break; }                                                                                    // Churchill VII: torre compuesta (fundida y soldada)
    case 'cyl': { const c=cyl(tur,hw*.96,hw,h,0,h/2,0,14,mat); c.scale.z=l/w*.85; break; }                                          // BT-7: cilíndrica
    case 'hex': prism(tur,[[-hw*.55,hl],[hw*.55,hl],[hw,hl*.15],[hw*.8,-hl],[-hw*.8,-hl],[-hw,hl*.15]],h,.22,0,0,0,mat); break;     // T-34/76
    case 'box': prism(tur,[[-hw*.85,hl],[hw*.85,hl],[hw,hl*.6],[hw,-hl*.55],[hw*.75,-hl],[-hw*.75,-hl],[-hw,-hl*.55],[-hw,hl*.6]],h,.04,0,0,0,mat); break; // Tiger, Churchill, Cromwell
    case 'pan': prism(tur,[[-hw*.45,hl],[hw*.45,hl],[hw,hl*.2],[hw,-hl],[-hw,-hl],[-hw,hl*.2]],h,.28,0,0,0,mat); break;            // Panther, Nahuel
    case 'open': prism(tur,[[-hw*.5,hl],[hw*.5,hl],[hw,hl*.1],[hw*.85,-hl],[-hw*.85,-hl],[-hw,hl*.1]],h,.2,0,0,0,mat);          // M10: abierta arriba
      box(tur,w*.62,.04,l*.7,0,h-.02,-.05,darkMat); break;
    case 'none': break;                                                                                                          // casamata (StuG): el cañón va en el casco
    default: prism(tur,[[-hw*.75,hl],[hw*.75,hl],[hw,hl*.35],[hw,-hl*.85],[hw*.85,-hl],[-hw*.85,-hl],[-hw,-hl*.85],[-hw,hl*.35]],h,.12,0,0,0,mat); // biselada (Pz III/IV, Crusader, Stuart)
  }
  if(I.bus&&I.tur!=='cast'&&I.tur!=='none') rbox(tur,w*.72,h*.65,.5,0,h*.45,-hl-.2,mat,.05);                                    // caja de la radio / cesto
  if(I.skirtT){ const s=prism(tur,[[-hw-.15,hl*.4],[hw+.15,hl*.4],[hw+.15,-hl-.25],[-hw-.15,-hl-.25]],h*.85,0,0,.05,0,mat); s.scale.set(1,1,1); } // Schürzen de la torre (Pz IV H)
  return h*.48; }

function buildW2(t,M,mat,root,lkL,lkR){ shTurMG.t=t;
  const I=M.w2, L=M.L, hw=M.W/2, tw=I.trW, tx=hw-tw/2-(I.cover?.06:0), H=I.trH, zf=L/2, zr=-L/2;
  // ---- tren de rodaje ----
  const prof=I.chur
    ? [[zf-.3,H],[zr+.3,H],[zr,H*.75],[zr+.3,.12],[zr+.7,0],[zf-.7,0],[zf-.25,.12],[zf,H*.75]]   // Churchill/Matilda: oruga alta que rodea el casco
    : [[zf-.25,I.trF],[zr+.3,I.trR],[zr,I.trR*.62],[zr+.35,.15],[zr+.75,0],[zf-.75,0],[zf-.3,.18],[zf,I.trF*.62]];
  const nW=I.nW, wR=I.wR, span=L-(I.chr?1.1:1.55);
  for(const s of [-1,1]){ const x=s*tx;
    trackLoop(root,prof,tw,x,s>0?lkR:lkL,sideTrkMat,.08);
    if(I.nose==='sher') shermanGear(root,I,x,s,tw,zf,zr,mat);                                           // Sherman: bogies VVSS/HVSS, motriz adelante
    else if(I.tiger) tigerGear(root,I,x,s,tw,zf,zr,mat);
    else if(I.det) DET[I.det].gear(root,I,x,s,tw,zf,zr,mat);                                             // Panther, T-34, IS-2                                                   // Tiger: ruedas intercaladas en capas, motriz adelante
    else {
    for(let i=0;i<nW;i++){ const z=-span/2+i*span/Math.max(1,nW-1), dx=I.inter?(i%2?-.12:.1):0;          // intercaladas: dos filas
      dWheel(root,x+s*(.02+dx),wR+.03,z,wR,mat,{rim:wR>.3?.8:.74,holes:I.holes||(wR>.35&&!I.bog?6:0)}); }      // goma, disco del color del casco y cubo
    if(I.bog) for(let i=0;i<Math.ceil(nW/2);i++){ const z=-span/2+(i*2+.5)*span/Math.max(1,nW-1); rbox(root,.1,wR*1.2,wR*2.4,x+s*(tw/2+.04),wR*1.2,z,darkMat,.03); }
    for(let i=0;i<(I.ret||0);i++){ const z=-span*.36+i*span*.72/Math.max(1,I.ret-1); dWheel(root,x,(I.trF+I.trR)/2-.12,z,.09,mat,{rim:.7}); }
    // rueda motriz con dientes (atrás en los británicos y soviéticos, adelante en el resto) y tensora con disco
    const rear=I.rearDrive??['uk','ru'].includes(t.T.nation);
    sprocketT(root,x,(rear?I.trR:I.trF)*.62,rear?zr+.36:zf-.33,.26,13,mat); dWheel(root,x,(rear?I.trF:I.trR)*.62,rear?zf-.33:zr+.36,.24,mat,{rim:.75}); }
    if(I.skirt) profMesh(root,[[zf-.55,H*I.skirt+.08],[zr+.45,H*I.skirt+.08],[zr+.5,H*.28],[zf-.6,H*.28]],.05,x+s*(tw/2+.06),t.mud||mat); // faldón
    if(I.schurz) for(let k=0;k<5;k++){ const z=zr+.8+k*(L-1.6)/5; box(root,.04,.62,(L-1.6)/5-.06,x+s*(tw/2+.16),I.deck-.2,z+(L-1.6)/10,mat); } // Schürzen (planchas sueltas)
    if(I.chur) profMesh(root,[[zf-.35,H+.06],[zr+.35,H+.06],[zr+.1,H*.8],[zf-.1,H*.8]],tw+.08,x,mat);        // techo de la oruga envuelta
    else box(root,tw+.08,.04,L-.25,x,Math.max(I.trF,I.trR)+.04,-.04,t.mud||mat);                          // guardabarros
  }
  // ---- casco ----
  const iw2=I.cover?M.W-tw*2-.1:M.W-tw*2+.04, deck=I.deck, gz=I.glacis, low=I.lowF??.35, rz=I.rearS??.25;
  { const zf=L/2-(I.recess||0);                                                                          // Churchill: la trompa queda atrás de los cuernos de la oruga
  // cuerpo entre las orugas (perfil: frente inclinado, popa)
  profMesh(root,[[zf-gz,deck],[zr+rz,deck],[zr,deck-rz*.9],[zr,.38],[zf-.55,.3],[zf,low+.18],[zf,low+.3]],iw2,0,mat);
  // parte alta que sobresale sobre las orugas (con los costados inclinados si corresponde)
  { const top=I.cover?M.W-.1:M.W-.02, yb=deck-(I.sideH??.6);
    const g=I.castHull?castHullGeo(zf,zr,deck,yb,top,gz,rz,I.slope||0):profGeo([[zf-gz+.02,deck],[zr+rz,deck],[zr+rz*.4,yb+.05],[zr+.1,yb],[zf-gz*.15,yb],[zf-gz*.05,yb+.1]],top);
    if(I.slope&&!I.castHull) slopeX(g,yb,deck,I.slope);
    const m=new THREE.Mesh(g,mat); m.castShadow=m.receiveShadow=true; root.add(m); }
  if(I.nose==='sher'){ const n=cyl(root,.42,.42,iw2*.95,0,.62,zf-.25,16,mat); n.rotation.z=Math.PI/2; shermanHull(root,M,I,mat,iw2,deck,gz,zf,zr,L); } // trompa redonda del Sherman y sus detalles
  if(I.tiger) tigerHull(root,M,I,mat,iw2,deck,gz,zf,zr,L);
  if(I.det) DET[I.det].hull(root,M,I,mat,iw2,deck,gz,zf,zr,L);
  else if(!I.tiger&&I.nose!=='sher'&&!I.case) genHull(t,root,M,I,mat,iw2,deck,gz,zf,zr,L);
  }
  // casamata (StuG, M10 no: torre abierta) y detalles
  if(I.case){ const C=I.case; prism(root,[[-C.w/2,C.l/2],[C.w/2,C.l/2],[C.w/2,-C.l/2],[-C.w/2,-C.l/2]],C.h,C.taper||.15,0,deck-.02,C.z,mat); }
  if(!I.det) box(root,iw2*.62,.05,L*.22,0,deck+.03,zr+L*.16,darkMat);                                                   // rejilla del motor
  if(!I.det) for(let i=0;i<2;i++) rbox(root,.32,.06,.42,(i?-1:1)*iw2*.22,deck+.04,zf-gz-.45,mat,.02);                   // escotillas del conductor y radio
  if(I.bmg&&!t.T.static) placeBowMG(t,root,I,mat,deck,zf);                                                             // ametralladora de casco, sobre el blindaje
  if(!I.det) for(const sx of [-1,1]){ const ex=cyl(root,.08,.09,.42,sx*iw2*.3,deck-.2,zr+.02,8,darkMat); ex.rotation.x=Math.PI/2; }   // escapes
  if(I.tanks) for(const sx of [-1,1]) cyl(root,.2,.2,.9,sx*(M.W/2-.2),deck+.18,zr+.7,10,mat).rotation.x=Math.PI/2;           // tanques de combustible externos (T-34)
  if(!I.det) box(root,.12,.12,1.1,(M.W/2-.25),deck+.06,zr+L*.42,darkMat); if(!I.det) box(root,.08,.08,1.4,-(M.W/2-.25),deck+.05,zr+L*.45,_wdMat); // herramientas: gato y pala
  if(I.spare) for(let i=0;i<4;i++) box(root,iw2*.7,.05,.16,0,deck-gz*.3+i*.06,zf-gz*.55+i*.12,trackMat);                      // eslabones de repuesto en el glacis
  if(I.ins) for(const sx of [-1,1]) w2Insignia(root,I.ins,sx*(M.W/2+.01-(I.slope?I.slope*M.W*.25:0)),deck-.3,zr+L*.3,sx>0?0:Math.PI,.9);
  // ---- torre (o mantelete de la casamata) ----
  const tur=new THREE.Group(); tur.position.set(I.tx||0,I.case?deck+I.case.h*.35:deck,M.tz); root.add(tur);
  const gy=I.case?0:w2Turret(tur,M,I,mat);
  if(I.cup) { cyl(tur,.28,.3,.25,I.cupX??-M.tw*.2,M.th+.12,-M.tl*.22,12,mat); slits(tur,3,I.cupX??-M.tw*.2,M.th+.16,-M.tl*.22+.29,0,.08); }
  else if(!I.case&&I.tur!=='open'&&!shCast(I)) rbox(tur,.5,.06,.5,-M.tw*.18,M.th+.03,-M.tl*.15,mat,.02);
  if(I.ins&&I.tur!=='none'&&I.tur!=='tiger'&&!I.case&&['ru','us','ar','de','jp','cn','fr'].includes(I.ins)) for(const sx of [-1,1]) w2Insignia(tur,I.ins,sx*(M.tw/2*.92+.01),gy+.05,-M.tl*.1,sx>0?0:Math.PI,.65);
  const G=gunMount(t,tur,0,gy,I.case?.0:M.tl/2-.08,M.gl,M.gr,mat,{shR:Math.max(.16,M.gr*3.4)});
  // mantelete
  if(I.det) DET[I.det].tur(tur,G,M,I,mat,gy);
  else if(I.mant==='round'){ const m=cyl(G.gp,M.gr*4.2,M.gr*4.2,.35,0,0,.12,12,mat); m.rotation.x=Math.PI/2; }
  else if(shCast(I)) shermanTurret(tur,G,M,I,mat,gy);
  else if(I.tur==='tiger') tigerTurret(tur,G,M,I,mat,gy);                                                       // mantelete con la mira binocular, cajón, lanzahumos                                   // mantelete M34A1, escotillas, .50
  else if(I.mant!=='none'){ const mw=I.mantW||Math.max(.6,M.tw*.42); rbox(G.gp,mw,Math.max(.32,M.gr*7),.28,0,0,.08,mat,.06); }
  if(!I.det&&I.tur!=='tiger'&&!shCast(I)&&!['none','open'].includes(I.tur)&&!I.case) genTurret(tur,M,I,mat);
  // freno de boca
  if(I.mb){ const b=cyl(G.barrel,M.gr*2.1,M.gr*2.1,.32,0,0,M.gl-.04,10,darkMat); b.rotation.x=Math.PI/2; if(I.mb===2){ const b2=cyl(G.barrel,M.gr*2.1,M.gr*2.1,.14,0,0,M.gl-.36,10,darkMat); b2.rotation.x=Math.PI/2; } }
  if(I.sleeve){ const s=cyl(G.barrel,M.gr*1.6,M.gr*1.6,M.gl*.32,0,0,M.gl*.16+.12,10,mat); s.rotation.x=Math.PI/2; }        // manguito del tubo (Pz IV, Sherman 76)
  if(I.coax!==0){ const c=cyl(G.gp,.025,.025,.45,.24,-.04,.32,6,darkMat); c.rotation.x=Math.PI/2; }
  if(I.aaN){ const n=I.aaN, sp=I.aaSp||.22;                                                                 // antiaéreo: tubos extra (dobles o cuádruples) que suben con el cañón
    for(let i=0;i<n;i++){ const col=n===4?(i%2?1:-1):(n===2?(i?1:-1):0), row=n===4?(i<2?1:-1):0; const x=col*sp, y=row*sp*.7, z=(row>0?.12:0);
      if(i===0&&n!==2&&n!==4) continue; const b=cyl(G.barrel,M.gr,M.gr,M.gl,x,y,M.gl/2+z,8,darkMat); b.rotation.x=Math.PI/2;
      const fh=cyl(G.barrel,M.gr*1.7,M.gr*1.3,.3,x,y,M.gl+z-.1,8,darkMat); fh.rotation.x=Math.PI/2; }
    if(n===2||n===4) G.bm.visible=false; box(G.gp,sp*2.4,sp*(n===4?2.2:1.2),.5,0,0,-.05,mat); }
  if(I.aa&&!shCast(I)) { cyl(tur,.03,.03,.3,M.tw*.25,M.th+.12,-M.tl*.2,6,darkMat); const a=cyl(tur,.022,.022,.85,M.tw*.25,M.th+.3,-M.tl*.2+.3,6,darkMat); a.rotation.x=Math.PI/2.15; t.aaMuz=mgMuzzle(tur,M.tw*.25,M.th+.33,-M.tl*.2+.72); } // ametralladora antiaérea sobre su soporte
  t.turret=tur; t.gunPivot=G.gp; t.barrel=G.barrel; t.muzzle=G.muzzle; t.coax=G.coax; t.barrelMesh=G.bm;
  if(I.case) collider(root,I.case.w,I.case.h,I.case.l,0,deck+I.case.h/2,I.case.z,t,'turret'); else collider(tur,M.tw,M.th,M.tl,0,M.th/2,0,t,'turret');
  collider(root,M.W-.1,deck-.25,L,0,(deck+.25)/2,0,t,'hull');
  const hTop=I.case?deck+I.case.h:deck+M.th;
  t.hTop=deck; t.topH=hTop+(I.cup?.38:.12); t.aimH=deck*.7; t.glL=gz;
  const tp=(x,y,z)=>(sd,T)=>{ const c=Math.cos(T.turretYaw), sn=Math.sin(T.turretYaw); return V3((I.tx||0)+x*c+z*sn,deck+y,M.tz-x*sn+z*c); };
  t.seatPos={driver:V3(-iw2*.22,deck-.45,zf-gz-.35),gunner:tp(-M.tw*.2,M.th*.35,0),commander:tp(-M.tw*.18,M.th*.6,-M.tl*.25),loader:tp(M.tw*.22,M.th*.35,-.05),
    mg1:V3(iw2*.22,deck-.45,zf-gz-.3),mg2:V3(-iw2*.25,deck-.4,zf-gz-.1),engine:V3(0,deck*.55,zr+L*.2),trans:V3(0,deck*.4,I.rearDrive?zr+.5:zf-.6),
    ammo:V3(iw2*.25,deck*.5,M.tz),breech:tp(0,gy,M.tl*.15)};
}
const _wdMat=new THREE.MeshLambertMaterial({color:0x6b5236});

// ---- Semioruga (Sd.Kfz. 251 / M3): ruedas adelante, oruga atrás, caja abierta con la infantería y ametralladora con escudo ----
function buildHT(t,M,mat,root,lkL,lkR){
  const H=M.ht, L=M.L, hw=M.W/2, zf=L/2, zr=-L/2, tl=L*.55, tz0=zr+tl/2, tw=.32, tx=hw-tw/2-.05;
  const prof=[[tz0+tl/2-.2,.75],[tz0-tl/2+.2,.75],[tz0-tl/2,.5],[tz0-tl/2+.25,.1],[tz0-tl/2+.55,0],[tz0+tl/2-.55,0],[tz0+tl/2-.2,.1],[tz0+tl/2,.5]];
  for(const s of [-1,1]){ const x=s*tx; trackLoop(root,prof,tw,x,s>0?lkR:lkL,sideTrkMat,.06);
    for(let i=0;i<5;i++) wheel(root,x+s*(i%2?.06:-.04),.33,tz0-tl/2+.45+i*(tl-.9)/4,.3);
    wheel(root,s*(hw-.15),.42,zf-.75,.42); }                                                              // ruedas delanteras
  // casco: capó del motor adelante (más angosto) y la caja de los soldados atrás, con los costados inclinados
  const hood=profGeo([[zf,.85],[zf-1.6,1.25],[zf-1.7,.6],[zf-.1,.55]],M.W*.72); slopeX(hood,.8,1.25,.15); const hm=new THREE.Mesh(hood,mat); hm.castShadow=hm.receiveShadow=true; root.add(hm);
  const bx=profGeo([[zf-1.6,1.55],[zr+.1,1.55],[zr,1.4],[zr,.55],[zf-1.7,.55]],M.W-.1); slopeX(bx,.6,1.55,.12); const bm=new THREE.Mesh(bx,mat); bm.castShadow=bm.receiveShadow=true; root.add(bm);
  box(root,M.W*.72,.06,L-2.0,0,1.53,(zf-1.6+zr)/2-.05,darkMat);                                          // interior abierto
  if(!H.aa) for(let i=0;i<6;i++){ const s=i%2?1:-1, z=zf-2.2-Math.floor(i/2)*.9; const P=personMesh({kind:'rifle',team:t.team,nat:(t.crew&&t.crew.nation)||t.T.nation}); P.g.position.set(s*.42,.62,z); P.parts.hip.position.y=.5; P.parts.legL.rotation.x=P.parts.legR.rotation.x=-1.4; P.g.rotation.y=s>0?-Math.PI/2:Math.PI/2; root.add(P.g); (t.deco||(t.deco=[])).push(P.g); (t.seated||(t.seated=[])).push(P.g); } // soldados sentados
  if(H.ins) for(const sx of [-1,1]) w2Insignia(root,H.ins,sx*(M.W/2-.04),1.1,zr+L*.35,sx>0?0:Math.PI,.8);
  // ametralladora adelante de la caja, con su escudo
  const tur=new THREE.Group(); tur.position.set(0,H.aa?1.1:1.55,H.aa?zr+1.6:zf-1.75); root.add(tur);
  if(H.aa){ cyl(tur,.35,.4,.45,0,.22,0,10,mat); box(tur,1.3,.7,.05,0,.75,.35,mat); for(const sx of [-.62,.62]) box(tur,.05,.6,.5,sx,.7,.1,mat); } else
  box(tur,.75,.45,.04,0,.25,.12,mat); const G=gunMount(t,tur,0,H.aa?.85:.3,.1,M.gl,M.gr,mat,{shield:false});
  if(H.aa) for(const [x,y] of [[-.38,.12],[.38,.12],[-.38,-.12],[.38,-.12]]){ const b=cyl(G.barrel,M.gr,M.gr,M.gl,x,y,M.gl/2+.1,8,darkMat); b.rotation.x=Math.PI/2; box(G.gp,.14,.2,.35,x,y,-.05,darkMat); }
  if(H.aa){ G.bm.visible=false; box(G.gp,.4,.3,.4,0,0,-.1,mat); }
  t.turret=tur; t.gunPivot=G.gp; t.barrel=G.barrel; t.muzzle=G.muzzle; t.coax=G.coax; t.barrelMesh=G.bm;
  collider(tur,.8,.5,.4,0,.25,.1,t,'turret'); collider(root,M.W,1.5,L,0,.8,0,t,'hull');
  t.hTop=1.55; t.topH=2.1; t.aimH=1.0; t.glL=.5;
  t.seatPos={driver:V3(-.35,1.0,zf-1.9),commander:V3(.35,1.1,zf-1.9),gunner:V3(0,1.5,zf-1.9),loader:V3(0,1.2,zf-2.6),mg1:V3(0,1.2,zf-2.6),engine:V3(0,.9,zf-.7),trans:V3(0,.6,zf-1.2),ammo:V3(0,.8,0),breech:V3(0,1.7,zf-1.75)};
}
// ---- Antiaéreo (Flak 38 de 20 mm, Bofors de 40 mm): plataforma en cruz, montaje que gira y tubo que sube hasta casi vertical ----
function buildAA(t,M,mat,root){
  for(const r of [0,Math.PI/2]){ const b=box(root,3.2,.12,.3,0,.12,0,mat); b.rotation.y=r; }
  for(const [x,z] of [[1.6,0],[-1.6,0],[0,1.6],[0,-1.6]]) cyl(root,.12,.14,.1,x,.06,z,8,darkMat);
  cyl(root,.35,.45,.5,0,.4,0,10,mat);
  const tur=new THREE.Group(); tur.position.set(0,.65,0); root.add(tur);
  box(tur,1.1,.12,1.0,0,.06,0,mat); box(tur,.08,.7,.7,.45,.45,0,mat); box(tur,.08,.7,.7,-.45,.45,0,mat);   // cuna
  box(tur,1.2,.6,.04,0,.75,.42,mat);                                                                        // escudo chico
  for(const sx of [-.7,.7]){ const st=box(tur,.3,.05,.3,sx,.5,-.4,darkMat); }                               // asientos de los apuntadores
  const G=gunMount(t,tur,0,.8,0,M.gl,M.gr,mat,{shield:false}); if(M.aaTwin){ const b2=cyl(G.barrel,M.gr,M.gr,M.gl,.2,0,M.gl/2+.12,8,darkMat); b2.rotation.x=Math.PI/2; }
  const fh=cyl(G.barrel,M.gr*1.8,M.gr*1.4,.4,0,0,M.gl-.1,8,darkMat); fh.rotation.x=Math.PI/2;                // apagallamas
  box(G.gp,.18,.25,.5,0,.18,-.1,darkMat);                                                                    // cargador
  t.turret=tur; t.gunPivot=G.gp; t.barrel=G.barrel; t.muzzle=G.muzzle; t.coax=G.coax; t.barrelMesh=G.bm;
  collider(tur,1.2,1.0,1.0,0,.5,0,t,'turret'); collider(root,2,.8,2,0,.4,0,t,'hull');
  t.deco=[]; for(const [x,z,ry] of [[-.9,-.9,0],[.9,-.8,.4],[-.3,-1.6,-.3]]){ const P=personMesh({kind:'rifle',team:t.team,nat:(t.crew&&t.crew.nation)||t.T.nation}); P.g.position.set(x,0,z); P.g.rotation.y=ry; if(P.parts.wep) P.parts.wep.visible=false; root.add(P.g); t.deco.push(P.g); }
  t.hTop=1.0; t.topH=1.9; t.aimH=.9; t.glL=.3;
  t.seatPos={gunner:V3(-.7,1.0,-.4),loader:V3(.7,1.0,-.4),commander:V3(-.9,1.0,-.9),driver:V3(.9,1.0,-.8),ammo:V3(0,.6,-.3),engine:V3(0,.3,0),trans:V3(0,.3,0),breech:V3(0,1.4,-.2),mg1:V3(0,1,0)};
}

/* ---------- Sherman más fiel (pedido de Sebastián: "mejora del modelo EE. UU.") ----------
   Medidas del M4 (TM 9-731): ruedas de rodaje de 508 mm, bogies cada ~1,5 m, rueda motriz adelante (transmisión adelante).
   VVSS (M4A1, M4A2, M4A4, Firefly, M10, M36, Achilles): 3 bogies por lado, 2 ruedas, resorte en espiral (volute) y rodillo de retorno
   arriba y atrás del bogie. HVSS (M4A3E8, oruga ancha trW >= .55): 3 bogies con 4 ruedas dobles, resorte horizontal y 4 rodillos sueltos. */
function shermanGear(root,I,x,s,tw,zf,zr,mat){
  const hv=tw>=.55, wR=hv?.26:.255, ay=wR+.03, bz=[-1.52,0,1.42], sx=x+s*(tw/2+.05), top=Math.min(I.trF,I.trR)-.1;
  for(const z of bz){
    if(hv){ for(const dz of [-.3,.3]) for(const dx of [-.13,.13]) wheel(root,x+dx,ay,z+dz,wR);                          // ruedas dobles
      rbox(root,.16,.2,.95,sx,ay+.06,z,darkMat,.03); cyl(root,.07,.07,.62,sx,ay+.22,z,8,darkMat).rotation.x=Math.PI/2;    // brazo y resorte horizontal
      box(root,.1,.12,.1,sx,ay+.32,z+.32,darkMat); }                                                                    // amortiguador
    else { for(const dz of [-.33,.33]) wheel(root,x,ay,z+dz,wR);
      rbox(root,.14,.42,.5,sx,ay+.16,z,darkMat,.04);                                                                     // soporte del bogie
      for(const dz of [-.12,.12]) cyl(root,.085,.1,.3,sx+s*.03,ay+.12,z+dz,9,mat);                                     // resortes en espiral
      rbox(root,.1,.1,.62,x+s*(tw/2+.02),ay-.02,z,darkMat,.02);                                                         // brazos de las ruedas
      wheel(root,x,top-.06,z-.24,.1); box(root,.08,.09,.34,sx,top-.12,z-.12,darkMat); } }                               // rodillo de retorno arriba y atrás
  if(hv) for(const z of [-2.15,-.76,.72,2.0]) wheel(root,x,top-.06,z*.9,.1);
  // rueda motriz adelante, con dientes que engranan en la oruga
  const sp=wheel(root,x,I.trF*.62,zf-.33,.3), n=13;
  for(let i=0;i<n;i++){ const a=i/n*Math.PI*2, tth=new THREE.Mesh(_shTooth,darkMat); tth.position.set(Math.cos(a)*.31,0,Math.sin(a)*.31); tth.rotation.y=-a; sp.add(tth); }
  cyl(sp,.16,.16,.34,0,0,0,10,darkMat);                                                                                  // maza
  const id=wheel(root,x,I.trR*.62,zr+.36,.26); cyl(id,.1,.1,.32,0,0,0,8,darkMat);                                        // tensora atrás
}
const _shTooth=new THREE.BoxGeometry(.08,.3,.06);
function shermanHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){
  // trompa de tres piezas: bridas abulonadas que la recorren de abajo hacia arriba
  for(const fx of [-iw2*.16,iw2*.16]){ const f=cyl(root,.445,.445,.05,fx,.62,zf-.25,16,mat); f.rotation.z=Math.PI/2; }
  for(const fx of [-iw2*.3,iw2*.3]){ const k=new THREE.Mesh(_shShackle,darkMat); k.position.set(fx,.32,zf+.12); k.rotation.y=Math.PI/2; root.add(k); }      // ganchos de remolque
  // faros con su protector, sirena y ventilador entre las escotillas
  const gy=deck-gz*.18, gzz=zf-gz*.2;
  for(const sx of [-1,1]){ const hx=sx*(M.W/2-.42); cyl(root,.075,.075,.1,hx,gy,gzz+.05,8,darkMat).rotation.x=Math.PI/2; { const ln=new THREE.Mesh(_shLens,_shHead); ln.position.set(hx,gy,gzz+.105); root.add(ln); }
    const gd=new THREE.Mesh(_shGuard,darkMat); gd.position.set(hx,gy+.02,gzz+.05); gd.rotation.x=-.9; root.add(gd); }
  cyl(root,.07,.06,.14,iw2*.05,gy+.05,gzz+.02,8,darkMat).rotation.x=Math.PI/2;                                           // sirena
  cyl(root,.13,.15,.1,0,deck+.05,zf-gz-.42,10,mat);                                                                      // ventilador
  for(const sx of [-1,1]) for(const dz of [-.12,.12]) box(root,.12,.1,.07,sx*iw2*.22+dz,deck+.12,zf-gz-.3,darkMat);     // periscopios de las escotillas
  // chapas de blindaje extra soldadas (M4A1: dos a la derecha, una a la izquierda, sobre la munición)
  for(const [sx,z] of [[1,.05],[1,.75],[-1,.35]]) rbox(root,.04,.55,.75,sx*(M.W/2+.005-(I.slope||0)*M.W*.12),deck-.38,z,mat,.015);
  // gancho de viaje del cañón plegado sobre el glacis
  for(const sx of [-1,1]){ const a=box(root,.05,.05,.55,sx*.16,deck-gz*.55,zf-gz*.55,darkMat); a.rotation.x=-.85; }
  // popa: filtros de aire, deflector del escape, tapas de combustible, hacha y barreta
  for(const sx of [-1,1]) cyl(root,.13,.13,.42,sx*iw2*.28,deck-.42,zr-.1,10,mat);
  { const d=box(root,iw2*.8,.04,.45,0,.52,zr-.12,mat); d.rotation.x=.75; }
  for(const sx of [-1,1]) cyl(root,.06,.06,.04,sx*iw2*.36,deck+.02,zr+L*.2,8,darkMat);
  box(root,.05,.04,.9,-(M.W/2-.3),deck+.05,zr+L*.3,darkMat); box(root,.16,.03,.12,-(M.W/2-.3),deck+.05,zr+L*.3+.42,_shSteel);
  box(root,.04,.04,1.3,(M.W/2-.35),deck+.04,zr+L*.24,_shSteel);
}
const _shShackle=new THREE.TorusGeometry(.07,.02,6,10), _shGuard=new THREE.TorusGeometry(.12,.018,4,10,Math.PI);
const _shLens=new THREE.CircleGeometry(.06,10), _shHead=new THREE.MeshLambertMaterial({color:0xd8d4c0}), _shSteel=new THREE.MeshLambertMaterial({color:0x6a6a66});
function shermanTurret(tur,G,M,I,mat,gy){
  // mantelete M34A1: plancha ancha con el rotor detrás, abertura de la mira a la izquierda y de la coaxial a la derecha
  if(I.tur==='t23'){ rbox(G.gp,.74,.5,.2,0,.02,.12,mat,.12); rbox(G.gp,.5,.36,.16,0,0,-.04,mat,.05);                 // M62: más angosto y grueso
    box(G.gp,.06,.09,.05,-.26,.09,.23,darkMat); box(G.gp,.05,.05,.05,.2,-.06,.23,darkMat); }
  else { rbox(G.gp,.98,.52,.13,0,.02,.1,mat,.05); rbox(G.gp,.7,.4,.2,0,0,-.04,mat,.04);
    box(G.gp,.07,.1,.05,-.3,.08,.17,darkMat); box(G.gp,.06,.06,.05,.24,-.05,.17,darkMat); }
  // techo: escotilla partida del comandante con su aro, la del cargador, periscopios y ventilador
  const ty=M.th*.98, cx=-M.tw*.2, cz=-M.tl*.16;
  if(!I.cup){ cyl(tur,.36,.38,.06,cx,ty,cz,14,mat); for(const sx of [-1,1]){ const h=new THREE.Mesh(_shHalf,mat); h.position.set(cx+sx*.005,ty+.05,cz); h.rotation.y=sx>0?0:Math.PI; tur.add(h); } }
  if(I.tur==='t23'){ const o=cyl(tur,.24,.24,.05,M.tw*.2,ty+.01,-M.tl*.08,14,mat); o.scale.z=1.4;                       // escotilla oval del cargador
    if(I.cup) for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; const v=box(tur,.08,.07,.05,(I.cupX??-M.tw*.2)+Math.sin(a)*.3,M.th+.27,-M.tl*.22+Math.cos(a)*.3,_shGlass); v.rotation.y=a; } } // bloques de visión de la cúpula
  else rbox(tur,.34,.05,.5,M.tw*.2,ty+.01,-M.tl*.12,mat,.03);                                                           // escotilla del cargador
  for(const [px,pz] of [[cx+.3,cz+.35],[M.tw*.2,-M.tl*.12+.36],[-M.tw*.05,M.tl*.18]]) box(tur,.13,.11,.08,px,ty+.07,pz,darkMat); // periscopios
  cyl(tur,.1,.12,.08,M.tw*.05,ty+.02,-M.tl*.35,8,mat);                                                                   // ventilador
  // puerta de pistola a la izquierda y chapa extra en la mejilla derecha
  { const p=cyl(tur,.11,.11,.04,-M.tw*.47,M.th*.45,-M.tl*.05,10,mat); p.rotation.z=Math.PI/2; }
  { const c=rbox(tur,.05,.5,.6,M.tw*.46,M.th*.42,M.tl*.2,mat,.02); c.rotation.y=-.25; }
  // .50 en el aro: cajón, tubo y caja de munición
  { const ax=M.tw*.22, az=I.tur==='t23'?-M.tl*.42:-M.tl*.2;                                                          // en la T23 la .50 va atrás
    cyl(tur,.03,.03,.38,ax,ty+.18,az,6,darkMat); box(tur,.1,.12,.32,ax,ty+.42,az+.05,darkMat);
    const b=cyl(tur,.03,.03,.95,ax,ty+.44,az+.65,6,darkMat); b.rotation.x=Math.PI/2; box(tur,.12,.14,.24,ax+.14,ty+.38,az,_shGreenBox);
    if(shTurMG.t) shTurMG.t.aaMuz=mgMuzzle(tur,ax,ty+.44,az+1.14); }
}
const _shHalf=new THREE.CylinderGeometry(.3,.3,.05,12,1,false,0,Math.PI), _shGreenBox=new THREE.MeshLambertMaterial({color:0x4a5236});

const shCast=I=>I.nose==='sher'&&(I.tur==='cast'||I.tur==='t23');
const _shGlass=new THREE.MeshLambertMaterial({color:0x2a3a44});
// Casco superior fundido de una pieza (M4A1): secciones transversales con los cantos de arriba redondeados, de la popa a la trompa,
// la altura sigue el perfil (techo plano, glacis y popa inclinados) y los costados se cierran un poco hacia arriba (slope).
function castHullGeo(zf,zr,deck,yb,W,gz,rz,slope){
  const z0=zr+.1, z1=zf-gz*.05, NZ=26, NA=7, hw=W/2, pos=[], uv=[], idx=[];
  const topAt=z=>z>zf-gz?deck+(yb+.1-deck)*clamp((z-(zf-gz))/(gz*.95),0,1):z<zr+rz?yb+(deck-yb)*clamp((z-z0)/(zr+rz-z0),0,1):deck;
  const sec=z=>{ const tp=topAt(z), hh=Math.max(.06,tp-yb), r=Math.min(.34,hh*.62), P=[];
    const xs=y=>hw*(1-slope*clamp((y-yb)/Math.max(.01,deck-yb),0,1));
    P.push([-xs(yb),yb]); P.push([-xs(tp-r),tp-r]);
    for(let i=1;i<NA;i++){ const a=Math.PI-i/NA*Math.PI/2, cx=-xs(tp)+r; P.push([cx+Math.cos(a)*r,tp-r+Math.sin(a)*r]); }
    for(let i=0;i<NA;i++){ const a=Math.PI/2-i/NA*Math.PI/2, cx=xs(tp)-r; P.push([cx+Math.cos(a)*r,tp-r+Math.sin(a)*r]); }
    P.push([xs(tp-r),tp-r]); P.push([xs(yb),yb]); return P; };
  let NP=0;
  for(let k=0;k<=NZ;k++){ const z=z0+(z1-z0)*k/NZ, P=sec(z); NP=P.length; let s=0;
    P.forEach((p,i)=>{ if(i) s+=Math.hypot(p[0]-P[i-1][0],p[1]-P[i-1][1]); pos.push(p[0],p[1],z); uv.push(z*.28,s*.28); }); }
  for(let k=0;k<NZ;k++) for(let i=0;i<NP-1;i++){ const a=k*NP+i, b=a+NP; idx.push(a,b,a+1, a+1,b,b+1); }
  for(const [k,flip] of [[0,1],[NZ,0]]){ const c=pos.length/3, z=z0+(z1-z0)*k/NZ; pos.push(0,yb,z); uv.push(0,0);           // tapas de los extremos
    for(let i=0;i<NP-1;i++){ const a=k*NP+i; flip?idx.push(c,a+1,a):idx.push(c,a,a+1); } }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx); g.computeVertexNormals(); return g; }

/* ---------- Tiger I más fiel (pedido de Sebastián) ----------
   Schachtellaufwerk: 8 ejes por lado con ruedas de 800 mm intercaladas en capas (los impares afuera y adentro, los pares en el medio),
   ruedas pintadas con banda de goma; rueda motriz adelante, tensora atrás. Frente del casco casi vertical (100 mm), visera del conductor,
   ganchos de remolque grandes, cables a los costados, escapes verticales con protector y filtros Feifel atrás.
   Torre en herradura con el cajón trasero, mantelete con los dos agujeros de la mira binocular TZF 9b y lanzagranadas de humo. */
function tigerWheel(root,x,y,z,r,mat){ const w=wheel(root,x,y,z,r); if(w.children[0]) w.children[0].visible=false; cyl(w,r*.8,r*.8,.3,0,0,0,14,mat); cyl(w,r*.24,r*.24,.33,0,0,0,8,darkMat); return w; }
function tigerGear(root,I,x,s,tw,zf,zr,mat){
  const r=.4, ay=r+.03, n=8, z0=zr+1.15, z1=zf-1.15, o=tw*.31;
  for(let i=0;i<n;i++){ const z=z0+(z1-z0)*i/(n-1); for(const d of (i%2?[0]:[o,-o])) tigerWheel(root,x+s*d,ay,z,r,mat); }
  const sp=wheel(root,x,I.trF*.6,zf-.42,.42), nt=18;
  for(let i=0;i<nt;i++){ const a=i/nt*Math.PI*2, t=new THREE.Mesh(_tgTooth,darkMat); t.position.set(Math.cos(a)*.43,0,Math.sin(a)*.43); t.rotation.y=-a; sp.add(t); }
  cyl(sp,.26,.26,.4,0,0,0,10,mat); cyl(sp,.1,.1,.46,0,0,0,8,darkMat);
  const id=wheel(root,x,I.trR*.62,zr+.45,.32); cyl(id,.25,.25,.32,0,0,0,10,mat);
}
const _tgTooth=new THREE.BoxGeometry(.1,.62,.07);
function tigerHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){
  const hw=M.W/2, tx=hw-I.trW/2;
  rbox(root,.44,.2,.12,-hw*.42,deck-.33,zf-gz*.15+.05,mat,.03); box(root,.3,.025,.03,-hw*.42,deck-.31,zf-gz*.15+.12,darkMat);   // visera del conductor
  cyl(root,.075,.075,.13,-hw*.66,deck+.07,zf-gz-.06,8,darkMat).rotation.x=Math.PI/2;                                              // faro Bosch
  for(const sx of [-1,1]){ const k=new THREE.Mesh(_tgShackle,darkMat); k.position.set(sx*(iw2/2-.08),.6,zf+.02); k.rotation.y=Math.PI/2; root.add(k); } // ganchos de remolque
  for(const sx of [-1,1]){ const f=box(root,I.trW+.06,.03,.6,sx*tx,I.trF+.1,zf-.12,mat); f.rotation.x=-.32; }                     // guardabarros delanteros
  for(const sx of [-1,1]){ const c=cyl(root,.035,.035,3.3,sx*(hw+.03),deck-.24,-.1,6,darkMat); c.rotation.x=Math.PI/2;             // cables de remolque
    for(const ez of [-1.75,1.55]){ const e=new THREE.Mesh(_tgEye,darkMat); e.position.set(sx*(hw+.03),deck-.24,ez); e.rotation.y=Math.PI/2; root.add(e); } }
  for(const sx of [-1,1]){ cyl(root,.07,.08,.95,sx*.42,deck-.02,zr-.09,8,darkMat); rbox(root,.28,.55,.16,sx*.42,deck+.04,zr-.15,mat,.04);  // escapes con protector
    const fe=cyl(root,.19,.19,.58,sx*(hw-.72),deck-.48,zr-.22,12,mat); fe.rotation.z=Math.PI/2;                                   // filtros Feifel
    cyl(root,.05,.05,.55,sx*(hw-.72),deck-.17,zr-.14,6,darkMat);
    box(root,.72,.03,1.15,sx*iw2*.32,deck+.03,zr+L*.18,darkMat); }                                                              // rejillas de los radiadores
  box(root,.2,.32,.18,0,deck-.7,zr-.12,darkMat);                                                                                   // gato
}
const _tgShackle=new THREE.TorusGeometry(.11,.035,6,12), _tgEye=new THREE.TorusGeometry(.06,.02,5,8);
function tigerTurret(tur,G,M,I,mat,gy){
  rbox(G.gp,1.38,.74,.22,0,.02,.13,mat,.09); rbox(G.gp,.9,.5,.2,0,0,-.05,mat,.05);                                                // mantelete
  for(const dx of [-.3,-.42]) cyl(G.gp,.035,.035,.08,dx,.12,.24,8,darkMat).rotation.x=Math.PI/2;                                 // mira binocular TZF 9b
  cyl(G.gp,.045,.045,.08,.32,.02,.24,8,darkMat).rotation.x=Math.PI/2;                                                              // ametralladora coaxial
  rbox(tur,M.tw*.74,.4,.42,0,M.th*.5,-M.tl/2-.2,mat,.05);                                                                          // cajón trasero (Gepäckkasten)
  for(const sx of [-1,1]) for(let k=0;k<3;k++){ const c=cyl(tur,.055,.055,.32,sx*(M.tw/2+.05),M.th*.5+k*.13,M.tl/2-.3,8,darkMat); c.rotation.z=-sx*.7; c.rotation.x=.4; } // lanzahumos NbK 39
  rbox(tur,.5,.06,.5,M.tw*.22,M.th+.03,-M.tl*.05,mat,.03);                                                                         // escotilla del cargador
  for(const [px,pz] of [[M.tw*.22,M.tl*.2],[-M.tw*.05,M.tl*.25]]) box(tur,.12,.1,.08,px,M.th+.06,pz,darkMat);                      // periscopio y ventilador
  { const p=cyl(tur,.1,.1,.04,M.tw*.49,M.th*.5,-M.tl*.22,10,mat); p.rotation.z=Math.PI/2; }                                         // puerta de pistola
}

/* ---- Panther, T-34 y IS-2 más fieles (pedido de Sebastián: "al nivel del Tiger") ----
   Mismo esquema que el Tiger: por tanque, tren de rodaje (gear), detalles del casco (hull) y de la torre (tur), elegidos con m.w2.det. */
// Rueda de rodaje: goma oscura, disco del color del casco, cubo y (opcional) agujeros de alivianamiento; sc achica el ancho (ruedas dobles)
function dWheel(root,x,y,z,r,mat,o={}){ const w=wheel(root,x,y,z,r); if(w.children[0]) w.children[0].visible=false; if(o.sc) w.scale.y=o.sc;
  cyl(w,r*(o.rim||.8),r*(o.rim||.8),.3,0,0,0,16,mat); cyl(w,r*.24,r*.24,.33,0,0,0,8,darkMat);
  if(o.holes) for(let i=0;i<o.holes;i++){ const a=i/o.holes*Math.PI*2; cyl(w,r*.1,r*.1,.32,Math.cos(a)*r*.52,0,Math.sin(a)*r*.52,6,darkMat); }
  return w; }
function sprocketT(root,x,y,z,r,n,mat){ const sp=wheel(root,x,y,z,r);                                       // rueda motriz con dientes
  for(let i=0;i<n;i++){ const a=i/n*Math.PI*2, t=new THREE.Mesh(_tgTooth,darkMat); t.position.set(Math.cos(a)*r,0,Math.sin(a)*r); t.rotation.y=-a; t.scale.set(.8,.6,.8); sp.add(t); }
  cyl(sp,r*.62,r*.62,.38,0,0,0,10,mat); cyl(sp,r*.24,r*.24,.44,0,0,0,8,darkMat); return sp; }
// Baranda (pasamanos) a lo largo de z con sus soportes
function rail(p,x,y,z0,z1,n=3){ box(p,.03,.03,Math.abs(z1-z0),x,y,(z0+z1)/2,darkMat); for(let i=0;i<n;i++) box(p,.03,.09,.03,x,y-.05,z0+(z1-z0)*i/Math.max(1,n-1),darkMat); }
// Punto sobre el glacis: u=0 arriba (borde con el techo), u=1 abajo; h = cuánto sobresale
function glacisPt(I,deck,gz,zf,u,h=0){ const low=(I.lowF??.35)+.3, H=deck-low, a=Math.atan2(H,gz), n=Math.hypot(H,gz);
  return {y:deck-H*u+h*gz/n, z:zf-gz+gz*u+h*H/n, a}; }
const _strapGeo=new THREE.TorusGeometry(.2,.018,4,14);

// ---- Panther Ausf. A ----
function pantherGear(root,I,x,s,tw,zf,zr,mat){
  const r=.43, ay=r+.03, n=8, z0=zr+1.15, z1=zf-1.2, o=tw*.3;
  for(let i=0;i<n;i++){ const z=z0+(z1-z0)*i/(n-1); for(const d of (i%2?[0]:[o,-o])) dWheel(root,x+s*d,ay,z,r,mat,{rim:.82}); }   // ruedas de 860 mm intercaladas
  sprocketT(root,x,I.trF*.62,zf-.42,.4,17,mat);
  const id=wheel(root,x,I.trR*.6,zr+.45,.33); cyl(id,.26,.26,.32,0,0,0,10,mat);
  wheel(root,x,I.trF-.08,zf-1.02,.09); }                                                                   // rodillo de retorno chico detrás de la motriz
function pantherHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){
  const hw=M.W/2, tx=hw-I.trW/2;
  cyl(root,.075,.075,.13,-hw*.5,deck+.07,zf-gz-.04,8,darkMat).rotation.x=Math.PI/2;                         // faro Bosch
  for(const sx of [-1,1]){ box(root,.14,.08,.12,sx*iw2*.28,deck+.05,zf-gz-.22,darkMat); rbox(root,.5,.06,.6,sx*iw2*.28,deck+.03,zf-gz-.62,mat,.03); } // periscopios y escotillas de conductor y radio
  for(const sx of [-1,1]){ const k=new THREE.Mesh(_tgShackle,darkMat); k.position.set(sx*(iw2/2-.1),.62,zf+.02); k.rotation.y=Math.PI/2; root.add(k); } // ganchos
  for(const sx of [-1,1]){ const f=box(root,I.trW+.06,.03,.55,sx*tx,I.trF+.1,zf-.14,mat); f.rotation.x=-.32; }      // guardabarros delanteros
  const seg=(L-1.7)/4;                                                                                          // faldones (Schürzen) colgados del borde del casco
  for(const sx of [-1,1]) for(let k=0;k<4;k++) box(root,.03,.46,seg-.06,sx*(hw+.03),1.08,zr+.75+seg*(k+.5),mat);
  for(const sx of [-1,1]){ const c=cyl(root,.035,.035,L-1.6,sx*(hw+.06),deck-.2,-.15,6,darkMat); c.rotation.x=Math.PI/2; }  // cables de remolque
  rbox(root,.62,.06,.95,0,deck+.03,zr+1.05,mat,.03);                                                            // escotilla del motor
  for(const sx of [-1,1]){ cyl(root,.29,.29,.05,sx*.62,deck+.04,zr+1.05,16,darkMat); cyl(root,.2,.2,.06,sx*.62,deck+.05,zr+1.05,12,mat);   // tapas de los ventiladores
    box(root,.42,.03,.85,sx*(hw-.62),deck+.03,zr+.95,darkMat);                                                  // rejillas de los radiadores
    cyl(root,.085,.095,.95,sx*.42,deck+.15,zr-.06,10,darkMat); cyl(root,.11,.11,.08,sx*.42,deck+.63,zr-.06,10,darkMat);   // escapes verticales
    rbox(root,.58,.44,.34,sx*(hw-.66),deck-.62,zr-.2,mat,.05); }                                                // cajones traseros
  box(root,.2,.32,.18,0,deck-.95,zr-.12,darkMat); }                                                            // gato
function pantherTurret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
  const m=cyl(G.gp,.37,.37,1.22,0,0,.04,18,mat); m.rotation.z=Math.PI/2;                                        // mantelete redondo (Topfblende)
  const sl=cyl(G.gp,.13,.16,.42,0,0,.52,12,mat); sl.rotation.x=Math.PI/2;                                        // funda del cañón
  for(const dx of [-.22,-.32]) cyl(G.gp,.03,.03,.1,dx,.1,.4,8,darkMat).rotation.x=Math.PI/2;                    // mira binocular
  cyl(G.gp,.04,.04,.1,.3,.02,.4,8,darkMat).rotation.x=Math.PI/2;                                                 // coaxial
  { const h=cyl(tur,.27,.27,.05,0,th*.5,-hl-.02,14,mat); h.rotation.x=Math.PI/2; }                               // escotilla de escape atrás
  for(const sx of [-1,1]){ for(let k=0;k<3;k++){ const b=box(tur,.04,.17,.3,sx*(hw*.9+.04),th*.4,-hl*.35+k*.3-.3,trackMat); b.rotation.z=sx*.25; }   // eslabones de repuesto
    const pp=cyl(tur,.07,.07,.04,sx*(hw*.86+.02),th*.62,hl*.05,8,mat); pp.rotation.z=Math.PI/2; }                 // puertas de pistola
  box(tur,.14,.08,.12,hw*.4,th+.04,hl*.25,darkMat); cyl(tur,.08,.08,.1,hw*.4,th+.05,-hl*.45,8,darkMat); }        // periscopio del cargador y arma de defensa cercana

// ---- T-34 (76 y 85) ----
function t34Gear(root,I,x,s,tw,zf,zr,mat){
  const r=I.wR, n=I.nW, ay=r+.03, z0=zr+1.0, z1=zf-1.0;
  for(let i=0;i<n;i++) dWheel(root,x,ay,z0+(z1-z0)*i/(n-1),r,mat,{holes:8,rim:.78});                          // ruedas Christie de 830 mm con goma
  const sp=wheel(root,x,I.trR*.6,zr+.38,.36); cyl(sp,.3,.3,.3,0,0,0,10,mat);                                    // motriz atrás, de rodillos
  for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; cyl(sp,.05,.05,.36,Math.cos(a)*.27,0,Math.sin(a)*.27,6,darkMat); }
  const id=wheel(root,x,I.trF*.6,zf-.4,.34); cyl(id,.27,.27,.3,0,0,0,10,mat); }
function t34Hull(root,M,I,mat,iw2,deck,gz,zf,zr,L){
  const hw=M.W/2, rz=I.rearS??.25;
  { const p=glacisPt(I,deck,gz,zf,.4,.04), d=rbox(root,.62,.08,.52,-iw2*.2,p.y,p.z,mat,.03); d.rotation.x=p.a;   // escotilla del conductor con sus periscopios
    for(const sx of [-1,1]) box(d,.13,.07,.1,sx*.15,.07,-.14,darkMat); }
  { const p=glacisPt(I,deck,gz,zf,.12,.08); cyl(root,.08,.08,.14,-iw2*.4,p.y,p.z,8,darkMat).rotation.x=Math.PI/2; }   // faro
  for(const sx of [-1,1]){ const p=glacisPt(I,deck,gz,zf,.96,.05), k=new THREE.Mesh(_tgShackle,darkMat); k.position.set(sx*iw2*.36,p.y,p.z); k.rotation.y=Math.PI/2; root.add(k); } // ganchos de remolque
  for(const sx of [-1,1]){ rail(root,sx*(hw-.08),deck-.08,zr+.9,zf-gz-.3,4);                                      // barandas para la infantería
    for(const z of [zr+.7,zr+1.55]){ const c=cyl(root,.19,.19,.72,sx*(hw-.04),deck-.3,z,12,mat); c.rotation.x=Math.PI/2;   // tanques de combustible con sus cinchas
      for(const dz of [-.22,.22]){ const st=new THREE.Mesh(_strapGeo,darkMat); st.position.set(sx*(hw-.04),deck-.3,z+dz); root.add(st); } } }
  rbox(root,.42,.26,.7,-(hw-I.trW/2),I.trF+.18,zf-1.4,mat,.04);                                                  // cajón de herramientas
  box(root,.95,.03,.85,0,deck+.02,zr+rz+.55,darkMat); for(let k=0;k<5;k++) box(root,.95,.04,.04,0,deck+.04,zr+rz+.2+k*.17,mat);   // rejilla del motor con persianas
  rbox(root,.75,.06,.55,0,deck+.03,zr+rz+1.4,mat,.03);                                                           // escotilla del motor
  { const c=cyl(root,.33,.33,.05,0,deck-rz*.45,zr+rz*.48,16,mat); c.rotation.x=Math.atan2(-.9,1); }               // tapa redonda de la transmisión
  for(const sx of [-1,1]){ const e=cyl(root,.075,.075,.32,sx*.62,deck-rz*.9-.12,zr-.08,8,darkMat); e.rotation.x=Math.PI/2-.55; } }   // escapes
function t34Turret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
  for(const sx of [-1,1]){ rail(tur,sx*(hw*.92+.04),th*.55,-hl*.6,hl*.05,3); const pp=cyl(tur,.06,.06,.04,sx*(hw*.9+.02),th*.4,-hl*.35,8,mat); pp.rotation.z=Math.PI/2; } // barandas y puertas de pistola
  if(I.tur==='hex'){                                                                                             // T-34/76: mantelete fundido del F-34
    rbox(G.gp,.66,.44,.26,0,0,.1,mat,.07); const sl=cyl(G.gp,.12,.14,.55,0,0,.48,12,mat); sl.rotation.x=Math.PI/2;
    for(const sx of [-1,1]){ cyl(tur,.27,.27,.06,sx*hw*.42,th+.02,-hl*.2,14,mat); box(tur,.12,.07,.1,sx*hw*.42,th+.07,hl*.15,darkMat); }   // escotillas "Mickey Mouse" y periscopios
    cyl(tur,.12,.14,.1,0,th+.05,-hl*.62,10,mat); }                                                                // ventilador
  else {                                                                                                         // T-34-85: torre fundida grande
    const m=cyl(G.gp,.3,.3,.98,0,0,.02,16,mat); m.rotation.z=Math.PI/2;
    const sl=cyl(G.gp,.14,.17,.6,0,0,.5,12,mat); sl.rotation.x=Math.PI/2; cyl(G.gp,.03,.03,.1,-.3,.1,.3,8,darkMat).rotation.x=Math.PI/2;
    cyl(tur,.26,.26,.06,hw*.38,th+.01,-hl*.25,14,mat); box(tur,.12,.07,.1,hw*.38,th+.06,hl*.1,darkMat); box(tur,.12,.07,.1,-hw*.15,th+.06,hl*.32,darkMat);
    for(const sx of [-1,1]){ cyl(tur,.13,.15,.12,sx*hw*.22,th-.02,-hl*.7,10,mat); cyl(tur,.1,.13,.05,sx*hw*.22,th+.06,-hl*.7,10,mat); } } }   // ventiladores atrás

// ---- IS-2 mod. 1944 ----
function is2Gear(root,I,x,s,tw,zf,zr,mat){
  const r=I.wR, n=I.nW, ay=r+.03, z0=zr+1.05, z1=zf-1.1;
  for(let i=0;i<n;i++){ const z=z0+(z1-z0)*i/(n-1); for(const d of [-.13,.13]) dWheel(root,x+d,ay,z,r,mat,{sc:.42,rim:.78}); }   // ruedas dobles de 550 mm
  for(let k=0;k<3;k++) wheel(root,x,I.trF-.08,z0+(z1-z0)*(k+.5)/3,.1);                                        // rodillos de retorno
  sprocketT(root,x,I.trR*.6,zr+.42,.38,14,mat);
  const id=wheel(root,x,I.trF*.6,zf-.42,.34); cyl(id,.27,.27,.3,0,0,0,10,mat); }
function is2Hull(root,M,I,mat,iw2,deck,gz,zf,zr,L){
  const hw=M.W/2, ft=hw-I.trW/2, fy=Math.max(I.trF,I.trR)+.06;
  { const p=glacisPt(I,deck,gz,zf,.15,.06); box(root,.14,.08,.12,-iw2*.2,p.y,p.z,darkMat); }                      // periscopio del conductor (glacis recto de 1944)
  for(const sx of [-1,1]){ const p=glacisPt(I,deck,gz,zf,.1,.08); cyl(root,.075,.075,.13,sx*iw2*.42,p.y,p.z,8,darkMat).rotation.x=Math.PI/2;   // faros
    const q=glacisPt(I,deck,gz,zf,.95,.05), k=new THREE.Mesh(_tgShackle,darkMat); k.position.set(sx*iw2*.34,q.y,q.z); k.rotation.y=Math.PI/2; root.add(k); }
  for(let k=0;k<3;k++){ const p=glacisPt(I,deck,gz,zf,.62+k*.12,.04), b=box(root,iw2*.55,.05,.14,0,p.y,p.z,trackMat); b.rotation.x=p.a; }   // eslabones de repuesto
  for(const sx of [-1,1]){
    rbox(root,I.trW*.8,.32,.75,sx*ft,fy+.16,zf-1.5,mat,.04); rbox(root,I.trW*.8,.28,.6,sx*ft,fy+.14,-.3,mat,.04);   // cajones sobre los guardabarros
    const c=cyl(root,.19,.19,.85,sx*ft,fy+.2,zr+.75,12,mat); c.rotation.x=Math.PI/2;                                 // tanques de combustible externos
    for(const dz of [-.25,.25]){ const st=new THREE.Mesh(_strapGeo,darkMat); st.position.set(sx*ft,fy+.2,zr+.75+dz); root.add(st); }
    const cb=cyl(root,.035,.035,L-2.2,sx*(iw2/2+.02),deck-.12,.1,6,darkMat); cb.rotation.x=Math.PI/2;              // cable de remolque
    const e=cyl(root,.08,.08,.36,sx*iw2*.36,deck-.12,zr-.02,8,darkMat); e.rotation.x=Math.PI/2-.4;                  // escapes
    box(root,.5,.03,.8,sx*iw2*.28,deck+.02,zr+1.0,darkMat); }                                                       // rejillas
  rbox(root,.6,.06,.7,0,deck+.03,zr+1.05,mat,.03); }                                                               // escotilla del motor
function is2Turret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
  rbox(G.gp,1.05,.66,.34,0,0,.1,mat,.1); const sl=cyl(G.gp,.17,.21,.72,0,0,.58,12,mat); sl.rotation.x=Math.PI/2; // mantelete ancho y funda del D-25T
  cyl(G.gp,.035,.035,.1,-.32,.12,.28,8,darkMat).rotation.x=Math.PI/2; cyl(G.gp,.04,.04,.1,.32,.0,.28,8,darkMat).rotation.x=Math.PI/2;   // mira y coaxial
  const ax=hw*.38, az=-hl*.25; cyl(tur,.33,.33,.06,ax,th+.01,az,16,darkMat); cyl(tur,.04,.04,.36,ax,th+.2,az,6,darkMat);   // aro y pivote de la DShK
  box(tur,.13,.15,.55,ax,th+.42,az+.08,darkMat); const db=cyl(tur,.03,.03,.95,ax,th+.44,az+.8,6,darkMat); db.rotation.x=Math.PI/2;
  cyl(tur,.05,.05,.1,ax,th+.44,az+1.25,8,darkMat).rotation.x=Math.PI/2; rbox(tur,.16,.2,.25,ax+.16,th+.36,az,_shGreenBox,.03);
  if(shTurMG.t) shTurMG.t.aaMuz=mgMuzzle(tur,ax,th+.44,az+1.3);                                                               // la DShK también tira
  { const b=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),mat); b.position.set(0,th*.45,-hl+.02); tur.add(b); cyl(tur,.025,.025,.3,0,th*.45,-hl-.12,6,darkMat).rotation.x=Math.PI/2; } // ametralladora trasera
  for(const sx of [-1,1]){ rail(tur,sx*(hw*.93+.04),th*.55,-hl*.55,hl*.1,3); const pp=cyl(tur,.06,.06,.04,sx*(hw*.92+.02),th*.38,-hl*.3,8,mat); pp.rotation.z=Math.PI/2; }
  box(tur,.12,.07,.1,-hw*.1,th+.06,hl*.3,darkMat); }
const DET={panther:{gear:pantherGear,hull:pantherHull,tur:pantherTurret},t34:{gear:t34Gear,hull:t34Hull,tur:t34Turret},is2:{gear:is2Gear,hull:is2Hull,tur:is2Turret}};

// ---- Detalles generales para los tanques que todavía no tienen su versión fiel (como el Tiger, el Sherman, el Panther, el T-34 y el IS-2) ----
// Ganchos de remolque, faros, cable a un costado, gato o cajón de herramientas, eslabones de repuesto, periscopios del conductor;
// en la torre: periscopios, puertas de pistola y argollas para izarla. Pocos triángulos.
function genHull(t,root,M,I,mat,iw2,deck,gz,zf,zr,L){ const hw=M.W/2, k=t.key||'', hsh=[...k].reduce((a,c)=>a+c.charCodeAt(0),0);
  for(const sx of [-1,1]){ const p=glacisPt(I,deck,gz,zf,.96,.06), sh=new THREE.Mesh(_tgShackle,darkMat); sh.scale.setScalar(.75); sh.position.set(sx*iw2*.36,p.y,p.z); sh.rotation.y=Math.PI/2; root.add(sh); }   // ganchos
  { const p=glacisPt(I,deck,gz,zf,.06,.07); for(const sx of (hsh%3?[-1,1]:[-1])){ const h=cyl(root,.07,.07,.12,sx*iw2*.4,p.y,p.z,8,darkMat); h.rotation.x=Math.PI/2; } }   // faros
  { const p=glacisPt(I,deck,gz,zf,.08,.05); for(const sx of [-1,1]) box(root,.13,.07,.1,sx*iw2*.22,p.y+.03,p.z-.12,darkMat); }   // periscopios de conductor y radio
  { const c=cyl(root,.03,.03,L*.62,hw-.04,deck-.18,-L*.05,6,darkMat); c.rotation.x=Math.PI/2; }                                    // cable de remolque
  rbox(root,.3,.24,.75,-(hw-I.trW/2),Math.max(I.trF,I.trR)+.2,zr+L*.32,mat,.04);                                                   // cajón de herramientas sobre el guardabarros
  if(hsh%2&&!I.spare) for(let i=0;i<3;i++){ const p=glacisPt(I,deck,gz,zf,.6+i*.13,.04), b=box(root,iw2*.5,.05,.15,0,p.y,p.z,trackMat); b.rotation.x=p.a; }   // eslabones de repuesto
}
function genTurret(tur,M,I,mat){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
  for(const sx of [-1,1]){ const pp=cyl(tur,.06,.06,.04,sx*(hw*.94+.01),th*.45,-hl*.25,8,mat); pp.rotation.z=Math.PI/2;                // puertas de pistola
    const r=new THREE.Mesh(_tgEye,darkMat); r.position.set(sx*hw*.5,th+.03,hl*.35); r.rotation.y=Math.PI/2; tur.add(r); }              // argollas para izar
  box(tur,.12,.07,.1,hw*.32,th+.05,hl*.3,darkMat); box(tur,.12,.07,.1,-hw*.15,th+.05,hl*.42,darkMat); }                              // periscopios

// ---- Nahuel DL-43 (pedido de Sebastián; datos de Tank Encyclopedia: "Tanque Mediano Nahuel", con sus fotos) ----
// 6,23 × 2,63 × 2,95 m, 35 t. Casco soldado de formas rectas como el del Sherman temprano, glacis plano de 80 mm a 55°, placa de abajo del frente
// remachada (como la popa); suspensión VVSS de 3 bogies con 2 ruedas, motriz de 12 dientes adelante, 5 rodillos de retorno (3 sobre los bogies)
// y tensora atrás. Dos escotillas grandes del conductor y su ayudante que se abren para arriba (con un periscopio cada una), dos faros sin
// protector, otro sobre la torre; rejilla del radiador al costado y pico, hacha y pala atrás. Torre fundida redondeada, frente de 80 mm a 30°,
// escotilla partida del comandante sin periscopios; el Krupp 1909 L/30 con los cilindros de retroceso arriba y abajo tapados por el mantelete.
function nahuelGear(root,I,x,s,tw,zf,zr,mat){ shermanGear(root,I,x,s,tw,zf,zr,mat);
  for(const z of [zr+1.1,zf-1.35]) dWheel(root,x,I.trF-.06,z,.09,mat,{rim:.7}); }                                    // los dos rodillos de retorno sueltos
function nahuelHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){
  const hw=M.W/2, ft=hw-I.trW/2, low=(I.lowF??.35)+.3;
  { const p=glacisPt(I,deck,gz,zf,.995,0); for(let i=0;i<12;i++){ const r=cyl(root,.03,.03,.04,-iw2*.45+i*iw2*.082,low-.12,zf+.01,6,darkMat); r.rotation.x=Math.PI/2; }   // remaches de la placa de abajo
    box(root,iw2*.96,.04,.05,0,low-.02,zf+.005,darkMat); }
  for(const sx of [-1,1]){                                                                                              // escotillas del conductor y del ayudante, con periscopio
    const p=glacisPt(I,deck,gz,zf,.13,.05), h=rbox(root,.62,.1,.55,sx*iw2*.25,p.y,p.z,mat,.03); h.rotation.x=p.a;
    box(h,.13,.07,.1,0,.08,.08,darkMat); for(const dx of [-.22,.22]) cyl(h,.03,.03,.1,dx,.04,-.27,6,darkMat).rotation.z=Math.PI/2;   // periscopio y bisagras
    const q=glacisPt(I,deck,gz,zf,.04,.12); cyl(root,.13,.13,.12,sx*(hw-.18),q.y,q.z,12,darkMat).rotation.x=Math.PI/2;                  // faros grandes sin protector
    const ln=new THREE.Mesh(_shLens,_shHead); ln.position.set(sx*(hw-.18),q.y,q.z+.065); root.add(ln); }
  { const p=glacisPt(I,deck,gz,zf,.55,.05); for(const dx of [.12,.24]){ const m=cyl(root,.03,.03,.22,iw2*.3+dx,p.y,p.z,6,darkMat); m.rotation.x=Math.PI/2-.3; } }  // ametralladoras fijas del ayudante
  for(const sx of [-1,1]){ const q=glacisPt(I,deck,gz,zf,.98,.04), k=new THREE.Mesh(_tgShackle,darkMat); k.scale.setScalar(.75); k.position.set(sx*iw2*.38,q.y-.08,q.z+.04); k.rotation.y=Math.PI/2; root.add(k);
    const r=new THREE.Mesh(_tgShackle,darkMat); r.scale.setScalar(.75); r.position.set(sx*iw2*.38,.62,zr-.03); r.rotation.y=Math.PI/2; root.add(r); }   // 4 ganchos de remolque
  for(const sx of [-1,1]){ const gx=sx*(hw+.005);                                                                        // rejilla del radiador al costado (bajo la torre)
    box(root,.03,.42,1.25,gx,deck-.32,-.15,darkMat); for(let i=0;i<6;i++) box(root,.05,.04,1.2,gx,deck-.5+i*.07,-.15,mat); }
  { const sx=-1, X=sx*(hw+.03), y=deck-.3;                                                                                // pico, hacha y pala atrás a la izquierda
    box(root,.05,.05,1.05,X,y+.12,zr+1.2,_wdMat); box(root,.04,.38,.06,X,y+.12,zr+.7,darkMat);                            // pico
    box(root,.05,.05,.85,X,y-.08,zr+1.0,_wdMat); box(root,.04,.16,.12,X,y-.08,zr+.6,darkMat);                             // hacha
    box(root,.05,.05,.95,X,y+.02,zr+1.85,_wdMat); box(root,.04,.22,.2,X,y+.02,zr+2.4,darkMat); }                          // pala
  for(const sx of [-1,1]) rivetsRow(root,sx*(hw+.005),deck-.15,zr+.1,zr+1.0,6);                                           // popa remachada
  for(let i=0;i<10;i++){ const r=cyl(root,.025,.025,.03,-iw2*.42+i*iw2*.093,deck-.3,zr-.005,5,darkMat); r.rotation.x=Math.PI/2; }
  box(root,iw2*.65,.03,.85,0,deck+.02,zr+.75,darkMat); for(let i=0;i<5;i++) box(root,iw2*.65,.04,.04,0,deck+.04,zr+.42+i*.16,mat);   // rejilla del motor
  rbox(root,.7,.06,.6,0,deck+.03,zr+1.55,mat,.03);
  for(const sx of [-1,1]){ const e=cyl(root,.08,.08,.5,sx*iw2*.3,deck-.42,zr+.12,8,_shHead); e.rotation.z=Math.PI/2; e.scale.y=.5; }    // dos escapes envueltos en soga de amianto
  { const c=cyl(root,.025,.025,.5,iw2*.1,deck-.6,zr-.04,6,darkMat); c.rotation.z=Math.PI/2; }                              // manija de arranque
  for(const sx of [-1,1]){ const f=box(root,I.trW+.06,.03,.55,sx*ft,I.trF+.1,zf-.14,mat); f.rotation.x=-.3; }
}
function nahuelTurret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
  { const m=cyl(G.gp,.28,.28,.9,0,0,.1,14,mat); m.rotation.z=Math.PI/2; m.scale.set(1,1,.7); }                        // mantelete fundido que tapa los cilindros
  rbox(G.gp,.5,.82,.42,0,0,.14,mat,.12);
  { const sl=cyl(G.gp,.1,.13,.32,0,0,.46,12,mat); sl.rotation.x=Math.PI/2; }
  cyl(G.gp,.045,.045,.12,.24,-.05,.36,8,darkMat).rotation.x=Math.PI/2;                                                   // Madsen de 11,35 mm coaxial
  cyl(G.gp,.035,.035,.08,-.24,.18,.32,8,darkMat).rotation.x=Math.PI/2;                                                    // mira periscópica Zeiss
  const cx=-hw*.35, cz=-hl*.2;                                                                                            // escotilla partida del comandante
  cyl(tur,.33,.33,.06,cx,th+.0,cz,16,mat); for(const sx of [-1,1]){ const h=new THREE.Mesh(_shHalf,mat); h.position.set(cx,th+.05,cz); h.rotation.y=sx>0?0:Math.PI; tur.add(h); }
  { const x=hw*.38, z=-hl*.05; cyl(tur,.04,.04,.12,x,th+.05,z,6,darkMat); const l=cyl(tur,.1,.1,.12,x,th+.16,z+.03,10,darkMat); l.rotation.x=Math.PI/2;   // faro sobre el cargador
    const ln=new THREE.Mesh(_shLens,_shHead); ln.position.set(x,th+.16,z+.1); tur.add(ln); }
  for(const sx of [-1,1]){ const pp=cyl(tur,.055,.055,.04,sx*(hw*.95),th*.45,-hl*.3,8,mat); pp.rotation.z=Math.PI/2; }
  { const a=cyl(tur,.012,.012,1.7,hw*.6,th+.85,-hl*.6,4,darkMat); }
}
DET.nahuel={gear:nahuelGear,hull:nahuelHull,tur:nahuelTurret};

// ---- Británicos más fieles (m.w2.det='uk', I.uk = 'matilda'|'crusader'|'cromwell'|'churchill'|'valentine'|'comet') ----
// Todos con la motriz atrás. Christie (Crusader, Cromwell, Comet): cinco ruedas grandes de disco con agujeros; Matilda: diez ruedas chicas
// en bogies tapadas por los faldones con sus bocas para el barro; Churchill: once ruedas chicas debajo de las cajas laterales que envuelven la
// oruga, con las puertas redondas de escape; Valentine: dos bogies de tres ruedas (una grande y dos chicas).
function ukGear(root,I,x,s,tw,zf,zr,mat){ const u=I.uk;
  if(u==='churchill'){ const H=I.trH, so=x+s*(tw/2-.02);
    // 11 bogies con 2 ruedas chicas cada uno, abajo del cajón lateral (pannier) que queda adentro del lazo de la oruga
    for(let i=0;i<11;i++){ const z=zr+.85+i*(zf-zr-1.7)/10; for(const d of [-.13,.13]) dWheel(root,x,.17,z+d,.14,mat,{rim:.7}); }
    profMesh(root,[[zf-.42,H-.1],[zr+.42,H-.1],[zr+.16,H*.72],[zr+.5,.44],[zf-.5,.44],[zf-.16,H*.72]],tw-.07,x,mat);   // cajón lateral
    const d=cyl(root,.3,.3,.05,so,H*.58,-.35,18,mat); d.rotation.z=Math.PI/2; cyl(root,.24,.24,.06,so+s*.01,H*.58,-.35,18,mat).rotation.z=Math.PI/2;   // puerta de escape redonda
    for(let k=0;k<6;k++) box(root,.05,.13,.34,so,.56,zr+1.1+k*(zf-zr-2.2)/5,darkMat);                             // bocas para el barro
    box(root,.04,.05,zf-zr-1.2,so,H-.2,0,darkMat); box(root,.04,.05,zf-zr-1.5,so,.5,0,darkMat);                      // bordes del cajón
    sprocketT(root,x,H*.72,zr+.3,.34,14,mat); dWheel(root,x,H*.72,zf-.3,.32,mat,{rim:.75}); return; }
  if(u==='matilda'){ for(let b=0;b<5;b++) for(const d of [-.24,.24]) dWheel(root,x,.2,zr+1.05+b*(zf-zr-2.05)/4+d,.17,mat,{rim:.7});
    sprocketT(root,x,I.trR*.62,zr+.38,.32,13,mat); dWheel(root,x,I.trF*.62,zf-.36,.28,mat,{rim:.75}); return; }
  if(u==='valentine'){ for(const bc of [zr+1.45,zf-1.45]){ dWheel(root,x,.33,bc,.3,mat,{rim:.78,holes:6}); for(const d of [-.62,.62]) dWheel(root,x,.22,bc+d,.19,mat,{rim:.72}); }
    for(let k=0;k<3;k++) dWheel(root,x,I.trF-.08,zr+1.0+k*(zf-zr-2)/2,.09,mat,{rim:.7});
    sprocketT(root,x,I.trR*.62,zr+.38,.3,13,mat); dWheel(root,x,I.trF*.62,zf-.36,.28,mat,{rim:.75}); return; }
  const r=I.wR, n=I.nW, z0=zr+.95, z1=zf-.95;                                                                    // Christie
  for(let i=0;i<n;i++) dWheel(root,x,r+.03,z0+(z1-z0)*i/(n-1),r,mat,{rim:.8,holes:u==='crusader'?8:6});
  for(let k=0;k<(I.ret||0);k++) dWheel(root,x,I.trF-.08,z0+(z1-z0)*(k+.5)/I.ret,.1,mat,{rim:.7});
  sprocketT(root,x,I.trR*.62,zr+.36,.33,15,mat); dWheel(root,x,I.trF*.62,zf-.34,.3,mat,{rim:.78}); }
function ukHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const u=I.uk, hw=M.W/2, ft=hw-I.trW/2, fy=Math.max(I.trF,I.trR)+.06;
  for(const sx of [-1,1]){ const q=glacisPt(I,deck,gz,zf,.97,.05), k=new THREE.Mesh(_tgShackle,darkMat); k.scale.setScalar(.75); k.position.set(sx*iw2*.36,q.y,q.z); k.rotation.y=Math.PI/2; root.add(k);
    const p=glacisPt(I,deck,gz,zf,.1,.1); cyl(root,.07,.07,.12,sx*iw2*.42,p.y,p.z,8,darkMat).rotation.x=Math.PI/2; }                       // ganchos y faros
  { const p=glacisPt(I,deck,gz,zf,.3,.06), v=rbox(root,.5,.12,.16,-iw2*.22,p.y,p.z,mat,.03); v.rotation.x=p.a; box(v,.3,.025,.03,0,.02,.09,darkMat); } // visor del conductor
  { const c=cyl(root,.03,.03,L*.55,hw+.02,deck-.22,0,6,darkMat); c.rotation.x=Math.PI/2; }                                                // cable
  if(u==='matilda'){ for(const sx of [-1,1]){ for(let k=0;k<6;k++) box(root,.05,.16,.32,sx*(hw-.01),.62,zr+.9+k*(L-1.8)/5,darkMat);           // bocas para el barro en los faldones
      rivetsRow(root,sx*(hw-.005),1.05,zr+.4,zf-.4,12); }
    rbox(root,.42,.5,.5,-iw2*.32,deck-.05,zr-.15,mat,.06); box(root,.06,.36,.3,-iw2*.32,deck-.05,zr-.42,darkMat);                          // escape blindado atrás a la izquierda
    rbox(root,iw2*.5,.32,.3,iw2*.18,deck-.25,zr-.18,mat,.04); }                                                                          // cajón trasero
  else if(u==='churchill'){ const tx=hw-I.trW/2, ty=I.trH+.08;
    // trompa vertical entre los cuernos de la oruga: visor del conductor a la derecha, Besa en bola a la izquierda
    { const v=rbox(root,.5,.2,.1,-iw2*.25,deck-.32,zf+.04,mat,.03); box(v,.32,.03,.03,0,0,.06,darkMat); }
    for(const sx of [-1,1]){ const k=new THREE.Mesh(_tgShackle,darkMat); k.scale.setScalar(.8); k.position.set(sx*iw2*.32,.75,zf+.06); k.rotation.y=Math.PI/2; root.add(k);
      cyl(root,.08,.08,.12,sx*iw2*.42,deck-.12,zf+.02,8,darkMat).rotation.x=Math.PI/2; }                                    // ganchos y faros
    for(const sx of [-1,1]){ for(let k=0;k<5;k++) box(root,.05,.04,.75,sx*(tx+.12),ty+.04+k*.06,zr+1.2,darkMat);          // tomas de aire con persianas sobre los cajones, atrás
      rbox(root,I.trW*.8,.3,.8,sx*tx,ty+.15,zf-1.7,mat,.04); rbox(root,I.trW*.7,.24,.5,sx*tx,ty+.12,.2,mat,.03); }          // cajones de estiba sobre los guardabarros
    box(root,iw2*.6,.03,1.1,0,deck+.02,zr+.95,darkMat); for(let i=0;i<6;i++) box(root,iw2*.6,.04,.04,0,deck+.04,zr+.5+i*.18,mat);   // rejilla del motor
    for(const sx of [-1,1]){ const e=cyl(root,.09,.09,.45,sx*iw2*.3,deck-.35,zr-.05,8,darkMat); e.rotation.x=Math.PI/2; }        // escapes atrás
    rbox(root,iw2*.8,.35,.08,0,deck-.5,zr-.02,mat,.02); }                                                                         // tapa trasera
  else { for(const sx of [-1,1]){ rbox(root,I.trW*.85,.28,.75,sx*ft,fy+.14,zf-1.5,mat,.04); rbox(root,I.trW*.85,.28,.6,sx*ft,fy+.14,zr+1.2,mat,.04); }   // cajones sobre los guardabarros
    if(u==='crusader'||u==='crusaderaa') for(const sx of [-1,1]) box(root,.03,.3,L-1.3,sx*(hw+.04),fy-.08,0,mat);                                              // chapas contra la arena
    if(u==='valentine') for(const sx of [-1,1]){ rivetsRow(root,sx*(hw-.005),deck-.15,zr+.3,zf-gz-.1,11); rivetsRow(root,sx*(hw-.005),deck-.5,zr+.3,zf-gz-.3,10); }
    if(u==='crusader'){ const c=cyl(root,.28,.28,iw2*.7,0,deck-.35,zr-.32,12,mat); c.rotation.z=Math.PI/2; }                                  // tanque de combustible externo
    box(root,iw2*.65,.03,.9,0,deck+.02,zr+.8,darkMat); for(let i=0;i<5;i++) box(root,iw2*.65,.04,.04,0,deck+.04,zr+.45+i*.18,mat);          // rejilla del motor
    for(const sx of [-1,1]){ const e=cyl(root,.08,.09,.3,sx*iw2*.32,deck-.32,zr-.08,8,darkMat); e.rotation.x=Math.PI/2+.4; }                // escapes
    if(u==='cromwell'||u==='comet') box(root,iw2*.9,.5,.05,0,deck-.35,zr-.22,mat); }                                                        // deflector del escape (Cromwell, Comet)
  for(const sx of [-1,1]) rbox(root,.32,.06,.42,sx*iw2*.24,deck+.04,zf-gz-.45,mat,.02); }                                                    // escotillas
function ukTurret(tur,G,M,I,mat,gy){ const u=I.uk, hw=M.tw/2, hl=M.tl/2, th=M.th;
  for(const sx of [-1,1]){ const pp=cyl(tur,.055,.055,.04,sx*(hw*.94+.01),th*.45,-hl*.2,8,mat); pp.rotation.z=Math.PI/2; }                  // puertas de pistola
  // manteletes: externo con funda (Crusader III, Cromwell, Comet), interno chico (Matilda, Valentine), fundido redondo (Churchill)
  if(I.aaN){}                                                                                                                              // antiaéreo: sin mantelete
  else if(u==='crusader'){ rbox(G.gp,.62,.5,.32,0,0,.1,mat,.05); const sl=cyl(G.gp,.1,.12,.4,0,0,.42,10,mat); sl.rotation.x=Math.PI/2; }
  else if(u==='cromwell'||u==='comet'){ rbox(G.gp,.95,.55,.24,0,0,.1,mat,.06); const sl=cyl(G.gp,.11,.13,.42,0,0,.4,10,mat); sl.rotation.x=Math.PI/2;
    for(const sx of [-1,1]){ rivetsRow(tur,sx*(hw*.98),th*.3,-hl*.7,hl*.7,7); rivetsRow(tur,sx*(hw*.98),th*.75,-hl*.7,hl*.7,7);              // chapas abulonadas y cajones a los costados
      rbox(tur,.3,th*.55,hl*1.1,sx*(hw+.16),th*.45,-hl*.15,mat,.04); } }
  else if(u==='churchill'){ const m=rbox(G.gp,.85,.62,.34,0,0,.1,mat,.14); const b=cyl(G.gp,.12,.15,.36,0,0,.42,12,mat); b.rotation.x=Math.PI/2;   // mantelete fundido y funda del 75 mm
    cyl(G.gp,.035,.035,.12,.28,-.05,.3,8,darkMat).rotation.x=Math.PI/2; cyl(tur,.29,.31,.2,hw*.35,th+.1,-hl*.2,14,mat); slits(tur,4,hw*.35,th+.12,-hl*.2+.3,0,.08);   // Besa coaxial y cúpula con visores
    rbox(tur,.55,.06,.6,-hw*.35,th+.03,-hl*.15,mat,.02); for(const sx of [-1,1]) cyl(tur,.05,.05,.03,sx*hw*.6,th*.6,-hl*.95,6,darkMat).rotation.x=Math.PI/2; }
  else { rbox(G.gp,.42,.34,.2,0,0,.06,mat,.05); }
  cyl(G.gp,.03,.03,.1,-.2,.05,.25,8,darkMat).rotation.x=Math.PI/2;                                                                         // mira
  for(let k=0;k<(u==='matilda'||u==='valentine'?2:1);k++){ const sm=cyl(tur,.05,.05,.32,hw*.78,th*.6+k*.12,hl*.2,8,darkMat); sm.rotation.x=Math.PI/2.5; }   // lanzahumos
  box(tur,.12,.07,.1,hw*.3,th+.05,hl*.3,darkMat); box(tur,.12,.07,.1,-hw*.25,th+.05,hl*.4,darkMat);                                       // periscopios
  if(u!=='matilda'&&u!=='valentine'){ const a=cyl(tur,.012,.012,1.8,hw*.6,th+.9,-hl*.55,4,darkMat); }                                     // antena
  if(u==='matilda'||u==='valentine') cyl(tur,.25,.25,.06,-hw*.3,th+.02,-hl*.2,12,mat);                                                    // escotilla (sin cúpula)
}
DET.uk={gear:ukGear,hull:ukHull,tur:ukTurret};

// ---- Estados Unidos más fieles (m.w2.det='us', I.us = 'stuart'|'stuart3'|'m18'|'m24'|'m26'|'m10'|'m36') ----
// Stuart: VVSS de 2 bogies con 2 ruedas, tensora grande atrás apoyada en el suelo, motriz adelante. M18, M24 y M26: barras de torsión con ruedas
// dobles (5, 5 y 6 por lado), motriz adelante (M18, M24) o atrás (M26). M10 y M36 usan el chasis del Sherman: acá solo cambia la torre abierta.
const dualW=(root,x,y,z,r,mat,sp=.1)=>{ for(const d of [-sp,sp]) dWheel(root,x+d,y,z,r,mat,{sc:.45,rim:.8}); };
function usGear(root,I,x,s,tw,zf,zr,mat){ const u=I.us;
  if(u==='m10'||u==='m36') return;                                                                           // ya lo dibuja shermanGear
  if(u==='stuart'||u==='stuart3'){ const r=.26, bz=[zr+1.55,zf-1.35];
    for(const c of bz){ for(const d of [-.33,.33]) dWheel(root,x,r+.03,c+d,r,mat,{rim:.72});
      rbox(root,.12,.38,.62,x+s*(tw/2+.04),.42,c,darkMat,.04); cyl(root,.06,.06,.3,x+s*(tw/2+.06),.62,c,8,darkMat); }   // bogie con su resorte
    for(const z of [zr+1.0,0,zf-1.1]) dWheel(root,x,I.trF-.06,z,.08,mat,{rim:.7});
    sprocketT(root,x,I.trF*.62,zf-.33,.28,14,mat); dWheel(root,x,.3,zr+.32,.3,mat,{rim:.75,holes:5}); return; }   // tensora grande atrás, en el suelo
  const n={m18:5,m24:5,m26:6}[u], r=I.wR, z0=zr+(u==='m26'?.95:.85), z1=zf-(u==='m26'?.95:.9);
  for(let i=0;i<n;i++){ const z=z0+(z1-z0)*i/(n-1); dualW(root,x,r+.03,z,r,mat,tw*.24); const a=box(root,.08,.08,.5,x+s*(tw/2+.02),r+.1,z+.22,darkMat); a.rotation.x=.4; }   // brazo de torsión
  for(let k=0;k<(I.ret||0);k++) dWheel(root,x,I.trF-.06,z0+(z1-z0)*(k+.5)/I.ret,.1,mat,{rim:.7});
  const rear=u==='m26'; sprocketT(root,x,(rear?I.trR:I.trF)*.62,rear?zr+.36:zf-.34,.3,13,mat);
  dualW(root,x,(rear?I.trF:I.trR)*.62,rear?zf-.36:zr+.36,.28,mat,tw*.24);
  if(rear) dWheel(root,x,.22,zf-.85,.15,mat,{rim:.7}); }                                                      // rueda compensadora del Pershing
function usHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const u=I.us, hw=M.W/2, ft=hw-I.trW/2, fy=Math.max(I.trF,I.trR)+.06;
  if(u==='m10'||u==='m36') return;                                                                           // ya lo dibuja shermanHull
  for(const sx of [-1,1]){ const p=glacisPt(I,deck,gz,zf,.12,.1); cyl(root,.07,.07,.12,sx*iw2*.4,p.y,p.z,8,darkMat).rotation.x=Math.PI/2;   // faros con protector
    const g=new THREE.Mesh(_shGuard,darkMat); g.position.set(sx*iw2*.4,p.y+.02,p.z+.05); root.add(g);
    const q=glacisPt(I,deck,gz,zf,.97,.05), k=new THREE.Mesh(_tgShackle,darkMat); k.scale.setScalar(.75); k.position.set(sx*iw2*.35,q.y,q.z); k.rotation.y=Math.PI/2; root.add(k); }
  for(const sx of [-1,1]){ const p=glacisPt(I,deck,gz,zf,.06,.06); const h=rbox(root,.5,.08,.48,sx*iw2*.25,p.y,p.z-.3,mat,.03); box(h,.13,.07,.1,0,.07,.18,darkMat); }  // escotillas con periscopio
  if(u==='stuart'||u==='stuart3'){
    if(u==='stuart') for(const sx of [-1,1]){ rivetsRow(root,sx*(hw-.005),deck-.12,zr+.3,zf-gz,10); rivetsRow(root,sx*(hw-.005),deck-.55,zr+.3,zf-gz,10); }
    for(const sx of [-1,1]) box(root,.03,.32,L-1,sx*(hw+.03),fy-.1,0,mat);                                     // chapas contra la arena
    rbox(root,iw2*.8,.4,.35,0,deck-.35,zr-.15,mat,.04);                                                        // cajón trasero del motor radial
    for(const sx of [-1,1]){ const e=cyl(root,.07,.07,.3,sx*iw2*.25,deck-.55,zr-.3,8,darkMat); e.rotation.x=Math.PI/2; }
    { const c=cyl(root,.025,.025,L*.5,hw+.02,deck-.25,0,6,darkMat); c.rotation.x=Math.PI/2; } return; }
  // M18, M24, M26: cascos soldados inclinados
  for(const sx of [-1,1]){ rbox(root,I.trW*.85,.28,.7,sx*ft,fy+.14,zf-1.5,mat,.04); rbox(root,I.trW*.85,.28,.6,sx*ft,fy+.14,zr+1.1,mat,.04); }   // cajones de estiba
  { const c=cyl(root,.03,.03,L*.6,hw-.02,deck-.15,0,6,darkMat); c.rotation.x=Math.PI/2; box(root,.08,.08,1.3,-(hw-.05),deck-.12,-.1,_wdMat); }
  box(root,iw2*.7,.03,.95,0,deck+.02,zr+.85,darkMat); for(let i=0;i<5;i++) box(root,iw2*.7,.04,.04,0,deck+.04,zr+.48+i*.18,mat);   // rejilla del motor
  for(const sx of [-1,1]){ const e=cyl(root,.09,.09,.32,sx*iw2*.3,deck-.4,zr-.08,8,darkMat); e.rotation.x=Math.PI/2+.5; }
  if(u==='m26') box(root,iw2*.9,.45,.05,0,deck-.3,zr-.2,mat);                                                  // deflector del escape
  if(u==='m26'||u==='m24'){ const b=cyl(root,.08,.09,.18,iw2*.3,deck-gz*.35,zf-gz*.45+.12,8,mat); b.rotation.x=Math.PI/2.4; }
}
function usTurret(tur,G,M,I,mat,gy){ const u=I.us, hw=M.tw/2, hl=M.tl/2, th=M.th;
  const fifty=(x,z,y=th)=>{ cyl(tur,.03,.03,.32,x,y+.16,z,6,darkMat); box(tur,.1,.13,.35,x,y+.36,z+.05,darkMat); const b=cyl(tur,.025,.025,1.0,x,y+.38,z+.6,6,darkMat); b.rotation.x=Math.PI/2; rbox(tur,.16,.2,.25,x+.15,y+.3,z,_shGreenBox,.03); };
  if(u==='m10'){ for(const sx of [-1,1]){ const w=prism(tur,[[-.32,.4],[.32,.4],[.32,-.4],[-.32,-.4]],.62,.25,sx*(hw*.55),.05,-hl-.42,mat); }   // contrapesos de la torre del M10
    rbox(G.gp,.75,.5,.3,0,0,.1,mat,.05); fifty(-hw*.6,-hl*.6); return; }
  if(u==='m36'){ rbox(tur,M.tw*.75,th*.7,.6,0,th*.38,-hl-.25,mat,.06); rbox(G.gp,.8,.55,.3,0,0,.1,mat,.07); fifty(hw*.55,-hl*.8,th*.8); return; }   // torre redonda abierta con cesto
  if(u==='m18'){ rbox(G.gp,.62,.45,.26,0,0,.1,mat,.05); fifty(hw*.5,-hl*.75,th*.9); box(tur,M.tw*.85,.05,.4,0,th-.02,-hl+.2,darkMat); return; }
  for(const sx of [-1,1]){ const pp=cyl(tur,.055,.055,.04,sx*(hw*.94),th*.45,-hl*.2,8,mat); pp.rotation.z=Math.PI/2; }
  box(tur,.12,.07,.1,hw*.3,th+.05,hl*.3,darkMat); box(tur,.12,.07,.1,-hw*.2,th+.05,hl*.35,darkMat);
  if(u==='stuart'||u==='stuart3'){ rbox(G.gp,.4,.32,.2,0,0,.06,mat,.05); cyl(G.gp,.025,.025,.35,.18,-.03,.3,6,darkMat).rotation.x=Math.PI/2;   // mantelete chico y coaxial
    if(u==='stuart') for(const sx of [-1,1]) rivetsRow(tur,sx*(hw*.97),th*.5,-hl*.7,hl*.6,6);
    cyl(tur,.24,.24,.06,-hw*.2,th+.02,-hl*.1,12,mat); return; }
  if(u==='m24'){ rbox(G.gp,.7,.48,.3,0,0,.1,mat,.07); cyl(G.gp,.03,.03,.1,.24,-.04,.3,8,darkMat).rotation.x=Math.PI/2; fifty(hw*.1,-hl-.15,th*.85); return; }
  if(u==='m26'){ rbox(G.gp,.95,.62,.3,0,0,.12,mat,.07); cyl(G.gp,.035,.035,.1,.32,-.05,.32,8,darkMat).rotation.x=Math.PI/2;
    cyl(tur,.26,.26,.06,hw*.38,th+.02,-hl*.1,12,mat); fifty(-hw*.3,-hl*.35); const a=cyl(tur,.012,.012,1.8,hw*.6,th+.9,-hl*.7,4,darkMat); }
}
DET.us={gear:usGear,hull:usHull,tur:usTurret};

// ---- Soviéticos más fieles (m.w2.det='ru', I.ru = 't70'|'kv1'|'kv2'|'su100'|'bt7'|'t26'|'zsu37') ----
// KV: 6 ruedas chicas, 3 rodillos de retorno, motriz atrás, guardabarros anchos con cajones. T-70, ZSU-37 (chasis del SU-76M): ruedas con goma
// y motriz adelante. BT-7 y SU-100: Christie (como el T-34) con ruedas grandes sin rodillos. T-26: 8 ruedas chicas en 4 bogies con ballestas.
function ruGear(root,I,x,s,tw,zf,zr,mat){ const u=I.ru;
  if(u==='su100'||u==='bt7'){ if(u==='su100') return t34Gear(root,I,x,s,tw,zf,zr,mat);
    const r=I.wR, n=I.nW, z0=zr+.75, z1=zf-.85; for(let i=0;i<n;i++) dWheel(root,x,r+.03,z0+(z1-z0)*i/(n-1),r,mat,{rim:.8,holes:8});
    const sp=wheel(root,x,I.trR*.6,zr+.32,.3); cyl(sp,.25,.25,.3,0,0,0,10,mat); dWheel(root,x,I.trF*.6,zf-.33,.27,mat,{rim:.75}); return; }
  if(u==='t26'){ for(const bc of [zr+1.35,zf-1.15]) for(const pc of [-.32,.32]){ for(const d of [-.17,.17]) dWheel(root,x,.21,bc+pc+d,.17,mat,{rim:.7});
      rbox(root,.1,.18,.55,x+s*(tw/2+.04),.3,bc+pc,darkMat,.03); }
    for(const bc of [zr+1.35,zf-1.15]){ const l=box(root,.06,.06,1.05,x+s*(tw/2+.07),.48,bc,darkMat); }                              // ballestas
    for(let k=0;k<4;k++) dWheel(root,x,I.trF-.06,zr+.95+k*(zf-zr-1.9)/3,.09,mat,{rim:.7});
    sprocketT(root,x,I.trF*.62,zf-.3,.25,12,mat); dWheel(root,x,I.trR*.62,zr+.3,.24,mat,{rim:.75}); return; }
  const kv=u==='kv1'||u==='kv2', n=I.nW, r=I.wR, z0=zr+.9, z1=zf-.9;
  for(let i=0;i<n;i++) dWheel(root,x,r+.03,z0+(z1-z0)*i/(n-1),r,mat,{rim:kv?.78:.75,holes:kv?6:0});
  for(let k=0;k<(I.ret||0);k++) dWheel(root,x,I.trF-.06,z0+(z1-z0)*(k+.5)/I.ret,.1,mat,{rim:.7});
  if(kv){ sprocketT(root,x,I.trR*.62,zr+.38,.36,16,mat); dWheel(root,x,I.trF*.62,zf-.36,.32,mat,{rim:.75}); }
  else { sprocketT(root,x,I.trF*.62,zf-.32,.27,13,mat); dWheel(root,x,I.trR*.62,zr+.32,.25,mat,{rim:.75}); } }
function ruHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const u=I.ru, hw=M.W/2, ft=hw-I.trW/2, fy=Math.max(I.trF,I.trR)+.06;
  if(u==='su100'){ t34Hull(root,M,I,mat,iw2,deck,gz,zf,zr,L); return; }
  { const p=glacisPt(I,deck,gz,zf,.25,.06), d=rbox(root,.5,.12,.3,-iw2*.2,p.y,p.z,mat,.03); d.rotation.x=p.a; box(d,.12,.06,.08,0,.08,-.05,darkMat); }   // escotilla o visor del conductor
  { const p=glacisPt(I,deck,gz,zf,.1,.08); cyl(root,.075,.075,.13,-iw2*.42,p.y,p.z,8,darkMat).rotation.x=Math.PI/2; }                                     // faro
  for(const sx of [-1,1]){ const q=glacisPt(I,deck,gz,zf,.96,.05), k=new THREE.Mesh(_tgShackle,darkMat); k.scale.setScalar(.8); k.position.set(sx*iw2*.35,q.y,q.z); k.rotation.y=Math.PI/2; root.add(k); }
  if(u==='kv1'||u==='kv2'){ for(const sx of [-1,1]){ rbox(root,I.trW*.75,.3,.85,sx*ft,fy+.15,zf-1.4,mat,.04); rbox(root,I.trW*.75,.3,.85,sx*ft,fy+.15,zr+1.4,mat,.04);   // cajones en los guardabarros
      rbox(root,I.trW*.6,.42,.55,sx*ft,fy+.21,0,mat,.05); for(let k=0;k<3;k++) box(root,.04,.04,.4,sx*(hw-.02),deck-.15-k*.08,zr+.7,darkMat); }       // tanque de aceite y tomas de aire
    box(root,iw2*.65,.03,1.0,0,deck+.02,zr+.85,darkMat); for(let i=0;i<6;i++) box(root,iw2*.65,.04,.04,0,deck+.04,zr+.45+i*.16,mat);
    for(const sx of [-1,1]){ const e=cyl(root,.09,.09,.3,sx*iw2*.3,deck-.45,zr-.06,8,darkMat); e.rotation.x=Math.PI/2; }
    { const c=cyl(root,.035,.035,L*.6,hw-.02,deck-.15,0,6,darkMat); c.rotation.x=Math.PI/2; } return; }
  if(u==='bt7'||u==='t26'){ for(const sx of [-1,1]) rivetsRow(root,sx*(hw-.005),deck-.15,zr+.3,zf-gz,10);
    for(let i=0;i<4;i++) box(root,iw2*.6,.04,.04,0,deck+.04,zr+.4+i*.15,mat);
    for(const sx of [-1,1]){ const e=cyl(root,.08,.08,.35,sx*iw2*.28,deck-.2,zr-.08,8,darkMat); e.rotation.x=Math.PI/2; }
    if(u==='bt7') for(const sx of [-1,1]) for(let k=0;k<2;k++) box(root,.04,.05,.5,sx*(hw-.05),fy+.03+k*.07,0,trackMat);   // eslabones y cajones sobre los guardabarros
    return; }
  for(const sx of [-1,1]) rbox(root,I.trW*.85,.24,.6,sx*ft,fy+.12,zr+.9,mat,.04);                              // T-70 y ZSU-37: livianos
  box(root,iw2*.6,.03,.6,0,deck+.02,zr+.6,darkMat); for(const sx of [-1,1]){ const e=cyl(root,.06,.06,.3,sx*iw2*.25,deck-.25,zr-.06,8,darkMat); e.rotation.x=Math.PI/2; } }
function ruTurret(tur,G,M,I,mat,gy){ const u=I.ru, hw=M.tw/2, hl=M.tl/2, th=M.th;
  if(u==='su100'){ const m=cyl(G.gp,.24,.24,.62,0,0,.05,14,mat); m.rotation.z=Math.PI/2; const sl=cyl(G.gp,.12,.15,.5,0,0,.4,12,mat); sl.rotation.x=Math.PI/2; return; }
  if(u==='zsu37') return;
  for(const sx of [-1,1]){ const pp=cyl(tur,.055,.055,.04,sx*(hw*.94),th*.45,-hl*.2,8,mat); pp.rotation.z=Math.PI/2; }
  if(u==='kv1'){ rbox(G.gp,.75,.55,.3,0,0,.1,mat,.06); const sl=cyl(G.gp,.11,.13,.4,0,0,.42,10,mat); sl.rotation.x=Math.PI/2;
    for(const sx of [-1,1]) for(const [y,z] of [[.3,.5],[.3,-.5],[.7,0]]) cyl(tur,.04,.04,.03,sx*(hw+.01),th*y,hl*z*.7,6,darkMat).rotation.z=Math.PI/2;   // bulones de las chapas extra
    cyl(tur,.28,.28,.06,0,th+.02,-hl*.25,12,mat); box(tur,.12,.07,.1,hw*.4,th+.05,hl*.2,darkMat);
    { const b=new THREE.Mesh(new THREE.SphereGeometry(.11,10,8),mat); b.position.set(0,th*.5,-hl+.01); tur.add(b); cyl(tur,.025,.025,.3,0,th*.5,-hl-.12,6,darkMat).rotation.x=Math.PI/2; } return; }
  if(u==='kv2'){ rbox(G.gp,1.0,.85,.36,0,0,.12,mat,.08); const sl=cyl(G.gp,.18,.2,.45,0,0,.42,12,mat); sl.rotation.x=Math.PI/2;
    { const d=rbox(tur,.8,1.0,.06,0,th*.45,-hl-.02,mat,.03); }                                                   // puerta trasera para cargar los proyectiles de 152 mm
    for(const sx of [-1,1]) rivetsRow(tur,sx*(hw+.005),th*.85,-hl*.8,hl*.7,8);
    cyl(tur,.28,.28,.06,hw*.3,th+.02,-hl*.3,12,mat); box(tur,.12,.07,.1,-hw*.35,th+.05,hl*.3,darkMat); return; }
  if(u==='bt7'||u==='t26'){ rbox(G.gp,.42,.3,.18,0,0,.06,mat,.05); cyl(G.gp,.025,.025,.35,.18,-.02,.3,6,darkMat).rotation.x=Math.PI/2;
    if(u==='t26') for(const sx of [-1,1]) rivetsRow(tur,sx*(hw*.97),th*.5,-hl*.6,hl*.6,6);
    cyl(tur,.24,.24,.05,-hw*.3,th+.02,-hl*.1,12,mat); const a=cyl(tur,.012,.012,1.4,hw*.6,th+.7,-hl*.3,4,darkMat); return; }
  rbox(G.gp,.4,.3,.18,0,0,.06,mat,.05); cyl(tur,.22,.22,.05,0,th+.02,-hl*.1,12,mat); box(tur,.11,.07,.09,hw*.4,th+.05,hl*.25,darkMat); }   // T-70
DET.ru={gear:ruGear,hull:ruHull,tur:ruTurret};

// ---- Alemanes más fieles (m.w2.det='de', I.de = 'pz3'|'pz4'|'stug'|'tiger2'|'jagdp'|'pz38'|'flak4'); datos de Tank Encyclopedia ----
// Pz III y StuG III: 6 ruedas con barras de torsión, 3 rodillos, motriz de 6 rayos adelante, tensora atrás. Pz IV (y Wirbelwind/Ostwind):
// 8 ruedas chicas en 4 bogies con ballestas, rodillos de retorno, motriz adelante. Tiger II: 9 ejes de ruedas de acero de 800 mm intercaladas.
// Jagdpanther: el chasis del Panther. Pz 38(t): 4 ruedas grandes de a pares con ballestas semielípticas, 2 rodillos, todo remachado.
function deGear(root,I,x,s,tw,zf,zr,mat){ const u=I.de;
  if(u==='jagdp') return pantherGear(root,I,x,s,tw,zf,zr,mat);
  if(u==='tiger2'){ const r=.4, n=9, z0=zr+1.0, z1=zf-1.1, o=tw*.32;
    for(let i=0;i<n;i++){ const z=z0+(z1-z0)*i/(n-1); for(const d of (i%2?[0]:[o,-o])) dWheel(root,x+s*d,r+.03,z,r,mat,{rim:.86,holes:0}); }   // ruedas de acero (sin goma)
    sprocketT(root,x,I.trF*.6,zf-.45,.42,18,mat); dWheel(root,x,I.trR*.6,zr+.45,.33,mat,{rim:.8}); return; }
  if(u==='pz38'){ for(const c of [zr+1.25,zf-1.2]){ for(const d of [-.42,.42]) dWheel(root,x,.38,c+d,.36,mat,{rim:.78});
      box(root,.08,.1,.95,x+s*(tw/2+.06),.62,c,darkMat); for(let k=0;k<4;k++) box(root,.07,.03,.95-k*.18,x+s*(tw/2+.06),.56-k*.035,c,darkMat); }   // ballesta
    for(const z of [zr+1.2,zf-1.15]) dWheel(root,x,I.trF-.06,z,.11,mat,{rim:.7});
    sprocketT(root,x,I.trF*.62,zf-.33,.32,19,mat); dWheel(root,x,I.trR*.62,zr+.3,.26,mat,{rim:.75}); return; }
  if(u==='pz4'||u==='flak4'){ const z0=zr+.95, z1=zf-1.05;
    for(let b=0;b<4;b++){ const c=z0+(z1-z0)*b/3; for(const d of [-.25,.25]) dWheel(root,x,.27,c+d,.24,mat,{rim:.72});
      rbox(root,.08,.16,.62,x+s*(tw/2+.05),.36,c,darkMat,.03); for(let k=0;k<3;k++) box(root,.06,.025,.5-k*.12,x+s*(tw/2+.08),.47-k*.03,c,darkMat); }   // bogie con ballesta
    for(let k=0;k<(I.ret||4);k++) dWheel(root,x,I.trF-.06,z0+(z1-z0)*(k+.5)/(I.ret||4),.1,mat,{rim:.7});
    sprocketT(root,x,I.trF*.62,zf-.33,.3,20,mat); dWheel(root,x,I.trR*.62,zr+.3,.27,mat,{rim:.6,holes:6}); return; }
  const r=I.wR, z0=zr+.85, z1=zf-.95;                                                                         // Pz III / StuG III
  for(let i=0;i<6;i++){ const z=z0+(z1-z0)*i/5; dWheel(root,x,r+.03,z,r,mat,{rim:.76}); const a=box(root,.07,.07,.45,x+s*(tw/2+.02),r+.08,z+.18,darkMat); a.rotation.x=.45; }
  for(let k=0;k<3;k++) dWheel(root,x,I.trF-.06,z0+(z1-z0)*(k*.5+.08)/1.16,.1,mat,{rim:.7});
  const sp=sprocketT(root,x,I.trF*.62,zf-.33,.3,21,mat); dWheel(root,x,I.trR*.62,zr+.3,.27,mat,{rim:.6,holes:6}); }
function deHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const u=I.de, hw=M.W/2, ft=hw-I.trW/2, fy=Math.max(I.trF,I.trR)+.06;
  if(u==='jagdp'){ pantherHull(root,M,I,mat,iw2,deck,gz,zf,zr,L); return; }
  // frente: visera del conductor (Fahrersehklappe), faro Notek, ganchos, eslabones de repuesto
  { const p=glacisPt(I,deck,gz,zf,.15,.06); rbox(root,.42,.18,.12,-iw2*.22,p.y-.1,zf-gz+.05,mat,.03); box(root,.3,.025,.03,-iw2*.22,p.y-.08,zf-gz+.12,darkMat); }
  { const p=glacisPt(I,deck,gz,zf,.05,.08); cyl(root,.06,.06,.11,-hw*.6,deck+.07,zf-gz-.06,8,darkMat).rotation.x=Math.PI/2; box(root,.12,.06,.06,hw*.55,deck+.06,zf-gz-.05,darkMat); }   // faro y Notek
  for(const sx of [-1,1]){ const k=new THREE.Mesh(_tgShackle,darkMat); k.scale.setScalar(.8); k.position.set(sx*(iw2/2-.1),.6,zf+.02); k.rotation.y=Math.PI/2; root.add(k);
    const f=box(root,I.trW+.06,.03,.5,sx*ft,I.trF+.1,zf-.14,mat); f.rotation.x=-.3; }
  if(u!=='tiger2') for(let i=0;i<4;i++){ const p=glacisPt(I,deck,gz,zf,.55+i*.1,.04), b=box(root,iw2*.65,.05,.14,0,p.y,p.z,trackMat); b.rotation.x=p.a; }
  // costados: cable, herramientas, Schürzen; atrás: silenciadores, cajón, lanzahumos
  { const c=cyl(root,.035,.035,L*.6,hw-.03,deck-.12,-.1,6,darkMat); c.rotation.x=Math.PI/2; box(root,.08,.08,1.2,-(hw-.08),deck+.04,.1,_wdMat); box(root,.12,.12,1.0,hw-.25,deck+.06,zr+L*.42,darkMat); }
  if(u==='pz38'){ for(const sx of [-1,1]){ rivetsRow(root,sx*(hw-.005),deck-.1,zr+.3,zf-gz,12); rivetsRow(root,sx*(hw-.005),deck-.45,zr+.3,zf-gz,12); }
    for(let k=0;k<2;k++){ const p=glacisPt(I,deck,gz,zf,k?.9:.1,.02); for(let i=0;i<7;i++) cyl(root,.025,.025,.03,-iw2*.4+i*iw2*.133,p.y,p.z,5,darkMat).rotation.x=Math.PI/2-p.a; }
    const m=cyl(root,.13,.13,.7,0,deck-.35,zr-.15,10,darkMat); m.rotation.z=Math.PI/2; return; }
  if(u==='tiger2'){ for(const sx of [-1,1]){ cyl(root,.08,.09,1.0,sx*.42,deck,zr-.08,8,darkMat); rbox(root,.3,.55,.16,sx*.42,deck+.05,zr-.14,mat,.04);
      box(root,.7,.03,1.1,sx*iw2*.3,deck+.03,zr+L*.17,darkMat); } cyl(root,.3,.3,.05,0,deck+.04,zr+L*.17,16,darkMat); return; }
  if(u==='pz4'||u==='flak4'){ for(const sx of [-1,1]) box(root,.7,.03,.85,sx*iw2*.28,deck+.03,zr+L*.2,darkMat);            // dos rejillas de radiadores (desde el Ausf.F)
    { const m=cyl(root,.2,.2,.95,-iw2*.1,deck-.5,zr-.22,12,darkMat); m.rotation.z=Math.PI/2; cyl(root,.09,.09,.4,iw2*.35,deck-.55,zr-.18,8,darkMat).rotation.z=Math.PI/2; }   // silenciador grande y auxiliar
    rbox(root,.4,.25,.25,iw2*.3,deck-.15,zr-.15,mat,.03); }                                                              // lanzahumos atrás
  else { box(root,iw2*.6,.03,.9,0,deck+.03,zr+L*.18,darkMat); const m=cyl(root,.17,.17,iw2*.75,0,deck-.45,zr-.2,12,darkMat); m.rotation.z=Math.PI/2; rbox(root,.4,.25,.25,iw2*.3,deck-.12,zr-.15,mat,.03); }
  if(u==='stug'){ const sh=box(root,.55,.45,.05,.3,deck+(I.case?I.case.h:0)+.2,(I.case?I.case.z:0)+.3,mat); box(root,.03,.03,.5,.3,deck+(I.case?I.case.h:0)+.32,(I.case?I.case.z:0)+.6,darkMat);   // escudo de la ametralladora del cargador
    cyl(root,.25,.27,.18,-.4,deck+(I.case?I.case.h:0)+.08,(I.case?I.case.z:0)-.3,12,mat); }                               // cúpula
}
function deTurret(tur,G,M,I,mat,gy){ const u=I.de, hw=M.tw/2, hl=M.tl/2, th=M.th;
  if(u==='jagdp'||u==='stug'){ const m=I.mant==='round'?cyl(G.gp,.3,.36,.55,0,0,.15,14,mat):rbox(G.gp,.62,.46,.32,0,0,.1,mat,.05); if(I.mant==='round') m.rotation.x=Math.PI/2; return; }   // Saukopf / mantelete de caja
  if(u==='flak4') return;
  for(const sx of [-1,1]){ if(u!=='tiger2'&&u!=='pz38'){ const d=rbox(tur,.04,th*.6,.55,sx*(hw*.97),th*.45,-hl*.05,mat,.02); }                         // puertas laterales de la torre (Pz III y IV)
    const v=box(tur,.04,.06,.16,sx*(hw*.96),th*.6,hl*.55,darkMat); }                                                       // visores
  if(u==='pz3'){ rbox(G.gp,.7,.45,.3,0,0,.1,mat,.05); cyl(G.gp,.03,.03,.1,.24,-.04,.28,8,darkMat).rotation.x=Math.PI/2; return; }
  if(u==='pz4'){ rbox(G.gp,.62,.38,.24,0,0,.08,mat,.04); cyl(G.gp,.03,.03,.1,-.22,-.02,.24,8,darkMat).rotation.x=Math.PI/2; return; }
  if(u==='pz38'){ rbox(G.gp,.42,.34,.2,0,0,.06,mat,.05); cyl(G.gp,.03,.03,.3,.17,-.02,.28,8,darkMat).rotation.x=Math.PI/2;           // ametralladora al lado del cañón
    for(const sx of [-1,1]) rivetsRow(tur,sx*(hw*.97),th*.5,-hl*.6,hl*.6,6); cyl(tur,.2,.22,.18,-hw*.2,th+.06,-hl*.15,10,mat); return; }
  if(u==='tiger2'){ const m=cyl(G.gp,.3,.42,.6,0,0,.2,14,mat); m.rotation.x=Math.PI/2;                                   // Saukopf de la torre Henschel
    for(const sx of [-1,1]) for(let k=0;k<4;k++){ const b=box(tur,.04,.16,.3,sx*(hw+.03),th*.45,hl*.15-k*.32,trackMat); }  // eslabones colgados en la torre
    cyl(tur,.26,.26,.06,hw*.35,th+.02,hl*.05,12,mat); box(tur,.12,.07,.1,hw*.35,th+.06,hl*.35,darkMat); cyl(tur,.07,.07,.1,0,th+.04,-hl*.4,8,darkMat);   // escotilla, periscopio y arma de defensa cercana
    rbox(tur,.06,.5,.55,0,th*.45,-hl-.02,mat,.03); }                                                                   // escotilla trasera
}
DET.de={gear:deGear,hull:deHull,tur:deTurret};

// ---- Italia, Japón, Francia y China más fieles (m.w2.det = 'it'|'jp'|'fr'|'cn'; la variante en I.it, I.jp, I.fr, I.cn) ----
// Italia: L6/40 con 2 bogies de 2 ruedas y barras de torsión; M13/40, Semovente 75/18 y P26/40 con 2 bogies de 4 ruedas chicas de a pares y
// ballestas semielípticas, 3 rodillos de retorno, motriz adelante; cascos remachados (el P26/40 abulonado). Japón: suspensión de balancines
// (bellcrank) del ingeniero Hara, con el resorte en espiral horizontal en un tubo por fuera del casco: Ha-Go y Ke-Ni (Ta-Se) con 2 bogies de
// 2 ruedas; Chi-Ha, Chi-He y Chi-Nu con 6 ruedas (las del medio de a pares). Antena en herradura alrededor de la torre. Francia: H39 con 3 bogies
// en tijera y resorte horizontal; S35 con 9 ruedas tras el faldón y motriz atrás; B1 bis con la oruga envuelta, faldón con bocas para el barro,
// el obús de 75 mm en el casco a la derecha y la puerta lateral. China: Vickers 6 t con 2 bogies de 4 ruedas y ballestas, 4 rodillos.
const spring=(root,x,y,z,len,r=.06)=>{ const c=cyl(root,r,r,len,x,y,z,8,darkMat); c.rotation.x=Math.PI/2; for(let k=0;k<4;k++){ const b=cyl(root,r+.015,r+.015,.025,x,y,z-len*.4+k*len*.27,8,darkMat); b.rotation.x=Math.PI/2; } return c; };
const leaf=(root,x,y,z,len,n=4)=>{ for(let k=0;k<n;k++) box(root,.07,.03,len-k*len*.18,x,y-k*.035,z,darkMat); };
function ruedas4(root,I,x,s,tw,c,r,mat){ for(const d of [-3.1*r,-1.05*r,1.05*r,3.1*r]) dWheel(root,x,r+.03,c+d,r,mat,{rim:.7});
  for(const d of [-1,1]) rbox(root,.08,.14,r*3.6,x+s*(tw/2+.04),r+.05,c+d*r*1.35,darkMat,.03); leaf(root,x+s*(tw/2+.07),r*2+.18,c,r*7.5); }
function itGear(root,I,x,s,tw,zf,zr,mat){ const u=I.it;
  if(u==='l6'){ for(const c of [zr+1.05,zf-1.15]){ for(const d of [-.28,.28]) dWheel(root,x,.25,c+d,.22,mat,{rim:.74});
      const a=rbox(root,.1,.12,.75,x+s*(tw/2+.04),.3,c,darkMat,.03); }
    for(let k=0;k<3;k++) dWheel(root,x,I.trF-.06,zr+.8+k*(zf-zr-1.6)/2,.08,mat,{rim:.7});
    sprocketT(root,x,I.trF*.62,zf-.3,.25,12,mat); dWheel(root,x,I.trR*.62,zr+.28,.24,mat,{rim:.75}); return; }
  const r=u==='p40'?.19:.16, z0=zr+1.35, z1=zf-1.35;
  for(const c of [z0,z1]) ruedas4(root,I,x,s,tw,c,r,mat);
  for(let k=0;k<3;k++) dWheel(root,x,I.trF-.06,zr+.95+k*(zf-zr-1.9)/2,.09,mat,{rim:.7});
  sprocketT(root,x,I.trF*.62,zf-.32,u==='p40'?.32:.28,13,mat); dWheel(root,x,I.trR*.6,zr+.32,.26,mat,{rim:.74}); }
function itHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const u=I.it, hw=M.W/2, ft=hw-I.trW/2, fy=Math.max(I.trF,I.trR)+.06;
  for(const sx of [-1,1]){ rivetsRow(root,sx*(hw-.005),deck-.1,zr+.3,zf-gz,u==='l6'?9:13); rivetsRow(root,sx*(hw-.005),deck-.45,zr+.3,zf-gz*.6,u==='l6'?8:12); }
  for(let k=0;k<2;k++){ const p=glacisPt(I,deck,gz,zf,k?.92:.08,.02); for(let i=0;i<8;i++) cyl(root,.022,.022,.03,-iw2*.42+i*iw2*.12,p.y,p.z,5,darkMat).rotation.x=Math.PI/2-p.a; }   // remaches del frente
  { const p=glacisPt(I,deck,gz,zf,.2,.06), v=rbox(root,.42,.16,.1,u==='l6'?iw2*.2:-iw2*.22,p.y,p.z,mat,.03); v.rotation.x=p.a; box(v,.28,.025,.03,0,.02,.06,darkMat); }   // visera del conductor
  for(const sx of [-1,1]){ const p=glacisPt(I,deck,gz,zf,.08,.08); cyl(root,.07,.07,.1,sx*iw2*.42,p.y+.05,p.z,8,darkMat).rotation.x=Math.PI/2; }   // faros
  if(u!=='l6') for(let i=0;i<3;i++){ const p=glacisPt(I,deck,gz,zf,.55+i*.12,.04), b=box(root,iw2*.7,.05,.14,0,p.y,p.z,trackMat); b.rotation.x=p.a; }   // eslabones de repuesto
  if(u==='m13'||u==='sem'){ const d=rbox(root,.05,.5,.6,-(hw+.01),deck-.42,.2,mat,.02); cyl(root,.03,.03,.05,-(hw+.04),deck-.42,.38,6,darkMat).rotation.z=Math.PI/2; }   // puerta lateral izquierda
  { const c=cyl(root,.03,.03,L*.5,hw-.02,deck-.15,0,6,darkMat); c.rotation.x=Math.PI/2; box(root,.07,.07,1.1,-(hw-.08),deck+.04,0,_wdMat); }   // cable y pala
  for(const sx of [-1,1]){ const m=cyl(root,.11,.11,.5,sx*ft,fy+.12,zr+.45,10,darkMat); m.rotation.x=Math.PI/2; }   // silenciadores sobre los guardabarros traseros
  box(root,iw2*.6,.03,.8,0,deck+.03,zr+L*.17,darkMat); for(let i=0;i<4;i++) box(root,iw2*.6,.04,.04,0,deck+.05,zr+L*.17-.3+i*.2,mat);   // rejilla del motor
  if(u==='sem'){ const C=I.case; for(const sx of [-1,1]) rivetsRow(root,sx*(C.w/2-.02),deck+C.h*.5,C.z-C.l*.4,C.z+C.l*.4,8);
    rbox(root,.4,.06,.4,.35,deck+C.h+.02,C.z-.3,mat,.02); }                                                    // remaches y escotilla de la casamata
  if(u==='p40') rbox(root,.36,.06,.42,-iw2*.22,deck+.04,zf-gz-.4,mat,.02); }
function itTurret(tur,G,M,I,mat,gy){ const u=I.it, hw=M.tw/2, hl=M.tl/2, th=M.th;
  if(u==='sem'){ rbox(G.gp,.55,.42,.3,0,0,.1,mat,.05); cyl(G.gp,.13,.13,.3,0,0,.35,10,mat).rotation.x=Math.PI/2; return; }   // mantelete del obús 75/18
  if(u!=='p40') for(const sx of [-1,1]) rivetsRow(tur,sx*(hw*.97),th*.5,-hl*.7,hl*.6,u==='l6'?5:7);
  for(const sx of [-1,1]) box(tur,.04,.07,.16,sx*(hw*.96),th*.6,hl*.45,darkMat);                          // visores
  if(u==='l6'){ rbox(G.gp,.4,.3,.18,0,0,.06,mat,.04); cyl(G.gp,.03,.03,.32,.15,-.02,.28,6,darkMat).rotation.x=Math.PI/2; cyl(tur,.22,.22,.05,0,th+.02,-hl*.2,12,mat); return; }
  if(u==='m13'){ const m=cyl(G.gp,.24,.24,.45,0,0,.06,12,mat); m.rotation.z=Math.PI/2; for(const sx of [-1,1]) cyl(G.gp,.025,.025,.3,sx*.2,-.12,.25,6,darkMat).rotation.x=Math.PI/2;   // mantelete redondo y dos Breda
    for(const sx of [-1,1]) rbox(tur,.4,th*.7,.05,sx*hw*.3,th*.45,-hl-.01,mat,.02);                            // puertas traseras
    rbox(tur,.45,.06,.45,-hw*.2,th+.03,-hl*.15,mat,.02); return; }
  rbox(G.gp,.7,.45,.28,0,0,.1,mat,.05); cyl(G.gp,.03,.03,.1,.24,-.04,.28,8,darkMat).rotation.x=Math.PI/2;   // P26/40
  cyl(tur,.26,.26,.06,-hw*.25,th+.02,-hl*.2,12,mat); box(tur,.12,.07,.1,hw*.35,th+.05,hl*.3,darkMat); const a=cyl(tur,.012,.012,1.6,hw*.6,th+.8,-hl*.6,4,darkMat); }
DET.it={gear:itGear,hull:itHull,tur:itTurret};

function jpGear(root,I,x,s,tw,zf,zr,mat){ const u=I.jp, so=x+s*(tw/2+.08);
  if(u==='hago'||u==='tase'){ const r=.29, c=[zr+1.05,zf-1.2];
    for(const cc of c){ for(const d of [-.33,.33]) dWheel(root,x,r+.03,cc+d,r,mat,{rim:.74}); const b=box(root,.08,.1,.75,x+s*(tw/2+.04),r+.05,cc,darkMat); }
    spring(root,so,r+.2,(c[0]+c[1])/2,c[1]-c[0]-.5);                                                          // resorte horizontal entre los dos bogies
    for(let k=0;k<2;k++) dWheel(root,x,I.trF-.06,zr+1.1+k*(zf-zr-2.3),.08,mat,{rim:.7});
    sprocketT(root,x,I.trF*.62,zf-.3,.26,12,mat); dWheel(root,x,.3,zr+.32,.26,mat,{rim:.75}); return; }   // tensora baja atrás
  const r=.27, z0=zr+.95, z1=zf-1.05, zs=[z0,z0+(z1-z0)*.33-.2,z0+(z1-z0)*.33+.2,z0+(z1-z0)*.67-.2,z0+(z1-z0)*.67+.2,z1];
  for(const z of zs) dWheel(root,x,r+.03,z,r,mat,{rim:.74});
  for(const k of [0,1]) spring(root,so,r+.22,k?(zs[3]+zs[5])/2+.1:(zs[0]+zs[2])/2-.1,(z1-z0)*.36);
  for(let k=0;k<(I.ret||3);k++) dWheel(root,x,I.trF-.06,z0+(z1-z0)*(k+.5)/(I.ret||3),.09,mat,{rim:.7});
  sprocketT(root,x,I.trF*.62,zf-.32,.28,12,mat); dWheel(root,x,I.trR*.6,zr+.32,.26,mat,{rim:.75}); }
function jpHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const u=I.jp, hw=M.W/2, ft=hw-I.trW/2, fy=Math.max(I.trF,I.trR)+.06, riv=u==='hago'||u==='chiha'||u==='tase';
  if(riv) for(const sx of [-1,1]){ rivetsRow(root,sx*(hw-.005),deck-.1,zr+.3,zf-gz,12); rivetsRow(root,sx*(hw-.005),deck-.45,zr+.3,zf-gz*.6,11); }
  { const p=glacisPt(I,deck,gz,zf,.25,.06), v=rbox(root,.4,.16,.12,u==='hago'?iw2*.22:-iw2*.22,p.y,p.z,mat,.03); v.rotation.x=p.a; box(v,.26,.025,.03,0,.02,.07,darkMat); }   // visor del conductor
  if(u==='hago'){ rbox(root,.6,.32,.5,iw2*.22,deck+.1,zf-gz-.2,mat,.06); }                                // cabina del conductor que sobresale (Ha-Go)
  { const p=glacisPt(I,deck,gz,zf,.08,.08); cyl(root,.07,.07,.1,-iw2*.4,p.y+.05,p.z,8,darkMat).rotation.x=Math.PI/2; }   // faro
  for(const sx of [-1,1]){ const q=glacisPt(I,deck,gz,zf,.96,.05), k=new THREE.Mesh(_tgShackle,darkMat); k.scale.setScalar(.7); k.position.set(sx*iw2*.35,q.y,q.z); k.rotation.y=Math.PI/2; root.add(k); }
  { const ex=cyl(root,.09,.09,L*.42,hw-.1,fy+.12,zr+L*.28,10,darkMat); ex.rotation.x=Math.PI/2; box(root,.24,.04,L*.44,hw-.1,fy+.24,zr+L*.28,mat); }   // silenciador largo sobre el guardabarros derecho
  box(root,iw2*.6,.03,.8,0,deck+.03,zr+L*.18,darkMat); for(let i=0;i<4;i++) box(root,iw2*.6,.04,.04,0,deck+.05,zr+L*.18-.3+i*.2,mat);
  { const c=cyl(root,.03,.03,L*.5,-(hw-.02),deck-.15,0,6,darkMat); c.rotation.x=Math.PI/2; box(root,.07,.07,1.1,-(hw-.12),deck+.04,-.1,_wdMat); }
  if(u!=='hago'&&u!=='tase') for(const sx of [-1,1]) rbox(root,I.trW*.7,.25,.6,sx*ft*.98,fy+.12,zf-1.2,mat,.03); }
function jpTurret(tur,G,M,I,mat,gy){ const u=I.jp, hw=M.tw/2, hl=M.tl/2, th=M.th;
  if(u==='tase'){ rbox(G.gp,.75,.6,.05,0,.15,.05,mat,.02); return; }                                         // escudo del 20 mm
  if(u==='hago'||u==='chiha') for(const sx of [-1,1]) rivetsRow(tur,sx*(hw*.97),th*.5,-hl*.6,hl*.6,6);
  for(const sx of [-1,1]) box(tur,.04,.07,.15,sx*(hw*.97),th*.6,hl*.4,darkMat);
  // antena en herradura alrededor de la torre (Chi-Ha, Chi-He)
  if(u==='chiha'||u==='chihe'){ const g=new THREE.TorusGeometry(hw+.22,.015,4,24,Math.PI*1.3), a=new THREE.Mesh(g,darkMat); a.rotation.x=Math.PI/2; a.rotation.z=Math.PI*.85; a.position.set(0,th*.75,-hl*.1); tur.add(a);
    for(const ang of [.3,1.6,2.9]) cyl(tur,.012,.012,.25,Math.cos(Math.PI*.85+ang)*(hw+.15),th*.65,-hl*.1-Math.sin(Math.PI*.85+ang)*(hw+.15),4,darkMat); }
  { const b=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),mat); b.position.set(hw*.5,th*.5,-hl+.02); tur.add(b); cyl(tur,.02,.02,.3,hw*.5,th*.5,-hl-.12,6,darkMat).rotation.x=Math.PI/2; }   // ametralladora trasera de la torre
  if(u==='hago'){ rbox(G.gp,.35,.28,.16,0,0,.05,mat,.05); return; }
  if(u==='chinu'){ rbox(G.gp,.75,.55,.3,0,0,.1,mat,.05); rbox(tur,.9,th*.65,.06,0,th*.45,-hl-.02,mat,.03); box(tur,.12,.07,.1,hw*.35,th+.05,hl*.3,darkMat); return; }   // Chi-Nu: puerta trasera grande
  rbox(G.gp,.5,.38,.22,0,0,.08,mat,.05); }
DET.jp={gear:jpGear,hull:jpHull,tur:jpTurret};

function frGear(root,I,x,s,tw,zf,zr,mat){ const u=I.fr, so=x+s*(tw/2+.08);
  if(u==='h39'){ const z0=zr+1.0, z1=zf-1.05;
    for(let b=0;b<3;b++){ const c=z0+(z1-z0)*b/2; for(const d of [-.24,.24]) dWheel(root,x,.25,c+d,.22,mat,{rim:.72});
      for(const d of [-1,1]){ const a=box(root,.07,.06,.4,x+s*(tw/2+.04),.4,c+d*.12,darkMat); a.rotation.x=d*.7; } spring(root,so,.6,c,.45,.05); }   // tijera con resorte horizontal
    for(let k=0;k<2;k++) dWheel(root,x,I.trF-.06,zr+1.3+k*(zf-zr-2.6),.09,mat,{rim:.7});
    sprocketT(root,x,I.trF*.62,zf-.3,.27,13,mat); dWheel(root,x,I.trR*.62,zr+.3,.25,mat,{rim:.75}); return; }
  if(u==='s35'){ const z0=zr+.85, z1=zf-1.05; for(let i=0;i<9;i++) dWheel(root,x,.22,z0+(z1-z0)*i/8,.19,mat,{rim:.72});
    sprocketT(root,x,I.trR*.62,zr+.34,.3,14,mat); dWheel(root,x,I.trF*.62,zf-.34,.28,mat,{rim:.75}); return; }
  // B1 bis: 16 ruedas chicas en 3 bogies grandes con resortes, tapadas por el faldón (se ven abajo)
  for(let i=0;i<14;i++) dWheel(root,x,.2,zr+.85+i*(zf-zr-1.7)/13,.16,mat,{rim:.7});
  sprocketT(root,x,I.trR*.75,zr+.38,.4,16,mat); dWheel(root,x,I.trF*.75,zf-.4,.36,mat,{rim:.75}); }
function frHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const u=I.fr, hw=M.W/2, ft=hw-I.trW/2, fy=Math.max(I.trF,I.trR)+.06;
  if(u==='b1'){ for(const sx of [-1,1]){ for(let k=0;k<5;k++) box(root,.05,.3,.36,sx*(hw+.005),I.trH*.45,zr+1.0+k*(L-2)/4,darkMat);   // bocas para el barro del faldón
      box(root,.04,.04,L-1.2,sx*(hw+.01),I.trH*.75,0,darkMat); }
    { const d=rbox(root,.05,.65,.55,hw+.02,deck-.55,.3,mat,.03); cyl(root,.03,.03,.05,hw+.05,deck-.55,.1,6,darkMat).rotation.z=Math.PI/2; }   // puerta del costado derecho
    { const p=glacisPt(I,deck,gz,zf,.55,.0), m=rbox(root,.42,.42,.35,iw2*.28,p.y-.25,zf-.1,mat,.06), b=cyl(root,.08,.08,.9,iw2*.28,p.y-.25,zf+.35,10,darkMat); b.rotation.x=Math.PI/2; }   // obús de 75 mm en el casco
    { const p=glacisPt(I,deck,gz,zf,.25,.05), v=rbox(root,.5,.3,.25,-iw2*.2,p.y+.05,p.z,mat,.04); box(v,.3,.03,.03,0,.06,.13,darkMat); }   // puesto del conductor
    box(root,iw2*.7,.03,1.1,0,deck+.03,zr+L*.2,darkMat); for(let i=0;i<6;i++) box(root,iw2*.7,.04,.04,0,deck+.05,zr+L*.2-.45+i*.18,mat);   // rejillas del motor
    box(root,.6,.04,.04,-hw*.45,deck+.06,zr+.15,darkMat); return; }
  // H39 y S35: cascos fundidos de cantos redondeados
  { const p=glacisPt(I,deck,gz,zf,.3,.06), v=rbox(root,.45,.16,.14,-iw2*.2,p.y,p.z,mat,.05); v.rotation.x=p.a; box(v,.3,.025,.03,0,.02,.08,darkMat); }
  for(const sx of [-1,1]){ const p=glacisPt(I,deck,gz,zf,.08,.08); cyl(root,.065,.065,.1,sx*iw2*.42,p.y+.05,p.z,8,darkMat).rotation.x=Math.PI/2; }
  if(u==='s35') for(const sx of [-1,1]){ for(let k=0;k<4;k++) box(root,.05,.18,.3,sx*(hw-.02+.08),I.trH*.62,zr+1.1+k*(L-2.2)/3,darkMat); }   // bocas del faldón
  { const c=cyl(root,.03,.03,L*.5,hw-.02,deck-.15,0,6,darkMat); c.rotation.x=Math.PI/2; box(root,.07,.07,1.0,-(hw-.08),deck+.04,0,_wdMat); }
  { const m=cyl(root,.12,.12,.55,0,deck-.35,zr-.12,10,darkMat); m.rotation.z=Math.PI/2; }                   // silenciador atrás
  if(u==='h39') box(root,.08,.6,.08,-iw2*.3,deck+.25,zr+.1,darkMat);                                          // cola para cruzar trincheras (algunos H39)
  box(root,iw2*.6,.03,.8,0,deck+.03,zr+L*.18,darkMat); }
function frTurret(tur,G,M,I,mat,gy){ const u=I.fr, hw=M.tw/2, hl=M.tl/2, th=M.th;
  // torre APX (H39, S35, B1 bis): fundida, con la cúpula PPL y la puerta trasera que el comandante bajaba para sentarse
  rbox(G.gp,.42,.34,.2,0,0,.06,mat,.06); cyl(G.gp,.028,.028,.3,.17,-.03,.26,6,darkMat).rotation.x=Math.PI/2;
  rbox(tur,.55,th*.6,.06,0,th*.42,-hl-.01,mat,.03); for(const sx of [-1,1]) box(tur,.04,.07,.15,sx*(hw*.95),th*.55,hl*.3,darkMat);
  if(u==='b1') cyl(tur,.012,.012,1.4,hw*.6,th+.7,-hl*.5,4,darkMat); }
DET.fr={gear:frGear,hull:frHull,tur:frTurret};

function cnGear(root,I,x,s,tw,zf,zr,mat){ for(const c of [zr+1.3,zf-1.3]){ for(const pc of [-.3,.3]){ for(const d of [-.15,.15]) dWheel(root,x,.19,c+pc+d,.15,mat,{rim:.7});
      rbox(root,.1,.16,.5,x+s*(tw/2+.04),.27,c+pc,darkMat,.03); } leaf(root,x+s*(tw/2+.07),.5,c,1.05); }     // Vickers: bogies dobles con ballesta
  for(let k=0;k<4;k++) dWheel(root,x,I.trF-.06,zr+.9+k*(zf-zr-1.8)/3,.09,mat,{rim:.7});
  sprocketT(root,x,I.trF*.62,zf-.3,.26,12,mat); dWheel(root,x,I.trR*.62,zr+.3,.25,mat,{rim:.75}); }
function cnHull(root,M,I,mat,iw2,deck,gz,zf,zr,L){ const hw=M.W/2;
  for(const sx of [-1,1]){ rivetsRow(root,sx*(hw-.005),deck-.1,zr+.3,zf-gz,12); rivetsRow(root,sx*(hw-.005),deck-.42,zr+.3,zf-gz*.6,11); }
  { const p=glacisPt(I,deck,gz,zf,.3,.06), v=rbox(root,.42,.18,.14,iw2*.22,p.y,p.z,mat,.03); v.rotation.x=p.a; box(v,.28,.025,.03,0,.02,.08,darkMat); }
  { const p=glacisPt(I,deck,gz,zf,.08,.08); cyl(root,.07,.07,.1,-iw2*.4,p.y+.05,p.z,8,darkMat).rotation.x=Math.PI/2; }
  box(root,iw2*.65,.03,.9,0,deck+.03,zr+L*.2,darkMat); for(let i=0;i<5;i++) box(root,iw2*.65,.04,.04,0,deck+.05,zr+L*.2-.36+i*.18,mat);   // rejilla del motor Armstrong Siddeley
  { const m=cyl(root,.11,.11,.6,-iw2*.2,deck-.3,zr-.12,10,darkMat); m.rotation.z=Math.PI/2; } }
function cnTurret(tur,G,M,I,mat,gy){ const hw=M.tw/2, hl=M.tl/2, th=M.th;
  rbox(G.gp,.42,.32,.18,0,0,.06,mat,.05); cyl(G.gp,.03,.03,.32,.17,-.02,.26,6,darkMat).rotation.x=Math.PI/2;
  for(const sx of [-1,1]) rivetsRow(tur,sx*(hw*.97),th*.5,-hl*.6,hl*.6,6); cyl(tur,.22,.22,.05,-hw*.25,th+.02,-hl*.1,12,mat); }
DET.cn={gear:cnGear,hull:cnHull,tur:cnTurret};

/* ---------- Ametralladoras (pedido de Sebastián: la del casco quedaba en el aire y todas tienen que tirar) ----------
   placeBowMG: tira un rayo desde adelante contra el casco (solo las piezas grandes, sin orugas) y pone la rótula y el caño
   justo sobre el blindaje, a 40 % de la altura del frente. Deja t.bowMG (apunta adelante) y t.bowMuz (boca).
   mgMuzzle: boca de una ametralladora montada (antiaérea, .50, DShK) para que dispare con la coaxial (realismo.js, extraMG). */
const _bmgBall=new THREE.SphereGeometry(.11,10,8), shTurMG={t:null};
function mgMuzzle(parent,x,y,z){ const o=new THREE.Object3D(); o.position.set(x,y,z); parent.add(o); return o; }
function placeBowMG(t,root,I,mat,deck,zf){
  root.updateMatrixWorld(true);
  const big=root.children.filter(o=>{ if(!o.isMesh||!o.visible||Array.isArray(o.material)||o.material===darkMat||!o.geometry) return false;
    if(!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); return o.geometry.boundingSphere.radius>1; });
  const y=deck-Math.max(.15,((I.sideH??.6)-.1)*.4), rc=new THREE.Raycaster(new THREE.Vector3(I.bmg,y,zf+4),new THREE.Vector3(0,0,-1),0,10);
  const h=rc.intersectObjects(big,false)[0]; if(!h) return;
  const g=new THREE.Group(); g.position.copy(h.point); root.add(g);
  const n=h.face.normal.clone().transformDirection(h.object.matrixWorld); g.position.addScaledVector(n,-.03);
  const b=new THREE.Mesh(_bmgBall,mat); b.scale.set(1,1,.75); g.add(b); b.castShadow=true;
  const c=cyl(g,.022,.022,.42,0,.01,.28,6,darkMat); c.rotation.x=Math.PI/2; cyl(g,.035,.035,.08,0,.01,.1,8,darkMat).rotation.x=Math.PI/2;
  t.bowMG=g; t.bowMuz=mgMuzzle(g,0,.01,.5); }
