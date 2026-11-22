# Bucles de los aviones de línea del aeropuerto (jettaxi, jetroar, jetfar). Correr en una carpeta con los originales de Freesound bajados (CC0): sale out/<nombre>_0.mp3 para snd/.
import subprocess, numpy as np
# Arma los bucles de los aviones de línea: tramo + fundido cruzado del final sobre el principio, normalizado a -18 dBFS RMS,
# con 0,3 s de margen adelante (el final del bucle) y atrás (el principio): el archivo es periódico y el retardo del mp3 no corta el empalme.
SR = 44100; X = .6; PAD = .3
def load(f, a, b, hp=0):
    af = ['-af', f'highpass=f={hp}'] if hp else []
    raw = subprocess.run(['ffmpeg','-v','error','-ss',str(a),'-t',str(b-a),'-i',f,*af,'-ac','2','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1,2).copy()
def loop(x):
    n = int(X*SR); L = len(x)-n; y = x[:L].copy(); t = np.linspace(0,1,n)[:,None]
    y[:n] = x[:n]*np.sqrt(t) + x[L:L+n]*np.sqrt(1-t); return y
def save(y, name):
    y = y*(10**(-18/20)/np.sqrt((y**2).mean())); p = int(PAD*SR)
    z = np.concatenate([y[-p:], y, y[:p]]); z = np.clip(z, -1, 1)
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-b:a','128k',f'out/{name}_0.mp3'],input=z.astype(np.float32).tobytes())
    print(name, f'{len(y)/SR:.3f} s')
import os; os.makedirs('out', exist_ok=True)
save(loop(load('843280__joeffl__airport-exterior-orlando-international-mco-june-2024.flac', 274.6, 282.2, 180)), 'jettaxi')   # turbina rodando (silbido que sube)
save(loop(load('436511__sonicwave32__airbus-a330-takeoff.wav', 51.0, 57.6, 40)), 'jetroar')                                    # rugido a plena potencia, de cerca
save(loop(load('e813c984-251973__clif_creates__takeoff-1-distant.wav', 3.4, 10.0, 30)), 'jetfar')                               # despegue lejano, grave
