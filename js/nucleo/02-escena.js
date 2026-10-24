for(const k in VEH){ const V=VEH[k]; Object.assign(V,{crew:4},FC[k]||{}); V.ammo=(AMMO_DEF[k]||[['AP','ke',V.pen]]).map(([n,kind,pen,v])=>({n,kind,pen,v:v||KV[kind],sc:V.auto?(k==='m113'?.1:.16):1})); V.optic=OPTIC[k]||[8]; }
const KIND_ES={ke:'cinética',heat:'carga hueca',hesh:'HESH',he:'explosiva'};
const realMode=true;
let chosenNation='ar', enemyNation='uk', chosenMap='rand';
/* ---------- Escena ---------- */
const renderer=new THREE.WebGLRenderer({antialias:true});
// Calidad gráfica (Ajustes): baja / media / alta
let gfx='media'; try{ const S0=JSON.parse(localStorage.getItem('tw_settings')||'null'); if(S0&&S0.gfx) gfx=S0.gfx; }catch(e){}
const GFX={baja:{pr:.75,sh:0,grass:0,mir:'terreno'},media:{pr:1,sh:1024,grass:.5,mir:'medio'},alta:{pr:2,sh:2048,grass:1,mir:'todo'}};
const Q=()=>GFX[gfx]||GFX.media;
renderer.setPixelRatio(Math.min(devicePixelRatio,Q().pr));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
$('game').appendChild(renderer.domElement);
const scene=new THREE.Scene();
scene.background=new THREE.Color(0xbcc6c4);
scene.fog=new THREE.Fog(0xbcc6c4,150,460);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,0.3,1000);
const hemi=new THREE.HemisphereLight(0xe8eef0,0x5a4a32,0.75); scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d6,1.0);
sun.castShadow=!!Q().sh; sun.shadow.mapSize.set(Q().sh||1024,Q().sh||1024);
Object.assign(sun.shadow.camera,{left:-90,right:90,top:90,bottom:-90,near:1,far:300});
sun.shadow.bias=-0.0008; scene.add(sun); scene.add(sun.target);
const ov=$('ov'), oc=ov.getContext('2d');
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
  const d=Math.min(devicePixelRatio,2);ov.width=innerWidth*d;ov.height=innerHeight*d;ov.style.width=innerWidth+'px';ov.style.height=innerHeight+'px';oc.setTransform(d,0,0,d,0,0);}
addEventListener('resize',resize); resize();
const ANISO=renderer.capabilities.getMaxAnisotropy();

function canvasTex(size,draw){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=ANISO;return t;}
function speckle(x,w,h,n,cols,a,b){for(let i=0;i<n;i++){x.fillStyle=cols[i%cols.length];x.globalAlpha=rand(.08,.4);const r=rand(a,b);x.fillRect(Math.random()*w,Math.random()*h,r,r);}x.globalAlpha=1;}
const grassTex=canvasTex(512,(x,s)=>{x.fillStyle='#d8d8d0';x.fillRect(0,0,s,s);speckle(x,s,s,14000,['#b8b8ae','#f0f0e8','#a0a096'],1,3);});
grassTex.repeat.set(60,60);
const wallTex=canvasTex(128,(x,s)=>{x.fillStyle='#ffffff';x.fillRect(0,0,s,s);speckle(x,s,s,1500,['#d8d8d8','#eeeeee','#c8c8c8'],1,3);});

