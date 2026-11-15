/* ---------- Luces de freno y chirrido al frenar (pedido de Sebastián, después de los frenos por tanque de 07-tanques.js) ----------
   - Luces: los tanques de la posguerra y la Guerra Fría (época ≥ 4) llevan dos faros traseros rojos en la popa; se prenden al frenar
     (t.braking de drive0, o para los tanques de la red si bajan de velocidad más rápido que rodando solos) con un halo aditivo.
     Se ubican tirando un rayo contra la popa del modelo. Una malla con los dos vidrios y otra con los dos halos (solo visible frenando),
     materiales compartidos: no recompila nada.
   - Chirrido: ruido en dos bandas angostas de metal (2,5–4,5 kHz, cada tanque con su tono) + un serrucho que vibra, con volumen
     según la velocidad; suena desde el tanque (panner), hasta 4 a la vez a menos de 160 m. Épocas 1–2 más grave y bajo. */
(()=>{
  const ON=new THREE.MeshBasicMaterial({color:0xff2a14}), OFF=new THREE.MeshLambertMaterial({color:0x4a0d0a,emissive:0x1a0302});
  const glowTex=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'), g=x.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,'rgba(255,90,60,1)'); g.addColorStop(.25,'rgba(255,40,20,.55)'); g.addColorStop(1,'rgba(255,0,0,0)'); x.fillStyle=g; x.fillRect(0,0,64,64);
    return new THREE.CanvasTexture(c); })();
  const GLOW=new THREE.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:true});
  const ray=new THREE.Raycaster(), _o=new THREE.Vector3(), _d=new THREE.Vector3();
  function rearZ(t,x,y){ const L=t.T.m.L; t.root.updateMatrixWorld(true); _o.set(x,y,-L).applyMatrix4(t.root.matrixWorld);
    _d.set(0,0,1).transformDirection(t.root.matrixWorld); ray.set(_o,_d); ray.far=L*1.2;
    const ms=[]; t.root.traverse(o=>{ if(o.isMesh&&o.visible&&!o.isSkinnedMesh&&!(o.userData&&(o.userData.tank||o.userData.skW||o.userData.skP))&&o.layers.mask&3) ms.push(o); });
    const h=ray.intersectObjects(ms,false)[0]; if(!h) return null; const z=t.root.worldToLocal(h.point.clone()).z; return z<-L*.3?z-.025:null; }
  function addLights(t){ t._brkL=1; const M=t.T.m; if(!t.root||!M||!M.L) return;
    // entre las orugas (las orugas no cuentan para el rayo); si a esa altura no hay popa (ruedas, hueco), se prueba más arriba
    const H=t.hTop||M.H||2, xs=[M.W*.3,-M.W*.3]; let y=H*.6, zs;
    for(const f of [.6,.75,.45,.88]){ y=H*f; zs=xs.map(x=>rearZ(t,x,y)); if(zs[0]!=null&&zs[1]!=null) break; }
    zs=zs.map(z=>z??-M.L/2);
    const box=(x,z)=>new THREE.BoxGeometry(.16,.09,.05).translate(x,y,z), quad=(x,z)=>new THREE.PlaneGeometry(.7,.5).rotateY(Math.PI).translate(x,y,z-.04);
    const U=THREE.BufferGeometryUtils, lens=new THREE.Mesh(U.mergeBufferGeometries([box(xs[0],zs[0]),box(xs[1],zs[1])]),OFF),
      glow=new THREE.Mesh(U.mergeBufferGeometries([quad(xs[0],zs[0]),quad(xs[1],zs[1])]),GLOW);
    for(const m of [lens,glow]){ m.userData.skP=1; m.castShadow=false; t.root.add(m); } glow.visible=false; glow.renderOrder=5; t._bL={lens,glow,on:false}; }
  // frenando: el propio y los bots lo dicen en drive0; los de la red, por la caída de velocidad
  function braking(t,dt){ const v=Math.abs(t.speed||0), pv=t._bv??v; t._bv=v; if(t.dead||v<.4) return false;
    if(!t.net) return !!t.braking; const dec=(pv-v)/Math.max(dt,1e-3); t._bd=(t._bd||0)*.8+dec*.2; return t._bd>coastOf(t.T)*1.35; }

  // ---- chirrido ----
  const V=new Map(), MAXV=4;
  function voice(t){ if(!AC||!noiseBuf) return null; const n=AC.currentTime, old=(t.T.era||5)<=2, f0=(old?1700:2600)+((t.id||0)*137%900);
    const src=AC.createBufferSource(); src.buffer=noiseBuf; src.loop=true;
    const b1=AC.createBiquadFilter(); b1.type='bandpass'; b1.frequency.value=f0; b1.Q.value=22;
    const b2=AC.createBiquadFilter(); b2.type='bandpass'; b2.frequency.value=f0*1.52; b2.Q.value=26;
    const o=AC.createOscillator(); o.type='sawtooth'; o.frequency.value=f0*.58; const lfo=AC.createOscillator(); lfo.frequency.value=7+Math.random()*5; const lg=AC.createGain(); lg.gain.value=f0*.025;
    lfo.connect(lg).connect(o.frequency); const og=AC.createGain(); og.gain.value=.035; const ol=AC.createBiquadFilter(); ol.type='bandpass'; ol.frequency.value=f0*.58; ol.Q.value=6;
    const g=AC.createGain(); g.gain.value=0; const pn=AC.createPanner(); pn.panningModel='equalpower'; pn.distanceModel='inverse'; pn.refDistance=12; pn.rolloffFactor=1.1;
    src.connect(b1).connect(g); src.connect(b2).connect(g); o.connect(ol).connect(og).connect(g); g.connect(pn).connect(extBus);
    src.start(n,Math.random()*.9); o.start(n); lfo.start(n); return {src,o,lfo,g,pn,b1,b2,old,gone:0}; }
  function kill(t,v){ const n=AC.currentTime; v.g.gain.setTargetAtTime(0,n,.08); v.gone=1; V.delete(t);
    setTimeout(()=>{ try{ v.src.stop(); v.o.stop(); v.lfo.stop(); v.pn.disconnect(); }catch(e){} },700); }
  function squeal(t,on,dt){ let v=V.get(t); const spd=Math.abs(t.speed||0), d=t.pos.distanceTo(camera.position);
    if(!on||spd<1.2||d>160||!AC||state==='menu'){ if(v) kill(t,v); return; }
    if(!v){ if(V.size>=MAXV) return; v=voice(t); if(!v) return; V.set(t,v); }
    const n=AC.currentTime, p=t.pos; if(v.pn.positionX){ v.pn.positionX.value=p.x; v.pn.positionY.value=p.y+.6; v.pn.positionZ.value=p.z; } else v.pn.setPosition(p.x,p.y+.6,p.z);
    // más fuerte a media velocidad y al final (justo antes de parar los frenos "cantan")
    const k=clamp(spd/9,0,1), amp=(.11+.22*Math.sin(Math.min(1,k)*Math.PI*.85))*(v.old?.6:1)*(t.isPlayer?1.25:1);
    v.g.gain.setTargetAtTime(amp,n,.06); v.b1.detune.setTargetAtTime((1-k)*260+Math.sin(n*11+(t.id||0))*40,n,.05); v.b2.detune.setTargetAtTime((1-k)*180,n,.05); }

  const _tf=tankFX; tankFX=function(t,dt){ const r=_tf.apply(this,arguments);
    try{ if(t.T&&!t.T.static&&t.root){ const on=braking(t,dt);
        if((t.T.era||5)>=4){ if(!t._brkL) addLights(t); const B=t._bL; if(B&&B.on!==on){ B.on=on; B.lens.material=on?ON:OFF; B.glow.visible=on; } }
        squeal(t,on,dt); } }catch(e){ if(!t._blE){ t._blE=1; console.error('frenos',e); } }
    return r; };
  // al terminar la batalla o sacar un tanque, se callan
  const quiet=()=>{ if(AC) for(const [t,v] of [...V]) kill(t,v); };
  if(typeof clearBattle==='function'){ const _cb=clearBattle; clearBattle=function(){ quiet(); return _cb.apply(this,arguments); }; }
  if(typeof removeTank==='function'){ const _rt=removeTank; removeTank=function(t){ const v=V.get(t); if(v&&AC) kill(t,v); return _rt.apply(this,arguments); }; }
  window.frenosStats=()=>({voces:V.size});
})();
