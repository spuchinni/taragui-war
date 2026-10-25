/* ---------- Mapas ---------- */
function inPoly(x,y,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];
  if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))c=!c;}return c;}
// B° Sor Asunta: coordenadas en píxeles de la captura (888 x 815). Escala estimada 0,265 m por píxel.
const IW=888, IH=815, SPX=.265, PAD=110;
const toW=(px,py)=>({x:-(px-IW/2)*SPX,z:-(py-IH/2)*SPX});
const toPx=(x,z)=>[IW/2-x/SPX, IH/2-z/SPX];
const SOR_STREETS=[
 {n:'Bilbao',p:[[-110,252],[62,197],[300,121],[608,22],[720,-16]]},
 {n:'Los Tulipanes',p:[[30,110],[62,197],[140,400],[212,607],[268,815],[295,920]]},
 {n:'Palmeras',p:[[330,108],[430,400],[436,428],[447,600],[470,815],[478,900]]},
 {n:'Timbó',p:[[384,-40],[422,83],[435,125],[520,400],[579,607],[644,815],[662,900]]},
 {n:'Las Margaritas',pav:1,p:[[590,-40],[608,22],[654,175],[704,350],[734,437],[800,640],[850,815],[868,900]]},
 {n:'Murcia',p:[[170,492],[444,425],[700,343]]},
 {n:'Sevilla',p:[[120,880],[268,819],[444,757],[624,692],[800,629]]},
 {n:'Robert Koch',p:[[800,629],[905,648],[1000,660]]},
 {n:'Amado Puyau',p:[[648,150],[888,75],[1000,40]]},
 {n:'',p:[[150,-60],[172,160]]}
];
// [x, y, ancho, alto (px), techo]  techo: g gris, l claro, d oscuro, r chapa rojiza, b azulado
const SOR_BLD=[
 // Bilbao / Los Tulipanes / Palmeras / Murcia
 [125,222,40,30,'g'],[167,205,35,40,'l'],[200,187,30,25,'g'],[215,217,30,35,'d'],[220,248,30,25,'l'],[235,272,30,35,'g'],
 [150,270,30,30,'g'],[185,262,30,25,'l'],[277,228,35,35,'g'],[285,170,30,40,'l'],[315,185,25,25,'g'],[332,228,35,25,'g'],
 [335,275,30,30,'l'],[340,330,50,40,'g'],[370,365,35,30,'l'],[377,398,35,30,'g'],[175,325,45,40,'l'],[175,372,40,45,'d'],
 [265,365,30,30,'g'],[190,420,35,25,'g'],[232,417,35,20,'l'],[307,417,35,20,'l'],
 // Palmeras / Timbó norte
 [415,198,30,25,'g'],[428,238,35,35,'l'],[420,276,30,30,'g'],[472,345,40,50,'g'],[438,352,28,45,'d'],[455,300,30,25,'l'],
 // Timbó / Las Margaritas norte
 [476,100,40,30,'g'],[505,132,38,25,'l'],[522,76,40,28,'g'],[565,90,40,25,'l'],[540,137,40,30,'g'],[579,137,40,45,'l'],
 [540,167,55,25,'g'],[594,177,35,35,'g'],[514,205,40,30,'l'],[522,237,45,35,'g'],[600,248,70,50,'l'],[534,270,30,30,'g'],
 [564,290,40,20,'w'],[565,320,60,40,'g'],[582,346,25,30,'l'],[520,322,30,22,'g'],
 // Los Tulipanes / Murcia / Palmeras sur / Sevilla
 [232,522,45,40,'l'],[247,560,30,35,'b'],[255,592,30,30,'b'],[295,610,40,25,'w'],[333,635,30,40,'g'],[385,605,55,55,'l'],
 [380,548,35,30,'g'],[400,488,30,35,'l'],[327,505,30,25,'w'],[282,668,35,30,'g'],[277,697,25,25,'b'],[300,745,35,20,'g'],
 [305,572,25,25,'d'],[395,665,40,30,'g'],[405,705,30,25,'l'],
 // Palmeras / Timbó sur
 [475,485,40,25,'g'],[472,522,40,20,'l'],[475,565,40,40,'g'],[536,560,25,40,'l'],[520,610,35,30,'g'],[560,615,35,35,'l'],
 [525,640,35,25,'g'],[485,665,40,40,'g'],[565,670,45,30,'l'],[482,710,35,25,'g'],[545,470,30,25,'g'],
 // Timbó / Las Margaritas sur
 [590,420,35,25,'l'],[579,455,30,30,'g'],[598,482,35,30,'g'],[597,512,30,20,'l'],[684,425,55,40,'g'],[684,470,50,35,'l'],
 [657,382,30,25,'g'],[695,545,50,40,'l'],[728,575,40,45,'g'],[633,610,40,40,'g'],[690,615,35,45,'l'],[745,612,30,30,'g']
];
// Edificación fuera de los límites (decorado)
const SOR_OUT=[
 [130,130,40,35,'g'],[172,105,35,30,'r'],[250,90,40,30,'g'],[300,60,45,35,'l'],[345,30,40,30,'r'],[420,30,40,30,'g'],[480,12,40,25,'l'],
 [60,140,40,30,'g'],[230,40,40,30,'l'],[100,60,40,30,'g'],
 [40,295,75,40,'l'],[10,250,30,25,'g'],[20,470,30,25,'g'],[178,772,50,26,'church'],[95,760,30,20,'g'],[40,800,40,18,'l'],
 [700,60,40,40,'g'],[760,40,45,30,'l'],[740,110,40,30,'g'],[800,120,40,30,'l'],[722,205,40,30,'g'],[772,232,40,30,'l'],
 [762,300,45,35,'g'],[822,330,40,30,'g'],[775,385,40,40,'l'],[852,432,70,45,'corralon'],[792,472,40,30,'g'],[842,520,45,35,'l'],
 [862,595,45,30,'g'],[880,700,30,30,'l'],[840,730,35,30,'g'],
 [520,775,40,30,'g'],[600,760,35,30,'l'],[700,735,50,35,'g'],[760,700,40,30,'l'],[650,790,40,30,'g'],[420,795,30,20,'l'],[370,810,30,15,'g']
];
const SOR_TREES=[
 [250,168,'lapacho'],[77,170,'timbo'],[388,168,'timbo'],[225,325,'timbo'],[285,265,'jacaranda'],[295,315,'ceibo'],[235,372,'lapacho'],
 [128,335,'pindo'],[124,300,'pindo'],[475,150,'timbo'],[445,262,'jacaranda'],[589,85,'lapacho'],[556,190,'ceibo'],[624,325,'timbo'],
 [652,300,'lapacho'],[325,482,'timbo'],[330,548,'timbo'],[352,582,'jacaranda'],[245,445,'timbo'],[275,520,'ceibo'],[350,720,'timbo'],
 [330,742,'lapacho'],[624,437,'jacaranda'],[590,575,'timbo'],[492,520,'pindo'],[605,540,'espinillo'],[632,560,'espinillo'],
 [215,130,'timbo'],[295,138,'lapacho'],[676,182,'timbo'],[688,252,'timbo'],[784,522,'lapacho'],[846,470,'jacaranda'],[82,225,'timbo'],
 [395,128,'espinillo'],[410,150,'espinillo'],[618,525,'espinillo'],[560,530,'ceibo'],[455,635,'lapacho'],[505,705,'pindo']
];
const SOR_MONTE=[[-110,420],[128,420],[192,607],[247,815],[262,920],[-110,920]];
const SOR_BOUND=[[35,182],[615,-2],[825,635],[270,845]];
// Islas Malvinas: zona de Puerto Argentino comprimida. Relieve, turba, piedra y costa; sin árboles.
const ridge=(x,z,cx,cz,len,wid,hgt,ang)=>{const c=Math.cos(ang),s=Math.sin(ang),dx=x-cx,dz=z-cz,u=dx*c+dz*s,v=-dx*s+dz*c;return hgt*Math.exp(-(u*u)/(len*len)-(v*v)/(wid*wid));};
function malvH(x,z){return malvH0(-x,z);}
function malvH0(x,z){
  let h=2+ridge(x,z,-150,120,75,24,30,.15)+ridge(x,z,-135,-105,60,26,34,-.35)+ridge(x,z,-15,140,85,20,15,.1)
    +ridge(x,z,60,-165,40,30,22,0)+ridge(x,z,-215,-10,40,60,18,0)
    +1.4*Math.sin(x*.03)*Math.cos(z*.025)+.5*Math.sin(x*.11+z*.07);
  h-=1.6*Math.exp(-Math.pow(z-(12+14*Math.sin(x*.02)),2)/160)*(x<170?1:0);
  if(x>200) h-=Math.pow(x-200,2)*.022;
  if(z>165&&x>30) h-=Math.pow(z-165,2)*.03*clamp((x-30)/40,0,1);
  return h;
}
// Ruta 12 y Ruta 43: aeropuerto, corsódromo, La Reina y barrios hasta el Golf Club. Coordenadas en píxeles de la captura (946 x 697), 0,5 m por píxel.
const AW=946, AH=697, AS=.5, APAD=40;
const apick=a=>a[(Math.random()*a.length)|0];
const aW=(px,py)=>({x:-(px-AW/2)*AS,z:-(py-AH/2)*AS});
const aPx=(x,z)=>[AW/2-x/AS,AH/2-z/AS];
const R12=[[-40,735],[990,-137]], R43=[[315,435],[600,470],[946,522]];
const RUNWAY=[[95,48],[22,612]];
const PONDS=[[255,298,24,38,2.6],[905,205,15,12,2],[800,700,70,34,2.6],[488,80,10,8,1.6]];
const B1=[[175,560],[318,470],[565,470],[565,700],[150,700]], B2=[[605,488],[950,528],[950,700],[605,700]], B3=[[440,262],[560,232],[575,380],[470,385]];
const MONTE=[[[330,445],[385,452],[392,520],[335,510]],[[562,485],[612,490],[615,560],[566,560]],[[500,0],[625,0],[620,80],[510,70]],[[225,0],[335,0],[330,55],[230,60]],[[180,120],[230,110],[240,190],[190,200]]];
const GOLF=[[722,120],[880,110],[900,470],[735,480]];
function aerH(x,z){
  const [px,py]=aPx(x,z); let h=.45+.45*Math.sin(x*.021)*Math.cos(z*.026)+.25*Math.sin(x*.063+z*.041);
  for(const [cx,cy,rx,ry,dp] of PONDS){const d=((px-cx)/rx)**2+((py-cy)/ry)**2; if(d<1.6) h-=dp*clamp((1.35-d)/.6,0,1);}
  return h;
}
let aerCanvas=null;
function paintAeropuerto(){
  if(aerCanvas) return aerCanvas;
  const SC=2, c=document.createElement('canvas'); c.width=(AW+2*APAD)*SC; c.height=(AH+2*APAD)*SC; const x=c.getContext('2d');
  x.scale(SC,SC); x.translate(APAD,APAD);
  x.fillStyle='#71793f'; x.fillRect(-APAD,-APAD,AW+2*APAD,AH+2*APAD);
  const blot=(cols,n,rmin,rmax,poly,a=[.3,.75])=>{for(let i=0,k=0;i<n*4&&k<n;i++){const px=rand(-APAD,AW+APAD),py=rand(-APAD,AH+APAD);if(poly&&!inPoly(px,py,poly))continue;k++;
    x.fillStyle=cols[k%cols.length];x.globalAlpha=rand(...a);x.beginPath();x.ellipse(px,py,rand(rmin,rmax),rand(rmin,rmax)*.7,rand(0,3),0,7);x.fill();}x.globalAlpha=1;};
  const poly=(p,col)=>{x.fillStyle=col;x.beginPath();p.forEach((q,i)=>i?x.lineTo(...q):x.moveTo(...q));x.closePath();x.fill();};
  blot(['#8a7f58','#66713f','#93875f','#7c8250','#a09466'],700,8,30);
  poly(GOLF,'#5f7a3c'); blot(['#7e9a4c','#86a352'],40,10,28,GOLF,[.6,.9]);
  for(const m of MONTE){ poly(m,'#4f5e35'); blot(['#435230','#56663a'],60,4,12,m,[.5,.9]); }
  for(const b of [B1,B2,B3]) { poly(b,'#7b7a55'); blot(['#8d8460','#6e7448'],120,4,14,b); }
  // Aeropuerto: pista, calle de rodaje y plataforma
  x.lineCap='butt'; x.strokeStyle='#4b4b48'; x.lineWidth=44; x.beginPath(); x.moveTo(...RUNWAY[0]); x.lineTo(...RUNWAY[1]); x.stroke();
  x.strokeStyle='#e8e6de'; x.lineWidth=1.5; x.setLineDash([18,14]); x.beginPath(); x.moveTo(...RUNWAY[0]); x.lineTo(...RUNWAY[1]); x.stroke(); x.setLineDash([]);
  x.strokeStyle='#5a5a56'; x.lineWidth=12; x.beginPath(); x.moveTo(52,330); x.lineTo(120,345); x.lineTo(130,420); x.stroke();
  x.fillStyle='#8b8a84'; x.fillRect(105,395,80,80); x.fillRect(132,245,48,100);
  // Corsódromo: pista de desfile
  x.strokeStyle='#74726c'; x.lineWidth=20; x.beginPath(); x.moveTo(302,262); x.lineTo(286,430); x.stroke();
  x.strokeStyle='#a38d68'; x.lineWidth=10; x.beginPath(); x.ellipse(300,232,30,18,-.1,0,7); x.stroke();
  // Canchas del polideportivo
  x.fillStyle='#7f9a4c'; x.fillRect(560,128,26,40); x.fillRect(575,160,40,22); x.fillRect(355,128,30,26);
  // Agua
  for(const [cx,cy,rx,ry] of PONDS){ x.fillStyle='#3e5a5c'; x.beginPath(); x.ellipse(cx,cy,rx*.95,ry*.95,0,0,7); x.fill(); }
  // Calles de tierra en los barrios (cuadrícula alineada con la Ruta 43)
  x.lineCap='round'; x.strokeStyle='#9c8661'; x.lineWidth=11;
  for(const seg of aerStreets()){ x.beginPath(); x.moveTo(seg[0],seg[1]); x.lineTo(seg[2],seg[3]); x.stroke(); }
  // Rutas asfaltadas
  const road=(p,w)=>{ x.strokeStyle='#8a8170'; x.lineWidth=w+8; x.beginPath(); p.forEach((q,i)=>i?x.lineTo(...q):x.moveTo(...q)); x.stroke();
    x.strokeStyle='#5c5b57'; x.lineWidth=w; x.beginPath(); p.forEach((q,i)=>i?x.lineTo(...q):x.moveTo(...q)); x.stroke();
    x.strokeStyle='#e0c45a'; x.lineWidth=1.2; x.setLineDash([12,10]); x.beginPath(); p.forEach((q,i)=>i?x.lineTo(...q):x.moveTo(...q)); x.stroke(); x.setLineDash([]); };
  road(R43,16); road(R12,24);
  x.fillStyle='rgba(255,255,255,.85)'; x.font='600 13px "Saira Condensed",sans-serif'; x.textAlign='center'; x.textBaseline='middle';
  const lab=(t,px,py,a)=>{x.save();x.translate(px,py);x.rotate(a);x.fillText(t,0,0);x.restore();};
  lab('Ruta Nacional 12',520,320,-0.70); lab('Ruta Nacional 12',220,570,-0.70); lab('Ruta 43',700,483,0.15); lab('Ruta 43',450,452,0.12);
  speckle(x,AW+APAD,AH+APAD,40000,['#6d6a52','#b5ab8c','#5f6a3e','#a39e86'],.6,2);
  aerCanvas=c; return c;
}
// Calles de los barrios: cuadrícula girada como la Ruta 43
const AER_ANG=Math.atan2(470-435,600-315);
function aerStreets(){
  if(aerStreets.cache) return aerStreets.cache; const out=[], ca=Math.cos(AER_ANG), sa=Math.sin(AER_ANG);
  for(const [P,step] of [[B1,58],[B2,46],[B3,55]]){
    const xs=P.map(p=>p[0]), ys=P.map(p=>p[1]), x0=Math.min(...xs)-60, x1=Math.max(...xs)+60, y0=Math.min(...ys)-60, y1=Math.max(...ys)+60;
    const clip=(ax,ay,bx,by)=>{ let pts=[]; for(let t=0;t<=1.0001;t+=.02){const px=ax+(bx-ax)*t,py=ay+(by-ay)*t; if(inPoly(px,py,P)) pts.push([px,py]);} if(pts.length>1) out.push([...pts[0],...pts[pts.length-1]]); };
    for(let v=y0;v<=y1;v+=step) clip(x0,v+(x0-x0)*sa/ca,x1,v+(x1-x0)*sa/ca);
    for(let u=x0;u<=x1;u+=step) clip(u,y0,u-(y1-y0)*sa/ca,y1);
  }
  return aerStreets.cache=out;
}
function buildAeropuerto(){
  const c=paintAeropuerto(), tex=new THREE.CanvasTexture(c); tex.anisotropy=ANISO;
  const EX=(AW/2+APAD)*AS, EZ=(AH/2+APAD)*AS;
  const g=new THREE.PlaneGeometry(EX*2,EZ*2,170,130); g.rotateX(-Math.PI/2);
  const pos=g.attributes.position, uv=g.attributes.uv;
  for(let i=0;i<pos.count;i++){const X=pos.getX(i),Z=pos.getZ(i);pos.setY(i,aerH(X,Z));const q=aPx(X,Z);uv.setXY(i,(q[0]+APAD)/(AW+2*APAD),1-(q[1]+APAD)/(AH+2*APAD));}
  g.computeVertexNormals();
  const t=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:tex})); t.receiveShadow=true; worldGroup.add(t);
  waterMesh=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.MeshLambertMaterial({color:0x3e5a5c,transparent:true,opacity:.9}));
  waterMesh.rotation.x=-Math.PI/2; waterMesh.position.y=W.water; worldGroup.add(waterMesh);
  // Segmentos de calles y rutas en el mundo
  streetSegs=[]; const addSeg=(a,b)=>{const A=aW(...a),B=aW(...b); streetSegs.push({ax:A.x,az:A.z,bx:B.x,bz:B.z});};
  addSeg(...R12); for(let i=0;i<R43.length-1;i++) addSeg(R43[i],R43[i+1]); for(const sg of aerStreets()) addSeg([sg[0],sg[1]],[sg[2],sg[3]]);
  const angW=a=>{const A=aW(0,0),B=aW(Math.cos(a),Math.sin(a));return Math.atan2(-(B.z-A.z),B.x-A.x);};
  const B=(px,py,pw,ph,h,a,wall,roof,hp,pit)=>{const p=aW(px,py); addBuilding(p.x,p.z,pw*AS,ph*AS,h,angW(a),wall,roof,true,hp||100,!!pit);};
  // Aeropuerto: terminal, torre y hangares
  B(160,440,22,58,6,0,0xe6e2d8,0x8f9192,260); B(128,470,8,8,16,0,0xd8d4ca,0x5f6366,200);
  [[156,262],[156,298],[156,330]].forEach(([px,py])=>B(px,py,30,24,8,0,0xb9bcbf,0x7c8084,240));
  // Corsódromo: tribunas a los dos lados de la pista
  B(318,345,10,150,6,-.1,0xcfccc4,0x9a9da0,320); B(272,345,10,150,6,-.1,0xcfccc4,0x9a9da0,320); B(296,430,30,10,5,0,0xd9d4c6,0x8a4a3a,200);
  // La Reina, YPF, polideportivo, oficinas
  B(440,425,34,24,6,AER_ANG,0xece7da,0x3a5a8a,320); B(712,98,22,14,4,-.7,0xe8e2d2,0x2a5aa0,160); B(700,108,12,10,3.5,-.7,0xece7da,0x7d7e7b,120);
  B(420,100,26,14,5,0,0xe2d8c4,0x7d7e7b,200); B(400,118,14,10,4,0,0xe2d8c4,0x8a4a3a); B(517,312,20,12,4,-.7,0xdcd6c8,0x5f6366,160);
  // Casas de los barrios sobre los lotes
  const WALLS=[0xeeeae0,0xe2d8c4,0xf1e6cf,0xd9cfbd,0xe8d2bc,0xcfc8bb], ROOFS=[0x7d7e7b,0x9c9a93,0x585b5f,0x7e4e38,0x8a573f,0xb03a2e];
  const ca=Math.cos(AER_ANG), sa=Math.sin(AER_ANG);
  for(const [P,step,prob] of [[B1,58,.5],[B2,46,.62],[B3,55,.4]]){
    const xs=P.map(p=>p[0]), ys=P.map(p=>p[1]);
    for(let i=0;i<2600;i++){ const px=rand(Math.min(...xs),Math.max(...xs)), py=rand(Math.min(...ys),Math.max(...ys)); if(!inPoly(px,py,P)) continue;
      if(Math.random()>prob*.3) continue;
      const w=rand(13,19), d=rand(15,22), p=aW(px,py);
      if(distSegs(p.x,p.z,streetSegs)<Math.min(w,d)*AS/2+4.2) continue;
      if(gridQuery(p.x,p.z,9).some(b=>Math.hypot(b.ob.cx-p.x,b.ob.cz-p.z)<9)) continue;
      if(W.zones.some(Z=>Math.hypot(p.x-Z.x,p.z-Z.z)<Z.r*.55)) continue;
      addBuilding(p.x,p.z,w*AS,d*AS,rand(3,3.8),angW(AER_ANG),apick(WALLS),apick(ROOFS),true,100,Math.random()<.3);
    }
  }
  // Casas del golf, entre los árboles
  for(let i=0,n=0;i<400&&n<14;i++){const px=rand(745,860),py=rand(270,470); if(!inPoly(px,py,GOLF))continue; const p=aW(px,py);
    if(gridQuery(p.x,p.z,10).some(b=>Math.hypot(b.ob.cx-p.x,b.ob.cz-p.z)<11)) continue; addBuilding(p.x,p.z,8,10,3.6,rand(0,3),apick(WALLS),apick(ROOFS),true,110,true); n++;}
  finalizeBuildings();
  const free=(x,z,m)=>!gridQuery(x,z,4).some(b=>obPush(x,z,m,b))&&distSegs(x,z,streetSegs)>4.5&&aerH(x,z)>W.water+.4;
  const list=[], monteSp=['espinillo','algarrobo','timbo','espinillo','ceibo','pindo'];
  for(const m of MONTE) for(let i=0,n=0;i<900&&n<34;i++){const px=rand(Math.min(...m.map(q=>q[0])),Math.max(...m.map(q=>q[0]))),py=rand(Math.min(...m.map(q=>q[1])),Math.max(...m.map(q=>q[1])));
    if(!inPoly(px,py,m))continue; const p=aW(px,py); if(!free(p.x,p.z,2))continue; list.push({x:p.x,z:p.z,sp:apick(monteSp)}); n++;}
  for(let i=0,n=0;i<1500&&n<70;i++){const px=rand(722,900),py=rand(110,480); if(!inPoly(px,py,GOLF))continue; const p=aW(px,py); if(!free(p.x,p.z,2))continue;
    list.push({x:p.x,z:p.z,sp:apick(['timbo','lapacho','pindo','jacaranda','ceibo'])}); n++;}
  for(let i=0,n=0;i<2500&&n<60;i++){const px=rand(-20,AW+20),py=rand(-20,AH+20); if(px<130) continue; const p=aW(px,py); if(!free(p.x,p.z,2.2))continue;
    if(W.zones.some(Z=>Math.hypot(p.x-Z.x,p.z-Z.z)<Z.r))continue; list.push({x:p.x,z:p.z,sp:apick(['espinillo','timbo','lapacho','pindo']),s:rand(.6,1)}); n++;}
  buildTrees(list);
  nodes=null; W.boundary=[[-W.bx,-W.bz],[-W.bx,W.bz],[W.bx,W.bz],[W.bx,-W.bz]];
}
// Costanera de Corrientes (comprimida): Avenida Costanera, Puente General Belgrano, manzanas del centro y Playa Arazaty sobre el Paraná.
const CEX=250, CEZ=212, CSC=2;
const cShore=x=>72+12*Math.sin(x*.014)+6*Math.sin(x*.037);
const cAv=x=>cShore(x)-11;
function costH(x,z){
  const sh=cShore(x), beach=x>-195&&x<-105;
  let h=2.2+.25*Math.sin(x*.03)*Math.cos(z*.025);
  if(beach) h-=6.4*clamp((z-(sh-14))/24,0,1); else h-=6.6*clamp((z-(sh-1))/9,0,1);
  return h;
}
const C_ZS=[-195,-145,-95,-45,5];
function costStreets(){
  if(costStreets.c) return costStreets.c; const L=[];
  for(const x of [-200,-150,-100,-50,0,50,100,200]) L.push({w:9,pts:[[x,-215],[x,cAv(x)]]});
  L.push({w:12,pts:[[150,-215],[150,cAv(150)]]}); // avenida al puente
  for(const z of C_ZS) L.push({w:z===5?11:9,pts:[[-240,z],[240,z]]});
  const av=[]; for(let x=-245;x<=245;x+=7) av.push([x,cAv(x)]); L.push({w:15,pts:av,costanera:true});
  return costStreets.c=L;
}
let costCanvas=null;
function paintCostanera(){
  if(costCanvas) return costCanvas;
  const c=document.createElement('canvas'); c.width=CEX*2*CSC; c.height=CEZ*2*CSC; const x=c.getContext('2d');
  const P=(wx,wz)=>[(CEX-wx)*CSC,(CEZ-wz)*CSC];
  x.fillStyle='#6f7a46'; x.fillRect(0,0,c.width,c.height);
  for(let i=0;i<500;i++){const [px,py]=P(rand(-250,250),rand(-212,212)); x.fillStyle=['#7f7b58','#66713f','#868056'][i%3]; x.globalAlpha=rand(.25,.6); x.beginPath(); x.ellipse(px,py,rand(8,30),rand(6,20),rand(0,3),0,7); x.fill();} x.globalAlpha=1;
  // Manzanas: vereda gris
  const blockPoly=[]; x.fillStyle='#9e998d';
  x.beginPath(); x.moveTo(...P(205,-212)); for(let wx=205;wx>=-205;wx-=5) x.lineTo(...P(wx,cAv(wx)+1)); x.lineTo(...P(-205,-212)); x.closePath(); x.fill();
  // Parque y playa entre la costanera y el río
  x.fillStyle='#6f8a42'; x.beginPath(); x.moveTo(...P(250,cAv(250))); for(let wx=250;wx>=-250;wx-=5) x.lineTo(...P(wx,cAv(wx))); for(let wx=-250;wx<=250;wx+=5) x.lineTo(...P(wx,cShore(wx)+2)); x.closePath(); x.fill();
  x.fillStyle='#d6c79c'; x.beginPath(); for(let wx=-195;wx<=-105;wx+=5) x.lineTo(...P(wx,cShore(wx)-12)); for(let wx=-105;wx>=-195;wx-=5) x.lineTo(...P(wx,cShore(wx)+14)); x.closePath(); x.fill();
  // Río
  x.fillStyle='#3d5a5e'; x.beginPath(); for(let wx=-250;wx<=250;wx+=5) x.lineTo(...P(wx,cShore(wx)+(wx>-195&&wx<-105?12:4))); x.lineTo(...P(250,212)); x.lineTo(...P(-250,212)); x.closePath(); x.fill();
  // Plaza
  x.fillStyle='#6e8c44'; x.fillRect(...P(19,-1),38*CSC,38*CSC);
  x.strokeStyle='#cbbf9f'; x.lineWidth=3*CSC; x.beginPath(); x.moveTo(...P(19,-1)); x.lineTo(...P(-19,-39)); x.moveTo(...P(-19,-1)); x.lineTo(...P(19,-39)); x.stroke();
  x.beginPath(); x.arc(...P(0,-20),5*CSC,0,7); x.stroke();
  // Calles
  x.lineCap='round'; x.lineJoin='round';
  for(const S of costStreets()){ x.strokeStyle='#5d5c58'; x.lineWidth=S.w*CSC; x.beginPath(); S.pts.forEach((q,i)=>i?x.lineTo(...P(...q)):x.moveTo(...P(...q))); x.stroke(); }
  for(const S of costStreets()){ x.strokeStyle=S.costanera?'#e8e2cf':'#d9c25a'; x.lineWidth=.35*CSC; x.setLineDash([5*CSC,4*CSC]); x.beginPath(); S.pts.forEach((q,i)=>i?x.lineTo(...P(...q)):x.moveTo(...P(...q))); x.stroke(); } x.setLineDash([]);
  x.fillStyle='rgba(255,255,255,.85)'; x.font=`600 ${7*CSC}px "Saira Condensed",sans-serif`; x.textAlign='center'; x.textBaseline='middle';
  x.fillText('Avenida Costanera',...P(40,cAv(40))); x.fillText('Avenida Costanera',...P(-110,cAv(-110)));
  x.save(); x.translate(...P(150,-80)); x.rotate(Math.PI/2); x.fillText('Avenida 3 de Abril',0,0); x.restore();
  speckle(x,c.width,c.height,50000,['#6d6a52','#b5ab8c','#5f6a3e','#a39e86'],.6,2);
  return costCanvas=c;
}
function buildCostanera(){
  const c=paintCostanera(), tex=new THREE.CanvasTexture(c); tex.anisotropy=ANISO;
  const g=new THREE.PlaneGeometry(CEX*2,CEZ*2,180,150); g.rotateX(-Math.PI/2);
  const pos=g.attributes.position, uv=g.attributes.uv;
  for(let i=0;i<pos.count;i++){const X=pos.getX(i),Z=pos.getZ(i);pos.setY(i,costH(X,Z));uv.setXY(i,(CEX-X)/(2*CEX),1-(CEZ-Z)/(2*CEZ));}
  g.computeVertexNormals();
  const t=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:tex})); t.receiveShadow=true; worldGroup.add(t);
  waterMesh=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.MeshLambertMaterial({color:0x3d5a5e,transparent:true,opacity:.9}));
  waterMesh.rotation.x=-Math.PI/2; waterMesh.position.y=W.water; worldGroup.add(waterMesh);
  streetSegs=[]; for(const S of costStreets()) for(let i=0;i<S.pts.length-1;i++) streetSegs.push({ax:S.pts[i][0],az:S.pts[i][1],bx:S.pts[i+1][0],bz:S.pts[i+1][1]});
  // Puente General Belgrano: tablero elevado y dos torres en H con obenques
  const conc=new THREE.MeshLambertMaterial({color:0xcfcac0}), steel=new THREE.LineBasicMaterial({color:0xe8e4da});
  const z0=cShore(150)-4, deckY=z=>2.5+clamp((z-z0)/60,0,1)*14;
  for(let z=z0;z<420;z+=12){ const m=new THREE.Mesh(new THREE.BoxGeometry(11,1,12.2),conc); m.position.set(150,deckY(z+6),z+6); m.castShadow=m.receiveShadow=true; worldGroup.add(m);
    if(z>z0+20&&(z-z0)%36<12){ const pl=new THREE.Mesh(new THREE.BoxGeometry(6,deckY(z)+4,3),conc); pl.position.set(150,(deckY(z)-4)/2,z); worldGroup.add(pl);} }
  for(const tz of [z0+110,z0+330]){ for(const sx of [-6.5,6.5]){ const tw=new THREE.Mesh(new THREE.BoxGeometry(2.4,60,3),conc); tw.position.set(150+sx,26,tz); tw.castShadow=true; worldGroup.add(tw); }
    const cr=new THREE.Mesh(new THREE.BoxGeometry(15,2.5,3),conc); cr.position.set(150,48,tz); worldGroup.add(cr);
    const cr2=new THREE.Mesh(new THREE.BoxGeometry(15,2,3),conc); cr2.position.set(150,deckY(tz)-2,tz); worldGroup.add(cr2);
    const pts=[]; for(const sx of [-6.5,6.5]) for(let k=1;k<=7;k++) for(const dir of [-1,1]){ const zz=tz+dir*k*13; pts.push(new THREE.Vector3(150+sx,54-k*1.2,tz),new THREE.Vector3(150+sx*.9,deckY(zz)+.6,zz)); }
    worldGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),steel)); }
  const rail=[]; for(let z=z0;z<420;z+=12) for(const sx of [-5.3,5.3]) rail.push(new THREE.Vector3(150+sx,deckY(z)+1.2,z),new THREE.Vector3(150+sx,deckY(z+12)+1.2,z+12));
  worldGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(rail),steel));
  // Edificios: torres frente a la costanera, casas y comercios hacia adentro
  const WALLS=[0xeeeae0,0xe2d8c4,0xf1e6cf,0xd9cfbd,0xe8d2bc,0xcfc8bb,0xd8d4cc], ROOFS=[0x7d7e7b,0x9c9a93,0x585b5f,0x7e4e38,0x8a573f];
  const TOWER=[0xe9e6df,0xd5d9dc,0xcfc6b5,0xbfc4c6,0xe3dccd];
  const clearZ=(x,z,m)=>W.zones.some(Z=>Math.hypot(x-Z.x,z-Z.z)<Z.r+m);
  const xsB=[-175,-125,-75,-25,25,75,125,175], zsB=[[-195,-145],[-145,-95],[-95,-45],[-45,5],[5,null]];
  for(const cx of xsB) for(const [za,zb0] of zsB){
    const x0=cx-25+5, x1=cx+25-5, z0b=za+5, z1=(zb0==null?Math.min(cAv(x0),cAv(x1))-8:zb0-5);
    if(cx===0&&za===-45) continue; // plaza
    if(cx===125&&za===5) continue; if(cx===175&&za===5) continue; // explanada del puente
    const front=zb0==null;
    if(front){ // torres
      for(let k=0;k<2;k++){ const w=rand(13,17), d=Math.min(18,(z1-z0b)*.8), x=x0+w/2+k*(x1-x0-w), z=(z0b+z1)/2;
        if(clearZ(x,z,6)) continue; addBuilding(x,z,w,d,rand(18,38),0,apick(TOWER),0x6f7275,true,320,false); }
      continue; }
    // casas en el perímetro de la manzana
    for(let side=0;side<4;side++) for(let u=0;u<4;u++){ if(Math.random()<.35) continue;
      const fw=rand(8,10.5), dp=rand(11,15), h=Math.random()<.18?rand(8,14):rand(3.4,6.5);
      let x,z,w,d; const t=x0+5+u*((x1-x0-10)/3), tz=z0b+5+u*((z1-z0b-10)/3);
      if(side===0){x=t;z=z1-dp/2;w=fw;d=dp;} else if(side===1){x=t;z=z0b+dp/2;w=fw;d=dp;} else if(side===2){x=x0+dp/2;z=tz;w=dp;d=fw;} else {x=x1-dp/2;z=tz;w=dp;d=fw;}
      if(clearZ(x,z,4)) continue;
      addBuilding(x,z,w,d,h,0,apick(WALLS),h>7?0x7d7e7b:apick(ROOFS),true,h>7?200:100,false); }
  }
  // Kioscos y baños de la playa, rambla
  [[-150,cShore(-150)-20],[-120,cShore(-120)-18]].forEach(([x,z])=>addBuilding(x,z,5,4,3,0,0xf2efe6,0x2a6a9a,true,80,false));
  finalizeBuildings();
  // Árboles: palmeras y lapachos en la costanera, plaza arbolada, veredas
  const list=[], ok=(x,z,m)=>!gridQuery(x,z,4).some(b=>obPush(x,z,m,b))&&distSegs(x,z,streetSegs)>4.8&&costH(x,z)>W.water+.6;
  for(let x=-240;x<=240;x+=9){ const z=cAv(x)+rand(6,9); if(ok(x,z,1)) list.push({x,z,sp:Math.random()<.6?'pindo':'lapacho'}); }
  for(let i=0;i<26;i++){ const x=rand(-17,17), z=rand(-37,-3); if(Math.hypot(x,z+20)<7) continue; if(ok(x,z,1)) list.push({x,z,sp:apick(['lapacho','jacaranda','timbo','ceibo'])}); }
  for(let i=0,n=0;i<3000&&n<70;i++){ const x=rand(-240,240), z=rand(-210,40); if(ok(x,z,1.5)&&distSegs(x,z,streetSegs)<8){ list.push({x,z,sp:apick(['lapacho','jacaranda','pindo','ceibo']),s:rand(.55,.85)}); n++; } }
  for(let i=0,n=0;i<1200&&n<35;i++){ const x=rand(-250,-210)*(Math.random()<.5?1:-1), z=rand(-210,40); if(ok(x,z,2)){ list.push({x,z,sp:apick(['timbo','espinillo','algarrobo'])}); n++; } }
  buildTrees(list);
  // Red de calles para la IA
  nodes=[];
  for(const S of costStreets()){ let prev=null;
    for(let i=0;i<S.pts.length-1;i++){ const A=S.pts[i],B=S.pts[i+1],L=Math.hypot(B[0]-A[0],B[1]-A[1]),n=Math.max(1,Math.round(L/8));
      for(let k=(i===0?0:1);k<=n;k++){ const tt=k/n, p=new THREE.Vector3(A[0]+(B[0]-A[0])*tt,0,A[1]+(B[1]-A[1])*tt);
        if(Math.abs(p.x)>W.bx-2||Math.abs(p.z)>W.bz-2||costH(p.x,p.z)<W.water+.5){prev=null;continue;}
        const nd={p,nb:[],s:S}; nodes.push(nd); if(prev){prev.nb.push(nd);nd.nb.push(prev);} prev=nd; } } }
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j]; if(a.s!==b.s&&a.p.distanceTo(b.p)<7){a.nb.push(b);b.nb.push(a);}}
  W.boundary=[[-W.bx,-W.bz],[-W.bx,W.bz],[W.bx,W.bz],[W.bx,-W.bz]];
}
// Corrientes (este) y Barranqueras/Resistencia (oeste), comprimidas, unidas por el Puente General Belgrano transitable.
const PX=262, PZ=182;
const bankE=z=>72+7*Math.sin(z*.028)+4*Math.sin(z*.07), bankW=z=>-(70+6*Math.sin(z*.025+1)+5*Math.sin(z*.06));
function pH0(x,z){
  const n=.2*Math.sin(x*.04)*Math.cos(z*.03);
  if(x>0){ const b=bankE(z); return (x>b+6?2.6:x>b-4?-4+6.6*(x-(b-4))/10:-4)+n; }
  const b=bankW(z); return (x<b-6?1.6:x<b+4?-4+5.6*((b+4)-x)/10:-4)+n;
}
const DECK_END=118;
let pierObs=[]; // pilas de los puentes: chocan solo por debajo del tablero
function addPier(x,z,w,d,top){ pierObs.push({ob:{cx:x,cz:z,c:1,s:0,hw:w/2,hd:d/2},top}); }
// Estribos: donde el tablero queda bajo (no entra un tanque), se rellena con un muro macizo para que se vea que no se pasa
function addAbutments(deck,ground,end,half,mat,clear){ for(const sx of [-1,1]){ let a0=end; for(let a=0;a<end;a+=.5){ if(deck(sx*a)-ground(sx*a,0)<clear){ a0=a; break; } }
    for(let a=a0;a<end;a+=3){ const a1=Math.min(end,a+3), xm=sx*(a+a1)/2, top=deck(xm)-.9, g=Math.min(ground(sx*a,0),ground(sx*a1,0))-1; if(top-g<.3) continue;
      const b=new THREE.Mesh(new THREE.BoxGeometry(a1-a+.05,top-g,half*2+.4),mat); b.position.set(xm,(top+g)/2,0); b.castShadow=b.receiveShadow=true; worldGroup.add(b); } } }
function deckH(x){ const a=Math.abs(x); if(a<70) return 12.5+1.5*(1-(x/70)**2); const g=x>0?2.6:1.6; return g+(12.5-g)*(DECK_END-a)/(DECK_END-70); }
function puenteH(x,z){ const g=pH0(x,z); return Math.abs(z)<5.3&&Math.abs(x)<DECK_END?Math.max(g,deckH(x)):g; }
function puenteStreets(){
  if(puenteStreets.c) return puenteStreets.c; const L=[];
  L.push({w:13,pts:[[-262,0],[262,0]],main:true});
  for(const x of [140,190,240]) L.push({w:9,pts:[[x,-185],[x,185]]});
  for(const x of [-140,-190,-240]) L.push({w:9,pts:[[x,-185],[x,185]]});
  for(const z of [-150,-100,-50,50,100,150]){ L.push({w:9,pts:[[bankE(z)+14,z],[262,z]]}); L.push({w:9,pts:[[-262,z],[bankW(z)-14,z]]}); }
  const ce=[],cw=[]; for(let z=-185;z<=185;z+=8){ce.push([bankE(z)+12,z]); cw.push([bankW(z)-12,z]);}
  L.push({w:13,pts:ce,cost:true}); L.push({w:11,pts:cw,cost:true});
  return puenteStreets.c=L;
}
let puenteCanvas=null;
function paintPuente(){
  if(puenteCanvas) return puenteCanvas;
  const S=2, c=document.createElement('canvas'); c.width=PX*2*S; c.height=PZ*2*S; const x=c.getContext('2d');
  const P=(wx,wz)=>[(PX-wx)*S,(PZ-wz)*S];
  x.fillStyle='#6f7944'; x.fillRect(0,0,c.width,c.height);
  for(let i=0;i<600;i++){const [px,py]=P(rand(-262,262),rand(-182,182)); x.fillStyle=['#7f7b58','#66713f','#868056','#5c6a3a'][i%4]; x.globalAlpha=rand(.25,.6); x.beginPath(); x.ellipse(px,py,rand(8,30),rand(6,20),rand(0,3),0,7); x.fill();} x.globalAlpha=1;
  const area=(fx,col,side)=>{ x.fillStyle=col; x.beginPath(); for(let z=-185;z<=185;z+=5) x.lineTo(...P(fx(z),z)); x.lineTo(...P(side*262,185)); x.lineTo(...P(side*262,-185)); x.closePath(); x.fill(); };
  area(z=>bankE(z)+18,'#9e998d',1); area(z=>bankW(z)-18,'#968e7e',-1);
  // río
  x.fillStyle='#3d5a5e'; x.beginPath(); for(let z=-185;z<=185;z+=5) x.lineTo(...P(bankE(z)-1,z)); for(let z=185;z>=-185;z-=5) x.lineTo(...P(bankW(z)+1,z)); x.closePath(); x.fill();
  x.lineCap='round'; x.lineJoin='round';
  for(const L of puenteStreets()){ x.strokeStyle='#5d5c58'; x.lineWidth=L.w*S; x.beginPath(); L.pts.forEach((q,i)=>i?x.lineTo(...P(...q)):x.moveTo(...P(...q))); x.stroke(); }
  for(const L of puenteStreets()){ x.strokeStyle=L.cost?'#e8e2cf':'#d9c25a'; x.lineWidth=.35*S; x.setLineDash([5*S,4*S]); x.beginPath(); L.pts.forEach((q,i)=>i?x.lineTo(...P(...q)):x.moveTo(...P(...q))); x.stroke(); } x.setLineDash([]);
  x.strokeStyle='#d8d4ca'; x.lineWidth=11*S; x.beginPath(); x.moveTo(...P(-DECK_END,0)); x.lineTo(...P(DECK_END,0)); x.stroke();
  x.fillStyle='rgba(255,255,255,.88)'; x.font=`700 ${11*S}px "Saira Condensed",sans-serif`; x.textAlign='center'; x.textBaseline='middle';
  x.fillText('CORRIENTES',...P(200,-30)); x.fillText('BARRANQUERAS',...P(-200,30));
  x.font=`600 ${7*S}px "Saira Condensed",sans-serif`; x.fillText('Puente General Belgrano',...P(0,-12)); x.fillText('Río Paraná',...P(0,90));
  x.fillText('Avenida 3 de Abril',...P(200,6)); x.fillText('Ruta 16',...P(-200,-6));
  speckle(x,c.width,c.height,50000,['#6d6a52','#b5ab8c','#5f6a3e','#a39e86'],.6,2);
  return puenteCanvas=c;
}
function buildPuente(){
  const c=paintPuente(), tex=new THREE.CanvasTexture(c); tex.anisotropy=ANISO;
  const g=new THREE.PlaneGeometry(PX*2,PZ*2,200,140); g.rotateX(-Math.PI/2);
  const pos=g.attributes.position, uv=g.attributes.uv;
  for(let i=0;i<pos.count;i++){const X=pos.getX(i),Z=pos.getZ(i);pos.setY(i,pH0(X,Z));uv.setXY(i,(PX-X)/(2*PX),1-(PZ-Z)/(2*PZ));}
  g.computeVertexNormals();
  const t=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:tex})); t.receiveShadow=true; worldGroup.add(t);
  waterMesh=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.MeshLambertMaterial({color:0x3d5a5e,transparent:true,opacity:.9}));
  waterMesh.rotation.x=-Math.PI/2; waterMesh.position.y=W.water; worldGroup.add(waterMesh);
  streetSegs=[]; for(const L of puenteStreets()) for(let i=0;i<L.pts.length-1;i++) streetSegs.push({ax:L.pts[i][0],az:L.pts[i][1],bx:L.pts[i+1][0],bz:L.pts[i+1][1]});
  // Puente transitable: tablero inclinado, pilas, dos torres en H y obenques
  const conc=new THREE.MeshLambertMaterial({color:0xd2cdc2}), asph=new THREE.MeshLambertMaterial({color:0x5f5e5a}), steel=new THREE.LineBasicMaterial({color:0xeeeae0});
  for(let x=-DECK_END;x<DECK_END;x+=6){ const x1=Math.min(DECK_END,x+6), h0=deckH(x), h1=deckH(x1), L=Math.hypot(x1-x,h1-h0);
    const d=new THREE.Mesh(new THREE.BoxGeometry(L+.3,.9,11),conc); d.position.set((x+x1)/2,(h0+h1)/2-.47,0); d.rotation.z=Math.atan2(h1-h0,x1-x); d.castShadow=d.receiveShadow=true; worldGroup.add(d);
    const r=new THREE.Mesh(new THREE.BoxGeometry(L+.3,.05,9.4),asph); r.position.set((x+x1)/2,(h0+h1)/2+.01,0); r.rotation.z=d.rotation.z; r.receiveShadow=true; worldGroup.add(r); }
  for(let x=-90;x<=90;x+=18){ const h=deckH(x); const p=new THREE.Mesh(new THREE.BoxGeometry(3,h+5,6),conc); p.position.set(x,(h-5)/2-.5,0); worldGroup.add(p); addPier(x,0,3,6,h-1.2); }
  addAbutments(deckH,pH0,DECK_END,5.3,conc,4.1);
  const rail=[]; for(let x=-DECK_END;x<DECK_END;x+=6) for(const sz of [-5.4,5.4]) rail.push(new THREE.Vector3(x,deckH(x)+1.1,sz),new THREE.Vector3(x+6,deckH(x+6)+1.1,sz));
  for(const tx of [-38,38]){
    for(const sz of [-6.8,6.8]){ const tw=new THREE.Mesh(new THREE.BoxGeometry(3,62,2.4),conc); tw.position.set(tx,24,sz); tw.castShadow=true; worldGroup.add(tw); }
    const cb=new THREE.Mesh(new THREE.BoxGeometry(3,2.6,16),conc); cb.position.set(tx,52,0); worldGroup.add(cb);
    const cb2=new THREE.Mesh(new THREE.BoxGeometry(3,2,16),conc); cb2.position.set(tx,deckH(tx)-2.4,0); worldGroup.add(cb2);
    for(const sz of [-6.8,6.8]) for(let k=1;k<=7;k++) for(const dir of [-1,1]){ const xx=tx+dir*k*7.5; if(Math.abs(xx)>DECK_END) continue; rail.push(new THREE.Vector3(tx,52-k*1.4,sz),new THREE.Vector3(xx,deckH(xx)+.8,sz*.83)); }
  }
  worldGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(rail),steel));
  // Edificios
  const WALLS=[0xeeeae0,0xe2d8c4,0xf1e6cf,0xd9cfbd,0xe8d2bc,0xcfc8bb], ROOFS=[0x7d7e7b,0x9c9a93,0x585b5f,0x7e4e38,0x8a573f], TOWER=[0xe9e6df,0xd5d9dc,0xcfc6b5,0xbfc4c6];
  const clearZ=(x,z,m)=>W.zones.some(Z=>Math.hypot(x-Z.x,z-Z.z)<Z.r+m);
  const fill=(x0,x1,z0,z1,front,port)=>{
    if(x1-x0<12||z1-z0<12) return;
    if(front){ for(let k=0;k<2;k++){ const z=z0+(k+.5)*(z1-z0)/2, x=(x0+x1)/2; if(clearZ(x,z,6)) continue;
        if(port) addBuilding(x,z,Math.min(24,x1-x0-2),Math.min(16,(z1-z0)/2-3),rand(7,10),0,apick([0xb9bcbf,0xa9a49a,0xc4b9a4]),0x6f7275,true,300,false);
        else addBuilding(x,z,Math.min(15,x1-x0-2),Math.min(16,(z1-z0)/2-3),rand(18,36),0,apick(TOWER),0x6f7275,true,320,false); } return; }
    for(let side=0;side<4;side++) for(let u=0;u<4;u++){ if(Math.random()<.38) continue;
      const fw=rand(8,10.5), dp=rand(10,14), h=Math.random()<.15?rand(8,13):rand(3.4,6.5);
      const tx=x0+5+u*((x1-x0-10)/3), tz=z0+5+u*((z1-z0-10)/3); let x,z,w,d;
      if(side===0){x=tx;z=z1-dp/2;w=fw;d=dp;} else if(side===1){x=tx;z=z0+dp/2;w=fw;d=dp;} else if(side===2){x=x0+dp/2;z=tz;w=dp;d=fw;} else {x=x1-dp/2;z=tz;w=dp;d=fw;}
      if(clearZ(x,z,4)||distSegs(x,z,streetSegs)<Math.min(w,d)/2+4.2) continue;
      addBuilding(x,z,w,d,h,0,apick(WALLS),h>7?0x7d7e7b:apick(ROOFS),true,h>7?200:100,false); } };
  const zl=[-185,-150,-100,-50,0,50,100,150,185];
  for(let i=0;i<zl.length-1;i++){ const za=zl[i]+5, zb=zl[i+1]-5, zm=(za+zb)/2;
    fill(bankE(zm)+20,135,za,zb,true,false); fill(145,185,za,zb); fill(195,235,za,zb); fill(245,258,za,zb);
    fill(-135,bankW(zm)-20,za,zb,true,true); fill(-185,-145,za,zb); fill(-235,-195,za,zb); }
  finalizeBuildings();
  const list=[], ok=(x,z,m)=>!gridQuery(x,z,4).some(b=>obPush(x,z,m,b))&&distSegs(x,z,streetSegs)>4.8&&pH0(x,z)>W.water+.6&&!(Math.abs(z)<8&&Math.abs(x)<DECK_END+4);
  for(let z=-182;z<=182;z+=9){ const xe=bankE(z)+5; if(ok(xe,z,1)) list.push({x:xe,z,sp:Math.random()<.6?'pindo':'lapacho'}); const xw=bankW(z)-5; if(ok(xw,z,1)) list.push({x:xw,z,sp:apick(['timbo','ceibo','espinillo'])}); }
  for(let i=0,n=0;i<3000&&n<90;i++){ const x=rand(-260,260), z=rand(-180,180); if(ok(x,z,1.5)&&distSegs(x,z,streetSegs)<8){ list.push({x,z,sp:apick(['lapacho','jacaranda','pindo','ceibo','timbo']),s:rand(.55,.85)}); n++; } }
  buildTrees(list);
  // Red para la IA (el puente es la única vía entre las orillas)
  nodes=[];
  for(const L of puenteStreets()){ let prev=null;
    for(let i=0;i<L.pts.length-1;i++){ const A=L.pts[i],B=L.pts[i+1],len=Math.hypot(B[0]-A[0],B[1]-A[1]),n=Math.max(1,Math.round(len/8));
      for(let k=(i===0?0:1);k<=n;k++){ const tt=k/n, p=new THREE.Vector3(A[0]+(B[0]-A[0])*tt,0,A[1]+(B[1]-A[1])*tt);
        if(Math.abs(p.x)>W.bx-2||Math.abs(p.z)>W.bz-2||puenteH(p.x,p.z)<W.water+.5){prev=null;continue;}
        const nd={p,nb:[],s:L}; nodes.push(nd); if(prev){prev.nb.push(nd);nd.nb.push(prev);} prev=nd; } } }
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j]; if(a.s!==b.s&&a.p.distanceTo(b.p)<7){a.nb.push(b);b.nb.push(a);}}
  W.boundary=[[-W.bx,-W.bz],[-W.bx,W.bz],[W.bx,W.bz],[W.bx,-W.bz]];
}
// ---------- Paso Cristo Redentor (cordillera, comprimido) ----------
const KX=262, KZ=182;
const kRoad=x=>22*Math.sin(x*.025);
const CRISTO={x:22,z:kRoad(22)-40};
function kH(x,z){
  const floor=6+26*Math.exp(-((x/110)**2)), d=Math.abs(z-kRoad(x)), m=clamp((d-38)/95,0,1);
  let h=floor+78*Math.pow(m,1.5)+7*Math.sin(x*.05+z*.04)*m+.6*Math.sin(x*.2)*Math.cos(z*.17);
  h+=14*Math.exp(-((x-CRISTO.x)**2+(z-CRISTO.z)**2)/500);
  return h;
}
let kCanvas=null;
function paintCordillera(){
  if(kCanvas) return kCanvas;
  const S=2, c=document.createElement('canvas'); c.width=KX*2*S; c.height=KZ*2*S; const x=c.getContext('2d'), img=x.createImageData(c.width,c.height), D=img.data;
  for(let py=0;py<c.height;py+=2) for(let px=0;px<c.width;px+=2){
    const wx=KX-px/S, wz=KZ-py/S, h=kH(wx,wz), sl=Math.abs(kH(wx+2,wz)-h)+Math.abs(kH(wx,wz+2)-h), n=Math.sin(wx*.9)*Math.cos(wz*.7)*8+Math.random()*12;
    let r,g,b;
    if(h>62+n*.8||(h>48+n&&sl<2.2)){r=g=236;b=244;} else if(sl>3.2||h>40){r=112+n;g=102;b=92;} else if(h>22){r=150;g=134;b=104;} else {r=138;g=128;b=88;}
    r+=n;g+=n;b+=n;
    for(const [dx,dy] of [[0,0],[1,0],[0,1],[1,1]]){const i=((py+dy)*c.width+px+dx)*4; D[i]=r;D[i+1]=g;D[i+2]=b;D[i+3]=255;}
  }
  x.putImageData(img,0,0);
  const P=(wx,wz)=>[(KX-wx)*S,(KZ-wz)*S];
  x.lineCap='round'; x.lineJoin='round'; x.strokeStyle='#5d5c58'; x.lineWidth=10*S; x.beginPath(); for(let wx=-262;wx<=262;wx+=4) x.lineTo(...P(wx,kRoad(wx))); x.stroke();
  x.strokeStyle='#e8e2cf'; x.lineWidth=.35*S; x.setLineDash([5*S,4*S]); x.beginPath(); for(let wx=-262;wx<=262;wx+=4) x.lineTo(...P(wx,kRoad(wx))); x.stroke(); x.setLineDash([]);
  x.strokeStyle='#8f7f62'; x.lineWidth=5*S; x.beginPath(); x.moveTo(...P(-10,kRoad(-10))); for(let t=0;t<=1;t+=.05) x.lineTo(...P(-10+32*t+6*Math.sin(t*9),kRoad(-10)+(CRISTO.z-kRoad(-10))*t)); x.stroke();
  x.fillStyle='rgba(255,255,255,.9)'; x.font=`700 ${10*S}px "Saira Condensed",sans-serif`; x.textAlign='center';
  x.fillText('ARGENTINA',...P(190,kRoad(190)+22)); x.fillText('CHILE',...P(-190,kRoad(-190)+22));
  x.font=`600 ${7*S}px "Saira Condensed",sans-serif`; x.fillText('Cristo Redentor',...P(CRISTO.x,CRISTO.z-9)); x.fillText('Límite internacional',...P(0,kRoad(0)+16));
  x.strokeStyle='rgba(255,255,255,.55)'; x.setLineDash([3*S,3*S]); x.lineWidth=1*S; x.beginPath(); x.moveTo(...P(0,-182)); x.lineTo(...P(0,182)); x.stroke(); x.setLineDash([]);
  return kCanvas=c;
}
function buildCordillera(){
  const c=paintCordillera(), tex=new THREE.CanvasTexture(c); tex.anisotropy=ANISO;
  const g=new THREE.PlaneGeometry(KX*2,KZ*2,200,140); g.rotateX(-Math.PI/2);
  const pos=g.attributes.position, uv=g.attributes.uv;
  for(let i=0;i<pos.count;i++){const X=pos.getX(i),Z=pos.getZ(i);pos.setY(i,kH(X,Z));uv.setXY(i,(KX-X)/(2*KX),1-(KZ-Z)/(2*KZ));}
  g.computeVertexNormals();
  const t=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:tex})); t.receiveShadow=true; worldGroup.add(t);
  streetSegs=[]; for(let x=-262;x<262;x+=8) streetSegs.push({ax:x,az:kRoad(x),bx:x+8,bz:kRoad(x+8)});
  // Cristo Redentor sobre su loma
  const bronze=new THREE.MeshLambertMaterial({color:0x6e5a3a}), stone=new THREE.MeshLambertMaterial({color:0x9c958a});
  const gy=heightAt(CRISTO.x,CRISTO.z), C=new THREE.Group(); C.position.set(CRISTO.x,gy,CRISTO.z); worldGroup.add(C);
  box(C,5,4,5,0,2,0,stone); box(C,3.4,3,3.4,0,5.5,0,stone);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.55,1.1,5.5,10),bronze); body.position.y=9.7; C.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.5,10,8),bronze); head.position.y=12.9; C.add(head);
  box(C,.35,.35,2.2,0,11.6,.4,bronze); box(C,.25,3.4,.25,.9,10.5,.2,bronze); box(C,1.4,.25,.25,.9,11.4,.2,bronze);
  C.traverse(o=>{if(o.isMesh)o.castShadow=true;}); C.rotation.y=Math.PI/2;
  addBuilding(CRISTO.x,CRISTO.z,5,5,4,0,0x9c958a,0x9c958a,false,1e9,false);
  // Aduanas, refugio y casetas
  const B=(x,dz,w,d,h,wall,roof,pit)=>addBuilding(x,kRoad(x)+dz,w,d,h,0,wall,roof,true,220,!!pit);
  B(150,-20,28,12,6,0xd8d2c6,0x7d7e7b); B(132,-21,10,8,4,0xd8d2c6,0x9c4a32,1); B(168,20,18,10,5,0xcfc8bb,0x7d7e7b); B(185,-18,7,6,3.5,0xe0d8c8,0x9c4a32,1);
  B(-150,20,28,12,6,0xe2ddd0,0x5f6366); B(-132,21,10,8,4,0xe2ddd0,0x8a3a30,1); B(-170,-20,18,10,5,0xd5cfc2,0x5f6366); B(-188,18,7,6,3.5,0xe8e2d4,0x8a3a30,1);
  B(-12,-22,12,8,4.2,0xb9a58a,0x6a4a35,1); B(70,22,9,7,3.5,0xc9bfa9,0x6a4a35,1); B(-70,-22,9,7,3.5,0xc9bfa9,0x6a4a35,1);
  // Bocas de túnel en los extremos
  for(const sx of [-1,1]){ const x=sx*238, z=kRoad(x)+30, y=heightAt(x,z); const P=new THREE.Group(); P.position.set(x,y,z); worldGroup.add(P);
    box(P,12,8,3,0,4,0,stone); box(P,7,5.5,3.2,0,2.75,.05,darkMat); }
  // Rocas y matorral
  for(let i=0,n=0;i<900&&n<70;i++){ const x=rand(-250,250), z=kRoad(x)+rand(-70,70)*(Math.random()<.5?1:-1);
    if(Math.abs(z-kRoad(x))<9||W.zones.some(Z=>Math.hypot(x-Z.x,z-Z.z)<Z.r+3)||Math.abs(z)>170) continue; addRock(x,z,rand(2,6),rand(2,5),rand(1.2,3.5),rand(0,3)); n++; }
  finalizeBuildings();
  const list=[]; for(let i=0,n=0;i<1500&&n<40;i++){ const x=rand(-250,250); if(Math.abs(x)<60) continue; const z=kRoad(x)+rand(12,45)*(Math.random()<.5?1:-1);
    if(gridQuery(x,z,3).some(b=>obPush(x,z,2,b))) continue; list.push({x,z,sp:'espinillo',s:rand(.35,.6)}); n++; }
  buildTrees(list);
  nodes=null; W.boundary=[[-W.bx,-W.bz],[-W.bx,W.bz],[W.bx,W.bz],[W.bx,-W.bz]];
}

// ---------- Cruces del río: represa de Salto Grande y puente Posadas–Encarnación ----------
function crossDef(key){ return key==='salto'?{
    bankE:z=>66+6*Math.sin(z*.03)+3*Math.sin(z*.08), bankW:z=>-(64+5*Math.sin(z*.025+2)+4*Math.sin(z*.07)), hE:3, hW:3,
    deck:x=>{const a=Math.abs(x); return a<92?11:Math.max(3,11-(a-92)*8/26);}, end:118, half:6.5, dam:true,
    east:'SALTO (Uruguay)', west:'CONCORDIA (Argentina)', name:'Represa de Salto Grande', road:['Ruta 3 (Uruguay)','Ruta 14 (Argentina)'] }:{
    bankE:z=>74+8*Math.sin(z*.026)+4*Math.sin(z*.07), bankW:z=>-(72+7*Math.sin(z*.03+1)+5*Math.sin(z*.06)), hE:3.2, hW:2.2,
    deck:x=>{const a=Math.abs(x); return a<75?13+1.2*(1-(x/75)**2):Math.max(2.5,13-(a-75)*10.5/45);}, end:120, half:5.3, dam:false,
    east:'POSADAS (Argentina)', west:'ENCARNACIÓN (Paraguay)', name:'Puente San Roque González de Santa Cruz', road:['Avenida Roque Pérez','Ruta PY01'] }; }
const XX=262, XZ=182;
function xH0(D,x,z){ const n=.2*Math.sin(x*.04)*Math.cos(z*.03);
  if(x>0){ const b=D.bankE(z); return (x>b+6?D.hE:x>b-4?-4+(D.hE+4)*(x-(b-4))/10:-4)+n; }
  const b=D.bankW(z); return (x<b-6?D.hW:x<b+4?-4+(D.hW+4)*((b+4)-x)/10:-4)+n; }
function xH(D,x,z){ const g=xH0(D,x,z); return Math.abs(z)<D.half&&Math.abs(x)<D.end?Math.max(g,D.deck(x)):g; }
function xStreets(D){
  if(D.st) return D.st; const L=[{w:13,pts:[[-262,0],[262,0]],main:true}];
  for(const x of [140,190,240]) L.push({w:9,pts:[[x,-185],[x,185]]}); for(const x of [-140,-190,-240]) L.push({w:9,pts:[[x,-185],[x,185]]});
  for(const z of [-150,-100,-50,50,100,150]){ L.push({w:9,pts:[[D.bankE(z)+14,z],[262,z]]}); L.push({w:9,pts:[[-262,z],[D.bankW(z)-14,z]]}); }
  const ce=[],cw=[]; for(let z=-185;z<=185;z+=8){ce.push([D.bankE(z)+12,z]); cw.push([D.bankW(z)-12,z]);} L.push({w:12,pts:ce,cost:true}); L.push({w:12,pts:cw,cost:true});
  return D.st=L;
}
const xCanvas={};
function paintCross(key,D){
  if(xCanvas[key]) return xCanvas[key];
  const S=2, c=document.createElement('canvas'); c.width=XX*2*S; c.height=XZ*2*S; const x=c.getContext('2d');
  const P=(wx,wz)=>[(XX-wx)*S,(XZ-wz)*S];
  x.fillStyle=key==='salto'?'#71793f':'#6b7a3e'; x.fillRect(0,0,c.width,c.height);
  for(let i=0;i<600;i++){const [px,py]=P(rand(-262,262),rand(-182,182)); x.fillStyle=['#7f7b58','#66713f','#868056','#5c6a3a'][i%4]; x.globalAlpha=rand(.25,.6); x.beginPath(); x.ellipse(px,py,rand(8,30),rand(6,20),rand(0,3),0,7); x.fill();} x.globalAlpha=1;
  const area=(fx,col,side)=>{ x.fillStyle=col; x.beginPath(); for(let z=-185;z<=185;z+=5) x.lineTo(...P(fx(z),z)); x.lineTo(...P(side*262,185)); x.lineTo(...P(side*262,-185)); x.closePath(); x.fill(); };
  area(z=>D.bankE(z)+18,'#9e998d',1); area(z=>D.bankW(z)-18,'#a39a88',-1);
  x.fillStyle='#3d5a5e'; x.beginPath(); for(let z=-185;z<=185;z+=5) x.lineTo(...P(D.bankE(z)-1,z)); for(let z=185;z>=-185;z-=5) x.lineTo(...P(D.bankW(z)+1,z)); x.closePath(); x.fill();
  if(key==='posadas'){ x.fillStyle='#d6c79c'; x.beginPath(); for(let z=40;z<=120;z+=5) x.lineTo(...P(D.bankW(z)-1,z)); for(let z=120;z>=40;z-=5) x.lineTo(...P(D.bankW(z)-10,z)); x.closePath(); x.fill(); }
  x.lineCap='round'; x.lineJoin='round';
  for(const L of xStreets(D)){ x.strokeStyle='#5d5c58'; x.lineWidth=L.w*S; x.beginPath(); L.pts.forEach((q,i)=>i?x.lineTo(...P(...q)):x.moveTo(...P(...q))); x.stroke(); }
  for(const L of xStreets(D)){ x.strokeStyle=L.cost?'#e8e2cf':'#d9c25a'; x.lineWidth=.35*S; x.setLineDash([5*S,4*S]); x.beginPath(); L.pts.forEach((q,i)=>i?x.lineTo(...P(...q)):x.moveTo(...P(...q))); x.stroke(); } x.setLineDash([]);
  x.strokeStyle='#d8d4ca'; x.lineWidth=D.half*2*S; x.beginPath(); x.moveTo(...P(-D.end,0)); x.lineTo(...P(D.end,0)); x.stroke();
  x.fillStyle='rgba(255,255,255,.88)'; x.font=`700 ${10*S}px "Saira Condensed",sans-serif`; x.textAlign='center'; x.textBaseline='middle';
  x.fillText(D.east,...P(200,-30)); x.fillText(D.west,...P(-200,30));
  x.font=`600 ${7*S}px "Saira Condensed",sans-serif`; x.fillText(D.name,...P(0,-14)); x.fillText('Río '+(key==='salto'?'Uruguay':'Paraná'),...P(0,90));
  x.fillText(D.road[0],...P(205,7)); x.fillText(D.road[1],...P(-205,-7));
  speckle(x,c.width,c.height,50000,['#6d6a52','#b5ab8c','#5f6a3e','#a39e86'],.6,2);
  return xCanvas[key]=c;
}
function buildCross(key){
  const D=crossDef(key), c=paintCross(key,D), tex=new THREE.CanvasTexture(c); tex.anisotropy=ANISO;
  const g=new THREE.PlaneGeometry(XX*2,XZ*2,200,140); g.rotateX(-Math.PI/2);
  const pos=g.attributes.position, uv=g.attributes.uv;
  for(let i=0;i<pos.count;i++){const X=pos.getX(i),Z=pos.getZ(i);pos.setY(i,xH0(D,X,Z));uv.setXY(i,(XX-X)/(2*XX),1-(XZ-Z)/(2*XZ));}
  g.computeVertexNormals();
  const t=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:tex})); t.receiveShadow=true; worldGroup.add(t);
  waterMesh=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.MeshLambertMaterial({color:0x3d5a5e,transparent:true,opacity:.9}));
  waterMesh.rotation.x=-Math.PI/2; waterMesh.position.y=W.water; worldGroup.add(waterMesh);
  streetSegs=[]; for(const L of xStreets(D)) for(let i=0;i<L.pts.length-1;i++) streetSegs.push({ax:L.pts[i][0],az:L.pts[i][1],bx:L.pts[i+1][0],bz:L.pts[i+1][1]});
  const conc=new THREE.MeshLambertMaterial({color:0xd2cdc2}), asph=new THREE.MeshLambertMaterial({color:0x5f5e5a}), steel=new THREE.LineBasicMaterial({color:0xeeeae0});
  const deckW=D.half*2+.6;
  for(let x=-D.end;x<D.end;x+=6){ const x1=Math.min(D.end,x+6), h0=D.deck(x), h1=D.deck(x1), L=Math.hypot(x1-x,h1-h0);
    const d=new THREE.Mesh(new THREE.BoxGeometry(L+.3,.9,deckW),conc); d.position.set((x+x1)/2,(h0+h1)/2-.47,0); d.rotation.z=Math.atan2(h1-h0,x1-x); d.castShadow=d.receiveShadow=true; worldGroup.add(d);
    const r=new THREE.Mesh(new THREE.BoxGeometry(L+.3,.05,deckW-1.6),asph); r.position.set((x+x1)/2,(h0+h1)/2+.01,0); r.rotation.z=d.rotation.z; worldGroup.add(r); }
  const lines=[]; for(let x=-D.end;x<D.end;x+=6) for(const sz of [-D.half-.1,D.half+.1]) lines.push(new THREE.Vector3(x,D.deck(x)+1.1,sz),new THREE.Vector3(x+6,D.deck(x+6)+1.1,sz));
  if(D.dam){
    // Cuerpo de la represa, compuertas del vertedero y lago aguas arriba
    const xa=D.bankW(0)-2, xb=D.bankE(0)+2;
    const body=new THREE.Mesh(new THREE.BoxGeometry(xb-xa,15,16),conc); body.position.set((xa+xb)/2,3,0); body.castShadow=body.receiveShadow=true; worldGroup.add(body);
    for(let x=xa+6;x<xb-6;x+=8){ const p=new THREE.Mesh(new THREE.BoxGeometry(2,13,5),conc); p.position.set(x,4.5,-10); worldGroup.add(p);
      const gte=new THREE.Mesh(new THREE.BoxGeometry(5.6,6,.5),new THREE.MeshLambertMaterial({color:0x4a5a62})); gte.position.set(x+4,6,-9.5); worldGroup.add(gte); }
    const shp=new THREE.Shape(); shp.moveTo(D.bankW(8)+1,-8); for(let z=8;z<=200;z+=8) shp.lineTo(D.bankW(z)+1,-z); for(let z=200;z>=8;z-=8) shp.lineTo(D.bankE(z)-1,-z); shp.closePath();
    const lake=new THREE.Mesh(new THREE.ShapeGeometry(shp),new THREE.MeshLambertMaterial({color:0x466670,transparent:true,opacity:.92})); lake.rotation.x=-Math.PI/2; lake.position.y=7.5; worldGroup.add(lake);
    for(let i=0;i<10;i++) puff(new THREE.Vector3(rand(xa+8,xb-8),.5,-13),0xe8f0f2,rand(4,7),rand(30,60),.3,.5);
  } else {
    for(let x=-60;x<=60;x+=20){ const h=D.deck(x); const p=new THREE.Mesh(new THREE.BoxGeometry(3,h+5,5),conc); p.position.set(x,(h-5)/2-.5,0); worldGroup.add(p); addPier(x,0,3,5,h-1.2); }
    for(const tx of [-30,30]){ for(const sz of [-6.2,6.2]){ const tw=new THREE.Mesh(new THREE.BoxGeometry(2.6,48,2.2),conc); tw.position.set(tx,20,sz); tw.castShadow=true; worldGroup.add(tw); }
      const cb=new THREE.Mesh(new THREE.BoxGeometry(2.6,2.2,15),conc); cb.position.set(tx,42,0); worldGroup.add(cb);
      for(const sz of [-6.2,6.2]) for(let k=1;k<=6;k++) for(const dir of [-1,1]){ const xx=tx+dir*k*7; lines.push(new THREE.Vector3(tx,44-k*1.3,sz),new THREE.Vector3(xx,D.deck(xx)+.8,sz*.85)); } }
  }
  worldGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lines),steel));
  addAbutments(D.deck,(x,z)=>xH0(D,x,z),D.end,D.half,conc,4.1);
  const WALLS=[0xeeeae0,0xe2d8c4,0xf1e6cf,0xd9cfbd,0xe8d2bc,0xcfc8bb], ROOFS=[0x7d7e7b,0x9c9a93,0x585b5f,0x7e4e38,0x8a573f], TOWER=[0xe9e6df,0xd5d9dc,0xcfc6b5,0xbfc4c6];
  const clearZ=(x,z,m)=>W.zones.some(Z=>Math.hypot(x-Z.x,z-Z.z)<Z.r+m);
  const fill=(x0,x1,z0,z1,front,tall)=>{
    if(x1-x0<12||z1-z0<12) return;
    if(front){ for(let k=0;k<2;k++){ const z=z0+(k+.5)*(z1-z0)/2, x=(x0+x1)/2; if(clearZ(x,z,6)) continue;
        if(tall) addBuilding(x,z,Math.min(15,x1-x0-2),Math.min(16,(z1-z0)/2-3),rand(16,32),0,apick(TOWER),0x6f7275,true,320,false);
        else addBuilding(x,z,Math.min(20,x1-x0-2),Math.min(14,(z1-z0)/2-3),rand(5,9),0,apick(WALLS),apick(ROOFS),true,220,false); } return; }
    for(let side=0;side<4;side++) for(let u=0;u<4;u++){ if(Math.random()<.4) continue;
      const fw=rand(8,10.5), dp=rand(10,14), h=Math.random()<.12?rand(8,12):rand(3.4,6.5);
      const tx=x0+5+u*((x1-x0-10)/3), tz=z0+5+u*((z1-z0-10)/3); let x,z,w,d;
      if(side===0){x=tx;z=z1-dp/2;w=fw;d=dp;} else if(side===1){x=tx;z=z0+dp/2;w=fw;d=dp;} else if(side===2){x=x0+dp/2;z=tz;w=dp;d=fw;} else {x=x1-dp/2;z=tz;w=dp;d=fw;}
      if(clearZ(x,z,4)||distSegs(x,z,streetSegs)<Math.min(w,d)/2+4.2) continue;
      addBuilding(x,z,w,d,h,0,apick(WALLS),h>7?0x7d7e7b:apick(ROOFS),true,h>7?200:100,Math.random()<.2); } };
  const zl=[-185,-150,-100,-50,0,50,100,150,185];
  for(let i=0;i<zl.length-1;i++){ const za=zl[i]+5, zb=zl[i+1]-5, zm=(za+zb)/2;
    if(!(D.dam&&za>-20&&za<20)) { fill(D.bankE(zm)+20,135,za,zb,true,key==='posadas'); fill(-135,D.bankW(zm)-20,za,zb,true,false); }
    fill(145,185,za,zb); fill(195,235,za,zb); fill(-185,-145,za,zb); fill(-235,-195,za,zb); }
  if(D.dam){ addBuilding(D.bankE(0)+26,-28,30,16,12,0,0xd9d4c8,0x6f7275,true,360,false); addBuilding(D.bankW(0)-26,28,22,14,8,0,0xd9d4c8,0x6f7275,true,300,false); }
  finalizeBuildings();
  const list=[], ok=(x,z,m)=>!gridQuery(x,z,4).some(b=>obPush(x,z,m,b))&&distSegs(x,z,streetSegs)>4.8&&xH0(D,x,z)>W.water+.6&&!(Math.abs(z)<D.half+3&&Math.abs(x)<D.end+4);
  for(let z=-182;z<=182;z+=9){ const xe=D.bankE(z)+5; if(ok(xe,z,1)) list.push({x:xe,z,sp:Math.random()<.5?'pindo':'lapacho'}); const xw=D.bankW(z)-5; if(ok(xw,z,1)) list.push({x:xw,z,sp:apick(['timbo','ceibo','lapacho'])}); }
  for(let i=0,n=0;i<3000&&n<90;i++){ const x=rand(-260,260), z=rand(-180,180); if(ok(x,z,1.5)&&distSegs(x,z,streetSegs)<8){ list.push({x,z,sp:apick(['lapacho','jacaranda','pindo','ceibo','timbo']),s:rand(.55,.85)}); n++; } }
  buildTrees(list);
  nodes=[];
  for(const L of xStreets(D)){ let prev=null;
    for(let i=0;i<L.pts.length-1;i++){ const A=L.pts[i],B=L.pts[i+1],len=Math.hypot(B[0]-A[0],B[1]-A[1]),n=Math.max(1,Math.round(len/8));
      for(let k=(i===0?0:1);k<=n;k++){ const tt=k/n, p=new THREE.Vector3(A[0]+(B[0]-A[0])*tt,0,A[1]+(B[1]-A[1])*tt);
        if(Math.abs(p.x)>W.bx-2||Math.abs(p.z)>W.bz-2||xH(D,p.x,p.z)<W.water+.5){prev=null;continue;}
        const nd={p,nb:[],s:L}; nodes.push(nd); if(prev){prev.nb.push(nd);nd.nb.push(prev);} prev=nd; } } }
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j]; if(a.s!==b.s&&a.p.distanceTo(b.p)<7){a.nb.push(b);b.nb.push(a);}}
  W.boundary=[[-W.bx,-W.bz],[-W.bx,W.bz],[W.bx,W.bz],[W.bx,-W.bz]];
}
const SALTO=crossDef('salto'), POSADAS=crossDef('posadas');
const xOnDeck=D=>(x,z)=>Math.abs(z)<D.half&&Math.abs(x)<D.end;
// debajo del tablero vale el terreno (en la represa no: el paredón es macizo)
const xUnder=D=>(x,z,y)=>Math.abs(z)<D.half&&Math.abs(x)<D.end&&y<D.deck(x)-3.2&&!(D.dam&&x<D.bankE(0)+3&&x>D.bankW(0)-3)?xH0(D,x,z)+(craters.length?craterH(x,z):0):null;
// ---------- Mapas nuevos de Corrientes: Laguna Brava, Paso de la Patria e Itatí ----------
const TX=262, TZ=182, townCanvas={};
const sstep=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1); return t*t*(3-2*t);};
const tNoise=(x,z)=>.5*Math.sin(x*.035)*Math.cos(z*.04)+.25*Math.sin(x*.11+z*.07);
// Laguna Brava: la laguna en el medio, una isla con dos terraplenes (norte y sur) y quintas alrededor
const lbF=a=>1+.12*Math.sin(a*3+1)+.07*Math.sin(a*5);
const lbR=(x,z)=>Math.hypot((x+5)/92,(z-8)/58)/lbF(Math.atan2((z-8)/58,(x+5)/92));
const lbP=(a,k)=>({x:-5+92*k*lbF(a)*Math.cos(a),z:8+58*k*lbF(a)*Math.sin(a)});
function lbH(x,z){
  const d=lbR(x,z), land=1.8+tNoise(x,z)+1.4*sstep(1.3,2.6,d);
  if(d>1.12) return land;
  let h=d>.8?-1.4+(land+1.4)*sstep(.8,1.12,d):-1.4-2.8*sstep(.8,.5,d);
  const di=Math.hypot((x+5)/20,(z-8)/15); if(di<1.8) h=Math.max(h,1.6-3.2*sstep(.75,1.8,di)); // la isla
  const fd=Math.abs(x+5); if(fd<11) h=Math.max(h,.35-1.8*sstep(4,11,fd)); // terraplenes
  return h;
}
// Paso de la Patria: el Paraná al norte, playas de arena y el pueblo en cuadrícula
const ppS=x=>92+9*Math.sin(x*.021+.5)+5*Math.sin(x*.05);
function ppH(x,z){ const s=ppS(x), land=2.4+tNoise(x,z)+1.6*sstep(-20,-170,z);
  if(z<s-16) return land; if(z<s) return .3+(land-.3)*sstep(s,s-16,z); return .3-4.3*sstep(s,s+16,z); }
const ppSand=(x,z)=>{ const s=ppS(x); return z>s-17&&z<s+4; };
// Itatí: el pueblo sobre la barranca, la Basílica, dos bajadas al puerto y la Ruta 12
const itS=x=>78+8*Math.sin(x*.02+1)+4*Math.sin(x*.055);
const itRamp=x=>Math.max(0,1-Math.min(Math.abs(x+120),Math.abs(x-110))/10);
function itH(x,z){ const s=itS(x), top=7+tNoise(x,z)+1.2*sstep(-30,-170,z), r=itRamp(x), b0=s-18-34*r;
  if(z<b0) return top; if(z<s-6) return 1+(top-1)*sstep(s-6,b0,z); if(z<s) return 1-.7*sstep(s-6,s,z); return .3-4.3*sstep(s,s+14,z); }
const itSand=(x,z)=>{ const s=itS(x); return z>s-6&&z<s+3; };
const BASIL={x:-12,z:12};
function townRoads(key){
  const R=townRoads.c||(townRoads.c={}); if(R[key]) return R[key]; const L=[];
  if(key==='lagunabrava'){
    const ring=[]; for(let a=0;a<=Math.PI*2+.01;a+=Math.PI/24){ const p=lbP(a,1.36); ring.push([p.x,p.z]); } L.push({w:9,pts:ring,dirt:true,name:'Camino de la laguna'});
    L.push({w:12,pts:[[-262,-148],[262,-148]],name:'Ruta provincial'});
    const s=lbP(-Math.PI/2,1.36), n=lbP(Math.PI/2,1.36); L.push({w:8,pts:[[-5,-148],[-5,s.z]],dirt:true}); L.push({w:7,pts:[[-5,s.z],[-5,n.z]],dirt:true,name:'Terraplén'}); L.push({w:8,pts:[[-5,n.z],[-5,182]],dirt:true});
    for(const sx of [-1,1]){ const p=lbP(sx>0?0:Math.PI,1.36); L.push({w:8,pts:[[p.x,p.z],[sx*262,p.z+sx*6]],dirt:true}); }
    for(const x of [-190,-120,120,190]) L.push({w:7,pts:[[x,-148],[x,lbP(x>0?-.9:-2.25,1.36).z-6]],dirt:true});
  } else if(key==='pasopatria'){
    const cost=[]; for(let x=-262;x<=262;x+=8) cost.push([x,ppS(x)-22]); L.push({w:11,pts:cost,name:'Costanera'});
    for(let x=-200;x<=200;x+=40) L.push({w:x===0?12:8,pts:[[x,-182],[x,ppS(x)-22]],name:x===0?'Acceso al pueblo':null,dirt:Math.abs(x)>120});
    for(const z of [-140,-95,-50,-5,40]) L.push({w:8,pts:[[-262,z],[262,z]],dirt:Math.abs(z)>100});
  } else {
    for(const z of [-150,-105,-60,-15]) L.push({w:8,pts:[[-262,z],[262,z]],dirt:z<-120});
    L.push({w:8,pts:[[-262,30],[-50,30]]}); L.push({w:8,pts:[[30,30],[262,30]]});
    const cost=[]; for(let x=-262;x<=262;x+=8) cost.push([x,itS(x)-24-34*itRamp(x)]); L.push({w:9,pts:cost,name:'Costanera'});
    for(let x=-200;x<=200;x+=40) if(x!==-40&&x!==0) L.push({w:8,pts:[[x,-182],[x,itS(x)-24-34*itRamp(x)]],dirt:Math.abs(x)>160});
    for(const x of [-120,110]) L.push({w:8,pts:[[x,itS(x)-56],[x,itS(x)-2]],name:'Bajada al puerto'});
    L.push({w:12,pts:[[262,-170],[200,-128],[140,-105],[80,-105]],name:'Ruta 12'});
  }
  return R[key]=L;
}
const TOWN={
  lagunabrava:{h:lbH,sand:(x,z)=>{const d=lbR(x,z); return d>1.02&&d<1.16;},title:'LAGUNA BRAVA',labels:[['Laguna Brava',-5,-30],['La isla',-5,26],['Quintas',-170,60],['Quintas',170,-40]],grass:[104,118,62]},
  pasopatria:{h:ppH,sand:ppSand,title:'PASO DE LA PATRIA',labels:[['Río Paraná',0,140],['Playa',-150,ppS(-150)-8],['Playa',150,ppS(150)-8],['Monumento al Dorado',22,ppS(22)-34]],grass:[108,120,64]},
  itati:{h:itH,sand:itSand,title:'ITATÍ',labels:[['Río Paraná',0,130],['Basílica',BASIL.x,BASIL.z+28],['Puerto',-120,itS(-120)+6],['Puerto',110,itS(110)+6],['Ruta 12',215,-150]],grass:[100,114,60]}
};
function paintTown(key){
  if(townCanvas[key]) return townCanvas[key]; const D=TOWN[key];
  const S=2, c=document.createElement('canvas'); c.width=TX*2*S; c.height=TZ*2*S; const x=c.getContext('2d'), img=x.createImageData(c.width,c.height), A=img.data;
  for(let py=0;py<c.height;py+=2) for(let px=0;px<c.width;px+=2){
    const wx=TX-px/S, wz=TZ-py/S, h=D.h(wx,wz), sl=Math.abs(D.h(wx+2,wz)-h)+Math.abs(D.h(wx,wz+2)-h), n=Math.sin(wx*.9)*Math.cos(wz*.7)*6+Math.random()*10;
    let r,g,b;
    if(h<-.5){ r=70;g=92;b=88; } else if(D.sand(wx,wz)){ r=214;g=198;b=158; } else if(h<.4){ r=96;g=104;b=66; }
    else if(sl>1.6){ r=128;g=104;b=78; } else { [r,g,b]=D.grass; const m=Math.sin(wx*.05+wz*.03); r+=m*10; g+=m*8; }
    r+=n;g+=n;b+=n;
    for(const [dx,dy] of [[0,0],[1,0],[0,1],[1,1]]){const i=((py+dy)*c.width+px+dx)*4; A[i]=r;A[i+1]=g;A[i+2]=b;A[i+3]=255;}
  }
  x.putImageData(img,0,0);
  const P=(wx,wz)=>[(TX-wx)*S,(TZ-wz)*S];
  x.lineCap='round'; x.lineJoin='round';
  for(const L of townRoads(key)){ x.strokeStyle=L.dirt?'#8f7a5c':'#5d5c58'; x.lineWidth=L.w*S; x.beginPath(); L.pts.forEach((q,i)=>i?x.lineTo(...P(...q)):x.moveTo(...P(...q))); x.stroke(); }
  for(const L of townRoads(key)){ if(L.dirt) continue; x.strokeStyle='#d9c25a'; x.lineWidth=.35*S; x.setLineDash([5*S,4*S]); x.beginPath(); L.pts.forEach((q,i)=>i?x.lineTo(...P(...q)):x.moveTo(...P(...q))); x.stroke(); } x.setLineDash([]);
  x.fillStyle='rgba(255,255,255,.88)'; x.textAlign='center'; x.textBaseline='middle';
  x.font=`700 ${11*S}px "Saira Condensed",sans-serif`; x.fillText(D.title,...P(0,-120));
  x.font=`600 ${7*S}px "Saira Condensed",sans-serif`; for(const [t,a,b] of D.labels) x.fillText(t,...P(a,b));
  speckle(x,c.width,c.height,40000,['#6d6a52','#b5ab8c','#5f6a3e','#a39e86'],.6,2);
  return townCanvas[key]=c;
}
function townFill(x0,x1,z0,z1,o){ // casas en el borde de la manzana, sin pisar calles, zonas ni agua
  if(x1-x0<14||z1-z0<14) return; const WALLS=[0xeeeae0,0xe2d8c4,0xf1e6cf,0xd9cfbd,0xe8d2bc,0xcfc8bb,0xd7e0dc,0xe6d0a8], ROOFS=[0x7d7e7b,0x9c9a93,0x7e4e38,0x8a573f,0x9c4a32];
  for(let side=0;side<4;side++) for(let u=0;u<4;u++){ if(Math.random()<(o.skip||.4)) continue;
    const fw=rand(8,11), dp=rand(9,13), h=Math.random()<.08?rand(7,10):rand(3.2,5.5);
    const tx=x0+5+u*((x1-x0-10)/3), tz=z0+5+u*((z1-z0-10)/3); let x,z,w,d;
    if(side===0){x=tx;z=z1-dp/2;w=fw;d=dp;} else if(side===1){x=tx;z=z0+dp/2;w=fw;d=dp;} else if(side===2){x=x0+dp/2;z=tz;w=dp;d=fw;} else {x=x1-dp/2;z=tz;w=dp;d=fw;}
    if(W.zones.some(Z=>Math.hypot(x-Z.x,z-Z.z)<Z.r+4)||distSegs(x,z,streetSegs)<Math.min(w,d)/2+4.2) continue;
    let low=false; for(const [a,b] of [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[0,0]]) if(heightAt(x+a,z+b)<(o.minH||1)) low=true; if(low) continue;
    addBuilding(x,z,w,d,h,0,apick(WALLS),h>6.5?0x7d7e7b:apick(ROOFS),true,h>6.5?200:100,h<6.5&&Math.random()<.45); } }
const fixBld=()=>{ const r=bList[bList.length-1]; if(r){ r.hp=r.max=1e9; } };
function buildTown(key){
  const D=TOWN[key], c=paintTown(key), tex=new THREE.CanvasTexture(c); tex.anisotropy=ANISO;
  const g=new THREE.PlaneGeometry(TX*2,TZ*2,220,150); g.rotateX(-Math.PI/2);
  const pos=g.attributes.position, uv=g.attributes.uv;
  for(let i=0;i<pos.count;i++){const X=pos.getX(i),Z=pos.getZ(i);pos.setY(i,D.h(X,Z));uv.setXY(i,(TX-X)/(2*TX),1-(TZ-Z)/(2*TZ));}
  g.computeVertexNormals();
  const t=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:tex})); t.receiveShadow=true; worldGroup.add(t);
  waterMesh=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.MeshLambertMaterial({color:key==='lagunabrava'?0x4a5e52:0x6a6a52,transparent:true,opacity:.88}));
  waterMesh.rotation.x=-Math.PI/2; waterMesh.position.y=W.water; worldGroup.add(waterMesh);
  streetSegs=[]; for(const L of townRoads(key)) for(let i=0;i<L.pts.length-1;i++) streetSegs.push({ax:L.pts[i][0],az:L.pts[i][1],bx:L.pts[i+1][0],bz:L.pts[i+1][1]});
  const wood=new THREE.MeshLambertMaterial({color:0x7a6248}), conc=new THREE.MeshLambertMaterial({color:0xd8d2c4}), gold=new THREE.MeshStandardMaterial({color:0xd8a531,roughness:.35,metalness:.7});
  const list=[], treeOk=(x,z,m)=>!gridQuery(x,z,4).some(b=>obPush(x,z,m,b))&&distSegs(x,z,streetSegs)>4.8&&!W.zones.some(Z=>Math.hypot(x-Z.x,z-Z.z)<Z.r);
  if(key==='lagunabrava'){
    // muelles de madera y quintas con galpones alrededor de la laguna
    for(const a of [0,Math.PI*.78,-Math.PI*.3]){ const p=lbP(a,1.3), q=lbP(a,.95), G=new THREE.Group(); worldGroup.add(G);
      const L=Math.hypot(q.x-p.x,q.z-p.z), m=box(G,2.4,.25,L,0,.75,0,wood); G.position.set((p.x+q.x)/2,0,(p.z+q.z)/2); G.rotation.y=Math.atan2(q.x-p.x,q.z-p.z);
      for(let k=-L/2;k<=L/2;k+=3) for(const sx of [-1,1]) box(G,.2,2.6,.2,sx*1.1,-.4,k,wood); }
    for(let i=0,n=0;i<900&&n<46;i++){ const a=rand(0,Math.PI*2), k=rand(1.55,2.25), p=lbP(a,k); if(Math.abs(p.x)>235||Math.abs(p.z)>165||Math.abs(p.z+148)<14) continue;
      if(W.zones.some(Z=>Math.hypot(p.x-Z.x,p.z-Z.z)<Z.r+4)||distSegs(p.x,p.z,streetSegs)<10) continue;
      const big=Math.random()<.25; if(addBuilding(p.x,p.z,big?14:rand(9,12),big?10:rand(8,10),big?5.5:rand(3.2,4.4),rand(-.3,.3),apick([0xeeeae0,0xf1e6cf,0xe8d2bc,0xd7e0dc]),big?0x8a8f93:apick([0x9c4a32,0x7e4e38,0x8a573f]),true,120,!big)) n++; }
    for(let x=-235;x<=235;x+=40) for(const [z0,z1] of [[-182,-153],[-143,-112]]) townFill(x,x+36,z0,z1,{skip:.55});
    // la isla: puesto de pescadores
    addBuilding(-5+9,12,7,5,3,0,0xc9bfa9,0x6a4a35,false,100,true);
    // juncos y embalsados en la orilla, y monte de quintas
    for(let i=0,n=0;i<6000&&n<260;i++){ const x=rand(-110,100), z=rand(-60,75), h=lbH(x,z); if(h>-1.45&&h<.2&&Math.abs(x+5)>7) { list.push({x,z,sp:'junco',s:rand(.6,1.2)}); n++; } }
    for(let i=0,n=0;i<4000&&n<120;i++){ const x=rand(-255,255), z=rand(-175,175); if(lbR(x,z)<1.2||!treeOk(x,z,1.5)) continue; list.push({x,z,sp:apick(['timbo','lapacho','pindo','ceibo','jacaranda','algarrobo']),s:rand(.6,1)}); n++; }
  } else if(key==='pasopatria'){
    for(let x=-240;x<200;x+=40) for(const [z0,z1] of [[-182,-140],[-140,-95],[-95,-50],[-50,-5],[-5,40]]) townFill(x+4,x+36,z0+4,z1-4,{skip:Math.abs(x)>150?.6:.35,minH:1.5});
    for(let x=-240;x<200;x+=40){ const z1=ppS(x+20)-26; if(z1-44>14) townFill(x+4,x+36,44,z1,{skip:.5,minH:1.5}); }
    // Monumento al Dorado en la costanera
    { const mx=22, mz=ppS(22)-34, gy=heightAt(mx,mz), M=new THREE.Group(); M.position.set(mx,gy,mz); worldGroup.add(M);
      box(M,5,2.2,5,0,1.1,0,conc); box(M,3,1.6,3,0,3,0,conc);
      const body=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),gold); body.scale.set(3.4,1.5,.9); body.position.set(0,6.4,0); body.rotation.z=.35; M.add(body);
      const tail=new THREE.Mesh(new THREE.ConeGeometry(1.3,2.4,4),gold); tail.rotation.z=-Math.PI/2+.35; tail.position.set(-3.6,5.2,0); tail.scale.set(1,1,.3); M.add(tail);
      const fin=new THREE.Mesh(new THREE.ConeGeometry(.6,1.6,3),gold); fin.position.set(.3,8.1,0); fin.scale.set(1.6,1,.3); M.add(fin);
      M.traverse(o=>{if(o.isMesh)o.castShadow=true;}); M.rotation.y=.4;
      addBuilding(mx,mz,5,5,8,0,0xd8d2c4,0xd8d2c4,false,1e9,false); fixBld(); }
    // muelles de pescadores, sombrillas de paja en la playa
    for(const x0 of [-200,-80,70,190]){ const s=ppS(x0), G=new THREE.Group(); G.position.set(x0,0,s+4); worldGroup.add(G); box(G,2.4,.25,22,0,.9,6,wood); for(let k=-4;k<=16;k+=3) for(const sx of [-1,1]) box(G,.2,4,.2,sx*1.1,-1,k,wood); }
    const thatch=new THREE.MeshLambertMaterial({color:0xb59a5e});
    for(let x=-240;x<=240;x+=14){ if(Math.random()<.4) continue; const z=ppS(x)-rand(5,11), y=heightAt(x,z), G=new THREE.Group(); G.position.set(x,y,z); worldGroup.add(G);
      box(G,.18,2.6,.18,0,1.3,0,wood); const r=new THREE.Mesh(new THREE.ConeGeometry(1.9,1,9),thatch); r.position.y=2.8; G.add(r); }
    for(let i=0,n=0;i<4000&&n<120;i++){ const x=rand(-255,255), z=rand(-178,ppS(0)-18); if(!treeOk(x,z,1.5)||heightAt(x,z)<1.5) continue; list.push({x,z,sp:apick(['lapacho','pindo','jacaranda','timbo','ceibo']),s:rand(.6,1)}); n++; }
    for(let x=-250;x<=250;x+=10){ const z=ppS(x)-19+rand(-1,1); if(treeOk(x,z,1)) list.push({x,z,sp:'pindo'}); }
  } else {
    // Basílica de Itatí: nave, cúpula grande con linterna y torre del campanario
    { const B=BASIL, gy=heightAt(B.x,B.z), G=new THREE.Group(); G.position.set(B.x,gy,B.z); worldGroup.add(G);
      const wall=new THREE.MeshLambertMaterial({color:0xece6d8}), dome=new THREE.MeshStandardMaterial({color:0x8fa3ad,roughness:.5,metalness:.4});
      addBuilding(B.x,B.z,28,40,16,0,0xece6d8,0x8a8f93,false,1e9,false); fixBld();
      const drum=new THREE.Mesh(new THREE.CylinderGeometry(10,10,9,24),wall); drum.position.set(0,20.5,4); G.add(drum);
      const cup=new THREE.Mesh(new THREE.SphereGeometry(10.4,24,14,0,Math.PI*2,0,Math.PI/2),dome); cup.scale.y=1.35; cup.position.set(0,25,4); G.add(cup);
      const lan=new THREE.Mesh(new THREE.CylinderGeometry(2,2,5,12),wall); lan.position.set(0,41.5,4); G.add(lan);
      const lc=new THREE.Mesh(new THREE.SphereGeometry(2.2,12,8,0,Math.PI*2,0,Math.PI/2),dome); lc.position.set(0,44,4); G.add(lc);
      box(G,.35,4,.35,0,47.5,4,gold); box(G,2,.35,.35,0,48,4,gold);
      for(const sx of [-1,1]){ const tw=box(G,6,30,6,sx*9,15,-19,wall); const tp=new THREE.Mesh(new THREE.ConeGeometry(3.6,6,4),dome); tp.position.set(sx*9,33,-19); tp.rotation.y=Math.PI/4; G.add(tp); }
      addBuilding(B.x-9,B.z-19,6,6,30,0,0xece6d8,0xece6d8,false,1e9,false); fixBld(); addBuilding(B.x+9,B.z-19,6,6,30,0,0xece6d8,0xece6d8,false,1e9,false); fixBld();
      G.traverse(o=>{if(o.isMesh)o.castShadow=true;}); }
    for(let x=-240;x<200;x+=40) for(const [z0,z1] of [[-182,-150],[-150,-105],[-105,-60],[-60,-15],[-15,30]]) townFill(x+4,x+36,z0+4,z1-4,{skip:Math.abs(x)>160?.6:.35,minH:4});
    for(let x=-240;x<200;x+=40){ const z1=Math.min(itS(x+4),itS(x+36))-26-34*Math.max(itRamp(x+4),itRamp(x+36)); if(z1-34>14) townFill(x+4,x+36,34,z1,{skip:.45,minH:4}); }
    // puertos con lanchas
    const hull=new THREE.MeshLambertMaterial({color:0xe8e4da});
    for(const x0 of [-120,110]){ const s=itS(x0), G=new THREE.Group(); G.position.set(x0,0,s+2); worldGroup.add(G); box(G,8,.4,14,0,.8,6,conc);
      for(const sx of [-1,1]){ const b=box(G,2.2,1,6,sx*7,-.1,8,hull); b.rotation.y=sx*.2; } }
    for(let i=0,n=0;i<4000&&n<110;i++){ const x=rand(-255,255), z=rand(-178,70); if(!treeOk(x,z,1.5)||heightAt(x,z)<4) continue; list.push({x,z,sp:apick(['lapacho','jacaranda','timbo','pindo','ceibo']),s:rand(.6,1)}); n++; }
    for(let i=0,n=0;i<3000&&n<70;i++){ const x=rand(-255,255), s=itS(x), z=rand(s-20,s-6); if(!treeOk(x,z,1)||Math.abs(x+120)<10||Math.abs(x-110)<10) continue; list.push({x,z,sp:apick(['ceibo','timbo','espinillo'])}); n++; }
  }
  finalizeBuildings();
  buildTrees(list);
  nodes=[];
  for(const L of townRoads(key)){ let prev=null;
    for(let i=0;i<L.pts.length-1;i++){ const A=L.pts[i],B=L.pts[i+1],len=Math.hypot(B[0]-A[0],B[1]-A[1]),n=Math.max(1,Math.round(len/8));
      for(let k=(i===0?0:1);k<=n;k++){ const tt=k/n, p=new THREE.Vector3(A[0]+(B[0]-A[0])*tt,0,A[1]+(B[1]-A[1])*tt);
        if(Math.abs(p.x)>W.bx-2||Math.abs(p.z)>W.bz-2||D.h(p.x,p.z)<W.water+.5){prev=null;continue;}
        const nd={p,nb:[],s:L}; nodes.push(nd); if(prev){prev.nb.push(nd);nd.nb.push(prev);} prev=nd; } } }
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j]; if(a.s!==b.s&&a.p.distanceTo(b.p)<7){a.nb.push(b);b.nb.push(a);}}
  W.boundary=[[-W.bx,-W.bz],[-W.bx,W.bz],[W.bx,W.bz],[W.bx,-W.bz]];
}

// ---------- Mapas urbanos de Corrientes hechos a partir de imágenes satelitales (comprimidos): calles reales, manzanas edificadas y lugares conocidos ----------
// Se dibujan en metros con el este hacia la derecha y el norte hacia arriba (E,N); en el juego x=-E, z=N, como el resto de los mapas.
const cityCanvas={}, CITY={};
const cRot=(u,v,a)=>[u*Math.cos(a)-v*Math.sin(a),u*Math.sin(a)+v*Math.cos(a)];
const cW=([E,N])=>[-E,N];
const cH=(x,z)=>.25*Math.sin(x*.011+1)*Math.cos(z*.013)+.12*Math.sin(x*.05)*Math.sin(z*.04);
function lerpPts(P,E){ for(let i=0;i<P.length-1;i++){ const [a,b]=[P[i],P[i+1]]; if((E-a[0])*(E-b[0])<=0&&a[0]!==b[0]) return a[1]+(b[1]-a[1])*(E-a[0])/(b[0]-a[0]); } return P[E<P[0][0]?0:P.length-1][1]; }
// Avenida de doble mano: dos calzadas paralelas con cantero central
function dualRoad(L,pts,name,gap=5.6,w=9){ const off=(P,o)=>P.map((p,i)=>{ const a=P[Math.max(0,i-1)], b=P[Math.min(P.length-1,i+1)], dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1; return [p[0]-dz/l*o,p[1]+dx/l*o]; });
  L.push({w,pts:off(pts,gap),name,av:1}); L.push({w,pts:off(pts,-gap),name:null,av:1}); L.median=(L.median||[]); L.median.push({pts,w:gap*2-w+.6}); }
// ---------- 1) Ruta 12 y Av. Independencia (rotonda, Av. Regimiento Correntinos y la cancha de Boca Unidos) ----------
CITY.rotonda=(()=>{ const L=[], R=[186,112], tilt=.06;
  const IND=[[-270,170],[-100,158],[60,140],[150,121],[163,117]], indN=E=>lerpPts(IND,E);
  dualRoad(L,IND.map(cW),'Av. Independencia');
  const ring=[]; for(let a=0;a<=Math.PI*2+.01;a+=Math.PI/14) ring.push(cW([R[0]+25*Math.cos(a),R[1]+25*Math.sin(a)])); L.push({w:10,pts:ring,name:'Rotonda'});
  L.push({w:13,pts:[[196,89],[204,20],[224,-60],[270,-150]].map(cW),name:'Ruta Nacional 12'}); L.push({w:13,pts:[[203,131],[270,186]].map(cW),name:'Ruta 12'}); L.push({w:11,pts:[[211,113],[270,108]].map(cW),name:'Ruta 5'});
  const corrN=E=>-.0886*(E+262); L.push({w:13,pts:[[-270,corrN(-270)],[0,corrN(0)],[214,corrN(214)]].map(cW),name:'Av. Regimiento Correntinos'});
  const stad=[150,215,-170,-110], inStad=(E,N)=>E>stad[0]-6&&E<stad[1]+6&&N>stad[2]-6&&N<stad[3]+6;
  const rn12E=N=>lerpPts([[89,196],[20,204],[-60,224],[-150,270]].map(([n,e])=>[n,e]).sort((a,b)=>a[0]-b[0]),N);
  const NS=[[-215,'Esteban A. Gascón'],[-170,'Av. Montecarlo'],[-125,'Thames'],[-80,'Yugoslavia'],[-38,'Sánchez de Bustamante'],[2,'Martínez de la Torre'],[42,'Paul Groussac'],[82,'Alejandro Dumas'],[122,'Milán'],[160,'Cnel. Atienza']];
  for(const [E0,nm] of NS){ const pts=[]; for(let N=-190;N<=180;N+=10){ const E=E0+N*tilt; if(N>indN(E)-6||E>rn12E(N)-8) break; if(inStad(E,N)){ if(pts.length>1) L.push({w:E0===-170?11:8,pts:pts.map(cW),name:nm}); pts.length=0; continue; } pts.push([E,N]); } if(pts.length>1) L.push({w:E0===-170?11:8,pts:pts.map(cW),name:nm}); }
  const EW=[[100,'Lavalle'],[70,'Necochea'],[42,'Las Heras'],[18,'C. El Trébol'],[-40,'Córcega'],[-78,'Ombú'],[-116,'Los Laureles'],[-152,'Siracusa']];
  for(const [N0,nm] of EW){ const pts=[]; for(let E=-270;E<=262;E+=10){ const N=N0-E*.03; if(N>indN(E)-6) { if(pts.length>1) L.push({w:8,pts:pts.map(cW),name:nm}); pts.length=0; continue; } if(E>rn12E(N)-8||inStad(E,N)||(N0<=-40&&Math.abs(N-corrN(E))<8)) { if(pts.length>1) L.push({w:8,pts:pts.map(cW),name:nm}); pts.length=0; continue; } pts.push([E,N]); } if(pts.length>1) L.push({w:8,pts:pts.map(cW),name:nm}); }
  const box4=(e0,e1,n0,n1)=>[[e0,n0],[e1,n0],[e1,n1],[e0,n1]].map(cW);
  return {title:'RUTA 12 Y AV. INDEPENDENCIA',roads:L,ground:[118,116,90],
    parks:[{poly:box4(-80+4,-38-4,-112,-48),trees:70,sp:['timbo','timbo','lapacho','algarrobo','ceibo'],label:'Arboleda'},{poly:box4(-34,38,108,128),trees:22,wild:1,sp:['espinillo','timbo','algarrobo'],label:'Baldío'},{poly:box4(46,78,22,66),trees:30,wild:1,sp:['timbo','espinillo','ceibo']},{poly:box4(-210,-174,46,66),trees:16,sp:['lapacho','jacaranda','timbo']},
      {poly:(()=>{const c=[];for(let a=0;a<Math.PI*2;a+=Math.PI/10)c.push(cW([R[0]+19*Math.cos(a),R[1]+19*Math.sin(a)]));return c;})(),trees:6,sp:['pindo'],label:null},
      {poly:box4(216,262,-178,50),trees:18,wild:1,sp:['espinillo','algarrobo','timbo'],field:1},{poly:box4(208,262,118,182),trees:6,wild:1,sp:['espinillo']}],
    keep:[box4(stad[0],stad[1],stad[2],stad[3]),box4(52,96,146,172),box4(-60,-20,-150,-120),box4(222,250,126,150),box4(84,108,-28,-6)],
    labels:[['Rotonda Ruta 12',...cW([R[0],R[1]-34])],['Cancha de Boca Unidos',...cW([182,-178])],['Parroquia Jesús Misericordioso',...cW([96,-2])],['Escuela Técnica',...cW([74,178])]],
    hgt:()=>Math.random()<.06?rand(6.5,9):rand(3.1,5.4), pitch:.22, fr:[7.5,11], dp:[10,14.6], row2:.3, skip:.08,
    land:G=>{ // cancha de Boca Unidos, escuela, parroquia, supermercado y concesionaria
      const [sx,sz]=cW([(stad[0]+stad[1])/2,(stad[2]+stad[3])/2]), gy=heightAt(sx,sz), conc=new THREE.MeshLambertMaterial({color:0xcfc8b8}), blue=new THREE.MeshLambertMaterial({color:0x2a4a8a}), yel=new THREE.MeshLambertMaterial({color:0xe2c23a}), grass=new THREE.MeshLambertMaterial({color:0x4f8a3a});
      const F=new THREE.Mesh(new THREE.PlaneGeometry(36,52),grass); F.rotation.x=-Math.PI/2; F.position.set(sx,gy+.06,sz); G.add(F);
      for(const k of [-1,1]){ const st=box(G,7,5,52,sx+k*24,gy+2.5,sz,conc); st.rotation.z=k*.3; addBuilding(sx+k*24,sz,7,52,4.5,0,0x2a4a8a,0xe2c23a,false,1e9,false); fixBld(); }
      box(G,30,4,6,sx,gy+2,sz+30,blue); addBuilding(sx,sz+30,30,6,4,0,0x2a4a8a,0xe2c23a,false,1e9,false); fixBld();
      for(const k of [-1,1]) for(const j of [-1,1]){ cyl(G,.25,.3,22,sx+k*20,gy+11,sz+j*28,6,darkMat); box(G,3,1.2,.4,sx+k*20,gy+22,sz+j*28,lampW); }
      for(const k of [-1,1]){ box(G,.15,2.4,7.3,sx,gy+1.2,sz+k*26,new THREE.MeshLambertMaterial({color:0xffffff})); }
      const [ex,ez]=cW([74,159]); addBuilding(ex,ez,40,18,8,0,0xd8d0be,0x8a8f93,false,420,false);
      const [px,pz]=cW([96,-17]); addBuilding(px,pz,14,22,9,0,0xeae4d6,0x9c4a32,false,300,true); addBuilding(px+5,pz+12,4.5,4.5,22,0,0xeae4d6,0xeae4d6,false,1e9,false); fixBld();
      { const cr=new THREE.Group(); cr.position.set(px+5,heightAt(px+5,pz+12)+22.6,pz+12); box(cr,.3,2.4,.3,0,1.2,0,darkMat); box(cr,1.3,.3,.3,0,1.7,0,darkMat); G.add(cr); }
      const [mx,mz]=cW([-40,-135]); addBuilding(mx,mz,36,24,6.5,0,0xe8e2d0,0xb8bcc0,false,380,false);
      { const s=box(G,14,2.2,.4,mx,heightAt(mx,mz)+7.4,mz+12.3,new THREE.MeshLambertMaterial({color:0xc8281e})); }
      const [fx,fz]=cW([236,138]); addBuilding(fx,fz,24,16,6,0,0xf2f2f2,0x9aa0a6,false,300,false);
      { const gl=box(G,.3,4,22,fx+12.1,heightAt(fx,fz)+2.2,fz,glassMat); }
      const [ox,oz]=cW([R[0],R[1]]); const mon=new THREE.Group(); mon.position.set(ox,heightAt(ox,oz),oz); box(mon,3,1,3,0,.5,0,conc); box(mon,1.2,9,1.2,0,5,0,conc); G.add(mon);
    },
    zones:[{id:'A',x:-186,z:112,r:17,label:'Rotonda Ruta 12'},{id:'B',x:-42,z:-24,r:16,label:'Av. Correntinos y P. Groussac'},{id:'C',x:60,z:-80,r:16,label:'Arboleda Don Pitó'}],
    spawns:{0:[{label:'Base oeste, Av. Independencia',x:238,z:120},{label:'Base sudoeste, Siracusa',x:238,z:-150}],
            1:[{label:'Base este, Ruta 12',x:-240,z:-10},{label:'Base noreste, Ruta 5',x:-240,z:80}]}};
})();
// ---------- 2) Av. Independencia: Carrefour, hospital, colegio y concesionarias ----------
CITY.carrefour=(()=>{ const L=[], phi=-.19, P=(u,v)=>cW(cRot(u,v,phi));
  dualRoad(L,[[-320,0],[320,0]].map(([u,v])=>P(u,v)),'Av. Independencia',6,9);
  const par=[[48,'Luis Braille'],[92,'Suiza'],[136,'Almte. Brown'],[-46,'Herrera'],[-90,'Lavalle'],[-134,'Gral. Paz'],[-178,'Necochea'],[-222,'Las Heras']];
  for(const [v,nm] of par) L.push({w:8,pts:[[-330,v],[330,v]].map(([u,vv])=>P(u,vv)),name:nm});
  L.push({w:12,pts:[[-115,-260],[-115,-10]].map(([u,v])=>P(u,v)),name:'Av. Chacabuco'}); L.push({w:12,pts:[[-115,10],[-115,260]].map(([u,v])=>P(u,v)),name:'Av. Chacabuco'});
  const perp=[[-71,'Saavedra'],[-27,'J. J. Paso'],[17,'Castelli'],[61,'Francia'],[105,'Güemes'],[149,'Tacuarí'],[193,'Resoagli'],[237,'Obispo Niella'],[281,'Niño Jesús'],[-159,'Bolivia'],[-203,'Chile'],[-247,'Ferreira'],[-291,'Paraguay']];
  for(const [u,nm] of perp){ L.push({w:8,pts:[[u,-260],[u,-10]].map(([uu,v])=>P(uu,v)),name:nm}); if(u>-120) L.push({w:8,pts:[[u,10],[u,260]].map(([uu,v])=>P(uu,v)),name:null}); }
  const rect=(u0,u1,v0,v1)=>[[u0,v0],[u1,v0],[u1,v1],[u0,v1]].map(([u,v])=>P(u,v));
  const car=[]; for(let u=-185;u<=-130;u+=4.5) for(const v of [18,25,32]) if(Math.random()<.7){ const [x,z]=P(u,v); car.push({x,z,a:phi+Math.PI/2+(Math.random()<.5?0:Math.PI)}); }
  return {title:'AV. INDEPENDENCIA',roads:L,ground:[116,118,90],extraCars:car,
    parks:[{poly:rect(-62,-36,-128,-98),trees:16,wild:1,sp:['timbo','espinillo','algarrobo'],label:'Baldío'},{poly:rect(152,184,62,86),trees:4,field:1,sp:['timbo'],label:'Cancha del colegio'},{poly:rect(-248,-190,96,132),trees:12,sp:['timbo','lapacho']}],
    paved:[rect(-190,-122,12,40)],
    keep:[rect(-252,-196,30,90),rect(-192,-122,12,94),rect(212,252,-48,-12),rect(-236,-204,-162,-140),rect(152,186,56,92)],
    labels:[['Carrefour',...P(-156,70)],['Hospital',...P(-224,98)],['Concesionaria',...P(232,-58)],['Club Sagrado Corazón',...P(-220,-170)],['Colegio',...P(168,100)]],
    hgt:()=>Math.random()<.07?rand(6.5,9.5):rand(3.1,5.6), pitch:.25, fr:[7.5,11], dp:[10,14.6], row2:.3, skip:.08,
    land:G=>{ const add=(u,v,w,d,h,wall,roof,hp=360,pit=false)=>{ const [x,z]=P(u,v); addBuilding(x,z,w,d,h,-phi,wall,roof,false,hp,pit); return [x,z]; };
      const [cx,cz]=add(-156,66,58,46,9,0xe8e6e0,0xb8bcc0,600);
      { const [x,z]=P(-156,42.6); const s=box(G,20,2.4,.5,x,heightAt(x,z)+7.5,z,new THREE.MeshLambertMaterial({color:0x1e4fa0})); s.rotation.y=-phi; const s2=box(G,6,2.4,.55,x-Math.cos(phi)*7,heightAt(x,z)+7.5,z+Math.sin(phi)*7,new THREE.MeshLambertMaterial({color:0xd8281e})); s2.rotation.y=-phi; }
      add(-224,48,52,22,8,0xa8553a,0x7a7e80,520); add(-242,78,16,40,8,0xa8553a,0x7a7e80,420); add(-206,78,16,40,8,0xa8553a,0x7a7e80,420);
      add(232,-30,36,30,6,0xf2f2f2,0x9aa0a6,300); { const [x,z]=P(232,-15.2); const gl=box(G,34,4.2,.3,x,heightAt(x,z)+2.3,z,glassMat); gl.rotation.y=-phi; }
      add(-220,-151,32,24,9,0xd8d0bc,0x8a8f93,400); add(168,74,30,12,7,0xe8dcc0,0x8a573f,300,true); add(160,128,30,20,7,0xc8c8c4,0x9aa0a6,300);
    },
    zones:[{id:'A',...(([x,z])=>({x,z}))(P(-156,26)),r:16,label:'Estacionamiento del Carrefour'},{id:'B',...(([x,z])=>({x,z}))(P(61,0)),r:16,label:'Independencia y Francia'},{id:'C',...(([x,z])=>({x,z}))(P(232,-6)),r:16,label:'Concesionaria Chevrolet'}],
    spawns:{0:[{label:'Base oeste, Av. Independencia',x:238,z:-38},{label:'Base sudoeste, Las Heras',x:238,z:-160}],
            1:[{label:'Base este, Av. Independencia',x:-238,z:-55},{label:'Base noreste, Almte. Brown',x:-238,z:120}]}};
})();
// ---------- 3) Centro: La Rosada, Plaza Torrent, Plaza Libertad, Av. Gdor. Pujol y Av. Pedro Ferré ----------
CITY.centro=(()=>{ const L=[], th=.05, P=(E,N)=>cW(cRot(E,N,th));
  const EW=[[165,'J. M. Rolón'],[121,'25 de Mayo'],[77,'Carlos Pellegrini'],[33,'9 de Julio'],[-11,'Junín'],[-55,'H. Yrigoyen'],[-99,'San Martín'],[-143,'Belgrano']];
  const NS=[[-230,'La Rioja'],[-186,'San Juan'],[-142,'Catamarca'],[-98,'San Lorenzo'],[-54,'Santa Fe'],[-10,'España'],[34,'Uruguay'],[78,'Brasil'],[122,'Perú'],[166,'Gdor. Gelabert'],[254,'Pago Largo']];
  const FER=E=>-163-.045*E; dualRoad(L,[[-300,FER(-300)],[300,FER(300)]].map(([E,N])=>P(E,N)),'Av. Pedro Ferré',5.6,9);
  for(const [N,nm] of EW) L.push({w:8,pts:[[-300,N],[300,N]].map(([E,n])=>P(E,n)),name:nm});
  for(const [E,nm] of NS) L.push({w:8,pts:[[E,FER(E)+6],[E,200]].map(([e,N])=>P(e,N)),name:nm});
  dualRoad(L,[[210,FER(210)+12],[210,200]].map(([E,N])=>P(E,N)),'Av. Artigas',5.2,8.5);
  const PJ=[[-40,195],[262,-75]], pj=t=>[PJ[0][0]+(PJ[1][0]-PJ[0][0])*t,PJ[0][1]+(PJ[1][1]-PJ[0][1])*t];
  const rv=pj(.48); dualRoad(L,[pj(0),pj(.42)].map(([E,N])=>P(E,N)),'Av. Gdor. Pujol',5.2,8.5); dualRoad(L,[pj(.54),pj(1)].map(([E,N])=>P(E,N)),null,5.2,8.5);
  const ring=[]; for(let a=0;a<=Math.PI*2+.01;a+=Math.PI/12) ring.push(P(rv[0]+16*Math.cos(a),rv[1]+16*Math.sin(a))); L.push({w:9,pts:ring,name:'Rotonda Poncho Verde'});
  const blk=(e0,e1,n0,n1,m=4)=>[[e0+m,n0+m],[e1-m,n0+m],[e1-m,n1-m],[e0+m,n1-m]].map(([E,N])=>P(E,N));
  return {title:'CORRIENTES · CENTRO',roads:L,ground:[132,126,112],urban:1,
    parks:[{poly:blk(-186,-142,-55,-11),trees:34,plaza:1,sp:['lapacho','jacaranda','timbo','pindo'],label:'Plaza Torrent'},{poly:blk(122,166,-55,-11),trees:34,plaza:1,sp:['jacaranda','lapacho','timbo','pindo'],label:'Plaza Libertad'},
      {poly:blk(-54,-10,33,77),trees:22,plaza:1,sp:['lapacho','pindo','jacaranda'],label:'Plaza'},{poly:(()=>{const c=[];for(let a=0;a<Math.PI*2;a+=Math.PI/10)c.push(P(rv[0]+11*Math.cos(a),rv[1]+11*Math.sin(a)));return c;})(),trees:5,sp:['pindo','timbo']}],
    keep:[blk(-252,-196,-55,-11,0),blk(36,86,-99,-55,0),blk(214,262,-143,-99,0)],
    labels:[['Plaza Torrent',...P(-164,-70)],['Plaza Libertad',...P(144,-70)],['La Rosada',...P(-60,140)],['Rotonda Poncho Verde',...P(rv[0],rv[1]-24)],['Paseo El Piso',...P(60,-110)]],
    hgt:(x,z)=>{ const r=Math.random(); return r<.12?rand(18,38):r<.62?rand(6.5,13):rand(3.4,6); }, pitch:.04, fr:[7,12], dp:[11.5,14.8], row2:.3, skip:.04, tall:1,
    land:G=>{ const add=(E,N,w,d,h,wall,roof,hp=420)=>{ const [x,z]=P(E,N); addBuilding(x,z,w,d,h,-th,wall,roof,false,hp,false); return [x,z]; };
      add(-224,-33,40,36,14,0xe8e4dc,0x9aa0a6,600); add(61,-77,42,36,10,0xd8d0c0,0x8a8f93,520); add(238,-121,38,36,12,0xe6e2d6,0x9aa0a6,560);
      { const [x,z]=P(61,-58.6); const s=box(G,26,2,.4,x,heightAt(x,z)+8.6,z,new THREE.MeshLambertMaterial({color:0x2a2a2a})); s.rotation.y=th; }
      { const [x,z]=P(rv[0],rv[1]); const M=new THREE.Group(); M.position.set(x,heightAt(x,z),z); box(M,4,1.2,4,0,.6,0,new THREE.MeshLambertMaterial({color:0xcfc8b8})); G.add(M); }
    },
    zones:[{id:'A',...(([x,z])=>({x,z}))(P(-164,-33)),r:16,label:'Plaza Torrent'},{id:'B',...(([x,z])=>({x,z}))(P(-10,-11)),r:14,label:'España y Junín'},{id:'C',...(([x,z])=>({x,z}))(P(144,-33)),r:16,label:'Plaza Libertad'}],
    spawns:{0:[{label:'Base oeste, La Rioja y 25 de Mayo',x:240,z:100},{label:'Base sudoeste, Pedro Ferré',x:240,z:-120}],
            1:[{label:'Base este, Pago Largo',x:-240,z:100},{label:'Base sudeste, Av. Artigas',x:-240,z:-110}]}};
})();
// SAT entre dos rectángulos orientados
function obOverlap(A,B,m=.05){ const ax=[[A.c,-A.s],[A.s,A.c],[B.c,-B.s],[B.s,B.c]], dx=B.cx-A.cx, dz=B.cz-A.cz;
  for(const [ux,uz] of ax){ const ra=A.hw*Math.abs(A.c*ux-A.s*uz)+A.hd*Math.abs(A.s*ux+A.c*uz), rb=B.hw*Math.abs(B.c*ux-B.s*uz)+B.hd*Math.abs(B.s*ux+B.c*uz);
    if(Math.abs(dx*ux+dz*uz)>ra+rb+m) return false; } return true; }
function segDist(x,z,S){ const dx=S.bx-S.ax, dz=S.bz-S.az, l=dx*dx+dz*dz; let t=l?((x-S.ax)*dx+(z-S.az)*dz)/l:0; t=clamp(t,0,1); return Math.hypot(x-S.ax-dx*t,z-S.az-dz*t); }
function paintCity(key){
  if(cityCanvas[key]) return cityCanvas[key]; const D=CITY[key], S=2, c=document.createElement('canvas'); c.width=TX*2*S; c.height=TZ*2*S; const x=c.getContext('2d');
  const P=(wx,wz)=>[(TX-wx)*S,(TZ-wz)*S], path=pts=>{ x.beginPath(); pts.forEach((q,i)=>i?x.lineTo(...P(...q)):x.moveTo(...P(...q))); };
  const [r0,g0,b0]=D.ground; x.fillStyle=`rgb(${r0},${g0},${b0})`; x.fillRect(0,0,c.width,c.height);
  speckle(x,c.width,c.height,60000,D.urban?['#8a847a','#a19a8e','#6f6a62','#9a9488']:['#7a7a52','#958c6c','#6a7448','#a09878','#5f6a3e'],.5,3);
  for(const pk of D.parks){ path(pk.poly); x.closePath(); x.fillStyle=pk.field?'#5f8040':pk.wild?'#6e7c48':'#5c8a3c'; x.fill(); if(pk.plaza){ x.strokeStyle='#cfc6b2'; x.lineWidth=2*S; const q=pk.poly; path([q[0],q[2]]); x.stroke(); path([q[1],q[3]]); x.stroke(); } }
  for(const pv of D.paved||[]){ path(pv); x.closePath(); x.fillStyle='#62615c'; x.fill(); }
  x.lineCap='round'; x.lineJoin='round';
  for(const Ld of D.roads){ x.strokeStyle='#a19c90'; x.lineWidth=(Ld.w+5.5)*S; path(Ld.pts); x.stroke(); }
  for(const M of D.roads.median||[]){ x.strokeStyle='#5f7f3e'; x.lineWidth=M.w*S; path(M.pts); x.stroke(); }
  for(const Ld of D.roads){ x.strokeStyle='#4f4e4b'; x.lineWidth=Ld.w*S; path(Ld.pts); x.stroke(); }
  for(const M of D.roads.median||[]){ x.strokeStyle='#5f7f3e'; x.lineWidth=Math.max(1,M.w-.4)*S; path(M.pts); x.stroke(); }
  x.setLineDash([4*S,4*S]); for(const Ld of D.roads){ if(Ld.w<10||Ld.av) continue; x.strokeStyle='#d9c25a'; x.lineWidth=.3*S; path(Ld.pts); x.stroke(); } x.setLineDash([]);
  x.fillStyle='rgba(255,255,255,.85)'; x.textAlign='center'; x.textBaseline='middle';
  for(const Ld of D.roads){ if(!Ld.name) continue; const p=Ld.pts, i=Math.floor(p.length/2)-(p.length>2?0:1), a=p[Math.max(0,i)], b=p[Math.min(p.length-1,i+1)]; const [ax,ay]=P(...a), [bx,by]=P(...b); let ang=Math.atan2(by-ay,bx-ax); if(ang>Math.PI/2) ang-=Math.PI; if(ang<-Math.PI/2) ang+=Math.PI;
    x.save(); x.translate((ax+bx)/2,(ay+by)/2); x.rotate(ang); x.font=`600 ${2.4*S}px "Saira Condensed",sans-serif`; x.fillStyle='rgba(255,255,255,.55)'; x.fillText(Ld.name,0,0); x.restore(); }
  x.font=`700 ${9*S}px "Saira Condensed",sans-serif`; x.fillStyle='rgba(255,255,255,.7)'; x.fillText(D.title,...P(0,TZ-14));
  x.font=`600 ${6*S}px "Saira Condensed",sans-serif`; x.fillStyle='rgba(255,255,255,.9)'; for(const [t,a,b] of D.labels) x.fillText(t,...P(a,b));
  return cityCanvas[key]=c;
}
function buildCity(key){
  const D=CITY[key], c=paintCity(key), tex=new THREE.CanvasTexture(c); tex.anisotropy=ANISO; townCanvas[key]=c;
  const g=new THREE.PlaneGeometry(TX*2,TZ*2,160,110); g.rotateX(-Math.PI/2);
  const pos=g.attributes.position, uv=g.attributes.uv;
  for(let i=0;i<pos.count;i++){const X=pos.getX(i),Z=pos.getZ(i);pos.setY(i,cH(X,Z));uv.setXY(i,(TX-X)/(2*TX),1-(TZ-Z)/(2*TZ));}
  g.computeVertexNormals(); const t=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:tex})); t.receiveShadow=true; worldGroup.add(t);
  if(!D._dense){ D._dense=1; for(const Ld of D.roads){ const out=[Ld.pts[0]]; for(let i=0;i<Ld.pts.length-1;i++){ const A=Ld.pts[i], B=Ld.pts[i+1], n=Math.max(1,Math.ceil(Math.hypot(B[0]-A[0],B[1]-A[1])/22)); for(let k=1;k<=n;k++) out.push([A[0]+(B[0]-A[0])*k/n,A[1]+(B[1]-A[1])*k/n]); } Ld.raw=Ld.pts; Ld.pts=out; } }
  streetSegs=[]; const RS=[]; for(const Ld of D.roads) for(let i=0;i<Ld.pts.length-1;i++){ const S={ax:Ld.pts[i][0],az:Ld.pts[i][1],bx:Ld.pts[i+1][0],bz:Ld.pts[i+1][1],w:Ld.w}; streetSegs.push(S); RS.push(S); }
  for(const M of D.roads.median||[]) for(let i=0;i<M.pts.length-1;i++) RS.push({ax:M.pts[i][0],az:M.pts[i][1],bx:M.pts[i+1][0],bz:M.pts[i+1][1],w:M.w});
  D.land(worldGroup);
  const blocked=[...D.parks.map(p=>p.poly),...(D.keep||[]),...(D.paved||[])];
  const inside=(x,z)=>Math.abs(x)<W.bx+20&&Math.abs(z)<W.bz+20;
  const freeOf=(x,z)=>{ for(const S of RS){ if(Math.abs(x-(S.ax+S.bx)/2)>Math.abs(S.bx-S.ax)/2+S.w+40||Math.abs(z-(S.az+S.bz)/2)>Math.abs(S.bz-S.az)/2+S.w+40) continue; if(segDist(x,z,S)<S.w/2+2.6) return false; }
    if(blocked.some(pl=>inPoly(x,z,pl))) return false; if(W.zones.some(Z=>Math.hypot(x-Z.x,z-Z.z)<Z.r+5)) return false;
    for(const tm of [0,1]) for(const sp of W.spawns[tm]) if(Math.hypot(x-sp.x,z-sp.z)<20) return false; return true; };
  const WALLS=D.urban?[0xece6da,0xe0d6c4,0xd8cfbd,0xcfc6b6,0xe6dccb,0xd4c4a8,0xc9c2b8,0xe8e0d0,0xbdb6aa,0xdcd2c0]:[0xeeeae0,0xe2d8c4,0xf1e6cf,0xd9cfbd,0xe8d2bc,0xcfc8bb,0xd7e0dc,0xe6d0a8,0xd8b8a0,0xc8d8c0], ROOFS=[0x7d7e7b,0x9c9a93,0x7e4e38,0x8a573f,0x9c4a32,0x8a8f93];
  const tryHouse=(cx,cz,w,d,a,h)=>{ const c=Math.cos(a), s=Math.sin(a), ob={cx,cz,c,s,hw:w/2,hd:d/2};
    if(!inside(cx,cz)) return false;
    for(const [lx,lz] of [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[0,0],[0,d/2],[0,-d/2]]) if(!freeOf(cx+lx*c+lz*s,cz-lx*s+lz*c)) return false;
    for(const b of gridQuery(cx,cz,Math.max(w,d))) if(b.ob&&obOverlap(ob,b.ob)) return false;
    const pit=h<6.5&&Math.random()<D.pitch; addBuilding(cx,cz,w,d,h,a,apick(WALLS),h>7?apick([0x7d7e7b,0x9c9a93,0x8a8f93]):apick(ROOFS),false,h>15?260:h>7?200:110,pit); return true; };
  for(const Ld of D.roads){ if(Ld.name==='Rotonda'||Ld.name==='Rotonda Poncho Verde') continue;
    const RP=Ld.raw||Ld.pts; for(let i=0;i<RP.length-1;i++){ const A=RP[i], B=RP[i+1], dx=B[0]-A[0], dz=B[1]-A[1], Ls=Math.hypot(dx,dz); if(Ls<4) continue; const ux=dx/Ls, uz=dz/Ls, nx=-uz, nz=ux, a=Math.atan2(-uz,ux);
      for(const sd of [-1,1]) for(let s0=rand(0,3); s0<Ls; ){ const w=rand(D.fr[0],D.fr[1]), d1=rand(D.dp[0],D.dp[1]); const along=s0+w/2; if(Math.random()<D.skip){ s0+=w; continue; }
        const h=D.hgt(), dd=h>15?Math.min(14.8,Math.max(d1,w*.9)):d1, off=Ld.w/2+2.8+dd/2, cx=A[0]+ux*along+nx*sd*off, cz=A[1]+uz*along+nz*sd*off;
        const okH=tryHouse(cx,cz,w,dd,a,h); s0+=okH?w+(D.tall?rand(0,.4):rand(.4,2.2)):2.5;
        if(okH&&Math.random()<D.row2){ const d2=rand(D.dp[0],D.dp[1]), o2=off+dd/2+rand(.6,3)+d2/2; tryHouse(A[0]+ux*along+nx*sd*o2,A[1]+uz*along+nz*sd*o2,w*rand(.8,1.1),d2,a,D.tall?D.hgt():rand(3,5)); } } } }
  finalizeBuildings();
  // árboles: plazas y baldíos, veredas y canteros de las avenidas
  const list=[], tOk=(x,z,m)=>inside(x,z)&&!gridQuery(x,z,4).some(b=>b.ob&&obPush(x,z,m,b))&&!W.zones.some(Z=>Math.hypot(x-Z.x,z-Z.z)<Z.r-2);
  for(const pk of D.parks){ const xs=pk.poly.map(p=>p[0]), zs=pk.poly.map(p=>p[1]), x0=Math.min(...xs), x1=Math.max(...xs), z0=Math.min(...zs), z1=Math.max(...zs);
    for(let k=0,n=0;k<pk.trees*12&&n<pk.trees;k++){ const x=rand(x0,x1), z=rand(z0,z1); if(!inPoly(x,z,pk.poly)||!tOk(x,z,1.5)) continue; if(RS.some(S=>segDist(x,z,S)<S.w/2+1)&&!pk.poly.length) continue; list.push({x,z,sp:apick(pk.sp),s:rand(.7,1.1)}); n++; } }
  for(const M of D.roads.median||[]) for(let i=0;i<M.pts.length-1;i++){ const A=M.pts[i], B=M.pts[i+1], L2=Math.hypot(B[0]-A[0],B[1]-A[1]); for(let s0=rand(2,8); s0<L2; s0+=rand(11,16)){ const x=A[0]+(B[0]-A[0])*s0/L2, z=A[1]+(B[1]-A[1])*s0/L2; if(inside(x,z)&&tOk(x,z,1)) list.push({x,z,sp:Math.random()<.6?'pindo':apick(['lapacho','jacaranda']),s:rand(.75,1)}); } }
  for(const Ld of D.roads){ if(Ld.av||Ld.w>11) continue; for(let i=0;i<Ld.pts.length-1;i++){ const A=Ld.pts[i], B=Ld.pts[i+1], dx=B[0]-A[0], dz=B[1]-A[1], L2=Math.hypot(dx,dz); if(L2<4) continue; const ux=dx/L2, uz=dz/L2;
    for(let s0=rand(3,12); s0<L2; s0+=rand(12,22)){ if(Math.random()<.45) continue; const sd=Math.random()<.5?1:-1, o=Ld.w/2+1.3, x=A[0]+ux*s0-uz*sd*o, z=A[1]+uz*s0+ux*sd*o; if(tOk(x,z,1.2)&&!RS.some(S=>segDist(x,z,S)<S.w/2+.6)) list.push({x,z,sp:apick(['lapacho','jacaranda','timbo','ceibo','lapacho']),s:rand(.55,.8)}); } } }
  buildTrees(list);
  nodes=[];
  for(const Ld of D.roads){ let prev=null;
    for(let i=0;i<Ld.pts.length-1;i++){ const A=Ld.pts[i],B=Ld.pts[i+1],len=Math.hypot(B[0]-A[0],B[1]-A[1]),n=Math.max(1,Math.round(len/8));
      for(let k=(i===0?0:1);k<=n;k++){ const tt=k/n, p=new THREE.Vector3(A[0]+(B[0]-A[0])*tt,0,A[1]+(B[1]-A[1])*tt);
        if(Math.abs(p.x)>W.bx-2||Math.abs(p.z)>W.bz-2){prev=null;continue;}
        const nd={p,nb:[],s:Ld}; nodes.push(nd); if(prev){prev.nb.push(nd);nd.nb.push(prev);} prev=nd; } } }
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j]; if(a.s!==b.s&&a.p.distanceTo(b.p)<9){a.nb.push(b);b.nb.push(a);}}
  W.boundary=[[-W.bx,-W.bz],[-W.bx,W.bz],[W.bx,W.bz],[W.bx,-W.bz]];
}

const WORLDS={
  sor:{key:'sor',label:'B° Sor Asunta',desc:'Las cuatro manzanas entre Bilbao, Las Margaritas, Sevilla y Los Tulipanes, a escala real. Combate a quemarropa.',
    bx:(IW/2+PAD)*SPX,bz:(IH/2+PAD)*SPX,h:(x,z)=>.15*Math.sin(x*.05)*Math.cos(z*.04),
    zones:[{id:'A',...toW(517,402),r:15,label:'Murcia y Timbó'},{id:'B',...toW(392,165),r:14,label:'Baldío de Palmeras'},{id:'C',...toW(622,548),r:14,label:'Baldío de Timbó sur'}],
    spawns:{0:[{label:'Base sur, Sevilla y Palmeras',px:[455,752]},{label:'Base sureste, Sevilla y Las Margaritas',px:[762,642]}],
            1:[{label:'Base noroeste, Bilbao y Los Tulipanes',px:[112,182]},{label:'Base norte, Bilbao y Timbó',px:[468,64]}]}},
  malvinas:{key:'malvinas',label:'Islas Malvinas',desc:'Puerto Argentino, Moody Brook y los montes Longdon y Tumbledown. Turba, piedra y viento, sin árboles.',
    bx:240,bz:240,h:malvH,water:-1,sky:0xa7b1b6,fog:[90,380],
    zones:[{id:'A',x:105,z:95,r:22,label:'Monte Longdon'},{id:'B',x:10,z:12,r:22,label:'Moody Brook'},{id:'C',x:-55,z:-125,r:22,label:'Sapper Hill'}],
    spawns:{west:[{label:'Base oeste, Monte Kent',x:220,z:25},{label:'Base sudoeste, Monte Harriet',x:205,z:-160}],
            east:[{label:'Base este, Puerto Argentino',x:-150,z:-70},{label:'Base noreste, Wireless Ridge',x:-95,z:150}]}},
  campo:{key:'campo',label:'Campo abierto',desc:'Colinas, un pueblo y espacio para maniobrar. Combate a larga distancia.',
    bx:190,bz:190,h:(x,z)=>{const v=Math.hypot(x,z+10),flat=clamp((v-25)/35,0,1);
      return (7*Math.sin(x*0.019)*Math.cos(z*0.017)+3.2*Math.sin(x*0.047+1)*Math.sin(z*0.043+.5)+1.1*Math.sin(x*0.13)*Math.cos(z*0.11))*(0.25+0.75*flat);},
    zones:[{id:'A',x:0,z:-2,r:20,label:'El pueblo'},{id:'B',x:-115,z:35,r:18,label:'Loma oeste'},{id:'C',x:115,z:-35,r:18,label:'Loma este'}],
    spawns:{0:[{label:'Base sudoeste',x:-60,z:-170},{label:'Base sudeste',x:60,z:-170}],
            1:[{label:'Base noroeste',x:-60,z:170},{label:'Base noreste',x:60,z:170}]}},
  cordillera:{key:'cordillera',label:'Paso Cristo Redentor',desc:'La cordillera entre Mendoza y Chile: camino de montaña, nieve, el Cristo en lo alto y las aduanas de los dos países.',
    bx:250,bz:150,h:kH,sky:0xc8d4dc,fog:[220,620],eastNat:['ar','ctes'],
    zones:[{id:'A',x:150,z:kRoad(150)+2,r:17,label:'Aduana argentina'},{id:'B',x:0,z:kRoad(0),r:18,label:'Límite, al pie del Cristo'},{id:'C',x:-150,z:kRoad(-150)-2,r:17,label:'Aduana chilena'}],
    spawns:{east:[{label:'Mendoza, Ruta 7',x:238,z:kRoad(238)},{label:'Mendoza, ladera',x:228,z:kRoad(228)+24}],
            west:[{label:'Chile, Ruta 60',x:-238,z:kRoad(-238)},{label:'Chile, ladera',x:-228,z:kRoad(-228)-24}]}},
  salto:{key:'salto',label:'Represa de Salto Grande',desc:'Concordia y Salto, unidas por el camino sobre la represa del río Uruguay. Es el único cruce.',
    bx:250,bz:172,h:(x,z)=>xH(SALTO,x,z),onDeck:xOnDeck(SALTO),under:xUnder(SALTO),water:-.5,sky:0xb8c4c8,bridge:true,eastNat:['uy'],
    zones:[{id:'A',x:112,z:-34,r:17,label:'Cabecera Salto'},{id:'B',x:0,z:0,r:14,label:'Sobre la represa'},{id:'C',x:-112,z:34,r:17,label:'Cabecera Concordia'}],
    spawns:{east:[{label:'Salto, Ruta 3',x:236,z:-14},{label:'Salto sur',x:236,z:-122}],west:[{label:'Concordia, Ruta 14',x:-236,z:14},{label:'Concordia norte',x:-236,z:122}]}},
  posadas:{key:'posadas',label:'Posadas – Encarnación',desc:'Las costaneras de Posadas y Encarnación unidas por el puente San Roque González de Santa Cruz sobre el Paraná.',
    bx:250,bz:172,h:(x,z)=>xH(POSADAS,x,z),onDeck:xOnDeck(POSADAS),under:xUnder(POSADAS),water:-.5,sky:0xb8c4c8,bridge:true,eastNat:['ar','ctes'],
    zones:[{id:'A',x:120,z:-32,r:17,label:'Cabecera Posadas'},{id:'B',x:0,z:0,r:14,label:'Centro del puente'},{id:'C',x:-120,z:32,r:17,label:'Cabecera Encarnación'}],
    spawns:{east:[{label:'Posadas, Avenida Roque Pérez',x:236,z:-14},{label:'Posadas sur',x:236,z:-122}],west:[{label:'Encarnación, Ruta PY01',x:-236,z:14},{label:'Encarnación norte',x:-236,z:122}]}},
  puente:{key:'puente',label:'Corrientes – Resistencia',desc:'Las dos orillas del Paraná unidas por el Puente General Belgrano, que se puede cruzar. Es el único paso entre las ciudades.',
    bx:250,bz:172,h:puenteH,water:-.5,sky:0xb8c4c8,bridge:true,onDeck:(x,z)=>Math.abs(z)<5.3&&Math.abs(x)<DECK_END,under:(x,z,y)=>Math.abs(z)<5.3&&Math.abs(x)<DECK_END&&y<deckH(x)-3.2?pH0(x,z)+(craters.length?craterH(x,z):0):null,
    zones:[{id:'A',x:118,z:-32,r:17,label:'Cabecera Corrientes'},{id:'B',x:0,z:0,r:14,label:'Centro del puente'},{id:'C',x:-118,z:32,r:17,label:'Cabecera Barranqueras'}],
    spawns:{east:[{label:'Corrientes, Avenida 3 de Abril',x:236,z:-14},{label:'Corrientes sur',x:236,z:-122}],
            west:[{label:'Barranqueras, Ruta 16',x:-236,z:14},{label:'Barranqueras norte',x:-236,z:122}]}},
  costanera:{key:'costanera',label:'Costanera de Corrientes',desc:'La Avenida Costanera, el Puente General Belgrano, las manzanas del centro y la Playa Arazaty, comprimidas junto al Paraná.',
    bx:232,bz:196,h:costH,water:-.5,sky:0xb8c4c8,
    zones:[{id:'A',x:150,z:38,r:18,label:'Cabecera del puente'},{id:'B',x:0,z:-20,r:17,label:'Plaza 25 de Mayo'},{id:'C',x:-150,z:56,r:18,label:'Playa Arazaty'}],
    spawns:{0:[{label:'Base oeste, costanera',x:-222,z:-30},{label:'Base sudoeste',x:-222,z:-130}],
            1:[{label:'Base este, avenida 3 de Abril',x:222,z:-30},{label:'Base sudeste',x:222,z:-130}]}},
  lagunabrava:{key:'lagunabrava',label:'Laguna Brava',desc:'Las quintas alrededor de Laguna Brava, en las afueras de Corrientes. La isla del medio solo se alcanza por dos terraplenes angostos; la orilla tiene juncos y se puede vadear.',
    bx:250,bz:170,h:lbH,water:-.5,sky:0xbcc8c4,town:true,
    zones:[{id:'A',...lbP(Math.PI*.62,1.6),r:17,label:'Quintas del norte'},{id:'B',x:-5,z:8,r:14,label:'La isla'},{id:'C',...lbP(-Math.PI*.38,1.6),r:17,label:'Quintas del sur'}],
    spawns:{0:[{label:'Base oeste, camino de la laguna',x:-236,z:-6},{label:'Base sudoeste, ruta',x:-236,z:-140}],
            1:[{label:'Base este, camino de la laguna',x:236,z:6},{label:'Base noreste',x:236,z:140}]}},
  pasopatria:{key:'pasopatria',label:'Paso de la Patria',desc:'El pueblo de pescadores frente al Paraná: playas de arena, la costanera y el Monumento al Dorado.',
    bx:250,bz:172,h:ppH,water:-.5,sky:0xb8c6c8,town:true,
    zones:[{id:'A',x:-150,z:ppS(-150)-14,r:17,label:'Playa oeste'},{id:'B',x:20,z:-27,r:17,label:'Plaza del pueblo'},{id:'C',x:150,z:ppS(150)-14,r:17,label:'Playa este'}],
    spawns:{0:[{label:'Base oeste, costanera',x:-236,z:20},{label:'Base sudoeste, acceso',x:-236,z:-150}],
            1:[{label:'Base este, costanera',x:236,z:20},{label:'Base sudeste',x:236,z:-150}]}},
  itati:{key:'itati',label:'Itatí',desc:'La Basílica de Nuestra Señora de Itatí sobre la barranca del Paraná, el pueblo, las bajadas al puerto y la Ruta 12.',
    bx:250,bz:172,h:itH,water:-.5,sky:0xbac6ca,town:true,
    zones:[{id:'A',x:-120,z:itS(-120)-10,r:16,label:'Puerto oeste'},{id:'B',x:-12,z:-27,r:16,label:'Plaza de la Basílica'},{id:'C',x:110,z:itS(110)-10,r:16,label:'Puerto este'}],
    spawns:{0:[{label:'Base oeste',x:-236,z:-38},{label:'Base sudoeste',x:-236,z:-128}],
            1:[{label:'Base este, Ruta 12',x:236,z:-152},{label:'Base este',x:236,z:-38}]}},
  rotonda:{key:'rotonda',label:'Ruta 12 y Av. Independencia',desc:'La rotonda de la Ruta 12, Av. Independencia, Av. Regimiento Correntinos y los barrios hasta la cancha de Boca Unidos. Calles reales, comprimidas.',
    bx:250,bz:172,h:cH,sky:0xbcc6c8,city:true,zones:CITY.rotonda.zones,spawns:CITY.rotonda.spawns,extraCars:CITY.rotonda.extraCars},
  carrefour:{key:'carrefour',label:'Av. Independencia (Carrefour)',desc:'Av. Independencia de doble mano entre el Carrefour, el hospital y las concesionarias, con los barrios a cada lado. Calles reales, comprimidas.',
    bx:250,bz:172,h:cH,sky:0xbcc6c8,city:true,zones:CITY.carrefour.zones,spawns:CITY.carrefour.spawns,extraCars:CITY.carrefour.extraCars},
  centro:{key:'centro',label:'Corrientes, centro',desc:'El centro de la ciudad: La Rosada, Plaza Torrent, Plaza Libertad, la rotonda Poncho Verde, Av. Gdor. Pujol y Av. Pedro Ferré. Edificios altos y combate calle por calle.',
    bx:250,bz:172,h:cH,sky:0xbcc4c8,city:true,fog:[140,430],zones:CITY.centro.zones,spawns:CITY.centro.spawns},
  aeropuerto:{key:'aeropuerto',label:'Ruta 12, aeropuerto',desc:'Acceso a Corrientes: aeropuerto, corsódromo, La Reina sobre la Ruta 43 y los barrios hasta el Golf Club.',
    bx:228,bz:168,h:aerH,water:-.6,
    zones:[{id:'A',...aW(296,345),r:20,label:'Corsódromo'},{id:'B',...aW(408,452),r:20,label:'Cruce de La Reina'},{id:'C',...aW(705,545),r:20,label:'Barrio del golf'}],
    spawns:{0:[{label:'Base norte, polideportivo',...aW(330,70)},{label:'Base noreste, Ruta 12 y YPF',...aW(600,55)}],
            1:[{label:'Base sur, barrio',...aW(380,670)},{label:'Base sudeste, laguna',...aW(900,640)}]}}
};
let W=WORLDS.sor;
// Cráteres: hunden la malla del terreno y también la altura que usan tanques y soldados.
const craters=[]; let groundMeshes=[];
function craterH(x,z){ let h=0; for(const C of craters){ const dx=x-C.x, dz=z-C.z; if(Math.abs(dx)>C.r*1.4||Math.abs(dz)>C.r*1.4) continue;
    const q=Math.hypot(dx,dz)/C.r; h+=q<1?-C.d*(1-q*q):q<1.4?C.d*.22*Math.sin((q-1)/.4*Math.PI):0; } return h; }
// Fuera del mapa el terreno sigue: se repite la altura del borde (zona fuera del campo de batalla)
const OUT=130;
// Fuera del mapa el escenario sigue "en espejo": se refleja el borde (mismo relieve, calles, casas y árboles)
// Altura del suelo según dónde estás: debajo del puente vale el terreno, no el tablero
const hAtY=(x,z,y)=>{ if(W.under){ const u=W.under(x,z,y); if(u!=null) return u; }
  // Trincheras: un tanque más largo que el ancho de la trinchera pasa por encima (apenas cabecea); uno corto se hunde más
  if(curSpan&&W.trench){ const tr=W.trench(x,z); if(tr){ const k=curSpan>=tr.w?.1:clamp(.1+(tr.w-curSpan)/tr.w*1.4,.1,.6); return heightAt(x,z)+tr.d*(1-k); } }
  return heightAt(x,z); };
const heightAt=(x,z)=>{ const ex=W.ex||W.bx+30, ez=W.ez||W.bz+30;
  if(x>ex||x<-ex||z>ez||z<-ez){ if(x>ex) x=2*ex-x; else if(x<-ex) x=-2*ex-x; if(z>ez) z=2*ez-z; else if(z<-ez) z=-2*ez-z; x=clamp(x,-ex,ex); z=clamp(z,-ez,ez); }
  return W.h(x,z)+(craters.length?craterH(x,z):0); };
function findGround(){ groundMeshes=[]; worldGroup.traverse(o=>{ if(o.isMesh&&o.geometry&&o.geometry.type==='PlaneGeometry'&&(o.userData.ground||o.geometry.attributes.position.count>4000)) groundMeshes.push(o); }); }
function addCrater(p,r,d){
  if(W&&W.onDeck&&W.onDeck(p.x,p.z)&&p.y>pH0(p.x,p.z)+2) return; // sobre el puente no se abren cráteres
  if(W&&W.deckAt){ const d=W.deckAt(p.x,p.z); if(d!==null&&p.y>d-2) return; }
  if(!W||W.water!==undefined&&W.h(p.x,p.z)<W.water+.2) return; // en el agua no queda cráter
  const C={x:p.x,z:p.z,r,d}; craters.push(C); if(craters.length>90) craters.shift();
  for(const m of groundMeshes){ const pos=m.geometry.attributes.position, R=r*1.4; let ch=false;
    for(let i=0;i<pos.count;i++){ const X=pos.getX(i)+m.position.x, Z=pos.getZ(i)+m.position.z, dx=X-C.x, dz=Z-C.z; if(dx>R||dx<-R||dz>R||dz<-R) continue;
      const q=Math.hypot(dx,dz)/r; if(q>=1.4) continue; pos.setY(i,pos.getY(i)+(q<1?-d*(1-q*q):d*.22*Math.sin((q-1)/.4*Math.PI))); ch=true; }
    if(ch){ pos.needsUpdate=true; m.geometry.computeVertexNormals(); } }
  // los tanques y soldados se acomodan al nuevo suelo
  for(const t of tanks) if(Math.hypot(t.pos.x-p.x,t.pos.z-p.z)<r*1.6) placeOnGround(t,1);
}

