# Lista los lugares con nombre de un mapa en coordenadas del juego (x = oeste, z = norte), para elegir zonas y bases.
import json, sys, os
D = json.load(open(os.path.join(os.path.dirname(__file__), '..', '..', 'js', 'osm', sys.argv[1] + '.json'), encoding='utf-8'))
for n, x, z, k in sorted(D['pois'], key=lambda p: (p[3], p[0])):
    if n and abs(x) < D['hx'] * 10 + 1500 and abs(z) < D['hz'] * 10 + 1500: print(f'{-x/10:8.0f} {z/10:8.0f}  {k:28s} {n}')
