const _el=Object.create(null);
const $=id=>{let e=_el[id]; if(!e||!e.isConnected){e=document.getElementById(id); if(e)_el[id]=e;} return e;};
// Escriben en el DOM solo si el valor cambió (el HUD se actualiza en cada frame).
const txt=(id,v)=>{const e=$(id); if(!e) return; v=String(v); if(e.textContent!==v) e.textContent=v;};
const col=(id,c)=>{const e=$(id); if(e&&e._c!==c){e._c=c; e.style.color=c;}};
const setCls=(id,c)=>{const e=$(id); if(e&&e._cls!==c){e._cls=c; e.setAttribute('class',c);}};
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const wrap=a=>((a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
const stepAng=(a,b,max)=>{const d=wrap(b-a);return a+clamp(d,-max,max);};
const shuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
// Online: estado de la red (anfitrión o invitado). Ver la sección "Online" más abajo.
const net={mode:'coop',swap:0,on:false,host:false,guest:false,peer:null,conns:[],hostConn:null,name:'',code:'',seq:0,sendT:0,seed:0,startMsg:null,inBattle:false};

