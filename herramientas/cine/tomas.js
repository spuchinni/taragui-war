// Tomas del video: cada una elige un protagonista y define CAM() (usa CAM_U: 0→1 a lo largo de la toma)
const H=`
window.V3=(x,y,z)=>new THREE.Vector3(x,y,z);
window.rel=(t,x,y,z)=>{ const s=Math.sin(t.heading), c=Math.cos(t.heading); return V3(t.pos.x+x*c+z*s, t.pos.y+y, t.pos.z-x*s+z*c); }; // x: derecha del tanque, z: adelante
window.SUBJ=null; window.lerp=(a,b,u)=>a+(b-a)*u; window.ease=u=>u*u*(3-2*u);
window.alive=f=>tanks.filter(t=>!t.dead&&!t.T.static&&f(t));
window.ground=(x,z)=>heightAt(x,z);
// ¿la cámara ve al protagonista sin nada en el medio (ruinas, árboles, otros tanques)?
window.inside=(o,r)=>{ for(;o;o=o.parent){ if(o===r) return true; if(o.visible===false) return true; } return false; };
window.clear=(t)=>{ const rc=new THREE.Raycaster(); rc.camera=camera; for(const u of [0,.5,1]){ CAM_U=u; CAM(); const to=t.pos.clone().setY(t.pos.y+1.4), dir=to.clone().sub(camera.position), d=dir.length(); rc.set(camera.position,dir.normalize()); rc.far=d-2;
  const hit=rc.intersectObjects(scene.children,true).find(h=>h.object.visible&&h.point.y>heightAt(h.point.x,h.point.z)+.35&&!(h.object.isSprite)&&!inside(h.object,t.root)&&h.object.type!=='Points'&&h.object.type!=='Line'&&h.object.type!=='LineSegments'); if(hit) return false; if(camera.position.y<heightAt(camera.position.x,camera.position.z)+.4) return false; } CAM_U=0; return true; };
window.pick=(L,mk)=>{ for(const t of L){ CAM=mk(t); if(clear(t)) return t; } return null; };
`;
module.exports=[
 {id:'1-avance',dur:3,setup:H+`(()=>{ const L=alive(t=>t.team===0&&['mk1','mk4m','mk4f','mk5'].includes(t.key)).concat(alive(t=>t.team===0)); const t=pick(L,t=>()=>{ const u=ease(CAM_U), p=rel(t,3.5,0,lerp(16,10,u)); p.y=Math.max(p.y,ground(p.x,p.z)+.7); camera.fov=38; camera.updateProjectionMatrix(); camera.position.copy(p); camera.lookAt(rel(t,0,1.6,0)); }); if(!t) return false; window.SUBJ=t; return true; })()`},
 {id:'2-costado',dur:2.5,setup:H+`(()=>{ const t=pick([SUBJ].filter(x=>x&&!x.dead).concat(alive(t=>t.team===0)),t=>()=>{ const u=CAM_U, p=rel(t,-11,0,lerp(-4,3,u)); p.y=ground(p.x,p.z)+2.2; camera.fov=42; camera.updateProjectionMatrix(); camera.position.copy(p); camera.lookAt(rel(t,0,1.3,1)); }); return !!t; })()`},
 {id:'3-disparo',dur:2.5,setup:H+`(()=>{ const t=pick(alive(t=>t.team===1&&t.target).concat(alive(t=>t.team===1)),t=>()=>{ const u=ease(CAM_U), p=rel(t,lerp(8,6,u),0,lerp(-15,-12,u)); p.y=Math.max(ground(p.x,p.z),t.pos.y)+3.6; camera.fov=40; camera.updateProjectionMatrix(); camera.position.copy(p); camera.lookAt(rel(t,0,1.2,10)); }); if(!t) return false; ON_F=f=>{ if(f===30){ t.reloadT=0; fireGun(t); } }; return true; })()`},
 {id:'4-artilleria',dur:3,setup:H+`(()=>{ const tg=alive(t=>t.team===0)[0], by=alive(t=>t.team===1)[0]; if(!tg||!by) return false;
   by.crew.sp=1e4; by.crew.artyCD=0; teamSup[1]&&(teamSup[1].arty=0); const P=tg.pos.clone().add(V3(rand(-8,8),0,rand(6,14))); callArtillery(by,P); step(70,1/20);
   CAM=()=>{ const u=ease(CAM_U), a=.6+u*.25, r=lerp(55,44,u); camera.fov=45; camera.updateProjectionMatrix(); camera.position.set(P.x+Math.sin(a)*r,P.y+lerp(16,12,u),P.z+Math.cos(a)*r); camera.lookAt(P.x,P.y+3,P.z); }; return true; })()`},
 {id:'5-grua',dur:3,setup:H+`(()=>{ const L=alive(t=>true); if(!L.length) return false; const C=V3(0,0,0); L.forEach(t=>C.add(t.pos)); C.multiplyScalar(1/L.length); C.y=heightAt(C.x,C.z);
   CAM=()=>{ const u=ease(CAM_U), a=2.6+u*.5, r=lerp(30,70,u); camera.fov=50; camera.updateProjectionMatrix(); camera.position.set(C.x+Math.sin(a)*r,C.y+lerp(4,42,u),C.z+Math.cos(a)*r); camera.lookAt(C.x,C.y+lerp(4,0,u),C.z); }; return true; })()`},
];
