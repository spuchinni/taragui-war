// Capítulo Nahuel (semana 3 del plan): historia corta del Nahuel DL-43, con fuentes (pedido de Sebastián: todo dato histórico chequeado).
// Fuentes: Tank Encyclopedia, "Nahuel DL 43" (basado en R. J. Sigal Fogliani, "Nahuel DL 43", Dunken, 2004); Wikipedia "Nahuel DL 43".
// Botón "📜 Historia" en el garaje cuando el tanque elegido es argentino; nahuelHist() también la abre desde el cartel de nación nueva (rapida.js).
(function(){
  const EN=()=>window.LANG==='en';
  const H={
    es:{t:'Nahuel DL-43: el primer tanque argentino',
      p:['<b>1943.</b> Con la Segunda Guerra en marcha, la Argentina neutral no conseguía comprar tanques. El coronel <b>Alfredo Baisi</b> diseñó uno propio: el <b>Nahuel</b>, que en mapudungun quiere decir <b>yaguareté</b>.',
        '<b>Hecho con lo que había en el país.</b> El casco en los talleres del Ministerio de Obras Públicas en Isla Maciel, la torre en TAMET, el motor con la Fábrica Militar de Aviones, la nafta de YPF y el armado final en el <b>Arsenal Esteban de Luca</b>. El cañón: el <b>Krupp de 75 mm modelo 1909</b> de la artillería.',
        '<b>4 de junio de 1944.</b> Primera exhibición: dos Nahuel, todavía sin motor, abrieron el acto disparando el cañón y asustaron al público. <b>9 de julio de 1944:</b> diez Nahuel desfilaron por el Día de la Independencia, el primero al mando del propio Baisi.',
        '<b>¿Cuántos se hicieron?</b> Según los inventarios del Ejército, como mucho <b>12</b> y una maqueta de madera; otros autores dicen 16.',
        '<b>1947.</b> Modernizados, pasaron las pruebas finales en San Miguel: una marcha larga (las orugas se salían a alta velocidad y en giros cerrados), combate entre humo y tiro. Como las miras se descalibraban, a cada jefe le dieron un <b>espejo para apuntar mirando por el tubo</b>.',
        '<b>El final.</b> Después de la guerra llegaron los Sherman baratos de los sobrantes aliados y no se fabricaron más. Terminaron desguazados: <b>no queda ninguno</b>. Uno fue monumento en Campo de Mayo, en el Grupo de Artillería Blindado 1, que después se mudó a <b>Curuzú Cuatiá, Corrientes</b>.'],
      src:'Fuentes', close:'Cerrar'},
    en:{t:'Nahuel DL-43: the first Argentine tank',
      p:['<b>1943.</b> With World War II under way, neutral Argentina could not buy tanks. Colonel <b>Alfredo Baisi</b> designed one of its own: the <b>Nahuel</b>, Mapudungun for <b>jaguar</b> (the "yaguareté").',
        '<b>Built with what the country had.</b> The hull at the Ministry of Public Works shops in Isla Maciel, the turret at TAMET, the engine with the Military Aircraft Factory, fuel from YPF and final assembly at the <b>Esteban de Luca Arsenal</b>. The gun: the artillery\'s <b>75 mm Krupp model 1909</b>.',
        '<b>June 4, 1944.</b> First showing: two Nahuels, still without engines, opened the ceremony by firing their guns and startled the crowd. <b>July 9, 1944:</b> ten Nahuels paraded for Independence Day, the first one commanded by Baisi himself.',
        '<b>How many were built?</b> According to Army inventories, at most <b>12</b> plus a wooden mock-up; other authors say 16.',
        '<b>1947.</b> Modernized, they went through their final trials at San Miguel: a long drive (tracks came off at high speed and in sharp turns), combat in smoke and live firing. Since the sights kept losing their zero, each commander got a <b>mirror to aim by looking down the barrel</b>.',
        '<b>The end.</b> After the war, cheap surplus Shermans arrived and no more were built. They were scrapped: <b>none survives</b>. One became a monument at Campo de Mayo, with Armored Artillery Group 1, which later moved to <b>Curuzú Cuatiá, Corrientes</b>.'],
      src:'Sources', close:'Close'}};
  // Sherman Repotenciado (capítulo TAM, semana 1). Fuente: Tank Encyclopedia, "Sherman Repotenciado".
  const HR={
    es:{t:'Sherman Repotenciado: el Firefly con 105 mm',
      p:['<b>1946–1948.</b> En vez de fabricar más Nahuel, la Argentina compró unos <b>360 Sherman</b> de segunda mano: 206 Firefly y 154 con cañón de 75 mm. Con ellos fue la fuerza blindada más poderosa de Latinoamérica.',
        '<b>Los 60 y 70.</b> Los Sherman envejecían. Con el «Plan Europa» llegaron los AMX-13 franceses con cañón de 105 mm, y una comisión técnica decidió ponerles <b>el mismo cañón</b> a los Firefly: así se compartía la munición.',
        '<b>1975–1978.</b> La Fábrica Militar entregó el prototipo en 1975. El cañón, un <b>105 mm L44/57</b> copiado del CN-105-57, se hacía en la <b>Fábrica Militar de Río Tercero</b>, en Córdoba. Con la crisis del Beagle de 1978 la conversión se aceleró: fueron <b>120</b>.',
        '<b>Qué cambió.</b> Motor diésel <b>Poyaud 520 V8</b> (450–500 CV, 48–50 km/h), orugas nacionales, canasto en la torre, lanzahumos, radios nuevas y un <b>tanque de 200 l</b> que se colgaba atrás de la torre. El blindaje quedó igual que en 1944.',
        '<b>9 de julio de 1978.</b> Se mostró al público en un desfile con dos escuadrones del Regimiento de Caballería de Tanques 8. Ese año, algunos escuadrones esperaron cerca de la frontera; el Papa Juan Pablo II medió y no hubo guerra.',
        '<b>El final.</b> Dejó el servicio en <b>mayo de 1998</b>, cuando el EA0060 disparó por última vez en el polígono de Magdalena. Algunos siguen como vehículos históricos para desfiles y con rodillos para abrir campos minados.'],
      src:'Fuentes', close:'Cerrar'},
    en:{t:'Sherman Repotenciado: the Firefly with a 105 mm gun',
      p:['<b>1946–1948.</b> Instead of building more Nahuels, Argentina bought about <b>360 second-hand Shermans</b>: 206 Fireflies and 154 with the 75 mm gun. They made it the strongest armored force in Latin America.',
        '<b>The 60s and 70s.</b> The Shermans were getting old. The «Plan Europa» brought French AMX-13s with a 105 mm gun, and a technical commission chose to give the Fireflies <b>the same gun</b>, so they could share ammunition.',
        '<b>1975–1978.</b> The Military Factory delivered the prototype in 1975. The gun, a <b>105 mm L44/57</b> copied from the CN-105-57, was made at the <b>Río Tercero Military Factory</b> in Córdoba. During the 1978 Beagle crisis the conversion was rushed: <b>120</b> were built.',
        '<b>What changed.</b> A <b>Poyaud 520 V8</b> diesel (450–500 hp, 48–50 km/h), local tracks, a turret basket, smoke dischargers, new radios and a <b>200 l tank</b> that could hang behind the turret. The armor stayed as it was in 1944.',
        '<b>July 9, 1978.</b> It was shown to the public in a parade with two squadrons of the 8th Tank Cavalry Regiment. That year some squadrons waited near the border; Pope John Paul II mediated and there was no war.',
        '<b>The end.</b> It left service in <b>May 1998</b>, when EA0060 fired for the last time at the Magdalena range. A few remain as historical vehicles for parades and as mine-clearing roller tanks.'],
      src:'Sources', close:'Close'}};
  const SRCR='<a href="https://tanks-encyclopedia.com/coldwar-argentina-sherman-repotenciado/" target="_blank" rel="noopener">Tank Encyclopedia: Sherman Repotenciado</a>';
  const SRC='<a href="https://tanks-encyclopedia.com/nahuel-dl-43/" target="_blank" rel="noopener">Tank Encyclopedia: Nahuel DL 43</a> · R. J. Sigal Fogliani, <i>Nahuel DL 43</i> (Dunken, 2004) · <a href="https://en.wikipedia.org/wiki/Nahuel_DL_43" target="_blank" rel="noopener">Wikipedia</a>';
  const st=document.createElement('style'); st.textContent=`
    #nahBox{position:fixed;inset:0;z-index:64;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.75);padding:12px}
    #nahBox .card{width:min(680px,96vw);max-height:90vh;overflow:auto;background:rgba(18,20,24,.97);border:2px solid #74acdf;border-radius:14px;padding:16px 22px;color:#fff;font:600 17px 'Saira Condensed',system-ui,sans-serif}
    #nahBox h2{margin:0 0 6px;font:800 28px 'Saira Condensed',system-ui,sans-serif;color:#ffd24a;text-align:center}
    #nahBox .esc{display:block;margin:0 auto 8px;width:64px;height:12px;background:linear-gradient(#74acdf 33%,#fff 33% 66%,#74acdf 66%);border-radius:2px}
    #nahBox p{margin:7px 0;line-height:1.32} #nahBox .src{margin-top:10px;font-size:14px;color:#cfc6b0} #nahBox .src a{color:#9cc8ef}
    #nahBox .x{display:block;margin:12px auto 0;min-width:170px}
    body.movil #nahBox .card{zoom:.8}`;
  document.head.appendChild(st);
  const box=document.createElement('div'); box.id='nahBox'; box.setAttribute('data-notr',''); document.body.appendChild(box);
  function show(k){ const rep=k==='repot', HH=rep?HR:H, L=EN()?HH.en:HH.es;
    box.innerHTML=`<div class="card"><i class="esc"></i><h2>${L.t}</h2>${L.p.map(x=>`<p>${x}</p>`).join('')}<div class="src">${L.src}: ${rep?SRCR:SRC}</div><button class="go alt x" id="nahX">${L.close}</button></div>`;
    box.style.display='flex'; document.getElementById('nahX').onclick=()=>{ box.style.display='none'; };
    box.onclick=e=>{ if(e.target===box) box.style.display='none'; }; }
  window.nahuelHist=()=>show('nahuel'); window.tankHist=show;
  // garaje: botón de historia con los tanques argentinos
  const _rh=renderHangar; renderHangar=function(){ const r=_rh.apply(this,arguments);
    try{ const V=typeof hgSel!=='undefined'&&VEH[hgSel], cam=document.getElementById('hgCam');
      const hk=hgSel==='repot'?'repot':V&&V.era===3?'nahuel':null;   // el TAM y los demás de la Guerra Fría tendrán la suya (semana 2)
      if(V&&V.nation==='ar'&&hk&&cam&&!document.getElementById('hgHist')){ cam.insertAdjacentHTML('beforebegin',`<button class="hgB" id="hgHist" data-notr>📜 ${EN()?'History':'Historia'}</button>`); document.getElementById('hgHist').onclick=()=>show(hk); } }catch(e){}
    return r; };
})();
