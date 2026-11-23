/* ---------- M1 Abrams «Alejandro»: tanque homenaje (pedido de Sebastián, 22/11/2026) ----------
   Versión del Abrams de juguete que le regaló su amigo Alejandro (sacada del video que pasó): gris azulado con manchas blancas y gris
   oscuro y cuadraditos "digitales", orugas negras, luces de atrás violetas, rollos atrás en la popa y freno de boca en el cañón.
   Argentina, Guerra Fría (época 5). Mismos números que el M1 Abrams (como los tanques especiales de diario.js), fuera del árbol:
   se regala y va directo al garaje argentino de la época 5. En lugar de las cruces del juguete lleva escarapelas argentinas
   y el nombre ALEJANDRO a los costados de la torre. Va después de diario.js. */
(()=>{
  if(!VEH.abrams) return;
  const K='abr_ale', B=VEH.abrams;
  const ES='M1 Abrams «Alejandro»';
  VEH[K]={...B,nation:'ar',era:5,special:1,br:B.br||10.3,year:1980,label:ES,
    desc:'Tanque homenaje a Alejandro, que regaló el Abrams de juguete en el que está inspirado: camuflaje digital gris azulado, escarapelas argentinas y su nombre en la torre. Mismos números que el M1 Abrams.',
    camo:['#66758a','#e4e8ec','#363d48'],camoMode:'jug',
    m:Object.assign({},B.m,{w2:Object.assign({},B.m.w2,{jug:1})})};
  if(typeof AMMO_DEF!=='undefined'&&AMMO_DEF.abrams) AMMO_DEF[K]=AMMO_DEF.abrams;
  if(typeof FC!=='undefined'&&FC.abrams) FC[K]={...FC.abrams};
  if(typeof OPTIC!=='undefined'&&OPTIC.abrams) OPTIC[K]=OPTIC.abrams;
  if(typeof MG_CAL!=='undefined') MG_CAL[K]=MG_CAL.abrams||12.7;

  // ---- pintura del juguete: base gris azulado, manchas blancas con su sombra gris oscuro y cuadraditos sueltos ----
  const paint=(x,s)=>{ const [b,w,d]=VEH[K].camo; x.fillStyle=b; x.fillRect(0,0,s,s);
    const blob=(cx,cy,r,col)=>{ x.fillStyle=col; x.beginPath(); for(let j=0;j<10;j++){ const a=j/10*Math.PI*2, rr=r*rand(.6,1.1); x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.7); } x.closePath(); x.fill(); };
    for(let i=0;i<12;i++){ const cx=Math.random()*s, cy=Math.random()*s, r=rand(34,72);
      blob(cx+r*.45,cy+r*.25,r*.75,d);                                                                   // la mancha oscura asoma al costado
      blob(cx,cy,r,w); }
    const q=10;                                                                                         // "pixeles" del camuflaje digital
    for(let i=0;i<50;i++){ const X=Math.floor(Math.random()*s/q)*q, Y=Math.floor(Math.random()*s/q)*q, n=1+(Math.random()*3|0);
      x.fillStyle=Math.random()<.55?w:d; for(let k=0;k<n;k++) x.fillRect(X+k*q*(Math.random()<.5?1:0),Y+k*q*(Math.random()<.5?1:0),q,q); }
    for(let i=0;i<10;i++){ x.fillStyle='#c9ced4'; x.fillRect(Math.random()*s,Math.random()*s,rand(18,40),5); }   // rayitas blancas de las chapas del juguete
    speckle(x,s,s,1800,['#000000','#ffffff','#2a2f38'],1,2.2); };
  if(typeof _vehCamo!=='undefined'&&typeof canvasTex==='function') _vehCamo[K]=[canvasTex(512,paint),canvasTex(512,mudPaint(paint))];

  // ---- el nombre en la torre ----
  let nameMat=null;
  const nameMatOf=()=>{ if(nameMat) return nameMat; const c=document.createElement('canvas'); c.width=512; c.height=96; const x=c.getContext('2d');
    x.font='bold 70px "Arial Black", Arial, sans-serif'; x.textAlign='center'; x.textBaseline='middle';
    x.lineWidth=8; x.strokeStyle='rgba(30,34,40,.85)'; x.strokeText('ALEJANDRO',256,52); x.fillStyle='#eef1f4'; x.fillText('ALEJANDRO',256,52);
    const t=new THREE.CanvasTexture(c); t.anisotropy=4;
    return nameMat=new THREE.MeshLambertMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}); };
  const purple=new THREE.MeshBasicMaterial({color:0x8a3cff});
  const rollM=new THREE.MeshLambertMaterial({color:0x5c6a7e});

  const D=DET.abr, _hull=D.hull, _tur=D.tur;
  D.hull=function(root,M,I,mat,iw2,deck,gz,zf,zr,L){ _hull.apply(this,arguments); if(!I.jug) return;
    const hw=M.W/2;
    for(const sx of [-1,1]){ const l=rbox(root,.24,.14,.06,sx*(hw-.35),deck-.02,zr-.05,darkMat,.02); box(l,.18,.08,.02,0,0,-.035,purple); }   // luces violetas del juguete
    // dos rollos acanalados sobre la popa (en el juguete van atrás de todo)
    for(const k of [0,1]){ const z=zr+.28+k*.3, c=cyl(root,.14,.14,iw2*.78,0,deck+.15,z,12,rollM); c.rotation.z=Math.PI/2;
      for(let r=-3;r<=3;r++){ const g=cyl(root,.15,.15,.04,r*iw2*.11,deck+.15,z,12,darkMat); g.rotation.z=Math.PI/2; } } };
  D.tur=function(tur,G,M,I,mat,gy){ _tur.apply(this,arguments); if(!I.jug) return;
    const hw=M.tw/2, hl=M.tl/2, th=M.th;
    for(const sx of [-1,1]){
      const p=new THREE.Mesh(new THREE.PlaneGeometry(1.15,.22),nameMatOf()); p.position.set(sx*(hw+.27),th*.42,-hl*.62); p.rotation.y=sx*Math.PI/2; tur.add(p);   // en el cajón del bustle
      w2Insignia(tur,'ar',sx*(hw+.06),th*.45,-hl*.15,sx>0?0:Math.PI,.6); }
    // freno de boca grueso como el del juguete
    const gl=M.gl, r=M.gr; for(const dz of [0,.16]){ const c=cyl(G.barrel,r*2.1,r*2.1,.1,0,0,gl-.08-dz,12,mat); c.rotation.x=Math.PI/2; } };

  // ---- se regala: queda investigado, comprado y primero en el garaje argentino de la Guerra Fría ----
  const give=()=>{ if(!PROG||!PROG.unlocked||!PROG.owned||!PROG.garage) return false; if(PROG.owned[K]&&PROG.regaloAle) return false;
    PROG.unlocked[K]=1; PROG.owned[K]=1; PROG.regaloAle=1;
    const g=garRef('ar',5); if(!g.includes(K)){ g.unshift(K); if(g.length>3) g.length=3; } return true; };
  const _load=loadProg; loadProg=function(){ const r=_load.apply(this,arguments); give(); return r; };
  const _save=saveProg; saveProg=function(){ give(); return _save.apply(this,arguments); };
  window.regaloAlejandro=give;
})();
