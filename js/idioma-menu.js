// Selector de idioma: arriba de todo en Ajustes, y un botón chico "ES | EN" en el menú principal.
(function(){
  const L=window.LANG||'es';
  const btns=()=>`<div class="hgOpt" id="langR" data-notr><button class="${L==='es'?'sel':''}" data-v="es">Español</button><button class="${L==='en'?'sel':''}" data-v="en">English</button></div>`;
  const _rs=renderSettings;
  renderSettings=function(){ const r=_rs.apply(this,arguments); const h=document.querySelector('#panel .settings h1'); if(!h) return r;
    const d=document.createElement('div'); d.innerHTML=`<h2 data-notr>Idioma · Language</h2>${btns()}`; h.after(...d.childNodes);
    document.querySelectorAll('#langR button').forEach(b=>b.onclick=()=>{ if(b.dataset.v!==L) I18N.set(b.dataset.v); });
    return r; };
  // menú principal: botón para cambiar sin entrar a Ajustes
  const b=document.createElement('button'); b.id='langB'; b.setAttribute('data-notr',''); b.textContent=L==='en'?'🌐 Español':'🌐 English';
  b.style.cssText="position:fixed;right:calc(122px + env(safe-area-inset-right,0px));top:calc(22px + env(safe-area-inset-top,0px));z-index:30;font:600 13px 'Saira Condensed',system-ui,sans-serif;padding:6px 11px;border-radius:4px;border:1px solid rgba(232,200,120,.45);background:rgba(16,20,26,.75);color:#f2e6c8;cursor:pointer;display:none";
  b.onclick=()=>I18N.set(L==='en'?'es':'en'); document.body.appendChild(b);
  // se ubica a la izquierda de lo que ya está arriba a la derecha (⚙, cuenta, pantalla completa), así no se tapan
  const place=()=>{ const on=typeof state!=='undefined'&&state==='menu'&&document.body.classList.contains('home');   // solo en la portada: en el hangar tapaba las solapas de las naciones (está en Ajustes)
    b.style.display=on?'block':'none'; if(!on) return;
    let left=innerWidth, top=null, h=0;
    document.querySelectorAll('#fsBtn,.acctB,.setB').forEach(e=>{ if(e.hidden) return; const r=e.getBoundingClientRect();
      if(!r.width||r.top>90||r.left<innerWidth*.45) return; if(r.left<left){ left=r.left; } if(top===null||r.top<top){ top=r.top; h=r.height; } });
    if(top===null){ top=22; h=0; }
    b.style.right=(innerWidth-left+8)+'px'; b.style.top=(top+Math.max(0,(h-b.offsetHeight)/2))+'px'; };
  setInterval(place,400); addEventListener('resize',place);
})();
