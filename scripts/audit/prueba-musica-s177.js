/* PACE · scripts/audit/prueba-musica-s177.js (sesión 177)
   ========================================================
   BANCO DE ESCUCHA A PELO. Sirve una pagina con las dos piezas y nada mas.

   POR QUE EXISTE: el usuario reporto tres veces que no oia la musica, y del
   lado del servidor todo medía bien -- elemento reproduciendo, senal a la
   salida en -36,78 dBFS, drone excluido, sintetizador de ruido sin disparar.
   Cuando la medida y el oido no coinciden, lo que hay que hacer es QUITAR
   VARIABLES, no medir la misma cosa otra vez.

   Esta pagina elimina, de una tacada: el service worker (va en OTRO PUERTO, o
   sea otro origen, donde no hay ninguno registrado), el estado de la app, los
   ajustes, la sesion de Respira, la voz y el drone. Si aqui se oye, el fallo
   esta en el camino de la app. Si aqui NO se oye, esta en la salida de audio
   del sistema y ninguna medida del navegador lo iba a decir.

   Y LLEVA MEDIDOR: un `AnalyserNode` pinta el nivel real en dBFS. Asi «no se
   oye» deja de ser una sola frase y se parte en dos -- «no sale senal» o «sale
   senal y no llega a mis altavoces»-- que son problemas distintos.

   Uso: node scripts/audit/prueba-musica-s177.js [puerto]   (por defecto 8766)
*/
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const ROOT = path.resolve(__dirname, '..', '..');
const MUS = path.join(ROOT, 'app', 'breathe', 'musica');
const PUERTO = parseInt(process.argv[2] || '8766', 10);

/* Las mismas ganancias que la app, para que la prueba valga de algo. Si estas
   cifras y las de `Sound.musica.jsx` se separan, la pagina deja de probar el
   producto y prueba otra cosa. */
const PIEZAS = [
  { f: 'equilibrio.mp3', n: 'Equilibrio — el lavado grave', g: 0.45, nota: 'cuerpo -29,04 dBFS · centroide 150 Hz · tonal' },
  { f: 'energia.mp3', n: 'Energia — handpan con notas sueltas', g: 0.09, nota: 'cuerpo -15,37 dBFS · eventos cada 6-8 s' },
];

const PAGINA = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>PACE · prueba de musica</title>
<style>
 body{margin:0;padding:32px;background:#F4F1EA;color:#2B2A26;font:15px/1.6 system-ui,sans-serif}
 h1{font-size:20px;font-weight:500;margin:0 0 4px}
 p.i{color:#7A7568;max-width:64ch;margin:0 0 22px}
 .p{border-top:1px solid #DAD3C4;padding:18px 0}
 h2{font-size:16px;margin:0 0 2px}
 .n{color:#7A7568;font-size:13px;margin:0 0 12px}
 button{font:inherit;padding:9px 18px;border:1px solid #2B2A26;background:#2B2A26;color:#F4F1EA;border-radius:999px;cursor:pointer;margin-right:8px}
 button.s{background:transparent;color:#2B2A26}
 .m{margin-top:14px;display:flex;align-items:center;gap:12px}
 .bar{flex:1;height:18px;background:#E3DCCC;border-radius:4px;overflow:hidden}
 .fill{height:100%;width:0;background:#4F6B3E;transition:width 80ms}
 code{background:#E3DCCC;padding:1px 6px;border-radius:4px;font-size:13px}
 label{font-size:13px;color:#7A7568}
</style></head><body>
<h1>Prueba de musica · sin la app</h1>
<p class="i">Otro puerto, o sea <b>otro origen</b>: aqui no hay service worker, ni estado, ni ajustes,
ni sesion de Respira, ni voz, ni drone. Solo el archivo y su ganancia.
<b>Sube el volumen del sistema</b> y dale a reproducir. La barra verde es el nivel REAL medido a la
salida: si se mueve, hay senal saliendo del navegador.</p>
${PIEZAS.map((p, i) => `
<div class="p">
  <h2>${p.n}</h2>
  <p class="n">${p.f} · ganancia de la app <b>${p.g}</b> · ${p.nota}</p>
  <button onclick="tocar(${i})">Reproducir</button>
  <button class="s" onclick="parar(${i})">Parar</button>
  <button class="s" onclick="tocar(${i},1)">Reproducir a volumen MAXIMO (1.0)</button>
  <div class="m">
    <label>ganancia <input type="range" id="g${i}" min="0" max="1" step="0.01" value="${p.g}" oninput="ajustar(${i})"> <span id="gv${i}">${p.g}</span></label>
  </div>
  <div class="m"><div class="bar"><div class="fill" id="b${i}"></div></div><code id="d${i}">-inf dBFS</code></div>
</div>`).join('')}
<script>
var A=[],AN=[],CT=null;
var PZ=${JSON.stringify(PIEZAS)};
function ctx(){ if(!CT) CT=new (window.AudioContext||window.webkitAudioContext)(); if(CT.state!=='running') CT.resume(); return CT; }
function tocar(i,max){
  if(!A[i]){
    A[i]=new Audio(PZ[i].f);
    A[i].loop=true;
    var c=ctx(), s=c.createMediaElementSource(A[i]), an=c.createAnalyser();
    an.fftSize=2048; s.connect(an); an.connect(c.destination); AN[i]=an;
  }
  A[i].volume = max?1:parseFloat(document.getElementById('g'+i).value);
  if(max){ document.getElementById('g'+i).value=1; document.getElementById('gv'+i).textContent='1'; }
  ctx(); A[i].play();
}
function parar(i){ if(A[i]) A[i].pause(); }
function ajustar(i){
  var v=parseFloat(document.getElementById('g'+i).value);
  document.getElementById('gv'+i).textContent=v;
  if(A[i]) A[i].volume=v;
}
setInterval(function(){
  for(var i=0;i<PZ.length;i++){
    if(!AN[i]){continue;}
    var b=new Float32Array(AN[i].fftSize); AN[i].getFloatTimeDomainData(b);
    var s=0; for(var k=0;k<b.length;k++) s+=b[k]*b[k];
    var db=20*Math.log10(Math.sqrt(s/b.length)+1e-9);
    document.getElementById('d'+i).textContent = (db<-90?'-inf':db.toFixed(1))+' dBFS'+(A[i]&&!A[i].paused?' · t='+A[i].currentTime.toFixed(0)+'s':'');
    var pc=Math.max(0,Math.min(100,(db+70)/70*100));
    document.getElementById('b'+i).style.width=pc+'%';
  }
},120);
<\/script></body></html>`;

const srv = http.createServer((q, r) => {
  const n = decodeURIComponent(q.url.split('?')[0].replace(/^\//, ''));
  if (n === '' || n === 'index.html') {
    r.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return r.end(PAGINA);
  }
  const f = path.join(MUS, n);
  /* GUARD: sin esto, un nombre con `..` serviria cualquier archivo del disco. */
  if (!f.startsWith(MUS) || !fs.existsSync(f)) { r.writeHead(404); return r.end('no'); }
  r.writeHead(200, { 'Content-Type': 'audio/mpeg' });
  r.end(fs.readFileSync(f));
});

if (!fs.existsSync(MUS)) { console.error('GUARD: no existe ' + MUS); process.exit(2); }
const hay = fs.readdirSync(MUS).filter(f => /\.mp3$/i.test(f));
if (!hay.length) { console.error('GUARD: no hay ningun mp3 en ' + MUS); process.exit(2); }
srv.listen(PUERTO, () => {
  console.log('prueba de musica en  http://localhost:' + PUERTO + '/');
  console.log('piezas servidas: ' + hay.join(', '));
});
