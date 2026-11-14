// Insignias históricas completas (pedido de Sebastián): en los uniformes alemanes de la 2ª Guerra, el águila con la esvástica en el pecho
// (Hoheitsadler) y la calcomanía del águila en el costado izquierdo del casco, como en las fotos de época. Solo como dato histórico en el
// uniforme: nada de banderas ni carteles. Opción en Ajustes (tw2_insig), APAGADA por defecto, y nunca en CrazyGames ni dentro de itch.io.
(function(){
  const LSg=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } }, LSs=(k,v)=>{ try{ localStorage.setItem(k,v); }catch(e){} };
  const itch=(()=>{ try{ if(/(^|[?&])desde=itch/.test(location.search)) return true; return window.top!==window&&/itch\.(io|zone)/.test(document.referrer||''); }catch(e){ return true; } })();
  const allowed=()=>(typeof PLATAFORMA==='undefined'||PLATAFORMA.id==='web')&&!itch;
  const on=()=>allowed()&&LSg('tw2_insig')==='1';
  window.insigOn=on;
  // águila del pecho: alas abiertas sobre la corona con la esvástica (gris plata sobre el gris campaña; en la chaqueta negra de tanquista, gris claro)
  function eagleTex(col){ const c=document.createElement('canvas'); c.width=128; c.height=72; const x=c.getContext('2d'); x.fillStyle=col; x.strokeStyle=col;
    // alas: plumas escalonadas hacia los costados
    for(const s of [-1,1]){ x.beginPath(); x.moveTo(64,30); for(let i=0;i<6;i++){ const xx=64+s*(10+i*8.5), yy=14+i*3.2; x.lineTo(xx,yy); x.lineTo(xx-s*2,yy+9-i*.4); } x.lineTo(64+s*8,40); x.closePath(); x.fill(); }
    x.beginPath(); x.ellipse(64,30,6,11,0,0,7); x.fill(); x.beginPath(); x.arc(60,17,4.5,0,7); x.fill(); x.beginPath(); x.moveTo(56,17); x.lineTo(51,18.5); x.lineTo(56,19.5); x.fill();   // cuerpo, cabeza y pico
    x.beginPath(); x.moveTo(60,40); x.lineTo(56,47); x.moveTo(68,40); x.lineTo(72,47); x.lineWidth=2.5; x.stroke();                                                   // garras
    x.lineWidth=3; x.beginPath(); x.arc(64,58,11,0,7); x.stroke();                                                                                                 // corona
    x.lineWidth=2.4; x.save(); x.translate(64,58); x.rotate(Math.PI/4); x.beginPath(); x.moveTo(-6,0); x.lineTo(6,0); x.moveTo(0,-6); x.lineTo(0,6);              // esvástica girada 45°
    x.moveTo(6,0); x.lineTo(6,4); x.moveTo(-6,0); x.lineTo(-6,-4); x.moveTo(0,-6); x.lineTo(4,-6); x.moveTo(0,6); x.lineTo(-4,6); x.stroke(); x.restore();
    const t=new THREE.CanvasTexture(c); t.anisotropy=2; return t; }
  let M=null; const mats=()=>M||(M={field:new THREE.MeshLambertMaterial({map:eagleTex('#c8c8b8'),transparent:true,alphaTest:.3,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),
    crew:new THREE.MeshLambertMaterial({map:eagleTex('#b8b8b0'),transparent:true,alphaTest:.3,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),
    helm:new THREE.MeshLambertMaterial({map:eagleTex('#d8d8d0'),transparent:true,alphaTest:.3,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2})});
  const chestG=new THREE.PlaneGeometry(.1,.056), helmG=new THREE.PlaneGeometry(.095,.053);
  const _pm=personMesh; personMesh=function(o){ const P=_pm.apply(this,arguments);
    try{ if(!on()||!o||o.kind==='civ'||o.kind==='dog') return P; const era=(typeof W!=='undefined'&&W&&W.era)||5; if(era!==3) return P;
      const nat=o.nat||(o.team===0?allyNation:foeNation); if(nat!=='de') return P;
      const m=mats(), T=P.parts&&P.parts.torso, H=P.parts&&P.parts.head; if(!T) return P;
      const ch=new THREE.Mesh(chestG,o.kind==='crew'?m.crew:m.field); ch.position.set(-.11,.2,.118); ch.rotation.y=-.4; T.add(ch);                     // pecho derecho
      if(H&&o.kind!=='crew'){ const hl=new THREE.Mesh(helmG,m.helm); hl.position.set(.142,.06,-.01); hl.rotation.set(0,Math.PI/2,-.12); H.add(hl); }          // casco, costado izquierdo
    }catch(e){}
    return P; };
  // Ajustes: solo donde está permitido
  const _rs=renderSettings; renderSettings=function(){ const r=_rs.apply(this,arguments); if(!allowed()) return r; const g=document.getElementById('g3R')||document.getElementById('pastoR'); if(!g) return r;
    const v=LSg('tw2_insig')==='1', d=document.createElement('div');
    d.innerHTML=`<h2>Insignias históricas completas</h2><div class="hgOpt" id="insR"><button class="${v?'sel':''}" data-v="1">Sí</button><button class="${v?'':'sel'}" data-v="0">No</button></div><p class="s">El águila con la esvástica en los uniformes alemanes de la 2ª Guerra, como en las fotos de época. Se aplica en la próxima batalla.</p>`;
    const p=g.nextElementSibling; (p&&p.classList.contains('s')?p:g).after(...d.childNodes);
    document.querySelectorAll('#insR button').forEach(b=>b.onclick=()=>{ LSs('tw2_insig',b.dataset.v); renderSettings(); });
    return r; };
})();
