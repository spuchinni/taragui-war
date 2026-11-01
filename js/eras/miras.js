/* ---------- Marcas del cañón y de las ametralladoras (pedido de Sebastián: "doy vuelta la vista y solo veo la marca de donde miro") ----------
   - Cañón: en los tanques sin telémetro (casi todos los de la 2ª Guerra, `manual` en drawOverlay) no se dibujaba nada. Ahora se marca
     hacia dónde apunta el tubo (derecho, sin la caída: la distancia la sigue calculando el jugador). Con telémetro sigue el círculo de impacto.
   - Si el cañón apunta fuera de la pantalla (miraste para otro lado), una burbuja en el borde muestra para dónde está girado.
   - Ametralladoras: una cruz chica por cada una (coaxial y montadas, ametralladoras.js) donde apunta a la distancia de tu mira:
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
  // cañón
  const P=manual?barrelPoint(t):predictImpact(t), S=screenOrEdge(P), col=t.gunLim?'rgba(255,90,60,.95)':t.reloadT<=0?'rgba(239,231,210,.95)':'rgba(239,231,210,.55)';
  if(S.edge){ const a=S.ang; oc.fillStyle='rgba(20,20,18,.75)'; oc.strokeStyle='#efe7d2'; oc.lineWidth=2; oc.beginPath(); oc.arc(S.x,S.y,16,0,7); oc.fill(); oc.stroke();
    oc.beginPath(); oc.arc(S.x,S.y,7,0,7); oc.moveTo(S.x-11,S.y); oc.lineTo(S.x-7,S.y); oc.moveTo(S.x+7,S.y); oc.lineTo(S.x+11,S.y); oc.stroke();
    oc.fillStyle='#efe7d2'; oc.beginPath(); oc.moveTo(S.x+Math.cos(a)*25,S.y+Math.sin(a)*25); oc.lineTo(S.x+Math.cos(a+.45)*17,S.y+Math.sin(a+.45)*17); oc.lineTo(S.x+Math.cos(a-.45)*17,S.y+Math.sin(a-.45)*17); oc.fill();
    oc.font='600 13px "Saira Condensed",sans-serif'; oc.textAlign='center'; oc.fillText('Cañón',S.x-Math.cos(a)*30,S.y-Math.sin(a)*30+4); }
  else if(manual){ gunRing(S.x,S.y,col,t);
    if(t.gunLim){ oc.fillStyle='rgba(255,90,60,.95)'; oc.font='700 15px "Saira Condensed",sans-serif'; oc.textAlign='center'; oc.fillText(t.gunLim<0?'El cañón no baja más':'El cañón no sube más',S.x,S.y+36); } }
  // ametralladoras: coaxial + montadas
  const aim=lastAim, L=[{muz:t.coax,dir:t.barrel,ok:true}].concat((t.mgs||[]).map(M=>({muz:M.muz,dir:M.pg,ok:M.can&&M.err<=.07&&M.seat.some(s=>manned(t,s))})));
  for(const G2 of L){ if(!G2.muz||!G2.dir) continue; const o=G2.muz.getWorldPosition(new THREE.Vector3()), d=G2.dir.getWorldDirection(new THREE.Vector3());
    const D=aim?clamp(o.distanceTo(aim),15,900):300, s=screenOrEdge(o.addScaledVector(d,D),20); if(s.edge) continue;
    const c=G2.ok?'rgba(255,214,120,.95)':'rgba(200,200,190,.4)';
    oc.lineWidth=3; oc.strokeStyle='rgba(0,0,0,.4)'; oc.beginPath(); oc.moveTo(s.x-6,s.y); oc.lineTo(s.x+6,s.y); oc.moveTo(s.x,s.y-6); oc.lineTo(s.x,s.y+6); oc.stroke();
    oc.lineWidth=1.5; oc.strokeStyle=c; oc.beginPath(); oc.moveTo(s.x-6,s.y); oc.lineTo(s.x-2,s.y); oc.moveTo(s.x+2,s.y); oc.lineTo(s.x+6,s.y); oc.moveTo(s.x,s.y-6); oc.lineTo(s.x,s.y-2); oc.moveTo(s.x,s.y+2); oc.lineTo(s.x,s.y+6); oc.stroke(); } }
{ const _do=drawOverlay; drawOverlay=function(){ _do.apply(this,arguments); try{ drawGunMarks(); }catch(e){ console.error(e); } }; }
