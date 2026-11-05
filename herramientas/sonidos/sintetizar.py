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
TARGET={'static_0':-16.6,'squelch_0':-26.8,'metal_0':-21.2,'metal_1':-21.9,'ric_0':-21,'ric_1':-21,'thump_0':-25.7,'thump_1':-25.7,'shellin_0':-12,'shellin_1':-12,'shellin_2':-12,'shellin_3':-12,
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
def metal(f0,seed):
    T=t(.95); x=np.zeros_like(T); g=np.random.default_rng(seed)
    for r,a,d in [(1,1,.35),(2.76,.6,.22),(5.40,.45,.14),(8.93,.3,.09),(13.3,.18,.06)]:
        x+=a*np.sin(2*np.pi*f0*r*g.uniform(.98,1.02)*T+g.uniform(0,6))*np.exp(-T/d)
    x+=band(noise(.95),1500,9000)*np.exp(-T/.012)*1.5          # golpe
    return fade(norm(x))
@snd
def metal_0(): save('metal_0',metal(430,1))
@snd
def metal_1(): save('metal_1',metal(610,2))
def ric(f0,f1,seed):
    T=t(.47); g=np.random.default_rng(seed); f=f0*(f1/f0)**(T/T[-1])*(1+.02*np.sin(2*np.pi*31*T))
    x=tone(f,T)*env(len(T),.004,.16)*.8+band(noise(.47),2000,9000)*np.exp(-T/.01)
    return fade(norm(reverb(x,.5,.15)[:len(T)]))
@snd
def ric_0(): save('ric_0',ric(3400,1300,3))
@snd
def ric_1(): save('ric_1',ric(2800,900,4))
def thump(f,seed):
    T=t(.97); g=np.random.default_rng(seed)
    x=np.sin(2*np.pi*f*T*np.exp(-T*1.5))*np.exp(-T/.18)*1.2+band(noise(.97),40,700)*env(len(T),.003,.12)
    return fade(norm(reverb(x,1.0,.35)[:len(T)]))
@snd
def thump_0(): save('thump_0',thump(62,5))
@snd
def thump_1(): save('thump_1',thump(78,6))
def whistle(sec,f0,f1,seed,end=.2):
    T=t(sec); f=f0*(f1/f0)**((T/T[-1])**1.4); a=np.minimum(1,(T/T[-1])**1.6+.08)
    x=tone(f*(1+.004*np.sin(2*np.pi*7*T)),T)*.7+tone(f*2.01,T)*.12+band(noise(sec),300,4000)*.25
    x*=a; x[-int(end*SR):]*=np.linspace(1,0,int(end*SR))**.5
    return fade(norm(x)*.9,.05,.02)
@snd
def shellin_0(): save('shellin_0',whistle(1.98,1900,700,8))
@snd
def shellin_1(): save('shellin_1',whistle(1.98,1600,560,9))
@snd
def shellin_2(): save('shellin_2',whistle(1.98,2200,820,10))
@snd
def shellin_3(): save('shellin_3',whistle(1.98,1400,480,11))
@snd
def bombw_0(): save('bombw_0',whistle(2.1,1250,330,12,.1))
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
