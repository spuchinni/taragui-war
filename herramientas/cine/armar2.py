# Arma la intro 2.ª versión: video/intro.mp4 (castellano) y video/intro-en.mp4 (inglés) con las tomas de filmar2.js,
# la música "War Horn and Drums" y los sonidos del juego de cada toma. Cierra fundiendo en la portada (la misma imagen del menú).
# python3 herramientas/cine/armar2.py <musica.mp3>
import json, subprocess, sys, os, collections
D = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(os.path.dirname(D)); T = D + '/tmp2'; os.makedirs(T, exist_ok=True)
MUS = sys.argv[1]; FPS = 30; Wd, Hd = 1280, 720; BAR = 52   # franjas de cine (1280×616 ≈ 2,08:1)
# música estirada (pedidos de Sebastián): 0–16,3 s, los tambores otra vez (6,0–16,3), el cuerno otra vez para la llegada del B-29 (0–5,3)
# y el final (16,3 s en adelante, con el golpe de la nuke). Empalmes cortos en los golpes.
SEG = [(0, 16.3), (6.0, 16.3), (0, 5.3), (16.3, None)]
DX = sum(b - a for a, b in SEG[:-1]) - 16.3          # cuánto se corre el final: 10,3 + 5,3 = 15,6 s
MUSX = T + '/musica.wav'
_ins, _fl = [], []
for i, (a, b) in enumerate(SEG):
    _ins += ['-i', MUS]; tr = f"atrim={a}:{b}" if b else f"atrim={a}"
    fo = f",afade=t=out:st={b-a-.02:.2f}:d=0.02" if b else ''
    _fl.append(f"[{i}:a]{tr},asetpts=PTS-STARTPTS,afade=t=in:d=0.01{fo}[s{i}]")
_fl.append(''.join(f'[s{i}]' for i in range(len(SEG))) + f"concat=n={len(SEG)}:v=0:a=1[m]")
subprocess.run(['ffmpeg', '-v', 'error', '-y', *_ins, '-filter_complex', ';'.join(_fl), '-map', '[m]', MUSX], check=True)
MUS = MUSX
FONT = '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
TOMAS = json.loads(subprocess.run(['node', '-e', f"console.log(JSON.stringify(require('{D}/intro2-tomas.js').map(t=>({{id:t.id,ed:t.ed,cap:t.cap||'',grade:t.grade||'',logo:!!t.logo}}))))"], capture_output=True, text=True, check=True).stdout)
END = TOMAS[-1]['ed'][1]
def run(a): subprocess.run(a, check=True)

GRADE = {'old': "eq=contrast=1.12:saturation=0.25:brightness=0.01,colorbalance=rs=.12:gs=.05:bs=-.10:rm=.06:bm=-.06,noise=alls=10:allf=t,vignette=PI/4",
         '':    "eq=contrast=1.08:saturation=1.08:gamma=0.97,colorbalance=rs=.03:bs=-.03:rh=.03:bh=-.04,vignette=PI/5"}
def cap(txt, dur):
    if not txt: return ''
    a = f"if(lt(t,.25),t/.25,if(gt(t,{dur-.3:.2f}),max(0,({dur:.2f}-t)/.3),1))"
    txt = txt.replace(':', r'\:')
    return (f",drawbox=x=56:y=ih-{BAR}-62:w=4:h=34:color=0xd9a441@1:t=fill:enable='gte(t,.1)',"
            f"drawtext=fontfile={FONT}:text='{txt}':x=72:y=h-{BAR}-62:fontsize=30:fontcolor=white:alpha='{a}':shadowcolor=black@.7:shadowx=2:shadowy=2")

# 1) cada toma: cuadros 2560×1440 → 1280×720, color, franjas y título
clips = []
for S in TOMAS:
    a, b = S['ed']; dur = b - a; v = f"{T}/{S['id']}.mp4"
    vf = f"scale={Wd}:{Hd}:flags=lanczos,{GRADE[S['grade']]}"
    if S['logo']: vf += ",format=yuv420p"
    else: vf += f",drawbox=x=0:y=0:w=iw:h={BAR}:color=black:t=fill,drawbox=x=0:y=ih-{BAR}:w=iw:h={BAR}:color=black:t=fill" + cap(S['cap'], dur)
    if S['id'] == 'mk1': vf += ",fade=t=in:st=0:d=0.7"
    if S['id'] == 'nahuel': vf += f",fade=t=out:st={dur-.3:.2f}:d=0.3"
    run(['ffmpeg', '-v', 'error', '-y', '-framerate', str(FPS), '-i', f"{D}/frames2/{S['id']}/%04d.jpg", '-vf', vf + ',format=yuv420p',
         '-t', f'{dur:.3f}', '-r', str(FPS), '-c:v', 'libx264', '-crf', '16', '-an', v])
    clips.append((S, v))

# 2) video completo (sin portada): las tomas en su lugar del tiempo, negro donde no hay nada (el silencio del cuerno, 5,42–5,9 s)
ins, fl = ['-f', 'lavfi', '-i', f'color=black:s={Wd}x{Hd}:r={FPS}:d={END}'], []
last = '[0:v]'
for i, (S, v) in enumerate(clips):
    ins += ['-i', v]; a = S['ed'][0]
    fl.append(f"[{i+1}:v]setpts=PTS-STARTPTS+{a}/TB[c{i}]"); fl.append(f"{last}[c{i}]overlay=eof_action=pass[o{i}]"); last = f'[o{i}]'
base = f'{T}/base.mp4'
run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', last, '-t', f'{END}', '-r', str(FPS), '-c:v', 'libx264', '-crf', '16', base])

# 3) sonido: la música + los sonidos del juego de cada toma (más bajos) + un estampido final que tapa el corte de la música
snd = {s['id']: s['log'] for s in json.load(open(D + '/sonido2.json'))}
FILES = {}
for n in sorted(os.listdir(REPO + '/snd')):
    FILES.setdefault(n.rsplit('_', 1)[0], f'{REPO}/snd/{n}')
ev = []
for S in TOMAS:
    last = collections.defaultdict(lambda: -9)
    for e in snd.get(S['id'], []):
        if e['v'] < .15 or e['n'] not in FILES or e['n'] in ('squelch', 'static', 'idle', 'drive', 'turret', 'mgburst'): continue
        if e['t'] - last[e['n']] < .25 or e['t'] > S['ed'][1] - S['ed'][0]: continue
        last[e['n']] = e['t']; ev.append((S['ed'][0] + e['t'], e['n'], min(1, e['v']), e.get('r', 1)))
ev.append((17.95+DX, 'nukeb', 1.0, 1)); ev.append((17.97+DX, 'expl', 1.0, .5)); ev.append((18.0+DX, 'sboom', .9, .6)); ev.append((18.7+DX, 'expl', .7, .38))   # la nuke en el último golpe
ains = ['-i', MUS]; afl = [f"[0:a]afade=t=in:d=0.05,afade=t=out:st={17.85+DX:.2f}:d=0.3,apad=whole_dur={END}[m]"]
for i, (t, n, vol, r) in enumerate(ev):
    ains += ['-i', FILES[n]]; ms = int(t * 1000)
    afl.append(f"[{i+1}:a]atempo={max(.5, min(2, r)):.2f},volume={vol*.55:.2f},adelay={ms}|{ms}[e{i}]")
afl.append('[m]' + ''.join(f'[e{i}]' for i in range(len(ev))) + f"amix=inputs={len(ev)+1}:normalize=0,aecho=0.8:0.5:60|140:0.18|0.1,"
           f"atrim=0:{END},afade=t=out:st={END-1.6:.2f}:d=1.6,alimiter=limit=.93[a]")
audio = f'{T}/audio.m4a'
run(['ffmpeg', '-v', 'error', '-y', *ains, '-filter_complex', ';'.join(afl), '-map', '[a]', '-c:a', 'aac', '-b:a', '160k', '-ar', '44100', audio])

# 4) cierre: fogonazo blanco de la nuke en el último golpe (17,95 s), el hongo sube y después entra la portada y se acerca despacio
FL = 17.95 + DX; F = END - 1.5
for lang, cov, out in (('es', 'portada-nueva.jpg', 'intro.mp4'), ('en', 'portada-en.jpg', 'intro-en.mp4')):
    d = END - F
    vfc = (f"[1:v]scale=-2:1360,crop=2400:1350,zoompan=z='1+0.035*on/{int(d*FPS)}':x='iw/2-(iw/zoom/2)':y='0':d={int(d*FPS)+1}:s={Wd}x{Hd}:fps={FPS},"
           f"setpts=PTS-STARTPTS+{F}/TB,format=yuva420p,fade=t=in:st={F}:d=0.6:alpha=1[cv];"
           f"[0:v][cv]overlay=eof_action=pass,"
           f"geq=lum='min(255,lum(X,Y)+255*max(0,1-abs(T-{FL+.05})/.22))':cb='cb(X,Y)':cr='cr(X,Y)'[v]")  # sin fundido a negro: el menú aparece sobre la misma portada
    run(['ffmpeg', '-v', 'error', '-y', '-i', base, '-i', f'{REPO}/img/{cov}', '-i', audio, '-filter_complex', vfc,
         '-map', '[v]', '-map', '2:a', '-t', f'{END}', '-r', str(FPS), '-c:v', 'libx264', '-crf', '25', '-maxrate', '3000k', '-bufsize', '6000k',
         '-preset', 'slow', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', f'{REPO}/video/{out}'])
    print('listo', out, os.path.getsize(f'{REPO}/video/{out}') // 1024, 'KB')
