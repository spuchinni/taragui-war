// Apoyos del jugador (pedido de Sebastián): la radio dicta las coordenadas a la batería ("Coordenadas 4-7-2, 3-1-8… ¡Fuego!")
// y la primera vez que se usa la artillería y la primera vez el bombardeo sale una animación corta (una sola vez cada una: tw2_cArty, tw2_cAir).
// La animación cambia solo la cámara con la que se dibuja (envuelve renderer.render); la partida sigue y el tanque queda inmune mientras dura.
// Mientras dura no se maneja ni se dispara (pedido de Sebastián: moverse o tocar una tecla la cortaba); se saltea solo con el botón "Saltear".
(function(){
  const EN=()=>window.LANG==='en';
  const LSg=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } }, LSs=k=>{ try{ localStorage.setItem(k,'1'); }catch(e){} };
  const st=document.createElement('style'); st.textContent=`
    #radioBox{position:fixed;left:0;right:0;margin:0 auto;width:max-content;bottom:150px;z-index:26;display:none;pointer-events:none;background:rgba(14,16,12,.88);border:2px solid #9fb36a;border-radius:10px;padding:8px 16px;color:#e8f0c8;font:700 20px 'Saira Condensed',system-ui,sans-serif;white-space:nowrap;box-shadow:0 2px 10px #000}
    #radioBox b{color:#ffd24a} #radioBox .f{color:#ff8a3a;font-size:26px;font-weight:900}
    body.movil #radioBox{bottom:110px;font-size:15px}
    #cineBox{position:fixed;inset:0;z-index:40;display:none;pointer-events:none}
    #cineBox:before,#cineBox:after{content:'';position:absolute;left:0;right:0;height:11vh;background:#000}
    #cineBox:before{top:0} #cineBox:after{bottom:0}
    #cineBox .t{position:absolute;left:0;right:0;bottom:calc(11vh + 14px);text-align:center;color:#fff;font:800 26px 'Saira Condensed',system-ui,sans-serif;text-shadow:0 2px 6px #000}
    #cineBox .s{position:absolute;right:16px;top:calc(11vh + 10px);pointer-events:auto;cursor:pointer;background:rgba(0,0,0,.55);border:1px solid #888;border-radius:6px;color:#ddd;font:600 14px system-ui,sans-serif;padding:4px 10px}
    body.cine .hud,body.cine #ov,body.cine #mm,body.cine #tutbox,body.cine #hcBox,body.cine #tch,body.cine #weakMk,body.cine #radioBox{visibility:hidden!important}`;
  document.head.appendChild(st);
  const rb=document.createElement('div'); rb.id='radioBox'; rb.setAttribute('data-notr',''); document.body.appendChild(rb);
  const cb=document.createElement('div'); cb.id='cineBox'; cb.setAttribute('data-notr',''); document.body.appendChild(cb);

  // ---- radio con coordenadas ----
  function coords(p){ const bx=W.bx||750, bz=W.bz||750;
    const e=Math.max(0,Math.min(999,Math.round((bx-p.x)/(2*bx)*999))), n=Math.max(0,Math.min(999,Math.round((p.z+bz)/(2*bz)*999)));   // x = oeste, z = norte
    return [String(e).padStart(3,'0'),String(n).padStart(3,'0')]; }
  let rbT=null;
  // (la voz del navegador, speechSynthesis, se sacó: sonaba muy mal. Ahora son las palabras grabadas por Sebastián)
  // ---- voz de radio grabada por Sebastián (voz/radio/*.mp3, solo en castellano): palabras sueltas que se encadenan con filtro de radio ----
  const RW=['coordenadas','0','1','2','3','4','5','6','7','8','9','fuego','alfa','bravo','charlie','bombardeo','capturamos','perdimos','fuego-sobre'], RB={}; let rwLoad=false, rvBusy=0;
  function rvLoad(){ if(rwLoad||typeof AC==='undefined'||!AC) return; rwLoad=true;
    for(const w of RW) sndFetch(`voz/radio/${w}.mp3`).then(ab=>AC.decodeAudioData(ab,b=>{ RB[w]=b; },()=>{})).catch(()=>{}); }
  let rvCurve=null;
  // cadena de radio de campaña (segunda versión, pedido de Sebastián: "que suene a radio"): banda angosta de 550–2400 Hz en dos etapas,
  // pico nasal, saturación fuerte y cuantizada (equipo viejo), un poco de AM que tiembla, estática con chasquidos y "kshh" al cortar
  function rvChain(t0,t1){ const out=AC.createGain(); out.gain.value=1; out.connect(master);
    if(!rvCurve){ rvCurve=new Float32Array(2048); for(let i=0;i<2048;i++){ const x=i/1023.5-1, y=Math.tanh(x*6)/Math.tanh(6); rvCurve[i]=Math.round(y*20)/20; } }
    const F=(type,f,q)=>{ const b=AC.createBiquadFilter(); b.type=type; b.frequency.value=f; if(q) b.Q.value=q; return b; };
    const comp=AC.createDynamicsCompressor(); comp.threshold.value=-36; comp.knee.value=3; comp.ratio.value=16; comp.attack.value=.002; comp.release.value=.06;
    const pre=AC.createGain(); pre.gain.value=3.2; const ws=AC.createWaveShaper(); ws.curve=rvCurve; ws.oversample='2x';
    const am=AC.createGain(); am.gain.value=.8; const lfo=AC.createOscillator(); lfo.frequency.value=7; const lg=AC.createGain(); lg.gain.value=.18; lfo.connect(lg).connect(am.gain); lfo.start(t0); lfo.stop(t1+.5);
    const post=AC.createGain(); post.gain.value=.5;
    const bus=AC.createGain(); bus.connect(comp).connect(pre).connect(F('highpass',550,1.1)).connect(F('highpass',550,.7)).connect(F('peaking',1700,1.6)).connect(ws)
      .connect(F('lowpass',2400,1.3)).connect(F('lowpass',2600,.8)).connect(am).connect(post).connect(out);
    bus._pk=null;
    // estática: ruido en banda + chasquidos sueltos, más fuerte al abrir y al cerrar el micrófono
    const L=AC.sampleRate*2, nb=AC.createBuffer(1,L,AC.sampleRate), d=nb.getChannelData(0);
    for(let i=0;i<L;i++){ d[i]=(Math.random()*2-1)*.11; if(Math.random()<.0006) for(let k=0;k<60&&i+k<L;k++) d[i+k]+=(Math.random()*2-1)*.6*Math.exp(-k/12); }
    const ns=AC.createBufferSource(); ns.buffer=nb; ns.loop=true; const ng=AC.createGain();
    ng.gain.setValueAtTime(0,t0-.12); ng.gain.linearRampToValueAtTime(.9,t0-.1); ng.gain.linearRampToValueAtTime(.32,t0+.02);   // golpe al apretar el botón
    ng.gain.setValueAtTime(.32,t1); ng.gain.linearRampToValueAtTime(1,t1+.03); ng.gain.linearRampToValueAtTime(0,t1+.28);         // "kshh" al soltarlo
    ns.connect(F('bandpass',1700,.7)).connect(F('highpass',400)).connect(ng).connect(out); ns.start(t0-.12); ns.stop(t1+.3);
    return bus; }
  // words: lista de palabras ('|' = pausa corta). Devuelve cuánto dura.
  const RV_ON=false;   // voces grabadas apagadas por ahora (pedido de Sebastián: "no me gusta como quedó"); queda el cartel de radio con el chasquido
  function rvSay(words,delay=0){ if(!RV_ON||EN()||typeof AC==='undefined'||!AC||!radioOn||volMaster<.02) return 0; rvLoad(); if(words.some(w=>w!=='|'&&!RB[w])) return 0;
    let t=Math.max(AC.currentTime+.2+delay,rvBusy); const t0=t; let te=t;
    for(const w of words) te+=w==='|'?.18:RB[w].duration/1.06-.03;
    const bus=rvChain(t0,te);
    for(const w of words){ if(w==='|'){ t+=.18; continue; } const s=AC.createBufferSource(); s.buffer=RB[w]; s.playbackRate.value=1.06; s.connect(bus); s.start(t); t+=RB[w].duration/1.06-.03; }
    rvBusy=t+.35; return t-t0; }
  const ZW={A:'alfa',B:'bravo',C:'charlie'};
  // capturamos / perdimos un punto (se mira cada cuadro, así también lo oyen los invitados)
  { const _fr=frame; frame=function(){ const r=_fr.apply(this,arguments);
      try{ rvLoad(); if(state==='play'&&player&&!tut&&typeof zones!=='undefined'){ const mine=player.team===0?1:-1;
        for(const Z of zones){ const o=Z.owner; if(Z._vo===undefined){ Z._vo=o; continue; } if(o===Z._vo) continue;
          const w=ZW[Z.id]; if(w&&o===mine) rvSay(['capturamos',w]); else if(w&&Z._vo===mine&&o===-mine) rvSay(['perdimos',w]); Z._vo=o; } } }catch(e){}
      return r; }; }
  window.rvSay=rvSay; window.rvBuf=RB;
  function radio(point,D){ const [e,n]=coords(point), en=EN(), sp=s=>s.split('').join('-');
    // sobre un punto: "Fuego sobre Bravo"; si no, las coordenadas
    const zn=(typeof zones!=='undefined'?zones:[]).find(Z=>ZW[Z.id]&&Math.hypot(Z.x-point.x,Z.z-point.z)<(Z.r||20)*1.2);
    const dur=rvSay(zn?['fuego-sobre',ZW[zn.id]]:['coordenadas',...e.split(''),'|',...n.split('')]);
    if(dur) setTimeout(()=>rvSay(['fuego']),dur*1000+400);
    const head=zn?`📻 ${en?'Fire on':'Fuego sobre'} <b>${en?{A:'Alpha',B:'Bravo',C:'Charlie'}[zn.id]:ZW[zn.id][0].toUpperCase()+ZW[zn.id].slice(1)}</b>…`:`📻 ${en?'Coordinates':'Coordenadas'} <b>${sp(e)}</b>, <b>${sp(n)}</b>…`;
    rb.innerHTML=head; rb.style.display='block';
    if(!dur) try{ sfx('squelch',null,.5); }catch(e){}
    clearTimeout(rbT); rbT=setTimeout(()=>{ rb.innerHTML=`${head} <span class="f">${en?'FIRE!':'¡FUEGOOO!'}</span>`;
      rbT=setTimeout(()=>{ rb.style.display='none'; },2600); },dur?dur*1000+400:1900); }

  // ---- animación: cámara propia ----
  const CI={on:false}, cam=new THREE.PerspectiveCamera(50,1,.5,4000);
  function cineStart(o){ if(CI.on) cineEnd(); Object.assign(CI,{on:true,t0:now,dur:o.dur,upd:o.upd,end:o.end}); cb.innerHTML=`<div class="t">${o.title}</div><button class="s" id="cineSkip">${EN()?'Skip ⏭':'Saltear ⏭'}</button>`; cb.querySelector('#cineSkip').onclick=e=>{ e.stopPropagation(); cineEnd(); };
    cb.style.display='block'; document.body.classList.add('cine'); try{ releaseAll(); mouseDown=false; rightDown=false; }catch(e){}
    if(player&&!player.dead) player.immuneT=Math.max(player.immuneT||0,o.dur+1); }
  function cineEnd(){ if(!CI.on) return; CI.on=false; cb.style.display='none'; document.body.classList.remove('cine'); try{ CI.end&&CI.end(); }catch(e){} }
  // mientras dura: el tanque no recibe teclas ni clics (no se mueve ni dispara); solo el botón Saltear la corta
  const block=e=>{ if(!CI.on) return; if(e.target&&e.target.id==='cineSkip') return; e.stopImmediatePropagation(); if(e.cancelable) e.preventDefault(); };
  for(const ev of ['keydown','keyup','mousedown','mouseup','touchstart']) document.addEventListener(ev,block,{capture:true,passive:false});
  { const _f=frame; frame=function(){ if(CI.on){ try{ releaseAll(); mouseDown=false; rightDown=false; if(typeof T!=='undefined'&&T&&T.ax) T.ax.x=T.ax.y=0; }catch(e){} } return _f.apply(this,arguments); }; }
  const _rr=renderer.render; renderer.render=function(sc,c){
    if(CI.on&&sc===scene&&renderer.getRenderTarget()===null){
      if(state!=='play'&&state!=='lesson'&&state!=='paused'){ cineEnd(); return _rr.call(this,sc,c); }
      const k=(now-CI.t0)/CI.dur; if(k>=1){ cineEnd(); return _rr.call(this,sc,c); }
      try{ cam.aspect=c.aspect; cam.fov=50; CI.upd(k,now-CI.t0,cam); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); return _rr.call(this,sc,cam); }catch(e){ console.warn('cine',e); cineEnd(); } }
    return _rr.call(this,sc,c); };

  // ---- batería de 4 piezas detrás de la base (solo para la animación) ----
  // pieza de artillería según el país (pedido de Sebastián): leFH 18 de 105 mm (Alemania), M-30 de 122 mm (URSS), M2A1 de 105 mm (EE. UU.),
  // 25 libras (88 mm, R. Unido, con plataforma de tiro circular y mástil único), Schneider 105 mm mod. 1928 y Bofors 75 mm mod. 1935 (Argentina)
  const GUNS={
    de:{col:0x5c5f4c,wR:.62,wheel:'steel',trail:'split',sh:[2.0,1.15,'flat'],bl:2.95,br:.075,brake:0,recup:'over',name:'leFH 18'},
    ru:{col:0x4d5a3a,wR:.6,wheel:'tyre',trail:'split',sh:[2.1,1.2,'notch'],bl:2.9,br:.085,brake:0,recup:'under',name:'M-30'},
    us:{col:0x4e5236,wR:.55,wheel:'tyre',trail:'split',sh:[1.9,1.0,'flat'],bl:2.6,br:.072,brake:0,recup:'under2',name:'M2A1'},
    uk:{col:0x5a5a40,wR:.72,wheel:'tyre',trail:'box',sh:[1.7,1.0,'curve'],bl:2.45,br:.064,brake:1,recup:'over',plat:1,name:'25 libras'},
    ar:{col:0x55583c,wR:.7,wheel:'spoke',trail:'split',sh:[1.8,1.1,'flat'],bl:2.3,br:.07,brake:0,recup:'under',name:'Schneider 105 mm'},
    ar2:{col:0x55583c,wR:.6,wheel:'tyre',trail:'split',sh:[1.8,.95,'notch'],bl:3.1,br:.05,brake:1,recup:'under',name:'Bofors 75 mm'},
    gen:{col:0x55603f,wR:.62,wheel:'steel',trail:'split',sh:[2.0,1.1,'flat'],bl:3.0,br:.08,brake:0,recup:'under',name:''} };
  function gunPiece(nat,i){ const S=GUNS[nat==='ar'&&i%2?'ar2':nat]||GUNS.gen, g=new THREE.Group(), m=new THREE.MeshLambertMaterial({color:S.col}), d=new THREE.MeshLambertMaterial({color:0x2a2822}),
      rub=new THREE.MeshLambertMaterial({color:0x1a1a1a}), wood=new THREE.MeshLambertMaterial({color:0x6a5236});
    const add=(geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{ const o=new THREE.Mesh(geo,mat); o.position.set(x,y,z); o.rotation.set(rx,ry,rz); g.add(o); return o; };
    const R=S.wR, ax=R+.02;
    if(S.plat) add(new THREE.CylinderGeometry(1.25,1.25,.1,20),m,0,.05,0);                                                  // plataforma de tiro del 25 libras
    for(const s of [-1,1]){ const x=s*(S.sh[0]/2-.1);
      if(S.wheel==='spoke'){ add(new THREE.TorusGeometry(R-.05,.06,5,18),wood,x,ax,0,0,Math.PI/2); for(let k=0;k<12;k++) add(new THREE.BoxGeometry(.04,R*2-.15,.05),wood,x,ax,0,k/12*Math.PI,0,0);
        add(new THREE.TorusGeometry(R-.01,.03,4,18),d,x,ax,0,0,Math.PI/2); }
      else { add(new THREE.CylinderGeometry(R,R,S.wheel==='tyre'?.26:.14,16),S.wheel==='tyre'?rub:d,x,ax,0,0,0,Math.PI/2); add(new THREE.CylinderGeometry(R*.62,R*.62,S.wheel==='tyre'?.28:.16,12),m,x,ax,0,0,0,Math.PI/2); }
      add(new THREE.CylinderGeometry(.09,.09,.32,8),d,x,ax,0,0,0,Math.PI/2); }
    add(new THREE.BoxGeometry(S.sh[0]-.3,.16,.22),m,0,ax,0);                                                                    // eje
    if(S.trail==='box'){ add(new THREE.BoxGeometry(.32,.22,3.3),m,0,.4,-1.8,-.14); add(new THREE.BoxGeometry(.5,.1,.35),d,0,.08,-3.4); }
    else for(const s of [-1,1]){ add(new THREE.BoxGeometry(.16,.18,3.4),m,s*.42,.4,-1.75,-.14,-s*.2); add(new THREE.BoxGeometry(.28,.3,.12),d,s*.78,.1,-3.35,0,-s*.2); }   // mástiles abiertos con las palas
    add(new THREE.BoxGeometry(.9,.36,1.0),m,0,ax+.25,0);                                                                        // afuste superior
    // escudo
    const sw=S.sh[0], shH=S.sh[1], sy=ax+.2+shH/2;
    if(S.sh[2]==='curve'){ const c=add(new THREE.CylinderGeometry(sw*.6,sw*.6,shH,16,1,true,-.7,1.4),m,0,sy,-.55); c.material=m.clone(); c.material.side=THREE.DoubleSide; }
    else { add(new THREE.BoxGeometry(sw,shH,.06),m,0,sy,.42); if(S.sh[2]==='notch') for(const s of [-1,1]) add(new THREE.BoxGeometry(sw*.28,.3,.06),m,s*sw*.36,sy+shH/2+.12,.4,0,0,-s*.5); }
    add(new THREE.BoxGeometry(sw*.9,.3,.06),m,0,ax-.05,.5);                                                                     // faldón bajo el eje
    // tubo, cuna y recuperador en un pivote que sube
    const pv=new THREE.Group(); pv.position.set(0,ax+.42,.1); pv.rotation.x=-.62; g.add(pv);
    const br=new THREE.Mesh(new THREE.CylinderGeometry(S.br,S.br*1.25,S.bl,10),m); br.rotation.x=Math.PI/2; br.position.z=S.bl/2-.15; pv.add(br);
    if(S.brake){ const mb=new THREE.Mesh(new THREE.CylinderGeometry(S.br*2,S.br*2,.32,10),d); mb.rotation.x=Math.PI/2; mb.position.z=S.bl-.05; pv.add(mb); }
    const cr=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,1.5),m); cr.position.set(0,0,.4); pv.add(cr);
    const rc=(y,x=0)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,1.4,8),d); o.rotation.x=Math.PI/2; o.position.set(x,y,.75); pv.add(o); };
    if(S.recup==='over') rc(.22); else if(S.recup==='under2'){ rc(-.2,-.1); rc(-.2,.1); } else rc(-.2);
    const bk=new THREE.Mesh(new THREE.BoxGeometry(.4,.4,.7),d); bk.position.z=-.45; pv.add(bk);
    g.userData={pv,br,brZ:br.position.z,mz:new THREE.Vector3(0,0,S.bl)}; return g; }
  window.gunPiece=gunPiece;
  function crewMen(g,team){ try{ for(const [x,z] of [[-1.3,-1.4],[1.2,-1.8],[.4,-2.6]]){ const p=personMesh({team,kind:'crew'}).g; p.position.set(x,0,z); p.rotation.y=Math.PI+(Math.random()-.5); g.add(p); } }catch(e){} }
  function artyCine(by,point,short){
    const team=by.team, B=W.sp&&W.sp[team]&&W.sp[team].length?W.sp[team]:[{x:by.pos.x,z:by.pos.z}];
    const bx=B.reduce((a,s)=>a+s.x,0)/B.length, bz=B.reduce((a,s)=>a+s.z,0)/B.length;
    let dx=point.x-bx, dz=point.z-bz; const L=Math.hypot(dx,dz)||1; dx/=L; dz/=L;            // hacia el blanco
    const cx=bx-dx*45, cz=bz-dz*45, sx=-dz, sz=dx, yaw=Math.atan2(dx,dz), nat=(by.crew&&by.crew.nation)||(typeof teamNation==='function'?teamNation(team):'');
    const grp=new THREE.Group(); scene.add(grp); const guns=[];
    for(let i=0;i<4;i++){ const o=(i-1.5)*11, x=cx+sx*o, z=cz+sz*o, g=gunPiece(nat,i); g.position.set(x,heightAt(x,z),z); g.rotation.y=yaw; crewMen(g,team); grp.add(g); guns.push({g,fired:false,at:short?.25+i*.35:.55+i*.5}); }
    // cámara: al costado de la primera pieza, se va corriendo por la fila
    const side=(t)=>{ const o=-24+t*9; return new THREE.Vector3(cx+sx*o-dx*9+dz*0,0,cz+sz*o-dz*9); };
    cineStart({dur:short?2.6:4.2,title:short?(EN()?'⚠ Enemy artillery!':'⚠ ¡Artillería enemiga!'):(EN()?'✸ The battery opens fire':'✸ La batería abre fuego'),
      upd:(k,t,c)=>{ const p=side(t); p.y=heightAt(p.x,p.z)+2.1; c.position.copy(p);
        const lk=new THREE.Vector3(cx+sx*(-6+t*4)+dx*4,0,cz+sz*(-6+t*4)+dz*4); lk.y=heightAt(lk.x,lk.z)+2.4; c.lookAt(lk);
        for(const G of guns){ const br=G.g.userData.br; if(!G.fired&&t>=G.at){ G.fired=true; G.rt=t;
            const mz=G.g.userData.mz.clone(); G.g.userData.pv.localToWorld(mz);
            puff(mz.clone(),0xffa040,3.2,.22,0,1,true); puff(mz.clone(),0xfff0c0,1.8,.12,0,1,true);
            for(let j=0;j<4;j++) puff(mz.clone().add(new THREE.Vector3(Math.random()*2-1,Math.random(),Math.random()*2-1)),0x8a8378,rand(2.5,4),rand(1.6,2.6),1.2,.7);
            const gp=G.g.position; for(let j=0;j<3;j++) puff(new THREE.Vector3(gp.x+rand(-3,3),gp.y+.4,gp.z+rand(-3,3)),0x9a8a6a,rand(2.5,4),rand(1,1.8),.5,.55);
            try{ if(!sfx('cannon',mz,1,{rate:rand(.7,.8)})) boom(.5,1,300); }catch(e){} shake=Math.max(shake,.25); }
          if(G.rt!=null){ const a=t-G.rt; br.position.z=G.g.userData.brZ-Math.max(0,.6*(1-a/.7))*(a<.06?a/.06:1); } } },
      end:()=>{ scene.remove(grp); grp.traverse(o=>{ if(o.geometry&&o.geometry.dispose&&!o.geometry._keep) o.geometry.dispose(); }); }});
  }
  function airCine(by,point,n0,short){ const P=planes[planes.length-1]; if(!P||planes.length<=n0) return;
    const dir=P.dir.clone(), sd=new THREE.Vector3(-dir.z,0,dir.x), gh=heightAt(point.x,point.z); let last=null;
    cineStart({dur:short?3:8,title:short?(EN()?'⚠ Enemy aircraft!':'⚠ ¡Aviones enemigos!'):(EN()?'✈ Air support is coming in':'✈ Llega el apoyo aéreo'),
      upd:(k,t,c)=>{ const pp=P.g.position;
        if(t<4.4&&planes.includes(P)){ const p=pp.clone().addScaledVector(dir,-30+t*3).addScaledVector(sd,12).setY(pp.y+5);
          c.position.copy(p); c.lookAt(pp.clone().addScaledVector(dir,14+t*4)); last=p.clone(); }
        else { const w=point.clone().addScaledVector(dir,-110).addScaledVector(sd,55); w.y=gh+30;
          const f=Math.min(1,(t-4.4)/1.2), s=f*f*(3-2*f); c.position.copy(last?last.clone().lerp(w,s):w);
          c.lookAt(new THREE.Vector3(point.x,gh+4,point.z)); } } });
  }

  // ---- ganchos ----
  // animación una vez por partida y por equipo (pedido de Sebastián): la primera artillería y el primer avión que pide tu equipo
  // (vos o un aliado) se ven enteros; los primeros del enemigo, en versión corta con aviso. Se reinicia en cada partida.
  let CIN={arty:[0,0],air:[0,0]};
  const cineOk=()=>player&&!player.dead&&!tut&&!net.guest&&state==='play'&&!(typeof TUT1!=='undefined'&&TUT1&&TUT1.stg<2&&PROG&&PROG.stats&&PROG.stats.battles<1);
  const _ca=callArtillery; callArtillery=function(by,point){ const ok=_ca.apply(this,arguments);
    try{ if(ok&&by){ if(by.isPlayer){ rb.style.display='none'; radio(point,artyDelay()); }
        const tm=by.team?1:0; if(!CIN.arty[tm]&&cineOk()){ CIN.arty[tm]=1; const enemy=player.team!==by.team, D=artyDelay(), pt=point.clone();
          supQ.push({t:now+D-(enemy?2.6:4),f:()=>{ if(cineOk()&&!CI.on) artyCine(by,pt,enemy); }}); } } }catch(e){ console.warn(e); }
    return ok; };
  const _cs=callAirstrike; callAirstrike=function(by,point){ const ok=_cs.apply(this,arguments);
    try{ if(ok&&by&&by.isPlayer) rvSay(['bombardeo']); }catch(e){}
    try{ if(ok&&by){ const tm=by.team?1:0; if(!CIN.air[tm]&&cineOk()){ CIN.air[tm]=1; by._airCine=player.team!==by.team?2:1; } } }catch(e){} return ok; };
  const _ap=airPass; airPass=function(by,point,dir){ const n=planes.length, r=_ap.apply(this,arguments);
    try{ if(by&&by._airCine){ const sh=by._airCine===2; by._airCine=0; if(cineOk()&&!CI.on) airCine(by,point,n,sh); } }catch(e){ console.warn(e); } return r; };
  // al salir de la batalla se corta
  if(typeof clearBattle==='function'){ const _cb=clearBattle; clearBattle=function(){ cineEnd(); rb.style.display='none'; CIN={arty:[0,0],air:[0,0]}; return _cb.apply(this,arguments); }; }
  window.CINE=CI; window.radioMsg=radio;
})();
