/* ---------- Modelos hechos por código de Entreguerras (1919–1938) ----------
   Un constructor para todos (buildIW), con piezas que cambian según M.iw: tren de rodaje (bogies chicos, ruedas grandes Christie,
   rodillos de retorno, faldones), casco con glacis y cubierta, torre (biselada, cilíndrica, fundida u octogonal), cúpula,
   torrecitas de ametralladora, cañón de casco (Char B1), segunda torre (M2A2) e insignias de cada nación.
   Deja en el tanque lo mismo que los de la 1ª Guerra (turret, gunPivot, barrel, muzzle, coax, colliders, hTop, topH, aimH, seatPos). */
_helmM.ssh=new THREE.MeshLambertMaterial({color:0x56603e}); // casco soviético SSh-36 (usa la forma alemana, más ancha)
const _starMat=new THREE.MeshLambertMaterial({color:0xb02a20}), _blueMat=new THREE.MeshLambertMaterial({color:0x2c4a8a});
function iwInsignia(parent,kind,x,y,z,ry,s=1){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; parent.add(g);
  if(kind==='ru'){ const sh=new THREE.Shape(); for(let i=0;i<10;i++){ const a=i/10*Math.PI*2-Math.PI/2, r=(i%2?.11:.27)*s; i?sh.lineTo(Math.cos(a)*r,-Math.sin(a)*r):sh.moveTo(Math.cos(a)*r,-Math.sin(a)*r); }
    const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),_starMat); m.rotation.y=Math.PI/2; g.add(m); }
  else if(kind==='de'){ box(g,.02,.5*s,.12*s,0,0,0,_wMat); box(g,.02,.12*s,.5*s,0,0,0,_wMat); }
  else if(kind==='fr'){ const c=(r,m,o)=>{ const d=new THREE.Mesh(new THREE.CircleGeometry(r*s,16),m); d.rotation.y=Math.PI/2; d.position.x=o; g.add(d); };
    c(.24,_rMat,0); c(.16,_wMat,.004); c(.08,_blueMat,.008); }
  else if(kind==='us'){ const sh=new THREE.Shape(); for(let i=0;i<10;i++){ const a=i/10*Math.PI*2-Math.PI/2, r=(i%2?.09:.22)*s; i?sh.lineTo(Math.cos(a)*r,-Math.sin(a)*r):sh.moveTo(Math.cos(a)*r,-Math.sin(a)*r); }
    const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),_wMat); m.rotation.y=Math.PI/2; g.add(m); }
  else if(kind==='uk') wrw(g,0,0,0,0,.42*s);
  return g; }
// Torre según la forma: devuelve la altura donde va el cañón
function iwTurretShape(tur,M,I,mat){ const w=M.tw, l=M.tl, h=M.th;
  if(I.tur==='cyl'){ const c=cyl(tur,w/2*.98,w/2,h,0,h/2,0,14,mat); c.scale.z=l/w*.8; if(I.bus){ const b=rbox(tur,w*.62,h*.78,l*.38,0,h*.42,-l*.42,mat,.05); }
    for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; cyl(tur,.02,.02,.03,Math.sin(a)*w/2,h*.85,Math.cos(a)*w/2*l/w*.8,4,darkMat); } }
  else if(I.tur==='cast'){ // fundida y redondeada (R35, S35, B1)
    const c=cyl(tur,w/2*.82,w/2,h*.9,0,h*.45,0,14,mat); c.scale.z=l/w; const d=new THREE.Mesh(new THREE.SphereGeometry(w/2*.82,14,6,0,Math.PI*2,0,Math.PI/2),mat); d.scale.set(1,.25,l/w); d.position.y=h*.9; d.castShadow=true; tur.add(d); }
  else if(I.tur==='oct'){ const c=cyl(tur,w/2*.86,w/2,h,0,h/2,0,8,mat); c.rotation.y=Math.PI/8; c.scale.z=l/w; }
  else { // biselada: caja con los costados inclinados (Vickers, Panzer)
    const hw=w/2, hl=l/2, sh=new THREE.Shape(), P=[[-hw*.8,hl],[hw*.8,hl],[hw,hl*.45],[hw,-hl*.9],[hw*.85,-hl],[-hw*.85,-hl],[-hw,-hl*.9],[-hw,hl*.45]];
    P.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z)); sh.closePath();
    const g=new THREE.ExtrudeGeometry(sh,{depth:h-.1,bevelEnabled:true,bevelThickness:.05,bevelSize:.06,bevelSegments:1}); g.rotateX(-Math.PI/2); g.translate(0,.05,0);
    const m=new THREE.Mesh(g,mat); m.scale.set(1,1,1); m.castShadow=m.receiveShadow=true; tur.add(m);
    if(I.bus) rbox(tur,w*.7,h*.75,.55,0,h*.45,-hl-.2,mat,.05);
    rivetsRow(tur,hw+.01,h*.8,-hl*.8,hl*.3,6); rivetsRow(tur,-hw-.01,h*.8,-hl*.8,hl*.3,6); }
  return h*.5; }
// Constructor principal de Entreguerras
function buildIW(t,M,mat,root,lkL,lkR){
  const I=M.iw, L=M.L, hw=M.W/2, tw=I.trW, tx=hw-tw/2, H=I.trH, zf=L/2, zr=-L/2;
  // ---- tren de rodaje: oruga cerrada, ruedas de camino, rodillos de retorno ----
  const prof=I.rhombo
    ? [[zf-.35,H],[zr+.4,H],[zr,H*.8],[zr+.25,H*.25],[zr+.9,0],[zf-.9,0],[zf-.15,H*.35],[zf,H*.8]]
    : [[zf-.25,I.trF],[zr+.3,I.trR],[zr,I.trR*.65],[zr+.35,.15],[zr+.75,0],[zf-.75,0],[zf-.3,.18],[zf,I.trF*.62]];
  const nW=I.nW, wR=I.wR, span=L-(I.chr?1.0:1.5);
  for(const s of [-1,1]){ const x=s*tx;
    trackLoop(root,prof,tw,x,s>0?lkR:lkL,sideTrkMat,.07);
    for(let i=0;i<nW;i++){ const z=-span/2+i*span/Math.max(1,nW-1); wheel(root,x+s*.02,wR+.02,z,wR); }
    if(I.bog&&!I.chr) for(let i=0;i<Math.ceil(nW/2);i++){ const z=-span/2+(i*2+.5)*span/Math.max(1,nW-1); box(root,.08,wR*1.1,wR*3.4,x+s*(tw/2+.03),wR*1.15,z,darkMat); }
    for(let i=0;i<(I.ret||0);i++){ const z=-span*.38+i*span*.76/Math.max(1,I.ret-1); wheel(root,x,(I.trF+I.trR)/2-.13,z,.08); }
    wheel(root,x,I.trR*.66,zr+.35,.24); wheel(root,x,I.trF*.62,zf-.32,.22);         // rueda motriz y tensora
    if(I.skirt) profMesh(root,[[zf-.5,H*I.skirt+.05],[zr+.5,H*I.skirt+.05],[zr+.6,H*.18],[zf-.6,H*.18]],.05,x+s*(tw/2+.04),t.mud||mat);
    box(root,tw+.06,.04,L-.3,x,Math.max(I.trF,I.trR)+.03,-.05,mat);                // guardabarros
  }
  // ---- casco: cuerpo entre las orugas, cubierta, glacis inclinado y caja del motor ----
  const iw2=M.W-tw*2+.04, deck=I.deck, gz=I.glacis, nose=I.nose?.5:0;
  profMesh(root,[[zf-gz,deck],[zr+.05,deck],[zr,deck-.25],[zr,.35],[zf-.5,.32],[zf+nose*.3,.55],[zf,deck-.42]],iw2,0,mat);
  profMesh(root,[[zf-gz+.02,deck],[zr+.15,deck],[zr+.1,deck-.15],[zf-gz-.05,deck-.15]],M.W-.04,0,mat); // sobresale encima de las orugas
  if(I.eng!=='side') box(root,iw2*.7,.05,L*.25,0,deck+.03,zr+L*.17,darkMat);         // rejilla del motor
  else box(root,iw2*.35,.05,L*.3,-iw2*.25,deck+.03,zf-gz-L*.2,darkMat);
  for(const sx of [-1,1]){ const ex=cyl(root,.07,.08,.45,sx*iw2*.28,deck-.15,zr-.05,8,darkMat); ex.rotation.x=Math.PI/2; }
  slits(root,2,-iw2*.22,deck-.12,zf-gz*.55,0,.15);
  rivetsRow(root,iw2/2+.01,deck-.08,zr+.3,zf-gz,10); rivetsRow(root,-iw2/2-.01,deck-.08,zr+.3,zf-gz,10);
  if(I.rail) for(const sx of [-1,1]) box(root,.04,.04,L*.55,sx*(iw2/2-.05),deck+.35,M.tz-.2,darkMat); // antena de baranda (T-26, T-28)
  if(I.ins) for(const sx of [-1,1]) iwInsignia(root,I.ins,sx*(iw2/2+.02),deck-.4,zr+L*.3,sx>0?0:Math.PI,.9);
  // ---- torre ----
  const tur=new THREE.Group(); tur.position.set(I.tx||0,deck,M.tz); root.add(tur);
  const gy=iwTurretShape(tur,M,I,mat);
  if(I.cup){ cyl(tur,.26,.28,.28,-M.tw*.18,M.th+.13,-M.tl*.2,10,mat); slits(tur,3,-M.tw*.18,M.th+.18,-M.tl*.2+.27,0,.08); }
  else { const ht=box(tur,.45,.05,.45,-M.tw*.15,M.th+.03,-M.tl*.15,mat); }
  slits(tur,1,M.tw/2,gy+.1,0,Math.PI/2,.15); slits(tur,1,-M.tw/2,gy+.1,0,Math.PI/2,.15);
  if(I.ins&&I.ins!=='uk') for(const sx of [-1,1]) iwInsignia(tur,I.ins,sx*(M.tw/2+.01),gy,-.1,sx>0?0:Math.PI,.7);
  const G=gunMount(t,tur,0,gy,M.tl/2-.05,M.gl,M.gr,mat,{shR:Math.max(.15,M.gr*3.2)});
  if(I.twin){ const b2=cyl(G.barrel,M.gr,M.gr,M.gl,.18,0,M.gl/2+.12,8,darkMat); b2.rotation.x=Math.PI/2; }      // Panzer I: dos ametralladoras
  if(I.coax){ const c=cyl(G.gp,.025,.025,.5,.22,-.05,.3,6,darkMat); c.rotation.x=Math.PI/2; }
  t.turret=tur; t.gunPivot=G.gp; t.barrel=G.barrel; t.muzzle=G.muzzle; t.coax=G.coax; t.barrelMesh=G.bm;
  collider(tur,M.tw,M.th,M.tl,0,M.th/2,0,t,'turret'); collider(root,M.W-.1,deck-.25,L,0,(deck+.25)/2,0,t,'hull');
  // segunda torre del M2A2 (decorativa, con su ametralladora)
  if(I.twinT){ const t2=new THREE.Group(); t2.position.set(-(I.tx||0),deck,M.tz); root.add(t2); iwTurretShape(t2,M,I,mat);
    const b=cyl(t2,.03,.03,.8,0,M.th*.5,M.tl/2+.35,6,darkMat); b.rotation.x=Math.PI/2; }
  // torrecitas de ametralladora adelante (A9, T-28)
  for(const S of I.sub||[]){ const r=S.r||.34, st=new THREE.Group(); st.position.set(S.x,deck,S.z); root.add(st);
    cyl(st,r*.9,r,.45,0,.22,0,10,mat); const d=new THREE.Mesh(new THREE.SphereGeometry(r*.9,10,5,0,Math.PI*2,0,Math.PI/2),mat); d.scale.y=.4; d.position.y=.45; st.add(d);
    const b=cyl(st,.025,.03,.5,0,.25,r+.22,6,darkMat); b.rotation.x=Math.PI/2; st.rotation.y=S.x>0?-.25:.25; }
  // ametralladora de casco del Vickers Medium (costados)
  for(const S of I.mgs||[]){ const b=cyl(root,.03,.03,.45,S.x>0?iw2/2+.15:-iw2/2-.15,deck-.35,S.z,6,darkMat); b.rotation.z=Math.PI/2; }
  // obús de 75 mm en el casco del Char B1: se ve en el frente, a la derecha
  if(I.hg){ const hg=I.hg, b=cyl(root,hg.gr*.9,hg.gr*1.1,hg.gl,hg.x,deck-.55,zf+hg.gl/2-.25,10,darkMat); b.rotation.x=Math.PI/2; rbox(root,.45,.45,.3,hg.x,deck-.55,zf-.22,mat,.05); }
  const hTop=deck+M.th;
  t.hTop=deck; t.topH=hTop+(I.cup?.4:.15); t.aimH=deck*.7; t.glL=gz;
  const tp=(x,y,z)=>(sd,T)=>{ const c=Math.cos(T.turretYaw), sn=Math.sin(T.turretYaw); return V3((I.tx||0)+x*c+z*sn,deck+y,M.tz-x*sn+z*c); };
  const engZ=I.eng==='side'?zf-gz-L*.2:zr+L*.18;
  t.seatPos={driver:V3(I.eng==='side'?iw2*.2:-iw2*.2,deck-.45,zf-gz-.3),gunner:tp(-M.tw*.2,M.th*.35,0),commander:tp(-M.tw*.15,M.th*.55,-M.tl*.25),loader:tp(M.tw*.22,M.th*.35,-.05),
    mg1:V3(iw2*.25,deck-.4,zf-gz-.1),mg2:V3(-iw2*.25,deck-.4,zf-gz-.1),engine:V3(I.eng==='side'?-iw2*.25:0,deck*.55,engZ),trans:V3(0,deck*.4,I.eng==='side'?zf-.6:zr+.5),
    ammo:V3(iw2*.25,deck*.5,M.tz),breech:tp(0,gy,M.tl*.15)};
}
