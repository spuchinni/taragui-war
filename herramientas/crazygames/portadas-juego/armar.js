// Portadas de CrazyGames hechas con una toma del juego (pedido de Sebastián tras el rechazo: la ilustración no mostraba el juego).
// escena.jpg = toma del juego (El Alamein al atardecer: Sherman, Tiger ardiendo, Nahuel) sacada con Playwright desde el juego,
// con la cámara y los tanques ubicados a mano. portada.html = escena + logo TARAWAR / STEEL FRONT en Saira Condensed.
// Uso (desde esta carpeta, con Playwright instalado):  node armar.js  → portada-<ancho>x<alto>.jpg
const {chromium}=require('playwright'), path=require('path');
const SIZES=[[1920,1080,{}],[800,470,{big:'98px',small:'36px',tag:'18px',top:'4%'}],[800,800,{big:'150px',small:'54px',tag:'26px',top:'6%',pos:'54% 50%'}],
  [800,1200,{big:'170px',small:'60px',tag:'30px',top:'7%',pos:'52% 50%',bot:'5%'}]];
(async()=>{ const b=await chromium.launch();
  for(const [w,h,v] of SIZES){ const p=await b.newPage({viewport:{width:w,height:h}});
    await p.goto('file://'+path.join(__dirname,'portada.html')); await p.evaluate(v=>{ for(const k in v) document.documentElement.style.setProperty('--'+k,v[k]); },v);
    await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(300);
    await p.screenshot({path:path.join(__dirname,`portada-${w}x${h}.jpg`),type:'jpeg',quality:90}); await p.close(); console.log(w,h); }
  await b.close(); })();
