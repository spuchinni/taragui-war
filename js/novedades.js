// Novedades (documento de diseño: "cada semana cierra con 3 líneas de qué cambió"). Va después de diario.js.
// Botón 📰 Novedades en el menú principal con un puntito mientras haya una novedad sin ver (tw2_nov = id de la última vista).
// Para sumar una semana: agregar una entrada ARRIBA de todo en NOV (id nuevo, fecha y las líneas en los dos idiomas).
// También pone el lema del juego en la portada del menú. Textos en los dos idiomas acá mismo (data-notr).
(function(){
  const EN=()=>window.LANG==='en';
  const LS=(k,v)=>{ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } };
  const NOV=[
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
    return r; };
})();
