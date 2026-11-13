// Comunidad (semana 4): links al Discord y a la página de itch.io en el menú principal, y al Discord en el resumen de la batalla.
// Dentro de itch.io (?desde=itch) no se muestra el link a itch.io (ya estás ahí).
(function(){
  const EN=()=>window.LANG==='en';
  const DISCORD='https://discord.gg/5fgkzJY6T', ITCH='https://spuchinni.itch.io/tarawar';
  const enItch=/[?&]desde=itch/.test(location.search);
  const st=document.createElement('style'); st.textContent=`
    .comB{margin-left:14px} a.comB{color:var(--khaki);text-decoration:underline}
    #comDc{display:block;margin:8px auto 0;color:#9fb0ff;font:600 15px 'Saira Condensed',system-ui,sans-serif;text-decoration:underline;text-align:center}`;
  document.head.appendChild(st);
  const link=(id,txt,url)=>{ const a=document.createElement('a'); a.className='introL comB'; a.id=id; a.href=url; a.target='_blank'; a.rel='noopener'; a.setAttribute('data-notr',''); a.textContent=txt; return a; };
  const _mm=mainMenu; mainMenu=function(){ const r=_mm.apply(this,arguments);
    try{ const cp=document.querySelector('.homeCopy'); if(cp&&!document.getElementById('comD')){
      let after=document.getElementById('opB')||document.getElementById('novB');
      const d=link('comD','👥 Discord',DISCORD); if(after) after.after(d); else cp.prepend(d); after=d;
      if(!enItch){ const i=link('comI','🎮 itch.io',ITCH); after.after(i); } } }catch(e){}
    return r; };
  const _su=summary; summary=function(){ const r=_su.apply(this,arguments);
    try{ const p=$('panel'); if(p&&!document.getElementById('comDc')&&!tut){ const a=document.createElement('a'); a.id='comDc'; a.href=DISCORD; a.target='_blank'; a.rel='noopener'; a.setAttribute('data-notr','');
      a.textContent=EN()?'👥 Join the Discord to find battles with other players':'👥 Sumate al Discord para armar partidas con otros jugadores'; p.appendChild(a); } }catch(e){}
    return r; };
  window.TW_LINKS={DISCORD,ITCH};
})();
