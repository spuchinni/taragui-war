// Juego sin conexión (service worker). La primera vez que se abre con internet guarda todo el juego en el navegador
// (lista en offline.json, la arma version.sh); después anda sin conexión: batallas con bots, campaña, tutorial.
// version.sh cambia V en cada versión: el navegador baja el service worker nuevo, guarda la versión nueva y borra la vieja.
const V='20261114-0313', CACHE='tw-'+V;

self.addEventListener('install',e=>{ self.skipWaiting();
  e.waitUntil((async()=>{ const c=await caches.open(CACHE);
    const L=await fetch('offline.json?v='+V,{cache:'no-store'}).then(r=>r.json()).catch(()=>[]);
    // de a uno: si falta un archivo no se pierde todo lo demás
    await Promise.all(L.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})));
  })()); });

self.addEventListener('activate',e=>{ e.waitUntil((async()=>{
  for(const k of await caches.keys()) if(k.startsWith('tw-')&&k!==CACHE) await caches.delete(k);
  await self.clients.claim(); })()); });

const guardar=(req,res)=>{ if(res&&(res.ok||res.type==='opaque')){ const r=res.clone(); caches.open(CACHE).then(c=>c.put(req,r)); } return res; };

self.addEventListener('fetch',e=>{ const req=e.request; if(req.method!=='GET') return;
  const u=new URL(req.url), local=u.origin===location.origin;
  if(local&&/\/version\.json$/.test(u.pathname)) return;                       // siempre de la red (aviso de versión nueva)
  if(local&&(req.mode==='navigate'||/\/(index\.html)?$/.test(u.pathname))){    // la página: de la red si hay, si no la guardada
    e.respondWith(fetch(req).then(r=>guardar(req,r)).catch(async()=>
      (await caches.match(req,{ignoreSearch:true}))||(await caches.match('index.html'))||(await caches.match('./'))));
    return; }
  if(!local&&!/fonts\.(googleapis|gstatic)\.com|www\.gstatic\.com\/firebasejs/.test(u.href)) return; // red (Firebase, PeerJS…)
  // scripts, sonidos, imágenes, mapas: lo guardado primero; si no está, de la red y se guarda
  e.respondWith((async()=>{ const hit=await caches.match(req); if(hit) return hit;
    try{ return guardar(req,await fetch(req)); }
    catch(err){ const viejo=await caches.match(req,{ignoreSearch:true}); if(viejo) return viejo; throw err; } })());
});
