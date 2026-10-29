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

function buildW2(t,M,mat,root,lkL,lkR){
  const I=M.w2, L=M.L, hw=M.W/2, tw=I.trW, tx=hw-tw/2-(I.cover?.06:0), H=I.trH, zf=L/2, zr=-L/2;
  // ---- tren de rodaje ----
  const prof=I.chur
    ? [[zf-.3,H],[zr+.3,H],[zr,H*.75],[zr+.3,.12],[zr+.7,0],[zf-.7,0],[zf-.25,.12],[zf,H*.75]]   // Churchill/Matilda: oruga alta que rodea el casco
    : [[zf-.25,I.trF],[zr+.3,I.trR],[zr,I.trR*.62],[zr+.35,.15],[zr+.75,0],[zf-.75,0],[zf-.3,.18],[zf,I.trF*.62]];
  const nW=I.nW, wR=I.wR, span=L-(I.chr?1.1:1.55);
  for(const s of [-1,1]){ const x=s*tx;
    trackLoop(root,prof,tw,x,s>0?lkR:lkL,sideTrkMat,.08);
    if(I.nose==='sher') shermanGear(root,I,x,s,tw,zf,zr,mat);                                           // Sherman: bogies VVSS/HVSS, motriz adelante
    else if(I.tiger) tigerGear(root,I,x,s,tw,zf,zr,mat);                                                   // Tiger: ruedas intercaladas en capas, motriz adelante
    else {
    for(let i=0;i<nW;i++){ const z=-span/2+i*span/Math.max(1,nW-1), dx=I.inter?(i%2?-.12:.1):0;          // intercaladas: dos filas
      wheel(root,x+s*(.02+dx),wR+.03,z,wR); }
    if(I.bog) for(let i=0;i<Math.ceil(nW/2);i++){ const z=-span/2+(i*2+.5)*span/Math.max(1,nW-1); rbox(root,.1,wR*1.2,wR*2.4,x+s*(tw/2+.04),wR*1.2,z,darkMat,.03); }
    for(let i=0;i<(I.ret||0);i++){ const z=-span*.36+i*span*.72/Math.max(1,I.ret-1); wheel(root,x,(I.trF+I.trR)/2-.12,z,.09); }
    wheel(root,x,I.trR*.62,zr+.36,.26); wheel(root,x,I.trF*.62,zf-.33,.25); }                              // motriz y tensora
    if(I.skirt) profMesh(root,[[zf-.55,H*I.skirt+.08],[zr+.45,H*I.skirt+.08],[zr+.5,H*.28],[zf-.6,H*.28]],.05,x+s*(tw/2+.06),t.mud||mat); // faldón
    if(I.schurz) for(let k=0;k<5;k++){ const z=zr+.8+k*(L-1.6)/5; box(root,.04,.62,(L-1.6)/5-.06,x+s*(tw/2+.16),I.deck-.2,z+(L-1.6)/10,mat); } // Schürzen (planchas sueltas)
    if(I.chur) profMesh(root,[[zf-.35,H+.06],[zr+.35,H+.06],[zr+.1,H*.8],[zf-.1,H*.8]],tw+.08,x,mat);        // techo de la oruga envuelta
    else box(root,tw+.08,.04,L-.25,x,Math.max(I.trF,I.trR)+.04,-.04,t.mud||mat);                          // guardabarros
  }
  // ---- casco ----
  const iw2=I.cover?M.W-tw*2-.1:M.W-tw*2+.04, deck=I.deck, gz=I.glacis, low=I.lowF??.35, rz=I.rearS??.25;
  // cuerpo entre las orugas (perfil: frente inclinado, popa)
  profMesh(root,[[zf-gz,deck],[zr+rz,deck],[zr,deck-rz*.9],[zr,.38],[zf-.55,.3],[zf,low+.18],[zf,low+.3]],iw2,0,mat);
  // parte alta que sobresale sobre las orugas (con los costados inclinados si corresponde)
  { const top=I.cover?M.W-.1:M.W-.02, yb=deck-(I.sideH??.6);
    const g=I.castHull?castHullGeo(zf,zr,deck,yb,top,gz,rz,I.slope||0):profGeo([[zf-gz+.02,deck],[zr+rz,deck],[zr+rz*.4,yb+.05],[zr+.1,yb],[zf-gz*.15,yb],[zf-gz*.05,yb+.1]],top);
    if(I.slope&&!I.castHull) slopeX(g,yb,deck,I.slope);
    const m=new THREE.Mesh(g,mat); m.castShadow=m.receiveShadow=true; root.add(m); }
  if(I.nose==='sher'){ const n=cyl(root,.42,.42,iw2*.95,0,.62,zf-.25,16,mat); n.rotation.z=Math.PI/2; shermanHull(root,M,I,mat,iw2,deck,gz,zf,zr,L); } // trompa redonda del Sherman y sus detalles
  if(I.tiger) tigerHull(root,M,I,mat,iw2,deck,gz,zf,zr,L);
  // casamata (StuG, M10 no: torre abierta) y detalles
  if(I.case){ const C=I.case; prism(root,[[-C.w/2,C.l/2],[C.w/2,C.l/2],[C.w/2,-C.l/2],[-C.w/2,-C.l/2]],C.h,C.taper||.15,0,deck-.02,C.z,mat); }
  box(root,iw2*.62,.05,L*.22,0,deck+.03,zr+L*.16,darkMat);                                                   // rejilla del motor
  for(let i=0;i<2;i++) rbox(root,.32,.06,.42,(i?-1:1)*iw2*.22,deck+.04,zf-gz-.45,mat,.02);                   // escotillas del conductor y radio
  if(I.bmg){ const b=cyl(root,.08,.09,.18,I.bmg,deck-gz*.35,zf-gz*.45+.12,8,mat); b.rotation.x=Math.PI/2.4; cyl(root,.02,.02,.4,I.bmg,deck-gz*.32,zf-gz*.45+.32,6,darkMat).rotation.x=Math.PI/2.4; } // ametralladora de casco
  for(const sx of [-1,1]){ const ex=cyl(root,.08,.09,.42,sx*iw2*.3,deck-.2,zr+.02,8,darkMat); ex.rotation.x=Math.PI/2; }   // escapes
  if(I.tanks) for(const sx of [-1,1]) cyl(root,.2,.2,.9,sx*(M.W/2-.2),deck+.18,zr+.7,10,mat).rotation.x=Math.PI/2;           // tanques de combustible externos (T-34)
  box(root,.12,.12,1.1,(M.W/2-.25),deck+.06,zr+L*.42,darkMat); box(root,.08,.08,1.4,-(M.W/2-.25),deck+.05,zr+L*.45,_wdMat); // herramientas: gato y pala
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
  if(I.mant==='round'){ const m=cyl(G.gp,M.gr*4.2,M.gr*4.2,.35,0,0,.12,12,mat); m.rotation.x=Math.PI/2; }
  else if(shCast(I)) shermanTurret(tur,G,M,I,mat,gy);
  else if(I.tur==='tiger') tigerTurret(tur,G,M,I,mat,gy);                                                       // mantelete con la mira binocular, cajón, lanzahumos                                   // mantelete M34A1, escotillas, .50
  else if(I.mant!=='none'){ const mw=I.mantW||Math.max(.6,M.tw*.42); rbox(G.gp,mw,Math.max(.32,M.gr*7),.28,0,0,.08,mat,.06); }
  // freno de boca
  if(I.mb){ const b=cyl(G.barrel,M.gr*2.1,M.gr*2.1,.32,0,0,M.gl-.04,10,darkMat); b.rotation.x=Math.PI/2; if(I.mb===2){ const b2=cyl(G.barrel,M.gr*2.1,M.gr*2.1,.14,0,0,M.gl-.36,10,darkMat); b2.rotation.x=Math.PI/2; } }
  if(I.sleeve){ const s=cyl(G.barrel,M.gr*1.6,M.gr*1.6,M.gl*.32,0,0,M.gl*.16+.12,10,mat); s.rotation.x=Math.PI/2; }        // manguito del tubo (Pz IV, Sherman 76)
  if(I.coax!==0){ const c=cyl(G.gp,.025,.025,.45,.24,-.04,.32,6,darkMat); c.rotation.x=Math.PI/2; }
  if(I.aaN){ const n=I.aaN, sp=I.aaSp||.22;                                                                 // antiaéreo: tubos extra (dobles o cuádruples) que suben con el cañón
    for(let i=0;i<n;i++){ const col=n===4?(i%2?1:-1):(n===2?(i?1:-1):0), row=n===4?(i<2?1:-1):0; const x=col*sp, y=row*sp*.7, z=(row>0?.12:0);
      if(i===0&&n!==2&&n!==4) continue; const b=cyl(G.barrel,M.gr,M.gr,M.gl,x,y,M.gl/2+z,8,darkMat); b.rotation.x=Math.PI/2;
      const fh=cyl(G.barrel,M.gr*1.7,M.gr*1.3,.3,x,y,M.gl+z-.1,8,darkMat); fh.rotation.x=Math.PI/2; }
    if(n===2||n===4) G.bm.visible=false; box(G.gp,sp*2.4,sp*(n===4?2.2:1.2),.5,0,0,-.05,mat); }
  if(I.aa&&!shCast(I)) { cyl(tur,.03,.03,.3,M.tw*.25,M.th+.12,-M.tl*.2,6,darkMat); const a=cyl(tur,.022,.022,.85,M.tw*.25,M.th+.3,-M.tl*.2+.3,6,darkMat); a.rotation.x=Math.PI/2.15; } // ametralladora antiaérea sobre su soporte
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
  { const ax=M.tw*.22, az=I.tur==='t23'?-M.tl*.42:-M.tl*.2;                                                          // en la T23 la .50 va atrás cyl(tur,.03,.03,.38,ax,ty+.18,az,6,darkMat); box(tur,.1,.12,.32,ax,ty+.42,az+.05,darkMat);
    const b=cyl(tur,.03,.03,.95,ax,ty+.44,az+.65,6,darkMat); b.rotation.x=Math.PI/2; box(tur,.12,.14,.24,ax+.14,ty+.38,az,_shGreenBox); }
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
