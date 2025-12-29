var WebSocket = require('websocket').w3cwebsocket;
var fs = require('fs');
var websocket;

function startws() {
	console.log('hello');
	websocket = new WebSocket("wss://api.tradeville.ro", ["apitv"]);
	websocket.onopen = ()=>sendJS({cmd:'login',prm:{coduser:'mdumitru1971', parola:'Login12#$%', demo:false}});
	websocket.onerror = (err)=>console.log('eroare la conectare');
	websocket.onmessage = mesajAPI;
}
startws();

function mesajAPI(evt) {
	var ce;
	try {ce=JSON.parse(evt.data)} catch (e) {}
	if(!ce) return;
	afiseaza(ce);
}
function sendJS(oo){
	if(websocket.readyState!=1) {afiseaza('fara conexiune la server'); return;}
	websocket.send(JSON.stringify(oo));
}

function afiseaza(ce={}){
	if(ce.prm) delete ce.prm.parola;
	if(ce.cmd=='Portfolio') {
		fs.writeFileSync('portofoliu.csv', data2tabel(ce.data));
		console.log('am creat/modificat fisierul portofoliu.csv');
		process.exit();
	}
	console.log(ce);
	if(ce.cmd=='login') {
		if(ce.OK) sendJS({cmd:'Portfolio',prm:{data:null}}); else process.exit();
	}
}

function data2tabel(dd){
	if(Array.isArray(dd)){let st='';dd.forEach(a=>st+=data2tabel(a)); return st;}
	let ss='', c1=dd[Object.keys(dd)[0]]; 
	for(let k in dd) ss+=(ss?',':'')+k;
	ss+='\r\n'; if(!Array.isArray(c1)) return c1;
	c1.forEach((r,i)=>{
		let rr='';
		for(let k in dd) rr+=(rr?',':'')+dd[k][i];
		ss+=rr+'\r\n';
	});
	return ss;
}