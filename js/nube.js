/* ---------- Cuentas (Google o mail con contraseña) y progreso en la nube con Firebase ---------- */
// Sin cuenta se juega igual: el progreso queda en este navegador (tw2_progress).
// Con cuenta (Google, mail aunque no esté verificado, o la cuenta invisible anónima que se crea sola) se guarda en Firestore (jugadores/<uid>: solo lo lee y escribe su dueño, ver reglas)
// y en este navegador en tw2_progress@<uid>, para que dos cuentas en la misma compu no se mezclen.
const nube={on:false,user:null,ok:false,vista:null,msg:'',ocupado:false,timer:0,local:null};
try{ if(typeof firebase!=='undefined'&&typeof FIREBASE_CONFIG!=='undefined'){ firebase.initializeApp(FIREBASE_CONFIG); firebase.auth().languageCode='es'; nube.on=true; } }catch(e){ nube.on=false; }
const nubeDoc=()=>firebase.firestore().collection('jugadores').doc(nube.user.uid);
const escH=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const progDe=s=>{ try{ const P=JSON.parse(s||'null'); return P&&P.v===PROG_V?P:null; }catch(e){ return null; } };
const progJugado=s=>{ const P=progDe(s); return P?((P.stats&&P.stats.battles)||0)+Object.keys(P.camp||{}).length:0; };
const progT=s=>{ const P=progDe(s); return (P&&P.t)||0; };
const leerLS=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } };
const nubeAnon=()=>!!(nube.user&&nube.user.isAnonymous);
const nubeNombre=()=>nube.user?(nube.user.displayName||String(nube.user.email||'').split('@')[0]||(typeof netName!=='undefined'&&netName)||'Jugador'):'';

// Recarga el progreso de la clave actual y redibuja el menú si se está viendo (sin cortar una sala online)
function nubeCargarLocal(){ loadProg(); if(state==='menu'&&!net.on) mainMenu(); else nubeChip(); }
function nubeUsarClave(k){ if(PROG_KEY!==k){ PROG_KEY=k; nubeCargarLocal(); } else nubeChip(); }

async function nubeSesion(u){
  nube.user=u; nube.ok=false; clearTimeout(nube.timer); nube.timer=0;
  if(!u){ nubeUsarClave('tw2_progress'); nubeVista(); nubeInvisible(); return; }
  // con el mail sin verificar también se guarda en la nube (antes quedaba solo en el navegador y se podía perder; 25/11/2026)
  if(!u.isAnonymous&&!u.emailVerified&&nube.vista) nube.vista='verificar';
  if(!netName&&!u.isAnonymous) netName=cleanName(nubeNombre());
  // la clave de la cuenta se usa recién cuando llegó lo de la nube: si el juego guardaba mientras tanto, pisaba la cuenta con el progreso
  // sin cuenta (o vacío) más nuevo y eso se subía (así se perdió el progreso de Sebastián)
  const KEY='tw2_progress@'+u.uid; nube.msg='Cargando tu progreso…'; nubeChip(); nubeVista();
  let remoto=null;
  try{ const s=await nubeDoc().get(); remoto=s.exists?(s.data().prog||null):null; nube.ant=s.exists?(s.data().ant||null):null; nube.mejor=s.exists?(s.data().mejor||null):null; nube.base=progT(remoto); }
  catch(e){ if(nube.user!==u) return; { const inv=leerLS('tw2_progress'); if(!leerLS(KEY)&&progJugado(inv)>0) try{ localStorage.setItem(KEY,inv); }catch(_){} }   // sin la nube y sin nada de la cuenta acá: se sigue con lo de este navegador (no con uno vacío)
    PROG_KEY=KEY; nube.msg='No se pudo conectar. Tu progreso se guarda en este navegador y se sube la próxima vez que entres.'; nubeCargarLocal(); nubeVista(); return; }
  if(nube.user!==u) return; // cerró sesión mientras cargaba
  PROG_KEY=KEY; const cache=leerLS(PROG_KEY);
  // gana el que tiene más batallas jugadas (nunca bajan); si empatan, el más nuevo
  if(remoto&&cache&&progJugado(remoto)!==progJugado(cache)){ const keep=progJugado(remoto)>progJugado(cache)?remoto:cache, other=keep===remoto?cache:remoto;
    try{ localStorage.setItem(PROG_KEY+'#copia',other); localStorage.setItem(PROG_KEY,keep); }catch(e){} nube.ok=true; nube.msg=''; nubeRegaloAviso(); if(['menu','mail-entrar','mail-crear','olvide'].includes(nube.vista)) nube.vista=null; nubeCargarLocal(); if(keep===cache) saveProg(); nubeVista(); return; }
  nube.ok=true; nube.msg=''; nubeRegaloAviso();
  if(['menu','mail-entrar','mail-crear','olvide'].includes(nube.vista)||(nube.vista==='verificar'&&u.emailVerified)) nube.vista=null;
  if(remoto&&progT(remoto)>=progT(cache)){ try{ localStorage.setItem(PROG_KEY,remoto); }catch(e){} nubeCargarLocal(); }
  else if(remoto||cache){ nubeCargarLocal(); saveProg(); } // lo de este navegador es más nuevo: se sube
  else { // cuenta sin progreso: se ofrece pasarle el que hay en este navegador sin cuenta
    const inv=leerLS('tw2_progress'); nubeCargarLocal();
    if(progJugado(inv)>0&&u.isAnonymous){ try{ localStorage.setItem(PROG_KEY,inv); }catch(e){} nubeCargarLocal(); saveProg(); }   // cuenta invisible: se lleva lo de este navegador sin preguntar
    else if(progJugado(inv)>0){ nube.local=inv; nube.vista='pasar'; } else saveProg();
  }
  nubeVista();
}

// Se llama desde saveProg: junta los cambios y sube uno solo cada 1,5 s
function nubeGuardar(){ recGuardar(); if(!nube.ok) return; clearTimeout(nube.timer); nube.timer=setTimeout(nubeSubir,1500); }

// ---- Doble experiencia de regalo (25/11/2026, pedido de Sebastián: compensación a Alexis por el progreso perdido) ----
// Duplica los PI de la batalla (y con ellos la experiencia de cada tanque, que sale de los PI) hasta la fecha.
const REGALO_XP={'8IK4eYU8NAYg6V0qzBDYpHrzjdg1':{k:2,hasta:Date.parse('2026-11-29T00:00:00-03:00'),txt:'hasta el sábado 28/11'}};
const regaloXP=()=>{ const u=nube.user, R=u&&REGALO_XP[u.uid]; return R&&Date.now()<R.hasta?R:null; };
{ const _br=battleReward; battleReward=function(){ const r=_br.apply(this,arguments); const R=regaloXP(); if(R&&r) r.rp=Math.round(r.rp*R.k); return r; }; }
let regaloVisto=false;
function nubeRegaloAviso(){ const R=regaloXP(); if(!R||regaloVisto) return; regaloVisto=true;
  setTimeout(()=>{ try{ banner('⚡ Doble experiencia',`Regalo por el progreso que se perdió: ${R.txt}`,5); }catch(e){} },2500); }

// ---- Código de recuperación sin mail (25/11/2026, pedido de Sebastián) ----
// PROG.rec={c,p}: código de jugador (6 letras/números) + PIN (4 números). El progreso se copia en Firestore recup/<sha256("tw2:"+código+":"+PIN)>
// ({prog,t,n}; se lee sin cuenta sabiendo el código y el PIN). En otro dispositivo, "Tengo un código" lo junta con el que hay ahí y desde
// entonces los dos guardan en el mismo lugar (se juntan como dos dispositivos de la misma cuenta).
const REC_ABC='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const recTxt=r=>r?`TW-${r.c} · PIN ${r.p}`:'';
async function recId(c,p){ const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('tw2:'+String(c).toUpperCase()+':'+String(p)));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''); }
const recDoc=id=>firebase.firestore().collection('recup').doc(id);
const rec={timer:0,base:0,id:'',key:''};
function recNuevo(){ const R=new Uint32Array(10); crypto.getRandomValues(R); let c=''; for(let i=0;i<6;i++) c+=REC_ABC[R[i]%REC_ABC.length];
  return {c,p:String(1000+R[6]%9000)}; }
function recGuardar(){ try{ if(!nube.on||!PROG||!PROG.rec||!window.crypto||!crypto.subtle) return; clearTimeout(rec.timer); rec.timer=setTimeout(recSubir,2500); }catch(e){} }
async function recSubir(){ clearTimeout(rec.timer); rec.timer=0; if(!PROG||!PROG.rec) return;
  const key=PROG.rec.c+PROG.rec.p; if(rec.key!==key){ rec.key=key; rec.id=await recId(PROG.rec.c,PROG.rec.p); rec.base=0; }
  const ref=recDoc(rec.id); let adopt=null;
  return firebase.firestore().runTransaction(async tx=>{ adopt=null; const s=await tx.get(ref), R=progDe(s.exists?s.data().prog:null);
      let mine=JSON.parse(JSON.stringify(PROG));
      if(R&&((R.t||0)>rec.base||progBat(R)>progBat(mine)+.5)){ mine=progBat(R)>progBat(mine)?progMerge(R,mine):progMerge(mine,R); mine.rec=PROG.rec; mine.t=Date.now(); adopt=mine; }
      tx.set(ref,{prog:JSON.stringify(mine),n:String(nubeNombre()||netName||'Jugador').slice(0,40),t:firebase.firestore.FieldValue.serverTimestamp()});
      return mine; })
    .then(m=>{ rec.base=m.t; if(adopt){ PROG=adopt; try{ localStorage.setItem(PROG_KEY,JSON.stringify(adopt)); }catch(e){} if(nube.ok) nubeGuardar(); if(state==='menu'&&!net.on) mainMenu(); } })
    .catch(e=>console.warn('código de recuperación',e&&e.code)); }
// "Tengo un código": trae el progreso del código y lo junta con el de acá
async function recUsar(c,p){ c=String(c||'').toUpperCase().replace(/^TW-?/,'').replace(/[^A-Z0-9]/g,''); p=String(p||'').replace(/\D/g,'');
  if(c.length!==6||p.length!==4) throw new Error('formato');
  const s=await recDoc(await recId(c,p)).get(), R=s.exists?progDe(s.data().prog):null; if(!R) throw new Error('no');
  const M=progBat(R)>=progBat(PROG)?progMerge(R,PROG):progMerge(PROG,R); M.rec={c,p}; M.t=Date.now();
  try{ localStorage.setItem(PROG_KEY+'#copia',JSON.stringify(PROG)); }catch(e){}
  PROG=M; rec.key=''; saveProg(); loadProg(); if(nube.ok) nubeSubir(); return R; }
// Juntar dos progresos de la misma cuenta (por ejemplo, la compu y el celular abiertos a la vez): la base es el de más batallas y del otro
// se suma todo lo investigado, comprado, los PI de cada tanque y las misiones; así nunca se pierde un tanque comprado.
function progMerge(A,B){ const M=JSON.parse(JSON.stringify(A));
  for(const k of ['unlocked','owned','camp']){ M[k]=M[k]||{}; for(const x in (B[k]||{})) if(!M[k][x]) M[k][x]=B[k][x]; }
  if(!M.rec&&B.rec) M.rec=B.rec;   // el código de recuperación no se pierde al juntar
  M.rp=M.rp||{}; for(const x in (B.rp||{})) if(!M.unlocked[x]) M.rp[x]=Math.max(M.rp[x]||0,B.rp[x]); for(const x in M.rp) if(M.unlocked[x]) delete M.rp[x];
  return M; }
// Subir: dentro de una transacción se mira lo que hay en la nube. Si otro dispositivo guardó algo después de que este lo cargó, se juntan
// los dos en vez de pisarlo; lo anterior queda en el campo "ant" (una copia en la nube por si acaso).
function nubeSubir(){ clearTimeout(nube.timer); nube.timer=0; if(!nube.ok||!PROG) return;
  const u=nube.user, ref=nubeDoc(); let adopt=null;
  return firebase.firestore().runTransaction(async tx=>{ adopt=null; const s=await tx.get(ref), D=s.exists?s.data():{}, rem=D.prog||null, R=progDe(rem);
      let mine=JSON.parse(JSON.stringify(PROG));
      if(R&&(R.t||0)>(nube.base||0)){ mine=progBat(R)>progBat(mine)?progMerge(R,mine):progMerge(mine,R); mine.t=Date.now(); adopt=mine; }   // otro dispositivo guardó: se juntan
      // nunca se pisa la nube con un progreso de menos batallas (25/11/2026, se perdió el de Alexis): se juntan con base en el de la nube
      else if(R&&progBat(R)>progBat(mine)+.5){ mine=progMerge(R,mine); mine.t=Date.now(); adopt=mine; nube.recup=progBat(R); }
      // respaldo: el progreso con más batallas que pasó por la nube (Recuperar progreso → "Mejor versión en la nube")
      const ms=JSON.stringify(mine); let mejor=progDe(D.mejor)?D.mejor:null;
      for(const c of [rem,ms]) if(progDe(c)&&progBat(progDe(c))>=progBat(progDe(mejor))) mejor=c;
      tx.set(ref,{prog:ms,ant:rem||null,mejor:mejor||null,nombre:nubeNombre(),actualizado:firebase.firestore.FieldValue.serverTimestamp()}); nube.mejor=mejor;
      return mine; })
    .then(m=>{ if(nube.user!==u) return; nube.base=m.t;
      if(adopt){ try{ localStorage.setItem(PROG_KEY,JSON.stringify(adopt)); }catch(e){} PROG=adopt; if(state==='menu'&&!net.on) mainMenu();
        if(nube.recup){ nube.recup=0; try{ banner('Progreso recuperado','Lo de la nube tenía más batallas: lo juntamos con este',3); }catch(e){} } } })
    .catch(()=>{}); } // si falla queda en este navegador y se reintenta en el próximo guardado
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden'&&nube.timer) nubeSubir(); });

const NUBE_ERR={'auth/invalid-credential':'Mail o contraseña incorrectos.','auth/wrong-password':'Mail o contraseña incorrectos.','auth/user-not-found':'No hay ninguna cuenta con ese mail.',
  'auth/email-already-in-use':'Ya hay una cuenta con ese mail. Entrá con tu contraseña o con Google.','auth/weak-password':'La contraseña tiene que tener al menos 6 caracteres.',
  'auth/invalid-email':'Ese mail no es válido.','auth/missing-password':'Escribí la contraseña.','auth/too-many-requests':'Demasiados intentos. Esperá un rato y probá de nuevo.',
  'auth/network-request-failed':'Sin conexión. Revisá internet y probá de nuevo.','auth/popup-closed-by-user':'','auth/cancelled-popup-request':'',
  'auth/account-exists-with-different-credential':'Ese mail ya tiene una cuenta con otro método. Entrá como la creaste.','auth/provider-already-linked':'Esta cuenta ya tiene ese método.','auth/credential-already-in-use':'Ese mail ya tiene una cuenta. Entrá con tu contraseña.','auth/unauthorized-domain':'Este sitio no está autorizado para iniciar sesión.'};
const nubeErr=e=>e&&e.code in NUBE_ERR?NUBE_ERR[e.code]:'Algo falló. Probá de nuevo.';
async function nubeAccion(f){ if(nube.ocupado) return; nube.ocupado=true; nube.msg=''; nubeVista();
  try{ await f(); }catch(e){ nube.msg=nubeErr(e); }
  nube.ocupado=false; nubeVista(); }
const nubeAuth=()=>firebase.auth();
function nubeGoogle(){ nubeAccion(async()=>{ const P=new firebase.auth.GoogleAuthProvider(); P.setCustomParameters({prompt:'select_account'});
  const cur=nubeAuth().currentUser;
  if(cur&&cur.isAnonymous){   // cuenta invisible: se le agrega Google y sigue siendo la misma cuenta, con su progreso
    try{ const r=await cur.linkWithPopup(P); await nubeVinculada(r.user); return; }
    catch(e){ if(e.code==='auth/credential-already-in-use'&&e.credential){ nubeGuardarInvisible(); return nubeAuth().signInWithCredential(e.credential); }   // ese Google ya tenía cuenta: se entra a esa
      if(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment') return cur.linkWithRedirect(P); throw e; } }
  try{ await nubeAuth().signInWithPopup(P); }
  catch(e){ if(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment') return nubeAuth().signInWithRedirect(P); throw e; } }); }
// Después de vincular la cuenta invisible: nombre y redibujar (onAuthStateChanged no vuelve a llamar porque es el mismo usuario)
async function nubeVinculada(u){ const pd=(u.providerData||[]).find(p=>p&&p.displayName);
  if(!u.displayName&&pd) try{ await u.updateProfile({displayName:cleanName(pd.displayName)||pd.displayName}); }catch(e){}
  nube.user=nubeAuth().currentUser||u; if(nube.ok) nubeSubir(); nube.vista=nube.user.emailVerified?'cuenta':'verificar'; nube.msg='Listo: tu progreso quedó en esta cuenta.'; nubeVista(); }
// Antes de pasar de la cuenta invisible a otra que ya existía: lo de la invisible queda como "Sin cuenta" en este navegador (Recuperar progreso)
function nubeGuardarInvisible(){ try{ if(PROG&&progJugado(JSON.stringify(PROG))>progJugado(leerLS('tw2_progress'))) localStorage.setItem('tw2_progress',JSON.stringify(PROG)); }catch(e){} }
// Sin sesión: se entra solo con una cuenta invisible (Firebase anónimo) para que el progreso también quede en la nube.
// Si el proveedor Anónimo no está habilitado en Firebase, falla callado y se sigue como antes (solo en el navegador).
let nubeAnonTry=0;
function nubeInvisible(){ if(!nube.on||nubeAnonTry>=2||leerLS('tw2_sinAnon')==='1'||(typeof PLATAFORMA!=='undefined'&&PLATAFORMA.id!=='web')) return; nubeAnonTry++;
  nubeAuth().signInAnonymously().catch(e=>{ console.warn('cuenta invisible',e&&e.code); }); }
const campo=n=>{ const el=document.querySelector(`#acct [name="${n}"]`); return el?el.value.trim():''; };
const NUBE_FORM={
  'mail-entrar':()=>nubeAccion(()=>{ if(nubeAnon()) nubeGuardarInvisible(); return nubeAuth().signInWithEmailAndPassword(campo('mail'),campo('pass')); }),
  'mail-crear':()=>nubeAccion(async()=>{ const nom=cleanName(campo('nombre'));
    if(!nom){ nube.msg='Elegí un nombre de jugador (letras y números).'; return; }
    const cur=nubeAuth().currentUser; let r;
    if(cur&&cur.isAnonymous) r=await cur.linkWithCredential(firebase.auth.EmailAuthProvider.credential(campo('mail'),campo('pass')));   // misma cuenta, mismo progreso
    else r=await nubeAuth().createUserWithEmailAndPassword(campo('mail'),campo('pass'));
    await r.user.updateProfile({displayName:nom}); await r.user.sendEmailVerification(); nube.user=nubeAuth().currentUser||r.user; if(nube.ok) nubeSubir(); nube.vista='verificar'; }),
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
  salir:()=>nubeAccion(async()=>{ if(nube.timer) await nubeSubir(); nube.vista=null; try{ localStorage.setItem('tw2_sinAnon','1'); }catch(e){} await nubeAuth().signOut(); }),
  pasar:()=>{ try{ localStorage.setItem(PROG_KEY,nube.local); }catch(e){} nube.local=null; nube.vista=null; nubeCargarLocal(); saveProg(); nubeVista(); },
  cero:()=>{ if(!confirm('¿Seguro? El progreso de este navegador no pasa a tu cuenta (queda en Ajustes → Recuperar progreso).')) return; nube.local=null; nube.vista=null; saveProg(); nubeVista(); }
};

// Botón de la cuenta en la pantalla de inicio
function nubeChip(){ const b=$('acctB'); if(!b) return; b.hidden=!nube.on;
  const u=nube.user; b.textContent=u&&u.isAnonymous?'Iniciar sesión':u&&u.emailVerified?'👤 '+nubeNombre():u?'Verificá tu mail':'Iniciar sesión';
  b.title=u&&u.isAnonymous?'Tu progreso ya se guarda en la nube. Entrá con Google o mail para usarlo en otros dispositivos':u&&u.emailVerified?(nube.ok?'Tu progreso se guarda en la nube':'Cargando tu progreso…'):'Guardá tu progreso en la nube'; }
function nubeAbrir(){ const u=nube.user; nube.msg=''; nube.vista=u&&!u.isAnonymous?(u.emailVerified?'cuenta':'verificar'):'menu'; nubeVista(); }

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
    menu:()=>`<h2>Tu cuenta</h2><p class="s">${nubeAnon()&&nube.ok?'Tu progreso ya se guarda en la nube, sin mail. Entrá con Google o con mail para usarlo en cualquier compu o celular (no perdés nada). Sin mail, usá el código de Ajustes → Recuperar progreso.':'Entrá para guardar tu progreso en la nube y seguir jugando desde cualquier compu. Sin cuenta, el progreso queda solo en este navegador.'}</p>
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
  nubeAuth().getRedirectResult().then(r=>{ if(r&&r.user&&r.operationType==='link') nubeVinculada(r.user); }).catch(e=>{ nube.msg=nubeErr(e); nube.vista='menu'; nubeVista(); });
  nubeAuth().onAuthStateChanged(u=>{ if(u&&!u.isAnonymous) try{ localStorage.removeItem('tw2_sinAnon'); }catch(e){} });
  nubeAuth().onAuthStateChanged(nubeSesion);
}

// ---- Recuperar progreso (Ajustes): lista los progresos guardados en este navegador (sin cuenta, de cada cuenta y sus copias) ----
function progGuardados(){ const L=[]; for(const [k,v] of [['nube#mejor',nube.mejor],['nube#ant',nube.ant]]){ const P=progDe(v); if(P) L.push({k,P,b:(P.stats&&P.stats.battles)||0,own:Object.keys(P.owned||{}).length,yp:P.yp||0,t:P.t||0}); } try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(!/^tw2_progress/.test(k)) continue; const P=progLS(k); if(!P) continue;
    L.push({k,P,b:(P.stats&&P.stats.battles)||0,own:Object.keys(P.owned||{}).length,yp:P.yp||0,t:P.t||0}); } }catch(e){}
  return L.sort((a,b)=>b.b-a.b||b.t-a.t); }
{ const _rs=renderSettings; renderSettings=function(){ const r=_rs.apply(this,arguments); const L=progGuardados().filter(x=>x.k!==PROG_KEY);
    const h=document.querySelector('#panel h2');
    if(h&&!$('recP')){ const nm=k=>k==='nube#mejor'?'Mejor versión en la nube':k==='nube#ant'?'Versión anterior en la nube':k==='tw2_progress'?'Sin cuenta':/#copia$/.test(k)?'Copia de seguridad'+(k.includes('@')?' (cuenta)':''):'Otra cuenta';
      const lista=L.length?L.map((x,i)=>`<div style="display:flex;gap:8px;align-items:center;margin:4px 0;flex-wrap:wrap"><span>${nm(x.k)} · ${x.b} batallas · ${x.own} tanques · ${ypTxt(x.yp)} ${YP}${x.t?' · '+new Date(x.t).toLocaleDateString('es-AR'):''}</span><button class="hgB" data-i="${i}">Usar este</button></div>`).join('')
        :'<div style="margin:4px 0;opacity:.8">No hay otros progresos guardados en este navegador. Si jugaste en otro celular o compu, abrí el juego ahí, tocá "Copiar mi progreso" y pegalo acá con "Pegar un progreso".</div>';
      h.insertAdjacentHTML('beforebegin',`<h2>Recuperar progreso</h2><div id="recP" class="note" style="margin-bottom:8px">Ahora tenés ${(PROG.stats&&PROG.stats.battles)||0} batallas${nube.user?` (cuenta ${escH(nubeNombre())})`:' (sin cuenta)'}.${lista}
        <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap"><button class="hgB" id="recCopy">📋 Copiar mi progreso</button><button class="hgB" id="recPaste">📥 Pegar un progreso</button></div>
        <div style="margin-top:8px">🔑 <b>Código de recuperación</b> (sin mail): ${PROG.rec?`<b id="recCode" style="font-size:1.15em;letter-spacing:.06em">${recTxt(PROG.rec)}</b><br><span style="opacity:.8">Anotalo: con el código y el PIN recuperás tu progreso en otro celular o compu.</span>`:'<span style="opacity:.8">Creá uno para recuperar tu progreso en otro dispositivo sin poner tu mail.</span>'}</div>
        <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">${PROG.rec?'':'<button class="hgB" id="recMk">🔑 Crear mi código</button>'}<button class="hgB" id="recHave">🔓 Tengo un código</button></div></div>`);
      const usar=(P,txt)=>{ if(!confirm(`¿Usar el progreso con ${(P.stats&&P.stats.battles)||0} batallas? El que tenés ahora queda como copia.`)) return;
        try{ localStorage.setItem(PROG_KEY+'#copia',JSON.stringify(PROG)); }catch(e){} PROG=JSON.parse(JSON.stringify(P)); saveProg(); loadProg(); if(nube.ok) nubeSubir(); renderSettings(); banner('Progreso recuperado',txt,2.5); };
      $('recP').querySelectorAll('button[data-i]').forEach(b=>b.onclick=()=>{ const x=L[+b.dataset.i]; usar(x.P,`${x.b} batallas`); });
      const mk=$('recMk'); if(mk) mk.onclick=()=>{ if(!nube.on){ alert('Hace falta internet para usar el código.'); return; } PROG.rec=recNuevo(); saveProg(); recSubir(); renderSettings(); };
      $('recHave').onclick=async()=>{ const c=(prompt('Código de jugador (por ejemplo TW-K7P3QX)')||'').trim(); if(!c) return; const p=(prompt('PIN (4 números)')||'').trim(); if(!p) return;
        try{ const R=await recUsar(c,p); renderSettings(); banner('Progreso recuperado',`${(R.stats&&R.stats.battles)||0} batallas`,2.5); }
        catch(e){ alert(e&&e.message==='formato'?'El código tiene 6 letras o números y el PIN 4 números.':e&&e.message==='no'?'No encontramos ese código con ese PIN. Revisalos.':'No se pudo conectar. Probá de nuevo.'); } };
      $('recCopy').onclick=()=>{ const code='TW2:'+btoa(unescape(encodeURIComponent(JSON.stringify(PROG))));
        (navigator.clipboard?navigator.clipboard.writeText(code):Promise.reject()).then(()=>banner('Copiado','Pegalo en el otro dispositivo',2.5)).catch(()=>prompt('Copiá este código:',code)); };
      $('recPaste').onclick=()=>{ const c=(prompt('Pegá el código del progreso (empieza con TW2:)')||'').trim(); if(!c) return;
        try{ const P=JSON.parse(decodeURIComponent(escape(atob(c.replace(/^TW2:/,''))))); if(!P||P.v!==PROG_V) throw 0; usar(P,`${(P.stats&&P.stats.battles)||0} batallas`); }catch(e){ alert('Ese código no sirve. Copialo de nuevo completo.'); } }; }
    return r; }; }
// aviso si al cargar se volvió a la copia de seguridad
setTimeout(()=>{ if(PROG&&PROG.recuperado){ delete PROG.recuperado; saveProg(); if(typeof banner==='function') banner('Progreso recuperado','Se había pisado y volvimos a tu copia',3); } },4000);
