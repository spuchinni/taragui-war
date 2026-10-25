# Baja los datos reales de un lugar (OpenStreetMap + relieve) y los deja listos para el juego.
#   python herramientas/osm/bajar.py centro            -> js/osm/centro.json (+ vista previa en herramientas/osm/prev/centro.png)
#   python herramientas/osm/bajar.py todos
# Fuentes: calles, edificios, usos del suelo y árboles de Overpass (© OpenStreetMap, ODbL);
# agua de las teselas de openstreetmap.org (el color del agua) y relieve de las teselas Terrarium (AWS, SRTM y otros).
# Lo bajado queda en herramientas/osm/cache/ para no volver a pedirlo.
import json, math, os, sys, io, time, urllib.request, urllib.parse, hashlib
from PIL import Image, ImageDraw, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
CACHE = os.path.join(AQUI, 'cache'); os.makedirs(CACHE, exist_ok=True)
PREV = os.path.join(AQUI, 'prev'); os.makedirs(PREV, exist_ok=True)
SALIDA = os.path.join(RAIZ, 'js', 'osm'); os.makedirs(SALIDA, exist_ok=True)
UA = 'taragui-war-mapas/1.0 (juego de tanques, github.com/spuchinni/taragui-war)'
LUGARES = json.load(open(os.path.join(AQUI, 'lugares.json'), encoding='utf-8'))

def pedir(url, data=None, nombre=None, intentos=4):
    ruta = os.path.join(CACHE, nombre or hashlib.md5((url + (data or '')).encode()).hexdigest())
    if os.path.exists(ruta):
        return open(ruta, 'rb').read()
    for k in range(intentos):
        try:
            req = urllib.request.Request(url, data=data.encode() if data else None, headers={'User-Agent': UA})
            b = urllib.request.urlopen(req, timeout=240).read()
            open(ruta, 'wb').write(b); return b
        except Exception as e:
            print('  reintento', k + 1, e); time.sleep(5 + 10 * k)
    raise SystemExit('no se pudo bajar ' + url)

# ---------- proyección: metros locales (este, norte) alrededor del centro, girados ----------
class Proy:
    def __init__(s, L):
        s.lat0, s.lon0 = L['lat'], L['lon']; s.kx = 111320 * math.cos(math.radians(s.lat0)); s.ky = 110540
        r = math.radians(L.get('rot', 0)); s.c, s.s = math.cos(r), math.sin(r)
    def en(s, lat, lon):  # -> (este, norte) girados
        e, n = (lon - s.lon0) * s.kx, (lat - s.lat0) * s.ky
        return e * s.c - n * s.s, e * s.s + n * s.c
    def ll(s, e, n):  # inversa
        e0, n0 = e * s.c + n * s.s, -e * s.s + n * s.c
        return s.lat0 + n0 / s.ky, s.lon0 + e0 / s.kx

def bbox(P, EX, EZ):
    pts = [P.ll(e, n) for e in (-EX, EX) for n in (-EZ, EZ)]
    return min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts)

# ---------- teselas ----------
def tile_xy(lat, lon, z):
    n = 2 ** z; x = (lon + 180) / 360 * n
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
    return x, y

def mosaico(url_fmt, z, bb, pref):
    s, w, n, e = bb
    x0, y0 = tile_xy(n, w, z); x1, y1 = tile_xy(s, e, z)
    tx0, ty0, tx1, ty1 = int(x0), int(y0), int(x1), int(y1)
    img = None
    for ty in range(ty0, ty1 + 1):
        for tx in range(tx0, tx1 + 1):
            b = pedir(url_fmt.format(z=z, x=tx, y=ty), nombre=f'{pref}_{z}_{tx}_{ty}.png')
            t = Image.open(io.BytesIO(b)).convert('RGB')
            if img is None: T = t.size[0]; img = Image.new('RGB', ((tx1 - tx0 + 1) * T, (ty1 - ty0 + 1) * T))
            img.paste(t, ((tx - tx0) * T, (ty - ty0) * T))
            if 'openstreetmap' in url_fmt: time.sleep(.3)
    T = img.size[0] // (tx1 - tx0 + 1)
    def px(lat, lon):
        x, y = tile_xy(lat, lon, z); return (x - tx0) * T, (y - ty0) * T
    return img, px

def bilin(img, x, y):
    w, h = img.size; x = min(max(x, 0), w - 1.001); y = min(max(y, 0), h - 1.001)
    i, j = int(x), int(y); u, v = x - i, y - j; p = img.load()
    return [(1 - u) * (1 - v) * p[i, j][k] + u * (1 - v) * p[i + 1, j][k] + (1 - u) * v * p[i, j + 1][k] + u * v * p[i + 1, j + 1][k] for k in range(3)]

# ---------- geometría ----------
def area(P):
    return abs(sum(P[i][0] * P[i - 1][1] - P[i - 1][0] * P[i][1] for i in range(len(P)))) / 2

def casco(P):
    P = sorted(set(P))
    if len(P) < 3: return P
    def cr(o, a, b): return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo, hi = [], []
    for p in P:
        while len(lo) >= 2 and cr(lo[-2], lo[-1], p) <= 0: lo.pop()
        lo.append(p)
    for p in reversed(P):
        while len(hi) >= 2 and cr(hi[-2], hi[-1], p) <= 0: hi.pop()
        hi.append(p)
    return lo[:-1] + hi[:-1]

def obb(P):  # rectángulo mínimo: (cx, cz, w, d, ang)
    H = casco(P); best = None
    for i in range(len(H)):
        a = math.atan2(H[i][1] - H[i - 1][1], H[i][0] - H[i - 1][0]); c, s = math.cos(a), math.sin(a)
        us = [p[0] * c + p[1] * s for p in H]; vs = [-p[0] * s + p[1] * c for p in H]
        A = (max(us) - min(us)) * (max(vs) - min(vs))
        if best is None or A < best[0]: best = (A, a, min(us), max(us), min(vs), max(vs))
    A, a, u0, u1, v0, v1 = best; c, s = math.cos(a), math.sin(a); uc, vc = (u0 + u1) / 2, (v0 + v1) / 2
    return uc * c - vc * s, uc * s + vc * c, u1 - u0, v1 - v0, a

def en_poly(x, y, P):
    c = False; j = len(P) - 1
    for i in range(len(P)):
        if (P[i][1] > y) != (P[j][1] > y) and x < (P[j][0] - P[i][0]) * (y - P[i][1]) / (P[j][1] - P[i][1] + 1e-12) + P[i][0]: c = not c
        j = i
    return c

def rectangulos(P, maxn=5):
    """Parte una planta en hasta maxn rectángulos (en el marco del rectángulo mínimo)."""
    cx, cz, w, d, a = obb(P)
    if w < 1 or d < 1: return []
    ap = area(P)
    if ap / (w * d) > .82 or maxn == 1: return [(cx, cz, w, d, a)]
    c, s = math.cos(a), math.sin(a); R = 1.0 if max(w, d) < 120 else max(w, d) / 120
    nu, nv = max(1, int(w / R + .5)), max(1, int(d / R + .5)); du, dv = w / nu, d / nv
    Q = [((p[0] - cx) * c + (p[1] - cz) * s, -(p[0] - cx) * s + (p[1] - cz) * c) for p in P]
    G = [[en_poly(-w / 2 + (i + .5) * du, -d / 2 + (j + .5) * dv, Q) for i in range(nu)] for j in range(nv)]
    tot = sum(map(sum, G)); out = []; cub = 0
    while len(out) < maxn and tot and cub < tot * .9:
        best = None; hgt = [0] * nu
        for j in range(nv):
            for i in range(nu): hgt[i] = hgt[i] + 1 if G[j][i] else 0
            st = []
            for i in range(nu + 1):
                h = hgt[i] if i < nu else 0; i0 = i
                while st and st[-1][1] >= h:
                    i0, hh = st.pop(); A = hh * (i - i0)
                    if best is None or A > best[0]: best = (A, i0, i, j - hh + 1, j + 1)
                st.append((i0, h))
        if not best or best[0] * du * dv < 12: break
        A, i0, i1, j0, j1 = best
        for j in range(j0, j1):
            for i in range(i0, i1): G[j][i] = False
        cub += A; uc, vc = -w / 2 + (i0 + i1) / 2 * du, -d / 2 + (j0 + j1) / 2 * dv
        out.append((cx + uc * c - vc * s, cz + uc * s + vc * c, (i1 - i0) * du, (j1 - j0) * dv, a))
    return out

# ---------- clasificación OSM ----------
ANCHO = {'motorway': 14, 'trunk': 12, 'primary': 11, 'secondary': 10, 'tertiary': 9, 'unclassified': 7, 'residential': 7.5, 'living_street': 6,
         'service': 4.5, 'track': 4, 'pedestrian': 6, 'footway': 2, 'path': 1.6, 'cycleway': 2, 'steps': 2, 'road': 7}
TIPOS_CALLE = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'residential', 'living_street', 'service', 'track', 'pedestrian', 'footway', 'path', 'cycleway', 'steps', 'road', 'rail', 'runway', 'taxiway', 'dam']
AREAS = ['bosque', 'monte', 'pasto', 'parque', 'campo', 'cancha', 'arena', 'banado', 'cementerio', 'estacionamiento', 'industrial', 'barrio', 'comercio', 'roca', 'nieve', 'pista', 'plaza', 'golf', 'turba']

def tipo_area(t):
    n, l, le = t.get('natural'), t.get('landuse'), t.get('leisure')
    if n == 'wood' or l == 'forest': return 'bosque'
    if n in ('scrub', 'heath') : return 'monte'
    if n in ('grassland',) or l in ('grass', 'meadow', 'village_green', 'recreation_ground'): return 'pasto'
    if le in ('park', 'garden', 'nature_reserve'): return 'parque'
    if l in ('farmland', 'farmyard', 'orchard', 'plant_nursery', 'greenfield', 'vineyard', 'allotments'): return 'campo'
    if le in ('pitch', 'stadium', 'track', 'sports_centre'): return 'cancha'
    if le == 'golf_course': return 'golf'
    if n in ('sand', 'beach') or l == 'quarry': return 'arena'
    if n == 'wetland': return 'banado'
    if l == 'cemetery' or t.get('amenity') == 'grave_yard': return 'cementerio'
    if t.get('amenity') == 'parking': return 'estacionamiento'
    if l in ('industrial', 'railway', 'military', 'construction', 'brownfield'): return 'industrial'
    if l in ('residential',): return 'barrio'
    if l in ('commercial', 'retail'): return 'comercio'
    if n in ('bare_rock', 'scree', 'rock', 'stone', 'shingle'): return 'roca'
    if n == 'glacier': return 'nieve'
    if t.get('aeroway') in ('aerodrome',): return 'pasto'
    if t.get('aeroway') == 'apron': return 'pista'
    if t.get('place') == 'square' or (t.get('highway') == 'pedestrian' and t.get('area') == 'yes'): return 'plaza'
    return None

def altura(t, Lc, hsh):
    for k in ('height', 'building:height'):
        if k in t:
            try: return float(t[k].replace('m', '').replace(',', '.').split()[0])
            except Exception: pass
    if 'building:levels' in t:
        try: return max(1, float(t['building:levels'].split(';')[0].replace(',', '.'))) * 3.1 + .6
        except Exception: pass
    b = t.get('building', 'yes'); r = (hsh % 1000) / 1000
    if b in ('garage', 'shed', 'roof', 'carport', 'hut', 'kiosk', 'toilets'): return 2.8
    if b in ('church', 'cathedral'): return 14
    if b in ('industrial', 'warehouse', 'hangar', 'retail', 'supermarket', 'commercial'): return 7 + 3 * r
    if b in ('apartments', 'office', 'hotel'): return 3.1 * (4 + int(r * 8)) + .6
    base = Lc.get('pisos', [1, 1, 1, 2])  # pisos posibles para las casas sin dato (según el barrio)
    return 3.1 * base[int(r * len(base))] + .4

# ---------- principal ----------
def procesar(key):
    L = LUGARES[key]; P = Proy(L); hx, hz, M = L['hx'], L['hz'], L.get('margen', 260)
    EX, EZ = hx + M, hz + M; bb = bbox(P, EX + 40, EZ + 40)
    print(f'{key}: {L["nombre"]}  {2*hx:.0f} x {2*hz:.0f} m jugables, datos {2*EX:.0f} x {2*EZ:.0f} m')
    q = f"""[out:json][timeout:200][bbox:{bb[0]:.6f},{bb[1]:.6f},{bb[2]:.6f},{bb[3]:.6f}];
(way[highway]; way[railway~"^(rail|tram|light_rail|narrow_gauge)$"]; way[aeroway~"^(runway|taxiway|apron|aerodrome)$"];
 way[building]; way["building:part"]; rel[building];
 way[landuse]; way[natural~"^(wood|scrub|heath|grassland|sand|beach|wetland|bare_rock|scree|glacier|shingle)$"]; rel[natural~"^(wood|scrub|wetland|sand|beach|bare_rock|scree|glacier|grassland|heath)$"]; rel[landuse~"^(forest|residential|farmland|meadow|grass|industrial|cemetery)$"];
 way[leisure~"^(park|pitch|golf_course|garden|stadium|track|sports_centre|nature_reserve)$"]; way[amenity~"^(parking|grave_yard)$"]; way[place=square];
 way[waterway~"^(dam|weir)$"]; way[man_made~"^(pier|breakwater|groyne|dyke)$"]; way[barrier~"^(wall|retaining_wall|city_wall)$"];
 node[natural=tree]; node[natural~"^(peak|hill)$"]; nwr[amenity~"^(place_of_worship|hospital|school|police|fire_station|fuel|townhall|university|bus_station)$"]; nwr[tourism~"^(attraction|museum|monument)$"]; nwr[historic]; nwr[leisure~"^(stadium|park)$"][name]; nwr[shop~"^(supermarket|mall)$"]; nwr[place~"^(neighbourhood|suburb|village|hamlet|locality|square|island)$"]; nwr[aeroway=aerodrome]; nwr[man_made~"^(tower|water_tower|lighthouse)$"];
);
out geom qt;"""
    d = json.loads(pedir('https://overpass-api.de/api/interpreter', data=urllib.parse.urlencode({'data': q}), nombre=f'ov_{key}_{hashlib.md5(q.encode()).hexdigest()[:8]}.json'))
    els = d['elements']; print('  elementos OSM:', len(els))
    loc = lambda g: [P.en(p['lat'], p['lon']) for p in g if p]
    dm = lambda v: int(round(v * 10))
    names = []; ni = lambda s: (names.index(s) if s in names else (names.append(s) or len(names) - 1)) if s else -1
    roads, blds, areas, trees, pois, walls = [], [], [], [], [], []
    def poly_rel(e):  # anillos exteriores de una multipolígono (une los tramos)
        segs = [loc(m['geometry']) for m in e.get('members', []) if m.get('role') == 'outer' and m.get('geometry')]
        rings = []
        while segs:
            r = segs.pop(0)
            for _ in range(len(segs) + 1):
                if len(r) > 2 and math.dist(r[0], r[-1]) < .5: break
                for i, s2 in enumerate(segs):
                    if math.dist(r[-1], s2[0]) < .5: r += s2[1:]; segs.pop(i); break
                    if math.dist(r[-1], s2[-1]) < .5: r += s2[::-1][1:]; segs.pop(i); break
                else: break
            if len(r) > 3: rings.append(r)
        return rings
    lim = lambda pts: any(abs(x) < EX + 30 and abs(y) < EZ + 30 for x, y in pts)
    for e in els:
        t = e.get('tags', {})
        if e['type'] == 'node':
            x, y = P.en(e['lat'], e['lon'])
            if abs(x) > EX or abs(y) > EZ: continue
            if t.get('natural') == 'tree': trees += [dm(x), dm(y)]
            else: pois.append([t.get('name', ''), dm(x), dm(y), poi_tipo(t)])
            continue
        g = e.get('geometry'); rings = []
        if e['type'] == 'way' and g: rings = [loc(g)]
        elif e['type'] == 'relation': rings = poly_rel(e)
        rings = [r for r in rings if lim(r)]
        if not rings: continue
        if t.get('name') and (t.get('amenity') or t.get('tourism') or t.get('historic') or t.get('leisure') in ('stadium', 'park') or t.get('shop') or t.get('place') or t.get('aeroway') == 'aerodrome' or t.get('man_made')) and e['type'] != 'node':
            r = rings[0]; cx = sum(p[0] for p in r) / len(r); cy = sum(p[1] for p in r) / len(r)
            if abs(cx) < EX and abs(cy) < EZ: pois.append([t['name'], dm(cx), dm(cy), poi_tipo(t)])
        if 'building' in t or 'building:part' in t:
            if t.get('building') in ('no',) or t.get('building:part') == 'no': continue
            for r in rings:
                if len(r) < 4 or area(r) < 10: continue
                hsh = int(hashlib.md5(str(e['id']).encode()).hexdigest()[:8], 16)
                h = altura(t, L, hsh)
                try: lv_min = float(t.get('min_height', t.get('building:min_level', 0)) or 0)
                except Exception: lv_min = 0
                if lv_min > 0 and 'building:part' in t: continue  # partes elevadas (voladizos): no
                kind = 0 if t.get('building') in ('house', 'detached', 'residential', 'semidetached_house', 'terrace', 'yes', 'bungalow', 'farm', 'cabin') else 1 if t.get('building') in ('church', 'cathedral', 'chapel') else 2
                if h > 40 and area(r) < 60: h = 12
                for (cx, cz, w, dd, a) in rectangulos(r, 1 if area(r) < 70 else 5):
                    if w * dd < 9: continue
                    blds.append([dm(cx), dm(cz), dm(w), dm(dd), int(round(a * 1000)), dm(h), kind, hsh % 997])
            continue
        if t.get('highway') and e['type'] == 'way' and t.get('area') != 'yes':
            hw = t['highway']
            if hw in ('proposed', 'construction', 'platform', 'bus_stop', 'elevator', 'corridor', 'raceway', 'bridleway'): continue
            if hw.endswith('_link'): hw = hw[:-5]
            if hw not in ANCHO: hw = 'road'
            w = ANCHO[hw]
            try:
                if 'width' in t: w = max(2, min(30, float(t['width'].replace('m', '').replace(',', '.').split()[0])))
                elif 'lanes' in t and hw not in ('footway', 'path', 'track'): w = max(w, int(t['lanes'].split(';')[0]) * 3.3 + 1)
            except Exception: pass
            if t.get('oneway') == 'yes' and hw in ('primary', 'secondary', 'trunk', 'tertiary') and 'width' not in t and 'lanes' not in t: w *= .75
            fl = (1 if t.get('bridge') and t['bridge'] != 'no' else 0) | (2 if t.get('tunnel') and t['tunnel'] != 'no' else 0) | (4 if t.get('surface') in ('unpaved', 'dirt', 'gravel', 'ground', 'sand', 'grass', 'earth', 'compacted', 'fine_gravel') or hw == 'track' else 0)
            try: lay = int(t.get('layer', '0'))
            except Exception: lay = 0
            roads.append([TIPOS_CALLE.index(hw), dm(w), fl, lay, ni(t.get('name'))] + [dm(c) for p in rings[0] for c in p])
            continue
        if t.get('railway') and e['type'] == 'way':
            fl = 1 if t.get('bridge') and t['bridge'] != 'no' else 0
            roads.append([TIPOS_CALLE.index('rail'), 30, fl, 0, ni(t.get('name'))] + [dm(c) for p in rings[0] for c in p]); continue
        if t.get('aeroway') in ('runway', 'taxiway') and e['type'] == 'way':
            w = 45 if t['aeroway'] == 'runway' else 18
            try: w = float(t.get('width', w))
            except Exception: pass
            roads.append([TIPOS_CALLE.index(t['aeroway']), dm(w), 0, 0, ni(t.get('ref'))] + [dm(c) for p in rings[0] for c in p]); continue
        if t.get('waterway') in ('dam', 'weir') or t.get('man_made') in ('pier', 'breakwater', 'groyne', 'dyke'):
            r = rings[0]; closed = math.dist(r[0], r[-1]) < .5 and len(r) > 3
            if closed: areas.append([AREAS.index('industrial'), 1] + [dm(c) for p in r for c in p])
            else: roads.append([TIPOS_CALLE.index('dam'), dm(float(t.get('width', '6').split()[0]) if t.get('width', '').replace('.', '').isdigit() else 60), 0, 0, ni(t.get('name'))] + [dm(c) for p in r for c in p])
            continue
        if t.get('barrier') in ('wall', 'retaining_wall', 'city_wall') and e['type'] == 'way':
            walls.append([dm(c) for p in rings[0] for c in p]); continue
        ta = tipo_area(t)
        if ta:
            for r in rings:
                if len(r) > 3 and math.dist(r[0], r[-1]) < 1: areas.append([AREAS.index(ta), 0] + [dm(c) for p in r for c in p])
    # ---------- agua: color del agua en las teselas de openstreetmap.org ----------
    RW = 2.0; nxw, nzw = int(2 * EX / RW) + 1, int(2 * EZ / RW) + 1
    img, px = mosaico('https://tile.openstreetmap.org/{z}/{x}/{y}.png', 16, bb, 'osm')
    mask = Image.new('L', img.size, 0); pi, pm = img.load(), mask.load()
    for y in range(img.size[1]):
        for x in range(img.size[0]):
            r, g, b = pi[x, y]
            if abs(r - 170) < 14 and abs(g - 211) < 12 and abs(b - 223) < 12: pm[x, y] = 255
    # cierre morfológico: tapa los nombres escritos sobre el agua y los puentes (debajo hay agua)
    mask = mask.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    water = bytearray(nxw * nzw)
    for j in range(nzw):
        z = -EZ + j * RW
        for i in range(nxw):
            x = -EX + i * RW; la, lo = P.ll(x, z); X, Y = px(la, lo)
            if 0 <= X < mask.size[0] and 0 <= Y < mask.size[1] and mask.getpixel((int(X), int(Y))) > 127: water[j * nxw + i] = 1
    # ---------- relieve: teselas Terrarium ----------
    zt = L.get('zrel', 14); RE = L.get('rres', 10.0)
    ter, tpx = mosaico('https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png', zt, bb, 'ter')
    nxe, nze = int(2 * EX / RE) + 1, int(2 * EZ / RE) + 1; elev = []
    for j in range(nze):
        z = -EZ + j * RE
        for i in range(nxe):
            x = -EX + i * RE; la, lo = P.ll(x, z); X, Y = tpx(la, lo); r, g, b = bilin(ter, X, Y)
            elev.append(r * 256 + g + b / 256 - 32768)
    # las teselas a veces traen celdas rotas (picos de miles de metros): mediana 3x3 donde un punto se despega demasiado
    lim = L.get('pico', 25)
    for _ in range(2):
        e2 = elev[:]
        for j in range(nze):
            for i in range(nxe):
                vs = sorted(elev[b * nxe + a] for b in range(max(0, j - 1), min(nze, j + 2)) for a in range(max(0, i - 1), min(nxe, i + 2)))
                m = vs[len(vs) // 2]
                if abs(elev[j * nxe + i] - m) > lim: e2[j * nxe + i] = m
        elev = e2
    srt = sorted(elev); lo, hi = srt[len(srt) // 200], srt[-len(srt) // 200 - 1]
    if not L.get('montana'): elev = [min(hi, max(lo, v)) for v in elev]
    # nivel del agua: la mediana del relieve donde hay agua
    wv = sorted(elev[j * nxe + i] for j in range(nze) for i in range(nxe) if water[min(nzw - 1, int(j * RE / RW)) * nxw + min(nxw - 1, int(i * RE / RW))])
    wl = wv[len(wv) // 2] if len(wv) > 20 else None
    if L.get('sinAgua'): wl = None  # montaña: los arroyos están a distintas alturas, no hay un nivel de agua único
    base = wl if wl is not None else min(elev)
    out = {'v': 1, 'key': key, 'nombre': L['nombre'], 'fuente': '© colaboradores de OpenStreetMap (ODbL); relieve: Terrarium/Mapzen', 'fecha': time.strftime('%Y-%m-%d'),
           'hx': hx, 'hz': hz, 'ex': EX, 'ez': EZ, 'lat': L['lat'], 'lon': L['lon'], 'rot': L.get('rot', 0),
           'elev': {'r': RE, 'nx': nxe, 'nz': nze, 'd': [int(round((v - base) * 10)) for v in elev]},
           'agua': {'r': RW, 'nx': nxw, 'nz': nzw, 'rle': rle(water)} if wl is not None else None,
           'nombres': names, 'calles': roads, 'edif': blds, 'areas': areas, 'arboles': trees, 'pois': pois, 'muros': walls}
    js = json.dumps(out, ensure_ascii=False, separators=(',', ':'))
    open(os.path.join(SALIDA, key + '.json'), 'w', encoding='utf-8').write(js)
    print(f'  calles {len(roads)}, edificios {len(blds)}, áreas {len(areas)}, árboles {len(trees)//2}, lugares {len(pois)}, agua {"sí" if wl is not None else "no"}, desnivel {max(elev)-min(elev):.0f} m, {len(js)//1024} KB')
    vista(out, key)

def poi_tipo(t):
    for k in ('amenity', 'tourism', 'historic', 'leisure', 'shop', 'place', 'natural', 'aeroway', 'man_made'):
        if k in t: return k + '=' + t[k]
    return ''

def rle(b):
    out, cur, n = [], 0, 0
    for v in b:
        if v == cur: n += 1
        else: out.append(n); cur, n = v, 1
    out.append(n); return out

def vista(D, key):
    S = 1400; EX, EZ = D['ex'], D['ez']; k = S / (2 * max(EX, EZ))
    im = Image.new('RGB', (S, S), (120, 140, 90)); dr = ImageDraw.Draw(im)
    tp = lambda x, z: (S / 2 + x * k, S / 2 - z * k)  # este a la derecha, norte arriba
    COL = {'bosque': (60, 95, 50), 'monte': (100, 120, 60), 'pasto': (140, 165, 100), 'parque': (110, 160, 90), 'campo': (190, 180, 120), 'cancha': (90, 170, 90), 'arena': (225, 210, 160),
           'banado': (100, 140, 120), 'cementerio': (150, 170, 140), 'estacionamiento': (180, 180, 180), 'industrial': (190, 170, 170), 'barrio': (200, 195, 185), 'comercio': (215, 190, 190),
           'roca': (150, 145, 140), 'nieve': (240, 240, 245), 'pista': (170, 170, 175), 'plaza': (210, 200, 190), 'golf': (150, 200, 120), 'turba': (130, 120, 80)}
    for a in sorted(D['areas'], key=lambda a: -area([(a[i] / 10, a[i + 1] / 10) for i in range(2, len(a), 2)])):
        pts = [tp(a[i] / 10, a[i + 1] / 10) for i in range(2, len(a), 2)]
        if len(pts) > 2: dr.polygon(pts, fill=COL[AREAS[a[0]]])
    A = D['agua']
    if A:
        i = 0; v = 0
        for n in A['rle']:
            if v:
                for q in range(i, i + n):
                    x = -EX + (q % A['nx']) * A['r']; z = -EZ + (q // A['nx']) * A['r']; X, Y = tp(x, z); dr.rectangle([X, Y, X + A['r'] * k, Y + A['r'] * k], fill=(70, 120, 170))
            i += n; v ^= 1
    for r in D['calles']:
        pts = [tp(r[i] / 10, r[i + 1] / 10) for i in range(5, len(r), 2)]
        col = (60, 60, 60) if r[0] == 16 else (250, 250, 240) if r[2] & 1 else (235, 225, 200) if r[2] & 4 else (245, 245, 245)
        dr.line(pts, fill=col, width=max(1, int(r[1] / 10 * k)))
    for b in D['edif']:
        cx, cz, w, d, a = b[0] / 10, b[1] / 10, b[2] / 10, b[3] / 10, b[4] / 1000; c, s = math.cos(a), math.sin(a)
        pts = [tp(cx + u * c - v * s, cz + u * s + v * c) for u, v in ((-w / 2, -d / 2), (w / 2, -d / 2), (w / 2, d / 2), (-w / 2, d / 2))]
        h = b[5] / 10; g = max(60, 200 - int(h * 3)); dr.polygon(pts, fill=(g, g - 10, g - 25))
    for i in range(0, len(D['arboles']), 2):
        X, Y = tp(D['arboles'][i] / 10, D['arboles'][i + 1] / 10); dr.ellipse([X - 2, Y - 2, X + 2, Y + 2], fill=(30, 80, 30))
    hx, hz = D['hx'], D['hz']; dr.rectangle([*tp(-hx, hz), *tp(hx, -hz)], outline=(255, 40, 30), width=3)
    for p in D['pois']:
        if p[0]: X, Y = tp(p[1] / 10, p[2] / 10); dr.text((X, Y), p[0][:28], fill=(0, 0, 0))
    im.save(os.path.join(PREV, key + '.png'))

if __name__ == '__main__':
    ks = list(LUGARES) if sys.argv[1:] == ['todos'] else sys.argv[1:]
    for k in ks: procesar(k)
