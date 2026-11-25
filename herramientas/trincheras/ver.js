// Fotos de las trincheras para comparar (Chromium sin pantalla). Servir el repo en :8771.
// node herramientas/trincheras/ver.js <mapa> '<js de cámaras>'  → herramientas/trincheras/fotos/<mapa>-N.jpg
// El js de cámaras devuelve una lista [[cx,cy,cz, tx,ty,tz], ...] (puede usar zones, W, heightAt).
const {chromium}=require('playwright'); const fs=require('fs'); const D=__dirname;
const MAP=process.argv[2]||'somme', CAMS=process.argv[3]||'[]', OUT=D+'/fotos';
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const p=await (await b.newContext({viewport:{width:1280,height:720}})).newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 await p.addInitScript(()=>{ try{ localStorage.setItem('tw_settings',JSON.stringify({gfx:'alta'})); }catch(e){} });
 await p.route(/^https?:\/\/(?!localhost)/,r=>r.abort());
 await p.goto('http://localhost:8771/?lang=es&evento=1',{waitUntil:'load',timeout:120000}); await p.waitForTimeout(3000);
 const info=await p.evaluate(({MAP})=>{ introEnd(); PROG.train=0; PROG.stats.battles=20; window.requestAnimationFrame=()=>0; markZone=()=>{}; banner=()=>{};
  window.RENDER=renderer.render.bind(renderer); renderer.render=()=>{};
  const t0=performance.now(); startBattle(true,MAP); const g=document.getElementById('briefGo'); if(g) g.click(); const ms=performance.now()-t0;
  for(const t of [...tanks]) removeTank(t); applyWeather('dia'); renderer.setPixelRatio(1); renderer.setSize(1280,720,false); camera.aspect=16/9; camera.updateProjectionMatrix();
  for(let i=0;i<10;i++) frame(1/30);
  return {ms:Math.round(ms),zones:zones.map(Z=>[Z.id,Math.round(Z.x),Math.round(Z.z),Z.r]),posts:(W.posts||[]).length,segs:(W.trenchSegs||[]).length}; },{MAP});
 console.log(JSON.stringify(info));
 const shots=await p.evaluate(CAMS=>{ const L=eval(CAMS), out=[]; for(const c of L){ camera.position.set(c[0],c[1],c[2]); camera.lookAt(c[3],c[4],c[5]); camera.updateMatrixWorld();
   if(typeof cullUpdate==='function') try{ cullUpdate(); }catch(e){} frame(1/30); camera.position.set(c[0],c[1],c[2]); camera.lookAt(c[3],c[4],c[5]); camera.updateMatrixWorld(); if(typeof cullUpdate==='function') try{ cullUpdate(); }catch(e){} RENDER(scene,camera);
   const I=renderer.info.render; out.push({d:renderer.domElement.toDataURL('image/jpeg',.9),calls:I.calls,tri:I.triangles}); } return out; },CAMS);
 fs.mkdirSync(OUT,{recursive:true}); shots.forEach((s,i)=>{ fs.writeFileSync(`${OUT}/${MAP}-${i}.jpg`,Buffer.from(s.d.split(',')[1],'base64')); console.log(i,'llamadas',s.calls,'triángulos',s.tri); });
 console.log(errs.slice(0,6).join('\n')||'sin errores'); await b.close();
})();
