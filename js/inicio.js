// Arranque: arma el primer mapa, muestra el menú y empieza el bucle del juego
builtKey=chosenMap==='rand'?'villers':chosenMap; buildWorld(builtKey); assignSpawns(chosenNation); resetZones();
mainMenu();
if(!introSeen()) introStart();   // la primera vez que se abre el juego
document.getElementById('fsBtn').onclick=e=>{ e.stopPropagation(); toggleFS(); };
requestAnimationFrame(loop);
