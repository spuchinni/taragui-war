/* ---------- Cuentas (Google o mail con contraseña) y progreso en la nube con Firebase ---------- */
// Sin cuenta se juega igual: el progreso queda en este navegador (tw2_progress).
// Con cuenta verificada se guarda en Firestore (jugadores/<uid>: solo lo lee y escribe su dueño, ver reglas)
// y en este navegador en tw2_progress@<uid>, para que dos cuentas en la misma compu no se mezclen.
const nube={on:false,user:null,ok:false,vista:null,msg:'',ocupado:false,timer:0,local:null};
try{ if(typeof firebase!=='undefined'&&typeof FIREBASE_CONFIG!=='undefined'){ firebase.initializeApp(FIREBASE_CONFIG); firebase.auth().languageCode='es'; nube.on=true; } }catch(e){ nube.on=false; }
const nubeDoc=()=>firebase.firestore().collection('jugadores').doc(nube.user.uid);
const escH=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const progDe=s=>{ try{ const P=JSON.parse(s||'null'); return P&&P.v===3?P:null; }catch(e){ return null; } };
const progJugado=s=>{ const P=progDe(s); return P?((P.stats&&P.stats.battles)||0)+Object.keys(P.camp||{}).length:0; };
const progT=s=>{ const P=progDe(s); return (P&&P.t)||0; };
const leerLS=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } };
const nubeNombre=()=>nube.user?(nube.user.displayName||String(nube.user.email||'').split('@')[0]||'Jugador'):'';

// Recarga el progreso de la clave actual y redibuja el menú si se está viendo (sin cortar una sala online)
function nubeCargarLocal(){ loadProg(); if(state==='menu'&&!net.on) mainMenu(); else nubeChip(); }
function nubeUsarClave(k){ if(PROG_KEY!==k){ PROG_KEY=k; nubeCargarLocal(); } else nubeChip(); }

async function nubeSesion(u){
  nube.user=u; nube.ok=false; clearTimeout(nube.timer); nube.timer=0;
  if(!u){ nubeUsarClave('tw2_progress'); nubeVista(); return; }
  if(!u.emailVerified){ nubeUsarClave('tw2_progress'); if(nube.vista) nube.vista='verificar'; nubeVista(); return; } // al abrir el juego no salta solo: lo avisa el botón
  if(!netName) netName=cleanName(nubeNombre());
  // la clave de la cuenta se usa recién cuando llegó lo de la nube: si el juego guardaba mientras tanto, pisaba la cuenta con el progreso
  // sin cuenta (o vacío) más nuevo y eso se subía (así se perdió el progreso de Sebastián)
  const KEY='tw2_progress@'+u.uid; nube.msg='Cargando tu progreso…'; nubeChip(); nubeVista();
  let remoto=null;
  try{ const s=await nubeDoc().get(); remoto=s.exists?(s.data().prog||null):null; nube.ant=s.exists?(s.data().ant||null):null; nube.base=progT(remoto); }
  catch(e){ if(nube.user!==u) return; PROG_KEY=KEY; nube.msg='No se pudo conectar. Tu progreso se guarda en este navegador y se sube la próxima vez que entres.'; nubeCargarLocal(); nubeVista(); return; }
  if(nube.user!==u) return; // cerró sesión mientras cargaba
  PROG_KEY=KEY; const cache=leerLS(PROG_KEY);
  // gana el que tiene más batallas jugadas (nunca bajan); si empatan, el más nuevo
  if(remoto&&cache&&progJugado(remoto)!==progJugado(cache)){ const keep=progJugado(remoto)>progJugado(cache)?remoto:cache, other=keep===remoto?cache:remoto;
    try{ localStorage.setItem(PROG_KEY+'#copia',other); localStorage.setItem(PROG_KEY,keep); }catch(e){} nube.ok=true; nube.msg=''; if(['menu','mail-entrar','mail-crear','olvide','verificar'].includes(nube.vista)) nube.vista=null; nubeCargarLocal(); if(keep===cache) saveProg(); nubeVista(); return; }
  nube.ok=true; nube.msg='';
  if(['menu','mail-entrar','mail-crear','olvide','verificar'].includes(nube.vista)) nube.vista=null;
  if(remoto&&progT(remoto)>=progT(cache)){ try{ localStorage.setItem(PROG_KEY,remoto); }catch(e){} nubeCargarLocal(); }
  else if(remoto||cache){ nubeCargarLocal(); saveProg(); } // lo de este navegador es más nuevo: se sube
  else { // cuenta sin progreso: se ofrece pasarle el que hay en este navegador sin cuenta
    const inv=leerLS('tw2_progress'); nubeCargarLocal();
    if(progJugado(inv)>0){ nube.local=inv; nube.vista='pasar'; } else saveProg();
  }
  nubeVista();
}

// Se llama desde saveProg: junta los cambios y sube uno solo cada 1,5 s
function nubeGuardar(){ if(!nube.ok) return; clearTimeout(nube.timer); nube.timer=setTimeout(nubeSubir,1500); }
// Juntar dos progresos de la misma cuenta (por ejemplo, la compu y el celular abiertos a la vez): la base es el de más batallas y del otro
// se suma todo lo investigado, comprado, los PI de cada tanque y las misiones; así nunca se pierde un tanque comprado.
function progMerge(A,B){ const M=JSON.parse(JSON.stringify(A));
  for(const k of ['unlocked','owned','camp']){ M[k]=M[k]||{}; for(const x in (B[k]||{})) if(!M[k][x]) M[k][x]=B[k][x]; }
  M.rp=M.rp||{}; for(const x in (B.rp||{})) if(!M.unlocked[x]) M.rp[x]=Math.max(M.rp[x]||0,B.rp[x]); for(const x in M.rp) if(M.unlocked[x]) delete M.rp[x];
  return M; }
// Subir: dentro de una transacción se mira lo que hay en la nube. Si otro dispositivo guardó algo después de que este lo cargó, se juntan
// los dos en vez de pisarlo; lo anterior queda en el campo "ant" (una copia en la nube por si acaso).
function nubeSubir(){ clearTimeout(nube.timer); nube.timer=0; if(!nube.ok||!PROG) return;
  const u=nube.user, ref=nubeDoc(); let adopt=null;
  return firebase.firestore().runTransaction(async tx=>{ adopt=null; const s=await tx.get(ref), rem=s.exists?(s.data().prog||null):null, R=progDe(rem);
      let mine=JSON.parse(JSON.stringify(PROG));
      if(R&&(R.t||0)>(nube.base||0)){ mine=progBat(R)>progBat(mine)?progMerge(R,mine):progMerge(mine,R); mine.t=Date.now(); adopt=mine; }   // otro dispositivo guardó: se juntan
      tx.set(ref,{prog:JSON.stringify(mine),ant:rem||null,nombre:nubeNombre(),actualizado:firebase.firestore.FieldValue.serverTimestamp()});
      return mine; })
    .then(m=>{ if(nube.user!==u) return; nube.base=m.t;
      if(adopt){ try{ localStorage.setItem(PROG_KEY,JSON.stringify(adopt)); }catch(e){} PROG=adopt; if(state==='menu'&&!net.on) mainMenu(); } })
    .catch(()=>{}); } // si falla queda en este navegador y se reintenta en el próximo guardado
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden'&&nube.timer) nubeSubir(); });

const NUBE_ERR={'auth/invalid-credential':'Mail o contraseña incorrectos.','auth/wrong-password':'Mail o contraseña incorrectos.','auth/user-not-found':'No hay ninguna cuenta con ese mail.',
  'auth/email-already-in-use':'Ya hay una cuenta con ese mail. Entrá con tu contraseña o con Google.','auth/weak-password':'La contraseña tiene que tener al menos 6 caracteres.',
  'auth/invalid-email':'Ese mail no es válido.','auth/missing-password':'Escribí la contraseña.','auth/too-many-requests':'Demasiados intentos. Esperá un rato y probá de nuevo.',
  'auth/network-request-failed':'Sin conexión. Revisá internet y probá de nuevo.','auth/popup-closed-by-user':'','auth/cancelled-popup-request':'',
  'auth/account-exists-with-different-credential':'Ese mail ya tiene una cuenta con otro método. Entrá como la creaste.','auth/unauthorized-domain':'Este sitio no está autorizado para iniciar sesión.'};
const nubeErr=e=>e&&e.code in NUBE_ERR?NUBE_ERR[e.code]:'Algo falló. Probá de nuevo.';
async function nubeAccion(f){ if(nube.ocupado) return; nube.ocupado=true; nube.msg=''; nubeVista();
  try{ await f(); }catch(e){ nube.msg=nubeErr(e); }
  nube.ocupado=false; nubeVista(); }
const nubeAuth=()=>firebase.auth();
function nubeGoogle(){ nubeAccion(async()=>{ const P=new firebase.auth.GoogleAuthProvider(); P.setCustomParameters({prompt:'select_account'});
  try{ await nubeAuth().signInWithPopup(P); }
  catch(e){ if(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment') return nubeAuth().signInWithRedirect(P); throw e; } }); }
const campo=n=>{ const el=document.querySelector(`#acct [name="${n}"]`); return el?el.value.trim():''; };
const NUBE_FORM={
  'mail-entrar':()=>nubeAccion(()=>nubeAuth().signInWithEmailAndPassword(campo('mail'),campo('pass'))),
  'mail-crear':()=>nubeAccion(async()=>{ const nom=cleanName(campo('nombre'));
    if(!nom){ nube.msg='Elegí un nombre de jugador (letras y números).'; return; }
    const r=await nubeAuth().createUserWithEmailAndPassword(campo('mail'),campo('pass'));
    await r.user.updateProfile({displayName:nom}); await r.user.sendEmailVerification(); nube.vista='verificar'; }),
  'olvide':()=>nubeAccion(async()=>{ await nubeAuth().sendPasswordResetEmail(campo('mail')); nube.msg='Listo: te mandamos un mail para elegir una contraseña nueva. Fijate también en spam.'; })
};
const NUBE_BTN={
  google:nubeGoogle, cerrar:()=>{ nube.vista=null; nube.msg=''; nubeVista(); },
  'mail-entrar':()=>{ nube.vista='mail-entrar'; nube.msg=''; nubeVista(); }, 'mail-crear':()=>{ nube.vista='mail-crear'; nube.msg=''; nubeVista(); },
  olvide:()=>{ nube.vista='olvide'; nube.msg=''; nubeVista(); }, volver:()=>{ nube.vista='menu'; nube.msg=''; nubeVista(); },
  verifique:()=>nubeAccion(async()=>{ const u=nubeAuth().currentUser; if(!u) return; await u.reload(); const u2=nubeAuth().currentUser;
    if(!u2.emailVerified){ nube.msg='Todavía no figura verificado. Abrí el enlace del mail y volvé a tocar el botón.'; return; }
    await u2.getIdToken(true); nubeSesion(u2); }),
  reenviar:()=>nubeAccion(async()=>{ await nubeAuth().currentUser.sendEmailVerification(); nube.msg='Te reenviamos el mail. Fijate también en spam.'; }),
  salir:()=>nubeAccion(async()=>{ if(nube.timer) await nubeSubir(); nube.vista=null; await nubeAuth().signOut(); }),
  pasar:()=>{ try{ localStorage.setItem(PROG_KEY,nube.local); }catch(e){} nube.local=null; nube.vista=null; nubeCargarLocal(); saveProg(); nubeVista(); },
  cero:()=>{ nube.local=null; nube.vista=null; saveProg(); nubeVista(); }
};

// Botón de la cuenta en la pantalla de inicio
function nubeChip(){ const b=$('acctB'); if(!b) return; b.hidden=!nube.on;
  const u=nube.user; b.textContent=u&&u.emailVerified?'👤 '+nubeNombre():u?'Verificá tu mail':'Iniciar sesión';
  b.title=u&&u.emailVerified?(nube.ok?'Tu progreso se guarda en la nube':'Cargando tu progreso…'):'Guardá tu progreso en la nube'; }
function nubeAbrir(){ const u=nube.user; nube.msg=''; nube.vista=u?(u.emailVerified?'cuenta':'verificar'):'menu'; nubeVista(); }

function nubeVista(){
  nubeChip();
  let box=$('acct');
  if(!box){ box=document.createElement('div'); box.id='acct'; document.body.appendChild(box);
    box.addEventListener('click',e=>{ if(e.target===box){ NUBE_BTN.cerrar(); return; } const b=e.target.closest('[data-a]'); if(b&&!nube.ocupado) NUBE_BTN[b.dataset.a](); });
    box.addEventListener('submit',e=>{ e.preventDefault(); const f=NUBE_FORM[e.target.dataset.f]; if(f) f(); }); }
  if(!nube.vista){ box.hidden=true; box.innerHTML=''; box.dataset.v=''; return; }
  const u=nube.user, dis=nube.ocupado?' disabled':'', msg=nube.msg?`<p class="aMsg" role="status">${escH(nube.msg)}</p>`:'';
  const gBtn=`<button class="go aG" data-a="google"${dis}><svg viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.7H9v3.3h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z"/><path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.7H.9v2.3A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.9 10.8a5.4 5.4 0 0 1 0-3.5V5H.9a9 9 0 0 0 0 8.1z"/><path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.5 1.4l2.6-2.6A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z"/></svg>Entrar con Google</button>`;
  const inp=(n,l,t,ac,extra='')=>`<label>${l}<input name="${n}" type="${t}" autocomplete="${ac}" required${extra}></label>`;
  const V={
    menu:()=>`<h2>Tu cuenta</h2><p class="s">Entrá para guardar tu progreso en la nube y seguir jugando desde cualquier compu. Sin cuenta, el progreso queda solo en este navegador.</p>
      ${gBtn}<button class="go alt aW" data-a="mail-entrar"${dis}>Entrar con mail y contraseña</button>${msg}<button class="aL" data-a="cerrar">Seguir sin cuenta</button>`,
    'mail-entrar':()=>`<h2>Entrar con mail</h2><form data-f="mail-entrar">${inp('mail','Mail','email','email')}${inp('pass','Contraseña','password','current-password')}
      <button class="go aW"${dis}>Entrar</button></form>${msg}<div class="aLs"><button class="aL" data-a="mail-crear">Crear cuenta con mail</button><button class="aL" data-a="olvide">Me olvidé la contraseña</button><button class="aL" data-a="volver">Volver</button></div>`,
    'mail-crear':()=>`<h2>Crear cuenta</h2><form data-f="mail-crear">${inp('nombre','Nombre de jugador','text','nickname',' maxlength="16"')}${inp('mail','Mail','email','email')}${inp('pass','Contraseña (mínimo 6 caracteres)','password','new-password',' minlength="6"')}
      <button class="go aW"${dis}>Crear cuenta</button></form><p class="s">Te vamos a mandar un mail para confirmar que es tuyo.</p>${msg}<div class="aLs"><button class="aL" data-a="mail-entrar">Ya tengo cuenta</button><button class="aL" data-a="volver">Volver</button></div>`,
    olvide:()=>`<h2>Recuperar contraseña</h2><form data-f="olvide">${inp('mail','Mail de tu cuenta','email','email')}<button class="go aW"${dis}>Mandarme el mail</button></form>${msg}<div class="aLs"><button class="aL" data-a="mail-entrar">Volver</button></div>`,
    verificar:()=>`<h2>Verificá tu mail</h2><p class="s">Te mandamos un mail a <b>${escH(u&&u.email)}</b>. Abrí el enlace y después tocá el botón. Si no lo ves, fijate en spam.</p>
      <button class="go aW" data-a="verifique"${dis}>Ya lo verifiqué</button><button class="go alt aW" data-a="reenviar"${dis}>Reenviar el mail</button>${msg}<div class="aLs"><button class="aL" data-a="salir">Cerrar sesión</button><button class="aL" data-a="cerrar">Seguir sin cuenta</button></div>`,
    cuenta:()=>`<h2>${escH(nubeNombre())}</h2><p class="s">${escH(u&&u.email)}<br>${nube.ok?'Tu progreso se guarda en la nube: entrá con esta cuenta en cualquier compu para seguir.':'Cargando tu progreso…'}</p>
      ${msg}<button class="go alt aW" data-a="salir"${dis}>Cerrar sesión</button><div class="aLs"><button class="aL" data-a="cerrar">Cerrar</button></div>`,
    pasar:()=>{ const P=progDe(nube.local)||{}; return `<h2>¿Pasamos tu progreso?</h2><p class="s">Este navegador tiene progreso de antes de entrar con tu cuenta (${(P.stats&&P.stats.battles)||0} batallas). ¿Lo pasamos a tu cuenta?</p>
      <button class="go aW" data-a="pasar">Pasar a mi cuenta</button><button class="go alt aW" data-a="cero">Empezar de cero</button>`; }
  };
  // Al redibujar la misma pantalla (cargando, error) se conservan los datos escritos
  const misma=box.dataset.v===nube.vista, vals={}; if(misma) box.querySelectorAll('input').forEach(i=>vals[i.name]=i.value);
  box.hidden=false; box.dataset.v=nube.vista; box.innerHTML=`<div class="aBox" role="dialog" aria-modal="true" aria-label="Tu cuenta">${V[nube.vista]()}</div>`;
  box.querySelectorAll('input').forEach(i=>{ if(vals[i.name]!=null) i.value=vals[i.name]; });
  const first=box.querySelector('input'); if(first&&!misma) first.focus();
}

if(nube.on){
  nubeAuth().getRedirectResult().catch(e=>{ nube.msg=nubeErr(e); nube.vista='menu'; nubeVista(); });
  nubeAuth().onAuthStateChanged(nubeSesion);
}

// ---- Recuperar progreso (Ajustes): lista los progresos guardados en este navegador (sin cuenta, de cada cuenta y sus copias) ----
function progGuardados(){ const L=[]; { const P=progDe(nube.ant); if(P) L.push({k:'nube#ant',P,b:(P.stats&&P.stats.battles)||0,own:Object.keys(P.owned||{}).length,yp:P.yp||0,t:P.t||0}); } try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(!/^tw2_progress/.test(k)) continue; const P=progLS(k); if(!P) continue;
    L.push({k,P,b:(P.stats&&P.stats.battles)||0,own:Object.keys(P.owned||{}).length,yp:P.yp||0,t:P.t||0}); } }catch(e){}
  return L.sort((a,b)=>b.b-a.b||b.t-a.t); }
{ const _rs=renderSettings; renderSettings=function(){ const r=_rs.apply(this,arguments); const L=progGuardados().filter(x=>x.k!==PROG_KEY);
    const h=document.querySelector('#panel h2');
    if(h&&!$('recP')){ const nm=k=>k==='nube#ant'?'Versión anterior en la nube':k==='tw2_progress'?'Sin cuenta':/#copia$/.test(k)?'Copia de seguridad'+(k.includes('@')?' (cuenta)':''):'Otra cuenta';
      const lista=L.length?L.map((x,i)=>`<div style="display:flex;gap:8px;align-items:center;margin:4px 0;flex-wrap:wrap"><span>${nm(x.k)} · ${x.b} batallas · ${x.own} tanques · ${ypTxt(x.yp)} ${YP}${x.t?' · '+new Date(x.t).toLocaleDateString('es-AR'):''}</span><button class="hgB" data-i="${i}">Usar este</button></div>`).join('')
        :'<div style="margin:4px 0;opacity:.8">No hay otros progresos guardados en este navegador. Si jugaste en otro celular o compu, abrí el juego ahí, tocá "Copiar mi progreso" y pegalo acá con "Pegar un progreso".</div>';
      h.insertAdjacentHTML('beforebegin',`<h2>Recuperar progreso</h2><div id="recP" class="note" style="margin-bottom:8px">Ahora tenés ${(PROG.stats&&PROG.stats.battles)||0} batallas${nube.user?` (cuenta ${escH(nubeNombre())})`:' (sin cuenta)'}.${lista}
        <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap"><button class="hgB" id="recCopy">📋 Copiar mi progreso</button><button class="hgB" id="recPaste">📥 Pegar un progreso</button></div></div>`);
      const usar=(P,txt)=>{ if(!confirm(`¿Usar el progreso con ${(P.stats&&P.stats.battles)||0} batallas? El que tenés ahora queda como copia.`)) return;
        try{ localStorage.setItem(PROG_KEY+'#copia',JSON.stringify(PROG)); }catch(e){} PROG=JSON.parse(JSON.stringify(P)); saveProg(); loadProg(); if(nube.ok) nubeSubir(); renderSettings(); banner('Progreso recuperado',txt,2.5); };
      $('recP').querySelectorAll('button[data-i]').forEach(b=>b.onclick=()=>{ const x=L[+b.dataset.i]; usar(x.P,`${x.b} batallas`); });
      $('recCopy').onclick=()=>{ const code='TW2:'+btoa(unescape(encodeURIComponent(JSON.stringify(PROG))));
        (navigator.clipboard?navigator.clipboard.writeText(code):Promise.reject()).then(()=>banner('Copiado','Pegalo en el otro dispositivo',2.5)).catch(()=>prompt('Copiá este código:',code)); };
      $('recPaste').onclick=()=>{ const c=(prompt('Pegá el código del progreso (empieza con TW2:)')||'').trim(); if(!c) return;
        try{ const P=JSON.parse(decodeURIComponent(escape(atob(c.replace(/^TW2:/,''))))); if(!P||P.v!==3) throw 0; usar(P,`${(P.stats&&P.stats.battles)||0} batallas`); }catch(e){ alert('Ese código no sirve. Copialo de nuevo completo.'); } }; }
    return r; }; }
// aviso si al cargar se volvió a la copia de seguridad
setTimeout(()=>{ if(PROG&&PROG.recuperado){ delete PROG.recuperado; saveProg(); if(typeof banner==='function') banner('Progreso recuperado','Se había pisado y volvimos a tu copia',3); } },4000);
