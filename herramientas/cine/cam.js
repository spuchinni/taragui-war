// Camarógrafo: corre una batalla de bots en un mapa de la 1ª Guerra y filma tomas de cine con el motor del juego.
// node cam.js <preview|full> ; salida en ./frames/<toma>/NNNN.jpg y ./sonido.json
const {chromium}=require('playwright'); const fs=require('fs'); const D=__dirname, MODE=process.argv[2]||'preview';
const FPS=30, W=1280, H=720;
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage({viewport:{width:W,height:H}}); await p.route(/three\.min\.js/,r=>r.fulfill({path:process.env.THREE_JS||D+'/three.min.js',contentType:'application/javascript'}));
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{ try{ localStorage.setItem('tw_settings',JSON.stringify({gfx:'alta'})); }catch(e){} });
 await p.goto('http://localhost:8766/'); await p.waitForTimeout(2500);
 await p.evaluate(({W,H})=>{
  introEnd(); window.requestAnimationFrame=()=>0; // el bucle lo manejamos nosotros
  initAudio(); markZone=()=>{}; whistle=()=>{};
  window.LOG=[]; window.REC=null; const sf=sfx; sfx=(n,pos,v=1,o={})=>{ if(REC!=null){ const d=pos?pos.distanceTo(camera.position):0; LOG.push({t:REC,n,v:v*(o.near||!pos?1:Math.min(1,18/Math.max(18,d))),r:o.rate||1}); } return sf(n,pos,v,o); };
  renderer.setPixelRatio(1); renderer.setSize(W,H,false); camera.aspect=W/H; camera.updateProjectionMatrix(); applyGfx&&0;
  // batalla de bots: Reino Unido contra el Imperio alemán en el Somme
  let a=7; Math.random=()=>{a=(a+0x6D2B79F5)>>>0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296;}; // misma batalla cada vez
  let k=0; do{ startBattle(true,'somme'); k++; } while((allyNation!=='uk'||foeNation!=='de')&&k<40); applyWeather('dia');
  $('briefGo').click(); aerial=false; window.CAM=null; spectatorCam=()=>{ if(CAM) CAM(); return true; };
  renderer.setSize(W,H,false); camera.aspect=W/H; camera.fov=40; camera.updateProjectionMatrix();
  window.RENDER=renderer.render.bind(renderer); renderer.render=()=>{};
  window.step=(n,dt)=>{ for(let i=0;i<n;i++) frame(dt); };
  window.shot=()=>{ RENDER(scene,camera); return renderer.domElement.toDataURL('image/jpeg',.93); };
 },{W,H});
 console.log('aliados',await p.evaluate(()=>allyNation+' vs '+foeNation+' · '+builtKey));
 await p.evaluate(()=>step(900,1/20)); // 45 s de batalla para que se acerquen
 const info=await p.evaluate(()=>tanks.filter(t=>!t.dead).map(t=>`${t.id}:${t.key}:${t.team}:${Math.round(t.pos.x)},${Math.round(t.pos.z)}${t.target?' →'+t.target.id:''}`).join(' | '));
 console.log(info);
 const TOMAS=require(D+'/tomas.js');
 const snd=[]; let t0=0;
 for(const T of TOMAS){
  const n=Math.round(T.dur*FPS); fs.mkdirSync(`${D}/frames/${T.id}`,{recursive:true});
  if(T.pre) await p.evaluate(`step(${Math.round(T.pre*20)},1/20)`);
  const ok=await p.evaluate(T.setup); if(!ok){ console.log('toma',T.id,'sin protagonista'); continue; }
  const idx=MODE==='preview'?[0,Math.floor(n/2),n-1]:[...Array(n).keys()];
  await p.evaluate(()=>{ LOG.length=0; });
  for(let f=0;f<n;f++){
   const u=f/(n-1);
   const url=await p.evaluate(([u,f,rec])=>{ REC=rec; CAM_U=u; if(window.ON_F) ON_F(f); frame(1/30); return null; },[u,f,f/FPS]);
   if(idx.includes(f)){ const d=await p.evaluate(()=>{ CAM(); return shot(); }); fs.writeFileSync(`${D}/frames/${T.id}/${String(f).padStart(4,'0')}.jpg`,Buffer.from(d.split(',')[1],'base64')); }
  }
  const L=await p.evaluate(()=>LOG.splice(0)); snd.push({id:T.id,t0,dur:T.dur,log:L}); t0+=T.dur;
  console.log('toma',T.id,'ok',n,'cuadros, sonidos',L.length);
  await p.evaluate(()=>{ REC=null; ON_F=null; });
 }
 fs.writeFileSync(D+'/sonido.json',JSON.stringify(snd));
 console.log(errs.join('\n')||'sin errores'); await b.close();
})();
