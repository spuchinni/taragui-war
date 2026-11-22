/* ---------- Aviones de línea del aeropuerto: Boeing 737-800 y Embraer 190 (22/11/2026, pedido de Sebastián) ----------
   Hechos por código con modelos de Sketchfab solo como referencia ("Indonesian Government Boeing 737-800" y "Embraer 190"). Librea genérica argentina,
   sin marca de ninguna aerolínea: blanco, franja celeste y blanca bajo las ventanillas, panza gris, "ARGENTINA" arriba, banderita junto a la puerta,
   matrícula LV- inventada y deriva celeste-blanca-celeste con el sol.
   Medidas reales: 737-800 39,5 m de largo, 35,8 de envergadura, 12,5 de alto, fuselaje 3,76 × 4,01 m, CFM56-7 con la panza achatada, winglets combados;
   E190 36,24 × 28,72 × 10,57 m, fuselaje "doble burbuja" 3,01 × 3,35 m, CF34-10E, trompa redonda con 4 parabrisas grandes.
   · avionLinea(tipo) → Group con el origen en el suelo y la trompa hacia +z ('738' | 'e190'); userData.gear = el tren (para guardarlo en vuelo), userData.dim.
   · Reemplaza airlinerMesh (aviones que despegan huyendo, 11-personas.js) y guarda el tren en vuelo (la pista real la pone 11-personas.js con W._runway). */
(()=>{
  const CEL='#6fa8dc', CEL2='#2f6aa8', BELLY='#c3c8cd';
  // pinturas distintas para que se distingan de lejos (pedido de Sebastián: "son el mismo modelo"): el 737 con la celeste y blanca y "ARGENTINA";
  // el E190 de una línea regional inventada: panza azul marino, franja dorada, "CORRIENTES" y la cola azul marino con el sol (sin franja blanca)
  const LIV={ '738':{c1:CEL,c2:CEL2,belly:BELLY,title:'ARGENTINA',tcol:CEL2,fin:CEL,finBand:true,tip:CEL2},
              'e190':{c1:'#e9b52c',c2:'#1d3557',belly:'#1d3557',title:'CORRIENTES',tcol:'#1d3557',fin:'#1d3557',finBand:false,tip:'#e9b52c'} };
  const MAT={}, mat=(k,c,o)=>MAT[k]||(MAT[k]=new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})));
  const T={
    '738':{ L:39.5, rx:1.88, ry:2.0, yc:3.05, nose:5.6, nExp:.62, nDrop:.28, tail:11.5, tEnd:.12, span:17.2, c0:7.9, ct:1.3, sweep:27, kink:6.0, wLE:14.6, dih:6,
      wl:{h:2.45,c:1.25,t:.45,back:1.3,cant:.12}, eng:{x:4.9,y:1.48,s:13.0,len:4.3,r:1.0,flat:.88}, stab:{semi:7.2,c0:3.7,ct:1.2,sweep:32,s:33.3,dy:.45},
      fin:{h:7.25,d0:12.8,le0:8.7,le1:4.3,te1:1.9,te0:2.6}, gear:{nose:4.9,main:20.5,track:2.86,rn:.36,rm:.56}, win:[6.1,31.4,.51], exits:[17.2,18.0], doors:[4.3,32.7],
      cock:'b737', reg:'LV-TWR' },
    'e190':{ L:36.24, rx:1.505, ry:1.68, yc:3.1, nose:4.4, nExp:.56, nDrop:.18, tail:10.2, tEnd:.12, span:13.9, c0:6.3, ct:1.45, sweep:25, kink:5.0, wLE:13.2, dih:5,
      wl:{h:1.35,c:1.2,t:.55,back:.9,cant:.05}, eng:{x:5.1,y:1.92,s:11.6,len:3.7,r:.83,flat:.97}, stab:{semi:5.9,c0:3.1,ct:1.1,sweep:31,s:30.6,dy:.3},
      fin:{h:5.7,d0:10.2,le0:7.4,le1:3.6,te1:1.6,te0:2.3}, gear:{nose:3.6,main:18.3,track:2.97,rn:.34,rm:.52}, win:[5.6,29.0,.48], exits:[16.0], doors:[4.0,30.3],
      cock:'e190', reg:'LV-ERJ' } };

  // tubo con secciones elípticas: anillos en z con centro yc y radios rx/ry; uv = (largo 0 en la trompa, ángulo 0 arriba → .25 lado +x)
  function tube(rings,seg){ const pos=[], uv=[], idx=[], n=rings.length;
    rings.forEach((R,j)=>{ for(let k=0;k<=seg;k++){ const p=k/seg*Math.PI*2; pos.push(R.rx*Math.sin(p),R.yc+R.ry*Math.cos(p),R.z); uv.push(R.u!=null?R.u:j/(n-1),k/seg); } });
    for(let j=0;j<n-1;j++) for(let k=0;k<seg;k++){ const a=j*(seg+1)+k, b=a+seg+1; idx.push(a,a+1,b, b,a+1,b+1); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); g.computeVertexNormals(); return g; }

  // ----- textura del fuselaje: x = largo (trompa a la izquierda), alto = vuelta completa -----
  const TEXC={};
  function fuseTex(D){ if(TEXC[D.cock]) return TEXC[D.cock]; const LV=LIV[D.cock==='b737'?'738':'e190'];
    const cw=2048, ch=512, L=D.L, C=2*Math.PI*D.rx, sx=cw/L, sy=ch/C, c=document.createElement('canvas'); c.width=cw; c.height=ch; const x=c.getContext('2d');
    x.fillStyle='#f4f5f6'; x.fillRect(0,0,cw,ch);
    // dibuja lo mismo de los dos lados: X = metros desde la trompa, Y = metros desde el lomo hacia abajo (hasta C/2 en la panza)
    const side=(fn)=>{ for(const s of [1,-1]){ x.save(); if(s>0) x.setTransform(sx,0,0,-sy,0,ch); else x.setTransform(sx,0,0,sy,0,0); fn(s); x.restore(); } };
    const txt=(s,X,Y,str,font,col,align)=>{ x.save(); x.translate(X,Y); if(s<0) x.scale(-1,1); x.scale(1/24,1/24); x.font=font; x.fillStyle=col; x.textAlign=align||'center'; x.textBaseline='middle'; x.fillText(str,0,0); x.restore(); };
    const rr=(X,Y,w,h,r)=>{ x.beginPath(); x.moveTo(X+r,Y); x.lineTo(X+w-r,Y); x.quadraticCurveTo(X+w,Y,X+w,Y+r); x.lineTo(X+w,Y+h-r); x.quadraticCurveTo(X+w,Y+h,X+w-r,Y+h); x.lineTo(X+r,Y+h); x.quadraticCurveTo(X,Y+h,X,Y+h-r); x.lineTo(X,Y+r); x.quadraticCurveTo(X,Y,X+r,Y); x.closePath(); };
    const q=C/4;                                            // el costado más ancho
    side(s=>{
      // panza gris y franjas celestes debajo de las ventanillas
      x.fillStyle=LV.belly; x.fillRect(0,q*1.22,L,C/2-q*1.22+.02);
      x.fillStyle=LV.c1; x.fillRect(D.nose*.55,q*1.02,L-D.nose*.55-1.2,.34); x.fillStyle=LV.c2; x.fillRect(D.nose*.7,q*1.02+.42,L-D.nose*.7-2.2,.12);
      x.fillStyle='#f4f5f6'; x.beginPath(); x.moveTo(L-D.tail*.55,q*1.0); x.lineTo(L,q*.6); x.lineTo(L,q*1.6); x.lineTo(L-D.tail*.75,q*1.6); x.closePath(); x.fill();   // la franja muere hacia la cola
      x.fillStyle=LV.c1; x.beginPath(); x.moveTo(L-D.tail*.55,q*1.02); x.lineTo(L-.5,q*.55); x.lineTo(L-.5,q*.68); x.lineTo(L-D.tail*.52,q*1.36); x.closePath(); x.fill();
      // ventanillas
      x.fillStyle='#1b2630'; const [w0,w1,p]=D.win, wy=q*.86;
      for(let X=w0;X<=w1;X+=p){ if(D.doors.some(d=>Math.abs(X-d)<.75)) continue; rr(X-.13,wy-.19,.26,.36,.1); x.fill(); }
      // puertas, salidas sobre el ala y bodega
      x.strokeStyle='#8f969c'; x.lineWidth=.035; for(const d of D.doors){ rr(d-.43,q*.42,.86,1.9,.16); x.stroke(); x.fillStyle='#1b2630'; rr(d-.12,q*.7,.24,.3,.08); x.fill(); x.fillStyle='#9aa1a6'; x.fillRect(d+.22,q*.95,.12,.05); }
      for(const e of D.exits){ rr(e-.33,q*.6,.66,1.05,.12); x.stroke(); }
      x.strokeStyle='#a2a8ad'; rr(D.doors[0]+3.2,q*1.32,1.3,1.1,.1); x.stroke(); rr(D.doors[1]-6,q*1.32,1.2,1.0,.1); x.stroke();
      // parabrisas
      x.fillStyle='#141c24';
      if(D.cock==='b737'){ x.beginPath(); x.moveTo(2.15,q*.62); x.lineTo(3.25,q*.52); x.lineTo(3.3,q*.78); x.lineTo(2.35,q*.86); x.closePath(); x.fill();
        x.beginPath(); x.moveTo(3.45,q*.51); x.lineTo(4.05,q*.48); x.lineTo(4.05,q*.68); x.lineTo(3.48,q*.76); x.closePath(); x.fill();
        x.beginPath(); x.moveTo(1.95,q*.36); x.lineTo(2.9,q*.32); x.lineTo(3.2,q*.47); x.lineTo(2.1,q*.56); x.closePath(); x.fill(); }
      else { x.beginPath(); x.moveTo(1.55,q*.34); x.lineTo(2.75,q*.3); x.lineTo(2.95,q*.62); x.lineTo(1.85,q*.74); x.closePath(); x.fill();
        x.beginPath(); x.moveTo(3.05,q*.32); x.lineTo(3.7,q*.33); x.lineTo(3.7,q*.6); x.lineTo(3.1,q*.62); x.closePath(); x.fill(); }
      // nombre, bandera y matrícula
      txt(s,(D.doors[0]+D.win[1])*.42+1.5,q*.48,LV.title,'bold 30px Arial,Helvetica,sans-serif',LV.tcol);
      { const fx=D.doors[0]+1.2, fy=q*.5; x.fillStyle=CEL; x.fillRect(fx,fy-.27,.9,.18); x.fillRect(fx,fy+.09,.9,.18); x.fillStyle='#fff'; x.fillRect(fx,fy-.09,.9,.18); x.fillStyle='#e9b52c'; x.beginPath(); x.arc(fx+.45,fy,.06,0,7); x.fill(); x.strokeStyle='#9aa1a6'; x.lineWidth=.02; x.strokeRect(fx,fy-.27,.9,.54); }
      txt(s,L-D.tail*.62,q*1.05,D.reg,'bold 14px Arial,Helvetica,sans-serif','#3a4248');
      // líneas de paneles
      x.strokeStyle='rgba(120,128,134,.35)'; x.lineWidth=.02; for(let X=D.nose;X<L-D.tail;X+=2.6){ x.beginPath(); x.moveTo(X,q*.1); x.lineTo(X,q*2); x.stroke(); }
    });
    // lomo: antenas pintadas y una línea fina
    x.setTransform(1,0,0,1,0,0); x.fillStyle='rgba(120,128,134,.3)'; x.fillRect(D.nose*sx,ch-3,(L-D.nose-D.tail)*sx,2);
    const t=new THREE.CanvasTexture(c); t.anisotropy=8; return TEXC[D.cock]=t; }

  // deriva: celeste, blanca y celeste con el sol, cortada en diagonal como el borde de ataque
  function finTex(D,z0,z1,H){ const k='fin'+D.cock; if(TEXC[k]) return TEXC[k]; const LV=LIV[D.cock==='b737'?'738':'e190']; const cw=512, ch=512, c=document.createElement('canvas'); c.width=cw; c.height=ch; const x=c.getContext('2d');
    const W=z1-z0, P=(zz,y)=>[(zz-z0)/W*cw,(1-y/H)*ch], F=D.fin, zL=y=>{ const t=(y-.85)/(F.h-.85); return (L2-F.le0)+((F.le0-F.le1))*t; }, L2=D.L/2;
    x.fillStyle=LV.fin; x.fillRect(0,0,cw,ch);
    // franja blanca del medio, con los bordes paralelos al borde de ataque
    const sk=(F.le0-F.le1)/(F.h-.85), yb=H*.36, yt=H*.68; x.fillStyle=LV.finBand?'#fbfbfb':LV.fin; x.beginPath();
    x.moveTo(...P(z0-20,yb-20/sk*0)); x.lineTo(...P(z1+20,yb)); x.lineTo(...P(z1+20,yt)); x.lineTo(...P(z0-20,yt)); x.closePath(); x.fill();
    // sol de mayo en el medio de la deriva
    { const ym=H*.52, zc=((F.le0-(F.le0-F.le1)*((ym-.85)/(F.h-.85)))+(F.te0+(F.te1-F.te0)*(ym/F.h)))/2-L2, [cx,cy]=P(zc,ym), r=ch*.07; x.fillStyle='#e9b52c'; x.strokeStyle='#c98f12'; x.lineWidth=3;
      for(let i=0;i<32;i++){ const a=i/32*Math.PI*2, R=i%2?r*1.75:r*2.05; x.beginPath(); x.moveTo(cx+Math.cos(a-.07)*r*.9,cy+Math.sin(a-.07)*r*.9); x.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R); x.lineTo(cx+Math.cos(a+.07)*r*.9,cy+Math.sin(a+.07)*r*.9); x.closePath(); x.fill(); }
      x.beginPath(); x.arc(cx,cy,r,0,7); x.fill(); x.stroke(); }
    x.fillStyle=LV.tip; x.fillRect(0,0,cw,ch*.045);                                     // punta azul
    const t=new THREE.CanvasTexture(c); t.anisotropy=4; t.repeat.set(1/W,1/H); t.offset.set(-z0/W,0); return TEXC[k]=t; }

  // juntador local (una malla por material)
  function Bag(){ const B=new Map(); return { add(g,m){ g=g.index?g.toNonIndexed():g; if(!g.attributes.uv) g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2)); if(!B.has(m)) B.set(m,[]); B.get(m).push(g); },
    meshes(parent,shadow=true){ const out=[]; for(const [m,gs] of B){ const geo=window.HITO.merge(gs.map(g=>{ const h=new THREE.BufferGeometry(); for(const k of ['position','normal','uv']) h.setAttribute(k,g.attributes[k]); return h; }));
        geo.computeBoundingSphere(); const me=new THREE.Mesh(geo,m); me.castShadow=shadow; me.receiveShadow=true; parent.add(me); out.push(me); } return out; } }; }
  const box=(B,m,w,h,d,x,y,z,ry,rx,rz)=>{ const g=new THREE.BoxGeometry(w,h,d); if(rz) g.rotateZ(rz); if(rx) g.rotateX(rx); if(ry) g.rotateY(ry); g.translate(x,y,z); B.add(g,m); return g; };
  const cyl=(B,m,rt,rb,h,x,y,z,seg,rx,rz)=>{ const g=new THREE.CylinderGeometry(rt,rb,h,seg||10); if(rx) g.rotateX(rx); if(rz) g.rotateZ(rz); g.translate(x,y,z); B.add(g,m); return g; };
  const sph=(B,m,r,x,y,z,sx,sy,sz)=>{ const g=new THREE.SphereGeometry(r,14,10); g.scale(sx||1,sy||1,sz||1); g.translate(x,y,z); B.add(g,m); return g; };

  // superficie de sustentación (ala, estabilizador): planta en (x = envergadura, z), espesor que se afina hacia la punta, diedro
  function surface(pts,sd,t0,tTip,semi,dih,y0){ const sh=new THREE.Shape(); pts.forEach(([a,b],i)=>sh[i?'lineTo':'moveTo'](sd*a,b));
    const g=new THREE.ExtrudeGeometry(sh,{depth:1,bevelEnabled:false}); g.rotateX(Math.PI/2); const p=g.attributes.position;
    for(let i=0;i<p.count;i++){ const ax=Math.abs(p.getX(i)), f=Math.min(1,ax/semi), th=t0+(tTip-t0)*f; p.setY(i, y0 + (p.getY(i)+.5)*th + ax*Math.tan(dih*Math.PI/180)); }
    g.computeVertexNormals(); return g; }

  function avionLinea(tipo){ const D=T[tipo]||T['738'], L=D.L, G=new THREE.Group(), B=Bag(), z=s=>L/2-s;
    const wh=mat('alWh',0xf4f5f6), bel=mat('alBel',0xc3c8cd), grey=mat('alGr',0x9aa1a7), dk=mat('alDk',0x22282d), tire=mat('alTire',0x1a1c1e), chrome=mat('alCr',0xd9dde1,{emissive:0x202224}),
      fan=mat('alFan',0x30363b), cel=mat('alCel',0x6fa8dc), red=mat('alRed',0xff3a2a,{emissive:0x991010}), grn=mat('alGrn',0x3aff6a,{emissive:0x0a8a20}), wlt=mat('alWlt',0xffffff,{emissive:0x666666}),
      skin=mat('alSkin'+tipo,0xffffff,{map:fuseTex(D)});
    // --- fuselaje: trompa que cae un poco, tramo recto y cono de cola que sube (el lomo sigue casi derecho) ---
    const N=90, rings=[];
    for(let j=0;j<N;j++){ const s=j/(N-1)*L; let f=1, dy=0;
      if(s<D.nose){ const u=1-s/D.nose; f=Math.pow(Math.max(0,1-u*u),D.nExp); dy=-(1-f)*D.ry*D.nDrop; }
      else if(s>L-D.tail){ const u=(s-(L-D.tail))/D.tail; f=1-(1-D.tEnd)*Math.pow(u,1.45); dy=(1-f)*D.ry*.86; }
      rings.push({z:z(s),yc:D.yc+dy,rx:D.rx*Math.max(f,.0001),ry:D.ry*Math.max(f,.0001)*(s>L-D.tail?(.92+.08*f):1),u:s/L}); }
    B.add(tube(rings,28),skin);
    { const last=rings[N-1]; cyl(B,dk,last.rx*.8,last.rx*.8,.5,0,last.yc,last.z-.15,10,Math.PI/2); }       // escape del APU
    // carenado ala-fuselaje
    sph(B,bel,1,0,D.yc-D.ry*.68,z(D.wLE+D.c0*.45),D.rx*1.12,D.ry*.42,D.c0*.95);
    // --- alas con su quiebre del borde de fuga, winglets, carenados de los flaps ---
    const tl=Math.tan(D.sweep*Math.PI/180), wy=D.yc-D.ry*.62, zl=z(D.wLE);
    for(const sd of [-1,1]){
      const tipLE=-D.span*tl, pts=[[0,0],[D.span,tipLE],[D.span,tipLE-D.ct],[D.kink,-D.c0],[0,-D.c0]].map(([a,b])=>[a,b]);
      const g=surface(pts,sd,.62,.14,D.span,D.dih,0); g.translate(0,wy,zl); B.add(g,wh);
      const ty=wy+D.span*Math.tan(D.dih*Math.PI/180)+.07, tz=zl+tipLE;
      { const w=D.wl, sh=new THREE.Shape(); sh.moveTo(0,0); sh.lineTo(-D.ct,0); sh.lineTo(-D.ct+(D.ct-w.t)-w.back+w.c*.2,w.h); sh.lineTo(-w.back-w.t*.4+w.c*.2,w.h); sh.closePath();
        const wg=new THREE.ExtrudeGeometry(sh,{depth:.1,bevelEnabled:false}); wg.rotateY(-Math.PI/2); wg.rotateZ(-sd*w.cant); wg.translate(sd*(D.span-.02),ty-.05,tz); B.add(wg,cel); }
      sph(B,sd>0?red:grn,.09,sd*(D.span+.05),ty,tz-.3);                                                  // luces de navegación (izq. roja)
      for(const f of [.32,.55,.76]){ const xs=D.span*f, zz=zl-xs*tl-(D.c0+(D.ct-D.c0)*f)*.86; box(B,bel,.28,.32,2.1,sd*xs,wy+xs*Math.tan(D.dih*Math.PI/180)-.12,zz-.5); }
      // motor colgado del pilón, adelante del ala
      const E=D.eng, ez=z(E.s), r=E.r, pr=[[.9,0],[1,.25],[1.02,.6],[1,1.6],[.92,2.6],[.78,3.4],[.72,E.len]].map(([k,s])=>({z:ez-s,yc:E.y,rx:r*k,ry:r*k*E.flat,u:s/E.len}));
      const ng=tube(pr,22); ng.translate(sd*E.x,0,0); B.add(ng,wh);
      { const lg=new THREE.CylinderGeometry(r*.9,r*.93,.22,22,1,true); lg.rotateX(Math.PI/2); lg.scale(1,E.flat,1); lg.translate(sd*E.x,E.y,ez-.06); B.add(lg,chrome); const ig=new THREE.CylinderGeometry(r*.86,r*.86,.5,22,1,true); ig.rotateX(Math.PI/2); ig.scale(1,E.flat,1); ig.translate(sd*E.x,E.y,ez-.25); B.add(ig,fan); } cyl(B,cel,r*1.025,r*1.025,.35,sd*E.x,E.y,ez-.95,22,Math.PI/2);
      { const fg=new THREE.CircleGeometry(r*.86,20); fg.scale(1,E.flat,1); fg.translate(sd*E.x,E.y,ez-.25); B.add(fg,fan); const sp=new THREE.ConeGeometry(r*.26,.55,12); sp.rotateX(Math.PI/2); sp.translate(sd*E.x,E.y,ez-.05); B.add(sp,chrome); }
      { const cg=new THREE.ConeGeometry(r*.5,1.1,14); cg.rotateX(-Math.PI/2); cg.translate(sd*E.x,E.y,ez-E.len-.5); B.add(cg,grey); cyl(B,dk,r*.71,r*.71,.08,sd*E.x,E.y,ez-E.len+.02,18,Math.PI/2); }
      { const pyY=wy+E.x*Math.tan(D.dih*Math.PI/180); box(B,wh,.34,pyY-E.y-r*.6+.3,E.len*.95,sd*E.x,(pyY+E.y+r*.6)/2,ez-E.len*.62); }
      // estabilizador horizontal
      { const S=D.stab, stl=Math.tan(S.sweep*Math.PI/180), sp=[[0,0],[S.semi,-S.semi*stl],[S.semi,-S.semi*stl-S.ct],[0,-S.c0]];
        const sz=z(S.s), ring=rings[Math.round(S.s/L*(N-1))]; const sg=surface(sp,sd,.32,.1,S.semi,7,0); sg.translate(0,ring.yc+S.dy-.15,sz); B.add(sg,wh); }
    }
    // --- deriva con aleta dorsal (textura propia) ---
    { const F=D.fin, ring=rings[Math.round((L-F.le0)/L*(N-1))], yb=ring.yc+ring.ry-.25, sh=new THREE.Shape();
      const p=[[z(L-F.d0),.05],[z(L-F.le0),.85],[z(L-F.le1),F.h],[z(L-F.te1),F.h],[z(L-F.te0),-.2],[z(L-F.d0+1.5),-.2]];
      p.forEach(([a,b],i)=>sh[i?'lineTo':'moveTo'](a,b));
      const zs=p.map(q=>q[0]), z0=Math.min(...zs), z1=Math.max(...zs), g=new THREE.ExtrudeGeometry(sh,{depth:.34,bevelEnabled:true,bevelThickness:.06,bevelSize:.05,bevelSegments:1});
      g.rotateY(-Math.PI/2); g.translate(.17,yb,0); const fm=mat('alFin'+tipo,0xffffff,{map:finTex(D,z0,z1,F.h)}); B.add(g,fm);
      sph(B,wlt,.08,0,yb-.4,z(L)+.25); }
    // --- antenas, balizas, pitots ---
    box(B,grey,.05,.32,.42,0,D.yc+D.ry+.14,z(L*.36)); box(B,grey,.05,.26,.36,0,D.yc+D.ry+.12,z(L*.52)); box(B,grey,.05,.28,.4,0,D.yc-D.ry-.12,z(L*.3));
    sph(B,red,.11,0,D.yc+D.ry+.04,z(L*.44),1,.7,1); sph(B,red,.11,0,D.yc-D.ry-.03,z(L*.47),1,.7,1);
    for(const sd of [-1,1]) cyl(B,chrome,.025,.025,.3,sd*D.rx*.72,D.yc+.2,z(1.6),5,Math.PI/2);
    // --- tren de aterrizaje ---
    const GR=new THREE.Group(), BG=Bag(), Gd=D.gear;
    { const zn=z(Gd.nose), yb=D.yc-D.ry*.94; cyl(BG,chrome,.07,.07,yb-Gd.rn,0,(yb+Gd.rn)/2,zn,8); cyl(BG,grey,.11,.11,.7,0,yb-.4,zn,8);
      for(const sd of [-1,1]){ cyl(BG,tire,Gd.rn,Gd.rn,.24,sd*.22,Gd.rn,zn,16,0,Math.PI/2); cyl(BG,grey,Gd.rn*.55,Gd.rn*.55,.25,sd*.22,Gd.rn,zn,10,0,Math.PI/2); }
      box(BG,grey,.03,.55,1.0,.3,yb-.22,zn+.1); box(BG,grey,.03,.55,1.0,-.3,yb-.22,zn+.1); }
    for(const sd of [-1,1]){ const zm=z(Gd.main), x0=sd*Gd.track, yt=wy+Gd.track*Math.tan(D.dih*Math.PI/180);
      cyl(BG,chrome,.1,.1,yt-Gd.rm,x0,(yt+Gd.rm)/2,zm,8); cyl(BG,grey,.17,.17,1.0,x0,yt-.55,zm,8); box(BG,grey,.12,.12,1.2,x0*.6,yt-.25,zm,0,0,sd*.9);
      for(const k of [-1,1]){ const xw=x0+k*.42; cyl(BG,tire,Gd.rm,Gd.rm,.36,xw,Gd.rm,zm,18,0,Math.PI/2); cyl(BG,grey,Gd.rm*.55,Gd.rm*.55,.37,xw,Gd.rm,zm,10,0,Math.PI/2); } }
    BG.meshes(GR); G.add(GR);
    B.meshes(G);
    G.userData.gear=GR; G.userData.dim={L,span:D.span+.3,h:D.yc+D.ry+D.fin.h,tipo};
    return G; }
  window.avionLinea=avionLinea; window.AVION_LINEA=T;

  // ----- aviones que despegan huyendo (11-personas.js): el modelo nuevo y el tren que se guarda -----
  // se instala cuando ya cargaron todos los scripts (11-personas.js y 03-mapas.js vienen después de este archivo)
  let alt=0;
  function instalar(){
  window.airlinerMesh=function(){ const tipo=(alt++%2)?'e190':'738', g=avionLinea(tipo), d=g.userData.dim;
    const hit=new THREE.Mesh(new THREE.BoxGeometry(d.span*2*.75,5,d.L*.85),new THREE.MeshBasicMaterial({visible:false})); hit.position.y=3; g.add(hit); return {g,hit}; };
  const _up=updatePlanes;
  updatePlanes=function(dt){
    _up(dt);
    for(const pl of civPlanes){ const gr=pl.g.userData.gear; if(gr) gr.visible=!(pl.state>=1&&pl.pos.y-heightAt(pl.pos.x,pl.pos.z)>14); jetSound(pl); }
    for(const pl of [...JS]) if(!civPlanes.includes(pl)) jetStop(pl); };
  // sonidos CC0 de Freesound (22/11/2026): jettaxi = turbina rodando (joeffl #843280), jetroar = plena potencia de cerca (Sonicwave32 #436511),
  // jetfar = despegue lejano (clif_creates #251973); bucles de 6–7 s con 0,3 s de margen a cada lado (herramientas/sonidos/aviones-linea.py)
  Object.assign(SND_FILES,{jettaxi:1,jetroar:1,jetfar:1});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',instalar); else instalar();
  // ----- sonido de cada avión: rodaje, plena potencia de cerca y rugido grave de lejos, en una sola fuente con posición -----
  const JS=new Set(), LEN={jettaxi:7,jetroar:6,jetfar:6};
  function jetSound(pl){ if(typeof AC==='undefined'||!AC||!extBus) return;
    if(!pl._au){ if(!['jettaxi','jetroar','jetfar'].every(k=>SFX[k]&&SFX[k].length)) return;
      if(pl.snd){ pl.snd.stop(); pl.snd=null; }                                                    // el 'flyover' genérico de 11-personas.js
      const pn=AC.createPanner(); pn.panningModel='equalpower'; pn.distanceModel='inverse'; pn.refDistance=110; pn.rolloffFactor=1;
      const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=9000; lp.connect(pn).connect(extBus);
      const mk=k=>{ const s=AC.createBufferSource(); s.buffer=SFX[k][0]; s.loop=true; s.loopStart=.3; s.loopEnd=.3+LEN[k]; const g=AC.createGain(); g.gain.value=0; s.connect(g).connect(lp); s.start(0,.3+Math.random()*LEN[k]); return {s,g}; };
      pl._au={pn,lp,taxi:mk('jettaxi'),roar:mk('jetroar'),far:mk('jetfar')}; JS.add(pl); }
    const A=pl._au, P=pl.pos, t=AC.currentTime, d=P.distanceTo(camera.position), st=pl.state, v=pl.v||0;
    if(A.pn.positionX){ A.pn.positionX.value=P.x; A.pn.positionY.value=P.y+3; A.pn.positionZ.value=P.z; } else A.pn.setPosition(P.x,P.y+3,P.z);
    A.lp.frequency.setTargetAtTime(Math.max(600,9000*Math.exp(-d/650)),t,.2);
    const full=st>=0&&st<3?1:0, taxi=st===-1?1:(st===0?Math.max(0,1-v/25):0), near=Math.max(0,Math.min(1,1-(d-150)/550));
    const ramp=st===0?Math.min(1,.35+v/45):1;                                                       // al soltar los frenos sube de a poco
    A.taxi.g.gain.setTargetAtTime(1.3*taxi,t,.4); A.roar.g.gain.setTargetAtTime(2.6*full*ramp*near,t,.3); A.far.g.gain.setTargetAtTime(2.4*full*ramp*(1-near*.85),t,.3);
    A.taxi.s.playbackRate.value=.9+Math.min(v,15)/15*.18; A.roar.s.playbackRate.value=.92+Math.min(v,95)/95*.14; }
  function jetStop(pl){ const A=pl._au; JS.delete(pl); if(!A) return; pl._au=null; try{ const t=AC.currentTime; for(const k of ['taxi','roar','far']){ A[k].g.gain.setTargetAtTime(0,t,.5); A[k].s.stop(t+2.5); } }catch(e){} }
  addEventListener('DOMContentLoaded',()=>{ if(typeof stopAllLoops==='function'){ const _sa=stopAllLoops; stopAllLoops=function(){ for(const pl of [...JS]) jetStop(pl); return _sa.apply(this,arguments); }; } });
})();
