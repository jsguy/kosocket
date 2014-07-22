var app = require('express')(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	kosocket = require('./kosocket')(io);

app.get('/', function(req, res){
	res.sendfile('koio.htm');
});

app.get('/jquery-1.11.1.js', function(req, res){
	res.sendfile('jquery-1.11.1.js');
});

app.get('/knockout.js', function(req, res){
	res.sendfile('knockout.js');
});

//	Pass in an object to create a model
//	get back model with getters and setters
//	This is now shared amongst anyone connected.
var model = kosocket({
	name: "John Smith",
	email: "john@smith.com"
});

model.email.observe(function(val){
	//	Do stuff when email is set - as an example, here we validate
	//	This could obviously be automatically injected via the model.
	//	Should use node-validator or similar, if we do... 
	//	A bit monolithic though - better to add support for my validation
	//	stuff from baseproject
	var validateEmail = function(email) { 
	    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(email);
	};

	return validateEmail(val);
});

model.observe(function(key, value){
	console.log('====> model set', key, value);
});



http.listen(3100, function(){
	console.log('listening on *:3100');
});