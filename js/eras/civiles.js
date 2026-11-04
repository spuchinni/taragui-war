// Civiles (pedido de Sebastián): se los puede atropellar, además de matarlos con la ametralladora o el cañón (eso ya
// pasaba: infOnRay / infBlast no excluyen civiles). Cada civil muerto resta puntos (killInf/wreckCar: −50 SP, −60 de
// puntaje) y se cuenta por tripulación (`c.civK`). Avisos al 3.º y al 5.º; al 6.º (más de CIV_MAX) el propio mando castiga
// al tanque: andanada de artillería en las épocas 1–2 y un A-10 en las demás (`a10Strike`, con `t.a10Why` para el cartel).
// Después la cuenta vuelve a cero. Los civiles que ven venir un tanque de frente se tiran a un costado (no todos llegan).
(function(){
  const CIV_MAX=5, JOB_N={medico:'médico',enfermera:'enfermera',monja:'monja',policia:'policía',cura:'cura',bombero:'bombero',cartero:'cartero',panadero:'panadero',granjero:'granjero',obrero:'obrero',vendedora:'vendedora'};
  window.CIV_MAX=CIV_MAX;
  const _aw=award;
  award=function(c,name,sp,score){
    if(name!=='Civil abatido'||!c) return _aw.apply(this,arguments);
    c.civK=(c.civK||0)+1; const n=c.civK, t=c.tank;
    _aw.call(this,c,`Civil abatido (${n} de ${CIV_MAX})`,sp,score);
    if(c.isPlayer){ if(n===3) banner('¡Cuidado con los civiles!',`Llevás ${n} muertos. Si pasás de ${CIV_MAX}, tu propio mando te ${W.era<=2?'manda la artillería':'manda un A-10'}.`,3.2);
      else if(n===CIV_MAX) banner('¡Último aviso!',`${n} civiles muertos: uno más y ${W.era<=2?'cae la artillería sobre tu tanque':'un A-10 va por vos'}.`,3.2); }
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
})();
