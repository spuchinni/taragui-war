/* ---------- Brasil: nación nueva con requisito (26/11/2026, pedido de Sebastián: "para desbloquear Argentina o alguna otra nación como
   Paraguay, Uruguay, Chile, Bolivia, Colombia, Perú y Brasil debemos tener ciertos requisitos, ya que no todos en la 2ª tenían tanque") ----------
   Estilo WT (como Israel): Brasil se abre al investigar el M4A1 Sherman de EE. UU. (sus Sherman y Stuart llegaron por préstamo y arriendo).
   Línea: rango III (Stuart y Sherman) y rango V (Cascavel, M41C, Leopard 1A1, M60A3 TTS, Leopard 1A5BR). Por ahora todos usan los modelos
   y los números de los tanques que ya estaban (copias con nation:'br' y la bandera de Brasil); el X1 (Stuart con 90 mm) queda para después.
   Fuentes (26/11/2026): Lend-Lease Sherman tanks (Wikipedia: 53 Sherman a Brasil), tanks-encyclopedia.com (Bernardini X1),
   globalsecurity.org (modernización del Ejército: M41B/C de Bernardini con 90 mm Cockerill), bdex.eb.mil.br (trabajos de la EsIE y la ECEME:
   Stuart el tanque más numeroso, Sherman hasta 1979, 128 Leopard 1A1 belgas desde 1996), armyrecognition.com y Janes (M60A3 TTS, Leopard 1A5BR).
   Va después de alejandro.js. Requisitos de nación genéricos: NATIONS[n].abre = {veh:'clave'} (o {rango:r, cant:c}). */
(()=>{
  NATIONS.br={label:'Brasil',desc:'M3A1 Stuart, M4 Sherman, EE-9 Cascavel, M41C, Leopard 1A1, M60A3 TTS y Leopard 1A5BR.',lineup:['ee9_br','m41c_br','leo_br'],
    names:['Sgt. Oliveira','Cabo Santos','Ten. Souza','Sgt. Lima','Cabo Pereira'],camo:['#4f5a3a','#6b6a45','#2a2c1f'],
    abre:{veh:'m4a1',txt:'Investigá el M4A1 Sherman de Estados Unidos'}};
  if(ERAS[3]&&ERAS[3].sides&&!ERAS[3].sides[0].includes('br')) ERAS[3].sides[0].push('br');   // Brasil entró en la guerra con los Aliados en 1942
  if(typeof NAT_ERA!=='undefined'&&NAT_ERA[3]) NAT_ERA[3].br={label:'Brasil',names:['Sgt. Oliveira','Cabo Santos','Ten. Souza','Sgt. Lima','Cabo Pereira']};

  // Copia un vehículo con todas sus tablas (munición, control de tiro, mira, ametralladora, arco del cañón, giro de la torre)
  const TABLES=()=>[typeof AMMO_DEF!=='undefined'&&AMMO_DEF,typeof FC!=='undefined'&&FC,typeof OPTIC!=='undefined'&&OPTIC,typeof MG_CAL!=='undefined'&&MG_CAL,
    typeof GUN_ARC!=='undefined'&&GUN_ARC,typeof TRAV_DEG!=='undefined'&&TRAV_DEG].filter(Boolean);
  // copiaVeh(clave nueva, base, nación, insignia, cambios): la usa también latinoamerica.js
  function copiaVeh(K,base,nat,ins,o){ const B=VEH[base]; if(!B) return; const m=B.m?Object.assign({},B.m,B.m.w2?{w2:Object.assign({},B.m.w2,{ins})}:{}):B.m;
    VEH[K]=Object.assign({},B,{nation:nat,special:0,m},o); for(const T of TABLES()) if(T[base]!==undefined&&T[K]===undefined) T[K]=Array.isArray(T[base])?T[base].slice():typeof T[base]==='object'?{...T[base]}:T[base]; }
  window.copiaVeh=copiaVeh;
  const copia=(K,base,o)=>copiaVeh(K,base,'br','br',o);
  copia('st_br','m3stuart',{label:'M3A1 Stuart (Brasil)',year:1942,
    desc:'Llegó por préstamo y arriendo desde 1941 y fue el tanque más numeroso de la historia del Ejército Brasileño. Sirvió hasta los años 70, cuando Bernardini modernizó parte de ellos (el X1). Mismos números que el M3A1 Stuart.'});
  copia('sh_br','m4a1',{label:'M4 Sherman (Brasil)',year:1944,
    desc:'Unos 50 Sherman llegaron por préstamo y arriendo al final de la guerra (las fuentes no coinciden en el año ni en la cantidad exacta). Sirvieron hasta 1979, cuando los reemplazaron los M41. Modelo y números del M4A1.'});
  copia('ee9_br','ee9',{label:'EE-9 Cascavel',desc:'Blindado 6×6 de Engesa, fabricado en Brasil y exportado a medio mundo. Cañón EC-90 de 90 mm (Cockerill hecho bajo licencia).'});
  copia('m41c_br','m41u',{label:'M41C',desc:'M41 Walker Bulldog modernizado por Bernardini en São Paulo: el 76 mm original se cambió por un Cockerill de 90 mm, el calibre estándar del Ejército. Sin visión térmica.'});
  if(FC.m41c_br) delete FC.m41c_br.thermal;
  copia('leo_br','leopard1',{label:'Leopard 1A1 (Brasil)',desc:'128 Leopard 1A1 de Bélgica, los primeros tanques de batalla principales de Brasil; empezaron a llegar en 1996.'});
  copia('m60_br','m60a3',{label:'M60A3 TTS (Brasil)',desc:'Llegaron de EE. UU. a mediados de los 90. En 2025 el Ejército restauró 17 en la Operación Patton 2025.'});
  copia('leo5_br','leo1a5',{label:'Leopard 1A5BR',desc:'Los Leopard 1A5 alemanes que reemplazaron a los 1A1 belgas; con el M60A3 TTS, el tanque principal del Ejército Brasileño de hoy.'});

  // ---- bandera de Brasil en la chapa (verde, rombo amarillo y círculo azul) ----
  const _brV=new THREE.MeshLambertMaterial({color:0x1f7a3a}), _brA=new THREE.MeshLambertMaterial({color:0xf2c81e}), _brZ=new THREE.MeshLambertMaterial({color:0x1d3f8a});
  function brFlag(parent,x,y,z,ry,s=1){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; parent.add(g);
    box(g,.02,.3*s,.44*s,0,0,0,_brV);
    const r=box(g,.024,.19*s,.19*s,0,0,0,_brA); r.rotation.x=Math.PI/4; r.scale.z=1.45;
    const c=new THREE.Mesh(new THREE.CircleGeometry(.075*s,16),_brZ); c.rotation.y=Math.PI/2; c.position.x=.016; g.add(c);
    return g; }
  // banderas en la chapa: FLAG_INS[clase] = función (parent,x,y,z,ry,s); latinoamerica.js suma las suyas
  window.FLAG_INS={br:brFlag};
  if(typeof w2Insignia==='function'){ const _w=w2Insignia; w2Insignia=function(parent,kind,x,y,z,ry,s){ const F=FLAG_INS[kind]; return F?F(parent,x,y,z,ry,s||1):_w.apply(this,arguments); }; }

  // ---- requisitos de nación (genéricos) ----
  const reqOk=n=>{ const A=NATIONS[n]&&NATIONS[n].abre; if(!A) return true;
    if(A.veh) return researched(A.veh);
    if(A.rango) return lineNations().some(x=>x!==n&&vehTreeE(x,A.rango).filter(researched).length>=(A.cant||1));
    return true; };
  const natOpen=n=>!(NATIONS[n]&&NATIONS[n].abre)||(PROG&&(PROG.reqN||[]).includes(n));
  window.natReqLocked=n=>!natOpen(n);
  const reqTxt=n=>{ const A=NATIONS[n].abre; return A.txt||(A.veh?`Investigá el ${VEH[A.veh].label}`:`Investigá ${A.cant||1} tanque${(A.cant||1)>1?'s':''} de rango ${RANK_ROMAN[A.rango]} de cualquier nación`); };
  // Abre las naciones cuyo requisito se cumplió: el primero de su línea en la puerta de entrada queda investigado (no se regala: hay que
  // comprarlo, 26/11/2026, pedido de Sebastián: "no regalamos nada salvo los tanques de reserva") y avisa
  function checkReqNations(){ if(!PROG||PROG.train) return []; const out=[];
    // también se abre si ya tenías comprado un tanque de esa línea (Chile, Uruguay y Paraguay pasaron a Latinoamérica)
    for(const n in NATIONS){ if(NATIONS[n].abre&&!natOpen(n)&&(reqOk(n)||vehLine(n).some(owned))){ PROG.reqN=PROG.reqN||[]; PROG.reqN.push(n);
      const T=vehTreeE(n,RANK_ENTRY), f=T[0]||vehLine(n)[0]; if(f) PROG.unlocked[f]=1; out.push([n,f]); } }
    if(out.length){ saveProg(); const [n,f]=out[0]; banner(`Nueva nación: ${NATIONS[n].label}`,f?`El ${VEH[f].label} ya está investigado: compralo en el hangar (${ypCost(f).toLocaleString('es-AR')} Yaguaretés).`:'Ya está en el hangar.',4); }
    return out; }
  window.checkReqNations=checkReqNations;
  { const _s=summary; summary=function(){ const r=_s.apply(this,arguments); setTimeout(()=>{ try{ checkReqNations(); }catch(e){ console.warn('naciones',e); } },2200); return r; }; }
  { const _m=mainMenu; mainMenu=function(){ const r=_m.apply(this,arguments); try{ if(checkReqNations().length&&menuScreen==='hangar') renderHangar(); }catch(e){ console.warn('naciones',e); } return r; }; }
  // hangar: 🔒 en las naciones con requisito y el botón de jugar dice qué falta
  { const _rh=renderHangar; renderHangar=function(){ const r=_rh.apply(this,arguments);
      try{ document.querySelectorAll('.hgN[data-n]').forEach(b=>{ const n=b.dataset.n; if(!natOpen(n)){ b.title=reqTxt(n); if(!b.querySelector('.lk')) b.insertAdjacentHTML('beforeend','<span class="lk" data-notr> 🔒</span>'); } });
        const pb=document.getElementById('hgPlay'); if(pb&&!natOpen(chosenNation)&&['battle','tut','camp'].includes(playMode)){ pb.disabled=true; pb.textContent=`🔒 ${reqTxt(chosenNation)} para abrir ${NATIONS[chosenNation].label}`; }
        else if(pb&&!garageOf(chosenNation).length&&['battle','camp'].includes(playMode)){ pb.disabled=true; pb.textContent='Comprá un tanque para jugar'; }   // nación abierta pero sin tanques comprados
      }catch(e){ console.warn('naciones',e); }
      return r; }; }
})();
