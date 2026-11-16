// Filma las tomas de intro2-tomas.js con el motor del juego (Chromium sin pantalla).
// Servir el repo en :8771 y correr: node herramientas/cine/filmar2.js <preview|full> [toma ...]
// Salida: herramientas/cine/frames2/<toma>/NNNN.jpg (2560×1440: se achica al armar, así no hay serrucho) y sonido2.json.
const {chromium}=require('playwright'); const fs=require('fs'); const D=__dirname;
const MODE=process.argv[2]||'preview', ONLY=process.argv.slice(3), FPS=30, SS=+(process.env.SS||2), W=1280*SS, H=720*SS;
const TOMAS=require(D+'/intro2-tomas.js').filter(T=>!ONLY.length||ONLY.includes(T.id));
const HELP=`
window.V3=(x,y,z)=>new THREE.Vector3(x,y,z); window.lerp=(a,b,u)=>a+(b-a)*u; window.ease=u=>u*u*(3-2*u);
window.ground=(x,z)=>heightAt(x,z); window.fov=f=>{ camera.fov=f; camera.updateProjectionMatrix(); };
window.rel=(t,x,y,z)=>{ const s=Math.sin(t.heading), c=Math.cos(t.heading); return V3(t.pos.x+x*c+z*s, t.pos.y+y, t.pos.z-x*s+z*c); };
// lugar abierto cerca de un punto (dz corre hacia el norte/sur; libre de edificios en 14 m)
window.spot=(i,dz=0,far,clr=14)=>{ const Z=zones[Math.min(i,zones.length-1)]; let best=null;
  for(let k=0;k<200&&!best;k++){ const r=k*1.5, a=k*2.4, x=Z.x+Math.cos(a)*r, z=Z.z+dz+Math.sin(a)*r; if(W.water!=null&&ground(x,z)<(W.water||0)+.3) continue;
    if(buildings.some(b=>b.hp>0&&Math.abs(b.x-x)<b.w/2+clr&&Math.abs(b.z-z)<b.d/2+clr)) continue; if(W.trench&&[[0,0],[6,0],[-6,0],[0,6],[0,-6]].some(([a,b])=>W.trench(x+a,z+b))) continue; if(far&&trees.some(tr=>!tr.fallen&&Math.hypot(tr.x-x,tr.z-z)<(far===true?16:far))) continue; best={x,z}; }
  return best||{x:Z.x,z:Z.z}; };
window.act=(k,team,x,z,h)=>{ const c=newCrew('',team,VEH[k].nation,false); c.out=true; crews.push(c); const t=spawnCrew(c,k,{label:'',x,z});
  t.pos.set(x,ground(x,z),z); t.heading=h; t.root.position.copy(t.pos); t.dummy=true; t.immuneT=0; t.cine={th:0,st:0}; t.gunPitch=0; t.turretYaw=0; t.turret.rotation.y=0; t.gunPivot.rotation.x=0; return t; };
window.shoot=t=>{ t.reloadT=0; t.ammo&&t.ammo.forEach&&0; try{ fireGun(t); }catch(e){ console.warn('shoot',e.message); } };
window.squad=(team,nat,x,z,gx,gz,n=6)=>{ const L=[]; for(let i=0;i<n;i++){ const P=makePerson(i===1?'at':'rifle',team,x+rand(-5,5),z+rand(-5,5)); P.goal={x:gx+rand(-4,4),z:gz+rand(-4,4)}; P.noEmb=now+99; L.push(P); } return L; };
// nuke: el B-29 entra por 'dir' y la bomba cae en p (como callNuke, sin costo ni regla de época)
window.nukeAt=(by,p,dir)=>{ const S=RULE().sup, o=S.nuke, foe=1-by.team, a=W.sp[foe], h=W.sp[by.team]; S.nuke=1; by.crew.sp=1e6;
  W.sp[foe]=[{x:p.x/.85,z:p.z/.85}]; W.sp[by.team]=[{x:p.x-dir.x*600,z:p.z-dir.z*600}]; nuke=null; try{ callNuke(by); } finally{ S.nuke=o; W.sp[foe]=a; W.sp[by.team]=h; } return nuke; };
window.boom=p=>{ try{ explode(p,'ground',1.3); try{ groundHit(p,{kind:'he',sc:1.6}); }catch(e){} for(let i=0;i<5;i++) puff(p.clone().add(V3(rand(-3,3),rand(.5,3),rand(-3,3))),0x6e5e48,rand(5,8),rand(1.5,2.5),1.6,.8); sfx('expl',p,1.2,{rate:rand(.8,1)}); if(typeof addCrater==='function') addCrater(p,3); }catch(e){ console.warn('boom',e.message); } };
`;
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
 const p=await (await b.newContext({viewport:{width:1280,height:720}})).newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'||/shoot|boom/.test(m.text())) errs.push(m.text()); });
 await p.addInitScript(()=>{ try{ localStorage.setItem('tw_settings',JSON.stringify({gfx:'alta'})); }catch(e){} });
 await p.route(/^https?:\/\/(?!localhost)/,r=>r.abort());
 await p.goto('http://localhost:8771/?lang=es&evento=1',{waitUntil:'load',timeout:120000}); await p.waitForTimeout(4000);
 await p.evaluate(({RW,RH,HELP})=>{ eval(HELP); introEnd(); PROG.train=0; PROG.stats.battles=20; window.requestAnimationFrame=()=>0; initAudio();
  markZone=()=>{}; finish=()=>{}; banner=()=>{}; hitMsg=()=>{}; groundDecal=()=>{}; window._addCr=addCrater; addCrater=()=>{}; // los calcos de cráter salen como cuñas negras de costado con swiftshader
  if(typeof whistle==='function') whistle=()=>{};
  window.LOG=[]; window.REC=null; const sf=sfx; sfx=function(n,pos,v=1,o={}){ if(REC!=null){ const d=pos?pos.distanceTo(camera.position):0; LOG.push({t:REC,n,v:v*(o.near||!pos?1:Math.min(1,25/Math.max(25,d))),r:o.rate||1}); } return sf.apply(this,arguments); };
  const _dr=drive; drive=function(t,th,st,dt){ if(t.cine){ th=t.cine.th; st=t.cine.st; } return _dr.call(this,t,th,st,dt); };
  window.RENDER=renderer.render.bind(renderer); renderer.render=()=>{};
  window.setMap=(map,wx)=>{ startBattle(true,map); const g=document.getElementById('briefGo'); if(g) g.click(); for(const t of [...tanks]) removeTank(t);
    if(typeof infantry!=='undefined') for(const P of [...infantry]) try{ removeInf(P); }catch(e){}
    applyWeather(wx||'dia'); { const M=new Set(zones.map(Z=>Z.mat)); worldGroup.children.forEach(o=>{ if(M.has(o.material)||(o.geometry&&o.geometry.type==='CylinderGeometry'&&zones.some(Z=>Math.abs(o.position.x-Z.x)<.01&&Math.abs(o.position.z-Z.z)<.01))) o.visible=false; }); } aerial=false; window.CAM=null; spectatorCam=()=>{ if(CAM) CAM(); return true; };
    renderer.setPixelRatio(1); renderer.setSize(RW,RH,false); camera.aspect=16/9; camera.updateProjectionMatrix(); return builtKey; };
  window.shot=()=>{ CAM(); RENDER(scene,camera); return renderer.domElement.toDataURL('image/jpeg',.92); };
 },{RW:W,RH:H,HELP});
 const snd=[]; let cur=null;
 for(const T of TOMAS){
  const dur=T.ed[1]-T.ed[0], n=Math.round(dur*FPS)+1;
  // un mapa nuevo por toma: así cada una arranca limpia (sin humo, cráteres ni restos de la anterior)
  const k=T.keep?cur:await p.evaluate(({m,w})=>setMap(m,w),{m:T.map,w:T.wx}); cur=T.map;   // keep: sigue la misma simulación de la toma anterior (la nuke)
  const ok=await p.evaluate(`(()=>{ window.ON_T=null; window.CAM_U=0; window.CAM_T=0; const r=${T.setup}; for(let i=0;i<(window.WARM??20);i++){ window.REC=null; frame(1/30); } window.WARM=null; return r; })()`);
  if(!ok){ console.log('toma',T.id,'falló'); continue; }
  fs.rmSync(`${D}/frames2/${T.id}`,{recursive:true,force:true}); fs.mkdirSync(`${D}/frames2/${T.id}`,{recursive:true});
  const idx=MODE==='preview'?[0,Math.floor(n/2),n-1]:null;
  await p.evaluate(()=>{ LOG.length=0; });
  for(let f=0;f<n;f++){
   const tt=f/FPS;
   await p.evaluate(([u,tt])=>{ REC=tt; CAM_U=u; CAM_T=tt; if(window.ON_T) ON_T(tt); frame(1/30); },[f/(n-1),tt]);
   if(!idx||idx.includes(f)){ const d=await p.evaluate(()=>shot()); fs.writeFileSync(`${D}/frames2/${T.id}/${String(f).padStart(4,'0')}.jpg`,Buffer.from(d.split(',')[1],'base64')); }
  }
  if(process.env.DBG2) console.log(T.id, await p.evaluate(()=>JSON.stringify(scene.children.filter(o=>o.position.y>50&&o.type==='Group').map(o=>({y:o.position.y|0,x:o.position.x|0,z:o.position.z|0,n:o.children.length,np:!!(nuke&&nuke.plane&&nuke.plane.g===o),pl:planes.some(P=>P.g===o)})))));
  if(process.env.DBG) console.log(await p.evaluate(()=>{ CAM(); camera.updateMatrixWorld(); const rc=new THREE.Raycaster(); rc.setFromCamera({x:.5,y:.5},camera); const h=rc.intersectObjects(scene.children,true).slice(0,3); return JSON.stringify({cam:camera.position,hits:h.map(x=>({d:x.distance.toFixed(1),t:x.object.type,g:x.object.geometry&&x.object.geometry.type,c:x.object.material&&x.object.material.color&&x.object.material.color.getHexString(),p:x.object.parent&&x.object.parent.type}))}); }));
  const L=await p.evaluate(()=>{ REC=null; return LOG.splice(0); }); snd.push({id:T.id,log:L});
  console.log('toma',T.id,k,n,'cuadros, sonidos',L.length);
 }
 if(MODE==='full'){ const F=D+'/sonido2.json', old=fs.existsSync(F)?JSON.parse(fs.readFileSync(F)):[]; const m=new Map(old.map(s=>[s.id,s])); snd.forEach(s=>m.set(s.id,s)); fs.writeFileSync(F,JSON.stringify([...m.values()])); }
 console.log(errs.slice(0,8).join('\n')||'sin errores'); await b.close();
})();
