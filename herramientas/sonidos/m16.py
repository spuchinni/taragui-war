# Ráfaga de las 4 M2 del M16 MGMC (m2quad) y la cola del eco al soltar el gatillo (m2tail).
# Correr en una carpeta con 160355__qubodup__air-defense-artillery-avenger-training-50cal-th4ybtw8vk8.flac (Freesound, CC0):
# sale out/m2quad_0.mp3 y out/m2tail_0.mp3 para snd/.
# Se recortan los 24 tiros de la primera ráfaga de la grabación (una .50 de verdad) y se arman 4 ametralladoras que no van
# sincronizadas, cada una a ~500 tiros por minuto (montaje Maxson M45: 4 M2 que tiran juntas), con su lugar en el estéreo y un poco de eco.
# El bucle es periódico de verdad (cada arma da un número entero de tiros en L y todo se envuelve): no hace falta fundido.
import subprocess, numpy as np, os
SR = 44100; SRC = '160355__qubodup__air-defense-artillery-avenger-training-50cal-th4ybtw8vk8.flac'; L = 2.76; PAD = .3
raw = subprocess.run(['ffmpeg','-v','error','-i',SRC,'-ac','2','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
x = np.frombuffer(raw, np.float32).reshape(-1,2).copy()
ON = [.632,.725,.819,.895,.967,1.035,1.1,1.164,1.236,1.307,1.374,1.441,1.505,1.571,1.636,1.702,1.769,1.835,1.901,1.965,2.026,2.09,2.153,2.217]
G = int(.064*SR); fo = np.ones(G); fo[-350:] = np.linspace(1,0,350)
shots = [x[int((t-.002)*SR):int((t-.002)*SR)+G]*fo[:,None] for t in ON]
N = int(L*SR); out = np.zeros((N,2)); rng = np.random.default_rng(16)
for per, off, pan, gain in [(.118,.000,-.45,1.0),(.112,.031,.45,.95),(.122,.058,-.15,.9),(.115,.086,.2,.95)]:
    n = round(L/per); per = L/n
    for i in range(n):
        s = shots[rng.integers(len(shots))].mean(1)*gain*rng.uniform(.85,1.05)
        st = int((off+i*per+rng.uniform(-.004,.004))*SR) % N
        idx = (st+np.arange(G)) % N
        out[idx,0] += s*np.sqrt((1-pan)/2); out[idx,1] += s*np.sqrt((1+pan)/2)
# eco del campo: respuesta de ruido que decae en ~0,4 s, convolución circular (el bucle sigue empalmando)
t = np.arange(int(.45*SR))/SR; ir = rng.standard_normal((len(t),2))*np.exp(-t/.11)[:,None]*.007; ir[0] = 0
for c in (0,1): out[:,c] += np.real(np.fft.ifft(np.fft.fft(out[:,c])*np.fft.fft(ir[:,c], N)))*.6
Gn = 10**(-16/20)/np.sqrt((out**2).mean())   # misma ganancia para el bucle y la cola
os.makedirs('out', exist_ok=True)
def save(z, name, k=1):
    z = z*Gn*k; z = np.clip(z, -1, 1)
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-b:a','128k',f'out/{name}_0.mp3'],input=z.astype(np.float32).tobytes())
    print(name, f'{len(z)/SR:.3f} s')
p = int(PAD*SR); save(np.concatenate([out[-p:], out, out[:p]]), 'm2quad')
tail = x[int(2.285*SR):int(3.2*SR)].copy(); f = np.ones(len(tail)); f[:200] = np.linspace(0,1,200); f[-3000:] = np.linspace(1,0,3000)
save(tail*f[:,None], 'm2tail', 1.8)   # el eco de la grabación después del último tiro; con 4 armas suena más
