# Sonidos hechos por código (pedido de Sebastián para publicar en CrazyGames: que todo lo del juego sea propio o de licencia
# segura). Reemplazan las grabaciones de Freesound/Pixabay cuya licencia no se pudo confirmar. Todo sale de ruido y
# osciladores con numpy; los ambientes mezclan además grabaciones CC0 de qubodup que ya estaban en snd/.
# Uso: python3 herramientas/sonidos/sintetizar.py [nombre ...]   (sin nombres: todos) → snd/<nombre>.mp3
import numpy as np, subprocess, sys, os, tempfile, wave
SR=44100
R=np.random.default_rng(7)
RAIZ=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SND=os.path.join(RAIZ,'snd')

def t(sec): return np.arange(int(sec*SR))/SR
def noise(sec): return R.standard_normal(int(sec*SR))
def band(x,lo=0,hi=None,slope=0):
    """Filtro por FFT: deja pasar entre lo y hi Hz con bordes suaves; slope<0 inclina hacia graves (dB/octava)."""
    n=len(x); X=np.fft.rfft(x); f=np.fft.rfftfreq(n,1/SR); g=np.ones_like(f)
    if lo: g*=1/(1+(lo/np.maximum(f,1))**4)
    if hi: g*=1/(1+(f/hi)**4)
    if slope: g*=(np.maximum(f,20)/1000)**(slope/6.02)
    return np.fft.irfft(X*g,n)
def sweep_band(x,fc,bw):
    """Pasabanda con centro fc(t) y ancho bw(t) (arreglos del largo de x), por STFT con ventanas solapadas."""
    N=2048; H=256; w=np.hanning(N); out=np.zeros(len(x)+N); norm_=np.zeros(len(x)+N); f=np.fft.rfftfreq(N,1/SR)
    xp=np.concatenate([x,np.zeros(N)])
    for i in range(0,len(x),H):
        c=fc[min(i,len(fc)-1)]; b=bw[min(i,len(bw)-1)]; g=np.exp(-.5*((f-c)/b)**2)
        out[i:i+N]+=np.fft.irfft(np.fft.rfft(xp[i:i+N]*w)*g,N)*w; norm_[i:i+N]+=w*w
    return (out/np.maximum(norm_,1e-6))[:len(x)]
def env(n,a,d,sus=0.0):
    """Ataque a s, caída exponencial con constante d s."""
    tt=np.arange(n)/SR; e=np.minimum(1,tt/max(a,1e-4))*np.exp(-np.maximum(0,tt-a)/d)
    return e*(1-sus)+sus
def norm(x,peak=.92): m=np.max(np.abs(x)) or 1; return x/m*peak
def fade(x,a=.005,b=.03):
    n=len(x); A=int(a*SR); B=int(b*SR); x=x.copy()
    if A: x[:A]*=np.linspace(0,1,A)
    if B: x[-B:]*=np.linspace(1,0,B)
    return x
def loop(x,cf=.4):
    """Hace un bucle sin costura: la cola se funde con el comienzo."""
    C=int(cf*SR); a=x[:-C].copy(); a[:C]=a[:C]*np.linspace(0,1,C)+x[-C:]*np.linspace(1,0,C); return a
def tone(f,tt,ph=0):
    """Oscilador con frecuencia variable (f puede ser un arreglo)."""
    f=np.broadcast_to(f,tt.shape); return np.sin(2*np.pi*np.cumsum(f)/SR+ph)
def reverb(x,dec=1.2,mix=.3):
    n=int(dec*SR); ir=R.standard_normal(n)*np.exp(-np.arange(n)/SR/(dec/5)); ir=band(ir,200,5000)
    y=np.convolve(x,ir)[:len(x)+n]; y=norm(y,np.max(np.abs(x)))
    out=np.zeros(len(y)); out[:len(x)]=x*(1-mix); return out+y*mix
def read(name):
    with tempfile.NamedTemporaryFile(suffix='.wav') as f:
        subprocess.run(['ffmpeg','-v','error','-y','-i',os.path.join(SND,name+'.mp3'),'-ac','1','-ar',str(SR),f.name],check=True)
        with wave.open(f.name) as w: return np.frombuffer(w.readframes(w.getnframes()),np.int16)/32768
def save(name,x,sr=SR,kbps=80):
    x=np.clip(x,-1,1); pcm=(x*32767).astype(np.int16)
    with tempfile.NamedTemporaryFile(suffix='.wav',delete=False) as f: tmp=f.name
    with wave.open(tmp,'w') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    subprocess.run(['ffmpeg','-v','error','-y','-i',tmp,'-ar',str(sr),'-ac','1','-b:a',f'{kbps}k',os.path.join(SND,name+'.mp3')],check=True); os.remove(tmp)
    level(name,sr,kbps); print(name,f'{len(x)/SR:.2f} s',f'{mean_db(os.path.join(SND,name+".mp3")):.1f} dB')

# volumen medio (dB) de las grabaciones que reemplazan, para que el juego suene parejo sin tocar los volúmenes del código
TARGET={'static_0':-16.6,'squelch_0':-26.8,'metal_0':-21.2,'metal_1':-21.9,'ric_0':-21,'ric_1':-21,'ric_2':-21,'ric_3':-21,'thump_0':-25.7,'thump_1':-25.7,'shellin_0':-12,'shellin_1':-12,'shellin_2':-12,'shellin_3':-12,
  'bombw_0':-17.8,'nukew_0':-6.5,'nukeb_0':-3.7,'prop_0':-18.3,'plane_0':-13,'drive_0':-12.2,'gau8_0':-10.9,'infamb_0':-34.3,'intro_0':-19.8}
def mean_db(path):
    o=subprocess.run(['ffmpeg','-i',path,'-af','volumedetect','-f','null','-'],capture_output=True,text=True).stderr
    return float(o.split('mean_volume:')[1].split('dB')[0])
def level(name,sr,kbps):
    if name not in TARGET: return
    p=os.path.join(SND,name+'.mp3'); d=TARGET[name]-mean_db(p); tmp=p+'.tmp.mp3'
    subprocess.run(['ffmpeg','-v','error','-y','-i',p,'-af',f'volume={d:.1f}dB,alimiter=limit=0.97:level=false','-ar',str(sr),'-ac','1','-b:a',f'{kbps}k',tmp],check=True); os.replace(tmp,p)

S={}
def snd(f): S[f.__name__]=f; return f

@snd
def static_0():          # estática de radio (bucle)
    n=noise(8); x=band(n,350,3200); fl=1+.35*np.sin(2*np.pi*.7*t(8))+.2*band(noise(8),0,3)*8
    cr=np.zeros_like(x); idx=R.integers(0,len(x)-200,180);
    for i in idx: cr[i:i+60]+=R.standard_normal(60)*R.uniform(1,4)
    x=x*fl+band(cr,800,6000); save('static_0',norm(loop(x))*.8,22050,64)
@snd
def squelch_0():         # corte de radio: chasquido y cola de ruido
    T=t(.65); x=band(noise(.65),500,3000)*env(len(T),.002,.12); x[:300]+=np.sin(2*np.pi*1200*T[:300])*np.linspace(1,0,300)
    save('squelch_0',fade(norm(x)*.85),22050,64)
def modes(T,lo,hi,n,g,dk=1.0,tilt=-.5):
    """Muchos modos de chapa inarmónicos (no una campana): frecuencias al azar entre lo y hi, los agudos se apagan antes."""
    x=np.zeros_like(T)
    for f in np.exp(g.uniform(np.log(lo),np.log(hi),n)):
        d=dk*.35*(f/400)**-.8*g.uniform(.5,1.5); a=(f/400)**tilt*g.uniform(.3,1)
        x+=a*np.sin(2*np.pi*f*T+g.uniform(0,6))*np.exp(-T/d)
    return x
def crackle(T,g,n,t0,t1,lo=2500):
    """Esquirlas y astillas: chasquidos sueltos que se van espaciando."""
    x=np.zeros_like(T); c=band(noise(T[-1]+1/SR)[:len(T)],lo,12000)
    for _ in range(n):
        p=int(SR*(t0+(t1-t0)*g.random()**2)); L=int(SR*g.uniform(.002,.007))
        if p+L<len(x): x[p:p+L]+=c[p:p+L]*np.hanning(L)*g.uniform(.2,1)
    return x
def metal(f0,seed,src='cannon_0'):
    """Proyectil contra el blindaje: golpe seco, la masa de la chapa (grave), muchos modos que se apagan rápido
    (un "klonk", no una campana), el golpe real de la grabación CC0 recortado y esquirlas."""
    g=np.random.default_rng(seed); T=t(1.1); n=len(T)
    hit=band(noise(1.1),800,11000)*np.exp(-T/.004)*2.2                          # chasquido del impacto
    mass=(np.sin(2*np.pi*f0*.24*T)*.9+np.sin(2*np.pi*f0*.37*T)*.5)*np.exp(-T/.07)  # la placa gruesa: golpe grave
    body=modes(T,f0*.8,f0*9,46,g,.75)                                             # el "klonk" metálico
    rec=read(src); rec=band(rec[:n] if len(rec)>=n else np.pad(rec,(0,n-len(rec))),90,3500)*np.exp(-T/.05)
    x=hit+mass*1.4+norm(body,1)*.9+norm(rec,1)*.8+crackle(T,g,22,.02,.45)*.35
    x=reverb(x,.7,.18)[:n]; return fade(norm(x),.001,.15)
@snd
def metal_0(): save('metal_0',metal(430,1,'cannon_0'))
@snd
def metal_1(): save('metal_1',metal(560,2,'cannon_1'))
def ric(f0,seed,src,zing=.35,whoosh=.8,sec=.9):
    """Rebote: el mismo golpe de chapa que `metal` pero más liviano y agudo (le pega de refilón) y el proyectil que
    sale zumbando: aire que pasa y se aleja (ruido en banda que baja), con un "tiiin" metálico corto encima."""
    g=np.random.default_rng(seed); T=t(sec); n=len(T)
    hit=band(noise(sec),1500,12000)*np.exp(-T/.003)*2.5
    body=modes(T,f0*.9,f0*10,40,g,.45,-.3)
    rec=read(src); rec=band(rec[:n] if len(rec)>=n else np.pad(rec,(0,n-len(rec))),400,6000)*np.exp(-T/.025)
    clang=hit+norm(body,1)+norm(rec,1)*.6
    d=int(.02*SR); k=np.clip((T-.02)/(sec-.02),0,1)
    fc=2600*(1-k)**1.3+500; wh=sweep_band(noise(sec),fc,fc*.35)*np.minimum(1,np.maximum(0,T-.02)/.03)*np.exp(-np.maximum(0,T-.02)/.22)
    zg=tone(f0*2.3*(1-.25*k),T)*np.exp(-np.maximum(0,T-.01)/.09)*(T>.01)
    x=norm(clang,1)+norm(wh,1)*whoosh+zg*zing+crackle(T,g,8,.02,.25)*.2
    x=reverb(x,.8,.2)[:n]; return fade(norm(x),.001,.12)
@snd
def ric_0(): save('ric_0',ric(900,3,'cannon_0'))
@snd
def ric_1(): save('ric_1',ric(1150,4,'cannon_1',.25,.9,1.0))
@snd
def ric_2(): save('ric_2',ric(1300,7,'cannon_0',0,1.0,.8))
@snd
def ric_3(): save('ric_3',ric(800,8,'cannon_1',.6,.4,.9))
def thump(src,seed):            # cañón lejano: la grabación CC0 de qubodup filtrada como si viniera de varios km
    x=read(src); x=band(x,25,520); T=np.arange(len(x))/SR; x=x[:int(1.4*SR)]
    x=reverb(x,1.6,.45)[:int(1.6*SR)]; return fade(norm(x),.004,.4)
@snd
def thump_0(): save('thump_0',thump('cannon_0',5))
@snd
def thump_1(): save('thump_1',thump('cannon_1',6))
def whistle(sec,f0,f1,seed,end=.12,q=.12,tonal=.08):
    """Proyectil o bomba que llega: ruido de aire en una banda que baja (Doppler) y crece hasta el impacto; apenas un hilo de tono."""
    T=t(sec); u=T/T[-1]; fc=f0*(f1/f0)**(u**1.3); g=np.random.default_rng(seed)
    air=sweep_band(g.standard_normal(len(T)),fc,fc*q)*2.2+sweep_band(g.standard_normal(len(T)),fc*.5,fc*.35)*.9   # silbido de aire + soplido grave
    rip=band(g.standard_normal(len(T)),150,1200)*(.25+.75*np.abs(np.sin(2*np.pi*np.cumsum(9+20*u)/SR)))*.35         # rasgado (turbulencia)
    x=norm(air)+rip*u**2+tone(fc,T)*tonal
    x*=np.minimum(1,u**2.2*1.1+.03)*(1+.08*np.sin(2*np.pi*13*T))
    E=int(end*SR); x[-E:]*=np.linspace(1,0,E)
    return fade(norm(x)*.9,.08,.01)
@snd
def shellin_0(): save('shellin_0',whistle(1.6,1500,520,8,.12,.28,.05))
@snd
def shellin_1(): save('shellin_1',whistle(1.6,1300,460,9,.12,.28,.05))
@snd
def shellin_2(): save('shellin_2',whistle(1.6,1700,600,10,.12,.28,.05))
@snd
def shellin_3(): save('shellin_3',whistle(1.6,1150,420,11,.12,.28,.05))
@snd
def bombw_0(): save('bombw_0',whistle(2.1,1100,360,12,.08,.18,.12))
@snd
def nukew_0():           # la onda que llega: viento que crece y retumba
    T=t(6); x=band(noise(6),20,900,-4)*np.minimum(1,T/2.5)**1.5*(1+.3*np.sin(2*np.pi*.6*T))
    x+=np.sin(2*np.pi*34*T)*np.minimum(1,T/3)*.6; save('nukew_0',fade(norm(x),.3,.8))
@snd
def nukeb_0():           # la detonación: golpe enorme, grave y largo
    T=t(7.8); x=band(noise(7.8),15,1800,-5)*env(len(T),.02,1.8)*1.4+np.sin(2*np.pi*38*T*np.exp(-T*.15))*env(len(T),.01,2.2)
    x+=band(noise(7.8),15,250)*env(len(T),.4,3.0)*.8
    save('nukeb_0',fade(norm(x),.003,1.0))
def engine(sec,f0,blades,harm=8,seed=0,doppler=None):
    T=t(sec); g=np.random.default_rng(seed); f=np.full_like(T,f0)*(1+.01*band(g.standard_normal(len(T)),0,2)*30)
    if doppler is not None: f=f*doppler
    x=np.zeros_like(T)
    for k in range(1,harm+1): x+=tone(f*k,T,g.uniform(0,6))/k**.8
    x*=1+.45*np.sin(2*np.pi*np.cumsum(f*blades/ (harm and 1))/SR/4)        # golpeteo de las palas
    return x+band(g.standard_normal(len(T)),80,2500)*.35
@snd
def prop_0():            # avioneta a hélice (bucle)
    x=engine(8.6,92,1,10,13); save('prop_0',norm(loop(band(x,40,4000),.6))*.85)
@snd
def plane_0():           # avión de varios motores que pasa (bucle largo con distancia y Doppler suaves)
    T=t(22.6); d=1+.035*np.tanh((11-T)/3); x=engine(22.6,74,1,9,14,d)+engine(22.6,77.5,1,9,15,d)*.8
    x*=.55+.45*np.exp(-((T-11)/6)**2); save('plane_0',norm(loop(band(x,40,3500),.6))*.85,SR,96)
@snd
def drive_0():           # tanque en marcha: motor grave + golpeteo de la oruga (bucle)
    sec=6.2; T=t(sec); x=engine(sec,44,1,12,16)*.7
    tr=np.zeros_like(T); per=int(SR/8.6)
    for i in range(0,len(T)-2000,per):
        L=int(R.uniform(900,1600)); c=band(R.standard_normal(L),300,5000)*np.exp(-np.arange(L)/SR/.02)*R.uniform(.5,1.2); tr[i:i+L]+=c
    sq=band(noise(sec),1800,4500)*(.15+.1*np.sin(2*np.pi*.4*T))
    x=band(x,30,1500)+tr*.9+sq; save('drive_0',norm(loop(x,.5))*.9,22050,64)
@snd
def gau8_0():            # ráfaga de cañón rotativo: zumbido grave muy rápido y eco
    T=t(3.24); fire=T<1.9; saw=2*((T*65)%1)-1; x=band(saw*fire,40,3000)*1.0+band(noise(3.24),60,2500)*fire*.6
    x=reverb(x,1.3,.4)[:len(T)]; save('gau8_0',fade(norm(x),.01,.4))
@snd
def infamb_0():          # combate lejano: estampidos (grabaciones CC0 de qubodup) filtrados, ráfagas sintéticas y viento
    sec=56; out=band(noise(sec),20,500,-3)*.05
    srcs=[band(read('cannon_0'),20,900),band(read('cannon_1'),20,900),band(read('expl_0'),20,700)]
    for k in range(34):
        s=srcs[R.integers(0,3)]*R.uniform(.15,.6); at=int(R.uniform(0,sec-3)*SR); L=min(len(s),len(out)-at); out[at:at+L]+=s[:L]
    for k in range(10):                         # ametralladoras a lo lejos
        at=R.uniform(0,sec-3); n=int(R.integers(6,16)); rate=R.uniform(9,13)
        for j in range(n):
            p=int((at+j/rate)*SR); L=1500; c=band(R.standard_normal(L),300,2200)*np.exp(-np.arange(L)/SR/.012)*.12; out[p:p+L]+=c
    out=reverb(out,2.0,.4)[:int(sec*SR)]; save('infamb_0',fade(norm(loop(out,1.0))*.8,.5,.5))
@snd
def intro_0():           # la intro (hoy sin usar): cañonazos CC0 de qubodup con eco largo
    sec=34.7; out=np.zeros(int(sec*SR)); srcs=[read('cannon_0'),read('cannon_1'),read('expl_0')]
    for k,at in enumerate([.5,2.2,4.1,7.8,9.0,12.5,15.2,18.9,21.0,24.4,27.7,30.1]):
        s=srcs[k%3]*(.5+.5*R.random()); p=int(at*SR); L=min(len(s),len(out)-p); out[p:p+L]+=s[:L]
    out=reverb(band(out,25,6000),2.5,.35)[:len(out)]; save('intro_0',fade(norm(out),.2,2))

if __name__=='__main__':
    want=sys.argv[1:] or list(S)
    for k in want: S[k]()
