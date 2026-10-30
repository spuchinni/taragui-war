/* ---------- Mapas de la Primera Guerra Mundial: frentes de trincheras generados por código ----------
   Cada mapa sale de una semilla fija (siempre igual): relieve, embudos de obuses, trincheras en zigzag con sacos terreros,
   tablones y pasarelas, alambradas, pueblos en ruinas, bosques destrozados y caminos hundidos.
   Equipo 0 (el jugador) al sur, equipo 1 al norte. Las trincheras dan cobertura de verdad: la infantería adentro no se ve. */

Object.assign(SPECIES,{
  muerto:{tr:.2,th:5.0,crown:()=>{ const g=new THREE.ConeGeometry(.45,1.8,5); g.rotateZ(.5); return g; },cs:[1,1,1],cy:5.2,col:[0x3a3128,0x463b30]},
  tocon:{tr:.3,th:1.5,crown:()=>new THREE.ConeGeometry(.3,.7,5),cs:[1,1,1],cy:1.7,col:[0x3a3128,0x4a3f33]},
  roble:{tr:.42,th:3.2,crown:()=>new THREE.IcosahedronGeometry(3.6,1),cs:[1,.78,1],cy:5.8,col:[0x4b5e2e,0x55673a,0x46582c]},
  alamo:{lobes:3,tr:.24,th:3.0,crown:()=>new THREE.SphereGeometry(1,8,8),cs:[1.6,5.2,1.6],cy:7.4,col:[0x5a6e34,0x667a3c,0x55682f]}
});
const mulberry=s=>()=>{ s=(s+0x6D2B79F5)>>>0; let t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; };

// Configuración de cada frente
const WW1_CFG={
  somme:{seed:1916,label:'Flers-Courcelette (Somme, 1916)',desc:'15 de septiembre de 1916: el primer combate de tanques de la historia. Tierra arrasada por meses de artillería, el Bosque Delville hecho astillas y las ruinas de Flers.',
    bx:170,bz:150,sky:0xa9a89e,fog:[100,360],ground:['#6d5a42','#5e4c37','#7b684e','#4f3f2e'],grass:0,craters:620,crR:[1.4,5.5],front:52,tw:[2.2,2.2],td:1.9,wire:[1,1],
    village:{x:5,z:6,n:22,ruin:.85,r:30,name:'Flers'},woods:[{x:-100,z:4,r:30,n:130,dead:.9}],extraWoods:[{x:115,z:70,r:22,n:50,dead:.7}],
    zones:[{id:'A',x:-100,z:4,r:19,label:'Bosque Delville'},{id:'B',x:5,z:6,r:18,label:'Ruinas de Flers'},{id:'C',x:100,z:-8,r:18,label:'Granja de la Cantera'}]},
  cambrai:{seed:1917,label:'Cambrai: Flesquières (1917)',desc:'20 de noviembre de 1917: cientos de tanques británicos contra la Línea Hindenburg. Trincheras anchísimas y bandas de alambre al norte, el pueblo de Flesquières sobre la loma y los cañones alemanes esperando.',
    bx:175,bz:155,sky:0xb0b2aa,fog:[110,390],ground:['#7d7458','#6e6a4a','#8a8062','#5e5a40'],grass:.5,craters:220,crR:[1.2,4.5],front:55,tw:[2.2,3.0],td:2.1,wire:[1,3],ridge:6,
    bunkers:5,village:{x:10,z:20,n:20,ruin:.5,r:28,name:'Flesquières',church:1},woods:[{x:-105,z:-6,r:28,n:120,dead:.3}],extraWoods:[{x:120,z:90,r:25,n:60,dead:.2}],
    zones:[{id:'A',x:-105,z:-6,r:19,label:'Bosque de Orival'},{id:'B',x:10,z:20,r:18,label:'Flesquières'},{id:'C',x:105,z:4,r:18,label:'Granja de Premy'}]},
  villers:{seed:1918,label:'Villers-Bretonneux (1918)',desc:'24 de abril de 1918: el primer duelo entre tanques de la historia, Mark IV contra A7V. Campos verdes de primavera, el Bosque de Aquenne, el pueblo y la aldea de Cachy.',
    bx:175,bz:150,sky:0xb4bab4,fog:[130,420],ground:['#6f7a46','#62703f','#7d8250','#5a6238'],grass:1,craters:110,crR:[1,3.5],front:62,tw:[1.8,1.8],td:1.5,wire:[1,1],broken:.35,
    village:{x:0,z:22,n:26,ruin:.3,r:34,name:'Villers-Bretonneux',church:1},woods:[{x:-110,z:-18,r:32,n:160,dead:.05}],hamlet:{x:108,z:-8,n:7,ruin:.2,r:14},poplars:1,
    zones:[{id:'A',x:-108,z:-16,r:19,label:'Bosque de Aquenne'},{id:'B',x:0,z:22,r:19,label:'Villers-Bretonneux'},{id:'C',x:108,z:-8,r:18,label:'Cachy'}]},
  stmihiel:{seed:1919,label:'Saint-Mihiel (1918)',desc:'12 de septiembre de 1918: la primera gran ofensiva estadounidense, con los Renault FT del Cuerpo de Tanques. Trincheras viejas llenas de alambre, bosques y el pueblo de Essey.',
    bx:170,bz:150,sky:0xaab0ac,fog:[110,380],ground:['#6a6c4c','#5e6043','#76765a','#4f5138'],grass:.6,craters:260,crR:[1.2,4],front:50,tw:[2.0,2.4],td:1.8,wire:[2,2],
    village:{x:-15,z:10,n:18,ruin:.55,r:26,name:'Essey'},woods:[{x:-110,z:20,r:34,n:170,dead:.25},{x:110,z:-30,r:26,n:110,dead:.35}],hamlet:{x:104,z:12,n:5,ruin:.5,r:12},
    zones:[{id:'A',x:-110,z:18,r:19,label:'Bosque de Mort-Mare'},{id:'B',x:-15,z:10,r:18,label:'Essey'},{id:'C',x:104,z:12,r:18,label:'Pannes'}]}
};
// Escala real: los frentes se diseñaron en ~350 m y se agrandan a ~1,5 × 1,5 km (pedido de Sebastián: que dé para flanquear y pensar).
// Las posiciones de la configuración se multiplican por K; la tierra de nadie se ensancha, las bases quedan ~330 m detrás de la propia línea
// y se agregan caseríos detrás de cada frente. Se llama una vez por mapa, antes de registrarlo en WORLDS.
function ww1Big(C){ if(C.big) return C; const K=4.2, sc=o=>{ if(!o) return o; o.x*=K; o.z*=K; return o; };
  C.bx=C.bz=740; C.front=Math.round(C.front*2.6); C.spawnZ=C.front+330; C.res=1.0; C.grid=[1.3,3,8,3,1.2];
  for(const Z of C.zones) { sc(Z); Z.r=Math.round(Z.r*1.3); }
  for(const V of [C.village,C.hamlet].filter(Boolean)){ sc(V); V.r=Math.round(V.r*1.6); V.n=Math.round(V.n*1.7); }
  for(const Wd of [...(C.woods||[]),...(C.extraWoods||[])]){ sc(Wd); Wd.r*=2.3; Wd.n=Math.round(Wd.n*3.5); }
  for(const H of C.hills||[]){ sc(H); H.r*=K; H.h*=2.8; }
  if(C.ditches) C.ditches=C.ditches.map(L=>L.map(([x,z])=>[x*K,z*K]));
  C.craters=Math.min(7000,Math.round(C.craters*9)); C.deadTrees=Math.round((C.deadTrees??40)*6); if(C.bunkers) C.bunkers*=2;
  C.fog=[Math.round(C.fog[0]*2.2),Math.round(C.fog[1]*2.3)];
  const R=mulberry(Math.round(C.seed*7)), ruin=(C.village&&C.village.ruin)||0;
  C.hamlets=[[-.62,1],[.58,1],[-.55,-1],[.65,-1]].map(([fx,s])=>({x:fx*C.bx+(R()-.5)*120,z:s*(C.front+150+R()*140),n:5+((R()*4)|0),ruin:ruin*.8,r:24,
    ...(C.village&&C.village.walls?{walls:C.village.walls,roofs:C.village.roofs}:{})}));
  C.big=1; return C; }
for(const k in WW1_CFG){ const C=ww1Big(WW1_CFG[k]);
  WORLDS[k]={key:k,label:C.label,desc:C.desc,era:1,ww1:true,bx:C.bx,bz:C.bz,sky:C.sky,fog:C.fog,dust:0x7a6a52,cfg:C,
    h:(x,z)=>ww1Sample(WORLDS[k],x,z),zones:C.zones,
    spawns:{0:[{label:'Base oeste',x:-90,z:-C.spawnZ},{label:'Base este',x:90,z:-C.spawnZ}],
            1:[{label:'Retaguardia oeste',x:-90,z:C.spawnZ},{label:'Retaguardia este',x:90,z:C.spawnZ}]}}; }

// Muestreo bilineal de la grilla de alturas
function ww1Sample(W0,x,z){ const G=W0.HG; if(!G) return 0; const fx=(x+G.ex)/G.r, fz=(z+G.ez)/G.r, i=Math.max(0,Math.min(G.nx-2,fx|0)), j=Math.max(0,Math.min(G.nz-2,fz|0)), u=clamp(fx-i,0,1), v=clamp(fz-j,0,1), A=G.a, n=G.nx;
  return A[j*n+i]*(1-u)*(1-v)+A[j*n+i+1]*u*(1-v)+A[(j+1)*n+i]*(1-u)*v+A[(j+1)*n+i+1]*u*v; }
function ww1Depth(G,x,z){ const fx=(x+G.ex)/G.r, fz=(z+G.ez)/G.r, i=Math.max(0,Math.min(G.nx-2,fx|0)), j=Math.max(0,Math.min(G.nz-2,fz|0)), u=clamp(fx-i,0,1), v=clamp(fz-j,0,1), A=G.td, n=G.nx;
  return A[j*n+i]*(1-u)*(1-v)+A[j*n+i+1]*u*(1-v)+A[(j+1)*n+i]*(1-u)*v+A[(j+1)*n+i+1]*u*v; }

function buildWW1Map(key){
  const C=WW1_CFG[key], R=mulberry(C.seed), R2=mulberry(C.seed+99), rr=(a,b)=>a+R()*(b-a), pickR=a=>a[(R()*a.length)|0];
  const bx=C.bx, bz=C.bz, EX=bx+70, EZ=bz+70, res=C.res||.8, nx=Math.round(EX*2/res)+1, nz=Math.round(EZ*2/res)+1;
  const G={ex:EX,ez:EZ,r:res,nx,nz,a:new Float32Array(nx*nz),td:new Float32Array(nx*nz)}; W.HG=G;
  const ridge=C.ridge||2.5;
  const hills=C.hills||[], base=(x,z)=>hills.reduce((a,H)=>a+H.h*Math.exp(-((x-H.x)**2+(z-H.z)**2)/(H.r*H.r)),0)+ridge*(.5+.5*Math.tanh(z/80))+2.2*Math.sin(x*.021+C.seed)*Math.cos(z*.017)+1.0*Math.sin(x*.047+1.3)*Math.sin(z*.039+C.seed*.1)+.35*Math.sin(x*.13)*Math.cos(z*.11);
  // ---- trazado: trincheras (en zigzag, con traviesas), comunicaciones y alambradas ----
  const segs=[], belts=[], posts=[];
  const addLine=(pts,w,d,kind)=>{ for(let i=0;i<pts.length-1;i++) segs.push({ax:pts[i][0],az:pts[i][1],bx:pts[i+1][0],bz:pts[i+1][1],w,d,kind}); };
  const vX=C.village.x, vZ=C.village.z, vR=C.village.r;
  for(const s of (C.noTrench?[]:C.trenchSides||[-1,1])){ const side=s<0?0:1, w=C.tw[side], d=C.td*(side&&C.ridge?1.1:1), F=C.front+(side?4:0);
    // trinchera de primera línea: bahías y traviesas cada 8 m (en "almena")
    let pts=[]; for(let x=-bx-40;x<=bx+40;x+=8){ const k=(Math.round((x+bx)/8))%2, zz=s*(F+(k?3.2:0)+4*Math.sin(x*.02+side));
      if(C.broken&&R()<C.broken*.25){ if(pts.length>1) addLine(pts,w,d,'fire'); pts=[]; continue; }
      pts.push([x,zz]); if(k) pts.push([x+4,zz]); else pts.push([x+4,zz]); }
    if(pts.length>1) addLine(pts,w,d,'fire');
    // trinchera de apoyo, más atrás y más suave
    pts=[]; for(let x=-bx-40;x<=bx+40;x+=12) pts.push([x,s*(F+26+6*Math.sin(x*.03+2+side))]); addLine(pts,w*.9,d,'sup');
    // trincheras de comunicación hacia atrás (serpentean)
    for(let cx=-bx+70;cx<=bx-70;cx+=C.big?130:60){ const ox=cx+rr(-12,12); pts=[]; for(let k=0;k<=8;k++){ const zz=s*(F+3+k*8.5); pts.push([ox+5*Math.sin(k*1.3+cx),zz]); } addLine(pts,1.6,d*.9,'com'); }
    // alambradas delante de la primera línea (hacia la tierra de nadie), con huecos
    for(let b=0;b<C.wire[side];b++){ const z0=s*(F-9-b*9), dz=s*-5; const gaps=[]; for(let gx=-bx;gx<bx;gx+=C.big?150:120) gaps.push(gx+rr(10,60)); belts.push({z0:Math.min(z0,z0+dz),z1:Math.max(z0,z0+dz),gaps}); } }
  // acequias de riego (Entreguerras): zanjas rectas sin sacos ni tablones
  for(const D of C.ditches||[]){ if(!C.ditchGap){ addLine(D,C.ditchW||1.6,C.ditchD||1.1,'ditch'); continue; }
    // zanjas antitanque con pasos: cada C.ditchGap metros queda un cruce de 22 m sin zanja
    for(let i=0;i<D.length-1;i++){ const [ax,az]=D[i], [bx2,bz2]=D[i+1], L=Math.hypot(bx2-ax,bz2-az);
      for(let t=rr(10,C.ditchGap*.5);t<L;t+=C.ditchGap){ const t1=Math.min(L,t+C.ditchGap-22); if(t1-t<8) continue;
        addLine([[ax+(bx2-ax)*t/L,az+(bz2-az)*t/L],[ax+(bx2-ax)*t1/L,az+(bz2-az)*t1/L]],C.ditchW||1.6,C.ditchD||1.1,'ditch'); } } }
  // ---- setos del bocage (Normandía): cuadrícula de potreros con bordos de tierra y tranqueras ----
  const hedges=[]; if(C.hedges){ const H=C.hedges, cuts=(L0,L1)=>{ const v=[L0]; while(v[v.length-1]<L1) v.push(v[v.length-1]+rr(H.cell[0],H.cell[1])); return v; };
    const xs0=cuts(-bx-40,bx+40), zs0=cuts(-bz-40,bz+40);
    const seg=(ax,az,bx2,bz2)=>{ if(R()>H.keep) return; const L=Math.hypot(bx2-ax,bz2-az), g=rr(.2,.8)*L; // tranquera (hueco de 9 m) en algún lugar del tramo
      const mx=(ax+bx2)/2, mz=(az+bz2)/2; if(Math.hypot(mx-vX,mz-vZ)<vR+15) return;
      const k0=(g-4.5)/L, k1=(g+4.5)/L; hedges.push({ax,az,bx:ax+(bx2-ax)*k0,bz:az+(bz2-az)*k0},{ax:ax+(bx2-ax)*k1,az:az+(bz2-az)*k1,bx:bx2,bz:bz2}); };
    for(const x of xs0) for(let j=0;j<zs0.length-1;j++) seg(x+rr(-6,6),zs0[j],x+rr(-6,6),zs0[j+1]);
    for(const z of zs0) for(let i=0;i<xs0.length-1;i++) seg(xs0[i],z+rr(-6,6),xs0[i+1],z+rr(-6,6)); }
  // ---- caminos hundidos (cruzan el pueblo) ----
  const roads=[]; if(!C.noRoads){ const pts=[]; for(let z=-bz-60;z<=bz+60;z+=10) pts.push([vX+9*Math.sin(z*.02+C.seed),z]); roads.push(pts);
    const p2=[]; for(let x=-bx-60;x<=bx+60;x+=10) p2.push([x,vZ+7*Math.sin(x*.025+1)]); roads.push(p2); }
  const roadSegs=[]; for(const P of roads) for(let i=0;i<P.length-1;i++) roadSegs.push({ax:P[i][0],az:P[i][1],bx:P[i+1][0],bz:P[i+1][1]});
  // ---- ciudad en cuadrícula (Stalingrado, Berlín): calles anchas entre manzanas; coordenadas ya en la escala grande ----
  if(C.city){ const Ct=C.city, st=Ct.street||14; Ct.xs=[]; Ct.zs=[];
    for(let x=Ct.x0;x<=Ct.x1+1;x+=Ct.bw+st) Ct.xs.push(x); for(let z=Ct.z0;z<=Ct.z1+1;z+=Ct.bd+st) Ct.zs.push(z);
    const X0=Ct.xs[0]-st, X1=Ct.xs[Ct.xs.length-1]+st, Z0=Ct.zs[0]-st, Z1=Ct.zs[Ct.zs.length-1]+st;
    for(const x of Ct.xs) roadSegs.push({ax:x,az:Z0,bx:x,bz:Z1,city:1,w:st}); for(const z of Ct.zs) roadSegs.push({ax:X0,az:z,bx:X1,bz:z,city:1,w:st});
    for(const A of Ct.av||[]) roadSegs.push({ax:A[0],az:A[1],bx:A[2],bz:A[3],city:1,w:A[4]||22}); }
  // ---- embudos de obuses (más en la tierra de nadie) ----
  const crs=[]; for(let i=0;i<C.craters;i++){ let x=rr(-bx-50,bx+50), z=rr(-bz-50,bz+50); if(R()<.55) z=rr(-C.front-10,C.front+10);
    if(Math.abs(z)>(C.spawnZ||bz)-40&&Math.abs(x)<(C.big?160:90)) continue; const r=rr(C.crR[0],C.crR[1])*(R()<.12?1.6:1); crs.push({x,z,r,d:r*rr(.28,.42)}); }
  // ---- grilla de alturas: relieve + caminos + embudos ----
  const A=G.a, TD=G.td;
  for(let j=0;j<nz;j++){ const z=-EZ+j*res; for(let i=0;i<nx;i++){ const x=-EX+i*res; A[j*nx+i]=base(x,z); } }
  const stamp=(cx,cz,rad,f)=>{ const i0=Math.max(0,Math.floor((cx-rad+EX)/res)), i1=Math.min(nx-1,Math.ceil((cx+rad+EX)/res)), j0=Math.max(0,Math.floor((cz-rad+EZ)/res)), j1=Math.min(nz-1,Math.ceil((cz+rad+EZ)/res));
    for(let j=j0;j<=j1;j++) for(let i=i0;i<=i1;i++){ const x=-EX+i*res, z=-EZ+j*res; f(j*nx+i,x,z); } };
  for(const S of roadSegs){ if(S.city) continue; const L=Math.hypot(S.bx-S.ax,S.bz-S.az); for(let t=0;t<=L;t+=2){ const x=S.ax+(S.bx-S.ax)*t/L, z=S.az+(S.bz-S.az)*t/L;
    stamp(x,z,4,(k,X,Z)=>{ const q=Math.hypot(X-x,Z-z); if(q<4) A[k]=Math.min(A[k],base(X,Z)-.45*(1-Math.max(0,(q-2.5)/1.5))); }); } }
  for(const c of crs){ stamp(c.x,c.z,c.r*1.45,(k,X,Z)=>{ const q=Math.hypot(X-c.x,Z-c.z)/c.r; A[k]+=q<1?-c.d*(1-q*q):q<1.45?c.d*.25*Math.sin((q-1)/.45*Math.PI):0; }); }
  for(const S of hedges){ const L=Math.hypot(S.bx-S.ax,S.bz-S.az); for(let t=0;t<=L;t+=1.5){ const x=S.ax+(S.bx-S.ax)*t/L, z=S.az+(S.bz-S.az)*t/L;
    stamp(x,z,2.6,(k,X,Z)=>{ const q=Math.hypot(X-x,Z-z); if(q<2.6) A[k]=Math.max(A[k],base(X,Z)+.7*Math.cos(q/2.6*Math.PI/2)); }); } }
  // trincheras: profundidad aparte (para que los tanques largos pasen por encima) y parapeto de tierra del lado enemigo
  const segDistW=(x,z,S)=>{ const dx=S.bx-S.ax, dz=S.bz-S.az, l=dx*dx+dz*dz; let t=l?((x-S.ax)*dx+(z-S.az)*dz)/l:0; t=clamp(t,0,1); return Math.hypot(x-S.ax-dx*t,z-S.az-dz*t); };
  for(const S of segs){ const m=S.w/2+1.8; const cx=(S.ax+S.bx)/2, cz=(S.az+S.bz)/2, rad=Math.hypot(S.bx-S.ax,S.bz-S.az)/2+m;
    stamp(cx,cz,rad,(k,X,Z)=>{ const q=segDistW(X,Z,S); if(q<S.w/2){ const f=clamp((S.w/2-q)/.4,0,1); TD[k]=Math.max(TD[k],S.d*f); }
      else if(q<m&&S.kind!=='com'&&S.kind!=='ditch'){ const zm=(S.az+S.bz)/2, enemy=S.az<0?Z>zm:Z<zm; if(enemy) A[k]+=.55*Math.sin((q-S.w/2)/(m-S.w/2)*Math.PI); } }); }
  for(let k=0;k<A.length;k++) A[k]-=TD[k];
  // zona de partida y retaguardia más planas (sin embudos encima de la base)
  // ---- consultas para el motor ----
  const SB=new Map(), sb=(x,z)=>Math.floor(x/10)*10007+Math.floor(z/10);
  for(const S of segs){ const x0=Math.min(S.ax,S.bx)-S.w, x1=Math.max(S.ax,S.bx)+S.w, z0=Math.min(S.az,S.bz)-S.w, z1=Math.max(S.az,S.bz)+S.w;
    for(let x=Math.floor(x0/10);x<=Math.floor(x1/10);x++) for(let z=Math.floor(z0/10);z<=Math.floor(z1/10);z++){ const k=x*10007+z; if(!SB.has(k)) SB.set(k,[]); SB.get(k).push(S); } }
  W.trench=(x,z)=>{ const L=SB.get(sb(x,z)); if(!L) return null; let best=null; for(const S of L){ const q=segDistW(x,z,S); if(q<S.w/2&&(!best||S.w>best.w)) best=S; }
    if(!best) return null; const d=ww1Depth(G,x,z); return d>.05?{d,w:best.w}:null; };
  W.wire=(x,z)=>{ for(const B of belts) if(z>B.z0&&z<B.z1&&!B.gaps.some(g=>Math.abs(x-g)<6)&&!B.cut.some(c=>Math.abs(x-c)<2.5)) return true; return false; };
  // la infantería se cubre en la trinchera más cercana
  W.trenchCover=(x,z)=>{ let best=null,bd=32; for(const S of segs){ const dx=S.bx-S.ax, dz=S.bz-S.az, l=dx*dx+dz*dz; let t=l?((x-S.ax)*dx+(z-S.az)*dz)/l:0; t=clamp(t,0,1);
      const px=S.ax+dx*t, pz=S.az+dz*t, d=Math.hypot(x-px,z-pz); if(d<bd){bd=d;best={x:px,z:pz};} } return best; };
  W.trenchSegs=segs;
  // ---- terreno ----
  // Grilla de separación variable: fina (1 m) donde hay trincheras, media en la tierra de nadie y gruesa atrás.
  // Así el terreno tiene pocos triángulos y las trincheras se ven bien (corre liviano en una PC común).
  const Lx=bx*2+60, Lz=bz*2+60, MX=bx+30, MZ=bz+30, F=C.front;
  const axis=(L,step)=>{ const v=[-L]; while(v[v.length-1]<L-1e-6){ const c=v[v.length-1]; v.push(Math.min(L,c+step(c))); } return v; };
  const comX=segs.filter(S=>S.kind==='com').map(S=>(S.ax+S.bx)/2);
  const GR=C.grid||[1.15,2.0,4.0,2.3,1.0]; // separación de la grilla: trincheras, tierra de nadie, retaguardia; en x: general y junto a las comunicaciones
  const zs=axis(MZ,z=>{ const a=Math.abs(z); return a>F-22&&a<F+68?GR[0]:a<=F-22?GR[1]:GR[2]; });
  const xs=axis(MX,x=>comX.some(c=>Math.abs(c-x)<7)?GR[4]:GR[3]);
  // el terreno va en sectores (mapas grandes): cada uno se dibuja solo si se ve (cullAdd)
  const CH=C.big?60:1e6, terrGeos=[];
  for(let i0=0;i0<xs.length-1;i0+=CH) for(let j0=0;j0<zs.length-1;j0+=CH){
    const X=xs.slice(i0,Math.min(xs.length,i0+CH+1)), Z=zs.slice(j0,Math.min(zs.length,j0+CH+1));
    const g=new THREE.PlaneGeometry(1,1,X.length-1,Z.length-1); g.rotateX(-Math.PI/2);
    const pos=g.attributes.position, uv=g.attributes.uv;
    // PlaneGeometry (ya rotada) ordena las filas de z=-Lz/2 hacia +Lz/2 y las columnas de x=-Lx/2 hacia +Lx/2: se reemplazan por las grillas propias
    for(let i=0;i<pos.count;i++){ const x=X[i%X.length], z=Z[(i/X.length)|0]; pos.setXYZ(i,x,ww1Sample(W,x,z),z); uv.setXY(i,(MX-x)/(2*MX),(z+MZ)/(2*MZ)); }
    g.computeVertexNormals(); g.computeBoundingSphere();
    // versión liviana del sector (uno de cada 3 vértices) para dibujarlo de lejos
    let gl=null; if(C.big){ const sx=[], sz=[]; for(let i=0;i<X.length;i+=3) sx.push(X[i]); if(sx[sx.length-1]!==X[X.length-1]) sx.push(X[X.length-1]); for(let j=0;j<Z.length;j+=3) sz.push(Z[j]); if(sz[sz.length-1]!==Z[Z.length-1]) sz.push(Z[Z.length-1]);
      gl=new THREE.PlaneGeometry(1,1,sx.length-1,sz.length-1); gl.rotateX(-Math.PI/2); const P2=gl.attributes.position, U2=gl.attributes.uv;
      for(let i=0;i<P2.count;i++){ const x=sx[i%sx.length], z=sz[(i/sx.length)|0]; P2.setXYZ(i,x,ww1Sample(W,x,z)-.05,z); U2.setXY(i,(MX-x)/(2*MX),(z+MZ)/(2*MZ)); } gl.computeVertexNormals(); }
    terrGeos.push([g,gl]); }
  const cv=document.createElement('canvas'), S2=2048; cv.width=cv.height=S2; const ctx=cv.getContext('2d');
  const px=x=>(MX-x)/(2*MX)*S2, py=z=>(MZ-z)/(2*MZ)*S2, pm=S2/(2*MX);
  paintWW1Ground(ctx,S2,C,R,{px,py,pm,segs,crs,roadSegs,belts,MX,MZ});
  const tex=new THREE.CanvasTexture(cv); tex.anisotropy=ANISO; tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;
  const mat=groundDetail(new THREE.MeshLambertMaterial({map:tex}));
  for(const [g,gl] of terrGeos){ const terr=new THREE.Mesh(g,mat); terr.receiveShadow=true; terr.userData.ground=true; worldGroup.add(terr);
    if(gl){ const lo=new THREE.Mesh(gl,mat); lo.receiveShadow=true; worldGroup.add(lo); const S=g.boundingSphere; cullAdd(terr,S.center.x,S.center.y,S.center.z,S.radius,0,{m:lo,d:140}); } }
  W.mmCanvas=(()=>{ const m=document.createElement('canvas'); m.width=m.height=512; m.getContext('2d').drawImage(cv,0,0,512,512); return m; })(); W.mmEX=MX; W.mmEZ=MZ;
  // ---- trincheras: sacos terreros, tablones de revestimiento y pasarelas ----
  dressTrenches(segs,G,R);
  // ---- alambradas: postes y alambre en zigzag ----
  { const P=[], lines=[]; for(const B of belts){ B.cut=[]; for(let row=0;row<2;row++){ const zz=B.z0+(B.z1-B.z0)*(row?.75:.25); let prev=null;
      for(let x=-bx-30;x<=bx+30;x+=3.2){ if(B.gaps.some(g=>Math.abs(x-g)<6)){ prev=null; continue; } const z=zz+rr(-.8,.8), y=ww1Sample(W,x,z);
        P.push([x,y,z,rr(-.15,.15)]); if(prev){ for(const hh of [.35,.8,1.15]) lines.push(prev[0],prev[1]+hh,prev[2],x,y+(hh===.8?.35:hh===.35?.8:1.15),z); lines.push(prev[0],prev[1]+1.15,prev[2],x,y+.35,z); } prev=[x,y,z]; } } }
    const pg=new THREE.CylinderGeometry(.045,.05,1.3,5); pg.translate(0,.6,0); const im=new THREE.InstancedMesh(pg,new THREE.MeshLambertMaterial({color:0x4a3f33}),P.length), M4=new THREE.Matrix4();
    P.forEach((p,i)=>{ M4.makeRotationZ(p[3]); M4.setPosition(p[0],p[1]-.1,p[2]); im.setMatrixAt(i,M4); }); im.castShadow=true; worldGroup.add(im);
    const lg=new THREE.BufferGeometry(); lg.setAttribute('position',new THREE.Float32BufferAttribute(lines,3)); worldGroup.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x2a2622,transparent:true,opacity:.75})));
    // un tanque que pasa por encima aplasta la alambrada: los postes quedan tirados, el alambre en el suelo y se abre un paso
    const LP=lg.attributes.position;
    W.wireCrush=(x,z,r)=>{ let hit=false; for(const B of belts){ if(z<B.z0-r||z>B.z1+r||B.gaps.some(g=>Math.abs(x-g)<6)||B.cut.some(c=>Math.abs(x-c)<r*.6)) continue; B.cut.push(x); hit=true; }
      if(!hit) return false;
      P.forEach((p,i)=>{ if(Math.abs(p[0]-x)<r+.5&&Math.abs(p[2]-z)<r+3&&!p[4]){ p[4]=1; M4.makeRotationFromEuler(new THREE.Euler(Math.PI/2*(R2()<.5?1:-1),R2()*3,0)); M4.setPosition(p[0],p[1]+.05,p[2]); im.setMatrixAt(i,M4); } });
      for(let k=0;k<LP.count;k++){ const X=LP.getX(k), Z=LP.getZ(k); if(Math.abs(X-x)<r+2&&Math.abs(Z-z)<r+3) LP.setY(k,ww1Sample(W,X,Z)+.06); }
      im.instanceMatrix.needsUpdate=true; LP.needsUpdate=true; return true; }; }
  // ---- pueblo en ruinas (y caserío) ----
  const houses=[]; const town=(V,small)=>{ const n=V.n; for(let i=0,tries=0;i<n&&tries<n*12;tries++){ const a=R()*Math.PI*2, r=Math.sqrt(R())*V.r, x=V.x+Math.cos(a)*r, z=V.z+Math.sin(a)*r;
      if(roadSegs.some(S=>segDistW(x,z,S)<6.5)) continue; if(segs.some(S=>segDistW(x,z,S)<S.w/2+5)) continue;
      const w=rr(6,10)*(V.sz||1), d=rr(6,9)*(V.sz||1), h=rr(4.5,7.5)*(V.hz||1), rot=Math.round(R()*2)*Math.PI/2+rr(-.06,.06), wall=pickR(V.walls||[0xb8ab90,0x9e917a,0xa45a44,0xc2b49a,0x8d7f6a]), roof=pickR(V.roofs||[0x8a4430,0x7a3c2c,0x4a4e52,0x6a3a2a]);
      if(addBuilding(x,z,w,d,h,rot,wall,roof,true,100,true)){ houses.push({ruin:R()<V.ruin}); i++; } }
    if(V.church){ if(addBuilding(V.x+4,V.z-6,9,18,9,0,0xc4b8a0,0x4a4e52,true,300,true)) houses.push({ruin:R()<V.ruin*.6}); if(addBuilding(V.x+4,V.z+4.5,5,5,17,0,0xc4b8a0,0x4a4e52,true,300,false)) houses.push({ruin:R()<V.ruin*.5}); } };
  town(C.village); if(C.hamlet) town(C.hamlet,true); for(const H of C.hamlets||[]) town(H,true);
  const lms=[]; if(C.city){ const Ct=C.city, st=Ct.street||14, lm=Ct.lm||[];
    const rectD=(px,pz,x0,x1,z0,z1)=>Math.hypot(Math.max(x0-px,0,px-x1),Math.max(z0-pz,0,pz-z1));
    for(const L of lm){ const parts=L.parts||[[0,0,L.w,L.d,L.h]];                                    // edificios famosos (no se derrumban de entrada)
      for(const [ox,oz,w,d,h] of parts){ const c=Math.cos(L.a||0), sn=Math.sin(L.a||0), x=L.x+ox*c+oz*sn, z=L.z-ox*sn+oz*c;
        if(addBuilding(x,z,w,d,h,L.a||0,L.wall,L.roof,true,L.hp||800,!!L.pitched)) houses.push({ruin:false,lm:1}); } lms.push(L); }
    for(let i=0;i<Ct.xs.length-1;i++) for(let j=0;j<Ct.zs.length-1;j++){
      const x0=Ct.xs[i]+st/2, x1=Ct.xs[i+1]-st/2, z0=Ct.zs[j]+st/2, z1=Ct.zs[j+1]-st/2;
      if(C.zones.some(Z=>rectD(Z.x,Z.z,x0,x1,z0,z1)<Z.r*.75)) continue;                                // los puntos quedan en plazas abiertas
      if(lm.some(L=>rectD(L.x,L.z,x0,x1,z0,z1)<Math.max(L.w,L.d)/2+(L.pad??8))) continue;
      if((Ct.skip||[]).some(([sx,sz,sr])=>rectD(sx,sz,x0,x1,z0,z1)<sr)) continue;                     // parques, cerros, baldíos
      if(roadSegs.some(S=>S.city&&S.w>st&&rectD((S.ax+S.bx)/2,(S.az+S.bz)/2,x0,x1,z0,z1)<1&&segDistW((x0+x1)/2,(z0+z1)/2,S)<S.w/2+(x1-x0)/2)) continue; // avenidas
      if(R()<(Ct.open||.1)) continue;                                                                   // plaza o baldío
      const nx=Math.max(1,Math.round((x1-x0)/Ct.lot)), nz=Math.max(1,Math.round((z1-z0)/Ct.lot)), lw=(x1-x0)/nx, ld=(z1-z0)/nz;
      for(let a=0;a<nx;a++) for(let b=0;b<nz;b++){ if(a>0&&a<nx-1&&b>0&&b<nz-1) continue;               // alrededor de un patio
        const x=x0+lw*(a+.5), z=z0+ld*(b+.5), h=rr(Ct.h[0],Ct.h[1]);
        if(roadSegs.some(S=>S.city&&S.w>st&&segDistW(x,z,S)<S.w/2+Math.max(lw,ld)/2)) continue;
        if(addBuilding(x,z,lw-1.4,ld-1.4,h,0,pickR(Ct.walls),pickR(Ct.roofs),true,160,R()<(Ct.pitched||0))) houses.push({ruin:R()<Ct.ruin,col:Ct.col}); } } }
  // casamatas de hormigón para ametralladoras (Línea Hindenburg)
  if(C.bunkers) for(let i=0;i<C.bunkers;i++){ const x=-bx*.75+i*(bx*1.5/(C.bunkers-1))+rr(-10,10), z=C.front+16+rr(-3,3); if(roadSegs.some(S=>segDistW(x,z,S)<5)) continue; if(addBuilding(x,z,4.5,4,1.8,rr(-.2,.2),0x8e8c84,0x7a7870,true,260,false)) houses.push({ruin:false,bunker:1}); }
  finalizeBuildings();
  buildings.forEach((b,i)=>{ const H=houses[i]; if(!H||H.lm) return; if(H.ruin) ruinBuilding(b,R()<(H.col??.65)); else if(!H.bunker&&R()<.6) ruinBuilding(b,false); });
  for(const L of lms) if(L.extra) L.extra(ww1Sample(W,L.x,L.z));                                       // cúpula, torres, columnas, chimeneas
  // ---- bosques (vivos o hechos astillas) y álamos junto a los caminos ----
  const list=[]; const wood=(Wd)=>{ for(let i=0;i<Wd.n;i++){ const a=R()*Math.PI*2, r=Math.sqrt(R())*Wd.r, x=Wd.x+Math.cos(a)*r, z=Wd.z+Math.sin(a)*r;
      if(segs.some(S=>segDistW(x,z,S)<S.w/2+1.2)) continue; if(gridQuery(x,z,4).some(b=>obPush(x,z,3,b))) continue;
      const dead=R()<Wd.dead; list.push({x,z,sp:dead?(R()<.55?'muerto':'tocon'):Wd.sp?pickR(Wd.sp):(R()<.8?'roble':'alamo'),s:rr(.8,1.2)*(Wd.s||1)}); } };
  for(const Wd of [...C.woods,...(C.extraWoods||[])]) wood(Wd);
  // árboles sueltos destrozados en la tierra de nadie
  for(let i=0;i<(C.deadTrees??40);i++){ const x=rr(-bx,bx), z=rr(-C.front+12,C.front-12); if(!gridQuery(x,z,4).some(b=>obPush(x,z,3,b))) list.push({x,z,sp:R()<.6?'tocon':'muerto',s:rr(.7,1.1)}); }
  if(C.poplars) for(const S of roadSegs) { const L=Math.hypot(S.bx-S.ax,S.bz-S.az); for(let t=3;t<L;t+=9){ if(R()<.35) continue; const k=t/L, x=S.ax+(S.bx-S.ax)*k, z=S.az+(S.bz-S.az)*k, nx2=-(S.bz-S.az)/L, nz2=(S.bx-S.ax)/L;
    for(const sd of [-1,1]){ const X=x+nx2*sd*4.8, Z=z+nz2*sd*4.8; if(Math.abs(X)<bx+20&&Math.abs(Z)<bz+20&&!segs.some(Sg=>segDistW(X,Z,Sg)<Sg.w/2+1)&&!gridQuery(X,Z,3).some(b=>obPush(X,Z,2,b))) list.push({x:X,z:Z,sp:'alamo',s:rr(.9,1.15)}); } } }
  for(const S of hedges){ const L=Math.hypot(S.bx-S.ax,S.bz-S.az); for(let t=1;t<L;t+=rr(3.6,5.4)){ const x=S.ax+(S.bx-S.ax)*t/L+rr(-.4,.4), z=S.az+(S.bz-S.az)*t/L+rr(-.4,.4);
    if(Math.abs(x)>bx+30||Math.abs(z)>bz+30) continue; list.push({x,z,sp:R()<.12?'roble':'seto',s:rr(.8,1.25)}); } }
  buildTrees(list);
  // ---- charcos de agua barrosa en los embudos grandes ----
  { const big=crs.filter(c=>c.r>2.6&&R()<.45&&Math.abs(c.x)<bx+25&&Math.abs(c.z)<bz+25); const pg=new THREE.CircleGeometry(1,14); pg.rotateX(-Math.PI/2);
    const im=new THREE.InstancedMesh(pg,new THREE.MeshLambertMaterial({color:0x4d5246,transparent:true,opacity:.85}),Math.max(1,big.length)), M4=new THREE.Matrix4();
    big.forEach((c,i)=>{ const y=ww1Sample(W,c.x,c.z); M4.makeScale(c.r*.45,1,c.r*.45); M4.setPosition(c.x,y+.12,c.z); im.setMatrixAt(i,M4); }); if(!big.length){ M4.makeScale(0,0,0); im.setMatrixAt(0,M4); } im.receiveShadow=true; worldGroup.add(im); }
  // posiciones de los cañones de campaña (detrás de la trinchera de apoyo, mirando al enemigo)
  { const K=C.big?4:1; W.gunSpots={0:[-70,10,85,-150,150].map(x=>({x:x*K+rr(-8,8),z:-(C.front+40)})),1:[-80,-5,75,-160,140].map(x=>({x:x*K+rr(-8,8),z:C.front+42}))}; }
  // la infantería entra por su propia trinchera (en los mapas grandes, la base queda lejos)
  W.infSp=C.big?{0:[-.5,0,.5].map(f=>({x:f*bx,z:-(C.front+30)})),1:[-.5,0,.5].map(f=>({x:f*bx,z:C.front+30}))}:null;
  // defensores en la primera línea: ametralladoras y fusileros que se quedan en su puesto
  W.setup=C.noTrench?null:()=>{ for(const tm of (C.trenchSides||[-1,1]).map(s=>s<0?0:1)){ const s=tm?1:-1, F=C.front+(tm?4:0); for(let i=0;i<(C.big?14:6);i++){ const x=C.big?-bx*.85+i*(bx*1.7/13)+rand(-8,8):-130+i*52+rand(-8,8), z=s*(F+1.6);
      const P=makePerson(i%2?'rifle':'hmg',tm,x,z); P.hold=true; P.goal=null; } } };
  nodes=null; W.boundary=null;
  // ciudades: grafo de la IA en una grilla de 12 m por donde no hay edificios (si no, los tanques se traban entre las manzanas)
  if(C.city){ nodes=[]; const NG=new Map(), sp=12, idx=new Map(), blocked=(x,z,r)=>gridQuery(x,z,r+4).some(b=>obPush(x,z,r,b));
    for(let x=-bx+10;x<=bx-10;x+=sp) for(let z=-bz+10;z<=bz-10;z+=sp){ if(blocked(x,z,4.5)) continue; const nd={p:new THREE.Vector3(x,0,z),nb:[]}; nodes.push(nd); idx.set(x+','+z,nd);
      const k=Math.floor(x/10)*7919+Math.floor(z/10); if(!NG.has(k)) NG.set(k,[]); NG.get(k).push(nd); }
    for(const nd of nodes) for(const [dx,dz] of [[sp,0],[0,sp],[sp,sp],[sp,-sp]]){ const o=idx.get((nd.p.x+dx)+','+(nd.p.z+dz)); if(!o) continue;
      if(blocked(nd.p.x+dx/2,nd.p.z+dz/2,3.5)) continue; nd.nb.push(o); o.nb.push(nd); }
    nodes.near=NG; }
}

// Pintura del suelo: barro, pasto, embudos, trincheras, caminos y alambradas (vista desde arriba)
function paintWW1Ground(x,S,C,R,o){
  const {px,py,pm}=o, rr=(a,b)=>a+R()*(b-a);
  x.fillStyle=C.ground[0]; x.fillRect(0,0,S,S);
  // manchas grandes de barro y de pasto
  for(let i=0;i<900;i++){ x.globalAlpha=rr(.15,.45); x.fillStyle=C.ground[1+(i%3)]; x.beginPath(); x.ellipse(R()*S,R()*S,rr(8,60),rr(6,40),rr(0,3),0,7); x.fill(); }
  if(C.grass){ const gc=['#6a7a3e','#748446','#5f7038','#80884c']; for(let i=0;i<1400*C.grass*(C.big?3:1);i++){ const X=R()*S, Y=R()*S; const zW=o.MZ-Y/pm;
      if(Math.abs(zW)<C.front-6&&R()<.65) continue; x.globalAlpha=rr(.25,.6); x.fillStyle=gc[i%4]; x.beginPath(); x.ellipse(X,Y,rr(6,40),rr(5,28),rr(0,3),0,7); x.fill(); } }
  // surcos de arado en los campos de atrás
  x.globalAlpha=.08; x.strokeStyle='#2a2218'; x.lineWidth=1.2; for(let y=0;y<S;y+=4){ const zW=o.MZ-y/pm; if(Math.abs(zW)<C.front+20) continue; x.beginPath(); x.moveTo(0,y); x.lineTo(S,y+rr(-2,2)); x.stroke(); }
  x.globalAlpha=1;
  // caminos de tierra blanca (tiza)
  if(C.city){ x.lineCap='butt'; for(const S2 of o.roadSegs) if(S2.city){ x.strokeStyle=C.city.curb||'#8e8a80'; x.lineWidth=(S2.w+3)*pm; x.beginPath(); x.moveTo(px(S2.ax),py(S2.az)); x.lineTo(px(S2.bx),py(S2.bz)); x.stroke(); }
    for(const S2 of o.roadSegs) if(S2.city){ x.strokeStyle=C.city.pave||'#6c6962'; x.lineWidth=S2.w*pm; x.beginPath(); x.moveTo(px(S2.ax),py(S2.az)); x.lineTo(px(S2.bx),py(S2.bz)); x.stroke(); }
    for(let i=0;i<9000;i++){ const X=R()*S, Y=R()*S; x.globalAlpha=rr(.15,.4); x.fillStyle=R()<.5?'#5a5650':'#9a948a'; x.fillRect(X,Y,rr(1,3),rr(1,3)); } x.globalAlpha=1; }   // escombros y polvo
  x.lineCap='round'; for(const S2 of o.roadSegs){ if(S2.city) continue; x.strokeStyle='#a69a80'; x.lineWidth=6.2*pm; x.beginPath(); x.moveTo(px(S2.ax),py(S2.az)); x.lineTo(px(S2.bx),py(S2.bz)); x.stroke(); }
  for(const S2 of o.roadSegs){ if(S2.city) continue; x.strokeStyle='#b8ad94'; x.lineWidth=3.6*pm; x.beginPath(); x.moveTo(px(S2.ax),py(S2.az)); x.lineTo(px(S2.bx),py(S2.bz)); x.stroke(); }
  for(const S2 of o.roadSegs){ if(S2.city) continue; x.strokeStyle='rgba(90,78,60,.45)'; x.lineWidth=.5*pm; for(const off of [-.9,.9]){ const L=Math.hypot(S2.bx-S2.ax,S2.bz-S2.az)||1, nx=-(S2.bz-S2.az)/L*off, nz=(S2.bx-S2.ax)/L*off; x.beginPath(); x.moveTo(px(S2.ax+nx),py(S2.az+nz)); x.lineTo(px(S2.bx+nx),py(S2.bz+nz)); x.stroke(); } }
  // embudos: tierra removida clara alrededor, fondo oscuro y húmedo
  for(const c of o.crs){ const X=px(c.x), Y=py(c.z), r=c.r*pm;
    const g=x.createRadialGradient(X,Y,r*.2,X,Y,r*1.55); g.addColorStop(0,'rgba(40,32,24,.85)'); g.addColorStop(.55,'rgba(70,56,40,.6)'); g.addColorStop(.72,'rgba(150,132,104,.55)'); g.addColorStop(1,'rgba(150,132,104,0)');
    x.fillStyle=g; x.beginPath(); x.arc(X,Y,r*1.55,0,7); x.fill(); }
  // tierra removida en la tierra de nadie
  for(let i=0;i<2500*(C.churn??1);i++){ const X=R()*S, zW=rr(-C.front,C.front), Y=py(zW); x.globalAlpha=rr(.1,.3); x.fillStyle=R()<.5?'#3e3226':'#8a7a5e'; x.fillRect(X,Y,rr(1,4),rr(1,4)); }
  x.globalAlpha=1;
  // trincheras: borde de sacos terreros (claro), interior oscuro y pasarela de madera
  for(const S2 of o.segs){ x.strokeStyle='#9b8c6c'; x.lineWidth=(S2.w+1.6)*pm; x.beginPath(); x.moveTo(px(S2.ax),py(S2.az)); x.lineTo(px(S2.bx),py(S2.bz)); x.stroke(); }
  for(const S2 of o.segs){ x.strokeStyle='#2c241b'; x.lineWidth=S2.w*pm; x.beginPath(); x.moveTo(px(S2.ax),py(S2.az)); x.lineTo(px(S2.bx),py(S2.bz)); x.stroke(); }
  for(const S2 of o.segs){ x.strokeStyle='#6b5536'; x.lineWidth=.7*pm; x.setLineDash([.25*pm,.12*pm]); x.beginPath(); x.moveTo(px(S2.ax),py(S2.az)); x.lineTo(px(S2.bx),py(S2.bz)); x.stroke(); } x.setLineDash([]);
  // alambradas: bandas grises enmarañadas
  for(const B of o.belts){ for(let i=0;i<900;i++){ const X=R()*S, Y=py(rr(B.z0,B.z1)); x.globalAlpha=.35; x.strokeStyle='#3a342c'; x.lineWidth=1; x.beginPath(); x.moveTo(X,Y); x.lineTo(X+rr(-6,6),Y+rr(-4,4)); x.stroke(); } }
  x.globalAlpha=1;
}

// Revestimiento de las trincheras (instanciado: miles de piezas, pocas llamadas de dibujo)
function dressTrenches(segs,G,R){
  const bag=[], board=[], duck=[], post=[], rr=(a,b)=>a+R()*(b-a);
  for(const S of segs){ const dx=S.bx-S.ax, dz=S.bz-S.az, L=Math.hypot(dx,dz); if(L<.5||S.kind==='ditch') continue; const ux=dx/L, uz=dz/L, nx=-uz, nz=ux, ang=Math.atan2(ux,uz);
    for(let t=.5,ti=0;t<L;t+=1.25,ti++){ const cx=S.ax+ux*t, cz=S.az+uz*t;
      for(const sd of [-1,1]){ const ex=cx+nx*sd*(S.w/2+.35), ez=cz+nz*sd*(S.w/2+.35), y=ww1Sample(W,ex,ez);
        const front=S.az<0?nz*sd>0:nz*sd<0; // parapeto (del lado enemigo) con dos hileras; atrás, una suelta
        if(front||R()<.25) bag.push([ex,y+.1,ez,ang+rr(-.15,.15)]);
        if(front&&S.kind!=='com'&&R()<.45) bag.push([ex+nx*sd*.04,y+.3,ez+nz*sd*.04,ang+rr(-.25,.25)]);
        const wx=cx+nx*sd*(S.w/2-.08), wz=cz+nz*sd*(S.w/2-.08), fy=ww1Sample(W,cx,cz); if(ti%2===0) board.push([wx,fy+S.d*.45,wz,ang,S.d*.85]);
        if(ti%2===1) post.push([wx,fy+S.d*.5,wz,S.d+.2]); }
      duck.push([cx,ww1Sample(W,cx,cz)+.06,cz,ang]); } }
  const M4=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), sc=new THREE.Vector3(), p=new THREE.Vector3();
  const mkOne=(geo,mat,list,f)=>{ if(!list.length) return; const im=new THREE.InstancedMesh(geo,mat,list.length); list.forEach((e,i)=>{ f(e); im.setMatrixAt(i,M4); }); im.castShadow=true; im.receiveShadow=true; im.frustumCulled=false; worldGroup.add(im);
    if(W.cfg&&W.cfg.big){ let cx=0,cz=0; list.forEach(e=>{cx+=e[0];cz+=e[2];}); cx/=list.length; cz/=list.length; cullAdd(im,cx,list[0][1],cz,Math.max(...list.map(e=>Math.hypot(e[0]-cx,e[2]-cz)))+4,320); } return im; };
  const mk=(geo,mat,list,f)=>{ const out=[]; for(const L of cells(list,150,e=>e[0],e=>e[2]).values()) out.push(mkOne(geo,mat,L,f)); return out; };
  const bagG=new THREE.BoxGeometry(.7,.22,.4); { const P=bagG.attributes.position; for(let i=0;i<P.count;i++){ const y=P.getY(i); P.setX(i,P.getX(i)*(y>0?.9:1)); P.setZ(i,P.getZ(i)*(y>0?.8:1)); } bagG.computeVertexNormals(); }
  { const ims=mk(bagG,new THREE.MeshLambertMaterial({color:0xffffff}),bag,e=>{ q.setFromAxisAngle(up,e[3]+Math.PI/2); M4.compose(p.set(e[0],e[1],e[2]),q,sc.set(rr(.9,1.1),1,1)); });
    const c=new THREE.Color(); for(const im of ims){ for(let i=0;i<im.count;i++) im.setColorAt(i,c.set(R()<.5?0x9a8a66:R()<.5?0x8a7b5a:0xa89a74)); im.instanceColor.needsUpdate=true; } }
  mk(new THREE.BoxGeometry(.06,1,2.52),new THREE.MeshLambertMaterial({color:0x5e4a34}),board,e=>{ q.setFromAxisAngle(up,e[3]); M4.compose(p.set(e[0],e[1],e[2]),q,sc.set(1,e[4],1)); });
  mk(new THREE.BoxGeometry(.7,.06,.95),new THREE.MeshLambertMaterial({color:0x6e5a40}),duck,e=>{ q.setFromAxisAngle(up,e[3]); M4.compose(p.set(e[0],e[1],e[2]),q,sc.set(1,1,1)); });
  mk(new THREE.CylinderGeometry(.06,.07,1,4,1,true),new THREE.MeshLambertMaterial({color:0x4a3a2a}),post,e=>{ q.identity(); M4.compose(p.set(e[0],e[1],e[2]),q,sc.set(1,e[3],1)); });
}

// Casas en ruinas desde el arranque: techo hundido y paredes ennegrecidas, o derrumbe completo con escombros
function ruinBuilding(b,collapse){
  const col=new THREE.Color(b.wall), m=new THREE.Matrix4();
  if(collapse){ b.hp=0; b.box.dead=true; const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),b.a), g=heightAt(b.x,b.z);
    m.compose(new THREE.Vector3(b.x,b.base+1.05,b.z),q,new THREE.Vector3(b.w*.98,.6,b.d*.98)); wallsIM.setMatrixAt(b.i,m); wallsIM.setColorAt(b.i,col.set(0x6f675d));
    m.makeScale(0,0,0); roofsIM.setMatrixAt(b.i,m); gablesIM.setMatrixAt(b.i,m); if(rtankIM) rtankIM.setMatrixAt(b.i,m); rubble(b,g); }
  else { b.hp=b.max*rand(.3,.6); b.sag=true; wallsIM.setColorAt(b.i,col.multiplyScalar(rand(.55,.75)));
    const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(rand(-.18,.18),b.a,rand(-.18,.18)));
    if(b.pitched){ m.compose(new THREE.Vector3(b.x,b.top-.5,b.z),q,new THREE.Vector3(b.w+.3,Math.min(b.w,b.d)*.28,b.d+.2)); gablesIM.setMatrixAt(b.i,m); } }
  wallsIM.instanceMatrix.needsUpdate=roofsIM.instanceMatrix.needsUpdate=gablesIM.instanceMatrix.needsUpdate=true; wallsIM.instanceColor.needsUpdate=true; if(rtankIM) rtankIM.instanceMatrix.needsUpdate=true;
}

// Alrededor del campo de batalla: un terreno grande y liviano (8 m entre vértices) que repite el relieve en espejo
// y queda escondido debajo del terreno detallado. Reemplaza las copias en espejo de los otros mapas (mucho más pesadas).
function ww1Outer(){
  const C=W.cfg, MX=W.bx+30, MZ=W.bz+30, E=Math.max(900,W.bx+700), n=Math.round(E*2/16), g=new THREE.PlaneGeometry(E*2,E*2,n,n); g.rotateX(-Math.PI/2);
  const pos=g.attributes.position, uv=g.attributes.uv, mir=(v,L)=>{ v=((v+L)%(4*L)+4*L)%(4*L)-L; return v>L?2*L-v:v; };
  for(let i=0;i<pos.count;i++){ const x=pos.getX(i), z=pos.getZ(i), inside=Math.abs(x)<MX-9&&Math.abs(z)<MZ-9, mx=mir(x,MX), mz=mir(z,MZ);
    pos.setY(i,ww1Sample(W,mx,mz)-(inside?4:.05)); uv.setXY(i,(MX-mx)/(2*MX),(mz+MZ)/(2*MZ)); }
  g.computeVertexNormals();
  const terr=worldGroup.children.find(o=>o.isMesh&&o.geometry.type==='PlaneGeometry'&&o.material.map);
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:terr?terr.material.map:null,color:0xe8e4dc})); m.receiveShadow=true; worldGroup.add(m);
  // árboles sueltos y tocones a lo lejos
  const R=mulberry(C.seed+7), list=[]; for(let i=0;i<160;i++){ const a=R()*Math.PI*2, r=MX+20+R()*260, x=Math.cos(a)*r, z=Math.sin(a)*r*.9; if(Math.abs(x)<MX+10&&Math.abs(z)<MZ+10) continue;
    list.push({x,z,sp:R()<.5?'muerto':R()<.5?'roble':'tocon',s:.8+R()*.4}); }
  const keep=trees.slice(), sets=Object.assign({},treeSets); buildTrees(list); trees=keep; for(const k in sets){ if(treeSets[k]) treeSets[k+'_far']=treeSets[k]; treeSets[k]=sets[k]; }
}
