/* ---------- Épocas: el juego avanza en orden cronológico, de la Primera Guerra Mundial en adelante ----------
   Cada vehículo tiene su época (era) y cada mapa también. Las reglas de la partida (apoyos, infantería, tránsito)
   salen de la época del mapa que se está jugando: RULE(). */
const ERAS={
  1:{n:'Primera Guerra Mundial',y:'1916–1918',ready:1,
     desc:'Los primeros tanques de la historia: lentos, de blindaje fino y hechos para cruzar trincheras bajo fuego de ametralladoras.',
     sup:{arty:1,air:0,nuke:0},civ:0,traffic:0,mgPen:11,female:0,guns:1,
     smoke:0,                                        // los tanques de la época no tenían lanzahumos (sí extintores Pyrene)
     sides:[['uk','fr','us'],['de']],               // Entente contra los Imperios Centrales
     at:{n:'Fusil antitanque 13 mm',kind:'ke',pen:22,v:780},
     mortar:{n:'Mortero de trinchera',kind:'he',pen:10,v:80,sc:.6}},
  2:{n:'Entreguerras',y:'1919–1938',ready:0,desc:'Tanques ligeros con torre, los primeros medios y la Guerra Civil Española.'},
  3:{n:'Segunda Guerra Mundial',y:'1939–1945',ready:0,desc:'Panzer, T-34, Sherman, Tiger y el Nahuel argentino.'},
  4:{n:'Posguerra y Corea',y:'1946–1959',ready:0,desc:'Centurion, T-54, M47 y M48 Patton.'},
  5:{n:'Guerra Fría y actualidad',y:'1960–hoy',ready:1,
     desc:'Los tanques de la versión anterior del juego: TAM, Leopard, M60, T-62, Abrams y compañía, en los mapas de Corrientes y alrededores.',
     sup:{arty:1,air:1,nuke:1},civ:1,traffic:1,mgPen:16,female:1,sides:null}
};
let curEra=3;                                   // época elegida en el menú (la 2ª Guerra es la permanente)
// Épocas que se juegan solo unos días al año, como evento (pedido de Sebastián): la 1ª Guerra y Entreguerras desde el aniversario
// del comienzo de la Primera Guerra Mundial (28 de julio de 1914), la Guerra Fría desde la doctrina Truman (12 de marzo de 1947).
// La 2ª Guerra se juega siempre. Con ?evento=1 en la dirección se abren todas (para probar).
const ERA_EVENT={1:{m:7,d:28,days:30,n:'aniversario del comienzo de la Primera Guerra Mundial (28 de julio de 1914)'},
  2:{m:7,d:28,days:30,n:'aniversario del comienzo de la Primera Guerra Mundial (28 de julio de 1914)'},
  5:{m:3,d:12,days:30,n:'aniversario del comienzo de la Guerra Fría (doctrina Truman, 12 de marzo de 1947)'}};
// Ventana del evento que está abierto ahora o del próximo: [desde, hasta)
function eventWin(e,t=new Date()){ const E=ERA_EVENT[e]; if(!E) return null;
  for(const y of [t.getFullYear()-1,t.getFullYear(),t.getFullYear()+1]){ const a=new Date(y,E.m-1,E.d), b=new Date(a.getTime()+E.days*864e5); if(t<b) return [a,b]; } return null; }
function eventOn(e){ if(!ERA_EVENT[e]) return true; if(typeof location!=='undefined'&&/[?&]evento=1/.test(location.search)) return true; const w=eventWin(e), t=new Date(); return !!w&&t>=w[0]&&t<w[1]; }
const fmtDia=d=>`${d.getDate()}/${d.getMonth()+1}`;
function eventTxt(e){ const w=eventWin(e); if(!w) return ''; const last=new Date(w[1].getTime()-864e5); return eventOn(e)?`Evento: hasta el ${fmtDia(last)}`:`Evento: del ${fmtDia(w[0])} al ${fmtDia(last)}`; }
const RULE=()=>ERAS[(typeof W!=='undefined'&&W&&W.era)||5]; // reglas de la partida en curso (según el mapa)
const eraOf=k=>(VEH[k]&&VEH[k].era)||5;
const eraReady=e=>!!(ERAS[e]&&ERAS[e].ready);
const eraPlayable=e=>eraReady(e)&&eventOn(e);   // lista y, si es un evento, dentro de su fecha
const eraList=()=>Object.keys(ERAS).map(Number);

/* Cada nación cambia de nombre, tripulantes, uniforme y casco según la época */
const NAT_ERA={
  1:{uk:{label:'Reino Unido',names:['Sgt. Atkins','Cpl. Hobbs','Lt. Ashby','Pte. Turner','Sgt. Cole'],uni:['#7b7150','#675d3d','#463f2c'],helm:'brodie'},
     fr:{label:'Francia',names:['Sgt. Moreau','Cpl. Girard','Lt. Fontaine','Sdt. Lambert','Sgt. Rousseau'],uni:['#76879a','#5d6c7e','#3a4553'],helm:'adrian'},
     de:{label:'Imperio alemán',names:['Uffz. Brandt','Gefr. Vogel','Ltn. Krüger','Musk. Hahn','Vzfw. Lang'],uni:['#6c6e5a','#585a48','#393b2f'],helm:'stahl'},
     us:{label:'Estados Unidos',names:['Sgt. Barnes','Cpl. Riley','Lt. Hayes','Pvt. Dunn','Sgt. Porter'],uni:['#6b6646','#585338','#3c3927'],helm:'brodie'}}
};
const _natBase={};
// Aplica la época a las naciones (nombre, tripulantes y colores del uniforme). Se llama al cambiar de época y al empezar cada partida.
function applyEraNations(e){
  for(const n in NATIONS){ const N=NATIONS[n]; if(!_natBase[n]) _natBase[n]={label:N.label,names:N.names,camo:N.camo};
    const O=(NAT_ERA[e]||{})[n], B=_natBase[n];
    N.label=O&&O.label||B.label; N.names=O&&O.names||B.names; N.uni=O&&O.uni||null; N.helm=O&&O.helm||null; }
}
// Naciones que tienen vehículos en una época (sin las especiales de Corrientes vs. Resistencia)
const eraNations=e=>Object.keys(NATIONS).filter(n=>!NATIONS[n].special&&Object.keys(VEH).some(k=>VEH[k].nation===n&&eraOf(k)===e&&!VEH[k].static));
// Bando de una nación en una época con bandos históricos (0 o 1); -1 si la época no tiene bandos
const eraSide=(e,n)=>{ const S=ERAS[e]&&ERAS[e].sides; if(!S) return -1; return S[0].includes(n)?0:S[1].includes(n)?1:-1; };
let curSpan=0; // largo del tanque que se está moviendo (para cruzar trincheras)
