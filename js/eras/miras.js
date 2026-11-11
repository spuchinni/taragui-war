/* ---------- Marcas del cañón y de las ametralladoras (pedido de Sebastián: "doy vuelta la vista y solo veo la marca de donde miro") ----------
   - Cañón: en los tanques sin telémetro (casi todos los de la 2ª Guerra, `manual` en drawOverlay) no se dibujaba nada. Ahora se marca
     hacia dónde apunta el tubo (derecho, sin la caída: la distancia la sigue calculando el jugador). Con telémetro sigue el círculo de impacto.
   - Si el cañón apunta fuera de la pantalla (miraste para otro lado), una burbuja en el borde muestra para dónde está girado.
   - Ametralladoras: una cruz chica por cada una que gira mucho (antiaéreas y de pivote; no la coaxial ni las de rótula o fijas, ametralladoras.js) donde apunta a la distancia de tu mira:
     clara = lista para tirar, apagada = el blanco queda fuera de su arco o todavía está girando. */
const _gmP=new THREE.Vector3(), _gmD=new THREE.Vector3(), _gmQ=new THREE.Vector3();
// punto donde pega el tubo si sigue derecho (suelo, ruinas, casas o tanques)
function barrelPoint(t,maxD=1200){ t.root.updateMatrixWorld(true); const p=t.muzzle.getWorldPosition(_gmP), d=t.barrel.getWorldDirection(_gmD);
  for(let s=2;s<maxD;s+=s<200?2:5){ const q=_gmQ.copy(p).addScaledVector(d,s);
    if(q.y<hAtY(q.x,q.z,q.y)) return q.clone();
    for(const b of gridQuery(q.x,q.z,0)) if(b.containsPoint(q)&&obInside(b,q.x,q.z)) return q.clone();
    for(const o of tanks) if(o!==t&&!o.dead&&Math.abs(q.x-o.pos.x)<o.R*.7&&Math.abs(q.z-o.pos.z)<o.R*.7&&q.y<o.pos.y+o.topH&&q.y>o.pos.y) return q.clone(); }
  return p.clone().addScaledVector(d,maxD); }
// en pantalla → {x,y}; fuera → {edge:true, x,y en el borde, ang}
function screenOrEdge(P,M=40){ tmpV.copy(P).applyMatrix4(camera.matrixWorldInverse); const front=tmpV.z<-1; tmpV.copy(P).project(camera);
  let sx=(tmpV.x+1)/2*innerWidth, sy=(1-tmpV.y)/2*innerHeight;
  if(front&&sx>M&&sx<innerWidth-M&&sy>M&&sy<innerHeight-M) return {x:sx,y:sy};
  let dx=tmpV.x, dy=-tmpV.y; if(!front){ dx=-dx; dy=-dy; } if(Math.abs(dx)<1e-4&&Math.abs(dy)<1e-4) dy=1;
  const cx=innerWidth/2, cy=innerHeight/2, k=Math.min((cx-M)/Math.abs(dx||1e-6),(cy-M)/Math.abs(dy||1e-6)); return {edge:true,x:cx+dx*k,y:cy+dy*k,ang:Math.atan2(dy,dx)}; }
function gunRing(x,y,col,t){ const ready=t.reloadT<=0;
  oc.lineWidth=3.5; oc.strokeStyle='rgba(0,0,0,.45)'; oc.beginPath(); oc.arc(x,y,12,0,7); oc.stroke();
  oc.lineWidth=2; oc.strokeStyle=col; oc.beginPath(); oc.arc(x,y,12,0,7); oc.moveTo(x-19,y); oc.lineTo(x-12,y); oc.moveTo(x+12,y); oc.lineTo(x+19,y); oc.moveTo(x,y+12); oc.lineTo(x,y+18); oc.stroke();
  if(!ready){ oc.strokeStyle='#ffc65c'; oc.lineWidth=3; oc.beginPath(); oc.arc(x,y,20,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-t.reloadT/(t.reloadMax*reloadFactor(t)))); oc.stroke(); } }
function drawGunMarks(){ if(state!=='play'||!player||player.dead||!player.barrel||!player.muzzle) return; const t=player, manual=realMode&&!hasFcs(t), cx=innerWidth/2, cy=innerHeight/2;
  if(scoped){ drawReticle(t,manual); return; }   // en la mira del artillero solo su retícula (sin marcas de ametralladoras ni del comandante)
  // cañón
  const P=manual?barrelPoint(t):predictImpact(t), S=screenOrEdge(P), col=t.gunLim?'rgba(255,90,60,.95)':t.reloadT<=0?'rgba(239,231,210,.95)':'rgba(239,231,210,.55)';
  if(S.edge){ const a=S.ang; oc.fillStyle='rgba(20,20,18,.75)'; oc.strokeStyle='#efe7d2'; oc.lineWidth=2; oc.beginPath(); oc.arc(S.x,S.y,16,0,7); oc.fill(); oc.stroke();
    oc.beginPath(); oc.arc(S.x,S.y,7,0,7); oc.moveTo(S.x-11,S.y); oc.lineTo(S.x-7,S.y); oc.moveTo(S.x+7,S.y); oc.lineTo(S.x+11,S.y); oc.stroke();
    oc.fillStyle='#efe7d2'; oc.beginPath(); oc.moveTo(S.x+Math.cos(a)*25,S.y+Math.sin(a)*25); oc.lineTo(S.x+Math.cos(a+.45)*17,S.y+Math.sin(a+.45)*17); oc.lineTo(S.x+Math.cos(a-.45)*17,S.y+Math.sin(a-.45)*17); oc.fill();
    oc.font='600 13px "Saira Condensed",sans-serif'; oc.textAlign='center'; oc.fillText('Cañón',S.x-Math.cos(a)*30,S.y-Math.sin(a)*30+4); }
  else if(manual){ gunRing(S.x,S.y,col,t);
    if(t.gunLim){ oc.fillStyle='rgba(255,90,60,.95)'; oc.font='700 15px "Saira Condensed",sans-serif'; oc.textAlign='center'; oc.fillText(t.gunLim<0?'El cañón no baja más':'El cañón no sube más',S.x,S.y+36); } }
  drawMgMarks(t); }
function drawMgMarks(t){   // ametralladoras: coaxial + montadas
  // solo las que giran mucho (antiaéreas, de pivote): la coaxial va con el cañón y las de rótula o fijas (copiloto, trasera de la torre)
  // casi no se mueven, no hace falta marcarlas (pedido de Sebastián)
  const aim=lastAim, L=(t.mgs||[]).filter(M=>M.yaw[1]-M.yaw[0]>1).map(M=>({muz:M.muz,dir:M.pg,ok:M.can&&M.err<=.07&&M.seat.some(s=>manned(t,s))}));
  for(const G2 of L){ if(!G2.muz||!G2.dir) continue; const o=G2.muz.getWorldPosition(new THREE.Vector3()), d=G2.dir.getWorldDirection(new THREE.Vector3());
    const D=aim?clamp(o.distanceTo(aim),15,900):300, s=screenOrEdge(o.addScaledVector(d,D),20); if(s.edge) continue;
    const c=G2.ok?'rgba(255,214,120,.95)':'rgba(200,200,190,.4)';
    oc.lineWidth=3; oc.strokeStyle='rgba(0,0,0,.4)'; oc.beginPath(); oc.moveTo(s.x-6,s.y); oc.lineTo(s.x+6,s.y); oc.moveTo(s.x,s.y-6); oc.lineTo(s.x,s.y+6); oc.stroke();
    oc.lineWidth=1.5; oc.strokeStyle=c; oc.beginPath(); oc.moveTo(s.x-6,s.y); oc.lineTo(s.x-2,s.y); oc.moveTo(s.x+2,s.y); oc.lineTo(s.x+6,s.y); oc.moveTo(s.x,s.y-6); oc.lineTo(s.x,s.y-2); oc.moveTo(s.x,s.y+2); oc.lineTo(s.x,s.y+6); oc.stroke(); } }
{ const _do=drawOverlay; drawOverlay=function(){ _do.apply(this,arguments); try{ drawGunMarks(); }catch(e){ console.error(e); } }; }
/* ---- Retículas de la mira del artillero, como las de verdad (pedido de Sebastián) ----
   La mira va pegada al cañón (13-jugador.js): el centro de la retícula es adonde apunta el tubo y tarda lo que tarda la torre en girar.
   El círculo chico y punteado es adonde llevás el mouse. Medidas en milésimas (crecen con el aumento, como en el vidrio de la mira; mínimo 4 px por milésima para que se lean):
   - Alemania (TZF): triángulo grande en el medio (la punta = el tiro) y triangulitos cada 4 milésimas para medir y adelantar.
   - URSS (TSh/TMFD): chevrón en el medio, chevrones chicos a los costados cada 4 milésimas y rayas laterales.
   - EE. UU. y Argentina (M70): cruz con marcas cada 5 milésimas numeradas y rayas de distancia debajo.
   - Reino Unido: hilos con tres postes gruesos (izquierda, derecha y abajo) y marcas de distancia.
   - Resto: cruz con marcas. Sin telémetro, debajo del centro van las alzas: 2 = 200 m (el cero), 4, 6, 8, 10, 12, 14, 16 = cientos de metros. */
const RET_STYLE={de:'de',ru:'ru',us:'us',ar:'us',uk:'uk'};
function drawReticle(t,manual){ const cx=innerWidth/2, cy=innerHeight/2, ppr=innerHeight/(2*Math.tan(camera.fov*Math.PI/360)), u=Math.max(4,ppr/1000), st=RET_STYLE[t.T.nation]||'gen';
  const ink='rgba(12,12,12,.95)', glow='rgba(235,238,240,.55)';
  const L=(f,w=1.6)=>{ oc.lineWidth=w+2.6; oc.strokeStyle=glow; oc.beginPath(); f(); oc.stroke(); oc.lineWidth=w; oc.strokeStyle=ink; oc.beginPath(); f(); oc.stroke(); };
  const F=f=>{ oc.lineWidth=2.6; oc.strokeStyle=glow; oc.beginPath(); f(); oc.closePath(); oc.stroke(); oc.fillStyle=ink; oc.beginPath(); f(); oc.closePath(); oc.fill(); };
  const T=(x,y,s)=>{ oc.font='600 13px "Saira Condensed",sans-serif'; oc.textAlign='center'; oc.lineWidth=3; oc.strokeStyle=glow; oc.strokeText(s,x,y); oc.fillStyle=ink; oc.fillText(s,x,y); };
  const R=Math.min(innerWidth,innerHeight)*.38;                                                                   // borde del vidrio (#scope)
  if(st==='de'){ const tri=(x,h,w)=>F(()=>{ oc.moveTo(x,cy); oc.lineTo(x-w/2,cy+h); oc.lineTo(x+w/2,cy+h); });
    tri(cx,4*u,4*u); for(let k=1;k<=3;k++){ tri(cx-8*k*u,2*u,2*u); tri(cx+8*k*u,2*u,2*u); }
    L(()=>{ oc.moveTo(cx-R*.95,cy+2*u); oc.lineTo(cx-28*u,cy+2*u); oc.moveTo(cx+28*u,cy+2*u); oc.lineTo(cx+R*.95,cy+2*u); },1.2); }
  else if(st==='ru'){ const chev=(x,s,w)=>L(()=>{ oc.moveTo(x-s,cy+s*1.1); oc.lineTo(x,cy); oc.lineTo(x+s,cy+s*1.1); },w);
    chev(cx,3*u,2); for(let k=1;k<=4;k++){ chev(cx-4*k*u,1.2*u,1.4); chev(cx+4*k*u,1.2*u,1.4); }
    L(()=>{ oc.moveTo(cx-R*.95,cy); oc.lineTo(cx-19*u,cy); oc.moveTo(cx+19*u,cy); oc.lineTo(cx+R*.95,cy); oc.moveTo(cx,cy+5*u); oc.lineTo(cx,cy+R*.95); },1.2); }
  else if(st==='uk'){ const g=3*u;
    F(()=>{ oc.rect(cx-R*.95,cy-u*.9,R*.95-g-u*6,u*1.8); }); F(()=>{ oc.rect(cx+g+u*6,cy-u*.9,R*.95-g-u*6,u*1.8); }); F(()=>{ oc.rect(cx-u*.9,cy+g+u*6,u*1.8,R*.95-g-u*6); });
    L(()=>{ oc.moveTo(cx-g-u*6,cy); oc.lineTo(cx-g,cy); oc.moveTo(cx+g,cy); oc.lineTo(cx+g+u*6,cy); oc.moveTo(cx,cy+g); oc.lineTo(cx,cy+g+u*6); oc.moveTo(cx,cy-g); oc.lineTo(cx,cy-g-u*6); },1.1); }
  else { const step=st==='us'?5:4;
    L(()=>{ oc.moveTo(cx-R*.95,cy); oc.lineTo(cx+R*.95,cy); oc.moveTo(cx,cy-R*.6); oc.lineTo(cx,cy+R*.95); },1.1);
    for(let k=1;k*step*u<R*.9;k++){ const x=k*step*u, h=k%2?1.2*u:2.2*u; L(()=>{ oc.moveTo(cx-x,cy-h); oc.lineTo(cx-x,cy+h); oc.moveTo(cx+x,cy-h); oc.lineTo(cx+x,cy+h); },1);
      if(st==='us'&&k%2===0&&x<R*.75){ T(cx-x,cy-h-4,String(k*step)); T(cx+x,cy-h-4,String(k*step)); } } }
  // alzas: dónde poner el blanco según la distancia (la alza fija está en 200 m)
  if(manual){ const v=ammoOf(t).v, z0=ballisticPitch(200,0,v);
    for(let d=400;d<=1600;d+=200){ const y=cy+Math.tan(ballisticPitch(d,0,v)-z0)*ppr; if(y-cy>R*.9) break; const w=d%400===0?9*u*.5+6:4*u*.5+3, x0=st==='ru'||st==='uk'||st==='us'||st==='gen'?cx+7:cx;
      L(()=>{ oc.moveTo(x0,y); oc.lineTo(x0+w,y); if(st==='de'){ oc.moveTo(cx-w,y); oc.lineTo(cx,y); } },1.2); if(d%400===0) T(x0+w+9,y+4,String(d/100)); } }
  // adónde va el mouse: círculo punteado (el centro llega ahí cuando la torre termina de girar)
  if(lastAim){ const s=screenOrEdge(lastAim,30), off=s.edge||Math.hypot(s.x-cx,s.y-cy)>R*.92;
    if(off){ const a=s.edge?s.ang:Math.atan2(s.y-cy,s.x-cx), x=cx+Math.cos(a)*R*.9, y=cy+Math.sin(a)*R*.9;                    // fuera del vidrio: flecha en el borde hacia donde gira
      oc.fillStyle='rgba(255,255,255,.85)'; oc.beginPath(); oc.moveTo(x+Math.cos(a)*12,y+Math.sin(a)*12); oc.lineTo(x+Math.cos(a+2.5)*9,y+Math.sin(a+2.5)*9); oc.lineTo(x+Math.cos(a-2.5)*9,y+Math.sin(a-2.5)*9); oc.fill(); }
    else if(Math.hypot(s.x-cx,s.y-cy)>4){ oc.setLineDash([3,3]); oc.lineWidth=1.5; oc.strokeStyle='rgba(255,255,255,.85)'; oc.beginPath(); oc.arc(s.x,s.y,7,0,7); oc.stroke(); oc.setLineDash([]); } }
  if(t.gunLim){ T(cx,cy-30,t.gunLim<0?'El cañón no baja más':'El cañón no sube más'); }
  if(manual&&t.reloadT>0){ oc.strokeStyle='#ffc65c'; oc.lineWidth=3; oc.beginPath(); oc.arc(cx,cy,R*.97,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-t.reloadT/(t.reloadMax*reloadFactor(t)))); oc.stroke(); } }


// ---- Cartel de baja en el centro (pedido de Sebastián): de lejos no se distinguía si el tanque quedó destruido o sigue vivo.
// Grande y claro unos 2,4 s: "TANQUE DESTRUIDO" + el vehículo. Local: envolviendo destroy (el que mató es el jugador);
// invitados online: llega la nota "Tanque destruido" del anfitrión (showAward) y se muestra igual.
(function(){
  let lastKB=0;
  function killBanner(sub,crush){ let el=document.getElementById('killB');
    if(!el){ el=document.createElement('div'); el.id='killB'; el.className='hud';
      el.style.cssText='position:fixed;left:50%;top:34%;transform:translate(-50%,-50%) scale(1);text-align:center;pointer-events:none;z-index:7;opacity:0;transition:opacity .25s,transform .25s;font-family:"Saira Condensed",sans-serif;text-shadow:0 0 6px #000,0 2px 3px #000';
      document.body.appendChild(el); }
    el.innerHTML=`<div style="font:800 46px 'Saira Condensed',sans-serif;letter-spacing:3px;color:#ff5a3c">${crush||'TANQUE DESTRUIDO'}</div>${sub?`<div style="font:600 21px 'Saira Condensed',sans-serif;color:#f2e6c8">${sub}</div>`:''}`;
    el.style.opacity=1; el.style.transform='translate(-50%,-50%) scale(1.08)'; setTimeout(()=>el.style.transform='translate(-50%,-50%) scale(1)',120);
    clearTimeout(el._t); el._t=setTimeout(()=>el.style.opacity=0,2400); lastKB=performance.now(); }
  window.killBanner=killBanner;
  const _d=destroy;
  destroy=function(t,by){ const was=t&&!t.dead; const r=_d.apply(this,arguments);
    if(was&&by&&by.isPlayer&&t.team!==by.team) killBanner(`${t.T.label}${t.name&&!t.crew?.gun?' · '+t.name:''}`,t.T.static?(t.crushed||Math.abs(by.speed||0)>1?'CAÑÓN APLASTADO':'CAÑÓN DESTRUIDO'):t.T.cls==='semioruga'||t.T.support?'VEHÍCULO DESTRUIDO':''); return r; };
  const _sa=showAward;
  showAward=function(name){ const r=_sa.apply(this,arguments); if(name==='Tanque destruido'&&performance.now()-lastKB>600) killBanner('',false); return r; };
})();
