// Infantería y civiles más reales (pedido de Sebastián con referencias de Sketchfab; hecho por código):
//  · Armas por país (épocas 1–3): Kar98k y MP 40 (Alemania), Mosin-Nagant (a veces con bayoneta) y PPSh-41 (URSS), M1 Garand y Thompson (EE. UU.),
//    Lee-Enfield n.º 4 y Sten (R. Unido), Mauser modelo 1909 (Argentina), Arisaka (Japón). Una malla con colores por vértice por modelo (madera y metal).
//  · Cascos de la 2ª Guerra por país: Stahlhelm M35/M40 con el faldón abierto (Alemania; también el chino), SSh-40 redondo (URSS), M1 (EE. UU.),
//    Brodie (R. Unido), Adrian (Francia). El argentino queda como estaba hasta confirmarlo con fuentes.
//  · Civiles quietos con poses variadas: manos en los bolsillos, brazos cruzados, manos atrás o charlando con gestos.
(function(){
  const C=new THREE.Color();
  // ---- armas: partes [forma, w|r, h|len, d, x, y, z, color, rotX] ----
  const WOOD=0x6a4a2c, WOOD2=0x7a5634, MET=0x262626, MET2=0x3a3a38;
  function build(parts){ const geos=[]; for(const p of parts){ const [f,a,b,c,x,y,z,col,rx]=p; let g;
      if(f==='b') g=new THREE.BoxGeometry(a,b,c); else { g=new THREE.CylinderGeometry(a,a,b,c||8); g.rotateX(Math.PI/2); }
      if(rx) g.rotateX(rx); if(f==='cx'){ g.rotateX(-Math.PI/2); g.rotateZ(Math.PI/2); } g.translate(x,y,z); g=g.index?g.toNonIndexed():g;
      const n=g.attributes.position.count, cols=new Float32Array(n*3); C.set(col); for(let i=0;i<n;i++){ cols[i*3]=C.r; cols[i*3+1]=C.g; cols[i*3+2]=C.b; }
      g.setAttribute('color',new THREE.BufferAttribute(cols,3)); geos.push(g); }
    // unión propia (la de 04-mundo.js no lleva colores)
    const out=new THREE.BufferGeometry(); for(const nm of ['position','normal','color']){ const len=geos.reduce((t,g)=>t+g.attributes[nm].array.length,0), A=new Float32Array(len); let o=0;
      for(const g of geos){ A.set(g.attributes[nm].array,o); o+=g.attributes[nm].array.length; } out.setAttribute(nm,new THREE.BufferAttribute(A,3)); }
    out.computeBoundingSphere(); return out; }
  const bolt=(x,z,down)=>[['b',.012,.012,.06,x+.03,down?.0:.04,z,MET,down?.6:0],['c',.014,.02,6,x+.055,down?-.02:.04,z,MET]];
  const DEF={
    k98:[['b',.045,.11,.2,0,-.035,-.47,WOOD,-.12],['b',.04,.07,.14,0,-.01,-.3,WOOD],['b',.045,.06,.56,0,.0,.05,WOOD],['b',.034,.045,.24,0,.04,-.13,MET],
         ['c',.012,.34,8,0,.035,.47,MET],['c',.017,.02,8,0,.03,.3,MET],['b',.012,.03,.07,0,-.04,-.18,MET],...bolt(0,-.18,true)],
    mauser09:[['b',.045,.11,.2,0,-.035,-.5,WOOD,-.12],['b',.04,.07,.14,0,-.01,-.33,WOOD],['b',.045,.06,.64,0,.0,.07,WOOD],['b',.034,.045,.24,0,.04,-.15,MET],
         ['c',.012,.36,8,0,.035,.55,MET],['c',.017,.02,8,0,.03,.34,MET],['b',.012,.03,.07,0,-.04,-.2,MET],...bolt(0,-.2,false)],
    mosin:[['b',.045,.11,.2,0,-.035,-.52,WOOD2,-.12],['b',.04,.065,.14,0,-.01,-.35,WOOD2],['b',.045,.06,.68,0,.0,.07,WOOD2],['b',.034,.045,.22,0,.04,-.18,MET],
         ['c',.012,.36,8,0,.035,.58,MET],['c',.017,.02,8,0,.03,.24,MET],['c',.017,.02,8,0,.03,.4,MET],['b',.012,.035,.08,0,-.045,-.2,MET],...bolt(0,-.24,false)],
    mosinB:null,
    enfield:[['b',.045,.11,.2,0,-.035,-.48,WOOD,-.12],['b',.04,.065,.13,0,-.01,-.32,WOOD],['b',.046,.065,.6,0,.0,.06,WOOD],['b',.04,.03,.5,0,.045,.1,WOOD],['b',.034,.045,.2,0,.04,-.15,MET],
         ['b',.035,.08,.08,0,-.06,-.12,MET],['c',.012,.08,8,0,.04,.4,MET],['b',.03,.04,.04,0,.035,.37,MET],...bolt(0,-.22,true)],
    garand:[['b',.048,.11,.22,0,-.04,-.48,WOOD,-.12],['b',.042,.07,.14,0,-.012,-.31,WOOD],['b',.048,.065,.5,0,.0,.04,WOOD],['b',.04,.03,.36,0,.045,.08,WOOD],['b',.036,.05,.26,0,.04,-.14,MET],
         ['c',.013,.3,8,0,.045,.43,MET],['c',.011,.28,6,0,.015,.4,MET],['b',.012,.03,.06,0,-.045,-.2,MET]],
    arisaka:[['b',.044,.11,.2,0,-.035,-.52,WOOD2,-.12],['b',.04,.065,.14,0,-.01,-.35,WOOD2],['b',.045,.06,.66,0,.0,.08,WOOD2],['b',.034,.045,.22,0,.04,-.18,MET],
         ['c',.012,.34,8,0,.035,.58,MET],['b',.03,.035,.12,0,.065,-.18,MET],...bolt(0,-.22,false)],
    mp40:[['c',.022,.42,10,0,.03,.02,MET],['c',.011,.18,6,0,.03,.3,MET2],['b',.03,.2,.035,0,-.09,.08,MET],['b',.03,.11,.045,0,-.04,-.12,MET2],['b',.03,.04,.06,0,-.02,-.05,MET],
         ['b',.008,.012,.3,.022,.02,-.33,MET],['b',.008,.012,.3,-.022,.02,-.33,MET],['b',.05,.06,.02,0,.0,-.48,MET]],
    ppsh:[['b',.045,.12,.32,0,-.03,-.36,WOOD2],['b',.042,.07,.12,0,0,-.16,WOOD2],['b',.04,.055,.18,0,.03,-.02,MET],['c',.027,.28,10,0,.035,.22,MET2],['c',.009,.06,6,0,.035,.38,MET],
         ['cx',.09,.05,14,0,-.08,.03,MET]],
    thompson:[['b',.045,.11,.26,0,-.025,-.36,WOOD],['b',.04,.08,.32,0,.03,-.08,MET],['c',.022,.3,10,0,.035,.24,MET2],['b',.03,.11,.04,0,-.06,.18,WOOD],['b',.03,.1,.04,0,-.05,-.18,WOOD],
         ['b',.032,.17,.04,0,-.1,.03,MET]],
    sten:[['c',.024,.4,10,0,.03,.04,MET],['c',.011,.12,6,0,.03,.29,MET2],['b',.2,.035,.035,-.12,.03,.06,MET],['b',.008,.1,.008,0,-.02,-.2,MET],['b',.008,.008,.3,0,-.065,-.33,MET],['b',.008,.008,.3,0,.025,-.33,MET],
         ['b',.04,.09,.015,0,-.02,-.48,MET],['b',.025,.07,.035,0,-.03,-.1,MET]],
  };
  DEF.mosinB=DEF.mosin.concat([['b',.012,.012,.42,0,.025,.95,0x9a9a98]]);
  const GEO={}; const geoOf=k=>GEO[k]||(GEO[k]=build(DEF[k]));
  const R=()=>Math.random();
  function pickWeapon(nat,era,kind){ const smg=era===3&&kind==='rifle';
    if(nat==='de') return smg&&R()<.25?'mp40':'k98';
    if(nat==='ru') return smg&&R()<.35?'ppsh':(era<=2||R()<.3?'mosinB':'mosin');
    if(nat==='us') return smg&&R()<.3?'thompson':era===3?'garand':'k98';
    if(nat==='uk') return smg&&R()<.25?'sten':'enfield';
    if(nat==='ar') return 'mauser09';
    if(nat==='jp') return 'arisaka';
    if(nat==='fr') return 'mosin';   // Lebel/Berthier: largos, sin cargador a la vista
    return 'k98'; }
  window.weaponGeo=geoOf;
  // ---- cascos de la 2ª Guerra ----
  const lathe=(pts,seg=16)=>new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg);
  { const st=lathe([[0,.175],[.07,.17],[.115,.15],[.143,.105],[.152,.05],[.155,.012],[.172,-.03],[.19,-.055]]); st.scale(1,1,1.1); st.translate(0,.0,-.012);
    _helmG.stahl=[st]; _helmM.stahl=new THREE.MeshLambertMaterial({color:0x5a5d4b,side:THREE.DoubleSide});
    const ss=lathe([[0,.175],[.08,.165],[.128,.13],[.15,.075],[.156,.02],[.164,-.018],[.168,-.026]]); ss.scale(1,1,1.06); ss.translate(0,.0,-.005);
    _helmG.ssh40=[ss]; _helmM.ssh40=new THREE.MeshLambertMaterial({color:0x4d5a3a,side:THREE.DoubleSide});
    if(!_helmM.m1) _helmM.m1=new THREE.MeshLambertMaterial({color:0x4e5236}); if(!_helmM.jpn) _helmM.jpn=new THREE.MeshLambertMaterial({color:0x6a6440}); }
  const HELM3={de:'stahl',cn:'stahl',ru:'ssh40',us:'m1',uk:'brodie',fr:'adrian',jp:'jpn'};
  // ---- personMesh envuelto: casco de la época antes de armarse (se hornea en la cabeza) y arma del país después ----
  const _pm=personMesh; personMesh=function(o){
    const era=(typeof W!=='undefined'&&W&&W.era)||5, nat=o&&(o.nat||(o.team===0?allyNation:foeNation)), N=nat&&NATIONS[nat];
    let set=false; if(era===3&&N&&!N.helm&&HELM3[nat]&&o.kind!=='civ'&&o.kind!=='crew'){ N.helm=HELM3[nat]; set=true; }
    let P; try{ P=_pm.apply(this,arguments); } finally{ if(set) N.helm=null; }
    try{ const w=P.parts&&P.parts.wep; if(w&&w.isMesh&&era<=3&&(o.kind==='rifle'||o.kind==='eng'||o.kind==='sniper')){ const k=o.kind==='sniper'?(nat==='ru'?'mosin':nat==='us'?'garand':nat==='uk'?'enfield':'k98'):pickWeapon(nat,era,o.kind);
        w.geometry=geoOf(k); w.scale.set(1,1,1); w.userData.wpn=k; } }catch(e){}
    return P; };
  // ---- civiles quietos con poses ----
  const IDLE=['pockets','crossed','back','talk','relax','relax'];
  const _IQ=new THREE.Quaternion(), _TL=new THREE.Vector3(), _TR=new THREE.Vector3(), _PL=new THREE.Vector3(), _PR=new THREE.Vector3(), L0=p=>p.armL.userData.fore&&p.armR.userData.fore;
  const _ai=animInf; animInf=function(P,dt){ _ai.apply(this,arguments);
    try{ const p=P.parts; if(!p||P.dead||P.kind!=='civ'||!p.armL||P.pose) return; const still=(P.spd||0)<.25;
      if(!P.idleK) P.idleK=IDLE[(Math.random()*IDLE.length)|0];
      if(P.sit) return;
      if(window.armIK&&L0(p)){ // con codo (posturas.js): cada pose pone las manos donde van y el brazo se acomoda solo
        const H=P._ik||(P._ik={l:new THREE.Vector3(-.26,-.02,.02),r:new THREE.Vector3(.26,-.02,.02)}), k=Math.min(1,dt*4), t=(typeof now==='number'?now:0)+(P.id||0);
        if(!still){ p.armL.rotation.y=p.armR.rotation.y=p.armL.rotation.z=p.armR.rotation.z=0; for(const f of [p.armL.userData.fore,p.armR.userData.fore]) f.quaternion.slerp(_IQ,Math.min(1,dt*6));
          H.l.set(-.26,-.02,.02); H.r.set(.26,-.02,.02); return; }
        if(!P.idleK) P.idleK=IDLE[(Math.random()*IDLE.length)|0];
        let l=_TL.set(-.26,-.02,.02), r=_TR.set(.26,-.02,.02);                                                       // sueltos
        if(P.idleK==='pockets'){ l.set(-.17,-.04,.06); r.set(.17,-.04,.06); }
        else if(P.idleK==='crossed'){ l.set(.07,.27,.15); r.set(-.07,.24,.17); }                                    // brazos cruzados
        else if(P.idleK==='back'){ l.set(-.04,.0,-.16); r.set(.04,.0,-.16); }                                       // manos atrás
        else if(P.idleK==='talk'){ l.set(-.2,-.02,.1); r.set(.17+Math.sin(t*2.3)*.06,.2+Math.max(0,Math.sin(t*1.1))*.14,.28); }   // gesticula
        H.l.lerp(l,k); H.r.lerp(r,k);
        const pz=P.idleK==='crossed'?.5:P.idleK==='back'?.2:-.6; armIK(p.armL,H.l,_PL.set(-1,-.6,pz)); armIK(p.armR,H.r,_PR.set(1,-.6,pz)); return; }
      const k=Math.min(1,dt*4), L=p.armL, Rr=p.armR; let lx=L.rotation.x, rx=Rr.rotation.x, lz=0, rz=0;
      if(still){ const t=(typeof now==='number'?now:0)+(P.id||0);
        if(P.idleK==='pockets'){ lx=.18; rx=.18; lz=-.1; rz=.1; }
        else if(P.idleK==='crossed'){ lx=-.42; rx=-.48; lz=.3; rz=-.3; }   // manos juntas adelante
        else if(P.idleK==='back'){ lx=.42; rx=.42; lz=.12; rz=-.12; }
        else if(P.idleK==='talk'){ lx=.05; rx=-.55+Math.sin(t*2.3)*.25; rz=-.15-Math.max(0,Math.sin(t*1.1))*.2; }
        else { lx=.04; rx=-.04; lz=-.04; rz=.04; } }
      L.rotation.x+=(lx-L.rotation.x)*(still?k:1); Rr.rotation.x+=(rx-Rr.rotation.x)*(still?k:1);
      L.rotation.z+=(lz-L.rotation.z)*k; Rr.rotation.z+=(rz-Rr.rotation.z)*k; }catch(e){} };
})();
