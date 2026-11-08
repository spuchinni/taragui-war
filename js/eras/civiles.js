// Civiles (pedido de Sebastián): se los puede atropellar, además de matarlos con la ametralladora o el cañón (eso ya
// pasaba: infOnRay / infBlast no excluyen civiles). Cada civil muerto resta puntos (killInf/wreckCar: −50 SP, −60 de
// puntaje) y se cuenta por tripulación (`c.civK`). Avisos al 3.º y al 5.º; al 6.º (más de CIV_MAX) el propio mando castiga
// al tanque: andanada de artillería en las épocas 1–2 un P-47 en la 2ª Guerra y un A-10 en la Guerra Fría (`a10Strike`, con `t.a10Why` para el cartel).
// Después la cuenta vuelve a cero. Los civiles que ven venir un tanque de frente se tiran a un costado (no todos llegan).
(function(){
  const CIV_MAX=5, JOB_N={medico:'médico',enfermera:'enfermera',monja:'monja',policia:'policía',cura:'cura',bombero:'bombero',cartero:'cartero',panadero:'panadero',granjero:'granjero',obrero:'obrero',vendedora:'vendedora'};
  window.CIV_MAX=CIV_MAX;
  const _aw=award;
  award=function(c,name,sp,score){
    if(name!=='Civil abatido'||!c) return _aw.apply(this,arguments);
    c.civK=(c.civK||0)+1; const n=c.civK, t=c.tank;
    _aw.call(this,c,`Civil abatido (${n} de ${CIV_MAX})`,sp,score);
    if(c.isPlayer){ if(n===3) banner('¡Cuidado con los civiles!',`Llevás ${n} muertos. Si pasás de ${CIV_MAX}, tu propio mando te ${W.era<=2?'manda la artillería':'manda un '+strikeName()}.`,3.2);
      else if(n===CIV_MAX) banner('¡Último aviso!',`${n} civiles muertos: uno más y ${W.era<=2?'cae la artillería sobre tu tanque':'un '+strikeName()+' va por vos'}.`,3.2); }
    if(n>CIV_MAX&&t&&!t.dead&&!t.a10&&!net.guest){ c.civK=0; t.a10=true; t.a10Why=`Mataste más de ${CIV_MAX} civiles`; a10Strike(t); }
  };
  // nombre con el oficio en el registro de bajas
  const _ki=killInf;
  killInf=function(P,by,how){ if(P&&P.kind==='civ'&&P.job&&!P.dead) P.name='Civil ('+(JOB_N[P.job]||P.job)+')'; return _ki.apply(this,arguments); };
  // atropellos: lo que queda debajo del casco de un tanque en marcha muere aplastado; los civiles de adelante se corren
  const _ui=updateInfantry;
  updateInfantry=function(dt){ _ui.apply(this,arguments); if(net.guest||!tanks.length) return;
    for(const t of tanks){ if(t.dead||!t.pos) continue; const sp=Math.abs(t.speed||0); if(sp<.7) continue;
      const fx=Math.sin(t.heading), fz=Math.cos(t.heading), dir=Math.sign(t.speed)||1, L=(t.co||2)+(t.cr||1.5)*.7, Wd=(t.cr||1.5)*.95;
      for(const P of infantry){ if(P.dead||P.board||P.embark) continue; const dx=P.pos.x-t.pos.x, dz=P.pos.z-t.pos.z; if(dx*dx+dz*dz>400) continue;
        const f=(dx*fx+dz*fz)*dir, s=dx*fz-dz*fx;
        if(Math.abs(f)<L&&Math.abs(s)<Wd&&Math.abs(P.pos.y-t.pos.y)<2.5){ if(isCiv(P)||P.team!==t.team) killInf(P,t,'crush'); continue; }
        if(isCiv(P)&&f>0&&f<14&&Math.abs(s)<Wd+2.5&&!P.dodge){ P.dodge=1; if(Math.random()<.8){ const sd=s>=0?1:-1; P.flee=true; P.goal={x:P.pos.x+fz*sd*7,z:P.pos.z-fx*sd*7}; P.cower=0; } } } }
    for(const P of infantry) if(P.dodge&&Math.random()<dt*.5) P.dodge=0; };

  // ---- los tanques aplastan cañones (antitanque, antiaéreo y de campaña) y nidos de ametralladora ----
  // (como pasaba de verdad: un tanque que llega encima de una pieza la pasa por arriba). Solo el anfitrión.
  const isGun=o=>o&&o.T&&(o.T.static||(o.crew&&o.crew.gun&&o.T.cls==='cañón'));
  function crushGun(o,t){ destroy(o,t,false); o.crushed=true; if(o.root){ o.root.scale.y=.32; o.root.rotation.z+=rand(-.25,.25); }
    for(let i=0;i<5;i++) debris(o.pos.clone().setY(o.pos.y+.4),2,darkMat,3,.4); sfx('expl',o.pos,.5,{rate:1.6});
    if(t.isPlayer) hitMsg(`Aplastado: ${o.T.label}`,'var(--amber)'); }
  function crushNest(F,t){ F.crushed=true; const G=F.mount.g; G.scale.y=.25; G.rotation.z=rand(-.6,.6); G.position.y-=.1;
    if(F.ring) F.ring.children.forEach(b=>{ b.position.x+=rand(-1.4,1.4); b.position.z+=rand(-1.4,1.4); b.position.y=heightAt(b.position.x,b.position.z)+.12; b.rotation.set(rand(-.4,.4),rand(0,6),rand(-.4,.4)); });
    for(const P of [F.mg,F.rf]) if(P&&!P.dead&&Math.hypot(P.pos.x-G.position.x,P.pos.z-G.position.z)<3) killInf(P,t,'crush');
    F.mount=null; if(t.crew&&t.team!==F.team) addSP(t,25,30,'Nido aplastado'); if(t.isPlayer) hitMsg('Aplastado: nido de ametralladora','var(--amber)'); }
  const _ui2=updateInfantry;
  updateInfantry=function(dt){ _ui2.apply(this,arguments); if(net.guest) return;
    for(const t of tanks){ if(t.dead||!t.pos||isGun(t)||(t.T&&t.T.support)) continue; const sp=Math.abs(t.speed||0); if(sp<.5) continue;
      const fx=Math.sin(t.heading)*Math.sign(t.speed), fz=Math.cos(t.heading)*Math.sign(t.speed);
      for(const o of tanks){ if(o===t||o.dead||!isGun(o)||o.team===t.team) continue; const dx=o.pos.x-t.pos.x, dz=o.pos.z-t.pos.z, d=Math.hypot(dx,dz);
        if(d<t.R+o.R*.9+.6&&(dx*fx+dz*fz)>0) crushGun(o,t); }
      for(const Z of zones||[]){ const F=Z.fort; if(!F||!F.mount||F.crushed||F.team===t.team) continue; const G=F.mount.g.position;
        if(Math.hypot(G.x-t.pos.x,G.z-t.pos.z)<(t.R||2.5)*.75+.8) crushNest(F,t); } } };

  // ---- paracaidistas: se los puede matar en el aire (ametralladora, cañón, esquirlas) ----
  const chuteAt=C=>C.g.position.clone().add(new THREE.Vector3(0,.9,0));
  const _ior=infOnRay;
  infOnRay=function(o,d,len,by,chance,how){ const r=_ior.apply(this,arguments); if(r>=0||typeof chutes==='undefined') return r;
    for(const C of chutes){ if(C.dead||(by&&by.team===C.team)) continue; const c=chuteAt(C), s2=clamp(c.clone().sub(o).dot(d),0,len);
      if(c.distanceTo(o.clone().addScaledVector(d,s2))<.75&&Math.random()<Math.max(chance,.5)){ chuteHit(C,by); return s2; } } return r; };
  const _ib=infBlast;
  infBlast=function(p,r,by){ _ib.apply(this,arguments); if(typeof chutes==='undefined') return;
    for(const C of chutes) if(!C.dead&&(!by||by.team!==C.team)&&chuteAt(C).distanceTo(p)<r*1.2) chuteHit(C,by); };
})();
