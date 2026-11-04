// Agua y costas (pedido de Sebastián). Reemplaza el plano de agua de siempre (gris y quieto) por uno con shader:
//  · color según la profundidad, que sale de una textura hecha con el relieve (`depthTex`, 512 × 512 sobre el mapa):
//    turquesa en la playa y azul oscuro mar adentro en el Pacífico; marrón "color león" del Paraná en Corrientes;
//  · olas: el plano sube y baja (más en el mar que en el río) y las normales se mueven con varias ondas, así el sol
//    brilla en reflejos que cambian; reflejo del cielo según el ángulo (Fresnel); de noche se apaga casi todo;
//  · espuma blanca que va y viene en la orilla y más transparente donde es playo (se ve la arena).
// Costas nuevas: Saipán (al sur, detrás de la cabeza de playa) y Okinawa (al oeste), con playa de arena (gm1-mapas.js, C.coast).
(function(){
  const VS=`
    uniform float uT, uAmp; varying vec3 vW; varying vec2 vUv;
    #include <fog_pars_vertex>
    void main(){ vec4 w=modelMatrix*vec4(position,1.0);
      float a=uAmp*(sin(w.x*.045+uT*.9)*.5+sin(w.z*.06-uT*1.1)*.35+sin((w.x+w.z)*.11+uT*1.7)*.15);
      w.y+=a; vW=w.xyz; vec4 mvPosition=viewMatrix*w; gl_Position=projectionMatrix*mvPosition;
      #include <fog_vertex>
    }`;
  const FS=`
    uniform float uT, uAmp, uNight, uFoamK; uniform sampler2D uDepth; uniform vec4 uArea; uniform vec3 uShallow, uDeep, uSky, uSun, uSunDir; varying vec3 vW;
    #include <fog_pars_fragment>
    float h2(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y); }
    void main(){
      vec2 uv=(vW.xz-uArea.xy)/uArea.zw; float inA=step(0.0,uv.x)*step(uv.x,1.0)*step(0.0,uv.y)*step(uv.y,1.0);
      float d=mix(12.0, texture2D(uDepth,uv).r*12.0, inA);                       // profundidad en metros (fuera de la textura: hondo)
      // normal: ondas que se cruzan + ruido fino
      vec2 p=vW.xz; float t=uT;
      vec2 g=vec2(cos(p.x*.045+t*.9)*.045*.5, cos(p.y*.06-t*1.1)*.06*.35)+vec2(cos((p.x+p.y)*.11+t*1.7)*.11*.15);
      g*=uAmp*3.0; g+=vec2(n2(p*.35+t*.4)-.5, n2(p*.35-t*.33+7.0)-.5)*.35+vec2(n2(p*1.6+t*.9)-.5, n2(p*1.6-t*.8+3.0)-.5)*.18;
      vec3 N=normalize(vec3(-g.x,1.0,-g.y)), V=normalize(cameraPosition-vW);
      float fr=pow(1.0-max(dot(N,V),0.0),3.0);
      vec3 base=mix(uShallow,uDeep,smoothstep(.2,5.5,d));
      vec3 col=mix(base,uSky,fr*.55);
      vec3 H=normalize(normalize(uSunDir)+V); float sp=pow(max(dot(N,H),0.0),160.0)*(1.0-uNight);
      col+=uSun*sp*1.4;
      // espuma de la orilla: franjas que avanzan y se deshacen
      float fm=smoothstep(1.4,0.0,d)*(.55+.45*sin(d*9.0-t*1.8+n2(p*.25)*6.0))*smoothstep(.0,.15,d)*uFoamK;
      fm=max(fm,smoothstep(.35,0.0,d)*.9*uFoamK); fm*=.6+.4*n2(p*2.0+t);
      col=mix(col,vec3(.93,.95,.95)*(1.0-uNight*.75),clamp(fm,0.0,1.0));
      col*=1.0-uNight*.72;
      float a=mix(.45,.93,smoothstep(.05,2.2,d)); a=max(a,fm);
      gl_FragColor=vec4(col,a);
      #include <fog_fragment>
    }`;
  let mat=null, tex=null, T0=performance.now();
  function palette(){ const k=W.key||''; if(W.cfgC&&W.cfgC.coast) return {sh:0x58c8b8,dp:0x14506e,amp:.35,foam:1};
    if(W.osm||/puente|costanera|salto|posadas|itati|pasopatria/.test(k)) return {sh:0x9a8458,dp:0x5e4e34,amp:.12,foam:.55};   // el Paraná, marrón
    if(/laguna/.test(k)) return {sh:0x6a7a58,dp:0x2e4a3a,amp:.06,foam:.3};
    if(/malvinas/.test(k)) return {sh:0x4a7a7a,dp:0x1c3442,amp:.45,foam:1};
    return {sh:0x6a8070,dp:0x2e4a4a,amp:.15,foam:.6}; }
  function depthTexture(cx,cz,size){ const N=256, data=new Uint8Array(N*N*4);
    for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const x=cx-size/2+(i+.5)/N*size, z=cz-size/2+(j+.5)/N*size; const d=clamp((W.water-heightAt(x,z))/12,0,1)*255;
      const k=(j*N+i)*4; data[k]=data[k+1]=data[k+2]=d; data[k+3]=255; }
    const t=new THREE.DataTexture(data,N,N,THREE.RGBAFormat); t.magFilter=t.minFilter=THREE.LinearFilter; t.needsUpdate=true; return t; }
  function setup(){ if(W.water==null) return; const P=palette(), size=Math.max(W.bx,W.bz)*2+360;
    if(tex) tex.dispose(); tex=depthTexture(0,0,size);
    mat=new THREE.ShaderMaterial({uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uAmp:{value:P.amp},uNight:{value:0},uFoamK:{value:P.foam},uDepth:{value:null},uArea:{value:new THREE.Vector4(-size/2,-size/2,size,size)},
        uShallow:{value:new THREE.Color(P.sh)},uDeep:{value:new THREE.Color(P.dp)},uSky:{value:new THREE.Color()},uSun:{value:new THREE.Color(0xfff2d8)},uSunDir:{value:new THREE.Vector3(.4,.8,.3)}}]),
      vertexShader:VS,fragmentShader:FS,transparent:true,fog:true,depthWrite:false});
    mat.uniforms.uDepth.value=tex;
    const geo=new THREE.PlaneGeometry(size+2400,size+2400,160,160); geo.rotateX(-Math.PI/2);
    if(waterMesh){ worldGroup.remove(waterMesh); if(waterMesh.material) waterMesh.material.dispose(); if(waterMesh.geometry) waterMesh.geometry.dispose(); }
    waterMesh=new THREE.Mesh(geo,mat); waterMesh.position.y=W.water; waterMesh.renderOrder=2; waterMesh.frustumCulled=false; worldGroup.add(waterMesh); }
  const _bw=buildWorld;
  buildWorld=function(key){ const r=_bw.apply(this,arguments); try{ setup(); }catch(e){ console.warn('agua',e); } return r; };
  const _cu=cullUpdate;
  cullUpdate=function(){ _cu.apply(this,arguments); if(!mat||!waterMesh||waterMesh.material!==mat) return; const U=mat.uniforms;
    U.uT.value=(performance.now()-T0)/1000; U.uSky.value.copy(scene.background||new THREE.Color(0x9ab)); const night=typeof WX!=='undefined'&&WX&&WX.night;
    U.uNight.value=night?1:0; if(typeof sun!=='undefined'){ U.uSunDir.value.copy(sun.position).sub(sun.target?sun.target.position:new THREE.Vector3()).normalize(); U.uSun.value.copy(sun.color).multiplyScalar(Math.min(1.2,sun.intensity)); } };
})();
