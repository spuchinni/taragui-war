"""Arma el paquete del juego para subir a CrazyGames (developer.crazygames.com → Submit game → HTML5).
Uso (desde la carpeta del repo):  python herramientas/crazygames/armar.py [--premio]
  --premio  activa el botón "📺 Mirá un anuncio" del resumen (solo cuando el juego pase a Full Launch;
            en Basic Launch CrazyGames no muestra anuncios y el botón no tiene que estar).
Deja dist/crazygames/ (para probar) y dist/taragui-war-crazygames.zip (para subir).
Saca lo que el juego no usa (v1, video de la intro, herramientas, .git) y controla los límites de CrazyGames:
250 MB en total, 1500 archivos y 50 MB de descarga inicial (20 MB para la portada de celulares)."""
import os, sys, shutil, zipfile, json
RAIZ=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
DIST=os.path.join(RAIZ,'dist'); DEST=os.path.join(DIST,'crazygames'); ZIP=os.path.join(DIST,'taragui-war-crazygames.zip')
LLEVAR=['index.html','manifest.json','version.json','css','js','img','snd','voz']
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
