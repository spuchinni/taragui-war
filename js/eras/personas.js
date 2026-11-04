// Personas más reales (pedido de Sebastián con soldados, hombres, mujeres y chicos de Sketchfab como referencia; hecho por código).
// Reemplaza personMesh (11-personas.js) con las mismas articulaciones (hip → torso/cabeza/piernas/brazos, mismas alturas),
// así las animaciones, la muerte y los vehículos siguen andando igual. Cambia:
//  · Cuerpo: torso con pecho, cintura y hombros (perfil torneado), piernas con muslo, rodilla y pantorrilla, brazos con
//    bíceps y antebrazo, manos con pulgar; cada miembro en dos tramos para poder pintar mangas arremangadas, pantalones
//    cortos, medias y botas.
//  · Soldados por nación y época (`KIT`): Alemania (guerrera de 4 bolsillos, tirantes en Y, cartucheras de 3, tubo de la
//    máscara antigás, morral, granada de palo), URSS (gimnastiorka, capote enrollado en bandolera = skatka, mochila de
//    bolsa, a veces gorro pilotka), EE. UU. (chaqueta M41, cinto de cartuchos, mochila larga), Reino Unido (battledress
//    corta, cartucheras grandes del pecho del equipo 37, mochila chica, polainas cortas), Francia (capote largo con los
//    faldones prendidos atrás), Italia (solapas, cartucheras de cuero), Japón (cuello alto, cubrenuca), China (granadas de
//    palo en el cinto), 1ª Guerra (equipo 1908 británico, capote azul horizonte francés). Tripulantes: boina negra
//    británica, gorro y chaqueta negra alemanes, casco acolchado del resto.
//  · Civiles de época (épocas 1–4): traje con saco, camisa y corbata; obrero con chaleco o tiradores y mangas
//    arremangadas; campesino con mameluco; sombreros (fedora, gorra, boina, de paja en lugares cálidos), bigotes, sobretodo
//    en el frío. Mujeres con pollera larga, blusa, delantal, pañuelo, rodete o sombrerito, medias. Chicos (refugiados):
//    pantalón corto con medias tres cuartos o vestido con trenzas. Época 5: ropa moderna (remera, jean, zapatillas).
// Todo se hornea en las 6 mallas de siempre (bakePart): no suma llamadas de dibujo (antes el sobretodo, la pollera y la
// mochila iban sueltos y sumaban).
(function(){
  const lathe=(pts,seg=10)=>new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg);
  const up=a=>a.slice().sort((p,q)=>p[1]-q[1]);
  const B=(w,h,d,x=0,y=0,z=0)=>{ const g=new THREE.BoxGeometry(w,h,d); g.translate(x,y,z); return g; };
  const X={
    torsoM:(()=>{ const g=lathe(up([[.155,-.29],[.16,-.2],[.17,-.06],[.19,.08],[.205,.18],[.195,.25],[.13,.3],[.05,.318]])); g.scale(1,1,.62); return g; })(),
    torsoF:(()=>{ const g=lathe(up([[.155,-.29],[.135,-.14],[.142,-.03],[.165,.1],[.168,.2],[.15,.26],[.1,.29],[.05,.302]])); g.scale(1,1,.62); return g; })(),
    sh:new THREE.SphereGeometry(.072,8,6),
    thighM:lathe(up([[.096,.01],[.093,-.08],[.08,-.25],[.062,-.43]]),8), shinM:lathe(up([[.062,-.43],[.067,-.55],[.058,-.66],[.043,-.79],[.045,-.85]]),8),
    thighF:lathe(up([[.092,.01],[.09,-.08],[.074,-.25],[.056,-.42]]),8), shinF:lathe(up([[.056,-.42],[.062,-.54],[.052,-.66],[.037,-.79],[.04,-.84]]),8),
    uarmM:lathe(up([[.06,.02],[.054,-.12],[.043,-.29]]),8), farmM:lathe(up([[.043,-.29],[.047,-.36],[.034,-.56]]),8),
    uarmF:lathe(up([[.052,.02],[.046,-.12],[.037,-.28]]),8), farmF:lathe(up([[.037,-.28],[.04,-.35],[.029,-.54]]),8),
    hand:(()=>{ const g=new THREE.SphereGeometry(.042,7,5); g.scale(.85,1.35,.7); g.translate(0,-.02,0); return g; })(), thumb:B(.018,.045,.02),
    // ropa
    tunic:(r,h,f=1.18)=>{ const g=new THREE.CylinderGeometry(r,r*f,h,12,1,true); g.scale(1,1,.68); g.translate(0,-h/2,0); return g; },
    sleeveCuff:new THREE.CylinderGeometry(.05,.05,.04,8), pocket:B(.085,.095,.022), flap:B(.09,.03,.026), button:B(.016,.016,.01), lapel:B(.05,.16,.012),
    strap:B(.035,.5,.012), pouch3:B(.15,.08,.055), pouchS:B(.055,.07,.05), pouchB:B(.12,.16,.07), can:new THREE.CylinderGeometry(.055,.055,.26,10),
    bread:B(.2,.16,.07), smallPack:B(.28,.26,.12), haver:B(.24,.42,.11), sack:(()=>{ const g=new THREE.SphereGeometry(.15,8,6); g.scale(1.1,1.2,.6); return g; })(),
    skatka:(()=>{ const g=new THREE.TorusGeometry(.235,.045,6,16); g.scale(1,1.12,.62); return g; })(),
    stickG:new THREE.CylinderGeometry(.017,.017,.24,6), stickH:new THREE.CylinderGeometry(.036,.036,.075,8),
    tie:B(.04,.2,.012), collarW:B(.11,.04,.03), bib:B(.22,.24,.02), apron:(()=>{ const g=new THREE.PlaneGeometry(.3,.5); g.translate(0,-.25,0); return g; })(),
    vestShell:(()=>{ const g=lathe(up([[.163,-.29],[.168,-.2],[.178,-.06],[.198,.08],[.21,.16]])); g.scale(1,1,.64); return g; })(),
    skirtL:(()=>{ const g=new THREE.CylinderGeometry(.165,.29,.66,12,1,true); g.translate(0,-.33,0); return g; })(),
    skirtS:(()=>{ const g=new THREE.CylinderGeometry(.15,.22,.3,12,1,true); g.translate(0,-.15,0); return g; })(),
    shorts:(()=>{ const g=new THREE.CylinderGeometry(.1,.105,.24,8,1,true); g.translate(0,-.12,0); return g; })(),
    sock:new THREE.CylinderGeometry(.06,.05,.24,8),
    // cabeza
    mous:B(.06,.014,.014), bun:new THREE.SphereGeometry(.052,8,6), braid:(()=>{ const g=new THREE.CylinderGeometry(.025,.018,.2,6); g.translate(0,-.1,0); return g; })(), bow:B(.08,.035,.03),
    flatCap:(()=>{ const g=new THREE.SphereGeometry(.13,10,5,0,Math.PI*2,0,1.25); g.scale(1.02,.55,1.12); return g; })(), capPeak:(()=>{ const g=new THREE.CylinderGeometry(.1,.1,.012,10,1,false,-Math.PI/2,Math.PI); g.scale(1,1,.7); return g; })(),
    beret:(()=>{ const g=new THREE.SphereGeometry(.135,10,5,0,Math.PI*2,0,1.3); g.scale(1.05,.42,1.05); return g; })(),
    straw:new THREE.CylinderGeometry(.24,.24,.012,14), strawC:new THREE.CylinderGeometry(.1,.115,.09,12),
    cloche:(()=>{ const g=new THREE.SphereGeometry(.13,10,6,0,Math.PI*2,0,1.6); g.scale(1,.9,1.02); return g; })(), clocheB:new THREE.CylinderGeometry(.155,.16,.012,14),
    pilotka:(()=>{ const g=new THREE.BoxGeometry(.11,.07,.24); g.translate(0,.11,0); return g; })(),
    neckFlap:(()=>{ const g=new THREE.CylinderGeometry(.13,.15,.12,10,1,true,Math.PI*.55,Math.PI*.9); g.translate(0,-.03,0); return g; })(),
    kepi:(()=>{ const g=new THREE.CylinderGeometry(.105,.115,.1,12); g.translate(0,.1,0); return g; })(), kepiTop:(()=>{ const g=new THREE.CylinderGeometry(.108,.108,.012,12); g.translate(0,.155,0); return g; })(),
    badge:B(.035,.04,.012), cross:B(.012,.05,.008), crossH:B(.034,.012,.008), nurseCap:B(.17,.06,.13), toque:new THREE.CylinderGeometry(.11,.1,.2,12), toqueB:new THREE.CylinderGeometry(.122,.122,.06,12),
    hardHat:(()=>{ const g=new THREE.SphereGeometry(.14,10,6,0,Math.PI*2,0,1.5); g.scale(1,.85,1.08); return g; })(), hardBrim:(()=>{ const g=new THREE.CylinderGeometry(.165,.165,.012,14); g.scale(1,1,1.15); return g; })(),
    fireComb:B(.02,.06,.22), veil:(()=>{ const g=new THREE.SphereGeometry(.15,10,8,0,Math.PI*2,0,2.2); g.scale(1,1.1,1.05); return g; })(), veilBack:B(.24,.3,.04),
    steth:(()=>{ const g=new THREE.TorusGeometry(.075,.008,4,12,Math.PI); g.rotateZ(Math.PI); return g; })(), band:(r=.2)=>{ const g=new THREE.CylinderGeometry(r,r,.03,12,1,true); g.scale(1,1,.64); return g; },
    baton:new THREE.CylinderGeometry(.018,.018,.32,6), holster:B(.06,.14,.05), mailBag:B(.3,.24,.09), docBag:B(.26,.16,.12),
    fork:(()=>{ const L=[new THREE.CylinderGeometry(.015,.015,1.3,5).translate(0,.15,0)]; for(const x of [-.05,0,.05]) L.push(new THREE.CylinderGeometry(.006,.004,.22,4).translate(x,-.6,0)); L.push(B(.13,.02,.02,0,-.48,0)); return THREE.BufferGeometryUtils.mergeBufferGeometries(L.map(g=>g.index?g.toNonIndexed():g)); })(),
    basket:(()=>{ const g=new THREE.CylinderGeometry(.14,.11,.13,10); return g; })(),
    crewCap:(()=>{ const g=new THREE.BoxGeometry(.12,.08,.25); g.translate(0,.1,0); return g; })()
  };
  const pick=a=>a[(Math.random()*a.length)|0], rnd=Math.random;
  const dark=(h,k)=>new THREE.Color(h).multiplyScalar(k).getHex();
  function add(par,geo,col,x=0,y=0,z=0,rx=0,ry=0,rz=0,s){ const m=new THREE.Mesh(geo,pMat(col)); m.position.set(x,y,z); m.rotation.set(rx,ry,rz); if(s) m.scale.set(...s); par.add(m); return m; }
  // kit de cada nación (soldados de a pie); e = época
  const KIT={
    de:e=>({tunic:.2,pockets4:1,ystrap:1,pouch:'3',gas:1,bread:1,grenade:.5,pack:'none',boots:'jack'}),
    ru:e=>({tunic:.22,collar:'stand',pockets2:1,skatka:e>=2?.6:.3,pouch:'2',pack:'sack',boots:'jack',pilotka:e>=3?.3:0}),
    us:e=>e<=1?{tunic:.18,pockets4:1,pouch:'belt',pack:'haver',boots:'leg'}:{tunic:.17,slant:1,pouch:'belt',pack:'haver',boots:'leg',susp:1},
    uk:e=>e<=1?{tunic:.18,pockets4:1,pouch:'1908',pack:'small',boots:'putt'}:{tunic:0,pockets2:1,pouch:'37',pack:'small',boots:'anklet',braces:1},
    fr:e=>({coat:.55,pouch:'2',pack:e<=1?'sack':'small',boots:e<=1?'putt':'anklet'}),
    it:e=>({tunic:.2,lapels:1,pockets4:1,pouch:'2',boots:'putt',pack:'small'}),
    jp:e=>({tunic:.2,collar:'stand',pockets2:1,pouch:'2',boots:'putt',pack:'sack',neckFlap:.5}),
    cn:e=>({tunic:.22,collar:'stand',pouch:'sticks',boots:'putt',pack:'sack'}),
    ar:e=>({tunic:.2,pockets4:1,ystrap:1,pouch:'2',boots:'jack',pack:'small'})
  };
  const kitOf=(nat,e)=>{ if(e>=4) return {vest:1,boots:NATIONS[nat]&&NATIONS[nat].legs||'jack',pack:'mod'}; const f=KIT[nat]; return f?f(e):{tunic:.2,pockets4:1,pouch:'2',boots:'putt',pack:'small'}; };

  personMesh=function(o){
    const kind=o.kind, civ=kind==='civ', crew=kind==='crew', g=o.g||new THREE.Group(), era=(typeof W!=='undefined'&&W&&W.era)||5, old=era<=4;
    const child=civ&&(o.child||window._kidNext); window._kidNext=0;
    const female=civ?rnd()<.5:(!crew&&RULE().female!==0&&rnd()<.08);
    const skinC=pick(SKINS), hairH=rnd()<.12&&civ&&!child?0x8a8478:pick(HAIRS.slice(0,6)), skin=pMat(skinC), hairC=pMat(hairH);
    const nat=o.nat||(o.team===0?allyNation:foeNation), NN=NATIONS[nat]||{};
    const camo=NN.uni||NN.camo?new THREE.Color((NN.uni||NN.camo)[0]).multiplyScalar(NN.uni?1:.85).getHex():0x4a5236;
    const warm=typeof facadeStyle==='function'&&facadeStyle()===1, cold=(typeof WX!=='undefined'&&WX&&/nieve/.test(WX.key||''))||/ardenas|stalingrado|berlin/.test(typeof builtKey==='string'?builtKey:'');
    // ---- qué ropa lleva ----
    let top, bot, shirtC=null, sleeve='long', legLow=null, foot=bootMat.color.getHex(), footG=PG.boot, kit=null, style='';
    if(crew){ top=bot=nat==='de'&&era===3?0x1e1e22:nat==='uk'?0x5a5640:nat==='us'?0x57583f:nat==='ru'?0x3a3a2e:0x34382c; }
    else if(!civ){ top=bot=camo; kit=kitOf(nat,era); }
    else if(!old){ top=pick(SHIRTS); bot=female&&rnd()<.3?pick([0x1e1e22,0x7a2e3a,0xd8d0c0,0x3a4a6a]):pick(PANTS); sleeve=rnd()<.6?'short':'long'; foot=pick([0x2a2622,0x4a3626,0xeeeeee,0x1e1e22,0xd8d8d8]); footG=PG.shoe; style=female&&rnd()<.45?'dress':''; }
    else if(child){ footG=PG.shoe; foot=pick([0x2a2622,0x4a3626]); if(female){ style='girl'; top=pick([0x8a3a3a,0x3a4a6a,0xb8a888,0x6a7a5a,0xc8b0a0]); bot=top; legLow=pick([0xd8d0c0,0xb89a80]); }
      else { style='boy'; top=pick([0xe8e0d0,0xb8b0a0,0x8a9aaa,0x6a5a4a]); bot=pick([0x3a3a3a,0x4a4038,0x2e3442]); legLow=pick([0x5a5a5a,0x8a8070,0x3a3a3a]); } }
    else if(female){ style='woman'; top=pick([0xd8d0c0,0x8a3a3a,0x3a4a6a,0x6a5a7a,0xb8a888,0x5a6a5a,0xe8e0d0]); bot=pick([0x2a2a2e,0x3a3428,0x4a3a3a,0x2e3442,0x5a4a3a,0x6a6458]); legLow=pick([0xb89a80,0x9a8070,skinC]); footG=PG.shoe; foot=pick([0x2a2622,0x4a3626]); }
    else { const r=rnd(); style=r<.35?'suit':r<.7?'worker':'farmer'; footG=PG.shoe; foot=pick([0x2a2622,0x3a2a1e]);
      if(style==='suit'){ top=bot=pick([0x2e2e30,0x3a342c,0x2a3040,0x4a4238,0x55504a]); shirtC=0xe8e4d8; }
      else if(style==='worker'){ top=pick([0xe8e0d0,0xb8c4cc,0xc8b898,0x8a9aaa]); bot=pick([0x4a3b2a,0x3a3a3a,0x5a5040,0x2e3442]); sleeve=rnd()<.5?'rolled':'long'; }
      else { top=pick([0xd8ccb0,0x8a7a5a,0x6a7a8a]); bot=pick([0x3a4a6a,0x4a3b2a,0x5a5040]); } }
    // ---- oficios (médicos, enfermeras, policías, curas, monjas, bomberos, carteros, panaderos, granjeros, obreros, vendedoras) ----
    let job=null;
    if(civ&&!child&&(o.job||rnd()<(o.jobP??.35))){ job=o.job||pick(female?['enfermera','enfermera','monja','medico','vendedora','policia']:['policia','policia','medico','cura','bombero','cartero','panadero','granjero',...(old?['granjero']:['obrero','obrero'])]);
      if(female&&job==='policia'&&era<=3) job='vendedora';                       // en esa época casi no había mujeres policías de calle
      style='job'; sleeve='long'; footG=PG.shoe; foot=0x1e1c1a; legLow=null;
      const J={medico:[0xf2f2ee,0x3a3a40],enfermera:[0xf2f2ee,0xf2f2ee],monja:[0x1a1a1e,0x1a1a1e],policia:era<=3?[0x1e2638,0x1e2638]:[0x8aa8c8,0x1e2638],cura:[0x161618,0x161618],
        bombero:era<=3?[0x1e2638,0x1e2638]:[0x4a4230,0x4a4230],cartero:era<=3?[0x3a4250,0x3a4250]:[0x6a8aaa,0x2e3442],panadero:[0xf0ece2,0xd8d2c4],
        granjero:[pick([0xd8ccb0,0x8a7a5a,0xb8c4cc]),pick([0x3a4a6a,0x4a3b2a])],obrero:[pick([0x5a6a7a,0x8a9aaa]),0x2e3442],vendedora:[pick([0x8a3a3a,0x3a4a6a,0x6a5a3a]),pick([0x2a2a2e,0x3a3428])]}[job];
      top=J[0]; bot=J[1]; if(female&&['enfermera','monja','vendedora'].includes(job)) legLow=job==='monja'?0x1a1a1e:0xd8d0c0;
      if(['bombero','granjero','obrero'].includes(job)){ footG=PG.boot; foot=0x2a2622; } if(job==='granjero'||job==='panadero') sleeve='rolled'; }
    // ---- cuerpo ----
    const hip=new THREE.Group(); hip.position.y=female?.86:.88; g.add(hip);
    const torso=new THREE.Mesh(female?X.torsoF:X.torsoM,pMat(top)); torso.position.y=.3; hip.add(torso);
    const hp=new THREE.Mesh(PG.hips,pMat(style==='dress'||style==='girl'?top:bot)); hp.position.y=-.28; torso.add(hp);
    add(torso,PG.neck,skinC,0,.33,0);
    for(const sx of [-1,1]) add(torso,X.sh,top,sx*(female?.165:.19),.22,0,0,0,0,[1,1,.9]);
    if(female&&!child) for(const sx of [-1,1]) add(torso,PG.bust,top,sx*.06,.1,.07,0,0,0,[.85,.8,.55]);
    const head=new THREE.Mesh(PG.head,skin); head.position.y=.74; hip.add(head);
    { const eyeM=0x1a1612; for(const sx of [-1,1]){ add(head,PG.eye,eyeM,sx*.038,.018,.102); add(head,PG.brow,hairH,sx*.04,.045,.1); add(head,PG.ear,skinC,sx*.1,.005,0); }
      add(head,PG.nose,skinC,0,-.008,.112); add(head,PG.mouth,0x7a4a3c,0,-.05,.1);
      if(!female&&!child&&old&&rnd()<(civ?.35:.18)) add(head,X.mous,hairH,0,-.034,.106); }
    // piernas: muslo + pierna (dos tramos para pantalones cortos, medias, polleras y botas)
    const lx=female?.085:.1;
    const legMesh=x=>{ const L=new THREE.Mesh(female?X.thighF:X.thighM,pMat(style==='dress'||style==='girl'?(legLow||skinC):style==='boy'?skinC:bot)); L.position.x=x;
      add(L,female?X.shinF:X.shinM,legLow&&style!=='boy'?legLow:style==='dress'||style==='boy'?skinC:bot); return L; };
    const LL=legMesh(-lx), LR=legMesh(lx); hip.add(LL,LR);
    for(const L of [LL,LR]){ add(L,footG,foot,0,-.84,0); if(style==='boy') add(L,X.sock,legLow,0,-.7,0); if(style==='boy') add(L,X.shorts,bot,0,0,0); }
    // brazos
    const AU=female?X.uarmF:X.uarmM, AF=female?X.farmF:X.farmM, ax=female?.2:.235;
    const armMesh=x=>{ const A=new THREE.Mesh(AU,pMat(sleeve==='short'?skinC:top)); A.position.set(x,.56,0); add(A,AF,sleeve==='long'?top:skinC);
      if(sleeve==='rolled') add(A,X.sleeveCuff,top,0,-.29,0); const h=add(A,X.hand,skinC,0,-.58,0); add(A,X.thumb,skinC,x>0?-.03:.03,-.565,.02,0,0,x>0?.4:-.4); return A; };
    const armL=armMesh(-ax), armR=armMesh(ax); hip.add(armL,armR);
    // ---- cabeza: pelo y sombreros ----
    const hat=(geo,col,y=.03,z=0,rx=0)=>add(head,geo,col,0,y,z,rx);
    if(civ){
      if(job){ const J=job, bunH=()=>{ add(head,PG.hairS,hairH,0,.015,0); add(head,X.bun,hairH,0,.035,-.11); }, kepi=c=>{ add(head,PG.hairS,hairH,0,.012,0); hat(X.kepi,c,0); hat(X.kepiTop,c,0); hat(PG.visor,0x111111,.045,.1); add(head,X.badge,0xc8a040,0,.1,.112); };
        if(J==='medico'){ if(female) bunH(); else add(head,PG.hairS,hairH,0,.012,0); }
        else if(J==='enfermera'){ bunH(); hat(X.nurseCap,0xf4f4f0,.1,-.01); add(head,X.cross,0xc02020,0,.1,.06); add(head,X.crossH,0xc02020,0,.1,.06); }
        else if(J==='monja'){ add(head,PG.scarf,0xf0f0ec,0,.0,-.004,0,0,0,[1.02,1.02,1.02]); add(head,X.veil,0x1a1a1e,0,.02,-.03); add(head,X.veilBack,0x1a1a1e,0,-.12,-.12,.15); }
        else if(J==='policia'){ if(era<=3) kepi(0x1e2638); else { add(head,PG.hairS,hairH,0,.012,0); hat(PG.cap,0x1e2638,.03); hat(PG.visor,0x111111,.035,.1); add(head,X.badge,0xc8a040,0,.09,.11); } }
        else if(J==='cartero') kepi(era<=3?0x3a4250:0x2e3442);
        else if(J==='cura'){ add(head,PG.hairS,hairH,0,.012,0); if(old&&rnd()<.6){ hat(X.strawC,0x161618,.08,0,0); hat(X.straw,0x161618,.06); } }
        else if(J==='bombero'){ if(era<=3){ hat(X.hardHat,0xb08a3a,.04); hat(X.hardBrim,0xa07a2a,.03); hat(X.fireComb,0xc89a40,.14); } else { hat(X.hardHat,pick([0xc02020,0xe8c020]),.04); hat(X.hardBrim,0x2a2a2a,.03,-.02); } }
        else if(J==='panadero'){ add(head,PG.hairS,hairH,0,.012,0); hat(X.toque,0xf6f6f2,.17); hat(X.toqueB,0xf0f0ea,.08); }
        else if(J==='granjero'){ add(head,PG.hairS,hairH,0,.012,0); if(old&&!warm&&rnd()<.4) add(head,X.beret,0x1e1e22,0,.075,0,0,0,.2); else { hat(X.strawC,0xc8b070,.1); hat(X.straw,0xd0b878,.065); } }
        else if(J==='obrero'){ add(head,PG.hairS,hairH,0,.012,0); hat(X.hardHat,pick([0xe8c020,0xf0f0ea,0xe86a1a]),.04); hat(X.hardBrim,0xe8c020,.03); }
        else if(J==='vendedora') add(head,PG.scarf,pick([0x8a2a2a,0x3a4a6a,0xd8d0b8,0x5a6a3a]),0,.01,-.008); }
      else if(child&&female){ add(head,PG.hairL,hairH,0,.02,-.012); for(const sx of [-1,1]) add(head,X.braid,hairH,sx*.08,-.02,-.06,.25,0,sx*.15); if(rnd()<.5) add(head,X.bow,pick([0xb33a3a,0xeeeeee,0x3a4a8a]),0,.1,-.08); }
      else if(child){ add(head,PG.hairS,hairH,0,.012,0); if(rnd()<.5){ hat(X.flatCap,pick([0x4a4238,0x3a3a3a,0x5a5040]),.045); hat(X.capPeak,0x3a3a3a,.04,.1); } }
      else if(female&&old){ const r=rnd(); if(r<.4) add(head,PG.scarf,pick([0x8a2a2a,0x3a4a6a,0xd8d0b8,0x5a6a3a,0x6a4a6a,0xb8a070]),0,.01,-.008);
        else { add(head,PG.hairS,hairH,0,.015,0); add(head,X.bun,hairH,0,.035,-.11); if(r>.75&&era>=2){ hat(X.cloche,pick([0x3a2a2a,0x2a3040,0x5a4a3a,0x6a2a3a]),.03); hat(X.clocheB,0x2a2622,.02); } } }
      else if(female){ add(head,PG.hairL,hairH,0,.02,-.012); if(rnd()<.4) add(head,PG.pony,hairH,0,.02,-.12,.35); }
      else if(old){ add(head,PG.hairS,hairH,0,.012,0); const r=rnd(), straw=warm&&(style==='farmer'||style==='worker')&&rnd()<.6;
        if(straw){ hat(X.strawC,0xc8b070,.1); hat(X.straw,0xd0b878,.065); }
        else if(style==='suit'&&r<.75){ hat(PG.fedC,pick([0x2a2622,0x3a342c,0x4a4238,0x5a5040])); hat(PG.fedB,0x2a2622); }
        else if(r<.55){ hat(X.flatCap,pick([0x4a4238,0x3a3a3a,0x5a5040,0x2e3442,0x6a5e48]),.045); hat(X.capPeak,0x2a2622,.04,.1); }
        else if(r<.75) add(head,X.beret,pick([0x1e1e22,0x2a3040,0x3a2a2a]),0,.075,0,0,0,.2); }
      else if(rnd()<.22){ hat(PG.cap,pick([0x1e2a44,0xb33a3a,0xeeeeee,0x2a2a2a]),.025); hat(PG.visor,0x2a2a2a,.03,.1); }
      else if(rnd()>.08) add(head,PG.hairS,hairH,0,.012,0); }
    else if(crew){ if(nat==='uk') add(head,X.beret,0x1a1a1e,0,.075,0,0,0,-.25); else if(nat==='de'&&era===3) add(head,X.crewCap,0x1e1e22); else add(head,PG.crewH,0x2a2622,0,.02,0); }
    else if(kit&&kit.pilotka&&rnd()<kit.pilotka){ add(head,PG.hairS,hairH,0,.012,0); add(head,X.pilotka,dark(camo,.95),0,.0,0,0,0,.12); }
    else if(NN.helm){ eraHelmet(head,NN.helm,female,hairC); if(kit&&kit.neckFlap&&rnd()<kit.neckFlap) add(head,X.neckFlap,dark(camo,1.05),0,0,-.02); }
    else { hat(PG.helm,helmetMat.color.getHex(),.045); hat(PG.brim,helmetMat.color.getHex(),.035); if(female) add(head,PG.pony,hairH,0,-.02,-.12,.5); }
    // ---- ropa encima del torso ----
    const front=.122;
    if(crew){ add(torso,PG.belt,0x2a2622,0,-.27,0); add(torso,PG.collar,top,0,.29,0); if(nat==='de'&&era===3) add(torso,X.lapel,dark(top,1.3),.05,.18,front,0,0,.35); }
    else if(!civ){ const K=kit, tc=dark(camo,.92), web=K.pouch==='37'||K.pouch==='1908'?dark(camo,1.25):era>=3&&['us','uk'].includes(nat)?0x8a8058:0x2a2622;
      if(K.vest){ const vm=dark(camo,.7); add(torso,PG.vest,vm,0,.06,0); for(const sx of [-.1,0,.1]) add(torso,PG.pouch,vm,sx,-.08,.16); }
      if(K.tunic) add(torso,X.tunic(.16,K.tunic),tc,0,-.25,0);
      if(K.coat){ add(torso,X.tunic(.17,K.coat,1.55),tc,0,-.22,0); add(torso,PG.collar,tc,0,.28,0); for(let i=0;i<4;i++) for(const sx of [-1,1]) add(torso,X.button,0x8a7a4a,sx*.045,.15-i*.1,front+.008); }
      if(K.pockets4||K.pockets2) for(const sx of [-1,1]){ add(torso,X.pocket,tc,sx*.085,.12,front); add(torso,X.flap,dark(camo,.85),sx*.085,.175,front+.004);
        if(K.pockets4&&K.tunic) add(torso,X.pocket,tc,sx*.095,-.36,.125); }
      if(K.slant) for(const sx of [-1,1]) add(torso,X.pocket,tc,sx*.1,-.05,front,0,0,sx*.35);
      if(!K.coat&&!K.vest) for(let i=0;i<4;i++) add(torso,X.button,dark(camo,.6),0,.2-i*.11,front+.006);
      if(K.collar==='stand') add(torso,new THREE.CylinderGeometry(.065,.07,.06,10),tc,0,.32,0); else if(!K.coat) add(torso,PG.collar,top,0,.29,0);
      if(K.lapels) for(const sx of [-1,1]) add(torso,X.lapel,dark(camo,.85),sx*.045,.2,front,0,0,sx*.35);
      add(torso,PG.belt,web===0x2a2622?0x2a2622:web,0,-.27,0);
      if(K.ystrap||K.braces) for(const sx of [-1,1]){ add(torso,X.strap,web,sx*.075,0,front+.012,0,0,sx*-.12); add(torso,X.strap,web,sx*.06,.0,-front-.012,0,0,sx*.25); }
      if(K.susp) for(const sx of [-1,1]) add(torso,X.strap,0x8a8058,sx*.07,0,front+.012);
      if(K.pouch==='3') for(const sx of [-1,1]) add(torso,X.pouch3,0x2a2622,sx*.1,-.22,.13);
      else if(K.pouch==='2') for(const sx of [-1,1]) add(torso,X.pouchB,0x4a3a28,sx*.09,-.22,.13,0,0,0,[.8,.6,.8]);
      else if(K.pouch==='belt') for(let i=0;i<10;i++){ const a=-1.1+i*.245; if(Math.abs(a)<.18) continue; add(torso,X.pouchS,0x8a8058,Math.sin(a)*.17,-.27,Math.cos(a)*.115,0,a,0); }
      else if(K.pouch==='37') for(const sx of [-1,1]) add(torso,X.pouchB,web,sx*.1,.05,.15);
      else if(K.pouch==='1908') for(const sx of [-1,1]) for(let k=0;k<3;k++) add(torso,X.pouchS,web,sx*.1,.12-k*.08,.15);
      else if(K.pouch==='sticks') for(let i=0;i<5;i++){ add(torso,X.stickG,0x6a4e30,-.12+i*.06,-.2,.13,0,0,.15); add(torso,X.stickH,0x3a4030,-.11+i*.06,-.08,.13); }
      if(K.gas) add(torso,X.can,0x4a4d40,.1,-.36,-.13,.25,0,.2);
      if(K.bread) add(torso,X.bread,0x6a6248,-.15,-.33,-.05,0,1.4,0);
      if(K.grenade&&rnd()<K.grenade){ add(torso,X.stickG,0x6a4e30,.06,-.2,.15,0,0,.2); add(torso,X.stickH,0x3a4030,.08,-.08,.15); }
      if(K.skatka&&rnd()<K.skatka) add(torso,X.skatka,dark(camo,.8),0,.02,0,0,0,.65);
      if(!K.vest){ add(torso,PG.canteen,nat==='de'?0x3a3428:nat==='ru'?0x4a5236:0x5a5a40,.15,-.33,-.09); add(torso,PG.shovel,0x4a4a3a,-.13,-.38,-.13); add(torso,PG.handle,0x6a4e30,-.13,-.2,-.13); }
      // mochila según la nación (el ingeniero y el mortero siempre llevan)
      if(kind==='eng'||kind==='mortar'||(kind==='rifle'&&rnd()<.6)){ const pk=K.pack, pc=dark(camo,.8);
        if(pk==='haver') add(torso,X.haver,0x8a8058,0,-.02,-.17); else if(pk==='small') add(torso,X.smallPack,web,0,.1,-.17); else if(pk==='sack') add(torso,X.sack,pc,0,.0,-.17);
        else if(pk==='mod'){ add(torso,PG.pack,0x4a4a36,0,.02,-.2); if(rnd()<.6) add(torso,PG.roll,pick([0x5a5040,0x6a6050,0x4a4a3a]),0,.26,-.2); } }
      // calzado
      const bk=K.boots;
      for(const L of [LL,LR]){ if(bk==='jack') add(L,PG.jboot,bootMat.color.getHex()); else if(bk==='leg') add(L,PG.gaiter,0xb8a87a); else if(bk==='anklet') add(L,new THREE.CylinderGeometry(.06,.058,.12,8),dark(camo,1.1),0,-.76,0); else add(L,PG.gaiter,dark(camo,.9)); } }
    else { // civiles
      if(job){ const J=job, brass=0xc8a040;
        if(J==='medico'){ add(torso,X.tunic(.17,.52,1.38),0xf2f2ee,0,-.22,0); for(const sx of [-1,1]) add(torso,X.lapel,0xe0e0dc,sx*.05,.17,front+.003,0,0,sx*.4);
          add(torso,X.collarW,0xd8e0e8,0,.29,.06); if(!female) add(torso,X.tie,pick([0x2a3a5a,0x5a2a2a]),0,.17,front+.004); add(torso,X.steth,0x2a2a2e,0,.2,front+.012,0,0,0,[1,1.5,1]);
          add(torso,X.pocket,0xe8e8e4,-.085,.1,front); add(torso,X.button,0x2a4a8a,-.085,.15,front+.012); add(torso,X.docBag,0x1a1614,.22,-.38,0,0,Math.PI/2,0); }
        else if(J==='enfermera'){ add(torso,old?X.skirtL:X.skirtS,0xf2f2ee,0,-.27,0); add(torso,X.cross,0xc02020,-.07,.12,front+.004); add(torso,X.crossH,0xc02020,-.07,.12,front+.004); add(torso,PG.belt,0xe8e8e4,0,-.27,0); }
        else if(J==='monja'){ add(torso,X.tunic(.165,.8,1.5),0x1a1a1e,0,-.22,0); add(torso,X.collarW,0xf0f0ec,0,.29,.04,0,0,0,[1.6,1,1.4]); add(torso,X.cross,0xb8b8b8,0,.08,front+.006); add(torso,X.crossH,0xb8b8b8,0,.1,front+.006); add(torso,PG.belt,0x111111,0,-.27,0); }
        else if(J==='cura'){ add(torso,X.tunic(.165,.8,1.45),0x161618,0,-.22,0); add(torso,X.collarW,0x161618,0,.29,.04); add(torso,X.badge,0xf4f4f0,0,.3,.075,0,0,0,[.8,.6,1]); for(let i=0;i<9;i++) add(torso,X.button,0x0e0e10,0,.24-i*.06,front+.005); }
        else if(J==='policia'){ if(era<=3){ add(torso,X.tunic(.16,.22),top,0,-.25,0); for(let i=0;i<4;i++) for(const sx of [-1,1]) add(torso,X.button,brass,sx*.045,.2-i*.1,front+.006);
            add(torso,new THREE.CylinderGeometry(.065,.07,.06,10),top,0,.32,0); add(torso,PG.belt,era<=2?0xe8e4d8:0x111111,0,-.27,0); add(torso,X.baton,0x111111,.17,-.42,.02); }
          else { for(const sx of [-1,1]){ add(torso,X.pocket,dark(top,.92),sx*.085,.12,front); add(torso,X.flap,dark(top,.85),sx*.085,.175,front+.004); } add(torso,X.tie,0x1e2638,0,.17,front+.004);
            add(torso,X.badge,brass,-.085,.21,front+.01); add(torso,PG.belt,0x111111,0,-.27,0); add(torso,X.holster,0x111111,.17,-.34,.02); add(torso,X.baton,0x111111,-.17,-.42,.02); add(torso,PG.collar,top,0,.29,0); } }
        else if(J==='bombero'){ add(torso,X.tunic(.17,.42,1.3),top,0,-.24,0); add(torso,X.vestShell,top,0,.01,0,0,0,0,[1.05,1,1.08]);
          if(era<=3){ for(let i=0;i<5;i++) add(torso,X.button,brass,0,.2-i*.09,front+.012); add(torso,PG.belt,0x111111,0,-.27,0,0,0,0,[1.08,1.6,1.08]); }
          else for(const y of [-.12,-.5]) add(torso,X.band(.215+(y<-.3?.05:0)),0xe8d040,0,y,0); }
        else if(J==='cartero'){ add(torso,X.tunic(.16,.2),top,0,-.25,0); for(let i=0;i<4;i++) add(torso,X.button,brass,0,.2-i*.1,front+.006); add(torso,PG.belt,0x2a2622,0,-.27,0);
          add(torso,X.strap,0x4a3220,0,.0,front+.014,0,0,.75); add(torso,X.strap,0x4a3220,0,.0,-front-.014,0,0,-.75); add(torso,X.mailBag,0x5a3a22,-.2,-.33,.02,0,Math.PI/2,0); }
        else if(J==='panadero'){ add(torso,X.apron,0xf8f8f4,0,-.05,front+.01,0,0,0,[1.1,1.4,1]); add(torso,PG.collar,top,0,.29,0); }
        else if(J==='granjero'){ add(torso,X.bib,bot,0,-.12,front+.006); for(const sx of [-1,1]) add(torso,X.strap,bot,sx*.075,.05,front+.01); add(torso,PG.collar,top,0,.29,0); add(armR,X.fork,0x6a4e30,0,-.5,.03); }
        else if(J==='obrero'){ add(torso,X.vestShell,0xe86a1a,0,0,0,0,0,0,[1.03,1,1.05]); for(const y of [-.05,.12]) add(torso,X.band(.205),0xd8d8c8,0,y,0); add(torso,PG.belt,0x3a2a1e,0,-.27,0); add(torso,X.holster,0x5a3a22,.17,-.34,.02); }
        else if(J==='vendedora'){ add(torso,X.skirtL,bot,0,-.27,0); add(torso,X.apron,0xe8e0d0,0,-.27,.17,-.08,0,0,[1,.85,1]); add(armL,X.basket,0x8a6a3a,0,-.6,.1); } }
      else if(style==='suit'){ add(torso,X.tunic(.16,.18,1.12),top,0,-.25,0); add(torso,X.collarW,shirtC,0,.29,.06); add(torso,X.tie,pick([0x6a1a1a,0x1a1a2a,0x3a2a1a,0x2a4a3a]),0,.17,front+.004);
        for(const sx of [-1,1]) add(torso,X.lapel,dark(top,.85),sx*.05,.17,front+.002,0,0,sx*.4); }
      else if(style==='worker'){ if(rnd()<.5) add(torso,X.vestShell,pick([0x2a2622,0x3a342c,0x4a4238]),0,0,0); else for(const sx of [-1,1]) add(torso,X.strap,0x3a2a1e,sx*.075,0,front+.01); add(torso,PG.collar,top,0,.29,0); }
      else if(style==='farmer'){ add(torso,X.bib,bot,0,-.12,front+.006); for(const sx of [-1,1]) add(torso,X.strap,bot,sx*.075,.05,front+.01); add(torso,PG.collar,top,0,.29,0); }
      else if(style==='woman'){ add(torso,X.skirtL,bot,0,-.27,0); if(rnd()<.3) add(torso,X.apron,pick([0xe8e0d0,0xd8ccb0,0xb8b0a0]),0,-.27,.2,-.12,0,0,[1,.85,1]); if(rnd()<.3) add(torso,X.vestShell,pick([0x5a4a3a,0x3a3a4a,0x6a5a4a]),0,0,0); }
      else if(style==='girl'){ add(torso,X.skirtS,top,0,-.27,0); add(torso,PG.collar,0xeeeeee,0,.29,0); }
      else if(style==='boy'){ for(const sx of [-1,1]) add(torso,X.strap,0x3a2a1e,sx*.075,0,front+.01); }
      else if(style==='dress') add(torso,PG.skirt,top,0,-.21,0);
      if(!job&&old&&!child&&(cold?rnd()<.6:rnd()<.25)&&style!=='farmer'){ const cc=pick([0x3a3a3a,0x4a4038,0x5a4a38,0x2a2e3a,0x6a5e4a]); add(torso,X.tunic(.18,female?.6:.55,1.4),cc,0,-.2,0); add(torso,X.vestShell,cc,0,.01,0,0,0,0,[1.06,1,1.08]); }
      if(!job&&!child&&rnd()<.3) add(torso,PG.bag,pick([0x5a3a22,0x2a2a2a,0x8a2a2a,0xc8b090]),female?-.2:-.24,-.22,0); }
    // ---- arma ----
    let wep=null;
    if(kind==='rifle'||kind==='eng'){ wep=rifleMesh(1); wep.position.set(.1,.36,.3); }
    else if(kind==='sniper'){ wep=rifleMesh(1.4); wep.position.set(.1,.38,.34); const sc=new THREE.Mesh(PG.hand,darkMat); sc.scale.set(.6,.6,2.2); sc.position.set(0,.08,.05); wep.add(sc); }
    else if(kind==='at'&&RULE().at&&!RULE().at.tube){ wep=rifleMesh(1.7); wep.position.set(.1,.36,.36); }
    else if(kind==='at'){ wep=new THREE.Mesh(PG.tube,pMat(0x4a5a3a)); wep.rotation.x=Math.PI/2; wep.position.set(.22,.62,.1); }
    else if(kind==='hmg'){ wep=new THREE.Mesh(PG.hmg,darkMat); wep.position.set(0,.3,.5); }
    else if(kind==='mortar'){ wep=new THREE.Mesh(PG.mort,darkMat); wep.rotation.x=.4; wep.position.set(0,.45,-.22); }
    if(wep) hip.add(wep);
    if(female) g.scale.setScalar(.95);
    for(const pt of [torso,head,LL,LR,armL,armR]) bakePart(pt);
    g.traverse(m=>{ if(m.isMesh) m.castShadow=true; });
    return {g,female,child,job,parts:{hip,torso,head,legL:LL,legR:LR,armL,armR,wep}};
  };
})();
