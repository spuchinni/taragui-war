"""Detalle del acero de los tanques, hecho por código: img/suelo/metal.png (gris, un efecto por canal).
R = chapa: manchas suaves de laminado y pintura dispareja (promedio ~0.6, multiplica el color)
G = desgaste: rayones finos y saltaduras de pintura (0 = nada, 1 = metal pelado/rayón claro)
B = chorreaduras: óxido y mugre que bajan en vertical (0 = nada, 1 = chorreadura oscura)
Repetible sin costura. Uso: python3 herramientas/suelo/metal.py"""
import numpy as np, os
from PIL import Image
N=512; rng=np.random.default_rng(1918)
OUT=os.path.join(os.path.dirname(__file__),'..','..','img','suelo')
def ruido(beta):
    f=np.fft.fftfreq(N); k=np.sqrt(f[:,None]**2+f[None,:]**2); k[0,0]=1
    a=np.fft.ifft2(np.fft.fft2(rng.standard_normal((N,N)))/k**beta).real; return (a-a.mean())/a.std()
def suave(a,s):
    f=np.fft.fftfreq(N); k2=f[:,None]**2+f[None,:]**2
    return np.fft.ifft2(np.fft.fft2(a)*np.exp(-k2*(s*np.pi)**2*2)).real
# R: chapa
r=.6+ruido(2.0)*.05+ruido(1.3)*.035+rng.standard_normal((N,N))*.012
# G: rayones (líneas cortas casi rectas) y saltaduras (manchas irregulares chicas)
g=np.zeros((N,N))
for _ in range(900):
    x,y=rng.uniform(0,N,2); a=rng.uniform(0,np.pi); L=rng.uniform(6,40); w=rng.uniform(.4,1)
    for t in np.linspace(0,1,int(L*1.5)):
        X=int(x+np.cos(a)*L*t+np.sin(t*6)*1.2)%N; Y=int(y+np.sin(a)*L*t)%N; g[Y,X]=max(g[Y,X],w)
ch=suave(ruido(1.0),1.5); g=np.maximum(g,np.clip((ch-2.1)*1.8,0,1))
g=np.clip(suave(g,.6)*1.6,0,1)
# B: chorreaduras verticales: ruido estirado hacia abajo desde puntos de origen
b=np.zeros((N,N)); yy,xx=np.mgrid[0:N,0:N]
for _ in range(160):
    x0,y0=rng.uniform(0,N,2); L=rng.uniform(30,160); w=rng.uniform(1,4); s=rng.uniform(.3,1)
    dx=(xx-x0+N/2)%N-N/2; dy=(yy-y0)%N
    b=np.maximum(b,np.exp(-(dx/w)**2)*np.clip(1-dy/L,0,1)**1.5*s)
b=np.clip(b*(.7+.3*ruido(1.5)),0,1)
im=Image.merge('RGB',[Image.fromarray((np.clip(c,0,1)*255).astype(np.uint8)).resize((256,256),Image.LANCZOS) for c in (r,g,b)])
im.save(os.path.join(OUT,'metal.png'),optimize=True); print('metal', np.array(im).reshape(-1,3).mean(0).round(1))
