// Barrio Sor Asunta más real (pedido de Sebastián, 19/11/2026, con referencias de Sketchfab; todo hecho por código):
//  · Casas: cada caja del mapa pasa a ser una casa de barrio de Corrientes. Techo de chapa a un agua (con el relleno de mampostería a los
//    costados y, a veces, el muro de carga del frente más alto), techo de tejas a dos aguas o losa con parapeto; tanque de agua tipo
//    Rotoplas (negro o beige) sobre una base de ladrillos, antena de TV, aire acondicionado en la pared del costado, pilar de luz con el
//    medidor; galería al frente (losa o chapa, columnas, piso de baldosa colorada) cuando hay lugar entre la casa y la calle (la galería
//    también choca: se agranda la caja de choque de la casa hacia el frente).
//  · Frente del lote: tapial con reja, reja sola, alambrado o muro revocado, con portón de auto o puerta de reja. Son props (se voltean
//    con los tanques y las explosiones, como los postes).
//  · Postes de madera de la red eléctrica (cruceta, aisladores, rack de baja tensión, transformador en algunos) con farol de brazo y
//    luminaria que se prende de noche, cables con comba entre postes y acometidas a las casas; si se cae el poste, sus cables quedan
//    en el suelo. Carteles azules con el nombre de las calles en las esquinas (ya no se pintan los nombres en el piso).
//  · Calles: huellas de las ruedas, charcos, pasto que invade los bordes y cunetas en las de tierra; hormigón con juntas y cordón cuneta
//    en Las Margaritas; entradas de autos y veredas frente a las casas.
// Todo instanciado (una llamada de dibujo por tipo de pieza) y con sorteo fijo por casa (mulberry0): igual en todas las PCs.
(function(){
  // 'sor' = el barrio completo; 'osm' = mapas reales (Itatí, Laguna Brava, Paso de la Patria, Corrientes…): solo las casas bajas,
  // sin galerías, postes, carteles ni suelo propio, y todo partido en sectores de 260 m que se apagan de lejos (cullAdd)
  const MODE=()=>typeof W==='undefined'?null:W===WORLDS.sor?'sor':W.osm?'osm':null, ON=()=>!!MODE();
  const SMALL=b=>isFinite(b.max)&&b.max<1e8&&b.top-b.base<=6.4&&b.w*b.d<=280&&b.w>2.5&&b.d>2.5;
  const FENCE_MAX=2000;
  const merge=a=>THREE.BufferGeometryUtils.mergeBufferGeometries(a.map(g=>g.index?g.toNonIndexed():g));
  const bx=(w,h,d,x,y,z)=>new THREE.BoxGeometry(w,h,d).translate(x,y,z);
  const cy=(r0,r1,h,y,s=8)=>{ const g=new THREE.CylinderGeometry(r0,r1,h,s); g.translate(0,y+h/2,0); return g; };
  const prism=pts=>{ const sh=new THREE.Shape(); pts.forEach(([u,v],i)=>i?sh.lineTo(u,v):sh.moveTo(u,v)); const g=new THREE.ExtrudeGeometry(sh,{depth:1,bevelEnabled:false}); g.translate(0,0,-.5); g.rotateY(-Math.PI/2); return g; };
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _q2=new THREE.Quaternion(), _v=new THREE.Vector3(), _s=new THREE.Vector3(), _e=new THREE.Euler(), _c=new THREE.Color(), UP=new THREE.Vector3(0,1,0), Z0=new THREE.Matrix4().makeScale(0,0,0);
  const frac=v=>v-Math.floor(v);

  // ---------- texturas hechas por código ----------
  const canvasTex=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; f(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=ANISO; return t; };
  // chapa acanalada (gris claro: la tiñe el color de cada techo)
  const chapaTex=canvasTex(64,64,(x,w,h)=>{ for(let i=0;i<w;i++){ const v=.72+.28*Math.sin(i/w*Math.PI*2*4); x.fillStyle=`rgb(${v*235|0},${v*235|0},${v*235|0})`; x.fillRect(i,0,1,h); }
    for(let i=0;i<40;i++){ x.fillStyle=`rgba(90,60,40,${rand(.04,.16)})`; x.fillRect(rand(0,w),rand(0,h),rand(1,4),rand(4,20)); } x.fillStyle='rgba(0,0,0,.18)'; x.fillRect(0,0,w,2); });
  // tejas francesas en hileras
  const tejaTex=canvasTex(128,128,(x,w,h)=>{ x.fillStyle='#e8e8e8'; x.fillRect(0,0,w,h);
    for(let r=0;r<4;r++){ const y=r*32; for(let k=0;k<8;k++){ const X=k*16+(r%2)*8; const g=x.createLinearGradient(X,0,X+16,0); g.addColorStop(0,'#bdbdbd'); g.addColorStop(.5,'#f4f4f4'); g.addColorStop(1,'#a9a9a9');
        x.fillStyle=g; x.fillRect(X,y,16,30); x.fillRect(X-128,y,16,30); } x.fillStyle='rgba(0,0,0,.35)'; x.fillRect(0,y+28,w,4); }
    for(let i=0;i<120;i++){ x.fillStyle=`rgba(${rand(40,90)|0},${rand(30,60)|0},20,${rand(.05,.2)})`; x.fillRect(rand(0,w),rand(0,h),rand(2,8),rand(2,6)); } });
  // alambrado romboidal (con transparencia)
  const alamTex=canvasTex(64,64,(x,w,h)=>{ x.clearRect(0,0,w,h); x.strokeStyle='rgba(150,155,150,1)'; x.lineWidth=2.2; for(let i=-1;i<3;i++){ x.beginPath(); x.moveTo(i*32,0); x.lineTo(i*32+64,64); x.stroke(); x.beginPath(); x.moveTo(i*32+64,0); x.lineTo(i*32,64); x.stroke(); } });
  // material con las coordenadas de la textura escaladas por el tamaño de cada instancia (la chapa y las tejas no se estiran)
  const scaledMat=(map,per,extra={})=>{ const m=new THREE.MeshLambertMaterial(Object.assign({map},extra)); m.onBeforeCompile=sh=>{ sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
    #ifdef USE_INSTANCING
      vec3 scI=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));
      vUv=abs(normal.y)>.5?uv*vec2(scI.x,scI.z)/${per.toFixed(2)}:uv*vec2(abs(normal.x)>.5?scI.z:scI.x,scI.y)/${per.toFixed(2)};
    #endif`); }; m.customProgramCacheKey=()=>'barrioUV'+per; return m; };

  // ---------- geometrías ----------
  const G={ box:new THREE.BoxGeometry(1,1,1),
    wedge:prism([[-.5,0],[.5,0],[.5,1]]),          // relleno debajo de la chapa (alto adelante)
    gable:prism([[-.5,0],[.5,0],[0,1]]),           // hastial del techo a dos aguas
    tank:(()=>{ const P=[[0,0],[.52,0],[.56,.08],[.56,.3],[.585,.33],[.56,.36],[.56,.62],[.585,.65],[.56,.68],[.56,.9],[.42,1.04],[.22,1.12],[.22,1.2],[0,1.2]].map(([r,y])=>new THREE.Vector2(r,y)); return new THREE.LatheGeometry(P,8); })(),   // ~260 triángulos (con los dos anillos en el perfil)
    antenna:merge([cy(.025,.025,3.2,0,5),bx(1.6,.03,.03,0,2.9,0),...[-.6,-.3,0,.3,.6].map(x=>bx(.02,.02,.9-Math.abs(x)*.6,x,2.9,0)),bx(1.1,.025,.025,0,2.4,0),...[-.4,0,.4].map(x=>bx(.02,.02,.6,x,2.4,0))]),
    ac:merge([bx(.84,.56,.28,0,0,0)]), acGrill:new THREE.CircleGeometry(.2,12).translate(-.12,0,.141), pillar:merge([bx(.42,1.35,.32,0,.675,0),bx(.46,.06,.36,0,1.38,0)]),
    meter:merge([bx(.3,.38,.12,0,1.0,.2),bx(.22,.12,.02,0,1.05,.265)]) };

  // ---------- lotes de instancias ----------
  // cada pieza guarda de qué casa es y si va en el techo ('r') o abajo ('g'), para esconderla cuando la casa se derrumba
  let H=null;   // estado del mapa
  function batch(key,geo,mat,shadow=true){ return H.B[key]||(H.B[key]={geo,mat,list:[],shadow}); }
  function put(key,house,tag,m,col){ const B=H.B[key]; B.list.push({m:m.clone(),c:col,h:house,tag}); }

  // marco del frente de cada casa: girado para que el frente quede hacia +z local
  function frame(b,side){ const a=side==='+z'?b.a:side==='-z'?b.a+Math.PI:side==='+x'?b.a+Math.PI/2:b.a-Math.PI/2, W2=side[1]==='z'?b.w:b.d, D2=side[1]==='z'?b.d:b.w;
    const c=Math.cos(a), s=Math.sin(a); return {a,W:W2,D:D2,c,s,P:(lx,lz)=>[b.x+lx*c+lz*s,b.z-lx*s+lz*c],q:new THREE.Quaternion().setFromAxisAngle(UP,a)}; }
  function mat(F,lx,y,lz,sx,sy,sz,rx=0,ry=0,rz=0){ const [x,z]=F.P(lx,lz); _e.set(rx,ry,rz); _q2.setFromEuler(_e); _q.copy(F.q).multiply(_q2); return _m.compose(_v.set(x,y,z),_q,_s.set(sx,sy,sz)); }

  const WALLS=[0xf3eee4,0xf0e2b4,0xe9c9b2,0xbcd6e2,0xc4e2d2,0xeac9c6,0xdcbf8a,0xe8e4dc,0xd9d6cc,0xf2d9a0,0xcfdcc0,0xb9c9d8];
  const CHAPA=[0xbfc3c5,0xb2b7ba,0x9a6a4a,0xa0442e,0x4f7056,0x46607e,0xc9cccd];
  const TEJA=[0xa8452e,0xb4553a,0x96402c,0x8a5a44];
  const IRON=[0x1e1e1e,0x1e1e1e,0x2a3a2a,0xe8e6e0,0x3a2a22];

  // ---------- planificación (antes de dibujar las casas: se agranda la caja de choque de las galerías) ----------
  function plan(list){ const osm=MODE()==='osm'; H={B:{},houses:[],fences:[],park:[],osm};
    for(const b of list){ const R=mulberry0(1013+b.i*7919), r=()=>R();
      const c=Math.cos(b.a), s=Math.sin(b.a); let best=1e9, side='+z';
      for(const [lx,lz,n] of [[b.w/2,0,'+x'],[-b.w/2,0,'-x'],[0,b.d/2,'+z'],[0,-b.d/2,'-z']]){ const d=nearestSeg(b.x+lx*c+lz*s,b.z-lx*s+lz*c,streetSegs).d; if(d<best){ best=d; side=n; } }
      const F=frame(b,side), gap=best-3.3, hs={b,F,side,gap,r:R,parts:[]};
      hs.roof=r()<.44?'chapa':r()<.4?'teja':'losa'; if(b.w*b.d>140&&hs.roof==='teja') hs.roof='losa';
      hs.dF=gap>=2.1&&gap<16?Math.min(gap-1.3,6.5):0;                             // frente del lote (cerco) a dF del frente de la casa
      hs.gd=(!osm&&hs.dF>=2.2&&r()<.8)?Math.min(2.6,hs.dF-.7):0;                 // galería
      hs.gw=hs.gd?F.W*(r()<.5?1:.55+r()*.3):0; hs.gx=hs.gd&&hs.gw<F.W?(r()<.5?-1:1)*(F.W-hs.gw)/2:0;
      if(hs.gd){ const o=b.box.ob, ext=hs.gd; if(side[1]==='z'){ o.hd+=ext/2; const k=side[0]==='+'?1:-1; o.cx+=s*ext/2*k; o.cz+=c*ext/2*k; } else { o.hw+=ext/2; const k=side[0]==='+'?1:-1; o.cx+=c*ext/2*k; o.cz-=s*ext/2*k; }
        // la caja de la grilla vuelve a cubrir las cuatro esquinas
        let a=1e9,A=-1e9,e=1e9,E=-1e9; for(const [lx,lz] of [[-o.hw,-o.hd],[o.hw,-o.hd],[o.hw,o.hd],[-o.hw,o.hd]]){ const x=o.cx+lx*o.c+lz*o.s, z=o.cz-lx*o.s+lz*o.c; a=Math.min(a,x); A=Math.max(A,x); e=Math.min(e,z); E=Math.max(E,z); }
        b.box.min.x=a; b.box.max.x=A; b.box.min.z=e; b.box.max.z=E; }
      hs.fence=hs.dF&&(!osm||r()<.7)?['tr','tr','r','a','m','tr'][(r()*6)|0]:null;
      hs.col=WALLS[(r()*WALLS.length)|0]; hs.brick=frac(b.x*.1371+b.z*.3113)<.28;   // mismo sorteo que fachadas.js (casilla de ladrillo)
      H.houses.push(hs); }
    if(!osm){ grid=new Map(); houseBoxes.forEach(gridAdd); } }

  // ---------- las casas ----------
  function buildHouses(){
    const lam=new THREE.MeshLambertMaterial({color:0xffffff}), dark=new THREE.MeshLambertMaterial({color:0xffffff});
    batch('box',G.box,lam); batch('wedge',G.wedge,new THREE.MeshLambertMaterial({color:0xffffff})); batch('gable',G.gable,new THREE.MeshLambertMaterial({color:0xffffff}));
    batch('chapa',G.box,scaledMat(chapaTex,.62)); batch('teja',G.box,scaledMat(tejaTex,1.25)); batch('tank',G.tank,new THREE.MeshLambertMaterial({color:0xffffff}));
    batch('antenna',G.antenna,dark,false); batch('ac',G.ac,new THREE.MeshLambertMaterial({color:0xffffff})); batch('acg',G.acGrill,new THREE.MeshLambertMaterial({color:0x5a5e60}),false);
    batch('pillar',G.pillar,new THREE.MeshLambertMaterial({color:0xffffff})); batch('meter',G.meter,new THREE.MeshLambertMaterial({color:0xd8d8d0}),false);
    for(const hs of H.houses){ const {b,F}=hs, r=hs.r, top=b.top, g=heightAt(b.x,b.z), Wd=F.W, D=F.D, wall=hs.brick?0xf6f0ea:hs.col;
      b.wall=wall; wallsIM.setColorAt(b.i,_c.set(wall));
      // ---- techo ----
      if(hs.roof!=='losa'){ roofsIM.setMatrixAt(b.i,Z0); b.sag=true; if(rtankIM) rtankIM.setMatrixAt(b.i,Z0); }
      else if(rtankIM) rtankIM.setMatrixAt(b.i,Z0);
      if(hs.roof==='chapa'){ const fall=Math.max(.35,D*Math.tan(.11)), back=r()<.3, rise=.18, col=CHAPA[(r()*CHAPA.length)|0], ang=Math.atan2(fall,D);
        const k=back?-1:1;   // k=1: alto adelante, cae hacia atrás
        put('wedge',hs,'r',mat(F,0,top,0,Wd,fall,D,0,back?Math.PI:0,0),wall);
        put('chapa',hs,'r',mat(F,0,top+fall/2+rise,0,Wd+.5,.05,(D+.7)/Math.cos(ang),-k*ang,0,0),col);
        if(r()<.55){ const ph=fall+rise+.45; put('box',hs,'r',mat(F,0,top+ph/2-.05,k*(D/2-.08),Wd+.04,ph,.18),wall); put('box',hs,'r',mat(F,0,top+ph,k*(D/2-.08),Wd+.14,.07,.28),0xd8d4cc); }   // muro de carga con su borde
        else put('box',hs,'r',mat(F,0,top+fall+rise-.05,k*(D/2+.33),Wd+.52,.22,.04),0xe8e6e0); }                                   // cenefa
      else if(hs.roof==='teja'){ const ridge=D/2*Math.tan(.42), col=TEJA[(r()*TEJA.length)|0], L=(D/2+.5)/Math.cos(.42);
        put('gable',hs,'r',mat(F,0,top,0,Wd,ridge,D),wall);
        for(const k of [1,-1]) put('teja',hs,'r',mat(F,0,top+ridge-(D/4+.25)*Math.tan(.42)+.05,k*(D/4+.25),Wd+.6,.07,L,k*.42,0,0),col);
        put('box',hs,'r',mat(F,0,top+ridge+.08,0,Wd+.62,.14,.2),col); }                                                            // cumbrera
      else { const ph=.32+r()*.3; for(const [x,z,sx,sz] of [[0,D/2-.08,Wd,.16],[0,-D/2+.08,Wd,.16],[Wd/2-.08,0,.16,D],[-Wd/2+.08,0,.16,D]]) put('box',hs,'r',mat(F,x,top+.24+ph/2,z,sx,ph,sz),wall);
        put('box',hs,'r',mat(F,-Wd/2-.12,top-.2,-D/2+.6,.14,.1,.4),0x8a8a86); }                                                    // gárgola
      // ---- tanque de agua sobre su base de ladrillos ----
      if(r()<(H.osm?.55:.85)){ const tx=(r()-.5)*Wd*.4, tz=-D/2+1.1+r()*.6, bh=hs.roof==='losa'?.35+r()*.4:hs.roof==='chapa'?1.1+r()*.5:1.6+r()*.4, by=top+(hs.roof==='losa'?.24:0);
        put('box',hs,'r',mat(F,tx,by+bh/2,tz,1.3,bh,1.3),hs.brick||r()<.5?0xb4806a:wall); put('box',hs,'r',mat(F,tx,by+bh+.04,tz,1.42,.08,1.42),0xa8a49c);
        put('tank',hs,'r',mat(F,tx,by+bh+.08,tz,1,1,1),r()<.62?0x1d1d1d:r()<.6?0xd6c9a4:0x4a7aa8); }
      if(r()<.38) put('antenna',hs,'r',mat(F,(r()-.5)*Wd*.5,top+(hs.roof==='teja'?D/2*Math.tan(.42)*.6:.3),r()*D*.3,1,1,1,0,r()*3,0),0x3a3c3e);
      // ---- aire acondicionado en un costado ----
      if(r()<.45){ const sd=r()<.5?1:-1, z=(r()-.5)*D*.5, y=g+1.9+r()*.6; put('ac',hs,'g',mat(F,sd*(Wd/2+.15),y,z,1,1,1,0,sd*Math.PI/2,0),0xeeeeea); put('acg',hs,'g',mat(F,sd*(Wd/2+.15),y,z,1,1,1,0,sd*Math.PI/2,0),0x5a5e60);
        put('box',hs,'g',mat(F,sd*(Wd/2+.04),y-.6,z+.25,.03,1.2,.03),0xe0e0dc); }
      // ---- galería ----
      if(hs.gd){ const gd=hs.gd, gw=hs.gw, gx=hs.gx, z0=D/2, zc=z0+gd/2, y=top-.12, chap=r()<.4, pc=r()<.5?wall:r()<.5?0xe8e6e0:0x2a2a2a, thin=pc===0x2a2a2a;
        if(chap){ const ang=.1; put('chapa',hs,'g',mat(F,gx,y-gd*Math.tan(ang)/2+.05,zc+.15,gw+.2,.05,gd+.35,ang,0,0),CHAPA[(r()*CHAPA.length)|0]); put('box',hs,'g',mat(F,gx,y-gd*Math.tan(ang)-.05,z0+gd+.3,gw+.22,.16,.05),0xe6e4de); }
        else { put('box',hs,'g',mat(F,gx,y,zc+.1,gw+.2,.18,gd+.2),wall); put('box',hs,'g',mat(F,gx,y+.13,z0+gd+.17,gw+.24,.1,.08),0xd8d4cc); }
        const n=gw>6?3:2, py=g, ph=y-py-(chap?gd*Math.tan(.1):0);
        for(let i=0;i<n;i++){ const x=gx-gw/2+.15+i*(gw-.3)/(n-1); put('box',hs,'g',mat(F,x,py+ph/2,z0+gd-.12,thin?.1:.22,ph,thin?.1:.22),pc); }
        put('box',hs,'g',mat(F,gx,g+.06,zc,gw,.14,gd),r()<.6?0x9a4e3e:0x9c9a94);                                                     // piso de baldosa colorada o cemento
        put('box',hs,'g',mat(F,gx,g+.03,z0+gd+.22,Math.min(1.4,gw),.08,.4),0xa8a69e); }                                             // escalón
      // ---- pilar de luz con el medidor, al frente ----
      if(hs.dF>=1.2&&r()<.7){ const x=(r()<.5?-1:1)*(Wd/2-.4), z=D/2+hs.dF-.3; put('pillar',hs,'g',mat(F,x,g,z,1,1,1),hs.brick?0xb4806a:wall); put('meter',hs,'g',mat(F,x,g,z,1,1,1),0xd8d8d0); }
      // ---- cerco del frente (props: se planifican acá y se arman en buildProps) ----
      if(hs.fence) planFence(hs); }
    wallsIM.instanceColor.needsUpdate=true; roofsIM.instanceMatrix.needsUpdate=true; if(rtankIM) rtankIM.instanceMatrix.needsUpdate=true;
    // a mallas instanciadas
    // a mallas instanciadas: en el barrio una por tipo; en los mapas reales una por tipo y por sector de 260 m (las chicas se apagan a 260 m)
    const SMALLK={tank:1,antenna:1,ac:1,acg:1,pillar:1,meter:1};
    for(const k in H.B){ const B=H.B[k]; if(!B.list.length) continue;
      const groups=H.osm?[...cells(B.list,260,e=>e.h.b.x,e=>e.h.b.z).values()]:[B.list];
      for(const L of groups){ const im=new THREE.InstancedMesh(B.geo,B.mat,L.length); let cx=0,cz=0,y=0;
        L.forEach((e,i)=>{ im.setMatrixAt(i,e.m); im.setColorAt(i,_c.set(e.c)); e.h.parts.push([im,i,e.tag]); cx+=e.h.b.x; cz+=e.h.b.z; y+=e.h.b.top; });
        im.castShadow=B.shadow&&(k==='chapa'||k==='teja'||k==='gable'||k==='wedge'||(!H.osm&&(k==='box'||k==='tank')));   // en los mapas reales solo los techos hacen sombra im.receiveShadow=true; im.frustumCulled=false; im.instanceMatrix.needsUpdate=true; im.instanceColor.needsUpdate=true; worldGroup.add(im);
        if(H.osm){ cx/=L.length; cz/=L.length; y/=L.length; const r=Math.max(...L.map(e=>Math.hypot(e.h.b.x-cx,e.h.b.z-cz)))+14; cullAdd(im,cx,y,cz,r,SMALLK[k]?260:0); } } }
    for(const hs of H.houses) hs.b.hs=hs;
    if(!H.osm)     driveways(); }

  // cercos del frente: tramos de 2 m a lo largo de la línea del lote, con portón o puerta, y vueltas hacia la casa
  function planFence(hs){ const {b,F}=hs, r=hs.r, z=F.D/2+hs.dF, ext=.6+r()*1.2, x0=-F.W/2-ext, x1=F.W/2+ext, L=x1-x0;
    const gw=F.W>=7&&r()<.6?3:1.1, gc=(r()-.5)*(F.W-gw-1), ty=hs.fence, wc=hs.brick?0xb4806a:r()<.6?hs.col:0xe8e4dc, ic=IRON[(r()*IRON.length)|0];
    const add=(k,lx,lz,a,len)=>{ if(H.osm&&H.fences.length>=FENCE_MAX) return; const [x,zz]=F.P(lx,lz); if(nearestSeg(x,zz,streetSegs).d<3.9) return; if(gridQuery(x,zz,3).some(o=>!o.dead&&obPush(x,zz,.35,o))) return;
      H.fences.push({k,x,z:zz,a,wc,ic,len}); };
    for(let u=x0;u<x1-.2;u+=2){ const m=u+1; if(Math.abs(m-gc)<gw/2+.4){ continue; } add(ty,m,z,F.a,2); }
    add(gw>2?'g':'gp',gc,z,F.a,gw);
    if(hs.dF>=1.6) for(const sd of [-1,1]) for(let v=F.D/2+.5;v<z-.4;v+=2) add(ty,sd*(F.W/2+ext),Math.min(v+1,z-1),F.a+Math.PI/2,2); }

  // entradas de autos y veredas pintadas en el suelo, frente a las casas
  function driveways(){ if(!groundCanvas) return; const x=groundCanvas.getContext('2d'), SC=groundCanvas.width/(IW+2*PAD);
    const px=(X,Z)=>{ const [a,b2]=toPx(X,Z); return [(a+PAD)*SC,(b2+PAD)*SC]; };
    const quad=(F,x0,z0,x1,z1,col)=>{ const P=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]].map(([lx,lz])=>px(...F.P(lx,lz))); x.fillStyle=col; x.beginPath(); P.forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p)); x.fill(); };
    for(const hs of H.houses){ if(hs.gap<1.4) continue; const {F}=hs, r=mulberry0(77+hs.b.i*31), out=hs.gap+.2;
      if(r()<.65) quad(F,-F.W/2-.6,F.D/2+(hs.gd||0)+.1,F.W/2+.6,F.D/2+out,'rgba(150,146,134,.55)');                       // vereda de cemento
      else quad(F,-F.W/2,F.D/2+(hs.gd||0)+.1,F.W/2,F.D/2+out,'rgba(96,120,64,.45)');                                         // vereda de pasto
      if(F.W>=7&&r()<.55){ const cx=(r()-.5)*(F.W-3); quad(F,cx-1.3,F.D/2,cx-.4,F.D/2+out+1.5,'rgba(160,156,146,.85)'); quad(F,cx+.4,F.D/2,cx+1.3,F.D/2+out+1.5,'rgba(160,156,146,.85)'); } }   // dos huellas de hormigón
    for(const o of worldGroup.children) if(o.material&&o.material.map&&o.material.map.image===groundCanvas) o.material.map.needsUpdate=true; }

  // ---------- esconder piezas al derrumbarse ----------
  function hideParts(b,tags){ const hs=b&&b.hs; if(!hs) return; const touched=new Set(); for(const [im,i,tag] of hs.parts){ if(!tags.includes(tag)) continue; im.setMatrixAt(i,Z0); touched.add(im); } touched.forEach(im=>im.instanceMatrix.needsUpdate=true); }
  function sagParts(b){ const hs=b&&b.hs; if(!hs||hs.sagged) return; hs.sagged=1; const R=mulberry0(b.i*13+5), T=new THREE.Matrix4(), c=new THREE.Vector3(b.x,b.top,b.z), touched=new Set();
    T.makeTranslation(c.x,c.y-.25,c.z).multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler((R()-.5)*.2,0,(R()-.5)*.2))).multiply(new THREE.Matrix4().makeTranslation(-c.x,-c.y,-c.z));
    for(const [im,i,tag] of hs.parts){ if(tag!=='r') continue; im.getMatrixAt(i,_m); _m.premultiply(T); im.setMatrixAt(i,_m); touched.add(im); } touched.forEach(im=>im.instanceMatrix.needsUpdate=true); }
  const _db=damageBuilding;
  damageBuilding=function(b,dmg,fromNet){ const was=b?b.hp:0; const r=_db.apply(this,arguments); try{ if(b&&b.hs&&b.hp<was){ if(b.hp<=0) hideParts(b,['r','g']); else if(b.hp<b.max*.45) sagParts(b); } }catch(e){ console.warn('barrio',e); } return r; };
  if(typeof ruTopsOff==='function'){ const _rt=ruTopsOff; ruTopsOff=function(b){ const r=_rt.apply(this,arguments); try{ hideParts(b,['r']); }catch(e){} return r; }; }

  const _fb=finalizeBuildings;
  finalizeBuildings=function(){ if(!ON()||!bList.length) return _fb.apply(this,arguments); const list=MODE()==='osm'?bList.filter(SMALL):bList.slice();
    try{ plan(list); }catch(e){ console.warn('barrio plan',e); H=null; }
    const r=_fb.apply(this,arguments); try{ if(H) buildHouses(); }catch(e){ console.warn('barrio casas',e); } return r; };

  // ---------- props: cercos, postes, carteles ----------
  const WIRE=new THREE.LineBasicMaterial({color:0x161616,transparent:true,opacity:.75});
  WIRE.onBeforeCompile=sh=>{ sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vWD;').replace('#include <project_vertex>','#include <project_vertex>\nvWD=-mvPosition.z;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vWD;').replace('#include <fog_fragment>','#include <fog_fragment>\ngl_FragColor.a*=1.0-smoothstep(70.0,120.0,vWD);'); };
  const WOOD=new THREE.MeshLambertMaterial({color:0x6a5642}), PORC=new THREE.MeshStandardMaterial({color:0x7fa08a,roughness:.25,metalness:.1}), STEEL=new THREE.MeshStandardMaterial({color:0x8c9094,roughness:.55,metalness:.5});
  const LENS=new THREE.MeshStandardMaterial({color:0xe8e8e0,roughness:.2,emissive:0x000000,side:THREE.DoubleSide});
  // poste de madera de 9,3 m: punta biselada, base embreada, cruceta a lo largo de z (hacia la calle) con riostras, 3 aisladores de
  // media tensión, rack de baja tensión con 3 carretes del lado de la calle, pernos-escalón
  const STEPS=[]; for(let i=0;i<10;i++) STEPS.push(cy(.014,.014,.24,0,4).rotateZ(Math.PI/2).translate(i%2?.17:-.17,2.6+i*.5,0));
  const poleG=merge([cy(.105,.15,9.6,-.3,9),cy(0,.105,.12,9.3,9),cy(.16,.175,.6,-.05,9),bx(.11,.12,2.5,0,8.55,0),
    bx(.03,.7,.03,0,8.25,.32).rotateX(-.65),bx(.03,.7,.03,0,8.25,-.32).rotateX(.65),bx(.05,.5,.08,0,7.0,.12),...STEPS]);
  const INS=[[8.62,-1.05],[8.62,1.05],[9.4,0]], LV=[[7.25,.2],[6.95,.2],[6.65,.2]];
  const insG=merge([...INS.map(([y,z])=>merge([cy(.016,.016,.1,y-.04,5).translate(0,0,z),cy(.075,.05,.07,y+.05,8).translate(0,0,z),cy(.055,.035,.06,y+.12,8).translate(0,0,z)])),
    ...LV.map(([y,z])=>cy(.05,.05,.1,y-.05,8).translate(0,0,z+.06))]);
  // farol de brazo: caño curvo hacia la calle y luminaria tipo "cobra"
  const armG=(()=>{ const P=[[0,6.1],[0,6.1],[.5,6.38],[1.2,6.55],[1.9,6.62]], parts=[]; for(let i=1;i<P.length-1;i++){ const [z0,y0]=P[i], [z1,y1]=P[i+1], L=Math.hypot(z1-z0,y1-y0), g=new THREE.CylinderGeometry(.035,.04,L,6);
      g.rotateX(Math.atan2(z1-z0,y1-y0)); g.translate(0,(y0+y1)/2,(z0+z1)/2+.12); parts.push(g); } parts.push(bx(.1,.24,.1,0,6.1,.12)); return merge(parts); })();
  const headG=new THREE.SphereGeometry(.3,10,6,0,Math.PI*2,0,Math.PI/2).scale(.75,.42,1.45).translate(0,6.58,2.3);
  const lensG=new THREE.CircleGeometry(.22,10).rotateX(Math.PI/2).scale(.72,1,1.35).translate(0,6.565,2.3);
  // transformador colgado del lado de las casas
  const trafoG=merge([cy(.34,.34,1.0,7.25,12).translate(0,0,-.5),cy(.36,.36,.06,8.25,12).translate(0,0,-.5),bx(.08,.5,.5,0,7.6,-.18),...[-.15,.15].map(x=>cy(.04,.03,.22,8.31,6).translate(x,0,-.5)),bx(.5,.06,.08,0,7.2,-.22)]);
  // carteles de las calles
  const signPoleG=merge([cy(.035,.035,3.1,0,6),cy(.045,.045,.05,3.1,6)]), plateA=bx(.9,.2,.025,0,2.9,0), plateB=bx(.025,.2,.9,0,2.62,0);
  // cercos (tramo de 2 m a lo largo de x)
  const bars=(y0,y1,len,step=.115)=>{ const a=[]; for(let x=-len/2+step/2;x<len/2;x+=step) a.push(bx(.018,y1-y0,.018,x,(y0+y1)/2,0)); a.push(bx(len,.03,.03,0,y0+.04,0),bx(len,.035,.035,0,y1,0)); return a; };
  // la reja va en una textura calada (dos triángulos por tramo): con un barrote por caja eran ~200 triángulos por tramo y hay ~750 tramos
  const rejaTex=canvasTex(128,128,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='#f2f2f2'; for(let i=0;i<16;i++) x.fillRect(i*8+3,0,2.4,h);
    x.fillRect(0,0,w,5); x.fillRect(0,h-6,w,6); x.fillRect(0,h*.2,w,3); x.strokeStyle='#f2f2f2'; x.lineWidth=2; for(let i=0;i<8;i++){ x.beginPath(); x.arc(i*16+8,h*.1,4.5,0,Math.PI*2); x.stroke(); } });
  const reja=(len,y0,y1,x=0)=>new THREE.PlaneGeometry(len,y1-y0).translate(x,(y0+y1)/2,0);
  const FG={
    tr:{w:merge([bx(2,.7,.2,0,.35,0),bx(2.04,.06,.26,0,.73,0),bx(.32,1.75,.32,-1,.875,0)]),p:reja(1.66,.76,1.62,.17)},
    r:{w:merge([bx(2,.26,.18,0,.13,0)]),i:merge([bx(.07,1.7,.07,-1,.85,0)]),p:reja(1.92,.26,1.6,.02)},
    a:{w:merge([bx(.12,1.55,.12,-1,.775,0),bx(2,.12,.1,0,.06,0)]),m:new THREE.PlaneGeometry(2,1.35).translate(0,.78,0),i:merge([bx(2,.012,.012,0,1.47,0)])},
    m:{w:merge([bx(2,1.7,.2,0,.85,0),bx(2.04,.07,.28,0,1.73,0)])},
    g:{w:merge([bx(.36,1.85,.36,-1.68,.925,0),bx(.36,1.85,.36,1.68,.925,0)]),i:merge([bx(3,.06,.05,0,.12,0),bx(3,.06,.05,0,1.68,0),bx(.06,1.6,.06,0,.9,0),bx(.05,1.6,.05,-1.47,.9,0),bx(.05,1.6,.05,1.47,.9,0)]),p:reja(2.92,.15,1.65)},
    gp:{w:merge([bx(.3,1.85,.3,-.7,.925,0),bx(.3,1.85,.3,.7,.925,0)]),i:merge([bx(1.1,.05,.04,0,.12,0),bx(1.1,.05,.04,0,1.72,0)]),p:reja(1.06,.12,1.7)} };
  const REJA=new THREE.MeshLambertMaterial({map:rejaTex,alphaTest:.5,side:THREE.DoubleSide});
  const ALAM=new THREE.MeshLambertMaterial({map:alamTex,transparent:true,alphaTest:.35,side:THREE.DoubleSide,depthWrite:true}); alamTex.repeat.set(9,6);   // rombos de ~10 cm
  const signTex=(()=>{ const names=[...new Set(SOR_STREETS.map(s=>s.n).filter(Boolean))], c=document.createElement('canvas'); c.width=512; c.height=64*names.length; const x=c.getContext('2d');
    names.forEach((n,i)=>{ const y=i*64; x.fillStyle='#1d4f93'; x.fillRect(0,y,512,64); x.strokeStyle='#f2f2f2'; x.lineWidth=4; x.strokeRect(6,y+6,500,52);
      x.fillStyle='#f6f6f2'; x.font='bold 38px "Saira Condensed",Arial,sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(n.toUpperCase(),256,y+34,470); });
    const t=new THREE.CanvasTexture(c); t.anisotropy=ANISO; t.userData={names}; return t; })();
  const signMat=()=>{ const m=new THREE.MeshLambertMaterial({map:signTex}), N=signTex.userData.names.length; m.onBeforeCompile=sh=>{ sh.vertexShader='attribute float aRow;\n'+sh.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
      vUv.y=(${N-1}.-aRow+uv.y)/${N}.;`); }; m.customProgramCacheKey=()=>'cartelCalle'; return m; };

  const mkIM=(geo,m,n,shadow=true)=>{ const im=new THREE.InstancedMesh(geo,m,Math.max(1,n)); im.count=n; im.castShadow=shadow; im.receiveShadow=true; im.frustumCulled=false; worldGroup.add(im); return im; };
  let wireGeo=null;
  function dropWires(P){ if(!wireGeo) return; const A=wireGeo.attributes.position; for(const [i0,n] of P.bspans) for(let k=i0;k<i0+n;k++){ A.setY(k,heightAt(A.getX(k),A.getZ(k))+.04); } A.needsUpdate=true; }
  const _spm=setPropMatrix;
  setPropMatrix=function(P){ _spm(P); if(P.bspans&&P.fallen&&!P.bDown){ P.bDown=1; dropWires(P); } if(P.blens){ P.ims[0].getMatrixAt(P.i,_m); P.blens.setMatrixAt(P.i,_m); P.blens.instanceMatrix.needsUpdate=true; } };

  function barrioProps(){
    // fuera los postes genéricos y los autos de caja: los autos pasan a ser vehículos de verdad estacionados
    const osm=H.osm, park=[]; if(!osm) for(const P of props) if(P.kind==='car') park.push({x:P.x,z:P.z,a:P.a});
    if(!osm){
    props=props.filter(P=>P.kind!=='post'&&P.kind!=='car'); propGrid=new Map(); for(const P of props){ const k=pk(P.x,P.z); let a=propGrid.get(k); if(!a){a=[];propGrid.set(k,a);} a.push(P); }
    for(const k of ['post','lamp','lens','car','cab','wheels']) if(propIM[k]) propIM[k].count=0;
    W._sorPark=park; } else W._sorPark=null;
    // ---- cercos (en los mapas reales, por sector) ----
    const byK={}; for(const f of H.fences){ const key=f.k+(osm?'|'+Math.floor(f.x/260)+','+Math.floor(f.z/260):''); (byK[key]=byK[key]||[]).push(f); }
    for(const key in byK){ const L=byK[key], k=key.split('|')[0], g=FG[k], ims=[];
      const wm=mkIM(g.w,new THREE.MeshLambertMaterial({color:0xffffff}),L.length,!osm&&(k==='m'||k==='g')); ims.push(wm);
      const iim=g.i?mkIM(g.i,new THREE.MeshLambertMaterial({color:0xffffff}),L.length,false):null; if(iim) ims.push(iim);
      const mm=g.m?mkIM(g.m,ALAM,L.length,false):null; if(mm) ims.push(mm);
      const pm=g.p?mkIM(g.p,REJA,L.length,false):null; if(pm) ims.push(pm);
      L.forEach((f,i)=>{ wm.setColorAt(i,_c.set(k==='a'?0xb8b6ae:f.wc)); if(iim) iim.setColorAt(i,_c.set(k==='a'?0x9a9e9a:f.ic)); if(pm) pm.setColorAt(i,_c.set(f.ic));
        const P={kind:'street',ims,i,x:f.x,z:f.z,y:heightAt(f.x,f.z)-.03,a:f.a,r:f.len/2,t:0,fence:1}; addProp(P); setPropMatrix(P); });
      ims.forEach(im=>{ if(im.instanceColor) im.instanceColor.needsUpdate=true; });
      if(osm){ let cx=0,cz=0; L.forEach(f=>{ cx+=f.x; cz+=f.z; }); cx/=L.length; cz/=L.length; const r=Math.max(...L.map(f=>Math.hypot(f.x-cx,f.z-cz)))+3; ims.forEach(im=>cullAdd(im,cx,heightAt(cx,cz)+1,cz,r,230)); } }
    if(osm){ W._barrio={casas:H.houses.length,cercos:H.fences.length}; return; }
    // ---- postes de la red eléctrica a lo largo de cada calle, siempre del mismo lado ----
    const runs=[]; SOR_STREETS.forEach((S,si)=>{ const w=S.p.map(q=>toW(...q)), R=mulberry0(500+si*17), sd=R()<.5?1:-1, off=(S.pav?3.6:3.25)+.7; let acc=R()*20, run=[];
      for(let i=0;i<w.length-1;i++){ const A=w[i], B=w[i+1], L=Math.hypot(B.x-A.x,B.z-A.z), ux=(B.x-A.x)/L, uz=(B.z-A.z)/L; let d=acc;
        for(;d<L;d+=31){ const x=A.x+ux*d-uz*off*sd, z=A.z+uz*d+ux*off*sd; if(!inMapXZ(x,z)||!freeSpot(x,z,.45)||nearestSeg(x,z,streetSegs).d<off-.4){ if(run.length>1) runs.push(run); run=[]; continue; }
          const s=nearestSeg(x,z,streetSegs); run.push({x,z,a:Math.atan2(s.px-x,s.pz-z),ux,uz,k:run.length+runs.length}); } acc=d-L; }
      if(run.length) runs.push(run); });
    const flat=runs.flat(); flat.forEach((o,i)=>{ const R=mulberry0(900+i*13); o.v=R()<.16?'t':R()<.62?'l':'p'; });
    const V={p:[],l:[],t:[]}; flat.forEach(o=>V[o.v].push(o));
    const ims={p:[mkIM(poleG,WOOD,V.p.length),mkIM(insG,PORC,V.p.length,false)],
      l:[mkIM(poleG,WOOD,V.l.length),mkIM(insG,PORC,V.l.length,false),mkIM(armG,STEEL,V.l.length),mkIM(headG,STEEL,V.l.length)],
      t:[mkIM(poleG,WOOD,V.t.length),mkIM(insG,PORC,V.t.length,false),mkIM(trafoG,new THREE.MeshLambertMaterial({color:0x8a9290}),V.t.length)]};
    const lensIM=mkIM(lensG,LENS,V.l.length,false);
    for(const k of ['p','l','t']) V[k].forEach((o,i)=>{ const P={kind:'street',ims:ims[k],i,x:o.x,z:o.z,y:heightAt(o.x,o.z)-.05,a:o.a,r:.35,t:0}; if(k==='l') P.blens=lensIM; o.P=P; addProp(P); setPropMatrix(P); });
    // ---- cables: media tensión arriba, baja tensión y el cable de TV más abajo, con comba; acometidas a las casas ----
    const pts=[];
    const line=(ax,ay,az,bx2,by,bz,sag,owners)=>{ const i0=pts.length/3, N=8; for(let k=0;k<N;k++) for(const f of [k/N,(k+1)/N]) pts.push(ax+(bx2-ax)*f,ay+(by-ay)*f-sag*4*f*(1-f),az+(bz-az)*f);
      for(const P of owners) (P.bspans=P.bspans||[]).push([i0,N*2]); };
    const at=(o,y,z)=>[o.x+z*Math.sin(o.a),o.P.y+y,o.z+z*Math.cos(o.a)];
    for(const run of runs) for(let i=0;i<run.length-1;i++){ const A=run[i], B=run[i+1], d=Math.hypot(B.x-A.x,B.z-A.z); if(d>48) continue; const sag=.35+d*.012;
      for(const [y,z] of [...INS,...LV,[5.3,.14]]) line(...at(A,y+.14,z),...at(B,y+.14,z),y===5.3?sag*1.3:sag,[A.P,B.P]); }
    // acometidas: del rack de baja tensión del poste más cercano a la casa (hasta 28 m)
    for(const hs of H.houses){ const b=hs.b; let best=null, bd=28; for(const o of flat){ const d=Math.hypot(o.x-b.x,o.z-b.z); if(d<bd){ bd=d; best=o; } } if(!best||mulberry0(b.i*3+1)()<.15) continue;
      const F=hs.F, [hx,hz]=F.P((mulberry0(b.i)()-.5)*F.W*.6,F.D/2-.1); line(...at(best,6.95+.1,.2),hx,b.top+.15,hz,.25+bd*.01,[best.P]); }
    if(pts.length){ wireGeo=new THREE.BufferGeometry(); wireGeo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3)); const ls=new THREE.LineSegments(wireGeo,WIRE); ls.frustumCulled=false; worldGroup.add(ls); }
    // ---- carteles en las esquinas ----
    const names=signTex.userData.names, St=SOR_STREETS.map(S=>({n:S.n,w:S.p.map(q=>toW(...q))})).filter(S=>S.n), sg=[];
    for(let a=0;a<St.length;a++) for(let c=a+1;c<St.length;c++){ const A=St[a], B=St[c];
      for(let i=0;i<A.w.length-1;i++) for(let j=0;j<B.w.length-1;j++){ const p=A.w[i], p2=A.w[i+1], q=B.w[j], q2=B.w[j+1], rx=p2.x-p.x, rz=p2.z-p.z, sx=q2.x-q.x, sz=q2.z-q.z, den=rx*sz-rz*sx; if(Math.abs(den)<1e-6) continue;
        const t=((q.x-p.x)*sz-(q.z-p.z)*sx)/den, u=((q.x-p.x)*rz-(q.z-p.z)*rx)/den; if(t<0||t>1||u<0||u>1) continue;
        const ix=p.x+rx*t, iz=p.z+rz*t, la=Math.hypot(rx,rz), lb=Math.hypot(sx,sz), R=mulberry0(a*31+c*7+i), ka=R()<.5?1:-1, kb=R()<.5?1:-1;
        // en la esquina: corrido hacia los costados de las dos calles
        const x=ix+(-rz/la)*4.6*ka+(-sz/lb)*4.6*kb, z=iz+(rx/la)*4.6*ka+(sx/lb)*4.6*kb; if(!inMapXZ(x,z)||!freeSpot(x,z,.3)) continue;
        sg.push({x,z,a:Math.atan2(-rz,rx),ra:names.indexOf(A.n),rb:names.indexOf(B.n)}); } }
    if(sg.length){ const sp=mkIM(signPoleG,STEEL,sg.length), pa=mkIM(plateA,signMat(),sg.length,false), pb=mkIM(plateB,signMat(),sg.length,false);
      pa.geometry=pa.geometry.clone(); pb.geometry=pb.geometry.clone();
      pa.geometry.setAttribute('aRow',new THREE.InstancedBufferAttribute(new Float32Array(sg.map(o=>o.ra)),1)); pb.geometry.setAttribute('aRow',new THREE.InstancedBufferAttribute(new Float32Array(sg.map(o=>o.rb)),1));
      sg.forEach((o,i)=>{ const P={kind:'street',ims:[sp,pa,pb],i,x:o.x,z:o.z,y:heightAt(o.x,o.z)-.05,a:o.a,r:.2,t:0}; addProp(P); setPropMatrix(P); }); }
    // ---- cordón cuneta de Las Margaritas (la calle de hormigón) ----
    const curbs=[]; for(const S of SOR_STREETS){ if(!S.pav) continue; const w=S.p.map(q=>toW(...q));
      for(let i=0;i<w.length-1;i++){ const A=w[i], B=w[i+1], L=Math.hypot(B.x-A.x,B.z-A.z), ux=(B.x-A.x)/L, uz=(B.z-A.z)/L;
        for(let d=1;d<L;d+=2) for(const sd of [-1,1]){ const x=A.x+ux*d-uz*3.55*sd, z=A.z+uz*d+ux*3.55*sd; if(!inMapXZ(x,z)) continue; if(streetSegs.some(T=>Math.hypot(T.bx-T.ax,T.bz-T.az)>1&&nearestSeg0(x,z,[T]).d<3.2)) continue; curbs.push({x,z,a:Math.atan2(ux,uz)}); } } }
    if(curbs.length){ const cg=bx(.16,.2,2.02,0,.04,0), im=mkIM(cg,new THREE.MeshLambertMaterial({color:0xb8b5ad}),curbs.length,false);
      curbs.forEach((o,i)=>{ im.setMatrixAt(i,_m.compose(_v.set(o.x,heightAt(o.x,o.z),o.z),_q.setFromAxisAngle(UP,o.a),_s.set(1,1,1))); }); im.instanceMatrix.needsUpdate=true; }
    W._barrio={casas:H.houses.length,cercos:H.fences.length,postes:flat.length,cables:pts.length/6,carteles:sg.length,cordon:curbs.length,estacionados:park.length};
  }
  const _bp=buildProps;
  buildProps=function(){ const r=_bp.apply(this,arguments); wireGeo=null; try{ if(ON()&&H&&H.osm===(MODE()==='osm')) barrioProps(); }catch(e){ console.warn('barrio props',e); } return r; };

  // de noche se prenden las luminarias
  const _cu=cullUpdate;
  cullUpdate=function(){ _cu.apply(this,arguments); const on=typeof WX!=='undefined'&&WX&&WX.night; LENS.emissive.setHex(on?0xfff0c0:0x000000); LENS.emissiveIntensity=on?1.5:0; };

  // ---------- suelo: sin nombres pintados; huellas, charcos, pasto en los bordes, cunetas y hormigón con juntas ----------
  const _dg=drawSorGround;
  drawSorGround=function(ctx,sc,labels){ _dg.call(this,ctx,sc,false); if(!labels) return; try{ groundDetail(ctx,sc); }catch(e){ console.warn('barrio suelo',e); } };
  function groundDetail(ctx,sc){ const R=mulberry0(4242), r=(a,b)=>a+R()*(b-a);
    ctx.save(); ctx.scale(sc,sc); ctx.translate(PAD,PAD); ctx.lineCap='round'; ctx.lineJoin='round';
    const path=(p,off)=>{ ctx.beginPath(); for(let i=0;i<p.length;i++){ const a=p[Math.max(0,i-1)], b=p[Math.min(p.length-1,i+1)], l=Math.hypot(b[0]-a[0],b[1]-a[1])||1, nx=-(b[1]-a[1])/l, ny=(b[0]-a[0])/l;
      const X=p[i][0]+nx*off, Y=p[i][1]+ny*off; i?ctx.lineTo(X,Y):ctx.moveTo(X,Y); } ctx.stroke(); };
    for(const S of SOR_STREETS){
      if(S.pav){ ctx.strokeStyle='#8d8b85'; ctx.lineWidth=25; path(S.p,0); ctx.strokeStyle='rgba(60,58,54,.10)'; ctx.lineWidth=11; path(S.p,-4); path(S.p,4);   // hormigón y manchas de las ruedas
        ctx.strokeStyle='rgba(50,48,44,.55)'; ctx.lineWidth=.6; path(S.p,0);                                                                       // junta del medio
        for(let i=0;i<S.p.length-1;i++){ const [x0,y0]=S.p[i], [x1,y1]=S.p[i+1], L=Math.hypot(x1-x0,y1-y0), ux=(x1-x0)/L, uy=(y1-y0)/L;
          for(let d=0;d<L;d+=15){ const X=x0+ux*d, Y=y0+uy*d; ctx.beginPath(); ctx.moveTo(X-uy*12.5,Y+ux*12.5); ctx.lineTo(X+uy*12.5,Y-ux*12.5); ctx.stroke(); } }      // juntas cada 4 m
        ctx.strokeStyle='#b6b3ab'; ctx.lineWidth=2.2; path(S.p,13.4); path(S.p,-13.4); continue; }                                              // cordón
      ctx.strokeStyle='rgba(84,98,52,.55)'; ctx.lineWidth=4; path(S.p,14); path(S.p,-14);                                                      // cunetas con pasto
      ctx.strokeStyle='rgba(112,92,62,.35)'; ctx.lineWidth=3.2; path(S.p,3.6); path(S.p,-3.6);                                                  // huellas de las ruedas
      ctx.strokeStyle='rgba(176,156,118,.35)'; ctx.lineWidth=1.6; path(S.p,0);                                                                 // lomo del medio
      for(let i=0;i<S.p.length-1;i++){ const [x0,y0]=S.p[i], [x1,y1]=S.p[i+1], L=Math.hypot(x1-x0,y1-y0);
        for(let k=0;k<L/40;k++){ const t=R(), X=x0+(x1-x0)*t, Y=y0+(y1-y0)*t, n=r(-6,6), ang=Math.atan2(y1-y0,x1-x0);
          if(R()<.45){ ctx.save(); ctx.translate(X+n*(y0-y1)/L,Y+n*(x1-x0)/L); ctx.rotate(ang); ctx.fillStyle='rgba(88,82,70,.55)'; ctx.beginPath(); ctx.ellipse(0,0,r(4,10),r(2,4),0,0,7); ctx.fill();
            ctx.fillStyle='rgba(120,138,150,.38)'; ctx.beginPath(); ctx.ellipse(0,0,r(2,6),r(1,2.5),0,0,7); ctx.fill(); ctx.restore(); }                     // charco
          else { ctx.fillStyle='rgba(96,112,58,.5)'; const sd=R()<.5?1:-1; ctx.beginPath(); ctx.ellipse(X+sd*10*(y0-y1)/L,Y+sd*10*(x1-x0)/L,r(3,8),r(2,4),ang,0,7); ctx.fill(); } } } }   // mata de pasto en el borde
    ctx.restore(); }

  // ---------- vehículos estacionados en lugar de los autos de caja ----------
  const _ir=initRefuerzos;
  initRefuerzos=function(){ const r=_ir.apply(this,arguments); try{ if(MODE()==='sor'&&!net.guest&&W._sorPark) parkCars(); }catch(e){ console.warn('barrio autos',e); } return r; };
  function parkCars(){ const keys=['c10','c10','sedan','falcon','fiat600','hatch','c10','pickup','falcon','sedan','moto2','van'], idx=k=>VTYPES.findIndex(v=>v.k===k);
    const pav=SOR_STREETS.filter(S=>S.pav).map(S=>{ const w=S.p.map(q=>toW(...q)); const segs=[]; for(let i=0;i<w.length-1;i++) segs.push({ax:w[i].x,az:w[i].z,bx:w[i+1].x,bz:w[i+1].z}); return segs; }).flat();
    W._sorPark.forEach((o,n)=>{ const ti=idx(keys[n%keys.length]); if(ti<0) return; const s=pav.length?nearestSeg0(o.x,o.z,pav):null;
      if(s&&s.d<6&&s.d>.1){ o.x=s.px+(o.x-s.px)/s.d*4.7; o.z=s.pz+(o.z-s.pz)/s.d*4.7; } const ci=(ti<<4)|((n*5)&15), g=carMesh(ci); scene.add(g);
      const C={id:++carSeq,g,S:null,dir:1,k:0,v:0,vmax:0,state:2,ci,x:o.x,z:o.z,h:o.a,len:g.userData.len,V:VTYPES[ti]}; (g.userData.riders||[]).forEach(p=>p.g.visible=false); traffic.push(C); }); }
  window.barrioInfo=()=>W._barrio;
})();
