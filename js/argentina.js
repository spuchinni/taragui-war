/* ---------- Argentina, rango III: los Sherman de posguerra (27/11/2026, pedido de Sebastián: "agregar más variantes de tanques porque nos
   vamos a quedar cortos"; Argentina tenía un solo tanque en el rango III, el Nahuel) ----------
   Entre 1946 y 1948, durante el primer gobierno de Perón, el IAPI compró Sherman ex británicos que estaban en Bélgica. Las fuentes no coinciden
   en la cantidad: entre 360 y 450 Sherman, de los que entre 120 y 250 eran Firefly (Sherman IC y VC). Sirvieron hasta fines de los 70; en 1978
   unos 120 Firefly recibieron un cañón de 105 mm hecho en el país (el Sherman Repotenciado, que ya está en el rango V).
   Fuentes (27/11/2026): warhistoryonline.com y tankandafvnews.com ("What happened to the 450 Argentine Shermans"), defensa.com (lámina del
   Sherman Firefly: 120 Sherman IVC y VC desde 1946), diariopanorama.com y notife.com (llegaron entre 1946 y 1947), globalsecurity.org
   (Argentine Army, the modern army), Wikipedia (Sherman Firefly, Post–World War II Sherman tanks).
   Copias de los modelos y números del M4A1 y del Firefly con la escarapela argentina (las del M4A1 ya no llevan estrellas: m4a1.js).
   Va después de latinoamerica.js (usa copiaVeh de brasil.js). */
(()=>{
  if(typeof copiaVeh!=='function') return;
  copiaVeh('sh_ar','m4a1','ar','ar',{label:'M4 Sherman (Argentina)',year:1947,
    desc:'Sherman ex británicos que el IAPI compró en Bélgica entre 1946 y 1948; las fuentes no coinciden en cuántos (entre 360 y 450 contando los Firefly). Fueron la base de los regimientos de caballería blindada hasta el TAM. Modelo y números del M4A1.'});
  copiaVeh('ff_ar','firefly','ar','ar',{label:'Sherman Firefly (Argentina)',year:1947,
    desc:'Llegaron en la misma compra: entre 120 y 250 Firefly con el cañón británico de 17 libras, según la fuente. En 1978 unos 120 se convirtieron en el Sherman Repotenciado con cañón de 105 mm. Mismos números que el Firefly.'});
})();
