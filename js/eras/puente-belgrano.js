/* ---------- Puente General Manuel Belgrano (Corrientes – Resistencia), hecho por código (pedido de Sebastián, 16/11/2026) ----------
   Referencia: el modelo "puente-general-belgrano.glb" que pasó Sebastián (SketchUp), solo para mirar; datos de Structurae y Wikipedia:
   atirantado en abanico de tres tramos 163,5 – 245 – 163,5 m, dos pilones en A de 84 m, tablero a 35 m sobre el río (1973).
   Los pilones se ubican por latitud/longitud: en el mapa "puente" van sobre el tablero de OSM, en medio de las defensas que ya marca OSM;
   en la "costanera" quedan ~1,4 km afuera del mapa y se dibujan de fondo, sin niebla, con el color fundido hacia el horizonte. */
const BELGRANO={p:[[-27.469362,-58.860961],[-27.467808,-58.862730]], ctes:[-27.473875,-58.855590], H:84, main:245, side:163.5};
// latitud/longitud -> juego (misma proyección que herramientas/osm/bajar.py; x = oeste, z = norte)
function osmGeo(D,lat,lon){ const kx=111320*Math.cos(D.lat*Math.PI/180), ky=110540, r=(D.rot||0)*Math.PI/180, c=Math.cos(r), s=Math.sin(r);
  const e=(lon-D.lon)*kx, n=(lat-D.lat)*ky; return {x:-(e*c-n*s), z:e*s+n*c}; }
const BELG_BG=[];   // materiales de fondo que siguen el color de la niebla
function osmBelgrano(o){
  BELG_BG.length=0; const D=o.D; if(!D) return; const A=osmGeo(D,...BELGRANO.p[0]), B=osmGeo(D,...BELGRANO.p[1]);
  let ux=B.x-A.x, uz=B.z-A.z; const L=Math.hypot(ux,uz); ux/=L; uz/=L; const px=-uz, pz=ux;   // eje del puente y su perpendicular
  const inMap=q=>Math.abs(q.x)<(W.bx||750)-20&&Math.abs(q.z)<(W.bz||750)-20, bg=!inMap(A)||!inMap(B);
  // centro y altura del tablero en cada pilón (en el mapa del puente, sobre el tablero de OSM)
  const deckCtr=q=>{ if(!W.deckAt) return null; let lo=null,hi=null; for(let s=-25;s<=25;s+=.5){ const d=W.deckAt(q.x+px*s,q.z+pz*s); if(d!=null){ if(lo==null) lo=s; hi=s; } }
    if(lo==null) return null; const m=(lo+hi)/2; return {x:q.x+px*m,z:q.z+pz*m,y:W.deckAt(q.x+px*m,q.z+pz*m),w:hi-lo}; };
  let P=[A,B].map(q=>deckCtr(q)||{x:q.x,z:q.z,y:42,w:10}); const dw=Math.max(8,Math.min(14,P[0].w||10));
  const conc=bg?new THREE.MeshBasicMaterial({color:0xc9c6bd,fog:false}):new THREE.MeshLambertMaterial({color:0xcbc8bf}),
    dark=bg?new THREE.MeshBasicMaterial({color:0x4a4a48,fog:false}):new THREE.MeshLambertMaterial({color:0x4c4c4a}),
    orng=new THREE.MeshLambertMaterial({color:0xd8641e}), strp=new THREE.MeshLambertMaterial({map:stripeTex()}), deckM=bg?new THREE.MeshBasicMaterial({color:0x6e6c66,fog:false}):null;
  if(bg){ for(const [m,c] of [[conc,0xc9c6bd],[dark,0x4a4a48],[deckM,0x6e6c66]]) BELG_BG.push({m,c:new THREE.Color(c)}); }
  const H=BELGRANO.H, gC=[], gD=[], gO=[], gS=[];
  // pieza de sección rectangular entre dos puntos (las patas inclinadas, los cables)
  const beam=(a,b,w,d,arr)=>{ const v=new THREE.Vector3().subVectors(b,a), l=v.length(), g=new THREE.BoxGeometry(w,l,d); g.translate(0,l/2,0);
    const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize()); g.applyMatrix4(new THREE.Matrix4().compose(a,q,new THREE.Vector3(1,1,1))); arr.push(g); };
  const cable=(a,b)=>{ const v=new THREE.Vector3().subVectors(b,a), l=v.length(), g=new THREE.CylinderGeometry(.16,.16,l,5,1,true); g.translate(0,l/2,0);
    g.applyMatrix4(new THREE.Matrix4().compose(a,new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize()),new THREE.Vector3(1,1,1))); gD.push(g); };
  const at=(c,along,across,y)=>new THREE.Vector3(c.x+ux*along+px*across,y,c.z+uz*along+pz*across);
  const box=(c,along,across,y,la,lc,h,arr)=>{ const g=new THREE.BoxGeometry(lc,h,la); g.rotateY(Math.atan2(ux,uz)); const p=at(c,along,across,y); g.translate(p.x,p.y,p.z); arr.push(g); };
  P.forEach((c,i)=>{
    const yD=c.y, base=-6, spread=dw/2+8.5, topW=1.4, yTop=H-9;
    box(c,0,0,(base+3)/2,9,2*spread+8,3-base,gC);                                                    // zapata en el agua
    for(const s of [-1,1]){ beam(at(c,0,s*spread,2),at(c,0,s*topW,yTop),3.2,4.2,gC); box(c,0,s*spread,0,6,6,4,gC); }   // patas en A
    { const k=(yD-2.6-2)/(yTop-2), off=spread+(topW-spread)*k; box(c,0,0,yD-2.6,4.5,2*off+3,2.6,gC); }  // travesaño bajo el tablero
    { const k=(yTop-14-2)/(yTop-2), off=spread+(topW-spread)*k; box(c,0,0,yTop-14,3.2,2*off+2.4,2.2,gC); }  // riostra alta
    box(c,0,0,(yTop-2+H)/2,4.6,4.4,H-yTop+2,gC);                                                       // cabeza con los anclajes
    box(c,0,0,H+.4,5.2,5,.8,gD);
    // obenques en abanico: hacia el otro pilón (medio tramo central) y hacia afuera (tramo lateral), en los dos bordes del tablero
    const dir=i===0?1:-1;
    for(const [sg,len] of [[dir,BELGRANO.main/2-6],[-dir,BELGRANO.side-10]]) for(let k=0;k<11;k++){
      const f=(k+1)/11, along=sg*(14+f*(len-14)), yA=H-1.6-k*.75;
      for(const s of [-1,1]) cable(at(c,0,s*.9,yA),at(c,along,s*(dw/2-.35),yD+.4)); }
    // defensas (pontones) aguas arriba y abajo, en cuña, naranjas con franjas
    if(!bg) for(const s of [-1,1]){ const sh=new THREE.Shape(); const pts=[[-22,0],[22,0],[18,30],[0,44],[-18,30]]; pts.forEach(([x,y],j)=>j?sh.lineTo(x,y):sh.moveTo(x,y));
      const top=new THREE.ShapeGeometry(sh), side=new THREE.ExtrudeGeometry(sh,{depth:4.2,bevelEnabled:false});
      for(const [g,arr,y] of [[top,gO,3.25],[side,gS,-1]]){ g.rotateX(-Math.PI/2); if(g===side){ g.translate(0,0,0); } g.scale(1,1,-s); g.rotateY(Math.atan2(px,pz)); const p=at(c,0,s*(dw/2+16),y); g.translate(p.x,p.y,p.z); arr.push(g); } }
  });
  // de fondo (costanera): el tablero sigue desde donde sale del mapa el de OSM, derecho a los pilones y más allá, con sus pilas
  if(bg){ const C0=osmGeo(D,...BELGRANO.ctes), E={x:C0.x,z:C0.z,y:9};   // la cabecera de Corrientes (fuera del mapa de la costanera)
    const yA=P[0].y, pts=[{x:E.x,z:E.z,y:E.y},{x:P[0].x,z:P[0].z,y:yA},{x:P[1].x,z:P[1].z,y:yA},{x:P[1].x+ux*900,z:P[1].z+uz*900,y:yA-14}];
    const gs=[]; for(let k=0;k<pts.length-1;k++){ const a=pts[k], b=pts[k+1], l=Math.hypot(b.x-a.x,b.z-a.z), ang=Math.atan2(b.x-a.x,b.z-a.z), n=Math.ceil(l/30);
      for(let q=0;q<n;q++){ const t0=q/n, t1=(q+1)/n, ya=a.y+(b.y-a.y)*t0, yb=a.y+(b.y-a.y)*t1, g=new THREE.BoxGeometry(dw,2.2,l/n+.3); g.rotateX(-Math.atan2(yb-ya,l/n)); g.rotateY(ang);
        g.translate(a.x+(b.x-a.x)*(t0+t1)/2,(ya+yb)/2-1.1,a.z+(b.z-a.z)*(t0+t1)/2); gs.push(g);
        if(q%2===0&&k!==1){ const pg=new THREE.BoxGeometry(5,(ya+yb)/2+4,4); pg.translate(0,((ya+yb)/2-2.2-6)/2+1,0); pg.rotateY(ang); pg.translate(a.x+(b.x-a.x)*t0,0,a.z+(b.z-a.z)*t0); gs.push(pg); } } }
    const dm=new THREE.Mesh(THREE.BufferGeometryUtils.mergeBufferGeometries(gs),deckM); worldGroup.add(dm); }
  const U=THREE.BufferGeometryUtils, add=(arr,m,shadow)=>{ if(!arr.length) return; const ms=new THREE.Mesh(U.mergeBufferGeometries(arr),m); ms.castShadow=shadow&&!bg; ms.receiveShadow=!bg; worldGroup.add(ms); if(!bg) osmHitoMs.push(ms); return ms; };
  const mc=add(gC,conc,true); add(gD,dark,false); add(gO,orng,false); add(gS,strp,false);
  if(!bg&&mc){ // las patas y la zapata frenan a los barcos... y a los tanques que se caigan al agua; los proyectiles ya chocan (osmHitoMs)
    for(const c of P){ const spread=dw/2+8.5; for(const s of [-1,1]) pierObs.push({ob:{cx:c.x+px*s*spread,cz:c.z+pz*s*spread,c:Math.cos(Math.atan2(ux,uz)),s:Math.sin(Math.atan2(ux,uz)),hw:3,hd:3},top:c.y-3.5}); } }
}
function stripeTex(){ const c=document.createElement('canvas'); c.width=64; c.height=16; const x=c.getContext('2d'); x.fillStyle='#d8641e'; x.fillRect(0,0,64,16);
  for(let i=-2;i<8;i++){ x.fillStyle=i%2?'#1c1c1c':'#e8c020'; x.beginPath(); x.moveTo(i*10,16); x.lineTo(i*10+8,0); x.lineTo(i*10+18,0); x.lineTo(i*10+10,16); x.fill(); }
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(12,1); return t; }
// el fondo de la costanera toma el color de la niebla (si no, se vería recortado contra el cielo)
if(typeof cullUpdate==='function'){ const _cu=cullUpdate; cullUpdate=function(){ const r=_cu.apply(this,arguments);
  if(BELG_BG.length&&scene.fog){ for(const B of BELG_BG) B.m.color.copy(B.c).lerp(scene.fog.color,.62); } return r; }; }
