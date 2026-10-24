/* ---------- Audio ---------- */
// Grabaciones CC0 de Freesound (recortadas y comprimidas): qubodup (cañones de tanque, explosión, ralentí de motor y torreta, dominio público),
// greatmganga (tanque T-26 en marcha), JovianSounds (estática y corte de radio). Pixabay/freesound_community: ametralladora .50,
// sirena antiaérea, paso de avión; PWLPL (avioneta a hélice), TommyLynn (disparos lejanos de mortero), qubodup (estampido sónico).
// EpicWizard (impacto metálico), cedarstudios (rebote). La intro usa la misma grabación de tanques disparando, filtrada.
const SND_FILES={"shellin":4,"bombw":1,"nukew":1,"nukeb":1,"plane":1,"infamb":1,"gau8":1,"cannon":2,"expl":1,"metal":2,"ric":2,"intro":1,"idle":1,"drive":1,"turret":1,"static":1,"squelch":1,"mgburst":1,"mgshot":1,"thump":2,"siren":1,"flyover":1,"prop":1,"sboom":1}; // archivos en snd/<nombre>_<n>.mp3
// Voces de radio (TTSMaker) por idioma, 14 frases en el mismo orden en cada uno.
const VO_LANGS=["es", "en-gb", "en-us", "de", "ru"], VO_N=14; // archivos en voz/<idioma>/00.mp3 … 13.mp3
// Los sonidos se bajan en segundo plano apenas carga la página (no traban el menú) y quedan en caché del navegador.
const _sndCache={};
function sndFetch(p){ return _sndCache[p]||(_sndCache[p]=fetch(p).then(r=>{ if(!r.ok) throw new Error(p+' '+r.status); return r.arrayBuffer(); })); }
function sndPaths(){ const L=[]; for(const [k,n] of Object.entries(SND_FILES)) for(let i=0;i<n;i++) L.push(`snd/${k}_${i}.mp3`);
  for(const lang of VO_LANGS) for(let i=0;i<VO_N;i++) L.push(`voz/${lang}/${String(i).padStart(2,'0')}.mp3`); return L; }
function prefetchAudio(){ if(location.protocol==='file:'){ console.warn('Taragüí War: abrí el juego desde un servidor (GitHub Pages o Live Server); con file:// el navegador bloquea la carga de sonidos.'); return; }
  sndPaths().forEach(p=>sndFetch(p).catch(e=>console.warn('Sonido no cargado:',e.message))); }
addEventListener('load',()=>setTimeout(prefetchAudio,300));
let AC,noiseBuf,eng,engGain,master,extBus,extLP,engMix,engLP,eng2,lfoG,trkSrc,trkGain,introNode=null;
const SFX={}, VO={}; let volMaster=.8, radioOn=true;
// Bucles grabados: largo del ciclo (s) dentro de cada archivo, que trae el ciclo repetido para empalmar sin cortes.
const LOOP_LEN={idle:4.1,drive:2.7,turret:2.8,static:3.7,mgburst:1.7}; const LOOPS={};
function startLoops(){
  for(const k of ['idle','drive','turret','mgburst']){ if(LOOPS[k]||!SFX[k]||!SFX[k].length) continue;
    const src=AC.createBufferSource(); src.buffer=SFX[k][0]; src.loop=true; src.loopStart=.2; src.loopEnd=.2+LOOP_LEN[k];
    const g=AC.createGain(); g.gain.value=0; src.connect(g).connect(k==='turret'||k==='mgburst'?master:engGain); src.start(0,k==='mgburst'?.05:.2); if(k==='mgburst'){src.loopStart=.05; src.loopEnd=.05+LOOP_LEN.mgburst;} LOOPS[k]={src,g}; }
  if(LOOPS.idle) engMix.gain.value=.12; // con grabaciones, el motor sintético queda solo como refuerzo grave
}
function initAudio(){
  if(AC) return; AC=new (window.AudioContext||window.webkitAudioContext)();
  noiseBuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  const comp=AC.createDynamicsCompressor(); comp.threshold.value=-16; comp.knee.value=12; comp.ratio.value=5; comp.attack.value=.003; comp.release.value=.25;
  master=AC.createGain(); master.gain.value=volMaster; master.connect(comp).connect(AC.destination);
  // Todo lo que pasa afuera del tanque va por extBus: con la mira puesta se filtra, como oído desde adentro.
  extLP=AC.createBiquadFilter(); extLP.type='lowpass'; extLP.frequency.value=18000; extBus=AC.createGain(); extBus.connect(extLP).connect(master);
  // Motor diésel por capas: dos dientes de sierra + ruido, con un "golpeteo" de cilindros (LFO sobre el volumen).
  engGain=AC.createGain(); engGain.gain.value=0; engGain.connect(master);
  engMix=AC.createGain(); engMix.gain.value=.5; engLP=AC.createBiquadFilter(); engLP.type='lowpass'; engLP.frequency.value=300; engLP.Q.value=2;
  engMix.connect(engLP).connect(engGain);
  eng=AC.createOscillator(); eng.type='sawtooth'; eng.frequency.value=30; eng2=AC.createOscillator(); eng2.type='sawtooth'; eng2.frequency.value=60.7;
  const g2=AC.createGain(); g2.gain.value=.45; eng.connect(engMix); eng2.connect(g2).connect(engMix);
  const nz=AC.createBufferSource(); nz.buffer=noiseBuf; nz.loop=true; const nzf=AC.createBiquadFilter(); nzf.type='bandpass'; nzf.frequency.value=180; nzf.Q.value=.8;
  const nzg=AC.createGain(); nzg.gain.value=.35; nz.connect(nzf).connect(nzg).connect(engMix);
  const lfo=AC.createOscillator(); lfo.frequency.value=15; lfoG=AC.createGain(); lfoG.gain.value=.25; lfo.connect(lfoG).connect(engMix.gain);
  // Orugas: un bucle de golpes metálicos generado por código; su velocidad sigue a la del tanque.
  const L=AC.sampleRate, tb=AC.createBuffer(1,L,L), td=tb.getChannelData(0);
  for(let k=0;k<12;k++){ const st=(k/12*L+Math.random()*L*.02)|0, f=rand(900,1600), amp=rand(.4,.8);
    for(let i=0;i<L*.035&&st+i<L;i++){ const t=i/L; td[st+i]+=amp*Math.exp(-t*140)*(Math.sin(2*Math.PI*f*t)*.6+(Math.random()*2-1)*.7); } }
  trkSrc=AC.createBufferSource(); trkSrc.buffer=tb; trkSrc.loop=true; const tf=AC.createBiquadFilter(); tf.type='lowpass'; tf.frequency.value=2600;
  trkGain=AC.createGain(); trkGain.gain.value=0; trkSrc.connect(tf).connect(trkGain).connect(engGain);
  [eng,eng2,nz,lfo,trkSrc].forEach(n=>n.start());
  for(const [k,n] of Object.entries(SND_FILES)){ SFX[k]=[]; for(let i=0;i<n;i++) sndFetch(`snd/${k}_${i}.mp3`).then(ab=>
    AC.decodeAudioData(ab,buf=>{ SFX[k].push(buf); if(k==='intro'&&musMode==='hangar'){ musMode=null; syncIntro(); } if(['idle','drive','turret','mgburst'].includes(k)) startLoops(); },()=>{})).catch(()=>{}); }
  for(const lang of VO_LANGS){ VO[lang]=[]; for(let i=0;i<VO_N;i++) sndFetch(`voz/${lang}/${String(i).padStart(2,'0')}.mp3`).then(ab=>
    AC.decodeAudioData(ab,buf=>{ VO[lang][i]=buf; },()=>{})).catch(()=>{}); }
}
// Motor: las RPM suben dentro de cada marcha y caen al cambiar, como una caja de cambios real.
let engQuiet=false;
function quietEngine(){ if(engQuiet||!AC||!engGain) return; engQuiet=true; const n=AC.currentTime; engGain.gain.setTargetAtTime(0,n,.2); if(trkGain) trkGain.gain.setTargetAtTime(0,n,.2);
  for(const k in LOOPS) LOOPS[k].g.gain.setTargetAtTime(0,n,.2); }
function engineUpdate(t,dt){
  if(!AC) return; engQuiet=false; const now=AC.currentTime;
  if(t.dead){ engGain.gain.setTargetAtTime(0,now,.3); if(LOOPS.turret) LOOPS.turret.g.gain.setTargetAtTime(0,now,.1); return; }
  const mx=Math.max(1,t.T.maxF||10), v=Math.abs(t.speed), r=v/mx, thr=(down('fwd')||down('back'))?1:0;
  const rpm=v<.4?.18+thr*.15:clamp(.3+((r*5)%1)*.65+thr*.08,.3,1);
  t._rpm=(t._rpm||.18)+(rpm-(t._rpm||.18))*Math.min(1,dt*4); const R=t._rpm;
  eng.frequency.setTargetAtTime(24+R*42,now,.05); eng2.frequency.setTargetAtTime((24+R*42)*2.03,now,.05);
  lfoG.gain.setTargetAtTime(.22+thr*.12,now,.1); engLP.frequency.setTargetAtTime(220+R*700+thr*250,now,.08);
  engGain.gain.setTargetAtTime(.22+R*.22+thr*.08,now,.1);
  trkGain.gain.setTargetAtTime(Math.min(.3,v*.025),now,.1); trkSrc.playbackRate.setTargetAtTime(.25+v*.11,now,.1);
  const mv=clamp(v/3,0,1);
  if(LOOPS.idle){ LOOPS.idle.g.gain.setTargetAtTime((1-mv*.75)*(.55+thr*.15),now,.15); LOOPS.idle.src.playbackRate.setTargetAtTime(.85+R*.45,now,.08); }
  if(LOOPS.drive){ LOOPS.drive.g.gain.setTargetAtTime(mv*(.7+thr*.2),now,.15); LOOPS.drive.src.playbackRate.setTargetAtTime(.72+R*.5,now,.08); }
  if(LOOPS.mgburst){ const on=now-mgLastShot<.12&&!t.dead; LOOPS.mgburst.g.gain.setTargetAtTime(on?.9:0,now,on?.005:.04); }
  if(LOOPS.turret){ const tr=Math.abs(wrap(t.turretYaw-(t._ty??t.turretYaw)))/Math.max(dt,.001); t._ty=t.turretYaw;
    LOOPS.turret.g.gain.setTargetAtTime(clamp(tr/(t.T.trav||.6),0,1)*.45,now,.05); LOOPS.turret.src.playbackRate.setTargetAtTime(.85+clamp(tr,0,1)*.2,now,.05); }
}
// Sonido 3D: posición, atenuación, filtro por distancia y retraso (el sonido viaja a 343 m/s).
function updateListener(){
  if(!AC) return; const Lr=AC.listener, p=camera.position, f=new THREE.Vector3(); camera.getWorldDirection(f); const u=camera.up;
  if(Lr.positionX){ Lr.positionX.value=p.x; Lr.positionY.value=p.y; Lr.positionZ.value=p.z; Lr.forwardX.value=f.x; Lr.forwardY.value=f.y; Lr.forwardZ.value=f.z; Lr.upX.value=u.x; Lr.upY.value=u.y; Lr.upZ.value=u.z; }
  else { Lr.setPosition(p.x,p.y,p.z); Lr.setOrientation(f.x,f.y,f.z,u.x,u.y,u.z); }
  extLP.frequency.setTargetAtTime(scoped&&state==='play'?1400:18000,AC.currentTime,.08);
}
function sfx(name,pos,vol=1,o={}){
  if(!AC||!SFX[name]||!SFX[name].length||vol<.005) return false;
  const L=SFX[name], src=AC.createBufferSource(); src.buffer=L[(Math.random()*L.length)|0]; src.playbackRate.value=(o.rate||1)*rand(.93,1.07);
  const g=AC.createGain(); g.gain.value=vol; let t0=AC.currentTime;
  if(o.near||!pos){ src.connect(g).connect(o.near?master:extBus); }
  else { const d=pos.distanceTo(camera.position); if(d>(o.maxD||1100)) return true;
    const pn=AC.createPanner(); pn.panningModel='equalpower'; pn.distanceModel='inverse'; pn.refDistance=o.ref||14; pn.rolloffFactor=o.roll||.9; pn.maxDistance=5000;
    if(pn.positionX){pn.positionX.value=pos.x;pn.positionY.value=pos.y;pn.positionZ.value=pos.z;} else pn.setPosition(pos.x,pos.y,pos.z);
    const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=Math.max(450,16000*Math.exp(-d/260));
    src.connect(lp).connect(g).connect(pn).connect(extBus); t0+=d/343; }
  src.start(t0); return true;
}
// Sonido de lo que cae: el proyectil de artillería "rasga" el aire (ruido que sube de tono y volumen hasta el impacto);
// la bomba de aviación silba bajando de tono (clásico silbido de bomba). Suena desde el punto de impacto y, si estás cerca, también "encima" tuyo.
function incoming(pos,dur,vol=.5,kind='shell'){
  if(kind===true) kind='nuke'; if(!AC||!pos) return; const t0=AC.currentTime, d=Math.max(.5,dur);
  const dist=Math.hypot(pos.x-camera.position.x,pos.z-camera.position.z); if(dist>900) return;
  const out=AC.createGain(); out.gain.value=1;
  const pn=AC.createPanner(); pn.panningModel='equalpower'; pn.distanceModel='inverse'; pn.refDistance=kind==='shell'?40:70; pn.rolloffFactor=.6;
  if(pn.positionX){pn.positionX.value=pos.x;pn.positionY.value=pos.y+25;pn.positionZ.value=pos.z;} else pn.setPosition(pos.x,pos.y+25,pos.z);
  out.connect(pn).connect(extBus);
  if(dist<220){ const nearG=AC.createGain(); nearG.gain.value=.35*(1-dist/220); out.connect(nearG).connect(extBus); } // pasa por encima: se siente en los dos oídos
  const env=AC.createGain(); env.connect(out);
  { const sm={shell:'shellin',bomb:'bombw',nuke:'nukew'}[kind];
    if(SFX[sm]&&SFX[sm].length){ const L=SFX[sm], buf=L[(Math.random()*L.length)|0], src=AC.createBufferSource(); src.buffer=buf;
      const rate=(kind==='shell'?1:clamp(buf.duration/d,.7,1.25))*rand(.96,1.04), len=buf.duration/rate; src.playbackRate.value=rate;
      env.gain.value=vol*(kind==='nuke'?2.2:kind==='bomb'?2:2.4); src.connect(env);
      if(len<=d) src.start(t0+d-len); else src.start(t0,(len-d)*rate); return; } }
  if(kind==='shell'){
    env.gain.setValueAtTime(.0001,t0); env.gain.exponentialRampToValueAtTime(vol*1.6,t0+d*.95); env.gain.exponentialRampToValueAtTime(.0001,t0+d);
    const n=AC.createBufferSource(); n.buffer=noiseBuf; n.loop=true; const bp=AC.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=1.6;
    bp.frequency.setValueAtTime(300,t0); bp.frequency.exponentialRampToValueAtTime(2600,t0+d);
    const hp=AC.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=180; n.connect(bp).connect(hp).connect(env);
    const o=AC.createOscillator(); o.type='triangle'; o.frequency.setValueAtTime(900,t0); o.frequency.exponentialRampToValueAtTime(1500,t0+d); const og=AC.createGain(); og.gain.value=.12; o.connect(og).connect(env);
    n.start(t0); o.start(t0); n.stop(t0+d+.02); o.stop(t0+d+.02);
  } else {
    const nk=kind==='nuke', f0=nk?900:1500, f1=nk?160:330;
    env.gain.setValueAtTime(.0001,t0); env.gain.exponentialRampToValueAtTime(vol*(nk?1.4:1.2),t0+d*.9); env.gain.exponentialRampToValueAtTime(.0001,t0+d);
    const o=AC.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(f0,t0); o.frequency.exponentialRampToValueAtTime(f1,t0+d);
    const lfo=AC.createOscillator(); lfo.frequency.value=nk?4:7; const lg=AC.createGain(); lg.gain.value=nk?8:14; lfo.connect(lg).connect(o.frequency);
    const o2=AC.createOscillator(); o2.type='sine'; o2.frequency.setValueAtTime(f0*2.01,t0); o2.frequency.exponentialRampToValueAtTime(f1*2.01,t0+d); const g2=AC.createGain(); g2.gain.value=.22;
    const n=AC.createBufferSource(); n.buffer=noiseBuf; n.loop=true; const bp=AC.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=3; bp.frequency.setValueAtTime(f0,t0); bp.frequency.exponentialRampToValueAtTime(f1,t0+d);
    const ng=AC.createGain(); ng.gain.value=.5; o.connect(env); o2.connect(g2).connect(env); n.connect(bp).connect(ng).connect(env);
    [o,o2,lfo,n].forEach(x=>{x.start(t0); x.stop(t0+d+.02);});
  }
}
// Fuente en bucle que sigue a un objeto en movimiento (avión): devuelve un control para moverla y apagarla.
function movingLoop(name,vol,{rate=1,start=0,ref=60,lp=6000}={}){
  if(!AC||!SFX[name]||!SFX[name].length) return null;
  const src=AC.createBufferSource(); src.buffer=SFX[name][0]; src.loop=true; src.playbackRate.value=rate;
  const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=lp; const g=AC.createGain(); g.gain.value=vol;
  const pn=AC.createPanner(); pn.panningModel='equalpower'; pn.distanceModel='inverse'; pn.refDistance=ref; pn.rolloffFactor=1;
  src.connect(f).connect(g).connect(pn).connect(extBus); src.start(0,start);
  const L={ dead:false, set(p){ if(pn.positionX){pn.positionX.value=p.x;pn.positionY.value=p.y;pn.positionZ.value=p.z;} else pn.setPosition(p.x,p.y,p.z);
      const d=p.distanceTo(camera.position); f.frequency.value=Math.max(500,lp*Math.exp(-d/500)); },
    stop(){ if(L.dead) return; L.dead=true; liveLoops.delete(L); try{ g.gain.setTargetAtTime(0,AC.currentTime,.4); src.stop(AC.currentTime+2); }catch(e){} } };
  liveLoops.add(L); return L;
}
const liveLoops=new Set();
function stopAllLoops(){ for(const L of [...liveLoops]) L.stop(); }
// Intro: ambiente de batalla lejana en el menú y la previa de cada escenario.
// Detonación nuclear por capas, sin esperar a que el sonido "viaje": golpe inmediato, rugido largo y onda expansiva.
function nukeSound(p){
  if(!AC) return; const t=AC.currentTime;
  if(SFX.nukeb&&SFX.nukeb.length) sfx('nukeb',null,2.2,{near:true,rate:1});
  sfx('expl',null,1.8,{near:true,rate:.38}); sfx('sboom',null,1.5,{near:true,rate:.6});
  setTimeout(()=>sfx('expl',null,1.2,{near:true,rate:.3}),700); setTimeout(()=>sfx('sboom',null,1.1,{near:true,rate:.5}),1800);
  const n=AC.createBufferSource(); n.buffer=noiseBuf; n.loop=true; const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.setValueAtTime(400,t); f.frequency.exponentialRampToValueAtTime(60,t+12);
  const g=AC.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(1.4,t+.3); g.gain.exponentialRampToValueAtTime(.0001,t+14);
  n.connect(f).connect(g).connect(master); n.start(t); n.stop(t+14.2);
  const o=AC.createOscillator(); o.frequency.setValueAtTime(48,t); o.frequency.exponentialRampToValueAtTime(22,t+8); const og=AC.createGain();
  og.gain.setValueAtTime(.0001,t); og.gain.exponentialRampToValueAtTime(.9,t+.2); og.gain.exponentialRampToValueAtTime(.0001,t+9); o.connect(og).connect(master); o.start(t); o.stop(t+9.1);
  if(engGain) engGain.gain.setTargetAtTime(0,t,.2);
}
// ---------- Música de menús (generada, sin disparos) y ambiente del hangar (pruebas de tanques a lo lejos) ----------
let musMode=null, mus=null;
const NOTE=n=>440*Math.pow(2,(n-69)/12);
function musStop(){ if(!mus) return; const m=mus; mus=null; clearInterval(m.iv); clearTimeout(m.ev); m.out.gain.setTargetAtTime(0,AC.currentTime,.5); setTimeout(()=>{ try{ m.nodes.forEach(n=>n.stop&&n.stop()); m.out.disconnect(); }catch(e){} },2500); }
function musStart(mode){
  const out=AC.createGain(); out.gain.setValueAtTime(0,AC.currentTime); out.gain.linearRampToValueAtTime(mode==='hangar'?.9:.5,AC.currentTime+2.5); out.connect(master);
  const m={out,nodes:[],mode}; mus=m;
  if(mode==='music'){
    // Re menor, lento: Dm - Bb - F - C con colchón, bajo, eco y tambor grave
    const dly=AC.createDelay(1); dly.delayTime.value=.42; const fb=AC.createGain(); fb.gain.value=.38; const wet=AC.createGain(); wet.gain.value=.35; dly.connect(fb).connect(dly); dly.connect(wet).connect(out);
    const CH=[[50,53,57,62],[46,50,53,58],[41,48,53,57],[48,52,55,60]], BAR=4.2, MEL=[62,65,67,69,72,74,69,67];
    let bar=0, next=AC.currentTime+.2;
    const pad=(f,t,d,v)=>{ for(const det of [-6,6]){ const o=AC.createOscillator(); o.type='sawtooth'; o.frequency.value=f; o.detune.value=det; const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=700; lp.Q.value=.6;
        const g=AC.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+1.4); g.gain.setValueAtTime(v,t+d-1.2); g.gain.linearRampToValueAtTime(0,t+d+.6); o.connect(lp).connect(g).connect(out); o.start(t); o.stop(t+d+.7); } };
    const bass=(f,t,d)=>{ const o=AC.createOscillator(); o.type='sine'; o.frequency.value=f; const g=AC.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.32,t+.3); g.gain.exponentialRampToValueAtTime(.001,t+d); o.connect(g).connect(out); o.start(t); o.stop(t+d); };
    const drum=(t,v)=>{ const o=AC.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(90,t); o.frequency.exponentialRampToValueAtTime(42,t+.5); const g=AC.createGain(); g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+.9); o.connect(g).connect(out); o.start(t); o.stop(t+1); };
    const bell=(f,t)=>{ const o=AC.createOscillator(); o.type='triangle'; o.frequency.value=f; const g=AC.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.09,t+.02); g.gain.exponentialRampToValueAtTime(.001,t+2.2); o.connect(g); g.connect(out); g.connect(dly); o.start(t); o.stop(t+2.3); };
    const sched=()=>{ while(next<AC.currentTime+1.5){ const c=CH[bar%4], t=next;
        c.forEach(n=>pad(NOTE(n),t,BAR,.028)); bass(NOTE(c[0]-12),t,BAR*.95); drum(t,.32); if(bar%2) drum(t+BAR*.5,.18); if(bar%4===3) drum(t+BAR*.75,.14);
        if(bar>1) for(let k=0;k<3;k++) if(Math.random()<.55) bell(NOTE(MEL[(Math.random()*MEL.length)|0]),t+k*BAR/3+rand(0,.3));
        bar++; next+=BAR; } };
    sched(); m.iv=setInterval(()=>{ if(mus===m) sched(); },400);
  } else {
    // Hangar: el campo de pruebas a lo lejos (filtrado), un motor en ralentí cerca y herramientas
    const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=650; lp.connect(out);
    if(SFX.intro&&SFX.intro.length){ const b=AC.createBufferSource(); b.buffer=SFX.intro[0]; b.loop=true; const g=AC.createGain(); g.gain.value=.4; b.connect(g).connect(lp); b.start(); m.nodes.push(b); }
    if(SFX.idle&&SFX.idle.length){ const b=AC.createBufferSource(); b.buffer=SFX.idle[0]; b.loop=true; b.loopStart=.2; b.loopEnd=.2+LOOP_LEN.idle; b.playbackRate.value=.9; const g=AC.createGain(); g.gain.value=.1; b.connect(g).connect(out); b.start(); m.nodes.push(b); }
    const ev=()=>{ if(mus!==m) return; const r=Math.random();
      if(r<.45) sfx('metal',null,rand(.06,.13),{near:true,rate:rand(.9,1.6)});           // herramientas
      else if(r<.7) sfx('turret',null,.07,{near:true,rate:rand(.8,1.1)});                 // torre girando
      else if(r<.9){ const s2=AC.createBufferSource(); if(SFX.cannon&&SFX.cannon.length){ s2.buffer=SFX.cannon[0]; s2.playbackRate.value=rand(.75,.9); const g=AC.createGain(); g.gain.value=.25; s2.connect(g).connect(lp); s2.start(); } } // disparo de prueba lejos
      else if(SFX.drive&&SFX.drive.length){ const s2=AC.createBufferSource(); s2.buffer=SFX.drive[0]; s2.playbackRate.value=.8; const g=AC.createGain(); g.gain.setValueAtTime(0,AC.currentTime); g.gain.linearRampToValueAtTime(.12,AC.currentTime+1); g.gain.linearRampToValueAtTime(0,AC.currentTime+3); s2.connect(g).connect(lp); s2.start(); s2.stop(AC.currentTime+3.2); }
      m.ev=setTimeout(ev,rand(2500,6500)); };
    m.ev=setTimeout(ev,1500);
  }
}
function syncIntro(){
  if(!AC) return;
  const want=['menu','summary','lobby','brief','intro'].includes(state)?(state==='menu'&&menuScreen==='hangar'?'hangar':'music'):null;
  if(want===musMode) return; musMode=want; musStop(); if(want) musStart(want);
}
document.addEventListener('pointerdown',()=>{ initAudio(); if(AC.state==='suspended') AC.resume(); syncIntro(); });
// Radio de la tripulación: voces grabadas (texto a voz) en el idioma de la nación, con filtro de radio, estática y corte.
const RADIO_IDX={'¡Cargado!':0,'¡Cargador listo!':0,'¡Penetración!':1,'¡Rebotó!':2,'No penetró.':3,'¡Blanco destruido!':4,'¡Nos penetraron!':5,
  '¡Rebotó en el blindaje!':6,'El blindaje aguantó.':7,'¡Oruga rota!':8,'¡Motor destruido!':9,'¡Fuego a bordo!':10,'¡Cañón dañado!':11,'¡Tripulación lista! ¡Adelante!':13};
const LANG_OF={uk:'en-gb',us:'en-us',de:'de',ru:'ru'};
let radioBusy=0, radioCurve=null, mgLastShot=-1;
function radio(msg,prio=1){
  if(!radioOn||!AC||state!=='play') return;
  const idx=RADIO_IDX[msg]??(String(msg).startsWith('¡Perdimos')?12:-1); if(idx<0) return;
  const nat=(playerCrew&&playerCrew.nation)||allyNation, lang=LANG_OF[nat]||'es', buf=VO[lang]&&VO[lang][idx]; if(!buf) return;
  const t0=AC.currentTime+.12; if(prio<2&&t0<radioBusy) return;
  if(!radioCurve){ radioCurve=new Float32Array(2048); for(let i=0;i<2048;i++){ const x=i/1023.5-1, y=Math.tanh(x*5)/Math.tanh(5); radioCurve[i]=Math.round(y*24)/24; } } // saturación + cuantizado (equipo viejo)
  const urgent=prio>=2, rate=urgent?1.16:1.1;
  // Cadena: compresor fuerte → banda de radio (450-2700 Hz) con pico nasal → saturación → recorte final
  const out=AC.createGain(); out.gain.value=.85; out.connect(master);
  const comp=AC.createDynamicsCompressor(); comp.threshold.value=-34; comp.knee.value=4; comp.ratio.value=14; comp.attack.value=.002; comp.release.value=.08;
  const pre=AC.createGain(); pre.gain.value=urgent?5:4;
  const hp=AC.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=450; hp.Q.value=.9;
  const pk=AC.createBiquadFilter(); pk.type='peaking'; pk.frequency.value=1500; pk.Q.value=1.4; pk.gain.value=10;
  const ws=AC.createWaveShaper(); ws.curve=radioCurve; ws.oversample='2x';
  const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2700; lp.Q.value=1.2;
  const lp2=AC.createBiquadFilter(); lp2.type='lowpass'; lp2.frequency.value=3200;
  const bus=AC.createGain(); bus.connect(comp).connect(pre).connect(hp).connect(pk).connect(ws).connect(lp).connect(lp2).connect(out);
  // La voz, más rápida y un poco más aguda: suena apurada, como gritando bajo fuego.
  const src=AC.createBufferSource(); src.buffer=buf; src.playbackRate.value=rate; const vg=AC.createGain(); vg.gain.value=1.3; src.connect(vg).connect(bus);
  const dur=buf.duration/rate;
  // Clic de apertura del micrófono
  const ck=AC.createBufferSource(); ck.buffer=noiseBuf; const cg=AC.createGain(); cg.gain.setValueAtTime(.6,t0-.07); cg.gain.exponentialRampToValueAtTime(.001,t0-.03); ck.connect(cg).connect(bus); ck.start(t0-.07,Math.random()*.5,.05);
  // Ruido de la batalla dentro de la transmisión: motor del tanque y estática que pasan por el mismo micrófono
  const bg=(name,vol,loopLen,off)=>{ if(!SFX[name]||!SFX[name].length) return; const n=AC.createBufferSource(); n.buffer=SFX[name][0]; n.loop=true; if(loopLen){n.loopStart=.2;n.loopEnd=.2+loopLen;}
    const g=AC.createGain(); g.gain.setValueAtTime(0,t0-.07); g.gain.linearRampToValueAtTime(vol,t0-.02); g.gain.setValueAtTime(vol,t0+dur); g.gain.linearRampToValueAtTime(0,t0+dur+.1);
    n.connect(g).connect(bus); n.start(t0-.07,off); n.stop(t0+dur+.15); };
  bg('static',.22,LOOP_LEN.static,.2+Math.random()*2); bg('drive',.35,LOOP_LEN.drive,.2+Math.random()*2);
  if(urgent&&SFX.mgshot&&Math.random()<.6) for(let i=0;i<5;i++){ const m=AC.createBufferSource(); m.buffer=SFX.mgshot[0]; const mg=AC.createGain(); mg.gain.value=.25; m.connect(mg).connect(bus); m.start(t0+dur*.3+i*.09); }
  src.start(t0);
  // Corte de transmisión
  if(SFX.squelch&&SFX.squelch.length){ const sq=AC.createBufferSource(); sq.buffer=SFX.squelch[0]; const qg=AC.createGain(); qg.gain.value=.6; sq.connect(qg).connect(out); sq.start(t0+dur+.03); }
  radioBusy=t0+dur+.45;
}
const SEAT_RADIO={driver:'conductor',codriver:'ametrallador',gunner:'artillero',commander:'comandante',loader:'cargador',mg1:'ametrallador',mg2:'ametrallador',mg3:'ametrallador',mg4:'ametrallador',mech1:'mecánico',mech2:'mecánico',gear1:'cambista',gear2:'cambista'};
function radioWatch(t){
  const w=t._rw||(t._rw={load:t.reloadT>0,trk:t.trackT>0,eng:t.mod.engine<=0,fire:t.fireT>0,gun:t.mod.breech<=0,crew:t.crewM.filter(m=>m.alive).map(m=>m.seat)});
  const loading=t.reloadT>0; if(w.load&&!loading&&t.mod.breech>0&&manned(t,'gunner')){ if(!t.T.auto) sfx('metal',null,.35,{near:true,rate:.4}); radio(t.T.auto?'¡Cargador listo!':'¡Cargado!'); } w.load=loading;
  if(t.trackT>0&&!w.trk) radio('¡Oruga rota!',2); w.trk=t.trackT>0;
  if(t.mod.engine<=0&&!w.eng) radio('¡Motor destruido!',2); w.eng=t.mod.engine<=0;
  if(t.fireT>0&&!w.fire) radio('¡Fuego a bordo!',2); w.fire=t.fireT>0;
  { const gd=t.mod.breech<=0||(t.mod.barrel??100)<=0; if(gd&&!w.gun) radio('¡Cañón dañado!',2); w.gun=gd; }
  const alive=t.crewM.filter(m=>m.alive).map(m=>m.seat), lost=w.crew.filter(sn=>!alive.includes(sn));
  if(lost.length) radio(`¡Perdimos al ${SEAT_RADIO[lost[0]]||'tripulante'}!`,2); w.crew=alive;
}
function boom(vol,len=.9,freq=900){
  if(!AC||vol<.01) return; const t=AC.currentTime;
  const s=AC.createBufferSource(); s.buffer=noiseBuf; const f=AC.createBiquadFilter(); f.type='lowpass';
  f.frequency.setValueAtTime(freq,t); f.frequency.exponentialRampToValueAtTime(60,t+len);
  const g=AC.createGain(); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+len);
  s.connect(f).connect(g).connect(extBus); s.start(t); s.stop(t+len);
  if(len<.2) return;
  const o=AC.createOscillator(); o.frequency.setValueAtTime(90,t); o.frequency.exponentialRampToValueAtTime(25,t+.35);
  const og=AC.createGain(); og.gain.setValueAtTime(vol,t); og.gain.exponentialRampToValueAtTime(.001,t+.35);
  o.connect(og).connect(extBus); o.start(t); o.stop(t+.36);
}
function clang(vol){ if(!AC||vol<.01) return; const t=AC.currentTime;
  [1150,1730,2400].forEach((fq,i)=>{const o=AC.createOscillator();o.type='triangle';o.frequency.value=fq;const g=AC.createGain();
    g.gain.setValueAtTime(vol/(i+1),t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g).connect(extBus);o.start(t);o.stop(t+.31);});}
function whistle(){ if(!AC) return; const t=AC.currentTime; const o=AC.createOscillator(); o.type='sine';
  o.frequency.setValueAtTime(1400,t); o.frequency.exponentialRampToValueAtTime(300,t+2.6);
  const g=AC.createGain(); g.gain.setValueAtTime(.001,t); g.gain.linearRampToValueAtTime(.06,t+.5); g.gain.exponentialRampToValueAtTime(.001,t+2.7);
  o.connect(g).connect(extBus); o.start(t); o.stop(t+2.75);}
const distVol=(p,base)=>base*clamp(1-p.distanceTo(camera.position)/420,0,1);

