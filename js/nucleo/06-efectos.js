/* ---------- Efectos ---------- */
const smokeTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
  const g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);
  return new THREE.CanvasTexture(c);})();
const fx=[];
function puff(p,color,size,life,vy=1.5,op=.7,additive=false){
  const m=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,color,transparent:true,opacity:op,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending}));
  m.position.copy(p); m.scale.setScalar(size); scene.add(m);
  fx.push({m,life,max:life,vy,grow:size*.9,op,sprite:true});
}
const leafMat=new THREE.MeshBasicMaterial({color:0x4f6b30});
const sGeo=new THREE.BoxGeometry(.12,.12,.12), sparkMat=new THREE.MeshBasicMaterial({color:0xffc060}), dirtMat=new THREE.MeshBasicMaterial({color:0x5a4a34});
function debris(p,n,mat,spd,scale=1){for(let i=0;i<n;i++){const m=new THREE.Mesh(sGeo,mat);m.position.copy(p);m.scale.setScalar(scale);scene.add(m);
  fx.push({m,life:rand(.3,.8),v:new THREE.Vector3(rand(-1,1),rand(.5,2),rand(-1,1)).multiplyScalar(spd),g:true});}}
function tracer(a,b,color){
  const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color,transparent:true,opacity:.85}));
  scene.add(l); fx.push({m:l,life:.06,max:.06,line:true});
}
const flash=new THREE.PointLight(0xffb060,0,40); scene.add(flash);
function explode(p,kind,big=1){
  flash.position.copy(p); flash.intensity=4*big;
  if(kind==='ground'){debris(p,10*big,dirtMat,5*big);for(let i=0;i<3*big;i++)puff(p.clone().add(new THREE.Vector3(rand(-1,1),rand(0,1),rand(-1,1))),0x6a5a44,rand(3,5)*big,rand(1.2,2),1.2);}
  else {debris(p,12,sparkMat,7);puff(p,0xffa040,3,.25,0,1,true);puff(p,0x444038,3,1.2,1);}
}
function updateFx(dt){
  flash.intensity=Math.max(0,flash.intensity-dt*30);
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.life-=dt;
    if(f.sprite){f.m.material.opacity=f.op*f.life/f.max;f.m.position.y+=f.vy*dt;f.m.scale.addScalar(f.grow*dt);}
    if(f.line) f.m.material.opacity=Math.max(0,f.life/f.max)*.85;
    if(f.shock){ const k=1-f.life/f.max; f.m.scale.setScalar(1+f.size*k); f.m.material.opacity=.7*(1-k); }
    if(f.g){f.v.y-=12*dt;f.m.position.addScaledVector(f.v,dt);}
    if(f.life<=0){scene.remove(f.m);if(f.sprite||f.line||f.shock)f.m.material.dispose();if(f.line)f.m.geometry.dispose();fx.splice(i,1);}
  }
}

