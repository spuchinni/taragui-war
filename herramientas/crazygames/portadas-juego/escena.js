// Saca escena.jpg desde el juego (servidor local en :8766 con el repo, three.js de npm en ./package). Ejemplo de la toma usada:
// node escena.js '{"calm":1,"wx":"tarde","cam":{"x":206.5,"y":1.3,"z":-307,"lx":204,"ly":2.2,"lz":-326},"tanks":[{"key":"m4a1","nat":"ru","team":0,"x":204,"z":-326,"at":"pz4h"},{"key":"pz4h","nat":"de","team":1,"x":240,"z":-290,"at":"m4a1"},{"key":"tiger1","nat":"de","team":1,"x":182,"z":-384,"at":"m4a1","dead":1},{"key":"nahuel","nat":"ar","team":0,"x":220,"z":-346,"at":"pz4h"}],"wait":9000,"out":"escena.png"}'
const {chromium}=require('playwright');const fs=require('fs');
const S=JSON.parse(process.argv[2]||'{}');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:1920,height:1080}});
 await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync('package/build/three.min.js'),contentType:'application/javascript'}));
 await p.route(/gstatic|crazygames\.com|googleapis|firebase|peerjs/,r=>r.abort());
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{try{localStorage.setItem('tw2_pasto','no')}catch(e){}});
 await p.goto('http://localhost:8766/index.html?lang=en&plataforma=crazygames',{waitUntil:'load'});await p.waitForTimeout(3000);
 await p.evaluate(()=>{ try{localStorage.setItem('tw2_coach','1');}catch(e){} });
 await p.getByText(/^play now$/i).first().click();
 await p.waitForFunction(()=>state==='play',null,{timeout:60000});
 await p.addStyleTag({content:'.hud,#mm,#status,#ammobar,#coachC,#coachCard,#fsBtn,#tabB,#hcBox,#specBar,#crosshair,canvas:not(:first-of-type){display:none!important} body *:not(canvas){visibility:hidden} canvas{visibility:visible!important}'});
 await p.evaluate((S)=>{
   if(S.calm){ fireGun=function(){}; fireMG=function(){}; if(typeof infHit==='function') infHit=function(){return false;}; }
   applyWeather(S.wx||'tarde'); drawOverlay=function(){ const c=document.getElementById('ov')||null; }; 
   for(const cv of document.querySelectorAll('canvas')) if(cv!==renderer.domElement) cv.style.display='none';
   const ally=crews.find(c=>c.team===0&&!c.isPlayer), foe=crews.find(c=>c.team===1);
   const H=(a,b)=>Math.atan2(b.x-a.x,b.z-a.z);
   const L=S.tanks; window._cv={L:[]};
   for(const d of L){ const c=d.nat?newCrew('Cover',d.team,d.nat,false):(d.team?foe:ally); if(d.cam) c.cams={[d.key]:d.cam}; const t=makeTank(c,d.key,d.x,d.z,0); t.hp=1e9; t.immuneT=1e9; if(d.ty!=null) t.turretYaw=d.ty; window._cv.L.push([t,d]); }
   for(const [t,d] of window._cv.L){ const o=window._cv.L.find(([u,e])=>e.key===d.at); d.h=d.h!=null?d.h:(o?H(d,o[1]):0); }
   const P=S.cam;
   chaseCam=function(){ for(const [t,d] of window._cv.L){ t.pos.set(d.x,heightAt(d.x,d.z),d.z); t.heading=d.h; t.speed=0; t.goal=null; t.path=null; placeOnGround(t,1); if(d.ty!=null) t.turretYaw=d.ty;
       const o=window._cv.L.find(([u,e])=>e.key===d.at); if(o){ t.target=o[0]; } }
     player.pos.set(P.x+400,heightAt(P.x+400,P.z),P.z);
     const y=heightAt(P.x,P.z)+P.y; camera.position.set(P.x,y,P.z); camera.lookAt(P.lx,heightAt(P.lx,P.lz)+P.ly,P.lz); };
   window._kill=()=>{ for(const [t,d] of window._cv.L) if(d.dead){ t.hp=0; t.immuneT=0; try{destroy(t,null,d.dead===2);}catch(e){console.log(e.message)} } };
   window._fire=()=>{ for(const [t,d] of window._cv.L) if(d.fire){ t.reloadT=0; try{fireGun(t);}catch(e){} } };
 },S);
 await p.evaluate(()=>{ _kill(); rightDown=true; }); await p.waitForTimeout(S.wait||8000);
 await p.evaluate(()=>_fire()); await p.waitForTimeout(S.after||300);
 await p.screenshot({path:S.out||'g/cover.png'});
 console.log(errs.slice(0,5));
 await b.close();})();
