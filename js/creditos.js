// Créditos (pedido para publicar: las licencias de terceros piden nombrarlos). Botón al final de Ajustes y, en los mapas reales
// de OpenStreetMap, el aviso "© colaboradores de OpenStreetMap" junto al minimapa (lo exige la licencia ODbL).
(function(){
  const ROWS=[['Motor 3D','three.js (MIT)'],['Partidas online','PeerJS (MIT) · Firebase (Google)'],['Tipografía','Saira Condensed (SIL Open Font License)'],
    ['Civiles detallados','Ultimate Modular Men / Women — Quaternius (CC0)'],['Sonidos','Cañones, explosión, motor y torre: qubodup (CC0) · ametralladora, sirena y paso de avión: Pixabay (licencia de contenido de Pixabay) · el resto, hechos por código para el juego'],
    ['Voces de radio','TTSMaker'],['Mapas reales','© colaboradores de OpenStreetMap (ODbL) · relieve: Terrarium (Mapzen)'],['Datos de los tanques','Tank Encyclopedia y manuales de época'],
    ['Modelos, mapas y texturas','Hechos por código para TaraWar']];
  function show(){ const box=document.getElementById('hgModal')||document.getElementById('panel'); const host=document.createElement('div');
    host.id='credBox'; host.style.cssText='position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6)';
    host.innerHTML=`<div style="max-width:620px;width:92%;max-height:86vh;overflow:auto;background:#1a1f26;border:1px solid rgba(232,200,120,.45);border-radius:6px;padding:18px 22px;color:#f2e6c8;font:15px/1.45 system-ui,sans-serif">
      <h2 style="margin:0 0 10px;font:700 24px 'Saira Condensed',system-ui">Créditos</h2>
      ${ROWS.map(([a,b])=>`<p style="margin:6px 0"><b>${a}:</b> ${b}</p>`).join('')}
      <p style="margin:12px 0 0;opacity:.7;font-size:13px">TaraWar: Frente de Acero · todos los derechos reservados.</p>
      <button class="go" id="credX" style="margin-top:14px">Cerrar</button></div>`;
    document.body.appendChild(host); host.querySelector('#credX').onclick=()=>host.remove(); host.onclick=e=>{ if(e.target===host) host.remove(); }; }
  window.showCredits=show;
  const _rs=renderSettings;
  renderSettings=function(){ const r=_rs.apply(this,arguments); const s=document.querySelector('#panel .settings'); if(s&&!document.getElementById('credB')){
      const b=document.createElement('button'); b.id='credB'; b.className='go alt'; b.textContent='Créditos'; b.style.marginTop='10px'; b.onclick=show; s.appendChild(b); } return r; };
  // aviso de OpenStreetMap en los mapas reales
  const osm=document.createElement('div'); osm.id='osmAttr'; osm.textContent='© colaboradores de OpenStreetMap';
  osm.style.cssText='position:fixed;right:18px;bottom:calc(220px + env(safe-area-inset-bottom,0px));z-index:5;font:11px system-ui,sans-serif;color:rgba(242,230,200,.85);text-shadow:0 1px 2px #000;pointer-events:none;display:none';
  document.body.appendChild(osm);
  setInterval(()=>{ const on=typeof W!=='undefined'&&W&&W.osm&&['play','spectate','deploy','paused','brief'].includes(state); osm.style.display=on?'block':'none';
    if(on&&document.body.classList.contains('movil')){ osm.style.bottom='auto'; osm.style.top='124px'; osm.style.right='10px'; } },700);
})();
