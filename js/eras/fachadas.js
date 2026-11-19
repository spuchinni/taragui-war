/* ---------- Fachadas por estilo (pedido de Sebastián, mirando casas y edificios de Sketchfab) ----------
   Reemplaza facadeMat (04-mundo.js). Un atlas hecho por código con 4 estilos × 2 variantes, en dos filas (planta baja y pisos):
     0 europea: revoque con zócalo de piedra, ventanas altas con postigos y alféizar, balconcitos de hierro; planta baja con portón en arco
     1 colonial blanca: muros encalados, ventanas hondas con rejas, puertas de madera, zócalo gris (España, norte de África, Corrientes vieja)
     2 ladrillo: ladrillo a la vista, ventanas con arco de ladrillo o dintel de piedra, vidriera de negocio abajo (Berlín, Stalingrado)
     3 moderna: revoque liso, ventanas anchas de aluminio, balcones con baranda, cortina metálica abajo (mapas de la Guerra Fría)
     4 barrio (Sor Asunta): casa baja revocada o de ladrillo a la vista, ventana con persiana y reja, puerta de madera (barrio.js)
   El estilo sale del mapa (facadeStyle); dentro de cada edificio las ventanas se mezclan con balcones según un sorteo por edificio y por
   columna, y la puerta va en la columna del medio de la planta baja. Cada piso mide 3 m y cada columna ~3,5 m. Las texturas son claras: el
   color de cada edificio (instanceColor) las tiñe, así que se respetan los colores de pared de cada mapa. */
const FAC_T=128;
const FAC_N=12;   // casillas del atlas (6 estilos × 2)
const facadeAtlas=(()=>{ const T=FAC_T, c=document.createElement('canvas'); c.width=T*FAC_N; c.height=T*2; const x=c.getContext('2d');
  const R=(cx,cy,w,h,col)=>{ x.fillStyle=col; x.fillRect(cx,cy,w,h); };
  const glass=(gx,gy,w,h,dark='#26333d')=>{ R(gx,gy,w,h,dark); const g=x.createLinearGradient(gx,gy,gx+w,gy+h); g.addColorStop(0,'rgba(170,200,220,.42)'); g.addColorStop(.5,'rgba(60,80,95,.05)'); g.addColorStop(1,'rgba(150,180,200,.28)'); x.fillStyle=g; x.fillRect(gx,gy,w,h); };
  const bars=(gx,gy,w,h,n,col='#2a2622')=>{ for(let i=1;i<n;i++) R(gx+i*w/n-1,gy,2,h,col); R(gx,gy+h*.33,w,2,col); R(gx,gy+h*.66,w,2,col); };
  const plaster=(ox,oy,base,spk)=>{ R(ox,oy,T,T,base); x.save(); x.beginPath(); x.rect(ox,oy,T,T); x.clip(); speckle(x,T,T,0,[],1,1); for(let i=0;i<260;i++){ x.fillStyle=spk[i%spk.length]; x.globalAlpha=rand(.08,.35); const r=rand(1,3); x.fillRect(ox+Math.random()*T,oy+Math.random()*T,r,r); } x.globalAlpha=1; x.restore(); };
  const brick=(ox,oy)=>{ R(ox,oy,T,T,'#e6dcd4'); for(let r=0;r<T/8;r++) for(let k=-1;k<T/16+1;k++){ const bx=ox+k*16+(r%2)*8, by=oy+r*8; x.fillStyle=['#efe6de','#e2d6cc','#d8ccc2','#f2eae2'][(r*7+k*3)&3]; x.fillRect(Math.max(ox,bx+1),by+1,Math.min(14,ox+T-bx-1),6); } };
  // ---- tiles: (columna, fila) con fila 0 = pisos (arriba en el canvas) y 1 = planta baja ----
  const tile=(i,row,f)=>{ x.save(); x.translate(i*T,row*T); f(); x.restore(); };
  const P=['#dcdad4','#ecebe6','#cfccc4'];
  // estilo 0: europea
  const euroBase=()=>{ plaster(0,0,'#f2efe8',P); R(0,T-6,T,6,'rgba(0,0,0,.08)'); };
  tile(0,0,()=>{ euroBase(); R(40,22,48,74,'#b9b3a8'); glass(45,27,38,64); R(63,27,2,64,'#e8e4dc'); R(45,56,38,2,'#e8e4dc');
    for(const s of [-1,1]){ const sx=s<0?22:88; R(sx,24,18,70,'#5e6b4e'); for(let k=0;k<9;k++) R(sx+2,28+k*7,14,2,'#4a5640'); }   // postigos abiertos
    R(36,96,56,7,'#c9c3b6'); R(36,103,56,3,'rgba(0,0,0,.2)'); R(38,16,52,6,'#cfc9bc'); });
  tile(1,0,()=>{ euroBase(); R(40,12,48,92,'#b9b3a8'); glass(45,17,38,87); R(63,17,2,87,'#e8e4dc'); R(38,6,52,6,'#cfc9bc');
    R(30,82,68,4,'#2a2622'); for(let k=0;k<9;k++) R(31+k*8,86,2,18,'#2a2622'); R(30,102,68,4,'#2a2622'); R(28,106,72,5,'#c9c3b6'); });   // balconcito de hierro
  tile(0,1,()=>{ plaster(0,0,'#f2efe8',P); R(0,T-30,T,30,'#c8c2b6'); for(let k=0;k<4;k++) R(k*32,T-30,1,30,'rgba(0,0,0,.15)'); R(0,T-31,T,2,'rgba(0,0,0,.2)');   // zócalo de piedra
    R(38,30,52,60,'#b9b3a8'); glass(44,36,40,48); bars(44,36,40,48,4); });
  tile(1,1,()=>{ plaster(0,0,'#f2efe8',P); R(0,T-30,T,30,'#c8c2b6'); x.fillStyle='#bdb6a8'; x.beginPath(); x.moveTo(30,T); x.lineTo(30,48); x.arc(64,48,34,Math.PI,0); x.lineTo(98,T); x.fill();
    x.fillStyle='#5a3e28'; x.beginPath(); x.moveTo(36,T); x.lineTo(36,50); x.arc(64,50,28,Math.PI,0); x.lineTo(92,T); x.fill(); R(63,26,2,T-26,'#3e2a1a'); for(let k=0;k<4;k++){ R(40,60+k*16,20,2,'#4a3220'); R(68,60+k*16,20,2,'#4a3220'); } });
  // estilo 1: colonial blanca
  const P1=['#e6e4dc','#f4f3ee','#dedbd2'];
  tile(2,0,()=>{ plaster(0,0,'#f7f6f1',P1); R(42,26,44,58,'#a8a296'); R(46,30,36,50,'#6b4a30'); glass(50,34,28,42,'#2a2a2a'); R(40,84,48,6,'#d8d4c8'); });
  tile(3,0,()=>{ plaster(0,0,'#f7f6f1',P1); R(40,22,48,66,'#a8a296'); glass(45,27,38,56); bars(45,27,38,56,5); R(38,88,52,7,'#d8d4c8'); R(36,20,56,4,'#2a2622'); });
  tile(2,1,()=>{ plaster(0,0,'#f7f6f1',P1); R(0,T-18,T,18,'#a9a7a0'); R(40,34,48,56,'#a8a296'); glass(45,39,38,46); bars(45,39,38,46,5); });
  tile(3,1,()=>{ plaster(0,0,'#f7f6f1',P1); R(0,T-18,T,18,'#a9a7a0'); R(38,26,52,T-26,'#a8a296'); R(42,30,44,T-30,'#6a4428'); R(63,30,2,T-30,'#3e2a1a'); for(let k=0;k<5;k++){ R(46,40+k*16,14,10,'#5a3820'); R(68,40+k*16,14,10,'#5a3820'); } R(78,74,4,6,'#c8b070'); });
  // estilo 2: ladrillo
  tile(4,0,()=>{ brick(0,0); x.fillStyle='#d0c2b6'; x.beginPath(); x.arc(64,34,28,Math.PI,0); x.fill(); R(36,34,56,62,'#d8d2c8'); glass(42,34,44,58); x.fillStyle='#26333d'; x.beginPath(); x.arc(64,34,22,Math.PI,0); x.fill(); R(63,16,2,76,'#e8e4dc'); R(34,92,60,7,'#cfc6ba'); });
  tile(5,0,()=>{ brick(0,0); R(34,18,60,8,'#d6cec2'); R(38,26,52,66,'#d8d2c8'); glass(43,30,42,58); R(63,30,2,58,'#e8e4dc'); R(43,56,42,2,'#e8e4dc'); R(34,92,60,7,'#cfc6ba'); });
  tile(4,1,()=>{ brick(0,0); R(0,T-14,T,14,'#bcb4aa'); R(14,24,100,80,'#d8d2c8'); glass(20,30,88,68); R(63,30,2,68,'#d8d2c8'); R(10,16,108,8,'#4a4e52'); });   // vidriera de negocio
  tile(5,1,()=>{ brick(0,0); R(0,T-14,T,14,'#bcb4aa'); R(38,22,52,T-22,'#cfc6ba'); R(43,28,42,T-28,'#5a4636'); glass(48,34,32,30); R(63,28,2,T-28,'#3e2e22'); });
  // estilo 3: moderna
  const P3=['#e2e2e0','#f0f0ee','#d6d6d2'];
  tile(6,0,()=>{ plaster(0,0,'#f3f3f1',P3); R(10,30,108,52,'#9a9c9e'); glass(14,34,100,44,'#2c3640'); for(let k=1;k<4;k++) R(14+k*25,34,2,44,'#b8bcc0'); R(8,82,112,5,'#d0d0cc'); });
  tile(7,0,()=>{ plaster(0,0,'#f3f3f1',P3); R(30,14,68,74,'#9a9c9e'); glass(34,18,60,70,'#2c3640'); R(63,18,2,70,'#b8bcc0'); R(18,84,92,8,'#cfcfca');
    for(let k=0;k<12;k++) R(20+k*8,96,2,18,'#5a5e62'); R(18,94,92,3,'#5a5e62'); R(18,112,92,3,'#5a5e62'); });   // balcón con baranda
  tile(6,1,()=>{ plaster(0,0,'#f3f3f1',P3); R(10,26,108,92,'#7a7e82'); for(let k=0;k<22;k++) R(12,28+k*4,104,2,'#9a9ea2'); R(8,20,112,6,'#5a5e62'); });   // cortina metálica
  tile(7,1,()=>{ plaster(0,0,'#f3f3f1',P3); R(36,20,56,T-20,'#8a8e92'); glass(40,24,48,T-24,'#2c3640'); R(63,24,2,T-24,'#b8bcc0'); R(30,14,68,6,'#5a5e62'); });
  // estilo 4: casa de barrio de Corrientes (Sor Asunta). La planta baja se dibuja de 0 a 3 m sobre el suelo (el shader corre 1 m la fila):
  // zócalo, ventana de aluminio con persiana de enrollar a medio bajar y reja de planchuela, puerta de madera con tablero y aplique.
  // Casillas 8–9 revocadas y 10–11 de ladrillo a la vista con viga de encadenado y dintel de hormigón (las casas sin revocar del barrio).
  const M=128/3, Y=m=>128-m*M;   // metros sobre el suelo → píxel en la casilla
  const P4=['#dedbd3','#ecebe5','#d2cec5'];
  const zocalo=()=>{ R(0,Y(.45),T,T-Y(.45),'#b9b3a7'); R(0,Y(.45)-2,T,2,'rgba(0,0,0,.12)'); for(let i=0;i<70;i++){ x.fillStyle='rgba(60,50,40,.18)'; x.fillRect(Math.random()*T,Y(.45)+Math.random()*18,rand(1,3),rand(1,2)); } };
  const reja=(gx,gy,w,h)=>{ const c='#2b2724'; R(gx-2,gy-2,w+4,3,c); R(gx-2,gy+h-1,w+4,3,c); R(gx-2,gy,3,h,c); R(gx+w-1,gy,3,h,c);
    for(let i=1;i<6;i++) R(gx+i*w/6-1,gy,2,h,c); x.strokeStyle=c; x.lineWidth=1.6; for(let i=0;i<3;i++){ x.beginPath(); x.arc(gx+w/6*(1+i*2),gy+h*.18,w/12,0,Math.PI*2); x.stroke(); } R(gx,gy+h*.36,w,2,c); };
  const ventana=(brick)=>{ const x0=40,x1=88,y0=Y(2.2),y1=Y(1.0);
    if(brick) R(x0-6,y0-9,x1-x0+12,9,'#9d9a93'); else R(x0-4,y0-5,x1-x0+8,5,'#cfcac0');         // dintel
    R(x0,y0,x1-x0,y1-y0,'#8f9396'); glass(x0+3,y0+3,x1-x0-6,y1-y0-6,'#2a3640'); R(63,y0+3,2,y1-y0-6,'#a9adb0');
    const pb=(y1-y0)*.42; R(x0+3,y0+3,x1-x0-6,pb,'#c9c4b6'); for(let k=0;k<pb/3;k++) R(x0+3,y0+4+k*3,x1-x0-6,1,'rgba(0,0,0,.18)');   // persiana a medio bajar
    R(x0-5,y1,x1-x0+10,5,brick?'#a7a49d':'#d8d3c8'); R(x0-5,y1+5,x1-x0+10,2,'rgba(0,0,0,.25)');                                 // alféizar
    reja(x0-1,y0-1,x1-x0+2,y1-y0+2); };
  const puerta=(brick)=>{ const x0=46,x1=82,y0=Y(2.08);
    if(brick) R(x0-6,y0-9,x1-x0+12,9,'#9d9a93'); else R(x0-4,y0-5,x1-x0+8,5,'#cfcac0');
    R(x0,y0,x1-x0,T-y0,'#7a6a58'); const wood=brick?'#5d6a72':'#7a4e2e', wd=brick?'#4b575e':'#5f3a20'; R(x0+3,y0+3,x1-x0-6,T-y0-3,wood);
    for(const [a,b] of [[.08,.42],[.5,.92]]){ R(x0+7,y0+3+(T-y0)*a,x1-x0-14,(T-y0)*(b-a)-4,wd); R(x0+9,y0+5+(T-y0)*a,x1-x0-18,(T-y0)*(b-a)-8,wood); }
    glass(x0+9,y0+8,x1-x0-18,12,'#26323a'); R(x1-9,Y(1.0),3,6,'#c9b27a');                                                         // mirilla y picaporte
    R(x0-12,T-6,x1-x0+24,6,'#a8a398'); R(x1+5,Y(2.2)-6,6,9,'#3a3a36'); R(x1+6,Y(2.2)+2,4,4,'#f2ecd0'); };                          // umbral y aplique
  const ladrillo=()=>{ R(0,0,T,T,'#e9ddd2'); for(let r=0;r<T/6;r++) for(let k=-1;k<T/14+1;k++){ const bx=k*14+(r%2)*7, by=r*6; x.fillStyle=['#efe1d4','#e3d2c4','#d9c6b8','#f2e6da'][(r*5+k*3)&3]; x.fillRect(Math.max(0,bx+1),by+1,Math.min(12,T-bx-1),4); } };
  tile(8,0,()=>{ plaster(0,0,'#f4f2ec',P4); R(0,Y(.2),T,6,'#d6d1c6'); R(0,Y(.2)+6,T,2,'rgba(0,0,0,.14)'); R(40,Y(2.0),48,Y(.9)-Y(2.0),'#8f9396'); glass(43,Y(2.0)+3,42,Y(.9)-Y(2.0)-6,'#2a3640'); });
  tile(9,0,()=>{ plaster(0,0,'#f4f2ec',P4); R(0,Y(.2),T,6,'#d6d1c6'); R(0,Y(.2)+6,T,2,'rgba(0,0,0,.14)'); });
  tile(10,0,()=>{ ladrillo(); R(0,Y(.3),T,T-Y(.3),'#a9a59e'); R(0,Y(.3),T,2,'rgba(0,0,0,.2)'); });                                   // viga de encadenado
  tile(11,0,()=>{ ladrillo(); R(0,Y(.3),T,T-Y(.3),'#a9a59e'); R(0,Y(.3),T,2,'rgba(0,0,0,.2)'); for(let i=0;i<3;i++) R(20+i*40,Y(.3)+4,3,8,'rgba(90,60,40,.35)'); });
  tile(8,1,()=>{ plaster(0,0,'#f4f2ec',P4); zocalo(); ventana(false); });
  tile(9,1,()=>{ plaster(0,0,'#f4f2ec',P4); zocalo(); puerta(false); });
  tile(10,1,()=>{ ladrillo(); R(0,Y(.35),T,T-Y(.35),'#a3a099'); ventana(true); });
  tile(11,1,()=>{ ladrillo(); R(0,Y(.35),T,T-Y(.35),'#a3a099'); puerta(true); });
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping; t.anisotropy=ANISO; return t; })();
// estilo según el mapa: Guerra Fría y Corrientes = moderna; ciudades en ruinas de ladrillo; España, norte de África, Pacífico y Chaco = colonial
function facadeStyle(){ const k=typeof builtKey==='string'?builtKey:'', w=WORLDS[k]||{}, era=w.era||5;
  if(k==='sor') return 4;   // barrio de casas bajas (barrio.js)
  if(era>=4) return 3;
  if(['stalingrado','berlin','shanghai'].includes(k)) return 2;
  if(['alamein','kasserine','okinawa','saipan','chaco','jarama','sesena','ebro'].includes(k)||/chaco|nanawa|jarama|sese|ebro/.test(k)) return 1;
  return 0; }
facadeMat=function(){ const m=new THREE.MeshLambertMaterial({map:facadeAtlas}), st=facadeStyle();
  m.onBeforeCompile=sh=>{ sh.uniforms.uStyle={value:st}; sh.uniforms.uBal={value:st===2?.0:.3};
    const V='varying float vFw; varying float vVar; varying float vTop;\n';
    sh.vertexShader=V+sh.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
    vTop=0.; vFw=1.; vVar=0.;
    #ifdef USE_INSTANCING
      vec3 sc=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));
      vVar=fract(instanceMatrix[3].x*.1371+instanceMatrix[3].z*.3113);
      if(abs(normal.y)>.5){ vTop=1.; vUv=vec2(.5,.5); }
      else { float w=abs(normal.x)>.5?sc.z:sc.x; vFw=max(1.,floor(w/3.5+.5)); vUv=vec2(uv.x*vFw,uv.y*sc.y/3.); }
    #endif`);
    sh.fragmentShader='uniform float uStyle; uniform float uBal;\n#define FAC_W '+(FAC_T*FAC_N)+'.\n#define FAC_H '+(FAC_T*2)+'.\n'+V+sh.fragmentShader.replace('#include <map_fragment>',`
    #ifdef USE_MAP
      // una sola lectura de la textura, fuera de los "if" y con las derivadas de la coordenada continua: si se lee dentro de una rama,
      // la placa no sabe qué detalle (mip) usar y en algunas (y en swiftshader) la pared salía llena de puntitos
      vec2 q=vUv; if(uStyle>3.5) q.y-=1./3.;                      // barrio: la planta baja arranca en el suelo (el muro empieza 1 m abajo)
      float fw=floor(vFw+.5), col=floor(q.x), fl=floor(q.y); vec2 f=fract(q); if(fl<0.){ fl=0.; f.y=.02; }   // fw redondeado: el varying llega como 2,9999 en algunos píxeles
      float h=fract(sin(vVar*91.7+col*12.9898+fl*78.233)*43758.5453);
      float tx=uStyle*2.+((uStyle>3.5&&vVar<.28)?2.:0.); float base;
      if(fl<.5){ tx+=(abs(col-floor(fw*.5))<.5?1.:0.); base=0.; }
      else { tx+=(uStyle>3.5)?(abs(col-floor(fw*.5))<.5?1.:0.):(h<uBal+vVar*.25?1.:0.); base=.5; }
      vec2 uvT=vec2((tx+.02+f.x*.96)/${FAC_N}., base+(.01+f.y*.98)*.5);
      if(vTop>.5) uvT=vec2(.003,.003);
      #if __VERSION__ >= 300
        vec2 gx=dFdx(vUv)*vec2(.96*FAC_W/${FAC_N}.,.49*FAC_H), gy=dFdy(vUv)*vec2(.96*FAC_W/${FAC_N}.,.49*FAC_H);   // en texeles
        float lod=clamp(.5*log2(max(dot(gx,gx),dot(gy,gy))),0.,8.);
        vec4 texelColor=textureLod(map,uvT,lod);
      #else
        vec4 texelColor=texture2D(map,uvT);
      #endif
      texelColor=mapTexelToLinear(texelColor); diffuseColor*=texelColor;
    #endif`); };
  m.customProgramCacheKey=()=>'fachada'+st; return m; };
