# Arma video/intro.mp4: tomas del juego (look de película de archivo) + tomas de Gemini + nuke y logo.
# python3 armar.py <carpeta_repo> <video_gemini_1> <video_gemini_2>
import json, subprocess, sys, os, collections
REPO, GA, GB = sys.argv[1], sys.argv[2], sys.argv[3]
D = os.path.dirname(os.path.abspath(__file__)); T = D + '/tmp'; os.makedirs(T, exist_ok=True)
FPS = 30
def run(a): subprocess.run(a, check=True)

# 1) Tomas del juego: grano, sepia suave, viñeta y parpadeo de proyector (la 1ª Guerra "filmada en su época")
GRADE = ("eq=contrast=1.15:saturation=0.35:brightness=0.02,"
         "colorbalance=rs=.10:gs=.04:bs=-.10:rm=.06:bm=-.06,"
         "eq=brightness='0.025*sin(t*41)+0.015*sin(t*13)':eval=frame,"
         "noise=alls=9:allf=t,vignette=PI/4.2,format=yuv420p")
snd = json.load(open(D + '/sonido.json'))
FILES = {n.split('_')[0]: f'{REPO}/snd/{n}' for n in sorted(os.listdir(REPO + '/snd'))}
clips = []
for s in snd:
    v = f"{T}/{s['id']}.mp4"
    # sonido de la toma: ambiente de combate + los sonidos que hizo el juego en ese momento (filtrados)
    ev, last = [], collections.defaultdict(lambda: -9)
    for e in s['log']:
        if e['v'] < .1 or e['n'] not in FILES or e['n'] in ('squelch', 'static', 'idle'): continue
        if e['t'] - last[e['n']] < (.6 if e['n'].startswith('mg') or e['n']=='metal' else .18): continue
        last[e['n']] = e['t']; ev.append(e)
    ev = ev[:40]
    ins = ['-f', 'image2', '-framerate', str(FPS), '-i', f"{D}/frames/{s['id']}/%04d.jpg",
           '-stream_loop', '-1', '-i', FILES['infamb']]
    fl = [f"[0:v]{GRADE}[v]", f"[1:a]atrim=0:{s['dur']},volume=0.5[a0]"]
    for i, e in enumerate(ev):
        ins += ['-i', FILES[e['n']]]; ms = int(e['t'] * 1000)
        fl.append(f"[{i+2}:a]atempo={max(.5,min(2,e.get('r',1))):.2f},volume={min(1.2,e['v']):.2f},adelay={ms}|{ms}[e{i}]")
    mix = '[a0]' + ''.join(f'[e{i}]' for i in range(len(ev)))
    fl.append(f"{mix}amix=inputs={len(ev)+1}:normalize=0,atrim=0:{s['dur']},afade=t=in:d=0.05,afade=t=out:st={s['dur']-.08:.2f}:d=0.08,"
              "highpass=f=60,lowpass=f=9000,alimiter=limit=.9[a]")
    run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[v]', '-map', '[a]',
         '-t', str(s['dur']), '-r', str(FPS), '-c:v', 'libx264', '-crf', '18', '-c:a', 'aac', '-ar', '44100', '-ac', '2', v])
    clips.append(v)

# 2) Tomas de Gemini: 2ª Guerra, Guerra Fría, moderno, explosión, nuke y logo
G = [(GB, 1.458, 2.958), (GB, 2.958, 4.417), (GA, 3.125, 4.5), (GA, 6.083, 7.417), (GB, 7.458, 10.0)]
for i, (src, a, b) in enumerate(G):
    v = f'{T}/g{i}.mp4'
    run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a), '-to', str(b), '-i', src,
         '-vf', 'scale=1280:720,fps=30,format=yuv420p', '-af', f'afade=t=in:d=0.03,afade=t=out:st={b-a-.05:.3f}:d=0.05',
         '-c:v', 'libx264', '-crf', '18', '-c:a', 'aac', '-ar', '44100', '-ac', '2', v])
    clips.append(v)

# 3) Todo junto
n = len(clips); ins = sum([['-i', c] for c in clips], [])
fl = ''.join(f'[{i}:v][{i}:a]' for i in range(n)) + f'concat=n={n}:v=1:a=1[v][a]'
out = f'{REPO}/video/intro.mp4'
run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', fl, '-map', '[v]', '-map', '[a]',
     '-c:v', 'libx264', '-crf', '27', '-maxrate', '2500k', '-bufsize', '5000k', '-preset', 'slow', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out])
print('listo', out)
