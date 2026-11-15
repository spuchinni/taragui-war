// Basílica de Nuestra Señora de Itatí (Corrientes) — modelo hecho por código para Taragüí War.
// Taragüí War: la usa el mapa real de Itatí (osm-mapas.js, osmBasilica).
// Uso:  const basilica = crearBasilicaItati(THREE);  scene.add(basilica);
// Escala real en metros: planta 63 (X) x 81 (Z), altura total ~88 m. Frente mirando a +Z.
// Se arma con ~340 piezas y al final se une en una malla por material (9 llamadas de dibujo). Para LOD lejano usar crearBasilicaItati(THREE, {simple:true}).
function crearBasilicaItati(THREE, opts = {}) {
  const simple = !!opts.simple;
  const g = new THREE.Group();
  g.name = 'BasilicaItati';

  const M = {
    pared:   new THREE.MeshLambertMaterial({ color: 0xe8dcc6 }),
    piedra:  new THREE.MeshLambertMaterial({ color: 0xcdbfa6 }),
    cornisa: new THREE.MeshLambertMaterial({ color: 0xf4ede0 }),
    techo:   new THREE.MeshLambertMaterial({ color: 0xa89a88 }),
    cupula:  new THREE.MeshPhongMaterial({ color: 0x3e4a52, specular: 0x667788, shininess: 40 }),
    nervio:  new THREE.MeshLambertMaterial({ color: 0xd9d2c4 }),
    vidrio:  new THREE.MeshPhongMaterial({ color: 0x1d2228, specular: 0x445566, shininess: 60 }),
    puerta:  new THREE.MeshLambertMaterial({ color: 0x5a3a22 }),
    cobre:   new THREE.MeshPhongMaterial({ color: 0xc9a24a, specular: 0xffe0a0, shininess: 70 }),
  };

  const add = (geo, mat, x, y, z, parent = g) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const box = (w, h, d, mat, x, y, z, p) => add(new THREE.BoxGeometry(w, h, d), mat, x, y + h / 2, z, p);
  const cyl = (rt, rb, h, mat, x, y, z, seg = 16, p) =>
    add(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y + h / 2, z, p);

  // Frontón triangular (extruido), ancho w, alto h, profundidad d; rotY orienta.
  const fronton = (w, h, d, x, y, z, rotY) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
    geo.translate(0, 0, -d / 2);
    const m = add(geo, M.cornisa, x, y, z);
    m.rotation.y = rotY;
    return m;
  };

  // Ventanas: rectángulo oscuro con arco, pegado a una cara.
  const ventana = (w, h, x, y, z, rotY, parent = g) => {
    const v = new THREE.Group();
    box(w, h, 0.3, M.vidrio, 0, 0, 0, v);
    const arco = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, 0.3, 12, 1, false, 0, Math.PI), M.vidrio);
    arco.rotation.set(Math.PI / 2, 0, Math.PI / 2); arco.position.y = h;
    v.add(arco);
    box(w + 0.6, 0.4, 0.5, M.cornisa, 0, -0.4, 0.1, v);
    v.position.set(x, y, z); v.rotation.y = rotY;
    parent.add(v);
    return v;
  };

  // ---------- Basamento y escalinata ----------
  box(66, 1.2, 84, M.piedra, 0, 0, 0);
  for (let i = 0; i < 4; i++) box(24, 0.3, 1.2, M.piedra, 0, 1.2 - i * 0.3 - 0.3, 42 + 1.2 * i + 0.6);

  // ---------- Cuerpo en cruz griega ----------
  const H = 20;            // altura de muros
  const y0 = 1.2;
  box(40, H, 40, M.pared, 0, y0, 0);              // crucero central
  box(26, H - 2, 81 - 6, M.pared, 0, y0, 0);      // nave (frente-fondo)
  box(63, H - 2, 24, M.pared, 0, y0, 0);          // transepto
  // Esquinas rebajadas (capillas) para que no sea un cubo
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    box(10, H - 6, 10, M.pared, sx * 18, y0, sz * 18);

  // Cornisas
  box(41, 1, 41, M.cornisa, 0, y0 + H, 0);
  box(27, 1, 76, M.cornisa, 0, y0 + H - 2, 0);
  box(64, 1, 25, M.cornisa, 0, y0 + H - 2, 0);
  // Techos a dos aguas sobre brazos
  const techo2 = (len, ancho, x, z, rotY) => {
    const s = new THREE.Shape();
    s.moveTo(-ancho / 2, 0); s.lineTo(ancho / 2, 0); s.lineTo(0, 5); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
    geo.translate(0, 0, -len / 2);
    const m = add(geo, M.techo, x, y0 + H - 1, z); m.rotation.y = rotY;
  };
  techo2(18, 26, 0, 28.5, 0);  techo2(18, 26, 0, -28.5, 0);
  techo2(12, 24, 25.5, 0, Math.PI / 2); techo2(12, 24, -25.5, 0, Math.PI / 2);
  // Frontones en los 4 brazos
  fronton(27, 5.6, 1.2, 0, y0 + H - 1, 37.6, 0);
  fronton(27, 5.6, 1.2, 0, y0 + H - 1, -37.6, 0);
  fronton(25, 5.4, 1.2, 31.6, y0 + H - 1, 0, Math.PI / 2);
  fronton(25, 5.4, 1.2, -31.6, y0 + H - 1, 0, Math.PI / 2);

  // Pilastras en las fachadas
  if (!simple) {
    for (const px of [-12, -6, 6, 12]) {
      box(1.4, H - 2, 0.8, M.cornisa, px, y0, 37.9);
      box(1.4, H - 2, 0.8, M.cornisa, px, y0, -37.9);
    }
    for (const pz of [-11, -5.5, 5.5, 11]) {
      box(0.8, H - 2, 1.4, M.cornisa, 31.9, y0, pz);
      box(0.8, H - 2, 1.4, M.cornisa, -31.9, y0, pz);
    }
  }

  // ---------- Pórtico de columnas al frente ----------
  const colX = [-10.5, -6.3, -2.1, 2.1, 6.3, 10.5];
  for (const cx of colX) {
    cyl(0.75, 0.85, 14, M.cornisa, cx, y0, 41, simple ? 8 : 14);
    if (!simple) { box(2, 0.6, 2, M.piedra, cx, y0, 41); box(2, 0.6, 2, M.cornisa, cx, y0 + 13.6, 41); }
  }
  box(24, 1.6, 6, M.cornisa, 0, y0 + 14.2, 39.5);                 // entablamento
  fronton(25, 4.5, 6, 0, y0 + 15.8, 39.5, 0);                     // frontón del pórtico
  // Puertas
  box(4, 7, 0.4, M.puerta, 0, y0, 37.7);
  box(2.6, 5, 0.4, M.puerta, -7.5, y0, 37.7);
  box(2.6, 5, 0.4, M.puerta, 7.5, y0, 37.7);
  box(2.6, 5, 0.4, M.puerta, 0, y0, -37.7);

  // Ventanas de brazos
  for (const vx of [-9, -3, 3, 9]) ventana(1.8, 5, vx, y0 + 9, -37.9, 0);
  for (const vz of [-8, -2.7, 2.7, 8]) {
    ventana(1.8, 5, 31.9, y0 + 9, vz, Math.PI / 2);
    ventana(1.8, 5, -31.9, y0 + 9, vz, -Math.PI / 2);
  }
  for (const vx of [-3, 3]) ventana(1.8, 4, vx, y0 + 9.5, 37.9, 0);

  // ---------- Campanarios en las 4 esquinas del crucero ----------
  const campanario = (x, z) => {
    const yb = y0 + H + 1;
    box(5, 9, 5, M.pared, x, yb, z);
    if (!simple) for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      ventana(1.2, 3.5, x + Math.sin(a) * 2.55, yb + 3.5, z + Math.cos(a) * 2.55, a);
    }
    box(5.8, 0.7, 5.8, M.cornisa, x, yb + 9, z);
    cyl(1.9, 2.3, 2, M.pared, x, yb + 9.7, z, 12);
    const d = add(new THREE.SphereGeometry(2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.cupula, x, yb + 11.7, z);
    d.scale.y = 1.4;
    cyl(0.25, 0.4, 2.2, M.cobre, x, yb + 14.4, z, 8);
    add(new THREE.SphereGeometry(0.4, 8, 6), M.cobre, x, yb + 16.8, z);
  };
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) campanario(sx * 16, sz * 16);

  // ---------- Tambor ----------
  const R = 14.5;
  const yt = y0 + H + 1;
  cyl(R + 1.5, R + 1.5, 3, M.pared, 0, yt, 0, 32);                 // base del tambor
  cyl(R + 2, R + 2, 0.8, M.cornisa, 0, yt + 3, 0, 32);
  cyl(R, R, 14, M.pared, 0, yt + 3.8, 0, 32);                       // tambor
  const nCol = simple ? 0 : 16;
  for (let i = 0; i < nCol; i++) {
    const a = (i / nCol) * Math.PI * 2;
    // contrafuertes con columnas pareadas
    const c = cyl(0.55, 0.6, 12, M.cornisa, Math.sin(a) * (R + 0.8), yt + 4.2, Math.cos(a) * (R + 0.8), 8);
    // ventanas entre columnas
    const b = a + Math.PI / nCol;
    ventana(1.8, 6, Math.sin(b) * (R + 0.1), yt + 6.5, Math.cos(b) * (R + 0.1), b);
  }
  cyl(R + 1.4, R + 1.4, 1.2, M.cornisa, 0, yt + 16.4, 0, 32);      // cornisa del tambor
  cyl(R + 0.6, R + 0.6, 2, M.pared, 0, yt + 17.6, 0, 32);           // ático
  if (!simple) for (let i = 0; i < 16; i++) {                        // ojos de buey del ático
    const a = (i / 16) * Math.PI * 2 + Math.PI / 16;
    const o = add(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 10), M.vidrio,
      Math.sin(a) * (R + 0.65), yt + 18.6, Math.cos(a) * (R + 0.65));
    o.rotation.order = 'YXZ'; o.rotation.set(Math.PI / 2, a, 0);
  }

  // ---------- Cúpula (perfil de revolución peraltado) ----------
  const yd = yt + 19.6;
  const perfil = [];
  const HD = 25;
  for (let i = 0; i <= 24; i++) {
    const t = (i / 24) * (Math.PI / 2);
    perfil.push(new THREE.Vector2(Math.max(Math.cos(t) * R, 2.6), Math.sin(t) * HD));
  }
  add(new THREE.LatheGeometry(perfil, 40), M.cupula, 0, yd, 0);
  // Nervios
  const nNerv = simple ? 8 : 16;
  for (let i = 0; i < nNerv; i++) {
    const a = (i / nNerv) * Math.PI * 2;
    const pts = perfil.map(p => new THREE.Vector3(Math.sin(a) * (p.x + 0.12), p.y, Math.cos(a) * (p.x + 0.12)));
    const tubo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.25, 5, false);
    add(tubo, M.nervio, 0, yd, 0);
  }
  // Lucarnas (ventanitas) en 2 anillos
  if (!simple) for (const [t, n] of [[0.28, 16], [0.62, 16]]) {
    const ang = t * Math.PI / 2;
    const r = Math.cos(ang) * R, y = Math.sin(ang) * HD;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.PI / n;
      const l = add(new THREE.SphereGeometry(0.55, 8, 6), M.cornisa, Math.sin(a) * r, yd + y, Math.cos(a) * r);
      l.scale.set(1, 1.2, 0.6); l.rotation.y = a;
    }
  }

  // ---------- Linterna ----------
  const yl = yd + HD - 0.4;
  cyl(3.4, 3.4, 0.8, M.cornisa, 0, yl, 0, 16);
  cyl(2.6, 2.6, 5, M.pared, 0, yl + 0.8, 0, 16);
  if (!simple) for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cyl(0.25, 0.25, 4.6, M.cornisa, Math.sin(a) * 2.8, yl + 1, Math.cos(a) * 2.8, 6);
    const b = a + Math.PI / 8;
    box(0.9, 2.6, 0.2, M.vidrio, Math.sin(b) * 2.62, yl + 2, Math.cos(b) * 2.62).rotation.y = b;
  }
  cyl(3, 3, 0.6, M.cornisa, 0, yl + 5.8, 0, 16);
  const cl = add(new THREE.SphereGeometry(2.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.cupula, 0, yl + 6.4, 0);
  cl.scale.y = 1.3;
  cyl(0.6, 1.2, 2.5, M.cornisa, 0, yl + 9.4, 0, 10);                 // pedestal

  // ---------- Virgen de cobre (7,5 m) ----------
  const yv = yl + 11.9;
  const virgen = new THREE.Group();
  const manto = new THREE.Mesh(new THREE.LatheGeometry([
    new THREE.Vector2(0, 0), new THREE.Vector2(1.3, 0), new THREE.Vector2(1.1, 1.5),
    new THREE.Vector2(0.75, 4), new THREE.Vector2(0.55, 5.6), new THREE.Vector2(0.45, 6.1), new THREE.Vector2(0, 6.2),
  ], 14), M.cobre);
  virgen.add(manto);
  const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), M.cobre);
  cabeza.position.y = 6.6; virgen.add(cabeza);
  const corona = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.32, 0.45, 10), M.cobre);
  corona.position.y = 7.2; virgen.add(corona);
  for (const s of [-1, 1]) {                                           // manos juntas al frente
    const brazo = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.4, 6), M.cobre);
    brazo.position.set(s * 0.32, 4.6, 0.5); brazo.rotation.set(-1.1, 0, s * -0.35);
    virgen.add(brazo);
  }
  virgen.position.set(0, yv, 0);
  virgen.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.add(virgen);

  if (opts.fusionar !== false) {
    g.updateMatrixWorld(true);
    const porMat = new Map();
    g.traverse(o => { if (!o.isMesh) return;
      let geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      for (const n of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(n)) geo.deleteAttribute(n);
      geo.applyMatrix4(o.matrixWorld);
      if (!porMat.has(o.material)) porMat.set(o.material, []);
      porMat.get(o.material).push(geo); });
    while (g.children.length) g.remove(g.children[0]);
    for (const [mat, list] of porMat) {
      const m = new THREE.Mesh(THREE.BufferGeometryUtils.mergeBufferGeometries(list), mat);
      m.castShadow = m.receiveShadow = true; g.add(m); }
  }

  // Datos útiles para el juego (colisión simplificada y puntos de referencia)
  g.userData = {
    nombre: 'Basílica de Nuestra Señora de Itatí',
    alturaTotal: yv + 7.5,
    colisiones: [            // cajas AABB locales {x,z,w,d,h} para el sistema de colisiones del juego
      { x: 0, z: 0, w: 26, d: 81, h: H },
      { x: 0, z: 0, w: 63, d: 24, h: H },
      { x: 0, z: 0, w: 40, d: 40, h: H },
    ],
  };
  return g;
}

if (typeof window !== 'undefined') window.crearBasilicaItati = crearBasilicaItati;
