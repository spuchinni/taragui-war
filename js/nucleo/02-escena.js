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
// Detalle del suelo (img/suelo/suelo.png, hecha con herramientas/suelo/texturas.py): en gris, un canal por material
// (R tierra, G pasto, B arena, A roca). Se elige según el color del mapa pintado (verde = pasto, claro = arena)
// y la pendiente (empinado = pared de tierra con vetas). De lejos el detalle se aplana para que no se vean rayas.
let _suelo=null; const sueloTex=()=>_suelo||(_suelo=(()=>{ const t=new THREE.TextureLoader().load('img/suelo/suelo.png'+(window.GAME_V?'?v='+GAME_V:'')); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=Math.min(4,ANISO); return t; })());
function groundDetail(mat){
  mat.onBeforeCompile=sh=>{ sh.uniforms.sD={value:sueloTex()};
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp; varying float vNy;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n vWp=(modelMatrix*vec4(transformed,1.)).xyz; vNy=normalize(mat3(modelMatrix)*objectNormal).y;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWp; varying float vNy; uniform sampler2D sD;')
      .replace('#include <map_fragment>',`#include <map_fragment>
 { vec3 c=diffuseColor.rgb;
   float gr=clamp((c.g-max(c.r,c.b)*.95)*12.,0.,1.), br=clamp((dot(c,vec3(.333))-.52)*5.,0.,1.);
   vec4 n=texture2D(sD,vWp.xz*.31), f=texture2D(sD,vWp.xz*.043+.37);
   float d=mix(mix(n.r,n.b,br),n.g,gr)*(.6+.4*f.r/.6);              // dos escalas: que no se note la repetición
   d=mix(d,texture2D(sD,vec2(vWp.x+vWp.z,vWp.y)*.33).a,smoothstep(.82,.55,vNy)); // pendiente fuerte: vetas de tierra
   d=mix(.6,d,clamp(1.25-distance(vWp,cameraPosition)/160.,.35,1.)); // de lejos, más parejo
   diffuseColor.rgb*=d*1.42; }`); };
  return mat; }
const wallTex=canvasTex(128,(x,s)=>{x.fillStyle='#ffffff';x.fillRect(0,0,s,s);speckle(x,s,s,1500,['#d8d8d8','#eeeeee','#c8c8c8'],1,3);});

