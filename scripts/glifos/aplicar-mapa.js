/* s170 · Convierte el mapa que rellena el usuario en una carpeta lista para la
   ingesta. NO adivina nada: valida cada nombre contra las identidades que la
   app pide de verdad y aborta si alguno no existe o esta repetido. */
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT='C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const SP=process.argv[2];
/* CARPETA VACIA: el «identidades sin dibujo» de la ingesta es relativo a SU
   carpeta de origen. Apuntandolo a una con arte, las piezas que ya estan
   ingestadas salen del listado y el validador las RECHAZA — justo al reingestar,
   que es cuando hay que volver a nombrarlas todas. Con la carpeta vacia el
   listado es el censo completo y valida contra las 61. */
const vacia=path.join(SP,'_vacia2');
fs.rmSync(vacia,{recursive:true,force:true}); fs.mkdirSync(vacia,{recursive:true});
const seco=cp.execSync('node scripts/ingest-glifos-ejercicio.js --seco --origen "'+vacia+'"',{cwd:ROOT,encoding:'utf8'});
const validas=new Set();
const bloque=(seco.split('identidades sin dibujo:')[1]||'').split('\n').slice(1);
bloque.forEach(l=>{const t=l.trim(); if(t && !/^--seco/.test(t)) validas.add(t);});
const mapaTxt=fs.readFileSync(path.join(SP,'mapa-estira.txt'),'utf8');
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const dest=path.join(SP,'estira-nombrados');
fs.rmSync(dest,{recursive:true,force:true}); fs.mkdirSync(dest,{recursive:true});
const vistos=new Map(); const errores=[]; let n=0;
for(const linea of mapaTxt.split('\n')){
  const m=linea.match(/^\s*(\d{2})\s*=\s*([^#]+?)\s*(#.*)?$/);
  if(!m) continue;
  const num=m[1], nombre=m[2].trim();
  if(!nombre || nombre==='???') continue;
  if(!validas.has(nombre)){ errores.push(num+': «'+nombre+'» NO es una identidad que la app pida'); continue; }
  if(vistos.has(nombre)){ errores.push(num+': «'+nombre+'» ya lo reclamo el '+vistos.get(nombre)); continue; }
  const src=path.join(SP,'estira',num+'.png');
  if(!fs.existsSync(src)){ errores.push(num+': no existe esa pieza'); continue; }
  vistos.set(nombre,num);
  fs.copyFileSync(src,path.join(dest,slug(nombre)+'.png')); n++;
}
console.log('\n  piezas nombradas: '+n);
if(errores.length){ console.error('\n  PROBLEMAS ('+errores.length+'):\n    '+errores.join('\n    ')+'\n'); process.exit(1); }
console.log('  carpeta lista: '+dest);
console.log('\n  siguiente:  node scripts/ingest-glifos-ejercicio.js --origen "'+dest+'"\n');
