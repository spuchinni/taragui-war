/* ---------- Campaña de la Segunda Guerra Mundial (1942–1944) ----------
   El Alamein, Prokhorovka, Villers-Bocage y Bastogne. Cada misión trae su objetivo (obj) como se peleó de verdad (ver objetivos.js). */
CAMPAIGN.push({era:3,title:'Segunda Guerra Mundial',missions:[
  {id:'alamein',date:'2 de noviembre de 1942',title:'El Alamein: operación Supercharge',map:'alamein',ally:'uk',foe:'de',plu:['crusader3','matilda2'],lu:{0:['crusader3','crusader3','matilda2'],1:['pz3j','pz4f2','pz3j']},nAlly:4,nFoe:4,guns:[1,3],squads:[3,3],tickets:[450,400],wx:'dia',
    obj:{type:'take',zones:['C'],hold:90,time:1080},
    ctx:'Después de diez días de combate, Montgomery lanza la última embestida: la 9.ª Brigada Blindada carga de madrugada contra la pantalla de antitanques de Tel el Aqqaqir. Si la rompen, el Afrika Korps se retira de Egipto.',
    goal:'Tomá Tel el Aqqaqir (C) y sostenelo un minuto y medio. Los Pak y los Panzer IV "Special" te esperan detrás de la loma.',
    tip:'En el desierto se ve todo a mucha distancia: aprovechá las lomas para tapar el casco y asomá solo la torre. El 6 libras del Crusader perfora al Panzer III de frente.'},
  {id:'prokhorovka',date:'12 de julio de 1943',title:'Prokhorovka',map:'prokhorovka',ally:'ru',foe:'de',plu:['t34','t70'],lu:{0:['t34','t34','t70','kv1'],1:['tiger1','pz4h','pz3j']},nAlly:5,nFoe:4,guns:[1,2],squads:[4,3],tickets:[500,400],wx:'dia',
    obj:{type:'destroy',keys:['tiger1'],time:1080},
    ctx:'Kursk. El 5.º Ejército de Tanques de la Guardia contraataca al II Cuerpo Panzer SS. Los tanquistas soviéticos saben que el Tiger los destruye a un kilómetro: la orden es cargar a toda velocidad y pelear de cerca.',
    goal:'Destruí a los Tiger. Acortá la distancia rápido, buscá los costados y usá las zanjas antitanque y los barrancos para acercarte sin que te vean.',
    tip:'El 76 mm del T-34 no perfora al Tiger de frente: a menos de 300 m por el costado, sí. El T-34 es rápido y sus orugas anchas no se encajan.'},
  {id:'villersbocage',date:'13 de junio de 1944',title:'Villers-Bocage',map:'normandia',ally:'uk',foe:'de',plu:['cromwell','firefly'],lu:{0:['cromwell','cromwell','firefly'],1:['tiger1','pz4h','stug3g']},nAlly:4,nFoe:3,guns:[0,2],squads:[3,3],tickets:[450,400],wx:'dia',
    obj:{type:'take',zones:['B'],hold:90,time:1080},
    ctx:'Una semana después del Día D, la 7.ª División Blindada (las "Ratas del Desierto") encuentra un hueco en el frente y entra a Villers-Bocage. En la Cota 213, un puñado de Tiger del batallón 101 SS los está mirando.',
    goal:'Tomá Villers-Bocage (B) y sostenelo un minuto y medio. En el bocage no se ve nada: avanzá de seto en seto y dejá que el Firefly se encargue de los Tiger.',
    tip:'Los setos tapan la vista y los bordos de tierra frenan: buscá las tranqueras. El Cromwell es el más rápido: flanqueá en vez de pelear de frente.'},
  {id:'bastogne',date:'26 de diciembre de 1944',title:'Bastogne',map:'ardenas',ally:'us',foe:'de',plu:['m4a1','m4a3e8','m3stuart'],lu:{0:['m4a1','m4a3e8','m10'],1:['panther','pz4h','stug3g']},nAlly:4,nFoe:4,guns:[1,2],squads:[4,4],tickets:[450,450],wx:'nieve',
    obj:{type:'hold',zones:['B'],time:540},
    ctx:'La 101.ª Aerotransportada lleva una semana rodeada en Bastogne. "Nuts!", le contestó el general McAuliffe al pedido de rendición. Los Panther atacan por los caminos nevados mientras los Sherman de Patton se abren paso desde el sur.',
    goal:'Bastogne es tuyo: sostenelo 9 minutos. Si los alemanes recuperan el pueblo, la misión fracasa.',
    tip:'El Panther es casi imposible de perforar de frente: esperalo en los bosques y tirale al costado. El M10 tiene la torre abierta: cuidado con la artillería.'}
]});
