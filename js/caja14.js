/* ---------- Caja del premio de 14 días (pedido de Sebastián, 26/11/2026, con "Container" de Willy Decarpentrie en Sketchfab de referencia) ----------
   Reemplaza el 🎁 de la ruleta del premio diario (tarjeta del tanque especial y el punto del día 14) por un contenedor chico de chapa
   acanalada azul, hecho por código: postes y largueros de acero, puertas con 4 barras de cierre y manijas, franjas amarillas y negras
   arriba, texto pintado y desgaste. Se dibuja una sola vez en un renderer chico aparte y queda como imagen (window.cajaRegaloImg()).
   Va antes de diario.js. */
(function(){
  let URL=null;
  function tex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); draw(g,w,h);
    const t=new THREE.CanvasTexture(c); t.anisotropy=4; return t; }
  // óxido y raspones sobre la pintura
  function wear(g,w,h,n,seed){ let s=seed; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; };
    for(let i=0;i<n;i++){ const x=r()*w, y=r()*h, k=r(); g.fillStyle=k<.5?`rgba(90,60,35,${.15+r()*.3})`:k<.8?`rgba(20,25,35,${.1+r()*.25})`:`rgba(190,200,210,${.12+r()*.2})`;
      g.beginPath(); g.ellipse(x,y,1+r()*5,1+r()*3,r()*3,0,7); g.fill(); }
    const gr=g.createLinearGradient(0,h*.75,0,h); gr.addColorStop(0,'rgba(70,50,30,0)'); gr.addColorStop(1,'rgba(70,50,30,.45)'); g.fillStyle=gr; g.fillRect(0,0,w,h); }
  function build(){
    const G=new THREE.Group(), W=2.3, H=2.3, D=2.3;
    const blue='#2d5f98';
    const M=(o)=>new THREE.MeshStandardMaterial(Object.assign({roughness:.62,metalness:.35},o));
    const paint=M({map:tex(256,256,(g,w,h)=>{ g.fillStyle=blue; g.fillRect(0,0,w,h); wear(g,w,h,260,11); })});
    const steel=M({color:0x3a4f68,roughness:.55,metalness:.5,map:tex(128,128,(g,w,h)=>{ g.fillStyle='#4a6584'; g.fillRect(0,0,w,h); wear(g,w,h,120,5); })});
    const dark=M({color:0x22262c,roughness:.5,metalness:.6});
    const bar=M({color:0x9aa3ab,roughness:.35,metalness:.8});
    const bx=(w,h,d,x,y,z,m,p=G)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); b.position.set(x,y,z); p.add(b); return b; };
    // puertas del frente (z+): chapa pintada con texto
    const door=M({map:tex(512,512,(g,w,h)=>{ g.fillStyle=blue; g.fillRect(0,0,w,h);
      for(let i=0;i<12;i++){ const x=i*w/12; g.fillStyle='rgba(0,0,0,.18)'; g.fillRect(x,0,5,h); g.fillStyle='rgba(255,255,255,.07)'; g.fillRect(x+w/24,0,4,h); }
      g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(w/2-3,0,6,h);
      g.fillStyle='#e9ecef'; g.textAlign='left'; g.font='900 58px Arial,sans-serif'; g.fillText('TARA',40,150);
      g.font='900 116px Arial,sans-serif'; g.fillText('WAR',36,262);
      g.font='600 28px monospace'; g.textAlign='right'; g.fillText('TW 1414',w-30,70); g.fillText('541 433 90',w-30,102); g.fillText('ARGENT',w-30,180);
      g.textAlign='left'; g.font='600 26px monospace'; g.fillText('MAX.GR 14.000',36,h-40);
      wear(g,w,h,520,23); })});
    bx(W-.16,H-.2,.04,0,0,D/2-.02,door);
    // costados y techo acanalados
    const side=M({map:paint.map});
    for(const sx of [-1,1]){ bx(.04,H-.2,D-.16,sx*(W/2-.04),0,0,side); for(let i=0;i<9;i++) bx(.06,H-.24,.1,sx*(W/2-.02),0,-D/2+.22+i*(D-.4)/8,side); }
    bx(W-.16,.04,D-.16,0,H/2-.06,0,side); bx(W-.16,.04,D-.16,0,-H/2+.06,0,dark);
    // nervios verticales de las puertas
    for(let i=0;i<10;i++){ const x=-W/2+.2+i*(W-.4)/9; if(Math.abs(x)<.06) continue; bx(.07,H-.26,.04,x,0,D/2+.01,side); }
    // marco: 4 postes y largueros de arriba/abajo
    for(const sx of [-1,1]) for(const sz of [-1,1]) bx(.16,H,.16,sx*(W/2-.08),0,sz*(D/2-.08),steel);
    for(const sy of [-1,1]){ for(const sz of [-1,1]) bx(W,.16,.16,0,sy*(H/2-.08),sz*(D/2-.08),steel); for(const sx of [-1,1]) bx(.16,.16,D,sx*(W/2-.08),sy*(H/2-.08),0,steel); }
    // esquineros de enganche (cantoneras) con agujero
    for(const sx of [-1,1]) for(const sy of [-1,1]) for(const sz of [-1,1]){ bx(.2,.18,.2,sx*(W/2-.08),sy*(H/2-.08),sz*(D/2-.08),dark); bx(.09,.06,.01,sx*(W/2-.08),sy*(H/2-.08),sz*(D/2+.02),M({color:0x050505})); }
    // franjas amarillas y negras en el larguero de arriba del frente
    const haz=M({map:tex(256,32,(g,w,h)=>{ g.fillStyle='#e6b622'; g.fillRect(0,0,w,h); g.fillStyle='#151515'; for(let x=-h;x<w;x+=28){ g.beginPath(); g.moveTo(x,h); g.lineTo(x+14,h); g.lineTo(x+14+h,0); g.lineTo(x+h,0); g.fill(); } wear(g,w,h,40,3); })});
    for(const sx of [-1,1]) bx(.62,.1,.01,sx*(W/2-.62),H/2-.08,D/2+.005,haz);
    // barras de cierre con guías y manijas
    [-.14,.14,.48,.82].forEach((x,i)=>{ const b=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,H-.3,10),bar); b.position.set(x,0,D/2+.09); G.add(b);
      for(const y of [-.75,0,.75]) bx(.1,.05,.08,x,y,D/2+.05,dark);
      bx(.06,.06,.12,x,H/2-.24,D/2+.07,dark); bx(.06,.06,.12,x,-H/2+.24,D/2+.07,dark);
      const h=bx(.05,.36,.04,x+(i%2?-.1:.1),-.15,D/2+.13,bar); h.rotation.z=i%2?-.15:.15; });
    G.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
    return G; }
  function render(){ if(URL) return URL;
    let r; try{ r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true}); }catch(e){ return null; }
    const S=256; r.setSize(S,S,false); r.setClearColor(0,0); if(typeof renderer!=='undefined'&&renderer) r.outputEncoding=renderer.outputEncoding;
    const sc=new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xeef2f4,0x2a2622,.75));
    const l=new THREE.DirectionalLight(0xfff2dc,1.25); l.position.set(4,6,7); sc.add(l);
    const f=new THREE.DirectionalLight(0x9ab4d8,.45); f.position.set(-6,2,3); sc.add(f);
    const box=build(); box.rotation.y=-.32; sc.add(box);
    const cam=new THREE.PerspectiveCamera(30,1,.1,50); cam.position.set(0,1.9,7.4); cam.lookAt(0,-.05,0);
    r.render(sc,cam); try{ URL=r.domElement.toDataURL('image/png'); }catch(e){ URL=null; }
    sc.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material){ if(o.material.map) o.material.map.dispose(); o.material.dispose(); } });
    r.dispose(); try{ r.forceContextLoss(); }catch(e){}
    return URL; }
  // <img> listo para meter en el HTML (o el 🎁 si no hay WebGL)
  window.cajaRegaloImg=function(px){ const u=render(); return u?`<img src="${u}" alt="🎁" style="width:${px}px;height:${px}px;object-fit:contain;vertical-align:middle;filter:drop-shadow(0 3px 4px rgba(0,0,0,.55))">`:'🎁'; };
})();
