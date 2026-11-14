// Novedades (documento de diseño: "cada semana cierra con 3 líneas de qué cambió"). Va después de diario.js.
// Botón 📰 Novedades en el menú principal con un puntito mientras haya una novedad sin ver (tw2_nov = id de la última vista).
// Para sumar una semana: agregar una entrada ARRIBA de todo en NOV (id nuevo, fecha y las líneas en los dos idiomas).
// También pone el lema del juego en la portada del menú. Textos en los dos idiomas acá mismo (data-notr).
(function(){
  const EN=()=>window.LANG==='en';
  const LS=(k,v)=>{ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } };
  const NOV=[
    {id:'2026-11-14b',fecha:'14/11/2026',
     es:['Aviones y cañones de cada país: apoyo aéreo con Ju 87 Stuka, Il-2, P-47, Typhoon y el Northrop 8A-2 argentino; paracaidistas en Ju 52, C-47, Dakota y Li-2; artillería con leFH 18, M-30, M2A1, 25 libras y los Schneider y Bofors argentinos.',
         'La animación de la artillería y del avión sale la primera vez que la pide tu equipo en cada partida, y una versión corta cuando la pide el enemigo.',
         'Arreglos de lo que reportaron: los postes del telégrafo, faroles, bancos e hidrantes no se veían (quedaban solo los cables en el aire). Postes nuevos, con crucetas, riostras, escalones y aisladores de campana.',
         'Semiorugas de los refuerzos rehechas: Sd.Kfz. 251 y M3 Half-track.',
         'Las animaciones de la artillería y el bombardeo ya no se cortan al tocar una tecla (tienen botón Saltear).',
         'Cuando cae un tripulante, un cartel explica qué pasa y cómo recuperarlo; en un punto propio se recupera aunque no haya infantería cerca.',
         'Las novedades se abren solas cuando hay algo nuevo.',
         'Voz de radio nueva, grabada por Sebastián: dicta las coordenadas o "Fuego sobre Bravo", avisa "Capturamos Alfa", "Perdimos Charlie" y "Bombarderos en camino".'],
     en:['Aircraft and guns for each country: air support with Ju 87 Stuka, Il-2, P-47, Typhoon and the Argentine Northrop 8A-2; paratroopers in Ju 52, C-47, Dakota and Li-2; artillery with leFH 18, M-30, M2A1, 25-pounder and the Argentine Schneider and Bofors.',
         'The artillery and air support animation plays the first time your team calls it in each battle, and a short version when the enemy does.',
         'Fixes from your reports: telegraph poles, street lamps, benches and hydrants were invisible (only the wires showed). New poles with crossarms, braces, steps and bell insulators.',
         'Reinforcement half-tracks rebuilt: Sd.Kfz. 251 and M3 Half-track.',
         'The artillery and air strike animations no longer stop when you press a key (they have a Skip button).',
         'When a crew member is down, a message explains what happens and how to get him back; in your own point you get crew back even with no infantry nearby.',
         'News opens by itself when there is something new.',
         'New radio voice recorded by Sebastián (Spanish only): it calls out coordinates or "Fire on Bravo", and points captured or lost.']},
    {id:'2026-11-14',fecha:'14/11/2026',
     es:['Capítulo TAM, semana 1: nuevo tanque argentino, el Sherman Repotenciado (1978), un Firefly con cañón de 105 mm de Río Tercero y motor diésel.',
         'Botón 📜 Historia con su historia y sus fuentes, del Sherman de 1946 a la crisis del Beagle.',
         'Por ahora está en la línea argentina de la Guerra Fría; la semana que viene esa línea se abre todo el año.'],
     en:['TAM chapter, week 1: a new Argentine tank, the Sherman Repotenciado (1978), a Firefly with a 105 mm gun from Río Tercero and a diesel engine.',
         '📜 History button with its story and sources, from the 1946 Shermans to the Beagle crisis.',
         'For now it is in the Argentine Cold War line; next week that line opens all year round.']},
    {id:'2026-11-13',fecha:'13/11/2026',
     es:['TaraWar ya está en itch.io: spuchinni.itch.io/tarawar.',
         'Abrimos el Discord del juego para armar partidas, avisar errores y proponer ideas (botón 👥 Discord en el menú).',
         'Botón 💬 Dar opinión: lo leo todo.'],
     en:['TaraWar is now on itch.io: spuchinni.itch.io/tarawar.',
         'The game\'s Discord is open: find battles, report bugs and suggest ideas (👥 Discord button in the menu).',
         '💬 Give feedback button: I read everything.']},
    {id:'2026-11-10b',fecha:'10/11/2026',
     es:['Capítulo Nahuel: la historia del primer tanque argentino, con fuentes (botón 📜 Historia en el garaje).',
         'Tres desafíos del Nahuel basados en hechos reales: el desfile del 9 de Julio de 1944, la marcha a San Miguel y la prueba de tiro de 1947 (botón 🎖 Desafíos).',
         'El cañón dañado ahora se ve: quemado, abollado y humeando.',
         'Cuando te queda poca munición, te explica cómo reponerla en un punto de tu bando.',
         'Apoyos: la artillería cuesta 150 puntos y el bombardeo 300; la radio dicta las coordenadas y la primera vez se ve la batería disparando y el bombardero llegando.'],
     en:['Nahuel chapter: the story of the first Argentine tank, with sources (📜 History button in the hangar).',
         'Three Nahuel challenges based on real events: the July 9, 1944 parade, the march to San Miguel and the 1947 firing trial (🎖 Challenges button).',
         'A damaged gun is now visible: burnt, dented and smoking.',
         'When you run low on ammo, you learn how to resupply at a point your side holds.',
         'Support: artillery costs 150 points and air strikes 300; the radio reads out the coordinates, and the first time you see the battery firing and the bomber coming in.']},
    {id:'2026-11-10',fecha:'10/11/2026',
     es:['Arrancamos de cero: se reinició el progreso de todos.',
         'Con 2 victorias después del entrenamiento se abre la Argentina con el Nahuel; después, cada 5 victorias elegís una nación nueva.'],
     en:['Fresh start: everyone\'s progress was reset.',
         'After the training, 2 wins unlock Argentina and the Nahuel; then every 5 wins you choose a new nation.']},
    {id:'2026-11-09',fecha:'9/11/2026',
     es:['Premio diario en ruleta: gira sola al entrar y vuelve a las 0 h.',
         'Primeras batallas: te enseña el punto débil de cada tanque y a usar la mira de lejos.',
         'La munición se desbloquea con el nivel del tanque y en el garaje elegís cuánta llevar.',
         'Cuando te destruyen, la cámara de muerte te muestra el tiro y quién fue. Un tanque nuevo ahora cuesta unas 5 batallas.',
         'La 1ª batalla va por pasos: un tanque cerca para aprender dónde pegar, otro lejos para la mira. Al terminar el entrenamiento (3 batallas) recibís tu primer tanque.'],
     en:['Daily reward wheel: spins on its own when you log in and resets at midnight.',
         'First battles: learn each tank\'s weak spot and how to use the sight at long range.',
         'Ammo unlocks with tank level, and in the garage you choose how much to carry.',
         'When you are destroyed, the death cam shows the shot and who fired it. A new tank now takes about 5 battles.',
         'The first battle goes step by step: a close tank to learn where to hit, a far one for the sight. After the training (3 battles) you get your first tank.']},
    {id:'2026-11-08',fecha:'8/11/2026',
     es:['Elegí tu primer tanque: Sherman, T-34 o Panzer IV, y a pelear en segundos.',
         'Batallas rápidas de 5 minutos (en el garaje podés volver a la batalla grande).',
         'Premio diario: girá la ruleta cada día y ganá Yaguaretés, calcomanías, accesorios o camuflajes. 14 días seguidos = tanque especial.',
         'Panzer IV con sus medidas reales y pintura más prolija en todos los tanques. Se puede jugar sin internet.',
         'TaraWar se enfoca en la 2ª Guerra y en los blindados argentinos: las demás épocas y países quedan guardados por ahora.'],
     en:['Pick your first tank: Sherman, T-34 or Panzer IV, and fight within seconds.',
         'Quick 5-minute battles (switch back to big battles in the garage).',
         'Daily reward: spin the wheel every day for Yaguaretés, stickers, gear or camouflage. 14 days in a row = a special tank.',
         'Panzer IV with real dimensions and cleaner paint on every tank. You can now play offline.',
         'TaraWar now focuses on World War II and Argentine armor: other eras and nations are stored for later.']}];
  const st=document.createElement('style'); st.textContent=`
    #novBox{position:fixed;inset:0;z-index:55;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);padding:12px}
    #novBox .card{width:min(640px,96vw);max-height:90vh;overflow:auto;background:rgba(18,20,24,.97);border:2px solid #ffd24a;border-radius:14px;padding:16px 20px;color:#fff;font:600 17px 'Saira Condensed',system-ui,sans-serif}
    #novBox h2{margin:0 0 8px;font:800 30px 'Saira Condensed',system-ui,sans-serif;color:#ffd24a;text-align:center}
    #novBox h3{margin:12px 0 4px;color:#cfc6b0;font-size:16px;letter-spacing:.06em} #novBox ul{margin:0;padding-left:20px} #novBox li{margin:4px 0;line-height:1.3}
    #novBox .x{display:block;margin:14px auto 0;min-width:180px;font-size:20px}
    #introL{display:none} .homeCopy{left:0;right:0;text-align:center;bottom:calc(2px + env(safe-area-inset-bottom,0px))}
    .homeBar{bottom:calc(26px + env(safe-area-inset-bottom,0px))!important}
    .novB{position:relative} .novB i{position:absolute;top:-2px;right:-10px;width:10px;height:10px;border-radius:50%;background:#ff4a36;box-shadow:0 0 0 2px #111}
    .homeTag{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(122px + env(safe-area-inset-bottom,0px));z-index:5;pointer-events:none;white-space:nowrap;
      font:700 20px 'Saira Condensed',system-ui,sans-serif;letter-spacing:.06em;color:#ffd24a;text-shadow:0 2px 6px #000,0 0 2px #000}
    body.movil .homeTag{font-size:14px;bottom:calc(100px + env(safe-area-inset-bottom,0px))}`;
  document.head.appendChild(st);
  const box=document.createElement('div'); box.id='novBox'; box.setAttribute('data-notr',''); document.body.appendChild(box);
  function showNov(){ const L=EN();
    box.innerHTML=`<div class="card"><h2>${L?'What\'s new':'Novedades'}</h2>${NOV.map(n=>`<h3>${n.fecha}</h3><ul>${(L?n.en:n.es).map(x=>`<li>${x}</li>`).join('')}</ul>`).join('')}
      <button class="go alt x" id="novX">${L?'Close':'Cerrar'}</button></div>`;
    box.style.display='flex'; LS('tw2_nov',NOV[0].id);
    document.getElementById('novX').onclick=()=>{ box.style.display='none'; if(state==='menu') mainMenu(); }; }
  window.showNov=showNov;
  const _mm=mainMenu; mainMenu=function(){ const r=_mm.apply(this,arguments);
    const bar=document.querySelector('.homeBar'); if(!bar) return r;
    // menú liviano (pedido de Sebastián: "muy cargada"): Jugar, Campaña, Vehículos y Opciones. El Tutorial está en el garaje.
    const tb=document.getElementById('tutB'); if(tb) tb.style.display='none';
    // Novedades: link chico abajo, en lugar de "Ver la intro" (la intro hoy es la portada quieta y se encimaba con Opciones)
    const cp=document.querySelector('.homeCopy'); if(cp){ const b=document.createElement('button'); b.className='introL novB'; b.id='novB'; b.setAttribute('data-notr','');
      b.innerHTML=`📰 ${EN()?'News':'Novedades'}${LS('tw2_nov')!==NOV[0].id?'<i></i>':''}`; b.onclick=showNov; cp.prepend(b); }
    // lema: de qué se trata el juego (no tapa el tanque elegido de las primeras batallas: va más arriba)
    const t=document.createElement('div'); t.className='homeTag'; t.setAttribute('data-notr','');
    t.textContent=EN()?'Argentine armor, from the Nahuel to the TAM · made in Corrientes':'Los blindados argentinos, del Nahuel al TAM · hecho en Corrientes';
    $('panel').appendChild(t);
    // se abre sola al llegar al menú si hay una novedad sin ver (pedido de Sebastián), para todos (también el que recién llega),
    // esperando a que se vaya la portada y a que no haya otra caja abierta (ruleta del premio diario, etc.)
    if(!novShown&&!autoT&&LS('tw2_nov')!==NOV[0].id){ let n=0; autoT=setInterval(()=>{ n++;
      if(state!=='menu'||!$('playB')){ n=0; return; }   // todavía en la portada o fuera del menú: espera (sigue mirando hasta que se pueda)
      const busy=[...document.querySelectorAll('#dayBox,#natPick,#tkPick,#giftBox,#opBox,#nahBox,#iosGuide')].some(e=>e&&getComputedStyle(e).display!=='none');
      if(!busy&&n>=3){ clearInterval(autoT); autoT=0; novShown=true; if(LS('tw2_nov')!==NOV[0].id) showNov(); } },500); }
    return r; };
  let autoT=0, novShown=false;
})();
