# Saca los textos para traducir: literales de JS (comillas y plantillas), separados por etiquetas HTML;
# en las plantillas cada ${...} pasa a ser {} y se revisa adentro también.
import re,sys,glob,json,collections
def lits(src):
    i=0;n=len(src);out=[]
    while i<n:
        c=src[i]
        if c=='/' and i+1<n and src[i+1]=='/':
            j=src.find('\n',i); i=n if j<0 else j; continue
        if c=='/' and i+1<n and src[i+1]=='*':
            j=src.find('*/',i+2); i=n if j<0 else j+2; continue
        if c in '\'"':
            j=i+1; buf=''
            while j<n and src[j]!=c:
                if src[j]=='\\': buf+=src[j+1] if j+1<n else ''; j+=2; continue
                if src[j]=='\n': break
                buf+=src[j]; j+=1
            out.append(buf); i=j+1; continue
        if c=='`':
            j=i+1; buf=''
            while j<n and src[j]!='`':
                if src[j]=='\\': buf+=src[j+1] if j+1<n else ''; j+=2; continue
                if src[j]=='$' and j+1<n and src[j+1]=='{':
                    d=1; k=j+2
                    while k<n and d>0:
                        if src[k]=='{': d+=1
                        elif src[k]=='}': d-=1
                        elif src[k] in '\'"`':
                            q=src[k]; k+=1
                            while k<n and src[k]!=q:
                                if src[k]=='\\': k+=1
                                k+=1
                        k+=1
                    out+=lits(src[j+2:k-1]); buf+='\x01'; j=k; continue
                buf+=src[j]; j+=1
            out.append(buf); i=j+1; continue
        i+=1
    return out
WORD=re.compile(r'[A-Za-zÁÉÍÓÚáéíóúñÑü]{2,}')
def segs(t):
    t=t.replace('&nbsp;',' ')
    for s in re.split(r'<[^>]*>|\n',t):
        s=re.sub(r'\s+',' ',s).strip()
        s=re.sub(r'\x01(\s*\x01)+','\x01',s)
        if not WORD.search(s.replace('\x01','')): continue
        yield s.replace('\x01','{}')
def techy(s):
    if re.fullmatch(r'[\w\-\.#/:%?=&,;()\[\]{} ]*',s) and ' ' not in s.strip() and not re.search(r'[áéíóúñÁÉÍÓÚÑ¿¡]',s) and not (s[:1].isupper() and len(s)>2): return True
    if re.search(r'^(rgba?|hsla?)\(|px|^#[0-9a-f]{3,6}$|function|=>|\.js$|\.png|\.jpg|\.mp3|\.json|https?:',s): return True
    if re.fullmatch(r'[a-z]+(-[a-z]+)+',s): return True
    if re.search(r'(^|[ ;])[a-z-]+:[^ ]',s) and ';' in s: return True   # css
    return False
if __name__=='__main__':
    files=sorted(glob.glob('js/*.js')+glob.glob('js/eras/*.js')+glob.glob('js/nucleo/*.js'))
    order=[]; seen={}
    for f in files:
        if 'nube-config' in f or 'idioma' in f: continue
        for L in lits(open(f,encoding='utf-8').read()):
            for s in segs(L):
                if techy(s): continue
                if s not in seen: seen[s]=f; order.append(s)
    html=open('index.html',encoding='utf-8').read()
    html=re.sub(r'<script[\s\S]*?</script>|<style[\s\S]*?</style>','',html)
    for s in segs(html):
        if not techy(s) and s not in seen: seen[s]='index.html'; order.append(s)
    for a in re.findall(r'(?:title|placeholder|aria-label)="([^"]+)"',html):
        if a not in seen: seen[a]='index.html'; order.append(a)
    json.dump([[seen[s],s] for s in order],open(sys.argv[1],'w'),ensure_ascii=False,indent=0)
    c=collections.Counter(seen[s] for s in order)
    for f,k in sorted(c.items()): print(k,f)
    print(len(order))
