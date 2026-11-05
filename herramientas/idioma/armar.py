# Junta los diccionarios herramientas/idioma/en/*.json en js/idioma-en.js (lo que carga el juego).
# Uso: python3 herramientas/idioma/armar.py
#      python3 herramientas/idioma/armar.py --faltan   → lista los textos del código que todavía no tienen traducción
import json,glob,os,sys,re
R=os.path.dirname(os.path.abspath(__file__)); RAIZ=os.path.dirname(os.path.dirname(R))
D={}; G={}
for f in sorted(glob.glob(os.path.join(R,'en','*.json'))):
    for k,v in json.load(open(f,encoding='utf-8')).items(): (G if os.path.basename(f).startswith('_') else D)[k]=v   # _glosario.json: términos sueltos
if '--faltan' in sys.argv:
    sys.path.insert(0,R); os.chdir(RAIZ); import extraer, subprocess
    tmp='/tmp/_textos.json'; subprocess.run([sys.executable,os.path.join(R,'extraer.py'),tmp],stdout=subprocess.DEVNULL)
    for f,s in json.load(open(tmp)):
        if s not in D and re.search(r'[a-záéíóúñ]{3,}',s): print(f,'|',s)
    sys.exit()
out='// Generado por herramientas/idioma/armar.py desde herramientas/idioma/en/*.json: no editar a mano.\nI18N.add('+json.dumps(D,ensure_ascii=False,indent=0)+');\nI18N.words('+json.dumps(G,ensure_ascii=False,indent=0)+');\n'
open(os.path.join(RAIZ,'js','idioma-en.js'),'w',encoding='utf-8').write(out)
print(len(D),'textos →',os.path.join('js','idioma-en.js'))
