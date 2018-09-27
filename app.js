var http = require('http');
var fs = require('fs');
var app = require('express')();


var clients = [];
var spawnPosition = [[0,0,0],[20,0,10],[-20,0,10],[20,0,-10],[-20,0,-10]];
var server = http.Server(app);
var index =0;

app.get('/',function(req,res){
    fs.readFile('./index.html','utf-8',function(err,content){
        res.writeHead(200,{ "content-type":"text/html" });
        res.end(content);
    });
});
var io = require('socket.io').listen(server);

io.on('connection',function(socket){
	var currentPlayer ={};
	
	socket.on('new player connect',function(){
		for(var i =0; i<clients.length;i++) {
			var playerAlreadyConnected = {
				name:clients[i].name,
				modelKey:clients[i].modelKey,
				position:spawnPosition[i%5],
				rotation:clients[i].rotation,
				health:clients[i].health
				
			};
			console.log(playerAlreadyConnected.name);
			socket.emit('player already connected', playerAlreadyConnected);
			
		}
	});
	socket.on('new player play',function(data){
		currentPlayer = data;
		console.log(data.name);
		socket.emit('play',currentPlayer);
		clients.push(currentPlayer);
		socket.broadcast.emit('new player joined',currentPlayer);
		
	});
	socket.on('update transform',function(data){
		socket.broadcast.emit('other player moved',data);
	});
	socket.on('disconnect', function() {
		console.log(' player disconnect '+currentPlayer.name);
		socket.broadcast.emit('other player disconnected', currentPlayer);
		for(var i=0; i<clients.length; i++) {
			if(clients[i].name === currentPlayer.name) {
				clients.splice(i,1);
			}
		}
	});
});


server.listen(process.env.PORT ||3000);