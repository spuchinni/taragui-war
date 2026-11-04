# Modelos

- `gente.json`: civiles detallados para `js/eras/gente3d.js`. Salen de los paquetes **Ultimate Modular Men** y **Ultimate
  Modular Women** de Quaternius (licencia CC0 1.0, dominio público: https://quaternius.com), convertidos con
  `herramientas/gente/convertir.py` desde los archivos .g3dj (libGDX). Personajes incluidos: hombres Adventurer, Beach,
  Casual, Casual2, Farmer, Suit, Swat, Worker; mujeres Adventurer, Casual, Formal, Suit, Worker, Soldier.
  Para regenerar: `WANT=m_Suit,f_Formal,... python3 herramientas/gente/convertir.py modelos/gente.json <archivos .json del paquete>`.
