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
  const NUM_ES=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve'], NUM_EN=['zero','one','two','three','four','five','six','seven','eight','niner'];
  function coords(p){ const bx=W.bx||750, bz=W.bz||750;
    const e=Math.max(0,Math.min(999,Math.round((bx-p.x)/(2*bx)*999))), n=Math.max(0,Math.min(999,Math.round((p.z+bz)/(2*bz)*999)));   // x = oeste, z = norte
    return [String(e).padStart(3,'0'),String(n).padStart(3,'0')]; }
  let rbT=null;
  function say(txt){ return; /* voz del navegador apagada: sonaba muy mal (Sebastián). Ver voces grabadas */ try{ if(!window.speechSynthesis||!radioOn||volMaster<.02) return; const u=new SpeechSynthesisUtterance(txt);
      u.lang=EN()?'en-US':'es-AR'; u.rate=1.12; u.pitch=.85; u.volume=.9; speechSynthesis.cancel(); speechSynthesis.speak(u); }catch(e){} }
  function radio(point,D){ const [e,n]=coords(point), en=EN(), sp=s=>s.split('').join('-');
    const N=en?NUM_EN:NUM_ES, words=s=>s.split('').map(d=>N[+d]).join(' ');
    rb.innerHTML=`📻 ${en?'Coordinates':'Coordenadas'} <b>${sp(e)}</b>, <b>${sp(n)}</b>…`; rb.style.display='block';
    try{ sfx('squelch',null,.5); }catch(e){}
    say(en?`Coordinates ${words(e)}, ${words(n)}. Fire!`:`Coordenadas ${words(e)}, ${words(n)}. ¡Fuego!`);
    clearTimeout(rbT); rbT=setTimeout(()=>{ rb.innerHTML=`📻 ${en?'Coordinates':'Coordenadas'} <b>${sp(e)}</b>, <b>${sp(n)}</b>… <span class="f">${en?'FIRE!':'¡FUEGOOO!'}</span>`;
      rbT=setTimeout(()=>{ rb.style.display='none'; },2600); },1900); }

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
  function gunPiece(col){ const g=new THREE.Group(), m=new THREE.MeshLambertMaterial({color:col}), d=new THREE.MeshLambertMaterial({color:0x2a2822});
    const add=(geo,mat,x,y,z)=>{ const o=new THREE.Mesh(geo,mat); o.position.set(x,y,z); g.add(o); return o; };
    add(new THREE.BoxGeometry(1.5,.35,1.1),m,0,.75,0);                                        // cuna y afuste
    for(const s of [-1,1]){ const w=add(new THREE.CylinderGeometry(.62,.62,.18,14),d,s*.95,.62,0); w.rotation.z=Math.PI/2;
      const tr=add(new THREE.BoxGeometry(.16,.16,3.2),m,s*.35,.35,-1.7); tr.rotation.y=-s*.18; }   // ruedas y mástiles abiertos
    add(new THREE.BoxGeometry(2.1,1.1,.08),m,0,1.25,.45);                                      // escudo
    const pv=new THREE.Group(); pv.position.set(0,1.05,.1); pv.rotation.x=-.62; g.add(pv);    // tubo elevado
    const br=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,3.4,10),m); br.rotation.x=Math.PI/2; br.position.z=1.5; pv.add(br);
    const bk=new THREE.Mesh(new THREE.BoxGeometry(.36,.36,.8),d); bk.position.z=-.2; pv.add(bk);
    g.userData={pv,br,mz:new THREE.Vector3(0,0,3.2)}; return g; }
  function crewMen(g,team){ try{ for(const [x,z] of [[-1.3,-1.4],[1.2,-1.8],[.4,-2.6]]){ const p=personMesh({team,kind:'crew'}).g; p.position.set(x,0,z); p.rotation.y=Math.PI+(Math.random()-.5); g.add(p); } }catch(e){} }
  function artyCine(by,point){
    const team=by.team, B=W.sp&&W.sp[team]&&W.sp[team].length?W.sp[team]:[{x:by.pos.x,z:by.pos.z}];
    const bx=B.reduce((a,s)=>a+s.x,0)/B.length, bz=B.reduce((a,s)=>a+s.z,0)/B.length;
    let dx=point.x-bx, dz=point.z-bz; const L=Math.hypot(dx,dz)||1; dx/=L; dz/=L;            // hacia el blanco
    const cx=bx-dx*45, cz=bz-dz*45, sx=-dz, sz=dx, yaw=Math.atan2(dx,dz), col=team===0?0x55603f:0x6a6450;
    const grp=new THREE.Group(); scene.add(grp); const guns=[];
    for(let i=0;i<4;i++){ const o=(i-1.5)*11, x=cx+sx*o, z=cz+sz*o, g=gunPiece(col); g.position.set(x,heightAt(x,z),z); g.rotation.y=yaw; crewMen(g,team); grp.add(g); guns.push({g,fired:false,at:.55+i*.5}); }
    // cámara: al costado de la primera pieza, se va corriendo por la fila
    const side=(t)=>{ const o=-24+t*9; return new THREE.Vector3(cx+sx*o-dx*9+dz*0,0,cz+sz*o-dz*9); };
    cineStart({dur:4.2,title:EN()?'✸ The battery opens fire':'✸ La batería abre fuego',
      upd:(k,t,c)=>{ const p=side(t); p.y=heightAt(p.x,p.z)+2.1; c.position.copy(p);
        const lk=new THREE.Vector3(cx+sx*(-6+t*4)+dx*4,0,cz+sz*(-6+t*4)+dz*4); lk.y=heightAt(lk.x,lk.z)+2.4; c.lookAt(lk);
        for(const G of guns){ const br=G.g.userData.br; if(!G.fired&&t>=G.at){ G.fired=true; G.rt=t;
            const mz=G.g.userData.mz.clone(); G.g.userData.pv.localToWorld(mz);
            puff(mz.clone(),0xffa040,3.2,.22,0,1,true); puff(mz.clone(),0xfff0c0,1.8,.12,0,1,true);
            for(let j=0;j<4;j++) puff(mz.clone().add(new THREE.Vector3(Math.random()*2-1,Math.random(),Math.random()*2-1)),0x8a8378,rand(2.5,4),rand(1.6,2.6),1.2,.7);
            const gp=G.g.position; for(let j=0;j<3;j++) puff(new THREE.Vector3(gp.x+rand(-3,3),gp.y+.4,gp.z+rand(-3,3)),0x9a8a6a,rand(2.5,4),rand(1,1.8),.5,.55);
            try{ if(!sfx('cannon',mz,1,{rate:rand(.7,.8)})) boom(.5,1,300); }catch(e){} shake=Math.max(shake,.25); }
          if(G.rt!=null){ const a=t-G.rt; br.position.z=1.5-Math.max(0,.6*(1-a/.7))*(a<.06?a/.06:1); } } },
      end:()=>{ scene.remove(grp); grp.traverse(o=>{ if(o.geometry&&o.geometry.dispose&&!o.geometry._keep) o.geometry.dispose(); }); }});
  }
  function airCine(by,point,n0){ const P=planes[planes.length-1]; if(!P||planes.length<=n0) return;
    const dir=P.dir.clone(), sd=new THREE.Vector3(-dir.z,0,dir.x), gh=heightAt(point.x,point.z); let last=null;
    cineStart({dur:8,title:EN()?'✈ The bombers are coming in':'✈ Llegan los bombarderos',
      upd:(k,t,c)=>{ const pp=P.g.position;
        if(t<4.4&&planes.includes(P)){ const p=pp.clone().addScaledVector(dir,-30+t*3).addScaledVector(sd,12).setY(pp.y+5);
          c.position.copy(p); c.lookAt(pp.clone().addScaledVector(dir,14+t*4)); last=p.clone(); }
        else { const w=point.clone().addScaledVector(dir,-110).addScaledVector(sd,55); w.y=gh+30;
          const f=Math.min(1,(t-4.4)/1.2), s=f*f*(3-2*f); c.position.copy(last?last.clone().lerp(w,s):w);
          c.lookAt(new THREE.Vector3(point.x,gh+4,point.z)); } } });
  }

  // ---- ganchos ----
  const _ca=callArtillery; callArtillery=function(by,point){ const ok=_ca.apply(this,arguments);
    try{ if(ok&&by&&by.isPlayer){ rb.style.display='none'; radio(point,artyDelay());
        if(!LSg('tw2_cArty')&&!net.guest){ LSs('tw2_cArty'); const D=artyDelay(); supQ.push({t:now+D-4,f:()=>{ if(player===by&&!by.dead) artyCine(by,point.clone()); }}); } } }catch(e){ console.warn(e); }
    return ok; };
  const _cs=callAirstrike; callAirstrike=function(by,point){ const ok=_cs.apply(this,arguments);
    try{ if(ok&&by&&by.isPlayer&&!LSg('tw2_cAir')&&!net.guest){ LSs('tw2_cAir'); by._airCine=1; } }catch(e){} return ok; };
  const _ap=airPass; airPass=function(by,point,dir){ const n=planes.length, r=_ap.apply(this,arguments);
    try{ if(by&&by._airCine&&by.isPlayer&&!by.dead){ by._airCine=0; airCine(by,point,n); } }catch(e){ console.warn(e); } return r; };
  // al salir de la batalla se corta
  if(typeof clearBattle==='function'){ const _cb=clearBattle; clearBattle=function(){ cineEnd(); rb.style.display='none'; return _cb.apply(this,arguments); }; }
  window.CINE=CI; window.radioMsg=radio;
})();
