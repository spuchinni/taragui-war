// Prueba rápida de un mapa real desde la consola del navegador:
//   const s=document.createElement('script'); s.src='herramientas/osm/probar.js'; document.head.appendChild(s);
//   await probar('centro')   -> arma la partida, despliega un tanque de la Guerra Fría y mide fps, triángulos y llamadas
window.probar=async(mapa,sp=0)=>{
  try{ introEnd(); }catch(e){} const iu=document.getElementById('introUI'); if(iu) iu.style.display='none';
  const t0=performance.now(); startBattle(false,mapa,null,true); const tb=Math.round(performance.now()-t0);
  const ks=Object.keys(VEH).filter(k=>(VEH[k].era||5)===5&&!VEH[k].uses&&!VEH[k].static).slice(0,4);
  playerCrew.lineup=ks; playerCrew.sp=9999; selKey=ks[3]; selSp=sp; doDeploy(); await new Promise(r=>setTimeout(r,1500));
  let n=0; const t1=performance.now(); await new Promise(res=>{ const f=()=>{ n++; if(performance.now()-t1<5000) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
  const I=renderer.info.render;
  const chk=[...W.zones.map(z=>['zona '+z.label,z.x,z.z]),...W.sp[0].map(s=>['base0 '+s.label,s.x,s.z]),...W.sp[1].map(s=>['base1 '+s.label,s.x,s.z])]
    .map(([l,x,z])=>l+': h='+heightAt(x,z).toFixed(1)+(W.water!==undefined&&heightAt(x,z)<W.water+.3?' AGUA':'')+' casas='+gridQuery(x,z,10).length+(nodes?' nodo a '+Math.round(nearestNode(x,z).p.distanceTo(new THREE.Vector3(x,0,z)))+' m':''));
  return {tb,fps:Math.round(n/5),tris:I.triangles,calls:I.calls,edificios:buildings.length,arboles:trees.length,chk};
};
// cámara aérea para mirar el mapa: probarVista(x,z,alto,dirección)
window.probarVista=(x,z,h=120,yaw=0)=>{ state='spectate'; camera.position.set(x,heightAt(x,z)+h,z); camera.lookAt(x+Math.sin(yaw)*h*1.5,heightAt(x,z),z+Math.cos(yaw)*h*1.5); cullUpdate(); renderer.render(scene,camera); };
// todos los mapas reales seguidos: tiempo de armado, edificios, y zonas/bases en el agua o lejos de las calles
window.probarTodos=async()=>{ const out={}; for(const k of Object.keys(OSM_CFG)){ try{ const r=await probar(k); out[k]={tb:r.tb,ed:r.edificios,arb:r.arboles,mal:r.chk.filter(c=>/AGUA|casas=[1-9]|nodo a [1-9]\d\d/.test(c))}; }catch(e){ out[k]={error:String(e.stack||e).slice(0,400)}; } } return out; };
// cámara libre para mirar el mapa (la del juego sigue andando por debajo): vista(x,z,alto,rumbo,inclinación); vista(null) vuelve a la normal
window.vista=(x,z,h,yaw,pitch=.5)=>{ if(!window._rend){ window._rend=renderer.render.bind(renderer); window.cam2=camera.clone(); const fr=new THREE.Frustum(), pm=new THREE.Matrix4();
    renderer.render=(s,c)=>{ if(window.useCam2&&c===camera){ cam2.updateMatrixWorld(); pm.multiplyMatrices(cam2.projectionMatrix,cam2.matrixWorldInverse); fr.setFromProjectionMatrix(pm);
      for(const q of cullList){ const d=q.s.center.distanceTo(cam2.position)-q.s.radius, v=d<1500&&d<q.maxD&&fr.intersectsSphere(q.s); if(q.lod){ const near=d<q.lod.d; q.o.visible=v&&near; q.lod.m.visible=v&&!near; } else q.o.visible=v; }
      return _rend(s,cam2); } return _rend(s,c); }; }
  if(x===null){ window.useCam2=false; return; } useCam2=true; const y=heightAt(x,z)+h; cam2.position.set(x,y,z); cam2.lookAt(x+Math.sin(yaw)*100,y-Math.tan(pitch)*100,z+Math.cos(yaw)*100); cam2.far=4000; cam2.updateProjectionMatrix(); scene.fog.far=2000; scene.fog.near=600; };
