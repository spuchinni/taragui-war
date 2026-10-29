/* ---------- Cielo (pedido de Sebastián: "el cielo me gustaría mejorarlo") ----------
   Un domo con un solo shader: degradé del horizonte (el color de la niebla del mapa y el clima, scene.background) al cenit,
   resplandor del sol (o de la luna), nubes que se mueven (ruido fbm) con su cobertura según el clima, y estrellas de noche.
   Abajo del horizonte usa el color de la niebla, así el terreno lejano se funde igual que antes. Barato: una malla y nada más. */
const SKY_P={dia:{z:0x4a7cc4,c:.44,cc:0xf6f6f2},tarde:{z:0x45568c,c:.4,cc:0xffcfa8},noche:{z:0x03060e,c:.22,cc:0x2a3244,st:1},
  niebla:{z:null,c:0,cc:0xd0d4d2},lluvia:{z:0x596168,c:.92,cc:0x6c7278},nieve:{z:0x9ca6ae,c:.88,cc:0xc8ccd0},tormenta:{z:0x05080b,c:.95,cc:0x181c20}};
const skyMat=new THREE.ShaderMaterial({depthWrite:false,depthTest:false,side:THREE.BackSide,fog:false,
  uniforms:{hor:{value:new THREE.Color()},zen:{value:new THREE.Color()},cc:{value:new THREE.Color()},sunDir:{value:new THREE.Vector3(0,1,0)},sunCol:{value:new THREE.Color()},
    cov:{value:.3},t:{value:0},stars:{value:0}},
  vertexShader:`varying vec3 vDir; void main(){ vDir=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader:`precision highp float;
    uniform vec3 hor,zen,cc,sunDir,sunCol; uniform float cov,t,stars; varying vec3 vDir;
    float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y); }
    float h3(vec3 p){ p=fract(p*.1031); p+=dot(p,p.yzx+33.33); return fract((p.x+p.y)*p.z); }
    float fbm(vec2 p){ float s=0.,a=.5; for(int i=0;i<4;i++){ s+=a*n(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return s; }
    void main(){ vec3 d=normalize(vDir); float y=d.y;
      vec3 col=mix(hor,zen,pow(clamp(y,0.,1.),.5));
      float sd=max(dot(d,sunDir),0.);
      if(y>0.&&cov>0.){ vec2 uv=d.xz/(y+.1)*1.3+vec2(t*.006,t*.0025); float c=fbm(uv), m=smoothstep(1.-cov,1.-cov+.3,c)*smoothstep(0.,.2,y);
        vec3 cl=cc*(.78+.32*n(uv*3.1+5.))+sunCol*pow(sd,6.)*.35; col=mix(col,cl,m*.92); sd*=1.-m*.85; }
      col+=sunCol*(pow(sd,10.)*.22+pow(sd,600.)*2.);
      if(stars>0.&&y>0.){ vec3 q=floor(d*420.); float r=h3(q), s=step(.996,r); col+=vec3(s)*stars*smoothstep(0.,.25,y)*(.35+.65*h3(q+7.)); }
      col=mix(hor,col,smoothstep(-.02,.09,y));
      gl_FragColor=vec4(col,1.); }`});
const skyDome=new THREE.Mesh(new THREE.SphereGeometry(800,32,16),skyMat); skyDome.frustumCulled=false; skyDome.renderOrder=-1e9; scene.add(skyDome);
function skyUpdate(){ const th=document.body.classList.contains('thermal'), menu=state==='menu'||state==='lobby';
  skyDome.visible=!th&&!(typeof hangarOn==='function'&&hangarOn()); if(!skyDome.visible) return;
  const P=SKY_P[menu?'dia':wxKey]||SKY_P.dia, U=skyMat.uniforms;
  skyDome.position.copy(camera.position);
  U.hor.value.copy(scene.background); U.zen.value.set(P.z==null?scene.background.getHex():P.z); if(P.z!=null) U.zen.value.lerp(U.hor.value,.18);
  U.cc.value.set(P.cc); U.cov.value=P.c; U.stars.value=P.st||0; U.t.value=performance.now()/1000;
  const sp=(menu?WXS.dia:WX).sunPos||[40,90,25]; U.sunDir.value.set(sp[0],sp[1],sp[2]).normalize(); U.sunCol.value.copy(sun.color).multiplyScalar(menu?1:Math.min(1,(WX.sun??.85)*1.2)); }
{ const _cu=cullUpdate; cullUpdate=function(){ skyUpdate(); _cu(); }; }
