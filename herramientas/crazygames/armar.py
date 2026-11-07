"""Arma el paquete del juego para subir a CrazyGames (developer.crazygames.com → Submit game → HTML5).
Uso (desde la carpeta del repo):  python herramientas/crazygames/armar.py [--premio]
  --premio  activa el botón "📺 Mirá un anuncio" del resumen (solo cuando el juego pase a Full Launch;
            en Basic Launch CrazyGames no muestra anuncios y el botón no tiene que estar).
Deja dist/crazygames/ (para probar) y dist/taragui-war-crazygames.zip (para subir).
Saca lo que el juego no usa (v1, video de la intro, herramientas, .git) y controla los límites de CrazyGames:
250 MB en total, 1500 archivos y 50 MB de descarga inicial (20 MB para la portada de celulares)."""
import os, sys, shutil, zipfile, json
RAIZ=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
DIST=os.path.join(RAIZ,'dist'); DEST=os.path.join(DIST,'crazygames'); ZIP=os.path.join(DIST,'tarawar-crazygames.zip')
LLEVAR=['index.html','manifest.json','version.json','css','js','img','snd','voz','modelos']
premio='--premio' in sys.argv
if os.path.isdir(DEST): shutil.rmtree(DEST)
os.makedirs(DEST)
for x in LLEVAR:
    o=os.path.join(RAIZ,x)
    if os.path.isdir(o): shutil.copytree(o,os.path.join(DEST,x))
    elif os.path.isfile(o): shutil.copy2(o,os.path.join(DEST,x))
# la plataforma: el juego sabe que corre en CrazyGames (crazy.js carga el SDK, saca el inicio de sesión y la portada)
with open(os.path.join(DEST,'js','plataforma.js'),'w',encoding='utf-8') as f:
    f.write("window.PLATAFORMA={id:'crazygames',premio:%s};\n"%('true' if premio else 'false'))
# en CrazyGames el juego arranca en inglés y el título va en inglés.
# Fondo del menú y de la carga: la portada de CrazyGames hecha con el juego (la misma que la miniatura del sitio), en los dos
# idiomas (idioma.js cambia portada-nueva por portada-en en inglés). Antes iba la ilustración con el hongo nuclear y aviones modernos.
FONDO=os.path.join(RAIZ,'herramientas','crazygames','portadas-juego','portada-1920x1080.jpg')
if not os.path.exists(FONDO): FONDO=os.path.join(RAIZ,'img','portada-en.jpg')
for n in ('portada-nueva.jpg','portada-en.jpg'): shutil.copy2(FONDO,os.path.join(DEST,'img',n))
# la portada es 16:9 con el logo arriba: alineada arriba para que en pantallas anchas no se corte el logo
with open(os.path.join(DEST,'css','juego.css'),'a',encoding='utf-8') as f: f.write('\n.homeArt{background-position:center top}\n')
ih=os.path.join(DEST,'index.html'); h=open(ih,encoding='utf-8').read().replace('TaraWar: Frente de Acero','TaraWar: Steel Front')
open(ih,'w',encoding='utf-8').write(h)
mf=os.path.join(DEST,'manifest.json'); m=open(mf,encoding='utf-8').read().replace('TaraWar: Frente de Acero','TaraWar: Steel Front')
open(mf,'w',encoding='utf-8').write(m)
# Menos archivos (pedido de Sebastián: el formulario de CrazyGames cortaba la subida con ~190 archivos):
#  · todos los scripts del juego en uno solo (js/tarawar.js), en el mismo orden que en index.html;
#  · todos los sonidos y voces en audio.json (base64) y sndFetch los saca de ahí.
import re, base64
h=open(ih,encoding='utf-8').read(); tags=re.findall(r'<script src="(js/[^"?]+)(?:\?v=[^"]*)?"></script>',h)
AUDIO_HOOK='''
;(function(){ let P=null; const get=()=>P||(P=fetch('audio.json').then(r=>r.json()));
  const b64=s=>{ const bin=atob(s), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); return u.buffer; };
  sndFetch=function(p){ return _sndCache[p]||(_sndCache[p]=get().then(A=>{ if(!(p in A)) throw new Error(p+' no está'); return b64(A[p]); })); }; })();
'''
parts=[]
for t in tags:
    parts.append('\n/* ---- '+t+' ---- */\n'+open(os.path.join(DEST,t),encoding='utf-8').read()+'\n;')
    if t.endswith('05-audio.js'): parts.append(AUDIO_HOOK)
    os.remove(os.path.join(DEST,t))
open(os.path.join(DEST,'js','tarawar.js'),'w',encoding='utf-8').write(''.join(parts))
# el script único va donde estaba el último (después de three.js y Firebase)
ms=list(re.finditer(r'<script src="js/[^"]+"></script>\n?',h)); last=ms[-1]
out=h[:last.start()]+'<script src="js/tarawar.js"></script>\n'+h[last.end():]
out=re.sub(r'<script src="js/[^"]+"></script>\n?','',out[:out.rfind('<script src="js/tarawar.js">')])+out[out.rfind('<script src="js/tarawar.js">'):]
open(ih,'w',encoding='utf-8').write(out)
for d in ['js/nucleo','js/eras']:
    q=os.path.join(DEST,d)
    if os.path.isdir(q) and not any(os.scandir(q)): os.rmdir(q)
A={}
for d in ['snd','voz']:
    for root,_,fs in os.walk(os.path.join(DEST,d)):
        for a in fs: q=os.path.join(root,a); A[os.path.relpath(q,DEST).replace(os.sep,'/')]=base64.b64encode(open(q,'rb').read()).decode()
    shutil.rmtree(os.path.join(DEST,d))
json.dump(A,open(os.path.join(DEST,'audio.json'),'w'))
# conteo y tamaños
n=0; tot=0
for d,_,fs in os.walk(DEST):
    for a in fs: n+=1; tot+=os.path.getsize(os.path.join(d,a))
if os.path.exists(ZIP): os.remove(ZIP)
with zipfile.ZipFile(ZIP,'w',zipfile.ZIP_DEFLATED) as z:
    for d,_,fs in os.walk(DEST):
        for a in fs: p=os.path.join(d,a); z.write(p,os.path.relpath(p,DEST).replace(os.sep,'/'))
v=json.load(open(os.path.join(RAIZ,'version.json'),encoding='utf-8')).get('v','?')
print(f"Versión {v} · {n} archivos · {tot/1e6:.1f} MB · zip {os.path.getsize(ZIP)/1e6:.1f} MB · anuncio con premio: {'sí' if premio else 'no'}")
print("Límites de CrazyGames: 1500 archivos, 250 MB en total, 50 MB de descarga inicial (20 MB para celulares).")
if n>1500 or tot>250e6: print("¡OJO! Se pasa de los límites."); sys.exit(1)
print("Listo:", os.path.relpath(ZIP,RAIZ))
