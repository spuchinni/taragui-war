// Vehículos de trabajo y de servicio (22/11/2026, pedido de Sebastián con el pack "ARCADE: Ultimate Vehicles Pack" de MenaStudios
// en Sketchfab como referencia; hechos por código, el modelo no se usa): formas macizas de cantos biselados y colores vivos, como el pack.
//  · combi (utilitario tipo Trafic/Sprinter, reemplaza al genérico), ambulancia (sobre la combi: blanca con franjas, barral de luces y
//    "AMBULANCIA" al revés en el capó), patrullero (sedán blanco con franja azul, barral rojo y azul y "POLICÍA"),
//  · camión mediano con caja (reemplaza al genérico), semirremolque con caja larga, camión cisterna, volcador, autobomba con escalera,
//    recolector de residuos y tractor de campo (ruedas traseras grandes).
// Los textos van sueltos (no se hornean: bakeVehicle pierde las texturas). Se suman a VTYPES con `c4` y a la mezcla del tránsito (VMIX).
(function(){
  const add=(k,o)=>{ VTYPES.push(Object.assign({k,c4:1},o)); return VTYPES.length-1; };
  const I={
    combi:add('combi',{n:'Utilitario',W:2.0,wr:.36,wz:[1.8,-1.75],v:[7,9]}),
    ambu:add('ambu',{n:'Ambulancia',W:2.05,wr:.36,wz:[1.8,-1.75],v:[9,12]}),
    patru:add('patrullero',{n:'Patrullero',W:1.78,wr:.32,wz:[1.35,-1.35],v:[9,12]}),
    camion:add('camion2',{n:'Camión',W:2.45,wr:.52,wz:[2.75,-1.95],v:[6,8]}),
    semi:add('semi',{n:'Semirremolque',W:2.55,wr:.53,wz:[6.6,3.75,2.45,-4.7,-6.0,-7.3],v:[6,8]}),
    cist:add('cisterna',{n:'Camión cisterna',W:2.55,wr:.53,wz:[6.6,3.75,2.45,-4.7,-6.0],v:[6,8]}),
    volc:add('volcador',{n:'Volcador',W:2.5,wr:.56,wz:[2.85,-1.55,-2.85],v:[6,8]}),
    bomba:add('autobomba',{n:'Autobomba',W:2.5,wr:.53,wz:[2.7,-2.1],v:[8,11]}),
    reco:add('recolector',{n:'Recolector',W:2.5,wr:.53,wz:[2.7,-1.6,-2.8],v:[5,7]}),
    tract:add('tractor',{n:'Tractor',W:2.2,wr:.82,wz:[1.25,-.75],v:[4,5]})
  };
  const MC=new Map(), M=c=>{ let m=MC.get(c); if(!m){ m=new THREE.MeshLambertMaterial({color:c}); MC.set(c,m); } return m; };
  const black=M(0x151617), dark=M(0x2a2c2e), grey=M(0x6a6d70), lgrey=M(0xa8acb0), white=M(0xf2f2ee), amber=new THREE.MeshBasicMaterial({color:0xf0901e});
  const red=new THREE.MeshBasicMaterial({color:0xff2a20}), blue=new THREE.MeshBasicMaterial({color:0x2a5aff});
  const CAB=[0xd8262a,0xf2f2ee,0x1f6fd1,0x2fa84f,0xf2c21b,0xf07a1a,0x2e3e66,0xb8bcc2,0x1d1d1f,0x8a1e22,0x18a8b8,0x5aa02c];
  const cyl=(g,r0,r1,h,x,y,z,mat,rx=0,rz=0,s=12)=>{ const m=new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,h,s),mat); m.position.set(x,y,z); m.rotation.set(rx,0,rz); g.add(m); return m; };
  function wheel(g,x,y,z,r,w,cap){ vWheel(g,x,y,z,r,w); const sd=Math.sign(x)||1; cyl(g,r*.55,r*.55,.03,x+sd*(w/2+.01),y,z,cap||lgrey,0,Math.PI/2,14); cyl(g,r*.18,r*.18,.05,x+sd*(w/2+.03),y,z,dark,0,Math.PI/2,8); }
  function axles(g,V,list,dual){ for(const z of list) for(const sx of [-1,1]){ wheel(g,sx*(V.W/2-.17),V.wr,z,V.wr,.32); if(dual&&dual(z)) wheel(g,sx*(V.W/2-.5),V.wr,z,V.wr,.32,grey); } }
  // guardabarros de los camiones: arco negro sobre cada rueda
  function arches(g,V,list,xw){ for(const z of list) for(const sx of [-1,1]){ const a=new THREE.Mesh(new THREE.CylinderGeometry(V.wr+.12,V.wr+.12,.42,12,1,true,0,Math.PI),black); a.rotation.z=Math.PI/2; a.rotation.y=Math.PI/2*0; a.rotation.x=0; a.position.set(sx*(xw??V.W/2-.2),V.wr,z); a.rotation.set(0,0,Math.PI/2); a.rotateX(Math.PI/2); g.add(a); } }
  function textPlane(txt,w,h,bg,fg,flip){ const c=document.createElement('canvas'); c.width=256; c.height=Math.max(32,Math.round(256*h/w)); const x=c.getContext('2d');
    if(bg){ x.fillStyle=bg; x.fillRect(0,0,c.width,c.height); } x.fillStyle=fg; x.font=`bold ${Math.round(c.height*.72)}px Arial`; x.textAlign='center'; x.textBaseline='middle';
    if(flip){ x.translate(c.width,0); x.scale(-1,1); } x.fillText(txt,c.width/2,c.height*.54,c.width*.94);
    const t=new THREE.CanvasTexture(c); return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:!bg,depthWrite:!!bg})); }
  const decal=(g,ud,mesh,x,y,z,ry=0,rx=0)=>{ mesh.position.set(x,y,z); mesh.rotation.set(rx,ry,0,'YXZ'); g.add(mesh); ud.keep.push(mesh); return mesh; };
  function lights(g,W2,zF,zR,yF,yR){ for(const sx of [-1,1]){ box(g,.3,.16,.04,sx*(W2/2-.32),yF,zF,lampW); box(g,.14,.08,.04,sx*(W2/2-.12),yF-.14,zF,amber); box(g,.12,.26,.04,sx*(W2/2-.14),yR,zR,lampR); } }
  function mirrors(g,W2,y,z){ for(const sx of [-1,1]){ box(g,.05,.05,.32,sx*(W2/2+.14),y,z,black); box(g,.06,.34,.16,sx*(W2/2+.3),y-.02,z+.12,black); } }

  // ---- cabinas de camión: chata (cab-over) o con trompa ----
  function cabOver(g,col,W2,zF,h=2.95,len=2.1){ const m=M(col), zr=zF-len;
    g.add(new THREE.Mesh(vExt('cbo'+h+len,[[zF,.62],[zF+.03,h-.5],[zF-.18,h],[zr,h],[zr,.62]],W2),m));
    box(g,W2-.14,.95,.04,0,h-.95,zF+.06,glassMat); box(g,W2-.1,.14,.06,0,h-1.5,zF+.06,black);                    // parabrisas y franja
    for(let i=0;i<4;i++) box(g,W2*.6,.04,.05,0,.9+i*.12,zF+.04,black);                                           // parrilla
    for(const sx of [-1,1]){ box(g,.04,.8,1.0,sx*(W2/2+.01),h-1.05,zF-.7,glassMat); box(g,.04,.06,1.2,sx*(W2/2+.02),h-1.5,zF-.7,black);   // ventanilla y línea de puerta
      box(g,.05,.32,.42,sx*(W2/2+.01),.5,zF-.55,black); }                                                         // escalón
    box(g,W2+.08,.3,.2,0,.55,zF+.06,dark); mirrors(g,W2,h-.9,zF-.1); box(g,W2*.5,.12,.4,0,h+.06,zF-1.2,lgrey); return m; }
  function cabHood(g,col,W2,zF,h=2.95){ const m=M(col), zc=zF-1.8, zr=zc-2.0;            // trompa larga (como el camión rojo del pack)
    g.add(new THREE.Mesh(vExt('hood'+W2,[[zF,.6],[zF+.04,1.55],[zF-.1,1.72],[zc,1.85],[zc,.6]],W2-.2),m));
    g.add(new THREE.Mesh(vExt('cabh'+h,[[zc+.05,.6],[zc+.05,1.85],[zc-.25,h],[zr,h],[zr,.6]],W2),m));
    box(g,W2-.3,.8,.04,0,h-.55,zc-.12,glassMat).rotation.x=-.24; box(g,1.1,.9,.06,0,1.1,zF+.04,lgrey); for(let i=0;i<7;i++) box(g,.04,.8,.07,-.45+i*.15,1.1,zF+.05,dark);   // parrilla cromada
    for(const sx of [-1,1]){ box(g,.04,.72,1.0,sx*(W2/2+.01),h-.75,zc-.85,glassMat);
      cyl(g,.09,.09,1.9,sx*(W2/2-.08),h+.1,zr-.08,lgrey); cyl(g,.11,.11,.15,sx*(W2/2-.08),h+1.0,zr-.08,dark);     // escapes verticales
      box(g,.5,.32,.9,sx*(W2/2-.1),.95,zc+.95,black);                                                             // guardabarros delanteros
      box(g,.36,.36,1.2,sx*(W2/2-.05),.72,zr+.7,lgrey); }                                                         // tanques de combustible
    box(g,W2-.2,.22,.24,0,.55,zF+.1,lgrey); mirrors(g,W2,h-.6,zc-.3); for(const sx of [-1,1]) box(g,.26,.14,.04,sx*.85,1.35,zF+.05,lampW);
    box(g,W2*.7,.5,.08,0,h+.27,zr+.4,m).rotation.x=-.4;                                                           // deflector de aire
    return m; }

  function buildCombi(V,ci,g,ud,amb){ const col=amb?0xf6f6f2:CAB[ci%CAB.length], m=M(col); ud.m=m; ud.mats=[m]; ud.len=5.4; const W2=V.W, zF=2.7, zR=-2.7, H=amb?2.75:2.45;
    g.add(new THREE.Mesh(vExt('combi'+H,[[zF,.34],[zF+.03,.92],[zF-.15,1.1],[zF-.95,1.62],[zF-1.35,H],[zR,H],[zR-.02,.34]],W2),m));
    box(g,W2-.2,.7,.04,0,1.38,zF-1.1,glassMat).rotation.x=-.96;                                                    // parabrisas inclinado
    for(const sx of [-1,1]){ box(g,.04,.6,.75,sx*(W2/2+.01),1.55,zF-1.35,glassMat); if(!amb) box(g,.04,.55,2.6,sx*(W2/2+.01),1.7,-.6,glassMat);
      box(g,.03,.95,.02,sx*(W2/2+.02),1.2,zF-1.85,black); box(g,.03,.95,.02,sx*(W2/2+.02),1.2,-1.9,black); }       // puerta corrediza
    box(g,W2+.06,.22,.14,0,.45,zF+.06,dark); box(g,W2+.06,.22,.14,0,.45,zR-.06,dark); lights(g,W2,zF+.02,zR-.02,.82,1.2);
    box(g,1.0,.24,.04,0,.72,zF+.04,black); mirrors(g,W2,1.4,zF-1.1);
    if(amb){ for(const sx of [-1,1]) box(g,.02,.3,5.1,sx*(W2/2+.012),1.05,-.05,M(0xe02a22)); box(g,W2+.024,.12,.4,0,1.05,zF-.2,M(0xe02a22));
      box(g,1.2,.14,.32,0,H+.08,zF-1.5,black); box(g,.5,.12,.3,-.3,H+.2,zF-1.5,red); box(g,.5,.12,.3,.3,H+.2,zF-1.5,blue);
      decal(g,ud,textPlane('AMBULANCIA',1.6,.26,null,'#d0201a',true),0,1.0,zF+.04); for(const sx of [-1,1]) decal(g,ud,textPlane('EMERGENCIAS',2.6,.34,null,'#d0201a'),sx*(W2/2+.03),1.5,-.6,sx*Math.PI/2);
      decal(g,ud,textPlane('✚',.6,.6,null,'#d0201a'),0,1.7,zR-.04,Math.PI); }
    axles(g,V,V.wz); for(const sx of [-1,1]) for(const z of V.wz){ const a=new THREE.Mesh(new THREE.TorusGeometry(V.wr+.07,.04,4,12,Math.PI),black); a.rotation.y=Math.PI/2; a.position.set(sx*(W2/2+.005),V.wr,z); g.add(a); }
    const door=box(g,.06,.9,.9,W2/2+.02,1.1,zF-1.5,m); door.visible=false; ud.door=door; const r=rider(g,.5,zF-1.5,.62); r.g.position.x=-.45; ud.riders.push(r); }

  function buildPatrullero(V,ci,g,ud){ const base=carMesh((VTYPES.findIndex(v=>v.k==='sedan')<<4)|4); g.add(base); const bu=base.userData;
    ud.len=bu.len||4.6; ud.door=bu.door; (bu.riders||[]).forEach(r=>ud.riders.push(r));
    const s=window.VEH3&&VEH3.S&&VEH3.S.sedan, top=s?Math.max(...s.top.map(p=>p[1])):1.42, W2=V.W;
    const band=M(0x1d3f8a); for(const sx of [-1,1]) box(g,.02,.16,3.4,sx*(W2/2+.01),.7,0,band);
    box(g,1.15,.12,.3,0,top+.06,-.15,black); box(g,.5,.1,.28,-.3,top+.15,-.15,red); box(g,.5,.1,.28,.3,top+.15,-.15,blue);
    for(const sx of [-1,1]) decal(g,ud,textPlane('POLICÍA',1.5,.28,null,'#1d3f8a'),sx*(W2/2+.03),.98,-.25,sx*Math.PI/2);
    decal(g,ud,textPlane('POLICÍA',.9,.2,null,'#1d3f8a',true),0,.86,2.0,0,-1.25);
    ud.m=bu.m; ud.mats=bu.mats; ud.flash=[g.children[g.children.length-1]]; ud.skipBake=true; }

  function cargoBox(g,col,W2,z0,z1,y0,h){ const m=M(col); box(g,W2,h,z0-z1,0,y0+h/2,(z0+z1)/2,m); box(g,W2+.03,.05,z0-z1+.03,0,y0+h+.02,(z0+z1)/2,lgrey);
    for(let z=z1+.6;z<z0;z+=1.2) for(const sx of [-1,1]) box(g,.02,h-.1,.06,sx*(W2/2+.01),y0+h/2,z,lgrey);        // nervios
    box(g,W2-.1,h-.12,.04,0,y0+h/2,z1-.02,lgrey); box(g,.04,h-.2,.04,0,y0+h/2,z1-.05,dark); return m; }
  function chassis(g,W2,z0,z1,y=.72){ for(const sx of [-1,1]) box(g,.14,.22,z0-z1,sx*.45,y,(z0+z1)/2,black); }

  function buildCamion(V,ci,g,ud){ const col=CAB[ci%CAB.length], W2=V.W, zF=3.7; ud.len=7.6;
    const m=cabOver(g,col,W2,zF,2.95,2.0); chassis(g,W2,zF-1.9,-3.7); cargoBox(g,[0xe8e6de,0xb8bcc2,0x2a4a7a,0xd8262a][ci%4],W2,1.55,-3.85,1.15,2.6);
    box(g,W2,.1,5.4,0,1.05,-1.15,black); lights(g,W2,zF+.04,-3.88,.95,.95); axles(g,V,V.wz,z=>z<0); ud.m=m; ud.mats=[m];
    const r=rider(g,1.15,zF-.9,.62); r.g.position.x=-.6; ud.riders.push(r); }
  function tractorUnit(g,V,col,zF){ const W2=V.W, m=cabHood(g,col,W2,zF); chassis(g,W2,zF,zF-6.2); box(g,1.6,.12,1.2,0,1.2,zF-5.2,dark);   // quinta rueda
    return m; }
  function buildSemi(V,ci,g,ud,tank){ const col=CAB[ci%CAB.length], W2=V.W, zF=8.6; ud.len=17.4;
    const m=tractorUnit(g,V,col,zF);
    if(tank){ const tm=M([0xd8d8d4,0xc8ccd0,0xe8e6de][ci%3]); const t=cyl(g,1.12,1.12,10.4,0,2.32,-2.3,tm,Math.PI/2,0,18); t.scale.x=1.06;
      for(const z of [-7.5,2.9]){ const e=new THREE.Mesh(new THREE.SphereGeometry(1.12,16,8,0,Math.PI*2,0,Math.PI/2),tm); e.scale.set(1.06,.28,1); e.rotation.x=z>0?Math.PI/2:-Math.PI/2; e.position.set(0,2.32,z); g.add(e); }
      for(let z=-6.5;z<2.5;z+=2.4) cyl(g,1.15,1.15,.08,0,2.32,z,lgrey,Math.PI/2,0,18);                               // aros
      box(g,.7,.08,9.6,0,3.48,-2.3,grey); for(const z of [-5,-2.3,.4]) cyl(g,.28,.28,.12,0,3.5,z,lgrey,0,0,10);        // pasarela y bocas
      box(g,1.6,.28,10,0,1.12,-2.3,black); decal(g,ud,textPlane('INFLAMABLE',2.2,.36,'#f2c21b','#151617'),0,2.3,-7.9,Math.PI); }
    else { cargoBox(g,[0xf2f2ee,0xd8262a,0x1f6fd1,0xb8bcc2][ci%4],W2,3.0,-8.4,1.25,2.95); box(g,W2,.12,11.4,0,1.18,-2.7,black); }
    for(const sx of [-1,1]) box(g,.06,.6,.06,sx*.6,.7,1.0,grey);                                                       // patas de apoyo
    lights(g,W2,zF+.05,tank?-7.6:-8.45,1.35,1.0); axles(g,V,V.wz,z=>z<3); ud.m=m; ud.mats=[m];
    const r=rider(g,1.35,zF-2.6,.62); r.g.position.x=-.6; ud.riders.push(r); }
  function buildVolcador(V,ci,g,ud){ const col=CAB[ci%CAB.length], W2=V.W, zF=3.9; ud.len=7.8;
    const m=cabOver(g,col,W2,zF,3.0,1.9); chassis(g,W2,zF-1.8,-3.8);
    const dm=M([0xf2c21b,0xf07a1a,0xd8262a,0x6a6d70][ci%4]); g.add(new THREE.Mesh(vExt('dump',[[1.85,1.1],[1.85,2.75],[2.15,3.05],[-3.7,2.75],[-3.9,1.4],[-3.7,1.1]],W2),dm));   // caja volcadora
    for(let z=-3;z<1.6;z+=.9) for(const sx of [-1,1]) box(g,.04,1.4,.1,sx*(W2/2+.02),2.0,z,dm);
    cyl(g,.12,.12,1.2,0,1.5,1.4,lgrey,.4); lights(g,W2,zF+.04,-3.92,.95,1.05); axles(g,V,V.wz,z=>z<0); ud.m=m; ud.mats=[m];
    const r=rider(g,1.15,zF-.9,.62); r.g.position.x=-.6; ud.riders.push(r); }
  function buildBomba(V,ci,g,ud){ const W2=V.W, zF=4.2; ud.len=8.6; const rc=0xc81e1a;
    const m=cabOver(g,rc,W2,zF,3.0,2.6); chassis(g,W2,zF-2.5,-4.3); const bm=M(rc);
    box(g,W2,1.9,6.0,0,1.75,-1.3,bm); for(const sx of [-1,1]){ for(const z of [-3.3,-1.9,-.5,.9]) box(g,.03,1.5,1.2,sx*(W2/2+.01),1.8,z,lgrey); box(g,.02,.12,6,sx*(W2/2+.02),.95,-1.3,white); }   // persianas y franja
    box(g,1.3,.12,6.2,0,3.0,-1.3,grey); for(const sx of [-1,1]) box(g,.08,.1,6.4,sx*.42,3.15,-1.1,lgrey); for(let z=-4;z<2;z+=.45) box(g,.84,.04,.06,0,3.15,z,lgrey);   // escalera
    cyl(g,.3,.3,.5,0,1.4,-4.32,lgrey,Math.PI/2); box(g,1.2,.16,.36,0,3.08,zF-1.4,black); box(g,.45,.13,.32,-.32,3.2,zF-1.4,red); box(g,.45,.13,.32,.32,3.2,zF-1.4,red);
    for(const sx of [-1,1]) decal(g,ud,textPlane('BOMBEROS',2.4,.36,null,'#ffffff'),sx*(W2/2+.03),2.55,-1.3,sx*Math.PI/2);
    lights(g,W2,zF+.04,-4.32,.95,1.05); axles(g,V,V.wz,z=>z<0); ud.m=m; ud.mats=[m]; const r=rider(g,1.15,zF-.9,.62); r.g.position.x=-.6; ud.riders.push(r); }
  function buildReco(V,ci,g,ud){ const W2=V.W, zF=4.0; ud.len=8.4; const m=cabOver(g,0xf2f2ee,W2,zF,2.95,2.0); chassis(g,W2,zF-1.9,-4.2);
    const bm=M([0x2fa84f,0xf07a1a,0x1f6fd1][ci%3]); g.add(new THREE.Mesh(vExt('reco',[[1.9,1.0],[1.9,3.1],[-3.0,3.0],[-4.3,2.4],[-4.4,1.0]],W2),bm));
    box(g,W2-.2,1.3,.5,0,1.55,-4.5,grey); box(g,W2-.4,.4,.2,0,1.0,-4.8,dark); for(const sx of [-1,1]) box(g,.03,.14,6,sx*(W2/2+.015),1.3,-1.2,M(0xf2c21b));
    box(g,1.0,.12,.3,0,3.06,zF-1.2,amber); lights(g,W2,zF+.04,-4.75,.95,1.6); axles(g,V,V.wz,z=>z<0); ud.m=m; ud.mats=[m];
    const r=rider(g,1.15,zF-.9,.62); r.g.position.x=-.6; ud.riders.push(r); }
  function buildTractor(V,ci,g,ud){ const col=[0x2fa84f,0xd8262a,0x1f6fd1,0xf2c21b][ci%4], m=M(col), W2=1.3; ud.len=4.2; ud.m=m; ud.mats=[m];
    g.add(new THREE.Mesh(vExt('trac',[[2.05,.7],[2.1,1.45],[1.9,1.6],[-.1,1.65],[-.1,.7]],W2),m));                  // capó
    box(g,1.1,.7,.06,0,1.1,2.12,dark); for(let i=0;i<5;i++) box(g,1.0,.04,.07,0,.85+i*.12,2.13,black);
    box(g,1.2,.5,1.4,0,1.0,-.75,m); box(g,1.7,.06,1.5,0,2.75,-.75,m);                                               // asiento y techo de la cabina
    for(const sx of [-1,1]) for(const z of [-.05,-1.45]) box(g,.06,1.5,.06,sx*.8,2.0,z,black);
    box(g,1.5,1.3,.04,0,2.0,-.05,glassMat); cyl(g,.07,.07,1.3,.45,2.1,1.6,black); for(const sx of [-1,1]) box(g,.18,.1,.04,sx*.45,1.4,2.12,lampW);
    for(const sx of [-1,1]){ const big=1.6/2+.12; wheel(g,sx*(big),.82,-.75,.82,.5,M(0xf2c21b)); wheel(g,sx*.82,.45,1.25,.45,.28,M(0xf2c21b));
      const f=new THREE.Mesh(new THREE.CylinderGeometry(.95,.95,.55,14,1,true,0,Math.PI),m); f.rotation.set(0,0,Math.PI/2); f.position.set(sx*big,.82,-.75); g.add(f); }
    const r=rider(g,1.05,-.75,.7); ud.riders.push(r); }

  const _cm=carMesh;
  carMesh=function(ci){ const ti=VTYPES[(ci>>4)]?(ci>>4):0, V=VTYPES[ti]; if(!V||!V.c4) return _cm(ci);
    const g=new THREE.Group(), ud={riders:[],V,keep:[]}; const k=V.k;
    if(k==='combi') buildCombi(V,ci,g,ud,false); else if(k==='ambu') buildCombi(V,ci,g,ud,true); else if(k==='patrullero') buildPatrullero(V,ci,g,ud);
    else if(k==='camion2') buildCamion(V,ci,g,ud); else if(k==='semi') buildSemi(V,ci,g,ud,false); else if(k==='cisterna') buildSemi(V,ci,g,ud,true);
    else if(k==='volcador') buildVolcador(V,ci,g,ud); else if(k==='autobomba') buildBomba(V,ci,g,ud); else if(k==='recolector') buildReco(V,ci,g,ud); else buildTractor(V,ci,g,ud);
    const skipBake=ud.skipBake; delete ud.skipBake; const keep=ud.keep; delete ud.keep; g.userData=ud;
    if(!skipBake){ const skip=new Set([ud.door,...ud.riders.map(r=>r.g),...keep].filter(Boolean)); bakeVehicle(g,skip); if(ud.door) ud.mats.push(ud.door.material); }
    g.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); return g; };
  // en el tránsito: la combi y la ambulancia nuevas en lugar de las genéricas, el camión nuevo, y se suman los demás
  const iV=VTYPES.findIndex(v=>v.k==='van'), iA=VTYPES.findIndex(v=>v.k==='amb'), iT=VTYPES.findIndex(v=>v.k==='truck');
  for(let i=0;i<VMIX.length;i++){ if(VMIX[i]===iV) VMIX[i]=I.combi; else if(VMIX[i]===iA) VMIX[i]=I.ambu; else if(VMIX[i]===iT) VMIX[i]=I.camion; }
  VMIX.push(I.combi,I.patru,I.semi,I.cist,I.volc,I.reco,I.camion,I.bomba,I.tract);
  window.VEH4=I;
})();
