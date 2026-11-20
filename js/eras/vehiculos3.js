// Autos modernos más lindos (pedido de Sebastián, 20/11/2026, referencia de Sketchfab "DRIVE: Low Poly Cars"; hechos por código):
//  · carrocería de perfil con los pasaruedas recortados (las ruedas quedan metidas, no pegadas al costado),
//    trompa y cola que se angostan vistas desde arriba y bordes redondeados;
//  · cabina (vidrios oscuros) que se angosta hacia arriba, techo del color del auto y parantes;
//  · faros, giros, luces de atrás, parrilla, paragolpes, espejos, manijas, líneas de puertas, llantas claras;
//  · colores planos y vivos.
// Reemplaza el armado de sedán, hatchback, Falcon, Fiat 600, taxi y la camioneta genérica, y suma SUV y coupé al tránsito.
(function(){
  const M=c=>new THREE.MeshLambertMaterial({color:c}), black=M(0x141414), trim=M(0x2a2b2d), grey=M(0x6a6c70), rimL=M(0xc8ccd0),
    amber=new THREE.MeshBasicMaterial({color:0xf0921e}), redL=new THREE.MeshBasicMaterial({color:0xc4161c}), headL=new THREE.MeshBasicMaterial({color:0xfff6e0});
  const COL=[0xd8262a,0xf2c21b,0x1f6fd1,0x2fa84f,0xf0f0ea,0x1d1d1f,0xb8bcc2,0xf07a1a,0x7a3fc0,0x18a8b8,0xe0457b,0x8a1e22,0x2e3e66,0x5aa02c,0xd9d4c6,0x6a6e72];
  const sm=(a,b,x)=>{ const t=Math.min(1,Math.max(0,(x-a)/(b-a))); return t*t*(3-2*t); };
  // S: L/R trompa y cola (z), W ancho, wr radio de rueda, wz ejes, sill alto del zócalo, top = borde de arriba de la carrocería
  // (de atrás hacia adelante), cab = cabina [z,y] desde la base de atrás hasta la base de adelante, roof = [z de atrás, z de adelante]
  const S={
    sedan:{L:2.3,R:-2.3,W:1.78,wr:.32,wz:[1.38,-1.38],sill:.27,tum:.78,nose:.1,tail:.07,
      top:[[-2.3,.4],[-2.34,.7],[-2.22,.88],[-1.55,.93],[.95,.93],[1.85,.84],[2.26,.7],[2.32,.42]],
      cab:[[-1.55,.93],[-.95,1.39],[.22,1.42],[.95,.93]]},
    hatch:{L:1.98,R:-1.98,W:1.72,wr:.3,wz:[1.22,-1.22],sill:.26,tum:.8,nose:.1,tail:.05,
      top:[[-1.98,.4],[-2.01,.76],[-1.92,.92],[.85,.92],[1.6,.82],[1.95,.68],[2.0,.42]],
      cab:[[-1.92,.92],[-1.74,1.42],[.12,1.46],[.85,.92]]},
    fiat600:{L:1.65,R:-1.65,W:1.42,wr:.26,wz:[1.0,-1.0],sill:.22,tum:.8,nose:.16,tail:.14,
      top:[[-1.65,.32],[-1.69,.58],[-1.5,.77],[.95,.79],[1.45,.7],[1.66,.5],[1.66,.32]],
      cab:[[-1.5,.77],[-1.12,1.24],[.42,1.27],[.95,.79]]},
    falcon:{L:2.42,R:-2.42,W:1.84,wr:.33,wz:[1.45,-1.45],sill:.3,tum:.84,nose:.04,tail:.03,chrome:1,
      top:[[-2.42,.42],[-2.44,.82],[-2.3,.86],[-1.4,.87],[.95,.87],[2.3,.85],[2.44,.8],[2.44,.44]],
      cab:[[-1.4,.87],[-.95,1.37],[.22,1.39],[.95,.87]]},
    suv:{L:2.25,R:-2.25,W:1.9,wr:.38,wz:[1.42,-1.42],sill:.42,tum:.82,nose:.08,tail:.04,rails:1,
      top:[[-2.25,.56],[-2.29,1.0],[-2.2,1.12],[1.15,1.12],[1.98,1.03],[2.24,.86],[2.28,.56]],
      cab:[[-2.18,1.12],[-2.07,1.8],[.42,1.84],[1.15,1.12]]},
    cupe:{L:2.2,R:-2.2,W:1.86,wr:.33,wz:[1.38,-1.3],sill:.24,tum:.74,nose:.14,tail:.08,spoiler:1,
      top:[[-2.2,.38],[-2.25,.7],[-2.1,.82],[-1.3,.86],[.75,.86],[1.8,.68],[2.2,.5],[2.25,.36]],
      cab:[[-1.3,.86],[-.62,1.22],[-.1,1.24],[.75,.86]]},
    pickup:{L:2.65,R:-2.65,W:1.86,wr:.38,wz:[1.62,-1.55],sill:.42,tum:.84,nose:.07,tail:.02,bed:1,
      top:[[-2.65,.55],[-2.67,.8],[-.58,.8],[-.58,1.12],[1.2,1.12],[2.22,1.03],[2.6,.86],[2.66,.55]],
      cab:[[-.58,1.12],[-.52,1.78],[.55,1.8],[1.2,1.12]]}};
  S.taxi=S.sedan;
  const _geo=new Map();
  function extrude(key,pts,w,bev,warp){ let g=_geo.get(key); if(g) return g; const sh=new THREE.Shape(); pts(sh);
    g=new THREE.ExtrudeGeometry(sh,{depth:Math.max(.02,w-2*bev),bevelEnabled:true,bevelThickness:bev,bevelSize:bev*.8,bevelSegments:2,curveSegments:6});
    g.rotateY(-Math.PI/2); g.translate(w/2-bev,0,0); const p=g.attributes.position;
    for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i), z=p.getZ(i); p.setX(i,x*warp(y,z)); }
    g.computeVertexNormals(); _geo.set(key,g); return g; }
  const poly=pts=>sh=>pts.forEach(([x,y],i)=>i?sh.lineTo(x,y):sh.moveTo(x,y));
  // ancho relativo de la cabina a cada altura (se angosta hacia arriba)
  const cabK=(s,y)=>{ const y0=s.cab[0][1], y1=Math.max(...s.cab.map(p=>p[1])); return 1-(1-s.tum)*sm(y0,y1,y); };
  function bodyGeo(k,s){ const ra=s.wr+.07;
    const draw=sh=>{ sh.moveTo(s.L,s.sill+.08); sh.lineTo(s.L-.12,s.sill);
      for(const z of [...s.wz].sort((a,b)=>b-a)){ sh.lineTo(z+ra,s.sill); sh.lineTo(z+ra,s.wr); sh.absarc(z,s.wr,ra,0,Math.PI,false); sh.lineTo(z-ra,s.sill); }
      sh.lineTo(s.R+.12,s.sill); s.top.forEach(([z,y])=>sh.lineTo(z,y)); sh.lineTo(s.L,s.sill+.08); };
    const yb=Math.max(...s.top.map(p=>p[1]));
    return extrude(k+'B',draw,s.W,.07,(y,z)=>{ let f=1-s.nose*sm(s.L-.7,s.L,z)-s.tail*sm(-s.R-.6,-s.R,-z); f*=1-.035*sm(yb-.25,yb,y); f*=1-.03*sm(s.sill+.12,s.sill,y); return f; }); }
  function cabGeo(k,s,glass){ const w=s.W-(glass?.16:.1), yb=s.cab[0][1];
    return extrude(k+(glass?'G':'C'),poly(s.cab),w,.04,(y)=>y<yb+.01?1:cabK(s,y)); }
  // techo: una chapa sobre la parte de arriba de la cabina, del color del auto
  function roofGeo(k,s){ const c=s.cab, a=c[1], b=c[c.length-2], w=s.W-.12;
    const pts=[[a[0]-.05,a[1]-.02],[a[0]-.02,a[1]+.05],[b[0]+.02,b[1]+.05],[b[0]+.06,b[1]-.02]];
    return extrude(k+'T',poly(pts),w*s.tum+.02,.03,()=>1); }

  // z del frente (sg=1) o de la cola (sg=-1) a la altura y, con el borde redondeado
  function zEdge(s,y,sg){ const P=[[s.R+.12,s.sill],...s.top,[s.L,s.sill+.08],[s.L-.12,s.sill]]; let best=sg>0?-9:9;
    for(let i=0;i<P.length-1;i++){ const [z0,y0]=P[i], [z1,y1]=P[i+1]; if((y-y0)*(y-y1)>0||y0===y1) continue; const z=z0+(z1-z0)*(y-y0)/(y1-y0); best=sg>0?Math.max(best,z):Math.min(best,z); }
    return best+sg*.065; }
  function build(V,ci,g,ud){ const s=S[V.k], k=V.k, taxi=k==='taxi';
    const col=taxi?0x161616:COL[ci%16], m=M(col); ud.m=m; ud.mats=[m]; ud.len=s.L-s.R;
    const roofM=taxi?M(0xf2c62e):(k==='pickup'||k==='suv')&&ci%4===0?M(0xf0f0ea):m;
    g.add(new THREE.Mesh(bodyGeo(k,s),m));
    g.add(new THREE.Mesh(cabGeo(k,s,true),glassMat));
    g.add(new THREE.Mesh(roofGeo(k,s),roofM));
    // parantes: A (parabrisas), C (luneta) y B (entre puertas)
    const c=s.cab, f0=c[c.length-1], f1=c[c.length-2], r0=c[0], r1=c[1], yb=c[0][1];
    const xw=y=>(s.W-.16)/2*cabK(s,y)+.012;
    for(const sx of [-1,1]){
      rod(g,[sx*xw(f0[1]),f0[1],f0[0]],[sx*xw(f1[1]),f1[1]+.02,f1[0]],roofM,3.4);
      rod(g,[sx*xw(r0[1]),r0[1],r0[0]],[sx*xw(r1[1]),r1[1]+.02,r1[0]],roofM,k==='hatch'||k==='suv'?3.4:4.2);
      if(k!=='cupe'&&k!=='pickup'){ const zb=(f1[0]+r1[0])/2, yt=Math.min(f1[1],r1[1]); rod(g,[sx*xw(yb),yb,zb],[sx*xw(yt),yt,zb],black,3.6); } }
    // frente: faros, giros, parrilla, paragolpes (pegados a la chapa, que es inclinada)
    const L=s.L, R=s.R, yH=s.top[s.top.length-2][1]-.1, yT=s.top[2][1]-.13, xf=s.W/2*(1-s.nose)-.08, xt=s.W/2*(1-s.tail)-.08, yBp=s.sill+.09;
    for(const sx of [-1,1]){ box(g,.36,.11,.03,sx*(xf-.22),yH,zEdge(s,yH,1),headL); box(g,.12,.06,.03,sx*(xf-.03),yH,zEdge(s,yH,1)-.04,amber);
      box(g,.32,.11,.03,sx*(xt-.2),yT,zEdge(s,yT,-1),redL); box(g,.08,.11,.03,sx*(xt-.02),yT,zEdge(s,yT,-1)+.03,amber); }
    box(g,s.W*(1-s.nose)*.38,.12,.03,0,yH-.02,zEdge(s,yH-.02,1),black);
    if(s.chrome){ box(g,s.W+.02,.13,.12,0,yBp+.03,zEdge(s,yBp+.03,1),chromeMat); box(g,s.W+.02,.13,.12,0,yBp+.03,zEdge(s,yBp+.03,-1),chromeMat); box(g,.9,.18,.04,0,yH-.06,zEdge(s,yH-.06,1)+.01,chromeMat); }
    else { box(g,s.W*(1-s.nose)-.06,.16,.1,0,yBp,zEdge(s,yBp,1)-.02,trim); box(g,s.W*(1-s.tail)-.06,.16,.1,0,yBp,zEdge(s,yBp,-1)+.02,trim); }
    box(g,.5,.12,.03,0,yBp+.2,zEdge(s,yBp+.2,-1),grey);                                                                    // chapa patente
    // costados: zócalo, líneas de puertas, manijas, espejos
    const zb=(f1[0]+r1[0])/2, x=s.W/2+.003;
    for(const sx of [-1,1]){
      box(g,.03,.08,(s.wz[0]-s.wz[s.wz.length-1])-2*(s.wr+.1),sx*(x-.012),s.sill+.04,(s.wz[0]+s.wz[s.wz.length-1])/2,trim);
      box(g,.012,yb-s.sill-.12,.012,sx*x,(yb+s.sill)/2+.04,f0[0]-.05,black);
      if(k!=='cupe'&&k!=='pickup'&&k!=='fiat600') box(g,.012,yb-s.sill-.12,.012,sx*x,(yb+s.sill)/2+.04,zb,black);
      box(g,.02,.03,.13,sx*(x+.005),yb-.12,f0[0]-.32,grey); if(k!=='cupe'&&k!=='fiat600') box(g,.02,.03,.13,sx*(x+.005),yb-.12,zb-.3,grey);
      box(g,.04,.1,.06,sx*(xw(yb)+.05),yb+.05,f0[0]-.12,black); box(g,.11,.08,.04,sx*(xw(yb)+.12),yb+.08,f0[0]-.1,m); }
    // extras por tipo
    if(taxi){ box(g,.5,.16,.2,0,c[1][1]+.12,(c[1][0]+f1[0])/2,headL); }
    if(s.rails) for(const sx of [-1,1]) box(g,.04,.05,(f1[0]-r1[0])-.2,sx*(xw(f1[1])-.12),f1[1]+.09,(f1[0]+r1[0])/2,black);
    if(s.spoiler){ box(g,s.W-.25,.03,.22,0,s.top[2][1]+.16,R+.18,black); for(const sx of [-1,1]) box(g,.04,.14,.08,sx*.55,s.top[2][1]+.08,R+.2,black); }
    if(s.bed){ const z0=-.6, z1=R+.04; for(const sx of [-1,1]){ box(g,.06,.32,z0-z1,sx*(s.W/2-.05),.96,(z0+z1)/2,m); box(g,.09,.03,z0-z1,sx*(s.W/2-.05),1.13,(z0+z1)/2,trim); }
      box(g,s.W-.04,.34,.06,0,.96,R+.05,m); box(g,s.W-.14,.03,z0-z1,0,.81,(z0+z1)/2,black); }
    // ruedas metidas en el pasarueda, con el hueco oscuro atrás
    const tw=.22, ra=s.wr+.07;
    for(const z of s.wz){ box(g,s.W-.5,ra+s.wr-s.sill+.04,2*ra-.04,0,(s.sill+ra+s.wr)/2,z,black);
      for(const sx of [-1,1]){ const wx=sx*(s.W/2-tw/2-.03); vWheel(g,wx,s.wr,z,s.wr,tw);
        const rim=new THREE.Mesh(VG.tire,rimL); rim.scale.set(.03,s.wr*.62,s.wr*.62); rim.position.set(wx+sx*(tw/2),s.wr,z); g.add(rim);
        const hub=new THREE.Mesh(VG.tire,grey); hub.scale.set(.04,s.wr*.18,s.wr*.18); hub.position.set(wx+sx*(tw/2+.01),s.wr,z); g.add(hub); } }
    const door=box(g,.05,yb-s.sill-.1,(f0[0]-zb)*.9,s.W/2+.02,(yb+s.sill)/2,(f0[0]+zb)/2,m); door.visible=false; ud.door=door; }

  const add=(k,o)=>{ VTYPES.push(Object.assign({k},o)); return VTYPES.length-1; };
  const I_SUV=add('suv',{n:'SUV',W:1.9,wr:.38,wz:[1.42,-1.42],v:[8,11]}), I_CUPE=add('cupe',{n:'Coupé',W:1.86,wr:.33,wz:[1.38,-1.3],v:[9,12]});
  const _cm=carMesh;
  carMesh=function(ci){ const ti=VTYPES[(ci>>4)]?(ci>>4):0, V=VTYPES[ti]; if(!S[V.k]) return _cm(ci);
    const g=new THREE.Group(), ud={riders:[],V}; build(V,ci,g,ud);
    g.userData=ud; bakeVehicle(g,new Set([ud.door])); ud.mats.push(ud.door.material);
    g.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); return g; };
  VMIX.push(I_SUV,I_SUV,I_CUPE);
  window.VEH3={I_SUV,I_CUPE,S};
})();
