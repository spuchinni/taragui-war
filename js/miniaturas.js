/* ---------- Miniaturas de los vehículos y ficha técnica al pasar el mouse (pantalla de Vehículos) ----------
   Cada tanque se dibuja una vez con su modelo hecho por código en un renderer chico aparte (fondo transparente),
   se guarda como imagen y se reusa. Se dibujan de a uno por cuadro para que el menú no se trabe. */
const mini={r:null,sc:null,cam:null,img:new Map(),cola:[],corriendo:false};
function miniInit(){
  if(mini.r) return true;
  try{ mini.r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true}); }catch(e){ return false; }
  mini.r.setSize(560,315,false); mini.r.setClearColor(0x000000,0); mini.r.outputEncoding=renderer.outputEncoding;
  mini.sc=new THREE.Scene();
  mini.sc.add(new THREE.HemisphereLight(0xeef2f4,0x3a342a,.9));
  const s=new THREE.DirectionalLight(0xfff0d8,1.05); s.position.set(6,9,7); mini.sc.add(s);
  const f=new THREE.DirectionalLight(0xc8d4e0,.35); f.position.set(-6,3,-5); mini.sc.add(f);
  mini.cam=new THREE.PerspectiveCamera(26,560/315,.1,200);
  return true;
}
function miniDibujar(key){
  const t=introTank(key); mini.sc.add(t.root); t.turret.rotation.y=-.35;
  const B=new THREE.Box3().setFromObject(t.root), c=B.getCenter(new THREE.Vector3()), sz=B.getSize(new THREE.Vector3());
  const r=Math.max(sz.x,sz.z*.85,sz.y*1.6)*1.05, d=r/Math.tan(mini.cam.fov*Math.PI/360)*.4;
  mini.cam.position.set(c.x+d*.78,c.y+d*.36,c.z+d*.62); mini.cam.lookAt(c.x,c.y-sz.y*.05,c.z);
  mini.r.render(mini.sc,mini.cam); const url=mini.r.domElement.toDataURL('image/png');
  mini.sc.remove(t.root); t.root.traverse(o=>{ if(o.geometry) o.geometry.dispose(); });
  return url;
}
function miniTick(){
  const k=mini.cola.shift(); if(!k){ mini.corriendo=false; return; }
  if(!mini.img.has(k)){ try{ mini.img.set(k,miniDibujar(k)); }catch(e){ console.warn('miniatura',k,e); mini.img.set(k,''); } }
  const u=mini.img.get(k); if(u) document.querySelectorAll(`img.vmini[data-k="${k}"]`).forEach(i=>{ i.src=u; i.classList.add('ok'); });
  if($('vficha')&&$('vficha').dataset.k===k) vfichaImg(k);
  requestAnimationFrame(miniTick);
}
// Pide las miniaturas de una lista de vehículos (las que ya están se ponen enseguida)
function miniPedir(keys){
  if(!miniInit()) return;
  for(const k of keys){ if(mini.img.has(k)){ const u=mini.img.get(k); if(u) document.querySelectorAll(`img.vmini[data-k="${k}"]`).forEach(i=>{ i.src=u; i.classList.add('ok'); }); } else if(!mini.cola.includes(k)) mini.cola.push(k); }
  if(!mini.corriendo&&mini.cola.length){ mini.corriendo=true; requestAnimationFrame(miniTick); }
}
const miniHTML=k=>`<img class="vmini" data-k="${k}" alt="" draggable="false">`;
// Ficha técnica grande al pasar el mouse por una fila
function vfichaImg(k){ const i=$('vficha')&&$('vficha').querySelector('img'); const u=mini.img.get(k); if(i&&u){ i.src=u; i.classList.add('ok'); } }
function vficha(k,row){
  let F=$('vficha'); if(!F){ F=document.createElement('div'); F.id='vficha'; document.body.appendChild(F); }
  const V=VEH[k], A=V.armor, pen=Math.max(...(V.ammo||[{pen:V.pen}]).map(a=>a.pen)), N=NATIONS[V.nation];
  F.dataset.k=k;
  F.innerHTML=`<img alt="">
    <div class="vfN">${V.label}</div><div class="vfS">${N?N.label+' · ':''}${CLS_ES[V.cls]||V.cls}${V.year?' · '+V.year:''} · Rango ${RANK_ROMAN[rankOf(k)]} · BR ${brTxt(V.br)}</div>
    <div class="vfG"><span>Velocidad</span><b>${Math.round(V.maxF*3.6)} km/h</b><span>Tripulación</span><b>${V.crewReal||V.crew||V.seats.length}</b>
      <span>Penetración</span><b>${pen} mm</b><span>Pendiente máx.</span><b>${Math.round(climbOf(V)*180/Math.PI)}°</b><span>Recarga</span><b>${V.reload} s</b>
      <span>Blindaje casco</span><b>${A.hull.front} / ${A.hull.side} / ${A.hull.rear} mm</b><span>Blindaje torre</span><b>${A.turret.front} / ${A.turret.side} / ${A.turret.rear} mm</b>
      ${V.trench?`<span>Cruza trincheras</span><b>${String(V.trench).replace('.',',')} m</b>`:''}</div>
    ${V.ammo?`<div class="vfA">${V.ammo.map(a=>`${a.n} <small>(${KIND_ES[a.kind]||a.kind}, ${a.pen} mm)</small>`).join('<br>')}</div>`:''}
    <p>${V.desc||''}</p><small class="vfF">Blindaje: frente / costado / atrás</small>`;
  vfichaImg(k); miniPedir([k]);
  const R0=row.getBoundingClientRect(), P=row.closest('.side'), PR=P?P.getBoundingClientRect():R0, R={left:PR.left,right:PR.right,top:R0.top}, W=Math.min(380,innerWidth-24); F.style.width=W+'px'; F.hidden=false;
  const x=R.right+12+W<=innerWidth?R.right+12:R.left-12-W>=0?R.left-12-W:Math.max(12,innerWidth-W-12);
  F.style.left=x+'px'; F.style.top=Math.max(12,Math.min(R.top,innerHeight-F.offsetHeight-12))+'px';
}
function vfichaOff(){ const F=$('vficha'); if(F) F.hidden=true; }
