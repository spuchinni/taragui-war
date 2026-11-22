/* ---------- Sonidos de GFXSounds (17/11/2026, pedido de Sebastián; licencia gratis con crédito: "Sound effects from https://gfxsounds.com") ----------
   · Escotillas: se abre cuando el mecánico baja a reparar (t.mech) y se cierra cuando vuelve a subir (hatcho / hatchc).
   · Subfusiles (MP 40, PPSh, Thompson, Sten): ráfaga grabada en vez del chasquido sintético del fusil (smg).
   · Pasada: un tanque que pasa cerca de la cámara a más de 3 m/s suena con sus orugas (pass, con su efecto Doppler).
   · MAG (FN MAG 7,62 mm; la grabación es de una M240B, que es la misma arma): en el TAM, TAM 2C, VCTP, SK-105 y Patagón la ráfaga
     del jugador usa el bucle mag_0 (3 ciclos iguales de 1,44 s = 10 disparos cada 0,144 s; se repite el del medio, así el retardo
     del mp3 no corta el empalme) y los disparos de los demás usan magshot_0. 19/11/2026, pedido de Sebastián.
   · Mecánico (19/11/2026, pedido de Sebastián): mientras repara afuera (t.mech) suenan herramientas cada 1,6–3 s donde está parado:
     cadenas (chain_0) si arregla la oruga, herramienta a aire (tool_0, la "clavadora") si arregla el motor o el cañón; a veces la otra.
   · Semiorugas (20/11/2026, pedido de Sebastián): el Sd.Kfz. 251, el M3 y el M16 que no maneja el jugador suenan con un motor de
     camión en bucle (truck_0: ciclo de 15,284 s con fundido, 0,3 s de margen a cada lado por el retardo del mp3), con posición,
     a menos de 220 m de la cámara; el tono sube con la velocidad.
   · Aviones de apoyo de las épocas 3–4 (20/11/2026, pedido de Sebastián): el ataque aéreo pedido (Ju 87, Il-2, P-47, Typhoon,
     Northrop) y el P-47 que castiga usan fighter_0: el tramo a plena potencia de un despegue de caza de la 2ª Guerra (Pixabay,
     scottishperson #333260), en bucle de 3,15 s con 0,3 s de margen. La Guerra Fría (A-10) y los transportes no cambian.
   · M16 MGMC (22/11/2026, pedido de Sebastián: "no tiene un sonido real al disparar"): en vez del golpe sintético por tiro, mientras
     tira suena m2quad_0 (las 4 M2 del montaje Maxson sin sincronizar, armado con herramientas/sonidos/m16.py a partir de los tiros
     de una .50 real, qubodup #160355, CC0; bucle de 2,76 s, 0,3 s de margen) con posición (el jugador lo oye de cerca) y al soltar
     el gatillo, el eco (m2tail_0). */
(function(){
  if(typeof SND_FILES!=='undefined') Object.assign(SND_FILES,{smg:1,hatcho:1,hatchc:1,pass:1,mag:1,magshot:1,tool:1,chain:1,truck:1,fighter:1,m2quad:1,m2tail:1});
  const ready=()=>{ if(typeof AC==='undefined'||!AC||typeof SFX==='undefined') return false;
    for(const k of ['smg','hatcho','hatchc','pass','mag','magshot','tool','chain','truck','fighter','m2quad','m2tail']) if(!SFX[k]){ SFX[k]=[]; sndFetch(`snd/${k}_0.mp3`).then(ab=>AC.decodeAudioData(ab)).then(b=>SFX[k].push(b)).catch(()=>{}); }
    return true; };
  const SMG={mp40:1,ppsh:1,thompson:1,sten:1};
  const MAG={tam:1,tam2c:1,vctp:1,sk105:1,patagon:1}, MAG_LEN=1.44;
  const isMag=t=>t&&MAG[t.key];
  let magLoop=null, origLoop=null, curMG=null;
  function magSwap(){ if(typeof LOOPS==='undefined'||!LOOPS.mgburst&&!origLoop) return;
    if(!magLoop&&SFX.mag&&SFX.mag.length){ const src=AC.createBufferSource(); src.buffer=SFX.mag[0]; src.loop=true; src.loopStart=.3; src.loopEnd=.3+MAG_LEN;
      const g=AC.createGain(); g.gain.value=0; src.connect(g).connect(master); src.start(0,.3); magLoop={src,g}; }
    if(!origLoop) origLoop=LOOPS.mgburst;
    const want=(typeof player!=='undefined'&&player&&isMag(player)&&magLoop)?magLoop:origLoop;
    if(want&&LOOPS.mgburst!==want){ try{ LOOPS.mgburst.g.gain.setTargetAtTime(0,AC.currentTime,.02); }catch(e){} LOOPS.mgburst=want; } }
  const _fm=fireMG; fireMG=function(t){ const p=curMG; curMG=t; try{ return _fm.apply(this,arguments); } finally{ curMG=p; } };
  const _sf=sfx; sfx=function(n){ if(n==='mgshot'&&isMag(curMG)&&SFX.magshot&&SFX.magshot.length){ const a=[...arguments]; a[0]='magshot'; return _sf.apply(this,a); } return _sf.apply(this,arguments); };
  let passG=-99;
  const FIGHTER_LEN=3.15; let fighterNext=false;
  const _ml=movingLoop; movingLoop=function(name,vol,o){ if(!fighterNext||!AC||!SFX.fighter||!SFX.fighter.length) return _ml.apply(this,arguments);
    o=o||{}; const ref=o.ref||60, lp=o.lp||6000;
    const src=AC.createBufferSource(); src.buffer=SFX.fighter[0]; src.loop=true; src.loopStart=.3; src.loopEnd=.3+FIGHTER_LEN; src.playbackRate.value=rand(.95,1.05);
    const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=lp; const g=AC.createGain(); g.gain.value=vol*.9;
    const pn=AC.createPanner(); pn.panningModel='equalpower'; pn.distanceModel='inverse'; pn.refDistance=ref; pn.rolloffFactor=1;
    src.connect(f).connect(g).connect(pn).connect(extBus); src.start(0,.3+Math.random()*FIGHTER_LEN);
    const L={dead:false, fighter:1, set(p){ if(pn.positionX){pn.positionX.value=p.x;pn.positionY.value=p.y;pn.positionZ.value=p.z;} else pn.setPosition(p.x,p.y,p.z);
        const d=p.distanceTo(camera.position); f.frequency.value=Math.max(500,lp*Math.exp(-d/500)); },
      stop(){ if(L.dead) return; L.dead=true; liveLoops.delete(L); try{ g.gain.setTargetAtTime(0,AC.currentTime,.4); src.stop(AC.currentTime+2); }catch(e){} }};
    liveLoops.add(L); return L; };
  const propEra=()=>{ const e=(typeof W!=='undefined'&&W&&W.era)||5; return e>=3&&e<5; };
  for(const fn of ['airPass','a10Strike']) if(typeof window[fn]==='function'){ const _o=window[fn];
    window[fn]=function(){ const p=fighterNext; fighterNext=propEra(); try{ return _o.apply(this,arguments); } finally{ fighterNext=p; } }; }
  const HT={ht_de:1,ht_al:1,m16mgmc:1}, TRUCK_LEN=15.284, trucks=new Map();
  function truckLoop(){ const src=AC.createBufferSource(); src.buffer=SFX.truck[0]; src.loop=true; src.loopStart=.3; src.loopEnd=.3+TRUCK_LEN;
    const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=5000; const g=AC.createGain(); g.gain.value=0;
    const pn=AC.createPanner(); pn.panningModel='equalpower'; pn.distanceModel='inverse'; pn.refDistance=14; pn.rolloffFactor=1;
    src.connect(f).connect(g).connect(pn).connect(extBus); src.start(0,.3+Math.random()*TRUCK_LEN);
    const L={src,f,g,pn,dead:false,stop(){ if(L.dead) return; L.dead=true; liveLoops.delete(L); try{ g.gain.setTargetAtTime(0,AC.currentTime,.3); src.stop(AC.currentTime+1.5); }catch(e){} }};
    liveLoops.add(L); return L; }
  function truckPrune(){ for(const [k,L] of trucks) if(k.dead||!tanks.includes(k)){ L.stop(); trucks.delete(k); } }
  function truckTick(t){ let L=trucks.get(t); const d=t.pos.distanceTo(camera.position), on=!t.dead&&!t.isPlayer&&d<220&&tanks.includes(t);
    if(!on){ if(L){ L.stop(); trucks.delete(t); } return; }
    if(!L||L.dead){ if(!SFX.truck||!SFX.truck.length) return; L=truckLoop(); trucks.set(t,L); }
    const p=t.pos; if(L.pn.positionX){ L.pn.positionX.value=p.x; L.pn.positionY.value=p.y+1; L.pn.positionZ.value=p.z; } else L.pn.setPosition(p.x,p.y+1,p.z);
    const v=Math.abs(t.speed||0), n=AC.currentTime;
    L.src.playbackRate.setTargetAtTime(Math.min(1.45,.9+v*.05),n,.2); L.g.gain.setTargetAtTime(.55+Math.min(.35,v*.03),n,.2); L.f.frequency.value=Math.max(600,5000*Math.exp(-d/400)); }
  // M16 MGMC: bucle de las 4 M2 mientras tira, eco al soltar
  const M2Q={m16mgmc:1}, M2_LEN=2.76, m2=new Map(); let m2Mute=0;
  const _bm=boom; boom=function(){ if(m2Mute) return; return _bm.apply(this,arguments); };
  function m2Loop(t){ const near=!!t.isPlayer, src=AC.createBufferSource(); src.buffer=SFX.m2quad[0]; src.loop=true; src.loopStart=.3; src.loopEnd=.3+M2_LEN;
    src.playbackRate.value=rand(.97,1.03); const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=16000;
    const g=AC.createGain(), n=AC.currentTime; g.gain.setValueAtTime(0,n); g.gain.linearRampToValueAtTime(near?.85:1.3,n+.012);
    let pn=null; if(near) src.connect(f).connect(g).connect(master);
    else { pn=AC.createPanner(); pn.panningModel='equalpower'; pn.distanceModel='inverse'; pn.refDistance=22; pn.rolloffFactor=1; src.connect(f).connect(g).connect(pn).connect(extBus); }
    src.start(0,.3+Math.random()*M2_LEN);
    const L={t,near,src,f,g,pn,last:now,dead:false,stop(fast){ if(L.dead) return; L.dead=true; liveLoops.delete(L); m2.delete(t);
        try{ const c=AC.currentTime; g.gain.cancelScheduledValues(c); g.gain.setTargetAtTime(0,c,fast?.015:.06); src.stop(c+.6); }catch(e){} }};
    liveLoops.add(L); return L; }
  function m2Pos(L){ const t=L.t; if(!L.pn) return; const p=t.pos; if(L.pn.positionX){ L.pn.positionX.value=p.x; L.pn.positionY.value=p.y+2; L.pn.positionZ.value=p.z; } else L.pn.setPosition(p.x,p.y+2,p.z);
    L.f.frequency.value=Math.max(900,16000*Math.exp(-p.distanceTo(camera.position)/350)); }
  function m2Shot(t){ if(t.pos.distanceTo(camera.position)>1100) return; let L=m2.get(t); if(!L||L.dead||L.near!==!!t.isPlayer){ if(L) L.stop(1); L=m2Loop(t); m2.set(t,L); }
    L.last=now; m2Pos(L); }
  function m2Tick(){ const c=now; for(const [t,L] of m2){ const gone=t.dead||!tanks.includes(t);
      if(gone||c-L.last>Math.max(.22,(t.T.auto&&t.T.auto.rof||.035)*4)){ L.stop(gone);
        if(!gone) sfx('m2tail',L.near?null:t.pos.clone().setY(t.pos.y+2),L.near?.8:1.2,{near:L.near,ref:22}); } else m2Pos(L); } }
  const _fg=fireGun; fireGun=function(t){ if(!t||!M2Q[t.key]||!t.T.auto||!ready()||!SFX.m2quad||!SFX.m2quad.length) return _fg.apply(this,arguments);
    m2Mute=1; let r; try{ r=_fg.apply(this,arguments); } finally{ m2Mute=0; } try{ if(r) m2Shot(t); }catch(e){} return r; };
  const _tf=tankFX; tankFX=function(t,dt){ const r=_tf.apply(this,arguments);
    try{ if(m2.size&&ready()&&now>(m2Tick.t||0)){ m2Tick.t=now+.03; m2Tick(); } if(trucks.size&&now>(truckPrune.t||0)){ truckPrune.t=now+.25; truckPrune(); } if(ready()&&t.isPlayer) magSwap(); if(ready()&&HT[t.key]) truckTick(t); if(!ready()||t.dead) return r;
      const hm=!!t.mech; if(hm!==!!t._hm){ t._hm=hm; sfx(hm?'hatcho':'hatchc',t.pos,.9,{ref:10}); }
      if(hm&&now>(t._toolT||0)){ t._toolT=now+rand(1.6,3); const p=t.mech.g.position;
        if(p.distanceTo(camera.position)<70){ const trk=t.trackT>0||(t.trkHP&&(t.trkHP[0]<100||t.trkHP[1]<100));
          sfx((trk?Math.random()<.75:Math.random()<.25)?'chain':'tool',p,.75,{ref:8}); } }
      if(!t.isPlayer&&!t.T.static&&Math.abs(t.speed||0)>3&&now-passG>4&&now-(t._passT||-99)>15){
        const d=t.pos.distanceTo(camera.position); if(d<38&&d>6){ t._passT=passG=now; sfx('pass',t.pos,1,{ref:18}); } } }catch(e){}
    return r; };
  const _is=infShoot; infShoot=function(P,o,aim,col){
    const w=P&&P.parts&&P.parts.wep&&P.parts.wep.userData.wpn;
    if(!SMG[w]||!ready()||!SFX.smg||!SFX.smg.length) return _is.apply(this,arguments);
    const b=boom; boom=()=>{}; let r; try{ r=_is.apply(this,arguments); } finally{ boom=b; }
    if(now-(P._smgT||-9)>1.7){ P._smgT=now; sfx('smg',o,.8,{ref:12}); }
    return r; };
})();
