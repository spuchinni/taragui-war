// Arranque: arma el primer mapa, muestra el menú y empieza el bucle del juego
builtKey=chosenMap==='rand'?'villers':chosenMap; buildWorld(builtKey); assignSpawns(chosenNation); resetZones();
mainMenu();
if(!introSeen()) introStart();   // la primera vez que se abre el juego
document.getElementById('fsBtn').onclick=e=>{ e.stopPropagation(); toggleFS(); };
requestAnimationFrame(loop);
// ¿Hay una versión nueva publicada? (version.json no se guarda en caché). Si la hay, un aviso para recargar con la nueva.
function checkVersion(){ fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{
  if(!j||!j.v||j.v===window.GAME_V||$('newV')) return;
  const b=document.createElement('button'); b.id='newV'; b.className='newV'; b.textContent='Hay una versión nueva del juego · Actualizar';
  b.onclick=()=>location.replace(location.pathname+'?v='+encodeURIComponent(j.v)); document.body.appendChild(b); }).catch(()=>{}); }
checkVersion(); setInterval(()=>{ if(state==='menu'||state==='summary') checkVersion(); },120000);
