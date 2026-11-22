// Tanques contra edificios y derrumbes más reales (22/11/2026, pedido de Sebastián: "los tanques no dañan las casas al chocarlas;
// deberían oponer resistencia según el edificio y el tanque, y que el derrumbe sea más real").
//  · Choque: al tocar una pared, la energía del golpe (½·masa·v² hacia la pared) se compara con lo que aguanta el edificio
//    (su vida, que ya crece con el tamaño, y un factor de material: alto de hormigón ×2 o más, hito ×4); a uno de más de 8 m
//    solo se le rompe la planta baja (los choques le sacan hasta la mitad de la vida). Si alcanza, el tanque lo
//    atraviesa perdiendo velocidad según lo que le costó; si no, frena en seco, la pared se rompe donde pegó y vuelan cascotes
//    hacia adelante. Empujando contra la pared también lo va rompiendo (más rápido un tanque pesado contra una casa chica).
//  · Derrumbe: tiembla un instante, larga polvo abajo, y cae acelerando, inclinándose hacia un lado (hacia donde iba el tanque
//    si lo tiró un tanque), con cascotes que salen despedidos, la nube de polvo al llegar abajo y la montaña de escombros
//    recién cuando terminó de caer (antes aparecía al instante, con el edificio todavía en pie).
(function(){
  const MASS={ligero:16,medio:32,pesado:55,cazatanques:30,'antiaéreo':20}, MCAP={ligero:20,medio:40,pesado:72,cazatanques:46,'antiaéreo':26};
  const massC=new Map();
  // masa en toneladas: volumen del casco × 0,75 con tope por clase; semiorugas y con ruedas mucho más livianos; 1ª Guerra sin tope de clase
  function massOf(T){ if(massC.has(T)) return massC.get(T); const m=T.m||{}; let v=(m.L||6)*(m.W||3)*(m.H||2.4)*.75;
    const cls=T.cls||'medio'; v=Math.min(v,(T.era===1?60:MCAP[cls]||40)); if(!(v>3)) v=MASS[cls]||30;
    if(m.ww1==='ht'||m.wheeled||(m.w2&&m.w2.noTrk)) v*=.38; massC.set(T,v); return v; }
  window.tankMass=massOf;
  // lo que aguanta: alto (hormigón armado) y famosos más duros; casas chicas de ladrillo hueco, menos
  function hardOf(b){ if(b.lm) return 4; const H=b.H0||(b.top-b.base); return H>8?2+(H-8)*.35:H>5?1.4:1; }
  // un edificio alto (estructura de hormigón) no se tira a los golpes: el tanque le rompe la planta baja, nada más
  const ramCap=b=>((b.H0||(b.top-b.base))>8||b.lm)?b.max*.5:1e9;
  function ramDmg(b,d){ const left=ramCap(b)-(b._ramD||0); d=Math.max(0,Math.min(d,left)); if(d>0){ b._ramD=(b._ramD||0)+d; damageBuilding(b,d); } return d; }
  const K=.4;                   // daño por cada unidad de ½·t·(m/s)²
  const touch=new WeakMap();    // tanque → Map(edificio → último contacto)
  const wallHex=b=>new THREE.Color(b.wall).multiplyScalar(.7).getHex();

  window.bldRam=function(t,b,into,dt,fx,fz,dir){
    if(!b||!isFinite(b.hp)||b.hp<=0) return;
    const indestr=b.max>1e6||b.hp>1e6, M=massOf(t.T), v=Math.abs(t.speed)*into, hard=indestr?1e9:hardOf(b);
    let m=touch.get(t); if(!m){ m=new Map(); touch.set(t,m); }
    const last=m.get(b), fresh=last===undefined||now-last>.6; m.set(b,now);
    const p=t.pos.clone().add(new THREE.Vector3(fx*dir*(t.co+t.cr),1.2,fz*dir*(t.co+t.cr)));
    if(fresh&&v>1.4){                                                   // el golpe
      const E=.5*M*v*v, dmg=E*K/hard, before=b.hp;
      if(t.isPlayer) shake=Math.max(shake,Math.min(.7,E/1800));
      puff(p.clone(),0xa89c8a,rand(3,5)*(1+Math.min(1,E/1500)),rand(1.5,2.5),.7,.65);
      if(typeof ruChunks==='function') ruChunks(p,fx*dir,fz*dir,Math.min(12,3+(E/250)|0),wallHex(b),Math.min(1.6,.6+v*.08));
      if(!sfx('expl',p,Math.min(.6,.15+E/4000),{rate:1.5})) boom(distVol(p,.3),.5,300);
      if(indestr){ t.speed*=-.08; return; }
      window._bldDir={x:fx*dir,z:fz*dir,k:Math.min(1,E/(before*hard/K+1)),t:now};
      ramDmg(b,dmg);
      if(b.hp<=0){ t.speed*=clamp(1-before/(dmg+1),.2,.6); }        // lo atravesó: pierde lo que le costó
      else { t.speed*=-.06;                                            // la pared aguantó: frena en seco
        const tur=Math.abs(wrap(t.turretYaw||0))<.45;                   // el cañón para adelante contra la pared: puede doblarse
        if(tur&&E>650&&t.mod&&Math.random()<.2&&!net.guest){ t.mod.barrel=Math.max(0,(t.mod.barrel??100)-rand(12,28)); if(t.isPlayer) hitMsg('Cañón golpeado contra la pared','var(--warn)'); } }
      return; }
    // empujando contra la pared: la va rompiendo según el peso del tanque y lo que aguanta el edificio
    if(!indestr&&into>.5&&Math.abs(t.speed)>.05){ const rate=M*1.2/hard;
      window._bldDir={x:fx*dir,z:fz*dir,k:.6,t:now};
      ramDmg(b,rate*dt);
      if(Math.random()<dt*3){ puff(p.clone(),0xa89c8a,rand(2,3),rand(1,1.8),.5,.55); if(typeof ruChunks==='function') ruChunks(p,fx*dir,fz*dir,2,wallHex(b),.5); } }
  };

  // ---- derrumbe más real ----
  // la montaña de escombros recién al terminar de caer
  let defer=false; const _rub=rubble; rubble=function(b,g){ if(defer){ b._rub=[b,g]; return; } return _rub.apply(this,arguments); };
  const _db=damageBuilding; damageBuilding=function(b,dmg,fromNet){ const alive=b&&b.hp>0; defer=alive; let r;
    try{ r=_db.apply(this,arguments); } finally{ defer=false; }
    if(alive&&b.hp<=0){ const F=falling.find(F=>F.b===b), D=window._bldDir&&now-window._bldDir.t<.2?window._bldDir:null;
      const a=D?Math.atan2(D.x,D.z):rand(0,6.28), H=b.top-b.base;
      if(F){ Object.assign(F,{dir:a,lean:(D?.12+.22*D.k:rand(.04,.18))*(H>8?.7:1),T:(D?.55:.7)+.32*Math.sqrt(Math.max(1,H)),shk:D?.06:.35,burst:false}); }
      else if(b._rub){ const x=b._rub; b._rub=null; _rub.apply(this,x); } }
    else if(b&&b._rub&&!falling.some(F=>F.b===b)){ const x=b._rub; b._rub=null; _rub.apply(this,x); }
    return r; };
  const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _v=new THREE.Vector3(), _s=new THREE.Vector3();
  updFalling=function(dt){ for(let i=falling.length-1;i>=0;i--){ const F=falling[i], b=F.b; F.t+=dt;
      const H=F.H||(F.H=b.top-b.base), T=F.T||(.7+.32*Math.sqrt(Math.max(1,H))), shk=F.shk??.35, dir=F.dir??0, lean=F.lean??.1;
      const g=heightAt(b.x,b.z), dx=Math.sin(dir), dz=Math.cos(dir);
      let h=H, tilt=0, off=0, jit=0;
      if(F.t<shk){ jit=.012*Math.sin(F.t*90);                                    // tiembla
        if(F.t%.1<dt) puff(new THREE.Vector3(b.x+rand(-b.w/2,b.w/2),g+.6,b.z+rand(-b.d/2,b.d/2)),0xa89c8a,rand(2,4),rand(1.5,2.5),.4,.6); }
      else { const k=Math.min(1,(F.t-shk)/T), e=k*k; h=H+(1.2-H)*e; tilt=lean*Math.sin(Math.min(1,k*1.25)*Math.PI/2)*(1-.6*Math.max(0,k-.8)/.2); off=H*.14*e;
        if(F.t%.12<dt&&k<.95){ const top=b.base+h; for(let n=0;n<2;n++) debris(new THREE.Vector3(b.x+dx*off+rand(-b.w/2,b.w/2),top,b.z+dz*off+rand(-b.d/2,b.d/2)),2,dirtMat,3+H*.25,1.3);
          if(typeof ruChunks==='function'&&Math.random()<.6) ruChunks(new THREE.Vector3(b.x+dx*b.w*.5,top,b.z+dz*b.d*.5),dx,dz,2,wallHex(b),.9); }
        if(!F.burst&&k>.6){ F.burst=true; const R=Math.max(b.w,b.d);                 // la nube al llegar abajo
          const sz=clamp(Math.sqrt(b.w*b.d*H)/22,.35,1.3), nn=Math.round(6+10*Math.min(1,sz));   // la nube según el tamaño: una casa chica levanta poco
          for(let n=0;n<nn;n++){ const a=n/nn*6.28, r=R*rand(.45,.8); puff(new THREE.Vector3(b.x+dx*off+Math.cos(a)*r,g+rand(.4,1.5+H*.2),b.z+dz*off+Math.sin(a)*r),0x9e958a,rand(4,8)*sz,rand(3,5)*sz,rand(.5,1.5),.62); }
          const p=new THREE.Vector3(b.x,g,b.z); if(!sfx('expl',p,.7,{rate:.5})) boom(distVol(p,.6),1.4,300);
          shake=Math.max(shake,clamp(1-p.distanceTo(camera.position)/120,0,.45)*Math.min(1,H/8+.3)); }
        if(k>=1){ _q.setFromAxisAngle(_v.set(0,1,0),b.a); _m.compose(_v.set(b.x,b.base+1.05,b.z),_q,_s.set(b.w*.98,.6,b.d*.98)); wallsIM.setMatrixAt(b.i,_m); wallsIM.instanceMatrix.needsUpdate=true;
          falling.splice(i,1); if(b._rub){ const x=b._rub; b._rub=null; _rub.apply(this,x); } continue; } }
      // inclinarse hacia dir: eje horizontal perpendicular
      _q.setFromAxisAngle(_v.set(dz,0,-dx).normalize(),tilt+jit); const qa=new THREE.Quaternion().setFromAxisAngle(_s.set(0,1,0),b.a); _q.multiply(qa);
      const bulge=1+.06*(1-h/H);
      _m.compose(_v.set(b.x+dx*off+dx*Math.sin(tilt)*h/2,b.base+h/2*Math.cos(tilt),b.z+dz*off+dz*Math.sin(tilt)*h/2),_q,_s.set(b.w*bulge,h,b.d*bulge));
      wallsIM.setMatrixAt(b.i,_m); wallsIM.instanceMatrix.needsUpdate=true; } };
  // limpieza: si se corta la batalla con edificios cayendo, que la montaña igual aparezca no hace falta (el mapa se rearma)
})();
