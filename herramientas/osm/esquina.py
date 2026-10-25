# Calles más cercanas a un punto del juego:  python esquina.py centro x z
import json, sys, os, math
D = json.load(open(os.path.join(os.path.dirname(__file__), '..', '..', 'js', 'osm', sys.argv[1] + '.json'), encoding='utf-8'))
x, z = -float(sys.argv[2]) * 10, float(sys.argv[3]) * 10
best = {}
for r in D['calles']:
    if r[4] < 0: continue
    n = D['nombres'][r[4]]; p = r[5:]
    for i in range(0, len(p) - 2, 2):
        ax, az, bx, bz = p[i], p[i + 1], p[i + 2], p[i + 3]; dx, dz = bx - ax, bz - az; L = dx * dx + dz * dz
        t = max(0, min(1, ((x - ax) * dx + (z - az) * dz) / L)) if L else 0
        d = math.hypot(x - ax - dx * t, z - az - dz * t) / 10
        if d < best.get(n, 1e9): best[n] = d
for n, d in sorted(best.items(), key=lambda a: a[1])[:4]: print(f'{d:6.0f} m  {n}')
