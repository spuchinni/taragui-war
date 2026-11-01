/* ---------- Rendimiento: detalle de los tanques según la distancia (pedido de Sebastián: "iba muy lento") ----------
   Cada tanque son ~150 piezas sueltas (ruedas, remaches, ganchos, periscopios...), casi todas con sombra: 15 tanques ≈ 2.200 llamadas de
   dibujo más otras tantas en la sombra, aunque estén a 400 m y se vean del tamaño de un botón. Ahora:
   - piezas chicas (radio < 28 cm): se dibujan hasta ~110 m y hacen sombra hasta ~45 m;
   - piezas grandes (casco, torre, cañón, orugas): siempre se dibujan y hacen sombra hasta ~220 m.
   La distancia se corrige con el zoom de la mira (con aumento se ve todo). No se toca `visible` (lo usa el juego): las piezas lejanas
   pasan a la capa 1, que la cámara y la sombra no dibujan. Los colisionadores (userData.tank) no se tocan. */
const LOD_R=.28, LOD_DET=110, LOD_DSH=45, LOD_BSH=220, _ldS=new THREE.Vector3(), _ldSph=new THREE.Sphere();
function lodScan(t){ const det=[], big=[]; t.root.updateMatrixWorld(true);
  t.root.traverse(o=>{ if(!o.isMesh||!o.geometry||(o.userData&&o.userData.tank)) return; const g=o.geometry; if(!g.boundingSphere) g.computeBoundingSphere();
    o.getWorldScale(_ldS); const r=g.boundingSphere.radius*Math.max(_ldS.x,_ldS.y,_ldS.z); if(o._cs0===undefined) o._cs0=o.castShadow; (r<LOD_R?det:big).push(o); });
  t._lod={det,big,t:5,lv:-1}; }
function lodSet(t,lv){ const L=t._lod; if(L.lv===lv) return; L.lv=lv;                                                             // 0 cerca · 1 medio · 2 lejos · 3 muy lejos
  for(const o of L.det){ if(lv>=2) o.layers.set(1); else o.layers.set(0); o.castShadow=o._cs0&&lv===0; }
  for(const o of L.big){ o.layers.set(0); o.castShadow=o._cs0&&lv<3; } }
function lodUpdate(dt){ const cp=camera.position, z=Math.min(1,camera.fov/60);
  for(const t of tanks){ if(!t.root) continue; if(!t._lod) lodScan(t); const L=t._lod; L.t-=dt; if(L.t<=0){ L.lv=-1; lodScan(t); }                    // de vez en cuando: piezas nuevas o caídas
    const d=t===player?0:t.pos.distanceTo(cp)*z; lodSet(t,d<LOD_DSH?0:d<LOD_DET?1:d<LOD_BSH?2:3); } }
{ let last=performance.now(); const _cu=cullUpdate; cullUpdate=function(){ const r=_cu.apply(this,arguments); const n=performance.now(), dt=Math.min(.5,(n-last)/1000); last=n;
    try{ if(tanks.length) lodUpdate(dt); }catch(e){ console.error(e); } return r; }; }
