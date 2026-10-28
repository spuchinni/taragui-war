"""Texturas de detalle del suelo, hechas por código (sin fotos descargadas).
Cada una es un relieve chiquito (terrones, piedritas, matas de pasto, vetas de roca) iluminado de costado,
así parece una foto. Son repetibles sin costura (el ruido sale de la FFT, que es periódica).
El color lo pone el mapa pintado: estas texturas solo multiplican (promedio ~1), con un poco de tono propio.
Van en gris, una por canal de una sola imagen (menos lecturas por píxel en la placa de video):
R = tierra, G = pasto, B = arena, A = roca.
Uso: python3 herramientas/suelo/texturas.py  -> img/suelo/suelo.png (y vista previa en color en herramientas/suelo/prev.png)"""
import numpy as np, os
from PIL import Image
N=512; rng=np.random.default_rng(1916)
OUT=os.path.join(os.path.dirname(__file__),'..','..','img','suelo')

def ruido(beta, n=N, seed=None):
    r=np.random.default_rng(seed) if seed is not None else rng
    f=np.fft.fftfreq(n); k=np.sqrt(f[:,None]**2+f[None,:]**2); k[0,0]=1
    a=np.fft.ifft2(np.fft.fft2(r.standard_normal((n,n)))/k**beta).real
    return (a-a.mean())/a.std()

def banda(lo, hi, seed=None):
    """ruido con solo las frecuencias entre lo y hi (en ciclos por textura)"""
    r=np.random.default_rng(seed) if seed is not None else rng
    f=np.fft.fftfreq(N)*N; k=np.sqrt(f[:,None]**2+f[None,:]**2)
    m=((k>=lo)&(k<=hi)).astype(float)
    a=np.fft.ifft2(np.fft.fft2(r.standard_normal((N,N)))*m).real
    return (a-a.mean())/(a.std()+1e-9)

def manchas(h, n, rmin, rmax, alto, forma=1.0):
    """terrones o piedras: bultos redondeados, repetidos en los bordes para que no haya costura"""
    yy,xx=np.mgrid[0:N,0:N]
    for _ in range(n):
        cx,cy=rng.uniform(0,N,2); r=rng.uniform(rmin,rmax); a=rng.uniform(0,np.pi); e=rng.uniform(.55,1)*forma
        dx=(xx-cx+N/2)%N-N/2; dy=(yy-cy+N/2)%N-N/2
        u=(dx*np.cos(a)+dy*np.sin(a))/r; v=(-dx*np.sin(a)+dy*np.cos(a))/(r*e)
        q=u*u+v*v; h+=np.where(q<1,np.sqrt(np.clip(1-q,0,1)),0)*alto*rng.uniform(.6,1.2)
    return h

def luz(h, fuerza, L=(-.6,-.5,.62)):
    gy,gx=np.gradient(np.pad(h,1,mode='wrap'))
    gx,gy=gx[1:-1,1:-1],gy[1:-1,1:-1]
    nx,ny,nz=-gx*fuerza,-gy*fuerza,np.ones_like(h); l=np.sqrt(nx*nx+ny*ny+1); L=np.array(L)/np.linalg.norm(L)
    return np.clip((nx*L[0]+ny*L[1]+nz*L[2])/l,0,1)

def oclusion(h, s=6):
    """huecos más oscuros: compara con el promedio de alrededor"""
    f=np.fft.fftfreq(N); k2=f[:,None]**2+f[None,:]**2
    m=np.fft.ifft2(np.fft.fft2(h)*np.exp(-k2*(s*np.pi)**2*2)).real
    return np.clip(1+(h-m)*.9,.45,1.15)

BASE={}; CANALES={}; CONTRASTE={'pasto':1.15,'arena':1.2}
def guardar(nombre, rgb):
    # se divide por el color base (queda casi gris: el tono lo pone el mapa) y se lleva el brillo medio a ~0.78
    # (el shader multiplica por 1/0.78)
    rgb=rgb/np.array(BASE[nombre])[None,None,:]
    g=rgb.mean(2); g=g/g.mean()*.6   # gris, promedio 0.6
    g=(g-.6)*CONTRASTE.get(nombre,1)+.6
    im=Image.fromarray((np.clip(g,0,1)*255).astype(np.uint8)).resize((256,256),Image.LANCZOS)
    CANALES[nombre]=im; print(nombre, round(np.array(im).mean(),1))

def color(base, var, *capas):
    BASE[var]=base
    c=np.array(base,float)[None,None,:]*np.ones((N,N,3))
    for cap,col in capas: c+=cap[...,None]*np.array(col)[None,None,:]
    return c

os.makedirs(OUT,exist_ok=True)

# ---- tierra: terrones, grietas finas y piedritas ----
h=ruido(1.6)*.6+banda(20,60)*.35
h=manchas(h,250,6,18,1.2)
h=manchas(h,700,2.5,7,1.0)          # terrones
h=manchas(h,500,1.2,3,1.0)         # piedritas
gr=np.abs(banda(6,14)); h-=np.where(gr<.08,(0.08-gr)*14,0)   # grietas
li=luz(h,1.6)*oclusion(h)
tono=ruido(1.2)
hum=np.clip(ruido(1.9),-2,2)
rgb=color((.47,.39,.29),'tierra',(tono,(.05,.04,.02)),(hum,(.06,.05,.04)))*(.35+.85*li)[...,None]
guardar('tierra',rgb)

# ---- pasto: matas, hojas finas y tierra entre medio ----
h=ruido(1.4)*.5
cl=banda(10,30); mata=np.clip(cl*.8+.4,0,1)
hoj=np.zeros((N,N))
for _ in range(26000):
    x,y=rng.uniform(0,N,2); a=rng.normal(-1.2,.6); L=rng.uniform(4,12)*(0.5+mata[int(y)%N,int(x)%N])
    for t in np.linspace(0,1,int(L)):
        X=int(x+np.cos(a)*L*t)%N; Y=int(y+np.sin(a)*L*t)%N; hoj[Y,X]=max(hoj[Y,X],1-t*.4)
h+=hoj*1.6*mata
li=luz(h,1.3)*oclusion(h,3)
amar=np.clip(ruido(1.1),-1.5,1.5)
rgb=color((.34,.42,.20),'pasto',(amar,(.05,.03,-.01)),(1-mata,(.08,.02,.03)))*(.3+.9*li)[...,None]
rgb+=hoj[...,None]*np.array([.05,.08,.01])*mata[...,None]
guardar('pasto',rgb)

# ---- arena / tiza: grano fino, ondas suaves y pocas piedras ----
h=ruido(1.8)*.5+banda(80,200)*.25+np.sin((np.mgrid[0:N,0:N][0]+ruido(1.5)*12)*2*np.pi*9/N)*.15
h=manchas(h,180,1.5,4,.8)
li=luz(h,1.4)*oclusion(h,4)
rgb=color((.74,.68,.55),'arena',(ruido(1.3),(.03,.03,.02)))*(.45+.7*li)[...,None]
guardar('arena',rgb)

# ---- roca / pared de barranco y trinchera (vista de frente): vetas horizontales, grietas, raíces ----
yy=np.mgrid[0:N,0:N][0]
w=ruido(1.7)*10
h=np.sin((yy+w)*2*np.pi*14/N)*.5+np.sin((yy+w*1.5)*2*np.pi*37/N)*.25+ruido(1.5)*.5
h=manchas(h,600,2,8,.9,forma=.5)
gr=np.abs(banda(5,12)); h-=np.where(gr<.06,(0.06-gr)*16,0)
li=luz(h,2.0,L=(-.3,-.8,.5))*oclusion(h,5)
rgb=color((.44,.38,.30),'roca',(np.sin((yy+w)*2*np.pi*5/N),(.05,.04,.03)),(ruido(1.2),(.03,.03,.03)))*(.3+.9*li)[...,None]
guardar('roca',rgb)

# ---- una sola imagen RGBA (y vista previa con color) ----
Image.merge('RGBA',[CANALES[n] for n in ('tierra','pasto','arena','roca')]).save(os.path.join(OUT,'suelo.png'),optimize=True)
cols={'tierra':(110,90,66),'pasto':(106,122,62),'arena':(184,173,148),'roca':(120,100,78)}
prev=Image.new('RGB',(1024,256))
for i,(n,c) in enumerate(cols.items()):
    a=np.array(CANALES[n],float)/255/.6; prev.paste(Image.fromarray(np.clip(a[...,None]*np.array(c)[None,None,:],0,255).astype(np.uint8)),(i*256,0))
prev.save(os.path.join(os.path.dirname(__file__),'prev.png'))
