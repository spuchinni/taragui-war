// "Dar opinión" (semana 4 del plan, pedido de Sebastián): botón en el menú principal, en el menú de Esc y en el resumen de la batalla.
// Formulario corto: cómo te pareció (1–5), qué es (error, idea, me gustó, otro), texto y contacto opcional.
// Se guarda en Firestore en `opiniones` (las reglas solo dejan crear, nadie lee desde el juego: Sebastián las ve en la consola de Firebase).
// Sin conexión o si falla, queda en el navegador (tw2_opin) y se manda sola la próxima vez que se abre el juego.
(function(){
  const EN=()=>window.LANG==='en';
  const LSg=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } }, LSs=(k,v)=>{ try{ localStorage.setItem(k,v); }catch(e){} };
  const VER=(()=>{ try{ const s=document.querySelector('script[src*="opinion.js"]'); return (s&&/[?&]v=([^&]+)/.exec(s.src)||[])[1]||''; }catch(e){ return ''; } })();
  const CATS=[['error','🐞','Algo anda mal','Something is broken'],['idea','💡','Una idea','An idea'],['bien','👍','Me gustó','I liked it'],['otro','💬','Otra cosa','Something else']];
  const st=document.createElement('style'); st.textContent=`
    #opBox{position:fixed;inset:0;z-index:66;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.75);padding:12px}
    #opBox .card{width:min(560px,96vw);max-height:92vh;overflow:auto;background:rgba(18,20,24,.97);border:2px solid #ffd24a;border-radius:14px;padding:16px 20px;color:#fff;font:600 17px 'Saira Condensed',system-ui,sans-serif}
    #opBox h2{margin:0 0 4px;font:800 28px 'Saira Condensed',system-ui,sans-serif;color:#ffd24a;text-align:center} #opBox .sub{text-align:center;color:#cfc6b0;margin:0 0 10px}
    #opBox .lbl{margin:10px 0 4px;color:#cfc6b0;font-size:15px;letter-spacing:.04em}
    #opBox .stars{display:flex;gap:6px;justify-content:center} #opBox .stars b{font-size:34px;cursor:pointer;filter:grayscale(1) opacity(.45);transition:transform .1s} #opBox .stars b.on{filter:none} #opBox .stars b:hover{transform:scale(1.15)}
    #opBox .cats{display:flex;flex-wrap:wrap;gap:6px;justify-content:center} #opBox .cats button{background:#2a2c30;border:1px solid #555;border-radius:18px;color:#fff;padding:5px 12px;font:600 16px 'Saira Condensed',system-ui,sans-serif;cursor:pointer}
    #opBox .cats button.on{background:#ffd24a;color:#111;border-color:#ffd24a}
    #opBox textarea,#opBox input{width:100%;box-sizing:border-box;background:#0e0f12;border:1px solid #555;border-radius:8px;color:#fff;padding:8px 10px;font:500 16px system-ui,sans-serif}
    #opBox textarea{height:110px;resize:vertical} #opBox .cnt{text-align:right;font-size:13px;color:#888}
    #opBox .row{display:flex;gap:10px;justify-content:center;margin-top:12px} #opBox .row button{min-width:150px}
    #opBox .msg{text-align:center;margin-top:8px;min-height:20px;color:#ffb0a0}
    #opBox .ok{text-align:center;font-size:20px;padding:20px 0} #opBox .ok b{display:block;font-size:44px}
    body.movil #opBox .card{zoom:.75}
    .opB{margin-left:14px}
    #opP{display:block;margin:10px auto 0;background:none;border:none;color:#cfc6b0;font:600 15px 'Saira Condensed',system-ui,sans-serif;cursor:pointer;text-decoration:underline}`;
  document.head.appendChild(st);
  const box=document.createElement('div'); box.id='opBox'; box.setAttribute('data-notr',''); document.body.appendChild(box);
  let lastSent=0;
  function ctx(){ let b=0; try{ b=(PROG&&PROG.stats&&PROG.stats.battles)||0; }catch(e){}
    return {v:VER.slice(0,20), b:Math.min(99999,b|0), e:(typeof curEra!=='undefined'?curEra|0:0), m:String((typeof builtKey!=='undefined'&&builtKey)||'').slice(0,32),
      tk:String((typeof player!=='undefined'&&player&&player.T&&player.T.label)||'').slice(0,40), mov:typeof MOVIL!=='undefined'&&!!MOVIL, lang:EN()?'en':'es',
      ua:String(navigator.userAgent||'').slice(0,160), w:innerWidth|0, h:innerHeight|0}; }
  // cola local: lo que no se pudo mandar
  const qGet=()=>{ try{ return JSON.parse(LSg('tw2_opin')||'[]'); }catch(e){ return []; } }, qSet=a=>LSs('tw2_opin',JSON.stringify(a.slice(-10)));
  function send(d){ if(!(window.nube&&nube.on&&window.firebase&&firebase.firestore)||!navigator.onLine) return Promise.reject(new Error('sin red'));
    const doc=Object.assign({},d,{t:firebase.firestore.FieldValue.serverTimestamp()});
    return Promise.race([firebase.firestore().collection('opiniones').add(doc),new Promise((_,r)=>setTimeout(()=>r(new Error('tiempo')),9000))]); }
  function flush(){ const q=qGet(); if(!q.length) return; const d=q[0]; send(d).then(()=>{ qSet(qGet().slice(1)); setTimeout(flush,1500); }).catch(()=>{}); }
  setTimeout(flush,8000);

  function open(from){ const en=EN(); let rate=0, cat='';
    if(document.pointerLockElement) try{ document.exitPointerLock(); }catch(e){}
    box.innerHTML=`<div class="card"><h2>${en?'Give feedback':'Dar opinión'}</h2><p class="sub">${en?'Read by the developer. Thanks for helping make TaraWar better!':'Lo lee el que hace el juego. ¡Gracias por ayudar a mejorar TaraWar!'}</p>
      <div class="lbl">${en?'How do you like the game?':'¿Qué te parece el juego?'}</div><div class="stars">${[1,2,3,4,5].map(i=>`<b data-r="${i}">⭐</b>`).join('')}</div>
      <div class="lbl">${en?'What is it about?':'¿De qué se trata?'}</div><div class="cats">${CATS.map(c=>`<button data-c="${c[0]}">${c[1]} ${en?c[3]:c[2]}</button>`).join('')}</div>
      <div class="lbl">${en?'Tell us (what happened, where, what you would change)':'Contanos (qué pasó, dónde, qué cambiarías)'}</div><textarea id="opT" maxlength="1500"></textarea><div class="cnt" id="opN">0 / 1500</div>
      <div class="lbl">${en?'Contact, if you want a reply (optional): email, Instagram…':'Contacto si querés respuesta (opcional): mail, Instagram…'}</div><input id="opC" maxlength="120">
      <div class="msg" id="opM"></div>
      <div class="row"><button class="go" id="opS">${en?'Send':'Enviar'}</button><button class="go alt" id="opX">${en?'Cancel':'Cancelar'}</button></div></div>`;
    box.style.display='flex';
    const stars=[...box.querySelectorAll('.stars b')], paint=()=>stars.forEach(s=>s.classList.toggle('on',+s.dataset.r<=rate));
    stars.forEach(s=>s.onclick=()=>{ rate=+s.dataset.r; paint(); });
    box.querySelectorAll('.cats button').forEach(b=>b.onclick=()=>{ cat=b.dataset.c; box.querySelectorAll('.cats button').forEach(x=>x.classList.toggle('on',x===b)); });
    const T=box.querySelector('#opT'), N=box.querySelector('#opN'), M=box.querySelector('#opM');
    T.oninput=()=>{ N.textContent=T.value.length+' / 1500'; }; setTimeout(()=>{ try{ T.focus(); }catch(e){} },50);
    box.querySelectorAll('textarea,input').forEach(el=>el.addEventListener('keydown',e=>e.stopPropagation()));   // que no manejen el tanque mientras escriben
    const close=()=>{ box.style.display='none'; if(from==='pause'&&state==='paused'&&typeof pausePanel==='function') pausePanel(); };
    box.querySelector('#opX').onclick=close;
    box.querySelector('#opS').onclick=()=>{ const txt=T.value.trim();
      if(!rate&&!txt){ M.textContent=en?'Pick the stars or write something.':'Elegí las estrellas o escribí algo.'; return; }
      if(Date.now()-lastSent<30000){ M.textContent=en?'Wait a few seconds before sending another one.':'Esperá unos segundos para mandar otra.'; return; }
      lastSent=Date.now();
      const d=Object.assign({r:rate,c:cat||'otro',x:txt.slice(0,1500),k:box.querySelector('#opC').value.trim().slice(0,120),de:from||'menu'},ctx());
      const done=sent=>{ box.querySelector('.card').innerHTML=`<div class="ok"><b>🙌</b>${sent?(en?'Sent. Thank you!':'¡Enviado, gracias!'):(en?'Saved: it will be sent when you are online.':'Guardado: se manda solo cuando haya conexión.')}</div><div class="row"><button class="go" id="opX2">${en?'Close':'Cerrar'}</button></div>`;
        box.querySelector('#opX2').onclick=close; };
      M.textContent=en?'Sending…':'Enviando…';
      send(d).then(()=>done(true)).catch(()=>{ const q=qGet(); q.push(d); qSet(q); done(false); }); };
  }
  window.darOpinion=open;
  // menú principal: al lado de Novedades
  const _mm=mainMenu; mainMenu=function(){ const r=_mm.apply(this,arguments);
    try{ const cp=document.querySelector('.homeCopy'); if(cp&&!document.getElementById('opB')){ const b=document.createElement('button'); b.className='introL opB'; b.id='opB'; b.setAttribute('data-notr','');
      b.textContent=`💬 ${EN()?'Give feedback':'Dar opinión'}`; b.onclick=()=>open('menu'); const nb=document.getElementById('novB'); if(nb) nb.after(b); else cp.prepend(b); } }catch(e){}
    return r; };
  // menú de Esc en la batalla
  const _pp=pausePanel; pausePanel=function(){ const r=_pp.apply(this,arguments);
    try{ const p=$('panel'); if(p&&!document.getElementById('opP')){ const b=document.createElement('button'); b.id='opP'; b.setAttribute('data-notr',''); b.textContent=`💬 ${EN()?'Give feedback':'Dar opinión'}`; b.onclick=()=>open('pause'); p.appendChild(b); } }catch(e){}
    return r; };
  // resumen de la batalla
  const _su=summary; summary=function(){ const r=_su.apply(this,arguments);
    try{ const p=$('panel'); if(p&&!document.getElementById('opP')&&!tut){ const b=document.createElement('button'); b.id='opP'; b.setAttribute('data-notr',''); b.textContent=`💬 ${EN()?'What did you think? Give feedback':'¿Qué te pareció? Dar opinión'}`; b.onclick=()=>open('resumen'); p.appendChild(b); } }catch(e){}
    return r; };
})();
