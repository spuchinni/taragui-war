/* Dónde corre el juego. En GitHub Pages es 'web'; herramientas/crazygames/armar.py reemplaza este archivo en el paquete de CrazyGames.
   Para probar en la PC: ?plataforma=crazygames (en localhost el SDK muestra un cartel en vez de anuncios). premio = anuncio con premio (solo con Full Launch). */
window.PLATAFORMA=window.PLATAFORMA||{id:'web',premio:false};
{ const m=location.search.match(/[?&]plataforma=([a-z]+)/); if(m) window.PLATAFORMA={id:m[1],premio:/[?&]premio=1/.test(location.search)}; }
