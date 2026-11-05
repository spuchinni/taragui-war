// Idioma (pedido de Sebastián para CrazyGames: el juego tiene que arrancar en inglés). El juego está escrito en español;
// en vez de tocar cada texto del código, se traduce al mostrarse:
//  · los textos de la página (nodos de texto y los atributos title/placeholder/aria-label) con un MutationObserver;
//  · lo que se dibuja en canvas (minimapa, mira, carteles) envolviendo fillText/strokeText/measureText;
//  · alert/confirm/prompt y el título de la pestaña.
// El diccionario está en js/idioma-en.js: claves en español → inglés. Una clave con {} es un molde: "Recarga {} s" atrapa
// "Recarga 3.4 s"; cada parte atrapada se traduce también (así "Blanco: {}" traduce el nombre si está en el diccionario).
// En la salida, {} toma las partes en orden y {0} {1}… por número (para cambiar el orden en inglés).
// Idioma: tw2_lang (Ajustes → Idioma), ?lang=en|es; si no hay: en CrazyGames inglés, en la web según el navegador.
// I18N.miss junta lo que se mostró sin traducir (para ir completando el diccionario).
(function(){
  let L=null; try{ L=localStorage.getItem('tw2_lang'); }catch(e){}
  const q=location.search.match(/[?&]lang=(es|en)\b/); if(q) L=q[1];
  if(L!=='es'&&L!=='en') L=window.PLATAFORMA&&PLATAFORMA.id!=='web'?'en':(/^es\b/i.test(navigator.language||'es')?'es':'en');
  const D=new Map(), P=[], cache=new Map(), miss=new Set();
  const norm=s=>s.replace(/\s+/g,' ').trim();
  const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const ES_HINT=/[áéíóúñ¿¡]|\b(el|la|los|las|de|del|que|con|para|por|una?|tu|tus|sin|más|está|hay|punto|tanque|cañón)\b/i;
  function addPat(k,v){ const parts=k.split('{}'); if(parts.join('').replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ]/g,'').length<3) return;
    P.push({re:new RegExp('^'+parts.map(esc).join('([\\s\\S]+?)')+'$'),v,n:parts.length-1,lit:parts.join('').length}); }
  function fill(v,caps){ let i=0; return v.replace(/\{(\d*)\}/g,(m,d)=>{ const c=caps[d===''?i++:+d]; return c==null?'':tr(c); }); }
  const WD=[];
  function split(core){
    let mm=core.match(/^([·•,.:;()\-–—+✔✖▲▼]+\s*)([\s\S]+)$/); if(mm){ const t=tr(mm[2]); if(t!==mm[2]) return mm[1]+t; }      // "· Soldado"
    mm=core.match(/^([\s\S]+?)(\s*[:,.;)]?\s*[+\-]?[\d.,]+\s*(%|s|m|km\/h|PI|XP)?[.)]?)$/); if(mm&&/[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(mm[1])){ const t=tr(mm[1]); if(t!==mm[1]) return t+mm[2]; }   // "Aliados 400"
    for(const sep of [' · ',' — ',', ',' / ']){ if(!core.includes(sep)) continue; const a=core.split(sep); let ch=false;
      const b=a.map(x=>{ const y=tr(x); if(y!==x) ch=true; return y; }); if(ch) return b.join(sep); }
    const pm=core.match(/^(.+?) \((.+)\)$/); if(pm){ const a=tr(pm[1]), b=tr(pm[2]); if(a!==pm[1]||b!==pm[2]) return a+' ('+b+')'; }
    return null; }
  function tr(s){ if(L!=='en'||s==null) return s; s=String(s); if(!/[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(s)) return s;
    const hit=cache.get(s); if(hit!==undefined) return hit;
    const m=s.match(/^(\s*)([\s\S]*?)(\s*)$/), core=norm(m[2]); let r=D.get(core);
    if(r==null) for(const p of P){ const x=p.re.exec(core); if(x){ r=fill(p.v,x.slice(1)); break; } }        // P va de más texto fijo a menos: gana el molde más específico
    if(r==null) r=split(core);                                    // "Argentina · Medio · BR 3.7": se traduce cada parte
    if(r==null&&WD.length){ let w=core; for(const [re,v] of WD) w=w.replace(re,v); if(w!==core) r=w; }   // glosario de términos sueltos
    if(r==null){ r=core; if(ES_HINT.test(core)&&miss.size<3000) miss.add(core); }
    r=m[1]+r+m[3]; if(cache.size>8000) cache.clear(); cache.set(s,r); return r; }
  const I18N={lang:L,miss,t:tr,
    add(o){ if(L!=='en') return; for(const k in o){ const v=o[k]; if(k.includes('{}')) addPat(k,v); else D.set(norm(k),v); } P.sort((a,b)=>b.lit-a.lit); cache.clear(); },
    words(o){ if(L!=='en') return; for(const k in o) WD.push([new RegExp('(^|[^A-Za-zÁÉÍÓÚáéíóúñÑ])'+esc(k)+'(?=$|[^A-Za-zÁÉÍÓÚáéíóúñÑ])','g'),'$1'+o[k]]); WD.sort((a,b)=>b[0].source.length-a[0].source.length); cache.clear(); },
    set(l){ try{ localStorage.setItem('tw2_lang',l); }catch(e){} location.reload(); } };
  window.I18N=I18N; window.LANG=L; window.tr=tr;
  if(L!=='en') return;
  document.documentElement.lang='en';
  // ---- página ----
  const SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,CODE:1};
  const ATTR=['title','placeholder','aria-label'];
  function tNode(n){ if(n.__tr===n.data) return; const p=n.parentNode; if(!p||SKIP[p.nodeName]||(p.closest&&p.closest('[data-notr]'))) return;
    const o=n.data, r=tr(o); n.__tr=r; if(r!==o) n.data=r; }
  function tAttr(el){ for(const a of ATTR){ const v=el.getAttribute&&el.getAttribute(a); if(v&&el['__a'+a]!==v){ const r=tr(v); el['__a'+a]=r; if(r!==v) el.setAttribute(a,r); } } }
  function walk(root){ if(root.nodeType===3){ tNode(root); return; } if(root.nodeType!==1||SKIP[root.nodeName]) return; tAttr(root);
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT); let n;
    while((n=w.nextNode())){ if(n.nodeType===3) tNode(n); else tAttr(n); } }
  const mo=new MutationObserver(list=>{ for(const m of list){
      if(m.type==='characterData') tNode(m.target);
      else if(m.type==='attributes') tAttr(m.target);
      else for(const n of m.addedNodes) walk(n); } });
  function start(){ walk(document.body); mo.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTR}); }
  if(document.body) start(); else document.addEventListener('DOMContentLoaded',start);
  // título de la pestaña
  const td=Object.getOwnPropertyDescriptor(Document.prototype,'title');
  if(td&&td.set) Object.defineProperty(document,'title',{get(){ return td.get.call(this); },set(v){ td.set.call(this,tr(v)); },configurable:true});
  document.addEventListener('DOMContentLoaded',()=>{ document.title=document.title; });
  // ---- canvas ----
  const C=CanvasRenderingContext2D.prototype;
  for(const k of ['fillText','strokeText','measureText']){ const f=C[k]; C[k]=function(t,...a){ return f.call(this,tr(t),...a); }; }
  // ---- cuadros de diálogo ----
  for(const k of ['alert','confirm','prompt']){ const f=window[k]; window[k]=function(t,...a){ return f.call(window,tr(t),...a); }; }
})();
