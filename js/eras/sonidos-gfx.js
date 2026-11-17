/* ---------- Sonidos de GFXSounds (17/11/2026, pedido de Sebastián; licencia gratis con crédito: "Sound effects from https://gfxsounds.com") ----------
   · Escotillas: se abre cuando el mecánico baja a reparar (t.mech) y se cierra cuando vuelve a subir (hatcho / hatchc).
   · Subfusiles (MP 40, PPSh, Thompson, Sten): ráfaga grabada en vez del chasquido sintético del fusil (smg).
   · Pasada: un tanque que pasa cerca de la cámara a más de 3 m/s suena con sus orugas (pass, con su efecto Doppler). */
(function(){
  if(typeof SND_FILES!=='undefined') Object.assign(SND_FILES,{smg:1,hatcho:1,hatchc:1,pass:1});
  const ready=()=>{ if(typeof AC==='undefined'||!AC||typeof SFX==='undefined') return false;
    for(const k of ['smg','hatcho','hatchc','pass']) if(!SFX[k]){ SFX[k]=[]; sndFetch(`snd/${k}_0.mp3`).then(ab=>AC.decodeAudioData(ab)).then(b=>SFX[k].push(b)).catch(()=>{}); }
    return true; };
  const SMG={mp40:1,ppsh:1,thompson:1,sten:1};
  let passG=-99;
  const _tf=tankFX; tankFX=function(t,dt){ const r=_tf.apply(this,arguments);
    try{ if(!ready()||t.dead) return r;
      const hm=!!t.mech; if(hm!==!!t._hm){ t._hm=hm; sfx(hm?'hatcho':'hatchc',t.pos,.9,{ref:10}); }
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
