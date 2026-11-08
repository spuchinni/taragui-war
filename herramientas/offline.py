"""Arma offline.json: la lista de archivos que el service worker (sw.js) guarda en el navegador la primera vez,
para que el juego ande sin conexión. La llama version.sh; también se puede correr sola desde la carpeta del repo."""
import os, re, json
RAIZ=os.path.abspath(os.path.join(os.path.dirname(__file__),'..'))
os.chdir(RAIZ)
h=open('index.html',encoding='utf-8').read()
V=re.search(r"window\.GAME_V='([^']*)'",h).group(1)
L=['./','index.html','manifest.json']
L+=[u for u in re.findall(r'(?:src|href)="((?:js|css|img)/[^"]+)"',h)]       # scripts y estilos con su ?v=
for d in ['img','snd','voz','modelos']:
    for r,_,fs in os.walk(d):
        for a in sorted(fs):
            if a.endswith(('.md','.txt')): continue
            L.append(os.path.join(r,a).replace(os.sep,'/'))
L+=['img/suelo/suelo.png?v='+V,'img/suelo/metal.png?v='+V,'modelos/gente.json?v=1']   # como los pide el juego
L+=['js/osm/%s?v=%s'%(a,V) for a in sorted(os.listdir('js/osm')) if a.endswith('.json')]
L=list(dict.fromkeys(L))
json.dump(L,open('offline.json','w'),indent=0)
s=open('sw.js',encoding='utf-8').read()
open('sw.js','w',encoding='utf-8').write(re.sub(r"const V='[^']*'","const V='%s'"%V,s,count=1))
print('offline.json: %d archivos'%len(L))
