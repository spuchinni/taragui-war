/* ---------- Campaña de Entreguerras: la Guerra Civil Española (1936–1937) ----------
   Los T-26 y BT-5 soviéticos de la República contra los Panzer I de la Legión Cóndor. */
CAMPAIGN.push({era:2,title:'Entreguerras',missions:[
  {id:'sesena',date:'29 de octubre de 1936',title:'Seseña',map:'sesena',ally:'ru',foe:'de',plu:['t26'],lu:{0:['t26'],1:['pz1a']},nAlly:3,nFoe:2,guns:[0,1],squads:[2,4],tickets:[400,300],wx:'dia',
    ctx:'Las tropas de Franco avanzan sobre Madrid. La República recibe los primeros tanques soviéticos: T-26 con tripulaciones voluntarias al mando del capitán Paul Arman. Atacan sin apoyo de infantería y entran solos al pueblo de Seseña.',
    goal:'Entrá a Seseña con tus T-26, limpiá el olivar y la casa de labor. Los Panzer I solo tienen ametralladoras: tu 45 mm los perfora de lejos. Cuidado con el cañón antitanque.',
    tip:'El T-26 tiene torre de 360° y un cañón excelente para su época. Su blindaje de 15 mm no aguanta un antitanque: no te quedes quieto a la vista.'},
  {id:'jarama',date:'12 de febrero de 1937',title:'Jarama: el Pingarrón',map:'jarama',ally:'ru',foe:'de',plu:['t26','bt5'],lu:{0:['t26','t26','bt5'],1:['pz1a','pz1a','pz2a']},nAlly:4,nFoe:4,guns:[1,2],squads:[3,4],tickets:[400,400],wx:'niebla',
    ctx:'Los nacionales cruzan el río Jarama para cortar la carretera de Madrid a Valencia. Las Brigadas Internacionales los frenan en las lomas y los tanques de los dos bandos pelean por el cerro del Pingarrón.',
    goal:'Tomá los olivares, el cerro del Pingarrón y San Martín de la Vega. Desde el cerro se ve todo: quien lo tiene, manda.',
    tip:'Usá las lomas: asomá solo la torre para tirar y bajá a recargar. Las trincheras de esta guerra son angostas: los tanques las cruzan sin problema.'},
  {id:'jaramade',date:'12 de febrero de 1937',title:'Jarama: el lado nacional',map:'jarama',ally:'de',foe:'ru',plu:['pz1a','pz2a'],lu:{0:['pz1a','pz1a','pz2a'],1:['t26','t26','bt5']},nAlly:3,nFoe:4,guns:[3,0],squads:[4,3],tickets:[400,400],wx:'niebla',
    ctx:'La misma batalla, del otro lado. Los Panzer I de la Legión Cóndor y los tanquistas españoles saben que sus ametralladoras no perforan a los T-26: dependen de los cañones antitanque de 37 mm y de atacar por los costados.',
    goal:'Sostené las tres posiciones con tus Panzer. Llevá a los T-26 hacia tus cañones antitanque y pegales en los costados y en la parte de atrás.',
    tip:'La munición perforante de la MG 13 apenas pasa los 15 mm del T-26 de muy cerca y por el costado. Mejor: marcalos para tus Pak 36 y la artillería.'},
  {id:'ebro',date:'13 de octubre de 1937',title:'Fuentes de Ebro',map:'ebro',ally:'ru',foe:'de',plu:['bt5'],lu:{0:['bt5','bt5'],1:['pz1a']},nAlly:4,nFoe:1,guns:[0,4],squads:[3,4],tickets:[400,300],wx:'dia',
    ctx:'Ofensiva de Aragón. El Regimiento Internacional de Tanques ataca con 48 BT-5 recién llegados, con la infantería subida encima, a toda velocidad. Nadie les avisó de las acequias de riego ni de los antitanques junto a la azucarera.',
    goal:'Cruzá los campos de riego, tomá las choperas, la azucarera y el pueblo. Las acequias te frenan: buscá los pasos y no te encajes frente a los cañones.',
    tip:'El BT-5 es el tanque más rápido del juego: usá la velocidad para flanquear. Su blindaje de 13 mm no aguanta nada.'}
]});
